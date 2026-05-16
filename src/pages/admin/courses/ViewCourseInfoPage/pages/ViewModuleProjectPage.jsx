import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex, Grid, Spinner } from "@chakra-ui/react";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  Heading,
  Link,
  Text,
} from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { getProjectById, getProjectSubmissions } from "../../../../../services";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { FaExternalLinkAlt, FaInbox } from "react-icons/fa";
import Icon from "@chakra-ui/icon";

/* ─── Tab bar ──────────────────────────────────────────── */
const Tab = ({ label, active, count, onClick }) => (
  <Box
    as="button"
    px="20px"
    py="12px"
    fontSize="14px"
    fontWeight={active ? "600" : "400"}
    color={active ? "#6b006b" : "gray.500"}
    borderBottom={active ? "2px solid #6b006b" : "2px solid transparent"}
    bg="transparent"
    cursor="pointer"
    onClick={onClick}
    _hover={{ color: "#6b006b" }}
    display="flex"
    alignItems="center"
    gap="6px"
    whiteSpace="nowrap"
  >
    {label}
    {count != null && (
      <Badge
        bg={active ? "#6b006b" : "#E2E8F0"}
        color={active ? "white" : "gray.600"}
        borderRadius="10px"
        px="7px"
        fontSize="10px"
        fontWeight="700"
      >
        {count}
      </Badge>
    )}
  </Box>
);

/* ─── Shared helpers ───────────────────────────────────── */
const InfoRow = ({ label, value, fullWidth }) => (
  <Box gridColumn={fullWidth ? { md: "1 / -1" } : undefined}>
    <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
      {label}
    </Text>
    <Text fontSize="text.level2" whiteSpace="pre-wrap">
      {value ?? "—"}
    </Text>
  </Box>
);

/* ─── Overview tab ─────────────────────────────────────── */
const OverviewTab = ({ project, courseId, moduleId, projectId }) => {
  const { push } = useHistory();
  const isPublished = project.status === "published";

  return (
    <>
      <Flex justifyContent="flex-end" mb={4}>
        <Button
          size="sm"
          onClick={() =>
            push(
              `/admin/courses/${courseId}/module/${moduleId}/projects/${projectId}/edit`,
            )
          }
        >
          Edit Project
        </Button>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        <InfoRow label="Title" value={project.title} />

        <Box>
          <Text
            fontWeight="bold"
            color="gray.500"
            fontSize="text.level3"
            mb={1}
          >
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

        <InfoRow
          label="Due Date"
          value={
            project.dueDate
              ? dayjs(project.dueDate).format("MMM D, YYYY h:mm a")
              : null
          }
        />
        <InfoRow label="Max Grade" value={project.maxGrade} />

        {project.description && (
          <InfoRow label="Description" value={project.description} fullWidth />
        )}
        {project.instructions && (
          <InfoRow
            label="Instructions"
            value={project.instructions}
            fullWidth
          />
        )}

        <InfoRow
          label="Created At"
          value={dayjs(project.createdAt).format("MMM D, YYYY h:mm a")}
        />
        <InfoRow
          label="Last Updated"
          value={dayjs(project.updatedAt).format("MMM D, YYYY h:mm a")}
        />
      </Grid>
    </>
  );
};

/* ─── Submissions tab ──────────────────────────────────── */
const statusColor = { submitted: "blue", reviewed: "green" };

