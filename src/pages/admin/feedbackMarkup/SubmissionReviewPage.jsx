import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Badge,
  Spinner,
  Textarea,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaCheck, FaChartBar } from "react-icons/fa";
import { Button, Heading, Input, Select } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetMarkupsByDocument,
  adminGetFeedbackAnalytics,
  adminCreateFeedbackMarkup,
  adminResolveFeedbackMarkup,
  adminAddRubricAssessment,
} from "../../../services";
import { useApp } from "../../../contexts";
import { capitalizeFirstLetter } from "../../../utils";

const MARKUP_TYPE_OPTIONS = [
  { label: "Highlight", value: "Highlight" },
  { label: "Text Comment", value: "TextComment" },
  { label: "Annotation", value: "Annotation" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Assignment", value: "ASSIGNMENT" },
  { label: "Exam", value: "EXAM" },
  { label: "Project", value: "PROJECT" },
];

const COLOR_OPTIONS = [
  { label: "Yellow", value: "yellow" },
  { label: "Blue", value: "blue" },
  { label: "Green", value: "green" },
  { label: "Orange", value: "orange" },
  { label: "Red", value: "red" },
];

const STATUS_MAP = {
  Published: { bg: "#E6F4EA", color: "#38A169" },
  Draft: { bg: "#F7FAFC", color: "#718096" },
  Resolved: { bg: "#EBF4FF", color: "#3182CE" },
};

const getStatusBadge = (status) => {
  const s = STATUS_MAP[status] || STATUS_MAP.Draft;
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="10px"
      py="3px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="12px"
    >
      {status}
    </Badge>
  );
};

const emptyRubricCriterion = () => ({
  _key: Date.now() + Math.random(),
  criterionId: `crit-${Date.now()}`,
  criterionName: "",
  score: 0,
  maxScore: 5,
  feedback: "",
});

