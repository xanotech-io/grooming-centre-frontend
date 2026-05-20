import { http } from '../http';

export const adminGetArchiveKPIs = async () => {
  const { data: { data } } = await http.get('/v1/report-archive/kpis');
  return { kpis: data };
};

export const adminListArchiveRecords = async (params) => {
  const { data: { data } } = await http.get('/v1/report-archive', { params });
  const archives = data?.archives ?? (Array.isArray(data) ? data : []);
  const total = data?.total ?? archives.length;
  const page = data?.page ?? 1;
  const limit = data?.limit ?? 20;
  return { archives, total, page, limit };
};

export const adminGetArchiveRecord = async (archiveId) => {
  const { data: { data } } = await http.get(`/v1/report-archive/${archiveId}`);
  return { archive: data };
};

export const adminArchiveReport = async (reportId, body = {}) => {
  const { data: { data, message } } = await http.post(`/v1/report-archive/${reportId}/archive`, body);
  return { archive: data, message };
};

export const adminRetrieveArchivedReport = async (archiveId) => {
  const { data: { data, message } } = await http.patch(`/v1/report-archive/${archiveId}/retrieve`);
  return { archive: data, message };
};
