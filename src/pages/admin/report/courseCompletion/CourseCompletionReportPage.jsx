import { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  SimpleGrid,
  Badge,
  Progress,
  Select,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text as ChakraText,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  FiUsers,
  FiUserCheck,
  FiTrendingUp,
  FiUserX,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiBarChart2,
  FiAward,
  FiClock,
} from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Button, Heading, Spinner } from "../../../../components";
import {
  adminGetEnrollmentStatusStudents,
  adminGetEnrollmentStatusCourses,
  adminGetEnrollmentStatusTrends,
  adminListCoursesForReport,
  adminGetDepartmentListing,
  adminGetUserListing,
  getInstructorPerformanceReportV2,
  getInstructorPerformanceDrillDown,
} from "../../../../services";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const studentStatusColor = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "enrolled") return "green";
  if (v === "deactivated") return "red";
  return "gray";
};

const engagementColor = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "in progress") return "blue";
  if (v === "completed") return "green";
  if (v === "inactive") return "orange";
  return "gray";
};

const trendColor = (t) => {
  const v = String(t || "").toLowerCase();
  if (v === "growing") return "green";
  if (v === "declining") return "red";
  if (v === "stable") return "blue";
  return "gray";
};

const completionColor = (rate) => {
  if (rate == null) return "gray";
  if (rate >= 85) return "green";
  if (rate >= 70) return "yellow";
  return "red";
};

const fmt = (d) => (d ? dayjs(d).format("DD MMM YYYY") : "—");
const pct = (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—");
const num = (v, suffix = "") => (v != null ? `${v}${suffix}` : "—");

const TH = { fontSize: "12px", fontWeight: "600", color: "#667085", textTransform: "uppercase", bg: "#F9FAFB" };
const TD = { fontSize: "13px", color: "#344054", py: 3 };

// ── Sub-components ────────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, iconColor = "#660066" }) => (
  <Box bg="white" border="1px solid #F2F4F7" borderRadius="xl" p={5} boxShadow="sm">
    <Flex align="center" gap={3} mb={3}>
      <Box bg={`${iconColor}15`} p={2} borderRadius="lg">
        <Icon size={18} color={iconColor} />
      </Box>
      <ChakraText fontSize="14px" fontWeight="500" color="#667085">{label}</ChakraText>
    </Flex>
    <ChakraText fontSize="26px" fontWeight="700" color="#101928">{value ?? "—"}</ChakraText>
  </Box>
);

const FilterBar = ({ filters, onChange, onApply, onReset }) => (
  <Flex gap={3} flexWrap="wrap" align="flex-end" mb={5}>
    {filters.map((f) =>
      f.type === "select" ? (
        <Box key={f.key} minW="160px">
          <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</ChakraText>
          <Select size="sm" borderRadius="md" value={f.value} onChange={(e) => onChange(f.key, e.target.value)} placeholder={`All ${f.label}`}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Box>
      ) : (
        <Box key={f.key} minW="140px">
          <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</ChakraText>
          <Input size="sm" borderRadius="md" type="date" value={f.value} onChange={(e) => onChange(f.key, e.target.value)} />
        </Box>
      )
    )}
    <Flex gap={2} mb="1px">
      <Button onClick={onApply} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
      <Button secondary onClick={onReset} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
    </Flex>
  </Flex>
);

const Paginator = ({ page, total, limit, onPrev, onNext }) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return (
    <Flex justify="space-between" align="center" mt={4} px={1}>
      <ChakraText fontSize="13px" color="#667085">Page {page} of {totalPages} ({total} records)</ChakraText>
      <Flex gap={2}>
        <Button secondary onClick={onPrev} disabled={page <= 1} style={{ height: "32px", fontSize: "13px" }}>Previous</Button>
        <Button secondary onClick={onNext} disabled={page >= totalPages} style={{ height: "32px", fontSize: "13px" }}>Next</Button>
      </Flex>
    </Flex>
  );
};

const EmptyRow = ({ cols }) => (
  <Tr>
    <Td colSpan={cols} textAlign="center" py={10} color="#667085" fontSize="14px">No data found</Td>
  </Tr>
);

const ErrorBox = ({ message, onRetry }) => (
  <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={6}>
    <ChakraText color="red.700" mb={3}>{message}</ChakraText>
    <Button secondary onClick={onRetry} style={{ height: "32px", fontSize: "13px" }}>Try Again</Button>
  </Box>
);

const LoadingBox = ({ label }) => (
  <Flex h="320px" justify="center" align="center" flexDir="column" gap={3}>
    <Spinner size="xl" color="#660066" />
    <ChakraText color="#667085" fontSize="14px">{label}</ChakraText>
  </Flex>
);

