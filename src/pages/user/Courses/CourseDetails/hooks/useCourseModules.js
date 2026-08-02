import { useCallback, useEffect, useState } from "react";
import {
  adminListModules,
  adminListModuleExaminations,
} from "../../../../../services";
import { getEndTime } from "../../../../../utils";

const useCourseModules = (courseId) => {
  const [state, setState] = useState({ data: null, loading: false, err: null });

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setState({ data: null, loading: true, err: null });
    try {
      const { modules } = await adminListModules(courseId);
      const sorted = [...modules].sort(
        (a, b) => a.sequenceOrder - b.sequenceOrder
      );

      const modulesWithExams = await Promise.all(
        sorted.map(async (module) => {
          try {
            const { examinations } = await adminListModuleExaminations(
              module.id
            );
            return {
              ...module,
              examinations: examinations.map((e) => ({
                ...e,
                endTime: getEndTime(e.startTime, e.duration),
                hasCompleted: false,
                itemType: "examination",
              })),
            };
          } catch {
            return { ...module, examinations: [] };
          }
        })
      );

      setState({ data: modulesWithExams, loading: false, err: null });
    } catch (err) {
      setState({ data: null, loading: false, err: err.message });
    }
  }, [courseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { modules: state, refetch: fetch };
};

export default useCourseModules;
