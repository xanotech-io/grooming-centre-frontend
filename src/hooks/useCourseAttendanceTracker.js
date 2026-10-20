import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../contexts";
import {
  recordStudentAttendance,
  recordStudentAttendanceOnUnload,
} from "../services";

// Every student-facing course screen (lessons, assessments, exams, projects)
// lives under `/courses/take/:course_id/...`.
const COURSE_PATH_REGEX = /^\/courses\/take\/([^/]+)/;

const pad = (n) => String(n).padStart(2, "0");
const toDateString = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeString = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/**
 * Course attendance = the time a student opens a course (entry) until they
 * leave it (exit). A session starts when the route enters
 * `/courses/take/:course_id` and ends when the student navigates out of that
 * course, switches to another course, logs out, or closes/refreshes the tab.
 * Moving between lessons/assessments of the same course keeps one session.
 */
const useCourseAttendanceTracker = () => {
  const { pathname } = useLocation();
  const { state } = useApp();
  const userId = state?.user?.id;

  const sessionRef = useRef(null);

  const courseId = userId ? pathname.match(COURSE_PATH_REGEX)?.[1] : null;

  useEffect(() => {
    const flush = (send) => {
      const session = sessionRef.current;
      sessionRef.current = null;
      if (!session) return;

      const exit = new Date();
      send({
        studentId: session.userId,
        courseId: session.courseId,
        sessionDate: toDateString(session.entry),
        attendanceStatus: "Present",
        deliveryMode: "Virtual",
        entryTime: toTimeString(session.entry),
        exitTime: toTimeString(exit),
      });
    };

    const start = () => {
      if (courseId && !sessionRef.current) {
        sessionRef.current = { userId, courseId, entry: new Date() };
      }
    };

    const handlePageHide = () => flush(recordStudentAttendanceOnUnload);
    // Page restored from the back/forward cache after a `pagehide` flush
    const handlePageShow = (e) => e.persisted && start();

    start();
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      // Left this course (or logged out) inside the SPA
      flush((body) => recordStudentAttendance(body).catch(() => {}));
    };
  }, [courseId, userId]);
};

export default useCourseAttendanceTracker;
