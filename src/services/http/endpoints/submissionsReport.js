import { http } from "../http";

const BASE = "/v1/submissions-report";

export const getSubmissionsReportSummary = async (params) => {
  const { data } = await http.get(`${BASE}/summary`, { params });
  return data;
};

export const getSubmissionsReport = async (params) => {
  const { data } = await http.get(`${BASE}/report`, { params });
  return data;
};

export const getSubmissionDetail = async (submissionId) => {
  const { data } = await http.get(`${BASE}/${submissionId}`);
  return data;
};

export const gradeSubmission = async (submissionId, body) => {
  const { data } = await http.post(`${BASE}/${submissionId}/grade`, body);
  return data;
};

// ─── Mock Data (fallback when API is unavailable) ─────────────────────────────
// TODO: remove once GET/POST /v1/submissions-report/... is live

export const MOCK_SUBMISSIONS_SUMMARY = {
  totalSubmissions: 186,
  totalPending: 47,
  totalGraded: 139,
  averageGradingDurationMinutes: 12,
};

export const MOCK_SUBMISSIONS = [
  {
    submissionId: "sub-001",
    type: "assessment",
    studentId: "stu-001",
    studentName: "Amaka Obi",
    title: "Module 2 Quiz – Data Privacy Basics",
    courseId: "course-001",
    courseTitle: "Data Privacy Fundamentals",
    moduleId: "module-002",
    assessmentId: "assess-101",
    instructorId: "inst-001",
    instructorName: "Dr. Jane Smith",
    submittedAt: "2026-06-20T09:32:00Z",
    status: "graded",
    score: 42,
    maxScore: 50,
    grade: "A",
    remarks: "Strong grasp of core concepts, minor gaps on retention policy.",
    gradingDurationMinutes: 9,
    gradedAt: "2026-06-20T14:10:00Z",
  },
  {
    submissionId: "sub-002",
    type: "exam",
    studentId: "stu-002",
    studentName: "Chinedu Eze",
    title: "Final Exam – Cybersecurity Essentials",
    courseId: "course-002",
    courseTitle: "Cybersecurity Essentials",
    moduleId: "module-008",
    assessmentId: "assess-108",
    instructorId: "inst-002",
    instructorName: "Prof. Alan Brown",
    submittedAt: "2026-06-21T11:05:00Z",
    status: "pending",
    score: null,
    maxScore: 100,
    grade: null,
    remarks: null,
    gradingDurationMinutes: null,
    gradedAt: null,
  },
  {
    submissionId: "sub-003",
    type: "project",
    studentId: "stu-003",
    studentName: "Ifeoma Nwosu",
    title: "Case Study 1 – Data Privacy",
    courseId: "course-001",
    courseTitle: "Data Privacy Fundamentals",
    moduleId: "module-003",
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
    instructorId: "inst-001",
    instructorName: "Dr. Jane Smith",
    submittedAt: "2026-06-18T16:45:00Z",
    status: "graded",
    score: 78,
    maxScore: 100,
    grade: "B",
    remarks: "Good analysis; cite your sources next time.",
    gradingDurationMinutes: 18,
    gradedAt: "2026-06-19T08:20:00Z",
    submissionUrl: "https://example.com/files/case-study-1-ifeoma.pdf",
  },
  {
    submissionId: "sub-004",
    type: "project",
    studentId: "stu-004",
    studentName: "Tunde Bakare",
    title: "Group Project – Network Design",
    courseId: "course-003",
    courseTitle: "Network Administration",
    moduleId: "module-005",
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa3",
    instructorId: "inst-001",
    instructorName: "Dr. Jane Smith",
    submittedAt: "2026-06-22T13:15:00Z",
    status: "pending",
    score: null,
    maxScore: 100,
    grade: null,
    remarks: null,
    gradingDurationMinutes: null,
    gradedAt: null,
    submissionUrl: "https://example.com/files/network-design-tunde.zip",
  },
  {
    submissionId: "sub-005",
    type: "assessment",
    studentId: "stu-005",
    studentName: "Zainab Musa",
    title: "Module 1 Quiz – Ethics Overview",
    courseId: "course-002",
    courseTitle: "Cybersecurity Essentials",
    moduleId: "module-001",
    assessmentId: "assess-100",
    instructorId: "inst-003",
    instructorName: "Ms. Rita Okonkwo",
    submittedAt: "2026-06-15T10:00:00Z",
    status: "graded",
    score: 30,
    maxScore: 50,
    grade: "D",
    remarks: "Below passing threshold — recommend a retake.",
    gradingDurationMinutes: 6,
    gradedAt: "2026-06-15T15:30:00Z",
  },
  {
    submissionId: "sub-006",
    type: "exam",
    studentId: "stu-001",
    studentName: "Amaka Obi",
    title: "Final Exam – Data Privacy Fundamentals",
    courseId: "course-001",
    courseTitle: "Data Privacy Fundamentals",
    moduleId: "module-008",
    assessmentId: "assess-110",
    instructorId: "inst-001",
    instructorName: "Dr. Jane Smith",
    submittedAt: "2026-06-23T09:00:00Z",
    status: "pending",
    score: null,
    maxScore: 100,
    grade: null,
    remarks: null,
    gradingDurationMinutes: null,
    gradedAt: null,
  },
];

// Fallback question/answer content for assessment- and exam-type submissions,
// used by the grading modal when GET /v1/assessment-marking/answer-sheet/... is unavailable.
export const MOCK_ANSWER_SHEET = {
  questions: [
    {
      questionId: "q1",
      question: "What is the primary purpose of data minimization in privacy law?",
      markingType: "manual",
      marks: 10,
      options: [],
      studentAnswer:
        "Data minimization means only collecting the data you actually need for a stated purpose, which reduces risk if there's a breach.",
      scoreAssigned: null,
      remark: "",
    },
    {
      questionId: "q2",
      question: "Which of the following is a lawful basis for processing personal data under GDPR?",
      markingType: "auto",
      marks: 5,
      options: [
        { id: "a", name: "Consent", isAnswer: true },
        { id: "b", name: "Convenience", isAnswer: false },
        { id: "c", name: "Popularity", isAnswer: false },
      ],
      studentAnswer: "a",
      scoreAssigned: 5,
      isCorrect: true,
      remark: "",
    },
    {
      questionId: "q3",
      question: "Describe one real-world consequence of failing to honor a data subject access request.",
      markingType: "manual",
      marks: 10,
      options: [],
      studentAnswer:
        "The organization could face regulatory fines and reputational damage if a user complains to a data protection authority.",
      scoreAssigned: null,
      remark: "",
    },
  ],
};
