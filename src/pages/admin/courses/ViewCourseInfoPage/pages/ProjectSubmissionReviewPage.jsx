import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaCheckCircle } from "react-icons/fa";
import Icon from "@chakra-ui/icon";
import {
  Breadcrumb,
  Button,
  Heading,
  Input,
  Link,
  Spinner,
  Text,
  Textarea,
} from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  getSubmissionById,
  getSubmissionReview,
  reviewSubmission,
} from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";
import dayjs from "dayjs";

const ProjectSubmissionReviewPage = () => {
  const { courseId, moduleId, projectId, submissionId } = useParams();
  const toast = useToast();

  const [submission, setSubmission] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ submission: sub }, reviewResult] = await Promise.all([
          getSubmissionById(submissionId),
          getSubmissionReview(submissionId).catch(() => ({ review: null })),
        ]);
        setSubmission(sub);
        setExistingReview(reviewResult.review);
      } catch {
        setError("Failed to load submission.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [submissionId]);

  const onSubmit = async (data) => {
    try {
      const body = {
        grade: Number(data.grade),
        remarks: data.remarks,
        inlineMarkup: {},
      };

      const { message, review } = await reviewSubmission(submissionId, body);
      setExistingReview(review);

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(
          err?.response?.data?.message || err.message
        ),
        position: "top",
        status: "error",
      });
    }
  };

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
        item5={<BreadcrumbItem><Link href={`/admin/courses/${courseId}/module/${moduleId}/projects/${projectId}/submissions`}>Submissions</Link></BreadcrumbItem>}
        item6={<BreadcrumbItem isCurrentPage><Link href="#">Review</Link></BreadcrumbItem>}
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Heading as="h1" fontSize="heading.h3">
          Submission Review
        </Heading>
        <Badge
          colorScheme={submission.status === "reviewed" ? "green" : "blue"}
          fontSize="12px"
          px={3}
          py={1}
          textTransform="capitalize"
        >
          {submission.status}
        </Badge>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Submission details */}
        <Box backgroundColor="white" borderRadius="md" border="1px" borderColor="gray.200" p={6}>
          <Text bold fontSize="text.level1" mb={4}>
            Submission Details
          </Text>

          <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
            <Box>
              <Text bold color="gray.500" fontSize="sm" mb={1}>Student ID</Text>
              <Text fontSize="sm" isTruncated>{submission.userId}</Text>
            </Box>
            <Box>
              <Text bold color="gray.500" fontSize="sm" mb={1}>Submitted At</Text>
              <Text fontSize="sm">
                {dayjs(submission.submittedAt).format("MMM D, YYYY · h:mm A")}
              </Text>
            </Box>
          </Grid>

          <Box mb={4}>
            <Text bold color="gray.500" fontSize="sm" mb={2}>Submitted File</Text>
            {submission.submissionUrl ? (
              <Box
                as="a"
                href={submission.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                display="inline-flex"
                alignItems="center"
                gap={2}
                color="primary.base"
                fontWeight="600"
                fontSize="sm"
                _hover={{ textDecoration: "underline" }}
              >
                Open submitted file
                <Icon fontSize="12px"><FaExternalLinkAlt /></Icon>
              </Box>
            ) : (
              <Text fontSize="sm" color="gray.400">No file URL available.</Text>
            )}
          </Box>
        </Box>

        {/* Review panel */}
        <Box backgroundColor="white" borderRadius="md" border="1px" borderColor="gray.200" p={6}>
          <Text bold fontSize="text.level1" mb={4}>
            Review
          </Text>

          {existingReview ? (
            /* Existing review display */
            <Box>
              <Flex
                alignItems="center"
                gap={2}
                backgroundColor="green.50"
                border="1px"
                borderColor="green.200"
                borderRadius="md"
                p={3}
                mb={4}
              >
                <Icon color="green.500"><FaCheckCircle /></Icon>
                <Text bold color="green.700" fontSize="sm">
                  Reviewed on {dayjs(existingReview.reviewedAt).format("MMM D, YYYY · h:mm A")}
                </Text>
              </Flex>

              <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                <Box>
                  <Text bold color="gray.500" fontSize="sm" mb={1}>Grade</Text>
                  <Text fontSize="heading.h4" fontWeight="bold" color="primary.base">
                    {existingReview.grade}
                  </Text>
                </Box>
                <Box>
                  <Text bold color="gray.500" fontSize="sm" mb={1}>Reviewed By</Text>
                  <Text fontSize="sm">{existingReview.reviewerId}</Text>
                </Box>
              </Grid>

              {existingReview.remarks && (
                <Box mb={4}>
                  <Text bold color="gray.500" fontSize="sm" mb={1}>Remarks</Text>
                  <Box
                    backgroundColor="gray.50"
                    borderRadius="md"
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap">{existingReview.remarks}</Text>
                  </Box>
                </Box>
              )}

              {existingReview.inlineMarkup &&
                Object.keys(existingReview.inlineMarkup).length > 0 && (
                  <Box>
                    <Text bold color="gray.500" fontSize="sm" mb={2}>Inline Markup</Text>
                    {Object.entries(existingReview.inlineMarkup).map(([key, val]) => (
                      <Flex
                        key={key}
                        gap={3}
                        mb={2}
                        p={2}
                        backgroundColor="yellow.50"
                        borderRadius="md"
                        border="1px"
                        borderColor="yellow.200"
                        fontSize="sm"
                      >
                        <Text bold color="yellow.700" flexShrink={0}>{key}:</Text>
                        <Text color="gray.700">{val}</Text>
                      </Flex>
                    ))}
                  </Box>
                )}
            </Box>
          ) : (
            /* Review form */
            <Box as="form" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Grade"
                type="number"
                placeholder="e.g. 85"
                isRequired
                error={errors.grade?.message}
                mb={4}
                {...register("grade", {
                  required: "Grade is required",
                  min: { value: 0, message: "Grade must be 0 or more" },
                })}
              />

              <Textarea
                label="Remarks"
                placeholder="General feedback for the student..."
                error={errors.remarks?.message}
                mb={6}
                rows={5}
                {...register("remarks")}
              />

              <Flex justifyContent="flex-end">
                <Button type="submit" isLoading={isSubmitting}>
                  Submit Review
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
      </Grid>
    </AdminMainAreaWrapper>
  );
};

export const ProjectSubmissionReviewPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ProjectSubmissionReviewPage {...props} />}
    />
  );
};

export default ProjectSubmissionReviewPageRoute;
