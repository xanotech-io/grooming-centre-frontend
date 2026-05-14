import React, { useCallback, useEffect, useState } from "react";
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
  useDisclosure,
  IconButton,
  Textarea,
  Select as ChakraSelect,
  Input as ChakraInput,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  Collapse,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  gradeBookV2GetById,
  gradeBookV2AddEntry,
  gradeBookV2UpdateEntry,
  gradeBookV2DeleteEntry,
  gradeBookV2GetAnalytics,
  gradeBookV2GetReport,
  gradeBookV2Finalize,
  gradeBookV2Publish,
  gradeBookV2GetAudit,
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
    draft:      { bg: "#F7FAFC", color: "#718096", label: "Draft" },
    finalized:  { bg: "#EBF4FF", color: "#3182CE", label: "Finalized" },
    published:  { bg: "#E6F4EA", color: "#38A169", label: "Published" },
  };
  const s = map[String(status).toLowerCase()] || map.draft;
  return (
    <Badge bg={s.bg} color={s.color} px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
      {s.label}
    </Badge>
  );
};

const gradeBadge = (grade) => {
  const color = grade === "A" ? "#38A169" : grade === "F" ? "#E53E3E" : grade?.startsWith("B") ? "#3182CE" : "#DD6B20";
  return (
    <Badge bg="transparent" color={color} fontWeight="700" fontSize="14px">{grade || "—"}</Badge>
  );
};

// ── Entries Tab ───────────────────────────────────────────────────────────────

