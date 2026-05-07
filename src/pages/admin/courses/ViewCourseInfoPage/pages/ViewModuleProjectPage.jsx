import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex, Grid } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link, Spinner, Text } from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { getProjectById } from "../../../../../services";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const ViewModuleProjectPage = () => {
  const { courseId, moduleId, projectId } = useParams();
  const { push } = useHistory();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { project: data } = await getProjectById(projectId);
        setProject(data);
      } catch {
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

  const isPublished = project.status === "published";

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
        <Button
          onClick={() =>
            push(`/admin/courses/${courseId}/module/${moduleId}/projects/${projectId}/edit`)
          }
        >
          Edit Project
        </Button>
      </Flex>

      <Box backgroundColor="white" padding={8} borderRadius="md" boxShadow="sm">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Title
            </Text>
            <Text fontSize="text.level2">{project.title}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Status
            </Text>
            <Badge
              borderRadius="full"
              px="10px"
              py="2px"
              fontSize="11px"
              fontWeight="600"
              textTransform="capitalize"
              backgroundColor={isPublished ? "green.100" : "gray.100"}
              color={isPublished ? "green.700" : "gray.600"}
            >
              {project.status}
            </Badge>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Due Date
            </Text>
            <Text fontSize="text.level2">
              {project.dueDate ? dayjs(project.dueDate).format("MMM D, YYYY h:mm a") : "—"}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Max Grade
            </Text>
            <Text fontSize="text.level2">{project.maxGrade ?? "—"}</Text>
          </Box>

          {project.description && (
            <Box gridColumn={{ md: "1 / -1" }}>
              <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                Description
              </Text>
              <Text fontSize="text.level2" whiteSpace="pre-wrap">
                {project.description}
              </Text>
            </Box>
          )}

          {project.instructions && (
            <Box gridColumn={{ md: "1 / -1" }}>
              <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                Instructions
              </Text>
              <Text fontSize="text.level2" whiteSpace="pre-wrap">
                {project.instructions}
              </Text>
            </Box>
          )}

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Created At
            </Text>
            <Text fontSize="text.level2">
              {dayjs(project.createdAt).format("MMM D, YYYY h:mm a")}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Last Updated
            </Text>
            <Text fontSize="text.level2">
              {dayjs(project.updatedAt).format("MMM D, YYYY h:mm a")}
            </Text>
          </Box>
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
