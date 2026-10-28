import { useCallback, useEffect, useState } from "react";

const readStored = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value && !isNaN(new Date(value).getTime()) ? value : null;
  } catch {
    return null;
  }
};

/**
 * Records when the student opened an attempt, so a countdown can run for the
 * full duration from that moment rather than from the scheduled startTime.
 * The start is kept in localStorage, so refreshing the page resumes the
 * countdown instead of restarting it. Call `clear` once the attempt is
 * submitted so the next attempt (e.g. a retake) starts fresh.
 *
 * @param {string|null} attemptKey - unique id of the exam/assessment; null while it is loading
 * @returns {[string|null, () => void]} ISO start time, and a function to forget it
 */
const useAttemptStart = (attemptKey) => {
  const storageKey = attemptKey ? `attemptStartedAt:${attemptKey}` : null;
  const [startedAt, setStartedAt] = useState(null);

  useEffect(() => {
    if (!storageKey) {
      setStartedAt(null);
      return;
    }
    let value = readStored(storageKey);
    if (!value) {
      value = new Date().toISOString();
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        // storage unavailable: the countdown still works, it just won't survive a refresh
      }
    }
    setStartedAt(value);
  }, [storageKey]);

  const clear = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return [startedAt, clear];
};

export default useAttemptStart;
