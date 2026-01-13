import { http } from "../http";

/**
 * Endpoint to get `lesson-details`
 * @param {string} id - lessonId
 *
 * @returns {Promise<{ lesson: Lesson }>}
 */
export const requestLessonDetails = async (id) => {
  const path = `/lesson/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    lesson: {
      ...data,
      hasEnded: data.lessonTracking?.[0]?.isCompleted,
      file: data.file.replace("http://", "https://"),
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
  const path = `/lesson/end-lesson/${id}`; // TODO: change path

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
  const path = `/lesson/create`;
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
  const path = `/lesson/edit/${lessonId}`;

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
 * @returns {Promise<{ message: string, lessons: Array<{ id: string, title: string, startTime: Date, active: boolean, courseId: string }>}>}
 */
export const adminGetLessonListing = async (courseId, params, body) => {
  const path = `/lesson/admin/${courseId}?sort=asc`;
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
    })),
    showingDocumentsCount: data.rows.length,
    totalDocumentsCount: data.rows.length,
  };
};
export const adminDeleteLesson = async (ids) => {
  const path = `/lesson/delete`;
  let formattedIds = [];
  for (let i = 0; i < ids.length; i++) {
    formattedIds.push(ids[i].id);
  }
  const body = { lessonIds: formattedIds };
  await http.delete(path, { data: body });
};
