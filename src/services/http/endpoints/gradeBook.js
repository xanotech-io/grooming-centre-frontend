import { http } from '../http';

// ---------------------------------------------------------------------------
// 5.1 Create Grade Book
// POST /api/v2/gradebooks
// ---------------------------------------------------------------------------

/**
 * @param {{ courseId, courseName, instructorId, term, gradingScale, assessmentCategories }} body
 * @returns {Promise<{ message: string, gradeBook: object }>}
 */
export const adminCreateGradeBook = async (body) => {
  const { data: { message, data } } = await http.post('/v2/gradebooks', body);
  return { message, gradeBook: data };
};

// ---------------------------------------------------------------------------
// List Grade Books (helper — no direct endpoint in spec)
// GET /api/v2/gradebooks
// ---------------------------------------------------------------------------

export const adminGetGradeBooks = async (params) => {
  const { data: { data } } = await http.get('/v2/gradebooks', { params });
  return { gradeBooks: data.gradeBooks, totalDocumentsCount: data.pagination.totalItems };
};

// ---------------------------------------------------------------------------
// Get Grade Book by ID (helper)
// GET /api/v2/gradebooks/:gradeBookId
// ---------------------------------------------------------------------------

export const adminGetGradeBookById = async (gradeBookId) => {
  const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}`);
  return { gradeBook: data };
};

// ---------------------------------------------------------------------------
// Get Grade Entries for a Grade Book (helper)
// GET /api/v2/gradebooks/:gradeBookId/entries
// ---------------------------------------------------------------------------

export const adminGetGradeBookEntries = async (gradeBookId) => {
  const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}/entries`);
  return { entries: data.entries, totalDocumentsCount: data.pagination.totalItems };
};

// ---------------------------------------------------------------------------
// 5.2 Add Grade Entry
// POST /api/v2/gradebooks/:gradeBookId/entries
// ---------------------------------------------------------------------------

/**
 * @param {string} gradeBookId
 * @param {{ studentId, assessmentType, assessmentName, score, maxScore, weight, category, dateSubmitted, feedback, allowRetake }} body
 * @returns {Promise<{ message: string, entry: object }>}
 */
export const adminAddGradeEntry = async (gradeBookId, body) => {
  const { data: { message, data } } = await http.post(`/v2/gradebooks/${gradeBookId}/entries`, body);
  return { message, entry: data };
};

// ---------------------------------------------------------------------------
// 5.3 Get Student Grade Summary
// GET /api/v2/gradebooks/:gradeBookId/student/:studentId/grade
// ---------------------------------------------------------------------------

export const adminGetStudentGradeSummary = async (gradeBookId, studentId) => {
  const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}/student/${studentId}/grade`);
  return { summary: data };
};

// ---------------------------------------------------------------------------
// 5.4 Get Grade Book Statistics
// GET /api/v2/gradebooks/:gradeBookId/statistics
// ---------------------------------------------------------------------------

export const adminGetGradeBookStatistics = async (gradeBookId) => {
  const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}/statistics`);
  return { statistics: data };
};

// ---------------------------------------------------------------------------
// 5.5 Publish Grade Book
// POST /api/v2/gradebooks/:gradeBookId/publish
// ---------------------------------------------------------------------------

export const adminPublishGradeBook = async (gradeBookId) => {
  const { data: { message, data } } = await http.post(`/v2/gradebooks/${gradeBookId}/publish`);
  return { message, gradeBook: data };
};

// ---------------------------------------------------------------------------
// 5.6 Bulk Import Grades
// POST /api/v2/gradebooks/:gradeBookId/bulk-import
// ---------------------------------------------------------------------------

/**
 * @param {string} gradeBookId
 * @param {{ entries: Array, skipValidation: boolean, updateExisting: boolean }} body
 * @returns {Promise<{ message: string, result: object }>}
 */
export const adminBulkImportGrades = async (gradeBookId, body) => {
  const { data: { message, data } } = await http.post(`/v2/gradebooks/${gradeBookId}/bulk-import`, body);
  return { message, result: data };
};

// ---------------------------------------------------------------------------
// 5.7 Apply Late Penalty
// POST /api/v2/entries/:entryId/late-penalty
// ---------------------------------------------------------------------------

/**
 * @param {string} entryId
 * @param {{ penaltyPercentage: number, reason: string }} body
 * @returns {Promise<{ message: string, entry: object }>}
 */
export const adminApplyLatePenalty = async (entryId, body) => {
  const { data: { message, data } } = await http.post(`/v2/entries/${entryId}/late-penalty`, body);
  return { message, entry: data };
};

// ---------------------------------------------------------------------------
// 5.8 Get Grade History
// GET /api/v2/entries/:entryId/history
// ---------------------------------------------------------------------------

export const adminGetGradeHistory = async (entryId) => {
  const { data: { data } } = await http.get(`/v2/entries/${entryId}/history`);
  return { history: data.history, currentVersion: data.currentVersion };
};
