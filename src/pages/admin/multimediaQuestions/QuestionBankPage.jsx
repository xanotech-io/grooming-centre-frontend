import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { getMultimediaQuestions } from "../../../services";
import { FiBarChart2, FiChevronLeft, FiChevronRight, FiEdit2, FiEye, FiImage } from "react-icons/fi";

const TYPE_STYLE = {
  mcq:              { bg: "#EBF4FF", color: "#3182CE" },
  essay:            { bg: "#FFF5EA", color: "#DD6B20" },
  true_false:       { bg: "#E6F4EA", color: "#38A169" },
  fill_in_the_blank:{ bg: "#F0E6FF", color: "#6b006b" },
  matching:         { bg: "#FFF0F5", color: "#D53F8C" },
  listening:        { bg: "#EBF8FF", color: "#2C7A7B" },
};

const DIFF_STYLE = {
  Easy:   { bg: "#E6F4EA", color: "#38A169" },
  Medium: { bg: "#FFF5EA", color: "#DD6B20" },
  Hard:   { bg: "#FED7D7", color: "#E53E3E" },
};

const MEDIA_ICON = { image: "🖼", audio: "🔊", video: "🎥" };

const MediaChips = ({ media }) => {
  if (!media?.length) return <Text fontSize="12px" color="gray.400">—</Text>;
  const types = [...new Set(media.map((m) => m.mediaType))];
  return (
    <Flex gap="4px" flexWrap="wrap">
      {types.map((t) => (
        <Badge
          key={t}
          bg={t === "image" ? "#F0E6FF" : t === "audio" ? "#E6F4EA" : "#EBF4FF"}
          color={t === "image" ? "#6b006b" : t === "audio" ? "#38A169" : "#3182CE"}
          fontSize="10px" px="6px" py="1px" borderRadius="6px" textTransform="none"
        >
          {MEDIA_ICON[t]} {t}
        </Badge>
      ))}
    </Flex>
  );
};

const resolveQuestionId = (q) =>
  q.id ?? q._id ?? q.questionId ?? q.uuid ?? q.question_id ?? q.examQuestionId ?? q.questionUuid;

