/**
 * Assessment-marking results carry instructor feedback inside
 * `questionRemarks` (one entry per remarked question), not the top-level
 * `remark` field, which the API leaves null.
 */
export const getResultRemark = (result) => {
  if (!result) return null;

  const questionRemarks = Array.isArray(result.questionRemarks) ? result.questionRemarks : [];
  const remarks = questionRemarks.filter((r) => r?.remark);

  if (remarks.length === 1) return remarks[0].remark;
  if (remarks.length > 1) {
    return remarks.map((r) => `${r.question}: ${r.remark}`).join("\n\n");
  }

  return result.remark ?? null;
};
