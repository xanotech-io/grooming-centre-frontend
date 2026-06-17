import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  SimpleGrid,
  Badge,
  Progress,
  Select,
  Input,
  Spinner as ChakraSpinner,
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
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { FiUserCheck, FiTrendingUp, FiActivity,  FiAlertCircle, FiBarChart2, FiFilter, FiChevronDown, FiX } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Button, Heading, Spinner } from "../../../../components";
import {
  adminGetEnrollmentStatusStudents,
  adminGetEnrollmentStatusCourses,
  adminGetEnrollmentStatusTrends,
  adminListCoursesForReport,
  adminGetDepartmentListing,
  adminGetInstructorReportDirectory,
  adminGetStudents,
} from "../../../../services";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const studentStatusScheme = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "enrolled") return "green";
  if (v === "deactivated") return "red";
  if (v === "approved") return "blue";
  if (v === "unenrolled") return "orange";
  return "gray";
};

const engagementStatusScheme = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "in progress") return "blue";
  if (v === "completed") return "green";
  if (v === "inactive") return "orange";
  return "gray";
};

const trendScheme = (t) => {
  const v = String(t || "").toLowerCase();
  if (v === "growing") return "green";
  if (v === "declining") return "red";
  return "gray";
};

const fmt = (d) => (d ? dayjs(d).format("DD MMM YYYY") : "—");
const pct = (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—");

// ── EntityCombobox ────────────────────────────────────────────────────────────

function EntityCombobox({ fetchFn, value, onSelect, placeholder }) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (!value) setInputValue("");
  }, [value]);

  const filtered = useMemo(() => {
    if (!inputValue || selectedOption) return options;
    const q = inputValue.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel ?? "").toLowerCase().includes(q),
    );
  }, [options, inputValue, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doFetch = useCallback(
    async (query) => {
      setLoading(true);
      try {
        setOptions(await fetchFn(query));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn],
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (value) onSelect(null);
    setIsOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(val), 350);
  };

  const handleFocus = () => {
    if (!value) {
      setIsOpen(true);
      if (options.length === 0) doFetch("");
    }
  };

  const displayValue = selectedOption
    ? `${selectedOption.label}${selectedOption.sublabel ? ` — ${selectedOption.sublabel}` : ""}`
    : value || inputValue;

  return (
    <Box ref={containerRef} position="relative">
      <Flex
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        alignItems="center"
        px={2}
        bg="white"
        h="32px"
        _focusWithin={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #660066" }}
      >
        <Input
          border="none"
          px={0}
          size="sm"
          h="auto"
          _focus={{ boxShadow: "none" }}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || "Search..."}
          readOnly={!!value}
        />
        {loading && <ChakraSpinner size="xs" color="gray.400" mr={1} />}
        {value ? (
          <Box
            as="button"
            type="button"
            onClick={() => { onSelect(null); setInputValue(""); setOptions([]); setIsOpen(false); }}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            ml={1}
            flexShrink={0}
          >
            <FiX size={12} />
          </Box>
        ) : (
          <Box color="gray.400" ml={1} flexShrink={0}><FiChevronDown size={12} /></Box>
        )}
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="md"
          boxShadow="md"
          zIndex={1500}
          maxH="220px"
          overflowY="auto"
        >
          {loading && (
            <Flex alignItems="center" gap={2} px={3} py={2}>
              <ChakraSpinner size="xs" />
              <ChakraText fontSize="12px" color="gray.500">Loading...</ChakraText>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <ChakraText fontSize="12px" color="gray.500" px={3} py={2}>No results found</ChakraText>
          )}
          {!loading && filtered.map((opt) => (
            <Box
              key={opt.id}
              px={3}
              py="6px"
              cursor="pointer"
              _hover={{ bg: "purple.50" }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setInputValue("");
                setIsOpen(false);
              }}
            >
              <ChakraText fontSize="13px" fontWeight="500">{opt.label}</ChakraText>
              {opt.sublabel && <ChakraText fontSize="11px" color="gray.500">{opt.sublabel}</ChakraText>}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, iconColor = "#660066" }) => (
  <Box bg="white" border="1px solid #F2F4F7" borderRadius="xl" p={5} boxShadow="sm">
    <Flex align="center" gap={3} mb={3}>
      <Box bg={`${iconColor}15`} p={2} borderRadius="lg">
        <Icon size={18} color={iconColor} />
      </Box>
      <ChakraText fontSize="14px" fontWeight="500" color="#667085">
        {label}
      </ChakraText>
    </Flex>
    <ChakraText fontSize="26px" fontWeight="700" color="#101928">
      {value ?? "—"}
    </ChakraText>
  </Box>
);

const Paginator = ({ page, total, limit, onPrev, onNext }) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return (
    <Flex justify="space-between" align="center" mt={4} px={1}>
      <ChakraText fontSize="13px" color="#667085">
        Page {page} of {totalPages} ({total} records)
      </ChakraText>
      <Flex gap={2}>
        <Button secondary onClick={onPrev} disabled={page <= 1} style={{ height: "32px", fontSize: "13px" }}>
          Previous
        </Button>
        <Button secondary onClick={onNext} disabled={page >= totalPages} style={{ height: "32px", fontSize: "13px" }}>
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

// const EmptyRow = ({ cols }) => (
//   <Tr>
//     <Td colSpan={cols} textAlign="center" py={10} color="#667085" fontSize="14px">
//       No data found
//     </Td>
//   </Tr>
// );

const TableHeadStyle = { fontSize: "12px", fontWeight: "600", color: "#667085", textTransform: "uppercase", bg: "#F9FAFB" };
const CellStyle = { fontSize: "13px", color: "#344054", py: 3 };

// ── Constants ─────────────────────────────────────────────────────────────────

const STUDENT_STATUS_OPTIONS = [
  { value: "Enrolled", label: "Enrolled" },
  { value: "Deactivated", label: "Deactivated" },
];

const ENGAGEMENT_STATUS_OPTIONS = [
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Inactive", label: "Inactive" },
];

const defaultStudentFilters = {
  courseId: "",
  departmentId: "",
  instructorId: "",
  studentId: "",
  studentStatus: "",
  engagementStatus: "",
  startDate: "",
  endDate: "",
};

const defaultCourseFilters = {
  courseId: "",
  departmentId: "",
  instructorId: "",
  startDate: "",
  endDate: "",
};

const defaultTrendFilters = {
  courseId: "",
  departmentId: "",
  instructorId: "",
  startDate: "",
  endDate: "",
};

// ── Main Component ────────────────────────────────────────────────────────────

const EnrollmentStatusReportPage = () => {
  const [kpis, setKpis] = useState(null);

  // Students tab
  const [studentsData, setStudentsData] = useState([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [studentFilters, setStudentFilters] = useState(defaultStudentFilters);
  const [appliedStudentFilters, setAppliedStudentFilters] = useState(defaultStudentFilters);
  const [showStudentFilters, setShowStudentFilters] = useState(false);

  // Courses tab
  const [coursesData, setCoursesData] = useState([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [courseFilters, setCourseFilters] = useState(defaultCourseFilters);
  const [appliedCourseFilters, setAppliedCourseFilters] = useState(defaultCourseFilters);
  const [showCourseFilters, setShowCourseFilters] = useState(false);

  // Trends tab
  const [trendsData, setTrendsData] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState(null);
  const [trendFilters, setTrendFilters] = useState(defaultTrendFilters);
  const [appliedTrendFilters, setAppliedTrendFilters] = useState(defaultTrendFilters);
  const [showTrendFilters, setShowTrendFilters] = useState(false);

  const LIMIT = 20;

  // ── Combobox fetch functions ──────────────────────────────────────────────────

  const fetchCourseOptions = useCallback(async (query) => {
    const res = await adminListCoursesForReport({ search: query, limit: 50 });
    return (res?.rows ?? []).map((c) => ({ id: c.id, label: c.title }));
  }, []);

  const fetchDepartmentOptions = useCallback(async (query) => {
    const res = await adminGetDepartmentListing({ search: query });
    return (res?.departments ?? []).map((d) => ({ id: d.id, label: d.name }));
  }, []);

  const fetchInstructorOptions = useCallback(async (query) => {
    const res = await adminGetInstructorReportDirectory({ search: query, limit: 50 });
    const list = res?.data ?? [];
    return list.map((i) => ({
      id: i.id ?? i.instructor_id,
      label: (i.name ?? `${i.firstName ?? ""} ${i.lastName ?? ""}`.trim()) || i.instructor_name,
      sublabel: i.email ?? i.instructor_email ?? null,
    }));
  }, []);

  const fetchStudentOptions = useCallback(async (query) => {
    const res = await adminGetStudents({ search: query, limit: 50 });
    return (res?.students ?? []).map((s) => ({
      id: s.id ?? s.userId,
      label: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email,
      sublabel: s.email ?? null,
    }));
  }, []);

  // ── Fetchers ──────────────────────────────────────────────────────────────────

  const fetchStudents = useCallback(async (page, filters) => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const params = { page, limit: LIMIT };
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.instructorId) params.instructorId = filters.instructorId;
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.studentStatus) params.studentStatus = filters.studentStatus;
      if (filters.engagementStatus) params.engagementStatus = filters.engagementStatus;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await adminGetEnrollmentStatusStudents(params);
      setStudentsData(res?.data?.data ?? []);
      setStudentsTotal(res?.data?.total ?? 0);
      if (res?.data?.kpis) setKpis(res.data.kpis);
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
      setCoursesError(err?.response?.data?.message || "Failed to load course enrollment data.");
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

  useEffect(() => {
    fetchStudents(1, defaultStudentFilters);
    fetchCourses(1, defaultCourseFilters);
    fetchTrends(defaultTrendFilters);
  }, [fetchStudents, fetchCourses, fetchTrends]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleRefresh = () => {
    fetchStudents(studentsPage, appliedStudentFilters);
    fetchCourses(coursesPage, appliedCourseFilters);
    fetchTrends(appliedTrendFilters);
  };

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

  // ── Active filter counts ──────────────────────────────────────────────────────

  const studentBoxActiveCount = Object.values(studentFilters).filter(Boolean).length;
  const courseBoxActiveCount = Object.values(courseFilters).filter(Boolean).length;
  const trendBoxActiveCount = Object.values(trendFilters).filter(Boolean).length;

  // ── Chart data ────────────────────────────────────────────────────────────────

  const enrollmentGrowthChart = {
    labels: (trendsData?.enrollment_growth ?? []).map((d) => d.month),
    datasets: [
      {
        label: "Enrollments",
        data: (trendsData?.enrollment_growth ?? []).map((d) => d.count),
        backgroundColor: "#66006620",
        borderColor: "#660066",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#660066",
      },
    ],
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
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: "#F2F4F7" } } },
  };

  const barGroupedOptions = {
    ...chartOptions,
    scales: { x: { grid: { display: false }, stacked: false }, y: { beginAtZero: true, grid: { color: "#F2F4F7" }, stacked: false } },
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={6}>
        <Box>
          <Heading as="h2" size="md">Enrollment Status Report</Heading>
          <ChakraText fontSize="14px" color="#667085" mt={1}>
            Real-time view of student enrollment activity across all courses
          </ChakraText>
        </Box>
        <Button secondary onClick={handleRefresh} style={{ flexShrink: 0 }}>
          Refresh
        </Button>
      </Flex>

      {/* KPI Summary Cards */}
      {kpis && (
        <SimpleGrid columns={{ base: 2, md: 4, lg: 4 }} spacing={4} mb={4}>
          <KpiCard icon={FiUserCheck} label="Total Enrolled" value={kpis.total_enrolled_students?.toLocaleString()} iconColor="#3B82F6" />
          <KpiCard icon={FiActivity} label="Active (In Progress)" value={kpis.total_active_students?.toLocaleString()} iconColor="#10B981" />
          {/* <KpiCard icon={FiCheckCircle} label="Completed" value={kpis.total_completed_students?.toLocaleString()} iconColor="#059669" /> */}
          <KpiCard icon={FiAlertCircle} label="Inactive" value={kpis.total_inactive_students?.toLocaleString()} iconColor="#F59E0B" />
          <KpiCard icon={FiTrendingUp} label="Overall Dropout Rate" value={pct(kpis.overall_dropout_rate)} iconColor="#6B7280" />
          <KpiCard icon={FiBarChart2} label="Avg Completion Rate" value={pct(kpis.average_course_completion_rate)} iconColor="#8B5CF6" />
        </SimpleGrid>
      )}

      {/* Tabs */}
      <Tabs colorScheme="purple" variant="enclosed">
        <TabList mb={0} borderBottom="1px solid #E4E7EC">
          <Tab fontSize="14px" fontWeight="500" _selected={{ color: "#660066", borderColor: "#660066", borderBottomColor: "white" }}>Students</Tab>
          <Tab fontSize="14px" fontWeight="500" _selected={{ color: "#660066", borderColor: "#660066", borderBottomColor: "white" }}>Courses</Tab>
          <Tab fontSize="14px" fontWeight="500" _selected={{ color: "#660066", borderColor: "#660066", borderBottomColor: "white" }}>Trends</Tab>
        </TabList>

        <TabPanels>
          {/* ── Students Tab ─────────────────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <Flex gap={2} mb={3} alignItems="center">
              <Button
                secondary
                onClick={() => setShowStudentFilters((v) => !v)}
                style={{ height: "32px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiFilter size={13} />
                Filters{studentBoxActiveCount > 0 ? ` (${studentBoxActiveCount})` : ""}
              </Button>
              {/* <Button onClick={applyStudentFilters} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
              <Button secondary onClick={resetStudentFilters} style={{ height: "32px", fontSize: "13px" }}>Reset</Button> */}
            </Flex>

            {showStudentFilters && (
              <Box bg="gray.50" border="1px solid #E4E7EC" borderRadius="md" p={4} mb={4}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Course</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchCourseOptions}
                      value={studentFilters.courseId}
                      onSelect={(opt) => setStudentFilters((p) => ({ ...p, courseId: opt ? opt.id : "" }))}
                      placeholder="Search course..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Department</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchDepartmentOptions}
                      value={studentFilters.departmentId}
                      onSelect={(opt) => setStudentFilters((p) => ({ ...p, departmentId: opt ? opt.id : "" }))}
                      placeholder="Search department..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Instructor</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchInstructorOptions}
                      value={studentFilters.instructorId}
                      onSelect={(opt) => setStudentFilters((p) => ({ ...p, instructorId: opt ? opt.id : "" }))}
                      placeholder="Search instructor..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Student</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchStudentOptions}
                      value={studentFilters.studentId}
                      onSelect={(opt) => setStudentFilters((p) => ({ ...p, studentId: opt ? opt.id : "" }))}
                      placeholder="Search student..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Student Status</FormLabel>
                    <Select size="sm" borderRadius="md" value={studentFilters.studentStatus} onChange={(e) => setStudentFilters((p) => ({ ...p, studentStatus: e.target.value }))} placeholder="All Statuses">
                      {STUDENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Engagement Status</FormLabel>
                    <Select size="sm" borderRadius="md" value={studentFilters.engagementStatus} onChange={(e) => setStudentFilters((p) => ({ ...p, engagementStatus: e.target.value }))} placeholder="All Statuses">
                      {ENGAGEMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>From Date</FormLabel>
                    <Input size="sm" borderRadius="md" type="date" value={studentFilters.startDate} onChange={(e) => setStudentFilters((p) => ({ ...p, startDate: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>To Date</FormLabel>
                    <Input size="sm" borderRadius="md" type="date" value={studentFilters.endDate} onChange={(e) => setStudentFilters((p) => ({ ...p, endDate: e.target.value }))} />
                  </FormControl>
                </SimpleGrid>
                <Flex gap={2} mt={3}>
                  <Button onClick={applyStudentFilters} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
                  <Button secondary onClick={resetStudentFilters} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
                </Flex>
              </Box>
            )}

            {studentsLoading ? (
              <Flex h="320px" justify="center" align="center" flexDir="column" gap={3}>
                <Spinner size="xl" color="#660066" />
                <ChakraText color="#667085" fontSize="14px">Loading enrollment data…</ChakraText>
              </Flex>
            ) : studentsError ? (
              <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={6}>
                <ChakraText color="red.700" mb={3}>{studentsError}</ChakraText>
                <Button secondary onClick={() => fetchStudents(studentsPage, appliedStudentFilters)}>Try Again</Button>
              </Box>
            ) : (
              <>
                <TableContainer bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        {["Student", "Department", "Course", "Enrolled On", "Student Status", "Engagement", "Last Active", "Days Since Active", "Progress", "Dropout"].map((h) => (
                          <Th key={h} {...TableHeadStyle} py={3} px={4}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {studentsData.length === 0 ? (
                        <Tr><Td colSpan={10} textAlign="center" py={10} color="#667085" fontSize="14px">No data found</Td></Tr>
                      ) : (
                        studentsData.map((row, i) => (
                          <Tr key={row.student_id + "_" + row.course_id + "_" + i} _hover={{ bg: "#FAFAFA" }}>
                            <Td {...CellStyle} px={4}>
                              <Box>
                                <ChakraText fontWeight="500">{row.student_name}</ChakraText>
                                <ChakraText fontSize="11px" color="#9CA3AF">{row.student_email}</ChakraText>
                              </Box>
                            </Td>
                            <Td {...CellStyle} px={4}>{row.department_name || "—"}</Td>
                            <Td {...CellStyle} px={4} maxW="180px">
                              <ChakraText noOfLines={2} title={row.course_title}>{row.course_title}</ChakraText>
                            </Td>
                            <Td {...CellStyle} px={4} whiteSpace="nowrap">{fmt(row.enrollment_date)}</Td>
                            <Td {...CellStyle} px={4}>
                              <Badge colorScheme={studentStatusScheme(row.student_status)} borderRadius="full" px={2}>{row.student_status}</Badge>
                            </Td>
                            <Td {...CellStyle} px={4}>
                              <Badge colorScheme={engagementStatusScheme(row.engagement_status)} borderRadius="full" px={2}>{row.engagement_status}</Badge>
                            </Td>
                            <Td {...CellStyle} px={4} whiteSpace="nowrap">{fmt(row.last_active_date)}</Td>
                            <Td {...CellStyle} px={4} textAlign="center">{row.days_since_active ?? "—"}</Td>
                            <Td {...CellStyle} px={4} minW="120px">
                              <Flex align="center" gap={2}>
                                <Progress value={row.progress_percentage ?? 0} size="sm" colorScheme="purple" borderRadius="full" flex={1} />
                                <ChakraText fontSize="12px" color="#667085" flexShrink={0}>{pct(row.progress_percentage)}</ChakraText>
                              </Flex>
                            </Td>
                            <Td {...CellStyle} px={4} textAlign="center">
                              {row.dropout_flag
                                ? <Badge colorScheme="red" borderRadius="full" px={2}>Yes</Badge>
                                : <Badge colorScheme="green" borderRadius="full" px={2}>No</Badge>}
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                <Paginator
                  page={studentsPage}
                  total={studentsTotal}
                  limit={LIMIT}
                  onPrev={() => { const p = studentsPage - 1; setStudentsPage(p); fetchStudents(p, appliedStudentFilters); }}
                  onNext={() => { const p = studentsPage + 1; setStudentsPage(p); fetchStudents(p, appliedStudentFilters); }}
                />
              </>
            )}
          </TabPanel>

          {/* ── Courses Tab ──────────────────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <Flex gap={2} mb={3} alignItems="center">
              <Button
                secondary
                onClick={() => setShowCourseFilters((v) => !v)}
                style={{ height: "32px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiFilter size={13} />
                Filters{courseBoxActiveCount > 0 ? ` (${courseBoxActiveCount})` : ""}
              </Button>
              {/* <Button onClick={applyCourseFilters} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
              <Button secondary onClick={resetCourseFilters} style={{ height: "32px", fontSize: "13px" }}>Reset</Button> */}
            </Flex>

            {showCourseFilters && (
              <Box bg="gray.50" border="1px solid #E4E7EC" borderRadius="md" p={4} mb={4}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Course</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchCourseOptions}
                      value={courseFilters.courseId}
                      onSelect={(opt) => setCourseFilters((p) => ({ ...p, courseId: opt ? opt.id : "" }))}
                      placeholder="Search course..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Department</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchDepartmentOptions}
                      value={courseFilters.departmentId}
                      onSelect={(opt) => setCourseFilters((p) => ({ ...p, departmentId: opt ? opt.id : "" }))}
                      placeholder="Search department..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Instructor</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchInstructorOptions}
                      value={courseFilters.instructorId}
                      onSelect={(opt) => setCourseFilters((p) => ({ ...p, instructorId: opt ? opt.id : "" }))}
                      placeholder="Search instructor..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>From Date</FormLabel>
                    <Input size="sm" borderRadius="md" type="date" value={courseFilters.startDate} onChange={(e) => setCourseFilters((p) => ({ ...p, startDate: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>To Date</FormLabel>
                    <Input size="sm" borderRadius="md" type="date" value={courseFilters.endDate} onChange={(e) => setCourseFilters((p) => ({ ...p, endDate: e.target.value }))} />
                  </FormControl>
                </SimpleGrid>
                <Flex gap={2} mt={3}>
                  <Button onClick={applyCourseFilters} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
                  <Button secondary onClick={resetCourseFilters} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
                </Flex>
              </Box>
            )}

            {coursesLoading ? (
              <Flex h="320px" justify="center" align="center" flexDir="column" gap={3}>
                <Spinner size="xl" color="#660066" />
                <ChakraText color="#667085" fontSize="14px">Loading course data…</ChakraText>
              </Flex>
            ) : coursesError ? (
              <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={6}>
                <ChakraText color="red.700" mb={3}>{coursesError}</ChakraText>
                <Button secondary onClick={() => fetchCourses(coursesPage, appliedCourseFilters)}>Try Again</Button>
              </Box>
            ) : (
              <>
                <TableContainer bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        {["Course", "Department", "Total Enrollments", "Active", "Completed", "Inactive", "Deactivated", "Dropout Rate", "Trend"].map((h) => (
                          <Th key={h} {...TableHeadStyle} py={3} px={4}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {coursesData.length === 0 ? (
                        <Tr><Td colSpan={9} textAlign="center" py={10} color="#667085" fontSize="14px">No data found</Td></Tr>
                      ) : (
                        coursesData.map((row, i) => (
                          <Tr key={row.course_id + "_" + i} _hover={{ bg: "#FAFAFA" }}>
                            <Td {...CellStyle} px={4} maxW="200px">
                              <ChakraText fontWeight="500" noOfLines={2} title={row.course_title}>{row.course_title}</ChakraText>
                            </Td>
                            <Td {...CellStyle} px={4}>{row.department_name || "—"}</Td>
                            <Td {...CellStyle} px={4} textAlign="center" fontWeight="600">{row.total_enrollments ?? row.enrollment_count ?? "—"}</Td>
                            <Td {...CellStyle} px={4} textAlign="center"><Badge colorScheme="blue" borderRadius="full" px={2}>{row.active_students ?? 0}</Badge></Td>
                            <Td {...CellStyle} px={4} textAlign="center"><Badge colorScheme="green" borderRadius="full" px={2}>{row.completed_students ?? 0}</Badge></Td>
                            <Td {...CellStyle} px={4} textAlign="center"><Badge colorScheme="orange" borderRadius="full" px={2}>{row.inactive_students ?? 0}</Badge></Td>
                            <Td {...CellStyle} px={4} textAlign="center"><Badge colorScheme="red" borderRadius="full" px={2}>{row.deactivated_students ?? 0}</Badge></Td>
                            <Td {...CellStyle} px={4} textAlign="center">{pct(row.dropout_rate)}</Td>
                            <Td {...CellStyle} px={4}>
                              <Badge colorScheme={trendScheme(row.enrollment_trend)} borderRadius="full" px={2}>{row.enrollment_trend || "—"}</Badge>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                <Paginator
                  page={coursesPage}
                  total={coursesTotal}
                  limit={LIMIT}
                  onPrev={() => { const p = coursesPage - 1; setCoursesPage(p); fetchCourses(p, appliedCourseFilters); }}
                  onNext={() => { const p = coursesPage + 1; setCoursesPage(p); fetchCourses(p, appliedCourseFilters); }}
                />
              </>
            )}
          </TabPanel>

          {/* ── Trends Tab ───────────────────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <Flex gap={2} mb={3} alignItems="center">
              <Button
                secondary
                onClick={() => setShowTrendFilters((v) => !v)}
                style={{ height: "32px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiFilter size={13} />
                Filters{trendBoxActiveCount > 0 ? ` (${trendBoxActiveCount})` : ""}
              </Button>
              {/* <Button onClick={applyTrendFilters} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
              <Button secondary onClick={resetTrendFilters} style={{ height: "32px", fontSize: "13px" }}>Reset</Button> */}
            </Flex>

            {showTrendFilters && (
              <Box bg="gray.50" border="1px solid #E4E7EC" borderRadius="md" p={4} mb={4}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Course</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchCourseOptions}
                      value={trendFilters.courseId}
                      onSelect={(opt) => setTrendFilters((p) => ({ ...p, courseId: opt ? opt.id : "" }))}
                      placeholder="Search course..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Department</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchDepartmentOptions}
                      value={trendFilters.departmentId}
                      onSelect={(opt) => setTrendFilters((p) => ({ ...p, departmentId: opt ? opt.id : "" }))}
                      placeholder="Search department..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>Instructor</FormLabel>
                    <EntityCombobox
                      fetchFn={fetchInstructorOptions}
                      value={trendFilters.instructorId}
                      onSelect={(opt) => setTrendFilters((p) => ({ ...p, instructorId: opt ? opt.id : "" }))}
                      placeholder="Search instructor..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>From Date</FormLabel>
                    <Input size="sm" borderRadius="md" type="date" value={trendFilters.startDate} onChange={(e) => setTrendFilters((p) => ({ ...p, startDate: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>To Date</FormLabel>
                    <Input size="sm" borderRadius="md" type="date" value={trendFilters.endDate} onChange={(e) => setTrendFilters((p) => ({ ...p, endDate: e.target.value }))} />
                  </FormControl>
                </SimpleGrid>
                <Flex gap={2} mt={3}>
                  <Button onClick={applyTrendFilters} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
                  <Button secondary onClick={resetTrendFilters} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
                </Flex>
              </Box>
            )}

            {trendsLoading ? (
              <Flex h="320px" justify="center" align="center" flexDir="column" gap={3}>
                <Spinner size="xl" color="#660066" />
                <ChakraText color="#667085" fontSize="14px">Loading trend data…</ChakraText>
              </Flex>
            ) : trendsError ? (
              <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={6}>
                <ChakraText color="red.700" mb={3}>{trendsError}</ChakraText>
                <Button secondary onClick={() => fetchTrends(appliedTrendFilters)}>Try Again</Button>
              </Box>
            ) : (
              <>
                <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" p={5} mb={5}>
                  <ChakraText fontWeight="600" color="#101928" mb={4}>Enrollment Growth Over Time</ChakraText>
                  {(trendsData?.enrollment_growth ?? []).length === 0 ? (
                    <Flex h="160px" align="center" justify="center"><ChakraText color="#9CA3AF" fontSize="14px">No enrollment growth data available</ChakraText></Flex>
                  ) : (
                    <Line data={enrollmentGrowthChart} options={chartOptions} height={80} />
                  )}
                </Box>

                <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" p={5} mb={5}>
                  <ChakraText fontWeight="600" color="#101928" mb={4}>Engagement Trend per Course</ChakraText>
                  {(trendsData?.engagement_trend_per_course ?? []).length === 0 ? (
                    <Flex h="160px" align="center" justify="center"><ChakraText color="#9CA3AF" fontSize="14px">No engagement trend data available</ChakraText></Flex>
                  ) : (
                    <Bar data={engagementTrendChart} options={barGroupedOptions} height={80} />
                  )}
                </Box>

                {/* <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                  <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" p={5}>
                    <ChakraText fontWeight="600" color="#101928" mb={4}>Dropout Patterns by Course</ChakraText>
                    {(trendsData?.dropout_patterns ?? []).length === 0 ? (
                      <Flex h="120px" align="center" justify="center"><ChakraText color="#9CA3AF" fontSize="14px">No dropout data available</ChakraText></Flex>
                    ) : (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th {...TableHeadStyle} py={2}>Course</Th>
                              <Th {...TableHeadStyle} py={2} textAlign="center">Dropouts</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(trendsData?.dropout_patterns ?? []).map((d, i) => (
                              <Tr key={d.course_id + "_" + i} _hover={{ bg: "#FAFAFA" }}>
                                <Td {...CellStyle} py={2}>{d.course_title}</Td>
                                <Td {...CellStyle} py={2} textAlign="center">
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
                      <Flex h="120px" align="center" justify="center"><ChakraText color="#9CA3AF" fontSize="14px">No activity data available</ChakraText></Flex>
                    ) : (
                      <TableContainer maxH="320px" overflowY="auto">
                        <Table variant="simple" size="sm">
                          <Thead position="sticky" top={0} zIndex={1} bg="white">
                            <Tr>
                              <Th {...TableHeadStyle} py={2}>Student</Th>
                              <Th {...TableHeadStyle} py={2}>Course</Th>
                              <Th {...TableHeadStyle} py={2} textAlign="center">Status</Th>
                              <Th {...TableHeadStyle} py={2} textAlign="center">Progress</Th>
                              <Th {...TableHeadStyle} py={2} textAlign="center">Days Inactive</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(trendsData?.activity_heatmap ?? []).map((d, i) => (
                              <Tr key={d.student_id + "_" + d.course_id + "_" + i} _hover={{ bg: "#FAFAFA" }}>
                                <Td {...CellStyle} py={2}>{d.student_name}</Td>
                                <Td {...CellStyle} py={2} maxW="140px">
                                  <ChakraText noOfLines={1} title={d.course_title}>{d.course_title}</ChakraText>
                                </Td>
                                <Td {...CellStyle} py={2} textAlign="center">
                                  <Badge colorScheme={engagementStatusScheme(d.status)} borderRadius="full" px={2} fontSize="11px">{d.status}</Badge>
                                </Td>
                                <Td {...CellStyle} py={2} textAlign="center">{pct(d.progress_percentage)}</Td>
                                <Td {...CellStyle} py={2} textAlign="center">
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
                </SimpleGrid> */}
              </>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AdminMainAreaWrapper>
  );
};

export const EnrollmentStatusReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <EnrollmentStatusReportPage {...props} />} />
);

export default EnrollmentStatusReportPage;
