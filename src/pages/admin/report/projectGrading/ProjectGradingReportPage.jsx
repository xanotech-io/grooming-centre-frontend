import { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {
  Badge,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  FiChevronLeft,
  FiChevronRight,
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
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  getProjectGradingSummary,
  getProjectGradingReport,
  getProjectGradingDetail,
  adminGetCourseListing,
  adminGetInstructorReportDirectory,
} from "../../../../services";
import dayjs from "dayjs";

// ─── Mock Data (fallback when API is unavailable) ─────────────────────────────
// TODO: remove once GET /v1/project-grading-v2/summary and /report are live

const MOCK_SUMMARY = {
  totalProjects: 12,
  totalSubmissions: 320,
  gradedSubmissions: 290,
  pendingGrading: 30,
  averageProjectScore: 79,
  feedbackCoverage: 91,
};

const MOCK_PROJECTS = [
  {
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
    projectTitle: "Case Study 1 – Data Privacy",
    moduleTitle: "Module 3 – Privacy",
    courseId: "course-001",
    courseTitle: "Data Privacy Fundamentals",
    instructorId: "inst-001",
    instructorName: "Dr. Jane Smith",
    totalSubmissions: 30,
    graded: 28,
    pending: 2,
    averageGrade: 80,
    maxGrade: 100,
    gradingCompletionPercentage: 93,
    feedbackProvidedPercentage: 90,
    submissionDeadline: "2026-02-15",
    projectStatus: "published",
    gradingStatus: "In Progress",
  },
  {
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa2",
    projectTitle: "Research Paper – Cyber Ethics",
    moduleTitle: "Module 1 – Ethics",
    courseId: "course-002",
    courseTitle: "Cybersecurity Essentials",
    instructorId: "inst-002",
    instructorName: "Prof. Alan Brown",
    totalSubmissions: 45,
    graded: 45,
    pending: 0,
    averageGrade: 74,
    maxGrade: 100,
    gradingCompletionPercentage: 100,
    feedbackProvidedPercentage: 95,
    submissionDeadline: "2026-01-30",
    projectStatus: "published",
    gradingStatus: "Completed",
  },
  {
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa3",
    projectTitle: "Group Project – Network Design",
    moduleTitle: "Module 5 – Infrastructure",
    courseId: "course-003",
    courseTitle: "Network Administration",
    instructorId: "inst-001",
    instructorName: "Dr. Jane Smith",
    totalSubmissions: 20,
    graded: 5,
    pending: 15,
    averageGrade: 65,
    maxGrade: 100,
    gradingCompletionPercentage: 25,
    feedbackProvidedPercentage: 40,
    submissionDeadline: "2026-03-10",
    projectStatus: "published",
    gradingStatus: "In Progress",
  },
  {
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa4",
    projectTitle: "Capstone – System Analysis",
    moduleTitle: "Module 8 – Capstone",
    courseId: "course-002",
    courseTitle: "Cybersecurity Essentials",
    instructorId: "inst-003",
    instructorName: "Ms. Rita Okonkwo",
    totalSubmissions: 18,
    graded: 0,
    pending: 18,
    averageGrade: 0,
    maxGrade: 100,
    gradingCompletionPercentage: 0,
    feedbackProvidedPercentage: 0,
    submissionDeadline: "2026-04-01",
    projectStatus: "published",
    gradingStatus: "Not Started",
  },
  {
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa5",
    projectTitle: "Draft Project – Pending Review",
    moduleTitle: "Module 2 – Introduction",
    courseId: "course-001",
    courseTitle: "Data Privacy Fundamentals",
    instructorId: "inst-002",
    instructorName: "Prof. Alan Brown",
    totalSubmissions: 0,
    graded: 0,
    pending: 0,
    averageGrade: 0,
    maxGrade: 100,
    gradingCompletionPercentage: 0,
    feedbackProvidedPercentage: 0,
    submissionDeadline: "2026-05-01",
    projectStatus: "draft",
    gradingStatus: "Not Started",
  },
];

const MOCK_REPORT = {
  total: MOCK_PROJECTS.length,
  page: 1,
  limit: 50,
  recordCount: MOCK_PROJECTS.length,
  data: MOCK_PROJECTS,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) => (d ? dayjs(d).format("MMM D, YYYY") : "—");

const progressColor = (pct) => {
  if (pct >= 80) return "green";
  if (pct >= 50) return "yellow";
  return "red";
};

const gradingStatusScheme = (status) => {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "yellow";
  return "gray";
};

const projectStatusScheme = (status) => {
  if (status === "published") return "blue";
  if (status === "archived") return "blackAlpha";
  return "gray";
};

const buildSummaryParams = ({ courseId, instructorId, startDate, endDate }) => {
  const p = {};
  if (courseId) p.courseId = courseId;
  if (instructorId) p.instructorId = instructorId;
  if (startDate && endDate) {
    p.startDate = startDate;
    p.endDate = endDate;
  }
  return p;
};

const buildReportParams = (filters, page, limit, sort) => {
  const p = { page, limit };
  if (filters.courseId) p.courseId = filters.courseId;
  if (filters.instructorId) p.instructorId = filters.instructorId;
  if (filters.startDate && filters.endDate) {
    p.startDate = filters.startDate;
    p.endDate = filters.endDate;
  }
  if (filters.gradingStatus && filters.gradingStatus !== "all")
    p.gradingStatus = filters.gradingStatus;
  if (filters.projectId) p.projectId = filters.projectId;
  if (sort.key) {
    p.sortBy = sort.key;
    p.sortDir = sort.dir;
  }
  return p;
};

// ─── Progress Cell ─────────────────────────────────────────────────────────────

const ProgressCell = ({ value }) => {
  const pct = Math.round(value ?? 0);
  return (
    <Box minW="100px">
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs">{pct}%</Text>
      </Flex>
      <Progress
        size="sm"
        value={pct}
        colorScheme={progressColor(pct)}
        borderRadius="full"
      />
    </Box>
  );
};

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

const DetailDrawer = ({ projectId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isOpen || !projectId) return;
    setData(null);
    setNotFound(false);
    setLoading(true);
    getProjectGradingDetail(projectId)
      .then((res) => setData(res?.data ?? res))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          // TODO: endpoint GET /v1/project-grading-v2/report/{id} not yet live — using mock
          console.warn(
            "[ProjectGrading] /report/:id failed, falling back to mock data",
          );
          const mock =
            MOCK_PROJECTS.find((p) => p.projectId === projectId) ??
            MOCK_PROJECTS[0];
          setData(mock);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, projectId]);

  const d = data;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Project Details</DrawerHeader>
        <DrawerBody py={6}>
          {loading && (
            <Box>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} height="20px" mb={3} />
              ))}
            </Box>
          )}
          {!loading && notFound && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" fontWeight="semibold" mb={2}>
                Project not found
              </Text>
              <Text color="gray.500">
                The selected project could not be retrieved.
              </Text>
              <Button mt={4} onClick={onClose}>
                Go Back
              </Button>
            </Box>
          )}
          {!loading && d && (
            <Box>
              <Heading level="3" mb={4}>
                {d.projectTitle}
              </Heading>
              <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Module
                  </Text>
                  <Text fontWeight="medium">{d.moduleTitle || "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Course
                  </Text>
                  <Text fontWeight="medium">{d.courseTitle || "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Instructor
                  </Text>
                  <Text fontWeight="medium">{d.instructorName || "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Deadline
                  </Text>
                  <Text fontWeight="medium">{fmt(d.submissionDeadline)}</Text>
                </Box>
              </Grid>
              <Divider mb={4} />
              <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Total Submissions
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {d.totalSubmissions ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Graded
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="green.600">
                    {d.graded ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Pending
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={(d.pending ?? 0) > 0 ? "orange.500" : "gray.700"}
                  >
                    {d.pending ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Avg Grade
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {d.averageGrade ?? "—"} / {d.maxGrade ?? 100}
                  </Text>
                </Box>
              </Grid>
              <Divider mb={4} />
              <Box mb={4}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Grading Completion
                </Text>
                <ProgressCell value={d.gradingCompletionPercentage} />
              </Box>
              <Box mb={4}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Feedback Coverage
                </Text>
                <ProgressCell value={d.feedbackProvidedPercentage} />
              </Box>
              <Flex gap={3} mt={2}>
                <Badge
                  colorScheme={gradingStatusScheme(d.gradingStatus)}
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {d.gradingStatus || "—"}
                </Badge>
                <Badge
                  colorScheme={projectStatusScheme(d.projectStatus)}
                  px={3}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                >
                  {d.projectStatus || "—"}
                </Badge>
              </Flex>
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

// const SORT_COLS = [
//   "submissionDeadline",
//   "gradingCompletionPercentage",
//   "feedbackProvidedPercentage",
//   "averageGrade",
//   "pending",
// ];

const DEFAULT_FILTERS = {
  courseId: "",
  instructorId: "",
  startDate: "",
  endDate: "",
  gradingStatus: "all",
  projectId: "",
};

const LIMIT_OPTIONS = [10, 25, 50, 100];

const ProjectGradingReportPage = () => {
  const toast = useToast();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dateError, setDateError] = useState("");

  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState(false);

  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const [sort, setSort] = useState({ key: "", dir: "asc" });
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [exporting, setExporting] = useState(false);

  // Load dropdown data
  useEffect(() => {
    adminGetCourseListing({ page: 1, limit: 200 })
      .then((res) => setCourses(res?.courses ?? []))
      .catch(() => {});
    adminGetInstructorReportDirectory({ limit: 200 })
      .then((res) => setInstructors(res?.rows ?? res?.instructors ?? (Array.isArray(res) ? res : [])))
      .catch(() => {});
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

  const fetchKpi = useCallback(
    (f) => {
      if (!validateDates(f.startDate, f.endDate)) return;
      setKpiLoading(true);
      setKpiError(false);
      getProjectGradingSummary(buildSummaryParams(f))
        .then((res) => setKpiData(res?.data?.summary ?? res?.summary ?? null))
        .catch(() => {
          // TODO: endpoint GET /v1/project-grading-v2/summary not yet live — using mock
          console.warn(
            "[ProjectGrading] /summary failed, falling back to mock data",
          );
          setKpiData(MOCK_SUMMARY);
        })
        .finally(() => setKpiLoading(false));
    },
    [validateDates],
  );

  const fetchTable = useCallback(
    (f, p, l, s) => {
      if (!validateDates(f.startDate, f.endDate)) return;
      setTableLoading(true);
      setTableError(false);
      getProjectGradingReport(buildReportParams(f, p, l, s))
        .then((res) => {
          const d = res?.data ?? res;
          setRows(d?.data ?? []);
          setTotal(d?.total ?? 0);
        })
        .catch(() => {
          // TODO: endpoint GET /v1/project-grading-v2/report not yet live — using mock
          console.warn(
            "[ProjectGrading] /report failed, falling back to mock data",
          );
          setRows(MOCK_REPORT.data);
          setTotal(MOCK_REPORT.total);
        })
        .finally(() => setTableLoading(false));
    },
    [validateDates],
  );

  // Initial load
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
      // Only fire when both or neither are set
      const { startDate, endDate } = updated;
      if ((startDate && endDate) || (!startDate && !endDate)) {
        applyFilters(updated);
      } else {
        setFilters(updated);
        validateDates(updated.startDate, updated.endDate);
      }
      return;
    }
    // gradingStatus and projectId only affect the table
    if (key === "gradingStatus" || key === "projectId") {
      setFilters(updated);
      setPage(1);
      fetchTable(updated, 1, limit, sort);
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

  const handleRowClick = (projectId) => {
    setSelectedProjectId(projectId);
    onDrawerOpen();
  };

  // Export
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const allRows = await getProjectGradingReport(
        buildReportParams(filters, 1, total || 1000, sort),
      );
      const data = allRows?.data?.data ?? allRows?.data ?? [];

      const headers = [
        "Project Title",
        "Module",
        "Course",
        "Instructor",
        "Deadline",
        "Total Submissions",
        "Graded",
        "Pending",
        "Avg Grade",
        "Max Grade",
        "Grading %",
        "Feedback %",
        "Grading Status",
        "Project Status",
      ];
      const rowMapper = (r) => [
        r.projectTitle,
        r.moduleTitle,
        r.courseTitle,
        r.instructorName,
        r.submissionDeadline,
        r.totalSubmissions,
        r.graded,
        r.pending,
        r.averageGrade,
        r.maxGrade,
        r.gradingCompletionPercentage,
        r.feedbackProvidedPercentage,
        r.gradingStatus,
        r.projectStatus,
      ];

      if (format === "csv") {
        const csv = [headers, ...data.map(rowMapper)]
          .map((row) => row.map((v) => `"${v ?? ""}"`).join(","))
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project-grading-report-${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "xlsx") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data.map(rowMapper)]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Project Grading");
        XLSX.writeFile(
          wb,
          `project-grading-report-${dayjs().format("YYYY-MM-DD")}.xlsx`,
        );
      }
    } catch {
      toast({
        title: "Export failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v && !(k === "gradingStatus" && v === "all"),
  );

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
            <BreadcrumbItem>
              <Link href="/admin/report/studentReport">Reports</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/project-grading">Project Grading</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap={2}>
          <Button
            secondary
            onClick={clearFilters}
            isDisabled={!hasActiveFilters}
            leftIcon={<FiX />}
          >
            Clear Filters
          </Button>
          <Select
            size="sm"
            placeholder="Export"
            width="130px"
            isDisabled={exporting || rows.length === 0}
            onChange={(e) => {
              if (e.target.value) handleExport(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="csv">Export CSV</option>
            <option value="xlsx">Export Excel</option>
          </Select>
        </Flex>
      </Flex>

      <Heading level="2" mb={6}>
        Project Grading Summary Report
      </Heading>

      {/* ── Filter Bar ── */}
      <Box bg="white" borderRadius="lg" p={4} mb={6} boxShadow="sm">
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          }}
          gap={3}
        >
          <FormControl>
            <FormLabel fontSize="xs">Course</FormLabel>
            <Select
              size="sm"
              placeholder="All Courses"
              value={filters.courseId}
              onChange={(e) => handleFilterChange("courseId", e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.courseId || c.id} value={c.courseId || c.id}>
                  {c.courseTitle || c.title || c.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Instructor</FormLabel>
            <Select
              size="sm"
              placeholder="All Instructors"
              value={filters.instructorId}
              onChange={(e) =>
                handleFilterChange("instructorId", e.target.value)
              }
            >
              {instructors.map((u) => (
                <option key={u.userId || u.id} value={u.userId || u.id}>
                  {u.fullName || u.name || u.email}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isInvalid={!!dateError}>
            <FormLabel fontSize="xs">Start Date</FormLabel>
            <Input
              size="sm"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </FormControl>

          <FormControl isInvalid={!!dateError}>
            <FormLabel fontSize="xs">End Date</FormLabel>
            <Input
              size="sm"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Grading Status</FormLabel>
            <Select
              size="sm"
              value={filters.gradingStatus}
              onChange={(e) =>
                handleFilterChange("gradingStatus", e.target.value)
              }
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs">Refresh</FormLabel>
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
          </FormControl>
        </Grid>

        {dateError && (
          <Text color="red.500" fontSize="sm" mt={2}>
            {dateError}
          </Text>
        )}
      </Box>

      {/* ── KPI Cards ── */}
      {kpiError ? (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="lg"
          p={4}
          mb={6}
        >
          <Text color="red.600">Failed to load summary metrics.</Text>
          <Button size="sm" mt={2} onClick={() => fetchKpi(filters)}>
            Retry
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
          {kpiLoading ? (
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} height="100px" borderRadius="lg" />
            ))
          ) : (
            <>
              <DashboardMetricCard
                label="Total Projects"
                value={kpiData?.totalProjects ?? "—"}
              />
              <DashboardMetricCard
                label="Total Submissions"
                value={kpiData?.totalSubmissions ?? "—"}
              />
              <DashboardMetricCard
                label="Graded Submissions"
                value={kpiData?.gradedSubmissions ?? "—"}
                color="green"
              />
              <DashboardMetricCard
                label="Pending Grading"
                value={kpiData?.pendingGrading ?? "—"}
                color={
                  (kpiData?.pendingGrading ?? 0) > 0 ? "orange" : undefined
                }
              />
              <DashboardMetricCard
                label="Avg Project Score"
                value={
                  kpiData?.averageProjectScore != null
                    ? `${kpiData.averageProjectScore}%`
                    : "—"
                }
              />
              <DashboardMetricCard
                label="Feedback Coverage"
                value={
                  kpiData?.feedbackCoverage != null
                    ? `${kpiData.feedbackCoverage}%`
                    : "—"
                }
                color={
                  kpiData?.feedbackCoverage < 50
                    ? "red"
                    : kpiData?.feedbackCoverage < 80
                      ? "orange"
                      : undefined
                }
              />
            </>
          )}
        </SimpleGrid>
      )}

      {/* ── Table ── */}
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={3}
          borderBottomWidth="1px"
        >
          <Text fontWeight="semibold">
            Projects
            {total > 0 && (
              <Text
                as="span"
                color="gray.500"
                fontWeight="normal"
                ml={2}
                fontSize="sm"
              >
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

        {tableError ? (
          <Box p={6} textAlign="center">
            <Text color="red.500" mb={2}>
              Failed to load report data.
            </Text>
            <Button
              size="sm"
              onClick={() => fetchTable(filters, page, limit, sort)}
            >
              Retry
            </Button>
          </Box>
        ) : tableLoading ? (
          <Box p={4}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="48px" mb={2} />
            ))}
          </Box>
        ) : rows.length === 0 ? (
          <Box p={10} textAlign="center">
            <Text color="gray.500">
              No projects found for the selected filters.
            </Text>
          </Box>
        ) : (
          <TableContainer>
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Project Title</Th>
                  <Th>Module</Th>
                  <Th>Course</Th>
                  <Th>Instructor</Th>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSort("submissionDeadline")}
                    _hover={{ color: "blue.600" }}
                  >
                    Deadline <SortIcon colKey="submissionDeadline" />
                  </Th>
                  <Th isNumeric>Submissions</Th>
                  <Th isNumeric>Graded</Th>
                  <Th
                    isNumeric
                    cursor="pointer"
                    onClick={() => handleSort("pending")}
                    _hover={{ color: "blue.600" }}
                  >
                    Pending <SortIcon colKey="pending" />
                  </Th>
                  <Th
                    isNumeric
                    cursor="pointer"
                    onClick={() => handleSort("averageGrade")}
                    _hover={{ color: "blue.600" }}
                  >
                    Avg Grade <SortIcon colKey="averageGrade" />
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSort("gradingCompletionPercentage")}
                    _hover={{ color: "blue.600" }}
                    minW="140px"
                  >
                    Grading % <SortIcon colKey="gradingCompletionPercentage" />
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSort("feedbackProvidedPercentage")}
                    _hover={{ color: "blue.600" }}
                    minW="140px"
                  >
                    Feedback % <SortIcon colKey="feedbackProvidedPercentage" />
                  </Th>
                  <Th>Grading Status</Th>
                  <Th>Project Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => (
                  <Tr
                    key={r.projectId}
                    _hover={{ bg: "gray.50" }}
                    cursor="pointer"
                    onClick={() => handleRowClick(r.projectId)}
                  >
                    <Td>
                      <Text
                        color="blue.600"
                        fontWeight="medium"
                        _hover={{ textDecoration: "underline" }}
                        noOfLines={2}
                        maxW="200px"
                      >
                        {r.projectTitle}
                      </Text>
                    </Td>
                    <Td>
                      <Text noOfLines={1} maxW="150px">
                        {r.moduleTitle || "—"}
                      </Text>
                    </Td>
                    <Td>
                      <Text noOfLines={1} maxW="150px">
                        {r.courseTitle || "—"}
                      </Text>
                    </Td>
                    <Td>{r.instructorName || "—"}</Td>
                    <Td>{fmt(r.submissionDeadline)}</Td>
                    <Td isNumeric>{r.totalSubmissions ?? "—"}</Td>
                    <Td isNumeric>
                      <Text color="green.600" fontWeight="medium">
                        {r.graded ?? "—"}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text
                        color={(r.pending ?? 0) > 0 ? "orange.500" : "gray.700"}
                        fontWeight="medium"
                      >
                        {r.pending ?? "—"}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      {r.averageGrade != null
                        ? `${r.averageGrade} / ${r.maxGrade ?? 100}`
                        : "—"}
                    </Td>
                    <Td>
                      <ProgressCell value={r.gradingCompletionPercentage} />
                    </Td>
                    <Td>
                      <ProgressCell value={r.feedbackProvidedPercentage} />
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={gradingStatusScheme(r.gradingStatus)}
                        borderRadius="full"
                        px={2}
                      >
                        {r.gradingStatus || "—"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={projectStatusScheme(r.projectStatus)}
                        borderRadius="full"
                        px={2}
                        textTransform="capitalize"
                      >
                        {r.projectStatus || "—"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {!tableLoading && !tableError && total > 0 && (
          <Flex
            justify="space-between"
            align="center"
            px={4}
            py={3}
            borderTopWidth="1px"
          >
            <Text fontSize="sm" color="gray.600">
              Page {page} of {totalPages} &mdash; {total} record
              {total !== 1 ? "s" : ""}
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

      {/* Detail Drawer */}
      <DetailDrawer
        projectId={selectedProjectId}
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
      />
    </AdminMainAreaWrapper>
  );
};

export const ProjectGradingReportPageRoute = (props) => (
  <Route {...props} component={ProjectGradingReportPage} />
);

export default ProjectGradingReportPage;
