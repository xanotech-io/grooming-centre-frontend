import { http } from "../http";

// ── Certificate V2 API ────────────────────────────────────────────────────────
//
// The backend wraps every certificate-v2 response in an envelope:
//   { success, message, data: <actual payload> }
// so a plain `const { data } = await http.get(...)` only unwraps the axios
// response, not the backend envelope — `unwrap()` handles the second layer.
// Certificate records also come back snake_case (student_name, course_name,
// issue_date, issued_by, verification_link, …) — `normalizeCertificate` maps
// those onto the camelCase shape the UI already reads, while keeping the
// original snake_case keys too so nothing that depends on them breaks.

const unwrap = (responseData) => responseData?.data ?? responseData;

const normalizeCertificate = (c) => {
  if (!c || typeof c !== "object") return c;
  return {
    ...c,
    certificateId: c.certificateId ?? c.certificate_id,
    certificate_id: c.certificate_id ?? c.certificateId,
    userId: c.userId ?? c.student_id ?? c.learnerId,
    learnerId: c.learnerId ?? c.student_id ?? c.userId,
    learnerName: c.learnerName ?? c.student_name ?? c.learner_name,
    learner_name: c.learner_name ?? c.student_name ?? c.learnerName,
    courseId: c.courseId ?? c.course_id,
    course_id: c.course_id ?? c.courseId,
    courseName: c.courseName ?? c.course_name ?? c.course_title,
    course_title: c.course_title ?? c.course_name ?? c.courseName,
    certificateType: c.certificateType ?? c.certificate_type,
    certificate_type: c.certificate_type ?? c.certificateType,
    issueDate: c.issueDate ?? c.issue_date ?? c.issued_date,
    issued_date: c.issued_date ?? c.issue_date ?? c.issueDate,
    issuedBy: c.issuedBy ?? c.issued_by,
    issued_by: c.issued_by ?? c.issuedBy,
    verificationLink: c.verificationLink ?? c.verification_link,
    verification_link: c.verification_link ?? c.verificationLink,
  };
};

const normalizeSummary = (s) => {
  if (!s || typeof s !== "object") return s;
  // svg_generation_success_rate comes back as a 0-1 fraction (e.g. 0.15 = 15%);
  // only scale it up when it looks like a fraction, in case the backend ever
  // starts sending an already-scaled percentage instead.
  const svgRateRaw = s.svgSuccessRate ?? s.svg_generation_success_rate ?? s.svg_success_rate;
  const svgSuccessRate = svgRateRaw == null ? undefined : Math.round(svgRateRaw * (svgRateRaw <= 1 ? 100 : 1) * 10) / 10;
  return {
    ...s,
    totalIssued: s.totalIssued ?? s.issued ?? s.total_issued,
    totalPending: s.totalPending ?? s.pending ?? s.total_pending,
    totalRevoked: s.totalRevoked ?? s.revoked ?? s.total_revoked,
    totalCertificates: s.totalCertificates ?? s.total_certificates,
    svgSuccessRate,
    totalVerificationRequests: s.totalVerificationRequests ?? s.total_verification_requests,
    perCourse: s.perCourse ?? s.per_course,
    perIssuer: s.perIssuer ?? s.per_issuer,
  };
};

/**
 * List certificates with optional filters.
 * GET /v1/certificate-v2
 */
export const certV2ListCertificates = async (params = {}) => {
  const { data } = await http.get("/v1/certificate-v2", { params });
  const report = unwrap(data);
  const rows = report?.data ?? report?.certificates ?? report?.rows ?? [];
  const limit = report?.limit ?? params.limit ?? 20;
  const total = report?.total ?? report?.recordCount ?? rows.length;

  return {
    certificates: rows.map(normalizeCertificate),
    pagination: {
      page: report?.page ?? params.page ?? 1,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

/**
 * Issue a customized certificate for a student.
 * POST /v1/certificate-v2/issue
 * Body: { userId, courseId, certificateType, remarks }
 */
export const certV2IssueCertificate = async (body = {}) => {
  const { data } = await http.post("/v1/certificate-v2/issue", body);
  const payload = unwrap(data);
  const certificate = normalizeCertificate(payload?.certificate ?? payload);
  return { message: data?.message, certificate };
};

/**
 * Revoke an issued certificate.
 * PATCH /v1/certificate-v2/{certificateId}/revoke
 * Body: { reason }
 */
export const certV2RevokeCertificate = async (certificateId, body = {}) => {
  const { data } = await http.patch(`/v1/certificate-v2/${certificateId}/revoke`, body);
  const payload = unwrap(data);
  const certificate = normalizeCertificate(payload?.certificate ?? payload);
  return { message: data?.message, certificate };
};

/**
 * Re-issue a certificate (regenerates SVG and verification token).
 * PATCH /v1/certificate-v2/{certificateId}/reissue
 */
export const certV2ReissueCertificate = async (certificateId) => {
  const { data } = await http.patch(`/v1/certificate-v2/${certificateId}/reissue`);
  const payload = unwrap(data);
  const certificate = normalizeCertificate(payload?.certificate ?? payload);
  return { message: data?.message, certificate };
};

/**
 * Download a certificate as an SVG file.
 * GET /v1/certificate-v2/download/{certificateId}
 * Returns the SVG string directly (not JSON, so no envelope to unwrap).
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
  const payload = unwrap(data);
  return {
    ...payload,
    studentName: payload?.studentName ?? payload?.student_name,
    courseName: payload?.courseName ?? payload?.course_name,
    certificateType: payload?.certificateType ?? payload?.certificate_type,
    issueDate: payload?.issueDate ?? payload?.issue_date,
    issuer: payload?.issuer ?? payload?.issued_by,
    status: payload?.status,
  };
};

/**
 * Administrative certificate issuance summary report.
 * GET /v1/certificate-v2/report/summary
 */
export const certV2GetSummaryReport = async (params = {}) => {
  const { data } = await http.get("/v1/certificate-v2/report/summary", { params });
  return normalizeSummary(unwrap(data));
};

/**
 * Student portal — fetch all certificates for the authenticated learner.
 * GET /v1/certificate-v2/my-certificates
 */
export const studentGetMyCertificates = async (params = {}) => {
  const { data } = await http.get("/v1/certificate-v2/my-certificates", { params });
  return unwrap(data);
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
export const adminRevokeComplianceCertificate = async (certificateId, body = {}) => {
  return certV2RevokeCertificate(certificateId, body);
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
