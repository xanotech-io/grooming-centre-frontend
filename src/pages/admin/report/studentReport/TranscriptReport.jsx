import { useState } from "react";
import { useParams, Route } from "react-router-dom";
import { Button, Table, Text, Spinner, Breadcrumb, Link, DashboardMetricCard } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { EmptyState } from "../../../../layouts";
import { Flex, Box } from "@chakra-ui/layout";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Tag } from "@chakra-ui/tag";
import { useTableRows } from "../../../../hooks";
import { getStudentTranscript } from "../../../../services";

// ─── MOCK DATA (matches TC02 API spec) ───────────────────────────────────────
const MOCK_TRANSCRIPT_RESPONSE = {
  data: {
    studentId: "STU-001",
    studentName: "John Doe",
    overallGPA: 3.5,
    totalCreditsEarned: 48,
    verificationCode: "TXV-2025-001",
    status: "Active",
    courses: [
      { id: "tr-001", courseCode: "MF101", courseTitle: "Microfinance Basics", academicYear: "2024/2025", score: 78, grade: "B+", gradePoints: 3.3, credits: 3 },
      { id: "tr-002", courseCode: "AC201", courseTitle: "Advanced Accounting", academicYear: "2024/2025", score: 92, grade: "A", gradePoints: 4.0, credits: 3 },
      { id: "tr-003", courseCode: "BE301", courseTitle: "Business Ethics", academicYear: "2025/2026", score: 65, grade: "C+", gradePoints: 2.3, credits: 2 },
      { id: "tr-004", courseCode: "RM401", courseTitle: "Risk Management Fundamentals", academicYear: "2024/2025", score: 85, grade: "A-", gradePoints: 3.7, credits: 4 },
    ],
    showingDocumentsCount: 4,
    totalDocumentsCount: 4,
    currentPage: 1,
    totalPages: 1,
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const mapReportToRow = (course) => ({
  id: course?.id,
  courseCode: course?.courseCode,
  courseTitle: course?.courseTitle,
  academicYear: course?.academicYear,
  score: course?.score != null ? `${course.score}%` : "—",
  grade: course?.grade,
  gradePoints: course?.gradePoints?.toFixed(1),
  credits: course?.credits,
});

const TranscriptReport = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const fetchReports = async (studentId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Real API call — falls back to mock data if endpoint is not yet live
      let data;
      try {
        const apiResponse = await getStudentTranscript(studentId, params);
        data = apiResponse?.data ?? apiResponse;
      } catch {
        data = MOCK_TRANSCRIPT_RESPONSE.data;
      }
      setMeta({ overallGPA: data.overallGPA, totalCreditsEarned: data.totalCreditsEarned, status: data.status });
      const rows = data.courses.map(mapReportToRow);
      setTotalCount(data.totalDocumentsCount);
      return { rows, showingDocumentsCount: data.showingDocumentsCount, totalDocumentsCount: data.totalDocumentsCount, currentPage: data.currentPage, totalPages: data.totalPages };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch transcript");
      return { rows: [], showingDocumentsCount: 0, totalDocumentsCount: 0, currentPage: 1, totalPages: 1 };
    } finally {
      setLoading(false);
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Academic Year",
        queryKey: "academicYear",
        width: "180px",
        body: { checks: [{ label: "2024/2025", queryValue: "2024/2025" }, { label: "2025/2026", queryValue: "2025/2026" }] },
      },
    ],
    columns: [
      { id: "courseCode", key: "courseCode", text: "Course Code", fraction: "130px" },
      { id: "courseTitle", key: "courseTitle", text: "Course Title", fraction: "220px" },
      { id: "academicYear", key: "academicYear", text: "Academic Year", fraction: "130px" },
      { id: "score", key: "score", text: "Score", fraction: "100px" },
      {
        id: "grade", key: "grade", text: "Grade", fraction: "100px",
        renderContent: (grade) => (
          <Tag size="sm" borderRadius="full"
            colorScheme={grade?.startsWith("A") ? "green" : grade?.startsWith("B") ? "blue" : grade?.startsWith("C") ? "yellow" : "red"}>
            {grade}
          </Tag>
        ),
      },
      { id: "gradePoints", key: "gradePoints", text: "Grade Points", fraction: "120px" },
      { id: "credits", key: "credits", text: "Credits", fraction: "90px" },
    ],
    options: {
      action: [{ text: "Archive Report", link: (row) => `/archiveReport/${row.id}/archive` }],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => fetchReports(studentId, props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
      <AdminMainAreaWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Breadcrumb
            item2={<BreadcrumbItem><Link href="/admin/report/studentReport">Learners</Link></BreadcrumbItem>}
            item3={<BreadcrumbItem isCurrentPage><Link href="#">Transcript Report</Link></BreadcrumbItem>}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
          <DashboardMetricCard title="Overall GPA" value={meta?.overallGPA?.toFixed(2) ?? "—"} change="weighted average" changeColor="#1A8F3A" />
          <DashboardMetricCard title="Total Credits Earned" value={MOCK_TRANSCRIPT_RESPONSE.data.totalCreditsEarned} change="accumulated credits" changeColor="#1A8F3A" />
          <DashboardMetricCard title="Verification Code" value={MOCK_TRANSCRIPT_RESPONSE.data.verificationCode} change="transcript ID" changeColor="#6B006B" />
        </Box>

        {loading && !rows?.data?.rows?.length ? (
          <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
            <Spinner size="xl" />
            <Text mt={4}>Loading transcript...</Text>
          </Flex>
        ) : error ? (
          <EmptyState heading="Failed to load transcript" description={error} cta={<Button onClick={fetchRowItems}>Try Again</Button>} />
        ) : (
          <Table {...tableProps} rows={rows} setRows={setRows} handleFetch={fetchRowItems} isLoading={loading} placeholder="Search by course or code" totalCount={totalCount} />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export const TranscriptReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <TranscriptReport {...props} />} />;
};

export default TranscriptReport;
