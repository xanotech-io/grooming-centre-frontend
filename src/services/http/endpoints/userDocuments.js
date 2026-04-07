// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_PENDING_DOCUMENTS = [
  {
    uploadId: "UPL-002",
    userId: "user-uuid-456",
    userName: "Jane Smith",
    documentType: "IDENTITY_DOCUMENT",
    fileName: "National_ID.pdf",
    fileFormat: "PDF",
    fileSize: 1024000,
    uploadDate: "2025-11-01T09:00:00Z",
    daysPending: 2,
    uploadedBy: "Jane Smith",
    accessLevel: "Admin",
    category: "Identity Verification",
  },
  {
    uploadId: "UPL-003",
    userId: "user-uuid-789",
    userName: "John Doe",
    documentType: "REGISTRATION_SHEET",
    fileName: "Registration_Form.pdf",
    fileFormat: "PDF",
    fileSize: 512000,
    uploadDate: "2025-11-02T11:00:00Z",
    daysPending: 1,
    uploadedBy: "John Doe",
    accessLevel: "Admin",
    category: "Enrollment",
  },
  {
    uploadId: "UPL-005",
    userId: "user-uuid-321",
    userName: "Amaka Obi",
    documentType: "CERTIFICATE",
    fileName: "Course_Certificate.pdf",
    fileFormat: "PDF",
    fileSize: 2048000,
    uploadDate: "2025-10-29T08:00:00Z",
    daysPending: 4,
    uploadedBy: "Instructor-001",
    accessLevel: "Learner",
    category: "Course Material",
  },
  {
    uploadId: "UPL-006",
    userId: "user-uuid-654",
    userName: "Tobi Adeyemi",
    documentType: "EVALUATION_FORM",
    fileName: "Evaluation_Form_Q4.pdf",
    fileFormat: "PDF",
    fileSize: 756000,
    uploadDate: "2025-10-28T14:00:00Z",
    daysPending: 5,
    uploadedBy: "Instructor-002",
    accessLevel: "Admin",
    category: "Assessment",
  },
];

const MOCK_USER_DOCUMENTS = [
  {
    uploadId: "UPL-001",
    documentType: "CERTIFICATE",
    fileName: "certificate_completion.pdf",
    fileFormat: "PDF",
    fileSize: 2048000,
    verificationStatus: "VERIFIED",
    uploadDate: "2025-11-01T10:30:00Z",
    verifiedAt: "2025-11-02T14:00:00Z",
    courseId: "AGR101",
    uploadedBy: "Instructor-002",
    accessLevel: "Learner",
    downloadPermission: true,
    category: "Course Material",
    sourceModule: "AGR101 → Module 1",
  },
  {
    uploadId: "UPL-002",
    documentType: "IDENTITY_DOCUMENT",
    fileName: "National_ID.pdf",
    fileFormat: "PDF",
    fileSize: 1024000,
    verificationStatus: "PENDING",
    uploadDate: "2025-11-01T09:00:00Z",
    verifiedAt: null,
    courseId: null,
    uploadedBy: "Jane Smith",
    accessLevel: "Admin",
    downloadPermission: false,
    category: "Identity Verification",
    sourceModule: null,
  },
  {
    uploadId: "UPL-007",
    documentType: "EVALUATION_FORM",
    fileName: "Module3_Eval.pdf",
    fileFormat: "PDF",
    fileSize: 890000,
    verificationStatus: "REJECTED",
    uploadDate: "2025-10-20T08:00:00Z",
    verifiedAt: null,
    courseId: "CS101",
    uploadedBy: "Instructor-003",
    accessLevel: "Admin",
    downloadPermission: false,
    category: "Assessment",
    sourceModule: "CS101 → Module 3",
    rejectionReason: "Document is blurry and unreadable. Please re-upload.",
  },
];

const MOCK_DOCUMENT_DETAIL = {
  uploadId: "UPL-001",
  userId: "user-uuid-789",
  documentType: "CERTIFICATE",
  fileName: "certificate_completion.pdf",
  fileUrl: "https://storage.example.com/documents/cert-123.pdf",
  fileFormat: "PDF",
  fileSize: 2048000,
  courseId: "AGR101",
  courseName: "Data Analytics 101",
  verificationStatus: "VERIFIED",
  uploadDate: "2025-11-01T10:30:00Z",
  verifiedAt: "2025-11-02T14:30:00Z",
  verifiedBy: "Admin-001",
  rejectionReason: null,
  isVisible: true,
  uploadedBy: "Instructor-002",
  accessLevel: "Learner",
  downloadPermission: true,
  category: "Course Material",
  sourceModule: "AGR101 → Module 1",
};

// ---------------------------------------------------------------------------
// 7.1 Upload User Document
// POST /api/v2/users/{id}/documents
// ---------------------------------------------------------------------------

/**
 * Upload a document for a user
 * @param {string} userId
 * @param {{ documentType: string, fileFormat: string, fileName: string, fileUrl: string, courseId?: string, fileSize: number }} body
 * @returns {Promise<{ message: string, document: object }>}
 */
