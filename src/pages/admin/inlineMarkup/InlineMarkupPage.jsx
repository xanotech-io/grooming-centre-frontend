import React, { useState, useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import {
  Box, Flex, Text, Heading, Badge, Button, Input, Select, Textarea,
  FormControl, FormLabel,
  Table, Thead, Tbody, Tr, Th, Td,
  IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  useDisclosure, useToast,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  SimpleGrid, Spinner, Divider,
  HStack, VStack, Tag, TagLabel,
  Stat, StatLabel, StatNumber, BreadcrumbItem,
} from "@chakra-ui/react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSend, FiEye,
  FiCheckCircle, FiRefreshCw, FiArchive,
} from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, Link, EntityCombobox } from "../../../components";
import {
  getSubmissionMarkups,
  getSubmissionSummary,
  createMarkup,
  editMarkup,
  deleteMarkup,
  updateMarkupStatus,
  replyToMarkup,
  publishAllDrafts,
  getDepartmentStudents,
  getSubmissionsReport,
  MOCK_SUBMISSIONS,
} from "../../../services";

// ─── Constants ──────────────────────────────────────────────────────────────────

const STATUS_COLORS = { Draft: "gray", Published: "blue", Resolved: "green", Archived: "purple" };
const TYPE_COLORS = { "Text Comment": "teal", Highlight: "yellow", Annotation: "orange", "Voice Note": "pink" };
const HIGHLIGHT_COLORS = { Yellow: "yellow", Green: "green", Red: "red", Blue: "blue" };
const COMMENT_TYPES = ["Text Comment", "Highlight", "Annotation", "Voice Note"];
const DOC_TYPES = ["Assignment", "Exam", "Project", "Discussion"];

// ─── Student Dropdown Hook ───────────────────────────────────────────────────────

function useStudents() {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    getDepartmentStudents()
      .then((res) => setStudents(res?.data?.data?.rows || []))
      .catch(() => setStudents([]));
  }, []);
  return students;
}

function StudentSelect({ value, onChange, placeholder = "Select student", isRequired }) {
  const students = useStudents();
  return (
    <Select size="sm" value={value} onChange={onChange} placeholder={placeholder} isRequired={isRequired}>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.firstName} {s.lastName} — {s.email}
        </option>
      ))}
    </Select>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color = "gray.700" }) {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
      <Stat>
        <StatLabel fontSize="xs" color="gray.500">{label}</StatLabel>
        <StatNumber fontSize="xl" color={color}>{value ?? "—"}</StatNumber>
      </Stat>
    </Box>
  );
}

function StatusBadge({ status }) {
  return <Badge colorScheme={STATUS_COLORS[status] || "gray"} size="sm">{status}</Badge>;
}

function EmptyPrompt({ text }) {
  return (
    <Flex justify="center" align="center" py={10}>
      <Text fontSize="sm" color="gray.400">{text}</Text>
    </Flex>
  );
}

async function fetchSubmissionOptions(query) {
  let rows;
  try {
    const res = await getSubmissionsReport({ search: query, limit: 20 });
    const d = res?.data ?? res;
    rows = d?.data ?? d?.rows ?? [];
  } catch {
    rows = MOCK_SUBMISSIONS;
  }
  const q = query.toLowerCase();
  return rows
    .filter(
      (s) =>
        !q ||
        s.submissionId?.toLowerCase().includes(q) ||
        s.studentName?.toLowerCase().includes(q) ||
        s.title?.toLowerCase().includes(q),
    )
    .map((s) => ({
      id: s.submissionId,
      label: `${s.studentName} — ${s.title}`,
      sublabel: `${s.type} • ${s.submissionId}`,
    }));
}

