import { create } from "zustand";

const useAssessmentStore = create((set) => ({
  assessment: null,
  sections: [],
  // Holds an exam/assessment's details-form values in memory between the
  // "Next" click and "Create and Submit" — nothing is sent to the backend
  // until then, so this is deliberately not persisted anywhere.
  pendingCreate: null,

  setAssessment: (assessment) =>
    set({
      assessment,
      sections: Array.isArray(assessment?.sections) ? assessment.sections : [],
    }),

  clearAssessment: () => set({ assessment: null, sections: [] }),

  setPendingCreate: (pendingCreate) => set({ pendingCreate }),
  clearPendingCreate: () => set({ pendingCreate: null }),
}));

export default useAssessmentStore;
