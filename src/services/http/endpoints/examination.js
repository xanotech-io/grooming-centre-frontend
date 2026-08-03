import { getEndTime, parseOptionIndex } from '../../../utils';
import { http } from '../http';

/**
 * Endpoint to get `examination-details`
 * @param {string} id - courseId
 *
 * @returns {Promise<{ examination: Examination }>}
 */
export const requestExaminationDetails = async (id, forAdmin) => {
  const path = `/v1/examination${forAdmin ? '/admin' : ''}/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  const raw = Array.isArray(data) ? data[0] : data;
  if (!raw) throw new Error("No examination found");

  const questionArray = raw.examinationQuestions ?? raw.questions ?? [];

  // shuffle questions
  for (let i = questionArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * i);
    const temp = questionArray[i];
    questionArray[i] = questionArray[j];
    questionArray[j] = temp;
  }

  const examination = {
    id: raw.id,
    courseId: raw.courseId,
    topic: raw.title,
    duration: raw.duration,
    questionCount: raw.amountOfQuestions,
    startTime: raw.startTime,
    endTime: getEndTime(raw.startTime, raw.duration),
    hasCompleted: raw.examinationScoreSheets?.[0] ? true : false,
    minimumPercentageScoreToEarnABadge:
      raw.minimumPercentageScoreToEarnABadge || 30,
    // "sectioned" | "unsectioned" | "hybrid" | null (legacy/unset) — lets
    // QuestionsPage.jsx keep enforcing Section/Quantity-per-type rules once
    // the exam is real, not just while still pending.
    examType: raw.examType ?? null,
    questionQuantity: raw.questionQuantity ?? null,
    templateId: raw.templateId ?? raw.markingTemplateId ?? null,
    questions: questionArray.map((q, index) => {
      const opts = q.options ?? [];
      const inferredType = (() => {
        if (q.questionType) return q.questionType;
        if (opts.length === 0) return "ShortAnswer";
        const names = opts.map((o) => (o?.name || "").toLowerCase());
        if (opts.length === 2 && names.includes("true") && names.includes("false")) return "TrueFalse";
        return "MCQ";
      })();
      return {
        id: q.id,
        question: q.question,
        file: q.file,
        questionIndex: +q.questionIndex || index,
        questionType: inferredType,
        markingType: q.markingType ?? "automatic",
        pairs: q.pairs ?? null,
        modelAnswer: q.modelAnswer ?? null,
        correctAnswer: q.correctAnswer ?? null,
        rubric: q.rubric ?? q.rubricDescription ?? null,
        marks: q.marks ?? null,
        section: q.section ?? null,
        bloomLevel: q.bloomLevel ?? null,
        difficultyLevel: q.difficultyLevel ?? null,
        options: opts.map((opt) => ({
          id: opt.id,
          isAnswer: opt.isAnswer,
          name: opt.name,
          optionIndex: parseOptionIndex(opt.optionIndex),
        })),
      };
    }),
  };

  return { examination };
};

export const adminGetExaminationById = async (examinationId) => {
  const {
    data: { data },
  } = await http.get(`/v1/examination/admin/${examinationId}`);

  return { examination: data };
};

export const adminDeleteExaminationQuestionFile = async (questionId) => {
  const path = `/v1/examination/question/delete-image/${questionId}`;

  await http.delete(path);
};

export const adminDeleteExamination = async (courseId) => {
  const path = `/v1/examination/delete/${courseId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};
export const adminDeleteExaminationQuestion = async (questionId) => {
  const path = `/v1/examination/question/delete/${questionId}`;

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
  const path = `/v1/examination/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  const examination = {
    id: data.id,
    templateId: data.templateId ?? data.markingTemplateId ?? null,
    sections: Array.isArray(data.sections) ? data.sections : [],
  };

  return { message, examination };
};

export const adminCreateStandaloneExamination = async (body) => {
  const path = `/v1/stand-alone-examination/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  const examination = {
    id: data.id,
    templateId: data.templateId ?? data.markingTemplateId ?? null,
    sections: Array.isArray(data.sections) ? data.sections : [],
  };

  return { message, examination };
};

export const adminEditStandaloneExamination = async (id, body) => {
  const path = `/v1/stand-alone-examination/edit/${id}`;

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
  const path = `/v1/examination/${courseId}`;

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
  const path = `/v1/examination/scoresheet/create`;

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
  const path = '/v1/examination/question/create';

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
  const path = `/v1/examination/edit/${examinationId}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const examination = {
    id: data[0].id,
  };

  return { message, examination };
};

/**
 * List all examinations in a module
 * @param {string} moduleId
 * @returns {Promise<{ examinations: Array }>}
 */
export const adminListModuleExaminations = async (moduleId) => {
  const path = `/v1/examination/module/${moduleId}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    examinations: data.map((examination) => ({
      id: examination.id,
      title: examination.title,
      courseId: examination.courseId,
      moduleId: examination.moduleId,
      duration: examination.duration,
      amountOfQuestions: examination.amountOfQuestions,
      approvalStatus: examination.approvalStatus,
      startTime: examination.startTime,
      markingMode: examination.markingMode,
      totalMarks: examination.totalMarks,
      passThreshold: examination.passThreshold,
      navigationMode: examination.navigationMode,
      randomizationMethod: examination.randomizationMethod,
      sections: examination.sections,
      randomizationConfig: examination.randomizationConfig,
      uiSettings: examination.uiSettings,
      toolsEnabled: examination.toolsEnabled,
      submissionSettings: examination.submissionSettings,
      paperStatus: examination.paperStatus,
      createdAt: examination.createdAt,
      updatedAt: examination.updatedAt,
    })),
  };
};

