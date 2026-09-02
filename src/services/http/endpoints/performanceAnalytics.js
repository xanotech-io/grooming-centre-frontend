import { http } from "../http";

// GET /api/v1/performance-analytics-v2/report/export
export const exportPerformanceAnalyticsReport = async (params = {}) => {
  const response = await http.get("/v1/performance-analytics-v2/report/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};
