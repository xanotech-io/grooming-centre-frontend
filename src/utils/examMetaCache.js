// The backend's GET responses for an already-real exam/assessment don't
// reliably return examType/questionQuantity/markingTemplateId at all —
// confirmed via a real GET /v1/assessment/admin/:id response missing both
// `sections` and `examType` entirely. Without these, the whole Exam Type
// feature (section tabs, per-type Quantity restriction) goes dark the
// moment a pending exam/assessment becomes real, even though it was
// created with a real Exam Type. Cached here at creation/edit time (when we
// DO have these values, from pendingCreate/pendingEdit.body) and read back
// as a fallback wherever the fetched record itself comes up empty. Client-
// side only — same pattern as pendingWorkflowSubmission.js's
// needsApprovalSubmission.
const STORAGE_KEY = "gclms:examMetaCache";

const storageKey = (kind, id) => `${kind}:${id}`;

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

export const markExamMeta = (kind, id, meta) => {
  if (!id) return;
  try {
    const all = readAll();
    all[storageKey(kind, id)] = meta;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage unavailable — the fallback just won't have anything */
  }
};

export const getExamMeta = (kind, id) => {
  if (!id) return null;
  return readAll()[storageKey(kind, id)] || null;
};
