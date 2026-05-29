import { http } from '../http';

// ---------------------------------------------------------------------------
// TC20 — Scheduled Reporting Module
// Mock data activates automatically when any API call fails
// ---------------------------------------------------------------------------

const MOCK_AVAILABLE_REPORTS = [
  { reportId: 'RPT-001', reportName: 'Student Progress Report', category: 'Academic' },
  { reportId: 'RPT-002', reportName: 'Course Completion Summary', category: 'Academic' },
  { reportId: 'RPT-003', reportName: 'Enrollment Status Report', category: 'Administrative' },
  { reportId: 'RPT-004', reportName: 'Assessment Results Analysis', category: 'Assessment' },
  { reportId: 'RPT-005', reportName: 'Instructor Performance Report', category: 'HR' },
  { reportId: 'RPT-006', reportName: 'Department KPI Summary', category: 'Administrative' },
  { reportId: 'RPT-007', reportName: 'Compliance Audit Report', category: 'Compliance' },
  { reportId: 'RPT-008', reportName: 'Grade Distribution Report', category: 'Assessment' },
];

const MOCK_SCHEDULES = [
  {
    scheduleId: 'SCH-001',
    reportId: 'RPT-001',
    reportName: 'Student Progress Report',
    frequency: 'monthly',
    generatedBy: 'Admin User',
    nextRunDate: '2026-06-01T08:00:00Z',
    status: 'active',
    deliveryMethod: 'email',
    createdDate: '2026-01-15T10:00:00Z',
    lastRunDate: '2026-05-01T08:00:00Z',
    lastDeliveryStatus: 'delivered',
    reportFormat: 'PDF',
    recipients: ['admin@gclms.edu', 'director@gclms.edu'],
    executionLogId: 'LOG-001',
  },
  {
    scheduleId: 'SCH-002',
    reportId: 'RPT-003',
    reportName: 'Enrollment Status Report',
    frequency: 'weekly',
    generatedBy: 'System',
    nextRunDate: '2026-05-25T07:00:00Z',
    status: 'active',
    deliveryMethod: 'dashboard',
    createdDate: '2026-02-10T09:00:00Z',
    lastRunDate: '2026-05-18T07:00:00Z',
    lastDeliveryStatus: 'delivered',
    reportFormat: 'Excel',
    recipients: [],
    executionLogId: 'LOG-002',
  },
  {
    scheduleId: 'SCH-003',
    reportId: 'RPT-004',
    reportName: 'Assessment Results Analysis',
    frequency: 'daily',
    generatedBy: 'Admin User',
    nextRunDate: '2026-05-22T06:00:00Z',
    status: 'inactive',
    deliveryMethod: 'email',
    createdDate: '2026-03-05T11:00:00Z',
    lastRunDate: '2026-05-20T06:00:00Z',
    lastDeliveryStatus: 'failed',
    reportFormat: 'PDF',
    recipients: ['assessments@gclms.edu'],
    executionLogId: 'LOG-003',
  },
  {
    scheduleId: 'SCH-004',
    reportId: 'RPT-006',
    reportName: 'Department KPI Summary',
    frequency: 'monthly',
    generatedBy: 'Admin User',
    nextRunDate: '2026-06-01T09:00:00Z',
    status: 'active',
    deliveryMethod: 'export',
    createdDate: '2026-01-20T14:00:00Z',
    lastRunDate: '2026-05-01T09:00:00Z',
    lastDeliveryStatus: 'delivered',
    reportFormat: 'CSV',
    recipients: [],
    executionLogId: 'LOG-004',
  },
  {
    scheduleId: 'SCH-005',
    reportId: 'RPT-007',
    reportName: 'Compliance Audit Report',
    frequency: 'weekly',
    generatedBy: 'Compliance Officer',
    nextRunDate: '2026-05-24T08:00:00Z',
    status: 'active',
    deliveryMethod: 'email',
    createdDate: '2026-04-01T08:00:00Z',
    lastRunDate: '2026-05-17T08:00:00Z',
    lastDeliveryStatus: 'delivered',
    reportFormat: 'PDF',
    recipients: ['compliance@gclms.edu', 'legal@gclms.edu'],
    executionLogId: 'LOG-005',
  },
];

