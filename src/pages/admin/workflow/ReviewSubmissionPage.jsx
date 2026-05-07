import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  IconButton,
  Badge,
  Image,
  Textarea,
  Spinner,
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaRegFileAlt,
  FaDownload,
  FaExternalLinkAlt,
  FaArrowUp,
} from "react-icons/fa";
import { Button, Heading, Select } from "../../../components";
import { useFetch } from "../../../hooks";
import { useApp } from "../../../contexts/App/useApp";
import {
  adminGetWorkflowById,
  adminApproveWorkflow,
  adminRejectWorkflow,
  adminEscalateWorkflow,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const ESCALATION_ROLE_OPTIONS = [
  { label: "Academic Admin", value: "ACADEMIC_ADMIN" },
  { label: "System Admin", value: "SYSTEM_ADMIN" },
  { label: "Supervisor", value: "SUPERVISOR" },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "Approved":
    case "APPROVED":
      return (
        <Badge
          bg="#E6F4EA"
          color="#38A169"
          px="16px"
          py="4px"
          borderRadius="16px"
          textTransform="none"
          fontWeight="500"
          fontSize="14px"
        >
          Approved
        </Badge>
      );
    case "Rejected":
    case "REJECTED":
      return (
        <Badge
          bg="#FED7D7"
          color="#E53E3E"
          px="16px"
          py="4px"
          borderRadius="16px"
          textTransform="none"
          fontWeight="500"
          fontSize="14px"
        >
          Rejected
        </Badge>
      );
    case "Escalated":
    case "ESCALATED":
      return (
        <Badge
          bg="#EBF4FF"
          color="#3182CE"
          px="16px"
          py="4px"
          borderRadius="16px"
          textTransform="none"
          fontWeight="500"
          fontSize="14px"
        >
          Escalated
        </Badge>
      );
    default:
      return (
        <Badge
          bg="#FFF5EA"
          color="#DD6B20"
          px="16px"
          py="4px"
          borderRadius="16px"
          textTransform="none"
          fontWeight="500"
          fontSize="14px"
        >
          Pending
        </Badge>
      );
  }
};

