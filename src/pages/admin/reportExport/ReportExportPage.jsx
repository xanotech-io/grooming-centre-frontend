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
} from "@chakra-ui/react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaDownload,
  FaTrash,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
<<<<<<< Updated upstream
  FaFileAlt,
=======
>>>>>>> Stashed changes
} from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetAllExports,
  adminGetMyExports,
  adminCreateReportExport,
<<<<<<< Updated upstream
  adminImportReportTransfer,
=======
>>>>>>> Stashed changes
  adminDeleteExport,
  adminDownloadExport,
} from "../../../services";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getStatusBadge = (status) => {
  const map = {
    SUCCESS: { bg: "#E6F4EA", color: "#38A169", label: "Success" },
    PROCESSING: { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
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

const getFormatIcon = (format) => {
  switch (format) {
    case "PDF":
      return <FaFilePdf color="#E53E3E" />;
    case "EXCEL":
      return <FaFileExcel color="#38A169" />;
    case "CSV":
      return <FaFileCsv color="#D69E2E" />;
<<<<<<< Updated upstream
    case "JSON":
      return <FaFileAlt color="#805AD5" />;
=======
>>>>>>> Stashed changes
    default:
      return null;
  }
};

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

// ---------------------------------------------------------------------------
// Create Export Modal
// ---------------------------------------------------------------------------

const CreateExportModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
<<<<<<< Updated upstream
    operationType: "EXPORT",
    reportId: "",
    reportName: "",
    fileFormat: "EXCEL",
    sourceOrDestination: "dashboard",
=======
    reportId: "",
    reportName: "",
    exportFormat: "EXCEL",
>>>>>>> Stashed changes
    departmentId: "",
    courseId: "",
    dateFrom: "",
    dateTo: "",
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const reset = () =>
    setForm({
<<<<<<< Updated upstream
      operationType: "EXPORT",
      reportId: "",
      reportName: "",
      fileFormat: "EXCEL",
      sourceOrDestination: "dashboard",
=======
      reportId: "",
      reportName: "",
      exportFormat: "EXCEL",
>>>>>>> Stashed changes
      departmentId: "",
      courseId: "",
      dateFrom: "",
      dateTo: "",
    });

  const handleSubmit = async () => {
    if (!form.reportName.trim()) {
      toast({
        title: "Report name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

<<<<<<< Updated upstream
    const sourceOrDestination = form.sourceOrDestination.trim();
    if (!sourceOrDestination) {
      toast({
        title:
          form.operationType === "EXPORT"
            ? "Source is required"
            : "Source URL is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reportId = form.reportId.trim() || `REX-${Date.now()}`;
=======
    const reportId = form.reportId.trim() || `report-${Date.now()}`;
>>>>>>> Stashed changes
    const filters = {};
    if (form.departmentId.trim())
      filters.departmentId = form.departmentId.trim();
    if (form.courseId.trim()) filters.courseId = form.courseId.trim();
    if (form.dateFrom) filters.dateFrom = form.dateFrom;
    if (form.dateTo) filters.dateTo = form.dateTo;

    setLoading(true);
    try {
<<<<<<< Updated upstream
      const payload = {
        reportName: form.reportName.trim(),
        fileFormat: form.fileFormat,
        sourceOrDestination,
      };

      let message = "Transfer initiated";
      if (form.operationType === "EXPORT") {
        const response = await adminCreateReportExport(reportId, {
          reportName: payload.reportName,
          exportFormat: payload.fileFormat,
          sourceOrDestination: payload.sourceOrDestination,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        });
        message = response.message;
      } else {
        const response = await adminImportReportTransfer(payload);
        message = response.message;
      }

      toast({
        title: message || "Transfer initiated",
=======
      const { message } = await adminCreateReportExport(reportId, {
        reportName: form.reportName.trim(),
        exportFormat: form.exportFormat,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      toast({
        title: message || "Export initiated",
>>>>>>> Stashed changes
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      onSuccess();
      onClose();
    } catch {
      toast({
<<<<<<< Updated upstream
        title: "Failed to create transfer",
=======
        title: "Failed to create export",
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        <ModalHeader fontSize="16px">Create Report Transfer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <Flex gap="12px">
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Operation
                </FormLabel>
                <ChakraSelect
                  size="sm"
                  borderRadius="6px"
                  value={form.operationType}
                  onChange={(e) => update("operationType", e.target.value)}
                >
                  <option value="EXPORT">Export</option>
                  <option value="IMPORT">Import</option>
                </ChakraSelect>
              </FormControl>
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  File Format
                </FormLabel>
                <ChakraSelect
                  size="sm"
                  borderRadius="6px"
                  value={form.fileFormat}
                  onChange={(e) => update("fileFormat", e.target.value)}
                >
                  <option value="EXCEL">Excel (.xlsx)</option>
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                </ChakraSelect>
              </FormControl>
            </Flex>

=======
        <ModalHeader fontSize="16px">Create Report Export</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
>>>>>>> Stashed changes
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Report Name
              </FormLabel>
              <Input
                size="sm"
                borderRadius="6px"
                placeholder="e.g. Student Performance Report - Q4 2025"
                value={form.reportName}
                onChange={(e) => update("reportName", e.target.value)}
              />
            </FormControl>

            <Flex gap="12px">
<<<<<<< Updated upstream
              {form.operationType === "EXPORT" && (
                <FormControl flex="1">
                  <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                    Report ID (optional)
                  </FormLabel>
                  <Input
                    size="sm"
                    borderRadius="6px"
                    placeholder="REX-001"
                    value={form.reportId}
                    onChange={(e) => update("reportId", e.target.value)}
                  />
                </FormControl>
              )}
              <FormControl flex="1" isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  {form.operationType === "EXPORT" ? "Source" : "Source URL"}
=======
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Report ID (optional)
>>>>>>> Stashed changes
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
<<<<<<< Updated upstream
                  placeholder={
                    form.operationType === "EXPORT"
                      ? "dashboard or results"
                      : "https://storage.example.com/imports/q4_data.csv"
                  }
                  value={form.sourceOrDestination}
                  onChange={(e) => update("sourceOrDestination", e.target.value)}
=======
                  placeholder="report-uuid"
                  value={form.reportId}
                  onChange={(e) => update("reportId", e.target.value)}
                />
              </FormControl>
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Export Format
                </FormLabel>
                <ChakraSelect
                  size="sm"
                  borderRadius="6px"
                  value={form.exportFormat}
                  onChange={(e) => update("exportFormat", e.target.value)}
                >
                  <option value="EXCEL">Excel (.xlsx)</option>
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
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
                  Course ID
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
                  placeholder="course-uuid"
                  value={form.courseId}
                  onChange={(e) => update("courseId", e.target.value)}
>>>>>>> Stashed changes
                />
              </FormControl>
            </Flex>

<<<<<<< Updated upstream
            {form.operationType === "EXPORT" && (
              <>
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
                      Course ID
                    </FormLabel>
                    <Input
                      size="sm"
                      borderRadius="6px"
                      placeholder="course-uuid"
                      value={form.courseId}
                      onChange={(e) => update("courseId", e.target.value)}
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
              </>
            )}
=======
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
>>>>>>> Stashed changes
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
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating…"
          >
<<<<<<< Updated upstream
            Create Transfer
=======
            Create Export
>>>>>>> Stashed changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Delete Confirm Modal
// ---------------------------------------------------------------------------

const DeleteModal = ({ isOpen, onClose, exportItem, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { message } = await adminDeleteExport(exportItem.exportId);
      toast({
        title: message || "Export deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to delete export",
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
<<<<<<< Updated upstream
        <ModalHeader fontSize="16px">Delete Transfer</ModalHeader>
=======
        <ModalHeader fontSize="16px">Delete Export</ModalHeader>
>>>>>>> Stashed changes
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Are you sure you want to delete{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {exportItem?.reportName}
            </Text>
            ?
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDelete} isLoading={loading}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Exports Table (shared by both tabs)
// ---------------------------------------------------------------------------

const ExportsTable = ({ exports, showDownloadUrl, onDelete, onDownload }) => (
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
            Report Name
          </Th>
          <Th
            py="14px"
            color="gray.500"
            fontSize="12px"
            fontWeight="600"
            textTransform="none"
          >
<<<<<<< Updated upstream
            Operation
          </Th>
          <Th
            py="14px"
            color="gray.500"
            fontSize="12px"
            fontWeight="600"
            textTransform="none"
          >
=======
>>>>>>> Stashed changes
            Format
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
            Records
          </Th>
          <Th
            py="14px"
            color="gray.500"
            fontSize="12px"
            fontWeight="600"
            textTransform="none"
          >
            Size
          </Th>
          <Th
            py="14px"
            color="gray.500"
            fontSize="12px"
            fontWeight="600"
            textTransform="none"
          >
            Requested
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
        {exports.map((exp) => (
          <Tr key={exp.exportId} _hover={{ bg: "#F7FAFC" }}>
            <Td py="14px">
              <Text fontSize="14px" fontWeight="500">
                {exp.reportName}
              </Text>
              <Text fontSize="11px" color="gray.400">
                {exp.exportId}
              </Text>
            </Td>
<<<<<<< Updated upstream
            <Td py="14px" fontSize="13px" color="gray.600">
              {exp.operationType || "Export"}
            </Td>
=======
>>>>>>> Stashed changes
            <Td py="14px">
              <Flex alignItems="center" gap="6px">
                {getFormatIcon(exp.exportFormat)}
                <Text fontSize="13px">{exp.exportFormat}</Text>
              </Flex>
            </Td>
            <Td py="14px">
              {exp.status === "PROCESSING" ? (
                <Flex direction="column" gap="4px" minW="120px">
                  {getStatusBadge(exp.status)}
                  <Progress
                    size="xs"
                    isIndeterminate
                    colorScheme="blue"
                    borderRadius="2px"
                    mt="4px"
                  />
                </Flex>
              ) : (
                getStatusBadge(exp.status)
              )}
            </Td>
            <Td py="14px" fontSize="13px" color="gray.600">
              {exp.recordCount ?? "—"}
            </Td>
            <Td py="14px" fontSize="13px" color="gray.600">
              {formatBytes(exp.fileSize)}
            </Td>
            <Td py="14px" fontSize="13px" color="gray.500">
              {exp.requestedAt
                ? new Date(exp.requestedAt).toLocaleString()
                : "—"}
            </Td>
            <Td py="14px">
              <Flex gap="4px">
                {exp.status === "SUCCESS" && (
                  <IconButton
                    aria-label="Download"
                    icon={<FaDownload />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    title="Download"
                    onClick={() => onDownload(exp)}
                  />
                )}
                <IconButton
                  aria-label="Delete"
                  icon={<FaTrash />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  title="Delete"
                  onClick={() => onDelete(exp)}
                />
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

const ReportExportPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("all");

  // All exports tab
  const { resource: allResource, handleFetchResource: fetchAll } = useFetch();
  const [allPage, setAllPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  // My exports tab
  const { resource: myResource, handleFetchResource: fetchMy } = useFetch();
  const [myPage, setMyPage] = useState(1);

  // Modals
  const createModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selectedExport, setSelectedExport] = useState(null);

  // Polling ref for PROCESSING exports
  const pollingRef = useRef(null);

  // ---- Fetchers ----
  const allFetcher = useCallback(async () => {
    const params = { page: allPage, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    const { exports, pagination } = await adminGetAllExports(params);
    return { exports, pagination };
  }, [allPage, statusFilter]);

  const myFetcher = useCallback(async () => {
    const { exports, pagination } = await adminGetMyExports({
      page: myPage,
      limit: 10,
    });
    return { exports, pagination };
  }, [myPage]);

  useEffect(() => {
    if (activeTab === "all") fetchAll({ fetcher: allFetcher });
  }, [activeTab, fetchAll, allFetcher]);

  useEffect(() => {
    if (activeTab === "my") fetchMy({ fetcher: myFetcher });
  }, [activeTab, fetchMy, myFetcher]);

  // Poll every 5s if any PROCESSING exports exist
  useEffect(() => {
    const currentExports = allResource.data?.exports ?? [];
    const hasProcessing = currentExports.some((e) => e.status === "PROCESSING");

    if (hasProcessing && activeTab === "all") {
      pollingRef.current = setInterval(() => {
        fetchAll({ fetcher: allFetcher });
      }, 5000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [allResource.data, activeTab, fetchAll, allFetcher]);

  const handleDownload = async (exp) => {
    try {
      const { downloadUrl } = await adminDownloadExport(exp.exportId);
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

  const openDelete = (exp) => {
    setSelectedExport(exp);
    deleteModal.onOpen();
  };

  const onDeleteSuccess = () => {
    if (activeTab === "all") fetchAll({ fetcher: allFetcher });
    else fetchMy({ fetcher: myFetcher });
  };

  const onCreateSuccess = () => fetchAll({ fetcher: allFetcher });

  const allExports = allResource.data?.exports ?? [];
  const allPagination = allResource.data?.pagination ?? {};
  const myExports = myResource.data?.exports ?? [];
  const myPagination = myResource.data?.pagination ?? {};

  const stats = {
    total: allExports.length,
<<<<<<< Updated upstream
    exports: allExports.filter((e) => e.operationType === "Export").length,
    imports: allExports.filter((e) => e.operationType === "Import").length,
=======
    processing: allExports.filter((e) => e.status === "PROCESSING").length,
    success: allExports.filter((e) => e.status === "SUCCESS").length,
>>>>>>> Stashed changes
    failed: allExports.filter((e) => e.status === "FAILED").length,
  };

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
<<<<<<< Updated upstream
          Report Transfers
        </Heading>
        <Button leftIcon={<FaPlus />} onClick={createModal.onOpen}>
          Create Transfer
=======
          Report Exports
        </Heading>
        <Button leftIcon={<FaPlus />} onClick={createModal.onOpen}>
          Create Export
>>>>>>> Stashed changes
        </Button>
      </Flex>

      {/* Stats cards */}
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap="16px"
        mb="24px"
      >
        {[
          {
<<<<<<< Updated upstream
            label: "Total Transfers",
=======
            label: "Total Exports",
>>>>>>> Stashed changes
            value: stats.total,
            color: "#3182CE",
            bg: "#EBF4FF",
          },
          {
<<<<<<< Updated upstream
            label: "Exports",
            value: stats.exports,
            color: "#1C6AA8",
            bg: "#EBF8FF",
          },
          {
            label: "Imports",
            value: stats.imports,
            color: "#805AD5",
            bg: "#F5EEFF",
=======
            label: "Processing",
            value: stats.processing,
            color: "#3182CE",
            bg: "#EBF8FF",
          },
          {
            label: "Successful",
            value: stats.success,
            color: "#38A169",
            bg: "#E6F4EA",
>>>>>>> Stashed changes
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

      {/* Tabs container */}
      <Box
        bg="white"
        borderRadius="8px"
        border="1px solid #E2E8F0"
        overflow="hidden"
      >
        {/* Tab header with filter */}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid #E2E8F0"
          pr="20px"
        >
          <Flex>
            <Box {...tabStyle("all")} onClick={() => setActiveTab("all")}>
<<<<<<< Updated upstream
              All Transfers
            </Box>
            <Box {...tabStyle("my")} onClick={() => setActiveTab("my")}>
              My Transfers
=======
              All Exports
            </Box>
            <Box {...tabStyle("my")} onClick={() => setActiveTab("my")}>
              My Exports
>>>>>>> Stashed changes
            </Box>
          </Flex>
          {activeTab === "all" && (
            <ChakraSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setAllPage(1);
              }}
              maxW="160px"
              size="sm"
              borderRadius="6px"
            >
              <option value="">All Statuses</option>
              <option value="PROCESSING">Processing</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </ChakraSelect>
          )}
        </Flex>

        {/* ---------- ALL EXPORTS TAB ---------- */}
        {activeTab === "all" && (
          <>
            {allResource.loading && (
              <Flex justifyContent="center" py="40px">
                <Spinner size="lg" color="blue.500" />
              </Flex>
            )}
            {allResource.err && (
              <Flex justifyContent="center" py="40px">
<<<<<<< Updated upstream
                <Text color="red.500">Failed to load transfers.</Text>
=======
                <Text color="red.500">Failed to load exports.</Text>
>>>>>>> Stashed changes
              </Flex>
            )}
            {!allResource.loading &&
              !allResource.err &&
              allExports.length === 0 && (
                <Flex justifyContent="center" py="40px">
<<<<<<< Updated upstream
                  <Text color="gray.400">No transfers found.</Text>
=======
                  <Text color="gray.400">No exports found.</Text>
>>>>>>> Stashed changes
                </Flex>
              )}
            {!allResource.loading &&
              !allResource.err &&
              allExports.length > 0 && (
                <ExportsTable
                  exports={allExports}
                  onDelete={openDelete}
                  onDownload={handleDownload}
                />
              )}
            {allPagination.totalPages > 1 && (
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
                  isDisabled={allPage === 1}
                  onClick={() => setAllPage((p) => p - 1)}
                />
                <Text fontSize="13px" color="gray.600">
                  Page {allPagination.page} of {allPagination.totalPages}
                </Text>
                <IconButton
                  aria-label="Next"
                  icon={<FaChevronRight />}
                  size="sm"
                  variant="ghost"
                  isDisabled={allPage === allPagination.totalPages}
                  onClick={() => setAllPage((p) => p + 1)}
                />
              </Flex>
            )}
          </>
        )}

        {/* ---------- MY EXPORTS TAB ---------- */}
        {activeTab === "my" && (
          <>
            {myResource.loading && (
              <Flex justifyContent="center" py="40px">
                <Spinner size="lg" color="blue.500" />
              </Flex>
            )}
            {myResource.err && (
              <Flex justifyContent="center" py="40px">
<<<<<<< Updated upstream
                <Text color="red.500">Failed to load your transfers.</Text>
=======
                <Text color="red.500">Failed to load your exports.</Text>
>>>>>>> Stashed changes
              </Flex>
            )}
            {!myResource.loading &&
              !myResource.err &&
              myExports.length === 0 && (
                <Flex justifyContent="center" py="40px">
<<<<<<< Updated upstream
                  <Text color="gray.400">You have no transfers yet.</Text>
=======
                  <Text color="gray.400">You have no exports yet.</Text>
>>>>>>> Stashed changes
                </Flex>
              )}
            {!myResource.loading && !myResource.err && myExports.length > 0 && (
              <ExportsTable
                exports={myExports}
                showDownloadUrl
                onDelete={openDelete}
                onDownload={handleDownload}
              />
            )}
            {myPagination.totalPages > 1 && (
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
                  isDisabled={myPage === 1}
                  onClick={() => setMyPage((p) => p - 1)}
                />
                <Text fontSize="13px" color="gray.600">
                  Page {myPagination.page} of {myPagination.totalPages}
                </Text>
                <IconButton
                  aria-label="Next"
                  icon={<FaChevronRight />}
                  size="sm"
                  variant="ghost"
                  isDisabled={myPage === myPagination.totalPages}
                  onClick={() => setMyPage((p) => p + 1)}
                />
              </Flex>
            )}
          </>
        )}
      </Box>

      <CreateExportModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={onCreateSuccess}
      />
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        exportItem={selectedExport}
        onSuccess={onDeleteSuccess}
      />
    </Box>
  );
};

export const ReportExportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ReportExportPage {...props} />} />
);

export default ReportExportPageRoute;
