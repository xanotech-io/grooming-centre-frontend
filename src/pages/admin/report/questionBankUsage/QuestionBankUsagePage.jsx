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
  Grid,
  Input,
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
  Tooltip,
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
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar, Scatter, Line } from "react-chartjs-2";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import {
  Button,
  Breadcrumb,
  Heading,
  Link,
  DashboardMetricCard,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  getQuestionBankSummary,
  getQuestionBankList,
  getQuestionBankDetail,
  getQuestionBankChartData,
  adminGetCourseListing,
} from "../../../../services";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  ChartTooltip,
  Legend,
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
// TODO: remove once GET /v1/question-bank-v2/* endpoints are live

const MOCK_SUMMARY = {
  totalQuestions: 70,
  difficultyDistribution: { Easy: 20, Medium: 35, Hard: 15, untagged: 0 },
  overallCorrectRate: 67.4,
  totalAttempts: 8200,
  usageTrend: [
    { month: "2026-01", usageCount: 420 },
    { month: "2026-02", usageCount: 510 },
    { month: "2026-03", usageCount: 390 },
    { month: "2026-04", usageCount: 480 },
    { month: "2026-05", usageCount: 560 },
  ],
};

const MOCK_QUESTIONS = [
  {
    questionId: "q-001",
    question: "What is the primary purpose of a microfinance institution?",
    questionType: "mcq",
    section: "Module 1 – Introduction",
    difficultyLevel: "Hard",
    predefinedDifficulty: "Medium",
    course: "Microfinance Basics",
    courseId: "course-001",
    examId: "exam-001",
    examTitle: "Microfinance Midterm",
    lastUsedDate: "2026-03-15T00:00:00Z",
    createdAt: "2025-09-01T00:00:00Z",
    usageFrequency: 5,
    totalAttempts: 100,
    correctResponses: 22,
    incorrectResponses: 78,
    correctResponseRate: 22.0,
    averageTimeSpent: 72,
    reliabilityIndex: 0.35,
    flags: ["too_difficult", "unreliable"],
  },
  {
    questionId: "q-002",
    question: "Define credit risk in the context of microfinance lending.",
    questionType: "essay",
    section: "Module 2 – Risk",
    difficultyLevel: "Medium",
    predefinedDifficulty: "Medium",
    course: "Microfinance Basics",
    courseId: "course-001",
    examId: "exam-001",
    examTitle: "Microfinance Midterm",
    lastUsedDate: "2026-03-10T00:00:00Z",
    createdAt: "2025-09-05T00:00:00Z",
    usageFrequency: 3,
    totalAttempts: 85,
    correctResponses: 60,
    incorrectResponses: 25,
    correctResponseRate: 70.6,
    averageTimeSpent: 110,
    reliabilityIndex: 0.72,
    flags: ["time_consuming"],
  },
  {
    questionId: "q-003",
    question:
      "True or False: Microfinance institutions are only found in developing countries.",
    questionType: "true_false",
    section: "Module 1 – Introduction",
    difficultyLevel: "Easy",
    predefinedDifficulty: "Easy",
    course: "Microfinance Basics",
    courseId: "course-001",
    examId: "exam-002",
    examTitle: "Module 1 Quiz",
    lastUsedDate: "2026-04-01T00:00:00Z",
    createdAt: "2025-09-10T00:00:00Z",
    usageFrequency: 8,
    totalAttempts: 200,
    correctResponses: 192,
    incorrectResponses: 8,
    correctResponseRate: 96.0,
    averageTimeSpent: 8,
    reliabilityIndex: 0.81,
    flags: ["too_easy", "overused"],
  },
  {
    questionId: "q-004",
    question:
      "What is the average loan size typically offered by microfinance institutions?",
    questionType: "mcq",
    section: "Module 3 – Products",
    difficultyLevel: "Medium",
    predefinedDifficulty: "Hard",
    course: "Microfinance Basics",
    courseId: "course-001",
    examId: "exam-001",
    examTitle: "Microfinance Midterm",
    lastUsedDate: "2026-02-20T00:00:00Z",
    createdAt: "2025-10-01T00:00:00Z",
    usageFrequency: 2,
    totalAttempts: 60,
    correctResponses: 42,
    incorrectResponses: 18,
    correctResponseRate: 70.0,
    averageTimeSpent: 30,
    reliabilityIndex: 0.65,
    flags: [],
  },
  {
    questionId: "q-005",
    question:
      "Fill in the blank: The process of assessing a borrower's ability to repay is called ___.",
    questionType: "fill_blank",
    section: "Module 2 – Risk",
    difficultyLevel: "Hard",
    predefinedDifficulty: "Hard",
    course: "Data Privacy Fundamentals",
    courseId: "course-002",
    examId: "exam-003",
    examTitle: "Data Privacy Final",
    lastUsedDate: "2026-01-15T00:00:00Z",
    createdAt: "2025-11-01T00:00:00Z",
    usageFrequency: 1,
    totalAttempts: 40,
    correctResponses: 8,
    incorrectResponses: 32,
    correctResponseRate: 20.0,
    averageTimeSpent: 45,
    reliabilityIndex: 0.28,
    flags: ["too_difficult", "unreliable"],
  },
];

