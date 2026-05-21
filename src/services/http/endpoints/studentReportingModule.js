import { http } from '../http';

// ---------------------------------------------------------------------------
// TC08 & TC04 – Unified Student Reporting & Participation Monitoring Module
// Mock data activates automatically when any API call fails.
// ---------------------------------------------------------------------------

// -------------------------------- MOCK DATA --------------------------------

const MOCK_REPORTS = [
  {
    reportId: 'REP-1021',
    studentId: 'STU-2025-054',
    studentName: 'Uchechi Nwosu',
    address: '14 Palm Close, Lekki, Lagos',
    program: 'Financial Services',
    enrollmentStatus: 'Active',
    course: 'Financial Literacy',
    participationScore: 92,
    engagementStatus: 'Active',
    lastActiveDate: '2025-10-10',
    alertTriggered: false,
    generatedBy: 'Admin User',
    timestamp: '2025-10-11T08:30:00Z',
    remarks: 'Excellent participation',
    activityType: 'Course Access',
    frequencyOfAccess: 28,
    instructor: 'Dr. Adeyemi',
  },
  {
    reportId: 'REP-1022',
    studentId: 'STU-3045-029',
    studentName: 'Daniel Okafor',
    address: '5 Marina Drive, Victoria Island, Lagos',
    program: 'Business Administration',
    enrollmentStatus: 'Active',
    course: 'Business Analytics',
    participationScore: 58,
    engagementStatus: 'Irregular',
    lastActiveDate: '2025-10-05',
    alertTriggered: true,
    generatedBy: 'Admin User',
    timestamp: '2025-10-11T08:31:00Z',
    remarks: 'Needs engagement improvement',
    activityType: 'Assignment',
    frequencyOfAccess: 12,
    instructor: 'Prof. Mensah',
  },
  {
    reportId: 'REP-1023',
    studentId: 'STU-3045-044',
    studentName: 'Esther Bello',
    address: '22 Ring Road, Ibadan, Oyo',
    program: 'Information Technology',
    enrollmentStatus: 'Active',
    course: 'ICT Fundamentals',
    participationScore: 23,
    engagementStatus: 'Inactive',
    lastActiveDate: '2025-09-29',
    alertTriggered: true,
    generatedBy: 'System',
    timestamp: '2025-10-11T08:32:00Z',
    remarks: 'No login activity for over 10 days',
    activityType: 'Login',
    frequencyOfAccess: 3,
    instructor: 'Mrs. Eze',
  },
  {
    reportId: 'REP-1024',
    studentId: 'STU-1102-011',
    studentName: 'Chukwuemeka Obi',
    address: '8 New Layout, Enugu',
    program: 'Accounting',
    enrollmentStatus: 'Active',
    course: 'Management Accounting',
    participationScore: 79,
    engagementStatus: 'Active',
    lastActiveDate: '2025-10-09',
    alertTriggered: false,
    generatedBy: 'Admin User',
    timestamp: '2025-10-11T08:33:00Z',
    remarks: 'Good performance',
    activityType: 'Quiz',
    frequencyOfAccess: 21,
    instructor: 'Dr. Adeyemi',
  },
  {
    reportId: 'REP-1025',
    studentId: 'STU-2088-067',
    studentName: 'Fatima Abubakar',
    address: '3 Sultan Road, Kaduna',
    program: 'Human Resources',
    enrollmentStatus: 'Active',
    course: 'Organisational Behaviour',
    participationScore: 45,
    engagementStatus: 'Irregular',
    lastActiveDate: '2025-10-02',
    alertTriggered: true,
    generatedBy: 'System',
    timestamp: '2025-10-11T08:34:00Z',
    remarks: 'Declining engagement trend',
    activityType: 'Forum',
    frequencyOfAccess: 8,
    instructor: 'Prof. Mensah',
  },
  {
    reportId: 'REP-1026',
    studentId: 'STU-0991-033',
    studentName: 'Adeola Fashola',
    address: '77 Agodi GRA, Ibadan',
    program: 'Marketing',
    enrollmentStatus: 'Suspended',
    course: 'Digital Marketing',
    participationScore: 10,
    engagementStatus: 'Inactive',
    lastActiveDate: '2025-09-15',
    alertTriggered: true,
    generatedBy: 'System',
    timestamp: '2025-10-11T08:35:00Z',
    remarks: 'Account suspended; no activity',
    activityType: 'Login',
    frequencyOfAccess: 1,
    instructor: 'Mrs. Eze',
  },
  {
    reportId: 'REP-1027',
    studentId: 'STU-4401-078',
    studentName: 'Biodun Adeleke',
    address: '10 Ikorodu Road, Lagos',
    program: 'Financial Services',
    enrollmentStatus: 'Active',
    course: 'Financial Literacy',
    participationScore: 85,
    engagementStatus: 'Active',
    lastActiveDate: '2025-10-10',
    alertTriggered: false,
    generatedBy: 'Admin User',
    timestamp: '2025-10-11T08:36:00Z',
    remarks: 'Consistent learner',
    activityType: 'Course Access',
    frequencyOfAccess: 24,
    instructor: 'Dr. Adeyemi',
  },
  {
    reportId: 'REP-1028',
    studentId: 'STU-5503-019',
    studentName: 'Ngozi Eze',
    address: '4 Awka Road, Onitsha',
    program: 'Information Technology',
    enrollmentStatus: 'Active',
    course: 'ICT Fundamentals',
    participationScore: 31,
    engagementStatus: 'Inactive',
    lastActiveDate: '2025-09-27',
    alertTriggered: true,
    generatedBy: 'System',
    timestamp: '2025-10-11T08:37:00Z',
    remarks: 'Missed 3 consecutive assignments',
    activityType: 'Assignment',
    frequencyOfAccess: 5,
    instructor: 'Mrs. Eze',
  },
];

