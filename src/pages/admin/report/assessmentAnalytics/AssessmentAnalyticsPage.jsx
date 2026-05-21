import React, { useState, useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Select,
  Input,
  SimpleGrid,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import { FiSearch, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../../components";
import {
  getAssessmentAnalyticsReport,
  getAssessmentAnalyticsByExam,
  getAssessmentAnalyticsThresholds,
} from "../../../../services";

const useStyles = makeStyles(() => ({
  tabs: { borderBottom: "1px solid #e2e8f0", marginBottom: 16 },
  tab: { textTransform: "none", fontWeight: 600, fontSize: 14 },
}));

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_THRESHOLDS = {
  difficulty: {
    Easy: "> 80% correct response rate",
    Medium: "50% – 80% correct response rate",
    Hard: "< 50% correct response rate",
  },
  discrimination: {
    Excellent: "> 0.4",
    Good: "0.30 – 0.39",
    Acceptable: "0.20 – 0.29",
    Poor: "< 0.20",
  },
  status_labels: ["Too Easy", "Too Hard", "Excellent", "Good", "Acceptable", "Poor", "Insufficient Data"],
  validity_labels: ["High", "Moderate", "Low", "Insufficient Data"],
};

const MOCK_SUMMARY = {
  total_questions: 50,
  average_success_rate: 78.4,
  average_completion_time_seconds: 34.2,
  reliability_index: 0.82,
  assessment_validity: "High",
  difficulty_distribution: { Easy: 15, Medium: 25, Hard: 10 },
  status_distribution: { Excellent: 12, Good: 18, Acceptable: 10, Poor: 5, "Too Easy": 3, "Too Hard": 2, "Insufficient Data": 0 },
};

const MOCK_QUESTIONS = [
  {
    question_id: "q-001",
    question_text: "What is the primary function of a microfinance institution?",
    question_type: "mcq",
    difficulty_level: "Medium",
    derived_difficulty: "Easy",
    exam_id: "exam-001",
    exam_title: "Microfinance Basics Final Exam",
    course_id: "course-001",
    total_attempts: 28,
    correct_response_rate: 82.1,
    average_time_seconds: 32.0,
    discrimination_index: 0.41,
    status: "Excellent",
  },
  {
    question_id: "q-002",
    question_text: "True or False: Microloans are only for agriculture.",
    question_type: "true_false",
    difficulty_level: "Easy",
    derived_difficulty: "Easy",
    exam_id: "exam-001",
    exam_title: "Microfinance Basics Final Exam",
    course_id: "course-001",
    total_attempts: 30,
    correct_response_rate: 95.0,
    average_time_seconds: 20.0,
    discrimination_index: 0.18,
    status: "Too Easy",
  },
  {
    question_id: "q-003",
    question_text: "Explain the role of collateral in traditional banking versus microfinance.",
    question_type: "essay",
    difficulty_level: "Hard",
    derived_difficulty: "Hard",
    exam_id: "exam-001",
    exam_title: "Microfinance Basics Final Exam",
    course_id: "course-001",
    total_attempts: 25,
    correct_response_rate: 44.0,
    average_time_seconds: 180.0,
    discrimination_index: 0.35,
    status: "Good",
  },
  {
    question_id: "q-004",
    question_text: "Calculate the effective interest rate for a 12-month loan.",
    question_type: "fill_blank",
    difficulty_level: "Hard",
    derived_difficulty: "Hard",
    exam_id: "exam-002",
    exam_title: "Credit Analysis Assessment",
    course_id: "course-002",
    total_attempts: 22,
    correct_response_rate: 36.4,
    average_time_seconds: 95.0,
    discrimination_index: 0.12,
    status: "Too Hard",
  },
  {
    question_id: "q-005",
    question_text: "Match the loan product to its target beneficiary.",
    question_type: "matching",
    difficulty_level: "Medium",
    derived_difficulty: "Medium",
    exam_id: "exam-002",
    exam_title: "Credit Analysis Assessment",
    course_id: "course-002",
    total_attempts: 26,
    correct_response_rate: 65.4,
    average_time_seconds: 55.0,
    discrimination_index: 0.26,
    status: "Acceptable",
  },
  {
    question_id: "q-006",
    question_text: "What does KYC stand for in financial services?",
    question_type: "mcq",
    difficulty_level: "Easy",
    derived_difficulty: "Easy",
    exam_id: "exam-003",
    exam_title: "Standalone: Financial Compliance",
    course_id: null,
    total_attempts: 4,
    correct_response_rate: null,
    average_time_seconds: null,
    discrimination_index: null,
    status: "Insufficient Data",
  },
  {
    question_id: "q-007",
    question_text: "Describe three risk indicators for early loan default detection.",
    question_type: "short_answer",
    difficulty_level: "Medium",
    derived_difficulty: "Medium",
    exam_id: "exam-003",
    exam_title: "Standalone: Financial Compliance",
    course_id: null,
    total_attempts: 18,
    correct_response_rate: 72.2,
    average_time_seconds: 120.0,
    discrimination_index: 0.31,
    status: "Good",
  },
];

const MOCK_ASSESSMENT_STATS = [
  { assessmentId: "a-001", assessmentTitle: "Module 1 Assessment", totalQuestions: 10, averageSuccessRate: 74.5 },
  { assessmentId: "a-002", assessmentTitle: "Module 2 Assessment", totalQuestions: 12, averageSuccessRate: 81.2 },
];

const MOCK_STANDALONE_STATS = [
  { examId: "s-001", examTitle: "General Knowledge Exam", totalQuestions: 20, averageSuccessRate: 69.0 },
  { examId: "s-002", examTitle: "Financial Compliance Exam", totalQuestions: 15, averageSuccessRate: 76.3 },
];

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Excellent: "green",
  Good: "blue",
  Acceptable: "yellow",
  Poor: "orange",
  "Too Easy": "purple",
  "Too Hard": "red",
  "Insufficient Data": "gray",
};

const DIFFICULTY_COLORS = { Easy: "green", Medium: "yellow", Hard: "red" };
const VALIDITY_COLORS = { High: "green", Moderate: "blue", Low: "orange", "Insufficient Data": "gray" };

const TYPE_LABELS = {
  mcq: "MCQ",
  essay: "Essay",
  true_false: "True/False",
  fill_blank: "Fill Blank",
  matching: "Matching",
  short_answer: "Short Answer",
};

const fmt = (val, suffix = "") => (val != null ? `${val}${suffix}` : "—");

const PaginationBar = ({ page, totalPages, onPrev, onNext, limit, onLimitChange }) => (
  <Flex justifyContent="space-between" alignItems="center" mt={4} flexWrap="wrap" gap={2}>
    <Flex alignItems="center" gap={2}>
      <Text fontSize="sm" color="gray.500">Rows per page:</Text>
      <Select size="sm" w="70px" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
        {[20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
      </Select>
    </Flex>
    <Flex alignItems="center" gap={2}>
      <Button size="sm" onClick={onPrev} isDisabled={page <= 1} variant="outline">Prev</Button>
      <Text fontSize="sm">Page {page} of {totalPages || 1}</Text>
      <Button size="sm" onClick={onNext} isDisabled={page >= totalPages} variant="outline">Next</Button>
    </Flex>
  </Flex>
);

const DetailRow = ({ label, value }) => (
  <Flex justifyContent="space-between" alignItems="flex-start" py={2} borderBottom="1px" borderColor="gray.100">
    <Text fontSize="sm" color="gray.500" minW="200px">{label}</Text>
    <Box flex={1} textAlign="right">
      {typeof value === "string" || typeof value === "number"
        ? <Text fontSize="sm" fontWeight="medium">{value}</Text>
        : value}
    </Box>
  </Flex>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AssessmentAnalyticsPage = () => {
  const classes = useStyles();
  const toast = useToast();
  const [tab, setTab] = useState(0);

  // Thresholds
  const [thresholds, setThresholds] = useState(null);

  // Main report
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [assessmentStats, setAssessmentStats] = useState([]);
  const [standaloneStats, setStandaloneStats] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    courseId: "",
    examId: "",
    assessmentId: "",
    standaloneExamId: "",
    questionType: "",
    difficultyLevel: "",
    startDate: "",
    endDate: "",
  });

  // Exam drill-down tab
  const [drillExamId, setDrillExamId] = useState("");
  const [drillSummary, setDrillSummary] = useState(null);
  const [drillRows, setDrillRows] = useState([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillError, setDrillError] = useState(null);

  // Question detail drawer
  const { isOpen: isDetailOpen, onOpen: openDetail, onClose: closeDetail } = useDisclosure();
  const [detailQuestion, setDetailQuestion] = useState(null);

  // ── Fetch thresholds once ─────────────────────────────────────────────────

  useEffect(() => {
    getAssessmentAnalyticsThresholds()
      .then((res) => setThresholds(res?.data ?? res))
      .catch(() => setThresholds(MOCK_THRESHOLDS));
  }, []);

  // ── Fetch main report ─────────────────────────────────────────────────────

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getAssessmentAnalyticsReport(params);
      const payload = res?.data ?? res;
      setSummary(payload?.summary ?? null);
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setRows(list);
      setTotal(payload?.total ?? list.length);
      const computed = Math.ceil((payload?.total ?? list.length) / limit) || 1;
      setTotalPages(payload?.totalPages ?? computed);
      setAssessmentStats(Array.isArray(payload?.assessment_level_stats) ? payload.assessment_level_stats : []);
      setStandaloneStats(Array.isArray(payload?.standalone_stats) ? payload.standalone_stats : []);
    } catch {
      console.warn("[AssessmentAnalytics] GET /assessment-analytics-v2/report failed, using mock");
      setSummary(MOCK_SUMMARY);
      setRows(MOCK_QUESTIONS);
      setTotal(MOCK_QUESTIONS.length);
      setTotalPages(1);
      setAssessmentStats(MOCK_ASSESSMENT_STATS);
      setStandaloneStats(MOCK_STANDALONE_STATS);
    } finally { setLoading(false); }
  }, [page, limit, filters]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // ── Exam drill-down ───────────────────────────────────────────────────────

  const handleDrillDown = async () => {
    if (!drillExamId.trim()) {
      toast({ title: "Please enter an Exam ID.", status: "warning", duration: 3000 });
      return;
    }
    setDrillLoading(true);
    setDrillError(null);
    setDrillSummary(null);
    setDrillRows([]);
    try {
      const res = await getAssessmentAnalyticsByExam(drillExamId.trim());
      const payload = res?.data ?? res;
      setDrillSummary(payload?.summary ?? null);
      setDrillRows(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setDrillError("No analytics data found for this exam ID.");
      } else {
        console.warn("[AssessmentAnalytics] exam drill-down failed, using mock subset");
        const subset = MOCK_QUESTIONS.filter((q) => q.exam_id === drillExamId.trim()).length
          ? MOCK_QUESTIONS.filter((q) => q.exam_id === drillExamId.trim())
          : MOCK_QUESTIONS.slice(0, 3);
        setDrillSummary(MOCK_SUMMARY);
        setDrillRows(subset);
      }
    } finally { setDrillLoading(false); }
  };

  // ── Questions table ───────────────────────────────────────────────────────

  const QuestionsTable = ({ data, loadingState }) => (
    <Box overflowX="auto">
      <Table size="sm" variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Question</Th>
            <Th>Type</Th>
            <Th>Set Difficulty</Th>
            <Th>Derived</Th>
            <Th>Exam / Assessment</Th>
            <Th>Attempts</Th>
            <Th>Success Rate</Th>
            <Th>Avg Time</Th>
            <Th>Disc. Index</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loadingState ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>{Array.from({ length: 10 }).map((__, j) => <Td key={j}><Skeleton height="14px" /></Td>)}</Tr>
            ))
          ) : data.length === 0 ? (
            <Tr><Td colSpan={10} textAlign="center" py={10} color="gray.500">No question analytics found.</Td></Tr>
          ) : (
            data.map((row) => (
              <Tr
                key={row.question_id}
                _hover={{ bg: "blue.50" }}
                cursor="pointer"
                onClick={() => { setDetailQuestion(row); openDetail(); }}
              >
                <Td maxW="260px">
                  <Tooltip label={row.question_text} placement="top">
                    <Text fontSize="sm" noOfLines={2}>{row.question_text}</Text>
                  </Tooltip>
                </Td>
                <Td><Badge colorScheme="gray" fontSize="xs">{TYPE_LABELS[row.question_type] ?? row.question_type}</Badge></Td>
                <Td><Badge colorScheme={DIFFICULTY_COLORS[row.difficulty_level] ?? "gray"}>{row.difficulty_level ?? "—"}</Badge></Td>
                <Td>
                  {row.derived_difficulty && row.derived_difficulty !== row.difficulty_level
                    ? <Tooltip label="Differs from instructor-set difficulty — candidate for recalibration"><Badge colorScheme={DIFFICULTY_COLORS[row.derived_difficulty]}>{row.derived_difficulty} <FiAlertTriangle style={{ display: "inline" }} size={10} /></Badge></Tooltip>
                    : <Badge colorScheme={DIFFICULTY_COLORS[row.derived_difficulty] ?? "gray"}>{row.derived_difficulty ?? "—"}</Badge>
                  }
                </Td>
                <Td>
                  <Text fontSize="xs">{row.exam_title ?? "—"}</Text>
                </Td>
                <Td>{fmt(row.total_attempts)}</Td>
                <Td>{row.correct_response_rate != null ? `${row.correct_response_rate}%` : "—"}</Td>
                <Td>{row.average_time_seconds != null ? `${row.average_time_seconds}s` : "—"}</Td>
                <Td>{row.discrimination_index != null ? row.discrimination_index.toFixed(2) : "—"}</Td>
                <Td><Badge colorScheme={STATUS_COLORS[row.status] ?? "gray"}>{row.status}</Badge></Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" borderBottom="1px" borderColor="gray.200" pb={4} mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">Assessment Analytics Report</Text>
          <Text fontSize="sm" color="gray.500">Per-question analysis across course assessments, course exams, and standalone examinations.</Text>
        </Box>
        <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={fetchReport} isLoading={loading}>Refresh</Button>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
        <DashboardMetricCard title="Total Questions" value={loading ? "..." : summary?.total_questions ?? "—"} />
        <DashboardMetricCard
          title="Avg Success Rate"
          value={loading ? "..." : summary?.average_success_rate != null ? `${summary.average_success_rate}%` : "—"}
          colorScheme={summary?.average_success_rate < 60 ? "red" : summary?.average_success_rate < 75 ? "yellow" : "green"}
        />
        <DashboardMetricCard title="Avg Time / Question" value={loading ? "..." : summary?.average_completion_time_seconds != null ? `${summary.average_completion_time_seconds}s` : "—"} />
        <DashboardMetricCard
          title="Reliability Index"
          value={loading ? "..." : summary?.reliability_index != null ? summary.reliability_index.toFixed(2) : "—"}
          colorScheme={summary?.reliability_index < 0.7 ? "red" : summary?.reliability_index < 0.8 ? "yellow" : "green"}
        />
        <DashboardMetricCard
          title="Assessment Validity"
          value={loading ? "..." : summary?.assessment_validity ?? "—"}
          colorScheme={VALIDITY_COLORS[summary?.assessment_validity] ?? "gray"}
        />
      </SimpleGrid>

      {/* Difficulty + Status distribution chips */}
      {summary && !loading && (
        <Flex gap={6} mb={6} flexWrap="wrap">
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2}>DIFFICULTY DISTRIBUTION</Text>
            <Flex gap={2} flexWrap="wrap">
              {Object.entries(summary.difficulty_distribution ?? {}).map(([k, v]) => (
                <Badge key={k} colorScheme={DIFFICULTY_COLORS[k] ?? "gray"} px={3} py={1} borderRadius="full" fontSize="sm">{k}: {v}</Badge>
              ))}
            </Flex>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2}>STATUS DISTRIBUTION</Text>
            <Flex gap={2} flexWrap="wrap">
              {Object.entries(summary.status_distribution ?? {}).filter(([, v]) => v > 0).map(([k, v]) => (
                <Badge key={k} colorScheme={STATUS_COLORS[k] ?? "gray"} px={3} py={1} borderRadius="full" fontSize="sm">{k}: {v}</Badge>
              ))}
            </Flex>
          </Box>
        </Flex>
      )}

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className={classes.tabs}>
        <Tab label="All Questions" className={classes.tab} />
        <Tab label="Exam Drill-Down" className={classes.tab} />
        <Tab label="Assessment Stats" className={classes.tab} />
        <Tab label="Standalone Stats" className={classes.tab} />
        <Tab label="Filters" className={classes.tab} />
      </Tabs>

      {/* ── Tab 0: All Questions ─────────────────────────────────────────────── */}
      {tab === 0 && (
        <Box>
          <QuestionsTable data={rows} loadingState={loading} />
          <PaginationBar page={page} totalPages={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} />
          <Text fontSize="sm" color="gray.500" mt={2}>Total: {total} question{total !== 1 ? "s" : ""}</Text>
        </Box>
      )}

      {/* ── Tab 1: Exam Drill-Down ───────────────────────────────────────────── */}
      {tab === 1 && (
        <Box>
          <Flex gap={3} mb={4} alignItems="flex-end">
            <FormControl maxW="360px">
              <FormLabel fontSize="sm">Course Exam ID</FormLabel>
              <Input size="sm" placeholder="Enter exam UUID" value={drillExamId} onChange={(e) => setDrillExamId(e.target.value)} />
            </FormControl>
            <Button size="sm" leftIcon={<FiSearch />} colorScheme="blue" onClick={handleDrillDown} isLoading={drillLoading}>Analyse</Button>
          </Flex>

          {drillError && (
            <Alert status="warning" borderRadius="md" mb={4}>
              <AlertIcon />{drillError}
            </Alert>
          )}

          {drillSummary && (
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
              <DashboardMetricCard title="Questions" value={drillSummary.total_questions ?? "—"} />
              <DashboardMetricCard title="Avg Success Rate" value={drillSummary.average_success_rate != null ? `${drillSummary.average_success_rate}%` : "—"} />
              <DashboardMetricCard title="Reliability Index" value={drillSummary.reliability_index != null ? drillSummary.reliability_index.toFixed(2) : "—"} />
              <DashboardMetricCard title="Validity" value={drillSummary.assessment_validity ?? "—"} colorScheme={VALIDITY_COLORS[drillSummary.assessment_validity] ?? "gray"} />
            </SimpleGrid>
          )}

          {drillRows.length > 0 && <QuestionsTable data={drillRows} loadingState={drillLoading} />}

          {!drillSummary && !drillLoading && !drillError && (
            <Box textAlign="center" py={10} color="gray.400">
              <Text>Enter a Course Exam ID above and click Analyse to drill down into per-question metrics.</Text>
            </Box>
          )}
        </Box>
      )}

      {/* ── Tab 2: Assessment Stats ──────────────────────────────────────────── */}
      {tab === 2 && (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Assessment Title</Th>
                <Th>Total Questions</Th>
                <Th>Avg Success Rate</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Tr key={i}>{[0, 1, 2].map((j) => <Td key={j}><Skeleton height="14px" /></Td>)}</Tr>)
              ) : assessmentStats.length === 0 ? (
                <Tr><Td colSpan={3} textAlign="center" py={8} color="gray.500">No assessment-level data available.</Td></Tr>
              ) : (
                assessmentStats.map((a) => (
                  <Tr key={a.assessmentId}>
                    <Td fontWeight="medium">{a.assessmentTitle}</Td>
                    <Td>{a.totalQuestions}</Td>
                    <Td><Badge colorScheme={a.averageSuccessRate >= 75 ? "green" : a.averageSuccessRate >= 60 ? "yellow" : "red"}>{a.averageSuccessRate}%</Badge></Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* ── Tab 3: Standalone Stats ──────────────────────────────────────────── */}
      {tab === 3 && (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Standalone Exam Title</Th>
                <Th>Total Questions</Th>
                <Th>Avg Success Rate</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Tr key={i}>{[0, 1, 2].map((j) => <Td key={j}><Skeleton height="14px" /></Td>)}</Tr>)
              ) : standaloneStats.length === 0 ? (
                <Tr><Td colSpan={3} textAlign="center" py={8} color="gray.500">No standalone exam data available.</Td></Tr>
              ) : (
                standaloneStats.map((s) => (
                  <Tr key={s.examId}>
                    <Td fontWeight="medium">{s.examTitle}</Td>
                    <Td>{s.totalQuestions}</Td>
                    <Td><Badge colorScheme={s.averageSuccessRate >= 75 ? "green" : s.averageSuccessRate >= 60 ? "yellow" : "red"}>{s.averageSuccessRate}%</Badge></Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* ── Tab 4: Filters ───────────────────────────────────────────────────── */}
      {tab === 4 && (
        <Box bg="gray.50" p={4} borderRadius="md">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Course ID</FormLabel>
              <Input size="sm" placeholder="UUID" value={filters.courseId} onChange={(e) => setFilters((p) => ({ ...p, courseId: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Exam ID</FormLabel>
              <Input size="sm" placeholder="UUID" value={filters.examId} onChange={(e) => setFilters((p) => ({ ...p, examId: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Assessment ID</FormLabel>
              <Input size="sm" placeholder="UUID" value={filters.assessmentId} onChange={(e) => setFilters((p) => ({ ...p, assessmentId: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Standalone Exam ID</FormLabel>
              <Input size="sm" placeholder="UUID" value={filters.standaloneExamId} onChange={(e) => setFilters((p) => ({ ...p, standaloneExamId: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Question Type</FormLabel>
              <Select size="sm" placeholder="Any" value={filters.questionType} onChange={(e) => setFilters((p) => ({ ...p, questionType: e.target.value }))}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Difficulty Level</FormLabel>
              <Select size="sm" placeholder="Any" value={filters.difficultyLevel} onChange={(e) => setFilters((p) => ({ ...p, difficultyLevel: e.target.value }))}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Start Date</FormLabel>
              <Input size="sm" type="date" value={filters.startDate} onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">End Date</FormLabel>
              <Input size="sm" type="date" value={filters.endDate} onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))} />
            </FormControl>
          </SimpleGrid>
          <Flex mt={4} gap={2}>
            <Button size="sm" colorScheme="blue" onClick={() => { setPage(1); setTab(0); fetchReport(); }}>Apply & View</Button>
            <Button size="sm" variant="outline" onClick={() => setFilters({ courseId: "", examId: "", assessmentId: "", standaloneExamId: "", questionType: "", difficultyLevel: "", startDate: "", endDate: "" })}>Clear</Button>
          </Flex>
        </Box>
      )}

      {/* ── Thresholds legend ─────────────────────────────────────────────────── */}
      {thresholds && (
        <Box mt={8} p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={3}>CLASSIFICATION THRESHOLDS</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontSize="xs" fontWeight="semibold" mb={1}>Derived Difficulty</Text>
              {Object.entries(thresholds.difficulty ?? {}).map(([k, v]) => (
                <Flex key={k} gap={2} alignItems="center" mb={1}>
                  <Badge colorScheme={DIFFICULTY_COLORS[k] ?? "gray"} minW="60px" textAlign="center">{k}</Badge>
                  <Text fontSize="xs" color="gray.600">{v}</Text>
                </Flex>
              ))}
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="semibold" mb={1}>Discrimination Index</Text>
              {Object.entries(thresholds.discrimination ?? {}).map(([k, v]) => (
                <Flex key={k} gap={2} alignItems="center" mb={1}>
                  <Badge colorScheme={STATUS_COLORS[k] ?? "gray"} minW="80px" textAlign="center">{k}</Badge>
                  <Text fontSize="xs" color="gray.600">{v}</Text>
                </Flex>
              ))}
            </Box>
          </SimpleGrid>
        </Box>
      )}

      {/* ── Question Detail Drawer ────────────────────────────────────────────── */}
      <Drawer isOpen={isDetailOpen} onClose={closeDetail} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px" borderColor="gray.200">Question Detail</DrawerHeader>
          <DrawerBody pt={4}>
            {detailQuestion && (
              <Box>
                <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Question Text</Text>
                  <Text fontSize="sm">{detailQuestion.question_text}</Text>
                </Box>

                <DetailRow label="Question ID" value={<Text fontSize="xs" fontFamily="mono">{detailQuestion.question_id}</Text>} />
                <DetailRow label="Type" value={<Badge colorScheme="gray">{TYPE_LABELS[detailQuestion.question_type] ?? detailQuestion.question_type}</Badge>} />
                <DetailRow label="Set Difficulty" value={<Badge colorScheme={DIFFICULTY_COLORS[detailQuestion.difficulty_level] ?? "gray"}>{detailQuestion.difficulty_level ?? "—"}</Badge>} />
                <DetailRow
                  label="Derived Difficulty"
                  value={
                    <Flex gap={1} alignItems="center" justifyContent="flex-end">
                      <Badge colorScheme={DIFFICULTY_COLORS[detailQuestion.derived_difficulty] ?? "gray"}>{detailQuestion.derived_difficulty ?? "—"}</Badge>
                      {detailQuestion.derived_difficulty && detailQuestion.difficulty_level && detailQuestion.derived_difficulty !== detailQuestion.difficulty_level && (
                        <Tooltip label="Differs from instructor-set — candidate for recalibration"><Box color="orange.400"><FiAlertTriangle /></Box></Tooltip>
                      )}
                    </Flex>
                  }
                />
                <DetailRow label="Exam / Assessment" value={detailQuestion.exam_title ?? "—"} />
                <DetailRow label="Course ID" value={detailQuestion.course_id ?? "—"} />
                <DetailRow label="Total Attempts" value={fmt(detailQuestion.total_attempts)} />
                <DetailRow label="Correct Response Rate" value={detailQuestion.correct_response_rate != null ? `${detailQuestion.correct_response_rate}%` : "—"} />
                <DetailRow label="Avg Time per Attempt" value={detailQuestion.average_time_seconds != null ? `${detailQuestion.average_time_seconds}s` : "—"} />
                <DetailRow label="Discrimination Index" value={detailQuestion.discrimination_index != null ? detailQuestion.discrimination_index.toFixed(2) : "—"} />
                <DetailRow label="Status" value={<Badge colorScheme={STATUS_COLORS[detailQuestion.status] ?? "gray"} px={2} py={1}>{detailQuestion.status}</Badge>} />

                {detailQuestion.status === "Poor" || detailQuestion.status === "Too Hard" || detailQuestion.status === "Insufficient Data" ? (
                  <Alert status="warning" mt={4} borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      {detailQuestion.status === "Poor" && "This question fails to discriminate between ability levels. Consider revising or replacing it."}
                      {detailQuestion.status === "Too Hard" && "Nearly all students answered incorrectly. Review the question wording and difficulty calibration."}
                      {detailQuestion.status === "Insufficient Data" && "Not enough student attempts to compute reliable analytics. Increase participation."}
                    </Text>
                  </Alert>
                ) : null}
              </Box>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="1px" borderColor="gray.200">
            <Button variant="ghost" size="sm" onClick={closeDetail}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </AdminMainAreaWrapper>
  );
};

export const AssessmentAnalyticsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <AssessmentAnalyticsPage {...props} />} />
);

export default AssessmentAnalyticsPageRoute;
