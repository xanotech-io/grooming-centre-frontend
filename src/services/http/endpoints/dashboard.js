// import { http } from '../http';
import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_ACADEMIC_METRICS = {
  totalEnrollments: 1482,
  activeStudents: 1214,
  completionRate: 78.4,
  passRate: 85.2,
  averageGPA: 3.45,
  certificatesIssued: 312,
  atRiskStudents: 94,
  failingStudents: 47,
  byDepartment: [
    {
      department: "Agriculture",
      enrollments: 342,
      completionRate: 81.2,
      passRate: 88.4,
      averageGPA: 3.51,
      certificatesIssued: 76,
    },
    {
      department: "Business Administration",
      enrollments: 298,
      completionRate: 74.8,
      passRate: 83.1,
      averageGPA: 3.38,
      certificatesIssued: 61,
    },
    {
      department: "Information Technology",
      enrollments: 265,
      completionRate: 80.0,
      passRate: 86.7,
      averageGPA: 3.55,
      certificatesIssued: 58,
    },
    {
      department: "Health Sciences",
      enrollments: 231,
      completionRate: 76.2,
      passRate: 84.0,
      averageGPA: 3.42,
      certificatesIssued: 49,
    },
    {
      department: "Education",
      enrollments: 189,
      completionRate: 79.9,
      passRate: 85.7,
      averageGPA: 3.49,
      certificatesIssued: 43,
    },
    {
      department: "Science & Engineering",
      enrollments: 157,
      completionRate: 72.6,
      passRate: 80.3,
      averageGPA: 3.31,
      certificatesIssued: 25,
    },
  ],
};

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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/dashboard/metrics/academic', { params });
  // return { metrics: data };

  return { metrics: MOCK_ACADEMIC_METRICS };
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
