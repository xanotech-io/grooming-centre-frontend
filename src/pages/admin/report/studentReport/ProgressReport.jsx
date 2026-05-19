import { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Text,
  Spinner,
  Breadcrumb,
  Link,
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

const ProgressReport = () => {
  const { studentId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState(null);

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

  const courses = progress?.courses ?? [];
  const studentName = progress?.studentName ?? "Student";

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
            display="flex"
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
              value={`${activity?.totalTimeSpentHours ?? "—"} hrs`}
              change={`${activity?.totalSessionCount ?? 0} sessions`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Weekly Activity"
              value={`${activity?.weeklyLogins ?? "—"}`}
              change="logins this week"
              changeColor="#1A8F3A"
            />
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
                No course progress data found for this student.
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
                        "Course",
                        "Modules",
                        "Completion",
                        "Assessment",
                        "Exam",
                        "Latest Score",
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
                      <Tr key={c.courseId || i} _hover={{ bg: "#F7FAFC" }}>
                        <Td py="12px" maxW="220px">
                          <Text fontSize="13px" fontWeight="500" noOfLines={2}>
                            {c.courseTitle}
                          </Text>
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
                        <Td
                          py="12px"
                          fontSize="13px"
                          fontWeight="700"
                          color="#6b006b"
                        >
                          {c.latestScore != null ? `${c.latestScore}%` : "—"}
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
    </AdminMainAreaWrapper>
  );
};

export const ProgressReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProgressReport {...props} />} />;
};

export const ProgressReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProgressReport {...props} />} />;
};

export default ProgressReport;
