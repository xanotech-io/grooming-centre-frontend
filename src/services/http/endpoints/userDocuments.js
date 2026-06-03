import { http } from '../http';

/**
 * Upload a document for a user
 * POST /v2/users/{id}/documents
 */
export const adminUploadUserDocument = async (userId, body) => {
  const formData = new FormData();
  formData.append('file', body.file);
  formData.append('documentType', body.documentType);
  formData.append('fileFormat', body.fileFormat);
  formData.append('fileName', body.fileName);
  if (body.courseId) formData.append('courseId', body.courseId);
  if (body.expiryDate) formData.append('expiryDate', body.expiryDate);
  const { data } = await http.post(`/v2/users/${userId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { message: data?.message, document: data?.data ?? data };
};

/**
 * Get all documents for a specific user
 * GET /v2/users/{id}/documents
 */
export const adminGetUserDocuments = async (userId, params = {}) => {
  const { data } = await http.get(`/v2/users/${userId}/documents`, { params });
  const d = data?.data ?? {};
  return {
    documents: d.rows ?? d.documents ?? (Array.isArray(d) ? d : []),
    pagination: {
      page: d.page ?? params.page ?? 1,
      limit: d.limit ?? params.limit ?? 10,
      totalItems: d.count ?? d.total ?? 0,
      totalPages: d.totalPages ?? 1,
    },
  };
};

/**
 * Get a specific document by its upload ID
 * GET /v2/users/{id}/documents/{uploadId}
 */
export const adminGetDocumentById = async (userId, uploadId) => {
  const { data } = await http.get(`/v2/users/${userId}/documents/${uploadId}`);
  return { document: data?.data ?? data };
};

/**
 * Verify a user document
 * PATCH /v2/documents/{id}/verify
 */
export const adminVerifyDocument = async (uploadId) => {
  const { data } = await http.patch(`/v2/documents/${uploadId}/verify`);
  return { message: data?.message, document: data?.data ?? data };
};

/**
 * Reject a user document with a reason
 * PATCH /v2/documents/{id}/reject
 */
export const adminRejectDocument = async (uploadId, body) => {
  const { data } = await http.patch(`/v2/documents/${uploadId}/reject`, body);
  return { message: data?.message, document: data?.data ?? data };
};

/**
 * Delete a document permanently
 * DELETE /v2/documents/{id}
 */
export const adminDeleteDocument = async (uploadId) => {
  const { data } = await http.delete(`/v2/documents/${uploadId}`);
  return { message: data?.message };
};

/**
 * Get all pending documents awaiting admin verification
 * GET /v2/admin/documents/pending
 */
export const adminGetPendingDocuments = async (params = {}) => {
  const { data } = await http.get('/v2/admin/documents/pending', { params });
  const d = data?.data ?? {};
  return {
    documents: d.rows ?? d.documents ?? (Array.isArray(d) ? d : []),
    pagination: {
      page: d.page ?? params.page ?? 1,
      limit: d.limit ?? params.limit ?? 10,
      totalItems: d.count ?? d.total ?? 0,
      totalPages: d.totalPages ?? 1,
    },
    summary: d.summary ?? {},
  };
};
