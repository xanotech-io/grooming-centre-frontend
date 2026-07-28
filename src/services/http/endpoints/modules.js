import { http } from "../http";

/**
 * List all modules in a course
 * @param {string} courseId
 * @returns {Promise<{ modules: Array }>}
 */
export const adminListModules = async (courseId) => {
  const path = `/v1/course/${courseId}/modules`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    modules: data.map((module) => ({
      id: module.id,
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      sequenceOrder: module.sequenceOrder,
      status: module.status,
      approvalStatus: module.approvalStatus,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    })),
  };
};

/**
 * Get a single module
 * @param {string} courseId
 * @param {string} moduleId
 * @returns {Promise<{ module: object }>}
 */
export const adminGetModule = async (courseId, moduleId) => {
  const path = `/v1/course/${courseId}/modules/${moduleId}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    module: {
      id: data.id,
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      sequenceOrder: data.sequenceOrder,
      status: data.status,
      approvalStatus: data.approvalStatus,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    },
  };
};

/**
 * Create a module in a course
 * @param {string} courseId
 * @param {{ title: string, description: string, sequenceOrder: number, status: string, supervisor_id?: string }} body
 * @returns {Promise<{ message: string, module: { id: string } }>}
 */
export const adminCreateModule = async (courseId, body) => {
  const path = `/v1/course/${courseId}/modules`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  return { message, module: { id: data.id } };
};

/**
 * Update a module
 * @param {string} moduleId
 * @param {{ title?: string, description?: string, sequenceOrder?: number, status?: string, supervisor_id?: string }} body
 * @returns {Promise<{ message: string, module: object }>}
 */
export const adminUpdateModule = async (moduleId, body) => {
  const path = `/v1/modules/${moduleId}`;

  const {
    data: { message, data },
  } = await http.put(path, body);

  return { message, module: data };
};

/**
 * Delete a module (only allowed in draft status)
 * @param {string} moduleId
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteModule = async (moduleId) => {
  const path = `/v1/modules/${moduleId}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};

/**
 * Publish a module (requires at least one lesson)
 * @param {string} moduleId
 * @returns {Promise<{ message: string }>}
 */
export const adminPublishModule = async (moduleId) => {
  const path = `/v1/modules/${moduleId}/publish`;

  const {
    data: { message },
  } = await http.patch(path);

  return { message };
};

/**
 * Unpublish a module (reverts to draft)
 * @param {string} moduleId
 * @returns {Promise<{ message: string }>}
 */
export const adminUnpublishModule = async (moduleId) => {
  const path = `/v1/modules/${moduleId}/unpublish`;

  const {
    data: { message },
  } = await http.patch(path);

  return { message };
};
