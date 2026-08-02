import { http } from "../http";

export const getMultimediaQuestions = async (examinationId, params) => {
  const { data } = await http.get(`/v1/question-multimedia-v2/examination/${examinationId}`, { params });
  return data;
};

export const getMultimediaExamStats = async (examinationId) => {
  const { data } = await http.get(`/v1/question-multimedia-v2/examination/${examinationId}/stats`);
  return data;
};

export const getMultimediaQuestion = async (questionId) => {
  const { data } = await http.get(`/v1/question-multimedia-v2/${questionId}`);
  return data;
};

export const createMultimediaQuestion = async (body) => {
  const { data } = await http.post("/v1/question-multimedia-v2", body);
  return data;
};

export const updateMultimediaQuestion = async (questionId, body) => {
  const { data } = await http.put(`/v1/question-multimedia-v2/${questionId}`, body);
  return data;
};

export const previewMultimediaQuestion = async (questionId) => {
  const { data } = await http.get(`/v1/question-multimedia-v2/${questionId}/preview`);
  return data;
};

export const getQuestionMedia = async (questionId) => {
  const { data } = await http.get(`/v1/question-multimedia-v2/${questionId}/media`);
  return data;
};

export const addQuestionMedia = async (questionId, body) => {
  const { data } = await http.post(`/v1/question-multimedia-v2/${questionId}/media`, body);
  return data;
};

export const updateQuestionMedia = async (questionId, mediaId, body) => {
  const { data } = await http.put(`/v1/question-multimedia-v2/${questionId}/media/${mediaId}`, body);
  return data;
};

export const deleteQuestionMedia = async (questionId, mediaId) => {
  const { data } = await http.delete(`/v1/question-multimedia-v2/${questionId}/media/${mediaId}`);
  return data;
};
