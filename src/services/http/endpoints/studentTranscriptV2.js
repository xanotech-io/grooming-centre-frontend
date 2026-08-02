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

/**
 * View the certificate issued for a student's course on their transcript.
 * GET /v1/student-transcript-v2/{transcriptId}/course/{courseId}/certificate
 * 404s if none has been issued yet.
 */
export const getTranscriptCourseCertificate = async (transcriptId, courseId) => {
  const { data } = await http.get(`${BASE}/${transcriptId}/course/${courseId}/certificate`);
  return data;
};

/**
 * Manually issue/override-generate a certificate for a course on a transcript,
 * for when auto-generation on completion didn't fire.
 * POST /v1/student-transcript-v2/{transcriptId}/course/{courseId}/certificate/generate
 * Body: { certificateType } — defaults to "Completion" server-side.
 * 422s if the student hasn't reached 100% course progress.
 */
export const generateTranscriptCourseCertificate = async (transcriptId, courseId, body = {}) => {
  const { data } = await http.post(`${BASE}/${transcriptId}/course/${courseId}/certificate/generate`, body);
  return data;
};
