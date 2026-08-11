import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  Badge,
  Spinner,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  Textarea,
  Select as ChakraSelect,
  Input as ChakraInput,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  BreadcrumbItem,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronRight,
  FaSync,
  FaDownload,
  FaSlidersH,
  FaLink,
  FaUnlink,
  FaArchive,
  FaBoxOpen,
} from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link, EntityCombobox } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import {
  gradeBookV2GetById,
  gradeBookV2GetCourses,
  gradeBookV2Attach,
  gradeBookV2Detach,
  gradeBookV2Archive,
  gradeBookV2Unarchive,
  gradeBookV2AddEntry,
  gradeBookV2UpdateEntry,
  gradeBookV2DeleteEntry,
  gradeBookV2AdjustEntry,
  gradeBookV2GetAnalytics,
  gradeBookV2GetReport,
  gradeBookV2Finalize,
  gradeBookV2Publish,
  gradeBookV2GetAudit,
  gradeBookV2Sync,
  gradeBookV2Export,
  adminGetCourseListing,
} from "../../../services";

// ── Shared helpers ────────────────────────────────────────────────────────────

const Tab = ({ label, active, onClick }) => (
  <Box
    as="button"
    px="20px"
    py="10px"
    fontSize="14px"
    fontWeight={active ? "600" : "400"}
    color={active ? "#6b006b" : "gray.500"}
    borderBottom={active ? "2px solid #6b006b" : "2px solid transparent"}
    bg="transparent"
    cursor="pointer"
    onClick={onClick}
    transition="all 0.15s"
    _hover={{ color: "#6b006b" }}
  >
    {label}
  </Box>
);

const statusBadge = (status) => {
  const map = {
    draft:     { bg: "#F7FAFC", color: "#718096", label: "Draft" },
    finalized: { bg: "#EBF4FF", color: "#3182CE", label: "Finalized" },
    published: { bg: "#E6F4EA", color: "#38A169", label: "Published" },
  };
  const s = map[String(status).toLowerCase()] || map.draft;
  return (
    <Badge bg={s.bg} color={s.color} px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
      {s.label}
    </Badge>
  );
};

const gradeBadge = (grade) => {
  const color =
    grade === "A" ? "#38A169" :
    grade === "F" ? "#E53E3E" :
    grade?.startsWith("B") ? "#3182CE" : "#DD6B20";
  return (
    <Badge bg="transparent" color={color} fontWeight="700" fontSize="14px">{grade || "—"}</Badge>
  );
};

// ── Entries Tab ───────────────────────────────────────────────────────────────

