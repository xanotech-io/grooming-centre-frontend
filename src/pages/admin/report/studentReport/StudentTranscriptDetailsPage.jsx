import { useEffect, useRef, useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid, SimpleGrid, Stack, VStack, HStack } from "@chakra-ui/layout";
import {
  Badge,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Textarea,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { BreadcrumbItem } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/tag";
import Icon from "@chakra-ui/icon";
import { FaGraduationCap, FaAward } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Text,
  TranscriptCertificateModal,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { EmptyState } from "../../../../layouts";
import { adminGetSingleTranscript, adminReviewTranscript } from "../../../../services";
import { exportAsPdf } from "../../../../utils/exportToPdf";

const statusColorMap = {
  Draft: "gray",
  "Pending Review": "yellow",
  Approved: "blue",
  Issued: "green",
  Returned: "red",
};

const MetaRow = ({ label, value }) => (
  <Flex borderBottom="1px" borderColor="gray.100" py={3} gap={4}>
    <Text
      as="level5"
      color="gray.500"
      fontWeight="500"
      minW="140px"
      flexShrink={0}
    >
      {label}
    </Text>
    <Box as="span" fontSize="sm" color="gray.800" wordBreak="break-all" minW={0}>
      {value ?? "—"}
    </Box>
  </Flex>
);

// ---------------------------------------------------------------------------
// Review Modal
// ---------------------------------------------------------------------------

const ReviewModal = ({ isOpen, onClose, decision, transcriptId, onSuccess }) => {
  const toast = useToast();
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isReturn = decision === "Returned";

  const handleClose = () => {
    setRemarks("");
    onClose();
  };

  const handleSubmit = async () => {
    if (isReturn && !remarks.trim()) {
      toast({
        status: "warning",
        description: "Remarks are required when returning a transcript.",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminReviewTranscript(transcriptId, {
        decision,
        reviewRemarks: remarks.trim() || undefined,
      });
      toast({
        status: "success",
        description: res.message || `Transcript ${decision.toLowerCase()} successfully`,
        duration: 4000,
        isClosable: true,
      });
      onSuccess(res.data);
      handleClose();
    } catch (err) {
      toast({
        status: "error",
        description: err?.response?.data?.message || err.message || "Review action failed",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">
          <Flex align="center" gap={3}>
            {isReturn ? "Return Transcript" : "Approve Transcript"}
            <Tag
              size="sm"
              borderRadius="full"
              colorScheme={isReturn ? "red" : "green"}
            >
              {decision}
            </Tag>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <Text as="level5" color="gray.600">
              {isReturn
                ? "The transcript will be flagged with your remarks and status set to Returned. The student will need to take corrective action."
                : "The transcript will be locked, timestamped, assigned a unique issuance reference, and status set to Issued."}
            </Text>
            <FormControl isRequired={isReturn}>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                {isReturn ? "Remarks" : "Notes (optional)"}
              </FormLabel>
              <Textarea
                size="sm"
                borderRadius="6px"
                placeholder={
                  isReturn
                    ? "Explain what needs to be corrected..."
                    : "Add any approval notes..."
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button secondary onClick={handleClose} isDisabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={submitting}
            colorScheme={isReturn ? "red" : undefined}
          >
            {isReturn ? "Return Transcript" : "Approve & Issue"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Course Record Detail Modal
// ---------------------------------------------------------------------------

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const Field = ({ label, value }) => (
  <HStack justify="space-between" w="100%" align="flex-start" gap={4}>
    <Text as="level5" color="gray.500" minW="140px" flexShrink={0}>
      {label}
    </Text>
    <Box as="span" fontSize="sm" color="gray.800" textAlign="right" wordBreak="break-all" minW={0}>
      {value ?? "—"}
    </Box>
  </HStack>
);

const CourseRecordDetailModal = ({ isOpen, onClose, record, onViewCertificate }) => {
  if (!record) return null;

  const instructorName = record.instructor
    ? `${record.instructor.firstName ?? ""} ${record.instructor.lastName ?? ""}`.trim()
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">
          <Flex align="center" gap={3}>
            <Icon color="primary.base" fontSize="18px">
              <FaGraduationCap />
            </Icon>
            {record.course?.title ?? "Course Record"}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={2} flexWrap="wrap">
              <Badge
                colorScheme={
                  record.grade?.startsWith("A")
                    ? "green"
                    : record.grade?.startsWith("B")
                    ? "blue"
                    : record.grade?.startsWith("C")
                    ? "yellow"
                    : "red"
                }
                borderRadius="full"
                px={2}
              >
                Grade: {record.grade ?? "—"}
              </Badge>
              <Badge colorScheme={record.certificateIssued ? "green" : "gray"} borderRadius="full" px={2}>
                {record.certificateIssued ? "Certificate Issued" : "Certificate Not Issued"}
              </Badge>
              {record.examType && (
                <Badge colorScheme="purple" borderRadius="full" px={2} textTransform="capitalize">
                  {record.examType}
                </Badge>
              )}
            </HStack>

            <VStack spacing={2} align="stretch">
              <Field label="Course ID" value={record.courseId} />
              <Field label="Record ID" value={record.id} />
              <Field label="Score" value={record.score != null ? `${record.score}%` : "—"} />
              <Field label="Instructor" value={instructorName} />
              <Field label="Instructor ID" value={record.instructorId} />
              <Field label="Exam ID" value={record.examId} />
              <Field
                label="Question List"
                value={
                  Array.isArray(record.questionList)
                    ? record.questionList.length
                      ? `${record.questionList.length} question(s)`
                      : "—"
                    : "—"
                }
              />
            </VStack>

            <Divider />

            <VStack spacing={2} align="stretch">
              <Field label="Remarks" value={record.remarks} />
              <Field label="Posted At" value={formatDateTime(record.postedAt)} />
              <Field label="Transcript Request ID" value={record.transcriptRequestId} />
              <Field label="Student ID" value={record.studentId} />
              <Field label="Created At" value={formatDateTime(record.createdAt)} />
              <Field label="Updated At" value={formatDateTime(record.updatedAt)} />
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button secondary onClick={onClose}>
            Close
          </Button>
          <Button
            leftIcon={<FaAward />}
            onClick={() => onViewCertificate(record)}
          >
            {record.certificateId || record.certificateIssued ? "View Certificate" : "Generate Certificate"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const StudentTranscriptDetailsPage = () => {
  const { transcriptId } = useParams();
  const toast = useToast();
  const reviewModal = useDisclosure();
  const recordModal = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reviewDecision, setReviewDecision] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [certRecord, setCertRecord] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef(null);

  const openRecord = (record) => {
    setSelectedRecord(record);
    recordModal.onOpen();
  };

  const openCertificate = (record) => {
    setCertRecord(record);
    recordModal.onClose();
  };

  const refreshTranscript = async () => {
    try {
      const res = await adminGetSingleTranscript(transcriptId);
      setTranscript(res.data?.transcript ?? null);
      setSummary(res.data?.summary ?? null);
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "Unable to refresh transcript",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminGetSingleTranscript(transcriptId);
        setTranscript(res.data?.transcript ?? null);
        setSummary(res.data?.summary ?? null);
      } catch (err) {
        setError(err.message || "Unable to fetch transcript");
        toast({
          status: "error",
          description: err.message || "Unable to fetch transcript",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    if (transcriptId) fetch();
  }, [transcriptId, toast]);

  const openReview = (decision) => {
    setReviewDecision(decision);
    reviewModal.onOpen();
  };

  const handleReviewSuccess = (responseData) => {
    setTranscript((prev) => ({
      ...prev,
      ...responseData?.transcript,
    }));
    if (responseData?.summary) {
      setSummary((prev) => ({ ...prev, ...responseData.summary }));
    }
  };

  const canReview =
    transcript?.transcriptType === "Official" &&
    transcript?.status === "Pending Review";

  const studentName = transcript
    ? `${transcript.student?.firstName ?? ""} ${transcript.student?.lastName ?? ""}`.trim()
    : "—";

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      await exportAsPdf(printRef.current, `${studentName || "Student"} Transcript`);
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "Unable to generate transcript PDF",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/studentTranscripts">Student Transcripts</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Transcript Details</Link>
            </BreadcrumbItem>
          }
        />

        {!loading && !error && transcript && (
          <Flex gap="8px">
            <Button
              secondary
              leftIcon={<FiDownload />}
              onClick={handleDownload}
              isLoading={downloading}
            >
              Download Transcript
            </Button>
            {canReview && (
              <>
                <Button secondary onClick={() => openReview("Returned")}>
                  Return
                </Button>
                <Button onClick={() => openReview("Approved")}>
                  Approve & Issue
                </Button>
              </>
            )}
          </Flex>
        )}
      </Box>

      {loading ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading transcript...</Text>
        </Flex>
      ) : error ? (
        <EmptyState heading="Failed to load transcript" description={error} />
      ) : (
        <Stack spacing={8} ref={printRef} bg="white">
          {/* Summary metric cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <DashboardMetricCard
              title="GPA"
              value={summary?.gpa?.toFixed?.(1) ?? summary?.gpa ?? "—"}
              change="weighted GPA"
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Avg. Score"
              value={
                summary?.weightedAverageScore != null
                  ? `${summary.weightedAverageScore}%`
                  : "—"
              }
              change="weighted average"
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Completion Rate"
              value={
                summary?.courseCompletionRate != null
                  ? `${summary.courseCompletionRate}%`
                  : "—"
              }
              change={`${summary?.totalCoursesCompleted ?? "—"} / ${summary?.totalCoursesEnrolled ?? "—"} courses`}
              changeColor="#1A8F3A"
            />
            <DashboardMetricCard
              title="Certificates"
              value={summary?.certificatesIssued ?? "—"}
              change={
                summary?.certificationRatio != null
                  ? `${summary.certificationRatio}% cert ratio`
                  : "certification ratio"
              }
              changeColor="#6B006B"
            />
          </SimpleGrid>

          <Flex gap={6} flexDirection={{ base: "column", lg: "row" }} alignItems="flex-start">
            {/* Transcript metadata */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="lg"
              p={6}
              w={{ base: "full", lg: "340px" }}
              flexShrink={0}
            >
              <Heading as="h2" fontSize="heading.h4" mb={4}>
                Transcript Info
              </Heading>

              <MetaRow label="Student" value={studentName} />
              <MetaRow label="Email" value={transcript?.student?.email} />
              <MetaRow
                label="Transcript Type"
                value={
                  <Tag
                    size="sm"
                    borderRadius="full"
                    colorScheme={transcript?.transcriptType === "Official" ? "purple" : "gray"}
                  >
                    {transcript?.transcriptType}
                  </Tag>
                }
              />
              <MetaRow
                label="Status"
                value={
                  <Tag
                    size="sm"
                    borderRadius="full"
                    colorScheme={statusColorMap[transcript?.status] ?? "gray"}
                  >
                    {transcript?.status}
                  </Tag>
                }
              />
              <MetaRow
                label="Request Date"
                value={
                  transcript?.requestDate
                    ? new Date(transcript.requestDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <MetaRow
                label="Issued At"
                value={
                  transcript?.issuedAt
                    ? new Date(transcript.issuedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <MetaRow
                label="Issuance Reference"
                value={transcript?.issuanceReference}
              />
              {transcript?.reviewRemarks && (
                <MetaRow label="Review Remarks" value={transcript.reviewRemarks} />
              )}
            </Box>

            {/* Course records */}
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="lg"
              overflow="hidden"
              flex="1"
              minW={0}
            >
              <Box px={6} py={4} borderBottom="1px" borderColor="gray.200">
                <Heading as="h2" fontSize="heading.h4">
                  Course Records
                </Heading>
              </Box>

              <Box overflowX="auto">
                <Grid
                  templateColumns="1fr 160px 80px 60px 140px"
                  bg="gray.50"
                  borderBottom="1px"
                  borderColor="gray.200"
                  px={6}
                  py={3}
                  minW="560px"
                >
                  <Text bold as="level5" color="gray.600">Course</Text>
                  <Text bold as="level5" color="gray.600">Instructor</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Score</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Grade</Text>
                  <Text bold as="level5" color="gray.600" textAlign="center">Certificate</Text>
                </Grid>

                {(transcript?.courseRecords ?? []).length === 0 ? (
                  <Flex justify="center" align="center" py={10}>
                    <Text color="gray.400">No course records found.</Text>
                  </Flex>
                ) : (
                  (transcript.courseRecords ?? []).map((record, idx) => (
                    <Grid
                      key={record.courseId ?? idx}
                      templateColumns="1fr 160px 80px 60px 140px"
                      px={6}
                      py={4}
                      borderBottom="1px"
                      borderColor="gray.100"
                      _last={{ borderBottom: "none" }}
                      alignItems="center"
                      minW="560px"
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => openRecord(record)}
                    >
                      <Flex align="center" gap={3}>
                        <Icon color="primary.base" fontSize="16px">
                          <FaGraduationCap />
                        </Icon>
                        <Text bold color="primary.base" textDecoration="underline">
                          {record.course?.title ?? "—"}
                        </Text>
                      </Flex>

                      <Text fontSize="sm" color="gray.600">
                        {record.instructor
                          ? `${record.instructor.firstName} ${record.instructor.lastName}`
                          : "—"}
                      </Text>

                      <Text textAlign="center" color="gray.700">
                        {record.score != null ? `${record.score}%` : "—"}
                      </Text>

                      <Flex justify="center">
                        <Badge
                          colorScheme={
                            record.grade?.startsWith("A")
                              ? "green"
                              : record.grade?.startsWith("B")
                              ? "blue"
                              : record.grade?.startsWith("C")
                              ? "yellow"
                              : "red"
                          }
                          borderRadius="full"
                          px={2}
                        >
                          {record.grade ?? "—"}
                        </Badge>
                      </Flex>

                      <Flex justify="center" align="center" gap={1}>
                        <Button
                          xs
                          secondary={Boolean(record.certificateId || record.certificateIssued)}
                          leftIcon={<FaAward />}
                          onClick={(e) => {
                            e.stopPropagation();
                            openCertificate(record);
                          }}
                        >
                          {record.certificateId || record.certificateIssued ? "View" : "Generate"}
                        </Button>
                      </Flex>
                    </Grid>
                  ))
                )}
              </Box>
            </Box>
          </Flex>
        </Stack>
      )}

      {reviewDecision && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={reviewModal.onClose}
          decision={reviewDecision}
          transcriptId={transcriptId}
          onSuccess={handleReviewSuccess}
        />
      )}

      <CourseRecordDetailModal
        isOpen={recordModal.isOpen}
        onClose={recordModal.onClose}
        record={selectedRecord}
        onViewCertificate={openCertificate}
      />

      <TranscriptCertificateModal
        isOpen={Boolean(certRecord)}
        onClose={() => setCertRecord(null)}
        transcriptId={transcriptId}
        courseId={certRecord?.courseId}
        courseTitle={certRecord?.course?.title}
        hasCertificate={Boolean(certRecord?.certificateId ?? certRecord?.certificateIssued)}
        onGenerated={refreshTranscript}
      />
    </AdminMainAreaWrapper>
  );
};

export const StudentTranscriptDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <StudentTranscriptDetailsPage {...props} />} />
  );
};

export default StudentTranscriptDetailsPage;
