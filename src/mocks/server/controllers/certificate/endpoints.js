import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  requestCertificateDetailsRes_CourseId_1,
  requestCertificateDetailsRes_CourseId_2,
  requestCertificateDetailsRes_CourseId_3,
  certificatesV2Seed,
  buildCertificatesV2Summary,
  myCertificatesFixture,
  certificateVerifyFixtures,
} from "./responses";

const requestCertificateDetailsRes_CourseId = [
  rest.get(
    getUrl("/courses/courseId_1/certificate"),
    handleSuccessResponse(requestCertificateDetailsRes_CourseId_1)
  ),
  rest.get(
    getUrl("/courses/courseId_2/certificate"),
    handleSuccessResponse(requestCertificateDetailsRes_CourseId_2)
  ),
  rest.get(
    getUrl("/courses/courseId_3/certificate"),
    handleSuccessResponse(requestCertificateDetailsRes_CourseId_3)
  ),
];

// ── Certificate V2 (mock/dev fallback) ─────────────────────────────────────────
// In-memory store so issue/revoke/reissue actually mutate state during local dev.

let certificatesV2 = [...certificatesV2Seed];
let nextCertNumber = certificatesV2.length + 1;

const findCertificate = (certificateId) =>
  certificatesV2.find((c) => c.certificateId === certificateId);

const certificateV2Handlers = [
  rest.get(getUrl("/v1/certificate-v2"), (req, res, ctx) => {
    const { searchParams } = req.url;
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");
    const certificateType = searchParams.get("certificateType");
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const filtered = certificatesV2.filter((c) => {
      if (userId && c.userId !== userId) return false;
      if (courseId && c.courseId !== courseId) return false;
      if (certificateType && c.certificateType !== certificateType) return false;
      if (status && c.status !== status) return false;
      return true;
    });

    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return res(
      ctx.status(200),
      ctx.json({
        certificates: paged,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
      })
    );
  }),

  rest.post(getUrl("/v1/certificate-v2/issue"), (req, res, ctx) => {
    const body = req.body || {};
    const certificate = {
      certificateId: `CERT${String(nextCertNumber++).padStart(3, "0")}`,
      userId: body.userId,
      learnerId: body.userId,
      learnerName: body.learnerName || body.userId,
      courseId: body.courseId,
      courseName: body.courseName || body.courseId,
      certificateType: body.certificateType || "Participation",
      issueDate: new Date().toISOString().slice(0, 10),
      issuedBy: "Admin-001",
      status: "Issued",
      remarks: body.remarks || "",
      verificationLink: `/certificate/verify/tok-${Math.random().toString(36).slice(2, 10)}`,
    };
    certificatesV2 = [certificate, ...certificatesV2];
    return res(ctx.status(201), ctx.json({ message: "Certificate issued", certificate }));
  }),

  rest.patch(getUrl("/v1/certificate-v2/:certificateId/revoke"), (req, res, ctx) => {
    const { certificateId } = req.params;
    const body = req.body || {};
    const certificate = findCertificate(certificateId);
    if (!certificate) {
      return res(ctx.status(404), ctx.json({ message: "Certificate not found" }));
    }
    certificate.status = "Revoked";
    certificate.remarks = body.reason || certificate.remarks;
    return res(ctx.status(200), ctx.json({ message: "Certificate revoked", certificate }));
  }),

  rest.patch(getUrl("/v1/certificate-v2/:certificateId/reissue"), (req, res, ctx) => {
    const { certificateId } = req.params;
    const certificate = findCertificate(certificateId);
    if (!certificate) {
      return res(ctx.status(404), ctx.json({ message: "Certificate not found" }));
    }
    certificate.status = "Issued";
    certificate.issueDate = new Date().toISOString().slice(0, 10);
    certificate.verificationLink = `/certificate/verify/tok-${Math.random().toString(36).slice(2, 10)}`;
    return res(ctx.status(200), ctx.json({ message: "Certificate re-issued", certificate }));
  }),

  rest.get(getUrl("/v1/certificate-v2/download/:certificateId"), (req, res, ctx) => {
    const { certificateId } = req.params;
    const certificate = findCertificate(certificateId);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="100%" height="100%" fill="#fff" stroke="#660066" stroke-width="8"/>
      <text x="50%" y="45%" text-anchor="middle" font-size="28" fill="#101928">${certificate?.learnerName || "Learner"}</text>
      <text x="50%" y="55%" text-anchor="middle" font-size="16" fill="#4A5568">${certificate?.courseName || ""}</text>
    </svg>`;
    return res(ctx.status(200), ctx.set("Content-Type", "image/svg+xml"), ctx.body(svg));
  }),

  rest.get(getUrl("/v1/certificate-v2/verify/:token"), (req, res, ctx) => {
    const { token } = req.params;
    const issuedCert = certificatesV2.find((c) => c.verificationLink?.endsWith(token));

    if (issuedCert) {
      if (issuedCert.status === "Revoked") {
        return res(ctx.status(410), ctx.json({ message: "This certificate has been revoked" }));
      }
      return res(
        ctx.status(200),
        ctx.json({
          studentName: issuedCert.learnerName,
          courseName: issuedCert.courseName,
          certificateType: `Certificate of ${issuedCert.certificateType}`,
          issueDate: issuedCert.issueDate,
          issuer: issuedCert.issuedBy,
          status: issuedCert.status,
        })
      );
    }

    const fixture = certificateVerifyFixtures[token];
    if (fixture) return res(ctx.status(200), ctx.json(fixture));

    return res(ctx.status(404), ctx.json({ message: "Certificate not found" }));
  }),

  rest.get(getUrl("/v1/certificate-v2/report/summary"), (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(buildCertificatesV2Summary(certificatesV2)));
  }),

  rest.get(getUrl("/v1/certificate-v2/my-certificates"), handleSuccessResponse(myCertificatesFixture)),
];

const certificate = [...requestCertificateDetailsRes_CourseId, ...certificateV2Handlers];

export default certificate;
