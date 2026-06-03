import { http } from "../http";

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

/**
 * TC02 - Export report
 * POST /v2/report-transfer/{id}/export
 */
export const adminExportReportTransfer = async (id, body = {}) => {
  const { data } = await http.post(`/v2/report-transfer/${id}/export`, body);
  return {
    message: data?.message ?? "Export initiated successfully",
    transfer: data?.data ?? data,
  };
};

/**
 * TC02 - Import report
 * POST /v2/report-transfer/import
 */
export const adminImportReportTransfer = async (body = {}) => {
  const { data } = await http.post("/v2/report-transfer/import", body);
  return {
    message: data?.message ?? "Import initiated successfully",
    transfer: data?.data ?? data,
  };
};

/**
 * TC02 - Get transfer status
 * GET /v2/report-transfer/{id}
 */
export const adminGetReportTransferById = async (id) => {
  const { data } = await http.get(`/v2/report-transfer/${id}`);
  return { transfer: data?.data ?? data };
};

/**
 * TC02 - Get all transfers
 * GET /v2/report-transfer
 */
export const adminGetReportTransfers = async (params = {}) => {
  const { data } = await http.get("/v2/report-transfer", { params });
  const result = data?.data ?? data;
  return {
    transfers: result?.rows ?? result?.transfers ?? result ?? [],
    pagination: result?.pagination ?? {},
  };
};

/**
 * TC02 - Get user transfers
 * GET /v2/report-transfer/user/{userId}
 */
export const adminGetUserReportTransfers = async (userId, params = {}) => {
  const { data } = await http.get(`/v2/report-transfer/user/${userId}`, { params });
  const result = data?.data ?? data;
  return {
    transfers: result?.rows ?? result?.transfers ?? result ?? [],
    pagination: result?.pagination ?? {},
  };
};

/**
 * TC02 - Get report transfer history
 * GET /v2/report-transfer/{id}/transfers
 */
export const adminGetTransfersByReportId = async (id, params = {}) => {
  const { data } = await http.get(`/v2/report-transfer/${id}/transfers`, { params });
  const result = data?.data ?? data;
  return {
    transfers: result?.rows ?? result?.transfers ?? result ?? [],
    pagination: result?.pagination ?? {},
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
  const { transfers, pagination } = await adminGetReportTransfers(params);
  return {
    exports: transfers.map(toLegacyExportShape),
    pagination,
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminGetMyExports = async (params = {}) => {
  const { transfers, pagination } = await adminGetReportTransfers(params);
  return {
    exports: transfers.map(toLegacyExportShape),
    pagination,
  };
};

/**
 * Backward-compatible adapter used by current report export page.
 */
export const adminDeleteExport = async (exportId) => {
  const { data } = await http.delete(`/v2/report-transfer/${exportId}`);
  return {
    message: data?.message ?? "Export deleted successfully",
    data: data?.data ?? { exportId },
  };
};
