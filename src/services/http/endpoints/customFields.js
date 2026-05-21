import { http } from "../http";

const BASE = "/custom-fields-v2";

export const getCustomFieldsKpis = async () => {
  const { data } = await http.get(`${BASE}/kpis`);
  return data;
};

export const listCustomFields = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const getCustomField = async (fieldId) => {
  const { data } = await http.get(`${BASE}/${fieldId}`);
  return data;
};

export const createCustomField = async (payload) => {
  const { data } = await http.post(BASE, payload);
  return data;
};

export const updateCustomField = async (fieldId, payload) => {
  const { data } = await http.patch(`${BASE}/${fieldId}`, payload);
  return data;
};

export const deleteCustomField = async (fieldId) => {
  const { data } = await http.delete(`${BASE}/${fieldId}`);
  return data;
};

export const saveEntityFieldValues = async (payload) => {
  const { data } = await http.post(`${BASE}/values`, payload);
  return data;
};

export const getEntityFieldValues = async (entityType, entityId) => {
  const { data } = await http.get(`${BASE}/values/${entityType}/${entityId}`);
  return data;
};
