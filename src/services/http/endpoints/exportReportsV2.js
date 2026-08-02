import { http } from "../http";

const BASE = "/v1/export-reports-v2";

// ─── Export / Extraction ──────────────────────────────────────────────────────

export const createExportReport = async (body) => {
  const { data } = await http.post(BASE, body);
  return data;
};

export const getExportReports = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const getMyExports = async (params) => {
  const { data } = await http.get(`${BASE}/my-exports`, { params });
  return data;
};

export const getExportReport = async (exportId) => {
  const { data } = await http.get(`${BASE}/${exportId}`);
  return data;
};

// ─── Import ───────────────────────────────────────────────────────────────────

export const uploadDataImport = async (formData) => {
  const { data } = await http.post(`${BASE}/import`, formData);
  return data;
};

export const getDataImports = async (params) => {
  const { data } = await http.get(`${BASE}/import`, { params });
  return data;
};

export const getMyDataImports = async (params) => {
  const { data } = await http.get(`${BASE}/import/my-imports`, { params });
  return data;
};

export const getDataImport = async (importId) => {
  const { data } = await http.get(`${BASE}/import/${importId}`);
  return data;
};

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export const getDataImportExportKpis = async (params) => {
  const { data } = await http.get(`${BASE}/kpis`, { params });
  return data;
};
