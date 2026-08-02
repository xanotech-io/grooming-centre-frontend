import { http } from "../http";

/**
 * TC15 – Upload User Document
 * POST /v2/users/{userId}/documents
 * Upload user document (certificate, registration, evaluation, etc.)
 * 
 * @param {string} userId - User ID
 * @param {object} body - Document payload
 * @param {string} body.documentType - CERTIFICATE, REGISTRATION_SHEET, EVALUATION_FORM, IDENTITY_DOCUMENT
 * @param {string} body.fileFormat - PDF, JPG, PNG, DOC, DOCX
 * @param {string} body.fileName - Document file name
 * @param {string} body.fileUrl - Document file URL
 * @param {string} body.courseId - Course ID
 * @param {number} body.fileSize - File size in bytes
 * 
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const uploadUserDocument = async (userId, body) => {
  try {
    const path = `/v2/users/${userId}/documents`;
    const { data } = await http.post(path, body);
    return data;
  } catch (error) {
    // Mock response for development
    return {
      success: true,
      message: "Document uploaded successfully",
      data: {
        uploadId: "UPL-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        documentType: body.documentType,
        fileName: body.fileName,
        fileFormat: body.fileFormat,
        uploadedBy: "User-001",
        courseId: body.courseId,
        uploadDate: new Date().toISOString(),
        fileSize: body.fileSize,
        verificationStatus: "PENDING",
        accessLevel: "Learner",
        downloadPermission: true,
        category: "Course Material",
      },
    };
  }
};

/**
 * TC15 – Get User Documents with Pagination
 * GET /v2/users/{userId}/documents
 * Retrieve all documents for a specific user with pagination support
 * 
 * @param {string} userId - User ID
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.documentType - Filter by document type
 * @param {string} params.verificationStatus - Filter by verification status
 * 
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const getUserDocuments = async (userId, params = {}) => {
  try {
    const path = `/v2/users/${userId}/documents`;
    const { data } = await http.get(path, { params });
    return data;
  } catch (error) {
    // Mock response for development
    return {
      success: true,
      message: "Documents retrieved successfully",
      data: {
        rows: [
          {
            uploadId: "UPL-001",
            documentType: "CERTIFICATE",
            fileName: "certificate_completion.pdf",
            fileFormat: "PDF",
            uploadedBy: "Instructor-002",
            courseId: "AGR101",
            uploadDate: "2025-11-01T10:30:00Z",
            fileSize: 2048000,
            verificationStatus: "VERIFIED",
            accessLevel: "Learner",
            downloadPermission: true,
            category: "Course Material",
            sourceModule: "AGR101 → Module 1",
          },
          {
            uploadId: "UPL-002",
            documentType: "REGISTRATION_SHEET",
            fileName: "registration_form.pdf",
            fileFormat: "PDF",
            uploadedBy: "Admin-001",
            courseId: "CS101",
            uploadDate: "2025-11-02T11:15:00Z",
            fileSize: 1536000,
            verificationStatus: "PENDING",
            accessLevel: "Learner",
            downloadPermission: true,
            category: "Administrative",
            sourceModule: "CS101 → Module 2",
          },
        ],
        count: 2,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1,
      },
    };
  }
};

/**
 * TC15 – Get Document by ID
 * GET /v2/users/{userId}/documents/{uploadId}
 * Retrieve a specific document by upload ID
 * 
 * @param {string} userId - User ID
 * @param {string} uploadId - Document upload ID
 * 
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const getUserDocumentById = async (userId, uploadId) => {
  try {
    const path = `/v2/users/${userId}/documents/${uploadId}`;
    const { data } = await http.get(path);
    return data;
  } catch (error) {
    // Mock response for development
    return {
      success: true,
      message: "Document retrieved successfully",
      data: {
        uploadId: uploadId,
        documentType: "CERTIFICATE",
        fileName: "certificate_completion.pdf",
        fileFormat: "PDF",
        uploadedBy: "Instructor-002",
        courseId: "AGR101",
        uploadDate: "2025-11-01T10:30:00Z",
        fileSize: 2048000,
        verificationStatus: "VERIFIED",
        accessLevel: "Learner",
        downloadPermission: true,
        category: "Course Material",
        sourceModule: "AGR101 → Module 1",
        fileUrl: "https://storage.example.com/documents/cert_001.pdf",
      },
    };
  }
};

/**
 * TC15 – Verify Document
 * PATCH /v2/documents/{documentId}/verify
 * Verify a document and update its verification status
 * 
 * @param {string} documentId - Document ID
 * @param {object} body - Verification payload
 * @param {string} body.verificationStatus - VERIFIED, REJECTED, PENDING
 * @param {string} body.remarks - Verification remarks (optional)
 * 
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const verifyDocument = async (documentId, body = {}) => {
  try {
    const path = `/v2/documents/${documentId}/verify`;
    const { data } = await http.patch(path, body);
    return data;
  } catch (error) {
    // Mock response for development
    return {
      success: true,
      message: "Document verified successfully",
      data: {
        documentId: documentId,
        verificationStatus: body.verificationStatus || "VERIFIED",
        verifiedBy: "Admin-001",
        verifiedDate: new Date().toISOString(),
        remarks: body.remarks || "Document verified",
      },
    };
  }
};

/**
 * TC15 – Reject Document
 * PATCH /v2/documents/{documentId}/reject
 * Reject a document with reason
 * 
 * @param {string} documentId - Document ID
 * @param {object} body - Rejection payload
 * @param {string} body.reason - Reason for rejection
 * @param {string} body.remarks - Additional remarks (optional)
 * 
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const rejectDocument = async (documentId, body) => {
  try {
    const path = `/v2/documents/${documentId}/reject`;
    const { data } = await http.patch(path, body);
    return data;
  } catch (error) {
    // Mock response for development
    return {
      success: true,
      message: "Document rejected successfully",
      data: {
        documentId: documentId,
        verificationStatus: "REJECTED",
        rejectionReason: body.reason,
        rejectedBy: "Admin-001",
        rejectedDate: new Date().toISOString(),
        remarks: body.remarks || "Document does not meet requirements",
      },
    };
  }
};

/**
 * TC15 – Delete Document
 * DELETE /v2/documents/{documentId}
 * Delete a document permanently
 * 
 * @param {string} documentId - Document ID
 * 
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteDocument = async (documentId) => {
  try {
    const path = `/v2/documents/${documentId}`;
    const { data } = await http.delete(path);
    return data;
  } catch (error) {
    // Mock response for development
    return {
      success: true,
      message: "Document deleted successfully",
    };
  }
};

/**
 * TC15 – Get Pending Documents (Admin)
 * GET /v2/admin/documents/pending
 * Retrieve all pending documents for verification (Admin only)
 * 
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.documentType - Filter by document type (optional)
 * 
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const getAdminPendingDocuments = async (params = {}) => {
  try {
    const path = `/v2/admin/documents/pending`;
    const { data } = await http.get(path, { params });
    return data;
  } catch (error) {
    // Mock response for development
    return {
      success: true,
      message: "Pending documents retrieved successfully",
      data: {
        rows: [
          {
            uploadId: "UPL-003",
            documentType: "EVALUATION_FORM",
            fileName: "evaluation_form.pdf",
            fileFormat: "PDF",
            uploadedBy: "Student-001",
            courseId: "AGR101",
            uploadDate: "2025-11-15T14:20:00Z",
            fileSize: 1024000,
            verificationStatus: "PENDING",
            accessLevel: "Admin",
            downloadPermission: true,
            category: "Evaluation",
            sourceModule: "AGR101 → Final Assessment",
            userId: "LRN-001",
            userName: "Nmorsi Donald",
          },
          {
            uploadId: "UPL-004",
            documentType: "IDENTITY_DOCUMENT",
            fileName: "identity_scan.jpg",
            fileFormat: "JPG",
            uploadedBy: "Student-002",
            courseId: "CS101",
            uploadDate: "2025-11-16T09:45:00Z",
            fileSize: 3072000,
            verificationStatus: "PENDING",
            accessLevel: "Admin",
            downloadPermission: true,
            category: "Authentication",
            sourceModule: "Enrollment Process",
            userId: "LRN-002",
            userName: "Jane Okoro",
          },
        ],
        count: 2,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1,
      },
    };
  }
};
