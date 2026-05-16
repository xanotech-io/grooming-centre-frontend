import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Grid, Spinner, Progress } from "@chakra-ui/react";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link, Text } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetStandaloneExamById,
  getSAExamSubmissions,
  getSAExamAllResults,
  getSAExamPendingGrades,
} from "../../../services";
import { getDuration } from "../../../utils";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";

/* ─── Tab bar ──────────────────────────────────────────── */
const Tab = ({ label, active, count, onClick }) => (
  <Box
    as="button"
    px="20px"
    py="12px"
    fontSize="14px"
    fontWeight={active ? "600" : "400"}
    color={active ? "#6b006b" : "gray.500"}
    borderBottom={active ? "2px solid #6b006b" : "2px solid transparent"}
    bg="transparent"
    cursor="pointer"
    onClick={onClick}
    _hover={{ color: "#6b006b" }}
    display="flex"
    alignItems="center"
    gap="6px"
    whiteSpace="nowrap"
  >
    {label}
    {count != null && (
      <Badge
        bg={active ? "#6b006b" : "#E2E8F0"}
        color={active ? "white" : "gray.600"}
        borderRadius="10px"
        px="7px"
        fontSize="10px"
        fontWeight="700"
      >
        {count}
      </Badge>
    )}
  </Box>
);

const InfoRow = ({ label, value }) => (
  <Box>
    <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>{label}</Text>
    <Text fontSize="text.level2">{value ?? "—"}</Text>
  </Box>
);

const SectionCard = ({ title, children }) => (
  <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" mb={5}>
    <Box bg="gray.50" px={5} py={3} borderBottom="1px solid" borderColor="gray.200">
      <Text fontWeight="600" fontSize="11px" color="gray.500" textTransform="uppercase" letterSpacing="wider">{title}</Text>
    </Box>
    <Box px={5} py={5}>{children}</Box>
  </Box>
);

