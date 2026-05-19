import { useEffect, useState } from "react";
import { Route } from "react-router-dom";
import AssessmentTabBar from "./AssessmentTabBar";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import { BreadcrumbItem, Select, Tag, useToast } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Spinner,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetAssessmentOverview,
  adminGetDepartmentListing,
  adminListCoursesForReport,
} from "../../../../services";
import dayjs from "dayjs";

const passFailColorMap = { Pass: "green", Fail: "red" };
const gradeColorMap = { A: "green", B: "blue", C: "yellow", F: "red" };

const TH = ({ children, w }) => (
  <Box
    as="th"
    textAlign="left"
    px={4}
    py={3}
    fontSize="12px"
    fontWeight="600"
    color="gray.500"
    textTransform="uppercase"
    letterSpacing="0.05em"
    width={w}
    whiteSpace="nowrap"
  >
    {children}
  </Box>
);

const TD = ({ children }) => (
  <Box as="td" px={4} py={3} fontSize="14px" color="#101828" verticalAlign="middle">
    {children}
  </Box>
);

const SummaryBox = ({ label, value, color }) => (
  <Box
    bg="white"
    border="1px"
    borderColor="gray.200"
    borderRadius="lg"
    p={6}
    shadow="sm"
    textAlign="center"
    flex="1"
  >
    <Text fontSize="3xl" fontWeight="800" color={color ?? "primary.base"}>
      {value ?? "—"}
    </Text>
    <Text fontSize="sm" color="gray.500" mt={1} fontWeight="500">
      {label}
    </Text>
  </Box>
);

