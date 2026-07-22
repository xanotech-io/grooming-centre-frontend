import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Route } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  SimpleGrid,
  Skeleton,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFilter,
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
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  getSubmissionsReportSummary,
  getSubmissionsReport,
  adminGetCourseListing,
  adminGetStudents,
} from "../../../../services";
import { MOCK_SUBMISSIONS } from "../../../../services/http/endpoints/submissionsReport";
import SubmissionGradingModal from "./SubmissionGradingModal";
import { isSubmissionGraded, submissionStatusLabel } from "../../../../utils";
import dayjs from "dayjs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDateTime = (d) => (d ? dayjs(d).format("MMM D, YYYY h:mm A") : "—");

const PASS_THRESHOLD = 0.5;

const scoreResultOf = (row) => {
  if (row.score == null || row.maxScore == null) return null;
  return row.score / row.maxScore >= PASS_THRESHOLD ? "pass" : "fail";
};

const statusScheme = (status) => (isSubmissionGraded(status) ? "green" : "orange");

const typeLabel = (type) => {
  if (type === "assessment") return "Assessment";
  if (type === "exam") return "Exam";
  if (type === "project") return "Project";
  return type || "—";
};

const applyMockFilters = (filters, source) =>
  source.filter((r) => {
    if (filters.studentId && r.studentId !== filters.studentId) return false;
    if (filters.courseId && r.courseId !== filters.courseId) return false;
    if (filters.type && filters.type !== "all" && r.type !== filters.type)
      return false;
    if (
      filters.status &&
      filters.status !== "all" &&
      r.status !== filters.status
    )
      return false;
    if (
      filters.scoreResult &&
      filters.scoreResult !== "all" &&
      scoreResultOf(r) !== filters.scoreResult
    )
      return false;
    if (filters.startDate && filters.endDate) {
      const t = dayjs(r.submittedAt);
      if (
        t.isBefore(dayjs(filters.startDate), "day") ||
        t.isAfter(dayjs(filters.endDate), "day")
      )
        return false;
    }
    return true;
  });

const sortMockRows = (rows, sort) => {
  if (!sort.key) return rows;
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
};

const buildMockSummary = (filtered) => {
  const totalSubmissions = filtered.length;
  const totalGraded = filtered.filter((r) => r.status === "graded").length;
  const totalPending = totalSubmissions - totalGraded;
  const durations = filtered
    .filter((r) => r.gradingDurationMinutes != null)
    .map((r) => r.gradingDurationMinutes);
  const averageGradingDurationMinutes = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;
  return { totalSubmissions, totalGraded, totalPending, averageGradingDurationMinutes };
};