const EntriesTab = ({ gradebookId, categories }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [editTarget, setEditTarget] = useState(null);

  // Entry form state
  const [form, setForm] = useState({
    studentId: "", categoryId: "", assessmentName: "",
    assessmentType: "exam", score: "", maxScore: 100, feedback: "",
  });
  const [formOverride, setFormOverride] = useState({ score: "", overrideReason: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const { report } = await gradeBookV2GetReport(gradebookId);
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
  }, [gradebookId]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTarget) {
        await gradeBookV2UpdateEntry(gradebookId, editTarget.id, {
          score: Number(formOverride.score),
          overrideReason: formOverride.overrideReason || undefined,
        });
        toast({ title: "Entry updated", status: "success", duration: 2000, isClosable: true });
      } else {
        await gradeBookV2AddEntry(gradebookId, {
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

  const handleDelete = async (entry) => {
    setDeletingId(entry.id);
    try {
      await gradeBookV2DeleteEntry(gradebookId, entry.id);
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
        <Button size="sm" leftIcon={<FaPlus />} onClick={openAdd}>Add Entry</Button>
      </Flex>

      {loadingEntries ? (
        <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>
      ) : entries.length === 0 ? (
        <Flex justifyContent="center" py="40px">
          <Text color="gray.400">No entries yet. Add the first score entry.</Text>
        </Flex>
      ) : (
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead bg="#F7FAFC">
              <Tr>
                {["Student", "Assessment", "Category", "Score", "Grade", "Status", "Actions"].map((h) => (
                  <Th key={h} py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {entries.map((e) => (
                <Tr key={e.id} _hover={{ bg: "#F7FAFC" }}>
                  <Td py="12px" fontSize="13px" fontWeight="500">{e.studentName || e.studentId}</Td>
                  <Td py="12px" fontSize="13px">{e.assessmentName}</Td>
                  <Td py="12px" fontSize="13px" color="gray.600">{e.category}</Td>
                  <Td py="12px" fontSize="13px">{e.score}/{e.maxScore}</Td>
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
                    <Flex gap="4px">
                      <IconButton aria-label="Edit" icon={<FaEdit />} size="xs" variant="ghost" colorScheme="blue" onClick={() => openEdit(e)} />
                      <IconButton
                        aria-label="Delete" icon={<FaTrash />} size="xs" variant="ghost" colorScheme="red"
                        isLoading={deletingId === e.id}
                        onClick={() => handleDelete(e)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editTarget ? "Update Score" : "Add Score Entry"}</ModalHeader>
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
    </Box>
  );
};

// ── Analytics Tab ─────────────────────────────────────────────────────────────

const AnalyticsTab = ({ gradebookId }) => {
  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { analytics } = await gradeBookV2GetAnalytics(gradebookId);
    return { analytics };
  }, [gradebookId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const a = resource.data?.analytics;

  const gradeColors = {
    A: "#38A169", B: "#3182CE", C: "#718096", D: "#DD6B20", F: "#E53E3E",
  };

  const maxDist = a?.gradeDistribution ? Math.max(...Object.values(a.gradeDistribution), 1) : 1;

  return (
    <Box p="20px">
      {resource.loading && <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>}
      {resource.err && <Flex justifyContent="center" py="40px"><Text color="red.500">Failed to load analytics.</Text></Flex>}
      {a && (
        <>
          {/* KPI Cards */}
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

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="20px">
            {/* Grade Distribution */}
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="20px">
              <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">Grade Distribution</Text>
              {a.gradeDistribution && Object.entries(a.gradeDistribution).map(([grade, count]) => (
                <Flex key={grade} alignItems="center" gap="12px" mb="10px">
                  <Text fontSize="14px" fontWeight="700" w="24px" color={gradeColors[grade] || "#718096"}>{grade}</Text>
                  <Box flex="1" bg="#F7FAFC" borderRadius="4px" overflow="hidden" h="20px">
                    <Box
                      h="100%"
                      w={`${(count / maxDist) * 100}%`}
                      bg={gradeColors[grade] || "#718096"}
                      borderRadius="4px"
                      transition="width 0.3s"
                    />
                  </Box>
                  <Text fontSize="13px" fontWeight="600" w="24px" textAlign="right">{count}</Text>
                </Flex>
              ))}
            </Box>

            {/* Category Breakdown */}
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
      <Tr
        _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
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

const ReportTab = ({ gradebookId }) => {
  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { report } = await gradeBookV2GetReport(gradebookId);
    return { report };
  }, [gradebookId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const report = resource.data?.report;
  const students = report?.students ?? [];

  return (
    <Box>
      {resource.loading && <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>}
      {resource.err && <Flex justifyContent="center" py="40px"><Text color="red.500">Failed to load report.</Text></Flex>}
      {!resource.loading && !resource.err && (
        <>
          {students.length === 0 ? (
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
          )}
        </>
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
      created:  { bg: "#E6F4EA", color: "#38A169" },
      updated:  { bg: "#EBF4FF", color: "#3182CE" },
      deleted:  { bg: "#FED7D7", color: "#E53E3E" },
      finalized:{ bg: "#F0E6FF", color: "#6b006b" },
      published:{ bg: "#EBF8FF", color: "#553C9A" },
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
        <>
          {audit.length === 0 ? (
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
          )}
        </>
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

  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { gradeBook } = await gradeBookV2GetById(gradebookId);
    return { gradeBook };
  }, [gradebookId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const gradeBook = resource.data?.gradeBook;
  const status = String(gradeBook?.status || "draft").toLowerCase();

  const handleFinalize = async () => {
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

  return (
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
                <Text fontSize="14px" color="gray.500">{gradeBook.course?.title || gradeBook.courseId}</Text>
              </Box>
              <Flex gap="10px" alignItems="center" flexWrap="wrap">
                {statusBadge(gradeBook.status)}
                <Button
                  size="sm"
                  secondary
                  onClick={() => history.push(`/admin/grade-book-v2/${gradebookId}/edit`)}
                >
                  Edit Setup
                </Button>
                {status === "draft" && (
                  <Button size="sm" isLoading={finalizing} onClick={handleFinalize}>
                    Finalize
                  </Button>
                )}
                {status === "finalized" && (
                  <Button size="sm" isLoading={publishing} onClick={handlePublish}>
                    Publish to Students
                  </Button>
                )}
              </Flex>
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
              <EntriesTab gradebookId={gradebookId} categories={gradeBook.categories ?? []} />
            )}
            {activeTab === "analytics" && <AnalyticsTab gradebookId={gradebookId} />}
            {activeTab === "report" && <ReportTab gradebookId={gradebookId} />}
            {activeTab === "audit" && <AuditTab gradebookId={gradebookId} />}
          </Box>
        </>
      )}
    </Box>
  );
};

export const GradeBookV2DetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeBookV2DetailsPage {...props} />} />
);

export default GradeBookV2DetailsPageRoute;
