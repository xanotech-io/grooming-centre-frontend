import { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import AssessmentTabBar from "./AssessmentTabBar";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import {
  BreadcrumbItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Spinner,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  adminAddAssessmentFeedback,
  adminGetCourseAssessmentResults,
  adminListCoursesForReport,
} from "../../../../services";
import dayjs from "dayjs";

const passFailColorMap = { Pass: "green", Fail: "red" };
const gradeColorMap = { A: "green", B: "blue", C: "yellow", F: "red" };

const TH = ({ children, w }) => (
  <Box
    as="th"
    textAlign="left"
    px={4}
    py={3}
    fontSize="12px"
    fontWeight="600"
    color="gray.500"
    textTransform="uppercase"
    letterSpacing="0.05em"
    width={w}
    whiteSpace="nowrap"
  >
    {children}
  </Box>
);

const TD = ({ children }) => (
  <Box as="td" px={4} py={3} fontSize="14px" color="#101828" verticalAlign="middle">
    {children}
  </Box>
);

// ---------------------------------------------------------------------------
// Feedback Modal
// ---------------------------------------------------------------------------
const FeedbackModal = ({ isOpen, onClose, row, onSuccess }) => {
  const toast = useToast();
  const [feedback, setFeedback] = useState("");
  const [evaluatedBy, setEvaluatedBy] = useState("Instructor");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFeedback(row?.instructorFeedback && row.instructorFeedback !== "—"
        ? row.instructorFeedback
        : "");
      setEvaluatedBy("Instructor");
    }
  }, [isOpen, row]);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({ status: "warning", description: "Feedback is required.", duration: 3000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      await adminAddAssessmentFeedback(row.id, {
        instructorFeedback: feedback.trim(),
        evaluatedBy,
      });
      toast({ status: "success", description: "Feedback added successfully.", duration: 3000, isClosable: true });
      onSuccess(row.id, feedback.trim(), evaluatedBy);
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to add feedback";
      toast({ status: "error", description: message, duration: 4000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md" fontWeight="700">
          Add Instructor Feedback
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {row && (
            <Box
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={3}
              mb={4}
            >
              <Text fontWeight="600" fontSize="sm">{row.studentName}</Text>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                {row.assessmentTitle} &nbsp;·&nbsp; Score: {row.score}% &nbsp;·&nbsp;
                <Tag size="xs" borderRadius="full" colorScheme={passFailColorMap[row.passFail] ?? "gray"} ml={1}>
                  {row.passFail}
                </Tag>
              </Text>
            </Box>
          )}

          <Box mb={4}>
            <Text fontSize="sm" fontWeight="600" mb={1} color="gray.700">
              Feedback <Text as="span" color="red.400">*</Text>
            </Text>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback for this student..."
              rows={4}
              resize="vertical"
              fontSize="sm"
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="600" mb={1} color="gray.700">
              Evaluated By
            </Text>
            <Select
              value={evaluatedBy}
              onChange={(e) => setEvaluatedBy(e.target.value)}
              size="sm"
              borderRadius="md"
            >
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
            </Select>
          </Box>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button secondary onClick={onClose} isDisabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting}>
            Submit Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const CourseAssessmentResultsPage = () => {
  const toast = useToast();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRow, setSelectedRow] = useState(null);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [grade, setGrade] = useState("");
  const [passFail, setPassFail] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminListCoursesForReport()
      .then((res) => setCourses(res.rows ?? []))
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedCourseId) {
      toast({ status: "warning", description: "Please select a course first.", duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    setError(null);
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (grade) params.grade = grade;
    if (passFail) params.passFail = passFail;

    try {
      const res = await adminGetCourseAssessmentResults(selectedCourseId, params);
      const data = res?.data ?? {};
      setResults(data.results ?? data.assessments ?? []);
      setKpis(data.kpis ?? null);
      setCourseTitle(courses.find((c) => c.id === selectedCourseId)?.title ?? "");
      setHasGenerated(true);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Unable to fetch results";
      setError(message);
      toast({ status: "error", description: message, duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedCourseId("");
    setStartDate("");
    setEndDate("");
    setGrade("");
    setPassFail("");
    setResults([]);
    setKpis(null);
    setCourseTitle("");
    setHasGenerated(false);
    setError(null);
  };

  const openFeedbackModal = (row) => {
    setSelectedRow(row);
    onOpen();
  };

  const handleFeedbackSuccess = (rowId, newFeedback, newEvaluatedBy) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? { ...item, instructorFeedback: newFeedback, evaluatedBy: newEvaluatedBy }
          : item,
      ),
    );
  };

  const kpiAverageScore = kpis?.averageScore ?? kpis?.averageAssessmentScore ?? 0;
  const kpiDifficulty = kpis?.difficultyImpact ?? kpis?.questionDifficultyImpactAnalysis ?? "—";

  return (
    <AdminMainAreaWrapper>
      <Box my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/course-assessment">Assessment Reports</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Box
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={0}
      >
        <Heading as="h1" fontSize="heading.h3">Assessment Reports</Heading>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Assessment performance data across courses, departments and the organisation.
        </Text>
      </Box>

      <AssessmentTabBar />

      {/* Filter panel */}
      <Box
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="lg"
        p={5}
        mb={8}
        shadow="sm"
      >
        <Text fontWeight="600" fontSize="sm" mb={4} color="gray.700">
          Report Filters
        </Text>
        <Flex gap={4} flexWrap="wrap" alignItems="flex-end">
          <Box minW={{ base: "100%", md: "280px" }} flex="1">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">
              Course *
            </Text>
            <Select
              placeholder={coursesLoading ? "Loading courses..." : "Select a course"}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              isDisabled={coursesLoading}
              size="sm"
              borderRadius="md"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </Box>

          <Box minW="130px">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">Grade</Text>
            <Select placeholder="All grades" value={grade} onChange={(e) => setGrade(e.target.value)} size="sm" borderRadius="md">
              {["A", "B", "C", "F"].map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
          </Box>

          <Box minW="130px">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">Result</Text>
            <Select placeholder="All results" value={passFail} onChange={(e) => setPassFail(e.target.value)} size="sm" borderRadius="md">
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </Select>
          </Box>

          <Box minW="150px">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">From</Text>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              style={{ fontSize: "14px", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "6px 10px", width: "100%" }} />
          </Box>

          <Box minW="150px">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase">To</Text>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              style={{ fontSize: "14px", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "6px 10px", width: "100%" }} />
          </Box>

          <Flex gap={2} alignSelf="flex-end">
            <Button onClick={handleGenerate} isLoading={loading}>Generate Report</Button>
            {hasGenerated && <Button secondary onClick={handleClear}>Clear</Button>}
          </Flex>
        </Flex>
      </Box>

      {/* Loading */}
      {loading && (
        <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">Fetching assessment results...</Text>
        </Flex>
      )}

      {/* Error */}
      {!loading && error && (
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={6} textAlign="center">
          <Text color="red.600" mb={3}>{error}</Text>
          <Button onClick={handleGenerate}>Try Again</Button>
        </Box>
      )}

      {/* Results */}
      {!loading && !error && hasGenerated && (
        <>
          {courseTitle && (
            <Box mb={5}>
              <Heading as="h2" fontSize="heading.h4" color="#101828">{courseTitle}</Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {results.length} record{results.length !== 1 ? "s" : ""} found
              </Text>
            </Box>
          )}

          {kpis && (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
              <DashboardMetricCard title="Average Score" value={`${kpiAverageScore}%`} change="across all assessments" changeColor="#6B006B" />
              <DashboardMetricCard title="Highest Score" value={`${kpis.highestScore ?? 0}%`} change="top performer" changeColor="#1A8F3A" />
              <DashboardMetricCard title="Lowest Score" value={`${kpis.lowestScore ?? 0}%`} change="lowest recorded" changeColor="#C53030" />
              <DashboardMetricCard title="Pass Rate" value={`${kpis.passRate ?? 0}%`} change="of submissions" changeColor={(kpis.passRate ?? 0) >= 70 ? "#1A8F3A" : "#B7791F"} />
              <DashboardMetricCard title="Difficulty Impact" value={kpiDifficulty} change="question analysis" changeColor="#6B006B" />
            </SimpleGrid>
          )}

          {results.length === 0 ? (
            <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={10} textAlign="center">
              <Text color="gray.400" fontSize="lg">No assessment results found for this course.</Text>
              <Text as="p" fontSize="sm" color="gray.400" mt={1}>Try adjusting the filters or selecting a different course.</Text>
            </Box>
          ) : (
            <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" overflow="auto" shadow="sm">
              <Box as="table" width="100%" borderCollapse="collapse">
                <Box as="thead" bg="gray.50" borderBottom="1px" borderColor="gray.200">
                  <Box as="tr">
                    <TH w="150px">Student</TH>
                    <TH w="200px">Assessment</TH>
                    <TH w="90px">Score</TH>
                    <TH w="80px">Grade</TH>
                    <TH w="85px">Result</TH>
                    <TH w="115px">Date Taken</TH>
                    <TH w="95px">Duration</TH>
                    <TH w="180px">Feedback</TH>
                    <TH w="180px">Actions</TH>
                  </Box>
                </Box>
                <Box as="tbody">
                  {results.map((item, idx) => (
                    <Box
                      as="tr"
                      key={item.id ?? `${item.studentId}-${idx}`}
                      borderBottom="1px"
                      borderColor="gray.100"
                      _last={{ borderBottom: "none" }}
                      _hover={{ bg: "gray.50" }}
                    >
                      <TD>
                        <Text fontWeight="600" fontSize="14px">{item.studentName ?? "—"}</Text>
                      </TD>
                      <TD>{item.assessmentTitle ?? "—"}</TD>
                      <TD>
                        <Text fontWeight="600" color={(item.score ?? 0) >= 70 ? "#1A8F3A" : (item.score ?? 0) >= 50 ? "#B7791F" : "#C53030"}>
                          {item.score ?? 0}%
                        </Text>
                      </TD>
                      <TD>
                        <Tag size="sm" borderRadius="full" colorScheme={gradeColorMap[item.grade] ?? "gray"}>
                          {item.grade ?? "—"}
                        </Tag>
                      </TD>
                      <TD>
                        <Tag size="sm" borderRadius="full" colorScheme={passFailColorMap[item.passFail] ?? "gray"}>
                          {item.passFail ?? "—"}
                        </Tag>
                      </TD>
                      <TD>{item.submittedAt ? dayjs(item.submittedAt).format("DD MMM YYYY") : "—"}</TD>
                      <TD>{item.timeTakenMinutes != null ? `${item.timeTakenMinutes} min` : "—"}</TD>
                      <TD>
                        <Text color="gray.500" fontSize="13px" noOfLines={2}>
                          {item.instructorFeedback && item.instructorFeedback !== "—"
                            ? item.instructorFeedback
                            : <Text as="span" color="gray.300" fontStyle="italic">No feedback</Text>}
                        </Text>
                      </TD>
                      <TD>
                        <Flex gap={2} flexWrap="wrap">
                          <Button
                            size="sm"
                            onClick={() => openFeedbackModal(item)}
                          >
                            Add Feedback
                          </Button>
                          <Button
                            size="sm"
                            secondary
                            onClick={() =>
                              history.push(
                                `/admin/report/course-assessment/student/${item.studentId}`
                              )
                            }
                          >
                            View Student
                          </Button>
                        </Flex>
                      </TD>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Initial empty prompt */}
      {!loading && !error && !hasGenerated && (
        <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={12} textAlign="center">
          <Text color="gray.400" fontSize="lg">Select a course and click Generate Report to view results.</Text>
        </Box>
      )}

      {/* Feedback modal */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={onClose}
        row={selectedRow}
        onSuccess={handleFeedbackSuccess}
      />
    </AdminMainAreaWrapper>
  );
};

export const CourseAssessmentResultsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <CourseAssessmentResultsPage {...props} />} />;
};

export default CourseAssessmentResultsPage;
