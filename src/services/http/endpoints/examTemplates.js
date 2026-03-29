// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------

const MOCK_TEMPLATES = [
  {
    templateId: "TPL-001",
    templateName: "Midterm MCQs",
    courseId: "course-001",
    courseName: "Data Analytics 101",
    questionsCount: 50,
    totalMarks: 100,
    durationMinutes: 120,
    status: "ACTIVE",
    createdBy: "Instructor-002",
    usageCount: 5,
    lastUpdated: "2025-10-28T14:00:00Z",
    sections: [
      {
        sectionId: "sec-001",
        sectionName: "Section A - Multiple Choice",
        questionType: "MCQ",
        questionCount: 30,
        marksPerQuestion: 2,
      },
      {
        sectionId: "sec-002",
        sectionName: "Section B - True/False",
        questionType: "TRUE_FALSE",
        questionCount: 10,
        marksPerQuestion: 1,
      },
      {
        sectionId: "sec-003",
        sectionName: "Section C - Essay",
        questionType: "ESSAY",
        questionCount: 10,
        marksPerQuestion: 5,
      },
    ],
    randomizationConfig: {
      shuffleQuestions: true,
      shuffleOptions: true,
      randomizeSectionOrder: false,
    },
    displayConfig: {
      questionsPerPage: 5,
      allowBackNavigation: true,
      allowQuestionSkipping: true,
      showTimer: true,
      allowCalculator: false,
    },
  },
  {
    templateId: "TPL-002",
    templateName: "Final Exam",
    courseId: "course-002",
    courseName: "Business Ethics",
    questionsCount: 80,
    totalMarks: 150,
    durationMinutes: 180,
    status: "ACTIVE",
    createdBy: "Admin-001",
    usageCount: 3,
    lastUpdated: "2025-11-01T10:00:00Z",
    sections: [
      {
        sectionId: "sec-004",
        sectionName: "Section A - MCQ",
        questionType: "MCQ",
        questionCount: 50,
        marksPerQuestion: 1,
      },
      {
        sectionId: "sec-005",
        sectionName: "Section B - Essay",
        questionType: "ESSAY",
        questionCount: 30,
        marksPerQuestion: 100 / 30,
      },
    ],
    randomizationConfig: {
      shuffleQuestions: false,
      shuffleOptions: true,
      randomizeSectionOrder: false,
    },
    displayConfig: {
      questionsPerPage: 10,
      allowBackNavigation: false,
      allowQuestionSkipping: false,
      showTimer: true,
      allowCalculator: true,
    },
  },
  {
    templateId: "TPL-003",
    templateName: "Agriculture Fundamentals Quiz",
    courseId: "course-003",
    courseName: "Agriculture Science",
    questionsCount: 20,
    totalMarks: 40,
    durationMinutes: 45,
    status: "DRAFT",
    createdBy: "Instructor-003",
    usageCount: 0,
    lastUpdated: "2025-11-05T08:00:00Z",
    sections: [
      {
        sectionId: "sec-006",
        sectionName: "Section A",
        questionType: "MCQ",
        questionCount: 20,
        marksPerQuestion: 2,
      },
    ],
    randomizationConfig: {
      shuffleQuestions: true,
      shuffleOptions: true,
      randomizeSectionOrder: false,
    },
    displayConfig: {
      questionsPerPage: 5,
      allowBackNavigation: true,
      allowQuestionSkipping: true,
      showTimer: true,
      allowCalculator: false,
    },
  },
];

const MOCK_STATS = {
  templatesCreatedThisMonth: 20,
  templatesCreatedLastMonth: 19,
  creationGrowthPercent: 5.3,
  usageFrequency: "HIGH",
  averageUsageCount: 12.5,
  updateComplianceRate: 85,
};

