import { http } from "../..";

/**
 * Endpoint to delete user
 * @param {string} id
 *
 * @returns {Promise<void>}
 */
export const adminDeleteUser = async (id) => {
  const path = `/v1/user/delete/${id}`;

  await http.delete(path);
};
export const adminDeleteMultipleUsers = async (ids) => {
  const path = `/v1/admin/delete/user/multiple`;
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
  const path = `/v1/admin/users`;

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
      userRoleId: user.userRole?.id,
      active: user.active,
      userRoleName: user.userRole?.name,
      departmentId: user.departments?.[0]?.id,
      gender: user.gender,
      departmentName: user.departments?.[0]?.name,
      departmentNames: user.departments?.map((dept) => dept.name) ?? [],
      departmentNumber: user.departments?.length ?? 0,
      certificates: user.certificates,
      gradePoint: user.averageGradeScore,
      noOfCertificate: user.noOfCertificate,
    })),
    showingDocumentsCount: data.rows.length,
    totalDocumentsCount: data.count,
  };
};

// `/v1/admin/users` doesn't reliably honour `search`/`role`, so matching is
// done client-side against a one-time full user list.
let allUsersPromise = null;
const getAllUsers = () => {
  if (!allUsersPromise) {
    allUsersPromise = adminGetUserListing({ limit: 1000 })
      .then((res) => res.users ?? [])
      .catch(() => {
        allUsersPromise = null;
        return [];
      });
  }
  return allUsersPromise;
};

const matchUsers = (users, query, studentsOnly) => {
  const q = query?.trim().toLowerCase() ?? "";
  return users.filter((u) => {
    if (studentsOnly && /admin|instructor/i.test(u.userRoleName ?? ""))
      return false;
    if (!q) return true;
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
    return (
      name.includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.displayId?.toString().toLowerCase().includes(q)
    );
  });
};

// Full lists for the paginated user tables, keyed by the server-side params
// (role, grade, sort) so typing in the search box doesn't refetch.
const fullListingCache = new Map();
const getFullListing = (serverParams) => {
  const key = JSON.stringify(serverParams);
  if (!fullListingCache.has(key)) {
    fullListingCache.set(
      key,
      adminGetUserListing({ ...serverParams, page: 1, limit: 1000 }).catch(
        (err) => {
          fullListingCache.delete(key);
          throw err;
        }
      )
    );
  }
  return fullListingCache.get(key);
};

/**
 * `adminGetUserListing` for the admin user tables. `search` and `department`
 * (comma-separated names) are matched client-side, since the server doesn't
 * honour them reliably and users can belong to several departments.
 * @param {object} [params]
 *
 * @returns {Promise<{ users: UserListArray, showingDocumentsCount: number, totalDocumentsCount: number }>}
 */
export const adminFilterUserListing = async (params = {}) => {
  const { search, department, page, limit, ...serverParams } = params;

  if (!search?.trim() && !department) {
    fullListingCache.clear();
    return adminGetUserListing(params);
  }

  const departments = department
    ? department.split(",").map((name) => name.trim().toLowerCase())
    : [];

  const { users } = await getFullListing(serverParams);
  const matches = matchUsers(users, search, false).filter(
    (u) =>
      !departments.length ||
      u.departmentNames.some((name) =>
        departments.includes(name?.toLowerCase())
      )
  );

  const pageSize = Number(limit) || matches.length || 1;
  const start = ((Number(page) || 1) - 1) * pageSize;
  const pageUsers = matches.slice(start, start + pageSize);

  return {
    users: pageUsers,
    showingDocumentsCount: pageUsers.length,
    totalDocumentsCount: matches.length,
  };
};

/**
 * Search users by name / email / displayId for search-as-you-type pickers.
 * @param {string} query
 * @param {{ limit?: number, studentsOnly?: boolean }} [options]
 *
 * @returns {Promise<UserListArray>}
 */
export const adminSearchUsers = async (
  query,
  { limit = 20, studentsOnly = true } = {}
) => {
  let matches = matchUsers(await getAllUsers(), query, studentsOnly);
  // Users beyond the cached list may still be found if the server does search.
  if (!matches.length && query?.trim()) {
    try {
      const res = await adminGetUserListing({ search: query, limit });
      matches = matchUsers(res.users ?? [], query, studentsOnly);
    } catch {
      matches = [];
    }
  }

  return matches.slice(0, limit);
};

/**
 * Endpoint to get `user-details` for an admin
 * @param {string} id - userId
 *
 * @returns {Promise<{ user: User }>}
 */
export const adminGetUserDetails = async (id) => {
  const path = `/v1/admin/users/${id}`;

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
  const path = `/v1/admin/edit/user/${userId}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const user = {
    id: data[0].id,
  };

  return { message, user };
};

/**
 * Endpoint for a super admin to reset another user's password.
 * Requires the requester's own current password as a step-up confirmation.
 * @param {string} userId - target user's id
 * @param {string} currentPassword - requester's own current password
 *
 * @returns {Promise<{ userId: string, newPassword: string }>}
 */
export const adminResetUserPassword = async (userId, currentPassword) => {
  const path = `/v1/admin/users/${userId}/reset-password`;

  const {
    data: { data },
  } = await http.patch(path, { currentPassword });

  return { userId: data.userId, newPassword: data.newPassword };
};

/**
 * Endpoint for a super admin to deactivate a user account.
 * A deactivated user is blocked at login server-side.
 * @param {string} userId - target user's id
 * @param {string} [reason] - optional audit note
 *
 * @returns {Promise<{ userId: string, active: boolean }>}
 */
export const adminDeactivateUser = async (userId, reason) => {
  const path = `/v1/admin/users/${userId}/deactivate`;

  const { data: body } = await http.patch(path, reason ? { reason } : undefined);
  // Spec documents `{ userId, active }`; accept it bare or inside the usual `data` envelope
  const result = body?.data ?? body;

  return { userId: result.userId, active: result.active };
};

/**
 * Endpoint for a super admin to reactivate a deactivated user account.
 * @param {string} userId - target user's id
 *
 * @returns {Promise<{ userId: string, active: boolean }>}
 */
export const adminActivateUser = async (userId) => {
  const path = `/v1/admin/users/${userId}/activate`;

  const { data: body } = await http.patch(path);
  // Spec documents `{ userId, active }`; accept it bare or inside the usual `data` envelope
  const result = body?.data ?? body;

  return { userId: result.userId, active: result.active };
};
