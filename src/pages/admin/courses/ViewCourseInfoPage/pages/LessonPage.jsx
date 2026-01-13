import { Route, useParams } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  Button,
  Heading,
  Table,
  Text,
  Breadcrumb,
  Link,
} from "../../../../../components";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import {
  adminDeleteLesson,
  adminDeleteMultipleCourses,
  adminGetLessonListing,
} from "../../../../../services";
import { Tag } from "@chakra-ui/tag";
import dayjs from "dayjs";
import { useTableRows } from "../../../../../hooks";
import { useApp } from "../../../../../contexts";

const LessonPage = () => {
  const appManager = useApp();

  const departmentName = appManager.state.metadata?.departments.map(
    (department) => department.name
  );

  const tableProps = {
    filterControls: [
      {
        triggerText: "Department",
        queryKey: "department",
        width: "125%",
        body: {
          checks: [
            ...(departmentName?.map((name) => ({
              label: name,
              queryValue: name,
            })) || []),
          ],
        },
      },
      {
        triggerText: "Sort",
        queryKey: "sort",
        triggerIcon: <FaSortAmountUpAlt />,
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
        id: "title",
        key: "title",
        text: "Lesson Title",
        fraction: "5fr",
        renderContent: (data) => (
          <Link
            href={`/admin/courses/${data.courseId}/lesson/${data.lessonId}/view`}
          >
            <Text>{data.text}</Text>
          </Link>
        ),
      },
      {
        id: "4",
        key: "startDate",
        text: "Start Date",
        fraction: "200px",
      },
      {
        id: "5",
        key: "status",
        text: "Status",
        fraction: "100px",
        renderContent: (status) => (
          <Box>
            <Tag
              borderRadius="full"
              size="sm"
              backgroundColor={status ? "accent.4" : "accent.1"}
              color={status ? "accent.5" : "accent.3"}
            >
              <Text bold>{status ? "Active" : "Inactive"}</Text>
            </Tag>
          </Box>
        ),
      },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (lesson) =>
            `/admin/courses/${lesson.courseId}/lesson/${lesson.id}/view`,
        },
        {
          text: "Edit",
          link: (lesson) =>
            `/admin/courses/${lesson.courseId}/lessons/edit/${lesson.id}`,
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedDepartments) => {
        let format = [];
        format.push(selectedDepartments.map((datum) => datum.id));

        await adminDeleteLesson(selectedDepartments);
      },
      pagination: true,
    },
  };

  const { id: courseId } = useParams();

  const mapLessonToRow = (lesson) => ({
    id: lesson.id,
    courseId: lesson.courseId,
    title: {
      text: lesson.title,
      lessonId: lesson.id,
      courseId: lesson.courseId,
    },
    startDate: dayjs(lesson.startTime).format("DD/MM/YYYY h:mm a"),
    status: lesson.active,
  });

  const fetcher = (props) => async () => {
    const { lessons, showingDocumentsCount, totalDocumentsCount } =
      await adminGetLessonListing(courseId, props?.params);

    const rows = lessons.map(mapLessonToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/courses">Courses </Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Lessons</Link>
          </BreadcrumbItem>
        }
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Lessons
        </Heading>

        <Button link={`/admin/courses/${courseId}/lessons/edit/new`}>
          Add Lesson
        </Button>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Title, department"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const LessonPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <LessonPage {...props} />} />;
};

export default LessonPageRoute;
