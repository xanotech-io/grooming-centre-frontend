import { http } from '../http';

/**
 * List all projects in a module
 * @param {string} moduleId
 * @returns {Promise<{ projects: Array }>}
 */
export const adminListModuleProjects = async (moduleId) => {
    const path = `/v1/projects/module/${moduleId}`;

    const {
        data: { data },
    } = await http.get(path);

    return {
        projects: data.map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            moduleId: project.moduleId,
            instructorId: project.instructorId,
            dueDate: project.dueDate,
            maxGrade: project.maxGrade,
            status: project.status,
            createdAt: project.createdAt,
        })),
    };
};

/**
 * Get a single project
 * @param {string} projectId
 * @returns {Promise<{ project: object }>}
 */
export const adminGetProject = async (projectId) => {
    const path = `/v1/projects/${projectId}`;

    const {
        data: { data },
    } = await http.get(path);

    return { project: data };
};

/**
 * Create a project in a module
 * @param {string} moduleId
 * @param {{ title: string, description: string, instructions: string, dueDate: string, maxGrade: number, status: string }} body
 * @returns {Promise<{ message: string, project: { id: string } }>}
 */
export const adminCreateProject = async (moduleId, body) => {
    const path = `/v1/projects/module/${moduleId}`;

    const {
        data: { message, data },
    } = await http.post(path, body);

    const project = { id: data.id };

    return { message, project };
};

/**
 * Update a project
 * @param {string} projectId
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminUpdateProject = async (projectId, body) => {
    const path = `/v1/projects/${projectId}`;

    const {
        data: { message },
    } = await http.put(path, body);

    return { message };
};

/**
 * Delete a project (only allowed in draft status)
 * @param {string} projectId
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteProject = async (projectId) => {
    const path = `/v1/projects/${projectId}`;

    const {
        data: { message },
    } = await http.delete(path);

    return { message };
};
