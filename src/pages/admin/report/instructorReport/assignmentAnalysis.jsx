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
import { useToast } from "@chakra-ui/react";
import {
  adminGetAssessmentItemAnalysisReport,
  adminFlagAssessmentQuestionForReview,
  adminBulkFlagAssessmentQuestionsForReview,
} from "../../../../services";

const formatSeconds = (seconds) => {
  const s = Number(seconds) || 0;
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}m ${rem}s`;
};

const AssignmentAnalysis = () => {
  const { instructorId } = useParams();
  const safeInstructorId =
    !instructorId || instructorId === "undefined" ? "inst_1" : instructorId;
  const assessmentId = `assessment_${safeInstructorId}`;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminGetAssessmentItemAnalysisReport(
        assessmentId,
        {
          ...params,
          instructorId: safeInstructorId,
        },
      );

      const rows = (response.rows || []).map((report) =>
        mapReportToRow(report),
      );
      setSummary(response.overallStatistics || null);
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
      setError(err.message || "Unable to fetch assignment analysis");
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
    questionId: report?.id,
    courseTitle: report?.courseTitle,
    questionType: report?.questionType,
    difficulty: report?.difficulty,
    attempts: report?.attempts,
    correctPercentage: report?.correctPercentage,
    correctLabel:
      typeof report?.correctPercentage === "number"
        ? `${report.correctPercentage}%`
        : `${report?.correctPercentage ?? 0}%`,
    averageTime: formatSeconds(report?.averageTimeSeconds),
  });

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "difficulty",
        width: "150px",
        body: {
          checks: [
            { label: "Easy", queryValue: "Easy" },
            { label: "Medium", queryValue: "Medium" },
            { label: "Hard", queryValue: "Hard" },
          ],
        },
      },
    ],
    options: {
      dateFilter: true,
      action: [
        {
          text: "Flag for Review",
          onClick: async (row) => {
            await adminFlagAssessmentQuestionForReview(assessmentId, {
              questionId: row.questionId,
              reason: "Flagged from item analysis dashboard",
              suggestedAction: "REVIEW",
            });
            toast({
              title: "Question flagged",
              description: `${row.questionId} submitted for review`,
              status: "success",
              duration: 2500,
              isClosable: true,
            });
          },
        },
      ],
      selection: true,
      pagination: true,
    },
    columns: [
      {
        id: "questionId",
        key: "questionId",
        text: "Question ID",
        fraction: "120px",
      },
      {
        id: "courseTitle",
        key: "courseTitle",
        text: "Course Title",
        fraction: "220px",
      },
      {
        id: "questionType",
        key: "questionType",
        text: "Question Type",
        fraction: "170px",
      },
      {
        id: "difficulty",
        key: "difficulty",
        text: "Difficulty",
        fraction: "150px",
      },
      {
        id: "attempts",
        key: "attempts",
        text: "Attempts",
        fraction: "120px",
      },
      {
        id: "correctLabel",
        key: "correctLabel",
        text: "Correct (%)",
        fraction: "140px",
      },
      {
        id: "averageTime",
        key: "averageTime",
        text: "Average Time",
        fraction: "160px",
      },
    ],
  };

  const fetcher = (props) => async () => fetchReports(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const handleBulkFlagQuestions = async () => {
    const difficultRows = (rows || []).filter((item) => {
      const lowAccuracy = Number(item.correctPercentage || 0) < 55;
      const hardDifficulty =
        (item.difficulty || "").toString().toLowerCase() === "hard";
      return lowAccuracy || hardDifficulty;
    });

    if (!difficultRows.length) {
      toast({
        title: "No candidates to bulk flag",
        description:
          "No hard or low-accuracy questions were found on this page.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    await adminBulkFlagAssessmentQuestionsForReview(assessmentId, {
      questions: difficultRows.map((item) => ({
        questionId: item.questionId,
        reason: "Auto-flagged: hard difficulty or low accuracy",
        suggestedAction: "REVIEW",
      })),
    });

    toast({
      title: "Bulk flag complete",
      description: `${difficultRows.length} questions flagged for review`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

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
              <Link href="#">Assignment Analysis</Link>
            </BreadcrumbItem>
          }
        />
        <Button secondary onClick={handleBulkFlagQuestions}>
          Bulk Flag Questions
        </Button>
      </Box>
      <Box display={"flex"} justifyContent="space-between" gridGap={4} mb={10}>
        <DashboardMetricCard
          title="Avg. Question Success"
          value={`${summary?.averageScore ?? 0}%`}
          change="assessment average score"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Question Reliability"
          value={`${summary?.reliabilityCoefficient ?? 0}`}
          change="reliability coefficient"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Average Completion Time"
          value={`${summary?.meanDifficultyIndex ?? 0}`}
          change="mean difficulty index"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Assessment Validity"
          value={`${summary?.meanDiscriminationIndex ?? 0}`}
          change="mean discrimination index"
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
          <Text mt={4}>Loading assignment analysis...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load assignment analysis"
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

export const AssignmentAnalysisRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AssignmentAnalysis {...props} />} />
  );
};

export default AssignmentAnalysis;
