import { http } from "../http";

let MOCK_STUDENT_PROGRESS = [
  {
    reportId: "PRG-001",
    studentId: "mock_student_1",
    studentName: "Nmorsi Donald",
    courseId: "AGR101",
    courseTitle: "Agriculture Fundamentals",
    enrollmentDate: "2025-09-01T08:00:00Z",
    modulesCompleted: 3,
    totalModules: 5,
    completionPercentage: 60,
    assessmentScores: [
      { assessmentId: "ASSESS-001", title: "Module 1 Quiz", score: 85, maxScore: 100 },
      { assessmentId: "ASSESS-002", title: "Module 2 Quiz", score: 78, maxScore: 100 },
    ],
    latestAssessmentScore: 78,
    cumulativeAverageScore: 81.5,
    completionStatus: "IN_PROGRESS",
    certificatesEarned: [],
    lastAccessDate: "2025-11-12T15:30:00Z",
    timeSpentHours: 24.5,
    weeklyLoginCount: 3,
    generatedAt: "2025-11-15T10:00:00Z",
  },
  {
    reportId: "PRG-002",
    studentId: "mock_student_1",
    studentName: "Nmorsi Donald",
    courseId: "AGR201",
    courseTitle: "Soil Science Advanced",
    enrollmentDate: "2025-08-20T08:00:00Z",
    modulesCompleted: 8,
    totalModules: 8,
    completionPercentage: 100,
    assessmentScores: [
      { assessmentId: "ASSESS-010", title: "Final Assessment", score: 92, maxScore: 100 },
    ],
    latestAssessmentScore: 92,
    cumulativeAverageScore: 90,
    completionStatus: "COMPLETED",
    certificatesEarned: ["CERT-001"],
    lastAccessDate: "2025-11-10T15:30:00Z",
    timeSpentHours: 32,
    weeklyLoginCount: 2,
    generatedAt: "2025-11-15T10:00:00Z",
  },
  {
    reportId: "PRG-003",
    studentId: "mock_student_1",
    studentName: "Nmorsi Donald",
    courseId: "AGR301",
    courseTitle: "Agri Business Ethics",
    enrollmentDate: "2025-10-03T08:00:00Z",
    modulesCompleted: 0,
    totalModules: 6,
    completionPercentage: 0,
    assessmentScores: [],
    latestAssessmentScore: null,
    cumulativeAverageScore: 0,
    completionStatus: "NOT_STARTED",
    certificatesEarned: [],
    lastAccessDate: "2025-10-05T09:00:00Z",
    timeSpentHours: 1.2,
    weeklyLoginCount: 1,
    generatedAt: "2025-11-15T10:00:00Z",
  },
  {
    reportId: "PRG-004",
    studentId: "LRN-002",
    studentName: "Jane Okoro",
    courseId: "CS101",
    courseTitle: "Customer Service Essentials",
    enrollmentDate: "2025-09-10T08:00:00Z",
    modulesCompleted: 4,
    totalModules: 4,
    completionPercentage: 100,
    assessmentScores: [
      { assessmentId: "ASSESS-201", title: "Course Assessment", score: 88, maxScore: 100 },
    ],
    latestAssessmentScore: 88,
    cumulativeAverageScore: 88,
    completionStatus: "COMPLETED",
    certificatesEarned: ["CERT-100"],
    lastAccessDate: "2025-11-11T11:30:00Z",
    timeSpentHours: 18,
    weeklyLoginCount: 2,
    generatedAt: "2025-11-15T10:00:00Z",
  },
];

const MOCK_ENROLLMENT_STATS = {
  totalEnrollments: 1250,
  activeEnrollments: 980,
  completedEnrollments: 210,
  droppedEnrollments: 60,
};

const MOCK_ENROLLMENT_HISTORY = {
  "mock_student_1": [
    {
      historyId: "HIST-001",
      userId: "mock_student_1",
      courseId: "AGR101",
      action: "ENROLLED",
      actionDate: "2025-09-01T08:00:00Z",
    },
    {
      historyId: "HIST-002",
      userId: "mock_student_1",
      courseId: "AGR201",
      action: "COMPLETED",
      actionDate: "2025-11-01T08:00:00Z",
    },
  ],
};

const normalizeStatus = (status) => {
  if (!status) return "";
  const normalized = String(status).toUpperCase();
  if (normalized === "IN PROGRESS") return "IN_PROGRESS";
  if (normalized === "NOT STARTED") return "NOT_STARTED";
  return normalized;
};

const paginate = (rows, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    rows: rows.slice(start, end),
    count: rows.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

const toReadableStatus = (status) => {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "NOT_STARTED":
      return "Not Started";
    default:
      return status;
  }
};

/**
 * TC23 - Get student progress reports
 * GET /api/v2/students/{studentId}/progress
 */
