import { http } from "../http";

const CERTIFICATE_TYPES = [
  "Certificate of Participation",
  "Certificate of Achievement",
  "Certificate of Completion",
];

let MOCK_CERTIFICATES = [
  {
    certificateId: "CERT-001",
    learnerId: "LRN-001",
    learnerName: "Nmorsi Donald",
    courseId: "AGR101",
    courseName: "Data Analytics for Beginners",
    certificateType: "Certificate of Participation",
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
    certificateType: "Certificate of Completion",
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

const findCertificate = (certificateId) =>
  MOCK_CERTIFICATES.find((certificate) => certificate.certificateId === certificateId);

const paginate = (rows, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedRows = rows.slice(start, end);

  return {
    rows: pagedRows,
    count: rows.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

/**
 * TC05 - Issue customized certificate
 * POST /api/v2/compliance/certificates/issue
 */
export const adminIssueComplianceCertificate = async (body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post('/api/v2/compliance/certificates/issue', body);

  const certificateId = `CERT-${String(MOCK_CERTIFICATES.length + 1).padStart(3, "0")}`;
  const created = {
    certificateId,
    learnerId: body.learnerId || "LRN-001",
    learnerName: body.learnerName || "Learner",
    courseId: body.courseId || "CRS-001",
    courseName: body.courseName || "Course",
    certificateType: body.certificateType || CERTIFICATE_TYPES[0],
    issueDate: new Date().toISOString(),
    format: "SVG",
    issuedBy: body.issuedBy || "Admin-001",
    verificationLink:
      body.verificationLink || `https://groomingcentre.com/verify/${certificateId}`,
    status: body.status || "Issued",
    remarks: body.remarks || "Certificate issued successfully",
    downloadUrl: `https://storage.example.com/certificates/${certificateId}.svg`,
    svgContent: "<svg>...</svg>",
  };

  MOCK_CERTIFICATES = [created, ...MOCK_CERTIFICATES];

  return {
    message: "Certificate issued successfully",
    certificate: created,
  };
};

/**
 * TC05 - Get all compliance certificates
 * GET /api/v2/compliance/certificates
 */
export const adminGetComplianceCertificates = async (params = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get('/api/v2/compliance/certificates', { params });

  const search = String(params.search || "").trim().toLowerCase();
  const status = params.status;
  const learnerId = params.learnerId;
  const courseId = params.courseId;

  const filtered = MOCK_CERTIFICATES.filter((certificate) => {
    const matchesSearch = search
      ? [
          certificate.certificateId,
          certificate.learnerName,
          certificate.courseName,
          certificate.courseId,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      : true;

    const matchesStatus = status ? certificate.status === status : true;
    const matchesLearner = learnerId ? certificate.learnerId === learnerId : true;
    const matchesCourse = courseId ? certificate.courseId === courseId : true;

    return matchesSearch && matchesStatus && matchesLearner && matchesCourse;
  });

  const pagination = paginate(filtered, params);

  return {
    certificates: pagination.rows,
    pagination: {
      count: pagination.count,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    },
  };
};

/**
 * TC05 - Get a certificate by id
 * GET /api/v2/compliance/certificates/{certificateId}
 */
export const adminGetComplianceCertificateById = async (certificateId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/api/v2/compliance/certificates/${certificateId}`);

  const certificate = findCertificate(certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  return { certificate };
};

/**
 * TC05 - Revoke issued certificate
 * POST /api/v2/compliance/certificates/{certificateId}/revoke
 */
export const adminRevokeComplianceCertificate = async (certificateId, body = {}) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/api/v2/compliance/certificates/${certificateId}/revoke`, body);

  const certificate = findCertificate(certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  const updated = {
    ...certificate,
    status: "Revoked",
    remarks: body.remarks || body.reason || "Certificate revoked by administrator",
  };

  MOCK_CERTIFICATES = MOCK_CERTIFICATES.map((item) =>
    item.certificateId === certificateId ? updated : item,
  );

  return {
    message: "Certificate revoked successfully",
    certificate: updated,
  };
};

/**
 * Existing project helper - now backed by TC05 mock list
 */
export const requestCertificateDetails = async (courseId, userId) => {
  const { certificates } = await adminGetComplianceCertificates({
    learnerId: userId,
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
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    certificate: {
      ...certificate,
      user: {
        id: certificate.learnerId,
        firstName,
        lastName,
      },
      course: {
        id: certificate.courseId,
        courseTitle: certificate.courseName,
      },
    },
  };
};

/**
 * Backward compatible alias used elsewhere in project
 */
export const createCertificate = async (body) => {
  const { message, certificate } = await adminIssueComplianceCertificate(body);
  return { message, data: certificate };
};

/**
 * Backward compatible alias used elsewhere in project
 */
export const CertificateList = async (params = {}) => {
  const { certificates, pagination } = await adminGetComplianceCertificates(params);
  return { certificate: { rows: certificates, ...pagination } };
};

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

/**
 * TC24 - Get certificates for the currently authenticated student
 * GET /api/v1/learner/certificates
 */
export const studentGetMyCertificates = async (params = {}) => {
  try {
    const { data } = await http.get("/v1/learner/certificates", { params });
    return data;
  } catch (_err) {
    const learnerId = params.learnerId || "LRN001";
    const courseId = params.courseId;
    const statusFilter = params.status;

    let certs = MOCK_STUDENT_CERTIFICATES.filter((c) => {
      const matchesCourse = courseId ? c.course_id === courseId : true;
      const matchesStatus = statusFilter ? c.status === statusFilter : true;
      return matchesCourse && matchesStatus;
    });

    const eligible = certs.filter((c) => c.status === "Eligible").length;
    const pending = certs.filter((c) => c.status === "Pending").length;
    const downloadable = certs.filter((c) => c.download_option === "Yes").length;
    const withVerification = certs.filter((c) => !!c.verification_link).length;

    return {
      learner_id: learnerId,
      certificates: certs,
      summary: {
        total_certificates: certs.length,
        eligible_certificates: eligible,
        pending_certificates: pending,
        downloadable_certificates: downloadable,
        verification_enabled_certificates: withVerification,
      },
    };
  }
};
