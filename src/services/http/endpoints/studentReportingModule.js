import { http } from '../http';

// ---------------------------------------------------------------------------
// TC08 & TC04 – Unified Student Reporting & Participation Monitoring
// Base: /api/v1/participation-monitoring-v2
// Mock fallbacks activate automatically on any API failure.
// ---------------------------------------------------------------------------

// -------------------------------- MOCK DATA --------------------------------

const MOCK_SUMMARY = {
  reportName: 'Administrative Participation Summary',
  generatedAt: new Date().toISOString(),
  kpis: {
    total_students: 120,
    average_participation_rate: 64.3,
    active_students: 78,
    irregular_students: 28,
    inactive_students: 14,
    alerts_triggered: 42,
    active_percentage: 65,
    irregular_percentage: 23.33,
    inactive_percentage: 11.67,
    alerts_triggered_percentage: 35,
  },
  participation_trend: [
    { month: '2025-06', active_students: 72 },
    { month: '2025-07', active_students: 80 },
    { month: '2025-08', active_students: 75 },
    { month: '2025-09', active_students: 85 },
    { month: '2025-10', active_students: 88 },
  ],
  activity_distribution: {
    login_interactions: 1240,
    quiz_interactions: 480,
    forum_interactions: 320,
    assignment_interactions: 210,
    total_interactions: 2250,
  },
  dept_breakdown: [
    { department: 'Business Studies', student_count: 32 },
    { department: 'Information Technology', student_count: 28 },
    { department: 'Accounting', student_count: 24 },
    { department: 'Human Resources', student_count: 20 },
    { department: 'Marketing', student_count: 16 },
  ],
  executionTimeMs: 512,
};

const MOCK_STUDENT_REPORTS = [
  {
    report_id: 'REP-a1b2c3d4-0001',
    student_id: 'd4e5f6a7-b8c9-0001-def0-234567890001',
    student_name: 'Uchechukwu Nwosu',
    email: 'uchechukwu.nwosu@institution.edu',
    phone: '+2348012345678',
    address: null,
    department: 'Business Studies',
    enrollment_status: 'Active',
    participation_score: 92,
    engagement_status: 'Active',
    last_active_date: '2025-10-10T11:00:00.000Z',
    days_since_active: 5,
    alert_triggered: false,
    generated_by: 'admin@institution.edu',
    generated_at: '2026-05-26T09:00:00.000Z',
    remarks: 'Excellent participation and consistent engagement',
  },
  {
    report_id: 'REP-a1b2c3d4-0002',
    student_id: 'd4e5f6a7-b8c9-0002-def0-234567890002',
    student_name: 'Daniel Okafor',
    email: 'daniel.okafor@institution.edu',
    phone: '+2348023456789',
    address: null,
    department: 'Accounting',
    enrollment_status: 'Active',
    participation_score: 58,
    engagement_status: 'Irregular',
    last_active_date: '2025-10-05T14:22:00.000Z',
    days_since_active: 21,
    alert_triggered: true,
    generated_by: 'admin@institution.edu',
    generated_at: '2026-05-26T09:00:00.000Z',
    remarks: 'Inconsistent participation detected. Encourage more regular engagement.',
  },
  {
    report_id: 'REP-a1b2c3d4-0003',
    student_id: 'd4e5f6a7-b8c9-0003-def0-234567890003',
    student_name: 'Esther Bello',
    email: 'esther.bello@institution.edu',
    phone: '+2348034567890',
    address: null,
    department: 'Information Technology',
    enrollment_status: 'Active',
    participation_score: 23,
    engagement_status: 'Inactive',
    last_active_date: '2025-09-29T09:05:00.000Z',
    days_since_active: 37,
    alert_triggered: true,
    generated_by: 'system',
    generated_at: '2026-05-26T09:00:00.000Z',
    remarks: 'Student has not logged in for over 10 days. Immediate outreach recommended.',
  },
  {
    report_id: 'REP-a1b2c3d4-0004',
    student_id: 'd4e5f6a7-b8c9-0004-def0-234567890004',
    student_name: 'Chukwuemeka Obi',
    email: 'chukwuemeka.obi@institution.edu',
    phone: '+2348045678901',
    address: null,
    department: 'Accounting',
    enrollment_status: 'Active',
    participation_score: 79,
    engagement_status: 'Active',
    last_active_date: '2025-10-09T16:45:00.000Z',
    days_since_active: 7,
    alert_triggered: false,
    generated_by: 'admin@institution.edu',
    generated_at: '2026-05-26T09:00:00.000Z',
    remarks: 'Good performance and steady engagement.',
  },
  {
    report_id: 'REP-a1b2c3d4-0005',
    student_id: 'd4e5f6a7-b8c9-0005-def0-234567890005',
    student_name: 'Fatima Abubakar',
    email: 'fatima.abubakar@institution.edu',
    phone: '+2348056789012',
    address: null,
    department: 'Human Resources',
    enrollment_status: 'Active',
    participation_score: 45,
    engagement_status: 'Irregular',
    last_active_date: '2025-10-02T08:20:00.000Z',
    days_since_active: 28,
    alert_triggered: true,
    generated_by: 'system',
    generated_at: '2026-05-26T09:00:00.000Z',
    remarks: 'Declining engagement trend observed.',
  },
];

