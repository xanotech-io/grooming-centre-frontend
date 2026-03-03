import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useCache } from "../../../../contexts";
import { Text } from "../../../../components";
import useQueryParams from "../../../../hooks/useQueryParams";
import useAssessmentPreview from "../../../../pages/user/Courses/TakeCourse/hooks/useAssessmentPreview";
import { createCertificate, submitAssessment } from "../../../../services";
import { submitExamination } from "../../../../services/http/endpoints/examination";
import { hasEnded, isUpcoming, sortByIndexField } from "../../../../utils";
import { CongratsModalContent } from "../Modal";
import useTimerCountdown from "./useTimerCountdown";
import { Box } from "@chakra-ui/layout";
import useCourseExamPreview from "../../../../pages/user/Courses/TakeCourse/hooks/courseExamPreview/useCourseExamPreview";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { Warning } from "@material-ui/icons";

const useAssessment = () => {
  const { assessment, isLoading, error, setError } = useCourseExamPreview();
  const { course_id } = useParams();
  const isExamination = useQueryParams().get("examination");
  const [score, setScore] = useState("");
  const [end, setEnd] = useState(true);
  const [count, increaseCount] = useState(0);
  const { push } = useHistory();
  const totalSteps = 3;
  const [nav, setNav] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);
  const [onblur, setIsOnblur] = useState(false);
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

  // Handle Late/Too Early comer :) and deals with completed assessment
  useEffect(() => {
    if (assessment.hasCompleted)
      return setError(
        `You have already taken this ${
          isExamination ? "examination" : "assessment"
        }`
      );

    if (isUpcoming(assessment.startTime))
      return setError(
        `This ${
          isExamination ? "examination" : "assessment"
        } is not yet time to be taken`
      );

    if (hasEnded(assessment.endTime))
      setError(
        `This ${isExamination ? "examination" : "assessment"} has already ended`
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment.endTime, assessment.startTime]);

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
      const questionIdArr = assessment?.questions?.reduce((acc, question) => {
        acc.push(question.id);
        return acc;
      }, []);
      const optionIdArr = [];

      questionIdArr.forEach((questionId, index) => {
        optionIdArr[index] = selectedAnswers[questionId] || null;
      });

      const context = isExamination ? "examination" : "assessment";

      const body = {
        [`${context}Id`]: assessment.id,
        [`${context}QuestionsId`]: questionIdArr,
        [`${context}OptionsId`]: optionIdArr,
        // userId: user.id,
        courseId: assessment.courseId,
      };

      //   {
      //     "assessmentId": "2a69af3f-3073-41b2-994d-bc31f69e37cb",
      //     "courseId": "c3b2a0a5-59eb-454f-9c2f-5a6b1c4ff1e2",
      // }

      console.log(questionIdArr, optionIdArr);

      const { message, data } = await (isExamination
        ? submitExamination(body)
        : submitAssessment(body));

      setScore(data?.score);
      toast({
        description:
          exitAttempts === totalSteps ? "Exam auto submitted" : message,
        position: "top",
        status: "success",
      });
      setSubmitStatus({
        success: true,
      });
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
    isExamination,
    selectedAnswers,
    // user?.id,
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

  const handleOptionSelect = (selectedAssessmentOptionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id]: selectedAssessmentOptionId,
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
