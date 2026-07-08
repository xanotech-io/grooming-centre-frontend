import { http } from "../http";

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
};

/**
 * TC27 - Get course roster
 * GET /api/v1/course-roster-v2/{courseId}
 */
export const adminGetCourseRoster = async (courseId, params = {}) => {
  const { data } = await http.get(`/v1/course-roster-v2/${courseId}`, { params });
  const payload = data?.data ?? data ?? {};

  const students = (payload.students ?? []).map((s) => ({
    studentId: s.student_id ?? s.studentId,
    ...splitName(s.student_name ?? s.studentName),
    email: s.email,
    phoneNumber: s.phone_number ?? s.phoneNumber,
    enrollmentStatus: s.enrollment_status ?? s.enrollmentStatus,
    progressPercentage: s.progress_percentage ?? s.progressPercentage,
    grade: s.grade,
    enrollmentDate: s.date_enrolled ?? s.enrollmentDate,
  }));

  const progressValues = students
    .map((s) => s.progressPercentage)
    .filter((v) => v != null);

  return {
    roster: {
      courseName: payload.course_title ?? payload.courseName,
      semester: payload.semester,
      instructor: payload.instructor
        ? { name: payload.instructor.name ?? payload.instructor }
        : null,
      students,
      summary: {
        totalStudents: payload.total ?? students.length,
        enrolled: students.filter((s) => s.enrollmentStatus === "Enrolled").length || null,
        pending: students.filter((s) => s.enrollmentStatus === "Pending").length || null,
        completed: students.filter((s) => s.enrollmentStatus === "Completed").length || null,
        averageProgress: progressValues.length
          ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
          : null,
      },
    },
    pagination: {
      page: payload.page ?? params.page ?? 1,
      totalItems: payload.total ?? students.length,
      totalPages: payload.total_pages ?? payload.totalPages ?? 1,
    },
  };
};

/**
 * TC27 - Export course roster as PDF, Excel, or CSV
 * POST /api/v1/course-roster-v2/{courseId}/export
 */
export const adminExportCourseRoster = async (courseId, body = {}) => {
  const { data } = await http.post(`/v1/course-roster-v2/${courseId}/export`, body);
  return data?.data ?? data;
};

/**
 * TC27 - Get the status of a course roster export
 * GET /api/v1/course-roster-v2/export/{exportId}/status
 */
export const adminGetCourseRosterExportStatus = async (exportId) => {
  const { data } = await http.get(`/v1/course-roster-v2/export/${exportId}/status`);
  return data?.data ?? data;
};

/**
 * TC27 - Download a course roster export file
 * GET /api/v1/course-roster-v2/export/{exportId}/download
 */
export const adminDownloadCourseRosterExport = async (exportId) => {
  const { data } = await http.get(`/v1/course-roster-v2/export/${exportId}/download`);
  return data?.data ?? data;
};
