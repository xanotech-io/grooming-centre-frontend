import { http } from "../http";

const paginate = (rows, params = {}) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const start = (page - 1) * limit;
  const pagedRows = rows.slice(start, start + limit);

  return {
    rows: pagedRows,
    showingDocumentsCount: pagedRows.length,
    totalDocumentsCount: rows.length,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

const INSTRUCTOR_NAMES = {
  inst_1: "James Smith",
  inst_2: "Kemi Abens",
  inst_3: "Mike Johnson",
  inst_4: "Kolade Adeyemi",
};

const DEFAULT_INSTRUCTOR_ID = "inst_1";

const getInstructorKey = (instructorId) =>
  INSTRUCTOR_NAMES[instructorId] ? instructorId : DEFAULT_INSTRUCTOR_ID;

const MOCK_INSTRUCTOR_DIRECTORY = [
  {
    id: "inst_1",
    displayId: "INS-001",
    firstName: "James",
    lastName: "Smith",
    email: "j.smith@example.com",
    active: true,
  },
  {
    id: "inst_2",
    displayId: "INS-002",
    firstName: "Kemi",
    lastName: "Abens",
    email: "k.abens@example.com",
    active: true,
  },
  {
    id: "inst_3",
    displayId: "INS-003",
    firstName: "Mike",
    lastName: "Johnson",
    email: "m.johnson@example.com",
    active: false,
  },
  {
    id: "inst_4",
    displayId: "INS-004",
    firstName: "Kolade",
    lastName: "Adeyemi",
    email: "k.adeyemi@example.com",
    active: true,
  },
];

const MOCK_COURSE_COMPLETION_BY_INSTRUCTOR = {
  inst_1: [
    { id: "cc-1", course: "Data Analytics 101", instructor: "James Smith", totalEnrolled: 150, completed: 120, passed: 110, failed: 10, averageScore: 78.5 },
    { id: "cc-2", course: "Applied Statistics", instructor: "James Smith", totalEnrolled: 120, completed: 94, passed: 88, failed: 6, averageScore: 76.2 },
    { id: "cc-3", course: "Business Intelligence", instructor: "James Smith", totalEnrolled: 95, completed: 74, passed: 68, failed: 6, averageScore: 81.1 },
    { id: "cc-4", course: "Research Methods", instructor: "James Smith", totalEnrolled: 80, completed: 58, passed: 52, failed: 6, averageScore: 72.4 },
  ],
  inst_2: [
    { id: "cc-1", course: "Risk Management", instructor: "Kemi Abens", totalEnrolled: 132, completed: 111, passed: 104, failed: 7, averageScore: 82.7 },
    { id: "cc-2", course: "Credit Analysis", instructor: "Kemi Abens", totalEnrolled: 114, completed: 99, passed: 92, failed: 7, averageScore: 80.9 },
    { id: "cc-3", course: "Loan Portfolio", instructor: "Kemi Abens", totalEnrolled: 90, completed: 71, passed: 66, failed: 5, averageScore: 77.8 },
    { id: "cc-4", course: "Financial Reporting", instructor: "Kemi Abens", totalEnrolled: 86, completed: 64, passed: 60, failed: 4, averageScore: 75.6 },
  ],
  inst_3: [
    { id: "cc-1", course: "Business Math", instructor: "Mike Johnson", totalEnrolled: 98, completed: 64, passed: 54, failed: 10, averageScore: 69.4 },
    { id: "cc-2", course: "Algebra for Finance", instructor: "Mike Johnson", totalEnrolled: 88, completed: 60, passed: 51, failed: 9, averageScore: 67.2 },
    { id: "cc-3", course: "Statistics Basics", instructor: "Mike Johnson", totalEnrolled: 102, completed: 72, passed: 63, failed: 9, averageScore: 71.9 },
    { id: "cc-4", course: "Numeracy Skills", instructor: "Mike Johnson", totalEnrolled: 76, completed: 49, passed: 42, failed: 7, averageScore: 65.8 },
  ],
  inst_4: [
    { id: "cc-1", course: "Project Management", instructor: "Kolade Adeyemi", totalEnrolled: 124, completed: 98, passed: 91, failed: 7, averageScore: 79.3 },
    { id: "cc-2", course: "Team Leadership", instructor: "Kolade Adeyemi", totalEnrolled: 110, completed: 89, passed: 84, failed: 5, averageScore: 81.5 },
    { id: "cc-3", course: "Agile Delivery", instructor: "Kolade Adeyemi", totalEnrolled: 92, completed: 71, passed: 66, failed: 5, averageScore: 77.1 },
    { id: "cc-4", course: "Operations Planning", instructor: "Kolade Adeyemi", totalEnrolled: 78, completed: 58, passed: 54, failed: 4, averageScore: 74.8 },
  ],
};

const MOCK_INSTRUCTOR_PERFORMANCE_BY_INSTRUCTOR = {
  inst_1: [
    { id: "ip-1", instructor: "James Smith", department: "Computer Science", coursesDelivered: 3, completionRate: "82%", averageScore: "78%", feedbackRating: "4.6/5", gradingTimelinessDays: 2 },
    { id: "ip-2", instructor: "James Smith", department: "Computer Science", coursesDelivered: 3, completionRate: "85%", averageScore: "80%", feedbackRating: "4.5/5", gradingTimelinessDays: 3 },
    { id: "ip-3", instructor: "James Smith", department: "Computer Science", coursesDelivered: 3, completionRate: "79%", averageScore: "76%", feedbackRating: "4.4/5", gradingTimelinessDays: 2 },
  ],
  inst_2: [
    { id: "ip-1", instructor: "Kemi Abens", department: "Finance", coursesDelivered: 4, completionRate: "88%", averageScore: "83%", feedbackRating: "4.8/5", gradingTimelinessDays: 1 },
    { id: "ip-2", instructor: "Kemi Abens", department: "Finance", coursesDelivered: 4, completionRate: "86%", averageScore: "81%", feedbackRating: "4.7/5", gradingTimelinessDays: 2 },
    { id: "ip-3", instructor: "Kemi Abens", department: "Finance", coursesDelivered: 4, completionRate: "90%", averageScore: "84%", feedbackRating: "4.9/5", gradingTimelinessDays: 1 },
  ],
  inst_3: [
    { id: "ip-1", instructor: "Mike Johnson", department: "Mathematics", coursesDelivered: 3, completionRate: "68%", averageScore: "66%", feedbackRating: "4.1/5", gradingTimelinessDays: 4 },
    { id: "ip-2", instructor: "Mike Johnson", department: "Mathematics", coursesDelivered: 3, completionRate: "72%", averageScore: "69%", feedbackRating: "4.0/5", gradingTimelinessDays: 5 },
    { id: "ip-3", instructor: "Mike Johnson", department: "Mathematics", coursesDelivered: 3, completionRate: "70%", averageScore: "68%", feedbackRating: "4.2/5", gradingTimelinessDays: 4 },
  ],
  inst_4: [
    { id: "ip-1", instructor: "Kolade Adeyemi", department: "Management", coursesDelivered: 3, completionRate: "80%", averageScore: "77%", feedbackRating: "4.5/5", gradingTimelinessDays: 2 },
    { id: "ip-2", instructor: "Kolade Adeyemi", department: "Management", coursesDelivered: 3, completionRate: "83%", averageScore: "79%", feedbackRating: "4.6/5", gradingTimelinessDays: 2 },
    { id: "ip-3", instructor: "Kolade Adeyemi", department: "Management", coursesDelivered: 3, completionRate: "81%", averageScore: "78%", feedbackRating: "4.5/5", gradingTimelinessDays: 3 },
  ],
};

const MOCK_GRADING_SUMMARY_BY_INSTRUCTOR = {
  inst_1: [
    { id: "ag-1", assignment: "Midterm Project", course: "Data Analytics 101", totalSubmissions: 45, graded: 40, pending: 5, averageGrade: 82.5, feedbackProvidedPercent: 95, submissionDeadline: "2025-03-15T23:59:59Z" },
    { id: "ag-2", assignment: "Quiz 3", course: "Data Analytics 101", totalSubmissions: 45, graded: 45, pending: 0, averageGrade: 79.2, feedbackProvidedPercent: 100, submissionDeadline: "2025-03-05T23:59:59Z" },
    { id: "ag-3", assignment: "Final Exam", course: "Data Analytics 101", totalSubmissions: 44, graded: 35, pending: 9, averageGrade: 77.0, feedbackProvidedPercent: 80, submissionDeadline: "2025-03-29T23:59:59Z" },
  ],
  inst_2: [
    { id: "ag-1", assignment: "Loan Case Study", course: "Credit Analysis", totalSubmissions: 52, graded: 49, pending: 3, averageGrade: 84.3, feedbackProvidedPercent: 98, submissionDeadline: "2025-03-10T23:59:59Z" },
    { id: "ag-2", assignment: "Risk Simulation", course: "Risk Management", totalSubmissions: 48, graded: 44, pending: 4, averageGrade: 81.7, feedbackProvidedPercent: 92, submissionDeadline: "2025-03-18T23:59:59Z" },
    { id: "ag-3", assignment: "Final Assessment", course: "Financial Reporting", totalSubmissions: 50, graded: 46, pending: 4, averageGrade: 83.1, feedbackProvidedPercent: 96, submissionDeadline: "2025-03-28T23:59:59Z" },
  ],
  inst_3: [
    { id: "ag-1", assignment: "Algebra Worksheet", course: "Business Math", totalSubmissions: 40, graded: 30, pending: 10, averageGrade: 68.4, feedbackProvidedPercent: 75, submissionDeadline: "2025-03-12T23:59:59Z" },
    { id: "ag-2", assignment: "Statistics Quiz", course: "Statistics Basics", totalSubmissions: 42, graded: 31, pending: 11, averageGrade: 66.8, feedbackProvidedPercent: 73, submissionDeadline: "2025-03-20T23:59:59Z" },
    { id: "ag-3", assignment: "Numeracy Test", course: "Numeracy Skills", totalSubmissions: 38, graded: 28, pending: 10, averageGrade: 64.9, feedbackProvidedPercent: 70, submissionDeadline: "2025-03-27T23:59:59Z" },
  ],
  inst_4: [
    { id: "ag-1", assignment: "Sprint Plan", course: "Agile Delivery", totalSubmissions: 46, graded: 40, pending: 6, averageGrade: 79.4, feedbackProvidedPercent: 88, submissionDeadline: "2025-03-11T23:59:59Z" },
    { id: "ag-2", assignment: "Leadership Reflection", course: "Team Leadership", totalSubmissions: 43, graded: 39, pending: 4, averageGrade: 80.6, feedbackProvidedPercent: 91, submissionDeadline: "2025-03-19T23:59:59Z" },
    { id: "ag-3", assignment: "Operations Capstone", course: "Operations Planning", totalSubmissions: 41, graded: 35, pending: 6, averageGrade: 78.8, feedbackProvidedPercent: 86, submissionDeadline: "2025-03-30T23:59:59Z" },
  ],
};

const MOCK_ITEM_ANALYSIS_BY_INSTRUCTOR = {
  inst_1: [
    { id: "Q001", questionId: "Q001", courseTitle: "Data Analytics 101", questionType: "Multiple Choice", difficulty: "Easy", attempts: 150, correctPercentage: 90, averageTimeSeconds: 40, flaggedForReview: false },
    { id: "Q025", questionId: "Q025", courseTitle: "Data Analytics 101", questionType: "Open-ended", difficulty: "Medium", attempts: 150, correctPercentage: 50, averageTimeSeconds: 130, flaggedForReview: true, reviewReason: "Low discrimination index - may need revision" },
    { id: "Q031", questionId: "Q031", courseTitle: "Data Analytics 101", questionType: "True/False", difficulty: "Hard", attempts: 150, correctPercentage: 42, averageTimeSeconds: 75, flaggedForReview: true, reviewReason: "High error rate" },
  ],
  inst_2: [
    { id: "Q001", questionId: "Q001", courseTitle: "Credit Analysis", questionType: "Multiple Choice", difficulty: "Easy", attempts: 132, correctPercentage: 88, averageTimeSeconds: 36, flaggedForReview: false },
    { id: "Q025", questionId: "Q025", courseTitle: "Risk Management", questionType: "Open-ended", difficulty: "Medium", attempts: 132, correctPercentage: 58, averageTimeSeconds: 110, flaggedForReview: false },
    { id: "Q031", questionId: "Q031", courseTitle: "Financial Reporting", questionType: "True/False", difficulty: "Hard", attempts: 132, correctPercentage: 47, averageTimeSeconds: 82, flaggedForReview: true, reviewReason: "High error rate in distractors" },
  ],
  inst_3: [
    { id: "Q001", questionId: "Q001", courseTitle: "Business Math", questionType: "Multiple Choice", difficulty: "Medium", attempts: 98, correctPercentage: 64, averageTimeSeconds: 52, flaggedForReview: false },
    { id: "Q025", questionId: "Q025", courseTitle: "Statistics Basics", questionType: "Open-ended", difficulty: "Hard", attempts: 98, correctPercentage: 39, averageTimeSeconds: 140, flaggedForReview: true, reviewReason: "Question wording is ambiguous" },
    { id: "Q031", questionId: "Q031", courseTitle: "Algebra for Finance", questionType: "True/False", difficulty: "Hard", attempts: 98, correctPercentage: 34, averageTimeSeconds: 88, flaggedForReview: true, reviewReason: "Very low discrimination index" },
  ],
  inst_4: [
    { id: "Q001", questionId: "Q001", courseTitle: "Project Management", questionType: "Multiple Choice", difficulty: "Easy", attempts: 124, correctPercentage: 83, averageTimeSeconds: 44, flaggedForReview: false },
    { id: "Q025", questionId: "Q025", courseTitle: "Team Leadership", questionType: "Open-ended", difficulty: "Medium", attempts: 124, correctPercentage: 56, averageTimeSeconds: 118, flaggedForReview: true, reviewReason: "Needs clearer rubric expectation" },
    { id: "Q031", questionId: "Q031", courseTitle: "Operations Planning", questionType: "True/False", difficulty: "Hard", attempts: 124, correctPercentage: 45, averageTimeSeconds: 84, flaggedForReview: true, reviewReason: "Concept overlap with another question" },
  ],
};

export const adminGetInstructorReportDirectory = async (params = {}) => {
  // const { data: { data } } = await http.get(`/v2/instructors`, { params });
  // return data;
  const search = (params.search || "").toString().trim().toLowerCase();
  const sort = (params.sort || "nameAsc").toString();

  let rows = [...MOCK_INSTRUCTOR_DIRECTORY];

  if (search) {
    rows = rows.filter((item) => {
      const name = `${item.firstName} ${item.lastName}`.toLowerCase();
      return (
        name.includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.displayId.toLowerCase().includes(search)
      );
    });
  }

  if (sort === "nameDesc") {
    rows.sort((a, b) =>
      `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`),
    );
  } else {
    rows.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    );
  }

  return paginate(rows, params);
};

