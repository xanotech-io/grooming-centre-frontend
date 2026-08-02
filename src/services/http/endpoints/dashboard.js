import { http } from '../http';

// ---------------------------------------------------------------------------
// TC19 - Dashboard Academic Metrics
// GET /v1/dashboard-v2/academic
// ---------------------------------------------------------------------------

export const adminGetAcademicDashboardMetrics = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/academic', { params });
  return { dashboard: data };
};

// ---------------------------------------------------------------------------
// Dashboard V2 — real API endpoints
// ---------------------------------------------------------------------------

export const adminGetDashboardFilters = async () => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/filters');
  return {
    courses: data?.courses ?? [],
    departments: data?.departments ?? [],
    dashboardTypes: data?.dashboardTypes ?? [],
    exportFormats: data?.exportFormats ?? [],
  };
};

export const adminGetAcademicDashboardV2 = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/academic', { params });
  return { dashboard: data };
};

export const adminGetAdministrativeDashboard = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/administrative', { params });
  return { dashboard: data };
};

export const adminGetPerformanceDashboard = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/performance', { params });
  return { dashboard: data };
};

export const adminGetAttendanceDashboard = async (params = {}) => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/attendance', { params });
  return { dashboard: data };
};

export const adminGetDashboardKPIs = async () => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/kpis');
  return { kpis: data };
};

export const adminExportDashboard = async (body) => {
  const response = await http.post('/v1/dashboard-v2/export', body, { responseType: 'blob' });
  return response.data;
};
