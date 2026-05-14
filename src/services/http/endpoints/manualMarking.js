import { http } from '../http';

export const getManualMarkingExams = async () => {
  const { data: { data } } = await http.get('/v1/manual-marking/exams');
  return { exams: data ?? [] };
};

export const getManualMarkingStudents = async (examId) => {
  const { data: { data } } = await http.get(`/v1/manual-marking/exam/${examId}/students`);
  return { students: data ?? [] };
};

export const getStudentSubmission = async (examId, studentId) => {
  const { data: { data } } = await http.get(`/v1/manual-marking/exam/${examId}/student/${studentId}`);
  return { submission: data };
};

export const submitManualMark = async (body) => {
  const { data: { message, data } } = await http.post('/v1/manual-marking/submit', body);
  return { message, result: data };
};

export const updateManualMark = async (body) => {
  const { data: { message, data } } = await http.patch('/v1/manual-marking/update', body);
  return { message, result: data };
};

export const getAssessmentSubmissions = async (assessmentId) => {
  const { data: { data } } = await http.get(`/v1/assessment-marking/submitted/${assessmentId}`);
  return { submissions: data ?? [] };
};

export const getStudentAssessmentResult = async (assessmentId, studentId) => {
  const { data: { data } } = await http.get(`/v1/assessment-marking/result/${assessmentId}/student/${studentId}`);
  return { result: data };
};

export const getStudentOwnResult = async (assessmentId) => {
  const { data: { data } } = await http.get(`/v1/assessment-marking/result/${assessmentId}`);
  return { result: data };
};

export const getAllAssessmentResults = async (assessmentId) => {
  const { data: { data } } = await http.get(`/v1/assessment-marking/results/${assessmentId}`);
  return { results: Array.isArray(data) ? data : [] };
};

export const getPendingManualGrades = async (assessmentId) => {
  const { data: { data } } = await http.get(`/v1/assessment-marking/pending-manual-grades/${assessmentId}`);
  return { pending: Array.isArray(data) ? data : [] };
};

export const getAnswerSheet = async (assessmentId, studentId) => {
  const { data: { data } } = await http.get(`/v1/assessment-marking/answer-sheet/${assessmentId}/student/${studentId}`);
  return { sheet: data };
};

export const manualGradeQuestion = async (body) => {
  const { data: { message, data } } = await http.post('/v1/assessment-marking/manual-grade', body);
  return { message, result: data };
};
