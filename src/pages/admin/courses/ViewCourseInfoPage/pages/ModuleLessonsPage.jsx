import { Route, useParams } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
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
  auditTrailV2PostLog,
} from "../../../../../services";
import { useTableRows } from "../../../../../hooks";

const getStatusBadge = (approvalStatus) => {
  const map = {
    Approved: { bg: "green.100", color: "green.700" },
    Pending: { bg: "orange.100", color: "orange.700" },
    Rejected: { bg: "red.100", color: "red.700" },
  };
  const s = map[approvalStatus] || { bg: "gray.100", color: "gray.600" };
  return (
    <Badge
      borderRadius="full"
      px="10px"
      py="2px"
      fontSize="11px"
      fontWeight="600"
      textTransform="capitalize"
      backgroundColor={s.bg}
      color={s.color}
    >
      {approvalStatus}
    </Badge>
  );
};

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
        id: "fileType",
        key: "fileType",
        text: "File Type",
        fraction: "120px",
        renderContent: (fileType) => <Text>{fileType || "—"}</Text>,
      },
      {
        id: "uploadedBy",
        key: "uploadedBy",
        text: "Uploaded By",
        fraction: "160px",
        renderContent: (uploadedBy) => <Text>{uploadedBy || "—"}</Text>,
      },
      {
        id: "approvalStatus",
        key: "approvalStatus",
        text: "Status",
        fraction: "120px",
        renderContent: (approvalStatus) => <Box>{getStatusBadge(approvalStatus)}</Box>,
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
        const titles = selectedLessons.map((l) => l.title?.text).join(", ");
        try {
          await adminDeleteLesson(selectedLessons);
          auditTrailV2PostLog({
            eventType: "delete",
            module: "LMS",
            status: "success",
            resourceId: selectedLessons.map((l) => l.id).join(","),
            resourceType: "Lesson",
            remarks: `Deleted lesson(s) "${titles}"`,
          }).catch(() => {});
        } catch (error) {
          auditTrailV2PostLog({
            eventType: "delete",
            module: "LMS",
            status: "failure",
            resourceId: selectedLessons.map((l) => l.id).join(","),
            resourceType: "Lesson",
            remarks: error?.response?.data?.message || error.message || `Failed to delete lesson(s) "${titles}"`,
          }).catch(() => {});
          throw error;
        }
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
    fileType: lesson.fileType,
    uploadedBy: lesson.uploadedBy,
    approvalStatus: lesson.approvalStatus,
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
