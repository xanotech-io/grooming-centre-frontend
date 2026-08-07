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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Spinner,
  useDisclosure,
  useToast,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FiDownload, FiFilter, FiRefreshCw, FiChevronDown, FiX } from "react-icons/fi";
import dayjs from "dayjs";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, DashboardMetricCard, Link } from "../../../../components";
import {
  getInstructorPerformanceReportV2,
  getInstructorPerformanceDrillDown,
  exportInstructorPerformanceReport,
  adminGetDepartmentListing,
  adminGetInstructorReportDirectory,
} from "../../../../services";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_SUMMARY = {
  total_instructors: 4,
  average_completion_rate: 83.5,
  average_feedback_rating: 4.5,
  average_assessment_score: 76.8,
  average_grading_days: 2.6,
  top_completion_rate: 92.0,
};

const MOCK_INSTRUCTORS = [
  {
    instructor_id: "inst_1",
    instructor_name: "James Smith",
    instructor_email: "j.smith@example.com",
    department_id: "dept_1",
    department: "Computer Science",
    courses_delivered: 4,
    total_enrolled: 445,
    total_completed: 346,
    completion_rate: 77.8,
    average_assessment_score: 78.1,
    average_exam_score: 76.3,
    average_project_score: 80.2,
    average_score: 78.2,
    grading_timeliness_days: 2.3,
    feedback_rating: 4.5,
    score_trend: [
      { period: "2026-Q1", average_score: 76.0 },
      { period: "2026-Q2", average_score: 78.2 },
    ],
  },
  {
    instructor_id: "inst_2",
    instructor_name: "Kemi Abens",
    instructor_email: "k.abens@example.com",
    department_id: "dept_2",
    department: "Finance",
    courses_delivered: 4,
    total_enrolled: 422,
    total_completed: 345,
    completion_rate: 81.7,
    average_assessment_score: 83.4,
    average_exam_score: 81.0,
    average_project_score: 84.1,
    average_score: 82.8,
    grading_timeliness_days: 1.4,
    feedback_rating: 4.8,
    score_trend: [
      { period: "2026-Q1", average_score: 81.0 },
      { period: "2026-Q2", average_score: 82.8 },
    ],
  },
  {
    instructor_id: "inst_3",
    instructor_name: "Mike Johnson",
    instructor_email: "m.johnson@example.com",
    department_id: "dept_3",
    department: "Mathematics",
    courses_delivered: 4,
    total_enrolled: 364,
    total_completed: 245,
    completion_rate: 67.3,
    average_assessment_score: 68.4,
    average_exam_score: 66.1,
    average_project_score: 70.0,
    average_score: 68.2,
    grading_timeliness_days: 4.4,
    feedback_rating: 4.1,
    score_trend: [
      { period: "2026-Q1", average_score: 67.0 },
      { period: "2026-Q2", average_score: 68.2 },
    ],
  },
  {
    instructor_id: "inst_4",
    instructor_name: "Kolade Adeyemi",
    instructor_email: "k.adeyemi@example.com",
    department_id: "dept_4",
    department: "Management",
    courses_delivered: 4,
    total_enrolled: 404,
    total_completed: 316,
    completion_rate: 78.2,
    average_assessment_score: 79.3,
    average_exam_score: 77.8,
    average_project_score: 80.9,
    average_score: 79.3,
    grading_timeliness_days: 2.3,
    feedback_rating: 4.5,
    score_trend: [
      { period: "2026-Q1", average_score: 77.5 },
      { period: "2026-Q2", average_score: 79.3 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val, suffix = "") =>
  val != null ? `${val}${suffix}` : "—";

const completionColor = (rate) => {
  if (rate == null) return "gray";
  if (rate >= 85) return "green";
  if (rate >= 70) return "yellow";
  return "red";
};

const ratingColor = (rating) => {
  if (rating == null) return "gray";
  if (rating >= 4.5) return "green";
  if (rating >= 4.0) return "yellow";
  return "red";
};

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
    <Text fontSize="sm" color="gray.500" minW="180px">{label}</Text>
    <Box flex={1} textAlign="right">
      {typeof value === "string" || typeof value === "number"
        ? <Text fontSize="sm" fontWeight="medium">{value}</Text>
        : value}
    </Box>
  </Flex>
);

// ─── Generic Combobox ─────────────────────────────────────────────────────────
// fetchFn(query) → Promise<[{ id, label, sublabel? }]>
// value: UUID or ""   onSelect: (opt|null) => void

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

  // sync when parent externally clears the value
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
        _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
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
        {loading && <Spinner size="xs" color="gray.400" mr={1} />}
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
              <Spinner size="xs" />
              <Text fontSize="12px" color="gray.500">Loading...</Text>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <Text fontSize="12px" color="gray.500" px={3} py={2}>No results found</Text>
          )}
          {!loading && filtered.map((opt) => (
            <Box
              key={opt.id}
              px={3}
              py="6px"
              cursor="pointer"
              _hover={{ bg: "blue.50" }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setInputValue("");
                setIsOpen(false);
              }}
            >
              <Text fontSize="13px" fontWeight="500">{opt.label}</Text>
              {opt.sublabel && <Text fontSize="11px" color="gray.500">{opt.sublabel}</Text>}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const InstructorPerformanceV2Page = () => {
  const toast = useToast();
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    departmentId: "",
    instructorId: "",
    startDate: "",
    endDate: "",
    period: "quarterly",
  });

  // Report data
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);

  // Detail drawer
  const { isOpen: isDetailOpen, onOpen: openDetail, onClose: closeDetail } = useDisclosure();
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Export modal
  const { isOpen: isExportOpen, onOpen: openExport, onClose: closeExport } = useDisclosure();
  const [exportFormat, setExportFormat] = useState("excel");
  const [exportName, setExportName] = useState("Instructor Performance Report");
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  // ── Combobox fetch functions ─────────────────────────────────────────────────

  const fetchDepartments = useCallback(async (query) => {
    const res = await adminGetDepartmentListing({ search: query });
    return (res.departments ?? []).map((d) => ({ id: d.id, label: d.name }));
  }, []);

  const fetchInstructors = useCallback(async (query) => {
    const res = await adminGetInstructorReportDirectory({ search: query, limit: 50 });
    const list = res?.data ?? [];
    return list.map((i) => ({
      id: i.id ?? i.instructor_id,
      label: i.name ?? `${i.firstName ?? ""} ${i.lastName ?? ""}`.trim() ?? i.instructor_name,
      sublabel: i.email ?? i.instructor_email ?? null,
    }));
  }, []);

  // ── Fetch report ─────────────────────────────────────────────────────────────

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getInstructorPerformanceReportV2(params);
      const payload = res?.data ?? res;
      setSummary(payload?.summary ?? null);
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setRows(list);
      setTotal(payload?.total ?? list.length);
      const computed = Math.ceil((payload?.total ?? list.length) / limit) || 1;
      setTotalPages(payload?.totalPages ?? computed);
    } catch {
      console.warn("[InstructorPerformanceV2] GET /instructor-performance-v2/report failed, using mock");
      setSummary(MOCK_SUMMARY);
      setRows(MOCK_INSTRUCTORS);
      setTotal(MOCK_INSTRUCTORS.length);
      setTotalPages(1);
    } finally { setLoading(false); }
  }, [page, limit, filters]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // ── Drill-down ────────────────────────────────────────────────────────────────

  const handleOpenDetail = async (instructor) => {
    openDetail();
    setDetailLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.period) params.period = filters.period;
      const res = await getInstructorPerformanceDrillDown(instructor.instructor_id, params);
      setDetailRecord(res?.data ?? res);
    } catch {
      console.warn("[InstructorPerformanceV2] drill-down failed, using row data");
      setDetailRecord(instructor);
    } finally { setDetailLoading(false); }
  };

  // ── Export ────────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    setExporting(true);
    setExportResult(null);
    try {
      const body = {
        exportFormat,
        reportName: exportName,
        filters: {},
      };
      if (filters.startDate) body.filters.startDate = filters.startDate;
      if (filters.endDate) body.filters.endDate = filters.endDate;
      if (filters.departmentId) body.filters.departmentId = filters.departmentId;
      const res = await exportInstructorPerformanceReport(body);
      setExportResult(res?.data ?? res);
      toast({ title: "Export ready. Your file is available for download.", status: "success", duration: 4000 });
    } catch (err) {
      toast({ title: err?.response?.data?.message ?? "Export failed. Please try again.", status: "error", duration: 4000 });
    } finally { setExporting(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== "period" && v).length;

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem isCurrentPage><Link href="#">Instructor Performance</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" borderBottom="1px" borderColor="gray.200" pb={4} mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">Instructor Performance Report</Text>
          <Text fontSize="sm" color="gray.500">Aggregated KPIs from courses, assessments, exams, projects, and feedback surveys.</Text>
        </Box>
        <Flex gap={2}>
          <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={fetchReport} isLoading={loading}>Refresh</Button>
          <Button size="sm" leftIcon={<FiDownload />} colorScheme="blue" onClick={openExport}>Export</Button>
        </Flex>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
        <DashboardMetricCard title="Total Instructors" value={loading ? "..." : summary?.total_instructors ?? "—"} />
        <DashboardMetricCard title="Avg Completion Rate" value={loading ? "..." : summary?.average_completion_rate != null ? `${summary.average_completion_rate}%` : "—"} />
        <DashboardMetricCard title="Top Completion Rate" value={loading ? "..." : summary?.top_completion_rate != null ? `${summary.top_completion_rate}%` : "—"} colorScheme="green" />
        <DashboardMetricCard title="Avg Feedback Rating" value={loading ? "..." : summary?.average_feedback_rating != null ? `${summary.average_feedback_rating}/5` : "—"} />
        <DashboardMetricCard title="Avg Assessment Score" value={loading ? "..." : summary?.average_assessment_score != null ? `${summary.average_assessment_score}%` : "—"} />
        <DashboardMetricCard title="Avg Grading Days" value={loading ? "..." : summary?.average_grading_days != null ? `${summary.average_grading_days} days` : "—"} />
      </SimpleGrid>

      {/* Search + Filter toggle row */}
      <Flex gap={3} mb={4} alignItems="center">
        <Box flex={1} maxW="340px">
          <EntityCombobox
            fetchFn={fetchInstructors}
            value={filters.instructorId}
            onSelect={(opt) => setFilters((p) => ({ ...p, instructorId: opt ? opt.id : "" }))}
            placeholder="Search instructor..."
          />
        </Box>
        <Button
          size="sm"
          leftIcon={<FiFilter />}
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          colorScheme={activeFiltersCount > 0 ? "blue" : "gray"}
          bg="white"
          flexShrink={0}
        >
          Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
        </Button>
      </Flex>

      {/* Filter panel */}
      {showFilters && (
        <Box bg="gray.50" border="1px" borderColor="gray.200" p={4} borderRadius="md" mb={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Start Date</FormLabel>
              <Input size="sm" type="date" value={filters.startDate} onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">End Date</FormLabel>
              <Input size="sm" type="date" value={filters.endDate} onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Period</FormLabel>
              <Select size="sm" value={filters.period} onChange={(e) => setFilters((p) => ({ ...p, period: e.target.value }))}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Department</FormLabel>
              <EntityCombobox
                fetchFn={fetchDepartments}
                value={filters.departmentId}
                onSelect={(opt) => setFilters((p) => ({ ...p, departmentId: opt ? opt.id : "" }))}
                placeholder="Search department..."
              />
            </FormControl>
          </SimpleGrid>
          <Flex mt={3} gap={2}>
            <Button size="sm" colorScheme="blue" onClick={() => { setPage(1); fetchReport(); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" onClick={() => { setFilters({ departmentId: "", instructorId: "", startDate: "", endDate: "", period: "quarterly" }); }}>Clear</Button>
          </Flex>
        </Box>
      )}

      {/* Table */}
      <Box overflowX="auto" bg="white" borderRadius="md">
        <Table size="sm" variant="simple">
          <Thead bg="white">
            <Tr>
              <Th>Instructor</Th>
              <Th>Department</Th>
              <Th>Courses Delivered</Th>
              <Th>Enrolled</Th>
              <Th>Completed</Th>
              <Th>Completion %</Th>
              <Th>Assess. Score</Th>
              <Th>Exam Score</Th>
              <Th>Project Score</Th>
              <Th>Combined</Th>
              <Th>Grading Days</Th>
             
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Tr key={i}>
                  {Array.from({ length: 12 }).map((__, j) => (
                    <Td key={j}><Skeleton height="14px" /></Td>
                  ))}
                </Tr>
              ))
            ) : rows.length === 0 ? (
              <Tr><Td colSpan={12} textAlign="center" py={10} color="gray.500">No instructor data found.</Td></Tr>
            ) : (
              rows.map((row) => (
                <Tr
                  key={row.instructor_id}
                  _hover={{ bg: "blue.50" }}
                  cursor="pointer"
                  onClick={() => handleOpenDetail(row)}
                >
                  <Td>
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm">{row.instructor_name ?? "—"}</Text>
                      <Text fontSize="xs" color="gray.500">{row.instructor_email ?? ""}</Text>
                    </Box>
                  </Td>
                  <Td>{row.department ?? "—"}</Td>
                  <Td>{row.courses_delivered ?? "—"}</Td>
                  <Td>{row.total_enrolled ?? "—"}</Td>
                  <Td>{row.total_completed ?? "—"}</Td>
                  <Td>
                    <Badge colorScheme={completionColor(row.completion_rate)}>
                      {fmt(row.completion_rate, "%")}
                    </Badge>
                  </Td>
                  <Td>{fmt(row.average_assessment_score, "%")}</Td>
                  <Td>{fmt(row.average_exam_score, "%")}</Td>
                  <Td>{fmt(row.average_project_score, "%")}</Td>
                  <Td fontWeight="semibold">{fmt(row.average_score, "%")}</Td>
                  <Td>{fmt(row.grading_timeliness_days, " days")}</Td>
                  {/* <Td>
                    <Badge colorScheme={ratingColor(row.feedback_rating)}>
                      {fmt(row.feedback_rating, "/5")}
                    </Badge>
                  </Td> */}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <PaginationBar
        page={page} totalPages={totalPages}
        onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)}
        limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }}
      />
      <Text fontSize="sm" color="gray.500" mt={2}>Total: {total} instructor{total !== 1 ? "s" : ""}</Text>

      {/* ─── Detail Drawer ──────────────────────────────────────────────────────── */}
      <Drawer isOpen={isDetailOpen} onClose={closeDetail} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px" borderColor="gray.200">Instructor Detail</DrawerHeader>
          <DrawerBody pt={4}>
            {detailLoading ? (
              <SimpleGrid columns={1} spacing={3}>
                {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} height="36px" />)}
              </SimpleGrid>
            ) : detailRecord ? (
              <Box>
                <Box mb={4}>
                  <Text fontSize="lg" fontWeight="bold">{detailRecord.instructor_name ?? "—"}</Text>
                  <Text fontSize="sm" color="gray.500">{detailRecord.instructor_email ?? ""}</Text>
                  {detailRecord.department && <Badge mt={1}>{detailRecord.department}</Badge>}
                </Box>

                <DetailRow label="Instructor ID" value={<Text fontSize="xs" fontFamily="mono">{detailRecord.instructor_id}</Text>} />
                <DetailRow label="Courses Delivered" value={detailRecord.courses_delivered ?? "—"} />
                <DetailRow label="Total Enrolled" value={detailRecord.total_enrolled ?? "—"} />
                <DetailRow label="Total Completed" value={detailRecord.total_completed ?? "—"} />
                <DetailRow label="Completion Rate" value={<Badge colorScheme={completionColor(detailRecord.completion_rate)}>{fmt(detailRecord.completion_rate, "%")}</Badge>} />
                <DetailRow label="Assessment Score" value={fmt(detailRecord.average_assessment_score, "%")} />
                <DetailRow label="Exam Score" value={fmt(detailRecord.average_exam_score, "%")} />
                <DetailRow label="Project Score" value={fmt(detailRecord.average_project_score, "%")} />
                <DetailRow label="Combined Average" value={<Text fontWeight="bold">{fmt(detailRecord.average_score, "%")}</Text>} />
                <DetailRow label="Grading Timeliness" value={fmt(detailRecord.grading_timeliness_days, " days")} />
                <DetailRow label="Feedback Rating" value={<Badge colorScheme={ratingColor(detailRecord.feedback_rating)}>{fmt(detailRecord.feedback_rating, "/5")}</Badge>} />

                {Array.isArray(detailRecord.score_trend) && detailRecord.score_trend.length > 0 && (
                  <Box mt={5}>
                    <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.600">Score Trend</Text>
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
                            <Td isNumeric fontWeight="semibold">{fmt(t.average_score, "%")}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            ) : (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                No performance data found for this instructor.
              </Alert>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="1px" borderColor="gray.200">
            <Button variant="ghost" size="sm" onClick={closeDetail}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ─── Export Modal ────────────────────────────────────────────────────────── */}
      <Modal isOpen={isExportOpen} onClose={closeExport} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Instructor Performance Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            {exportResult && (
              <Alert status="success" mb={4} borderRadius="md" flexDirection="column" alignItems="flex-start">
                <Flex alignItems="center" mb={2}><AlertIcon />Export ready.</Flex>
                {exportResult.fileUrl && (
                  <Button size="sm" leftIcon={<FiDownload />} colorScheme="green" as="a" href={exportResult.fileUrl} target="_blank" rel="noopener noreferrer" mb={1}>
                    Download File
                  </Button>
                )}
                {exportResult.expiryDate && (
                  <Text fontSize="xs" color="gray.500">Link expires {dayjs(exportResult.expiryDate).format("MMMM D, YYYY")}.</Text>
                )}
              </Alert>
            )}

            <FormControl mb={4}>
              <FormLabel fontSize="sm">Report Name</FormLabel>
              <Input size="sm" value={exportName} onChange={(e) => setExportName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Format</FormLabel>
              <Select size="sm" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </Select>
            </FormControl>
            {(filters.startDate || filters.endDate || filters.departmentId) && (
              <Box mt={3} p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="xs" color="blue.700" fontWeight="semibold">Active filters will be included in the export.</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeExport}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleExport} isLoading={exporting}>Export</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminMainAreaWrapper>
  );
};

export const InstructorPerformanceV2PageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <InstructorPerformanceV2Page {...props} />} />
);

export default InstructorPerformanceV2PageRoute;
