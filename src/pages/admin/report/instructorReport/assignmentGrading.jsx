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
import { adminGetInstructorGradingSummaryReport } from "../../../../services";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const AssignmentGrading = () => {
  const { instructorId } = useParams();
  const safeInstructorId =
    !instructorId || instructorId === "undefined" ? "inst_1" : instructorId;
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminGetInstructorGradingSummaryReport(
        safeInstructorId,
        params,
      );
      const rows = (response.rows || []).map((r) => mapReportToRow(r));

      setSummary(response.overallMetrics || null);

      setTotalCount(response.totalDocumentsCount || rows.length);

      return {
        rows,
        showingDocumentsCount: response.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.totalDocumentsCount || rows.length,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
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
              <Link href="/admin/report/instructorReport">Instructors</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Assignment Grading</Link>
            </BreadcrumbItem>
          }
        />
      </Box>
      <Box display={"flex"} justifyContent="space-between" mb={10} gap={4}>
        <DashboardMetricCard
          title="Grading Completion Percentage (%)"
          value={`${summary?.totalSubmissions ? Number(((summary?.totalGraded || 0) / summary.totalSubmissions) * 100).toFixed(1) : 0}%`}
          change={`${summary?.totalGraded ?? 0} graded`}
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Average Assignment Score (%)"
          value={`${summary?.overallAverageGrade ? Number(summary.overallAverageGrade).toFixed(1) : 0}%`}
          change={`${summary?.totalAssignments ?? 0} assignments`}
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="Feedback Coverage (%)"
          value={`${summary?.feedbackCompletionRate ?? 0}%`}
          change={`${summary?.totalPending ?? 0} pending`}
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
  return (
    <Route {...rest} render={(props) => <AssignmentGrading {...props} />} />
  );
};

export default AssignmentGrading;
