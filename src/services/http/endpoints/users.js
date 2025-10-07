import { http } from "../..";

/**
 * Endpoint to delete user
 * @param {string} id
 *
 * @returns {Promise<void>}
 */
export const adminDeleteUser = async (id) => {
  const path = `/user/delete/${id}`;

  await http.delete(path);
};
export const adminDeleteMultipleUsers = async (ids) => {
  const path = `/admin/delete/user/multiple`;
  let formattedIds = [];
  for (let i = 0; i < ids.length; i++) {
    formattedIds.push(ids[i].id);
  }
  const body = { userIds: formattedIds };
  await http.patch(path, body);
};

/**
 * Endpoint to get `user-listing`
 * @param {object} params
 *
 * @returns {Promise<{ data: UserListArray }>}
 */
export const adminGetUserListing = async (params) => {
  const path = `/admin/users`;

  const {
    data: { data },
  } = await http.get(path, { params });

  return {
    users: data.rows.map((user) => ({
      id: user.id,
      displayId: user.displayId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userRoleId: user.userRole.id,
      active: user.active,
      userRoleName: user.userRole.name,
      departmentId: user.departments[0]?.id,
      gender: user.gender,
      departmentName: user.departments[0]?.name,
      departmentNumber: user.departments.length,
      certificates: user.certificates,
      gradePoint: user.averageGradeScore,
      noOfCertificate: user.noOfCertificate,
    })),
    showingDocumentsCount: data.rows.length,
    totalDocumentsCount: data.count,
  };
};

/**
 * Endpoint to get `user-details` for an admin
 * @param {string} id - userId
 *
 * @returns {Promise<{ user: User }>}
 */
export const adminGetUserDetails = async (id) => {
  const path = `/admin/users/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  const deptNames = data.departments.map((dept) => dept.name).join(", ");

  const user = {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    userRoleId: data.userRole.id,
    userRoleName: data.userRole.name,
    departmentId: data.departments[0]?.id,
    gender: data.gender,
    departmentName: deptNames,
    certificates: data.certificates ? data.certificates : "notset",
    gradePoint: data.averageGradeScore ? data.averageGradeScore : 0,
    noOfCertificate: data.certificate ? data.certificate.length : 0,
    completedCourses: data.courseTrackingProgress
      ? data.courseTrackingProgress.length
      : 0,
    completedAssessment: data.assessmentScoreSheets
      ? data.assessmentScoreSheets.length
      : 0,
    phone: data.phone ? data.phone : "notset",
    profilePics: data.profilePics,
    isInviteActive: data.isInviteActive,
    professionalCertification: data.professionalCertification
      ? data.professionalCertification
      : "notset",
  };

  return { user };
};

/**
 * Endpoint for user editing/modification
 * @param {string} userId
 * @param {object} body
 * @returns {Promise<{ message: string, user: { id: string }}>}
 */
export const adminEditUser = async (userId, body) => {
  const path = `/admin/edit/user/${userId}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const user = {
    id: data[0].id,
  };

  return { message, user };
};
