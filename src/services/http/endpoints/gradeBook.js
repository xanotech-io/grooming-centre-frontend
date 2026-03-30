// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------

const MOCK_GRADE_BOOKS = [
  {
    gradeBookId: "GBK-001",
    courseId: "course-001",
    courseName: "Data Analytics 101",
    instructorId: "instructor-uuid-001",
    instructor: "Dr. Tunde Bello",
    term: "Fall 2025",
    status: "Published",
    totalStudents: 45,
    gradedEntries: 89,
    pendingEntries: 12,
    createdAt: "2025-10-01T10:00:00Z",
    publishedAt: "2025-11-15T10:00:00Z",
    gradingScale: [
      { grade: "A", minScore: 90, maxScore: 100, gradePoints: 4.0 },
      { grade: "B+", minScore: 85, maxScore: 89, gradePoints: 3.5 },
      { grade: "B", minScore: 80, maxScore: 84, gradePoints: 3.0 },
      { grade: "C+", minScore: 75, maxScore: 79, gradePoints: 2.5 },
      { grade: "C", minScore: 70, maxScore: 74, gradePoints: 2.0 },
      { grade: "D", minScore: 60, maxScore: 69, gradePoints: 1.0 },
      { grade: "F", minScore: 0, maxScore: 59, gradePoints: 0.0 },
    ],
    assessmentCategories: [
      { categoryName: "Quizzes", weight: 20, dropLowest: 1 },
      { categoryName: "Assignments", weight: 30, dropLowest: 0 },
      { categoryName: "Midterm Exam", weight: 20, dropLowest: 0 },
      { categoryName: "Final Exam", weight: 30, dropLowest: 0 },
    ],
  },
  {
    gradeBookId: "GBK-002",
    courseId: "course-002",
    courseName: "Business Ethics",
    instructorId: "instructor-uuid-002",
    instructor: "Prof. A. Smith",
    term: "Fall 2025",
    status: "Draft",
    totalStudents: 38,
    gradedEntries: 42,
    pendingEntries: 20,
    createdAt: "2025-10-05T08:00:00Z",
    publishedAt: null,
    gradingScale: [
      { grade: "A", minScore: 90, maxScore: 100, gradePoints: 4.0 },
      { grade: "B+", minScore: 85, maxScore: 89, gradePoints: 3.5 },
      { grade: "B", minScore: 80, maxScore: 84, gradePoints: 3.0 },
      { grade: "C", minScore: 70, maxScore: 79, gradePoints: 2.0 },
      { grade: "D", minScore: 60, maxScore: 69, gradePoints: 1.0 },
      { grade: "F", minScore: 0, maxScore: 59, gradePoints: 0.0 },
    ],
    assessmentCategories: [
      { categoryName: "Assignments", weight: 40, dropLowest: 0 },
      { categoryName: "Midterm Exam", weight: 25, dropLowest: 0 },
      { categoryName: "Final Exam", weight: 35, dropLowest: 0 },
    ],
  },
];

const MOCK_ENTRIES = [
  {
    entryId: "entry-001",
    gradeBookId: "GBK-001",
    studentId: "S101",
    studentName: "Nmorsi Donald",
    assessmentType: "Midterm Exam",
    assessmentName: "Midterm Exam",
    score: 84,
    maxScore: 100,
    grade: "B+",
    category: "Midterm Exam",
    weight: 20,
    status: "Finalized",
    dateSubmitted: "2025-10-15T10:00:00Z",
    feedback: "Good understanding of core concepts",
    latePenaltyApplied: false,
  },
  {
    entryId: "entry-002",
    gradeBookId: "GBK-001",
    studentId: "S101",
    studentName: "Nmorsi Donald",
    assessmentType: "Quiz",
    assessmentName: "Quiz 2 - Data Visualization",
    score: 92,
    maxScore: 100,
    grade: "A",
    category: "Quizzes",
    weight: 5,
    status: "Published",
    dateSubmitted: "2025-11-01T10:00:00Z",
    feedback: "Excellent work on chart selection",
    latePenaltyApplied: false,
  },
  {
    entryId: "entry-003",
    gradeBookId: "GBK-001",
    studentId: "S102",
    studentName: "Jane Ibrahim",
    assessmentType: "Assignment",
    assessmentName: "Assignment 1 - Data Cleaning",
    score: 78,
    maxScore: 100,
    grade: "C+",
    category: "Assignments",
    weight: 10,
    status: "Published",
    dateSubmitted: "2025-10-20T14:00:00Z",
    feedback: "Needs more detail on transformation steps",
    latePenaltyApplied: true,
    originalScore: 88,
    penaltyPercentage: 10,
  },
  {
    entryId: "entry-004",
    gradeBookId: "GBK-001",
    studentId: "S103",
    studentName: "Samuel Oke",
    assessmentType: "Final Exam",
    assessmentName: "Final Exam",
    score: 95,
    maxScore: 100,
    grade: "A",
    category: "Final Exam",
    weight: 30,
    status: "Finalized",
    dateSubmitted: "2025-11-20T09:00:00Z",
    feedback: "Exceptional performance",
    latePenaltyApplied: false,
  },
];

