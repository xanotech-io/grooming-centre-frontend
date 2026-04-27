import { Route, useParams } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { BreadcrumbItem } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/tag";
import {
  Button,
  Heading,
  Table,
  Breadcrumb,
  Link,
  Text,
} from "../../../../../components";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import {
  adminDeleteLesson,
  adminGetModuleLessons,
} from "../../../../../services";
import { useTableRows } from "../../../../../hooks";

const ModuleLessonsPage = () => {
  const { courseId, moduleId } = useParams();

  const tableProps = {
    filterControls: [
      {
        triggerText: "Sort",
        queryKey: "sort",
        triggerIcon: <FaSortAmountUpAlt />,
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
        id: "status",
        key: "status",
        text: "Status",
        fraction: "120px",
        renderContent: (active) => (
          <Box>
            <Tag
              borderRadius="full"
              size="sm"
              backgroundColor={active ? "accent.4" : "accent.1"}
              color={active ? "accent.5" : "accent.3"}
            >
              <Text bold>{active ? "Active" : "Inactive"}</Text>
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
            `/admin/courses/${courseId}/lesson/${lesson.id}/view`,
        },
        {
          text: "Edit",
          link: (lesson) =>
            `/admin/courses/${courseId}/module/${moduleId}/lessons/edit/${lesson.id}`,
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedLessons) => {
        await adminDeleteLesson(selectedLessons);
      },
      pagination: false,
    },
  };

  const mapLessonToRow = (lesson) => ({
    id: lesson.id,
    courseId: lesson.courseId,
    title: {
      text: lesson.title,
      lessonId: lesson.id,
      courseId: lesson.courseId,
    },
    status: lesson.active,
  });

  const fetcher = () => async () => {
    const { lessons } = await adminGetModuleLessons(moduleId);
    const rows = lessons.map(mapLessonToRow);
    return { rows };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem>
            <Link href="/admin/courses">Courses</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem>
            <Link href={`/admin/courses/details/${courseId}/modules`}>
              Modules
            </Link>
          </BreadcrumbItem>
        }
        item4={
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

        <Button
          link={`/admin/courses/${courseId}/module/${moduleId}/lessons/edit/new`}
        >
          Add Lesson
        </Button>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Lesson title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const ModuleLessonsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ModuleLessonsPage {...props} />} />
  );
};

export default ModuleLessonsPageRoute;
