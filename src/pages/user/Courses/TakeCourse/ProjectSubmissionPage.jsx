import { Route, useParams } from "react-router-dom";
import { Box, Flex, HStack, Stack } from "@chakra-ui/layout";
import { Badge } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useRef, useState } from "react";
import { FaUpload, FaExternalLinkAlt, FaCheckCircle } from "react-icons/fa";
import Icon from "@chakra-ui/icon";
import { Button, Heading, Spinner, Text, AnnotatableText, ExamReviewResultCard } from "../../../../components";
import { getProjectById, getProjectSubmissions, submitProjectFile, buildThreadKey, markViewed, getUnreadCount, getSubmissionReview } from "../../../../services";
import { capitalizeFirstLetter } from "../../../../utils";
import { useApp } from "../../../../contexts";
import dayjs from "dayjs";

const ProjectSubmissionPage = ({ sidebarLinks }) => {
  const { project_id } = useParams();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const {
    state: { user: viewer },
  } = useApp();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [review, setReview] = useState(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ project: data }, submissionsResult] = await Promise.allSettled([
          getProjectById(project_id),
          getProjectSubmissions(project_id),
        ]).then(([p, s]) => [
          p.status === "fulfilled" ? p.value : (() => { throw new Error("Failed to load project details."); })(),
          s.status === "fulfilled" ? s.value : { submissions: [] },
        ]);
        setProject(data);
        const existing = submissionsResult.submissions?.[0] ?? null;
        if (existing) setSubmission(existing);
      } catch (err) {
        setError(err.message || "Failed to load project details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [project_id]);

  useEffect(() => {
    if (submission && viewer?.id) {
      const key = buildThreadKey("project", project_id, viewer.id);
      setUnreadCount(getUnreadCount(key, viewer.id));
      markViewed(key, viewer.id);
    }
  }, [submission, viewer?.id, project_id]);

  useEffect(() => {
    if (!submission?.id) return;
    setIsReviewLoading(true);
    getSubmissionReview(submission.id)
      .then(({ review: data }) => setReview(data))
      .catch(() => setReview(null))
      .finally(() => setIsReviewLoading(false));
  }, [submission?.id]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ description: "Please select a file to submit.", position: "top", status: "warning" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { message, submission: sub } = await submitProjectFile(project_id, selectedFile);
      setSubmission(sub);
      setSelectedFile(null);
      toast({ description: capitalizeFirstLetter(message), position: "top", status: "success" });
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err?.response?.data?.message || err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center">
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }

  const isPublished = project.status === "published";
  const isPastDue = project.dueDate && dayjs().isAfter(dayjs(project.dueDate));

  return (
    <Box flex={1} overflowY="auto" px={{ base: 4, md: 10 }} py={8} backgroundColor="gray.50">
      <Box maxWidth="800px" marginX="auto">
        {unreadCount > 0 && (
          <Box backgroundColor="purple.50" border="1px" borderColor="purple.200" borderRadius="md" p={3} mb={4}>
            <Text bold color="purple.700" fontSize="sm">
              You have {unreadCount} new comment{unreadCount !== 1 ? "s" : ""} from your instructor.
            </Text>
          </Box>
        )}

        {/* Header */}
        <Flex justifyContent="space-between" alignItems="flex-start" mb={6}>
          <Box>
            <Heading as="h2" fontSize="heading.h3" mb={1}>
              {project.title}
            </Heading>
            {project.dueDate && (
              <Text as="level5" color={isPastDue ? "red.500" : "accent.3"}>
                Due: {dayjs(project.dueDate).format("ddd, D MMM YYYY · h:mm A")}
                {isPastDue && " (Past due)"}
              </Text>
            )}
          </Box>
          <HStack spacing={3}>
            {project.maxGrade != null && (
              <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="12px">
                Max grade: {project.maxGrade}
              </Badge>
            )}
            <Badge
              colorScheme={isPublished ? "green" : "gray"}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="12px"
              textTransform="capitalize"
            >
              {project.status}
            </Badge>
          </HStack>
        </Flex>

        {/* Description */}
        {project.description && (
          <Box backgroundColor="white" borderRadius="md" border="1px" borderColor="gray.200" p={6} mb={4}>
            <Text bold mb={2} color="gray.600">
              Description
            </Text>
            <Text whiteSpace="pre-wrap">{project.description}</Text>
          </Box>
        )}

        {/* Instructions */}
        {project.instructions && (
          <Box backgroundColor="white" borderRadius="md" border="1px" borderColor="gray.200" p={6} mb={6}>
            <Text bold mb={2} color="gray.600">
              Instructions
            </Text>
            <Text whiteSpace="pre-wrap">{project.instructions}</Text>
          </Box>
        )}

        {/* Submission area */}
        <Box backgroundColor="white" borderRadius="md" border="1px" borderColor="gray.200" p={6}>
          <Text bold fontSize="text.level1" mb={4}>
            Your Submission
          </Text>

          {submission ? (
            /* Already submitted this session */
            <Stack spacing={4}>
              <Flex
                alignItems="center"
                gap={3}
                backgroundColor="green.50"
                border="1px"
                borderColor="green.200"
                borderRadius="md"
                p={4}
              >
                <Icon color="green.500" fontSize="20px">
                  <FaCheckCircle />
                </Icon>
                <Box>
                  <Text bold color="green.700">
                    Submitted successfully
                  </Text>
                  <Text as="level5" color="green.600">
                    Submitted at {dayjs(submission.submittedAt).format("ddd, D MMM YYYY · h:mm A")}
                  </Text>
                </Box>
              </Flex>

              <ExamReviewResultCard
                title="Grade & Feedback"
                isLoading={isReviewLoading}
                totalScore={review?.grade ?? null}
                scoreSuffix={project.maxGrade != null ? `/${project.maxGrade}` : "%"}
                remark={review?.remarks ?? null}
                emptyRemarkLabel="Your instructor hasn't graded this submission yet."
                mb={0}
              />

              {submission.submissionUrl && (
                <Button
                  as="a"
                  href={submission.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  secondary
                  leftIcon={<FaExternalLinkAlt />}
                >
                  View Submitted File
                </Button>
              )}

              {viewer?.id && (
                <Box borderTop="1px" borderColor="gray.200" pt={4}>
                  <Text bold mb={2} color="gray.600">
                    Instructor Comments
                  </Text>
                  <AnnotatableText
                    submissionId={buildThreadKey("project", project_id, viewer.id)}
                    questionId={null}
                    questionLabel={null}
                    text={null}
                    viewerId={viewer.id}
                    viewerName={`${viewer.firstName ?? ""} ${viewer.lastName ?? ""}`.trim()}
                    viewerRole="student"
                  />
                </Box>
              )}
            </Stack>
          ) : (
            /* Upload form */
            <Stack spacing={4}>
              {!isPublished && (
                <Box
                  backgroundColor="orange.50"
                  border="1px"
                  borderColor="orange.200"
                  borderRadius="md"
                  p={3}
                >
                  <Text color="orange.700" fontSize="sm">
                    This project is not yet published and cannot accept submissions.
                  </Text>
                </Box>
              )}

              {/* Drop zone */}
              <Box
                border="2px dashed"
                borderColor={selectedFile ? "primary.base" : "gray.300"}
                borderRadius="md"
                p={8}
                textAlign="center"
                cursor="pointer"
                backgroundColor={selectedFile ? "blue.50" : "gray.50"}
                transition="all .15s"
                _hover={{ borderColor: "primary.base", backgroundColor: "blue.50" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
                />
                <Icon fontSize="32px" color={selectedFile ? "primary.base" : "gray.400"} mb={3} display="block" marginX="auto">
                  <FaUpload />
                </Icon>
                {selectedFile ? (
                  <Box>
                    <Text bold color="primary.base">
                      {selectedFile.name}
                    </Text>
                    <Text as="level5" color="gray.500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <Text bold>Click to select a file</Text>
                    <Text as="level5" color="gray.500">
                      PDF, DOC, DOCX, PPT, PPTX, XLS, ZIP, images supported
                    </Text>
                  </Box>
                )}
              </Box>

              <Flex justifyContent="flex-end">
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={!selectedFile || !isPublished}
                  leftIcon={<FaUpload />}
                >
                  Submit Project
                </Button>
              </Flex>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const ProjectSubmissionPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ProjectSubmissionPage {...props} />}
    />
  );
};

export default ProjectSubmissionPageRoute;
