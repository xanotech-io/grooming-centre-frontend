import { http } from "../http";

/**
 * TC13 - Create OJT activity
 * POST /v2/compliance/ojt
 */
export const adminCreateOjtActivity = async (body = {}) => {
  const { data } = await http.post('/v2/compliance/ojt', body);
  return { message: data?.message, activity: data?.data ?? data };
};

/**
 * TC13 - Get all OJT activities
 * GET /v2/compliance/ojt
 */
export const adminGetOjtActivities = async (params = {}) => {
  const { data } = await http.get('/v2/compliance/ojt', { params });
  const d = data?.data ?? {};
  return {
    activities: d.activities ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

/**
 * TC13 - Get OJT activity by id
 * GET /v2/compliance/ojt/{ojtId}
 */
export const adminGetOjtActivityById = async (ojtId) => {
  const { data } = await http.get(`/v2/compliance/ojt/${ojtId}`);
  return { activity: data?.data ?? data };
};

/**
 * TC13 - Update OJT activity
 * PATCH /v2/compliance/ojt/{ojtId}
 */
export const adminUpdateOjtActivity = async (ojtId, body = {}) => {
  const { data } = await http.patch(`/v2/compliance/ojt/${ojtId}`, body);
  return { message: data?.message, activity: data?.data ?? data };
};

/**
 * TC13 - Add supervisor feedback
 * POST /v2/compliance/ojt/{ojtId}/feedback
 */
export const adminAddOjtSupervisorFeedback = async (ojtId, body = {}) => {
  const { data } = await http.post(`/v2/compliance/ojt/${ojtId}/feedback`, body);
  return { message: data?.message, activity: data?.data ?? data };
};
