import { http } from "../http";

// GET /api/v1/participation-monitoring-v2/report
export const adminGetParticipationMonitoringReport = async (params = {}) => {
  const { data } = await http.get("/v1/participation-monitoring-v2/report", {
    params,
  });
  return data;
};

// GET /api/v1/participation-monitoring-v2/report/export
export const exportParticipationMonitoringReport = async (params = {}) => {
  const response = await http.get("/v1/participation-monitoring-v2/report/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};

// GET /api/v1/participation-monitoring-v2/report/{studentId}
export const adminGetStudentParticipationReport = async (
  studentId,
  params = {},
) => {
  const { data } = await http.get(
    `/v1/participation-monitoring-v2/report/${studentId}`,
    { params },
  );
  return data;
};
