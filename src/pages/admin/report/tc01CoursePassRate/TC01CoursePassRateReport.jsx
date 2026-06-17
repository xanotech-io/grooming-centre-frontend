import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  SimpleGrid,
  Badge,
  Input,
  Spinner as ChakraSpinner,
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
  FiTrendingUp,
  FiCheckCircle,
  FiBarChart2,
  FiUserX,
  FiFilter,
  FiChevronDown,
  FiX,
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

const TH = { fontSize: "12px", fontWeight: "600", color: "#667085", textTransform: "uppercase", bg: "#F9FAFB" };
const TD = { fontSize: "13px", color: "#344054", py: 3 };
const LIMIT = 20;

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
      (o) => o.label.toLowerCase().includes(q) || (o.sublabel ?? "").toLowerCase().includes(q),
    );
  }, [options, inputValue, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doFetch = useCallback(async (query) => {
    setLoading(true);
    try { setOptions(await fetchFn(query)); }
    catch { setOptions([]); }
    finally { setLoading(false); }
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
      <Flex border="1px solid" borderColor="gray.200" borderRadius="md" alignItems="center" px={2} bg="white" h="32px"
        _focusWithin={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #660066" }}>
        <Input border="none" px={0} size="sm" h="auto" _focus={{ boxShadow: "none" }}
          value={displayValue} onChange={handleInputChange} onFocus={handleFocus}
          placeholder={placeholder || "Search..."} readOnly={!!value} />
        {loading && <ChakraSpinner size="xs" color="gray.400" mr={1} />}
        {value ? (
          <Box as="button" type="button" onClick={() => { onSelect(null); setInputValue(""); setOptions([]); setIsOpen(false); }}
            color="gray.400" _hover={{ color: "gray.600" }} ml={1} flexShrink={0}><FiX size={12} /></Box>
        ) : (
          <Box color="gray.400" ml={1} flexShrink={0}><FiChevronDown size={12} /></Box>
        )}
      </Flex>
      {isOpen && (
        <Box position="absolute" top="calc(100% + 4px)" left={0} right={0} bg="white"
          border="1px solid #E2E8F0" borderRadius="md" boxShadow="md" zIndex={1500} maxH="220px" overflowY="auto">
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
            <Box key={opt.id} px={3} py="6px" cursor="pointer" _hover={{ bg: "purple.50" }}
              onMouseDown={(e) => { e.preventDefault(); onSelect(opt); setInputValue(""); setIsOpen(false); }}>
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
      <Box bg={`${iconColor}15`} p={2} borderRadius="lg"><Icon size={18} color={iconColor} /></Box>
      <ChakraText fontSize="14px" fontWeight="500" color="#667085">{label}</ChakraText>
    </Flex>
    <ChakraText fontSize="26px" fontWeight="700" color="#101928">{value ?? "—"}</ChakraText>
  </Box>
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

// ── Filter defaults ───────────────────────────────────────────────────────────

const defaultFilters = { instructorId: "", courseId: "", departmentId: "", startDate: "", endDate: "" };

// ── Main Component ────────────────────────────────────────────────────────────

const TC01CoursePassRateReport = () => {
  const [kpis, setKpis] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

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

  // ── Fetch ─────────────────────────────────────────────────────────────────────

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

  useEffect(() => { fetchReport(1, defaultFilters); }, [fetchReport]);

  const handleApply = () => { setAppliedFilters(filters); setPage(1); fetchReport(1, filters); };
  const handleReset = () => { setFilters(defaultFilters); setAppliedFilters(defaultFilters); setPage(1); fetchReport(1, defaultFilters); };

  const boxActiveCount = [filters.startDate, filters.endDate].filter(Boolean).length;

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
        <Button secondary onClick={() => fetchReport(page, appliedFilters)} style={{ flexShrink: 0 }}>Refresh</Button>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <KpiCard icon={FiTrendingUp} label="Overall Pass Rate" value={pct(kpis?.overall_pass_rate)} iconColor="#22C55E" />
        <KpiCard icon={FiCheckCircle} label="Completion Rate" value={pct(kpis?.overall_completion_rate)} iconColor="#3B82F6" />
        <KpiCard icon={FiBarChart2} label="Avg Course Score" value={kpis?.average_course_score != null ? `${kpis.average_course_score}` : "—"} iconColor="#660066" />
        <KpiCard icon={FiUserX} label="Dropout Rate" value={pct(kpis?.dropout_rate)} iconColor="#EF4444" />
      </SimpleGrid>

      {/* Search comboboxes + Filters toggle */}
      <Flex gap={3} mb={3} alignItems="flex-end" flexWrap="wrap">
        <Box minW="170px" flex="1" maxW="220px">
          <ChakraText fontSize="11px" fontWeight="500" color="#667085" mb={1}>Course</ChakraText>
          <EntityCombobox
            fetchFn={fetchCourseOptions}
            value={filters.courseId}
            onSelect={(opt) => setFilters((p) => ({ ...p, courseId: opt ? opt.id : "" }))}
            placeholder="Search course..."
          />
        </Box>
        <Box minW="150px" flex="1" maxW="190px">
          <ChakraText fontSize="11px" fontWeight="500" color="#667085" mb={1}>Department</ChakraText>
          <EntityCombobox
            fetchFn={fetchDepartmentOptions}
            value={filters.departmentId}
            onSelect={(opt) => setFilters((p) => ({ ...p, departmentId: opt ? opt.id : "" }))}
            placeholder="Search department..."
          />
        </Box>
        <Box minW="150px" flex="1" maxW="190px">
          <ChakraText fontSize="11px" fontWeight="500" color="#667085" mb={1}>Instructor</ChakraText>
          <EntityCombobox
            fetchFn={fetchInstructorOptions}
            value={filters.instructorId}
            onSelect={(opt) => setFilters((p) => ({ ...p, instructorId: opt ? opt.id : "" }))}
            placeholder="Search instructor..."
          />
        </Box>
        <Button
          secondary
          onClick={() => setShowFilters((v) => !v)}
          style={{ height: "32px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
        >
          <FiFilter size={13} />
          Filters{boxActiveCount > 0 ? ` (${boxActiveCount})` : ""}
        </Button>
      </Flex>

      {/* Collapsible filter box */}
      {showFilters && (
        <Box bg="gray.50" border="1px solid #E4E7EC" borderRadius="md" p={4} mb={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>From Date</FormLabel>
              <Input size="sm" borderRadius="md" type="date" value={filters.startDate} onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12px" fontWeight="500" color="#667085" mb={1}>To Date</FormLabel>
              <Input size="sm" borderRadius="md" type="date" value={filters.endDate} onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))} />
            </FormControl>
          </SimpleGrid>
          <Flex gap={2} mt={3}>
            <Button onClick={handleApply} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
            <Button secondary onClick={handleReset} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
          </Flex>
        </Box>
      )}

      {/* Apply/Reset when filter box hidden */}
      {!showFilters && (
        <Flex gap={2} mb={4}>
          <Button onClick={handleApply} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
          <Button secondary onClick={handleReset} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
        </Flex>
      )}

      {/* Table */}
      {loading ? (
        <Flex h="320px" justify="center" align="center" flexDir="column" gap={3}>
          <Spinner size="xl" color="#660066" />
          <ChakraText color="#667085" fontSize="14px">Loading course pass rate data…</ChakraText>
        </Flex>
      ) : error ? (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={6}>
          <ChakraText color="red.700" mb={3}>{error}</ChakraText>
          <Button secondary onClick={() => fetchReport(page, appliedFilters)} style={{ height: "32px", fontSize: "13px" }}>Try Again</Button>
        </Box>
      ) : (
        <>
          <TableContainer bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  {["Course Title", "Instructor", "Total Enrolled", "Completed", "Passed", "Failed", "Pass Rate (%)", "Avg. Score"].map((h) => (
                    <Th key={h} {...TH} py={3} px={4}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {rows.length === 0 ? (
                  <Tr><Td colSpan={8} textAlign="center" py={10} color="#667085" fontSize="14px">No data found</Td></Tr>
                ) : (
                  rows.map((row, i) => {
                    const passRate =
                      row.pass_rate != null
                        ? Number(row.pass_rate)
                        : row.completed > 0
                        ? (row.passed / row.completed) * 100
                        : null;
                    return (
                      <Tr key={`${row.course_id ?? row.course_title}_${i}`} _hover={{ bg: "#FAFAFA" }}>
                        <Td {...TD} px={4} maxW="220px">
                          <ChakraText fontWeight="500" noOfLines={2} title={row.course_title}>{row.course_title ?? "—"}</ChakraText>
                        </Td>
                        <Td {...TD} px={4}>{row.instructor_name ?? row.instructor ?? "—"}</Td>
                        <Td {...TD} px={4} textAlign="center" fontWeight="600">{row.total_enrolled ?? "—"}</Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge colorScheme="blue" borderRadius="full" px={2}>{row.completed ?? 0}</Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge colorScheme="green" borderRadius="full" px={2}>{row.passed ?? 0}</Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge colorScheme="red" borderRadius="full" px={2}>{row.failed ?? 0}</Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">
                          <Badge colorScheme={passRateColor(passRate)} borderRadius="full" px={2}>
                            {passRate != null ? `${passRate.toFixed(1)}%` : "—"}
                          </Badge>
                        </Td>
                        <Td {...TD} px={4} textAlign="center">{row.average_score != null ? row.average_score : "—"}</Td>
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
            onPrev={() => { const p = page - 1; setPage(p); fetchReport(p, appliedFilters); }}
            onNext={() => { const p = page + 1; setPage(p); fetchReport(p, appliedFilters); }}
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
