import { BreadcrumbItem } from "@chakra-ui/breadcrumb";
import { Box } from "@chakra-ui/layout";
import { Tag } from "@chakra-ui/tag";
import { Route, useParams } from "react-router-dom";
import { Breadcrumb, Link, Table, Text } from "../../../../../components";
import { useTableRows } from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import {
  adminDeleteMultipleCourses,
  adminGetUserCourseListing,
} from "../../../../../services";

const tableProps = {
  filterControls: [
    {
      triggerText: "All Courses",
      queryKey: "all-courses",
      width: "200px",
      position: "right-bottom",
      body: {
        radios: [
          {
            label: "Alphabetically: ascending",
            queryValue: "asc",
            additionalParams: { date: false },
          },
          {
            label: "Alphabetically: descending",
            queryValue: "desc",
            additionalParams: { date: false },
          },
          {
            label: "Date: ascending",
            queryValue: "asc",
            additionalParams: { date: true },
          },
          {
            label: "Date: descending",
            queryValue: "desc",
            additionalParams: { date: true },
          },
        ],
      },
    },
    {
      triggerText: "Completed",
      queryKey: "completed",
      width: "200px",
      position: "right-bottom",
      // noFilterTags: true,
      body: {
        radios: [
          {
            label: "Alphabetically: ascending",
            queryValue: "asc",
            additionalParams: { date: false },
          },
          {
            label: "Alphabetically: descending",
            queryValue: "desc",
            additionalParams: { date: false },
          },
          {
            label: "Date: ascending",
            queryValue: "asc",
            additionalParams: { date: true },
          },
          {
            label: "Date: descending",
            queryValue: "desc",
            additionalParams: { date: true },
          },
        ],
      },
    },
    {
      triggerText: "Ongoing",
      queryKey: "ongoing",
      width: "200px",
      position: "right-bottom",
      // noFilterTags: true,
      body: {
        radios: [
          {
            label: "Alphabetically: ascending",
            queryValue: "asc",
            additionalParams: { date: false },
          },
          {
            label: "Alphabetically: descending",
            queryValue: "desc",
            additionalParams: { date: false },
          },
          {
            label: "Date: ascending",
            queryValue: "asc",
            additionalParams: { date: true },
          },
          {
            label: "Date: descending",
            queryValue: "desc",
            additionalParams: { date: true },
          },
        ],
      },
    },
  ],

  columns: [
    {
      id: "2",
      key: "id",
      text: "Course ID",
      fraction: "6fr",
    },
    {
      id: "title",
      key: "title",
      text: "Course Title",
      fraction: "6fr",
    },
    {
      id: "4",
      key: "instructor",
      text: "Instructor",
      fraction: "4fr",
    },
    {
      id: "5",
      key: "status",
      text: "Status",
      fraction: "3fr",
      renderContent: (status) => (
        <Box>
          <Tag
            borderRadius="full"
            size="sm"
            backgroundColor={status < 100 ? "others.7" : "accent.4"}
            color={status < 100 ? "others.8" : "accent.5"}
          >
            <Text bold>{status === 100 ? "Completed" : "Ongoing"}</Text>
          </Tag>
        </Box>
      ),
    },
  ],

  options: {
    action: [
      {
        text: "View",
        link: (course) => `/admin/courses/details/${course.id}/info`,
      },
      {
        text: "Edit",
        link: (course) => `/admin/courses/edit/${course.id}`,
      },
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedCourses) => {
      console.log(selectedCourses);
      await adminDeleteMultipleCourses();
    },
    pagination: true,
  },
};

const CoursesPage = () => {
  const { id: userId } = useParams();

  const mapCourseToRow = (course) => ({
    id: course.id,
    title: course.title,
    instructor: course.instructor.name,
    status: course.status,
  });

  const fetcher = (props) => async () => {
    const { courses, showingDocumentsCount, totalDocumentsCount } =
      await adminGetUserCourseListing(userId, props?.params);

    const rows = courses.map(mapCourseToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/users">Users</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Courses</Link>
          </BreadcrumbItem>
        }
      />
      <Table
        {...tableProps}
        placeholder="Title, completed, ongoing courses"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

const CoursesPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <CoursesPage {...props} />} />;
};

export default CoursesPageRoute;
