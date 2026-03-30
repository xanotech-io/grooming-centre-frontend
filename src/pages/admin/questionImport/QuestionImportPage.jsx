import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Progress,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Switch,
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
} from "@chakra-ui/react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
  FaDownload,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetAllQuestionImports,
  adminImportQuestions,
  adminGetQuestionImportTemplate,
} from "../../../services";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getStatusBadge = (status) => {
  const map = {
    SUCCESS: { bg: "#E6F4EA", color: "#38A169", label: "Success" },
    PARTIAL: { bg: "#FFF5EA", color: "#DD6B20", label: "Partial" },
    PROCESSING: { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
    ERROR: { bg: "#FED7D7", color: "#E53E3E", label: "Error" },
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

// ---------------------------------------------------------------------------
// Upload Modal
// ---------------------------------------------------------------------------

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bankId: "",
    fileName: "",
    fileUrl: "",
    totalQuestions: 10,
    hasMultimedia: false,
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const reset = () =>
    setForm({
      bankId: "",
      fileName: "",
      fileUrl: "",
      totalQuestions: 10,
      hasMultimedia: false,
    });

  const handleSubmit = async () => {
    if (!form.bankId.trim()) {
      toast({
        title: "Question Bank ID is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!form.fileName.trim() || !form.fileUrl.trim()) {
      toast({
        title: "File name and URL are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const { message } = await adminImportQuestions(form.bankId.trim(), {
        fileName: form.fileName.trim(),
        fileUrl: form.fileUrl.trim(),
        totalQuestions: Number(form.totalQuestions) || 10,
        hasMultimedia: form.hasMultimedia,
      });
      toast({
        title: message || "Upload initiated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to start upload",
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
        <ModalHeader fontSize="16px">
          Upload Questions (Bulk Import)
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Question Bank ID
              </FormLabel>
              <Input
                size="sm"
                borderRadius="6px"
                placeholder="bank-uuid-123"
                value={form.bankId}
                onChange={(e) => update("bankId", e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                File Name
              </FormLabel>
              <Input
                size="sm"
                borderRadius="6px"
                placeholder="e.g. Midterm_Questions_Batch1.csv"
                value={form.fileName}
                onChange={(e) => update("fileName", e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                File URL
              </FormLabel>
              <Input
                size="sm"
                borderRadius="6px"
                placeholder="https://storage.example.com/uploads/..."
                value={form.fileUrl}
                onChange={(e) => update("fileUrl", e.target.value)}
              />
            </FormControl>

            <Flex gap="12px" alignItems="flex-end">
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Total Questions
                </FormLabel>
                <NumberInput
                  size="sm"
                  min={1}
                  value={form.totalQuestions}
                  onChange={(val) => update("totalQuestions", val)}
                >
                  <NumberInputField borderRadius="6px" />
                </NumberInput>
              </FormControl>
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Has Multimedia
                </FormLabel>
                <Flex alignItems="center" h="32px" gap="10px">
                  <Switch
                    isChecked={form.hasMultimedia}
                    onChange={(e) => update("hasMultimedia", e.target.checked)}
                    colorScheme="blue"
                  />
                  <Text fontSize="13px" color="gray.600">
                    {form.hasMultimedia ? "Yes" : "No"}
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
            loadingText="Uploading…"
          >
            Start Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const QuestionImportPage = () => {
  const history = useHistory();
  const toast = useToast();
  const { resource, handleFetchResource } = useFetch();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [template, setTemplate] = useState(null);
  const uploadModal = useDisclosure();
  const pollingRef = useRef(null);

  const fetcher = useCallback(async () => {
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    const { uploads, pagination } = await adminGetAllQuestionImports(params);
    return { uploads, pagination };
  }, [page, statusFilter]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  // Load template info on mount
  useEffect(() => {
    adminGetQuestionImportTemplate()
      .then(({ template: t }) => setTemplate(t))
      .catch(() => {});
  }, []);

  // Poll every 5s when PROCESSING uploads exist
  const uploads = useMemo(() => resource.data?.uploads ?? [], [resource.data?.uploads]);
  useEffect(() => {
    const hasProcessing = uploads.some((u) => u.status === "PROCESSING");
    if (hasProcessing) {
      pollingRef.current = setInterval(() => {
        handleFetchResource({ fetcher });
      }, 5000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [uploads, handleFetchResource, fetcher]);

  const pagination = resource.data?.pagination ?? {};

  const stats = {
    total: uploads.length,
    processing: uploads.filter((u) => u.status === "PROCESSING").length,
    success: uploads.filter((u) => u.status === "SUCCESS").length,
    partial: uploads.filter((u) => u.status === "PARTIAL").length,
    error: uploads.filter((u) => u.status === "ERROR").length,
  };

  const handleDownloadTemplate = () => {
    if (template?.downloadUrl) {
      window.open(template.downloadUrl, "_blank");
    } else {
      toast({
        title: "Template URL not available",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Heading fontSize="22px" fontWeight="600">
          Question Upload (Bulk Import)
        </Heading>
        <Flex gap="10px">
          <Button
            variant="outline"
            leftIcon={<FaDownload />}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
          <Button leftIcon={<FaUpload />} onClick={uploadModal.onOpen}>
            Upload Questions
          </Button>
        </Flex>
      </Flex>

      {/* Template hint */}
      {template && (
        <Box
          bg="#EBF4FF"
          border="1px solid #BEE3F8"
          borderRadius="8px"
          p="12px 16px"
          mb="20px"
        >
          <Text fontSize="13px" color="#2B6CB0" fontWeight="500" mb="4px">
            Required CSV columns:
          </Text>
          <Text fontSize="12px" color="#2C5282">
            {template.requiredColumns.join(", ")}{" "}
            <Text as="span" color="#718096">
              + optional: {template.optionalColumns.join(", ")}
            </Text>
          </Text>
          <Text fontSize="12px" color="#718096" mt="4px">
            Supported types: {template.questionTypes?.join(", ")} • Difficulty
            levels: {template.difficultyLevels?.join(", ")}
          </Text>
        </Box>
      )}

      {/* Stats cards */}
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
        gap="16px"
        mb="24px"
      >
        {[
          {
            label: "Total Uploads",
            value: stats.total,
            color: "#3182CE",
            bg: "#EBF4FF",
          },
          {
            label: "Processing",
            value: stats.processing,
            color: "#3182CE",
            bg: "#EBF8FF",
          },
          {
            label: "Success",
            value: stats.success,
            color: "#38A169",
            bg: "#E6F4EA",
          },
          {
            label: "Partial",
            value: stats.partial,
            color: "#DD6B20",
            bg: "#FFF5EA",
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

      {/* Table */}
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
            All Imports
          </Text>
          <ChakraSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            maxW="170px"
            size="sm"
            borderRadius="6px"
          >
            <option value="">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCESS">Success</option>
            <option value="PARTIAL">Partial</option>
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
            <Text color="red.500">Failed to load imports.</Text>
          </Flex>
        )}
        {!resource.loading && !resource.err && uploads.length === 0 && (
          <Flex justifyContent="center" py="40px">
            <Text color="gray.400">No uploads found.</Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && uploads.length > 0 && (
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
                    File Name
                  </Th>
                  <Th
                    py="14px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Question Bank
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
                    Imported
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
                    Uploaded
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {uploads.map((upload) => (
                  <Tr
                    key={upload.uploadId}
                    _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                    onClick={() =>
                      history.push(`/admin/question-import/${upload.uploadId}`)
                    }
                  >
                    <Td py="14px">
                      <Text fontSize="14px" fontWeight="500">
                        {upload.fileName}
                      </Text>
                      <Text fontSize="11px" color="gray.400">
                        {upload.uploadId}
                      </Text>
                    </Td>
                    <Td py="14px">
                      <Text fontSize="13px" fontWeight="500">
                        {upload.bankName}
                      </Text>
                      <Text fontSize="11px" color="gray.400">
                        {upload.courseName}
                      </Text>
                    </Td>
                    <Td py="14px" fontSize="13px">
                      {upload.totalQuestions}
                    </Td>
                    <Td py="14px" fontSize="13px" color="#38A169">
                      {upload.successfulImports}
                    </Td>
                    <Td py="14px" fontSize="13px">
                      {upload.failedImports > 0 ? (
                        <Flex alignItems="center" gap="4px" color="#E53E3E">
                          <FaExclamationTriangle size={11} />
                          <Text>{upload.failedImports}</Text>
                        </Flex>
                      ) : (
                        <Text color="gray.400">0</Text>
                      )}
                    </Td>
                    <Td py="14px">
                      {upload.status === "PROCESSING" ? (
                        <Flex direction="column" gap="4px" minW="110px">
                          {getStatusBadge(upload.status)}
                          <Progress
                            value={
                              upload.processedQuestions && upload.totalQuestions
                                ? (upload.processedQuestions /
                                    upload.totalQuestions) *
                                  100
                                : 0
                            }
                            size="xs"
                            colorScheme="blue"
                            borderRadius="2px"
                            mt="2px"
                          />
                        </Flex>
                      ) : (
                        getStatusBadge(upload.status)
                      )}
                    </Td>
                    <Td py="14px" fontSize="13px" color="gray.500">
                      {new Date(upload.uploadedAt).toLocaleDateString()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
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
              Page {pagination.page} of {pagination.totalPages}
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

      <UploadModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.onClose}
        onSuccess={() => handleFetchResource({ fetcher })}
      />
    </Box>
  );
};

export const QuestionImportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <QuestionImportPage {...props} />} />
);

export default QuestionImportPageRoute;
