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
  // other side of "Next" can prefill itself from this bank question.
  fromBankQuestionId: null,

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

  setFromBankQuestionId: (fromBankQuestionId) => set({ fromBankQuestionId }),
  clearFromBankQuestionId: () => set({ fromBankQuestionId: null }),
}));

export default useAssessmentStore;
