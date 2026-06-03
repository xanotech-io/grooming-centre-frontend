import { http } from '../http';

/**
 * Get all course content records with optional courseId filter
 * GET /v2/courses/{courseId}/content  or  /v2/courses/content
 */
export const getCourseContents = async (params) => {
  const base = params?.courseId
    ? `/v2/courses/${params.courseId}/content`
    : '/v2/courses/content';
  const { data } = await http.get(base, { params });
  const d = data?.data ?? {};
  const rows = d.rows ?? d.contents ?? (Array.isArray(d) ? d : []);
  return { contents: rows, totalDocumentsCount: d.count ?? d.total ?? rows.length };
};

/**
 * 8.1 Get Course Content
 * GET /v2/courses/{courseId}/content/{contentId}
 */
export const getCourseContent = async (courseId, contentId) => {
  const { data } = await http.get(`/v2/courses/${courseId}/content/${contentId}`);
  return { content: data?.data ?? data };
};

/**
 * 8.2 Create Course Content
 * POST /v2/courses/{courseId}/content
 */
export const createCourseContent = async (courseId, body) => {
  const { data } = await http.post(`/v2/courses/${courseId}/content`, body);
  return { message: data?.message, content: data?.data ?? data };
};

/**
 * 8.3 Update Course Content
 * PUT /v2/courses/{courseId}/content/{contentId}
 */
export const updateCourseContent = async (courseId, contentId, body) => {
  const { data } = await http.put(`/v2/courses/${courseId}/content/${contentId}`, body);
  return { message: data?.message, content: data?.data ?? data };
};
