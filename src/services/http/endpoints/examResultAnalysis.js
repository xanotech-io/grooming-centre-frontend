import { http } from "../http";

export const adminGetCombinedExamAnalysisListing = async (params = {}) => {
  const response = await http.get(`/v1/exam-result-analysis-v2/combined`, { params });
  return response?.data;
};

export const studentGetExamResultAnalysis = async (examId, params = {}) => {
  const response = await http.get(`/v1/exam-result-analysis-v2/${examId}/student`, { params });
  return response?.data;
};

export const adminGetStudentExamResultAnalysis = async (examId, studentId, params = {}) => {
  const response = await http.get(`/v1/exam-result-analysis-v2/${examId}/student/${studentId}`, { params });
  return response?.data;
};

export const adminGetExamCohortKpis = async (examId, params = {}) => {
  const response = await http.get(`/v1/exam-result-analysis-v2/${examId}/cohort`, { params });
  return response?.data;
};

export const adminGetExamLeaderboard = async (examId, params = {}) => {
  const response = await http.get(`/v1/exam-result-analysis-v2/${examId}/leaderboard`, { params });
  return response?.data;
};

export const adminGetExamChartData = async (examId) => {
  const response = await http.get(`/v1/exam-result-analysis-v2/${examId}/chart-data`);
  return response?.data;
};

export const adminGetExamFullReport = async (examId, params = {}) => {
  const response = await http.get(`/v1/exam-result-analysis-v2/${examId}/report`, { params });
  return response?.data;
};
