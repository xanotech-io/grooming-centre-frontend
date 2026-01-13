import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  requestCertificateDetailsRes_CourseId_1,
  requestCertificateDetailsRes_CourseId_2,
  requestCertificateDetailsRes_CourseId_3
} from "./responses";

const requestCertificateDetailsRes_CourseId = [
  rest.get(
    getUrl("/courses/courseId_1/certificate"),
    handleSuccessResponse(requestCertificateDetailsRes_CourseId_1)
  ),
  rest.get(
    getUrl("/courses/courseId_2/certificate"),
    handleSuccessResponse(requestCertificateDetailsRes_CourseId_2)
  ),
  rest.get(
    getUrl("/courses/courseId_3/certificate"),
    handleSuccessResponse(requestCertificateDetailsRes_CourseId_3)
  ),
];

const certificate = [...requestCertificateDetailsRes_CourseId];

export default certificate;
