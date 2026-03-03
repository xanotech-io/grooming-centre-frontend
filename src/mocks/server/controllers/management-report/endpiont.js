
import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import { mockCourseReportsResponse } from "./reponses";

const getCourseReports = rest.get(
  getUrl("/admin/course-reports"),
  handleSuccessResponse(mockCourseReportsResponse)
);

const role = [getCourseReports];

export default role;