const SubmissionsTab = ({ projectId, courseId, moduleId }) => {
  const { push } = useHistory();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjectSubmissions(projectId)
      .then(({ submissions: data }) => setSubmissions(data ?? []))
      .catch((err) => setError(err.message || "Failed to load submissions."))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading)
    return (
      <Flex justifyContent="center" py="60px">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );

  if (error)
    return (
      <Flex justifyContent="center" py="60px">
        <Text color="red.500">{error}</Text>
      </Flex>
    );

  if (!submissions.length) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        py="60px"
        gap={3}
      >
        <Box
          w="56px"
          h="56px"
          bg="#F0E6FF"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={FaInbox} color="#6b006b" fontSize="22px" />
        </Box>
        <Text fontSize="16px" fontWeight="600" color="#1A202C">
          No submissions yet
        </Text>
        <Text fontSize="14px" color="gray.500">
          Students haven't submitted this project yet.
        </Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Flex
        px={5}
        py={4}
        borderBottom="1px solid #E2E8F0"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontSize="14px" fontWeight="600" color="gray.700">
          Student Submissions
        </Text>
        <Badge
          bg="#E6F0FF"
          color="#2B6CB0"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="13px"
          fontWeight="600"
        >
          {submissions.length}{" "}
          {submissions.length === 1 ? "submission" : "submissions"}
        </Badge>
      </Flex>

      <Box overflowX="auto">
        <Box as="table" w="100%" fontSize="sm">
          <Box as="thead" bg="#F7FAFC">
            <Box as="tr">
              {["Student ID", "Submitted At", "Status", "File", "Action"].map(
                (h) => (
                  <Box
                    key={h}
                    as="th"
                    textAlign="left"
                    py="14px"
                    px={4}
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    whiteSpace="nowrap"
                  >
                    {h}
                  </Box>
                ),
              )}
            </Box>
          </Box>
          <Box as="tbody">
            {submissions.map((sub) => (
              <Box
                as="tr"
                key={sub.id}
                borderTop="1px solid #E2E8F0"
                _hover={{ bg: "#F9F0FF" }}
              >
                <Box
                  as="td"
                  py="14px"
                  px={4}
                  fontSize="13px"
                  color="gray.600"
                  maxW="200px"
                >
                  <Text isTruncated>{sub.userId}</Text>
                </Box>
                <Box
                  as="td"
                  py="14px"
                  px={4}
                  fontSize="13px"
                  color="gray.500"
                  whiteSpace="nowrap"
                >
                  {sub.submittedAt
                    ? dayjs(sub.submittedAt).format("MMM D, YYYY · h:mm A")
                    : "—"}
                </Box>
                <Box as="td" py="14px" px={4}>
                  <Badge
                    colorScheme={statusColor[sub.status] || "gray"}
                    fontSize="10px"
                    textTransform="capitalize"
                    px={2}
                    py="2px"
                    borderRadius="full"
                  >
                    {sub.status}
                  </Badge>
                </Box>
                <Box as="td" py="14px" px={4}>
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
                      View file <Icon as={FaExternalLinkAlt} fontSize="11px" />
                    </Box>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      —
                    </Text>
                  )}
                </Box>
                <Box as="td" py="14px" px={4}>
                  <Button
                    size="sm"
                    onClick={() =>
                      push(
                        `/admin/courses/${courseId}/module/${moduleId}/projects/${projectId}/submissions/${sub.id}`,
                      )
                    }
                  >
                    {sub.status === "reviewed" ? "View Review" : "Review"}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Page ─────────────────────────────────────────────── */
const ViewModuleProjectPage = () => {
  const history = useHistory();
  const { courseId, moduleId, projectId } = useParams();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [submissionCount, setSubmissionCount] = useState(null);

  useEffect(() => {
    getProjectById(projectId)
      .then(({ project: data }) => setProject(data))
      .catch(() => setError("Failed to load project details."))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  const fetchSubmissionCount = useCallback(async () => {
    try {
      const { submissions } = await getProjectSubmissions(projectId);
      setSubmissionCount(submissions?.length ?? 0);
    } catch {
      // silent — badge is best-effort
    }
  }, [projectId]);

  useEffect(() => {
    fetchSubmissionCount();
  }, [fetchSubmissionCount]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" paddingTop="100px">
        <Spinner />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <AdminMainAreaWrapper>
        <Box paddingY={10} paddingX={6}>
          <Text color="red.500">{error || "Project not found."}</Text>
        </Box>
      </AdminMainAreaWrapper>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "submissions", label: "Submissions", count: submissionCount },
  ];

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
            <Link
              href={`/admin/courses/${courseId}/module/${moduleId}/projects`}
            >
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

      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        paddingBottom={5}
        marginBottom={0}
        flexWrap="wrap"
        gap={3}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3" mb={2}>
            {project.title}
          </Heading>
          <Flex gap={2} flexWrap="wrap">
            <Badge
              colorScheme={project.status === "published" ? "green" : "gray"}
              px={3}
              py={1}
              fontSize="xs"
              textTransform="capitalize"
            >
              {project.status}
            </Badge>
            {project.dueDate && (
              <Badge colorScheme="blue" px={3} py={1} fontSize="xs">
                Due {dayjs(project.dueDate).format("MMM D, YYYY")}
              </Badge>
            )}
            {project.maxGrade != null && (
              <Badge colorScheme="purple" px={3} py={1} fontSize="xs">
                Max grade: {project.maxGrade}
              </Badge>
            )}
          </Flex>
        </Box>

        <Button secondary size="sm" onClick={() => history.goBack()}>
          ← Back
        </Button>
      </Flex>

      {/* Tab container */}
      <Box
        bg="white"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        mt={4}
        overflow="hidden"
      >
        {/* Tab nav */}
        <Flex borderBottom="1px solid #E2E8F0" px={2} bg="white">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              count={tab.count}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </Flex>

        {/* Tab content */}
        <Box p={activeTab === "submissions" ? 0 : 6}>
          {activeTab === "overview" && (
            <OverviewTab
              project={project}
              courseId={courseId}
              moduleId={moduleId}
              projectId={projectId}
            />
          )}
          {activeTab === "submissions" && (
            <SubmissionsTab
              projectId={projectId}
              courseId={courseId}
              moduleId={moduleId}
            />
          )}
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ViewModuleProjectPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ViewModuleProjectPage {...props} />} />
  );
};

export default ViewModuleProjectPageRoute;