const MOCK_PARTICIPATION = [
  {
    id: 1,
    userId: 'STU-2025-054',
    studentName: 'Uchechi Nwosu',
    course: 'Financial Literacy',
    participationScore: 92,
    activityType: 'Course Access',
    frequencyOfAccess: 28,
    lastLoginAt: '2025-10-10T14:22:00Z',
    engagementLevel: 'high',
    alertTriggered: false,
    loginCount: 28,
    forumsParticipated: 6,
    assignmentsSubmitted: 8,
    activeDays: 18,
    totalTimeMinutes: 1240,
    instructorRemarks: '',
  },
  {
    id: 2,
    userId: 'STU-3045-029',
    studentName: 'Daniel Okafor',
    course: 'Business Analytics',
    participationScore: 58,
    activityType: 'Assignment',
    frequencyOfAccess: 12,
    lastLoginAt: '2025-10-05T11:10:00Z',
    engagementLevel: 'medium',
    alertTriggered: true,
    loginCount: 12,
    forumsParticipated: 2,
    assignmentsSubmitted: 4,
    activeDays: 9,
    totalTimeMinutes: 510,
    instructorRemarks: 'Follow-up scheduled for next week',
  },
  {
    id: 3,
    userId: 'STU-3045-044',
    studentName: 'Esther Bello',
    course: 'ICT Fundamentals',
    participationScore: 23,
    activityType: 'Login',
    frequencyOfAccess: 3,
    lastLoginAt: '2025-09-29T09:05:00Z',
    engagementLevel: 'low',
    alertTriggered: true,
    loginCount: 3,
    forumsParticipated: 0,
    assignmentsSubmitted: 1,
    activeDays: 2,
    totalTimeMinutes: 90,
    instructorRemarks: 'Alert sent; no response yet',
  },
  {
    id: 4,
    userId: 'STU-1102-011',
    studentName: 'Chukwuemeka Obi',
    course: 'Management Accounting',
    participationScore: 79,
    activityType: 'Quiz',
    frequencyOfAccess: 21,
    lastLoginAt: '2025-10-09T16:45:00Z',
    engagementLevel: 'high',
    alertTriggered: false,
    loginCount: 21,
    forumsParticipated: 4,
    assignmentsSubmitted: 7,
    activeDays: 15,
    totalTimeMinutes: 980,
    instructorRemarks: '',
  },
  {
    id: 5,
    userId: 'STU-2088-067',
    studentName: 'Fatima Abubakar',
    course: 'Organisational Behaviour',
    participationScore: 45,
    activityType: 'Forum',
    frequencyOfAccess: 8,
    lastLoginAt: '2025-10-02T08:20:00Z',
    engagementLevel: 'medium',
    alertTriggered: true,
    loginCount: 8,
    forumsParticipated: 1,
    assignmentsSubmitted: 3,
    activeDays: 6,
    totalTimeMinutes: 310,
    instructorRemarks: 'Advised to increase engagement',
  },
  {
    id: 6,
    userId: 'STU-0991-033',
    studentName: 'Adeola Fashola',
    course: 'Digital Marketing',
    participationScore: 10,
    activityType: 'Login',
    frequencyOfAccess: 1,
    lastLoginAt: '2025-09-15T07:00:00Z',
    engagementLevel: 'low',
    alertTriggered: true,
    loginCount: 1,
    forumsParticipated: 0,
    assignmentsSubmitted: 0,
    activeDays: 1,
    totalTimeMinutes: 15,
    instructorRemarks: 'Escalated to academic admin',
  },
  {
    id: 7,
    userId: 'STU-4401-078',
    studentName: 'Biodun Adeleke',
    course: 'Financial Literacy',
    participationScore: 85,
    activityType: 'Course Access',
    frequencyOfAccess: 24,
    lastLoginAt: '2025-10-10T10:00:00Z',
    engagementLevel: 'high',
    alertTriggered: false,
    loginCount: 24,
    forumsParticipated: 5,
    assignmentsSubmitted: 7,
    activeDays: 17,
    totalTimeMinutes: 1100,
    instructorRemarks: '',
  },
  {
    id: 8,
    userId: 'STU-5503-019',
    studentName: 'Ngozi Eze',
    course: 'ICT Fundamentals',
    participationScore: 31,
    activityType: 'Assignment',
    frequencyOfAccess: 5,
    lastLoginAt: '2025-09-27T13:30:00Z',
    engagementLevel: 'low',
    alertTriggered: true,
    loginCount: 5,
    forumsParticipated: 0,
    assignmentsSubmitted: 1,
    activeDays: 3,
    totalTimeMinutes: 145,
    instructorRemarks: 'Alert triggered; intervention in progress',
  },
];

