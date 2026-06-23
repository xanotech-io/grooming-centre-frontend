import React, { useState, useEffect, useRef } from "react";
import { Flex, Input, Select, IconButton, Tooltip, Box } from "@chakra-ui/react";
import { FiRefreshCw } from "react-icons/fi";

const MATERIAL_TYPES = [
  { value: "PDF",   label: "PDF" },
  { value: "PPT",   label: "PPT / Presentation" },
  { value: "VIDEO", label: "Video" },
  { value: "IMAGE", label: "Image" },
  { value: "AUDIO", label: "Audio" },
  { value: "WORD",  label: "Word Document" },
];

const UPLOAD_LOCATIONS = [
  { value: "COURSE_MODULE",   label: "Course Module" },
  { value: "LESSON",          label: "Lesson" },
  { value: "LIBRARY_SECTION", label: "Library Section" },
];

const SearchableSelect = ({ value, options, onChange, placeholder, maxW }) => {
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
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
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

const MaterialsFilters = ({
  search,
  onSearchChange,
  courses = [],
  courseId,
  onCourseIdChange,
  materialType,
  onMaterialTypeChange,
  uploadLocation,
  onUploadLocationChange,
  onReset,
}) => (
  <Flex
    px="20px"
    py="14px"
    gap="10px"
    flexWrap="wrap"
    alignItems="center"
    borderBottom="1px solid #E2E8F0"
    bg="#FAFAFA"
  >
    <Input
      placeholder="Search by title or file name…"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      size="sm"
      borderRadius="6px"
      maxW="240px"
      bg="white"
    />

    <SearchableSelect
      value={courseId}
      onChange={onCourseIdChange}
      options={courses.map((c) => ({ value: String(c.id), label: c.title + (c.displayId ? ` (${c.displayId})` : "") }))}
      placeholder="All Courses"
      maxW="260px"
    />

    <Select
      value={materialType}
      onChange={(e) => onMaterialTypeChange(e.target.value)}
      size="sm"
      borderRadius="6px"
      maxW="190px"
      bg="white"
      placeholder="All Types"
    >
      {MATERIAL_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </Select>

    <Select
      value={uploadLocation}
      onChange={(e) => onUploadLocationChange(e.target.value)}
      size="sm"
      borderRadius="6px"
      maxW="190px"
      bg="white"
      placeholder="All Locations"
    >
      {UPLOAD_LOCATIONS.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </Select>

    <Tooltip label="Reset filters">
      <IconButton
        aria-label="Reset filters"
        icon={<FiRefreshCw />}
        size="sm"
        variant="ghost"
        colorScheme="gray"
        onClick={onReset}
      />
    </Tooltip>
  </Flex>
);

export default MaterialsFilters;
