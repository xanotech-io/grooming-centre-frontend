import Icon from "@chakra-ui/icon";
import { Box, Flex, HStack, Stack } from "@chakra-ui/layout";
import { BsClockFill, BsFillCaretUpFill } from "react-icons/bs";
import { FaCalendar, FaCheck } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { VscFiles } from "react-icons/vsc";
import { Route } from "react-router-dom";
import coverImagePlaceholder from "../../../../assets/images/User_CourseDetailsHeader.svg";
import avatarImagePlaceholder from "../../../../assets/images/Avatar.svg";
import { Button, Heading, Image, Spinner, Text } from "../../../../components";
import breakpoints, {
  maxWidthStyles_userPages,
} from "../../../../theme/breakpoints";
import {
  getDuration,
  hasEnded,
  isOngoing,
  isUpcoming,
} from "../../../../utils";
import useAccordion from "./hooks/useAccordion";
import useCourseDetails from "./hooks/useCourseDetails";
import { useEffect } from "react";
import dayjs from "dayjs";

const CourseDetailsPage = () => {
  const { courseDetails, fetchCourseDetails } = useCourseDetails();

  console.log("=== Course Details State ===", courseDetails);

  useEffect(() => {
    fetchCourseDetails(true);
  }, [fetchCourseDetails]);

  const courseDetailsData = courseDetails.data;
  const courseDuration = getDuration(courseDetailsData?.duration).combinedText;

  const isLoading = courseDetails.loading;
  const isError = courseDetails.err;

  // const getCurrentOngoingLesson = () => {
  //   const lesson =
  //     courseDetailsData?.lessons.find((lesson) =>
  //       isOngoing(lesson.startTime, lesson.endTime)
  //     ) || courseDetailsData?.lessons.find((lesson) => lesson.hasCompleted);

  //   return lesson;
  // };

  const getDisability = (item, isAssessment, isExamination) => {
    console.log(isAssessment, isExamination);
    if (isAssessment || isExamination) {
      if (!isOngoing(item?.startTime, item?.endTime) || item?.hasCompleted) {
        console.log("disabled", "ass", "exam", item?.title);
        return true;
      }
    }

    if (!isOngoing(item?.startTime, item?.endTime) && !item?.hasCompleted) {
      return true;
    }
  };

  const renderItem = (item, { isAssessment, isExamination }) => {
    const getContextText = () =>
      isAssessment ? "Assessment" : isExamination ? "Examination" : "Lesson";

    return (
      <Flex
        key={item?.id}
        justifyContent="space-between"
        paddingY={3}
        paddingX={2}
        borderBottom="1px"
        borderColor="accent.1"
      >
        <InfoContent
          title={dayjs(item?.startTime).format("ddd, D MMM")}
          date={`${dayjs(item?.startTime).format("h:mm A")} to ${dayjs(
            item?.endTime
          ).format("h:mm A")}`}
          icon={<FaCalendar />}
          flex={0.6}
          opacity={item?.disabled ? 0.5 : 1}
        />
        <InfoContent
          title={item?.title}
          date={`${getDuration(item?.duration).combinedText}`}
          icon={
            isAssessment || isExamination ? (
              <VscFiles />
            ) : item?.lessonType?.name === "video" ? (
              <IoVideocam />
            ) : (
              <VscFiles />
            )
          }
          flex={1}
          marginLeft={16}
          opacity={item?.disabled ? 0.5 : 1}
        />

        <Button
          link={`/courses/take/${courseDetailsData?.id}/${
            isAssessment || isExamination ? "assessment" : "lessons"
          }/${isExamination ? courseDetailsData?.id : item?.id}${
            isExamination ? "?examination=true" : ""
          }`}
          width="165px"
          secondary
          sm
          disabled={getDisability(item, isAssessment, isExamination)}
          leftIcon={item?.hasCompleted && <FaCheck />}
        >
          {isOngoing(item?.startTime, item?.endTime) &&
            !item?.hasCompleted &&
            `Take ${getContextText()}`}
          {isOngoing(item?.startTime, item?.endTime) &&
            item?.hasCompleted &&
            `View ${getContextText()}`}
          {hasEnded(item?.endTime) && `View ${getContextText()}`}
          {isUpcoming(item?.startTime) && `${getContextText()} Upcoming`}
        </Button>
      </Flex>
    );
  };

  const renderCurriculumList = () => {
    const combinedItems = [];

    if (courseDetailsData?.lessons) {
      courseDetailsData.lessons.forEach((lesson) => {
        combinedItems.push({
          ...lesson,
          itemType: "lesson",
        });
      });
    }

    if (courseDetailsData?.assessments) {
      courseDetailsData.assessments.forEach((assessment) => {
        combinedItems.push({
          ...assessment,
          itemType: "assessment",
        });
      });
    }

    const extractModuleNumber = (title) => {
      const match = title.match(/(module|lesson)\s+(\d+)/i);
      return match ? parseInt(match[2], 10) : null;
    };

    const extractAssessmentModules = (title) => {
      const numbers = title.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        return Math.max(...numbers.map((n) => parseInt(n, 10)));
      }
      return null;
    };

    const itemsWithSortKeys = combinedItems.map((item) => {
      let sortKey;

      if (item.itemType === "lesson") {
        const moduleNum = extractModuleNumber(item.title);
        if (moduleNum !== null) {
          sortKey = moduleNum;
        } else {
          const createdTime = new Date(item.createdAt).getTime();
          sortKey = -createdTime / 1e15;
        }
      } else if (item.itemType === "assessment") {
        const maxModule = extractAssessmentModules(item.title);
        if (maxModule !== null) {
          sortKey = maxModule + 0.5;
        } else {
          sortKey = 9999;
        }
      }

      return { ...item, sortKey };
    });

    itemsWithSortKeys.forEach((item, index) => {
      console.log(
        `${index + 1}. [${item.itemType}] ${item.title} - sortKey: ${
          item.sortKey
        }`
      );
    });

    const sortedItems = itemsWithSortKeys.sort((a, b) => {
      if (a.sortKey !== b.sortKey) {
        return a.sortKey - b.sortKey;
      }
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      return createdA - createdB;
    });

    sortedItems.forEach((item, index) => {
      console.log(
        `${index + 1}. [${item.itemType}] ${item.title} - sortKey: ${
          item.sortKey
        }`
      );
    });

    return sortedItems.map((item) => {
      const isAssessment = item.itemType === "assessment";
      return renderItem(item, { isAssessment });
    });
  };

  return isLoading || isError ? (
    <Flex
      // Make the height 100% of the screen minus the `height` of the Header and Footer
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Heading color="red.500">{isError}</Heading>
      ) : null}
    </Flex>
  ) : (
    <Box>
      <Box
        as="section"
        padding={10}
        marginBottom={10}
        // backgroundColor="secondary.9"
        color="white"
        position="relative"
      >
        <Image
          src={courseDetailsData?.thumbnail || coverImagePlaceholder}
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
        ></Box>

        <Stack
          spacing={7}
          position="relative"
          // zIndex={1}
          {...maxWidthStyles_userPages}
        >
          <Heading>{courseDetailsData?.title}</Heading>
          <Text as="level2">{courseDetailsData?.description}</Text>

          <HStack spacing={4}>
            <Image
              src={
                courseDetailsData?.user.profilePics || avatarImagePlaceholder
              }
              rounded="full"
              boxSize="40px"
            />

            <Text as="level1" bold>
              {`${courseDetailsData?.user.firstName} ${courseDetailsData?.user.lastName}`}
            </Text>
          </HStack>
        </Stack>
      </Box>

      <Box
        padding={5}
        minHeight="50vh"
        maxWidth={breakpoints.laptop}
        marginX="auto"
      >
        {/* <Flex justifyContent="flex-end" marginBottom={10}>
          <Button
            link={`/courses/take/${courseDetailsData?.id}/lessons/${
              getCurrentOngoingLesson()?.id
            }`}
            disabled={getCurrentOngoingLesson() ? false : true}
          >
            Start Course
          </Button>
        </Flex> */}

        {/* {isOngoing(event.startTime, event.endTime) && "Join Event"}
              {hasEnded(event.endTime) && "Event Has Ended"}
              {isUpcoming(event.startTime) && "Event Is Upcoming"} */}

        <Accordion heading="Course Details">
          <Flex justifyContent="space-between" padding={2}>
            <InfoContent
              title="Duration"
              date={`${courseDuration}`}
              icon={<BsClockFill />}
            />
            <InfoContent
              title="Start Date"
              date={dayjs(courseDetailsData?.startTime).format(
                "ddd, MMM D, YYYY"
              )}
              icon={<FaCalendar />}
            />
            <InfoContent
              title="End Date"
              date={dayjs(courseDetailsData?.endTime).format(
                "ddd, MMM D, YYYY"
              )}
              icon={<FaCalendar />}
            />
          </Flex>
        </Accordion>

        <Accordion heading="Course Curriculum">
          {renderCurriculumList()}
          {courseDetailsData?.examination &&
            renderItem(courseDetailsData?.examination, { isExamination: true })}
        </Accordion>
        {/* {courseDetailsData?.lessons[0] && (
          <Box textAlign="right" pr={2}>
            <Button
              rightIcon={<AiOutlineRight />}
              width="150px"
              link={`/courses/take/${courseDetailsData?.id}/lessons/${courseDetailsData?.lessons[0].id}`}
            >
              See all
            </Button>
          </Box>
        )} */}
      </Box>
    </Box>
  );
};