const MOCK_KPIS = {
  avgParticipationRate: 52.9,
  totalActiveStudents: 3,
  totalInactiveStudents: 3,
  totalIrregularStudents: 2,
  alertsTriggered: 5,
  reportsGeneratedThisMonth: 24,
  avgReportGenerationTime: 1.8,
  reportAccuracyRate: 98.5,
  dataRetrievalSuccessRate: 97.2,
  postInterventionImprovement: 12.4,
  avgInstructorResponseTime: '4.2 hrs',
};

const MOCK_TEMPLATES = [
  { id: 'T1', name: 'Standard Student Report', type: 'student', description: 'Full student profile with enrollment details' },
  { id: 'T2', name: 'Participation Summary', type: 'participation', description: 'Engagement and activity summary per course' },
  { id: 'T3', name: 'Detailed Progress Report', type: 'training_progress', description: 'Detailed learning progress with assessment scores' },
  { id: 'T4', name: 'Enrollment Status Overview', type: 'enrollment_status', description: 'Current enrollment and status across all courses' },
  { id: 'T5', name: 'Custom Work List', type: 'custom', description: 'Configurable column selection across LMS modules' },
];

// ---------------------------------------------------------------------------
// TC08 — Student Report Generation
// GET /v2/reports/student
// ---------------------------------------------------------------------------
export const tc0804GetStudentReports = async (params = {}) => {
  try {
    const { data } = await http.get('/v2/reports/student', { params });
    const rows = Array.isArray(data?.data) ? data.data
      : Array.isArray(data?.rows) ? data.rows
      : Array.isArray(data) ? data : [];
    return { reports: rows, total: data?.count ?? rows.length, isMock: false };
  } catch {
    const { search, enrollmentStatus, participationLevel, department, course } = params;
    let filtered = [...MOCK_REPORTS];
    if (search) filtered = filtered.filter(r =>
      r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId?.toLowerCase().includes(search.toLowerCase())
    );
    if (enrollmentStatus) filtered = filtered.filter(r => r.enrollmentStatus === enrollmentStatus);
    if (department) filtered = filtered.filter(r => r.program?.toLowerCase().includes(department.toLowerCase()));
    if (course) filtered = filtered.filter(r => r.course?.toLowerCase().includes(course.toLowerCase()));
    if (participationLevel === 'high') filtered = filtered.filter(r => r.participationScore >= 70);
    else if (participationLevel === 'medium') filtered = filtered.filter(r => r.participationScore >= 40 && r.participationScore < 70);
    else if (participationLevel === 'low') filtered = filtered.filter(r => r.participationScore < 40);
    return { reports: filtered, total: filtered.length, isMock: true };
  }
};

