import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
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
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Textarea,
  Progress,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaPlus,
  FaHistory,
  FaChartBar,
  FaFileImport,
  FaTrash,
} from "react-icons/fa";
import { Button, Heading, Input, Select } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetGradeBookById,
  adminGetGradeBookEntries,
  adminGetGradeBookStatistics,
  adminAddGradeEntry,
  adminBulkImportGrades,
  adminPublishGradeBook,
  adminApplyLatePenalty,
  adminGetGradeHistory,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const GRADE_COLOR = {
  A: "#38A169",
  "B+": "#3182CE",
  B: "#3182CE",
  "C+": "#718096",
  C: "#718096",
  D: "#DD6B20",
  F: "#E53E3E",
};

const ENTRY_STATUS_MAP = {
  Finalized: { bg: "#E6F4EA", color: "#38A169" },
  Published: { bg: "#EBF4FF", color: "#3182CE" },
  Draft: { bg: "#F7FAFC", color: "#718096" },
};

const getEntryStatusBadge = (status) => {
  const s = ENTRY_STATUS_MAP[status] || ENTRY_STATUS_MAP.Draft;
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="10px"
      py="3px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="12px"
    >
      {status}
    </Badge>
  );
};

const emptyBulkRow = () => ({
  _key: Date.now() + Math.random(),
  studentId: "",
  assessmentName: "",
  score: "",
  maxScore: 100,
  category: "",
});

