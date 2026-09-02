import { useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, Grid, SimpleGrid } from "@chakra-ui/layout";
import { Badge, Select, useToast } from "@chakra-ui/react";
import { Button, Heading, Spinner, Text } from "../../../components";
import { studentGetMyAssessmentResults } from "../../../services";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";
import dayjs from "dayjs";

const passFailColorMap = {
  Pass: "green",
  Fail: "red",
};

const gradeColorMap = (grade = "") => {
  if (grade.startsWith("A")) return "green";
  if (grade.startsWith("B")) return "blue";
  if (grade.startsWith("C")) return "yellow";
  return "red";
};

const KpiCard = ({ title, value, sub }) => (
  <Box
    bg="white"
    border="1px"
    borderColor="gray.200"
    borderRadius="md"
    p={5}
    shadow="sm"
    textAlign="center"
  >
    <Text bold fontSize="heading.h3" color="primary.base">
      {value ?? "—"}
    </Text>
    <Text as="level5" color="accent.3" mt={1}>
      {title}
    </Text>
    {sub && (
      <Text as="level5" color="gray.400" mt={1} fontSize="xs">
        {sub}
      </Text>
    )}
  </Box>
);

const MyAssessmentResultsPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [courseFilter, setCourseFilter] = useState("");
  const [passFail, setPassFail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      const res = await studentGetMyAssessmentResults(params);
      const data = res?.data ?? {};
      setResults(data.assessments ?? []);
      setKpis(data.kpis ?? null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Unable to fetch assessment results";
      setError(message);
      toast({ status: "error", description: message, duration: 4000, isClosable: true, position: "top" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    fetchResults();
  };

  const handleClearFilters = () => {
    setCourseFilter("");
    setPassFail("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => fetchResults(), 0);
  };

  const courses = [...new Set(results.map((r) => r.courseTitle).filter(Boolean))];

  const displayedResults = results.filter((r) => {
    if (courseFilter && r.courseTitle !== courseFilter) return false;
    if (passFail && r.passFail !== passFail) return false;
    return true;
  });

  return (
    <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>
      <Box mb={6}>
        <Heading as="h1" fontSize="heading.h2" mb={1}>
          My Assessment Results
        </Heading>
        <Text color="accent.3">
          View your quiz and examination performance across all courses.
        </Text>
      </Box>

      {/* KPI Summary */}
      {kpis && (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
          <KpiCard title="Average Score" value={`${kpis.averageAssessmentScore ?? 0}%`} />
          <KpiCard title="Highest Score" value={`${kpis.highestScore ?? 0}%`} />
          <KpiCard title="Lowest Score" value={`${kpis.lowestScore ?? 0}%`} />
          <KpiCard title="Pass Rate" value={`${kpis.passRate ?? 0}%`} />
          <KpiCard title="Difficulty Impact" value={kpis.questionDifficultyImpactAnalysis ?? "—"} />
        </SimpleGrid>
      )}

      {/* Filters */}
      <Box
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        p={4}
        mb={6}
        shadow="sm"
      >
        <Flex
          gap={3}
          flexWrap="wrap"
          alignItems="flex-end"
        >
          {courses.length > 0 && (
            <Box minW="200px">
              <Text as="level5" color="gray.600" mb={1}>
                Course
              </Text>
              <Select
                size="sm"
                borderRadius="md"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                placeholder="All Courses"
              >
                {courses.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </Select>
            </Box>
          )}

          <Box minW="140px">
            <Text as="level5" color="gray.600" mb={1}>
              Result
            </Text>
            <Select
              size="sm"
              borderRadius="md"
              value={passFail}
              onChange={(e) => setPassFail(e.target.value)}
              placeholder="All"
            >
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </Select>
          </Box>

          <Box minW="160px">
            <Text as="level5" color="gray.600" mb={1}>
              From
            </Text>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                fontSize: "14px",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                padding: "6px 10px",
                width: "100%",
              }}
            />
          </Box>

          <Box minW="160px">
            <Text as="level5" color="gray.600" mb={1}>
              To
            </Text>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                fontSize: "14px",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                padding: "6px 10px",
                width: "100%",
              }}
            />
          </Box>

          <Flex gap={2} mt={{ base: 2, md: 0 }}>
            <Button onClick={handleApplyFilters} isLoading={loading}>
              Apply
            </Button>
            <Button secondary onClick={handleClearFilters}>
              Clear
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Results */}
      {loading ? (
        <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">
            Loading assessment results...
          </Text>
        </Flex>
      ) : error ? (
        <Box
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          p={6}
          textAlign="center"
        >
          <Text color="red.600" mb={3}>
            {error}
          </Text>
          <Button onClick={fetchResults}>Try Again</Button>
        </Box>
      ) : displayedResults.length === 0 ? (
        <Box
          bg="gray.50"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={10}
          textAlign="center"
        >
          <Text color="gray.400" fontSize="lg" mb={1}>
            No assessment results found
          </Text>
          <Text as="level5" color="gray.400">
            {passFail || courseFilter || startDate || endDate
              ? "Try adjusting your filters."
              : "You have not submitted any assessments yet."}
          </Text>
        </Box>
      ) : (
        <Box
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          overflow="hidden"
          shadow="sm"
        >
          {/* Table header */}
          <Grid
            templateColumns="2fr 1.5fr 120px 70px 80px 90px 1fr"
            bg="gray.50"
            borderBottom="1px"
            borderColor="gray.200"
            px={5}
            py={3}
            display={{ base: "none", lg: "grid" }}
          >
            <Text bold as="level5" color="gray.600">Assessment</Text>
            <Text bold as="level5" color="gray.600">Course</Text>
            <Text bold as="level5" color="gray.600">Date</Text>
            <Text bold as="level5" color="gray.600" textAlign="center">Score</Text>
            <Text bold as="level5" color="gray.600" textAlign="center">Grade</Text>
            <Text bold as="level5" color="gray.600" textAlign="center">Result</Text>
            <Text bold as="level5" color="gray.600">Feedback</Text>
          </Grid>

          {displayedResults.map((item, idx) => (
            <Box
              key={`${item.assessmentTitle}-${idx}`}
              borderBottom="1px"
              borderColor="gray.100"
              _last={{ borderBottom: "none" }}
              px={5}
              py={4}
            >
              {/* Desktop row */}
              <Grid
                templateColumns="2fr 1.5fr 120px 70px 80px 90px 1fr"
                alignItems="center"
                gap={2}
                display={{ base: "none", lg: "grid" }}
              >
                <Box>
                  <Text bold color="gray.800" noOfLines={1}>
                    {item.assessmentTitle}
                  </Text>
                  <Text as="level5" color="gray.400">
                    Attempt #{item.attemptNumber ?? 1} &nbsp;·&nbsp;{" "}
                    {item.timeTakenMinutes != null ? `${item.timeTakenMinutes} min` : "—"}
                  </Text>
                </Box>

                <Text as="level5" color="gray.600" noOfLines={1}>
                  {item.courseTitle ?? "—"}
                </Text>

                <Text as="level5" color="gray.600">
                  {item.submittedAt
                    ? dayjs(item.submittedAt).format("DD MMM YYYY")
                    : "—"}
                </Text>

                <Text bold textAlign="center" color="gray.800">
                  {item.score != null ? `${item.score}%` : "—"}
                </Text>

                <Flex justify="center">
                  <Badge
                    colorScheme={gradeColorMap(item.grade)}
                    borderRadius="full"
                    px={2}
                    fontSize="11px"
                  >
                    {item.grade ?? "—"}
                  </Badge>
                </Flex>

                <Flex justify="center">
                  <Badge
                    colorScheme={passFailColorMap[item.passFail] ?? "gray"}
                    borderRadius="full"
                    px={2}
                    fontSize="11px"
                  >
                    {item.passFail ?? "—"}
                  </Badge>
                </Flex>

                <Text as="level5" color="gray.500" noOfLines={2}>
                  {item.instructorFeedback ?? "No feedback yet"}
                </Text>
              </Grid>

              {/* Mobile card */}
              <Box display={{ base: "block", lg: "none" }}>
                <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1} pr={2}>
                    <Text bold color="gray.800">
                      {item.assessmentTitle}
                    </Text>
                    <Text as="level5" color="gray.400">
                      {item.courseTitle}
                    </Text>
                  </Box>
                  <Flex gap={1}>
                    <Badge
                      colorScheme={gradeColorMap(item.grade)}
                      borderRadius="full"
                      px={2}
                      fontSize="11px"
                    >
                      {item.grade ?? "—"}
                    </Badge>
                    <Badge
                      colorScheme={passFailColorMap[item.passFail] ?? "gray"}
                      borderRadius="full"
                      px={2}
                      fontSize="11px"
                    >
                      {item.passFail ?? "—"}
                    </Badge>
                  </Flex>
                </Flex>
                <Flex gap={4} flexWrap="wrap" mb={1}>
                  <Text as="level5" color="gray.600">
                    Score: <strong>{item.score != null ? `${item.score}%` : "—"}</strong>
                  </Text>
                  <Text as="level5" color="gray.600">
                    Duration:{" "}
                    <strong>
                      {item.timeTakenMinutes != null ? `${item.timeTakenMinutes} min` : "—"}
                    </strong>
                  </Text>
                  <Text as="level5" color="gray.400">
                    {item.submittedAt ? dayjs(item.submittedAt).format("DD MMM YYYY") : ""}
                  </Text>
                </Flex>
                {item.instructorFeedback && (
                  <Text as="level5" color="gray.500" mt={1}>
                    {item.instructorFeedback}
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export const MyAssessmentResultsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <MyAssessmentResultsPage {...props} />} />
  );
};

export default MyAssessmentResultsPage;
