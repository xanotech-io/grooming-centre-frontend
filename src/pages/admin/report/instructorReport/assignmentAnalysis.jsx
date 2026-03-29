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

const mockInstructorAssignmentAnalysisResponse = {
  data: {
    rows: [
      {
        id: "Q001",
        courseTitle: "Microfinance Basics",
        questionType: "Multiple Choice",
        difficulty: "Medium",
        attempts: 25,
        correctPercentage: 65,
        averageTimeSeconds: 54,
      },
      {
        id: "Q002",
        courseTitle: "Microfinance Basics",
        questionType: "True/False",
        difficulty: "Easy",
        attempts: 55,
        correctPercentage: 93,
        averageTimeSeconds: 29,
      },
      {
        id: "Q003",
        courseTitle: "Microfinance Basics",
        questionType: "Open-Friend",
        difficulty: "Hard",
        attempts: 33,
        correctPercentage: 41,
        averageTimeSeconds: 60,
      },
      {
        id: "Q004",
        courseTitle: "Microfinance Basics",
        questionType: "Multiple Choice",
        difficulty: "Hard",
        attempts: 25,
        correctPercentage: 85,
        averageTimeSeconds: 85,
      },
      {
        id: "Q005",
        courseTitle: "Microfinance Basics",
        questionType: "True/False",
        difficulty: "Easy",
        attempts: 41,
        correctPercentage: 52,
        averageTimeSeconds: 52,
      },
      {
        id: "Q006",
        courseTitle: "Microfinance Basics",
        questionType: "Open-ended",
        difficulty: "Medium",
        attempts: 19,
        correctPercentage: 75,
        averageTimeSeconds: 79,
      },
    ],
    showingDocumentsCount: 6,
    totalDocumentsCount: 100,
    currentPage: 1,
    totalPages: 13,
  },
};

const formatSeconds = (seconds) => {
  const s = Number(seconds) || 0;
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}m ${rem}s`;
};

const AssignmentAnalysis = () => {
  const { instructorId } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = mockInstructorAssignmentAnalysisResponse;

      const rows = response.data.rows.map((report) => mapReportToRow(report));
      setTotalCount(response.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount:
          response.data.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.data.totalDocumentsCount || rows.length,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
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
          text: "Archive report",
          link: (row) => `/archiiveReport/${row.id}/archive`,
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

  const fetcher = () => async () => fetchReports();
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/instructorReport">Instructors</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Assignment Analysis</Link></BreadcrumbItem>}
        />
      </Box>
      <Box
        display={"flex"}
        justifyContent="space-between"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Avg. Question Success"
          value="82%"
          change="+5% vs last quarter"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Question Reliability"
          value="1.5"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Average Completion Time"
          value="82%"
          change="+5% vs last quarter"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Assessment Validity"
          value="High"
          change="Stable"
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
  return <Route {...rest} render={(props) => <AssignmentAnalysis {...props} />} />;
};

export default AssignmentAnalysis;
