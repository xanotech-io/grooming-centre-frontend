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
import {
    adminListModuleProjects,
    adminDeleteProject,
} from "../../../../../services";
import dayjs from "dayjs";
import { useTableRows } from "../../../../../hooks";

const getStatusBadge = (status) => {
    const colorMap = {
        published: "green",
        draft: "gray",
    };
    return (
        <Badge colorScheme={colorMap[status] || "gray"} textTransform="capitalize">
            {status}
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
                renderContent: (data) => (
                    <Link
                        href={`/admin/courses/${courseId}/module/${moduleId}/projects/view/${data.projectId}`}
                    >
                        <Text>{data.text}</Text>
                    </Link>
                ),
            },
            {
                id: "dueDate",
                key: "dueDate",
                text: "Due Date",
                fraction: "200px",
            },
            {
                id: "maxGrade",
                key: "maxGrade",
                text: "Max Grade",
                fraction: "120px",
            },
            {
                id: "status",
                key: "status",
                text: "Status",
                fraction: "120px",
                renderContent: (status) => getStatusBadge(status),
            },
        ],

        options: {
            action: [
                {
                    text: "View",
                    link: (project) =>
                        `/admin/courses/${courseId}/module/${moduleId}/projects/view/${project.id}`,
                },
                {
                    text: "Edit",
                    link: (project) =>
                        `/admin/courses/${courseId}/module/${moduleId}/projects/edit/${project.id}`,
                },
                {
                    isDelete: true,
                },
            ],
            selection: true,
            multipleDeleteFetcher: async (selectedProjects) => {
                await adminDeleteProject(selectedProjects[0]?.id);
            },
            pagination: false,
        },
    };

    const mapProjectToRow = (project) => ({
        id: project.id,
        title: { text: project.title, projectId: project.id },
        dueDate: project.dueDate
            ? dayjs(project.dueDate).format("DD/MM/YYYY h:mm a")
            : "—",
        maxGrade: project.maxGrade ?? "—",
        status: project.status,
    });

    const fetcher = () => async () => {
        const { projects } = await adminListModuleProjects(moduleId);
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
                    link={`/admin/courses/${courseId}/module/${moduleId}/projects/edit/new`}
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
