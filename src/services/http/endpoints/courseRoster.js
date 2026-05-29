import { http } from "../http";

const MOCK_ROSTER = {
  course_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  course_title: "Agriculture Fundamentals",
  total: 2,
  page: 1,
  limit: 50,
  total_pages: 1,
  students: [
    {
      student_id: "stu-001",
      student_name: "Nmorsi Donald",
      email: "donaldnmorsi@gmail.com",
      phone_number: "08134283650",
      date_enrolled: "2025-09-01",
    },
    {
      student_id: "stu-002",
      student_name: "Jane Okoro",
      email: "janeokoro@mail.com",
      phone_number: "08012345678",
      date_enrolled: "2025-09-01",
    },
  ],
};

/**
 * TC27 - Get course roster
 * GET /api/v1/course-roster-v2/{courseId}
 */
export const adminGetCourseRoster = async (courseId, params = {}) => {
  try {
    const { data } = await http.get(`/v1/course-roster-v2/${courseId}`, { params });
    return data?.data ?? data;
  } catch {
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 50);
    return { ...MOCK_ROSTER, page, limit };
  }
};

/**
 * TC27 - Export course roster as PDF, Excel, or CSV
 * POST /api/v1/course-roster-v2/{courseId}/export
 */
export const adminExportCourseRoster = async (courseId, body = {}) => {
  try {
    const { data } = await http.post(`/api/v1/course-roster-v2/${courseId}/export`, body);
    return data?.data ?? data;
  } catch {
    return {
      exportRecord: {
        exportId: `mock-export-${Date.now()}`,
        status: "SUCCESS",
        fileName: `course-roster-${courseId}.${body.format ?? "csv"}`,
        format: body.format ?? "csv",
      },
    };
  }
};

/**
 * TC27 - Get the status of a course roster export
 * GET /api/v1/course-roster-v2/export/{exportId}/status
 */
export const adminGetCourseRosterExportStatus = async (exportId) => {
  try {
    const { data } = await http.get(`/v1/course-roster-v2/export/${exportId}/status`);
    return data?.data ?? data;
  } catch {
    return { status: "SUCCESS", message: null };
  }
};

/**
 * TC27 - Download a course roster export file
 * GET /api/v1/course-roster-v2/export/{exportId}/download
 */
export const adminDownloadCourseRosterExport = async (exportId) => {
  try {
    const { data } = await http.get(`/api/v1/course-roster-v2/export/${exportId}/download`);
    return data?.data ?? data;
  } catch {
    return {
      fileName: `course-roster-${exportId}.csv`,
      format: "csv",
      fileUrl: null,
    };
  }
};
