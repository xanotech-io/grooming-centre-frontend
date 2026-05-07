import Icon from "@chakra-ui/icon";
import { Box, Flex, HStack, Stack } from "@chakra-ui/layout";
import { Badge } from "@chakra-ui/react";
import {
  BsClockFill,
  BsFillCaretDownFill,
  BsFillCaretUpFill,
} from "react-icons/bs";
import { FaCalendar, FaCheck } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { VscFiles } from "react-icons/vsc";
import { Route } from "react-router-dom";
import { useParams } from "react-router";
import coverImagePlaceholder from "../../../../assets/images/User_CourseDetailsHeader.svg";
import avatarImagePlaceholder from "../../../../assets/images/Avatar.svg";
import { Button, Heading, Image, Spinner, Text } from "../../../../components";
import breakpoints, {
  maxWidthStyles_userPages,
} from "../../../../theme/breakpoints";
import {
  getDuration,
  getEndTime,
  hasEnded,
  isOngoing,
  isUpcoming,
} from "../../../../utils";
import useCourseDetails from "./hooks/useCourseDetails";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  adminListModules,
  adminGetModuleLessons,
  adminListModuleAssessments,
  adminListModuleExaminations,
  getModuleProjects,
  getCourseProgress,
  getModuleProgress,
} from "../../../../services";

// ─── Module content fetcher (lazy, per module) ───────────────────────────────

const useModuleContent = (moduleId) => {
  const [state, setState] = useState({
    lessons: null,
    assessments: null,
    examinations: null,
    projects: null,
    progress: null,
    loading: false,
    err: null,
    fetched: false,
  });

  const fetch = useCallback(async () => {
    if (!moduleId || state.fetched) return;
    setState((s) => ({ ...s, loading: true, err: null }));
    try {
      const [
        { lessons },
        { assessments },
        { examinations },
        { projects },
        progress,
      ] = await Promise.all([
        adminGetModuleLessons(moduleId).catch(() => ({ lessons: [] })),
        adminListModuleAssessments(moduleId).catch(() => ({ assessments: [] })),
        adminListModuleExaminations(moduleId).catch(() => ({ examinations: [] })),
        getModuleProjects(moduleId).catch(() => ({ projects: [] })),
        getModuleProgress(moduleId).catch(() => null),
      ]);

      setState({
        lessons,
        assessments: assessments.map((a) => ({
          ...a,
          endTime: getEndTime(a.startTime, a.duration),
        })),
        examinations: examinations.map((e) => ({
          ...e,
          endTime: getEndTime(e.startTime, e.duration),
        })),
        projects,
        progress,
        loading: false,
        err: null,
        fetched: true,
      });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, err: err.message }));
    }
  }, [moduleId, state.fetched]);

  return { content: state, fetchContent: fetch };
};

// ─── Single module row (expandable) ──────────────────────────────────────────

