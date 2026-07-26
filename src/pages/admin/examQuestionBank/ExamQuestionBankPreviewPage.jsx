import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import { Badge, Box, BreadcrumbItem, Flex, Spinner, Text } from "@chakra-ui/react";
import { Breadcrumb, Button, Link, RichTextToView } from "../../../components";
import { getExamQuestionBankItem, getExamQuestionBankMedia } from "../../../services";
import { FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";

const DIFF_COLOR = {
  Easy: { bg: "#E6F4EA", color: "#38A169" },
  Medium: { bg: "#FFF5EA", color: "#DD6B20" },
  Hard: { bg: "#FED7D7", color: "#E53E3E" },
};

const TranscriptToggle = ({ transcript }) => {
  const [open, setOpen] = useState(false);
  if (!transcript) return null;
  return (
    <Box mt="6px">
      <Flex as="button" alignItems="center" gap="4px" fontSize="12px" color="#3182CE" fontWeight="600" onClick={() => setOpen((p) => !p)} _hover={{ opacity: 0.8 }}>
        {open ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
        {open ? "Hide transcript" : "Show transcript"}
      </Flex>
      {open && (
        <Box mt="6px" p="12px" bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="6px" fontSize="13px" color="gray.600">
          {transcript}
        </Box>
      )}
    </Box>
  );
};

const MediaDisplay = ({ media }) => {
  if (!media?.length) return null;
  const sorted = [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return (
    <Flex direction="column" gap="16px" mb="20px">
      {sorted.map((item) => (
        <Box key={item.id}>
          {item.mediaType === "image" && (
            <img src={item.url} alt={item.altText || ""} style={{ maxWidth: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "8px" }} />
          )}
          {item.mediaType === "audio" && (
            <Box>
              <audio controls src={item.url} style={{ width: "100%" }} />
              <TranscriptToggle transcript={item.transcript} />
            </Box>
          )}
          {item.mediaType === "video" && (
            <Box>
              <video controls src={item.url} poster={item.thumbnailUrl} style={{ width: "100%", maxHeight: "360px", borderRadius: "8px" }} />
              <TranscriptToggle transcript={item.transcript} />
            </Box>
          )}
        </Box>
      ))}
    </Flex>
  );
};

const CorrectOptionRow = ({ label, isCorrect }) => (
  <Flex
    alignItems="center"
    gap="10px"
    p="12px"
    bg={isCorrect ? "#E6F4EA" : "#F7FAFC"}
    border="1px solid"
    borderColor={isCorrect ? "#38A169" : "#E2E8F0"}
    borderRadius="8px"
  >
    <Flex
      alignItems="center"
      justifyContent="center"
      w="20px"
      h="20px"
      borderRadius="50%"
      bg={isCorrect ? "#38A169" : "transparent"}
      border={isCorrect ? "none" : "1px solid #CBD5E0"}
      flexShrink={0}
    >
      {isCorrect && <FiCheck color="white" size={13} />}
    </Flex>
    <Text fontSize="14px" fontWeight={isCorrect ? "600" : "500"} color={isCorrect ? "#276749" : "#1A202C"}>
      {label}
    </Text>
  </Flex>
);

const AnswerArea = ({ question }) => {
  const type = question.questionType;

  if (type === "mcq" && question.options?.length) {
    return (
      <Flex direction="column" gap="10px">
        {question.options.map((opt, idx) => (
          <CorrectOptionRow key={opt.id ?? idx} label={opt.text} isCorrect={!!opt.isCorrect} />
        ))}
      </Flex>
    );
  }

  if (type === "true_false") {
    return (
      <Flex gap="12px">
        {["True", "False"].map((label) => (
          <Box flex="1" key={label}>
            <CorrectOptionRow label={label} isCorrect={question.correctAnswer === label} />
          </Box>
        ))}
      </Flex>
    );
  }

  if (type === "essay" || type === "short_answer" || type === "fill_blank") {
    return (
      <Box p="12px 14px" bg="#E6F4EA" border="1px solid #38A169" borderRadius="8px">
        <Text fontSize="14px" color="#276749" whiteSpace="pre-wrap">
          {question.correctAnswer || "No model answer provided."}
        </Text>
      </Box>
    );
  }

  return null;
};

const ExamQuestionBankPreviewPage = () => {
  const { questionId } = useParams();
  const history = useHistory();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getExamQuestionBankItem(questionId), getExamQuestionBankMedia(questionId)])
      .then(([qRes, mRes]) => {
        const q = qRes?.data ?? qRes;
        const media = mRes?.data?.media ?? mRes?.media ?? mRes?.data ?? [];
        setQuestion({ ...q, media });
      })
      .catch(() => setError("Failed to load question preview."))
      .finally(() => setLoading(false));
  }, [questionId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="300px">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );
  }

  if (error || !question) {
    return (
      <Box marginX="22px" marginY="20px">
        <Text color="red.500" mb="12px">
          {error || "Question not found."}
        </Text>
        <Button secondary onClick={() => history.goBack()}>
          Go Back
        </Button>
      </Box>
    );
  }

  const diffStyle = DIFF_COLOR[question.difficultyLevel] ?? { bg: "gray.100", color: "gray.600" };

  return (
    <Box marginX="22px" marginY="20px" maxW="760px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/exam-question-bank">Question Bank</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Preview</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p="28px">
        <Flex alignItems="center" gap="10px" mb="20px" flexWrap="wrap">
          <Badge bg="#F0E6FF" color="#6b006b" px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="12px" fontWeight="600">
            Preview
          </Badge>
          <Badge bg={diffStyle.bg} color={diffStyle.color} px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="12px">
            {question.difficultyLevel}
          </Badge>
          <Badge bg="#EBF4FF" color="#3182CE" px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="12px">
            {question.marks} mark{question.marks !== 1 ? "s" : ""}
          </Badge>
          {question.category && (
            <Badge bg="#F7FAFC" color="#718096" px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="12px">
              {question.category}
            </Badge>
          )}
        </Flex>

        <Box mb="20px">
          <RichTextToView text={question.question} fontSize="15px" lineHeight="1.7" color="#1A202C" />
        </Box>

        <MediaDisplay media={question.media} />

        <Box pt="20px" borderTop="1px solid #E2E8F0">
          <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="12px">
            Correct Answer
          </Text>
          <AnswerArea question={question} />
        </Box>

        {question.explanation && (
          <Box mt="20px" pt="20px" borderTop="1px solid #E2E8F0">
            <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="12px">
              Explanation
            </Text>
            <Text fontSize="14px" lineHeight="1.7" color="#4A5568" whiteSpace="pre-wrap">
              {question.explanation}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const ExamQuestionBankPreviewPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamQuestionBankPreviewPage {...props} />} />
);

export default ExamQuestionBankPreviewPageRoute;
