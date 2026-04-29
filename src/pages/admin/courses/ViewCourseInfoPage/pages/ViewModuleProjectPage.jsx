import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import {
    Breadcrumb,
    Heading,
    Link,
    Spinner,
    Text,
    Button,
} from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { adminGetProject } from "../../../../../services";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const getStatusColors = (status) =>
    status === "published" ? "green" : "gray";

const ViewModuleProjectPage = () => {
    const { courseId, moduleId, projectId } = useParams();
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const { project: data } = await adminGetProject(projectId);
                setProject(data);
            } catch (err) {
                setError("Failed to load project details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" paddingTop="100px">
                <Spinner />
            </Box>
        );
    }

    if (error) {
        return (
            <AdminMainAreaWrapper>
                <Box paddingY={10} paddingX={6}>
                    <Text color="red.500">{error}</Text>
                </Box>
            </AdminMainAreaWrapper>
        );
    }

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
                    <BreadcrumbItem>
                        <Link href={`/admin/courses/${courseId}/module/${moduleId}/projects`}>
                            Projects
                        </Link>
                    </BreadcrumbItem>
                }
                item5={
                    <BreadcrumbItem isCurrentPage>
                        <Link href="#">{project.title}</Link>
                    </BreadcrumbItem>
                }
            />

            <Flex
                justifyContent="space-between"
                alignItems="center"
                borderBottom="1px"
                borderColor="accent.2"
                paddingBottom={5}
                marginBottom={8}
            >
                <Heading as="h1" fontSize="heading.h3">
                    {project.title}
                </Heading>
                <Flex gap={3} alignItems="center">
                    <Badge
                        colorScheme={getStatusColors(project.status)}
                        fontSize="text.level2"
                        paddingX={3}
                        paddingY={1}
                        textTransform="capitalize"
                    >
                        {project.status}
                    </Badge>
                    <Button
                        link={`/admin/courses/${courseId}/module/${moduleId}/projects/edit/${project.id}`}
                        secondary
                    >
                        Edit Project
                    </Button>
                </Flex>
            </Flex>

            <Box backgroundColor="white" padding={8} borderRadius="md" boxShadow="sm">
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
                    <Box gridColumn={{ md: "1 / -1" }}>
                        <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                            Description
                        </Text>
                        <Text fontSize="text.level2">{project.description || "—"}</Text>
                    </Box>

                    <Box gridColumn={{ md: "1 / -1" }}>
                        <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                            Instructions
                        </Text>
                        <Box
                            fontSize="text.level2"
                            whiteSpace="pre-wrap"
                            backgroundColor="gray.50"
                            padding={4}
                            borderRadius="md"
                        >
                            {project.instructions || "—"}
                        </Box>
                    </Box>

                    <Box>
                        <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                            Due Date
                        </Text>
                        <Text fontSize="text.level2">
                            {project.dueDate
                                ? dayjs(project.dueDate).format("DD/MM/YYYY h:mm a")
                                : "—"}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                            Max Grade
                        </Text>
                        <Text fontSize="text.level2">{project.maxGrade ?? "—"}</Text>
                    </Box>

                    <Box>
                        <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                            Status
                        </Text>
                        <Badge
                            colorScheme={getStatusColors(project.status)}
                            textTransform="capitalize"
                        >
                            {project.status}
                        </Badge>
                    </Box>

                    {project.createdAt && (
                        <Box>
                            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                                Created At
                            </Text>
                            <Text fontSize="text.level2">
                                {dayjs(project.createdAt).format("DD/MM/YYYY h:mm a")}
                            </Text>
                        </Box>
                    )}
                </Grid>
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const ViewModuleProjectPageRoute = ({ ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => <ViewModuleProjectPage {...props} />}
        />
    );
};

export default ViewModuleProjectPageRoute;
