// A submission's final score stays uncomputed until every manually-marked
// question is graded — any status other than graded/completed is shown as
// "Manual Marking Required" rather than a generic "Pending".
const GRADED_STATUSES = ["graded", "completed"];

export const isSubmissionGraded = (status) =>
  GRADED_STATUSES.includes((status || "").toLowerCase());

export const submissionStatusLabel = (status) =>
  isSubmissionGraded(status) ? "Graded" : "Manual Marking Required";
