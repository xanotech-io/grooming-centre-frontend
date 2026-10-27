import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@chakra-ui/toast";
import { postScreenWarning, postSystemFlag } from "../services";

const AUTO_SUBMIT_ACTIONS = [
  "auto_submit_pending_review",
  "auto_submit_and_show_marks",
];

// Drop into an exam-taking screen to police tab switches / window blurs
// during a live exam session. Each occurrence is reported to
// POST /proctoring-v2/screen-warning, which owns the warning counter: the
// student sees the server's message, and when it answers `forceSubmit` the
// exam is locked and irreversibly submitted — the caller only needs to render
// `isBlocked` to lock the UI and supply `onAutoSubmit(nextAction, response)`
// to trigger its own submit handler.
//
// `examType` is "examination" | "standalone_examination" | "assessment".
// `reportSystemFlag(description)` logs non-screen integrity events (e.g. a
// second face from a proctoring tool) without counting as a warning.
const useLiveProctoring = ({
  examId,
  examType,
  enabled = true,
  onAutoSubmit,
} = {}) => {
  const toast = useToast();
  const [isBlocked, setIsBlocked] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  const blockedRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastReportRef = useRef(0);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  onAutoSubmitRef.current = onAutoSubmit;

  const reportScreenWarning = useCallback(
    async (description) => {
      if (!enabled || !examId || blockedRef.current || inFlightRef.current) return;

      // A tab switch fires both `blur` and `visibilitychange` back-to-back —
      // treat anything within this window as the same incident.
      const now = Date.now();
      if (now - lastReportRef.current < 1000) return;
      lastReportRef.current = now;

      inFlightRef.current = true;
      try {
        const response = await postScreenWarning({ examId, examType, description });

        setWarningCount(response?.warningNumber ?? ((count) => count + 1));
        const nextAction = response?.nextAction;
        const fallbackMessage =
          response?.warningNumber && response?.maxWarnings
            ? `Warning ${response.warningNumber} of ${response.maxWarnings}: leaving the exam screen is not allowed.`
            : "Leaving the exam screen is not allowed.";

        if (response?.forceSubmit || AUTO_SUBMIT_ACTIONS.includes(nextAction)) {
          blockedRef.current = true;
          setIsBlocked(true);
          toast({
            title: "Exam Auto-Submitted",
            description: response?.message || fallbackMessage,
            status: "error",
            position: "top",
            duration: 8000,
            isClosable: true,
          });
          try {
            await onAutoSubmitRef.current?.(
              nextAction ?? "auto_submit_pending_review",
              response
            );
          } catch (submitErr) {
            console.error("[useLiveProctoring] auto-submit failed", submitErr);
          }
        } else {
          toast({
            title: "Proctoring Warning",
            description: response?.message || fallbackMessage,
            status: "warning",
            position: "top",
            duration: 6000,
            isClosable: true,
          });
        }
      } catch (err) {
        // The server owns the warning count, so a failed request is not
        // counted locally — just tell the student and leave a trace.
        console.error("[useLiveProctoring] screen-warning request failed", err);
        toast({
          title: "Proctoring Warning",
          description: "Leaving the exam screen is not allowed.",
          status: "warning",
          position: "top",
          duration: 6000,
          isClosable: true,
        });
      } finally {
        inFlightRef.current = false;
      }
    },
    [enabled, examId, examType, toast]
  );

  const reportSystemFlag = useCallback(
    async (description) => {
      if (!examId) return;
      try {
        await postSystemFlag({ examId, examType, description });
      } catch (err) {
        console.error("[useLiveProctoring] system-flag request failed", err);
      }
    },
    [examId, examType]
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const handleVisibilityChange = () => {
      if (document.hidden) reportScreenWarning("tab switched");
    };
    // Clicking into an embedded iframe (video, PDF) also blurs the window, so
    // wait a tick to see where focus went before treating it as leaving.
    const handleBlur = () => {
      setTimeout(() => {
        if (document.hidden) return; // covered by visibilitychange
        if (document.activeElement?.tagName === "IFRAME") return;
        reportScreenWarning("window lost focus");
      }, 0);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, reportScreenWarning]);

  return { isBlocked, warningCount, reportSystemFlag };
};

export default useLiveProctoring;
