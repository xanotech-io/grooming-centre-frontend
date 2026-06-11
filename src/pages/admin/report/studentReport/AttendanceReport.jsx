import { Box, Flex } from "@chakra-ui/layout";
import { useState } from "react";
import { Route, useParams } from "react-router-dom";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { getStudentAttendanceV2 } from "../../../../services";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
  Breadcrumb,
  Link,
} from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/tag";
import { useTableRows } from "../../../../hooks";
import dayjs from "dayjs";

const statusColorMap = {
  Present: "green",
  Absent: "red",
  Late: "orange",
  Excused: "blue",
};

const mapRecordToRow = (record) => ({
  id: record.id,
  courseTitle: record.courseTitle ?? record.course?.title ?? "—",
  lessonTitle: record.lessonTitle ?? record.lesson?.title ?? "—",
  sessionDate: record.sessionDate ?? "—",
  attendanceStatus: record.attendanceStatus ?? record.status ?? "—",
  entryTime: record.entryTime ?? "—",
  exitTime: record.exitTime ?? "—",
  duration: record.durationMinutes > 0 ? `${record.durationMinutes} min` : "—",
  deliveryMode: record.deliveryMode ?? "—",
});

const AttendanceReport = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [meta, setMeta] = useState({ totalSessions: 0, sessionsPresent: 0 });

  const fetchReports = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStudentAttendanceV2(studentId);
      const reportData = result?.data ?? {};
      const records = (reportData.records ?? []).map(mapRecordToRow);
      const limit = Number(params.limit) || 20;
      const totalDocumentsCount =
        reportData.totalCount ?? reportData.count ?? records.length;

      setKpis(reportData.kpis ?? null);
      setMeta({
        totalSessions: reportData.totalSessions ?? 0,
        sessionsPresent: reportData.sessionsPresent ?? 0,
      });

      return {
        rows: records,
        showingDocumentsCount: records.length,
        totalDocumentsCount,
        currentPage: Number(params.page) || 1,
        totalPages: Math.ceil(totalDocumentsCount / limit) || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch attendance report");
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    } finally {
      setLoading(false);
    }
  };

  const tableProps = {
    filterControls: [
      {
        triggerText: "Status",
        queryKey: "attendanceStatus",
        width: "160px",
        body: {
          checks: [
            { label: "Present", queryValue: "Present" },
            { label: "Absent", queryValue: "Absent" },
            { label: "Late", queryValue: "Late" },
            { label: "Excused", queryValue: "Excused" },
          ],
        },
      },
    ],
    columns: [
      {
        id: "courseTitle",
        key: "courseTitle",
        text: "Course",
        fraction: "220px",
      },
      {
        id: "lessonTitle",
        key: "lessonTitle",
        text: "Lesson / Session",
        fraction: "180px",
      },
      {
        id: "sessionDate",
        key: "sessionDate",
        text: "Session Date",
        fraction: "130px",
        renderContent: (date) =>
          date && date !== "—" ? (
            <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text>
          ) : (
            <Text fontSize="sm">—</Text>
          ),
      },
      {
        id: "attendanceStatus",
        key: "attendanceStatus",
        text: "Status",
        fraction: "120px",
        renderContent: (status) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={statusColorMap[status] ?? "gray"}
          >
            {status}
          </Tag>
        ),
      },
      {
        id: "entryTime",
        key: "entryTime",
        text: "Entry Time",
        fraction: "110px",
      },
      { id: "exitTime", key: "exitTime", text: "Exit Time", fraction: "110px" },
      { id: "duration", key: "duration", text: "Duration", fraction: "100px" },
      {
        id: "deliveryMode",
        key: "deliveryMode",
        text: "Mode",
        fraction: "110px",
      },
    ],
    options: {
      selection: false,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => fetchReports(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

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
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Attendance Report</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Box display="flex" justifyContent="space-between" gap={4} mb={8}>
        <DashboardMetricCard
          title="Attendance Rate"
          value={kpis ? `${kpis.attendancePercentage ?? 0}%` : "—"}
          change={`${meta.sessionsPresent} sessions present`}
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
          value={`${meta.totalSessions}`}
          change={`${meta.sessionsPresent} present`}
          changeColor="#2B6CB0"
        />
      </Box>

      {loading && !rows?.data?.rows?.length ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading attendance report...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load attendance report"
          description={error}
          cta={<Button onClick={fetchRowItems}>Try Again</Button>}
        />
      ) : (
        <Table
          {...tableProps}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          placeholder="Search by course or lesson..."
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const AttendanceReportRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AttendanceReport {...props} />} />
  );
};

export default AttendanceReport;
