// import { http } from "../http";

const MOCK_TRANSCRIPT_BY_STUDENT = {
  "STU-001": {
    studentId: "STU-001",
    studentName: "Nmorsi Donald",
    overallGPA: 3.7,
    totalCreditsEarned: 12,
    verificationCode: "TX-ABC12345",
    status: "ISSUED",
    rows: [
      {
        transcriptId: "TRX-001",
        courseCode: "AGR101",
        courseTitle: "Agriculture Fundamentals",
        score: 85,
        grade: "A",
        gradePoints: 4.0,
        credits: 3,
        examType: "STANDALONE_EXAMINATION",
        examId: "STND-101",
      },
      {
        transcriptId: "TRX-002",
        courseCode: "AGR102",
        courseTitle: "Soil Science Basics",
        score: 78,
        grade: "B+",
        gradePoints: 3.3,
        credits: 3,
        examType: "COURSE_EXAMINATION",
        examId: "EXM-AGR102-001",
      },
    ],
  },
  mock_student_1: {
    studentId: "mock_student_1",
    studentName: "John Doe",
    overallGPA: 3.5,
    totalCreditsEarned: 48,
    verificationCode: "TXV-2025-001",
    status: "Active",
    rows: [
      {
        transcriptId: "TR-001",
        courseCode: "MF101",
        courseTitle: "Microfinance Basics",
        score: 78,
        grade: "B+",
        gradePoints: 3.3,
        credits: 3,
        examType: "COURSE_EXAMINATION",
        examId: "EXM-MF101-001",
      },
      {
        transcriptId: "TR-002",
        courseCode: "AC201",
        courseTitle: "Advanced Accounting",
        score: 92,
        grade: "A",
        gradePoints: 4.0,
        credits: 3,
        examType: "COURSE_EXAMINATION",
        examId: "EXM-AC201-001",
      },
      {
        transcriptId: "TR-003",
        courseCode: "BE301",
        courseTitle: "Business Ethics",
        score: 65,
        grade: "C+",
        gradePoints: 2.3,
        credits: 2,
        examType: "STANDALONE_EXAMINATION",
        examId: "STND-301",
      },
      {
        transcriptId: "TR-004",
        courseCode: "RM401",
        courseTitle: "Risk Management Fundamentals",
        score: 85,
        grade: "A-",
        gradePoints: 3.7,
        credits: 4,
        examType: "COURSE_EXAMINATION",
        examId: "EXM-RM401-001",
      },
    ],
  },
};

const buildQuestionList = (examType, questionList = []) => {
  if (examType === "STANDALONE_EXAMINATION") {
    return questionList.map((item) => ({
      questionId: item.questionId,
      questionText: item.questionText,
      answerHidden: true,
    }));
  }

  return questionList.map((item) => ({
    questionId: item.questionId,
    questionText: item.questionText,
    displayAnswer: true,
    studentAnswer: item.studentAnswer,
    displayedAsCorrect: true,
  }));
};

const defaultStudentTranscript = (studentId) => ({
  studentId,
  studentName: "Unknown Student",
  overallGPA: 0,
  totalCreditsEarned: 0,
  verificationCode: "TX-NEW00001",
  status: "ISSUED",
  rows: [],
});

export const adminPostCompletionToTranscript = async (studentId, body) => {
  // const { data: { message, data } } = await http.post(`/v2/students/${studentId}/transcript`, body);
  // return { message, data };
  const examType = body.examType || "COURSE_EXAMINATION";
  const score = Number(body.score) || 0;

  return {
    message: "Course completion posted to transcript successfully",
    data: {
      transcriptId: `TRX-${Date.now()}`,
      studentId,
      courseId: body.courseId,
      examType,
      examId: body.examId,
      questionList: buildQuestionList(examType, body.questionList || []),
      score,
      completionStatus: body.completionStatus || "Completed",
      postedBy: body.instructorId || "INST-001",
      datePosted: new Date().toISOString(),
      remarks: body.remarks || "Posted via admin transcript module",
    },
  };
};

export const adminGetStudentTranscript = async (studentId, params = {}) => {
  // const { data } = await http.get(`/v2/students/${studentId}/transcript`, { params });
  // return data;
  const transcript =
    MOCK_TRANSCRIPT_BY_STUDENT[studentId] || defaultStudentTranscript(studentId);

  return {
    success: true,
    message: "Transcripts retrieved successfully",
    data: {
      studentId: transcript.studentId,
      studentName: transcript.studentName,
      overallGPA: transcript.overallGPA,
      totalCreditsEarned: transcript.totalCreditsEarned,
      verificationCode: transcript.verificationCode,
      status: transcript.status,
      courses: transcript.rows,
      rows: transcript.rows,
      showingDocumentsCount: transcript.rows.length,
      totalDocumentsCount: transcript.rows.length,
      currentPage: Number(params.page) || 1,
      totalPages: 1,
    },
  };
};

export const adminRequestOfficialTranscript = async (studentId) => {
  // const { data: { message, data } } = await http.post(`/v2/students/${studentId}/transcript/request`);
  // return { message, data };
  return {
    message: "Official transcript request submitted successfully",
    data: {
      studentId,
      requestId: `TRQ-${Date.now()}`,
      status: "PENDING",
      requestedAt: new Date().toISOString(),
    },
  };
};

export const adminVerifyTranscript = async (payload) => {
  // const { data: { message, data } } = await http.post(`/v2/transcripts/verify`, payload);
  // return { message, data };
  const verificationCode = payload?.verificationCode;
  const validCodes = Object.values(MOCK_TRANSCRIPT_BY_STUDENT).map(
    (item) => item.verificationCode,
  );
  const isValid = validCodes.includes(verificationCode);

  return {
    message: isValid
      ? "Transcript authenticity verified"
      : "Transcript verification failed",
    data: {
      verificationCode,
      valid: isValid,
      verifiedAt: new Date().toISOString(),
    },
  };
};
