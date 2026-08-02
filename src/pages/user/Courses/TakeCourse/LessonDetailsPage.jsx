import { useToast } from '@chakra-ui/toast';
import { Box, Flex } from '@chakra-ui/react';
import { Skeleton } from '@chakra-ui/skeleton';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import { Route } from 'react-router-dom';
import {
  Button,
  Heading,
  NavigationBlocker,
  RichTextToView,
  SkeletonText,
} from '../../../../components';
import useLessonDetails from './hooks/useLessonDetails';
import { capitalizeFirstLetter } from '../../../../utils/formatString';
import { EmptyState } from '../../../../layouts';
import { useGoBack } from '../../../../hooks';

const LessonDetailsPage = ({ sidebarLinks, setCourseState }) => {
  const {
    lesson,
    shouldBlockAllNavigation,
    lessonIsDisabled,
    isLoading,
    error,
    completeAndContinueIsDisabled,
    previousIsDisabled,
    videoHasBeenCompleted,
    videoIsPlaying,
    endLessonIsLoading,
    endLessonHasError,
    handlePrevious,
    handleCompleteAndContinue,
    handleVideoHasEnded,
    handleEndLesson,
    handleTryAgain,
    handleVideoPlayToggle,
  } = useLessonDetails(sidebarLinks, setCourseState);

  const toast = useToast();

  useEffect(() => {
    if (endLessonHasError)
      toast({
        description: capitalizeFirstLetter(endLessonHasError),
        position: 'top',
        status: 'error',
      });
  }, [toast, endLessonHasError]);

  const handleGoBack = useGoBack();

  const fileIsPDF = /(\.pdf)$/i.test(lesson?.file);
  const fileIsVideo =
    /\.(mp4|mkv|webm|mov|avi)$/i.test(lesson?.file) ||
    /^video/i.test(lesson?.lessonType?.name);

  return (
    <Flex flexDirection="column" flex={1} height="100vh">
      {/* // Block Page Navigation when Lesson has not ended (been completed) */}
      <NavigationBlocker when={shouldBlockAllNavigation} />

      <Box as="header">
        <Flex
          justifyContent="space-between"
          borderBottom="1px"
          borderColor="accent.1"
        >
          <Button
            ghost
            flex={1}
            disabled={previousIsDisabled}
            onClick={handlePrevious}
          >
            Previous Lesson
          </Button>
          <Button
            ghost
            backgroundColor="primary.base"
            color="white"
            _hover={{ opacity: 0.8 }}
            flex={1}
            disabled={completeAndContinueIsDisabled}
            onClick={handleCompleteAndContinue}
            isLoading={endLessonIsLoading}
          >
            Complete And Continue
          </Button>
        </Flex>
      </Box>

      <Box
        as="main"
        paddingTop={10}
        paddingBottom={16}
        paddingX={6}
        flex={1}
        overflowY="auto"
      >
        {error ? (
          <EmptyState
            cta={<Button onClick={handleTryAgain}>Try Again</Button>}
            heading="Ops! Something went wrong"
            description="An unexpected error occurred. Please try again later."
          />
        ) : lessonIsDisabled ? (
          <EmptyState
            cta={<Button onClick={handleGoBack}>Go Back</Button>}
            heading="Ops! Something went wrong"
            description="You are are not allowed to view this lesson"
          />
        ) : (
          <>
            <Box marginBottom={10}>
              {isLoading ? (
                <SkeletonText />
              ) : (
                <Heading as="h1" fontSize="heading.h3">
                  {lesson?.title}
                </Heading>
              )}
            </Box>

            <Flex
              width="100%"
              flexDirection={{ base: 'column', laptop: 'row' }}
            >
              <Box width={{ base: '100%', laptop: '60%' }} bg="accent.2">
                {isLoading ? (
                  <Skeleton width="100%" height="100%" />
                ) : fileIsPDF ? (
                  <PDFReader
                    lesson={lesson}
                    handleEndLesson={handleEndLesson}
                  />
                ) : fileIsVideo ? (
                  <Player
                    minHeight={'300px'}
                    url={lesson?.file}
                    lessonId={lesson?.id}
                    lessonCompleted={lesson?.hasEnded}
                    onEnded={handleVideoHasEnded}
                    onPlayToggle={handleVideoPlayToggle}
                    controls={videoHasBeenCompleted}
                    playing={videoIsPlaying}
                  />
                ) : (
                  <OfficeFileViewer
                    lesson={lesson}
                    handleEndLesson={handleEndLesson}
                  />
                )}
              </Box>

              <Box height="65vh" width={{ base: '100%', laptop: '40%' }}>
                {isLoading ? (
                  <Box
                    paddingTop={10}
                    paddingBottom={10}
                    paddingX={{ base: 0, laptop: 10 }}
                    width="100%"
                    height="100%"
                  >
                    <SkeletonText
                      numberOfLines={10}
                      spacing={3}
                      marginBottom={10}
                    />
                    <SkeletonText numberOfLines={5} spacing={3} />
                  </Box>
                ) : (
                  <Box
                    bg="others.1"
                    marginTop={{ base: 2, laptop: 0 }}
                    paddingTop={10}
                    paddingBottom={10}
                    paddingX={{ base: 0, laptop: 10 }}
                    width="100%"
                    height="100%"
                    overflowY="auto"
                  >
                    <RichTextToView text={lesson?.content} />
                  </Box>
                )}
              </Box>
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  );
};

const Player = ({
  lessonId,
  lessonCompleted,
  width = '100%',
  height = '100%',
  url,
  onEnded,
  onPlayToggle,
  controls,
  playing = false,
  ...rest
}) => {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef();

  useEffect(() => {
    const player = playerRef.current;
    if (isReady && player && lessonId && !lessonCompleted) {
      const initialProgress =
        localStorage.getItem(`${lessonId}-video-progress`) || 0;

      player.seekTo(+initialProgress);
    }
  }, [isReady, lessonId, lessonCompleted]);

  const onReady = () => {
    setIsReady(true);
  };

  const onProgress = () => {
    if (lessonId && !lessonCompleted)
      localStorage.setItem(
        `${lessonId}-video-progress`,
        `${playerRef.current.getCurrentTime()}`
      );
  };

  return (
    <Box
      width={width}
      height={height}
      position="relative"
      className={!controls && 'take-lesson-video-wrapper'}
      {...rest}
    >
      <ReactPlayer
        url={url}
        onEnded={onEnded}
        playing={playing}
        onReady={onReady}
        onProgress={onProgress}
        ref={playerRef}
        id="take-lesson-video"
        controls
        autoPlay
        width="100%"
        height="100%"
      />
    </Box>
  );
};

const PDFReader = ({ lesson, handleEndLesson }) => {
  useEffect(() => {
    console.log(document.querySelectorAll('#take-lesson-pdf #icon'));

    handleEndLesson();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box minW="300px" h="calc(100vh - 170px)">
      <embed
        id="take-lesson-pdf"
        src={lesson?.file}
        // title={lesson?.title}
        type="application/pdf"
        height="100%"
        width="100%"
      />
    </Box>
  );
};

const OfficeFileViewer = ({ lesson, handleEndLesson }) => {
  useEffect(() => {
    handleEndLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(lesson?.file ?? '')}`;

  return (
    <Box minW="300px" h="calc(100vh - 170px)">
      <iframe
        src={viewerUrl}
        title={lesson?.title}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      />
    </Box>
  );
};

export const LessonDetailsPageRoute = ({
  sidebarLinks,
  setCourseState,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <LessonDetailsPage
          sidebarLinks={sidebarLinks}
          setCourseState={setCourseState}
          {...props}
        />
      )}
    />
  );
};
