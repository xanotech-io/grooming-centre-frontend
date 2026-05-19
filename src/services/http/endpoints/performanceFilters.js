import { http } from '../http';

const BASE = '/v1/performance-filters-v2';

export const getPerformanceFilterGradingScale = async () => {
  const { data } = await http.get(`${BASE}/grading-scale`);
  return data.data ?? {};
};

export const createPerformanceFilter = async (payload) => {
  const { data } = await http.post(`${BASE}/filters`, payload);
  return data.data ?? {};
};

export const getPerformanceFilters = async (params) => {
  const { data } = await http.get(`${BASE}/filters`, { params });
  const inner = data.data ?? {};
  return {
    filters: inner.filters ?? inner.rows ?? (Array.isArray(inner) ? inner : []),
    total: inner.total ?? inner.count ?? 0,
  };
};

export const getPerformanceFilterById = async (filterId) => {
  const { data } = await http.get(`${BASE}/filters/${filterId}`);
  return data.data ?? {};
};

export const updatePerformanceFilter = async (filterId, payload) => {
  const { data } = await http.put(`${BASE}/filters/${filterId}`, payload);
  return data.data ?? {};
};

export const deletePerformanceFilter = async (filterId) => {
  const { data } = await http.delete(`${BASE}/filters/${filterId}`);
  return data;
};

export const executePerformanceFilter = async (filterId, payload = {}) => {
  const { data } = await http.post(`${BASE}/filters/${filterId}/execute`, payload);
  return data.data ?? {};
};

export const previewPerformanceFilter = async (payload) => {
  const { data } = await http.post(`${BASE}/preview`, payload);
  return data.data ?? {};
};

export const getPerformanceFilterStats = async () => {
  const { data } = await http.get(`${BASE}/stats`);
  return data.data ?? {};
};
