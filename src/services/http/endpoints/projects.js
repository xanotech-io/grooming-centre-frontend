import { http } from "../http";

/**
 * List all projects in a module
 * @param {string} moduleId
 * @returns {Promise<{ projects: Array }>}
 */
export const getModuleProjects = async (moduleId) => {
  const path = `/v1/projects/module/${moduleId}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    projects: data.map((p) => ({
      id: p.id,
      moduleId: p.moduleId,
      instructorId: p.instructorId,
      title: p.title,
      description: p.description,
      instructions: p.instructions,
      dueDate: p.dueDate,
      maxGrade: p.maxGrade,
      status: p.status,
      approvalStatus: p.approvalStatus,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  };
};

/**
 * Add a project to a module
 * @param {string} moduleId
 * @param {{ title: string, description: string, instructions: string, dueDate: string, maxGrade: number, status: string }} body
 * @returns {Promise<{ message: string, project: object }>}
 */
export const createModuleProject = async (moduleId, body) => {
  const path = `/v1/projects/module/${moduleId}`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  return { message, project: data };
};

/**
 * Get a single project by ID
 * @param {string} projectId
 * @returns {Promise<{ project: object }>}
 */
export const getProjectById = async (projectId) => {
  const path = `/v1/projects/${projectId}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    project: {
      id: data.id,
      moduleId: data.moduleId,
      instructorId: data.instructorId,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      dueDate: data.dueDate,
      maxGrade: data.maxGrade,
      status: data.status,
      approvalStatus: data.approvalStatus,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    },
  };
};

/**
 * Update a project
 * @param {string} projectId
 * @param {{ title?: string, description?: string, instructions?: string, dueDate?: string, maxGrade?: number, status?: string }} body
 * @returns {Promise<{ message: string, project: object }>}
 */
export const updateProject = async (projectId, body) => {
  const path = `/v1/projects/${projectId}`;

  const {
    data: { message, data },
  } = await http.put(path, body);

  return { message, project: data };
};

/**
 * Delete a project (draft status only)
 * @param {string} projectId
 * @returns {Promise<{ message: string }>}
 */
export const deleteProject = async (projectId) => {
  const path = `/v1/projects/${projectId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};

/**
 * List all submissions for a project (admin/instructor)
 * @param {string} projectId
 * @returns {Promise<{ submissions: Array }>}
 */
export const getProjectSubmissions = async (projectId) => {
  const path = `/v1/projects/${projectId}/submissions`;

  const {
    data: { data },
  } = await http.get(path);

  return { submissions: data };
};

/**
 * Get a single submission by ID
 * @param {string} submissionId
 * @returns {Promise<{ submission: object }>}
 */
export const getSubmissionById = async (submissionId) => {
  const path = `/v1/submissions/${submissionId}`;

  const {
    data: { data },
  } = await http.get(path);

  return { submission: data };
};

/**
 * Add a review to a submission (instructor/admin)
 * @param {string} submissionId
 * @param {{ grade: number, remarks: string, inlineMarkup: object }} body
 * @returns {Promise<{ message: string, review: object }>}
 */
export const reviewSubmission = async (submissionId, body) => {
  const path = `/v1/submissions/${submissionId}/reviews`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  return { message, review: data };
};

/**
 * Get the review for a submission
 * @param {string} submissionId
 * @returns {Promise<{ review: object }>}
 */
export const getSubmissionReview = async (submissionId) => {
  const path = `/v1/submissions/${submissionId}/reviews`;

  const {
    data: { data },
  } = await http.get(path);

  return { review: data };
};

/**
 * Submit a project file (student)
 * @param {string} projectId
 * @param {File} file
 * @returns {Promise<{ message: string, submission: object }>}
 */
export const submitProjectFile = async (projectId, file) => {
  const path = `/v1/projects/${projectId}/submissions`;

  const formData = new FormData();
  formData.append("projectFile", file);

  const {
    data: { message, data },
  } = await http.post(path, formData);

  return { message, submission: data };
};
