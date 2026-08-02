import { http } from "../http";

export const adminGetEnrollmentStatusStudents = async (params = {}) => {
  const response = await http.get("/v1/enrollment-status-v2/students", { params });
  return response?.data;
};

export const adminGetEnrollmentStatusStudent = async (studentId) => {
  const response = await http.get(`/v1/enrollment-status-v2/students/${studentId}`);
  return response?.data;
};

export const adminGetEnrollmentStatusCourses = async (params = {}) => {
  const response = await http.get("/v1/enrollment-status-v2/courses", { params });
  return response?.data;
};

export const adminGetEnrollmentStatusTrends = async (params = {}) => {
  const response = await http.get("/v1/enrollment-status-v2/trends", { params });
  return response?.data;
};
