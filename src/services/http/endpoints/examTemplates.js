import { http } from '../http';

// ---------------------------------------------------------------------------
// 3.1 Create Examination Template
// POST /api/v2/exam-templates
// ---------------------------------------------------------------------------

/**
 * Create a new examination template
 * @param {{ templateName, courseId, sections, totalQuestions, totalMarks, durationMinutes, randomizationConfig, displayConfig }} body
 * @returns {Promise<{ message: string, template: object }>}
 */
export const adminCreateExamTemplate = async (body) => {
  const { data: { message, data } } = await http.post('/v2/exam-templates', body);
  return { message, template: data };
};

// ---------------------------------------------------------------------------
// 3.2 List Examination Templates
// GET /api/v2/exam-templates
// ---------------------------------------------------------------------------

/**
 * Get all examination templates
 * @param {{ courseId?, status?, page?, limit? }} params
 * @returns {Promise<{ templates: Array, totalDocumentsCount: number }>}
 */
export const adminGetExamTemplates = async (params) => {
  const { data: { data } } = await http.get('/v2/exam-templates', { params });
  return { templates: data.templates, totalDocumentsCount: data.pagination.totalItems };
};

// ---------------------------------------------------------------------------
// Get single template by ID (derived)
// GET /api/v2/exam-templates/:templateId
// ---------------------------------------------------------------------------

/**
 * Get a single template by ID
 * @param {string} templateId
 * @returns {Promise<{ template: object }>}
 */
export const adminGetExamTemplateById = async (templateId) => {
  const { data: { data } } = await http.get(`/v2/exam-templates/${templateId}`);
  return { template: data };
};

// ---------------------------------------------------------------------------
// 3.3 Generate Examination Paper from Template
// POST /api/v2/exam-templates/:templateId/generate
// ---------------------------------------------------------------------------

/**
 * Generate a paper from a template for a student
 * @param {string} templateId
 * @param {{ studentId: string, examId: string }} body
 * @returns {Promise<{ message: string, paper: object }>}
 */
export const adminGenerateExamPaper = async (templateId, body) => {
  const { data: { message, data } } = await http.post(`/v2/exam-templates/${templateId}/generate`, body);
  return { message, paper: data };
};

// ---------------------------------------------------------------------------
// 3.4 Get Template Statistics
// GET /api/v2/exam-templates/:templateId/statistics
// ---------------------------------------------------------------------------

/**
 * Get usage statistics for a template
 * @param {string} templateId
 * @returns {Promise<{ statistics: object }>}
 */
export const adminGetTemplateStatistics = async (templateId) => {
  const { data: { data } } = await http.get(`/v2/exam-templates/${templateId}/statistics`);
  return { statistics: data };
};

// ---------------------------------------------------------------------------
// 3.5 Create Question Bank
// POST /api/v2/question-banks
// ---------------------------------------------------------------------------

/**
 * Create a new question bank with questions
 * @param {{ courseId, bankName, questions: Array }} body
 * @returns {Promise<{ message: string, bank: object }>}
 */
export const adminCreateQuestionBank = async (body) => {
  const { data: { message, data } } = await http.post('/v2/question-banks', body);
  return { message, bank: data };
};

// ---------------------------------------------------------------------------
// Get Question Banks (listing)
// GET /api/v2/question-banks
// ---------------------------------------------------------------------------

/**
 * Get all question banks
 * @param {object} params
 * @returns {Promise<{ banks: Array, totalDocumentsCount: number }>}
 */
export const adminGetQuestionBanks = async (params) => {
  const { data: { data } } = await http.get('/v2/question-banks', { params });
  return { banks: data.banks, totalDocumentsCount: data.pagination.totalItems };
};
