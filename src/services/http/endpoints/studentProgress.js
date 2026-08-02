import { http } from "../http";

/**
 * TC23 - Get student progress reports
 * GET /v2/students/{studentId}/progress
 */
export const adminGetStudentProgress = async (studentId, params = {}) => {
  const { data } = await http.get(`/v2/students/${studentId}/progress`, { params });
  return data?.data ?? data;
};

/**
 * TC23 - Get student progress summary
 * GET /v2/students/{studentId}/progress/summary
 */
export const adminGetStudentProgressSummary = async (studentId) => {
  const { data } = await http.get(`/v2/students/${studentId}/progress/summary`);
  return data?.data ?? data;
};

/**
 * TC23 - Get enrollment statistics
 * GET /v2/enrollment-management/statistics
 */
export const adminGetEnrollmentStatistics = async () => {
  const { data } = await http.get('/v2/enrollment-management/statistics');
  return { statistics: data?.data ?? data };
};

/**
 * TC23 - Get user enrollment history
 * GET /v2/enrollment-management/user/{userId}/history
 */
export const adminGetUserEnrollmentHistory = async (userId, params = {}) => {
  const { data } = await http.get(`/v2/enrollment-management/user/${userId}/history`, { params });
  const d = data?.data ?? {};
  return {
    history: d.rows ?? d.history ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
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
