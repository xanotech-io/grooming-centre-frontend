import { http } from "../http";

export const getExamPaperConfigPreview = async (examinationId) => {
  const { data } = await http.get(`/v1/exam-paper-config-v2/${examinationId}/preview`);
  return data;
};

export const publishExamPaperConfig = async (examinationId) => {
  const { data } = await http.post(`/v1/exam-paper-config-v2/${examinationId}/publish`);
  return data;
};

export const getExamPaperConfigKPIs = async () => {
  const { data } = await http.get("/v1/exam-paper-config-v2/kpis");
  return data;
};

export const getExaminationById = async (examinationId, examType) => {
  const { data } = await http.get(`/v1/examinations/${examinationId}`, {
    params: { examType },
  });
  return data;
};

export const updateExaminationById = async (examinationId, body) => {
  const { data } = await http.put(`/v1/examinations/${examinationId}`, body);
  return data;
};
