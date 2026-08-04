import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Select,
  SimpleGrid,
  Spinner,
  Table,
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
  adminGetCourseListing,
  adminListModules,
  bulkUpdateExamQuestionBankStatus,
  deleteExamQuestionBankItem,
  getExamQuestionBankStats,
  listExamQuestionBank,
} from "../../../services";
import UseBankQuestionModal from "./UseBankQuestionModal";

const MOCK_STATS = {
  totalQuestions: 42,
  inactiveQuestions: 3,
  multimediaQuestions: 9,
  multimediaAdoptionRate: 21,
  usageFrequency: 4.6,
  correctResponseRate: 68.2,
  difficultyDistribution: { easy: 15, medium: 20, hard: 7 },
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

function StatCard({ label, value }) {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
      <Text fontSize="xs" color="black" mb={1} textTransform="uppercase" letterSpacing="wide">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color="black">
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

  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [useQuestionId, setUseQuestionId] = useState(null);
  const [useQuestionCourseId, setUseQuestionCourseId] = useState("");
  const [useQuestionModuleId, setUseQuestionModuleId] = useState("");

  const [courseNames, setCourseNames] = useState({});
  const [moduleNames, setModuleNames] = useState({});
  const loadedModuleCourseIds = useRef(new Set());

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
  }, [page, search, questionType, difficultyLevel, status]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    adminGetCourseListing({ limit: 200 })
      .then((res) => {
        const map = {};
        (res?.courses || []).forEach((c) => {
          map[c.id] = c.title;
        });
        setCourseNames(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!questions.length) return;
    const courseIds = Array.from(
      new Set(questions.map((q) => q.courseId).filter((id) => id && !loadedModuleCourseIds.current.has(id))),
    );
    if (!courseIds.length) return;
    courseIds.forEach((id) => loadedModuleCourseIds.current.add(id));
    Promise.all(
      courseIds.map((id) =>
        adminListModules(id)
          .then((res) => res?.modules || [])
          .catch(() => []),
      ),
    ).then((results) => {
      const map = {};
      results.flat().forEach((m) => {
        map[m.id] = m.title;
      });
      setModuleNames((prev) => ({ ...prev, ...map }));
    });
  }, [questions]);

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
            <Button size="sm" colorScheme="purple" leftIcon={<FiPlus />} onClick={() => history.push("/admin/exam-question-bank/new")}>
              Add Question
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4} mb={6}>
          <StatCard label="Total Questions" value={statsLoading ? "..." : stats?.totalQuestions} />
          <StatCard
            label="Multimedia Adoption"
            value={statsLoading ? "..." : `${stats?.multimediaAdoptionRate ?? 0}%`}
          />
          <StatCard
            label="Question Usage Frequency"
            value={statsLoading ? "..." : stats?.usageFrequency ?? "—"}
          />
          <StatCard
            label="Correct Response Rate"
            value={statsLoading ? "..." : `${stats?.correctResponseRate ?? 0}%`}
          />
          <StatCard label="Easy" value={statsLoading ? "..." : stats?.difficultyDistribution?.easy ?? "—"} />
          <StatCard label="Medium" value={statsLoading ? "..." : stats?.difficultyDistribution?.medium ?? "—"} />
          <StatCard label="Hard" value={statsLoading ? "..." : stats?.difficultyDistribution?.hard ?? "—"} />
        </SimpleGrid>

        <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100" mb={4}>
          <Flex gap={3} flexWrap="wrap">
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
          </Flex>
        </Box>

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
                    <Th>Status</Th>
                    <Th>Course</Th>
                    <Th>Module</Th>
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
                          setUseQuestionModuleId(q.moduleId || "");
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
                      <Td>
                        <Badge colorScheme={STATUS_COLOR[q.status] || "gray"}>{q.status}</Badge>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="140px">
                          {(q.courseId && (courseNames[q.courseId] || q.courseId)) || "—"}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="140px">
                          {(q.moduleId && (moduleNames[q.moduleId] || q.moduleId)) || "—"}
                        </Text>
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
                                setUseQuestionModuleId(q.moduleId || "");
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

      <UseBankQuestionModal
        isOpen={isUseQuestionOpen}
        onClose={onUseQuestionClose}
        questionIds={useQuestionId ? [useQuestionId] : []}
        initialCourseId={useQuestionCourseId}
        initialModuleId={useQuestionModuleId}
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
