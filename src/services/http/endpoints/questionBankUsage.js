import { http } from "../http";

const BASE = "/v1/question-bank-v2";

export const getQuestionBankSummary = async (params) => {
  const { data } = await http.get(`${BASE}/summary`, { params });
  return data;
};

export const getQuestionBankList = async (params) => {
  const { data } = await http.get(`${BASE}/questions`, { params });
  return data;
};

export const getQuestionBankDetail = async (questionId) => {
  const { data } = await http.get(`${BASE}/questions/${questionId}`);
  return data;
};

export const getQuestionBankChartData = async (params) => {
  const { data } = await http.get(`${BASE}/chart-data`, { params });
  return data;
};
