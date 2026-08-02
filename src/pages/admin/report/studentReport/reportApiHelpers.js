/**
 * Normalizes list responses from GET /api/v2/... report endpoints
 * (same idea as adminGetUserListing / badge listing).
 */
export const extractRowsFromEnvelope = (payload) => {
  if (payload == null) return [];
  let node = payload;
  if (node.data !== undefined) node = node.data;
  if (node && typeof node === "object" && node.data !== undefined && !Array.isArray(node.data)) {
    node = node.data;
  }
  const list = node?.rows ?? node?.items ?? (Array.isArray(node) ? node : []);
  return Array.isArray(list) ? list : [];
};

export const extractPaginationFromEnvelope = (payload, rowsLength, params = {}) => {
  let node = payload;
  if (node?.data !== undefined) node = node.data;
  if (node && typeof node === "object" && node.data !== undefined && !Array.isArray(node.data)) {
    node = node.data;
  }
  const totalDocumentsCount = node?.totalDocumentsCount ?? node?.count ?? rowsLength;
  const showingDocumentsCount = node?.showingDocumentsCount ?? rowsLength;
  const currentPage = node?.currentPage ?? (Number(params.page) || 1);
  const totalPages = node?.totalPages ?? 1;
  return {
    totalDocumentsCount,
    showingDocumentsCount,
    currentPage,
    totalPages,
  };
};
