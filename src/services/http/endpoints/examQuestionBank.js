import { http } from "../http";

export const listExamQuestionBank = async (params) => {
  const { data } = await http.get("/v1/exam-question-bank", { params });
  return data;
};

export const createExamQuestionBankItem = async (body) => {
  const { data } = await http.post("/v1/exam-question-bank", body);
  return data;
};

export const getExamQuestionBankItem = async (questionId) => {
  const { data } = await http.get(`/v1/exam-question-bank/${questionId}`);
  return data;
};

export const updateExamQuestionBankItem = async (questionId, body) => {
  const { data } = await http.patch(`/v1/exam-question-bank/${questionId}`, body);
  return data;
};

export const deleteExamQuestionBankItem = async (questionId) => {
  const { data } = await http.delete(`/v1/exam-question-bank/${questionId}`);
  return data;
};

export const bulkUpdateExamQuestionBankStatus = async (body) => {
  const { data } = await http.patch("/v1/exam-question-bank/bulk-status", body);
  return data;
};

export const getExamQuestionBankStats = async () => {
  const { data } = await http.get("/v1/exam-question-bank/stats");
  return data;
};

export const getOrphanedExamQuestionBankMedia = async () => {
  const { data } = await http.get("/v1/exam-question-bank/media/orphaned");
  return data;
};

export const cleanupOrphanedExamQuestionBankMedia = async () => {
  const { data } = await http.delete("/v1/exam-question-bank/media/cleanup");
  return data;
};

export const previewExamQuestionBankItem = async (questionId) => {
  const { data } = await http.get(`/v1/exam-question-bank/${questionId}/preview`);
  return data;
};

export const getExamQuestionBankMedia = async (questionId) => {
  const { data } = await http.get(`/v1/exam-question-bank/${questionId}/media`);
  return data;
};

export const addExamQuestionBankMedia = async (questionId, body) => {
  const { data } = await http.post(`/v1/exam-question-bank/${questionId}/media`, body);
  return data;
};

export const updateExamQuestionBankMedia = async (questionId, mediaId, body) => {
  const { data } = await http.patch(
    `/v1/exam-question-bank/${questionId}/media/${mediaId}`,
    body
  );
  return data;
};

export const deleteExamQuestionBankMedia = async (questionId, mediaId) => {
  const { data } = await http.delete(
    `/v1/exam-question-bank/${questionId}/media/${mediaId}`
  );
  return data;
};
