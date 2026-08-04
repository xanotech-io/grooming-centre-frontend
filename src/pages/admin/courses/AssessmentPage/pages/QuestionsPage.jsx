import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import {
  Box,
  ButtonGroup,
  Checkbox,
  Select as ChakraSelect,
  Input as ChakraInput,
  Flex,
  Grid,
  Switch,
  Stack,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BsCheckCircle } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { useHistory, useParams } from "react-router";
import { Route } from "react-router-dom";
import {
  Button,
  Heading,
  Image,
  Input,
  Link,
  RichText,
  RichTextToView,
  Spinner,
  Text,
  Upload,
  WorkflowSubmitModal,
} from "../../../../../components";
import {
  useFetch,
  useGoBack,
  useIsSuperAdmin,
  useQueryParams,
  useRichText,
  useUpload,
} from "../../../../../hooks";
import { PageLoaderLayout } from "../../../../../layouts";
import {
  adminCreateAssessment,
  adminCreateAssessmentQuestion,
  adminCreateExamination,
  adminCreateExaminationQuestion,
  adminCreateStandaloneExamination,
  adminCreateStandaloneExaminationQuestion,
  adminDeleteAssessmentQuestion,
  adminDeleteExaminationQuestion,
  adminDeleteStandaloneExaminationQuestion,
  adminEditAssessment,
  adminEditAssessmentQuestion,
  adminEditExamination,
  adminEditExaminationQuestion,
  adminEditStandaloneExamination,
  adminEditStandaloneExaminationQuestion,
  adminGetAssessmentMarkingTemplateId,
  adminGetExaminationById,
  adminGetMarkingTemplateById,
  adminGetStandaloneExamTemplateId,
  auditTrailV2PostLog,
  createExamQuestionBankItem,
  getExamQuestionBankItem,
  getExaminationById as getExamPaperConfig,
  listExamQuestionBank,
  updateExaminationById as updateExamPaperConfig,
} from "../../../../../services";
import { buildBatchUploadLink } from "../../../examQuestionImport/questionRowUtils";
import SelectBankQuestionsModal from "../../../examQuestionBank/SelectBankQuestionsModal";
import {
  appendFormData,
  capitalizeFirstLetter,
  capitalizeWords,
  clearNeedsApprovalSubmission,
  isAutoAddToBank,
  markNeedsApprovalSubmission,
  needsApprovalSubmission,
  setAutoAddToBank,
} from "../../../../../utils";
import useAssessmentPreview from "../../../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import useAssessmentStore from "../../../../../store/assessmentStore";

// Question Bank type mapping — the bank has no "Matching" equivalent.
const FORM_TYPE_TO_BANK_TYPE = {
  MCQ: "mcq",
  TrueFalse: "true_false",
  FillBlank: "fill_blank",
  ShortAnswer: "short_answer",
  Essay: "essay",
};

const BANK_TYPE_TO_FORM_TYPE = {
  mcq: "MCQ",
  true_false: "TrueFalse",
  fill_blank: "FillBlank",
  short_answer: "ShortAnswer",
  essay: "Essay",
};

// ── Shared bank→question builder ────────────────────────────────────────────
// Used both to queue a bank question locally (pendingCreate/pendingEdit,
// parent not saved yet) and to create it for real on an already-existing
// assessment/examination (List Of Questions' "Question Bank" add). Returns
// null when the bank question's type is locked out by `allowedQuestionTypes`.
const buildBankQueueItem = (
  bankQuestion,
  { isStandaloneExamination, isExamination, assessmentId, sectionTitle, sectionMarks, allowedQuestionTypes },
) => {
  const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType] || "Essay";
  if (allowedQuestionTypes && !allowedQuestionTypes.includes(mappedType)) return null;

  const isObjective = mappedType === "MCQ" || mappedType === "TrueFalse";
  const optionKey = isStandaloneExamination ? "option" : "name";
  const options = isObjective
    ? mappedType === "TrueFalse"
      ? ["True", "False"].map((label, idx) => ({
          [optionKey]: label,
          isAnswer: bankQuestion.correctAnswer === label,
          optionIndex: idx + 1,
        }))
      : (bankQuestion.options || []).map((o, idx) => ({
          [optionKey]: o.text,
          isAnswer: !!o.isCorrect,
          optionIndex: idx + 1,
        }))
    : [];

  const effectiveMarks = sectionMarks != null ? sectionMarks : Number(bankQuestion.marks) || 1;
  const bankDifficultyLevel = (bankQuestion.difficultyLevel || "Medium").toLowerCase();

  const typeSpecificFields = isObjective
    ? { options: JSON.stringify(options) }
    : mappedType === "FillBlank"
      ? { correctAnswer: bankQuestion.correctAnswer || "", questionType: "FillBlank" }
      : mappedType === "ShortAnswer"
        ? { modelAnswer: bankQuestion.correctAnswer || "", questionType: "ShortAnswer" }
        : { rubricDescription: bankQuestion.explanation || "", questionType: "Essay" };

  let data;
  if (isStandaloneExamination) {
    data = {
      standAloneExaminationId: isExamination,
      question: bankQuestion.question,
      ...(sectionTitle && { section: sectionTitle }),
      markingType: "automatic",
      ...(isObjective && { options }),
    };
  } else if (isExamination) {
    data = {
      examinationId: isExamination,
      question: bankQuestion.question,
      marks: effectiveMarks,
      markingType: "automatic",
      ...(sectionTitle && { section: sectionTitle }),
      difficultyLevel: bankDifficultyLevel,
      questionType: mappedType,
      ...typeSpecificFields,
    };
  } else {
    data = {
      assessmentId,
      question: bankQuestion.question,
      markingType: "automatic",
      questionType: mappedType,
      ...(sectionTitle && { section: sectionTitle }),
      ...(isObjective ? { options: JSON.stringify(options) } : typeSpecificFields),
    };
  }

  return {
    data,
    addToBank: false,
    bank: {
      questionPlainText: bankQuestion.question,
      questionType: mappedType,
      marks: effectiveMarks,
      difficultyLevel: bankDifficultyLevel,
      options,
      bankSourceFields: {
        correctAnswer: bankQuestion.correctAnswer,
        modelAnswer: bankQuestion.correctAnswer,
        rubricDescription: bankQuestion.explanation,
      },
    },
    // Lets a later click on this queued item (in "List Of Questions") hydrate
    // CreateQuestionPage's form back up — same fields the manual-entry
    // queuing branches in `onSubmit` capture.
    formSnapshot: {
      questionType: mappedType,
      marks: effectiveMarks,
      markingType: "automatic",
      difficultyLevel: bankDifficultyLevel,
      bloomLevel: "",
      section: sectionTitle,
      rubric: "",
      answer: isObjective ? String(options.find((o) => o.isAnswer)?.optionIndex || 1) : "",
      matchingPairs: [{ left: "", right: "" }],
      optionValues: isObjective ? options.map((o) => o[optionKey]) : [],
      correctAnswer: bankQuestion.correctAnswer || "",
      modelAnswer: bankQuestion.correctAnswer || "",
      rubricDescription: bankQuestion.explanation || "",
      questionText: bankQuestion.question,
    },
  };
};

// Persists one bank-sourced question payload against whichever real create
// endpoint applies — used when the parent assessment/exam already exists,
// so a bank pick is saved immediately instead of queued.
const createBankQuestionForReal = (data, { isStandaloneExamination, isExamination }) => {
  const finalBody = isStandaloneExamination ? data : appendFormData(data);
  if (isStandaloneExamination) return adminCreateStandaloneExaminationQuestion(finalBody);
  if (isExamination) return adminCreateExaminationQuestion(finalBody);
  return adminCreateAssessmentQuestion(finalBody);
};

// ── Section-level locks & weightage ─────────────────────────────────────────
// A section's constraints can come from two different places:
//  - the exam's own `configuredSections` (ExamPaperConfigPage.jsx) — an exact
//    question_type/marking_type lock plus a total_marks weightage to divide
//    across the section's questions.
//  - a linked Marking Template's `sections` — a coarser "objective / essay /
//    mixed" category plus a fixed marksPerQuestion.
// Both are normalized into the same shape here so CreateQuestionPage and
// QuestionListingPage only need one lookup, keyed by section name.
const OBJECTIVE_QUESTION_TYPES = ["MCQ", "TrueFalse", "FillBlank", "Matching"];
const SUBJECTIVE_QUESTION_TYPES = ["ShortAnswer", "Essay"];

// Canonical question-type order — used to keep a multi-type section's
// allowed-list (and its "locked to X / Y" messaging) deterministic
// regardless of the order the admin checked the boxes in.
const QUESTION_TYPES_ORDER = ["MCQ", "TrueFalse", "FillBlank", "Matching", "ShortAnswer", "Essay"];

const buildSectionConfigMap = (sections, shape) => {
  const map = {};
  (Array.isArray(sections) ? sections : []).forEach((s) => {
    const name = shape === "template" ? s.name : s.section_name;
    if (!name) return;
    map[name] =
      shape === "template"
        ? {
            questionsCount: Number(s.questionCount) || null,
            questionTypeLock: s.questionType || "",
            // A template section only ever carries a single questionType —
            // no multi-select authoring surface exists for templates.
            questionTypeLocks: s.questionType ? [s.questionType] : [],
            typeCategory: s.type || "",
            markingTypeLock: s.markingType || "",
            marksPerQuestion: Number(s.marksPerQuestion) || null,
            totalMarks: null,
          }
        : {
            // `questions_count` is the canonical field name (matches
            // ExamPaperConfigPage.jsx); `question_count` is accepted too
            // for older/standalone-shaped section data.
            questionsCount: Number(s.questions_count ?? s.question_count) || null,
            questionTypeLock: s.question_type || "",
            // The Sections builder's checkbox multi-select — falls back to
            // wrapping the legacy single `question_type` lock so sections
            // authored via the older single-select UI (or
            // ExamPaperConfigPage.jsx) still resolve to the same
            // restriction.
            questionTypeLocks: Array.isArray(s.question_types) && s.question_types.length
              ? s.question_types
              : s.question_type
                ? [s.question_type]
                : [],
            typeCategory: "",
            markingTypeLock: s.marking_type || "",
            marksPerQuestion: null,
            totalMarks: s.total_marks ? Number(s.total_marks) : null,
          };
  });
  return map;
};

// null return means "no restriction" — every question type/marking type is allowed.
const getAllowedQuestionTypes = (cfg) => {
  if (!cfg) return null;
  // Checked before the legacy single-value lock — `questionTypeLocks` is
  // always populated (including with a single value) whenever either form
  // of lock is set, so this alone covers both. An empty array must mean
  // "no restriction," never "allow nothing."
  if (cfg.questionTypeLocks?.length) {
    return QUESTION_TYPES_ORDER.filter((t) => cfg.questionTypeLocks.includes(t));
  }
  if (cfg.questionTypeLock) return [cfg.questionTypeLock];
  if (cfg.typeCategory === "objective") return OBJECTIVE_QUESTION_TYPES;
  if (cfg.typeCategory === "essay") return SUBJECTIVE_QUESTION_TYPES;
  return null;
};

const getAllowedMarkingTypes = (cfg) => {
  if (!cfg) return null;
  if (cfg.markingTypeLock) return [cfg.markingTypeLock];
  if (cfg.typeCategory === "objective") return ["automatic"];
  if (cfg.typeCategory === "essay") return ["manual", "hybrid"];
  return null;
};

// Weightage lives on the section, never on the question — this is what a
// question's marks resolve to when a section's total_marks (or a template's
// fixed marksPerQuestion) applies. Null means "no section-driven weightage".
const getSectionMarks = (cfg) => {
  if (!cfg) return null;
  if (cfg.totalMarks && cfg.questionsCount) return cfg.totalMarks / cfg.questionsCount;
  if (cfg.marksPerQuestion) return cfg.marksPerQuestion;
  return null;
};

// ── Exam-Type-driven per-type Quantity cap ──────────────────────────────────
// Ported from the Standalone Exam flow's identical rule (QuestionsStandalone.jsx).
// A queued item's own explicit type — every queued item here already carries
// one (formSnapshot.questionType / bank.questionType / data.questionType),
// so unlike Standalone this never needs to sniff a shape.
const queuedQuestionType = (q) =>
  q.formSnapshot?.questionType ?? q.bank?.questionType ?? q.data?.questionType ?? null;

