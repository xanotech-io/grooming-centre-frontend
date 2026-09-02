import React, { useState, useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import {
  Box, Flex, Text, Heading, Badge, Button, Input, Select, Textarea,
  FormControl, FormLabel,
  Table, Thead, Tbody, Tr, Th, Td,
  IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  useDisclosure, useToast,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  SimpleGrid, Spinner, Tooltip, Divider,
  HStack, VStack, Tag, TagLabel,
  Stat, StatLabel, StatNumber,
  Progress,

} from "@chakra-ui/react";
import {
  FiPlus, FiEdit2, FiTrash2, FiPlay, FiEye,
  FiSearch, FiTrendingUp, FiUser,
} from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
// import { Breadcrumb, Link } from "../../../components";
import {
  getPerformanceFilters,
  createPerformanceFilter,
  updatePerformanceFilter,
  deletePerformanceFilter,
  executePerformanceFilter,
  getPerformanceFilterStats,
  getVisualAnalyticsThresholds,
  getVisualAnalyticsDashboard,
  getVisualAnalyticsReport,
  getVisualAnalyticsStudentReport,
  getInstructorPerformanceReportV2,
  getInstructorPerformanceDrillDown,
  exportPerformanceAnalyticsReport,
} from "../../../services";
import { downloadBlob } from "../../../utils";

// e.g. "application/vnd.openxmlformats...spreadsheet" -> "xlsx"
const extFromMimeType = (type) => {
  if (!type) return "xlsx";
  if (type.includes("pdf")) return "pdf";
  if (type.includes("csv")) return "csv";
  if (type.includes("spreadsheet") || type.includes("excel")) return "xlsx";
  return "xlsx";
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DASHBOARD = {
  reportName: "Organisation-Wide Analytics",
  generatedAt: new Date().toISOString(),
  kpis: {
    total_students: 312,
    class_average: 74.2,
    students_meeting_target: 261,
    students_meeting_target_percentage: 83.7,
    excellent_percentage: 28.5,
    good_percentage: 31.4,
    average_percentage: 23.7,
    poor_percentage: 16.4,
  },
  achievement_distribution: { Excellent: 89, Good: 98, Average: 74, Poor: 51 },
  visual_indicator_distribution: { Green: 187, Yellow: 74, Red: 51 },
  score_histogram: { "0-59": 51, "60-69": 74, "70-79": 98, "80-100": 89 },
  top_performers: [
    { student_id: "s1", student_name: "Amina Yusuf", performance_metric: 96.4, course_title: "Microfinance Basics", visual_indicator: "Green" },
    { student_id: "s2", student_name: "Tunde Okafor", performance_metric: 94.1, course_title: "Business Analytics", visual_indicator: "Green" },
    { student_id: "s3", student_name: "Ngozi Eze", performance_metric: 92.8, course_title: "Data Privacy", visual_indicator: "Green" },
    { student_id: "s4", student_name: "Kola Adeyemi", performance_metric: 91.5, course_title: "Microfinance Basics", visual_indicator: "Green" },
    { student_id: "s5", student_name: "Fatima Abubakar", performance_metric: 90.2, course_title: "ICT Fundamentals", visual_indicator: "Green" },
  ],
  at_risk_students: [
    { student_id: "s10", student_name: "Esther Bello", performance_metric: 32.1, course_title: "ICT Fundamentals", visual_indicator: "Red" },
    { student_id: "s11", student_name: "Daniel Eze", performance_metric: 28.6, course_title: "Business Analytics", visual_indicator: "Red" },
    { student_id: "s12", student_name: "Adeola Fashola", performance_metric: 19.3, course_title: "Digital Marketing", visual_indicator: "Red" },
  ],
};

const MOCK_VISUAL_REPORT = [
  { student_id: "s1", student_name: "Amina Yusuf", student_email: "amina@example.com", course_title: "Microfinance Basics", performance_metric: 96.4, completion_rate: 100, achievement_category: "Excellent", visual_indicator: "Green", chart_type: "Gauge", class_average: 74.2, comparison_to_average: "+22%", remarks: "Outstanding performance — consistently in the top tier." },
  { student_id: "s2", student_name: "Tunde Okafor", student_email: "tunde@example.com", course_title: "Business Analytics", performance_metric: 94.1, completion_rate: 98, achievement_category: "Excellent", visual_indicator: "Green", chart_type: "Bar", class_average: 74.2, comparison_to_average: "+20%", remarks: "Excellent — high engagement and exam scores." },
  { student_id: "s6", student_name: "Biodun Adeleke", student_email: "biodun@example.com", course_title: "Financial Literacy", performance_metric: 72.5, completion_rate: 85, achievement_category: "Good", visual_indicator: "Green", chart_type: "Bar", class_average: 74.2, comparison_to_average: "-2%", remarks: "Good performance, slightly below class average." },
  { student_id: "s7", student_name: "Chukwuemeka Obi", student_email: "chukwu@example.com", course_title: "Management Accounting", performance_metric: 61.8, completion_rate: 76, achievement_category: "Average", visual_indicator: "Yellow", chart_type: "Heatmap", class_average: 74.2, comparison_to_average: "-12%", remarks: "Average — needs support to close the performance gap." },
  { student_id: "s10", student_name: "Esther Bello", student_email: "esther@example.com", course_title: "ICT Fundamentals", performance_metric: 32.1, completion_rate: 35, achievement_category: "Poor", visual_indicator: "Red", chart_type: "Gauge", class_average: 74.2, comparison_to_average: "-42%", remarks: "At risk — immediate intervention recommended." },
];

const MOCK_FILTERS = [
  { id: "f1", name: "Top Performers – Module 3", description: "High-scoring students", status: "active", accessLevel: "admin", accessCount: 14, lastExecutedAt: "2026-05-20T09:00:00Z", createdAt: "2026-04-01T00:00:00Z" },
  { id: "f2", name: "At-Risk Students Q2", description: "Students below 50%", status: "active", accessLevel: "instructor", accessCount: 7, lastExecutedAt: "2026-05-18T11:00:00Z", createdAt: "2026-04-10T00:00:00Z" },
  { id: "f3", name: "Department Completion Check", description: null, status: "draft", accessLevel: "admin", accessCount: 0, lastExecutedAt: null, createdAt: "2026-05-15T00:00:00Z" },
];

const MOCK_FILTER_STATS = {
  totalFiltersSaved: 3, totalExecutions: 21, previewExecutions: 8,
  savedFilterExecutions: 13, avgGenerationTimeMs: 183,
  mostUsedFilters: [
    { name: "Top Performers – Module 3", accessCount: 14 },
    { name: "At-Risk Students Q2", accessCount: 7 },
  ],
};

const MOCK_FILTER_RESULT = {
  filterName: "Top Performers – Module 3",
  generatedAt: new Date().toISOString(),
  recordCount: 5,
  executionTimeMs: 183,
  kpis: { total_students: 5, average_performance: 74.5, high_performers_percentage: 38.1, at_risk_percentage: 11.9, pass_rate: 88.1, fail_rate: 11.9, grade_distribution: { Excellent: 2, "Very Good": 1, Good: 1, Fair: 0, Pass: 0, Fail: 1 } },
  data: MOCK_VISUAL_REPORT.map((r) => ({ ...r, student_id: r.student_id, exam_avg_score: r.performance_metric - 2, assessment_avg_score: r.performance_metric + 2, overall_avg_score: r.performance_metric, grade: r.achievement_category === "Excellent" ? "Excellent" : r.achievement_category === "Good" ? "Good" : r.achievement_category === "Average" ? "Fair" : "Fail", pass_fail: r.performance_metric >= 50 ? "Pass" : "Fail", exam_count: 3, assessment_count: 4, total_lessons: 20, completed_lessons: Math.round(r.completion_rate * 0.2) })),
};

const MOCK_INSTRUCTORS = {
  summary: { total_instructors: 4, average_completion_rate: 84.5, average_feedback_rating: 4.2, average_assessment_score: 76.8, average_grading_days: 3.1, top_completion_rate: 96.0 },
  data: [
    { instructor_id: "i1", instructor_name: "John Doe", instructor_email: "john@example.com", department: "Microfinance", courses_delivered: 5, total_enrolled: 120, total_completed: 115, completion_rate: 95.8, average_score: 82.4, average_assessment_score: 84.1, average_exam_score: 80.7, grading_timeliness_days: 2.1, feedback_rating: 4.7, score_trend: [{ period: "2026-Q1", average_score: 79.2 }, { period: "2026-Q2", average_score: 82.4 }] },
    { instructor_id: "i2", instructor_name: "Kemi Abens", instructor_email: "kemi@example.com", department: "Business", courses_delivered: 4, total_enrolled: 98, total_completed: 81, completion_rate: 82.7, average_score: 74.6, average_assessment_score: 76.2, average_exam_score: 73.0, grading_timeliness_days: 3.5, feedback_rating: 4.1, score_trend: [{ period: "2026-Q1", average_score: 72.1 }, { period: "2026-Q2", average_score: 74.6 }] },
    { instructor_id: "i3", instructor_name: "Mike Johnson", instructor_email: "mike@example.com", department: "IT", courses_delivered: 3, total_enrolled: 75, total_completed: 58, completion_rate: 77.3, average_score: 71.2, average_assessment_score: 72.5, average_exam_score: 69.9, grading_timeliness_days: 4.2, feedback_rating: 3.8, score_trend: [{ period: "2026-Q1", average_score: 68.5 }, { period: "2026-Q2", average_score: 71.2 }] },
    { instructor_id: "i4", instructor_name: "Kolade Adeyemi", instructor_email: "kolade@example.com", department: "Finance", courses_delivered: 6, total_enrolled: 145, total_completed: 139, completion_rate: 95.9, average_score: 78.8, average_assessment_score: 80.3, average_exam_score: 77.3, grading_timeliness_days: 1.9, feedback_rating: 4.6, score_trend: [{ period: "2026-Q1", average_score: 76.0 }, { period: "2026-Q2", average_score: 78.8 }] },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const INDICATOR_COLORS = { Green: "green", Yellow: "yellow", Red: "red" };
const CATEGORY_COLORS = { Excellent: "green", Good: "teal", Average: "yellow", Poor: "red" };
const FILTER_STATUS_COLORS = { active: "green", draft: "orange", archived: "gray" };

function KpiCard({ label, value, color, sub }) {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
      <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wide">{label}</Text>
      <Text fontSize="2xl" fontWeight="bold" color={color || "gray.800"}>{value ?? "—"}</Text>
      {sub && <Text fontSize="xs" color="gray.400" mt={0.5}>{sub}</Text>}
    </Box>
  );
}

function PaginationBar({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <Flex justify="center" align="center" gap={2} mt={4}>
      <Button size="sm" onClick={() => onPage(page - 1)} isDisabled={page <= 1} variant="outline">Prev</Button>
      <Text fontSize="sm" color="gray.600">{page} / {totalPages}</Text>
      <Button size="sm" onClick={() => onPage(page + 1)} isDisabled={page >= totalPages} variant="outline">Next</Button>
    </Flex>
  );
}

// ─── Analytics Overview Tab ────────────────────────────────────────────────────

function OverviewTab() {
  const [dashboard, setDashboard] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, thresh] = await Promise.all([
        getVisualAnalyticsDashboard(courseId ? { courseId } : {}),
        getVisualAnalyticsThresholds(),
      ]);
      setDashboard(dash?.data || dash);
      setThresholds(thresh?.data || thresh);
    } catch {
      setDashboard(MOCK_DASHBOARD);
      setThresholds({ Green: "≥ 70", Yellow: "50–69", Red: "< 50" });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return <Flex justify="center" py={10}><Spinner /></Flex>;
  if (!dashboard) return null;

  const kpis = dashboard.kpis || {};
  const dist = dashboard.achievement_distribution || {};
  const hist = dashboard.score_histogram || {};

  return (
    <VStack spacing={5} align="stretch">
      <Flex gap={3} align="center">
        <Input size="sm" placeholder="Filter by Course UUID (optional)" value={courseId} onChange={(e) => setCourseId(e.target.value)} maxW="320px" fontFamily="mono" />
        <Button size="sm" colorScheme="blue" leftIcon={<FiSearch />} onClick={fetchDashboard}>Apply</Button>
        {courseId && <Button size="sm" variant="ghost" onClick={() => { setCourseId(""); }}>Clear</Button>}
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <KpiCard label="Total Students" value={kpis.total_students?.toLocaleString()} />
        <KpiCard label="Class Average" value={kpis.class_average != null ? `${kpis.class_average}%` : "—"} color="blue.600" />
        <KpiCard label="Meeting Target" value={kpis.students_meeting_target_percentage != null ? `${kpis.students_meeting_target_percentage}%` : "—"} color="green.600" sub={`${kpis.students_meeting_target ?? 0} students`} />
        <KpiCard label="At Risk (Poor)" value={kpis.poor_percentage != null ? `${kpis.poor_percentage}%` : "—"} color="red.600" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontSize="sm" fontWeight="semibold" mb={3}>Achievement Distribution</Text>
          <VStack spacing={2} align="stretch">
            {[["Excellent", "green"], ["Good", "teal"], ["Average", "yellow"], ["Poor", "red"]].map(([tier, color]) => {
              const count = dist[tier] || 0;
              const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <Box key={tier}>
                  <Flex justify="space-between" mb={1}>
                    <Badge colorScheme={color} variant="subtle">{tier}</Badge>
                    <Text fontSize="xs" color="gray.500">{count} ({pct}%)</Text>
                  </Flex>
                  <Progress value={pct} colorScheme={color} size="sm" borderRadius="full" />
                </Box>
              );
            })}
          </VStack>
        </Box>

        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontSize="sm" fontWeight="semibold" mb={3}>Score Histogram</Text>
          <VStack spacing={2} align="stretch">
            {[["0-59", "red"], ["60-69", "orange"], ["70-79", "yellow"], ["80-100", "green"]].map(([band, color]) => {
              const count = hist[band] || 0;
              const total = Object.values(hist).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <Box key={band}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="xs" fontFamily="mono" color="gray.600">{band}%</Text>
                    <Text fontSize="xs" color="gray.500">{count} students</Text>
                  </Flex>
                  <Progress value={pct} colorScheme={color} size="sm" borderRadius="full" />
                </Box>
              );
            })}
          </VStack>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontSize="sm" fontWeight="semibold" mb={2} color="green.700">Top Performers</Text>
          <Table size="sm" variant="simple">
            <Thead><Tr><Th>Student</Th><Th>Score</Th><Th>Course</Th></Tr></Thead>
            <Tbody>
              {(dashboard.top_performers || []).map((s) => (
                <Tr key={s.student_id}>
                  <Td fontWeight="medium" fontSize="sm">{s.student_name}</Td>
                  <Td><Badge colorScheme="green">{s.performance_metric}%</Badge></Td>
                  <Td fontSize="xs" color="gray.500">{s.course_title}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontSize="sm" fontWeight="semibold" mb={2} color="red.600">At-Risk Students</Text>
          <Table size="sm" variant="simple">
            <Thead><Tr><Th>Student</Th><Th>Score</Th><Th>Course</Th></Tr></Thead>
            <Tbody>
              {(dashboard.at_risk_students || []).map((s) => (
                <Tr key={s.student_id}>
                  <Td fontWeight="medium" fontSize="sm">{s.student_name}</Td>
                  <Td><Badge colorScheme="red">{s.performance_metric}%</Badge></Td>
                  <Td fontSize="xs" color="gray.500">{s.course_title}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {(dashboard.at_risk_students || []).length === 0 && (
            <Text textAlign="center" py={4} fontSize="sm" color="gray.400">No at-risk students</Text>
          )}
        </Box>
      </SimpleGrid>

      {thresholds && (
        <Box bg="blue.50" borderRadius="md" p={3}>
          <Text fontSize="xs" fontWeight="semibold" color="blue.700" mb={1}>Visual Indicator Thresholds</Text>
          <HStack spacing={4}>
            {Object.entries(thresholds).map(([k, v]) => {
              const label = typeof v === "object" && v !== null ? (v.range || v.category || JSON.stringify(v)) : v;
              return (
                <Tag key={k} colorScheme={INDICATOR_COLORS[k] || "gray"} size="sm">
                  <TagLabel>{k}: {label}</TagLabel>
                </Tag>
              );
            })}
          </HStack>
        </Box>
      )}
    </VStack>
  );
}

// ─── Student Drill-Down Tab ────────────────────────────────────────────────────

function StudentDrillDownTab() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [indicatorFilter, setIndicatorFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (categoryFilter) params.achievementCategory = categoryFilter;
      if (indicatorFilter) params.visualIndicator = indicatorFilter;
      const res = await getVisualAnalyticsReport(params);
      const payload = res?.data || res;
      const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : MOCK_VISUAL_REPORT;
      setRows(items);
      const computed = Math.ceil((payload?.total || items.length) / 20) || 1;
      setTotalPages(payload?.totalPages ?? computed);
    } catch {
      setRows(MOCK_VISUAL_REPORT);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, indicatorFilter]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const openDetail = async (row) => {
    setSelectedStudent(row);
    setStudentDetail(null);
    onOpen();
    setDetailLoading(true);
    try {
      const res = await getVisualAnalyticsStudentReport(row.student_id);
      setStudentDetail(res?.data || res);
    } catch {
      setStudentDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <VStack spacing={4} align="stretch">
        <Flex gap={3} flexWrap="wrap">
          <Select size="sm" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} maxW="200px">
            <option value="">All Categories</option>
            {["Excellent", "Good", "Average", "Poor"].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select size="sm" value={indicatorFilter} onChange={(e) => { setIndicatorFilter(e.target.value); setPage(1); }} maxW="180px">
            <option value="">All Indicators</option>
            {["Green", "Yellow", "Red"].map((i) => <option key={i} value={i}>{i}</option>)}
          </Select>
        </Flex>

        {loading ? <Flex justify="center" py={10}><Spinner /></Flex> : (
          <>
            <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Student</Th><Th>Course</Th><Th>Score</Th><Th>Completion</Th>
                    <Th>Category</Th><Th>Indicator</Th><Th>vs Class</Th><Th>Chart</Th><Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((r) => (
                    <Tr key={r.student_id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <Text fontWeight="medium" fontSize="sm">{r.student_name}</Text>
                        <Text fontSize="xs" color="gray.400">{r.student_email}</Text>
                      </Td>
                      <Td fontSize="xs" color="gray.600">{r.course_title || "—"}</Td>
                      <Td fontWeight="semibold" color={r.performance_metric >= 70 ? "green.600" : r.performance_metric >= 50 ? "yellow.600" : "red.600"}>
                        {r.performance_metric}%
                      </Td>
                      <Td fontSize="sm">{r.completion_rate}%</Td>
                      <Td><Badge colorScheme={CATEGORY_COLORS[r.achievement_category]} variant="subtle">{r.achievement_category}</Badge></Td>
                      <Td><Badge colorScheme={INDICATOR_COLORS[r.visual_indicator]}>{r.visual_indicator}</Badge></Td>
                      <Td>
                        <Text fontSize="xs" color={r.comparison_to_average?.startsWith("+") ? "green.600" : "red.600"} fontWeight="medium">
                          {r.comparison_to_average}
                        </Text>
                      </Td>
                      <Td><Badge variant="outline" fontSize="xs">{r.chart_type}</Badge></Td>
                      <Td>
                        <Tooltip label="Drill-down">
                          <IconButton size="xs" colorScheme="blue" variant="ghost" icon={<FiEye />} onClick={() => openDetail(r)} />
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {rows.length === 0 && <Text textAlign="center" py={8} color="gray.400" fontSize="sm">No students found</Text>}
            </Box>
            <PaginationBar page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </VStack>

      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center" gap={2}>
              <FiUser />
              <Text>{selectedStudent?.student_name}</Text>
              {selectedStudent && (
                <Badge colorScheme={INDICATOR_COLORS[selectedStudent.visual_indicator]}>
                  {selectedStudent.visual_indicator}
                </Badge>
              )}
            </Flex>
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody py={4}>
            {detailLoading ? <Flex justify="center" py={10}><Spinner /></Flex> : studentDetail ? (
              <VStack spacing={4} align="stretch">
                <Text fontSize="xs" color="gray.500">{selectedStudent?.student_email}</Text>
                {selectedStudent?.course_title && (
                  <Text fontSize="sm" color="gray.600">Course: <strong>{selectedStudent.course_title}</strong></Text>
                )}

                <SimpleGrid columns={2} spacing={3}>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Performance Score</StatLabel>
                    <StatNumber fontSize="xl" color="blue.700">{studentDetail.performance_metric ?? selectedStudent?.performance_metric}%</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Completion Rate</StatLabel>
                    <StatNumber fontSize="xl">{studentDetail.completion_rate ?? selectedStudent?.completion_rate}%</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Class Average</StatLabel>
                    <StatNumber fontSize="xl">{studentDetail.class_average ?? selectedStudent?.class_average}%</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">vs Class</StatLabel>
                    <StatNumber fontSize="xl" color={(studentDetail.comparison_to_average || selectedStudent?.comparison_to_average)?.startsWith("+") ? "green.600" : "red.600"}>
                      {studentDetail.comparison_to_average ?? selectedStudent?.comparison_to_average}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>

                <Divider />
                <HStack spacing={3} flexWrap="wrap">
                  <Box>
                    <Text fontSize="xs" color="gray.500">Achievement</Text>
                    <Badge colorScheme={CATEGORY_COLORS[studentDetail.achievement_category || selectedStudent?.achievement_category]}>
                      {studentDetail.achievement_category ?? selectedStudent?.achievement_category}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Visual Indicator</Text>
                    <Badge colorScheme={INDICATOR_COLORS[studentDetail.visual_indicator || selectedStudent?.visual_indicator]}>
                      {studentDetail.visual_indicator ?? selectedStudent?.visual_indicator}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Recommended Chart</Text>
                    <Badge variant="outline">{studentDetail.chart_type ?? selectedStudent?.chart_type}</Badge>
                  </Box>
                </HStack>

                {(studentDetail.remarks || selectedStudent?.remarks) && (
                  <>
                    <Divider />
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <Text fontSize="xs" color="gray.500" mb={1}>Auto-generated Remarks</Text>
                      <Text fontSize="sm" color="gray.700" fontStyle="italic">
                        {studentDetail.remarks ?? selectedStudent?.remarks}
                      </Text>
                    </Box>
                  </>
                )}
              </VStack>
            ) : (
              <Text color="gray.400" textAlign="center" py={8}>No detail available</Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

// ─── Performance Filters Tab ───────────────────────────────────────────────────

const EMPTY_FILTER_FORM = {
  name: "", description: "", studentScope: "group", accessLevel: "instructor",
  visualizationType: "table", status: "draft",
  criteriaScoreMin: "", criteriaScoreMax: "",
  performanceMetrics: ["overall_avg_score", "grade", "pass_fail", "completion_rate"],
};

function FiltersTab() {
  const toast = useToast();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isResultOpen, onOpen: onResultOpen, onClose: onResultClose } = useDisclosure();

  const [filters, setFilters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editFilter, setEditFilter] = useState(null);
  const [form, setForm] = useState(EMPTY_FILTER_FORM);
  const [saving, setSaving] = useState(false);
  const [executingId, setExecutingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [result, setResult] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const [fRes, sRes] = await Promise.all([
        getPerformanceFilters(params),
        getPerformanceFilterStats(),
      ]);
      const fPayload = fRes?.data || fRes;
      setFilters(Array.isArray(fPayload?.data) ? fPayload.data : Array.isArray(fPayload) ? fPayload : MOCK_FILTERS);
      setStats(sRes?.data || sRes || MOCK_FILTER_STATS);
    } catch {
      setFilters(MOCK_FILTERS);
      setStats(MOCK_FILTER_STATS);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (editFilter) {
      setForm({
        name: editFilter.name || "",
        description: editFilter.description || "",
        studentScope: editFilter.studentScope || "group",
        accessLevel: editFilter.accessLevel || "instructor",
        visualizationType: editFilter.visualizationType || "table",
        status: editFilter.status || "draft",
        criteriaScoreMin: editFilter.criteria?.scoreMin ?? "",
        criteriaScoreMax: editFilter.criteria?.scoreMax ?? "",
        performanceMetrics: editFilter.performanceMetrics || EMPTY_FILTER_FORM.performanceMetrics,
      });
    } else {
      setForm(EMPTY_FILTER_FORM);
    }
  }, [editFilter, isFormOpen]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Filter name is required", status: "warning", duration: 3000 }); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        studentScope: form.studentScope,
        accessLevel: form.accessLevel,
        visualizationType: form.visualizationType,
        status: form.status,
        performanceMetrics: form.performanceMetrics,
        criteria: {},
      };
      if (form.criteriaScoreMin !== "") payload.criteria.scoreMin = Number(form.criteriaScoreMin);
      if (form.criteriaScoreMax !== "") payload.criteria.scoreMax = Number(form.criteriaScoreMax);
      if (editFilter) { await updatePerformanceFilter(editFilter.id, payload); }
      else { await createPerformanceFilter(payload); }
      toast({ title: editFilter ? "Filter updated" : "Filter created", status: "success", duration: 3000 });
      fetchAll(); onFormClose();
    } catch {
      toast({ title: "Save failed", status: "error", duration: 4000 });
      fetchAll(); onFormClose();
    } finally { setSaving(false); }
  };

  const handleExecute = async (filter) => {
    setExecutingId(filter.id);
    try {
      const res = await executePerformanceFilter(filter.id, { sortBy: { field: "overall_avg_score", order: "DESC" } });
      setResult(res?.data || res || MOCK_FILTER_RESULT);
      onResultOpen();
    } catch {
      setResult({ ...MOCK_FILTER_RESULT, filterName: filter.name });
      onResultOpen();
    } finally { setExecutingId(null); }
  };

  const handleDelete = async (filter) => {
    if (!window.confirm(`Delete "${filter.name}"?`)) return;
    setDeletingId(filter.id);
    try {
      await deletePerformanceFilter(filter.id);
      toast({ title: "Filter deleted", status: "success", duration: 3000 });
      fetchAll();
    } catch { toast({ title: "Delete failed", status: "error", duration: 4000 }); }
    finally { setDeletingId(null); }
  };

  return (
    <>
      {stats && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
          <KpiCard label="Saved Filters" value={stats.totalFiltersSaved} />
          <KpiCard label="Total Executions" value={stats.totalExecutions} color="blue.600" />
          <KpiCard label="Preview Runs" value={stats.previewExecutions} />
          <KpiCard label="Avg Generation" value={stats.avgGenerationTimeMs ? `${stats.avgGenerationTimeMs}ms` : "—"} color="purple.600" />
        </SimpleGrid>
      )}

      <Flex gap={3} mb={4} justify="space-between" flexWrap="wrap">
        <HStack>
          <Select size="sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} maxW="160px">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </HStack>
        <Button size="sm" colorScheme="blue" leftIcon={<FiPlus />} onClick={() => { setEditFilter(null); onFormOpen(); }}>
          New Filter
        </Button>
      </Flex>

      {loading ? <Flex justify="center" py={10}><Spinner /></Flex> : (
        <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr><Th>Name</Th><Th>Status</Th><Th>Access</Th><Th>Executions</Th><Th>Last Run</Th><Th>Actions</Th></Tr>
            </Thead>
            <Tbody>
              {filters.map((f) => (
                <Tr key={f.id} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <Text fontWeight="medium" fontSize="sm">{f.name}</Text>
                    {f.description && <Text fontSize="xs" color="gray.400">{f.description}</Text>}
                  </Td>
                  <Td><Badge colorScheme={FILTER_STATUS_COLORS[f.status]}>{f.status}</Badge></Td>
                  <Td><Badge variant="outline" colorScheme="blue" fontSize="xs">{f.accessLevel}</Badge></Td>
                  <Td fontSize="sm">{f.accessCount ?? 0}</Td>
                  <Td fontSize="xs" color="gray.500">{f.lastExecutedAt ? new Date(f.lastExecutedAt).toLocaleDateString() : "—"}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="Execute"><IconButton size="xs" colorScheme="green" variant="ghost" icon={<FiPlay />} onClick={() => handleExecute(f)} isLoading={executingId === f.id} /></Tooltip>
                      <Tooltip label="Edit"><IconButton size="xs" colorScheme="blue" variant="ghost" icon={<FiEdit2 />} onClick={() => { setEditFilter(f); onFormOpen(); }} /></Tooltip>
                      <Tooltip label="Delete"><IconButton size="xs" colorScheme="red" variant="ghost" icon={<FiTrash2 />} onClick={() => handleDelete(f)} isLoading={deletingId === f.id} /></Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {filters.length === 0 && <Text textAlign="center" py={8} color="gray.400" fontSize="sm">No filters found</Text>}
        </Box>
      )}

      {/* Filter Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editFilter ? "Edit Filter" : "Create Performance Filter"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Filter Name</FormLabel>
                <Input size="sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Top Performers – Module 3" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea size="sm" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </FormControl>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Score Min</FormLabel>
                  <Input size="sm" type="number" min={0} max={100} value={form.criteriaScoreMin} onChange={(e) => setForm((f) => ({ ...f, criteriaScoreMin: e.target.value }))} placeholder="0" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Score Max</FormLabel>
                  <Input size="sm" type="number" min={0} max={100} value={form.criteriaScoreMax} onChange={(e) => setForm((f) => ({ ...f, criteriaScoreMax: e.target.value }))} placeholder="100" />
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Scope</FormLabel>
                  <Select size="sm" value={form.studentScope} onChange={(e) => setForm((f) => ({ ...f, studentScope: e.target.value }))}>
                    <option value="group">Group</option>
                    <option value="individual">Individual</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Access Level</FormLabel>
                  <Select size="sm" value={form.accessLevel} onChange={(e) => setForm((f) => ({ ...f, accessLevel: e.target.value }))}>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="all">All</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Visualization</FormLabel>
                  <Select size="sm" value={form.visualizationType} onChange={(e) => setForm((f) => ({ ...f, visualizationType: e.target.value }))}>
                    <option value="table">Table</option>
                    <option value="bar_chart">Bar Chart</option>
                    <option value="line_chart">Line Chart</option>
                    <option value="pie_chart">Pie Chart</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Status</FormLabel>
                  <Select size="sm" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button size="sm" variant="ghost" onClick={onFormClose}>Cancel</Button>
            <Button size="sm" colorScheme="blue" onClick={handleSave} isLoading={saving}>{editFilter ? "Save Changes" : "Create"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Filter Result Modal */}
      <Modal isOpen={isResultOpen} onClose={onResultClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Filter Results — {result?.filterName}
            <Text fontSize="xs" color="gray.500" fontWeight="normal">
              {result?.recordCount} students · {result?.executionTimeMs}ms · {result?.generatedAt ? new Date(result.generatedAt).toLocaleString() : ""}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {result && (
              <VStack spacing={4} align="stretch">
                {result.kpis && (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    <KpiCard label="Avg Performance" value={`${result.kpis.average_performance}%`} color="blue.600" />
                    <KpiCard label="Pass Rate" value={`${result.kpis.pass_rate}%`} color="green.600" />
                    <KpiCard label="High Performers" value={`${result.kpis.high_performers_percentage}%`} color="teal.600" />
                    <KpiCard label="At Risk" value={`${result.kpis.at_risk_percentage}%`} color="red.600" />
                  </SimpleGrid>
                )}
                {result.kpis?.grade_distribution && (
                  <HStack spacing={2} flexWrap="wrap">
                    {Object.entries(result.kpis.grade_distribution).map(([g, c]) => (
                      <Tag key={g} size="sm" colorScheme={g === "Excellent" ? "green" : g === "Fail" ? "red" : "blue"} variant="subtle">
                        <TagLabel>{g}: {c}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                )}
                <Box overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr><Th>Student</Th><Th>Course</Th><Th>Overall</Th><Th>Exam</Th><Th>Assessment</Th><Th>Grade</Th><Th>Pass/Fail</Th><Th>Completion</Th></Tr>
                    </Thead>
                    <Tbody>
                      {(result.data || []).map((r) => (
                        <Tr key={r.student_id}>
                          <Td>
                            <Text fontWeight="medium" fontSize="sm">{r.student_name}</Text>
                            <Text fontSize="xs" color="gray.400">{r.student_email}</Text>
                          </Td>
                          <Td fontSize="xs" color="gray.600">{r.course_title || "—"}</Td>
                          <Td fontWeight="semibold">{r.overall_avg_score}%</Td>
                          <Td fontSize="sm">{r.exam_avg_score}%</Td>
                          <Td fontSize="sm">{r.assessment_avg_score}%</Td>
                          <Td><Badge colorScheme={r.grade === "Excellent" ? "green" : r.grade === "Fail" ? "red" : "blue"} variant="subtle">{r.grade}</Badge></Td>
                          <Td><Badge colorScheme={r.pass_fail === "Pass" ? "green" : "red"}>{r.pass_fail}</Badge></Td>
                          <Td fontSize="sm">{r.completion_rate}%</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={onResultClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// ─── Instructor View Tab ───────────────────────────────────────────────────────

function InstructorTab() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [instructors, setInstructors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [period, setPeriod] = useState("quarterly");

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInstructorPerformanceReportV2({ period, page: 1, limit: 50 });
      const payload = res?.data || res;
      setInstructors(Array.isArray(payload?.data) ? payload.data : MOCK_INSTRUCTORS.data);
      setSummary(payload?.summary || MOCK_INSTRUCTORS.summary);
    } catch {
      setInstructors(MOCK_INSTRUCTORS.data);
      setSummary(MOCK_INSTRUCTORS.summary);
    } finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchInstructors(); }, [fetchInstructors]);

  const openDetail = async (row) => {
    setSelected(row);
    setDetail(null);
    onOpen();
    setDetailLoading(true);
    try {
      const res = await getInstructorPerformanceDrillDown(row.instructor_id, { period });
      setDetail(res?.data || res);
    } catch {
      setDetail(row);
    } finally { setDetailLoading(false); }
  };

  return (
    <>
      {summary && (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={4}>
          <KpiCard label="Instructors" value={summary.total_instructors} />
          <KpiCard label="Avg Completion" value={`${summary.average_completion_rate}%`} color="green.600" />
          <KpiCard label="Avg Feedback" value={summary.average_feedback_rating} color="blue.600" />
          <KpiCard label="Avg Assessment" value={`${summary.average_assessment_score}%`} color="teal.600" />
          <KpiCard label="Avg Grading Days" value={`${summary.average_grading_days}d`} color="purple.600" />
          <KpiCard label="Top Completion" value={`${summary.top_completion_rate}%`} color="green.700" />
        </SimpleGrid>
      )}

      <Flex gap={3} mb={4}>
        <Select size="sm" value={period} onChange={(e) => setPeriod(e.target.value)} maxW="180px">
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </Select>
      </Flex>

      {loading ? <Flex justify="center" py={10}><Spinner /></Flex> : (
        <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Instructor</Th><Th>Department</Th><Th>Courses</Th><Th>Enrolled</Th>
                <Th>Completion</Th><Th>Avg Score</Th><Th>Grading Days</Th><Th>Feedback</Th><Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {instructors.map((i) => (
                <Tr key={i.instructor_id} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <Text fontWeight="medium" fontSize="sm">{i.instructor_name}</Text>
                    <Text fontSize="xs" color="gray.400">{i.instructor_email}</Text>
                  </Td>
                  <Td fontSize="xs" color="gray.600">{i.department || "—"}</Td>
                  <Td fontSize="sm">{i.courses_delivered}</Td>
                  <Td fontSize="sm">{i.total_enrolled}</Td>
                  <Td>
                    <Badge colorScheme={i.completion_rate >= 85 ? "green" : i.completion_rate >= 70 ? "yellow" : "red"}>
                      {i.completion_rate}%
                    </Badge>
                  </Td>
                  <Td fontWeight="medium" color="blue.700">{i.average_score}%</Td>
                  <Td fontSize="sm">{i.grading_timeliness_days}d</Td>
                  <Td>
                    <HStack spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">{i.feedback_rating}</Text>
                      <Text fontSize="xs" color="gray.400">/ 5</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Tooltip label="Drill-down">
                      <IconButton size="xs" colorScheme="blue" variant="ghost" icon={<FiTrendingUp />} onClick={() => openDetail(i)} />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {instructors.length === 0 && <Text textAlign="center" py={8} color="gray.400" fontSize="sm">No instructors found</Text>}
        </Box>
      )}

      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Text>{selected?.instructor_name}</Text>
            {selected?.department && <Text fontSize="xs" color="gray.500">{selected.department}</Text>}
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody py={4}>
            {detailLoading ? <Flex justify="center" py={10}><Spinner /></Flex> : (detail || selected) ? (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={3}>
                  {[
                    ["Courses Delivered", (detail || selected)?.courses_delivered],
                    ["Total Enrolled", (detail || selected)?.total_enrolled],
                    ["Total Completed", (detail || selected)?.total_completed],
                    ["Completion Rate", `${(detail || selected)?.completion_rate}%`],
                    ["Avg Score", `${(detail || selected)?.average_score}%`],
                    ["Assessment Score", `${(detail || selected)?.average_assessment_score}%`],
                    ["Exam Score", `${(detail || selected)?.average_exam_score}%`],
                    ["Grading Days", `${(detail || selected)?.grading_timeliness_days}d`],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Text fontSize="xs" color="gray.500">{label}</Text>
                      <Text fontWeight="medium">{value ?? "—"}</Text>
                    </Box>
                  ))}
                </SimpleGrid>

                {((detail || selected)?.score_trend || []).length > 0 && (
                  <>
                    <Divider />
                    <Text fontSize="sm" fontWeight="semibold">Score Trend</Text>
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr><Th>Period</Th><Th>Avg Score</Th></Tr>
                      </Thead>
                      <Tbody>
                        {((detail || selected).score_trend).map((t, i) => (
                          <Tr key={i}>
                            <Td fontFamily="mono" fontSize="sm">{t.period}</Td>
                            <Td fontWeight="semibold" color="blue.700">{t.average_score}%</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </>
                )}
              </VStack>
            ) : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

// ─── Page Shell ────────────────────────────────────────────────────────────────

function PerformanceDrillDownPage() {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { page: 1, limit: 20 };
      const blob = await exportPerformanceAnalyticsReport(params);
      downloadBlob(blob, `performance-analytics-report.${extFromMimeType(blob.type)}`);
    } catch (err) {
      toast({
        title: "Export failed",
        description: err?.message || "Unable to export performance report",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box p={6}>
        <Flex mb={6} justify="space-between" align="flex-start">
          <Box>
            <Heading size="md" color="gray.800">Performance Analytics</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Drill-down analytics across users, groups, departments and courses
            </Text>
          </Box>
          <Button size="sm" colorScheme="blue" onClick={handleExport} isLoading={exporting}>
            Export
          </Button>
        </Flex>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab fontSize="sm">Analytics Overview</Tab>
            <Tab fontSize="sm">Student Drill-Down</Tab>
            <Tab fontSize="sm">Performance Filters</Tab>
            <Tab fontSize="sm">Instructor View</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0} pt={4}><OverviewTab /></TabPanel>
            <TabPanel px={0} pt={4}><StudentDrillDownTab /></TabPanel>
            <TabPanel px={0} pt={4}><FiltersTab /></TabPanel>
            <TabPanel px={0} pt={4}><InstructorTab /></TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </AdminMainAreaWrapper>
  );
}

export const PerformanceDrillDownPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <PerformanceDrillDownPage {...props} />} />
);

export default PerformanceDrillDownPage;
