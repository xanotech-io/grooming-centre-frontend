import { http } from "../http";

const BASE = "/v1/student-progress-v2";

// ── Student (self-service) ────────────────────────────────────────────────────

export const getMyProgress = async () => {
  const { data: { data } } = await http.get(`${BASE}/progress/me`);
  return data;
};

export const getMyProgressForCourse = async (courseId) => {
  const { data: { data } } = await http.get(`${BASE}/progress/me/course/${courseId}`);
  return data;
};

export const getMyKpis = async () => {
  const { data: { data } } = await http.get(`${BASE}/kpis/me`);
  return data;
};

export const getMyActivity = async () => {
  const { data: { data } } = await http.get(`${BASE}/activity/me`);
  return data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminGetStudentProgressV2 = async (studentId) => {
  const { data: { data } } = await http.get(`${BASE}/progress/${studentId}`);
  return data;
};

export const adminGetStudentProgressV2Course = async (studentId, courseId) => {
  const { data: { data } } = await http.get(`${BASE}/progress/${studentId}/course/${courseId}`);
  return data;
};

export const adminGetStudentKpisV2 = async (studentId) => {
  const { data: { data } } = await http.get(`${BASE}/kpis/${studentId}`);
  return data;
};

export const adminGetStudentActivityV2 = async (studentId) => {
  const { data: { data } } = await http.get(`${BASE}/activity/${studentId}`);
  return data;
};

export const adminGetTrainingReport = async (studentId) => {
  const { data: { data } } = await http.get(`${BASE}/training-report/${studentId}`);
  return data;
};
