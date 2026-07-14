import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Grid, Spinner, Select, Input } from "@chakra-ui/react";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link, Text } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetStandaloneExamById,
  getSAExamGradingSummary,
} from "../../../services";
import { getDuration } from "../../../utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useQueryParams } from "../../../hooks";

const VALID_TABS = new Set(["overview", "questions", "submissions"]);

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
const SubmissionStatCard = ({ label, value }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" px={5} py={4}>
    <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb={1}>
      {label}
    </Text>
    <Text fontSize="22px" fontWeight="800" color="#1A202C" lineHeight="1">
      {value ?? "—"}
    </Text>
  </Box>
);

const submissionStatusColor = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "graded") return { bg: "#E6F4EA", color: "#38A169" };
  if (v === "pending") return { bg: "#FFF3CD", color: "#B7791F" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const submissionPassFailColor = (v) => {
  if (v === "Pass") return { bg: "#E6F4EA", color: "#38A169" };
  if (v === "Fail") return { bg: "#FED7D7", color: "#E53E3E" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const SUBMISSIONS_EMPTY_FILTERS = {
  studentId: "",
  status: "",
  passFail: "",
  startDate: "",
  endDate: "",
};

const SubmissionsTab = ({ examId }) => {
  const { push } = useHistory();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState(SUBMISSIONS_EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(SUBMISSIONS_EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = Object.fromEntries(
      Object.entries(appliedFilters).filter(([, v]) => v),
    );

    getSAExamGradingSummary(examId, params)
      .then(({ overview: ov, rows: data }) => {
        if (cancelled) return;
        setOverview(ov);
        setRows(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load submissions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examId, appliedFilters]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (error) return <Flex justifyContent="center" py="60px"><Text color="red.500">{error}</Text></Flex>;

  return (
    <Box>
      {overview && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} px={5} pt={5}>
          <SubmissionStatCard label="Total Submissions" value={overview.totalSubmissions ?? 0} />
          <SubmissionStatCard label="Pending" value={overview.totalPending ?? 0} />
          <SubmissionStatCard label="Graded" value={overview.totalGraded ?? 0} />
          <SubmissionStatCard
            label="Avg Grading Time"
            value={overview.avgGradingDurationHours != null ? `${overview.avgGradingDurationHours}h` : "—"}
          />
        </Grid>
      )}

      <Flex gap={3} flexWrap="wrap" alignItems="flex-end" px={5} pt={5}>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Student ID</Text>
          <Input
            size="sm"
            placeholder="Student ID"
            value={filters.studentId}
            onChange={(e) => setFilters((f) => ({ ...f, studentId: e.target.value }))}
            w="160px"
          />
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Status</Text>
          <Select
            size="sm"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            w="130px"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
          </Select>
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Pass/Fail</Text>
          <Select
            size="sm"
            value={filters.passFail}
            onChange={(e) => setFilters((f) => ({ ...f, passFail: e.target.value }))}
            w="130px"
          >
            <option value="">All</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </Select>
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Start Date</Text>
          <Input
            size="sm"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            w="145px"
          />
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>End Date</Text>
          <Input
            size="sm"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            w="145px"
          />
        </Box>
        <Button size="sm" onClick={() => setAppliedFilters(filters)}>Apply Filters</Button>
        <Button
          size="sm"
          secondary
          onClick={() => {
            setFilters(SUBMISSIONS_EMPTY_FILTERS);
            setAppliedFilters(SUBMISSIONS_EMPTY_FILTERS);
          }}
        >
          Reset
        </Button>
      </Flex>

      {rows.length === 0 ? (
        <Flex direction="column" alignItems="center" justifyContent="center" py="60px" gap={3}>
          <Text fontSize="16px" fontWeight="600" color="#1A202C">No submissions match these filters</Text>
          <Text fontSize="14px" color="gray.500">Students haven't submitted this exam yet.</Text>
        </Flex>
      ) : (
        <Box overflowX="auto" mt={5}>
          <Box as="table" w="100%" fontSize="sm">
            <Box as="thead" bg="#F7FAFC">
              <Box as="tr">
                {["Student", "Submitted At", "Status", "Score", "Grade", "Pass/Fail", "Remarks", "Grading Duration", "Date Graded", "Action"].map((h) => (
                  <Box key={h} as="th" textAlign="left" py="14px" px={4} color="gray.500" fontSize="12px" fontWeight="600" whiteSpace="nowrap">{h}</Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {rows.map((row, i) => {
                const sc = submissionStatusColor(row.status);
                const pfc = submissionPassFailColor(row.passFail);
                return (
                  <Box
                    as="tr"
                    key={row.studentId || i}
                    borderTop="1px solid #E2E8F0"
                    cursor="pointer"
                    _hover={{ bg: "#F9F0FF" }}
                    onClick={() => push(`/admin/standalone-exams/grade/${examId}/student/${row.studentId}`)}
                  >
                    <Box as="td" py="14px" px={4}>
                      <Text fontSize="13px" fontWeight="600" color="#1A202C">{row.studentName || "—"}</Text>
                      <Text fontSize="11px" color="gray.400">{row.studentEmail || "—"}</Text>
                    </Box>
                    <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600" whiteSpace="nowrap">
                      {row.submissionDate ? dayjs(row.submissionDate).format("DD/MM/YY h:mm a") : "—"}
                    </Box>
                    <Box as="td" py="14px" px={4}>
                      <Badge bg={sc.bg} color={sc.color} px={2} py="2px" borderRadius="8px" fontSize="11px" fontWeight="600" textTransform="capitalize">
                        {row.status || "—"}
                      </Badge>
                    </Box>
                    <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600">{row.score ?? "—"}</Box>
                    <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600">{row.grade || "—"}</Box>
                    <Box as="td" py="14px" px={4}>
                      {row.passFail ? (
                        <Badge bg={pfc.bg} color={pfc.color} px={2} py="2px" borderRadius="8px" fontSize="11px" fontWeight="600">
                          {row.passFail}
                        </Badge>
                      ) : "—"}
                    </Box>
                    <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600" maxW="180px" isTruncated>
                      {row.remarks || "—"}
                    </Box>
                    <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600" whiteSpace="nowrap">
                      {row.gradingDurationHours != null ? `${row.gradingDurationHours}h` : "—"}
                    </Box>
                    <Box as="td" py="14px" px={4} fontSize="13px" color="gray.600" whiteSpace="nowrap">
                      {row.dateGraded ? dayjs(row.dateGraded).format("DD/MM/YY h:mm a") : "—"}
                    </Box>
                    <Box as="td" py="14px" px={4}>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          push(`/admin/standalone-exams/grade/${examId}/student/${row.studentId}`);
                        }}
                      >
                        Grade
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

/* ─── Page ─────────────────────────────────────────────── */
const ViewStandaloneExamPage = () => {
  const history = useHistory();
  const { examId } = useParams();
  const requestedTab = useQueryParams().get("tab");

  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(
    VALID_TABS.has(requestedTab) ? requestedTab : "overview",
  );
  const [submissionCount, setSubmissionCount] = useState(null);

  useEffect(() => {
    adminGetStandaloneExamById(examId)
      .then(({ examination }) => setExam(examination))
      .catch(() => setError("Failed to load examination."))
      .finally(() => setIsLoading(false));
  }, [examId]);

  useEffect(() => {
    getSAExamGradingSummary(examId)
      .then(({ overview }) => setSubmissionCount(overview?.totalSubmissions ?? 0))
      .catch(() => {});
  }, [examId]);

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
    { key: "submissions", label: "Grading", count: submissionCount },
  ];

  const paddedTabs = new Set(["submissions"]);

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
        <Flex gap="8px">
          <Button secondary size="sm" onClick={() => history.goBack()}>← Back</Button>
        </Flex>
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
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ViewStandaloneExamPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ViewStandaloneExamPage {...props} />} />
);

export default ViewStandaloneExamPageRoute;
