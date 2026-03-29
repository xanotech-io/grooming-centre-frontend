// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_TEMPLATES = [
  {
    templateId: "tpl-001",
    templateName: "Midterm Exam Template - Agriculture",
    courseId: "course-uuid-123",
    courseName: "Agriculture Fundamentals",
    questionCount: 50,
    totalMarks: 100,
    questionDistribution: {
      MCQ: { count: 30, marksPerQuestion: 2 },
      TRUE_FALSE: { count: 10, marksPerQuestion: 1 },
      FILL_BLANK: { count: 5, marksPerQuestion: 2 },
      ESSAY: { count: 5, marksPerQuestion: 4 },
    },
    difficultyDistribution: { EASY: 15, MEDIUM: 25, HARD: 10 },
    status: "ACTIVE",
    createdBy: "Dr. Tunde Bello",
    createdAt: "2025-10-15T10:00:00Z",
    lastUpdated: "2025-10-20T14:00:00Z",
    usageCount: 5,
    isDefault: false,
  },
  {
    templateId: "tpl-002",
    templateName: "Final Exam Template - Agriculture",
    courseId: "course-uuid-123",
    courseName: "Agriculture Fundamentals",
    questionCount: 80,
    totalMarks: 150,
    questionDistribution: {
      MCQ: { count: 50, marksPerQuestion: 2 },
      TRUE_FALSE: { count: 15, marksPerQuestion: 1 },
      FILL_BLANK: { count: 10, marksPerQuestion: 2 },
      ESSAY: { count: 5, marksPerQuestion: 5 },
    },
    difficultyDistribution: { EASY: 20, MEDIUM: 40, HARD: 20 },
    status: "ACTIVE",
    createdBy: "Dr. Tunde Bello",
    createdAt: "2025-10-20T11:00:00Z",
    lastUpdated: "2025-10-25T09:00:00Z",
    usageCount: 2,
    isDefault: false,
  },
  {
    templateId: "tpl-003",
    templateName: "Weekly Quiz Template",
    courseId: "course-uuid-456",
    courseName: "Data Analytics 101",
    questionCount: 10,
    totalMarks: 20,
    questionDistribution: {
      MCQ: { count: 8, marksPerQuestion: 2 },
      TRUE_FALSE: { count: 2, marksPerQuestion: 2 },
    },
    difficultyDistribution: { EASY: 5, MEDIUM: 4, HARD: 1 },
    status: "ACTIVE",
    createdBy: "Prof. Adaeze Okafor",
    createdAt: "2025-09-10T08:00:00Z",
    lastUpdated: "2025-09-10T08:00:00Z",
    usageCount: 12,
    isDefault: true,
  },
  {
    templateId: "tpl-004",
    templateName: "Supplementary Exam Template",
    courseId: "course-uuid-456",
    courseName: "Data Analytics 101",
    questionCount: 30,
    totalMarks: 60,
    questionDistribution: {
      MCQ: { count: 20, marksPerQuestion: 2 },
      ESSAY: { count: 10, marksPerQuestion: 2 },
    },
    difficultyDistribution: { EASY: 8, MEDIUM: 15, HARD: 7 },
    status: "INACTIVE",
    createdBy: "Prof. Adaeze Okafor",
    createdAt: "2025-08-01T10:00:00Z",
    lastUpdated: "2025-09-01T11:00:00Z",
    usageCount: 0,
    isDefault: false,
  },
];

const MOCK_USAGE_STATS = {
  usageStatistics: {
    totalUses: 5,
    lastUsedAt: "2025-10-28T14:00:00Z",
    usesThisMonth: 2,
    usesLastMonth: 3,
    averageQuestionsGenerated: 48,
    examsGenerated: [
      {
        examId: "exam-001",
        examTitle: "Agriculture Midterm - Section A",
        generatedAt: "2025-10-15T10:00:00Z",
        studentCount: 45,
      },
      {
        examId: "exam-002",
        examTitle: "Agriculture Midterm - Section B",
        generatedAt: "2025-10-15T10:05:00Z",
        studentCount: 42,
      },
    ],
  },
  questionUtilization: {
    totalQuestionsInBank: 200,
    questionsUsed: 85,
    utilizationRate: 42.5,
  },
};

