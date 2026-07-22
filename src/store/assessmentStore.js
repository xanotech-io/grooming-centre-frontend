import { create } from "zustand";

const useAssessmentStore = create((set) => ({
  assessment: null,
  sections: [],
  // Holds an exam/assessment's details-form values in memory between the
  // "Next" click and "Create and Submit" — nothing is sent to the backend
  // until then, so this is deliberately not persisted anywhere.
  pendingCreate: null,
  // Same deferral as `pendingCreate`, but for editing a shell that already
  // exists — the actual update call is held here until "Next" on the details
  // form is followed all the way through the question step and submitted.
  pendingEdit: null,
  // Set right before navigating to a "create assessment/exam/standalone exam"
  // details page from the Question Bank, so the first question form on the
  // other side of "Next" can prefill itself from these bank questions (the
  // first one) and queue the rest.
  fromBankQuestionIds: [],
  // Toggled by the "Question Bank" header button while an exam/assessment is
  // still pending creation/edit, so QuestionsPage can offer a multi-select
  // bank picker in place instead of navigating away and losing the queue.
  isBankPickerOpen: false,

  setAssessment: (assessment) =>
    set({
      assessment,
      sections: Array.isArray(assessment?.sections) ? assessment.sections : [],
    }),

  clearAssessment: () => set({ assessment: null, sections: [] }),

  setPendingCreate: (pendingCreate) => set({ pendingCreate }),
  clearPendingCreate: () => set({ pendingCreate: null }),

  setPendingEdit: (pendingEdit) => set({ pendingEdit }),
  clearPendingEdit: () => set({ pendingEdit: null }),

  setFromBankQuestionIds: (fromBankQuestionIds) => set({ fromBankQuestionIds }),
  clearFromBankQuestionIds: () => set({ fromBankQuestionIds: [] }),

  openBankPicker: () => set({ isBankPickerOpen: true }),
  closeBankPicker: () => set({ isBankPickerOpen: false }),
}));

export default useAssessmentStore;