const MOCK_PARTICIPATION_REPORT = [
  {
    student_id: 'd4e5f6a7-b8c9-0001-def0-234567890001',
    student_name: 'Uchechukwu Nwosu',
    participation_score: 92,
    activity_type: ['Access', 'Quiz', 'Forum', 'Assignment'],
    frequency_of_access: 28,
    login_count: 20,
    quiz_count: 5,
    forum_count: 8,
    assignment_count: 5,
    last_active_date: '2025-10-10T14:22:00.000Z',
    days_since_active: 5,
    engagement_status: 'Active',
    alert_triggered: false,
    remarks: 'Excellent participation and consistent engagement',
  },
  {
    student_id: 'd4e5f6a7-b8c9-0002-def0-234567890002',
    student_name: 'Daniel Okafor',
    participation_score: 58.5,
    activity_type: ['Access', 'Quiz', 'Assignment'],
    frequency_of_access: 14,
    login_count: 8,
    quiz_count: 3,
    forum_count: 0,
    assignment_count: 3,
    last_active_date: '2025-10-05T14:22:00.000Z',
    days_since_active: 21,
    engagement_status: 'Irregular',
    alert_triggered: true,
    remarks: 'Inconsistent participation detected. Encourage more regular engagement.',
  },
  {
    student_id: 'd4e5f6a7-b8c9-0003-def0-234567890003',
    student_name: 'Esther Bello',
    participation_score: 23,
    activity_type: ['Access'],
    frequency_of_access: 3,
    login_count: 3,
    quiz_count: 0,
    forum_count: 0,
    assignment_count: 1,
    last_active_date: '2025-09-29T09:05:00.000Z',
    days_since_active: 37,
    engagement_status: 'Inactive',
    alert_triggered: true,
    remarks: 'Student has not logged in for over 10 days. Immediate outreach recommended.',
  },
  {
    student_id: 'd4e5f6a7-b8c9-0004-def0-234567890004',
    student_name: 'Chukwuemeka Obi',
    participation_score: 79,
    activity_type: ['Access', 'Quiz', 'Forum', 'Assignment'],
    frequency_of_access: 21,
    login_count: 16,
    quiz_count: 4,
    forum_count: 6,
    assignment_count: 4,
    last_active_date: '2025-10-09T16:45:00.000Z',
    days_since_active: 7,
    engagement_status: 'Active',
    alert_triggered: false,
    remarks: 'Good performance and steady engagement.',
  },
  {
    student_id: 'd4e5f6a7-b8c9-0005-def0-234567890005',
    student_name: 'Fatima Abubakar',
    participation_score: 45,
    activity_type: ['Access', 'Forum'],
    frequency_of_access: 8,
    login_count: 8,
    quiz_count: 2,
    forum_count: 3,
    assignment_count: 1,
    last_active_date: '2025-10-02T08:20:00.000Z',
    days_since_active: 28,
    engagement_status: 'Irregular',
    alert_triggered: true,
    remarks: 'Declining engagement trend. Advise regular access.',
  },
];

