import { http } from "../http";

/* ─── Admin endpoints ─────────────────────────────────────────── */

export const adminGetBadges = async (params) => {
  const { data } = await http.get("/v1/badges", { params });
  return data;
};

/**
 * badgeFile can be a real File (uploaded via the badge form) or a plain
 * URL string (already-hosted image). Only a File needs multipart — the
 * backend accepts both content types on the same create/update endpoints.
 */
const buildBadgeRequestBody = ({ badgeFile, courseIds, ...rest }) => {
  const badgeFileIsFile = typeof File !== "undefined" && badgeFile instanceof File;

  if (!badgeFileIsFile) {
    return { ...rest, badgeFile, courseIds };
  }

  const formData = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  formData.append("badgeFile", badgeFile);
  formData.append("courseIds", JSON.stringify(courseIds || []));

  return formData;
};

export const adminCreateBadge = async (body) => {
  const requestBody = buildBadgeRequestBody(body);
  const isMultipart = requestBody instanceof FormData;
  const { data } = await http.post(
    "/v1/badges/create",
    requestBody,
    isMultipart ? { headers: { "Content-Type": "multipart/form-data" } } : undefined,
  );
  return data;
};

export const adminGetBadgeKPIs = async () => {
  const { data } = await http.get("/v1/badges/kpis");
  return data;
};

export const adminGetBadgeReport = async () => {
  const { data } = await http.get("/v1/badges/report");
  return data;
};

export const adminGetPendingBadgeApprovals = async () => {
  const { data } = await http.get("/v1/badges/pending-approvals");
  return data;
};

export const adminUpdateBadge = async (badgeId, body) => {
  const requestBody = buildBadgeRequestBody(body);
  const isMultipart = requestBody instanceof FormData;
  const { data } = await http.put(
    `/v1/badges/${badgeId}`,
    requestBody,
    isMultipart ? { headers: { "Content-Type": "multipart/form-data" } } : undefined,
  );
  return data;
};

export const adminDeactivateBadge = async (badgeId) => {
  const { data } = await http.delete(`/v1/badges/${badgeId}`);
  return data;
};

export const adminAddBadgeCourses = async (badgeId, body) => {
  const { data } = await http.post(`/v1/badges/${badgeId}/courses`, body);
  return data;
};

export const adminRemoveBadgeCourses = async (badgeId, body) => {
  const { data } = await http.delete(`/v1/badges/${badgeId}/courses`, {
    data: body,
  });
  return data;
};

export const adminAwardBadge = async (badgeId, userId, body) => {
  const { data } = await http.post(
    `/v1/badges/${badgeId}/award/${userId}`,
    body,
  );
  return data;
};

export const adminApproveBadge = async (badgeId, userId, body) => {
  const { data } = await http.post(
    `/v1/badges/${badgeId}/approve/${userId}`,
    body,
  );
  return data;
};

/* ─── Student / shared endpoints ──────────────────────────────── */

export const userGetBadges = async () => {
  const { data } = await http.get("/v1/badges");
  return data;
};

export const userGetBadgeById = async (badgeId) => {
  const { data } = await http.get(`/v1/badges/${badgeId}`);
  return data;
};

export const userGetMyBadges = async (params) => {
  const { data } = await http.get("/v1/badges/my-badges", { params });
  return data;
};

export const userGetMyRank = async (params) => {
  const { data } = await http.get("/v1/badges/rank", { params });
  return data;
};

export const adminGetBadgeProgressByUserId = async (userId) => {
  const { data } = await http.get(`/v1/badges/users/${userId}/progress`);
  return data;
};

export const userGetBadgeProgress = async (badgeId) => {
  const { data } = await http.get(`/v1/badges/${badgeId}/progress`);
  return data;
};
