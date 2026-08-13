import { http } from '../http';

/**
 * Create Exam Paper Config Preset
 * POST /v1/exam-paper-config-preset-v2/
 * body: name, markingTemplateId (opt), navigationMode, uiSettings, toolsEnabled,
 *       accessibilitySettings, submissionSettings, randomizationMethod, randomizationConfig, sections
 */
export const adminCreateExamPaperConfigPreset = async (body) => {
  const { data } = await http.post('/v1/exam-paper-config-preset-v2/', body);
  return { message: data?.message, preset: data?.data ?? data };
};

/**
 * List Exam Paper Config Presets
 * GET /v1/exam-paper-config-preset-v2/
 */
export const adminGetExamPaperConfigPresets = async (params = {}) => {
  const { data } = await http.get('/v1/exam-paper-config-preset-v2/', { params });
  const d = data?.data ?? {};
  return {
    presets: d.presets ?? d.rows ?? (Array.isArray(d) ? d : []),
    pagination: d.pagination ?? {},
  };
};

/**
 * Get Exam Paper Config Preset by ID
 * GET /v1/exam-paper-config-preset-v2/:presetId
 * response gains: usageCount, coursesUsedIn: [{id, title}]
 */
export const adminGetExamPaperConfigPresetById = async (presetId) => {
  const { data } = await http.get(`/v1/exam-paper-config-preset-v2/${presetId}`);
  return { preset: data?.data ?? data };
};

/**
 * Partial Update Exam Paper Config Preset
 * PATCH /v1/exam-paper-config-preset-v2/:presetId
 * Any field other than name can only be changed while usageCount is zero —
 * otherwise the backend returns 400 with a "Cannot change preset structure..." message.
 */
export const adminUpdateExamPaperConfigPreset = async (presetId, body) => {
  const { data } = await http.patch(`/v1/exam-paper-config-preset-v2/${presetId}`, body);
  return { message: data?.message, preset: data?.data ?? data };
};

/**
 * Delete Exam Paper Config Preset
 * DELETE /v1/exam-paper-config-preset-v2/:presetId
 * 400 if the preset has any recorded usage.
 */
export const adminDeleteExamPaperConfigPreset = async (presetId) => {
  const { data } = await http.delete(`/v1/exam-paper-config-preset-v2/${presetId}`);
  return { message: data?.message };
};
