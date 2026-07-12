import { http } from "../http";

const BASE = "/v1/question-batch-import-v2";

export const downloadExamQuestionBatchTemplate = async () => {
  const response = await http.get(`${BASE}/template/download`, {
    responseType: "blob",
  });
  return response.data;
};

export const uploadExamQuestionBatch = async ({
  file,
  examinationId,
  assessmentId,
  mediaZip,
  defaultDifficulty,
}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (examinationId) formData.append("examinationId", examinationId);
  if (assessmentId) formData.append("assessmentId", assessmentId);
  if (mediaZip) formData.append("mediaZip", mediaZip);
  if (defaultDifficulty) formData.append("defaultDifficulty", defaultDifficulty);

  const { data } = await http.post(`${BASE}/upload`, formData);
  return data;
};

export const getExamQuestionBatchRows = async (uploadId, status) => {
  const { data } = await http.get(`${BASE}/${uploadId}/rows`, {
    params: status ? { status } : undefined,
  });
  return data;
};

export const updateExamQuestionBatchRow = async (uploadId, rowId, patch) => {
  const { data } = await http.patch(`${BASE}/${uploadId}/rows/${rowId}`, patch);
  return data;
};

export const deleteExamQuestionBatchRow = async (uploadId, rowId) => {
  const { data } = await http.delete(`${BASE}/${uploadId}/rows/${rowId}`);
  return data;
};

export const confirmExamQuestionBatchImport = async (uploadId) => {
  const { data } = await http.post(`${BASE}/${uploadId}/confirm`);
  return data;
};

export const getExamQuestionBatchReport = async (uploadId) => {
  const { data } = await http.get(`${BASE}/${uploadId}/report`);
  return data;
};

export const getExamQuestionBatchKpis = async () => {
  const { data } = await http.get(`${BASE}/kpis`);
  return data;
};
