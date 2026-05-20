import { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {
  Badge,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Progress,
  Select,
  SimpleGrid,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { BreadcrumbItem } from "@chakra-ui/react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import { Button, Breadcrumb, Heading, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  getExamIntegrityList,
  getExamIntegrityDetail,
  getExamIrregularityLogs,
  getExamIntegrityChartData,
  adminGetCourseListing,
} from "../../../../services";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// ─── Mock Data (fallback when API is unavailable) ─────────────────────────────
// TODO: remove once GET /v1/exam-integrity-v2/* endpoints are live

const MOCK_EXAMS = [
  {
    examId: "exam-001",
    examTitle: "Microfinance Midterm",
    randomizationMethod: "full",
    totalAttempts: 100,
    duplicateDetectionCount: 2,
    duplicateQuestionRate: 2.0,
    avgQuestionOverlap: 15.5,
    randomizationEffectiveness: 85.0,
    irregularAttemptsCount: 3,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-002",
    examTitle: "Data Privacy Final",
    randomizationMethod: "full",
    totalAttempts: 80,
    duplicateDetectionCount: 0,
    duplicateQuestionRate: 0,
    avgQuestionOverlap: 5.0,
    randomizationEffectiveness: 95.0,
    irregularAttemptsCount: 0,
    integrityStatus: "Valid",
  },
  {
    examId: "exam-003",
    examTitle: "Network Security Quiz",
    randomizationMethod: "partial",
    totalAttempts: 55,
    duplicateDetectionCount: 6,
    duplicateQuestionRate: 10.9,
    avgQuestionOverlap: 42.0,
    randomizationEffectiveness: 58.0,
    irregularAttemptsCount: 7,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-004",
    examTitle: "Introduction to Cybersecurity",
    randomizationMethod: "none",
    totalAttempts: 120,
    duplicateDetectionCount: 15,
    duplicateQuestionRate: 12.5,
    avgQuestionOverlap: 100.0,
    randomizationEffectiveness: 0,
    irregularAttemptsCount: 20,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-005",
    examTitle: "Ethics in Technology",
    randomizationMethod: "partial",
    totalAttempts: 40,
    duplicateDetectionCount: 1,
    duplicateQuestionRate: 2.5,
    avgQuestionOverlap: 18.0,
    randomizationEffectiveness: 72.0,
    irregularAttemptsCount: 1,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-006",
    examTitle: "Cloud Computing Fundamentals",
    randomizationMethod: "full",
    totalAttempts: 65,
    duplicateDetectionCount: 0,
    duplicateQuestionRate: 0,
    avgQuestionOverlap: 3.0,
    randomizationEffectiveness: 97.0,
    irregularAttemptsCount: 0,
    integrityStatus: "Valid",
  },
];

const MOCK_LOGS = [
  {
    logId: "log-001",
    examId: "exam-001",
    studentId: "stu-001",
    student: {
      id: "stu-001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    },
    ipAddress: "192.168.1.1",
    deviceInfo: "Chrome 120 – Windows 11",
    geolocation: "Lagos, Nigeria",
    timestamp: "2026-04-10T10:15:00Z",
    anomalyTypes: ["same_ip", "duplicate_answers"],
  },
  {
    logId: "log-002",
    examId: "exam-001",
    studentId: "stu-002",
    student: {
      id: "stu-002",
      firstName: "Mary",
      lastName: "Johnson",
      email: "mary.j@example.com",
    },
    ipAddress: "192.168.1.1",
    deviceInfo: "Firefox 121 – Ubuntu",
    geolocation: "Abuja, Nigeria",
    timestamp: "2026-04-10T10:18:00Z",
    anomalyTypes: ["same_ip"],
  },
  {
    logId: "log-003",
    examId: "exam-001",
    studentId: "stu-003",
    student: {
      id: "stu-003",
      firstName: "James",
      lastName: "Smith",
      email: "james.s@example.com",
    },
    ipAddress: "10.0.0.55",
    deviceInfo: "Chrome 120 – macOS",
    geolocation: "Port Harcourt, Nigeria",
    timestamp: "2026-04-11T09:03:00Z",
    anomalyTypes: ["fast_completion"],
  },
];

const MOCK_DETAIL = {
  ...MOCK_EXAMS[0],
  course: { id: "course-001", title: "Microfinance Principles" },
  irregularityLogs: MOCK_LOGS,
};

const MOCK_CHART_DATA = {
  randomizationDistribution: [
    { method: "full", examCount: 8, avgEffectiveness: 85 },
    { method: "partial", examCount: 3, avgEffectiveness: 60 },
    { method: "none", examCount: 1, avgEffectiveness: 0 },
  ],
  duplicateHeatmap: [
    { location: "Lagos", duplicateCount: 5 },
    { location: "Abuja", duplicateCount: 2 },
    { location: "Port Harcourt", duplicateCount: 3 },
    { location: "Kano", duplicateCount: 1 },
    { location: "Ibadan", duplicateCount: 4 },
  ],
  irregularLogsTable: [
    {
      logId: "log-001",
      studentId: "stu-001",
      student: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      },
      anomalyTypes: ["same_ip", "duplicate_answers"],
      geolocation: "Lagos, Nigeria",
      timestamp: "2026-04-10T10:15:00Z",
      status: "Flagged",
    },
    {
      logId: "log-002",
      studentId: "stu-002",
      student: {
        firstName: "Mary",
        lastName: "Johnson",
        email: "mary.j@example.com",
      },
      anomalyTypes: ["same_ip"],
      geolocation: "Abuja, Nigeria",
      timestamp: "2026-04-10T10:18:00Z",
      status: "Flagged",
    },
    {
      logId: "log-003",
      studentId: "stu-003",
      student: {
        firstName: "James",
        lastName: "Smith",
        email: "james.s@example.com",
      },
      anomalyTypes: ["fast_completion"],
      geolocation: "Port Harcourt, Nigeria",
      timestamp: "2026-04-11T09:03:00Z",
      status: "Flagged",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) => (d ? dayjs(d).format("MMM D, YYYY, h:mm A") : "—");

const maskIp = (ip) => {
  if (!ip) return "—";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  return ip;
};

const effectivenessColor = (pct) => {
  if (pct >= 80) return "green";
  if (pct >= 50) return "yellow";
  return "red";
};

const dupRateColor = (rate) => {
  if (rate === 0) return "green";
  if (rate <= 5) return "orange";
  return "red";
};

const randomMethodScheme = (method) => {
  if (method === "full") return "blue";
  if (method === "partial") return "yellow";
  return "gray";
};

const anomalyLabel = {
  same_ip: "Same IP",
  duplicate_answers: "Duplicate Answers",
  fast_completion: "Fast Completion",
  same_device: "Same Device",
};

const anomalyScheme = {
  same_ip: "orange",
  duplicate_answers: "red",
  fast_completion: "purple",
  same_device: "cyan",
};

const useStyles = makeStyles(() => ({
  tab: { textTransform: "none", fontWeight: 500, minWidth: 120 },
}));

// ─── Anomaly Badges ────────────────────────────────────────────────────────────

const AnomalyBadges = ({ types = [] }) => (
  <Flex gap={1} flexWrap="wrap">
    {types.map((t) => (
      <Badge
        key={t}
        colorScheme={anomalyScheme[t] ?? "gray"}
        fontSize="2xs"
        px={2}
        py={0.5}
        borderRadius="full"
      >
        {anomalyLabel[t] ?? t}
      </Badge>
    ))}
  </Flex>
);

// ─── Log Row ───────────────────────────────────────────────────────────────────

const LogRow = ({ log }) => (
  <Tr>
    <Td>
      <Text fontWeight="medium">
        {log.student?.firstName} {log.student?.lastName}
      </Text>
      <Text fontSize="xs" color="gray.500">
        {log.student?.email}
      </Text>
    </Td>
    <Td fontSize="sm" color="gray.600">
      {maskIp(log.ipAddress)}
    </Td>
    <Td fontSize="sm">{log.deviceInfo || "—"}</Td>
    <Td fontSize="sm">{log.geolocation || "—"}</Td>
    <Td fontSize="sm" whiteSpace="nowrap">
      {fmt(log.timestamp)}
    </Td>
    <Td>
      <AnomalyBadges types={log.anomalyTypes ?? []} />
    </Td>
  </Tr>
);

// ─── Pagination Bar ────────────────────────────────────────────────────────────

const PaginationBar = ({
  page,
  totalPages,
  total,
  limit,
  onPage,
  onLimit,
  limitOptions = [10, 20, 50],
}) => (
  <Flex
    justify="space-between"
    align="center"
    px={4}
    py={3}
    borderTopWidth="1px"
  >
    <Text fontSize="sm" color="gray.600">
      Page {page} of {totalPages} &mdash; {total} record{total !== 1 ? "s" : ""}
    </Text>
    <Flex align="center" gap={3}>
      <Select
        size="sm"
        width="70px"
        value={limit}
        onChange={(e) => onLimit(Number(e.target.value))}
      >
        {limitOptions.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </Select>
      <Flex gap={1}>
        <Box
          as="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          p={1}
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          <FiChevronLeft />
        </Box>
        <Box
          as="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          p={1}
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          <FiChevronRight />
        </Box>
      </Flex>
    </Flex>
  </Flex>
);

// ─── Irregularity Logs Panel ───────────────────────────────────────────────────

const IrregularityLogsPanel = ({ examId, previewLogs }) => {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchLogs = useCallback(
    (p, l) => {
      setLoading(true);
      getExamIrregularityLogs(examId, { page: p, limit: l })
        .then((res) => {
          const d = res?.data ?? res;
          setLogs(d?.logs ?? []);
          setTotal(d?.total ?? 0);
        })
        .catch(() => {
          // TODO: endpoint GET /v1/exam-integrity-v2/exams/{id}/irregularity-logs not yet live — using mock
          console.warn(
            "[ExamIntegrity] /irregularity-logs failed, falling back to mock data",
          );
          setLogs(
            MOCK_LOGS.filter((l) => l.examId === examId).length
              ? MOCK_LOGS.filter((l) => l.examId === examId)
              : MOCK_LOGS,
          );
          setTotal(MOCK_LOGS.length);
        })
        .finally(() => setLoading(false));
    },
    [examId],
  );

  const handleExpand = () => {
    if (!expanded) fetchLogs(1, limit);
    setExpanded((v) => !v);
  };

  const handlePage = (p) => {
    setPage(p);
    fetchLogs(p, limit);
  };
  const handleLimit = (l) => {
    setLimit(l);
    setPage(1);
    fetchLogs(1, l);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const displayLogs = expanded ? logs : (previewLogs ?? []).slice(0, 5);

  return (
    <Box mt={6}>
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight="semibold" fontSize="md">
          Irregularity Logs
          {!expanded && previewLogs?.length > 0 && (
            <Text
              as="span"
              color="gray.400"
              fontWeight="normal"
              fontSize="sm"
              ml={2}
            >
              (preview — first {Math.min(5, previewLogs.length)})
            </Text>
          )}
        </Text>
        <Button size="sm" secondary onClick={handleExpand}>
          {expanded ? "Show Less" : "View All Logs"}
        </Button>
      </Flex>

      {displayLogs.length === 0 && !loading ? (
        <Box py={6} textAlign="center" bg="gray.50" borderRadius="md">
          <Text color="gray.500">
            No irregularities detected for this exam.
          </Text>
        </Box>
      ) : loading ? (
        <Box>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height="44px" mb={2} />
          ))}
        </Box>
      ) : (
        <TableContainer borderWidth="1px" borderRadius="md">
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Student</Th>
                <Th>IP Address</Th>
                <Th>Device</Th>
                <Th>Geolocation</Th>
                <Th>Timestamp</Th>
                <Th>Anomaly Types</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayLogs.map((log) => (
                <LogRow key={log.logId} log={log} />
              ))}
            </Tbody>
          </Table>
          {expanded && total > 0 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPage={handlePage}
              onLimit={handleLimit}
            />
          )}
        </TableContainer>
      )}
    </Box>
  );
};