const Accordion = ({ heading, children }) => {
  const accordionManager = useAccordion();

  return (
    <Box as="section" marginBottom={7}>
      <Flex
        as="header"
        backgroundColor="primary.base"
        color="white"
        paddingX={8}
        paddingY={3}
        rounded="5px"
        justifyContent="space-between"
        alignItems="center"
        onClick={accordionManager.handleToggle}
        cursor="pointer"
      >
        <Heading as="h4">{heading}</Heading>

        <Icon
          fontSize="text.level1"
          transition=".15s"
          transform={`rotate(${!accordionManager.isOpen ? 180 : 0}deg)`}
          transformOrigin="center"
        >
          <BsFillCaretUpFill />
        </Icon>
      </Flex>

      <Box
        overflowY="hidden"
        transition=".5s"
        // maxHeight={accordionManager.isOpen ? "1000px" : "0px"}
      >
        {children}
      </Box>
    </Box>
  );
};

const InfoContent = ({ date, icon, title, ...rest }) => {
  return (
    <HStack spacing={1} alignItems="flex-start" {...rest}>
      <Box paddingTop="1px">
        <Icon fontSize="text.level1">{icon}</Icon>
      </Box>

      <Box>
        <Text bold>{title}</Text>
        <Text as="level5" color="accent.3">
          {date}
        </Text>
      </Box>
    </HStack>
  );
};

export const CourseDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CourseDetailsPage {...props} />} />
  );
};
