import { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  SimpleGrid,
  Badge,
  Select,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text as ChakraText,
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiBarChart2,
  FiUserX,
} from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Button, Heading, Spinner } from "../../../../components";
import {
  adminGetTC01CoursePassRateReport,
  adminListCoursesForReport,
  adminGetDepartmentListing,
  adminGetInstructorReportDirectory,
} from "../../../../services";

// ── Helpers ───────────────────────────────────────────────────────────────────

const pct = (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—");

const passRateColor = (rate) => {
  if (rate == null) return "gray";
  if (rate >= 80) return "green";
  if (rate >= 60) return "yellow";
  return "red";
};

const TH = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#667085",
  textTransform: "uppercase",
  bg: "#F9FAFB",
};
const TD = { fontSize: "13px", color: "#344054", py: 3 };

const LIMIT = 20;

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
          <Select
            size="sm"
            borderRadius="md"
            value={f.value}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={`All ${f.label}`}
          >
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Box>
      ) : (
        <Box key={f.key} minW="140px">
          <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</ChakraText>
          <Input
            size="sm"
            borderRadius="md"
            type="date"
            value={f.value}
            onChange={(e) => onChange(f.key, e.target.value)}
          />
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

const EmptyRow = ({ cols }) => (
  <Tr>
    <Td colSpan={cols} textAlign="center" py={10} color="#667085" fontSize="14px">
      No data found
    </Td>
  </Tr>
);

const LoadingBox = ({ label }) => (
  <Flex h="320px" justify="center" align="center" flexDir="column" gap={3}>
    <Spinner size="xl" color="#660066" />
    <ChakraText color="#667085" fontSize="14px">{label}</ChakraText>
  </Flex>
);

const ErrorBox = ({ message, onRetry }) => (
  <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={6}>
    <ChakraText color="red.700" mb={3}>{message}</ChakraText>
    <Button secondary onClick={onRetry} style={{ height: "32px", fontSize: "13px" }}>Try Again</Button>
  </Box>
);

// ── Filter defaults ───────────────────────────────────────────────────────────

const defaultFilters = {
  instructorId: "",
  courseId: "",
  departmentId: "",
  startDate: "",
  endDate: "",
};

// ── Main Component ────────────────────────────────────────────────────────────

const TC01CoursePassRateReport = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [kpis, setKpis] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  useEffect(() => {
    Promise.allSettled([
      adminListCoursesForReport(),
      adminGetDepartmentListing(),
      adminGetInstructorReportDirectory({ limit: 200 }),
    ]).then(([coursesRes, deptsRes, usersRes]) => {
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value?.rows ?? []);
      if (deptsRes.status === "fulfilled") setDepartments(deptsRes.value?.departments ?? []);
      if (usersRes.status === "fulfilled") setInstructors(usersRes.value?.data ?? []);
    });
  }, []);

  const fetchReport = useCallback(async (pg, f) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pg, limit: LIMIT };
      if (f.instructorId) params.instructorId = f.instructorId;
      if (f.courseId) params.courseId = f.courseId;
      if (f.departmentId) params.departmentId = f.departmentId;
      if (f.startDate) params.startDate = f.startDate;
      if (f.endDate) params.endDate = f.endDate;

      const res = await adminGetTC01CoursePassRateReport(params);
      const payload = res?.data ?? res;
      setRows(Array.isArray(payload?.courses) ? payload.courses : []);
      setTotal(payload?.total ?? 0);
      if (payload?.kpis) setKpis(payload.kpis);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load course pass rate report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(1, defaultFilters);
  }, [fetchReport]);

  const handleApply = () => {
    setAppliedFilters(filters);
    setPage(1);
    fetchReport(1, filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
    fetchReport(1, defaultFilters);
  };

  const filterDefs = [
    {
      key: "instructorId",
      label: "Instructor",
      type: "select",
      value: filters.instructorId,
      options: instructors.map((u) => ({
        value: u.id,
        label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
      })),
    },
    {
      key: "courseId",
      label: "Course",
      type: "select",
      value: filters.courseId,
      options: courses.map((c) => ({ value: c.id, label: c.title })),
    },
    {
      key: "departmentId",
      label: "Department",
      type: "select",
      value: filters.departmentId,
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    { key: "startDate", label: "From Date", type: "date", value: filters.startDate },
    { key: "endDate", label: "To Date", type: "date", value: filters.endDate },
  ];

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={6}>
        <Box>
          <Heading as="h2" size="md">TC01 – Course Completion & Pass Rate Report</Heading>
          <ChakraText fontSize="14px" color="#667085" mt={1}>
            Academic performance metrics: pass rates, completion rates, and score averages per course
          </ChakraText>
        </Box>
        <Button secondary onClick={() => fetchReport(page, appliedFilters)} style={{ flexShrink: 0 }}>
          Refresh
        </Button>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <KpiCard
          icon={FiTrendingUp}
          label="Overall Pass Rate"
          value={pct(kpis?.overall_pass_rate)}
          iconColor="#22C55E"
        />
        <KpiCard
          icon={FiCheckCircle}
          label="Completion Rate"
          value={pct(kpis?.overall_completion_rate)}
          iconColor="#3B82F6"
        />
        <KpiCard
          icon={FiBarChart2}
          label="Avg Course Score"
          value={kpis?.average_course_score != null ? `${kpis.average_course_score}` : "—"}
          iconColor="#660066"
        />
        <KpiCard
          icon={FiUserX}
          label="Dropout Rate"
          value={pct(kpis?.dropout_rate)}
          iconColor="#EF4444"
        />
      </SimpleGrid>

      {/* Filters */}
      <FilterBar
        filters={filterDefs}
        onChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
        onApply={handleApply}
        onReset={handleReset}
      />

      {/* Table */}
      {loading ? (
        <LoadingBox label="Loading course pass rate data…" />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => fetchReport(page, appliedFilters)} />
      ) : (
        <>
          <TableContainer bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  {[
                    "Course Title",
                    "Instructor",
                    "Total Enrolled",
                    "Completed",
                    "Passed",
                    "Failed",
                    "Pass Rate (%)",
                    "Avg. Score",
                  ].map((h) => (
                    <Th key={h} {...TH} py={3} px={4}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {rows.length === 0 ? (
                  <EmptyRow cols={8} />
                ) : (
                  rows.map((row, i) => {
                    const passRate =
                      row.pass_rate != null
                        ? Number(row.pass_rate)
                        : row.completed > 0
                        ? ((row.passed / row.completed) * 100)
                        : null;

                    return (
                      <Tr key={`${row.course_id ?? row.course_title}_${i}`} _hover={{ bg: "#FAFAFA" }}>
                        <Td {...TD} px={4} maxW="220px">
                          <ChakraText fontWeight="500" noOfLines={2} title={row.course_title}>
                            {row.course_title ?? "—"}
                          </ChakraText>
                        </Td>
                        <Td {...TD} px={4}>{row.instructor_name ?? row.instructor ?? "—"}</Td>
                        <Td {...TD} px={4} textAlign="center" fontWeight="600">
                          {row.total_enrolled ?? "—"}
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge colorScheme="blue" borderRadius="full" px={2}>
                            {row.completed ?? 0}
                          </Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge colorScheme="green" borderRadius="full" px={2}>
                            {row.passed ?? 0}
                          </Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge colorScheme="red" borderRadius="full" px={2}>
                            {row.failed ?? 0}
                          </Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge
                            colorScheme={passRateColor(passRate)}
                            borderRadius="full"
                            px={2}
                          >
                            {passRate != null ? `${passRate.toFixed(1)}%` : "—"}
                          </Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          {row.average_score != null ? row.average_score : "—"}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </TableContainer>
          <Paginator
            page={page}
            total={total}
            limit={LIMIT}
            onPrev={() => {
              const p = page - 1;
              setPage(p);
              fetchReport(p, appliedFilters);
            }}
            onNext={() => {
              const p = page + 1;
              setPage(p);
              fetchReport(p, appliedFilters);
            }}
          />
        </>
      )}
    </AdminMainAreaWrapper>
  );
};

export const TC01CoursePassRateReportRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <TC01CoursePassRateReport {...props} />} />
);

export default TC01CoursePassRateReport;
