import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useCache, useTakeCourse } from "../../../../../contexts";
import useComponentIsMount from "../../../../../hooks/useComponentIsMount";
import {
  requestEndLesson,
  requestLessonDetails,
} from "../../../../../services";

const usePlayer = ({ lessonHasBeenCompleted }) => {
  const [videoPlayedCount, setVideoPlayedCount] = useState(0);
  const [videoHasBeenCompleted, setVideoHasEnded] = useState();

  useEffect(() => {
    setVideoHasEnded(lessonHasBeenCompleted);
  }, [lessonHasBeenCompleted]);

  const [videoIsPlaying, setVideoIsPlaying] = useState(false);

  const handleVideoProgress = ({
    // playedSeconds,
    // loadedSeconds, loaded
    played,
  }) => {
    setVideoPlayedCount(played);
  };

  const handleVideoHasEnded = () => {
    setVideoHasEnded(true);
  };

  const handleVideoPlayToggle = () => {
    setVideoIsPlaying((prev) => !prev);
  };

  return {
    videoPlayedCount,
    handleVideoProgress,
    videoHasBeenCompleted,
    handleVideoHasEnded,
    videoIsPlaying,
    handleVideoPlayToggle,
  };
};

/**
 * Lesson state `Manager`
 * @param { Array<{}> | null } sidebarLinks
 *
 * @returns {{
 *  lesson: Lesson<{}> | null,
 *  isLoading: boolean,
 *  videoPlayedCount: number,
 *  videoHasBeenCompleted: boolean,
 *  previousIsDisabled: boolean,
 *  completeAndContinueIsDisabled: boolean,
 *  handlePrevious: () => void,
 *  handleCompleteAndContinue: () => void,
 *  handleVideoProgress: (progress: ReactPlayerProgress) => void,
 *  handleVideoHasEnded: () => void,
 * }}
 */
const useLessonDetails = (sidebarLinks, setCourseState) => {
  const { handleGetOrSetAndGet, handleDelete } = useCache();
  const componentIsMount = useComponentIsMount();
  const { lesson_id: lessonId } = useParams();
  const { push } = useHistory();

  // To make sure the `Sidebar` links renders correctly
  useTakeCourse();

  const [lessonDetails, setLessonDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });
  const videoPlayerManager = usePlayer({
    lessonHasBeenCompleted: lessonDetails.data?.hasEnded, // TODO:replace with a dynamic `lesson.hasEnded`
  });

  const index = sidebarLinks?.findIndex((link) => link.id === lessonId);
  const currentLessonLink = { index, ...sidebarLinks?.[index] };

  const handlePrevious = () => {
    const previousLink = sidebarLinks[currentLessonLink.index - 1];

    if (!previousLink.disabled) {
      push(previousLink.to);
    }
  };

  const [endLesson, setEndLesson] = useState({
    success: false,
    loading: false,
    error: null,
  });

  const handleEndLesson = async () => {
    if (!lessonDetails.data?.hasEnded) {
      setEndLesson({ loading: true });

      try {
        await requestEndLesson(lessonId);
        handleDelete(lessonId);
        setTimeout(
          () => localStorage.removeItem(`${lessonId}-video-progress`),
          1000
        );

        setCourseState((prev) => {
          const data = { ...prev.data };
          const lesson = data.lessons.find((l) => l.id === lessonId);
          lesson.hasCompleted = true;

          return { data };
        });

        setEndLesson({ success: true });
      } catch (err) {
        console.error(err);
        setEndLesson({ error: err.message });
      }
    } else {
      setEndLesson({ success: true });
    }
  };

  const handleCompleteAndContinue = async () => {
    handleEndLesson();
    handleContinueToNextLesson();
  };

  const handleContinueToNextLesson = useCallback(() => {
    const nextLink = sidebarLinks[currentLessonLink.index + 1];

    if (!nextLink.disabled) {
      push(nextLink.to);
    }
  }, [currentLessonLink.index, push, sidebarLinks]);

  const endLessonIsSuccessful = endLesson.success;
  const endLessonIsLoading = endLesson.loading;
  const endLessonHasError = endLesson.error;

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
      console.error(err);
      if (componentIsMount) setLessonDetails({ err: err.message });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, componentIsMount]);

  const handleTryAgain = async () => {
    await handleDelete(lessonId);
    fetchLessonDetails();
  };

  useEffect(() => {
    fetchLessonDetails();
  }, [fetchLessonDetails]);

  const lesson = lessonDetails.data;
  const isLoading = lessonDetails.loading;
  const error = lessonDetails.err;
  const previousIsDisabled = isLoading || currentLessonLink?.index <= 0;

  const getCompleteAndContinueIsDisabled = () => {
    if (isLoading) return true;
    if (lesson?.hasEnded) return false;
    if (videoPlayerManager.videoHasBeenCompleted) return false;

    return true;
  };

  useEffect(() => {
    if (videoPlayerManager.videoHasBeenCompleted) handleEndLesson();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoPlayerManager.videoHasBeenCompleted]);

  const completeAndContinueIsDisabled = getCompleteAndContinueIsDisabled();

  const lessonIsDisabled =
    !isLoading &&
    !error &&
    sidebarLinks?.find((link) => link?.id === lesson?.id)?.disabled;

  const shouldBlockAllNavigation =
    !error &&
    !isLoading &&
    !lesson?.hasEnded &&
    !currentLessonLink?.hasCompleted &&
    !lessonIsDisabled;

  return {
    lesson,
    isLoading,
    error,
    previousIsDisabled,
    completeAndContinueIsDisabled,
    handlePrevious,
    handleCompleteAndContinue,
    handleTryAgain,
    handleEndLesson,
    endLessonIsSuccessful,
    endLessonIsLoading,
    endLessonHasError,
    lessonIsDisabled,
    shouldBlockAllNavigation,
    ...videoPlayerManager,
  };
};

export default useLessonDetails;
