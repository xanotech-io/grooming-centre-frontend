import axios from "axios";
import { http } from "../http";

/**
  Endpoint for assessment listing
 * @param {object} params
 *
 * @returns {Promise<{ assessments: Array<{ id: string, name: string, createdAt: Date, noOfUsers: number }> }>}
 */
export const adminGetDepartmentListing = async (params) => {
  const path = `/department/all`;

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
  const path = `/department/delete`;
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
  const path = "/department/create";

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
  const path = `/department/${departmentId}/add-selected-users`;

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
  const path = `/department/${departmentId}/bulk-add-users`;

  const {
    data: { message, data },
  } = await http.post(path, { users });

  return { message, data };
};

/**
 * Endpoint to for admin to create a department
 * @param {object} params
 *
 * @param {{ title: string, departmentId: string}}
 *
 * @returns {Promise<{ message: string, departments: Array<{ id: string, firstName: string, lastName: string, email: string, userRoleId: string,departmentId: string }>}>}
 */
export const adminGetDepartmentUsersListing = async (departmentId, params) => {
  const path = `/department/users/${departmentId}`;

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
