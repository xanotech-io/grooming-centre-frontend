import { useEffect, useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import { BreadcrumbItem, Tag, useToast } from "@chakra-ui/react";
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
import { EmptyState } from "../../../../layouts";
import { adminGetStudentAssessmentResults } from "../../../../services";
import dayjs from "dayjs";

const passFailColorMap = { Pass: "green", Fail: "red" };
const gradeColorMap = { A: "green", B: "blue", C: "yellow", F: "red" };

const StudentAssessmentDetailsPage = () => {
  const { studentId } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [studentName, setStudentName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetStudentAssessmentResults(studentId);
      const data = res?.data ?? {};
      const rawResults = data.results ?? data.assessments ?? [];
      setResults(rawResults);
      setKpis(data.kpis ?? null);
      if (rawResults[0]?.studentName) setStudentName(rawResults[0].studentName);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Unable to fetch student assessment data";
      setError(message);
      toast({ status: "error", description: message, duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const kpiAverageScore = kpis?.averageScore ?? kpis?.averageAssessmentScore ?? 0;
  const kpiDifficulty = kpis?.difficultyImpact ?? kpis?.questionDifficultyImpactAnalysis ?? "—";

  if (loading) {
    return (
      <AdminMainAreaWrapper>
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading student assessment data...</Text>
        </Flex>
      </AdminMainAreaWrapper>
    );
  }

  if (error) {
    return (
      <AdminMainAreaWrapper>
        <Box my={4}>
          <Breadcrumb
            item2={
              <BreadcrumbItem>
                <Link href="/admin/report/course-assessment">Course Assessment Report</Link>
              </BreadcrumbItem>
            }
            item3={
              <BreadcrumbItem isCurrentPage>
                <Link href="#">Student Details</Link>
              </BreadcrumbItem>
            }
          />
        </Box>
        <EmptyState
          heading="Unable to load student data"
          description={error}
          cta={<Button onClick={fetchData}>Try Again</Button>}
        />
      </AdminMainAreaWrapper>
    );
  }

  const passCount = results.filter((r) => r.passFail === "Pass").length;
  const failCount = results.filter((r) => r.passFail === "Fail").length;

  return (
    <AdminMainAreaWrapper>
      {/* Breadcrumb */}
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/course-assessment">Course Assessment Report</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{studentName || "Student Details"}</Link>
            </BreadcrumbItem>
          }
        />
        <Button secondary onClick={fetchData}>Refresh</Button>
      </Box>

      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        rowGap={3}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            {studentName || "Student Assessment Results"}
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Full assessment history for this student — {results.length} submission{results.length !== 1 ? "s" : ""}
          </Text>
        </Box>
      </Flex>

      {/* KPI Cards */}
      {kpis && (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
          <DashboardMetricCard
            title="Average Score"
            value={`${kpiAverageScore}%`}
            change="across all assessments"
            changeColor="#6B006B"
          />
          <DashboardMetricCard
            title="Highest Score"
            value={`${kpis.highestScore ?? 0}%`}
            change="best result"
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
            change={`${passCount} pass / ${failCount} fail`}
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

      {/* No results */}
      {results.length === 0 ? (
        <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={10} textAlign="center">
          <Text color="gray.400" fontSize="lg">No assessment records found for this student.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
          {results.map((item, idx) => (
            <Box
              key={item.id ?? `${item.assessmentId}-${idx}`}
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="lg"
              p={5}
              shadow="sm"
            >
              {/* Card header */}
              <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
                <Box>
                  <Text fontWeight="700" fontSize="md" color="#101828">
                    {item.assessmentTitle ?? "Assessment"}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={0.5}>
                    {item.courseTitle ?? ""}
                  </Text>
                </Box>
                <Flex gap={2} flexShrink={0}>
                  <Tag size="sm" borderRadius="full" colorScheme={gradeColorMap[item.grade] ?? "gray"}>
                    {item.grade ?? "—"}
                  </Tag>
                  <Tag size="sm" borderRadius="full" colorScheme={passFailColorMap[item.passFail] ?? "gray"}>
                    {item.passFail ?? "—"}
                  </Tag>
                </Flex>
              </Flex>

              {/* Stats */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
                <Box bg="gray.50" borderRadius="md" p={3} textAlign="center">
                  <Text
                    fontWeight="700"
                    fontSize="xl"
                    color={(item.score ?? 0) >= 70 ? "#1A8F3A" : (item.score ?? 0) >= 50 ? "#B7791F" : "#C53030"}
                  >
                    {item.score ?? 0}%
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Score</Text>
                </Box>
                <Box bg="gray.50" borderRadius="md" p={3} textAlign="center">
                  <Text fontWeight="700" fontSize="xl" color="#101828">
                    {item.attemptNumber ?? 1}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Attempt</Text>
                </Box>
                <Box bg="gray.50" borderRadius="md" p={3} textAlign="center">
                  <Text fontWeight="700" fontSize="xl" color="#101828">
                    {item.timeTakenMinutes != null ? `${item.timeTakenMinutes}` : "—"}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Minutes</Text>
                </Box>
                <Box bg="gray.50" borderRadius="md" p={3} textAlign="center">
                  <Text fontWeight="700" fontSize="sm" color="#101828">
                    {item.submittedAt ? dayjs(item.submittedAt).format("DD MMM YYYY") : "—"}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Date Taken</Text>
                </Box>
              </SimpleGrid>

              {/* Feedback */}
              {item.instructorFeedback ? (
                <Box
                  bg="blue.50"
                  border="1px"
                  borderColor="blue.200"
                  borderRadius="md"
                  p={3}
                >
                  <Text fontSize="xs" fontWeight="700" color="blue.600" mb={1} textTransform="uppercase">
                    Instructor Feedback
                  </Text>
                  <Text fontSize="sm" color="blue.800">{item.instructorFeedback}</Text>
                </Box>
              ) : (
                <Box
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                >
                  <Text fontSize="sm" color="gray.400" fontStyle="italic">
                    No instructor feedback yet.
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
    </AdminMainAreaWrapper>
  );
};

export const StudentAssessmentDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <StudentAssessmentDetailsPage {...props} />} />
  );
};

export default StudentAssessmentDetailsPage;
