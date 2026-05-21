import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Grid,
  Box,
  Text,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { Button } from "../../../../../components";
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

const Field = ({ label, value }) => (
  <Box>
    <Text fontSize="11px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px" mb="2px">
      {label}
    </Text>
    <Text fontSize="13px" color="gray.700" fontWeight="500">
      {value || "—"}
    </Text>
  </Box>
);

const StatusBadge = ({ status }) => {
  const map = {
    Successful: { bg: "#C6F6D5", color: "#276749" },
    Failed:     { bg: "#FED7D7", color: "#C53030" },
  };
  const cfg = map[status] || { bg: "#EDF2F7", color: "#4A5568" };
  return (
    <Box
      as="span"
      display="inline-block"
      bg={cfg.bg}
      color={cfg.color}
      borderRadius="6px"
      px="8px"
      py="2px"
      fontSize="11px"
      fontWeight="600"
    >
      {status}
    </Box>
  );
};

const ViewMaterialModal = ({ isOpen, onClose, material }) => {
  if (!material) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="15px" fontWeight="600" pr="40px">
          {material.materialTitle}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb="4px">
          {/* Type + Status row */}
          <Flex gap="10px" mb="20px" alignItems="center">
            <MaterialTypeBadge type={material.materialType} fileFormat={material.fileFormat} />
            <StatusBadge status={material.status} />
            {material.failureReason && (
              <Text fontSize="11px" color="red.500">
                {material.failureReason}
              </Text>
            )}
          </Flex>

          <Grid templateColumns="1fr 1fr" gap="16px">
            <Field label="Material ID"    value={material.materialId} />
            <Field label="Course"         value={material.courseId} />
            <Field label="Module"         value={material.moduleName || material.moduleId} />
            <Field label="Material Type"  value={material.materialType} />
            <Field label="File Name"      value={material.fileName} />
            <Field label="File Format"    value={material.fileFormat} />
            <Field label="File Size"      value={formatBytes(material.fileSize)} />
            <Field
              label="Upload Location"
              value={LOCATION_LABELS[material.uploadLocation] || material.uploadLocation}
            />
            <Field label="Accessibility"  value={material.accessibility} />
            <Field
              label="Restriction Status"
              value={material.restrictionStatus || "ALLOWED"}
            />
            <Field label="Uploaded By"    value={material.uploadedBy} />
            <Field
              label="Upload Date"
              value={material.uploadDate ? new Date(material.uploadDate).toLocaleString() : "—"}
            />
          </Grid>

          {material.restrictionStatus === "NOT_ALLOWED" && (
            <>
              <Divider my="16px" />
              <Box bg="red.50" borderRadius="6px" p="12px" border="1px solid #FED7D7">
                <Text fontSize="12px" fontWeight="600" color="red.600" mb="4px">
                  Upload Restricted
                </Text>
                <Text fontSize="12px" color="red.500">
                  {material.failureReason || "This file format is not permitted in the selected upload location."}
                </Text>
              </Box>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ViewMaterialModal;
