
import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import { mockStudentReportsResponse } from "./reponses";

const getStudentReports = rest.get(
  getUrl("/admin/student-reports"),
  handleSuccessResponse(mockStudentReportsResponse)
);

const role = [getStudentReports];

export default role;