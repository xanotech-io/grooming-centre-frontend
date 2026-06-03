import { http } from '../http';

// NOTE: The old API used a "marking jobs" concept (/v2/examination-marking/jobs)
// which does not exist in the real API. The functions below are forward-mapped
// to the closest real endpoints. The pages that use these should be refactored
// to call the real functions directly with examId instead of jobId.

export const adminSubmitExamMarking = async (examId, body) => {
  const { data } = await http.post(`/v1/exam-marking/submit/${examId}`, body);
  return { message: data?.message, result: data?.data ?? data };
};

export const adminSubmitManualGrade = async (body) => {
  const { data } = await http.post('/v1/exam-marking/manual-grade', body);
  return { message: data?.message, result: data?.data ?? data };
};

export const adminGetExamResult = async (examId) => {
  const { data } = await http.get(`/v1/exam-marking/result/${examId}`);
  return { result: data?.data ?? data };
};

export const adminGetStudentExamResult = async (examId, studentId) => {
  const { data } = await http.get(`/v1/exam-marking/result/${examId}/student/${studentId}`);
  return { result: data?.data ?? data };
};

export const adminGetExamResults = async (examId, params = {}) => {
  const { data } = await http.get(`/v1/exam-marking/results/${examId}`, { params });
  const d = data?.data ?? {};
  return {
    results: d.rows ?? d.results ?? (Array.isArray(d) ? d : []),
    total: d.count ?? d.total ?? 0,
  };
};

export const adminGetExamMarkingAnalytics = async (examId) => {
  const { data } = await http.get(`/v1/exam-marking/analytics/${examId}`);
  return { analytics: data?.data ?? data };
};

export const adminGetPendingManualGrades = async (examId, params = {}) => {
  const { data } = await http.get(`/v1/exam-marking/pending-manual-grades/${examId}`, { params });
  const d = data?.data ?? {};
  return {
    pending: d.rows ?? d.pending ?? (Array.isArray(d) ? d : []),
    total: d.count ?? d.total ?? 0,
  };
};

export const adminGetSubmittedExams = async (examId, params = {}) => {
  const { data } = await http.get(`/v1/exam-marking/submitted/${examId}`, { params });
  const d = data?.data ?? {};
  return {
    submissions: d.rows ?? d.submissions ?? (Array.isArray(d) ? d : []),
    total: d.count ?? d.total ?? 0,
  };
};

export const adminGetStudentAnswerSheet = async (examId, studentId) => {
  const { data } = await http.get(`/v1/exam-marking/answer-sheet/${examId}/student/${studentId}`);
  return { answerSheet: data?.data ?? data };
};

export const adminCreateRemarkRequest = async (body) => {
  const { data } = await http.post('/v1/exam-marking/remark-request', body);
  return { message: data?.message, request: data?.data ?? data };
};

export const adminGetRemarkRequests = async (examId, params = {}) => {
  const { data } = await http.get(`/v1/exam-marking/remark-requests/${examId}`, { params });
  const d = data?.data ?? {};
  return {
    requests: d.rows ?? d.requests ?? (Array.isArray(d) ? d : []),
    total: d.count ?? d.total ?? 0,
  };
};

export const adminUpdateRemarkRequest = async (requestId, body) => {
  const { data } = await http.patch(`/v1/exam-marking/remark-request/${requestId}`, body);
  return { message: data?.message, request: data?.data ?? data };
};

// ---------------------------------------------------------------------------
// Backward-compat aliases — pages not yet migrated away from "jobs" concept
// ---------------------------------------------------------------------------
export const adminGetMarkingJobs = (params) => adminGetExamResults('all', params);
export const adminGetMarkingJobDetails = (examId) => adminGetExamResult(examId);
export const adminGetMarkingJobStatistics = (examId) => adminGetExamMarkingAnalytics(examId);
export const adminGetExaminationPapers = (examId, params) => adminGetSubmittedExams(examId, params);
export const adminSubmitMarkedPapers = (examId, body) => adminSubmitExamMarking(examId, body);
export const adminCreateMarkingJob = (body) => adminSubmitManualGrade(body);
// adminGetPaperForMarking and adminMarkPaper need examId+studentId — pages must be updated
export const adminGetPaperForMarking = (examId) => adminGetExamResult(examId);
export const adminMarkPaper = (_paperId, body) => adminSubmitManualGrade(body);
