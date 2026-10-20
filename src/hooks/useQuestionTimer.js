import { useCallback, useEffect, useRef } from "react";

/**
 * Tracks how long a student spends on each question.
 * The clock for a question starts when it becomes the current question
 * (entered) and stops when the student moves to another question (left).
 * Revisiting a question adds to its running total.
 *
 * @param {string} currentQuestionId - id of the question currently on screen
 * @returns {(questionId: string) => number} seconds spent on `questionId`
 */
const useQuestionTimer = (currentQuestionId) => {
  const totalsRef = useRef({});
  const activeRef = useRef(null);

  useEffect(() => {
    if (!currentQuestionId) return;
    const totals = totalsRef.current;
    activeRef.current = { id: currentQuestionId, enteredAt: Date.now() };

    return () => {
      const active = activeRef.current;
      if (!active) return;
      totals[active.id] = (totals[active.id] || 0) + (Date.now() - active.enteredAt);
      activeRef.current = null;
    };
  }, [currentQuestionId]);

  return useCallback((questionId) => {
    let ms = totalsRef.current[questionId] || 0;
    const active = activeRef.current;
    // Question still open at submit time: count up to now
    if (active && active.id === questionId) ms += Date.now() - active.enteredAt;
    return Math.round(ms / 1000);
  }, []);
};

export default useQuestionTimer;