const QuestionBankPage = () => {
  const { examinationId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMultimediaQuestions(examinationId, { page, limit: LIMIT });
      const qs = res?.data?.questions ?? res?.questions ?? [];
      if (process.env.NODE_ENV !== "production" && qs.length > 0) {
        console.log("[MultimediaQ] Raw API response shape:", JSON.stringify(res).slice(0, 400));
        console.log("[MultimediaQ] Question[0] keys:", Object.keys(qs[0]));
        console.log("[MultimediaQ] Question[0]:", qs[0]);
        console.log("[MultimediaQ] Resolved ID:", resolveQuestionId(qs[0]));
      }
      setQuestions(qs);
      setTotal(res?.data?.total ?? res?.total ?? 0);
      setTotalPages(res?.data?.totalPages ?? res?.totalPages ?? 1);
    } catch {
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, [examinationId, page]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const goTo = (path) => history.push(`/admin/multimedia-questions/${examinationId}${path}`);

  const goToQuestion = (subPath, qId) => {
    if (!qId || qId === "undefined") {
      toast({ title: "Cannot determine question ID — check browser console for API response shape", status: "error", duration: 5000, isClosable: true });
      return;
    }
    goTo(`/${qId}${subPath}`);
  };

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/examination">Examination Analysis</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Question Bank</Link></BreadcrumbItem>}
        />
      </Flex>
      <Flex alignItems="flex-start" justifyContent="space-between" mb="24px" flexWrap="wrap" gap="12px">
        <Box>
          <Heading fontSize="22px" fontWeight="600">Multimedia Question Bank</Heading>
          <Text fontSize="13px" color="gray.500" mt="2px">
            Examination: {examinationId} · {total} question{total !== 1 ? "s" : ""}
          </Text>
        </Box>
        <Flex gap="10px">
          <Button secondary leftIcon={<FiBarChart2 />} onClick={() => goTo("/stats")}>
            Exam Stats
          </Button>
          <Button onClick={() => goTo("/new")}>+ Add Question</Button>
        </Flex>
      </Flex>

      {loading && (
        <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>
      )}

      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p="16px">
          <Text color="red.600" fontSize="14px">{error}</Text>
        </Box>
      )}

      {!loading && !error && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
          {questions.length === 0 ? (
            <Flex direction="column" alignItems="center" py="60px" gap="12px">
              <Text fontSize="14px" color="gray.400">No questions yet. Add the first one.</Text>
              <Button onClick={() => goTo("/new")}>Add Question</Button>
            </Flex>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="#F7FAFC">
                  <Tr>
                    {["#", "Question", "Type", "Difficulty", "Marks", "Media", "Formatting", "Actions"].map((h) => (
                      <Th key={h} py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {questions.map((q, idx) => {
                    const qId = resolveQuestionId(q);
                    const ts = TYPE_STYLE[q.questionType] ?? { bg: "gray.100", color: "gray.600" };
                    const ds = DIFF_STYLE[q.difficultyLevel] ?? { bg: "gray.100", color: "gray.600" };
                    const preview = q.question || (q.contentHtml || "").replace(/<[^>]*>/g, "");
                    return (
                      <Tr key={qId ?? idx} _hover={{ bg: "#FAFAFA" }}>
                        <Td py="12px" fontSize="13px" color="gray.400">{(page - 1) * LIMIT + idx + 1}</Td>
                        <Td py="12px" maxW="280px">
                          <Text fontSize="13px" fontWeight="500" color="#1A202C" noOfLines={2}>{preview || "—"}</Text>
                        </Td>
                        <Td py="12px">
                          <Badge bg={ts.bg} color={ts.color} px="8px" py="2px" borderRadius="6px" textTransform="none" fontSize="11px">
                            {(q.questionType || "").replace(/_/g, " ")}
                          </Badge>
                        </Td>
                        <Td py="12px">
                          <Badge bg={ds.bg} color={ds.color} px="8px" py="2px" borderRadius="6px" textTransform="none" fontSize="11px">
                            {q.difficultyLevel}
                          </Badge>
                        </Td>
                        <Td py="12px">
                          <Text fontSize="13px" fontWeight="700" color="#6b006b">{q.marks}</Text>
                        </Td>
                        <Td py="12px"><MediaChips media={q.media} /></Td>
                        <Td py="12px">
                          <Badge
                            bg={q.formattingEnabled ? "#E6F4EA" : "#F7FAFC"}
                            color={q.formattingEnabled ? "#38A169" : "#718096"}
                            px="8px" py="2px" borderRadius="6px" textTransform="none" fontSize="11px"
                          >
                            {q.formattingEnabled ? "Yes" : "No"}
                          </Badge>
                        </Td>
                        <Td py="12px">
                          <Flex gap="4px">
                            <IconButton
                              aria-label="Edit question"
                              icon={<FiEdit2 size={13} />}
                              size="xs" variant="ghost" colorScheme="blue"
                              onClick={() => goToQuestion("/edit", qId)}
                            />
                            <IconButton
                              aria-label="Preview question"
                              icon={<FiEye size={13} />}
                              size="xs" variant="ghost" colorScheme="purple"
                              onClick={() => goToQuestion("/preview", qId)}
                            />
                            <IconButton
                              aria-label="Manage media"
                              icon={<FiImage size={13} />}
                              size="xs" variant="ghost" colorScheme="green"
                              onClick={() => goToQuestion("/media", qId)}
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {totalPages > 1 && (
            <Flex justifyContent="space-between" alignItems="center" px="20px" py="12px" borderTop="1px solid #E2E8F0">
              <Text fontSize="13px" color="gray.500">Page {page} of {totalPages} · {total} total</Text>
              <Flex gap="8px">
                <Button secondary size="sm" isDisabled={page <= 1} leftIcon={<FiChevronLeft />} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <Button secondary size="sm" isDisabled={page >= totalPages} rightIcon={<FiChevronRight />} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
};

export const QuestionBankPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <QuestionBankPage {...props} />} />
);

export default QuestionBankPageRoute;
