import React from "react";
import { Flex, Input, Select, IconButton, Tooltip } from "@chakra-ui/react";
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

const STATUSES = [
  { value: "Successful", label: "Successful" },
  { value: "Failed",     label: "Failed" },
];

const MaterialsFilters = ({
  search,
  onSearchChange,
  materialType,
  onMaterialTypeChange,
  uploadLocation,
  onUploadLocationChange,
  status,
  onStatusChange,
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

    <Select
      value={status}
      onChange={(e) => onStatusChange(e.target.value)}
      size="sm"
      borderRadius="6px"
      maxW="150px"
      bg="white"
      placeholder="All Statuses"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
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
