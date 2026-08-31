import { useEffect, useState } from "react";
import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/tag";
import dayjs from "dayjs";
import { Button, Text, Spinner, Breadcrumb, Link, Heading, ExportMenu } from "../../../../components";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { getStudentCourseAttendanceV2 } from "../../../../services";

const statusColorMap = {
  Present: "green",
  Absent: "red",
  Late: "orange",
  Excused: "blue",
};

const deliveryColorMap = {
  Virtual: "purple",
  Physical: "teal",
};

const AdminStudentCourseAttendancePage = () => {
  const { studentId, courseId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentCourseAttendanceV2(studentId, courseId);
      setData(res?.data ?? res ?? {});
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load course attendance";
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
    if (studentId && courseId) fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, courseId]);

  const records = data?.records ?? [];
  const kpis = data?.kpis ?? null;

  const courseAttendanceExportRows = [
    ["Session Date", "Lesson / Session", "Status", "Entry Time", "Exit Time", "Mode"],
    ...records.map((record) => [
      record.sessionDate ? dayjs(record.sessionDate).format("DD/MM/YYYY") : "—",
      record.lessonTitle ?? record.lesson?.title ?? "—",
      record.attendanceStatus ?? record.status ?? "—",
      record.entryTime ?? "—",
      record.exitTime ?? "—",
      record.deliveryMode ?? "—",
    ]),
  ];

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href={`/admin/report/studentReport/${studentId}/attendance`}>
                Attendance Report
              </Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Course Detail</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap="8px">
          <ExportMenu
            rows={courseAttendanceExportRows}
            filename="student-course-attendance"
            title="Student Course Attendance"
          />
          <Button
            secondary
            onClick={() =>
              history.push(`/admin/report/studentReport/${studentId}/attendance`)
            }
          >
            ← Back to Attendance
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading course attendance…</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load course attendance"
          description={error}
          cta={<Button onClick={fetchAttendance}>Try Again</Button>}
        />
      ) : (
        <>
          {data?.courseTitle && (
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
              {data.studentName && (
                <Text as="level5" color="gray.500">
                  {data.studentName}
                </Text>
              )}
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" gap={4} mb={8}>
            <DashboardMetricCard
              title="Attendance Rate"
              value={kpis ? `${kpis.attendancePercentage ?? 0}%` : "—"}
              change={`${kpis?.sessionsPresent ?? 0} sessions present`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Lessons Missed"
              value={`${kpis?.lessonsMissed ?? "—"}`}
              change="missed sessions"
              changeColor="#E53E3E"
            />
            <DashboardMetricCard
              title="Avg. Duration"
              value={
                kpis?.averageDurationMinutes != null
                  ? `${kpis.averageDurationMinutes} min`
                  : "—"
              }
              change="per session"
              changeColor="#6B006B"
            />
            <DashboardMetricCard
              title="Total Sessions"
              value={`${kpis?.totalSessions ?? records.length}`}
              change={`${kpis?.sessionsPresent ?? 0} present`}
              changeColor="#2B6CB0"
            />
          </Box>

          <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" boxShadow="sm">
            {records.length === 0 ? (
              <Box p={10} textAlign="center">
                <Text color="gray.400">No attendance records found for this course.</Text>
              </Box>
            ) : (
              records.map((record, idx) => (
                <Flex
                  key={record.id ?? idx}
                  justifyContent="space-between"
                  alignItems="center"
                  px={5}
                  py={4}
                  borderBottom="1px"
                  borderColor="gray.100"
                  _last={{ borderBottom: "none" }}
                  flexWrap="wrap"
                  gap={3}
                >
                  <Box minW="140px">
                    <Text as="level5" color="gray.500">
                      Session Date
                    </Text>
                    <Text bold color="gray.800" fontSize="sm">
                      {record.sessionDate ? dayjs(record.sessionDate).format("DD/MM/YYYY") : "—"}
                    </Text>
                  </Box>
                  <Box minW="160px">
                    <Text as="level5" color="gray.500">
                      Lesson / Session
                    </Text>
                    <Text bold color="gray.800" fontSize="sm">
                      {record.lessonTitle ?? record.lesson?.title ?? "—"}
                    </Text>
                  </Box>
                  <Box minW="100px">
                    <Text as="level5" color="gray.500">
                      Status
                    </Text>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      colorScheme={statusColorMap[record.attendanceStatus ?? record.status] ?? "gray"}
                    >
                      {record.attendanceStatus ?? record.status ?? "—"}
                    </Tag>
                  </Box>
                  <Box minW="100px">
                    <Text as="level5" color="gray.500">
                      Entry / Exit
                    </Text>
                    <Text bold color="gray.800" fontSize="sm">
                      {record.entryTime ?? "—"} – {record.exitTime ?? "—"}
                    </Text>
                  </Box>
                  <Box minW="100px">
                    <Text as="level5" color="gray.500">
                      Mode
                    </Text>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      colorScheme={deliveryColorMap[record.deliveryMode] ?? "gray"}
                    >
                      {record.deliveryMode ?? "—"}
                    </Tag>
                  </Box>
                </Flex>
              ))
            )}
          </Box>
        </>
      )}
    </AdminMainAreaWrapper>
  );
};

export const AdminStudentCourseAttendancePageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AdminStudentCourseAttendancePage {...props} />} />
  );
};

export default AdminStudentCourseAttendancePage;
