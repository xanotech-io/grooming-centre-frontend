import { useState, useEffect } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import { Badge, Divider } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Button, ExportMenu, Heading, Spinner, Text } from "../../../components";
import { useApp } from "../../../contexts";
import { getVisualAnalyticsStudentReport } from "../../../services";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ── Helpers ───────────────────────────────────────────────────────────────────

const indicatorHex = (indicator) => {
  if (indicator === "Green") return "#38A169";
  if (indicator === "Yellow") return "#D69E2E";
  return "#E53E3E";
};

const achievementTheme = (cat) =>
  ({
    Excellent: { bg: "green.50", border: "green.200", text: "green.700", badge: "green" },
    Good: { bg: "blue.50", border: "blue.200", text: "blue.700", badge: "blue" },
    Average: { bg: "yellow.50", border: "yellow.200", text: "yellow.700", badge: "yellow" },
    Poor: { bg: "red.50", border: "red.200", text: "red.700", badge: "red" },
  }[cat] ?? { bg: "gray.50", border: "gray.200", text: "gray.700", badge: "gray" });

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionBlock = ({ title, children, mt = 8 }) => (
  <Box mt={mt}>
    <Box mb={4}>
      <Heading as="h3" size="sm" color="gray.700" fontWeight="600">
        {title}
      </Heading>
      <Divider mt={2} borderColor="gray.200" />
    </Box>
    {children}
  </Box>
);

