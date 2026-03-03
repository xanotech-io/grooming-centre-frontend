import { truncateText, getFullName } from '../../../../utils';
import { http } from '../../http';

/**
 * Endpoint to get the current user forum questions
 *
 * @returns {
 *   Promise<{
 *     questions: Array<{ id: string, name: string, body: string, tags: Array<{ value: string, label: string }>, commentCount: number }>
 *   }>
 * }
 */
export const userForumGetYourQuestions = async () => {
  const path = `/forum/question/mine/all`;

  const {
    data: { data },
  } = await http.get(path);
  console.log(data);

  const questions = data.rows.map((question) => ({
    id: question.id,
    title: question.title,
    body: truncateText(question.question, 100),
    active: question.active,
    createdAt: question.createdAt,
    tags: Array.isArray(question.tags) // TODO: pin
      ? question.tags.map((tag) => ({
          id: tag.id,
          label: tag.title,
        }))
      : [],
    commentCount: question.forumComments.length || 0, // TODO: pin
  }));

  return { questions };
};

/**
 * Endpoint to get forum questions
 *
 * @returns {
 *   Promise<{
 *     questions: Array<{ id: string, name: string, body: string, tags: Array<{ value: string, label: string }>, user: { id: string, profilePics: string, fullName: string }, commentCount: number }>
 *   }>
 * }
 */
export const userForumGetQuestions = async (params) => {
  const path = `/forum/question`;

  const {
    data: { data },
  } = await http.get(path, { params });

  const questions = data.rows.map((question) => ({
    id: question.id,
    title: question.title,
    body: truncateText(question.question, 100),
    active: question.active,
    createdAt: question.createdAt,
    tags: Array.isArray(question.tags) // TODO: pin
      ? question.tags.map((tag) => ({
          id: tag.id,
          label: tag.title,
        }))
      : [],
    user: {
      id: question.user.id,
      profilePics: question.user.profilePics,
      fullName: getFullName(question.user),
    },
    commentCount: question.forumComments.length || 0, // TODO: pin
  }));

  return { questions };
};

/**
 * Endpoint to get forum questions by tagId
 *
 * @returns {
 *   Promise<{
 *     questions: Array<{ id: string, name: string, body: string, tags: Array<{ value: string, label: string }>, user: { id: string, profilePics: string, fullName: string }, commentCount: number }>
 *   }>
 * }
 */
export const userForumGetQuestionsByTagId = async (id) => {
  const path = `/forum/tag/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  const questions = data[0].forumQuestion.map((question) => ({
    id: question.id,
    title: question.title,
    body: truncateText(question.question, 100),
    active: question.active, // TODO: add this very important
    createdAt: question.createdAt,
    // Fix from the backend
    tags: Array.isArray(question.tags)
      ? question.tags.map((tag) => ({
          id: tag.id,
          label: tag.title,
        }))
      : [],

    user: {
      id: question.userId,
      // profilePics: question.user.profilePics,
      fullName: getFullName(question.user) || 'not set',
    },
    // Fix from the backend
    commentCount: question.forumComments?.length || 0,
  }));

  return { questions };
};

/**
 * Endpoint to get forum question details
 * @param {string} id - questionId
 *
 * @returns {
 *   Promise<{
 *     {
 *     id: string,
 *     name: string,
 *     body: string,
 *     createdAt: string,
 *     commentCount: number,
 *     categoryId: string,
 *     tags: Array<{ value: string, label: string }>,
 *     user: { id: string, profilePics: string, fullName: string }>
 *   }>
 * }
 */
export const userForumGetQuestionDetails = async (id) => {
  const path = `/forum/question/${id}`;

  const {
    data: { data },
  } = await http.get(path);
  console.log(data);

  const question = {
    id: data.id,
    categoryId: data.categoryId,
    title: data.title,
    body: data.question,
    createdAt: data.createdAt,
    active: data.active,
    tags: data.tags.map((tag) => ({
      id: tag.id,
      label: tag.title,
    })),
    user: {
      id: data.user.id,
      profilePics: data.user.profilePics,
      fullName: `${data.user.firstName} ${data.user.lastName}`,
    },
  };

  return { question };
};

/**
 * Endpoint to get forum categories
 *
 * @returns {Promise<{ categories: { value: string, label: string } }>}
 */
export const userForumGetCategories = async () => {
  const path = `/forum/category`;

  const {
    data: { data },
  } = await http.get(path);

  const categories = data.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  return { categories };
};

/**
 * Endpoint to publish a forum question
 * @param {{ categoryId: string, userId: string, title: string, question: string, tagId: Array<string> }} question // TODO: signature might change
 *
 * @returns {Promise<{ message: string }>}
 */
export const userForumPublishQuestion = async (question) => {
  const path = `/forum/question/create`; // TODO: change path
  console.log(question);

  const {
    data: { message },
  } = await http.post(path, question);

  return { message };
};

/**
 * Endpoint to edit/modify a forum question
 * @param {string} questionId
 * @param {{ categoryId: ?string, userId: ?string, title: ?string, question: ?string, tagId: ?Array<string> }} body // TODO: signature might change
 *
 * @returns {Promise<{ message: string }>}
 */
export const userForumEditQuestion = async (questionId, body) => {
  const path = `/forum/question/${questionId}`; // TODO: change path

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};

/**
 * Endpoint to delete a forum question
 * @param {string} questionId
 *
 * @returns {Promise<{ message: string }>}
 */
export const userForumDeleteQuestion = async (questionId) => {
  const path = `/forum/question/${questionId}`; // TODO: change path

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};
