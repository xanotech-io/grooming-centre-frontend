import { http } from '../http';

export const adminCreateBulkCourseBatch = async (body) => {
  const { data: { message, data } } = await http.post('/v1/bulk-course-v2/batch', body);
  return { message, batch: data };
};

export const adminGetBulkCourseBatches = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/bulk-course-v2/batch', { params });
  return {
    batches: Array.isArray(data) ? data : data?.batches ?? [],
    pagination: data?.pagination ?? {},
  };
};

export const adminGetBatchDetails = async (batchId) => {
  const { data: { data } } = await http.get(`/v1/bulk-course-v2/batch/${batchId}`);
  return { batch: data };
};

export const adminGetBatchProgress = async (batchId) => {
  const { data: { data } } = await http.get(`/v1/bulk-course-v2/batch/${batchId}`);
  return { progress: data };
};

export const adminRetryFailedBatch = async (batchId) => {
  const { data: { message, data } } = await http.post(`/v1/bulk-course-v2/batch/${batchId}/retry`);
  return { message, batch: data };
};

export const adminGetCourseTemplates = async () => {
  const { data: { data } } = await http.get('/v1/bulk-course-v2/template');
  return { templates: Array.isArray(data) ? data : data?.templates ?? [] };
};
