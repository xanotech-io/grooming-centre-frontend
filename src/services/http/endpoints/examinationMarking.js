import { http } from '../http';

// ---------------------------------------------------------------------------
// 2.1 Create Marking Job
// POST /api/v2/examination-marking/jobs
// ---------------------------------------------------------------------------

/**
 * Create a new examination marking job
 * @param {{ examinationId: string, markingType: string, criteria: Array, deadline: string, description: string }} body
 * @returns {Promise<{ message: string, job: object }>}
 */
export const adminCreateMarkingJob = async (body) => {
  const { data: { message, data } } = await http.post('/v2/examination-marking/jobs', body);
  return { message, job: data };
};

// ---------------------------------------------------------------------------
// 2.2 Get Marking Job Details
// GET /api/v2/examination-marking/jobs/:jobId
// ---------------------------------------------------------------------------

/**
 * Get details of a specific marking job
 * @param {string} jobId
 * @returns {Promise<{ job: object }>}
 */
export const adminGetMarkingJobDetails = async (jobId) => {
  const { data: { data } } = await http.get(`/v2/examination-marking/jobs/${jobId}`);
  return { job: data };
};

// ---------------------------------------------------------------------------
// Get All Marking Jobs (listing page)
// GET /api/v2/examination-marking/jobs
// ---------------------------------------------------------------------------

/**
 * Get all marking jobs
 * @param {object} params - optional query params
 * @returns {Promise<{ jobs: Array, totalDocumentsCount: number }>}
 */
export const adminGetMarkingJobs = async (params) => {
  const { data: { data } } = await http.get('/v2/examination-marking/jobs', { params });
  return { jobs: data.rows, totalDocumentsCount: data.count };
};

// ---------------------------------------------------------------------------
// 2.3 Get Examination Papers for Marking
// GET /api/v2/examination-marking/examinations/:examinationId/papers
// ---------------------------------------------------------------------------

/**
 * Get all papers for a specific examination
 * @param {string} examinationId
 * @param {{ markingStatus?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ papers: Array, pagination: object }>}
 */
export const adminGetExaminationPapers = async (examinationId, params) => {
  const { data: { data } } = await http.get(`/v2/examination-marking/examinations/${examinationId}/papers`, { params });
  return { papers: data.papers, pagination: data.pagination };
};

// ---------------------------------------------------------------------------
// Get Paper Questions for Manual Marking
// GET /api/v2/examination-marking/papers/:paperId
// ---------------------------------------------------------------------------

/**
 * Get a single paper with its questions for manual marking
 * @param {string} paperId
 * @returns {Promise<{ paper: object, questions: Array }>}
 */
export const adminGetPaperForMarking = async (paperId) => {
  const { data: { data } } = await http.get(`/v2/examination-marking/papers/${paperId}`);
  return { paper: data.paper, questions: data.questions };
};

// ---------------------------------------------------------------------------
// 2.4 Mark Examination Paper (Manual)
// PUT /api/v2/examination-marking/papers/:paperId/mark
// ---------------------------------------------------------------------------

/**
 * Submit manual marks for an examination paper
 * @param {string} paperId
 * @param {{ questionAnswers: Array, totalMarks: number, remarks: string, markerComments: string }} body
 * @returns {Promise<{ message: string, result: object }>}
 */
export const adminMarkPaper = async (paperId, body) => {
  const { data: { message, data } } = await http.put(`/v2/examination-marking/papers/${paperId}/mark`, body);
  return { message, result: data };
};

// ---------------------------------------------------------------------------
// 2.5 Get Marking Job Statistics
// GET /api/v2/examination-marking/jobs/:jobId/statistics
// ---------------------------------------------------------------------------

/**
 * Get statistics for a marking job
 * @param {string} jobId
 * @returns {Promise<{ statistics: object }>}
 */
export const adminGetMarkingJobStatistics = async (jobId) => {
  const { data: { data } } = await http.get(`/v2/examination-marking/jobs/${jobId}/statistics`);
  return { statistics: data };
};

// ---------------------------------------------------------------------------
// 2.6 Submit Marked Papers
// POST /api/v2/examination-marking/jobs/:jobId/submit
// ---------------------------------------------------------------------------

/**
 * Submit a batch of marked papers for a job
 * @param {string} jobId
 * @param {{ paperIds: string[] }} body
 * @returns {Promise<{ message: string, result: object }>}
 */
export const adminSubmitMarkedPapers = async (jobId, body) => {
  const { data: { message, data } } = await http.post(`/v2/examination-marking/jobs/${jobId}/submit`, body);
  return { message, result: data };
};
