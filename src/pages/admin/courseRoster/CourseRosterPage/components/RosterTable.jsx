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
  Badge,
  Spinner,
  Avatar,
  Progress,
  IconButton,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const STATUS_CFG = {
  Enrolled:  { bg: "#C6F6D5", color: "#276749" },
  Pending:   { bg: "#FEFCBF", color: "#975A16" },
  Completed: { bg: "#BEE3F8", color: "#2B6CB0" },
  Withdrawn: { bg: "#FED7D7", color: "#C53030" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { bg: "#EDF2F7", color: "#4A5568" };
  return (
    <Badge
      bg={cfg.bg}
      color={cfg.color}
      borderRadius="6px"
      px="8px"
      py="2px"
      fontSize="11px"
      fontWeight="600"
    >
      {status}
    </Badge>
  );
};

const TH = ({ children }) => (
  <Th py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">
    {children}
  </Th>
);

const EmptyRow = ({ colSpan, message }) => (
  <Tr>
    <Td colSpan={colSpan}>
      <Flex justifyContent="center" alignItems="center" py="40px">
        <Text color="gray.400" fontSize="14px">
          {message}
        </Text>
      </Flex>
    </Td>
  </Tr>
);

const RosterTable = ({
  students,
  loading,
  error,
  pagination,
  page,
  onPageChange,
  courseSelected,
}) => {
  const { totalItems = 0, totalPages = 1 } = pagination || {};

  const renderBody = () => {
    if (!courseSelected) {
      return <EmptyRow colSpan={7} message="Select a course above to view the roster." />;
    }
    if (loading) {
      return (
        <Tr>
          <Td colSpan={7}>
            <Flex justifyContent="center" py="40px">
              <Spinner size="lg" color="blue.500" />
            </Flex>
          </Td>
        </Tr>
      );
    }
    if (error) {
      return <EmptyRow colSpan={7} message="Failed to load roster. Please try again." />;
    }
    if (!students.length) {
      return <EmptyRow colSpan={7} message="No students match the current filters." />;
    }
    return students.map((s) => (
      <Tr key={s.studentId} _hover={{ bg: "gray.50" }} transition="background 0.1s">
        <Td py="12px">
          <Flex alignItems="center" gap="10px">
            <Avatar
              size="sm"
              name={`${s.firstName} ${s.lastName}`}
              bg="blue.100"
              color="blue.700"
              fontSize="12px"
            />
            <Box>
              <Text fontSize="13px" fontWeight="600" color="gray.800">
                {s.firstName} {s.lastName}
              </Text>
              <Text fontSize="11px" color="gray.500">
                {s.studentId}
              </Text>
            </Box>
          </Flex>
        </Td>
        <Td py="12px">
          <Text fontSize="13px" color="gray.700">
            {s.email}
          </Text>
        </Td>
        <Td py="12px">
          <Text fontSize="13px" color="gray.700">
            {s.phoneNumber || "—"}
          </Text>
        </Td>
        <Td py="12px">
          <StatusBadge status={s.enrollmentStatus} />
        </Td>
        <Td py="12px">
          <Box>
            <Flex justifyContent="space-between" mb="4px">
              <Text fontSize="11px" color="gray.600">
                {s.progressPercentage != null ? `${s.progressPercentage}%` : "—"}
              </Text>
            </Flex>
            <Progress
              value={s.progressPercentage ?? 0}
              size="xs"
              colorScheme="blue"
              borderRadius="4px"
              w="100px"
            />
          </Box>
        </Td>
        <Td py="12px">
          <Text fontSize="13px" color="gray.700">
            {s.grade ?? "—"}
          </Text>
        </Td>
        <Td py="12px">
          <Text fontSize="13px" color="gray.700">
            {s.enrollmentDate
              ? new Date(s.enrollmentDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </Text>
        </Td>
      </Tr>
    ));
  };

  return (
    <Box>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <TH>Student</TH>
              <TH>Email</TH>
              <TH>Phone</TH>
              <TH>Status</TH>
              <TH>Progress</TH>
              <TH>Grade</TH>
              <TH>Date Enrolled</TH>
            </Tr>
          </Thead>
          <Tbody>{renderBody()}</Tbody>
        </Table>
      </TableContainer>

      {courseSelected && totalItems > 0 && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          px="16px"
          py="12px"
          borderTop="1px solid #E2E8F0"
        >
          <Text fontSize="13px" color="gray.500">
            Showing {students.length} of {totalItems} students
          </Text>
          <Flex alignItems="center" gap="8px">
            <IconButton
              icon={<FaChevronLeft size={12} />}
              size="sm"
              variant="ghost"
              isDisabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
            />
            <Text fontSize="13px" color="gray.700">
              {page} / {totalPages}
            </Text>
            <IconButton
              icon={<FaChevronRight size={12} />}
              size="sm"
              variant="ghost"
              isDisabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
            />
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default RosterTable;
