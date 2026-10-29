import React from "react";
import { Box, Flex, Select, Text } from "@chakra-ui/react";
import { SearchableSelect } from "../../../../../components";
import { adminSearchUsers } from "../../../../../services";

const fetchStudentOptions = async (query) => {
  const users = await adminSearchUsers(query, { limit: 10 });
  return users.map((u) => ({
    id: u.id,
    label: `${u.firstName} ${u.lastName} (${u.displayId})`,
    sub: u.email,
  }));
};

const DocumentFilters = ({
  studentLabel,
  onStudentChange,
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
        Student (optional)
      </Text>
      <SearchableSelect
        placeholder="Search student by name, email or ID…"
        fetchOptions={fetchStudentOptions}
        selectedLabel={studentLabel}
        onSelect={onStudentChange}
      />
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
