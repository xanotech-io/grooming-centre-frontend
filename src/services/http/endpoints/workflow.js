// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_WORKFLOWS = [
  {
    workflowId: "WF-0234",
    requestType: "Course Registrationsss",
    submittedBy: "Samuel Oke",
    approverRole: "Academic Admin",
    approvalStatus: "Approved",
    actionDate: "2025-10-17T14:30:00Z",
    remarks: "Request validated and approved",
    resolutionTime: 2.5,
  },
  {
    workflowId: "WF-0235",
    requestType: "Content Submission",
    submittedBy: "Jane Ibrahim",
    approverRole: "Supervisor",
    approvalStatus: "Pending",
    actionDate: null,
    remarks: "Awaiting review",
    resolutionTime: null,
  },
  {
    workflowId: "WF-0236",
    requestType: "Profile Update",
    submittedBy: "Musa Bello",
    approverRole: "System Admin",
    approvalStatus: "Rejected",
    actionDate: "2025-10-17T16:00:00Z",
    remarks: "Incomplete documentation",
    resolutionTime: 1.2,
  },
  {
    workflowId: "WF-0237",
    requestType: "Access Request",
    submittedBy: "Amaka Obi",
    approverRole: "Admin",
    approvalStatus: "Pending",
    actionDate: null,
    remarks: "Awaiting review",
    resolutionTime: null,
  },
  {
    workflowId: "WF-0238",
    requestType: "Course Registration",
    submittedBy: "Tobi Adeyemi",
    approverRole: "Instructor",
    approvalStatus: "Rejected",
    actionDate: "2025-10-18T09:00:00Z",
    remarks: null,
    resolutionTime: 3.1,
  },
  {
    workflowId: "WF-0239",
    requestType: "Course Content",
    submittedBy: "Ngozi Peters",
    approverRole: "Supervisor",
    approvalStatus: "Escalated",
    actionDate: "2025-10-18T11:00:00Z",
    remarks: "Requires higher authority review",
    resolutionTime: null,
  },
];

const MOCK_SUPERVISOR_MAPPINGS = [
  {
    mappingId: "map-001",
    instructorId: "inst-001",
    instructorName: "Dr. Tunde Bello",
    supervisorId: "sup-001",
    supervisorName: "Prof. A. Smith",
    departmentId: "dept-science",
    departmentName: "Faculty of Science",
    isActive: true,
  },
  {
    mappingId: "map-002",
    instructorId: "inst-002",
    instructorName: "Mrs. Ada Johnson",
    supervisorId: "sup-001",
    supervisorName: "Prof. A. Smith",
    departmentId: "dept-science",
    departmentName: "Faculty of Science",
    isActive: true,
  },
];

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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/workflows', body);
  // return { message, workflow: data };

  return {
    message: "Workflow submitted successfully",
    workflow: {
      workflowId: "wf-uuid-123",
      requestType: body.requestType,
      approvalStatus: "PENDING",
      submittedBy: "user-uuid",
      submissionDate: new Date().toISOString(),
      approverRole: "SUPERVISOR",
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/workflows/pending', { params });
  // return {
  //   workflows: data.map((w) => ({
  //     workflowId: w.workflowId,
  //     requestType: w.requestType,
  //     submittedBy: w.submittedBy,
  //     approverRole: w.approverRole,
  //     approvalStatus: w.approvalStatus,
  //     actionDate: w.actionDate,
  //     remarks: w.remarks,
  //     resolutionTime: w.resolutionTime,
  //   })),
  //   totalDocumentsCount: data.length,
  // };

  return {
    workflows: MOCK_WORKFLOWS,
    totalDocumentsCount: MOCK_WORKFLOWS.length,
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/workflows/${workflowId}`);
  // return { workflow: data };

  const found =
    MOCK_WORKFLOWS.find((w) => w.workflowId === workflowId) ||
    MOCK_WORKFLOWS[1];
  return { workflow: found };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.patch(`/v2/workflows/${workflowId}/approve`, body);
  // return { message, workflow: data };

  return {
    message: "Workflow approved successfully",
    workflow: {
      workflowId,
      approvalStatus: "APPROVED",
      actionDate: new Date().toISOString(),
      approverRole: "SUPERVISOR",
      resolutionTime: 4.2,
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.patch(`/v2/workflows/${workflowId}/reject`, body);
  // return { message, workflow: data };

  return {
    message: "Workflow rejected successfully",
    workflow: {
      workflowId,
      approvalStatus: "Rejected",
      actionDate: new Date().toISOString(),
      approverRole: "SystemAdmin",
      resolutionTime: 1.2,
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/workflows/${workflowId}/escalate`, body);
  // return { message, workflow: data };

  return {
    message: "Workflow escalated successfully",
    workflow: {
      workflowId,
      previousApproverRole: "SUPERVISOR",
      newApproverRole: body.newApproverRole,
      approvalStatus: "ESCALATED",
      escalationDate: new Date().toISOString(),
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/instructors/${instructorId}/supervisor`, body);
  // return { message, mapping: data };

  return {
    message: "Supervisor mapped successfully",
    mapping: {
      mappingId: "map-uuid-123",
      instructorId,
      supervisorId: body.supervisorId,
      departmentId: body.departmentId,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/instructors/supervisor-mappings', { params });
  // return {
  //   mappings: data.mappings,
  //   pagination: data.pagination,
  // };

  return {
    mappings: MOCK_SUPERVISOR_MAPPINGS,
    pagination: {
      page: 1,
      limit: 10,
      totalItems: MOCK_SUPERVISOR_MAPPINGS.length,
      totalPages: 1,
    },
  };
};
