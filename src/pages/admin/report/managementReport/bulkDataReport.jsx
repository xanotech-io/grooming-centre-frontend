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
import { mockBulkDataReportsResponse } from "../../../../mocks/server/controllers/management-report/reponses";
import { FiDownload, FiUpload } from "react-icons/fi";

dayjs.extend(relativeTime);

const BulkDataReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchBulkReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Mocking the full API response:
      let response = mockBulkDataReportsResponse;

      // Filter by Date if params are present
      if (params.startDate && params.endDate) {
        const start = dayjs(params.startDate);
        const end = dayjs(params.endDate);

        const filteredRows = response.data.rows.filter(row => {
          // Assuming row.dateTime format needs parsing or is compatible
          // For mock data which is "26/11/2025 11:30am", we might need custom parsing
          // But for demonstration, we'll just log it. 
          // In a real app, this filtering would happen on the backend.
          return true;
        });

        console.log("Filtering by date:", start.format(), end.format());
      }


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
      setError(err.message || "Unable to fetch bulk data reports");
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
    operationMode: report?.operationMode,
    fileName: report?.fileName,
    dateTime: report?.dateTime,
    record: report?.record,
    successful: report?.successful,
    failed: report?.failed,
    user: report?.user,
    status: report?.status,
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
            { label: "Completed", queryValue: "Completed" },
            { label: "Failed", queryValue: "Failed" },
          ],
        },
      },
    ],

    columns: [
      {
        id: "operationMode",
        key: "operationMode",
        text: "Operation Mode",
        fraction: "200px",
        formatter: (cell) => {
          const isImport = cell === "Import";
          return (
            <Box display="flex" alignItems="center" gap="8px">
              <Box color={isImport ? "#1A8F3A" : "#1A8F3A"}>
                {isImport ? <FiDownload size={18} /> : <FiUpload size={18} />}
              </Box>
              <Text>{cell}</Text>
            </Box>
          )
        }
      },
      {
        id: "fileName",
        key: "fileName",
        text: "File Name",
        fraction: "200px",
      },
      {
        id: "dateTime",
        key: "dateTime",
        text: "Date and Time",
        fraction: "200px",
      },
      {
        id: "record",
        key: "record",
        text: "Record",
        fraction: "100px",
      },
      {
        id: "successful",
        key: "successful",
        text: "Successful",
        fraction: "100px",
      },
      {
        id: "failed",
        key: "failed",
        text: "Failed",
        fraction: "100px",
      },
      {
        id: "user",
        key: "user",
        text: "User",
        fraction: "150px",
      },
      {
        id: "status",
        key: "status",
        text: "Status",
        fraction: "150px",
        formatter: (cell) => {
          const bg = cell === "Completed" ? "#F6FEF9" : "#FFF4F3";
          const color = cell === "Completed" ? "#1A8F3A" : "#D92D20";
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
    ],

    options: {
      action: [
        {
          text: "Archive report",
          link: (row) => `/archiveReport/${row.id}`,
        },
      ],
      selection: false,
      pagination: true,
      dateFilter: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchBulkReports(props?.params);
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
          title="Data Import Success Rate (%)"
          value="79%"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Error Rate per Batch (%)"
          value="3%"
          change="-5% vs last period"
          changeColor="#D92D20"
        />

        <DashboardMetricCard
          title="Average Processing Time (seconds)"
          value="150secs"
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
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export default BulkDataReport;