import { create } from "zustand";

const useAssessmentStore = create((set) => ({
  assessment: null,
  sections: [],

  setAssessment: (assessment) =>
    set({
      assessment,
      sections: Array.isArray(assessment?.sections) ? assessment.sections : [],
    }),

  clearAssessment: () => set({ assessment: null, sections: [] }),
}));

export default useAssessmentStore;