// ─── Entity Combobox (search-as-you-type picker) ───────────────────────────────

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
            onClick={() => {
              onSelect(null);
              setInputValue("");
              setOptions([]);
              setIsOpen(false);
            }}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            ml={1}
            flexShrink={0}
          >
            <FiX size={12} />
          </Box>
        ) : (
          <Box color="gray.400" ml={1} flexShrink={0}>
            <FiChevronDown size={12} />
          </Box>
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
              <Text fontSize="12px" color="gray.500">
                Loading...
              </Text>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <Text fontSize="12px" color="gray.500" px={3} py={2}>
              No results found
            </Text>
          )}
          {!loading &&
            filtered.map((opt) => (
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
                <Text fontSize="13px" fontWeight="500">
                  {opt.label}
                </Text>
                {opt.sublabel && (
                  <Text fontSize="11px" color="gray.500">
                    {opt.sublabel}
                  </Text>
                )}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  studentId: "",
  courseId: "",
  type: "all",
  status: "all",
  scoreResult: "all",
  startDate: "",
  endDate: "",
};

const LIMIT_OPTIONS = [10, 25, 50, 100];

const SubmissionsReportPage = () => {
  const toast = useToast();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  // Mutable mock dataset so grading actions persist across refetches while the
  // real /v1/submissions-report endpoints are still unavailable.
  const mockDataRef = useRef(MOCK_SUBMISSIONS.map((r) => ({ ...r })));

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dateError, setDateError] = useState("");

  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [sort, setSort] = useState({ key: "", dir: "asc" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchStudentOptions = useCallback(async (query) => {
    const res = await adminGetStudents({ search: query, limit: 50 });
    return (res?.students ?? []).map((s) => ({
      id: s.id ?? s.userId,
      label: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email,
      sublabel: s.email ?? null,
    }));
  }, []);

  const fetchCourseOptions = useCallback(async (query) => {
    const res = await adminGetCourseListing({ search: query, limit: 50 });
    return (res?.courses ?? []).map((c) => ({
      id: c.id,
      label: c.title,
    }));
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

  const buildParams = (f, page, limit, sort) => {
    const p = { page, limit };
    if (f.studentId) p.studentId = f.studentId;
    if (f.courseId) p.courseId = f.courseId;
    if (f.type !== "all") p.type = f.type;
    if (f.status !== "all") p.status = f.status;
    if (f.scoreResult !== "all") p.scoreResult = f.scoreResult;
    if (f.startDate && f.endDate) {
      p.startDate = f.startDate;
      p.endDate = f.endDate;
    }
    if (sort.key) {
      p.sortBy = sort.key;
      p.sortDir = sort.dir;
    }
    return p;
  };

  const fetchKpi = useCallback(
    (f) => {
      if (!validateDates(f.startDate, f.endDate)) return;
      setKpiLoading(true);
      getSubmissionsReportSummary(buildParams(f, 1, 1, { key: "" }))
        .then((res) => setKpiData(res?.summary ?? res))
        .catch(() => {
          console.warn(
            "[SubmissionsReport] GET /summary failed, using mock",
          );
          setKpiData(buildMockSummary(applyMockFilters(f, mockDataRef.current)));
        })
        .finally(() => setKpiLoading(false));
    },
    [validateDates],
  );

  const fetchTable = useCallback(
    (f, p, l, s) => {
      if (!validateDates(f.startDate, f.endDate)) return;
      setTableLoading(true);
      getSubmissionsReport(buildParams(f, p, l, s))
        .then((res) => {
          const d = res?.data ?? res;
          setRows(d?.data ?? []);
          setTotal(d?.total ?? 0);
        })
        .catch(() => {
          console.warn("[SubmissionsReport] GET /report failed, using mock");
          const filtered = sortMockRows(applyMockFilters(f, mockDataRef.current), s);
          const start = (p - 1) * l;
          setRows(filtered.slice(start, start + l));
          setTotal(filtered.length);
        })
        .finally(() => setTableLoading(false));
    },
    [validateDates],
  );

  useEffect(() => {
    fetchKpi(filters);
    fetchTable(filters, page, limit, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchKpi(newFilters);
    fetchTable(newFilters, 1, limit, sort);
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    if (key === "startDate" || key === "endDate") {
      const { startDate, endDate } = updated;
      if ((startDate && endDate) || (!startDate && !endDate)) {
        applyFilters(updated);
      } else {
        setFilters(updated);
        validateDates(updated.startDate, updated.endDate);
      }
      return;
    }
    applyFilters(updated);
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchTable(filters, newPage, limit, sort);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    fetchTable(filters, 1, newLimit, sort);
  };

  const handleRowClick = (row) => {
    setSelectedSubmission({ submissionId: row.submissionId, type: row.type });
    onModalOpen();
  };

  const handleGraded = (updated) => {
    const idx = mockDataRef.current.findIndex(
      (r) => r.submissionId === updated.submissionId,
    );
    if (idx >= 0) mockDataRef.current[idx] = { ...mockDataRef.current[idx], ...updated };

    setRows((prev) =>
      prev.map((r) => (r.submissionId === updated.submissionId ? { ...r, ...updated } : r)),
    );
    fetchKpi(filters);
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const filtered = sortMockRows(applyMockFilters(filters, mockDataRef.current), sort);
      const headers = [
        "Student",
        "Assessment",
        "Instructor",
        "Submitted",
        "Status",
        "Score",
        "Grade",
        "Remarks",
        "Grading Duration (min)",
        "Date Graded",
      ];
      const rowMapper = (r) => [
        r.studentName,
        r.title,
        r.instructorName,
        r.submittedAt,
        r.status,
        r.score,
        r.grade,
        r.remarks,
        r.gradingDurationMinutes,
        r.gradedAt,
      ];

      if (format === "csv") {
        const csv = [headers, ...filtered.map(rowMapper)]
          .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `submissions-report-${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "xlsx") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.aoa_to_sheet([headers, ...filtered.map(rowMapper)]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Submissions");
        XLSX.writeFile(wb, `submissions-report-${dayjs().format("YYYY-MM-DD")}.xlsx`);
      }
    } catch {
      toast({ title: "Export failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setExporting(false);
    }
  };

  const ENUM_FILTER_KEYS = ["type", "status", "scoreResult"];
  const isFilterActive = (key, value) =>
    ENUM_FILTER_KEYS.includes(key) ? value !== "all" : !!value;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    isFilterActive(k, v),
  ).length;
  const hasActiveFilters = activeFilterCount > 0;

  const SortIcon = ({ colKey }) => {
    if (sort.key !== colKey) return null;
    return sort.dir === "asc" ? (
      <FaSortAmountUp style={{ display: "inline", marginLeft: 4 }} />
    ) : (
      <FaSortAmountDown style={{ display: "inline", marginLeft: 4 }} />
    );
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/submissions">Submissions</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap={2}>
          <Button
            size="sm"
            secondary
            onClick={() => {
              fetchKpi(filters);
              fetchTable(filters, page, limit, sort);
            }}
            leftIcon={<FiRefreshCw />}
          >
            Refresh
          </Button>
          <Menu>
            <MenuButton
              as="button"
              disabled={exporting || rows.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: exporting || rows.length === 0 ? "#CBD5E0" : "#3182CE",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0 12px",
                height: "32px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: exporting || rows.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              <FiDownload size={14} />
              Export
              <FiChevronDown size={12} />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleExport("csv")}>Export CSV</MenuItem>
              <MenuItem onClick={() => handleExport("xlsx")}>Export Excel</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Heading level="2" mb={6}>
        Assessment & Project Submissions
      </Heading>

      {/* ── KPI Cards ── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        {kpiLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} height="100px" borderRadius="lg" />)
        ) : (
          <>
            <DashboardMetricCard
              title="Total Submissions"
              value={String(kpiData?.totalSubmissions ?? "—")}
            />
            <DashboardMetricCard
              title="Manual Marking Required"
              value={String(kpiData?.totalPending ?? "—")}
            />
            <DashboardMetricCard
              title="Total Graded"
              value={String(kpiData?.totalGraded ?? "—")}
            />
            <DashboardMetricCard
              title="Avg Grading Duration"
              value={
                kpiData?.averageGradingDurationMinutes != null
                  ? `${kpiData.averageGradingDurationMinutes} min`
                  : "—"
              }
            />
          </>
        )}
      </SimpleGrid>

      {/* ── Filter Toggle ── */}
      <Flex gap={3} mb={4} alignItems="center">
        <Button
          size="sm"
          secondary
          leftIcon={<FiFilter />}
          onClick={() => setShowFilters((v) => !v)}
          colorScheme={hasActiveFilters ? "blue" : "gray"}
          bg="white"
        >
          Filters{hasActiveFilters ? ` (${activeFilterCount})` : ""}
        </Button>
      </Flex>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <Box bg="gray.50" border="1px" borderColor="gray.200" p={4} borderRadius="md" mb={4}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }}
            gap={3}
          >
            <FormControl>
              <FormLabel fontSize="xs">Student</FormLabel>
              <EntityCombobox
                fetchFn={fetchStudentOptions}
                value={filters.studentId}
                onSelect={(opt) => handleFilterChange("studentId", opt ? opt.id : "")}
                placeholder="Search student..."
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs">Course</FormLabel>
              <EntityCombobox
                fetchFn={fetchCourseOptions}
                value={filters.courseId}
                onSelect={(opt) => handleFilterChange("courseId", opt ? opt.id : "")}
                placeholder="Search course..."
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs">Type</FormLabel>
              <Select
                size="sm"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="all">All</option>
                <option value="assessment">Assessment</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs">Submission Status</FormLabel>
              <Select
                size="sm"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Manual Marking Required</option>
                <option value="graded">Graded</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs">Score</FormLabel>
              <Select
                size="sm"
                value={filters.scoreResult}
                onChange={(e) => handleFilterChange("scoreResult", e.target.value)}
              >
                <option value="all">All</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </Select>
            </FormControl>

            <FormControl isInvalid={!!dateError}>
              <FormLabel fontSize="xs">Date Range</FormLabel>
              <Flex gap={1}>
                <Input
                  size="sm"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
                <Input
                  size="sm"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </Flex>
            </FormControl>
          </Grid>

          {dateError && (
            <Text color="red.500" fontSize="sm" mt={2}>
              {dateError}
            </Text>
          )}

          <Flex mt={3} gap={2}>
            <Button size="sm" secondary onClick={clearFilters}>
              Clear
            </Button>
          </Flex>
        </Box>
      )}

      {/* ── Table ── */}
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Flex justify="space-between" align="center" px={4} py={3} borderBottomWidth="1px">
          <Text fontWeight="semibold">
            Submissions
            {total > 0 && (
              <Text as="span" color="gray.500" fontWeight="normal" ml={2} fontSize="sm">
                ({total} total)
              </Text>
            )}
          </Text>
          <Select
            size="sm"
            width="80px"
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Flex>

        {tableLoading ? (
          <Box p={4}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="48px" mb={2} />
            ))}
          </Box>
        ) : rows.length === 0 ? (
          <Box p={10} textAlign="center">
            <Text color="gray.500">No submissions found for the selected filters.</Text>
          </Box>
        ) : (
          <TableContainer>
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Student Name</Th>
                  <Th>Assessment</Th>
                  <Th>Instructor</Th>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSort("submittedAt")}
                    _hover={{ color: "blue.600" }}
                  >
                    Submission Date <SortIcon colKey="submittedAt" />
                  </Th>
                  <Th>Status</Th>
                  <Th
                    isNumeric
                    cursor="pointer"
                    onClick={() => handleSort("score")}
                    _hover={{ color: "blue.600" }}
                  >
                    Score <SortIcon colKey="score" />
                  </Th>
                  <Th>Grade</Th>
                  <Th>Remarks</Th>
                  <Th
                    isNumeric
                    cursor="pointer"
                    onClick={() => handleSort("gradingDurationMinutes")}
                    _hover={{ color: "blue.600" }}
                  >
                    Grading Duration <SortIcon colKey="gradingDurationMinutes" />
                  </Th>
                  <Th>Date Graded</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => (
                  <Tr
                    key={r.submissionId}
                    _hover={{ bg: "gray.50" }}
                    cursor="pointer"
                    onClick={() => handleRowClick(r)}
                  >
                    <Td>
                      <Text fontWeight="medium">{r.studentName}</Text>
                    </Td>
                    <Td>
                      <Text noOfLines={2} maxW="220px">
                        {r.title}
                      </Text>
                      <Text fontSize="11px" color="gray.400">
                        {typeLabel(r.type)} · {r.courseTitle}
                      </Text>
                    </Td>
                    <Td>{r.instructorName || "—"}</Td>
                    <Td>{fmtDateTime(r.submittedAt)}</Td>
                    <Td>
                      <Badge colorScheme={statusScheme(r.status)} borderRadius="full" px={2}>
                        {submissionStatusLabel(r.status)}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      {r.score != null ? `${r.score} / ${r.maxScore ?? "—"}` : "—"}
                    </Td>
                    <Td>{r.grade || "—"}</Td>
                    <Td>
                      <Text noOfLines={1} maxW="180px">
                        {r.remarks || "—"}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      {r.gradingDurationMinutes != null ? `${r.gradingDurationMinutes} min` : "—"}
                    </Td>
                    <Td>{fmtDateTime(r.gradedAt)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {!tableLoading && total > 0 && (
          <Flex justify="space-between" align="center" px={4} py={3} borderTopWidth="1px">
            <Text fontSize="sm" color="gray.600">
              Page {page} of {totalPages} &mdash; {total} record{total !== 1 ? "s" : ""}
            </Text>
            <Flex gap={2}>
              <Box
                as="button"
                onClick={() => handlePageChange(page - 1)}
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
                onClick={() => handlePageChange(page + 1)}
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
        )}
      </Box>

      <SubmissionGradingModal
        submissionId={selectedSubmission?.submissionId}
        type={selectedSubmission?.type}
        isOpen={isModalOpen}
        onClose={onModalClose}
        onGraded={handleGraded}
      />
    </AdminMainAreaWrapper>
  );
};

export const SubmissionsReportPageRoute = (props) => (
  <Route {...props} component={SubmissionsReportPage} />
);

export default SubmissionsReportPage;
