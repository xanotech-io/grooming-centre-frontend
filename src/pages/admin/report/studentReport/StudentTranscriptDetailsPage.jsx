import { useEffect, useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid, SimpleGrid, Stack } from "@chakra-ui/layout";
import {
  Badge,
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
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { EmptyState } from "../../../../layouts";
import { adminGetSingleTranscript, adminReviewTranscript } from "../../../../services";

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
// Main Page
// ---------------------------------------------------------------------------

const StudentTranscriptDetailsPage = () => {
  const { transcriptId } = useParams();
  const toast = useToast();
  const reviewModal = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reviewDecision, setReviewDecision] = useState(null);

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

        {canReview && (
          <Flex gap="8px">
            <Button secondary onClick={() => openReview("Returned")}>
              Return
            </Button>
            <Button onClick={() => openReview("Approved")}>
              Approve & Issue
            </Button>
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
        <Stack spacing={8}>
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
                    >
                      <Flex align="center" gap={3}>
                        <Icon color="primary.base" fontSize="16px">
                          <FaGraduationCap />
                        </Icon>
                        <Text bold>{record.course?.title ?? "—"}</Text>
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
                        {record.certificateIssued ? (
                          <>
                            <Icon color="green.500" fontSize="14px">
                              <FaAward />
                            </Icon>
                            <Text as="level5" color="green.600">Issued</Text>
                          </>
                        ) : (
                          <Text as="level5" color="gray.400">Not issued</Text>
                        )}
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
    </AdminMainAreaWrapper>
  );
};

export const StudentTranscriptDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <StudentTranscriptDetailsPage {...props} />} />
  );
};

export default StudentTranscriptDetailsPage;
