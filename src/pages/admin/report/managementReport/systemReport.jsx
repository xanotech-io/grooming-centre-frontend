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
import { mockSystemReportsResponse } from "../../../../mocks/server/controllers/management-report/reponses";

dayjs.extend(relativeTime);

const SystemReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchSystemReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Mocking the full API response:
      const response = mockSystemReportsResponse;

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
      setError(err.message || "Unable to fetch system reports");
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
    user: report?.user,
    role: report?.role,
    loginWeekly: report?.loginWeekly,
    avgDuration: report?.avgDuration,
    device: report?.device,
    browserType: report?.browserType,
    lastLogin: report?.lastLogin,
  });

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "role",
        width: "150px",
        body: {
          checks: [
            { label: "Learner", queryValue: "Learner" },
            { label: "Admin", queryValue: "Admin" },
            { label: "Instructor", queryValue: "Instructor" },
          ],
        },
      },
    ],

    columns: [
      {
        id: "user",
        key: "user",
        text: "User",
        fraction: "200px",
      },
      {
        id: "role",
        key: "role",
        text: "Role",
        fraction: "150px",
      },
      {
        id: "loginWeekly",
        key: "loginWeekly",
        text: "Login (weekly)",
        fraction: "150px",
      },
      {
        id: "avgDuration",
        key: "avgDuration",
        text: "Avg. Duration (mins)",
        fraction: "180px",
      },
      {
        id: "device",
        key: "device",
        text: "Device",
        fraction: "120px",
      },
      {
        id: "browserType",
        key: "browserType",
        text: "Browser Type",
        fraction: "150px",
      },
      {
        id: "lastLogin",
        key: "lastLogin",
        text: "Last Login",
        fraction: "200px",
        formatter: (cell) => (
          <Box>
            <Text>{cell?.split(" ")[0]}</Text>
            <Text fontSize="xs" color="gray.500">
              {cell?.split(" ").slice(1).join(" ")}
            </Text>
          </Box>
        ),
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
    return await fetchSystemReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box
        display={"grid"}
        gridTemplateColumns="repeat(4, 1fr)"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Active Users"
          value="304"
          change="+5% vs last month"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Average Time per Session"
          value="40mins"
          change="+5% vs last session"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Mobile vs. Desktop Usage"
          value="82%"
          change="+5% vs last quarter"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="User Activity Growth Rate"
          value="82%"
          change="+5% vs last quarter"
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

export default SystemReport;