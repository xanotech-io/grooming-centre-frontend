import { Box, Flex } from "@chakra-ui/layout";
import { useState } from "react";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { mockStudentReportsResponse } from "../../../../mocks/server/controllers/student-report/reponses";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
} from "../../../../components";
import { useTableRows } from "../../../../hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const AttendanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchAttendanceReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Mocking the full API response:
      const response = mockStudentReportsResponse;

      const rows =
        response.data.rows?.map((report) => mapReportToRow(report)) || [];

      setTotalCount(response.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount:
          response.data.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.data.totalDocumentsCount || 0,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch student reports");
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

  const mapReportToRow = (report) => ({
    id: report?.id,
    studentId: report?.studentId,
    studentName: report?.studentName,
    courseTitle: report?.courseTitle,
    enrollmentDate: report?.enrollmentDate,
    modulesCompleted: report?.modulesCompleted,
    score: report?.score,
    status: report?.status,
    certificate: report?.certificate,
    lastAccess: report?.lastAccess,
  });

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "status",
        width: "150px",
        body: {
          checks: [
            { label: "Completed", queryValue: "Completed" },
            { label: "In Progress", queryValue: "In Progress" },
            { label: "Not Started", queryValue: "Not Started" },
          ],
        },
      },
    ],
    columns: [
      {
        id: "studentId",
        key: "studentName",
        text: "Student ID",
        fraction: "200px",
      },
      {
        id: "course",
        key: "course",
        text: "Course",
        fraction: "200px",
      },
      {
        id: "sessionsDate",
        key: "sessionsDate",
        text: "Sessions Date",
        fraction: "150px",
      },

      {
        id: "attendanceStatus",
        key: "attendanceStatus",
        text: "Attendance Status",
        fraction: "150px",
      },

      {
        id: "entryTime",
        key: "entryTime",
        text: "Entry Time",
        fraction: "150px",
      },

      {
        id: "exitTime",
        key: "exitTime",
        text: "Exit Time",
        fraction: "150px",
      },

      {
        id: "Duration",
        key: "Duration",
        text: "Duration",
        fraction: "130px",
      },
    ],

    options: {
      action: [
        {
          text: "Archive Report",
          link: (row) => `/archiiveReport/${row.id}/archive`,
        },
      ],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchAttendanceReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
      <AdminMainAreaWrapper>
        <Box
          display={"flex"}
          // width={'100%'}
          justifyContent="space-between"
          gridGap={4}
          mb={10}
        >
          <DashboardMetricCard
            title="Attendance Percentage"
            value="82%"
            change="+5% vs last month"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Number of Sessions Missed"
            value="4.51"
            change="+5% vs last semester"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Average Attendance Duration"
            value="80%"
            change="per course"
            changeColor="#1A8F3A"
          />
        </Box>

        {loading && rows.length === 0 ? (
          <Flex
            h="400px"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Spinner size="xl" />
            <Text mt={4}>Loading student reports...</Text>
          </Flex>
        ) : error ? (
          <EmptyState
            heading="Failed to load student reports"
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
            placeholder="Search by student, course, or status"
            totalCount={totalCount}
          />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export default AttendanceReport;
