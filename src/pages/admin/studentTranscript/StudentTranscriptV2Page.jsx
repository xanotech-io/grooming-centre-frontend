import React, { useState, useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Spinner,
  Tooltip,
  Divider,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { FiRefreshCw, FiEye, FiCheck, FiRotateCcw, FiUpload, FiSearch } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  listTranscriptRequests,
  getTranscript,
  reviewTranscript,
  postExamCompletion,
  getDepartmentTranscriptAnalytics,
} from "../../../services";

const MOCK_TRANSCRIPTS = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    student: { id: "uuid-s1", firstName: "Amina", lastName: "Yusuf", email: "amina.yusuf@example.com" },
    transcriptType: "Official",
    status: "Pending Review",
    requestDate: "2026-05-21T09:00:00.000Z",
    issuedAt: null,
    issuanceReference: null,
    reviewRemarks: null,
    courseRecords: [
      {
        id: "rec-001",
        course: { id: "c1", title: "Microfinance Basics" },
        instructor: { id: "i1", firstName: "John", lastName: "Doe" },
        attemptDate: "2026-05-21T09:00:00.000Z",
        completionDate: "2026-03-10T14:00:00.000Z",
        score: 85.0,
        grade: "A",
        certificateIssued: true,
        remarks: "Result verified and approved",
      },
      {
        id: "rec-002",
        course: { id: "c2", title: "Data Privacy Awareness" },
        instructor: { id: "i1", firstName: "John", lastName: "Doe" },
        attemptDate: "2026-05-21T09:00:00.000Z",
        completionDate: "2026-04-05T11:00:00.000Z",
        score: 78.0,
        grade: "B",
        certificateIssued: false,
        remarks: null,
      },
    ],
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    student: { id: "uuid-s2", firstName: "Tunde", lastName: "Okafor", email: "tunde.okafor@example.com" },
    transcriptType: "Unofficial",
    status: "Issued",
    requestDate: "2026-05-18T08:00:00.000Z",
    issuedAt: "2026-05-18T08:00:05.000Z",
    issuanceReference: null,
    reviewRemarks: null,
    courseRecords: [
      {
        id: "rec-003",
        course: { id: "c1", title: "Microfinance Basics" },
        instructor: { id: "i2", firstName: "Kemi", lastName: "Abens" },
        attemptDate: "2026-05-18T08:00:00.000Z",
        completionDate: "2026-03-20T10:00:00.000Z",
        score: 91.0,
        grade: "A",
        certificateIssued: true,
        remarks: null,
      },
    ],
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    student: { id: "uuid-s3", firstName: "Ngozi", lastName: "Eze", email: "ngozi.eze@example.com" },
    transcriptType: "Official",
    status: "Issued",
    requestDate: "2026-05-10T10:00:00.000Z",
    issuedAt: "2026-05-12T11:00:00.000Z",
    issuanceReference: "ISS-2026-4F3A9B",
    reviewRemarks: "All records verified",
    courseRecords: [
      {
        id: "rec-004",
        course: { id: "c3", title: "Business Analytics" },
        instructor: { id: "i1", firstName: "John", lastName: "Doe" },
        attemptDate: "2026-05-10T10:00:00.000Z",
        completionDate: "2026-04-01T14:00:00.000Z",
        score: 74.0,
        grade: "B",
        certificateIssued: true,
        remarks: null,
      },
    ],
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    student: { id: "uuid-s4", firstName: "Emeka", lastName: "Obi", email: "emeka.obi@example.com" },
    transcriptType: "Official",
    status: "Returned",
    requestDate: "2026-05-08T09:00:00.000Z",
    issuedAt: null,
    issuanceReference: null,
    reviewRemarks: "Score for Business Analytics appears incorrect — please re-check exam result.",
    courseRecords: [
      {
        id: "rec-005",
        course: { id: "c3", title: "Business Analytics" },
        instructor: { id: "i2", firstName: "Kemi", lastName: "Abens" },
        attemptDate: "2026-05-08T09:00:00.000Z",
        completionDate: null,
        score: null,
        grade: null,
        certificateIssued: false,
        remarks: "Manual grading in progress",
      },
    ],
  },
];

const MOCK_SUMMARY = {
  totalCoursesEnrolled: 2,
  totalCoursesCompleted: 2,
  courseCompletionRate: 100.0,
  weightedAverageScore: 81.5,
  gpa: 3.5,
  certificatesIssued: 1,
  certificationRatio: 50.0,
};

