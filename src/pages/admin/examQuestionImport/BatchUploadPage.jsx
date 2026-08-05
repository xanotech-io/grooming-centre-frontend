import React, { useEffect, useRef, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  BreadcrumbItem,
  Box,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts";
import { useQueryParams } from "../../../hooks";
import useAssessmentStore from "../../../store/assessmentStore";
import { appendFormData, getExamMeta, markExamMeta, markNeedsApprovalSubmission } from "../../../utils";
import { toBatchUploadSections } from "../examSectionBuilder/examTypeConfig";
import {
  downloadExamQuestionBatchTemplate,
  uploadExamQuestionBatch,
  updateExamQuestionBatchRow,
  deleteExamQuestionBatchRow,
  getExamQuestionBatchUpload,
  getStandaloneExaminationDetails,
  requestExaminationDetails,
  requestAssessmentDetails,
  adminGetMarkingTemplateById,
  adminGetExaminationById,
  adminCreateExaminationQuestion,
  adminCreateAssessmentQuestion,
  getExaminationById as getExamPaperConfig,
  updateExaminationById as updateExamPaperConfig,
} from "../../../services";
import {
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  buildQuestionListingLink,
  buildReviewLink,
  contextLabel,
  getUploadContext,
  normalizeQuestionType,
  normalizeStagedRow,
  normalizeStagedRows,
} from "./questionRowUtils";

// A marking template's questionQuantity/markDistribution keys are whatever
// casing the backend uses (snake_case, e.g. "true_false") — remap to this
// codebase's internal PascalCase question types so they line up with a
// staged row's own (already-normalized) `questionType`.
const normalizeTypeKeys = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [normalizeQuestionType(k), v]));

// The cached examType/questionQuantity was written keyed by exact kind
// ("StandaloneExam"/"ModuleExam"/"Exam"/"Assessment") — this context object
// doesn't carry moduleId to disambiguate ModuleExam vs Exam, so try every
// candidate kind for this flow and use whichever one actually has data.
const getCachedExamMeta = (candidates, id) => {
  for (const kind of candidates) {
    const meta = getExamMeta(kind, id);
    if (meta) return meta;
  }
  return null;
};

const COLUMNS = [
  { col: "question_text", required: "Required", applies: "All", desc: "Full question statement — must not be empty" },
  { col: "question_type", required: "Optional", applies: "All", desc: 'MCQ / Essay / TrueFalse / FillBlank / Matching / ShortAnswer — defaults to "MCQ"' },
  { col: "difficulty_level", required: "Optional", applies: "All", desc: 'Easy / Medium / Hard — falls back to Default Difficulty below, then blank' },
  { col: "marks", required: "Optional", applies: "All", desc: "Positive integer — defaults to 1" },
  { col: "tags", required: "Optional", applies: "All", desc: 'Comma-separated — e.g. "algorithms,searching"' },
  { col: "rubric", required: "Optional", applies: "Essay / Short Answer", desc: "Grading rubric text" },
  { col: "option_a", required: "MCQ Required", applies: "MCQ", desc: "Text for option A" },
  { col: "option_b", required: "MCQ Required", applies: "MCQ", desc: "Text for option B" },
  { col: "option_c", required: "Optional", applies: "MCQ", desc: "Optional option C" },
  { col: "option_d", required: "Optional", applies: "MCQ", desc: "Optional option D" },
  { col: "correct_answer", required: "MCQ/T-F Req.", applies: "MCQ, True/False", desc: "MCQ: A/B/C/D · True/False: A = True, B = False" },
  { col: "media_reference", required: "Optional", applies: "All", desc: 'Filename of image inside companion ZIP — e.g. "diagram.png"' },
];

const REQ_STYLE = {
  Required: { bg: "#FED7D7", color: "#C53030" },
  "MCQ Required": { bg: "#FEE2E2", color: "#9B2C2C" },
  "MCQ/T-F Req.": { bg: "#FEE2E2", color: "#9B2C2C" },
  Optional: { bg: "#F7FAFC", color: "#718096" },
};

