import { useEffect, useState } from "react";
import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { Badge, useToast } from "@chakra-ui/react";
import { Button, Text, Spinner, Breadcrumb, Link, Heading } from "../../../../components";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import dayjs from "dayjs";
import { adminGetStudentCourseProgress } from "../../../../services";

const completionStatusColor = (status = "") => {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "blue";
  return "gray";
};

const acquisitionLevel = (score) => {
  if (score == null) return { label: "—", color: "gray" };
  if (score >= 85) return { label: "Excellent", color: "green" };
  if (score >= 70) return { label: "High", color: "blue" };
  if (score >= 50) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "red" };
};

const performanceStatus = (completionPct, avgScore) => {
  if (completionPct >= 100) return { label: "Completed", color: "teal" };
  if (completionPct >= 50 || avgScore >= 70) return { label: "On Track", color: "green" };
  return { label: "Needs Support", color: "orange" };
};

const MetricRow = ({ label, children, value }) => (
  <Flex
    borderBottom="1px"
    borderColor="gray.100"
    py={3}
    _last={{ borderBottom: "none" }}
    alignItems="center"
  >
    <Text as="level5" color="gray.500" minW="220px" fontSize="sm">
      {label}
    </Text>
    {children ?? (
      <Text bold color="gray.800" fontSize="sm">
        {value ?? "—"}
      </Text>
    )}
  </Flex>
);

