import { getEndTime } from "../../../utils";
import { http } from "../http";

/**
 * Endpoint for examination listing
 * @param {string} courseId
 *
 * @returns {Promise<{ examinations: Array<{ id: string, examinationId: string, title: string,  startTime: Date, duration: number }> }>}
 */
export const adminGetStandaloneExaminationListing = async (params) => {
  const path = `/v1/stand-alone-examination/admin/all`;

  const {
    data: { data },
  } = await http.get(path, { params });

  // Response shape: { data: { count, rows: [...] } }
  const rows = data?.data?.rows ?? data?.rows ?? [];
  const count = data?.data?.count ?? data?.count ?? 0;

  const examinations = rows.map((exam) => ({
    id: exam.id,
    title: exam.title,
    duration: exam.duration,
    amountOfQuestions: exam.amountOfQuestions,
    startTime: exam.startTime,
    markingMode: exam.markingMode,
    active: exam.active,
    noOfUsers: exam.standAloneExaminationGrade?.length ?? 0,
    isPublished: exam.isPublished,
    createdAt: exam.createdAt,
  }));

  return {
    examinations,
    showingDocumentsCount: rows.length,
    totalDocumentsCount: count,
  };
};

export const userCreateStandaloneExaminationGrade = async (body) => {
  const path = `/v1/stand-alone-examination-grade/create`;

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};