const MOCK_STATISTICS = {
  gradeBookId: "GBK-001",
  courseName: "Data Analytics 101",
  totalStudents: 45,
  gradedEntries: 89,
  pendingEntries: 12,
  gradeDistribution: {
    A: 8,
    "B+": 12,
    B: 15,
    "C+": 6,
    C: 3,
    D: 1,
    F: 0,
  },
  classAverage: 82.5,
  highestScore: 98,
  lowestScore: 65,
  standardDeviation: 8.2,
  assessmentAverages: [
    { assessmentName: "Quiz 1", average: 85 },
    { assessmentName: "Quiz 2", average: 88 },
    { assessmentName: "Midterm", average: 82 },
    { assessmentName: "Final Exam", average: 79 },
  ],
};

const MOCK_STUDENT_SUMMARY = {
  gradeBookId: "GBK-001",
  studentId: "S101",
  studentName: "Nmorsi Donald",
  course: "Data Analytics 101",
  entries: [
    {
      entryId: "entry-001",
      assessmentType: "Midterm Exam",
      score: 84,
      maxScore: 100,
      grade: "B+",
      status: "Finalized",
    },
    {
      entryId: "entry-002",
      assessmentType: "Quiz 2",
      score: 92,
      maxScore: 100,
      grade: "A",
      status: "Published",
    },
  ],
  categoryTotals: {
    Quizzes: { score: 88, weight: 20 },
    Assignments: { score: 85, weight: 30 },
    "Midterm Exam": { score: 84, weight: 20 },
    "Final Exam": { score: null, weight: 30 },
  },
  currentOverallScore: 85.4,
  currentGrade: "B+",
  gradePoints: 3.5,
};

const MOCK_GRADE_HISTORY = [
  {
    version: 1,
    score: 85,
    grade: "B+",
    modifiedBy: "Instructor-001",
    modifiedAt: "2025-11-01T10:00:00Z",
    reason: "Initial entry",
  },
  {
    version: 2,
    score: 88,
    grade: "B+",
    modifiedBy: "Instructor-001",
    modifiedAt: "2025-11-02T14:00:00Z",
    reason: "Re-evaluation after student request",
  },
];

// ---------------------------------------------------------------------------
// 5.1 Create Grade Book
// POST /api/v2/gradebooks
// ---------------------------------------------------------------------------

/**
 * @param {{ courseId, courseName, instructorId, term, gradingScale, assessmentCategories }} body
 * @returns {Promise<{ message: string, gradeBook: object }>}
 */
