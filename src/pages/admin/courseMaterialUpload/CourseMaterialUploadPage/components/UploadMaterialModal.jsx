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
  adminListModules,
  adminGetLessonListing,
} from "../../../../../services";

// Per-spec file size limits
const SIZE_LIMITS = {
  PDF:   30 * 1024 * 1024,
  PPT:   30 * 1024 * 1024,
  WORD:  30 * 1024 * 1024,
  IMAGE:  5 * 1024 * 1024,
  AUDIO: 50 * 1024 * 1024,
  VIDEO: 300 * 1024 * 1024,
};

const SIZE_LABELS = {
  PDF: "30 MB", PPT: "30 MB", WORD: "30 MB",
  IMAGE: "5 MB", AUDIO: "50 MB", VIDEO: "300 MB",
};

const MATERIAL_TYPES = [
  { value: "PDF",   label: "PDF Document",       accept: ".pdf" },
  { value: "PPT",   label: "PPT / Presentation",  accept: ".ppt,.pptx" },
  { value: "VIDEO", label: "Video",               accept: ".mp4,.avi,.mov" },
  { value: "IMAGE", label: "Image",               accept: ".jpg,.jpeg,.png,.gif" },
  { value: "AUDIO", label: "Audio",               accept: ".mp3,.wav" },
  { value: "WORD",  label: "Word Document",       accept: ".doc,.docx" },
];

const UPLOAD_LOCATIONS = [
  { value: "COURSE_MODULE",   label: "Course Module" },
  { value: "LESSON",          label: "Lesson" },
  { value: "LIBRARY_SECTION", label: "Library Section" },
];

const FORMAT_MAP = {
  PDF: "PDF", PPT: "PPT", PPTX: "PPT",
  MP4: "MP4", AVI: "AVI", MOV: "MOV",
  JPG: "JPG", JPEG: "JPG", PNG: "PNG", GIF: "GIF",
  MP3: "MP3", WAV: "WAV",
  DOC: "DOC", DOCX: "DOCX",
};

const INITIAL_FORM = {
  courseId: "",
  moduleId: "",
  lessonId: "",
  materialTitle: "",
  materialType: "PDF",
  uploadLocation: "COURSE_MODULE",
  accessibility: "VIEWABLE",
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

  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Load course list when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingCourses(true);
    adminGetCourseListing({ limit: 500 })
      .then((res) => setCourses(res.courses || []))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, [isOpen]);

  // Load modules or lessons whenever courseId or uploadLocation changes
  useEffect(() => {
    if (!form.courseId) {
      setModules([]);
      setLessons([]);
      return;
    }

    if (form.uploadLocation === "COURSE_MODULE") {
      setModules([]);
      setLoadingModules(true);
      adminListModules(form.courseId)
        .then((res) => setModules(res.modules || []))
        .catch(() => setModules([]))
        .finally(() => setLoadingModules(false));
    } else if (form.uploadLocation === "LESSON") {
      setLessons([]);
      setLoadingLessons(true);
      adminGetLessonListing(form.courseId, {}, {})
        .then((res) => setLessons(res.lessons || []))
        .catch(() => setLessons([]))
        .finally(() => setLoadingLessons(false));
    }
  }, [form.courseId, form.uploadLocation]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleMaterialTypeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      materialType: e.target.value,
      file: null,
      fileError: "",
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadLocationChange = (e) => {
    setForm((prev) => ({
      ...prev,
      uploadLocation: e.target.value,
      moduleId: "",
      lessonId: "",
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setForm((prev) => ({ ...prev, file: null, fileError: "" }));
      return;
    }
    const limit = SIZE_LIMITS[form.materialType] ?? 300 * 1024 * 1024;
    if (file.size > limit) {
      setForm((prev) => ({
        ...prev,
        file: null,
        fileError: `File exceeds the ${SIZE_LABELS[form.materialType]} limit for ${form.materialType}.`,
      }));
      e.target.value = "";
      return;
    }
    const ext = file.name.split(".").pop().toUpperCase();
    setForm((prev) => ({
      ...prev,
      file,
      fileError: "",
      fileFormat: FORMAT_MAP[ext] || ext,
    }));
  };

  const currentTypeConfig = MATERIAL_TYPES.find((t) => t.value === form.materialType);
  const needsModuleId = form.uploadLocation === "COURSE_MODULE";
  const needsLessonId = form.uploadLocation === "LESSON";

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
      await adminUploadCourseMaterial({
        courseId: form.courseId,
        moduleId: form.moduleId || undefined,
        lessonId: form.lessonId || undefined,
        materialTitle: form.materialTitle.trim(),
        materialType: form.materialType,
        uploadLocation: form.uploadLocation,
        accessibility: form.accessibility,
        restrictionStatus: "ALLOWED",
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
    setModules([]);
    setLessons([]);
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
                    {c.title}{c.displayId ? ` (${c.displayId})` : ""}
                  </option>
                ))}
              </Select>
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
                onChange={handleUploadLocationChange}
                size="sm"
                borderRadius="6px"
              >
                {UPLOAD_LOCATIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </FormControl>

            {/* Module select — only for COURSE_MODULE */}
            {needsModuleId && (
              <FormControl gridColumn="span 2">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Module</FormLabel>
                <Select
                  value={form.moduleId}
                  onChange={set("moduleId")}
                  size="sm"
                  borderRadius="6px"
                  placeholder={
                    !form.courseId
                      ? "Select a course first"
                      : loadingModules
                      ? "Loading modules…"
                      : modules.length === 0
                      ? "No modules found"
                      : "Select module"
                  }
                  isDisabled={!form.courseId || loadingModules || modules.length === 0}
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Lesson select — only for LESSON */}
            {needsLessonId && (
              <FormControl gridColumn="span 2">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Lesson</FormLabel>
                <Select
                  value={form.lessonId}
                  onChange={set("lessonId")}
                  size="sm"
                  borderRadius="6px"
                  placeholder={
                    !form.courseId
                      ? "Select a course first"
                      : loadingLessons
                      ? "Loading lessons…"
                      : lessons.length === 0
                      ? "No lessons found"
                      : "Select lesson"
                  }
                  isDisabled={!form.courseId || loadingLessons || lessons.length === 0}
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Accessibility */}
            <FormControl gridColumn="span 2">
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
                      Accepted: {currentTypeConfig?.accept?.replace(/,/g, ", ")} — max {SIZE_LABELS[form.materialType]}
                    </Text>
                  </Box>
                )}
              </Box>
              {form.fileError ? (
                <FormErrorMessage fontSize="11px">{form.fileError}</FormErrorMessage>
              ) : (
                <FormHelperText fontSize="11px">
                  Max sizes: PDF/PPT/Word 30 MB · Images 5 MB · Audio 50 MB · Video 300 MB
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