/* ─── Overview tab ─────────────────────────────────────── */
const OverviewTab = ({ exam, examId }) => {
  const { push } = useHistory();
  const sections = Array.isArray(exam.sections) ? exam.sections : [];

  return (
    <>
      <Flex justifyContent="flex-end" mb={4}>
        <Button size="sm" onClick={() => push(`/admin/standalone-exams/overview?examination=${examId}`)}>
          Edit Examination
        </Button>
      </Flex>

      <SectionCard title="Examination Details">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap={6}>
          <InfoRow label="Duration" value={getDuration(exam.duration).combinedText} />
          <InfoRow label="Questions" value={exam.amountOfQuestions} />
          <InfoRow label="Start Time" value={dayjs(exam.startTime).format("DD/MM/YYYY h:mm a")} />
          <InfoRow label="Total Marks" value={exam.totalMarks} />
          <InfoRow label="Marking Mode" value={exam.markingMode} />
          <InfoRow label="Created" value={dayjs(exam.createdAt).format("DD/MM/YYYY h:mm a")} />
        </Grid>
      </SectionCard>

      {sections.length > 0 && (
        <SectionCard title="Sections">
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor="gray.200">
                  {["#", "Section Name", "Type", "Questions", "Marks/Question"].map((h) => (
                    <Box key={h} as="th" textAlign="left" py={2} pr={6} color="gray.500" fontWeight="600" fontSize="11px" textTransform="uppercase">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {sections.map((s, i) => (
                  <Box as="tr" key={i} borderBottom="1px solid" borderColor="gray.100">
                    <Box as="td" py={3} pr={6} color="gray.400">{i + 1}</Box>
                    <Box as="td" py={3} pr={6} fontWeight="500">{s.name}</Box>
                    <Box as="td" py={3} pr={6} textTransform="capitalize">{s.type ?? "—"}</Box>
                    <Box as="td" py={3} pr={6}>{s.questionCount ?? "—"}</Box>
                    <Box as="td" py={3} pr={6}>{s.marksPerQuestion ?? "—"}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </SectionCard>
      )}
    </>
  );
};

/* ─── Questions tab ────────────────────────────────────── */
const QuestionsTab = ({ examId }) => {
  const { push } = useHistory();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" py="60px" gap={4}>
      <Box w="56px" h="56px" bg="#F0E6FF" borderRadius="50%" display="flex" alignItems="center" justifyContent="center">
        <FiEdit color="#6b006b" size={22} />
      </Box>
      <Box textAlign="center">
        <Text fontSize="16px" fontWeight="600" color="#1A202C" mb={1}>Manage Questions</Text>
        <Text fontSize="14px" color="gray.500">Add, edit, and organise questions for this examination.</Text>
      </Box>
      <Button onClick={() => push(`/admin/standalone-exams/questions/?examination=${examId}`)}>
        Go to Questions
      </Button>
    </Flex>
  );
};

/* ─── Submissions tab ──────────────────────────────────── */
const SubmissionsTab = ({ examId }) => {
  const { push } = useHistory();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSAExamSubmissions(examId)
      .then(({ submissions: data }) => setSubmissions(data))
      .catch((err) => setError(err.message || "Failed to load submissions."))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (error) return <Flex justifyContent="center" py="60px"><Text color="red.500">{error}</Text></Flex>;
  if (!submissions.length) return (
    <Flex direction="column" alignItems="center" justifyContent="center" py="60px" gap={3}>
      <Text fontSize="16px" fontWeight="600" color="#1A202C">No submissions yet</Text>
      <Text fontSize="14px" color="gray.500">Students haven't submitted this exam yet.</Text>
    </Flex>
  );

  return (
    <Box>
      <Flex px={5} py={4} borderBottom="1px solid #E2E8F0" alignItems="center" justifyContent="space-between">
        <Text fontSize="14px" fontWeight="600" color="gray.700">Student Submissions</Text>
        <Badge bg="#E6F0FF" color="#2B6CB0" px={3} py={1} borderRadius="full" fontSize="13px" fontWeight="600">
          {submissions.length} submitted
        </Badge>
      </Flex>
      <Box overflowX="auto">
        <Box as="table" w="100%" fontSize="sm">
          <Box as="thead" bg="#F7FAFC">
            <Box as="tr">
              {["Student", "Email", "Submitted At", "Status", "Action"].map((h) => (
                <Box key={h} as="th" textAlign="left" py="14px" px={4} color="gray.500" fontSize="12px" fontWeight="600" whiteSpace="nowrap">{h}</Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {submissions.map((sub) => (
              <Box as="tr" key={sub.id} borderTop="1px solid #E2E8F0" _hover={{ bg: "#F9F0FF" }}>
                <Box as="td" py="14px" px={4} fontWeight="500" color="#1A202C">
                  {sub.student?.firstName} {sub.student?.lastName}
                </Box>
                <Box as="td" py="14px" px={4} fontSize="13px" color="gray.500">{sub.student?.email ?? "—"}</Box>
                <Box as="td" py="14px" px={4} fontSize="13px" color="gray.500" whiteSpace="nowrap">
                  {sub.submissionTime ? dayjs(sub.submissionTime).format("DD/MM/YYYY h:mm A") : "—"}
                </Box>
                <Box as="td" py="14px" px={4}>
                  <Badge
                    colorScheme={sub.status === "graded" ? "green" : sub.status === "in_progress" ? "orange" : "blue"}
                    fontSize="10px" textTransform="capitalize" px={2} py="2px" borderRadius="full"
                  >
                    {sub.status}
                  </Badge>
                </Box>
                <Box as="td" py="14px" px={4}>
                  <Button size="sm" onClick={() => push(`/admin/standalone-exams/grade/${examId}/student/${sub.studentId}`)}>
                    View
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Results tab ──────────────────────────────────────── */
const gradeColor = { A: "green", B: "teal", C: "blue", D: "orange", F: "red" };

const ResultsTab = ({ examId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSAExamAllResults(examId)
      .then(({ results: data }) => setResults(data))
      .catch((err) => setError(err.message || "Failed to load results."))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (error) return <Flex justifyContent="center" py="60px"><Text color="red.500">{error}</Text></Flex>;
  if (!results.length) return (
    <Flex direction="column" alignItems="center" justifyContent="center" py="60px" gap={3}>
      <Text fontSize="16px" fontWeight="600" color="#1A202C">No results yet</Text>
      <Text fontSize="14px" color="gray.500">Results appear after students submit and marking is complete.</Text>
    </Flex>
  );

  return (
    <Box>
      <Flex px={5} py={4} borderBottom="1px solid #E2E8F0" alignItems="center" justifyContent="space-between">
        <Text fontSize="14px" fontWeight="600" color="gray.700">Examination Results</Text>
        <Badge bg="#E6F0FF" color="#2B6CB0" px={3} py={1} borderRadius="full" fontSize="13px" fontWeight="600">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </Badge>
      </Flex>
      <Box overflowX="auto">
        <Box as="table" w="100%" fontSize="sm">
          <Box as="thead" bg="#F7FAFC">
            <Box as="tr">
              {["Student", "Auto Score", "Manual Score", "Total Score (%)", "Grade", "Correct", "Wrong", "Status"].map((h) => (
                <Box key={h} as="th" textAlign="left" py="14px" px={4} color="gray.500" fontSize="12px" fontWeight="600" whiteSpace="nowrap">{h}</Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {results.map((r) => (
              <Box as="tr" key={r.id} borderTop="1px solid #E2E8F0" _hover={{ bg: "#F9F0FF" }}>
                <Box as="td" py="14px" px={4} fontWeight="500" color="#1A202C">
                  {r.student?.firstName} {r.student?.lastName}
                </Box>
                <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600">{r.autoScore ?? "—"}</Box>
                <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600">{r.manualScore ?? "—"}</Box>
                <Box as="td" py="14px" px={4} fontSize="14px" fontWeight="600" color="#1A202C">
                  {r.totalScore != null ? `${r.totalScore}%` : "—"}
                </Box>
                <Box as="td" py="14px" px={4}>
                  {r.grade ? (
                    <Badge colorScheme={gradeColor[r.grade] || "gray"} fontSize="13px" fontWeight="700" px={3} py="2px" borderRadius="full">
                      {r.grade}
                    </Badge>
                  ) : "—"}
                </Box>
                <Box as="td" py="14px" px={4} fontSize="13px" color="green.600">{r.correctAnswers ?? "—"}</Box>
                <Box as="td" py="14px" px={4} fontSize="13px" color="red.500">{r.wrongAnswers ?? "—"}</Box>
                <Box as="td" py="14px" px={4}>
                  <Badge
                    colorScheme={r.status === "completed" ? "green" : r.status === "in_progress" ? "orange" : "gray"}
                    fontSize="10px" textTransform="capitalize" px={2} py="2px" borderRadius="full"
                  >
                    {r.status}
                  </Badge>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Manual Grading tab ───────────────────────────────── */
const GradingTab = ({ examId }) => {
  const { push } = useHistory();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSAExamPendingGrades(examId)
      .then(({ pending: data }) => setPending(data))
      .catch((err) => setError(err.message || "Failed to load grading queue."))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (error) return <Flex justifyContent="center" py="60px"><Text color="red.500">{error}</Text></Flex>;
  if (!pending.length) return (
    <Flex direction="column" alignItems="center" justifyContent="center" py="60px" gap={3}>
      <Text fontSize="16px" fontWeight="600" color="#1A202C">No pending grades</Text>
      <Text fontSize="14px" color="gray.500">All subjective questions have been graded, or no submissions yet.</Text>
    </Flex>
  );

  const getStatusBadge = (s) => {
    if (!s) return <Badge bg="#FED7D7" color="#E53E3E" px="10px" py="4px" borderRadius="12px" fontWeight="500">Pending</Badge>;
    if (s === "in_progress") return <Badge bg="#FFF5EA" color="#DD6B20" px="10px" py="4px" borderRadius="12px" fontWeight="500">In Progress</Badge>;
    return <Badge bg="#E6F4EA" color="#38A169" px="10px" py="4px" borderRadius="12px" fontWeight="500">Completed</Badge>;
  };

  return (
    <Box>
      <Flex px={5} py={4} borderBottom="1px solid #E2E8F0" alignItems="center" justifyContent="space-between">
        <Text fontSize="14px" fontWeight="600" color="gray.700">Submissions Awaiting Manual Grading</Text>
        <Badge bg="#FFF3CD" color="#B7791F" px={3} py={1} borderRadius="full" fontSize="13px" fontWeight="600">
          {pending.length} pending
        </Badge>
      </Flex>
      <Box overflowX="auto">
        <Box as="table" w="100%" fontSize="sm">
          <Box as="thead" bg="#F7FAFC">
            <Box as="tr">
              {["Student", "Email", "Submitted At", "Grading Progress", "Status", "Action"].map((h) => (
                <Box key={h} as="th" textAlign="left" py="14px" px={4} color="gray.500" fontSize="12px" fontWeight="600" whiteSpace="nowrap">{h}</Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {pending.map((s) => {
              const total = s.totalSubjective ?? 0;
              const graded = s.gradedCount ?? 0;
              const pct = total > 0 ? Math.round((graded / total) * 100) : 0;
              const studentId = s.student?.id ?? s.studentId;
              return (
                <Box as="tr" key={s.submissionId ?? studentId} borderTop="1px solid #E2E8F0" _hover={{ bg: "#F9F0FF" }}>
                  <Box as="td" py="14px" px={4} fontWeight="500" color="#1A202C">
                    {s.student?.firstName} {s.student?.lastName}
                  </Box>
                  <Box as="td" py="14px" px={4} fontSize="13px" color="gray.500">{s.student?.email ?? "—"}</Box>
                  <Box as="td" py="14px" px={4} fontSize="13px" color="gray.500" whiteSpace="nowrap">
                    {s.submissionTime ? dayjs(s.submissionTime).format("DD/MM/YYYY h:mm A") : "—"}
                  </Box>
                  <Box as="td" py="14px" px={4} minW="160px">
                    <Flex alignItems="center" gap={2}>
                      <Progress value={pct} size="sm" colorScheme="purple" borderRadius="4px" flex={1} />
                      <Text fontSize="12px" color="gray.500" whiteSpace="nowrap">{graded}/{total}</Text>
                    </Flex>
                  </Box>
                  <Box as="td" py="14px" px={4}>{getStatusBadge(s.gradingStatus)}</Box>
                  <Box as="td" py="14px" px={4}>
                    <Button size="sm" onClick={() => push(`/admin/standalone-exams/grade/${examId}/student/${studentId}`)}>
                      {graded > 0 ? "Continue" : "Grade"}
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Page ─────────────────────────────────────────────── */
const ViewStandaloneExamPage = () => {
  const history = useHistory();
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingCount, setPendingCount] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(null);

  useEffect(() => {
    adminGetStandaloneExamById(examId)
      .then(({ examination }) => setExam(examination))
      .catch(() => setError("Failed to load examination."))
      .finally(() => setIsLoading(false));
  }, [examId]);

  const fetchCounts = useCallback(async () => {
    try {
      const [{ pending }, { submissions }] = await Promise.all([
        getSAExamPendingGrades(examId),
        getSAExamSubmissions(examId),
      ]);
      setPendingCount(pending.length);
      setSubmissionCount(submissions.length);
    } catch {
      // silent
    }
  }, [examId]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  if (isLoading) return <Box display="flex" justifyContent="center" paddingTop="100px"><Spinner /></Box>;

  if (error || !exam) {
    return (
      <AdminMainAreaWrapper>
        <Box paddingY={10} paddingX={6}>
          <Text color="red.500">{error || "Examination not found."}</Text>
        </Box>
      </AdminMainAreaWrapper>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "questions", label: "Questions" },
    { key: "submissions", label: "Submissions", count: submissionCount },
    { key: "results", label: "Results" },
    { key: "grading", label: "Manual Grading", count: pendingCount },
  ];

  const paddedTabs = new Set(["submissions", "results", "grading"]);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={<BreadcrumbItem><Link href="/admin/standalone-exams">Standalone Exams</Link></BreadcrumbItem>}
        item3={<BreadcrumbItem isCurrentPage><Link href="#">{exam.title}</Link></BreadcrumbItem>}
      />

      <Flex justifyContent="space-between" alignItems="center" paddingBottom={5} marginBottom={0} flexWrap="wrap" gap={3}>
        <Box>
          <Heading as="h1" fontSize="heading.h3" mb={2}>{exam.title}</Heading>
          <Flex gap={2} flexWrap="wrap">
            <Badge colorScheme={exam.isPublished ? "green" : "gray"} px={3} py={1} fontSize="xs">
              {exam.isPublished ? "Published" : "Unpublished"}
            </Badge>
            {exam.markingMode && (
              <Badge colorScheme="purple" px={3} py={1} fontSize="xs" textTransform="capitalize">
                {exam.markingMode} marking
              </Badge>
            )}
          </Flex>
        </Box>
        <Button secondary size="sm" onClick={() => history.goBack()}>← Back</Button>
      </Flex>

      <Box bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" mt={4} overflow="hidden">
        <Flex borderBottom="1px solid #E2E8F0" px={2} bg="white" overflowX="auto">
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} active={activeTab === tab.key} count={tab.count} onClick={() => setActiveTab(tab.key)} />
          ))}
        </Flex>

        <Box p={paddedTabs.has(activeTab) ? 0 : 6}>
          {activeTab === "overview" && <OverviewTab exam={exam} examId={examId} />}
          {activeTab === "questions" && <QuestionsTab examId={examId} />}
          {activeTab === "submissions" && <SubmissionsTab examId={examId} />}
          {activeTab === "results" && <ResultsTab examId={examId} />}
          {activeTab === "grading" && <GradingTab examId={examId} />}
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ViewStandaloneExamPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ViewStandaloneExamPage {...props} />} />
);

export default ViewStandaloneExamPageRoute;
