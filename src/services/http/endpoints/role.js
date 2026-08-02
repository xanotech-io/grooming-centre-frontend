import { http } from '../http';

export const adminGetRoles = async (params = {}) => {
  const { data } = await http.get('/v1/access-roles-v2/roles', { params });
  const d = data?.data ?? {};
  return {
    roles: d.roles ?? d.rows ?? (Array.isArray(d) ? d : []),
    total: d.total ?? d.count ?? 0,
  };
};

export const adminGetRoleKPIs = async (params = {}) => {
  const { data } = await http.get('/v1/access-roles-v2/kpis', { params });
  return data?.data ?? {};
};

export const adminGetRoleHistory = async (params = {}) => {
  const { data } = await http.get('/v1/access-roles-v2/history', { params });
  const d = data?.data ?? {};
  return {
    history: d.history ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

export const adminGetRoleSecurityReport = async (params = {}) => {
  const { data } = await http.get('/v1/access-roles-v2/report', { params });
  const d = data?.data ?? {};
  return {
    report: d.report ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

export const adminGetUsersInRole = async (roleId, params = {}) => {
  const { data } = await http.get(`/v1/access-roles-v2/roles/${roleId}/users`, { params });
  const d = data?.data ?? {};
  return {
    users: d.users ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

export const adminAssignUserRole = async (userId, body) => {
  const { data } = await http.put(`/v1/access-roles-v2/users/${userId}/role`, body);
  return { message: data?.message, data: data?.data ?? data };
};

export const adminToggleRoleStatus = async (roleId, active) => {
  const { data } = await http.patch(`/v1/access-roles-v2/roles/${roleId}/status`, { active });
  return { message: data?.message, data: data?.data ?? data };
};
