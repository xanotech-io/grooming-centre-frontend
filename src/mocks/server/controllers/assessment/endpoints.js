import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  adminCreateAssessmentQuestionRes,
  adminEditAssessmentQuestionRes,
  adminGetAssessmentListingRes_courseId_1,
  adminGetAssessmentListingRes_courseId_3,
  requestAssessmentDetailsRes_assessmentId_1,
  requestAssessmentDetailsRes_assessmentId_2,
  requestAssessmentDetailsRes_assessmentId_3,
  submitAssessmentRes,
  adminCreateAssessmentRes,
  adminEditAssessmentRes_assessmentId_1,
  adminEditAssessmentRes_assessmentId_2,
  adminRequestAssessmentDetailsRes_assessmentId_1,
  adminRequestAssessmentDetailsRes_assessmentId_2,
} from "./responses";

const requestAssessmentDetails = [
  rest.get(
    getUrl("/assessment/assessmentId_1"),
    handleSuccessResponse(requestAssessmentDetailsRes_assessmentId_1)
  ),
  rest.get(
    getUrl("/assessment/assessmentId_2"),
    handleSuccessResponse(requestAssessmentDetailsRes_assessmentId_2)
  ),
  rest.get(
    getUrl("/assessment/assessmentId_3"),
    handleSuccessResponse(requestAssessmentDetailsRes_assessmentId_3)
  ),
  rest.get(
    getUrl("/assessment/admin/assessmentId_1"),
    handleSuccessResponse(adminRequestAssessmentDetailsRes_assessmentId_1)
  ),
  rest.get(
    getUrl("/assessment/admin/assessmentId_2"),
    handleSuccessResponse(adminRequestAssessmentDetailsRes_assessmentId_2)
  ),
];

const submitAssessment = [
  rest.post(
    getUrl("/assessment/scoresheet/create"),
    handleSuccessResponse(submitAssessmentRes)
  ),
];

const adminCreateAssessmentQuestion = rest.post(
  getUrl("/assessment/question/create"),
  handleSuccessResponse(adminCreateAssessmentQuestionRes)
);

const adminEditAssessmentQuestion = rest.patch(
  getUrl("/assessment/question/edit"),
  handleSuccessResponse(adminEditAssessmentQuestionRes)
);

const adminGetAssessmentListing = [
  rest.get(
    getUrl("/assessment/course/courseId_1"),
    handleSuccessResponse(adminGetAssessmentListingRes_courseId_1)
  ),
  rest.get(
    getUrl("/assessment/course/courseId_3"),
    handleSuccessResponse(adminGetAssessmentListingRes_courseId_3)
  ),
];

const adminCreateAssessment = rest.post(
  getUrl("/assessment/create"),
  handleSuccessResponse(adminCreateAssessmentRes)
);

const adminEditAssessment = [
  rest.patch(
    // TODO: change `method`
    getUrl("/assessment/edit/assessmentId_1"), // TODO: change `path`
    handleSuccessResponse(adminEditAssessmentRes_assessmentId_1)
  ),
  rest.patch(
    // TODO: change `method`
    getUrl("/assessment/edit/assessmentId_2"), // TODO: change `path`
    handleSuccessResponse(adminEditAssessmentRes_assessmentId_2)
  ),
];

const assessment = [
  adminCreateAssessmentQuestion,
  adminEditAssessmentQuestion,
  ...requestAssessmentDetails,
  ...submitAssessment,
  ...adminGetAssessmentListing,
  adminCreateAssessment,
  ...adminEditAssessment,
];

export default assessment;
