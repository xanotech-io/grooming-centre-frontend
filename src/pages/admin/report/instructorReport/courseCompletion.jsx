import React, { useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
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


const mockInstructorCourseCompletionResponse = {
  data: {
    rows: [
      {
        id: "cc-1",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 63,
        completed: 46,
        passed: 45,
        failed: 2,
        averageScore: 53,
      },
      {
        id: "cc-2",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 68,
        completed: 52,
        passed: 45,
        failed: 23,
        averageScore: 53,
      },
      {
        id: "cc-3",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 61,
        completed: 37,
        passed: 30,
        failed: 16,
        averageScore: 53,
      },
      {
        id: "cc-4",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 55,
        completed: 41,
        passed: 35,
        failed: 6,
        averageScore: 53,
      },
      {
        id: "cc-5",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 72,
        completed: 63,
        passed: 61,
        failed: 15,
        averageScore: 53,
      },
      {
        id: "cc-6",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 64,
        completed: 48,
        passed: 45,
        failed: 10,
        averageScore: 53,
      },
      {
        id: "cc-7",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 58,
        completed: 42,
        passed: 40,
        failed: 8,
        averageScore: 53,
      },
      {
        id: "cc-8",
        course: "Microfinance Basics",
        instructor: "J. Smith",
        totalEnrolled: 79,
        completed: 60,
        passed: 59,
        failed: 12,
        averageScore: 53,
      },
    ],
    showingDocumentsCount: 8,
    totalDocumentsCount: 100,
    currentPage: 1,
    totalPages: 13,
  },
};

const getPassPercentage = (passed, failed) => {
  const total = (passed || 0) + (failed || 0);
  if (!total) return "0%";
  const percent = Math.round(((passed || 0) / total) * 100);
  return `${percent}%`;
};

const CourseCompletion = () => {
  const { instructorId } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchCourseCompletionReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Replace with API call later (keeping params so pagination/search can be wired)
      const response = mockInstructorCourseCompletionResponse;

      const rows = response.data.rows.map((report) => mapReportToRow(report));
      setTotalCount(response.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount: response.data.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.data.totalDocumentsCount || rows.length,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        // `params` is intentionally unused for now
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch course completion reports");
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
    totalEnrolled: report?.totalEnrolled,
    completed: report?.completed,
    passed: report?.passed,
    failed: report?.failed,
    passPercentage: getPassPercentage(report?.passed, report?.failed),
    averageScore: report?.averageScore,
  });

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "course",
        width: "150px",
        body: {
          checks: [
            { label: "Microfinance Basics", queryValue: "Microfinance Basics" },
            { label: "Basics", queryValue: "Basics" },
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
        id: "course",
        key: "course",
        text: "Course",
        fraction: "250px",
      },
      {
        id: "instructor",
        key: "instructor",
        text: "Instructor",
        fraction: "200px",
      },
      {
        id: "totalEnrolled",
        key: "totalEnrolled",
        text: "Total Enrolled",
        fraction: "150px",
      },
      {
        id: "completed",
        key: "completed",
        text: "Completed",
        fraction: "120px",
      },
      {
        id: "passed",
        key: "passed",
        text: "Passed",
        fraction: "120px",
      },
      {
        id: "failed",
        key: "failed",
        text: "Failed",
        fraction: "120px",
      },
      {
        id: "passPercentage",
        key: "passPercentage",
        text: "Pass (%)",
        fraction: "130px",
      },
      {
        id: "averageScore",
        key: "averageScore",
        text: "Average Score",
        fraction: "180px",
      },
    ],
  };

  const fetcher = (props) => async () => {
    return await fetchCourseCompletionReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/instructorReport">Instructors</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Course Completion</Link></BreadcrumbItem>}
        />
      </Box>
      <Box
        display={"flex"}
        justifyContent="space-between"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Completion Rate"
          value="82%"
          change="+5% vs last month"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Pass Rate"
          value="82%"
          change="+5% vs last month"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Average Course Score"
          value="45"
          change="per learner"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Dropout Rate"
          value="4.2"
          change="logins/week"
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
          <Text mt={4}>Loading course completion...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load course completion"
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

export const CourseCompletionRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <CourseCompletion {...props} />} />;
};

export default CourseCompletion;
