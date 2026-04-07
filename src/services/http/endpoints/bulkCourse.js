// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_TEMPLATES = [
  {
    templateId: "tpl-001",
    templateName: "Standard Course Template",
    description: "Default template with standard structure",
    category: "GENERAL",
    isActive: true,
  },
  {
    templateId: "tpl-002",
    templateName: "Science Lab Course",
    description: "Template for laboratory-based science courses",
    category: "SCIENCE",
    isActive: true,
  },
];

const MOCK_BATCHES = [
  {
    batchId: "batch-001",
    departmentId: "dept-science",
    totalCourses: 5,
    completedCourses: 5,
    failedCourses: 0,
    status: "COMPLETED",
    createdAt: "2025-10-28T14:00:00Z",
    completedAt: "2025-10-28T14:12:00Z",
  },
  {
    batchId: "batch-002",
    departmentId: "dept-arts",
    totalCourses: 3,
    completedCourses: 1,
    failedCourses: 0,
    status: "PROCESSING",
    createdAt: "2025-11-01T10:00:00Z",
    completedAt: null,
  },
  {
    batchId: "batch-003",
    departmentId: "dept-science",
    totalCourses: 4,
    completedCourses: 2,
    failedCourses: 2,
    status: "ERROR",
    createdAt: "2025-10-25T09:00:00Z",
    completedAt: null,
  },
  {
    batchId: "batch-004",
    departmentId: "dept-eng",
    totalCourses: 6,
    completedCourses: 0,
    failedCourses: 0,
    status: "PENDING",
    createdAt: "2025-11-01T12:00:00Z",
    completedAt: null,
  },
];

const MOCK_BATCH_DETAIL = {
  batchId: "batch-002",
  departmentId: "dept-arts",
  departmentName: "Faculty of Arts",
  templateId: "tpl-001",
  templateName: "Standard Course Template",
  totalCourses: 3,
  courses: [
    {
      courseId: "course-001",
      title: "Introduction to Data Analytics",
      status: "CREATED",
      createdAt: "2025-11-01T10:05:00Z",
    },
    {
      courseId: "course-002",
      title: "Advanced Machine Learning",
      status: "CREATED",
      createdAt: "2025-11-01T10:08:00Z",
    },
    {
      courseId: null,
      title: "Business Statistics",
      status: "PENDING",
      createdAt: null,
    },
  ],
  status: "PROCESSING",
  createdAt: "2025-11-01T10:00:00Z",
  completedAt: null,
};

// ---------------------------------------------------------------------------
// 6.1 Create Bulk Course Creation Batch
// POST /api/v2/courses/bulk
// ---------------------------------------------------------------------------

/**
 * Create a new bulk course creation batch
 * @param {{ departmentId: string, templateId: string, courses: Array<{ title: string, description: string, credits: number }> }} body
 * @returns {Promise<{ message: string, batch: object }>}
 */
export const adminCreateBulkCourseBatch = async (body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/courses/bulk', body);
  // return { message, batch: data };

  return {
    message: "Batch created successfully",
    batch: {
      batchId: `batch-${Date.now()}`,
      departmentId: body.departmentId,
      totalCourses: body.courses.length,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 6.2 Get All Bulk Course Creation Batches
// GET /api/v2/courses/bulk
// ---------------------------------------------------------------------------

/**
 * Get all bulk course creation batches
 * @param {{ page?: number, limit?: number, status?: string, departmentId?: string }} params
 * @returns {Promise<{ batches: Array, pagination: object }>}
 */
export const adminGetBulkCourseBatches = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/courses/bulk', { params });
  // return { batches: data.batches, pagination: data.pagination };

  const filtered = params.status
    ? MOCK_BATCHES.filter((b) => b.status === params.status)
    : MOCK_BATCHES;

  return {
    batches: filtered,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / (params.limit || 10)),
    },
  };
};

// ---------------------------------------------------------------------------
// 6.3 Get Batch Details
// GET /api/v2/courses/bulk/{batchId}
// ---------------------------------------------------------------------------

/**
 * Get full details for a single batch
 * @param {string} batchId
 * @returns {Promise<{ batch: object }>}
 */
export const adminGetBatchDetails = async (batchId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/courses/bulk/${batchId}`);
  // return { batch: data };

  return { batch: { ...MOCK_BATCH_DETAIL, batchId } };
};

// ---------------------------------------------------------------------------
// 6.4 Get Batch Progress
// GET /api/v2/courses/bulk/{batchId}/progress
// ---------------------------------------------------------------------------

/**
 * Get real-time progress for a batch
 * @param {string} batchId
 * @returns {Promise<{ progress: object }>}
 */
export const adminGetBatchProgress = async (batchId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/courses/bulk/${batchId}/progress`);
  // return { progress: data };

  return {
    progress: {
      batchId,
      totalCourses: 3,
      completedCourses: 2,
      failedCourses: 0,
      pendingCourses: 1,
      progressPercentage: 66.7,
      status: "PROCESSING",
      currentOperation: "Creating course: Business Statistics",
      estimatedTimeRemaining: "2 minutes",
      lastUpdated: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 6.5 Retry Failed Batch
// POST /api/v2/courses/bulk/{batchId}/retry
// ---------------------------------------------------------------------------

/**
 * Retry a failed batch
 * @param {string} batchId
 * @returns {Promise<{ message: string, batch: object }>}
 */
export const adminRetryFailedBatch = async (batchId) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/courses/bulk/${batchId}/retry`);
  // return { message, batch: data };

  return {
    message: "Batch retry initiated successfully",
    batch: {
      batchId,
      previousStatus: "ERROR",
      newStatus: "PENDING",
      retryCount: 1,
      retriedAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 6.6 Get Course Templates
// GET /api/v2/course-templates
// ---------------------------------------------------------------------------

/**
 * Get available course templates for bulk creation
 * @returns {Promise<{ templates: Array }>}
 */
export const adminGetCourseTemplates = async () => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/course-templates');
  // return { templates: data.templates };

  return { templates: MOCK_TEMPLATES };
};
