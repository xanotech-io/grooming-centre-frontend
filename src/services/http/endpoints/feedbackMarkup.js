// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------

const MOCK_MARKUPS = [
  {
    markupId: "MRK-001",
    submissionId: "submission-uuid-001",
    assessmentId: "assessment-uuid-001",
    reviewer: "Dr. N. Donald",
    reviewerId: "instructor-uuid-001",
    studentId: "S12345",
    studentName: "Nmorsi Donald",
    documentType: "ASSIGNMENT",
    markupType: "HIGHLIGHT",
    commentType: "Highlight",
    comment:
      "Clarify formula usage here - the derivation needs more explanation",
    color: "yellow",
    status: "Published",
    position: { pageNumber: 1, x: 120, y: 350, width: 200, height: 30 },
    timestamp: "2025-11-01T14:30:00Z",
  },
  {
    markupId: "MRK-002",
    submissionId: "submission-uuid-001",
    assessmentId: "assessment-uuid-001",
    reviewer: "Prof. A. Smith",
    reviewerId: "instructor-uuid-002",
    studentId: "S12367",
    studentName: "Jane Ibrahim",
    documentType: "EXAM",
    markupType: "TEXT_COMMENT",
    commentType: "TextComment",
    comment: "Pending final review",
    color: "blue",
    status: "Draft",
    position: { pageNumber: 2, x: 80, y: 200, width: 150, height: 25 },
    timestamp: "2025-11-01T16:00:00Z",
  },
  {
    markupId: "MRK-003",
    submissionId: "submission-uuid-002",
    assessmentId: "assessment-uuid-002",
    reviewer: "Dr. N. Donald",
    reviewerId: "instructor-uuid-001",
    studentId: "S12390",
    studentName: "Samuel Oke",
    documentType: "ASSIGNMENT",
    markupType: "ANNOTATION",
    commentType: "Annotation",
    comment: "Good analysis but structural formatting can be improved",
    color: "green",
    status: "Resolved",
    resolutionNotes: "Student updated formatting as requested",
    resolvedAt: "2025-11-03T10:00:00Z",
    position: { pageNumber: 1, x: 50, y: 100, width: 300, height: 40 },
    timestamp: "2025-11-02T09:00:00Z",
  },
  {
    markupId: "MRK-004",
    submissionId: "submission-uuid-002",
    assessmentId: "assessment-uuid-002",
    reviewer: "Prof. A. Smith",
    reviewerId: "instructor-uuid-002",
    studentId: "S12401",
    studentName: "Musa Bello",
    documentType: "PROJECT",
    markupType: "HIGHLIGHT",
    commentType: "Highlight",
    comment: "References section needs APA formatting",
    color: "orange",
    status: "Published",
    position: { pageNumber: 5, x: 60, y: 450, width: 180, height: 20 },
    timestamp: "2025-11-02T11:30:00Z",
  },
];

const MOCK_ANALYTICS = {
  documentId: "submission-uuid-001",
  totalMarkups: 15,
  byType: {
    HIGHLIGHT: 8,
    TEXT_COMMENT: 5,
    ANNOTATION: 2,
  },
  byStatus: {
    Draft: 3,
    Published: 10,
    Resolved: 2,
  },
  averageResolutionTime: 48.5,
  feedbackEffectivenessScore: 85,
};

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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/markups', body);
  // return { message, markup: data };

  return {
    message: "Feedback markup created successfully",
    markup: {
      markupId: `MRK-${Date.now()}`,
      reviewer: "Dr. N. Donald",
      studentId: body.studentId,
      documentType: body.documentType,
      commentType: body.markupType,
      status: "Draft",
      remarks: body.comment,
      createdAt: new Date().toISOString(),
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/markups', { params });
  // return { markups: data.markups, totalDocumentsCount: data.markups.length };

  return {
    markups: MOCK_MARKUPS,
    totalDocumentsCount: MOCK_MARKUPS.length,
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.put(`/v2/markups/${markupId}`, body);
  // return { message, markup: data };

  return {
    message: "Markup updated successfully",
    markup: {
      markupId,
      status: body.status || "Published",
      updatedAt: new Date().toISOString(),
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/markups/${markupId}/resolve`, body);
  // return { message, markup: data };

  return {
    message: "Markup resolved successfully",
    markup: {
      markupId,
      status: "Resolved",
      resolutionNotes: body.resolutionNotes,
      resolvedAt: new Date().toISOString(),
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/markups/${markupId}/rubric`, body);
  // return { message, assessment: data };

  return {
    message: "Rubric assessment added successfully",
    assessment: {
      assessmentId: `assess-${Date.now()}`,
      markupId,
      totalScore: body.totalScore,
      maxTotalScore: body.maxTotalScore,
      percentage:
        body.maxTotalScore > 0
          ? Math.round((body.totalScore / body.maxTotalScore) * 100)
          : 0,
      createdAt: new Date().toISOString(),
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/submissions/${documentId}/analytics`);
  // return { analytics: data };

  return { analytics: { ...MOCK_ANALYTICS, documentId } };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/markups', { params: { documentId } });
  // return { markups: data.markups, totalDocumentsCount: data.markups.length };

  const markups = MOCK_MARKUPS.filter((m) => m.submissionId === documentId);
  return { markups, totalDocumentsCount: markups.length };
};
