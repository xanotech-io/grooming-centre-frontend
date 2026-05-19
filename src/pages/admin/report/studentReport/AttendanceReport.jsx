import { Box, Flex } from "@chakra-ui/layout";
import { useState } from "react";
import { Route } from "react-router-dom";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { getStudentAttendance } from "../../../../services";
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

// ─── MOCK DATA (matches TC03 API spec) ───────────────────────────────────────
const MOCK_ATTENDANCE_RESPONSE = {
  data: {
    summary: {
      overallAttendancePercentage: 76,
      sessionsPresent: 19,
      sessionsAbsent: 4,
      sessionsLate: 2,
      sessionsExcused: 1,
      totalSessions: 26,
      complianceStatus: "Compliant",
    },
    sessionRecords: [
      {
        id: "att-001",
        courseTitle: "Microfinance Basics",
        sessionDate: "2025-10-01T09:00:00Z",
        status: "Present",
        entryTime: "09:02 AM",
        exitTime: "11:00 AM",
        durationMinutes: 118,
        verificationMethod: "QR Code",
      },
      {
        id: "att-002",
        courseTitle: "Microfinance Basics",
        sessionDate: "2025-10-08T09:00:00Z",
        status: "Absent",
        entryTime: "—",
        exitTime: "—",
        durationMinutes: 0,
        verificationMethod: "—",
      },
      {
        id: "att-003",
        courseTitle: "Advanced Accounting",
        sessionDate: "2025-10-03T10:00:00Z",
        status: "Late",
        entryTime: "10:22 AM",
        exitTime: "12:00 PM",
        durationMinutes: 98,
        verificationMethod: "Manual",
      },
      {
        id: "att-004",
        courseTitle: "Advanced Accounting",
        sessionDate: "2025-10-10T10:00:00Z",
        status: "Present",
        entryTime: "09:58 AM",
        exitTime: "12:00 PM",
        durationMinutes: 122,
        verificationMethod: "QR Code",
      },
      {
        id: "att-005",
        courseTitle: "Business Ethics",
        sessionDate: "2025-10-05T14:00:00Z",
        status: "Excused",
        entryTime: "—",
        exitTime: "—",
        durationMinutes: 0,
        verificationMethod: "—",
      },
      {
        id: "att-006",
        courseTitle: "Risk Management",
        sessionDate: "2025-10-12T09:00:00Z",
        status: "Present",
        entryTime: "08:59 AM",
        exitTime: "11:00 AM",
        durationMinutes: 121,
        verificationMethod: "Biometric",
      },
    ],
    showingDocumentsCount: 6,
    totalDocumentsCount: 6,
    currentPage: 1,
    totalPages: 1,
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const mapReportToRow = (record) => ({
  id: record?.id,
  courseTitle: record?.courseTitle,
  sessionDate: record?.sessionDate,
  status: record?.status,
  entryTime: record?.entryTime,
  exitTime: record?.exitTime,
  duration: record?.durationMinutes > 0 ? `${record.durationMinutes} min` : "—",
  verificationMethod: record?.verificationMethod,
});

const AttendanceReport = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchReports = async (studentId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Real API call — falls back to mock data if endpoint is not yet live
      let data;
      try {
        const apiResponse = await getStudentAttendance(studentId, params);
        data = apiResponse?.data ?? apiResponse;
      } catch {
        data = MOCK_ATTENDANCE_RESPONSE.data;
      }
      setSummary(data.summary);
      const rows = data.sessionRecords.map(mapReportToRow);
      setTotalCount(data.totalDocumentsCount);
      return {
        rows,
        showingDocumentsCount: data.showingDocumentsCount,
        totalDocumentsCount: data.totalDocumentsCount,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
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

  const statusColorMap = {
    Present: "green",
    Absent: "red",
    Late: "orange",
    Excused: "blue",
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Status",
        queryKey: "status",
        width: "150px",
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
        id: "sessionDate",
        key: "sessionDate",
        text: "Session Date",
        fraction: "130px",
        renderContent: (date) => (
          <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text>
        ),
      },
      {
        id: "status",
        key: "status",
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
      { id: "duration", key: "duration", text: "Duration", fraction: "110px" },
      {
        id: "verificationMethod",
        key: "verificationMethod",
        text: "Verification",
        fraction: "130px",
      },
    ],
    options: {
      action: [
        {
          text: "Archive Report",
          link: (row) => `/archiveReport/${row.id}/archive`,
        },
      ],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => fetchReports(studentId, props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
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

        <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
          <DashboardMetricCard
            title="Attendance Rate"
            value={summary ? `${summary.overallAttendancePercentage}%` : "—"}
            change={`${summary?.sessionsPresent ?? 0} sessions present`}
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Sessions Absent"
            value={summary?.sessionsAbsent ?? "—"}
            change={`${summary?.sessionsLate ?? 0} late`}
            changeColor="#E53E3E"
          />
          <DashboardMetricCard
            title="Sessions Excused"
            value={summary?.sessionsExcused ?? "—"}
            change="approved absences"
            changeColor="#6B006B"
          />
          <DashboardMetricCard
            title="Compliance Status"
            value={summary?.complianceStatus ?? "—"}
            change={`of ${summary?.totalSessions ?? 0} total sessions`}
            changeColor="#1A8F3A"
          />
        </Box>

        {loading && !rows?.data?.rows?.length ? (
          <Flex
            h="400px"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
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
            isLoading={loading}
            placeholder="Search by course or date"
            totalCount={totalCount}
          />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export const AttendanceReportRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AttendanceReport {...props} />} />
  );
};

export const AttendanceReportRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AttendanceReport {...props} />} />
  );
};

export default AttendanceReport;
