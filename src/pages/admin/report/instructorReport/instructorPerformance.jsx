import { Box, Flex } from "@chakra-ui/layout";
import { useState } from "react";
import { Route, useParams } from "react-router-dom";
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

const mockInstructorPerformanceResponse = {
  data: {
    rows: [
      {
        id: "ip-1",
        instructor: "J. Smith",
        department: "Computer Science",
        coursesDelivered: 5,
        completionRate: "66%",
        averageScore: "65%",
        feedbackRating: "4.7/5",
        gradingTimelinessDays: 3,
      },
      {
        id: "ip-2",
        instructor: "K. Abens",
        department: "Computer Science",
        coursesDelivered: 5,
        completionRate: "93%",
        averageScore: "95%",
        feedbackRating: "4.3/5",
        gradingTimelinessDays: 1,
      },
      {
        id: "ip-3",
        instructor: "M. Smith",
        department: "Math",
        coursesDelivered: 5,
        completionRate: "61%",
        averageScore: "61%",
        feedbackRating: "4.1/5",
        gradingTimelinessDays: 2,
      },
      {
        id: "ip-4",
        instructor: "K. Adeyemi",
        department: "Computer Science",
        coursesDelivered: 5,
        completionRate: "52%",
        averageScore: "52%",
        feedbackRating: "4.7/5",
        gradingTimelinessDays: 4,
      },
      {
        id: "ip-5",
        instructor: "I. Smith",
        department: "Science",
        coursesDelivered: 5,
        completionRate: "78%",
        averageScore: "75%",
        feedbackRating: "4.0/5",
        gradingTimelinessDays: 5,
      },
    ],
    showingDocumentsCount: 5,
    totalDocumentsCount: 100,
    currentPage: 1,
    totalPages: 13,
  },
};

const InstructorPerformance = () => {
  const { instructorId } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchInstructorPerformanceReports = async () => {
    setLoading(true);
    setError(null);

    try {
      // UI built with mock for now. Plug in real endpoint later.
      const response = mockInstructorPerformanceResponse;

      const rows = response.data.rows;
      setTotalCount(response.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount:
          response.data.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.data.totalDocumentsCount || rows.length,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
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
          value="82%"
          change="+5% vs last quarter"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Completion Rate"
          value="79%"
          change="+5% vs last quarter"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Average Student Performance"
          value="82%"
          change="+5% vs last quarter"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Feedback Score Trend"
          value="4.8/5"
          change="quarterly"
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
