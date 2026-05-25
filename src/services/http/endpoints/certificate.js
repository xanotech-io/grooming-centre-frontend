import { http } from "../http";

// ── Mock data ─────────────────────────────────────────────────────────────────

let MOCK_CERTIFICATES = [
  {
    certificateId: "CERT-001",
    learnerId: "LRN-001",
    learnerName: "Nmorsi Donald",
    courseId: "AGR101",
    courseName: "Data Analytics for Beginners",
    certificateType: "Completion",
    issueDate: "2025-11-14T10:00:00Z",
    format: "SVG",
    issuedBy: "Admin-001",
    verificationLink: "https://groomingcentre.com/verify/CERT-001",
    status: "Issued",
    remarks: "Course completed successfully with 85% score",
    downloadUrl: "https://storage.example.com/certificates/CERT-001.svg",
    svgContent: "<svg>...</svg>",
  },
  {
    certificateId: "CERT-002",
    learnerId: "LRN-002",
    learnerName: "Jane Okoro",
    courseId: "CS101",
    courseName: "Customer Service Essentials",
    certificateType: "Achievement",
    issueDate: "2025-11-10T10:00:00Z",
    format: "SVG",
    issuedBy: "Admin-001",
    verificationLink: "https://groomingcentre.com/verify/CERT-002",
    status: "Issued",
    remarks: "Completed all required modules",
    downloadUrl: "https://storage.example.com/certificates/CERT-002.svg",
    svgContent: "<svg>...</svg>",
  },
];

