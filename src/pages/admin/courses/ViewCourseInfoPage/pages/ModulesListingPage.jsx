import { Route, useParams } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem, useToast } from "@chakra-ui/react";
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
  adminDeleteModule,
  adminListModules,
  adminPublishModule,
  adminUnpublishModule,
} from "../../../../../services";
import { useTableRows } from "../../../../../hooks";

const getStatusBadge = (status) => {
  const isDraft = status === "draft";
  return (
    <Badge
      borderRadius="full"
      px="10px"
      py="2px"
      fontSize="11px"
      fontWeight="600"
      textTransform="capitalize"
      backgroundColor={isDraft ? "gray.100" : "green.100"}
      color={isDraft ? "gray.600" : "green.700"}
    >
      {status}
    </Badge>
  );
};

const ModulesListingPage = () => {
  const { id: courseId } = useParams();
  const toast = useToast();

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
        id: "order",
        key: "sequenceOrder",
        text: "#",
        fraction: "60px",
      },
      {
        id: "title",
        key: "title",
        text: "Module Title",
        fraction: "3fr",
        renderContent: (data) => (
          <Link
            href={`/admin/courses/${courseId}/modules/${data.moduleId}/edit`}
          >
            <Text>{data.text}</Text>
          </Link>
        ),
      },
      {
        id: "description",
        key: "description",
        text: "Description",
        fraction: "4fr",
      },
      {
        id: "status",
        key: "status",
        text: "Status",
        fraction: "120px",
        renderContent: (status) => <Box>{getStatusBadge(status)}</Box>,
      },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (module) =>
            `/admin/courses/${courseId}/modules/${module.id}/view`,
        },
        {
          text: "Lessons",
          link: (module) =>
            `/admin/courses/${courseId}/module/${module.id}/lessons`,
        },
        {
          text: "Assessments",
          link: (module) =>
            `/admin/courses/${courseId}/module/${module.id}/assessments`,
        },
        {
          text: "Examinations",
          link: (module) =>
            `/admin/courses/${courseId}/module/${module.id}/examinations`,
        },
        {
          text: "Projects",
          link: (module) =>
            `/admin/courses/${courseId}/module/${module.id}/projects`,
        },
        {
          text: "Progress",
          link: (module) =>
            `/admin/courses/${courseId}/module/${module.id}/progress`,
        },
        {
          text: "Edit",
          link: (module) =>
            `/admin/courses/${courseId}/modules/${module.id}/edit`,
        },
        {
          text: "Publish",
          onClick: async (module) => {
            try {
              const { message } = await adminPublishModule(module.id);
              toast({ title: message, status: "success", duration: 3000 });
              fetchRowItems();
            } catch (error) {
              toast({
                title:
                  error?.response?.data?.message || "Failed to publish module",
                status: "error",
                duration: 3000,
              });
            }
          },
        },
        {
          text: "Unpublish",
          onClick: async (module) => {
            try {
              const { message } = await adminUnpublishModule(module.id);
              toast({ title: message, status: "success", duration: 3000 });
              fetchRowItems();
            } catch (error) {
              toast({
                title:
                  error?.response?.data?.message ||
                  "Failed to unpublish module",
                status: "error",
                duration: 3000,
              });
            }
          },
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedModules) => {
        await adminDeleteModule(selectedModules[0]?.id);
      },
      pagination: false,
    },
  };

  const mapModuleToRow = (module) => ({
    id: module.id,
    courseId: module.courseId,
    sequenceOrder: module.sequenceOrder,
    title: {
      text: module.title,
      moduleId: module.id,
    },
    description: module.description,
    status: module.status,
  });

  const fetcher = () => async () => {
    const { modules } = await adminListModules(courseId);
    const rows = modules.map(mapModuleToRow);
    return { rows };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/courses">Courses</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Modules</Link>
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
          Modules
        </Heading>

        <Button link={`/admin/courses/${courseId}/modules/new/edit`}>
          Add Module
        </Button>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Module title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const ModulesListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ModulesListingPage {...props} />} />
  );
};

export default ModulesListingPageRoute;
