import { useState, useEffect, useRef } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, Grid, SimpleGrid } from "@chakra-ui/layout";
import { Badge, Divider, Select, Tag, useToast } from "@chakra-ui/react";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { EmptyState } from "../../../../layouts";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Spinner,
  Text,
} from "../../../../components";
import {
  getVisualAnalyticsDashboard,
  getVisualAnalyticsReport,
  adminGetCourseListing,
  adminListModules,
} from "../../../../services";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const indicatorHex = (indicator) => {
  if (indicator === "Green") return "#38A169";
  if (indicator === "Yellow") return "#D69E2E";
  return "#E53E3E";
};

const achievementColorScheme = (cat) => {
  if (cat === "Excellent") return "green";
  if (cat === "Good") return "blue";
  if (cat === "Average") return "yellow";
  return "red";
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionBlock = ({ title, description, children, mt = 8 }) => (
  <Box mt={mt}>
    <Box mb={4}>
      <Heading as="h3" size="sm" color="gray.700" fontWeight="600">
        {title}
      </Heading>
      {description && (
        <Text as="level5" color="gray.500" mt={1}>
          {description}
        </Text>
      )}
      <Divider mt={3} borderColor="gray.200" />
    </Box>
    {children}
  </Box>
);

const IndicatorDot = ({ indicator, size = 3 }) => (
  <Box
    w={size}
    h={size}
    borderRadius="full"
    bg={indicatorHex(indicator)}
    flexShrink={0}
  />
);

// ── Searchable Select ─────────────────────────────────────────────────────────

const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search…", isDisabled = false }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt.value);
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(false);
  };

  return (
    <Box ref={ref} position="relative" minW="200px">
      <Flex
        align="center"
        border="1px solid"
        borderColor={open ? "blue.400" : "gray.200"}
        borderRadius="6px"
        bg={isDisabled ? "gray.50" : "white"}
        px={2}
        h="32px"
        cursor={isDisabled ? "not-allowed" : "pointer"}
        onClick={() => { if (!isDisabled) setOpen((o) => !o); }}
        gap={1}
      >
        {open ? (
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type to search…"
            style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", background: "transparent", minWidth: 0 }}
          />
        ) : (
          <Box flex={1} fontSize="13px" color={selected ? "gray.800" : "gray.400"} noOfLines={1} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {selected ? selected.label : placeholder}
          </Box>
        )}
        {value && !isDisabled ? (
          <Box as="span" color="gray.400" fontSize="14px" lineHeight={1} onClick={handleClear} cursor="pointer" px={1}>✕</Box>
        ) : (
          <Box as="span" color="gray.400" fontSize="10px" ml={1}>▾</Box>
        )}
      </Flex>

      {open && (
        <Box
          position="absolute"
          top="36px"
          left={0}
          right={0}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="6px"
          boxShadow="md"
          zIndex={100}
          maxH="220px"
          overflowY="auto"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="gray.400">No results</Box>
          ) : (
            filtered.map((opt) => (
              <Box
                key={opt.value}
                px={3}
                py={2}
                fontSize="13px"
                color="gray.800"
                cursor="pointer"
                bg={opt.value === value ? "blue.50" : "white"}
                _hover={{ bg: "gray.50" }}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
              >
                {opt.label}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const VisualAnalyticsDashboardPage = () => {
  const toast = useToast();

  const [dashLoading, setDashLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [reportRows, setReportRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);

  const [filters, setFilters] = useState({
    courseId: "",
    moduleId: "",
    startDate: "",
    endDate: "",
    achievementCategory: "",
    visualIndicator: "",
  });

  const LIMIT = 20;

  const fetchDashboard = async (params) => {
    setDashLoading(true);
    try {
      const res = await getVisualAnalyticsDashboard(params);
      setDashboard(res?.data ?? null);
    } catch (err) {
      toast({
        status: "error",
        description: err?.message || "Failed to load dashboard",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDashLoading(false);
    }
  };

  const fetchReport = async (pg, params) => {
    setTableLoading(true);
    try {
      const res = await getVisualAnalyticsReport({ ...params, page: pg, limit: LIMIT });
      setReportRows(res?.data?.data ?? []);
      setTotalRows(res?.data?.total ?? 0);
    } catch (err) {
      toast({
        status: "error",
        description: err?.message || "Failed to load student report",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTableLoading(false);
    }
  };

  const buildParams = () => {
    const p = {};
    if (filters.courseId) p.courseId = filters.courseId;
    if (filters.moduleId) p.moduleId = filters.moduleId;
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate) p.endDate = filters.endDate;
    if (filters.achievementCategory) p.achievementCategory = filters.achievementCategory;
    if (filters.visualIndicator) p.visualIndicator = filters.visualIndicator;
    return p;
  };

  const handleCourseChange = async (courseId) => {
    setFilters((f) => ({ ...f, courseId, moduleId: "" }));
    setModules([]);
    if (!courseId) return;
    try {
      const res = await adminListModules(courseId);
      setModules(res?.modules ?? []);
    } catch {
      // silently fail — module dropdown just stays empty
    }
  };

  const handleApply = () => {
    const p = buildParams();
    setPage(1);
    fetchDashboard(p);
    fetchReport(1, p);
  };

  const handleReset = () => {
    const cleared = {
      courseId: "",
      moduleId: "",
      startDate: "",
      endDate: "",
      achievementCategory: "",
      visualIndicator: "",
    };
    setFilters(cleared);
    setModules([]);
    setPage(1);
    fetchDashboard({});
    fetchReport(1, {});
  };

  const handlePageChange = (next) => {
    setPage(next);
    fetchReport(next, buildParams());
  };

  useEffect(() => {
    fetchDashboard({});
    fetchReport(1, {});
    adminGetCourseListing().then((res) => setCourses(res?.courses ?? [])).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chart data ─────────────────────────────────────────────────────────────

  const kpis = dashboard?.kpis ?? {};

  const pieData = {
    labels: (dashboard?.chart_data?.pie ?? []).map((p) => p.label),
    datasets: [
      {
        data: (dashboard?.chart_data?.pie ?? []).map((p) => p.value),
        backgroundColor: ["#38A169", "#3182CE", "#D69E2E", "#E53E3E"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const barData = {
    labels: (dashboard?.chart_data?.bar ?? []).map((b) => b.range),
    datasets: [
      {
        label: "Students",
        data: (dashboard?.chart_data?.bar ?? []).map((b) => b.count),
        backgroundColor: "#660066",
        borderRadius: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Achievement Category Distribution", font: { size: 13 } },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Score Histogram", font: { size: 13 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminMainAreaWrapper>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Visual Analytics</Link>
            </BreadcrumbItem>
          }
        />
        <Button secondary onClick={handleApply}>
          Refresh
        </Button>
      </Box>

      <Box mb={6}>
        <Heading as="h2" size="md" color="gray.800">
          Visual Performance Analytics
        </Heading>
        <Text as="level5" color="gray.500" mt={1}>
          TC03 — Color indicators, chart data, and benchmarks across all students
        </Text>
      </Box>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <Box
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        px={5}
        py={4}
        mb={2}
      >
        <Text bold color="gray.700" fontSize="sm" mb={3}>
          Filters
        </Text>
        <Flex gap={4} flexWrap="wrap" alignItems="flex-end">
          {/* Course */}
          <Box>
            <Text as="level5" color="gray.500" mb={1}>
              Course
            </Text>
            <SearchableSelect
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
              value={filters.courseId}
              onChange={(val) => handleCourseChange(val)}
              placeholder="All courses"
            />
          </Box>

          {/* Module */}
          <Box>
            <Text as="level5" color="gray.500" mb={1}>
              Module
            </Text>
            <SearchableSelect
              options={modules.map((m) => ({ value: m.id, label: m.title }))}
              value={filters.moduleId}
              onChange={(val) => setFilters((f) => ({ ...f, moduleId: val }))}
              placeholder={filters.courseId ? "All modules" : "Select a course first"}
              isDisabled={!filters.courseId}
            />
          </Box>

          {/* Date range */}
          <Box>
            <Text as="level5" color="gray.500" mb={1}>
              Start Date
            </Text>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                minWidth: "150px",
              }}
            />
          </Box>
          <Box>
            <Text as="level5" color="gray.500" mb={1}>
              End Date
            </Text>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                minWidth: "150px",
              }}
            />
          </Box>

          <Flex gap={2} mt={{ base: 2, md: 0 }}>
            <Button onClick={handleApply}>Apply</Button>
            <Button secondary onClick={handleReset}>
              Reset
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* ── Section 1 : KPI Summary ───────────────────────────────────────── */}
      <SectionBlock
        title="Performance Summary"
        description="Aggregate KPIs across all students in the selected period"
      >
        {dashLoading ? (
          <Flex h="120px" justify="center" align="center">
            <Spinner />
          </Flex>
        ) : (
          <>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
              <DashboardMetricCard
                title="Total Students"
                value={kpis.total_students ?? "—"}
                change=""
              />
              <DashboardMetricCard
                title="Class Average"
                value={kpis.class_average != null ? `${kpis.class_average}%` : "—"}
                change=""
              />
              <DashboardMetricCard
                title="Meeting Target"
                value={
                  kpis.students_meeting_target_percentage != null
                    ? `${kpis.students_meeting_target_percentage}%`
                    : "—"
                }
                change={`${kpis.students_meeting_target ?? 0} students`}
                changeColor="#1A8F3A"
              />
              <DashboardMetricCard
                title="Excellent Performers"
                value={
                  kpis.excellent_percentage != null
                    ? `${kpis.excellent_percentage}%`
                    : "—"
                }
                change=""
                changeColor="#1A8F3A"
              />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <DashboardMetricCard
                title="Good"
                value={kpis.good_percentage != null ? `${kpis.good_percentage}%` : "—"}
                change=""
                changeColor="#3182CE"
              />
              <DashboardMetricCard
                title="Average"
                value={
                  kpis.average_percentage != null
                    ? `${kpis.average_percentage}%`
                    : "—"
                }
                change=""
                changeColor="#D69E2E"
              />
              <DashboardMetricCard
                title="Poor"
                value={
                  kpis.poor_percentage != null ? `${kpis.poor_percentage}%` : "—"
                }
                change=""
                changeColor="#E53E3E"
              />
              <DashboardMetricCard
                title="Green / Yellow / Red"
                value={`${dashboard?.visual_indicator_distribution?.Green ?? 0} / ${dashboard?.visual_indicator_distribution?.Yellow ?? 0} / ${dashboard?.visual_indicator_distribution?.Red ?? 0}`}
                change="visual indicators"
              />
            </SimpleGrid>
          </>
        )}
      </SectionBlock>

      {/* ── Section 2 : Charts ───────────────────────────────────────────── */}
      <SectionBlock
        title="Chart Analytics"
        description="Pie: achievement distribution · Bar: score histogram"
      >
        {dashLoading ? (
          <Flex h="280px" justify="center" align="center">
            <Spinner />
          </Flex>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={5}
            >
              {(dashboard?.chart_data?.pie ?? []).length > 0 ? (
                <Pie data={pieData} options={pieOptions} />
              ) : (
                <Flex h="220px" justify="center" align="center">
                  <Text color="gray.400">No distribution data</Text>
                </Flex>
              )}
            </Box>

            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={5}
            >
              {(dashboard?.chart_data?.bar ?? []).length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <Flex h="220px" justify="center" align="center">
                  <Text color="gray.400">No score histogram data</Text>
                </Flex>
              )}
            </Box>
          </Grid>
        )}
      </SectionBlock>

      {/* ── Section 3 : Top Performers & At-Risk ─────────────────────────── */}
      <SectionBlock
        title="Top Performers & At-Risk Students"
        description="Top 5 performers and students in the Poor performance category"
      >
        {dashLoading ? (
          <Flex h="200px" justify="center" align="center">
            <Spinner />
          </Flex>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* Top Performers */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
            >
              <Box
                bg="green.50"
                px={4}
                py={3}
                borderBottom="1px"
                borderColor="green.100"
              >
                <Text bold color="green.700" fontSize="sm">
                  Top Performers
                </Text>
              </Box>
              {(dashboard?.top_performers ?? []).length === 0 ? (
                <Box p={6} textAlign="center">
                  <Text color="gray.400">No data available</Text>
                </Box>
              ) : (
                dashboard.top_performers.map((s, i) => (
                  <Box
                    key={s.student_id ?? i}
                    px={4}
                    py={3}
                    borderBottom="1px"
                    borderColor="gray.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    _last={{ borderBottom: "none" }}
                  >
                    <Box>
                      <Text bold fontSize="sm" color="gray.800">
                        {s.student_name ?? "—"}
                      </Text>
                      <Text as="level5" color="gray.400" fontSize="xs">
                        {s.student_id}
                      </Text>
                    </Box>
                    <Flex align="center" gap={2}>
                      <Text bold color="green.600" fontSize="sm">
                        {s.performance_metric}%
                      </Text>
                      <Badge colorScheme="green" borderRadius="full" fontSize="10px">
                        {s.achievement_category}
                      </Badge>
                    </Flex>
                  </Box>
                ))
              )}
            </Box>

            {/* At-Risk Students */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
            >
              <Box
                bg="red.50"
                px={4}
                py={3}
                borderBottom="1px"
                borderColor="red.100"
              >
                <Text bold color="red.700" fontSize="sm">
                  At-Risk Students (Poor)
                </Text>
              </Box>
              {(dashboard?.at_risk_students ?? []).length === 0 ? (
                <Box p={6} textAlign="center">
                  <Text color="gray.400">No at-risk students</Text>
                </Box>
              ) : (
                dashboard.at_risk_students.map((s, i) => (
                  <Box
                    key={s.student_id ?? i}
                    px={4}
                    py={3}
                    borderBottom="1px"
                    borderColor="gray.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    _last={{ borderBottom: "none" }}
                  >
                    <Box>
                      <Text bold fontSize="sm" color="gray.800">
                        {s.student_name ?? "—"}
                      </Text>
                      <Text as="level5" color="gray.400" fontSize="xs">
                        {s.student_id}
                      </Text>
                    </Box>
                    <Flex align="center" gap={2}>
                      <Text bold color="red.600" fontSize="sm">
                        {s.performance_metric != null
                          ? `${s.performance_metric}%`
                          : "—"}
                      </Text>
                      <Badge colorScheme="red" borderRadius="full" fontSize="10px">
                        Poor
                      </Badge>
                    </Flex>
                  </Box>
                ))
              )}
            </Box>
          </Grid>
        )}
      </SectionBlock>

      {/* ── Section 4 : Heatmap ──────────────────────────────────────────── */}
      {!dashLoading && (dashboard?.chart_data?.heatmap ?? []).length > 0 && (
        <SectionBlock
          title="Student Score Heatmap"
          description="Per-student score grid — cell colour matches visual indicator"
        >
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            overflowX="auto"
          >
            <Flex wrap="wrap" gap={2}>
              {dashboard.chart_data.heatmap.map((cell, i) => {
                const isGreen = cell.indicator === "Green";
                const isYellow = cell.indicator === "Yellow";
                return (
                  <Box
                    key={cell.student_id ?? i}
                    bg={isGreen ? "green.50" : isYellow ? "yellow.50" : "red.50"}
                    border="1px"
                    borderColor={
                      isGreen ? "green.200" : isYellow ? "yellow.200" : "red.200"
                    }
                    borderRadius="md"
                    p={3}
                    minW="110px"
                    textAlign="center"
                  >
                    <Text bold fontSize="sm" color="gray.800">
                      {cell.score}%
                    </Text>
                    <Text
                      as="level5"
                      color="gray.600"
                      fontSize="xs"
                      noOfLines={1}
                      mt={1}
                    >
                      {cell.student_name}
                    </Text>
                    <IndicatorDot indicator={cell.indicator} size={2} />
                  </Box>
                );
              })}
            </Flex>
          </Box>
        </SectionBlock>
      )}

      {/* ── Section 5 : Per-Student Report Table ─────────────────────────── */}
      <SectionBlock
        title="Per-Student Report"
        description="Detailed breakdown with visual indicators, achievement categories, and remarks"
      >
        {/* Table-level filters */}
        <Box
          bg="gray.50"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          px={4}
          py={3}
          mb={4}
        >
          <Flex gap={4} flexWrap="wrap" alignItems="flex-end">
            <Box>
              <Text as="level5" color="gray.600" mb={1}>
                Achievement Category
              </Text>
              <Select
                size="sm"
                w="180px"
                value={filters.achievementCategory}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    achievementCategory: e.target.value,
                  }))
                }
                placeholder="All categories"
                bg="white"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </Select>
            </Box>
            <Box>
              <Text as="level5" color="gray.600" mb={1}>
                Visual Indicator
              </Text>
              <Select
                size="sm"
                w="160px"
                value={filters.visualIndicator}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, visualIndicator: e.target.value }))
                }
                placeholder="All indicators"
                bg="white"
              >
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Red">Red</option>
              </Select>
            </Box>
            <Button
              size="sm"
              onClick={() => {
                setPage(1);
                fetchReport(1, buildParams());
              }}
            >
              Filter
            </Button>
          </Flex>
        </Box>

        {tableLoading ? (
          <Flex h="200px" justify="center" align="center">
            <Spinner />
          </Flex>
        ) : reportRows.length === 0 ? (
          <EmptyState
            heading="No student data found"
            description="Try adjusting your filters or date range."
          />
        ) : (
          <>
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
              boxShadow="sm"
            >
              {/* Header row */}
              <Box
                display="grid"
                gridTemplateColumns="1.6fr 1.2fr 80px 110px 110px 80px 1.4fr"
                bg="gray.50"
                borderBottom="1px"
                borderColor="gray.200"
                px={4}
                py={3}
              >
                {[
                  "Student",
                  "Course",
                  "Score",
                  "Completion",
                  "Achievement",
                  "Indicator",
                  "Remarks",
                ].map((col) => (
                  <Text
                    key={col}
                    bold
                    as="level5"
                    color="gray.600"
                    fontSize="xs"
                  >
                    {col}
                  </Text>
                ))}
              </Box>

              {/* Data rows */}
              {reportRows.map((row, i) => (
                <Box
                  key={row.student_id ?? i}
                  display="grid"
                  gridTemplateColumns="1.6fr 1.2fr 80px 110px 110px 80px 1.4fr"
                  alignItems="center"
                  px={4}
                  py={3}
                  borderBottom="1px"
                  borderColor="gray.100"
                  _last={{ borderBottom: "none" }}
                  _hover={{ bg: "gray.50" }}
                >
                  <Box pr={2}>
                    <Text bold fontSize="sm" color="gray.800" noOfLines={1}>
                      {row.student_name ?? "—"}
                    </Text>
                    <Text as="level5" color="gray.400" fontSize="xs">
                      {row.student_email ?? "—"}
                    </Text>
                  </Box>

                  <Text fontSize="sm" color="gray.700" noOfLines={1}>
                    {row.course_title ?? "—"}
                  </Text>

                  <Text bold fontSize="sm" color="gray.800">
                    {row.performance_metric != null
                      ? `${row.performance_metric}%`
                      : "—"}
                  </Text>

                  <Box>
                    <Flex alignItems="center" gap={2}>
                      <Box
                        flex={1}
                        h="6px"
                        bg="gray.100"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box
                          h="100%"
                          bg="blue.400"
                          borderRadius="full"
                          width={`${row.completion_rate ?? 0}%`}
                        />
                      </Box>
                      <Text fontSize="xs" color="gray.600" minW="28px">
                        {row.completion_rate ?? 0}%
                      </Text>
                    </Flex>
                  </Box>

                  <Tag
                    size="sm"
                    borderRadius="full"
                    colorScheme={achievementColorScheme(row.achievement_category)}
                  >
                    {row.achievement_category ?? "—"}
                  </Tag>

                  <Flex align="center" gap={1}>
                    <IndicatorDot indicator={row.visual_indicator} size={2} />
                    <Text fontSize="xs" color="gray.600">
                      {row.visual_indicator ?? "—"}
                    </Text>
                  </Flex>

                  <Text fontSize="xs" color="gray.500" noOfLines={2}>
                    {row.remarks ?? "—"}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            {totalRows > LIMIT && (
              <Flex mt={4} justify="space-between" align="center">
                <Text as="level5" color="gray.500">
                  Page {page} · showing {reportRows.length} of {totalRows} students
                </Text>
                <Flex gap={2}>
                  <Button
                    secondary
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    secondary
                    size="sm"
                    disabled={page * LIMIT >= totalRows}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </Flex>
              </Flex>
            )}
          </>
        )}
      </SectionBlock>

    </AdminMainAreaWrapper>
  );
};

export const VisualAnalyticsDashboardPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <VisualAnalyticsDashboardPage {...props} />} />
);

export default VisualAnalyticsDashboardPage;