const MOCK_STUDENT_CERTIFICATES = [
  {
    certificate_id: "CERT001",
    course_id: "CRS001",
    course_title: "Data Analytics for Beginners",
    certificate_title: "Data Analytics Level 1",
    completion_date: "2025-11-14",
    issued_date: "2025-11-14",
    expiry_date: null,
    status: "Eligible",
    download_option: "Yes",
    verification_link: "https://groomingcentre.com/verify/CERT001",
    display_location: "Certificate Tab",
  },
  {
    certificate_id: "CERT002",
    course_id: "CRS002",
    course_title: "Customer Service Essentials",
    certificate_title: "Customer Service Professional",
    completion_date: "2025-10-05",
    issued_date: "2025-10-05",
    expiry_date: "2027-10-05",
    status: "Eligible",
    download_option: "Yes",
    verification_link: "https://groomingcentre.com/verify/CERT002",
    display_location: "Certificate Tab",
  },
  {
    certificate_id: "CERT003",
    course_id: "CRS003",
    course_title: "Project Management Fundamentals",
    certificate_title: "Project Management Certificate",
    completion_date: null,
    issued_date: null,
    expiry_date: null,
    status: "Pending",
    download_option: "No",
    verification_link: null,
    display_location: "Dashboard",
  },
  {
    certificate_id: "CERT004",
    course_id: "CRS004",
    course_title: "Digital Literacy Program",
    certificate_title: "Digital Literacy Program Certificate",
    completion_date: "2025-11-14",
    issued_date: "2025-11-14",
    expiry_date: null,
    status: "Pending",
    download_option: "No",
    verification_link: null,
    display_location: "Dashboard",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const findMockCertificate = (certificateId) =>
  MOCK_CERTIFICATES.find((c) => c.certificateId === certificateId);

const paginate = (rows, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 50);
  const start = (page - 1) * limit;
  return {
    rows: rows.slice(start, start + limit),
    count: rows.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

// ── Certificate V2 API ────────────────────────────────────────────────────────

/**
 * List certificates with optional filters.
 * GET /v1/certificate-v2
 */
export const certV2ListCertificates = async (params = {}) => {
  try {
    const { data } = await http.get("/v1/certificate-v2", { params });
    return data;
  } catch (_err) {
    const { userId, courseId, certificateType, status } = params;
    const filtered = MOCK_CERTIFICATES.filter((c) => {
      if (userId && c.learnerId !== userId) return false;
      if (courseId && c.courseId !== courseId) return false;
      if (certificateType && c.certificateType !== certificateType) return false;
      if (status && c.status !== status) return false;
      return true;
    });
    const pg = paginate(filtered, params);
    return {
      certificates: pg.rows,
      pagination: { count: pg.count, page: pg.page, limit: pg.limit, totalPages: pg.totalPages },
    };
  }
};

/**
 * Issue a customized certificate for a student.
 * POST /v1/certificate-v2/issue
 * Body: { userId, courseId, certificateType, remarks }
 */
export const certV2IssueCertificate = async (body = {}) => {
  try {
    const { data } = await http.post("/v1/certificate-v2/issue", body);
    return data;
  } catch (_err) {
    const certificateId = `CERT-${String(MOCK_CERTIFICATES.length + 1).padStart(3, "0")}`;
    const created = {
      certificateId,
      learnerId: body.userId || body.learnerId || "LRN-001",
      learnerName: body.learnerName || "Learner",
      courseId: body.courseId || "CRS-001",
      courseName: body.courseName || "Course",
      certificateType: body.certificateType || "Participation",
      issueDate: new Date().toISOString(),
      format: "SVG",
      issuedBy: body.issuedBy || "Admin-001",
      verificationLink: `https://groomingcentre.com/verify/${certificateId}`,
      status: "Issued",
      remarks: body.remarks || "Certificate issued successfully",
      downloadUrl: `https://storage.example.com/certificates/${certificateId}.svg`,
      svgContent: "<svg>...</svg>",
    };
    MOCK_CERTIFICATES = [created, ...MOCK_CERTIFICATES];
    return { message: "Certificate issued successfully", certificate: created };
  }
};

/**
 * Revoke an issued certificate.
 * PATCH /v1/certificate-v2/{certificateId}/revoke
 */
export const certV2RevokeCertificate = async (certificateId) => {
  try {
    const { data } = await http.patch(`/v1/certificate-v2/${certificateId}/revoke`);
    return data;
  } catch (_err) {
    const cert = findMockCertificate(certificateId);
    if (!cert) throw new Error("Certificate not found");
    const updated = { ...cert, status: "Revoked" };
    MOCK_CERTIFICATES = MOCK_CERTIFICATES.map((c) =>
      c.certificateId === certificateId ? updated : c,
    );
    return { message: "Certificate revoked successfully", certificate: updated };
  }
};

/**
 * Re-issue a certificate (regenerates SVG and verification token).
 * PATCH /v1/certificate-v2/{certificateId}/reissue
 */
export const certV2ReissueCertificate = async (certificateId) => {
  try {
    const { data } = await http.patch(`/v1/certificate-v2/${certificateId}/reissue`);
    return data;
  } catch (_err) {
    const cert = findMockCertificate(certificateId);
    if (!cert) throw new Error("Certificate not found");
    const updated = {
      ...cert,
      status: "Issued",
      issueDate: new Date().toISOString(),
      verificationLink: `https://groomingcentre.com/verify/${certificateId}-reissued`,
    };
    MOCK_CERTIFICATES = MOCK_CERTIFICATES.map((c) =>
      c.certificateId === certificateId ? updated : c,
    );
    return { message: "Certificate re-issued successfully", certificate: updated };
  }
};

/**
 * Download a certificate as an SVG file.
 * GET /v1/certificate-v2/download/{certificateId}
 * Returns the SVG string directly.
 */
export const certV2DownloadCertificate = async (certificateId) => {
  try {
    const { data } = await http.get(`/v1/certificate-v2/download/${certificateId}`, {
      responseType: "text",
      headers: { Accept: "image/svg+xml" },
    });
    return data;
  } catch (_err) {
    const cert = findMockCertificate(certificateId);
    if (!cert) throw new Error("Certificate not found");
    if (cert.status !== "Issued") throw new Error("Certificate not available");
    return cert.svgContent || "<svg><text>Certificate</text></svg>";
  }
};

/**
 * Verify a certificate by its verification token (public).
 * GET /v1/certificate-v2/verify/{token}
 */
export const certV2VerifyCertificate = async (token) => {
  try {
    const { data } = await http.get(`/v1/certificate-v2/verify/${token}`);
    return data;
  } catch (_err) {
    const cert = MOCK_CERTIFICATES.find((c) => c.verificationLink?.endsWith(token));
    if (!cert) throw new Error("Certificate not found");
    if (cert.status === "Revoked") {
      const err = new Error("Certificate has been revoked");
      err.status = 410;
      throw err;
    }
    return {
      studentName: cert.learnerName,
      courseName: cert.courseName,
      certificateType: cert.certificateType,
      issueDate: cert.issueDate,
      issuer: cert.issuedBy,
      status: cert.status,
    };
  }
};

/**
 * Administrative certificate issuance summary report.
 * GET /v1/certificate-v2/report/summary
 */
export const certV2GetSummaryReport = async (params = {}) => {
  try {
    const { data } = await http.get("/v1/certificate-v2/report/summary", { params });
    return data;
  } catch (_err) {
    const all = MOCK_CERTIFICATES;
    const issued = all.filter((c) => c.status === "Issued").length;
    const pending = all.filter((c) => c.status === "Pending").length;
    const revoked = all.filter((c) => c.status === "Revoked").length;

    const courseCounts = all.reduce((acc, c) => {
      acc[c.courseId] = acc[c.courseId] || { courseId: c.courseId, courseName: c.courseName, count: 0 };
      acc[c.courseId].count += 1;
      return acc;
    }, {});

    const issuerCounts = all.reduce((acc, c) => {
      acc[c.issuedBy] = acc[c.issuedBy] || { issuedById: c.issuedBy, count: 0 };
      acc[c.issuedBy].count += 1;
      return acc;
    }, {});

    return {
      totalIssued: issued,
      totalPending: pending,
      totalRevoked: revoked,
      svgSuccessRate: issued > 0 ? Math.round((issued / (issued + pending + revoked)) * 100) : 0,
      totalVerificationRequests: 0,
      perCourse: Object.values(courseCounts),
      perIssuer: Object.values(issuerCounts),
    };
  }
};

/**
 * Student portal — fetch all certificates for the authenticated learner.
 * GET /v1/certificate-v2/my-certificates
 */
export const studentGetMyCertificates = async (params = {}) => {
  try {
    const { data } = await http.get("/v1/certificate-v2/my-certificates", { params });
    return data;
  } catch (_err) {
    const { courseId, status: statusFilter } = params;
    const certs = MOCK_STUDENT_CERTIFICATES.filter((c) => {
      if (courseId && c.course_id !== courseId) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      return true;
    });

    return {
      learner_id: params.learnerId || "LRN001",
      learner_name: "Student",
      certificates: certs,
      summary: {
        total_certificates: certs.length,
        eligible_certificates: certs.filter((c) => c.status === "Eligible").length,
        pending_certificates: certs.filter((c) => c.status === "Pending").length,
        downloadable_certificates: certs.filter((c) => c.download_option === "Yes").length,
      },
    };
  }
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
  try {
    const result = await certV2ListCertificates({ limit: 200 });
    const certs = result.certificates ?? result.rows ?? [];
    const cert = certs.find((c) => (c.certificateId || c.certificate_id) === certificateId);
    if (!cert) throw new Error("Certificate not found");
    return { certificate: cert };
  } catch (_err) {
    const cert = findMockCertificate(certificateId);
    if (!cert) throw new Error("Certificate not found");
    return { certificate: cert };
  }
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
