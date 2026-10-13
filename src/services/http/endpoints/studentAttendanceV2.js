import { http, baseURL } from "../http";

// POST /api/v1/student-attendance-v2/record
export const recordStudentAttendance = async (body) => {
  const { data } = await http.post("/v1/student-attendance-v2/record", body);
  return data;
};

// Same endpoint, but sent with `keepalive` so the request survives the tab
// being closed/refreshed (axios requests are cancelled on page unload).
export const recordStudentAttendanceOnUnload = (body) =>
  fetch(`${baseURL}/v1/student-attendance-v2/record`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(body),
  }).catch(() => {});

// GET /api/v1/student-attendance-v2/report
export const getAttendanceReport = async (params) => {
  const { data } = await http.get("/v1/student-attendance-v2/report", { params });
  return data;
};

// GET /api/v1/student-attendance-v2/report/export
export const exportAttendanceReport = async (params) => {
  const response = await http.get("/v1/student-attendance-v2/report/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};

// GET /api/v1/student-attendance-v2/{studentId}
export const getStudentAttendanceV2 = async (studentId, params) => {
  const { data } = await http.get(`/v1/student-attendance-v2/${studentId}`, { params });
  return data;
};

// GET /api/v1/student-attendance-v2/{studentId}/course/{courseId}
export const getStudentCourseAttendanceV2 = async (studentId, courseId) => {
  const { data } = await http.get(
    `/v1/student-attendance-v2/${studentId}/course/${courseId}`
  );
  return data;
};
