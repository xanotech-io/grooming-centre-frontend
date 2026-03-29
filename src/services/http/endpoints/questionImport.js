// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_UPLOADS = [
  {
    uploadId: "upload-001",
    bankId: "bank-001",
    bankName: "Agriculture Fundamentals Question Bank",
    courseId: "course-uuid-123",
    courseName: "Agriculture Fundamentals",
    fileName: "Week1_Questions.csv",
    fileUrl: "https://storage.example.com/uploads/week1.csv",
    totalQuestions: 20,
    processedQuestions: 20,
    successfulImports: 20,
    failedImports: 0,
    hasMultimedia: false,
    status: "SUCCESS",
    uploadedBy: "instructor-001",
    uploadedAt: "2025-10-15T10:00:00Z",
    completedAt: "2025-10-15T10:02:00Z",
  },
  {
    uploadId: "upload-002",
    bankId: "bank-001",
    bankName: "Agriculture Fundamentals Question Bank",
    courseId: "course-uuid-123",
    courseName: "Agriculture Fundamentals",
    fileName: "Week2_Questions.csv",
    fileUrl: "https://storage.example.com/uploads/week2.csv",
    totalQuestions: 25,
    processedQuestions: 25,
    successfulImports: 23,
    failedImports: 2,
    hasMultimedia: false,
    status: "PARTIAL",
    uploadedBy: "instructor-001",
    uploadedAt: "2025-10-22T11:00:00Z",
    completedAt: "2025-10-22T11:03:00Z",
  },
  {
    uploadId: "upload-003",
    bankId: "bank-002",
    bankName: "Data Analytics Question Bank",
    courseId: "course-uuid-456",
    courseName: "Data Analytics 101",
    fileName: "Questions_Batch1.csv",
    fileUrl: "https://storage.example.com/uploads/batch1.csv",
    totalQuestions: 50,
    processedQuestions: 30,
    successfulImports: 30,
    failedImports: 0,
    hasMultimedia: true,
    status: "PROCESSING",
    uploadedBy: "instructor-002",
    uploadedAt: "2025-11-01T10:00:00Z",
    completedAt: null,
  },
  {
    uploadId: "upload-004",
    bankId: "bank-002",
    bankName: "Data Analytics Question Bank",
    courseId: "course-uuid-456",
    courseName: "Data Analytics 101",
    fileName: "ML_Questions_Final.csv",
    fileUrl: "https://storage.example.com/uploads/ml_final.csv",
    totalQuestions: 30,
    processedQuestions: 30,
    successfulImports: 30,
    failedImports: 0,
    hasMultimedia: false,
    status: "SUCCESS",
    uploadedBy: "instructor-002",
    uploadedAt: "2025-10-28T14:00:00Z",
    completedAt: "2025-10-28T14:02:00Z",
  },
];

const MOCK_FAILED_QUESTIONS = [
  {
    rowNumber: 15,
    questionText: "What is the process of...",
    errorType: "VALIDATION_ERROR",
    errorMessage: "Missing correct answer for MCQ question",
    suggestedFix: "Add 'correct_option' column value",
  },
  {
    rowNumber: 23,
    questionText: "Calculate the yield...",
    errorType: "FORMAT_ERROR",
    errorMessage:
      "Invalid difficulty level 'VERY_HARD'. Allowed: EASY, MEDIUM, HARD",
    suggestedFix: "Change difficulty to 'HARD'",
  },
];

const MOCK_TEMPLATE = {
  format: "CSV",
  encoding: "UTF-8",
  requiredColumns: [
    "question_text",
    "question_type",
    "difficulty_level",
    "marks",
    "correct_answer",
  ],
  optionalColumns: [
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "explanation",
    "tags",
    "media_url",
  ],
  sampleRow: {
    question_text: "What is photosynthesis?",
    question_type: "MCQ",
    difficulty_level: "MEDIUM",
    marks: 2,
    correct_answer: "A",
    option_a: "Process by which plants convert light energy",
    option_b: "Process of water absorption",
    option_c: "Process of soil nutrient extraction",
    option_d: "Process of root growth",
    explanation: "Photosynthesis converts light energy into chemical energy",
    tags: "biology,plants,energy",
    media_url: "",
  },
  questionTypes: ["MCQ", "TRUE_FALSE", "FILL_BLANK", "ESSAY", "MATCHING"],
  difficultyLevels: ["EASY", "MEDIUM", "HARD"],
  downloadUrl:
    "https://storage.example.com/templates/question_import_template.csv",
};

// ---------------------------------------------------------------------------
// 9.1 Upload Questions for Bulk Import
// POST /api/v2/question-banks/{id}/import
// ---------------------------------------------------------------------------

/**
 * Initiate a bulk question import for a question bank
 * @param {string} bankId
 * @param {{ fileName: string, fileUrl: string, totalQuestions: number, hasMultimedia: boolean }} body
 * @returns {Promise<{ message: string, upload: object }>}
 */