export const GradeBookDetailsPage = () => {
  const history = useHistory();
  const { gradeBookId } = useParams();
  const toast = useToast();

  const addEntryDisc = useDisclosure();
  const bulkImportDisc = useDisclosure();
  const penaltyDisc = useDisclosure();
  const historyDisc = useDisclosure();

  const { resource: bookResource, handleFetchResource: fetchBook } = useFetch();
  const { resource: entriesResource, handleFetchResource: fetchEntries } = useFetch();
  const { resource: statsResource, handleFetchResource: fetchStats } = useFetch();

  // Add Entry form
  const [newStudentId, setNewStudentId] = useState("");
  const [newAssessmentType, setNewAssessmentType] = useState("Quiz");
  const [newAssessmentName, setNewAssessmentName] = useState("");
  const [newScore, setNewScore] = useState(0);
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [newWeight, setNewWeight] = useState(5);
  const [newCategory, setNewCategory] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Bulk import rows
  const [bulkRows, setBulkRows] = useState([emptyBulkRow()]);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  // Late penalty
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [penaltyPct, setPenaltyPct] = useState(10);
  const [penaltyReason, setPenaltyReason] = useState("");
  const [isApplyingPenalty, setIsApplyingPenalty] = useState(false);

  // Grade history
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Publish loading
  const [isPublishing, setIsPublishing] = useState(false);

  const bookFetcher = useCallback(async () => {
    const { gradeBook } = await adminGetGradeBookById(gradeBookId);
    return gradeBook;
  }, [gradeBookId]);

  const entriesFetcher = useCallback(async () => {
    const { entries, totalDocumentsCount } = await adminGetGradeBookEntries(gradeBookId);
    return { entries, totalDocumentsCount };
  }, [gradeBookId]);

  const statsFetcher = useCallback(async () => {
    const { statistics } = await adminGetGradeBookStatistics(gradeBookId);
    return statistics;
  }, [gradeBookId]);

  useEffect(() => {
    fetchBook({ fetcher: bookFetcher });
    fetchEntries({ fetcher: entriesFetcher });
    fetchStats({ fetcher: statsFetcher });
  }, [fetchBook, bookFetcher, fetchEntries, entriesFetcher, fetchStats, statsFetcher]);

  const gradeBook = bookResource.data;
  const entries = entriesResource.data?.entries ?? [];
  const stats = statsResource.data;

  const categoryOptions =
    gradeBook?.assessmentCategories?.map((c) => ({
      label: c.categoryName,
      value: c.categoryName,
    })) ?? [];

  const handleAddEntry = async () => {
    if (!newStudentId.trim()) {
      toast({ description: "Student ID is required.", position: "top", status: "warning" });
      return;
    }
    if (!newAssessmentName.trim()) {
      toast({ description: "Assessment name is required.", position: "top", status: "warning" });
      return;
    }
    setIsAddingEntry(true);
    try {
      const { message } = await adminAddGradeEntry(gradeBookId, {
        studentId: newStudentId,
        assessmentType: newAssessmentType,
        assessmentName: newAssessmentName,
        score: Number(newScore),
        maxScore: Number(newMaxScore),
        weight: Number(newWeight),
        category: newCategory,
        dateSubmitted: new Date().toISOString(),
        feedback: newFeedback,
        allowRetake: false,
      });
      toast({ description: capitalizeFirstLetter(message), position: "top", status: "success" });
      addEntryDisc.onClose();
      setNewStudentId("");
      setNewAssessmentName("");
      setNewFeedback("");
      fetchEntries({ fetcher: entriesFetcher });
    } catch (err) {
      toast({ description: capitalizeFirstLetter(err.message), position: "top", status: "error" });
    } finally {
      setIsAddingEntry(false);
    }
  };

  const handleBulkImport = async () => {
    const validRows = bulkRows.filter((r) => r.studentId.trim() && r.assessmentName.trim());
    if (validRows.length === 0) {
      toast({ description: "Add at least one valid entry.", position: "top", status: "warning" });
      return;
    }
    setIsBulkImporting(true);
    try {
      const body = {
        entries: validRows.map(({ _key, ...r }) => ({
          ...r,
          score: Number(r.score),
          maxScore: Number(r.maxScore),
        })),
        skipValidation: false,
        updateExisting: true,
      };
      const { message } = await adminBulkImportGrades(gradeBookId, body);
      toast({ description: capitalizeFirstLetter(message), position: "top", status: "success" });
      bulkImportDisc.onClose();
      setBulkRows([emptyBulkRow()]);
      fetchEntries({ fetcher: entriesFetcher });
    } catch (err) {
      toast({ description: capitalizeFirstLetter(err.message), position: "top", status: "error" });
    } finally {
      setIsBulkImporting(false);
    }
  };

  const openPenaltyModal = (entryId) => {
    setSelectedEntryId(entryId);
    setPenaltyPct(10);
    setPenaltyReason("");
    penaltyDisc.onOpen();
  };

  const handleApplyPenalty = async () => {
    if (!penaltyReason.trim()) {
      toast({ description: "A reason is required.", position: "top", status: "warning" });
      return;
    }
    setIsApplyingPenalty(true);
    try {
      const { message } = await adminApplyLatePenalty(selectedEntryId, {
        penaltyPercentage: Number(penaltyPct),
        reason: penaltyReason,
      });
      toast({ description: capitalizeFirstLetter(message), position: "top", status: "success" });
      penaltyDisc.onClose();
      fetchEntries({ fetcher: entriesFetcher });
    } catch (err) {
      toast({ description: capitalizeFirstLetter(err.message), position: "top", status: "error" });
    } finally {
      setIsApplyingPenalty(false);
    }
  };

  const openHistoryModal = async (entryId) => {
    setHistoryData([]);
    setHistoryLoading(true);
    historyDisc.onOpen();
    try {
      const { history: h } = await adminGetGradeHistory(entryId);
      setHistoryData(h);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { message } = await adminPublishGradeBook(gradeBookId);
      toast({ description: capitalizeFirstLetter(message), position: "top", status: "success" });
      fetchBook({ fetcher: bookFetcher });
    } catch (err) {
      toast({ description: capitalizeFirstLetter(err.message), position: "top", status: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Box
      paddingX={{ base: "20px", lg: "40px" }}
      paddingY="30px"
      bg="#FAFAFA"
      minHeight="100vh"
    >
      {/* Go Back */}
      <Flex
        alignItems="center"
        cursor="pointer"
        onClick={() => history.goBack()}
        mb="24px"
        width="max-content"
      >
        <Box border="1px solid #E2E8F0" borderRadius="4px" p="6px" mr="12px" bg="white">
          <FaArrowLeft color="#1A202C" />
        </Box>
        <Text fontWeight="500" color="#1A202C">
          Go Back
        </Text>
      </Flex>

      {bookResource.loading && (
        <Flex justifyContent="center" alignItems="center" minHeight="60vh">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!bookResource.loading && gradeBook && (
        <>
          {/* Header */}
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            mb="32px"
            flexWrap="wrap"
            gap="16px"
          >
            <Box>
              <Flex alignItems="center" gap="12px" mb="8px">
                <Heading as="h1" size="lg" color="#1A202C" m={0}>
                  {gradeBook.courseName}
                </Heading>
                <Badge
                  bg={gradeBook.status === "Published" ? "#E6F4EA" : "#F7FAFC"}
                  color={gradeBook.status === "Published" ? "#38A169" : "#718096"}
                  px="12px"
                  py="4px"
                  borderRadius="12px"
                  textTransform="none"
                  fontWeight="500"
                >
                  {gradeBook.status}
                </Badge>
              </Flex>
              <Flex gap="24px" flexWrap="wrap">
                <Text color="#718096" fontSize="14px">
                  ID:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {gradeBook.gradeBookId}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Term:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {gradeBook.term}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Instructor:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {gradeBook.instructor}
                  </Text>
                </Text>
              </Flex>
            </Box>
            <Flex gap="10px" flexWrap="wrap">
              <Button
                variant="outline"
                style={{ borderColor: "#6b006b", color: "#6b006b" }}
                onClick={bulkImportDisc.onOpen}
              >
                <Flex alignItems="center" gap="6px">
                  <FaFileImport size="13px" /> Bulk Import
                </Flex>
              </Button>
              <Button
                style={{ backgroundColor: "#6b006b", color: "white" }}
                onClick={addEntryDisc.onOpen}
              >
                <Flex alignItems="center" gap="6px">
                  <FaPlus size="12px" /> Add Entry
                </Flex>
              </Button>
              {gradeBook.status !== "Published" && (
                <Button
                  style={{ backgroundColor: "#38A169", color: "white" }}
                  isLoading={isPublishing}
                  onClick={handlePublish}
                >
                  Publish
                </Button>
              )}
            </Flex>
          </Flex>

          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="28px" alignItems="start">
            {/* Left — Entries Table */}
            <Box>
              {/* Quick Stats */}
              <Grid templateColumns="repeat(3, 1fr)" gap="16px" mb="24px">
                {[
                  { label: "Total Students", value: gradeBook.totalStudents },
                  { label: "Graded Entries", value: gradeBook.gradedEntries },
                  { label: "Pending", value: gradeBook.pendingEntries },
                ].map(({ label, value }) => (
                  <Box key={label} bg="white" p="20px" borderRadius="8px" shadow="sm" textAlign="center">
                    <Text fontSize="12px" color="#718096" mb="6px">
                      {label}
                    </Text>
                    <Text fontSize="24px" fontWeight="700" color="#6b006b">
                      {value}
                    </Text>
                  </Box>
                ))}
              </Grid>

              {/* Entries */}
              <Box bg="white" borderRadius="8px" shadow="sm">
                <Text
                  fontSize="15px"
                  fontWeight="600"
                  color="#1A202C"
                  p="20px"
                  borderBottom="1px solid #E2E8F0"
                >
                  Grade Entries ({entries.length})
                </Text>

                {entriesResource.loading ? (
                  <Flex justifyContent="center" p="40px">
                    <Spinner size="lg" color="#6b006b" />
                  </Flex>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th textTransform="none" color="#4A5568">Student</Th>
                          <Th textTransform="none" color="#4A5568">Assessment</Th>
                          <Th textTransform="none" color="#4A5568">Category</Th>
                          <Th textTransform="none" color="#4A5568">Score</Th>
                          <Th textTransform="none" color="#4A5568">Grade</Th>
                          <Th textTransform="none" color="#4A5568">Status</Th>
                          <Th textTransform="none" color="#4A5568" width="120px">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {entries.map((e) => (
                          <Tr key={e.entryId} _hover={{ bg: "#FAFAFA" }}>
                            <Td>
                              <Text fontSize="13px" fontWeight="500" color="#1A202C">
                                {e.studentName || e.studentId}
                              </Text>
                              <Text fontSize="11px" color="#718096">
                                {e.studentId}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="13px" color="#1A202C">
                                {e.assessmentName}
                              </Text>
                              <Text fontSize="11px" color="#718096">
                                {e.assessmentType}
                              </Text>
                            </Td>
                            <Td fontSize="13px" color="#4A5568">
                              {e.category}
                            </Td>
                            <Td>
                              <Text fontSize="13px" fontWeight="600" color="#1A202C">
                                {e.score}/{e.maxScore}
                              </Text>
                              {e.latePenaltyApplied && (
                                <Text fontSize="11px" color="#E53E3E">
                                  Penalty applied
                                </Text>
                              )}
                            </Td>
                            <Td>
                              <Text
                                fontSize="14px"
                                fontWeight="700"
                                color={GRADE_COLOR[e.grade] || "#1A202C"}
                              >
                                {e.grade}
                              </Text>
                            </Td>
                            <Td>{getEntryStatusBadge(e.status)}</Td>
                            <Td>
                              <Flex gap="6px">
                                {!e.latePenaltyApplied && (
                                  <IconButton
                                    title="Apply Late Penalty"
                                    icon={<FaTrash size="11px" />}
                                    size="xs"
                                    variant="outline"
                                    colorScheme="orange"
                                    aria-label="Apply late penalty"
                                    onClick={() => openPenaltyModal(e.entryId)}
                                  />
                                )}
                                <IconButton
                                  title="Grade History"
                                  icon={<FaHistory size="11px" />}
                                  size="xs"
                                  variant="outline"
                                  colorScheme="blue"
                                  aria-label="Grade history"
                                  onClick={() => openHistoryModal(e.entryId)}
                                />
                              </Flex>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>

            {/* Right — Statistics */}
            <Box>
              {statsResource.loading ? (
                <Flex justifyContent="center" p="30px">
                  <Spinner color="#6b006b" />
                </Flex>
              ) : stats ? (
                <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
                  <Flex alignItems="center" gap="8px" mb="20px">
                    <FaChartBar color="#6b006b" />
                    <Text fontSize="15px" fontWeight="600" color="#1A202C">
                      Statistics
                    </Text>
                  </Flex>

                  {[
                    { label: "Class Average", value: `${stats.classAverage}%`, color: "#6b006b" },
                    { label: "Highest Score", value: stats.highestScore, color: "#38A169" },
                    { label: "Lowest Score", value: stats.lowestScore, color: "#E53E3E" },
                    { label: "Std. Deviation", value: stats.standardDeviation },
                    { label: "Graded Entries", value: stats.gradedEntries },
                    { label: "Pending Entries", value: stats.pendingEntries },
                  ].map(({ label, value, color }) => (
                    <Flex key={label} justifyContent="space-between" alignItems="center" mb="10px">
                      <Text fontSize="13px" color="#718096">
                        {label}
                      </Text>
                      <Text fontSize="14px" fontWeight="600" color={color || "#1A202C"}>
                        {value}
                      </Text>
                    </Flex>
                  ))}

                  <Divider my="16px" />

                  <Text fontSize="13px" fontWeight="600" color="#4A5568" mb="12px">
                    Grade Distribution
                  </Text>
                  {Object.entries(stats.gradeDistribution ?? {}).map(([grade, count]) => {
                    const pct =
                      stats.totalStudents > 0
                        ? Math.round((count / stats.totalStudents) * 100)
                        : 0;
                    return (
                      <Box key={grade} mb="8px">
                        <Flex justifyContent="space-between" mb="3px">
                          <Text
                            fontSize="12px"
                            fontWeight="600"
                            color={GRADE_COLOR[grade] || "#718096"}
                          >
                            {grade}
                          </Text>
                          <Text fontSize="12px" color="#718096">
                            {count} students ({pct}%)
                          </Text>
                        </Flex>
                        <Progress
                          value={pct}
                          size="xs"
                          colorScheme="purple"
                          borderRadius="4px"
                        />
                      </Box>
                    );
                  })}

                  <Divider my="16px" />

                  <Text fontSize="13px" fontWeight="600" color="#4A5568" mb="12px">
                    Assessment Averages
                  </Text>
                  {stats.assessmentAverages?.map((a) => (
                    <Flex key={a.assessmentName} justifyContent="space-between" mb="6px">
                      <Text fontSize="12px" color="#718096">
                        {a.assessmentName}
                      </Text>
                      <Text fontSize="12px" fontWeight="600" color="#1A202C">
                        {a.average}%
                      </Text>
                    </Flex>
                  ))}
                </Box>
              ) : null}

              {/* Grading Scale */}
              {gradeBook.gradingScale && (
                <Box bg="white" borderRadius="8px" p="20px" shadow="sm">
                  <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="14px">
                    Grading Scale
                  </Text>
                  {gradeBook.gradingScale.map((g) => (
                    <Flex key={g.grade} justifyContent="space-between" alignItems="center" mb="8px">
                      <Text
                        fontSize="13px"
                        fontWeight="700"
                        color={GRADE_COLOR[g.grade] || "#718096"}
                        width="32px"
                      >
                        {g.grade}
                      </Text>
                      <Text fontSize="12px" color="#718096">
                        {g.minScore} – {g.maxScore}
                      </Text>
                      <Text fontSize="12px" color="#4A5568" fontWeight="500">
                        {g.gradePoints} GPA
                      </Text>
                    </Flex>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </>
      )}

      {/* Add Entry Modal */}
      <Modal isOpen={addEntryDisc.isOpen} onClose={addEntryDisc.onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C">
            Add Grade Entry
          </ModalHeader>
          <Divider />
          <ModalBody py="24px">
            <Grid templateColumns="1fr 1fr" gap="14px" mb="14px">
              <Input
                label="Student ID"
                id="newStudentId"
                placeholder="e.g. STU-001"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
              />
              <Input
                label="Assessment Name"
                id="newAssessmentName"
                placeholder="e.g. Quiz 2"
                value={newAssessmentName}
                onChange={(e) => setNewAssessmentName(e.target.value)}
              />
            </Grid>
            <Grid templateColumns="1fr 1fr" gap="14px" mb="14px">
              <Input
                label="Assessment Type"
                id="newAssessmentType"
                placeholder="e.g. Quiz"
                value={newAssessmentType}
                onChange={(e) => setNewAssessmentType(e.target.value)}
              />
              {categoryOptions.length > 0 ? (
                <Box>
                  <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                    Category
                  </Text>
                  <Select
                    id="newCategory"
                    options={categoryOptions}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </Box>
              ) : (
                <Input
                  label="Category"
                  id="newCategory"
                  placeholder="e.g. Quizzes"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              )}
            </Grid>
            <Grid templateColumns="1fr 1fr 1fr" gap="12px" mb="14px">
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Score
                </Text>
                <NumberInput min={0} value={newScore} onChange={(v) => setNewScore(v)}>
                  <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Max Score
                </Text>
                <NumberInput min={1} value={newMaxScore} onChange={(v) => setNewMaxScore(v)}>
                  <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Weight (%)
                </Text>
                <NumberInput min={0} max={100} value={newWeight} onChange={(v) => setNewWeight(v)}>
                  <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </Grid>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Feedback (optional)
              </Text>
              <Textarea
                placeholder="e.g. Excellent work on chart selection"
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                rows={3}
              />
            </Box>
          </ModalBody>
          <Divider />
          <ModalFooter gap="12px">
            <Button variant="outline" onClick={addEntryDisc.onClose}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              isLoading={isAddingEntry}
              onClick={handleAddEntry}
            >
              Add Entry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={bulkImportDisc.isOpen}
        onClose={bulkImportDisc.onClose}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C">
            Bulk Import Grades
          </ModalHeader>
          <Divider />
          <ModalBody py="24px">
            <Text fontSize="13px" color="#718096" mb="16px">
              Add multiple grade entries at once. Each row represents one student's assessment score.
            </Text>

            {bulkRows.map((row, idx) => (
              <Flex key={row._key} gap="10px" mb="10px" alignItems="flex-start">
                <Input
                  label={idx === 0 ? "Student ID" : ""}
                  id={`bulk-student-${idx}`}
                  placeholder="STU-001"
                  value={row.studentId}
                  onChange={(e) =>
                    setBulkRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, studentId: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Input
                  label={idx === 0 ? "Assessment" : ""}
                  id={`bulk-assessment-${idx}`}
                  placeholder="Quiz 3"
                  value={row.assessmentName}
                  onChange={(e) =>
                    setBulkRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, assessmentName: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Box>
                  {idx === 0 && (
                    <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                      Score
                    </Text>
                  )}
                  <NumberInput
                    min={0}
                    max={100}
                    value={row.score}
                    onChange={(v) =>
                      setBulkRows((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, score: v } : r)),
                      )
                    }
                    width="80px"
                  >
                    <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                  </NumberInput>
                </Box>
                <Input
                  label={idx === 0 ? "Category" : ""}
                  id={`bulk-cat-${idx}`}
                  placeholder="Quizzes"
                  value={row.category}
                  onChange={(e) =>
                    setBulkRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, category: e.target.value } : r,
                      ),
                    )
                  }
                />
                {bulkRows.length > 1 && (
                  <Box pt={idx === 0 ? "32px" : "0"}>
                    <IconButton
                      icon={<FaTrash size="11px" />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Remove row"
                      onClick={() =>
                        setBulkRows((prev) => prev.filter((_, i) => i !== idx))
                      }
                    />
                  </Box>
                )}
              </Flex>
            ))}

            <Button
              size="sm"
              variant="outline"
              mt="8px"
              onClick={() => setBulkRows((prev) => [...prev, emptyBulkRow()])}
            >
              <Flex alignItems="center" gap="5px">
                <FaPlus size="10px" /> Add Row
              </Flex>
            </Button>
          </ModalBody>
          <Divider />
          <ModalFooter gap="12px">
            <Button variant="outline" onClick={bulkImportDisc.onClose}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              isLoading={isBulkImporting}
              onClick={handleBulkImport}
            >
              Import {bulkRows.filter((r) => r.studentId.trim()).length} Entries
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Late Penalty Modal */}
      <Modal isOpen={penaltyDisc.isOpen} onClose={penaltyDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C">
            Apply Late Penalty
          </ModalHeader>
          <Divider />
          <ModalBody py="24px">
            <Box mb="16px">
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Penalty Percentage (%)
              </Text>
              <NumberInput
                min={1}
                max={100}
                value={penaltyPct}
                onChange={(v) => setPenaltyPct(v)}
              >
                <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Reason
              </Text>
              <Textarea
                placeholder="e.g. Submitted 2 days after deadline"
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
                rows={3}
              />
            </Box>
          </ModalBody>
          <Divider />
          <ModalFooter gap="12px">
            <Button variant="outline" onClick={penaltyDisc.onClose}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#DD6B20", color: "white" }}
              isLoading={isApplyingPenalty}
              onClick={handleApplyPenalty}
            >
              Apply Penalty
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Grade History Modal */}
      <Modal isOpen={historyDisc.isOpen} onClose={historyDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C">
            Grade History
          </ModalHeader>
          <Divider />
          <ModalBody py="24px">
            {historyLoading ? (
              <Flex justifyContent="center" p="30px">
                <Spinner color="#6b006b" />
              </Flex>
            ) : historyData.length === 0 ? (
              <Text fontSize="14px" color="#718096" textAlign="center">
                No history available.
              </Text>
            ) : (
              historyData.map((h, idx) => (
                <Box
                  key={idx}
                  p="14px"
                  border="1px solid #E2E8F0"
                  borderRadius="8px"
                  mb="10px"
                >
                  <Flex justifyContent="space-between" mb="6px">
                    <Flex gap="10px" alignItems="center">
                      <Badge
                        bg="#EBF4FF"
                        color="#3182CE"
                        px="8px"
                        py="2px"
                        borderRadius="6px"
                        fontSize="11px"
                      >
                        v{h.version}
                      </Badge>
                      <Text fontSize="14px" fontWeight="700" color={GRADE_COLOR[h.grade] || "#1A202C"}>
                        {h.grade}
                      </Text>
                      <Text fontSize="14px" color="#1A202C" fontWeight="600">
                        {h.score}
                      </Text>
                    </Flex>
                    <Text fontSize="12px" color="#718096">
                      {h.modifiedAt ? new Date(h.modifiedAt).toLocaleDateString() : ""}
                    </Text>
                  </Flex>
                  <Text fontSize="12px" color="#718096">
                    By {h.modifiedBy}
                  </Text>
                  <Text fontSize="12px" color="#4A5568" mt="4px">
                    {h.reason}
                  </Text>
                </Box>
              ))
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button variant="outline" onClick={historyDisc.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export const GradeBookDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeBookDetailsPage {...props} />} />
);

export default GradeBookDetailsPageRoute;
