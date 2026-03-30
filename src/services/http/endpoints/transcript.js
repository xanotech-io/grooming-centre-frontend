// import { http } from "../http";

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_TRANSCRIPT_BY_STUDENT = {
  "STU-001": {
    transcriptId: "trn-12345-abcde",
    studentId: "STU-001",
    studentName: "Nmorsi Donald",
    academicYear: "2024-2025",
    overallGPA: 4.0,
    totalCreditsEarned: 6,
    verificationCode: "TX-ABC12345",
    status: "ISSUED",
    rows: [
      {
        transcriptId: "TRX-001",
        courseCode: "AGR101",
        courseTitle: "Agriculture Fundamentals",
        academicYear: "2024-2025",
        score: 85,
        grade: "A",
        gradePoints: 4.0,
        credits: 3,
      },
      {
        transcriptId: "TRX-002",
        courseCode: "AGR102",
        courseTitle: "Crop Science",
        academicYear: "2024-2025",
        score: 90,
        grade: "A",
        gradePoints: 4.0,
        credits: 3,
      },
    ],
  },
  mock_student_1: {
    transcriptId: "trn-99999-mock1",
    studentId: "mock_student_1",
    studentName: "John Doe",
    academicYear: "2024-2025",
    overallGPA: 3.5,
    totalCreditsEarned: 12,
    verificationCode: "TXV-2025-001",
    status: "ISSUED",
    rows: [
      {
        transcriptId: "TR-001",
        courseCode: "MF101",
        courseTitle: "Microfinance Basics",
        academicYear: "2024-2025",
        score: 78,
        grade: "B+",
        gradePoints: 3.3,
        credits: 3,
      },
      {
        transcriptId: "TR-002",
        courseCode: "AC201",
        courseTitle: "Advanced Accounting",
        academicYear: "2024-2025",
        score: 92,
        grade: "A",
        gradePoints: 4.0,
        credits: 3,
      },
      {
        transcriptId: "TR-003",
        courseCode: "BE301",
        courseTitle: "Business Ethics",
        academicYear: "2024-2025",
        score: 65,
        grade: "C+",
        gradePoints: 2.3,
        credits: 2,
      },
      {
        transcriptId: "TR-004",
        courseCode: "RM401",
        courseTitle: "Risk Management Fundamentals",
        academicYear: "2024-2025",
        score: 85,
        grade: "A-",
        gradePoints: 3.7,
        credits: 4,
      },
    ],
  },
};

const defaultStudentTranscript = (studentId) => ({
  transcriptId: `trn-${studentId}-new`,
  studentId,
  studentName: "Unknown Student",
  academicYear: "2024-2025",
  overallGPA: 0,
  totalCreditsEarned: 0,
  verificationCode: "TX-NEW00001",
  status: "PENDING",
  rows: [],
});

// ---------------------------------------------------------------------------
// TC08 - Generate Individual Student Transcripts
// GET /api/v2/students/{studentId}/transcript
// ---------------------------------------------------------------------------

/**
 * Get paginated transcript records for a student
 * @param {string} studentId
 * @param {{ academicYear?: string, status?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const adminGetStudentTranscript = async (studentId, params = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.get(`/v2/students/${studentId}/transcript`, { params });
  // return { message, data };

  const transcript =
    MOCK_TRANSCRIPT_BY_STUDENT[studentId] ||
    defaultStudentTranscript(studentId);

  let courses = transcript.rows;
  if (params.academicYear) {
    courses = courses.filter((c) => c.academicYear === params.academicYear);
  }
  if (params.status) {
    // status filter applies to the transcript record itself, not individual courses
    if (transcript.status.toUpperCase() !== params.status.toUpperCase()) {
      courses = [];
    }
  }

  return {
    success: true,
    message: "Transcripts retrieved successfully",
    data: {
      data: [
        {
          transcriptId: transcript.transcriptId,
          studentId: transcript.studentId,
          studentName: transcript.studentName,
          academicYear: params.academicYear || transcript.academicYear,
          courses,
          overallGPA: transcript.overallGPA,
          totalCreditsEarned: transcript.totalCreditsEarned,
          verificationCode: transcript.verificationCode,
          status: transcript.status,
        },
      ],
      pagination: {
        currentPage: Number(params.page) || 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: Number(params.limit) || 10,
      },
    },
  };
};

// ---------------------------------------------------------------------------
// TC09 - Request Official Transcript
// POST /api/v2/students/{studentId}/transcript/request
// ---------------------------------------------------------------------------

/**
 * Submit an official transcript request for a student
 * @param {string} studentId
 * @param {{ academicYear: string, purpose?: string, deliveryMethod?: 'DIGITAL'|'PHYSICAL', recipientEmail?: string }} body
 * @returns {Promise<{ message: string, data: object }>}
 */
