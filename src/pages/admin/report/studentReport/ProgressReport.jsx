import { useState } from "react";
import { useParams, useLocation, Route } from "react-router-dom";
import { Button, Table, Text, Spinner, Breadcrumb, Link, DashboardMetricCard } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { EmptyState } from "../../../../layouts";
import { Flex, Box } from "@chakra-ui/layout";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import dayjs from "dayjs";
import { Tag } from "@chakra-ui/tag";
import { useTableRows } from "../../../../hooks";
import { getStudentProgress } from "../../../../services";

// ─── MOCK DATA (matches API spec) ────────────────────────────────────────────
const MOCK_PROGRESS_RESPONSE = {
  data: {
    summary: {
      totalCourses: 4,
      completedCourses: 2,
      inProgressCourses: 1,
      overallCompletionRate: "50%",
      averageScore: 78,
      totalCertificates: 2,
      totalTimeSpentHours: 22.5,
      averageWeeklyLogins: 3.8,
    },
    rows: [
      {
        id: "pr-001",
        studentId: "STU-001",
        studentName: "John Doe",
        courseTitle: "Microfinance Basics",
        enrollmentDate: "2025-09-01T08:00:00Z",
        modulesCompleted: 8,
        totalModules: 10,
        completionPercentage: 80,
        latestAssessmentScore: 75,
        cumulativeAverageScore: 78,
        completionStatus: "In Progress",
        certificatesEarned: [],
        lastAccessDate: "2025-11-20T10:00:00Z",
        timeSpentHours: 9.5,
        weeklyLoginCount: 4,
      },
      {
        id: "pr-002",
        studentId: "STU-001",
        studentName: "John Doe",
        courseTitle: "Advanced Accounting",
        enrollmentDate: "2025-08-15T08:00:00Z",
        modulesCompleted: 12,
        totalModules: 12,
        completionPercentage: 100,
        latestAssessmentScore: 92,
        cumulativeAverageScore: 88,
        completionStatus: "Completed",
        certificatesEarned: [{ id: "cert-001" }],
        lastAccessDate: "2025-10-30T14:30:00Z",
        timeSpentHours: 13,
        weeklyLoginCount: 5,
      },
      {
        id: "pr-003",
        studentId: "STU-001",
        studentName: "John Doe",
        courseTitle: "Business Ethics",
        enrollmentDate: "2025-10-01T08:00:00Z",
        modulesCompleted: 0,
        totalModules: 8,
        completionPercentage: 0,
        latestAssessmentScore: null,
        cumulativeAverageScore: null,
        completionStatus: "Not Started",
        certificatesEarned: [],
        lastAccessDate: null,
        timeSpentHours: 0,
        weeklyLoginCount: 0,
      },
      {
        id: "pr-004",
        studentId: "STU-001",
        studentName: "John Doe",
        courseTitle: "Risk Management Fundamentals",
        enrollmentDate: "2025-07-01T08:00:00Z",
        modulesCompleted: 15,
        totalModules: 15,
        completionPercentage: 100,
        latestAssessmentScore: 85,
        cumulativeAverageScore: 82,
        completionStatus: "Completed",
        certificatesEarned: [{ id: "cert-002" }],
        lastAccessDate: "2025-09-25T09:00:00Z",
        timeSpentHours: 18,
        weeklyLoginCount: 3,
      },
    ],
    showingDocumentsCount: 4,
    totalDocumentsCount: 4,
    currentPage: 1,
    totalPages: 1,
  },
};

const extractMockData = () => MOCK_PROGRESS_RESPONSE.data;
// ─────────────────────────────────────────────────────────────────────────────

const mapReportToRow = (report) => ({
  id: report?.id,
  studentName: report?.studentName,
  courseTitle: report?.courseTitle,
  enrollmentDate: report?.enrollmentDate,
  modulesCompleted: `${report?.modulesCompleted ?? 0}/${report?.totalModules ?? 0}`,
  completionPercentage: `${report?.completionPercentage ?? 0}%`,
  avgScore: report?.cumulativeAverageScore != null ? `${report.cumulativeAverageScore}%` : "—",
  timeSpent: report?.timeSpentHours ? `${report.timeSpentHours}h` : "—",
  completionStatus: report?.completionStatus,
  certificate: (report?.certificatesEarned?.length ?? 0) > 0,
  lastAccessDate: report?.lastAccessDate,
});

