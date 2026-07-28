// Tracks exams/assessments that were created directly (bypassing the usual
// "Create and Submit" approval modal — e.g. the standalone exam shell created
// right before a batch question upload) so their listing page can still
// offer a one-time "Submit for Approval" action. Client-side only — the
// backend has no such field.
const STORAGE_KEY = "gclms:needsApprovalSubmission";

const storageKey = (kind, id) => `${kind}:${id}`;

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

export const markNeedsApprovalSubmission = (kind, id) => {
  if (!id) return;
  try {
    const all = readAll();
    all[storageKey(kind, id)] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage unavailable — flag just won't persist */
  }
};

export const needsApprovalSubmission = (kind, id) => {
  if (!id) return false;
  return Boolean(readAll()[storageKey(kind, id)]);
};

export const clearNeedsApprovalSubmission = (kind, id) => {
  if (!id) return;
  try {
    const all = readAll();
    delete all[storageKey(kind, id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage unavailable */
  }
};
