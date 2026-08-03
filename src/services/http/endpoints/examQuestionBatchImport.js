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
  courseId,
  examinationId,
  assessmentId,
  mediaZip,
  defaultDifficulty,
  section,
}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (courseId) formData.append("courseId", courseId);
  if (examinationId) formData.append("examinationId", examinationId);
  if (assessmentId) formData.append("assessmentId", assessmentId);
  if (mediaZip) formData.append("mediaZip", mediaZip);
  if (defaultDifficulty) formData.append("defaultDifficulty", defaultDifficulty);
  // Every row in this file belongs to the same section — the template has
  // no per-row section column, so it's supplied once here instead. Rows are
  // also explicitly tagged after upload (BatchUploadPage.jsx) so this still
  // lands correctly even if the parser itself ignores this field.
  if (section) formData.append("section", section);

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

export const listExamQuestionBatchUploads = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const deleteExamQuestionBatchUpload = async (uploadId) => {
  const { data } = await http.delete(`${BASE}/${uploadId}`);
  return data;
};