export const adminRequestOfficialTranscript = async (studentId, body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/students/${studentId}/transcript/request`, body);
  // return { message, data };

  const transcript =
    MOCK_TRANSCRIPT_BY_STUDENT[studentId] ||
    defaultStudentTranscript(studentId);
  const relevantCourses = transcript.rows.filter(
    (c) => !body.academicYear || c.academicYear === body.academicYear,
  );

  return {
    message: "Transcript request submitted successfully",
    data: {
      transcriptId: `trn-${Date.now()}-req`,
      studentId,
      studentName: transcript.studentName,
      academicYear: body.academicYear || transcript.academicYear,
      courses: relevantCourses.slice(0, 1),
      overallGPA: transcript.overallGPA,
      totalCreditsEarned: relevantCourses
        .slice(0, 1)
        .reduce((sum, c) => sum + (c.credits || 0), 0),
      verificationCode: `TX-REQ-${Date.now()}`,
      status: "PENDING",
    },
  };
};

// ---------------------------------------------------------------------------
// Verify Transcript
// POST /api/v2/transcripts/verify
// ---------------------------------------------------------------------------

/**
 * Verify a transcript by its verification code
 * @param {{ verificationCode: string }} payload
 * @returns {Promise<{ message: string, data: { isValid: boolean, transcript: object|null } }>}
 */
export const adminVerifyTranscript = async (payload) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/transcripts/verify`, payload);
  // return { message, data };

  const verificationCode = payload?.verificationCode;
  const matched = Object.values(MOCK_TRANSCRIPT_BY_STUDENT).find(
    (item) => item.verificationCode === verificationCode,
  );
  const isValid = !!matched;

  return {
    message: isValid
      ? "Transcript verified successfully"
      : "Transcript verification failed",
    data: {
      isValid,
      transcript: isValid
        ? {
            transcriptId: matched.transcriptId,
            studentId: matched.studentId,
            studentName: matched.studentName,
            academicYear: matched.academicYear,
            overallGPA: matched.overallGPA,
            totalCreditsEarned: matched.totalCreditsEarned,
            status: matched.status,
          }
        : null,
    },
  };
};

// ---------------------------------------------------------------------------
// Post Completion to Transcript (internal admin action)
// POST /v2/students/{studentId}/transcript
// ---------------------------------------------------------------------------

/**
 * Post a course completion record to a student's transcript
 * @param {string} studentId
 * @param {{ courseId: string, examType: string, examId: string, score: number, completionStatus: string, instructorId: string, remarks?: string }} body
 * @returns {Promise<{ message: string, data: object }>}
 */
export const adminPostCompletionToTranscript = async (studentId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/students/${studentId}/transcript`, body);
  // return { message, data };

  return {
    message: "Course completion posted to transcript successfully",
    data: {
      transcriptId: `TRX-${Date.now()}`,
      studentId,
      courseId: body.courseId,
      examType: body.examType || "COURSE_EXAMINATION",
      examId: body.examId,
      score: Number(body.score) || 0,
      completionStatus: body.completionStatus || "Completed",
      postedBy: body.instructorId || "INST-001",
      datePosted: new Date().toISOString(),
      remarks: body.remarks || "Posted via admin transcript module",
    },
  };
};