export const adminGetInstructorCourseCompletionReport = async (
  instructorId,
  params = {},
) => {
  // const { data: { data } } = await http.get(`/v2/instructors/${instructorId}/courses/completion`, { params });
  // return data;
  const key = getInstructorKey(instructorId);
  const rows = MOCK_COURSE_COMPLETION_BY_INSTRUCTOR[key];
  const pageData = paginate(rows, params);
  const totalStudents = rows.reduce(
    (currentTotal, row) => currentTotal + row.totalEnrolled,
    0,
  );
  const totalCompleted = rows.reduce(
    (currentTotal, row) => currentTotal + row.completed,
    0,
  );
  const totalPassed = rows.reduce(
    (currentTotal, row) => currentTotal + row.passed,
    0,
  );
  const totalGraded = rows.reduce(
    (currentTotal, row) => currentTotal + row.completed,
    0,
  );
  const weightedScore = rows.reduce(
    (currentTotal, row) => currentTotal + row.averageScore * row.completed,
    0,
  );
  const averageScore = totalGraded ? weightedScore / totalGraded : 0;
  return {
    instructorId: key,
    instructorName: INSTRUCTOR_NAMES[key],
    aggregateStats: {
      totalCourses: rows.length,
      totalStudents,
      overallCompletionRate: totalStudents
        ? Number(((totalCompleted / totalStudents) * 100).toFixed(2))
        : 0,
      overallPassRate: totalCompleted
        ? Number(((totalPassed / totalCompleted) * 100).toFixed(2))
        : 0,
      averageScore: Number(averageScore.toFixed(2)),
    },
    trends: {
      completionTrend: "INCREASING",
      passTrend: "STABLE",
      scoresTrend: "INCREASING",
    },
    ...pageData,
  };
};

