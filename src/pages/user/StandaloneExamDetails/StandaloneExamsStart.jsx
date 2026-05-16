import { Box, Flex, Grid, HStack, Stack, Center } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/radio";
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
import breakpoints from "../../../theme/breakpoints";
import useStandalone from "./standaloneHooks/useStandalone";
import congratsIcon from "../../../assets/images/congratsIcon.png";
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
    modalManager,
    shouldSubmit,
    selectedAnswers,
    timerCountdownManger,
    submitStatus,
    handleSubmitConfirmation,
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
      setModal((prevModal) => ({ ...prevModal, congrats: true }));
    } catch (error) {
      toast({
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

  const handleSubmit = () => {
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
      {modal.state && (
        <Box
          zIndex="100"
          backgroundColor="rgba(0, 0, 0, 0.6)"
          width="100vw"
          top="0"
          right="0"
          position="fixed"
          height="100vh"
          padding="40px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            borderRadius="10px"
            backgroundColor="white"
            width="525px"
            height="256px"
          >
            {modal.congrats ? (
              <Box>
                {modal.score ? (
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                    gap="30px"
                    padding="20px"
                  >
                    <p style={{ fontWeight: "bold" }}>Result Overview</p>
                    <p>Your Score is</p>
                    {loading ? (
                      <Center height="100%">
                        <Spinner />
                      </Center>
                    ) : (
                      <>
                        <p>{grade}%</p>
                        <Button link={`/standalone-exams`}>
                          Back to Exams
                        </Button>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                    gap="20px"
                    padding="20px"
                  >
                    <p style={{ fontWeight: "bold" }}>Congratulations</p>
                    <img src={congratsIcon} width={"50px"} alt="congrats" />
                    <p> completed</p>
                    <Button onClick={() => handleViewResult()}>
                      View Result
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box padding="15px">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      marginTop: "7px",
                    }}
                  >
                    Are you sure you want to submit your examination?
                  </h2>
                  <Text marginBottom="10px" marginTop="10px">
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
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    float: "right",
                    marginTop: "50px",
                  }}
                >
                  <Button
                    onClick={() => setModal({ ...modal, state: false })}
                    secondary
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => handleExamSubmit()}>Submit</Button>
                </div>
              </Box>
            )}
          </Box>
        </Box>
      )}
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
            <img
              src={congratsIcon}
              width={"60px"}
              alt="done"
              style={{ margin: "0 auto 16px" }}
            />
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
                        {currentQuestion?.standAloneExaminationOption?.map(
                          (option) => (
                            <Radio key={option.id} value={option.id}>
                              <Text>{option.name}</Text>
                            </Radio>
                          ),
                        )}

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
                          borderColor="#800020"
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

const ButtonNavItem = ({ number, answered, isCurrent, onClick }) => {
  const styleProps = answered
    ? {
        backgroundColor: "#800020",
        color: "white",
        borderColor: "transparent",
      }
    : {
        borderColor: "#800020",
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
