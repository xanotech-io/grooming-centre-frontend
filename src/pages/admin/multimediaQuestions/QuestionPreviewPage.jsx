import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { previewMultimediaQuestion } from "../../../services";
import { FiArrowLeft, FiChevronDown, FiChevronUp } from "react-icons/fi";

const DIFF_COLOR = {
  Easy:   { bg: "#E6F4EA", color: "#38A169" },
  Medium: { bg: "#FFF5EA", color: "#DD6B20" },
  Hard:   { bg: "#FED7D7", color: "#E53E3E" },
};

const sanitizeHtml = (html) =>
  (html || "").replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "");

const TranscriptToggle = ({ transcript }) => {
  const [open, setOpen] = useState(false);
  if (!transcript) return null;
  return (
    <Box mt="6px">
      <Flex
        as="button"
        alignItems="center"
        gap="4px"
        fontSize="12px"
        color="#3182CE"
        fontWeight="600"
        onClick={() => setOpen((p) => !p)}
        _hover={{ opacity: 0.8 }}
      >
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
  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <Flex direction="column" gap="16px" mb="20px">
      {sorted.map((item) => (
        <Box key={item.id}>
          {item.mediaType === "image" && (
            <Box>
              <img
                src={item.url}
                alt={item.altText || ""}
                style={{ maxWidth: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "8px" }}
              />
            </Box>
          )}
          {item.mediaType === "audio" && (
            <Box>
              <audio controls src={item.url} style={{ width: "100%" }} />
              <TranscriptToggle transcript={item.transcript} />
            </Box>
          )}
          {item.mediaType === "video" && (
            <Box>
              <video
                controls
                src={item.url}
                poster={item.thumbnailUrl}
                style={{ width: "100%", maxHeight: "360px", borderRadius: "8px" }}
              />
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
          {question.options.map((opt) => (
            <Flex
              key={opt.id}
              alignItems="center"
              gap="10px"
              p="12px"
              bg="#F7FAFC"
              border="1px solid #E2E8F0"
              borderRadius="8px"
              cursor="pointer"
            >
              <Radio value={opt.id} colorScheme="purple" />
              <Text fontSize="14px" fontWeight="500" color="#1A202C">
                <Text as="span" color="#6b006b" fontWeight="700" mr="8px">{opt.optionIndex}.</Text>
                {opt.name}
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
            <Flex
              key={label}
              alignItems="center"
              gap="8px"
              p="12px 20px"
              bg="#F7FAFC"
              border="1px solid #E2E8F0"
              borderRadius="8px"
              cursor="pointer"
            >
              <Radio value={label} colorScheme="purple" />
              <Text fontSize="14px" fontWeight="600">{label}</Text>
            </Flex>
          ))}
        </Flex>
      </RadioGroup>
    );
  }

  if (type === "essay") {
    return (
      <Textarea
        isReadOnly
        rows={5}
        placeholder="Write your answer here..."
        borderRadius="8px"
        bg="#F7FAFC"
        fontSize="14px"
      />
    );
  }

  if (type === "fill_in_the_blank") {
    return (
      <Box
        as="input"
        type="text"
        placeholder="Your answer..."
        p="10px 14px"
        border="1px solid #E2E8F0"
        borderRadius="8px"
        fontSize="14px"
        bg="#F7FAFC"
        w="100%"
        readOnly
      />
    );
  }

  if (type === "matching") {
    return (
      <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" p="16px">
        <Text fontSize="13px" color="gray.400">Matching input — drag/drop interface</Text>
      </Box>
    );
  }

  if (type === "listening") {
    return (
      <Box>
        <MediaDisplay media={question.media?.filter((m) => m.mediaType === "audio")} />
        <Box
          as="input"
          type="text"
          placeholder="Your answer..."
          p="10px 14px"
          border="1px solid #E2E8F0"
          borderRadius="8px"
          fontSize="14px"
          bg="#F7FAFC"
          w="100%"
          readOnly
          mt="12px"
        />
      </Box>
    );
  }

  return null;
};

const QuestionPreviewPage = () => {
  const { examinationId, questionId } = useParams();
  const history = useHistory();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!questionId || questionId === "undefined") {
      setError("Invalid question ID. Please go back and try again.");
      setLoading(false);
      return;
    }
    previewMultimediaQuestion(questionId)
      .then((res) => setQuestion(res?.data ?? res))
      .catch(() => setError("Failed to load question preview."))
      .finally(() => setLoading(false));
  }, [questionId]);

  if (loading) {
    return <Flex justifyContent="center" alignItems="center" minH="300px"><Spinner size="xl" color="#6b006b" /></Flex>;
  }

  if (error || !question) {
    return (
      <Box marginX="22px" marginY="20px">
        <Text color="red.500" mb="12px">{error || "Question not found."}</Text>
        <Button secondary onClick={() => history.goBack()}>Go Back</Button>
      </Box>
    );
  }

  const diffStyle = DIFF_COLOR[question.difficultyLevel] ?? { bg: "gray.100", color: "gray.600" };

  return (
    <Box marginX="22px" marginY="20px" maxW="760px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/examination">Examination Analysis</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Question Preview</Link></BreadcrumbItem>}
        />
      </Flex>
      <Flex alignItems="center" gap="12px" mb="24px">
        <Flex
          as="button"
          alignItems="center"
          gap="6px"
          color="#6b006b"
          onClick={() => history.push(`/admin/multimedia-questions/${examinationId}/${questionId}/edit`)}
          _hover={{ opacity: 0.8 }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">Back to Editor</Text>
        </Flex>
      </Flex>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p="28px">
        {/* Header */}
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
          {question.section && (
            <Badge bg="#F7FAFC" color="#718096" px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="12px">
              {question.section}
            </Badge>
          )}
        </Flex>

        {/* Content */}
        <Box mb="20px">
          {question.contentFormat === "html" ? (
            <Box
              fontSize="15px"
              lineHeight="1.7"
              color="#1A202C"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.displayContent) }}
            />
          ) : (
            <Text fontSize="15px" lineHeight="1.7" color="#1A202C" whiteSpace="pre-wrap">
              {question.displayContent}
            </Text>
          )}

          {question.latexEquation && (
            <Box mt="16px" p="14px" bg="#F7F9FC" border="1px solid #E2E8F0" borderRadius="8px">
              <Text fontSize="11px" color="gray.400" mb="4px">Equation (LaTeX — install KaTeX for rendered output):</Text>
              <Text fontFamily="mono" fontSize="13px" color="#6b006b">{question.latexEquation}</Text>
            </Box>
          )}
        </Box>

        {/* Media */}
        <MediaDisplay media={question.media} />

        {/* Answer Area */}
        <Box pt="20px" borderTop="1px solid #E2E8F0">
          <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="12px">
            Your Answer
          </Text>
          <AnswerArea question={question} />
        </Box>
      </Box>

      <Flex justifyContent="flex-end" mt="16px">
        <Button secondary onClick={() => history.push(`/admin/multimedia-questions/${examinationId}/${questionId}/edit`)}>
          Back to Editor
        </Button>
      </Flex>
    </Box>
  );
};

export const QuestionPreviewPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <QuestionPreviewPage {...props} />} />
);

export default QuestionPreviewPageRoute;