const ProgressReport = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("courseId");

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
        const apiResponse = await getStudentProgress(studentId, { ...params });
        data = apiResponse?.data ?? apiResponse;
      } catch {
        data = extractMockData();
      }
      setSummary(data.summary);
      const rows = data.rows.map(mapReportToRow);
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
      setError(err.message || "Unable to fetch progress report");
      return { rows: [], showingDocumentsCount: 0, totalDocumentsCount: 0, currentPage: 1, totalPages: 1 };
    } finally {
      setLoading(false);
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Status",
        queryKey: "completionStatus",
        width: "180px",
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
      { id: "studentName", key: "studentName", text: "Student Name", fraction: "180px" },
      { id: "courseTitle", key: "courseTitle", text: "Course Title", fraction: "220px" },
      {
        id: "enrollmentDate", key: "enrollmentDate", text: "Enrolled", fraction: "120px",
        renderContent: (date) => date ? <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text> : <Text color="gray.400">—</Text>,
      },
      { id: "modulesCompleted", key: "modulesCompleted", text: "Modules", fraction: "110px" },
      { id: "completionPercentage", key: "completionPercentage", text: "Completion", fraction: "110px" },
      { id: "avgScore", key: "avgScore", text: "Avg Score", fraction: "100px" },
      { id: "timeSpent", key: "timeSpent", text: "Time Spent", fraction: "100px" },
      {
        id: "completionStatus", key: "completionStatus", text: "Status", fraction: "140px",
        renderContent: (status) => (
          <Tag size="sm" borderRadius="full"
            colorScheme={status === "Completed" ? "green" : status === "In Progress" ? "yellow" : "gray"}>
            {status}
          </Tag>
        ),
      },
      {
        id: "certificate", key: "certificate", text: "Certificate", fraction: "100px",
        renderContent: (v) => <Text color={v ? "green.500" : "gray.400"}>{v ? "Yes" : "No"}</Text>,
      },
      {
        id: "lastAccessDate", key: "lastAccessDate", text: "Last Access", fraction: "130px",
        renderContent: (date) => date ? <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text> : <Text color="gray.400">—</Text>,
      },
    ],
    options: {
      action: [{ text: "Archive Report", link: (row) => `/archiveReport/${row.id}/archive` }],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    const apiParams = { ...props?.params };
    if (courseId) apiParams.courseId = courseId;
    return await fetchReports(studentId, apiParams);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
      <AdminMainAreaWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Breadcrumb
            item2={<BreadcrumbItem><Link href="/admin/report/studentReport">Learners</Link></BreadcrumbItem>}
            item3={<BreadcrumbItem isCurrentPage><Link href="#">Progress Report</Link></BreadcrumbItem>}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
          <DashboardMetricCard title="Overall Completion Rate" value={summary?.overallCompletionRate ?? "—"} change={`${summary?.completedCourses ?? 0} of ${summary?.totalCourses ?? 0} courses`} changeColor="#1A8F3A" />
          <DashboardMetricCard title="Average Score" value={summary?.averageScore ? `${summary.averageScore}%` : "—"} change="across all assessments" changeColor="#1A8F3A" />
          <DashboardMetricCard title="Total Time Spent" value={summary?.totalTimeSpentHours ? `${summary.totalTimeSpentHours}h` : "—"} change="total learning hours" changeColor="#1A8F3A" />
          <DashboardMetricCard title="Weekly Activity Rate" value={summary?.averageWeeklyLogins ?? "—"} change="logins/week" changeColor="#1A8F3A" />
        </Box>

        {loading && !rows?.data?.rows?.length ? (
          <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
            <Spinner size="xl" />
            <Text mt={4}>Loading progress report...</Text>
          </Flex>
        ) : error ? (
          <EmptyState heading="Failed to load progress report" description={error} cta={<Button onClick={fetchRowItems}>Try Again</Button>} />
        ) : (
          <Table {...tableProps} rows={rows} setRows={setRows} handleFetch={fetchRowItems} isLoading={loading} placeholder="Search by student or course" totalCount={totalCount} />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export const ProgressReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProgressReport {...props} />} />;
};

export default ProgressReport;
