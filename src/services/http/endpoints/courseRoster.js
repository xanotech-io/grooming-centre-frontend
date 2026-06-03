import { http } from "../http";

/**
 * TC27 - Get course roster
 * GET /api/v1/course-roster-v2/{courseId}
 */
export const adminGetCourseRoster = async (courseId, params = {}) => {
  const { data } = await http.get(`/v1/course-roster-v2/${courseId}`, { params });
  return data?.data ?? data;
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
