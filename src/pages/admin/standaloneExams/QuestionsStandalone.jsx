import {
  Badge,
  Box,
  Checkbox,
  Flex,
  Grid,
  Select as ChakraSelect,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagCloseButton,
  TagLabel,
  Input as ChakraInput,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
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
} from "../../../components";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight, FaPlus, FaTrash } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { Route, useHistory } from "react-router-dom";
import { PageLoaderLayout } from "../../../layouts";
import {
  useFetch,
  useGoBack,
  useIsSuperAdmin,
  useQueryParams,
  useRichText,
  useUpload,
} from "../../../hooks";
import {
  adminCreateStandaloneExamination,
  adminCreateStandaloneExaminationQuestion,
  adminDeleteStandaloneExaminationQuestion,
  adminEditStandaloneExamination,
  adminEditStandaloneExaminationQuestion,
  adminGetMarkingTemplateById,
  adminGetStandaloneExamTemplateId,
  createExamQuestionBankItem,
  getExamQuestionBankItem,
  getExaminationById as getExamPaperConfig,
  listExamQuestionBank,
  updateExaminationById as updateExamPaperConfig,
} from "../../../services";
import { buildBatchUploadLink, normalizeOptions } from "../examQuestionImport/questionRowUtils";
import SelectBankQuestionsModal from "../examQuestionBank/SelectBankQuestionsModal";
import {
  capitalizeFirstLetter,
  capitalizeWords,
  clearNeedsApprovalSubmission,
  getExamMeta,
  isAutoAddToBank,
  markExamMeta,
  markNeedsApprovalSubmission,
  needsApprovalSubmission,
  setAutoAddToBank,
} from "../../../utils";
import useAssessmentPreview from "../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import useAssessmentStore from "../../../store/assessmentStore";

// ShortAnswer/Essay appended at the end, never inserted — every existing
// QUESTION_TYPES.indexOf(...)/[tabIndex] lookup elsewhere in this file
// depends on MCQ/TrueFalse/Matching/FillBlank keeping indices 0-3.
const QUESTION_TYPES = ["MCQ", "TrueFalse", "Matching", "FillBlank", "ShortAnswer", "Essay"];

// Question Bank type mapping — this simplified form has no Essay/ShortAnswer tabs
// and the bank has no "Matching" equivalent, so those are intentionally excluded.
const FORM_TYPE_TO_BANK_TYPE = {
  MCQ: "mcq",
  TrueFalse: "true_false",
  FillBlank: "fill_blank",
};

const BANK_TYPE_TO_FORM_TYPE = {
  mcq: "MCQ",
  true_false: "TrueFalse",
  fill_blank: "FillBlank",
};

const TYPE_LABEL = {
  MCQ: "MCQ",
  TrueFalse: "True / False",
  Matching: "Matching",
  FillBlank: "Fill in the Blank",
  ShortAnswer: "Short Answer",
  Essay: "Essay",
};

// "with_sections"/"without_sections"/"hybrid" is the internal representation
// used throughout this file and TemplateStandalone.jsx's own exam-type
// checks — the backend's ExamType enum instead expects "sectioned" /
// "unsectioned" / "hybrid", so remap right at the API boundary instead of
// renaming the internal value everywhere it's compared against.
const EXAM_TYPE_TO_API = {
  with_sections: "sectioned",
  without_sections: "unsectioned",
  hybrid: "hybrid",
};
const toApiCreateBody = (body) => {
  if (!body) return body;
  // Belt-and-suspenders: TemplateStandalone.jsx already clears `templateId`
  // when Exam Type is "with sections", but a `pendingCreate` persisted to
  // localStorage from before that fix (or from an earlier Exam Type
  // selection in the same session that never went through "Next" again)
  // can still be sitting on a stale value. Sections define their own
  // marking, so strip it here too — right at the actual API boundary —
  // regardless of what's upstream.
  const isSectioned = body.examType === "with_sections";
  const { standaloneQuestionCounts, ...rest } = body;
  return {
    ...rest,
    ...(body.examType && EXAM_TYPE_TO_API[body.examType] && { examType: EXAM_TYPE_TO_API[body.examType] }),
    templateId: isSectioned ? undefined : body.templateId,
    // Confirmed against a real backend test: a sectioned exam auto-computes
    // amountOfQuestions from the sum of each section's own questionCount —
    // sending it here isn't part of that tested/working contract. Kept in
    // `pendingCreate.body` itself (TemplateStandalone.jsx no longer strips
    // it) so this file's own total-question-cap check still has a value to
    // read locally; only the actual network call needs it gone.
    amountOfQuestions: isSectioned ? undefined : body.amountOfQuestions,
    // Backend confirmed: total marks is calculated automatically for hybrid
    // exams and rejects the field if sent. Belt-and-suspenders alongside the
    // strip already done in TemplateStandalone.jsx's create branch.
    totalMarks: body.examType === "hybrid" ? undefined : body.totalMarks,
    // "standaloneQuestionCounts" is this file's own internal name for the
    // per-type Quantity set on the Template/Marking Scheme step — the
    // backend's field for this is `questionQuantity` (matching the marking
    // template's own field name for the same data).
    ...(standaloneQuestionCounts && { questionQuantity: standaloneQuestionCounts }),
  };
};

// A sectioned exam sends its sections on the create body itself (see
// TemplateStandalone.jsx) — `configuredSections` there is a local-only
// convenience (question_types/marking_type detail for this file's own
// sectionQuestionTypes feature) confirmed to be rejected outright
// ("configuredSections is not allowed") by the backend, so it must never
// reach the paper-config PUT for a sectioned exam. Confirmed by a second
// real backend test that hybrid's sections get the exact same rejection —
// they go on the create body too (TemplateStandalone.jsx), so
// `configuredSections` must be stripped here for hybrid as well.
// "Without sections" exams have no sections at all, so this key is simply
// never populated for them in the first place.
const toApiPaperConfigBody = (body, paperConfigBody) =>
  body?.examType === "with_sections" || body?.examType === "hybrid"
    ? { ...paperConfigBody, configuredSections: undefined }
    : paperConfigBody;

// Same fallback QuestionsPage.jsx's own getRealExamMeta uses for Course
// Exam/Assessment — the fetched record's own examType/questionQuantity,
// falling back to whatever markExamMeta cached at creation/edit time, in
// case this exam's own GET response doesn't reliably return them once real
// either. `examType` here is always the backend's API value ("sectioned"/
// "unsectioned"/"hybrid") to match what `assessment?.examType` itself would
// be — cacheExamMetaFromBody below is what translates this file's own
// internal value ("with_sections"/...) into that before writing it.
const getRealExamMeta = (assessment) => {
  const cached = getExamMeta("StandaloneExam", assessment?.id);
  return {
    examType: assessment?.examType ?? cached?.examType ?? null,
    questionQuantity: assessment?.questionQuantity ?? cached?.questionQuantity ?? null,
  };
};

const cacheExamMetaFromBody = (id, body) => {
  if (!body) return;
  markExamMeta("StandaloneExam", id, {
    examType: EXAM_TYPE_TO_API[body.examType] ?? body.examType,
    questionQuantity: body.standaloneQuestionCounts,
  });
};

// A queued item's own explicit `questionType` covers FillBlank/Matching/
// ShortAnswer/Essay; MCQ/TrueFalse never set one (they carry `options`
// instead), so fall back to the same options-shape sniffing the existing-
// question hydration effect above uses.
const inferQueuedQuestionType = (data) => {
  if (data?.questionType && QUESTION_TYPES.includes(data.questionType)) return data.questionType;
  if (Array.isArray(data?.options) && data.options.length === 2) return "TrueFalse";
  if (Array.isArray(data?.options) && data.options.length) return "MCQ";
  return null;
};

