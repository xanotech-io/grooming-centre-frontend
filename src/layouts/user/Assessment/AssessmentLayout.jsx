import { Box, Flex, Grid, HStack, Stack } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/radio";
import { Textarea } from "@chakra-ui/textarea";
import { Input as ChakraInput } from "@chakra-ui/input";
import { Spinner } from "@chakra-ui/spinner";
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
    handleAnswerChange,
    nav,
    isProctoringBlocked,
  } = useAssessment();

  const isSectionedExam = assessment?.examType === "sectioned" || assessment?.examType === "hybrid";
  const sectionNames = assessment?.sections?.length
    ? assessment.sections.map((s) => s.name)
    : [...new Set((assessment?.questions ?? []).map((q) => q.section).filter(Boolean))];

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

      {isProctoringBlocked && !submitStatus.success && !submitStatus.error && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="blackAlpha.700"
          zIndex={1400}
          justifyContent="center"
          alignItems="center"
          direction="column"
          gap={4}
        >
          <Spinner size="xl" color="white" thickness="4px" />
          <Text color="white" fontWeight="600">Submitting your exam…</Text>
        </Flex>
      )}

      {isProctoringBlocked && submitStatus.error && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="blackAlpha.700"
          zIndex={1400}
          justifyContent="center"
          alignItems="center"
          direction="column"
          gap={4}
          textAlign="center"
          px={6}
        >
          <Text color="white" fontWeight="600">Your exam couldn't be submitted automatically.</Text>
          <Text color="white" fontSize="sm">{submitStatus.error}</Text>
          <Text color="white" fontSize="sm">Taking you back to the course…</Text>
        </Flex>
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
                  {isSectionedExam && currentQuestion?.section && (
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color="primary.base"
                      textTransform="uppercase"
                      letterSpacing="wide"
                      marginBottom={1}
                    >
                      Section {sectionNames.indexOf(currentQuestion.section) + 1}: {currentQuestion.section}
                    </Text>
                  )}
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

                    <QuestionInput
                      question={currentQuestion}
                      selectedAnswers={selectedAnswers}
                      onOptionSelect={handleOptionSelect}
                      onAnswerChange={handleAnswerChange}
                    />

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

                    {isSectionedExam && sectionNames.length > 0 ? (
                      <Stack spacing={4}>
                        {sectionNames.map((name, si) => {
                          const sectionQs = (assessment?.questions ?? []).filter(
                            (q) => q.section === name
                          );
                          if (sectionQs.length === 0) return null;
                          return (
                            <Box key={name}>
                              <Text as="level5" bold color="accent.3" marginBottom={2}>
                                Section {si + 1}: {name}
                              </Text>
                              <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                                {sectionQs.map((question) => (
                                  <ButtonNavItem
                                    key={question.id}
                                    number={question.questionIndex + 1}
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
                          );
                        })}
                        {(() => {
                          const unassigned = (assessment?.questions ?? []).filter(
                            (q) => !q.section
                          );
                          if (unassigned.length === 0) return null;
                          return (
                            <Box>
                              <Text as="level5" bold color="accent.3" marginBottom={2}>
                                Unsectioned
                              </Text>
                              <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                                {unassigned.map((question) => (
                                  <ButtonNavItem
                                    key={question.id}
                                    number={question.questionIndex + 1}
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
                          );
                        })()}
                      </Stack>
                    ) : (
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
                    )}
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

const QuestionInput = ({ question, selectedAnswers, onOptionSelect, onAnswerChange }) => {
  const qType = question?.questionType || "MCQ";
  const currentAnswer = selectedAnswers[question?.id];

  // ── MCQ / True-False ──
  if (qType === "MCQ" || qType === "TrueFalse") {
    return (
      <RadioGroup
        marginBottom={8}
        flex={1}
        onChange={onOptionSelect}
        value={currentAnswer || "default"}
      >
        <Stack spacing={4}>
          {question?.options?.map((option) => (
            <Radio key={option.id} value={option.id}>
              <Text>{option.name}</Text>
            </Radio>
          ))}
          <Radio value="default" display="none">
            <Text>default</Text>
          </Radio>
        </Stack>
      </RadioGroup>
    );
  }

  // ── Fill in the Blank ──
  if (qType === "FillBlank") {
    return (
      <Box marginBottom={8}>
        <Box
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
          borderRadius="md"
          px={4}
          py={3}
          mb={4}
        >
          <Text fontSize="sm" color="blue.700">
            Type the word or phrase that completes the blank in the question above.
          </Text>
        </Box>
        <ChakraInput
          value={currentAnswer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here…"
          size="lg"
          bg="white"
          borderColor="gray.300"
          borderRadius="md"
          _focus={{ borderColor: "primary.base", boxShadow: "0 0 0 1px var(--chakra-colors-primary-base)" }}
        />
        {currentAnswer && (
          <Text fontSize="xs" color="gray.400" mt={1}>
            Your answer: <b>{currentAnswer}</b>
          </Text>
        )}
      </Box>
    );
  }

  // ── Short Answer ──
  if (qType === "ShortAnswer") {
    const wordCount = (currentAnswer || "").trim().split(/\s+/).filter(Boolean).length;
    return (
      <Box marginBottom={8}>
        <Box
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
          borderRadius="md"
          px={4}
          py={3}
          mb={4}
        >
          <Text fontSize="sm" color="blue.700">
            Write a concise answer. Your response will be reviewed by the instructor.
          </Text>
        </Box>
        <Textarea
          value={currentAnswer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write your short answer here…"
          rows={5}
          bg="white"
          borderColor="gray.300"
          borderRadius="md"
          resize="vertical"
          _focus={{ borderColor: "primary.base", boxShadow: "0 0 0 1px var(--chakra-colors-primary-base)" }}
        />
        <Text fontSize="xs" color="gray.400" mt={1} textAlign="right">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </Text>
      </Box>
    );
  }

  // ── Essay ──
  if (qType === "Essay") {
    const wordCount = (currentAnswer || "").trim().split(/\s+/).filter(Boolean).length;
    return (
      <Box marginBottom={8}>
        <Box
          bg="purple.50"
          border="1px solid"
          borderColor="purple.200"
          borderRadius="md"
          px={4}
          py={3}
          mb={4}
        >
          <Text fontSize="sm" color="purple.700" fontWeight="500" mb={1}>
            Essay Question
          </Text>
          <Text fontSize="sm" color="purple.600">
            Write a well-structured response. Your essay will be manually graded by the instructor based on the rubric.
          </Text>
        </Box>
        <Textarea
          value={currentAnswer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write your essay response here. Organise your thoughts clearly, support your arguments with relevant examples, and review before submitting."
          rows={12}
          bg="white"
          borderColor="gray.300"
          borderRadius="md"
          resize="vertical"
          fontSize="sm"
          lineHeight="1.7"
          _focus={{ borderColor: "primary.base", boxShadow: "0 0 0 1px var(--chakra-colors-primary-base)" }}
        />
        <Flex justifyContent="flex-end" mt={1}>
          <Text fontSize="xs" color={wordCount > 50 ? "green.500" : "gray.400"}>
            {wordCount} word{wordCount !== 1 ? "s" : ""}
          </Text>
        </Flex>
      </Box>
    );
  }

  // ── Matching ──
  if (qType === "Matching") {
    let pairs = [];
    try {
      const raw = question?.pairs;
      pairs = typeof raw === "string" ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch {
      pairs = [];
    }

    const savedAnswers = (() => {
      try { return JSON.parse(currentAnswer || "{}"); } catch { return {}; }
    })();

    const rightValues = pairs.map((p) => p.right).filter(Boolean);

    const handlePairAnswer = (leftKey, value) => {
      const updated = { ...savedAnswers, [leftKey]: value };
      onAnswerChange(JSON.stringify(updated));
    };

    const answeredCount = Object.keys(savedAnswers).filter((k) => savedAnswers[k]).length;

    return (
      <Box marginBottom={8}>
        <Box
          bg="orange.50"
          border="1px solid"
          borderColor="orange.200"
          borderRadius="md"
          px={4}
          py={3}
          mb={5}
        >
          <Text fontSize="sm" color="orange.700" fontWeight="500" mb={1}>
            Matching Question
          </Text>
          <Text fontSize="sm" color="orange.600">
            For each item on the left, select the correct match from the dropdown on the right.
          </Text>
        </Box>

        {pairs.length === 0 ? (
          <Text color="gray.400" fontSize="sm">No matching pairs available for this question.</Text>
        ) : (
          <>
            {/* Column headers */}
            <Grid templateColumns="1fr 32px 1fr" gap={3} mb={3} px={1}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                Item
              </Text>
              <Box />
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                Match
              </Text>
            </Grid>

            <Stack spacing={3}>
              {pairs.map((pair, i) => {
                const isAnswered = !!savedAnswers[pair.left];
                return (
                  <Grid key={i} templateColumns="1fr 32px 1fr" gap={3} alignItems="center">
                    {/* Left item */}
                    <Box
                      bg={isAnswered ? "green.50" : "gray.50"}
                      border="1px solid"
                      borderColor={isAnswered ? "green.300" : "gray.200"}
                      borderRadius="md"
                      px={4}
                      py={3}
                      fontSize="sm"
                      fontWeight="500"
                      transition="all 0.2s"
                    >
                      {pair.left}
                    </Box>

                    {/* Arrow */}
                    <Flex justifyContent="center" color="gray.400">
                      <Text fontSize="lg">→</Text>
                    </Flex>

                    {/* Right: select from pool */}
                    <Box
                      as="select"
                      value={savedAnswers[pair.left] || ""}
                      onChange={(e) => handlePairAnswer(pair.left, e.target.value)}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={isAnswered ? "green.300" : "gray.300"}
                      bg={isAnswered ? "green.50" : "white"}
                      px={3}
                      py="10px"
                      fontSize="sm"
                      width="100%"
                      cursor="pointer"
                      _focus={{ outline: "2px solid", outlineColor: "primary.base", outlineOffset: "2px" }}
                      transition="all 0.2s"
                    >
                      <option value="">— Select a match —</option>
                      {rightValues.map((rv) => (
                        <option key={rv} value={rv}>{rv}</option>
                      ))}
                    </Box>
                  </Grid>
                );
              })}
            </Stack>

            <Flex justifyContent="flex-end" mt={3}>
              <Text fontSize="xs" color={answeredCount === pairs.length ? "green.500" : "gray.400"}>
                {answeredCount} of {pairs.length} matched
              </Text>
            </Flex>
          </>
        )}
      </Box>
    );
  }

  return null;
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
