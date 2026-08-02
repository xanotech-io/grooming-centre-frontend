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
  Select,
  Spinner,
  Switch,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  addQuestionMedia,
  deleteQuestionMedia,
  getMultimediaQuestion,
  getQuestionMedia,
  updateQuestionMedia,
} from "../../../services";
import { FiArrowLeft, FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import { FaImage, FaMicrophone, FaVideo } from "react-icons/fa";

const MAX_FILE_BYTES = 5242880;

const ALLOWED_MIME = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/aac"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
};

const MEDIA_ICON = {
  image: <FaImage size={18} color="#6b006b" />,
  audio: <FaMicrophone size={18} color="#38A169" />,
  video: <FaVideo size={18} color="#3182CE" />,
};

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ─── Add Media Modal ─────────────────────────────────────────────────────────

const EMPTY_FORM = { mediaType: "image", url: "", mimeType: "", fileSizeBytes: "", durationSeconds: "", altText: "", transcript: "", isAccessible: true };

const AddMediaModal = ({ isOpen, onClose, questionId, currentCount, onAdded }) => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setForm(EMPTY_FORM); }, [isOpen]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.url.startsWith("https://")) { toast({ title: "URL must start with https://", status: "warning", duration: 3000, isClosable: true }); return; }
    if (!form.mimeType.trim()) { toast({ title: "MIME type is required", status: "warning", duration: 3000, isClosable: true }); return; }
    if (!ALLOWED_MIME[form.mediaType]?.includes(form.mimeType.trim())) {
      toast({ title: `Invalid MIME type for ${form.mediaType}`, status: "warning", duration: 3000, isClosable: true }); return;
    }
    if (parseInt(form.fileSizeBytes) > MAX_FILE_BYTES) { toast({ title: "File exceeds the 5 MB size limit", status: "warning", duration: 3000, isClosable: true }); return; }

    if (!form.altText.trim() && form.mediaType === "image")
      toast({ title: "Alt text is recommended for images", status: "info", duration: 2500, isClosable: true });
    if (!form.transcript.trim() && (form.mediaType === "audio" || form.mediaType === "video"))
      toast({ title: "Transcript is recommended for audio/video", status: "info", duration: 2500, isClosable: true });

    const body = {
      mediaType: form.mediaType, url: form.url.trim(), mimeType: form.mimeType.trim(),
      fileSizeBytes: parseInt(form.fileSizeBytes) || 0, isAccessible: form.isAccessible, sortOrder: currentCount,
    };
    if (form.durationSeconds) body.durationSeconds = parseFloat(form.durationSeconds);
    if (form.altText.trim()) body.altText = form.altText.trim();
    if (form.transcript.trim()) body.transcript = form.transcript.trim();

    setSubmitting(true);
    try {
      await addQuestionMedia(questionId, body);
      toast({ title: "Media added", status: "success", duration: 3000, isClosable: true });
      onAdded();
      onClose();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to add media", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">Add Media</ModalHeader>
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
              <Input size="sm" borderRadius="6px" placeholder="https://cdn.example.com/file.png" value={form.url} onChange={(e) => set("url", e.target.value)} />
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
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Duration (seconds)</FormLabel>
                <Input size="sm" borderRadius="6px" type="number" placeholder="120" value={form.durationSeconds} onChange={(e) => set("durationSeconds", e.target.value)} />
              </FormControl>
            )}
            {form.mediaType === "image" && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Alt Text</FormLabel>
                <Input size="sm" borderRadius="6px" placeholder="Describe the image..." value={form.altText} onChange={(e) => set("altText", e.target.value)} />
              </FormControl>
            )}
            {(form.mediaType === "audio" || form.mediaType === "video") && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Transcript</FormLabel>
                <Textarea size="sm" borderRadius="6px" rows={3} placeholder="Full transcript..." value={form.transcript} onChange={(e) => set("transcript", e.target.value)} />
              </FormControl>
            )}
            <Flex alignItems="center" justifyContent="space-between" bg="#F7FAFC" borderRadius="8px" p="12px">
              <Text fontSize="13px" color="gray.600" fontWeight="500">Mark as accessible</Text>
              <Switch isChecked={form.isAccessible} onChange={(e) => set("isAccessible", e.target.checked)} colorScheme="green" />
            </Flex>
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