// POST /v2/reports/student
export const tc0804CreateStudentReport = async (body) => {
  try {
    const { data } = await http.post('/v2/reports/student', body);
    return { report: data?.data ?? data, message: data?.message ?? 'Report generated successfully.', isMock: false };
  } catch (err) {
    const mock = {
      reportId: `REP-${String(Date.now()).slice(-4)}`,
      ...body,
      generatedBy: 'Admin User',
      timestamp: new Date().toISOString(),
      engagementStatus: 'Active',
      participationScore: Math.floor(Math.random() * 60) + 30,
      alertTriggered: false,
    };
    return { report: mock, message: 'Report generated (offline mode).', isMock: true, error: err?.response?.data?.message };
  }
};

// POST /v2/reports/student/bulk
export const tc0804BulkGenerateReports = async (body) => {
  try {
    const { data } = await http.post('/v2/reports/student/bulk', body);
    return { jobId: data?.data?.jobId, totalReports: data?.data?.totalReports, message: 'Bulk generation started.', isMock: false };
  } catch (err) {
    return {
      jobId: `JOB-${String(Date.now()).slice(-4)}`,
      totalReports: body?.userIds?.length ?? 0,
      message: 'Bulk generation queued (offline mode).',
      isMock: true,
      error: err?.response?.data?.message,
    };
  }
};

// GET /v2/reports/templates
export const tc0804GetReportTemplates = async (params = {}) => {
  try {
    const { data } = await http.get('/v2/reports/templates', { params });
    const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data?.rows) ? data.rows : [];
    return { templates: rows, isMock: false };
  } catch {
    return { templates: MOCK_TEMPLATES, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// TC04 — Participation & Engagement Monitoring
// GET /v2/registers/participation
// ---------------------------------------------------------------------------
export const tc0804GetParticipationRecords = async (params = {}) => {
  try {
    const { data } = await http.get('/v2/registers/participation', { params });
    const rows = Array.isArray(data?.data) ? data.data
      : Array.isArray(data?.rows) ? data.rows
      : Array.isArray(data) ? data : [];
    return { records: rows, total: data?.count ?? rows.length, isMock: false };
  } catch {
    const { search, engagementLevel } = params;
    let filtered = [...MOCK_PARTICIPATION];
    if (search) filtered = filtered.filter(r => r.studentName?.toLowerCase().includes(search.toLowerCase()));
    if (engagementLevel) filtered = filtered.filter(r => r.engagementLevel === engagementLevel);
    return { records: filtered, total: filtered.length, isMock: true };
  }
};

// GET /v2/registers/participation/summary
export const tc0804GetParticipationSummary = async (params = {}) => {
  try {
    const { data } = await http.get('/v2/registers/participation/summary', { params });
    return { summary: data?.data ?? data, isMock: false };
  } catch {
    return { summary: MOCK_KPIS, isMock: true };
  }
};

// GET /v2/registers/participation/{userId}
export const tc0804GetStudentParticipationById = async (userId) => {
  try {
    const { data } = await http.get(`/v2/registers/participation/${userId}`);
    return { record: data?.data ?? data, isMock: false };
  } catch {
    const record = MOCK_PARTICIPATION.find(r => r.userId === userId) ?? MOCK_PARTICIPATION[0];
    return { record, isMock: true };
  }
};

// ---------------------------------------------------------------------------
// KPI Computation — aggregates from participation + reports endpoints
// ---------------------------------------------------------------------------
export const tc0804GetModuleKPIs = async () => {
  try {
    const { data } = await http.get('/v2/registers/participation/summary');
    return { kpis: data?.data ?? MOCK_KPIS, isMock: false };
  } catch {
    return { kpis: MOCK_KPIS, isMock: true };
  }
};
