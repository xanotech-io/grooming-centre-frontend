// Attendance is one row per course session; lessons opened during it are
// appended to `lessonsVisited: [{ lessonId, title, visitedAt }]` on that row
// (there's no longer a separate per-lesson attendance row).
export const getLessonsVisited = (record) =>
  Array.isArray(record?.lessonsVisited) ? record.lessonsVisited : [];

// Comma-separated lesson titles for table cells/exports. Falls back to the
// old single-lesson fields for rows recorded before the change.
export const formatLessonsVisited = (record) => {
  const titles = getLessonsVisited(record)
    .map((l) => l?.title)
    .filter(Boolean);
  if (titles.length) return titles.join(", ");
  return record?.lessonTitle ?? record?.lesson?.title ?? "—";
};
