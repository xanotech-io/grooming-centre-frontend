import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
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
  Switch,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Button, Heading } from "../../../components";
import {
  addQuestionMedia,
  createMultimediaQuestion,
  deleteQuestionMedia,
  getMultimediaQuestion,
  getQuestionMedia,
  previewMultimediaQuestion,
  updateMultimediaQuestion,
  updateQuestionMedia,
} from "../../../services";
import { FiArrowLeft, FiArrowUp, FiArrowDown, FiTrash2, FiPlus, FiEye, FiSave } from "react-icons/fi";
import { FaImage, FaMicrophone, FaVideo } from "react-icons/fa";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];
const MAX_FILE_BYTES = 5242880;

const ALLOWED_MIME = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/aac"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
};

const MEDIA_ICON = { image: <FaImage color="#6b006b" />, audio: <FaMicrophone color="#38A169" />, video: <FaVideo color="#3182CE" /> };

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ─── Add Media Modal ────────────────────────────────────────────────────────

const EMPTY_MEDIA_FORM = {
  mediaType: "image",
  url: "",
  mimeType: "",
  fileSizeBytes: "",
  durationSeconds: "",
  altText: "",
  transcript: "",
  isAccessible: true,
};

const AddMediaModal = ({ isOpen, onClose, questionId, currentCount, onAdded }) => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_MEDIA_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setForm(EMPTY_MEDIA_FORM); }, [isOpen]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!form.url.startsWith("https://")) { toast({ title: "URL must start with https://", status: "warning", duration: 3000, isClosable: true }); return false; }
    if (!form.mimeType.trim()) { toast({ title: "MIME type is required", status: "warning", duration: 3000, isClosable: true }); return false; }
    if (!ALLOWED_MIME[form.mediaType]?.includes(form.mimeType.trim())) {
      toast({ title: `Invalid MIME type for ${form.mediaType}. Allowed: ${ALLOWED_MIME[form.mediaType].join(", ")}`, status: "warning", duration: 4000, isClosable: true });
      return false;
    }
    const sizeVal = parseInt(form.fileSizeBytes) || 0;
    if (sizeVal > MAX_FILE_BYTES) { toast({ title: "File exceeds the 5 MB size limit", status: "warning", duration: 3000, isClosable: true }); return false; }
    if (!form.altText.trim() && form.mediaType === "image") {
      toast({ title: "Alt text is recommended for images (accessibility)", status: "info", duration: 3000, isClosable: true });
    }
    if (!form.transcript.trim() && (form.mediaType === "audio" || form.mediaType === "video")) {
      toast({ title: "Transcript is recommended for audio/video (accessibility)", status: "info", duration: 3000, isClosable: true });
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const body = {
      mediaType: form.mediaType,
      url: form.url.trim(),
      mimeType: form.mimeType.trim(),
      fileSizeBytes: parseInt(form.fileSizeBytes) || 0,
      isAccessible: form.isAccessible,
      sortOrder: currentCount,
    };
    if (form.durationSeconds) body.durationSeconds = parseFloat(form.durationSeconds);
    if (form.altText.trim()) body.altText = form.altText.trim();
    if (form.transcript.trim()) body.transcript = form.transcript.trim();

    setSubmitting(true);
    try {
      await addQuestionMedia(questionId, body);
      toast({ title: "Media added successfully", status: "success", duration: 3000, isClosable: true });
      onAdded();
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
        <ModalHeader fontSize="16px" fontWeight="600">Add Media Attachment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Media Type</FormLabel>
              <Select size="sm" borderRadius="6px" value={form.mediaType} onChange={(e) => set("mediaType", e.target.value)}>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">CDN URL</FormLabel>
              <Input size="sm" borderRadius="6px" placeholder="https://cdn.example.com/media/file.png" value={form.url} onChange={(e) => set("url", e.target.value)} />
              <Text fontSize="11px" color="gray.400" mt="2px">Upload your file to CDN first, then paste the URL here.</Text>
            </FormControl>

            <Flex gap="12px">
              <FormControl isRequired flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">MIME Type</FormLabel>
                <Input size="sm" borderRadius="6px" placeholder="image/png" value={form.mimeType} onChange={(e) => set("mimeType", e.target.value)} />
              </FormControl>
              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">File Size (bytes)</FormLabel>
                <Input size="sm" borderRadius="6px" type="number" placeholder="204800" value={form.fileSizeBytes} onChange={(e) => set("fileSizeBytes", e.target.value)} />
              </FormControl>
            </Flex>

            {(form.mediaType === "audio" || form.mediaType === "video") && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Duration (seconds, optional)</FormLabel>
                <Input size="sm" borderRadius="6px" type="number" placeholder="120" value={form.durationSeconds} onChange={(e) => set("durationSeconds", e.target.value)} />
              </FormControl>
            )}

            {form.mediaType === "image" && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Alt Text (accessibility)</FormLabel>
                <Input size="sm" borderRadius="6px" placeholder="Diagram of a plant cell" value={form.altText} onChange={(e) => set("altText", e.target.value)} />
              </FormControl>
            )}

            {(form.mediaType === "audio" || form.mediaType === "video") && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Transcript (accessibility)</FormLabel>
                <Textarea size="sm" borderRadius="6px" rows={3} placeholder="Full transcript..." value={form.transcript} onChange={(e) => set("transcript", e.target.value)} />
              </FormControl>
            )}

            <Flex alignItems="center" justifyContent="space-between" bg="#F7FAFC" borderRadius="8px" p="12px">
              <Text fontSize="13px" color="gray.600" fontWeight="500">Mark as accessible</Text>
              <Switch isChecked={form.isAccessible} onChange={(e) => set("isAccessible", e.target.checked)} colorScheme="green" />
            </Flex>

            <Box bg="#EBF4FF" borderRadius="6px" p="10px">
              <Text fontSize="11px" color="#2B6CB0">
                Allowed types — Image: jpeg/png/gif/webp/svg · Audio: mpeg/wav/ogg/webm/aac · Video: mp4/webm/ogg/quicktime · Max: 5 MB
              </Text>
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter gap="8px">
          <Button secondary onClick={onClose} isDisabled={submitting}>Cancel</Button>
          <Button isLoading={submitting} onClick={handleSubmit}>Add Media</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ─── Media Card ─────────────────────────────────────────────────────────────