// ---------------------------------------------------------------------------
// 10.1 Create Question Bank Template
// POST /api/v2/question-templates
// ---------------------------------------------------------------------------

/**
 * Create a new question bank template
 * @param {{ templateName: string, courseId: string, questionCount: number, totalMarks: number, questionDistribution: object, difficultyDistribution: object }} body
 * @returns {Promise<{ message: string, template: object }>}
 */
export const adminCreateQuestionTemplate = async (body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/v2/question-templates', body);
  // return { message, template: data };

  const newTemplate = {
    templateId: `tpl-${Date.now()}`,
    templateName: body.templateName,
    courseId: body.courseId,
    courseName: "Agriculture Fundamentals",
    questionCount: body.questionCount,
    totalMarks: body.totalMarks,
    questionDistribution: body.questionDistribution || {},
    difficultyDistribution: body.difficultyDistribution || {},
    status: "ACTIVE",
    createdBy: "instructor-uuid-001",
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    usageCount: 0,
    isDefault: false,
  };

  return { message: "Template created successfully", template: newTemplate };
};

// ---------------------------------------------------------------------------
// 10.2 Get All Templates
// GET /api/v2/question-templates
// ---------------------------------------------------------------------------

/**
 * Get all question bank templates
 * @param {{ page?: number, limit?: number, courseId?: string, status?: string }} params
 * @returns {Promise<{ templates: Array, pagination: object }>}
 */
export const adminGetAllQuestionTemplates = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/question-templates', { params });
  // return { templates: data.templates, pagination: data.pagination };

  let filtered = [...MOCK_TEMPLATES];
  if (params.courseId)
    filtered = filtered.filter((t) => t.courseId === params.courseId);
  if (params.status)
    filtered = filtered.filter((t) => t.status === params.status);

  const page = params.page || 1;
  const limit = params.limit || 10;
  const start = (page - 1) * limit;

  return {
    templates: filtered.slice(start, start + limit),
    pagination: {
      page,
      limit,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
};

// ---------------------------------------------------------------------------
// 10.3 Get Template by ID
// GET /api/v2/question-templates/{id}
// ---------------------------------------------------------------------------

/**
 * Get full details of a single template
 * @param {string} templateId
 * @returns {Promise<{ template: object }>}
 */
export const adminGetQuestionTemplateById = async (templateId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/question-templates/${templateId}`);
  // return { template: data };

  const found =
    MOCK_TEMPLATES.find((t) => t.templateId === templateId) ||
    MOCK_TEMPLATES[0];
  return { template: { ...found, templateId } };
};

// ---------------------------------------------------------------------------
// 10.4 Update Template
// PATCH /api/v2/question-templates/{id}
// ---------------------------------------------------------------------------

/**
 * Update an existing question bank template
 * @param {string} templateId
 * @param {{ templateName?: string, questionCount?: number, totalMarks?: number, status?: string }} body
 * @returns {Promise<{ message: string, template: object }>}
 */
export const adminUpdateQuestionTemplate = async (templateId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.patch(`/v2/question-templates/${templateId}`, body);
  // return { message, template: data };

  return {
    message: "Template updated successfully",
    template: {
      templateId,
      ...body,
      lastUpdated: new Date().toISOString(),
      updatedBy: "instructor-uuid-001",
    },
  };
};

// ---------------------------------------------------------------------------
// 10.5 Delete Template
// DELETE /api/v2/question-templates/{id}
// ---------------------------------------------------------------------------

/**
 * Delete a question bank template
 * @param {string} templateId
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteQuestionTemplate = async (templateId) => {
  // TODO: replace mock with real call
  // const { data: { message } } = await http.delete(`/v2/question-templates/${templateId}`);
  // return { message };

  return {
    message: "Template deleted successfully",
    data: {
      templateId,
      deletedAt: new Date().toISOString(),
      deletedBy: "instructor-uuid-001",
    },
  };
};

// ---------------------------------------------------------------------------
// 10.6 Duplicate Template
// POST /api/v2/question-templates/{id}/duplicate
// ---------------------------------------------------------------------------

/**
 * Duplicate an existing template
 * @param {string} templateId
 * @returns {Promise<{ message: string, template: object }>}
 */
export const adminDuplicateQuestionTemplate = async (templateId) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/question-templates/${templateId}/duplicate`);
  // return { message, template: data };

  const original =
    MOCK_TEMPLATES.find((t) => t.templateId === templateId) ||
    MOCK_TEMPLATES[0];

  return {
    message: "Template duplicated successfully",
    template: {
      originalTemplateId: templateId,
      newTemplateId: `tpl-copy-${Date.now()}`,
      templateName: `${original.templateName} (Copy)`,
      courseId: original.courseId,
      questionCount: original.questionCount,
      totalMarks: original.totalMarks,
      status: "ACTIVE",
      createdBy: "instructor-uuid-001",
      createdAt: new Date().toISOString(),
      usageCount: 0,
      isCopy: true,
    },
  };
};

