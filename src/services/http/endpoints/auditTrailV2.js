import { http } from '../http';

export const auditTrailV2GetLogs = async (params = {}) => {
  const { data } = await http.get('/v1/audit-trail-v2/logs', { params });
  return data.data ?? { total: 0, page: 1, limit: 20, logs: [] };
};

export const auditTrailV2PostLog = async (payload) => {
  const { data } = await http.post('/v1/audit-trail-v2/logs', payload);
  return data.data ?? {};
};

export const auditTrailV2GetReport = async (params = {}) => {
  const { data } = await http.get('/v1/audit-trail-v2/report', { params });
  return data.data ?? {};
};