const MOCK_QUESTION_BANKS = [
  {
    bankId: "bank-001",
    bankName: "Agriculture Fundamentals Question Bank",
    courseId: "course-003",
    courseName: "Agriculture Science",
    totalQuestions: 45,
    createdBy: "instructor-uuid",
    createdAt: "2025-11-01T10:00:00Z",
  },
  {
    bankId: "bank-002",
    bankName: "Data Analytics Question Bank",
    courseId: "course-001",
    courseName: "Data Analytics 101",
    totalQuestions: 120,
    createdBy: "instructor-uuid",
    createdAt: "2025-10-15T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// 3.1 Create Examination Template
// POST /api/v2/exam-templates
// ---------------------------------------------------------------------------

/**
 * Create a new examination template
 * @param {{ templateName, courseId, sections, totalQuestions, totalMarks, durationMinutes, randomizationConfig, displayConfig }} body
 * @returns {Promise<{ message: string, template: object }>}
 */
export const adminCreateExamTemplate = async (body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/exam-templates', body);
  // return { message, template: data };

  return {
    message: "Template created successfully",
    template: {
      templateId: "tpl-uuid-789",
      templateName: body.templateName,
      courseId: body.courseId,
      questionsCount: body.totalQuestions,
      totalMarks: body.totalMarks,
      durationMinutes: body.durationMinutes,
      status: "DRAFT",
      createdBy: "instructor-uuid",
      usageCount: 0,
      createdAt: new Date().toISOString(),
      sections:
        body.sections?.map((s, i) => ({ sectionId: `sec-new-${i}`, ...s })) ??
        [],
    },
  };
};

// ---------------------------------------------------------------------------
// 3.2 List Examination Templates
// GET /api/v2/exam-templates
// ---------------------------------------------------------------------------

/**
 * Get all examination templates
 * @param {{ courseId?, status?, page?, limit? }} params
 * @returns {Promise<{ templates: Array, totalDocumentsCount: number }>}
 */
export const adminGetExamTemplates = async (params) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/exam-templates', { params });
  // return { templates: data.templates, totalDocumentsCount: data.pagination.totalItems };

  return {
    templates: MOCK_TEMPLATES,
    totalDocumentsCount: MOCK_TEMPLATES.length,
  };
};

// ---------------------------------------------------------------------------
// Get single template by ID (derived)
// GET /api/v2/exam-templates/:templateId
// ---------------------------------------------------------------------------

/**
 * Get a single template by ID
 * @param {string} templateId
 * @returns {Promise<{ template: object }>}
 */
export const adminGetExamTemplateById = async (templateId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/exam-templates/${templateId}`);
  // return { template: data };

  const found =
    MOCK_TEMPLATES.find((t) => t.templateId === templateId) ||
    MOCK_TEMPLATES[0];
  return { template: found };
};

// ---------------------------------------------------------------------------
// 3.3 Generate Examination Paper from Template
// POST /api/v2/exam-templates/:templateId/generate
// ---------------------------------------------------------------------------

/**
 * Generate a paper from a template for a student
 * @param {string} templateId
 * @param {{ studentId: string, examId: string }} body
 * @returns {Promise<{ message: string, paper: object }>}
 */
export const adminGenerateExamPaper = async (templateId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/exam-templates/${templateId}/generate`, body);
  // return { message, paper: data };

  return {
    message: "Paper generated successfully",
    paper: {
      paperId: "paper-uuid-789",
      templateId,
      examId: body.examId,
      studentId: body.studentId,
      generatedAt: new Date().toISOString(),
      randomizationSeed: Math.floor(Math.random() * 99999),
      questions: [
        {
          questionId: "q-001",
          sequenceNumber: 1,
          questionText: "What is photosynthesis?",
          questionType: "ESSAY",
          marks: 10,
          difficulty: "MEDIUM",
        },
        {
          questionId: "q-002",
          sequenceNumber: 2,
          questionText: "Which of the following is a macronutrient?",
          questionType: "MCQ",
          marks: 2,
          difficulty: "EASY",
          options: [
            { optionId: "opt-1", text: "Nitrogen", isCorrect: true },
            { optionId: "opt-2", text: "Zinc", isCorrect: false },
            { optionId: "opt-3", text: "Copper", isCorrect: false },
          ],
        },
      ],
    },
  };
};

// ---------------------------------------------------------------------------
// 3.4 Get Template Statistics
// GET /api/v2/exam-templates/:templateId/statistics
// ---------------------------------------------------------------------------

/**
 * Get usage statistics for a template
 * @param {string} templateId
 * @returns {Promise<{ statistics: object }>}
 */
export const adminGetTemplateStatistics = async (templateId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/exam-templates/${templateId}/statistics`);
  // return { statistics: data };

  return { statistics: MOCK_STATS };
};

// ---------------------------------------------------------------------------
// 3.5 Create Question Bank
// POST /api/v2/question-banks
// ---------------------------------------------------------------------------

/**
 * Create a new question bank with questions
 * @param {{ courseId, bankName, questions: Array }} body
 * @returns {Promise<{ message: string, bank: object }>}
 */
export const adminCreateQuestionBank = async (body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/question-banks', body);
  // return { message, bank: data };

  return {
    message: "Question bank created successfully",
    bank: {
      bankId: "bank-uuid-123",
      courseId: body.courseId,
      bankName: body.bankName,
      totalQuestions: body.questions?.length ?? 0,
      createdBy: "instructor-uuid",
      createdAt: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// Get Question Banks (listing)
// GET /api/v2/question-banks
// ---------------------------------------------------------------------------

/**
 * Get all question banks
 * @param {object} params
 * @returns {Promise<{ banks: Array, totalDocumentsCount: number }>}
 */
export const adminGetQuestionBanks = async (params) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/question-banks', { params });
  // return { banks: data.banks, totalDocumentsCount: data.pagination.totalItems };

  return {
    banks: MOCK_QUESTION_BANKS,
    totalDocumentsCount: MOCK_QUESTION_BANKS.length,
  };
};