export const adminGetStudentProgress = async (studentId, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/students/${studentId}/progress`, { params });

  const normalizedStatus = normalizeStatus(params.status);
  const courseId = params.courseId;
  const search = String(params.search || "").trim().toLowerCase();

  const filtered = MOCK_STUDENT_PROGRESS.filter((report) => {
    const matchesStudent = studentId ? report.studentId === studentId : true;
    const matchesStatus = normalizedStatus
      ? report.completionStatus === normalizedStatus
      : true;
    const matchesCourse = courseId ? report.courseId === courseId : true;
    const matchesSearch = search
      ? [report.studentName, report.courseTitle, report.courseId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      : true;

    return matchesStudent && matchesStatus && matchesCourse && matchesSearch;
  });

  const pagination = paginate(filtered, params);

  return {
    rows: pagination.rows.map((item) => ({
      ...item,
      completionStatus: toReadableStatus(item.completionStatus),
    })),
    count: pagination.count,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
};

/**
 * TC23 - Get student progress summary
 * GET /api/v2/students/{studentId}/progress/summary
 */
export const adminGetStudentProgressSummary = async (studentId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/students/${studentId}/progress/summary`);

  const reports = MOCK_STUDENT_PROGRESS.filter(
    (item) => item.studentId === studentId,
  );

  const totalCourses = reports.length;
  const completedCourses = reports.filter(
    (item) => item.completionStatus === "COMPLETED",
  ).length;
  const inProgressCourses = reports.filter(
    (item) => item.completionStatus === "IN_PROGRESS",
  ).length;

  const overallCompletionRate = totalCourses
    ? Number(
        (
          reports.reduce(
            (acc, item) => acc + Number(item.completionPercentage || 0),
            0,
          ) / totalCourses
        ).toFixed(1),
      )
    : 0;

  const averageScore = reports.length
    ? Number(
        (
          reports.reduce(
            (acc, item) => acc + Number(item.cumulativeAverageScore || 0),
            0,
          ) / reports.length
        ).toFixed(1),
      )
    : 0;

  const totalCertificates = reports.reduce(
    (acc, item) => acc + (item.certificatesEarned?.length || 0),
    0,
  );

  const totalTimeSpentHours = Number(
    reports
      .reduce((acc, item) => acc + Number(item.timeSpentHours || 0), 0)
      .toFixed(1),
  );

  const averageWeeklyLogins = reports.length
    ? Number(
        (
          reports.reduce((acc, item) => acc + Number(item.weeklyLoginCount || 0), 0) /
          reports.length
        ).toFixed(1),
      )
    : 0;

  return {
    studentId,
    studentName: reports[0]?.studentName || "Learner",
    totalCourses,
    completedCourses,
    inProgressCourses,
    overallCompletionRate,
    averageScore,
    totalCertificates,
    totalTimeSpentHours,
    averageWeeklyLogins,
    curriculumProgress: [
      {
        curriculumId: "CURR-001",
        curriculumTitle: "Data Science Professional",
        requiredCoursesCount: 5,
        coursesCompleted: 3,
        completionStatus: "IN_PROGRESS",
        certificationEligibility: "Not Eligible",
        assessmentStatus: "2 Passed, 1 Pending",
      },
      {
        curriculumId: "CURR-002",
        curriculumTitle: "Customer Service Certification",
        requiredCoursesCount: 4,
        coursesCompleted: 4,
        completionStatus: "COMPLETED",
        certificationEligibility: "Eligible",
        assessmentStatus: "4 Passed",
      },
    ],
    lastActivityDate:
      reports
        .map((item) => item.lastAccessDate)
        .filter(Boolean)
        .sort()
        .pop() || null,
  };
};

/**
 * TC23 - Get enrollment statistics
 * GET /api/v2/enrollment-management/statistics
 */
export const adminGetEnrollmentStatistics = async () => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/api/v2/enrollment-management/statistics');

  return {
    statistics: MOCK_ENROLLMENT_STATS,
  };
};

/**
 * TC23 - Get user enrollment history
 * GET /api/v2/enrollment-management/user/{userId}/history
 */
export const adminGetUserEnrollmentHistory = async (userId, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/enrollment-management/user/${userId}/history`, { params });

  const rows = MOCK_ENROLLMENT_HISTORY[userId] || [];
  const pagination = paginate(rows, params);

  return {
    history: pagination.rows,
    pagination: {
      count: pagination.count,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    },
  };
};

/**
 * Get the authenticated student's overall progress for a course
 * @param {string} courseId
 * @returns {Promise<{ courseId, userId, totalModules, completedModules, completionPercentage, moduleProgress }>}
 */
export const getCourseProgress = async (courseId) => {
  const {
    data: { data },
  } = await http.get(`/v1/course/${courseId}/progress`);

  return {
    courseId: data.courseId,
    userId: data.userId,
    totalModules: data.totalModules,
    completedModules: data.completedModules,
    completionPercentage: data.completionPercentage,
    moduleProgress: data.moduleProgress || [],
  };
};

/**
 * Get the authenticated student's progress for a single module
 * @param {string} moduleId
 * @returns {Promise<{ moduleId, completedLessonsCount, totalLessons, completionPercentage, isModuleCompleted, completedAt, optionalItemsCompleted }>}
 */
export const getModuleProgress = async (moduleId) => {
  const {
    data: { data },
  } = await http.get(`/v1/modules/${moduleId}/progress`);

  return {
    moduleId: data.moduleId,
    completedLessonsCount: data.completedLessonsCount,
    totalLessons: data.totalLessons,
    completionPercentage: data.completionPercentage,
    isModuleCompleted: data.isModuleCompleted,
    completedAt: data.completedAt,
    optionalItemsCompleted: data.optionalItemsCompleted || [],
  };
};
