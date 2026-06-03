import { http } from '../http';

/**
 * 4.1 Create Feedback Markup
 * POST /v2/markups
 */
export const adminCreateFeedbackMarkup = async (body) => {
  const { data } = await http.post('/v2/markups', body);
  return { message: data?.message, markup: data?.data ?? data };
};

/**
 * 4.2 List Feedback Markups
 * GET /v2/markups
 */
export const adminGetFeedbackMarkups = async (params) => {
  const { data } = await http.get('/v2/markups', { params });
  const d = data?.data ?? {};
  return {
    markups: d.markups ?? d.rows ?? (Array.isArray(d) ? d : []),
    totalDocumentsCount: d.total ?? 0,
  };
};

/**
 * 4.3 Update Feedback Markup
 * PUT /v2/markups/:markupId
 */
export const adminUpdateFeedbackMarkup = async (markupId, body) => {
  const { data } = await http.put(`/v2/markups/${markupId}`, body);
  return { message: data?.message, markup: data?.data ?? data };
};

/**
 * 4.4 Resolve Feedback Markup
 * POST /v2/markups/:markupId/resolve
 */
export const adminResolveFeedbackMarkup = async (markupId, body) => {
  const { data } = await http.post(`/v2/markups/${markupId}/resolve`, body);
  return { message: data?.message, markup: data?.data ?? data };
};

/**
 * 4.5 Add Rubric Assessment to Markup
 * POST /v2/markups/:markupId/rubric
 */
export const adminAddRubricAssessment = async (markupId, body) => {
  const { data } = await http.post(`/v2/markups/${markupId}/rubric`, body);
  return { message: data?.message, assessment: data?.data ?? data };
};

/**
 * 4.6 Get Feedback Analytics
 * GET /v2/submissions/:documentId/analytics
 */
export const adminGetFeedbackAnalytics = async (documentId) => {
  const { data } = await http.get(`/v2/submissions/${documentId}/analytics`);
  return { analytics: data?.data ?? data };
};

/**
 * Get all markups for a specific document
 * GET /v2/markups?documentId=...
 */
export const adminGetMarkupsByDocument = async (documentId) => {
  const { data } = await http.get('/v2/markups', { params: { documentId } });
  const d = data?.data ?? {};
  return {
    markups: d.markups ?? d.rows ?? (Array.isArray(d) ? d : []),
    totalDocumentsCount: d.total ?? 0,
  };
};
