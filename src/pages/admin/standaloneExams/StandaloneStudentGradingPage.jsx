import { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Grid, Progress, Spinner, Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Text, Button, Breadcrumb, Link } from "../../../components";
import { RichTextToView } from "../../../components";
import { getSAExamAnswerSheet, saExamManualGrade } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { useToast } from "@chakra-ui/toast";
import { FiArrowLeft, FiCheck, FiUser } from "react-icons/fi";

/* ─── Grading panel ────────────────────────────────────── */
const GradingPanel = ({ question, examId, studentId, onSaved }) => {
  const toast = useToast();
  const alreadyGraded =
    question.gradingStatus?.toLowerCase() !== "pending" &&
    question.scoreAssigned != null;
  const [score, setScore] = useState(
    alreadyGraded ? String(question.scoreAssigned) : "",
  );
  const [remark, setRemark] = useState(question.remark ?? "");
  const [gradingStatus, setGradingStatus] = useState(
    alreadyGraded
      ? question.gradingStatus?.toLowerCase() === "completed"
        ? "completed"
        : "in_progress"
      : "in_progress",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(alreadyGraded);

  const maxScore = question.maxScore ?? 0;
  const scoreNum = parseFloat(score);
  const quickMarks = [
    { label: "0", value: 0 },
    { label: "Half", value: Math.floor(maxScore / 2) },
    { label: "Full", value: maxScore },
  ];

  const handleSave = async () => {
    if (score === "" || score === null) {
      toast({
        description: "Please enter a score.",
        status: "warning",
        position: "top",
      });
      return;
    }
    if (!isNaN(scoreNum) && (scoreNum < 0 || scoreNum > maxScore)) {
      toast({
        description: `Score must be between 0 and ${maxScore}.`,
        status: "warning",
        position: "top",
      });
      return;
    }

    setSaving(true);
    try {
      await saExamManualGrade({
        examId,
        studentId,
        questionId: question.questionId,
        score: Number(score),
        remark: remark.trim() || "",
        gradingStatus,
      });

      setSaved(true);
      toast({ description: "Mark saved.", status: "success", position: "top" });
      onSaved();
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed to save",
        ),
        status: "error",
        position: "top",
      });
    } finally {
      setSaving(false);
    }
  };

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

      <Box mb={4}>
        <Flex alignItems="baseline" gap={2} mb={2}>
          <Text fontSize="sm" fontWeight="600" color="#1A202C">
            Marks
          </Text>
          <Text fontSize="xs" color="gray.400">
            / {maxScore}
          </Text>
        </Flex>
        <input
          type="number"
          min={0}
          max={maxScore}
          value={score}
          onChange={(e) => {
            setScore(e.target.value);
            setSaved(false);
          }}
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
        {!isNaN(scoreNum) && scoreNum > maxScore && (
          <Text fontSize="11px" color="red.500" mt={1}>
            Score exceeds maximum ({maxScore})
          </Text>
        )}
      </Box>

      <Flex gap={2} mb={5}>
        {quickMarks.map((btn) => {
          const isActive = String(score) === String(btn.value);
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
              onClick={() => {
                setScore(String(btn.value));
                setSaved(false);
              }}
            >
              {btn.label}
            </Box>
          );
        })}
      </Flex>

      <Box w="100%" h="1px" bg="#E2E8F0" mb={4} />

      <Box mb={4}>
        <Text fontSize="sm" fontWeight="600" color="#1A202C" mb={2}>
          Status
        </Text>
        <Flex gap={2} mb={3}>
          {["in_progress", "completed"].map((s) => (
            <Box
              key={s}
              as="button"
              flex={1}
              py={2}
              borderRadius="6px"
              border="1px solid"
              borderColor={gradingStatus === s ? "#6b006b" : "#E2E8F0"}
              bg={gradingStatus === s ? "#6b006b" : "white"}
              color={gradingStatus === s ? "white" : "#1A202C"}
              fontSize="12px"
              fontWeight="600"
              onClick={() => setGradingStatus(s)}
            >
              {s === "in_progress" ? "In Progress" : "Completed"}
            </Box>
          ))}
        </Flex>
        {gradingStatus === "completed" && (
          <Box
            bg="green.50"
            border="1px solid"
            borderColor="green.200"
            borderRadius="6px"
            px={3}
            py={2}
          >
            <Text fontSize="11px" color="green.700">
              Score aggregation will be triggered after saving.
            </Text>
          </Box>
        )}
      </Box>

      <Box mb={4}>
        <Text fontSize="sm" fontWeight="600" color="#1A202C" mb={2}>
          Feedback to student
        </Text>
        <textarea
          value={remark}
          onChange={(e) => {
            setRemark(e.target.value);
            setSaved(false);
          }}
          placeholder="Optional feedback or comments…"
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

      <Box pt={4} borderTop="1px solid #E2E8F0">
        <Button onClick={handleSave} isLoading={saving} w="100%" type="button">
          {saved ? "Update" : "Save"}
        </Button>
        {saved && (
          <Flex justifyContent="center" alignItems="center" gap={1} mt={2}>
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

/* ─── Main page ────────────────────────────────────────── */
const StandaloneStudentGradingPage = () => {
  const { examId, studentId } = useParams();
  const { push } = useHistory();

  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    getSAExamAnswerSheet(examId, studentId)
      .then(({ sheet: data }) => {
        setSheet(data);
        const firstPending = (data?.questions || []).findIndex(
          (q) => q.gradingStatus?.toLowerCase() === "pending",
        );
        if (firstPending >= 0) setCurrentQIdx(firstPending);
      })
      .catch((err) => setError(err.message || "Failed to load answer sheet"))
      .finally(() => setLoading(false));
  }, [examId, studentId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const questions = sheet?.questions || [];
  const currentQ = questions[currentQIdx] || null;

  const totalQ = questions.length;
  const gradedCount = questions.filter(
    (q) =>
      q.gradingStatus?.toLowerCase() !== "pending" && q.scoreAssigned != null,
  ).length;

  const handleSaved = () => setRefreshKey((k) => k + 1);

  if (loading)
    return (
      <Flex justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );

  if (error) {
    return (
      <Box p={6}>
        <Text color="red.500" mb={4}>
          {capitalizeFirstLetter(error)}
        </Text>
        <Button
          secondary
          onClick={() => push(`/admin/standalone-exams/view/${examId}`)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const studentFullName =
    [sheet?.student?.firstName, sheet?.student?.lastName]
      .filter(Boolean)
      .join(" ") || "—";

  return (
    <Box minH="calc(100vh - 160px)" display="flex" flexDirection="column">
      <Flex justify="space-between" align="center" mb={6} px={6} pt={4}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/standalone-exams">Standalone Exams</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Grade Student</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Sticky header */}
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
            onClick={() => push(`/admin/standalone-exams/view/${examId}`)}
            alignItems="center"
            gap={2}
            color="#6b006b"
            _hover={{ opacity: 0.8 }}
          >
            <FiArrowLeft size={14} />
            <Text fontSize="sm" fontWeight="600">
              Exam
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
                {studentFullName}
              </Text>
              <Flex gap={3} mt="2px">
                {sheet?.student?.email && (
                  <Text fontSize="11px" color="gray.400">
                    {sheet.student.email}
                  </Text>
                )}
                {sheet?.submissionTime && (
                  <Text fontSize="11px" color="gray.400">
                    {new Date(sheet.submissionTime).toLocaleString()}
                  </Text>
                )}
              </Flex>
            </Box>
          </Flex>

          <Flex alignItems="center" gap={3}>
            <Text fontSize="12px" color="gray.500" fontWeight="500">
              {gradedCount}/{totalQ} graded
            </Text>
            <Progress
              value={totalQ ? (gradedCount / totalQ) * 100 : 0}
              w="80px"
              size="sm"
              borderRadius="4px"
              colorScheme="purple"
            />
          </Flex>
        </Flex>
      </Box>

      {/* 3-column body */}
      <Grid
        templateColumns={{ base: "1fr", lg: "210px 1fr 320px" }}
        flex={1}
        minH="0"
      >
        {/* Left: question nav */}
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
              Questions ({totalQ})
            </Text>
          </Box>
          {questions.map((q, idx) => {
            const isGraded =
              q.gradingStatus?.toLowerCase() !== "pending" &&
              q.scoreAssigned != null;
            const isCurrent = idx === currentQIdx;
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
                    <Text
                      fontSize="10px"
                      color="gray.400"
                      mt="2px"
                      textTransform="capitalize"
                    >
                      {q.questionType || "Open"}
                    </Text>
                  </Box>
                  {isGraded ? (
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
                  )}
                </Flex>
              </Box>
            );
          })}
        </Box>

        {/* Center: question + student answer */}
        <Box overflowY="auto" p={6} bg="white">
          {currentQ && (
            <>
              <Flex gap={2} mb={4} flexWrap="wrap">
                <Badge
                  colorScheme="purple"
                  fontSize="11px"
                  px={2}
                  textTransform="capitalize"
                >
                  {currentQ.questionType || "Open"}
                </Badge>
                <Badge
                  fontSize="11px"
                  px={2}
                  colorScheme={
                    currentQ.gradingStatus?.toLowerCase() === "completed"
                      ? "green"
                      : currentQ.gradingStatus?.toLowerCase() === "in_progress"
                        ? "orange"
                        : "gray"
                  }
                  variant="outline"
                >
                  {currentQ.gradingStatus || "Pending"}
                </Badge>
                <Badge
                  variant="outline"
                  colorScheme="gray"
                  fontSize="11px"
                  px={2}
                >
                  {currentQ.maxScore ?? 0} mark
                  {currentQ.maxScore !== 1 ? "s" : ""}
                </Badge>
              </Flex>

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
                <RichTextToView text={currentQ.questionText} />
              </Box>

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
                {currentQ.studentAnswer ? (
                  <Text
                    fontSize="14px"
                    color="#1A202C"
                    whiteSpace="pre-wrap"
                    lineHeight="1.7"
                  >
                    {currentQ.studentAnswer}
                  </Text>
                ) : (
                  <Text fontSize="14px" color="gray.400" fontStyle="italic">
                    No answer submitted
                  </Text>
                )}
              </Box>

              {currentQ.gradingStatus?.toLowerCase() === "completed" &&
                currentQ.scoreAssigned != null && (
                  <Box
                    mb={4}
                    p={4}
                    bg="green.50"
                    border="1px solid"
                    borderColor="green.200"
                    borderRadius="8px"
                  >
                    <Text fontSize="12px" fontWeight="600" color="green.700">
                      Graded — {currentQ.scoreAssigned} /{" "}
                      {currentQ.maxScore ?? 0}
                    </Text>
                    {currentQ.remark && (
                      <Text fontSize="12px" color="green.600" mt={1}>
                        {currentQ.remark}
                      </Text>
                    )}
                  </Box>
                )}

              {/* Mobile grading panel */}
              <Box
                display={{ base: "block", lg: "none" }}
                mt={6}
                p={4}
                bg="#FAFAFA"
                border="1px solid #E2E8F0"
                borderRadius="8px"
              >
                <GradingPanel
                  question={currentQ}
                  examId={examId}
                  studentId={studentId}
                  onSaved={handleSaved}
                />
              </Box>
            </>
          )}

          {!currentQ && !loading && (
            <Flex justifyContent="center" alignItems="center" minH="200px">
              <Text color="gray.400">No questions to display.</Text>
            </Flex>
          )}
        </Box>

        {/* Right: grading panel (desktop) */}
        <Box
          borderLeft="1px solid #E2E8F0"
          bg="#FAFAFA"
          display={{ base: "none", lg: "flex" }}
          flexDirection="column"
        >
          <Box flex={1} overflowY="auto" p={5}>
            {currentQ ? (
              <GradingPanel
                key={currentQ.questionId}
                question={currentQ}
                examId={examId}
                studentId={studentId}
                onSaved={handleSaved}
              />
            ) : (
              <Text fontSize="13px" color="gray.400" mt={4}>
                Select a question to grade.
              </Text>
            )}
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export const StandaloneStudentGradingPageRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={(props) => <StandaloneStudentGradingPage {...props} />}
  />
);

export default StandaloneStudentGradingPageRoute;
