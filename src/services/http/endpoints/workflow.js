import { http } from '../http';

const normalize = (w) => ({
  workflowId: w.workflow_id ?? w.workflowId ?? w.id,
  requestType: w.request_type ?? w.requestType,
  contentId: w.content_id ?? w.contentId,
  contentTitle: w.content_title ?? w.contentTitle,
  submittedBy: w.submitted_by ?? w.submittedBy,
  submitterName: w.submitter
    ? `${w.submitter.firstName ?? ""} ${w.submitter.lastName ?? ""}`.trim() || "—"
    : "—",
  submitterEmail: w.submitter?.email ?? "—",
  supervisorId: w.supervisor_id ?? w.supervisorId,
  submissionDate: w.submission_date ?? w.submissionDate,
  description: w.description,
  attachmentUrl: w.attachment_url ?? w.attachmentUrl,
  approvalStatus: w.approval_status ?? w.approvalStatus ?? w.status,
  approverRole: w.approver_role ?? w.approverRole,
  actionDate: w.action_date ?? w.actionDate,
  remarks: w.remarks,
  resolutionTime: w.resolution_time ?? w.resolutionTime ?? w.resolution_time_hours,
  notificationStatus: w.notification_status ?? w.notificationStatus,
});

// POST /api/v1/workflows/submit
export const adminSubmitWorkflow = async (body) => {
  let payload = body;
  let config = {};

  if (body.attachment_file) {
    const formData = new FormData();
    const { attachment_file, ...rest } = body;
    Object.entries(rest).forEach(([k, v]) => { if (v != null) formData.append(k, v); });
    formData.append('attachment_file', attachment_file);
    payload = formData;
    config = { headers: { 'Content-Type': 'multipart/form-data' } };
  }

  const { data } = await http.post('/v1/workflows/submit', payload, config);
  return { message: data.message, workflow: data.data };
};

// Supervisor listing endpoints have been observed to nest the person under
// `user`/`supervisor` on some responses instead of returning flat fields —
// normalize so `id`/`firstName`/`lastName` are always present when they exist.
const normalizeSupervisor = (s) => ({
  ...s,
  id: s.id ?? s.userId ?? s.supervisorId ?? s.user?.id,
  firstName: s.firstName ?? s.user?.firstName ?? "",
  lastName: s.lastName ?? s.user?.lastName ?? "",
});

// GET /api/v1/workflows/supervisors
export const adminGetWorkflowSupervisors = async (departmentId) => {
  const { data } = await http.get('/v1/workflows/supervisors', {
    params: departmentId ? { departmentId } : undefined,
  });
  const raw = data.data?.rows ?? data.data ?? [];
  return { supervisors: (Array.isArray(raw) ? raw : []).map(normalizeSupervisor) };
};

// GET /api/department/supervisors/:courseId
export const adminGetDepartmentSupervisors = async (courseId) => {
  const { data } = await http.get(`/v1/department/supervisors/${courseId}`);
  const raw = data.data?.rows ?? data.data ?? data.supervisors ?? [];
  return { supervisors: (Array.isArray(raw) ? raw : []).map(normalizeSupervisor) };
};

// GET /api/v1/workflows/pending/{supervisor_id}
export const adminGetPendingApprovals = async (supervisorId) => {
  const { data } = await http.get(`/v1/workflows/pending/${supervisorId}`);
  const raw = Array.isArray(data.data) ? data.data : data.data?.workflows ?? [];
  const counts = Array.isArray(data.data) ? null : data.data?.counts ?? null;
  const workflows = raw.map(normalize);
  return { workflows, counts, totalDocumentsCount: counts?.total ?? workflows.length };
};

// POST /api/v1/workflows/review  (approve, reject, or escalate)
export const adminApproveWorkflow = async (workflowId, { approverId, remarks }) => {
  const { data } = await http.post('/v1/workflows/review', {
    workflow_id: workflowId,
    approver_id: approverId,
    approval_status: 'Approved',
    remarks,
  });
  return { message: data.message };
};

export const adminRejectWorkflow = async (workflowId, { approverId, remarks }) => {
  const { data } = await http.post('/v1/workflows/review', {
    workflow_id: workflowId,
    approver_id: approverId,
    approval_status: 'Rejected',
    remarks,
  });
  return { message: data.message };
};

export const adminEscalateWorkflow = async (workflowId, { approverId, remarks }) => {
  const { data } = await http.post('/v1/workflows/review', {
    workflow_id: workflowId,
    approver_id: approverId,
    approval_status: 'Escalated',
    remarks,
  });
  return { message: data.message };
};

// POST /api/v1/workflows/publish
export const adminPublishWorkflow = async ({ workflowId, publishedBy }) => {
  const { data } = await http.post('/v1/workflows/publish', {
    workflow_id: workflowId,
    published_by: publishedBy,
  });
  return { message: data.message };
};

const normalizeTracked = (w) => ({
  id: w.id,
  requestType: w.request_type ?? "—",
  contentTitle: w.content_title ?? "—",
  status: w.status ?? "—",
  submissionDate: w.submission_date ?? null,
  actionDate: w.action_date ?? null,
  remarks: w.remarks ?? "—",
  resolutionTimeHours: w.resolution_time_hours ?? null,
  notificationStatus: w.notification_status ?? "—",
  submitterName: w.submitter
    ? `${w.submitter.firstName ?? ""} ${w.submitter.lastName ?? ""}`.trim() || "—"
    : "—",
  submitterEmail: w.submitter?.email ?? "—",
  supervisorName: w.supervisor
    ? `${w.supervisor.firstName ?? ""} ${w.supervisor.lastName ?? ""}`.trim() || "—"
    : "—",
  supervisorEmail: w.supervisor?.email ?? "—",
  supervisorRole: w.supervisor?.role ?? "—",
  supervisorId: w.supervisor?.id ?? null,
});

// GET /api/v1/workflows/track  (admin only)
export const adminTrackWorkflows = async (params = {}) => {
  const { data } = await http.get('/v1/workflows/track', { params });
  return { workflows: (data.data ?? []).map(normalizeTracked), message: data.message };
};

// GET /api/v1/workflows/report  (admin only)
export const adminGetWorkflowReport = async () => {
  const { data } = await http.get('/v1/workflows/report');
  return { report: data.data, message: data.message };
};

// GET /api/v1/workflows/audit/{workflow_id}
export const adminGetWorkflowAuditLog = async (workflowId) => {
  const { data } = await http.get(`/v1/workflows/audit/${workflowId}`);
  return { auditLog: data.data ?? [], message: data.message };
};

// Instructor-Supervisor Mapping (v2 endpoints)
export const adminMapInstructorSupervisor = async (instructorId, body) => {
  const { data } = await http.post(`/v2/instructors/${instructorId}/supervisor`, body);
  return { message: data.message, mapping: data.data };
};

export const adminGetSupervisorMappings = async (params) => {
  const { data } = await http.get('/v2/instructors/supervisor-mappings', { params });
  return { mappings: data.mappings, pagination: data.pagination };
};
