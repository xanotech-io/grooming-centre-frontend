import { http } from "../http";

// GET /api/v1/visual-analytics-v2/thresholds
export const getVisualAnalyticsThresholds = async () => {
  const response = await http.get("/v1/visual-analytics-v2/thresholds");
  return response?.data;
};

// GET /api/v1/visual-analytics-v2/dashboard
export const getVisualAnalyticsDashboard = async (params = {}) => {
  const response = await http.get("/v1/visual-analytics-v2/dashboard", { params });
  return response?.data;
};

// GET /api/v1/visual-analytics-v2/report
export const getVisualAnalyticsReport = async (params = {}) => {
  const response = await http.get("/v1/visual-analytics-v2/report", { params });
  return response?.data;
};

// GET /api/v1/visual-analytics-v2/report/export
export const exportVisualAnalyticsReport = async (params = {}) => {
  const response = await http.get("/v1/visual-analytics-v2/report/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};

// GET /api/v1/visual-analytics-v2/report/{studentId}
export const getVisualAnalyticsStudentReport = async (studentId, params = {}) => {
  const response = await http.get(`/v1/visual-analytics-v2/report/${studentId}`, { params });
  return response?.data;
};
