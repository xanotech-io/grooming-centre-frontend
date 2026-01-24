
import { useState } from "react";
import { Button, Table, Text, Spinner } from "../../../components";
import { EmptyState } from "../../../layouts";
import { Flex,Box } from "@chakra-ui/layout";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../components";
import dayjs from "dayjs";
import { Avatar } from "@chakra-ui/avatar";
import { Tag } from "@chakra-ui/tag";
import { useTableRows } from "../../../hooks";
import { mockStudentReportsResponse } from "../../../mocks/server/controllers/student-report/reponses";

const ProgressReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchReports = async (params = {}) => {
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
        triggerText: "Status",
        queryKey: "status",
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
        text: "Module Completed",
        fraction: "150px",
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
          link: (row) => `/archiiveReport/${row.id}/archive`,
        },
      ],
      selection: true,
      pagination: true,
    },
  };
  const fetcher = (props) => async () => {
    return await fetchReports(props?.params);
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
            title="Completion Percentage"
            value="82%"
            change="+5% vs last month"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Average Assessment Score"
            value="82%"
            change="+5% vs last month"
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Average Time Spent"
            value="5h 32mins"
            change="per learner"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Weakly Activity Rate"
            value="4.2"
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
            <Text mt={4}>Loading student reports...</Text>
          </Flex>
        ) : error ? (
          <EmptyState
            heading="Failed to load student reports"
            description={error}
            cta={<Button onClick={fetchRowItems}>Try Again SCKKK</Button>}
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

export default ProgressReport;
