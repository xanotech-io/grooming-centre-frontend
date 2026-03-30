import { http } from '../http';

// ---------------------------------------------------------------------------
// 4.1 Create Feedback Markup
// POST /api/v2/markups
// ---------------------------------------------------------------------------

/**
 * Create a new feedback markup on a submission
 * @param {{ submissionId, assessmentId, markupType, reviewerId, studentId, documentType, comment, position, color, timestamp }} body
 * @returns {Promise<{ message: string, markup: object }>}
 */
export const adminCreateFeedbackMarkup = async (body) => {
  const { data: { message, data } } = await http.post('/v2/markups', body);
  return { message, markup: data };
};

// ---------------------------------------------------------------------------
// 4.2 List Feedback Markups
// GET /api/v2/markups
// ---------------------------------------------------------------------------

/**
 * Get all feedback markups with optional filters
 * @param {{ documentId?, documentType?, reviewerId? }} params
 * @returns {Promise<{ markups: Array, totalDocumentsCount: number }>}
 */
export const adminGetFeedbackMarkups = async (params) => {
  const { data: { data } } = await http.get('/v2/markups', { params });
  return { markups: data.markups, totalDocumentsCount: data.markups.length };
};

// ---------------------------------------------------------------------------
// 4.3 Update Feedback Markup
// PUT /api/v2/markups/:markupId
// ---------------------------------------------------------------------------

/**
 * Update a feedback markup
 * @param {string} markupId
 * @param {{ comment?, status?, color? }} body
 * @returns {Promise<{ message: string, markup: object }>}
 */
export const adminUpdateFeedbackMarkup = async (markupId, body) => {
  const { data: { message, data } } = await http.put(`/v2/markups/${markupId}`, body);
  return { message, markup: data };
};

// ---------------------------------------------------------------------------
// 4.4 Resolve Feedback Markup
// POST /api/v2/markups/:markupId/resolve
// ---------------------------------------------------------------------------

/**
 * Mark a feedback markup as resolved
 * @param {string} markupId
 * @param {{ resolutionNotes: string }} body
 * @returns {Promise<{ message: string, markup: object }>}
 */
export const adminResolveFeedbackMarkup = async (markupId, body) => {
  const { data: { message, data } } = await http.post(`/v2/markups/${markupId}/resolve`, body);
  return { message, markup: data };
};

// ---------------------------------------------------------------------------
// 4.5 Add Rubric Assessment to Markup
// POST /api/v2/markups/:markupId/rubric
// ---------------------------------------------------------------------------

/**
 * Attach a rubric assessment to a markup
 * @param {string} markupId
 * @param {{ rubricId, criteriaScores: Array, totalScore, maxTotalScore }} body
 * @returns {Promise<{ message: string, assessment: object }>}
 */
export const adminAddRubricAssessment = async (markupId, body) => {
  const { data: { message, data } } = await http.post(`/v2/markups/${markupId}/rubric`, body);
  return { message, assessment: data };
};

// ---------------------------------------------------------------------------
// 4.6 Get Feedback Analytics
// GET /api/v2/submissions/:documentId/analytics
// ---------------------------------------------------------------------------

/**
 * Get feedback analytics for a document/submission
 * @param {string} documentId
 * @returns {Promise<{ analytics: object }>}
 */
export const adminGetFeedbackAnalytics = async (documentId) => {
  const { data: { data } } = await http.get(`/v2/submissions/${documentId}/analytics`);
  return { analytics: data };
};

// ---------------------------------------------------------------------------
// Get markups for a specific document (derived from list endpoint)
// ---------------------------------------------------------------------------

/**
 * Get all markups for a specific document
 * @param {string} documentId
 * @returns {Promise<{ markups: Array, totalDocumentsCount: number }>}
 */
export const adminGetMarkupsByDocument = async (documentId) => {
  const { data: { data } } = await http.get('/v2/markups', { params: { documentId } });
  return { markups: data.markups, totalDocumentsCount: data.markups.length };
};