const FileUploadZone = ({ accept, file, onChange, label, help, accept_label }) => {
  const ref = useRef();
  return (
    <Box
      border="2px dashed"
      borderColor={file ? "#38A169" : "#CBD5E0"}
      borderRadius="8px"
      p="20px"
      textAlign="center"
      cursor="pointer"
      bg={file ? "#F0FFF4" : "#F7FAFC"}
      transition="border-color 0.15s"
      _hover={{ borderColor: "#6b006b" }}
      onClick={() => ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          onChange(e.target.files[0] ?? null);
          e.target.value = "";
        }}
      />
      {file ? (
        <Flex justifyContent="center" alignItems="center" gap="8px">
          <FiUpload color="#38A169" />
          <Text fontSize="13px" fontWeight="600" color="#276749">
            {file.name}
          </Text>
          <Text fontSize="12px" color="gray.400">
            ({(file.size / 1024).toFixed(1)} KB)
          </Text>
          <IconButton
            aria-label="Remove file"
            icon={<FiX size={12} />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          />
        </Flex>
      ) : (
        <>
          <FiUpload color="#A0AEC0" size={20} style={{ margin: "0 auto 8px" }} />
          <Text fontSize="13px" fontWeight="500" color="gray.500">
            {label}
          </Text>
          <Text fontSize="11px" color="gray.400" mt="4px">
            {accept_label}
          </Text>
          {help && (
            <Text fontSize="11px" color="gray.400" mt="2px">
              {help}
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

const BatchUploadPage = () => {
  const history = useHistory();
  const toast = useToast();
  const context = getUploadContext(useQueryParams());
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);

  // contextLabel(context) only ever resolves via `examinationId`/`standalone`
  // on `context` — but the createTarget flow (nothing real exists yet) never
  // carries an `examinationId` at all, for ANY kind, so it always fell back
  // to "Assessment" even for a Course Exam/course-level Exam. Read the
  // actual kind straight from `pendingCreate` for this pre-creation case.
  const displayLabel = context.createTarget
    ? pendingCreate?.kind === "Assessment"
      ? "Assessment"
      : pendingCreate?.kind === "StandaloneExam"
        ? "Standalone Examination"
        : "Examination"
    : contextLabel(context);

  const [defaultDifficulty, setDefaultDifficulty] = useState("");
  const [file, setFile] = useState(null);
  const [mediaZip, setMediaZip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showColumnGuide, setShowColumnGuide] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // The exam's own question-type/Quantity/marks rules — same ones the
  // manual "Add Question" form enforces (QuestionsStandalone.jsx) — so a
  // bulk-uploaded file can't smuggle in a type the exam wasn't configured
  // for, or questions carrying the wrong marks. null while loading/not
  // applicable. Two mutually exclusive shapes, matching whichever half of
  // the exam this upload targets:
  //   - {mode: "section", allowedTypes, sectionCap, markPerQuestion, usedCounts}
  //     — a Section tab was active (a "with sections" exam, or hybrid's
  //     sectioned half): governed by that section's own question_types/
  //     question_count from the Template/Marking Scheme step.
  //   - {mode: "quantity", supportedTypes, quantity, markDistribution, usedCounts}
  //     — no section active ("without sections", or hybrid's "Standalone
  //     Questions" pool): governed by the marking template's per-type
  //     Quantity/markDistribution.
  const [typeRestriction, setTypeRestriction] = useState(null);
  // The overall Number of Questions the exam/assessment was configured for
  // — same cap the manual "Add Question" form enforces (amountOfQuestions/
  // remainingQuestionSlots in QuestionsPage.jsx/QuestionsStandalone.jsx).
  // Applies regardless of section/Quantity mode, and even to an exam with
  // no Exam Type at all — every question created here still counts against
  // it. null means no configured cap.
  const [overallLimit, setOverallLimit] = useState(null);

  useEffect(() => {
    if (!context.createTarget && !context.examinationId && !context.assessmentId) return;
    let cancelled = false;

    // Fetches the target's own record (whichever of the three flows this
    // is) plus the section-list fetcher for it — Standalone/Course Exam
    // read sections from the separate paper-config endpoint, a plain
    // Assessment carries them directly on its own record.
    const loadRecord = async () => {
      // Nothing real exists yet — read straight from the still-pending
      // details instead of fetching anything (there's nothing to fetch).
      // `pendingCreate.body.examType` is already the API value
      // ("sectioned"/"unsectioned"/"hybrid"), matching what the other two
      // branches below normalize `record.examType` to.
      if (context.createTarget) {
        if (!pendingCreate?.body) return { record: null, getSections: () => Promise.resolve([]) };
        const { body } = pendingCreate;
        return {
          record: {
            examType: body.examType,
            questionQuantity: body.questionQuantity,
            templateId: body.markingTemplateId,
            questionCount: body.amountOfQuestions,
            questions: [],
          },
          getSections: () => Promise.resolve(pendingCreate.paperConfigBody?.configuredSections || []),
        };
      }
      // Confirmed via a real GET /v1/assessment/admin/:id response: the
      // backend doesn't reliably return examType/questionQuantity once a
      // record is real — fall back to whatever markExamMeta cached for it
      // at creation/edit time (same fallback QuestionsPage.jsx's own
      // getRealExamMeta uses) so this restriction still applies to a bulk
      // upload aimed at an already-real exam/assessment.
      if (context.standalone) {
        const { examination } = await getStandaloneExaminationDetails(context.examinationId, true);
        const cached = getCachedExamMeta(["StandaloneExam"], context.examinationId);
        return {
          record: {
            ...examination,
            examType: examination.examType ?? cached?.examType,
            questionQuantity: examination.questionQuantity ?? cached?.questionQuantity,
            templateId: examination.templateId ?? cached?.markingTemplateId,
          },
          getSections: () =>
            getExamPaperConfig(context.examinationId, "standalone_examination")
              .then((res) => res?.data?.configuredSections || [])
              .catch(() => []),
        };
      }
      if (context.examinationId) {
        const { examination } = await requestExaminationDetails(context.examinationId, true);
        const cached = getCachedExamMeta(["ModuleExam", "Exam"], context.examinationId);
        return {
          record: {
            ...examination,
            examType: examination.examType ?? cached?.examType,
            questionQuantity: examination.questionQuantity ?? cached?.questionQuantity,
            templateId: examination.templateId ?? cached?.markingTemplateId,
          },
          getSections: () =>
            getExamPaperConfig(context.examinationId, "examination")
              .then((res) => res?.data?.configuredSections || [])
              .catch(() => []),
        };
      }
      const { assessment } = await requestAssessmentDetails(context.assessmentId, true);
      const cached = getCachedExamMeta(["Assessment"], context.assessmentId);
      return {
        record: {
          ...assessment,
          examType: assessment.examType ?? cached?.examType,
          questionQuantity: assessment.questionQuantity ?? cached?.questionQuantity,
          // Assessment's own field for this is `markingTemplateId`, not
          // `templateId` — normalized here so the rest of this effect can
          // treat all three flows identically.
          templateId: assessment.markingTemplateId ?? cached?.markingTemplateId,
        },
        getSections: () => Promise.resolve(assessment.sections || []),
      };
    };

    loadRecord()
      .then(async ({ record, getSections }) => {
        if (cancelled || !record) return;

        if (record.questionCount) {
          setOverallLimit({
            amount: Number(record.questionCount),
            existingTotal: (record.questions || []).length,
          });
        }

        if (context.section && (record.examType === "sectioned" || record.examType === "hybrid")) {
          const configured = await getSections();
          const section = configured.find((s) => s.section_name === context.section);
          if (!section || cancelled) return;
          // Course Exam/Assessment's own sections use `questions_count`
          // (see examSectionBuilder/examTypeConfig.js); Standalone's use
          // `question_count` — accept either.
          const sectionCount = Number(section.questions_count ?? section.question_count) || 0;
          const usedInSection = (record.questions || []).filter((q) => q.section === context.section).length;
          setTypeRestriction({
            mode: "section",
            allowedTypes: Array.isArray(section.question_types) && section.question_types.length ? section.question_types : null,
            sectionCap: sectionCount || null,
            // Sections have no per-question mark of their own, only a total
            // weightage split across their Question Count — inferred, not
            // independently backend-confirmed like the unsectioned per-type
            // mark below was.
            markPerQuestion: sectionCount ? (Number(section.total_marks) || 0) / sectionCount : null,
            usedInSection,
          });
          return;
        }

        if (!context.section && (record.examType === "unsectioned" || record.examType === "hybrid")) {
          // The marking template's own questionQuantity/markDistribution
          // keys are whatever casing the backend uses (confirmed lowercase
          // snake_case, e.g. "mcq"/"true_false") — completely different from
          // this codebase's internal PascalCase question types ("MCQ"/
          // "TrueFalse"), which is what a staged row's own `questionType`
          // is normalized to. Without this, `supportedTypes.includes(...)`/
          // `quantity[row.questionType]` never match anything, so nothing
          // ever gets restricted — confirmed by a real test (a template
          // configured for "mcq" only still let a TrueFalse row through).
          const quantity = normalizeTypeKeys(record.questionQuantity);
          const supportedTypes = Object.keys(quantity);
          if (supportedTypes.length === 0) return;

          let markDistribution = {};
          if (record.templateId) {
            const { template } = await adminGetMarkingTemplateById(record.templateId).catch(() => ({}));
            markDistribution = normalizeTypeKeys(template?.markDistribution);
          }
          if (cancelled) return;

          const usedCounts = (record.questions || []).reduce((acc, q) => {
            if (q.section) return acc;
            if (q.questionType) acc[q.questionType] = (acc[q.questionType] || 0) + 1;
            return acc;
          }, {});
          setTypeRestriction({ mode: "quantity", supportedTypes, quantity, markDistribution, usedCounts });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.createTarget, context.standalone, context.examinationId, context.assessmentId, context.section]);

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const blob = await downloadExamQuestionBatchTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "question_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Failed to download template", status: "error", duration: 3000, isClosable: true });
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (selected) => {
    if (!selected) {
      setFile(null);
      return;
    }
    const ext = selected.name.split(".").pop().toLowerCase();
    if (!["xlsx", "csv"].includes(ext)) {
      toast({ title: "Please upload an Excel (.xlsx) or CSV (.csv) file", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    if (selected.size === 0) {
      toast({ title: "File is empty — please select a valid file", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setFile(selected);
  };

  const handleZipChange = (selected) => {
    if (!selected) {
      setMediaZip(null);
      return;
    }
    const ext = selected.name.split(".").pop().toLowerCase();
    if (ext !== "zip") {
      toast({ title: "Media archive must be a .zip file", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setMediaZip(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;

    if (context.createTarget && !pendingCreate?.body) {
      toast({
        title: "The exam/assessment details were lost — please go back and fill in Overview/Template again.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    try {
      const { body, paperConfigBody, title: pendingTitle, kind } = pendingCreate ?? {};
      const res = await uploadExamQuestionBatch({
        file,
        mediaZip,
        defaultDifficulty: defaultDifficulty || undefined,
        section: context.section,
        ...(context.createTarget
          ? {
              createTargetType: kind === "Assessment" ? "assessment" : "examination",
              title: body.title ?? pendingTitle,
              courseId: body.courseId,
              moduleId: body.moduleId,
              duration: body.duration,
              startTime: body.startTime,
              endTime: body.endTime,
              examType: body.examType,
              sections: toBatchUploadSections(paperConfigBody?.configuredSections || []),
              totalMarks: body.totalMarks,
              markingTemplateId: body.markingTemplateId,
            }
          : {
              courseId: context.courseId,
              examinationId: context.examinationId,
              assessmentId: context.assessmentId,
            }),
      });
      const raw = res?.data ?? res;
      const uploadId = raw.uploadId ?? raw.id;
      let rows = normalizeStagedRows(raw.rows);

      // The upload call above just created the real record (createTargetType)
      // — everything from here on (review, confirm, the listing link) needs
      // to operate on it directly, not the pending state that's now stale.
      // Confirmed with backend: the bare upload record (getExamQuestionBatchUpload,
      // GET /{uploadId} — not /report, not the upload response itself, both
      // of which carry no id for the newly-created record at all) is what
      // resolves to assessmentId/examinationId once created.
      let effectiveContext = context;
      if (context.createTarget) {
        const isAssessment = kind === "Assessment";
        const upload = await getExamQuestionBatchUpload(uploadId).catch(() => null);
        const uploadData = upload?.data ?? upload;
        let realId = isAssessment ? uploadData?.assessmentId : uploadData?.examinationId;
        // Fallback for Course Exam only, in case the upload record doesn't
        // resolve examinationId either — same admin examination-lookup
        // CreateModuleExaminationPage.jsx already relies on for its own
        // edit-mode fetch, GET /v1/examination/admin/{courseId}.
        if (!realId && !isAssessment) {
          realId = await adminGetExaminationById(body.courseId)
            .then(({ examination }) => examination?.id)
            .catch(() => undefined);
        }
        effectiveContext = {
          courseId: context.courseId,
          examinationId: isAssessment ? undefined : realId,
          assessmentId: isAssessment ? realId : undefined,
          // Sourced from the pending body (not `context`, which never
          // carried it either) — needed downstream so the final
          // questions-listing redirect can tell "ModuleExam" apart from a
          // plain course-level "Exam" (see getUploadContext's own comment).
          moduleId: isAssessment ? undefined : body.moduleId,
          standalone: false,
          section: context.section,
        };
        if (realId) markNeedsApprovalSubmission(isAssessment ? "assessment" : "examination", realId);
        // Same cache QuestionsPage.jsx's performCreateParent writes for the
        // regular (non-bulk-upload) create flow — confirmed the backend
        // doesn't reliably return examType/questionQuantity once real, so
        // without this a hybrid/sectioned exam created via bulk upload would
        // lose its section tabs/type restriction the moment this page
        // clears pendingCreate below.
        if (realId) {
          markExamMeta(kind, realId, {
            examType: body.examType,
            questionQuantity: body.questionQuantity,
            markingTemplateId: body.markingTemplateId,
          });
        }

        // createTargetType only creates the bare examination itself (title/
        // duration/dates/examType/sections-for-marks-validation) — it has no
        // fields for navigationMode/randomization/uiSettings/
        // configuredSections at all, so those still need the same follow-up
        // paper-config PUT the old create-then-navigate flow used to make
        // right after creating (`performCreateParent`) — otherwise a
        // sectioned exam ends up with no section info for the Question
        // Listing page to group by. Course Exam only, matching that same
        // existing scoping (course-level "Exam" has no paper-config channel
        // wired up at all).
        if (kind === "ModuleExam" && realId && paperConfigBody) {
          await updateExamPaperConfig(realId, paperConfigBody).catch((err) => {
            toast({
              title: "Sections were created but couldn't be saved to the exam's paper config — the Question Listing page won't group by section.",
              description: err?.response?.data?.message || err?.message,
              status: "warning",
              duration: 8000,
              isClosable: true,
            });
          });
        }

        // Any questions already queued (via the Question Bank picker or
        // manual entry, e.g. hybrid's standalone half) before this upload —
        // createTargetType only creates the shell plus this file's own
        // rows, so those still need creating for real against the same
        // parent, the same way "Create and Submit" already does via
        // handlePendingWorkflowCreate in QuestionsPage.jsx. Confirmed via a
        // real bug report: skipping this silently dropped every previously-
        // queued question the moment clearPendingCreate() ran below —
        // "5 standalone questions queued, 1 batch-uploaded, only 1 survived."
        if (realId) {
          const failedQueued = [];
          for (const queued of pendingCreate?.questions || []) {
            try {
              const data = {
                ...queued.data,
                ...(isAssessment ? { assessmentId: realId } : { examinationId: realId }),
              };
              if (isAssessment) await adminCreateAssessmentQuestion(appendFormData(data));
              else await adminCreateExaminationQuestion(appendFormData(data));
            } catch {
              failedQueued.push(queued);
            }
          }
          if (failedQueued.length) {
            toast({
              title: `${failedQueued.length} previously queued question${failedQueued.length === 1 ? "" : "s"} couldn't be created`,
              description: 'They\'re still saved — open this exam/assessment and use "Add more questions" to retry them.',
              status: "warning",
              duration: 10000,
              isClosable: true,
            });
            setPendingEdit({
              kind,
              contentId: realId,
              title: pendingCreate?.title,
              requestType: isAssessment ? "CourseAssessment" : "CourseExam",
              courseId: context.courseId,
              questions: failedQueued,
            });
          }
        }

        clearPendingCreate();
      }

      // Belt-and-suspenders alongside the `section` sent with the upload
      // above (in case the parser doesn't apply it itself) — explicitly tag
      // every staged row with the section this upload was launched for,
      // best-effort so a row-level hiccup doesn't block the whole import.
      if (context.section && rows.length > 0) {
        rows = await Promise.all(
          rows.map((row) =>
            row.section === context.section
              ? row
              : updateExamQuestionBatchRow(uploadId, row.rowId, { section: context.section })
                  .then((r) => normalizeStagedRow({ ...(r?.data ?? r), rowId: row.rowId }))
                  .catch(() => row),
          ),
        );
      } else if (rows.length > 0) {
        // No section was selected for this upload (an unsectioned exam, or
        // hybrid's "Standalone Questions" pool) — a row's own "section"
        // column in the uploaded file has nothing to do with our Exam Type
        // sections. Confirmed via a real bug report: leaving it in place got
        // misread by the Question Listing page as real section structure.
        // Best-effort (unconfirmed whether the backend accepts `section: ""`
        // to actually clear the field) — a failure here just leaves the
        // stray value in place, same as before this existed.
        rows = await Promise.all(
          rows.map((row) =>
            !row.section
              ? row
              : updateExamQuestionBatchRow(uploadId, row.rowId, { section: "" })
                  .then((r) => normalizeStagedRow({ ...(r?.data ?? r), rowId: row.rowId }))
                  .catch(() => row),
          ),
        );
      }

      // Same overall Number of Questions cap the manual "Add Question" form
      // enforces — applied before the type/Quantity rules below so those
      // never see rows that were already cut for being over the total.
      if (overallLimit && rows.length > 0) {
        const remaining = Math.max(0, overallLimit.amount - overallLimit.existingTotal);
        if (rows.length > remaining) {
          const overflow = rows.slice(remaining);
          rows = rows.slice(0, remaining);
          await Promise.all(overflow.map((row) => deleteExamQuestionBatchRow(uploadId, row.rowId).catch(() => {})));
          toast({
            title: `${overflow.length} question${overflow.length === 1 ? "" : "s"} skipped — already at the ${overallLimit.amount} question limit configured for this ${contextLabel(effectiveContext).toLowerCase()}`,
            status: "warning",
            duration: 6000,
            isClosable: true,
          });
        }
      }

      // Same rule the manual "Add Question" form enforces: a type this
      // upload's target (a section, or the marking template's Quantity
      // table) wasn't configured for, or one that's already used up its
      // cap, gets skipped (removed from the staged batch entirely) rather
      // than silently imported — and every kept row's marks are corrected
      // to match, since the file's own `marks` column (defaults to 1) is
      // what caused the exam's declared Total Marks to stop matching what
      // was actually created.
      if (typeRestriction && rows.length > 0) {
        const kept = [];
        let skipped = 0;

        const applyMark = async (row, correctMark) => {
          if (correctMark == null || Number(row.marks) === Number(correctMark)) return row;
          return updateExamQuestionBatchRow(uploadId, row.rowId, { marks: Number(correctMark) })
            .then((r) => normalizeStagedRow({ ...(r?.data ?? r), rowId: row.rowId }))
            .catch(() => row);
        };

        if (typeRestriction.mode === "section") {
          let usedInSection = typeRestriction.usedInSection;
          for (const row of rows) {
            const notSupported = typeRestriction.allowedTypes && !typeRestriction.allowedTypes.includes(row.questionType);
            const atCapacity = typeRestriction.sectionCap != null && usedInSection >= typeRestriction.sectionCap;
            if (notSupported || atCapacity) {
              skipped += 1;
              await deleteExamQuestionBatchRow(uploadId, row.rowId).catch(() => {});
              continue;
            }
            usedInSection += 1;
            kept.push(await applyMark(row, typeRestriction.markPerQuestion));
          }
        } else {
          const runningCounts = { ...typeRestriction.usedCounts };
          for (const row of rows) {
            const notSupported = !typeRestriction.supportedTypes.includes(row.questionType);
            const quota = Number(typeRestriction.quantity[row.questionType]) || 0;
            const atCapacity = !notSupported && (runningCounts[row.questionType] || 0) >= quota;
            if (notSupported || atCapacity) {
              skipped += 1;
              await deleteExamQuestionBatchRow(uploadId, row.rowId).catch(() => {});
              continue;
            }
            runningCounts[row.questionType] = (runningCounts[row.questionType] || 0) + 1;
            kept.push(await applyMark(row, typeRestriction.markDistribution[row.questionType]));
          }
        }

        rows = kept;
        if (skipped) {
          toast({
            title: `${skipped} question${skipped === 1 ? "" : "s"} skipped — not an allowed question type for this ${
              typeRestriction.mode === "section" ? "section" : "exam"
            }, or already at its configured limit`,
            status: "warning",
            duration: 6000,
            isClosable: true,
          });
        }
      }

      toast({ title: "Upload processed — review the staged questions below", status: "success", duration: 3000, isClosable: true });
      history.push(buildReviewLink(uploadId, effectiveContext), { rows });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "";
      if (status === 400 && msg.toLowerCase().includes("file type")) {
        toast({ title: "Please upload an Excel (.xlsx) or CSV (.csv) file", status: "warning", duration: 4000, isClosable: true });
      } else if (status === 400 && msg.toLowerCase().includes("no valid")) {
        toast({ title: "No valid question rows found. Check that your file has a question_text column.", status: "warning", duration: 5000, isClosable: true });
      } else if (status === 404) {
        toast({ title: "Target not found. Please check the assessment/examination.", status: "error", duration: 5000, isClosable: true });
      } else {
        toast({ title: msg || "Upload failed. Please try again.", status: "error", duration: 4000, isClosable: true });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box marginX="22px" marginY="20px" maxW="860px">
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              {/* Nothing real exists yet in the createTarget flow — there's
                  no question-listing page to link to, so this just goes
                  back to wherever "Upload & Batch Import Questions" was
                  clicked from instead. */}
              {context.createTarget ? (
                <Text as="button" type="button" onClick={() => history.goBack()} color="#6b006b" fontWeight="600">
                  Back
                </Text>
              ) : (
                <Link href={buildQuestionListingLink(context)}>{contextLabel(context)} Questions</Link>
              )}
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Batch Upload</Link>
            </BreadcrumbItem>
          }
        />

        <Flex alignItems="center" justifyContent="space-between" mt="20px" mb="20px" flexWrap="wrap" gap="12px">
          <Heading fontSize="20px" fontWeight="600">Batch Upload {displayLabel} Questions</Heading>
          <Button secondary size="sm" onClick={() => history.goBack()}>← Back</Button>
        </Flex>

        {context.section && (
          <Box bg="#F0E6FF" border="1px solid #D6BCFA" borderRadius="8px" p="12px" mb="20px">
            <Text fontSize="13px" color="#553C9A">
              Every question in this file will be added to <Text as="span" fontWeight="700">Section: {context.section}</Text>.
            </Text>
          </Box>
        )}

        <Flex direction="column" gap="20px">
        {/* Step 1: Download Template */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Flex alignItems="center" gap="10px" mb="12px">
            <Box w="24px" h="24px" bg="#6b006b" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Text fontSize="11px" fontWeight="700" color="white">1</Text>
            </Box>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">Download the Question Template</Text>
          </Flex>
          <Text fontSize="13px" color="gray.500" mb="16px">
            Fill in the Questions sheet. <Text as="span" fontWeight="600" color="#C53030">Do not rename column headers</Text> — the parser maps columns by exact header name and altered headers will cause the entire file to fail.
          </Text>
          <Flex gap="10px" flexWrap="wrap">
            <Button leftIcon={<FiDownload />} isLoading={downloading} onClick={handleDownloadTemplate}>
              Download Template
            </Button>
            <Button
              secondary
              rightIcon={showColumnGuide ? <FiChevronUp /> : <FiChevronDown />}
              onClick={() => setShowColumnGuide((p) => !p)}
            >
              Column Guide
            </Button>
          </Flex>

          <Collapse in={showColumnGuide} animateOpacity>
            <Box mt="16px" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      {["Column", "Required?", "Applies To", "Description"].map((h) => (
                        <Th key={h} py="10px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {COLUMNS.map((c) => {
                      const rs = REQ_STYLE[c.required] ?? REQ_STYLE.Optional;
                      return (
                        <Tr key={c.col}>
                          <Td py="8px"><Text fontFamily="mono" fontSize="12px" color="#6b006b">{c.col}</Text></Td>
                          <Td py="8px">
                            <Box bg={rs.bg} color={rs.color} px="6px" py="1px" borderRadius="4px" display="inline-block" fontSize="10px" fontWeight="600">
                              {c.required}
                            </Box>
                          </Td>
                          <Td py="8px"><Text fontSize="12px" color="gray.500">{c.applies}</Text></Td>
                          <Td py="8px"><Text fontSize="12px" color="gray.600">{c.desc}</Text></Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </Box>

        {/* Step 2: Upload */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Flex alignItems="center" gap="10px" mb="20px">
            <Box w="24px" h="24px" bg="#6b006b" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Text fontSize="11px" fontWeight="700" color="white">2</Text>
            </Box>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">Upload Your File</Text>
          </Flex>

          <FormControl mb="20px" maxW="280px">
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Default Difficulty
              <Text as="span" fontSize="12px" color="gray.400" fontWeight="400" ml="6px">
                — applied to rows where difficulty is blank
              </Text>
            </FormLabel>
            <Select
              size="sm"
              borderRadius="6px"
              value={defaultDifficulty}
              onChange={(e) => setDefaultDifficulty(e.target.value)}
              placeholder="Leave blank"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </Select>
          </FormControl>

          <Flex direction="column" gap="12px">
            <Box>
              <Text fontSize="13px" fontWeight="500" color="gray.600" mb="6px">
                Question File <Text as="span" color="red.500">*</Text>
              </Text>
              <FileUploadZone
                accept=".xlsx,.csv"
                file={file}
                onChange={handleFileChange}
                label="Click to select your .xlsx or .csv file"
                accept_label=".xlsx and .csv files only"
              />
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="500" color="gray.600" mb="6px">
                Media ZIP <Text as="span" fontSize="12px" color="gray.400" fontWeight="400">(optional)</Text>
              </Text>
              <FileUploadZone
                accept=".zip"
                file={mediaZip}
                onChange={handleZipChange}
                label="Click to select your media .zip archive"
                accept_label=".zip files only"
                help="Include image files referenced in the media_reference column"
              />
            </Box>
          </Flex>

          <Box bg="#EBF4FF" border="1px solid #90CDF4" borderRadius="8px" p="12px" mt="20px">
            <Text fontSize="12px" color="#2C5282">
              After upload, the parsed questions are staged for review — nothing is added to the question bank until you confirm the import on the next screen.
            </Text>
          </Box>

          <Flex justifyContent="flex-end" mt="24px">
            <Button
              leftIcon={uploading ? <Spinner size="xs" /> : <FiUpload />}
              isDisabled={!file}
              isLoading={uploading}
              loadingText="Processing..."
              onClick={handleSubmit}
            >
              Upload &amp; Review
            </Button>
          </Flex>
        </Box>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const BatchUploadPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BatchUploadPage {...props} />} />
);

export default BatchUploadPageRoute;
