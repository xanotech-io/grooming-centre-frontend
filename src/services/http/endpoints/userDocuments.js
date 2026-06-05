import { http } from '../http';

const DOC_TYPE_UP = {
  certificate: 'CERTIFICATE',
  registration_sheet: 'REGISTRATION_SHEET',
  evaluation_form: 'EVALUATION_FORM',
  attendance_record: 'ATTENDANCE_RECORD',
  other: 'OTHER',
};

const mapDoc = (doc) => {
  const createdAt = doc.createdAt;
  const daysPending = createdAt
    ? Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24))
    : null;

  return {
    uploadId: doc.id,
    userId: doc.studentId,
    userName: doc.student
      ? `${doc.student.firstName} ${doc.student.lastName}`
      : null,
    documentType: DOC_TYPE_UP[doc.documentType] || doc.documentType?.toUpperCase(),
    fileName: doc.title,
    fileFormat: doc.fileType?.toUpperCase(),
    fileUrl: doc.fileUrl,
    fileSize: null,
    verificationStatus: doc.status?.toUpperCase(),
    status: doc.status?.toUpperCase(),
    uploadDate: doc.createdAt,
    verifiedAt: doc.verifiedAt,
    courseId: doc.course?.id || doc.courseId,
    courseName: doc.course?.title,
    uploadedBy: doc.uploader
      ? `${doc.uploader.firstName} ${doc.uploader.lastName}`
      : null,
    verifiedBy: doc.verifier
      ? `${doc.verifier.firstName} ${doc.verifier.lastName}`
      : null,
    rejectionReason: doc.rejectionReason,
    remark: doc.remark,
    daysPending,
    expiryDate: doc.expiryDate,
  };
};

export const adminUploadUserDocument = async (studentId, body) => {
  const formData = new FormData();
  formData.append('file', body.file);
  formData.append('studentId', studentId);
  formData.append('documentType', body.documentType);
  formData.append('title', body.fileName);
  if (body.courseId) formData.append('courseId', body.courseId);
  if (body.expiryDate) formData.append('expiryDate', body.expiryDate);
  if (body.remark) formData.append('remark', body.remark);

  const { data: { data } } = await http.post('/v1/student-documents-v2', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { message: 'Document uploaded successfully', document: mapDoc(data) };
};

export const adminGetAllDocuments = async (params = {}) => {
  const query = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.status) query.status = params.status.toLowerCase();
  if (params.documentType) query.documentType = params.documentType.toLowerCase();
  if (params.studentId) query.studentId = params.studentId;

  const { data: { data } } = await http.get('/v1/student-documents-v2', { params: query });
  return {
    documents: (data.documents || []).map(mapDoc),
    pagination: {
      page: data.page,
      limit: data.limit,
      totalItems: data.total,
      totalPages: data.totalPages,
    },
  };
};

export const adminGetPendingDocuments = async (params = {}) => {
  const result = await adminGetAllDocuments({ ...params, status: 'pending' });
  return {
    ...result,
    summary: {
      totalPending: result.pagination.totalItems,
      pendingMoreThan3Days: result.documents.filter((d) => d.daysPending > 3).length,
    },
  };
};

export const adminGetUserDocuments = async (studentId, params = {}) => {
  const { data: { data } } = await http.get(`/v1/student-documents-v2/student/${studentId}`);

  let docs = (data.documents || []).map(mapDoc);

  if (params.verificationStatus) {
    docs = docs.filter((d) => d.verificationStatus === params.verificationStatus);
  }
  if (params.documentType) {
    docs = docs.filter((d) => d.documentType === params.documentType);
  }

  const page = params.page || 1;
  const limit = params.limit || 10;
  const paged = docs.slice((page - 1) * limit, page * limit);

  return {
    documents: paged,
    pagination: {
      page,
      limit,
      totalItems: docs.length,
      totalPages: Math.ceil(docs.length / limit),
    },
    summary: data.summary,
  };
};

export const adminGetDocumentById = async (_userId, documentId) => {
  const { data: { data } } = await http.get(`/v1/student-documents-v2/${documentId}`);
  return { document: mapDoc(data) };
};

export const adminVerifyDocument = async (documentId) => {
  const { data: { data } } = await http.put(
    `/v1/student-documents-v2/${documentId}/verify`,
    { action: 'verified' },
  );
  return { message: 'Document verified successfully', document: mapDoc(data) };
};

export const adminRejectDocument = async (documentId, body) => {
  const { data: { data } } = await http.put(
    `/v1/student-documents-v2/${documentId}/verify`,
    { action: 'rejected', rejectionReason: body.rejectionReason },
  );
  return { message: 'Document rejected', document: mapDoc(data) };
};

export const adminDeleteDocument = async (documentId) => {
  await http.delete(`/v1/student-documents-v2/${documentId}`);
  return { message: 'Document deleted successfully' };
};

export const adminGetDocumentKpis = async () => {
  const { data: { data } } = await http.get('/v1/student-documents-v2/kpis');
  return {
    totalDocuments: data.totalDocuments,
    verified: data.byStatus?.verified ?? 0,
    pending: data.byStatus?.pending ?? 0,
    rejected: data.byStatus?.rejected ?? 0,
    uploadVerificationRate: data.uploadVerificationRate,
    documentAvailabilityRate: data.documentAvailabilityRate,
    averageVerificationTimeHours: data.averageVerificationTimeHours,
  };
};

export const adminReplaceDocument = async (documentId, file, remark) => {
  const formData = new FormData();
  formData.append('file', file);
  if (remark) formData.append('remark', remark);

  const { data: { data } } = await http.put(
    `/v1/student-documents-v2/${documentId}/replace`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return { message: 'Document replaced successfully', document: mapDoc(data) };
};

export const adminGetDocumentAuditLog = async (documentId) => {
  const { data: { data } } = await http.get(
    `/v1/student-documents-v2/${documentId}/audit-log`,
  );
  return { auditLog: data };
};