// ─── Media Card ───────────────────────────────────────────────────────────────

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
      toast({ title: "Changes saved", status: "success", duration: 2000, isClosable: true });
      onSaved?.();
    } catch {
      toast({ title: "Failed to save changes", status: "error", duration: 3000, isClosable: true });
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
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px">
        <Flex justifyContent="space-between" alignItems="center" mb="14px">
          <Flex alignItems="center" gap="10px">
            {MEDIA_ICON[item.mediaType]}
            <Box>
              <Badge
                bg={item.mediaType === "image" ? "#F0E6FF" : item.mediaType === "audio" ? "#E6F4EA" : "#EBF4FF"}
                color={item.mediaType === "image" ? "#6b006b" : item.mediaType === "audio" ? "#38A169" : "#3182CE"}
                textTransform="none" fontSize="11px" px="8px" borderRadius="6px" mb="2px"
              >
                {item.mediaType}
              </Badge>
              <Text fontSize="11px" color="gray.400">{item.mimeType} · {formatBytes(item.fileSizeBytes)}{item.durationSeconds ? ` · ${item.durationSeconds}s` : ""}</Text>
            </Box>
          </Flex>
          <Flex gap="4px">
            <IconButton aria-label="Move up" icon={<FiArrowUp size={12} />} size="xs" variant="ghost" isDisabled={isFirst} onClick={onMoveUp} />
            <IconButton aria-label="Move down" icon={<FiArrowDown size={12} />} size="xs" variant="ghost" isDisabled={isLast} onClick={onMoveDown} />
            <IconButton aria-label="Remove" icon={<FiTrash2 size={12} />} size="xs" variant="ghost" colorScheme="red" onClick={() => setConfirmOpen(true)} />
          </Flex>
        </Flex>

        {/* Preview */}
        <Box mb="14px" bg="#F7FAFC" borderRadius="8px" p="12px">
          {item.mediaType === "image" && (
            <img src={item.url} alt={item.altText || ""} style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "6px" }} />
          )}
          {item.mediaType === "audio" && <audio controls src={item.url} style={{ width: "100%" }} />}
          {item.mediaType === "video" && (
            <video controls src={item.url} poster={item.thumbnailUrl} style={{ width: "100%", maxHeight: "200px", borderRadius: "6px" }} />
          )}
          <Text fontSize="11px" color="gray.400" mt="6px" noOfLines={1}>{item.url}</Text>
        </Box>

        {/* Editable fields */}
        <Flex direction="column" gap="12px">
          {item.mediaType === "image" && (
            <FormControl>
              <FormLabel fontSize="12px" fontWeight="500" color="gray.600" mb="2px">Alt Text</FormLabel>
              <Input size="sm" borderRadius="6px" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image..." />
            </FormControl>
          )}
          {(item.mediaType === "audio" || item.mediaType === "video") && (
            <FormControl>
              <FormLabel fontSize="12px" fontWeight="500" color="gray.600" mb="2px">Transcript</FormLabel>
              <Textarea size="sm" borderRadius="6px" rows={3} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Full transcript..." />
            </FormControl>
          )}
          <Flex alignItems="center" justifyContent="space-between">
            <Flex alignItems="center" gap="8px">
              <Switch size="sm" isChecked={isAccessible} onChange={(e) => setIsAccessible(e.target.checked)} colorScheme="green" />
              <Text fontSize="12px" color="gray.600">Accessible</Text>
              {isAccessible && (
                <Badge bg="#E6F4EA" color="#38A169" fontSize="10px" px="6px" borderRadius="6px" textTransform="none">✓ Yes</Badge>
              )}
            </Flex>
            <Button size="xs" secondary isLoading={saving} onClick={handleSave}>Save changes</Button>
          </Flex>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

const MediaManagerPage = () => {
  const { examinationId, questionId } = useParams();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [question, setQuestion] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [qRes, mRes] = await Promise.all([
        getMultimediaQuestion(questionId),
        getQuestionMedia(questionId),
      ]);
      setQuestion(qRes?.data ?? qRes);
      setMedia(mRes?.data?.media ?? mRes?.media ?? []);
    } catch {
      setError("Failed to load media.");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      /* reorder failure is non-fatal; UI already updated */
    }
  };

  const questionTitle = question?.question || (question?.contentHtml || "").replace(/<[^>]*>/g, "") || "Question";

  return (
    <Box marginX="22px" marginY="20px" maxW="800px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/examination">Examination Analysis</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Media Manager</Link></BreadcrumbItem>}
        />
      </Flex>
      <Flex alignItems="center" gap="12px" mb="24px">
        <Flex
          as="button"
          alignItems="center"
          gap="6px"
          color="#6b006b"
          onClick={() => history.push(`/admin/multimedia-questions/${examinationId}/${questionId}/edit`)}
          _hover={{ opacity: 0.8 }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">Back to Editor</Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Heading fontSize="20px" fontWeight="600">Media Manager</Heading>
      </Flex>

      {/* Question header */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px" mb="20px">
        <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="4px">Question</Text>
        <Text fontSize="14px" color="#1A202C" noOfLines={3}>{questionTitle}</Text>
      </Box>

      {loading && <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>}

      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p="16px">
          <Text color="red.600" fontSize="14px">{error}</Text>
        </Box>
      )}

      {!loading && !error && (
        <>
          <Flex justifyContent="space-between" alignItems="center" mb="16px">
            <Text fontSize="15px" fontWeight="600" color="gray.700">
              {media.length} media item{media.length !== 1 ? "s" : ""}
            </Text>
            <Button leftIcon={<FiPlus />} onClick={onOpen}>Add Media</Button>
          </Flex>

          {media.length === 0 ? (
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="40px" textAlign="center">
              <Text fontSize="14px" color="gray.400" mb="16px">No media attached to this question yet.</Text>
              <Button onClick={onOpen}>Add First Media</Button>
            </Box>
          ) : (
            <Flex direction="column" gap="16px">
              {[...media].sort((a, b) => a.sortOrder - b.sortOrder).map((item, idx) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  questionId={questionId}
                  isFirst={idx === 0}
                  isLast={idx === media.length - 1}
                  onMoveUp={() => moveMedia(idx, "up")}
                  onMoveDown={() => moveMedia(idx, "down")}
                  onDeleted={fetchData}
                  onSaved={fetchData}
                />
              ))}
            </Flex>
          )}
        </>
      )}

      <AddMediaModal
        isOpen={isOpen}
        onClose={onClose}
        questionId={questionId}
        currentCount={media.length}
        onAdded={fetchData}
      />
    </Box>
  );
};

export const MediaManagerPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MediaManagerPage {...props} />} />
);

export default MediaManagerPageRoute;
