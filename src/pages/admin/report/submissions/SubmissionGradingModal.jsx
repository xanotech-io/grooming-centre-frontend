import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { Button, Text, AnnotatableText } from "../../../../components";
import {
  getAnswerSheet,
  getSubmissionDetail,
  gradeSubmission,
  markViewed,
  buildThreadKey,
} from "../../../../services";
import {
  MOCK_ANSWER_SHEET,
  MOCK_SUBMISSIONS,
} from "../../../../services/http/endpoints/submissionsReport";
import { isSubmissionGraded, submissionStatusLabel } from "../../../../utils";
import { useApp } from "../../../../contexts";
import dayjs from "dayjs";

const isEssayType = (q) => (q?.options?.length ?? 0) === 0;

const fmtDateTime = (d) => (d ? dayjs(d).format("MMM D, YYYY h:mm A") : "—");

// ─── Read-only answer renderer (assessment/exam content) ──────────────────────
const AnswerDisplay = ({ q }) => {
  const options = q?.options ?? [];
  const studentAnswer = q?.studentAnswer;

  if (options.length > 0) {
    return (
      <Box>
        {options.map((opt) => {
          const isCorrect = opt.isAnswer === true;
          const isSelected = opt.id === studentAnswer;
          let borderColor = "#E2E8F0";
          let bg = "white";
          if (isCorrect && isSelected) {
            bg = "#E6F4EA";
            borderColor = "#38A169";
          } else if (isCorrect) {
            bg = "#F0FFF4";
            borderColor = "#9AE6B4";
          } else if (isSelected) {
            bg = "#FFF5F5";
            borderColor = "#FC8181";
          }
          return (
            <Flex
              key={opt.id}
              alignItems="center"
              gap={3}
              mb={2}
              p={3}
              borderRadius="6px"
              border="1px solid"
              borderColor={borderColor}
              bg={bg}
            >
              <Text fontSize="13px" flex={1}>
                {opt.name}
              </Text>
              {isCorrect && (
                <Badge colorScheme="green" fontSize="9px">
                  Correct answer
                </Badge>
              )}
              {isSelected && !isCorrect && (
                <Badge colorScheme="red" fontSize="9px">
                  Student selected
                </Badge>
              )}
            </Flex>
          );
        })}
      </Box>
    );
  }

  if (!studentAnswer) {
    return (
      <Text fontSize="14px" color="gray.400" fontStyle="italic">
        No answer submitted
      </Text>
    );
  }

  return (
    <Text fontSize="14px" whiteSpace="pre-wrap" lineHeight="1.7">
      {studentAnswer}
    </Text>
  );
};

