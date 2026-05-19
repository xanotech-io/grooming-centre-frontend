import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams, useLocation, Redirect } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  IconButton,
  Badge,
  Textarea,
  Spinner,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaRegFileAlt,
  FaDownload,
  FaExternalLinkAlt,
  FaArrowUp,
  FaBookOpen,
} from "react-icons/fa";
import { Button, Heading, Select } from "../../../components";
import { useFetch } from "../../../hooks";
import { useApp } from "../../../contexts";
import {
  adminApproveWorkflow,
  adminRejectWorkflow,
  adminEscalateWorkflow,
  adminPublishWorkflow,
  adminGetWorkflowAuditLog,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const ALLOWED_ROLES = /admin|supervisor/i;

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
    case "Published":
    case "PUBLISHED":
      return (
        <Badge
          bg="#F0FFF4"
          color="#276749"
          px="16px"
          py="4px"
          borderRadius="16px"
          textTransform="none"
          fontWeight="500"
          fontSize="14px"
        >
          Published
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

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const ReviewSubmissionPage = () => {
  const history = useHistory();
  const { id: workflowId } = useParams();
  const { state: locationState } = useLocation();
  const { state: appState, getOneMetadata } = useApp();
  const toast = useToast();

  const role = getOneMetadata("userRoles", appState.user?.userRoleId);
  const hasAccess = ALLOWED_ROLES.test(role?.name);

  const { resource: auditResource, handleFetchResource: fetchAudit } =
    useFetch();

  const [remarks, setRemarks] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  // Workflow data comes from router state (passed from the list page)
  const workflow = locationState?.workflow ?? null;
  const approverId = appState.user?.id;

  useEffect(() => {
    if (workflow?.approvalStatus) {
      setCurrentStatus(workflow.approvalStatus);
    }
  }, [workflow]);

  const auditFetcher = useCallback(async () => {
    const { auditLog } = await adminGetWorkflowAuditLog(workflowId);
    return auditLog;
  }, [workflowId]);

  useEffect(() => {
    if (hasAccess) fetchAudit({ fetcher: auditFetcher });
  }, [fetchAudit, auditFetcher, hasAccess]);

  const auditLog = auditResource.data ?? [];

  if (appState.user && role && !hasAccess) {
    return <Redirect to="/admin" />;
  }

  const isApproved =
    currentStatus === "Approved" || currentStatus === "APPROVED";
  const isPublished =
    currentStatus === "Published" || currentStatus === "PUBLISHED";
  const canAct = !isPublished;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const { message } = await adminApproveWorkflow(workflowId, {
        approverId,
        remarks,
      });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      setCurrentStatus("Approved");
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
      const { message } = await adminRejectWorkflow(workflowId, {
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
      setIsRejecting(false);
    }
  };

  const handleEscalate = async () => {
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

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { message } = await adminPublishWorkflow({
        workflowId,
        publishedBy: approverId,
      });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      setCurrentStatus("Published");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Box
      paddingX={{ base: "20px", lg: "40px" }}
      paddingY="30px"
      bg="#FAFAFA"
      minHeight="100vh"
    >
      {/* Go Back */}
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

      {/* Header */}
      <Flex alignItems="center" mb="24px" gap="16px">
        <Heading as="h1" size="lg" color="#1A202C" m={0}>
          Review Submission
        </Heading>
        {getStatusBadge(currentStatus ?? workflow?.approvalStatus)}
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
            {workflow?.submissionDate || workflow?.actionDate
              ? new Date(
                  workflow.submissionDate ?? workflow.actionDate,
                ).toLocaleDateString("en-GB")
              : "-"}
          </Text>
        </Text>
        {workflow?.approverRole && (
          <Text color="#718096" fontSize="14px">
            Approver Role:{" "}
            <Text as="span" color="#1A202C" fontWeight="600">
              {workflow.approverRole}
            </Text>
          </Text>
        )}
      </Flex>

      {/* Main Content */}
      <Grid
        templateColumns={{ base: "1fr", lg: "2.5fr 1fr" }}
        gap="40px"
        alignItems="start"
        mb="40px"
      >
        {/* Left: Content Details */}
        <Box bg="white" borderRadius="8px" p="30px" shadow="sm">
          {/* Title Row */}
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb="24px"
          >
            <Flex alignItems="center" gap="12px">
              <Box bg="#F7F0FF" p="10px" borderRadius="8px">
                <FaBookOpen color="#6b006b" size="20px" />
              </Box>
              <Text fontSize="18px" fontWeight="600" color="#1A202C">
                {workflow?.contentTitle ?? "Content Details"}
              </Text>
            </Flex>
            {workflow?.attachmentUrl && (
              <a
                href={workflow.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaExternalLinkAlt color="#6b006b" cursor="pointer" />
              </a>
            )}
          </Flex>

          {/* Description */}
          <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="12px">
            Description:
          </Text>
          <Text color="#4A5568" fontSize="15px" lineHeight="1.7" mb="32px">
            {workflow?.description ?? "No description provided."}
          </Text>

          {/* Attachment */}
          {workflow?.attachmentUrl && (
            <>
              <Text
                fontSize="16px"
                fontWeight="600"
                color="#1A202C"
                mb="16px"
              >
                Attachment:
              </Text>
              <Flex
                border="1px solid #E2E8F0"
                borderRadius="8px"
                p="16px"
                alignItems="center"
                justifyContent="space-between"
                maxW="480px"
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
                      {workflow.attachmentUrl.split("/").pop() ??
                        "attachment"}
                    </Text>
                    <Text fontSize="12px" color="#A0AEC0">
                      View file
                    </Text>
                  </Box>
                </Flex>
                <a
                  href={workflow.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <IconButton
                    icon={<FaDownload color="#4A5568" />}
                    variant="ghost"
                    aria-label="Download attachment"
                    size="sm"
                  />
                </a>
              </Flex>
            </>
          )}

          {/* Remarks (if already reviewed) */}
          {workflow?.remarks && (
            <Box mt="24px">
              <Text
                fontSize="16px"
                fontWeight="600"
                color="#1A202C"
                mb="8px"
              >
                Reviewer Remarks:
              </Text>
              <Box bg="#F7FAFC" borderRadius="8px" p="16px">
                <Text color="#4A5568" fontSize="14px">
                  {workflow.remarks}
                </Text>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right: Approval Actions */}
        <Box position="sticky" top="30px">
          <Text fontSize="20px" fontWeight="600" color="#1A202C" mb="20px">
            Approval Action
          </Text>

          {isPublished ? (
            <Box
              bg="#F0FFF4"
              borderRadius="8px"
              p="20px"
              textAlign="center"
            >
              <Text color="#276749" fontWeight="600" fontSize="16px">
                This workflow has been published.
              </Text>
            </Box>
          ) : (
            <>
              <Text
                fontSize="14px"
                fontWeight="500"
                color="#1A202C"
                mb="12px"
              >
                Feedback / Comment
              </Text>

              <Textarea
                placeholder="Enter feedback..."
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                minH="180px"
                p="20px"
                mb="24px"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                _focus={{ ring: "2px", ringColor: "#6b006b", border: "none" }}
                isDisabled={!canAct}
              />

              {isApproved ? (
                /* Show publish button when already approved */
                <Button
                  w="100%"
                  h="50px"
                  style={{ backgroundColor: "#276749", color: "white" }}
                  _hover={{ bg: "#1C4532" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap="10px"
                  isLoading={isPublishing}
                  onClick={handlePublish}
                >
                  <FaCheckCircle size="18px" />
                  Publish Content
                </Button>
              ) : (
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
                    Approve Submission
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
                    Reject Submission
                  </Button>
                </Flex>
              )}

              {/* Escalate */}
              {!isApproved && (
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
              )}
            </>
          )}
        </Box>
      </Grid>

      {/* Audit Log */}
      <Box bg="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
        <Box
          px="24px"
          py="18px"
          borderBottom="1px solid #E2E8F0"
        >
          <Text fontSize="16px" fontWeight="600" color="#1A202C">
            Audit Log
          </Text>
        </Box>

        {auditResource.loading && (
          <Flex justifyContent="center" alignItems="center" padding="40px">
            <Spinner size="md" color="#6b006b" />
          </Flex>
        )}

        {auditResource.err && (
          <Flex justifyContent="center" alignItems="center" padding="40px">
            <Text color="red.500" fontSize="14px">
              {auditResource.err}
            </Text>
          </Flex>
        )}

        {!auditResource.loading && !auditResource.err && (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Action Type
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Performed By
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Date & Time
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Remarks
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {auditLog.length === 0 ? (
                  <Tr>
                    <Td
                      colSpan={4}
                      textAlign="center"
                      py="30px"
                      color="#718096"
                      fontSize="14px"
                    >
                      No audit entries yet.
                    </Td>
                  </Tr>
                ) : (
                  auditLog.map((entry) => (
                    <Tr key={entry.id ?? entry.action_date}>
                      <Td fontSize="14px" color="#1A202C">
                        {entry.action_type ?? entry.actionType}
                      </Td>
                      <Td fontSize="14px" color="#4A5568">
                        {entry.performed_by ?? entry.performedBy}
                      </Td>
                      <Td fontSize="14px" color="#4A5568">
                        {formatDateTime(
                          entry.action_date ?? entry.actionDate,
                        )}
                      </Td>
                      <Td fontSize="14px" color="#4A5568">
                        {entry.remarks ?? "-"}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export const ReviewSubmissionPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ReviewSubmissionPage {...props} />} />
  );
};

export default ReviewSubmissionPageRoute;
