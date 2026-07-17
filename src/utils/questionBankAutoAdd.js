// Lets an admin opt an exam/assessment/standalone-exam into auto-adding every
// question created under it to the Question Bank, without re-checking a
// per-question box each time. Set on the create-exam form, read on the
// create-question form. Client-side only — the backend has no such field.
const STORAGE_KEY = "gclms:autoAddToQuestionBank";

const storageKey = (examType, id) => `${examType}:${id}`;

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

export const setAutoAddToBank = (examType, id) => {
  if (!id) return;
  try {
    const all = readAll();
    all[storageKey(examType, id)] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage unavailable — auto-add just won't persist */
  }
};

export const isAutoAddToBank = (examType, id) => {
  if (!id) return false;
  return Boolean(readAll()[storageKey(examType, id)]);
};
