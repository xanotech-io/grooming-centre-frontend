import { Box, Flex, Grid, HStack } from "@chakra-ui/layout";
import { useCallback, useEffect, useState } from "react";
import { Route } from "react-router";
import {
  Button,
  Heading,
  Image,
  NavigationBlocker,
  RichTextToView,
  Spinner,
  Text,
} from "../../../components";
import { EmptyState, PageLoaderLayout } from "../../../layouts";
import { CustomModal } from "../../../layouts/user/Assessment/Modal";
import {
  QuestionInput,
  normalizeQuestionType,
} from "../../../layouts/user/Examination/ExaminationLayout";
import breakpoints from "../../../theme/breakpoints";
import useStandalone from "./standaloneHooks/useStandalone";
import { useToast } from "@chakra-ui/toast";
import { capitalizeFirstLetter } from "../../../utils";
import { submitSAExamAnswers, getSAExamResult } from "../../../services";
import { useQueryParams } from "../../../hooks";
import { useHistory } from "react-router-dom";
const StandaloneExamsStart = () => {
  const {
    assessment,
    currentQuestion,
    disablePreviousQuestion,
    error,
    isLoading,
    shouldSubmit,
    selectedAnswers,
    timerCountdownManger,
    submitStatus,
    handleQuestionChange,
    handleNextQuestion,
    handlePreviousQuestion,
    handleOptionSelect,
    pageLength,
    index,
    end,
  } = useStandalone();
  const toast = useToast();
  const isExamination = useQueryParams().get("exam");
  const [grade, setGrade] = useState("");
  const [loading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submissionMeta, setSubmissionMeta] = useState({});
  const { push } = useHistory();
  const [modal, setModal] = useState({
    state: false,
    congrats: false,
    score: false,
  });

  useEffect(() => {
    if (!isExamination) return;
    getSAExamResult(isExamination)
      .then(({ result }) => {
        if (result) {
          setAlreadySubmitted(true);
          setGrade(result.totalScore ?? result.score ?? "");
        }
      })
      .catch(() => {});
  }, [isExamination]);
  const [exitAttempts, setExitAttempts] = useState(0);
  const totalSteps = 3;
  const handleExamSubmit = useCallback(async () => {
    try {
      const answers = Object.entries(selectedAnswers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
          timeTaken: 0,
        }),
      );
      const body = {
        answers,
        submissionTime: new Date().toISOString(),
        timeTaken: 0,
      };
      const { submission } = await submitSAExamAnswers(isExamination, body);
      toast({
        description: capitalizeFirstLetter(
          exitAttempts === totalSteps
            ? "Examination auto submitted successfully"
            : "Examination submitted successfully",
        ),
        position: "top",
        status: "success",
      });
      if (submission?.totalScore != null) setGrade(submission.totalScore);
      else if (submission?.score != null) setGrade(submission.score);
      setSubmissionMeta({
        attemptNumber: submission?.attemptNumber,
        attemptsRemaining: submission?.attemptsRemaining,
        canRetry: submission?.canRetry,
        resultPending: submission?.resultPending,
      });
      setModal((prevModal) => ({ ...prevModal, congrats: true }));
    } catch (error) {
      toast({
        title: error.statusCode === 403 ? "Maximum attempts reached" : undefined,
        description: error?.response?.data?.message || error.message,
        position: "top",
        status: "error",
      });
    }
  }, [isExamination, selectedAnswers, exitAttempts, totalSteps, toast]);

  const handleExitAttempt = useCallback(() => {
    if (exitAttempts < totalSteps) {
      setExitAttempts((prev) => prev + 1);
    }
    if (exitAttempts === totalSteps) {
      push("/standalone-exams");
      handleExamSubmit();
    }
  }, [exitAttempts, totalSteps, push, handleExamSubmit]);

  useEffect(() => {
    const handleUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Standard for most browsers
      handleExitAttempt();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleExitAttempt();
        exitAttempts !== 3 &&
          toast({
            position: "top",
            status: "error",
            title:
              "Note leaving this tab three times will automatically submit your exam",
          });
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [exitAttempts, handleExitAttempt, toast]);

  const handleViewResult = useCallback(() => {
    setModal((prev) => ({ ...prev, score: true }));
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setModal({ ...modal, state: true });
  };

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

  const renderContent = () => (
    <>
      <CustomModal
        isOpen={modal.state}
        onClose={() => setModal({ state: false, congrats: false, score: false })}
        canClose={!modal.congrats}
        prompt={
          modal.congrats
            ? null
            : {
                heading: "Are you sure you want to submit your examination?",
                body: (
                  <>
                    <Text marginBottom={5}>
                      Please note that you will not be able to retake this
                      examination after you submit. Double check your answers
                      before submitting.
                    </Text>
                    <Text marginBottom={5}>
                      You answered{" "}
                      <Box as="b" color="secondary.6" fontSize="text.level3">
                        {Reflect.ownKeys(selectedAnswers).length}
                      </Box>{" "}
                      out of{" "}
                      <Box as="b" fontSize="text.level3">
                        {pageLength + 1}
                      </Box>{" "}
                      questions
                    </Text>
                  </>
                ),
                submitProps: { onClick: handleExamSubmit },
              }
        }
      >
        {modal.congrats &&
          (modal.score ? (
            <ExamResultContent
              grade={grade}
              loading={loading}
              resultPending={submissionMeta.resultPending}
            />
          ) : (
            <ExamSubmittedContent
              onViewResult={handleViewResult}
              attemptNumber={submissionMeta.attemptNumber}
              attemptsRemaining={submissionMeta.attemptsRemaining}
              canRetry={submissionMeta.canRetry}
              onRetry={submissionMeta.canRetry ? () => window.location.reload() : undefined}
            />
          ))}
      </CustomModal>

      {exitAttempts === totalSteps ? null : (
        <NavigationBlocker
          when={!submitStatus.success && !error && isLoading && end === true}
          disable={end}
        />
      )}

      {isLoading ? (
        <PageLoaderLayout />
      ) : alreadySubmitted ? (
        <Flex
          justifyContent="center"
          alignItems="center"
          height="100vh"
          backgroundColor="accent.1"
        >
          <Box
            bg="white"
            p={10}
            borderRadius="10px"
            shadow="0px 2px 7px rgba(0,0,0,0.1)"
            textAlign="center"
            maxW="480px"
            w="100%"
          >
            <Box
              w="64px"
              h="64px"
              bg="green.100"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Text fontSize="2xl">✓</Text>
            </Box>
            <Heading as="h2" fontSize="heading.h4" mb={3}>
              Already Submitted
            </Heading>
            <Text mb={2}>You have already submitted this examination.</Text>
            {grade !== "" && (
              <Text fontWeight="bold" fontSize="text.level2" mb={6}>
                Your Score: {grade}%
              </Text>
            )}
            <Button link="/standalone-exams">Back to Exams</Button>
          </Box>
        </Flex>
      ) : error ? (
        <EmptyState
          height="100vh"
          cta={
            <Button link={`/standalone-exams`} marginTop={10}>
              Back to Exams
            </Button>
          }
          heading={error}
          description="Something went wrong, please try again later"
        />
      ) : (
        <>
          <Flex
            justifyContent="center"
            alignItems="flex-start"
            backgroundColor="accent.1"
            height="100vh"
            width="100vw"
            pb={20}
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
                    `Question ${index + 1} of ${pageLength + 1}`,
                  )}
                  <Flex
                    flexDirection="column"
                    justifyContent="space-between"
                    as="form"
                    flex={1}
                    // minHeight="500px"
                    onSubmit={shouldSubmit ? handleSubmit : handleNextQuestion}
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

                    <QuestionInput
                      question={{
                        ...currentQuestion,
                        questionType: normalizeQuestionType(currentQuestion?.questionType),
                        options: currentQuestion?.standAloneExaminationOption?.map((opt) => ({
                          id: opt.id,
                          isAnswer: opt.isAnswer,
                          name: opt.answer,
                          optionIndex: opt.optionIndex,
                        })),
                      }}
                      selectedAnswers={selectedAnswers}
                      onOptionSelect={handleOptionSelect}
                      onAnswerChange={handleOptionSelect}
                    />

                    <Flex justifyContent="space-between">
                      <Button
                        secondary
                        onClick={handlePreviousQuestion}
                        disabled={disablePreviousQuestion}
                      >
                        Previous
                      </Button>

                      {shouldSubmit ? (
                        <Button onClick={handleSubmit}>Submit</Button>
                      ) : (
                        <Button type="button" onClick={handleNextQuestion}>
                          Next
                        </Button>
                      )}
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
                      {assessment?.question?.map((question, index) => (
                        <ButtonNavItem
                          key={index}
                          number={index + 1}
                          isCurrent={
                            currentQuestion?.questionIndex ===
                            question.questionIndex
                          }
                          answered={selectedAnswers[question?.id]}
                          onClick={() => {
                            handleQuestionChange(index);
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

const ExamSubmittedContent = ({
  onViewResult,
  attemptNumber,
  attemptsRemaining,
  canRetry,
  onRetry,
}) => (
  <Flex direction="column" alignItems="center" p={6} gap={4} textAlign="center">
    <Box
      w="64px"
      h="64px"
      bg="green.100"
      borderRadius="50%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize="2xl">✓</Text>
    </Box>
    <Heading fontSize="heading.h4">Examination Submitted!</Heading>
    <Text color="gray.500">
      Your examination has been submitted successfully.
    </Text>
    {attemptNumber != null && <Text color="gray.500">Attempt #{attemptNumber}</Text>}
    {canRetry && attemptsRemaining != null && (
      <Text color="gray.500">
        {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining.
      </Text>
    )}
    <Flex gap={3} marginTop={4}>
      {canRetry && onRetry && <Button onClick={onRetry}>Retry</Button>}
      <Button secondary={canRetry} onClick={onViewResult}>
        View Result
      </Button>
    </Flex>
  </Flex>
);

const ExamResultContent = ({ grade, loading, resultPending }) => (
  <Flex direction="column" alignItems="center" p={6} gap={4} textAlign="center">
    <Heading fontSize="heading.h4">Result Overview</Heading>
    {loading ? (
      <Spinner />
    ) : resultPending ? (
      <>
        <Text color="gray.500">Your result is pending.</Text>
        <Button link="/standalone-exams" marginTop={4}>
          Back to Exams
        </Button>
      </>
    ) : (
      <>
        <Text color="gray.500">Your Score</Text>
        <Text fontSize="heading.h3" fontWeight="bold" color="primary.base">
          {grade}%
        </Text>
        <Button link="/standalone-exams" marginTop={4}>
          Back to Exams
        </Button>
      </>
    )}
  </Flex>
);

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

export const StandaloneExamsStartRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <StandaloneExamsStart {...props} />} />
  );
};
