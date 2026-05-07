<<<<<<< Updated upstream
// import { http } from "../http";

let MOCK_REPORT_TRANSFERS = [
  {
    reportId: "REX-001",
    reportName: "Monthly Enrollment Report",
    operationType: "Export",
    fileFormat: "EXCEL",
    performedBy: "Admin-002",
    userId: "Admin-002",
    operationDate: "2025-11-01T10:00:00Z",
    status: "SUCCESS",
    sourceOrDestination: "dashboard",
    filters: {
      dateFrom: "2025-10-01",
      dateTo: "2025-10-31",
      departmentId: "DEPT-001",
    },
    downloadUrl: "https://storage.example.com/exports/monthly_enrollment.xlsx",
    recordCount: 150,
    fileSize: 1458176,
    expiresAt: "2025-11-08T10:00:00Z",
  },
  {
    reportId: "REX-002",
    reportName: "Q4 Performance Data",
    operationType: "Import",
    fileFormat: "CSV",
    performedBy: "Instructor-004",
    userId: "Instructor-004",
    operationDate: "2025-11-02T14:00:00Z",
    status: "FAILED",
    sourceOrDestination: "https://storage.example.com/imports/q4_data.csv",
    errorMessage: "Invalid file format or corrupted data",
    recordCount: null,
    fileSize: null,
    expiresAt: null,
    downloadUrl: null,
  },
  {
    reportId: "REX-003",
    reportName: "Learner Result Analytics",
    operationType: "Export",
    fileFormat: "PDF",
    performedBy: "Admin-001",
    userId: "Admin-001",
    operationDate: "2025-11-03T09:15:00Z",
    status: "PROCESSING",
    sourceOrDestination: "results",
    filters: {
      dateFrom: "2025-11-01",
      dateTo: "2025-11-03",
    },
    recordCount: null,
    fileSize: null,
    expiresAt: null,
    downloadUrl: null,
  },
];

const DEFAULT_USER_ID = "Admin-002";

const toLegacyExportShape = (transfer) => ({
  exportId: transfer.reportId,
  reportId: transfer.reportId,
  reportName: transfer.reportName,
  exportFormat: transfer.fileFormat,
  status: transfer.status,
  operationType: transfer.operationType,
  sourceOrDestination: transfer.sourceOrDestination,
  recordCount: transfer.recordCount,
  fileSize: transfer.fileSize,
  requestedAt: transfer.operationDate,
  completedAt: transfer.status === "SUCCESS" ? transfer.operationDate : null,
  downloadUrl: transfer.downloadUrl,
  errorMessage: transfer.errorMessage,
  performedBy: transfer.performedBy,
});

const paginate = (rows, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    rows: rows.slice(start, end),
    pagination: {
      page,
      limit,
      totalItems: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / limit)),
=======
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
>>>>>>> Stashed changes
    },
  };
};

<<<<<<< Updated upstream
const findTransfer = (id) =>
  MOCK_REPORT_TRANSFERS.find((transfer) => transfer.reportId === id);

const getExtensionFromFormat = (fileFormat) => {
  switch (fileFormat) {
    case "PDF":
      return "pdf";
    case "CSV":
      return "csv";
    case "JSON":
      return "json";
    default:
      return "xlsx";
  }
};

/**
 * TC02 - Export report
 * POST /api/v2/report-transfer/{id}/export
 */
