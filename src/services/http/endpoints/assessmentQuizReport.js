import { http } from "../http";

// GET /v1/course/admin/list — lightweight course list for report pickers
export const adminListCoursesForReport = async (params = {}) => {
  const { data } = await http.get("/v1/course/admin/list", {
    params: { sort: "desc", ...params },
  });
  const raw = data?.data ?? {};
  const rows = (raw.rows ?? []).map((course) => ({
    id: course.id,
    title: course.title ?? "—",
    instructorName: course.user
      ? `${course.user.firstName ?? ""} ${course.user.lastName ?? ""}`.trim() || "—"
      : "—",
    isPublished: course.isPublished ? "Published" : "Draft",
  }));
  return {
    rows,
    totalDocumentsCount: raw.count ?? rows.length,
    showingDocumentsCount: rows.length,
  };
};

// GET /api/v1/assessment-quiz-report-v2/my-results
export const studentGetMyAssessmentResults = async (params = {}) => {
  const { data } = await http.get("/v1/assessment-quiz-report-v2/my-results", {
    params,
  });
  return data;
};

// GET /api/v1/assessment-quiz-report-v2/course/{courseId}
export const adminGetCourseAssessmentResults = async (courseId, params = {}) => {
  const { data } = await http.get(
    `/v1/assessment-quiz-report-v2/course/${courseId}`,
    { params },
  );
  return data;
};

// PUT /api/v1/assessment-quiz-report-v2/feedback/{scoresheetId}
export const adminAddAssessmentFeedback = async (scoresheetId, body) => {
  const { data } = await http.put(
    `/v1/assessment-quiz-report-v2/feedback/${scoresheetId}`,
    body,
  );
  return data;
};

// GET /api/v1/assessment-quiz-report-v2/student/{studentId}
export const adminGetStudentAssessmentResults = async (studentId, params = {}) => {
  const { data } = await http.get(
    `/v1/assessment-quiz-report-v2/student/${studentId}`,
    { params },
  );
  return data;
};

// GET /api/v1/assessment-quiz-report-v2/overview
export const adminGetAssessmentOverview = async (params = {}) => {
  const { data } = await http.get(
    `/v1/assessment-quiz-report-v2/overview`,
    { params },
  );
  return data;
};

// GET /api/v1/assessment-quiz-report-v2/overview/export
export const adminExportAssessmentOverview = async (params = {}) => {
  const response = await http.get(
    `/v1/assessment-quiz-report-v2/overview/export`,
    { params, responseType: "blob" },
  );
  return response.data;
};

// GET /api/v1/assessment-quiz-report-v2/department
export const supervisorGetDepartmentReport = async (params = {}) => {
  const { data } = await http.get(
    `/v1/assessment-quiz-report-v2/department`,
    { params },
  );
  return data;
};

// POST /api/v1/assessment-quiz-report-v2/evaluate/{assessmentId}
export const supervisorEvaluateAssessment = async (assessmentId, body) => {
  const { data } = await http.post(
    `/v1/assessment-quiz-report-v2/evaluate/${assessmentId}`,
    body,
  );
  return data;
};

// GET /api/v1/assessment-quiz-report-v2/evaluations
export const supervisorGetMyEvaluations = async () => {
  const { data } = await http.get(`/v1/assessment-quiz-report-v2/evaluations`);
  return data;
};

// GET /api/v1/assessment-quiz-report-v2/filters/students
export const adminGetAssessmentReportStudentFilters = async (params = {}) => {
  const { data } = await http.get(
    `/v1/assessment-quiz-report-v2/filters/students`,
    { params },
  );
  const raw = data?.data ?? data ?? {};
  return raw.students ?? raw.rows ?? (Array.isArray(raw) ? raw : []);
};

// GET /api/v1/assessment-quiz-report-v2/filters/instructors
export const adminGetAssessmentReportInstructorFilters = async (params = {}) => {
  const { data } = await http.get(
    `/v1/assessment-quiz-report-v2/filters/instructors`,
    { params },
  );
  const raw = data?.data ?? data ?? {};
  return raw.instructors ?? raw.rows ?? (Array.isArray(raw) ? raw : []);
};
