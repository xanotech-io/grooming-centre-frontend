import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Grid,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { FiRefreshCw, FiAlertTriangle, FiFilter } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../../components";
import {
  getAssessmentAnalyticsReport,
  getAssessmentAnalyticsThresholds,
  adminGetCourseListing,
  adminGetStandaloneExaminationListing,
} from "../../../../services";

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

// ─── EntityCombobox ─────────────────────────────────────────────────────────

function EntityCombobox({ fetchFn, value, onSelect, placeholder }) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedOption = useMemo(() => options.find((o) => o.id === value) ?? null, [options, value]);

  useEffect(() => { if (!value) setInputValue(""); }, [value]);

  const filtered = useMemo(() => {
    if (!inputValue || selectedOption) return options;
    const q = inputValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q) || (o.sublabel ?? "").toLowerCase().includes(q));
  }, [options, inputValue, selectedOption]);

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doFetch = useCallback(async (query) => {
    setLoading(true);
    try { setOptions(await fetchFn(query)); } catch { setOptions([]); } finally { setLoading(false); }
  }, [fetchFn]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (value) onSelect(null);
    setIsOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(val), 350);
  };

  const handleFocus = () => {
    if (!value) { setIsOpen(true); if (options.length === 0) doFetch(""); }
  };

  const displayValue = selectedOption
    ? `${selectedOption.label}${selectedOption.sublabel ? ` — ${selectedOption.sublabel}` : ""}`
    : value || inputValue;

  return (
    <Box ref={containerRef} position="relative">
      <Flex border="1px solid" borderColor="gray.200" borderRadius="md" alignItems="center" px={2} bg="white" h="32px">
        <Input
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          border="none"
          outline="none"
          _focus={{ boxShadow: "none" }}
          size="sm"
          px={0}
          fontSize="sm"
        />
        {loading && <Spinner size="xs" color="gray.400" flexShrink={0} />}
        {value && (
          <Text
            fontSize="xs"
            color="gray.400"
            cursor="pointer"
            flexShrink={0}
            onClick={() => { onSelect(null); setInputValue(""); setOptions([]); }}
            _hover={{ color: "gray.600" }}
          >✕</Text>
        )}
      </Flex>
      {isOpen && filtered.length > 0 && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          zIndex={10}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          shadow="lg"
          maxH="200px"
          overflowY="auto"
        >
          {filtered.map((opt) => (
            <Box
              key={opt.id}
              px={3}
              py={2}
              cursor="pointer"
              _hover={{ bg: "blue.50" }}
              onClick={() => { onSelect(opt); setInputValue(opt.label); setIsOpen(false); }}
            >
              <Text fontSize="sm">{opt.label}</Text>
              {opt.sublabel && <Text fontSize="xs" color="gray.500">{opt.sublabel}</Text>}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

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

  // Thresholds
  const [thresholds, setThresholds] = useState(null);

  // Main report
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [assessmentStats, setAssessmentStats] = useState([]);
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

  const [showFilters, setShowFilters] = useState(false);

  // Question detail drawer
  const { isOpen: isDetailOpen, onOpen: openDetail, onClose: closeDetail } = useDisclosure();
  const [detailQuestion, setDetailQuestion] = useState(null);

  // ── Combobox fetch helpers ────────────────────────────────────────────────

  const fetchCourseOptions = useCallback(async (query) => {
    const res = await adminGetCourseListing({ search: query, limit: 50 });
    return (res?.courses ?? []).map((c) => ({ id: c.id, label: c.title }));
  }, []);

  const fetchExamOptions = useCallback(async () => {
    const uniqueExams = [];
    const seen = new Set();
    rows.forEach((r) => {
      if (r.exam_id && r.exam_title && !seen.has(r.exam_id)) {
        seen.add(r.exam_id);
        uniqueExams.push({ id: r.exam_id, label: r.exam_title });
      }
    });
    return uniqueExams;
  }, [rows]);

  const fetchAssessmentOptions = useCallback(async () => {
    return assessmentStats.map((a) => ({ id: a.assessmentId, label: a.assessmentTitle }));
  }, [assessmentStats]);

  const fetchStandaloneOptions = useCallback(async (query) => {
    const res = await adminGetStandaloneExaminationListing({ search: query, limit: 50 });
    return (res?.examinations ?? []).map((e) => ({ id: e.id, label: e.title }));
  }, []);

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v).length;

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
    } catch {
      console.warn("[AssessmentAnalytics] GET /assessment-analytics-v2/report failed, using mock");
      setSummary(MOCK_SUMMARY);
      setRows(MOCK_QUESTIONS);
      setTotal(MOCK_QUESTIONS.length);
      setTotalPages(1);
      setAssessmentStats(MOCK_ASSESSMENT_STATS);
    } finally { setLoading(false); }
  }, [page, limit, filters]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // ── Questions table ───────────────────────────────────────────────────────

  const QuestionsTable = ({ data, loadingState }) => (
    <Box overflowX="auto" bg="white">
      <Table size="sm" variant="simple" bg="white">
        <Thead bg="white">
          <Tr>
            <Th>Question</Th>
            <Th>Type</Th>
            <Th>Difficulty</Th>
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
              <Tr key={i}>{Array.from({ length: 9 }).map((__, j) => <Td key={j}><Skeleton height="14px" /></Td>)}</Tr>
            ))
          ) : data.length === 0 ? (
            <Tr><Td colSpan={9} textAlign="center" py={10} color="gray.500">No question analytics found.</Td></Tr>
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

      {/* Filter toggle */}
      <Flex mb={3} alignItems="center">
        <Button
          size="sm"
          leftIcon={<FiFilter />}
          variant="outline"
          bg="white"
          colorScheme={activeFilterCount > 0 ? "blue" : "gray"}
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
      </Flex>

      {/* Filter panel */}
      {showFilters && (
        <Box bg="gray.50" border="1px" borderColor="gray.200" p={4} borderRadius="md" mb={4}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={3}>
            <FormControl>
              <FormLabel fontSize="xs">Course</FormLabel>
              <EntityCombobox
                fetchFn={fetchCourseOptions}
                value={filters.courseId}
                onSelect={(opt) => setFilters((p) => ({ ...p, courseId: opt ? opt.id : "" }))}
                placeholder="Search course..."
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Exam</FormLabel>
              <EntityCombobox
                fetchFn={fetchExamOptions}
                value={filters.examId}
                onSelect={(opt) => setFilters((p) => ({ ...p, examId: opt ? opt.id : "" }))}
                placeholder="Search exam..."
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Assessment</FormLabel>
              <EntityCombobox
                fetchFn={fetchAssessmentOptions}
                value={filters.assessmentId}
                onSelect={(opt) => setFilters((p) => ({ ...p, assessmentId: opt ? opt.id : "" }))}
                placeholder="Search assessment..."
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Standalone Exam</FormLabel>
              <EntityCombobox
                fetchFn={fetchStandaloneOptions}
                value={filters.standaloneExamId}
                onSelect={(opt) => setFilters((p) => ({ ...p, standaloneExamId: opt ? opt.id : "" }))}
                placeholder="Search standalone exam..."
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Question Type</FormLabel>
              <Select size="sm" placeholder="Any" value={filters.questionType} onChange={(e) => setFilters((p) => ({ ...p, questionType: e.target.value }))}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Difficulty Level</FormLabel>
              <Select size="sm" placeholder="Any" value={filters.difficultyLevel} onChange={(e) => setFilters((p) => ({ ...p, difficultyLevel: e.target.value }))}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Start Date</FormLabel>
              <Input size="sm" type="date" value={filters.startDate} onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">End Date</FormLabel>
              <Input size="sm" type="date" value={filters.endDate} onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))} />
            </FormControl>
          </Grid>
          <Flex mt={3} gap={2}>
            <Button size="sm" colorScheme="blue" onClick={() => { setPage(1); setShowFilters(false); fetchReport(); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" onClick={() => {
              setFilters({ courseId: "", examId: "", assessmentId: "", standaloneExamId: "", questionType: "", difficultyLevel: "", startDate: "", endDate: "" });
              setShowFilters(false);
            }}>Clear</Button>
          </Flex>
        </Box>
      )}

      {/* All Questions */}
      <Box>
        <QuestionsTable data={rows} loadingState={loading} />
        <PaginationBar page={page} totalPages={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} />
        <Text fontSize="sm" color="gray.500" mt={2}>Total: {total} question{total !== 1 ? "s" : ""}</Text>
      </Box>

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
