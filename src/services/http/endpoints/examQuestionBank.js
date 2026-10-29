import { http } from "../http";

export const listExamQuestionBank = async (params) => {
  const { data } = await http.get("/v1/exam-question-bank", { params });
  return data;
};

// Only "active" bank questions may be picked into an assessment/exam —
// draft/inactive ones stay hidden until activated on the Question Bank page.
export const isActiveBankQuestion = (question) => (question?.status ?? "active") === "active";

// Same response shape as listExamQuestionBank, restricted to active questions
// (filtered here too, in case the API ignores the `status` param).
export const listActiveExamQuestionBank = async (params) => {
  const res = await listExamQuestionBank({ ...params, status: "active" });
  const payload = res?.data ?? res;
  const items = Array.isArray(payload?.questions) ? payload.questions : Array.isArray(payload) ? payload : [];
  return items.filter(isActiveBankQuestion);
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

// Accepts either a JSON body with a CDN `url`, or `{ file, ...metadata }` where
// `file` is a File — the latter is sent as multipart so the API uploads it.
export const addExamQuestionBankMedia = async (questionId, body) => {
  const isFile = typeof File !== "undefined" && body?.file instanceof File;
  if (!isFile) {
    const { data } = await http.post(`/v1/exam-question-bank/${questionId}/media`, body);
    return data;
  }

  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (key !== "file" && value !== undefined && value !== null && value !== "") formData.append(key, value);
  });
  formData.append("file", body.file);

  const { data } = await http.post(`/v1/exam-question-bank/${questionId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
