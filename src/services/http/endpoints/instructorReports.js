import { http } from "../http";

export const adminGetInstructorReportDirectory = async (params = {}) => {
  const { data } = await http.get('/v2/instructors', { params });
  return data?.data ?? data;
};

export const adminGetInstructorCourseCompletionReport = async (instructorId, params = {}) => {
  const { data } = await http.get(`/v2/instructors/${instructorId}/courses/completion`, { params });
  return data?.data ?? data;
};

export const adminGetInstructorPerformanceReport = async (instructorId, params = {}) => {
  const { data } = await http.get(`/v2/instructors/${instructorId}/performance`, { params });
  return data?.data ?? data;
};

export const adminGetInstructorGradingSummaryReport = async (instructorId, params = {}) => {
  const { data } = await http.get(`/v2/instructors/${instructorId}/grading-summary`, { params });
  return data?.data ?? data;
};

export const adminGetAssessmentItemAnalysisReport = async (assessmentId, params = {}) => {
  const { data } = await http.get(`/v2/assessments/${assessmentId}/analytics`, { params });
  return data?.data ?? data;
};

export const adminFlagAssessmentQuestionForReview = async (assessmentId, payload) => {
  const { data } = await http.post(`/v2/assessments/${assessmentId}/questions/flag`, payload);
  return { message: data?.message, data: data?.data ?? data };
};

export const adminBulkFlagAssessmentQuestionsForReview = async (assessmentId, payload) => {
  const { data } = await http.post(`/v2/assessments/${assessmentId}/questions/bulk-flag`, payload);
  return { message: data?.message, data: data?.data ?? data };
};

export const getInstructorCourseCompletion = adminGetInstructorCourseCompletionReport;
export const getInstructorPerformance = adminGetInstructorPerformanceReport;
export const getInstructorGradingSummary = adminGetInstructorGradingSummaryReport;
export const getAssessmentAnalytics = adminGetAssessmentItemAnalysisReport;
export const flagAssessmentQuestion = adminFlagAssessmentQuestionForReview;
export const bulkFlagAssessmentQuestions = adminBulkFlagAssessmentQuestionsForReview;
export const getInstructorReportDirectory = adminGetInstructorReportDirectory;

// ─── V2 Instructor Performance ─────────────────────────────────────────────────

const BASE_V2 = "/v1/instructor-performance-v2";

export const getInstructorPerformanceReportV2 = async (params) => {
  const { data } = await http.get(`${BASE_V2}/report`, { params });
  return data;
};

export const getInstructorPerformanceDrillDown = async (instructorId, params) => {
  const { data } = await http.get(`${BASE_V2}/report/${instructorId}`, { params });
  return data;
};