const MOCK_KPIS = {
  totalScheduled: 5,
  activeSchedules: 4,
  successRate: 92.0,
  failedReports: 1,
  avgDeliveryTime: '2.4 min',
  reportsThisMonth: 18,
};

const MOCK_LOGS = [
  {
    logId: 'LOG-001-R3',
    scheduleId: 'SCH-001',
    reportName: 'Student Progress Report',
    executionDate: '2026-05-01T08:02:14Z',
    status: 'delivered',
    duration: '1m 44s',
    deliveredTo: 'admin@gclms.edu, director@gclms.edu',
    errorMessage: null,
  },
  {
    logId: 'LOG-002-R8',
    scheduleId: 'SCH-002',
    reportName: 'Enrollment Status Report',
    executionDate: '2026-05-18T07:01:05Z',
    status: 'delivered',
    duration: '0m 58s',
    deliveredTo: 'Dashboard',
    errorMessage: null,
  },
  {
    logId: 'LOG-003-R12',
    scheduleId: 'SCH-003',
    reportName: 'Assessment Results Analysis',
    executionDate: '2026-05-20T06:05:31Z',
    status: 'failed',
    duration: '5m 00s',
    deliveredTo: 'assessments@gclms.edu',
    errorMessage: 'SMTP connection timeout after 300s',
  },
  {
    logId: 'LOG-004-R2',
    scheduleId: 'SCH-004',
    reportName: 'Department KPI Summary',
    executionDate: '2026-05-01T09:03:22Z',
    status: 'delivered',
    duration: '2m 10s',
    deliveredTo: 'Export / Download',
    errorMessage: null,
  },
  {
    logId: 'LOG-005-R6',
    scheduleId: 'SCH-005',
    reportName: 'Compliance Audit Report',
    executionDate: '2026-05-17T08:00:47Z',
    status: 'delivered',
    duration: '1m 02s',
    deliveredTo: 'compliance@gclms.edu, legal@gclms.edu',
    errorMessage: null,
  },
  {
    logId: 'LOG-001-R2',
    scheduleId: 'SCH-001',
    reportName: 'Student Progress Report',
    executionDate: '2026-04-01T08:01:55Z',
    status: 'delivered',
    duration: '1m 38s',
    deliveredTo: 'admin@gclms.edu, director@gclms.edu',
    errorMessage: null,
  },
];