function emptyForm(submissionId = "") {
  return {
    submissionId,
    studentId: "", documentType: "Assignment",
    commentType: "Text Comment", content: "", status: "Draft", remark: "",
    highlightColor: "Yellow", drawingShape: "Rectangle",
    anchorText: "", startIndex: "", endIndex: "",
    bbX: "", bbY: "", bbWidth: "", bbHeight: "",
  };
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function InlineMarkupPage() {
  const [submissionId, setSubmissionId] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Inline Markup Review</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box mb={5}>
        <Heading size="md" mb={1}>In-Line Markup — Feedback &amp; Review</Heading>
        <Text fontSize="sm" color="gray.500">
          Contextual annotations on student submissions with threaded discussion.
        </Text>
      </Box>

      <Flex gap={3} mb={5} align="center">
        <Box minW="380px">
          <EntityCombobox
            fetchFn={fetchSubmissionOptions}
            value={submissionId}
            onSelect={(opt) => setSubmissionId(opt?.id ?? "")}
            placeholder="Search by student, title, or submission UUID…"
          />
        </Box>
        {submissionId && (
          <Text fontSize="xs" color="gray.500" fontFamily="mono">
            Loaded: {submissionId}
          </Text>
        )}
      </Flex>

      <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
        <TabList mb={4} flexWrap="wrap">
          <Tab>Markup List</Tab>
          <Tab>Summary</Tab>
          <Tab>Create Markup</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <MarkupListTab submissionId={submissionId} isActive={activeTab === 0} />
          </TabPanel>
          <TabPanel px={0}>
            <SummaryTab submissionId={submissionId} isActive={activeTab === 1} />
          </TabPanel>
          <TabPanel px={0}>
            <CreateMarkupTab submissionId={submissionId} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AdminMainAreaWrapper>
  );
}

// ─── Markup List Tab ─────────────────────────────────────────────────────────