const EntriesTab = ({ gradebookId, courseId, categories }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAdjustOpen, onOpen: onAdjustOpen, onClose: onAdjustClose } = useDisclosure();

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);

  const [form, setForm] = useState({
    studentId: "", categoryId: "", assessmentName: "",
    assessmentType: "exam", score: "", maxScore: 100, feedback: "",
  });
  const [formOverride, setFormOverride] = useState({ score: "", overrideReason: "" });
  const [adjustForm, setAdjustForm] = useState({ adjustmentValue: 0, adjustmentReason: "", extraCredit: 0 });
  const [saving, setSaving] = useState(false);
  const [adjustSaving, setAdjustSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadEntries = useCallback(async () => {
    if (!courseId) {
      setEntries([]);
      setLoadingEntries(false);
      return;
    }
    setLoadingEntries(true);
    try {
      const { report } = await gradeBookV2GetReport(gradebookId, courseId);
      const allEntries = [];
      (report?.students ?? []).forEach((s) => {
        (s.breakdown ?? []).forEach((cat) => {
          (cat.entries ?? []).forEach((e) => {
            allEntries.push({
              ...e,
              studentName: s.studentName,
              studentId: s.studentId,
              category: cat.category,
            });
          });
        });
      });
      setEntries(allEntries);
    } catch {
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  }, [gradebookId, courseId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ studentId: "", categoryId: "", assessmentName: "", assessmentType: "exam", score: "", maxScore: 100, feedback: "" });
    onOpen();
  };

  const openEdit = (entry) => {
    setEditTarget(entry);
    setFormOverride({ score: entry.score, overrideReason: "" });
    onOpen();
  };

  const openAdjust = (entry) => {
    setAdjustTarget(entry);
    setAdjustForm({ adjustmentValue: 0, adjustmentReason: "", extraCredit: 0 });
    onAdjustOpen();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTarget) {
        await gradeBookV2UpdateEntry(gradebookId, courseId, editTarget.id, {
          score: Number(formOverride.score),
          overrideReason: formOverride.overrideReason || undefined,
        });
        toast({ title: "Entry updated", status: "success", duration: 2000, isClosable: true });
      } else {
        await gradeBookV2AddEntry(gradebookId, courseId, {
          studentId: form.studentId,
          categoryId: form.categoryId,
          assessmentName: form.assessmentName,
          assessmentType: form.assessmentType,
          score: Number(form.score),
          maxScore: Number(form.maxScore),
          feedback: form.feedback || undefined,
        });
        toast({ title: "Entry added", status: "success", duration: 2000, isClosable: true });
      }
      onClose();
      loadEntries();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to save entry", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleAdjust = async () => {
    setAdjustSaving(true);
    try {
      await gradeBookV2AdjustEntry(gradebookId, courseId, adjustTarget.id, {
        adjustmentValue: Number(adjustForm.adjustmentValue) || 0,
        adjustmentReason: adjustForm.adjustmentReason || undefined,
        extraCredit: Number(adjustForm.extraCredit) || 0,
      });
      toast({ title: "Adjustment applied", status: "success", duration: 2000, isClosable: true });
      onAdjustClose();
      loadEntries();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Adjustment failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setAdjustSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    setDeletingId(entry.id);
    try {
      await gradeBookV2DeleteEntry(gradebookId, courseId, entry.id);
      toast({ title: "Entry deleted", status: "success", duration: 2000, isClosable: true });
      loadEntries();
    } catch {
      toast({ title: "Failed to delete entry", status: "error", duration: 3000, isClosable: true });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Flex px="20px" py="14px" justifyContent="space-between" alignItems="center" borderBottom="1px solid #E2E8F0">
        <Text fontSize="14px" fontWeight="600" color="gray.700">Score Entries ({entries.length})</Text>
        <Button size="sm" leftIcon={<FaPlus />} onClick={openAdd} isDisabled={!courseId}>Add Entry</Button>
      </Flex>

      {!courseId ? (
        <Flex justifyContent="center" py="40px">
          <Text color="gray.400">Attach a course, or select one above, to view entries.</Text>
        </Flex>
      ) : loadingEntries ? (
        <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>
      ) : entries.length === 0 ? (
        <Flex justifyContent="center" py="40px">
          <Text color="gray.400">No entries yet. Sync LMS data or add an entry manually.</Text>
        </Flex>
      ) : (
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead bg="#F7FAFC">
              <Tr>
                {["Student", "Assessment", "Category", "Score", "Effective", "Grade", "Status", "Actions"].map((h) => (
                  <Th key={h} py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {entries.map((e) => {
                const effective = e.effectiveScore ?? e.score;
                const hasAdjustment = effective !== e.score;
                return (
                  <Tr key={e.id} _hover={{ bg: "#F7FAFC" }}>
                    <Td py="12px" fontSize="13px" fontWeight="500">{e.studentName || e.studentId}</Td>
                    <Td py="12px" fontSize="13px">{e.assessmentName}</Td>
                    <Td py="12px" fontSize="13px" color="gray.600">{e.category}</Td>
                    <Td py="12px" fontSize="13px">{e.score}/{e.maxScore}</Td>
                    <Td py="12px" fontSize="13px">
                      <Flex alignItems="center" gap="6px">
                        <Text fontWeight={hasAdjustment ? "700" : "400"} color={hasAdjustment ? "#6b006b" : undefined}>
                          {effective}/{e.maxScore}
                        </Text>
                        {hasAdjustment && (
                          <Badge bg="#F0E6FF" color="#6b006b" fontSize="10px" px="5px">adj</Badge>
                        )}
                      </Flex>
                    </Td>
                    <Td py="12px">{gradeBadge(e.grade)}</Td>
                    <Td py="12px">
                      <Badge
                        bg={e.status === "published" ? "#E6F4EA" : e.status === "finalized" ? "#EBF4FF" : "#F7FAFC"}
                        color={e.status === "published" ? "#38A169" : e.status === "finalized" ? "#3182CE" : "#718096"}
                        px="8px" py="3px" borderRadius="10px" textTransform="none" fontSize="11px"
                      >
                        {e.status}
                      </Badge>
                    </Td>
                    <Td py="12px">
                      <Flex gap="2px">
                        <IconButton aria-label="Edit score" icon={<FaEdit />} size="xs" variant="ghost" colorScheme="blue" onClick={() => openEdit(e)} title="Override score" />
                        <IconButton aria-label="Adjust" icon={<FaSlidersH />} size="xs" variant="ghost" colorScheme="purple" onClick={() => openAdjust(e)} title="Apply curve / extra credit" />
                        <IconButton
                          aria-label="Delete" icon={<FaTrash />} size="xs" variant="ghost" colorScheme="red"
                          isLoading={deletingId === e.id}
                          onClick={() => handleDelete(e)}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editTarget ? "Override Score" : "Add Score Entry"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editTarget ? (
              <Box>
                <Text fontSize="14px" fontWeight="600" mb="4px" color="gray.600">Student</Text>
                <Text fontSize="14px" mb="16px">{editTarget.studentName}</Text>
                <Text fontSize="14px" fontWeight="600" mb="4px" color="gray.600">Assessment</Text>
                <Text fontSize="14px" mb="16px">{editTarget.assessmentName}</Text>
                <Box mb="14px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">New Score (out of {editTarget.maxScore})</Text>
                  <ChakraInput
                    type="number" size="sm" borderRadius="6px"
                    value={formOverride.score}
                    onChange={(e) => setFormOverride((p) => ({ ...p, score: e.target.value }))}
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Override Reason</Text>
                  <Textarea
                    size="sm" borderRadius="6px" rows={2}
                    placeholder="e.g. Regraded after appeal"
                    value={formOverride.overrideReason}
                    onChange={(e) => setFormOverride((p) => ({ ...p, overrideReason: e.target.value }))}
                  />
                </Box>
              </Box>
            ) : (
              <Box>
                <Box mb="14px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Student ID *</Text>
                  <ChakraInput size="sm" borderRadius="6px" placeholder="Student UUID" value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} />
                </Box>
                <Box mb="14px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Category *</Text>
                  <ChakraSelect size="sm" borderRadius="6px" value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </ChakraSelect>
                </Box>
                <Box mb="14px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Assessment Name *</Text>
                  <ChakraInput size="sm" borderRadius="6px" placeholder="e.g. Midterm Exam" value={form.assessmentName} onChange={(e) => setForm((p) => ({ ...p, assessmentName: e.target.value }))} />
                </Box>
                <Box mb="14px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Assessment Type</Text>
                  <ChakraSelect size="sm" borderRadius="6px" value={form.assessmentType} onChange={(e) => setForm((p) => ({ ...p, assessmentType: e.target.value }))}>
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                    <option value="participation">Participation</option>
                  </ChakraSelect>
                </Box>
                <Grid templateColumns="1fr 1fr" gap="12px" mb="14px">
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Score *</Text>
                    <ChakraInput type="number" size="sm" borderRadius="6px" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} />
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Max Score</Text>
                    <ChakraInput type="number" size="sm" borderRadius="6px" value={form.maxScore} onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))} />
                  </Box>
                </Grid>
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Feedback</Text>
                  <Textarea size="sm" borderRadius="6px" rows={2} placeholder="Optional feedback" value={form.feedback} onChange={(e) => setForm((p) => ({ ...p, feedback: e.target.value }))} />
                </Box>
              </Box>
            )}
          </ModalBody>
          <ModalFooter gap="8px">
            <Button secondary onClick={onClose}>Cancel</Button>
            <Button isLoading={saving} onClick={handleSave}>{editTarget ? "Update" : "Add Entry"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Adjust / Curve modal */}
      <Modal isOpen={isAdjustOpen} onClose={onAdjustClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Apply Adjustment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {adjustTarget && (
              <Box>
                <Box mb="6px">
                  <Text fontSize="13px" color="gray.500">
                    {adjustTarget.studentName} — {adjustTarget.assessmentName}
                  </Text>
                  <Text fontSize="12px" color="gray.400">
                    Current score: {adjustTarget.score}/{adjustTarget.maxScore}
                  </Text>
                </Box>
                <Box bg="#FFF5EA" border="1px solid #FBD38D" borderRadius="6px" px="12px" py="8px" mb="16px">
                  <Text fontSize="12px" color="#744210">
                    effectiveScore = min(score + adjustment + extraCredit, maxScore)
                  </Text>
                </Box>
                <Box mb="14px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">
                    Adjustment Value <Text as="span" fontSize="11px" fontWeight="400" color="gray.400">(positive = curve up, negative = deduction)</Text>
                  </Text>
                  <ChakraInput
                    type="number" size="sm" borderRadius="6px"
                    value={adjustForm.adjustmentValue}
                    onChange={(e) => setAdjustForm((p) => ({ ...p, adjustmentValue: e.target.value }))}
                  />
                </Box>
                <Box mb="14px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Extra Credit</Text>
                  <ChakraInput
                    type="number" min={0} size="sm" borderRadius="6px"
                    value={adjustForm.extraCredit}
                    onChange={(e) => setAdjustForm((p) => ({ ...p, extraCredit: e.target.value }))}
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Reason *</Text>
                  <Textarea
                    size="sm" borderRadius="6px" rows={2}
                    placeholder="e.g. Class-wide curve applied"
                    value={adjustForm.adjustmentReason}
                    onChange={(e) => setAdjustForm((p) => ({ ...p, adjustmentReason: e.target.value }))}
                  />
                </Box>
              </Box>
            )}
          </ModalBody>
          <ModalFooter gap="8px">
            <Button secondary onClick={onAdjustClose}>Cancel</Button>
            <Button isLoading={adjustSaving} onClick={handleAdjust}>Apply</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// ── Analytics Tab ─────────────────────────────────────────────────────────────

const AnalyticsTab = ({ gradebookId, courseId }) => {
  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    if (!courseId) return { analytics: null };
    const { analytics } = await gradeBookV2GetAnalytics(gradebookId, courseId);
    return { analytics };
  }, [gradebookId, courseId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const a = resource.data?.analytics;
  const gradeColors = { A: "#38A169", B: "#3182CE", C: "#718096", D: "#DD6B20", F: "#E53E3E" };
  const maxDist = a?.gradeDistribution ? Math.max(...Object.values(a.gradeDistribution), 1) : 1;

  return (
    <Box p="20px">
      {!courseId && <Flex justifyContent="center" py="40px"><Text color="gray.400">Select a course above to view analytics.</Text></Flex>}
      {courseId && resource.loading && <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>}
      {courseId && resource.err && <Flex justifyContent="center" py="40px"><Text color="red.500">Failed to load analytics.</Text></Flex>}
      {a && (
        <>
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap="16px" mb="24px">
            {[
              { label: "Total Students", value: a.totalStudents, color: "#3182CE", bg: "#EBF4FF" },
              { label: "Class Average", value: `${(a.classAverage ?? 0).toFixed(1)}%`, color: "#6b006b", bg: "#F0E6FF" },
              { label: "Highest Score", value: `${a.highestScore ?? "—"}%`, color: "#38A169", bg: "#E6F4EA" },
              { label: "Lowest Score", value: `${a.lowestScore ?? "—"}%`, color: "#E53E3E", bg: "#FED7D7" },
              { label: "Pass Rate", value: `${(a.passRate ?? 0).toFixed(1)}%`, color: "#DD6B20", bg: "#FFF5EA" },
            ].map((card) => (
              <Box key={card.label} bg={card.bg} borderRadius="8px" p="16px" textAlign="center">
                <Text fontSize="22px" fontWeight="700" color={card.color}>{card.value}</Text>
                <Text fontSize="12px" color="gray.600" mt="4px">{card.label}</Text>
              </Box>
            ))}
          </Grid>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="20px" mb="20px">
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="20px">
              <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">Grade Distribution</Text>
              {a.gradeDistribution && Object.entries(a.gradeDistribution).map(([grade, count]) => (
                <Flex key={grade} alignItems="center" gap="12px" mb="10px">
                  <Text fontSize="14px" fontWeight="700" w="24px" color={gradeColors[grade] || "#718096"}>{grade}</Text>
                  <Box flex="1" bg="#F7FAFC" borderRadius="4px" overflow="hidden" h="20px">
                    <Box
                      h="100%" w={`${(count / maxDist) * 100}%`}
                      bg={gradeColors[grade] || "#718096"} borderRadius="4px" transition="width 0.3s"
                    />
                  </Box>
                  <Text fontSize="13px" fontWeight="600" w="24px" textAlign="right">{count}</Text>
                </Flex>
              ))}
            </Box>

            <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="20px">
              <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">Category Performance</Text>
              {(a.categoryBreakdown ?? []).map((cat) => (
                <Box key={cat.category} mb="14px">
                  <Flex justifyContent="space-between" mb="6px">
                    <Text fontSize="13px" fontWeight="500">{cat.category}</Text>
                    <Flex gap="8px" alignItems="center">
                      <Text fontSize="12px" color="gray.500">Weight: {cat.weight}%</Text>
                      <Text fontSize="13px" fontWeight="600" color="#6b006b">{(cat.averageScore ?? 0).toFixed(1)}%</Text>
                    </Flex>
                  </Flex>
                  <Progress value={cat.averageScore ?? 0} size="sm" colorScheme="purple" borderRadius="4px" />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Pass / Fail ratio */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="20px">
            <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">Pass / Fail Ratio</Text>
            {(() => {
              const total = a.totalStudents || 0;
              const passCount = Math.round(((a.passRate ?? 0) / 100) * total);
              const failCount = total - passCount;
              const passWidth = total > 0 ? (passCount / total) * 100 : 0;
              return (
                <Box>
                  <Flex h="32px" borderRadius="8px" overflow="hidden" mb="12px">
                    <Box flex={passWidth} bg="#38A169" minW={passWidth > 0 ? "4px" : "0"} />
                    <Box flex={100 - passWidth} bg="#E53E3E" minW={100 - passWidth > 0 ? "4px" : "0"} />
                  </Flex>
                  <Flex gap="24px">
                    <Flex alignItems="center" gap="8px">
                      <Box w="12px" h="12px" borderRadius="2px" bg="#38A169" flexShrink={0} />
                      <Text fontSize="13px" color="gray.600">
                        Pass — <Text as="span" fontWeight="700" color="#38A169">{passCount}</Text> students ({passWidth.toFixed(1)}%)
                      </Text>
                    </Flex>
                    <Flex alignItems="center" gap="8px">
                      <Box w="12px" h="12px" borderRadius="2px" bg="#E53E3E" flexShrink={0} />
                      <Text fontSize="13px" color="gray.600">
                        Fail — <Text as="span" fontWeight="700" color="#E53E3E">{failCount}</Text> students ({(100 - passWidth).toFixed(1)}%)
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              );
            })()}
          </Box>
        </>
      )}
    </Box>
  );
};

// ── Report Tab ────────────────────────────────────────────────────────────────

const StudentReportRow = ({ student }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tr _hover={{ bg: "#F7FAFC", cursor: "pointer" }} onClick={() => setOpen((o) => !o)}>
        <Td py="12px" fontSize="14px" fontWeight="500">
          <Flex alignItems="center" gap="8px">
            {open ? <FaChevronDown size="11px" color="#718096" /> : <FaChevronRight size="11px" color="#718096" />}
            {student.studentName}
          </Flex>
        </Td>
        <Td py="12px" fontSize="13px" color="gray.600">{student.email}</Td>
        <Td py="12px" fontSize="14px" fontWeight="600">{(student.finalScore ?? 0).toFixed(1)}%</Td>
        <Td py="12px">{gradeBadge(student.finalGrade)}</Td>
        <Td py="12px">{statusBadge(student.status)}</Td>
      </Tr>
      {open && (
        <Tr>
          <Td colSpan={5} py="0" px="0" borderBottom="1px solid #E2E8F0">
            <Box bg="#FAFAFA" px="24px" py="16px">
              <Text fontSize="12px" fontWeight="600" color="gray.500" mb="10px">Category Breakdown</Text>
              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="12px">
                {(student.breakdown ?? []).map((cat) => (
                  <Box key={cat.category} bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="12px">
                    <Text fontSize="12px" color="gray.500" mb="2px">{cat.category} ({cat.weight}%)</Text>
                    <Text fontSize="16px" fontWeight="700" color="#6b006b">{(cat.averageScore ?? 0).toFixed(1)}%</Text>
                    <Text fontSize="11px" color="gray.400">Contribution: {(cat.contribution ?? 0).toFixed(1)} pts</Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Td>
        </Tr>
      )}
    </>
  );
};

const ReportTab = ({ gradebookId, courseId }) => {
  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    if (!courseId) return { report: null };
    const { report } = await gradeBookV2GetReport(gradebookId, courseId);
    return { report };
  }, [gradebookId, courseId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const report = resource.data?.report;
  const students = report?.students ?? [];

  return (
    <Box>
      {!courseId && <Flex justifyContent="center" py="40px"><Text color="gray.400">Select a course above to view the report.</Text></Flex>}
      {courseId && resource.loading && <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>}
      {courseId && resource.err && <Flex justifyContent="center" py="40px"><Text color="red.500">Failed to load report.</Text></Flex>}
      {courseId && !resource.loading && !resource.err && (
        students.length === 0 ? (
          <Flex justifyContent="center" py="40px"><Text color="gray.400">No student data available.</Text></Flex>
        ) : (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Student", "Email", "Final Score", "Grade", "Status"].map((h) => (
                    <Th key={h} py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {students.map((s) => (
                  <StudentReportRow key={s.studentId} student={s} />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
};

// ── Audit Tab ─────────────────────────────────────────────────────────────────

const AuditTab = ({ gradebookId }) => {
  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { audit } = await gradeBookV2GetAudit(gradebookId);
    return { audit };
  }, [gradebookId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const audit = resource.data?.audit ?? [];

  const actionBadge = (action) => {
    const map = {
      created:   { bg: "#E6F4EA", color: "#38A169" },
      updated:   { bg: "#EBF4FF", color: "#3182CE" },
      adjusted:  { bg: "#F0E6FF", color: "#6b006b" },
      deleted:   { bg: "#FED7D7", color: "#E53E3E" },
      finalized: { bg: "#F0E6FF", color: "#6b006b" },
      published: { bg: "#EBF8FF", color: "#553C9A" },
      synced:    { bg: "#E6F4EA", color: "#276749" },
    };
    const s = map[String(action).toLowerCase()] || { bg: "#F7FAFC", color: "#718096" };
    return (
      <Badge bg={s.bg} color={s.color} px="8px" py="3px" borderRadius="10px" textTransform="none" fontSize="11px">{action}</Badge>
    );
  };

  return (
    <Box>
      {resource.loading && <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>}
      {resource.err && <Flex justifyContent="center" py="40px"><Text color="red.500">Failed to load audit log.</Text></Flex>}
      {!resource.loading && !resource.err && (
        audit.length === 0 ? (
          <Flex justifyContent="center" py="40px"><Text color="gray.400">No audit records found.</Text></Flex>
        ) : (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Date", "Action", "Performed By", "Changed Fields", "Previous", "New"].map((h) => (
                    <Th key={h} py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {audit.map((log) => (
                  <Tr key={log.id} _hover={{ bg: "#F7FAFC" }}>
                    <Td py="12px" fontSize="12px" color="gray.500" whiteSpace="nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </Td>
                    <Td py="12px">{actionBadge(log.action)}</Td>
                    <Td py="12px" fontSize="13px">
                      {log.performer ? `${log.performer.firstName} ${log.performer.lastName}` : "—"}
                    </Td>
                    <Td py="12px" fontSize="12px" color="gray.600">
                      {(log.changedFields ?? []).join(", ") || "—"}
                    </Td>
                    <Td py="12px" fontSize="12px" color="gray.500" maxW="180px">
                      {log.previousValue ? (
                        <Text noOfLines={2} fontFamily="mono">{JSON.stringify(log.previousValue)}</Text>
                      ) : "—"}
                    </Td>
                    <Td py="12px" fontSize="12px" color="gray.700" maxW="180px">
                      {log.newValue ? (
                        <Text noOfLines={2} fontFamily="mono">{JSON.stringify(log.newValue)}</Text>
                      ) : "—"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const GradeBookV2DetailsPage = () => {
  const history = useHistory();
  const { gradebookId } = useParams();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("entries");
  const [finalizing, setFinalizing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [entriesKey, setEntriesKey] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [detaching, setDetaching] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [attachCourseId, setAttachCourseId] = useState("");
  const { isOpen: isSyncOpen, onOpen: onSyncOpen, onClose: onSyncClose } = useDisclosure();
  const { isOpen: isFinalizeOpen, onOpen: onFinalizeOpen, onClose: onFinalizeClose } = useDisclosure();
  const { isOpen: isPublishOpen, onOpen: onPublishOpen, onClose: onPublishClose } = useDisclosure();
  const { isOpen: isArchiveOpen, onOpen: onArchiveOpen, onClose: onArchiveClose } = useDisclosure();
  const { isOpen: isDetachOpen, onOpen: onDetachOpen, onClose: onDetachClose } = useDisclosure();
  const { isOpen: isAttachOpen, onOpen: onAttachOpen, onClose: onAttachClose } = useDisclosure();
  const finalizeRef = React.useRef();
  const publishRef = React.useRef();
  const archiveRef = React.useRef();
  const detachRef = React.useRef();

  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { gradeBook } = await gradeBookV2GetById(gradebookId);
    return { gradeBook };
  }, [gradebookId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const { resource: coursesResource, handleFetchResource: fetchCourses } = useFetch();
  const coursesFetcher = useCallback(async () => {
    const { courses } = await gradeBookV2GetCourses(gradebookId);
    return { courses };
  }, [gradebookId]);
  useEffect(() => { fetchCourses({ fetcher: coursesFetcher }); }, [fetchCourses, coursesFetcher]);

  const fetchCourseOptions = useCallback(async (query) => {
    const { courses } = await adminGetCourseListing({ search: query });
    return courses.map((c) => ({ id: c.id, label: c.title }));
  }, []);

  const gradeBook = resource.data?.gradeBook;
  const status = String(gradeBook?.status || "draft").toLowerCase();
  const isArchived = !!gradeBook?.archivedAt;
  const attachedCourses = useMemo(() => coursesResource.data?.courses ?? [], [coursesResource.data]);

  useEffect(() => {
    if (attachedCourses.length && !selectedCourseId) {
      setSelectedCourseId(attachedCourses[0].id);
    }
    if (attachedCourses.length && selectedCourseId && !attachedCourses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(attachedCourses[0].id);
    }
    if (attachedCourses.length === 0 && selectedCourseId) {
      setSelectedCourseId("");
    }
  }, [attachedCourses, selectedCourseId]);

  const refreshCourses = () => fetchCourses({ fetcher: coursesFetcher });

  const handleFinalize = async () => {
    onFinalizeClose();
    setFinalizing(true);
    try {
      await gradeBookV2Finalize(gradebookId);
      toast({ title: "Grade book finalized", status: "success", duration: 3000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to finalize", status: "error", duration: 3000, isClosable: true });
    } finally {
      setFinalizing(false);
    }
  };

  const handlePublish = async () => {
    onPublishClose();
    setPublishing(true);
    try {
      await gradeBookV2Publish(gradebookId);
      toast({ title: "Grades published to students", status: "success", duration: 3000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to publish", status: "error", duration: 3000, isClosable: true });
    } finally {
      setPublishing(false);
    }
  };

  const handleArchiveToggle = async () => {
    onArchiveClose();
    setArchiving(true);
    try {
      if (isArchived) {
        await gradeBookV2Unarchive(gradebookId);
        toast({ title: "Grade book unarchived", status: "success", duration: 3000, isClosable: true });
      } else {
        await gradeBookV2Archive(gradebookId);
        toast({ title: "Grade book archived", status: "success", duration: 3000, isClosable: true });
      }
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Action failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setArchiving(false);
    }
  };

  const openAttach = () => {
    setAttachCourseId("");
    onAttachOpen();
  };

  const handleAttach = async () => {
    if (!attachCourseId) {
      toast({ title: "Select a course", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    setAttaching(true);
    try {
      await gradeBookV2Attach(attachCourseId, gradebookId);
      toast({ title: "Course attached", status: "success", duration: 3000, isClosable: true });
      onAttachClose();
      refreshCourses();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to attach course", status: "error", duration: 4000, isClosable: true });
    } finally {
      setAttaching(false);
    }
  };

  const handleDetach = async () => {
    onDetachClose();
    setDetaching(true);
    try {
      await gradeBookV2Detach(selectedCourseId);
      toast({ title: "Course detached", status: "success", duration: 3000, isClosable: true });
      refreshCourses();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to detach course", status: "error", duration: 3000, isClosable: true });
    } finally {
      setDetaching(false);
    }
  };

  const handleSync = async () => {
    if (!selectedCourseId) return;
    setSyncing(true);
    try {
      const { result } = await gradeBookV2Sync(gradebookId, selectedCourseId);
      setSyncResult(result);
      onSyncOpen();
      setEntriesKey((k) => k + 1);
    } catch (err) {
      toast({
        title: err?.response?.data?.message || "Sync failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async (format) => {
    if (!selectedCourseId) return;
    setExporting(format);
    try {
      const blob = await gradeBookV2Export(gradebookId, selectedCourseId, format);
      const ext = format.toLowerCase() === "excel" ? "xlsx" : format.toLowerCase();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `gradebook-${gradebookId}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Export failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setExporting(null);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/grade-book-v2">Advanced Grade Book</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Grade Book Details</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/grade-book-v2")}
        />
        <Heading fontSize="22px" fontWeight="600">Grade Book Details</Heading>
      </Flex>

      {resource.loading && <Flex justifyContent="center" py="60px"><Spinner size="xl" color="blue.500" /></Flex>}
      {resource.err && <Flex justifyContent="center" py="60px"><Text color="red.500">Failed to load grade book.</Text></Flex>}

      {!resource.loading && !resource.err && gradeBook && (
        <>
          {/* Header card */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="24px" mb="20px">
            <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px">
              <Box>
                <Text fontSize="20px" fontWeight="700" color="#1A202C" mb="6px">{gradeBook.title}</Text>
                <Text fontSize="14px" color="gray.500">
                  {attachedCourses.length} course{attachedCourses.length === 1 ? "" : "s"} attached
                </Text>
              </Box>
              <Flex gap="8px" alignItems="center" flexWrap="wrap">
                {isArchived && (
                  <Badge bg="#F7FAFC" color="#718096" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
                    Archived
                  </Badge>
                )}
                {statusBadge(gradeBook.status)}
              </Flex>
            </Flex>

            <Divider my="16px" />

            {/* Course scoping */}
            <Flex gap="12px" alignItems="center" flexWrap="wrap" mb="4px">
              {attachedCourses.length > 0 ? (
                <>
                  <Text fontSize="12px" fontWeight="600" color="gray.500">Course</Text>
                  <ChakraSelect
                    size="sm"
                    borderRadius="6px"
                    maxW="280px"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {attachedCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </ChakraSelect>
                  <Button size="xs" variant="ghost" leftIcon={<FaUnlink />} isLoading={detaching} onClick={onDetachOpen}>
                    Detach
                  </Button>
                </>
              ) : (
                <Text fontSize="13px" color="gray.400">No courses attached yet.</Text>
              )}
              <Button size="sm" variant="outline" leftIcon={<FaLink />} onClick={openAttach}>
                Attach Course
              </Button>
            </Flex>

            <Divider my="16px" />

            {/* Action bar */}
            <Flex gap="8px" flexWrap="wrap" alignItems="center">
              {/* Sync LMS Data */}
              <Button
                size="sm"
                secondary
                leftIcon={<FaSync />}
                isLoading={syncing}
                isDisabled={!selectedCourseId}
                onClick={handleSync}
              >
                Sync LMS Data
              </Button>

              {/* Export dropdown */}
              <Menu>
                <MenuButton
                  as={Box}
                  display="inline-flex"
                  alignItems="center"
                  gap="6px"
                  px="12px"
                  h="32px"
                  border="1px solid #E2E8F0"
                  borderRadius="6px"
                  fontSize="13px"
                  fontWeight="500"
                  color={selectedCourseId ? "gray.700" : "gray.400"}
                  bg="white"
                  cursor={selectedCourseId ? "pointer" : "not-allowed"}
                  opacity={selectedCourseId ? 1 : 0.6}
                  _hover={selectedCourseId ? { bg: "#F7FAFC" } : {}}
                >
                  <FaDownload size="11px" />
                  <Text>{exporting ? `Exporting ${exporting}…` : "Export"}</Text>
                  <FaChevronDown size="9px" />
                </MenuButton>
                <MenuList minW="140px" shadow="md" zIndex={10}>
                  <MenuItem fontSize="13px" onClick={() => handleExport("Excel")} isDisabled={!!exporting || !selectedCourseId}>
                    Excel (.xlsx)
                  </MenuItem>
                  <MenuItem fontSize="13px" onClick={() => handleExport("PDF")} isDisabled={!!exporting || !selectedCourseId}>
                    PDF
                  </MenuItem>
                  <MenuItem fontSize="13px" onClick={() => handleExport("CSV")} isDisabled={!!exporting || !selectedCourseId}>
                    CSV
                  </MenuItem>
                </MenuList>
              </Menu>

              <Box flex={1} />

              <Button
                size="sm"
                secondary
                leftIcon={isArchived ? <FaBoxOpen /> : <FaArchive />}
                isLoading={archiving}
                onClick={onArchiveOpen}
              >
                {isArchived ? "Unarchive" : "Archive"}
              </Button>

              <Button
                size="sm"
                secondary
                onClick={() => history.push(`/admin/grade-book-v2/${gradebookId}/edit`)}
              >
                Edit Setup
              </Button>

              {status === "draft" && (
                <Button size="sm" isLoading={finalizing} onClick={onFinalizeOpen}>
                  Finalize
                </Button>
              )}
              {status === "finalized" && (
                <Button size="sm" isLoading={publishing} onClick={onPublishOpen}>
                  Publish to Students
                </Button>
              )}
            </Flex>

            <Divider my="16px" />

            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="16px">
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Calculation Method</Text>
                <Text fontSize="14px" fontWeight="500" textTransform="capitalize">
                  {(gradeBook.calculationMethod || "—").replace("_", " ")}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Categories</Text>
                <Text fontSize="14px" fontWeight="500">{gradeBook.categories?.length ?? 0}</Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Created</Text>
                <Text fontSize="14px" fontWeight="500">
                  {gradeBook.createdAt ? new Date(gradeBook.createdAt).toLocaleDateString() : "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Grading Scale</Text>
                <Flex gap="4px" flexWrap="wrap">
                  {gradeBook.gradingScale && Object.entries(gradeBook.gradingScale).map(([g, r]) => (
                    <Badge key={g} bg="#F7FAFC" color="#4A5568" px="6px" py="2px" borderRadius="4px" fontSize="11px">
                      {g}: {r}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
            <Flex borderBottom="1px solid #E2E8F0" px="8px">
              <Tab label="Entries" active={activeTab === "entries"} onClick={() => setActiveTab("entries")} />
              <Tab label="Analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
              <Tab label="Report" active={activeTab === "report"} onClick={() => setActiveTab("report")} />
              <Tab label="Audit Log" active={activeTab === "audit"} onClick={() => setActiveTab("audit")} />
            </Flex>

            {activeTab === "entries" && (
              <EntriesTab
                key={`${entriesKey}-${selectedCourseId}`}
                gradebookId={gradebookId}
                courseId={selectedCourseId}
                categories={gradeBook.categories ?? []}
              />
            )}
            {activeTab === "analytics" && <AnalyticsTab gradebookId={gradebookId} courseId={selectedCourseId} />}
            {activeTab === "report" && <ReportTab gradebookId={gradebookId} courseId={selectedCourseId} />}
            {activeTab === "audit" && <AuditTab gradebookId={gradebookId} />}
          </Box>
        </>
      )}

      {/* Sync result modal */}
      <Modal isOpen={isSyncOpen} onClose={onSyncClose} size="sm" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sync Complete</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px">
            {syncResult && (
              <Grid templateColumns="repeat(3, 1fr)" gap="12px">
                {[
                  { label: "Students Processed", value: syncResult.studentsProcessed ?? 0, color: "#3182CE", bg: "#EBF4FF" },
                  { label: "Entries Created", value: syncResult.entriesCreated ?? 0, color: "#38A169", bg: "#E6F4EA" },
                  { label: "Entries Skipped", value: syncResult.entriesSkipped ?? 0, color: "#718096", bg: "#F7FAFC" },
                ].map((s) => (
                  <Box key={s.label} bg={s.bg} borderRadius="8px" p="16px" textAlign="center">
                    <Text fontSize="26px" fontWeight="800" color={s.color}>{s.value}</Text>
                    <Text fontSize="11px" color="gray.500" mt="4px">{s.label}</Text>
                  </Box>
                ))}
              </Grid>
            )}
            <Text fontSize="12px" color="gray.400" mt="16px" textAlign="center">
              Entries tab has been refreshed automatically.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Finalize confirmation */}
      <AlertDialog isOpen={isFinalizeOpen} leastDestructiveRef={finalizeRef} onClose={onFinalizeClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">Finalize Grade Book?</AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              This will lock all entries and set the status to <strong>Finalized</strong>. Students cannot view grades yet, but entries will no longer be editable. This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={finalizeRef} onClick={onFinalizeClose}>Cancel</Button>
              <Button isLoading={finalizing} onClick={handleFinalize}>Finalize</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Publish confirmation */}
      <AlertDialog isOpen={isPublishOpen} leastDestructiveRef={publishRef} onClose={onPublishClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">Publish Grades?</AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              Students will be able to view their grades immediately after publishing. Notifications will be sent. This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={publishRef} onClick={onPublishClose}>Cancel</Button>
              <Button isLoading={publishing} onClick={handlePublish}>Publish</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Archive / Unarchive confirmation */}
      <AlertDialog isOpen={isArchiveOpen} leastDestructiveRef={archiveRef} onClose={onArchiveClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">
              {isArchived ? "Unarchive Grade Book?" : "Archive Grade Book?"}
            </AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              {isArchived
                ? "This grade book will become available to attach to new courses again."
                : "Archived grade books can no longer be newly attached to a course, but courses already using it keep working normally."}
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={archiveRef} onClick={onArchiveClose}>Cancel</Button>
              <Button isLoading={archiving} onClick={handleArchiveToggle}>
                {isArchived ? "Unarchive" : "Archive"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Detach confirmation */}
      <AlertDialog isOpen={isDetachOpen} leastDestructiveRef={detachRef} onClose={onDetachClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">Detach Course?</AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              This will clear the grade book link for this course. Entries already recorded are unaffected, but the course will no longer show this grade book to students.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={detachRef} onClick={onDetachClose}>Cancel</Button>
              <Button isLoading={detaching} onClick={handleDetach}>Detach</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Attach course modal */}
      <Modal isOpen={isAttachOpen} onClose={onAttachClose} size="sm" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attach Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px">
            <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Course</Text>
            <EntityCombobox
              fetchFn={fetchCourseOptions}
              value={attachCourseId}
              onSelect={(opt) => setAttachCourseId(opt?.id ?? "")}
              placeholder="Search course by title…"
            />
          </ModalBody>
          <ModalFooter gap="8px">
            <Button secondary onClick={onAttachClose}>Cancel</Button>
            <Button isLoading={attaching} onClick={handleAttach}>Attach</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const GradeBookV2DetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeBookV2DetailsPage {...props} />} />
);

export default GradeBookV2DetailsPageRoute;
