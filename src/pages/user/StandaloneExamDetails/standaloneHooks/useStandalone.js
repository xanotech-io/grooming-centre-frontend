import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Box } from "@chakra-ui/layout";
import { useCache } from "../../../../contexts";
import { Text } from "../../../../components";
import { useQueryParams } from "../../../../hooks";
import useStandalonePreview from "./useStandalonePreview";
import {
  createCertificate,
  submitAssessment,
  submitExamination,
} from "../../../../services";
import { hasEnded, isUpcoming, sortByIndexField } from "../../../../utils";
import { CongratsModalContent } from "../../../../layouts/user/Assessment/Modal";
import useTimerCountdown from "../../../../layouts/user/Assessment/hooks/useTimerCountdown";
import { useHistory } from "react-router-dom";
import { Warning } from "@material-ui/icons";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
const useStandalone = () => {
  const { assessment, isLoading, error, setError } = useStandalonePreview();
  const { course_id, userId } = useParams();
  const isExamination = useQueryParams().get("exam");
  const [locate, setLocate] = useState("");
  const [end, setEnd] = useState(true);
  const [count, increaseCount] = useState(0);
  const [onblur, setIsOnblur] = useState(false);
  const pageLength = assessment?.question?.length - 1;
  const [index, setindex] = useState(0);
  let handleExam;
  assessment.question = sortByIndexField(assessment.question, "questionIndex");
  assessment.question?.forEach((question) => {
    question.options = sortByIndexField(question.options, "optionIndex");
  });

  const [currentQuestion, setCurrentQuestion] = useState({});

  const timerCountdownManger = useTimerCountdown({
    startDate: assessment.startTime,
    endDate: assessment.endTime,
  });

  // Initialize the first question
  useEffect(() => {
    if (assessment) {
      setCurrentQuestion(assessment?.question?.[index]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.question?.[index]]);

  // Handle Late/Too Early comer :) and deals with completed assessment
  useEffect(() => {
    if (assessment?.hasCompleted)
      return setError(
        `You have already taken this ${
          isExamination ? "examination" : "assessment"
        }`
      );

    if (isUpcoming(assessment?.startTime))
      return setError(
        `This ${
          isExamination ? "examination" : "assessment"
        } is not yet time to be taken`
      );

    if (hasEnded(assessment?.endTime))
      setError(
        `This ${isExamination ? "examination" : "assessment"} has already ended`
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.endTime, assessment?.startTime]);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false,
    loading: false,
  });
  const [questionId, setQuestionId] = useState([]);
  const [optionId, setOptionId] = useState([]);
  const [id, setId] = useState(0);
  const toast = useToast();
  // const {
  //   state: { user },
  // } = useApp();

  const handleSubmit = useCallback(async () => {
    setSubmitStatus({
      loading: true,
    });

    try {
      const questionIdArr = assessment?.question?.reduce((acc, question) => {
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
        courseId: assessment.courseId,
      };

      await (isExamination ? submitExamination(body) : submitAssessment(body));

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
    }
  }, [timerCountdownManger.hasEnded.timeout, handleSubmit]);

  const modalManager = useDisclosure();
  const [modalContent, setModalContent] = useState();
  const [modalPrompt, setModalPrompt] = useState(null);
  const [modalCanClose, setModalCanClose] = useState(true);

  const { handleDelete } = useCache();

  const handleAfterSubmit = () => {
    modalManager.onOpen();
    setModalCanClose(false);
    setModalPrompt(null);
    handleDelete(course_id);
    setModalContent(
      <CongratsModalContent
        redirectLink={`/courses/details/${course_id}`}
        contextText={assessment.topic}
      />
    );
    timerCountdownManger.handleStopCountdown();
  };
  // Setup UI after success submission
  useEffect(() => {
    if (submitStatus.success) {
      handleAfterSubmit();
    }
  }, [submitStatus.success]);

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
              {pageLength + 1}
            </Box>{" "}
            questions
          </Text>
        </>
      ),
      submitProps: {
        onClick: handleSubmit,
      },
    });
  };

  const handleQuestionChange = (questionIndex) => {
    setindex(questionIndex);
    setCurrentQuestion(assessment.question[questionIndex]);
  };

  const handleNextQuestion = () => {
    setindex(index === pageLength ? pageLength : index + 1);
    const nextQuestion = assessment.question[index];
    setCurrentQuestion(nextQuestion);
  };

  const handlePreviousQuestion = () => {
    setindex(index === 0 ? 0 : index - 1);
    const previousQuestion = assessment.question[index];

    setCurrentQuestion(previousQuestion);
  };

  const handleOptionSelect = (selectedAssessmentOptionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id]: selectedAssessmentOptionId,
    }));
    setQuestionId((prev) => ({
      ...prev,
      [index]: currentQuestion?.id,
    }));
    setOptionId((prev) => ({
      ...prev,
      [index]: selectedAssessmentOptionId,
    }));
  };

  const shouldSubmit = pageLength === index ? true : false;

  const disablePreviousQuestion = index === 0;

  return {
    assessment,
    course_id,
    end,
    isLoading,
    error,
    submitStatus,
    currentQuestion,
    shouldSubmit,
    disablePreviousQuestion,
    selectedAnswers,
    handleExam,
    handleSubmitConfirmation,
    handleQuestionChange,
    handleNextQuestion,
    handlePreviousQuestion,
    handleOptionSelect,

    timerCountdownManger,
    modalManager: {
      ...modalManager,
      content: modalContent,
      prompt: modalPrompt,
      canClose: modalCanClose,
    },
    pageLength,
    index,
    questionId,
    optionId,
  };
};

export default useStandalone;
