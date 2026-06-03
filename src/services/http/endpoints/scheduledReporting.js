import { http } from '../http';

// ---------------------------------------------------------------------------
// TC20 — Scheduled Reporting Module
// ---------------------------------------------------------------------------

// TC20 Phase 1 — Report Selection: list available reports to schedule
// GET /v2/custom-reports  (falls back to MOCK)
export const tc20ListAvailableReports = async () => {
  const { data: { data } } = await http.get('/v1/mis-report-v2');
  const rows = data?.reports ?? data?.rows ?? (Array.isArray(data) ? data : []);
  const reports = rows.map((r) => ({
    reportId: r.reportId ?? r.id,
    reportName: r.reportName ?? r.name,
    category: r.category,
  }));
  return { reports };
};

// TC20 Phase 5 — Schedule Monitoring: list all active schedules
// GET /v1/mis-report-v2/schedules
export const tc20ListSchedules = async () => {
  const { data: { data } } = await http.get('/v1/mis-report-v2/schedules');
  const rows = data?.schedules ?? (Array.isArray(data) ? data : []);
  const schedules = rows.map((s) => ({
    ...s,
    scheduleId: s.scheduleId ?? s.id,
    nextRunDate: s.nextRunDate ?? s.nextRunAt,
    createdDate: s.createdDate ?? s.createdAt,
    lastRunDate: s.lastRunDate ?? s.lastRunAt,
    recipients: s.recipients ?? s.recipientEmails ?? [],
    generatedBy: s.generatedBy ?? s.createdBy ?? s.creator ?? '—',
  }));
  return { schedules };
};

// TC20 Phase 7 — KPI Tracking: summary metrics
// GET /v1/mis-report-v2/kpis
export const tc20GetScheduleKPIs = async () => {
  const { data: { data } } = await http.get('/v1/mis-report-v2/kpis');
  return { kpis: data };
};

// TC20 Phase 2–3 — Schedule & Delivery Config: create new schedule
// POST /v1/mis-report-v2/schedules
export const tc20CreateSchedule = async (body) => {
  const { data: { data, message } } = await http.post('/v1/mis-report-v2/schedules', body);
  return { schedule: data, message: message || 'Schedule created successfully.' };
};

// TC20 Phase 4 — Validation & Activation: toggle active/inactive status
// PATCH /v1/mis-report-v2/schedules/{scheduleId}
export const tc20UpdateScheduleStatus = async (scheduleId, status) => {
  const { data: { data, message } } = await http.patch(
    `/v1/mis-report-v2/schedules/${scheduleId}`,
    { status }
  );
  return { schedule: data, message: message || `Schedule ${status}.` };
};

// TC20 Phase 5 — Delete a schedule
// DELETE /v1/mis-report-v2/schedules/{scheduleId}
export const tc20DeleteSchedule = async (scheduleId) => {
  const { data: { message } } = await http.delete(`/v1/mis-report-v2/schedules/${scheduleId}`);
  return { message: message || 'Schedule deleted.' };
};

// TC20 Phase 6 — Execution Logs: history for a specific schedule
// GET /v1/mis-report-v2/schedules/{scheduleId}/logs
export const tc20GetScheduleLogs = async (scheduleId) => {
  const { data: { data } } = await http.get(`/v1/mis-report-v2/schedules/${scheduleId}/logs`);
  return { logs: Array.isArray(data) ? data : [] };
};

// TC20 Phase 6 — All execution logs across all schedules
// GET /v1/mis-report-v2/schedules/logs
export const tc20GetAllExecutionLogs = async () => {
  const { data: { data } } = await http.get('/v1/mis-report-v2/schedules/logs');
  return { logs: Array.isArray(data) ? data : [] };
};
