import React from "react";
import {
  Flex,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Button,
  Box,
} from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";

const COURSE_OPTIONS = [
  { value: "AGR101", label: "Agriculture Fundamentals (AGR101)" },
  { value: "CS101",  label: "Computer Science Basics (CS101)" },
  { value: "BUS201", label: "Business Management 201 (BUS201)" },
  { value: "DAT301", label: "Data Analytics 301 (DAT301)" },
];

const STATUS_OPTIONS = [
  { value: "",           label: "All Statuses" },
  { value: "Enrolled",   label: "Enrolled" },
  { value: "Pending",    label: "Pending" },
  { value: "Completed",  label: "Completed" },
  { value: "Withdrawn",  label: "Withdrawn" },
];

const RosterFilters = ({
  courseId,
  onCourseChange,
  search,
  onSearchChange,
  status,
  onStatusChange,
  onReset,
}) => {
  const hasFilters = search || status;

  return (
    <Box px="16px" py="14px" borderBottom="1px solid #E2E8F0" bg="gray.50">
      <Flex gap="12px" flexWrap="wrap" alignItems="center">
        <Select
          placeholder="Select a course…"
          value={courseId}
          onChange={(e) => onCourseChange(e.target.value)}
          maxW="300px"
          bg="white"
          fontSize="13px"
          size="sm"
          borderRadius="6px"
        >
          {COURSE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <InputGroup maxW="240px" size="sm">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray" size={14} />
          </InputLeftElement>
          <Input
            placeholder="Search student…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            bg="white"
            borderRadius="6px"
            fontSize="13px"
          />
        </InputGroup>

        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          maxW="160px"
          bg="white"
          fontSize="13px"
          size="sm"
          borderRadius="6px"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        {hasFilters && (
          <Button
            leftIcon={<FiX size={12} />}
            size="sm"
            variant="ghost"
            colorScheme="gray"
            onClick={onReset}
            fontSize="12px"
          >
            Reset
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default RosterFilters;
