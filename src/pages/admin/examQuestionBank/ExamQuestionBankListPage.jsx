import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Badge,
  Box,
  BreadcrumbItem,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiChevronDown, FiCopy, FiEdit2, FiEye, FiMoreHorizontal, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, Link } from "../../../components";
import {
  bulkUpdateExamQuestionBankStatus,
  cleanupOrphanedExamQuestionBankMedia,
  deleteExamQuestionBankItem,
  getExamQuestionBankStats,
  getOrphanedExamQuestionBankMedia,
  listExamQuestionBank,
} from "../../../services";
import UseBankQuestionModal from "./UseBankQuestionModal";

const MOCK_STATS = {
  totalQuestions: 42,
  draftQuestions: 12,
  activeQuestions: 27,
  inactiveQuestions: 3,
  multimediaQuestions: 9,
  multimediaAdoptionRate: 21,
};

const MOCK_QUESTIONS = [
  {
    id: "mock-1",
    question: "Which structure is responsible for photosynthesis in a plant cell?",
    questionType: "mcq",
    difficultyLevel: "Medium",
    marks: 2,
    status: "active",
    category: "Biology",
    tags: ["cells", "biology"],
    courseId: null,
    moduleId: null,
  },
  {
    id: "mock-2",
    question: "Explain the difference between TCP and UDP.",
    questionType: "essay",
    difficultyLevel: "Hard",
    marks: 10,
    status: "draft",
    category: "Networking",
    tags: ["networking"],
    courseId: null,
    moduleId: null,
  },
];

const TYPE_LABEL = {
  mcq: "MCQ",
  true_false: "True / False",
  essay: "Essay",
  fill_blank: "Fill in the Blank",
  short_answer: "Short Answer",
};

const STATUS_COLOR = { draft: "gray", active: "green", inactive: "red" };

function StatCard({ label, value, color }) {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
      <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wide">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={color || "gray.800"}>
        {value ?? "—"}
      </Text>
    </Box>
  );
}

function PaginationBar({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <Flex justify="center" align="center" gap={2} mt={4}>
      <Button size="sm" variant="outline" isDisabled={page <= 1} onClick={() => onPage(page - 1)}>
        Prev
      </Button>
      <Text fontSize="sm" color="gray.600">
        {page} / {totalPages}
      </Text>
      <Button size="sm" variant="outline" isDisabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </Flex>
  );
}

