import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link, Spinner, Text } from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { getProjectById, getProjectSubmissions } from "../../../../../services";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import Icon from "@chakra-ui/icon";

const statusScheme = {
  submitted: "blue",
  reviewed: "green",
};

const ProjectSubmissionsPage = () => {
  const { courseId, moduleId, projectId } = useParams();
  const { push } = useHistory();

  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ project: p }, { submissions: subs }] = await Promise.all([
          getProjectById(projectId),
          getProjectSubmissions(projectId),
        ]);
        setProject(p);
        setSubmissions(subs);
      } catch {
        setError("Failed to load submissions.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
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
        item2={<BreadcrumbItem><Link href="/admin/courses">Courses</Link></BreadcrumbItem>}
        item3={<BreadcrumbItem><Link href={`/admin/courses/details/${courseId}/modules`}>Modules</Link></BreadcrumbItem>}
        item4={<BreadcrumbItem><Link href={`/admin/courses/${courseId}/module/${moduleId}/projects`}>Projects</Link></BreadcrumbItem>}
        item5={<BreadcrumbItem><Link href={`/admin/courses/${courseId}/module/${moduleId}/projects/${projectId}/view`}>{project?.title}</Link></BreadcrumbItem>}
        item6={<BreadcrumbItem isCurrentPage><Link href="#">Submissions</Link></BreadcrumbItem>}
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            Submissions
          </Heading>
          <Text as="level5" color="gray.500" mt={1}>
            {project?.title}
          </Text>
        </Box>
        <Badge colorScheme="blue" fontSize="13px" px={3} py={1}>
          {submissions.length} {submissions.length === 1 ? "Submission" : "Submissions"}
        </Badge>
      </Flex>

      {submissions.length === 0 ? (
        <Box
          py={16}
          textAlign="center"
          backgroundColor="white"
          borderRadius="md"
          border="1px"
          borderColor="gray.200"
        >
          <Text color="gray.400">No submissions yet for this project.</Text>
        </Box>
      ) : (
        <Box backgroundColor="white" borderRadius="md" border="1px" borderColor="gray.200" overflow="hidden">
          {/* Table header */}
          <Flex
            px={6}
            py={3}
            backgroundColor="gray.50"
            borderBottom="1px"
            borderColor="gray.200"
          >
            <Text bold color="gray.500" fontSize="sm" flex={2}>Student ID</Text>
            <Text bold color="gray.500" fontSize="sm" flex={2}>Submitted At</Text>
            <Text bold color="gray.500" fontSize="sm" flex={1}>Status</Text>
            <Text bold color="gray.500" fontSize="sm" flex={1}>File</Text>
            <Text bold color="gray.500" fontSize="sm" width="120px" textAlign="right">Actions</Text>
          </Flex>

          {submissions.map((sub) => (
            <Flex
              key={sub.id}
              px={6}
              py={4}
              borderBottom="1px"
              borderColor="gray.100"
              alignItems="center"
              _hover={{ backgroundColor: "gray.50" }}
            >
              <Text flex={2} fontSize="sm" color="gray.700" isTruncated>
                {sub.userId}
              </Text>
              <Text flex={2} fontSize="sm" color="gray.600">
                {dayjs(sub.submittedAt).format("MMM D, YYYY · h:mm A")}
              </Text>
              <Box flex={1}>
                <Badge
                  colorScheme={statusScheme[sub.status] || "gray"}
                  fontSize="10px"
                  textTransform="capitalize"
                  px={2}
                  py="2px"
                  borderRadius="full"
                >
                  {sub.status}
                </Badge>
              </Box>
              <Box flex={1}>
                {sub.submissionUrl ? (
                  <Box
                    as="a"
                    href={sub.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary.base"
                    fontSize="sm"
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                    _hover={{ textDecoration: "underline" }}
                  >
                    View file
                    <Icon fontSize="11px"><FaExternalLinkAlt /></Icon>
                  </Box>
                ) : (
                  <Text fontSize="sm" color="gray.400">—</Text>
                )}
              </Box>
              <Box width="120px" textAlign="right">
                <Button
                  sm
                  onClick={() =>
                    push(
                      `/admin/courses/${courseId}/module/${moduleId}/projects/${projectId}/submissions/${sub.id}`
                    )
                  }
                >
                  {sub.status === "reviewed" ? "View Review" : "Review"}
                </Button>
              </Box>
            </Flex>
          ))}
        </Box>
      )}
    </AdminMainAreaWrapper>
  );
};

export const ProjectSubmissionsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ProjectSubmissionsPage {...props} />} />
  );
};

export default ProjectSubmissionsPageRoute;
