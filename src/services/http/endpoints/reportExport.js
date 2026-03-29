// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_ALL_EXPORTS = [
  {
    exportId: "export-001",
    reportId: "report-001",
    reportName: "Enrollment Report - October",
    exportFormat: "PDF",
    status: "SUCCESS",
    recordCount: 850,
    fileSize: 1548000,
    requestedAt: "2025-10-28T14:00:00Z",
    completedAt: "2025-10-28T14:01:15Z",
  },
  {
    exportId: "export-002",
    reportId: "report-002",
    reportName: "Grade Summary - Fall 2025",
    exportFormat: "CSV",
    status: "PROCESSING",
    recordCount: null,
    fileSize: null,
    requestedAt: "2025-11-01T10:00:00Z",
    completedAt: null,
  },
  {
    exportId: "export-003",
    reportId: "report-003",
    reportName: "Student Performance Report - Q4 2025",
    exportFormat: "EXCEL",
    status: "SUCCESS",
    recordCount: 1500,
    fileSize: 2457600,
    requestedAt: "2025-10-30T09:00:00Z",
    completedAt: "2025-10-30T09:01:30Z",
  },
  {
    exportId: "export-004",
    reportId: "report-004",
    reportName: "Department Audit Report",
    exportFormat: "PDF",
    status: "FAILED",
    recordCount: null,
    fileSize: null,
    requestedAt: "2025-10-29T11:00:00Z",
    completedAt: null,
  },
  {
    exportId: "export-005",
    reportId: "report-005",
    reportName: "Course Completion Summary",
    exportFormat: "EXCEL",
    status: "PROCESSING",
    recordCount: null,
    fileSize: null,
    requestedAt: "2025-11-01T11:30:00Z",
    completedAt: null,
  },
];

const MOCK_MY_EXPORTS = [
  {
    exportId: "export-001",
    reportName: "My Course Progress",
    exportFormat: "PDF",
    status: "SUCCESS",
    recordCount: 1,
    fileSize: 512000,
    requestedAt: "2025-10-15T09:00:00Z",
    completedAt: "2025-10-15T09:00:30Z",
    downloadUrl: "https://storage.example.com/exports/export-001.pdf",
  },
  {
    exportId: "export-006",
    reportName: "My Assessment Results",
    exportFormat: "CSV",
    status: "SUCCESS",
    recordCount: 12,
    fileSize: 48000,
    requestedAt: "2025-10-20T14:00:00Z",
    completedAt: "2025-10-20T14:00:45Z",
    downloadUrl: "https://storage.example.com/exports/export-006.csv",
  },
];

// ---------------------------------------------------------------------------
// 8.1 Create Report Export
// POST /api/v2/reports/{reportId}/export
// ---------------------------------------------------------------------------

/**
 * Initiate a new report export
 * @param {string} reportId
 * @param {{ reportName: string, exportFormat: 'PDF'|'EXCEL'|'CSV', filters?: object }} body
 * @returns {Promise<{ message: string, export: object }>}
 */
export const adminCreateReportExport = async (reportId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/reports/${reportId}/export`, body);
  // return { message, export: data };

  return {
    message: "Export initiated successfully",
    export: {
      exportId: `export-${Date.now()}`,
      reportId,
      reportName: body.reportName,
      exportFormat: body.exportFormat,
      status: "PROCESSING",
      requestedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 8.2 Get Export Status
// GET /api/v2/exports/{id}/status
// ---------------------------------------------------------------------------

/**
 * Get the current status of an export
 * @param {string} exportId
 * @returns {Promise<{ export: object }>}
 */
export const adminGetExportStatus = async (exportId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/exports/${exportId}/status`);
  // return { export: data };

  const found = MOCK_ALL_EXPORTS.find((e) => e.exportId === exportId);
  return {
    export: found || {
      exportId,
      status: "SUCCESS",
      progressPercentage: 100,
      recordCount: 500,
      fileSize: 1024000,
      requestedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 8.3 Download Export File
// GET /api/v2/exports/{id}/download
// ---------------------------------------------------------------------------

/**
 * Download an export file
 * @param {string} exportId
 * @returns {Promise<{ downloadUrl: string }>}
 */
export const adminDownloadExport = async (exportId) => {
  // TODO: replace mock with real call
  // Trigger file download via window.location or return blob URL
  // const response = await http.get(`/v2/exports/${exportId}/download`, { responseType: 'blob' });
  // const url = URL.createObjectURL(response.data);
  // return { downloadUrl: url };

  return {
    downloadUrl: `https://storage.example.com/exports/${exportId}.pdf`,
  };
};

// ---------------------------------------------------------------------------
// 8.4 Get All Exports (Admin)
// GET /api/v2/exports
// ---------------------------------------------------------------------------

/**
 * Get all exports (admin view)
 * @param {{ page?: number, limit?: number, status?: 'PROCESSING'|'SUCCESS'|'FAILED' }} params
 * @returns {Promise<{ exports: Array, pagination: object }>}
 */
export const adminGetAllExports = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/exports', { params });
  // return { exports: data.exports, pagination: data.pagination };

  let filtered = [...MOCK_ALL_EXPORTS];
  if (params.status) {
    filtered = filtered.filter((e) => e.status === params.status);
  }

  return {
    exports: filtered,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / (params.limit || 10)),
    },
  };
};

// ---------------------------------------------------------------------------
// 8.5 Get User's Exports
// GET /api/v2/my-exports
// ---------------------------------------------------------------------------

/**
 * Get the current user's exports
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<{ exports: Array, pagination: object }>}
 */
export const adminGetMyExports = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/my-exports', { params });
  // return { exports: data.exports, pagination: data.pagination };

  return {
    exports: MOCK_MY_EXPORTS,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: MOCK_MY_EXPORTS.length,
      totalPages: Math.ceil(MOCK_MY_EXPORTS.length / (params.limit || 10)),
    },
  };
};

// ---------------------------------------------------------------------------
// 8.6 Delete Export
// DELETE /api/v2/exports/{id}
// ---------------------------------------------------------------------------

/**
 * Delete an export
 * @param {string} exportId
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteExport = async (exportId) => {
  // TODO: replace mock with real call
  // const { data: { message } } = await http.delete(`/v2/exports/${exportId}`);
  // return { message };

  return {
    message: "Export deleted successfully",
    data: {
      exportId,
      deletedAt: new Date().toISOString(),
    },
  };
};
