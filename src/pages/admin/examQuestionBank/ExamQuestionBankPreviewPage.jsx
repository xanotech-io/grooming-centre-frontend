import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import { Badge, Box, BreadcrumbItem, Flex, Radio, RadioGroup, Spinner, Text, Textarea } from "@chakra-ui/react";
import { Breadcrumb, Button, Link } from "../../../components";
import { previewExamQuestionBankItem } from "../../../services";
import { FiArrowLeft, FiChevronDown, FiChevronUp } from "react-icons/fi";

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

const AnswerArea = ({ question }) => {
  const type = question.questionType;

  if (type === "mcq" && question.options?.length) {
    return (
      <RadioGroup>
        <Flex direction="column" gap="10px">
          {question.options.map((opt, idx) => (
            <Flex key={opt.id ?? idx} alignItems="center" gap="10px" p="12px" bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px">
              <Radio value={String(opt.id ?? idx)} colorScheme="purple" />
              <Text fontSize="14px" fontWeight="500" color="#1A202C">
                {opt.text}
              </Text>
            </Flex>
          ))}
        </Flex>
      </RadioGroup>
    );
  }

  if (type === "true_false") {
    return (
      <RadioGroup>
        <Flex gap="12px">
          {["True", "False"].map((label) => (
            <Flex key={label} alignItems="center" gap="8px" p="12px 20px" bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px">
              <Radio value={label} colorScheme="purple" />
              <Text fontSize="14px" fontWeight="600">
                {label}
              </Text>
            </Flex>
          ))}
        </Flex>
      </RadioGroup>
    );
  }

  if (type === "essay") {
    return <Textarea isReadOnly rows={5} placeholder="Write your answer here..." borderRadius="8px" bg="#F7FAFC" fontSize="14px" />;
  }

  if (type === "short_answer") {
    return <Textarea isReadOnly rows={3} placeholder="Write your answer here..." borderRadius="8px" bg="#F7FAFC" fontSize="14px" />;
  }

  if (type === "fill_blank") {
    return (
      <Box as="input" type="text" placeholder="Your answer..." p="10px 14px" border="1px solid #E2E8F0" borderRadius="8px" fontSize="14px" bg="#F7FAFC" w="100%" readOnly />
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
    previewExamQuestionBankItem(questionId)
      .then((res) => setQuestion(res?.data ?? res))
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
      <Flex alignItems="center" gap="12px" mb="24px">
        <Flex as="button" alignItems="center" gap="6px" color="#6b006b" onClick={() => history.push(`/admin/exam-question-bank/${questionId}/edit`)} _hover={{ opacity: 0.8 }}>
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">
            Back to Editor
          </Text>
        </Flex>
      </Flex>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p="28px">
        <Flex alignItems="center" gap="10px" mb="20px" flexWrap="wrap">
          <Badge bg="#F0E6FF" color="#6b006b" px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="12px" fontWeight="600">
            Student Preview
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
          <Text fontSize="15px" lineHeight="1.7" color="#1A202C" whiteSpace="pre-wrap">
            {question.question}
          </Text>
        </Box>

        <MediaDisplay media={question.media} />

        <Box pt="20px" borderTop="1px solid #E2E8F0">
          <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="12px">
            Your Answer
          </Text>
          <AnswerArea question={question} />
        </Box>
      </Box>

      <Flex justifyContent="flex-end" mt="16px">
        <Button secondary onClick={() => history.push(`/admin/exam-question-bank/${questionId}/edit`)}>
          Back to Editor
        </Button>
      </Flex>
    </Box>
  );
};

export const ExamQuestionBankPreviewPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamQuestionBankPreviewPage {...props} />} />
);

export default ExamQuestionBankPreviewPageRoute;
