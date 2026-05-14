import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Progress,
  Divider,
  IconButton,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { FaArrowLeft, FaRedo, FaGlobe } from "react-icons/fa";
import { Button, Heading } from "../../../../components";
import { useFetch } from "../../../../hooks";
import {
  adminGetBulkCourseV2BatchDetails,
  adminRetryBulkCourseV2Batch,
  adminPublishBulkCourseV2Batch,
} from "../../../../services";

const getStatusBadge = (status) => {
  const s = String(status).toLowerCase();
  const map = {
    completed: { bg: "#E6F4EA", color: "#38A169", label: "Completed" },
    created:   { bg: "#E6F4EA", color: "#38A169", label: "Created" },
    success:   { bg: "#E6F4EA", color: "#38A169", label: "Success" },
    processing:{ bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
    pending:   { bg: "#FFF5EA", color: "#DD6B20", label: "Pending" },
    published: { bg: "#EBF8FF", color: "#553C9A", label: "Published" },
    error:     { bg: "#FED7D7", color: "#E53E3E", label: "Error" },
    failed:    { bg: "#FED7D7", color: "#E53E3E", label: "Failed" },
  };
  const style = map[s] || { bg: "gray.100", color: "gray.600", label: status || "Unknown" };
  return (
    <Badge bg={style.bg} color={style.color} px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
      {style.label}
    </Badge>
  );
};

const BulkCourseV2BatchDetailsPage = () => {
  const history = useHistory();
  const { batchId } = useParams();
  const toast = useToast();

  const { resource, handleFetchResource } = useFetch();
  const [retrying, setRetrying] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetcher = useCallback(async () => {
    const { batch } = await adminGetBulkCourseV2BatchDetails(batchId);
    return { batch };
  }, [batchId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  // Poll every 5s while processing
  useEffect(() => {
    const batch = resource.data?.batch;
    if (!batch) return;
    const s = String(batch.status).toLowerCase();
    if (s !== "processing" && s !== "pending") return;
    const interval = setInterval(() => handleFetchResource({ fetcher }), 5000);
    return () => clearInterval(interval);
  }, [resource.data, fetcher, handleFetchResource]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const { retried, retriedSuccess, retriedFailed } = await adminRetryBulkCourseV2Batch(batchId);
      toast({
        title: `Retry complete — ${retriedSuccess} succeeded, ${retriedFailed} failed (${retried} total)`,
        status: retriedFailed === 0 ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to retry batch", status: "error", duration: 3000, isClosable: true });
    } finally {
      setRetrying(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { published } = await adminPublishBulkCourseV2Batch(batchId);
      toast({
        title: `${published} course${published !== 1 ? "s" : ""} published successfully`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to publish batch", status: "error", duration: 3000, isClosable: true });
    } finally {
      setPublishing(false);
    }
  };

  const batch = resource.data?.batch;
  const batchStatus = batch ? String(batch.status).toLowerCase() : "";
  const progressPct = parseFloat(batch?.progressPercentage) || 0;
  const items = batch?.items ?? [];

  return (
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/bulk-courses")}
        />
        <Heading fontSize="22px" fontWeight="600">Batch Details</Heading>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" py="60px"><Spinner size="xl" color="blue.500" /></Flex>
      )}
      {resource.err && (
        <Flex justifyContent="center" py="60px">
          <Text color="red.500">Failed to load batch details. Please try again.</Text>
        </Flex>
      )}

      {!resource.loading && !resource.err && batch && (
        <>
          {/* Batch Info */}
          <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px" mb="20px">
            <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px">
              <Box>
                <Text fontSize="13px" color="gray.500" mb="2px">Batch ID</Text>
                <Text fontSize="15px" fontWeight="600">{batch.id}</Text>
              </Box>
              <Flex gap="12px" alignItems="center" flexWrap="wrap">
                {getStatusBadge(batch.status)}
                {(batchStatus === "error" || batchStatus === "failed") && (
                  <Button size="sm" leftIcon={<FaRedo />} isLoading={retrying} onClick={handleRetry}>
                    Retry Batch
                  </Button>
                )}
                {(batch.successfulCount > 0 || batchStatus === "completed") && (
                  <Button size="sm" leftIcon={<FaGlobe />} isLoading={publishing} onClick={handlePublish}>
                    Publish Batch
                  </Button>
                )}
              </Flex>
            </Flex>

            <Divider my="16px" />

            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="16px">
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">Department</Text>
                <Text fontSize="14px" fontWeight="500">{batch.department?.name || batch.departmentId || "—"}</Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">Template</Text>
                <Text fontSize="14px" fontWeight="500">{batch.template?.name || batch.templateId || "—"}</Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">Term</Text>
                <Text fontSize="14px" fontWeight="500">{batch.term || "—"}</Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">Upload Method</Text>
                <Text fontSize="14px" fontWeight="500" textTransform="capitalize">{batch.uploadMethod || "—"}</Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">Created By</Text>
                <Text fontSize="14px" fontWeight="500">
                  {batch.creator ? `${batch.creator.firstName} ${batch.creator.lastName}` : "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">Created At</Text>
                <Text fontSize="14px" fontWeight="500">
                  {batch.createdAt ? new Date(batch.createdAt).toLocaleString() : "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">Updated At</Text>
                <Text fontSize="14px" fontWeight="500">
                  {batch.updatedAt ? new Date(batch.updatedAt).toLocaleString() : "—"}
                </Text>
              </Box>
            </Grid>

            {/* Progress bar */}
            {(batchStatus === "processing" || batchStatus === "pending") && (
              <Box mt="20px">
                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="13px" color="gray.600">Processing courses…</Text>
                  <Text fontSize="13px" fontWeight="600" color="blue.500">{progressPct.toFixed(1)}%</Text>
                </Flex>
                <Progress value={progressPct} colorScheme="blue" borderRadius="4px" size="sm" hasStripe isAnimated />
              </Box>
            )}
          </Box>

          {/* Stats */}
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="16px" mb="20px">
            {[
              { label: "Total", value: batch.totalCourses ?? items.length, color: "#3182CE", bg: "#EBF4FF" },
              { label: "Successful", value: batch.successfulCount ?? 0, color: "#38A169", bg: "#E6F4EA" },
              { label: "Failed", value: batch.failedCount ?? 0, color: "#E53E3E", bg: "#FED7D7" },
              { label: "Progress", value: `${progressPct.toFixed(0)}%`, color: "#553C9A", bg: "#EBF8FF" },
            ].map((card) => (
              <Box key={card.label} bg={card.bg} borderRadius="8px" p="16px" textAlign="center">
                <Text fontSize="22px" fontWeight="700" color={card.color}>{card.value}</Text>
                <Text fontSize="12px" color="gray.600" mt="4px">{card.label}</Text>
              </Box>
            ))}
          </Grid>

          {/* Items Table */}
          <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
            <Flex px="20px" py="16px" borderBottom="1px solid #E2E8F0">
              <Text fontSize="16px" fontWeight="600" color="gray.700">
                Course Items ({items.length})
              </Text>
            </Flex>

            {items.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      {["Course Title", "Instructor", "Status", "Error Reason", "Created At"].map((h) => (
                        <Th key={h} py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((item) => (
                      <Tr key={item.id} _hover={{ bg: "#F7FAFC" }}>
                        <Td py="14px" fontSize="14px" fontWeight="500">{item.courseTitle || "—"}</Td>
                        <Td py="14px" fontSize="13px" color="gray.600">
                          {item.instructor
                            ? `${item.instructor.firstName} ${item.instructor.lastName}`
                            : "—"}
                        </Td>
                        <Td py="14px">{getStatusBadge(item.status)}</Td>
                        <Td py="14px" fontSize="13px" color="red.500" maxW="300px">
                          {item.errorReason ? (
                            <Tooltip label={item.errorReason} placement="top">
                              <Text noOfLines={1} cursor="help">{item.errorReason}</Text>
                            </Tooltip>
                          ) : "—"}
                        </Td>
                        <Td py="14px" fontSize="13px" color="gray.500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Flex justifyContent="center" py="40px">
                <Text color="gray.400">No items available.</Text>
              </Flex>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export const BulkCourseV2BatchDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BulkCourseV2BatchDetailsPage {...props} />} />
);

export default BulkCourseV2BatchDetailsPageRoute;
