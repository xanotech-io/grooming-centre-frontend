import { Box, UnorderedList, ListItem, List, ListIcon } from "@chakra-ui/react";
import { BsClockFill } from "react-icons/bs";
import { Route } from "react-router-dom";
import { Button, Heading, SkeletonText, Text } from "../../../../components";
import { useTakeCourse } from "../../../../contexts";
import { getDuration } from "../../../../utils";
import useQueryParams from "../../../../hooks/useQueryParams";
import { EmptyState } from "../../../../layouts";
import { useGoBack } from "../../../../hooks";
import useCourseExamPreview from "./hooks/courseExamPreview/useCourseExamPreview";

const AssessmentPreviewPage = ({ sidebarLinks, sidebarLinkClickedState }) => {
  const { assessment, isLoading, error, handleTryAgain, assessmentIsDisabled } =
    useCourseExamPreview(sidebarLinks, null, null, sidebarLinkClickedState);
  useTakeCourse();
  console.log(assessment, "assessment");
  const isExamination = useQueryParams().get("examination");
  const duration = getDuration(assessment.duration);
  const handleGoBack = useGoBack();

  // console.log(assessment, assessmentIsDisabled);

  return error ? (
    <EmptyState
      height="80vh"
      cta={<Button onClick={handleTryAgain}>Try Again</Button>}
      heading="Oops An Error Occurred"
      description="An unexpected error occurred, please try again later"
    />
  ) : assessmentIsDisabled ? (
    <EmptyState
      height="80vh"
      cta={<Button onClick={handleGoBack}>Go Back</Button>}
      heading="Oops An Error Occurred"
      description={`You are are not allowed to view this ${
        isExamination ? "examination" : "assessment"
      }`}
    />
  ) : (
    <Box paddingTop={10} as="main" paddingX={6}>
      {!isLoading && (
        <Heading fontSize="heading.h4">Topics: {assessment.topic}</Heading>
      )}

      <Box
        borderBottom="1px"
        borderColor="accent.2"
        marginY={8}
        paddingBottom={10}
      >
        {isLoading ? (
          <SkeletonText numberOfLines={4} spacing={5} />
        ) : (
          <List spacing={3}>
            <ListItem d="flex" alignItems="center">
              <ListIcon fontSize="text.level1" color="accent.2">
                <BsClockFill />
              </ListIcon>

              <Text>{assessment.questionCount} multiple choice questions</Text>
            </ListItem>
            <ListItem d="flex" alignItems="center">
              <ListIcon fontSize="text.level1" color="accent.2">
                <BsClockFill />
              </ListIcon>

              <Text>
                {duration.hours ? `${duration.hours} hours ` : null}
                {duration.minutes ? `${duration.minutes} minutes.` : null}
              </Text>
            </ListItem>
            <ListItem d="flex" alignItems="center">
              <ListIcon fontSize="text.level1" color="accent.2">
                <BsClockFill />
              </ListIcon>

              <Text>
                Score a minimum of{" "}
                {assessment.minimumPercentageScoreToEarnABadge}% to earn a badge
              </Text>
            </ListItem>
          </List>
        )}
      </Box>

      <UnorderedList spacing={2} paddingBottom={10}>
        <ListItem>
          <Text>
            You must complete this{" "}
            {isExamination ? "examination" : "assessment"} in one session — make
            sure your internet is reliable.
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            You can only take this{" "}
            {isExamination ? "examination" : "assessment"} once, so do well to
            put in your best.
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            We won’t show your results to anyone without your permission.
          </Text>
        </ListItem>
      </UnorderedList>

      {isExamination ? (
        <Button
          link={`/courses/take/${assessment?.courseId}/assessment/start/${assessment.courseId}?examination=true`}
          disabled={isLoading && error}
        >
          Take Examination
        </Button>
      ) : (
        <Button
          link={`/courses/take/${assessment?.courseId}/assessment/start/${assessment?.id}`}
          disabled={isLoading && error}
        >
          Take Assessment
        </Button>
      )}
    </Box>
  );
};

export const AssessmentPreviewPageRoute = ({
  sidebarLinks,
  sidebarLinkClickedState,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <AssessmentPreviewPage
          sidebarLinks={sidebarLinks}
          sidebarLinkClickedState={sidebarLinkClickedState}
          {...props}
        />
      )}
    />
  );
};
