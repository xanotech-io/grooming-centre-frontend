import { http } from "../http";

/**
  Endpoint for assessment listing
 * @param {object} params
 *
 * @returns {Promise<{ assessments: Array<{ id: string, name: string, createdAt: Date, noOfUsers: number }> }>}
 */
export const adminGetDepartmentListing = async (params) => {
  const path = `/v1/department/all`;

  const {
    data: { data },
  } = await http.get(path, { params });

  data.rows = data.rows.filter((row) => row.name !== "General");
  return {
    departments: data.rows.map((department) => ({
      id: department.id,
      name: department.name,
      active: department.active,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      noOfusers: department.noOfusers,
    })),
    showingDocumentsCount: data.rows.length,
    totalDocumentsCount: data.rows.length,
  };
};
export const adminDeleteDepartment = async (ids) => {
  const path = `/v1/department/delete`;
  let formattedIds = [];
  for (let i = 0; i < ids.length; i++) {
    formattedIds.push(ids[i].id);
  }

  const body = { departmentsId: formattedIds };
  console.log(body, "body");
  await http.delete(path, { data: body });
};

/**
 * Endpoint for department creation
 * @param {{ name: string, departmentId: string, }} body
 * @returns {Promise<{ message: string, department: { id: string } }>}
 */

// admincreatedepartment 1
export const adminCreateDepartment = async (body) => {
  const path = "/v1/department/create";

  const {
    data: { message, data },
  } = await http.post(path, body);

  const department = { id: data.id };

  return { message, department };
};


/**
 * Endpoint to add selected users to a department
 * @param {string} departmentId
 * @param {Array<string>} userIds
 * @returns {Promise<{ message: string, data: object }>}
 */
export const adminAddSelectedUsersToDepartment = async (departmentId, userIds) => {
  const path = `/v1/department/${departmentId}/add-selected-users`;

  const {
    data: { message, data },
  } = await http.post(path, { userIds });

  return { message, data };
};

/**
 * Endpoint to bulk add users to a department via file upload
 * @param {string} departmentId
 * @param {Array<object>} users - Array of user objects with email field
 * @returns {Promise<{ message: string, data: object }>}
 */
export const adminBulkAddUsersToDepartment = async (departmentId, users) => {
  const path = `/v1/department/${departmentId}/bulk-add-users`;

  const {
    data: { message, data },
  } = await http.post(path, { users });

  return { message, data };
};

/**
 * Endpoint to fetch supervisors across all departments (used when a poll,
 * workflow, etc. targets "all departments" rather than a single one).
 * @returns {Promise<{ supervisors: Array<{ id: string, firstName: string, lastName: string }> }>}
 */
export const adminGetAllDepartmentSupervisors = async () => {
  const path = `/v1/department/supervisors/all`;

  const {
    data: { data },
  } = await http.get(path);

  const raw = data?.rows ?? data ?? [];
  return { supervisors: (Array.isArray(raw) ? raw : []).map(normalizeSupervisor) };
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

/**
 * Endpoint to for admin to create a department
 * @param {object} params
 *
 * @param {{ title: string, departmentId: string}}
 *
 * @returns {Promise<{ message: string, departments: Array<{ id: string, firstName: string, lastName: string, email: string, userRoleId: string,departmentId: string }>}>}
 */
export const adminGetDepartmentUsersListing = async (departmentId, params) => {
  const path = `/v1/department/users/${departmentId}`;

  const {
    data: { message, data },
  } = await http.get(path, { params });

  return {
    message,
    users: data.rows.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userRoleId: user.userRoleId,
      departmentId: user.departmentId,
      userRoleName: user.userRole.name,
    })),
    showingDocumentsCount: data.rows.length,
    totalDocumentsCount: data.rows.length,
  };
};
