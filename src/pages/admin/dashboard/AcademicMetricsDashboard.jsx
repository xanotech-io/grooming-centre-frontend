import { useCallback, useEffect } from "react";
import { Route } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/layout";
import {
  Button,
  DashboardMetricCard,
  Spinner,
  Table,
  Text,
} from "../../../components";
import { EmptyState } from "../../../layouts";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetchAndCache, useTableRows } from "../../../hooks";
import { adminGetAcademicDashboardMetrics } from "../../../services";

// ---------------------------------------------------------------------------
// Custom hook - top-level metrics
// ---------------------------------------------------------------------------

const useAcademicMetrics = () => {
  const { resource: metrics, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    return await adminGetAcademicDashboardMetrics();
  }, []);

  useEffect(() => {
    handleFetchResource({ cacheKey: "academicDashboardMetrics", fetcher });
  }, [handleFetchResource, fetcher]);

  return { metrics };
};

// ---------------------------------------------------------------------------
// Department table config
// ---------------------------------------------------------------------------

const TABLE_COLUMNS = [
  { id: "department", key: "department", text: "Department", fraction: "1fr" },
  {
    id: "enrollments",
    key: "enrollments",
    text: "Enrollments",
    fraction: "120px",
  },
  {
    id: "completionRate",
    key: "completionRate",
    text: "Completion Rate",
    fraction: "150px",
  },
  {
    id: "passRate",
    key: "passRate",
    text: "Pass Rate",
    fraction: "120px",
  },
  {
    id: "averageGPA",
    key: "averageGPA",
    text: "Avg GPA",
    fraction: "110px",
  },
  {
    id: "certificatesIssued",
    key: "certificatesIssued",
    text: "Certificates",
    fraction: "120px",
  },
];

const TABLE_OPTIONS = { action: [], selection: false, pagination: false };

const mapDeptToRow = (dept) => ({
  id: dept.department,
  department: dept.department,
  enrollments: dept.enrollments,
  completionRate: `${dept.completionRate}%`,
  passRate: `${dept.passRate}%`,
  averageGPA: dept.averageGPA?.toFixed(2),
  certificatesIssued: dept.certificatesIssued,
});

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const AcademicMetricsDashboard = () => {
  const { metrics } = useAcademicMetrics();
  const m = metrics.data?.metrics;

  const deptFetcher = useCallback(
    () => async () => {
      const result = await adminGetAcademicDashboardMetrics();
      const rows = (result.metrics?.byDepartment ?? []).map(mapDeptToRow);
      return {
        rows,
        showingDocumentsCount: rows.length,
        totalDocumentsCount: rows.length,
        currentPage: 1,
        totalPages: 1,
      };
    },
    []
  );

  const { rows, setRows, fetchRowItems } = useTableRows(deptFetcher);

  return (
    <AdminMainAreaWrapper>
      <Box my={4}>
        <Text fontSize="heading.h3" bold>
          Academic Metrics Dashboard
        </Text>
      </Box>

      {/* Primary metric cards */}
      <Box display="flex" justifyContent="space-between" gridGap={4} mb={6}>
        <DashboardMetricCard
          title="Total Enrollments"
          value={metrics.loading ? "..." : String(m?.totalEnrollments ?? "—")}
          change="all academic programmes"
          changeColor="#0083E2"
        />
        <DashboardMetricCard
          title="Active Students"
          value={metrics.loading ? "..." : String(m?.activeStudents ?? "—")}
          change="currently enrolled"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Completion Rate"
          value={
            metrics.loading ? "..." : `${m?.completionRate ?? "—"}%`
          }
          change="of enrolled students"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Pass Rate"
          value={metrics.loading ? "..." : `${m?.passRate ?? "—"}%`}
          change="of completions"
          changeColor="#1A8F3A"
        />
      </Box>

      {/* Secondary metric cards */}
      <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
        <DashboardMetricCard
          title="Average GPA"
          value={
            metrics.loading
              ? "..."
              : m?.averageGPA?.toFixed(2) ?? "—"
          }
          change="institution-wide"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Certificates Issued"
          value={
            metrics.loading ? "..." : String(m?.certificatesIssued ?? "—")
          }
          change="this academic year"
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="At-Risk Students"
          value={metrics.loading ? "..." : String(m?.atRiskStudents ?? "—")}
          change="require intervention"
          changeColor="#D97706"
        />
        <DashboardMetricCard
          title="Failing Students"
          value={metrics.loading ? "..." : String(m?.failingStudents ?? "—")}
          change="below passing threshold"
          changeColor="#E53E3E"
        />
      </Box>

      {/* Department breakdown */}
      <Box mb={4}>
        <Text fontSize="heading.h4" bold>
          Performance by Department
        </Text>
      </Box>

      {metrics.loading && !rows?.data?.rows?.length ? (
        <Flex
          h="300px"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" />
          <Text mt={4}>Loading metrics...</Text>
        </Flex>
      ) : metrics.err ? (
        <EmptyState
          heading="Failed to load academic metrics"
          description={metrics.err}
          cta={<Button onClick={fetchRowItems}>Try Again</Button>}
        />
      ) : (
        <Table
          columns={TABLE_COLUMNS}
          options={TABLE_OPTIONS}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          isLoading={metrics.loading}
          placeholder="Search by department"
          totalCount={m?.byDepartment?.length ?? 0}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const AcademicMetricsDashboardRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <AcademicMetricsDashboard {...props} />}
    />
  );
};

export default AcademicMetricsDashboard;
