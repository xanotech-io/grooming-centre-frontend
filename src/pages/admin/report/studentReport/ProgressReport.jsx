import { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Text,
  Spinner,
  Breadcrumb,
  Link,
  DashboardMetricCard,
} from "../../../../components";
import { Flex, Box } from "@chakra-ui/layout";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import dayjs from "dayjs";
import {
  Badge,
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Divider,
} from "@chakra-ui/react";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  adminGetStudentProgressV2,
  adminGetStudentKpisV2,
  adminGetStudentActivityV2,
} from "../../../../services";

const statusScheme = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "green";
  if (s === "in progress") return "blue";
  return "gray";
};

const acquisitionScheme = (level) => {
  const l = String(level || "").toLowerCase();
  if (l === "advanced" || l === "high") return "green";
  if (l === "intermediate" || l === "medium") return "blue";
  if (l === "beginner" || l === "low") return "orange";
  return "gray";
};

const engagementScheme = (level) => {
  const l = String(level || "").toLowerCase();
  if (l === "high" || l === "active") return "green";
  if (l === "medium" || l === "moderate") return "blue";
  if (l === "low" || l === "inactive") return "orange";
  return "gray";
};

const resolveInstructor = (instructor) => {
  if (!instructor) return "—";
  if (typeof instructor === "string") return instructor || "—";
  return instructor.fullName ?? instructor.name ?? "—";
};

/* ── Course Detail Drawer ─────────────────────────────────────────── */

const Section = ({ label, children }) => (
  <Box mb={6}>
    <Text
      fontSize="11px"
      fontWeight="700"
      color="gray.400"
      textTransform="uppercase"
      letterSpacing="0.08em"
      mb={3}
    >
      {label}
    </Text>
    {children}
  </Box>
);

const StatTile = ({ label, value, sub }) => (
  <Box
    bg="#F7FAFC"
    border="1px solid #E2E8F0"
    borderRadius="8px"
    px={3}
    py={3}
    flex="1"
    minW="100px"
  >
    <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" mb="4px">
      {label}
    </Text>
    <Text fontSize="16px" fontWeight="700" color="#6b006b" lineHeight="1.2">
      {value}
    </Text>
    {sub && <Text fontSize="11px" color="gray.400" mt="2px">{sub}</Text>}
  </Box>
);

