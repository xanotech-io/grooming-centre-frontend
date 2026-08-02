import { http } from "../http";

const BASE = "/v1/exam-notifications";

export const getExamNotificationKpis = async () => {
  const { data } = await http.get(`${BASE}/kpis`);
  return data;
};

export const getExamNotifications = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const getExamNotificationById = async (id) => {
  const { data } = await http.get(`${BASE}/${id}`);
  return data;
};

export const getExamNotificationReport = async (params) => {
  const { data } = await http.get(`${BASE}/report`, { params });
  return data;
};

export const sendExamNotification = async (body) => {
  const { data } = await http.post(`${BASE}/send`, body);
  return data;
};

export const bulkNotifyExam = async (body) => {
  const { data } = await http.post(`${BASE}/notify-exam`, body);
  return data;
};

export const resendExamNotification = async (id) => {
  const { data } = await http.post(`${BASE}/${id}/resend`);
  return data;
};

export const getMyExamNotifications = async (params) => {
  const { data } = await http.get(`${BASE}/my-notifications`, { params });
  return data;
};

export const markExamNotificationRead = async (id) => {
  const { data } = await http.put(`${BASE}/${id}/read`);
  return data;
};
