import { http, baseURL } from '../http';

// ---------------------------------------------------------------------------
// Dashboard V2 — real API endpoints
// GET /v1/dashboard-v2?type=academic|administrative|performance|attendance
// replaces the old per-type routes (/v1/dashboard-v2/academic, /administrative,
// /performance, /attendance), which are gone.
// ---------------------------------------------------------------------------

export const adminGetDashboardV2 = async (type, params = {}) => {
  const { data: { data } } = await http.get('/v1/dashboard-v2', { params: { type, ...params } });
  return { dashboard: data };
};

// Kept for existing callers built against the old academic-only route.
export const adminGetAcademicDashboardMetrics = async (params = {}) => adminGetDashboardV2('academic', params);

export const adminGetDashboardFilters = async () => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/filters');
  return {
    courses: data?.courses ?? [],
    departments: data?.departments ?? [],
    dashboardTypes: data?.dashboardTypes ?? [],
    exportFormats: data?.exportFormats ?? [],
  };
};

export const adminGetDashboardKPIs = async () => {
  const { data: { data } } = await http.get('/v1/dashboard-v2/kpis');
  return { kpis: data?.kpis ?? {} };
};

export const adminExportDashboard = async (body) => {
  const response = await http.post('/v1/dashboard-v2/export', body, { responseType: 'blob' });
  return response.data;
};

// PATCH /v1/dashboard-v2/interaction/{interactionId}/end
// Required whenever the user leaves a dashboard view (route change, tab
// close, component unmount) — it's what makes "Average User Engagement
// Duration" measurable. Uses fetch+keepalive so it still fires reliably
// from a pagehide/unload handler, where axios requests can get cancelled.
export const adminEndDashboardInteraction = (interactionId) => {
  if (!interactionId) return Promise.resolve();
  const token = localStorage.getItem('token');
  return fetch(`${baseURL}/v1/dashboard-v2/interaction/${interactionId}/end`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}` },
    keepalive: true,
  }).catch(() => {});
};
