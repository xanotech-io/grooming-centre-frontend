import { http } from "../http";

export const listMarkingSchemes = async (params) => {
  const { data } = await http.get("/v1/marking-schemes-v2", { params });
  return data;
};

export const getMarkingScheme = async (schemeId) => {
  const { data } = await http.get(`/v1/marking-schemes-v2/${schemeId}`);
  return data;
};

export const createMarkingScheme = async (body) => {
  const { data } = await http.post("/v1/marking-schemes-v2", body);
  return data;
};

export const updateMarkingScheme = async (schemeId, body) => {
  const { data } = await http.patch(`/v1/marking-schemes-v2/${schemeId}`, body);
  return data;
};

export const deleteMarkingScheme = async (schemeId) => {
  const { data } = await http.delete(`/v1/marking-schemes-v2/${schemeId}`);
  return data;
};

export const applyMarkingScheme = async (schemeId, examinationId) => {
  const { data } = await http.post(
    `/v1/marking-schemes-v2/${schemeId}/apply/${examinationId}`
  );
  return data;
};

export const computeStudentScore = async (examinationId, studentId) => {
  const { data } = await http.post(
    `/v1/marking-schemes-v2/compute-score/${examinationId}/${studentId}`
  );
  return data;
};

export const getMarkingSchemeKPIs = async () => {
  const { data } = await http.get("/v1/marking-schemes-v2/kpis");
  return data;
};

export const getGradeDistribution = async (examinationId) => {
  const { data } = await http.get(
    `/v1/marking-schemes-v2/distribution/${examinationId}`
  );
  return data;
};

export const getSchemeForExamination = async (examinationId) => {
  const { data } = await http.get(
    `/v1/marking-schemes-v2/examination/${examinationId}`
  );
  return data;
};