const MediaCard = ({ item, questionId, isFirst, isLast, onMoveUp, onMoveDown, onDeleted, onSaved }) => {
  const toast = useToast();
  const [altText, setAltText] = useState(item.altText || "");
  const [transcript, setTranscript] = useState(item.transcript || "");
  const [isAccessible, setIsAccessible] = useState(item.isAccessible ?? true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateQuestionMedia(questionId, item.id, { altText, transcript, isAccessible });
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
      await deleteQuestionMedia(questionId, item.id);
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
              textTransform="none" fontSize="11px" px="8px" borderRadius="6px"
            >
              {item.mediaType}
            </Badge>
            <Text fontSize="11px" color="gray.400">{item.mimeType} · {formatBytes(item.fileSizeBytes)}</Text>
            {item.durationSeconds && (
              <Text fontSize="11px" color="gray.400">{item.durationSeconds}s</Text>
            )}
          </Flex>
          <Flex gap="4px">
            <IconButton aria-label="Move up" icon={<FiArrowUp size={12} />} size="xs" variant="ghost" isDisabled={isFirst} onClick={onMoveUp} />
            <IconButton aria-label="Move down" icon={<FiArrowDown size={12} />} size="xs" variant="ghost" isDisabled={isLast} onClick={onMoveDown} />
            <IconButton aria-label="Remove" icon={<FiTrash2 size={12} />} size="xs" variant="ghost" colorScheme="red" onClick={() => setConfirmOpen(true)} />
          </Flex>
        </Flex>

        {/* Preview */}
        <Box mb="12px">
          {item.mediaType === "image" && (
            <Box maxH="120px" overflow="hidden" borderRadius="6px" mb="8px">
              <img src={item.url} alt={item.altText || ""} style={{ maxHeight: "120px", objectFit: "contain" }} />
            </Box>
          )}
          {item.mediaType === "audio" && (
            <audio controls src={item.url} style={{ width: "100%", marginBottom: "8px" }} />
          )}
          {item.mediaType === "video" && (
            <video controls src={item.url} poster={item.thumbnailUrl} style={{ width: "100%", maxHeight: "150px", marginBottom: "8px" }} />
          )}
          <Text fontSize="11px" color="gray.500" noOfLines={1}>{item.url}</Text>
        </Box>

        {item.mediaType === "image" && (
          <FormControl mb="10px">
            <FormLabel fontSize="12px" fontWeight="500" color="gray.600" mb="2px">Alt Text</FormLabel>
            <Input size="sm" borderRadius="6px" bg="white" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image..." />
          </FormControl>
        )}
        {(item.mediaType === "audio" || item.mediaType === "video") && (
          <FormControl mb="10px">
            <FormLabel fontSize="12px" fontWeight="500" color="gray.600" mb="2px">Transcript</FormLabel>
            <Textarea size="sm" borderRadius="6px" bg="white" rows={2} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Full transcript..." />
          </FormControl>
        )}

        <Flex alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap="8px">
            <Switch size="sm" isChecked={isAccessible} onChange={(e) => setIsAccessible(e.target.checked)} colorScheme="green" />
            <Text fontSize="12px" color="gray.600">Accessible</Text>
          </Flex>
          <Button size="xs" secondary isLoading={saving} onClick={handleSave}>Save changes</Button>
        </Flex>
      </Box>

      <AlertDialog isOpen={confirmOpen} leastDestructiveRef={cancelRef} onClose={() => setConfirmOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="15px" fontWeight="600">Remove Media</AlertDialogHeader>
            <AlertDialogBody fontSize="14px">Remove this media? This cannot be undone.</AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={cancelRef} onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button isLoading={deleting} onClick={handleDelete}>Remove</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

// ─── Student Preview Modal ────────────────────────────────────────────────────

const PreviewMediaItem = ({ item }) => (
  <Box mb="12px">
    {item.mediaType === "image" && (
      <img src={item.url} alt={item.altText || ""} style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px" }} />
    )}
    {item.mediaType === "audio" && <audio controls src={item.url} style={{ width: "100%" }} />}
    {item.mediaType === "video" && (
      <video controls src={item.url} poster={item.thumbnailUrl} style={{ width: "100%", maxHeight: "300px", borderRadius: "8px" }} />
    )}
  </Box>
);

const StudentPreviewModal = ({ isOpen, onClose, data, loading }) => {
  const q = data;
  const sorted = q?.media ? [...q.media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottom="1px solid #E2E8F0" pb="12px">
          <Flex alignItems="center" gap="10px">
            <Text fontSize="15px" fontWeight="600">Student Preview</Text>
            {q?.questionType && (
              <Badge bg="#EBF4FF" color="#3182CE" px="8px" py="2px" borderRadius="6px" textTransform="none" fontSize="11px">
                {(q.questionType || "").replace(/_/g, " ")}
              </Badge>
            )}
            {q?.marks != null && (
              <Badge bg="#F0E6FF" color="#6b006b" px="8px" py="2px" borderRadius="6px" fontSize="11px">
                {q.marks} mark{q.marks !== 1 ? "s" : ""}
              </Badge>
            )}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py="20px">
          {loading && (
            <Flex justifyContent="center" alignItems="center" minH="200px">
              <Spinner size="lg" color="#6b006b" />
            </Flex>
          )}
          {!loading && q && (
            <>
              {sorted.length > 0 && sorted.map((m) => <PreviewMediaItem key={m.id} item={m} />)}

              {q.displayContent && (
                <Box mb="16px" p="16px" bg="#F7FAFC" borderRadius="8px" border="1px solid #E2E8F0">
                  <Text fontSize="15px" fontWeight="500" color="#1A202C" lineHeight="1.6"
                    dangerouslySetInnerHTML={{ __html: q.displayContent }}
                  />
                </Box>
              )}

              {/* MCQ options */}
              {q.questionType === "mcq" && q.options?.length > 0 && (
                <RadioGroup>
                  <Flex direction="column" gap="10px">
                    {q.options.map((opt) => (
                      <Flex key={opt.id ?? opt.optionIndex} alignItems="center" gap="10px" p="12px"
                        bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" cursor="pointer"
                      >
                        <Radio value={String(opt.id ?? opt.optionIndex)} colorScheme="purple" />
                        <Text fontSize="14px">
                          <Text as="span" color="#6b006b" fontWeight="700" mr="6px">{opt.optionIndex}.</Text>
                          {opt.name}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                </RadioGroup>
              )}

              {/* True / False */}
              {q.questionType === "true_false" && (
                <RadioGroup>
                  <Flex gap="12px">
                    {["True", "False"].map((label) => (
                      <Flex key={label} alignItems="center" gap="8px" p="12px 20px"
                        bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" cursor="pointer"
                      >
                        <Radio value={label} colorScheme="purple" />
                        <Text fontSize="14px" fontWeight="600">{label}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </RadioGroup>
              )}

              {/* Essay */}
              {q.questionType === "essay" && (
                <Textarea isReadOnly rows={5} placeholder="Write your answer here…" borderRadius="8px" bg="#F7FAFC" fontSize="14px" />
              )}

              {/* Fill in the blank */}
              {q.questionType === "fill_in_the_blank" && (
                <Box as="input" type="text" placeholder="Your answer…" readOnly
                  p="10px 14px" border="1px solid #E2E8F0" borderRadius="8px" fontSize="14px" bg="#F7FAFC" w="100%"
                />
              )}

              {/* Matching */}
              {q.questionType === "matching" && (
                <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" p="16px">
                  <Text fontSize="13px" color="gray.400">Matching — drag/drop interface shown to students</Text>
                </Box>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter borderTop="1px solid #E2E8F0" gap="10px">
          <Button secondary onClick={onClose}>Close Preview</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ─── Main Editor ─────────────────────────────────────────────────────────────

const QuestionEditorPage = () => {
  const { examinationId, questionId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const isEdit = Boolean(questionId);
  const [examType, setExamType] = useState("standalone_examination");

  const { isOpen: isAddMediaOpen, onOpen: onAddMediaOpen, onClose: onAddMediaClose } = useDisclosure();

  // Metadata
  const [questionType, setQuestionType] = useState("mcq");
  const [difficultyLevel, setDifficultyLevel] = useState("Easy");
  const [marks, setMarks] = useState("1");
  const [section, setSection] = useState("");
  const [rubric, setRubric] = useState("");

  // Content
  const [contentFormat, setContentFormat] = useState("plain");
  const [questionText, setQuestionText] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [latexEquation, setLatexEquation] = useState("");
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  // MCQ Options
  const [options, setOptions] = useState([
    { optionIndex: "A", name: "", isAnswer: false },
    { optionIndex: "B", name: "", isAnswer: false },
  ]);

  // Media
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // UI
  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  const loadMedia = useCallback(async () => {
    if (!questionId) return;
    setLoadingMedia(true);
    try {
      const res = await getQuestionMedia(questionId);
      setMedia(res?.data?.media ?? res?.media ?? []);
    } catch {
      /* non-fatal */
    } finally {
      setLoadingMedia(false);
    }
  }, [questionId]);

  useEffect(() => {
    if (!isEdit) return;
    setInitialLoading(true);
    Promise.all([getMultimediaQuestion(questionId), getQuestionMedia(questionId)])
      .then(([qRes, mRes]) => {
        const q = qRes?.data ?? qRes;
        setQuestionType(q.questionType ?? "mcq");
        setDifficultyLevel(q.difficultyLevel ?? "Easy");
        setMarks(String(q.marks ?? 1));
        setSection(q.section ?? "");
        setRubric(q.rubric ?? "");
        setContentFormat(q.contentFormat ?? "plain");
        setQuestionText(q.question ?? "");
        setContentHtml(q.contentHtml ?? "");
        setLatexEquation(q.latexEquation ?? "");
        if (q.options?.length) {
          setOptions(q.options.map((o) => ({ optionIndex: o.optionIndex, name: o.name, isAnswer: o.isAnswer })));
        }
        setMedia(mRes?.data?.media ?? mRes?.media ?? []);
      })
      .catch(() => toast({ title: "Failed to load question", status: "error", duration: 3000, isClosable: true }))
      .finally(() => setInitialLoading(false));
  }, [isEdit, questionId, toast]);

  const addOption = () => {
    setOptions((prev) => {
      const nextLabel = OPTION_LABELS[prev.length] ?? String.fromCharCode(65 + prev.length);
      return [...prev, { optionIndex: nextLabel, name: "", isAnswer: false }];
    });
  };

  const removeOption = (idx) => {
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((o, i) => ({ ...o, optionIndex: OPTION_LABELS[i] ?? String.fromCharCode(65 + i) }));
    });
  };

  const setCorrectOption = (idx) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isAnswer: i === idx })));
  };

  const moveMedia = async (idx, dir) => {
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= media.length) return;
    const next = [...media];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setMedia(next);
    try {
      await Promise.all([
        updateQuestionMedia(questionId, next[idx].id, { sortOrder: idx }),
        updateQuestionMedia(questionId, next[swapIdx].id, { sortOrder: swapIdx }),
      ]);
    } catch {
      toast({ title: "Failed to update order", status: "error", duration: 3000, isClosable: true });
    }
  };

  const buildPayload = () => ({
    examType,
    questionType,
    difficultyLevel,
    marks: parseInt(marks) || 1,
    contentFormat,
    ...(contentFormat === "plain" ? { question: questionText.trim() } : { contentHtml: contentHtml.trim() }),
    ...(latexEquation.trim() ? { latexEquation: latexEquation.trim() } : {}),
    ...(section.trim() ? { section: section.trim() } : {}),
    ...(rubric.trim() && questionType === "essay" ? { rubric: rubric.trim() } : {}),
    ...(questionType === "mcq"
      ? {
          options: options.filter((o) => o.name.trim()).map((o) => ({
            optionIndex: o.optionIndex,
            name: o.name.trim(),
            isAnswer: o.isAnswer,
          })),
          correctAnswer: options.find((o) => o.isAnswer)?.name ?? "",
        }
      : {}),
  });

  const validateContent = () => {
    if (contentFormat === "plain" && !questionText.trim()) {
      toast({ title: "Question content is required", status: "warning", duration: 3000, isClosable: true });
      return false;
    }
    if (contentFormat === "html" && !contentHtml.trim()) {
      toast({ title: "HTML content is required", status: "warning", duration: 3000, isClosable: true });
      return false;
    }
    return true;
  };

  const handlePreviewAsStudent = async () => {
    if (!isEdit) {
      if (!validateContent()) return;
      // Build a local preview from current state — no API call needed
      const localPreview = {
        questionType,
        difficultyLevel,
        marks: parseInt(marks) || 1,
        displayContent: contentFormat === "html" ? contentHtml : questionText,
        options: questionType === "mcq"
          ? options.filter((o) => o.name.trim()).map((o) => ({ id: o.optionIndex, optionIndex: o.optionIndex, name: o.name }))
          : undefined,
        media: [],
      };
      setPreviewData(localPreview);
      setPreviewLoading(false);
      onPreviewOpen();
      return;
    }
    // Edit mode — call the real GET preview endpoint
    setPreviewData(null);
    setPreviewLoading(true);
    onPreviewOpen();
    try {
      const res = await previewMultimediaQuestion(questionId);
      setPreviewData(res?.data ?? res);
    } catch {
      toast({ title: "Failed to load preview", status: "error", duration: 3000, isClosable: true });
      onPreviewClose();
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateContent()) return;

    const payload = buildPayload();
    if (!isEdit) payload.examinationId = examinationId;

    setSaving(true);
    try {
      if (isEdit) {
        await updateMultimediaQuestion(questionId, payload);
        toast({ title: "Question updated", status: "success", duration: 3000, isClosable: true });
      } else {
        const res = await createMultimediaQuestion(payload);
        if (process.env.NODE_ENV !== "production") {
          console.log("[MultimediaQ] Create response:", res);
        }
        const d = res?.data ?? res;
        const newId =
          d?.id ?? d?._id ?? d?.questionId ?? d?.uuid ?? d?.question_id ?? d?.examQuestionId;
        toast({ title: "Question created", status: "success", duration: 3000, isClosable: true });
        if (newId) {
          history.push(`/admin/multimedia-questions/${examinationId}/${newId}/edit`);
        } else {
          history.push(`/admin/multimedia-questions/${examinationId}`);
        }
      }
    } catch (err) {
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
    return <Flex justifyContent="center" alignItems="center" minH="300px"><Spinner size="xl" color="#6b006b" /></Flex>;
  }

  return (
    <Box marginX="22px" marginY="20px" maxW="900px">
      <Flex alignItems="center" gap="12px" mb="24px">
        <Flex
          as="button"
          alignItems="center"
          gap="6px"
          color="#6b006b"
          onClick={() => history.push(`/admin/multimedia-questions/${examinationId}`)}
          _hover={{ opacity: 0.8 }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">Question Bank</Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Heading fontSize="20px" fontWeight="600">{isEdit ? "Edit Question" : "New Question"}</Heading>
      </Flex>

      <Flex direction="column" gap="20px">
        {/* Section A: Metadata */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="16px">
            Question Metadata
          </Text>
          <Flex gap="16px" flexWrap="wrap">
            <FormControl flex="1" minW="160px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Question Type</FormLabel>
              <Select size="sm" borderRadius="6px" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option value="mcq">MCQ</option>
                <option value="essay">Essay</option>
                <option value="true_false">True / False</option>
                <option value="fill_in_the_blank">Fill in the Blank</option>
                <option value="matching">Matching</option>
                <option value="listening">Listening</option>
              </Select>
            </FormControl>

            <FormControl flex="1" minW="140px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Difficulty</FormLabel>
              <Select size="sm" borderRadius="6px" value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </FormControl>

            <FormControl flex="0 0 100px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Marks</FormLabel>
              <Input size="sm" borderRadius="6px" type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} />
            </FormControl>

            <FormControl flex="1" minW="180px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Section (optional)</FormLabel>
              <Input size="sm" borderRadius="6px" placeholder="e.g. Part A" value={section} onChange={(e) => setSection(e.target.value)} />
            </FormControl>
          </Flex>

          {questionType === "essay" && (
            <FormControl mt="16px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Rubric (optional)</FormLabel>
              <Textarea size="sm" borderRadius="6px" rows={3} placeholder="Grading rubric for this question..." value={rubric} onChange={(e) => setRubric(e.target.value)} />
            </FormControl>
          )}
        </Box>

        {/* Section B: Content */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Flex justifyContent="space-between" alignItems="center" mb="16px">
            <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              Question Content
            </Text>
            <Flex bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
              {["plain", "html"].map((fmt) => (
                <Box
                  key={fmt}
                  px="14px"
                  py="6px"
                  fontSize="12px"
                  fontWeight="600"
                  cursor="pointer"
                  bg={contentFormat === fmt ? "#6b006b" : "transparent"}
                  color={contentFormat === fmt ? "white" : "gray.500"}
                  onClick={() => setContentFormat(fmt)}
                >
                  {fmt === "plain" ? "Plain Text" : "HTML"}
                </Box>
              ))}
            </Flex>
          </Flex>

          {contentFormat === "plain" ? (
            <Textarea
              size="sm"
              borderRadius="6px"
              rows={5}
              placeholder="Type your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          ) : (
            <Box>
              <Flex justifyContent="space-between" alignItems="center" mb="8px">
                <Text fontSize="12px" color="gray.500">Enter HTML content below</Text>
                <Flex
                  as="button"
                  alignItems="center"
                  gap="4px"
                  fontSize="12px"
                  color="#6b006b"
                  fontWeight="600"
                  onClick={() => setShowHtmlPreview((p) => !p)}
                  _hover={{ opacity: 0.8 }}
                >
                  <FiEye size={12} />
                  {showHtmlPreview ? "Hide Preview" : "Show Preview"}
                </Flex>
              </Flex>
              <Textarea
                size="sm"
                borderRadius="6px"
                rows={6}
                fontFamily="mono"
                fontSize="12px"
                placeholder="<p>Your <strong>question</strong> here...</p>"
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
              />
              {showHtmlPreview && contentHtml && (
                <Box
                  mt="12px"
                  p="16px"
                  bg="#F7F9FC"
                  border="1px solid #E2E8F0"
                  borderRadius="8px"
                  fontSize="14px"
                  dangerouslySetInnerHTML={{
                    __html: contentHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ""),
                  }}
                />
              )}
            </Box>
          )}

          <FormControl mt="16px">
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              LaTeX Equation (optional)
            </FormLabel>
            <Textarea
              size="sm"
              borderRadius="6px"
              rows={2}
              fontFamily="mono"
              fontSize="12px"
              placeholder="\frac{d}{dx}\left( \int_{0}^{x} f(u)\,du\right)=f(x)"
              value={latexEquation}
              onChange={(e) => setLatexEquation(e.target.value)}
            />
            {latexEquation.trim() && (
              <Box mt="8px" p="10px" bg="#F7F9FC" border="1px solid #E2E8F0" borderRadius="6px">
                <Text fontSize="11px" color="gray.400" mb="4px">LaTeX (install KaTeX for rendered preview):</Text>
                <Text fontFamily="mono" fontSize="12px" color="#6b006b">{latexEquation}</Text>
              </Box>
            )}
          </FormControl>
        </Box>

        {/* Section C: MCQ Options */}
        {questionType === "mcq" && (
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Answer Options ({options.length})
              </Text>
              {options.length < 6 && (
                <Button secondary size="sm" leftIcon={<FiPlus />} onClick={addOption}>Add Option</Button>
              )}
            </Flex>
            <RadioGroup value={String(options.findIndex((o) => o.isAnswer))}>
              <Flex direction="column" gap="10px">
                {options.map((opt, idx) => (
                  <Flex key={idx} alignItems="center" gap="12px" p="10px" bg="#F7FAFC" borderRadius="8px" border="1px solid #E2E8F0">
                    <Radio value={String(idx)} onChange={() => setCorrectOption(idx)} colorScheme="green" />
                    <Box
                      w="28px"
                      h="28px"
                      bg="#F0E6FF"
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontSize="12px" fontWeight="700" color="#6b006b">{opt.optionIndex}</Text>
                    </Box>
                    <Input
                      size="sm"
                      borderRadius="6px"
                      bg="white"
                      flex="1"
                      placeholder={`Option ${opt.optionIndex}`}
                      value={opt.name}
                      onChange={(e) => setOptions((prev) => prev.map((o, i) => i === idx ? { ...o, name: e.target.value } : o))}
                    />
                    {options.length > 2 && (
                      <IconButton
                        aria-label="Remove option"
                        icon={<FiTrash2 size={12} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeOption(idx)}
                      />
                    )}
                  </Flex>
                ))}
              </Flex>
            </RadioGroup>
            <Text fontSize="11px" color="gray.400" mt="8px">Select the radio button next to the correct answer.</Text>
          </Box>
        )}

        {/* Section D: Media */}
        {isEdit && (
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <Text fontSize="13px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Media Attachments ({media.length})
              </Text>
              <Button secondary size="sm" leftIcon={<FiPlus />} onClick={onAddMediaOpen}>Add Media</Button>
            </Flex>

            {loadingMedia ? (
              <Flex justifyContent="center" py="24px"><Spinner size="md" color="#6b006b" /></Flex>
            ) : media.length === 0 ? (
              <Box bg="#F7FAFC" borderRadius="8px" p="24px" textAlign="center">
                <Text fontSize="13px" color="gray.400">No media attached. Add images, audio, or video.</Text>
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

            {!isEdit && (
              <Text fontSize="12px" color="gray.400" mt="8px">
                Save the question first to enable media attachments.
              </Text>
            )}
          </Box>
        )}

        {!isEdit && (
          <Box bg="#EBF4FF" border="1px solid #BEE3F8" borderRadius="8px" p="12px">
            <Text fontSize="13px" color="#2B6CB0">
              Save the question first, then you can attach media files from the edit view.
            </Text>
          </Box>
        )}

        <Divider />

        {/* Footer */}
        <Flex justifyContent="space-between" alignItems="center">
          <Button
            secondary
            leftIcon={<FiEye />}
            onClick={handlePreviewAsStudent}
          >
            Preview as Student
          </Button>
          <Flex gap="10px">
            <Button secondary onClick={() => history.push(`/admin/multimedia-questions/${examinationId}`)}>
              Cancel
            </Button>
            <Button leftIcon={<FiSave />} isLoading={saving} onClick={handleSave}>
              {isEdit ? "Update" : "Create"} Question
            </Button>
          </Flex>
        </Flex>
      </Flex>

      <AddMediaModal
        isOpen={isAddMediaOpen}
        onClose={onAddMediaClose}
        questionId={questionId}
        currentCount={media.length}
        onAdded={loadMedia}
      />

      <StudentPreviewModal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        data={previewData}
        loading={previewLoading}
      />
    </Box>
  );
};

export const QuestionEditorPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <QuestionEditorPage {...props} />} />
);

export default QuestionEditorPageRoute;
