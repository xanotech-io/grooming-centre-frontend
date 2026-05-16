import { getEndTime } from "../../../utils";
import { http } from "../http";

/**
 * Endpoint to get `assessment-details`
 * @param {string} id - assessmentId
 *
 * @returns {Promise<{ assessment: Assessment }>}
 */
export const requestAssessmentDetails = async (id, forAdmin) => {
  const path = `/v1/assessment${forAdmin ? "/admin" : ""}/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  const assessment = {
    id: data?.id,
    courseId: data?.courseId,
    markingTemplateId: data?.templateId ?? data?.markingTemplateId ?? null,
    topic: data?.title,
    duration: data?.duration,
    questionCount: data?.amountOfQuestions,
    startTime: data?.startTime,
    endTime: getEndTime(data.startTime, data.duration),
    hasCompleted: data?.assessmentScoreSheets?.[0] ? true : false,
    minimumPercentageScoreToEarnABadge:
      data.minimumPercentageScoreToEarnABadge || 30, // TODO: remove hard coded data
    questions: data?.assessmentQuestions
      ? data?.assessmentQuestions?.map((q, index) => {
        const opts = q?.options ?? [];
        const inferredType = (() => {
          if (q?.questionType) return q.questionType;
          if (opts.length === 0) return "ShortAnswer";
          const names = opts.map((o) => (o?.name || "").toLowerCase());
          if (opts.length === 2 && names.includes("true") && names.includes("false")) return "TrueFalse";
          return "MCQ";
        })();
        return {
          id: q.id,
          question: q?.question,
          file: q?.file,
          questionIndex: index,
          questionType: inferredType,
          markingType: q?.markingType || "automatic",
          pairs: q?.pairs ?? null,
          modelAnswer: q?.modelAnswer ?? null,
          correctAnswer: q?.correctAnswer ?? null,
          options: opts.map((opt) => ({
            id: opt?.id,
            isAnswer: opt?.isAnswer,
            name: opt?.name,
            optionIndex: +opt?.optionIndex,
          })),
        };
      })
      : "not set",
  };

  return { assessment };
};

export const adminGetAssessmentMarkingTemplateId = async (assessmentId) => {
  const { data: { data } } = await http.get(`/v1/assessment/admin/${assessmentId}`);
  return data?.templateId ?? data?.markingTemplateId ?? null;
};

export const adminDeleteAssessmentQuestionFile = async (questionId) => {
  const path = `/v1/assessment/question/delete-image/${questionId}`;

  await http.delete(path);
};

/**
 * Endpoint to submit an `assessment`
 * @param {object} body - answers
 *
 * @returns {Promise<{ message: string }>}
 */
export const submitAssessment = async (body) => {
  const path = `/v1/assessment/scoresheet/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  return { message, data };
};

export const submitAssessmentMarking = async (assessmentId, body) => {
  const {
    data: { message, data },
  } = await http.post(`/v1/assessment-marking/submit/${assessmentId}`, body);

  return { message, data };
};

/**
 * Endpoint for assessment creation
 * @param {{ title: string, courseId: string, duration: number, amountOfQuestions: string, startTime: string }} body
 * @returns {Promise<{ message: string, assessment: { id: string } }>}
 */
export const adminCreateAssessment = async (body) => {
  const path = `/v1/assessment/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  const assessment = {
    id: data.id,
    templateId: data.templateId ?? null,
    sections: Array.isArray(data.sections) ? data.sections : [],
  };
  return { message, assessment };
};

/**
 * Endpoint for assessment question creation
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminCreateAssessmentQuestion = async (body) => {
  const path = "/v1/assessment/question/create";

  const {
    data: { message, data },
  } = await http.post(path, body);

  return { message, question: data };
};

/**
 * Endpoint for assessment modification/update
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminEditAssessmentQuestion = async (body) => {
  const path = `/v1/assessment/question/edit`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  return { message, question: data };
};

export const adminDeleteAssessment = async (assessmentId) => {
  const path = `/v1/assessment/delete/${assessmentId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};
export const adminDeleteAssessmentQuestion = async (questionId) => {
  const path = `/v1/assessment/question/delete/${questionId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};

/**
 * Endpoint for assessment listing
 * @param {string} courseId
 *
 * @returns {Promise<{ assessments: Array<{ id: string, courseId: string, title: string,  startTime: Date, duration: number }> }>}
 */
export const adminGetAssessmentListing = async (courseId) => {
  const path = `/v1/assessment/course/${courseId}`;

  const {
    data: { data },
  } = await http.get(path);

  const assessments = data.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    courseId: assessment.courseId,
    duration: assessment.duration,
    startTime: assessment.startTime,
  }));

  return { assessments };
};

/**
 * List all assessments in a module
 * @param {string} moduleId
 * @returns {Promise<{ assessments: Array }>}
 */
export const adminListModuleAssessments = async (moduleId) => {
  const path = `/v1/assessment/module/${moduleId}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    assessments: data.map((assessment) => ({
      id: assessment.id,
      title: assessment.title,
      courseId: assessment.courseId,
      moduleId: assessment.moduleId,
      duration: assessment.duration,
      amountOfQuestions: assessment.amountOfQuestions,
      active: assessment.active,
      startTime: assessment.startTime,
    })),
  };
};

/**
 * Endpoint to for admin to edit a assessment
 * @param {{ title: ?string, duration: number, amountOfQuestions: number, startTime: ?Date, courseId: string }} body
 *
 * @returns {Promise<{ message: string, assessment: { id: string } }>}
 */
export const adminEditAssessment = async (assessmentId, body) => {
  const path = `/v1/assessment/edit/${assessmentId}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const assessment = {
    id: data[0].id,
  };

  return { message, assessment };
};
