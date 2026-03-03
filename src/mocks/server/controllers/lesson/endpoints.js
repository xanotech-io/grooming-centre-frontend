import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  adminCreateLessonRes,
  adminEditLessonRes_lessonId_1,
  adminEditLessonRes_lessonId_2,
  requestEndLessonRes,
  adminGetLessonListingRes_courseId_1,
  adminGetLessonListingRes_courseId_3,
  requestLessonDetailsRes_lessonId_1,
  requestLessonDetailsRes_lessonId_2,
  requestLessonDetailsRes_lessonId_3,
  requestLessonDetailsRes_lessonId_4,
  requestLessonDetailsRes_lessonId_5,
} from "./responses";

const requestLessonDetailsForLessonId = [
  rest.get(
    getUrl("/lesson/lessonId_1"),
    handleSuccessResponse(requestLessonDetailsRes_lessonId_1)
  ),
  rest.get(
    getUrl("/lesson/lessonId_2"),
    handleSuccessResponse(requestLessonDetailsRes_lessonId_2)
  ),
  rest.get(
    getUrl("/lesson/lessonId_3"),
    handleSuccessResponse(requestLessonDetailsRes_lessonId_3)
  ),
  rest.get(
    getUrl("/lesson/lessonId_4"),
    handleSuccessResponse(requestLessonDetailsRes_lessonId_4)
  ),
  rest.get(
    getUrl("/lesson/lessonId_5"),
    handleSuccessResponse(requestLessonDetailsRes_lessonId_5)
  ),
];

const requestEndLesson = [
  rest.post(
    getUrl("/lesson/end-lesson/lessonId_1"),
    handleSuccessResponse(requestEndLessonRes)
  ),
  rest.post(
    getUrl("/lesson/end-lesson/lessonId_2"),
    handleSuccessResponse(requestEndLessonRes)
  ),
  rest.post(
    getUrl("/lesson/end-lesson/lessonId_3"),
    handleSuccessResponse(requestEndLessonRes)
  ),
  rest.post(
    getUrl("/lesson/end-lesson/lessonId_4"),
    handleSuccessResponse(requestEndLessonRes)
  ),
  rest.post(
    getUrl("/lesson/end-lesson/lessonId_5"),
    handleSuccessResponse(requestEndLessonRes)
  ),
];

const adminCreateLesson = rest.post(
  getUrl("/lesson/create"),
  handleSuccessResponse(adminCreateLessonRes)
);

const adminEditLesson = [
  rest.patch(
    getUrl("/lesson/edit/lessonId_1"),
    handleSuccessResponse(adminEditLessonRes_lessonId_1)
  ),
  rest.patch(
    getUrl("/lesson/edit/lessonId_2"),
    handleSuccessResponse(adminEditLessonRes_lessonId_2)
  ),
];

const adminGetLessonListing = [
  rest.get(
    getUrl("/lesson/admin/courseId_1"),
    handleSuccessResponse(adminGetLessonListingRes_courseId_1)
  ),
  rest.get(
    getUrl("/lesson/admin/courseId_3"),
    handleSuccessResponse(adminGetLessonListingRes_courseId_3)
  ),
];

const lesson = [
  ...requestLessonDetailsForLessonId,
  ...requestEndLesson,
  ...adminEditLesson,
  ...adminGetLessonListing,
  adminCreateLesson,
];

export default lesson;
