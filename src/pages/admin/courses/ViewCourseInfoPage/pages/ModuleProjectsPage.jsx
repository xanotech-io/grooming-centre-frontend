import { Route, useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/layout";
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
import { getModuleProjects, deleteProject } from "../../../../../services";
import dayjs from "dayjs";
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

const ModuleProjectsPage = () => {
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
            {
              label: "Due Date: ascending",
              queryValue: "asc",
              additionalParams: { date: true },
            },
            {
              label: "Due Date: descending",
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
        text: "Project Title",
        fraction: "3fr",
      },
      {
        id: "description",
        key: "description",
        text: "Description",
        fraction: "3fr",
      },
      {
        id: "dueDate",
        key: "dueDate",
        text: "Due Date",
        fraction: "150px",
        renderContent: (date) => (
          <Text>{date ? dayjs(date).format("MMM D, YYYY") : "—"}</Text>
        ),
      },
      {
        id: "maxGrade",
        key: "maxGrade",
        text: "Max Grade",
        fraction: "100px",
      },
      {
        id: "approvalStatus",
        key: "approvalStatus",
        text: "Status",
        fraction: "120px",
        renderContent: (approvalStatus) => getStatusBadge(approvalStatus),
      },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (project) =>
            `/admin/courses/${courseId}/module/${moduleId}/projects/${project.id}/view`,
        },
        {
          text: "Submissions",
          link: (project) =>
            `/admin/courses/${courseId}/module/${moduleId}/projects/${project.id}/submissions`,
        },
        {
          text: "Edit",
          link: (project) =>
            `/admin/courses/${courseId}/module/${moduleId}/projects/${project.id}/edit`,
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedProjects) => {
        await deleteProject(selectedProjects[0]?.id);
      },
      pagination: false,
    },
  };

  const mapProjectToRow = (project) => ({
    id: project.id,
    title: project.title,
    description: project.description || "—",
    dueDate: project.dueDate,
    maxGrade: project.maxGrade ?? "—",
    approvalStatus: project.approvalStatus,
  });

  const fetcher = () => async () => {
    const { projects } = await getModuleProjects(moduleId);
    const rows = projects.map(mapProjectToRow);
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
            <Link href="#">Projects</Link>
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
          Projects
        </Heading>

        <Button
          link={`/admin/courses/${courseId}/module/${moduleId}/projects/new`}
        >
          Add Project
        </Button>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Project title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const ModuleProjectsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ModuleProjectsPage {...props} />} />
  );
};

export default ModuleProjectsPageRoute;
