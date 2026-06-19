import { useCallback, useEffect, useRef, useState } from "react";
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
  Collapse,
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiBarChart2,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Button, Heading, Spinner } from "../../../../components";
import {
  adminGetEnrollmentStatusStudents,
  adminGetEnrollmentStatusCourses,
  adminGetCourseListing,
  adminGetDepartmentListing,
  adminGetInstructorReportDirectory,
} from "../../../../services";
import dayjs from "dayjs";

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

const SearchableSelect = ({ value, options, onChange, placeholder }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    setQuery(value ? selectedLabel : "");
  }, [value, selectedLabel]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery(value ? selectedLabel : "");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, selectedLabel]);

  return (
    <Box ref={containerRef} position="relative">
      <Input
        size="md"
        borderRadius="md"
        bg="white"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={200}
          bg="white"
          border="1px solid #E4E7EC"
          borderRadius="md"
          boxShadow="md"
          maxH="400px"
          overflowY="auto"
          mt="2px"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="#667085">No results</Box>
          ) : (
            filtered.map((o) => (
              <Box
                key={o.value}
                px={3}
                py="7px"
                fontSize="13px"
                cursor="pointer"
                bg={o.value === value ? "#F3E8FF" : "white"}
                _hover={{ bg: o.value === value ? "#F3E8FF" : "#F9FAFB" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setQuery(o.label);
                  setIsOpen(false);
                }}
              >
                {o.label}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

const CollapsibleFilterBar = ({ filters, onChange, onApply, onReset, isOpen, onToggle }) => {
  const activeCount = filters.filter((f) => f.value && f.value !== "").length;
  return (
    <Box mb={5}>
      <Flex align="center" gap={2}>
        <Box
          as="button"
          onClick={onToggle}
          display="inline-flex"
          alignItems="center"
          gap={2}
          px={3}
          h="34px"
          border="1px solid #D0D5DD"
          borderRadius="md"
          bg="white"
          fontSize="13px"
          fontWeight="500"
          color="#344054"
          cursor="pointer"
          _hover={{ bg: "#F9FAFB" }}
          transition="background 0.15s"
        >
          <FiFilter size={14} />
          Filter
          {activeCount > 0 && (
            <Box
              as="span"
              bg="#660066"
              color="white"
              borderRadius="full"
              fontSize="11px"
              fontWeight="600"
              px={1.5}
              py={0}
              lineHeight="18px"
              minW="18px"
              textAlign="center"
            >
              {activeCount}
            </Box>
          )}
          {isOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
        </Box>
        {activeCount > 0 && !isOpen && (
          <ChakraText
            as="button"
            fontSize="12px"
            color="#660066"
            cursor="pointer"
            textDecoration="underline"
            onClick={onReset}
            bg="transparent"
            border="none"
          >
            Clear filters
          </ChakraText>
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ overflow: "visible" }}>
        <Box
          mt={2}
          p={4}
          bg="#FAFAFA"
          border="1px solid #E4E7EC"
          borderRadius="lg"
          overflow="visible"
        >
          <Flex gap={3} flexWrap="wrap" align="flex-end">
            {filters.map((f) =>
              f.type === "searchable-select" ? (
                <Box key={f.key} minW="200px">
                  <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</ChakraText>
                  <SearchableSelect
                    value={f.value}
                    options={f.options}
                    onChange={(val) => onChange(f.key, val)}
                    placeholder={`Search ${f.label}…`}
                  />
                </Box>
              ) : f.type === "select" ? (
                <Box key={f.key} minW="160px">
                  <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</ChakraText>
                  <Select size="sm" borderRadius="md" value={f.value} onChange={(e) => onChange(f.key, e.target.value)} placeholder={`All ${f.label}`} bg="white">
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Box>
              ) : (
                <Box key={f.key} minW="140px">
                  <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</ChakraText>
                  <Input size="sm" borderRadius="md" type="date" value={f.value} onChange={(e) => onChange(f.key, e.target.value)} bg="white" />
                </Box>
              )
            )}
            <Flex gap={2} mb="1px">
              <Button onClick={() => { onApply(); onToggle(); }} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
              <Button secondary onClick={onReset} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
            </Flex>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
};

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

// ── Filter defaults ───────────────────────────────────────────────────────────

const defaultStudentFilters = { courseId: "", departmentId: "", instructorId: "", studentStatus: "", engagementStatus: "", startDate: "", endDate: "" };
const defaultCourseFilters = { courseId: "", departmentId: "", instructorId: "", startDate: "", endDate: "" };

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
  // ── Filter options ────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // ── Enrollment KPIs ───────────────────────────────────────────────────────
  const [enrollmentKpis, setEnrollmentKpis] = useState(null);

  // ── Students tab ──────────────────────────────────────────────────────────
  const [studentsData, setStudentsData] = useState([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [studentFilters, setStudentFilters] = useState(defaultStudentFilters);
  const [appliedStudentFilters, setAppliedStudentFilters] = useState(defaultStudentFilters);

  // ── Filter panel open states ─────────────────────────────────────────────
  const [studentsFilterOpen, setStudentsFilterOpen] = useState(false);
  const [coursesFilterOpen, setCoursesFilterOpen] = useState(false);

  // ── Courses tab ───────────────────────────────────────────────────────────
  const [coursesData, setCoursesData] = useState([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [courseFilters, setCourseFilters] = useState(defaultCourseFilters);
  const [appliedCourseFilters, setAppliedCourseFilters] = useState(defaultCourseFilters);

  // ── Load filter option lists ──────────────────────────────────────────────

  useEffect(() => {
    Promise.allSettled([
      adminGetCourseListing({ page: 1, limit: 200 }),
      adminGetDepartmentListing(),
      adminGetInstructorReportDirectory({ limit: 200 }),
    ]).then(([coursesRes, deptsRes, usersRes]) => {
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value?.courses ?? []);
      if (deptsRes.status === "fulfilled") setDepartments(deptsRes.value?.departments ?? []);
      if (usersRes.status === "fulfilled") setInstructors(usersRes.value?.data ?? []);
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

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStudents(1, defaultStudentFilters);
    fetchCourses(1, defaultCourseFilters);
  }, [fetchStudents, fetchCourses]);

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
    setStudentsFilterOpen(false);
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
    setCoursesFilterOpen(false);
    fetchCourses(1, defaultCourseFilters);
  };

  const handleRefresh = () => {
    fetchStudents(studentsPage, appliedStudentFilters);
    fetchCourses(coursesPage, appliedCourseFilters);
  };

  // ── Filter option lists ───────────────────────────────────────────────────

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const instructorOptions = instructors.map((u) => ({
    value: u.id,
    label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
  }));

  const sharedFilterDefs = (filters) => [
    { key: "courseId", label: "Course", type: "searchable-select", value: filters.courseId, options: courseOptions },
    { key: "departmentId", label: "Department", type: "searchable-select", value: filters.departmentId, options: departmentOptions },
    { key: "instructorId", label: "Instructor", type: "searchable-select", value: filters.instructorId, options: instructorOptions },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={6}>
        <Box>
          <Heading as="h2" size="md">Course Completion & Pass Rate Report</Heading>
          <ChakraText fontSize="14px" color="#667085" mt={1}>
            Enrollment status, pass rates, and completion data in one view
          </ChakraText>
        </Box>
        <Button secondary onClick={handleRefresh} style={{ flexShrink: 0 }}>Refresh</Button>
      </Flex>

      {/* KPI Cards */}
      {enrollmentKpis && (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 3 }} spacing={4} mb={6}>
          <KpiCard icon={FiCheckCircle} label="Completed" value={enrollmentKpis.total_completed_students?.toLocaleString()} iconColor="#059669" />
          <KpiCard icon={FiBarChart2} label="Avg Completion Rate" value={pct(enrollmentKpis.average_course_completion_rate)} iconColor="#8B5CF6" />
          <KpiCard icon={FiTrendingUp} label="Overall Dropout Rate" value={pct(enrollmentKpis.overall_dropout_rate)} iconColor="#6B7280" />
        </SimpleGrid>
      )}

      {/* Tabs */}
      <Tabs colorScheme="purple" variant="enclosed">
        <TabList mb={0} borderBottom="1px solid #E4E7EC">
          {["Students", "Courses"].map((label) => (
            <Tab key={label} fontSize="14px" fontWeight="500" _selected={{ color: "#660066", borderColor: "#660066", borderBottomColor: "white" }}>
              {label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {/* ── Students Tab ──────────────────────────────────────────────── */}
          <TabPanel p={0} pt={5}>
            <CollapsibleFilterBar
              isOpen={studentsFilterOpen}
              onToggle={() => setStudentsFilterOpen((v) => !v)}
              filters={[
                ...sharedFilterDefs(studentFilters),
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
            <CollapsibleFilterBar
              isOpen={coursesFilterOpen}
              onToggle={() => setCoursesFilterOpen((v) => !v)}
              filters={[
                ...sharedFilterDefs(courseFilters),
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
                        {["Course", "Department", "Total Enrolled", "Active", "Completed", "Completion Rate", "Pass Rate", "Inactive", "Deactivated", "Dropout Rate", "Trend"].map((h) => (
                          <Th key={h} {...TH} py={3} px={4}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {coursesData.length === 0 ? (
                        <EmptyRow cols={11} />
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
                                <Badge colorScheme={completionColor(row.pass_rate)} borderRadius="full" px={2}>
                                  {pct(row.pass_rate)}
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
        </TabPanels>
      </Tabs>
    </AdminMainAreaWrapper>
  );
};

export const CourseCompletionReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CourseCompletionReportPage {...props} />} />
);

export default CourseCompletionReportPage;
