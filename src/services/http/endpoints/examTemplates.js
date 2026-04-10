import { http } from '../http';

// ---------------------------------------------------------------------------
// 3.1 Create Examination Template
// POST /v2/exam-templates
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
// GET /v2/exam-templates
// ---------------------------------------------------------------------------

/**
 * Get all examination templates
 * @param {{ courseId?, status?, page?, limit?, search?, sortBy?, sortOrder? }} params
 * @returns {Promise<{ templates: Array, totalDocumentsCount: number }>}
 */
export const adminGetExamTemplates = async (params) => {
  const { data: { data } } = await http.get('/v2/exam-templates', { params });
  return { templates: data.templates, totalDocumentsCount: data.pagination.totalItems };
};

// ---------------------------------------------------------------------------
// 3.3 Get Single Template by ID
// GET /v2/exam-templates/:templateId
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
// 3.4 Generate Examination Paper from Template
// POST /api/v2/exam-templates/:templateId/generate
// ---------------------------------------------------------------------------

/**
 * Generate a paper from a template for a student
 * @param {string} templateId
 * @param {{ studentId: string, examId: string }} body
 * @returns {Promise<{ message: string, paper: object }>}
 */
export const adminGenerateExamPaper = async (templateId, body) => {
  const { data: { message, data } } = await http.post(`/api/v2/exam-templates/${templateId}/generate`, body);
  return { message, paper: data };
};

// ---------------------------------------------------------------------------
// 3.5 Get Template Statistics
// GET /api/v2/exam-templates/:templateId/statistics
// ---------------------------------------------------------------------------

/**
 * Get usage statistics for a template
 * @param {string} templateId
 * @returns {Promise<{ statistics: object }>}
 */
export const adminGetTemplateStatistics = async (templateId) => {
  const { data: { data } } = await http.get(`/api/v2/exam-templates/${templateId}/statistics`);
  return { statistics: data };
};

// ---------------------------------------------------------------------------
// 3.6 Update Examination Template (partial)
// PATCH /v2/exam-templates/:templateId
// ---------------------------------------------------------------------------

/**
 * Partially update an examination template
 * @param {string} templateId
 * @param {object} body - Fields to update
 * @returns {Promise<{ message: string, template: object }>}
 */
export const adminUpdateExamTemplate = async (templateId, body) => {
  const { data: { message, data } } = await http.patch(`/v2/exam-templates/${templateId}`, body);
  return { message, template: data };
};

// ---------------------------------------------------------------------------
// 3.7 Archive Examination Template (soft delete)
// DELETE /v2/exam-templates/:templateId
// ---------------------------------------------------------------------------

/**
 * Archive (soft-delete) a template — transitions status to ARCHIVED
 * @param {string} templateId
 * @returns {Promise<{ message: string }>}
 */
export const adminArchiveExamTemplate = async (templateId) => {
  const { data: { message } } = await http.delete(`/v2/exam-templates/${templateId}`);
  return { message };
};

// ---------------------------------------------------------------------------
// 3.8 Permanent Delete Examination Template
// DELETE /v2/exam-templates/:templateId/permanent
// ---------------------------------------------------------------------------

/**
 * Permanently delete an archived template
 * @param {string} templateId
 * @returns {Promise<{ message: string }>}
 */
export const adminPermanentDeleteExamTemplate = async (templateId) => {
  const { data: { message } } = await http.delete(`/v2/exam-templates/${templateId}/permanent`);
  return { message };
};

// ---------------------------------------------------------------------------
// 3.9 Preview Template Structure
// GET /api/v2/exam-templates/:templateId/preview
// ---------------------------------------------------------------------------

/**
 * Preview the structure of a template without generating a full paper
 * @param {string} templateId
 * @returns {Promise<{ preview: object }>}
 */
export const adminGetTemplatePreview = async (templateId) => {
  const { data: { data } } = await http.get(`/api/v2/exam-templates/${templateId}/preview`);
  return { preview: data };
};

// ---------------------------------------------------------------------------
// Legacy v1 Endpoints
// ---------------------------------------------------------------------------

/**
 * Get all exam templates (v1 legacy)
 * GET /v1/stand-alone-examination/template
 * @param {object} params
 * @returns {Promise<{ templates: Array, totalDocumentsCount: number }>}
 */
export const adminGetV1ExamTemplates = async (params) => {
  const { data: { data } } = await http.get('/v1/stand-alone-examination/template', { params });
  return { templates: data.templates, totalDocumentsCount: data.pagination.totalItems };
};

/**
 * Get a template by ID (v1 legacy)
 * GET /v1/stand-alone-examination/template/:templateId
 * @param {string} templateId
 * @returns {Promise<{ template: object }>}
 */
export const adminGetV1ExamTemplateById = async (templateId) => {
  const { data: { data } } = await http.get(`/v1/stand-alone-examination/template/${templateId}`);
  return { template: data };
};

/**
 * Get template library statistics (v1 legacy)
 * GET /v1/stand-alone-examination/template/statistics
 * @returns {Promise<{ statistics: object }>}
 */
export const adminGetV1TemplateStatistics = async () => {
  const { data: { data } } = await http.get('/v1/stand-alone-examination/template/statistics');
  return { statistics: data };
};

// ---------------------------------------------------------------------------
// 3.10 Create Question Bank
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
