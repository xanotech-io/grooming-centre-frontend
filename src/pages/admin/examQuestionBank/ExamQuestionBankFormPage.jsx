import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory, useLocation, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  BreadcrumbItem,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link, WorkflowSubmitModal } from "../../../components";
import { useIsSuperAdmin } from "../../../hooks";
import {
  addExamQuestionBankMedia,
  adminGetCourseListing,
  adminListModules,
  createExamQuestionBankItem,
  deleteExamQuestionBankMedia,
  getExamQuestionBankItem,
  getExamQuestionBankMedia,
  updateExamQuestionBankItem,
  updateExamQuestionBankMedia,
} from "../../../services";
import { FiArrowLeft, FiArrowUp, FiArrowDown, FiTrash2, FiPlus, FiSave, FiUpload } from "react-icons/fi";
import { FaImage, FaMicrophone, FaVideo } from "react-icons/fa";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];
const MAX_FILE_BYTES = 5242880;

const ALLOWED_MIME = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/aac"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
};

const MEDIA_ICON = {
  image: <FaImage color="#6b006b" />,
  audio: <FaMicrophone color="#38A169" />,
  video: <FaVideo color="#3182CE" />,
};

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const ACCEPT_ATTR = Object.values(ALLOWED_MIME).flat().join(",");

const detectMediaType = (mime) => Object.keys(ALLOWED_MIME).find((type) => ALLOWED_MIME[type].includes(mime));

// Reads the playback length of an audio/video file locally so the admin
// doesn't have to type it in.
const readMediaDuration = (file, mediaType) =>
  new Promise((resolve) => {
    if (mediaType !== "audio" && mediaType !== "video") return resolve(undefined);
    const el = document.createElement(mediaType);
    const src = URL.createObjectURL(file);
    const done = (value) => {
      URL.revokeObjectURL(src);
      resolve(value);
    };
    el.preload = "metadata";
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? Math.round(el.duration * 10) / 10 : undefined);
    el.onerror = () => done(undefined);
    el.src = src;
  });

const EMPTY_MEDIA_FORM = {
  file: null,
  mediaType: "",
  altText: "",
  transcript: "",
};

