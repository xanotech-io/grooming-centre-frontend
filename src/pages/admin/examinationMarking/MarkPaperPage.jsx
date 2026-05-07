import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Textarea,
  Spinner,
  Divider,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
<<<<<<< Updated upstream
import { Button, Heading } from "../../../components";
=======
import { Button, Heading, Input } from "../../../components";
>>>>>>> Stashed changes
import { useFetch } from "../../../hooks";
import { adminGetPaperForMarking, adminMarkPaper } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

export const MarkPaperPage = () => {
  const history = useHistory();
  const { jobId, paperId } = useParams();
  const toast = useToast();

  const { resource, handleFetchResource } = useFetch();
  const [answers, setAnswers] = useState([]);
  const [overallRemarks, setOverallRemarks] = useState("");
  const [markerComments, setMarkerComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetcher = useCallback(async () => {
    const { paper, questions } = await adminGetPaperForMarking(paperId);
    return { paper, questions };
  }, [paperId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  // Initialise answer state when questions load
  useEffect(() => {
    if (resource.data?.questions) {
      setAnswers(
        resource.data.questions.map((q) => ({
          questionId: q.questionId,
          maxMarks: q.maxMarks,
          marksObtained: 0,
          feedback: "",
        })),
      );
    }
  }, [resource.data]);

  const paper = resource.data?.paper;
  const questions = resource.data?.questions ?? [];

  const handleMarksChange = (index, value) => {
    setAnswers((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, marksObtained: Number(value) } : a,
      ),
    );
  };

  const handleFeedbackChange = (index, value) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, feedback: value } : a)),
    );
  };

  const totalMarks = answers.reduce(
    (sum, a) => sum + (a.marksObtained || 0),
    0,
  );
  const maxTotalMarks = answers.reduce((sum, a) => sum + (a.maxMarks || 0), 0);

  const handleSubmit = async () => {
    const unanswered = answers.find(
      (a) => a.marksObtained === null || a.marksObtained === undefined,
    );
    if (unanswered) {
      toast({
        description: "Please enter marks for all questions.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const body = {
        questionAnswers: answers.map((a) => ({
          questionId: a.questionId,
          marksObtained: a.marksObtained,
          maxMarks: a.maxMarks,
          feedback: a.feedback,
        })),
        totalMarks,
        remarks: overallRemarks,
        markerComments,
      };
      const { message } = await adminMarkPaper(paperId, body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      history.push(`/admin/examination-marking/jobs/${jobId}`);
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
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

      {resource.loading && (
        <Flex justifyContent="center" alignItems="center" minHeight="60vh">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!resource.loading && (
        <>
          {/* Header */}
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            mb="32px"
          >
            <Box>
              <Heading as="h1" size="lg" color="#1A202C" mb="8px">
                Mark Paper
              </Heading>
              <Flex gap="24px" flexWrap="wrap">
                <Text color="#718096" fontSize="14px">
                  Paper ID:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {paper?.paperId ?? paperId}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Student:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {paper?.studentName}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Student ID:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {paper?.studentId}
                  </Text>
                </Text>
              </Flex>
            </Box>
            {/* Running Total */}
            <Box
              bg="white"
              borderRadius="8px"
              p="20px"
              shadow="sm"
              textAlign="center"
              minWidth="140px"
            >
              <Text fontSize="13px" color="#718096" mb="4px">
                Total Score
              </Text>
              <Text fontSize="32px" fontWeight="700" color="#6b006b">
                {totalMarks}
              </Text>
              <Text fontSize="13px" color="#718096">
                out of {maxTotalMarks}
              </Text>
            </Box>
          </Flex>

          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap="32px"
            alignItems="start"
          >
            {/* Questions */}
            <Box>
              {questions.map((question, index) => (
                <Box
                  key={question.questionId}
                  bg="white"
                  borderRadius="8px"
                  p="24px"
                  shadow="sm"
                  mb="20px"
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb="16px"
                  >
                    <Text
                      fontSize="13px"
                      fontWeight="600"
                      color="#6b006b"
                      mb="4px"
                    >
                      Question {question.sequenceNumber} ·{" "}
                      {question.questionType} · {question.maxMarks} marks
                    </Text>
                  </Flex>

                  <Text
                    fontSize="15px"
                    color="#1A202C"
                    lineHeight="1.6"
                    mb="20px"
                  >
                    {question.questionText}
                  </Text>

                  <Divider mb="20px" />

                  <Grid templateColumns="1fr 1fr" gap="16px">
                    <Box>
                      <Text
                        fontSize="13px"
                        fontWeight="500"
                        color="#1A202C"
                        mb="8px"
                      >
                        Marks Obtained (max: {question.maxMarks})
                      </Text>
                      <NumberInput
                        min={0}
                        max={question.maxMarks}
                        value={answers[index]?.marksObtained ?? 0}
                        onChange={(val) => handleMarksChange(index, val)}
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
                        fontSize="13px"
                        fontWeight="500"
                        color="#1A202C"
                        mb="8px"
                      >
                        Feedback
                      </Text>
                      <Textarea
                        placeholder="Enter feedback for this question..."
                        bg="#F4F5F7"
                        border="none"
                        borderRadius="8px"
                        size="sm"
                        value={answers[index]?.feedback ?? ""}
                        onChange={(e) =>
                          handleFeedbackChange(index, e.target.value)
                        }
                      />
                    </Box>
                  </Grid>
                </Box>
              ))}
            </Box>

            {/* Right Sidebar — Summary & Submit */}
            <Box position="sticky" top="30px">
              <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="#1A202C"
                  mb="16px"
                >
                  Marking Summary
                </Text>
                {questions.map((q, index) => (
                  <Flex
                    key={q.questionId}
                    justifyContent="space-between"
                    mb="8px"
                  >
                    <Text fontSize="14px" color="#718096">
                      Q{q.sequenceNumber}
                    </Text>
                    <Text fontSize="14px" fontWeight="600" color="#1A202C">
                      {answers[index]?.marksObtained ?? 0} / {q.maxMarks}
                    </Text>
                  </Flex>
                ))}
                <Divider my="12px" />
                <Flex justifyContent="space-between">
                  <Text fontSize="14px" fontWeight="600" color="#1A202C">
                    Total
                  </Text>
                  <Text fontSize="14px" fontWeight="700" color="#6b006b">
                    {totalMarks} / {maxTotalMarks}
                  </Text>
                </Flex>
              </Box>

              <Box bg="white" borderRadius="8px" p="24px" shadow="sm">
                <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="8px">
                  Overall Remarks
                </Text>
                <Textarea
                  placeholder="Enter overall remarks..."
                  bg="#F4F5F7"
                  border="none"
                  borderRadius="8px"
                  minH="100px"
                  mb="16px"
                  value={overallRemarks}
                  onChange={(e) => setOverallRemarks(e.target.value)}
                />

                <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="8px">
                  Marker Comments
                </Text>
                <Textarea
                  placeholder="Enter marker comments..."
                  bg="#F4F5F7"
                  border="none"
                  borderRadius="8px"
                  minH="100px"
                  mb="24px"
                  value={markerComments}
                  onChange={(e) => setMarkerComments(e.target.value)}
                />

                <Button
                  w="100%"
                  h="50px"
                  style={{ backgroundColor: "#6b006b", color: "white" }}
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                >
                  Save & Submit Marks
                </Button>
              </Box>
            </Box>
          </Grid>
        </>
      )}
    </Box>
  );
};

export const MarkPaperPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MarkPaperPage {...props} />} />
);

export default MarkPaperPageRoute;
