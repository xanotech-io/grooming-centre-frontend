import { useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  Heading,
  Link,
  Table,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { EmptyState } from "../../../../layouts";
import { useTableRows } from "../../../../hooks";
import { adminListCoursesForReport } from "../../../../services";

const CourseAssessmentPickerPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCourses = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminListCoursesForReport(params);
      setTotalCount(result.totalDocumentsCount);
      return {
        rows: result.rows,
        showingDocumentsCount: result.showingDocumentsCount,
        totalDocumentsCount: result.totalDocumentsCount,
        currentPage: Number(params.page) || 1,
        totalPages:
          Math.ceil(result.totalDocumentsCount / (Number(params.limit) || 10)) || 1,
      };
    } catch (err) {
      const message = err.message || "Unable to fetch courses";
      setError(message);
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
    filterControls: [],
    columns: [
      {
        id: "title",
        key: "title",
        text: "Course Title",
        fraction: "1fr",
        renderContent: (value) => (
          <Text fontWeight="600" fontSize="14px" color="#101828">
            {value}
          </Text>
        ),
      },
      {
        id: "instructorName",
        key: "instructorName",
        text: "Instructor",
        fraction: "200px",
      },
      {
        id: "isPublished",
        key: "isPublished",
        text: "Status",
        fraction: "120px",
      },
    ],
    options: {
      action: [
        {
          text: "View Assessment Report",
          link: (row) => `/admin/report/course-assessment/${row.id}`,
        },
      ],
      selection: false,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => fetchCourses(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/course-assessment">Course Assessment Report</Link>
            </BreadcrumbItem>
          }
        />
        <Button onClick={fetchRowItems} secondary>
          Refresh
        </Button>
      </Box>

      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        rowGap={3}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            Course Assessment Report
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Select a course to view all student assessment results and performance KPIs.
          </Text>
        </Box>
      </Flex>

      {error && !rows?.length ? (
        <EmptyState
          heading="Failed to load courses"
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
          placeholder="Search by course title..."
          totalCount={totalCount}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const CourseAssessmentPickerPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CourseAssessmentPickerPage {...props} />} />
  );
};

export default CourseAssessmentPickerPage;
