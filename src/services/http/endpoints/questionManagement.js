import { http } from "../http";

/**
 * Get all uploaded questions
 * GET /v2/questions
 */
export const adminGetUploadedQuestions = async (params = {}) => {
  const { data } = await http.get('/v2/questions', { params });
  const d = data?.data ?? {};
  return {
    questions: d.questions ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: {
      count: d.count ?? d.total ?? 0,
      page: d.page ?? params.page ?? 1,
      limit: d.limit ?? params.limit ?? 10,
      totalPages: d.totalPages ?? 1,
    },
  };
};

/**
 * Get uploaded question by id
 * GET /v2/questions/{id}
 */
export const adminGetUploadedQuestionById = async (questionId) => {
  const { data } = await http.get(`/v2/questions/${questionId}`);
  return { question: data?.data ?? data };
};

/**
 * Update uploaded question (restricted for standalone exam)
 * PATCH /v2/questions/{id}
 */
export const adminUpdateUploadedQuestion = async (questionId, body = {}) => {
  const { data } = await http.patch(`/v2/questions/${questionId}`, body);
  return { message: data?.message, question: data?.data ?? data };
};

/**
 * Delete uploaded question (restricted for standalone exam)
 * DELETE /v2/questions/{id}
 */
export const adminDeleteUploadedQuestion = async (questionId) => {
  const { data } = await http.delete(`/v2/questions/${questionId}`);
  return { message: data?.message, data: data?.data ?? data };
};

/**
 * Get course questions
 * GET /v2/courses/{courseId}/questions
 */
export const adminGetCourseUploadedQuestions = async (courseId, params = {}) => {
  const { data } = await http.get(`/v2/courses/${courseId}/questions`, { params });
  const d = data?.data ?? {};
  return {
    courseId,
    questions: d.questions ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: {
      count: d.count ?? d.total ?? 0,
      page: d.page ?? params.page ?? 1,
      limit: d.limit ?? params.limit ?? 10,
      totalPages: d.totalPages ?? 1,
    },
  };
};
