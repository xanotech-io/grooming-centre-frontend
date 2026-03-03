import { rest } from "msw";
import { getUrl } from "../../http";
// import { adminEditAssessmentQuestionRes } from "../assessment/responses";
import { handleSuccessResponse } from "../helpers";
import {
  adminGetStandaloneExaminationListingRes,
  adminGetStandaloneExaminationParticipantsRes,
  // submitExaminationRes,
  // adminCreateExaminationQuestionRes,
  // adminCreateExaminationRes,
  // adminEditExaminationRes_examinationId_1,
  // adminEditExaminationRes_examinationId_2,
} from "./responses";

const adminGetStandaloneExaminationListing = [
  rest.get(
    getUrl("/stand-alone-examination/all"),
    handleSuccessResponse(adminGetStandaloneExaminationListingRes)
  ),
];
const adminGetStandaloneExaminationParticipants = [
  rest.get(
    getUrl("/stand-alone-examination/participants/standaloneExaminationId_1"),
    handleSuccessResponse(adminGetStandaloneExaminationParticipantsRes)
  ),
  rest.get(
    getUrl("/stand-alone-examination/participants/standaloneExaminationId_2"),
    handleSuccessResponse(adminGetStandaloneExaminationParticipantsRes)
  ),
];

// const submitExamination = [
//   rest.post(
//     getUrl("/examination/scoresheet/create"),
//     handleSuccessResponse(submitExaminationRes)
//   ),
// ];

// const adminCreateExaminationQuestion = rest.post(
//   getUrl("/examination/question/create"),
//   handleSuccessResponse(adminCreateExaminationQuestionRes)
// );

// const adminCreateExamination = rest.post(
//   getUrl("/examination/create"),
//   handleSuccessResponse(adminCreateExaminationRes)
// );

// const adminEditExamination = [
//   rest.patch(
//     getUrl("/examination/edit/courseId_1"),
//     handleSuccessResponse(adminEditExaminationRes_examinationId_1)
//   ),
//   rest.patch(
//     getUrl("/examination/edit/courseId_3"),
//     handleSuccessResponse(adminEditExaminationRes_examinationId_2)
//   ),
// ];

// const adminEditExaminationQuestion = rest.patch(
//   getUrl("/examination/question/edit"),
//   handleSuccessResponse(adminEditAssessmentQuestionRes)
// );

const standaloneExamination = [
  ...adminGetStandaloneExaminationListing,
  ...adminGetStandaloneExaminationParticipants,
  // adminCreateExamination,
  // adminCreateExaminationQuestion,
  // adminEditExaminationQuestion,
  // ...adminGetExaminationDetails,
  // ...submitExamination,
  // ...adminEditExamination,
];

export default standaloneExamination;
