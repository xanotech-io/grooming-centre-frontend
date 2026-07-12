import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Grid, GridItem } from "@chakra-ui/layout";
import {
  Box,
  Flex,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { FaInfoCircle } from "react-icons/fa";
import { Input, Select, Textarea, Heading } from "../../../components";
import { CreatePageLayout } from "../../../layouts";
import { useFetch } from "../../../hooks";
import {
  adminSubmitWorkflow,
  adminGetWorkflowSupervisors,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const REQUEST_TYPE_OPTIONS = [
  { label: "Course Content", value: "CourseContent" },
  { label: "Lesson Content", value: "LessonContent" },
  { label: "Exam", value: "Exam" },
  { label: "Standalone Exam", value: "StandaloneExam" },
  { label: "Library Material", value: "LibraryMaterial" },
  { label: "Project", value: "Project" },
];

const SubmitWorkflowPage = () => {
  const history = useHistory();
  const toast = useToast();

  const [requestReview, setRequestReview] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");

  const { resource: supervisorsResource, handleFetchResource: fetchSupervisors } =
    useFetch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const supervisorFetcher = useCallback(async () => {
    const { supervisors } = await adminGetWorkflowSupervisors();
    return supervisors;
  }, []);

  useEffect(() => {
    fetchSupervisors({ fetcher: supervisorFetcher });
  }, [fetchSupervisors, supervisorFetcher]);

  const supervisors = supervisorsResource.data ?? [];
  const supervisorOptions = supervisors.map((s) => ({
    label: `${s.firstName} ${s.lastName}`,
    value: s.id,
  }));

  const onSubmit = async (data) => {
    try {
      const payload = {
        request_type: data.request_type,
        content_id: data.content_id,
        content_title: data.content_title,
        description: data.description,
      };

      if (data.attachment_url?.trim()) {
        payload.attachment_url = data.attachment_url.trim();
      }

      if (requestReview && selectedSupervisorId) {
        payload.supervisor_id = selectedSupervisorId;
      }

      const { message } = await adminSubmitWorkflow(payload);

      toast({
        description: capitalizeFirstLetter(
          message ?? "Workflow submitted successfully.",
        ),
        position: "top",
        status: "success",
      });

      history.push("/admin/workflow");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(
          err.message ?? "Something went wrong.",
        ),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <CreatePageLayout
      title="Submit Content for Approval"
      submitButtonText={
        requestReview ? "Submit for Supervisor Review" : "Submit & Publish"
      }
      submitButtonIsLoading={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Content Details Section */}
      <Box mb={8}>
        <Heading as="h3" fontSize="md" color="#4A5568" mb={1}>
          Content Details
        </Heading>
        <Box h="1px" bg="#E2E8F0" mb={6} />

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
          <GridItem>
            <Select
              id="request_type"
              label="Request Type"
              isRequired
              placeholder="Select content type"
              options={REQUEST_TYPE_OPTIONS}
              error={errors.request_type?.message}
              {...register("request_type", {
                required: "Request type is required",
              })}
            />
          </GridItem>

          <GridItem>
            <Input
              id="content_title"
              label="Content Title"
              isRequired
              placeholder="e.g. Introduction to Data Analysis"
              error={errors.content_title?.message}
              {...register("content_title", {
                required: "Content title is required",
              })}
            />
          </GridItem>

          <GridItem>
            <Input
              id="content_id"
              label="Content ID"
              isRequired
              placeholder="UUID of the content item"
              error={errors.content_id?.message}
              {...register("content_id", {
                required: "Content ID is required",
              })}
            />
          </GridItem>

          <GridItem>
            <Input
              id="attachment_url"
              label="Attachment URL"
              placeholder="https://example.com/files/document.pdf (optional)"
              error={errors.attachment_url?.message}
              {...register("attachment_url")}
            />
          </GridItem>
        </Grid>

        <Grid templateColumns="1fr" gap={6}>
          <GridItem>
            <Textarea
              id="description"
              label="Description"
              isRequired
              placeholder="Describe the content you are submitting..."
              error={errors.description?.message}
              {...register("description", {
                required: "Description is required",
              })}
            />
          </GridItem>
        </Grid>
      </Box>

      {/* Supervisor Review Section */}
      <Box>
        <Heading as="h3" fontSize="md" color="#4A5568" mb={1}>
          Supervisor Review
        </Heading>
        <Box h="1px" bg="#E2E8F0" mb={6} />

        {/* Toggle */}
        <Flex
          align="center"
          justify="space-between"
          bg={requestReview ? "#F7F0FF" : "#F7FAFC"}
          border="1px solid"
          borderColor={requestReview ? "#6b006b" : "#E2E8F0"}
          borderRadius="8px"
          px={5}
          py={4}
          mb={requestReview ? 5 : 0}
          cursor="pointer"
          onClick={() => {
            setRequestReview((prev) => !prev);
            setSelectedSupervisorId("");
          }}
        >
          <Box>
            <Text fontWeight="600" fontSize="15px" color="#1A202C" mb="2px">
              Request supervisor review before publishing
            </Text>
            <Text fontSize="13px" color="#718096">
              {requestReview
                ? "Content will remain unpublished until the supervisor approves it."
                : "Content will be published immediately without supervisor review."}
            </Text>
          </Box>
          <Switch
            isChecked={requestReview}
            colorScheme="purple"
            size="lg"
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
            sx={{ "--switch-track-color-checked": "#6b006b" }}
          />
        </Flex>

        {/* Supervisor dropdown — only visible when toggle is on */}
        {requestReview && (
          <Box>
            <Alert
              status="info"
              borderRadius="8px"
              mb={5}
              bg="#EBF8FF"
              border="1px solid #BEE3F8"
            >
              <AlertIcon as={FaInfoCircle} color="#3182CE" />
              <AlertDescription fontSize="13px" color="#2C5282">
                Selecting a supervisor is optional. If you leave it blank the
                system will automatically assign one from your department.
              </AlertDescription>
            </Alert>

            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="600"
                color="#1A202C"
                mb={2}
              >
                Assign Supervisor{" "}
                <Text as="span" color="#718096" fontWeight="400">
                  (optional)
                </Text>
              </FormLabel>

              {supervisorsResource.loading ? (
                <Flex align="center" gap={3} h="42px">
                  <Spinner size="sm" color="#6b006b" />
                  <Text fontSize="14px" color="#718096">
                    Loading supervisors...
                  </Text>
                </Flex>
              ) : supervisorsResource.err ? (
                <Text fontSize="14px" color="red.500">
                  Could not load supervisors. The system will auto-assign one.
                </Text>
              ) : (
                <Select
                  id="supervisor_id"
                  placeholder="Leave blank to auto-assign"
                  options={supervisorOptions}
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                />
              )}
            </FormControl>
          </Box>
        )}
      </Box>
    </CreatePageLayout>
  );
};

export const SubmitWorkflowPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <SubmitWorkflowPage {...props} />} />
);

export default SubmitWorkflowPageRoute;
