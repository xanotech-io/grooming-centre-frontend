import { useState } from "react";
import { Box, Flex } from "@chakra-ui/layout";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
} from "../../../../components";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTableRows } from "../../../../hooks";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { mockStudentReportsResponse } from "../../../../mocks/server/controllers/student-report/reponses";

dayjs.extend(relativeTime);
const AssessmentReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchAssessmentReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Mocking the full API response:
      const response = mockStudentReportsResponse;

      const rows =
        response.data.rows?.map((report) => mapReportToRow(report)) || [];

      setTotalCount(response.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount:
          response.data.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.data.totalDocumentsCount || 0,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch student reports");
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
    studentId: report?.studentId,
    studentName: report?.studentName,
    courseTitle: report?.courseTitle,
    enrollmentDate: report?.enrollmentDate,
    modulesCompleted: report?.modulesCompleted,
    score: report?.score,
    status: report?.status,
    certificate: report?.certificate,
    lastAccess: report?.lastAccess,
  });

  // Setup Table
  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "status",
        width: "150px",
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
      {
        id: "assessmentTitle",
        key: "assessmentTitle",
        text: "Assessment Title",
        fraction: "200px",
      },
      {
        id: "date",
        key: "date",
        text: "Date",
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
      {
        id: "score",
        key: "score",
        text: "Score (%)",
        fraction: "150px",
      },

      {
        id: "grade",
        key: "grade",
        text: "Grade",
        fraction: "150px",
      },

      {
        id: "result",
        key: "result",
        text: "Result",
        fraction: "150px",
      },

      {
        id: "duration",
        key: "duration",
        text: "Duration",
        fraction: "150px",
      },

      {
        id: "remarks",
        key: "remarks",
        text: "Remarks",
        fraction: "130px",
      },
    ],

    options: {
      action: [
        {
          text: "Archive Report",
          link: (row) => `/archiiveReport/${row.id}/archive`,
        },
      ],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchAssessmentReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
      <AdminMainAreaWrapper>
        <Box
          display={"flex"}
          // width={'100%'}
          justifyContent="space-between"
          gridGap={4}
          mb={10}
        >
          <DashboardMetricCard
            title="Average Assessment Score"
            value="82%"
            change="+5% vs last month"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Highest vs. Lowest Score"
            value="95% / 45%"
            change="per course"
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Pass Rate"
            value="82%"
            change="+5% vs last period"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Question Difficulty Impact"
            value="Medium"
            change=""
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
            <Text mt={4}>Loading student reports...</Text>
          </Flex>
        ) : error ? (
          <EmptyState
            heading="Failed to load student reports"
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
          />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export default AssessmentReport;
