import { rest } from "msw";
import { getUrl } from "../../http";
import { adminEditAssessmentQuestionRes } from "../assessment/responses";
import { handleSuccessResponse } from "../helpers";
import {
  adminGetExaminationListingRes_courseId_1,
  // requestExaminationRes_examinationId_1,
  // requestExaminationRes_examinationId_2,
  submitExaminationRes,
  adminCreateExaminationQuestionRes,
  adminCreateExaminationRes,
  adminEditExaminationRes_examinationId_1,
  adminEditExaminationRes_examinationId_2,
  adminGetExaminationListingRes_courseId_3,
} from "./responses";

const adminGetExaminationListing = [
  rest.get(
    getUrl("/examination/courseId_1"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_1)
  ),
  rest.get(
    getUrl("/examination/courseId_3"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_3)
  ),
  rest.get(
    getUrl("/examination/admin/courseId_1"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_1)
  ),
  rest.get(
    getUrl("/examination/admin/courseId_3"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_3)
  ),
  rest.get(
    getUrl("/examination/courseId_1"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_1)
  ),
  rest.get(
    getUrl("/examination/courseId_3"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_3)
  ),
];
const adminGetExaminationDetails = [
  rest.get(
    getUrl("/examination/examinationId_1"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_1)
  ),
  rest.get(
    getUrl("/examination/examinationId_2"),
    handleSuccessResponse(adminGetExaminationListingRes_courseId_3)
  ),
];

const submitExamination = [
  rest.post(
    getUrl("/examination/scoresheet/create"),
    handleSuccessResponse(submitExaminationRes)
  ),
];

const adminCreateExaminationQuestion = rest.post(
  getUrl("/examination/question/create"),
  handleSuccessResponse(adminCreateExaminationQuestionRes)
);

const adminCreateExamination = rest.post(
  getUrl("/examination/create"),
  handleSuccessResponse(adminCreateExaminationRes)
);

const adminEditExamination = [
  rest.patch(
    getUrl("/examination/edit/courseId_1"),
    handleSuccessResponse(adminEditExaminationRes_examinationId_1)
  ),
  rest.patch(
    getUrl("/examination/edit/courseId_3"),
    handleSuccessResponse(adminEditExaminationRes_examinationId_2)
  ),
];

const adminEditExaminationQuestion = rest.patch(
  getUrl("/examination/question/edit"),
  handleSuccessResponse(adminEditAssessmentQuestionRes)
);

const examination = [
  adminCreateExamination,
  adminCreateExaminationQuestion,
  adminEditExaminationQuestion,
  ...adminGetExaminationDetails,
  ...adminGetExaminationListing,
  ...submitExamination,
  ...adminEditExamination,
];

export default examination;
