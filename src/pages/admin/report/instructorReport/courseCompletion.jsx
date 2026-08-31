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
  ExportMenu,
  Link,
} from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import { adminGetInstructorCourseCompletionReport } from "../../../../services";

const getPassPercentage = (passed, failed) => {
  const total = (passed || 0) + (failed || 0);
  if (!total) return "0%";
  const percent = Math.round(((passed || 0) / total) * 100);
  return `${percent}%`;
};

const CourseCompletion = () => {
  const { instructorId } = useParams();
  const safeInstructorId =
    !instructorId || instructorId === "undefined" ? "inst_1" : instructorId;
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchCourseCompletionReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminGetInstructorCourseCompletionReport(
        safeInstructorId,
        params,
      );

      const rows = (response.rows || []).map((report) =>
        mapReportToRow(report),
      );
      setSummary(response.aggregateStats || null);
      setTotalCount(response.totalDocumentsCount || rows.length);

      return {
        rows,
        showingDocumentsCount: response.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.totalDocumentsCount || rows.length,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
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

  const courseCompletionRows = rows?.data?.rows ?? [];

  const exportRows = [
    [
      "Course",
      "Instructor",
      "Total Enrolled",
      "Completed",
      "Passed",
      "Failed",
      "Pass (%)",
      "Average Score",
    ],
    ...courseCompletionRows.map((row) => [
      row.course || "",
      row.instructor || "",
      row.totalEnrolled ?? "",
      row.completed ?? "",
      row.passed ?? "",
      row.failed ?? "",
      row.passPercentage ?? "",
      row.averageScore ?? "",
    ]),
  ];

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
              <Link href="#">Course Completion</Link>
            </BreadcrumbItem>
          }
        />
        <ExportMenu
          rows={exportRows}
          filename="course-completion-report"
          title="Course Completion Report"
        />
      </Box>
      <Box display={"flex"} justifyContent="space-between" gridGap={4} mb={10}>
        <DashboardMetricCard
          title="Completion Rate"
          value={`${summary?.overallCompletionRate ?? 0}%`}
          change={`${summary?.totalStudents ?? 0} learners`}
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Pass Rate"
          value={`${summary?.overallPassRate ?? 0}%`}
          change={`${summary?.totalCourses ?? 0} courses`}
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Average Course Score"
          value={`${summary?.averageScore ?? 0}%`}
          change="per learner"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Total Courses"
          value={`${summary?.totalCourses ?? 0}`}
          change="tracked"
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
  return (
    <Route {...rest} render={(props) => <CourseCompletion {...props} />} />
  );
};

export default CourseCompletion;
