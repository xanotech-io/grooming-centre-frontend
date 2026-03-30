// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_IMPORT_JOBS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    type: "users",
    status: "completed",
    fileName: "students_import.csv",
    totalRecords: 150,
    processedRecords: 148,
    failedRecords: 2,
    errors: [
      { row: 42, field: "email", message: "Duplicate email address" },
      { row: 87, field: "departmentId", message: "Department not found" },
    ],
    createdAt: "2025-10-15T09:00:00Z",
    completedAt: "2025-10-15T09:03:22Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    type: "grades",
    status: "processing",
    fileName: "grades_q4_2025.csv",
    totalRecords: 320,
    processedRecords: 180,
    failedRecords: 0,
    errors: [],
    createdAt: "2025-11-01T10:30:00Z",
    completedAt: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    type: "enrollments",
    status: "failed",
    fileName: "batch_enrollments.csv",
    totalRecords: 75,
    processedRecords: 0,
    failedRecords: 75,
    errors: [
      {
        row: 1,
        field: "courseId",
        message: "Invalid CSV format on header row",
      },
    ],
    createdAt: "2025-10-28T14:00:00Z",
    completedAt: "2025-10-28T14:00:45Z",
  },
];

const MOCK_EXPORT_JOBS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    type: "users",
    operationType: "export",
    status: "completed",
    format: "xlsx",
    downloadUrl:
      "https://storage.groomingcentre.com/exports/users_20251101.xlsx",
    expiresAt: "2025-11-08T14:30:00Z",
    createdAt: "2025-11-01T14:30:00Z",
    completedAt: "2025-11-01T14:35:22Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    type: "grades",
    operationType: "export",
    status: "pending",
    format: "csv",
    downloadUrl: null,
    expiresAt: null,
    createdAt: "2025-11-01T15:00:00Z",
    completedAt: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    type: "courses",
    operationType: "export",
    status: "failed",
    format: "pdf",
    downloadUrl: null,
    expiresAt: null,
    createdAt: "2025-10-30T08:00:00Z",
    completedAt: null,
  },
];

const MOCK_MY_OPERATIONS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    operationType: "export",
    type: "users",
    status: "completed",
    format: "xlsx",
    fileName: null,
    downloadUrl:
      "https://storage.groomingcentre.com/exports/users_20251101.xlsx",
    createdAt: "2025-11-01T14:30:00Z",
    completedAt: "2025-11-01T14:35:22Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    operationType: "import",
    type: "users",
    status: "completed",
    format: null,
    fileName: "students_import.csv",
    downloadUrl: null,
    createdAt: "2025-10-15T09:00:00Z",
    completedAt: "2025-10-15T09:03:22Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    operationType: "export",
    type: "grades",
    status: "pending",
    format: "csv",
    fileName: null,
    downloadUrl: null,
    createdAt: "2025-11-01T15:00:00Z",
    completedAt: null,
  },
];

// ---------------------------------------------------------------------------
// TC02 - Data Import via User Interface
// POST /v2/data-operations/import
// ---------------------------------------------------------------------------

/**
 * Initiate a bulk data import job
 * @param {{ type: 'users'|'courses'|'enrollments'|'grades', file: File, options?: { skipDuplicates?: boolean, updateExisting?: boolean } }} body
 * @returns {Promise<{ message: string, job: object }>}
 */
export const adminImportData = async (body) => {
  // TODO: replace mock with real call
  // const formData = new FormData();
  // formData.append('type', body.type);
  // formData.append('file', body.file);
  // if (body.options) formData.append('options', JSON.stringify(body.options));
  // const { data: { message, data } } = await http.post('/v2/data-operations/import', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // });
  // return { message, job: data };

  return {
    message: "Import job started",
    job: {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      type: body.type,
      status: "pending",
      fileName: body.file?.name || "import_file.csv",
      totalRecords: 150,
      processedRecords: 0,
      failedRecords: 0,
      errors: [],
      createdAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// TC01 - Data Extraction via User Interface (Export)
// POST /v2/data-operations/export
// ---------------------------------------------------------------------------

/**
 * Initiate a data export job
 * @param {{ type: 'users'|'courses'|'enrollments'|'grades'|'reports', format: 'csv'|'xlsx'|'pdf'|'json', filters?: object, columns?: string[] }} body
 * @returns {Promise<{ message: string, job: object }>}
 */
export const adminExportData = async (body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/data-operations/export', body);
  // return { message, job: data };

  return {
    message: "Export job started",
    job: {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      type: body.type,
      status: "pending",
      format: body.format,
      downloadUrl: null,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// Get Operation Status
// GET /v2/data-operations/{operationId}
// ---------------------------------------------------------------------------

/**
 * Get the status and details of a data operation (import or export)
 * @param {string} operationId
 * @returns {Promise<{ operation: object }>}
 */
export const adminGetOperationStatus = async (operationId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/data-operations/${operationId}`);
  // return { operation: data };

  const exportJob = MOCK_EXPORT_JOBS.find((j) => j.id === operationId);
  if (exportJob) return { operation: exportJob };

  const importJob = MOCK_IMPORT_JOBS.find((j) => j.id === operationId);
  if (importJob)
    return { operation: { ...importJob, operationType: "import" } };

  return {
    operation: {
      id: operationId,
      operationType: "export",
      type: "users",
      status: "completed",
      format: "xlsx",
      downloadUrl:
        "https://storage.groomingcentre.com/exports/users_20251101.xlsx",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// Download Export File
// GET /v2/data-operations/{operationId}/download
// ---------------------------------------------------------------------------

/**
 * Get the download URL for a completed export operation
 * @param {string} operationId
 * @returns {Promise<{ downloadUrl: string }>}
 */
export const adminDownloadOperationFile = async (operationId) => {
  // TODO: replace mock with real call (returns binary stream)
  // const response = await http.get(`/v2/data-operations/${operationId}/download`, { responseType: 'blob' });
  // const url = URL.createObjectURL(response.data);
  // return { downloadUrl: url };

  const job = MOCK_EXPORT_JOBS.find((j) => j.id === operationId);
  return {
    downloadUrl:
      job?.downloadUrl ||
      `https://storage.groomingcentre.com/exports/${operationId}.xlsx`,
  };
};

// ---------------------------------------------------------------------------
// Cancel Operation
// POST /v2/data-operations/{operationId}/cancel
// ---------------------------------------------------------------------------

/**
 * Cancel a pending or in-progress data operation
 * @param {string} operationId
 * @returns {Promise<{ message: string, data: object }>}
 */
export const adminCancelOperation = async (operationId) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/data-operations/${operationId}/cancel`);
  // return { message, data };

  return {
    message: "Operation cancelled successfully",
    data: {
      id: operationId,
      previousStatus: "pending",
      cancelledAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// List My Operations
// GET /v2/data-operations/my-operations
// ---------------------------------------------------------------------------

/**
 * Get the current user's data operations (imports and exports)
 * @param {{ status?: 'pending'|'processing'|'completed'|'failed', page?: number, limit?: number }} params
 * @returns {Promise<{ operations: Array, pagination: object }>}
 */
export const adminGetMyOperations = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/data-operations/my-operations', { params });
  // return { operations: data.operations, pagination: data.pagination };

  let filtered = [...MOCK_MY_OPERATIONS];
  if (params.status) {
    filtered = filtered.filter((op) => op.status === params.status);
  }

  return {
    operations: filtered,
    pagination: {
      currentPage: params.page || 1,
      totalPages: Math.ceil(filtered.length / (params.limit || 10)),
      totalItems: filtered.length,
      itemsPerPage: params.limit || 10,
    },
  };
};
