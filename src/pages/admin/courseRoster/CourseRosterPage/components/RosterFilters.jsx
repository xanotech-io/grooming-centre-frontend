import React, { useState, useEffect, useRef } from "react";
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

const STATUS_OPTIONS = [
  { value: "",           label: "All Statuses" },
  { value: "Enrolled",   label: "Enrolled" },
  { value: "Pending",    label: "Pending" },
  { value: "Completed",  label: "Completed" },
  { value: "Withdrawn",  label: "Withdrawn" },
];

const SearchableSelect = ({ value, options, onChange, placeholder, maxW, isDisabled }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";

  useEffect(() => {
    setQuery(value ? selectedLabel : "");
  }, [value, selectedLabel]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery(value ? selectedLabel : "");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, selectedLabel]);

  return (
    <Box ref={containerRef} position="relative" maxW={maxW}>
      <Input
        size="sm"
        borderRadius="6px"
        bg="white"
        fontSize="13px"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        isDisabled={isDisabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => !isDisabled && setIsOpen(true)}
      />
      {isOpen && !isDisabled && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={200}
          bg="white"
          border="1px solid #E4E7EC"
          borderRadius="md"
          boxShadow="md"
          maxH="200px"
          overflowY="auto"
          mt="2px"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="#667085">No results</Box>
          ) : (
            filtered.map((o) => (
              <Box
                key={o.value}
                px={3}
                py="7px"
                fontSize="13px"
                cursor="pointer"
                bg={String(o.value) === String(value) ? "#F3E8FF" : "white"}
                _hover={{ bg: String(o.value) === String(value) ? "#F3E8FF" : "#F9FAFB" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setQuery(o.label);
                  setIsOpen(false);
                }}
              >
                {o.label}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

const RosterFilters = ({
  courseId,
  onCourseChange,
  courses,
  coursesLoading,
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
        <SearchableSelect
          value={courseId}
          onChange={onCourseChange}
          options={(courses || []).map((c) => ({ value: String(c.id), label: c.title }))}
          placeholder={coursesLoading ? "Loading courses…" : "Search course…"}
          maxW="300px"
          isDisabled={coursesLoading}
        />

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