export const adminExportReportTransfer = async (id, body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/api/v2/report-transfer/${id}/export`, body);

  const now = new Date().toISOString();
  const reportId = id || `REX-${Date.now()}`;
  const fileFormat = body.fileFormat || body.exportFormat || "EXCEL";
  const reportName = body.reportName || "Dashboard Report";
  const sourceOrDestination = body.sourceOrDestination || "dashboard";

  const transfer = {
    reportId,
    reportName,
    operationType: "Export",
    fileFormat,
    performedBy: body.performedBy || DEFAULT_USER_ID,
    userId: body.userId || body.performedBy || DEFAULT_USER_ID,
    operationDate: now,
    status: "SUCCESS",
    sourceOrDestination,
    filters: body.filters || {},
    recordCount: Number(body.recordCount || 150),
    fileSize: Number(body.fileSize || 1048576),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    downloadUrl: `https://storage.example.com/exports/${reportId}.${getExtensionFromFormat(
      fileFormat,
    )}`,
  };

  MOCK_REPORT_TRANSFERS = [transfer, ...MOCK_REPORT_TRANSFERS];

  return {
    message: "Export initiated successfully",
    transfer,
  };
};

/**
 * TC02 - Import report
 * POST /api/v2/report-transfer/import
 */
export const adminImportReportTransfer = async (body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/api/v2/report-transfer/import', body);

  const now = new Date().toISOString();
  const reportId = `REX-${Date.now()}`;
  const transfer = {
    reportId,
    reportName: body.reportName || "Imported Report",
    operationType: "Import",
    fileFormat: body.fileFormat || "CSV",
    performedBy: body.performedBy || DEFAULT_USER_ID,
    userId: body.userId || body.performedBy || DEFAULT_USER_ID,
    operationDate: now,
    status: "SUCCESS",
    sourceOrDestination: body.sourceOrDestination || "https://storage.example.com/imports/report.csv",
    recordCount: Number(body.recordCount || 100),
    fileSize: Number(body.fileSize || 524288),
    expiresAt: null,
    downloadUrl: null,
    errorMessage: null,
  };

  MOCK_REPORT_TRANSFERS = [transfer, ...MOCK_REPORT_TRANSFERS];

  return {
    message: "Import initiated successfully",
    transfer,
  };
};

/**
 * TC02 - Get transfer status
 * GET /api/v2/report-transfer/{id}
 */
export const adminGetReportTransferById = async (id) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/report-transfer/${id}`);

  const transfer = findTransfer(id);
  if (!transfer) {
    throw new Error("Report transfer not found");
  }

  return { transfer };
};

/**
 * TC02 - Get all transfers
 * GET /api/v2/report-transfer
 */
export const adminGetReportTransfers = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/api/v2/report-transfer', { params });

  let filtered = [...MOCK_REPORT_TRANSFERS];

  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }
  if (params.operationType) {
    filtered = filtered.filter((item) => item.operationType === params.operationType);
  }

  const { rows, pagination } = paginate(filtered, params);

  return {
    transfers: rows,
    pagination,
  };
};

/**
 * TC02 - Get user transfers
 * GET /api/v2/report-transfer/user/{userId}
 */
export const adminGetUserReportTransfers = async (userId, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/report-transfer/user/${userId}`, { params });

  const rows = MOCK_REPORT_TRANSFERS.filter(
    (item) => String(item.userId || item.performedBy).toLowerCase() === String(userId).toLowerCase(),
  );

  const { rows: pagedRows, pagination } = paginate(rows, params);

  return {
    transfers: pagedRows,
    pagination,
  };
};

/**
 * TC02 - Get report transfer history
 * GET /api/v2/report-transfer/{id}/transfers
 */
export const adminGetTransfersByReportId = async (id, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/report-transfer/${id}/transfers`, { params });

  const rows = MOCK_REPORT_TRANSFERS.filter((item) => item.reportId === id);
  const { rows: pagedRows, pagination } = paginate(rows, params);

  return {
    transfers: pagedRows,
    pagination,
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminCreateReportExport = async (reportId, body = {}) => {
  const { message, transfer } = await adminExportReportTransfer(reportId, {
    reportName: body.reportName,
    fileFormat: body.exportFormat,
    sourceOrDestination: body.sourceOrDestination || "dashboard",
    filters: body.filters,
  });

  return {
    message,
    export: toLegacyExportShape(transfer),
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminGetExportStatus = async (exportId) => {
  const { transfer } = await adminGetReportTransferById(exportId);
  return {
    export: toLegacyExportShape(transfer),
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminDownloadExport = async (exportId) => {
  const transfer = findTransfer(exportId);
  if (!transfer || !transfer.downloadUrl) {
    throw new Error("Export file not found");
  }

  return {
    downloadUrl: transfer.downloadUrl,
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminGetAllExports = async (params = {}) => {
  const { transfers, pagination } = await adminGetReportTransfers({
    ...params,
  });

  return {
    exports: transfers.map(toLegacyExportShape),
    pagination,
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminGetMyExports = async (params = {}) => {
  const { transfers, pagination } = await adminGetUserReportTransfers(
    DEFAULT_USER_ID,
    params,
  );

  return {
    exports: transfers.map(toLegacyExportShape),
    pagination,
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminDeleteExport = async (exportId) => {
  const beforeCount = MOCK_REPORT_TRANSFERS.length;
  MOCK_REPORT_TRANSFERS = MOCK_REPORT_TRANSFERS.filter(
    (item) => item.reportId !== exportId,
  );

  if (MOCK_REPORT_TRANSFERS.length === beforeCount) {
    throw new Error("Export not found");
  }
=======
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
>>>>>>> Stashed changes

  return {
    message: "Export deleted successfully",
    data: {
      exportId,
      deletedAt: new Date().toISOString(),
    },
  };
};