const MOCK_DEPT_ANALYTICS = {
  departmentId: "uuid-dept-1",
  departmentName: "Microfinance Department",
  departmentPerformance: {
    totalStudents: 250,
    completedTranscripts: 210,
    averageExamScore: 76.5,
    passRate: 84.0,
    failedRate: 16.0,
  },
  transcriptActivity: {
    weeklyTranscriptUpdates: 45,
    monthlyTranscriptUpdates: 180,
    transcriptDiscrepancies: 3,
  },
  studentTranscripts: [
    { transcriptId: "a1b2c3d4", studentId: "uuid-s1", examType: "course", completionStatus: "Passed" },
    { transcriptId: "b2c3d4e5", studentId: "uuid-s2", examType: "standalone", completionStatus: "Completed" },
    { transcriptId: "c3d4e5f6", studentId: "uuid-s3", examType: "course", completionStatus: "Passed" },
    { transcriptId: "d4e5f6a7", studentId: "uuid-s4", examType: "course", completionStatus: "Failed" },
  ],
};

const STATUS_COLORS = {
  "Pending Review": "orange",
  Issued: "green",
  Returned: "red",
  Draft: "gray",
  Approved: "teal",
};

const COMPLETION_STATUSES = ["Completed", "Passed", "Failed", "Pending"];

function KpiCard({ label, value, color }) {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
      <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wide">{label}</Text>
      <Text fontSize="2xl" fontWeight="bold" color={color || "gray.800"}>{value ?? "—"}</Text>
    </Box>
  );
}

function PaginationBar({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <Flex justify="center" align="center" gap={2} mt={4}>
      <Button size="sm" onClick={() => onPage(page - 1)} isDisabled={page <= 1} variant="outline">Prev</Button>
      <Text fontSize="sm" color="gray.600">{page} / {totalPages}</Text>
      <Button size="sm" onClick={() => onPage(page + 1)} isDisabled={page >= totalPages} variant="outline">Next</Button>
    </Flex>
  );
}

