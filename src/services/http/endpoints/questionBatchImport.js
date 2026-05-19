import { http } from "../http";

export const downloadBatchImportTemplate = async () => {
  const response = await http.get("/v1/question-batch-import-v2/template/download", {
    responseType: "blob",
  });
  return response.data;
};

export const uploadBatchImport = async (formData) => {
  const { data } = await http.post("/v1/question-batch-import-v2/upload", formData);
  return data;
};

export const listBatchImports = async (params) => {
  const { data } = await http.get("/v1/question-batch-import-v2", { params });
  return data;
};

export const getBatchImportDetail = async (uploadId) => {
  const { data } = await http.get(`/v1/question-batch-import-v2/${uploadId}`);
  return data;
};

export const deleteBatchImport = async (uploadId) => {
  const { data } = await http.delete(`/v1/question-batch-import-v2/${uploadId}`);
  return data;
};

export const getBatchImportReport = async (uploadId) => {
  const { data } = await http.get(`/v1/question-batch-import-v2/${uploadId}/report`);
  return data;
};
