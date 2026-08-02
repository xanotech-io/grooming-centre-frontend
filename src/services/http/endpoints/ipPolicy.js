import { http } from "../http";

const BASE = "/v1/ip-policy-v2";

export const listIpPolicies = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const getActiveIpPolicy = async () => {
  const { data } = await http.get(`${BASE}/active`);
  return data;
};

export const getIpPolicyKpis = async (params) => {
  const { data } = await http.get(`${BASE}/kpis`, { params });
  return data;
};

export const getIpAuthLogs = async (params) => {
  const { data } = await http.get(`${BASE}/logs`, { params });
  return data;
};

export const checkIpAccess = async (params) => {
  const { data } = await http.get(`${BASE}/check`, { params });
  return data;
};

export const getIpPolicy = async (policyId) => {
  const { data } = await http.get(`${BASE}/${policyId}`);
  return data;
};

export const createIpPolicy = async (payload) => {
  const { data } = await http.post(BASE, payload);
  return data;
};

export const updateIpPolicy = async (policyId, payload) => {
  const { data } = await http.patch(`${BASE}/${policyId}`, payload);
  return data;
};

export const deleteIpPolicy = async (policyId) => {
  const { data } = await http.delete(`${BASE}/${policyId}`);
  return data;
};

export const activateIpPolicy = async (policyId) => {
  const { data } = await http.post(`${BASE}/${policyId}/activate`);
  return data;
};

export const deactivateIpPolicy = async (policyId) => {
  const { data } = await http.post(`${BASE}/${policyId}/deactivate`);
  return data;
};

export const requestIpException = async (payload) => {
  const { data } = await http.post(`${BASE}/exceptions`, payload);
  return data;
};

export const listIpExceptions = async (params) => {
  const { data } = await http.get(`${BASE}/exceptions`, { params });
  return data;
};

export const getMyIpExceptions = async (params) => {
  const { data } = await http.get(`${BASE}/exceptions/my-requests`, { params });
  return data;
};

export const reviewIpException = async (exceptionId, payload) => {
  const { data } = await http.patch(`${BASE}/exceptions/${exceptionId}/review`, payload);
  return data;
};
