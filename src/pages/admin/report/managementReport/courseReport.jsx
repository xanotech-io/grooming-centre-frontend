import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Box, Flex } from "@chakra-ui/layout";
import { useState } from "react";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
} from "../../../../components";
import { EmptyState } from "../../../../layouts";
import dayjs from "dayjs";
import { useTableRows } from "../../../../hooks";
import relativeTime from "dayjs/plugin/relativeTime";
import { mockCourseRoasterReportsResponse } from "../../../../mocks/server/controllers/management-report/reponses";

dayjs.extend(relativeTime);

const CourseRoasterReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchRoasterReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Mocking the full API response:
      const response = mockCourseRoasterReportsResponse;

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
      setError(err.message || "Unable to fetch course roaster reports");
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
    studentName: report?.studentName,
    email: report?.email,
    course: report?.course,
    enrollmentDate: report?.enrollmentDate,
    status: report?.status,
    attendance: report?.attendance,
    score: report?.score,
  });

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "status",
        width: "150px",
        body: {
          checks: [
            { label: "Active", queryValue: "Active" },
            { label: "Completed", queryValue: "Completed" },
          ],
        },
      },
    ],

    columns: [
      {
        id: "studentName",
        key: "studentName",
        text: "Student ID",
        fraction: "250px",
        formatter: (cell, row) => {
          return (
            <Box>
              <Text fontWeight="600" fontSize="14px" color="#101828">{row?.studentName}</Text>
              <Text fontWeight="400" fontSize="12px" color="#667085">{row?.id}</Text>
            </Box>
          );
        },
      },
      {
        id: "email",
        key: "email",
        text: "Email address",
        fraction: "200px",
      },
      {
        id: "course",
        key: "course",
        text: "Course",
        fraction: "200px",
      },
      {
        id: "enrollmentDate",
        key: "enrollmentDate",
        text: "Enrollment Date",
        fraction: "150px",
      },
      {
        id: "status",
        key: "status",
        text: "Status",
        fraction: "150px",
        formatter: (cell) => {
          const bg = cell === "Active" ? "#FFF9F0" : "#F6FEF9";
          const color = cell === "Active" ? "#F79009" : "#1A8F3A";
          return (
            <Box
              bg={bg}
              color={color}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="500"
              textAlign="center"
              width="fit-content"
            >
              {cell}
            </Box>
          );
        },
      },
      {
        id: "attendance",
        key: "attendance",
        text: "Attendance",
        fraction: "120px",
      },
      {
        id: "score",
        key: "score",
        text: "Score",
        fraction: "100px",
      },
    ],

    options: {
      action: [
        {
          text: "Archive report",
          link: (row) => `/archiveReport/${row.id}`,
        },
      ],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchRoasterReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box
        display={"flex"}
        justifyContent="space-between"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Enrollment-to-Completion Ratio"
          value="79%"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Active Enrollment Count"
          value="16:40"
          change="-5% vs last period"
          changeColor="#D92D20"
        />

        <DashboardMetricCard
          title="Average Attendance Rate"
          value="5%"
          change="+5% vs last period"
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
          <Text mt={4}>Loading reports...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load reports"
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

export default CourseRoasterReport;