const DetailRow = ({ label, value }) => (
  <Flex justify="space-between" align="flex-start" py={2} borderBottom="1px" borderColor="gray.100">
    <ChakraText fontSize="sm" color="gray.500" minW="180px">{label}</ChakraText>
    <Box flex={1} textAlign="right">
      {typeof value === "string" || typeof value === "number"
        ? <ChakraText fontSize="sm" fontWeight="medium">{value}</ChakraText>
        : value}
    </Box>
  </Flex>
);

// ── Filter defaults ───────────────────────────────────────────────────────────

const defaultStudentFilters = { courseId: "", departmentId: "", instructorId: "", studentStatus: "", engagementStatus: "", startDate: "", endDate: "" };
const defaultCourseFilters = { courseId: "", departmentId: "", instructorId: "", startDate: "", endDate: "" };
const defaultTrendFilters = { courseId: "", departmentId: "", instructorId: "", startDate: "", endDate: "" };
const defaultInstructorFilters = { departmentId: "", instructorId: "", courseId: "", startDate: "", endDate: "", period: "quarterly" };

const STUDENT_STATUS_OPTIONS = [
  { value: "Enrolled", label: "Enrolled" },
  { value: "Deactivated", label: "Deactivated" },
];

const ENGAGEMENT_STATUS_OPTIONS = [
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Inactive", label: "Inactive" },
];

const LIMIT = 20;

// ── Main Component ────────────────────────────────────────────────────────────

