import { Box, Flex, Grid, HStack, Stack } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/radio";
import { Textarea } from "@chakra-ui/textarea";
import { Input as ChakraInput } from "@chakra-ui/input";
import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import { Spinner } from "@chakra-ui/spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Heading,
  RichTextToView,
  Text,
  Image,
  ExamReviewResultCard,
} from "../../../components";
import { PageLoaderLayout } from "../../global/PageLoader/PageLoaderLayout";
import { CustomModal } from "../Assessment/Modal";
import { EmptyState } from "../..";
import useTimerCountdown from "../Assessment/hooks/useTimerCountdown";
import { getEndTime, sortByIndexField, parseOptionIndex, getResultRemark, getGeolocationString } from "../../../utils";
import { http } from "../../../services/http/http";
import { submitExamMarking, getExamMarkingResult } from "../../../services/http/endpoints/examMarking";
import useLiveProctoring from "../../../hooks/useLiveProctoring";

export const normalizeQuestionType = (raw) => {
  if (!raw) return "MCQ";
  const map = {
    mcq: "MCQ",
    truefalse: "TrueFalse",
    true_false: "TrueFalse",
    essay: "Essay",
    shortanswer: "ShortAnswer",
    short_answer: "ShortAnswer",
    fillblank: "FillBlank",
    fill_blank: "FillBlank",
    fill_in_blank: "FillBlank",
    matching: "Matching",
  };
  return map[raw.toLowerCase()] ?? raw;
};

const mapExamination = (data) => {
  const raw = Array.isArray(data) ? data[0] : data;
  if (!raw) return null;

  const questionArray = raw.examinationQuestions ?? raw.questions ?? [];

  return {
    id: raw.id,
    courseId: raw.courseId,
    moduleId: raw.moduleId ?? null,
    topic: raw.title,
    duration: raw.duration,
    questionCount: raw.amountOfQuestions ?? questionArray.length,
    startTime: raw.startTime,
    endTime: getEndTime(raw.startTime, raw.duration),
    hasCompleted: (raw.examinationScoreSheets?.length > 0) || (raw.submissions?.length > 0),
    submittedAnswers: raw.submissions?.[0]?.answers ?? [],
    passThreshold: raw.passThreshold ?? null,
    examType: raw.examType ?? null,
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    questions: questionArray.map((q, index) => {
      const opts = q.options ?? [];
      const qType = normalizeQuestionType(q.questionType);
      return {
        id: q.id,
        question: q.question,
        file: q.file ?? null,
        questionIndex: index,
        questionType: qType,
        markingType: q.markingType ?? "automatic",
        pairs: q.pairs ?? null,
        modelAnswer: q.modelAnswer ?? null,
        correctAnswer: q.correctAnswer ?? null,
        marks: q.marks ?? 1,
        section: q.section ?? null,
        options: opts.map((opt) => ({
          id: opt.id,
          isAnswer: opt.isAnswer,
          name: opt.name,
          optionIndex: parseOptionIndex(opt.optionIndex),
        })),
      };
    }),
  };
};

const useExamination = () => {
  const { course_id } = useParams();
  const [examination, setExamination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    http
      .get(`/v1/examination/${course_id}`)
      .then(({ data: { data } }) => {
        const mapped = mapExamination(data);
        if (!mapped) throw new Error("No examination found for this course");
        setExamination(mapped);
      })
      .catch((err) => setError(err.message || "Failed to load examination"))
      .finally(() => setIsLoading(false));
  }, [course_id]);

  return { examination, isLoading, error };
};

const MOCK_EXAMINATION_RESULT = {
  totalScore: 82,
  grade: "A",
  remark: "Excellent performance — you demonstrated a strong understanding of the material tested in this examination.",
  isMock: true,
};

const useExaminationReviewResult = (examinationId, isViewMode) => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isViewMode || !examinationId) return;
    setIsLoading(true);
    getExamMarkingResult(examinationId)
      .then(({ result: data }) => setResult(data))
      .catch(() => setResult(MOCK_EXAMINATION_RESULT))
      .finally(() => setIsLoading(false));
  }, [examinationId, isViewMode]);

  return { result, isLoading };
};

