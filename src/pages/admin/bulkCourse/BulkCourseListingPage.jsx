import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
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
  Select as ChakraSelect,
  IconButton,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight, FaPlus, FaRedo } from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetBulkCourseBatches,
  adminRetryFailedBatch,
} from "../../../services";

const getStatusBadge = (status) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge
          bg="#E6F4EA"
          color="#38A169"
          px="12px"
          py="4px"
          borderRadius="12px"
          textTransform="none"
          fontWeight="500"
        >
          Completed
        </Badge>
      );
    case "PROCESSING":
      return (
        <Badge
          bg="#EBF4FF"
          color="#3182CE"
          px="12px"
          py="4px"
          borderRadius="12px"
          textTransform="none"
          fontWeight="500"
        >
          Processing
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          bg="#FFF5EA"
          color="#DD6B20"
          px="12px"
          py="4px"
          borderRadius="12px"
          textTransform="none"
          fontWeight="500"
        >
          Pending
        </Badge>
      );
    case "ERROR":
      return (
        <Badge
          bg="#FED7D7"
          color="#E53E3E"
          px="12px"
          py="4px"
          borderRadius="12px"
          textTransform="none"
          fontWeight="500"
        >
          Error
        </Badge>
      );
    default:
      return (
        <Badge px="12px" py="4px" borderRadius="12px" textTransform="none">
          {status}
        </Badge>
      );
  }
};

const BulkCourseListingPage = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [retryingId, setRetryingId] = useState(null);

  const fetcher = useCallback(async () => {
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    const { batches, pagination } = await adminGetBulkCourseBatches(params);
    return { batches, pagination };
  }, [page, statusFilter]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const batches = resource.data?.batches ?? [];
  const pagination = resource.data?.pagination ?? {};

  const handleRetry = async (batchId) => {
    setRetryingId(batchId);
    try {
      await adminRetryFailedBatch(batchId);
      handleFetchResource({ fetcher });
    } finally {
      setRetryingId(null);
    }
  };

  const stats = {
    total: batches.length,
    pending: batches.filter((b) => b.status === "PENDING").length,
    processing: batches.filter((b) => b.status === "PROCESSING").length,
    completed: batches.filter((b) => b.status === "COMPLETED").length,
    error: batches.filter((b) => b.status === "ERROR").length,
  };

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Heading fontSize="22px" fontWeight="600">
          Bulk Course Creation
        </Heading>
        <Button
          leftIcon={<FaPlus />}
          onClick={() => history.push("/admin/bulk-courses/create")}
        >
          Create New Batch
        </Button>
      </Flex>

      {/* Stats cards */}
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
        gap="16px"
        mb="24px"
      >
        {[
          {
            label: "Total Batches",
            value: stats.total,
            color: "#3182CE",
            bg: "#EBF4FF",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "#DD6B20",
            bg: "#FFF5EA",
          },
          {
            label: "Processing",
            value: stats.processing,
            color: "#3182CE",
            bg: "#EBF8FF",
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "#38A169",
            bg: "#E6F4EA",
          },
          {
            label: "Error",
            value: stats.error,
            color: "#E53E3E",
            bg: "#FED7D7",
          },
        ].map((card) => (
          <Box
            key={card.label}
            bg={card.bg}
            borderRadius="8px"
            p="16px"
            textAlign="center"
          >
            <Text fontSize="24px" fontWeight="700" color={card.color}>
              {card.value}
            </Text>
            <Text fontSize="12px" color="gray.600" mt="4px">
              {card.label}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Table container */}
      <Box
        bg="white"
        borderRadius="8px"
        border="1px solid #E2E8F0"
        overflow="hidden"
      >
        {/* Filter bar */}
        <Flex
          px="20px"
          py="16px"
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid #E2E8F0"
        >
          <Text fontSize="16px" fontWeight="600" color="gray.700">
            All Batches
          </Text>
          <ChakraSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            maxW="180px"
            size="sm"
            borderRadius="6px"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="ERROR">Error</option>
          </ChakraSelect>
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" py="40px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        )}

        {resource.err && (
          <Flex justifyContent="center" py="40px">
            <Text color="red.500">
              Failed to load batches. Please try again.
            </Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && batches.length === 0 && (
          <Flex justifyContent="center" py="40px">
            <Text color="gray.400">No batches found.</Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && batches.length > 0 && (
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
                    Batch ID
                  </Th>
                  <Th
                    py="14px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Department ID
                  </Th>
                  <Th
                    py="14px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Total
                  </Th>
                  <Th
                    py="14px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Completed
                  </Th>
                  <Th
                    py="14px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Failed
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
                  <Th
                    py="14px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {batches.map((batch) => (
                  <Tr
                    key={batch.batchId}
                    _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                    onClick={() =>
                      history.push(`/admin/bulk-courses/${batch.batchId}`)
                    }
                  >
                    <Td py="14px" fontSize="14px" fontWeight="500">
                      {batch.batchId}
                    </Td>
                    <Td py="14px" fontSize="14px" color="gray.600">
                      {batch.departmentId}
                    </Td>
                    <Td py="14px" fontSize="14px">
                      {batch.totalCourses}
                    </Td>
                    <Td py="14px" fontSize="14px" color="#38A169">
                      {batch.completedCourses}
                    </Td>
                    <Td
                      py="14px"
                      fontSize="14px"
                      color={batch.failedCourses > 0 ? "#E53E3E" : "gray.600"}
                    >
                      {batch.failedCourses}
                    </Td>
                    <Td py="14px">{getStatusBadge(batch.status)}</Td>
                    <Td py="14px" fontSize="13px" color="gray.500">
                      {batch.createdAt
                        ? new Date(batch.createdAt).toLocaleDateString()
                        : "—"}
                    </Td>
                    <Td py="14px" onClick={(e) => e.stopPropagation()}>
                      {batch.status === "ERROR" && (
                        <IconButton
                          aria-label="Retry batch"
                          icon={<FaRedo />}
                          size="sm"
                          colorScheme="orange"
                          variant="ghost"
                          isLoading={retryingId === batch.batchId}
                          onClick={() => handleRetry(batch.batchId)}
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Flex
            justifyContent="flex-end"
            alignItems="center"
            px="20px"
            py="16px"
            gap="8px"
            borderTop="1px solid #E2E8F0"
          >
            <IconButton
              aria-label="Previous page"
              icon={<FaChevronLeft />}
              size="sm"
              variant="ghost"
              isDisabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            />
            <Text fontSize="13px" color="gray.600">
              Page {pagination.page} of {pagination.totalPages}
            </Text>
            <IconButton
              aria-label="Next page"
              icon={<FaChevronRight />}
              size="sm"
              variant="ghost"
              isDisabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            />
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export const BulkCourseListingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BulkCourseListingPage {...props} />} />
);

export default BulkCourseListingPageRoute;
