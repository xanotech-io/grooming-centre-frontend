import { http } from '../http';

// Maps snake_case API response fields to camelCase for the UI
const mapWorkflow = (w) => ({
  workflowId: w.workflow_id || w.id,
  requestType: w.request_type,
  contentId: w.content_id,
  contentTitle: w.content_title,
  submittedBy: w.submitted_by,
  supervisorId: w.supervisor_id,
  approverRole: w.approver_role || w.supervisor_id,
  approvalStatus: w.approval_status,
  submissionDate: w.submission_date || w.created_at,
  actionDate: w.action_date || w.submission_date || w.created_at,
  description: w.description,
  attachmentUrl: w.attachment_url,
  remarks: w.remarks,
  resolutionTime: w.resolution_time,
});

// ---------------------------------------------------------------------------
// Submit Workflow Request
// POST /api/v1/workflows/submit
// ---------------------------------------------------------------------------

/**
 * @param {{ requestType, contentId, contentTitle, supervisorId, description, attachmentUrl }} body
 * @returns {Promise<{ message: string, workflow: object }>}
 */
export const adminSubmitWorkflow = async (body) => {
  const { data: { message, data } } = await http.post('/v1/workflows/submit', {
    request_type: body.requestType,
    content_id: body.contentId,
    content_title: body.contentTitle,
    supervisor_id: body.supervisorId,
    description: body.description,
    attachment_url: body.attachmentUrl,
  });
  return { message, workflow: data ? mapWorkflow(data) : null };
};

// ---------------------------------------------------------------------------
// Get Pending Workflows for a Supervisor
// GET /api/v1/workflows/pending/{supervisor_id}
// ---------------------------------------------------------------------------

/**
 * @param {string} supervisorId
 * @returns {Promise<{ workflows: Array, totalDocumentsCount: number }>}
 */
export const adminGetPendingWorkflows = async (supervisorId) => {
  const { data: { data } } = await http.get(`/v1/workflows/pending/${supervisorId}`);
  const workflows = (data || []).map(mapWorkflow);
  return { workflows, totalDocumentsCount: workflows.length };
};

// ---------------------------------------------------------------------------
// Track All Workflows (Admin)
// GET /api/v1/workflows/track
// ---------------------------------------------------------------------------

/**
 * @param {{ status?, start_date?, end_date?, supervisor_id?, request_type? }} params
 * @returns {Promise<{ workflows: Array, totalDocumentsCount: number }>}
 */
export const adminGetPendingApprovals = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/workflows/track', { params });
  const workflows = (data || []).map(mapWorkflow);
  return { workflows, totalDocumentsCount: workflows.length };
};

// ---------------------------------------------------------------------------
// Get Single Workflow by ID (derived from track endpoint)
// GET /api/v1/workflows/track
// ---------------------------------------------------------------------------

/**
 * @param {string} workflowId
 * @returns {Promise<{ workflow: object }>}
 */
export const adminGetWorkflowById = async (workflowId) => {
  const { data: { data } } = await http.get('/v1/workflows/track');
  const found = (data || []).find(
    (w) => (w.workflow_id || w.id) === workflowId
  );
  return { workflow: found ? mapWorkflow(found) : null };
};

// ---------------------------------------------------------------------------
// Review Workflow — Approve
// POST /api/v1/workflows/review
// ---------------------------------------------------------------------------

/**
 * @param {string} workflowId
 * @param {{ approverId: string, remarks: string }} body
 * @returns {Promise<{ message: string }>}
 */
export const adminApproveWorkflow = async (workflowId, { approverId, remarks } = {}) => {
  const { data: { message } } = await http.post('/v1/workflows/review', {
    workflow_id: workflowId,
    approver_id: approverId,
    approval_status: 'Approved',
    remarks,
  });
  return { message };
};

// ---------------------------------------------------------------------------
// Review Workflow — Reject
// POST /api/v1/workflows/review
// ---------------------------------------------------------------------------

/**
 * @param {string} workflowId
 * @param {{ approverId: string, remarks: string }} body
 * @returns {Promise<{ message: string }>}
 */
export const adminRejectWorkflow = async (workflowId, { approverId, remarks } = {}) => {
  const { data: { message } } = await http.post('/v1/workflows/review', {
    workflow_id: workflowId,
    approver_id: approverId,
    approval_status: 'Rejected',
    remarks,
  });
  return { message };
};

// ---------------------------------------------------------------------------
// Review Workflow — Escalate
// POST /api/v1/workflows/review
// ---------------------------------------------------------------------------

/**
 * @param {string} workflowId
 * @param {{ approverId: string, remarks: string }} body
 * @returns {Promise<{ message: string }>}
 */
export const adminEscalateWorkflow = async (workflowId, { approverId, remarks } = {}) => {
  const { data: { message } } = await http.post('/v1/workflows/review', {
    workflow_id: workflowId,
    approver_id: approverId,
    approval_status: 'Escalated',
    remarks,
  });
  return { message };
};

// ---------------------------------------------------------------------------
// Publish Approved Workflow
// POST /api/v1/workflows/publish
// ---------------------------------------------------------------------------

/**
 * @param {string} workflowId
 * @param {string} publishedBy  — UUID of the admin/instructor publishing
 * @returns {Promise<{ message: string }>}
 */
export const adminPublishWorkflow = async (workflowId, publishedBy) => {
  const { data: { message } } = await http.post('/v1/workflows/publish', {
    workflow_id: workflowId,
    published_by: publishedBy,
  });
  return { message };
};

// ---------------------------------------------------------------------------
// Get Workflow KPI Report (Admin)
// GET /api/v1/workflows/report
// ---------------------------------------------------------------------------

/**
 * @returns {Promise<{ report: { total_submissions, approved, rejected, pending, escalated, published, avg_resolution_hours, approvals_per_supervisor } }>}
 */
export const adminGetWorkflowReport = async () => {
  const { data: { data } } = await http.get('/v1/workflows/report');
  return { report: data };
};

// ---------------------------------------------------------------------------
// Get Audit Log for a Workflow
// GET /api/v1/workflows/audit/{workflow_id}
// ---------------------------------------------------------------------------

/**
 * @param {string} workflowId
 * @returns {Promise<{ auditLog: Array<{ id, workflow_id, action_type, performed_by, action_date, remarks }> }>}
 */
export const adminGetWorkflowAudit = async (workflowId) => {
  const { data: { data } } = await http.get(`/v1/workflows/audit/${workflowId}`);
  return { auditLog: data || [] };
};