// Collects a file plus its accessibility text and hands it to `onSubmit`.
// The parent decides whether to upload it now (edit) or stage it until the
// question exists (create).
const AddMediaModal = ({ isOpen, onClose, onSubmit }) => {
  const toast = useToast();
  const fileInputRef = useRef();
  const [form, setForm] = useState(EMPTY_MEDIA_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(EMPTY_MEDIA_FORM);
  }, [isOpen]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const mediaType = detectMediaType(file.type);
    if (!mediaType) {
      toast({ title: "File type not allowed. See accepted formats.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast({ title: "File exceeds the 5 MB size limit", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setForm((prev) => ({ ...prev, file, mediaType }));
  };

  const handleSubmit = async () => {
    if (!form.file) {
      toast({ title: "Choose a file to attach", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    const entry = {
      file: form.file,
      mediaType: form.mediaType,
      mimeType: form.file.type,
      fileSizeBytes: form.file.size,
      durationSeconds: await readMediaDuration(form.file, form.mediaType),
    };
    if (form.mediaType === "image" && form.altText.trim()) entry.altText = form.altText.trim();
    if (form.mediaType !== "image" && form.transcript.trim()) entry.transcript = form.transcript.trim();

    setSubmitting(true);
    try {
      await onSubmit(entry);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add media";
      toast({ title: msg, status: "error", duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Add Media Attachment
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                File
              </FormLabel>
              <input ref={fileInputRef} type="file" accept={ACCEPT_ATTR} style={{ display: "none" }} onChange={handleFileChange} />
              <Box
                as="button"
                type="button"
                w="100%"
                border="2px dashed #CBD5E0"
                borderRadius="8px"
                p="20px"
                textAlign="center"
                bg="#F7FAFC"
                _hover={{ borderColor: "#6b006b" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {form.file ? (
                  <Flex alignItems="center" justifyContent="center" gap="8px">
                    {MEDIA_ICON[form.mediaType]}
                    <Text fontSize="13px" fontWeight="500" color="gray.700" noOfLines={1}>
                      {form.file.name}
                    </Text>
                    <Text fontSize="11px" color="gray.400" flexShrink={0}>
                      ({formatBytes(form.file.size)})
                    </Text>
                  </Flex>
                ) : (
                  <Flex direction="column" alignItems="center" gap="6px">
                    <FiUpload size={20} color="#6b006b" />
                    <Text fontSize="13px" color="gray.600">
                      Click to choose an image, audio or video file
                    </Text>
                  </Flex>
                )}
              </Box>
              {form.file && (
                <Text fontSize="11px" color="gray.400" mt="4px">
                  Click the box to pick a different file.
                </Text>
              )}
            </FormControl>

            {form.mediaType === "image" && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Alt Text (accessibility)
                </FormLabel>
                <Input size="sm" borderRadius="6px" placeholder="Diagram of a plant cell" value={form.altText} onChange={(e) => set("altText", e.target.value)} />
              </FormControl>
            )}

            {(form.mediaType === "audio" || form.mediaType === "video") && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Transcript (accessibility)
                </FormLabel>
                <Textarea size="sm" borderRadius="6px" rows={3} placeholder="Full transcript..." value={form.transcript} onChange={(e) => set("transcript", e.target.value)} />
              </FormControl>
            )}

            <Box bg="#EBF4FF" borderRadius="6px" p="10px">
              <Text fontSize="11px" color="#2B6CB0">
                Allowed types — Image: jpeg/png/gif/webp/svg · Audio: mpeg/wav/ogg/webm/aac · Video: mp4/webm/ogg/quicktime · Max: 5 MB
              </Text>
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter gap="8px">
          <Button secondary onClick={onClose} isDisabled={submitting}>
            Cancel
          </Button>
          <Button isLoading={submitting} onClick={handleSubmit}>
            Add Media
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// A file picked on the create page that hasn't been uploaded yet — the
// question needs an id before its media can be attached.
const PendingMediaCard = ({ item, onRemove }) => (
  <Box border="1px solid #E2E8F0" borderRadius="8px" p="16px" bg="#F7FAFC">
    <Flex justifyContent="space-between" alignItems="flex-start" mb="12px">
      <Flex alignItems="center" gap="8px" minW="0">
        {MEDIA_ICON[item.mediaType]}
        <Text fontSize="13px" fontWeight="500" color="gray.700" noOfLines={1}>
          {item.file.name}
        </Text>
        <Text fontSize="11px" color="gray.400" flexShrink={0}>
          {item.mimeType} · {formatBytes(item.fileSizeBytes)}
        </Text>
      </Flex>
      <IconButton aria-label="Remove" icon={<FiTrash2 size={12} />} size="xs" variant="ghost" colorScheme="red" onClick={onRemove} />
    </Flex>
    {item.mediaType === "image" && (
      <Box maxH="120px" overflow="hidden" borderRadius="6px">
        <img src={item.previewUrl} alt={item.altText || ""} style={{ maxHeight: "120px", objectFit: "contain" }} />
      </Box>
    )}
    {item.mediaType === "audio" && <audio controls src={item.previewUrl} style={{ width: "100%" }} />}
    {item.mediaType === "video" && <video controls src={item.previewUrl} style={{ width: "100%", maxHeight: "150px" }} />}
  </Box>
);

const MediaCard = ({ item, questionId, isFirst, isLast, onMoveUp, onMoveDown, onDeleted, onSaved }) => {
  const toast = useToast();
  const [altText, setAltText] = useState(item.altText || "");
  const [transcript, setTranscript] = useState(item.transcript || "");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateExamQuestionBankMedia(questionId, item.id, { altText, transcript });
      toast({ title: "Saved", status: "success", duration: 2000, isClosable: true });
      onSaved?.();
    } catch {
      toast({ title: "Failed to save", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExamQuestionBankMedia(questionId, item.id);
      setConfirmOpen(false);
      onDeleted?.();
    } catch {
      toast({ title: "Failed to remove media", status: "error", duration: 3000, isClosable: true });
      setDeleting(false);
    }
  };

  return (
    <>
      <Box border="1px solid #E2E8F0" borderRadius="8px" p="16px" bg="#F7FAFC">
        <Flex justifyContent="space-between" alignItems="flex-start" mb="12px">
          <Flex alignItems="center" gap="8px">
            {MEDIA_ICON[item.mediaType]}
            <Badge
              bg={item.mediaType === "image" ? "#F0E6FF" : item.mediaType === "audio" ? "#E6F4EA" : "#EBF4FF"}
              color={item.mediaType === "image" ? "#6b006b" : item.mediaType === "audio" ? "#38A169" : "#3182CE"}
              textTransform="none"
              fontSize="11px"
              px="8px"
              borderRadius="6px"
            >
              {item.mediaType}
            </Badge>
            <Text fontSize="11px" color="gray.400">
              {item.mimeType} · {formatBytes(item.fileSizeBytes)}
            </Text>
          </Flex>
          <Flex gap="4px">
            <IconButton aria-label="Move up" icon={<FiArrowUp size={12} />} size="xs" variant="ghost" isDisabled={isFirst} onClick={onMoveUp} />
            <IconButton aria-label="Move down" icon={<FiArrowDown size={12} />} size="xs" variant="ghost" isDisabled={isLast} onClick={onMoveDown} />
            <IconButton aria-label="Remove" icon={<FiTrash2 size={12} />} size="xs" variant="ghost" colorScheme="red" onClick={() => setConfirmOpen(true)} />
          </Flex>
        </Flex>

        <Box mb="12px">
          {item.mediaType === "image" && (
            <Box maxH="120px" overflow="hidden" borderRadius="6px" mb="8px">
              <img src={item.url} alt={item.altText || ""} style={{ maxHeight: "120px", objectFit: "contain" }} />
            </Box>
          )}
          {item.mediaType === "audio" && <audio controls src={item.url} style={{ width: "100%", marginBottom: "8px" }} />}
          {item.mediaType === "video" && (
            <video controls src={item.url} poster={item.thumbnailUrl} style={{ width: "100%", maxHeight: "150px", marginBottom: "8px" }} />
          )}
          <Text fontSize="11px" color="gray.500" noOfLines={1}>
            {item.url}
          </Text>
        </Box>

        {item.mediaType === "image" && (
          <FormControl mb="10px">
            <FormLabel fontSize="12px" fontWeight="500" color="gray.600" mb="2px">
              Alt Text
            </FormLabel>
            <Input size="sm" borderRadius="6px" bg="white" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image..." />
          </FormControl>
        )}
        {(item.mediaType === "audio" || item.mediaType === "video") && (
          <FormControl mb="10px">
            <FormLabel fontSize="12px" fontWeight="500" color="gray.600" mb="2px">
              Transcript
            </FormLabel>
            <Textarea size="sm" borderRadius="6px" bg="white" rows={2} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Full transcript..." />
          </FormControl>
        )}

        <Flex justifyContent="flex-end">
          <Button size="xs" secondary isLoading={saving} onClick={handleSave}>
            Save changes
          </Button>
        </Flex>
      </Box>

      <AlertDialog isOpen={confirmOpen} leastDestructiveRef={cancelRef} onClose={() => setConfirmOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="15px" fontWeight="600">
              Remove Media
            </AlertDialogHeader>
            <AlertDialogBody fontSize="14px">Remove this media? This cannot be undone.</AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={cancelRef} onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button isLoading={deleting} onClick={handleDelete}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const QUESTION_TYPE_OPTIONS = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "true_false", label: "True / False" },
  { value: "essay", label: "Essay" },
  { value: "fill_blank", label: "Fill in the Blank" },
  { value: "short_answer", label: "Short Answer" },
];

const ExamQuestionBankFormPage = () => {
  const { questionId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();
  const isEdit = Boolean(questionId);
  const isSuperAdmin = useIsSuperAdmin();
  const duplicateFromId = !isEdit ? location.state?.duplicateFromId : null;

  const { isOpen: isAddMediaOpen, onOpen: onAddMediaOpen, onClose: onAddMediaClose } = useDisclosure();

  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("mcq");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [marks, setMarks] = useState("1");
  const [difficultyLevel, setDifficultyLevel] = useState("Medium");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  // Files picked before the question exists; uploaded right after create.
  const [pendingMedia, setPendingMedia] = useState([]);
  const pendingMediaRef = useRef(pendingMedia);
  pendingMediaRef.current = pendingMedia;

  useEffect(() => () => pendingMediaRef.current.forEach((m) => URL.revokeObjectURL(m.previewUrl)), []);

  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingPayloadRef = useRef(null);
  const createdIdRef = useRef(null);

  useEffect(() => {
    adminGetCourseListing({ limit: 200 })
      .then((res) => setCourses(res?.courses || []))
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!courseId) {
      setModules([]);
      return;
    }
    adminListModules(courseId)
      .then((res) => setModules(res?.modules || []))
      .catch(() => setModules([]));
  }, [courseId]);

  const loadMedia = useCallback(async () => {
    if (!questionId) return;
    setLoadingMedia(true);
    try {
      const res = await getExamQuestionBankMedia(questionId);
      setMedia(res?.data?.media ?? res?.media ?? res?.data ?? []);
    } catch {
      /* non-fatal */
    } finally {
      setLoadingMedia(false);
    }
  }, [questionId]);

  useEffect(() => {
    if (!isEdit) return;
    setInitialLoading(true);
    Promise.all([getExamQuestionBankItem(questionId), getExamQuestionBankMedia(questionId)])
      .then(([qRes, mRes]) => {
        const q = qRes?.data ?? qRes;
        setQuestion(q.question ?? "");
        setQuestionType(q.questionType ?? "mcq");
        if (Array.isArray(q.options) && q.options.length) {
          setOptions(q.options.map((o) => ({ text: o.text ?? "", isCorrect: !!o.isCorrect })));
        }
        setCorrectAnswer(q.correctAnswer ?? "");
        setExplanation(q.explanation ?? "");
        setMarks(String(q.marks ?? 1));
        setDifficultyLevel(q.difficultyLevel ?? "Medium");
        setCategory(q.category ?? "");
        setTags(Array.isArray(q.tags) ? q.tags.join(", ") : "");
        setStatus(q.status ?? "draft");
        setCourseId(q.courseId ?? "");
        setModuleId(q.moduleId ?? "");
        setMedia(mRes?.data?.media ?? mRes?.media ?? mRes?.data ?? []);
      })
      .catch(() => toast({ title: "Failed to load question", status: "error", duration: 3000, isClosable: true }))
      .finally(() => setInitialLoading(false));
  }, [isEdit, questionId, toast]);

  // "Create this question" from the bank list — pull in the source question's
  // fields as a starting point, but this is always a brand new item, so it
  // never carries over the source's media or status.
  useEffect(() => {
    if (isEdit || !duplicateFromId) return;
    setInitialLoading(true);
    getExamQuestionBankItem(duplicateFromId)
      .then((qRes) => {
        const q = qRes?.data ?? qRes;
        setQuestion(q.question ?? "");
        setQuestionType(q.questionType ?? "mcq");
        if (Array.isArray(q.options) && q.options.length) {
          setOptions(q.options.map((o) => ({ text: o.text ?? "", isCorrect: !!o.isCorrect })));
        }
        setCorrectAnswer(q.correctAnswer ?? "");
        setExplanation(q.explanation ?? "");
        setMarks(String(q.marks ?? 1));
        setDifficultyLevel(q.difficultyLevel ?? "Medium");
        setCategory(q.category ?? "");
        setTags(Array.isArray(q.tags) ? q.tags.join(", ") : "");
        setCourseId(q.courseId ?? "");
        setModuleId(q.moduleId ?? "");
      })
      .catch(() => toast({ title: "Failed to load question to duplicate", status: "error", duration: 3000, isClosable: true }))
      .finally(() => setInitialLoading(false));
  }, [isEdit, duplicateFromId, toast]);

  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  };

  const removeOption = (idx) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const setCorrectOption = (idx) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  };

  const handleAddMedia = async (entry) => {
    if (isEdit) {
      await addExamQuestionBankMedia(questionId, { ...entry, sortOrder: media.length });
      toast({ title: "Media added successfully", status: "success", duration: 3000, isClosable: true });
      loadMedia();
      return;
    }
    setPendingMedia((prev) => [
      ...prev,
      { ...entry, key: `${Date.now()}-${entry.file.name}`, previewUrl: URL.createObjectURL(entry.file) },
    ]);
  };

  const removePendingMedia = (key) => {
    setPendingMedia((prev) => {
      const target = prev.find((m) => m.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((m) => m.key !== key);
    });
  };

  const uploadPendingMedia = async (newId) => {
    let failed = 0;
    for (const [idx, { key, previewUrl, ...entry }] of pendingMediaRef.current.entries()) {
      try {
        await addExamQuestionBankMedia(newId, { ...entry, sortOrder: idx });
      } catch (err) {
        failed += 1;
        console.error("[ExamQuestionBankFormPage] failed to upload media", entry.file.name, err?.response?.data ?? err);
      }
    }
    if (failed) {
      toast({
        title: `Question created, but ${failed} media file${failed > 1 ? "s" : ""} failed to upload`,
        description: "You can re-attach them from the edit page.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const moveMedia = async (idx, dir) => {
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= media.length) return;
    const next = [...media];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setMedia(next);
    try {
      await Promise.all([
        updateExamQuestionBankMedia(questionId, next[idx].id, { sortOrder: idx }),
        updateExamQuestionBankMedia(questionId, next[swapIdx].id, { sortOrder: swapIdx }),
      ]);
    } catch {
      toast({ title: "Failed to update order", status: "error", duration: 3000, isClosable: true });
    }
  };

  const buildPayload = () => {
    const payload = {
      question: question.trim(),
      questionType,
      marks: parseInt(marks) || 1,
      difficultyLevel,
      status,
    };
    if (explanation.trim()) payload.explanation = explanation.trim();
    if (category.trim()) payload.category = category.trim();
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagList.length) payload.tags = tagList;
    if (courseId) payload.courseId = courseId;
    if (moduleId) payload.moduleId = moduleId;

    if (questionType === "mcq") {
      const cleaned = options.filter((o) => o.text.trim());
      payload.options = cleaned.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }));
      payload.correctAnswer = cleaned.find((o) => o.isCorrect)?.text ?? "";
    } else if (questionType === "true_false") {
      payload.options = ["True", "False"].map((text) => ({ text, isCorrect: text === correctAnswer }));
      payload.correctAnswer = correctAnswer.trim();
    } else {
      payload.correctAnswer = correctAnswer.trim();
    }
    return payload;
  };

  const validate = () => {
    if (!question.trim()) {
      toast({ title: "Question content is required", status: "warning", duration: 3000, isClosable: true });
      return false;
    }
    if (questionType === "mcq") {
      const filled = options.filter((o) => o.text.trim());
      if (filled.length < 2) {
        toast({ title: "Add at least 2 options", status: "warning", duration: 3000, isClosable: true });
        return false;
      }
      if (!filled.some((o) => o.isCorrect)) {
        toast({ title: "Select the correct option", status: "warning", duration: 3000, isClosable: true });
        return false;
      }
    } else if (questionType !== "essay" && !correctAnswer.trim()) {
      toast({ title: "Correct answer is required", status: "warning", duration: 3000, isClosable: true });
      return false;
    }
    return true;
  };

  const performCreate = async (payload) => {
    const res = await createExamQuestionBankItem(payload);
    const d = res?.data ?? res;
    const newId = d?.id ?? d?._id ?? d?.questionId;
    createdIdRef.current = newId;
    if (newId && pendingMediaRef.current.length) await uploadPendingMedia(newId);
    return { id: newId };
  };

  const goToCreatedQuestion = () => {
    history.push(createdIdRef.current ? `/admin/exam-question-bank/${createdIdRef.current}/edit` : "/admin/exam-question-bank");
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = buildPayload();
    setSaving(true);
    try {
      if (isEdit) {
        await updateExamQuestionBankItem(questionId, payload);
        toast({ title: "Question updated", status: "success", duration: 3000, isClosable: true });
        return;
      }

      // Creation always goes through the approval modal — everyone,
      // including super admin, must assign a supervisor (or, for super
      // admin, submit with an explicit null) before the question is
      // created at all.
      const contentTitle = payload.question.length > 80 ? `${payload.question.slice(0, 80)}...` : payload.question;
      const requestType = moduleId ? "Module" : "CourseAssessment";
      pendingPayloadRef.current = payload;
      setWorkflowContent({ contentTitle, requestType });
      setWorkflowModalOpen(true);
    } catch (err) {
      console.error("[ExamQuestionBankFormPage] failed to save question", payload, err?.response?.data ?? err);
      toast({
        title: err?.response?.data?.message || "Failed to save question",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="300px">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );
  }

  return (
    <Box marginX="22px" marginY="20px" maxW="900px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/exam-question-bank">Question Bank</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{isEdit ? "Edit Question" : "New Question"}</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Flex alignItems="center" gap="12px" mb="24px">
        <Flex as="button" alignItems="center" gap="6px" color="#6b006b" onClick={() => history.push("/admin/exam-question-bank")} _hover={{ opacity: 0.8 }}>
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">
            Question Bank
          </Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Heading fontSize="20px" fontWeight="600">
          {isEdit ? "Edit Question" : "New Question"}
        </Heading>
      </Flex>

      <Flex direction="column" gap="20px">
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="16px">
            Question Metadata
          </Text>
          <Flex gap="16px" flexWrap="wrap">
            <FormControl flex="1" minW="160px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Question Type
              </FormLabel>
              <Select size="sm" borderRadius="6px" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                {QUESTION_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl flex="1" minW="140px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Difficulty
              </FormLabel>
              <Select size="sm" borderRadius="6px" value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </FormControl>

            <FormControl flex="0 0 100px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Marks
              </FormLabel>
              <Input size="sm" borderRadius="6px" type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} />
            </FormControl>

            <FormControl flex="1" minW="160px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Status
              </FormLabel>
              <Select size="sm" borderRadius="6px" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
          </Flex>

          <Flex gap="16px" flexWrap="wrap" mt="16px">
            <FormControl flex="1" minW="180px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Category (optional)
              </FormLabel>
              <Input size="sm" borderRadius="6px" placeholder="e.g. Biology" value={category} onChange={(e) => setCategory(e.target.value)} />
            </FormControl>
            <FormControl flex="1" minW="220px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Tags (comma-separated, optional)
              </FormLabel>
              <Input size="sm" borderRadius="6px" placeholder="cells, biology, easy" value={tags} onChange={(e) => setTags(e.target.value)} />
            </FormControl>
          </Flex>

          <Flex gap="16px" flexWrap="wrap" mt="16px">
            <FormControl flex="1" minW="180px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Course (optional)
              </FormLabel>
              <Select
                size="sm"
                borderRadius="6px"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setModuleId("");
                }}
              >
                <option value="">No course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl flex="1" minW="180px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Module (optional)
              </FormLabel>
              <Select size="sm" borderRadius="6px" value={moduleId} onChange={(e) => setModuleId(e.target.value)} isDisabled={!courseId}>
                <option value="">No module</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>
        </Box>

        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="16px">
            Question Content
          </Text>
          <Textarea size="sm" borderRadius="6px" rows={5} placeholder="Type your question here..." value={question} onChange={(e) => setQuestion(e.target.value)} />

          <FormControl mt="16px">
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Explanation (optional)
            </FormLabel>
            <Textarea
              size="sm"
              borderRadius="6px"
              rows={3}
              placeholder="Explain the correct answer / grading guidance..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </FormControl>
        </Box>

        {questionType === "mcq" && (
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Answer Options ({options.length})
              </Text>
              {options.length < 6 && (
                <Button secondary size="sm" leftIcon={<FiPlus />} onClick={addOption}>
                  Add Option
                </Button>
              )}
            </Flex>
            <RadioGroup value={String(options.findIndex((o) => o.isCorrect))}>
              <Flex direction="column" gap="10px">
                {options.map((opt, idx) => (
                  <Flex key={idx} alignItems="center" gap="12px" p="10px" bg="#F7FAFC" borderRadius="8px" border="1px solid #E2E8F0">
                    <Radio value={String(idx)} onChange={() => setCorrectOption(idx)} colorScheme="green" />
                    <Box w="28px" h="28px" bg="#F0E6FF" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                      <Text fontSize="12px" fontWeight="700" color="#6b006b">
                        {OPTION_LABELS[idx] ?? idx + 1}
                      </Text>
                    </Box>
                    <Input
                      size="sm"
                      borderRadius="6px"
                      bg="white"
                      flex="1"
                      placeholder={`Option ${OPTION_LABELS[idx] ?? idx + 1}`}
                      value={opt.text}
                      onChange={(e) => setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text: e.target.value } : o)))}
                    />
                    {options.length > 2 && (
                      <IconButton aria-label="Remove option" icon={<FiTrash2 size={12} />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeOption(idx)} />
                    )}
                  </Flex>
                ))}
              </Flex>
            </RadioGroup>
            <Text fontSize="11px" color="gray.400" mt="8px">
              Select the radio button next to the correct answer.
            </Text>
          </Box>
        )}

        {questionType === "true_false" && (
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="16px">
              Correct Answer
            </Text>
            <RadioGroup value={correctAnswer} onChange={setCorrectAnswer}>
              <Flex gap="12px">
                {["True", "False"].map((label) => (
                  <Flex key={label} alignItems="center" gap="8px" p="12px 20px" bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px">
                    <Radio value={label} colorScheme="purple" />
                    <Text fontSize="14px" fontWeight="600">
                      {label}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </RadioGroup>
          </Box>
        )}

        {(questionType === "fill_blank" || questionType === "short_answer") && (
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Correct Answer
              </FormLabel>
              {questionType === "short_answer" ? (
                <Textarea size="sm" borderRadius="6px" rows={3} value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Model answer..." />
              ) : (
                <Input size="sm" borderRadius="6px" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Exact expected answer..." />
              )}
            </FormControl>
          </Box>
        )}

        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Media Attachments ({isEdit ? media.length : pendingMedia.length})
              </Text>
              <Button secondary size="sm" leftIcon={<FiPlus />} onClick={onAddMediaOpen}>
                Add Media
              </Button>
            </Flex>

            {loadingMedia ? (
              <Flex justifyContent="center" py="24px">
                <Spinner size="md" color="#6b006b" />
              </Flex>
            ) : !isEdit ? (
              pendingMedia.length === 0 ? (
                <Box bg="#F7FAFC" borderRadius="8px" p="24px" textAlign="center">
                  <Text fontSize="13px" color="gray.400">
                    No media attached. Add images, audio, or video — they'll upload when you create the question.
                  </Text>
                </Box>
              ) : (
                <Flex direction="column" gap="12px">
                  {pendingMedia.map((item) => (
                    <PendingMediaCard key={item.key} item={item} onRemove={() => removePendingMedia(item.key)} />
                  ))}
                </Flex>
              )
            ) : media.length === 0 ? (
              <Box bg="#F7FAFC" borderRadius="8px" p="24px" textAlign="center">
                <Text fontSize="13px" color="gray.400">
                  No media attached. Add images, audio, or video.
                </Text>
              </Box>
            ) : (
              <Flex direction="column" gap="12px">
                {media.map((item, idx) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    questionId={questionId}
                    isFirst={idx === 0}
                    isLast={idx === media.length - 1}
                    onMoveUp={() => moveMedia(idx, "up")}
                    onMoveDown={() => moveMedia(idx, "down")}
                    onDeleted={loadMedia}
                    onSaved={loadMedia}
                  />
                ))}
              </Flex>
            )}
        </Box>

        {!isEdit && duplicateFromId && (
          <Box bg="#EBF4FF" border="1px solid #BEE3F8" borderRadius="8px" p="12px">
            <Text fontSize="13px" color="#2B6CB0">
              This is a new question pre-filled from the one you duplicated — review or edit it, then create it. It won't affect the original.
            </Text>
          </Box>
        )}

        <Divider />

        <Flex justifyContent="flex-end" alignItems="center">
          <Flex gap="10px">
            <Button secondary onClick={() => history.push("/admin/exam-question-bank")}>
              Cancel
            </Button>
            <Button leftIcon={<FiSave />} isLoading={saving} onClick={handleSave}>
              {isEdit ? "Update" : "Create"} Question
            </Button>
          </Flex>
        </Flex>
      </Flex>

      <AddMediaModal isOpen={isAddMediaOpen} onClose={onAddMediaClose} onSubmit={handleAddMedia} />

      {!isEdit && workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          onCreate={
            // Create and submit-for-approval are separate endpoints — the
            // supervisor link is recorded by the workflow submission call
            // this modal makes right after onCreate resolves, not here.
            () => performCreate(pendingPayloadRef.current)
          }
          onSuccess={goToCreatedQuestion}
        />
      )}
    </Box>
  );
};

export const ExamQuestionBankFormPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamQuestionBankFormPage {...props} />} />
);

export default ExamQuestionBankFormPage;
