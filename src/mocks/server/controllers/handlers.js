import assessment from "./assessment/endpoints";
import auth from "./auth/endpoints";
import course from "./course/endpoints";
import examination from "./examination/endpoints";
import lesson from "./lesson/endpoints";
import user from "./user/endpoints";
import grades from "./grades/endpoints";
import certificate from "./certificate/endpoints";
import forumQuestion from "./forum/question/endpoints";
import forumTag from "./forum/tag/endpoints";
import forumComment from "./forum/comment/endpoints";
import forumMentions from "./forum/mention/endpoints";
import editCourse from "./editcourseinfo/endpoints";
import department from "./department/endpoints";
import metadata from "./metadata/endpoints";
import role from "./role/endpoints";
import event from "./event/endpoints";
import library from "./library/endpoints";
import appointments from "./appointments/endpoints";
import chat from "./chat/endpoints";
import standaloneExamination from "./standaloneExamination/endpoints";

const commonHandlers = [
  ...appointments,
  ...auth,
  ...course,
  ...chat,
  ...lesson,
  ...user,
  ...grades,
  ...certificate,
  ...examination,
  ...standaloneExamination,
  ...assessment,
  ...forumTag,
  ...forumQuestion,
  ...forumComment,
  ...forumMentions,
  ...editCourse,
  ...department,
  ...metadata,
  ...role,
  ...event,
  ...library,
];

const handlers = {
  dev: [...commonHandlers],
  test: [...commonHandlers],
};

export default handlers;