export const SubmissionReviewPage = () => {
  const history = useHistory();
  const { documentId } = useParams();
  const toast = useToast();
  const { state: { user } } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { resource: markupsResource, handleFetchResource: fetchMarkups } =
    useFetch();
  const { resource: analyticsResource, handleFetchResource: fetchAnalytics } =
    useFetch();

  // Create markup form state
  const [studentId, setStudentId] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const [markupType, setMarkupType] = useState("HIGHLIGHT");
  const [documentType, setDocumentType] = useState("ASSIGNMENT");
  const [comment, setComment] = useState("");
  const [color, setColor] = useState("yellow");
  const [pageNumber, setPageNumber] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Rubric modal state
  const [selectedMarkupId, setSelectedMarkupId] = useState(null);
  const [rubricId, setRubricId] = useState("");
  const [rubricCriteria, setRubricCriteria] = useState([
    emptyRubricCriterion(),
  ]);
  const [isAddingRubric, setIsAddingRubric] = useState(false);

  // Resolve state — track per-markup loading
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveTargetId, setResolveTargetId] = useState(null);

  const markupsFetcher = useCallback(async () => {
    const { markups, totalDocumentsCount } =
      await adminGetMarkupsByDocument(documentId);
    return { markups, totalDocumentsCount };
  }, [documentId]);

  const analyticsFetcher = useCallback(async () => {
    const { analytics } = await adminGetFeedbackAnalytics(documentId);
    return analytics;
  }, [documentId]);

  useEffect(() => {
    fetchMarkups({ fetcher: markupsFetcher });
    fetchAnalytics({ fetcher: analyticsFetcher });
  }, [fetchMarkups, markupsFetcher, fetchAnalytics, analyticsFetcher]);

  const markups = markupsResource.data?.markups ?? [];
  const analytics = analyticsResource.data;

  const handleCreateMarkup = async () => {
    if (!comment.trim()) {
      toast({
        description: "Comment is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    if (!studentId.trim()) {
      toast({
        description: "Student ID is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsCreating(true);
    try {
      const body = {
        submissionId: documentId,
        assessmentId,
        markupType,
        reviewerId: user?.id,
        studentId,
        documentType,
        comment,
        color,
        position: {
          pageNumber: Number(pageNumber),
          x: 0,
          y: 0,
          width: 200,
          height: 30,
        },
        timestamp: new Date().toISOString(),
      };
      const { message } = await adminCreateFeedbackMarkup(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      // Reset form
      setStudentId("");
      setAssessmentId("");
      setComment("");
      setPageNumber(1);
      // Re-fetch
      fetchMarkups({ fetcher: markupsFetcher });
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openResolveModal = (markupId) => {
    setResolveTargetId(markupId);
    setResolveNotes("");
    setResolveModalOpen(true);
  };

  const handleResolve = async () => {
    if (!resolveNotes.trim()) {
      toast({
        description: "Resolution notes are required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setResolvingId(resolveTargetId);
    try {
      const { message } = await adminResolveFeedbackMarkup(resolveTargetId, {
        resolutionNotes: resolveNotes,
      });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      setResolveModalOpen(false);
      fetchMarkups({ fetcher: markupsFetcher });
      fetchAnalytics({ fetcher: analyticsFetcher });
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setResolvingId(null);
    }
  };

  const openRubricModal = (markupId) => {
    setSelectedMarkupId(markupId);
    setRubricId("");
    setRubricCriteria([emptyRubricCriterion()]);
    onOpen();
  };

  const handleCriterionChange = (idx, field, value) => {
    setRubricCriteria((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  const handleAddRubricSubmit = async () => {
    if (!rubricId.trim()) {
      toast({
        description: "Rubric ID is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    const totalScore = rubricCriteria.reduce(
      (s, c) => s + Number(c.score || 0),
      0,
    );
    const maxTotalScore = rubricCriteria.reduce(
      (s, c) => s + Number(c.maxScore || 0),
      0,
    );
    setIsAddingRubric(true);
    try {
      const body = {
        rubricId,
        criteriaScores: rubricCriteria.map(({ _key, ...c }) => ({
          ...c,
          score: Number(c.score),
          maxScore: Number(c.maxScore),
        })),
        totalScore,
        maxTotalScore,
      };
      const { message } = await adminAddRubricAssessment(
        selectedMarkupId,
        body,
      );
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      onClose();
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsAddingRubric(false);
    }
  };

  return (
    <Box
      paddingX={{ base: "20px", lg: "40px" }}
      paddingY="30px"
      bg="#FAFAFA"
      minHeight="100vh"
    >
      {/* Go Back */}
      <Flex
        alignItems="center"
        cursor="pointer"
        onClick={() => history.goBack()}
        mb="24px"
        width="max-content"
      >
        <Box
          border="1px solid #E2E8F0"
          borderRadius="4px"
          p="6px"
          mr="12px"
          bg="white"
        >
          <FaArrowLeft color="#1A202C" />
        </Box>
        <Text fontWeight="500" color="#1A202C">
          Go Back
        </Text>
      </Flex>

      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb="32px"
        flexWrap="wrap"
        gap="16px"
      >
        <Box>
          <Heading as="h1" size="lg" color="#1A202C" mb="4px">
            Submission Review
          </Heading>
          <Text fontSize="13px" color="#718096">
            Document ID:{" "}
            <Text as="span" color="#6b006b" fontWeight="600">
              {documentId}
            </Text>
          </Text>
        </Box>
      </Flex>

      <Grid
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
        gap="28px"
        alignItems="start"
      >
        {/* Left Column */}
        <Box>
          {/* Analytics Card */}
          {analyticsResource.loading ? (
            <Flex justifyContent="center" p="30px">
              <Spinner color="#6b006b" />
            </Flex>
          ) : analytics ? (
            <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="24px">
              <Flex alignItems="center" gap="8px" mb="20px">
                <FaChartBar color="#6b006b" />
                <Text fontSize="15px" fontWeight="600" color="#1A202C">
                  Feedback Analytics
                </Text>
              </Flex>
              <Grid templateColumns="repeat(3, 1fr)" gap="16px" mb="16px">
                <Box
                  bg="#F4F5F7"
                  borderRadius="8px"
                  p="14px"
                  textAlign="center"
                >
                  <Text fontSize="11px" color="#718096" mb="4px">
                    Total Markups
                  </Text>
                  <Text fontSize="22px" fontWeight="700" color="#6b006b">
                    {analytics.totalMarkups}
                  </Text>
                </Box>
                <Box
                  bg="#F4F5F7"
                  borderRadius="8px"
                  p="14px"
                  textAlign="center"
                >
                  <Text fontSize="11px" color="#718096" mb="4px">
                    Resolved
                  </Text>
                  <Text fontSize="22px" fontWeight="700" color="#38A169">
                    {analytics.byStatus?.Resolved ?? 0}
                  </Text>
                </Box>
                <Box
                  bg="#F4F5F7"
                  borderRadius="8px"
                  p="14px"
                  textAlign="center"
                >
                  <Text fontSize="11px" color="#718096" mb="4px">
                    Effectiveness
                  </Text>
                  <Text fontSize="22px" fontWeight="700" color="#3182CE">
                    {analytics.feedbackEffectivenessScore}%
                  </Text>
                </Box>
              </Grid>
              <Grid templateColumns="1fr 1fr" gap="12px">
                <Box>
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    color="#4A5568"
                    mb="8px"
                  >
                    By Type
                  </Text>
                  {Object.entries(analytics.byType ?? {}).map(
                    ([type, count]) => (
                      <Flex key={type} justifyContent="space-between" mb="4px">
                        <Text fontSize="12px" color="#718096">
                          {type.replace("_", " ")}
                        </Text>
                        <Text fontSize="12px" fontWeight="600" color="#1A202C">
                          {count}
                        </Text>
                      </Flex>
                    ),
                  )}
                </Box>
                <Box>
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    color="#4A5568"
                    mb="8px"
                  >
                    By Status
                  </Text>
                  {Object.entries(analytics.byStatus ?? {}).map(
                    ([status, count]) => (
                      <Flex
                        key={status}
                        justifyContent="space-between"
                        mb="4px"
                      >
                        <Text fontSize="12px" color="#718096">
                          {status}
                        </Text>
                        <Text fontSize="12px" fontWeight="600" color="#1A202C">
                          {count}
                        </Text>
                      </Flex>
                    ),
                  )}
                </Box>
              </Grid>
              <Divider my="12px" />
              <Flex justifyContent="space-between">
                <Text fontSize="12px" color="#718096">
                  Avg. Resolution Time
                </Text>
                <Text fontSize="12px" fontWeight="600" color="#1A202C">
                  {analytics.averageResolutionTime}h
                </Text>
              </Flex>
            </Box>
          ) : null}

          {/* Markup List */}
          <Box bg="white" borderRadius="8px" shadow="sm">
            <Text
              fontSize="15px"
              fontWeight="600"
              color="#1A202C"
              p="20px"
              borderBottom="1px solid #E2E8F0"
            >
              Markups ({markups.length})
            </Text>

            {markupsResource.loading && (
              <Flex justifyContent="center" p="40px">
                <Spinner size="lg" color="#6b006b" />
              </Flex>
            )}

            {!markupsResource.loading && markups.length === 0 && (
              <Flex justifyContent="center" p="40px">
                <Text color="#A0AEC0" fontSize="14px">
                  No markups found for this document.
                </Text>
              </Flex>
            )}

            {markups.map((m) => (
              <Box
                key={m.markupId}
                p="20px"
                borderBottom="1px solid #F4F5F7"
                _last={{ borderBottom: "none" }}
              >
                <Flex
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb="8px"
                >
                  <Flex gap="10px" alignItems="center" flexWrap="wrap">
                    <Text fontSize="13px" fontWeight="600" color="#6b006b">
                      {m.markupId}
                    </Text>
                    {getStatusBadge(m.status)}
                    <Badge
                      bg="#F4F5F7"
                      color="#4A5568"
                      px="8px"
                      py="2px"
                      borderRadius="6px"
                      fontSize="11px"
                      textTransform="none"
                    >
                      {m.markupType?.replace("_", " ")}
                    </Badge>
                    <Badge
                      bg="#FFF8E1"
                      color="#7B5E00"
                      px="8px"
                      py="2px"
                      borderRadius="6px"
                      fontSize="11px"
                      textTransform="none"
                    >
                      {m.documentType}
                    </Badge>
                  </Flex>
                  <Flex gap="8px">
                    {m.status !== "Resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="green"
                        style={{ borderColor: "#38A169", color: "#38A169" }}
                        onClick={() => openResolveModal(m.markupId)}
                      >
                        <Flex alignItems="center" gap="5px">
                          <FaCheck size="10px" /> Resolve
                        </Flex>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      style={{ borderColor: "#6b006b", color: "#6b006b" }}
                      onClick={() => openRubricModal(m.markupId)}
                    >
                      Add Rubric
                    </Button>
                  </Flex>
                </Flex>

                <Text fontSize="13px" color="#4A5568" mb="8px">
                  {m.comment}
                </Text>

                <Flex gap="20px" flexWrap="wrap">
                  <Text fontSize="12px" color="#718096">
                    Reviewer:{" "}
                    <Text as="span" color="#1A202C" fontWeight="500">
                      {m.reviewer}
                    </Text>
                  </Text>
                  <Text fontSize="12px" color="#718096">
                    Student:{" "}
                    <Text as="span" color="#1A202C" fontWeight="500">
                      {m.studentId}
                    </Text>
                  </Text>
                  {m.position && (
                    <Text fontSize="12px" color="#718096">
                      Page{" "}
                      <Text as="span" color="#1A202C" fontWeight="500">
                        {m.position.pageNumber}
                      </Text>
                    </Text>
                  )}
                  {m.color && (
                    <Flex alignItems="center" gap="4px">
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="50%"
                        bg={m.color}
                        border="1px solid #CBD5E0"
                      />
                      <Text fontSize="12px" color="#718096">
                        {m.color}
                      </Text>
                    </Flex>
                  )}
                </Flex>

                {m.status === "Resolved" && m.resolutionNotes && (
                  <Box mt="10px" bg="#F0FFF4" borderRadius="6px" p="10px">
                    <Text fontSize="12px" color="#276749" fontWeight="500">
                      Resolution Notes:
                    </Text>
                    <Text fontSize="12px" color="#276749">
                      {m.resolutionNotes}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Column — Add Markup Form */}
        <Box position="sticky" top="30px">
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="20px">
              Add Markup
            </Text>
            <Divider mb="20px" />

            <Box mb="14px">
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Markup Type
              </Text>
              <Select
                id="markupType"
                options={MARKUP_TYPE_OPTIONS}
                value={markupType}
                onChange={(e) => setMarkupType(e.target.value)}
              />
            </Box>

            <Box mb="14px">
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Document Type
              </Text>
              <Select
                id="documentType"
                options={DOCUMENT_TYPE_OPTIONS}
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              />
            </Box>

            <Box mb="14px">
              <Input
                label="Student ID"
                id="studentId"
                placeholder="e.g. S12345"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </Box>

            <Box mb="14px">
              <Input
                label="Assessment ID"
                id="assessmentId"
                placeholder="e.g. assessment-uuid-456"
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
              />
            </Box>

            <Box mb="14px">
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Comment
              </Text>
              <Textarea
                placeholder="Enter your feedback comment..."
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </Box>

            <Grid templateColumns="1fr 1fr" gap="12px" mb="14px">
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Color
                </Text>
                <Select
                  id="color"
                  options={COLOR_OPTIONS}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Page Number
                </Text>
                <NumberInput
                  min={1}
                  value={pageNumber}
                  onChange={(v) => setPageNumber(v)}
                >
                  <NumberInputField
                    bg="#F4F5F7"
                    border="none"
                    borderRadius="8px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </Grid>

            <Button
              w="100%"
              style={{ backgroundColor: "#6b006b", color: "white" }}
              isLoading={isCreating}
              onClick={handleCreateMarkup}
            >
              <Flex alignItems="center" gap="6px">
                <FaPlus size="11px" /> Add Markup
              </Flex>
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C">
            Resolve Markup
          </ModalHeader>
          <Divider />
          <ModalBody py="24px">
            <Text fontSize="13px" color="#718096" mb="16px">
              Describe how this feedback was addressed.
            </Text>
            <Textarea
              placeholder="e.g. Student revised the formula explanation as suggested"
              bg="#F4F5F7"
              border="none"
              borderRadius="8px"
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              rows={4}
            />
          </ModalBody>
          <Divider />
          <ModalFooter gap="12px">
            <Button
              variant="outline"
              onClick={() => setResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              isLoading={!!resolvingId}
              onClick={handleResolve}
            >
              Resolve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rubric Assessment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C">
            Add Rubric Assessment
          </ModalHeader>
          <Divider />
          <ModalBody py="24px">
            <Box mb="16px">
              <Input
                label="Rubric ID"
                id="rubricId"
                placeholder="e.g. rubric-uuid-123"
                value={rubricId}
                onChange={(e) => setRubricId(e.target.value)}
              />
            </Box>

            <Text fontSize="13px" fontWeight="600" color="#1A202C" mb="12px">
              Criteria Scores
            </Text>

            {rubricCriteria.map((c, idx) => (
              <Box
                key={c._key}
                border="1px solid #E2E8F0"
                borderRadius="8px"
                p="14px"
                mb="12px"
              >
                <Flex gap="12px" mb="10px">
                  <Box flex={1}>
                    <Input
                      label="Criterion Name"
                      id={`crit-name-${idx}`}
                      placeholder="e.g. Content Accuracy"
                      value={c.criterionName}
                      onChange={(e) =>
                        handleCriterionChange(
                          idx,
                          "criterionName",
                          e.target.value,
                        )
                      }
                    />
                  </Box>
                </Flex>
                <Grid templateColumns="1fr 1fr" gap="12px" mb="10px">
                  <Box>
                    <Text
                      fontSize="12px"
                      fontWeight="500"
                      color="#1A202C"
                      mb="6px"
                    >
                      Score
                    </Text>
                    <NumberInput
                      min={0}
                      max={c.maxScore}
                      value={c.score}
                      onChange={(v) =>
                        handleCriterionChange(idx, "score", Number(v))
                      }
                    >
                      <NumberInputField
                        bg="#F4F5F7"
                        border="none"
                        borderRadius="8px"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box>
                    <Text
                      fontSize="12px"
                      fontWeight="500"
                      color="#1A202C"
                      mb="6px"
                    >
                      Max Score
                    </Text>
                    <NumberInput
                      min={1}
                      value={c.maxScore}
                      onChange={(v) =>
                        handleCriterionChange(idx, "maxScore", Number(v))
                      }
                    >
                      <NumberInputField
                        bg="#F4F5F7"
                        border="none"
                        borderRadius="8px"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                </Grid>
                <Box>
                  <Text
                    fontSize="12px"
                    fontWeight="500"
                    color="#1A202C"
                    mb="6px"
                  >
                    Feedback
                  </Text>
                  <Textarea
                    placeholder="e.g. Mostly accurate with minor errors"
                    bg="#F4F5F7"
                    border="none"
                    borderRadius="8px"
                    size="sm"
                    value={c.feedback}
                    onChange={(e) =>
                      handleCriterionChange(idx, "feedback", e.target.value)
                    }
                  />
                </Box>
              </Box>
            ))}

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setRubricCriteria((prev) => [...prev, emptyRubricCriterion()])
              }
            >
              <Flex alignItems="center" gap="5px">
                <FaPlus size="10px" /> Add Criterion
              </Flex>
            </Button>

            <Box mt="16px" bg="#F4F5F7" borderRadius="8px" p="12px">
              <Flex justifyContent="space-between">
                <Text fontSize="13px" color="#718096">
                  Total Score:
                </Text>
                <Text fontSize="13px" fontWeight="600" color="#6b006b">
                  {rubricCriteria.reduce((s, c) => s + Number(c.score || 0), 0)}{" "}
                  /{" "}
                  {rubricCriteria.reduce(
                    (s, c) => s + Number(c.maxScore || 0),
                    0,
                  )}
                </Text>
              </Flex>
            </Box>
          </ModalBody>
          <Divider />
          <ModalFooter gap="12px">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              isLoading={isAddingRubric}
              onClick={handleAddRubricSubmit}
            >
              Save Assessment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export const SubmissionReviewPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <SubmissionReviewPage {...props} />} />
);

export default SubmissionReviewPageRoute;
