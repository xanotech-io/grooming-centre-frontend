import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
} from "@chakra-ui/react";
import { Heading, Text } from "../../../../../components";
import {
  getAssessmentSubmissions,
  getStudentAssessmentResult,
} from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";
import { FiArrowLeft, FiUser } from "react-icons/fi";
import dayjs from "dayjs";

/* ─── helpers ─────────────────────────────────────── */
const submissionStatusColor = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "graded" || v === "completed") return { bg: "#E6F4EA", color: "#38A169" };
  if (v === "pending") return { bg: "#FFF3CD", color: "#B7791F" };
  if (v === "submitted") return { bg: "#EBF4FF", color: "#3182CE" };
  if (v === "in_progress") return { bg: "#EDF2FF", color: "#4C51BF" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const gradeColor = (g) => {
  if (!g) return { color: "#718096", bg: "#F7FAFC" };
  const c = g.charAt(0).toUpperCase();
  if (c === "A") return { color: "#38A169", bg: "#E6F4EA" };
  if (c === "B") return { color: "#3182CE", bg: "#EBF4FF" };
  if (c === "C") return { color: "#DD6B20", bg: "#FFF5EA" };
  return { color: "#E53E3E", bg: "#FED7D7" };
};

const StatCard = ({ label, value, sub }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" px={5} py={4}>
    <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb={1}>
      {label}
    </Text>
    <Text fontSize="22px" fontWeight="800" color="#1A202C" lineHeight="1">{value ?? "—"}</Text>
    {sub && <Text fontSize="11px" color="gray.400" mt={1}>{sub}</Text>}
  </Box>
);

/* ─── Result detail panel ─────────────────────────── */
const ResultDetail = ({ assessmentId, studentId, onBack }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStudentAssessmentResult(assessmentId, studentId)
      .then(({ result: data }) => setResult(data))
      .catch((err) => setError(err.message || "Failed to load result"))
      .finally(() => setLoading(false));
  }, [assessmentId, studentId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="300px">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );
  }

  if (error || !result) {
    return (
      <Box p={6}>
        <Flex
          as="button"
          onClick={onBack}
          alignItems="center"
          gap={2}
          color="#6b006b"
          mb={5}
          _hover={{ textDecoration: "underline" }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="sm" fontWeight="600">Back to submissions</Text>
        </Flex>
        <Text color="red.500">{capitalizeFirstLetter(error || "Result not found.")}</Text>
      </Box>
    );
  }

  const gc = gradeColor(result.grade);
  const sc = submissionStatusColor(result.status);
  const totalScore = parseFloat(result.totalScore ?? 0);
  const autoScore = parseFloat(result.autoScore ?? 0);
  const manualScore = parseFloat(result.manualScore ?? 0);
  const fullName = [result.student?.firstName, result.student?.lastName].filter(Boolean).join(" ") || "—";

  return (
    <Box padding={6}>
      {/* Back */}
      <Flex
        as="button"
        onClick={onBack}
        alignItems="center"
        gap={2}
        color="#6b006b"
        mb={6}
        _hover={{ textDecoration: "underline" }}
      >
        <FiArrowLeft size={14} />
        <Text fontSize="sm" fontWeight="600">Back to submissions</Text>
      </Flex>

      {/* Student header */}
      <Flex
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="12px"
        p={5}
        mb={5}
        alignItems="center"
        gap={4}
        flexWrap="wrap"
      >
        <Box
          w="48px"
          h="48px"
          bg="#F0E6FF"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <FiUser color="#6b006b" size={20} />
        </Box>
        <Box flex={1}>
          <Text fontSize="16px" fontWeight="700" color="#1A202C">{fullName}</Text>
          <Text fontSize="13px" color="gray.500">{result.student?.email || "—"}</Text>
        </Box>
        <Flex gap={2} flexWrap="wrap" alignItems="center">
          <Badge bg={sc.bg} color={sc.color} px={3} py={1} borderRadius="full" fontSize="12px" fontWeight="600" textTransform="capitalize">
            {result.status || "—"}
          </Badge>
          {result.grade && (
            <Box bg={gc.bg} color={gc.color} borderRadius="10px" px={4} py={2} textAlign="center">
              <Text fontSize="22px" fontWeight="800" lineHeight="1">{result.grade}</Text>
              <Text fontSize="10px" fontWeight="500" mt="2px">Grade</Text>
            </Box>
          )}
        </Flex>
      </Flex>

      {/* Score bar */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p={5} mb={5}>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontSize="13px" color="gray.500" fontWeight="500">Total Score</Text>
          <Text fontSize="13px" fontWeight="700" color={gc.color}>{totalScore.toFixed(2)}%</Text>
        </Flex>
        <Progress
          value={totalScore}
          size="sm"
          borderRadius="4px"
          sx={{ "& > div": { background: gc.color || "#6b006b" } }}
          mb={4}
        />
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <Box textAlign="center" bg="#F7F9FC" borderRadius="8px" py={3} px={2}>
            <Text fontSize="18px" fontWeight="800" color="#3182CE">{autoScore.toFixed(2)}</Text>
            <Text fontSize="11px" color="gray.500" mt={1}>Auto Score</Text>
          </Box>
          <Box textAlign="center" bg="#F7F9FC" borderRadius="8px" py={3} px={2}>
            <Text fontSize="18px" fontWeight="800" color="#6b006b">{manualScore.toFixed(2)}</Text>
            <Text fontSize="11px" color="gray.500" mt={1}>Manual Score</Text>
          </Box>
          <Box textAlign="center" bg="#F7F9FC" borderRadius="8px" py={3} px={2}>
            <Text fontSize="18px" fontWeight="800" color={gc.color || "#1A202C"}>{totalScore.toFixed(2)}</Text>
            <Text fontSize="11px" color="gray.500" mt={1}>Total Score</Text>
          </Box>
        </Grid>
      </Box>

      {/* Stats grid */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Correct" value={result.correctAnswers ?? 0} />
        <StatCard label="Wrong" value={result.wrongAnswers ?? 0} />
        <StatCard
          label="Time Taken"
          value={result.timeTaken != null ? `${result.timeTaken}s` : "—"}
        />
        <StatCard
          label="Evaluated By"
          value={result.evaluatedBy ? capitalizeFirstLetter(result.evaluatedBy) : "—"}
          sub={result.evaluationDate ? dayjs(result.evaluationDate).format("DD/MM/YY h:mm a") : null}
        />
      </Grid>

      {/* Assessment & course info */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p={5} mb={5}>
        <Text fontSize="12px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb={4}>
          Assessment Details
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={5}>
          <Box>
            <Text fontSize="11px" color="gray.400" mb={1}>Assessment</Text>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">{result.assessment?.title || "—"}</Text>
          </Box>
          <Box>
            <Text fontSize="11px" color="gray.400" mb={1}>Course</Text>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">{result.assessment?.course?.title || "—"}</Text>
          </Box>
          <Box>
            <Text fontSize="11px" color="gray.400" mb={1}>Marking Mode</Text>
            <Badge
              colorScheme={result.assessment?.markingMode === "manual" ? "purple" : "blue"}
              textTransform="capitalize"
              fontSize="11px"
            >
              {result.assessment?.markingMode || "—"}
            </Badge>
          </Box>
        </Grid>
      </Box>

      {/* Remark */}
      {result.remark && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p={5} mb={5}>
          <Text fontSize="12px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb={2}>
            Remark
          </Text>
          <Text fontSize="14px" color="#1A202C">{result.remark}</Text>
        </Box>
      )}

      {/* Manual marking CTA */}
      {result.assessment?.markingMode === "manual" && (
        <Box
          bg="#F9F0FF"
          border="1px solid #D6BCFA"
          borderRadius="12px"
          p={5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={3}
        >
          <Box>
            <Text fontSize="14px" fontWeight="600" color="#6b006b">Manual grading required</Text>
            <Text fontSize="13px" color="gray.500">This submission has questions that need instructor grading.</Text>
          </Box>
          <Box
            as="button"
            bg="#6b006b"
            color="white"
            px={5}
            py={2}
            borderRadius="8px"
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: "#560056" }}
            onClick={() =>
              history.push(`/admin/manual-marking/${assessmentId}/student/${studentId}`)
            }
          >
            Go to Manual Marking
          </Box>
        </Box>
      )}
    </Box>
  );
};

/* ─── Submissions list ────────────────────────────── */
const SubmissionsPage = () => {
  const { assessmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // { studentId }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAssessmentSubmissions(assessmentId)
      .then(({ submissions: data }) => {
        if (!cancelled) { setSubmissions(data); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message || "Failed to load submissions"); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [assessmentId]);

  // Show result detail when a row is selected
  if (selected) {
    return (
      <ResultDetail
        assessmentId={assessmentId}
        studentId={selected.studentId}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <Box padding={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading fontSize="heading.h4">Submissions</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Click a row to view the student's result
          </Text>
        </Box>
        {!loading && !error && (
          <Badge bg="#EBF4FF" color="#3182CE" px={3} py={1} borderRadius="full" fontSize="13px" fontWeight="600">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={6} textAlign="center">
          <Text color="red.600">{capitalizeFirstLetter(error)}</Text>
        </Box>
      )}

      {!loading && !error && submissions.length === 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="md" p={12} textAlign="center">
          <Text color="gray.500" fontSize="15px">No submissions yet for this assessment.</Text>
        </Box>
      )}

      {!loading && !error && submissions.length > 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="md" overflow="hidden">
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7F9FC">
                <Tr>
                  <Th color="gray.500" fontSize="11px" py={3}>#</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Student</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Email</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Submitted At</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Status</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Answers</Th>
                </Tr>
              </Thead>
              <Tbody>
                {submissions.map((sub, i) => {
                  const sc = submissionStatusColor(sub.status);
                  const submittedAt = sub.submissionTime
                    ? dayjs(sub.submissionTime).format("DD/MM/YY h:mm a")
                    : "—";
                  const fullName = [sub.student?.firstName, sub.student?.lastName]
                    .filter(Boolean).join(" ") || "—";

                  return (
                    <Tr
                      key={sub.id}
                      cursor="pointer"
                      _hover={{ bg: "#F9F0FF" }}
                      onClick={() => setSelected({ studentId: sub.studentId })}
                    >
                      <Td color="gray.400" fontSize="13px">{i + 1}</Td>
                      <Td fontWeight="600" fontSize="13px" color="#1A202C">{fullName}</Td>
                      <Td fontSize="13px" color="gray.600">{sub.student?.email || "—"}</Td>
                      <Td fontSize="13px" color="gray.600">{submittedAt}</Td>
                      <Td>
                        <Badge
                          bg={sc.bg}
                          color={sc.color}
                          px={2}
                          py="2px"
                          borderRadius="8px"
                          textTransform="capitalize"
                          fontSize="11px"
                          fontWeight="600"
                        >
                          {sub.status || "—"}
                        </Badge>
                      </Td>
                      <Td fontSize="13px" color="gray.600">
                        {Array.isArray(sub.answers) ? sub.answers.length : 0}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

const SubmissionsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <SubmissionsPage {...props} />} />
);

export default SubmissionsPageRoute;
