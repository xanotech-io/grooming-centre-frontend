import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
} from "@chakra-ui/react";
import { Heading, Text, Button } from "../../../../../components";
import { getAllAssessmentResults } from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";
import { FiUser, FiEye } from "react-icons/fi";
import dayjs from "dayjs";

/* ─── helpers ─────────────────────────────────────── */
const gradeColor = (grade) => {
  if (!grade) return { color: "#718096", bg: "#F7FAFC" };
  const c = grade.charAt(0).toUpperCase();
  if (c === "A") return { color: "#38A169", bg: "#E6F4EA" };
  if (c === "B") return { color: "#3182CE", bg: "#EBF4FF" };
  if (c === "C") return { color: "#DD6B20", bg: "#FFF5EA" };
  return { color: "#E53E3E", bg: "#FED7D7" };
};

const statusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "graded" || s === "completed")
    return { bg: "#E6F4EA", color: "#38A169" };
  if (s === "pending_manual_grade" || s === "in_progress")
    return { bg: "#FFF3CD", color: "#B7791F" };
  if (s === "submitted") return { bg: "#EBF4FF", color: "#3182CE" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const StatCard = ({ label, value, sub, accent }) => (
  <Box
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="10px"
    px={5}
    py={4}
    borderTop={accent ? `3px solid ${accent}` : undefined}
  >
    <Text
      fontSize="10px"
      color="gray.400"
      fontWeight="700"
      textTransform="uppercase"
      letterSpacing="wider"
      mb={1}
    >
      {label}
    </Text>
    <Text fontSize="24px" fontWeight="800" color="#1A202C" lineHeight="1">
      {value ?? "—"}
    </Text>
    {sub && (
      <Text fontSize="11px" color="gray.400" mt={1}>
        {sub}
      </Text>
    )}
  </Box>
);

const ScoreBar = ({ score, max = 100 }) => {
  const pct = max ? Math.min((score / max) * 100, 100) : 0;
  const color = pct >= 70 ? "#38A169" : pct >= 50 ? "#DD6B20" : "#E53E3E";
  return (
    <Flex alignItems="center" gap={2}>
      <Progress
        value={pct}
        size="sm"
        w="60px"
        borderRadius="4px"
        sx={{ "& > div": { background: color } }}
      />
      <Text fontSize="12px" fontWeight="600" color={color}>
        {score != null ? `${score}%` : "—"}
      </Text>
    </Flex>
  );
};

/* ─── Main page ───────────────────────────────────── */
const ResultsPage = () => {
  const { id: courseId, assessmentId } = useParams();
  const { push } = useHistory();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    getAllAssessmentResults(assessmentId)
      .then(({ results: data }) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load results");
        setLoading(false);
      });
  }, [assessmentId]);

  /* ── derived stats ── */
  const graded = results.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s === "graded" || s === "completed";
  });
  const scores = graded
    .map((r) => parseFloat(r.totalScore ?? 0))
    .filter((n) => !isNaN(n));
  const avg = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : null;
  const highest = scores.length ? Math.max(...scores).toFixed(1) : null;
  const lowest = scores.length ? Math.min(...scores).toFixed(1) : null;
  const passing = graded.filter(
    (r) => parseFloat(r.totalScore ?? 0) >= 50,
  ).length;
  const passRate = graded.length
    ? `${Math.round((passing / graded.length) * 100)}%`
    : "—";

  /* ── filtered rows ── */
  const filtered = results.filter((r) => {
    const name = [r.student?.firstName, r.student?.lastName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const email = (r.student?.email || "").toLowerCase();
    const matchSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (r.status || "").toLowerCase().includes(statusFilter);
    return matchSearch && matchStatus;
  });

  return (
    <Box padding={6}>
      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        mb={6}
        flexWrap="wrap"
        gap={3}
      >
        <Box>
          <Heading fontSize="heading.h4">Results</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            All student results for this assessment
          </Text>
        </Box>
        {!loading && !error && results.length > 0 && (
          <Flex gap={2}>
            <Badge
              bg="#EBF4FF"
              color="#3182CE"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="13px"
              fontWeight="600"
            >
              {results.length} student{results.length !== 1 ? "s" : ""}
            </Badge>
            <Button
              secondary
              onClick={() =>
                push(
                  `/admin/courses/${courseId}/assessment/${assessmentId}/grading`,
                )
              }
            >
              Grading Queue
            </Button>
          </Flex>
        )}
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && error && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
          p={6}
          textAlign="center"
        >
          <Text color="red.600">{capitalizeFirstLetter(error)}</Text>
          <Button secondary onClick={() => window.location.reload()} mt={3}>
            Retry
          </Button>
        </Box>
      )}

      {!loading && !error && (
        <>
          {/* Stats band */}
          <Grid
            templateColumns={{ base: "1fr 1fr", md: "repeat(5, 1fr)" }}
            gap={4}
            mb={6}
          >
            <StatCard
              label="Submitted"
              value={results.length}
              accent="#3182CE"
            />
            <StatCard label="Graded" value={graded.length} accent="#38A169" />
            <StatCard
              label="Avg Score"
              value={avg != null ? `${avg}%` : "—"}
              accent="#6b006b"
            />
            <StatCard
              label="Pass Rate"
              value={passRate}
              sub="≥ 50%"
              accent="#DD6B20"
            />
            <StatCard
              label="Highest / Lowest"
              value={highest != null ? `${highest}%` : "—"}
              sub={lowest != null ? `Lowest: ${lowest}%` : undefined}
              accent="#ECC94B"
            />
          </Grid>

          {/* Filters */}
          <Flex gap={3} mb={4} flexWrap="wrap" alignItems="center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 13,
                outline: "none",
                minWidth: 220,
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 13,
                background: "white",
                outline: "none",
              }}
            >
              <option value="all">All statuses</option>
              <option value="graded">Graded</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
            </select>
          </Flex>

          {results.length === 0 && (
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="md"
              p={12}
              textAlign="center"
            >
              <Text color="gray.500" fontSize="15px">
                No results yet for this assessment.
              </Text>
            </Box>
          )}

          {results.length > 0 && filtered.length === 0 && (
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="md"
              p={8}
              textAlign="center"
            >
              <Text color="gray.500">No results match your filters.</Text>
            </Box>
          )}

          {filtered.length > 0 && (
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="12px"
              overflow="hidden"
            >
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#F7F9FC">
                    <Tr>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        #
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Student
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Auto
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Manual
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Total
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Grade
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Status
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Submitted
                      </Th>
                      <Th color="gray.500" fontSize="11px" py={3}>
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filtered.map((r, i) => {
                      const fullName =
                        [r.student?.firstName, r.student?.lastName]
                          .filter(Boolean)
                          .join(" ") || "—";
                      const gc = gradeColor(r.grade);
                      const sc = statusColor(r.status);
                      const submittedAt = r.submissionTime
                        ? dayjs(r.submissionTime).format("DD/MM/YY h:mm a")
                        : "—";

                      return (
                        <Tr key={r.studentId || i} _hover={{ bg: "#F9F0FF" }}>
                          <Td color="gray.400" fontSize="13px">
                            {i + 1}
                          </Td>
                          <Td>
                            <Flex alignItems="center" gap={2}>
                              <Box
                                w="28px"
                                h="28px"
                                bg="#F0E6FF"
                                borderRadius="50%"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                              >
                                <FiUser color="#6b006b" size={12} />
                              </Box>
                              <Box>
                                <Text
                                  fontSize="13px"
                                  fontWeight="600"
                                  color="#1A202C"
                                >
                                  {fullName}
                                </Text>
                                <Text fontSize="11px" color="gray.400">
                                  {r.student?.email || "—"}
                                </Text>
                              </Box>
                            </Flex>
                          </Td>
                          <Td>
                            <Text
                              fontSize="13px"
                              color="#3182CE"
                              fontWeight="600"
                            >
                              {r.autoScore != null
                                ? `${parseFloat(r.autoScore).toFixed(1)}`
                                : "—"}
                            </Text>
                          </Td>
                          <Td>
                            <Text
                              fontSize="13px"
                              color="#6b006b"
                              fontWeight="600"
                            >
                              {r.manualScore != null
                                ? `${parseFloat(r.manualScore).toFixed(1)}`
                                : "—"}
                            </Text>
                          </Td>
                          <Td>
                            <ScoreBar
                              score={
                                r.totalScore != null
                                  ? parseFloat(r.totalScore).toFixed(1)
                                  : null
                              }
                            />
                          </Td>
                          <Td>
                            {r.grade ? (
                              <Box
                                bg={gc.bg}
                                color={gc.color}
                                borderRadius="6px"
                                px={2}
                                py={1}
                                display="inline-block"
                                fontSize="13px"
                                fontWeight="800"
                                minW="28px"
                                textAlign="center"
                              >
                                {r.grade}
                              </Box>
                            ) : (
                              <Text color="gray.400" fontSize="13px">
                                —
                              </Text>
                            )}
                          </Td>
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
                              {(r.status || "—").replace(/_/g, " ")}
                            </Badge>
                          </Td>
                          <Td fontSize="12px" color="gray.500">
                            {submittedAt}
                          </Td>
                          <Td>
                            <Flex gap={2}>
                              <Box
                                as="button"
                                title="View result"
                                onClick={() =>
                                  push(
                                    `/admin/courses/${courseId}/assessment/${assessmentId}/submissions`,
                                  )
                                }
                                color="#6b006b"
                                _hover={{ color: "#560056" }}
                              >
                                <FiEye size={15} />
                              </Box>
                              {(r.status || "")
                                .toLowerCase()
                                .includes("pending") && (
                                <Box
                                  as="button"
                                  title="Grade"
                                  onClick={() =>
                                    push(
                                      `/admin/courses/${courseId}/assessment/${assessmentId}/grading/${r.studentId}`,
                                    )
                                  }
                                  color="#B7791F"
                                  _hover={{ color: "#975A16" }}
                                  fontSize="11px"
                                  fontWeight="600"
                                >
                                  Grade
                                </Box>
                              )}
                            </Flex>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

const ResultsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ResultsPage {...props} />} />
);

export default ResultsPageRoute;
