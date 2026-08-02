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
} from "@chakra-ui/react";
import { FaArrowLeft, FaRedo } from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetBatchDetails,
  adminGetBatchProgress,
  adminRetryFailedBatch,
} from "../../../services";

const getStatusBadge = (status) => {
  const map = {
    COMPLETED: { bg: "#E6F4EA", color: "#38A169", label: "Completed" },
    CREATED: { bg: "#E6F4EA", color: "#38A169", label: "Created" },
    PROCESSING: { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
    PENDING: { bg: "#FFF5EA", color: "#DD6B20", label: "Pending" },
    ERROR: { bg: "#FED7D7", color: "#E53E3E", label: "Error" },
    FAILED: { bg: "#FED7D7", color: "#E53E3E", label: "Failed" },
  };
  const s = map[status] || { bg: "gray.100", color: "gray.600", label: status };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="12px"
      py="4px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
    >
      {s.label}
    </Badge>
  );
};

const BatchDetailsPage = () => {
  const history = useHistory();
  const { batchId } = useParams();
  const toast = useToast();

  const { resource, handleFetchResource } = useFetch();
  const [progress, setProgress] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const fetcher = useCallback(async () => {
    const { batch } = await adminGetBatchDetails(batchId);
    return { batch };
  }, [batchId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  // Poll progress if PROCESSING
  useEffect(() => {
    const batch = resource.data?.batch;
    if (!batch || batch.status !== "PROCESSING") return;

    const loadProgress = async () => {
      try {
        const { progress: p } = await adminGetBatchProgress(batchId);
        setProgress(p);
      } catch {
        // ignore
      }
    };

    loadProgress();
    const interval = setInterval(loadProgress, 5000);
    return () => clearInterval(interval);
  }, [batchId, resource.data]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const { message } = await adminRetryFailedBatch(batchId);
      toast({
        title: message || "Retry initiated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      handleFetchResource({ fetcher });
    } catch {
      toast({
        title: "Failed to retry batch",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRetrying(false);
    }
  };

  const batch = resource.data?.batch;

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/bulk-courses")}
        />
        <Heading fontSize="22px" fontWeight="600">
          Batch Details
        </Heading>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" py="60px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}

      {resource.err && (
        <Flex justifyContent="center" py="60px">
          <Text color="red.500">
            Failed to load batch details. Please try again.
          </Text>
        </Flex>
      )}

      {!resource.loading && !resource.err && batch && (
        <>
          {/* Batch Info Card */}
          <Box
            bg="white"
            borderRadius="8px"
            border="1px solid #E2E8F0"
            p="24px"
            mb="20px"
          >
            <Flex
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              gap="12px"
            >
              <Box>
                <Text fontSize="13px" color="gray.500" mb="2px">
                  Batch ID
                </Text>
                <Text fontSize="16px" fontWeight="600">
                  {batch.batchId}
                </Text>
              </Box>
              <Flex gap="12px" alignItems="center">
                {getStatusBadge(batch.status)}
                {batch.status === "ERROR" && (
                  <Button
                    size="sm"
                    colorScheme="orange"
                    leftIcon={<FaRedo />}
                    isLoading={retrying}
                    onClick={handleRetry}
                  >
                    Retry Batch
                  </Button>
                )}
              </Flex>
            </Flex>

            <Divider my="16px" />

            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
              gap="16px"
            >
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">
                  Department
                </Text>
                <Text fontSize="14px" fontWeight="500">
                  {batch.departmentName || batch.departmentId}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">
                  Template
                </Text>
                <Text fontSize="14px" fontWeight="500">
                  {batch.templateName || batch.templateId || "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">
                  Created At
                </Text>
                <Text fontSize="14px" fontWeight="500">
                  {batch.createdAt
                    ? new Date(batch.createdAt).toLocaleString()
                    : "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="4px">
                  Completed At
                </Text>
                <Text fontSize="14px" fontWeight="500">
                  {batch.completedAt
                    ? new Date(batch.completedAt).toLocaleString()
                    : "—"}
                </Text>
              </Box>
            </Grid>

            {/* Progress bar for PROCESSING batches */}
            {batch.status === "PROCESSING" && (
              <Box mt="20px">
                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="13px" color="gray.600">
                    {progress?.currentOperation || "Processing…"}
                  </Text>
                  <Text fontSize="13px" fontWeight="600" color="blue.500">
                    {progress
                      ? `${progress.progressPercentage.toFixed(1)}%`
                      : "—"}
                  </Text>
                </Flex>
                <Progress
                  value={progress?.progressPercentage || 0}
                  colorScheme="blue"
                  borderRadius="4px"
                  size="sm"
                  hasStripe
                  isAnimated
                />
                {progress && (
                  <Flex justifyContent="space-between" mt="6px">
                    <Text fontSize="12px" color="gray.500">
                      {progress.completedCourses} of {progress.totalCourses}{" "}
                      courses created
                    </Text>
                    <Text fontSize="12px" color="gray.500">
                      ETA: {progress.estimatedTimeRemaining}
                    </Text>
                  </Flex>
                )}
              </Box>
            )}
          </Box>

          {/* Courses Table */}
          <Box
            bg="white"
            borderRadius="8px"
            border="1px solid #E2E8F0"
            overflow="hidden"
          >
            <Flex
              px="20px"
              py="16px"
              justifyContent="space-between"
              alignItems="center"
              borderBottom="1px solid #E2E8F0"
            >
              <Text fontSize="16px" fontWeight="600" color="gray.700">
                Courses in Batch ({batch.totalCourses})
              </Text>
            </Flex>

            {batch.courses && batch.courses.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      <Th
                        py="14px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                      >
                        Course ID
                      </Th>
                      <Th
                        py="14px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                      >
                        Title
                      </Th>
                      <Th
                        py="14px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                      >
                        Status
                      </Th>
                      <Th
                        py="14px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                      >
                        Created At
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {batch.courses.map((course, i) => (
                      <Tr key={course.courseId || i} _hover={{ bg: "#F7FAFC" }}>
                        <Td py="14px" fontSize="13px" color="gray.500">
                          {course.courseId || "—"}
                        </Td>
                        <Td py="14px" fontSize="14px" fontWeight="500">
                          {course.title}
                        </Td>
                        <Td py="14px">{getStatusBadge(course.status)}</Td>
                        <Td py="14px" fontSize="13px" color="gray.500">
                          {course.createdAt
                            ? new Date(course.createdAt).toLocaleString()
                            : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Flex justifyContent="center" py="40px">
                <Text color="gray.400">No course details available.</Text>
              </Flex>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export const BatchDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BatchDetailsPage {...props} />} />
);

export default BatchDetailsPageRoute;
