import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useCache } from "../../../../contexts";
import { Text } from "../../../../components";
import useQueryParams from "../../../../hooks/useQueryParams";
import { submitAssessmentMarking } from "../../../../services";
import { submitExamination } from "../../../../services/http/endpoints/examination";
import {  sortByIndexField } from "../../../../utils";
import { CongratsModalContent } from "../Modal";
import useTimerCountdown from "./useTimerCountdown";
import { Box } from "@chakra-ui/layout";
import useCourseExamPreview from "../../../../pages/user/Courses/TakeCourse/hooks/courseExamPreview/useCourseExamPreview";
import {
  useHistory,

} from "react-router-dom/cjs/react-router-dom.min";


const useAssessment = () => {
  const { assessment, isLoading, error } = useCourseExamPreview();
  const { course_id } = useParams();
  const isExamination = useQueryParams().get("examination");
  const [score, setScore] = useState("");
   // eslint-disable-next-line no-unused-vars
  const [end, setEnd] = useState(true);

  const { push } = useHistory();
  const totalSteps = 3;
  const [nav, setNav] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);
  assessment.questions = sortByIndexField(
    assessment.questions,
    "questionIndex"
  );
  assessment.questions?.forEach((question) => {
    question.options = sortByIndexField(question.options, "optionIndex");
  });
  const file = assessment?.questions.map((q) => q?.file);
  const [currentQuestion, setCurrentQuestion] = useState({});

  const timerCountdownManger = useTimerCountdown({
    startDate: assessment.startTime,
    endDate: assessment.endTime,
  });

  // Initialize the first question
  useEffect(() => {
    if (assessment) {
      setCurrentQuestion(assessment.questions?.[0]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment.questions?.[0]]);


  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false,
    loading: false,
  });

  const toast = useToast();
  // const {
  //   state: { user },
  // } = useApp();

  const handleSubmit = useCallback(async () => {
    setSubmitStatus({
      loading: true,
    });

    try {
      if (isExamination) {
        const examinationQuestionsId = assessment?.questions?.map((q) => q.id);
        const examinationOptionsId = examinationQuestionsId.map(
          (id) => selectedAnswers[id] || null
        );
        const body = {
          examinationId: assessment.id,
          courseId: assessment.courseId,
          examinationQuestionsId,
          examinationOptionsId,
        };
        const { message, data } = await submitExamination(body);
        setScore(data?.score);
        toast({
          description: exitAttempts === totalSteps ? "Exam auto submitted" : message,
          position: "top",
          status: "success",
        });
      } else {
        const answers = assessment?.questions?.map((q) => ({
          questionId: q.id,
          answer: selectedAnswers[q.id] ?? null,
          timeTaken: 0,
        }));
        const body = {
          answers,
          submissionTime: new Date().toISOString(),
          timeTaken: 0,
        };
        const { message, data } = await submitAssessmentMarking(assessment.id, body);
        setScore(data?.totalScore ?? data?.score);
        toast({
          description: exitAttempts === totalSteps ? "Assessment auto submitted" : message,
          position: "top",
          status: "success",
        });
      }

      setSubmitStatus({ success: true });
    } catch (error) {
      toast({
        description: error.message,
        position: "top",
        status: "error",
      });

      setSubmitStatus({
        error: error.message,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assessment.courseId,
    assessment.id,
    assessment.questions,
    isExamination,
    selectedAnswers,
  ]);

  useEffect(() => {
    if (timerCountdownManger.hasEnded.timeout) {
      handleSubmit();
    }
  }, [timerCountdownManger.hasEnded.timeout, handleSubmit]);

  const modalManager = useDisclosure();
  const [modalContent, setModalContent] = useState();
  const [modalPrompt, setModalPrompt] = useState(null);
  const [modalCanClose, setModalCanClose] = useState(true);

  const { handleDelete } = useCache();
  const handleCert = async () => {
    try {
      const body = {
        courseId: assessment.courseId,
      };
      console.log(body)
    } catch (error) {
      toast({
        description: error.message,
        position: "top",
        status: "error",
      });
    }
  };

  const handleAfterSubmit = () => {
    modalManager.onOpen();
    setModalCanClose(false);
    setModalPrompt(null);
    handleDelete(course_id);
    setModalContent(
      <CongratsModalContent
        redirectLink={`/courses/details/${course_id}`}
        contextText={assessment.topic}
        score={score}
        isExamination={isExamination}
      />
    );
    timerCountdownManger.handleStopCountdown();
  };

  // Setup UI after success submission
  useEffect(() => {
    if (submitStatus.success) {
      handleAfterSubmit();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitStatus.success]);

  // Prompt to continue/cancel submission
  const handleSubmitConfirmation = (e) => {
    e.preventDefault();

    modalManager.onOpen();
    setModalContent(null);
    setModalPrompt({
      heading: `Are you sure you want to submit your ${
        isExamination ? "examination" : "assessment"
      }?`,
      body: (
        <>
          <Text marginBottom={5}>
            Please note that you will not be able to retake this{" "}
            {isExamination ? "examination" : "assessment"} after you submit.
            Double check your answers before submitting.
          </Text>

          <Text marginBottom={5}>
            You answered{" "}
            <Box as="b" color="secondary.6" fontSize="text.level3">
              {Reflect.ownKeys(selectedAnswers).length}
            </Box>{" "}
            out of{" "}
            <Box as="b" fontSize="text.level3">
              {assessment.questionCount}
            </Box>{" "}
            questions
          </Text>
        </>
      ),
      submitProps: {
        onClick: () => {
          handleSubmit();
        },
      },
    });
  };

  const handleExitAttempt = () => {
    if (exitAttempts < totalSteps) {
      setExitAttempts(exitAttempts + 1);
    }
    if (exitAttempts === totalSteps) {
      setNav(true);
      push("/courses");
      handleSubmit();
    }
  };

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exitAttempts]);

  const handleQuestionChange = (question) => setCurrentQuestion(question);

  const handleNextQuestion = (e) => {
    e.preventDefault();

    const nextQuestion =
      assessment.questions[currentQuestion?.questionIndex + 1];

    handleQuestionChange(nextQuestion);
  };

  const handlePreviousQuestion = () => {
    const previousQuestion =
      assessment.questions[currentQuestion?.questionIndex - 1];

    handleQuestionChange(previousQuestion);
  };

  const handleOptionSelect = (value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id]: value,
    }));
  };

  const handleAnswerChange = (value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id]: value,
    }));
  };

  const shouldSubmit =
    assessment.questionCount - 1 === currentQuestion?.questionIndex
      ? true
      : false;

  const disablePreviousQuestion = !currentQuestion?.questionIndex;

  return {
    assessment,
    course_id,
    isLoading,
    end,
    error,
    submitStatus,
    currentQuestion,
    shouldSubmit,
    file,
    disablePreviousQuestion,
    selectedAnswers,
    handleSubmitConfirmation,
    handleQuestionChange,
    handleNextQuestion,
    handlePreviousQuestion,
    handleOptionSelect,
    handleAnswerChange,
    handleCert,
    nav,
    timerCountdownManger,
    modalManager: {
      ...modalManager,
      content: modalContent,
      prompt: modalPrompt,
      canClose: modalCanClose,
    },
  };
};

export default useAssessment;
