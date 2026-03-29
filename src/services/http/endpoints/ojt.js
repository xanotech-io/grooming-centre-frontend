// import { http } from "../http";

let MOCK_OJT_ACTIVITIES = [
  {
    ojtId: "OJT-001",
    learnerId: "LRN-001",
    learnerName: "Nmorsi Donald",
    companyDepartment: "ABC Farms",
    supervisorId: "SUPER-001",
    supervisorName: "Mr. Adebayo",
    ojtStartDate: "2025-11-01T08:00:00Z",
    ojtEndDate: "2025-11-30T17:00:00Z",
    tasksAssigned: [
      "Soil preparation",
      "Seed planting",
      "Irrigation management",
      "Pest control",
      "Harvesting techniques",
    ],
    tasksCompleted: 3,
    attendance: {
      daysAttended: 20,
      totalDays: 22,
    },
    competencyRating: 4,
    feedback:
      "Good progress in soil preparation and seed planting. Needs improvement in irrigation techniques.",
    completionStatus: "In Progress",
    remarks: "Extension requested for irrigation training",
    createdAt: "2025-11-01T08:00:00Z",
    updatedAt: "2025-11-20T16:00:00Z",
  },
  {
    ojtId: "OJT-002",
    learnerId: "LRN-002",
    learnerName: "Jane Okoro",
    companyDepartment: "City Bank Ops",
    supervisorId: "SUPER-002",
    supervisorName: "Mrs. Ibrahim",
    ojtStartDate: "2025-10-01T08:00:00Z",
    ojtEndDate: "2025-10-31T17:00:00Z",
    tasksAssigned: ["Customer onboarding", "CRM logging", "KYC checks"],
    tasksCompleted: 3,
    attendance: {
      daysAttended: 21,
      totalDays: 21,
    },
    competencyRating: 5,
    feedback: "Excellent delivery and professionalism.",
    completionStatus: "Completed",
    remarks: "Eligible for completion certificate",
    createdAt: "2025-10-01T08:00:00Z",
    updatedAt: "2025-10-31T16:00:00Z",
  },
];

const paginate = (rows, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedRows = rows.slice(start, end);

  return {
    rows: pagedRows,
    count: rows.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

const findOjtById = (ojtId) =>
  MOCK_OJT_ACTIVITIES.find((activity) => activity.ojtId === ojtId);

/**
 * TC13 - Create OJT activity
 * POST /api/v2/compliance/ojt
 */
export const adminCreateOjtActivity = async (body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/api/v2/compliance/ojt', body);

  const nextId = `OJT-${String(MOCK_OJT_ACTIVITIES.length + 1).padStart(3, "0")}`;
  const createdActivity = {
    ojtId: nextId,
    learnerId: body.learnerId || "LRN-001",
    learnerName: body.learnerName || "Learner",
    companyDepartment: body.companyDepartment || "General Department",
    supervisorId: body.supervisorId || "SUPER-001",
    supervisorName: body.supervisorName || "Assigned Supervisor",
    ojtStartDate: body.ojtStartDate || new Date().toISOString(),
    ojtEndDate: body.ojtEndDate || new Date().toISOString(),
    tasksAssigned: body.tasksAssigned || [],
    tasksCompleted: Number(body.tasksCompleted || 0),
    attendance: body.attendance || { daysAttended: 0, totalDays: 0 },
    competencyRating: Number(body.competencyRating || 0),
    feedback: body.feedback || "",
    completionStatus: body.completionStatus || "In Progress",
    remarks: body.remarks || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_OJT_ACTIVITIES = [createdActivity, ...MOCK_OJT_ACTIVITIES];

  return {
    message: "OJT activity created successfully",
    activity: createdActivity,
  };
};

/**
 * TC13 - Get all OJT activities
 * GET /api/v2/compliance/ojt
 */
export const adminGetOjtActivities = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/api/v2/compliance/ojt', { params });

  const search = String(params.search || "").trim().toLowerCase();
  const learnerId = params.learnerId;
  const completionStatus = params.completionStatus;

  const filtered = MOCK_OJT_ACTIVITIES.filter((activity) => {
    const matchesSearch = search
      ? [
          activity.ojtId,
          activity.learnerName,
          activity.companyDepartment,
          activity.supervisorName,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      : true;

    const matchesLearner = learnerId ? activity.learnerId === learnerId : true;
    const matchesStatus = completionStatus
      ? activity.completionStatus === completionStatus
      : true;

    return matchesSearch && matchesLearner && matchesStatus;
  });

  const pagination = paginate(filtered, params);

  return {
    activities: pagination.rows,
    pagination: {
      count: pagination.count,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    },
  };
};

/**
 * TC13 - Get OJT activity by id
 * GET /api/v2/compliance/ojt/{ojtId}
 */
export const adminGetOjtActivityById = async (ojtId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/compliance/ojt/${ojtId}`);

  const activity = findOjtById(ojtId);

  if (!activity) {
    throw new Error("OJT activity not found");
  }

  return { activity };
};

/**
 * TC13 - Update OJT activity
 * PATCH /api/v2/compliance/ojt/{ojtId}
 */
export const adminUpdateOjtActivity = async (ojtId, body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.patch(`/api/v2/compliance/ojt/${ojtId}`, body);

  const existing = findOjtById(ojtId);

  if (!existing) {
    throw new Error("OJT activity not found");
  }

  const updated = {
    ...existing,
    tasksAssigned: body.tasksAssigned || existing.tasksAssigned,
    tasksCompleted:
      body.tasksCompleted != null
        ? Number(body.tasksCompleted)
        : existing.tasksCompleted,
    attendance: body.attendance || existing.attendance,
    competencyRating:
      body.competencyRating != null
        ? Number(body.competencyRating)
        : existing.competencyRating,
    feedback: body.feedback || existing.feedback,
    completionStatus: body.completionStatus || existing.completionStatus,
    remarks: body.remarks || existing.remarks,
    updatedAt: new Date().toISOString(),
  };

  MOCK_OJT_ACTIVITIES = MOCK_OJT_ACTIVITIES.map((activity) =>
    activity.ojtId === ojtId ? updated : activity,
  );

  return {
    message: "OJT activity updated successfully",
    activity: updated,
  };
};

/**
 * TC13 - Add supervisor feedback
 * POST /api/v2/compliance/ojt/{ojtId}/feedback
 */
export const adminAddOjtSupervisorFeedback = async (ojtId, body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/api/v2/compliance/ojt/${ojtId}/feedback`, body);

  const existing = findOjtById(ojtId);

  if (!existing) {
    throw new Error("OJT activity not found");
  }

  const feedbackMessage = body.feedback || body.message || "Supervisor feedback added";

  const updated = {
    ...existing,
    feedback: feedbackMessage,
    remarks: body.remarks || existing.remarks,
    updatedAt: new Date().toISOString(),
  };

  MOCK_OJT_ACTIVITIES = MOCK_OJT_ACTIVITIES.map((activity) =>
    activity.ojtId === ojtId ? updated : activity,
  );

  return {
    message: "Supervisor feedback added successfully",
    activity: updated,
  };
};