// "Exam without sections" and hybrid's "Standalone Questions" tab: don't
// let a bulk bank-add push any question type past its configured Quantity —
// keep questions up to each type's remaining room and skip the rest, the
// same rule the single-question form already enforces one at a time.
// `queuedTypeCounts` is the count before this batch; the running tally
// advances per accepted item so two of the same type in the same batch
// don't both slip through when only one more fits.
const filterBankQuestionsByTypeQuota = (
  bankQuestions,
  { usingTemplateTypeRestriction, templateSupportedTypes, typeQuota, queuedTypeCounts },
) => {
  if (!usingTemplateTypeRestriction) return { kept: bankQuestions, skipped: 0 };
  const runningCounts = { ...queuedTypeCounts };
  let skipped = 0;
  const kept = bankQuestions.filter((bq) => {
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bq.questionType];
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

// Shared by the pending-creation queue (buildQueuedItemFromBankQuestion) and
// the already-real listing page (saveBankQuestionsForReal) — same mapping,
// just fed straight to the create-question endpoint in the "real" case
// instead of being stashed in pendingCreate/pendingEdit.questions.
const buildBankQuestionData = (bankQuestion, examinationId, sectionTitle) => {
  const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType];
  if (!mappedType) return null;

  const isObjective = mappedType === "MCQ" || mappedType === "TrueFalse";
  const options = isObjective
    ? mappedType === "TrueFalse"
      ? ["True", "False"].map((label, idx) => ({
          name: label,
          isAnswer: bankQuestion.correctAnswer === label,
          optionIndex: idx + 1,
        }))
      : (bankQuestion.options || []).map((o, idx) => ({
          name: o.text,
          isAnswer: !!o.isCorrect,
          optionIndex: idx + 1,
        }))
    : [];

  const typeSpecificFields = isObjective
    ? { options }
    : { questionType: "FillBlank", correctAnswer: bankQuestion.correctAnswer || "" };

  return {
    standAloneExaminationId: examinationId,
    question: bankQuestion.question,
    ...(sectionTitle && { section: sectionTitle }),
    markingType: "automatic",
    ...typeSpecificFields,
  };
};

const normalizeQuestionText = (text) => (text || "").replace(/\s+/g, " ").trim().toLowerCase();

// Bank questions carry no unique id in the create payload above — the
// backend's "stand alone examination question already exists" check keys
// off the question text itself. Picking the same bank question twice (e.g.
// into two different sections, or reopening the picker for another
// section — nothing here or in SelectBankQuestionsModal remembers what was
// already picked) silently queues an invisible duplicate that only ever
// surfaces as a failure at submit time. Filter it out up front instead,
// against both what's already queued/real and the rest of this same batch.
const filterDuplicateQuestions = (items, existingTexts, getText) => {
  const seen = new Set(existingTexts);
  const kept = [];
  let duplicates = 0;
  for (const item of items) {
    const key = normalizeQuestionText(getText(item));
    if (key && seen.has(key)) {
      duplicates += 1;
      continue;
    }
    if (key) seen.add(key);
    kept.push(item);
  }
  return { kept, duplicates };
};

// Submits a queue of already-built question payloads one at a time. Used to
// throw on the *first* failure and abandon every question after it in the
// queue — most commonly triggered by the backend's "already exists"
// duplicate check (see filterDuplicateQuestions above for why a duplicate
// can still slip through), which meant one bad item silently stopped the
// whole batch from finishing. A duplicate is now treated as a no-op (the
// question is already there) and doesn't block the rest; any other error
// still aborts so the admin can see and fix it, but everything saved before
// that point is recorded in `savedSet` so a retry only redoes what's left.
const saveQueuedBatch = async (queuedItems, savedSet, saveOne) => {
  let duplicates = 0;
  const failures = [];
  for (const queued of queuedItems) {
    if (savedSet.has(queued)) continue;
    try {
      await saveOne(queued);
      savedSet.add(queued);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "";
      if (/already exists/i.test(message)) {
        savedSet.add(queued);
        duplicates += 1;
      } else {
        failures.push({ queued, message });
      }
    }
  }
  if (failures.length) {
    throw new Error(
      `${failures.length} question${failures.length === 1 ? "" : "s"} failed to save${
        duplicates ? ` (${duplicates} duplicate${duplicates === 1 ? "" : "s"} skipped)` : ""
      } — the rest were saved; fix and resubmit to finish the remaining ${failures.length === 1 ? "one" : "ones"}.`,
    );
  }
  return { duplicates };
};

const QuestionsStandalone = () => {
  const isQuestionListingPage = useQueryParams().get("question-listing");
  const isExamination = useQueryParams().get("examination");
  const questionId = useQueryParams().get("question");
  const isEditMode = useQueryParams().get("edit") === "true";
  const submitForApproval = useQueryParams().get("submitForApproval") === "1";
  const editSubmit = useQueryParams().get("editSubmit") === "1";
  const queuedIndexParam = useQueryParams().get("queuedIndex");
  const isExistingQuestion = questionId && questionId !== "new";
  // "Next" on the details form hands off here without creating anything —
  // this page renders from `pendingCreate` instead of fetching a real record.
  const isPendingCreation = submitForApproval && !isExistingQuestion && !isEditMode;
  // "Next" on the *edit* details form hands off here the same way, except
  // the exam already exists — this page renders it normally, but the
  // actual update (from `pendingEdit`) is deferred until a question is saved.
  const isPendingEditSubmit = editSubmit && !isExistingQuestion && !isEditMode;

  const assessmentManager = useAssessmentPreview(null, isExamination, true);

  const storeSections = useAssessmentStore((s) => s.sections);
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const handleGoBack = useGoBack();
  const { push } = useHistory();
  const toast = useToast();
  const [creatingForUpload, setCreatingForUpload] = useState(false);
  const [templateSections, setTemplateSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  // section name -> allowed question types, from the Template/Marking Scheme
  // step's "Exam with sections" checkbox builder — only ever populated for a
  // brand-new "with sections" or "hybrid" exam still in pendingCreate (see
  // the effect below); every other case (existing exam, without sections)
  // leaves this empty and the Questions page behaves exactly as it did before.
  const [sectionQuestionTypes, setSectionQuestionTypes] = useState({});
  // section name -> how many questions it's configured for (Question Count
  // on the Template/Marking Scheme step's section builder) — same scoping
  // as sectionQuestionTypes above. Missing/0 means "no configured cap".
  const [sectionQuestionCounts, setSectionQuestionCounts] = useState({});
  // Hybrid has sections too (optionally) — shown as the same tabs, combined
  // with a "Standalone Questions" tab for the non-sectioned portion (see
  // isHybridExam/usingTemplateTypeRestriction in CreateQuestionPage below).
  // Also true for an already-real exam of the same type ("Add more
  // questions" after the exam was created, e.g. via the batch-upload
  // shortcut) — without this, the tabs only ever appeared during the
  // pending-creation window and silently reverted to the older bare
  // Section dropdown the moment the exam became real.
  const realExamMeta = getRealExamMeta(assessmentManager.assessment);
  const isSectionedExam =
    (isPendingCreation &&
      (pendingCreate?.body?.examType === "with_sections" ||
        pendingCreate?.body?.examType === "hybrid")) ||
    (!isPendingCreation &&
      !!isExamination &&
      (realExamMeta.examType === "sectioned" || realExamMeta.examType === "hybrid"));

  // Lifted up from CreateQuestionPage (instead of that component owning its
  // own local state) so the "Upload & Batch Import Questions" button here —
  // a sibling of CreateQuestionPage, not a descendant — knows which Section
  // tab is currently active and can target the upload at it.
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // Used for an already-real exam ("Add more questions") — the
  // isPendingCreation case builds its own link fresh inside
  // handleBatchUploadClick below, once the exam shell exists.
  const batchUploadLink = buildBatchUploadLink({
    examinationId: isExamination,
    standalone: true,
    section: isSectionedExam ? selectedSectionId || undefined : undefined,
  });

  // The batch-upload endpoint requires a real examination UUID — it never
  // accepts the "new" placeholder. While pending creation, clicking "Upload
  // & Batch Import Questions" creates the exam shell right away (same create
  // call `performCreateParent` uses below) with no approval popup — approval
  // for this exam happens later, via the "Submit for Approval" button on the
  // question listing page (`QuestionListingPage` below) once the import is
  // done and the questions are real.
  const handleBatchUploadClick = async () => {
    if (!pendingCreate) return;
    setCreatingForUpload(true);
    try {
      const { body, paperConfigBody, addToBank: parentAddToBank } = pendingCreate;
      const { examination } = await adminCreateStandaloneExamination(toApiCreateBody(body));
      await updateExamPaperConfig(examination.id, toApiPaperConfigBody(body, paperConfigBody));
      if (parentAddToBank) setAutoAddToBank("standalone", examination.id);
      setAssessment({ ...examination, sections: paperConfigBody?.configuredSections || [] });
      // This exam was created without going through the approval modal —
      // flag it so the question listing page offers a one-time "Submit for
      // Approval" action once the import is done.
      markNeedsApprovalSubmission("standalone", examination.id);
      cacheExamMetaFromBody(examination.id, body);

      push(
        buildBatchUploadLink({
          examinationId: examination.id,
          standalone: true,
          section: isSectionedExam ? selectedSectionId || undefined : undefined,
        }),
      );
    } catch (err) {
      toast({
        description: "Couldn't create the exam before uploading — please try again",
        position: "top",
        status: "error",
      });
    } finally {
      setCreatingForUpload(false);
    }
  };

  useEffect(() => {
    if (isPendingCreation) {
      const configuredSections = pendingCreate?.paperConfigBody?.configuredSections;
      if (Array.isArray(configuredSections) && configuredSections.length > 0) {
        setTemplateSections(configuredSections.map((s) => s.section_name));
        setSectionQuestionTypes(
          Object.fromEntries(
            configuredSections.map((s) => [s.section_name, s.question_types || []]),
          ),
        );
        setSectionQuestionCounts(
          Object.fromEntries(
            configuredSections.map((s) => [s.section_name, Number(s.question_count) || 0]),
          ),
        );
        return;
      }
      if (!pendingCreate?.body?.templateId) {
        setTemplateSections([]);
        return;
      }
      setSectionsLoading(true);
      adminGetMarkingTemplateById(pendingCreate.body.templateId)
        .then(({ template }) =>
          setTemplateSections(
            Array.isArray(template?.sections)
              ? template.sections.map((s) => s.name)
              : [],
          ),
        )
        .catch(() => setTemplateSections([]))
        .finally(() => setSectionsLoading(false));
      return;
    }

    if (!isExamination) return;

    if (storeSections.length > 0) {
      setTemplateSections(storeSections.map((s) => s.name || s.section_name));
      return;
    }

    setSectionsLoading(true);

    const fetchViaTemplate = () =>
      adminGetStandaloneExamTemplateId(isExamination)
        .then((templateId) => {
          if (!templateId) throw new Error("no-template");
          return adminGetMarkingTemplateById(templateId);
        })
        .then(({ template }) =>
          setTemplateSections(
            Array.isArray(template?.sections)
              ? template.sections.map((s) => s.name)
              : [],
          ),
        )
        .catch(() => setTemplateSections([]))
        .finally(() => setSectionsLoading(false));

    // Exam-level sections configured via "Configure Paper" take priority
    // over the marking template's sections when both are present. This PUT
    // deliberately never persists `configuredSections` for a sectioned/
    // hybrid exam (see toApiPaperConfigBody above — the backend rejects it
    // there outright), so `configured` below is always empty for one on any
    // visit past the same in-memory session that created it (storeSections
    // above only covers that first visit — it isn't persisted). Fall back to
    // the exam's own `sections` field (set at create time — TemplateStandalone.jsx's
    // create body — and always echoed back on the real record) before ever
    // reaching the marking-template lookup, which a sectioned/hybrid exam
    // never has one of anyway (its own sections define marking instead).
    getExamPaperConfig(isExamination, "standalone_examination")
      .then((res) => {
        const configured = res?.data?.configuredSections;
        if (Array.isArray(configured) && configured.length > 0) {
          setTemplateSections(configured.map((s) => s.section_name));
          // Same mapping the pending-creation branch above uses — without
          // this, a real (already-created) exam's section question-type
          // locks/Question Count caps never applied at all, only its names.
          setSectionQuestionTypes(
            Object.fromEntries(
              configured.map((s) => [s.section_name, s.question_types || []]),
            ),
          );
          setSectionQuestionCounts(
            Object.fromEntries(
              configured.map((s) => [s.section_name, Number(s.question_count) || 0]),
            ),
          );
          setSectionsLoading(false);
          return;
        }
        const ownSections = assessmentManager.assessment?.sections;
        if (Array.isArray(ownSections) && ownSections.length > 0) {
          setTemplateSections(ownSections.map((s) => s.section_name));
          setSectionsLoading(false);
          return;
        }
        return fetchViaTemplate();
      })
      .catch(() => {
        const ownSections = assessmentManager.assessment?.sections;
        if (Array.isArray(ownSections) && ownSections.length > 0) {
          setTemplateSections(ownSections.map((s) => s.section_name));
          setSectionsLoading(false);
          return;
        }
        return fetchViaTemplate();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isExamination,
    storeSections,
    isPendingCreation,
    // Deliberately narrowed from the whole `pendingCreate` object: every
    // question queue/save/remove replaces it with a new object reference
    // (`{ ...pendingCreate, questions: ... }`), which re-triggered this
    // effect — and its marking-template GET — on every single local edit.
    // Only these two derived values actually change what this effect does.
    pendingCreate?.paperConfigBody?.configuredSections,
    pendingCreate?.body?.templateId,
    assessmentManager.assessment?.sections,
  ]);

  // Nothing was ever saved to the backend, so if the in-memory details-form
  // data is gone (e.g. the page was refreshed) there's nothing to recover.
  if (isPendingCreation && !pendingCreate) {
    return (
      <Box padding={10} textAlign="center">
        <Text bold mb={2}>
          The details for this exam were lost.
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
          The changes to this exam were lost.
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
              ? "Edit Queued Question"
              : !questionId
                ? "Create Standalone Question"
                : "Update Standalone Question"}
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
          <QuestionListingPage {...assessmentManager} templateSections={templateSections} />
        ) : (
          <CreateQuestionPage
            {...assessmentManager}
            templateSections={templateSections}
            sectionsLoading={sectionsLoading}
            sectionQuestionTypes={sectionQuestionTypes}
            sectionQuestionCounts={sectionQuestionCounts}
            isSectionedExam={isSectionedExam}
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
                href={`${getQuestionListingLink(isExamination)}${
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
                    key={question.id}
                    number={index + 1}
                    isCurrent={questionId === question.id}
                    answered={questionId === question.id}
                    link={getEditQuestionLink(isExamination, question.id)}
                  />
                ),
              )}
              {/* Not created yet — queued via "Add more questions"/the Question
                  Bank picker while the exam is still pending creation or its
                  edit hasn't been submitted (see pendingCreate/pendingEdit
                  `.questions`). No real id exists for these until the batch is
                  saved, so they link to an edit-in-place view keyed by their
                  queue index instead of a real question id. */}
              {(isPendingCreation
                ? pendingCreate?.questions
                : isPendingEditSubmit
                  ? pendingEdit?.questions
                  : null
              )?.map((_, index) => (
                <ButtonNavItem
                  key={`queued-${index}`}
                  number={
                    (assessmentManager.assessment?.questions?.length || 0) +
                    index +
                    1
                  }
                  answered
                  isCurrent={queuedIndexParam === `${index}`}
                  link={getEditQueuedQuestionLink(
                    isExamination,
                    index,
                    isPendingCreation ? "submitForApproval" : "editSubmit",
                  )}
                />
              ))}
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
    : { borderColor: "primary.base" };

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
  const questionId = useQueryParams().get("question");

  const getQuestions = useCallback(() => {
    if (assessmentManager?.assessment?.questions) {
      let index;
      const found = assessmentManager.assessment.questions.find((q, i) => {
        if (q.id === questionId) {
          index = i;
          return true;
        }
        return false;
      });
      if (found) setQuestion({ ...found, index });
    }
  }, [assessmentManager.assessment?.questions, questionId]);

  useEffect(() => {
    getQuestions();
  }, [getQuestions]);

  const toast = useToast();
  useEffect(() => {
    if (assessmentManager.error) {
      toast.closeAll();
      toast({
        description: capitalizeFirstLetter(
          "There was an error filling the form, reload the page!",
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
  sectionQuestionTypes = {},
  sectionQuestionCounts = {},
  isSectionedExam = false,
  selectedSectionId,
  setSelectedSectionId,
  ...assessmentManager
}) => {
  const { push } = useHistory();
  const toast = useToast();
  const isExamination = useQueryParams().get("examination");
  const questionId = useQueryParams().get("question");
  const isEditMode = useQueryParams().get("edit") === "true";
  const submitForApproval = useQueryParams().get("submitForApproval") === "1";
  const editSubmit = useQueryParams().get("editSubmit") === "1";
  const queuedIndexParam = useQueryParams().get("queuedIndex");
  const isSuperAdmin = useIsSuperAdmin();

  const isExistingQuestion = questionId && questionId !== "new";
  // Nothing was created when "Next" was clicked on the details form — this
  // is the first question, and saving it is also what creates the exam
  // (and, for instructors, what the approval modal gates).
  const isPendingCreation = submitForApproval && !isExistingQuestion && !isEditMode;
  // Same deferral, but the exam already exists — saving this question is
  // what finally applies the held-back edit (and, for instructors, what
  // the approval modal gates).
  const isPendingEditSubmit = editSubmit && !isExistingQuestion && !isEditMode;
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);
  const clearPendingEdit = useAssessmentStore((s) => s.clearPendingEdit);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const isBankPickerOpen = useAssessmentStore((s) => s.isBankPickerOpen);
  const closeBankPicker = useAssessmentStore((s) => s.closeBankPicker);
  const fromBankQuestionIds = pendingCreate?.fromBankQuestionIds;

  // Clicking a queued (bank-added, not-yet-created) tile in "List Of
  // Questions" lands here with `queuedIndex` instead of a real `question`
  // id — there is no real id until the whole batch is saved on submit.
  const queuedSource = isPendingCreation ? pendingCreate : isPendingEditSubmit ? pendingEdit : null;
  const queuedIndex =
    queuedSource && queuedIndexParam !== null && queuedIndexParam !== ""
      ? Number(queuedIndexParam)
      : null;
  const queuedItem = queuedIndex !== null ? queuedSource?.questions?.[queuedIndex] : null;
  const isEditingQueued = queuedIndex !== null && !!queuedItem;
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const [createdSuccess, setCreatedSuccess] = useState(null);
  const pendingCreateBothRef = useRef(null);
  const createdParentRef = useRef(null);
  const addAnotherRef = useRef(false);
  // "Create and Submit"/"Update and Submit" no longer opens the approval
  // modal directly from this form — it queues whatever's on the current
  // form (same as "Add more questions") and instead sends the admin to
  // "See All", which already has its own full "Create and Submit" trigger
  // for reviewing everything queued before actually submitting.
  const goToListingRef = useRef(false);
  // Retry-safety for "Create and Submit"/"Update and Submit": if a previous
  // attempt in this same page visit created the parent exam and/or saved
  // some queued questions before failing partway (e.g. a bad payload for
  // one queued item), retrying must not recreate the parent or resave
  // questions that already succeeded — the backend correctly rejects those
  // as duplicates ("question already exists"). These refs remember what
  // already landed so a retry only does the remaining work.
  const savedQueueItemsRef = useRef(new WeakSet());
  const currentFormSavedRef = useRef(false);

  // How many questions this exam was configured for — read from the
  // not-yet-created details form while pending, or the real record once
  // it exists (the fetched record calls this field `questionCount`).
  const amountOfQuestions =
    Number(
      pendingCreate?.body?.amountOfQuestions ??
        pendingEdit?.body?.amountOfQuestions ??
        assessmentManager.assessment?.questionCount ??
        assessmentManager.assessment?.amountOfQuestions,
    ) || null;

  // Plain "Add Question" on an already-real exam, once it already has as
  // many questions as it was configured for — mirrors the toast/onSubmit
  // guard above, but surfaced proactively so the admin never fills out a
  // whole form only to have it rejected at the end.
  const isPlainRealAdd = !isExistingQuestion && !isEditMode && !isPendingCreation && !isPendingEditSubmit;
  const realAddAtCapacity =
    isPlainRealAdd &&
    !!amountOfQuestions &&
    (assessmentManager.assessment?.questions?.length || 0) >= amountOfQuestions;

  const buildRealQuestionRoute = (realParentId, { listing, keepPending } = {}) => {
    const finalExamination = realParentId ?? isExamination;
    if (listing) return getQuestionListingLink(finalExamination);
    const params = new URLSearchParams();
    // Only set while nothing real exists yet — keeps the next question form
    // in the same pending-creation/pending-edit-submit state so it queues
    // instead of trying to save straight away.
    if (keepPending && isPendingCreation) params.set("submitForApproval", "1");
    if (keepPending && isPendingEditSubmit) params.set("editSubmit", "1");
    const query = params.toString();
    return `/admin/standalone-exams/questions/?examination=${finalExamination}${query ? `&${query}` : ""}`;
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
    // form set up, not the generic question-listing link.
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

  // Used by "Add more questions" while the exam doesn't exist yet (or its
  // edit is still held back) — nothing has been saved, so this queues the
  // current question locally (see the onSubmit branches below) and reopens
  // a blank form without disturbing `pendingCreate`/`pendingEdit`.
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
    push(`${getQuestionListingLink(isExamination)}${pendingSuffix}`);
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

  // After a question is saved: if this exam was set up for more than one
  // question, offer to add another right away instead of always dropping
  // straight to the question list.
  const finishSaving = (realParentId) => {
    // How many questions exist after this save — used to stop offering
    // "Add more questions" once the exam has as many as was asked for.
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
          description: `You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this exam — you can't add another question.`,
          position: "top",
          status: "info",
        });
      }
      goToQuestionListing(realParentId);
    }
  };

  // Creates the exam that "Next" deferred, using the details form values
  // held in `pendingCreate`. Called from inside the approval modal's
  // `onCreate` — this is the first thing that ever gets saved. Creation is
  // a separate endpoint from approval submission, so no supervisor field
  // is sent here; the supervisor is only attached on the later workflow
  // submit call.
  const performCreateParent = async () => {
    const { body, paperConfigBody, addToBank: parentAddToBank } = pendingCreate;
    const { examination } = await adminCreateStandaloneExamination(toApiCreateBody(body));
    await updateExamPaperConfig(examination.id, toApiPaperConfigBody(body, paperConfigBody));
    if (parentAddToBank) setAutoAddToBank("standalone", examination.id);
    setAssessment({ ...examination, sections: paperConfigBody?.configuredSections || [] });
    cacheExamMetaFromBody(examination.id, body);
    return { id: examination.id };
  };

  // Applies the edit that "Next" deferred, using the details form values
  // held in `pendingEdit`. Called from inside the approval modal's
  // `onCreate` — this is the first thing that actually changes. Editing is
  // a separate endpoint from approval submission, so no supervisor field
  // is sent here; the supervisor is only attached on the later workflow
  // submit call.
  const performEditParent = async () => {
    const { contentId, body, paperConfigBody } = pendingEdit;
    // Backend confirmed: total marks is calculated automatically for hybrid
    // exams and rejects the field if sent — TemplateStandalone.jsx never
    // rebuilds `body.totalMarks` on the edit path, so it can still be
    // carrying a stale value from whatever was originally fetched.
    const editBody = body?.examType === "hybrid" ? { ...body, totalMarks: undefined } : body;
    await adminEditStandaloneExamination(contentId, editBody);
    if (paperConfigBody) await updateExamPaperConfig(contentId, paperConfigBody).catch(() => {});
    cacheExamMetaFromBody(contentId, body);
    return { id: contentId };
  };

  const withRealParentId = (body, realParentId) => ({
    ...body,
    standAloneExaminationId: realParentId,
  });

  const { question, isLoading, error } = useQuestionDetails(assessmentManager);

  const [tabIndex, setTabIndex] = useState(0);
  const questionType = QUESTION_TYPES[tabIndex];

  const [answer, setAnswer] = useState("");
  const [matchingPairs, setMatchingPairs] = useState([{ left: "", right: "" }]);
  const [acceptVariants, setAcceptVariants] = useState([]);
  const [variantInput, setVariantInput] = useState("");
  const [markingType, setMarkingType] = useState("automatic");

  // "Exam with sections": whichever question types the active section's
  // Template/Marking Scheme checkbox list allowed — null (not an empty
  // array) when unrestricted, so every check below is a no-op for hybrid/
  // without-sections/existing exams, which never set this.
  const allowedTypesForSection =
    isSectionedExam && selectedSectionId && sectionQuestionTypes[selectedSectionId]?.length
      ? QUESTION_TYPES.filter((t) => sectionQuestionTypes[selectedSectionId].includes(t))
      : null;

  // "Exam without sections" and hybrid's non-sectioned "Standalone
  // Questions" tab both draw from the same Quantity-per-type/marking-
  // template restriction set up on the Template/Marking Scheme step — once
  // the queue already has that many questions of a type, no more of that
  // type can be added. Originally only ever populated for a brand-new
  // "without sections"/"hybrid" exam still in pendingCreate; extended below
  // to also read the real exam's own persisted `questionQuantity` and
  // already-created questions once it exists, so the cap keeps applying
  // past the point the exam becomes real (e.g. via the batch-upload
  // shortcut) instead of silently switching off.
  const realExamMeta = getRealExamMeta(assessmentManager.assessment);
  const isHybridExam = isPendingCreation
    ? pendingCreate?.body?.examType === "hybrid"
    : !!isExamination && realExamMeta.examType === "hybrid";
  const isUnsectionedExam = isPendingCreation
    ? pendingCreate?.body?.examType === "without_sections"
    : !!isExamination && realExamMeta.examType === "unsectioned";
  // Hybrid only applies the template restriction while on the "Standalone
  // Questions" tab (no section selected) — a section's own checkbox list
  // (allowedTypesForSection above) governs question types once a section
  // is active, exactly like a plain "with sections" exam.
  const usingTemplateTypeRestriction =
    isUnsectionedExam || (isHybridExam && !selectedSectionId);
  const standaloneQuestionCounts = isPendingCreation
    ? pendingCreate?.body?.standaloneQuestionCounts || {}
    : realExamMeta.questionQuantity || {};
  // The Template/Marking Scheme step seeds a key for every question type the
  // selected marking template actually supports (even ones left at 0) — a
  // type absent here isn't offered by the template at all, so it's disabled
  // outright, never just quantity-capped. Falls back to "no restriction"
  // when nothing was seeded (e.g. older pendingCreate/real-exam data from
  // before this existed), so this can't hide every tab by accident.
  const templateSupportedTypes =
    usingTemplateTypeRestriction && Object.keys(standaloneQuestionCounts).length > 0
      ? Object.keys(standaloneQuestionCounts)
      : null;
  const queuedTypeCounts = !usingTemplateTypeRestriction
    ? {}
    : isPendingCreation
      ? (pendingCreate?.questions || []).reduce((acc, q, i) => {
          // Editing this exact queued slot doesn't add a new question —
          // exclude it so its own type doesn't count against its own
          // remaining quota.
          if (isEditingQueued && i === queuedIndex) return acc;
          // A hybrid section's own questions draw from that section's
          // weightage, never the template's standalone-quantity pool.
          if (q.data?.section) return acc;
          const t = inferQueuedQuestionType(q.data);
          if (t) acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {})
      : (assessmentManager.assessment?.questions || []).reduce((acc, q) => {
          // Editing this exact question in place doesn't add a new one —
          // exclude it so its own type doesn't count against its own
          // remaining quota.
          if (isEditMode && question && q.id === question.id) return acc;
          if (q.section) return acc;
          if (q.questionType) acc[q.questionType] = (acc[q.questionType] || 0) + 1;
          return acc;
        }, {});
  const typeQuota = (type) => {
    const raw = standaloneQuestionCounts[type];
    return raw !== undefined && raw !== null && raw !== "" ? Number(raw) : null;
  };
  // Despite the name, this now covers both reasons a type can be
  // unavailable: the template doesn't support it at all, or its own
  // Quantity has already been reached.
  const typeAtCapacity = (type) => {
    if (templateSupportedTypes && !templateSupportedTypes.includes(type)) return true;
    const quota = typeQuota(type);
    return quota != null && (queuedTypeCounts[type] || 0) >= quota;
  };
  // Hybrid gets one extra tab ("" — Standalone Questions) alongside its real
  // sections, so the admin can switch between the sectioned and marking-
  // template-driven halves. A plain "with sections" exam has no standalone
  // half, so its tabs are exactly its real sections, unchanged.
  const sectionTabValues = isHybridExam ? ["", ...templateSections] : templateSections;

  // A brand-new "with sections" form has no section picked yet — default to
  // the first one so the Answer Options tabs immediately reflect a real
  // restriction instead of showing all 4 types pre-selection. Skipped
  // whenever there's a real `question` to hydrate from (existing/queued
  // question edit, or a bank-apply) — that effect (below) sets the real
  // section and always wins since it re-runs whenever `question` resolves.
  // Hybrid is deliberately excluded — its default tab is "Standalone
  // Questions" (selectedSectionId already starts at "").
  useEffect(() => {
    if (!isSectionedExam || isHybridExam || selectedSectionId || question || templateSections.length === 0) return;
    setSelectedSectionId(templateSections[0]);
  }, [isSectionedExam, isHybridExam, selectedSectionId, question, templateSections, setSelectedSectionId]);

  // If switching sections (or the default-select above) leaves the
  // currently active Answer Options tab pointing at a type this section
  // doesn't allow, snap to the first allowed one. tabIndex still indexes
  // into the full QUESTION_TYPES array here — only the TabList's rendered
  // tabs are restricted (see the Answer Options Tabs below) — so this is
  // the only place that needs to know about the restriction.
  useEffect(() => {
    if (!allowedTypesForSection) return;
    if (allowedTypesForSection.includes(QUESTION_TYPES[tabIndex])) return;
    const fallbackIndex = QUESTION_TYPES.indexOf(allowedTypesForSection[0]);
    if (fallbackIndex !== -1) setTabIndex(fallbackIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId, sectionQuestionTypes]);

  // "Exam without sections" / hybrid's "Standalone Questions" tab: if the
  // active tab's type has already hit its Quantity (e.g. right after saving
  // the last allowed question of that type), snap to the first type that
  // still has room left.
  useEffect(() => {
    if (!usingTemplateTypeRestriction) return;
    if (!typeAtCapacity(questionType)) return;
    const fallback = QUESTION_TYPES.find((t) => !typeAtCapacity(t));
    if (fallback) setTabIndex(QUESTION_TYPES.indexOf(fallback));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingTemplateTypeRestriction, questionType, queuedTypeCounts]);

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm();
  const questionRichTextManager = useRichText();
  const questionImageManager = useUpload();

  // ── Add this question to the Question Bank on save ─────────────────────
  const [addToBank, setAddToBank] = useState(false);
  const autoAddToBank = isAutoAddToBank("standalone", isExamination);

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

  // The option/answer fields only exist in the DOM once the tab has actually
  // switched (e.g. FillBlank's field isn't rendered while MCQ's tab is still
  // active), so setting them can't happen in the same synchronous call as
  // `setTabIndex` — it has to wait for the re-render that follows. Stash the
  // bank question here and let the `[bankApplyKey]` effect below fill in the
  // type-specific fields once that render has actually happened.
  const pendingBankApplyRef = useRef(null);

  const applyBankQuestion = (bankQuestion) => {
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType];
    if (!mappedType) return;

    pendingBankApplyRef.current = bankQuestion;
    questionRichTextManager.handleInitData(bankQuestion.question);
    setBankApplyKey((k) => k + 1);
    setUseBank(false);
    setTabIndex(QUESTION_TYPES.indexOf(mappedType));
  };

  useEffect(() => {
    const bankQuestion = pendingBankApplyRef.current;
    if (!bankQuestion) return;
    pendingBankApplyRef.current = null;
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType];
    if (!mappedType) return;

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
    }

    toast({
      description: "Question loaded from the bank — review and edit before saving",
      position: "top",
      status: "info",
    });
    // `bankApplyKey` (not the tab index) is the trigger: it changes on every
    // apply even when the picked question's type matches the current tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankApplyKey]);

  // ── Editing a queued (bank-added, not-yet-created) question ─────────────
  // Clicking a queued tile in "List Of Questions" lands here with
  // `queuedIndex` instead of a real question id. Hydrate the form from that
  // queue entry's already-built payload (same shape `onSubmit` writes when
  // saving it back), reusing the same tab-switch-then-fill trick as the bank
  // apply flow above.
  const pendingQueuedApplyRef = useRef(null);
  const appliedQueuedIndexRef = useRef(null);

  useEffect(() => {
    if (!isEditingQueued) {
      appliedQueuedIndexRef.current = null;
      return;
    }
    if (appliedQueuedIndexRef.current === queuedIndex) return;
    appliedQueuedIndexRef.current = queuedIndex;

    const qData = queuedItem.data;
    pendingQueuedApplyRef.current = qData;
    questionRichTextManager.handleInitData(qData.question);
    setBankApplyKey((k) => k + 1);
    setMarkingType(qData.markingType || "automatic");
    setSelectedSectionId(qData.section || "");

    // Prefer the explicit type this queue entry was saved with — falls back
    // to shape-sniffing only for older shapes that never carried one.
    if (qData.questionType && QUESTION_TYPES.includes(qData.questionType)) {
      setTabIndex(QUESTION_TYPES.indexOf(qData.questionType));
    } else if (
      Array.isArray(qData.options) &&
      qData.options.length === 2 &&
      qData.options.every((o) => (o.name ?? o.option) === "True" || (o.name ?? o.option) === "False")
    ) {
      setTabIndex(QUESTION_TYPES.indexOf("TrueFalse"));
    } else {
      setTabIndex(QUESTION_TYPES.indexOf("MCQ"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingQueued, queuedIndex]);

  useEffect(() => {
    const qData = pendingQueuedApplyRef.current;
    if (!qData) return;
    pendingQueuedApplyRef.current = null;

    if (Array.isArray(qData.options) && qData.options.length) {
      qData.options.forEach((o) => setValue(`option-${o.optionIndex}`, o.name ?? o.option ?? ""));
      const correct = qData.options.find((o) => o.isAnswer);
      if (correct) setAnswer(String(correct.optionIndex));
    } else if (qData.questionType === "FillBlank") {
      setValue("correctAnswer", qData.correctAnswer || "");
    } else if (qData.questionType === "ShortAnswer") {
      setValue("modelAnswer", qData.modelAnswer || "");
    } else if (qData.questionType === "Essay") {
      setValue("rubricDescription", qData.rubricDescription || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankApplyKey]);

  // Arrived here straight from the Question Bank via "Next" on the details
  // form — prefill this first question from the bank item the admin picked,
  // same mapping as manually applying a bank question above.
  // ── Queue Question Bank items directly into pendingCreate/pendingEdit —
  // used both by the plural fromBankQuestionIds hand-off below and by the
  // "Question Bank" multi-select modal opened mid-creation.
  const buildQueuedItemFromBankQuestion = (bankQuestion) => {
    const sectionTitle = selectedSectionId || undefined;
    const data = buildBankQuestionData(bankQuestion, isExamination, sectionTitle);
    if (!data) {
      toast({
        description: `Skipped "${bankQuestion.question}" — this question type isn't supported here.`,
        position: "top",
        status: "warning",
      });
      return null;
    }
    return { data };
  };

  const queueBankQuestions = async (bankQuestions) => {
    // Already-real exam (not pending creation/edit) — nothing to queue,
    // create each picked question for real right away.
    if (!isPendingCreation && !isPendingEditSubmit) {
      const rawItems = bankQuestions
        .map((bq) => buildBankQuestionData(bq, isExamination, selectedSectionId || undefined))
        .filter(Boolean);
      const existingTexts = (assessmentManager.assessment?.questions || []).map((q) =>
        normalizeQuestionText(q.question),
      );
      const { kept: items, duplicates } = filterDuplicateQuestions(rawItems, existingTexts, (d) => d.question);
      if (!items.length) {
        if (duplicates) {
          toast({
            description: `Skipped ${duplicates} question${duplicates === 1 ? "" : "s"} — already added to this exam.`,
            position: "top",
            status: "warning",
          });
        }
        return;
      }
      try {
        for (const data of items) {
          await adminCreateStandaloneExaminationQuestion(data);
        }
        toast({
          description: `${items.length} question${items.length === 1 ? "" : "s"} added.${
            duplicates ? ` ${duplicates} skipped — already added to this exam.` : ""
          }`,
          position: "top",
          status: "success",
        });
        assessmentManager.handleFetch(true);
      } catch (err) {
        toast({
          description: "Couldn't add one or more questions — please try again",
          position: "top",
          status: "error",
        });
      }
      return;
    }

    const { kept, skipped } = filterBankQuestionsByTypeQuota(bankQuestions, {
      usingTemplateTypeRestriction,
      templateSupportedTypes,
      typeQuota,
      queuedTypeCounts,
    });

    const builtItems = kept.map(buildQueuedItemFromBankQuestion).filter(Boolean);
    const queuedTexts = (queuedSource?.questions || []).map((q) => normalizeQuestionText(q.data?.question));
    const { kept: items, duplicates } = filterDuplicateQuestions(builtItems, queuedTexts, (q) => q.data.question);
    if (!items.length) {
      const skippedParts = [
        skipped ? `${skipped} already at the configured Quantity for that type` : null,
        duplicates ? `${duplicates} already queued for this exam` : null,
      ].filter(Boolean);
      if (skippedParts.length) {
        toast({
          description: `Skipped ${skippedParts.join(", ")}.`,
          position: "top",
          status: "warning",
        });
      }
      return;
    }

    if (isPendingCreation) {
      setPendingCreate({ ...pendingCreate, questions: [...(pendingCreate.questions || []), ...items] });
    } else {
      setPendingEdit({ ...pendingEdit, questions: [...(pendingEdit.questions || []), ...items] });
    }

    toast({
      description: `${items.length} question${items.length === 1 ? "" : "s"} added from the bank.${
        skipped ? ` ${skipped} skipped — already at the configured Quantity for that type.` : ""
      }${duplicates ? ` ${duplicates} skipped — already queued for this exam.` : ""} They'll be created once you submit for approval.`,
      position: "top",
      status: "success",
    });
  };

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
        console.error("[QuestionsStandalone] failed to load bank questions for prefill", fromBankQuestionIds, err?.response?.data ?? err);
        toast({ description: "Couldn't load the picked question(s) from the bank", position: "top", status: "error" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingCreation, fromBankQuestionIds]);

  // Hydrate form when editing an existing question
  useEffect(() => {
    if (!question) return;
    if (question.markingType) setMarkingType(question.markingType);
    if (question.section) setSelectedSectionId(question.section);

    // Detect question type: prefer the explicit field, fall back to shape-sniffing
    // for questions saved before questionType was sent.
    if (question.questionType && QUESTION_TYPES.includes(question.questionType)) {
      setTabIndex(QUESTION_TYPES.indexOf(question.questionType));
    } else if (question.pairs?.length) {
      setTabIndex(QUESTION_TYPES.indexOf("Matching"));
    } else if (question.correctAnswer && !question.options?.length) {
      setTabIndex(QUESTION_TYPES.indexOf("FillBlank"));
    } else if (question.options?.length === 2) {
      setTabIndex(1); // TrueFalse
    } else {
      setTabIndex(0); // MCQ default
    }

    [1, 2, 3, 4].forEach((num) => {
      const opt = question.options?.find((o) => o.optionIndex === num);
      if (opt) setValue(`option-${num}`, opt.name ?? opt.option ?? "");
    });

    const correct = question.options?.find((o) => o.isAnswer);
    if (correct) setAnswer(`${correct.optionIndex}`);

    if (question.correctAnswer) setValue("correctAnswer", question.correctAnswer);
    if (question.modelAnswer) setValue("modelAnswer", question.modelAnswer);
    if (question.rubricDescription) setValue("rubricDescription", question.rubricDescription);
    if (Array.isArray(question.acceptVariants) && question.acceptVariants.length > 0) {
      setAcceptVariants(question.acceptVariants);
    }
    if (Array.isArray(question.pairs) && question.pairs.length > 0) {
      setMatchingPairs(question.pairs);
    }

    questionRichTextManager.handleInitData(question.question);
    // MUIRichTextEditor only reads defaultValue on mount, so force a
    // remount (same trick applyBankQuestion uses) to pick up the loaded text.
    setBankApplyKey((k) => k + 1);

    questionImageManager.handleInitialImageSelect(question.file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (tabIndex === 1) {
      setValue("option-1", "True");
      setValue("option-2", "False");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  const handleAddPair = () =>
    setMatchingPairs((p) => [...p, { left: "", right: "" }]);
  const handleRemovePair = (idx) =>
    setMatchingPairs((p) => p.filter((_, i) => i !== idx));
  const handlePairChange = (idx, side, value) =>
    setMatchingPairs((p) =>
      p.map((pair, i) => (i === idx ? { ...pair, [side]: value } : pair)),
    );

  const handleAddVariant = () => {
    const variant = variantInput.trim();
    if (variant && !acceptVariants.includes(variant)) {
      setAcceptVariants((prev) => [...prev, variant]);
    }
    setVariantInput("");
  };
  const handleRemoveVariant = (variant) =>
    setAcceptVariants((prev) => prev.filter((v) => v !== variant));

  const onSubmit = async (data) => {
    try {
      // ── Delete mode ──
      if (isExistingQuestion && !isEditMode) {
        if (!window.confirm("Are you sure you want to delete this question?"))
          return;
        const { message } = await adminDeleteStandaloneExaminationQuestion(
          question.id,
        );
        toast({
          description: capitalizeFirstLetter(message || "Question deleted"),
          position: "top",
          status: "success",
        });
        assessmentManager.handleFetch(true);
        push(getQuestionListingLink(isExamination));
        return;
      }

      // `overrideData` lets a question queued earlier (e.g. from the
      // multi-select Question Bank picker) be saved here instead of this
      // render's own form data. Defined up here (rather than after the
      // question-text validation below) because the "Create and Submit
      // with nothing new to add" branch right after this needs it before
      // that validation runs.
      // NOTE: the fallback object literals below reference `questionPlainText`/
      // `sectionTitle`/`typeSpecificFields`, which aren't declared until
      // further down this same function — safe only because every call site
      // either passes an explicit `overrideData` (short-circuiting the `||`
      // before those names are ever read) or runs later in this same
      // invocation, after they've been assigned.
      const saveQuestion = async (realParentId, overrideData) => {
        if (isEditMode) {
          const body = {
            standAloneExaminationQuestionId: questionId,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...typeSpecificFields,
          };
          return adminEditStandaloneExaminationQuestion(body);
        }
        const baseBody =
          overrideData || {
            standAloneExaminationId: isExamination,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...typeSpecificFields,
          };
        const body = isPendingCreation ? withRealParentId(baseBody, realParentId) : baseBody;
        return adminCreateStandaloneExaminationQuestion(body);
      };

      // "Create and Submit"/"Update and Submit" clicked with the current
      // form left genuinely blank (typically right after "Save Changes" on
      // a queued item, which returns to a fresh blank form) while at least
      // one question is already queued. There's nothing new here to
      // validate or add — skip straight to submitting exactly what's
      // already queued instead of forcing the question-text validation
      // below (which would otherwise demand a phantom extra question, or
      // previously, before the queue was cleared on save, silently
      // resubmitted whatever question was last on the form as a duplicate).
      const hasQueuedAlready = (queuedSource?.questions?.length || 0) > 0;
      const currentFormIsBlank = !questionRichTextManager.getPlainText().trim();

      // "Create and Submit"/"Update and Submit" clicked with nothing new on
      // the form — nothing to queue, just go straight to "See All" (its own
      // "Create and Submit" trigger is what actually submits now).
      if ((isPendingCreation || isPendingEditSubmit) && !isEditingQueued && goToListingRef.current && currentFormIsBlank) {
        goToListingRef.current = false;
        goToQueuedListing();
        return;
      }

      if (
        (isPendingCreation || isPendingEditSubmit) &&
        !isEditingQueued &&
        !addAnotherRef.current &&
        !goToListingRef.current &&
        hasQueuedAlready &&
        currentFormIsBlank
      ) {
        if (isPendingCreation) {
          const createBoth = async () => {
            const parent = createdParentRef.current || (await performCreateParent());
            createdParentRef.current = parent;
            const { duplicates } = await saveQueuedBatch(
              pendingCreate.questions || [],
              savedQueueItemsRef.current,
              (queued) => saveQuestion(parent.id, queued.data),
            );
            if (duplicates) {
              toast({
                description: `${duplicates} duplicate question${duplicates === 1 ? "" : "s"} skipped — the rest were saved.`,
                position: "top",
                status: "warning",
              });
            }
            // No `maybeAddToBank()` here — that call is for the *current*
            // form's question, and this branch only runs when the current
            // form is intentionally blank (nothing new to add to the bank).
            return { id: parent.id };
          };

          pendingCreateBothRef.current = createBoth;
          setWorkflowContent({
            contentTitle: pendingCreate.title,
            requestType: "StandaloneExam",
          });
        } else {
          const editBoth = async () => {
            const parent = createdParentRef.current || (await performEditParent());
            createdParentRef.current = parent;
            const { duplicates } = await saveQueuedBatch(
              pendingEdit.questions || [],
              savedQueueItemsRef.current,
              (queued) => saveQuestion(undefined, queued.data),
            );
            if (duplicates) {
              toast({
                description: `${duplicates} duplicate question${duplicates === 1 ? "" : "s"} skipped — the rest were saved.`,
                position: "top",
                status: "warning",
              });
            }
            return { id: parent.id };
          };

          pendingCreateBothRef.current = editBoth;
          setWorkflowContent({
            contentId: pendingEdit.contentId,
            contentTitle: pendingEdit.title,
            requestType: pendingEdit.requestType || "StandaloneExam",
          });
        }
        setWorkflowModalOpen(true);
        return;
      }

      // ── Validate question text ──
      const questionPlainText = questionRichTextManager.getPlainText().trim();
      if (!questionPlainText) throw new Error("Question text is required");

      const sectionTitle = selectedSectionId || undefined;
      const isObjectiveType =
        questionType === "MCQ" || questionType === "TrueFalse";

      // ── Build options ──
      let options = [];
      if (isObjectiveType) {
        options = buildOptions({ ...data, answer });
        if (questionType === "TrueFalse") options = options.slice(0, 2);
        if (!options.find((o) => o.isAnswer))
          throw new Error("Please select the correct answer");
      } else if (questionType === "Matching") {
        if (matchingPairs.some((p) => !p.left.trim() || !p.right.trim()))
          throw new Error("All matching pairs must have both values filled");
      }

      // "Exam without sections" / hybrid's "Standalone Questions" tab: don't
      // allow saving a new question of a type the marking template doesn't
      // support, or one that's already at its configured Quantity. Editing a
      // queued item in place isn't adding a new one, so it's exempt.
      if (!isEditingQueued && usingTemplateTypeRestriction && typeAtCapacity(questionType)) {
        if (templateSupportedTypes && !templateSupportedTypes.includes(questionType)) {
          throw new Error(
            `${TYPE_LABEL[questionType] ?? questionType} isn't one of the question types in the selected marking template.`,
          );
        }
        const quota = typeQuota(questionType);
        throw new Error(
          `You've reached the ${quota} ${TYPE_LABEL[questionType] ?? questionType} question${quota === 1 ? "" : "s"} you specified for this exam.`,
        );
      }

      // Plain "Add Question" on an already-real exam: pending/pendingEdit
      // paths enforce this same overall cap after queuing (see
      // finishSaving/the "reached limit" toasts above) — this is the one
      // remaining case (adding straight to a real exam, not via the queue)
      // that could otherwise create more questions than the exam was
      // configured for.
      if (!isPendingCreation && !isPendingEditSubmit && !isEditMode && !isEditingQueued) {
        const existingCount = assessmentManager.assessment?.questions?.length || 0;
        if (amountOfQuestions && existingCount >= amountOfQuestions) {
          throw new Error(
            `You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this exam — you can't add another question.`,
          );
        }
      }

      const maybeAddToBank = async (forceAdd) => {
        if (isEditMode || !(addToBank || autoAddToBank || forceAdd)) return;
        const bankType = FORM_TYPE_TO_BANK_TYPE[questionType];
        if (!bankType) {
          toast({
            description: "This question type isn't supported by the Question Bank yet",
            position: "top",
            status: "warning",
          });
          return;
        }
        let bankPayload;
        try {
          bankPayload = {
            question: questionPlainText,
            questionType: bankType,
            marks: 1,
            difficultyLevel: "Medium",
            status: "draft",
          };
          if (isObjectiveType) {
            const bankOptions = options.map((o) => ({
              text: o.option ?? o.name ?? "",
              isCorrect: !!o.isAnswer,
            }));
            bankPayload.options = bankOptions.filter((o) => o.text);
            bankPayload.correctAnswer =
              bankOptions.find((o) => o.isCorrect)?.text ?? "";
          } else if (questionType === "FillBlank") {
            bankPayload.correctAnswer = data.correctAnswer || "";
          }
          await createExamQuestionBankItem(bankPayload);
        } catch (bankErr) {
          console.error("[QuestionsStandalone] failed to add question to bank", bankPayload, bankErr?.response?.data ?? bankErr);
          toast({
            description:
              bankErr?.response?.data?.message ||
              "Question saved, but failed to add it to the Question Bank",
            position: "top",
            status: "warning",
          });
        }
      };

      // ── Type-specific fields (FillBlank/Matching need explicit questionType
      // since they carry neither `options` nor an inferable shape) ──
      const typeSpecificFields = isObjectiveType
        ? { options }
        : questionType === "FillBlank"
          ? {
              questionType: "FillBlank",
              correctAnswer: data.correctAnswer,
              ...(acceptVariants.length > 0 && { acceptVariants }),
            }
          : questionType === "Matching"
            ? { questionType: "Matching", pairs: JSON.stringify(matchingPairs) }
            : questionType === "ShortAnswer"
              ? { questionType: "ShortAnswer", modelAnswer: data.modelAnswer }
              : questionType === "Essay"
                ? { questionType: "Essay", rubricDescription: data.rubricDescription }
                : {};

      // ── Editing a queued (bank-added, not-yet-created) question in place ──
      // Nothing to save to the backend yet — just overwrite this slot in
      // pendingCreate/pendingEdit.questions and go back to a blank pending form.
      if (isEditingQueued) {
        const updatedData = {
          standAloneExaminationId: isExamination,
          question: questionPlainText,
          ...(sectionTitle && { section: sectionTitle }),
          markingType,
          ...typeSpecificFields,
        };
        const updatedQuestions = (queuedSource.questions || []).map((q, i) =>
          i === queuedIndex ? { ...q, data: updatedData } : q,
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
        // Reset to a genuinely blank form before returning — the rich-text
        // editor's content lives in `questionRichTextManager`'s own state,
        // not react-hook-form, so without clearing it the question text
        // stayed on screen after "Save Changes". Submitting from there
        // without typing anything new resubmitted the identical,
        // already-queued content as an extra question on "Create and
        // Submit" — the backend rejected it as a duplicate.
        reset();
        questionRichTextManager.handleInitData(null);
        setBankApplyKey((k) => k + 1);
        goToQueueAnotherQuestion();
        return;
      }

      if (isPendingCreation) {
        // "Add more questions" queues this one locally and offers a fresh
        // blank form; "Create and Submit" (goToListingRef) queues it the
        // same way but heads to "See All" instead — nothing is
        // created/saved here until that page's own "Create and Submit"
        // trigger runs.
        if (addAnotherRef.current || goToListingRef.current) {
          const wentToListing = goToListingRef.current;
          addAnotherRef.current = false;
          goToListingRef.current = false;
          const queuedData = {
            standAloneExaminationId: isExamination,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...typeSpecificFields,
          };
          const updatedQuestions = [...(pendingCreate.questions || []), { data: queuedData }];
          setPendingCreate({ ...pendingCreate, questions: updatedQuestions });
          reset();
          // `reset()` doesn't touch the rich-text editor's own state — clear
          // it too so the next blank form doesn't still show this question's
          // text (which risked getting resubmitted as a duplicate).
          questionRichTextManager.handleInitData(null);
          setBankApplyKey((k) => k + 1);

          // Sectioned exam: once the section this question was just queued
          // under has hit its own configured Question Count, move on to the
          // next section that still needs questions instead of leaving the
          // admin stuck adding more to an already-complete one.
          const countForSection = (name) =>
            updatedQuestions.filter((q) => q.data.section === name).length;
          const sectionJustCompleted =
            isSectionedExam &&
            sectionTitle &&
            sectionQuestionCounts[sectionTitle] > 0 &&
            countForSection(sectionTitle) >= sectionQuestionCounts[sectionTitle];
          const nextSection = sectionJustCompleted
            ? templateSections.find(
                (name) =>
                  name !== sectionTitle &&
                  !(sectionQuestionCounts[name] > 0 && countForSection(name) >= sectionQuestionCounts[name]),
              )
            : null;

          // This question is safely queued either way — only decide here
          // whether there's room left to offer another blank form, so
          // hitting the limit never costs the question just filled out.
          if (amountOfQuestions && updatedQuestions.length >= amountOfQuestions) {
            toast({
              description: `Question queued. You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this exam — submit this for approval to finish.`,
              position: "top",
              status: "info",
            });
            goToQueuedListing();
          } else if (wentToListing) {
            toast({
              description: "Question queued — review everything and submit for approval from here",
              position: "top",
              status: "success",
            });
            goToQueuedListing();
          } else if (sectionJustCompleted && nextSection) {
            setSelectedSectionId(nextSection);
            toast({
              description: `You've completed the ${sectionQuestionCounts[sectionTitle]} question${sectionQuestionCounts[sectionTitle] === 1 ? "" : "s"} for "${sectionTitle}" — now add questions for "${nextSection}".`,
              position: "top",
              status: "success",
            });
            goToQueueAnotherQuestion();
          } else {
            toast({
              description: "Question queued — it'll be created once you submit for approval",
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
          const parent = createdParentRef.current || (await performCreateParent());
          createdParentRef.current = parent;
          // Questions queued via the Question Bank picker while this exam
          // was still pending — created alongside the one on this form.
          const { duplicates } = await saveQueuedBatch(
            pendingCreate.questions || [],
            savedQueueItemsRef.current,
            (queued) => saveQuestion(parent.id, queued.data),
          );
          if (duplicates) {
            toast({
              description: `${duplicates} duplicate question${duplicates === 1 ? "" : "s"} skipped — the rest were saved.`,
              position: "top",
              status: "warning",
            });
          }
          if (!currentFormSavedRef.current) {
            await saveQuestion(parent.id);
            // The exam-level "auto add every question" flag was just set on
            // the real ID above — the render-scoped `autoAddToBank` above is
            // still stale for this same call, so check the source directly.
            await maybeAddToBank(pendingCreate.addToBank);
            currentFormSavedRef.current = true;
          }
          return { id: parent.id };
        };

        pendingCreateBothRef.current = createBoth;
        setWorkflowContent({
          contentTitle: pendingCreate.title,
          requestType: "StandaloneExam",
        });
        setWorkflowModalOpen(true);
        return;
      }

      if (isPendingEditSubmit) {
        // Same deferral as the isPendingCreation branch above, but for an
        // exam that already exists: queue instead of saving right away.
        if (addAnotherRef.current || goToListingRef.current) {
          const wentToListing = goToListingRef.current;
          addAnotherRef.current = false;
          goToListingRef.current = false;
          const queuedData = {
            standAloneExaminationId: isExamination,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...typeSpecificFields,
          };
          const updatedQuestions = [...(pendingEdit.questions || []), { data: queuedData }];
          setPendingEdit({ ...pendingEdit, questions: updatedQuestions });
          reset();
          // `reset()` doesn't touch the rich-text editor's own state — clear
          // it too so the next blank form doesn't still show this question's
          // text (which risked getting resubmitted as a duplicate).
          questionRichTextManager.handleInitData(null);
          setBankApplyKey((k) => k + 1);
          if (amountOfQuestions && updatedQuestions.length >= amountOfQuestions) {
            toast({
              description: `Question queued. You've reached the ${amountOfQuestions} question${amountOfQuestions === 1 ? "" : "s"} you specified for this exam — submit this for approval to finish.`,
              position: "top",
              status: "info",
            });
            goToQueuedListing();
          } else if (wentToListing) {
            toast({
              description: "Question queued — review everything and submit for approval from here",
              position: "top",
              status: "success",
            });
            goToQueuedListing();
          } else {
            toast({
              description: "Question queued — it'll be saved once you submit for approval",
              position: "top",
              status: "success",
            });
            goToQueueAnotherQuestion();
          }
          return;
        }

        // The exam already exists — "editBoth" is the single unit of work
        // that actually changes anything, held back until the approval
        // modal's assigned supervisor (or an explicit null, for super
        // admin) triggers it.
        const editBoth = async () => {
          const parent = createdParentRef.current || (await performEditParent());
          createdParentRef.current = parent;
          const { duplicates } = await saveQueuedBatch(
            pendingEdit.questions || [],
            savedQueueItemsRef.current,
            (queued) => saveQuestion(undefined, queued.data),
          );
          if (duplicates) {
            toast({
              description: `${duplicates} duplicate question${duplicates === 1 ? "" : "s"} skipped — the rest were saved.`,
              position: "top",
              status: "warning",
            });
          }
          if (!currentFormSavedRef.current) {
            await saveQuestion();
            currentFormSavedRef.current = true;
          }
          return { id: parent.id };
        };

        pendingCreateBothRef.current = editBoth;
        setWorkflowContent({
          contentId: pendingEdit.contentId,
          contentTitle: pendingEdit.title,
          requestType: pendingEdit.requestType || "StandaloneExam",
        });
        setWorkflowModalOpen(true);
        return;
      }

      await saveQuestion();
      await maybeAddToBank();

      toast({
        description: "Question saved successfully",
        position: "top",
        status: "success",
      });
      reset();
      assessmentManager.handleFetch(true);

      if (isEditMode) {
        push(getEditQuestionLink(isExamination, questionId));
      } else {
        finishSaving();
      }
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  if (createdSuccess) {
    return (
      <Box padding={10} textAlign="center" width="70%">
        <Text bold fontSize="lg" mb={2}>
          Question added successfully!
        </Text>
        <Text color="gray.500" mb={6}>
          This exam is set for {amountOfQuestions} questions — add the rest
          now, or come back to it later.
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

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      padding={6}
      width={{ base: "100%", md: "100%", lg: "70%" }}
    >
      {/* ── Section tabs ("Exam with sections" only) ── */}
      {isSectionedExam && templateSections.length > 0 && (
        <Box paddingX="20px" paddingTop="16px" backgroundColor="white">
          <Text fontSize="sm" fontWeight="600" color="#1A202C" mb={2}>
            Section
          </Text>
          <Tabs
            colorScheme="purple"
            index={Math.max(sectionTabValues.indexOf(selectedSectionId), 0)}
            onChange={(idx) => setSelectedSectionId(sectionTabValues[idx])}
          >
            <TabList borderBottom="1px solid #E2E8F0">
              {sectionTabValues.map((name) => (
                <Tab
                  key={name || "__standalone__"}
                  _selected={{
                    color: "#6b006b",
                    borderColor: "#6b006b",
                    fontWeight: "bold",
                  }}
                  fontSize="sm"
                >
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
              This exam is set for {amountOfQuestions} question{amountOfQuestions === 1 ? "" : "s"} — that
              many have already been added. Remove one first if you need to replace it, or head to{" "}
              <Text as="span" fontWeight="700">See All</Text> to review what's there.
            </Text>
          </Box>
        </Box>
      )}

      {/* ── Question text + image ── */}
      <Box
        paddingTop="20px"
        paddingX="20px"
        paddingBottom="40px"
        backgroundColor="white"
      >
        <Heading fontSize="22px" mb={6} color="#1A202C">
          {getQuestionNumber(
            question && questionId
              ? question.index
              : isEditingQueued
                ? (assessmentManager.assessment?.questions?.length || 0) + queuedIndex
                : assessmentManager.assessment?.questions?.length,
          )}
        </Heading>

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
            label="Question"
            placeholder="Enter your question here..."
            onChange={questionRichTextManager.handleChange}
            defaultValue={questionRichTextManager.data.default}
          />
        )}

        <Box marginTop={8} bg="#F7FAFC" p={4} borderRadius="8px">
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

      {/* ── Read-only summary (view mode) ── */}
      {isExistingQuestion && !isEditMode && (
        <Box marginTop={6} padding={6} backgroundColor="white">
          <Heading fontSize="18px" mb={4} color="#1A202C">
            Question Details
          </Heading>

          <Flex gap={2} mb={5} flexWrap="wrap">
            <Badge bg="#F0E6FF" color="#6b006b" borderRadius="4px" fontSize="11px" textTransform="none" px={2} py={1}>
              {TYPE_LABEL[question?.questionType] ?? question?.questionType ?? "MCQ"}
            </Badge>
            {question?.difficultyLevel && (
              <Badge bg="#F7FAFC" color="gray.500" borderRadius="4px" fontSize="11px" textTransform="none" px={2} py={1}>
                {question.difficultyLevel}
              </Badge>
            )}
            {question?.tags?.map((tag) => (
              <Badge key={tag} bg="#EBF4FF" color="#3182CE" borderRadius="4px" fontSize="11px" textTransform="none" px={2} py={1}>
                {tag}
              </Badge>
            ))}
          </Flex>

          {(() => {
            // `question.options` can come back as an array keyed `name` (manually
            // created questions), an array keyed `option` (bank/queued-question
            // paths — see buildOptions in QuestionsPage.jsx), or a letter-keyed
            // object (batch-imported rows) — normalizeOptions already reconciles
            // all three shapes for the staged-review flow, so reuse it here too.
            const viewOptions = normalizeOptions({ options: question?.options });
            return (
              viewOptions.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="500" mb={2} color="#1A202C">
                    Options
                  </Text>
                  {viewOptions.map((opt) => (
                    <Flex key={opt.id ?? opt.optionIndex} alignItems="center" gap={2} mb={2}>
                      <Box
                        boxSize="16px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={opt.isAnswer ? "#38A169" : "#CBD5E0"}
                        bg={opt.isAnswer ? "#38A169" : "transparent"}
                        flexShrink={0}
                      />
                      <Text fontSize="14px" color={opt.isAnswer ? "#276749" : "#4A5568"} fontWeight={opt.isAnswer ? "600" : "400"}>
                        {opt.name}
                      </Text>
                    </Flex>
                  ))}
                </Box>
              )
            );
          })()}
        </Box>
      )}

      {/* ── Settings + Answer Options ── */}
      {(!isExistingQuestion || isEditMode) && (
        <Box marginTop={6} padding={6} backgroundColor="white">
          <Heading fontSize="18px" mb={4} color="#1A202C">
            Question Settings
          </Heading>

          <Box mb={6} pb={4} borderBottom="1px solid #E2E8F0">
            <Flex justifyContent="space-between" alignItems="center" mb={useBank ? 3 : 0}>
              <Text fontSize="sm" fontWeight="600" color="#1A202C">
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
              <Box backgroundColor="#F7FAFC" borderRadius="8px" p={3}>
                <Flex gap={2} mb={3}>
                  <ChakraInput
                    size="sm"
                    bg="white"
                    placeholder="Search bank questions..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchBank()}
                  />
                  <Button size="xs" onClick={searchBank} disabled={bankLoading} type="button">
                    Search
                  </Button>
                </Flex>
                <Stack spacing={2} maxHeight="220px" overflowY="auto">
                  {bankResults.map((bq) => {
                    const supported = Boolean(BANK_TYPE_TO_FORM_TYPE[bq.questionType]);
                    return (
                      <Flex
                        key={bq.id}
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor="white"
                        p={2}
                        borderRadius="6px"
                        border="1px solid #E2E8F0"
                        gap={3}
                      >
                        <Text fontSize="xs" noOfLines={2}>
                          {bq.question}
                        </Text>
                        <Button
                          size="xs"
                          type="button"
                          disabled={!supported}
                          title={!supported ? "Not supported in this form" : undefined}
                          onClick={() => applyBankQuestion(bq)}
                        >
                          Use
                        </Button>
                      </Flex>
                    );
                  })}
                  {!bankLoading && bankResults.length === 0 && (
                    <Text fontSize="xs" color="gray.400">
                      No matching questions found.
                    </Text>
                  )}
                </Stack>
              </Box>
            )}
          </Box>

          <Flex gap={4} mb={6} flexWrap="wrap" alignItems="flex-end">
            {/* Marking Type */}
            <Box minW="180px">
              <Text fontSize="sm" fontWeight="500" mb={1} color="#1A202C">
                Marking Type
              </Text>
              <ChakraSelect
                value={markingType}
                onChange={(e) => setMarkingType(e.target.value)}
                size="sm"
                bg="white"
                borderColor="#E2E8F0"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="hybrid">Hybrid</option>
              </ChakraSelect>
            </Box>

            {/* Section — the tabs above already cover this for "Exam with
                sections" and hybrid (which gets its own "Standalone
                Questions" tab alongside its real sections); this dropdown is
                only for every other case (without-sections/existing exams
                with no section-tab support), unchanged. */}
            {!isSectionedExam && (
              <Box minW="220px">
                <Flex justifyContent="space-between" alignItems="baseline">
                  <Text fontSize="sm" fontWeight="500" mb={1} color="#1A202C">
                    Section{" "}
                    {sectionsLoading && (
                      <Text as="span" fontSize="xs" color="gray.400">
                        (loading…)
                      </Text>
                    )}
                  </Text>
                  {isExamination && (
                    <Link
                      href={`/admin/exam-paper-config/${isExamination}?examType=standalone_examination`}
                    >
                      <Text fontSize="xs" color="#6b006b">
                        Configure sections
                      </Text>
                    </Link>
                  )}
                </Flex>
                <ChakraSelect
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  size="sm"
                  bg="white"
                  borderColor="#E2E8F0"
                  disabled={sectionsLoading || templateSections.length === 0}
                  placeholder={
                    sectionsLoading
                      ? "Loading sections…"
                      : templateSections.length === 0
                        ? "No sections available"
                        : "Select a section"
                  }
                >
                  {templateSections.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </ChakraSelect>
              </Box>
            )}
          </Flex>

          <Heading fontSize="18px" mb={4} color="#1A202C">
            Answer Options
          </Heading>

          <Tabs
            colorScheme="purple"
            index={tabIndex}
            onChange={(idx) => {
              setTabIndex(idx);
              setAnswer("");
            }}
          >
            <TabList borderBottom="1px solid #E2E8F0" mb="24px">
              {[
                ["MCQ", "Multiple Choice (MCQ)"],
                ["TrueFalse", "True / False"],
                ["Matching", "Matching"],
                ["FillBlank", "Fill in the Blank"],
                ["ShortAnswer", "Short Answer"],
                ["Essay", "Essay"],
              ].map(([type, label]) => (
                <Tab
                  key={type}
                  display={
                    (allowedTypesForSection && !allowedTypesForSection.includes(type)) ||
                    (usingTemplateTypeRestriction && typeAtCapacity(type))
                      ? "none"
                      : undefined
                  }
                  _selected={{
                    color: "#6b006b",
                    borderColor: "#6b006b",
                    fontWeight: "bold",
                  }}
                  fontSize="sm"
                >
                  {label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* MCQ */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Select the correct answer
                </Text>
                {[1, 2, 3, 4].map((num) => (
                  <Flex key={num} mb={4} alignItems="center" gap={3}>
                    <input
                      type="radio"
                      name="mcq-answer"
                      value={`${num}`}
                      checked={answer === `${num}`}
                      onChange={(e) => setAnswer(e.target.value)}
                      style={{
                        accentColor: "#6b006b",
                        transform: "scale(1.3)",
                        flexShrink: 0,
                      }}
                    />
                    <Box flex={1}>
                      <Input
                        id={`option-${num}`}
                        label={`Option ${num}`}
                        placeholder={`Enter option ${num}`}
                        {...register(`option-${num}`)}
                      />
                    </Box>
                  </Flex>
                ))}
              </TabPanel>

              {/* True / False */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Select the correct answer
                </Text>
                {["True", "False"].map((label, i) => (
                  <Flex key={label} mb={4} alignItems="center" gap={3}>
                    <input
                      type="radio"
                      name="tf-answer"
                      value={`${i + 1}`}
                      checked={answer === `${i + 1}`}
                      onChange={(e) => setAnswer(e.target.value)}
                      style={{
                        accentColor: "#6b006b",
                        transform: "scale(1.3)",
                        flexShrink: 0,
                      }}
                    />
                    <Box
                      flex={1}
                      border="1px solid #E2E8F0"
                      borderRadius="6px"
                      px={4}
                      py={3}
                      bg="white"
                    >
                      <Text fontWeight="500">{label}</Text>
                    </Box>
                  </Flex>
                ))}
              </TabPanel>

              {/* Matching */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Add matching pairs (left → right)
                </Text>
                {matchingPairs.map((pair, idx) => (
                  <Flex key={idx} gap={3} mb={4} alignItems="flex-end">
                    <Box flex={1}>
                      <Input
                        label={`Left ${idx + 1}`}
                        placeholder="e.g. H₂O"
                        value={pair.left}
                        onChange={(e) =>
                          handlePairChange(idx, "left", e.target.value)
                        }
                      />
                    </Box>
                    <Box color="#6b006b" pb={2}>
                      <FaArrowRight />
                    </Box>
                    <Box flex={1}>
                      <Input
                        label={`Right ${idx + 1}`}
                        placeholder="e.g. Water"
                        value={pair.right}
                        onChange={(e) =>
                          handlePairChange(idx, "right", e.target.value)
                        }
                      />
                    </Box>
                    {matchingPairs.length > 1 && (
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
                <Button ghost onClick={handleAddPair} type="button" mt={2}>
                  + Add Pair
                </Button>
              </TabPanel>

              {/* Fill in the Blank */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Provide the correct answer for the blank
                </Text>
                <Input
                  label="Correct Answer"
                  isRequired
                  placeholder="e.g. Paris"
                  error={errors.correctAnswer?.message}
                  {...register("correctAnswer", {
                    required:
                      questionType === "FillBlank"
                        ? "Correct answer is required"
                        : false,
                  })}
                />

                <Box mt={4}>
                  <Text fontSize="13px" fontWeight="500" color="#1A202C" mb={2}>
                    Accepted Answer Variants (optional)
                  </Text>
                  <Flex gap={2} mb={3}>
                    <Box flex={1}>
                      <Input
                        placeholder="e.g. paris (alternate spelling/case)"
                        value={variantInput}
                        onChange={(e) => setVariantInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddVariant();
                          }
                        }}
                      />
                    </Box>
                    <Button ghost onClick={handleAddVariant} type="button">
                      <Flex alignItems="center" gap="6px">
                        <FaPlus size="11px" /> Add
                      </Flex>
                    </Button>
                  </Flex>
                  {acceptVariants.length > 0 && (
                    <Wrap spacing="8px">
                      {acceptVariants.map((variant) => (
                        <WrapItem key={variant}>
                          <Tag size="md" borderRadius="full" variant="solid" bg="#6b006b" color="white">
                            <TagLabel>{variant}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveVariant(variant)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>
              </TabPanel>

              {/* Short Answer */}
              <TabPanel p={0}>
                <Box backgroundColor="blue.50" borderRadius="md" p={3} mb={4}>
                  <Text color="blue.700" fontSize="sm">
                    This question type is manually graded by the instructor.
                  </Text>
                </Box>
                <Input
                  label="Model Answer"
                  placeholder="Enter the expected model answer"
                  {...register("modelAnswer")}
                />
              </TabPanel>

              {/* Essay */}
              <TabPanel p={0}>
                <Box backgroundColor="blue.50" borderRadius="md" p={3} mb={4}>
                  <Text color="blue.700" fontSize="sm">
                    Essay questions are manually graded by the instructor using
                    the rubric defined in the marking template.
                  </Text>
                </Box>
                <Input
                  label="Rubric Description (optional)"
                  placeholder="e.g. Clarity (5pts), Depth (5pts)"
                  {...register("rubricDescription")}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Add to Question Bank — only offered while creating a brand-new question */}
          {!isExistingQuestion && !isEditingQueued && (
            <Box borderTop="1px solid #E2E8F0" pt={4} mt={6}>
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
      )}

      {/* ── Buttons ── */}
      <Flex justifyContent="flex-end" paddingTop={8} gap={3}>
        {isExistingQuestion && !isEditMode && (
          <Button
            onClick={() =>
              push(
                getEditQuestionLink(isExamination, questionId) + "&edit=true",
              )
            }
            type="button"
          >
            Edit Question
          </Button>
        )}
        {isExistingQuestion && !isEditMode && (
          <Button
            ghost
            onClick={() => push(getQuestionListingLink(isExamination))}
            type="button"
          >
            Next
          </Button>
        )}
        {isEditMode && (
          <Button
            ghost
            onClick={() => push(getEditQuestionLink(isExamination, questionId))}
            type="button"
          >
            Cancel
          </Button>
        )}
        {isEditingQueued && (
          <Button
            ghost
            onClick={goToQueueAnotherQuestion}
            type="button"
          >
            Cancel
          </Button>
        )}
        {isEditingQueued && (
          <Button ghost onClick={handleRemoveQueuedQuestion} type="button">
            Remove Question
          </Button>
        )}
        <Button
          type="submit"
          onClick={() => {
            addAnotherRef.current = false;
            // For a still-pending exam/edit, this button no longer submits
            // for approval directly — it queues whatever's on the form (if
            // anything) and sends the admin to "See All" to review
            // everything queued before actually submitting from there.
            goToListingRef.current =
              !isEditingQueued && (isPendingCreation || isPendingEditSubmit);
          }}
          disabled={isLoading || isSubmitting || error || realAddAtCapacity}
          isLoading={isLoading || isSubmitting}
          leftIcon={isExistingQuestion && !isEditMode ? <FaTrash /> : null}
        >
          {isExistingQuestion && !isEditMode
            ? "Delete Question"
            : isEditMode
              ? "Update Question"
              : isEditingQueued
                ? "Save Changes"
                : isPendingCreation || isPendingEditSubmit
                  ? "See All Questions"
                  : "Add Question"}
        </Button>
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
          <Button ghost link={`/admin/standalone-exams/questions/?examination=${isExamination}`}>
            Add Question
          </Button>
        )}
      </Flex>

      {(isPendingCreation || isPendingEditSubmit) && workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          onCreate={() => pendingCreateBothRef.current()}
          onSuccess={() => {
            const realParentId = createdParentRef.current?.id;
            if (addAnotherRef.current) {
              addAnotherRef.current = false;
              goToAddAnotherQuestion(realParentId);
            } else {
              finishSaving(realParentId);
            }
          }}
        />
      )}

      <SelectBankQuestionsModal
        isOpen={isBankPickerOpen}
        onClose={closeBankPicker}
        onAdd={queueBankQuestions}
      />
    </Box>
  );
};

const QuestionListingPage = ({ assessment, isLoading, error, handleFetch, templateSections = [] }) => {
  const isSuperAdmin = useIsSuperAdmin();
  const toast = useToast();
  const { push } = useHistory();
  const isExamination = useQueryParams().get("examination");
  // This view never carries a `question`/`edit` param, so submitForApproval/
  // editSubmit alone are enough to tell whether the exam/edit is still
  // deferred — same derivation the top-level component uses.
  const isPendingCreation = useQueryParams().get("submitForApproval") === "1";
  const isPendingEditSubmit = useQueryParams().get("editSubmit") === "1";

  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);
  const clearPendingEdit = useAssessmentStore((s) => s.clearPendingEdit);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);

  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [hasSubmittedForApproval, setHasSubmittedForApproval] = useState(false);
  const isBankPickerOpen = useAssessmentStore((s) => s.isBankPickerOpen);
  const closeBankPicker = useAssessmentStore((s) => s.closeBankPicker);
  const questions = Array.isArray(assessment?.questions)
    ? assessment.questions
    : [];

  // Preserve each question's original position (matches the numbering used
  // by the sidebar's flat "List Of Questions" nav) even once they're
  // re-grouped by section below.
  const numberedQuestions = questions.map((q, index) => ({ ...q, __index: index }));
  const sectionNames = templateSections.filter(Boolean);
  const unassignedQuestions = numberedQuestions.filter((q) => !q.section);

  // Queued via "Add more questions"/the Question Bank picker while the exam
  // is still pending creation or its edit hasn't been submitted — nothing
  // real exists for these yet (see pendingCreate/pendingEdit `.questions`).
  const queuedSource = isPendingCreation ? pendingCreate : isPendingEditSubmit ? pendingEdit : null;
  const queuedQuestions = queuedSource?.questions || [];
  const hasQueuedQuestions = queuedQuestions.length > 0;
  const questionsIsEmpty =
    !isLoading && !error && !questions.length && !hasQueuedQuestions;

  // Preserve each queued item's position in `queuedQuestions` (both the
  // numbering below and handleRemoveQueuedQuestion/getEditQueuedQuestionLink
  // key off that original index) even once they're re-grouped by section.
  const numberedQueuedQuestions = queuedQuestions.map((q, index) => ({ ...q, __queuedIndex: index }));
  const unassignedQueuedQuestions = numberedQueuedQuestions.filter((q) => !q.data?.section);

  const renderQueuedCard = (q) => (
    <QueuedQuestionCard
      key={`queued-${q.__queuedIndex}`}
      questionNumber={getQuestionNumber(questions.length + q.__queuedIndex)}
      question={q.data.question}
      editLink={getEditQueuedQuestionLink(
        isExamination,
        q.__queuedIndex,
        isPendingCreation ? "submitForApproval" : "editSubmit",
      )}
      onRemove={() => handleRemoveQueuedQuestion(q.__queuedIndex)}
      marginBottom={4}
    />
  );

  // The exam already exists here — unlike the pending-creation queue, each
  // picked bank question is created for real right away via the normal
  // create-question endpoint, then the list is refetched.
  const saveBankQuestionsForReal = async (bankQuestions) => {
    const rawItems = bankQuestions
      .map((bq) => buildBankQuestionData(bq, assessment?.id))
      .filter(Boolean);
    if (rawItems.length < bankQuestions.length) {
      toast({
        description: "Some questions were skipped — that type isn't supported here.",
        position: "top",
        status: "warning",
      });
    }
    const existingTexts = questions.map((q) => normalizeQuestionText(q.question));
    const { kept: items, duplicates } = filterDuplicateQuestions(rawItems, existingTexts, (d) => d.question);
    if (duplicates) {
      toast({
        description: `Skipped ${duplicates} question${duplicates === 1 ? "" : "s"} — already added to this exam.`,
        position: "top",
        status: "warning",
      });
    }
    if (!items.length) return;
    try {
      for (const data of items) {
        await adminCreateStandaloneExaminationQuestion(data);
      }
      toast({
        description: `${items.length} question${items.length === 1 ? "" : "s"} added.`,
        position: "top",
        status: "success",
      });
      handleFetch(true);
    } catch (err) {
      toast({
        description: "Couldn't add one or more questions — please try again",
        position: "top",
        status: "error",
      });
    }
  };

  // Same Quantity-per-type restriction the create form's Answer Options
  // tabs enforce (see the equivalent block in CreateQuestionPage) — this
  // page has no "current section" concept, so a hybrid exam's standalone
  // quota is checked against every queued item that has no section, same
  // as the create form's "Standalone Questions" tab.
  const isHybridExam = isPendingCreation && pendingCreate?.body?.examType === "hybrid";
  const isUnsectionedExam = isPendingCreation && pendingCreate?.body?.examType === "without_sections";
  const usingTemplateTypeRestriction = isUnsectionedExam || isHybridExam;
  const standaloneQuestionCounts = pendingCreate?.body?.standaloneQuestionCounts || {};
  const templateSupportedTypes =
    usingTemplateTypeRestriction && Object.keys(standaloneQuestionCounts).length > 0
      ? Object.keys(standaloneQuestionCounts)
      : null;
  const queuedTypeCounts = usingTemplateTypeRestriction
    ? queuedQuestions.reduce((acc, q) => {
        if (q.data?.section) return acc;
        const t = inferQueuedQuestionType(q.data);
        if (t) acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {})
    : {};
  const typeQuota = (type) => {
    const raw = standaloneQuestionCounts[type];
    return raw !== undefined && raw !== null && raw !== "" ? Number(raw) : null;
  };

  // Nothing has been created yet — queue instead of hitting the
  // create-question endpoint (which needs a real examination id). Same
  // mapping used to build the pending-creation queue via "Add more
  // questions"; the placeholder `standAloneExaminationId` gets swapped for
  // the real one once "Create and Submit"/"Update and Submit" runs below.
  const queueBankQuestions = async (bankQuestions) => {
    const { kept, skipped } = filterBankQuestionsByTypeQuota(bankQuestions, {
      usingTemplateTypeRestriction,
      templateSupportedTypes,
      typeQuota,
      queuedTypeCounts,
    });

    const builtItems = kept
      .map((bq) => buildBankQuestionData(bq, isExamination))
      .filter(Boolean)
      .map((data) => ({ data }));
    if (builtItems.length < kept.length) {
      toast({
        description: "Some questions were skipped — that type isn't supported here.",
        position: "top",
        status: "warning",
      });
    }
    const queuedTexts = queuedQuestions.map((q) => normalizeQuestionText(q.data?.question));
    const { kept: items, duplicates } = filterDuplicateQuestions(builtItems, queuedTexts, (q) => q.data.question);
    if (!items.length) {
      const skippedParts = [
        skipped ? `${skipped} already at the configured Quantity for that type` : null,
        duplicates ? `${duplicates} already queued for this exam` : null,
      ].filter(Boolean);
      if (skippedParts.length) {
        toast({
          description: `Skipped ${skippedParts.join(", ")}.`,
          position: "top",
          status: "warning",
        });
      }
      return;
    }
    if (isPendingCreation) {
      setPendingCreate({ ...pendingCreate, questions: [...queuedQuestions, ...items] });
    } else {
      setPendingEdit({ ...pendingEdit, questions: [...queuedQuestions, ...items] });
    }
    toast({
      description: `${items.length} question${items.length === 1 ? "" : "s"} added from the bank.${
        skipped ? ` ${skipped} skipped — already at the configured Quantity for that type.` : ""
      }${duplicates ? ` ${duplicates} skipped — already queued for this exam.` : ""} They'll be created once you submit for approval.`,
      position: "top",
      status: "success",
    });
  };

  const handleBankAdd = (isPendingCreation || isPendingEditSubmit) ? queueBankQuestions : saveBankQuestionsForReal;

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

  // ── Creates (or applies the held-back edit to) the exam and saves every
  // queued question, all gated behind the approval modal's supervisor pick —
  // same split as the create-question form's "Create and Submit"/"Update
  // and Submit", but reachable straight from this listing view instead of
  // requiring a detour through a (possibly blank) question form.
  const [pendingWorkflowModalOpen, setPendingWorkflowModalOpen] = useState(false);
  const [pendingWorkflowContent, setPendingWorkflowContent] = useState(null);
  const createdParentRef = useRef(null);
  const savedQueueItemsRef = useRef(new WeakSet());

  const performCreateParent = async () => {
    const { body, paperConfigBody, addToBank: parentAddToBank } = pendingCreate;
    const { examination } = await adminCreateStandaloneExamination(toApiCreateBody(body));
    await updateExamPaperConfig(examination.id, toApiPaperConfigBody(body, paperConfigBody));
    if (parentAddToBank) setAutoAddToBank("standalone", examination.id);
    setAssessment({ ...examination, sections: paperConfigBody?.configuredSections || [] });
    cacheExamMetaFromBody(examination.id, body);
    return { id: examination.id };
  };

  const performEditParent = async () => {
    const { contentId, body, paperConfigBody } = pendingEdit;
    // Backend confirmed: total marks is calculated automatically for hybrid
    // exams and rejects the field if sent — TemplateStandalone.jsx never
    // rebuilds `body.totalMarks` on the edit path, so it can still be
    // carrying a stale value from whatever was originally fetched.
    const editBody = body?.examType === "hybrid" ? { ...body, totalMarks: undefined } : body;
    await adminEditStandaloneExamination(contentId, editBody);
    if (paperConfigBody) await updateExamPaperConfig(contentId, paperConfigBody).catch(() => {});
    cacheExamMetaFromBody(contentId, body);
    return { id: contentId };
  };

  const handlePendingWorkflowCreate = async () => {
    const parent =
      createdParentRef.current ||
      (isPendingCreation ? await performCreateParent() : await performEditParent());
    createdParentRef.current = parent;
    const { duplicates } = await saveQueuedBatch(queuedQuestions, savedQueueItemsRef.current, (queued) => {
      const body = isPendingCreation
        ? { ...queued.data, standAloneExaminationId: parent.id }
        : queued.data;
      return adminCreateStandaloneExaminationQuestion(body);
    });
    if (duplicates) {
      toast({
        description: `${duplicates} duplicate question${duplicates === 1 ? "" : "s"} skipped — the rest were saved.`,
        position: "top",
        status: "warning",
      });
    }
    return { id: parent.id };
  };

  const handleOpenCreateAndSubmit = () => {
    if (isPendingCreation) {
      setPendingWorkflowContent({ contentTitle: pendingCreate.title, requestType: "StandaloneExam" });
    } else {
      setPendingWorkflowContent({
        contentId: pendingEdit.contentId,
        contentTitle: pendingEdit.title,
        requestType: pendingEdit.requestType || "StandaloneExam",
      });
    }
    setPendingWorkflowModalOpen(true);
  };

  const handlePendingWorkflowSuccess = () => {
    const realParentId = createdParentRef.current?.id;
    const editNextRoute = pendingEdit?.nextRoute;
    clearPendingCreate();
    clearPendingEdit();
    push(
      isPendingEditSubmit && editNextRoute
        ? editNextRoute
        : `/admin/standalone-exams/questions/?examination=${realParentId}&question-listing=true`,
    );
  };

  // Only exams created via the batch-upload shortcut (which bypasses the
  // approval modal to get a real id for the upload endpoint) ever need this
  // — normal "Create and Submit" already submits for approval in one step.
  const needsSubmit =
    hasSubmittedForApproval || needsApprovalSubmission("standalone", assessment?.id);

  return (
    <Box padding={6} width="70%">
      {isLoading && <PageLoaderLayout height="70%" width="100%" />}

      {questionsIsEmpty && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3}>
            No Questions Yet
          </Heading>
          <Text as="level3" marginBottom={7}>
            Create a new question to get started.
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

      {sectionNames.length === 0
        ? (
          <>
            {numberedQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                id={q.id}
                questionNumber={getQuestionNumber(q.__index)}
                question={q.question}
                image={q.file}
                section={q.section}
                marginBottom={4}
              />
            ))}
            {numberedQueuedQuestions.map(renderQueuedCard)}
          </>
        )
        : (
          <>
            {sectionNames.map((name, si) => {
              const sectionQs = numberedQuestions.filter((q) => q.section === name);
              const sectionQueued = numberedQueuedQuestions.filter((q) => q.data?.section === name);
              const sectionTotal = sectionQs.length + sectionQueued.length;
              return (
                <Box
                  key={name}
                  marginBottom={8}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <Flex alignItems="center" gap={3} px={5} py={3} backgroundColor="primary.base">
                    <Heading fontSize="heading.h5" color="white" flex={1}>
                      Section {si + 1}: {name}
                      <Text as="span" fontSize="xs" fontWeight="normal" color="whiteAlpha.800" ml={2}>
                        ({sectionTotal} question{sectionTotal === 1 ? "" : "s"})
                      </Text>
                    </Heading>
                  </Flex>
                  <Box px={5} pt={4} pb={sectionTotal ? 0 : 4}>
                    {sectionTotal === 0 ? (
                      <Box padding={4} backgroundColor="gray.50" textAlign="center" borderRadius="md" mb={4}>
                        <Text color="gray.400">No questions in this section yet.</Text>
                      </Box>
                    ) : (
                      <>
                        {sectionQs.map((q) => (
                          <QuestionCard
                            key={q.id}
                            id={q.id}
                            questionNumber={getQuestionNumber(q.__index)}
                            question={q.question}
                            image={q.file}
                            section={q.section}
                            marginBottom={4}
                          />
                        ))}
                        {sectionQueued.map(renderQueuedCard)}
                      </>
                    )}
                  </Box>
                </Box>
              );
            })}

            {(unassignedQuestions.length > 0 || unassignedQueuedQuestions.length > 0) && (
              <Box marginBottom={8}>
                <Flex alignItems="center" mb={4} pb={2} borderBottom="1px" borderColor="gray.300">
                  <Heading fontSize="heading.h5" color="gray.500">
                    Unassigned Questions
                  </Heading>
                </Flex>
                {unassignedQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    id={q.id}
                    questionNumber={getQuestionNumber(q.__index)}
                    question={q.question}
                    image={q.file}
                    section={q.section}
                    marginBottom={4}
                  />
                ))}
                {unassignedQueuedQuestions.map(renderQueuedCard)}
              </Box>
            )}
          </>
        )}

      <Box paddingTop={10} display="flex" gap={3}>
        <Button
          link={`/admin/standalone-exams/questions/?examination=${isExamination}${
            isPendingCreation ? "&submitForApproval=1" : isPendingEditSubmit ? "&editSubmit=1" : ""
          }`}
        >
          Add more questions
        </Button>
        {(isPendingCreation || isPendingEditSubmit) && hasQueuedQuestions && (
          <Button ghost onClick={handleOpenCreateAndSubmit}>
            {isPendingCreation ? "Create and Submit" : "Update and Submit"}
          </Button>
        )}
        {needsSubmit && !questionsIsEmpty && (
          <Button
            ghost
            disabled={hasSubmittedForApproval}
            onClick={() => setWorkflowModalOpen(true)}
          >
            {hasSubmittedForApproval ? "Submitted for Approval" : "Submit for Approval"}
          </Button>
        )}
      </Box>

      {(isPendingCreation || isPendingEditSubmit) && pendingWorkflowContent && (
        <WorkflowSubmitModal
          isOpen={pendingWorkflowModalOpen}
          onClose={() => setPendingWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={pendingWorkflowContent.contentId}
          contentTitle={pendingWorkflowContent.contentTitle}
          requestType={pendingWorkflowContent.requestType}
          onCreate={handlePendingWorkflowCreate}
          onSuccess={handlePendingWorkflowSuccess}
        />
      )}

      {needsSubmit && !questionsIsEmpty && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={assessment.id}
          contentTitle={assessment.topic}
          requestType="StandaloneExam"
          onSuccess={() => {
            clearNeedsApprovalSubmission("standalone", assessment.id);
            setHasSubmittedForApproval(true);
          }}
        />
      )}

      <SelectBankQuestionsModal
        isOpen={isBankPickerOpen}
        onClose={closeBankPicker}
        onAdd={handleBankAdd}
      />
    </Box>
  );
};

const QuestionCard = ({ questionNumber, question, image, id, section, ...rest }) => {
  const isExamination = useQueryParams().get("examination");
  const editLink = getEditQuestionLink(isExamination, id);
  const { resource: deleteRequest, handleFetchResource } = useFetch();
  const toast = useToast();

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    handleFetchResource({
      fetcher: async () => {
        await adminDeleteStandaloneExaminationQuestion(id);
        return "Question deleted successfully";
      },
      onError: (err) =>
        toast({ description: err.message, position: "top", status: "error" }),
      onSuccess: (msg) =>
        toast({ description: msg, position: "top", status: "success" }),
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
          bg="rgba(255,255,255,.5)"
        >
          <Flex
            alignItems="center"
            bg="white"
            p={6}
            shadow="md"
            rounded="md"
            w="300px"
            flexDirection="column"
          >
            <Box>
              <Spinner mb={5} />
            </Box>
            Please wait. Deleting…
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
          {section && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              Section: {section}
            </Text>
          )}
          <RichTextToView paddingTop={2} text={question} />
          {image && (
            <Image
              mt={5}
              src={image}
              alt="question"
              width="100%"
              height="400px"
              rounded="md"
            />
          )}
        </Box>
        <Box transform="translateY(-10px)">
          <MoreIconButton editLink={editLink} onDelete={handleDelete} />
        </Box>
      </Flex>
    </>
  );
};

// Queued (bank-added, not-yet-created) questions have no real id — there's
// nothing on the backend to delete/preview, so this skips QuestionCard's
// fetch-backed delete flow in favor of a plain "Remove" that just splices
// the slot out of pendingCreate/pendingEdit (handled by the caller).
const QueuedQuestionCard = ({ questionNumber, question, editLink, onRemove, ...rest }) => (
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
    </Box>
    <Box transform="translateY(-10px)">
      <Button ghost leftIcon={<FaTrash />} onClick={onRemove} type="button">
        Remove
      </Button>
    </Box>
  </Flex>
);

const MoreIconButton = ({ editLink, onDelete }) => {
  const { push } = useHistory();
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
        <MenuItem onClick={() => push(editLink)}>Preview question</MenuItem>
        <MenuItem onClick={() => push(editLink + "&edit=true")}>
          Edit question
        </MenuItem>
        <MenuItem onClick={onDelete} color="red.500">
          Delete question
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

// ── Helpers ──

const getQuestionListingLink = (examinationId) =>
  `/admin/standalone-exams/questions/?examination=${examinationId}&question-listing=true`;

const getEditQuestionLink = (examinationId, questionId) =>
  `/admin/standalone-exams/questions/?examination=${examinationId}&question=${questionId}`;

const getEditQueuedQuestionLink = (examinationId, index, pendingParam = "submitForApproval") =>
  `/admin/standalone-exams/questions/?examination=${examinationId}&${pendingParam}=1&queuedIndex=${index}`;

const getQuestionNumber = (index) =>
  `Question ${index + 1 < 9 ? `0${index + 1}` : index === undefined ? "01" : index + 1}`;

const buildOptions = (data) => {
  const options = [];
  for (const key in data) {
    if (/^option-/.test(key)) {
      const optionText = data[key];
      const optionIndex = +key.replace("option-", "");
      const isAnswer = +data.answer === optionIndex;
      if (optionText)
        options.push({ name: optionText, optionIndex, isAnswer });
    }
  }
  return options;
};

const QuestionsStandaloneRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <QuestionsStandalone {...props} />} />
);

export default QuestionsStandaloneRoute;
