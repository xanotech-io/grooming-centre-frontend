import { http } from "../http";

/**
 * Endpoint to get all badges
 *
 * @param {object} [params]
 * @returns {Promise<{
 *  badges: Array<{
 *    id: string,
 *    name: string,
 *    description: string,
 *    imageUrl: string,
 *    category: string,
 *    criteria: object,
 *    points: number,
 *    isActive: boolean,
 *    expiryDays: number,
 *    createdAt: string,
 *    updatedAt: string
 *  }>,
 *  count: number,
 *  page: number,
 *  limit: number,
 *  totalPages: number
 * }>}
 */
export const adminGetBadges = async (params) => {
  const path = `/v2/badges`;

  const {
    data: { data },
  } = await http.get(path, { params });

  return {
    badges: data.rows,
    count: data.count,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
};

/**
 * Endpoint to create a new badge (Admin only)
 *
 * @param {{
 *  name: string,
 *  description: string,
 *  imageUrl: string,
 *  category: string,
 *  criteria: object,
 *  points: number,
 *  expiryDays: number
 * }} body
 * @returns {Promise<{ message: string, badge: object }>}
 */
export const adminCreateBadge = async (body) => {
  const path = `/v2/badges`;

  const { data } = await http.post(path, body);

  // Return raw response so the caller can adapt to any shape
  return data;
};

/**
 * Endpoint to delete a badge (Admin only)
 *
 * @param {string} id - badge id
 * @returns {Promise<void>}
 */
export const adminDeleteBadge = async (id) => {
  const path = `/v2/badges/${id}`;

  await http.delete(path);
};


