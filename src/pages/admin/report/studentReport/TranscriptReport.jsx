import { useEffect, useState } from "react";
import { useParams, Route, useHistory } from "react-router-dom";
import {
  Button,
  Table,
  Text,
  Spinner,
  Breadcrumb,
  Link,
  DashboardMetricCard,
} from "../../../../components";
import { BreadcrumbItem, useToast } from "@chakra-ui/react";
import { EmptyState } from "../../../../layouts";
import { Flex, Box } from "@chakra-ui/layout";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Tag } from "@chakra-ui/tag";
import { useTableRows } from "../../../../hooks";
import {
  adminGetStudentTranscript,
  adminPostCompletionToTranscript,
  adminRequestOfficialTranscript,
  adminVerifyTranscript,
} from "../../../../services";

const mapReportToRow = (course) => ({
  id: course?.id || course?.transcriptId || course?.courseCode,
  courseCode: course?.courseCode,
  courseTitle: course?.courseTitle,
  academicYear: course?.academicYear || "2024/2025",
  score: course?.score != null ? `${course.score}%` : "—",
  grade: course?.grade,
  gradePoints:
    typeof course?.gradePoints === "number"
      ? course.gradePoints.toFixed(1)
      : course?.gradePoints,
  credits: course?.credits,
});

const TranscriptReport = () => {
  const { studentId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const safeStudentId =
    !studentId || studentId === "undefined" ? "mock_student_1" : studentId;

  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!studentId || studentId === "undefined") {
      history.replace(`/admin/report/studentReport/${safeStudentId}/transcript`);
    }
  }, [history, studentId, safeStudentId]);

  const fetchReports = async (studentIdValue, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const apiResponse = await adminGetStudentTranscript(studentIdValue, params);
      const data = apiResponse?.data ?? apiResponse;

      setMeta({
        overallGPA: data.overallGPA,
        totalCreditsEarned: data.totalCreditsEarned,
        verificationCode: data.verificationCode,
        status: data.status,
      });

      const rows = (data.courses || []).map(mapReportToRow);
      setTotalCount(data.totalDocumentsCount || rows.length);

      return {
        rows,
        showingDocumentsCount: data.showingDocumentsCount || rows.length,
        totalDocumentsCount: data.totalDocumentsCount || rows.length,
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
      };
    } catch (requestError) {
      setError(requestError.message || "Unable to fetch transcript");
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

  const handlePostCompletion = async () => {
    try {
      const { message } = await adminPostCompletionToTranscript(safeStudentId, {
        studentId: safeStudentId,
        courseId: "CRS-AGR101",
        examType: "COURSE_EXAMINATION",
        examId: "EXM-AGR101-001",
        questionList: [
          {
            questionId: "Q001",
            questionText: "What is the main nutrient in soil?",
            studentAnswer: "Nitrogen",
          },
          {
            questionId: "Q002",
            questionText: "Define Photosynthesis",
            studentAnswer:
              "Process by which plants convert light energy into chemical energy",
          },
        ],
        score: 85,
        completionStatus: "Completed",
        instructorId: "INST-003",
        remarks: "Course completed successfully",
      });

      toast({ status: "success", description: message, duration: 3000 });
      fetchRowItems();
    } catch (requestError) {
      toast({
        status: "error",
        description: requestError.message || "Unable to post completion",
        duration: 3000,
      });
    }
  };

  const handleRequestOfficialTranscript = async () => {
    try {
      const { message } = await adminRequestOfficialTranscript(safeStudentId);
      toast({ status: "success", description: message, duration: 3000 });
    } catch (requestError) {
      toast({
        status: "error",
        description:
          requestError.message || "Unable to request official transcript",
        duration: 3000,
      });
    }
  };

  const handleVerifyTranscript = async () => {
    try {
      const { message } = await adminVerifyTranscript({
        verificationCode: meta?.verificationCode,
      });
      toast({ status: "success", description: message, duration: 3000 });
    } catch (requestError) {
      toast({
        status: "error",
        description: requestError.message || "Unable to verify transcript",
        duration: 3000,
      });
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Academic Year",
        queryKey: "academicYear",
        width: "180px",
        body: {
          checks: [
            { label: "2024/2025", queryValue: "2024/2025" },
            { label: "2025/2026", queryValue: "2025/2026" },
          ],
        },
      },
    ],
    columns: [
      { id: "courseCode", key: "courseCode", text: "Course Code", fraction: "130px" },
      { id: "courseTitle", key: "courseTitle", text: "Course Title", fraction: "220px" },
      { id: "academicYear", key: "academicYear", text: "Academic Year", fraction: "130px" },
      { id: "score", key: "score", text: "Score", fraction: "100px" },
      {
        id: "grade",
        key: "grade",
        text: "Grade",
        fraction: "100px",
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
      { id: "gradePoints", key: "gradePoints", text: "Grade Points", fraction: "120px" },
      { id: "credits", key: "credits", text: "Credits", fraction: "90px" },
    ],
    options: {
      action: [{ text: "Archive Report", link: (row) => `/archiveReport/${row.id}/archive` }],
      selection: true,
      pagination: false,
    },
  };

  const fetcher = (props) => async () =>
    fetchReports(safeStudentId, props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/studentReport">Learners</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem><Link href={`/admin/report/studentReport/${safeStudentId}/details`}>Report Details</Link></BreadcrumbItem>}
          item4={<BreadcrumbItem isCurrentPage><Link href="#">Transcript Report</Link></BreadcrumbItem>}
        />
        <Flex gap="8px">
          <Button secondary onClick={handlePostCompletion}>Post Completion</Button>
          <Button secondary onClick={handleRequestOfficialTranscript}>Request Official</Button>
          <Button onClick={handleVerifyTranscript}>Verify Transcript</Button>
        </Flex>
      </Box>

      <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
        <DashboardMetricCard title="Overall GPA" value={meta?.overallGPA?.toFixed?.(2) ?? "—"} change="weighted average" changeColor="#1A8F3A" />
        <DashboardMetricCard title="Total Credits Earned" value={meta?.totalCreditsEarned ?? "—"} change="accumulated credits" changeColor="#1A8F3A" />
        <DashboardMetricCard title="Verification Code" value={meta?.verificationCode ?? "—"} change="transcript ID" changeColor="#6B006B" />
      </Box>

      {loading && !rows?.data?.rows?.length ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading transcript...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load transcript"
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
          placeholder="Search by course or code"
          totalCount={totalCount}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const TranscriptReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <TranscriptReport {...props} />} />;
};

export default TranscriptReport;
