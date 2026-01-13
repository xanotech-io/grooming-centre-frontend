import { getFullName, truncateText } from "../../../../utils";
import { http } from "../../http";
import { getExpressionCount } from "./comment";

/**
 * Endpoint to get forum usernames
 *
 * @returns {Promise<{ usernames: { is: string, name: string } }>}
 */
export const userForumGetUsernames = async (params) => {
  const path = `/forum/usernames`;

  const {
    data: { data },
  } = await http.get(path, { params });

  const usernames = data.map((username) => ({
    id: username.id,
    name: username.name,
    profilePics: username.profilePics,
  }));

  return { usernames };
};

/**
 * Endpoint to get forum mentions
 *
 * @returns {
 *   Promise<{
 *     comments: Array<Comment | Reply>
 *     questions: Array<Question>
 *   }>
 * }
 */
export const userForumGetMentions = async () => {
  const path = `/forum/mentions`;

  const {
    data: { data },
  } = await http.get(path);

  const comments = data.comments.map((comment) => ({
    sortId: comment.sortId,
    id: comment.id,
    commentId: comment.commentId,
    questionId: comment.questionId,
    createdAt: comment.createdAt,
    body: comment.comment,
    likes: getExpressionCount("like", comment.expressions),
    dislikes: getExpressionCount("dislike", comment.expressions),
    active: comment.active,
    expressions: comment.expressions, // TODO: map
    user: {
      id: comment.user.id,
      profilePics: comment.user.profilePics,
      fullName: getFullName(comment.user),
    },
  }));

  const questions = data.questions.map((question) => ({
    sortId: question.sortId,
    id: question.id,
    title: question.title,
    body: truncateText(question.question, 100),
    active: question.active,
    createdAt: question.createdAt,
    tags: question.tags.map((tag) => ({
      id: tag.id,
      label: tag.name,
    })),
    user: {
      id: question.user.id,
      profilePics: question.user.profilePics,
      fullName: getFullName(question.user),
    },
    commentCount: question.commentCount,
  }));

  return { comments, questions };
};
