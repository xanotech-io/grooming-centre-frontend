import { http } from "../http";

/**
 * TC05 – Compliance & Training Report
 * GET /v2/compliance/employees/{employeeId}
 */
export const getComplianceEmployees = async (employeeId, params) => {
  const { data } = await http.get(`/v2/compliance/employees/${employeeId}`, { params });
  return data;
};
