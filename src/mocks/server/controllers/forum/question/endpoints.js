import { rest } from "msw";
import { getUrl } from "../../../http";
import { handleSuccessResponse } from "../../helpers";
import {
  userForumPublishQuestionRes,
  userForumGetCategoriesRes,
  userForumGetQuestionsRes,
  userForumGetQuestionDetailsRes_questionId_1,
  userForumGetQuestionDetailsRes_questionId_2,
  userForumGetQuestionDetailsRes_questionId_3,
  userForumEditQuestionRes,
  userForumDeleteQuestionRes,
} from "./responses";

const userForumGetQuestions = [
  rest.get(
    // TODO: change `method`
    getUrl("/forum/question"), // TODO: change `path`
    handleSuccessResponse(userForumGetQuestionsRes)
  ),
  rest.get(
    // TODO: change `method`
    getUrl("/forum/question/mine/all"), // TODO: change `path`
    handleSuccessResponse(userForumGetQuestionsRes)
  ),
];

const userForumGetCategories = rest.get(
  // TODO: change `method`
  getUrl("/forum/category"), // TODO: change `path`
  handleSuccessResponse(userForumGetCategoriesRes)
);

const userForumPublishQuestion = rest.post(
  // TODO: change `method`
  getUrl("/forum/question/create"), // TODO: change `path`
  handleSuccessResponse(userForumPublishQuestionRes)
);

const userForumEditQuestion = [
  rest.patch(
    getUrl("/forum/question/questionId_1"),
    handleSuccessResponse(userForumEditQuestionRes)
  ),
  rest.patch(
    getUrl("/forum/question/questionId_2"),
    handleSuccessResponse(userForumEditQuestionRes)
  ),
];
const userForumDeleteQuestion = [
  rest.delete(
    getUrl("/forum/question/questionId_1"),
    handleSuccessResponse(userForumDeleteQuestionRes)
  ),
  rest.delete(
    getUrl("/forum/question/questionId_2"),
    handleSuccessResponse(userForumDeleteQuestionRes)
  ),
];

const userForumGetQuestionDetails = [
  rest.get(
    // TODO: change `method`
    getUrl("/forum/question/questionId_1"), // TODO: change `path`
    handleSuccessResponse(userForumGetQuestionDetailsRes_questionId_1)
  ),
  rest.get(
    // TODO: change `method`
    getUrl("/forum/question/questionId_2"), // TODO: change `path`
    handleSuccessResponse(userForumGetQuestionDetailsRes_questionId_2)
  ),
  rest.get(
    // TODO: change `method`
    getUrl("/forum/question/questionId_3"), // TODO: change `path`
    handleSuccessResponse(userForumGetQuestionDetailsRes_questionId_3)
  ),
];

const forumQuestion = [
  userForumGetCategories,
  userForumPublishQuestion,
  ...userForumGetQuestions,
  ...userForumGetQuestionDetails,
  ...userForumEditQuestion,
  ...userForumDeleteQuestion,
];

export default forumQuestion;