// "Exam without sections" and hybrid's non-sectioned questions both draw
// from the same Quantity-per-type/marking-template restriction set up on
// the Overview form's Exam Type step — once the queue already has that
// many questions of a type, no more of that type can be added. Originally
// only ever populated while still pending; extended to also read the real
// exam/assessment's own persisted `questionQuantity` and already-created
// questions once it exists (via `realExamType`/`realQuestionQuantity`/
// `realQuestions`), so the cap keeps applying past the point it becomes
// real (e.g. via the batch-upload shortcut) instead of switching off. An
// exam/assessment that's sectioned, or predates this feature and has no
// examType at all, still returns fully unrestricted.
const buildTypeQuotaState = ({
  pendingSource,
  isPending,
  realExamType,
  realQuestionQuantity,
  realQuestions,
  editingQuestionId,
  selectedSectionId,
  isEditingQueued,
  queuedIndex,
}) => {
  const examType = isPending ? pendingSource?.body?.examType : realExamType;
  const isHybridExam = examType === "hybrid";
  const isUnsectionedExam = examType === "unsectioned";
  // Hybrid only applies the template restriction while on the "standalone"
  // (no section selected) side of the form — a section's own type-lock
  // (allowedQuestionTypes) governs question types once a section is
  // active, exactly like a plain sectioned exam.
  const usingTemplateTypeRestriction = isUnsectionedExam || (isHybridExam && !selectedSectionId);
  const questionQuantity = isPending ? (pendingSource?.body?.questionQuantity || {}) : (realQuestionQuantity || {});
  // A type absent from the map isn't offered by the template at all, so
  // it's disabled outright, never just quantity-capped. Falls back to "no
  // restriction" when nothing was seeded (e.g. older pending/real data from
  // before this existed), so this can't hide every type by accident.
  const templateSupportedTypes =
    usingTemplateTypeRestriction && Object.keys(questionQuantity).length > 0
      ? Object.keys(questionQuantity)
      : null;
  const queuedTypeCounts = !usingTemplateTypeRestriction
    ? {}
    : isPending
      ? (pendingSource?.questions || []).reduce((acc, q, i) => {
          // Editing this exact queued slot doesn't add a new question —
          // exclude it so its own type doesn't count against its own
          // remaining quota.
          if (isEditingQueued && i === queuedIndex) return acc;
          // A hybrid section's own questions draw from that section's
          // weightage, never the template's standalone-quantity pool.
          if (q.data?.section) return acc;
          const t = queuedQuestionType(q);
          if (t) acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {})
      : (realQuestions || []).reduce((acc, q) => {
          // Editing this exact question in place doesn't add a new one —
          // exclude it so its own type doesn't count against its own
          // remaining quota.
          if (editingQuestionId && q.id === editingQuestionId) return acc;
          if (q.section) return acc;
          if (q.questionType) acc[q.questionType] = (acc[q.questionType] || 0) + 1;
          return acc;
        }, {});
  const typeQuota = (type) => {
    const raw = questionQuantity[type];
    return raw !== undefined && raw !== null && raw !== "" ? Number(raw) : null;
  };
  // Despite the name, this covers both reasons a type can be unavailable:
  // the template doesn't support it at all, or its own Quantity has
  // already been reached.
  const typeAtCapacity = (type) => {
    if (templateSupportedTypes && !templateSupportedTypes.includes(type)) return true;
    const quota = typeQuota(type);
    return quota != null && (queuedTypeCounts[type] || 0) >= quota;
  };
  return { usingTemplateTypeRestriction, templateSupportedTypes, queuedTypeCounts, typeQuota, typeAtCapacity };
};

// "Exam without sections" and hybrid's standalone side: don't let a bulk
// bank-add push any question type past its configured Quantity — keep
// questions up to each type's remaining room and skip the rest, the same
// rule the single-question form enforces one at a time. `queuedTypeCounts`
// is the count before this batch; the running tally advances per accepted
// item so two of the same type in the same batch don't both slip through
// when only one more fits.
const filterBankQuestionsByTypeQuota = (
  bankQuestions,
  { usingTemplateTypeRestriction, templateSupportedTypes, typeQuota, queuedTypeCounts },
  getType,
) => {
  if (!usingTemplateTypeRestriction) return { kept: bankQuestions, skipped: 0 };
  const runningCounts = { ...queuedTypeCounts };
  let skipped = 0;
  const kept = bankQuestions.filter((bq) => {
    const mappedType = getType(bq);
    if (!mappedType) return true;
    const notSupported = templateSupportedTypes && !templateSupportedTypes.includes(mappedType);
    const quota = typeQuota(mappedType);
    const wouldExceed = quota != null && (runningCounts[mappedType] || 0) >= quota;
    if (notSupported || wouldExceed) {
      skipped += 1;
      return false;
    }
    runningCounts[mappedType] = (runningCounts[mappedType] || 0) + 1;
    return true;
  });
  return { kept, skipped };
};

const QuestionsPage = () => {
  const isQuestionListingPage = useQueryParams().get("question-listing");
  const { id: courseId, assessmentId, questionId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const moduleId = useQueryParams().get("moduleId");
  const isEditMode = useQueryParams().get("edit") === "true";
  const submitForApproval = useQueryParams().get("submitForApproval") === "1";
  const editSubmit = useQueryParams().get("editSubmit") === "1";
  const queuedIndexParam = useQueryParams().get("queuedIndex");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const isExistingQuestion = questionId && questionId !== "new";
  // "Next" on the details form hands off here without creating anything —
  // this page renders from `pendingCreate` instead of fetching a real record.
  const isPendingCreation = submitForApproval && !isExistingQuestion && !isEditMode;
  // "Next" on the *edit* details form hands off here the same way, except
  // the shell already exists — this page renders it normally, but the
  // actual update (from `pendingEdit`) is deferred until a question is saved.
  const isPendingEditSubmit = editSubmit && !isExistingQuestion && !isEditMode;

  const assessmentManager = useAssessmentPreview(null, assessmentId, true);

  const storeSections = useAssessmentStore((s) => s.sections);
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const handleGoBack = useGoBack();
  const { push } = useHistory();
  const toast = useToast();
  const [creatingForUpload, setCreatingForUpload] = useState(false);

  // Lifted up from CreateQuestionPage (instead of that component owning its
  // own local state) so the "Upload & Batch Import Questions" button here —
  // a sibling of CreateQuestionPage, not a descendant — knows which Section
  // tab is currently active and can target the upload at it.
  const pendingSectionId = useQueryParams().get("section");
  const [selectedSectionId, setSelectedSectionId] = useState(pendingSectionId || "");
  const queuedSource = isPendingCreation ? pendingCreate : isPendingEditSubmit ? pendingEdit : null;
  const isPending = isPendingCreation || isPendingEditSubmit;
  const examTypeForBatchUpload = isPending ? queuedSource?.body?.examType : assessmentManager.assessment?.examType;
  const isSectionedExam = examTypeForBatchUpload === "sectioned" || examTypeForBatchUpload === "hybrid";

  // Used for an already-real exam/assessment ("Add more questions") — the
  // isPendingCreation case builds its own link fresh inside
  // handleBatchUploadClick below, once the parent record exists.
  const batchUploadLink = buildBatchUploadLink({
    courseId,
    assessmentId,
    examinationId: isExamination || undefined,
    standalone: isStandaloneExamination,
    section: isSectionedExam ? selectedSectionId || undefined : undefined,
  });

  // Course Exam, course-level Exam, and plain Assessment create their real
  // record as part of the upload call itself (BatchUploadPage.jsx, via the
  // batch-import endpoint's `createTargetType` field) — no separate
  // quick-create step first, so this just navigates straight there with
  // nothing created yet; `pendingCreate` stays exactly as it is
  // (BatchUploadPage.jsx reads it directly from the store) so "Add more
  // questions" and every other pending-state guard on this page still work
  // normally if the admin backs out before uploading anything. Standalone
  // Exam isn't covered by createTargetType (the backend only supports
  // "assessment"/"examination") — kept on the old quick-create-then-
  // navigate path, though this kind is dead/unreachable code in this file
  // regardless (Standalone has its own QuestionsStandalone.jsx).
  const handleBatchUploadClick = async () => {
    if (!pendingCreate) return;
    if (pendingCreate.kind !== "StandaloneExam") {
      push(
        buildBatchUploadLink({
          courseId,
          standalone: false,
          createTarget: true,
          section: isSectionedExam ? selectedSectionId || undefined : undefined,
        }),
      );
      return;
    }

    setCreatingForUpload(true);
    try {
      const { body: finalBody } = pendingCreate;
      const { examination } = await adminCreateStandaloneExamination(finalBody);
      setAssessment(examination);
      const realParentId = examination.id;

      // This was created without going through the approval modal — flag it
      // so the question listing page (`QuestionListingPage` below) can offer
      // a one-time "Submit for Approval" action once the import is done.
      markNeedsApprovalSubmission("standalone", realParentId);

      push(
        buildBatchUploadLink({
          courseId,
          examinationId: realParentId,
          standalone: true,
          section: isSectionedExam ? selectedSectionId || undefined : undefined,
        }),
      );
    } catch (err) {
      toast({
        description: "Couldn't create the assessment before uploading — please try again",
        position: "top",
        status: "error",
      });
    } finally {
      setCreatingForUpload(false);
    }
  };

  const [templateSections, setTemplateSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  // Raw `configuredSections` entries ({section_name, questions_count, time_limit})
  // straight from the exam record — the editable source of truth for
  // Examinations/Standalone Examinations, kept separate from `templateSections`
  // (plain names) which also covers the Marking-Template-derived, read-only
  // case for plain Assessments.
  const [configuredSections, setConfiguredSections] = useState([]);
  // Normalized {sectionName: {questionsCount, questionTypeLock, markingTypeLock,
  // totalMarks, marksPerQuestion, typeCategory}} — the single source CreateQuestionPage
  // and QuestionListingPage read to enforce section locks/weightage/count caps,
  // regardless of whether the section came from the exam's own configuredSections
  // or from a linked Marking Template.
  const [sectionConfigMap, setSectionConfigMap] = useState({});

  useEffect(() => {
    if (isPendingCreation) {
      const configuredSections = pendingCreate?.paperConfigBody?.configuredSections;
      if (Array.isArray(configuredSections) && configuredSections.length > 0) {
        setTemplateSections(configuredSections.map((s) => s.section_name));
        setSectionConfigMap(buildSectionConfigMap(configuredSections, "exam"));
        return;
      }
      if (!pendingCreate?.markingTemplateId) {
        setTemplateSections([]);
        setSectionConfigMap({});
        return;
      }
      setSectionsLoading(true);
      adminGetMarkingTemplateById(pendingCreate.markingTemplateId)
        .then(({ template }) => {
          const sections = Array.isArray(template?.sections) ? template.sections : [];
          setTemplateSections(sections.map((s) => s.name));
          setSectionConfigMap(buildSectionConfigMap(sections, "template"));
        })
        .catch(() => {
          setTemplateSections([]);
          setSectionConfigMap({});
        })
        .finally(() => setSectionsLoading(false));
      return;
    }

    if (!isExamination && (!assessmentId || assessmentId === "new")) return;

    if (storeSections.length > 0) {
      setTemplateSections(storeSections.map((s) => s.name || s.section_name));
      setSectionConfigMap(buildSectionConfigMap(storeSections, "exam"));
      return;
    }

    setSectionsLoading(true);

    const fetchViaTemplate = (getTemplateId) =>
      getTemplateId()
        .then((templateId) => {
          if (!templateId) throw new Error("no-template");
          return adminGetMarkingTemplateById(templateId);
        })
        .then(({ template }) => {
          const sections = Array.isArray(template?.sections) ? template.sections : [];
          setTemplateSections(sections.map((s) => s.name));
          setSectionConfigMap(buildSectionConfigMap(sections, "template"));
        })
        .catch(() => {
          setTemplateSections([]);
          setSectionConfigMap({});
        })
        .finally(() => setSectionsLoading(false));

    // Exam-level sections configured via "Configure Paper" take priority
    // over the marking template's sections when both are present.
    const fetchViaExamPaperConfig = (examType, fallback) =>
      getExamPaperConfig(isExamination, examType)
        .then((res) => {
          const configured = res?.data?.configuredSections;
          // Kept in sync regardless of length so the Listing page always has
          // the exam's real, editable section list (even when empty).
          setConfiguredSections(Array.isArray(configured) ? configured : []);
          if (Array.isArray(configured) && configured.length > 0) {
            setTemplateSections(configured.map((s) => s.section_name));
            setSectionConfigMap(buildSectionConfigMap(configured, "exam"));
            setSectionsLoading(false);
            return;
          }
          return fallback();
        })
        .catch(() => fallback());

    if (isStandaloneExamination) {
      fetchViaExamPaperConfig("standalone_examination", () =>
        fetchViaTemplate(() => adminGetStandaloneExamTemplateId(isExamination)),
      );
    } else if (isExamination) {
      fetchViaExamPaperConfig("examination", () =>
        fetchViaTemplate(() =>
          adminGetExaminationById(isExamination).then(
            ({ examination }) =>
              examination?.templateId ?? examination?.markingTemplateId ?? null,
          ),
        ),
      );
    } else {
      // Plain Assessments can self-manage sections the same way Examinations
      // do (added directly on the assessment record via the Listing page's
      // "+ Add Section") — that takes priority over the linked Marking
      // Template's sections, same precedence as the exam-paper-config case.
      const ownSections = assessmentManager.assessment?.sections;
      if (Array.isArray(ownSections) && ownSections.length > 0) {
        setTemplateSections(ownSections.map((s) => s.section_name));
        setSectionConfigMap(buildSectionConfigMap(ownSections, "exam"));
        setSectionsLoading(false);
      } else {
        fetchViaTemplate(() => adminGetAssessmentMarkingTemplateId(assessmentId));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assessmentId,
    isExamination,
    isStandaloneExamination,
    storeSections,
    isPendingCreation,
    // Deliberately narrowed from the whole `pendingCreate` object: every
    // question queue/save/remove replaces it with a new object reference
    // (`{ ...pendingCreate, questions: ... }`), which re-triggered this
    // effect — and its marking-template GET — on every single local edit.
    // Only these two derived values actually change what this effect does.
    pendingCreate?.paperConfigBody?.configuredSections,
    pendingCreate?.markingTemplateId,
    assessmentManager.assessment?.sections,
  ]);

  // Nothing was ever saved to the backend, so if the in-memory details-form
  // data is gone (e.g. the page was refreshed) there's nothing to recover.
  if (isPendingCreation && !pendingCreate) {
    return (
      <Box padding={10} textAlign="center">
        <Text bold mb={2}>
          The details for this {isExamination ? "examination" : "assessment"} were lost.
        </Text>
        <Text color="gray.500" mb={4}>
          Nothing was created yet, so there&apos;s nothing to recover — please go back and fill in the details again.
        </Text>
        <Button onClick={handleGoBack} type="button">
          Go Back
        </Button>
      </Box>
    );
  }

  // Same recovery guard, but for a pending edit — the edit itself hasn't
  // been saved either, so a lost `pendingEdit` means going back to redo it.
  if (isPendingEditSubmit && !pendingEdit) {
    return (
      <Box padding={10} textAlign="center">
        <Text bold mb={2}>
          The changes to this {isExamination ? "examination" : "assessment"} were lost.
        </Text>
        <Text color="gray.500" mb={4}>
          Nothing was saved yet, so there&apos;s nothing to recover — please go back and make your changes again.
        </Text>
        <Button onClick={handleGoBack} type="button">
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={3}
        paddingTop={3}
        paddingX={6}
      >
        <Heading fontSize="heading.h3">
          {isQuestionListingPage
            ? null
            : queuedIndexParam !== null
              ? "Edit Queued "
              : questionId === "new"
                ? "Create "
                : "Update "}
          {isStandaloneExamination
            ? "Standalone Examination"
            : isExamination
              ? "Examination"
              : "Assessment"}
          {" Question"}
        </Heading>

        {!isQuestionListingPage && !isExistingQuestion && (
          isPendingCreation ? (
            <Button onClick={handleBatchUploadClick} disabled={creatingForUpload}>
              {creatingForUpload ? "Creating..." : "Upload & Batch Import Questions"}
            </Button>
          ) : (
            <Button link={batchUploadLink}>
              Upload &amp; Batch Import Questions
            </Button>
          )
        )}
      </Flex>

      <Flex
        flexDirection={{
          base: "column-reverse",
          md: "column-reverse",
          lg: "row",
        }}
        alignItems={{ base: "flex-start", md: "column", lg: "row" }}
      >
        {isQuestionListingPage ? (
          <QuestionListingPage
            {...assessmentManager}
            configuredSections={configuredSections}
            setConfiguredSections={setConfiguredSections}
          />
        ) : (
          <CreateQuestionPage
            {...assessmentManager}
            templateSections={templateSections}
            sectionsLoading={sectionsLoading}
            sectionConfigMap={sectionConfigMap}
            selectedSectionId={selectedSectionId}
            setSelectedSectionId={setSelectedSectionId}
          />
        )}

        <Box padding={6} width={{ base: "100%", md: "100%", lg: "30%" }}>
          <Box
            paddingTop="20px"
            paddingX="20px"
            paddingBottom="60px"
            backgroundColor="white"
            height={240}
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              borderBottom="1px"
              borderColor="accent.1"
              mb={5}
              pb={3}
            >
              <Heading fontSize="heading.h5">List Of Questions</Heading>

              <Link
                href={`${getQuestionListingLink(
                  courseId,
                  assessmentId,
                  isExamination,
                  moduleId,
                )}${
                  isPendingCreation
                    ? "&submitForApproval=1"
                    : isPendingEditSubmit
                      ? "&editSubmit=1"
                      : ""
                }`}
              >
                <Text bold color="primary.base">
                  See All
                </Text>
              </Link>
            </Flex>

            <Grid templateColumns="repeat(5, 1fr)" gap={2}>
              {assessmentManager.assessment?.questions?.map(
                (question, index) => (
                  <ButtonNavItem
                    key={index}
                    number={index + 1}
                    isCurrent={questionId === question.id}
                    answered={questionId === question.id}
                    link={getEditQuestionLink(
                      courseId,
                      assessmentId,
                      question.id,
                      isExamination,
                      moduleId,
                    )}
                  />
                ),
              )}
              {/* Not created yet — queued via "Add more questions" while the
                  parent exam/assessment is still pending (see pendingCreate/
                  pendingEdit `.questions`). No real id exists for these until
                  the batch is saved, so they link to an edit-in-place view
                  keyed by their queue index instead of a real question id. */}
              {(isPendingCreation ? pendingCreate?.questions : isPendingEditSubmit ? pendingEdit?.questions : null)?.map(
                (_, index) => (
                  <ButtonNavItem
                    key={`queued-${index}`}
                    number={(assessmentManager.assessment?.questions?.length || 0) + index + 1}
                    answered
                    isCurrent={queuedIndexParam === `${index}`}
                    link={getEditQueuedQuestionLink(
                      courseId,
                      assessmentId,
                      isExamination,
                      moduleId,
                      index,
                      isPendingCreation ? "submitForApproval" : "editSubmit",
                    )}
                  />
                ),
              )}
            </Grid>
          </Box>
        </Box>
      </Flex>
    </>
  );
};

const ButtonNavItem = ({ number, answered, isCurrent, link, disabled }) => {
  const styleProps = answered
    ? {
        backgroundColor: "primary.base",
        color: "white",
        borderColor: "transparent",
      }
    : {
        borderColor: "primary.base",
      };

  const content = (
    <Flex
      flexDirection={{ base: "column", md: "column", lg: "row" }}
      justifyContent={{ base: "flex-start", md: "flex-start", lg: "center" }}
      boxSize="40px"
      rounded="4px"
      alignItems="center"
      as={disabled ? undefined : "button"}
      cursor={disabled ? "default" : "pointer"}
      transition=".1s"
      border={isCurrent ? "2px" : "1px"}
      transform={isCurrent && "scale(1.05)"}
      {...styleProps}
    >
      <Text bold as="level1">
        {number}
      </Text>
    </Flex>
  );

  // Queued-but-not-yet-created questions have no real id/route to link to.
  if (disabled) return content;

  return <Link href={link}>{content}</Link>;
};

const useQuestionDetails = (assessmentManager) => {
  const [question, setQuestion] = useState(null);
  const { questionId } = useParams();

  const getQuestions = useCallback(() => {
    if (assessmentManager.assessment?.questions) {
      let index;

      const question = assessmentManager.assessment.questions.find((q, i) => {
        const foundQuestion = q.id === questionId;
        if (foundQuestion) index = i;

        return foundQuestion;
      });

      if (question) setQuestion({ ...question, index });
    }
  }, [assessmentManager.assessment?.questions, questionId]);

  // Handle fetch category
  useEffect(() => {
    getQuestions();
  }, [getQuestions]);

  const toast = useToast();

  useEffect(() => {
    if (assessmentManager.error) {
      toast.closeAll();

      toast({
        description: capitalizeFirstLetter(
          "there was an error filling the form, reload the page!",
        ),
        position: "top",
        status: "error",
        duration: 60000,
      });
    }
  }, [assessmentManager.error, toast]);

  return {
    question,
    isLoading: assessmentManager.isLoading,
    error: assessmentManager.error,
  };
};

const CreateQuestionPage = ({
  templateSections,
  sectionsLoading,
  sectionConfigMap = {},
  selectedSectionId,
  setSelectedSectionId,
  ...assessmentManager
}) => {
  const { push } = useHistory();
  const toast = useToast();
  const { id: courseId, assessmentId, questionId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const moduleId = useQueryParams().get("moduleId");
  const isEditMode = useQueryParams().get("edit") === "true";
  const submitForApproval = useQueryParams().get("submitForApproval") === "1";
  const editSubmit = useQueryParams().get("editSubmit") === "1";
  const isSuperAdmin = useIsSuperAdmin();
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;

  const isExistingQuestion = questionId && questionId !== "new";
  // Nothing was created when "Next" was clicked on the details form — this
  // is the first question, and saving it is also what creates the parent
  // exam/assessment (and, for instructors, what the approval modal gates).
  const isPendingCreation = submitForApproval && !isExistingQuestion && !isEditMode;
  // Same deferral, but the parent shell already exists — saving this
  // question is what finally applies the held-back edit (and, for
  // instructors, what the approval modal gates).
  const isPendingEditSubmit = editSubmit && !isExistingQuestion && !isEditMode;
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);
  const clearPendingEdit = useAssessmentStore((s) => s.clearPendingEdit);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const fromBankQuestionIds = pendingCreate?.fromBankQuestionIds;

  // Clicking a queued (not-yet-created) tile in "List Of Questions" lands
  // here with `queuedIndex` instead of a real question id — there is no real
  // id until the whole batch is saved on submit.
  const queuedIndexParam = useQueryParams().get("queuedIndex");
  const queuedSource = isPendingCreation ? pendingCreate : isPendingEditSubmit ? pendingEdit : null;
  const queuedIndex =
    queuedSource && queuedIndexParam !== null && queuedIndexParam !== ""
      ? Number(queuedIndexParam)
      : null;
  const queuedItem = queuedIndex !== null ? queuedSource?.questions?.[queuedIndex] : null;
  const isEditingQueued = queuedIndex !== null && !!queuedItem;
  const isBankPickerOpen = useAssessmentStore((s) => s.isBankPickerOpen);
  const closeBankPicker = useAssessmentStore((s) => s.closeBankPicker);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(null);

  // How many questions this exam/assessment was configured for — read from
  // the not-yet-created details form while pending, or the real record
  // once it exists. Used to decide whether to offer "Add more questions".
  const amountOfQuestions =
    Number(
      pendingCreate?.body?.amountOfQuestions ??
        pendingEdit?.body?.amountOfQuestions ??
        assessmentManager.assessment?.amountOfQuestions,
    ) || null;

  // Real questions already saved plus whatever's already queued — what
  // actually counts against `amountOfQuestions` right now. Used to cap how
  // many Question Bank picks can be added in one go (see
  // `queueBankQuestions`/`saveBankQuestionsForReal` below), the same limit
  // "Add more questions" already respects for manual entry.
  const questionsSoFar =
    (assessmentManager.assessment?.questions?.length || 0) +
    ((isPendingCreation ? pendingCreate?.questions?.length : isPendingEditSubmit ? pendingEdit?.questions?.length : 0) || 0);
  const remainingQuestionSlots = amountOfQuestions ? Math.max(0, amountOfQuestions - questionsSoFar) : null;
  const overLimitDescription = `You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this ${isExamination ? "exam" : "assessment"} — you can't add any more.`;
  // Plain "Add Question" on an already-real exam/assessment, once it's
  // already at its configured question count — surfaced proactively (button
  // disabled + banner) instead of only rejecting it in onSubmit after the
  // whole form was filled out.
  const isPlainRealAdd = !isExistingQuestion && !isEditMode && !isPendingCreation && !isPendingEditSubmit;
  const realAddAtCapacity = isPlainRealAdd && remainingQuestionSlots === 0;

  const buildRealQuestionRoute = (realParentId, { listing, keepPending } = {}) => {
    const finalAssessmentId = isExamination ? courseId : (realParentId ?? assessmentId);
    const finalExamination = isExamination ? (realParentId ?? isExamination) : undefined;
    if (listing) return getQuestionListingLink(courseId, finalAssessmentId, finalExamination, moduleId);
    const base = `/admin/courses/${courseId}/assessment/${finalAssessmentId}/questions/new`;
    const params = new URLSearchParams();
    if (finalExamination) params.set("examination", finalExamination);
    if (moduleId) params.set("moduleId", moduleId);
    // Only set while nothing real exists yet — keeps the next question form
    // in the same pending-creation/pending-edit-submit state so it queues
    // instead of trying to save straight away.
    if (keepPending && isPendingCreation) params.set("submitForApproval", "1");
    if (keepPending && isPendingEditSubmit) params.set("editSubmit", "1");
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  };

  const goToQuestionListing = (realParentId) => {
    // Only clear here, on the way out — clearing as soon as creation
    // succeeds would wipe `pendingCreate`/`pendingEdit` while the success
    // modal for a super admin is still showing, tripping the "details were
    // lost" guard above on content that was, in fact, just saved successfully.
    const editNextRoute = pendingEdit?.nextRoute;
    clearPendingCreate();
    clearPendingEdit();
    // An edit's "done for now" destination is whatever route the details
    // form set up (it can differ per kind, e.g. standalone exams), not the
    // generic question-listing link `buildRealQuestionRoute` builds.
    push(isPendingEditSubmit && editNextRoute ? editNextRoute : buildRealQuestionRoute(realParentId, { listing: true }));
  };

  const goToAddAnotherQuestion = (realParentId) => {
    clearPendingCreate();
    clearPendingEdit();
    // This stays on the same CreateQuestionPage instance (only the query
    // string changes, via `push` below) — unlike goToQuestionListing, which
    // switches to QuestionListingPage and unmounts this component entirely.
    // Without clearing it, `createdSuccess` stayed set and the "Question
    // added successfully!" screen's own early return kept re-showing itself
    // instead of a fresh blank form.
    setCreatedSuccess(null);
    push(buildRealQuestionRoute(realParentId, { listing: false }));
  };

  // Queued questions only live in the store — nothing to delete on the
  // backend, just splice this slot out of pendingCreate/pendingEdit and
  // head back to a blank pending form.
  const handleRemoveQueuedQuestion = () => {
    if (!window.confirm("Remove this queued question? It hasn't been created yet.")) return;
    const updatedQuestions = (queuedSource.questions || []).filter((_, i) => i !== queuedIndex);
    if (isPendingCreation) {
      setPendingCreate({ ...pendingCreate, questions: updatedQuestions });
    } else {
      setPendingEdit({ ...pendingEdit, questions: updatedQuestions });
    }
    toast({ description: "Queued question removed", position: "top", status: "success" });
    goToQueueAnotherQuestion();
  };

  // Used by "Add more questions" while the parent exam/assessment doesn't
  // exist yet (or its edit is still held back) — nothing has been saved, so
  // this queues the current question locally (see the onSubmit branch below)
  // and reopens a blank form without disturbing `pendingCreate`/`pendingEdit`.
  const goToQueueAnotherQuestion = () => {
    push(buildRealQuestionRoute(undefined, { listing: false, keepPending: true }));
  };

  // Once the queue is full, land on the listing view instead of another
  // blank form — mirrors the "See All" link's href, which keeps
  // pendingCreate/pendingEdit alive (unlike goToQuestionListing, which
  // clears them) since nothing has actually been created/saved yet.
  const goToQueuedListing = () => {
    const pendingSuffix = isPendingCreation
      ? "&submitForApproval=1"
      : isPendingEditSubmit
        ? "&editSubmit=1"
        : "";
    push(`${getQuestionListingLink(courseId, assessmentId, isExamination, moduleId)}${pendingSuffix}`);
  };

  // After a question is saved: if this exam/assessment was set up for more
  // than one question, offer to add another right away instead of always
  // dropping straight to the question list.
  const finishSaving = (realParentId) => {
    // How many questions exist after this save — used to stop offering
    // "Add more questions" once the exam/assessment has as many as was
    // asked for.
    const questionsBeforeThisSave = isPendingCreation
      ? pendingCreate?.questions?.length || 0
      : isPendingEditSubmit
        ? pendingEdit?.questions?.length || 0
        : assessmentManager.assessment?.questions?.length || 0;
    const totalAfterSave = questionsBeforeThisSave + 1;
    const reachedLimit = amountOfQuestions && totalAfterSave >= amountOfQuestions;

    if (amountOfQuestions > 1 && !reachedLimit) {
      // Everything has actually been created/saved for real by this point —
      // clear the pending state and move off the pending URL right away,
      // same as `goToQuestionListing`/`goToAddAnotherQuestion` do below.
      // Leaving `pendingCreate`/`pendingEdit` set (and staying on the old
      // `submitForApproval=1`/`editSubmit=1` URL) while this screen shows
      // let a stale queued-question tile — still rendered in the sidebar
      // because nothing had cleared it yet — or the browser back button
      // land the user back on what looked like an untouched pending form.
      // Clicking "Create and Submit"/"Update and Submit" from there called
      // performCreateParent/performEditParent a second time with the same
      // body, which the backend rejected as a duplicate ("already exists").
      clearPendingCreate();
      clearPendingEdit();
      push(buildRealQuestionRoute(realParentId, { listing: false }));
      setCreatedSuccess({ realParentId });
    } else {
      if (reachedLimit) {
        toast({
          description: `You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this ${isExamination ? "exam" : "assessment"} — you can't add another question.`,
          position: "top",
          status: "info",
        });
      }
      goToQuestionListing(realParentId);
    }
  };

  const { question, isLoading, error } = useQuestionDetails(assessmentManager);

  const QUESTION_TYPES = [
    "MCQ",
    "TrueFalse",
    "FillBlank",
    "Matching",
    "ShortAnswer",
    "Essay",
  ];

  const [questionType, setQuestionType] = useState("MCQ");
  const [marks, setMarks] = useState(1);
  const [markingType, setMarkingType] = useState("automatic");
  const [rubric, setRubric] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [bloomLevel, setBloomLevel] = useState("");

  // Exam-Type-driven per-type Quantity cap (unsectioned/hybrid) — see
  // buildTypeQuotaState below. `queuedSource` is already whichever of
  // pendingCreate/pendingEdit applies while pending; once the exam/
  // assessment is real, the same rules are read from the fetched record
  // instead (unrestricted for one with no Exam Type at all — e.g. it
  // predates this feature).
  const isPending = isPendingCreation || isPendingEditSubmit;
  const realExamType = assessmentManager.assessment?.examType;
  const examTypeForTabs = isPending ? queuedSource?.body?.examType : realExamType;
  const isHybridExam = examTypeForTabs === "hybrid";
  // Hybrid gets one extra tab ("" — Standalone Questions) alongside its real
  // sections, so the admin can switch between the sectioned and marking-
  // template-driven halves — same as Standalone Exam's own Questions step
  // (QuestionsStandalone.jsx). A plain "with sections" exam/assessment has
  // no standalone half, so its tabs are exactly its real sections.
  const activeSections = useMemo(
    () => (isHybridExam ? ["", ...templateSections] : templateSections),
    [isHybridExam, templateSections],
  );

  // The selected section's question-type/marking-type locks, count cap, and
  // weightage — null allowed-lists mean "no restriction" from this section.
  const selectedSectionConfig = sectionConfigMap[selectedSectionId];
  const allowedQuestionTypes = getAllowedQuestionTypes(selectedSectionConfig);
  const allowedMarkingTypes = getAllowedMarkingTypes(selectedSectionConfig);
  const sectionMarks = getSectionMarks(selectedSectionConfig);
  const existingSectionQuestionCount = (
    assessmentManager.assessment?.questions || []
  ).filter((q) => q.section === selectedSectionId).length;
  const sectionAtCapacity =
    !isEditMode &&
    !!selectedSectionConfig?.questionsCount &&
    existingSectionQuestionCount >= selectedSectionConfig.questionsCount;

  // "Exam with sections" — same header-level section tabs Standalone Exam's
  // own Questions step uses (QuestionsStandalone.jsx), instead of the plain
  // dropdown below. Also true for hybrid (see isHybridExam/activeSections
  // above). Covers both a still-pending exam/assessment and an already-real
  // one — an exam/assessment with no Exam Type at all keeps the dropdown
  // exactly as it always has.
  const isSectionedExam = examTypeForTabs === "sectioned" || isHybridExam;
  const {
    usingTemplateTypeRestriction,
    templateSupportedTypes,
    queuedTypeCounts,
    typeQuota,
    typeAtCapacity,
  } = buildTypeQuotaState({
    pendingSource: queuedSource,
    isPending,
    realExamType,
    realQuestionQuantity: assessmentManager.assessment?.questionQuantity,
    realQuestions: assessmentManager.assessment?.questions,
    editingQuestionId: isEditMode ? question?.id : undefined,
    selectedSectionId,
    isEditingQueued,
    queuedIndex,
  });
  const visibleQuestionTypes = QUESTION_TYPES.filter((type) => {
    if (allowedQuestionTypes && !allowedQuestionTypes.includes(type)) return false;
    if (usingTemplateTypeRestriction && typeAtCapacity(type)) return false;
    return true;
  });

  // A brand-new "with sections" form has no section picked yet — default to
  // the first one so the section tabs (and the type/marking-type locks tied
  // to it) immediately reflect a real section instead of nothing selected.
  // Skipped whenever there's a real `question` to hydrate from (existing/
  // queued question edit, or a bank-apply) — that effect always wins since
  // it re-runs whenever `question` resolves. Hybrid is deliberately
  // excluded — its default tab is "Standalone Questions" (selectedSectionId
  // already starts at "").
  useEffect(() => {
    if (!isSectionedExam || isHybridExam || selectedSectionId || question || activeSections.length === 0) return;
    setSelectedSectionId(activeSections[0]);
  }, [isSectionedExam, isHybridExam, selectedSectionId, question, activeSections, setSelectedSectionId]);

  // Snap to a section's locked type/marking type as soon as it's picked —
  // covers arriving via a section's "Add Question" link and switching
  // sections mid-form. A user actively clicking a disallowed type button is
  // handled separately below, with an error instead of a silent correction.
  useEffect(() => {
    if (allowedQuestionTypes && !allowedQuestionTypes.includes(questionType)) {
      setQuestionType(allowedQuestionTypes[0]);
    } else if (usingTemplateTypeRestriction && typeAtCapacity(questionType)) {
      const fallback = QUESTION_TYPES.find(
        (t) => !typeAtCapacity(t) && (!allowedQuestionTypes || allowedQuestionTypes.includes(t)),
      );
      if (fallback) setQuestionType(fallback);
    }
    if (allowedMarkingTypes && !allowedMarkingTypes.includes(markingType)) {
      setMarkingType(allowedMarkingTypes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId, usingTemplateTypeRestriction, questionType]);

  const handleQuestionTypeClick = (type) => {
    if (allowedQuestionTypes && !allowedQuestionTypes.includes(type)) {
      toast({
        description: `Section "${selectedSectionId}" only accepts ${allowedQuestionTypes.join(" / ")} questions.`,
        position: "top",
        status: "error",
      });
      return;
    }
    if (usingTemplateTypeRestriction && typeAtCapacity(type)) {
      const notSupported = templateSupportedTypes && !templateSupportedTypes.includes(type);
      const quota = typeQuota(type);
      toast({
        description: notSupported
          ? `${type} isn't one of the question types in the selected marking template.`
          : `You've reached the ${quota} ${type} question${quota === 1 ? "" : "s"} you specified for this exam.`,
        position: "top",
        status: "error",
      });
      return;
    }
    setQuestionType(type);
  };

  const handleMarkingTypeChange = (type) => {
    if (allowedMarkingTypes && !allowedMarkingTypes.includes(type)) {
      toast({
        description: `Section "${selectedSectionId}" only allows ${allowedMarkingTypes.join(" / ")} marking.`,
        position: "top",
        status: "error",
      });
      return;
    }
    setMarkingType(type);
  };

  const [answer, setAnswer] = useState();
  const [matchingPairs, setMatchingPairs] = useState([{ left: "", right: "" }]);

  const handleAnswerChange = (event) => setAnswer(event.target.value);

  const handleAddPair = () =>
    setMatchingPairs((prev) => [...prev, { left: "", right: "" }]);
  const handleRemovePair = (idx) =>
    setMatchingPairs((prev) => prev.filter((_, i) => i !== idx));
  const handlePairChange = (idx, side, value) =>
    setMatchingPairs((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [side]: value } : p)),
    );

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm();

  const questionRichTextManager = useRichText();

  // ── Add this question to the Question Bank on save ─────────────────────
  const [addToBank, setAddToBank] = useState(false);
  const bankExamType = isStandaloneExamination
    ? "standalone"
    : isExamination
      ? "examination"
      : "assessment";
  const bankExamId = isStandaloneExamination || isExamination ? isExamination : assessmentId;
  const autoAddToBank = isAutoAddToBank(bankExamType, bankExamId);

  useEffect(() => {
    if (autoAddToBank) setAddToBank(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAddToBank]);

  // ── Select from Question Bank ──────────────────────────────────────────
  const [useBank, setUseBank] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [bankResults, setBankResults] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankApplyKey, setBankApplyKey] = useState(0);

  const searchBank = useCallback(async () => {
    setBankLoading(true);
    try {
      const params = { limit: 10 };
      if (bankSearch) params.search = bankSearch;
      const res = await listExamQuestionBank(params);
      const payload = res?.data ?? res;
      const items = Array.isArray(payload?.questions)
        ? payload.questions
        : Array.isArray(payload)
          ? payload
          : [];
      setBankResults(items);
    } catch {
      setBankResults([]);
    } finally {
      setBankLoading(false);
    }
  }, [bankSearch]);

  useEffect(() => {
    if (useBank) searchBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useBank]);

  // The option/answer fields below only exist in the DOM once `questionType`
  // has actually switched (e.g. TrueFalse's radio pair isn't rendered while
  // the form is still showing MCQ's), so setting them can't happen in the
  // same synchronous call as `setQuestionType` — it has to wait for the
  // re-render that follows. Stash the bank question here and let the
  // `[questionType]` effect below fill in the type-specific fields once
  // that render has actually happened.
  const pendingBankApplyRef = useRef(null);

  const applyBankQuestion = (bankQuestion) => {
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType] || "Essay";
    pendingBankApplyRef.current = bankQuestion;
    setMarks(bankQuestion.marks || 1);
    if (isExamination && !isStandaloneExamination) {
      setDifficultyLevel((bankQuestion.difficultyLevel || "Medium").toLowerCase());
    }
    questionRichTextManager.handleInitData(bankQuestion.question);
    setBankApplyKey((k) => k + 1);
    setUseBank(false);
    setQuestionType(mappedType);
  };

  useEffect(() => {
    const bankQuestion = pendingBankApplyRef.current;
    if (!bankQuestion) return;
    pendingBankApplyRef.current = null;
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType] || "Essay";

    if (mappedType === "MCQ" || mappedType === "TrueFalse") {
      const opts =
        mappedType === "TrueFalse"
          ? ["True", "False"]
          : (bankQuestion.options || []).map((o) => o.text);
      opts.slice(0, 4).forEach((text, idx) => setValue(`option-${idx + 1}`, text));
      const correctIdx =
        mappedType === "TrueFalse"
          ? bankQuestion.correctAnswer === "False"
            ? 2
            : 1
          : (bankQuestion.options || []).findIndex((o) => o.isCorrect) + 1;
      setAnswer(String(correctIdx || 1));
    } else if (mappedType === "FillBlank") {
      setValue("correctAnswer", bankQuestion.correctAnswer || "");
    } else if (mappedType === "ShortAnswer") {
      setValue("modelAnswer", bankQuestion.correctAnswer || "");
    } else if (mappedType === "Essay") {
      setValue("rubricDescription", bankQuestion.explanation || "");
    }

    toast({
      description: "Question loaded from the bank — review and edit before saving",
      position: "top",
      status: "info",
    });
    // `bankApplyKey` (not `questionType`) is the trigger: it changes on every
    // apply even when the picked question's type matches the current one
    // (e.g. MCQ→MCQ), whereas `questionType` wouldn't, and this effect would
    // never fire for that case.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankApplyKey]);

  // ── Editing a queued (not-yet-created) question ─────────────────────────
  // Clicking a queued tile in "List Of Questions" lands here with
  // `queuedIndex` instead of a real question id. Hydrate the form from that
  // queue entry's `formSnapshot` (captured when it was queued — see
  // `onSubmit`'s queuing branches and `buildBankQueueItem`), reusing the same
  // remount-then-fill trick as the bank-apply flow above since the RichText
  // editor and the type-specific fields only exist in the DOM once
  // `questionType` has actually switched.
  const pendingQueuedApplyRef = useRef(null);
  const appliedQueuedIndexRef = useRef(null);

  useEffect(() => {
    if (!isEditingQueued) {
      appliedQueuedIndexRef.current = null;
      return;
    }
    if (appliedQueuedIndexRef.current === queuedIndex) return;
    appliedQueuedIndexRef.current = queuedIndex;

    const snap = queuedItem.formSnapshot;
    if (!snap) return;

    pendingQueuedApplyRef.current = snap;
    questionRichTextManager.handleInitData(snap.questionText);
    setBankApplyKey((k) => k + 1);
    setQuestionType(snap.questionType || "MCQ");
    setMarks(snap.marks || 1);
    setMarkingType(snap.markingType || "automatic");
    setDifficultyLevel(snap.difficultyLevel || "medium");
    setBloomLevel(snap.bloomLevel || "");
    setSelectedSectionId(snap.section || "");
    setRubric(snap.rubric || "");
    setAnswer(snap.answer || "");
    setMatchingPairs(
      snap.matchingPairs?.length ? snap.matchingPairs : [{ left: "", right: "" }],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingQueued, queuedIndex]);

  useEffect(() => {
    const snap = pendingQueuedApplyRef.current;
    if (!snap) return;
    pendingQueuedApplyRef.current = null;

    (snap.optionValues || []).forEach((text, idx) => setValue(`option-${idx + 1}`, text));
    setValue("correctAnswer", snap.correctAnswer || "");
    setValue("modelAnswer", snap.modelAnswer || "");
    setValue("rubricDescription", snap.rubricDescription || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankApplyKey]);

  // ── Queue Question Bank items directly into pendingCreate/pendingEdit —
  // used both by the plural fromBankQuestionIds hand-off below and by the
  // "Question Bank" multi-select modal opened mid-creation. Mirrors the
  // create-mode `data` shape onSubmit builds further down, sourced from a
  // bank question's fields instead of the live form.
  const bankQueueCtx = {
    isStandaloneExamination,
    isExamination,
    assessmentId,
    sectionTitle: selectedSectionId || undefined,
    sectionMarks,
    allowedQuestionTypes,
  };

  const buildQueuedItemFromBankQuestion = (bankQuestion) => {
    const item = buildBankQueueItem(bankQuestion, bankQueueCtx);
    if (!item) {
      toast({
        description: `Skipped "${bankQuestion.question}" — section "${selectedSectionId}" only accepts ${allowedQuestionTypes.join(" / ")} questions.`,
        position: "top",
        status: "warning",
      });
    }
    return item;
  };

  // "Exam without sections"/hybrid: getType maps a bank item's own type to
  // this file's internal type name — same default ("Essay") buildBankQueueItem
  // itself falls back to for anything unmapped.
  const getBankQuestionType = (bq) => BANK_TYPE_TO_FORM_TYPE[bq.questionType] || "Essay";
  const quotaFilterCtx = { usingTemplateTypeRestriction, templateSupportedTypes, typeQuota, queuedTypeCounts };
  const quotaSkippedToast = (skipped) =>
    skipped ? ` ${skipped} skipped — already at the configured Quantity for that type.` : "";

  const queueBankQuestions = (bankQuestions) => {
    if (remainingQuestionSlots === 0) {
      toast({ description: overLimitDescription, position: "top", status: "error" });
      return;
    }
    const overLimit = remainingQuestionSlots !== null && bankQuestions.length > remainingQuestionSlots;
    const cappedBankQuestions = overLimit ? bankQuestions.slice(0, remainingQuestionSlots) : bankQuestions;
    const { kept, skipped: skippedForQuota } = filterBankQuestionsByTypeQuota(
      cappedBankQuestions,
      quotaFilterCtx,
      getBankQuestionType,
    );
    const items = kept.map(buildQueuedItemFromBankQuestion).filter(Boolean);
    if (!items.length) {
      if (skippedForQuota) {
        toast({
          description: `Skipped ${skippedForQuota} question${skippedForQuota === 1 ? "" : "s"} — already at the configured Quantity for that type.`,
          position: "top",
          status: "warning",
        });
      }
      return;
    }

    if (isPendingCreation) {
      setPendingCreate({ ...pendingCreate, questions: [...(pendingCreate.questions || []), ...items] });
    } else if (isPendingEditSubmit) {
      setPendingEdit({ ...pendingEdit, questions: [...(pendingEdit.questions || []), ...items] });
    }

    toast({
      description: overLimit
        ? `Only added ${items.length} of ${bankQuestions.length} — ${overLimitDescription}`
        : `${items.length} question${items.length === 1 ? "" : "s"} added from the bank.${quotaSkippedToast(skippedForQuota)} They'll be created once you submit for approval.`,
      position: "top",
      status: overLimit ? "warning" : "success",
    });
  };

  // The parent assessment/exam already exists (not pending creation/edit) —
  // a bank pick is saved for real, right away, so it shows up in "List Of
  // Questions" like any other question and is immediately clickable to edit.
  const saveBankQuestionsForReal = async (bankQuestions) => {
    if (remainingQuestionSlots === 0) {
      toast({ description: overLimitDescription, position: "top", status: "error" });
      return;
    }
    const overLimit = remainingQuestionSlots !== null && bankQuestions.length > remainingQuestionSlots;
    const cappedBankQuestions = overLimit ? bankQuestions.slice(0, remainingQuestionSlots) : bankQuestions;
    const { kept, skipped: skippedForQuota } = filterBankQuestionsByTypeQuota(
      cappedBankQuestions,
      quotaFilterCtx,
      getBankQuestionType,
    );
    const items = kept.map(buildQueuedItemFromBankQuestion).filter(Boolean);
    if (!items.length) {
      if (skippedForQuota) {
        toast({
          description: `Skipped ${skippedForQuota} question${skippedForQuota === 1 ? "" : "s"} — already at the configured Quantity for that type.`,
          position: "top",
          status: "warning",
        });
      }
      return;
    }
    try {
      for (const item of items) {
        await createBankQuestionForReal(item.data, { isStandaloneExamination, isExamination });
      }
      assessmentManager.handleFetch(true);
      toast({
        description: overLimit
          ? `Only added ${items.length} of ${bankQuestions.length} — ${overLimitDescription}`
          : `${items.length} question${items.length === 1 ? "" : "s"} added from the bank.${quotaSkippedToast(skippedForQuota)}`,
        position: "top",
        status: overLimit ? "warning" : "success",
      });
    } catch (err) {
      toast({
        description: err?.response?.data?.message || "Failed to add question(s) from the bank",
        position: "top",
        status: "error",
      });
    }
  };

  // Arrived here straight from the Question Bank via "Next" on the details
  // form — prefill this first question from the first bank item the admin
  // picked (same mapping as manually applying a bank question above), and
  // queue the rest so they show up in "Queued Questions" right away.
  const appliedFromBankRef = useRef(false);
  useEffect(() => {
    if (!isPendingCreation || !fromBankQuestionIds?.length || appliedFromBankRef.current) return;
    appliedFromBankRef.current = true;
    Promise.all(fromBankQuestionIds.map((id) => getExamQuestionBankItem(id).then((res) => res?.data ?? res)))
      .then((bankQuestions) => {
        applyBankQuestion(bankQuestions[0]);
        if (bankQuestions.length > 1) queueBankQuestions(bankQuestions.slice(1));
      })
      .catch((err) => {
        console.error("[QuestionsPage] failed to load bank questions for prefill", fromBankQuestionIds, err?.response?.data ?? err);
        toast({ description: "Couldn't load the picked questions from the bank", position: "top", status: "error" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingCreation, fromBankQuestionIds]);

  useEffect(() => {
    if (question) {
      const isTrueFalse = question.options?.length === 2;
      setQuestionType(
        question.questionType || (isTrueFalse ? "TrueFalse" : "MCQ"),
      );

      const option1 = question.options?.find((opt) => opt.optionIndex === 1);
      setValue("option-1", isTrueFalse ? "True" : option1?.name);

      questionRichTextManager.handleInitData(question.question);
      // MUIRichTextEditor only reads defaultValue on mount, so force a
      // remount (same trick applyBankQuestion uses) to pick up the loaded text.
      setBankApplyKey((k) => k + 1);

      setValue("correctAnswer", question.correctAnswer || "");
      setValue("modelAnswer", question.modelAnswer || "");
      setValue("rubricDescription", question.rubric || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (questionType === "TrueFalse") {
      setValue("option-1", "True");
      setValue("option-2", "False");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionType]);

  useEffect(() => {
    const manualTypes = ["ShortAnswer", "Essay"];
    const automaticTypes = ["MCQ", "TrueFalse", "FillBlank", "Matching"];
    if (manualTypes.includes(questionType)) setMarkingType("manual");
    else if (automaticTypes.includes(questionType)) setMarkingType("automatic");
  }, [questionType]);

  useEffect(() => {
    if (question) {
      const option2 = question.options?.find((opt) => opt.optionIndex === 2);
      setValue("option-2", option2?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);
  useEffect(() => {
    if (question) {
      const option3 = question.options?.find((opt) => opt.optionIndex === 3);
      setValue("option-3", option3?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);
  useEffect(() => {
    if (question) {
      const option4 = question.options?.find((opt) => opt.optionIndex === 4);
      setValue("option-4", option4?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (question) {
      const optionWithAns = question.options?.find((opt) => opt.isAnswer);
      setAnswer(`${optionWithAns?.optionIndex}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (question) {
      if (question.marks) setMarks(question.marks);
      if (question.markingType) setMarkingType(question.markingType);
      if (question.rubric) setRubric(question.rubric);
      if (question.difficultyLevel)
        setDifficultyLevel(question.difficultyLevel);
      if (question.bloomLevel) setBloomLevel(question.bloomLevel);
      if (question.section) {
        setSelectedSectionId(question.section);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const questionImageManager = useUpload();

  // TODO: uncomment for editMode's sake
  useEffect(() => {
    if (question) {
      questionImageManager.handleInitialImageSelect(question.file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingCreateBothRef = useRef(null);
  const createdParentRef = useRef(null);
  // Set by the "Add more questions" button (beside "Create/Update and
  // Submit") so onSubmit below knows to queue this question locally instead
  // of opening the approval modal — only the latter button should ever
  // trigger a supervisor-approval submission.
  const addAnotherRef = useRef(false);
  // Set by the "Create and Submit" button on the plain add-question page
  // (a new question on an already-real assessment/exam) — saves the
  // question as normal, then opens the same approval modal used elsewhere,
  // targeting the already-real assessment/exam as the content being
  // submitted.
  const submitForApprovalRef = useRef(false);

  // Creates the exam/assessment that "Next" deferred, using the details
  // form values held in `pendingCreate`. Called from inside the approval
  // modal's `onCreate` — this is the first thing that ever gets saved.
  // Creation is a separate endpoint from approval submission, so no
  // supervisor field is sent here; the supervisor is only attached on the
  // later workflow submit call.
  const performCreateParent = async () => {
    const { kind, body: finalBody, paperConfigBody, addToBank: parentAddToBank } = pendingCreate;

    if (kind === "ModuleExam" || kind === "Exam") {
      const { examination } = await adminCreateExamination(finalBody);
      if (kind === "ModuleExam") {
        await updateExamPaperConfig(examination.id, paperConfigBody).catch(() => {});
      }
      if (parentAddToBank) setAutoAddToBank("examination", examination.id);
      setAssessment({ ...examination, sections: paperConfigBody?.configuredSections || [] });
      return { id: examination.id };
    }

    if (kind === "StandaloneExam") {
      const { examination } = await adminCreateStandaloneExamination(finalBody);
      setAssessment(examination);
      return { id: examination.id };
    }

    // "ModuleAssessment" or "Assessment" — same create endpoint either way
    const { assessment } = await adminCreateAssessment(finalBody);
    setAssessment(assessment);
    if (parentAddToBank) setAutoAddToBank("assessment", assessment.id);
    auditTrailV2PostLog({
      eventType: "create",
      module: "LMS",
      status: "success",
      resourceId: assessment.id,
      resourceType: "Assessment",
      remarks: `Created assessment "${finalBody.title}"`,
    }).catch(() => {});
    return { id: assessment.id };
  };

  // Applies the edit that "Next" deferred, using the details form values
  // held in `pendingEdit`. Called from inside the approval modal's
  // `onCreate` — this is the first thing that actually changes. Editing is
  // a separate endpoint from approval submission, so no supervisor field
  // is sent here; the supervisor is only attached on the later workflow
  // submit call.
  const performEditParent = async () => {
    const { kind, contentId, body: finalBody, paperConfigBody } = pendingEdit;

    if (kind === "StandaloneExam") {
      await adminEditStandaloneExamination(contentId, finalBody);
      if (paperConfigBody) await updateExamPaperConfig(contentId, paperConfigBody).catch(() => {});
      return { id: contentId };
    }

    if (kind === "ModuleExam" || kind === "Exam") {
      await adminEditExamination(contentId, finalBody);
      if (paperConfigBody) await updateExamPaperConfig(contentId, paperConfigBody).catch(() => {});
      return { id: contentId };
    }

    // "Assessment" — same edit endpoint either way
    await adminEditAssessment(contentId, finalBody);
    return { id: contentId };
  };

  const withRealParentId = (d, realParentId) =>
    isStandaloneExamination
      ? { ...d, standAloneExaminationId: realParentId }
      : isExamination
        ? { ...d, examinationId: realParentId }
        : { ...d, assessmentId: realParentId };

  // const { handleDelete } = useCache();
  const onSubmit = async (data) => {
    try {
      // Handle delete mode
      if (isExistingQuestion && !isEditMode) {
        const ok = window.confirm(
          "Are you sure you want to delete this question?",
        );

        if (!ok) return;

        let message = "Question Deleted Successfully";

        if (isStandaloneExamination) {
          const response = await adminDeleteStandaloneExaminationQuestion(question.id);
          message = response?.message || message;
        } else if (isExamination) {
          const response = await adminDeleteExaminationQuestion(question.id);
          message = response?.message || message;
        } else {
          const response = await adminDeleteAssessmentQuestion(question.id);
          message = response?.message || message;
        }

        toast({
          description: capitalizeFirstLetter(message),
          position: "top",
          status: "success",
        });

        assessmentManager.handleFetch(true);
        push(getQuestionListingLink(courseId, assessmentId, isExamination));
        return;
      }

      // Standalone uses plain JSON; assessment/examination use multipart FormData.
      // `overrideData` lets a queued question (built on an earlier render) be
      // saved here instead of this render's own `data`. Defined up here
      // (rather than after the field validations below) because the
      // "Create and Submit with nothing new to add" branch right after this
      // needs it before any of that validation runs.
      const saveQuestion = async (realParentId, overrideData) => {
        const questionData = overrideData || data;
        const finalData = isPendingCreation ? withRealParentId(questionData, realParentId) : questionData;
        const finalBody = isStandaloneExamination ? finalData : appendFormData(finalData);
        return isEditMode
          ? isStandaloneExamination
            ? await adminEditStandaloneExaminationQuestion(finalBody)
            : isExamination
              ? await adminEditExaminationQuestion(finalBody)
              : await adminEditAssessmentQuestion(finalBody)
          : isStandaloneExamination
            ? await adminCreateStandaloneExaminationQuestion(finalBody)
            : isExamination
              ? await adminCreateExaminationQuestion(finalBody)
              : await adminCreateAssessmentQuestion(finalBody);
      };

      // Shared by the current question (via `maybeAddToBank` further down)
      // and by any questions queued earlier through "Add more questions" —
      // each queued item carries its own snapshot of these same fields.
      // Also defined up here (like `saveQuestion` above) since the early-exit
      // branch right below needs it before the field validations run.
      const addQuestionToBank = async ({
        questionPlainText: bankQuestionText,
        questionType: bankQuestionType,
        marks: bankMarks,
        difficultyLevel: bankDifficultyLevel,
        options: bankOptionsSource,
        bankSourceFields: bankSource,
      }) => {
        const bankType = FORM_TYPE_TO_BANK_TYPE[bankQuestionType];
        if (!bankType) {
          toast({
            description: "This question type isn't supported by the Question Bank yet",
            position: "top",
            status: "warning",
          });
          return;
        }
        const isBankObjectiveType =
          bankQuestionType === "MCQ" || bankQuestionType === "TrueFalse";
        let bankPayload;
        try {
          bankPayload = {
            question: bankQuestionText,
            questionType: bankType,
            marks: Number(bankMarks) || 1,
            difficultyLevel: capitalizeFirstLetter(bankDifficultyLevel || "medium"),
            status: "draft",
          };
          if (isBankObjectiveType) {
            const bankOptions = bankOptionsSource.map((o) => ({
              text: o.name ?? o.option ?? "",
              isCorrect: !!o.isAnswer,
            }));
            bankPayload.options = bankOptions.filter((o) => o.text);
            bankPayload.correctAnswer =
              bankOptions.find((o) => o.isCorrect)?.text ?? "";
          } else if (bankQuestionType === "FillBlank") {
            bankPayload.correctAnswer = bankSource.correctAnswer || "";
          } else if (bankQuestionType === "ShortAnswer") {
            bankPayload.correctAnswer = bankSource.modelAnswer || "";
          } else if (bankQuestionType === "Essay" && bankSource.rubricDescription) {
            bankPayload.explanation = bankSource.rubricDescription;
          }
          if (courseId && courseId !== "not-set") bankPayload.courseId = courseId;

          await createExamQuestionBankItem(bankPayload);
        } catch (bankErr) {
          console.error("[QuestionsPage] failed to add question to bank", bankPayload, bankErr?.response?.data ?? bankErr);
          toast({
            description:
              bankErr?.response?.data?.message ||
              "Question saved, but failed to add it to the Question Bank",
            position: "top",
            status: "warning",
          });
        }
      };

      // "Create and Submit"/"Update and Submit" clicked with the current
      // form left genuinely blank (typically right after "Save Changes" on
      // a queued item, which returns to a fresh blank form) while at least
      // one question is already queued. There's nothing new here to
      // validate or add — skip straight to submitting exactly what's
      // already queued instead of forcing the field validations below
      // (which would otherwise demand a phantom extra question, or previously,
      // before the queue was cleared on save, silently resubmitted whatever
      // question was last on the form as a duplicate).
      const hasQueuedAlready = (queuedSource?.questions?.length || 0) > 0;
      const currentFormIsBlank = !questionRichTextManager.getPlainText().trim();
      if (
        (isPendingCreation || isPendingEditSubmit) &&
        !isEditingQueued &&
        !addAnotherRef.current &&
        hasQueuedAlready &&
        currentFormIsBlank
      ) {
        if (isPendingCreation) {
          const createBoth = async () => {
            const parent = await performCreateParent();
            createdParentRef.current = parent;
            for (const queued of pendingCreate.questions || []) {
              await saveQuestion(parent.id, queued.data);
              if (queued.addToBank || pendingCreate.addToBank) {
                await addQuestionToBank(queued.bank);
              }
            }
            // No `maybeAddToBank()` here — that call is for the *current*
            // form's question, and this branch only runs when the current
            // form is intentionally blank (nothing new to add to the bank).
            return { id: parent.id };
          };

          const requestType =
            pendingCreate.kind === "StandaloneExam"
              ? "StandaloneExam"
              : pendingCreate.kind === "ModuleExam" || pendingCreate.kind === "Exam"
                ? "CourseExam"
                : "CourseAssessment";
          const modalCourseId = courseId !== "not-set" ? courseId : undefined;

          pendingCreateBothRef.current = createBoth;
          setWorkflowContent({
            contentTitle: pendingCreate.title,
            requestType,
            courseId: modalCourseId,
          });
        } else {
          const editBoth = async () => {
            const parent = await performEditParent();
            createdParentRef.current = parent;
            for (const queued of pendingEdit.questions || []) {
              await saveQuestion(undefined, queued.data);
              if (queued.addToBank) {
                await addQuestionToBank(queued.bank);
              }
            }
            return { id: parent.id };
          };

          pendingCreateBothRef.current = editBoth;
          setWorkflowContent({
            contentId: pendingEdit.contentId,
            contentTitle: pendingEdit.title,
            requestType: pendingEdit.requestType,
            courseId: pendingEdit.courseId,
          });
        }
        setWorkflowModalOpen(true);
        return;
      }

      // Defense in depth — the UI already disables/blocks disallowed
      // choices, but a section can be locked or filled after this form was
      // opened, so re-validate the section's constraints right before save.
      if (allowedQuestionTypes && !allowedQuestionTypes.includes(questionType)) {
        throw new Error(
          `Section "${selectedSectionId}" only accepts ${allowedQuestionTypes.join(" / ")} questions.`,
        );
      }
      if (allowedMarkingTypes && !allowedMarkingTypes.includes(markingType)) {
        throw new Error(
          `Section "${selectedSectionId}" only allows ${allowedMarkingTypes.join(" / ")} marking.`,
        );
      }
      if (sectionAtCapacity) {
        throw new Error(
          `Section "${selectedSectionId}" already has its configured limit of ${selectedSectionConfig.questionsCount} question(s).`,
        );
      }
      if (usingTemplateTypeRestriction && typeAtCapacity(questionType)) {
        const notSupported = templateSupportedTypes && !templateSupportedTypes.includes(questionType);
        const quota = typeQuota(questionType);
        throw new Error(
          notSupported
            ? `${questionType} isn't one of the question types in the selected marking template.`
            : `You've reached the ${quota} ${questionType} question${quota === 1 ? "" : "s"} you specified for this exam.`,
        );
      }

      // Plain "Add Question" on an already-real exam/assessment: the
      // pending/pendingEdit paths enforce this same overall cap once the
      // question is queued (see finishSaving's "reached limit" toast above)
      // — this is the one remaining case (adding straight to a real
      // exam/assessment, not via the queue) that could otherwise create
      // more questions than it was configured for.
      if (!isPendingCreation && !isPendingEditSubmit && !isEditMode && !isEditingQueued && remainingQuestionSlots === 0) {
        throw new Error(overLimitDescription);
      }

      const file = questionImageManager.handleGetFileAndValidate(
        "Question Cover",
        true,
      );

      // Validates presence and returns Draft.js stringified JSON (used by assessment endpoints)
      const questionText =
        questionRichTextManager.handleGetValueAndValidate("Question");

      // Plain text string required by the examination question endpoint
      const questionPlainText = questionRichTextManager.getPlainText();

      const isObjectiveType =
        questionType === "MCQ" || questionType === "TrueFalse";

      let options = [];
      if (isObjectiveType) {
        options = buildOptions({ ...data, answer }, isStandaloneExamination);
        if (questionType === "TrueFalse" && options.length === 4) {
          options = options.slice(0, 2);
        }
        const hasAnswer = options.find((opt) => opt.isAnswer);
        if (!hasAnswer) throw new Error("Please select an answer");
      } else if (questionType === "Matching") {
        if (matchingPairs.some((p) => !p.left.trim() || !p.right.trim()))
          throw new Error(
            "All matching pairs must have both left and right values",
          );
      }

      const typeSpecificFields = isObjectiveType
        ? { options: JSON.stringify(options) }
        : questionType === "FillBlank"
          ? { correctAnswer: data.correctAnswer, questionType: "FillBlank" }
          : questionType === "Matching"
            ? { pairs: JSON.stringify(matchingPairs), questionType: "Matching" }
            : questionType === "ShortAnswer"
              ? { modelAnswer: data.modelAnswer, questionType: "ShortAnswer" }
              : {
                  rubricDescription: data.rubricDescription,
                  questionType: "Essay",
                };

      // Captured here because `data` gets reassigned into the request body below.
      const bankSourceFields = {
        correctAnswer: data.correctAnswer,
        modelAnswer: data.modelAnswer,
        rubricDescription: data.rubricDescription,
      };

      // selectedSectionId is the section name string for both examination and assessment
      const editSectionTitle = selectedSectionId || undefined;

      // Weightage lives on the section, never the question — when the
      // section carries one, it overrides whatever `marks` would otherwise
      // resolve to, so per-question marks can't be assigned by hand.
      const effectiveMarks = sectionMarks != null ? sectionMarks : Number(marks);

      // Lets a queued (not-yet-created) copy of this question be reopened
      // later and hydrated back into this same form — see the
      // `isEditingQueued` hydration effects above and the `onSubmit` branch
      // below that overwrites a queue slot in place.
      const queuedFormSnapshot = {
        questionType,
        marks,
        markingType,
        difficultyLevel,
        bloomLevel,
        section: editSectionTitle,
        rubric,
        answer,
        matchingPairs,
        optionValues: [1, 2, 3, 4].map((num) => {
          const opt = options.find((o) => o.optionIndex === num);
          return opt?.name ?? opt?.option ?? "";
        }),
        ...bankSourceFields,
        questionText,
      };

      const editMeta = {
        marks: effectiveMarks,
        markingType,
        ...(editSectionTitle && { section: editSectionTitle }),
        ...(rubric && { rubric }),
        difficultyLevel,
        ...(bloomLevel && { bloomLevel }),
      };

      const sectionTitle = selectedSectionId || undefined;

      if (isEditMode) {
        if (isStandaloneExamination) {
          // JSON body — PATCH /v1/stand-alone-examination-question/edit
          data = {
            standAloneExaminationQuestionId: questionId,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...(isObjectiveType && { options }),
          };
        } else if (isExamination) {
          data = {
            image: file,
            question: JSON.stringify({
              id: questionId,
              question: questionPlainText,
              examinationId: isExamination,
              ...editMeta,
              questionType,
            }),
            ...(isObjectiveType
              ? {
                  options: JSON.stringify(
                    options.map((opt) => ({
                      ...opt,
                      id: question?.options.find(
                        ({ name }) => opt.name === name,
                      )?.id,
                      examinationQuestionId: questionId,
                    })),
                  ),
                }
              : typeSpecificFields),
          };
        } else {
          data = {
            image: file,
            questionId,
            question: questionText,
            markingType,
            questionType,
            ...(sectionTitle && { section: sectionTitle }),
            ...(isObjectiveType
              ? {
                  options: JSON.stringify(
                    options.map((opt) => ({
                      ...opt,
                      id: question?.options.find(
                        ({ name }) => opt.name === name,
                      )?.id,
                    })),
                  ),
                }
              : questionType === "FillBlank"
                ? { correctAnswer: data.correctAnswer }
                : questionType === "Matching"
                  ? { pairs: JSON.stringify(matchingPairs) }
                  : questionType === "ShortAnswer"
                    ? { modelAnswer: data.modelAnswer }
                    : { rubricDescription: data.rubricDescription }),
          };
        }
      } else {
        // Create mode
        const examMeta = {
          marks: effectiveMarks,
          markingType,
          ...(sectionTitle && { section: sectionTitle }),
          ...(rubric && { rubric }),
          difficultyLevel,
          ...(bloomLevel && { bloomLevel }),
        };

        if (isStandaloneExamination) {
          // JSON body — POST /v1/stand-alone-examination-question/create
          data = {
            standAloneExaminationId: isExamination,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...(isObjectiveType && { options }),
          };
        } else if (isExamination) {
          data = {
            image: file,
            examinationId: isExamination,
            question: questionPlainText,
            ...examMeta,
            questionType,
            ...typeSpecificFields,
          };
        } else {
          data = {
            image: file,
            assessmentId,
            question: questionText,
            markingType,
            questionType,
            ...(sectionTitle && { section: sectionTitle }),
            ...(isObjectiveType
              ? { options: JSON.stringify(options) }
              : questionType === "FillBlank"
                ? { correctAnswer: data.correctAnswer }
                : questionType === "Matching"
                  ? { pairs: JSON.stringify(matchingPairs) }
                  : questionType === "ShortAnswer"
                    ? { modelAnswer: data.modelAnswer }
                    : { rubricDescription: data.rubricDescription }),
          };
        }
      }


      const maybeAddToBank = async (forceAdd) => {
        if (isEditMode || !(addToBank || autoAddToBank || forceAdd)) return;
        await addQuestionToBank({
          questionPlainText,
          questionType,
          marks,
          difficultyLevel,
          options,
          bankSourceFields,
        });
      };

      // ── Editing a queued (not-yet-created) question in place ────────────
      // Nothing to save to the backend yet — just overwrite this slot in
      // pendingCreate/pendingEdit.questions and go back to a blank pending
      // form, mirroring how a fresh "Add more questions" queue entry is built
      // above, just replacing rather than appending.
      if (isEditingQueued) {
        const updatedItem = {
          ...queuedItem,
          data,
          addToBank,
          bank: { questionPlainText, questionType, marks, difficultyLevel, options, bankSourceFields },
          formSnapshot: queuedFormSnapshot,
        };
        const updatedQuestions = (queuedSource.questions || []).map((q, i) =>
          i === queuedIndex ? updatedItem : q,
        );
        if (isPendingCreation) {
          setPendingCreate({ ...pendingCreate, questions: updatedQuestions });
        } else {
          setPendingEdit({ ...pendingEdit, questions: updatedQuestions });
        }
        toast({
          description: "Queued question updated",
          position: "top",
          status: "success",
        });
        // Reset the form to a genuinely blank state before returning —
        // `reset()` alone doesn't touch the rich-text editor (its content
        // lives in `questionRichTextManager`'s own state, not react-hook-form),
        // so without this the question text stayed on screen after "Save
        // Changes". Submitting from there without typing anything new
        // resubmitted the identical, already-queued content as an extra
        // question on "Create and Submit" — the backend rejected it as a
        // duplicate ("assessment question already exists").
        reset();
        questionRichTextManager.handleInitData(null);
        setBankApplyKey((k) => k + 1);
        goToQueueAnotherQuestion();
        return;
      }

      if (isPendingCreation) {
        // "Add more questions" — nothing is created yet, so just stash this
        // question's already-built payload in `pendingCreate` and reopen a
        // blank (still-pending) form. It's created later, in one batch with
        // every other queued question, when "Create and Submit" finally runs.
        if (addAnotherRef.current) {
          addAnotherRef.current = false;
          const updatedQuestions = [
            ...(pendingCreate.questions || []),
            {
              data,
              addToBank,
              bank: { questionPlainText, questionType, marks, difficultyLevel, options, bankSourceFields },
              formSnapshot: queuedFormSnapshot,
            },
          ];
          setPendingCreate({ ...pendingCreate, questions: updatedQuestions });
          reset();
          // `reset()` doesn't touch the rich-text editor's own state — clear
          // it too so the next blank form doesn't still show this question's
          // text (which risked getting resubmitted as a duplicate).
          questionRichTextManager.handleInitData(null);
          setBankApplyKey((k) => k + 1);
          // This question is safely queued either way — only decide here
          // whether there's room left to offer another blank form, so
          // hitting the limit never costs the question just filled out.
          if (amountOfQuestions && updatedQuestions.length >= amountOfQuestions) {
            toast({
              description: `Question added. You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this ${isExamination ? "exam" : "assessment"} — submit this for approval to finish.`,
              position: "top",
              status: "info",
            });
            goToQueuedListing();
          } else {
            toast({
              description: "Question added. It'll be created once you submit this for approval.",
              position: "top",
              status: "success",
            });
            goToQueueAnotherQuestion();
          }
          return;
        }

        // Nothing exists yet. "createBoth" is the single unit of work that
        // actually saves anything — hand it to the approval modal so the
        // assigned supervisor (or an explicit null, for super admin) is
        // what triggers it.
        const createBoth = async () => {
          const parent = await performCreateParent();
          createdParentRef.current = parent;
          for (const queued of pendingCreate.questions || []) {
            await saveQuestion(parent.id, queued.data);
            if (queued.addToBank || pendingCreate.addToBank) {
              await addQuestionToBank(queued.bank);
            }
          }
          await saveQuestion(parent.id);
          // The exam-level "auto add every question" flag was just set on
          // the real ID above — the render-scoped `autoAddToBank` above is
          // still stale for this same call, so check the source directly.
          await maybeAddToBank(pendingCreate.addToBank);
          return { id: parent.id };
        };

        const requestType =
          pendingCreate.kind === "StandaloneExam"
            ? "StandaloneExam"
            : pendingCreate.kind === "ModuleExam" || pendingCreate.kind === "Exam"
              ? "CourseExam"
              : "CourseAssessment";
        const modalCourseId = courseId !== "not-set" ? courseId : undefined;

        pendingCreateBothRef.current = createBoth;
        setWorkflowContent({
          contentTitle: pendingCreate.title,
          requestType,
          courseId: modalCourseId,
        });
        setWorkflowModalOpen(true);
        return;
      }

      if (isPendingEditSubmit) {
        // Same deferral as the isPendingCreation branch above, but for a
        // shell that already exists: queue instead of saving right away.
        if (addAnotherRef.current) {
          addAnotherRef.current = false;
          const updatedQuestions = [
            ...(pendingEdit.questions || []),
            {
              data,
              addToBank,
              bank: { questionPlainText, questionType, marks, difficultyLevel, options, bankSourceFields },
              formSnapshot: queuedFormSnapshot,
            },
          ];
          setPendingEdit({ ...pendingEdit, questions: updatedQuestions });
          reset();
          // `reset()` doesn't touch the rich-text editor's own state — clear
          // it too so the next blank form doesn't still show this question's
          // text (which risked getting resubmitted as a duplicate).
          questionRichTextManager.handleInitData(null);
          setBankApplyKey((k) => k + 1);
          if (amountOfQuestions && updatedQuestions.length >= amountOfQuestions) {
            toast({
              description: `Question added. You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this ${isExamination ? "exam" : "assessment"} — submit this for approval to finish.`,
              position: "top",
              status: "info",
            });
            goToQueuedListing();
          } else {
            toast({
              description: "Question added. It'll be created once you submit this for approval.",
              position: "top",
              status: "success",
            });
            goToQueueAnotherQuestion();
          }
          return;
        }

        // The shell already exists — "editBoth" is the single unit of work
        // that actually changes anything, held back until the approval
        // modal's assigned supervisor (or an explicit null, for super
        // admin) triggers it.
        const editBoth = async () => {
          const parent = await performEditParent();
          createdParentRef.current = parent;
          for (const queued of pendingEdit.questions || []) {
            await saveQuestion(undefined, queued.data);
            if (queued.addToBank) {
              await addQuestionToBank(queued.bank);
            }
          }
          await saveQuestion();
          return { id: parent.id };
        };

        pendingCreateBothRef.current = editBoth;
        setWorkflowContent({
          contentId: pendingEdit.contentId,
          contentTitle: pendingEdit.title,
          requestType: pendingEdit.requestType,
          courseId: pendingEdit.courseId,
        });
        setWorkflowModalOpen(true);
        return;
      }

      if (submitForApprovalRef.current) {
        submitForApprovalRef.current = false;

        const requestType = isStandaloneExamination
          ? "StandaloneExam"
          : isExamination
            ? "CourseExam"
            : "CourseAssessment";
        const modalCourseId = courseId !== "not-set" ? courseId : undefined;

        pendingCreateBothRef.current = async () => {
          await saveQuestion();
          await maybeAddToBank();
          reset();
          assessmentManager.handleFetch(true);
          return { id: assessmentId, title: assessmentManager.assessment?.topic };
        };
        createdParentRef.current = { id: assessmentId };
        setWorkflowContent({
          contentId: assessmentId,
          contentTitle: assessmentManager.assessment?.topic,
          requestType,
          courseId: modalCourseId,
        });
        setWorkflowModalOpen(true);
        return;
      }

      const response = await saveQuestion();
      const message = response?.message || "Question saved successfully";
      await maybeAddToBank();

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      // Clean UP input
      reset();

      assessmentManager.handleFetch(true);

      if (isEditMode) {
        // After edit, go back to view mode
        const viewLink = getEditQuestionLink(
          courseId,
          assessmentId,
          questionId,
          isExamination,
        );
        push(viewLink);
      } else {
        finishSaving();
      }
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  // const deleteImage = async () => {
  //   if (question) {
  //     if (isStandaloneExamination)
  //       await adminDeleteStandaloneExaminationQuestionFile(question.id);
  //     else if (isExamination)
  //       await adminDeleteExaminationQuestionFile(question.id);
  //     else await adminDeleteAssessmentQuestionFile(question.id);
  //   }
  // };

  if (createdSuccess) {
    return (
      <Box padding={10} textAlign="center" width="70%">
        <Text bold fontSize="lg" mb={2}>
          Question added successfully!
        </Text>
        <Text color="gray.500" mb={6}>
          This {isExamination ? "exam" : "assessment"} is set for {amountOfQuestions} questions
          — add the rest now, or come back to it later.
        </Text>
        <Flex gap={4} justifyContent="center">
          <Button
            onClick={() => goToAddAnotherQuestion(createdSuccess.realParentId)}
          >
            Add more questions
          </Button>
          <Button
            secondary
            onClick={() => goToQuestionListing(createdSuccess.realParentId)}
          >
            Done for now
          </Button>
        </Flex>
      </Box>
    );
  }

  // where stuffs start
  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      padding={6}
      width={{ base: "100%", md: "100%", lg: "70%" }}
    >
      {/* ── Section tabs ("Exam with sections" only) ── */}
      {isSectionedExam && activeSections.length > 0 && (
        <Box paddingX="20px" paddingTop="16px" backgroundColor="white">
          <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
            Section
          </Text>
          <Tabs
            colorScheme="purple"
            index={Math.max(activeSections.indexOf(selectedSectionId), 0)}
            onChange={(idx) => setSelectedSectionId(activeSections[idx])}
          >
            <TabList borderBottom="1px solid" borderColor="accent.2">
              {activeSections.map((name) => (
                <Tab key={name || "__standalone__"} fontSize="sm">
                  {name || "Standalone Questions"}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>
      )}

      {realAddAtCapacity && (
        <Box paddingX="20px" paddingTop="16px">
          <Box bg="#FFF5EA" border="1px solid #F6AD55" borderRadius="8px" p="12px">
            <Text fontSize="13px" color="#7B341E">
              This {isExamination ? "exam" : "assessment"} is set for {amountOfQuestions} question
              {amountOfQuestions === 1 ? "" : "s"} — that many have already been added. Remove one
              first if you need to replace it, or head to <Text as="span" fontWeight="700">See All</Text> to
              review what's there.
            </Text>
          </Box>
        </Box>
      )}

      <Box
        paddingTop="20px"
        paddingX="20px"
        paddingBottom="60px"
        backgroundColor="white"
      >
        {isExistingQuestion && !isEditMode ? (
          <RichTextToView
            marginBottom={2}
            padding={2}
            backgroundColor="accent.1"
            flex={0.2}
            text={question?.question}
          />
        ) : (
          <RichText
            key={bankApplyKey}
            height="250px"
            id="question"
            label={getQuestionNumber(
              question && questionId !== "new"
                ? question.index
                : isEditingQueued
                  ? (assessmentManager.assessment?.questions?.length || 0) + queuedIndex
                  : assessmentManager.assessment?.questions?.length,
            )}
            placeholder="Enter your question here"
            onChange={questionRichTextManager.handleChange}
            defaultValue={questionRichTextManager.data.default}
          />
        )}
        <Box marginTop={8}>
          {isExistingQuestion && !isEditMode && !question?.file ? null : (
            <Upload
              id="coverImage"
              label="Question Image"
              onFileSelect={questionImageManager.handleFileSelect}
              imageUrl={questionImageManager.image.url}
              accept={questionImageManager.accept}
              disabled={isExistingQuestion && !isEditMode}
            />
          )}
        </Box>
      </Box>

      <Box marginTop={10} padding={6} backgroundColor="white">
        <Heading fontSize="heading.h4" mb={4}>
          Question Type & Answer
        </Heading>

        {/* Select from Question Bank — only shown in create mode */}
        {(!isExistingQuestion || isEditMode) && (
          <Box borderBottom="1px" borderColor="accent.2" pb={4} mb={6}>
            <Flex justifyContent="space-between" alignItems="center" mb={useBank ? 3 : 0}>
              <Text fontSize="sm" fontWeight="600" color="gray.700">
                Select from Question Bank
              </Text>
              <Switch
                isChecked={useBank}
                onChange={(e) => setUseBank(e.target.checked)}
                colorScheme="purple"
                size="sm"
              />
            </Flex>
            {useBank && (
              <Box backgroundColor="gray.50" borderRadius="md" p={3}>
                <Flex gap={2} mb={3}>
                  <ChakraInput
                    size="sm"
                    backgroundColor="white"
                    placeholder="Search bank questions..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchBank()}
                  />
                  <Button size="xs" onClick={searchBank} disabled={bankLoading}>
                    Search
                  </Button>
                </Flex>
                <Stack spacing={2} maxHeight="220px" overflowY="auto">
                  {bankResults.map((bq) => (
                    <Flex
                      key={bq.id}
                      justifyContent="space-between"
                      alignItems="center"
                      backgroundColor="white"
                      p={2}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      gap={3}
                    >
                      <Text fontSize="xs" noOfLines={2}>
                        {bq.question}
                      </Text>
                      <Button size="xs" onClick={() => applyBankQuestion(bq)}>
                        Use
                      </Button>
                    </Flex>
                  ))}
                  {!bankLoading && bankResults.length === 0 && (
                    <Text fontSize="xs" color="gray.400">
                      No matching questions found.
                    </Text>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Question type selector — only shown in create mode */}
        {(!isExistingQuestion || isEditMode) && (
          <Box borderBottom="1px" borderColor="accent.2" pb={4} mb={6}>
            {visibleQuestionTypes.length === 0 ? (
              <Text fontSize="sm" color="red.500">
                No question type is currently available here — every type is either
                locked out by this section or already at its configured Quantity.
                {isExamination && " Check "}
                {isExamination && (
                  <Link
                    href={`/admin/exam-paper-config/${isExamination}?examType=${isStandaloneExamination ? "standalone_examination" : "examination"}`}
                  >
                    <Text as="span" color="primary.base">Configure sections</Text>
                  </Link>
                )}
                {isExamination && " or adjust the Exam Type quantities."}
              </Text>
            ) : (
              <ButtonGroup size="xs" flexWrap="wrap" gap={2}>
                {visibleQuestionTypes.map((type) => (
                  <Button
                    key={type}
                    onClick={() => handleQuestionTypeClick(type)}
                    leftIcon={questionType === type && <BsCheckCircle />}
                    ghost={questionType !== type}
                    disabled={isExistingQuestion && !isEditMode}
                  >
                    {type === "TrueFalse"
                      ? "True / False"
                      : type === "FillBlank"
                        ? "Fill in the Blank"
                        : type === "ShortAnswer"
                          ? "Short Answer"
                          : type}
                  </Button>
                ))}
              </ButtonGroup>
            )}
            {allowedQuestionTypes && (
              <Text fontSize="xs" color="orange.500" mt={2}>
                Section &quot;{selectedSectionId}&quot; is locked to{" "}
                {allowedQuestionTypes.join(" / ")} questions.
              </Text>
            )}
            {usingTemplateTypeRestriction && (
              <Text fontSize="xs" color="orange.500" mt={2}>
                Limited to the question types set up in the marking template — once a
                type's Quantity is reached, it's no longer offered here.
              </Text>
            )}
          </Box>
        )}

        {/* Question metadata row */}
        {(!isExistingQuestion || isEditMode) && (
          <>
            <Flex gap={4} mb={4} flexWrap="wrap" alignItems="flex-end">
              <Box minW="180px">
                <Text fontSize="sm" mb={1} color="gray.600">
                  Marking Type
                </Text>
                <ChakraSelect
                  value={markingType}
                  onChange={(e) => handleMarkingTypeChange(e.target.value)}
                  size="sm"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="hybrid">Hybrid</option>
                </ChakraSelect>
                {allowedMarkingTypes && (
                  <Text fontSize="xs" color="orange.500" mt={1}>
                    Locked to {allowedMarkingTypes.join(" / ")} by this section.
                  </Text>
                )}
              </Box>
              {/* Difficulty — only for regular examination */}
              {isExamination && !isStandaloneExamination && (
                <>
                  <Box minW="160px">
                    <Text fontSize="sm" mb={1} color="gray.600">
                      Difficulty
                    </Text>
                    <ChakraSelect
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      size="sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </ChakraSelect>
                  </Box>
                </>
              )}
              {/* Section — populated from the exam's configured sections, or the
                  linked marking template. The tabs above already cover this for
                  "Exam with sections" and hybrid (including once either is
                  real, not just pending); this dropdown is only for
                  "without sections" or an exam with no Exam Type at all. */}
              {!isSectionedExam && (
                <Box minW="200px">
                  <Flex justifyContent="space-between" alignItems="baseline">
                    <Text fontSize="sm" mb={1} color="gray.600">
                      Section{" "}
                      {sectionsLoading && (
                        <Text as="span" fontSize="xs" color="gray.400">
                          (loading…)
                        </Text>
                      )}
                    </Text>
                    {isExamination && (
                      <Link
                        href={`/admin/exam-paper-config/${isExamination}?examType=${isStandaloneExamination ? "standalone_examination" : "examination"}`}
                      >
                        <Text fontSize="xs" color="primary.base">
                          Configure sections
                        </Text>
                      </Link>
                    )}
                  </Flex>
                  <ChakraSelect
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    size="sm"
                    disabled={sectionsLoading || activeSections.length === 0}
                    placeholder={
                      sectionsLoading
                        ? "Loading sections…"
                        : activeSections.length === 0
                          ? "No sections available"
                          : "Select a section"
                    }
                  >
                    {activeSections.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </ChakraSelect>
                  {!!selectedSectionConfig?.questionsCount && (
                    <Text
                      fontSize="xs"
                      color={sectionAtCapacity ? "red.500" : "gray.500"}
                      mt={1}
                    >
                      {existingSectionQuestionCount}/{selectedSectionConfig.questionsCount}{" "}
                      questions used
                      {sectionAtCapacity && " — section is full"}
                    </Text>
                  )}
                  {isExamination && !isStandaloneExamination && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {sectionMarks != null
                        ? `Marks: ${sectionMarks} (from section weightage)`
                        : "Marks: distributed equally at marking time"}
                    </Text>
                  )}
                </Box>
              )}
            </Flex>
          </>
        )}

        {/* MCQ */}
        {(questionType === "MCQ" ||
          (isExistingQuestion &&
            !isEditMode &&
            !["FillBlank", "Matching", "ShortAnswer", "Essay"].includes(
              questionType,
            ))) &&
          questionType !== "TrueFalse" && (
            <Stack direction="column">
              <Text paddingBottom={4} color="gray.500">
                Select the correct answer
              </Text>
              {[1, 2, 3, 4].map((num) => (
                <Flex key={num} flexDirection="row" paddingBottom={6}>
                  <Flex paddingTop={12} paddingRight={6}>
                    <input
                      disabled={isExistingQuestion && !isEditMode}
                      type="radio"
                      checked={answer === `${num}`}
                      onChange={handleAnswerChange}
                      name="radio"
                      value={`${num}`}
                      id={`radio-${num}`}
                    />
                  </Flex>
                  <Input
                    disabled={isExistingQuestion && !isEditMode}
                    id={`option-${num}`}
                    label={`Option 0${num}`}
                    {...register(`option-${num}`, { required: true })}
                    placeholder={`Enter option ${num} here`}
                  />
                </Flex>
              ))}
            </Stack>
          )}

        {/* True / False */}
        {questionType === "TrueFalse" && (
          <Stack direction="column">
            <Text paddingBottom={4} color="gray.500">
              Select the correct answer
            </Text>
            {["True", "False"].map((label, i) => (
              <Flex key={label} flexDirection="row" paddingBottom={6}>
                <Flex paddingTop={12} paddingRight={6}>
                  <input
                    disabled={isExistingQuestion && !isEditMode}
                    type="radio"
                    checked={answer === `${i + 1}`}
                    onChange={handleAnswerChange}
                    name="radio"
                    value={`${i + 1}`}
                    id={`radio-${i + 1}`}
                  />
                </Flex>
                <Input
                  id={`option-${i + 1}`}
                  label={label}
                  value={label}
                  readOnly
                  {...register(`option-${i + 1}`)}
                />
              </Flex>
            ))}
          </Stack>
        )}

        {/* Fill in the Blank */}
        {questionType === "FillBlank" && (
          <Box>
            <Text paddingBottom={4} color="gray.500">
              Provide the correct answer for the blank
            </Text>
            <Input
              label="Correct Answer"
              isRequired
              placeholder="e.g. Paris"
              disabled={isExistingQuestion && !isEditMode}
              {...register("correctAnswer", {
                required: "Correct answer is required",
              })}
            />
          </Box>
        )}

        {/* Matching */}
        {questionType === "Matching" && (
          <Box>
            <Text paddingBottom={4} color="gray.500">
              Add matching pairs (left → right)
            </Text>
            {matchingPairs.map((pair, idx) => (
              <Flex key={idx} gap={4} mb={4} alignItems="flex-end">
                <Box flex={1}>
                  <Input
                    label={`Left ${idx + 1}`}
                    placeholder="e.g. H2O"
                    value={pair.left}
                    disabled={isExistingQuestion && !isEditMode}
                    onChange={(e) =>
                      handlePairChange(idx, "left", e.target.value)
                    }
                  />
                </Box>
                <Box flex={1}>
                  <Input
                    label={`Right ${idx + 1}`}
                    placeholder="e.g. Water"
                    value={pair.right}
                    disabled={isExistingQuestion && !isEditMode}
                    onChange={(e) =>
                      handlePairChange(idx, "right", e.target.value)
                    }
                  />
                </Box>
                {!(isExistingQuestion && !isEditMode) &&
                  matchingPairs.length > 1 && (
                    <Button
                      ghost
                      onClick={() => handleRemovePair(idx)}
                      type="button"
                      mb={2}
                    >
                      Remove
                    </Button>
                  )}
              </Flex>
            ))}
            {!(isExistingQuestion && !isEditMode) && (
              <Button ghost onClick={handleAddPair} type="button" mt={2}>
                + Add Pair
              </Button>
            )}
          </Box>
        )}

        {/* Short Answer */}
        {questionType === "ShortAnswer" && (
          <Box>
            <Box backgroundColor="blue.50" borderRadius="md" p={3} mb={4}>
              <Text color="blue.700" fontSize="sm">
                This question type is manually graded by the instructor.
              </Text>
            </Box>
            <Input
              label="Model Answer"
              placeholder="Enter the expected model answer"
              disabled={isExistingQuestion && !isEditMode}
              {...register("modelAnswer")}
            />
          </Box>
        )}

        {/* Essay */}
        {questionType === "Essay" && (
          <Box>
            <Box backgroundColor="blue.50" borderRadius="md" p={3} mb={4}>
              <Text color="blue.700" fontSize="sm">
                Essay questions are manually graded by the instructor using the
                rubric defined in the marking template.
              </Text>
            </Box>
            <Input
              label="Rubric Description (optional)"
              placeholder="e.g. Clarity (5pts), Depth (5pts)"
              disabled={isExistingQuestion && !isEditMode}
              {...register("rubricDescription")}
            />
          </Box>
        )}

        {/* Add to Question Bank — only offered while creating a brand-new question */}
        {!isExistingQuestion && (
          <Box borderTop="1px" borderColor="accent.2" pt={4} mt={6}>
            <Checkbox
              isChecked={addToBank}
              onChange={(e) => setAddToBank(e.target.checked)}
              isDisabled={autoAddToBank}
              colorScheme="purple"
            >
              Add to Question Bank
            </Checkbox>
            {autoAddToBank && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Auto-enabled — this exam was set to add every question to the bank on creation.
              </Text>
            )}
          </Box>
        )}
      </Box>
      <Flex justifyContent="flex-end" paddingTop={8} gap={4}>
        {isExistingQuestion && !isEditMode && (
          <Button
            onClick={() => {
              const editLink = appendEditParam(
                getEditQuestionLink(
                  courseId,
                  assessmentId,
                  questionId,
                  isExamination,
                ),
              );
              push(editLink);
            }}
          >
            Edit Question
          </Button>
        )}
        {isEditMode && (
          <Button
            ghost
            onClick={() => {
              const viewLink = getEditQuestionLink(
                courseId,
                assessmentId,
                questionId,
                isExamination,
              );
              push(viewLink);
            }}
          >
            Cancel
          </Button>
        )}
        {isEditingQueued && (
          <Button ghost onClick={goToQueueAnotherQuestion} type="button">
            Cancel
          </Button>
        )}
        {isEditingQueued && (
          <Button ghost onClick={handleRemoveQueuedQuestion} type="button">
            Remove Question
          </Button>
        )}
        <Button
          type={isPendingCreation && !isEditingQueued ? "button" : "submit"}
          onClick={() => {
            // "Create and Submit" here used to hand off to the
            // WorkflowSubmitModal/createBoth approval flow, but that flow is
            // broken — so this just navigates to the question list (same
            // link "See All" uses) instead of trying to create anything.
            if (isPendingCreation && !isEditingQueued) {
              push(
                `${getQuestionListingLink(
                  courseId,
                  assessmentId,
                  isExamination,
                  moduleId,
                )}&submitForApproval=1`,
              );
              return;
            }
            addAnotherRef.current = false;
            submitForApprovalRef.current = false;
          }}
          disabled={isLoading || isSubmitting || error || realAddAtCapacity}
          isLoading={isLoading || isSubmitting}
        >
          {isExistingQuestion && !isEditMode
            ? "Delete Question"
            : isEditMode
              ? "Update Question"
              : isEditingQueued
                ? "Save Changes"
                : isPendingCreation
                  ? "Create and Submit"
                  : isPendingEditSubmit
                    ? "Update and Submit"
                    : "Add Question"}
        </Button>
        {!isExistingQuestion && !isEditMode && !isPendingCreation && !isPendingEditSubmit && (
          <Button
            type="submit"
            ghost
            onClick={() => {
              addAnotherRef.current = false;
              submitForApprovalRef.current = true;
            }}
            disabled={isLoading || isSubmitting || error}
            isLoading={isLoading || isSubmitting}
          >
            Create and Submit
          </Button>
        )}
        {(isPendingCreation || isPendingEditSubmit) &&
          !isEditingQueued &&
          !(
            amountOfQuestions &&
            ((isPendingCreation ? pendingCreate?.questions : pendingEdit?.questions)?.length || 0) >=
              amountOfQuestions
          ) && (
            <Button
              type="submit"
              ghost
              onClick={() => {
                // The limit is enforced after this question is safely
                // queued (in onSubmit) — never before, so reaching it never
                // costs the question just filled out on this form.
                addAnotherRef.current = true;
              }}
              disabled={isLoading || isSubmitting || error}
              isLoading={isLoading || isSubmitting}
            >
              Add more questions
            </Button>
          )}
        {isEditMode && (
          <Button
            ghost
            link={getEditQuestionLink(
              courseId,
              assessmentId,
              "new",
              isExamination,
            )}
          >
            Create and Submit
          </Button>
        )}
      </Flex>

      {workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          courseId={workflowContent.courseId}
          onCreate={() => pendingCreateBothRef.current()}
          onSuccess={() => finishSaving(createdParentRef.current?.id)}
        />
      )}

      <SelectBankQuestionsModal
        isOpen={isBankPickerOpen}
        onClose={closeBankPicker}
        onAdd={isPendingCreation || isPendingEditSubmit ? queueBankQuestions : saveBankQuestionsForReal}
      />
    </Box>
  );
};

// Rebuilds a full edit-question payload (mirroring onSubmit's edit-mode
// branches above) from a question's already-fetched, stored data rather
// than live form state — so section (re)assignment from the Listing page
// can resave a question for real, through the same endpoints the question
// form uses, without needing the form to be open.
const buildQuestionEditPayload = (
  question,
  section,
  { isExamination, isStandaloneExamination },
) => {
  const isObjectiveType =
    question.questionType === "MCQ" || question.questionType === "TrueFalse";
  const options = (question.options || []).map((opt) => ({
    id: opt.id,
    name: opt.name,
    isAnswer: opt.isAnswer,
    optionIndex: opt.optionIndex,
  }));

  if (isStandaloneExamination) {
    return {
      standAloneExaminationQuestionId: question.id,
      question: question.question,
      ...(section !== undefined && { section }),
      markingType: question.markingType || "automatic",
      ...(isObjectiveType && { options }),
    };
  }

  const meta = {
    marks: Number(question.marks) || 1,
    markingType: question.markingType || "automatic",
    ...(section !== undefined && { section }),
    ...(question.rubric && { rubric: question.rubric }),
    difficultyLevel: question.difficultyLevel || "medium",
    ...(question.bloomLevel && { bloomLevel: question.bloomLevel }),
  };

  const typeSpecificFields = isObjectiveType
    ? {}
    : question.questionType === "FillBlank"
      ? { correctAnswer: question.correctAnswer }
      : question.questionType === "Matching"
        ? { pairs: JSON.stringify(question.pairs) }
        : question.questionType === "ShortAnswer"
          ? { modelAnswer: question.modelAnswer }
          : { rubricDescription: question.rubric };

  if (isExamination) {
    return {
      question: JSON.stringify({
        id: question.id,
        question: question.question,
        examinationId: isExamination,
        ...meta,
        questionType: question.questionType,
      }),
      ...(isObjectiveType
        ? {
            options: JSON.stringify(
              options.map((opt) => ({
                ...opt,
                examinationQuestionId: question.id,
              })),
            ),
          }
        : typeSpecificFields),
    };
  }

  return {
    questionId: question.id,
    question: question.question,
    markingType: meta.markingType,
    questionType: question.questionType,
    ...(section !== undefined && { section }),
    ...(isObjectiveType
      ? { options: JSON.stringify(options) }
      : typeSpecificFields),
  };
};

const persistQuestionSection = (
  question,
  section,
  { isExamination, isStandaloneExamination },
) => {
  const payload = buildQuestionEditPayload(question, section, {
    isExamination,
    isStandaloneExamination,
  });
  if (isStandaloneExamination)
    return adminEditStandaloneExaminationQuestion(payload);
  if (isExamination)
    return adminEditExaminationQuestion(appendFormData(payload));
  return adminEditAssessmentQuestion(appendFormData(payload));
};

const QuestionListingPage = ({
  assessment,
  isLoading,
  error,
  handleFetch,
  configuredSections,
  setConfiguredSections,
}) => {
  const { id: courseId, assessmentId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const moduleId = useQueryParams().get("moduleId");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const toast = useToast();
  const isSuperAdmin = useIsSuperAdmin();
  const { push } = useHistory();
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const clearPendingEdit = useAssessmentStore((s) => s.clearPendingEdit);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [hasSubmittedForApproval, setHasSubmittedForApproval] = useState(false);
  // Only content created via the batch-upload shortcut (which bypasses the
  // approval modal to get a real id for the upload endpoint) ever needs
  // this — normal "Create and Submit" already submits for approval in one
  // step, and so does the "Create and Submit" button on the plain
  // "Add Question" form for already-real content.
  const needsSubmit =
    hasSubmittedForApproval ||
    needsApprovalSubmission(
      isStandaloneExamination ? "standalone" : isExamination ? "examination" : "assessment",
      assessment?.id,
    );

  // Same pending-creation/pending-edit-submit deferral as QuestionsPage/
  // CreateQuestionPage — while the parent exam/assessment doesn't exist yet
  // (or its edit is held back), questions queued via "Add more questions"
  // only live in the store, not in a fetched `assessment.questions`.
  const submitForApproval = useQueryParams().get("submitForApproval") === "1";
  const editSubmit = useQueryParams().get("editSubmit") === "1";
  const isPendingCreation = submitForApproval;
  const isPendingEditSubmit = !submitForApproval && editSubmit;
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);
  const isBankPickerOpen = useAssessmentStore((s) => s.isBankPickerOpen);
  const closeBankPicker = useAssessmentStore((s) => s.closeBankPicker);
  const queuedQuestions =
    (isPendingCreation ? pendingCreate?.questions : isPendingEditSubmit ? pendingEdit?.questions : null) || [];

  // How many questions this exam/assessment was configured for, and how many
  // already count against that (real ones already saved plus anything
  // already queued) — same cap CreateQuestionPage's "Add more questions"
  // enforces, applied here too so importing from the Question Bank can't
  // blow past it.
  const amountOfQuestions =
    Number(pendingCreate?.body?.amountOfQuestions ?? pendingEdit?.body?.amountOfQuestions ?? assessment?.amountOfQuestions) ||
    null;
  const questionsSoFar = (assessment?.questions?.length || 0) + queuedQuestions.length;
  const remainingQuestionSlots = amountOfQuestions ? Math.max(0, amountOfQuestions - questionsSoFar) : null;
  const overLimitDescription = `You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this ${isExamination ? "exam" : "assessment"} — you can't add any more.`;

  // No form is open here, so a bank pick made from this page never has a
  // "current section" to inherit or a section-type lock to respect.
  const bankQueueCtx = { isStandaloneExamination, isExamination, assessmentId };

  // Same Exam-Type-driven per-type Quantity cap as CreateQuestionPage (see
  // buildTypeQuotaState above) — no section is ever selected from this
  // page, so a hybrid exam's standalone-quantity pool always applies here.
  const {
    usingTemplateTypeRestriction,
    templateSupportedTypes,
    queuedTypeCounts,
    typeQuota,
  } = buildTypeQuotaState({
    pendingSource: isPendingCreation ? pendingCreate : isPendingEditSubmit ? pendingEdit : null,
    isPending: isPendingCreation || isPendingEditSubmit,
    realExamType: assessment?.examType,
    realQuestionQuantity: assessment?.questionQuantity,
    realQuestions: assessment?.questions,
    selectedSectionId: undefined,
    isEditingQueued: false,
    queuedIndex: null,
  });
  const getBankQuestionType = (bq) => BANK_TYPE_TO_FORM_TYPE[bq.questionType] || "Essay";
  const quotaFilterCtx = { usingTemplateTypeRestriction, templateSupportedTypes, typeQuota, queuedTypeCounts };
  const quotaSkippedToast = (skipped) =>
    skipped ? ` ${skipped} skipped — already at the configured Quantity for that type.` : "";

  // Header's "Question Bank" button opens this same in-page picker from
  // whichever sub-view (form or listing) is active — while the parent is
  // still pending, a pick is queued the same way "Add more questions" does;
  // once it's real, a pick is created immediately and refetched so it shows
  // up here right away, clickable to edit like any other question.
  const queueBankQuestionsFromListing = (bankQuestions) => {
    if (remainingQuestionSlots === 0) {
      toast({ description: overLimitDescription, position: "top", status: "error" });
      return;
    }
    const overLimit = remainingQuestionSlots !== null && bankQuestions.length > remainingQuestionSlots;
    const cappedBankQuestions = overLimit ? bankQuestions.slice(0, remainingQuestionSlots) : bankQuestions;
    const { kept, skipped: skippedForQuota } = filterBankQuestionsByTypeQuota(
      cappedBankQuestions,
      quotaFilterCtx,
      getBankQuestionType,
    );
    const items = kept.map((bq) => buildBankQueueItem(bq, bankQueueCtx)).filter(Boolean);
    if (!items.length) {
      if (skippedForQuota) {
        toast({
          description: `Skipped ${skippedForQuota} question${skippedForQuota === 1 ? "" : "s"} — already at the configured Quantity for that type.`,
          position: "top",
          status: "warning",
        });
      }
      return;
    }

    if (isPendingCreation) {
      setPendingCreate({ ...pendingCreate, questions: [...(pendingCreate.questions || []), ...items] });
    } else if (isPendingEditSubmit) {
      setPendingEdit({ ...pendingEdit, questions: [...(pendingEdit.questions || []), ...items] });
    }

    toast({
      description: overLimit
        ? `Only added ${items.length} of ${bankQuestions.length} — ${overLimitDescription}`
        : `${items.length} question${items.length === 1 ? "" : "s"} added from the bank.${quotaSkippedToast(skippedForQuota)} They'll be created once you submit for approval.`,
      position: "top",
      status: overLimit ? "warning" : "success",
    });
  };

  const saveBankQuestionsForReal = async (bankQuestions) => {
    if (remainingQuestionSlots === 0) {
      toast({ description: overLimitDescription, position: "top", status: "error" });
      return;
    }
    const overLimit = remainingQuestionSlots !== null && bankQuestions.length > remainingQuestionSlots;
    const cappedBankQuestions = overLimit ? bankQuestions.slice(0, remainingQuestionSlots) : bankQuestions;
    const { kept, skipped: skippedForQuota } = filterBankQuestionsByTypeQuota(
      cappedBankQuestions,
      quotaFilterCtx,
      getBankQuestionType,
    );
    const items = kept.map((bq) => buildBankQueueItem(bq, bankQueueCtx)).filter(Boolean);
    if (!items.length) {
      if (skippedForQuota) {
        toast({
          description: `Skipped ${skippedForQuota} question${skippedForQuota === 1 ? "" : "s"} — already at the configured Quantity for that type.`,
          position: "top",
          status: "warning",
        });
      }
      return;
    }
    try {
      for (const item of items) {
        await createBankQuestionForReal(item.data, { isStandaloneExamination, isExamination });
      }
      handleFetch(true);
      toast({
        description: overLimit
          ? `Only added ${items.length} of ${bankQuestions.length} — ${overLimitDescription}`
          : `${items.length} question${items.length === 1 ? "" : "s"} added from the bank.${quotaSkippedToast(skippedForQuota)}`,
        position: "top",
        status: overLimit ? "warning" : "success",
      });
    } catch (err) {
      toast({
        description: err?.response?.data?.message || "Failed to add question(s) from the bank",
        position: "top",
        status: "error",
      });
    }
  };

  // Queued questions only live in the store — nothing to delete on the
  // backend, just splice the slot out of pendingCreate/pendingEdit.
  const handleRemoveQueuedQuestion = (index) => {
    if (!window.confirm("Remove this queued question? It hasn't been created yet.")) return;
    const updatedQuestions = queuedQuestions.filter((_, i) => i !== index);
    if (isPendingCreation) {
      setPendingCreate({ ...pendingCreate, questions: updatedQuestions });
    } else {
      setPendingEdit({ ...pendingEdit, questions: updatedQuestions });
    }
    toast({ description: "Queued question removed", position: "top", status: "success" });
  };

  // ── Creates (or applies the held-back edit to) the exam/assessment and
  // saves every queued question, all gated behind the approval modal's
  // supervisor pick — same split as CreateQuestionPage's "Create and
  // Submit"/"Update and Submit", but reachable straight from this listing
  // view instead of requiring a detour through a (possibly blank) question
  // form. Mirrors QuestionsStandalone.jsx's own listing-view version of this
  // same button.
  const [pendingWorkflowModalOpen, setPendingWorkflowModalOpen] = useState(false);
  const [pendingWorkflowContent, setPendingWorkflowContent] = useState(null);
  const createdParentRef = useRef(null);
  const savedQueueItemsRef = useRef(new WeakSet());

  const performCreateParent = async () => {
    const { kind, body, paperConfigBody, addToBank: parentAddToBank } = pendingCreate;

    if (kind === "ModuleExam" || kind === "Exam") {
      const { examination } = await adminCreateExamination(body);
      if (kind === "ModuleExam") {
        await updateExamPaperConfig(examination.id, paperConfigBody).catch(() => {});
      }
      if (parentAddToBank) setAutoAddToBank("examination", examination.id);
      setAssessment({ ...examination, sections: paperConfigBody?.configuredSections || [] });
      return { id: examination.id };
    }

    if (kind === "StandaloneExam") {
      const { examination } = await adminCreateStandaloneExamination(body);
      setAssessment(examination);
      return { id: examination.id };
    }

    const { assessment: created } = await adminCreateAssessment(body);
    setAssessment(created);
    if (parentAddToBank) setAutoAddToBank("assessment", created.id);
    return { id: created.id };
  };

  const performEditParent = async () => {
    const { kind, contentId, body, paperConfigBody } = pendingEdit;

    if (kind === "StandaloneExam") {
      await adminEditStandaloneExamination(contentId, body);
      if (paperConfigBody) await updateExamPaperConfig(contentId, paperConfigBody).catch(() => {});
      return { id: contentId };
    }

    if (kind === "ModuleExam" || kind === "Exam") {
      await adminEditExamination(contentId, body);
      if (paperConfigBody) await updateExamPaperConfig(contentId, paperConfigBody).catch(() => {});
      return { id: contentId };
    }

    await adminEditAssessment(contentId, body);
    return { id: contentId };
  };

  const handlePendingWorkflowCreate = async () => {
    const parent =
      createdParentRef.current ||
      (isPendingCreation ? await performCreateParent() : await performEditParent());
    createdParentRef.current = parent;
    for (const queued of queuedQuestions) {
      if (savedQueueItemsRef.current.has(queued)) continue;
      await createBankQuestionForReal(
        isPendingCreation
          ? {
              ...queued.data,
              ...(isStandaloneExamination
                ? { standAloneExaminationId: parent.id }
                : isExamination
                  ? { examinationId: parent.id }
                  : { assessmentId: parent.id }),
            }
          : queued.data,
        { isStandaloneExamination, isExamination },
      );
      savedQueueItemsRef.current.add(queued);
    }
    return { id: parent.id };
  };

  const handleOpenCreateAndSubmit = () => {
    if (isPendingCreation) {
      const requestType =
        pendingCreate.kind === "StandaloneExam"
          ? "StandaloneExam"
          : pendingCreate.kind === "ModuleExam" || pendingCreate.kind === "Exam"
            ? "CourseExam"
            : "CourseAssessment";
      setPendingWorkflowContent({
        contentTitle: pendingCreate.title,
        requestType,
        courseId: courseId !== "not-set" ? courseId : undefined,
      });
    } else {
      setPendingWorkflowContent({
        contentId: pendingEdit.contentId,
        contentTitle: pendingEdit.title,
        requestType: pendingEdit.requestType,
        courseId: pendingEdit.courseId,
      });
    }
    setPendingWorkflowModalOpen(true);
  };

  const handlePendingWorkflowSuccess = () => {
    const realParentId = createdParentRef.current?.id;
    const editNextRoute = pendingEdit?.nextRoute;
    clearPendingCreate();
    clearPendingEdit();
    const finalAssessmentId = isExamination ? courseId : (realParentId ?? assessmentId);
    const finalExamination = isExamination ? realParentId : undefined;
    push(
      isPendingEditSubmit && editNextRoute
        ? editNextRoute
        : getQuestionListingLink(courseId, finalAssessmentId, finalExamination, moduleId),
    );
  };

  const questions = Array.isArray(assessment?.questions)
    ? assessment.questions
    : [];

  // Sections belong to the exam (like a Google Form), not to any one
  // question — Examinations/Standalone Examinations store them in the
  // exam's own `configuredSections`; plain Assessments in the assessment's
  // own `sections` field. Either way, every question just carries the
  // section's name in its real `section` field.
  const rawSections = isExamination
    ? configuredSections
    : Array.isArray(assessment?.sections)
      ? assessment.sections
      : [];
  const definedSectionNames = rawSections.map((s) => s.section_name).filter(Boolean);
  // Confirmed via a real GET /v1/assessment/admin/:id response: a plain
  // Assessment's own record carries no `sections` field at all, even for
  // one created sectioned — only each question's own `section` string
  // survives. Fall back to deriving the section list from whichever names
  // actually show up on the questions, in first-seen order, so the listing
  // below can still group by section without that formal definition (locks/
  // caps/weightage from `sectionConfigMap` are simply unavailable in this
  // fallback case — nothing here can restore data the backend never sent).
  const sectionNames = definedSectionNames.length
    ? definedSectionNames
    : [...new Set(questions.map((q) => q.section).filter(Boolean))];
  // Same lock/weightage/count-cap lookup CreateQuestionPage uses — lets this
  // page show each section's "x/N questions" limit for visibility.
  const sectionConfigMap = buildSectionConfigMap(rawSections, "exam");
  const scrollToSection = (name) =>
    document
      .getElementById(`section-${name}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const [reassigningId, setReassigningId] = useState(null);

  const questionsIsEmpty = !isLoading && !error && !questions.length && !queuedQuestions.length;

  const buildAddLink = (sectionName) => {
    const base = `/admin/courses/${courseId}/assessment/${assessmentId}/questions/new`;
    const parts = [
      isExamination && `examination=${isExamination}`,
      sectionName && `section=${encodeURIComponent(sectionName)}`,
    ].filter(Boolean);
    return parts.length ? `${base}?${parts.join("&")}` : base;
  };

  const handleAssign = async (question, sectionName) => {
    setReassigningId(question.id);
    try {
      await persistQuestionSection(question, sectionName, {
        isExamination,
        isStandaloneExamination,
      });
      handleFetch(true);
    } catch (err) {
      toast({
        description:
          err?.response?.data?.message || "Failed to update the question's section",
        position: "top",
        status: "error",
      });
    } finally {
      setReassigningId(null);
    }
  };

  const unassigned = questions.filter((q) => !q.section);

  return (
    <Box padding={6} width="70%">
      {isLoading && <PageLoaderLayout height="70%" width="100%" />}

      {questionsIsEmpty && !sectionNames.length && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3}>
            No Questions Asked Yet
          </Heading>
          <Text as="level3" marginBottom={7}>
            Add a section below or create a question directly.
          </Text>
        </PageLoaderLayout>
      )}

      {error && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3} color="red.500">
            {capitalizeWords(error)}
          </Heading>
        </PageLoaderLayout>
      )}

      {/* ── Section quick-nav ── */}
      {sectionNames.length > 1 && (
        <Flex gap={2} flexWrap="wrap" mb={6}>
          {sectionNames.map((name, si) => (
            <Button
              key={name}
              size="xs"
              ghost
              onClick={() => scrollToSection(name)}
            >
              {si + 1}. {name}
            </Button>
          ))}
        </Flex>
      )}

      {/* ── Sections ── */}
      {sectionNames.map((name, si) => {
        const sectionQs = questions.filter((q) => q.section === name);
        const sectionCap = sectionConfigMap[name]?.questionsCount;
        return (
          <Box
            key={name}
            id={`section-${name}`}
            marginBottom={8}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
          >
            {/* Section header */}
            <Flex
              alignItems="center"
              gap={3}
              px={5}
              py={3}
              backgroundColor="primary.base"
            >
              <Heading fontSize="heading.h5" color="white" flex={1}>
                Section {si + 1}: {name}
                {!!sectionCap && (
                  <Text
                    as="span"
                    fontSize="xs"
                    fontWeight="normal"
                    color="whiteAlpha.800"
                    ml={2}
                  >
                    ({sectionQs.length}/{sectionCap}
                    {sectionQs.length >= sectionCap ? " — full" : ""})
                  </Text>
                )}
              </Heading>
            </Flex>

            {/* Section questions */}
            <Box px={5} pt={4} pb={2}>
              {sectionQs.length === 0 && (
                <Box
                  padding={4}
                  backgroundColor="gray.50"
                  textAlign="center"
                  borderRadius="md"
                  mb={4}
                >
                  <Text color="gray.400">
                    No questions in this section yet.
                  </Text>
                </Box>
              )}
              {sectionQs.map((q, index) => (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  questionNumber={getQuestionNumber(index)}
                  question={q.question}
                  image={q.file}
                  marginBottom={4}
                  sections={sectionNames}
                  currentSection={name}
                  assigning={reassigningId === q.id}
                  onAssign={(sectionName) => handleAssign(q, sectionName)}
                  onUnassign={() => handleAssign(q, undefined)}
                />
              ))}
              <Box pb={4}>
                <Button link={buildAddLink(name)} size="sm" ghost>
                  + Add Question to this Section
                </Button>
              </Box>
            </Box>
          </Box>
        );
      })}

      {/* ── Unassigned / no-section questions ── */}
      {(unassigned.length > 0 || sectionNames.length === 0) && (
        <Box marginBottom={8}>
          {sectionNames.length > 0 && (
            <Flex
              alignItems="center"
              mb={4}
              pb={2}
              borderBottom="1px"
              borderColor="gray.300"
            >
              <Heading fontSize="heading.h5" color="gray.500">
                Unassigned Questions
              </Heading>
            </Flex>
          )}

          {unassigned.map((q, index) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              questionNumber={getQuestionNumber(index)}
              question={q.question}
              image={q.file}
              marginBottom={4}
              sections={sectionNames}
              currentSection={null}
              assigning={reassigningId === q.id}
              onAssign={(sectionName) => handleAssign(q, sectionName)}
              onUnassign={() => handleAssign(q, undefined)}
            />
          ))}

          <Box paddingTop={4}>
            {remainingQuestionSlots === 0 ? (
              <Text color="gray.500">{overLimitDescription}</Text>
            ) : (
              <Button link={buildAddLink(null)}>Add more questions</Button>
            )}
          </Box>
        </Box>
      )}

      {/* ── Queued questions — added via "Add more questions" but not yet
          created. No real id/section exists for these until the whole batch
          is saved on submit, so they link to an edit-in-place view keyed by
          their queue index instead of a real question id. ── */}
      {queuedQuestions.length > 0 && (
        <Box marginBottom={8}>
          <Flex
            alignItems="center"
            mb={4}
            pb={2}
            borderBottom="1px"
            borderColor="gray.300"
          >
            <Heading fontSize="heading.h5" color="gray.500">
              Queued Questions (not yet created)
            </Heading>
          </Flex>

          {queuedQuestions.map((q, index) => (
            <Flex key={`queued-${index}`} alignItems="center" gap={2} marginBottom={4}>
              <Link
                style={{ flex: 1 }}
                href={getEditQueuedQuestionLink(
                  courseId,
                  assessmentId,
                  isExamination,
                  moduleId,
                  index,
                  isPendingCreation ? "submitForApproval" : "editSubmit",
                )}
              >
                <Box
                  padding={4}
                  backgroundColor="gray.50"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ backgroundColor: "gray.100" }}
                >
                  <Text bold mb={1}>
                    {questions.length + index + 1}. {capitalizeWords(q.bank?.questionType || "")}
                  </Text>
                  <Text color="gray.600">
                    {q.bank?.questionPlainText || "(no preview available)"}
                  </Text>
                </Box>
              </Link>
              <Button
                ghost
                type="button"
                onClick={() => handleRemoveQueuedQuestion(index)}
                aria-label="Remove question"
              >
                Remove
              </Button>
            </Flex>
          ))}

          {(isPendingCreation || isPendingEditSubmit) && (
            <Button ghost onClick={handleOpenCreateAndSubmit}>
              {isPendingCreation ? "Create and Submit" : "Update and Submit"}
            </Button>
          )}
        </Box>
      )}

      {(isPendingCreation || isPendingEditSubmit) && pendingWorkflowContent && (
        <WorkflowSubmitModal
          isOpen={pendingWorkflowModalOpen}
          onClose={() => setPendingWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={pendingWorkflowContent.contentId}
          contentTitle={pendingWorkflowContent.contentTitle}
          requestType={pendingWorkflowContent.requestType}
          courseId={pendingWorkflowContent.courseId}
          onCreate={handlePendingWorkflowCreate}
          onSuccess={handlePendingWorkflowSuccess}
        />
      )}

      <SelectBankQuestionsModal
        isOpen={isBankPickerOpen}
        onClose={closeBankPicker}
        onAdd={isPendingCreation || isPendingEditSubmit ? queueBankQuestionsFromListing : saveBankQuestionsForReal}
      />

      {/* Only shown for content created via the batch-upload shortcut, which
          bypasses the approval modal to get a real id for the upload
          endpoint before any questions exist — see `markNeedsApprovalSubmission`
          in `handleBatchUploadClick` above. */}
      {needsSubmit && !questionsIsEmpty && (
        <Box paddingTop={5} borderTop="1px" borderColor="gray.200" marginTop={4}>
          <Button
            ghost
            disabled={hasSubmittedForApproval}
            onClick={() => setWorkflowModalOpen(true)}
          >
            {hasSubmittedForApproval ? "Submitted for Approval" : "Submit for Approval"}
          </Button>
        </Box>
      )}

      {needsSubmit && !questionsIsEmpty && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={assessment.id}
          contentTitle={assessment.topic}
          requestType={
            isStandaloneExamination ? "StandaloneExam" : isExamination ? "CourseExam" : "CourseAssessment"
          }
          courseId={courseId !== "not-set" ? courseId : undefined}
          onSuccess={() => {
            clearNeedsApprovalSubmission(
              isStandaloneExamination ? "standalone" : isExamination ? "examination" : "assessment",
              assessment.id,
            );
            setHasSubmittedForApproval(true);
          }}
        />
      )}
    </Box>
  );
};

const QuestionCard = ({
  questionNumber,
  question,
  image,
  id,
  sections,
  currentSection,
  assigning,
  onAssign,
  onUnassign,
  ...rest
}) => {
  const { id: courseId, assessmentId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const editLink = getEditQuestionLink(
    courseId,
    assessmentId,
    id,
    isExamination,
  );

  const { resource: deleteRequest, handleFetchResource } = useFetch();
  const toast = useToast();

  const handleDelete = () => {
    const ok = window.confirm("Are you sure you want to delete this question?");
    if (!ok) return;

    handleFetchResource({
      fetcher: async () => {
        if (isStandaloneExamination) {
          await adminDeleteStandaloneExaminationQuestion(id);
        } else if (isExamination) await adminDeleteExaminationQuestion(id);
        else await adminDeleteAssessmentQuestion(id);

        return "Question Deleted Successfully";
      },
      onError: (err) => {
        toast({
          description: err.message,
          position: "top",
          status: "error",
        });
      },
      onSuccess: (msg) => {
        toast({
          description: msg,
          position: "top",
          status: "success",
        });
      },
    });
  };

  return (
    <>
      {deleteRequest.loading && (
        <Flex
          pos="fixed"
          top="0"
          left="0"
          zIndex={100}
          w="100vw"
          h="100vh"
          alignItems="center"
          justifyContent="center"
          bg="rgba(255,255,255, .5)"
        >
          <Flex
            alignItems="center"
            bg="rgba(255,255,255)"
            p={6}
            shadow="md"
            rounded="md"
            w="300px"
            flexDirection="column"
          >
            <Box>
              <Spinner mb={5} />
            </Box>
            Please wait. Deleting this file might take some time.
          </Flex>
        </Flex>
      )}

      <Flex
        {...rest}
        alignItems="stretch"
        justifyContent="space-between"
        backgroundColor="white"
        padding={6}
      >
        <Box>
          <Heading fontSize="text.level2">
            <Link href={editLink}>{questionNumber}</Link>
          </Heading>

          <RichTextToView paddingTop={2} text={question} />

          {image && (
            <Image
              mt={5}
              src={image}
              alt={"question"}
              width="100%"
              height="400px"
              rounded="md"
            />
          )}
        </Box>

        <Box transform="translateY(-10px)">
          <MoreIconButton
            editLink={editLink}
            onDelete={handleDelete}
            sections={sections}
            currentSection={currentSection}
            assigning={assigning}
            onAssign={onAssign}
            onUnassign={onUnassign}
          />
        </Box>
      </Flex>
    </>
  );
};

export const MoreIconButton = ({
  editLink,
  onDelete,
  sections,
  currentSection,
  assigning,
  onAssign,
  onUnassign,
}) => {
  const { push } = useHistory();

  const handleViewClick = () => push(editLink);
  const handleEditClick = () => push(appendEditParam(editLink));

  const otherSections = (sections ?? []).filter((s) => s !== currentSection);

  return (
    <Menu placement="bottom-end">
      <MenuButton
        padding={2}
        rounded="full"
        _hover={{ background: "none", color: "others.3" }}
        _focus={{ border: "none", background: "white" }}
      >
        <FiMoreHorizontal />
      </MenuButton>

      <MenuList position="relative" zIndex={2}>
        <MenuItem onClick={handleViewClick}>Preview question</MenuItem>
        <MenuItem onClick={handleEditClick}>Edit question</MenuItem>

        {/* Section assignment */}
        {otherSections.length > 0 &&
          otherSections.map((name) => (
            <MenuItem
              key={name}
              isDisabled={assigning}
              onClick={() => onAssign && onAssign(name)}
            >
              Move to: {name}
            </MenuItem>
          ))}
        {currentSection && onUnassign && (
          <MenuItem
            isDisabled={assigning}
            onClick={onUnassign}
            color="orange.500"
          >
            Remove from section
          </MenuItem>
        )}

        <MenuItem onClick={onDelete} color="red.500">
          Delete question
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const getQuestionListingLink = (courseId, assessmentId, isExamination, moduleId) =>
  `/admin/courses/${courseId}/assessment/${assessmentId}/questions/list?question-listing=true${
    isExamination ? `&examination=${isExamination}` : ""
  }${moduleId ? `&moduleId=${moduleId}` : ""}`;

const getEditQuestionLink = (
  courseId,
  assessmentId,
  questionId,
  isExamination,
  moduleId,
) => {
  const params = new URLSearchParams();
  if (isExamination) params.set("examination", isExamination);
  if (moduleId) params.set("moduleId", moduleId);
  const query = params.toString();
  return `/admin/courses/${courseId}/assessment/${assessmentId}/questions/${questionId}${
    query ? `?${query}` : ""
  }`;
};

// Links to a queued (not-yet-created) question's edit-in-place view — same
// pending-form route as a blank "add another question" page, but carrying
// `queuedIndex` so CreateQuestionPage hydrates from that queue slot instead
// of rendering blank.
const getEditQueuedQuestionLink = (
  courseId,
  assessmentId,
  isExamination,
  moduleId,
  index,
  pendingParam,
) => {
  const params = new URLSearchParams();
  params.set(pendingParam, "1");
  if (isExamination) params.set("examination", isExamination);
  if (moduleId) params.set("moduleId", moduleId);
  params.set("queuedIndex", index);
  return `/admin/courses/${courseId}/assessment/${assessmentId}/questions/new?${params.toString()}`;
};

// Appends `edit=true` to a link built by getEditQuestionLink, which only has
// a `?` when isExamination is set — plain course-assessment links have none,
// so a naive `link + "&edit=true"` silently drops the query param entirely.
const appendEditParam = (link) =>
  `${link}${link.includes("?") ? "&" : "?"}edit=true`;

const getQuestionNumber = (index) =>
  `Question ${
    index + 1 < 9 ? `0${index + 1}` : index === undefined ? "01" : index + 1
  }`;

const buildOptions = (data, isStandaloneExamination) => {
  const options = [];

  for (const item in data) {
    if (/option/.test(item)) {
      const name = data[item];
      const optionIndex = +item.replace("option-", "");
      const isAnswer = +data.answer === optionIndex;

      const option = {
        [isStandaloneExamination ? "option" : "name"]: name,
        isAnswer,
        optionIndex,
      };

      if (option.name || option.option) options.push(option);
    }
  }

  return options;
};

const QuestionsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <QuestionsPage {...props} />} />;
};

export default QuestionsPageRoute;
