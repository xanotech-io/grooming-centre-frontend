import { http } from '../http';

export const submitExamMarking = async (examId, body) => {
  const { data: { message, data } } = await http.post(`/v1/exam-marking/submit/${examId}`, body);
  return { message, data };
};

export const examManualGrade = async (body) => {
  const { data: { message, data } } = await http.post('/v1/exam-marking/manual-grade', body);
  return { message, data };
};

export const getExamMarkingResult = async (examId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/result/${examId}`);
  return { result: data };
};

export const getStudentExamMarkingResult = async (examId, studentId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/result/${examId}/student/${studentId}`);
  return { result: data };
};

export const getAllExamMarkingResults = async (examId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/results/${examId}`);
  return { results: Array.isArray(data) ? data : [] };
};

export const getExamMarkingAnalytics = async (examId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/analytics/${examId}`);
  return { analytics: data ?? {} };
};

export const getExamPendingManualGrades = async (examId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/pending-manual-grades/${examId}`);
  return { pending: Array.isArray(data) ? data : [] };
};

export const getExamSubmissions = async (examId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/submitted/${examId}`);
  return { submissions: Array.isArray(data) ? data : [] };
};

export const getExamAnswerSheet = async (examId, studentId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/answer-sheet/${examId}/student/${studentId}`);
  return { sheet: data };
};

export const submitRemarkRequest = async (body) => {
  const { data: { message, data } } = await http.post('/v1/exam-marking/remark-request', body);
  return { message, data };
};

export const getExamRemarkRequests = async (examId) => {
  const { data: { data } } = await http.get(`/v1/exam-marking/remark-requests/${examId}`);
  return { requests: Array.isArray(data) ? data : [] };
};

export const reviewExamRemarkRequest = async (requestId, body) => {
  const { data: { message, data } } = await http.patch(`/v1/exam-marking/remark-request/${requestId}`, body);
  return { message, data };
};
