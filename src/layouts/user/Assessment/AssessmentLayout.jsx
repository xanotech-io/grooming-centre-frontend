import { Box, Flex, Grid, HStack, Stack } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/radio";
import { Route } from "react-router-dom";
import {
  Button,
  Heading,
  NavigationBlocker,
  RichTextToView,
  Text,
  Image,
} from "../../../components";
import breakpoints from "../../../theme/breakpoints";
import { PageLoaderLayout } from "../../global/PageLoader/PageLoaderLayout";
import { CustomModal } from "./Modal";
import { EmptyState } from "../..";
import useAssessment from "./hooks/useAssessment";

const AssessmentLayout = () => {
  const {
    assessment,

    course_id,
    currentQuestion,
    disablePreviousQuestion,
    error,
    isLoading,
    modalManager,
    end,
    shouldSubmit,
    selectedAnswers,
    timerCountdownManger,
    submitStatus,
    handleSubmitConfirmation,
    handleQuestionChange,
    handleNextQuestion,
    handlePreviousQuestion,
    handleOptionSelect,
    nav,
  } = useAssessment();
  console.log(assessment, "assessment");
  const renderSubHeading = (heading) => (
    <Box
      as="header"
      paddingBottom={5}
      marginBottom={5}
      borderBottom="1px"
      borderColor="accent.2"
    >
      <Heading fontSize="text.level2">{heading}</Heading>
    </Box>
  );

  // console.log(
  //   submitStatus.success,
  //   error,
  //   isLoading,
  //   !submitStatus.success && !error && !isLoading
  // );
  // console.log(selectedAnswers[currentQuestion?.id]);

  const renderContent = () => (
    <>
      {nav === true ? null : (
        <NavigationBlocker
          when={!submitStatus.success && !error && isLoading && end}
          disable={end}
        />
      )}

      {isLoading ? (
        <PageLoaderLayout />
      ) : error ? (
        <EmptyState
          height="100vh"
          cta={
            <Button link={`/courses/details/${course_id}`} marginTop={10}>
              Back to course
            </Button>
          }
          heading={error}
          description="Something went wrong, please try again later"
        />
      ) : (
        <>
          <CustomModal
            onClose={modalManager.onClose}
            canClose={modalManager.canClose}
            isOpen={modalManager.isOpen}
            prompt={modalManager.prompt}
          >
            {modalManager.content}
          </CustomModal>

          <Flex
            justifyContent="center"
            alignItems="flex-start"
            backgroundColor="accent.1"
            minHeight="100vh"
            width="100vw"
            pb={10}
          >
            <Box
              width="100%"
              maxWidth={breakpoints.laptop}
              backgroundColor="white"
              marginTop={20}
              shadow="0px 2px 7px rgba(0, 0, 0, 0.1)"
            >
              <Box
                as="header"
                color="white"
                backgroundColor="primary.base"
                padding={5}
                paddingX={10}
              >
                <Heading as="h1" fontSize="heading.h4">
                  {assessment.topic}
                </Heading>
              </Box>

              <Flex paddingX={10} paddingY={5} height="100%">
                <Flex
                  flexDirection="column"
                  as="main"
                  flex={1}
                  borderRight="1px"
                  borderColor="accent.2"
                  paddingRight={5}
                  marginRight={5}
                >
                  {renderSubHeading(
                    `Question ${currentQuestion?.questionIndex + 1} of ${
                      assessment.questionCount
                    }`
                  )}
                  <Flex
                    flexDirection="column"
                    justifyContent="space-between"
                    as="form"
                    flex={1}
                    // minHeight="500px"
                    onSubmit={
                      shouldSubmit
                        ? handleSubmitConfirmation
                        : handleNextQuestion
                    }
                  >
                    <Box marginBottom={6}>
                      <RichTextToView
                        marginBottom={2}
                        padding={2}
                        backgroundColor="accent.1"
                        flex={0.2}
                        text={currentQuestion?.question}
                      />
                      {currentQuestion?.file && (
                        <Image
                          src={currentQuestion?.file}
                          alt={currentQuestion?.question}
                          width="200px"
                          height="200px"
                          rounded="sm"
                        />
                      )}
                    </Box>

                    <RadioGroup
                      defaultValue="1"
                      marginBottom={8}
                      flex={1}
                      onChange={handleOptionSelect}
                      value={selectedAnswers[currentQuestion?.id] || "default"}
                    >
                      <Stack spacing={4}>
                        {currentQuestion?.options?.map((option) => (
                          <Radio key={option.id} value={option.id}>
                            <Text>{option.name}</Text>
                          </Radio>
                        ))}

                        <Radio value={"default"} display="none">
                          <Text>default</Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>

                    <Flex justifyContent="space-between">
                      <Button
                        secondary
                        onClick={handlePreviousQuestion}
                        disabled={disablePreviousQuestion}
                      >
                        Previous
                      </Button>

                      {/* {pageLength === index ? (
                        <Button onClick={handleSubmit}>Submit</Button>
                      ) : (
                        <Button type="submit" onClick={handleNextQuestion}>
                          Next
                        </Button>
                      )} */}
                      <Button type="submit">
                        {shouldSubmit ? "Submit" : "Next"}
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>

                <Box as="aside" flex="0 0 232px">
                  {renderSubHeading("Time Left")}

                  <Flex justifyContent="space-between" marginBottom={6}>
                    <Box textAlign="center">
                      <Text bold as="level1">
                        {timerCountdownManger.timeLeft.hours || "00"}
                      </Text>
                      <Text color="accent.2">hours</Text>
                    </Box>

                    <Box textAlign="center">
                      <Text bold as="level1">
                        {timerCountdownManger.timeLeft.minutes}
                      </Text>
                      <Text color="accent.2">minutes</Text>
                    </Box>

                    <Box textAlign="center">
                      <Text bold as="level1">
                        {timerCountdownManger.timeLeft.seconds}
                      </Text>
                      <Text color="accent.2">seconds</Text>
                    </Box>
                  </Flex>

                  <Box>
                    <Heading as="h3" fontSize="text.level3" marginBottom={2}>
                      Questions
                    </Heading>

                    <Flex justifyContent="space-between" marginY={5}>
                      <HStack spacing={2}>
                        <Box
                          width="20px"
                          height="6px"
                          backgroundColor="primary.base"
                          border="1px"
                          borderColor="transparent"
                        ></Box>
                        <Text as="level5" bold>
                          Answered
                        </Text>
                      </HStack>

                      <HStack spacing={2}>
                        <Box
                          width="20px"
                          height="6px"
                          border="1px"
                          borderColor="primary.base"
                        ></Box>
                        <Text as="level5" bold>
                          Unanswered
                        </Text>
                      </HStack>
                    </Flex>

                    <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                      {assessment?.questions?.map((question, index) => (
                        <ButtonNavItem
                          key={index}
                          number={index + 1}
                          isCurrent={
                            currentQuestion?.questionIndex ===
                            question.questionIndex
                          }
                          answered={selectedAnswers[question?.id]}
                          onClick={() => {
                            handleQuestionChange(question);
                          }}
                        />
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </>
      )}
    </>
  );

  return renderContent();
};

const ButtonNavItem = ({ number, answered, isCurrent, onClick }) => {
  const styleProps = answered
    ? {
        backgroundColor: "primary.base",
        color: "white",
        borderColor: "transparent",
      }
    : {
        borderColor: "primary.base",
      };

  return (
    <Flex
      justifyContent="center"
      boxSize="40px"
      rounded="4px"
      alignItems="center"
      border="1px"
      as="button"
      cursor="pointer"
      onClick={onClick}
      transition=".5s"
      transform={isCurrent && "scale(1.1)"}
      {...styleProps}
    >
      <Text bold as="level1">
        {number}
      </Text>
    </Flex>
  );
};

export const AssessmentLayoutRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AssessmentLayout {...props} />} />
  );
};

// const AssessmentHasEnded = () => {
//   const queryParam = useQueryParams();
//   const { course_id } = useParams();

//   const message = queryParam.get("elapsed")
//     ? "This assessment has already ended"
//     : queryParam.get("timeout")
//     ? "Timeout! you answers has been submitted"
//     : "";

//   return (
//     <PageLoaderLayout>
//       <Heading as="h1" fontSize="heading.h3">
//         {message}
//       </Heading>

//       <Button link={`/courses/details/${course_id}`} marginTop={10}>
//         Back to course
//       </Button>
//     </PageLoaderLayout>
//   );
// };

// export const AssessmentHasEndedRoute = ({ ...rest }) => {
//   return (
//     <Route {...rest} render={(props) => <AssessmentHasEnded {...props} />} />
//   );
// };
