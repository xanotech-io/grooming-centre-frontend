import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Table,
  Text,
  Spinner,
  Breadcrumb,
  Link,
} from "../../../../components";
import { EmptyState } from "../../../../layouts";
import { Flex, Box } from "@chakra-ui/layout";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../../components";
import dayjs from "dayjs";
import { Tag } from "@chakra-ui/tag";
import { useTableRows } from "../../../../hooks";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  adminGetStudentProgress,
  adminGetStudentProgressSummary,
} from "../../../../services";

const ProgressReport = () => {
  const { studentId } = useParams();
  const history = useHistory();
  const safeStudentId =
    !studentId || studentId === "undefined" ? "mock_student_1" : studentId;

  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!studentId || studentId === "undefined") {
      history.replace(`/admin/report/studentReport/${safeStudentId}/progress`);
    }
  }, [history, studentId, safeStudentId]);

  const mapReportToRow = (report) => ({
    id: report?.reportId,
    studentId: report?.studentId,
    studentName: report?.studentName,
    courseId: report?.courseId,
    courseTitle: report?.courseTitle,
    enrollmentDate: report?.enrollmentDate,
    modulesCompleted: `${report?.modulesCompleted || 0}/${report?.totalModules || 0}`,
    completionPercentage:
      report?.completionPercentage != null ? `${report.completionPercentage}%` : "—",
    score:
      report?.cumulativeAverageScore != null
        ? `${Number(report.cumulativeAverageScore).toFixed(1)}%`
        : "—",
    status: report?.completionStatus,
    certificate: Boolean(report?.certificatesEarned?.length),
    lastAccess: report?.lastAccessDate,
  });

  const fetchReports = async (studentIdValue, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const [progressResponse, summaryResponse] = await Promise.all([
        adminGetStudentProgress(studentIdValue, params),
        adminGetStudentProgressSummary(studentIdValue),
      ]);

      const rows =
        progressResponse.rows?.map((report) => mapReportToRow(report)) || [];

      setSummary(summaryResponse);
      setTotalCount(progressResponse.count || rows.length);

      return {
        rows,
        showingDocumentsCount: progressResponse.count || rows.length,
        totalDocumentsCount: progressResponse.count || rows.length,
        currentPage: progressResponse.page || 1,
        totalPages: progressResponse.totalPages || 1,
      };
    } catch (requestError) {
      setError(requestError.message || "Unable to fetch student progress");
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

  // Setup Table
  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "status",
        width: "180px",
        body: {
          checks: [
            { label: "Completed", queryValue: "COMPLETED" },
            { label: "In Progress", queryValue: "IN_PROGRESS" },
            { label: "Not Started", queryValue: "NOT_STARTED" },
          ],
        },
      },
    ],

    columns: [
      {
        id: "studentId",
        key: "studentId",
        text: "Student ID",
        fraction: "130px",
      },

      {
        id: "courseTitle",
        key: "courseTitle",
        text: "Course Title",
        fraction: "220px",
      },

      {
        id: "enrollmentDate",
        key: "enrollmentDate",
        text: "Enrollment Date",
        fraction: "130px",
        renderContent: (date) => (
          <Box>
            <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text>
            <Text fontSize="xs" color="gray.500">
              {dayjs(date).format("h:mm A")}
            </Text>
          </Box>
        ),
      },

      {
        id: "modulesCompleted",
        key: "modulesCompleted",
        text: "Modules Completed",
        fraction: "150px",
      },

      {
        id: "completionPercentage",
        key: "completionPercentage",
        text: "Completion",
        fraction: "120px",
      },

      {
        id: "score",
        key: "score",
        text: "Score (%)",
        fraction: "100px",
      },

      {
        id: "status",
        key: "status",
        text: "Status",
        fraction: "150px",
        renderContent: (status) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={
              status === "Completed"
                ? "green"
                : status === "In Progress"
                  ? "yellow"
                  : "red"
            }
          >
            {status}
          </Tag>
        ),
      },

      {
        id: "certificate",
        key: "certificate",
        text: "Certificate",
        fraction: "100px",
        renderContent: (value) => <Text>{value ? "Yes" : "No"}</Text>,
      },
      {
        id: "lastAccess",
        key: "lastAccess",
        text: "Last Access",
        fraction: "180px",
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

  const fetcher = (props) => async () => {
    return await fetchReports(safeStudentId, props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
      <AdminMainAreaWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Breadcrumb
            item2={
              <BreadcrumbItem>
                <Link href="/admin/report/studentReport">Learners</Link>
              </BreadcrumbItem>
            }
            item3={
              <BreadcrumbItem>
                <Link href={`/admin/report/studentReport/${safeStudentId}/details`}>
                  Report Details
                </Link>
              </BreadcrumbItem>
            }
            item4={
              <BreadcrumbItem isCurrentPage>
                <Link href="#">Progress Report</Link>
              </BreadcrumbItem>
            }
          />
          <Button secondary onClick={fetchRowItems}>
            Refresh
          </Button>
        </Box>

        <Box
          display={"flex"}
          justifyContent="space-between"
          gridGap={4}
          mb={10}
        >
          <DashboardMetricCard
            title="Overall Completion"
            value={`${summary?.overallCompletionRate ?? 0}%`}
            change={`${summary?.completedCourses ?? 0} completed courses`}
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Average Assessment Score"
            value={`${summary?.averageScore ?? 0}%`}
            change={`${summary?.totalCourses ?? 0} tracked courses`}
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Average Time Spent"
            value={`${summary?.totalTimeSpentHours ?? 0} hrs`}
            change="per learner"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Weekly Activity Rate"
            value={`${summary?.averageWeeklyLogins ?? 0}`}
            change="logins/week"
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
            <Text mt={4}>Loading student progress...</Text>
          </Flex>
        ) : error ? (
          <EmptyState
            heading="Failed to load student progress"
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

export const ProgressReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProgressReport {...props} />} />;
};

export default ProgressReport;
