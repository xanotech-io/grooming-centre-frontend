import { Box, Flex } from "@chakra-ui/layout";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
} from "../../../../components";
import { useTableRows } from "../../../../hooks";
import { mockStudentReportsResponse } from "../../../../mocks/server/controllers/student-report/reponses";
import { useState } from "react";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";

const ComplianceReport = () => {
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
        triggerText: "Status",
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
        id: "assignedDate",
        key: "assignedDate",
        text: "Assigned Date",
        fraction: "150px",
      },

      {
        id: "completionDate",
        key: "completionDate",
        text: "Completion Date",
        fraction: "150px",
      },

      {
        id: "status",
        key: "status",
        text: "Status",
        fraction: "150px",
      },

      {
        id: "overdueDays",
        key: "overdueDays",
        text: "Overdue Days",
        fraction: "220px",
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
            title="Completion Percentage"
            value="82%"
            change="+5% vs last month"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Non-Compliance Ratio"
            value="15%"
            change="+5% vs last semester"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Overdue Count"
            value="10"
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
          />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export default ComplianceReport;
