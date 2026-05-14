import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Spinner,
  IconButton,
  Badge,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  useToast,
  Select as ChakraSelect,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import { getStudentSubmission, submitManualMark, updateManualMark } from "../../../services";

const QuestionCard = ({ answer, index, onSave }) => {
  const markEntry = answer.markEntry;
  const [score, setScore] = useState(markEntry?.score ?? "");
  const [remark, setRemark] = useState(markEntry?.remark ?? "");
  const [gradingStatus, setGradingStatus] = useState(markEntry?.gradingStatus ?? "in_progress");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const maxMarks = answer.question?.maxMarks ?? answer.question?.marks ?? 0;
  const isGraded = !!markEntry;

  const handleSave = async () => {
    if (score === "" || score === null || score === undefined) {
      toast({ title: "Please enter a score", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    const numScore = Number(score);
    if (numScore < 0 || numScore > maxMarks) {
      toast({ title: `Score must be between 0 and ${maxMarks}`, status: "warning", duration: 2000, isClosable: true });
      return;
    }
    setSaving(true);
    try {
      if (isGraded) {
        await updateManualMark({
          markEntryId: markEntry.id,
          score: numScore,
          remark: remark.trim() || undefined,
          gradingStatus,
        });
      } else {
        await submitManualMark({
          submissionId: answer.submissionId,
          questionId: answer.questionId,
          score: numScore,
          remark: remark.trim() || undefined,
          gradingStatus,
        });
      }
      toast({ title: "Mark saved", status: "success", duration: 2000, isClosable: true });
      onSave();
    } catch {
      toast({ title: "Failed to save mark", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p={6} mb={4}>
      <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Flex alignItems="center" gap={3}>
          <Text fontWeight="600" fontSize="16px" color="#1A202C">
            Question {index + 1}
          </Text>
          {answer.question?.type && (
            <Badge bg="#F0E6FF" color="#6b006b" px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500" fontSize="12px">
              {answer.question.type}
            </Badge>
          )}
          {isGraded ? (
            <Badge bg="#E6F4EA" color="#38A169" px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500" fontSize="12px">
              Graded
            </Badge>
          ) : (
            <Badge bg="#FFF5EA" color="#DD6B20" px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500" fontSize="12px">
              Pending
            </Badge>
          )}
        </Flex>
        <Text fontSize="14px" color="gray.500" fontWeight="500">
          Max: {maxMarks} pts
        </Text>
      </Flex>

      {/* Question text */}
      {answer.question?.text && (
        <Box bg="#F7FAFC" borderRadius="8px" p={4} mb={4}>
          <Text fontSize="13px" color="gray.500" fontWeight="600" mb={1}>Question</Text>
          <Text fontSize="14px" color="#1A202C">{answer.question.text}</Text>
        </Box>
      )}

      {/* Student answer */}
      <Box bg="#FFFBEB" border="1px solid #FCEFC7" borderRadius="8px" p={4} mb={4}>
        <Text fontSize="13px" color="gray.500" fontWeight="600" mb={1}>Student Answer</Text>
        <Text fontSize="14px" color="#1A202C" whiteSpace="pre-wrap">
          {answer.answer || <Text as="span" color="gray.400" fontStyle="italic">No answer provided</Text>}
        </Text>
      </Box>

      {answer.question?.rubric && (
        <Box bg="#EBF4FF" border="1px solid #BEE3F8" borderRadius="8px" p={4} mb={4}>
          <Text fontSize="13px" color="gray.500" fontWeight="600" mb={1}>Rubric / Marking Scheme</Text>
          <Text fontSize="14px" color="#1A202C" whiteSpace="pre-wrap">{answer.question.rubric}</Text>
        </Box>
      )}

      <Divider mb={4} />

      {/* Grading inputs */}
      <Flex gap={4} flexWrap="wrap" alignItems="flex-end">
        <Box minW="120px">
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb={1}>Score (out of {maxMarks})</Text>
          <NumberInput
            value={score}
            onChange={(val) => setScore(val)}
            min={0}
            max={maxMarks}
            size="sm"
          >
            <NumberInputField borderRadius="6px" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>

        <Box minW="160px">
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb={1}>Status</Text>
          <ChakraSelect
            value={gradingStatus}
            onChange={(e) => setGradingStatus(e.target.value)}
            size="sm"
            borderRadius="6px"
          >
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </ChakraSelect>
        </Box>

        <Box flex="1" minW="200px">
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb={1}>Remark (optional)</Text>
          <Textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            size="sm"
            rows={2}
            borderRadius="6px"
            placeholder="Add a comment or feedback…"
            resize="vertical"
          />
        </Box>

        <Button size="sm" isLoading={saving} onClick={handleSave}>
          {isGraded ? "Update" : "Save"}
        </Button>
      </Flex>
    </Box>
  );
};

const StudentMarkingPage = () => {
  const history = useHistory();
  const { examId, studentId } = useParams();
  const toast = useToast();
  const { resource, handleFetchResource } = useFetch();
  const [refreshKey, setRefreshKey] = useState(0);

  const fetcher = useCallback(async () => {
    const { submission } = await getStudentSubmission(examId, studentId);
    return { submission };
  }, [examId, studentId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher, refreshKey]);

  const submission = resource.data?.submission;
  const answers = submission?.answers ?? [];

  const handleSave = () => setRefreshKey((k) => k + 1);

  return (
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push(`/admin/manual-marking/${examId}/students`)}
        />
        <Heading fontSize="22px" fontWeight="600">Grade Student Submission</Heading>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" py="60px"><Spinner size="xl" color="blue.500" /></Flex>
      )}
      {resource.err && (
        <Flex justifyContent="center" py="60px">
          <Text color="red.500">Failed to load submission. Please try again.</Text>
        </Flex>
      )}

      {!resource.loading && !resource.err && submission && (
        <>
          {/* Student info card */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p={6} mb={6}>
            <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
              <Box>
                <Text fontSize="20px" fontWeight="600" color="#1A202C" mb={1}>
                  {submission.student?.firstName} {submission.student?.lastName}
                </Text>
                <Flex gap={4} flexWrap="wrap">
                  {submission.student?.email && (
                    <Text fontSize="14px" color="gray.500">{submission.student.email}</Text>
                  )}
                  {submission.attemptNumber && (
                    <Text fontSize="14px" color="gray.500">
                      Attempt <Text as="span" fontWeight="600" color="#1A202C">{submission.attemptNumber}</Text>
                    </Text>
                  )}
                  {submission.submissionTime && (
                    <Text fontSize="14px" color="gray.500">
                      Submitted:{" "}
                      <Text as="span" fontWeight="600" color="#1A202C">
                        {new Date(submission.submissionTime).toLocaleString()}
                      </Text>
                    </Text>
                  )}
                </Flex>
              </Box>

              <Flex gap={4} flexWrap="wrap">
                {submission.autoScore !== undefined && (
                  <Box border="1px solid #E2E8F0" borderRadius="10px" p={4} textAlign="left" minW="120px">
                    <Text fontSize="13px" color="gray.500" mb={1}>Auto Score</Text>
                    <Text fontSize="18px" fontWeight="600" color="#1A202C">
                      {submission.autoScore}/{submission.totalAutoMarks ?? "—"}
                    </Text>
                  </Box>
                )}
                {submission.manualScore !== undefined && (
                  <Box border="1px solid #E2E8F0" borderRadius="10px" p={4} textAlign="left" minW="120px">
                    <Text fontSize="13px" color="gray.500" mb={1}>Manual Score</Text>
                    <Text fontSize="18px" fontWeight="600" color="#1A202C">
                      {submission.manualScore}/{submission.totalManualMarks ?? "—"}
                    </Text>
                  </Box>
                )}
                {submission.totalScore !== undefined && (
                  <Box border="1px solid #E2E8F0" borderRadius="10px" p={4} textAlign="left" minW="120px">
                    <Text fontSize="13px" color="gray.500" mb={1}>Total Score</Text>
                    <Text fontSize="18px" fontWeight="700" color="#6b006b">
                      {submission.totalScore}
                    </Text>
                  </Box>
                )}
              </Flex>
            </Flex>
          </Box>

          {/* Questions */}
          {answers.length === 0 ? (
            <Flex justifyContent="center" py="40px">
              <Text color="gray.400">No subjective questions to grade.</Text>
            </Flex>
          ) : (
            answers.map((answer, i) => (
              <QuestionCard
                key={answer.id || answer.questionId || i}
                answer={answer}
                index={i}
                onSave={handleSave}
              />
            ))
          )}
        </>
      )}
    </Box>
  );
};

export const StudentMarkingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentMarkingPage {...props} />} />
);

export default StudentMarkingPageRoute;
