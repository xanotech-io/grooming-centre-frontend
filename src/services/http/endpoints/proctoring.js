import { http } from '../http';

// POST /api/v1/proctoring-v2/events
export const logProctoringEvent = async (body) => {
  const { data } = await http.post('/v1/proctoring-v2/events', body);
  return data.data;
};

// GET /api/v1/proctoring-v2/events
export const getProctoringEvents = async (params = {}) => {
  const { data } = await http.get('/v1/proctoring-v2/events', { params });
  return data.data ?? { total: 0, page: 1, limit: 20, events: [] };
};

// POST /api/v1/proctoring-v2/events/{eventId}/actions
export const recordProctoringAction = async (eventId, body) => {
  const { data } = await http.post(`/v1/proctoring-v2/events/${eventId}/actions`, body);
  return data.data;
};

// GET /api/v1/proctoring-v2/sessions/{examId}
export const getExamSessionAudit = async (examId) => {
  const { data } = await http.get(`/v1/proctoring-v2/sessions/${examId}`);
  return data.data;
};

// GET /api/v1/proctoring-v2/audit-report
export const getProctoringAuditKpi = async (params = {}) => {
  const { data } = await http.get('/v1/proctoring-v2/audit-report', { params });
  return data.data;
};

// POST /api/v1/proctoring-v2/screen-warning
export const postScreenWarning = async (body) => {
  const { data } = await http.post('/v1/proctoring-v2/screen-warning', body);
  return data.data ?? data;
};