// ---------------------------------------------------------------------------
// TC20 Phase 1 — Report Selection: list available reports to schedule
// GET /v2/custom-reports  (falls back to MOCK)
// ---------------------------------------------------------------------------
export const tc20ListAvailableReports = async () => {
  try {
    const { data: { data } } = await http.get('/v1/mis-report-v2');
    const rows = data?.reports ?? data?.rows ?? (Array.isArray(data) ? data : []);
    const reports = rows.map((r) => ({
      reportId: r.reportId ?? r.id,
      reportName: r.reportName ?? r.name,
      category: r.category,
    }));
    return { reports, isMock: false };
  } catch {
    return { reports: MOCK_AVAILABLE_REPORTS, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// TC20 Phase 5 — Schedule Monitoring: list all active schedules
// GET /v1/mis-report-v2/schedules  (falls back to MOCK)
// ---------------------------------------------------------------------------
export const tc20ListSchedules = async () => {
  try {
    const { data: { data } } = await http.get('/v1/mis-report-v2/schedules');
    const rows = data?.schedules ?? (Array.isArray(data) ? data : []);
    const schedules = rows.map((s) => ({
      ...s,
      scheduleId: s.scheduleId ?? s.id,
      nextRunDate: s.nextRunDate ?? s.nextRunAt,
      createdDate: s.createdDate ?? s.createdAt,
      lastRunDate: s.lastRunDate ?? s.lastRunAt,
      recipients: s.recipients ?? s.recipientEmails ?? [],
      generatedBy: s.generatedBy ?? s.createdBy ?? s.creator ?? "—",
    }));
    return { schedules, isMock: false };
  } catch {
    return { schedules: MOCK_SCHEDULES, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// TC20 Phase 7 — KPI Tracking: summary metrics
// GET /v1/mis-report-v2/kpis  (falls back to MOCK)
// ---------------------------------------------------------------------------
export const tc20GetScheduleKPIs = async () => {
  try {
    const { data: { data } } = await http.get('/v1/mis-report-v2/kpis');
    return { kpis: data, isMock: false };
  } catch {
    return { kpis: MOCK_KPIS, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// TC20 Phase 2–3 — Schedule & Delivery Config: create new schedule
// POST /v1/mis-report-v2/schedules
// body: { reportId, reportName, frequency, time, dayOfWeek?, dayOfMonth?,
//         deliveryMethod, recipients, reportFormat, startDate }
// ---------------------------------------------------------------------------
export const tc20CreateSchedule = async (body) => {
  try {
    const { data: { data, message } } = await http.post('/v1/mis-report-v2/schedules', body);
    return { schedule: data, message: message || 'Schedule created successfully.', isMock: false };
  } catch (err) {
    const mockSchedule = {
      scheduleId: `SCH-${String(Date.now()).slice(-4)}`,
      ...body,
      status: 'active',
      createdDate: new Date().toISOString(),
      lastRunDate: null,
      lastDeliveryStatus: null,
    };
    return {
      schedule: mockSchedule,
      message: 'Schedule created (offline mode).',
      isMock: true,
      error: err?.response?.data?.message,
    };
  }
};

// ---------------------------------------------------------------------------
// TC20 Phase 4 — Validation & Activation: toggle active/inactive status
// PATCH /v1/mis-report-v2/schedules/{scheduleId}
// body: { status: 'active' | 'inactive' }
// ---------------------------------------------------------------------------
export const tc20UpdateScheduleStatus = async (scheduleId, status) => {
  try {
    const { data: { data, message } } = await http.patch(
      `/v1/mis-report-v2/schedules/${scheduleId}`,
      { status }
    );
    return { schedule: data, message: message || `Schedule ${status}.`, isMock: false };
  } catch (err) {
    return {
      message: `Status updated to ${status} (offline mode).`,
      isMock: true,
      error: err?.response?.data?.message,
    };
  }
};

// ---------------------------------------------------------------------------
// TC20 Phase 5 — Delete a schedule
// DELETE /v1/mis-report-v2/schedules/{scheduleId}
// ---------------------------------------------------------------------------
export const tc20DeleteSchedule = async (scheduleId) => {
  try {
    const { data: { message } } = await http.delete(`/v1/mis-report-v2/schedules/${scheduleId}`);
    return { message: message || 'Schedule deleted.', isMock: false };
  } catch (err) {
    return {
      message: 'Schedule deleted (offline mode).',
      isMock: true,
      error: err?.response?.data?.message,
    };
  }
};

// ---------------------------------------------------------------------------
// TC20 Phase 6 — Execution Logs: history for a specific schedule
// GET /v1/mis-report-v2/schedules/{scheduleId}/logs  (falls back to MOCK)
// ---------------------------------------------------------------------------
export const tc20GetScheduleLogs = async (scheduleId) => {
  try {
    const { data: { data } } = await http.get(`/v1/mis-report-v2/schedules/${scheduleId}/logs`);
    return { logs: Array.isArray(data) ? data : [], isMock: false };
  } catch {
    const logs = MOCK_LOGS.filter((l) => l.scheduleId === scheduleId);
    return { logs, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// TC20 Phase 6 — All execution logs across all schedules
// GET /v1/mis-report-v2/schedules/logs  (falls back to MOCK)
// ---------------------------------------------------------------------------
export const tc20GetAllExecutionLogs = async () => {
  try {
    const { data: { data } } = await http.get('/v1/mis-report-v2/schedules/logs');
    return { logs: Array.isArray(data) ? data : [], isMock: false };
  } catch {
    return { logs: MOCK_LOGS, isMock: true };
  }
};
