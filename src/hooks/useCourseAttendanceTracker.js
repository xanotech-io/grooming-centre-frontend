import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../contexts";
import { exitCourse, exitCourseOnUnload } from "../services";

// Every student-facing course screen (lessons, assessments, exams, projects)
// lives under `/courses/take/:course_id/...`.
const COURSE_PATH_REGEX = /^\/courses\/take\/([^/]+)/;

/**
 * Course attendance = the time a student opens a course (entry) until they
 * leave it (exit). The backend opens the session itself when the course is
 * accessed; this hook only tells it when the student leaves, via
 * `POST /course/:courseId/exit` — the only thing that sets exitTime/duration.
 * A session ends when the student navigates out of the course (another
 * course, the dashboard, anywhere else), logs out, or closes/refreshes the
 * tab. Moving between lessons/assessments of the same course keeps one session.
 */
const useCourseAttendanceTracker = () => {
  const { pathname } = useLocation();
  const { state } = useApp();
  const userId = state?.user?.id;

  const activeCourseRef = useRef(null);

  const courseId = userId ? pathname.match(COURSE_PATH_REGEX)?.[1] : null;

  useEffect(() => {
    const flush = (send) => {
      const activeCourseId = activeCourseRef.current;
      activeCourseRef.current = null;
      if (activeCourseId) send(activeCourseId);
    };

    const start = () => {
      if (courseId) activeCourseRef.current = courseId;
    };

    const handlePageHide = () => flush(exitCourseOnUnload);
    // Page restored from the back/forward cache after a `pagehide` flush
    const handlePageShow = (e) => e.persisted && start();

    start();
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      // Left this course (or logged out) inside the SPA
      flush((id) => exitCourse(id).catch(() => {}));
    };
  }, [courseId, userId]);
};

export default useCourseAttendanceTracker;