const CourseCompletionReportPage = () => {
  const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();

  // ── Filter options ────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // ── Enrollment KPIs ───────────────────────────────────────────────────────
  const [enrollmentKpis, setEnrollmentKpis] = useState(null);
  const [instructorSummary, setInstructorSummary] = useState(null);

  // ── Students tab ──────────────────────────────────────────────────────────
  const [studentsData, setStudentsData] = useState([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [studentFilters, setStudentFilters] = useState(defaultStudentFilters);
  const [appliedStudentFilters, setAppliedStudentFilters] = useState(defaultStudentFilters);

  // ── Courses tab ───────────────────────────────────────────────────────────
  const [coursesData, setCoursesData] = useState([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [courseFilters, setCourseFilters] = useState(defaultCourseFilters);
  const [appliedCourseFilters, setAppliedCourseFilters] = useState(defaultCourseFilters);

  // ── Trends tab ────────────────────────────────────────────────────────────
  const [trendsData, setTrendsData] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState(null);
  const [trendFilters, setTrendFilters] = useState(defaultTrendFilters);
  const [appliedTrendFilters, setAppliedTrendFilters] = useState(defaultTrendFilters);

  // ── Instructor Performance tab ────────────────────────────────────────────
  const [instructorRows, setInstructorRows] = useState([]);
  const [instructorTotal, setInstructorTotal] = useState(0);
  const [instructorPage, setInstructorPage] = useState(1);
  const [instructorLoading, setInstructorLoading] = useState(false);
  const [instructorError, setInstructorError] = useState(null);
  const [instructorFilters, setInstructorFilters] = useState(defaultInstructorFilters);
  const [appliedInstructorFilters, setAppliedInstructorFilters] = useState(defaultInstructorFilters);

  // ── Drill-down ────────────────────────────────────────────────────────────
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // ── Load filter option lists ──────────────────────────────────────────────

  useEffect(() => {
    Promise.allSettled([
      adminListCoursesForReport(),
      adminGetDepartmentListing(),
      adminGetUserListing({ page: 1, limit: 200, role: "INSTRUCTOR" }),
    ]).then(([coursesRes, deptsRes, usersRes]) => {
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value?.rows ?? []);
      if (deptsRes.status === "fulfilled") setDepartments(deptsRes.value?.departments ?? []);
      if (usersRes.status === "fulfilled") setInstructors(usersRes.value?.users ?? []);
    });
  }, []);

  // ── Fetchers ──────────────────────────────────────────────────────────────

  const fetchStudents = useCallback(async (page, filters) => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const params = { page, limit: LIMIT };
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.instructorId) params.instructorId = filters.instructorId;
      if (filters.studentStatus) params.studentStatus = filters.studentStatus;
      if (filters.engagementStatus) params.engagementStatus = filters.engagementStatus;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await adminGetEnrollmentStatusStudents(params);
      setStudentsData(res?.data?.data ?? []);
      setStudentsTotal(res?.data?.total ?? 0);
      if (res?.data?.kpis) setEnrollmentKpis(res.data.kpis);
    } catch (err) {
      setStudentsError(err?.response?.data?.message || "Failed to load student enrollment data.");
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async (page, filters) => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const params = { page, limit: LIMIT };
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.instructorId) params.instructorId = filters.instructorId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await adminGetEnrollmentStatusCourses(params);
      setCoursesData(res?.data?.data ?? []);
      setCoursesTotal(res?.data?.total ?? 0);
    } catch (err) {
      setCoursesError(err?.response?.data?.message || "Failed to load course data.");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (filters) => {
    setTrendsLoading(true);
    setTrendsError(null);
    try {
      const params = {};
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.instructorId) params.instructorId = filters.instructorId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await adminGetEnrollmentStatusTrends(params);
      setTrendsData(res?.data ?? null);
    } catch (err) {
      setTrendsError(err?.response?.data?.message || "Failed to load trend data.");
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  const fetchInstructors = useCallback(async (page, filters) => {
    setInstructorLoading(true);
    setInstructorError(null);
    try {
      const params = { page, limit: LIMIT };
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.instructorId) params.instructorId = filters.instructorId;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.period) params.period = filters.period;
      const res = await getInstructorPerformanceReportV2(params);
      const payload = res?.data ?? res;
      setInstructorSummary(payload?.summary ?? null);
      setInstructorRows(Array.isArray(payload?.data) ? payload.data : []);
      setInstructorTotal(payload?.total ?? 0);
    } catch (err) {
      setInstructorError(err?.response?.data?.message || "Failed to load instructor performance data.");
    } finally {
      setInstructorLoading(false);
    }
  }, []);

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStudents(1, defaultStudentFilters);
    fetchCourses(1, defaultCourseFilters);
    fetchTrends(defaultTrendFilters);
    fetchInstructors(1, defaultInstructorFilters);
  }, [fetchStudents, fetchCourses, fetchTrends, fetchInstructors]);

  // ── Drill-down ────────────────────────────────────────────────────────────

  const handleOpenDrillDown = async (instructor) => {
    openDrawer();
    setDetailLoading(true);
    setDetailError(null);
    setDetailRecord(null);
    try {
      const params = {};
      if (appliedInstructorFilters.startDate) params.startDate = appliedInstructorFilters.startDate;
      if (appliedInstructorFilters.endDate) params.endDate = appliedInstructorFilters.endDate;
      if (appliedInstructorFilters.period) params.period = appliedInstructorFilters.period;
      const res = await getInstructorPerformanceDrillDown(instructor.instructor_id, params);
      setDetailRecord(res?.data ?? res);
    } catch (err) {
      setDetailError(err?.response?.data?.message || "Failed to load instructor detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Filter apply/reset helpers ────────────────────────────────────────────

  const applyStudentFilters = () => {
    setAppliedStudentFilters(studentFilters);
    setStudentsPage(1);
    fetchStudents(1, studentFilters);
  };
  const resetStudentFilters = () => {
    setStudentFilters(defaultStudentFilters);
    setAppliedStudentFilters(defaultStudentFilters);
    setStudentsPage(1);
    fetchStudents(1, defaultStudentFilters);
  };

  const applyCourseFilters = () => {
    setAppliedCourseFilters(courseFilters);
    setCoursesPage(1);
    fetchCourses(1, courseFilters);
  };
  const resetCourseFilters = () => {
    setCourseFilters(defaultCourseFilters);
    setAppliedCourseFilters(defaultCourseFilters);
    setCoursesPage(1);
    fetchCourses(1, defaultCourseFilters);
  };

  const applyTrendFilters = () => {
    setAppliedTrendFilters(trendFilters);
    fetchTrends(trendFilters);
  };
  const resetTrendFilters = () => {
    setTrendFilters(defaultTrendFilters);
    setAppliedTrendFilters(defaultTrendFilters);
    fetchTrends(defaultTrendFilters);
  };

  const applyInstructorFilters = () => {
    setAppliedInstructorFilters(instructorFilters);
    setInstructorPage(1);
    fetchInstructors(1, instructorFilters);
  };
  const resetInstructorFilters = () => {
    setInstructorFilters(defaultInstructorFilters);
    setAppliedInstructorFilters(defaultInstructorFilters);
    setInstructorPage(1);
    fetchInstructors(1, defaultInstructorFilters);
  };

  const handleRefresh = () => {
    fetchStudents(studentsPage, appliedStudentFilters);
    fetchCourses(coursesPage, appliedCourseFilters);
    fetchTrends(appliedTrendFilters);
    fetchInstructors(instructorPage, appliedInstructorFilters);
  };

  // ── Filter option lists ───────────────────────────────────────────────────

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const instructorOptions = instructors.map((u) => ({
    value: u.id,
    label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
  }));

  const sharedFilterDefs = (filters, setFilters) => [
    { key: "courseId", label: "Course", type: "select", value: filters.courseId, options: courseOptions },
    { key: "departmentId", label: "Department", type: "select", value: filters.departmentId, options: departmentOptions },
    { key: "instructorId", label: "Instructor", type: "select", value: filters.instructorId, options: instructorOptions },
  ];

  // ── Chart data ────────────────────────────────────────────────────────────

  const enrollmentGrowthChart = {
    labels: (trendsData?.enrollment_growth ?? []).map((d) => d.month),
    datasets: [{
      label: "Enrollments",
      data: (trendsData?.enrollment_growth ?? []).map((d) => d.count),
      backgroundColor: "#66006620",
      borderColor: "#660066",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#660066",
    }],
  };

  const engagementTrendChart = {
    labels: (trendsData?.engagement_trend_per_course ?? []).map((d) => d.course_title),
    datasets: [
      { label: "In Progress", data: (trendsData?.engagement_trend_per_course ?? []).map((d) => d.in_progress), backgroundColor: "#3B82F6", borderRadius: 4 },
      { label: "Completed", data: (trendsData?.engagement_trend_per_course ?? []).map((d) => d.completed), backgroundColor: "#10B981", borderRadius: 4 },
      { label: "Inactive", data: (trendsData?.engagement_trend_per_course ?? []).map((d) => d.inactive), backgroundColor: "#F59E0B", borderRadius: 4 },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "#F2F4F7" } },
    },
  };

  const barGroupedOptions = {
    ...chartOptions,
    scales: {
      x: { grid: { display: false }, stacked: false },
      y: { beginAtZero: true, grid: { color: "#F2F4F7" }, stacked: false },
    },
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={6}>
        <Box>
          <Heading as="h2" size="md">Course Completion & Pass Rate Report</Heading>
          <ChakraText fontSize="14px" color="#667085" mt={1}>
            Enrollment status, pass rates, completion trends, and instructor performance in one view
          </ChakraText>
        </Box>
        <Button secondary onClick={handleRefresh} style={{ flexShrink: 0 }}>Refresh</Button>
      </Flex>

      {/* KPI Cards */}
      {(enrollmentKpis || instructorSummary) && (
        <SimpleGrid columns={{ base: 2, md: 4, lg: 4 }} spacing={4} mb={6}>
          {enrollmentKpis && (
            <>
              <KpiCard icon={FiUsers} label="Total Students in LMS" value={enrollmentKpis.total_students_in_lms?.toLocaleString()} iconColor="#660066" />
              <KpiCard icon={FiUserCheck} label="Total Enrolled" value={enrollmentKpis.total_enrolled_students?.toLocaleString()} iconColor="#3B82F6" />
              <KpiCard icon={FiCheckCircle} label="Completed" value={enrollmentKpis.total_completed_students?.toLocaleString()} iconColor="#059669" />
              <KpiCard icon={FiActivity} label="In Progress" value={enrollmentKpis.total_active_students?.toLocaleString()} iconColor="#10B981" />
              <KpiCard icon={FiAlertCircle} label="Inactive" value={enrollmentKpis.total_inactive_students?.toLocaleString()} iconColor="#F59E0B" />
              <KpiCard icon={FiUserX} label="Deactivated" value={enrollmentKpis.total_deactivated_students?.toLocaleString()} iconColor="#EF4444" />
              <KpiCard icon={FiBarChart2} label="Avg Completion Rate" value={pct(enrollmentKpis.average_course_completion_rate)} iconColor="#8B5CF6" />
              <KpiCard icon={FiTrendingUp} label="Overall Dropout Rate" value={pct(enrollmentKpis.overall_dropout_rate)} iconColor="#6B7280" />
            </>
          )}
          {instructorSummary && (
            <>
              <KpiCard icon={FiUsers} label="Total Instructors" value={instructorSummary.total_instructors} iconColor="#0EA5E9" />
              <KpiCard icon={FiAward} label="Top Completion Rate" value={pct(instructorSummary.top_completion_rate)} iconColor="#22C55E" />
              <KpiCard icon={FiBarChart2} label="Avg Assessment Score" value={pct(instructorSummary.average_assessment_score)} iconColor="#A855F7" />
              <KpiCard icon={FiClock} label="Avg Grading Days" value={num(instructorSummary.average_grading_days, " days")} iconColor="#F97316" />
            </>
          )}
        </SimpleGrid>
      )}

      {/* Tabs */}
      <Tabs colorScheme="purple" variant="enclosed">
        <TabList mb={0} borderBottom="1px solid #E4E7EC">
          {["Students", "Courses", "Trends", "Instructor Performance"].map((label) => (
            <Tab key={label} fontSize="14px" fontWeight="500" _selected={{ color: "#660066", borderColor: "#660066", borderBottomColor: "white" }}>
              {label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {/* ── Students Tab ──────────────────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <FilterBar
              filters={[
                ...sharedFilterDefs(studentFilters, setStudentFilters),
                { key: "studentStatus", label: "Student Status", type: "select", value: studentFilters.studentStatus, options: STUDENT_STATUS_OPTIONS },
                { key: "engagementStatus", label: "Engagement Status", type: "select", value: studentFilters.engagementStatus, options: ENGAGEMENT_STATUS_OPTIONS },
                { key: "startDate", label: "From Date", type: "date", value: studentFilters.startDate },
                { key: "endDate", label: "To Date", type: "date", value: studentFilters.endDate },
              ]}
              onChange={(key, val) => setStudentFilters((prev) => ({ ...prev, [key]: val }))}
              onApply={applyStudentFilters}
              onReset={resetStudentFilters}
            />

            {studentsLoading ? (
              <LoadingBox label="Loading enrollment data…" />
            ) : studentsError ? (
              <ErrorBox message={studentsError} onRetry={() => fetchStudents(studentsPage, appliedStudentFilters)} />
            ) : (
              <>
                <TableContainer bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        {["Student", "Department", "Course", "Enrolled On", "Student Status", "Engagement", "Last Active", "Progress", "Dropout"].map((h) => (
                          <Th key={h} {...TH} py={3} px={4}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {studentsData.length === 0 ? (
                        <EmptyRow cols={9} />
                      ) : (
                        studentsData.map((row, i) => (
                          <Tr key={`${row.student_id}_${row.course_id}_${i}`} _hover={{ bg: "#FAFAFA" }}>
                            <Td {...TD} px={4}>
                              <Box>
                                <ChakraText fontWeight="500">{row.student_name}</ChakraText>
                                <ChakraText fontSize="11px" color="#9CA3AF">{row.student_email}</ChakraText>
                              </Box>
                            </Td>
                            <Td {...TD} px={4}>{row.department_name || "—"}</Td>
                            <Td {...TD} px={4} maxW="180px"><ChakraText noOfLines={2} title={row.course_title}>{row.course_title}</ChakraText></Td>
                            <Td {...TD} px={4} whiteSpace="nowrap">{fmt(row.enrollment_date)}</Td>
                            <Td {...TD} px={4}>
                              <Badge colorScheme={studentStatusColor(row.student_status)} borderRadius="full" px={2}>{row.student_status}</Badge>
                            </Td>
                            <Td {...TD} px={4}>
                              <Badge colorScheme={engagementColor(row.engagement_status)} borderRadius="full" px={2}>{row.engagement_status}</Badge>
                            </Td>
                            <Td {...TD} px={4} whiteSpace="nowrap">{fmt(row.last_active_date)}</Td>
                            <Td {...TD} px={4} minW="120px">
                              <Flex align="center" gap={2}>
                                <Progress value={row.progress_percentage ?? 0} size="sm" colorScheme="purple" borderRadius="full" flex={1} />
                                <ChakraText fontSize="12px" color="#667085" flexShrink={0}>{pct(row.progress_percentage)}</ChakraText>
                              </Flex>
                            </Td>
                            <Td {...TD} px={4} textAlign="center">
                              <Badge colorScheme={row.is_dropout ? "red" : "green"} borderRadius="full" px={2}>
                                {row.is_dropout ? "Yes" : "No"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                <Paginator
                  page={studentsPage} total={studentsTotal} limit={LIMIT}
                  onPrev={() => { const p = studentsPage - 1; setStudentsPage(p); fetchStudents(p, appliedStudentFilters); }}
                  onNext={() => { const p = studentsPage + 1; setStudentsPage(p); fetchStudents(p, appliedStudentFilters); }}
                />
              </>
            )}
          </TabPanel>

          {/* ── Courses Tab ───────────────────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <FilterBar
              filters={[
                ...sharedFilterDefs(courseFilters, setCourseFilters),
                { key: "startDate", label: "From Date", type: "date", value: courseFilters.startDate },
                { key: "endDate", label: "To Date", type: "date", value: courseFilters.endDate },
              ]}
              onChange={(key, val) => setCourseFilters((prev) => ({ ...prev, [key]: val }))}
              onApply={applyCourseFilters}
              onReset={resetCourseFilters}
            />

            {coursesLoading ? (
              <LoadingBox label="Loading course data…" />
            ) : coursesError ? (
              <ErrorBox message={coursesError} onRetry={() => fetchCourses(coursesPage, appliedCourseFilters)} />
            ) : (
              <>
                <TableContainer bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        {["Course", "Department", "Total Enrolled", "Active", "Completed", "Completion Rate", "Inactive", "Deactivated", "Dropout Rate", "Trend"].map((h) => (
                          <Th key={h} {...TH} py={3} px={4}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {coursesData.length === 0 ? (
                        <EmptyRow cols={10} />
                      ) : (
                        coursesData.map((row, i) => {
                          const total = row.total_enrollments ?? row.enrollment_count ?? 0;
                          const completed = row.completed_students ?? 0;
                          const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : null;
                          return (
                            <Tr key={`${row.course_id}_${i}`} _hover={{ bg: "#FAFAFA" }}>
                              <Td {...TD} px={4} maxW="200px">
                                <ChakraText fontWeight="500" noOfLines={2} title={row.course_title}>{row.course_title}</ChakraText>
                              </Td>
                              <Td {...TD} px={4}>{row.department_name || "—"}</Td>
                              <Td {...TD} px={4} textAlign="center" fontWeight="600">{total || "—"}</Td>
                              <Td {...TD} px={4} textAlign="center">
                                <Badge colorScheme="blue" borderRadius="full" px={2}>{row.active_students ?? 0}</Badge>
                              </Td>
                              <Td {...TD} px={4} textAlign="center">
                                <Badge colorScheme="green" borderRadius="full" px={2}>{completed}</Badge>
                              </Td>
                              <Td {...TD} px={4} textAlign="center">
                                <Badge colorScheme={completionColor(completionRate)} borderRadius="full" px={2}>
                                  {completionRate != null ? `${completionRate}%` : "—"}
                                </Badge>
                              </Td>
                              <Td {...TD} px={4} textAlign="center">
                                <Badge colorScheme="orange" borderRadius="full" px={2}>{row.inactive_students ?? 0}</Badge>
                              </Td>
                              <Td {...TD} px={4} textAlign="center">
                                <Badge colorScheme="red" borderRadius="full" px={2}>{row.deactivated_students ?? 0}</Badge>
                              </Td>
                              <Td {...TD} px={4} textAlign="center">{pct(row.dropout_rate)}</Td>
                              <Td {...TD} px={4}>
                                <Badge colorScheme={trendColor(row.enrollment_trend)} borderRadius="full" px={2}>
                                  {row.enrollment_trend || "—"}
                                </Badge>
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                <Paginator
                  page={coursesPage} total={coursesTotal} limit={LIMIT}
                  onPrev={() => { const p = coursesPage - 1; setCoursesPage(p); fetchCourses(p, appliedCourseFilters); }}
                  onNext={() => { const p = coursesPage + 1; setCoursesPage(p); fetchCourses(p, appliedCourseFilters); }}
                />
              </>
            )}
          </TabPanel>

          {/* ── Trends Tab ────────────────────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <FilterBar
              filters={[
                ...sharedFilterDefs(trendFilters, setTrendFilters),
                { key: "startDate", label: "From Date", type: "date", value: trendFilters.startDate },
                { key: "endDate", label: "To Date", type: "date", value: trendFilters.endDate },
              ]}
              onChange={(key, val) => setTrendFilters((prev) => ({ ...prev, [key]: val }))}
              onApply={applyTrendFilters}
              onReset={resetTrendFilters}
            />

            {trendsLoading ? (
              <LoadingBox label="Loading trend data…" />
            ) : trendsError ? (
              <ErrorBox message={trendsError} onRetry={() => fetchTrends(appliedTrendFilters)} />
            ) : (
              <>
                <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" p={5} mb={5}>
                  <ChakraText fontWeight="600" color="#101928" mb={4}>Enrollment Growth Over Time</ChakraText>
                  {(trendsData?.enrollment_growth ?? []).length === 0 ? (
                    <Flex h="160px" align="center" justify="center">
                      <ChakraText color="#9CA3AF" fontSize="14px">No enrollment growth data available</ChakraText>
                    </Flex>
                  ) : (
                    <Line data={enrollmentGrowthChart} options={chartOptions} height={80} />
                  )}
                </Box>

                <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" p={5} mb={5}>
                  <ChakraText fontWeight="600" color="#101928" mb={4}>Engagement Trend per Course</ChakraText>
                  {(trendsData?.engagement_trend_per_course ?? []).length === 0 ? (
                    <Flex h="160px" align="center" justify="center">
                      <ChakraText color="#9CA3AF" fontSize="14px">No engagement trend data available</ChakraText>
                    </Flex>
                  ) : (
                    <Bar data={engagementTrendChart} options={barGroupedOptions} height={80} />
                  )}
                </Box>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                  <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" p={5}>
                    <ChakraText fontWeight="600" color="#101928" mb={4}>Dropout Patterns by Course</ChakraText>
                    {(trendsData?.dropout_patterns ?? []).length === 0 ? (
                      <Flex h="120px" align="center" justify="center">
                        <ChakraText color="#9CA3AF" fontSize="14px">No dropout data available</ChakraText>
                      </Flex>
                    ) : (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th {...TH} py={2}>Course</Th>
                              <Th {...TH} py={2} textAlign="center">Dropouts</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(trendsData?.dropout_patterns ?? []).map((d, i) => (
                              <Tr key={`${d.course_id}_${i}`} _hover={{ bg: "#FAFAFA" }}>
                                <Td {...TD} py={2}>{d.course_title}</Td>
                                <Td {...TD} py={2} textAlign="center">
                                  <Badge colorScheme={d.dropout_count > 0 ? "red" : "green"} borderRadius="full" px={2}>{d.dropout_count}</Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>

                  <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" p={5}>
                    <ChakraText fontWeight="600" color="#101928" mb={4}>Activity Distribution (Active vs Inactive)</ChakraText>
                    {(trendsData?.activity_heatmap ?? []).length === 0 ? (
                      <Flex h="120px" align="center" justify="center">
                        <ChakraText color="#9CA3AF" fontSize="14px">No activity data available</ChakraText>
                      </Flex>
                    ) : (
                      <TableContainer maxH="320px" overflowY="auto">
                        <Table variant="simple" size="sm">
                          <Thead position="sticky" top={0} zIndex={1} bg="white">
                            <Tr>
                              <Th {...TH} py={2}>Student</Th>
                              <Th {...TH} py={2}>Course</Th>
                              <Th {...TH} py={2} textAlign="center">Status</Th>
                              <Th {...TH} py={2} textAlign="center">Progress</Th>
                              <Th {...TH} py={2} textAlign="center">Days Inactive</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(trendsData?.activity_heatmap ?? []).map((d, i) => (
                              <Tr key={`${d.student_id}_${d.course_id}_${i}`} _hover={{ bg: "#FAFAFA" }}>
                                <Td {...TD} py={2}>{d.student_name}</Td>
                                <Td {...TD} py={2} maxW="140px"><ChakraText noOfLines={1} title={d.course_title}>{d.course_title}</ChakraText></Td>
                                <Td {...TD} py={2} textAlign="center">
                                  <Badge colorScheme={engagementColor(d.status)} borderRadius="full" px={2} fontSize="11px">{d.status}</Badge>
                                </Td>
                                <Td {...TD} py={2} textAlign="center">{pct(d.progress_percentage)}</Td>
                                <Td {...TD} py={2} textAlign="center">
                                  <ChakraText color={d.days_since_active > 30 ? "#EF4444" : "#374151"} fontWeight={d.days_since_active > 30 ? "600" : "400"}>
                                    {d.days_since_active ?? "—"}
                                  </ChakraText>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </SimpleGrid>
              </>
            )}
          </TabPanel>

          {/* ── Instructor Performance Tab ────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <FilterBar
              filters={[
                { key: "departmentId", label: "Department", type: "select", value: instructorFilters.departmentId, options: departmentOptions },
                { key: "instructorId", label: "Instructor", type: "select", value: instructorFilters.instructorId, options: instructorOptions },
                { key: "courseId", label: "Course", type: "select", value: instructorFilters.courseId, options: courseOptions },
                { key: "startDate", label: "From Date", type: "date", value: instructorFilters.startDate },
                { key: "endDate", label: "To Date", type: "date", value: instructorFilters.endDate },
              ]}
              onChange={(key, val) => setInstructorFilters((prev) => ({ ...prev, [key]: val }))}
              onApply={applyInstructorFilters}
              onReset={resetInstructorFilters}
            />

            {instructorLoading ? (
              <LoadingBox label="Loading instructor performance data…" />
            ) : instructorError ? (
              <ErrorBox message={instructorError} onRetry={() => fetchInstructors(instructorPage, appliedInstructorFilters)} />
            ) : (
              <>
                <TableContainer bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        {["Instructor", "Department", "Courses", "Enrolled", "Completed", "Completion %", "Assess. Score", "Exam Score", "Project Score", "Grading Days"].map((h) => (
                          <Th key={h} {...TH} py={3} px={4}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {instructorRows.length === 0 ? (
                        <EmptyRow cols={10} />
                      ) : (
                        instructorRows.map((row) => (
                          <Tr
                            key={row.instructor_id}
                            _hover={{ bg: "blue.50" }}
                            cursor="pointer"
                            onClick={() => handleOpenDrillDown(row)}
                          >
                            <Td {...TD} px={4}>
                              <Box>
                                <ChakraText fontWeight="500">{row.instructor_name ?? "—"}</ChakraText>
                                <ChakraText fontSize="11px" color="#9CA3AF">{row.instructor_email ?? ""}</ChakraText>
                              </Box>
                            </Td>
                            <Td {...TD} px={4}>{row.department ?? "—"}</Td>
                            <Td {...TD} px={4} textAlign="center">{row.courses_delivered ?? "—"}</Td>
                            <Td {...TD} px={4} textAlign="center">{row.total_enrolled ?? "—"}</Td>
                            <Td {...TD} px={4} textAlign="center">{row.total_completed ?? "—"}</Td>
                            <Td {...TD} px={4} textAlign="center">
                              <Badge colorScheme={completionColor(row.completion_rate)} borderRadius="full" px={2}>
                                {row.completion_rate != null ? `${row.completion_rate}%` : "—"}
                              </Badge>
                            </Td>
                            <Td {...TD} px={4} textAlign="center">{num(row.average_assessment_score, "%")}</Td>
                            <Td {...TD} px={4} textAlign="center">{num(row.average_exam_score, "%")}</Td>
                            <Td {...TD} px={4} textAlign="center">{num(row.average_project_score, "%")}</Td>
                            <Td {...TD} px={4} textAlign="center">{num(row.grading_timeliness_days, " days")}</Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                <Paginator
                  page={instructorPage} total={instructorTotal} limit={LIMIT}
                  onPrev={() => { const p = instructorPage - 1; setInstructorPage(p); fetchInstructors(p, appliedInstructorFilters); }}
                  onNext={() => { const p = instructorPage + 1; setInstructorPage(p); fetchInstructors(p, appliedInstructorFilters); }}
                />
              </>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ── Instructor Drill-Down Drawer ────────────────────────────────────── */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px" borderColor="gray.200">Instructor Detail</DrawerHeader>
          <DrawerBody pt={4}>
            {detailLoading ? (
              <Flex h="200px" align="center" justify="center" flexDir="column" gap={3}>
                <Spinner size="xl" color="#660066" />
                <ChakraText color="#667085" fontSize="14px">Loading detail…</ChakraText>
              </Flex>
            ) : detailError ? (
              <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={4}>
                <ChakraText color="red.700">{detailError}</ChakraText>
              </Box>
            ) : detailRecord ? (
              <Box>
                <Box mb={4}>
                  <ChakraText fontSize="lg" fontWeight="bold">{detailRecord.instructor_name ?? "—"}</ChakraText>
                  <ChakraText fontSize="sm" color="gray.500">{detailRecord.instructor_email ?? ""}</ChakraText>
                  {detailRecord.department && <Badge mt={1}>{detailRecord.department}</Badge>}
                </Box>
                <DetailRow label="Instructor ID" value={detailRecord.instructor_id ?? "—"} />
                <DetailRow label="Courses Delivered" value={detailRecord.courses_delivered ?? "—"} />
                <DetailRow label="Total Enrolled" value={detailRecord.total_enrolled ?? "—"} />
                <DetailRow label="Total Completed" value={detailRecord.total_completed ?? "—"} />
                <DetailRow label="Completion Rate" value={
                  <Badge colorScheme={completionColor(detailRecord.completion_rate)}>
                    {detailRecord.completion_rate != null ? `${detailRecord.completion_rate}%` : "—"}
                  </Badge>
                } />
                <DetailRow label="Assessment Score" value={num(detailRecord.average_assessment_score, "%")} />
                <DetailRow label="Exam Score" value={num(detailRecord.average_exam_score, "%")} />
                <DetailRow label="Project Score" value={num(detailRecord.average_project_score, "%")} />
                <DetailRow label="Grading Timeliness" value={num(detailRecord.grading_timeliness_days, " days")} />

                {Array.isArray(detailRecord.score_trend) && detailRecord.score_trend.length > 0 && (
                  <Box mt={5}>
                    <ChakraText fontSize="sm" fontWeight="semibold" mb={3} color="gray.600">Score Trend</ChakraText>
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Period</Th>
                          <Th isNumeric>Average Score</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {detailRecord.score_trend.map((t, i) => (
                          <Tr key={i}>
                            <Td>{t.period}</Td>
                            <Td isNumeric fontWeight="semibold">{num(t.average_score, "%")}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            ) : null}
          </DrawerBody>
          <DrawerFooter borderTop="1px" borderColor="gray.200">
            <Button secondary onClick={closeDrawer} style={{ height: "32px", fontSize: "13px" }}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </AdminMainAreaWrapper>
  );
};

export const CourseCompletionReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CourseCompletionReportPage {...props} />} />
);

export default CourseCompletionReportPage;
