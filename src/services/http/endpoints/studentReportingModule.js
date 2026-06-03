import { http } from '../http';

// ---------------------------------------------------------------------------
// TC08 & TC04 – Unified Student Reporting & Participation Monitoring
// Base: /api/v1/participation-monitoring-v2
// ---------------------------------------------------------------------------

// GET /api/v1/participation-monitoring-v2/scoring-guide
export const pm2GetScoringGuide = async () => {
  const { data } = await http.get('/v1/participation-monitoring-v2/scoring-guide');
  return { guide: data?.data ?? data };
};

// GET /api/v1/participation-monitoring-v2/at-risk
export const pm2GetAtRiskStudents = async (params = {}) => {
  const { data } = await http.get('/v1/participation-monitoring-v2/at-risk', { params });
  return { result: data?.data ?? data };
};

// GET /api/v1/participation-monitoring-v2/student-report  (TC08)
export const pm2GetStudentReport = async (params = {}) => {
  const { data } = await http.get('/v1/participation-monitoring-v2/student-report', { params });
  const rows = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];
  const meta = data?.data ?? {};
  return {
    reports: rows,
    total: meta.total ?? rows.length,
    page: meta.page ?? 1,
    totalPages: meta.total && meta.limit ? Math.ceil(meta.total / meta.limit) : 1,
    generatedBy: meta.generatedBy ?? null,
    generatedAt: meta.generatedAt ?? null,
  };
};

// GET /api/v1/participation-monitoring-v2/summary
export const pm2GetSummary = async (params = {}) => {
  const { data } = await http.get('/v1/participation-monitoring-v2/summary', { params });
  return { summary: data?.data ?? data };
};

// GET /api/v1/participation-monitoring-v2/course-summary
export const pm2GetCourseSummary = async (params = {}) => {
  const { data } = await http.get('/v1/participation-monitoring-v2/course-summary', { params });
  const rows = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];
  const meta = data?.data ?? {};
  return {
    courses: rows,
    total: meta.total ?? rows.length,
  };
};

// GET /api/v1/participation-monitoring-v2/report  (TC04)
export const pm2GetParticipationReport = async (params = {}) => {
  const { data } = await http.get('/v1/participation-monitoring-v2/report', { params });
  const rows = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];
  const meta = data?.data ?? {};
  return {
    records: rows,
    total: meta.total ?? rows.length,
    page: meta.page ?? 1,
    totalPages: meta.total && meta.limit ? Math.ceil(meta.total / meta.limit) : 1,
    kpis: meta.kpis ?? null,
  };
};

// GET /api/v1/participation-monitoring-v2/report/{studentId}
export const pm2GetStudentParticipation = async (studentId, params = {}) => {
  const { data } = await http.get(
    `/v1/participation-monitoring-v2/report/${studentId}`,
    { params },
  );
  return { record: data?.data ?? data };
};

// POST /api/v1/participation-monitoring-v2/intervention
export const pm2LogIntervention = async (body) => {
  const { data } = await http.post('/v1/participation-monitoring-v2/intervention', body);
  return {
    intervention: data?.data ?? data,
    message: data?.message ?? 'Intervention logged successfully.',
  };
};

// KPI loader for module header — derived from /summary
export const pm2GetModuleKPIs = async () => {
  const { summary } = await pm2GetSummary();
  const kpis = summary?.kpis ?? summary ?? {};
  return {
    kpis: {
      avgParticipationRate: kpis.average_participation_rate ?? null,
      totalStudents: kpis.total_students ?? null,
      totalActiveStudents: kpis.active_students ?? null,
      totalInactiveStudents: kpis.inactive_students ?? null,
      totalIrregularStudents: kpis.irregular_students ?? null,
      alertsTriggered: kpis.alerts_triggered ?? null,
      activePercentage: kpis.active_percentage ?? null,
      irregularPercentage: kpis.irregular_percentage ?? null,
      inactivePercentage: kpis.inactive_percentage ?? null,
      alertsPercentage: kpis.alerts_triggered_percentage ?? null,
    },
  };
};

// ---------------------------------------------------------------------------
// Legacy aliases — kept so any other file importing these still compiles
// ---------------------------------------------------------------------------
export const tc0804GetStudentReports = pm2GetStudentReport;
export const tc0804GetParticipationRecords = pm2GetParticipationReport;
export const tc0804GetParticipationSummary = pm2GetSummary;
export const tc0804GetModuleKPIs = pm2GetModuleKPIs;
export const tc0804GetStudentParticipationById = (id) => pm2GetStudentParticipation(id);
export const tc0804CreateStudentReport = async (body) => {
  const { data } = await http.post('/v1/participation-monitoring-v2/student-report', body);
  return data?.data ?? data;
};
export const tc0804BulkGenerateReports = async (body) => {
  const { data } = await http.post('/v1/participation-monitoring-v2/bulk-generate', body);
  return data?.data ?? data;
};
export const tc0804GetReportTemplates = async (params = {}) => {
  const { data } = await http.get('/v1/participation-monitoring-v2/templates', { params });
  return { templates: data?.data ?? [] };
};
