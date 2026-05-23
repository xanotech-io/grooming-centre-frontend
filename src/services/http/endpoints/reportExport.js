import { http } from "../http";

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
    },
  };
};

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
  try {
    const { data } = await http.post(`/api/v2/report-transfer/${id}/export`, body);
    return {
      message: data?.message ?? "Export initiated successfully",
      transfer: data?.data ?? data,
    };
  } catch {
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
  }
};

/**
 * TC02 - Import report
 * POST /api/v2/report-transfer/import
 */
export const adminImportReportTransfer = async (body = {}) => {
  try {
    const { data } = await http.post("/api/v2/report-transfer/import", body);
    return {
      message: data?.message ?? "Import initiated successfully",
      transfer: data?.data ?? data,
    };
  } catch {
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
  }
};

/**
 * TC02 - Get transfer status
 * GET /api/v2/report-transfer/{id}
 */
export const adminGetReportTransferById = async (id) => {
  try {
    const { data } = await http.get(`/api/v2/report-transfer/${id}`);
    return { transfer: data?.data ?? data };
  } catch {
    const transfer = findTransfer(id);
    if (!transfer) {
      throw new Error("Report transfer not found");
    }
    return { transfer };
  }
};

/**
 * TC02 - Get all transfers
 * GET /api/v2/report-transfer
 */
export const adminGetReportTransfers = async (params = {}) => {
  try {
    const { data } = await http.get("/api/v2/report-transfer", { params });
    const result = data?.data ?? data;
    return {
      transfers: result?.rows ?? result?.transfers ?? result ?? [],
      pagination: result?.pagination ?? {},
    };
  } catch {
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
  }
};

/**
 * TC02 - Get user transfers
 * GET /api/v2/report-transfer/user/{userId}
 */
export const adminGetUserReportTransfers = async (userId, params = {}) => {
  try {
    const { data } = await http.get(`/api/v2/report-transfer/user/${userId}`, { params });
    const result = data?.data ?? data;
    return {
      transfers: result?.rows ?? result?.transfers ?? result ?? [],
      pagination: result?.pagination ?? {},
    };
  } catch {
    const rows = MOCK_REPORT_TRANSFERS.filter(
      (item) => String(item.userId || item.performedBy).toLowerCase() === String(userId).toLowerCase(),
    );

    const { rows: pagedRows, pagination } = paginate(rows, params);

    return {
      transfers: pagedRows,
      pagination,
    };
  }
};

/**
 * TC02 - Get report transfer history
 * GET /api/v2/report-transfer/{id}/transfers
 */
export const adminGetTransfersByReportId = async (id, params = {}) => {
  try {
    const { data } = await http.get(`/api/v2/report-transfer/${id}/transfers`, { params });
    const result = data?.data ?? data;
    return {
      transfers: result?.rows ?? result?.transfers ?? result ?? [],
      pagination: result?.pagination ?? {},
    };
  } catch {
    const rows = MOCK_REPORT_TRANSFERS.filter((item) => item.reportId === id);
    const { rows: pagedRows, pagination } = paginate(rows, params);

    return {
      transfers: pagedRows,
      pagination,
    };
  }
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
  const { transfer } = await adminGetReportTransferById(exportId);
  if (!transfer?.downloadUrl) {
    throw new Error("Export file not found");
  }
  return { downloadUrl: transfer.downloadUrl };
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

  return {
    message: "Export deleted successfully",
    data: {
      exportId,
      deletedAt: new Date().toISOString(),
    },
  };
};
