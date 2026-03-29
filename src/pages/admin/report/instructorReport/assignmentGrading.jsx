import { Box, Flex } from "@chakra-ui/layout";
import { useState } from "react";
import { Route, useParams } from "react-router-dom";
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
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const mockAssignmentGradingResponse = {
  data: {
    rows: [
      {
        id: "ag-1",
        assignment: "Case Study 1",
        course: "Privacy",
        totalSubmissions: 65,
        graded: 25,
        pending: 3,
        averageGrade: 65,
        feedbackProvidedPercent: 65,
        submissionDeadline: "2025-11-26T10:00:00.000Z",
      },
      {
        id: "ag-2",
        assignment: "Case Study 1",
        course: "Privacy",
        totalSubmissions: 95,
        graded: 55,
        pending: 5,
        averageGrade: 95,
        feedbackProvidedPercent: 95,
        submissionDeadline: "2025-11-26T10:00:00.000Z",
      },
      {
        id: "ag-3",
        assignment: "Case Study 2",
        course: "Data Privacy",
        totalSubmissions: 65,
        graded: 32,
        pending: 4,
        averageGrade: 85,
        feedbackProvidedPercent: 55,
        submissionDeadline: "2025-11-26T10:00:00.000Z",
      },
      {
        id: "ag-4",
        assignment: "Case Study 3",
        course: "Data Privacy",
        totalSubmissions: 75,
        graded: 19,
        pending: 5,
        averageGrade: 75,
        feedbackProvidedPercent: 75,
        submissionDeadline: "2025-11-26T10:00:00.000Z",
      },
      {
        id: "ag-5",
        assignment: "Case Study 4",
        course: "Data Privacy",
        totalSubmissions: 52,
        graded: 42,
        pending: 5,
        averageGrade: 52,
        feedbackProvidedPercent: 52,
        submissionDeadline: "2025-11-26T10:00:00.000Z",
      },
    ],
    showingDocumentsCount: 5,
    totalDocumentsCount: 100,
    currentPage: 1,
    totalPages: 10,
  },
};

const AssignmentGrading = () => {
  const { instructorId } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const rows = mockAssignmentGradingResponse.data.rows.map((r) =>
        mapReportToRow(r),
      );

      setTotalCount(mockAssignmentGradingResponse.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount:
          mockAssignmentGradingResponse.data.showingDocumentsCount ||
          rows.length,
        totalDocumentsCount:
          mockAssignmentGradingResponse.data.totalDocumentsCount ||
          rows.length,
        currentPage: mockAssignmentGradingResponse.data.currentPage || 1,
        totalPages: mockAssignmentGradingResponse.data.totalPages || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch assignment grading");
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
    assignment: report?.assignment,
    course: report?.course,
    totalSubmissions: report?.totalSubmissions,
    graded: report?.graded,
    pending: report?.pending,
    averageGrade: report?.averageGrade,
    feedbackProvidedPercent: report?.feedbackProvidedPercent,
    submissionDeadline: report?.submissionDeadline,
  });

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "course",
        width: "160px",
        body: {
          checks: [
            { label: "Privacy", queryValue: "Privacy" },
            { label: "Data Privacy", queryValue: "Data Privacy" },
          ],
        },
      },
    ],
    options: {
      dateFilter: true,
      action: [
        {
          text: "Archive report",
          link: (row) => `/archiiveReport/${row.id}/archive`,
        },
      ],
      selection: true,
      pagination: true,
    },
    columns: [
      {
        id: "assignment",
        key: "assignment",
        text: "Assignment",
        fraction: "220px",
      },
      {
        id: "course",
        key: "course",
        text: "Course",
        fraction: "150px",
      },
      {
        id: "totalSubmissions",
        key: "totalSubmissions",
        text: "Total Submissions",
        fraction: "170px",
      },
      {
        id: "graded",
        key: "graded",
        text: "Graded",
        fraction: "130px",
      },
      {
        id: "pending",
        key: "pending",
        text: "Pending",
        fraction: "120px",
      },
      {
        id: "averageGrade",
        key: "averageGrade",
        text: "Average Grade",
        fraction: "140px",
      },
      {
        id: "feedbackProvidedPercent",
        key: "feedbackProvidedPercent",
        text: "Feedback Provided (%)",
        fraction: "180px",
      },
      {
        id: "submissionDeadline",
        key: "submissionDeadline",
        text: "Submission Deadline",
        fraction: "200px",
        renderContent: (date) => (
          <Box>
            <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text>
            <Text fontSize="xs" color="gray.500">
              {dayjs(date).format("h:mm A")}
            </Text>
          </Box>
        ),
      },
    ],
  };

  const fetcher = () => async () => fetchReports();
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/instructorReport">Instructors</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Assignment Grading</Link></BreadcrumbItem>}
        />
      </Box>
      <Box display={"flex"} justifyContent="space-between" mb={10} gap={4}>
        <DashboardMetricCard
          title="Grading Completion Percentage (%)"
          value="79%"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Average Assignment Score (%)"
          value="82%"
          change="-5% vs last quarter"
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="Feedback Coverage (%)"
          value="80%"
          change="+5% vs last period"
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
          <Text mt={4}>Loading assignment grading...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load assignment grading"
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
          placeholder="Search here..."
          totalCount={totalCount}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const AssignmentGradingRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AssignmentGrading {...props} />} />;
};

export default AssignmentGrading;
