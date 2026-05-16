import { http } from '../http';

export const gradeBookV2Setup = async (body) => {
  const { data: { data } } = await http.post('/v1/grade-book-v2/setup', body);
  return { gradeBook: data };
};

export const gradeBookV2Update = async (gradebookId, body) => {
  const { data: { data } } = await http.put(`/v1/grade-book-v2/${gradebookId}`, body);
  return { gradeBook: data };
};

export const gradeBookV2GetById = async (gradebookId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}`);
  return { gradeBook: data };
};

export const gradeBookV2GetByCourse = async (courseId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/course/${courseId}`);
  return { gradeBook: data };
};

export const gradeBookV2AddEntry = async (gradebookId, body) => {
  const { data: { data } } = await http.post(`/v1/grade-book-v2/${gradebookId}/entries`, body);
  return { entry: data };
};

export const gradeBookV2UpdateEntry = async (gradebookId, entryId, body) => {
  const { data: { data } } = await http.put(`/v1/grade-book-v2/${gradebookId}/entries/${entryId}`, body);
  return { entry: data };
};

export const gradeBookV2DeleteEntry = async (gradebookId, entryId) => {
  await http.delete(`/v1/grade-book-v2/${gradebookId}/entries/${entryId}`);
};

export const gradeBookV2GetMyGrades = async (gradebookId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/my-grades`);
  return { breakdown: data };
};

export const gradeBookV2GetStudentGrades = async (gradebookId, studentId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/student/${studentId}`);
  return { breakdown: data };
};

export const gradeBookV2GetAnalytics = async (gradebookId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/analytics`);
  return { analytics: data };
};

export const gradeBookV2GetReport = async (gradebookId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/report`);
  return { report: data };
};

export const gradeBookV2Finalize = async (gradebookId) => {
  const { data: { data } } = await http.post(`/v1/grade-book-v2/${gradebookId}/finalize`);
  return { result: data };
};

export const gradeBookV2Publish = async (gradebookId) => {
  const { data: { data } } = await http.post(`/v1/grade-book-v2/${gradebookId}/publish`);
  return { result: data };
};

export const gradeBookV2GetAudit = async (gradebookId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/audit`);
  return { audit: data ?? [] };
};

export const gradeBookV2Sync = async (gradebookId) => {
  const { data: { data } } = await http.post(`/v1/grade-book-v2/${gradebookId}/sync`);
  return { result: data };
};

export const gradeBookV2AdjustEntry = async (gradebookId, entryId, body) => {
  const { data: { data } } = await http.patch(`/v1/grade-book-v2/${gradebookId}/entries/${entryId}/adjust`, body);
  return { entry: data };
};

export const gradeBookV2Export = async (gradebookId, format = "Excel") => {
  const response = await http.get(`/v1/grade-book-v2/${gradebookId}/export`, {
    params: { format },
    responseType: "blob",
  });
  return response.data;
};