const KpiCard = ({ title, value, sub, accentColor = "#660066" }) => (
  <Box
    bg="white"
    border="1px"
    borderColor="gray.200"
    borderRadius="md"
    p={5}
    shadow="sm"
    textAlign="center"
  >
    <Text bold fontSize="2xl" color={accentColor}>
      {value ?? "—"}
    </Text>
    <Text as="level5" color="gray.500" mt={1}>
      {title}
    </Text>
    {sub && (
      <Text as="level5" color="gray.400" mt={1} fontSize="xs">
        {sub}
      </Text>
    )}
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────

const StudentVisualAnalyticsPage = () => {
  const { state } = useApp();
  const studentId = state?.user?.id;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getVisualAnalyticsStudentReport(studentId);
      const raw = res?.data ?? [];
      setRows(Array.isArray(raw) ? raw : [raw]);
    } catch (err) {
      setError(err?.message || "Failed to load your analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const exportHeaderRow = [
    "Course",
    "My Score (%)",
    "Class Average (%)",
    "vs Average",
    "Achievement",
    "Remarks",
  ];
  const exportDataRows = rows.map((row) => [
    row.course_title ?? "",
    row.performance_metric ?? "",
    row.class_average ?? "",
    row.comparison_to_average ?? "",
    row.achievement_category ?? "",
    row.remarks ?? "",
  ]);
  const exportRows = [exportHeaderRow, ...exportDataRows];

  // First row used for top-level KPIs
  const first = rows[0] ?? null;
  const theme = achievementTheme(first?.achievement_category);

  // Build bar chart comparing my scores vs class averages per course
  const chartRows = rows.filter((r) => r.performance_metric != null);
  const barData = {
    labels: chartRows.map((r) => r.course_title ?? "Course"),
    datasets: [
      {
        label: "My Score (%)",
        data: chartRows.map((r) => r.performance_metric),
        backgroundColor: chartRows.map((r) => indicatorHex(r.visual_indicator)),
        borderRadius: 4,
      },
      {
        label: "Class Average (%)",
        data: chartRows.map((r) => r.class_average ?? 0),
        backgroundColor: "rgba(160, 160, 160, 0.35)",
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "My Score vs Class Average",
        font: { size: 13 },
      },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <Box
        mb={6}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Heading as="h2" size="md" color="gray.800">
            My Performance Analytics
          </Heading>
          <Text as="level5" color="gray.500" mt={1}>
            Visual overview of your academic performance, achievement levels, and
            learning gaps
          </Text>
        </Box>
        <Flex gap={3} alignItems="center">
          {rows.length > 0 && (
            <ExportMenu
              rows={exportRows}
              filename="my-performance-analytics"
              title="My Performance Analytics"
            />
          )}
          <Button secondary onClick={fetchData}>
            Refresh
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex h="320px" justify="center" align="center" direction="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">
            Loading your analytics…
          </Text>
        </Flex>
      ) : error ? (
        <Box
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          p={8}
          textAlign="center"
        >
          <Text color="red.700">{error}</Text>
          <Button mt={4} secondary onClick={fetchData}>
            Try Again
          </Button>
        </Box>
      ) : rows.length === 0 ? (
        <Box
          bg="gray.50"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={8}
          textAlign="center"
        >
          <Text color="gray.500">
            No performance data available yet. Complete courses and assessments
            to see your analytics.
          </Text>
        </Box>
      ) : (
        <>
          {/* ── Section 1 : Achievement Banner ─────────────────────────── */}
          {first && (
            <Box
              bg={theme.bg}
              border="1px"
              borderColor={theme.border}
              borderRadius="md"
              px={5}
              py={4}
              mb={2}
              display="flex"
              alignItems="center"
              gap={4}
              flexWrap="wrap"
            >
              <Box
                w={5}
                h={5}
                borderRadius="full"
                bg={indicatorHex(first.visual_indicator)}
                flexShrink={0}
              />
              <Box flex={1}>
                <Text bold color={theme.text} fontSize="md">
                  Overall Achievement:{" "}
                  <Box as="span" fontWeight="700">
                    {first.achievement_category ?? "—"}
                  </Box>
                </Text>
                {first.remarks && (
                  <Text as="level5" color="gray.600" mt={1}>
                    {first.remarks}
                  </Text>
                )}
              </Box>
              <Badge
                colorScheme={theme.badge}
                borderRadius="full"
                px={3}
                py={1}
                fontSize="sm"
              >
                {first.visual_indicator} Indicator
              </Badge>
            </Box>
          )}

          {/* ── Section 2 : KPI Cards ──────────────────────────────────── */}
          <SectionBlock title="My Performance at a Glance">
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <KpiCard
                title="My Score"
                value={
                  first?.performance_metric != null
                    ? `${first.performance_metric}%`
                    : "—"
                }
                accentColor="#660066"
              />
              <KpiCard
                title="Class Average"
                value={
                  first?.class_average != null
                    ? `${first.class_average}%`
                    : "—"
                }
                accentColor="#3182CE"
              />
              <KpiCard
                title="vs Class Average"
                value={first?.comparison_to_average ?? "—"}
                accentColor={
                  first?.comparison_to_average?.startsWith("+")
                    ? "#38A169"
                    : "#E53E3E"
                }
              />
              <KpiCard
                title="Completion Rate"
                value={
                  first?.completion_rate != null
                    ? `${first.completion_rate}%`
                    : "—"
                }
                accentColor="#D69E2E"
              />
            </SimpleGrid>
          </SectionBlock>

          {/* ── Section 3 : Score Chart ────────────────────────────────── */}
          {chartRows.length > 0 && (
            <SectionBlock title="Score Comparison by Course">
              <Box
                bg="white"
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                p={5}
              >
                <Bar data={barData} options={barOptions} />
              </Box>
            </SectionBlock>
          )}

          {/* ── Section 4 : Course Breakdown Table ────────────────────── */}
          <SectionBlock title="Course Breakdown">
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
              boxShadow="sm"
            >
              {/* Header */}
              <Box
                display="grid"
                gridTemplateColumns="2fr 90px 90px 100px 110px 1.4fr"
                bg="gray.50"
                borderBottom="1px"
                borderColor="gray.200"
                px={4}
                py={3}
              >
                {[
                  "Course",
                  "My Score",
                  "Class Avg",
                  "vs Average",
                  "Achievement",
                  "Remarks",
                ].map((col) => (
                  <Text key={col} bold as="level5" color="gray.600" fontSize="xs">
                    {col}
                  </Text>
                ))}
              </Box>

              {/* Rows */}
              {rows.map((row, i) => {
                const t = achievementTheme(row.achievement_category);
                const isPositive = row.comparison_to_average?.startsWith("+");
                return (
                  <Box
                    key={row.course_id ?? i}
                    display="grid"
                    gridTemplateColumns="2fr 90px 90px 100px 110px 1.4fr"
                    alignItems="center"
                    px={4}
                    py={3}
                    borderBottom="1px"
                    borderColor="gray.100"
                    _last={{ borderBottom: "none" }}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Box>
                      <Text bold fontSize="sm" color="gray.800" noOfLines={1}>
                        {row.course_title ?? "—"}
                      </Text>
                    </Box>

                    <Flex align="center" gap={1}>
                      <Box
                        w={2}
                        h={2}
                        borderRadius="full"
                        bg={indicatorHex(row.visual_indicator)}
                      />
                      <Text bold fontSize="sm" color="gray.800">
                        {row.performance_metric != null
                          ? `${row.performance_metric}%`
                          : "—"}
                      </Text>
                    </Flex>

                    <Text fontSize="sm" color="gray.600">
                      {row.class_average != null ? `${row.class_average}%` : "—"}
                    </Text>

                    <Text
                      bold
                      fontSize="sm"
                      color={isPositive ? "green.600" : "red.600"}
                    >
                      {row.comparison_to_average ?? "—"}
                    </Text>

                    <Badge
                      colorScheme={t.badge}
                      borderRadius="full"
                      px={2}
                      fontSize="xs"
                    >
                      {row.achievement_category ?? "—"}
                    </Badge>

                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                      {row.remarks ?? "—"}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </SectionBlock>
        </>
      )}
    </Box>
  );
};

export const StudentVisualAnalyticsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentVisualAnalyticsPage {...props} />} />
);

export default StudentVisualAnalyticsPage;
