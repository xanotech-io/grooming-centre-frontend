import { useCallback, useEffect } from "react";
import { Route } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/layout";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Link,
  Spinner,
  Text,
} from "../../../components";
import { EmptyState } from "../../../layouts";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetchAndCache } from "../../../hooks";
import { adminGetAcademicDashboardMetrics } from "../../../services";

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

const useAcademicDashboard = (params = {}) => {
  const { resource, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    return await adminGetAcademicDashboardMetrics(params);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleFetchResource({ cacheKey: "academicDashboardV2", fetcher });
  }, [handleFetchResource, fetcher]);

  return resource;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const AcademicMetricsDashboard = () => {
  const dashboard = useAcademicDashboard();
  const d = dashboard.data?.dashboard;
  const kpis = d?.kpis ?? {};
  const loading = dashboard.loading;

  const fmt = (val, suffix = "") =>
    loading ? "..." : val != null ? `${val}${suffix}` : "—";

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin">Dashboard</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Academic Metrics</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box my={4}>
        <Text fontSize="heading.h3" bold>
          Academic Metrics Dashboard
        </Text>
        {d?.lastUpdated && (
          <Text fontSize="sm" color="gray.500" mt={1}>
            Last updated: {new Date(d.lastUpdated).toLocaleString()}
          </Text>
        )}
      </Box>

      {dashboard.err ? (
        <EmptyState
          heading="Failed to load academic dashboard"
          description={dashboard.err}
          cta={
            <Button
              onClick={() =>
                dashboard.handleFetchResource?.({
                  cacheKey: "academicDashboardV2",
                })
              }
            >
              Try Again
            </Button>
          }
        />
      ) : loading ? (
        <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading academic dashboard...</Text>
        </Flex>
      ) : (
        <>
          {/* Row 1 */}
          <Box display="flex" justifyContent="space-between" gridGap={4} mb={4}>
            <DashboardMetricCard
              title="Total Courses"
              value={fmt(kpis.totalCourses)}
              change="active academic programmes"
              changeColor="#0083E2"
            />
            <DashboardMetricCard
              title="Enrollment Count"
              value={fmt(kpis.courseEnrollmentCount)}
              change="total course enrollments"
              changeColor="#0083E2"
            />
            <DashboardMetricCard
              title="Completion Rate"
              value={fmt(kpis.courseCompletionRate, "%")}
              change="learners completed / total enrolled"
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Average Score"
              value={fmt(kpis.averageScore, "%")}
              change="institution-wide average"
              changeColor="#1A8F3A"
            />
          </Box>

          {/* Row 2 */}
          <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
            <DashboardMetricCard
              title="Certificates Issued"
              value={fmt(kpis.certificateIssuedCount)}
              change="this academic year"
              changeColor="#6B006B"
            />
            <DashboardMetricCard
              title="Exam Attempts"
              value={fmt(kpis.examAttempts)}
              change="total exam sittings"
              changeColor="#0083E2"
            />
            <DashboardMetricCard
              title="Exam Pass Rate"
              value={fmt(kpis.examPassRate, "%")}
              change="passed exams / total attempts"
              changeColor="#1A8F3A"
            />
            <Box flex={1} />
          </Box>
        </>
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
