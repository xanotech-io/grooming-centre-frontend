import { http } from '../http';

// POST /api/v1/student-attendance-v2/record
export const recordStudentAttendance = async (body) => {
  const { data } = await http.post('/v1/student-attendance-v2/record', body);
  return data;
};

// GET /api/v1/student-attendance-v2/report
export const getAttendanceReport = async (params) => {
  const { data } = await http.get('/v1/student-attendance-v2/report', { params });
  return data;
};

// GET /api/v1/student-attendance-v2/{studentId}
export const getStudentAttendanceV2 = async (studentId) => {
  const { data } = await http.get(`/v1/student-attendance-v2/${studentId}`);
  return data;
};

// GET /api/v1/student-attendance-v2/{studentId}/course/{courseId}
export const getStudentCourseAttendanceV2 = async (studentId, courseId) => {
  const { data } = await http.get(`/v1/student-attendance-v2/${studentId}/course/${courseId}`);
  return data;
};