const AssessmentOverviewPage = () => {
  const toast = useToast();

  // Filter options
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Filters
  const [courseId, setCourseId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Report data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [totalCourses, setTotalCourses] = useState(null);

  // Load filter options on mount
  useEffect(() => {
    Promise.allSettled([
      adminListCoursesForReport(),
      adminGetDepartmentListing(),
    ]).then(([coursesRes, deptsRes]) => {
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value.rows ?? []);
      if (deptsRes.status === "fulfilled") setDepartments(deptsRes.value.departments ?? []);
    }).finally(() => setFiltersLoading(false));
  }, []);

  // Auto-load overview on mount
  useEffect(() => {
    fetchOverview({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOverview = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetAssessmentOverview(params);
      const data = res?.data ?? {};
      setResults(data.assessments ?? data.results ?? []);
      setKpis(data.kpis ?? null);
      setTotalCourses(data.totalCourses ?? null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Unable to fetch overview report";
      setError(message);
      toast({ status: "error", description: message, duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const params = {};
    if (courseId) params.courseId = courseId;
    if (departmentId) params.departmentId = departmentId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    fetchOverview(params);
  };

  const handleClearFilters = () => {
    setCourseId("");
    setDepartmentId("");
    setStartDate("");
    setEndDate("");
    fetchOverview({});
  };

  const hasActiveFilters = courseId || departmentId || startDate || endDate;

  const kpiAverage = kpis?.averageScore ?? kpis?.averageAssessmentScore ?? 0;
  const kpiDifficulty =
    kpis?.difficultyImpact ?? kpis?.questionDifficultyImpactAnalysis ?? "—";

  return (
    <AdminMainAreaWrapper>
      {/* Breadcrumb */}
      <Box my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/assessment-overview">Assessment Reports</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        rowGap={3}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={0}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">Assessment Reports</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Assessment performance data across courses, departments and the organisation.
          </Text>
        </Box>
        <Button secondary onClick={() => fetchOverview({})} isLoading={loading}>
          Refresh
        </Button>
      </Flex>

      <AssessmentTabBar />

      {/* Filters */}
      <Box
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="lg"
        p={5}
        mb={8}
        shadow="sm"
      >
        <Text fontWeight="600" fontSize="sm" mb={4} color="gray.700">
          Filter Report
        </Text>
        <Flex gap={4} flexWrap="wrap" alignItems="flex-end">
          {/* Course */}
          <Box minW={{ base: "100%", md: "220px" }} flex="1">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
              Course
            </Text>
            <Select
              placeholder={filtersLoading ? "Loading..." : "All courses"}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              isDisabled={filtersLoading}
              size="sm"
              borderRadius="md"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </Box>

          {/* Department */}
          <Box minW={{ base: "100%", md: "200px" }} flex="1">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
              Department
            </Text>
            <Select
              placeholder={filtersLoading ? "Loading..." : "All departments"}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              isDisabled={filtersLoading}
              size="sm"
              borderRadius="md"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </Box>

          {/* From date */}
          <Box minW="150px">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
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

          {/* To date */}
          <Box minW="150px">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
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

          <Flex gap={2} alignSelf="flex-end">
            <Button onClick={handleApply} isLoading={loading}>
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button secondary onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Loading */}
      {loading && (
        <Flex h="360px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">Loading overview report...</Text>
        </Flex>
      )}

      {/* Error */}
      {!loading && error && (
        <Box
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          p={6}
          textAlign="center"
        >
          <Text color="red.600" mb={3}>{error}</Text>
          <Button onClick={handleApply}>Try Again</Button>
        </Box>
      )}

      {/* Report body */}
      {!loading && !error && (
        <>
          {/* Summary totals */}
          {(totalCourses != null || results.length > 0) && (
            <Flex gap={4} mb={6} flexWrap="wrap">
              {totalCourses != null && (
                <SummaryBox
                  label="Total Courses"
                  value={totalCourses?.toLocaleString()}
                  color="#6B006B"
                />
              )}
              <SummaryBox
                label="Total Submissions"
                value={results.length.toLocaleString()}
                color="#1A5276"
              />
            </Flex>
          )}

          {/* KPI Cards */}
          {kpis && (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
              <DashboardMetricCard
                title="Average Score"
                value={`${kpiAverage}%`}
                change="org-wide mean"
                changeColor="#6B006B"
              />
              <DashboardMetricCard
                title="Highest Score"
                value={`${kpis.highestScore ?? 0}%`}
                change="top performer"
                changeColor="#1A8F3A"
              />
              <DashboardMetricCard
                title="Lowest Score"
                value={`${kpis.lowestScore ?? 0}%`}
                change="lowest recorded"
                changeColor="#C53030"
              />
              <DashboardMetricCard
                title="Pass Rate"
                value={`${kpis.passRate ?? 0}%`}
                change="of all submissions"
                changeColor={(kpis.passRate ?? 0) >= 70 ? "#1A8F3A" : "#B7791F"}
              />
              <DashboardMetricCard
                title="Difficulty Impact"
                value={kpiDifficulty}
                change="question analysis"
                changeColor="#6B006B"
              />
            </SimpleGrid>
          )}

          {/* Results table */}
          {results.length === 0 ? (
            <Box
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={10}
              textAlign="center"
            >
              <Text color="gray.400" fontSize="lg">No assessment data found.</Text>
              <Text as="p" fontSize="sm" color="gray.400" mt={1}>
                {hasActiveFilters
                  ? "Try adjusting or clearing the filters."
                  : "No assessments have been submitted yet."}
              </Text>
            </Box>
          ) : (
            <>
              <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <Text fontSize="sm" color="gray.500" fontWeight="500">
                  Showing {results.length} submission{results.length !== 1 ? "s" : ""}
                </Text>
              </Flex>
              <Box
                bg="white"
                border="1px"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="auto"
                shadow="sm"
              >
                <Box as="table" width="100%" borderCollapse="collapse">
                  <Box as="thead" bg="gray.50" borderBottom="1px" borderColor="gray.200">
                    <Box as="tr">
                      <TH w="170px">Student</TH>
                      <TH w="210px">Assessment</TH>
                      <TH w="190px">Course</TH>
                      <TH w="90px">Score</TH>
                      <TH w="80px">Grade</TH>
                      <TH w="85px">Result</TH>
                      <TH w="120px">Date Taken</TH>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {results.map((item, idx) => (
                      <Box
                        as="tr"
                        key={item.id ?? `${item.studentId}-${item.assessmentTitle}-${idx}`}
                        borderBottom="1px"
                        borderColor="gray.100"
                        _last={{ borderBottom: "none" }}
                        _hover={{ bg: "gray.50" }}
                      >
                        <TD>
                          <Text fontWeight="600" fontSize="14px">
                            {item.studentName ?? "—"}
                          </Text>
                        </TD>
                        <TD>{item.assessmentTitle ?? "—"}</TD>
                        <TD>
                          <Text fontSize="13px" color="gray.600">
                            {item.courseTitle ?? "—"}
                          </Text>
                        </TD>
                        <TD>
                          <Text
                            fontWeight="600"
                            color={
                              (item.score ?? 0) >= 70
                                ? "#1A8F3A"
                                : (item.score ?? 0) >= 50
                                ? "#B7791F"
                                : "#C53030"
                            }
                          >
                            {item.score ?? 0}%
                          </Text>
                        </TD>
                        <TD>
                          <Tag size="sm" borderRadius="full" colorScheme={gradeColorMap[item.grade] ?? "gray"}>
                            {item.grade ?? "—"}
                          </Tag>
                        </TD>
                        <TD>
                          <Tag size="sm" borderRadius="full" colorScheme={passFailColorMap[item.passFail] ?? "gray"}>
                            {item.passFail ?? "—"}
                          </Tag>
                        </TD>
                        <TD>
                          {item.dateTaken ?? item.submittedAt
                            ? dayjs(item.dateTaken ?? item.submittedAt).format("DD MMM YYYY")
                            : "—"}
                        </TD>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </>
      )}
    </AdminMainAreaWrapper>
  );
};

export const AssessmentOverviewPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AssessmentOverviewPage {...props} />} />
  );
};

export default AssessmentOverviewPage;
