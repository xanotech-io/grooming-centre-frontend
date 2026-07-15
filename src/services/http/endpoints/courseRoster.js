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
    attendancePercentage: s.attendance_percentage ?? s.attendancePercentage,
    latestAssessmentScore: s.latest_assessment_score ?? s.latestAssessmentScore,
    enrollmentDate: s.date_enrolled ?? s.enrollmentDate,
  }));

  const progressValues = students
    .map((s) => s.progressPercentage)
    .filter((v) => v != null);

  const attendanceValues = students
    .map((s) => s.attendancePercentage)
    .filter((v) => v != null);

  const totalStudents = payload.total ?? students.length;
  const completedCount = students.filter((s) => s.enrollmentStatus === "Completed").length;
  const activeEnrollmentCount =
    payload.active_enrollment_count ??
    students.filter((s) => s.enrollmentStatus === "Enrolled").length;

  return {
    roster: {
      courseName: payload.course_title ?? payload.courseName,
      semester: payload.semester,
      instructor: payload.instructor
        ? { name: payload.instructor.name ?? payload.instructor }
        : null,
      students,
      summary: {
        totalStudents,
        enrolled: activeEnrollmentCount || null,
        pending: students.filter((s) => s.enrollmentStatus === "Pending").length || null,
        completed: completedCount || null,
        averageProgress: progressValues.length
          ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
          : null,
        activeEnrollmentCount,
        enrollmentToCompletionRatio:
          payload.enrollment_to_completion_ratio ??
          (totalStudents ? completedCount / totalStudents : null),
        averageAttendanceRate:
          payload.average_attendance_rate ??
          (attendanceValues.length
            ? attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length
            : null),
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
  const { format, ...rest } = body;
  const requestBody = {
    ...rest,
    export_format: (format ?? "").toLowerCase(),
  };

  const { data } = await http.post(`/v1/course-roster-v2/${courseId}/export`, requestBody);
  const payload = data?.data ?? data ?? {};

  return {
    exportRecord: {
      exportId: payload.id,
      operationType: payload.operationType,
      reportType: payload.reportType,
      reportName: payload.reportName,
      format: payload.exportFormat,
      exportedBy: payload.exportedBy,
      exporter: payload.exporter,
      filters: payload.filters,
      status: payload.status,
      fileName: payload.fileName,
      fileUrl: payload.fileUrl,
      fileSizeMb: payload.fileSizeMb,
      expiryDate: payload.expiryDate,
      totalRecords: payload.totalRecords,
      errorMessage: payload.errorMessage,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    },
  };
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