export const adminGetAllStandaloneExaminationDetails = async (id) => {
  const path = `/v1/stand-alone-examination-grade/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    data,
  };
};

export const usersGetStandaloneExaminationListing = async () => {
  const path = `/v1/stand-alone-examination/all?pagination=false`;

  const {
    data: { data },
  } = await http.get(path);

  const examinations = data.Data.map((exam) => ({
    id: exam.id,
    title: exam.title,
    duration: exam.duration,
    startTime: exam.startTime,
    endTime: getEndTime(exam.startTime, exam.duration),
    noOfUsers: exam.standAloneExaminationGrade.length,
    isPublished: exam.isPublished,
    question: exam.standAloneExaminationQuestion,
    standAloneExaminationGrade: exam.standAloneExaminationGrade,
  }));

  console.log(examinations);
  return {
    examinations,
  };
};

export const getStandaloneExaminationDetails = async (id, forAdmin) => {
  const path = `/v1/stand-alone-examination${forAdmin ? "/admin" : ""}/${id}`;

  let {
    data: { data },
  } = await http.get(path);
  console.log(data, "data");
  const questionArray = Array.isArray(data.standAloneExaminationQuestion)
    ? data.standAloneExaminationQuestion
    : [];

  // shuffle questions
  for (let i = questionArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * i);
    const temp = questionArray[i];
    questionArray[i] = questionArray[j];
    questionArray[j] = temp;
  }

  const examination = {
    id: data.id,
    topic: data.title,
    duration: data.duration,
    questionCount: data.amountOfQuestions,
    startTime: data.startTime,
    endTime: getEndTime(data.startTime, data.duration),
    isPublished: data.isPublished,
    templateId: data.templateId ?? data.markingTemplateId ?? null,
    // "sectioned" | "unsectioned" | "hybrid" | null (legacy/unset) — lets
    // QuestionsStandalone.jsx keep showing the Section tabs after the exam
    // becomes real (this preview endpoint feeds both the admin's "add more
    // questions" page and the student-facing take-exam view, so it's read
    // there, not mutated).
    examType: data.examType ?? null,
    // Per-type Quantity the exam was configured for (without-sections/hybrid
    // exam types) — lets QuestionsStandalone.jsx keep enforcing the same
    // per-type cap once the exam is real, not just while still pending.
    questionQuantity: data.questionQuantity ?? null,
    // minimumPercentageScoreToEarnABadge:
    //   data.minimumPercentageScoreToEarnABadge || 30, // TODO: remove hard coded data
    questions: questionArray.map((q, index) => ({
      id: q.id,
      question: q.question,
      file: q.file,
      questionIndex: +q.questionIndex || index,
      questionType: q.questionType ?? q.question_type ?? "MCQ",
      difficultyLevel: q.difficultyLevel ?? q.difficulty_level ?? "",
      markingType: q.markingType ?? "automatic",
      pairs: q.pairs ?? null,
      modelAnswer: q.modelAnswer ?? null,
      correctAnswer: q.correctAnswer ?? null,
      rubric: q.rubric ?? q.rubricDescription ?? null,
      marks: q.marks ?? null,
      section: q.section ?? null,
      bloomLevel: q.bloomLevel ?? null,
      tags: Array.isArray(q.tags)
        ? q.tags
        : q.tags
          ? String(q.tags).split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      options: q.standAloneExaminationOption.map((opt, optIndex) => ({
        id: opt.id,
        isAnswer: opt.isAnswer,
        name: opt.answer,
        // Backend sends 0-based optionIndex; the form (option-1..option-4,
        // radio values "1".."4") is 1-based everywhere else in this codebase.
        optionIndex:
          (opt.optionIndex === null || opt.optionIndex === undefined
            ? optIndex
            : +opt.optionIndex) + 1,
      })),
    })),
  };

  return { examination };
};

export const deleteStandaloneExamination = async (id) => {
  console.log(id);
  const path = `/v1/stand-alone-examination/delete/${id}`;

  const {
    data: { message },
  } = await http.delete(path);

  console.log(message);
  return {
    message,
  };
};

/**
 * Endpoint for an examination participates
 * @param {string} id
 * @param {object} params
 *
 */
export const adminGetStandaloneExaminationParticipants = async (id, params) => {
  const path = `/v1/stand-alone-examination/participants/${id}`;

  const {
    data: { data },
  } = await http.get(path, { params });

  return {
    users: data.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      departmentId: user.department?.id,
      departmentName: user.department?.name,
      grade: user.grade,
    })),
    // showingDocumentsCount: data.rows.length, // TODO: no pagination for now
    // totalDocumentsCount: data.count, // TODO: no pagination for now
    showingDocumentsCount: data.length,
    totalDocumentsCount: data.length,
  };
};

export const getStandaloneExaminationParticipants = async (id, params = {}) => {
  const path = `/v1/stand-alone-examination/participants/${id}`;

  const {
    data: { data },
  } = await http.get(path, { params });

  return {
    users: data.users,
    departments: data.departments,
    pagination: data.pagination, // Include pagination info
  };
};

export const deleteStandaloneExaminationParticipants = async (id) => {
  console.log(id);
  const path = `/v1/stand-alone-examination/participants/${id}`;

  const {
    data: { message },
  } = await http.delete(path);

  console.log(message);
  return {
    message,
  };
};

export const adminCreateStandaloneExaminationParticipants = async (body) => {
  const path = `/v1/stand-alone-examination/participants`;

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};

// /**
//  * Endpoint to submit an `examination`
//  * @param {object} body - answers
//  *
//  * @returns {Promise<{ message: string }>}
//  */
// export const submitExamination = async (body) => {
//   const path = `/examination/scoresheet/create`;

//   const {
//     data: { message },
//   } = await http.post(path, body);

//   return { message };
// };

/**
 * Endpoint for examination question creation
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminGetStandaloneExamTemplateId = async (id) => {
  const {
    data: { data },
  } = await http.get(`/v1/stand-alone-examination/admin/${id}`);
  return data?.templateId ?? data?.markingTemplateId ?? null;
};

export const adminCreateStandaloneExaminationQuestion = async (body) => {
  const path = "/v1/stand-alone-examination-question/create";

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};

export const adminDeleteStandaloneExaminationQuestionFile = async (
  questionId
) => {
  const path = `/v1/stand-alone-examination-question/delete/image/${questionId}`;

  await http.delete(path);
};

export const adminDeleteStandaloneExaminationQuestion = async (questionId) => {
  const path = `/v1/stand-alone-examination-question/delete/${questionId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};

/**
 * Endpoint for standalone examination question modification/update
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminEditStandaloneExaminationQuestion = async (body) => {
  const path = `/v1/stand-alone-examination-question/edit`;

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};

const FALLBACK_ACCESS_RECORDS = [
  {
    accessId: "EXL-001",
    studentId: "STU-001",
    examId: "EXM-AGR101",
    accessLink: "https://exam.link/abc123",
    sentBy: "System",
    status: "Accessed",
    sentDate: "2025-11-01T08:00:00Z",
  },
  {
    accessId: "EXL-002",
    studentId: "STU-002",
    examId: "EXM-ENG201",
    accessLink: "https://exam.link/xyz456",
    sentBy: "System",
    status: "Sent",
    sentDate: "2025-11-02T09:30:00Z",
  },
  {
    accessId: "EXL-003",
    studentId: "STU-003",
    examId: "EXM-ENG201",
    accessLink: "https://exam.link/def789",
    sentBy: "Admin",
    status: "Sent",
    sentDate: "2025-11-02T10:00:00Z",
  },
];

const normaliseRecord = (r) => ({
  accessId: r.access_id ?? r.accessId,
  studentId: r.student_id ?? r.studentId,
  examId: r.exam_id ?? r.examId,
  accessLink: r.access_link ?? r.accessLink,
  sentBy: r.sent_by ?? r.sentBy ?? "System",
  status: r.status,
  sentDate: r.sent_date ?? r.sentDate,
});

export const getStandaloneExamAccessRecords = async (examId) => {
  const path = `/v1/stand-alone-examination/access-records/${examId}`;

  try {
    const {
      data: { data },
    } = await http.get(path);

    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.exam_access_records)
      ? data.exam_access_records
      : [];

    return { records: rows.map(normaliseRecord), isMock: false };
  } catch {
    return { records: FALLBACK_ACCESS_RECORDS, isMock: true };
  }
};

