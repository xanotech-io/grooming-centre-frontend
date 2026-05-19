import { useEffect, useState } from "react";
import { useParams, useHistory, Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import { Badge, useToast } from "@chakra-ui/react";
import { Button, Heading, Spinner, Text } from "../../../components";
import { studentGetMyCourseProgress } from "../../../services";
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

const performanceStatus = (completionPct, avgScore) => {
  if (completionPct >= 100) return { label: "Completed", color: "teal" };
  if (completionPct >= 50 || avgScore >= 70) return { label: "On Track", color: "green" };
  return { label: "Needs Support", color: "orange" };
};

const MetricRow = ({ label, value, children }) => (
  <Flex
    borderBottom="1px"
    borderColor="gray.100"
    py={3}
    _last={{ borderBottom: "none" }}
    alignItems="center"
    gap={3}
  >
    <Text as="level5" color="gray.500" minW="200px">
      {label}
    </Text>
    {children ?? (
      <Text bold color="gray.800">
        {value ?? "—"}
      </Text>
    )}
  </Flex>
);

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

const StudentCourseProgressPage = () => {
  const { courseId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentGetMyCourseProgress(courseId);
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
    if (courseId) fetchProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const acq = acquisitionLevel(data?.averageScore);
  const perfStatus = performanceStatus(data?.completionPercentage, data?.averageScore);
  const completionPct = data?.completionPercentage ?? 0;

  return (
    <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>
      {/* Back + header */}
      <Flex alignItems="center" gap={3} mb={6}>
        <Button secondary onClick={() => history.push("/my-progress")}>
          ← Back
        </Button>
        <Box>
          <Heading as="h1" fontSize="heading.h2" mb={0}>
            {data?.courseTitle ?? "Course Progress"}
          </Heading>
          <Text color="accent.3">Detailed progress report for this course</Text>
        </Box>
      </Flex>

      {loading ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">
            Loading course progress…
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
          <Button onClick={fetchProgress}>Try Again</Button>
        </Box>
      ) : !data ? null : (
        <>
          {/* Top KPI cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
            <KpiCard
              title="Completion"
              value={`${completionPct}%`}
              accent={completionPct >= 100 ? "green.500" : "blue.500"}
            />
            <KpiCard
              title="Average Score"
              value={data.averageScore != null ? `${data.averageScore}%` : "—"}
            />
            <KpiCard
              title="Modules"
              value={data.modulesCompletedRatio ?? `${data.modulesCompleted ?? 0}/${data.totalModules ?? 0}`}
            />
            <KpiCard
              title="Lessons Completed"
              value={data.totalLessonsCompleted ?? "—"}
            />
          </SimpleGrid>

          {/* Completion progress bar */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={5}
            shadow="sm"
            mb={6}
          >
            <Flex justifyContent="space-between" alignItems="center" mb={2}>
              <Text bold color="gray.700">
                Course Completion
              </Text>
              <Flex gap={2} alignItems="center">
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
            <Box h="10px" bg="gray.100" borderRadius="full" overflow="hidden">
              <Box
                h="100%"
                bg={completionPct >= 100 ? "green.400" : "blue.400"}
                borderRadius="full"
                width={`${completionPct}%`}
                transition="width 0.4s ease"
              />
            </Box>
            <Text as="level5" color="gray.500" mt={1}>
              {data.modulesCompletedRatio ?? `${data.modulesCompleted ?? 0} of ${data.totalModules ?? 0}`} modules completed
            </Text>
          </Box>

          {/* Scores & engagement */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            {/* Assessment scores */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={5}
              shadow="sm"
            >
              <Text bold color="gray.700" mb={4} fontSize="md">
                Assessment Scores
              </Text>
              <MetricRow label="Assessment Score">
                <Text bold color="gray.800">
                  {data.assessmentScore != null ? `${data.assessmentScore}%` : "—"}
                </Text>
              </MetricRow>
              <MetricRow label="Course Exam Score">
                <Text bold color="gray.800">
                  {data.courseExamScore != null ? `${data.courseExamScore}%` : "—"}
                </Text>
              </MetricRow>
              <MetricRow label="Standalone Exam Score">
                <Text bold color="gray.800">
                  {data.standaloneExamScore != null ? `${data.standaloneExamScore}%` : "—"}
                </Text>
              </MetricRow>
              <MetricRow label="Latest Score">
                <Text bold color="gray.800">
                  {data.latestScore != null ? `${data.latestScore}%` : "—"}
                </Text>
              </MetricRow>
              <MetricRow label="Average Score (overall)">
                <Text bold color="gray.800">
                  {data.averageScore != null ? `${data.averageScore}%` : "—"}
                </Text>
              </MetricRow>
              <MetricRow label="Avg Score per Module">
                <Text bold color="gray.800">
                  {data.averageAssessmentScorePerModule != null
                    ? `${data.averageAssessmentScorePerModule}%`
                    : "—"}
                </Text>
              </MetricRow>
            </Box>

            {/* Acquisition & engagement */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={5}
              shadow="sm"
            >
              <Text bold color="gray.700" mb={4} fontSize="md">
                Learning Acquisition & Engagement
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
              <MetricRow label="Activity Rate (weekly)">
                <Text bold color="gray.800">
                  {data.activityRate != null ? `${data.activityRate} logins/wk` : "—"}
                </Text>
              </MetricRow>
              <MetricRow label="Last Access">
                <Text bold color="gray.800">
                  {data.lastAccessDate
                    ? dayjs(data.lastAccessDate).format("DD MMM YYYY, HH:mm")
                    : "—"}
                </Text>
              </MetricRow>
              <MetricRow label="Enrollment Date">
                <Text bold color="gray.800">
                  {data.enrollmentDate
                    ? dayjs(data.enrollmentDate).format("DD MMM YYYY")
                    : "—"}
                </Text>
              </MetricRow>
            </Box>
          </SimpleGrid>

          {/* Certificate & remarks */}
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={5}
            shadow="sm"
            mb={6}
          >
            <Text bold color="gray.700" mb={4} fontSize="md">
              Certificate & Feedback
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
              <MetricRow label="Certificate ID">
                <Text bold color="gray.800" fontFamily="mono" fontSize="sm">
                  {data.certificateId}
                </Text>
              </MetricRow>
            )}
            <MetricRow label="Instructor Remarks">
              <Text color="gray.600" fontStyle={data.instructorRemarks ? "normal" : "italic"}>
                {data.instructorRemarks ?? "No remarks from instructor yet."}
              </Text>
            </MetricRow>
          </Box>

          {/* Generated date */}
          {data.generatedDate && (
            <Text as="level5" color="gray.400" textAlign="right">
              Report generated: {dayjs(data.generatedDate).format("DD MMM YYYY, HH:mm")}
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export const StudentCourseProgressPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentCourseProgressPage {...props} />} />
);

export default StudentCourseProgressPage;