export const adminCreateGradeBook = async (body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/gradebooks', body);
  // return { message, gradeBook: data };

  return {
    message: "Gradebook created successfully",
    gradeBook: {
      gradeBookId: `GBK-${Date.now()}`,
      courseId: body.courseId,
      courseName: body.courseName,
      instructor: "Instructor-001",
      status: "Draft",
      createdAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// List Grade Books (helper — no direct endpoint in spec)
// GET /api/v2/gradebooks
// ---------------------------------------------------------------------------

export const adminGetGradeBooks = async (params) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/gradebooks', { params });
  // return { gradeBooks: data.gradeBooks, totalDocumentsCount: data.pagination.totalItems };

  return {
    gradeBooks: MOCK_GRADE_BOOKS,
    totalDocumentsCount: MOCK_GRADE_BOOKS.length,
  };
};

// ---------------------------------------------------------------------------
// Get Grade Book by ID (helper)
// GET /api/v2/gradebooks/:gradeBookId
// ---------------------------------------------------------------------------

export const adminGetGradeBookById = async (gradeBookId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}`);
  // return { gradeBook: data };

  const found =
    MOCK_GRADE_BOOKS.find((g) => g.gradeBookId === gradeBookId) ||
    MOCK_GRADE_BOOKS[0];
  return { gradeBook: found };
};

// ---------------------------------------------------------------------------
// Get Grade Entries for a Grade Book (helper)
// GET /api/v2/gradebooks/:gradeBookId/entries
// ---------------------------------------------------------------------------

export const adminGetGradeBookEntries = async (gradeBookId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}/entries`);
  // return { entries: data.entries, totalDocumentsCount: data.pagination.totalItems };

  const entries = MOCK_ENTRIES.filter((e) => e.gradeBookId === gradeBookId);
  return { entries, totalDocumentsCount: entries.length };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/gradebooks/${gradeBookId}/entries`, body);
  // return { message, entry: data };

  const percentage = (body.score / body.maxScore) * 100;
  const grade =
    percentage >= 90
      ? "A"
      : percentage >= 85
        ? "B+"
        : percentage >= 80
          ? "B"
          : percentage >= 75
            ? "C+"
            : percentage >= 70
              ? "C"
              : percentage >= 60
                ? "D"
                : "F";

  return {
    message: "Grade entry added successfully",
    entry: {
      entryId: `entry-${Date.now()}`,
      gradeBookId,
      studentId: body.studentId,
      course: body.courseName || "Unknown",
      assessmentType: body.assessmentType,
      score: body.score,
      grade,
      status: "Published",
      enteredAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 5.3 Get Student Grade Summary
// GET /api/v2/gradebooks/:gradeBookId/student/:studentId/grade
// ---------------------------------------------------------------------------

export const adminGetStudentGradeSummary = async (gradeBookId, studentId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}/student/${studentId}/grade`);
  // return { summary: data };

  return { summary: MOCK_STUDENT_SUMMARY };
};

// ---------------------------------------------------------------------------
// 5.4 Get Grade Book Statistics
// GET /api/v2/gradebooks/:gradeBookId/statistics
// ---------------------------------------------------------------------------

export const adminGetGradeBookStatistics = async (gradeBookId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/gradebooks/${gradeBookId}/statistics`);
  // return { statistics: data };

  return { statistics: { ...MOCK_STATISTICS, gradeBookId } };
};

// ---------------------------------------------------------------------------
// 5.5 Publish Grade Book
// POST /api/v2/gradebooks/:gradeBookId/publish
// ---------------------------------------------------------------------------

export const adminPublishGradeBook = async (gradeBookId) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/gradebooks/${gradeBookId}/publish`);
  // return { message, gradeBook: data };

  return {
    message: "Gradebook published successfully",
    gradeBook: {
      gradeBookId,
      status: "Published",
      publishedAt: new Date().toISOString(),
      visibleToStudents: true,
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/gradebooks/${gradeBookId}/bulk-import`, body);
  // return { message, result: data };

  return {
    message: "Grades imported successfully",
    result: {
      gradeBookId,
      imported: body.entries?.length ?? 0,
      updated: 0,
      failed: 0,
      errors: [],
      importedAt: new Date().toISOString(),
    },
  };
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
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/entries/${entryId}/late-penalty`, body);
  // return { message, entry: data };

  const originalScore = 90;
  const penaltyAmount = Math.round(
    (body.penaltyPercentage / 100) * originalScore,
  );
  const finalScore = originalScore - penaltyAmount;
  const finalGrade = finalScore >= 85 ? "B+" : finalScore >= 80 ? "B" : "C+";

  return {
    message: "Late penalty applied successfully",
    entry: {
      entryId,
      originalScore,
      penaltyPercentage: body.penaltyPercentage,
      penaltyAmount,
      finalScore,
      originalGrade: "A",
      finalGrade,
      appliedAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 5.8 Get Grade History
// GET /api/v2/entries/:entryId/history
// ---------------------------------------------------------------------------

export const adminGetGradeHistory = async (entryId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/entries/${entryId}/history`);
  // return { history: data.history, currentVersion: data.currentVersion };

  return {
    history: MOCK_GRADE_HISTORY,
    currentVersion: MOCK_GRADE_HISTORY.length,
  };
};
