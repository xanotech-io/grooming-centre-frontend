import { http } from '../http';

// GET /api/v1/report-builder-v2/catalog
export const reportBuilderGetCatalog = async () => {
  const { data } = await http.get('/v1/report-builder-v2/catalog');
  return { catalog: data.data ?? {}, success: data.success };
};

// POST /api/v1/report-builder-v2/configs
export const reportBuilderCreateConfig = async (body) => {
  const { data } = await http.post('/v1/report-builder-v2/configs', body);
  return { config: data.data, success: data.success };
};

// GET /api/v1/report-builder-v2/configs
export const reportBuilderListConfigs = async (params) => {
  const { data } = await http.get('/v1/report-builder-v2/configs', { params });
  const payload = data.data ?? {};
  const configs = Array.isArray(payload) ? payload : (payload.configs ?? payload.data ?? []);
  return { configs, pagination: payload.pagination, success: data.success };
};

// GET /api/v1/report-builder-v2/configs/{configId}
export const reportBuilderGetConfig = async (configId) => {
  const { data } = await http.get(`/v1/report-builder-v2/configs/${configId}`);
  return { config: data.data, success: data.success };
};

// PUT /api/v1/report-builder-v2/configs/{configId}
export const reportBuilderUpdateConfig = async (configId, body) => {
  const { data } = await http.put(`/v1/report-builder-v2/configs/${configId}`, body);
  return { config: data.data, success: data.success };
};

// DELETE /api/v1/report-builder-v2/configs/{configId}
export const reportBuilderDeleteConfig = async (configId) => {
  const { data } = await http.delete(`/v1/report-builder-v2/configs/${configId}`);
  return { success: data.success, message: data.message };
};

// POST /api/v1/report-builder-v2/configs/{configId}/execute
export const reportBuilderExecuteConfig = async (configId) => {
  const { data } = await http.post(`/v1/report-builder-v2/configs/${configId}/execute`);
  return { result: data.data, success: data.success };
};

// POST /api/v1/report-builder-v2/preview
export const reportBuilderPreview = async (body) => {
  const { data } = await http.post('/v1/report-builder-v2/preview', body);
  return { result: data.data, success: data.success };
};

// GET /api/v1/report-builder-v2/stats
export const reportBuilderGetStats = async () => {
  const { data } = await http.get('/v1/report-builder-v2/stats');
  return { stats: data.data, success: data.success };
};
