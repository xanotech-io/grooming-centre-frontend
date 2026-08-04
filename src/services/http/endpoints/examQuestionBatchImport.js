import { http } from "../http";

const BASE = "/v1/question-batch-import-v2";

export const downloadExamQuestionBatchTemplate = async () => {
  const response = await http.get(`${BASE}/template/download`, {
    responseType: "blob",
  });
  return response.data;
};

export const uploadExamQuestionBatch = async ({
  file,
  courseId,
  examinationId,
  assessmentId,
  mediaZip,
  defaultDifficulty,
  section,
  // "Create a new assessment/exam and import questions into it in one
  // step" — set only when nothing real exists yet (see
  // QuestionsPage.jsx's handleBatchUploadClick). When present,
  // examinationId/assessmentId must NOT be sent; the backend creates the
  // target itself from the fields below and this call is what makes it
  // real, same as the old quick-create-then-navigate flow used to.
  createTargetType, // "assessment" | "examination"
  title,
  moduleId,
  duration,
  startTime,
  endTime,
  examType, // "sectioned" | "unsectioned" | "hybrid"
  sections, // [{section_name, weightage, questionCount}] — sectioned/hybrid
  totalMarks, // sum of section weightages — sectioned/hybrid
  markingTemplateId, // unsectioned/hybrid
}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (mediaZip) formData.append("mediaZip", mediaZip);
  if (defaultDifficulty) formData.append("defaultDifficulty", defaultDifficulty);
  // Every row in this file belongs to the same section — the template has
  // no per-row section column, so it's supplied once here instead. Rows are
  // also explicitly tagged after upload (BatchUploadPage.jsx) so this still
  // lands correctly even if the parser itself ignores this field.
  if (section) formData.append("section", section);

  if (createTargetType) {
    formData.append("createTargetType", createTargetType);
    formData.append("title", title);
    if (courseId) formData.append("courseId", courseId);
    if (moduleId) formData.append("moduleId", moduleId);
    formData.append("duration", duration);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("examType", examType);
    // The documented shape is a strict either/or ("if sectioned" / "if not
    // sectioned"), but a hybrid exam genuinely needs both halves — send
    // whichever of these two actually has data instead of hard-branching on
    // examType, so "sectioned" gets sections+totalMarks, "unsectioned" gets
    // markingTemplateId, and "hybrid" gets both.
    //
    // Confirmed with backend: `sections` (and `questionQuantity`, on the
    // handlers that take one) is sent as a single JSON.stringify'd string
    // field — parsed server-side via their existing parseJsonField utility,
    // the same convention already used for options/acceptVariants/pairs on
    // question creation. Bracket-indexed keys (sections[0][name], ...) were
    // tried first and don't work here — express-fileupload has
    // parseNested:false, so multipart bracket notation is never
    // reconstructed into a real array on their end.
    if (Array.isArray(sections) && sections.length > 0) {
      formData.append("sections", JSON.stringify(sections));
    }
    // Confirmed via a real test: totalMarks is validated against the
    // marking template's own computed sum for "unsectioned" too, not just
    // "sectioned" — the documented shape only mentioned it for the sectioned
    // case, but omitting it here made the backend compare against
    // `undefined`. Send it whenever it's known, regardless of examType.
    if (totalMarks != null) formData.append("totalMarks", totalMarks);
    if (markingTemplateId) formData.append("markingTemplateId", markingTemplateId);
  } else {
    if (courseId) formData.append("courseId", courseId);
    if (examinationId) formData.append("examinationId", examinationId);
    if (assessmentId) formData.append("assessmentId", assessmentId);
  }

  const { data } = await http.post(`${BASE}/upload`, formData);
  return data;
};

// Confirmed with backend: the bare upload record (not /report, not /rows)
// is what actually carries the resolved assessmentId/examinationId for a
// createTargetType-created record — this is how BatchUploadPage.jsx finds
// out what got created.
export const getExamQuestionBatchUpload = async (uploadId) => {
  const { data } = await http.get(`${BASE}/${uploadId}`);
  return data;
};

export const getExamQuestionBatchRows = async (uploadId, status) => {
  const { data } = await http.get(`${BASE}/${uploadId}/rows`, {
    params: status ? { status } : undefined,
  });
  return data;
};

export const updateExamQuestionBatchRow = async (uploadId, rowId, patch) => {
  const { data } = await http.patch(`${BASE}/${uploadId}/rows/${rowId}`, patch);
  return data;
};

export const deleteExamQuestionBatchRow = async (uploadId, rowId) => {
  const { data } = await http.delete(`${BASE}/${uploadId}/rows/${rowId}`);
  return data;
};

export const confirmExamQuestionBatchImport = async (uploadId) => {
  const { data } = await http.post(`${BASE}/${uploadId}/confirm`);
  return data;
};

export const getExamQuestionBatchReport = async (uploadId) => {
  const { data } = await http.get(`${BASE}/${uploadId}/report`);
  return data;
};

export const getExamQuestionBatchKpis = async () => {
  const { data } = await http.get(`${BASE}/kpis`);
  return data;
};

export const listExamQuestionBatchUploads = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const deleteExamQuestionBatchUpload = async (uploadId) => {
  const { data } = await http.delete(`${BASE}/${uploadId}`);
  return data;
};
