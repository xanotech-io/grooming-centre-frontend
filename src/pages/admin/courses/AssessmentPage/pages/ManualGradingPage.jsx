import { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Badge,
  Grid,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import { Heading, Text, Button } from "../../../../../components";
import { RichTextToView } from "../../../../../components";
import { getAnswerSheet, manualGradeQuestion } from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";
import { useToast } from "@chakra-ui/toast";
import { FiArrowLeft, FiCheck, FiUser, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const MANUAL_TYPES = ["Essay", "ShortAnswer"];

const statusColor = (saved) =>
  saved
    ? { bg: "#E6F4EA", color: "#38A169" }
    : { bg: "#F7FAFC", color: "#718096" };

/* ─── Answer renderer by question type ─────────────── */
const AnswerDisplay = ({ questionType, answer }) => {
  if (!answer) return <Text fontSize="14px" color="gray.400" fontStyle="italic">No answer submitted</Text>;

  if (questionType === "Matching") {
    let parsed = {};
    try { parsed = JSON.parse(answer); } catch { return <Text fontSize="14px" color="#1A202C" whiteSpace="pre-wrap">{answer}</Text>; }
    return (
      <Box>
        {Object.entries(parsed).map(([left, right], i) => (
          <Flex key={i} alignItems="center" gap={3} mb={2}>
            <Box flex={1} bg="#F7F9FC" border="1px solid #E2E8F0" borderRadius="6px" px={3} py={2} fontSize="13px">{left}</Box>
            <Text color="gray.400" fontSize="12px">→</Text>
            <Box flex={1} bg="white" border="1px solid #E2E8F0" borderRadius="6px" px={3} py={2} fontSize="13px" fontWeight="500">{right || <em style={{ color: "#CBD5E0" }}>blank</em>}</Box>
          </Flex>
        ))}
      </Box>
    );
  }

  return (
    <Text fontSize="14px" color="#1A202C" whiteSpace="pre-wrap" lineHeight="1.7">{answer}</Text>
  );
};

/* ─── Main component ────────────────────────────────── */
const ManualGradingPage = () => {
  const { id: courseId, assessmentId, studentId } = useParams();
  const { push, goBack } = useHistory();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  // grades[questionId] = { score, remark, saving, saved }
  const [grades, setGrades] = useState({});

  useEffect(() => {
    setLoading(true);
    getAnswerSheet(assessmentId, studentId)
      .then(({ sheet: data }) => {
        setSheet(data);
        const initial = {};
        (data?.answers || []).forEach((a) => {
          initial[a.questionId] = {
            score: a.score != null ? String(a.score) : "",
            remark: a.remark || "",
            saving: false,
            saved: a.gradingStatus === "completed",
          };
        });
        setGrades(initial);
        // Auto-jump to first ungraded manual question
        const firstManual = (data?.questions || []).findIndex((q) =>
          MANUAL_TYPES.includes(q.questionType)
        );
        if (firstManual >= 0) setCurrentQIdx(firstManual);
      })
      .catch((err) => setError(err.message || "Failed to load answer sheet"))
      .finally(() => setLoading(false));
  }, [assessmentId, studentId]);

  const qnaList = (sheet?.questions || []).map((q) => ({
    ...q,
    answer: (sheet?.answers || []).find((a) => a.questionId === q.id),
  }));

  const currentQna = qnaList[currentQIdx] || null;
  const isManualQ = currentQna ? MANUAL_TYPES.includes(currentQna.questionType) : false;
  const currentGrade = grades[currentQna?.id] || { score: "", remark: "", saving: false, saved: false };

  const totalManual = qnaList.filter((q) => MANUAL_TYPES.includes(q.questionType)).length;
  const gradedCount = qnaList.filter(
    (q) => MANUAL_TYPES.includes(q.questionType) && grades[q.id]?.saved
  ).length;

  const updateGrade = (field, value) => {
    if (!currentQna) return;
    setGrades((prev) => ({
      ...prev,
      [currentQna.id]: { ...prev[currentQna.id], [field]: value, saved: false },
    }));
  };

  const handleSave = useCallback(
    async (andNext = false) => {
      if (!currentQna || !isManualQ) return;
      const g = grades[currentQna.id] || {};

      setGrades((prev) => ({
        ...prev,
        [currentQna.id]: { ...prev[currentQna.id], saving: true },
      }));

      try {
        await manualGradeQuestion({
          studentId,
          assessmentId,
          questionId: currentQna.id,
          score: Number(g.score) || 0,
          remark: g.remark || "",
          gradingStatus: "completed",
        });

        setGrades((prev) => ({
          ...prev,
          [currentQna.id]: { ...prev[currentQna.id], saving: false, saved: true },
        }));

        if (andNext) {
          const nextIdx = qnaList.findIndex(
            (q, i) =>
              i > currentQIdx &&
              MANUAL_TYPES.includes(q.questionType) &&
              !grades[q.id]?.saved
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
          [currentQna.id]: { ...prev[currentQna.id], saving: false },
        }));
        toast({
          description: capitalizeFirstLetter(err?.response?.data?.message || err.message || "Failed to save"),
          status: "error",
          position: "top",
        });
      }
    },
    [currentQna, currentQIdx, grades, isManualQ, qnaList, studentId, assessmentId, toast]
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
        <Text color="red.500" mb={4}>{capitalizeFirstLetter(error)}</Text>
        <Button secondary onClick={goBack}>Go Back</Button>
      </Box>
    );
  }

  const fullName =
    [sheet?.student?.firstName, sheet?.student?.lastName].filter(Boolean).join(" ") || "—";

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
            onClick={() =>
              push(`/admin/courses/${courseId}/assessment/${assessmentId}/grading`)
            }
            alignItems="center"
            gap={2}
            color="#6b006b"
            _hover={{ opacity: 0.8 }}
          >
            <FiArrowLeft size={14} />
            <Text fontSize="sm" fontWeight="600">Queue</Text>
          </Flex>

          <Box w="1px" h="20px" bg="#E2E8F0" />

          <Flex alignItems="center" gap={2} flex={1}>
            <Box
              w="32px" h="32px"
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
              <Text fontSize="13px" fontWeight="700" color="#1A202C">{fullName}</Text>
              <Text fontSize="11px" color="gray.400">{sheet?.student?.email || ""}</Text>
            </Box>
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

          {/* Prev / Next student arrows (placeholder — extend with queue list) */}
          <Flex gap={1}>
            <Box
              as="button"
              w="28px" h="28px"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: "#F7F9FC" }}
              onClick={goBack}
            >
              <FiChevronLeft size={14} color="#718096" />
            </Box>
            <Box
              as="button"
              w="28px" h="28px"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: "#F7F9FC" }}
              onClick={goBack}
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
              Questions ({qnaList.length})
            </Text>
          </Box>

          {qnaList.map((q, idx) => {
            const isManual = MANUAL_TYPES.includes(q.questionType);
            const saved = grades[q.id]?.saved;
            const isCurrent = idx === currentQIdx;

            return (
              <Box
                key={q.id}
                as="button"
                w="100%"
                textAlign="left"
                px={4}
                py={3}
                borderBottom="1px solid #E2E8F0"
                borderLeft={isCurrent ? "3px solid #6b006b" : "3px solid transparent"}
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
                      {q.questionType}
                    </Text>
                  </Box>

                  {isManual ? (
                    saved ? (
                      <Box
                        w="18px" h="18px"
                        bg="#38A169"
                        borderRadius="50%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiCheck color="white" size={10} />
                      </Box>
                    ) : (
                      <Box w="18px" h="18px" bg="#E2E8F0" borderRadius="50%" />
                    )
                  ) : (
                    <Badge colorScheme="blue" fontSize="9px" px="4px">Auto</Badge>
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
                  {currentQna.questionType}
                </Badge>
                {currentQna.maxMarks != null && (
                  <Badge variant="outline" colorScheme="gray" fontSize="11px" px={2}>
                    {currentQna.maxMarks} mark{currentQna.maxMarks !== 1 ? "s" : ""}
                  </Badge>
                )}
                {currentQna.section && (
                  <Badge variant="outline" colorScheme="gray" fontSize="11px" px={2}>
                    {currentQna.section}
                  </Badge>
                )}
                {currentQna.difficultyLevel && (
                  <Badge variant="outline" colorScheme="gray" fontSize="11px" px={2}>
                    {currentQna.difficultyLevel}
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
                  Student's Answer
                </Text>
                <AnswerDisplay
                  questionType={currentQna.questionType}
                  answer={currentQna.answer?.answer}
                />
              </Box>

              {/* Model answer / rubric */}
              {(currentQna.modelAnswer || currentQna.rubric) && (
                <Box
                  p={4}
                  bg="#FFFFF0"
                  border="1px solid #ECC94B"
                  borderRadius="8px"
                  mb={4}
                >
                  {currentQna.modelAnswer && (
                    <>
                      <Text
                        fontSize="10px"
                        fontWeight="700"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={2}
                      >
                        Model Answer
                      </Text>
                      <Text fontSize="13px" color="#1A202C" mb={currentQna.rubric ? 3 : 0}>
                        {currentQna.modelAnswer}
                      </Text>
                    </>
                  )}
                  {currentQna.rubric && (
                    <>
                      <Text
                        fontSize="10px"
                        fontWeight="700"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={2}
                      >
                        Rubric
                      </Text>
                      <Text fontSize="13px" color="#1A202C">{currentQna.rubric}</Text>
                    </>
                  )}
                </Box>
              )}

              {/* Auto-graded info for objective questions */}
              {!isManualQ && currentQna.answer && (
                <Box
                  p={4}
                  bg="#EBF4FF"
                  border="1px solid #BEE3F8"
                  borderRadius="8px"
                >
                  <Text fontSize="12px" fontWeight="600" color="#2B6CB0">
                    Auto-graded — {currentQna.answer.autoScore ?? currentQna.answer.score ?? "—"} / {currentQna.maxMarks ?? "—"}
                  </Text>
                  {currentQna.answer.isCorrect != null && (
                    <Text
                      fontSize="12px"
                      color={currentQna.answer.isCorrect ? "#38A169" : "#E53E3E"}
                      mt={1}
                    >
                      {currentQna.answer.isCorrect ? "Correct answer" : "Incorrect answer"}
                    </Text>
                  )}
                </Box>
              )}

              {/* Mobile: show grading panel inline */}
              <Box display={{ base: "block", lg: "none" }} mt={6}>
                <GradingPanelContent
                  isManualQ={isManualQ}
                  currentGrade={currentGrade}
                  maxMarks={currentQna?.maxMarks}
                  onScoreChange={(v) => updateGrade("score", v)}
                  onRemarkChange={(v) => updateGrade("remark", v)}
                  onSave={() => handleSave(false)}
                  onSaveAndNext={() => handleSave(true)}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Right: Grading panel (desktop sticky) */}
        <Box
          borderLeft="1px solid #E2E8F0"
          bg="#FAFAFA"
          display={{ base: "none", lg: "flex" }}
          flexDirection="column"
          position="relative"
        >
          <Box flex={1} overflowY="auto" p={5}>
            <GradingPanelContent
              isManualQ={isManualQ}
              currentGrade={currentGrade}
              maxMarks={currentQna?.maxMarks}
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
          <Text fontSize="sm" fontWeight="600" color="#1A202C">Marks</Text>
          {maxMarks != null && (
            <Text fontSize="xs" color="gray.400">/ {maxMarks}</Text>
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
      <Box
        pt={4}
        borderTop="1px solid #E2E8F0"
        mt={2}
      >
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
            Save & Next
          </Button>
        </Flex>
        {currentGrade.saved && (
          <Flex justifyContent="center" alignItems="center" gap={1} mt={1}>
            <FiCheck color="#38A169" size={11} />
            <Text fontSize="11px" color="#38A169">Saved</Text>
          </Flex>
        )}
      </Box>
    </>
  );
};

const ManualGradingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ManualGradingPage {...props} />} />
);

export default ManualGradingPageRoute;
