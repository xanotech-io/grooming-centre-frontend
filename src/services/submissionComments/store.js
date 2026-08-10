// Frontend-only persistence for in-line submission comments (highlight + general feedback).
// No backend contract exists yet for this — everything lives in localStorage behind these
// functions so a future swap to real API calls only touches this file.

/**
 * The admin-side submissions report and the student-facing result/project pages currently
 * use separate, disconnected ID systems for "this student's submission of this thing" (a
 * pre-existing gap in this codebase, not introduced here). Rather than assume a shared
 * submissionId neither side can independently derive, both sides key the comment thread off
 * data they each already have: the entity type, its id, and the student's id.
 */
export const buildThreadKey = (entityType, entityId, studentId) =>
  `${entityType}:${entityId}:${studentId}`;

const commentsKey = (submissionId) => `submissionComments:${submissionId}`;
const lastViewedKey = (submissionId, viewerId) =>
  `submissionCommentsLastViewed:${submissionId}:${viewerId}`;

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getComments = (submissionId) =>
  readJSON(commentsKey(submissionId), []);

const saveComments = (submissionId, comments) =>
  writeJSON(commentsKey(submissionId), comments);

/**
 * Returns null (allowed) or the overlapping comment (blocked) so callers can warn the user.
 */
export const findOverlappingComment = (submissionId, questionId, startIndex, endIndex) => {
  const comments = getComments(submissionId);
  return (
    comments.find(
      (c) =>
        c.questionId === questionId &&
        c.anchor &&
        startIndex < c.anchor.endIndex &&
        endIndex > c.anchor.startIndex,
    ) || null
  );
};

/**
 * @param {object} params
 * @param {string} params.submissionId
 * @param {string|null} [params.questionId]
 * @param {string|null} [params.questionLabel]
 * @param {{startIndex:number, endIndex:number, anchorText:string}|null} [params.anchor]
 * @param {string} params.body
 * @param {string} params.authorId
 * @param {string} params.authorName
 * @param {'instructor'|'student'} params.authorRole
 */
export const addComment = ({
  submissionId,
  questionId = null,
  questionLabel = null,
  anchor = null,
  body,
  authorId,
  authorName,
  authorRole,
}) => {
  const comment = {
    id: makeId("comment"),
    submissionId,
    questionId,
    questionLabel,
    anchor,
    body,
    authorId,
    authorName,
    authorRole,
    createdAt: new Date().toISOString(),
    resolved: false,
    replies: [],
  };
  const comments = getComments(submissionId);
  comments.push(comment);
  saveComments(submissionId, comments);
  return comment;
};

export const addReply = (submissionId, commentId, { body, authorId, authorName, authorRole }) => {
  const comments = getComments(submissionId);
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return null;
  const reply = {
    id: makeId("reply"),
    body,
    authorId,
    authorName,
    authorRole,
    createdAt: new Date().toISOString(),
  };
  comment.replies.push(reply);
  saveComments(submissionId, comments);
  return reply;
};

export const resolveComment = (submissionId, commentId, resolved = true) => {
  const comments = getComments(submissionId);
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return null;
  comment.resolved = resolved;
  saveComments(submissionId, comments);
  return comment;
};

export const deleteComment = (submissionId, commentId) => {
  const comments = getComments(submissionId).filter((c) => c.id !== commentId);
  saveComments(submissionId, comments);
};

export const markViewed = (submissionId, viewerId) => {
  if (!viewerId) return;
  writeJSON(lastViewedKey(submissionId, viewerId), new Date().toISOString());
};

export const getUnreadCount = (submissionId, viewerId) => {
  if (!viewerId) return 0;
  const lastViewed = readJSON(lastViewedKey(submissionId, viewerId), null);
  const comments = getComments(submissionId);
  if (!lastViewed) return comments.length;
  return comments.filter(
    (c) =>
      c.authorId !== viewerId &&
      (new Date(c.createdAt) > new Date(lastViewed) ||
        c.replies.some((r) => r.authorId !== viewerId && new Date(r.createdAt) > new Date(lastViewed))),
  ).length;
};
