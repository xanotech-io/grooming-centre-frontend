import { http } from '../http';

export const gradeBookV2Setup = async (body) => {
  const { data: { data } } = await http.post('/v1/grade-book-v2/setup', body);
  return { gradeBook: data };
};

export const gradeBookV2List = async (params) => {
  const { data: { data } } = await http.get('/v1/grade-book-v2', { params });
  const { total, page, limit, gradebooks } = data;
  return { total, page, limit, gradebooks: gradebooks ?? [] };
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

export const gradeBookV2GetCourses = async (gradebookId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/courses`);
  return { courses: data ?? [] };
};

export const gradeBookV2Attach = async (courseId, gradebookId) => {
  const { data: { data } } = await http.patch(`/v1/grade-book-v2/course/${courseId}/attach`, { gradebookId });
  return { course: data };
};

export const gradeBookV2Detach = async (courseId) => {
  const { data: { data } } = await http.patch(`/v1/grade-book-v2/course/${courseId}/detach`);
  return { course: data };
};

export const gradeBookV2Archive = async (gradebookId) => {
  const { data: { data } } = await http.patch(`/v1/grade-book-v2/${gradebookId}/archive`);
  return { gradeBook: data };
};

export const gradeBookV2Unarchive = async (gradebookId) => {
  const { data: { data } } = await http.patch(`/v1/grade-book-v2/${gradebookId}/unarchive`);
  return { gradeBook: data };
};

export const gradeBookV2AddEntry = async (gradebookId, courseId, body) => {
  const { data: { data } } = await http.post(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/entries`, body);
  return { entry: data };
};

export const gradeBookV2UpdateEntry = async (gradebookId, courseId, entryId, body) => {
  const { data: { data } } = await http.put(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/entries/${entryId}`, body);
  return { entry: data };
};

export const gradeBookV2DeleteEntry = async (gradebookId, courseId, entryId) => {
  await http.delete(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/entries/${entryId}`);
};

export const gradeBookV2GetMyGrades = async (gradebookId, courseId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/my-grades`);
  return { breakdown: data };
};

export const gradeBookV2GetStudentGrades = async (gradebookId, courseId, studentId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/student/${studentId}`);
  return { breakdown: data };
};

export const gradeBookV2GetAnalytics = async (gradebookId, courseId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/analytics`);
  return { analytics: data };
};

export const gradeBookV2GetReport = async (gradebookId, courseId) => {
  const { data: { data } } = await http.get(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/report`);
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

export const gradeBookV2Sync = async (gradebookId, courseId) => {
  const { data: { data } } = await http.post(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/sync`);
  return { result: data };
};

export const gradeBookV2AdjustEntry = async (gradebookId, courseId, entryId, body) => {
  const { data: { data } } = await http.patch(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/entries/${entryId}/adjust`, body);
  return { entry: data };
};

export const gradeBookV2Export = async (gradebookId, courseId, format = "Excel") => {
  const response = await http.get(`/v1/grade-book-v2/${gradebookId}/course/${courseId}/export`, {
    params: { format },
    responseType: "blob",
  });
  return response.data;
};
