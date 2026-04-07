// import { http } from "../http";

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const TC32_DEFAULT_REMARK =
  "Modification cannot be saved - Standalone examination";

let MOCK_QUESTIONS = [
  {
    questionId: "QST-001",
    examId: "EXM-101",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    questionType: "MCQ",
    difficultyLevel: "MEDIUM",
    content: "What is the main nutrient in soil?",
    marks: 2,
    correctAnswer: "Nitrogen",
    explanation: "Nitrogen is essential for plant growth",
    tags: ["soil", "nutrition", "agriculture"],
    options: [
      { optionId: "OPT-001", text: "Nitrogen", isCorrect: true },
      { optionId: "OPT-002", text: "Oxygen", isCorrect: false },
      { optionId: "OPT-003", text: "Carbon Dioxide", isCorrect: false },
    ],
    createdBy: "Instructor-002",
    creationDate: "2025-10-01T10:00:00Z",
    modifiedBy: "Instructor-002",
    modificationAttemptDate: "2025-11-14T15:00:00Z",
    updateStatus: "Not Updated",
    deletePermission: "Not Allowed",
    remarks: TC32_DEFAULT_REMARK,
    examType: "STANDALONE_EXAMINATION",
  },
  {
    questionId: "QST-002",
    examId: "EXM-AGR101-001",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    questionType: "MCQ",
    difficultyLevel: "EASY",
    content: "Which soil type drains water fastest?",
    marks: 1,
    correctAnswer: "Sandy soil",
    explanation: "Sandy soil has larger particles and drains quickly",
    tags: ["soil", "drainage"],
    options: [
      { optionId: "OPT-010", text: "Clay soil", isCorrect: false },
      { optionId: "OPT-011", text: "Sandy soil", isCorrect: true },
      { optionId: "OPT-012", text: "Silt soil", isCorrect: false },
    ],
    createdBy: "Instructor-003",
    creationDate: "2025-10-04T12:00:00Z",
    modifiedBy: "Instructor-003",
    modificationAttemptDate: "2025-10-20T09:30:00Z",
    updateStatus: "Updated",
    deletePermission: "Allowed",
    remarks: "Question can be edited and deleted",
    examType: "COURSE_EXAMINATION",
  },
  {
    questionId: "QST-003",
    examId: "ASM-AGR101-03",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    questionType: "TRUE_FALSE",
    difficultyLevel: "MEDIUM",
    content: "Organic matter improves soil fertility.",
    marks: 1,
    correctAnswer: "True",
    explanation: "Organic matter improves structure and nutrient retention",
    tags: ["soil", "fertility"],
    options: [
      { optionId: "OPT-020", text: "True", isCorrect: true },
      { optionId: "OPT-021", text: "False", isCorrect: false },
    ],
    createdBy: "Instructor-002",
    creationDate: "2025-10-10T09:45:00Z",
    modifiedBy: "Instructor-002",
    modificationAttemptDate: "2025-10-10T09:45:00Z",
    updateStatus: "Updated",
    deletePermission: "Allowed",
    remarks: "Question can be edited and deleted",
    examType: "COURSE_EXAMINATION",
  },
];

const paginate = (rows, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedRows = rows.slice(start, end);

  return {
    rows: pagedRows,
    count: rows.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

const findQuestion = (questionId) =>
  MOCK_QUESTIONS.find((q) => q.questionId === questionId);

// ---------------------------------------------------------------------------
// 1.17-TC32
// ---------------------------------------------------------------------------

/**
 * Get all uploaded questions
 * GET /api/v2/questions
 */
export const adminGetUploadedQuestions = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/api/v2/questions', { params });

  const search = String(params.search || "").trim().toLowerCase();
  const examType = params.examType;

  const filtered = MOCK_QUESTIONS.filter((q) => {
    const passesSearch = search
      ? [q.questionId, q.content, q.courseId, q.courseName]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(search))
      : true;

    const passesExamType = examType ? q.examType === examType : true;

    return passesSearch && passesExamType;
  });

  const pagination = paginate(filtered, params);
  return {
    questions: pagination.rows,
    pagination: {
      count: pagination.count,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    },
  };
};

/**
 * Get uploaded question by id
 * GET /api/v2/questions/{id}
 */
export const adminGetUploadedQuestionById = async (questionId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/questions/${questionId}`);

  const question = findQuestion(questionId) || MOCK_QUESTIONS[0];

  return {
    question: {
      ...question,
      questionId,
    },
  };
};

/**
 * Update uploaded question (restricted for standalone exam)
 * PATCH /api/v2/questions/{id}
 */
export const adminUpdateUploadedQuestion = async (questionId, body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.patch(`/api/v2/questions/${questionId}`, body);

  const found = findQuestion(questionId) || MOCK_QUESTIONS[0];

  if (found.examType === "STANDALONE_EXAMINATION") {
    return {
      message: TC32_DEFAULT_REMARK,
      question: {
        ...found,
        questionId,
        modificationAttemptDate: new Date().toISOString(),
        updateStatus: "Not Updated",
        deletePermission: "Not Allowed",
        remarks: TC32_DEFAULT_REMARK,
      },
    };
  }

  const updatedQuestion = {
    ...found,
    questionId,
    content: body.content || found.content,
    difficultyLevel: body.difficultyLevel || found.difficultyLevel,
    marks: Number(body.marks ?? found.marks),
    correctAnswer: body.correctAnswer || found.correctAnswer,
    explanation: body.explanation || found.explanation,
    tags: Array.isArray(body.tags) ? body.tags : found.tags,
    modifiedBy: body.modifiedBy || "Instructor-002",
    modificationAttemptDate: new Date().toISOString(),
    updateStatus: "Updated",
    deletePermission: "Allowed",
    remarks: "Question updated successfully",
  };

  MOCK_QUESTIONS = MOCK_QUESTIONS.map((q) =>
    q.questionId === updatedQuestion.questionId ? updatedQuestion : q,
  );

  return {
    message: "Question updated successfully",
    question: updatedQuestion,
  };
};

/**
 * Delete uploaded question (restricted for standalone exam)
 * DELETE /api/v2/questions/{id}
 */
export const adminDeleteUploadedQuestion = async (questionId) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.delete(`/api/v2/questions/${questionId}`);

  const found = findQuestion(questionId) || MOCK_QUESTIONS[0];

  if (found.examType === "STANDALONE_EXAMINATION") {
    return {
      message: "Deletion not permitted for standalone examination",
      data: {
        questionId,
        deleted: false,
        deletePermission: "Not Allowed",
        remarks: "Deletion cannot be performed - Standalone examination",
      },
    };
  }

  MOCK_QUESTIONS = MOCK_QUESTIONS.filter((q) => q.questionId !== questionId);

  return {
    message: "Question deleted successfully",
    data: {
      questionId,
      deleted: true,
      deletePermission: "Allowed",
      remarks: "Question deleted",
    },
  };
};

/**
 * Get course questions
 * GET /api/v2/courses/{courseId}/questions
 */
export const adminGetCourseUploadedQuestions = async (courseId, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/courses/${courseId}/questions`, { params });

  const filtered = MOCK_QUESTIONS.filter((q) => q.courseId === courseId);
  const pagination = paginate(filtered, params);

  return {
    courseId,
    questions: pagination.rows,
    pagination: {
      count: pagination.count,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    },
  };
};
