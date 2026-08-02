import { http } from "../http";

// ---------------------------------------------------------------------------
// TC08 - Generate Individual Student Transcripts
// GET /v2/students/{studentId}/transcript
// ---------------------------------------------------------------------------

export const adminGetStudentTranscript = async (studentId, params = {}) => {
  const { data } = await http.get(`/v2/students/${studentId}/transcript`, { params });
  return { message: data?.message, data: data?.data ?? data };
};

// ---------------------------------------------------------------------------
// TC09 - Request Official Transcript
// POST /v2/students/{studentId}/transcript/request
// ---------------------------------------------------------------------------

export const adminRequestOfficialTranscript = async (studentId, body = {}) => {
  const { data } = await http.post(`/v2/students/${studentId}/transcript/request`, body);
  return { message: data?.message, data: data?.data ?? data };
};

// ---------------------------------------------------------------------------
// Verify Transcript
// POST /v2/transcripts/verify
// ---------------------------------------------------------------------------

export const adminVerifyTranscript = async (payload) => {
  const { data } = await http.post('/v2/transcripts/verify', payload);
  return { message: data?.message, data: data?.data ?? data };
};

// ---------------------------------------------------------------------------
// Post Completion to Transcript (internal admin action)
// POST /v2/students/{studentId}/transcript
// ---------------------------------------------------------------------------

export const adminPostCompletionToTranscript = async (studentId, body) => {
  const { data } = await http.post(`/v2/students/${studentId}/transcript`, body);
  return { message: data?.message, data: data?.data ?? data };
};

// ---------------------------------------------------------------------------
// Student - Request Transcript
// POST /api/v1/student-transcript-v2
// ---------------------------------------------------------------------------

export const studentRequestTranscript = async (body) => {
  const { data } = await http.post('/v1/student-transcript-v2', body);
  return { success: data.success, message: data.message, data: data.data };
};

// ---------------------------------------------------------------------------
// Admin - Review Transcript (Approve or Return)
// PATCH /api/v1/student-transcript-v2/{transcriptId}/review
// ---------------------------------------------------------------------------

export const adminReviewTranscript = async (transcriptId, body) => {
  const { data } = await http.patch(`/v1/student-transcript-v2/${transcriptId}/review`, body);
  return { success: data.success, message: data.message, data: data.data };
};

// ---------------------------------------------------------------------------
// Admin - Get Single Transcript
// GET /api/v1/student-transcript-v2/{transcriptId}
// ---------------------------------------------------------------------------

export const adminGetSingleTranscript = async (transcriptId) => {
  const { data } = await http.get(`/v1/student-transcript-v2/${transcriptId}`);
  return { success: data.success, message: data.message, data: data.data };
};

// ---------------------------------------------------------------------------
// Admin - Get All Student Transcripts
// GET /api/v1/student-transcript
// ---------------------------------------------------------------------------

export const adminGetAllStudentTranscripts = async (params = {}) => {
  const { data } = await http.get('/v1/student-transcript-v2', { params });
  const rows = data.data ?? [];
  return {
    success: data.success,
    message: data.message,
    rows,
    showingDocumentsCount: rows.length,
    totalDocumentsCount: rows.length,
  };
};
