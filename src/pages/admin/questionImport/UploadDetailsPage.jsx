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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaTimes,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetUploadDetails,
  adminGetFailedQuestions,
  adminCancelQuestionImport,
} from "../../../services";

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
      px="14px"
      py="5px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="13px"
    >
      {s.label}
    </Badge>
  );
};

const getErrorTypeBadge = (type) => {
  const map = {
    VALIDATION_ERROR: { bg: "#FFF5EA", color: "#DD6B20", label: "Validation" },
    FORMAT_ERROR: { bg: "#FED7D7", color: "#E53E3E", label: "Format" },
    MISSING_REQUIRED_FIELD: {
      bg: "#FED7D7",
      color: "#E53E3E",
      label: "Missing Field",
    },
  };
  const s = map[type] || { bg: "gray.100", color: "gray.600", label: type };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="10px"
      py="3px"
      borderRadius="10px"
      textTransform="none"
      fontSize="11px"
    >
      {s.label}
    </Badge>
  );
};

const StatItem = ({ label, value, color }) => (
  <Box textAlign="center">
    <Text fontSize="22px" fontWeight="700" color={color || "gray.800"}>
      {value ?? "—"}
    </Text>
    <Text fontSize="12px" color="gray.500" mt="2px">
      {label}
    </Text>
  </Box>
);

// ---------------------------------------------------------------------------
// Cancel Confirm Modal
// ---------------------------------------------------------------------------

