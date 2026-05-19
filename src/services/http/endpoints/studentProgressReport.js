import { http } from "../http";

/**
 * GET /api/v1/student-progress-v2/progress/me
 * Returns consolidated progress report across all enrolled courses
 * + summary KPIs and per-course breakdown.
 */
export const studentGetMyProgressReport = async () => {
  const { data } = await http.get("/v1/student-progress-v2/progress/me");
  return data;
};

/**
 * GET /api/v1/student-progress-v2/progress/me/course/{courseId}
 * Returns detailed progress for a single course.
 */
export const studentGetMyCourseProgress = async (courseId) => {
  const { data } = await http.get(
    `/v1/student-progress-v2/progress/me/course/${courseId}`
  );
  return data;
};

/**
 * GET /api/v1/student-progress-v2/kpis/me
 * Returns distilled KPIs across all enrolled courses.
 */
export const studentGetMyProgressKPIs = async () => {
  const { data } = await http.get("/v1/student-progress-v2/kpis/me");
  return data;
};

/**
 * GET /api/v1/student-progress-v2/activity/me
 * Returns session-based activity: logins, time spent.
 */
export const studentGetMyActivity = async () => {
  const { data } = await http.get("/v1/student-progress-v2/activity/me");
  return data;
};

// ─── Admin endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/v1/student-progress-v2/progress/{studentId}
 * Admin: full consolidated progress report for any student.
 */
export const adminGetStudentProgressReport = async (studentId) => {
  const { data } = await http.get(
    `/v1/student-progress-v2/progress/${studentId}`
  );
  return data;
};

/**
 * GET /api/v1/student-progress-v2/progress/{studentId}/course/{courseId}
 * Admin: focused progress for a single student + single course.
 */
export const adminGetStudentCourseProgress = async (studentId, courseId) => {
  const { data } = await http.get(
    `/v1/student-progress-v2/progress/${studentId}/course/${courseId}`
  );
  return data;
};

/**
 * GET /api/v1/student-progress-v2/kpis/{studentId}
 * Admin: distilled KPI summary for a student.
 */
export const adminGetStudentProgressKPIs = async (studentId) => {
  const { data } = await http.get(
    `/v1/student-progress-v2/kpis/${studentId}`
  );
  return data;
};

/**
 * GET /api/v1/student-progress-v2/activity/{studentId}
 * Admin: session-based activity metrics for a student.
 */
export const adminGetStudentActivityReport = async (studentId) => {
  const { data } = await http.get(
    `/v1/student-progress-v2/activity/${studentId}`
  );
  return data;
};

/**
 * GET /api/v1/student-progress-v2/training-report/{studentId}
 * Admin: unified TC09 student training & progress report (all 7 phases).
 */
export const adminGetStudentTrainingReport = async (studentId) => {
  const { data } = await http.get(
    `/v1/student-progress-v2/training-report/${studentId}`
  );
  return data;
};