export const adminGetInstructorPerformanceReport = async (
  instructorId,
  params = {},
) => {
  // const { data: { data } } = await http.get(`/v2/instructors/${instructorId}/performance`, { params });
  // return data;
  const key = getInstructorKey(instructorId);
  const rows = MOCK_INSTRUCTOR_PERFORMANCE_BY_INSTRUCTOR[key];
  const pageData = paginate(rows, params);
  const averageCompletionRate =
    rows.reduce(
      (currentTotal, row) => currentTotal + Number(row.completionRate.replace("%", "")),
      0,
    ) / rows.length;
  return {
    instructorId: key,
    performanceRating: "EXCELLENT",
    aggregateMetrics: {
      totalCourses: rows.length,
      totalStudents: 180,
      averageStudentSatisfaction: 4.5,
      overallCompletionRate: Number(averageCompletionRate.toFixed(2)),
      overallPassRate: 89.5,
      totalTeachingHours: 120.5,
    },
    ...pageData,
  };
};

export const adminGetInstructorGradingSummaryReport = async (
  instructorId,
  params = {},
) => {
  // const { data: { data } } = await http.get(`/v2/instructors/${instructorId}/grading-summary`, { params });
  // return data;
  const key = getInstructorKey(instructorId);
  const rows = MOCK_GRADING_SUMMARY_BY_INSTRUCTOR[key];
  const pageData = paginate(rows, params);
  const totalSubmissions = rows.reduce(
    (currentTotal, row) => currentTotal + row.totalSubmissions,
    0,
  );
  const totalGraded = rows.reduce(
    (currentTotal, row) => currentTotal + row.graded,
    0,
  );
  const totalPending = rows.reduce(
    (currentTotal, row) => currentTotal + row.pending,
    0,
  );
  return {
    instructorId: key,
    overallMetrics: {
      totalAssignments: rows.length,
      totalSubmissions,
      totalGraded,
      totalPending,
      totalOverdue: 0,
      averageTurnaroundDays: 3.5,
      feedbackCompletionRate: 95,
      overallAverageGrade:
        rows.reduce((currentTotal, row) => currentTotal + row.averageGrade, 0) /
        rows.length,
    },
    ...pageData,
  };
};

