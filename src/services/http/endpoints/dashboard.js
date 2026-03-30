import { http } from '../http';

// ---------------------------------------------------------------------------
// TC19 - Dashboard Academic Metrics
// GET /v2/dashboard/metrics/academic
// ---------------------------------------------------------------------------

/**
 * Get institution-wide academic dashboard metrics
 * @param {{ academicYear?: string, departmentId?: string }} params
 * @returns {Promise<{ metrics: object }>}
 */
export const adminGetAcademicDashboardMetrics = async (params = {}) => {
  const { data: { data } } = await http.get('/v2/dashboard/metrics/academic', { params });
  return { metrics: data };
};
