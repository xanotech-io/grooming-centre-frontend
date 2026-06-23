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
  BreadcrumbItem,
  Spinner,
  Select as ChakraSelect,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight, FaPlus, FaRedo, FaLayerGroup } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../../hooks";
import {
  adminGetBulkCourseV2Batches,
  adminRetryBulkCourseV2Batch,
} from "../../../../services";

const getStatusBadge = (status) => {
  const s = String(status).toLowerCase();
  const map = {
    completed:  { bg: "#E6F4EA", color: "#38A169", label: "Completed" },
    processing: { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
    pending:    { bg: "#FFF5EA", color: "#DD6B20", label: "Pending" },
    published:  { bg: "#EBF8FF", color: "#553C9A", label: "Published" },
    error:      { bg: "#FED7D7", color: "#E53E3E", label: "Error" },
    failed:     { bg: "#FED7D7", color: "#E53E3E", label: "Failed" },
  };
  const style = map[s] || { bg: "gray.100", color: "gray.600", label: status || "Unknown" };
  return (
    <Badge bg={style.bg} color={style.color} px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
      {style.label}
    </Badge>
  );
};

const BulkCourseV2ListingPage = () => {
  const history = useHistory();
  const toast = useToast();
  const { resource, handleFetchResource } = useFetch();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [retryingId, setRetryingId] = useState(null);

  const fetcher = useCallback(async () => {
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    const { batches, pagination } = await adminGetBulkCourseV2Batches(params);
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
      const { message } = await adminRetryBulkCourseV2Batch(batchId);
      toast({ title: message || "Retry initiated", status: "success", duration: 3000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to retry batch", status: "error", duration: 3000, isClosable: true });
    } finally {
      setRetryingId(null);
    }
  };

  const stats = {
    total: batches.length,
    pending: batches.filter((b) => String(b.status).toLowerCase() === "pending").length,
    processing: batches.filter((b) => String(b.status).toLowerCase() === "processing").length,
    completed: batches.filter((b) => String(b.status).toLowerCase() === "completed").length,
    error: batches.filter((b) => ["error", "failed"].includes(String(b.status).toLowerCase())).length,
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Bulk Course Creation</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Heading fontSize="22px" fontWeight="600">
          Bulk Course Creation
        </Heading>
        <Flex gap="12px">
          <Button
            leftIcon={<FaLayerGroup />}
            secondary
            onClick={() => history.push("/admin/bulk-courses/templates")}
          >
            Manage Templates
          </Button>
          <Button
            leftIcon={<FaPlus />}
            onClick={() => history.push("/admin/bulk-courses/create")}
          >
            Create New Batch
          </Button>
        </Flex>
      </Flex>

      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
        gap="16px"
        mb="24px"
      >
        {[
          { label: "Total Batches", value: stats.total, color: "#3182CE", bg: "#EBF4FF" },
          { label: "Pending", value: stats.pending, color: "#DD6B20", bg: "#FFF5EA" },
          { label: "Processing", value: stats.processing, color: "#3182CE", bg: "#EBF8FF" },
          { label: "Completed", value: stats.completed, color: "#38A169", bg: "#E6F4EA" },
          { label: "Error", value: stats.error, color: "#E53E3E", bg: "#FED7D7" },
        ].map((card) => (
          <Box key={card.label} bg={card.bg} borderRadius="8px" p="16px" textAlign="center">
            <Text fontSize="24px" fontWeight="700" color={card.color}>{card.value}</Text>
            <Text fontSize="12px" color="gray.600" mt="4px">{card.label}</Text>
          </Box>
        ))}
      </Grid>

      <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
        <Flex px="20px" py="16px" justifyContent="space-between" alignItems="center" borderBottom="1px solid #E2E8F0">
          <Text fontSize="16px" fontWeight="600" color="gray.700">All Batches</Text>
          <ChakraSelect
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            maxW="180px"
            size="sm"
            borderRadius="6px"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="PUBLISHED">Published</option>
            <option value="ERROR">Error</option>
          </ChakraSelect>
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>
        )}
        {resource.err && (
          <Flex justifyContent="center" py="40px">
            <Text color="red.500">Failed to load batches. Please try again.</Text>
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
                  {["Batch ID", "Department", "Template", "Total", "Completed", "Failed", "Status", "Created", "Actions"].map((h) => (
                    <Th key={h} py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {batches.map((batch) => (
                  <Tr
                    key={batch.id || batch.batchId}
                    _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                    onClick={() => history.push(`/admin/bulk-courses/${batch.id || batch.batchId}`)}
                  >
                    <Td py="14px" fontSize="13px" fontWeight="500">
                      {(batch.id || batch.batchId || "").slice(0, 12)}…
                    </Td>
                    <Td py="14px" fontSize="13px" color="gray.600">
                      {batch.department?.name || batch.departmentId || "—"}
                    </Td>
                    <Td py="14px" fontSize="13px" color="gray.600">
                      {batch.template?.name || batch.templateId || "—"}
                    </Td>
                    <Td py="14px" fontSize="14px">{batch.totalCourses ?? "—"}</Td>
                    <Td py="14px" fontSize="14px" color="#38A169">{batch.successfulCount ?? "—"}</Td>
                    <Td py="14px" fontSize="14px" color={batch.failedCount > 0 ? "#E53E3E" : "gray.600"}>
                      {batch.failedCount ?? "—"}
                    </Td>
                    <Td py="14px">{getStatusBadge(batch.status)}</Td>
                    <Td py="14px" fontSize="13px" color="gray.500">
                      {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : "—"}
                    </Td>
                    <Td py="14px" onClick={(e) => e.stopPropagation()}>
                      {["error", "failed"].includes(String(batch.status).toLowerCase()) && (
                        <IconButton
                          aria-label="Retry batch"
                          icon={<FaRedo />}
                          size="sm"
                          colorScheme="orange"
                          variant="ghost"
                          isLoading={retryingId === (batch.id || batch.batchId)}
                          onClick={() => handleRetry(batch.id || batch.batchId)}
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {pagination.totalPages > 1 && (
          <Flex justifyContent="flex-end" alignItems="center" px="20px" py="16px" gap="8px" borderTop="1px solid #E2E8F0">
            <IconButton
              aria-label="Previous page"
              icon={<FaChevronLeft />}
              size="sm"
              variant="ghost"
              isDisabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            />
            <Text fontSize="13px" color="gray.600">
              Page {pagination.page || page} of {pagination.totalPages}
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
    </AdminMainAreaWrapper>
  );
};

export const BulkCourseV2ListingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BulkCourseV2ListingPage {...props} />} />
);

export default BulkCourseV2ListingPageRoute;