export const adminGetAssessmentItemAnalysisReport = async (
  assessmentId,
  params = {},
) => {
  // const { data: { data } } = await http.get(`/v2/assessments/${assessmentId}/analytics`, { params });
  // return data;
  const key = getInstructorKey(params.instructorId);
  let rows = [...MOCK_ITEM_ANALYSIS_BY_INSTRUCTOR[key]];
  if (params.flaggedOnly === true || params.flaggedOnly === "true") {
    rows = rows.filter((item) => item.flaggedForReview);
  }
  const pageData = paginate(rows, params);
  return {
    assessmentId,
    assessmentTitle: `${rows[0]?.courseTitle || "Assessment"} Final Exam`,
    courseName: rows[0]?.courseTitle || "Course",
    totalAttempts: rows[0]?.attempts || 0,
    totalQuestions: rows.length,
    overallStatistics: {
      averageScore: 78.5,
      standardDeviation: 12.3,
      reliabilityCoefficient: 0.89,
      meanDifficultyIndex: 0.65,
      meanDiscriminationIndex: 0.38,
    },
    ...pageData,
  };
};

export const adminFlagAssessmentQuestionForReview = async (
  assessmentId,
  payload,
) => {
  // const { data: { message, data } } = await http.post(`/v2/assessments/${assessmentId}/questions/flag`, payload);
  // return { message, data };
  return {
    message: "Question flagged successfully",
    data: {
      assessmentId,
      questionId: payload.questionId,
      reason: payload.reason,
      suggestedAction: payload.suggestedAction || "REVIEW",
    },
  };
};