function MarkupListTab({ submissionId, isActive }) {
  const toast = useToast();
  const [markups, setMarkups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editContent, setEditContent] = useState("");
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  const fetchMarkups = useCallback(async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.commentType = typeFilter;
      const res = await getSubmissionMarkups(submissionId, params);
      setMarkups(res?.data?.data?.markups || []);
    } catch {
      toast({ title: "Failed to load markups", status: "error", duration: 3000 });
      setMarkups([]);
    } finally {
      setLoading(false);
    }
  }, [submissionId, statusFilter, typeFilter, toast]);

  useEffect(() => {
    if (isActive && submissionId) fetchMarkups();
  }, [isActive, submissionId, fetchMarkups]);

  const openDrawer = (m) => {
    setSelected(m);
    setEditContent(m.content);
    setReplyText("");
    onDrawerOpen();
  };

  const handleStatus = async (markupId, status) => {
    try {
      await updateMarkupStatus(markupId, status);
      toast({ title: `Status updated to ${status}`, status: "success", duration: 3000 });
      fetchMarkups();
      onDrawerClose();
    } catch {
      toast({ title: "Status update failed", status: "error", duration: 3000 });
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    try {
      await editMarkup(selected.markupId, { content: editContent });
      toast({ title: "Markup updated", status: "success", duration: 3000 });
      fetchMarkups();
      onDrawerClose();
    } catch {
      toast({ title: "Update failed", status: "error", duration: 3000 });
    }
  };

  const handleDelete = async (markupId) => {
    try {
      await deleteMarkup(markupId);
      toast({ title: "Markup deleted", status: "success", duration: 3000 });
      fetchMarkups();
    } catch {
      toast({ title: "Delete failed — only Draft markups can be deleted", status: "error", duration: 4000 });
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    try {
      await replyToMarkup(selected.markupId, { content: replyText, commentType: "Text Comment" });
      toast({ title: "Reply sent", status: "success", duration: 3000 });
      setReplyText("");
      fetchMarkups();
    } catch {
      toast({ title: "Reply failed", status: "error", duration: 3000 });
    }
  };

  const handlePublishAll = async () => {
    if (!submissionId) return;
    try {
      const res = await publishAllDrafts(submissionId);
      const count = res?.data?.data?.published_count ?? res?.data?.published_count ?? "all";
      toast({ title: `Published ${count} draft(s)`, status: "success", duration: 3000 });
      fetchMarkups();
    } catch {
      toast({ title: "Publish all failed", status: "error", duration: 3000 });
    }
  };

  if (!submissionId) return <EmptyPrompt text="Search and select a submission above to view markups." />;

  return (
    <Box>
      <Flex gap={3} mb={4} align="center" flexWrap="wrap">
        <Select size="sm" maxW="160px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Statuses">
          {["Draft", "Published", "Resolved"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select size="sm" maxW="180px" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} placeholder="All Types">
          {COMMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Button size="sm" variant="outline" leftIcon={<FiRefreshCw />} onClick={fetchMarkups}>Refresh</Button>
        <Button size="sm" colorScheme="blue" leftIcon={<FiSend />} onClick={handlePublishAll} ml="auto">
          Publish All Drafts
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={10}><Spinner /></Flex>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Type</Th>
                <Th>Content</Th>
                <Th>Anchor / Shape</Th>
                <Th>Status</Th>
                <Th>Replies</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {markups.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" color="gray.400" py={6}>
                    No markups found for this submission.
                  </Td>
                </Tr>
              ) : markups.map((m) => (
                <Tr key={m.markupId} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Tag size="sm" colorScheme={TYPE_COLORS[m.commentType] || "gray"}>
                        <TagLabel>{m.commentType}</TagLabel>
                      </Tag>
                      {m.highlightColor && (
                        <Badge colorScheme={HIGHLIGHT_COLORS[m.highlightColor] || "gray"} size="sm">
                          {m.highlightColor}
                        </Badge>
                      )}
                      {m.isEdited && <Badge colorScheme="orange" size="sm">Edited</Badge>}
                      {m.isArchived && <Badge colorScheme="purple" size="sm">Archived</Badge>}
                    </VStack>
                  </Td>
                  <Td maxW="260px">
                    <Text fontSize="sm" noOfLines={2}>{m.content}</Text>
                  </Td>
                  <Td fontSize="xs" color="gray.500">
                    {m.anchorLocation ? (
                      <Text noOfLines={1}>&ldquo;{m.anchorLocation.anchor_text}&rdquo;</Text>
                    ) : m.drawingShape ? (
                      <Text>
                        {m.drawingShape}
                        {m.boundingBox ? ` (${m.boundingBox.width}×${m.boundingBox.height})` : ""}
                      </Text>
                    ) : "—"}
                  </Td>
                  <Td><StatusBadge status={m.status} /></Td>
                  <Td fontSize="sm" color="gray.600">{(m.replies || []).length}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton size="xs" icon={<FiEye />} aria-label="View" onClick={() => openDrawer(m)} />
                      {m.status === "Draft" && (
                        <IconButton
                          size="xs" colorScheme="red" icon={<FiTrash2 />}
                          aria-label="Delete" onClick={() => handleDelete(m.markupId)}
                        />
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Detail Drawer */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <VStack align="start" spacing={1}>
              <Text fontSize="md">Markup Detail</Text>
              {selected && <StatusBadge status={selected.status} />}
            </VStack>
          </DrawerHeader>
          <DrawerBody>
            {selected && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>Type</Text>
                  <Tag colorScheme={TYPE_COLORS[selected.commentType] || "gray"}>
                    <TagLabel>{selected.commentType}</TagLabel>
                  </Tag>
                </Box>

                {selected.anchorLocation && (
                  <Box bg="gray.50" borderRadius="md" p={3}>
                    <Text fontSize="xs" color="gray.500" mb={1}>Anchored Text</Text>
                    <Text fontSize="sm" fontStyle="italic">
                      &ldquo;{selected.anchorLocation.anchor_text}&rdquo;
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      chars {selected.anchorLocation.start_index}–{selected.anchorLocation.end_index}
                    </Text>
                  </Box>
                )}

                {selected.boundingBox && (
                  <Box bg="orange.50" borderRadius="md" p={3}>
                    <Text fontSize="xs" color="gray.500" mb={1}>Drawing — {selected.drawingShape}</Text>
                    <Text fontSize="xs" fontFamily="mono">
                      x:{selected.boundingBox.x} y:{selected.boundingBox.y} w:{selected.boundingBox.width} h:{selected.boundingBox.height}
                    </Text>
                  </Box>
                )}

                <FormControl>
                  <FormLabel fontSize="xs">Content</FormLabel>
                  <Textarea
                    size="sm" rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    isReadOnly={selected.isArchived}
                  />
                </FormControl>

                {!selected.isArchived && (
                  <Button size="sm" leftIcon={<FiEdit2 />} onClick={handleEdit}>Save Edit</Button>
                )}

                <Divider />

                {!selected.isArchived && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" mb={2} color="gray.600">Lifecycle Actions</Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {selected.status === "Draft" && (
                        <Button size="xs" colorScheme="blue" leftIcon={<FiSend />}
                          onClick={() => handleStatus(selected.markupId, "Published")}>
                          Publish
                        </Button>
                      )}
                      {selected.status === "Published" && (
                        <Button size="xs" colorScheme="green" leftIcon={<FiCheckCircle />}
                          onClick={() => handleStatus(selected.markupId, "Resolved")}>
                          Resolve
                        </Button>
                      )}
                      {selected.status === "Resolved" && (
                        <Button size="xs" colorScheme="orange" leftIcon={<FiRefreshCw />}
                          onClick={() => handleStatus(selected.markupId, "Published")}>
                          Re-open
                        </Button>
                      )}
                    </HStack>
                  </Box>
                )}

                <Divider />

                <Box>
                  <Text fontSize="xs" fontWeight="semibold" mb={2} color="gray.600">
                    Thread ({(selected.replies || []).length} replies)
                  </Text>
                  {(selected.replies || []).length === 0 ? (
                    <Text fontSize="xs" color="gray.400">No replies yet.</Text>
                  ) : (
                    <VStack spacing={2} align="stretch">
                      {(selected.replies || []).map((r) => (
                        <Box key={r.markupId} bg="gray.50" borderRadius="md" p={3}
                          borderLeft="3px solid" borderLeftColor="blue.300">
                          <Text fontSize="sm">{r.content}</Text>
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            {r.publishedAt ? new Date(r.publishedAt).toLocaleString() : "—"}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  )}

                  {!selected.isArchived && (
                    <Box mt={3}>
                      <Textarea
                        size="sm" placeholder="Write a reply…" rows={2}
                        value={replyText} onChange={(e) => setReplyText(e.target.value)}
                      />
                      <Button
                        size="sm" colorScheme="blue" leftIcon={<FiSend />} mt={2}
                        onClick={handleReply} isDisabled={!replyText.trim()}>
                        Send Reply
                      </Button>
                    </Box>
                  )}
                </Box>

                {selected.remark && (
                  <Box bg="yellow.50" borderRadius="md" p={3} border="1px solid" borderColor="yellow.200">
                    <Text fontSize="xs" fontWeight="semibold" color="yellow.700" mb={1}>
                      Internal Remark (not visible to student)
                    </Text>
                    <Text fontSize="sm">{selected.remark}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

// ─── Summary Tab ─────────────────────────────────────────────────────────────

function SummaryTab({ submissionId, isActive }) {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!submissionId) return;
    setLoading(true);
    setSummary(null);
    try {
      const res = await getSubmissionSummary(submissionId);
      setSummary(res?.data?.data || res?.data || null);
    } catch {
      toast({ title: "Failed to load summary", status: "error", duration: 3000 });
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId, toast]);

  useEffect(() => {
    if (isActive && submissionId) fetchSummary();
  }, [isActive, submissionId, fetchSummary]);

  if (!submissionId) return <EmptyPrompt text="Search and select a submission above to view the summary." />;
  if (loading) return <Flex justify="center" py={10}><Spinner /></Flex>;
  if (!summary) return (
    <Flex justify="center" py={6}>
      <Button size="sm" leftIcon={<FiRefreshCw />} onClick={fetchSummary}>Load Summary</Button>
    </Flex>
  );

  const sb = summary.status_breakdown || {};
  const tb = summary.type_breakdown || {};
  const hb = summary.highlight_color_breakdown || {};

  return (
    <VStack spacing={5} align="stretch">
      <Flex justify="flex-end">
        <Button size="sm" variant="outline" leftIcon={<FiRefreshCw />} onClick={fetchSummary}>Refresh</Button>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <KpiCard label="Total Markups" value={summary.total_markups} />
        <KpiCard label="Unresolved" value={summary.unresolved_count} color="orange.500" />
        <KpiCard label="Resolved" value={summary.resolved_count} color="green.600" />
        <KpiCard label="Drafts" value={sb.Draft ?? 0} color="gray.600" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontSize="sm" fontWeight="semibold" mb={3}>Status Breakdown</Text>
          <VStack align="stretch" spacing={2}>
            {Object.entries(sb).map(([k, v]) => (
              <Flex key={k} justify="space-between" align="center">
                <StatusBadge status={k} />
                <Text fontSize="sm" fontWeight="bold">{v}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontSize="sm" fontWeight="semibold" mb={3}>Type Breakdown</Text>
          <VStack align="stretch" spacing={2}>
            {Object.entries(tb).map(([k, v]) => (
              <Flex key={k} justify="space-between" align="center">
                <Tag size="sm" colorScheme={TYPE_COLORS[k] || "gray"}>
                  <TagLabel>{k}</TagLabel>
                </Tag>
                <Text fontSize="sm" fontWeight="bold">{v}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontSize="sm" fontWeight="semibold" mb={3}>Highlight Colors</Text>
          {Object.keys(hb).length === 0 ? (
            <Text fontSize="xs" color="gray.400">No highlights recorded.</Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              {Object.entries(hb).map(([k, v]) => (
                <Flex key={k} justify="space-between" align="center">
                  <Badge colorScheme={HIGHLIGHT_COLORS[k] || "gray"}>{k}</Badge>
                  <Text fontSize="sm" fontWeight="bold">{v}</Text>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>
    </VStack>
  );
}

// ─── Create Markup Tab ───────────────────────────────────────────────────────

function CreateMarkupTab({ submissionId: propSubmissionId }) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    setForm(emptyForm(propSubmissionId || ""));
    onOpen();
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const needsAnchor = form.commentType === "Text Comment" || form.commentType === "Highlight";
  const needsBbox = form.commentType === "Annotation";
  const needsColor = form.commentType === "Highlight";
  const needsShape = form.commentType === "Annotation";

  const handleSubmit = async () => {
    if (!form.studentId || !form.submissionId.trim() || !form.content.trim()) {
      toast({ title: "Student, Submission ID, and content are required", status: "warning", duration: 3000 });
      return;
    }
    const payload = {
      studentId: form.studentId,
      documentType: form.documentType,
      submissionId: form.submissionId,
      commentType: form.commentType,
      content: form.content,
      status: form.status,
      remark: form.remark || undefined,
      anchorLocation: needsAnchor && form.anchorText ? {
        type: "text_range",
        start_index: parseInt(form.startIndex, 10) || 0,
        end_index: parseInt(form.endIndex, 10) || 0,
        anchor_text: form.anchorText,
      } : null,
      highlightColor: needsColor ? form.highlightColor : null,
      drawingShape: needsShape ? form.drawingShape : null,
      boundingBox: needsBbox ? {
        x: parseFloat(form.bbX) || 0,
        y: parseFloat(form.bbY) || 0,
        width: parseFloat(form.bbWidth) || 0,
        height: parseFloat(form.bbHeight) || 0,
      } : null,
    };
    setSaving(true);
    try {
      await createMarkup(payload);
      toast({ title: "Markup created", status: "success", duration: 3000 });
      setForm(emptyForm(propSubmissionId || ""));
      onClose();
    } catch {
      toast({ title: "Create failed", status: "error", duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm" onClick={handleOpen}>
        New Markup
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Markup</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs">Submission ID</FormLabel>
                <Input
                  size="sm" value={form.submissionId} onChange={set("submissionId")}
                  placeholder="Submission UUID" fontFamily="mono"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Student</FormLabel>
                  <StudentSelect value={form.studentId} onChange={set("studentId")} isRequired />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">Document Type</FormLabel>
                  <Select size="sm" value={form.documentType} onChange={set("documentType")}>
                    {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs">Comment Type</FormLabel>
                  <Select size="sm" value={form.commentType} onChange={set("commentType")}>
                    {COMMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">Initial Status</FormLabel>
                  <Select size="sm" value={form.status} onChange={set("status")}>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {needsAnchor && (
                <Box bg="teal.50" borderRadius="md" p={3}>
                  <Text fontSize="xs" fontWeight="semibold" mb={2} color="teal.700">Anchor Location</Text>
                  <FormControl mb={2}>
                    <FormLabel fontSize="xs">Anchor Text</FormLabel>
                    <Input size="sm" value={form.anchorText} onChange={set("anchorText")} placeholder="Selected text from document" />
                  </FormControl>
                  <SimpleGrid columns={2} spacing={2}>
                    <FormControl>
                      <FormLabel fontSize="xs">Start Index</FormLabel>
                      <Input size="sm" type="number" value={form.startIndex} onChange={set("startIndex")} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs">End Index</FormLabel>
                      <Input size="sm" type="number" value={form.endIndex} onChange={set("endIndex")} />
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}

              {needsColor && (
                <FormControl>
                  <FormLabel fontSize="xs">Highlight Color</FormLabel>
                  <Select size="sm" value={form.highlightColor} onChange={set("highlightColor")}>
                    {["Yellow", "Green", "Red", "Blue"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormControl>
              )}

              {needsBbox && (
                <Box bg="orange.50" borderRadius="md" p={3}>
                  <Text fontSize="xs" fontWeight="semibold" mb={2} color="orange.700">Drawing / Bounding Box</Text>
                  <FormControl mb={2}>
                    <FormLabel fontSize="xs">Shape</FormLabel>
                    <Select size="sm" value={form.drawingShape} onChange={set("drawingShape")}>
                      {["Rectangle", "Circle", "Arrow", "Freehand"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </FormControl>
                  <SimpleGrid columns={4} spacing={2}>
                    {["bbX", "bbY", "bbWidth", "bbHeight"].map((f) => (
                      <FormControl key={f}>
                        <FormLabel fontSize="xs">{f.replace("bb", "").toLowerCase()}</FormLabel>
                        <Input size="sm" type="number" value={form[f]} onChange={set(f)} />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              <FormControl isRequired>
                <FormLabel fontSize="xs">Content / Feedback</FormLabel>
                <Textarea size="sm" value={form.content} onChange={set("content")} rows={3} placeholder="Feedback text…" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">
                  Internal Remark{" "}
                  <Text as="span" color="gray.400">(not visible to student)</Text>
                </FormLabel>
                <Input size="sm" value={form.remark} onChange={set("remark")} placeholder="Optional reviewer note" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={saving} leftIcon={<FiArchive />}>
              {form.status === "Published" ? "Create & Publish" : "Save as Draft"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box mt={5} p={4} bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.200">
        <Text fontSize="sm" color="gray.500" textAlign="center">
          Use <strong>New Markup</strong> above to annotate a submission.
          Switch to the <strong>Markup List</strong> tab to view and manage existing markups.
        </Text>
      </Box>
    </Box>
  );
}

// ─── Route Export ────────────────────────────────────────────────────────────

export const InlineMarkupPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <InlineMarkupPage {...props} />} />
);
