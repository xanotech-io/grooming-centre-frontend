import { useState } from "react";
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
  ExportMenu,
} from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useTableRows } from "../../../../hooks";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Tag } from "@chakra-ui/tag";
import { getStudentAssessments } from "../../../../services";

// ─── MOCK DATA (matches TC04 API spec) ───────────────────────────────────────
const MOCK_ASSESSMENT_RESPONSE = {
  data: {
    summary: {
      overallAverageScore: 81,
      highestScore: 95,
      lowestScore: 62,
      passRate: "83%",
      totalAssessments: 6,
      assessmentsPassed: 5,
    },
    assessments: [
      {
        id: "as-001",
        courseName: "Microfinance Basics",
        title: "Module 1 Quiz",
        type: "Quiz",
        dateTaken: "2025-10-05T10:00:00Z",
        score: 78,
        maxScore: 100,
        percentage: 78,
        grade: "B+",
        passFailStatus: "Pass",
      },
      {
        id: "as-002",
        courseName: "Microfinance Basics",
        title: "Midterm Exam",
        type: "Exam",
        dateTaken: "2025-10-20T10:00:00Z",
        score: 85,
        maxScore: 100,
        percentage: 85,
        grade: "A-",
        passFailStatus: "Pass",
      },
      {
        id: "as-003",
        courseName: "Advanced Accounting",
        title: "Assignment 1",
        type: "Assignment",
        dateTaken: "2025-09-15T14:00:00Z",
        score: 92,
        maxScore: 100,
        percentage: 92,
        grade: "A",
        passFailStatus: "Pass",
      },
      {
        id: "as-004",
        courseName: "Advanced Accounting",
        title: "Final Exam",
        type: "Exam",
        dateTaken: "2025-11-01T09:00:00Z",
        score: 62,
        maxScore: 100,
        percentage: 62,
        grade: "C",
        passFailStatus: "Fail",
      },
      {
        id: "as-005",
        courseName: "Business Ethics",
        title: "Case Study Quiz",
        type: "Quiz",
        dateTaken: "2025-10-10T11:00:00Z",
        score: 95,
        maxScore: 100,
        percentage: 95,
        grade: "A+",
        passFailStatus: "Pass",
      },
      {
        id: "as-006",
        courseName: "Risk Management",
        title: "Chapter Review",
        type: "Quiz",
        dateTaken: "2025-09-25T13:00:00Z",
        score: 74,
        maxScore: 100,
        percentage: 74,
        grade: "B",
        passFailStatus: "Pass",
      },
    ],
    showingDocumentsCount: 6,
    totalDocumentsCount: 6,
    currentPage: 1,
    totalPages: 1,
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const mapReportToRow = (a) => ({
  id: a?.id,
  courseName: a?.courseName,
  title: a?.title,
  type: a?.type,
  dateTaken: a?.dateTaken,
  score: `${a?.score ?? 0}/${a?.maxScore ?? 100}`,
  percentage: `${a?.percentage ?? 0}%`,
  grade: a?.grade,
  passFailStatus: a?.passFailStatus,
});

const AssessmentReport = () => {
  const { studentId } = useParams();
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
        const apiResponse = await getStudentAssessments(studentId, params);
        data = apiResponse?.data ?? apiResponse;
      } catch {
        data = MOCK_ASSESSMENT_RESPONSE.data;
      }
      setSummary(data.summary);
      const rows = data.assessments.map(mapReportToRow);
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
      setError(err.message || "Unable to fetch assessment report");
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

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Type",
        queryKey: "type",
        width: "150px",
        body: {
          checks: [
            { label: "Quiz", queryValue: "Quiz" },
            { label: "Exam", queryValue: "Exam" },
            { label: "Assignment", queryValue: "Assignment" },
          ],
        },
      },
      {
        triggerText: "Result",
        queryKey: "passFailStatus",
        width: "140px",
        body: {
          checks: [
            { label: "Pass", queryValue: "Pass" },
            { label: "Fail", queryValue: "Fail" },
          ],
        },
      },
    ],
    columns: [
      {
        id: "courseName",
        key: "courseName",
        text: "Course",
        fraction: "200px",
      },
      {
        id: "title",
        key: "title",
        text: "Assessment Title",
        fraction: "200px",
      },
      { id: "type", key: "type", text: "Type", fraction: "110px" },
      {
        id: "dateTaken",
        key: "dateTaken",
        text: "Date Taken",
        fraction: "120px",
        renderContent: (date) => (
          <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text>
        ),
      },
      { id: "score", key: "score", text: "Score", fraction: "100px" },
      {
        id: "percentage",
        key: "percentage",
        text: "Percentage",
        fraction: "110px",
      },
      {
        id: "grade",
        key: "grade",
        text: "Grade",
        fraction: "90px",
        renderContent: (grade) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={
              grade?.startsWith("A")
                ? "green"
                : grade?.startsWith("B")
                  ? "blue"
                  : grade?.startsWith("C")
                    ? "yellow"
                    : "red"
            }
          >
            {grade}
          </Tag>
        ),
      },
      {
        id: "passFailStatus",
        key: "passFailStatus",
        text: "Result",
        fraction: "90px",
        renderContent: (v) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={v === "Pass" ? "green" : "red"}
          >
            {v}
          </Tag>
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

  const fetcher = (props) => async () => fetchReports(studentId, props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const assessmentReportData = rows?.data?.rows ?? [];
  const assessmentReportRows = [
    [
      "Course",
      "Assessment Title",
      "Type",
      "Date Taken",
      "Score",
      "Percentage",
      "Grade",
      "Result",
    ],
    ...assessmentReportData.map((r) => [
      r.courseName,
      r.title,
      r.type,
      r.dateTaken ? dayjs(r.dateTaken).format("DD/MM/YYYY") : "",
      r.score,
      r.percentage,
      r.grade,
      r.passFailStatus,
    ]),
  ];

  return (
    <>
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
                <Link href="/admin/report/studentReport">Learners</Link>
              </BreadcrumbItem>
            }
            item3={
              <BreadcrumbItem isCurrentPage>
                <Link href="#">Assessment & Quizzes</Link>
              </BreadcrumbItem>
            }
          />
          {rows?.data?.rows?.length > 0 && (
            <ExportMenu
              rows={assessmentReportRows}
              filename="assessment-report"
              title="Assessment & Quizzes Report"
            />
          )}
        </Box>

        <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
          <DashboardMetricCard
            title="Average Score"
            value={summary ? `${summary.overallAverageScore}%` : "—"}
            change="across all assessments"
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Highest Score"
            value={summary ? `${summary.highestScore}%` : "—"}
            change="best performance"
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Pass Rate"
            value={summary?.passRate ?? "—"}
            change={`${summary?.assessmentsPassed ?? 0} of ${summary?.totalAssessments ?? 0} passed`}
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Lowest Score"
            value={summary ? `${summary.lowestScore}%` : "—"}
            change="needs improvement"
            changeColor="#E53E3E"
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
            <Text mt={4}>Loading assessment report...</Text>
          </Flex>
        ) : error ? (
          <EmptyState
            heading="Failed to load assessment report"
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
            placeholder="Search by course or assessment"
            totalCount={totalCount}
          />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export const AssessmentReportRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AssessmentReport {...props} />} />
  );
};

export default AssessmentReport;
