import { useEffect, useState } from "react";
import { Route, useLocation, useParams } from "react-router-dom";
import { Box, Flex, SimpleGrid, Divider, Badge } from "@chakra-ui/react";
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
import { FiAward, FiCheck, FiClock, FiTarget, FiTrendingUp, FiX } from "react-icons/fi";
import { Button, Heading, Spinner, Text } from "../../../components";
import { studentGetExamResultAnalysis } from "../../../services";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";
import dayjs from "dayjs";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusScheme = (status) => (status === "Pass" ? "green" : "red");
const resultStatusScheme = (s) => {
  if (s === "released") return "green";
  if (s === "pending") return "yellow";
  return "gray";
};

const gradeColor = (grade = "") => {
  const g = grade.charAt(0).toUpperCase();
  if (g === "A") return "#38A169";
  if (g === "B") return "#3182CE";
  if (g === "C") return "#DD6B20";
  return "#E53E3E";
};

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

const StatCard = ({ icon: Icon, label, value, iconColor = "#660066", sub }) => (
  <Box
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="10px"
    px={4}
    py={4}
    shadow="sm"
  >
    <Flex alignItems="center" gap={3} mb={2}>
      <Box
        w="32px"
        h="32px"
        bg={`${iconColor}18`}
        borderRadius="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon color={iconColor} size={15} />
      </Box>
      <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
    </Flex>
    <Text bold fontSize="2xl" color="gray.800" lineHeight="1.1">
      {value ?? "—"}
    </Text>
    {sub && (
      <Text as="level5" color="gray.400" mt={1} fontSize="xs">
        {sub}
      </Text>
    )}
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────

const StudentExamResultAnalysisPage = () => {
  const { examId } = useParams();
  const { search } = useLocation();
  const cohortId = new URLSearchParams(search).get("cohortId") || undefined;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (cohortId) params.cohortId = cohortId;
      const res = await studentGetExamResultAnalysis(examId, params);
      setData(res?.data ?? null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Unable to load exam result";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, cohortId]);

  // ── Section score bar chart ───────────────────────────────────────────────

  const sectionEntries = data?.sectionScores ? Object.entries(data.sectionScores) : [];
  const sectionBarData = {
    labels: sectionEntries.map(([k]) => k),
    datasets: [
      {
        label: "Section Score",
        data: sectionEntries.map(([, v]) => v),
        backgroundColor: "#66006690",
        borderColor: "#660066",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const sectionBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // ── Correct / Wrong doughnut ──────────────────────────────────────────────

  const correctCount = data?.correctAnswers ?? 0;
  const wrongCount = data?.wrongAnswers ?? 0;
  const doughnutData = {
    labels: ["Correct", "Wrong"],
    datasets: [
      {
        data: [correctCount, wrongCount],
        backgroundColor: ["#38A169", "#E53E3E"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "65%",
    plugins: {
      legend: { position: "bottom" },
    },
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>

      {/* Page header */}
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Heading as="h2" size="md" color="gray.800">
            Exam Result Analysis
          </Heading>
          <Text as="level5" color="gray.500" mt={1}>
            Detailed breakdown of your exam performance
          </Text>
        </Box>
        <Button secondary onClick={fetchData} isLoading={loading}>
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Flex h="360px" justify="center" align="center" direction="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">Loading your exam result…</Text>
        </Flex>
      ) : error ? (
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={8} textAlign="center">
          <Text color="red.700" mb={3}>{error}</Text>
          <Button secondary onClick={fetchData}>Try Again</Button>
        </Box>
      ) : !data ? (
        <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={10} textAlign="center">
          <Text color="gray.400" fontSize="lg" mb={1}>No result found</Text>
          <Text as="level5" color="gray.400">No result was found for this exam. Please check back later.</Text>
        </Box>
      ) : (
        <>
          {/* ── Exam & Student Info Banner ────────────────────────────────── */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            px={5}
            py={4}
            shadow="sm"
            display="flex"
            flexWrap="wrap"
            gap={4}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box>
              <Text bold fontSize="lg" color="gray.800">
                {data.examTitle ?? "Exam"}
              </Text>
              <Text as="level5" color="gray.500" mt={0.5}>
                {data.examDate ? dayjs(data.examDate).format("DD MMM YYYY, h:mm A") : "—"}
              </Text>
              <Text as="level5" color="gray.600" mt={1}>
                {data.studentName ?? "—"}
                {data.email ? ` · ${data.email}` : ""}
              </Text>
            </Box>

            <Flex gap={2} alignItems="center" flexWrap="wrap">
              {data.status && (
                <Badge colorScheme={statusScheme(data.status)} borderRadius="full" px={3} py={1} fontSize="sm">
                  {data.status}
                </Badge>
              )}
              {data.grade && (
                <Badge
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="sm"
                  bg={`${gradeColor(data.grade)}18`}
                  color={gradeColor(data.grade)}
                >
                  Grade {data.grade}
                </Badge>
              )}
              {data.resultStatus && (
                <Badge colorScheme={resultStatusScheme(data.resultStatus)} borderRadius="full" px={3} py={1} fontSize="sm" textTransform="capitalize">
                  {data.resultStatus}
                </Badge>
              )}
            </Flex>
          </Box>

          {/* ── KPI Cards ─────────────────────────────────────────────────── */}
          <SectionBlock title="Performance Summary">
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
              <StatCard
                icon={FiTarget}
                label="Total Score"
                value={data.totalScore != null ? `${data.totalScore}%` : "—"}
                iconColor="#660066"
              />
              <StatCard
                icon={FiTrendingUp}
                label="Accuracy"
                value={data.accuracy != null ? `${data.accuracy}%` : "—"}
                iconColor="#3182CE"
              />
              <StatCard
                icon={FiClock}
                label="Time Taken"
                value={data.timeTaken != null ? `${data.timeTaken} min` : "—"}
                iconColor="#D69E2E"
              />
              <StatCard
                icon={FiAward}
                label="Rank"
                value={data.rank != null ? `#${data.rank}` : "—"}
                iconColor="#38A169"
                sub={data.percentile != null ? `Top ${data.percentile}%` : undefined}
              />
              <StatCard
                icon={FiCheck}
                label="Correct"
                value={data.correctAnswers ?? "—"}
                iconColor="#38A169"
              />
              <StatCard
                icon={FiX}
                label="Wrong"
                value={data.wrongAnswers ?? "—"}
                iconColor="#E53E3E"
              />
            </SimpleGrid>
          </SectionBlock>

          {/* ── Score Breakdown ───────────────────────────────────────────── */}
          {(data.autoScore != null || data.manualScore != null) && (
            <SectionBlock title="Score Breakdown">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={5} shadow="sm">
                  <Text as="level5" color="gray.500" mb={1}>Auto Score</Text>
                  <Text bold fontSize="2xl" color="#660066">
                    {data.autoScore != null ? `${data.autoScore}%` : "—"}
                  </Text>
                  <Text as="level5" color="gray.400" mt={1} fontSize="xs">
                    Automatically graded questions
                  </Text>
                </Box>
                <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={5} shadow="sm">
                  <Text as="level5" color="gray.500" mb={1}>Manual Score</Text>
                  <Text bold fontSize="2xl" color="#3182CE">
                    {data.manualScore != null ? `${data.manualScore}%` : "—"}
                  </Text>
                  <Text as="level5" color="gray.400" mt={1} fontSize="xs">
                    Instructor-graded questions
                  </Text>
                </Box>
              </SimpleGrid>
            </SectionBlock>
          )}

          {/* ── Charts ────────────────────────────────────────────────────── */}
          <SimpleGrid columns={{ base: 1, md: sectionEntries.length > 0 ? 2 : 1 }} spacing={4} mt={8}>

            {/* Section scores bar chart */}
            {sectionEntries.length > 0 && (
              <Box>
                <Box mb={4}>
                  <Heading as="h3" size="sm" color="gray.700" fontWeight="600">
                    Section Scores
                  </Heading>
                  <Divider mt={2} borderColor="gray.200" />
                </Box>
                <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={5} shadow="sm">
                  <Bar data={sectionBarData} options={sectionBarOptions} />
                </Box>
              </Box>
            )}

            {/* Correct / Wrong doughnut */}
            {(correctCount > 0 || wrongCount > 0) && (
              <Box>
                <Box mb={4}>
                  <Heading as="h3" size="sm" color="gray.700" fontWeight="600">
                    Answer Breakdown
                  </Heading>
                  <Divider mt={2} borderColor="gray.200" />
                </Box>
                <Box
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={5}
                  shadow="sm"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Box maxW="260px" w="100%">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </Box>
                  <Flex gap={6} mt={4} justifyContent="center" flexWrap="wrap">
                    <Flex align="center" gap={2}>
                      <Box w={3} h={3} borderRadius="full" bg="#38A169" />
                      <Text as="level5" color="gray.600">
                        Correct: <strong>{correctCount}</strong>
                      </Text>
                    </Flex>
                    <Flex align="center" gap={2}>
                      <Box w={3} h={3} borderRadius="full" bg="#E53E3E" />
                      <Text as="level5" color="gray.600">
                        Wrong: <strong>{wrongCount}</strong>
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Box>
            )}
          </SimpleGrid>

          {/* ── Section Scores table ──────────────────────────────────────── */}
          {sectionEntries.length > 0 && (
            <SectionBlock title="Section Score Details">
              <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden" shadow="sm">
                <Box
                  display="grid"
                  gridTemplateColumns="1fr 120px"
                  bg="gray.50"
                  borderBottom="1px"
                  borderColor="gray.200"
                  px={4}
                  py={3}
                >
                  <Text bold as="level5" color="gray.600">Section</Text>
                  <Text bold as="level5" color="gray.600" textAlign="right">Score</Text>
                </Box>
                {sectionEntries.map(([section, score]) => (
                  <Box
                    key={section}
                    display="grid"
                    gridTemplateColumns="1fr 120px"
                    alignItems="center"
                    px={4}
                    py={3}
                    borderBottom="1px"
                    borderColor="gray.100"
                    _last={{ borderBottom: "none" }}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Text fontSize="sm" color="gray.700">{section}</Text>
                    <Text bold fontSize="sm" color="gray.800" textAlign="right">{score}</Text>
                  </Box>
                ))}
              </Box>
            </SectionBlock>
          )}
        </>
      )}
    </Box>
  );
};

export const StudentExamResultAnalysisPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentExamResultAnalysisPage {...props} />} />
);

export default StudentExamResultAnalysisPage;
