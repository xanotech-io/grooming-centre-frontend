import { http } from "../http";

const BASE = "/v1/assessment-analytics-v2";

export const getAssessmentAnalyticsReport = async (params) => {
  const { data } = await http.get(`${BASE}/report`, { params });
  return data;
};

// GET /api/v1/assessment-analytics-v2/report/export
export const exportAssessmentAnalyticsReport = async (params) => {
  const response = await http.get(`${BASE}/report/export`, {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const getAssessmentAnalyticsByExam = async (examId, params) => {
  const { data } = await http.get(`${BASE}/exam/${examId}`, { params });
  return data;
};

export const getAssessmentAnalyticsThresholds = async () => {
  const { data } = await http.get(`${BASE}/thresholds`);
  return data;
};
