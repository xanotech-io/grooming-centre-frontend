import { http } from '../http';

// GET /api/v1/system-utilization-report-v2/report
export const getSystemUtilizationReport = async (params) => {
  const { data } = await http.get('/v1/system-utilization-report-v2/report', { params });
  return { data: data.data ?? {}, success: data.success, message: data.message };
};
