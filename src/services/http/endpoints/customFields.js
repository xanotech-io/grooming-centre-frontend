import { http } from "../http";

const BASE = "/v1/custom-fields-v2";

// Custom fields are capped at 2 per entity. A definition doesn't carry its
// own value store — it's assigned to one of two fixed generic slots
// (customFieldOne/customFieldTwo), and the value lives directly on the
// course/user-profile record under that same slot key.
export const CUSTOM_FIELD_SLOTS = ["customFieldOne", "customFieldTwo"];
export const MAX_CUSTOM_FIELDS_PER_ENTITY = CUSTOM_FIELD_SLOTS.length;

export const getCustomFieldsKpis = async () => {
  const { data } = await http.get(`${BASE}/kpis`);
  return data;
};

export const listCustomFields = async (params) => {
  const { data } = await http.get(BASE, { params });
  return data;
};

export const getCustomField = async (fieldId) => {
  const { data } = await http.get(`${BASE}/${fieldId}`);
  return data;
};

// Backend auto-assigns the next open slot for `payload.entity` and returns
// it as `slot` on the created definition; rejects with 409 once both slots
// for that entity are taken.
export const createCustomField = async (payload) => {
  const { data } = await http.post(BASE, payload);
  return data;
};

export const updateCustomField = async (fieldId, payload) => {
  const { data } = await http.patch(`${BASE}/${fieldId}`, payload);
  return data;
};

export const deleteCustomField = async (fieldId) => {
  const { data } = await http.delete(`${BASE}/${fieldId}`);
  return data;
};

// Active slot definitions for a given entity type, sorted by slot
// (customFieldOne, customFieldTwo) — used to render the two generic inputs
// on the course-create and user-profile forms. Values themselves aren't
// fetched here; they come back on the course/user record itself.
export const getActiveCustomFieldSlots = async (entity) => {
  const res = await listCustomFields({ entity, status: "active" });
  const payload = res?.data || res;
  const rawItems = Array.isArray(payload?.fields) ? payload.fields : Array.isArray(payload) ? payload : [];
  // Filter client-side too, in case the backend ignores entity/status query params.
  const items = rawItems.filter((f) => f.entity === entity && f.status !== "inactive");

  const bySlot = CUSTOM_FIELD_SLOTS.map((slot) => items.find((f) => f.slot === slot) || null);
  if (bySlot.some(Boolean)) return bySlot;

  // Backend hasn't assigned/returned a `slot` yet — infer it from creation
  // order (oldest active field for this entity = customFieldOne, etc.) so
  // the forms still work ahead of that backend change.
  const byCreatedAt = [...items].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
  return CUSTOM_FIELD_SLOTS.map((slot, index) =>
    byCreatedAt[index] ? { ...byCreatedAt[index], slot } : null
  );
};
