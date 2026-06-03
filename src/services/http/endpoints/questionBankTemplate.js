import { http } from '../http';

/**
 * 10.1 Create Question Bank Template
 * POST /v1/question-templates
 */
export const adminCreateQuestionTemplate = async (body) => {
  const { data } = await http.post('/v1/question-templates', body);
  return { message: data?.message, template: data?.data ?? data };
};

/**
 * 10.2 Get All Templates
 * GET /v1/question-templates
 */
export const adminGetAllQuestionTemplates = async (params = {}) => {
  const { data } = await http.get('/v1/question-templates', { params });
  const d = data?.data ?? {};
  return {
    templates: d.templates ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

/**
 * 10.3 Get Template by ID
 * GET /v1/question-templates/{id}
 */
export const adminGetQuestionTemplateById = async (templateId) => {
  const { data } = await http.get(`/v1/question-templates/${templateId}`);
  return { template: data?.data ?? data };
};

/**
 * 10.4 Update Template
 * PATCH /v1/question-templates/{id}
 */
export const adminUpdateQuestionTemplate = async (templateId, body) => {
  const { data } = await http.patch(`/v1/question-templates/${templateId}`, body);
  return { message: data?.message, template: data?.data ?? data };
};

/**
 * 10.5 Delete Template
 * DELETE /v1/question-templates/{id}
 */
export const adminDeleteQuestionTemplate = async (templateId) => {
  const { data } = await http.delete(`/v1/question-templates/${templateId}`);
  return { message: data?.message, data: data?.data ?? data };
};

/**
 * 10.6 Duplicate Template
 * POST /v1/question-templates/{id}/duplicate
 */
export const adminDuplicateQuestionTemplate = async (templateId) => {
  const { data } = await http.post(`/v1/question-templates/${templateId}/duplicate`);
  return { message: data?.message, template: data?.data ?? data };
};

/**
 * 10.7 Get Template Usage Statistics
 * GET /v1/question-templates/{id}/usage
 */
export const adminGetTemplateUsageStats = async (templateId) => {
  const { data } = await http.get(`/v1/question-templates/${templateId}/usage`);
  const d = data?.data ?? {};
  return {
    templateId,
    templateName: d.templateName ?? '',
    usageStatistics: d.usageStatistics ?? {},
    questionUtilization: d.questionUtilization ?? {},
  };
};

/**
 * 10.8 Search Templates
 * GET /v1/question-templates/search
 */
export const adminSearchQuestionTemplates = async (params = {}) => {
  const { data } = await http.get('/v1/question-templates/search', { params });
  const d = data?.data ?? {};
  return {
    searchTerm: d.searchTerm ?? params.q ?? '',
    results: d.results ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

/**
 * 10.9 Get Course Templates
 * GET /v2/courses/{id}/question-templates
 */
export const adminGetCourseQuestionTemplates = async (courseId, params = {}) => {
  const { data } = await http.get(`/v2/courses/${courseId}/question-templates`, { params });
  const d = data?.data ?? {};
  return {
    courseId,
    courseName: d.courseName ?? '',
    templates: d.templates ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};
