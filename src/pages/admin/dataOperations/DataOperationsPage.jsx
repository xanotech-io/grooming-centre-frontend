import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route } from "react-router-dom";
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
  IconButton,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Select as ChakraSelect,
  Divider,
  Switch,
} from "@chakra-ui/react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaFileAlt,
  FaBan,
} from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminImportData,
  adminExportData,
  adminGetMyOperations,
  adminDownloadOperationFile,
  adminCancelOperation,
} from "../../../services";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getStatusBadge = (status) => {
  const map = {
    pending: { bg: "#FEFCBF", color: "#744210", label: "Pending" },
    processing: { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
    completed: { bg: "#E6F4EA", color: "#38A169", label: "Completed" },
    failed: { bg: "#FED7D7", color: "#E53E3E", label: "Failed" },
  };
  const s =
    map[status?.toLowerCase()] || {
      bg: "gray.100",
      color: "gray.600",
      label: status,
    };
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

const getFormatIcon = (format) => {
  switch ((format || "").toLowerCase()) {
    case "pdf":
      return <FaFilePdf color="#E53E3E" />;
    case "xlsx":
    case "excel":
      return <FaFileExcel color="#38A169" />;
    case "csv":
      return <FaFileCsv color="#D69E2E" />;
    default:
      return <FaFileAlt color="#718096" />;
  }
};

// ---------------------------------------------------------------------------
// New Import Modal
// ---------------------------------------------------------------------------

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    type: "users",
    skipDuplicates: true,
    updateExisting: false,
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const reset = () => {
    setForm({ type: "users", skipDuplicates: true, updateExisting: false });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast({
        title: "Please select a file to import",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const { message } = await adminImportData({
        type: form.type,
        file,
        options: {
          skipDuplicates: form.skipDuplicates,
          updateExisting: form.updateExisting,
        },
      });
      toast({
        title: message || "Import job started",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to start import",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      isCentered
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">New Data Import</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Import Type
              </FormLabel>
              <ChakraSelect
                size="sm"
                borderRadius="6px"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="users">Users</option>
                <option value="courses">Courses</option>
                <option value="enrollments">Enrollments</option>
                <option value="grades">Grades</option>
              </ChakraSelect>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                File (CSV / Excel)
              </FormLabel>
              <Input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                size="sm"
                borderRadius="6px"
                p="4px"
              />
            </FormControl>

            <Divider />
            <Text
              fontSize="12px"
              fontWeight="600"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Options
            </Text>

            <Flex gap="24px">
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Skip Duplicates
                </FormLabel>
                <Flex alignItems="center" h="32px" gap="10px">
                  <Switch
                    isChecked={form.skipDuplicates}
                    onChange={(e) =>
                      update("skipDuplicates", e.target.checked)
                    }
                    colorScheme="blue"
                  />
                  <Text fontSize="13px" color="gray.600">
                    {form.skipDuplicates ? "Yes" : "No"}
                  </Text>
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Update Existing
                </FormLabel>
                <Flex alignItems="center" h="32px" gap="10px">
                  <Switch
                    isChecked={form.updateExisting}
                    onChange={(e) =>
                      update("updateExisting", e.target.checked)
                    }
                    colorScheme="blue"
                  />
                  <Text fontSize="13px" color="gray.600">
                    {form.updateExisting ? "Yes" : "No"}
                  </Text>
                </Flex>
              </FormControl>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            leftIcon={<FaUpload />}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Starting…"
          >
            Start Import
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// New Export Modal
// ---------------------------------------------------------------------------

const ExportModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "users",
    format: "xlsx",
    departmentId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const reset = () =>
    setForm({
      type: "users",
      format: "xlsx",
      departmentId: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (form.departmentId.trim())
        filters.departmentId = form.departmentId.trim();
      if (form.status.trim()) filters.status = form.status.trim();
      if (form.dateFrom) filters.dateFrom = form.dateFrom;
      if (form.dateTo) filters.dateTo = form.dateTo;

      const { message } = await adminExportData({
        type: form.type,
        format: form.format,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      toast({
        title: message || "Export job started",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to start export",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      isCentered
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">New Data Export</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <Flex gap="12px">
              <FormControl flex="1" isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Export Type
                </FormLabel>
                <ChakraSelect
                  size="sm"
                  borderRadius="6px"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option value="users">Users</option>
                  <option value="courses">Courses</option>
                  <option value="enrollments">Enrollments</option>
                  <option value="grades">Grades</option>
                  <option value="reports">Reports</option>
                </ChakraSelect>
              </FormControl>

              <FormControl flex="1" isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Format
                </FormLabel>
                <ChakraSelect
                  size="sm"
                  borderRadius="6px"
                  value={form.format}
                  onChange={(e) => update("format", e.target.value)}
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </ChakraSelect>
              </FormControl>
            </Flex>

            <Divider />
            <Text
              fontSize="12px"
              fontWeight="600"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Filters (optional)
            </Text>

            <Flex gap="12px">
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Department ID
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
                  placeholder="dept-uuid"
                  value={form.departmentId}
                  onChange={(e) => update("departmentId", e.target.value)}
                />
              </FormControl>

              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Status
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
                  placeholder="e.g. active"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                />
              </FormControl>
            </Flex>

            <Flex gap="12px">
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Date From
                </FormLabel>
                <Input
                  type="date"
                  size="sm"
                  borderRadius="6px"
                  value={form.dateFrom}
                  onChange={(e) => update("dateFrom", e.target.value)}
                />
              </FormControl>

              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Date To
                </FormLabel>
                <Input
                  type="date"
                  size="sm"
                  borderRadius="6px"
                  value={form.dateTo}
                  onChange={(e) => update("dateTo", e.target.value)}
                />
              </FormControl>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            leftIcon={<FaDownload />}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Starting…"
          >
            Start Export
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Cancel Confirm Modal
// ---------------------------------------------------------------------------

const CancelModal = ({ isOpen, onClose, operation, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { message } = await adminCancelOperation(operation.id);
      toast({
        title: message || "Operation cancelled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to cancel operation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Cancel Operation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Are you sure you want to cancel this{" "}
            <Text
              as="span"
              fontWeight="600"
              color="gray.800"
              textTransform="capitalize"
            >
              {operation?.operationType}
            </Text>{" "}
            job for{" "}
            <Text
              as="span"
              fontWeight="600"
              color="gray.800"
              textTransform="capitalize"
            >
              {operation?.type}
            </Text>
            ?
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Dismiss
          </Button>
          <Button
            colorScheme="red"
            onClick={handleCancel}
            isLoading={loading}
          >
            Cancel Job
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Operations Table
// ---------------------------------------------------------------------------

const OperationsTable = ({ operations, onCancel, onDownload }) => (
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
            Data Type
          </Th>
          <Th
            py="14px"
            color="gray.500"
            fontSize="12px"
            fontWeight="600"
            textTransform="none"
          >
            Operation
          </Th>
          <Th
            py="14px"
            color="gray.500"
            fontSize="12px"
            fontWeight="600"
            textTransform="none"
          >
            Format / File
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
            Created
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
            Actions
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {operations.map((op) => (
          <Tr key={op.id} _hover={{ bg: "#F7FAFC" }}>
            <Td py="14px">
              <Text
                fontSize="13px"
                fontWeight="500"
                textTransform="capitalize"
              >
                {op.type}
              </Text>
              <Text fontSize="11px" color="gray.400">
                {op.id}
              </Text>
            </Td>
            <Td py="14px">
              <Badge
                bg={
                  op.operationType === "import" ? "#FAF5FF" : "#EBF4FF"
                }
                color={
                  op.operationType === "import" ? "#6B46C1" : "#2B6CB0"
                }
                px="10px"
                py="3px"
                borderRadius="10px"
                textTransform="none"
                fontWeight="500"
                fontSize="12px"
              >
                {op.operationType === "import" ? "Import" : "Export"}
              </Badge>
            </Td>
            <Td py="14px">
              {op.operationType === "export" ? (
                <Flex alignItems="center" gap="6px">
                  {getFormatIcon(op.format)}
                  <Text fontSize="13px">
                    {(op.format || "").toUpperCase()}
                  </Text>
                </Flex>
              ) : (
                <Text fontSize="13px" color="gray.600">
                  {op.fileName || "—"}
                </Text>
              )}
            </Td>
            <Td py="14px">
              {op.status === "processing" ? (
                <Flex direction="column" gap="4px" minW="110px">
                  {getStatusBadge(op.status)}
                  <Progress
                    size="xs"
                    isIndeterminate
                    colorScheme="blue"
                    borderRadius="2px"
                    mt="4px"
                  />
                </Flex>
              ) : (
                getStatusBadge(op.status)
              )}
            </Td>
            <Td py="14px" fontSize="13px" color="gray.500">
              {op.createdAt
                ? new Date(op.createdAt).toLocaleString()
                : "—"}
            </Td>
            <Td py="14px" fontSize="13px" color="gray.500">
              {op.completedAt
                ? new Date(op.completedAt).toLocaleString()
                : "—"}
            </Td>
            <Td py="14px">
              <Flex gap="4px">
                {op.operationType === "export" &&
                  op.status === "completed" &&
                  op.downloadUrl && (
                    <IconButton
                      aria-label="Download"
                      icon={<FaDownload />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      title="Download"
                      onClick={() => onDownload(op)}
                    />
                  )}
                {(op.status === "pending" || op.status === "processing") && (
                  <IconButton
                    aria-label="Cancel"
                    icon={<FaBan />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    title="Cancel"
                    onClick={() => onCancel(op)}
                  />
                )}
              </Flex>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const DataOperationsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const { resource, handleFetchResource } = useFetch();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOp, setSelectedOp] = useState(null);
  const importModal = useDisclosure();
  const exportModal = useDisclosure();
  const cancelModal = useDisclosure();
  const pollingRef = useRef(null);

  const fetcher = useCallback(async () => {
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    const { operations, pagination } = await adminGetMyOperations(params);
    return { operations, pagination };
  }, [page, statusFilter]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const allOps = resource.data?.operations ?? [];

  // Poll every 5s while any jobs are still in-progress
  useEffect(() => {
    const hasActive = allOps.some(
      (op) => op.status === "pending" || op.status === "processing"
    );
    if (hasActive) {
      pollingRef.current = setInterval(() => {
        handleFetchResource({ fetcher });
      }, 5000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [allOps, handleFetchResource, fetcher]);

  const pagination = resource.data?.pagination ?? {};

  const displayedOps =
    activeTab === "imports"
      ? allOps.filter((op) => op.operationType === "import")
      : activeTab === "exports"
      ? allOps.filter((op) => op.operationType === "export")
      : allOps;

  const stats = {
    total: allOps.length,
    pending: allOps.filter((op) => op.status === "pending").length,
    completed: allOps.filter((op) => op.status === "completed").length,
    failed: allOps.filter((op) => op.status === "failed").length,
  };

  const handleDownload = async (op) => {
    try {
      const { downloadUrl } = await adminDownloadOperationFile(op.id);
      window.open(downloadUrl, "_blank");
    } catch {
      toast({
        title: "Download failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openCancel = (op) => {
    setSelectedOp(op);
    cancelModal.onOpen();
  };

  const refresh = () => handleFetchResource({ fetcher });

  const tabStyle = (tab) => ({
    px: "20px",
    py: "10px",
    fontSize: "14px",
    fontWeight: activeTab === tab ? "600" : "400",
    color: activeTab === tab ? "blue.600" : "gray.500",
    borderBottom: activeTab === tab ? "2px solid" : "2px solid transparent",
    borderColor: activeTab === tab ? "blue.500" : "transparent",
    cursor: "pointer",
  });

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Heading fontSize="22px" fontWeight="600">
          Data Operations
        </Heading>
        <Flex gap="10px">
          <Button
            variant="outline"
            leftIcon={<FaUpload />}
            onClick={importModal.onOpen}
          >
            New Import
          </Button>
          <Button leftIcon={<FaDownload />} onClick={exportModal.onOpen}>
            New Export
          </Button>
        </Flex>
      </Flex>

      {/* Stats cards */}
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap="16px"
        mb="24px"
      >
        {[
          {
            label: "Total Operations",
            value: stats.total,
            color: "#3182CE",
            bg: "#EBF4FF",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "#744210",
            bg: "#FEFCBF",
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "#38A169",
            bg: "#E6F4EA",
          },
          {
            label: "Failed",
            value: stats.failed,
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

      {/* Tab container */}
      <Box
        bg="white"
        borderRadius="8px"
        border="1px solid #E2E8F0"
        overflow="hidden"
      >
        {/* Tab header + filter */}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid #E2E8F0"
          pr="20px"
        >
          <Flex>
            <Box {...tabStyle("all")} onClick={() => setActiveTab("all")}>
              All
            </Box>
            <Box
              {...tabStyle("imports")}
              onClick={() => setActiveTab("imports")}
            >
              Imports
            </Box>
            <Box
              {...tabStyle("exports")}
              onClick={() => setActiveTab("exports")}
            >
              Exports
            </Box>
          </Flex>
          <ChakraSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            maxW="160px"
            size="sm"
            borderRadius="6px"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </ChakraSelect>
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" py="40px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        )}
        {resource.err && (
          <Flex justifyContent="center" py="40px">
            <Text color="red.500">Failed to load operations.</Text>
          </Flex>
        )}
        {!resource.loading && !resource.err && displayedOps.length === 0 && (
          <Flex justifyContent="center" py="40px">
            <Text color="gray.400">No operations found.</Text>
          </Flex>
        )}
        {!resource.loading && !resource.err && displayedOps.length > 0 && (
          <OperationsTable
            operations={displayedOps}
            onCancel={openCancel}
            onDownload={handleDownload}
          />
        )}

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
              aria-label="Prev"
              icon={<FaChevronLeft />}
              size="sm"
              variant="ghost"
              isDisabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            />
            <Text fontSize="13px" color="gray.600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Text>
            <IconButton
              aria-label="Next"
              icon={<FaChevronRight />}
              size="sm"
              variant="ghost"
              isDisabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            />
          </Flex>
        )}
      </Box>

      <ImportModal
        isOpen={importModal.isOpen}
        onClose={importModal.onClose}
        onSuccess={refresh}
      />
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={exportModal.onClose}
        onSuccess={refresh}
      />
      {selectedOp && (
        <CancelModal
          isOpen={cancelModal.isOpen}
          onClose={cancelModal.onClose}
          operation={selectedOp}
          onSuccess={refresh}
        />
      )}
    </Box>
  );
};

export const DataOperationsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <DataOperationsPage {...props} />} />
);

export default DataOperationsPageRoute;
