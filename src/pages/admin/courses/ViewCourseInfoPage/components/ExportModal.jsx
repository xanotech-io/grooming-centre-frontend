import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Text,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";

const FORMAT_OPTIONS = [
  { value: "PDF",   label: "PDF",   desc: "Formatted tabular report",          color: "#E53E3E", bg: "#FFF5F5" },
  { value: "EXCEL", label: "Excel", desc: "Structured spreadsheet with filters", color: "#276749", bg: "#F0FFF4" },
  { value: "CSV",   label: "CSV",   desc: "Raw data for systems integration",   color: "#2B6CB0", bg: "#EBF8FF" },
];

const FIELD_OPTIONS = [
  { value: "first_name",              label: "First Name" },
  { value: "last_name",                label: "Last Name" },
  { value: "student_email",            label: "Email Address" },
  { value: "phone_number",             label: "Phone Number" },
  { value: "course_title",             label: "Course" },
  { value: "enrollment_status",        label: "Enrollment Status" },
  { value: "current_status",           label: "Current Status" },
  { value: "enrollment_date",          label: "Date Enrolled" },
  { value: "progress_percentage",      label: "Progress %" },
  { value: "attendance_percentage",    label: "Attendance %" },
  { value: "latest_assessment_score",  label: "Latest Assessment Score" },
];

const FormatButton = ({ option, selected, onSelect }) => (
  <Box
    border="2px solid"
    borderColor={selected ? option.color : "#E2E8F0"}
    borderRadius="8px"
    p="12px 16px"
    cursor="pointer"
    bg={selected ? option.bg : "white"}
    transition="all 0.15s"
    onClick={() => onSelect(option.value)}
    _hover={{ borderColor: option.color, bg: option.bg }}
    flex="1"
    textAlign="center"
    minW="90px"
  >
    <Text fontSize="14px" fontWeight="700" color={selected ? option.color : "gray.700"}>
      {option.label}
    </Text>
    <Text fontSize="11px" color="gray.500" mt="2px">
      {option.desc}
    </Text>
  </Box>
);

const ExportModal = ({ isOpen, onClose, courseId, courseName, onExport, isExporting }) => {
  const [format, setFormat] = useState("EXCEL");
  const [fields, setFields] = useState([
    "first_name", "last_name", "student_email",
    "enrollment_status", "enrollment_date", "progress_percentage",
  ]);

  const handleExport = () => {
    onExport({ format, fields });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="12px">
        <ModalHeader fontSize="16px" fontWeight="700" pb="8px">
          Export Course Roster
          {courseName && (
            <Text fontSize="12px" fontWeight="400" color="gray.500" mt="2px">
              {courseName}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py="0">
          <Box mb="20px">
            <Text fontSize="12px" fontWeight="600" color="gray.600" mb="10px" textTransform="uppercase" letterSpacing="0.5px">
              Export Format
            </Text>
            <Flex gap="10px">
              {FORMAT_OPTIONS.map((opt) => (
                <FormatButton
                  key={opt.value}
                  option={opt}
                  selected={format === opt.value}
                  onSelect={setFormat}
                />
              ))}
            </Flex>
          </Box>

          <Divider mb="20px" />

          <Box mb="20px">
            <Text fontSize="12px" fontWeight="600" color="gray.600" mb="10px" textTransform="uppercase" letterSpacing="0.5px">
              Fields to Include
            </Text>
            <CheckboxGroup
              value={fields}
              onChange={(vals) => setFields(vals)}
            >
              <Stack spacing="8px">
                {FIELD_OPTIONS.map((f) => (
                  <Checkbox key={f.value} value={f.value} size="sm" colorScheme="blue">
                    <Text fontSize="13px">{f.label}</Text>
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </Box>
        </ModalBody>

        <ModalFooter gap="10px" pt="16px">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            onClick={handleExport}
            isLoading={isExporting}
            loadingText="Exporting…"
            size="sm"
            isDisabled={fields.length === 0}
          >
            Export as {format === "EXCEL" ? "Excel" : format}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
