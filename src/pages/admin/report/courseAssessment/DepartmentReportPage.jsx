import { useEffect, useState } from "react";
import { Route } from "react-router-dom";
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
  ExportMenu,
  Heading,
  Link,
  Spinner,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  supervisorGetDepartmentReport,
  supervisorEvaluateAssessment,
} from "../../../../services";
import dayjs from "dayjs";
import AssessmentTabBar from "./AssessmentTabBar";

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
// Evaluate Modal
// ---------------------------------------------------------------------------
const EvaluateModal = ({ isOpen, onClose, row, onSuccess }) => {
  const toast = useToast();
  const [difficultyLevel, setDifficultyLevel] = useState("Medium");
  const [effectivenessRating, setEffectivenessRating] = useState("Effective");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDifficultyLevel("Medium");
      setEffectivenessRating("Effective");
      setComments("");
    }
  }, [isOpen, row]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await supervisorEvaluateAssessment(row.assessmentId, {
        difficultyLevel,
        effectivenessRating,
        comments: comments.trim() || undefined,
      });
      toast({ status: "success", description: "Evaluation submitted successfully.", duration: 3000, isClosable: true });
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to submit evaluation";
      toast({ status: "error", description: message, duration: 4000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md" fontWeight="700">Evaluate Assessment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {row && (
            <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={3} mb={5}>
              <Text fontWeight="600" fontSize="sm">{row.assessmentTitle}</Text>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                {row.courseTitle} &nbsp;·&nbsp; {row.studentName}
              </Text>
            </Box>
          )}

          <Box mb={4}>
            <Text fontSize="sm" fontWeight="600" mb={1} color="gray.700">
              Difficulty Level <Text as="span" color="red.400">*</Text>
            </Text>
            <Select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} size="sm" borderRadius="md">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </Box>

          <Box mb={4}>
            <Text fontSize="sm" fontWeight="600" mb={1} color="gray.700">
              Effectiveness Rating <Text as="span" color="red.400">*</Text>
            </Text>
            <Select value={effectivenessRating} onChange={(e) => setEffectivenessRating(e.target.value)} size="sm" borderRadius="md">
              <option value="Effective">Effective</option>
              <option value="Ineffective">Ineffective</option>
              <option value="Needs Improvement">Needs Improvement</option>
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="600" mb={1} color="gray.700">Comments</Text>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional remarks about this assessment..."
              rows={3}
              resize="vertical"
              fontSize="sm"
            />
          </Box>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button secondary onClick={onClose} isDisabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={submitting}>Submit Evaluation</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
const DepartmentReportPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRow, setSelectedRow] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [grade, setGrade] = useState("");
  const [passFail, setPassFail] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [totalStudents, setTotalStudents] = useState(null);
  const [totalAssessments, setTotalAssessments] = useState(null);

  const fetchReport = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await supervisorGetDepartmentReport(params);
      const data = res?.data ?? {};
      setResults(data.results ?? data.assessments ?? []);
      setKpis(data.kpis ?? null);
      setTotalStudents(data.totalStudents ?? null);
      setTotalAssessments(data.totalAssessments ?? null);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Unable to fetch department report";
      setError(message);
      toast({ status: "error", description: message, duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchReport({}); }, []);

  const handleApply = () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (grade) params.grade = grade;
    if (passFail) params.passFail = passFail;
    fetchReport(params);
  };

  const handleClearFilters = () => {
    setStartDate(""); setEndDate(""); setGrade(""); setPassFail("");
    fetchReport({});
  };

  const hasActiveFilters = startDate || endDate || grade || passFail;

  const kpiAverage = kpis?.averageScore ?? kpis?.averageAssessmentScore ?? 0;
  const kpiDifficulty = kpis?.difficultyImpact ?? kpis?.questionDifficultyImpactAnalysis ?? "—";

  const csvRows = [
    ["Student", "Assessment", "Course", "Score", "Grade", "Result", "Date Taken"],
    ...results.map((item) => [
      item.studentName,
      item.assessmentTitle,
      item.courseTitle,
      item.score,
      item.grade,
      item.passFail,
      item.submittedAt ?? item.dateTaken
        ? dayjs(item.submittedAt ?? item.dateTaken).format("DD MMM YYYY")
        : "",
    ]),
  ];

  return (
    <AdminMainAreaWrapper>
      <Box my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/assessment/department">Assessment Reports</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Box borderBottom="1px" borderColor="accent.2" paddingBottom={5} marginBottom={0}>
        <Flex justifyContent="space-between" alignItems="flex-start" gap={4}>
          <Box>
            <Heading as="h1" fontSize="heading.h3">Assessment Reports</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Assessment performance data across courses, departments and the organisation.
            </Text>
          </Box>
          <ExportMenu
            rows={csvRows}
            filename="department-assessment-report"
            title="Assessment Reports"
            isDisabled={results.length === 0}
          />
        </Flex>
      </Box>

      <AssessmentTabBar />

      {/* Filters */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" p={5} mb={8} shadow="sm">
        <Text fontWeight="600" fontSize="sm" mb={4} color="gray.700">Filter Report</Text>
        <Flex gap={4} flexWrap="wrap" alignItems="flex-end">
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
            <Button onClick={handleApply} isLoading={loading}>Apply Filters</Button>
            {hasActiveFilters && <Button secondary onClick={handleClearFilters}>Clear</Button>}
          </Flex>
        </Flex>
      </Box>

      {/* Loading */}
      {loading && (
        <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">Loading department report...</Text>
        </Flex>
      )}

      {/* Error */}
      {!loading && error && (
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={6} textAlign="center">
          <Text color="red.600" mb={3}>{error}</Text>
          <Button onClick={handleApply}>Try Again</Button>
        </Box>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Summary totals */}
          {(totalStudents != null || totalAssessments != null) && (
            <Flex gap={4} mb={6} flexWrap="wrap">
              {totalStudents != null && (
                <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" p={6} shadow="sm" textAlign="center" flex="1">
                  <Text fontSize="3xl" fontWeight="800" color="#6B006B">{totalStudents.toLocaleString()}</Text>
                  <Text fontSize="sm" color="gray.500" mt={1} fontWeight="500">Total Students</Text>
                </Box>
              )}
              {totalAssessments != null && (
                <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" p={6} shadow="sm" textAlign="center" flex="1">
                  <Text fontSize="3xl" fontWeight="800" color="#1A5276">{totalAssessments.toLocaleString()}</Text>
                  <Text fontSize="sm" color="gray.500" mt={1} fontWeight="500">Total Assessments</Text>
                </Box>
              )}
            </Flex>
          )}

          {/* KPI Cards */}
          {kpis && (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
              <DashboardMetricCard title="Average Score" value={`${kpiAverage}%`} change="dept average" changeColor="#6B006B" />
              <DashboardMetricCard title="Highest Score" value={`${kpis.highestScore ?? 0}%`} change="top performer" changeColor="#1A8F3A" />
              <DashboardMetricCard title="Lowest Score" value={`${kpis.lowestScore ?? 0}%`} change="lowest recorded" changeColor="#C53030" />
              <DashboardMetricCard title="Pass Rate" value={`${kpis.passRate ?? 0}%`} change="of submissions" changeColor={(kpis.passRate ?? 0) >= 70 ? "#1A8F3A" : "#B7791F"} />
              <DashboardMetricCard title="Difficulty Impact" value={kpiDifficulty} change="question analysis" changeColor="#6B006B" />
            </SimpleGrid>
          )}

          {/* Table */}
          {results.length === 0 ? (
            <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={10} textAlign="center">
              <Text color="gray.400" fontSize="lg">No assessment data found for your department.</Text>
            </Box>
          ) : (
            <>
              <Text fontSize="sm" color="gray.500" fontWeight="500" mb={3}>
                {results.length} submission{results.length !== 1 ? "s" : ""} found
              </Text>
              <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" overflow="auto" shadow="sm">
                <Box as="table" width="100%" borderCollapse="collapse">
                  <Box as="thead" bg="gray.50" borderBottom="1px" borderColor="gray.200">
                    <Box as="tr">
                      <TH w="160px">Student</TH>
                      <TH w="210px">Assessment</TH>
                      <TH w="180px">Course</TH>
                      <TH w="90px">Score</TH>
                      <TH w="80px">Grade</TH>
                      <TH w="85px">Result</TH>
                      <TH w="115px">Date Taken</TH>
                      <TH w="120px">Action</TH>
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
                        <TD><Text fontWeight="600" fontSize="14px">{item.studentName ?? "—"}</Text></TD>
                        <TD>{item.assessmentTitle ?? "—"}</TD>
                        <TD><Text fontSize="13px" color="gray.600">{item.courseTitle ?? "—"}</Text></TD>
                        <TD>
                          <Text fontWeight="600" color={(item.score ?? 0) >= 70 ? "#1A8F3A" : (item.score ?? 0) >= 50 ? "#B7791F" : "#C53030"}>
                            {item.score ?? 0}%
                          </Text>
                        </TD>
                        <TD>
                          <Tag size="sm" borderRadius="full" colorScheme={gradeColorMap[item.grade] ?? "gray"}>{item.grade ?? "—"}</Tag>
                        </TD>
                        <TD>
                          <Tag size="sm" borderRadius="full" colorScheme={passFailColorMap[item.passFail] ?? "gray"}>{item.passFail ?? "—"}</Tag>
                        </TD>
                        <TD>
                          {item.submittedAt ?? item.dateTaken
                            ? dayjs(item.submittedAt ?? item.dateTaken).format("DD MMM YYYY")
                            : "—"}
                        </TD>
                        <TD>
                          <Button
                            size="sm"
                            onClick={() => { setSelectedRow(item); onOpen(); }}
                          >
                            Evaluate
                          </Button>
                        </TD>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </>
      )}

      <EvaluateModal
        isOpen={isOpen}
        onClose={onClose}
        row={selectedRow}
        onSuccess={() => fetchReport({})}
      />
    </AdminMainAreaWrapper>
  );
};

export const DepartmentReportPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <DepartmentReportPage {...props} />} />;
};

export default DepartmentReportPage;
