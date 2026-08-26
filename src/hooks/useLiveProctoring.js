import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@chakra-ui/toast";
import { postScreenWarning } from "../services";
import { getGeolocationString } from "../utils";

const AUTO_SUBMIT_ACTIONS = [
  "auto_submit_pending_review",
  "auto_submit_and_show_marks",
];

// Drop into an exam-taking screen to police tab switches / window blurs
// during a live exam session. Reports each occurrence to the proctoring
// service and, when told to by the server, silently and irreversibly
// submits the exam — the caller only needs to render `isBlocked` to lock
// the UI and supply `onAutoSubmit` to trigger its own submit handler.
const useLiveProctoring = ({ examId, enabled = true, onAutoSubmit } = {}) => {
  const toast = useToast();
  const [isBlocked, setIsBlocked] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  const blockedRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastReportRef = useRef(0);
  const localStrikeRef = useRef(0);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  onAutoSubmitRef.current = onAutoSubmit;

  const reportEvent = useCallback(
    async (eventType) => {
      if (!enabled || !examId || blockedRef.current || inFlightRef.current) return;

      // A tab switch fires both `blur` and `visibilitychange` back-to-back —
      // treat anything within this window as the same incident.
      const now = Date.now();
      if (now - lastReportRef.current < 1000) return;
      lastReportRef.current = now;

      inFlightRef.current = true;
      try {
        const geolocation = await getGeolocationString();
        const response = await postScreenWarning({
          examId,
          eventType,
          timestamp: new Date().toISOString(),
          ...(geolocation ? { geolocation } : {}),
        });

        setWarningCount((count) => count + 1);
        const nextAction = response?.nextAction;

        if (AUTO_SUBMIT_ACTIONS.includes(nextAction)) {
          blockedRef.current = true;
          setIsBlocked(true);
          toast({
            title: "Exam Auto-Submitted",
            description:
              response?.message ||
              "Proctoring violations were detected and your exam has been submitted.",
            status: "error",
            position: "top",
            duration: null,
            isClosable: false,
          });
          try {
            await onAutoSubmitRef.current?.(nextAction, response);
          } catch (submitErr) {
            console.error("[useLiveProctoring] auto-submit failed", submitErr);
          }
        } else {
          toast({
            title: "Proctoring Warning",
            description:
              response?.message ||
              "Leaving this screen has been flagged. Continued violations may auto-submit your exam.",
            status: "warning",
            position: "top",
            duration: 6000,
            isClosable: true,
          });
        }
      } catch (err) {
        // TODO: endpoint POST /v1/proctoring-v2/screen-warning not yet live —
        // fall back to a local 3-strikes counter so the feature still gives
        // the student visible feedback instead of doing nothing at all.
        console.warn(
          "[useLiveProctoring] screen-warning request failed, using local fallback",
          err
        );
        localStrikeRef.current += 1;
        setWarningCount((count) => count + 1);

        if (localStrikeRef.current >= 3) {
          blockedRef.current = true;
          setIsBlocked(true);
          toast({
            title: "Exam Auto-Submitted",
            description:
              "Repeatedly leaving this screen was detected and your exam has been submitted.",
            status: "error",
            position: "top",
            duration: null,
            isClosable: false,
          });
          try {
            await onAutoSubmitRef.current?.("auto_submit_pending_review", null);
          } catch (submitErr) {
            console.error("[useLiveProctoring] auto-submit failed", submitErr);
          }
        } else {
          toast({
            title: "Proctoring Warning",
            description: `Leaving this screen has been flagged (${localStrikeRef.current}/3). Continued violations will auto-submit your exam.`,
            status: "warning",
            position: "top",
            duration: 6000,
            isClosable: true,
          });
        }
      } finally {
        inFlightRef.current = false;
      }
    },
    [enabled, examId, toast]
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") reportEvent("tab_switch");
    };
    const handleBlur = () => reportEvent("window_blur");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, reportEvent]);

  return { isBlocked, warningCount };
};

export default useLiveProctoring;
