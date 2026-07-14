import { http } from '../http';

/**
 * 9.1 Upload Questions for Bulk Import
 * POST /v2/question-banks/{id}/import
 */
export const adminImportQuestions = async (bankId, body) => {
  const { data } = await http.post(`/v2/question-banks/${bankId}/import`, body);
  return { message: data?.message, upload: data?.data ?? data };
};

/**
 * 9.2 Get Upload Details
 * GET /v2/question-imports/{id}
 */
export const adminGetUploadDetails = async (uploadId) => {
  const { data } = await http.get(`/v2/question-imports/${uploadId}`);
  return { upload: data?.data ?? data };
};

/**
 * 9.3 Get Failed Questions
 * GET /v2/question-imports/{id}/errors
 */
export const adminGetFailedQuestions = async (uploadId) => {
  const { data } = await http.get(`/v2/question-imports/${uploadId}/errors`);
  const d = data?.data ?? {};
  return {
    failedCount: d.failedCount ?? 0,
    errors: d.errors ?? [],
    errorSummary: d.errorSummary ?? {},
  };
};

/**
 * 9.4 Cancel Upload
 * DELETE /v2/question-imports/{id}
 */
export const adminCancelQuestionImport = async (uploadId) => {
  const { data } = await http.delete(`/v2/question-imports/${uploadId}`);
  return { message: data?.message, data: data?.data ?? data };
};

/**
 * 9.5 Get Question Import Template
 * GET /v1/question-batch-import-v2/template/download
 */
export const adminGetQuestionImportTemplate = async () => {
  const response = await http.get('/v1/question-batch-import-v2/template/download', {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * 9.6 Get Course Question Uploads
 * GET /v2/courses/{id}/question-uploads
 */
export const adminGetCourseQuestionUploads = async (courseId, params = {}) => {
  const { data } = await http.get(`/v2/courses/${courseId}/question-uploads`, { params });
  const d = data?.data ?? {};
  return {
    courseId,
    courseName: d.courseName ?? '',
    uploads: d.uploads ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

/**
 * 9.7 Get All Uploads
 * GET /v1/question-batch-import-v2
 */
export const adminGetAllQuestionImports = async (params = {}) => {
  const { data } = await http.get('/v1/question-batch-import-v2', { params });
  const d = data?.data ?? {};
  return {
    uploads: d.uploads ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};
