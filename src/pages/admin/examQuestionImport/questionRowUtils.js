// Shared helpers for the batch-upload / staged-review flow (TC13).
// Normalizes rows coming back from the question-batch-import-v2 API into the
// same shape used by the manual "add questions" pages, and builds the
// context/links needed to move between the three entry flows (assessment,
// course exam, standalone exam) and back.

const TYPE_ALIASES = {
  mcq: "MCQ",
  MCQ: "MCQ",
  true_false: "TrueFalse",
  truefalse: "TrueFalse",
  TrueFalse: "TrueFalse",
  fill_blank: "FillBlank",
  fillblank: "FillBlank",
  FillBlank: "FillBlank",
  matching: "Matching",
  Matching: "Matching",
  short_answer: "ShortAnswer",
  shortanswer: "ShortAnswer",
  ShortAnswer: "ShortAnswer",
  essay: "Essay",
  Essay: "Essay",
};

export const normalizeQuestionType = (type) => {
  if (!type) return "MCQ";
  return TYPE_ALIASES[type] ?? TYPE_ALIASES[String(type).toLowerCase()] ?? "MCQ";
};

const LETTER_TO_INDEX = { A: 1, B: 2, C: 3, D: 4 };
const INDEX_TO_LETTER = { 1: "A", 2: "B", 3: "C", 4: "D" };

// options can arrive either as an array of {name/option, optionIndex, isAnswer}
// (the shape the manual add-question pages already use) or as a letter-keyed
// object like { A: "...", B: "..." } with a separate correctAnswer letter.
export const normalizeOptions = (row) => {
  const { options, correctAnswer } = row;

  if (Array.isArray(options)) {
    return options.map((opt, i) => ({
      optionIndex: opt.optionIndex ?? i + 1,
      name: opt.name ?? opt.option ?? "",
      isAnswer: Boolean(opt.isAnswer),
    }));
  }

  if (options && typeof options === "object") {
    return Object.entries(options).map(([letter, text]) => ({
      optionIndex: LETTER_TO_INDEX[letter.toUpperCase()],
      name: text,
      isAnswer: letter.toUpperCase() === String(correctAnswer ?? "").toUpperCase(),
    }));
  }

  return [];
};

export const optionsToRecord = (options) => {
  const record = {};
  options.forEach((opt) => {
    const letter = INDEX_TO_LETTER[opt.optionIndex];
    if (letter) record[letter] = opt.name;
  });
  return record;
};

export const answerLetterFromOptions = (options) => {
  const answer = options.find((opt) => opt.isAnswer);
  return answer ? INDEX_TO_LETTER[answer.optionIndex] : undefined;
};

// Normalizes a single staged row from the upload/rows response into the
// editable shape used across BatchUploadPage/ReviewImportPage.
export const normalizeStagedRow = (row) => {
  const questionType = normalizeQuestionType(row.questionType ?? row.question_type);
  const options = normalizeOptions(row);

  return {
    rowId: row.rowId ?? row.id,
    questionText: row.questionText ?? row.question_text ?? row.question ?? "",
    questionType,
    options,
    correctAnswer: row.correctAnswer ?? row.correct_answer ?? "",
    marks: row.marks ?? 1,
    difficultyLevel: row.difficultyLevel ?? row.difficulty_level ?? "",
    tags: Array.isArray(row.tags)
      ? row.tags
      : row.tags
        ? String(row.tags).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    section: row.section ?? "",
    rubric: row.rubric ?? row.rubricDescription ?? "",
    modelAnswer: row.modelAnswer ?? "",
    pairs: Array.isArray(row.pairs) ? row.pairs : [],
    mediaReference: row.mediaReference ?? row.media_reference ?? null,
    status: row.status ?? "pending_review",
  };
};

export const normalizeStagedRows = (rows) =>
  Array.isArray(rows) ? rows.map(normalizeStagedRow) : [];

// ── Cross-flow context (assessment / course exam / standalone exam) ──

export const getUploadContext = (query) => ({
  courseId: query.get("courseId") || undefined,
  assessmentId: query.get("assessmentId") || undefined,
  examinationId: query.get("examinationId") || undefined,
  standalone: query.get("standalone") === "true",
});

const contextToParams = (context) => {
  const params = new URLSearchParams();
  if (context.courseId) params.set("courseId", context.courseId);
  if (context.assessmentId) params.set("assessmentId", context.assessmentId);
  if (context.examinationId) params.set("examinationId", context.examinationId);
  if (context.standalone) params.set("standalone", "true");
  return params;
};

export const buildBatchUploadLink = (context) =>
  `/admin/exam-question-batch-import?${contextToParams(context).toString()}`;

export const buildReviewLink = (uploadId, context) =>
  `/admin/exam-question-batch-import/${uploadId}/review?${contextToParams(context).toString()}`;

export const buildQuestionListingLink = (context) => {
  if (context.standalone) {
    return `/admin/standalone-exams/questions/?examination=${context.examinationId}&question-listing=true`;
  }
  const base = `/admin/courses/${context.courseId}/assessment/${context.assessmentId}/questions/list?question-listing=true`;
  return context.examinationId ? `${base}&examination=${context.examinationId}` : base;
};

export const contextLabel = (context) =>
  context.standalone ? "Standalone Examination" : context.examinationId ? "Examination" : "Assessment";
