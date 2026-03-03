import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { requestLessonDetails } from "../../../../services";
import { useCache } from "../../../../contexts";
import useComponentIsMount from "../../../../hooks/useComponentIsMount";

const useViewLessonInfo = () => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();
  const { lessonId } = useParams();
  const lessonIsNew = lessonId === "new";

  const [lessonDetails, setLessonDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });

  const fetcher = useCallback(async () => {
    const { lesson } = await requestLessonDetails(lessonId);
    return lesson;
  }, [lessonId]);
  const fetchLessonDetails = useCallback(async () => {
    setLessonDetails({ loading: true });

    try {
      const lessonDetails = await handleGetOrSetAndGet(lessonId, fetcher);
      if (componentIsMount) setLessonDetails({ data: lessonDetails });
    } catch (err) {
      if (componentIsMount) setLessonDetails({ err: err.message });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, componentIsMount]);

  useEffect(() => {
    if (!lessonIsNew) fetchLessonDetails();
  }, [fetchLessonDetails, lessonIsNew]);

  const lesson = lessonDetails.data;
  const isLoading = lessonDetails.loading;
  const error = lessonDetails.err;

  return {
    lesson,
    isLoading,
    error,
  };
};
export default useViewLessonInfo;
