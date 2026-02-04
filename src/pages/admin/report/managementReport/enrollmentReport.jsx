import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Box, Flex } from "@chakra-ui/layout";
import { useState } from "react";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
} from "../../../../components";
import { EmptyState } from "../../../../layouts";
import dayjs from "dayjs";
import { useTableRows } from "../../../../hooks";
import relativeTime from "dayjs/plugin/relativeTime";
import { mockCourseReportsResponse } from "../../../../mocks/server/controllers/management-report/reponses";

dayjs.extend(relativeTime);

const EnrollmentReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchAssessmentReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Mocking the full API response:
      const response = mockCourseReportsResponse;

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
  course: report?.course,
  instructor: report?.instructor,
  total: report?.total,
  approved: report?.approved,
  completed: report?.completed,
  dropped: report?.dropped,
  trend: report?.trend, // "growth" | "fall" | "stable"
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
        id: "course",
        key: "course",
        text: "Course",
        fraction: "200px",
      },
      {
        id: "instructor",
        key: "instructor",
        text: "Instructor",
        fraction: "200px",
      },
      {
        id: "total",
        key: "total",
        text: "Total",
        fraction: "150px",
      },

      {
        id: "approved",
        key: "approved",
        text: "Approved",
        fraction: "150px",
      },

      {
        id: "completed",
        key: "completed",
        text: "Completed",
        fraction: "150px",
      },

      {
        id: "dropped",
        key: "dropped",
        text: "Dropped",
        fraction: "150px",
      },

      {
        id: "trends",
        key: "trends",
        text: "Trends",
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
    return await fetchAssessmentReports(props?.params);
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
            title="Enrollment Growth Rate (%)"
            value="79%"
            change="+5% vs last month"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Pending-to-Approval Ratio"
            value="95% / 45%"
            change="per course"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Dropout Rate (%)"
            value="Medium"
            change="-5% vs last period"
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

export default EnrollmentReport;
