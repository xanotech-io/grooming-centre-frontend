import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import { mockStudentReportsResponse } from "./reponses";

const getStudentProgress = rest.get(
  getUrl("/api/v2/students/:studentId/progress"),
  handleSuccessResponse(mockStudentReportsResponse)
);

const getStudentTranscript = rest.get(
  getUrl("/v2/students/:studentId/transcript"),
  handleSuccessResponse(mockStudentReportsResponse)
);

const getStudentAttendance = rest.get(
  getUrl("/v2/students/:studentId/attendance"),
  handleSuccessResponse(mockStudentReportsResponse)
);

const getStudentAssessments = rest.get(
  getUrl("/v2/students/:studentId/assessments"),
  handleSuccessResponse(mockStudentReportsResponse)
);

const getComplianceEmployees = rest.get(
  getUrl("/v2/compliance/employees"),
  handleSuccessResponse(mockStudentReportsResponse)
);

const role = [
  getStudentProgress,
  getStudentTranscript,
  getStudentAttendance,
  getStudentAssessments,
  getComplianceEmployees,
];

export default role;