// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_JOBS = [
  {
    jobId: "EX-1045",
    examTitle: "Data Analytics Test",
    examinationId: "exam-001",
    markingMode: "Automatic",
    markingType: "AUTOMATIC",
    evaluatedBy: "System",
    averageScore: 78.4,
    highestScore: 95,
    lowestScore: 62,
    status: "Completed",
    remarks: "Auto-marking successful",
    totalPapers: 120,
    markedPapers: 120,
    pendingPapers: 0,
    deadline: "2025-11-15T23:59:59Z",
    createdAt: "2025-11-01T10:00:00Z",
  },
  {
    jobId: "EX-1046",
    examTitle: "Business Ethics Exam",
    examinationId: "exam-002",
    markingMode: "Manual",
    markingType: "MANUAL",
    evaluatedBy: "Dr. Tunde Bello",
    averageScore: 81.2,
    highestScore: 98,
    lowestScore: 50,
    status: "Completed",
    remarks: "3 papers flagged for review",
    totalPapers: 45,
    markedPapers: 45,
    pendingPapers: 0,
    deadline: "2025-11-20T23:59:59Z",
    createdAt: "2025-11-02T09:00:00Z",
  },
  {
    jobId: "EX-1047",
    examTitle: "Midterm Science Exam",
    examinationId: "exam-003",
    markingMode: "Hybrid",
    markingType: "HYBRID",
    evaluatedBy: "Dr. Ada Johnson",
    averageScore: null,
    highestScore: null,
    lowestScore: null,
    status: "In Progress",
    remarks: null,
    totalPapers: 80,
    markedPapers: 34,
    pendingPapers: 46,
    deadline: "2025-12-01T23:59:59Z",
    createdAt: "2025-11-05T08:00:00Z",
  },
  {
    jobId: "EX-1048",
    examTitle: "Final Year Agriculture Exam",
    examinationId: "exam-004",
    markingMode: "Manual",
    markingType: "MANUAL",
    evaluatedBy: "Prof. A. Smith",
    averageScore: null,
    highestScore: null,
    lowestScore: null,
    status: "Pending",
    remarks: null,
    totalPapers: 60,
    markedPapers: 0,
    pendingPapers: 60,
    deadline: "2025-12-10T23:59:59Z",
    createdAt: "2025-11-06T11:00:00Z",
  },
];

const MOCK_PAPERS = [
  {
    paperId: "paper-001",
    studentId: "STU-001",
    studentName: "Nmorsi Donald",
    submissionDate: "2025-11-01T10:30:00Z",
    markingStatus: "PENDING",
    totalMarks: null,
    markedBy: null,
    markingDate: null,
  },
  {
    paperId: "paper-002",
    studentId: "STU-002",
    studentName: "Jane Okoro",
    submissionDate: "2025-11-01T11:00:00Z",
    markingStatus: "MARKED",
    totalMarks: 85,
    markedBy: "System",
    markingDate: "2025-11-01T11:05:00Z",
  },
  {
    paperId: "paper-003",
    studentId: "STU-003",
    studentName: "Emeka Obi",
    submissionDate: "2025-11-01T11:30:00Z",
    markingStatus: "PENDING",
    totalMarks: null,
    markedBy: null,
    markingDate: null,
  },
  {
    paperId: "paper-004",
    studentId: "STU-004",
    studentName: "Fatima Bello",
    submissionDate: "2025-11-01T12:00:00Z",
    markingStatus: "MARKED",
    totalMarks: 72,
    markedBy: "Dr. Tunde Bello",
    markingDate: "2025-11-02T09:00:00Z",
  },
  {
    paperId: "paper-005",
    studentId: "STU-005",
    studentName: "Tobi Adeyemi",
    submissionDate: "2025-11-01T12:30:00Z",
    markingStatus: "SUBMITTED",
    totalMarks: 91,
    markedBy: "Dr. Tunde Bello",
    markingDate: "2025-11-02T10:00:00Z",
  },
];

const MOCK_PAPER_QUESTIONS = [
  {
    questionId: "q-001",
    sequenceNumber: 1,
    questionText:
      "Explain the concept of data normalization and its importance in database design.",
    questionType: "ESSAY",
    maxMarks: 10,
    marksObtained: null,
    feedback: "",
  },
  {
    questionId: "q-002",
    sequenceNumber: 2,
    questionText:
      "Describe the differences between supervised and unsupervised machine learning.",
    questionType: "ESSAY",
    maxMarks: 10,
    marksObtained: null,
    feedback: "",
  },
  {
    questionId: "q-003",
    sequenceNumber: 3,
    questionText: "What is the role of statistical analysis in data analytics?",
    questionType: "ESSAY",
    maxMarks: 10,
    marksObtained: null,
    feedback: "",
  },
];

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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/examination-marking/jobs', body);
  // return { message, job: data };

  return {
    message: "Marking job created successfully",
    job: {
      jobId: "job-uuid-456",
      examinationId: body.examinationId,
      markingType: body.markingType,
      status: "PENDING",
      totalPapers: 150,
      pendingPapers: 150,
      markedPapers: 0,
      createdAt: new Date().toISOString(),
      deadline: body.deadline,
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/examination-marking/jobs/${jobId}`);
  // return { job: data };

  const found = MOCK_JOBS.find((j) => j.jobId === jobId) || MOCK_JOBS[0];
  return { job: found };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/examination-marking/jobs', { params });
  // return { jobs: data.rows, totalDocumentsCount: data.count };

  return {
    jobs: MOCK_JOBS,
    totalDocumentsCount: MOCK_JOBS.length,
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/examination-marking/examinations/${examinationId}/papers`, { params });
  // return { papers: data.papers, pagination: data.pagination };

  return {
    papers: MOCK_PAPERS,
    pagination: {
      page: 1,
      limit: 10,
      totalItems: MOCK_PAPERS.length,
      totalPages: 1,
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/examination-marking/papers/${paperId}`);
  // return { paper: data.paper, questions: data.questions };

  const paper =
    MOCK_PAPERS.find((p) => p.paperId === paperId) || MOCK_PAPERS[0];
  return {
    paper,
    questions: MOCK_PAPER_QUESTIONS,
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.put(`/v2/examination-marking/papers/${paperId}/mark`, body);
  // return { message, result: data };

  return {
    message: "Paper marked successfully",
    result: {
      paperId,
      studentId: "STU-002",
      examId: "EXM-ENG201",
      totalScore: body.totalMarks,
      grade: body.totalMarks >= 70 ? "A" : body.totalMarks >= 60 ? "B" : "C",
      markingType: "Manual",
      markedBy: "Dr. Tunde Bello",
      markingDate: new Date().toISOString(),
      status: "MARKED",
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/examination-marking/jobs/${jobId}/statistics`);
  // return { statistics: data };

  return {
    statistics: {
      jobId,
      examTitle: "Business Ethics Exam",
      markingMode: "Manual",
      evaluatedBy: "Dr. Tunde Bello",
      averageScore: 81.2,
      highestScore: 98,
      lowestScore: 50,
      status: "Completed",
      remarks: "3 papers flagged for review",
      totalPapers: 45,
      markedPapers: 45,
      flaggedPapers: 3,
      completionRate: 100,
      averageMarkingTime: 12.5,
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/examination-marking/jobs/${jobId}/submit`, body);
  // return { message, result: data };

  return {
    message: "Papers submitted successfully",
    result: {
      jobId,
      submittedPapers: body.paperIds.length,
      status: "SUBMITTED",
      submissionDate: new Date().toISOString(),
    },
  };
};
