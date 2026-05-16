import { http } from "../http";

export const submitSAExamAnswers = async (examId, body) => {
  const {
    data: { data },
  } = await http.post(`/v1/sa-exam-marking/submit/${examId}`, body);
  return { submission: data };
};

export const saExamManualGrade = async (body) => {
  const {
    data: { message },
  } = await http.post("/v1/sa-exam-marking/manual-grade", body);
  return { message };
};

export const getSAExamResult = async (examId) => {
  const {
    data: { data },
  } = await http.get(`/v1/sa-exam-marking/result/${examId}`);
  return { result: data };
};

export const getAdminSAExamStudentResult = async (examId, studentId) => {
  const {
    data: { data },
  } = await http.get(`/v1/sa-exam-marking/result/${examId}/student/${studentId}`);
  return { result: data };
};

export const getSAExamAllResults = async (examId) => {
  const {
    data: { data },
  } = await http.get(`/v1/sa-exam-marking/results/${examId}`);
  return { results: Array.isArray(data) ? data : [] };
};

export const getSAExamSubmissions = async (examId) => {
  const {
    data: { data },
  } = await http.get(`/v1/sa-exam-marking/submitted/${examId}`);
  return { submissions: Array.isArray(data) ? data : [] };
};

export const getSAExamAnswerSheet = async (examId, studentId) => {
  const {
    data: { data },
  } = await http.get(`/v1/sa-exam-marking/answer-sheet/${examId}/student/${studentId}`);
  return { sheet: data };
};

export const getSAExamPendingGrades = async (examId) => {
  const {
    data: { data },
  } = await http.get(`/v1/sa-exam-marking/pending-manual-grades/${examId}`);
  return { pending: Array.isArray(data) ? data : [] };
};

export const adminGetStandaloneExamById = async (examId) => {
  const {
    data: { data },
  } = await http.get(`/v1/stand-alone-examination/admin/${examId}`);
  return { examination: data };
};