const AdminStudentCourseProgressPage = () => {
  const { studentId, courseId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetStudentCourseProgress(studentId, courseId);
      setData(res);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load course progress";
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
    if (studentId && courseId) fetchProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, courseId]);

  const completionPct = data?.completionPercentage ?? 0;
  const acq = acquisitionLevel(data?.averageScore);
  const perfStatus = performanceStatus(completionPct, data?.averageScore);

  return (
    <AdminMainAreaWrapper>
      {/* Breadcrumb */}
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb

          item2={
            <BreadcrumbItem>
              <Link href={`/admin/report/studentReport/${studentId}/progress`}>
                Progress Report
              </Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Course Detail</Link>
            </BreadcrumbItem>
          }
        />
        <Button
          secondary
          onClick={() =>
            history.push(`/admin/report/studentReport/${studentId}/progress`)
          }
        >
          ← Back to Progress
        </Button>
      </Box>

      {loading ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading course progress…</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load course progress"
          description={error}
          cta={<Button onClick={fetchProgress}>Try Again</Button>}
        />
      ) : !data ? null : (
        <>
          {/* Student + course header */}
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
            <Heading as="h2" fontSize="heading.h3" mb={1}>
              {data.courseTitle}
            </Heading>
            <Flex gap={6} flexWrap="wrap" alignItems="center">
              <Box>
                <Text as="level5" color="gray.500">Student</Text>
                <Text bold color="gray.800">{data.studentName}</Text>
              </Box>
              <Box>
                <Text as="level5" color="gray.500">Email</Text>
                <Text bold color="gray.800">{data.email}</Text>
              </Box>
              {data.enrollmentDate && (
                <Box>
                  <Text as="level5" color="gray.500">Enrolled</Text>
                  <Text bold color="gray.800">
                    {dayjs(data.enrollmentDate).format("DD MMM YYYY")}
                  </Text>
                </Box>
              )}
              {data.generatedDate && (
                <Box ml="auto">
                  <Text as="level5" color="gray.400" fontSize="xs">
                    Generated: {dayjs(data.generatedDate).format("DD MMM YYYY, HH:mm")}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>

          {/* Top KPI cards */}
          <Box
            display="flex"
            justifyContent="space-between"
            gridGap={4}
            mb={6}
            flexWrap="wrap"
          >
            <DashboardMetricCard
              title="Completion"
              value={`${completionPct}%`}
              change={`${data.modulesCompletedRatio ?? `${data.modulesCompleted ?? 0}/${data.totalModules ?? 0}`} modules`}
              changeColor={completionPct >= 100 ? "#1A8F3A" : "#2563EB"}
            />
            <DashboardMetricCard
              title="Average Score"
              value={data.averageScore != null ? `${data.averageScore}%` : "—"}
              change={`Mastery: ${acq.label}`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Lessons Completed"
              value={String(data.totalLessonsCompleted ?? "—")}
              change={`Activity rate: ${data.activityRate ?? 0} logins/wk`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Performance Status"
              value={perfStatus.label}
              change={`Completion status: ${data.completionStatus ?? "—"}`}
              changeColor={
                perfStatus.label === "Needs Support"
                  ? "#D97706"
                  : "#1A8F3A"
              }
            />
          </Box>

          {/* Completion progress bar */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={5}
            mb={5}
            boxShadow="sm"
          >
            <Flex justifyContent="space-between" alignItems="center" mb={3}>
              <Text bold color="gray.700">
                Course Completion Progress
              </Text>
              <Flex gap={2}>
                <Badge
                  colorScheme={completionStatusColor(data.completionStatus)}
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {data.completionStatus ?? "—"}
                </Badge>
                <Badge
                  colorScheme={perfStatus.color}
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {perfStatus.label}
                </Badge>
              </Flex>
            </Flex>
            <Box h="12px" bg="gray.100" borderRadius="full" overflow="hidden">
              <Box
                h="100%"
                bg={completionPct >= 100 ? "green.400" : "blue.400"}
                borderRadius="full"
                width={`${completionPct}%`}
                transition="width 0.4s ease"
              />
            </Box>
            <Text as="level5" color="gray.500" mt={1}>
              {data.modulesCompletedRatio ??
                `${data.modulesCompleted ?? 0} of ${data.totalModules ?? 0}`}{" "}
              modules completed
            </Text>
          </Box>

          {/* Score details + acquisition */}
          <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr", base: "1fr" }} gap={5} mb={5}>
            {/* Scores */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={5}
              boxShadow="sm"
            >
              <Text bold color="gray.700" mb={4}>
                Assessment Scores
              </Text>
              <MetricRow label="Assessment Score" value={data.assessmentScore != null ? `${data.assessmentScore}%` : "—"} />
              <MetricRow label="Course Exam Score" value={data.courseExamScore != null ? `${data.courseExamScore}%` : "—"} />
              <MetricRow label="Standalone Exam Score" value={data.standaloneExamScore != null ? `${data.standaloneExamScore}%` : "—"} />
              <MetricRow label="Latest Score" value={data.latestScore != null ? `${data.latestScore}%` : "—"} />
              <MetricRow label="Overall Average Score" value={data.averageScore != null ? `${data.averageScore}%` : "—"} />
              <MetricRow label="Avg Score per Module" value={data.averageAssessmentScorePerModule != null ? `${data.averageAssessmentScorePerModule}%` : "—"} />
            </Box>

            {/* Acquisition & engagement */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={5}
              boxShadow="sm"
            >
              <Text bold color="gray.700" mb={4}>
                Acquisition & Engagement
              </Text>
              <MetricRow label="Acquisition Level">
                <Badge colorScheme={acq.color} borderRadius="full" px={3} py={1}>
                  {acq.label}
                </Badge>
              </MetricRow>
              <MetricRow label="Performance Status">
                <Badge colorScheme={perfStatus.color} borderRadius="full" px={3} py={1}>
                  {perfStatus.label}
                </Badge>
              </MetricRow>
              <MetricRow
                label="Activity Rate"
                value={data.activityRate != null ? `${data.activityRate} logins/week` : "—"}
              />
              <MetricRow
                label="Last Access"
                value={
                  data.lastAccessDate
                    ? dayjs(data.lastAccessDate).format("DD MMM YYYY, HH:mm")
                    : "—"
                }
              />
              <MetricRow
                label="Enrollment Date"
                value={
                  data.enrollmentDate
                    ? dayjs(data.enrollmentDate).format("DD MMM YYYY")
                    : "—"
                }
              />
            </Box>
          </Box>

          {/* Certificate & remarks */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={5}
            boxShadow="sm"
          >
            <Text bold color="gray.700" mb={4}>
              Certificate & Instructor Feedback
            </Text>
            <MetricRow label="Certificate Earned">
              <Badge
                colorScheme={data.certificateEarned === "Yes" ? "green" : "gray"}
                borderRadius="full"
                px={3}
                py={1}
              >
                {data.certificateEarned === "Yes" ? "Yes – Earned" : "Not yet earned"}
              </Badge>
            </MetricRow>
            {data.certificateId && (
              <MetricRow label="Certificate ID" value={data.certificateId} />
            )}
            <MetricRow label="Instructor Remarks">
              <Text
                color="gray.600"
                fontStyle={data.instructorRemarks ? "normal" : "italic"}
                fontSize="sm"
              >
                {data.instructorRemarks ?? "No remarks from instructor yet."}
              </Text>
            </MetricRow>
          </Box>
        </>
      )}
    </AdminMainAreaWrapper>
  );
};

export const AdminStudentCourseProgressPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AdminStudentCourseProgressPage {...props} />} />
  );
};

export default AdminStudentCourseProgressPage;
