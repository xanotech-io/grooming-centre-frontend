import { getEndTime } from '../../../utils';
import { http } from '../http';

/**
 * Endpoint to get `examination-details`
 * @param {string} id - courseId
 *
 * @returns {Promise<{ examination: Examination }>}
 */
export const requestExaminationDetails = async (id, forAdmin) => {
  const path = `/examination${forAdmin ? '/admin' : ''}/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  const questionArray = data.examinationQuestions;

  // shuffle questions
  for (let i = questionArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * i);
    const temp = questionArray[i];
    questionArray[i] = questionArray[j];
    questionArray[j] = temp;
  }

  const examination = {
    id: data.id,
    courseId: data.courseId,
    topic: data.title,
    duration: data.duration,
    questionCount: data.amountOfQuestions,
    startTime: data.startTime,
    endTime: getEndTime(data.startTime, data.duration),
    hasCompleted: data.examinationScoreSheets?.[0] ? true : false,
    minimumPercentageScoreToEarnABadge:
      data.minimumPercentageScoreToEarnABadge || 30, // TODO: remove hard coded data
    questions: questionArray.map((q, index) => ({
      id: q.id,
      question: q.question,
      file: q.file,
      questionIndex: +q.questionIndex || index,
      options: q.options.map((opt) => ({
        id: opt.id,
        isAnswer: opt.isAnswer,
        name: opt.name,
        optionIndex: +opt.optionIndex,
      })),
    })),
  };

  return { examination };
};

export const adminDeleteExaminationQuestionFile = async (questionId) => {
  const path = `/examination/question/delete-image/${questionId}`;

  await http.delete(path);
};

export const adminDeleteExamination = async (courseId) => {
  const path = `/examination/delete/${courseId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};
export const adminDeleteExaminationQuestion = async (questionId) => {
  const path = `/examination/question/delete/${questionId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};

/**
 * Endpoint for examination creation
 * @param {{ title: string, courseId: string, duration: number, amountOfQuestions: string, startTime: string }} body
 * @returns {Promise<{ message: string, examination: { id: string } }>}
 */
export const adminCreateExamination = async (body) => {
  const path = `/examination/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  const examination = {
    id: data.id,
  };

  return { message, examination };
};

export const adminCreateStandaloneExamination = async (body) => {
  const path = `/stand-alone-examination/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  const examination = {
    id: data.id,
  };

  return { message, examination };
};

export const adminEditStandaloneExamination = async (id, body) => {
  const path = `/stand-alone-examination/edit/${id}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const examination = {
    id: data.id,
    isPublished: data.isPublished,
  };

  return { message, examination };
};

/**
 * Endpoint for examination listing
 * @param {string} courseId
 *
 * @returns {Promise<{ examinations: Array<{ id: string, examinationId: string, title: string,  startTime: Date, duration: number }> }>}
 */
export const adminGetExaminationListing = async (courseId) => {
  const path = `/examination/${courseId}`;

  const {
    data: { data },
  } = await http.get(path);

  const examinations = [];
  const exam = {
    id: data.id,
    title: data.title,
    examinationId: data.examinationId,
    duration: data.duration,
    startTime: data.startTime,
  };

  if (!Array.isArray(data)) examinations.push(exam);

  return { examinations };
};

/**
 * Endpoint to submit an `examination`
 * @param {object} body - answers
 *
 * @returns {Promise<{ message: string }>}
 */
export const submitExamination = async (body) => {
  const path = `/examination/scoresheet/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  return { message, data };
};

/**
 * Endpoint for examination question creation
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminCreateExaminationQuestion = async (body) => {
  const path = '/examination/question/create';

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};

/**
 * Endpoint to for admin to edit a examination
 * @param {{ title: ?string, duration: number, amountOfQuestions: number, startTime: ?Date, courseId: string }} body
 *
 * @returns {Promise<{ message: string, examination: { id: string } }>}
 */
export const adminEditExamination = async (examinationId, body) => {
  const path = `/examination/edit/${examinationId}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const examination = {
    id: data[0].id,
  };

  return { message, examination };
};

/**
 * Endpoint for examination modification/update
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminEditExaminationQuestion = async (body) => {
  const path = `/examination/question/edit`;

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};