/**
 * Fetch a module examination for a user to take
 * Hits /v1/examination/module/{moduleId} and maps to the same shape as requestExaminationDetails
 * @param {string} moduleId
 * @returns {Promise<{ examination: Examination }>}
 */
export const requestModuleExaminationDetails = async (moduleId) => {
  const path = `/v1/examination/module/${moduleId}`;

  const {
    data: { data },
  } = await http.get(path);

  const raw = Array.isArray(data) ? data[0] : data;
  if (!raw) throw new Error("No examination found for this module");

  const questionArray = raw.examinationQuestions ?? [];

  for (let i = questionArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * i);
    const temp = questionArray[i];
    questionArray[i] = questionArray[j];
    questionArray[j] = temp;
  }

  const examination = {
    id: raw.id,
    courseId: raw.courseId,
    moduleId: raw.moduleId,
    topic: raw.title,
    duration: raw.duration,
    questionCount: raw.amountOfQuestions,
    startTime: raw.startTime,
    endTime: getEndTime(raw.startTime, raw.duration),
    hasCompleted: raw.examinationScoreSheets?.[0] ? true : false,
    minimumPercentageScoreToEarnABadge:
      raw.minimumPercentageScoreToEarnABadge || 30,
    questions: questionArray.map((q, index) => {
      const opts = q.options ?? [];
      const inferredType = (() => {
        if (q.questionType) return q.questionType;
        if (opts.length === 0) return "ShortAnswer";
        const names = opts.map((o) => (o?.name || "").toLowerCase());
        if (opts.length === 2 && names.includes("true") && names.includes("false")) return "TrueFalse";
        return "MCQ";
      })();
      return {
        id: q.id,
        question: q.question,
        file: q.file,
        questionIndex: +q.questionIndex || index,
        questionType: inferredType,
        markingType: q.markingType ?? "automatic",
        pairs: q.pairs ?? null,
        modelAnswer: q.modelAnswer ?? null,
        correctAnswer: q.correctAnswer ?? null,
        rubric: q.rubric ?? q.rubricDescription ?? null,
        marks: q.marks ?? null,
        section: q.section ?? null,
        bloomLevel: q.bloomLevel ?? null,
        difficultyLevel: q.difficultyLevel ?? null,
        options: opts.map((opt) => ({
          id: opt.id,
          isAnswer: opt.isAnswer,
          name: opt.name,
          optionIndex: parseOptionIndex(opt.optionIndex),
        })),
      };
    }),
  };

  return { examination };
};

/**
 * Endpoint for examination modification/update
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminEditExaminationQuestion = async (body) => {
  const path = `/v1/examination/question/edit`;

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};
