import { http } from "../http";

const MOCK_ROSTERS = {
  AGR101: {
    reportId: "EXP-001",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    semester: "Fall 2025",
    instructor: {
      id: "INST-001",
      name: "Dr. John Smith",
      email: "john.smith@groomingcentre.com",
    },
    students: [
      {
        studentId: "LRN-001",
        firstName: "Nmorsi",
        lastName: "Donald",
        email: "donaldnmorsi@gmail.com",
        phoneNumber: "08134283650",
        enrollmentStatus: "Enrolled",
        progressPercentage: 75.0,
        enrollmentDate: "2025-09-01T08:00:00Z",
        grade: "B+",
        passed: true,
      },
      {
        studentId: "LRN-002",
        firstName: "Jane",
        lastName: "Okoro",
        email: "janeokoro@mail.com",
        phoneNumber: "08012345678",
        enrollmentStatus: "Enrolled",
        progressPercentage: 90.0,
        enrollmentDate: "2025-09-01T08:00:00Z",
        grade: "A",
        passed: true,
      },
      {
        studentId: "LRN-003",
        firstName: "Emeka",
        lastName: "Uche",
        email: "emeka.uche@mail.com",
        phoneNumber: "08098765432",
        enrollmentStatus: "Pending",
        progressPercentage: 0.0,
        enrollmentDate: null,
        grade: null,
        passed: false,
      },
    ],
    summary: {
      totalStudents: 3,
      enrolled: 2,
      pending: 1,
      completed: 0,
      averageProgress: 55.0,
    },
  },
};

const MOCK_EXPORTS = [];

const getMockRoster = (courseId) => {
  if (MOCK_ROSTERS[courseId]) return MOCK_ROSTERS[courseId];
  return {
    reportId: `EXP-${courseId}`,
    courseId,
    courseName: `Course ${courseId}`,
    semester: "Fall 2025",
    instructor: {
      id: "INST-001",
      name: "Dr. John Smith",
      email: "john.smith@groomingcentre.com",
    },
    students: [],
    summary: {
      totalStudents: 0,
      enrolled: 0,
      pending: 0,
      completed: 0,
      averageProgress: 0,
    },
  };
};

/**
 * TC27 - Get course roster
 * GET /api/v2/courses/{courseId}/roster
 */
export const adminGetCourseRoster = async (courseId, params = {}) => {
  try {
    const { data } = await http.get(`/api/v2/courses/${courseId}/roster`, { params });
    const roster = data?.data ?? data;
    const students = roster?.students ?? [];
    return {
      roster,
      pagination: {
        page: Number(params.page || 1),
        limit: Number(params.limit || 10),
        totalItems: students.length,
        totalPages: Math.max(1, Math.ceil(students.length / Number(params.limit || 10))),
      },
    };
  } catch {
    const roster = getMockRoster(courseId);
    return {
      roster,
      pagination: {
        page: Number(params.page || 1),
        limit: Number(params.limit || 10),
        totalItems: roster.students.length,
        totalPages: Math.max(1, Math.ceil(roster.students.length / Number(params.limit || 10))),
      },
    };
  }
};

/**
 * TC27 - Export course roster
 * POST /api/v2/courses/{courseId}/roster/export
 */
export const adminExportCourseRoster = async (courseId, body = {}) => {
  try {
    const { data } = await http.post(`/api/v2/courses/${courseId}/roster/export`, body);
    return {
      message: data?.message ?? "Course roster export initiated successfully",
      exportRecord: data?.data ?? data,
    };
  } catch {
    const exportId = `ROSTER-EXP-${Date.now()}`;
    const exportRecord = {
      exportId,
      courseId,
      format: body.format || "EXCEL",
      fields: body.fields || ["studentId", "firstName", "lastName", "email", "enrollmentStatus", "progressPercentage", "enrollmentDate"],
      includeGrades: Boolean(body.includeGrades),
      includeContactInfo: Boolean(body.includeContactInfo),
      includeEmergencyContact: Boolean(body.includeEmergencyContact),
      status: "SUCCESS",
      createdAt: new Date().toISOString(),
    };
    MOCK_EXPORTS.unshift(exportRecord);
    return { message: "Course roster export initiated successfully", exportRecord };
  }
};

/**
 * TC27 - Get export status
 * GET /api/v2/exports/{id}/status
 */
export const adminGetCourseRosterExportStatus = async (exportId) => {
  try {
    const { data } = await http.get(`/api/v2/exports/${exportId}/status`);
    return data?.data ?? data;
  } catch {
    const exportRecord = MOCK_EXPORTS.find((r) => r.exportId === exportId);
    if (!exportRecord) return { exportId, status: "FAILED", message: "Export not found" };
    return {
      exportId,
      status: exportRecord.status,
      message: exportRecord.status === "SUCCESS" ? "Export ready" : "Export in progress",
    };
  }
};

/**
 * TC27 - Download exported file
 * GET /api/v2/exports/{id}/download
 */
export const adminDownloadCourseRosterExport = async (exportId) => {
  try {
    const { data } = await http.get(`/api/v2/exports/${exportId}/download`);
    return data?.data ?? data;
  } catch {
    const exportRecord = MOCK_EXPORTS.find((r) => r.exportId === exportId);
    if (!exportRecord) throw new Error("Export file not found");
    const ext = exportRecord.format === "CSV" ? "csv" : exportRecord.format === "PDF" ? "pdf" : "xlsx";
    return {
      exportId,
      downloadUrl: `https://storage.example.com/exports/${exportId}.${ext}`,
      format: exportRecord.format,
      fileName: `course-roster-${exportRecord.courseId}-${new Date().toISOString().slice(0, 10)}.${ext}`,
    };
  }
};
