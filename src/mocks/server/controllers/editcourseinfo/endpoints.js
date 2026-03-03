import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  userCourseDetailsRes_courseId_1,
  userCourseDetailsRes_courseId_3,
} from "./responses";


const userGetCourseDetailsForCourseId_1 = rest.patch(
  getUrl("/course/edit/courseId_1"),
  handleSuccessResponse(userCourseDetailsRes_courseId_1)
);
const userGetCourseDetailsForCourseId_3 = rest.patch(
  getUrl("/course/edit/courseId_3"),
  handleSuccessResponse(userCourseDetailsRes_courseId_3)
);


const editCourse = [
  userGetCourseDetailsForCourseId_1,
  userGetCourseDetailsForCourseId_3,
];

export default editCourse;