function TranscriptDetailDrawer({ isOpen, onClose, transcriptId, onReviewed }) {
  const toast = useToast();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const { isOpen: isPostOpen, onOpen: onPostOpen, onClose: onPostClose } = useDisclosure();

  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("Approved");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const [postRecord, setPostRecord] = useState(null);
  const [examId, setExamId] = useState("");
  const [completionStatus, setCompletionStatus] = useState("Passed");
  const [postRemarks, setPostRemarks] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!transcriptId || !isOpen) return;
    setLoading(true);
    getTranscript(transcriptId)
      .then((res) => {
        const payload = res?.data || res;
        setTranscript(payload?.transcript || payload);
        setSummary(payload?.summary || MOCK_SUMMARY);
      })
      .catch(() => {
        const mock = MOCK_TRANSCRIPTS.find((t) => t.id === transcriptId) || MOCK_TRANSCRIPTS[0];
        setTranscript(mock);
        setSummary(MOCK_SUMMARY);
      })
      .finally(() => setLoading(false));
  }, [transcriptId, isOpen]);

  const handleReview = async () => {
    setReviewing(true);
    try {
      await reviewTranscript(transcriptId, { decision, reviewRemarks: reviewRemarks || null });
      toast({ title: decision === "Approved" ? "Transcript approved and issued" : "Transcript returned for correction", status: "success", duration: 3000 });
      onReviewed();
      onReviewClose();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Review failed";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally {
      setReviewing(false);
    }
  };

  const openPost = (record) => {
    setPostRecord(record);
    setExamId("");
    setCompletionStatus("Passed");
    setPostRemarks("");
    onPostOpen();
  };

  const handlePostCompletion = async () => {
    if (!examId.trim()) {
      toast({ title: "Exam ID is required", status: "warning", duration: 3000 });
      return;
    }
    setPosting(true);
    try {
      await postExamCompletion(postRecord.id, {
        examId: examId.trim(),
        completionStatus,
        remarks: postRemarks || null,
      });
      toast({ title: "Exam completion posted to transcript", status: "success", duration: 3000 });
      onPostClose();
      // refresh transcript
      const res = await getTranscript(transcriptId);
      const payload = res?.data || res;
      setTranscript(payload?.transcript || payload);
      setSummary(payload?.summary || summary);
    } catch (err) {
      const msg = err?.response?.data?.message || "Post failed";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally {
      setPosting(false);
    }
  };

  const canReview = transcript?.status === "Pending Review" && transcript?.transcriptType === "Official";

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center" gap={2} flexWrap="wrap">
              <Text>Transcript Detail</Text>
              {transcript && (
                <>
                  <Badge colorScheme={STATUS_COLORS[transcript.status]}>{transcript.status}</Badge>
                  <Badge variant="outline" colorScheme={transcript.transcriptType === "Official" ? "blue" : "gray"}>
                    {transcript.transcriptType}
                  </Badge>
                </>
              )}
            </Flex>
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody py={4}>
            {loading ? (
              <Flex justify="center" py={10}><Spinner /></Flex>
            ) : transcript ? (
              <VStack spacing={5} align="stretch">
                <SimpleGrid columns={2} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Student</Text>
                    <Text fontWeight="medium">{transcript.student?.firstName} {transcript.student?.lastName}</Text>
                    <Text fontSize="xs" color="gray.400">{transcript.student?.email}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Request Date</Text>
                    <Text fontSize="sm">{transcript.requestDate ? new Date(transcript.requestDate).toLocaleDateString() : "—"}</Text>
                  </Box>
                  {transcript.issuanceReference && (
                    <Box>
                      <Text fontSize="xs" color="gray.500">Issuance Reference</Text>
                      <Text fontFamily="mono" fontWeight="medium" color="green.700">{transcript.issuanceReference}</Text>
                    </Box>
                  )}
                  {transcript.issuedAt && (
                    <Box>
                      <Text fontSize="xs" color="gray.500">Issued At</Text>
                      <Text fontSize="sm">{new Date(transcript.issuedAt).toLocaleString()}</Text>
                    </Box>
                  )}
                  {transcript.reviewRemarks && (
                    <Box gridColumn="1 / -1">
                      <Text fontSize="xs" color="gray.500">Review Remarks</Text>
                      <Text fontSize="sm" color={transcript.status === "Returned" ? "red.600" : "gray.700"}>
                        {transcript.reviewRemarks}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>

                {summary && (
                  <>
                    <Divider />
                    <Text fontSize="sm" fontWeight="semibold">Summary Metrics</Text>
                    <SimpleGrid columns={3} spacing={3}>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">GPA</StatLabel>
                        <StatNumber fontSize="lg" color="blue.700">{summary.gpa ?? "—"}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Avg Score</StatLabel>
                        <StatNumber fontSize="lg">{summary.weightedAverageScore != null ? `${summary.weightedAverageScore}%` : "—"}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Completion Rate</StatLabel>
                        <StatNumber fontSize="lg">{summary.courseCompletionRate != null ? `${summary.courseCompletionRate}%` : "—"}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Courses Enrolled</StatLabel>
                        <StatNumber fontSize="lg">{summary.totalCoursesEnrolled ?? "—"}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Completed</StatLabel>
                        <StatNumber fontSize="lg">{summary.totalCoursesCompleted ?? "—"}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Certs Issued</StatLabel>
                        <StatNumber fontSize="lg">{summary.certificatesIssued ?? "—"}</StatNumber>
                        <StatHelpText fontSize="xs">{summary.certificationRatio != null ? `${summary.certificationRatio}%` : ""}</StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  </>
                )}

                <Divider />
                <Text fontSize="sm" fontWeight="semibold">Course Records</Text>
                <Box overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Course</Th>
                        <Th>Instructor</Th>
                        <Th>Score</Th>
                        <Th>Grade</Th>
                        <Th>Cert</Th>
                        <Th>Completion</Th>
                        <Th>Remarks</Th>
                        <Th>Post</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(transcript.courseRecords || []).map((rec) => (
                        <Tr key={rec.id} _hover={{ bg: "gray.50" }}>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium">{rec.course?.title || "—"}</Text>
                          </Td>
                          <Td fontSize="xs" color="gray.600">
                            {rec.instructor ? `${rec.instructor.firstName} ${rec.instructor.lastName}` : "—"}
                          </Td>
                          <Td fontWeight="medium" color={rec.score != null ? "blue.700" : "gray.400"}>
                            {rec.score != null ? `${rec.score}%` : "—"}
                          </Td>
                          <Td>
                            <Badge colorScheme={rec.grade === "A" ? "green" : rec.grade === "B" ? "blue" : rec.grade ? "yellow" : "gray"}>
                              {rec.grade || "—"}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={rec.certificateIssued ? "green" : "gray"} variant="subtle">
                              {rec.certificateIssued ? "Yes" : "No"}
                            </Badge>
                          </Td>
                          <Td fontSize="xs" color="gray.500">
                            {rec.completionDate ? new Date(rec.completionDate).toLocaleDateString() : "—"}
                          </Td>
                          <Td maxW="140px">
                            <Text fontSize="xs" color="gray.600" isTruncated title={rec.remarks}>{rec.remarks || "—"}</Text>
                          </Td>
                          <Td>
                            {transcript.status !== "Issued" && (
                              <Tooltip label="Post exam completion">
                                <IconButton
                                  size="xs"
                                  colorScheme="purple"
                                  variant="ghost"
                                  icon={<FiUpload />}
                                  onClick={() => openPost(rec)}
                                />
                              </Tooltip>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {(transcript.courseRecords || []).length === 0 && (
                    <Text textAlign="center" py={4} color="gray.400" fontSize="sm">No course records</Text>
                  )}
                </Box>

                {canReview && (
                  <>
                    <Divider />
                    <HStack>
                      <Button size="sm" colorScheme="green" leftIcon={<FiCheck />} onClick={() => { setDecision("Approved"); setReviewRemarks(""); onReviewOpen(); }}>
                        Approve & Issue
                      </Button>
                      <Button size="sm" colorScheme="red" variant="outline" leftIcon={<FiRotateCcw />} onClick={() => { setDecision("Returned"); setReviewRemarks(""); onReviewOpen(); }}>
                        Return for Correction
                      </Button>
                    </HStack>
                  </>
                )}
              </VStack>
            ) : (
              <Text color="gray.400" textAlign="center" py={8}>Could not load transcript</Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{decision === "Approved" ? "Approve Transcript" : "Return for Correction"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Decision</FormLabel>
                <Select size="sm" value={decision} onChange={(e) => setDecision(e.target.value)}>
                  <option value="Approved">Approve & Issue</option>
                  <option value="Returned">Return for Correction</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">
                  Review Remarks {decision === "Returned" ? "(recommended)" : "(optional)"}
                </FormLabel>
                <Textarea
                  size="sm"
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder={decision === "Approved" ? "e.g. All records verified and accurate" : "Explain what needs correction..."}
                />
              </FormControl>
              {decision === "Approved" && (
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontSize="xs" color="green.700">
                    Approving will lock this transcript, record an issuance timestamp, and generate a unique issuance reference. This action cannot be undone.
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button size="sm" variant="ghost" onClick={onReviewClose}>Cancel</Button>
            <Button size="sm" colorScheme={decision === "Approved" ? "green" : "red"} onClick={handleReview} isLoading={reviewing}>
              {decision === "Approved" ? "Approve & Issue" : "Return"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Post Completion Modal */}
      <Modal isOpen={isPostOpen} onClose={onPostClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Post Exam Completion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {postRecord && (
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="xs" color="gray.500">Course Record</Text>
                  <Text fontSize="sm" fontWeight="medium">{postRecord.course?.title}</Text>
                  <Text fontSize="xs" color="gray.500">Record ID: <Text as="span" fontFamily="mono">{postRecord.id}</Text></Text>
                </Box>
              )}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Exam ID</FormLabel>
                <Input size="sm" value={examId} onChange={(e) => setExamId(e.target.value)} placeholder="uuid of the exam" fontFamily="mono" />
                <FormHelperText fontSize="xs">The system determines exam type (Course or Standalone) from this ID and applies display rules automatically.</FormHelperText>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Completion Status</FormLabel>
                <Select size="sm" value={completionStatus} onChange={(e) => setCompletionStatus(e.target.value)}>
                  {COMPLETION_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Remarks (optional)</FormLabel>
                <Textarea size="sm" rows={2} value={postRemarks} onChange={(e) => setPostRemarks(e.target.value)} placeholder="e.g. Final course assessment — result verified and approved" />
              </FormControl>
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>Exam Type Display Rules</Text>
                <Text fontSize="xs" color="gray.500">• Course Exam: questions + answers shown (all marked correct), score visible</Text>
                <Text fontSize="xs" color="gray.500">• Standalone Exam: questions only, answers hidden, score set to N/A</Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button size="sm" variant="ghost" onClick={onPostClose}>Cancel</Button>
            <Button size="sm" colorScheme="purple" onClick={handlePostCompletion} isLoading={posting} leftIcon={<FiUpload />}>
              Post Completion
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function DepartmentAnalyticsPanel() {
  const toast = useToast();
  const [deptId, setDeptId] = useState("");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const handleFetch = async () => {
    if (!deptId.trim()) {
      toast({ title: "Department ID is required", status: "warning", duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await getDepartmentTranscriptAnalytics(deptId.trim());
      setAnalytics(res?.data || res);
    } catch {
      toast({ title: "API failed — showing mock data", status: "warning", duration: 3000 });
      setAnalytics(MOCK_DEPT_ANALYTICS);
    } finally {
      setLoading(false);
    }
  };

  const perf = analytics?.departmentPerformance;
  const activity = analytics?.transcriptActivity;

  return (
    <Box>
      <Text fontSize="sm" color="gray.600" mb={4}>Enter a department ID to load aggregated transcript and performance analytics for all students in that department.</Text>
      <Flex gap={3} mb={6}>
        <Input size="sm" placeholder="Department UUID" value={deptId} onChange={(e) => setDeptId(e.target.value)} maxW="320px" fontFamily="mono" />
        <Button size="sm" colorScheme="blue" leftIcon={<FiSearch />} onClick={handleFetch} isLoading={loading}>
          Load Analytics
        </Button>
      </Flex>

      {analytics && (
        <VStack spacing={5} align="stretch">
          <Flex align="center" gap={2}>
            <Heading size="sm">{analytics.departmentName}</Heading>
            <Text fontSize="xs" color="gray.400" fontFamily="mono">{analytics.departmentId}</Text>
          </Flex>

          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
            <KpiCard label="Total Students" value={perf?.totalStudents} />
            <KpiCard label="Completed Transcripts" value={perf?.completedTranscripts} color="green.600" />
            <KpiCard label="Avg Exam Score" value={perf?.averageExamScore != null ? `${perf.averageExamScore}%` : "—"} color="blue.600" />
            <KpiCard label="Pass Rate" value={perf?.passRate != null ? `${perf.passRate}%` : "—"} color="teal.600" />
            <KpiCard label="Fail Rate" value={perf?.failedRate != null ? `${perf.failedRate}%` : "—"} color="red.600" />
          </SimpleGrid>

          <SimpleGrid columns={3} spacing={4}>
            <KpiCard label="Weekly Updates" value={activity?.weeklyTranscriptUpdates} />
            <KpiCard label="Monthly Updates" value={activity?.monthlyTranscriptUpdates} />
            <KpiCard label="Discrepancies" value={activity?.transcriptDiscrepancies} color={activity?.transcriptDiscrepancies > 0 ? "orange.600" : "gray.800"} />
          </SimpleGrid>

          {analytics.studentTranscripts?.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2}>Student Transcript Overview</Text>
              <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Transcript ID</Th>
                      <Th>Student ID</Th>
                      <Th>Exam Type</Th>
                      <Th>Completion Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analytics.studentTranscripts.map((st, i) => (
                      <Tr key={i}>
                        <Td><Text fontFamily="mono" fontSize="xs">{st.transcriptId}</Text></Td>
                        <Td><Text fontFamily="mono" fontSize="xs">{st.studentId}</Text></Td>
                        <Td>
                          <Badge colorScheme={st.examType === "course" ? "blue" : "purple"} variant="subtle">
                            {st.examType || "—"}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              st.completionStatus === "Passed" ? "green"
                              : st.completionStatus === "Completed" ? "teal"
                              : st.completionStatus === "Failed" ? "red"
                              : "orange"
                            }
                          >
                            {st.completionStatus || "—"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
}

function StudentTranscriptV2Page() {
  const toast = useToast();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchTranscripts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.transcriptType = typeFilter;
      const res = await listTranscriptRequests(params);
      const payload = res?.data || res;
      const items = Array.isArray(payload) ? payload
        : Array.isArray(payload?.data) ? payload.data
        : MOCK_TRANSCRIPTS;
      setTranscripts(items);
      const computed = Math.ceil((payload?.total || items.length) / 20) || 1;
      setTotalPages(payload?.totalPages ?? computed);
    } catch {
      console.warn("[Transcripts] list failed, using mock");
      setTranscripts(MOCK_TRANSCRIPTS);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchTranscripts(); }, [fetchTranscripts]);

  const openDetail = (id) => { setSelectedId(id); onDetailOpen(); };

  const pendingCount = transcripts.filter((t) => t.status === "Pending Review").length;
  const issuedCount = transcripts.filter((t) => t.status === "Issued").length;
  const returnedCount = transcripts.filter((t) => t.status === "Returned").length;

  return (
    <AdminMainAreaWrapper>
      <Box p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="md" color="gray.800">Student Transcripts</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Instructor posting, admin review queue, and department analytics
            </Text>
          </Box>
          <Tooltip label="Refresh">
            <IconButton size="sm" variant="outline" icon={<FiRefreshCw />} onClick={fetchTranscripts} />
          </Tooltip>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <KpiCard label="Total Requests" value={transcripts.length} />
          <KpiCard label="Pending Review" value={pendingCount} color="orange.600" />
          <KpiCard label="Issued" value={issuedCount} color="green.600" />
          <KpiCard label="Returned" value={returnedCount} color="red.600" />
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab fontSize="sm">
              Review Queue
              {pendingCount > 0 && (
                <Badge colorScheme="orange" ml={2} borderRadius="full">{pendingCount}</Badge>
              )}
            </Tab>
            <Tab fontSize="sm">Department Analytics</Tab>
          </TabList>

          <TabPanels>
            {/* Review Queue */}
            <TabPanel px={0} pt={4}>
              <Flex gap={3} mb={4} flexWrap="wrap">
                <Select size="sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} maxW="200px">
                  <option value="">All Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Issued">Issued</option>
                  <option value="Returned">Returned</option>
                  <option value="Draft">Draft</option>
                </Select>
                <Select size="sm" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} maxW="180px">
                  <option value="">All Types</option>
                  <option value="Official">Official</option>
                  <option value="Unofficial">Unofficial</option>
                </Select>
              </Flex>

              {loading ? (
                <Flex justify="center" py={10}><Spinner /></Flex>
              ) : (
                <>
                  <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Student</Th>
                          <Th>Type</Th>
                          <Th>Status</Th>
                          <Th>Courses</Th>
                          <Th>Issuance Ref</Th>
                          <Th>Requested</Th>
                          <Th>Issued At</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {transcripts.map((t) => (
                          <Tr key={t.id} _hover={{ bg: "gray.50" }}>
                            <Td>
                              <Text fontWeight="medium" fontSize="sm">{t.student?.firstName} {t.student?.lastName}</Text>
                              <Text fontSize="xs" color="gray.400">{t.student?.email}</Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={t.transcriptType === "Official" ? "blue" : "gray"} variant="outline">
                                {t.transcriptType}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={STATUS_COLORS[t.status]}>{t.status}</Badge>
                            </Td>
                            <Td fontSize="sm" color="gray.600">
                              {(t.courseRecords || []).length}
                            </Td>
                            <Td>
                              {t.issuanceReference ? (
                                <Text fontFamily="mono" fontSize="xs" color="green.700">{t.issuanceReference}</Text>
                              ) : (
                                <Text fontSize="xs" color="gray.400">—</Text>
                              )}
                            </Td>
                            <Td fontSize="xs" color="gray.500">
                              {t.requestDate ? new Date(t.requestDate).toLocaleDateString() : "—"}
                            </Td>
                            <Td fontSize="xs" color="gray.500">
                              {t.issuedAt ? new Date(t.issuedAt).toLocaleDateString() : "—"}
                            </Td>
                            <Td>
                              <Tooltip label="View & Review">
                                <IconButton
                                  size="xs"
                                  colorScheme="blue"
                                  variant="ghost"
                                  icon={<FiEye />}
                                  onClick={() => openDetail(t.id)}
                                />
                              </Tooltip>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    {transcripts.length === 0 && (
                      <Text textAlign="center" py={8} color="gray.400" fontSize="sm">No transcript requests found</Text>
                    )}
                  </Box>
                  <PaginationBar page={page} totalPages={totalPages} onPage={setPage} />
                </>
              )}
            </TabPanel>

            {/* Department Analytics */}
            <TabPanel px={0} pt={4}>
              <DepartmentAnalyticsPanel />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <TranscriptDetailDrawer
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          transcriptId={selectedId}
          onReviewed={() => { fetchTranscripts(); toast({ title: "Transcript queue refreshed", status: "info", duration: 2000 }); }}
        />
      </Box>
    </AdminMainAreaWrapper>
  );
}

export const StudentTranscriptV2PageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentTranscriptV2Page {...props} />} />
);

export default StudentTranscriptV2Page;
