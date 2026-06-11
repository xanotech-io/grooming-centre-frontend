import { useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import { BreadcrumbItem, Tag, useToast } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Table,
  Text,
} from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../hooks";
import { getSystemUtilizationReport } from "../../../services";

const deviceColorMap = {
  Mobile: "blue",
  Desktop: "purple",
  Tablet: "orange",
};

const mapToRow = (item) => ({
  id: item.userId,
  userId: item.userId ?? "—",
  userName: item.userName ?? "—",
  email: item.email ?? "—",
  role: item.role ?? "—",
  loginsPerWeek: item.loginsPerWeek ?? 0,
  averageSessionDuration: item.averageSessionDuration ?? 0,
  deviceType: item.deviceType ?? "—",
  browserType: item.browserType ?? "—",
  lastLoginDate: item.lastLoginDate
    ? new Date(item.lastLoginDate).toLocaleDateString()
    : "—",
});

const SystemUtilizationReportPage = () => {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReport = async (params = {}) => {
    try {
      const result = await getSystemUtilizationReport(params);
      const reportData = result?.data ?? {};
      const rows = (reportData.data ?? []).map(mapToRow);
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 20;
      const totalDocumentsCount =
        reportData.totalCount ?? reportData.count ?? reportData.total ?? rows.length;

      setSummary(reportData.summary ?? null);
      setTotalCount(totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount: rows.length,
        totalDocumentsCount,
        currentPage: page,
        totalPages: Math.ceil(totalDocumentsCount / limit) || 1,
      };
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "Unable to fetch system utilization report",
        duration: 3000,
        isClosable: true,
      });
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Role",
        queryKey: "role",
        width: "180px",
        body: {
          checks: [
            { label: "Student", queryValue: "student" },
            { label: "Instructor", queryValue: "instructor" },
            { label: "Admin", queryValue: "admin" },
          ],
        },
      },
      {
        triggerText: "Device Type",
        queryKey: "deviceType",
        width: "180px",
        body: {
          checks: [
            { label: "Mobile", queryValue: "Mobile" },
            { label: "Desktop", queryValue: "Desktop" },
            { label: "Tablet", queryValue: "Tablet" },
          ],
        },
      },
      {
        triggerText: "Browser",
        queryKey: "browserType",
        width: "180px",
        body: {
          checks: [
            { label: "Chrome", queryValue: "Chrome" },
            { label: "Firefox", queryValue: "Firefox" },
            { label: "Safari", queryValue: "Safari" },
            { label: "Edge", queryValue: "Edge" },
          ],
        },
      },
      {
        triggerText: "Group By",
        queryKey: "groupBy",
        width: "160px",
        body: {
          checks: [
            { label: "Daily", queryValue: "daily" },
            { label: "Weekly", queryValue: "weekly" },
            { label: "Monthly", queryValue: "monthly" },
          ],
        },
      },
    ],
    options: {
      dateFilter: true,
      selection: false,
      pagination: true,
    },
    columns: [
      {
        id: "userName",
        key: "userName",
        text: "User Name",
        fraction: "180px",
        renderContent: (value) => (
          <Text fontWeight="600" fontSize="14px" color="#101828">
            {value}
          </Text>
        ),
      },
      {
        id: "email",
        key: "email",
        text: "Email",
        fraction: "210px",
      },
      {
        id: "role",
        key: "role",
        text: "Role",
        fraction: "120px",
        renderContent: (role) => (
          <Tag size="sm" borderRadius="full" colorScheme="purple">
            {role && role !== "—"
              ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
              : role}
          </Tag>
        ),
      },
      {
        id: "loginsPerWeek",
        key: "loginsPerWeek",
        text: "Logins / Week",
        fraction: "130px",
      },
      {
        id: "averageSessionDuration",
        key: "averageSessionDuration",
        text: "Avg. Session (min)",
        fraction: "160px",
      },
      {
        id: "deviceType",
        key: "deviceType",
        text: "Device",
        fraction: "120px",
        renderContent: (device) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={deviceColorMap[device] ?? "gray"}
          >
            {device}
          </Tag>
        ),
      },
      {
        id: "browserType",
        key: "browserType",
        text: "Browser",
        fraction: "110px",
      },
      {
        id: "lastLoginDate",
        key: "lastLoginDate",
        text: "Last Login",
        fraction: "120px",
      },
    ],
  };

  const fetcher = (props) => async () => fetchReport(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

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
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/system-utilization">
                System Utilization
              </Link>
            </BreadcrumbItem>
          }
        />
        <Button onClick={fetchRowItems}>Refresh Report</Button>
      </Box>

      <Flex
        justifyContent="space-between"
        flexDirection={{ lg: "row", base: "column", md: "column" }}
        alignItems={{ base: "flex-start", md: "flex-start" }}
        rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            System Utilization Report
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Platform-wide usage analytics including active users, session
            durations, and device/browser breakdowns
          </Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
        <DashboardMetricCard
          title="Active Users"
          value={`${summary?.activeUsers ?? 0}`}
          change="registered active users"
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="Avg. Session"
          value={`${summary?.averageSessionDuration ?? 0} min`}
          change="per user session"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Total Sessions"
          value={`${summary?.totalSessionsRecorded ?? 0}`}
          change="sessions recorded"
          changeColor="#2B6CB0"
        />
        <DashboardMetricCard
          title="Growth Rate"
          value={`${summary?.userActivityGrowthRate ?? 0}%`}
          change="user activity growth"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Mobile Usage"
          value={`${summary?.mobileUsagePercentage ?? 0}%`}
          change={`${summary?.desktopUsagePercentage ?? 0}% desktop · ${summary?.tabletUsagePercentage ?? 0}% tablet`}
          changeColor="#B7791F"
        />
      </SimpleGrid>

      <Table
        {...tableProps}
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
        placeholder="Search by user name or email..."
        totalCount={totalCount}
      />
    </AdminMainAreaWrapper>
  );
};

export const SystemUtilizationReportPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <SystemUtilizationReportPage {...props} />}
    />
  );
};

export default SystemUtilizationReportPage;
