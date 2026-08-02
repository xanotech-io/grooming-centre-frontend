import { http } from '../http';

/**
 * Edit History Log Module (TC02)
 * Tracks and records all modifications made to course-related content
 * (modules, lessons, assessments, exams) for a given course.
 */

export const adminGetCourseEditHistory = async (courseId, params = {}) => {
  const { data } = await http.get(`/v2/courses/${courseId}/edit-history`, { params });
  const d = data?.data ?? {};
  return {
    logs: d.logs ?? d.rows ?? [],
    total: d.total ?? d.count ?? 0,
    page: d.page ?? params.page ?? 1,
    limit: d.limit ?? params.limit ?? 20,
  };
};

export const adminGetCourseEditHistoryKpis = async (courseId, params = {}) => {
  const { data } = await http.get(`/v2/courses/${courseId}/edit-history/kpis`, { params });
  return data?.data ?? {};
};
