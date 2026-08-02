import React, { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Select,
  Grid,
  Box,
  Text,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { Button, SearchableSelect } from "../../../../../components";
import {
  adminUploadUserDocument,
  adminGetUserListing,
  adminGetCourseListing,
} from "../../../../../services";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.xlsx,.xls";

const INITIAL_FORM = {
  userId: "",
  userLabel: "",
  documentType: "",
  fileName: "",
  fileFormat: "PDF",
  courseId: "",
  courseLabel: "",
  expiryDate: "",
  file: null,
  fileError: "",
};

const fetchStudentOptions = async (query) => {
  const res = await adminGetUserListing({ search: query, limit: 10 });
  return (res.users ?? []).map((u) => ({
    id: u.id,
    label: `${u.firstName} ${u.lastName} (${u.displayId})`,
  }));
};

const fetchCourseOptions = async (query) => {
  const res = await adminGetCourseListing({ search: query, limit: 10 });
  return (res.courses ?? []).map((c) => ({
    id: c.id,
    label: `${c.title} (${c.displayId})`,
  }));
};

const UploadDocumentModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const fileInputRef = useRef();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setForm((prev) => ({ ...prev, file: null, fileError: "" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setForm((prev) => ({ ...prev, file: null, fileError: "File exceeds the 10 MB limit." }));
      e.target.value = "";
      return;
    }
    const ext = file.name.split(".").pop().toUpperCase();
    const detectedFormat = ["PDF", "JPG", "JPEG", "PNG", "XLSX", "XLS"].includes(ext)
      ? (ext === "JPEG" ? "JPG" : ext)
      : form.fileFormat;
    setForm((prev) => ({
      ...prev,
      file,
      fileError: "",
      fileName: prev.fileName || file.name,
      fileFormat: detectedFormat,
    }));
  };

  const isValid =
    !!form.userId &&
    !!form.documentType &&
    form.fileName.trim() !== "" &&
    !!form.file &&
    !form.fileError;

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: "Please fill all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        documentType: form.documentType,
        fileFormat: form.fileFormat,
        fileName: form.fileName.trim(),
        file: form.file,
        fileSize: form.file.size,
        courseId: form.courseId || undefined,
        expiryDate: form.expiryDate || undefined,
      };
      await adminUploadUserDocument(form.userId, payload);
      toast({
        title: "Document uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setForm(INITIAL_FORM);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to upload document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Upload Document
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb="4px">
          <Grid templateColumns="1fr 1fr" gap="16px">
            {/* Student */}
            <FormControl isRequired gridColumn="span 2">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Student
              </FormLabel>
              <SearchableSelect
                placeholder="Search student by name…"
                fetchOptions={fetchStudentOptions}
                selectedLabel={form.userLabel}
                onSelect={(id, label) =>
                  setForm((prev) => ({ ...prev, userId: id, userLabel: label }))
                }
              />
            </FormControl>

            {/* Document Type */}
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Document Type
              </FormLabel>
              <Select
                value={form.documentType}
                onChange={set("documentType")}
                size="sm"
                borderRadius="6px"
                placeholder="Select type"
              >
                <option value="certificate">Certificate</option>
                <option value="registration_sheet">Registration Sheet</option>
                <option value="evaluation_form">Evaluation Form</option>
                <option value="attendance_record">Attendance Record</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            {/* File Format */}
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                File Format
              </FormLabel>
              <Select
                value={form.fileFormat}
                onChange={set("fileFormat")}
                size="sm"
                borderRadius="6px"
              >
                <option value="PDF">PDF</option>
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
                <option value="XLSX">XLSX</option>
                <option value="XLS">XLS</option>
              </Select>
            </FormControl>

            {/* File Name */}
            <FormControl isRequired gridColumn="span 2">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                File Name
              </FormLabel>
              <Input
                value={form.fileName}
                onChange={set("fileName")}
                placeholder="e.g. course_completion_certificate.pdf"
                size="sm"
                borderRadius="6px"
              />
            </FormControl>

            {/* File upload */}
            <FormControl isRequired gridColumn="span 2" isInvalid={!!form.fileError}>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                File
              </FormLabel>
              <Box
                border="1px dashed"
                borderColor={form.fileError ? "red.400" : "gray.300"}
                borderRadius="6px"
                p="12px"
                bg="gray.50"
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
                _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                transition="all 0.15s"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {form.file ? (
                  <Flex alignItems="center" gap="8px">
                    <Text fontSize="13px" fontWeight="500" color="gray.700" noOfLines={1}>
                      {form.file.name}
                    </Text>
                    <Text fontSize="11px" color="gray.400" flexShrink={0}>
                      ({(form.file.size / 1024).toFixed(0)} KB)
                    </Text>
                  </Flex>
                ) : (
                  <Text fontSize="13px" color="gray.400" textAlign="center">
                    Click to choose a file
                  </Text>
                )}
              </Box>
              {form.fileError ? (
                <FormErrorMessage fontSize="11px">{form.fileError}</FormErrorMessage>
              ) : (
                <FormHelperText fontSize="11px">
                  Accepted: PDF, JPG, PNG, XLSX, XLS — max 10 MB
                </FormHelperText>
              )}
            </FormControl>

            {/* Associated Course */}
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Associated Course (optional)
              </FormLabel>
              <SearchableSelect
                placeholder="Search course by title…"
                fetchOptions={fetchCourseOptions}
                selectedLabel={form.courseLabel}
                onSelect={(id, label) =>
                  setForm((prev) => ({ ...prev, courseId: id, courseLabel: label }))
                }
              />
            </FormControl>

            {/* Expiry Date */}
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Expiry Date (optional)
              </FormLabel>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={set("expiryDate")}
                size="sm"
                borderRadius="6px"
              />
            </FormControl>
          </Grid>
        </ModalBody>

        <ModalFooter gap="10px" mt="8px">
          <Button variant="outline" onClick={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!isValid}
            loadingText="Uploading…"
          >
            Upload Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadDocumentModal;
