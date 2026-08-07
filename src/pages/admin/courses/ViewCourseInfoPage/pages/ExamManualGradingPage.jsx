import { useCallback, useEffect, useMemo, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Badge, Grid, Progress, Spinner } from "@chakra-ui/react";
import { Text, Button } from "../../../../../components";
import { RichTextToView } from "../../../../../components";
import {
  adminGetStudentAnswerSheet,
  adminSubmitManualGrade,
} from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";
import { useToast } from "@chakra-ui/toast";
import {
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

/* ─── Infer display label from options ─────────────── */
const inferTypeLabel = (q) => {
  const opts = q?.options ?? [];
  if (opts.length === 0) return "Open";
  const names = opts.map((o) => (o?.name || "").toLowerCase());
  if (opts.length === 2 && names.includes("true") && names.includes("false"))
    return "True/False";
  return "MCQ";
};

/* ─── Answer renderer ───────────────────────────────── */
const AnswerDisplay = ({ q }) => {
  const options = q?.options ?? [];
  const studentAnswer = q?.studentAnswer;

  if (options.length > 0) {
    return (
      <Box>
        {options.map((opt) => {
          const isCorrect = opt.isAnswer === true;
          const isSelected = opt.id === studentAnswer;

          let bg = "white";
          let borderColor = "#E2E8F0";
          let textColor = "#1A202C";

          if (isCorrect && isSelected) {
            bg = "#E6F4EA";
            borderColor = "#38A169";
            textColor = "#276749";
          } else if (isCorrect) {
            bg = "#F0FFF4";
            borderColor = "#9AE6B4";
            textColor = "#276749";
          } else if (isSelected) {
            bg = "#FFF5F5";
            borderColor = "#FC8181";
            textColor = "#C53030";
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
              <Box
                w="18px"
                h="18px"
                borderRadius="50%"
                border="2px solid"
                borderColor={
                  isCorrect ? "#38A169" : isSelected ? "#E53E3E" : "#CBD5E0"
                }
                bg={
                  isCorrect || isSelected
                    ? isCorrect
                      ? "#38A169"
                      : "#E53E3E"
                    : "white"
                }
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {(isCorrect || isSelected) && (
                  <Box w="7px" h="7px" borderRadius="50%" bg="white" />
                )}
              </Box>
              <Text
                fontSize="13px"
                color={textColor}
                fontWeight={isCorrect || isSelected ? "600" : "400"}
                flex={1}
              >
                {opt.name}
              </Text>
              {isCorrect && !isSelected && (
                <Badge colorScheme="green" fontSize="9px">
                  Correct answer
                </Badge>
              )}
              {isSelected && !isCorrect && (
                <Badge colorScheme="red" fontSize="9px">
                  Student selected
                </Badge>
              )}
              {isCorrect && isSelected && (
                <Badge colorScheme="green" fontSize="9px">
                  Student selected ✓
                </Badge>
              )}
            </Flex>
          );
        })}
        {!studentAnswer && (
          <Text fontSize="12px" color="gray.400" fontStyle="italic" mt={2}>
            Student did not select an option.
          </Text>
        )}
      </Box>
    );
  }

  if (studentAnswer && studentAnswer.startsWith("{")) {
    try {
      const parsed = JSON.parse(studentAnswer);
      const entries = Object.entries(parsed);
      if (entries.length > 0) {
        return (
          <Box>
            {entries.map(([left, right], i) => (
              <Flex key={i} alignItems="center" gap={3} mb={2}>
                <Box
                  flex={1}
                  bg="#F7F9FC"
                  border="1px solid #E2E8F0"
                  borderRadius="6px"
                  px={3}
                  py={2}
                  fontSize="13px"
                >
                  {left}
                </Box>
                <Text color="gray.400" fontSize="12px">
                  →
                </Text>
                <Box
                  flex={1}
                  bg="white"
                  border="1px solid #E2E8F0"
                  borderRadius="6px"
                  px={3}
                  py={2}
                  fontSize="13px"
                  fontWeight="500"
                >
                  {right || <em style={{ color: "#CBD5E0" }}>blank</em>}
                </Box>
              </Flex>
            ))}
          </Box>
        );
      }
    } catch {
      /* fall through */
    }
  }

  if (!studentAnswer) {
    return (
      <Text fontSize="14px" color="gray.400" fontStyle="italic">
        No answer submitted
      </Text>
    );
  }
  return (
    <Text
      fontSize="14px"
      color="#1A202C"
      whiteSpace="pre-wrap"
      lineHeight="1.7"
    >
      {studentAnswer}
    </Text>
  );
};

/* ─── Main component ────────────────────────────────── */
const ExamManualGradingPage = () => {
  const { courseId, moduleId, examinationId, studentId } = useParams();
  const { push, goBack } = useHistory();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [grades, setGrades] = useState({});

  const summaryHref = `/admin/courses/${courseId}/module/${moduleId}/examinations/${examinationId}/grading`;

  useEffect(() => {
    setLoading(true);
    adminGetStudentAnswerSheet(examinationId, studentId)
      .then(({ answerSheet: data }) => {
        setSheet(data);
        const initial = {};
        (data?.questions || []).forEach((q) => {
          initial[q.questionId] = {
            score: q.scoreAssigned != null ? String(q.scoreAssigned) : "",
            remark: q.remark || "",
            saving: false,
            saved: q.gradingStatus === "completed",
          };
        });
        setGrades(initial);
        const firstManual = (data?.questions || []).findIndex(
          (q) => q.markingType === "manual" && q.gradingStatus !== "completed",
        );
        if (firstManual >= 0) setCurrentQIdx(firstManual);
      })
      .catch((err) => setError(err.message || "Failed to load answer sheet"))
      .finally(() => setLoading(false));
  }, [examinationId, studentId]);

  const questions = useMemo(() => sheet?.questions || [], [sheet]);
  const currentQna = questions[currentQIdx] || null;
  const isManualQ = currentQna?.markingType === "manual";
  const currentGrade = grades[currentQna?.questionId] || {
    score: "",
    remark: "",
    saving: false,
    saved: false,
  };

  const totalManual = questions.filter(
    (q) => q.markingType === "manual",
  ).length;
  const gradedCount = questions.filter(
    (q) => q.markingType === "manual" && grades[q.questionId]?.saved,
  ).length;

  const totalScore = questions.reduce((sum, q) => {
    if (q.markingType === "manual") {
      const g = grades[q.questionId];
      return sum + (g?.saved ? Number(g.score) || 0 : 0);
    }
    return sum + (Number(q.scoreAssigned) || 0);
  }, 0);
  const totalMaxScore = questions.reduce(
    (sum, q) => sum + (Number(q.marks) || 0),
    0,
  );

  const updateGrade = (field, value) => {
    if (!currentQna) return;
    setGrades((prev) => ({
      ...prev,
      [currentQna.questionId]: {
        ...prev[currentQna.questionId],
        [field]: value,
        saved: false,
      },
    }));
  };

  const handleSave = useCallback(
    async (andNext = false) => {
      if (!currentQna || !isManualQ) return;
      const g = grades[currentQna.questionId] || {};

      setGrades((prev) => ({
        ...prev,
        [currentQna.questionId]: {
          ...prev[currentQna.questionId],
          saving: true,
        },
      }));

      try {
        await adminSubmitManualGrade({
          studentId,
          examId: examinationId,
          questionId: currentQna.questionId,
          score: Number(g.score) || 0,
          remark: g.remark || "",
          gradingStatus: "completed",
        });

        setGrades((prev) => ({
          ...prev,
          [currentQna.questionId]: {
            ...prev[currentQna.questionId],
            saving: false,
            saved: true,
          },
        }));

        if (andNext) {
          const nextIdx = questions.findIndex(
            (q, i) =>
              i > currentQIdx &&
              q.markingType === "manual" &&
              !grades[q.questionId]?.saved,
          );
          if (nextIdx >= 0) {
            setCurrentQIdx(nextIdx);
          } else {
            toast({
              description: "All manual questions graded!",
              status: "success",
              position: "top",
            });
          }
        }
      } catch (err) {
        setGrades((prev) => ({
          ...prev,
          [currentQna.questionId]: {
            ...prev[currentQna.questionId],
            saving: false,
          },
        }));
        toast({
          description: capitalizeFirstLetter(
            err?.response?.data?.message || err.message || "Failed to save",
          ),
          status: "error",
          position: "top",
        });
      }
    },
    [
      currentQna,
      currentQIdx,
      grades,
      isManualQ,
      questions,
      studentId,
      examinationId,
      toast,
    ],
  );

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Text color="red.500" mb={4}>
          {capitalizeFirstLetter(error)}
        </Text>
        <Button secondary onClick={goBack}>
          Go Back
        </Button>
      </Box>
    );
  }

  const fullName =
    [sheet?.student?.firstName, sheet?.student?.lastName]
      .filter(Boolean)
      .join(" ") || "—";

  return (
    <Box minH="calc(100vh - 160px)" display="flex" flexDirection="column">
      {/* ── Sticky header bar ── */}
      <Box
        bg="white"
        borderBottom="1px solid #E2E8F0"
        px={6}
        py={3}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex alignItems="center" gap={4} flexWrap="wrap">
          <Flex
            as="button"
            onClick={() => push(summaryHref)}
            alignItems="center"
            gap={2}
            color="#6b006b"
            _hover={{ opacity: 0.8 }}
          >
            <FiArrowLeft size={14} />
            <Text fontSize="sm" fontWeight="600">
              Summary
            </Text>
          </Flex>

          <Box w="1px" h="20px" bg="#E2E8F0" />

          <Flex alignItems="center" gap={2} flex={1}>
            <Box
              w="32px"
              h="32px"
              bg="#F0E6FF"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <FiUser color="#6b006b" size={14} />
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="700" color="#1A202C">
                {fullName}
              </Text>
              <Text fontSize="11px" color="gray.400">
                {sheet?.student?.email || ""}
              </Text>
            </Box>
          </Flex>

          <Flex alignItems="center" gap={2}>
            <Text
              fontSize="11px"
              color="gray.400"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Total
            </Text>
            <Text fontSize="14px" fontWeight="700" color="#1A202C">
              {totalScore} / {totalMaxScore}
            </Text>
          </Flex>

          <Flex alignItems="center" gap={3}>
            <Text fontSize="12px" color="gray.500" fontWeight="500">
              {gradedCount}/{totalManual} graded
            </Text>
            <Progress
              value={totalManual ? (gradedCount / totalManual) * 100 : 0}
              w="80px"
              size="sm"
              borderRadius="4px"
              colorScheme="purple"
            />
          </Flex>

          <Flex gap={1}>
            <Box
              as="button"
              w="28px"
              h="28px"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: "#F7F9FC" }}
              onClick={goBack}
              title="Previous student"
            >
              <FiChevronLeft size={14} color="#718096" />
            </Box>
            <Box
              as="button"
              w="28px"
              h="28px"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: "#F7F9FC" }}
              onClick={goBack}
              title="Next student"
            >
              <FiChevronRight size={14} color="#718096" />
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* ── 3-column body ── */}
      <Grid
        templateColumns={{ base: "1fr", lg: "210px 1fr 320px" }}
        flex={1}
        minH="0"
      >
        {/* Left: Question nav rail */}
        <Box
          borderRight="1px solid #E2E8F0"
          bg="#FAFAFA"
          overflowY="auto"
          display={{ base: "none", lg: "block" }}
        >
          <Box px={4} py={3} borderBottom="1px solid #E2E8F0">
            <Text
              fontSize="10px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Questions ({questions.length})
            </Text>
          </Box>

          {questions.map((q, idx) => {
            const isManual = q.markingType === "manual";
            const saved = grades[q.questionId]?.saved;
            const isCurrent = idx === currentQIdx;
            const typeLabel = inferTypeLabel(q);

            return (
              <Box
                key={q.questionId}
                as="button"
                w="100%"
                textAlign="left"
                px={4}
                py={3}
                borderBottom="1px solid #E2E8F0"
                borderLeft={
                  isCurrent ? "3px solid #6b006b" : "3px solid transparent"
                }
                bg={isCurrent ? "#F0E6FF" : "transparent"}
                _hover={{ bg: isCurrent ? "#F0E6FF" : "#F7F9FC" }}
                onClick={() => setCurrentQIdx(idx)}
                transition="background 0.15s"
              >
                <Flex alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      color={isCurrent ? "#6b006b" : "#1A202C"}
                      lineHeight="1.2"
                    >
                      Q{idx + 1}
                    </Text>
                    <Text fontSize="10px" color="gray.400" mt="2px">
                      {typeLabel}
                    </Text>
                    {q.section && (
                      <Text
                        fontSize="10px"
                        color="gray.300"
                        mt="1px"
                        noOfLines={1}
                      >
                        {q.section}
                      </Text>
                    )}
                  </Box>

                  {isManual ? (
                    saved ? (
                      <Box
                        w="18px"
                        h="18px"
                        bg="#38A169"
                        borderRadius="50%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <FiCheck color="white" size={10} />
                      </Box>
                    ) : (
                      <Box
                        w="18px"
                        h="18px"
                        bg="#E2E8F0"
                        borderRadius="50%"
                        flexShrink={0}
                      />
                    )
                  ) : (
                    <Badge colorScheme="blue" fontSize="9px" px="4px">
                      Auto
                    </Badge>
                  )}
                </Flex>
              </Box>
            );
          })}
        </Box>

        {/* Center: Question + Student answer */}
        <Box overflowY="auto" p={6} bg="white">
          {currentQna && (
            <>
              {/* Meta badges */}
              <Flex gap={2} mb={4} flexWrap="wrap">
                <Badge
                  colorScheme={isManualQ ? "purple" : "blue"}
                  fontSize="11px"
                  px={2}
                >
                  {inferTypeLabel(currentQna)}
                </Badge>
                <Badge
                  colorScheme={isManualQ ? "orange" : "green"}
                  variant="outline"
                  fontSize="11px"
                  px={2}
                >
                  {currentQna.markingType}
                </Badge>
                {currentQna.marks != null && (
                  <Badge
                    variant="outline"
                    colorScheme="gray"
                    fontSize="11px"
                    px={2}
                  >
                    {currentQna.marks} mark{currentQna.marks !== 1 ? "s" : ""}
                  </Badge>
                )}
                {currentQna.section && (
                  <Badge
                    variant="outline"
                    colorScheme="gray"
                    fontSize="11px"
                    px={2}
                  >
                    {currentQna.section}
                  </Badge>
                )}
              </Flex>

              {/* Question text */}
              <Box
                mb={5}
                p={4}
                bg="#F7F9FC"
                borderRadius="8px"
                borderLeft="3px solid #6b006b"
              >
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={2}
                >
                  Question
                </Text>
                <RichTextToView text={currentQna.question} />
              </Box>

              {/* Student answer */}
              <Box
                mb={4}
                p={4}
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="8px"
              >
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={3}
                >
                  Student&apos;s Answer
                </Text>
                <AnswerDisplay q={currentQna} />
              </Box>

              {/* Auto-graded info */}
              {!isManualQ && (
                <Box
                  p={4}
                  bg="#EBF4FF"
                  border="1px solid #BEE3F8"
                  borderRadius="8px"
                >
                  <Text fontSize="12px" fontWeight="600" color="#2B6CB0">
                    Auto-graded — {currentQna.scoreAssigned ?? "—"} /{" "}
                    {currentQna.marks ?? "—"}
                  </Text>
                  {currentQna.isCorrect != null && (
                    <Text
                      fontSize="12px"
                      color={currentQna.isCorrect ? "#38A169" : "#E53E3E"}
                      mt={1}
                    >
                      {currentQna.isCorrect
                        ? "Correct answer"
                        : "Incorrect answer"}
                    </Text>
                  )}
                </Box>
              )}

              {/* Mobile: inline grading panel */}
              <Box display={{ base: "block", lg: "none" }} mt={6}>
                <GradingPanelContent
                  isManualQ={isManualQ}
                  currentGrade={currentGrade}
                  maxMarks={currentQna?.marks}
                  onScoreChange={(v) => updateGrade("score", v)}
                  onRemarkChange={(v) => updateGrade("remark", v)}
                  onSave={() => handleSave(false)}
                  onSaveAndNext={() => handleSave(true)}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Right: Grading panel (desktop) */}
        <Box
          borderLeft="1px solid #E2E8F0"
          bg="#FAFAFA"
          display={{ base: "none", lg: "flex" }}
          flexDirection="column"
        >
          <Box flex={1} overflowY="auto" p={5}>
            <GradingPanelContent
              isManualQ={isManualQ}
              currentGrade={currentGrade}
              maxMarks={currentQna?.marks}
              onScoreChange={(v) => updateGrade("score", v)}
              onRemarkChange={(v) => updateGrade("remark", v)}
              onSave={() => handleSave(false)}
              onSaveAndNext={() => handleSave(true)}
            />
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

/* ─── Grading panel (shared desktop + mobile) ─────── */
const GradingPanelContent = ({
  isManualQ,
  currentGrade,
  maxMarks,
  onScoreChange,
  onRemarkChange,
  onSave,
  onSaveAndNext,
}) => {
  if (!isManualQ) {
    return (
      <Box p={4} bg="#EBF4FF" borderRadius="8px" mt={2}>
        <Text fontSize="13px" color="#2B6CB0" fontWeight="500">
          This question is auto-graded. No manual scoring needed.
        </Text>
      </Box>
    );
  }

  if (currentGrade.saved) {
    return (
      <>
        <Flex alignItems="center" justifyContent="space-between" mb={4}>
          <Text
            fontSize="10px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Grade
          </Text>
          <Flex alignItems="center" gap={1}>
            <FiCheck color="#38A169" size={11} />
            <Text fontSize="11px" color="#38A169" fontWeight="600">
              Graded
            </Text>
          </Flex>
        </Flex>

        <Box mb={4}>
          <Text fontSize="sm" fontWeight="600" color="#1A202C" mb={1}>
            Marks
          </Text>
          <Text fontSize="24px" fontWeight="700" color="#1A202C">
            {currentGrade.score || 0}
            {maxMarks != null && (
              <Text as="span" fontSize="sm" color="gray.400" fontWeight="500">
                {" "}
                / {maxMarks}
              </Text>
            )}
          </Text>
        </Box>

        <Box w="100%" h="1px" bg="#E2E8F0" mb={4} />

        <Box mb={4}>
          <Text fontSize="sm" fontWeight="600" color="#1A202C" mb={2}>
            Feedback to student
          </Text>
          <Text
            fontSize="13px"
            color={currentGrade.remark ? "#1A202C" : "gray.400"}
            fontStyle={currentGrade.remark ? "normal" : "italic"}
            whiteSpace="pre-wrap"
            lineHeight="1.6"
          >
            {currentGrade.remark || "No feedback given."}
          </Text>
        </Box>

        <Box
          p={3}
          bg="#F0FFF4"
          border="1px solid #9AE6B4"
          borderRadius="6px"
        >
          <Text fontSize="11px" color="#276749">
            This question has been graded and can no longer be edited.
          </Text>
        </Box>
      </>
    );
  }

  const scoreNum = parseFloat(currentGrade.score);
  const maxNum = parseFloat(maxMarks);

  const quickMarks = [
    { label: "0", value: 0 },
    { label: "Half", value: maxMarks != null ? Math.floor(maxNum / 2) : null },
    { label: "Full", value: maxMarks != null ? maxNum : null },
  ].filter((b) => b.value != null);

  return (
    <>
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

      {/* Score input */}
      <Box mb={4}>
        <Flex alignItems="baseline" gap={2} mb={2}>
          <Text fontSize="sm" fontWeight="600" color="#1A202C">
            Marks
          </Text>
          {maxMarks != null && (
            <Text fontSize="xs" color="gray.400">
              / {maxMarks}
            </Text>
          )}
        </Flex>
        <input
          type="number"
          min={0}
          max={maxMarks != null ? maxMarks : undefined}
          value={currentGrade.score}
          onChange={(e) => onScoreChange(e.target.value)}
          style={{
            border: "1px solid #E2E8F0",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 20,
            fontWeight: 700,
            width: "100%",
            background: "white",
            outline: "none",
          }}
        />
        {maxMarks != null && !isNaN(scoreNum) && scoreNum > maxNum && (
          <Text fontSize="11px" color="red.500" mt={1}>
            Score exceeds maximum ({maxMarks})
          </Text>
        )}
      </Box>

      {/* Quick mark buttons */}
      {quickMarks.length > 0 && (
        <Flex gap={2} mb={5}>
          {quickMarks.map((btn) => {
            const isActive = String(currentGrade.score) === String(btn.value);
            return (
              <Box
                key={btn.label}
                as="button"
                flex={1}
                py={2}
                borderRadius="6px"
                border="1px solid"
                borderColor={isActive ? "#6b006b" : "#E2E8F0"}
                bg={isActive ? "#6b006b" : "white"}
                color={isActive ? "white" : "#1A202C"}
                fontSize="12px"
                fontWeight="600"
                _hover={{ bg: isActive ? "#560056" : "#F7F9FC" }}
                onClick={() => onScoreChange(String(btn.value))}
                transition="all 0.15s"
              >
                {btn.label}
              </Box>
            );
          })}
        </Flex>
      )}

      <Box w="100%" h="1px" bg="#E2E8F0" mb={4} />

      {/* Feedback */}
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="600" color="#1A202C" mb={2}>
          Feedback to student
        </Text>
        <textarea
          value={currentGrade.remark}
          onChange={(e) => onRemarkChange(e.target.value)}
          placeholder="Optional feedback or comments for the student..."
          rows={5}
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

      {/* Action buttons */}
      <Box pt={4} borderTop="1px solid #E2E8F0" mt={2}>
        <Flex gap={3} mb={2}>
          <Button
            secondary
            onClick={onSave}
            isLoading={currentGrade.saving}
            flex={1}
            type="button"
          >
            Save
          </Button>
          <Button
            onClick={onSaveAndNext}
            isLoading={currentGrade.saving}
            flex={2}
            type="button"
          >
            Save &amp; Next
          </Button>
        </Flex>
        {currentGrade.saved && (
          <Flex justifyContent="center" alignItems="center" gap={1} mt={1}>
            <FiCheck color="#38A169" size={11} />
            <Text fontSize="11px" color="#38A169">
              Saved
            </Text>
          </Flex>
        )}
      </Box>
    </>
  );
};

export const ExamManualGradingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamManualGradingPage {...props} />} />
);

export default ExamManualGradingPageRoute;
