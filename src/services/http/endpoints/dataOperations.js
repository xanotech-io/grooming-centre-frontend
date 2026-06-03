import { http } from '../http';

/**
 * TC02 - Data Import via User Interface
 * POST /v2/data-operations/import
 */
export const adminImportData = async (body) => {
  const formData = new FormData();
  formData.append('type', body.type);
  formData.append('file', body.file);
  if (body.options) formData.append('options', JSON.stringify(body.options));
  const { data } = await http.post('/v2/data-operations/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { message: data?.message, job: data?.data ?? data };
};

/**
 * TC01 - Data Extraction via User Interface (Export)
 * POST /v2/data-operations/export
 */
export const adminExportData = async (body) => {
  const { data } = await http.post('/v2/data-operations/export', body);
  return { message: data?.message, job: data?.data ?? data };
};

/**
 * Get Operation Status
 * GET /v2/data-operations/{operationId}
 */
export const adminGetOperationStatus = async (operationId) => {
  const { data } = await http.get(`/v2/data-operations/${operationId}`);
  return { operation: data?.data ?? data };
};

/**
 * Download Export File
 * GET /v2/data-operations/{operationId}/download
 */
export const adminDownloadOperationFile = async (operationId) => {
  const response = await http.get(`/v2/data-operations/${operationId}/download`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  return { downloadUrl: url };
};

/**
 * Cancel Operation
 * POST /v2/data-operations/{operationId}/cancel
 */
export const adminCancelOperation = async (operationId) => {
  const { data } = await http.post(`/v2/data-operations/${operationId}/cancel`);
  return { message: data?.message, data: data?.data ?? data };
};

/**
 * List My Operations
 * GET /v2/data-operations/my-operations
 */
export const adminGetMyOperations = async (params = {}) => {
  const { data } = await http.get('/v2/data-operations/my-operations', { params });
  const d = data?.data ?? {};
  return {
    operations: d.operations ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};
