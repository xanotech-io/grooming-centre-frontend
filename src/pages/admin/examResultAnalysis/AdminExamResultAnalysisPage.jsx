import { useEffect, useState } from "react";
import { Route, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  SimpleGrid,
  Divider,
  Badge,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useToast,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  FiAward,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiBarChart2,
} from "react-icons/fi";
import { Heading, Spinner, Text, Button, Breadcrumb, Link, ExportMenu } from "../../../components";
import {
  adminGetExamFullReport,
  adminGetExamLeaderboard,
  adminGetExamChartData,
  adminGetStudentExamResultAnalysis,
} from "../../../services";
import { AdminMainAreaWrapper } from "../../../layouts";
import dayjs from "dayjs";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusScheme = (s) => (s === "Pass" ? "green" : "red");

const rankBadgeStyles = (rank) => {
  if (rank === 1) return { bg: "#FFD700", color: "#7A5900" };
  if (rank === 2) return { bg: "#C0C0C0", color: "#4A4A4A" };
  if (rank === 3) return { bg: "#CD7F32", color: "#5C3208" };
  return { bg: "#EDF2F7", color: "#4A5568" };
};

const gradeColor = (grade = "") => {
  const g = (grade || "").charAt(0).toUpperCase();
  if (g === "A") return "green";
  if (g === "B") return "blue";
  if (g === "C") return "yellow";
  return "red";
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionDivider = ({ title }) => (
  <Box mb={4} mt={8}>
    <Heading as="h3" size="sm" color="gray.700" fontWeight="600">{title}</Heading>
    <Divider mt={2} borderColor="gray.200" />
  </Box>
);

const KpiCard = ({ icon: Icon, label, value, sub, iconColor = "#660066" }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" px={4} py={4} shadow="sm">
    <Flex alignItems="center" gap={3} mb={2}>
      <Box
        w="32px" h="32px"
        bg={`${iconColor}18`}
        borderRadius="8px"
        display="flex" alignItems="center" justifyContent="center"
        flexShrink={0}
      >
        <Icon color={iconColor} size={15} />
      </Box>
      <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
    </Flex>
    <Text bold fontSize="2xl" color="gray.800" lineHeight="1.1">{value ?? "—"}</Text>
    {sub && <Text as="level5" color="gray.400" mt={1} fontSize="xs">{sub}</Text>}
  </Box>
);

const LoadingState = ({ label }) => (
  <Flex h="280px" justify="center" align="center" direction="column">
    <Spinner size="xl" />
    <Text mt={4} color="gray.500">{label}</Text>
  </Flex>
);

const ErrorState = ({ message, onRetry }) => (
  <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={8} textAlign="center">
    <Text color="red.700" mb={3}>{message}</Text>
    <Button secondary onClick={onRetry}>Try Again</Button>
  </Box>
);

const EmptyState = ({ label }) => (
  <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={10} textAlign="center">
    <Text color="gray.400" fontSize="lg">{label}</Text>
  </Box>
);

// ── Tab 1: Overview ───────────────────────────────────────────────────────────

const OverviewTab = ({ report, loading, error, onRetry, onSelectStudent }) => {
  if (loading) return <LoadingState label="Loading report…" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!report) return <EmptyState label="No report data available." />;

  const { exam, kpis, students = [] } = report;

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      {/* Exam info banner */}
      {exam && (
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" px={5} py={4} shadow="sm" mb={6}>
          <Flex flexWrap="wrap" gap={6} alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Text bold fontSize="lg" color="gray.800">{exam.title ?? "Exam"}</Text>
              <Text as="level5" color="gray.500" mt={0.5}>
                {exam.date ? dayjs(exam.date).format("DD MMM YYYY, h:mm A") : "—"}
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} minW="320px">
              <Box>
                <Text as="level5" color="gray.400">Marking Mode</Text>
                <Text bold fontSize="sm" color="gray.700" textTransform="capitalize">{exam.markingMode ?? "—"}</Text>
              </Box>
              <Box>
                <Text as="level5" color="gray.400">Total Marks</Text>
                <Text bold fontSize="sm" color="gray.700">{exam.totalMarks ?? "—"}</Text>
              </Box>
              <Box>
                <Text as="level5" color="gray.400">Pass Threshold</Text>
                <Text bold fontSize="sm" color="gray.700">{exam.passThreshold != null ? `${exam.passThreshold}%` : "—"}</Text>
              </Box>
            </SimpleGrid>
          </Flex>
        </Box>
      )}

      {/* KPI cards */}
      {kpis && (
        <>
          <SectionDivider title="Cohort KPIs" />
          <SimpleGrid columns={{ base: 2, md: 4, lg: 4 }} spacing={4} mb={2}>
            <KpiCard icon={FiUsers} label="Total Students" value={kpis.totalStudents} iconColor="#3182CE" />
            <KpiCard icon={FiTarget} label="Average Score" value={kpis.averageScore != null ? `${kpis.averageScore}%` : "—"} iconColor="#660066" />
            <KpiCard icon={FiTrendingUp} label="Pass Rate" value={kpis.passRate != null ? `${kpis.passRate}%` : "—"} iconColor="#38A169" />
            <KpiCard icon={FiBarChart2} label="Question Accuracy" value={kpis.questionAccuracy != null ? `${kpis.questionAccuracy}%` : "—"} iconColor="#D69E2E" />
          </SimpleGrid>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <KpiCard icon={FiClock} label="Avg Completion Time" value={kpis.averageCompletionTime != null ? `${kpis.averageCompletionTime} min` : "—"} iconColor="#805AD5" />
            <KpiCard icon={FiAward} label="Median Score" value={kpis.medianScore != null ? `${kpis.medianScore}%` : "—"} iconColor="#2D3748" />
            <KpiCard icon={FiAward} label="Mean Score" value={kpis.meanScore != null ? `${kpis.meanScore}%` : "—"} iconColor="#2D3748" />
            <KpiCard icon={FiBarChart2} label="Median/Mean Gap" value={kpis.performanceGap != null ? kpis.performanceGap : "—"} iconColor="#E53E3E" />
          </SimpleGrid>
        </>
      )}

      {/* Student results table */}
      <SectionDivider title="Student Results" />
      {students.length === 0 ? (
        <EmptyState label="No student results found for this exam." />
      ) : (
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden" shadow="sm">
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.500" fontSize="11px" py={3}>Student</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center">Score</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center">Grade</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center">Accuracy</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center" display={{ base: "none", md: "table-cell" }}>Correct</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center" display={{ base: "none", md: "table-cell" }}>Wrong</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center" display={{ base: "none", md: "table-cell" }}>Time</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center">Rank</Th>
                  <Th color="gray.500" fontSize="11px" textAlign="center">Status</Th>
                  <Th color="gray.500" fontSize="11px" />
                </Tr>
              </Thead>
              <Tbody>
                {students.map((s, i) => (
                  <Tr
                    key={s.attemptId ?? i}
                    _hover={{ bg: "purple.50", cursor: "pointer" }}
                    onClick={() => onSelectStudent(s.studentId)}
                  >
                    <Td py={3}>
                      <Text bold fontSize="sm" color="gray.800" noOfLines={1}>{s.studentName ?? "—"}</Text>
                      <Text as="level5" color="gray.400" fontSize="xs">{s.email ?? ""}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text bold fontSize="sm" color="gray.800">{s.totalScore != null ? `${s.totalScore}%` : "—"}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme={gradeColor(s.grade)} borderRadius="full" px={2} fontSize="xs">{s.grade ?? "—"}</Badge>
                    </Td>
                    <Td textAlign="center">
                      <Text fontSize="sm" color="gray.700">{s.accuracy != null ? `${s.accuracy}%` : "—"}</Text>
                    </Td>
                    <Td textAlign="center" display={{ base: "none", md: "table-cell" }}>
                      <Text fontSize="sm" color="green.600" bold>{s.correctAnswers ?? "—"}</Text>
                    </Td>
                    <Td textAlign="center" display={{ base: "none", md: "table-cell" }}>
                      <Text fontSize="sm" color="red.500" bold>{s.wrongAnswers ?? "—"}</Text>
                    </Td>
                    <Td textAlign="center" display={{ base: "none", md: "table-cell" }}>
                      <Text fontSize="sm" color="gray.600">{s.timeTaken != null ? `${s.timeTaken}m` : "—"}</Text>
                    </Td>
                    <Td textAlign="center">
                      {s.rank != null ? (
                        <Box
                          as="span"
                          px={2} py={0.5}
                          borderRadius="full"
                          fontSize="12px"
                          fontWeight="700"
                          bg={rankBadgeStyles(s.rank).bg}
                          color={rankBadgeStyles(s.rank).color}
                        >
                          #{s.rank}
                        </Box>
                      ) : "—"}
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme={statusScheme(s.status)} borderRadius="full" px={2} fontSize="xs">{s.status ?? "—"}</Badge>
                    </Td>
                    <Td>
                      <Text as="level5" color="purple.500" fontSize="xs" fontWeight="600">View</Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ── Tab 2: Leaderboard ────────────────────────────────────────────────────────

const LeaderboardTab = ({ leaderboard, loading, error, onRetry, onSelectStudent }) => {
  if (loading) return <LoadingState label="Loading leaderboard…" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!leaderboard?.length) return <EmptyState label="No leaderboard data available." />;

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden" shadow="sm">
        {/* Header */}
        <Box
          display="grid"
          gridTemplateColumns="60px 1fr 100px 80px 80px 80px"
          bg="gray.50"
          borderBottom="1px"
          borderColor="gray.200"
          px={4}
          py={3}
        >
          {["Rank", "Student", "Score", "Grade", "Time", "Status"].map((h) => (
            <Text key={h} bold as="level5" color="gray.600" fontSize="xs">{h}</Text>
          ))}
        </Box>

        {leaderboard.map((entry, i) => {
          const styles = rankBadgeStyles(entry.rank);
          return (
            <Box
              key={entry.studentId ?? i}
              display="grid"
              gridTemplateColumns="60px 1fr 100px 80px 80px 80px"
              alignItems="center"
              px={4}
              py={3}
              borderBottom="1px"
              borderColor="gray.100"
              _last={{ borderBottom: "none" }}
              _hover={{ bg: "purple.50", cursor: "pointer" }}
              onClick={() => onSelectStudent(entry.studentId)}
            >
              <Box>
                <Box
                  as="span"
                  px={2} py={0.5}
                  borderRadius="full"
                  fontSize="12px"
                  fontWeight="700"
                  bg={styles.bg}
                  color={styles.color}
                >
                  #{entry.rank}
                </Box>
              </Box>

              <Text bold fontSize="sm" color="gray.800" noOfLines={1}>{entry.studentName ?? "—"}</Text>

              <Text bold fontSize="sm" color="gray.800">{entry.score != null ? `${entry.score}%` : "—"}</Text>

              <Badge colorScheme={gradeColor(entry.grade)} borderRadius="full" px={2} fontSize="xs">{entry.grade ?? "—"}</Badge>

              <Text fontSize="sm" color="gray.600">{entry.timeTaken != null ? `${entry.timeTaken}m` : "—"}</Text>

              <Badge colorScheme={statusScheme(entry.status)} borderRadius="full" px={2} fontSize="xs">{entry.status ?? "—"}</Badge>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ── Tab 3: Analytics ──────────────────────────────────────────────────────────

const AnalyticsTab = ({ chartData, loading, error, onRetry }) => {
  if (loading) return <LoadingState label="Loading chart data…" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!chartData) return <EmptyState label="No chart data available." />;

  const { passFailDistribution, sectionPerformance = [], accuracyRatio } = chartData;

  const passFailBar = {
    labels: ["Pass", "Fail"],
    datasets: [
      {
        label: "Students",
        data: [passFailDistribution?.pass ?? 0, passFailDistribution?.fail ?? 0],
        backgroundColor: ["#38A16980", "#E53E3E80"],
        borderColor: ["#38A169", "#E53E3E"],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const sectionBar = {
    labels: sectionPerformance.map((s) => s.section),
    datasets: [
      {
        label: "Avg Score",
        data: sectionPerformance.map((s) => s.averageScore),
        backgroundColor: "#66006680",
        borderColor: "#660066",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const accuracyDoughnut = {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        data: [accuracyRatio?.correct ?? 0, accuracyRatio?.incorrect ?? 0],
        backgroundColor: ["#38A169", "#E53E3E"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const barOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, font: { size: 13 } },
    },
    scales: { y: { beginAtZero: true } },
  });

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>

        {/* Pass / Fail distribution */}
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={5} shadow="sm">
          <Bar data={passFailBar} options={barOptions("Pass vs Fail Distribution")} />
        </Box>

        {/* Section performance */}
        {sectionPerformance.length > 0 ? (
          <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={5} shadow="sm">
            <Bar data={sectionBar} options={barOptions("Average Score by Section")} />
          </Box>
        ) : (
          <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={5} display="flex" alignItems="center" justifyContent="center">
            <Text as="level5" color="gray.400">No section data available.</Text>
          </Box>
        )}

      </SimpleGrid>

      {/* Accuracy ratio */}
      {(accuracyRatio?.correct != null || accuracyRatio?.incorrect != null) && (
        <Box mt={6} bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={6} shadow="sm">
          <Text bold fontSize="md" color="gray.700" mb={4}>Answer Accuracy Ratio</Text>
          <Flex justify="center" align="center" gap={10} flexWrap="wrap">
            <Box maxW="220px" w="100%">
              <Doughnut
                data={accuracyDoughnut}
                options={{
                  cutout: "65%",
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </Box>
            <Box>
              <HStack spacing={4} mb={2}>
                <Box w={3} h={3} borderRadius="full" bg="#38A169" />
                <Text bold fontSize="lg" color="green.700">{accuracyRatio?.correct ?? 0}</Text>
                <Text as="level5" color="gray.500">Correct</Text>
              </HStack>
              <HStack spacing={4}>
                <Box w={3} h={3} borderRadius="full" bg="#E53E3E" />
                <Text bold fontSize="lg" color="red.600">{accuracyRatio?.incorrect ?? 0}</Text>
                <Text as="level5" color="gray.500">Incorrect</Text>
              </HStack>
              {(accuracyRatio?.correct != null && accuracyRatio?.incorrect != null) && (
                <Text as="level5" color="gray.400" mt={3}>
                  Total: {(accuracyRatio.correct + accuracyRatio.incorrect).toLocaleString()} answers
                </Text>
              )}
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

// ── Student Detail Drawer ─────────────────────────────────────────────────────

const StudentDetailDrawer = ({ examId, studentId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !studentId) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminGetStudentExamResultAnalysis(examId, studentId);
        setData(res?.data ?? null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load student result");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isOpen, examId, studentId]);

  const sectionEntries = data?.sectionScores ? Object.entries(data.sectionScores) : [];

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.200">
          <Text bold fontSize="md" color="gray.800">Student Result Detail</Text>
        </DrawerHeader>
        <DrawerBody pt={5} pb={8}>
          {loading ? (
            <Flex h="200px" justify="center" align="center" direction="column">
              <Spinner size="lg" />
              <Text mt={3} color="gray.500" fontSize="sm">Loading…</Text>
            </Flex>
          ) : error ? (
            <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={5} textAlign="center">
              <Text color="red.700" fontSize="sm">{error}</Text>
            </Box>
          ) : !data ? null : (
            <Box>
              {/* Student info */}
              <Box mb={5}>
                <Text bold fontSize="lg" color="gray.800">{data.studentName ?? "—"}</Text>
                <Text as="level5" color="gray.500">{data.email ?? ""}</Text>
                <Text as="level5" color="gray.400" mt={1}>
                  {data.examTitle ?? ""}{data.examDate ? ` · ${dayjs(data.examDate).format("DD MMM YYYY")}` : ""}
                </Text>
              </Box>

              <Flex gap={2} mb={5} flexWrap="wrap">
                {data.status && (
                  <Badge colorScheme={statusScheme(data.status)} borderRadius="full" px={3} py={1}>{data.status}</Badge>
                )}
                {data.grade && (
                  <Badge colorScheme={gradeColor(data.grade)} borderRadius="full" px={3} py={1}>Grade {data.grade}</Badge>
                )}
                {data.resultStatus && (
                  <Badge colorScheme={data.resultStatus === "released" ? "green" : "yellow"} borderRadius="full" px={3} py={1} textTransform="capitalize">
                    {data.resultStatus}
                  </Badge>
                )}
              </Flex>

              <Divider mb={5} borderColor="gray.200" />

              {/* Stats grid */}
              <SimpleGrid columns={2} spacing={4} mb={5}>
                {[
                  { label: "Total Score", value: data.totalScore != null ? `${data.totalScore}%` : "—" },
                  { label: "Accuracy", value: data.accuracy != null ? `${data.accuracy}%` : "—" },
                  { label: "Correct Answers", value: data.correctAnswers ?? "—" },
                  { label: "Wrong Answers", value: data.wrongAnswers ?? "—" },
                  { label: "Time Taken", value: data.timeTaken != null ? `${data.timeTaken} min` : "—" },
                  { label: "Rank", value: data.rank != null ? `#${data.rank}` : "—" },
                  { label: "Percentile", value: data.percentile != null ? `Top ${data.percentile}%` : "—" },
                  { label: "Auto Score", value: data.autoScore != null ? `${data.autoScore}%` : "—" },
                  { label: "Manual Score", value: data.manualScore != null ? `${data.manualScore}%` : "—" },
                ].map(({ label, value }) => (
                  <Box key={label} bg="gray.50" borderRadius="md" px={3} py={3}>
                    <Text as="level5" color="gray.500" mb={0.5}>{label}</Text>
                    <Text bold fontSize="md" color="gray.800">{value}</Text>
                  </Box>
                ))}
              </SimpleGrid>

              {/* Section scores */}
              {sectionEntries.length > 0 && (
                <>
                  <Divider mb={4} borderColor="gray.200" />
                  <Text bold fontSize="sm" color="gray.700" mb={3}>Section Scores</Text>
                  <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
                    {sectionEntries.map(([section, score]) => (
                      <Flex
                        key={section}
                        justifyContent="space-between"
                        alignItems="center"
                        px={4}
                        py={3}
                        borderBottom="1px"
                        borderColor="gray.100"
                        _last={{ borderBottom: "none" }}
                      >
                        <Text fontSize="sm" color="gray.700">{section}</Text>
                        <Text bold fontSize="sm" color="gray.800">{score}</Text>
                      </Flex>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const TAB_OVERVIEW = 0;
const TAB_LEADERBOARD = 1;
const TAB_ANALYTICS = 2;

const AdminExamResultAnalysisPage = () => {
  const { examId } = useParams();
  const toast = useToast();
  const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();

  const [tabIndex, setTabIndex] = useState(TAB_OVERVIEW);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Overview / report
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);

  // Chart data
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  const fetchReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await adminGetExamFullReport(examId);
      setReport(res?.data ?? null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load report";
      setReportError(msg);
      toast({ status: "error", description: msg, duration: 4000, isClosable: true, position: "top" });
    } finally {
      setReportLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const res = await adminGetExamLeaderboard(examId, { limit: 100 });
      setLeaderboard(res?.data?.leaderboard ?? []);
    } catch (err) {
      setLeaderboardError(err?.response?.data?.message || err?.message || "Failed to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const fetchChartData = async () => {
    setChartLoading(true);
    setChartError(null);
    try {
      const res = await adminGetExamChartData(examId);
      setChartData(res?.data ?? null);
    } catch (err) {
      setChartError(err?.response?.data?.message || err?.message || "Failed to load chart data");
    } finally {
      setChartLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (examId) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // Lazy-load per tab on first visit
  useEffect(() => {
    if (tabIndex === TAB_LEADERBOARD && leaderboard === null) fetchLeaderboard();
    if (tabIndex === TAB_ANALYTICS && chartData === null) fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    openDrawer();
  };

  const students = report?.students ?? [];
  const exportRows = [
    ["Student", "Email", "Score (%)", "Grade", "Accuracy (%)", "Correct", "Wrong", "Time (min)", "Rank", "Status"],
    ...students.map((s) => [
      s.studentName ?? "",
      s.email ?? "",
      s.totalScore ?? "",
      s.grade ?? "",
      s.accuracy ?? "",
      s.correctAnswers ?? "",
      s.wrongAnswers ?? "",
      s.timeTaken ?? "",
      s.rank ?? "",
      s.status ?? "",
    ]),
  ];

  const tabStyle = {
    fontSize: "14px",
    fontWeight: "500",
    px: 0,
    mr: 8,
    color: "#101928",
    _focus: { boxShadow: "none" },
    _selected: { color: "#660066", fontWeight: "600", borderBottom: "2px solid #660066" },
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/examination">Examination Analysis</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Exam Result Analysis</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      {/* Page header */}
      <Flex justifyContent="space-between" alignItems="flex-start" mb={6} mt={2} flexWrap="wrap" gap={3}>
        <Box>
          <Heading as="h2" size="md" color="gray.800">Exam Result Analysis</Heading>
          <Text as="level5" color="gray.500" mt={1}>
            Comprehensive exam performance breakdown for instructors and admins
          </Text>
        </Box>
        <Flex gap={3} alignItems="center">
          <ExportMenu
            rows={exportRows}
            filename="exam-result-analysis"
            title="Exam Result Analysis"
            isDisabled={students.length === 0}
          />
          <Button
            secondary
            onClick={() => {
              fetchReport();
              if (tabIndex === TAB_LEADERBOARD) fetchLeaderboard();
              if (tabIndex === TAB_ANALYTICS) fetchChartData();
            }}
          >
            Refresh
          </Button>
        </Flex>
      </Flex>

      {/* Mini tab bar */}
      <Tabs
        colorScheme="purple"
        variant="line"
        index={tabIndex}
        onChange={setTabIndex}
      >
        <TabList borderBottom="1.5px solid #D5D7DA">
          <Tab {...tabStyle}>Overview</Tab>
          <Tab {...tabStyle}>Leaderboard</Tab>
          <Tab {...tabStyle} mr={0}>Analytics</Tab>
        </TabList>

        <TabPanels>
          {/* Tab 1 – Overview */}
          <TabPanel px={0} pt={6}>
            <OverviewTab
              report={report}
              loading={reportLoading}
              error={reportError}
              onRetry={fetchReport}
              onSelectStudent={handleSelectStudent}
            />
          </TabPanel>

          {/* Tab 2 – Leaderboard */}
          <TabPanel px={0} pt={6}>
            <LeaderboardTab
              leaderboard={leaderboard}
              loading={leaderboardLoading}
              error={leaderboardError}
              onRetry={fetchLeaderboard}
              onSelectStudent={handleSelectStudent}
            />
          </TabPanel>

          {/* Tab 3 – Analytics */}
          <TabPanel px={0} pt={6}>
            <AnalyticsTab
              chartData={chartData}
              loading={chartLoading}
              error={chartError}
              onRetry={fetchChartData}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Student Detail Drawer */}
      <StudentDetailDrawer
        examId={examId}
        studentId={selectedStudentId}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </AdminMainAreaWrapper>
  );
};

export const AdminExamResultAnalysisPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <AdminExamResultAnalysisPage {...props} />} />
);

export default AdminExamResultAnalysisPage;
