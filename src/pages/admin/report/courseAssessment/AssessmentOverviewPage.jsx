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
  adminListModules,
  adminGetStudents,
  adminGetInstructorReportDirectory,
} from "../../../../services";
import dayjs from "dayjs";

const PAGE_SIZE = 20;

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

const AssessmentOverviewPage = () => {
  const toast = useToast();

  // Filter option lists
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Active filter values
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [instructorId, setInstructorId] = useState("");

  // Report data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [kpis, setKpis] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageSlice = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Load static filter options on mount
  useEffect(() => {
    Promise.allSettled([
      adminListCoursesForReport(),
      adminGetDepartmentListing(),
      adminGetStudents({ limit: 500 }),
      adminGetInstructorReportDirectory({ limit: 500 }),
    ]).then(([coursesRes, deptsRes, studentsRes, instructorsRes]) => {
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value.rows ?? []);
      if (deptsRes.status === "fulfilled") setDepartments(deptsRes.value.departments ?? []);
      if (studentsRes.status === "fulfilled") setStudents(studentsRes.value.students ?? []);
      if (instructorsRes.status === "fulfilled") {
        const raw = instructorsRes.value;
        setInstructors(
          (raw.data ?? []).map((i) => ({
            id: i.id,
            name: i.firstName && i.lastName
              ? `${i.firstName} ${i.lastName}`.trim()
              : i.name ?? "—",
          }))
        );
      }
    }).finally(() => setFiltersLoading(false));
  }, []);

  // Fetch modules whenever the selected course changes
  useEffect(() => {
    setModuleId("");
    setModules([]);
    if (!courseId) return;
    setModulesLoading(true);
    adminListModules(courseId)
      .then((res) => setModules(res.modules ?? []))
      .catch(() => {})
      .finally(() => setModulesLoading(false));
  }, [courseId]);

  // Auto-load on mount
  useEffect(() => {
    fetchOverview({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOverview = async (params) => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const res = await adminGetAssessmentOverview(params);
      const data = res?.data ?? {};
      setResults(data.assessments ?? data.results ?? []);
      setKpis(data.kpis ?? null);
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
    if (moduleId) params.moduleId = moduleId;
    if (departmentId) params.departmentId = departmentId;
    if (studentId) params.studentId = studentId;
    if (instructorId) params.instructorId = instructorId;
    fetchOverview(params);
  };

  const handleClearFilters = () => {
    setCourseId("");
    setModuleId("");
    setDepartmentId("");
    setStudentId("");
    setInstructorId("");
    fetchOverview({});
  };

  const hasActiveFilters = courseId || moduleId || departmentId || studentId || instructorId;

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
              <Link href="/admin/report/assessment-overview">Assessment &amp; Quiz Result Report</Link>
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
          <Heading as="h1" fontSize="heading.h3">Assessment &amp; Quiz Result Report</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Student performance per assessment, module and course — with overall pass rate overview.
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
          <Box minW={{ base: "100%", md: "200px" }} flex="1">
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

          {/* Course Module */}
          <Box minW={{ base: "100%", md: "200px" }} flex="1">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
              Course Module
            </Text>
            <Select
              placeholder={
                !courseId
                  ? "Select a course first"
                  : modulesLoading
                  ? "Loading..."
                  : "All modules"
              }
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              isDisabled={!courseId || modulesLoading}
              size="sm"
              borderRadius="md"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </Select>
          </Box>

          {/* Department */}
          <Box minW={{ base: "100%", md: "180px" }} flex="1">
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

          {/* Student */}
          <Box minW={{ base: "100%", md: "180px" }} flex="1">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
              Student
            </Text>
            <Select
              placeholder={filtersLoading ? "Loading..." : "All students"}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              isDisabled={filtersLoading}
              size="sm"
              borderRadius="md"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName && s.lastName
                    ? `${s.firstName} ${s.lastName}`.trim()
                    : s.name ?? s.email ?? s.id}
                </option>
              ))}
            </Select>
          </Box>

          {/* Course Instructor */}
          <Box minW={{ base: "100%", md: "180px" }} flex="1">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
              Instructor
            </Text>
            <Select
              placeholder={filtersLoading ? "Loading..." : "All instructors"}
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              isDisabled={filtersLoading}
              size="sm"
              borderRadius="md"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>
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
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, results.length)} of {results.length} submission{results.length !== 1 ? "s" : ""}
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
                      <TH w="160px">Student</TH>
                      <TH w="190px">Assessment</TH>
                      <TH w="170px">Course</TH>
                      <TH w="160px">Module</TH>
                      <TH w="80px">Score</TH>
                      <TH w="70px">Grade</TH>
                      <TH w="80px">Result</TH>
                      <TH w="140px">Instructor</TH>
                      <TH w="200px">Instructor Remark</TH>
                      <TH w="110px">Date Taken</TH>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {pageSlice.map((item, idx) => (
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
                          <Text fontSize="13px" color="gray.600">
                            {item.moduleTitle ?? item.module ?? "—"}
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
                          <Text fontSize="13px">
                            {item.instructorName ?? item.instructor ?? "—"}
                          </Text>
                        </TD>
                        <TD>
                          <Text fontSize="13px" color="gray.600" noOfLines={2}>
                            {item.instructorRemark ?? item.feedback ?? item.remark ?? "—"}
                          </Text>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <Flex justifyContent="center" alignItems="center" gap={2} mt={5}>
                  <Button
                    secondary
                    isDisabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    size="sm"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "..." ? (
                        <Text key={`ellipsis-${i}`} color="gray.400" px={1}>…</Text>
                      ) : (
                        <Button
                          key={item}
                          onClick={() => setPage(item)}
                          size="sm"
                          secondary={item !== page}
                          style={
                            item === page
                              ? { background: "#660066", color: "white", border: "none" }
                              : {}
                          }
                        >
                          {item}
                        </Button>
                      )
                    )}
                  <Button
                    secondary
                    isDisabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    size="sm"
                  >
                    Next
                  </Button>
                </Flex>
              )}
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