const MOCK_CHART_DATA = {
  difficultyDistribution: { easy: 20, medium: 35, hard: 15 },
  scatterData: [
    { questionId: "q-001", correctRate: 22, avgTime: 72 },
    { questionId: "q-002", correctRate: 70.6, avgTime: 110 },
    { questionId: "q-003", correctRate: 96, avgTime: 8 },
    { questionId: "q-004", correctRate: 70, avgTime: 30 },
    { questionId: "q-005", correctRate: 20, avgTime: 45 },
    { questionId: "q-006", correctRate: 55, avgTime: 25 },
    { questionId: "q-007", correctRate: 80, avgTime: 18 },
    { questionId: "q-008", correctRate: 35, avgTime: 60 },
  ],
  usageTrend: [
    { month: "2026-01", usageCount: 420 },
    { month: "2026-02", usageCount: 510 },
    { month: "2026-03", usageCount: 390 },
    { month: "2026-04", usageCount: 480 },
    { month: "2026-05", usageCount: 560 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => (d ? dayjs(d).format("MMM D, YYYY") : "—");

const fmtTime = (secs) => {
  if (secs == null) return "—";
  if (secs >= 60) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${secs}s`;
};

const correctRateColor = (rate) => {
  if (rate > 85) return "green.600";
  if (rate >= 50) return "gray.700";
  if (rate >= 30) return "orange.500";
  return "red.500";
};

const difficultyScheme = (level) => {
  if (level === "Easy") return "green";
  if (level === "Medium") return "yellow";
  if (level === "Hard") return "red";
  return "gray";
};

const qtypeLabel = {
  mcq: "MCQ",
  essay: "Essay",
  true_false: "True/False",
  fill_blank: "Fill Blank",
  matching: "Matching",
  short_answer: "Short Answer",
};

const qtypeScheme = {
  mcq: "blue",
  essay: "purple",
  true_false: "teal",
  fill_blank: "cyan",
  matching: "orange",
  short_answer: "pink",
};

const flagLabel = {
  too_easy: "Too Easy",
  too_difficult: "Too Difficult",
  time_consuming: "Time Consuming",
  unreliable: "Unreliable",
  overused: "Overused",
};

const flagScheme = {
  too_easy: "green",
  too_difficult: "red",
  time_consuming: "yellow",
  unreliable: "orange",
  overused: "purple",
};

const rowBg = (flags = []) => {
  if (flags.includes("too_difficult") || flags.includes("unreliable"))
    return "red.50";
  if (flags.includes("too_easy") || flags.includes("overused"))
    return "orange.50";
  if (flags.includes("time_consuming")) return "yellow.50";
  return "white";
};

const rowHoverBg = (flags = []) => {
  if (flags.includes("too_difficult") || flags.includes("unreliable"))
    return "red.100";
  if (flags.includes("too_easy") || flags.includes("overused"))
    return "orange.100";
  if (flags.includes("time_consuming")) return "yellow.100";
  return "gray.50";
};

const reliabilityLabel = (idx) => {
  if (idx >= 0.7) return { text: "High Reliability", color: "green.600" };
  if (idx >= 0.4) return { text: "Moderate Reliability", color: "orange.500" };
  return { text: "Low Reliability", color: "red.500" };
};

const useStyles = makeStyles(() => ({
  tab: { textTransform: "none", fontWeight: 500, minWidth: 120 },
}));

const DEFAULT_FILTERS = {
  courseId: "",
  difficulty: "",
  questionType: "",
  startDate: "",
  endDate: "",
};

const LIMIT_OPTIONS = [10, 20, 50];

// ─── FlagBadges ───────────────────────────────────────────────────────────────

const FlagBadges = ({ flags = [] }) => (
  <Flex gap={1} flexWrap="wrap">
    {flags.map((f) => (
      <Badge
        key={f}
        colorScheme={flagScheme[f] ?? "gray"}
        fontSize="2xs"
        px={2}
        py={0.5}
        borderRadius="full"
      >
        {flagLabel[f] ?? f}
      </Badge>
    ))}
  </Flex>
);

// ─── Pagination Bar ───────────────────────────────────────────────────────────

const PaginationBar = ({ page, totalPages, total, limit, onPage, onLimit }) => (
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
        {LIMIT_OPTIONS.map((n) => (
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

// ─── Question Detail Drawer ───────────────────────────────────────────────────

const QuestionDetailDrawer = ({ questionId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isOpen || !questionId) return;
    setData(null);
    setNotFound(false);
    setLoading(true);
    getQuestionBankDetail(questionId)
      .then((res) => setData(res?.data ?? res))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          // TODO: endpoint GET /v1/question-bank-v2/questions/{id} not yet live — using mock
          console.warn(
            "[QuestionBankUsage] /questions/:id failed, falling back to mock",
          );
          const mock =
            MOCK_QUESTIONS.find((q) => q.questionId === questionId) ??
            MOCK_QUESTIONS[0];
          setData(mock);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, questionId]);

  const d = data;
  const rel = d ? reliabilityLabel(d.reliabilityIndex) : null;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Question Analytics</DrawerHeader>
        <DrawerBody py={6}>
          {loading && (
            <Box>
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} height="20px" mb={3} />
              ))}
            </Box>
          )}

          {!loading && notFound && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" fontWeight="semibold" mb={2}>
                Question not found
              </Text>
              <Text color="gray.500" mb={4}>
                This question could not be retrieved.
              </Text>
              <Button onClick={onClose}>Back to List</Button>
            </Box>
          )}

          {!loading && d && (
            <Box>
              {/* Question text */}
              <Box bg="gray.50" borderRadius="md" p={4} mb={5}>
                <Text fontWeight="medium" fontSize="md">
                  {d.question}
                </Text>
              </Box>

              {/* Type + difficulty badges */}
              <Flex gap={3} mb={5} flexWrap="wrap">
                <Badge
                  colorScheme={qtypeScheme[d.questionType] ?? "gray"}
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {qtypeLabel[d.questionType] ?? d.questionType}
                </Badge>
                <Badge
                  colorScheme={difficultyScheme(d.difficultyLevel)}
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {d.difficultyLevel} (system)
                </Badge>
                {d.predefinedDifficulty &&
                  d.predefinedDifficulty !== d.difficultyLevel && (
                    <Badge
                      colorScheme={difficultyScheme(d.predefinedDifficulty)}
                      variant="outline"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {d.predefinedDifficulty} (tagged)
                    </Badge>
                  )}
              </Flex>

              {d.predefinedDifficulty &&
                d.predefinedDifficulty !== d.difficultyLevel && (
                  <Box
                    bg="orange.50"
                    border="1px solid"
                    borderColor="orange.200"
                    borderRadius="md"
                    p={3}
                    mb={4}
                  >
                    <Text fontSize="sm" color="orange.700">
                      Tagged: {d.predefinedDifficulty} — Performance:{" "}
                      {d.difficultyLevel}
                    </Text>
                  </Box>
                )}

              <Grid templateColumns="1fr 1fr" gap={4} mb={5}>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Course
                  </Text>
                  <Text fontWeight="medium">{d.course || "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Exam
                  </Text>
                  <Text fontWeight="medium">{d.examTitle || "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Section
                  </Text>
                  <Text fontWeight="medium">{d.section || "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Created
                  </Text>
                  <Text fontWeight="medium">{fmtDate(d.createdAt)}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Last Used
                  </Text>
                  <Text fontWeight="medium">{fmtDate(d.lastUsedDate)}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Usage Frequency
                  </Text>
                  <Text fontWeight="medium">
                    {d.usageFrequency ?? "—"} exam
                    {d.usageFrequency !== 1 ? "s" : ""}
                  </Text>
                </Box>
              </Grid>

              <Divider mb={4} />

              <Grid templateColumns="1fr 1fr" gap={4} mb={5}>
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
                    Correct
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="green.600">
                    {d.correctResponses ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Incorrect
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="red.500">
                    {d.incorrectResponses ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Correct Rate
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={correctRateColor(d.correctResponseRate ?? 0)}
                  >
                    {d.correctResponseRate != null
                      ? `${d.correctResponseRate}%`
                      : "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Avg Time Spent
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {fmtTime(d.averageTimeSpent)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Reliability Index
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {d.reliabilityIndex != null
                      ? d.reliabilityIndex.toFixed(2)
                      : "—"}
                  </Text>
                  {rel && (
                    <Text fontSize="xs" color={rel.color}>
                      {rel.text}
                    </Text>
                  )}
                </Box>
              </Grid>

              {d.flags?.length > 0 && (
                <>
                  <Divider mb={4} />
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={2}>
                      Quality Flags
                    </Text>
                    <FlagBadges flags={d.flags} />
                  </Box>
                </>
              )}
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// ─── Analytics Tab ────────────────────────────────────────────────────────────

const AnalyticsTab = ({ courseId, fallbackTrend }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = courseId ? { courseId } : {};
    getQuestionBankChartData(params)
      .then((res) => setChartData(res?.data ?? res))
      .catch(() => {
        // TODO: endpoint GET /v1/question-bank-v2/chart-data not yet live — using mock
        console.warn(
          "[QuestionBankUsage] /chart-data failed, falling back to mock",
        );
        setChartData({
          ...MOCK_CHART_DATA,
          usageTrend: fallbackTrend?.length
            ? fallbackTrend
            : MOCK_CHART_DATA.usageTrend,
        });
      })
      .finally(() => setLoading(false));
  }, [courseId, fallbackTrend]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="260px" borderRadius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  if (!chartData) return null;

  const dist = chartData.difficultyDistribution ?? {};
  const scatter = chartData.scatterData ?? [];
  const trend = chartData.usageTrend ?? [];

  const distData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        label: "Questions",
        data: [dist.easy ?? 0, dist.medium ?? 0, dist.hard ?? 0],
        backgroundColor: [
          "rgba(72,187,120,0.75)",
          "rgba(237,137,54,0.75)",
          "rgba(229,62,62,0.75)",
        ],
        borderRadius: 4,
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: "Questions",
        data: scatter.map((p) => ({
          x: p.avgTime,
          y: p.correctRate,
          id: p.questionId,
        })),
        backgroundColor: "rgba(66,153,225,0.6)",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const trendData = {
    labels: trend.map((t) => dayjs(`${t.month}-01`).format("MMM YYYY")),
    datasets: [
      {
        label: "Usage Count",
        data: trend.map((t) => t.usageCount),
        borderColor: "rgba(66,153,225,1)",
        backgroundColor: "rgba(66,153,225,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const baseOptions = (titleText) => ({
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: titleText,
        font: { size: 14, weight: "600" },
      },
    },
  });

  return (
    <Box mt={6}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        {/* Chart 1 – Difficulty Distribution */}
        <Box bg="white" borderRadius="lg" boxShadow="sm" p={5}>
          <Bar
            data={distData}
            options={{
              ...baseOptions("Difficulty Distribution"),
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Question Count" },
                },
              },
            }}
          />
        </Box>

        {/* Chart 2 – Scatter: Correct Rate vs Avg Time */}
        <Box bg="white" borderRadius="lg" boxShadow="sm" p={5}>
          <Scatter
            data={scatterData}
            options={{
              ...baseOptions("Correct Rate vs. Average Time"),
              scales: {
                x: { title: { display: true, text: "Avg Time (seconds)" } },
                y: {
                  title: { display: true, text: "Correct Rate (%)" },
                  min: 0,
                  max: 100,
                },
              },
              plugins: {
                ...baseOptions("Correct Rate vs. Average Time").plugins,
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      `ID: ${ctx.raw.id} — ${ctx.raw.y}% correct, ${ctx.raw.x}s`,
                  },
                },
              },
            }}
          />
        </Box>
      </SimpleGrid>

      {/* Chart 3 – Monthly Usage Trend */}
      <Box bg="white" borderRadius="lg" boxShadow="sm" p={5}>
        <Line
          data={trendData}
          options={{
            ...baseOptions("Monthly Usage Trend"),
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: "Usage Count" },
              },
              x: { title: { display: true, text: "Month" } },
            },
          }}
        />
      </Box>
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const SortIcon = ({ colKey, sort }) => {
  if (sort.key !== colKey) return null;
  return sort.dir === "asc" ? (
    <FaSortAmountUp style={{ display: "inline", marginLeft: 4 }} />
  ) : (
    <FaSortAmountDown style={{ display: "inline", marginLeft: 4 }} />
  );
};

const QuestionBankUsagePage = () => {
  const classes = useStyles();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dateError, setDateError] = useState("");

  const [kpi, setKpi] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tableLoading, setTableLoading] = useState(true);

  const [sort, setSort] = useState({ key: "", dir: "asc" });
  const [selectedQId, setSelectedQId] = useState(null);

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    adminGetCourseListing({ page: 1, limit: 200 })
      .then((res) => setCourses(res?.courses ?? []))
      .catch(() => {});
  }, []);

  const validateDates = useCallback((start, end) => {
    if ((start && !end) || (!start && end)) {
      setDateError("Please provide both a start and end date.");
      return false;
    }
    if (start && end && end < start) {
      setDateError("End date must be on or after the start date.");
      return false;
    }
    setDateError("");
    return true;
  }, []);

  const buildSummaryParams = useCallback((f) => {
    const p = {};
    if (f.courseId) p.courseId = f.courseId;
    return p;
  }, []);

  const buildTableParams = useCallback((f, p, l, s) => {
    const params = { page: p, limit: l };
    if (f.courseId) params.courseId = f.courseId;
    if (f.difficulty) params.difficulty = f.difficulty;
    if (f.questionType) params.questionType = f.questionType;
    if (f.startDate && f.endDate) {
      params.startDate = f.startDate;
      params.endDate = f.endDate;
    }
    if (s.key) {
      params.sortBy = s.key;
      params.sortDir = s.dir;
    }
    return params;
  }, []);

  const fetchKpi = useCallback(
    (f) => {
      setKpiLoading(true);
      getQuestionBankSummary(buildSummaryParams(f))
        .then((res) => setKpi(res?.data ?? res))
        .catch(() => {
          // TODO: endpoint GET /v1/question-bank-v2/summary not yet live — using mock
          console.warn(
            "[QuestionBankUsage] /summary failed, falling back to mock",
          );
          setKpi(MOCK_SUMMARY);
        })
        .finally(() => setKpiLoading(false));
    },
    [buildSummaryParams],
  );

  const fetchTable = useCallback(
    (f, p, l, s) => {
      if (!validateDates(f.startDate, f.endDate)) return;
      setTableLoading(true);
      getQuestionBankList(buildTableParams(f, p, l, s))
        .then((res) => {
          const d = res?.data ?? res;
          setQuestions(d?.questions ?? []);
          setTotal(d?.total ?? 0);
        })
        .catch(() => {
          // TODO: endpoint GET /v1/question-bank-v2/questions not yet live — using mock
          console.warn(
            "[QuestionBankUsage] /questions failed, falling back to mock",
          );
          setQuestions(MOCK_QUESTIONS);
          setTotal(MOCK_QUESTIONS.length);
        })
        .finally(() => setTableLoading(false));
    },
    [validateDates, buildTableParams],
  );

  // Initial load
  useEffect(() => {
    fetchKpi(filters);
    fetchTable(filters, page, limit, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAll = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchKpi(newFilters);
    fetchTable(newFilters, 1, limit, sort);
  };

  const applyTableOnly = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchTable(newFilters, 1, limit, sort);
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    if (key === "courseId") {
      applyAll(updated);
      return;
    }
    if (key === "startDate" || key === "endDate") {
      const { startDate, endDate } = updated;
      if ((startDate && endDate) || (!startDate && !endDate)) {
        applyTableOnly(updated);
      } else {
        setFilters(updated);
        validateDates(updated.startDate, updated.endDate);
      }
      return;
    }
    applyTableOnly(updated);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setDateError("");
    setPage(1);
    setSort({ key: "", dir: "asc" });
    fetchKpi(DEFAULT_FILTERS);
    fetchTable(DEFAULT_FILTERS, 1, limit, { key: "", dir: "asc" });
  };

  const handleSort = (key) => {
    const newSort =
      sort.key === key
        ? { key, dir: sort.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" };
    setSort(newSort);
    fetchTable(filters, page, limit, newSort);
  };

  const handlePage = (p) => {
    setPage(p);
    fetchTable(filters, p, limit, sort);
  };
  const handleLimit = (l) => {
    setLimit(l);
    setPage(1);
    fetchTable(filters, 1, l, sort);
  };

  const handleRowClick = (qId) => {
    setSelectedQId(qId);
    onOpen();
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasFilters = Object.values(filters).some(Boolean);

  const SortTh = ({ col, children, isNumeric }) => (
    <Th
      isNumeric={isNumeric}
      cursor="pointer"
      onClick={() => handleSort(col)}
      _hover={{ color: "blue.600" }}
      userSelect="none"
    >
      {children} <SortIcon colKey={col} sort={sort} />
    </Th>
  );

  const correctRateKpiColor =
    kpi?.overallCorrectRate < 30
      ? "red"
      : kpi?.overallCorrectRate < 50
        ? "orange"
        : undefined;

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
              <Link href="/admin/report/question-bank-usage">
                Question Bank Usage
              </Link>
            </BreadcrumbItem>
          }
        />
        {hasFilters && (
          <Button secondary onClick={clearFilters} leftIcon={<FiX />}>
            Clear Filters
          </Button>
        )}
      </Flex>

      <Heading level="2" mb={2}>
        Question Bank Usage Analytics
      </Heading>
      <Text color="gray.500" mb={6}>
        Track question performance, difficulty, reliability, and reuse patterns
        across all exams.
      </Text>

      {/* ── Filter Bar ── */}
      <Box bg="white" borderRadius="lg" p={4} mb={6} boxShadow="sm">
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(5, 1fr)",
          }}
          gap={3}
        >
          <FormControl>
            <FormLabel fontSize="xs">Course</FormLabel>
            <Select
              size="sm"
              placeholder="All Courses"
              value={filters.courseId}
              onChange={(e) => handleFilterChange("courseId", e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.courseId || c.id} value={c.courseId || c.id}>
                  {c.courseTitle || c.title || c.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Difficulty</FormLabel>
            <Select
              size="sm"
              placeholder="All"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Question Type</FormLabel>
            <Select
              size="sm"
              placeholder="All Types"
              value={filters.questionType}
              onChange={(e) =>
                handleFilterChange("questionType", e.target.value)
              }
            >
              <option value="mcq">Multiple Choice</option>
              <option value="essay">Essay</option>
              <option value="true_false">True / False</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="matching">Matching</option>
              <option value="short_answer">Short Answer</option>
            </Select>
          </FormControl>

          <FormControl isInvalid={!!dateError}>
            <FormLabel fontSize="xs">Start Date</FormLabel>
            <Input
              size="sm"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </FormControl>

          <FormControl isInvalid={!!dateError}>
            <FormLabel fontSize="xs">End Date</FormLabel>
            <Input
              size="sm"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </FormControl>
        </Grid>
        {dateError && (
          <Text color="red.500" fontSize="sm" mt={2}>
            {dateError}
          </Text>
        )}
      </Box>

      {/* ── KPI Bar ── */}
      {kpiLoading ? (
        <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4} mb={6}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} height="90px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4} mb={6}>
          <DashboardMetricCard
            label="Total Questions"
            value={kpi?.totalQuestions ?? "—"}
          />
          <DashboardMetricCard
            label="Easy"
            value={kpi?.difficultyDistribution?.Easy ?? "—"}
            color="green"
          />
          <DashboardMetricCard
            label="Medium"
            value={kpi?.difficultyDistribution?.Medium ?? "—"}
            color="orange"
          />
          <DashboardMetricCard
            label="Hard"
            value={kpi?.difficultyDistribution?.Hard ?? "—"}
            color="red"
          />
          <DashboardMetricCard
            label="Untagged"
            value={kpi?.difficultyDistribution?.untagged ?? "—"}
          />
          <DashboardMetricCard
            label="Overall Correct Rate"
            value={
              kpi?.overallCorrectRate != null
                ? `${kpi.overallCorrectRate}%`
                : "—"
            }
            color={correctRateKpiColor}
          />
          <DashboardMetricCard
            label="Total Attempts"
            value={kpi?.totalAttempts?.toLocaleString() ?? "—"}
          />
        </SimpleGrid>
      )}

      {/* ── Tabs ── */}
      <Box borderBottomWidth="1px" mb={6}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Question List" className={classes.tab} />
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
              Questions
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
            <Button
              size="sm"
              secondary
              onClick={() => fetchTable(filters, page, limit, sort)}
              leftIcon={<FiRefreshCw />}
            >
              Refresh
            </Button>
          </Flex>

          {tableLoading ? (
            <Box p={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="48px" mb={2} />
              ))}
            </Box>
          ) : questions.length === 0 ? (
            <Box p={10} textAlign="center">
              <Text color="gray.500">
                No questions found for the selected filters.
              </Text>
            </Box>
          ) : (
            <TableContainer>
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th minW="220px">Question</Th>
                    <Th>Type</Th>
                    <Th>Section</Th>
                    <Th>Course</Th>
                    <Th>Exam</Th>
                    <Th>Difficulty</Th>
                    <SortTh col="usageFrequency" isNumeric>
                      Usage
                    </SortTh>
                    <Th isNumeric>Attempts</Th>
                    <SortTh col="correctResponseRate" isNumeric>
                      Correct Rate
                    </SortTh>
                    <SortTh col="averageTimeSpent" isNumeric>
                      Avg Time
                    </SortTh>
                    <SortTh col="reliabilityIndex" isNumeric>
                      Reliability
                    </SortTh>
                    <SortTh col="lastUsedDate">Last Used</SortTh>
                    <Th>Flags</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {questions.map((q) => (
                    <Tr
                      key={q.questionId}
                      bg={rowBg(q.flags)}
                      _hover={{ bg: rowHoverBg(q.flags) }}
                      cursor="pointer"
                      onClick={() => handleRowClick(q.questionId)}
                    >
                      <Td maxW="220px">
                        <Tooltip
                          label={q.question}
                          placement="top"
                          hasArrow
                          openDelay={600}
                        >
                          <Text
                            color="blue.600"
                            fontWeight="medium"
                            noOfLines={2}
                            _hover={{ textDecoration: "underline" }}
                          >
                            {q.question?.length > 80
                              ? q.question.slice(0, 80) + "…"
                              : q.question}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={qtypeScheme[q.questionType] ?? "gray"}
                          borderRadius="full"
                          px={2}
                          fontSize="2xs"
                        >
                          {qtypeLabel[q.questionType] ?? q.questionType}
                        </Badge>
                      </Td>
                      <Td>
                        <Text noOfLines={1} maxW="120px" fontSize="sm">
                          {q.section || "—"}
                        </Text>
                      </Td>
                      <Td>
                        <Text noOfLines={1} maxW="120px" fontSize="sm">
                          {q.course || "—"}
                        </Text>
                      </Td>
                      <Td>
                        <Text noOfLines={1} maxW="120px" fontSize="sm">
                          {q.examTitle || "—"}
                        </Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={difficultyScheme(q.difficultyLevel)}
                          borderRadius="full"
                          px={2}
                        >
                          {q.difficultyLevel ?? "—"}
                        </Badge>
                      </Td>
                      <Td isNumeric>{q.usageFrequency ?? "—"}</Td>
                      <Td isNumeric>{q.totalAttempts ?? "—"}</Td>
                      <Td isNumeric>
                        <Text
                          fontWeight="medium"
                          color={correctRateColor(q.correctResponseRate ?? 0)}
                        >
                          {q.correctResponseRate != null
                            ? `${q.correctResponseRate}%`
                            : "—"}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        {q.averageTimeSpent != null
                          ? `${q.averageTimeSpent}s`
                          : "—"}
                      </Td>
                      <Td isNumeric>
                        <Text
                          fontWeight="medium"
                          color={
                            q.reliabilityIndex != null
                              ? reliabilityLabel(q.reliabilityIndex).color
                              : "gray.500"
                          }
                        >
                          {q.reliabilityIndex != null
                            ? q.reliabilityIndex.toFixed(2)
                            : "—"}
                        </Text>
                      </Td>
                      <Td>{fmtDate(q.lastUsedDate)}</Td>
                      <Td>
                        <FlagBadges flags={q.flags ?? []} />
                      </Td>
                    </Tr>
                  ))}
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
            />
          )}
        </Box>
      )}

      {tab === 1 && (
        <AnalyticsTab
          courseId={filters.courseId}
          fallbackTrend={kpi?.usageTrend}
        />
      )}

      <QuestionDetailDrawer
        questionId={selectedQId}
        isOpen={isOpen}
        onClose={onClose}
      />
    </AdminMainAreaWrapper>
  );
};

export const QuestionBankUsagePageRoute = (props) => (
  <Route {...props} component={QuestionBankUsagePage} />
);

export default QuestionBankUsagePage;
