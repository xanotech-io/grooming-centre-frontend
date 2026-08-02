import { useEffect, useState } from "react";
import { Link as RouterLink, Route } from "react-router-dom";
import { Box, Flex, Grid, SimpleGrid } from "@chakra-ui/layout";
import { Badge, useToast } from "@chakra-ui/react";
import { Button, Heading, Spinner, Text } from "../../../components";
import {
  studentGetMyProgressReport,
  studentGetMyProgressKPIs,
  studentGetMyActivity,
} from "../../../services";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";
import dayjs from "dayjs";

const completionStatusColor = (status = "") => {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "blue";
  return "gray";
};

const acquisitionLevel = (avgScore) => {
  if (avgScore == null) return { label: "—", color: "gray" };
  if (avgScore >= 85) return { label: "Excellent", color: "green" };
  if (avgScore >= 70) return { label: "High", color: "blue" };
  if (avgScore >= 50) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "red" };
};

const KpiCard = ({ title, value, sub, accent }) => (
  <Box
    bg="white"
    border="1px"
    borderColor="gray.200"
    borderRadius="md"
    p={5}
    shadow="sm"
    textAlign="center"
  >
    <Text bold fontSize="heading.h3" color={accent || "primary.base"}>
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

const ActivityCard = ({ title, value, unit }) => (
  <Box
    bg="white"
    border="1px"
    borderColor="gray.200"
    borderRadius="md"
    p={4}
    shadow="sm"
  >
    <Text bold color="gray.800" fontSize="lg">
      {value ?? "—"}
      {unit && (
        <Text as="span" color="gray.400" fontSize="sm" ml={1}>
          {unit}
        </Text>
      )}
    </Text>
    <Text as="level5" color="accent.3" mt={1}>
      {title}
    </Text>
  </Box>
);

const StudentProgressReportPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportRes, kpisRes, activityRes] = await Promise.all([
        studentGetMyProgressReport(),
        studentGetMyProgressKPIs(),
        studentGetMyActivity(),
      ]);
      setReport(reportRes);
      setKpis(kpisRes);
      setActivity(activityRes);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load progress data";
      setError(message);
      toast({
        status: "error",
        description: message,
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = report?.summary ?? {};
  const courses = report?.courses ?? [];

  return (
    <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>
      {/* Page header */}
      <Box mb={6}>
        <Heading as="h1" fontSize="heading.h2" mb={1}>
          My Learning Progress
        </Heading>
        <Text color="accent.3">
          Track your academic journey, performance, and engagement across all enrolled courses.
        </Text>
      </Box>

      {loading ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">
            Loading your progress report…
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
          <Button onClick={fetchAll}>Try Again</Button>
        </Box>
      ) : (
        <>
          {/* KPI Summary */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
            <KpiCard
              title="Total Courses"
              value={kpis?.totalCourses ?? summary?.totalCourses ?? "—"}
            />
            <KpiCard
              title="Completed"
              value={kpis?.completedCourses ?? summary?.completedCourses ?? "—"}
              accent="green.500"
            />
            <KpiCard
              title="Overall Completion"
              value={
                (kpis?.completionPercentage ?? summary?.overallCompletionPercentage) != null
                  ? `${kpis?.completionPercentage ?? summary?.overallCompletionPercentage}%`
                  : "—"
              }
            />
            <KpiCard
              title="Average Score"
              value={
                (kpis?.averageScore ?? summary?.averagePerformance) != null
                  ? `${kpis?.averageScore ?? summary?.averagePerformance}%`
                  : "—"
              }
            />
          </SimpleGrid>

          {/* Activity summary */}
          {activity && (
            <Box mb={8}>
              <Text bold color="gray.700" mb={3} fontSize="md">
                Engagement & Activity
              </Text>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <ActivityCard
                  title="Last Login"
                  value={
                    activity.lastLoginDate
                      ? dayjs(activity.lastLoginDate).format("DD MMM YYYY")
                      : "—"
                  }
                />
                <ActivityCard
                  title="Logins This Week"
                  value={activity.weeklyLogins ?? "—"}
                />
                <ActivityCard
                  title="Logins This Month"
                  value={activity.monthlyLogins ?? "—"}
                />
                <ActivityCard
                  title="Total Time Spent"
                  value={activity.totalTimeSpentHours ?? "—"}
                  unit="hrs"
                />
              </SimpleGrid>
            </Box>
          )}

          {/* Additional summary stats */}
          {summary.totalLessonsCompleted != null && (
            <Box
              bg="blue.50"
              border="1px"
              borderColor="blue.100"
              borderRadius="md"
              p={4}
              mb={8}
            >
              <Flex gap={6} flexWrap="wrap" alignItems="center">
                <Box>
                  <Text bold color="blue.700" fontSize="lg">
                    {summary.totalLessonsCompleted}
                  </Text>
                  <Text as="level5" color="blue.500">
                    Total Lessons Completed
                  </Text>
                </Box>
                {summary.lastActivityDate && (
                  <Box>
                    <Text bold color="blue.700" fontSize="lg">
                      {dayjs(summary.lastActivityDate).format("DD MMM YYYY")}
                    </Text>
                    <Text as="level5" color="blue.500">
                      Last Activity
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>
          )}

          {/* Course breakdown */}
          <Box>
            <Text bold color="gray.700" mb={3} fontSize="md">
              Course Breakdown
            </Text>

            {courses.length === 0 ? (
              <Box
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                p={10}
                textAlign="center"
              >
                <Text color="gray.400" fontSize="lg" mb={1}>
                  No course data available
                </Text>
                <Text as="level5" color="gray.400">
                  Enrol in a course to start tracking your progress.
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
                {/* Table header – desktop */}
                <Grid
                  templateColumns="2fr 100px 140px 80px 90px 90px 110px 80px"
                  bg="gray.50"
                  borderBottom="1px"
                  borderColor="gray.200"
                  px={5}
                  py={3}
                  display={{ base: "none", xl: "grid" }}
                >
                  <Text bold as="level5" color="gray.600">Course</Text>
                  <Text bold as="level5" color="gray.600">Modules</Text>
                  <Text bold as="level5" color="gray.600">Completion</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Status</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Avg Score</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Mastery</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Certificate</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Details</Text>
                </Grid>

                {courses.map((course, idx) => {
                  const acq = acquisitionLevel(course.averageScore);
                  return (
                    <Box
                      key={course.courseId ?? idx}
                      borderBottom="1px"
                      borderColor="gray.100"
                      _last={{ borderBottom: "none" }}
                      px={5}
                      py={4}
                    >
                      {/* Desktop row */}
                      <Grid
                        templateColumns="2fr 100px 140px 80px 90px 90px 110px 80px"
                        alignItems="center"
                        gap={2}
                        display={{ base: "none", xl: "grid" }}
                      >
                        <Box>
                          <Text bold color="gray.800" noOfLines={1}>
                            {course.courseTitle}
                          </Text>
                          {course.enrollmentDate && (
                            <Text as="level5" color="gray.400">
                              Enrolled {dayjs(course.enrollmentDate).format("MMM YYYY")}
                            </Text>
                          )}
                        </Box>

                        <Text as="level5" color="gray.600">
                          {course.modulesCompletedRatio ?? `${course.modulesCompleted ?? 0}/${course.totalModules ?? 0}`}
                        </Text>

                        {/* Completion bar */}
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
                                bg={
                                  course.completionPercentage >= 100
                                    ? "green.400"
                                    : "blue.400"
                                }
                                borderRadius="full"
                                width={`${course.completionPercentage ?? 0}%`}
                              />
                            </Box>
                            <Text as="level5" color="gray.600" minW="32px">
                              {course.completionPercentage ?? 0}%
                            </Text>
                          </Flex>
                        </Box>

                        <Flex justify="center">
                          <Badge
                            colorScheme={completionStatusColor(course.completionStatus)}
                            borderRadius="full"
                            px={2}
                            fontSize="11px"
                          >
                            {course.completionStatus ?? "—"}
                          </Badge>
                        </Flex>

                        <Text bold textAlign="center" color="gray.800">
                          {course.averageScore != null ? `${course.averageScore}%` : "—"}
                        </Text>

                        <Flex justify="center">
                          <Badge
                            colorScheme={acq.color}
                            borderRadius="full"
                            px={2}
                            fontSize="11px"
                          >
                            {acq.label}
                          </Badge>
                        </Flex>

                        <Flex justify="center">
                          <Badge
                            colorScheme={course.certificateEarned === "Yes" ? "green" : "gray"}
                            borderRadius="full"
                            px={2}
                            fontSize="11px"
                          >
                            {course.certificateEarned === "Yes" ? "Earned" : "Not yet"}
                          </Badge>
                        </Flex>

                        <Flex justify="center">
                          <RouterLink to={`/my-progress/course/${course.courseId}`}>
                            <Button size="sm" secondary>
                              View
                            </Button>
                          </RouterLink>
                        </Flex>
                      </Grid>

                      {/* Mobile card */}
                      <Box display={{ base: "block", xl: "none" }}>
                        <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1} pr={2}>
                            <Text bold color="gray.800">
                              {course.courseTitle}
                            </Text>
                            {course.enrollmentDate && (
                              <Text as="level5" color="gray.400">
                                Enrolled {dayjs(course.enrollmentDate).format("MMM YYYY")}
                              </Text>
                            )}
                          </Box>
                          <Badge
                            colorScheme={completionStatusColor(course.completionStatus)}
                            borderRadius="full"
                            px={2}
                            fontSize="11px"
                          >
                            {course.completionStatus ?? "—"}
                          </Badge>
                        </Flex>

                        {/* Completion bar mobile */}
                        <Box mb={2}>
                          <Flex alignItems="center" gap={2}>
                            <Box flex={1} h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                              <Box
                                h="100%"
                                bg={course.completionPercentage >= 100 ? "green.400" : "blue.400"}
                                borderRadius="full"
                                width={`${course.completionPercentage ?? 0}%`}
                              />
                            </Box>
                            <Text as="level5" color="gray.600" minW="32px">
                              {course.completionPercentage ?? 0}%
                            </Text>
                          </Flex>
                        </Box>

                        <Flex gap={4} flexWrap="wrap" mb={2}>
                          <Text as="level5" color="gray.600">
                            Modules:{" "}
                            <strong>
                              {course.modulesCompletedRatio ?? `${course.modulesCompleted ?? 0}/${course.totalModules ?? 0}`}
                            </strong>
                          </Text>
                          <Text as="level5" color="gray.600">
                            Avg Score:{" "}
                            <strong>
                              {course.averageScore != null ? `${course.averageScore}%` : "—"}
                            </strong>
                          </Text>
                          <Flex gap={1} alignItems="center">
                            <Text as="level5" color="gray.600">Mastery:</Text>
                            <Badge colorScheme={acq.color} borderRadius="full" px={2} fontSize="11px">
                              {acq.label}
                            </Badge>
                          </Flex>
                        </Flex>

                        <RouterLink to={`/my-progress/course/${course.courseId}`}>
                          <Button size="sm" secondary>
                            View Details
                          </Button>
                        </RouterLink>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export const StudentProgressReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentProgressReportPage {...props} />} />
);

export default StudentProgressReportPage;