const CancelModal = ({ isOpen, onClose, uploadId, onSuccess }) => {
  const toast = useToast();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { message } = await adminCancelQuestionImport(uploadId);
      toast({
        title: message || "Upload cancelled",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to cancel upload",
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
        <ModalHeader fontSize="16px">Cancel Upload</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Are you sure you want to cancel this upload? Questions already
            processed will be rolled back.
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Keep Running
          </Button>
          <Button colorScheme="red" onClick={handleCancel} isLoading={loading}>
            Cancel Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const UploadDetailsPage = () => {
  const history = useHistory();
  const { uploadId } = useParams();
  const toast = useToast();

  const { resource, handleFetchResource } = useFetch();
  const [failedData, setFailedData] = useState(null);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const cancelModal = useDisclosure();

  const fetcher = useCallback(async () => {
    const { upload } = await adminGetUploadDetails(uploadId);
    return { upload };
  }, [uploadId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const upload = resource.data?.upload;

  // Load failed questions when non-PROCESSING and has failures
  useEffect(() => {
    if (!upload || upload.failedImports === 0) return;
    if (upload.status === "PROCESSING") return;

    setLoadingErrors(true);
    adminGetFailedQuestions(uploadId)
      .then((data) => setFailedData(data))
      .catch(() =>
        toast({
          title: "Could not load error details",
          status: "warning",
          duration: 3000,
          isClosable: true,
        }),
      )
      .finally(() => setLoadingErrors(false));
  }, [upload, uploadId, toast]);

  const progressPct = upload
    ? upload.totalQuestions > 0
      ? Math.round((upload.processedQuestions / upload.totalQuestions) * 100)
      : 0
    : 0;

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/question-import")}
        />
        <Heading fontSize="22px" fontWeight="600">
          Import Details
        </Heading>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" py="60px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}
      {resource.err && (
        <Flex justifyContent="center" py="60px">
          <Text color="red.500">Failed to load upload details.</Text>
        </Flex>
      )}

      {!resource.loading && !resource.err && upload && (
        <>
          {/* Info card */}
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
              mb="20px"
            >
              <Box>
                <Text fontSize="18px" fontWeight="700">
                  {upload.fileName}
                </Text>
                <Text fontSize="13px" color="gray.500" mt="2px">
                  {upload.bankName} • {upload.courseName}
                </Text>
              </Box>
              <Flex gap="10px" alignItems="center">
                {getStatusBadge(upload.status)}
                {upload.status === "PROCESSING" && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<FaTimes />}
                    onClick={cancelModal.onOpen}
                  >
                    Cancel
                  </Button>
                )}
              </Flex>
            </Flex>

            {/* Progress bar for PROCESSING */}
            {upload.status === "PROCESSING" && (
              <Box mb="20px">
                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="13px" color="gray.600">
                    Processing questions…
                  </Text>
                  <Text fontSize="13px" fontWeight="600" color="blue.500">
                    {progressPct}%
                  </Text>
                </Flex>
                <Progress
                  value={progressPct}
                  colorScheme="blue"
                  borderRadius="4px"
                  size="sm"
                  hasStripe
                  isAnimated
                />
                <Text fontSize="12px" color="gray.500" mt="4px">
                  {upload.processedQuestions} of {upload.totalQuestions}{" "}
                  questions processed
                </Text>
              </Box>
            )}

            <Divider mb="20px" />

            {/* Stats row */}
            <Flex
              justifyContent="space-around"
              flexWrap="wrap"
              gap="16px"
              mb="20px"
            >
              <StatItem label="Total Questions" value={upload.totalQuestions} />
              <StatItem
                label="Processed"
                value={upload.processedQuestions}
                color="#3182CE"
              />
              <StatItem
                label="Successful"
                value={upload.successfulImports}
                color="#38A169"
              />
              <StatItem
                label="Failed"
                value={upload.failedImports}
                color={upload.failedImports > 0 ? "#E53E3E" : "gray.400"}
              />
              {upload.validationSummary && (
                <StatItem
                  label="Warnings"
                  value={upload.validationSummary.warnings}
                  color="#DD6B20"
                />
              )}
            </Flex>

            <Divider mb="16px" />

            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
              gap="16px"
            >
              <Box>
                <Text fontSize="12px" color="gray.500" mb="3px">
                  Bank ID
                </Text>
                <Text fontSize="13px" fontWeight="500">
                  {upload.bankId}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="3px">
                  Upload ID
                </Text>
                <Text fontSize="13px" fontWeight="500">
                  {upload.uploadId}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="3px">
                  Uploaded At
                </Text>
                <Text fontSize="13px" fontWeight="500">
                  {upload.uploadedAt
                    ? new Date(upload.uploadedAt).toLocaleString()
                    : "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="3px">
                  Completed At
                </Text>
                <Text fontSize="13px" fontWeight="500">
                  {upload.completedAt
                    ? new Date(upload.completedAt).toLocaleString()
                    : "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="3px">
                  Has Multimedia
                </Text>
                <Text fontSize="13px" fontWeight="500">
                  {upload.hasMultimedia ? "Yes" : "No"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="3px">
                  Uploaded By
                </Text>
                <Text fontSize="13px" fontWeight="500">
                  {upload.uploadedBy || "—"}
                </Text>
              </Box>
            </Grid>
          </Box>

          {/* Failed Questions Section */}
          {upload.failedImports > 0 && (
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
                <Flex alignItems="center" gap="8px">
                  <FaExclamationCircle color="#E53E3E" />
                  <Text fontSize="16px" fontWeight="600" color="gray.700">
                    Failed Questions ({upload.failedImports})
                  </Text>
                </Flex>
                {failedData?.errorSummary && (
                  <Flex gap="12px">
                    {failedData.errorSummary.validationErrors > 0 && (
                      <Text fontSize="12px" color="#DD6B20">
                        {failedData.errorSummary.validationErrors} validation
                        error
                        {failedData.errorSummary.validationErrors > 1
                          ? "s"
                          : ""}
                      </Text>
                    )}
                    {failedData.errorSummary.formatErrors > 0 && (
                      <Text fontSize="12px" color="#E53E3E">
                        {failedData.errorSummary.formatErrors} format error
                        {failedData.errorSummary.formatErrors > 1 ? "s" : ""}
                      </Text>
                    )}
                  </Flex>
                )}
              </Flex>

              {loadingErrors && (
                <Flex justifyContent="center" py="30px">
                  <Spinner size="md" color="red.400" />
                </Flex>
              )}

              {!loadingErrors && failedData?.errors && (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg="#FFF5F5">
                      <Tr>
                        <Th
                          py="12px"
                          color="gray.500"
                          fontSize="12px"
                          fontWeight="600"
                          textTransform="none"
                          w="60px"
                        >
                          Row
                        </Th>
                        <Th
                          py="12px"
                          color="gray.500"
                          fontSize="12px"
                          fontWeight="600"
                          textTransform="none"
                        >
                          Question Text
                        </Th>
                        <Th
                          py="12px"
                          color="gray.500"
                          fontSize="12px"
                          fontWeight="600"
                          textTransform="none"
                        >
                          Error Type
                        </Th>
                        <Th
                          py="12px"
                          color="gray.500"
                          fontSize="12px"
                          fontWeight="600"
                          textTransform="none"
                        >
                          Error Message
                        </Th>
                        <Th
                          py="12px"
                          color="gray.500"
                          fontSize="12px"
                          fontWeight="600"
                          textTransform="none"
                        >
                          Suggested Fix
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {failedData.errors.map((err, i) => (
                        <Tr key={i} _hover={{ bg: "#FFF5F5" }}>
                          <Td py="12px">
                            <Badge
                              bg="#FED7D7"
                              color="#E53E3E"
                              px="8px"
                              py="2px"
                              borderRadius="8px"
                              fontSize="12px"
                            >
                              #{err.rowNumber}
                            </Badge>
                          </Td>
                          <Td py="12px" fontSize="13px" maxW="200px">
                            <Text noOfLines={2} title={err.questionText}>
                              {err.questionText}
                            </Text>
                          </Td>
                          <Td py="12px">{getErrorTypeBadge(err.errorType)}</Td>
                          <Td py="12px" fontSize="13px" color="gray.600">
                            {err.errorMessage}
                          </Td>
                          <Td py="12px" fontSize="12px" color="#38A169">
                            {err.suggestedFix}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {upload.failedImports === 0 && upload.status === "SUCCESS" && (
            <Box bg="#E6F4EA" borderRadius="8px" p="16px">
              <Flex alignItems="center" gap="10px">
                <FaCheckCircle color="#38A169" size={18} />
                <Text fontSize="14px" color="#38A169" fontWeight="500">
                  All {upload.successfulImports} questions imported
                  successfully.
                </Text>
              </Flex>
            </Box>
          )}
        </>
      )}

      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={cancelModal.onClose}
        uploadId={uploadId}
        onSuccess={() => handleFetchResource({ fetcher })}
      />
    </Box>
  );
};

export const UploadDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <UploadDetailsPage {...props} />} />
);

export default UploadDetailsPageRoute;
