import { http } from "../http";
import { capitalizeFirstLetter } from "../../../utils";

/**
 * Format a lesson's `lessonType` relation into a display-friendly file type label.
 * @param {{ lessonType: ?{ name: string } }} lesson
 *
 * @returns {?string}
 */
const formatFileType = (lesson) => {
  const name = lesson?.lessonType?.name;
  return name ? capitalizeFirstLetter(name) : null;
};

/**
 * Format the user who uploaded a lesson into a display-friendly full name.
 * @param {{ uploader: ?object, createdBy: ?object }} lesson
 *
 * @returns {?string}
 */
const formatUploadedBy = (lesson) => {
  const uploader = lesson?.uploader ?? lesson?.createdBy;
  return uploader
    ? `${uploader.firstName ?? ""} ${uploader.lastName ?? ""}`.trim() || null
    : null;
};

/**
 * Endpoint to get `lesson-details`
 * @param {string} id - lessonId
 *
 * @returns {Promise<{ lesson: Lesson }>}
 */
export const requestLessonDetails = async (id) => {
  const path = `/v1/lesson/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    lesson: {
      ...data,
      hasEnded: data.lessonTracking?.[0]?.isCompleted,
      file: data.file.replace("http://", "https://"),
      fileType: formatFileType(data),
      uploadedBy: formatUploadedBy(data),
    },
  };
};

/**
 * Endpoint to end a lesson
 * @param {string} id - lessonId
 *
 * @returns {Promise<{ message: string }>}
 */
export const requestEndLesson = async (id) => {
  const path = `/v1/lesson/end-lesson/${id}`; // TODO: change path

  const {
    data: { message },
  } = await http.post(path); // TODO: change method

  return { message };
};

/**
 * Endpoint to for admin to create a lesson
 * @param {{ title: string, content: string, lessonTypeId: string, startTime: Date, endTime: Date, file: File }} body
 *
 * @returns {Promise<{ message: string, lesson: { id: string } }>}
 */
export const adminCreateLesson = async (body, onProgressCallback) => {
  const path = `/v1/lesson/create`;
  let uploadProgress = 0;
  const config = {
    onUploadProgress: (progressEvent) => {
      uploadProgress = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100
      );

      onProgressCallback(uploadProgress);
    },
  };
  try {
    const {
      data: { message, data },
    } = await http.post(path, body, config);

    const lesson = { id: data.id };

    return { message, lesson };
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
};
/**
 * Endpoint to for admin to edit a lesson
 * @param {{ title: ?string, content: ?string, lessonTypeId: ?string, startTime: ?Date, endTime: ?Date, file: ?File, courseId: string }} body
 *
 * @returns {Promise<{ message: string, lesson: { id: string } }>}
 */
export const adminEditLesson = async (lessonId, body) => {
  const path = `/v1/lesson/edit/${lessonId}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const lesson = {
    id: data[0].id,
  };

  return { message, lesson };
};

/**
 * Endpoint to for admin get all lessons
 * @param {object} params
 *
 * @param {{ title: string, startTime: Date, courseId: string }} body
 *
 * @returns {Promise<{ message: string, lessons: Array<{ id: string, title: string, startTime: Date, active: boolean, courseId: string, fileType: ?string, uploadedBy: ?string }>}>}
 */
export const adminGetLessonListing = async (courseId, params, body) => {
  const path = `/v1/lesson/admin/${courseId}?sort=asc`;
  const {
    data: { message, data },
  } = await http.get(path, { params }, body);
  return {
    message,
    lessons: data.rows.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      startTime: lesson.startTime,
      active: lesson.active,
      courseId: lesson.courseId,
      fileType: formatFileType(lesson),
      uploadedBy: formatUploadedBy(lesson),
    })),
    showingDocumentsCount: data.rows.length,
    totalDocumentsCount: data.rows.length,
  };
};

/**
 * List all lessons in a module
 * @param {string} moduleId
 * @returns {Promise<{ lessons: Array }>}
 */
export const adminGetModuleLessons = async (moduleId) => {
  const path = `/v1/lesson/module/${moduleId}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    lessons: data.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      moduleId: lesson.moduleId,
      courseId: lesson.courseId,
      approvalStatus: lesson.approvalStatus,
      fileType: formatFileType(lesson),
      uploadedBy: formatUploadedBy(lesson),
    })),
  };
};

export const adminDeleteLesson = async (ids) => {
  const path = `/v1/lesson/delete`;
  let formattedIds = [];
  for (let i = 0; i < ids.length; i++) {
    formattedIds.push(ids[i].id);
  }
  const body = { lessonIds: formattedIds };
  await http.delete(path, { data: body });
};
