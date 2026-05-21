import React, { useState, useEffect, useRef } from "react";
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
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Grid,
  Box,
  Text,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { Button } from "../../../../../components";
import {
  adminUploadCourseMaterial,
  adminGetCourseListing,
} from "../../../../../services";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const MATERIAL_TYPES = [
  { value: "PDF",   label: "PDF Document",      accept: ".pdf" },
  { value: "PPT",   label: "PPT / Presentation", accept: ".ppt,.pptx" },
  { value: "VIDEO", label: "Video",              accept: ".mp4,.avi,.mov" },
  { value: "IMAGE", label: "Image",              accept: ".jpg,.jpeg,.png" },
  { value: "AUDIO", label: "Audio",              accept: ".mp3,.wav" },
  { value: "WORD",  label: "Word Document",      accept: ".doc,.docx" },
];

const UPLOAD_LOCATIONS = [
  { value: "COURSE_MODULE",   label: "Course Module" },
  { value: "LESSON",          label: "Lesson" },
  { value: "LIBRARY_SECTION", label: "Library Section" },
];

const INITIAL_FORM = {
  courseId: "",
  moduleId: "",
  materialTitle: "",
  materialType: "PDF",
  uploadLocation: "COURSE_MODULE",
  accessibility: "VIEWABLE",
  fileName: "",
  fileFormat: "PDF",
  file: null,
  fileError: "",
};

const UploadMaterialModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const fileInputRef = useRef();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingCourses(true);
    adminGetCourseListing({ limit: 500 })
      .then((res) => setCourses(res.courses || []))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, [isOpen]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleMaterialTypeChange = (e) => {
    const materialType = e.target.value;
    setForm((prev) => ({
      ...prev,
      materialType,
      file: null,
      fileError: "",
      fileName: "",
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentTypeConfig = MATERIAL_TYPES.find((t) => t.value === form.materialType);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setForm((prev) => ({ ...prev, file: null, fileError: "" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setForm((prev) => ({ ...prev, file: null, fileError: "File exceeds the 100 MB limit." }));
      e.target.value = "";
      return;
    }
    const ext = file.name.split(".").pop().toUpperCase();
    const FORMAT_MAP = {
      PDF: "PDF", PPT: "PPT", PPTX: "PPT",
      MP4: "MP4", AVI: "AVI", MOV: "MOV",
      JPG: "JPG", JPEG: "JPG", PNG: "PNG",
      MP3: "MP3", WAV: "WAV",
      DOC: "DOC", DOCX: "DOCX",
    };
    setForm((prev) => ({
      ...prev,
      file,
      fileError: "",
      fileName: prev.fileName || file.name,
      fileFormat: FORMAT_MAP[ext] || ext,
    }));
  };

  const isValid =
    !!form.courseId &&
    form.materialTitle.trim() !== "" &&
    !!form.materialType &&
    !!form.uploadLocation &&
    !!form.file &&
    !form.fileError;

  const handleSubmit = async () => {
    if (!isValid) {
      toast({ title: "Please fill all required fields", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      const selectedCourse = courses.find((c) => c.id === form.courseId);
      await adminUploadCourseMaterial({
        courseId: form.courseId,
        courseName: selectedCourse ? `${selectedCourse.title} (${selectedCourse.displayId})` : form.courseId,
        moduleId: form.moduleId || "—",
        moduleName: form.moduleId || "—",
        materialTitle: form.materialTitle.trim(),
        materialType: form.materialType,
        uploadLocation: form.uploadLocation,
        accessibility: form.accessibility,
        fileName: form.fileName.trim() || form.file.name,
        fileFormat: form.fileFormat,
        fileSize: form.file.size,
        file: form.file,
      });
      toast({ title: "Material uploaded successfully", status: "success", duration: 3000, isClosable: true });
      setForm(INITIAL_FORM);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();
      onClose();
    } catch {
      toast({ title: "Failed to upload material", status: "error", duration: 3000, isClosable: true });
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
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Upload Course Material
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb="4px">
          <Grid templateColumns="1fr 1fr" gap="16px">

            {/* Course */}
            <FormControl isRequired gridColumn="span 2">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Course</FormLabel>
              <Select
                value={form.courseId}
                onChange={set("courseId")}
                size="sm"
                borderRadius="6px"
                placeholder={loadingCourses ? "Loading courses…" : "Select course"}
                isDisabled={loadingCourses}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.displayId})
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Module ID */}
            <FormControl gridColumn="span 2">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Module ID (optional)</FormLabel>
              <Input
                value={form.moduleId}
                onChange={set("moduleId")}
                placeholder="e.g. MOD-001"
                size="sm"
                borderRadius="6px"
              />
              <FormHelperText fontSize="11px">Leave blank if uploading to a general course section.</FormHelperText>
            </FormControl>

            {/* Material Title */}
            <FormControl isRequired gridColumn="span 2">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Material Title</FormLabel>
              <Input
                value={form.materialTitle}
                onChange={set("materialTitle")}
                placeholder="e.g. Week 1 Introduction"
                size="sm"
                borderRadius="6px"
              />
            </FormControl>

            {/* Material Type */}
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Material Type</FormLabel>
              <Select
                value={form.materialType}
                onChange={handleMaterialTypeChange}
                size="sm"
                borderRadius="6px"
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </FormControl>

            {/* Upload Location */}
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Upload Location</FormLabel>
              <Select
                value={form.uploadLocation}
                onChange={set("uploadLocation")}
                size="sm"
                borderRadius="6px"
              >
                {UPLOAD_LOCATIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </FormControl>

            {/* Accessibility */}
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Accessibility</FormLabel>
              <Select
                value={form.accessibility}
                onChange={set("accessibility")}
                size="sm"
                borderRadius="6px"
              >
                <option value="VIEWABLE">Viewable Only</option>
                <option value="DOWNLOADABLE">Downloadable</option>
              </Select>
            </FormControl>

            {/* File Name */}
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">File Name (optional)</FormLabel>
              <Input
                value={form.fileName}
                onChange={set("fileName")}
                placeholder="Auto-filled from selected file"
                size="sm"
                borderRadius="6px"
              />
            </FormControl>

            {/* File Upload */}
            <FormControl isRequired gridColumn="span 2" isInvalid={!!form.fileError}>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">File</FormLabel>
              <Box
                border="1px dashed"
                borderColor={form.fileError ? "red.400" : "gray.300"}
                borderRadius="6px"
                p="16px"
                bg="gray.50"
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
                _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                transition="all 0.15s"
                textAlign="center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={currentTypeConfig?.accept || ""}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {form.file ? (
                  <Flex alignItems="center" justifyContent="center" gap="8px">
                    <Text fontSize="13px" fontWeight="500" color="gray.700" noOfLines={1}>
                      {form.file.name}
                    </Text>
                    <Text fontSize="11px" color="gray.400" flexShrink={0}>
                      ({(form.file.size / 1024).toFixed(0)} KB)
                    </Text>
                  </Flex>
                ) : (
                  <Box>
                    <Text fontSize="13px" color="gray.400">Click to choose a file</Text>
                    <Text fontSize="11px" color="gray.300" mt="2px">
                      Accepted: {currentTypeConfig?.accept?.replace(/,/g, ", ")} — max 100 MB
                    </Text>
                  </Box>
                )}
              </Box>
              {form.fileError ? (
                <FormErrorMessage fontSize="11px">{form.fileError}</FormErrorMessage>
              ) : (
                <FormHelperText fontSize="11px">
                  Audio (.mp3, .wav) and Word (.doc, .docx) formats are now supported in Course Modules.
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
        </ModalBody>

        <ModalFooter gap="10px" mt="8px">
          <Button variant="outline" onClick={handleClose} isDisabled={loading}>Cancel</Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!isValid}
            loadingText="Uploading…"
          >
            Upload Material
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadMaterialModal;
