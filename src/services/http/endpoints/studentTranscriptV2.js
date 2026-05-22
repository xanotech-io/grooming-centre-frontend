import { http } from "../http";

const BASE = "/v1/student-transcript-v2";

export const requestTranscript = async (payload) => {
  const { data } = await http.post(BASE, payload);
  return data;
};

export const listTranscriptRequests = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const getStudentTranscripts = async (studentId) => {
  const { data } = await http.get(`${BASE}/student/${studentId}`);
  return data;
};

export const getTranscript = async (transcriptId) => {
  const { data } = await http.get(`${BASE}/${transcriptId}`);
  return data;
};

export const reviewTranscript = async (transcriptId, payload) => {
  const { data } = await http.patch(`${BASE}/${transcriptId}/review`, payload);
  return data;
};

export const postExamCompletion = async (recordId, payload) => {
  const { data } = await http.patch(`${BASE}/records/${recordId}/post-completion`, payload);
  return data;
};

export const getDepartmentTranscriptAnalytics = async (departmentId) => {
  const { data } = await http.get(`${BASE}/department-analytics/${departmentId}`);
  return data;
};
