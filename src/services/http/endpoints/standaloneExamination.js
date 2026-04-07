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

  const examinations = data?.rows?.map((exam) => ({
    id: exam.id,
    title: exam.title,
    duration: exam.duration,
    startTime: exam.startTime,
    noOfUsers: exam.standAloneExaminationGrade?.length ?? 0,
    isPublished: exam.isPublished,
  }));

  return {
    examinations,
    showingDocumentsCount: data?.rows?.length,
    totalDocumentsCount: data?.count,
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
  const questionArray = data.standAloneExaminationQuestion;

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
    // minimumPercentageScoreToEarnABadge:
    //   data.minimumPercentageScoreToEarnABadge || 30, // TODO: remove hard coded data
    questions: questionArray.map((q, index) => ({
      id: q.id,
      question: q.question,
      file: q.file,
      questionIndex: +q.questionIndex || index,
      options: q.standAloneExaminationOption.map((opt, optIndex) => ({
        id: opt.id,
        isAnswer: opt.isAnswer,
        name: opt.answer,
        optionIndex: +opt.optionIndex || optIndex,
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
export const adminCreateStandaloneExaminationQuestion = async (body) => {
  const path = "/v1/stand-alone-examination-question/create";
  console.log(body);

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

