import { http } from '../http';

export const adminListMISReports = async (params) => {
  const { data: { data } } = await http.get('/v1/mis-report-v2', { params });
  const rows = data?.reports ?? data?.rows ?? (Array.isArray(data) ? data : []);
  return {
    reports: rows,
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
  };
};

export const adminGetMISReport = async (reportId) => {
  const { data: { data } } = await http.get(`/v1/mis-report-v2/${reportId}`);
  return { report: data };
};

export const adminGetMISKPIs = async () => {
  const { data: { data } } = await http.get('/v1/mis-report-v2/kpis');
  return { kpis: data };
};

export const adminGenerateMISReport = async (body) => {
  const { data: { data, message } } = await http.post('/v1/mis-report-v2/generate', body);
  return { report: data, message };
};

export const adminDeleteMISReport = async (reportId) => {
  const { data: { message } } = await http.delete(`/v1/mis-report-v2/${reportId}`);
  return { message };
};

export const adminCreateMISSchedule = async (body) => {
  const { data: { data, message } } = await http.post('/v1/mis-report-v2/schedules', body);
  return { schedule: data, message };
};

export const adminListMISSchedules = async () => {
  const { data: { data } } = await http.get('/v1/mis-report-v2/schedules');
  return { schedules: Array.isArray(data) ? data : [] };
};

export const adminDeleteMISSchedule = async (scheduleId) => {
  const { data: { message } } = await http.delete(`/v1/mis-report-v2/schedules/${scheduleId}`);
  return { message };
};
