import { http } from "../http";

/**
 * TC05 – Compliance & Training Report (legacy)
 * GET /v2/compliance/employees/{employeeId}
 */
export const getComplianceEmployees = async (employeeId, params) => {
  const { data } = await http.get(`/v2/compliance/employees/${employeeId}`, { params });
  return data;
};

// ─── TC15 – Compliance Notifications ─────────────────────────────────────────

const BASE_NOTIF = "/v1/compliance-notifications";
const BASE_TRAINING = "/v1/compliance-training";

export const getComplianceNotificationKpis = async () => {
  const { data } = await http.get(`${BASE_NOTIF}/kpis`);
  return data;
};

export const getComplianceNotifications = async (params) => {
  const { data } = await http.get(BASE_NOTIF, { params });
  return data;
};

export const getComplianceNotificationById = async (id) => {
  const { data } = await http.get(`${BASE_NOTIF}/${id}`);
  return data;
};

export const getComplianceNotificationReport = async (params) => {
  const { data } = await http.get(`${BASE_NOTIF}/report`, { params });
  return data;
};

export const sendComplianceNotification = async (body) => {
  const { data } = await http.post(`${BASE_NOTIF}/send`, body);
  return data;
};

export const evaluateComplianceNotifications = async (body) => {
  const { data } = await http.post(`${BASE_NOTIF}/evaluate`, body);
  return data;
};

export const resendComplianceNotification = async (id) => {
  const { data } = await http.post(`${BASE_NOTIF}/${id}/resend`);
  return data;
};

export const escalateComplianceNotification = async (id, body) => {
  const { data } = await http.post(`${BASE_NOTIF}/${id}/escalate`, body);
  return data;
};

export const getMyComplianceNotifications = async (params) => {
  const { data } = await http.get(`${BASE_NOTIF}/my-notifications`, { params });
  return data;
};

// ─── TC15 – Compliance Training Assignments ───────────────────────────────────

export const assignComplianceTraining = async (body) => {
  const { data } = await http.post(`${BASE_TRAINING}/assign`, body);
  return data;
};

export const completeComplianceTraining = async (assignmentId, body) => {
  const { data } = await http.patch(`${BASE_TRAINING}/complete/${assignmentId}`, body);
  return data;
};

export const getComplianceTrainingReport = async (params) => {
  const { data } = await http.get(`${BASE_TRAINING}/report`, { params });
  return data;
};

export const getComplianceTrainingByUser = async (userId) => {
  const { data } = await http.get(`${BASE_TRAINING}/user/${userId}`);
  return data;
};
