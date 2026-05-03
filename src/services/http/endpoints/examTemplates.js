import { http } from '../http';

// ---------------------------------------------------------------------------
// Create Marking Template
// POST /api/v1/marking-template/create
// ---------------------------------------------------------------------------

export const adminCreateMarkingTemplate = async (body) => {
  const { data: { message, data } } = await http.post('/v1/marking-template/create', body);
  return { message, template: data };
};

// ---------------------------------------------------------------------------
// Get All Marking Templates
// GET /v1/marking-template/all
// ---------------------------------------------------------------------------

export const adminGetMarkingTemplates = async (params) => {
  const { data: { data } } = await http.get('/v1/marking-template/all', { params });
  return { templates: Array.isArray(data) ? data : [] };
};

// ---------------------------------------------------------------------------
// Get Single Marking Template
// GET /v1/marking-template/:templateId
// ---------------------------------------------------------------------------

export const adminGetMarkingTemplateById = async (templateId) => {
  const { data: { data } } = await http.get(`/v1/marking-template/${templateId}`);
  return { template: data };
};

// ---------------------------------------------------------------------------
// Question Bank endpoints (retained for CreateQuestionBankPage)
// ---------------------------------------------------------------------------

export const adminCreateQuestionBank = async (body) => {
  const { data: { message, data } } = await http.post('/v2/question-banks', body);
  return { message, bank: data };
};

export const adminGetQuestionBanks = async (params) => {
  const { data: { data } } = await http.get('/v2/question-banks', { params });
  return { banks: data.banks, totalDocumentsCount: data.pagination.totalItems };
};
