import { http } from "../http";

const BASE = "/v1/exam-integrity-v2";

export const getExamIntegrityList = async (params) => {
  const { data } = await http.get(`${BASE}/exams`, { params });
  return data;
};

export const getExamIntegrityDetail = async (examId) => {
  const { data } = await http.get(`${BASE}/exams/${examId}`);
  return data;
};

export const getExamIrregularityLogs = async (examId, params) => {
  const { data } = await http.get(`${BASE}/exams/${examId}/irregularity-logs`, { params });
  return data;
};

export const getExamIntegrityChartData = async (params) => {
  const { data } = await http.get(`${BASE}/chart-data`, { params });
  return data;
};