export const adminImportQuestions = async (bankId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/question-banks/${bankId}/import`, body);
  // return { message, upload: data };

  return {
    message: "Upload initiated successfully",
    upload: {
      uploadId: `upload-${Date.now()}`,
      bankId,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      totalQuestions: body.totalQuestions,
      hasMultimedia: body.hasMultimedia || false,
      status: "PROCESSING",
      uploadedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 9.2 Get Upload Details
// GET /api/v2/question-imports/{id}
// ---------------------------------------------------------------------------

/**
 * Get full details of a question import upload
 * @param {string} uploadId
 * @returns {Promise<{ upload: object }>}
 */
export const adminGetUploadDetails = async (uploadId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/question-imports/${uploadId}`);
  // return { upload: data };

  const found =
    MOCK_UPLOADS.find((u) => u.uploadId === uploadId) || MOCK_UPLOADS[1];
  return {
    upload: {
      ...found,
      uploadId,
      validationSummary: {
        validQuestions: found.successfulImports,
        invalidQuestions: found.failedImports,
        warnings: found.failedImports > 0 ? 1 : 0,
      },
    },
  };
};

// ---------------------------------------------------------------------------
// 9.3 Get Failed Questions
// GET /api/v2/question-imports/{id}/errors
// ---------------------------------------------------------------------------

/**
 * Get the list of failed questions for a specific import
 * @param {string} uploadId
 * @returns {Promise<{ failedCount: number, errors: Array, errorSummary: object }>}
 */
export const adminGetFailedQuestions = async (uploadId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/question-imports/${uploadId}/errors`);
  // return { failedCount: data.failedCount, errors: data.errors, errorSummary: data.errorSummary };

  return {
    failedCount: MOCK_FAILED_QUESTIONS.length,
    errors: MOCK_FAILED_QUESTIONS,
    errorSummary: {
      validationErrors: 1,
      formatErrors: 1,
      missingRequiredFields: 0,
    },
  };
};

// ---------------------------------------------------------------------------
// 9.4 Cancel Upload
// DELETE /api/v2/question-imports/{id}
// ---------------------------------------------------------------------------

/**
 * Cancel an in-progress upload
 * @param {string} uploadId
 * @returns {Promise<{ message: string, data: object }>}
 */
export const adminCancelQuestionImport = async (uploadId) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.delete(`/v2/question-imports/${uploadId}`);
  // return { message, data };

  return {
    message: "Upload cancelled successfully",
    data: {
      uploadId,
      previousStatus: "PROCESSING",
      cancelledAt: new Date().toISOString(),
      processedQuestions: 12,
      rolledBack: true,
    },
  };
};

// ---------------------------------------------------------------------------
// 9.5 Get Question Import Template
// GET /api/v2/question-imports/template
// ---------------------------------------------------------------------------

/**
 * Get the CSV template for bulk question import
 * @returns {Promise<{ template: object }>}
 */
export const adminGetQuestionImportTemplate = async () => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/question-imports/template');
  // return { template: data.template };

  return { template: MOCK_TEMPLATE };
};

// ---------------------------------------------------------------------------
// 9.6 Get Course Question Uploads
// GET /api/v2/courses/{id}/question-uploads
// ---------------------------------------------------------------------------

/**
 * Get all question uploads for a specific course
 * @param {string} courseId
 * @param {{ page?: number, limit?: number, status?: string }} params
 * @returns {Promise<{ courseId: string, courseName: string, uploads: Array, pagination: object }>}
 */
export const adminGetCourseQuestionUploads = async (courseId, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/courses/${courseId}/question-uploads`, { params });
  // return { courseId: data.courseId, courseName: data.courseName, uploads: data.uploads, pagination: data.pagination };

  const uploads = MOCK_UPLOADS.filter((u) => u.courseId === courseId);
  return {
    courseId,
    courseName: uploads[0]?.courseName || "Unknown Course",
    uploads,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: uploads.length,
      totalPages: Math.ceil(uploads.length / (params.limit || 10)),
    },
  };
};

// ---------------------------------------------------------------------------
// 9.7 Get All Uploads
// GET /api/v2/question-imports
// ---------------------------------------------------------------------------

/**
 * Get all question import uploads
 * @param {{ page?: number, limit?: number, status?: string, courseId?: string }} params
 * @returns {Promise<{ uploads: Array, pagination: object }>}
 */
export const adminGetAllQuestionImports = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/question-imports', { params });
  // return { uploads: data.uploads, pagination: data.pagination };

  let filtered = [...MOCK_UPLOADS];
  if (params.status)
    filtered = filtered.filter((u) => u.status === params.status);
  if (params.courseId)
    filtered = filtered.filter((u) => u.courseId === params.courseId);

  return {
    uploads: filtered,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / (params.limit || 10)),
    },
  };
};
