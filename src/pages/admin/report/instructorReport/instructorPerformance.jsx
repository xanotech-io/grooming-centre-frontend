import { Box, Flex } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
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
import { adminGetInstructorPerformanceReport } from "../../../../services";

const InstructorPerformance = () => {
  const { instructorId } = useParams();
<<<<<<< Updated upstream
=======
  const history = useHistory();
>>>>>>> Stashed changes
  const safeInstructorId =
    !instructorId || instructorId === "undefined" ? "inst_1" : instructorId;
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

<<<<<<< Updated upstream
=======
  useEffect(() => {
    if (!instructorId || instructorId === "undefined") {
      history.replace(`/admin/report/instructorReport/${safeInstructorId}/instructorPerformance`);
    }
  }, [history, instructorId, safeInstructorId]);

>>>>>>> Stashed changes
  const fetchInstructorPerformanceReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminGetInstructorPerformanceReport(
        safeInstructorId,
        params,
      );

<<<<<<< Updated upstream
      const rows = response.rows || [];
      setSummary(response.aggregateMetrics || null);
      setTotalCount(response.totalDocumentsCount || rows.length);
=======
      const rows = response.rows;
      setTotalCount(response.totalDocumentsCount);
>>>>>>> Stashed changes

      return {
        rows,
        showingDocumentsCount: response.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.totalDocumentsCount || rows.length,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch instructor performance");
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

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "department",
        width: "180px",
        body: {
          checks: [
            { label: "Computer Science", queryValue: "Computer Science" },
            { label: "Math", queryValue: "Math" },
            { label: "Science", queryValue: "Science" },
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
        id: "instructor",
        key: "instructor",
        text: "Instructor",
        fraction: "220px",
        renderContent: (value) => (
          <Box>
            <Text fontWeight="600" fontSize="14px" color="#101828">
              {value}
            </Text>
          </Box>
        ),
      },
      {
        id: "department",
        key: "department",
        text: "Department",
        fraction: "170px",
      },
      {
        id: "coursesDelivered",
        key: "coursesDelivered",
        text: "Courses Delivered",
        fraction: "170px",
      },
      {
        id: "completionRate",
        key: "completionRate",
        text: "Completion Rate (%)",
        fraction: "160px",
      },
      {
        id: "averageScore",
        key: "averageScore",
        text: "Average Score (%)",
        fraction: "160px",
      },
      {
        id: "feedbackRating",
        key: "feedbackRating",
        text: "Feedback Rating",
        fraction: "150px",
      },
      {
        id: "gradingTimelinessDays",
        key: "gradingTimelinessDays",
        text: "Grading Timeliness (Days)",
        fraction: "200px",
      },
    ],
  };

  const fetcher = (props) => async () => {
    return await fetchInstructorPerformanceReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/instructorReport">Instructors</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Instructor Performance</Link></BreadcrumbItem>}
        />
      </Box>
      <Box
        display={"flex"}
        justifyContent="space-between"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Learner Satisfaction Rating"
          value={`${summary?.averageStudentSatisfaction ?? 0}/5`}
          change={`${summary?.totalStudents ?? 0} learners`}
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Completion Rate"
          value={`${summary?.overallCompletionRate ?? 0}%`}
          change={`${summary?.totalCourses ?? 0} courses`}
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Average Student Performance"
          value={`${summary?.overallPassRate ?? 0}%`}
          change="overall pass rate"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Teaching Hours"
          value={`${summary?.totalTeachingHours ?? 0}`}
          change="evaluation period"
          changeColor="#6B006B"
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
          <Text mt={4}>Loading instructor performance...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load instructor performance"
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

export const InstructorPerformanceRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <InstructorPerformance {...props} />} />;
};

export default InstructorPerformance;
