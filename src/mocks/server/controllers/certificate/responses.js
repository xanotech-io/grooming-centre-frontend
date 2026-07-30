export const requestCertificateDetailsRes_CourseId_1 = {
  data: {
    courseId: "courseId_1",
    title: "Web Design & Development Crash Course 2021",
    name: "Stanley Chinedu",
    endDate: "May 2021",
  },
};

export const requestCertificateDetailsRes_CourseId_2 = {
  data: {
    courseId: "courseId_2",
    title: "Web Design & Development Crash Course 2021",
    name: "Stanley Chinedu",
    endDate: "April 2021",
  },
};

export const requestCertificateDetailsRes_CourseId_3 = {
  data: {
    courseId: "courseId_3",
    title: "Web Design & Development Crash Course 2021",
    name: "Stanley Chinedu",
    endDate: "June 2021",
  },
};

// ── Certificate V2 fixtures (mock/dev fallback for certificate-v2 API) ────────

export const certificatesV2Seed = [
  {
    certificateId: "CERT001",
    userId: "user-001",
    learnerId: "user-001",
    learnerName: "Nmorsi Donald",
    courseId: "course-001",
    courseName: "Data Analytics for Beginners",
    certificateType: "Participation",
    issueDate: "2025-11-14",
    issuedBy: "Admin-001",
    status: "Issued",
    remarks: "",
    verificationLink: "/certificate/verify/tok-cert001",
  },
  {
    certificateId: "CERT002",
    userId: "user-002",
    learnerId: "user-002",
    learnerName: "Jane Okoro",
    courseId: "course-002",
    courseName: "Customer Service Essentials",
    certificateType: "Participation",
    issueDate: "2025-11-10",
    issuedBy: "Instructor-002",
    status: "Issued",
    remarks: "",
    verificationLink: "/certificate/verify/tok-cert002",
  },
  {
    certificateId: "CERT003",
    userId: "user-003",
    learnerId: "user-003",
    learnerName: "Emeka Uche",
    courseId: "course-003",
    courseName: "Agriculture Fundamentals",
    certificateType: "Completion",
    issueDate: "2025-11-13",
    issuedBy: "Admin-001",
    status: "Revoked",
    remarks: "Issued in error to wrong course cohort",
    verificationLink: "/certificate/verify/tok-cert003",
  },
  {
    certificateId: "CERT004",
    userId: "user-004",
    learnerId: "user-004",
    learnerName: "Aisha Bello",
    courseId: "course-004",
    courseName: "Digital Literacy Program",
    certificateType: "Achievement",
    issueDate: null,
    issuedBy: "Admin-001",
    status: "Pending",
    remarks: "SVG generation delayed - template service timeout",
    verificationLink: null,
  },
];

export const buildCertificatesV2Summary = (certificates) => {
  const totalIssued = certificates.filter((c) => c.status === "Issued").length;
  const totalPending = certificates.filter((c) => c.status === "Pending").length;
  const totalRevoked = certificates.filter((c) => c.status === "Revoked").length;
  return {
    totalIssued,
    totalPending,
    totalRevoked,
    svgSuccessRate: 92,
    totalVerificationRequests: 37,
  };
};

export const myCertificatesFixture = {
  certificates: [
    {
      certificate_id: "CERT001",
      certificate_title: "Certificate of Participation",
      course_title: "Data Analytics for Beginners",
      status: "Eligible",
      completion_date: "2025-11-12",
      issued_date: "2025-11-14",
      expiry_date: null,
      download_option: "Yes",
      verification_link: "/certificate/verify/tok-cert001",
    },
    {
      certificate_id: "CERT004",
      certificate_title: "Certificate of Achievement",
      course_title: "Digital Literacy Program",
      status: "Pending",
      completion_date: "2025-11-13",
      issued_date: null,
      expiry_date: null,
      download_option: "No",
      verification_link: null,
    },
  ],
  summary: {
    total_certificates: 2,
    eligible_certificates: 1,
    pending_certificates: 1,
    downloadable_certificates: 1,
    verification_enabled_certificates: 1,
  },
};

export const certificateVerifyFixtures = {
  "tok-cert001": {
    studentName: "Nmorsi Donald",
    courseName: "Data Analytics for Beginners",
    certificateType: "Certificate of Participation",
    issueDate: "2025-11-14",
    issuer: "Admin-001",
    status: "Issued",
  },
  "tok-cert002": {
    studentName: "Jane Okoro",
    courseName: "Customer Service Essentials",
    certificateType: "Certificate of Participation",
    issueDate: "2025-11-10",
    issuer: "Instructor-002",
    status: "Issued",
  },
};