export const adminUploadUserDocument = async (userId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/users/${userId}/documents`, body);
  // return { message, document: data };

  return {
    message: "Document uploaded successfully",
    document: {
      uploadId: `UPL-${Date.now()}`,
      userId,
      documentType: body.documentType,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileFormat: body.fileFormat,
      fileSize: body.fileSize,
      courseId: body.courseId || null,
      verificationStatus: "PENDING",
      uploadDate: new Date().toISOString(),
      uploadedBy: userId,
      accessLevel: "Admin",
      downloadPermission: false,
      category: "Uploaded Document",
      sourceModule: null,
    },
  };
};

// ---------------------------------------------------------------------------
// 7.2 Get User Documents
// GET /api/v2/users/{id}/documents
// ---------------------------------------------------------------------------

/**
 * Get all documents for a specific user
 * @param {string} userId
 * @param {{ page?: number, limit?: number, documentType?: string, verificationStatus?: string }} params
 * @returns {Promise<{ documents: Array, pagination: object }>}
 */
export const adminGetUserDocuments = async (userId, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/users/${userId}/documents`, { params });
  // return { documents: data.rows, pagination: { page: data.page, limit: data.limit, totalItems: data.count, totalPages: data.totalPages } };

  let filtered = [...MOCK_USER_DOCUMENTS];
  if (params.verificationStatus) {
    filtered = filtered.filter(
      (d) => d.verificationStatus === params.verificationStatus,
    );
  }
  if (params.documentType) {
    filtered = filtered.filter((d) => d.documentType === params.documentType);
  }

  return {
    documents: filtered,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / (params.limit || 10)),
    },
  };
};

// ---------------------------------------------------------------------------
// 7.3 Get Document by ID
// GET /api/v2/users/{id}/documents/{uploadId}
// ---------------------------------------------------------------------------

/**
 * Get a specific document by its upload ID
 * @param {string} userId
 * @param {string} uploadId
 * @returns {Promise<{ document: object }>}
 */
export const adminGetDocumentById = async (userId, uploadId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/users/${userId}/documents/${uploadId}`);
  // return { document: data };

  return { document: { ...MOCK_DOCUMENT_DETAIL, uploadId, userId } };
};

// ---------------------------------------------------------------------------
// 7.4 Verify Document (Admin)
// PATCH /api/v2/documents/{id}/verify
// ---------------------------------------------------------------------------

/**
 * Verify a user document
 * @param {string} uploadId
 * @returns {Promise<{ message: string, document: object }>}
 */
export const adminVerifyDocument = async (uploadId) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.patch(`/v2/documents/${uploadId}/verify`);
  // return { message, document: data };

  return {
    message: "Document verified successfully",
    document: {
      uploadId,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      verifiedBy: "Admin-001",
    },
  };
};

// ---------------------------------------------------------------------------
// 7.5 Reject Document (Admin)
// PATCH /api/v2/documents/{id}/reject
// ---------------------------------------------------------------------------

/**
 * Reject a user document with a reason
 * @param {string} uploadId
 * @param {{ rejectionReason: string }} body
 * @returns {Promise<{ message: string, document: object }>}
 */
export const adminRejectDocument = async (uploadId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.patch(`/v2/documents/${uploadId}/reject`, body);
  // return { message, document: data };

  return {
    message: "Document rejected successfully",
    document: {
      uploadId,
      verificationStatus: "REJECTED",
      rejectionReason: body.rejectionReason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: "Admin-001",
    },
  };
};

// ---------------------------------------------------------------------------
// 7.6 Delete Document
// DELETE /api/v2/documents/{id}
// ---------------------------------------------------------------------------

/**
 * Delete a document permanently
 * @param {string} uploadId
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteDocument = async (uploadId) => {
  // TODO: replace mock with real call
  // const { data: { message } } = await http.delete(`/v2/documents/${uploadId}`);
  // return { message };

  return {
    message: "Document deleted successfully",
    data: {
      uploadId,
      deletedAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 7.7 Get Pending Documents (Admin)
// GET /api/v2/admin/documents/pending
// ---------------------------------------------------------------------------

/**
 * Get all pending documents awaiting admin verification
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<{ documents: Array, pagination: object, summary: object }>}
 */
export const adminGetPendingDocuments = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/admin/documents/pending', { params });
  // return { documents: data.rows, pagination: { page: data.page, limit: data.limit, totalItems: data.count, totalPages: data.totalPages }, summary: data.summary };

  return {
    documents: MOCK_PENDING_DOCUMENTS,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: MOCK_PENDING_DOCUMENTS.length,
      totalPages: Math.ceil(
        MOCK_PENDING_DOCUMENTS.length / (params.limit || 10),
      ),
    },
    summary: {
      totalPending: MOCK_PENDING_DOCUMENTS.length,
      pendingMoreThan3Days: MOCK_PENDING_DOCUMENTS.filter(
        (d) => d.daysPending > 3,
      ).length,
    },
  };
};
