import { http } from "../http";

const BASE = "/v1/email-reminders";

export const createEmailReminder = async (body) => {
  const { data } = await http.post(`${BASE}/create`, body);
  return data;
};

export const getEmailReminders = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const getEmailReminder = async (reminderId) => {
  const { data } = await http.get(`${BASE}/${reminderId}`);
  return data;
};

export const updateEmailReminder = async (reminderId, body) => {
  const { data } = await http.put(`${BASE}/${reminderId}`, body);
  return data;
};

export const cancelEmailReminder = async (reminderId) => {
  const { data } = await http.delete(`${BASE}/${reminderId}`);
  return data;
};

export const sendEmailReminderNow = async (reminderId) => {
  const { data } = await http.post(`${BASE}/${reminderId}/send`);
  return data;
};

export const sendDueEmailReminders = async () => {
  const { data } = await http.post(`${BASE}/send-due`);
  return data;
};

export const getMyEmailReminders = async (params) => {
  const { data } = await http.get(`${BASE}/my-reminders`, { params });
  return data;
};

export const getEmailReminderKpis = async () => {
  const { data } = await http.get(`${BASE}/kpis`);
  return data;
};

export const getEmailReminderReport = async () => {
  const { data } = await http.get(`${BASE}/report`);
  return data;
};
