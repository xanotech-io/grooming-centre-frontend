import { useState } from "react";

const KEY = (assessmentId) => `_asmt_sections_${assessmentId}`;

const load = (assessmentId) => {
  try {
    const raw = localStorage.getItem(KEY(assessmentId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { sections: [], assignments: {} };
};

export const useSections = (assessmentId) => {
  const [state, setState] = useState(() => load(assessmentId));

  const persist = (next) => {
    setState(next);
    try {
      localStorage.setItem(KEY(assessmentId), JSON.stringify(next));
    } catch {}
  };

  const add = (title) => {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    persist({ ...state, sections: [...state.sections, { id, title }] });
    return id;
  };

  const rename = (sectionId, title) =>
    persist({
      ...state,
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, title } : s
      ),
    });

  const remove = (sectionId) => {
    const assignments = { ...state.assignments };
    Object.keys(assignments).forEach((qId) => {
      if (assignments[qId] === sectionId) delete assignments[qId];
    });
    persist({
      sections: state.sections.filter((s) => s.id !== sectionId),
      assignments,
    });
  };

  const assign = (questionId, sectionId) =>
    persist({
      ...state,
      assignments: { ...state.assignments, [questionId]: sectionId },
    });

  const unassign = (questionId) => {
    const assignments = { ...state.assignments };
    delete assignments[questionId];
    persist({ ...state, assignments });
  };

  return {
    sections: state.sections,
    assignments: state.assignments,
    add,
    rename,
    remove,
    assign,
    unassign,
  };
};
