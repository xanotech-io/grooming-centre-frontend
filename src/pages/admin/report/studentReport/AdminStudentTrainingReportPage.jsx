import { useEffect, useState } from "react";
import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { Badge, useToast } from "@chakra-ui/react";
import { Button, Text, Spinner, Breadcrumb, Link, Heading } from "../../../../components";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/tag";
import dayjs from "dayjs";
import { adminGetStudentTrainingReport } from "../../../../services";

const completionStatusColor = (status = "") => {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "yellow";
  return "red";
};

const acquisitionLevel = (score) => {
  if (score == null) return { label: "—", color: "gray" };
  if (score >= 85) return { label: "Excellent", color: "green" };
  if (score >= 70) return { label: "High", color: "blue" };
  if (score >= 50) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "red" };
};

const SectionHeading = ({ children }) => (
  <Text
    bold
    color="gray.700"
    fontSize="md"
    mb={4}
    pb={2}
    borderBottom="2px"
    borderColor="blue.100"
  >
    {children}
  </Text>
);

const AdminStudentTrainingReportPage = () => {
  const { studentId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetStudentTrainingReport(studentId);
      setReport(res);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load training report";
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
    if (studentId) fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const summary = report?.summary ?? {};
  const activity = report?.activityMetrics ?? {};
  const courses = report?.courses ?? [];

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/studentReport">Learners</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem>
              <Link href={`/admin/report/studentReport/${studentId}/details`}>
                Report Details
              </Link>
            </BreadcrumbItem>
          }
          item4={
            <BreadcrumbItem>
              <Link href={`/admin/report/studentReport/${studentId}/progress`}>
                Progress Report
              </Link>
            </BreadcrumbItem>
          }
          item5={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Training Report</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap={2}>
          <Button
            secondary
            onClick={() =>
              history.push(`/admin/report/studentReport/${studentId}/progress`)
            }
          >
            ← Back to Progress
          </Button>
          <Button secondary onClick={fetchReport}>
            Refresh
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Generating training report…</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to generate training report"
          description={error}
          cta={<Button onClick={fetchReport}>Try Again</Button>}
        />
      ) : !report ? null : (
        <>
          {/* Report identity card */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            px={5}
            py={4}
            mb={5}
            boxShadow="sm"
          >
            <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={4}>
              <Box>
                <Heading as="h2" fontSize="heading.h3" mb={1}>
                  Student Training & Progress Report
                </Heading>
                <Flex gap={6} flexWrap="wrap" mt={2}>
                  <Box>
                    <Text as="level5" color="gray.500">Student</Text>
                    <Text bold color="gray.800">{report.studentName}</Text>
                  </Box>
                  <Box>
                    <Text as="level5" color="gray.500">Email</Text>
                    <Text bold color="gray.800">{report.email}</Text>
                  </Box>
                  {report.department && (
                    <Box>
                      <Text as="level5" color="gray.500">Department</Text>
                      <Text bold color="gray.800">{report.department}</Text>
                    </Box>
                  )}
                </Flex>
              </Box>

              <Box textAlign="right">
                <Text as="level5" color="gray.400" fontSize="xs">
                  Report ID: <strong>{report.reportId}</strong>
                </Text>
                {report.generatedBy && (
                  <Text as="level5" color="gray.400" fontSize="xs">
                    Generated by: {report.generatedBy}
                  </Text>
                )}
                {report.generationTimestamp && (
                  <Text as="level5" color="gray.400" fontSize="xs">
                    {dayjs(report.generationTimestamp).format("DD MMM YYYY, HH:mm")}
                  </Text>
                )}
              </Box>
            </Flex>
          </Box>

          {/* Phase 6 — Summary KPI Cards */}
          <Box mb={6}>
            <SectionHeading>Phase 6 — Academic Summary KPIs</SectionHeading>
            <Box
              display="flex"
              justifyContent="space-between"
              gridGap={4}
              flexWrap="wrap"
            >
              <DashboardMetricCard
                title="Overall Completion"
                value={`${summary.overallCompletionPercentage ?? 0}%`}
                change={`${summary.completedCourses ?? 0} of ${summary.totalCourses ?? 0} courses`}
                changeColor="#1A8F3A"
              />
              <DashboardMetricCard
                title="Average Performance"
                value={`${summary.averagePerformance ?? 0}%`}
                change={
                  summary.benchmarkAchieved
                    ? "Benchmark achieved (≥70%)"
                    : "Below benchmark (<70%)"
                }
                changeColor={summary.benchmarkAchieved ? "#1A8F3A" : "#D97706"}
              />
              <DashboardMetricCard
                title="Certificates Earned"
                value={String(summary.certificatesEarned ?? 0)}
                change="issued certificates"
                changeColor="#1A8F3A"
              />
              <DashboardMetricCard
                title="Benchmark"
                value={summary.benchmarkAchieved ? "Achieved" : "Not Achieved"}
                change="avg performance ≥ 70%"
                changeColor={summary.benchmarkAchieved ? "#1A8F3A" : "#EF4444"}
              />
            </Box>
          </Box>

          {/* Phase 4 — Activity Metrics */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={5}
            mb={5}
            boxShadow="sm"
          >
            <SectionHeading>Phase 4 — Session Activity Metrics</SectionHeading>
            <Box
              display="grid"
              gridTemplateColumns={{ md: "repeat(3, 1fr)", base: "repeat(2, 1fr)" }}
              gap={5}
            >
              {[
                {
                  label: "Last Login",
                  value: activity.lastLoginDate
                    ? dayjs(activity.lastLoginDate).format("DD MMM YYYY, HH:mm")
                    : "—",
                },
                {
                  label: "Weekly Logins (last 7 days)",
                  value: activity.weeklyLogins ?? "—",
                },
                {
                  label: "Monthly Logins (last 30 days)",
                  value: activity.monthlyLogins ?? "—",
                },
                {
                  label: "Total Time Spent",
                  value:
                    activity.totalTimeSpentHours != null
                      ? `${activity.totalTimeSpentHours} hrs`
                      : "—",
                },
                {
                  label: "Total Sessions",
                  value: activity.totalSessionCount ?? "—",
                },
                {
                  label: "Activity Rate (logins/week)",
                  value: activity.activityRate ?? "—",
                },
              ].map(({ label, value }) => (
                <Box
                  key={label}
                  bg="gray.50"
                  borderRadius="md"
                  p={4}
                  border="1px"
                  borderColor="gray.100"
                >
                  <Text as="level5" color="gray.500" mb={1}>
                    {label}
                  </Text>
                  <Text bold color="gray.800">
                    {value}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Phases 2, 3, 5 — Course Breakdown */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={5}
            boxShadow="sm"
          >
            <SectionHeading>
              Phases 2 · 3 · 5 — Course Progress, Scores & Certificates
            </SectionHeading>

            {courses.length === 0 ? (
              <Text color="gray.400" fontStyle="italic">
                No course records available.
              </Text>
            ) : (
              <Box>
                {/* Table header */}
                <Box
                  display="grid"
                  gridTemplateColumns="2fr 100px 110px 100px 100px 100px 90px 100px 110px"
                  bg="gray.50"
                  borderRadius="md"
                  px={3}
                  py={2}
                  mb={1}
                >
                  {[
                    "Course",
                    "Modules",
                    "Completion",
                    "Status",
                    "Asmt Score",
                    "Exam Score",
                    "Avg Score",
                    "Certificate",
                    "Last Access",
                  ].map((col) => (
                    <Text key={col} bold as="level5" color="gray.600" fontSize="xs">
                      {col}
                    </Text>
                  ))}
                </Box>

                {courses.map((course, idx) => {
                  const acq = acquisitionLevel(course.averageScore);
                  const completionPct = course.completionPercentage ?? 0;
                  return (
                    <Box
                      key={idx}
                      display="grid"
                      gridTemplateColumns="2fr 100px 110px 100px 100px 100px 90px 100px 110px"
                      alignItems="center"
                      px={3}
                      py={4}
                      borderTop="1px"
                      borderColor="gray.100"
                      _hover={{ bg: "gray.50" }}
                    >
                      {/* Course title */}
                      <Box pr={2}>
                        <Text bold color="gray.800" fontSize="sm" noOfLines={2}>
                          {course.courseTitle}
                        </Text>
                        {course.lastAccessDate && (
                          <Text as="level5" color="gray.400" fontSize="xs">
                            Last: {dayjs(course.lastAccessDate).format("DD MMM YYYY")}
                          </Text>
                        )}
                      </Box>

                      {/* Modules */}
                      <Text as="level5" fontSize="sm" color="gray.700">
                        {course.modulesCompleted ?? "—"}
                      </Text>

                      {/* Completion bar */}
                      <Box>
                        <Flex alignItems="center" gap={1}>
                          <Box
                            flex={1}
                            h="5px"
                            bg="gray.100"
                            borderRadius="full"
                            overflow="hidden"
                          >
                            <Box
                              h="100%"
                              bg={completionPct >= 100 ? "green.400" : "blue.400"}
                              borderRadius="full"
                              width={`${completionPct}%`}
                            />
                          </Box>
                          <Text as="level5" fontSize="xs" color="gray.600" minW="28px">
                            {completionPct}%
                          </Text>
                        </Flex>
                      </Box>

                      {/* Status */}
                      <Box>
                        <Tag
                          size="sm"
                          borderRadius="full"
                          colorScheme={completionStatusColor(course.completionStatus)}
                        >
                          {course.completionStatus ?? "—"}
                        </Tag>
                      </Box>

                      {/* Assessment score */}
                      <Text as="level5" fontSize="sm" color="gray.700">
                        {course.assessmentScore != null
                          ? `${course.assessmentScore}%`
                          : "—"}
                      </Text>

                      {/* Exam score */}
                      <Text as="level5" fontSize="sm" color="gray.700">
                        {course.courseExamScore != null
                          ? `${course.courseExamScore}%`
                          : "—"}
                      </Text>

                      {/* Avg score + mastery */}
                      <Flex alignItems="center" gap={1} flexWrap="wrap">
                        <Text bold fontSize="sm" color="gray.800">
                          {course.averageScore != null ? `${course.averageScore}%` : "—"}
                        </Text>
                        <Badge
                          colorScheme={acq.color}
                          borderRadius="full"
                          px={1}
                          fontSize="10px"
                        >
                          {acq.label}
                        </Badge>
                      </Flex>

                      {/* Certificate */}
                      <Box>
                        <Badge
                          colorScheme={course.certificateEarned === "Yes" ? "green" : "gray"}
                          borderRadius="full"
                          px={2}
                          fontSize="11px"
                        >
                          {course.certificateEarned === "Yes" ? "Earned" : "Not yet"}
                        </Badge>
                        {course.certificateId && (
                          <Text as="level5" color="gray.400" fontSize="xs" mt={1} noOfLines={1}>
                            {course.certificateId}
                          </Text>
                        )}
                      </Box>

                      {/* Last access */}
                      <Box>
                        {course.lastAccessDate ? (
                          <>
                            <Text fontSize="xs" color="gray.700">
                              {dayjs(course.lastAccessDate).format("DD/MM/YYYY")}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {dayjs(course.lastAccessDate).format("h:mm A")}
                            </Text>
                          </>
                        ) : (
                          <Text as="level5" color="gray.400">
                            —
                          </Text>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Instructor Remarks (if any) */}
            {courses.some((c) => c.instructorRemarks) && (
              <Box mt={6}>
                <Text bold color="gray.700" mb={3}>
                  Instructor Remarks
                </Text>
                {courses
                  .filter((c) => c.instructorRemarks)
                  .map((course, idx) => (
                    <Box
                      key={idx}
                      bg="yellow.50"
                      border="1px"
                      borderColor="yellow.200"
                      borderRadius="md"
                      p={4}
                      mb={3}
                    >
                      <Text bold color="yellow.800" fontSize="sm" mb={1}>
                        {course.courseTitle}
                      </Text>
                      <Text color="yellow.700" fontSize="sm">
                        {course.instructorRemarks}
                      </Text>
                    </Box>
                  ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </AdminMainAreaWrapper>
  );
};

export const AdminStudentTrainingReportPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AdminStudentTrainingReportPage {...props} />} />
  );
};

export default AdminStudentTrainingReportPage;