export const adminBulkFlagAssessmentQuestionsForReview = async (
  assessmentId,
  payload,
) => {
  // const { data: { message, data } } = await http.post(`/v2/assessments/${assessmentId}/questions/bulk-flag`, payload);
  // return { message, data };
  const totalRequested = payload?.questions?.length || 0;
  return {
    message: "Questions flagged successfully",
    data: {
      assessmentId,
      totalRequested,
      flagged: totalRequested,
      failed: 0,
    },
  };
};

export const getInstructorCourseCompletion =
  adminGetInstructorCourseCompletionReport;
export const getInstructorPerformance = adminGetInstructorPerformanceReport;
export const getInstructorGradingSummary =
  adminGetInstructorGradingSummaryReport;
export const getAssessmentAnalytics = adminGetAssessmentItemAnalysisReport;
export const flagAssessmentQuestion = adminFlagAssessmentQuestionForReview;
export const bulkFlagAssessmentQuestions =
  adminBulkFlagAssessmentQuestionsForReview;
export const getInstructorReportDirectory = adminGetInstructorReportDirectory;

// ─── V2 Instructor Performance ─────────────────────────────────────────────────

const BASE_V2 = "/v1/instructor-performance-v2";

export const getInstructorPerformanceReportV2 = async (params) => {
  const { data } = await http.get(`${BASE_V2}/report`, { params });
  return data;
};

export const getInstructorPerformanceDrillDown = async (instructorId, params) => {
  const { data } = await http.get(`${BASE_V2}/report/${instructorId}`, { params });
  return data;
};
