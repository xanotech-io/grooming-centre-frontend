import { useState, useRef } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import {
  BreadcrumbItem,
  Tag,
  useToast,
  Select,
  Collapse,
  Text as ChakraText,
  Input,
} from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Table,
  Text,
  ExportMenu,
} from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../hooks";
import { getSystemUtilizationReport } from "../../../services";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";

const deviceColorMap = {
  Mobile: "blue",
  Desktop: "purple",
  Tablet: "orange",
};

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "Admin" },
];

const GROUP_BY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ role: "", groupBy: "", startDate: "", endDate: "" });
  const appliedFiltersRef = useRef({ role: "", groupBy: "", startDate: "", endDate: "" });

  const applyFilters = () => {
    appliedFiltersRef.current = { ...filters };
  };

  const resetFilters = () => {
    const empty = { role: "", groupBy: "", startDate: "", endDate: "" };
    setFilters(empty);
    appliedFiltersRef.current = empty;
    setFilterOpen(false);
    fetchRowItems();
  };

  const fetchReport = async (params = {}) => {
    try {
      const { role, groupBy, startDate, endDate } = appliedFiltersRef.current;
      const mergedParams = {
        ...params,
        ...(role ? { role } : {}),
        ...(groupBy ? { groupBy } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      };
      const result = await getSystemUtilizationReport(mergedParams);
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

  const fetcher = (props) => async () => fetchReport(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const exportRows = [
    [
      "User Name",
      "Email",
      "Role",
      "Logins / Week",
      "Avg. Session (min)",
      "Device",
      "Browser",
      "Last Login",
    ],
    ...rows.map((r) => [
      r.userName,
      r.email,
      r.role,
      r.loginsPerWeek,
      r.averageSessionDuration,
      r.deviceType,
      r.browserType,
      r.lastLoginDate,
    ]),
  ];

  const activeFilterCount = Object.values(appliedFiltersRef.current).filter(Boolean).length;

  const filterTrigger = (
    <Box
      as="button"
      onClick={() => setFilterOpen((v) => !v)}
      display="inline-flex"
      alignItems="center"
      gap={2}
      px={3}
      h="34px"
      border="1px solid #D0D5DD"
      borderRadius="md"
      bg="white"
      fontSize="13px"
      fontWeight="500"
      color="#344054"
      cursor="pointer"
      _hover={{ bg: "#F9FAFB" }}
      transition="background 0.15s"
      flexShrink={0}
    >
      <FiFilter size={14} />
      Filter
      {activeFilterCount > 0 && (
        <Box
          as="span"
          bg="#660066"
          color="white"
          borderRadius="full"
          fontSize="11px"
          fontWeight="600"
          px={1.5}
          py={0}
          lineHeight="18px"
          minW="18px"
          textAlign="center"
        >
          {activeFilterCount}
        </Box>
      )}
      {filterOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
    </Box>
  );

  const filterPanel = (
    <Collapse in={filterOpen} animateOpacity style={{ overflow: "visible" }}>
      <Box
        mt={2}
        p={4}
        bg="#FAFAFA"
        border="1px solid #E4E7EC"
        borderRadius="lg"
        overflow="visible"
      >
        <Flex gap={3} flexWrap="wrap" align="flex-end">
          <Box minW="160px">
            <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>
              Role
            </ChakraText>
            <Select
              size="sm"
              borderRadius="md"
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              placeholder="All Roles"
              bg="white"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Box>

          <Box minW="160px">
            <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>
              Group By
            </ChakraText>
            <Select
              size="sm"
              borderRadius="md"
              value={filters.groupBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, groupBy: e.target.value }))}
              placeholder="All Periods"
              bg="white"
            >
              {GROUP_BY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Box>

          <Box minW="150px">
            <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>
              Start Date
            </ChakraText>
            <Input
              size="sm"
              borderRadius="md"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              bg="white"
            />
          </Box>

          <Box minW="150px">
            <ChakraText fontSize="12px" fontWeight="500" color="#667085" mb={1}>
              End Date
            </ChakraText>
            <Input
              size="sm"
              borderRadius="md"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              bg="white"
            />
          </Box>

          <Flex gap={2} mb="1px">
            <Button
              onClick={() => {
                applyFilters();
                setFilterOpen(false);
                fetchRowItems();
              }}
              style={{ height: "32px", fontSize: "13px" }}
            >
              Apply
            </Button>
            <Button secondary onClick={resetFilters} style={{ height: "32px", fontSize: "13px" }}>
              Reset
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Collapse>
  );

  const tableProps = {
    searchKey: "search",
    options: {
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
        {rows.length > 0 && (
          <ExportMenu
            rows={exportRows}
            filename="system-utilization-report"
            title="System Utilization Report"
          />
        )}
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
        headerExtra={filterTrigger}
        belowHeader={filterPanel}
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