const ReviewSubmissionPage = () => {
  const history = useHistory();
  const { id: workflowId } = useParams();
  const toast = useToast();
  const { state: { user } } = useApp();
  const approverId = user?.id;

  const { resource, handleFetchResource } = useFetch();
  const [remarks, setRemarks] = useState("");
  const [newApproverRole, setNewApproverRole] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  const fetcher = useCallback(async () => {
    const { workflow } = await adminGetWorkflowById(workflowId);
    return workflow;
  }, [workflowId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const workflow = resource.data;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const { message } = await adminApproveWorkflow(workflowId, { approverId, remarks });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      history.push("/admin/workflow");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast({
        description: "A rejection reason is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsRejecting(true);
    try {
      const { message } = await adminRejectWorkflow(workflowId, { approverId, remarks });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      history.push("/admin/workflow");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleEscalate = async () => {
    if (!newApproverRole) {
      toast({
        description: "Please select a role to escalate to.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsEscalating(true);
    try {
      const { message } = await adminEscalateWorkflow(workflowId, {
        approverId,
        remarks,
      });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      history.push("/admin/workflow");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsEscalating(false);
    }
  };

  return (
    <Box
      paddingX={{ base: "20px", lg: "40px" }}
      paddingY="30px"
      bg="#FAFAFA"
      minHeight="100vh"
    >
      {/* Go Back Button */}
      <Flex
        alignItems="center"
        cursor="pointer"
        onClick={() => history.goBack()}
        mb="24px"
        width="max-content"
      >
        <Box
          border="1px solid #E2E8F0"
          borderRadius="4px"
          p="6px"
          mr="12px"
          bg="white"
        >
          <FaArrowLeft color="#1A202C" />
        </Box>
        <Text fontWeight="500" color="#1A202C">
          Go Back
        </Text>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" alignItems="center" minHeight="60vh">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {resource.err && (
        <Flex justifyContent="center" alignItems="center" minHeight="60vh">
          <Text color="red.500">{resource.err}</Text>
        </Flex>
      )}

      {!resource.loading && !resource.err && (
        <>
          {/* Header / Title Section */}
          <Flex alignItems="center" mb="24px" gap="16px">
            <Heading as="h1" size="lg" color="#1A202C" m={0}>
              Review Submission
            </Heading>
            {workflow && getStatusBadge(workflow.approvalStatus)}
          </Flex>

          {/* Metadata Row */}
          <Flex gap="32px" mb="40px" flexWrap="wrap">
            <Text color="#718096" fontSize="14px">
              Workflow ID:{" "}
              <Text as="span" color="#1A202C" fontWeight="600">
                {workflow?.workflowId ?? workflowId}
              </Text>
            </Text>
            <Text color="#718096" fontSize="14px">
              Request Type:{" "}
              <Text as="span" color="#1A202C" fontWeight="600">
                {workflow?.requestType ?? "-"}
              </Text>
            </Text>
            <Text color="#718096" fontSize="14px">
              Submitted By:{" "}
              <Text as="span" color="#1A202C" fontWeight="600">
                {workflow?.submittedBy ?? "-"}
              </Text>
            </Text>
            <Text color="#718096" fontSize="14px">
              Date Submitted:{" "}
              <Text as="span" color="#1A202C" fontWeight="600">
                {workflow?.actionDate
                  ? new Date(workflow.actionDate).toLocaleDateString("en-GB")
                  : "-"}
              </Text>
            </Text>
          </Flex>

          {/* Main Content Layout */}
          <Grid
            templateColumns={{ base: "1fr", lg: "2.5fr 1fr" }}
            gap="40px"
            alignItems="start"
          >
            {/* Left Column: Course Details */}
            <Box bg="white" borderRadius="8px" p="30px" shadow="sm">
              {/* Course Title Link */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                mb="24px"
              >
                <Text fontSize="18px" fontWeight="600" color="#1A202C">
                  Course: Data Analysis
                </Text>
                <FaExternalLinkAlt color="#6b006b" cursor="pointer" />
              </Flex>

              {/* Lesson Title */}
              <Text fontSize="20px" fontWeight="600" color="#1A202C" mb="16px">
                Introduction to Data Analysis
              </Text>

              {/* Banner Image */}
              <Box
                w="100%"
                h={{ base: "200px", md: "300px" }}
                bgGradient="linear(to-r, #1A365D, #2B6CB0)"
                borderRadius="4px"
                mb="24px"
                position="relative"
                overflow="hidden"
              >
                <Image
                  src="https://images.unsplash.com/photo-1621501104860-2ff58625298f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Data Analysis graphic"
                  objectFit="cover"
                  w="100%"
                  h="100%"
                  opacity={0.8}
                />
              </Box>

              {/* Description */}
              <Text fontSize="18px" fontWeight="600" color="#1A202C" mb="12px">
                Description:
              </Text>
              <Text color="#4A5568" fontSize="16px" lineHeight="1.6" mb="32px">
                Lorem ipsum dolor sit amet consectetur. Tellus posuere nulla
                praesent cursus curabitur vel. Sed in a cras aliquet amet. Nisl
                eget porttitor ipsum consequat non tincidunt.
              </Text>

              {/* Attachments Section */}
              <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="16px">
                Supplementary Attachment:
              </Text>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Flex
                    key={i}
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    p="16px"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Flex alignItems="center" gap="16px">
                      <Box bg="#F0F4F8" p="10px" borderRadius="4px">
                        <FaRegFileAlt size="24px" color="#1A202C" />
                      </Box>
                      <Box>
                        <Text
                          fontSize="14px"
                          fontWeight="500"
                          color="#1A202C"
                          noOfLines={1}
                          mb="4px"
                        >
                          Lesson orientation syllabus.pdf
                        </Text>
                        <Text fontSize="12px" color="#A0AEC0">
                          2.4mb
                        </Text>
                      </Box>
                    </Flex>
                    <IconButton
                      icon={<FaDownload color="#4A5568" />}
                      variant="ghost"
                      aria-label="Download attachment"
                      size="sm"
                    />
                  </Flex>
                ))}
              </Grid>
            </Box>

            {/* Right Column: Approval Action Form */}
            <Box position="sticky" top="30px">
              <Text fontSize="20px" fontWeight="600" color="#1A202C" mb="20px">
                Approval Action
              </Text>

              <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="12px">
                Feedback/Comment
              </Text>

              <Textarea
                placeholder="Enter feedback...."
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                minH="200px"
                p="20px"
                mb="24px"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                _focus={{ ring: "2px", ringColor: "#6b006b", border: "none" }}
              />

              <Flex flexDirection="column" gap="16px">
                <Button
                  w="100%"
                  h="50px"
                  style={{ backgroundColor: "#6b006b", color: "white" }}
                  _hover={{ bg: "#520052" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap="10px"
                  isLoading={isApproving}
                  onClick={handleApprove}
                >
                  <FaCheckCircle size="18px" />
                  Approve Content Submission
                </Button>
                <Button
                  w="100%"
                  h="50px"
                  variant="outline"
                  borderColor="#E53E3E"
                  style={{ backgroundColor: "#FFF5F5", color: "black" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap="10px"
                  isLoading={isRejecting}
                  onClick={handleReject}
                >
                  <FaTimesCircle size="18px" />
                  Reject Content Submission
                </Button>
              </Flex>

              {/* Escalate Section */}
              <Box mt="24px">
                <Divider mb="20px" />
                <Button
                  w="100%"
                  h="42px"
                  variant="outline"
                  borderColor="#3182CE"
                  color="#3182CE"
                  bg="transparent"
                  _hover={{ bg: "#EBF4FF" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap="10px"
                  onClick={() => setShowEscalate((prev) => !prev)}
                >
                  <FaArrowUp size="14px" />
                  {showEscalate ? "Cancel Escalation" : "Escalate Workflow"}
                </Button>

                {showEscalate && (
                  <Box mt="16px">
                    <Text
                      fontSize="14px"
                      fontWeight="500"
                      color="#1A202C"
                      mb="8px"
                    >
                      Escalate To
                    </Text>
                    <Box mb="16px">
                      <Select
                        id="escalateRole"
                        placeholder="Select approver role"
                        options={ESCALATION_ROLE_OPTIONS}
                        onChange={(e) => setNewApproverRole(e.target.value)}
                        value={newApproverRole}
                      />
                    </Box>
                    <Button
                      w="100%"
                      h="50px"
                      style={{ backgroundColor: "#3182CE", color: "white" }}
                      _hover={{ bg: "#2B6CB0" }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap="10px"
                      isLoading={isEscalating}
                      onClick={handleEscalate}
                    >
                      <FaArrowUp size="18px" />
                      Confirm Escalation
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </>
      )}
    </Box>
  );
};

export const ReviewSubmissionPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ReviewSubmissionPage {...props} />} />
  );
};

export default ReviewSubmissionPageRoute;
