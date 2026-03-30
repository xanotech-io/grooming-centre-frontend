const ROLE_TYPE_VALUES = [
  "ADMIN",
  "INSTRUCTOR",
  "STUDENT",
  "SUPERVISOR",
  "ACADEMIC_ADMIN",
];

const ACCESS_LEVEL_VALUES = ["READ", "WRITE", "FULL_ACCESS"];

let MOCK_ROLES = [
  {
    roleId: "550e8400-e29b-41d4-a716-446655440000",
    roleName: "System Admin",
    description: "Full system access",
    roleType: "ADMIN",
    permissions: ["FULL_ACCESS"],
    isActive: true,
    userCount: 5,
    accessLevel: "FULL_ACCESS",
    assignedBy: "admin-001",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-11-15T09:45:00Z",
  },
  {
    roleId: "550e8400-e29b-41d4-a716-446655440001",
    roleName: "Instructor",
    description: "Course delivery and grading",
    roleType: "INSTRUCTOR",
    permissions: ["COURSE_MANAGE", "GRADE_EDIT"],
    isActive: true,
    userCount: 25,
    accessLevel: "WRITE",
    assignedBy: "admin-001",
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-11-10T10:30:00Z",
  },
  {
    roleId: "550e8400-e29b-41d4-a716-446655440002",
    roleName: "Learner",
    description: "Course access and participation",
    roleType: "STUDENT",
    permissions: ["COURSE_VIEW", "ASSESSMENT_TAKE"],
    isActive: true,
    userCount: 140,
    accessLevel: "READ",
    assignedBy: "admin-002",
    createdAt: "2025-02-14T12:00:00Z",
    updatedAt: "2025-11-11T08:00:00Z",
  },
  {
    roleId: "550e8400-e29b-41d4-a716-446655440003",
    roleName: "Supervisor",
    description: "Content approval and oversight",
    roleType: "SUPERVISOR",
    permissions: ["CONTENT_APPROVE", "WORKFLOW_MANAGE"],
    isActive: false,
    userCount: 8,
    accessLevel: "FULL_ACCESS",
    assignedBy: "admin-002",
    createdAt: "2025-03-05T14:00:00Z",
    updatedAt: "2025-10-01T13:15:00Z",
  },
];

let MOCK_ROLE_ASSIGNMENTS = [
  {
    assignmentId: "660e8400-e29b-41d4-a716-446655440010",
    userId: "user-123",
    userName: "John Doe",
    userEmail: "john.doe@groomingcentre.com",
    roleId: "550e8400-e29b-41d4-a716-446655440001",
    roleName: "Instructor",
    roleType: "INSTRUCTOR",
    accessLevel: "WRITE",
    assignedBy: "admin-001",
    assignmentDate: "2025-09-01T08:00:00Z",
    status: "Active",
  },
  {
    assignmentId: "660e8400-e29b-41d4-a716-446655440011",
    userId: "user-456",
    userName: "Mary Johnson",
    userEmail: "mary.j@groomingcentre.com",
    roleId: "550e8400-e29b-41d4-a716-446655440002",
    roleName: "Learner",
    roleType: "STUDENT",
    accessLevel: "READ",
    assignedBy: "admin-002",
    assignmentDate: "2025-10-10T09:15:00Z",
    status: "Active",
  },
  {
    assignmentId: "660e8400-e29b-41d4-a716-446655440012",
    userId: "user-789",
    userName: "Jane Smith",
    userEmail: "jane.smith@groomingcentre.com",
    roleId: "550e8400-e29b-41d4-a716-446655440003",
    roleName: "Supervisor",
    roleType: "SUPERVISOR",
    accessLevel: "FULL_ACCESS",
    assignedBy: "admin-001",
    assignmentDate: "2025-10-15T10:30:00Z",
    status: "Inactive",
  },
];

