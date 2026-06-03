import { http } from '../http';

/**
 * 5.1 Create Grade Book
 * POST /v2/gradebooks
 */
export const adminCreateGradeBook = async (body) => {
  const { data } = await http.post('/v2/gradebooks', body);
  return { message: data?.message, gradeBook: data?.data ?? data };
};

/**
 * List Grade Books
 * GET /v2/gradebooks
 */
export const adminGetGradeBooks = async (params) => {
  const { data } = await http.get('/v2/gradebooks', { params });
  const d = data?.data ?? {};
  return {
    gradeBooks: d.gradeBooks ?? d.rows ?? (Array.isArray(d) ? d : []),
    totalDocumentsCount: d.pagination?.totalItems ?? d.total ?? 0,
  };
};

/**
 * Get Grade Book by ID
 * GET /v2/gradebooks/:gradeBookId
 */
export const adminGetGradeBookById = async (gradeBookId) => {
  const { data } = await http.get(`/v2/gradebooks/${gradeBookId}`);
  return { gradeBook: data?.data ?? data };
};

/**
 * Get Grade Entries for a Grade Book
 * GET /v2/gradebooks/:gradeBookId/entries
 */
export const adminGetGradeBookEntries = async (gradeBookId) => {
  const { data } = await http.get(`/v2/gradebooks/${gradeBookId}/entries`);
  const d = data?.data ?? {};
  return {
    entries: d.entries ?? d.rows ?? (Array.isArray(d) ? d : []),
    totalDocumentsCount: d.pagination?.totalItems ?? d.total ?? 0,
  };
};

/**
 * 5.2 Add Grade Entry
 * POST /v2/gradebooks/:gradeBookId/entries
 */
export const adminAddGradeEntry = async (gradeBookId, body) => {
  const { data } = await http.post(`/v2/gradebooks/${gradeBookId}/entries`, body);
  return { message: data?.message, entry: data?.data ?? data };
};

/**
 * 5.3 Get Student Grade Summary
 * GET /v2/gradebooks/:gradeBookId/student/:studentId/grade
 */
export const adminGetStudentGradeSummary = async (gradeBookId, studentId) => {
  const { data } = await http.get(`/v2/gradebooks/${gradeBookId}/student/${studentId}/grade`);
  return { summary: data?.data ?? data };
};

/**
 * 5.4 Get Grade Book Statistics
 * GET /v2/gradebooks/:gradeBookId/statistics
 */
export const adminGetGradeBookStatistics = async (gradeBookId) => {
  const { data } = await http.get(`/v2/gradebooks/${gradeBookId}/statistics`);
  return { statistics: data?.data ?? data };
};

/**
 * 5.5 Publish Grade Book
 * POST /v2/gradebooks/:gradeBookId/publish
 */
export const adminPublishGradeBook = async (gradeBookId) => {
  const { data } = await http.post(`/v2/gradebooks/${gradeBookId}/publish`);
  return { message: data?.message, gradeBook: data?.data ?? data };
};

/**
 * 5.6 Bulk Import Grades
 * POST /v2/gradebooks/:gradeBookId/bulk-import
 */
export const adminBulkImportGrades = async (gradeBookId, body) => {
  const { data } = await http.post(`/v2/gradebooks/${gradeBookId}/bulk-import`, body);
  return { message: data?.message, result: data?.data ?? data };
};

/**
 * 5.7 Apply Late Penalty
 * POST /v2/entries/:entryId/late-penalty
 */
export const adminApplyLatePenalty = async (entryId, body) => {
  const { data } = await http.post(`/v2/entries/${entryId}/late-penalty`, body);
  return { message: data?.message, entry: data?.data ?? data };
};

/**
 * 5.8 Get Grade History
 * GET /v2/entries/:entryId/history
 */
export const adminGetGradeHistory = async (entryId) => {
  const { data } = await http.get(`/v2/entries/${entryId}/history`);
  const d = data?.data ?? {};
  return {
    history: d.history ?? (Array.isArray(d) ? d : []),
    currentVersion: d.currentVersion ?? null,
  };
};