// ─── Exam Detail Drawer ────────────────────────────────────────────────────────

const ExamDetailDrawer = ({ examId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isOpen || !examId) return;
    setData(null);
    setNotFound(false);
    setLoading(true);
    getExamIntegrityDetail(examId)
      .then((res) => setData(res?.data ?? res))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          // TODO: endpoint GET /v1/exam-integrity-v2/exams/{id} not yet live — using mock
          console.warn(
            "[ExamIntegrity] /exams/:id failed, falling back to mock data",
          );
          setData(
            MOCK_DETAIL.examId === examId
              ? MOCK_DETAIL
              : { ...MOCK_DETAIL, examId },
          );
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, examId]);

  const d = data;
  const isFlagged = d?.integrityStatus === "Flagged";

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader
          borderBottomWidth="1px"
          bg={isFlagged ? "red.50" : "white"}
          color={isFlagged ? "red.700" : "inherit"}
        >
          {loading ? "Loading…" : (d?.examTitle ?? "Exam Details")}
          {isFlagged && (
            <Badge colorScheme="red" ml={3} fontSize="sm">
              Flagged
            </Badge>
          )}
        </DrawerHeader>

        <DrawerBody py={6}>
          {loading && (
            <Box>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} height="20px" mb={3} />
              ))}
            </Box>
          )}

          {!loading && notFound && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" fontWeight="semibold" mb={2}>
                Exam not found
              </Text>
              <Text color="gray.500" mb={4}>
                This exam could not be retrieved.
              </Text>
              <Button onClick={onClose}>Back to List</Button>
            </Box>
          )}

          {!loading && d && (
            <>
              {d.course && (
                <Text color="gray.500" mb={4} fontSize="sm">
                  {d.course.title}
                </Text>
              )}

              {/* KPI block */}
              <SimpleGrid columns={2} spacing={4} mb={6}>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Randomization Method
                  </Text>
                  <Badge
                    colorScheme={randomMethodScheme(d.randomizationMethod)}
                    mt={1}
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {d.randomizationMethod ?? "—"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Integrity Status
                  </Text>
                  <Badge
                    colorScheme={
                      d.integrityStatus === "Valid" ? "green" : "red"
                    }
                    mt={1}
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {d.integrityStatus ?? "—"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Total Attempts
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {d.totalAttempts ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Irregular Attempts
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      (d.irregularAttemptsCount ?? 0) > 0
                        ? "red.500"
                        : "gray.700"
                    }
                  >
                    {d.irregularAttemptsCount ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Duplicate Sets Detected
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      (d.duplicateDetectionCount ?? 0) > 0
                        ? "orange.500"
                        : "gray.700"
                    }
                  >
                    {d.duplicateDetectionCount ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Duplicate Question Rate
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      dupRateColor(d.duplicateQuestionRate ?? 0) === "green"
                        ? "green.600"
                        : dupRateColor(d.duplicateQuestionRate ?? 0) ===
                            "orange"
                          ? "orange.500"
                          : "red.500"
                    }
                  >
                    {d.duplicateQuestionRate != null
                      ? `${d.duplicateQuestionRate}%`
                      : "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Avg Question Overlap
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {d.avgQuestionOverlap != null
                      ? `${d.avgQuestionOverlap}%`
                      : "—"}
                  </Text>
                </Box>
                <Box gridColumn="span 2">
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Randomization Effectiveness
                  </Text>
                  <Flex align="center" gap={3}>
                    <Progress
                      flex="1"
                      size="sm"
                      value={d.randomizationEffectiveness ?? 0}
                      colorScheme={effectivenessColor(
                        d.randomizationEffectiveness ?? 0,
                      )}
                      borderRadius="full"
                    />
                    <Text fontSize="sm" fontWeight="medium" minW="40px">
                      {d.randomizationEffectiveness ?? 0}%
                    </Text>
                  </Flex>
                </Box>
              </SimpleGrid>

              <Divider mb={4} />

              <IrregularityLogsPanel
                examId={d.examId}
                previewLogs={d.irregularityLogs ?? []}
              />
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// ─── Analytics Tab ─────────────────────────────────────────────────────────────

const AnalyticsTab = ({ courseId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = courseId ? { courseId } : {};
    getExamIntegrityChartData(params)
      .then((res) => setChartData(res?.data ?? res))
      .catch(() => {
        // TODO: endpoint GET /v1/exam-integrity-v2/chart-data not yet live — using mock
        console.warn(
          "[ExamIntegrity] /chart-data failed, falling back to mock data",
        );
        setChartData(MOCK_CHART_DATA);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="240px" borderRadius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  if (!chartData) return null;

  const dist = chartData.randomizationDistribution ?? [];
  const heatmap = chartData.duplicateHeatmap ?? [];
  const logsTable = chartData.irregularLogsTable ?? [];

  const distChartData = {
    labels: dist.map(
      (d) => d.method.charAt(0).toUpperCase() + d.method.slice(1),
    ),
    datasets: [
      {
        label: "Exam Count",
        data: dist.map((d) => d.examCount),
        backgroundColor: "rgba(66, 153, 225, 0.7)",
        borderRadius: 4,
      },
      {
        label: "Avg Effectiveness (%)",
        data: dist.map((d) => d.avgEffectiveness),
        backgroundColor: "rgba(72, 187, 120, 0.7)",
        borderRadius: 4,
      },
    ],
  };

  const heatmapChartData = {
    labels: heatmap.map((h) => h.location),
    datasets: [
      {
        label: "Duplicate Attempts",
        data: heatmap.map((h) => h.duplicateCount),
        backgroundColor: heatmap.map((h) =>
          h.duplicateCount >= 4
            ? "rgba(229, 62, 62, 0.7)"
            : h.duplicateCount >= 2
              ? "rgba(237, 137, 54, 0.7)"
              : "rgba(236, 201, 75, 0.7)",
        ),
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = (titleText) => ({
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: titleText,
        font: { size: 14, weight: "600" },
      },
    },
    scales: { y: { beginAtZero: true } },
  });

  return (
    <Box mt={6}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Chart 1 – Randomization Distribution */}
        <Box bg="white" borderRadius="lg" boxShadow="sm" p={5}>
          <Bar
            data={distChartData}
            options={chartOptions("Randomization Distribution")}
          />
        </Box>

        {/* Chart 2 – Duplicate Heatmap (bar) */}
        <Box bg="white" borderRadius="lg" boxShadow="sm" p={5}>
          <Bar
            data={heatmapChartData}
            options={{
              ...chartOptions("Duplicate Attempts by Location"),
              indexAxis: "y",
            }}
          />
        </Box>
      </SimpleGrid>

      {/* Chart 3 – Cross-exam Irregular Logs Table */}
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Box px={5} py={4} borderBottomWidth="1px">
          <Text fontWeight="semibold">Cross-Exam Irregular Sessions</Text>
          <Text fontSize="sm" color="gray.500">
            All flagged student sessions across all exams
          </Text>
        </Box>
        {logsTable.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500">No flagged sessions found.</Text>
          </Box>
        ) : (
          <TableContainer>
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Student</Th>
                  <Th>Anomaly Types</Th>
                  <Th>Geolocation</Th>
                  <Th>Timestamp</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logsTable.map((log) => (
                  <Tr key={log.logId}>
                    <Td>
                      <Text fontWeight="medium">
                        {log.student?.firstName} {log.student?.lastName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {log.student?.email}
                      </Text>
                    </Td>
                    <Td>
                      <AnomalyBadges types={log.anomalyTypes ?? []} />
                    </Td>
                    <Td fontSize="sm">{log.geolocation || "—"}</Td>
                    <Td fontSize="sm" whiteSpace="nowrap">
                      {fmt(log.timestamp)}
                    </Td>
                    <Td>
                      <Badge colorScheme="red" borderRadius="full" px={2}>
                        {log.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const LIMIT_OPTIONS = [10, 20, 50];

const ExamIntegrityPage = () => {
  const classes = useStyles();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tab, setTab] = useState(0);
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState(null);

  useEffect(() => {
    adminGetCourseListing({ page: 1, limit: 200 })
      .then((res) => setCourses(res?.courses ?? []))
      .catch(() => {});
  }, []);

  const fetchExams = useCallback((cId, p, l) => {
    setTableLoading(true);
    const params = { page: p, limit: l };
    if (cId) params.courseId = cId;
    getExamIntegrityList(params)
      .then((res) => {
        const d = res?.data ?? res;
        setExams(d?.exams ?? []);
        setTotal(d?.total ?? 0);
      })
      .catch(() => {
        // TODO: endpoint GET /v1/exam-integrity-v2/exams not yet live — using mock
        console.warn(
          "[ExamIntegrity] /exams failed, falling back to mock data",
        );
        setExams(MOCK_EXAMS);
        setTotal(MOCK_EXAMS.length);
      })
      .finally(() => setTableLoading(false));
  }, []);

  useEffect(() => {
    fetchExams(courseId, page, limit);
  }, []); // eslint-disable-line

  const handleCourseChange = (val) => {
    setCourseId(val);
    setPage(1);
    fetchExams(val, 1, limit);
  };

  const clearFilter = () => {
    setCourseId("");
    setPage(1);
    fetchExams("", 1, limit);
  };

  const handleRowClick = (examId) => {
    setSelectedExamId(examId);
    onOpen();
  };

  const handlePage = (p) => {
    setPage(p);
    fetchExams(courseId, p, limit);
  };
  const handleLimit = (l) => {
    setLimit(l);
    setPage(1);
    fetchExams(courseId, 1, l);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/studentReport">Reports</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/exam-integrity">Exam Integrity</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>

      <Heading level="2" mb={2}>
        Randomization &amp; Exam Integrity Monitoring
      </Heading>
      <Text color="gray.500" mb={6}>
        Track question randomization, detect duplicate exam sets, and monitor
        session-level irregularities.
      </Text>

      {/* ── Filter Bar ── */}
      <Box bg="white" borderRadius="lg" p={4} mb={6} boxShadow="sm">
        <Flex align="flex-end" gap={4} flexWrap="wrap">
          <FormControl maxW="280px">
            <FormLabel fontSize="xs">Course</FormLabel>
            <Select
              size="sm"
              placeholder="All Courses"
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.courseId || c.id} value={c.courseId || c.id}>
                  {c.courseTitle || c.title || c.name}
                </option>
              ))}
            </Select>
          </FormControl>
          {courseId && (
            <Button
              size="sm"
              secondary
              onClick={clearFilter}
              leftIcon={<FiX />}
            >
              Clear Filter
            </Button>
          )}
          <Button
            size="sm"
            secondary
            onClick={() => fetchExams(courseId, page, limit)}
            leftIcon={<FiRefreshCw />}
          >
            Refresh
          </Button>
        </Flex>
      </Box>

      {/* ── Tabs ── */}
      <Box borderBottomWidth="1px" mb={6}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Exam List" className={classes.tab} />
          <Tab label="Analytics" className={classes.tab} />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Flex
            justify="space-between"
            align="center"
            px={4}
            py={3}
            borderBottomWidth="1px"
          >
            <Text fontWeight="semibold">
              Exams
              {total > 0 && (
                <Text
                  as="span"
                  color="gray.500"
                  fontWeight="normal"
                  ml={2}
                  fontSize="sm"
                >
                  ({total} total)
                </Text>
              )}
            </Text>
          </Flex>

          {tableLoading ? (
            <Box p={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="48px" mb={2} />
              ))}
            </Box>
          ) : exams.length === 0 ? (
            <Box p={10} textAlign="center">
              <Text color="gray.500">No exams found.</Text>
            </Box>
          ) : (
            <TableContainer>
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Exam Title</Th>
                    <Th>Randomization</Th>
                    <Th isNumeric>Attempts</Th>
                    <Th isNumeric>Dup. Sets</Th>
                    <Th isNumeric>Dup. Rate</Th>
                    <Th isNumeric>Avg Overlap</Th>
                    <Th minW="140px">Effectiveness</Th>
                    <Th isNumeric>Irregular</Th>
                    <Th>Integrity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exams.map((exam) => {
                    const flagged = exam.integrityStatus === "Flagged";
                    return (
                      <Tr
                        key={exam.examId}
                        bg={flagged ? "red.50" : "white"}
                        _hover={{ bg: flagged ? "red.100" : "gray.50" }}
                        cursor="pointer"
                        onClick={() => handleRowClick(exam.examId)}
                      >
                        <Td>
                          <Flex align="center" gap={2}>
                            {flagged && <FiAlertTriangle color="#C53030" />}
                            <Text
                              color="blue.600"
                              fontWeight="medium"
                              _hover={{ textDecoration: "underline" }}
                            >
                              {exam.examTitle}
                            </Text>
                          </Flex>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={randomMethodScheme(
                              exam.randomizationMethod,
                            )}
                            borderRadius="full"
                            px={2}
                            textTransform="capitalize"
                          >
                            {exam.randomizationMethod ?? "—"}
                          </Badge>
                        </Td>
                        <Td isNumeric>{exam.totalAttempts ?? "—"}</Td>
                        <Td isNumeric>
                          <Text
                            color={
                              (exam.duplicateDetectionCount ?? 0) > 0
                                ? "orange.500"
                                : "gray.700"
                            }
                            fontWeight="medium"
                          >
                            {exam.duplicateDetectionCount ?? "—"}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text
                            color={
                              dupRateColor(exam.duplicateQuestionRate ?? 0) ===
                              "red"
                                ? "red.500"
                                : dupRateColor(
                                      exam.duplicateQuestionRate ?? 0,
                                    ) === "orange"
                                  ? "orange.500"
                                  : "green.600"
                            }
                            fontWeight="medium"
                          >
                            {exam.duplicateQuestionRate != null
                              ? `${exam.duplicateQuestionRate}%`
                              : "—"}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          {exam.avgQuestionOverlap != null
                            ? `${exam.avgQuestionOverlap}%`
                            : "—"}
                        </Td>
                        <Td>
                          <Box minW="110px">
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="xs">
                                {exam.randomizationEffectiveness ?? 0}%
                              </Text>
                            </Flex>
                            <Progress
                              size="xs"
                              value={exam.randomizationEffectiveness ?? 0}
                              colorScheme={effectivenessColor(
                                exam.randomizationEffectiveness ?? 0,
                              )}
                              borderRadius="full"
                            />
                          </Box>
                        </Td>
                        <Td isNumeric>
                          {(exam.irregularAttemptsCount ?? 0) > 0 ? (
                            <Badge colorScheme="red" borderRadius="full" px={2}>
                              {exam.irregularAttemptsCount}
                            </Badge>
                          ) : (
                            <Text color="gray.500">0</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              exam.integrityStatus === "Valid" ? "green" : "red"
                            }
                            borderRadius="full"
                            px={2}
                          >
                            {exam.integrityStatus ?? "—"}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {!tableLoading && total > 0 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPage={handlePage}
              onLimit={handleLimit}
              limitOptions={LIMIT_OPTIONS}
            />
          )}
        </Box>
      )}

      {tab === 1 && <AnalyticsTab courseId={courseId} />}

      {/* Exam Detail Drawer */}
      <ExamDetailDrawer
        examId={selectedExamId}
        isOpen={isOpen}
        onClose={onClose}
      />
    </AdminMainAreaWrapper>
  );
};

export const ExamIntegrityPageRoute = (props) => (
  <Route {...props} component={ExamIntegrityPage} />
);

export default ExamIntegrityPage;