const MOCK_COURSE_SUMMARY = [
  {
    course_id: '3fa85f64-5717-4562-b3fc-2c963f66af01',
    course_title: 'Financial Literacy',
    department: 'Business Studies',
    enrolled: 45,
    completed: 12,
    completion_rate: 26.67,
    active_students: 30,
    irregular_students: 10,
    inactive_students: 5,
    avg_participation_score: 72.4,
    alerts_triggered: 15,
  },
  {
    course_id: '3fa85f64-5717-4562-b3fc-2c963f66af02',
    course_title: 'ICT Fundamentals',
    department: 'Information Technology',
    enrolled: 38,
    completed: 8,
    completion_rate: 21.05,
    active_students: 20,
    irregular_students: 12,
    inactive_students: 6,
    avg_participation_score: 58.2,
    alerts_triggered: 18,
  },
  {
    course_id: '3fa85f64-5717-4562-b3fc-2c963f66af03',
    course_title: 'Management Accounting',
    department: 'Accounting',
    enrolled: 30,
    completed: 15,
    completion_rate: 50.0,
    active_students: 22,
    irregular_students: 5,
    inactive_students: 3,
    avg_participation_score: 81.3,
    alerts_triggered: 8,
  },
];

const MOCK_SCORING_GUIDE = {
  formula: {
    description: 'Weighted participation score (0–100) computed across four activity dimensions.',
    components: [
      { dimension: 'Login / Access activity', weight: '30%', cap: '20 logins' },
      { dimension: 'Quiz / Exam attempts', weight: '25%', cap: '5 attempts' },
      { dimension: 'Forum contributions', weight: '25%', cap: '10 posts + comments' },
      { dimension: 'Assignment submissions', weight: '20%', cap: '5 submissions' },
    ],
  },
  engagementStatuses: [
    { status: 'Active', threshold: '≥ 70', alert: false },
    { status: 'Irregular', threshold: '40 – 69', alert: true },
    { status: 'Inactive', threshold: '< 40', alert: true },
  ],
};

const MOCK_AT_RISK = {
  reportName: 'Student Participation Monitoring Report',
  generatedAt: new Date().toISOString(),
  total: 5,
  page: 1,
  limit: 50,
  recordCount: 5,
  kpis: MOCK_SUMMARY.kpis,
  data: MOCK_PARTICIPATION_REPORT.filter((s) => s.alert_triggered),
};