// ---------------------------------------------------------------------------
// 10.7 Get Template Usage Statistics
// GET /api/v2/question-templates/{id}/usage
// ---------------------------------------------------------------------------

/**
 * Get usage statistics for a template
 * @param {string} templateId
 * @returns {Promise<{ templateId: string, templateName: string, usageStatistics: object, questionUtilization: object }>}
 */
export const adminGetTemplateUsageStats = async (templateId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/question-templates/${templateId}/usage`);
  // return { templateId: data.templateId, templateName: data.templateName, usageStatistics: data.usageStatistics, questionUtilization: data.questionUtilization };

  const found =
    MOCK_TEMPLATES.find((t) => t.templateId === templateId) ||
    MOCK_TEMPLATES[0];
  return {
    templateId,
    templateName: found.templateName,
    ...MOCK_USAGE_STATS,
  };
};

// ---------------------------------------------------------------------------
// 10.8 Search Templates
// GET /api/v2/question-templates/search
// ---------------------------------------------------------------------------

/**
 * Search templates by name
 * @param {{ q: string, page?: number, limit?: number, courseId?: string }} params
 * @returns {Promise<{ searchTerm: string, results: Array, pagination: object }>}
 */
export const adminSearchQuestionTemplates = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/v2/question-templates/search', { params });
  // return { searchTerm: data.searchTerm, results: data.results, pagination: data.pagination };

  const q = (params.q || "").toLowerCase();
  const results = MOCK_TEMPLATES.filter(
    (t) =>
      t.templateName.toLowerCase().includes(q) ||
      t.courseName.toLowerCase().includes(q),
  );

  return {
    searchTerm: params.q || "",
    results,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: results.length,
      totalPages: Math.ceil(results.length / (params.limit || 10)) || 1,
    },
  };
};

// ---------------------------------------------------------------------------
// 10.9 Get Course Templates
// GET /api/v2/courses/{id}/question-templates
// ---------------------------------------------------------------------------

/**
 * Get all question bank templates for a specific course
 * @param {string} courseId
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<{ courseId: string, courseName: string, templates: Array, pagination: object }>}
 */
export const adminGetCourseQuestionTemplates = async (
  courseId,
  params = {},
) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/courses/${courseId}/question-templates`, { params });
  // return { courseId: data.courseId, courseName: data.courseName, templates: data.templates, pagination: data.pagination };

  const templates = MOCK_TEMPLATES.filter((t) => t.courseId === courseId);

  return {
    courseId,
    courseName: templates[0]?.courseName || "Unknown Course",
    templates,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      totalItems: templates.length,
      totalPages: Math.ceil(templates.length / (params.limit || 10)) || 1,
    },
  };
};
