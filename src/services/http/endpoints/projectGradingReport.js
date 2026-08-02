import { http } from "../http";

const BASE = "/v1/project-grading-v2";

export const getProjectGradingSummary = async (params) => {
  const { data } = await http.get(`${BASE}/summary`, { params });
  return data;
};

export const getProjectGradingReport = async (params) => {
  const { data } = await http.get(`${BASE}/report`, { params });
  return data;
};

export const getProjectGradingDetail = async (projectId) => {
  const { data } = await http.get(`${BASE}/report/${projectId}`);
  return data;
};