const SubmissionGradingModal = ({ submissionId, type, isOpen, onClose, onGraded }) => {
  const toast = useToast();
  const openedAtRef = useRef(null);
  const {
    state: { user: viewer },
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [score, setScore] = useState("");
  const [grade, setGrade] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !submissionId) return;
    openedAtRef.current = Date.now();
    setLoading(true);
    setQuestions([]);

    getSubmissionDetail(submissionId)
      .then((res) => res?.data ?? res)
      .catch(() => {
        // TODO: remove once GET /v1/submissions-report/:id is live
        console.warn(
          "[SubmissionGrading] GET /submissions-report/:id failed, using mock",
        );
        return MOCK_SUBMISSIONS.find((s) => s.submissionId === submissionId) ?? null;
      })
      .then((data) => {
        setSubmission(data);
        setScore(data?.score ?? "");
        setGrade(data?.grade ?? "");
        setRemarks(data?.remarks ?? "");

        if (data && viewer?.id) {
          const key =
            type === "project"
              ? buildThreadKey("project", data.projectId, data.studentId)
              : buildThreadKey(type, data.assessmentId, data.studentId);
          markViewed(key, viewer.id);
        }

        if (data && (type === "assessment" || type === "exam")) {
          return getAnswerSheet(data.assessmentId, data.studentId)
            .then(({ sheet }) => setQuestions(sheet?.questions ?? []))
            .catch(() => {
              // TODO: remove once GET /v1/assessment-marking/answer-sheet/... is live for this flow
              console.warn(
                "[SubmissionGrading] GET /answer-sheet failed, using mock",
              );
              setQuestions(MOCK_ANSWER_SHEET.questions);
            });
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, submissionId, type]);

  const fullName = submission?.studentName || "—";
  const isProject = type === "project";
  const alreadyGraded = isSubmissionGraded(submission?.status);
  const threadKey = submission
    ? isProject
      ? buildThreadKey("project", submission.projectId, submission.studentId)
      : buildThreadKey(type, submission.assessmentId, submission.studentId)
    : null;
  const viewerName = `${viewer?.firstName ?? ""} ${viewer?.lastName ?? ""}`.trim();

  const handleSave = async () => {
    setSaving(true);
    const gradingDurationMinutes = openedAtRef.current
      ? Math.max(1, Math.round((Date.now() - openedAtRef.current) / 60000))
      : null;

    const payload = {
      score: score === "" ? null : Number(score),
      grade: grade || null,
      remarks: remarks || null,
      gradingDurationMinutes,
    };

    try {
      await gradeSubmission(submissionId, payload);
    } catch {
      // TODO: remove once POST /v1/submissions-report/:id/grade is live
      console.warn(
        "[SubmissionGrading] POST /grade failed, applying update locally",
      );
    }

    setSaving(false);
    onGraded?.({
      ...submission,
      ...payload,
      status: "graded",
      gradedAt: new Date().toISOString(),
    });
    toast({
      description: "Grading saved.",
      status: "success",
      position: "top",
      duration: 2500,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px">
          <Flex alignItems="center" gap={3} flexWrap="wrap">
            <Text fontWeight="700">{fullName}</Text>
            <Text fontSize="sm" color="gray.500">
              {submission?.title || "—"}
            </Text>
            {submission?.status && (
              <Badge colorScheme={alreadyGraded ? "green" : "orange"}>
                {submissionStatusLabel(submission.status)}
              </Badge>
            )}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={5}>
          {loading ? (
            <Box>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height="24px" mb={3} />
              ))}
            </Box>
          ) : !submission ? (
            <Text color="red.500">Submission not found.</Text>
          ) : (
            <Grid templateColumns={{ base: "1fr", lg: "1fr 320px" }} gap={6}>
              {/* Content pane */}
              <Box>
                <Grid templateColumns="1fr 1fr" gap={4} mb={5}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Course
                    </Text>
                    <Text fontWeight="medium">{submission.courseTitle || "—"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Instructor
                    </Text>
                    <Text fontWeight="medium">{submission.instructorName || "—"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Submitted
                    </Text>
                    <Text fontWeight="medium">{fmtDateTime(submission.submittedAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Date graded
                    </Text>
                    <Text fontWeight="medium">{fmtDateTime(submission.gradedAt)}</Text>
                  </Box>
                </Grid>

                {isProject ? (
                  <>
                  <Box p={4} border="1px solid #E2E8F0" borderRadius="8px">
                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      mb={3}
                    >
                      Submitted File
                    </Text>
                    {submission.submissionUrl ? (
                      <Flex
                        as="a"
                        href={submission.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        alignItems="center"
                        gap={2}
                        color="blue.600"
                        fontWeight="600"
                        fontSize="sm"
                      >
                        Open submitted file <FiExternalLink size={13} />
                      </Flex>
                    ) : (
                      <Text fontSize="sm" color="gray.400" fontStyle="italic">
                        No file submitted.
                      </Text>
                    )}
                  </Box>

                  <Box mt={4} p={4} border="1px solid #E2E8F0" borderRadius="8px">
                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      mb={3}
                    >
                      Comments
                    </Text>
                    <AnnotatableText
                      submissionId={threadKey}
                      questionId={null}
                      questionLabel={null}
                      text={null}
                      viewerId={viewer?.id}
                      viewerName={viewerName}
                      viewerRole="instructor"
                    />
                  </Box>
                  </>
                ) : questions.length === 0 ? (
                  <Text color="gray.500">No questions found for this submission.</Text>
                ) : (
                  questions.map((q, idx) => (
                    <Box
                      key={q.questionId}
                      mb={4}
                      p={4}
                      bg="#F7F9FC"
                      borderRadius="8px"
                      borderLeft="3px solid #6b006b"
                    >
                      <Flex justifyContent="space-between" mb={2}>
                        <Text fontSize="11px" fontWeight="700" color="gray.500">
                          Q{idx + 1} {q.marks != null ? `· ${q.marks} marks` : ""}
                        </Text>
                        {q.markingType === "auto" && q.scoreAssigned != null && (
                          <Badge colorScheme="blue" fontSize="9px">
                            Auto — {q.scoreAssigned}/{q.marks}
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="14px" fontWeight="600" mb={3}>
                        {q.question}
                      </Text>
                      <Box p={3} bg="white" border="1px solid #E2E8F0" borderRadius="6px">
                        <Text
                          fontSize="10px"
                          fontWeight="700"
                          color="gray.400"
                          textTransform="uppercase"
                          mb={2}
                        >
                          Student&apos;s Answer
                        </Text>
                        {isEssayType(q) && q.studentAnswer ? (
                          <AnnotatableText
                            submissionId={threadKey}
                            questionId={q.questionId}
                            questionLabel={`Q${idx + 1}`}
                            text={q.studentAnswer}
                            viewerId={viewer?.id}
                            viewerName={viewerName}
                            viewerRole="instructor"
                          />
                        ) : (
                          <AnswerDisplay q={q} />
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </Box>

              {/* Grading panel */}
              <Box bg="#FAFAFA" border="1px solid #E2E8F0" borderRadius="8px" p={4} h="fit-content">
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={4}
                >
                  Grade
                </Text>

                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="600" mb={2}>
                    Score {submission.maxScore != null ? `(/ ${submission.maxScore})` : ""}
                  </Text>
                  <input
                    type="number"
                    min={0}
                    max={submission.maxScore ?? undefined}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: 18,
                      fontWeight: 700,
                      width: "100%",
                      background: "white",
                      outline: "none",
                    }}
                  />
                </Box>

                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="600" mb={2}>
                    Grade
                  </Text>
                  <input
                    type="text"
                    placeholder="e.g. A, Pass, 85%"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: 14,
                      width: "100%",
                      background: "white",
                      outline: "none",
                    }}
                  />
                </Box>

                <Box mb={2}>
                  <Text fontSize="sm" fontWeight="600" mb={2}>
                    Remarks
                  </Text>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Feedback or remarks for the student..."
                    rows={6}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 6,
                      padding: "10px 12px",
                      fontSize: 13,
                      width: "100%",
                      resize: "vertical",
                      background: "white",
                      outline: "none",
                      fontFamily: "inherit",
                      lineHeight: 1.6,
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          )}
        </ModalBody>
        <ModalFooter borderTopWidth="1px">
          <Button secondary onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving} disabled={loading || !submission}>
            {alreadyGraded ? "Save Changes" : "Save Grade"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmissionGradingModal;
