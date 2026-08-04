// Shared Exam Type / Sections / Question Quantities model — used by
// CreateModuleExaminationPage.jsx, CreateAssessmentPage.jsx and
// EditAssessmentPage.jsx so all three exam-creation flows apply the same
// sectioned/unsectioned/hybrid rules Standalone Exams already established
// (see TemplateStandalone.jsx, the original implementation this was ported
// from). Not a route — do not register this directory in
// src/pages/admin/index.js.

export const EXAM_TYPE_OPTIONS = [
  { label: "Exam with sections", value: "with_sections" },
  { label: "Exam without sections", value: "without_sections" },
  { label: "Hybrid (sections + standalone questions)", value: "hybrid" },
];

// Internal value -> backend ExamType enum.
const EXAM_TYPE_TO_API = {
  with_sections: "sectioned",
  without_sections: "unsectioned",
  hybrid: "hybrid",
};

const API_TO_EXAM_TYPE = {
  sectioned: "with_sections",
  unsectioned: "without_sections",
  hybrid: "hybrid",
};

export const toExamTypeApiValue = (examType) => EXAM_TYPE_TO_API[examType];

// Reverse of the above, for hydrating an existing exam/assessment record.
// Returns "" (the "legacy/unset" sentinel) for anything unrecognized,
// including exams that predate this feature and simply have no examType.
export const fromExamTypeApiValue = (apiValue) => API_TO_EXAM_TYPE[apiValue] || "";

export const EMPTY_SECTION = {
  section_name: "",
  question_types: [],
  question_type: "",
  marking_type: "",
  total_marks: null,
  questions_count: null,
  time_limit: null,
};

// Kept identical to TemplateStandalone.jsx's — QuestionsPage.jsx enforces
// these against whichever section/type-quota a question is saved under.
export const QUESTION_TYPE_LOCK_OPTIONS = [
  { label: "All", value: "" },
  { label: "MCQ", value: "MCQ" },
  { label: "True / False", value: "TrueFalse" },
  { label: "Fill in the Blank", value: "FillBlank" },
  { label: "Matching", value: "Matching" },
  { label: "Short Answer", value: "ShortAnswer" },
  { label: "Essay", value: "Essay" },
];

export const ALL_QUESTION_TYPES = QUESTION_TYPE_LOCK_OPTIONS.filter((o) => o.value !== "").map((o) => o.value);

export const MARKING_TYPE_LOCK_OPTIONS = [
  { label: "Any marking type", value: "" },
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
  { label: "Hybrid", value: "hybrid" },
];

// Sections are sent to the backend keyed by `question_type` (single lock —
// this is what ExamPaperConfigPage.jsx's older single-select still reads),
// but authored here via a `question_types` checkbox multi-select. A 1-of-1
// selection round-trips losslessly into the legacy single field; 0 or 2+
// selected widens to "" ("any type") rather than wrongly narrowing to one.
export const normalizeSectionsForConfig = (sections) =>
  sections.map((s) => {
    const types = s.question_types || [];
    return {
      section_name: s.section_name,
      questions_count: Number(s.questions_count) || 0,
      time_limit: s.time_limit ? Number(s.time_limit) : null,
      question_types: types,
      question_type: types.length === 1 ? types[0] : (s.question_type || ""),
      marking_type: s.marking_type || "",
      total_marks: s.total_marks ? Number(s.total_marks) : null,
    };
  });

// The plain create/edit-assessment (and create/edit-examination) endpoint's
// own `sections` field expects a different, minimal shape than the
// paper-config channel's `configuredSections` above — confirmed by a real
// backend test (assessment/create rejected `normalizeSectionsForConfig`'s
// shape with "sections must be an array of 1-10 section objects with at
// least a section_name/name"). Sent as a real JSON array in a plain JSON
// request body (axios/application-json) — not multipart, see
// toBatchUploadSections below for that case.
export const toCreateBodySections = (sections) =>
  sections.map((s) => ({
    name: s.section_name,
    questionCount: Number(s.questions_count) || 0,
    weightage: Number(s.total_marks) || 0,
  }));

// The batch-import endpoint's own createTargetType `sections` field is a
// THIRD shape again — {section_name, weightage, questionCount} — confirmed
// with backend, and must be sent as a single JSON.stringify'd string field
// (not bracket-notation form fields: express-fileupload has
// parseNested:false, so multipart bracket notation is never reconstructed
// into a real array server-side; a JSON string is parsed via their existing
// parseJsonField utility instead, the same convention already used for
// options/acceptVariants/pairs on question creation).
export const toBatchUploadSections = (sections) =>
  sections.map((s) => ({
    section_name: s.section_name,
    weightage: Number(s.total_marks) || 0,
    questionCount: Number(s.questions_count) || 0,
  }));

// Inverse of the above — for hydrating a section that may only ever have
// had the legacy single `question_type` set (authored via
// ExamPaperConfigPage.jsx's older UI, or the Question Listing page's
// bare-title "+ Add Section").
export const hydrateSection = (raw) => ({
  ...EMPTY_SECTION,
  section_name: raw.section_name || "",
  question_types: Array.isArray(raw.question_types) && raw.question_types.length
    ? raw.question_types
    : raw.question_type
      ? [raw.question_type]
      : [],
  question_type: raw.question_type || "",
  marking_type: raw.marking_type || "",
  total_marks: raw.total_marks ?? null,
  questions_count: raw.questions_count ?? raw.question_count ?? null,
  time_limit: raw.time_limit ?? null,
});

export const computeSectionTotals = (sections) => ({
  weightageTotal: sections.reduce((acc, s) => acc + (Number(s.total_marks) || 0), 0),
  questionCountTotal: sections.reduce((acc, s) => acc + (Number(s.questions_count) || 0), 0),
});

// A marking template's markDistribution value is the marks for one
// question of that type — the total scales with how many questions of
// that type are created (quantity 2 at 5 marks each = 10).
export const computeQuantityTotals = (types, counts, markDistribution) => {
  let marksTotal = 0;
  let quantityTotal = 0;
  types.forEach((type) => {
    const qty = Number(counts[type]) || 0;
    const typeMark = Number(markDistribution?.[type]) || 0;
    marksTotal += qty * typeMark;
    quantityTotal += qty;
  });
  return { marksTotal, quantityTotal };
};

// Seeded with every type the selected marking template actually supports
// (even ones left blank/0) so QuestionsPage.jsx can tell "not supported by
// this template" (key absent) apart from "supported, just capped at 0"
// (key present, value 0).
export const seedQuantityCounts = (types, counts) =>
  Object.fromEntries(types.map((type) => [type, counts[type] ?? ""]));
