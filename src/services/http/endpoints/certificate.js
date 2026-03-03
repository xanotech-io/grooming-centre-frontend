import { http } from "../http";

/**
 * Endpoint to get `lesson-details`
 * @param {string} id - courseId
 *
 * @returns {Promise<{ certificate: certificate }>}
 */
export const requestCertificateDetails = async (courseId, userId, isAdmin) => {
  const path = `/certificate/${courseId}/${isAdmin ? userId : ""}`;

  const {
    data: { data },
  } = await http.get(path);
  console.log(data);
  return { certificate: data };
};
export const createCertificate = async (body) => {
  const path = `/certificate/create`;
  const {
    data: { message, data },
  } = await http.post(path, body);
  return {
    message,
    data,
  };
};
export const CertificateList = async (params) => {
  const path = `/cate/list`;

  const {
    data: { data },
  } = await http.get(path, params);
  console.log(data);
  return { certificate: data };
};