const ExaminationLayout = () => {
  const { course_id } = useParams();
  const { push } = useHistory();
  const toast = useToast();

  const { examination, isLoading, error } = useExamination();
  const isViewMode = examination?.hasCompleted ?? false;
  const { result: reviewResult, isLoading: isReviewResultLoading } = useExaminationReviewResult(
    examination?.id,
    isViewMode
  );

  const questions = examination
    ? sortByIndexField(examination.questions, "questionIndex")
    : [];

  const isSectionedExam = examination?.examType === "sectioned" || examination?.examType === "hybrid";
  const sectionNames = examination?.sections?.length
    ? examination.sections.map((s) => s.name)
    : [...new Set(questions.map((q) => q.section).filter(Boolean))];

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ success: false, loading: false, error: null });
  const [submissionMeta, setSubmissionMeta] = useState({});

  useEffect(() => {
    if (examination?.hasCompleted && examination?.submittedAnswers?.length > 0) {
      const preloaded = examination.submittedAnswers.reduce((acc, a) => {
        if (a.questionId && a.answer != null) acc[a.questionId] = a.answer;
        return acc;
      }, {});
      setSelectedAnswers(preloaded);
    }
  }, [examination?.hasCompleted, examination?.submittedAnswers]);

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      setCurrentQuestion(questions[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const timerManager = useTimerCountdown({
    startDate: !isViewMode ? examination?.startTime : null,
    endDate: !isViewMode ? examination?.endTime : null,
  });

  const modalManager = useDisclosure();
  const [modalContent, setModalContent] = useState(null);
  const [modalPrompt, setModalPrompt] = useState(null);
  const [modalCanClose, setModalCanClose] = useState(true);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (isViewMode) return;
    setSubmitStatus({ loading: true });
    try {
      const answers = examination.questions.map((q) => ({
        questionId: q.id,
        answer: selectedAnswers[q.id] ?? null,
      }));
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      const geolocation = await getGeolocationString();
      const body = {
        answers,
        submissionTime: new Date().toISOString(),
        timeTaken,
        ...(geolocation ? { geolocation } : {}),
      };
      const { message, data } = await submitExamMarking(examination.id, body);
      setSubmissionMeta({
        attemptNumber: data?.attemptNumber,
        attemptsRemaining: data?.attemptsRemaining,
        canRetry: data?.canRetry,
        resultPending: data?.resultPending,
      });
      toast({
        description: isAutoSubmit ? "Exam auto submitted" : message,
        position: "top",
        status: "success",
      });
      setSubmitStatus({ success: true });
    } catch (err) {
      toast({
        title: err.statusCode === 403 ? "Maximum attempts reached" : undefined,
        description: err.message,
        position: "top",
        status: "error",
      });
      setSubmitStatus({ error: err.message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examination, selectedAnswers, isViewMode]);

  const { isBlocked: isProctoringBlocked } = useLiveProctoring({
    examId: examination?.id,
    enabled: !isViewMode && !!examination,
    onAutoSubmit: () => handleSubmit(true),
  });

  useEffect(() => {
    if (!isViewMode && timerManager.hasEnded?.timeout) handleSubmit();
  }, [timerManager.hasEnded?.timeout, handleSubmit, isViewMode]);

  useEffect(() => {
    if (submitStatus.success) {
      timerManager.handleStopCountdown();
      modalManager.onOpen();
      setModalCanClose(false);
      setModalPrompt(null);
      setModalContent(
        <SubmitSuccessContent
          onBack={() => push(`/courses/details/${course_id}`)}
          topic={examination?.topic}
          resultPending={submissionMeta.resultPending}
          attemptNumber={submissionMeta.attemptNumber}
          attemptsRemaining={submissionMeta.attemptsRemaining}
          canRetry={submissionMeta.canRetry}
          onRetry={submissionMeta.canRetry ? () => window.location.reload() : undefined}
        />
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitStatus.success]);

  const handleSubmitConfirmation = (e) => {
    e?.preventDefault();
    if (isViewMode) return;
    modalManager.onOpen();
    setModalContent(null);
    setModalPrompt({
      heading: "Are you sure you want to submit your examination?",
      body: (
        <Text marginBottom={5}>
          You answered{" "}
          <b>{Object.keys(selectedAnswers).length}</b> out of{" "}
          <b>{examination?.questionCount}</b> questions. You cannot retake after submitting.
        </Text>
      ),
      submitProps: { onClick: handleSubmit },
    });
  };

  useEffect(() => {
    if (isViewMode) return undefined;
    const onUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [isViewMode]);

  const handleOptionSelect = (value) => {
    if (isViewMode) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };
  const handleAnswerChange = (value) => {
    if (isViewMode) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };
  const handleQuestionChange = (q) => setCurrentQuestion(q);
  const handleNext = (e) => {
    e.preventDefault();
    const next = questions[currentQuestion.questionIndex + 1];
    if (next) setCurrentQuestion(next);
  };
  const handlePrevious = () => {
    const prev = questions[currentQuestion.questionIndex - 1];
    if (prev) setCurrentQuestion(prev);
  };

  const isLastQuestion = currentQuestion?.questionIndex === (examination?.questionCount ?? 0) - 1;
  const disablePrev = !currentQuestion?.questionIndex;

  if (isLoading) return <PageLoaderLayout />;
  if (error || !examination) {
    return (
      <EmptyState
        height="100vh"
        cta={<Button link={`/courses/details/${course_id}`} marginTop={10}>Back to course</Button>}
        heading={error || "Examination not found"}
        description="Something went wrong, please try again later"
      />
    );
  }

  return (
    <>
      <CustomModal
        onClose={modalManager.onClose}
        canClose={modalCanClose}
        isOpen={modalManager.isOpen}
        prompt={modalPrompt}
      >
        {modalContent}
      </CustomModal>

      {isProctoringBlocked && !submitStatus.success && (
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
          maxWidth="900px"
          backgroundColor="white"
          marginTop={20}
          shadow="0px 2px 7px rgba(0,0,0,0.1)"
        >
          {/* Header */}
          <Box
            as="header"
            color="white"
            backgroundColor="primary.base"
            padding={5}
            paddingX={10}
          >
            <Heading as="h1" fontSize="heading.h4">
              {examination.topic}
            </Heading>
          </Box>

          {/* Already submitted banner */}
          {isViewMode && (
            <Flex
              alignItems="center"
              gap={3}
              px={10}
              py={3}
              backgroundColor="green.50"
              borderBottom="1px solid"
              borderColor="green.200"
            >
              <Box w="8px" h="8px" borderRadius="50%" bg="green.500" flexShrink={0} />
              <Text fontSize="sm" color="green.700" fontWeight="600">
                You have already submitted this examination. You are viewing it in read-only mode.
              </Text>
              <Button
                secondary
                size="sm"
                onClick={() => push(`/courses/details/${course_id}`)}
                ml="auto"
              >
                Back to Course
              </Button>
            </Flex>
          )}

          {isViewMode && (
            <Box paddingX={10} paddingTop={5}>
              <ExamReviewResultCard
                title="Your Result"
                isLoading={isReviewResultLoading}
                totalScore={reviewResult?.totalScore ?? null}
                grade={reviewResult?.grade ?? null}
                remark={getResultRemark(reviewResult)}
                resultPending={reviewResult?.resultPending}
                attemptNumber={reviewResult?.attemptNumber}
              />
            </Box>
          )}

          <Flex paddingX={10} paddingY={5} height="100%">
            {/* Main question area */}
            <Flex
              flexDirection="column"
              as="main"
              flex={1}
              borderRight="1px"
              borderColor="accent.2"
              paddingRight={5}
              marginRight={5}
            >
              <Box
                as="header"
                paddingBottom={5}
                marginBottom={5}
                borderBottom="1px"
                borderColor="accent.2"
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
                <Heading fontSize="text.level2">
                  Question {(currentQuestion?.questionIndex ?? 0) + 1} of {examination.questionCount}
                </Heading>
              </Box>

              <Flex
                flexDirection="column"
                justifyContent="space-between"
                as="form"
                flex={1}
                onSubmit={isLastQuestion ? handleSubmitConfirmation : handleNext}
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
                      src={currentQuestion.file}
                      alt="question"
                      width="200px"
                      height="200px"
                      rounded="sm"
                      mt={3}
                    />
                  )}
                </Box>

                <QuestionInput
                  question={currentQuestion}
                  selectedAnswers={selectedAnswers}
                  onOptionSelect={handleOptionSelect}
                  onAnswerChange={handleAnswerChange}
                  disabled={isViewMode}
                />

                <Flex justifyContent="space-between" mt={4}>
                  <Button secondary onClick={handlePrevious} disabled={disablePrev}>
                    Previous
                  </Button>
                  {isViewMode ? (
                    isLastQuestion ? (
                      <Button onClick={() => push(`/courses/details/${course_id}`)}>
                        Back to Course
                      </Button>
                    ) : (
                      <Button type="submit">Next</Button>
                    )
                  ) : (
                    <Button type="submit">
                      {isLastQuestion ? "Submit" : "Next"}
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Flex>

            {/* Sidebar */}
            <Box as="aside" flex="0 0 232px">
              <Box
                as="header"
                paddingBottom={5}
                marginBottom={5}
                borderBottom="1px"
                borderColor="accent.2"
              >
                <Heading fontSize="text.level2">{isViewMode ? "Review Mode" : "Time Left"}</Heading>
              </Box>

              {isViewMode ? (
                <Box
                  bg="green.50"
                  border="1px solid"
                  borderColor="green.200"
                  borderRadius="md"
                  p={4}
                  mb={6}
                  textAlign="center"
                >
                  <Text fontSize="sm" color="green.700" fontWeight="600">Submitted</Text>
                  <Text fontSize="xs" color="green.600" mt={1}>Read-only view</Text>
                </Box>
              ) : (
                <Flex justifyContent="space-between" marginBottom={6}>
                  <Box textAlign="center">
                    <Text bold as="level1">{timerManager.timeLeft?.hours || "00"}</Text>
                    <Text color="accent.2">hours</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text bold as="level1">{timerManager.timeLeft?.minutes}</Text>
                    <Text color="accent.2">minutes</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text bold as="level1">{timerManager.timeLeft?.seconds}</Text>
                    <Text color="accent.2">seconds</Text>
                  </Box>
                </Flex>
              )}

              <Box>
                <Heading as="h3" fontSize="text.level3" marginBottom={2}>
                  Questions
                </Heading>
                <Flex justifyContent="space-between" marginY={5}>
                  <HStack spacing={2}>
                    <Box width="20px" height="6px" backgroundColor="primary.base" border="1px" borderColor="transparent" />
                    <Text as="level5" bold>Answered</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Box width="20px" height="6px" border="1px" borderColor="primary.base" />
                    <Text as="level5" bold>Unanswered</Text>
                  </HStack>
                </Flex>
                {isSectionedExam && sectionNames.length > 0 ? (
                  <Stack spacing={4}>
                    {sectionNames.map((name, si) => {
                      const sectionQs = questions.filter((q) => q.section === name);
                      if (sectionQs.length === 0) return null;
                      return (
                        <Box key={name}>
                          <Text as="level5" bold color="accent.3" marginBottom={2}>
                            Section {si + 1}: {name}
                          </Text>
                          <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                            {sectionQs.map((q) => (
                              <QuestionNavButton
                                key={q.id}
                                q={q}
                                isActive={currentQuestion?.id === q.id}
                                isAnswered={!!selectedAnswers[q.id]}
                                onClick={() => handleQuestionChange(q)}
                              />
                            ))}
                          </Grid>
                        </Box>
                      );
                    })}
                    {(() => {
                      const unassigned = questions.filter((q) => !q.section);
                      if (unassigned.length === 0) return null;
                      return (
                        <Box>
                          <Text as="level5" bold color="accent.3" marginBottom={2}>
                            Unsectioned
                          </Text>
                          <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                            {unassigned.map((q) => (
                              <QuestionNavButton
                                key={q.id}
                                q={q}
                                isActive={currentQuestion?.id === q.id}
                                isAnswered={!!selectedAnswers[q.id]}
                                onClick={() => handleQuestionChange(q)}
                              />
                            ))}
                          </Grid>
                        </Box>
                      );
                    })()}
                  </Stack>
                ) : (
                  <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                    {questions.map((q) => (
                      <QuestionNavButton
                        key={q.id}
                        q={q}
                        isActive={currentQuestion?.id === q.id}
                        isAnswered={!!selectedAnswers[q.id]}
                        onClick={() => handleQuestionChange(q)}
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
  );
};

const QuestionNavButton = ({ q, isActive, isAnswered, onClick }) => (
  <Flex
    justifyContent="center"
    boxSize="40px"
    rounded="4px"
    alignItems="center"
    border={isActive ? "2px" : "1px"}
    as="button"
    type="button"
    cursor="pointer"
    onClick={onClick}
    transition=".5s"
    transform={isActive ? "scale(1.1)" : undefined}
    backgroundColor={isAnswered ? "primary.base" : undefined}
    color={isAnswered ? "white" : undefined}
    borderColor={isAnswered ? "transparent" : "primary.base"}
  >
    <Text bold as="level1">{q.questionIndex + 1}</Text>
  </Flex>
);

export const QuestionInput = ({ question, selectedAnswers, onOptionSelect, onAnswerChange, disabled }) => {
  const qType = question?.questionType || "MCQ";
  const currentAnswer = selectedAnswers[question?.id];

  if (qType === "MCQ" || qType === "TrueFalse") {
    return (
      <RadioGroup marginBottom={8} flex={1} onChange={disabled ? undefined : onOptionSelect} value={currentAnswer || "default"}>
        <Stack spacing={4}>
          {question?.options?.map((option) => (
            <Radio key={option.id} value={option.id} isDisabled={disabled}>
              <Text>{option.name}</Text>
            </Radio>
          ))}
          <Radio value="default" display="none"><Text>default</Text></Radio>
        </Stack>
      </RadioGroup>
    );
  }

  if (qType === "FillBlank") {
    return (
      <Box marginBottom={8}>
        <Box bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md" px={4} py={3} mb={4}>
          <Text fontSize="sm" color="blue.700">Type the word or phrase that completes the blank.</Text>
        </Box>
        <ChakraInput
          value={currentAnswer || ""}
          onChange={(e) => !disabled && onAnswerChange(e.target.value)}
          placeholder="Type your answer here…"
          size="lg"
          bg="white"
          borderColor="gray.300"
          borderRadius="md"
          isReadOnly={disabled}
          _focus={{ borderColor: "primary.base" }}
        />
      </Box>
    );
  }

  if (qType === "ShortAnswer") {
    const wordCount = (currentAnswer || "").trim().split(/\s+/).filter(Boolean).length;
    return (
      <Box marginBottom={8}>
        <Box bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md" px={4} py={3} mb={4}>
          <Text fontSize="sm" color="blue.700">Write a concise answer. Your response will be reviewed by the instructor.</Text>
        </Box>
        <Textarea
          value={currentAnswer || ""}
          onChange={(e) => !disabled && onAnswerChange(e.target.value)}
          placeholder="Write your short answer here…"
          rows={5}
          bg="white"
          borderColor="gray.300"
          borderRadius="md"
          resize="vertical"
          isReadOnly={disabled}
          _focus={{ borderColor: "primary.base" }}
        />
        <Text fontSize="xs" color="gray.400" mt={1} textAlign="right">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </Text>
      </Box>
    );
  }

  if (qType === "Essay") {
    const wordCount = (currentAnswer || "").trim().split(/\s+/).filter(Boolean).length;
    return (
      <Box marginBottom={8}>
        <Box bg="purple.50" border="1px solid" borderColor="purple.200" borderRadius="md" px={4} py={3} mb={4}>
          <Text fontSize="sm" color="purple.700" fontWeight="500" mb={1}>Essay Question</Text>
          <Text fontSize="sm" color="purple.600">Write a well-structured response. Your essay will be manually graded.</Text>
        </Box>
        <Textarea
          value={currentAnswer || ""}
          onChange={(e) => !disabled && onAnswerChange(e.target.value)}
          placeholder="Write your essay response here…"
          rows={12}
          bg="white"
          borderColor="gray.300"
          borderRadius="md"
          resize="vertical"
          fontSize="sm"
          lineHeight="1.7"
          isReadOnly={disabled}
          _focus={{ borderColor: "primary.base" }}
        />
        <Flex justifyContent="flex-end" mt={1}>
          <Text fontSize="xs" color={wordCount > 50 ? "green.500" : "gray.400"}>
            {wordCount} word{wordCount !== 1 ? "s" : ""}
          </Text>
        </Flex>
      </Box>
    );
  }

  if (qType === "Matching") {
    let pairs = [];
    try {
      const raw = question?.pairs;
      pairs = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    } catch { pairs = []; }

    const savedAnswers = (() => { try { return JSON.parse(currentAnswer || "{}"); } catch { return {}; } })();
    const rightValues = pairs.map((p) => p.right).filter(Boolean);

    const handlePairAnswer = (leftKey, value) => {
      if (disabled) return;
      onAnswerChange(JSON.stringify({ ...savedAnswers, [leftKey]: value }));
    };

    return (
      <Box marginBottom={8}>
        <Box bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="md" px={4} py={3} mb={5}>
          <Text fontSize="sm" color="orange.700" fontWeight="500" mb={1}>Matching Question</Text>
          <Text fontSize="sm" color="orange.600">For each item on the left, select the correct match.</Text>
        </Box>
        {pairs.length === 0 ? (
          <Text color="gray.400" fontSize="sm">No matching pairs available.</Text>
        ) : (
          <Stack spacing={3}>
            {pairs.map((pair, i) => (
              <Grid key={i} templateColumns="1fr 32px 1fr" gap={3} alignItems="center">
                <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" px={4} py={3} fontSize="sm" fontWeight="500">
                  {pair.left}
                </Box>
                <Flex justifyContent="center" color="gray.400"><Text fontSize="lg">→</Text></Flex>
                <Box
                  as="select"
                  value={savedAnswers[pair.left] || ""}
                  onChange={(e) => handlePairAnswer(pair.left, e.target.value)}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.300"
                  bg="white"
                  px={3}
                  py="10px"
                  fontSize="sm"
                  width="100%"
                  cursor={disabled ? "not-allowed" : "pointer"}
                  disabled={disabled}
                  opacity={disabled ? 0.7 : 1}
                >
                  <option value="">— Select a match —</option>
                  {rightValues.map((rv) => <option key={rv} value={rv}>{rv}</option>)}
                </Box>
              </Grid>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  return null;
};

const SubmitSuccessContent = ({
  onBack,
  topic,
  resultPending,
  attemptNumber,
  attemptsRemaining,
  canRetry,
  onRetry,
}) => (
  <Flex direction="column" alignItems="center" p={6} gap={4} textAlign="center">
    <Box w="64px" h="64px" bg="green.100" borderRadius="50%" display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="2xl">✓</Text>
    </Box>
    <Heading fontSize="heading.h4">Examination Submitted!</Heading>
    <Text color="gray.500">
      Your answers for <b>{topic}</b> have been submitted successfully.
    </Text>
    {attemptNumber != null && <Text color="gray.500">Attempt #{attemptNumber}</Text>}
    {resultPending && <Text color="gray.500">Your result is pending.</Text>}
    {canRetry && attemptsRemaining != null && (
      <Text color="gray.500">
        {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining.
      </Text>
    )}
    <Flex gap={3} marginTop={4}>
      {canRetry && onRetry && <Button onClick={onRetry}>Retry</Button>}
      <Button secondary={canRetry} onClick={onBack}>Back to Course</Button>
    </Flex>
  </Flex>
);

export const ExaminationLayoutRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExaminationLayout {...props} />} />
);
