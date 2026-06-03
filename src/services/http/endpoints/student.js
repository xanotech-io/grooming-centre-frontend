import { http } from "../http";

export const adminGetStudents = async (params = {}) => {
  const { data } = await http.get('/v1/admin/students', { params });
  const d = data?.data ?? {};
  return {
    students: d.rows ?? (Array.isArray(d) ? d : []),
    count: d.count ?? 0,
  };
};

/**
 * TC01 – Progress Report
 * GET /v2/students/{studentId}/progress
 */
export const getStudentProgress = async (studentId, params) => {
  const { data } = await http.get(`/v2/students/${studentId}/progress`, { params });
  return data;
};

/**
 * TC01 – Progress Summary
 * GET /v2/students/{studentId}/progress/summary
 */
export const getStudentProgressSummary = async (studentId, params) => {
  const { data } = await http.get(`/v2/students/${studentId}/progress/summary`, { params });
  return data;
};

/**
 * TC02 – Transcript Report
 * GET /v2/students/{studentId}/transcript
 */
export const getStudentTranscript = async (studentId, params) => {
  const { data } = await http.get(`/v2/students/${studentId}/transcript`, { params });
  return data;
};

/**
 * TC03 – Attendance Report
 * GET /v2/students/{studentId}/attendance
 */
export const getStudentAttendance = async (studentId, params) => {
  const { data } = await http.get(`/v2/students/${studentId}/attendance`, { params });
  return data;
};

/**
 * TC03 – Attendance Summary
 * GET /v2/students/{studentId}/attendance/summary
 */
export const getStudentAttendanceSummary = async (studentId, params) => {
  const { data } = await http.get(`/v2/students/${studentId}/attendance/summary`, { params });
  return data;
};

/**
 * TC04 – Assessment & Quiz Report
 * GET /v2/students/{studentId}/assessments
 */
export const getStudentAssessments = async (studentId, params) => {
  const { data } = await http.get(`/v2/students/${studentId}/assessments`, { params });
  return data;
};
