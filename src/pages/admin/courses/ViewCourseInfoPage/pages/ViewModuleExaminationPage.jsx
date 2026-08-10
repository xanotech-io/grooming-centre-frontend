import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Grid, Badge, BreadcrumbItem, Spinner, Progress } from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link, Text } from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { adminListModuleExaminations, getManualMarkingStudents } from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { FiEdit, FiUsers } from "react-icons/fi";

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

/* ─── Shared helpers ───────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <Box>
    <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>{label}</Text>
    <Text fontSize="text.level2">{value ?? "—"}</Text>
  </Box>
);

const BoolBadge = ({ value }) => (
  <Badge colorScheme={value ? "green" : "gray"} fontSize="xs">{value ? "Yes" : "No"}</Badge>
);

const SectionCard = ({ title, children }) => (
  <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" mb={5}>
    <Box bg="gray.50" px={5} py={3} borderBottom="1px solid" borderColor="gray.200">
      <Text fontWeight="600" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="wider">{title}</Text>
    </Box>
    <Box px={5} py={5}>{children}</Box>
  </Box>
);

const paperStatusColor = (s) => {
  if (s === "published") return "green";
  if (s === "draft") return "yellow";
  if (s === "finalized") return "blue";
  return "gray";
};

/* ─── Overview tab ─────────────────────────────────────── */
const OverviewTab = ({ examination }) => {
  const duration = getDuration(examination.duration);
  const sections = Array.isArray(examination.sections) ? examination.sections : [];

  return (
    <>
      <SectionCard title="Overview">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap={6}>
          <InfoRow label="Duration" value={duration.combinedText} />
          <InfoRow label="Number of Questions" value={examination.amountOfQuestions} />
          <InfoRow label="Start Time" value={dayjs(examination.startTime).format("DD/MM/YYYY h:mm a")} />
          <InfoRow label="Pass Threshold" value={examination.passThreshold ? `${examination.passThreshold}%` : null} />
          <InfoRow label="Total Marks" value={examination.totalMarks} />
          <InfoRow label="Navigation Mode" value={examination.navigationMode} />
          <InfoRow label="Created" value={dayjs(examination.createdAt).format("DD/MM/YYYY h:mm a")} />
          <InfoRow label="Last Updated" value={dayjs(examination.updatedAt).format("DD/MM/YYYY h:mm a")} />
        </Grid>
      </SectionCard>

      {sections.length > 0 && (
        <SectionCard title="Paper Sections">
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor="gray.200">
                  {["#", "Section Name", "Type", "Questions", "Marks/Question"].map((h) => (
                    <Box key={h} as="th" textAlign="left" py={2} pr={6} color="gray.500" fontWeight="600" textTransform="uppercase" fontSize="11px" letterSpacing="wider">{h}</Box>
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

      {examination.randomizationConfig && (
        <SectionCard title="Randomization">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Randomize question order</Text>
              <BoolBadge value={examination.randomizationConfig.question_order} />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Randomize option order</Text>
              <BoolBadge value={examination.randomizationConfig.option_order} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {examination.uiSettings && (
        <SectionCard title="UI Settings">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} gap={6}>
            <InfoRow label="Theme" value={examination.uiSettings.theme} />
            <InfoRow label="Font Size" value={examination.uiSettings.font_size ? `${examination.uiSettings.font_size}px` : null} />
            <InfoRow label="Font Family" value={examination.uiSettings.font_family} />
            <Flex direction="column">
              <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>Progress Indicator</Text>
              <BoolBadge value={examination.uiSettings.progress_indicator} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {examination.submissionSettings && (
        <SectionCard title="Submission Settings">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Confirmation dialog before submit</Text>
              <BoolBadge value={examination.submissionSettings.confirmation_dialog} />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Auto-submit on time expiry</Text>
              <BoolBadge value={examination.submissionSettings.auto_submit} />
            </Flex>
          </Grid>
        </SectionCard>
      )}
    </>
  );
};

/* ─── Questions tab ────────────────────────────────────── */
const QuestionsTab = ({ courseId, moduleId, examinationId }) => {
  const history = useHistory();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" py="60px" gap={4}>
      <Box
        w="56px" h="56px" bg="#F0E6FF" borderRadius="50%"
        display="flex" alignItems="center" justifyContent="center"
      >
        <FiEdit color="#6b006b" size={22} />
      </Box>
      <Box textAlign="center">
        <Text fontSize="16px" fontWeight="600" color="#1A202C" mb={1}>Manage Exam Questions</Text>
        <Text fontSize="14px" color="gray.500">
          Add, edit, and organise questions for this examination.
        </Text>
      </Box>
      <Button
        onClick={() =>
          history.push(
            // moduleId is required here — QuestionsPage.jsx's realExamKind()
            // reads it to tell "ModuleExam" apart from a plain course-level
            // "Exam", and without it every section-config cache lookup
            // misses, silently rendering as if the exam had no sections at
            // all (missing Section tabs, no section grouping).
            `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${examinationId}&moduleId=${moduleId}`
          )
        }
      >
        Go to Questions
      </Button>
    </Flex>
  );
};

/* ─── Grading tab ──────────────────────────────────────── */
const GradingTab = ({ examinationId }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getManualMarkingStudents(examinationId)
      .then(({ students: data }) => setStudents(data ?? []))
      .catch((err) => setError(err.message || "Failed to load grading queue"))
      .finally(() => setLoading(false));
  }, [examinationId]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;

  if (error) return (
    <Flex justifyContent="center" py="60px">
      <Text color="red.500">{error}</Text>
    </Flex>
  );

  if (!students.length) {
    return (
      <Flex direction="column" alignItems="center" justifyContent="center" py="60px" gap={3}>
        <Box w="56px" h="56px" bg="#F0FFF4" borderRadius="50%" display="flex" alignItems="center" justifyContent="center">
          <FiUsers color="#38A169" size={22} />
        </Box>
        <Text fontSize="16px" fontWeight="600" color="#1A202C">No pending grades</Text>
        <Text fontSize="14px" color="gray.500">All submitted answers have been graded, or no submissions yet.</Text>
      </Flex>
    );
  }

  const getGradingBadge = (graded, total) => {
    if (total === 0) return <Badge bg="#E2E8F0" color="gray.600" px="10px" py="4px" borderRadius="12px" fontWeight="500">No subjective Qs</Badge>;
    if (graded === total) return <Badge bg="#E6F4EA" color="#38A169" px="10px" py="4px" borderRadius="12px" fontWeight="500">Fully Graded</Badge>;
    if (graded > 0) return <Badge bg="#FFF5EA" color="#DD6B20" px="10px" py="4px" borderRadius="12px" fontWeight="500">In Progress</Badge>;
    return <Badge bg="#FED7D7" color="#E53E3E" px="10px" py="4px" borderRadius="12px" fontWeight="500">Pending</Badge>;
  };

  return (
    <Box>
      <Flex px={5} py={4} borderBottom="1px solid #E2E8F0" alignItems="center" justifyContent="space-between">
        <Text fontSize="14px" fontWeight="600" color="gray.700">
          Students Pending Manual Grading
        </Text>
        <Badge bg="#FFF3CD" color="#B7791F" px={3} py={1} borderRadius="full" fontSize="13px" fontWeight="600">
          {students.length} pending
        </Badge>
      </Flex>
      <Box overflowX="auto">
        <Box as="table" w="100%" fontSize="sm">
          <Box as="thead" bg="#F7FAFC">
            <Box as="tr">
              {["Student", "Email", "Attempt", "Submitted At", "Grading Progress", "Status", "Action"].map((h) => (
                <Box key={h} as="th" textAlign="left" py="14px" px={4} color="gray.500" fontSize="12px" fontWeight="600" textTransform="none" whiteSpace="nowrap">{h}</Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {students.map((s) => {
              const pct = s.totalSubjective > 0 ? Math.round((s.gradedCount / s.totalSubjective) * 100) : 0;
              return (
                <Box as="tr" key={s.submissionId} borderTop="1px solid #E2E8F0" _hover={{ bg: "#F9F0FF" }}>
                  <Box as="td" py="14px" px={4} fontSize="14px" fontWeight="500" color="#1A202C">
                    {s.student?.firstName} {s.student?.lastName}
                  </Box>
                  <Box as="td" py="14px" px={4} fontSize="13px" color="gray.500">{s.student?.email ?? "—"}</Box>
                  <Box as="td" py="14px" px={4} fontSize="13px" color="gray.500">Attempt {s.attemptNumber ?? 1}</Box>
                  <Box as="td" py="14px" px={4} fontSize="13px" color="gray.500" whiteSpace="nowrap">
                    {s.submissionTime ? new Date(s.submissionTime).toLocaleString() : "—"}
                  </Box>
                  <Box as="td" py="14px" px={4} minW="160px">
                    <Flex alignItems="center" gap={2}>
                      <Progress value={pct} size="sm" colorScheme="purple" borderRadius="4px" flex={1} />
                      <Text fontSize="12px" color="gray.500" whiteSpace="nowrap">
                        {s.gradedCount}/{s.totalSubjective}
                      </Text>
                    </Flex>
                  </Box>
                  <Box as="td" py="14px" px={4}>{getGradingBadge(s.gradedCount, s.totalSubjective)}</Box>
                  <Box as="td" py="14px" px={4}>
                    <Button
                      size="sm"
                      onClick={() =>
                        history.push(`/admin/manual-marking/${examinationId}/student/${s.student?.id}`)
                      }
                    >
                      {s.gradedCount > 0 ? "Continue" : "Grade"}
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
const ViewModuleExaminationPage = () => {
  const history = useHistory();
  const { courseId, moduleId, examinationId } = useParams();

  const [examination, setExamination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => {
    adminListModuleExaminations(moduleId)
      .then(({ examinations }) => {
        const found = examinations.find((e) => e.id === examinationId);
        if (found) setExamination(found);
        else setError("Examination not found.");
      })
      .catch(() => setError("Failed to load examination details."))
      .finally(() => setIsLoading(false));
  }, [moduleId, examinationId]);

  const fetchPendingCount = useCallback(async () => {
    try {
      const { students } = await getManualMarkingStudents(examinationId);
      setPendingCount(students?.length ?? 0);
    } catch {
      // silent — badge is best-effort
    }
  }, [examinationId]);

  useEffect(() => { fetchPendingCount(); }, [fetchPendingCount]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" paddingTop="100px">
        <Spinner />
      </Box>
    );
  }

  if (error || !examination) {
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
    { key: "grading", label: "Grading", count: pendingCount },
  ];

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={<BreadcrumbItem><Link href="/admin/courses">Courses</Link></BreadcrumbItem>}
        item3={<BreadcrumbItem><Link href={`/admin/courses/details/${courseId}/modules`}>Modules</Link></BreadcrumbItem>}
        item4={<BreadcrumbItem><Link href={`/admin/courses/${courseId}/module/${moduleId}/examinations`}>Examinations</Link></BreadcrumbItem>}
        item5={<BreadcrumbItem isCurrentPage><Link href="#">{examination.title}</Link></BreadcrumbItem>}
      />

      {/* ── Header ── */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        paddingBottom={5}
        marginBottom={0}
        flexWrap="wrap"
        gap={3}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3" mb={2}>{examination.title}</Heading>
          <Flex gap={2} flexWrap="wrap">
            <Badge colorScheme={examination.active ? "green" : "gray"} px={3} py={1} fontSize="xs">
              {examination.active ? "Active" : "Inactive"}
            </Badge>
            <Badge colorScheme={paperStatusColor(examination.paperStatus)} px={3} py={1} fontSize="xs" textTransform="capitalize">
              {examination.paperStatus || "—"}
            </Badge>
            {examination.markingMode && (
              <Badge colorScheme="purple" px={3} py={1} fontSize="xs" textTransform="capitalize">
                {examination.markingMode} marking
              </Badge>
            )}
          </Flex>
        </Box>

        <Flex gap="8px">
          <Button
            secondary
            size="sm"
            onClick={() => history.push(`/admin/exam-paper-config/${examinationId}?examType=examination`)}
          >
            Configure Paper
          </Button>
          <Button
            secondary
            size="sm"
            onClick={() => history.goBack()}
          >
            ← Back
          </Button>
        </Flex>
      </Flex>

      {/* ── Tab container ── */}
      <Box bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" mt={4} overflow="hidden">
        {/* Tab nav */}
        <Flex borderBottom="1px solid #E2E8F0" px={2} bg="white">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              count={tab.count}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </Flex>

        {/* Tab content */}
        <Box p={activeTab === "grading" ? 0 : 6}>
          {activeTab === "overview" && <OverviewTab examination={examination} />}
          {activeTab === "questions" && <QuestionsTab courseId={courseId} moduleId={moduleId} examinationId={examinationId} />}
          {activeTab === "grading" && <GradingTab examinationId={examinationId} />}
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ViewModuleExaminationPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ViewModuleExaminationPage {...props} />} />
  );
};

export default ViewModuleExaminationPageRoute;
