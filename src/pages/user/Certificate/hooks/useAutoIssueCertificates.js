import { useEffect, useRef } from "react";
import { certV2ListCertificates, certV2IssueCertificate } from "../../../../services";

/**
 * Fires certV2IssueCertificate for any completed course that doesn't yet
 * have a certificate record. Best-effort, frontend-side "auto issue on
 * completion" — fires the next time the student views a completed-courses
 * list, since there is no backend completion event/webhook to hook into.
 */
const useAutoIssueCertificates = (completedCourses, userId) => {
  const attempted = useRef(new Set());

  useEffect(() => {
    if (!userId || !completedCourses?.length) return;

    const courseIds = completedCourses
      .map((course) => course.id)
      .filter((courseId) => courseId && !attempted.current.has(courseId));

    if (!courseIds.length) return;

    let cancelled = false;

    (async () => {
      let existingCourseIds = new Set();
      try {
        const result = await certV2ListCertificates({ userId, limit: 200 });
        const certificates = result?.certificates ?? result?.rows ?? [];
        existingCourseIds = new Set(certificates.map((cert) => cert.courseId));
      } catch (err) {
        console.error("useAutoIssueCertificates: failed to list existing certificates", err);
        return;
      }

      if (cancelled) return;

      for (const courseId of courseIds) {
        attempted.current.add(courseId);
        if (existingCourseIds.has(courseId)) continue;

        try {
          await certV2IssueCertificate({
            userId,
            courseId,
            certificateType: "Completion",
            remarks: "Auto-issued on course completion",
          });
        } catch (err) {
          console.error(`useAutoIssueCertificates: failed to auto-issue certificate for course ${courseId}`, err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [completedCourses, userId]);
};

export default useAutoIssueCertificates;
