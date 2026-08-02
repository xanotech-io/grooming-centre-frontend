import { http } from "../http";

const BASE = "/v1/inline-markup-v2";

export const getDepartmentStudents = () => http.get("/v1/department/my-students");

export const createMarkup = (data) => http.post(BASE, data);
export const getSubmissionMarkups = (submissionId, params) => http.get(`${BASE}/submission/${submissionId}`, { params });
export const getSubmissionSummary = (submissionId) => http.get(`${BASE}/submission/${submissionId}/summary`);
export const publishAllDrafts = (submissionId) => http.post(`${BASE}/submission/${submissionId}/publish-all`);
export const archiveSubmissionMarkups = (submissionId, data) => http.post(`${BASE}/submission/${submissionId}/archive`, data);
export const getMarkup = (markupId) => http.get(`${BASE}/${markupId}`);
export const editMarkup = (markupId, data) => http.patch(`${BASE}/${markupId}`, data);
export const deleteMarkup = (markupId) => http.delete(`${BASE}/${markupId}`);
export const updateMarkupStatus = (markupId, status) => http.patch(`${BASE}/${markupId}/status`, { status });
export const replyToMarkup = (markupId, data) => http.post(`${BASE}/${markupId}/reply`, data);
