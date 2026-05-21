import React from "react";
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FaTrash, FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import DocumentStatusBadge from "./DocumentStatusBadge";

const DOC_TYPE_LABELS = {
  CERTIFICATE: "Certificate",
  REGISTRATION_SHEET: "Registration Sheet",
  EVALUATION_FORM: "Evaluation Form",
  IDENTITY_DOCUMENT: "Identity Document",
};

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const TH = ({ children }) => (
  <Th
    py="14px"
    color="gray.500"
    fontSize="12px"
    fontWeight="600"
    textTransform="none"
  >
    {children}
  </Th>
);

const DocumentTable = ({
  documents,
  loading,
  error,
  emptyMessage,
  pagination,
  page,
  onPageChange,
  onView,
  onVerify,
  onReject,
  onDelete,
}) => {
  if (loading) {
    return (
      <Flex justifyContent="center" py="48px">
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" py="48px">
        <Text color="red.500">Failed to load documents. Please try again.</Text>
      </Flex>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Flex
        justifyContent="center"
        py="48px"
        direction="column"
        alignItems="center"
        gap="8px"
      >
        <Text color="gray.400">{emptyMessage || "No documents found."}</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead bg="#F7FAFC">
            <Tr>
              <TH>Upload ID</TH>
              <TH>Student</TH>
              <TH>Document Type</TH>
              <TH>File Name</TH>
              <TH>Format</TH>
              <TH>Size</TH>
              <TH>Course</TH>
              <TH>Uploaded By</TH>
              <TH>Upload Date</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </Tr>
          </Thead>
          <Tbody>
            {documents.map((doc) => (
              <Tr key={doc.uploadId} _hover={{ bg: "#F7FAFC" }}>
                <Td py="14px" fontSize="12px" color="gray.500" fontFamily="mono">
                  {doc.uploadId}
                </Td>
                <Td py="14px" fontSize="13px" fontWeight="500" color="gray.800">
                  {doc.userName || doc.userId || "—"}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.600">
                  {DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
                </Td>
                <Td py="14px" fontSize="13px">
                  {doc.fileName}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.500">
                  {doc.fileFormat || "—"}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.500">
                  {formatBytes(doc.fileSize)}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.500">
                  {doc.courseId || "—"}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.600">
                  {doc.uploadedBy || "—"}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.500">
                  {doc.uploadDate
                    ? new Date(doc.uploadDate).toLocaleDateString()
                    : "—"}
                </Td>
                <Td py="14px">
                  <DocumentStatusBadge
                    status={doc.verificationStatus || doc.status}
                  />
                </Td>
                <Td py="14px">
                  <Flex gap="4px">
                    <IconButton
                      aria-label="View document"
                      icon={<FaEye />}
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                      title="View & Review"
                      onClick={() => onView(doc)}
                    />
                    <IconButton
                      aria-label="Delete document"
                      icon={<FaTrash />}
                      size="xs"
                      colorScheme="gray"
                      variant="ghost"
                      title="Delete"
                      onClick={() => onDelete(doc)}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {pagination && pagination.totalPages > 1 && (
        <Flex
          justifyContent="flex-end"
          alignItems="center"
          px="20px"
          py="14px"
          gap="8px"
          borderTop="1px solid #E2E8F0"
        >
          <IconButton
            aria-label="Previous page"
            icon={<FaChevronLeft />}
            size="sm"
            variant="ghost"
            isDisabled={page === 1}
            onClick={() => onPageChange(page - 1)}
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
            onClick={() => onPageChange(page + 1)}
          />
        </Flex>
      )}
    </Box>
  );
};

export default DocumentTable;
