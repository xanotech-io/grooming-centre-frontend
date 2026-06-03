import { http } from "../http";

// ── Certificate V2 API ────────────────────────────────────────────────────────

/**
 * List certificates with optional filters.
 * GET /v1/certificate-v2
 */
export const certV2ListCertificates = async (params = {}) => {
  const { data } = await http.get("/v1/certificate-v2", { params });
  return data;
};

/**
 * Issue a customized certificate for a student.
 * POST /v1/certificate-v2/issue
 * Body: { userId, courseId, certificateType, remarks }
 */
export const certV2IssueCertificate = async (body = {}) => {
  const { data } = await http.post("/v1/certificate-v2/issue", body);
  return data;
};

/**
 * Revoke an issued certificate.
 * PATCH /v1/certificate-v2/{certificateId}/revoke
 */
export const certV2RevokeCertificate = async (certificateId) => {
  const { data } = await http.patch(`/v1/certificate-v2/${certificateId}/revoke`);
  return data;
};

/**
 * Re-issue a certificate (regenerates SVG and verification token).
 * PATCH /v1/certificate-v2/{certificateId}/reissue
 */
export const certV2ReissueCertificate = async (certificateId) => {
  const { data } = await http.patch(`/v1/certificate-v2/${certificateId}/reissue`);
  return data;
};

/**
 * Download a certificate as an SVG file.
 * GET /v1/certificate-v2/download/{certificateId}
 * Returns the SVG string directly.
 */
export const certV2DownloadCertificate = async (certificateId) => {
  const { data } = await http.get(`/v1/certificate-v2/download/${certificateId}`, {
    responseType: "text",
    headers: { Accept: "image/svg+xml" },
  });
  return data;
};

/**
 * Verify a certificate by its verification token (public).
 * GET /v1/certificate-v2/verify/{token}
 */
export const certV2VerifyCertificate = async (token) => {
  const { data } = await http.get(`/v1/certificate-v2/verify/${token}`);
  return data;
};

/**
 * Administrative certificate issuance summary report.
 * GET /v1/certificate-v2/report/summary
 */
export const certV2GetSummaryReport = async (params = {}) => {
  const { data } = await http.get("/v1/certificate-v2/report/summary", { params });
  return data;
};

/**
 * Student portal — fetch all certificates for the authenticated learner.
 * GET /v1/certificate-v2/my-certificates
 */
export const studentGetMyCertificates = async (params = {}) => {
  const { data } = await http.get("/v1/certificate-v2/my-certificates", { params });
  return data;
};

// ── Backward-compatible wrappers ──────────────────────────────────────────────

/**
 * TC05 - Issue customized certificate (admin)
 */
export const adminIssueComplianceCertificate = async (body = {}) => {
  const payload = {
    userId: body.userId || body.learnerId,
    courseId: body.courseId,
    certificateType: body.certificateType?.replace(/^Certificate of /, "") || "Participation",
    remarks: body.remarks,
  };
  return certV2IssueCertificate({ ...payload, ...body });
};

/**
 * TC05 - Get all compliance certificates (admin)
 */
export const adminGetComplianceCertificates = async (params = {}) => {
  const mapped = { ...params };
  if (params.learnerId && !params.userId) mapped.userId = params.learnerId;

  const result = await certV2ListCertificates(mapped);
  return {
    certificates: result.certificates ?? result.rows ?? [],
    pagination: result.pagination ?? {},
  };
};

/**
 * TC05 - Get a certificate by id
 */
export const adminGetComplianceCertificateById = async (certificateId) => {
  const result = await certV2ListCertificates({ limit: 200 });
  const certs = result.certificates ?? result.rows ?? [];
  const cert = certs.find((c) => (c.certificateId || c.certificate_id) === certificateId);
  if (!cert) throw new Error("Certificate not found");
  return { certificate: cert };
};

/**
 * TC05 - Revoke issued certificate (admin)
 */
export const adminRevokeComplianceCertificate = async (certificateId, _body = {}) => {
  return certV2RevokeCertificate(certificateId);
};

/**
 * Backward-compatible helper used by useCertificateDetails hook
 */
export const requestCertificateDetails = async (courseId, userId) => {
  const { certificates } = await adminGetComplianceCertificates({
    userId,
    courseId,
    limit: 1,
    page: 1,
  });

  const certificate = certificates?.[0];
  if (!certificate) {
    return {
      certificate: {
        user: { firstName: "", lastName: "" },
        course: { courseTitle: "" },
        certificateId: null,
        status: "Pending",
      },
    };
  }

  const nameParts = String(certificate.learnerName || "").split(" ");
  return {
    certificate: {
      ...certificate,
      user: { id: certificate.learnerId || certificate.userId, firstName: nameParts[0] || "", lastName: nameParts.slice(1).join(" ") || "" },
      course: { id: certificate.courseId, courseTitle: certificate.courseName || "" },
    },
  };
};

/**
 * Backward-compatible alias
 */
export const createCertificate = async (body) => {
  const { message, certificate } = await adminIssueComplianceCertificate(body);
  return { message, data: certificate };
};

/**
 * Backward-compatible alias
 */
export const CertificateList = async (params = {}) => {
  const { certificates, pagination } = await adminGetComplianceCertificates(params);
  return { certificate: { rows: certificates, ...pagination } };
};