// ---------------------------------------------------------------------------
// GET /api/v1/participation-monitoring-v2/scoring-guide
// ---------------------------------------------------------------------------
export const pm2GetScoringGuide = async () => {
  try {
    const { data } = await http.get('/v1/participation-monitoring-v2/scoring-guide');
    return { guide: data?.data ?? data, isMock: false };
  } catch {
    return { guide: MOCK_SCORING_GUIDE, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/participation-monitoring-v2/at-risk
// ---------------------------------------------------------------------------
export const pm2GetAtRiskStudents = async (params = {}) => {
  try {
    const { data } = await http.get('/v1/participation-monitoring-v2/at-risk', { params });
    return { result: data?.data ?? data, isMock: false };
  } catch {
    const { page = 1, limit = 50 } = params;
    return { result: { ...MOCK_AT_RISK, page, limit }, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/participation-monitoring-v2/student-report  (TC08)
// ---------------------------------------------------------------------------
export const pm2GetStudentReport = async (params = {}) => {
  try {
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
      isMock: false,
    };
  } catch {
    return {
      reports: MOCK_STUDENT_REPORTS,
      total: MOCK_STUDENT_REPORTS.length,
      page: 1,
      totalPages: 1,
      generatedBy: null,
      generatedAt: null,
      isMock: true,
    };
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/participation-monitoring-v2/summary
// ---------------------------------------------------------------------------
export const pm2GetSummary = async (params = {}) => {
  try {
    const { data } = await http.get('/v1/participation-monitoring-v2/summary', { params });
    return { summary: data?.data ?? data, isMock: false };
  } catch {
    return { summary: MOCK_SUMMARY, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/participation-monitoring-v2/course-summary
// ---------------------------------------------------------------------------
export const pm2GetCourseSummary = async (params = {}) => {
  try {
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
      isMock: false,
    };
  } catch {
    return { courses: MOCK_COURSE_SUMMARY, total: MOCK_COURSE_SUMMARY.length, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/participation-monitoring-v2/report  (TC04)
// ---------------------------------------------------------------------------
export const pm2GetParticipationReport = async (params = {}) => {
  try {
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
      isMock: false,
    };
  } catch {
    return {
      records: MOCK_PARTICIPATION_REPORT,
      total: MOCK_PARTICIPATION_REPORT.length,
      page: 1,
      totalPages: 1,
      kpis: MOCK_SUMMARY.kpis,
      isMock: true,
    };
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/participation-monitoring-v2/report/{studentId}
// ---------------------------------------------------------------------------
export const pm2GetStudentParticipation = async (studentId, params = {}) => {
  try {
    const { data } = await http.get(
      `/v1/participation-monitoring-v2/report/${studentId}`,
      { params },
    );
    return { record: data?.data ?? data, isMock: false };
  } catch {
    const record =
      MOCK_PARTICIPATION_REPORT.find((r) => r.student_id === studentId) ??
      MOCK_PARTICIPATION_REPORT[0];
    return { record, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// POST /api/v1/participation-monitoring-v2/intervention
// ---------------------------------------------------------------------------
export const pm2LogIntervention = async (body) => {
  try {
    const { data } = await http.post('/v1/participation-monitoring-v2/intervention', body);
    return { intervention: data?.data ?? data, message: data?.message ?? 'Intervention logged successfully.', isMock: false };
  } catch (err) {
    return {
      intervention: {
        intervention_id: `INTV-${String(Date.now()).slice(-6)}`,
        student_id: body.studentId,
        course_id: body.courseId,
        remark: body.remark,
        action_taken: body.actionTaken,
        logged_at: new Date().toISOString(),
        current_participation_score: null,
        current_engagement_status: null,
      },
      message: 'Intervention logged (offline mode).',
      isMock: true,
      error: err?.response?.data?.message,
    };
  }
};

// ---------------------------------------------------------------------------
// KPI loader for module header — derived from /summary
// ---------------------------------------------------------------------------
export const pm2GetModuleKPIs = async () => {
  try {
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
  } catch {
    return { kpis: null };
  }
};

// ---------------------------------------------------------------------------
// Legacy aliases — kept so any other file importing these still compiles
// ---------------------------------------------------------------------------
export const tc0804GetStudentReports = pm2GetStudentReport;
export const tc0804GetParticipationRecords = pm2GetParticipationReport;
export const tc0804GetParticipationSummary = pm2GetSummary;
export const tc0804GetModuleKPIs = pm2GetModuleKPIs;
export const tc0804GetStudentParticipationById = (id) => pm2GetStudentParticipation(id);
export const tc0804CreateStudentReport = async () => ({ isMock: true });
export const tc0804BulkGenerateReports = async () => ({ isMock: true });
export const tc0804GetReportTemplates = async () => ({ templates: [], isMock: true });
