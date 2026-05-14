import { http } from '../http';

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const adminCreateBulkCourseV2Template = async (body) => {
  const { data: { message, data } } = await http.post('/v1/bulk-course-v2/template', body);
  return { message, template: data };
};

export const adminGetBulkCourseV2Templates = async () => {
  const { data: { data } } = await http.get('/v1/bulk-course-v2/template');
  return { templates: data };
};

export const adminGetBulkCourseV2TemplateById = async (templateId) => {
  const { data: { data } } = await http.get(`/v1/bulk-course-v2/template/${templateId}`);
  return { template: data };
};

export const adminUpdateBulkCourseV2Template = async (templateId, body) => {
  const { data: { message, data } } = await http.put(`/v1/bulk-course-v2/template/${templateId}`, body);
  return { message, template: data };
};

// ---------------------------------------------------------------------------
// Batches
// ---------------------------------------------------------------------------

export const adminCreateBulkCourseV2Batch = async (body) => {
  const { data: { message, data } } = await http.post('/v1/bulk-course-v2/batch', body);
  return { message, batch: data };
};

export const adminGetBulkCourseV2Batches = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/bulk-course-v2/batch', { params });
  return { batches: Array.isArray(data) ? data : data?.batches ?? [], pagination: data?.pagination ?? {} };
};

export const adminUploadBulkCourseV2BatchFile = async (formData) => {
  const { data: { message, data } } = await http.post('/v1/bulk-course-v2/batch/upload', formData);
  return { message, batch: data };
};

export const adminGetBulkCourseV2BatchDetails = async (batchId) => {
  const { data: { data } } = await http.get(`/v1/bulk-course-v2/batch/${batchId}`);
  return { batch: data };
};

export const adminRetryBulkCourseV2Batch = async (batchId) => {
  const { data: { data } } = await http.post(`/v1/bulk-course-v2/batch/${batchId}/retry`);
  return {
    retried: data?.retried ?? 0,
    retriedSuccess: data?.retriedSuccess ?? 0,
    retriedFailed: data?.retriedFailed ?? 0,
  };
};

export const adminPublishBulkCourseV2Batch = async (batchId) => {
  const { data: { data } } = await http.post(`/v1/bulk-course-v2/batch/${batchId}/publish`);
  return { published: data?.published ?? 0 };
};
