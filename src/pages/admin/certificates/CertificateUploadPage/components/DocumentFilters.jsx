import React from "react";
import {
  Box,
  Flex,
  Input,
  Select,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

const DocumentFilters = ({
  userIdInput,
  onUserIdChange,
  onSearch,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
}) => (
  <Flex
    px="20px"
    py="16px"
    gap="12px"
    alignItems="flex-end"
    flexWrap="wrap"
    borderBottom="1px solid #E2E8F0"
  >
    <Box flex="1" minW="200px">
      <Text fontSize="12px" color="gray.500" mb="4px">
        Student ID (optional)
      </Text>
      <Flex gap="8px">
        <Input
          value={userIdInput}
          onChange={(e) => onUserIdChange(e.target.value)}
          placeholder="Enter student ID"
          size="sm"
          borderRadius="6px"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <IconButton
          aria-label="Search student"
          icon={<FaSearch />}
          size="sm"
          colorScheme="blue"
          onClick={onSearch}
        />
      </Flex>
    </Box>

    <Box minW="160px">
      <Text fontSize="12px" color="gray.500" mb="4px">
        Status
      </Text>
      <Select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        size="sm"
        borderRadius="6px"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="verified">Verified</option>
        <option value="rejected">Rejected</option>
      </Select>
    </Box>

    <Box minW="200px">
      <Text fontSize="12px" color="gray.500" mb="4px">
        Document Type
      </Text>
      <Select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        size="sm"
        borderRadius="6px"
      >
        <option value="">All Types</option>
        <option value="certificate">Certificate</option>
        <option value="registration_sheet">Registration Sheet</option>
        <option value="evaluation_form">Evaluation Form</option>
        <option value="attendance_record">Attendance Record</option>
        <option value="other">Other</option>
      </Select>
    </Box>
  </Flex>
);

export default DocumentFilters;