const ModuleRow = ({ module, index, courseId }) => {
  const [open, setOpen] = useState(false);
  const { content, fetchContent } = useModuleContent(module.id);

  const toggle = () => {
    setOpen((prev) => {
      if (!prev) fetchContent();
      return !prev;
    });
  };

  const getItemLink = (item, type) => {
    if (type === "lesson")
      return `/courses/take/${courseId}/lessons/${item.id}`;
    if (type === "assessment")
      return `/courses/take/${courseId}/assessment/${item.id}`;
    if (type === "examination")
      return `/courses/take/${courseId}/assessment/${item.id}?moduleExam=${module.id}`;
    return "#";
  };

  const renderActionButton = (item, type) => {
    const isExam = type === "examination";
    const isLesson = type === "lesson";
    const label = isExam ? "Examination" : isLesson ? "Lesson" : "Assessment";

    const hasTime = !!item.startTime;
    const ongoing = hasTime && isOngoing(item.startTime, item.endTime);
    const ended = hasTime && hasEnded(item.endTime);
    const upcoming = hasTime && isUpcoming(item.startTime);

    let buttonText;
    if (!hasTime || ended) buttonText = `View ${label}`;
    else if (ongoing && item.hasCompleted) buttonText = `View ${label}`;
    else if (ongoing) buttonText = `Take ${label}`;
    else if (upcoming) buttonText = `${label} Upcoming`;
    else buttonText = `View ${label}`;

    return (
      <Button
        link={getItemLink(item, type)}
        secondary
        sm
        width="165px"
        leftIcon={item.hasCompleted && <FaCheck />}
      >
        {buttonText}
      </Button>
    );
  };

  const renderSubSection = (title, items, type, emptyText) => {
    if (!items) return null;
    return (
      <Box mb={4}>
        <Flex
          alignItems="center"
          px={4}
          py={2}
          backgroundColor="gray.50"
          borderBottom="1px"
          borderColor="gray.200"
        >
          <Text bold color="gray.600" fontSize="sm">
            {title}
          </Text>
          <Badge ml={2} colorScheme="gray" fontSize="10px">
            {items.length}
          </Badge>
        </Flex>

        {items.length === 0 ? (
          <Box px={6} py={3}>
            <Text color="gray.400" fontSize="sm">
              {emptyText}
            </Text>
          </Box>
        ) : (
          items.map((item) => (
            <Flex
              key={item.id}
              justifyContent="space-between"
              alignItems="center"
              px={6}
              py={3}
              borderBottom="1px"
              borderColor="accent.1"
              _hover={{ backgroundColor: "gray.50" }}
            >
              {/* Left: icon + title */}
              <HStack spacing={3} flex={1}>
                <Icon fontSize="text.level2" color="primary.base">
                  {type === "lesson" && item.lessonType?.name === "video" ? (
                    <IoVideocam />
                  ) : (
                    <VscFiles />
                  )}
                </Icon>
                <Box>
                  <Text bold>{item.title}</Text>
                  {item.startTime && (
                    <Text as="level5" color="accent.3">
                      {dayjs(item.startTime).format("ddd, D MMM · h:mm A")}
                      {item.duration
                        ? ` · ${getDuration(item.duration).combinedText}`
                        : ""}
                    </Text>
                  )}
                </Box>
              </HStack>

              {/* Right: status badge + button */}
              <HStack spacing={3}>
                {item.startTime && (
                  <Badge
                    fontSize="10px"
                    colorScheme={
                      item.hasCompleted
                        ? "green"
                        : isOngoing(item.startTime, item.endTime)
                          ? "blue"
                          : hasEnded(item.endTime)
                            ? "gray"
                            : "orange"
                    }
                    textTransform="capitalize"
                  >
                    {item.hasCompleted
                      ? "Completed"
                      : isOngoing(item.startTime, item.endTime)
                        ? "Ongoing"
                        : hasEnded(item.endTime)
                          ? "Ended"
                          : "Upcoming"}
                  </Badge>
                )}
                {renderActionButton(item, type)}
              </HStack>
            </Flex>
          ))
        )}
      </Box>
    );
  };

  const renderProjectsSection = (projects) => {
    if (!projects) return null;
    return (
      <Box mb={4}>
        <Flex
          alignItems="center"
          px={4}
          py={2}
          backgroundColor="gray.50"
          borderBottom="1px"
          borderColor="gray.200"
        >
          <Text bold color="gray.600" fontSize="sm">
            Projects
          </Text>
          <Badge ml={2} colorScheme="gray" fontSize="10px">
            {projects.length}
          </Badge>
        </Flex>

        {projects.length === 0 ? (
          <Box px={6} py={3}>
            <Text color="gray.400" fontSize="sm">
              No projects in this module.
            </Text>
          </Box>
        ) : (
          projects.map((project) => (
            <Flex
              key={project.id}
              justifyContent="space-between"
              alignItems="center"
              px={6}
              py={3}
              borderBottom="1px"
              borderColor="accent.1"
              _hover={{ backgroundColor: "gray.50" }}
            >
              <Box flex={1}>
                <Text bold>{project.title}</Text>
                {project.description && (
                  <Text as="level5" color="gray.500" noOfLines={1}>
                    {project.description}
                  </Text>
                )}
                <HStack spacing={4} mt={1}>
                  {project.dueDate && (
                    <Text as="level5" color="accent.3">
                      Due: {dayjs(project.dueDate).format("ddd, D MMM YYYY")}
                    </Text>
                  )}
                  {project.maxGrade != null && (
                    <Text as="level5" color="accent.3">
                      Max grade: {project.maxGrade}
                    </Text>
                  )}
                </HStack>
              </Box>

              <HStack spacing={3}>
                <Badge
                  fontSize="10px"
                  colorScheme={project.status === "published" ? "green" : "gray"}
                  textTransform="capitalize"
                  px={2}
                  py="2px"
                  borderRadius="full"
                >
                  {project.status}
                </Badge>
                <Button
                  link={`/courses/take/${courseId}/projects/${project.id}`}
                  secondary
                  sm
                  width="140px"
                >
                  View Project
                </Button>
              </HStack>
            </Flex>
          ))
        )}
      </Box>
    );
  };

  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      mb={3}
      overflow="hidden"
    >
      {/* Module header row */}
      <Flex
        alignItems="center"
        px={6}
        py={4}
        backgroundColor={open ? "primary.base" : "white"}
        color={open ? "white" : "inherit"}
        cursor="pointer"
        onClick={toggle}
        _hover={{ backgroundColor: open ? "primary.base" : "gray.50" }}
        transition="background .15s"
      >
        {/* Order badge */}
        <Box
          minW="28px"
          h="28px"
          borderRadius="full"
          backgroundColor={open ? "white" : "primary.base"}
          color={open ? "primary.base" : "white"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={4}
          fontSize="sm"
          fontWeight="bold"
          flexShrink={0}
        >
          {index + 1}
        </Box>

        {/* Title + description */}
        <Box flex={1}>
          <Text bold>{module.title}</Text>
          {module.description && (
            <Text
              as="level5"
              color={open ? "whiteAlpha.800" : "gray.500"}
              noOfLines={1}
            >
              {module.description}
            </Text>
          )}
        </Box>

        {/* Status badge */}
        <Badge
          mr={4}
          fontSize="10px"
          backgroundColor={
            open
              ? "whiteAlpha.300"
              : module.status === "published"
                ? "green.100"
                : "gray.100"
          }
          color={
            open
              ? "white"
              : module.status === "published"
                ? "green.700"
                : "gray.600"
          }
          textTransform="capitalize"
          px={2}
          py="2px"
          borderRadius="full"
        >
          {module.status}
        </Badge>

        {/* Chevron */}
        <Icon fontSize="text.level2">
          {open ? <BsFillCaretUpFill /> : <BsFillCaretDownFill />}
        </Icon>
      </Flex>

      {/* Expanded content */}
      {open && (
        <Box backgroundColor="white">
          {content.loading && (
            <Flex justifyContent="center" py={6}>
              <Spinner />
            </Flex>
          )}

          {content.err && (
            <Box px={6} py={4}>
              <Text color="red.500">{content.err}</Text>
            </Box>
          )}

          {content.fetched && (
            <>
              {/* Module progress bar */}
              {content.progress && (
                <Box px={6} py={4} borderBottom="1px" borderColor="gray.100">
                  <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <Text bold fontSize="sm" color="gray.600">
                      Module Progress
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.500">
                        {content.progress.completedLessonsCount}/{content.progress.totalLessons} lessons
                      </Text>
                      <Badge
                        colorScheme={content.progress.isModuleCompleted ? "green" : "blue"}
                        fontSize="10px"
                        px={2}
                        py="2px"
                        borderRadius="full"
                      >
                        {content.progress.isModuleCompleted ? "Completed" : `${content.progress.completionPercentage}%`}
                      </Badge>
                    </HStack>
                  </Flex>
                  <Box
                    height="8px"
                    backgroundColor="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      height="100%"
                      width={`${content.progress.completionPercentage}%`}
                      backgroundColor={content.progress.isModuleCompleted ? "green.400" : "primary.base"}
                      borderRadius="full"
                      transition="width .4s ease"
                    />
                  </Box>
                </Box>
              )}

              {renderSubSection(
                "Lessons",
                content.lessons,
                "lesson",
                "No lessons in this module."
              )}
              {renderSubSection(
                "Assessments",
                content.assessments,
                "assessment",
                "No assessments in this module."
              )}
              {renderSubSection(
                "Examinations",
                content.examinations,
                "examination",
                "No examinations in this module."
              )}
              {renderProjectsSection(content.projects)}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CourseDetailsPage = () => {
  const { id: courseId } = useParams();
  const { courseDetails, fetchCourseDetails } = useCourseDetails();

  const [modulesState, setModulesState] = useState({
    data: null,
    loading: false,
    err: null,
  });

  const [courseProgress, setCourseProgress] = useState(null);

  useEffect(() => {
    fetchCourseDetails(true);
  }, [fetchCourseDetails]);

  useEffect(() => {
    if (!courseId) return;
    setModulesState({ data: null, loading: true, err: null });
    Promise.all([
      adminListModules(courseId),
      getCourseProgress(courseId).catch(() => null),
    ])
      .then(([{ modules }, progress]) => {
        const sorted = [...modules].sort(
          (a, b) => a.sequenceOrder - b.sequenceOrder
        );
        setModulesState({ data: sorted, loading: false, err: null });
        setCourseProgress(progress);
      })
      .catch((err) =>
        setModulesState({ data: null, loading: false, err: err.message })
      );
  }, [courseId]);

  const courseData = courseDetails.data;
  const isLoading = courseDetails.loading;
  const isError = courseDetails.err;
  const courseDuration = getDuration(courseData?.duration).combinedText;

  return isLoading ? (
    <Flex
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      <Spinner />
    </Flex>
  ) : isError ? (
    <Flex
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      <Heading color="red.500">{isError}</Heading>
    </Flex>
  ) : (
    <Box>
      {/* ── Hero ── */}
      <Box
        as="section"
        padding={10}
        marginBottom={10}
        color="white"
        position="relative"
      >
        <Image
          src={courseData?.thumbnail || coverImagePlaceholder}
          width="100%"
          height="100%"
          top={0}
          left={0}
          position="absolute"
          alt="Course Header"
        />
        <Box
          width="100%"
          height="100%"
          top={0}
          left={0}
          position="absolute"
          backgroundColor="black"
          opacity={0.7}
        />
        <Stack spacing={7} position="relative" {...maxWidthStyles_userPages}>
          <Heading>{courseData?.title}</Heading>
          <Text as="level2">{courseData?.description}</Text>
          <HStack spacing={4}>
            <Image
              src={courseData?.user?.profilePics || avatarImagePlaceholder}
              rounded="full"
              boxSize="40px"
            />
            <Text as="level1" bold>
              {`${courseData?.user?.firstName} ${courseData?.user?.lastName}`}
            </Text>
          </HStack>
        </Stack>
      </Box>

      {/* ── Body ── */}
      <Box
        padding={5}
        minHeight="50vh"
        maxWidth={breakpoints.laptop}
        marginX="auto"
      >
        {/* Course info strip */}
        <Flex
          backgroundColor="white"
          borderRadius="md"
          border="1px"
          borderColor="gray.200"
          px={6}
          py={4}
          mb={6}
          gap={8}
          flexWrap="wrap"
        >
          <HStack spacing={2}>
            <Icon color="primary.base">
              <BsClockFill />
            </Icon>
            <Box>
              <Text bold>Duration</Text>
              <Text as="level5" color="accent.3">
                {courseDuration}
              </Text>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Icon color="primary.base">
              <FaCalendar />
            </Icon>
            <Box>
              <Text bold>Start Date</Text>
              <Text as="level5" color="accent.3">
                {courseData?.startTime
                  ? dayjs(courseData.startTime).format("ddd, MMM D, YYYY")
                  : "—"}
              </Text>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Icon color="primary.base">
              <FaCalendar />
            </Icon>
            <Box>
              <Text bold>End Date</Text>
              <Text as="level5" color="accent.3">
                {courseData?.endTime
                  ? dayjs(courseData.endTime).format("ddd, MMM D, YYYY")
                  : "—"}
              </Text>
            </Box>
          </HStack>

          {courseProgress && (
            <Box flex={1} minWidth="200px">
              <Flex justifyContent="space-between" alignItems="center" mb={1}>
                <Text bold>Your Progress</Text>
                <HStack spacing={2}>
                  <Text as="level5" color="accent.3">
                    {courseProgress.completedModules}/{courseProgress.totalModules} modules
                  </Text>
                  <Badge
                    colorScheme={courseProgress.completionPercentage === 100 ? "green" : "blue"}
                    fontSize="10px"
                    px={2}
                    borderRadius="full"
                  >
                    {courseProgress.completionPercentage}%
                  </Badge>
                </HStack>
              </Flex>
              <Box
                height="8px"
                backgroundColor="gray.200"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  height="100%"
                  width={`${courseProgress.completionPercentage}%`}
                  backgroundColor={courseProgress.completionPercentage === 100 ? "green.400" : "primary.base"}
                  borderRadius="full"
                  transition="width .4s ease"
                />
              </Box>
            </Box>
          )}
        </Flex>

        {/* Modules heading */}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          pb={3}
          borderBottom="1px"
          borderColor="accent.2"
        >
          <Heading as="h3" fontSize="heading.h4">
            Course Modules
          </Heading>
          {modulesState.data && (
            <Badge colorScheme="blue" fontSize="12px" px={3} py={1}>
              {modulesState.data.length}{" "}
              {modulesState.data.length === 1 ? "Module" : "Modules"}
            </Badge>
          )}
        </Flex>

        {/* Modules list */}
        {modulesState.loading && (
          <Flex justifyContent="center" py={10}>
            <Spinner />
          </Flex>
        )}

        {modulesState.err && (
          <Box py={6} textAlign="center">
            <Text color="red.500">{modulesState.err}</Text>
          </Box>
        )}

        {modulesState.data?.length === 0 && (
          <Box
            py={10}
            textAlign="center"
            backgroundColor="gray.50"
            borderRadius="md"
          >
            <Text color="gray.400">No modules available for this course.</Text>
          </Box>
        )}

        {modulesState.data?.map((module, idx) => (
          <ModuleRow
            key={module.id}
            module={module}
            index={idx}
            courseId={courseId}
          />
        ))}
      </Box>
    </Box>
  );
};

// ─── Route export ─────────────────────────────────────────────────────────────

export const CourseDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CourseDetailsPage {...props} />} />
  );
};