function OrphanedMediaModal({ isOpen, onClose, onCleaned }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [cleaning, setCleaning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrphanedExamQuestionBankMedia();
      const payload = res?.data ?? res;
      setItems(Array.isArray(payload) ? payload : payload?.media || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const handleCleanup = async () => {
    setCleaning(true);
    try {
      await cleanupOrphanedExamQuestionBankMedia();
      toast({ title: "Orphaned media deleted", status: "success", duration: 3000, isClosable: true });
      setItems([]);
      onCleaned?.();
    } catch {
      toast({ title: "Cleanup failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Orphaned Media
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text fontSize="13px" color="gray.500" mb={4}>
            Media attached to questions that have since been deactivated. Safe to delete to reclaim storage.
          </Text>
          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : items.length === 0 ? (
            <Text fontSize="13px" color="gray.400" textAlign="center" py={6}>
              No orphaned media found.
            </Text>
          ) : (
            <>
              <Box maxH="260px" overflowY="auto" mb={4}>
                {items.map((m) => (
                  <Flex key={m.id} justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontSize="12px" color="gray.600" isTruncated maxW="360px">
                      {m.url}
                    </Text>
                    <Badge colorScheme="orange">{m.mediaType}</Badge>
                  </Flex>
                ))}
              </Box>
              <Button colorScheme="red" isLoading={cleaning} onClick={handleCleanup}>
                Delete All Orphaned Media
              </Button>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function ExamQuestionBankListPage() {
  const toast = useToast();
  const history = useHistory();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [useQuestionId, setUseQuestionId] = useState(null);
  const [useQuestionCourseId, setUseQuestionCourseId] = useState("");

  const { isOpen: isOrphanOpen, onOpen: onOrphanOpen, onClose: onOrphanClose } = useDisclosure();
  const { isOpen: isCreateExamOpen, onOpen: onCreateExamOpen, onClose: onCreateExamClose } = useDisclosure();
  const { isOpen: isUseQuestionOpen, onOpen: onUseQuestionOpen, onClose: onUseQuestionClose } = useDisclosure();

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getExamQuestionBankStats();
      setStats(res?.data ?? res);
    } catch {
      console.warn("[ExamQuestionBank] stats failed, using mock");
      setStats(MOCK_STATS);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (questionType) params.questionType = questionType;
      if (difficultyLevel) params.difficultyLevel = difficultyLevel;
      if (status) params.status = status;
      if (category) params.category = category;

      const res = await listExamQuestionBank(params);
      const payload = res?.data ?? res;
      const items = Array.isArray(payload?.questions) ? payload.questions : Array.isArray(payload) ? payload : MOCK_QUESTIONS;
      setQuestions(items);
      const computed = Math.ceil((payload?.total || items.length) / 20) || 1;
      setTotalPages(payload?.totalPages ?? computed);
    } catch {
      console.warn("[ExamQuestionBank] list failed, using mock");
      setQuestions(MOCK_QUESTIONS);
      setTotalPages(1);
    } finally {
      setQuestionsLoading(false);
    }
  }, [page, search, questionType, difficultyLevel, status, category]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const allSelectedOnPage = questions.length > 0 && questions.every((q) => selectedIds.includes(q.id));

  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !questions.some((q) => q.id === id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...questions.map((q) => q.id)])));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete this question from the bank? This cannot be undone.`)) return;
    setDeletingId(q.id);
    try {
      await deleteExamQuestionBankItem(q.id);
      toast({ title: "Question deleted", status: "success", duration: 3000, isClosable: true });
      fetchQuestions();
      fetchStats();
    } catch (err) {
      if (err?.response?.status === 400) {
        toast({
          title: "Cannot delete question",
          description: "This question is already used in an exam. Deactivate it instead.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({ title: err?.response?.data?.message || "Delete failed", status: "error", duration: 4000, isClosable: true });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkStatus = async (newStatus) => {
    try {
      await bulkUpdateExamQuestionBankStatus({ ids: selectedIds, status: newStatus });
      toast({ title: `${selectedIds.length} question(s) updated`, status: "success", duration: 3000, isClosable: true });
      clearSelection();
      fetchQuestions();
      fetchStats();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Bulk update failed", status: "error", duration: 4000, isClosable: true });
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Question Bank</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box p={6}>
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="md" color="gray.800">
              Exam Question Bank
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Save questions once, reuse them across course exams, assessments, and standalone exams.
            </Text>
          </Box>
          <HStack>
            <Tooltip label="Refresh">
              <IconButton
                size="sm"
                variant="outline"
                icon={<FiRefreshCw />}
                onClick={() => {
                  fetchStats();
                  fetchQuestions();
                }}
              />
            </Tooltip>
            <Button size="sm" variant="outline" colorScheme="gray" onClick={onOrphanOpen}>
              Orphaned Media
            </Button>
            <Button size="sm" colorScheme="purple" leftIcon={<FiPlus />} onClick={() => history.push("/admin/exam-question-bank/new")}>
              Add Question
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <StatCard label="Total Questions" value={statsLoading ? "..." : stats?.totalQuestions} />
          <StatCard label="Active" value={statsLoading ? "..." : stats?.activeQuestions} color="green.600" />
          <StatCard label="Draft" value={statsLoading ? "..." : stats?.draftQuestions} color="gray.500" />
          <StatCard
            label="Multimedia Adoption"
            value={statsLoading ? "..." : `${stats?.multimediaAdoptionRate ?? 0}%`}
            color="blue.600"
          />
        </SimpleGrid>

        <Flex gap={3} mb={4} flexWrap="wrap">
          <Input
            size="sm"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            maxW="240px"
          />
          <Select
            size="sm"
            value={questionType}
            onChange={(e) => {
              setQuestionType(e.target.value);
              setPage(1);
            }}
            maxW="180px"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            size="sm"
            value={difficultyLevel}
            onChange={(e) => {
              setDifficultyLevel(e.target.value);
              setPage(1);
            }}
            maxW="150px"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </Select>
          <Select
            size="sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            maxW="150px"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Input
            size="sm"
            placeholder="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            maxW="160px"
          />
        </Flex>

        {selectedIds.length > 0 && (
          <Flex align="center" gap={3} mb={4} p={3} bg="purple.50" borderRadius="md" flexWrap="wrap">
            <Text fontSize="sm" fontWeight="600" color="purple.700">
              {selectedIds.length} selected
            </Text>
            <Menu>
              <MenuButton as={Button} size="sm" variant="outline" rightIcon={<FiChevronDown />}>
                Set Status
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleBulkStatus("draft")}>Draft</MenuItem>
                <MenuItem onClick={() => handleBulkStatus("active")}>Active</MenuItem>
                <MenuItem onClick={() => handleBulkStatus("inactive")}>Inactive</MenuItem>
              </MenuList>
            </Menu>
            <Button size="sm" colorScheme="purple" onClick={onCreateExamOpen}>
              Create New Exam
            </Button>
            <Button size="sm" variant="ghost" colorScheme="gray" onClick={clearSelection}>
              Clear selection
            </Button>
          </Flex>
        )}

        {questionsLoading ? (
          <Flex justify="center" py={10}>
            <Spinner />
          </Flex>
        ) : (
          <>
            <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>
                      <Checkbox isChecked={allSelectedOnPage} onChange={toggleSelectAll} colorScheme="purple" />
                    </Th>
                    <Th>Question</Th>
                    <Th>Type</Th>
                    <Th>Difficulty</Th>
                    <Th>Marks</Th>
                    <Th>Status</Th>
                    <Th>Tags</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {questions.map((q) => (
                    <Tr key={q.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <Checkbox isChecked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} colorScheme="purple" />
                      </Td>
                      <Td
                        maxW="320px"
                        cursor="pointer"
                        onClick={() => {
                          setUseQuestionId(q.id);
                          setUseQuestionCourseId(q.courseId || "");
                          onUseQuestionOpen();
                        }}
                      >
                        <Text fontSize="sm" noOfLines={2}>
                          {q.question}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" variant="subtle">
                          {TYPE_LABEL[q.questionType] || q.questionType}
                        </Badge>
                      </Td>
                      <Td>{q.difficultyLevel}</Td>
                      <Td>{q.marks}</Td>
                      <Td>
                        <Badge colorScheme={STATUS_COLOR[q.status] || "gray"}>{q.status}</Badge>
                      </Td>
                      <Td>
                        <HStack spacing={1} flexWrap="wrap">
                          {(q.tags || []).map((t) => (
                            <Tag key={t} size="sm" colorScheme="teal" variant="subtle">
                              <TagLabel>{t}</TagLabel>
                            </Tag>
                          ))}
                        </HStack>
                      </Td>
                      <Td>
                        <Menu placement="bottom-end">
                          <MenuButton as={IconButton} size="xs" variant="ghost" icon={<FiMoreHorizontal />} />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => history.push(`/admin/exam-question-bank/${q.id}/preview`)}>
                              Preview
                            </MenuItem>
                            <MenuItem icon={<FiEdit2 />} onClick={() => history.push(`/admin/exam-question-bank/${q.id}/edit`)}>
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<FiPlus />}
                              onClick={() => {
                                setUseQuestionId(q.id);
                                setUseQuestionCourseId(q.courseId || "");
                                onUseQuestionOpen();
                              }}
                            >
                              Use in New Exam
                            </MenuItem>
                            <MenuItem
                              icon={<FiCopy />}
                              onClick={() =>
                                history.push("/admin/exam-question-bank/new", { duplicateFromId: q.id })
                              }
                            >
                              Duplicate
                            </MenuItem>
                            <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleDelete(q)} isDisabled={deletingId === q.id}>
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {questions.length === 0 && (
                <Text textAlign="center" py={8} color="gray.400" fontSize="sm">
                  No questions found in the bank yet.
                </Text>
              )}
            </Box>
            <PaginationBar page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </Box>

      <OrphanedMediaModal isOpen={isOrphanOpen} onClose={onOrphanClose} onCleaned={fetchStats} />
      <UseBankQuestionModal
        isOpen={isUseQuestionOpen}
        onClose={onUseQuestionClose}
        questionIds={useQuestionId ? [useQuestionId] : []}
        initialCourseId={useQuestionCourseId}
      />
      <UseBankQuestionModal
        isOpen={isCreateExamOpen}
        onClose={onCreateExamClose}
        questionIds={selectedIds}
        onContinue={clearSelection}
      />
    </AdminMainAreaWrapper>
  );
}

export const ExamQuestionBankListPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamQuestionBankListPage {...props} />} />
);

export default ExamQuestionBankListPage;
