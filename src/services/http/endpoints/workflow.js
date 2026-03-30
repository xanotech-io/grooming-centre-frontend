import { http } from '../http';

// ---------------------------------------------------------------------------
// 1.1 Submit Workflow Request
// POST /api/v2/workflows
// ---------------------------------------------------------------------------

/**
 * Submit a new workflow request
 * @param {{ requestType: string, contentId: string, remarks: string }} body
 * @returns {Promise<{ message: string, workflow: object }>}
 */
export const adminSubmitWorkflow = async (body) => {
  const { data: { message, data } } = await http.post('/v2/workflows', body);
  return { message, workflow: data };
};

// ---------------------------------------------------------------------------
// 1.2 Get Pending Approvals for Supervisor
// GET /api/v2/workflows/pending
// ---------------------------------------------------------------------------

/**
 * Get all pending (and other) workflow approvals
 * @param {object} params - optional query params (page, limit, status, etc.)
 * @returns {Promise<{ workflows: Array, totalDocumentsCount: number }>}
 */
export const adminGetPendingApprovals = async (params) => {
  const { data: { data } } = await http.get('/v2/workflows/pending', { params });
  return {
    workflows: data.map((w) => ({
      workflowId: w.workflowId,
      requestType: w.requestType,
      submittedBy: w.submittedBy,
      approverRole: w.approverRole,
      approvalStatus: w.approvalStatus,
      actionDate: w.actionDate,
      remarks: w.remarks,
      resolutionTime: w.resolutionTime,
    })),
    totalDocumentsCount: data.length,
  };
};

// ---------------------------------------------------------------------------
// Get Workflow By ID (derived endpoint - not explicit in spec)
// GET /api/v2/workflows/:workflowId
// ---------------------------------------------------------------------------

/**
 * Get a single workflow by its ID
 * @param {string} workflowId
 * @returns {Promise<{ workflow: object }>}
 */
export const adminGetWorkflowById = async (workflowId) => {
  const { data: { data } } = await http.get(`/v2/workflows/${workflowId}`);
  return { workflow: data };
};

// ---------------------------------------------------------------------------
// 1.3 Approve Workflow Request
// PATCH /api/v2/workflows/:workflowId/approve
// ---------------------------------------------------------------------------

/**
 * Approve a workflow request
 * @param {string} workflowId
 * @param {{ remarks: string }} body
 * @returns {Promise<{ message: string, workflow: object }>}
 */
export const adminApproveWorkflow = async (workflowId, body) => {
  const { data: { message, data } } = await http.patch(`/v2/workflows/${workflowId}/approve`, body);
  return { message, workflow: data };
};

// ---------------------------------------------------------------------------
// 1.4 Reject Workflow Request
// PATCH /api/v2/workflows/:workflowId/reject
// ---------------------------------------------------------------------------

/**
 * Reject a workflow request
 * @param {string} workflowId
 * @param {{ remarks: string }} body - rejection reason is required
 * @returns {Promise<{ message: string, workflow: object }>}
 */
export const adminRejectWorkflow = async (workflowId, body) => {
  const { data: { message, data } } = await http.patch(`/v2/workflows/${workflowId}/reject`, body);
  return { message, workflow: data };
};

// ---------------------------------------------------------------------------
// 1.5 Escalate Workflow
// POST /api/v2/workflows/:workflowId/escalate
// ---------------------------------------------------------------------------

/**
 * Escalate a workflow to a higher approver role
 * @param {string} workflowId
 * @param {{ newApproverRole: string, remarks: string }} body
 * @returns {Promise<{ message: string, workflow: object }>}
 */
export const adminEscalateWorkflow = async (workflowId, body) => {
  const { data: { message, data } } = await http.post(`/v2/workflows/${workflowId}/escalate`, body);
  return { message, workflow: data };
};

// ---------------------------------------------------------------------------
// 1.6 Instructor-Supervisor Mapping
// POST /api/v2/instructors/:instructorId/supervisor
// ---------------------------------------------------------------------------

/**
 * Map a supervisor to an instructor
 * @param {string} instructorId
 * @param {{ supervisorId: string, departmentId: string }} body
 * @returns {Promise<{ message: string, mapping: object }>}
 */
export const adminMapInstructorSupervisor = async (instructorId, body) => {
  const { data: { message, data } } = await http.post(`/v2/instructors/${instructorId}/supervisor`, body);
  return { message, mapping: data };
};

// ---------------------------------------------------------------------------
// 1.7 Get All Supervisor Mappings (Admin)
// GET /api/v2/instructors/supervisor-mappings
// ---------------------------------------------------------------------------

/**
 * Get all instructor-supervisor mappings
 * @param {{ instructorId?: string, supervisorId?: string, departmentId?: string, isActive?: boolean }} params
 * @returns {Promise<{ mappings: Array, pagination: object }>}
 */
export const adminGetSupervisorMappings = async (params) => {
  const { data: { data } } = await http.get('/v2/instructors/supervisor-mappings', { params });
  return {
    mappings: data.mappings,
    pagination: data.pagination,
  };
};