const formatMinutes = (mins) => {
  if (mins == null) return "—";
  if (mins === 0) return "0 mins";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${h} hr${h !== 1 ? "s" : ""}`;
  return `${h} hr${h !== 1 ? "s" : ""} ${m} min${m !== 1 ? "s" : ""}`;
};

const CourseDetailDrawer = ({ course, onClose }) => {
  if (!course) return null;

  const assessments = course.assessments ?? [];
  const remarks = Array.isArray(course.instructorRemarks)
    ? course.instructorRemarks
    : course.instructorRemarks
    ? [course.instructorRemarks]
    : [];

  return (
    <Drawer isOpen onClose={onClose} placement="right" size="md">
      <DrawerOverlay bg="blackAlpha.300" />
      <DrawerContent>
        <DrawerCloseButton mt={1} />
        <DrawerHeader borderBottomWidth="1px" pb={4}>
          <Text fontSize="14px" fontWeight="700" color="#1A202C" pr={6} lineHeight="1.4">
            {course.courseTitle}
          </Text>
          {resolveInstructor(course.instructor) !== "—" && (
            <Text fontSize="12px" fontWeight="400" color="gray.500" mt="4px">
              {resolveInstructor(course.instructor)}
            </Text>
          )}
        </DrawerHeader>

        <DrawerBody py={5} px={5}>

          {/* ── Course Overview (table data) ── */}
          <Section label="Course Overview">
            {/* Status + Certificate row */}
            <Flex gap={3} mb={3} flexWrap="wrap">
              <Box flex="1" minW="120px">
                <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" mb="6px">
                  Status
                </Text>
                <Badge colorScheme={statusScheme(course.completionStatus)} variant="subtle" fontSize="12px" px={2} py={1}>
                  {course.completionStatus || "Not Started"}
                </Badge>
              </Box>
              <Box flex="1" minW="120px">
                <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" mb="6px">
                  Certificate
                </Text>
                <Badge colorScheme={course.certificateEarned === "Yes" ? "green" : "gray"} variant="subtle" fontSize="12px" px={2} py={1}>
                  {course.certificateEarned === "Yes" ? "✓ Earned" : "Not Yet"}
                </Badge>
              </Box>
            </Flex>

            {/* Progress bar */}
            <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" px={3} py={3} mb={3}>
              <Flex justifyContent="space-between" mb="6px">
                <Text fontSize="11px" color="gray.500" fontWeight="500">Completion</Text>
                <Text fontSize="12px" fontWeight="700" color="#6b006b">
                  {course.completionPercentage != null ? `${course.completionPercentage}%` : "—"}
                </Text>
              </Flex>
              <Progress value={course.completionPercentage ?? 0} size="sm" colorScheme="purple" borderRadius="4px" />
              {course.modulesCompleted && (
                <Text fontSize="11px" color="gray.400" mt="6px">{course.modulesCompleted} modules</Text>
              )}
            </Box>

            {/* Scores row */}
            <Flex gap={3} flexWrap="wrap">
              <StatTile
                label="Assessment"
                value={course.assessmentScore != null ? `${course.assessmentScore}%` : "—"}
              />
              <StatTile
                label="Exam"
                value={course.courseExamScore != null ? `${course.courseExamScore}%` : "—"}
              />
              <StatTile
                label="Last Access"
                value={course.lastAccessDate ? dayjs(course.lastAccessDate).format("DD MMM YY") : "—"}
              />
            </Flex>
          </Section>

          <Divider mb={5} />

          {/* ── Time Spent ── */}
          <Section label="Time Spent on Course">
            <Flex gap={3} flexWrap="wrap">
              <StatTile
                label="Total Time"
                value={formatMinutes(course.totalTimeSpentMinutes)}
                sub="engaging with material"
              />
              {course.sessionCount != null && (
                <StatTile label="Sessions" value={course.sessionCount} />
              )}
            </Flex>
          </Section>

          <Divider mb={5} />

          {/* ── Instructor Remarks ── */}
          <Section label="Instructor Remarks">
            {remarks.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={2}>
                {remarks.map((r, idx) => (
                  <Box key={idx} bg="#F7FAFC" borderRadius="8px" p={3} border="1px solid #E2E8F0">
                    <Text fontSize="13px" color="#2D3748" lineHeight="1.6">
                      {typeof r === "string" ? r : r.remark ?? r.comment ?? JSON.stringify(r)}
                    </Text>
                    {r.date && (
                      <Text fontSize="11px" color="gray.400" mt="4px">
                        {dayjs(r.date).format("DD MMM YYYY")}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Text fontSize="13px" color="gray.400" fontStyle="italic">No remarks recorded.</Text>
            )}
          </Section>

          <Divider mb={5} />

          {/* ── Assessments ── */}
          <Section label="Assessments">
            {assessments.length === 0 ? (
              <Text fontSize="13px" color="gray.400" fontStyle="italic">No assessment data available.</Text>
            ) : (
              <Box display="flex" flexDirection="column" gap={3}>
                {assessments.map((a, idx) => (
                  <Box key={a.id ?? idx} border="1px solid #E2E8F0" borderRadius="8px" p={3} bg="white">
                    <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                      <Box>
                        <Text fontSize="13px" fontWeight="600" color="#1A202C">
                          {a.title ?? a.name ?? `Assessment ${idx + 1}`}
                        </Text>
                        {a.type && <Text fontSize="11px" color="gray.400" mt="1px">{a.type}</Text>}
                      </Box>
                      {a.score != null && (
                        <Text fontSize="14px" fontWeight="700" color="#6b006b">{a.score}%</Text>
                      )}
                    </Flex>

                    <Flex gap={3} flexWrap="wrap">
                      <Box bg="#F7FAFC" borderRadius="6px" px={3} py={2} flex="1" minW="110px">
                        <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" mb="4px">
                          Acquisition Level
                        </Text>
                        {a.acquisitionLevel ? (
                          <Badge colorScheme={acquisitionScheme(a.acquisitionLevel)} variant="subtle" fontSize="11px">
                            {a.acquisitionLevel}
                          </Badge>
                        ) : (
                          <Text fontSize="12px" color="gray.400">—</Text>
                        )}
                      </Box>

                      <Box bg="#F7FAFC" borderRadius="6px" px={3} py={2} flex="1" minW="110px">
                        <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" mb="4px">
                          Engagement
                        </Text>
                        {a.engagement ? (
                          <Badge colorScheme={engagementScheme(a.engagement)} variant="subtle" fontSize="11px">
                            {a.engagement}
                          </Badge>
                        ) : (
                          <Text fontSize="12px" color="gray.400">—</Text>
                        )}
                      </Box>

                      {a.attempts != null && (
                        <Box bg="#F7FAFC" borderRadius="6px" px={3} py={2} flex="1" minW="80px">
                          <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" mb="4px">
                            Attempts
                          </Text>
                          <Text fontSize="13px" fontWeight="600" color="#2D3748">{a.attempts}</Text>
                        </Box>
                      )}
                    </Flex>
                  </Box>
                ))}
              </Box>
            )}
          </Section>

        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */

const ProgressReport = () => {
  const { studentId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const [prog, kpi, act] = await Promise.all([
        adminGetStudentProgressV2(studentId).catch(() => null),
        adminGetStudentKpisV2(studentId).catch(() => null),
        adminGetStudentActivityV2(studentId).catch(() => null),
      ]);
      setProgress(prog);
      setKpis(kpi);
      setActivity(act);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load progress data.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const studentName = progress?.studentName ?? activity?.studentName ?? "Student";

  // Build a lookup of activity data keyed by courseId so we can enrich the
  // progress rows (which carry completion/score fields) with instructor,
  // remarks, time-spent and assessment detail from the activity endpoint.
  const activityByCourseId = (activity?.courses ?? []).reduce((acc, c) => {
    acc[c.courseId] = c;
    return acc;
  }, {});

  const allCourses = (progress?.courses ?? []).map((c) => ({
    ...c,
    ...(activityByCourseId[c.courseId] ?? {}),
  }));

  const courses = search.trim()
    ? allCourses.filter((c) => {
        const q = search.trim().toLowerCase();
        return (
          (c.courseTitle ?? "").toLowerCase().includes(q) ||
          resolveInstructor(c.instructor).toLowerCase().includes(q)
        );
      })
    : allCourses;

  return (
    <AdminMainAreaWrapper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/student-progress">Student Progress Report</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Progress Report</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap="8px">
          <Button
            secondary
            onClick={() => history.push(`/admin/student-progress/${studentId}`)}
          >
            Full Training Report
          </Button>
          <Button secondary onClick={load}>
            Refresh
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex
          h="400px"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" />
          <Text mt={4}>Loading student progress...</Text>
        </Flex>
      ) : error ? (
        <Flex
          h="400px"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          gap="12px"
        >
          <Text color="red.500">{error}</Text>
          <Button onClick={load}>Try Again</Button>
        </Flex>
      ) : (
        <>
          {/* Student name */}
          {studentName && (
            <Text fontSize="18px" fontWeight="700" color="#1A202C" mb={6}>
              {studentName}
              {progress?.email && (
                <Text
                  as="span"
                  fontSize="14px"
                  fontWeight="400"
                  color="gray.500"
                  ml="10px"
                >
                  {progress.email}
                </Text>
              )}
            </Text>
          )}

          {/* Summary cards */}
          <Box
            gridTemplateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            display="grid"
            flexDirection="column"
            justifyContent="space-between"
            gridGap={4}
            mb={10}
            flexWrap="wrap"
          >
            <DashboardMetricCard
              title="Overall Completion"
              value={`${kpis?.completionPercentage ?? 0}%`}
              change={`${kpis?.completedCourses ?? 0} of ${kpis?.totalCourses ?? 0} courses`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Average Score"
              value={`${kpis?.averageScore ?? 0}%`}
              change={`${kpis?.totalCourses ?? 0} tracked courses`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Time Spent"
              value={`${activity?.sessionActivity?.totalTimeSpentHours ?? 0} hrs`}
              change={`${activity?.sessionActivity?.totalSessionCount ?? 0} sessions`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Weekly Activity"
              value={`${activity?.sessionActivity?.weeklyLogins ?? 0}`}
              change="logins this week"
              changeColor="#1A8F3A"
            />
          </Box>

          {/* Search */}
          <Box mb={4}>
            <InputGroup maxW="360px">
              <InputLeftElement pointerEvents="none">
                <Text fontSize="14px" color="gray.400" mt="1px">
                  🔍
                </Text>
              </InputLeftElement>
              <Input
                placeholder="Search by course title or instructor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                borderRadius="6px"
                bg="white"
                fontSize="13px"
              />
            </InputGroup>
          </Box>

          {/* Courses table */}
          {courses.length === 0 ? (
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="8px"
              p="48px"
              textAlign="center"
            >
              <Text color="gray.400">
                {search.trim()
                  ? `No courses match "${search}".`
                  : "No course progress data found for this student."}
              </Text>
            </Box>
          ) : (
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="8px"
              overflow="hidden"
            >
              <TableContainer>
                <ChakraTable variant="simple" size="sm">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      {[
                        "Course Title",
                        "Instructor",
                        "Modules Completed",
                        "Completion Percentage",
                        "Assessment",
                        "Exam",
                        "Certificate",
                        "Status",
                        "Last Access",
                      ].map((h) => (
                        <Th
                          key={h}
                          py="12px"
                          fontSize="11px"
                          color="gray.500"
                          fontWeight="600"
                          textTransform="none"
                        >
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {courses.map((c, i) => (
                      <Tr
                        key={c.courseId || i}
                        cursor="pointer"
                        _hover={{ bg: "#F0EBF8" }}
                        onClick={() => setSelectedCourse(c)}
                      >
                        <Td py="12px" maxW="220px">
                          <Text
                            fontSize="13px"
                            fontWeight="500"
                            noOfLines={2}
                            color="#6b006b"
                          >
                            {c.courseTitle}
                          </Text>
                        </Td>
                        <Td py="12px" fontSize="12px" color="gray.600">
                          {resolveInstructor(c.instructor)}
                        </Td>
                        <Td py="12px" fontSize="12px" color="gray.600">
                          {c.modulesCompleted ?? "—"}
                        </Td>
                        <Td py="12px" minW="120px">
                          <Flex justifyContent="space-between" mb="4px">
                            <Text fontSize="11px" color="gray.500">
                              Progress
                            </Text>
                            <Text
                              fontSize="11px"
                              fontWeight="700"
                              color="#6b006b"
                            >
                              {c.completionPercentage != null
                                ? `${c.completionPercentage}%`
                                : "—"}
                            </Text>
                          </Flex>
                          <Progress
                            value={c.completionPercentage ?? 0}
                            size="xs"
                            colorScheme="purple"
                            borderRadius="4px"
                          />
                        </Td>
                        <Td py="12px" fontSize="12px">
                          {c.assessmentScore != null
                            ? `${c.assessmentScore}%`
                            : "—"}
                        </Td>
                        <Td py="12px" fontSize="12px">
                          {c.courseExamScore != null
                            ? `${c.courseExamScore}%`
                            : "—"}
                        </Td>
                        <Td py="12px">
                          <Badge
                            colorScheme={
                              c.certificateEarned === "Yes" ? "green" : "gray"
                            }
                            variant="subtle"
                            fontSize="11px"
                          >
                            {c.certificateEarned === "Yes"
                              ? "✓ Earned"
                              : "Not Yet"}
                          </Badge>
                        </Td>
                        <Td py="12px">
                          <Badge
                            colorScheme={statusScheme(c.completionStatus)}
                            variant="subtle"
                            fontSize="11px"
                          >
                            {c.completionStatus || "Not Started"}
                          </Badge>
                        </Td>
                        <Td
                          py="12px"
                          fontSize="12px"
                          color="gray.500"
                          whiteSpace="nowrap"
                        >
                          {c.lastAccessDate
                            ? dayjs(c.lastAccessDate).format("DD/MM/YYYY")
                            : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </ChakraTable>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      <CourseDetailDrawer
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </AdminMainAreaWrapper>
  );
};

export const ProgressReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProgressReport {...props} />} />;
};

export default ProgressReport;
