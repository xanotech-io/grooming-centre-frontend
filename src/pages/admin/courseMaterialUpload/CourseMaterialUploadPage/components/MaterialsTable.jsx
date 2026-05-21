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
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { FaEye, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MaterialTypeBadge from "./MaterialTypeBadge";

const LOCATION_LABELS = {
  COURSE_MODULE:   "Course Module",
  LESSON:          "Lesson",
  LIBRARY_SECTION: "Library Section",
};

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const StatusBadge = ({ status }) => {
  const map = {
    Successful:      { bg: "#C6F6D5", color: "#276749" },
    Failed:          { bg: "#FED7D7", color: "#C53030" },
    "View Only":     { bg: "#BEE3F8", color: "#2B6CB0" },
    "Streaming Only":{ bg: "#E9D8FD", color: "#6B46C1" },
  };
  const cfg = map[status] || { bg: "#EDF2F7", color: "#4A5568" };
  return (
    <Badge bg={cfg.bg} color={cfg.color} borderRadius="6px" px="8px" py="2px" fontSize="11px" fontWeight="600">
      {status}
    </Badge>
  );
};

const TH = ({ children }) => (
  <Th py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">
    {children}
  </Th>
);

const MaterialsTable = ({
  materials,
  loading,
  error,
  pagination,
  page,
  onPageChange,
  onView,
  onDelete,
}) => {
  if (loading) {
    return (
      <Flex justifyContent="center" py="56px">
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" py="56px">
        <Text color="red.500" fontSize="14px">Failed to load materials. Please try again.</Text>
      </Flex>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <Flex justifyContent="center" alignItems="center" direction="column" py="56px" gap="8px">
        <Text color="gray.400" fontSize="14px">No course materials found.</Text>
        <Text color="gray.400" fontSize="12px">Try adjusting your filters or upload a new material.</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead bg="#F7FAFC">
            <Tr>
              <TH>Material ID</TH>
              <TH>Title</TH>
              <TH>Course</TH>
              <TH>Module</TH>
              <TH>Type</TH>
              <TH>File</TH>
              <TH>Size</TH>
              <TH>Location</TH>
              <TH>Accessibility</TH>
              <TH>Status</TH>
              <TH>Uploaded By</TH>
              <TH>Date</TH>
              <TH>Actions</TH>
            </Tr>
          </Thead>
          <Tbody>
            {materials.map((mat) => (
              <Tr key={mat.materialId} _hover={{ bg: "#F7FAFC" }}>
                <Td py="14px" fontSize="12px" color="gray.500" fontFamily="mono">
                  {mat.materialId}
                </Td>
                <Td py="14px" fontSize="13px" fontWeight="500" color="gray.800" maxW="180px">
                  <Text noOfLines={1} title={mat.materialTitle}>{mat.materialTitle}</Text>
                </Td>
                <Td py="14px" fontSize="13px" color="gray.600">
                  {mat.courseId || "—"}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.500" maxW="140px">
                  <Text noOfLines={1} title={mat.moduleName}>{mat.moduleName || mat.moduleId || "—"}</Text>
                </Td>
                <Td py="14px">
                  <MaterialTypeBadge type={mat.materialType} fileFormat={mat.fileFormat} />
                </Td>
                <Td py="14px" fontSize="12px" color="gray.500" maxW="140px">
                  <Text noOfLines={1} title={mat.fileName}>{mat.fileName}</Text>
                </Td>
                <Td py="14px" fontSize="13px" color="gray.500">
                  {formatBytes(mat.fileSize)}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.600">
                  {LOCATION_LABELS[mat.uploadLocation] || mat.uploadLocation || "—"}
                </Td>
                <Td py="14px" fontSize="12px" color="gray.500">
                  {mat.accessibility || "—"}
                </Td>
                <Td py="14px">
                  <StatusBadge status={mat.status} />
                </Td>
                <Td py="14px" fontSize="13px" color="gray.600">
                  {mat.uploadedBy || "—"}
                </Td>
                <Td py="14px" fontSize="13px" color="gray.500">
                  {mat.uploadDate ? new Date(mat.uploadDate).toLocaleDateString() : "—"}
                </Td>
                <Td py="14px">
                  <Flex gap="4px">
                    <IconButton
                      aria-label="View material"
                      icon={<FaEye />}
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                      title="View details"
                      onClick={() => onView(mat)}
                    />
                    <IconButton
                      aria-label="Delete material"
                      icon={<FaTrash />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      title="Delete"
                      onClick={() => onDelete(mat)}
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

export default MaterialsTable;