const generateUuid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const paginate = (rows, params = {}) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const start = (page - 1) * limit;
  const pagedRows = rows.slice(start, start + limit);

  return {
    rows: pagedRows,
    count: rows.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

const roleMatchesQuery = (role, search = "") => {
  const normalized = search.toLowerCase().trim();
  if (!normalized) return true;
  return (
    role.roleName.toLowerCase().includes(normalized) ||
    role.roleType.toLowerCase().includes(normalized) ||
    role.description.toLowerCase().includes(normalized)
  );
};

const updateRoleUserCounts = () => {
  MOCK_ROLES = MOCK_ROLES.map((role) => {
    const activeAssignments = MOCK_ROLE_ASSIGNMENTS.filter(
      (assignment) => assignment.roleId === role.roleId && assignment.status === "Active",
    );
    return { ...role, userCount: activeAssignments.length };
  });
};

export const adminCreateRole = async (body) => {
  const roleName = String(body.roleName || "").trim();
  if (!roleName) {
    throw new Error("Role name is required");
  }

  const duplicate = MOCK_ROLES.find(
    (role) => role.roleName.toLowerCase() === roleName.toLowerCase(),
  );
  if (duplicate) {
    throw new Error("Role already exists");
  }

  const now = new Date().toISOString();
  const roleType = ROLE_TYPE_VALUES.includes(body.roleType) ? body.roleType : "STUDENT";
  const accessLevel = ACCESS_LEVEL_VALUES.includes(body.accessLevel)
    ? body.accessLevel
    : roleType === "ADMIN" || roleType === "SUPERVISOR"
      ? "FULL_ACCESS"
      : roleType === "INSTRUCTOR"
        ? "WRITE"
        : "READ";

  const newRole = {
    roleId: generateUuid("role"),
    roleName,
    description: String(body.description || "").trim(),
    roleType,
    permissions: Array.isArray(body.permissions) ? body.permissions : [],
    isActive: body.isActive !== false,
    userCount: 0,
    accessLevel,
    assignedBy: String(body.assignedBy || "admin-001"),
    createdAt: now,
    updatedAt: now,
  };

  MOCK_ROLES = [newRole, ...MOCK_ROLES];

  return {
    message: "Role created successfully",
    data: newRole,
  };
};

export const adminGetAllRoles = async (params = {}) => {
  const roleType = String(params.roleType || "").toUpperCase().trim();
  const status = String(params.status || "").toLowerCase().trim();

  let rows = [...MOCK_ROLES].filter((role) => roleMatchesQuery(role, params.search || ""));

  if (roleType) {
    rows = rows.filter((role) => role.roleType === roleType);
  }

  if (status === "active") {
    rows = rows.filter((role) => role.isActive);
  }

  if (status === "inactive") {
    rows = rows.filter((role) => !role.isActive);
  }

  rows.sort((a, b) => a.roleName.localeCompare(b.roleName));

  return paginate(rows, params);
};

export const adminGetRoleById = async (id) => {
  const role = MOCK_ROLES.find((item) => item.roleId === id);
  if (!role) {
    throw new Error("Role not found");
  }

  return {
    ...role,
    assignedUsers: role.userCount,
  };
};

export const adminUpdateRole = async (id, body) => {
  const roleIndex = MOCK_ROLES.findIndex((item) => item.roleId === id);
  if (roleIndex === -1) {
    throw new Error("Role not found");
  }

  const existingRole = MOCK_ROLES[roleIndex];
  const updatedRole = {
    ...existingRole,
    roleName: body.roleName != null ? String(body.roleName).trim() : existingRole.roleName,
    description: body.description != null ? String(body.description).trim() : existingRole.description,
    roleType: body.roleType && ROLE_TYPE_VALUES.includes(body.roleType)
      ? body.roleType
      : existingRole.roleType,
    isActive: body.isActive != null ? Boolean(body.isActive) : existingRole.isActive,
    accessLevel: body.accessLevel && ACCESS_LEVEL_VALUES.includes(body.accessLevel)
      ? body.accessLevel
      : existingRole.accessLevel,
    updatedAt: new Date().toISOString(),
  };

  MOCK_ROLES[roleIndex] = updatedRole;

  return {
    message: "Role updated successfully",
    data: updatedRole,
  };
};

export const adminDeleteRole = async (id) => {
  const role = MOCK_ROLES.find((item) => item.roleId === id);
  if (!role) {
    throw new Error("Role not found");
  }

  const affectedAssignments = MOCK_ROLE_ASSIGNMENTS.filter(
    (assignment) => assignment.roleId === id,
  );

  MOCK_ROLES = MOCK_ROLES.filter((item) => item.roleId !== id);
  MOCK_ROLE_ASSIGNMENTS = MOCK_ROLE_ASSIGNMENTS.filter((assignment) => assignment.roleId !== id);
  updateRoleUserCounts();

  return {
    message: "Role deleted successfully",
    data: {
      roleId: id,
      deletedAt: new Date().toISOString(),
      affectedUsers: affectedAssignments.length,
      note: `Role removed from ${affectedAssignments.length} users`,
    },
  };
};

export const adminUpdateRolePermissions = async (id, body) => {
  const roleIndex = MOCK_ROLES.findIndex((item) => item.roleId === id);
  if (roleIndex === -1) {
    throw new Error("Role not found");
  }

  const role = MOCK_ROLES[roleIndex];
  const requestedPermissions = Array.isArray(body.permissions) ? body.permissions : [];
  const action = String(body.action || "REPLACE").toUpperCase();
  const previousPermissions = [...role.permissions];

  let permissions = [...role.permissions];
  if (action === "ADD") {
    permissions = [...new Set([...permissions, ...requestedPermissions])];
  } else if (action === "REMOVE") {
    permissions = permissions.filter((item) => !requestedPermissions.includes(item));
  } else {
    permissions = [...new Set(requestedPermissions)];
  }

  const updatedRole = {
    ...role,
    permissions,
    updatedAt: new Date().toISOString(),
  };

  MOCK_ROLES[roleIndex] = updatedRole;

  return {
    message: "Permissions updated successfully",
    data: {
      roleId: updatedRole.roleId,
      roleName: updatedRole.roleName,
      permissions: updatedRole.permissions,
      previousPermissions,
      updatedBy: String(body.updatedBy || "admin-001"),
      updatedAt: updatedRole.updatedAt,
    },
  };
};

export const adminAssignRoleToUser = async (userId, body) => {
  const role = MOCK_ROLES.find((item) => item.roleId === body.roleId);
  if (!role) {
    throw new Error("Role not found");
  }

  const duplicate = MOCK_ROLE_ASSIGNMENTS.find(
    (assignment) =>
      assignment.userId === userId &&
      assignment.roleId === body.roleId &&
      assignment.status === "Active",
  );

  if (duplicate) {
    throw new Error("User already has this role");
  }

  const assignment = {
    assignmentId: generateUuid("assignment"),
    userId,
    userName: String(body.userName || `User ${userId}`),
    userEmail: String(body.userEmail || `${userId}@groomingcentre.com`),
    roleId: role.roleId,
    roleName: role.roleName,
    roleType: role.roleType,
    accessLevel: ACCESS_LEVEL_VALUES.includes(body.accessLevel)
      ? body.accessLevel
      : role.accessLevel,
    assignedBy: String(body.assignedBy || "admin-001"),
    assignmentDate: String(body.assignmentDate || new Date().toISOString()),
    status: String(body.status || "Active"),
  };

  MOCK_ROLE_ASSIGNMENTS = [assignment, ...MOCK_ROLE_ASSIGNMENTS];
  updateRoleUserCounts();

  return {
    message: "Role assigned to user successfully",
    data: assignment,
  };
};

export const adminGetUserRoles = async (userId) => {
  const roles = MOCK_ROLE_ASSIGNMENTS.filter((assignment) => assignment.userId === userId);

  const first = roles[0];
  return {
    userId,
    userName: first?.userName || `User ${userId}`,
    roles: roles.map((assignment) => ({
      ...assignment,
      permissions:
        MOCK_ROLES.find((role) => role.roleId === assignment.roleId)?.permissions || [],
    })),
    totalRoles: roles.length,
  };
};

export const adminRemoveRoleFromUser = async (userId, roleId) => {
  const assignment = MOCK_ROLE_ASSIGNMENTS.find(
    (item) => item.userId === userId && item.roleId === roleId,
  );
  if (!assignment) {
    throw new Error("User or role not found");
  }

  MOCK_ROLE_ASSIGNMENTS = MOCK_ROLE_ASSIGNMENTS.filter(
    (item) => !(item.userId === userId && item.roleId === roleId),
  );
  updateRoleUserCounts();

  const remainingRoles = MOCK_ROLE_ASSIGNMENTS.filter((item) => item.userId === userId).length;

  return {
    message: "Role removed from user successfully",
    data: {
      userId,
      userName: assignment.userName,
      roleId,
      roleName: assignment.roleName,
      removedBy: "admin-001",
      removedAt: new Date().toISOString(),
      remainingRoles,
    },
  };
};

export const adminGetRoleAssignments = async (params = {}) => {
  let rows = [...MOCK_ROLE_ASSIGNMENTS];

  if (params.roleId) {
    rows = rows.filter((assignment) => assignment.roleId === params.roleId);
  }

  if (params.search) {
    const query = String(params.search).toLowerCase().trim();
    rows = rows.filter(
      (assignment) =>
        assignment.userName.toLowerCase().includes(query) ||
        assignment.roleName.toLowerCase().includes(query) ||
        assignment.userEmail.toLowerCase().includes(query),
    );
  }

  rows.sort(
    (a, b) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime(),
  );

  return paginate(rows, params);
};

export const adminGetRoleListing = async (params = {}) => {
  const response = await adminGetAllRoles({ page: 1, limit: 500, ...params });

  return {
    roles: response.rows.map((role, index) => ({
      id: role.roleId,
      roleId: role.roleId,
      name: role.roleName,
      noOfUsers: role.userCount,
      date: role.updatedAt,
      accessLevel: role.accessLevel,
      status: role.isActive ? "Active" : "Inactive",
      roleType: role.roleType,
      assignedBy: role.assignedBy,
      sequence: index + 1,
    })),
  };
};
