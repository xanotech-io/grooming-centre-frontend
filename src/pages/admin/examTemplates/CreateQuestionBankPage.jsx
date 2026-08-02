import React, { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  BreadcrumbItem,
  Flex,
  Grid,
  Text,
  Textarea,
  IconButton,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Input, Link, Select } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminCreateQuestionBank } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const QUESTION_TYPE_OPTIONS = [
  { label: "MCQ", value: "MCQ" },
  { label: "True / False", value: "TRUE_FALSE" },
  { label: "Essay", value: "ESSAY" },
  { label: "Fill in Blank", value: "FILL_IN_BLANK" },
  { label: "Matching", value: "MATCHING" },
];

const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "EASY" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Hard", value: "HARD" },
];

const emptyOption = () => ({
  _key: Date.now() + Math.random(),
  text: "",
  isCorrect: false,
});

const emptyQuestion = () => ({
  _key: Date.now() + Math.random(),
  questionText: "",
  questionType: "MCQ",
  difficultyLevel: "MEDIUM",
  marks: 2,
  correctAnswer: "",
  options: [emptyOption(), emptyOption(), emptyOption()],
});

export const CreateQuestionBankPage = () => {
  const history = useHistory();
  const toast = useToast();

  const [bankName, setBankName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (qIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q)),
    );
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.map((o, j) =>
          j === oIndex ? { ...o, [field]: value } : o,
        );
        return { ...q, options };
      }),
    );
  };

  const handleMarkCorrect = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.map((o, j) => ({
          ...o,
          isCorrect: j === oIndex,
        }));
        return { ...q, options };
      }),
    );
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, emptyOption()] } : q,
      ),
    );
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return { ...q, options: q.options.filter((_, j) => j !== oIndex) };
      }),
    );
  };

  const handleAddQuestion = () =>
    setQuestions((prev) => [...prev, emptyQuestion()]);

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const handleSubmit = async () => {
    if (!bankName.trim()) {
      toast({
        description: "Bank name is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    if (!courseId.trim()) {
      toast({
        description: "Course ID is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    const emptyQ = questions.find((q) => !q.questionText.trim());
    if (emptyQ) {
      toast({
        description: "All questions must have text.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const body = {
        courseId,
        bankName,
        questions: questions.map(({ _key, options, ...q }) => ({
          ...q,
          options: ["MCQ", "TRUE_FALSE", "MATCHING"].includes(q.questionType)
            ? options.map(({ _key: ok, ...o }) => o)
            : undefined,
        })),
      };
      const { message } = await adminCreateQuestionBank(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      history.push("/admin/exam-templates");
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

  const showOptions = (type) =>
    ["MCQ", "TRUE_FALSE", "MATCHING"].includes(type);

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/marking-templates">Marking Templates</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Question Bank</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
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

      <Flex justifyContent="space-between" alignItems="center" mb="32px">
        <Heading as="h1" size="lg" color="#1A202C">
          Create Question Bank
        </Heading>
        <Button
          onClick={handleSubmit}
          style={{ backgroundColor: "#6b006b", color: "white" }}
          isLoading={isSubmitting}
        >
          Save Question Bank
        </Button>
      </Flex>

      {/* Bank Details */}
      <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
        <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="20px">
          Bank Details
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px">
          <Input
            label="Bank Name"
            id="bankName"
            placeholder="e.g. Agriculture Fundamentals Question Bank"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <Input
            label="Course ID"
            id="courseId"
            placeholder="e.g. course-uuid-123"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
        </Grid>
      </Box>

      {/* Questions */}
      <Flex justifyContent="space-between" alignItems="center" mb="16px">
        <Text fontSize="15px" fontWeight="600" color="#1A202C">
          Questions ({questions.length})
        </Text>
        <Button
          onClick={handleAddQuestion}
          style={{ backgroundColor: "#6b006b", color: "white" }}
          size="sm"
        >
          <Flex alignItems="center" gap="6px">
            <FaPlus size="11px" /> Add Question
          </Flex>
        </Button>
      </Flex>

      {questions.map((question, qIndex) => (
        <Box
          key={question._key}
          bg="white"
          borderRadius="8px"
          p="24px"
          shadow="sm"
          mb="20px"
        >
          {/* Question Header */}
          <Flex justifyContent="space-between" alignItems="center" mb="16px">
            <Text fontSize="14px" fontWeight="600" color="#6b006b">
              Question {qIndex + 1}
            </Text>
            {questions.length > 1 && (
              <IconButton
                icon={<FaTrash size="13px" />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                aria-label="Remove question"
                onClick={() => handleRemoveQuestion(qIndex)}
              />
            )}
          </Flex>

          {/* Question Config Row */}
          <Grid
            templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }}
            gap="14px"
            mb="16px"
          >
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Question Type
              </Text>
              <Select
                id={`qtype-${qIndex}`}
                options={QUESTION_TYPE_OPTIONS}
                value={question.questionType}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "questionType", e.target.value)
                }
              />
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Difficulty
              </Text>
              <Select
                id={`qdiff-${qIndex}`}
                options={DIFFICULTY_OPTIONS}
                value={question.difficultyLevel}
                onChange={(e) =>
                  handleQuestionChange(
                    qIndex,
                    "difficultyLevel",
                    e.target.value,
                  )
                }
              />
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Marks
              </Text>
              <NumberInput
                min={1}
                value={question.marks}
                onChange={(v) =>
                  handleQuestionChange(qIndex, "marks", Number(v))
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

          {/* Question Text */}
          <Box mb="16px">
            <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
              Question Text
            </Text>
            <Textarea
              placeholder="Enter the question..."
              bg="#F4F5F7"
              border="none"
              borderRadius="8px"
              value={question.questionText}
              onChange={(e) =>
                handleQuestionChange(qIndex, "questionText", e.target.value)
              }
            />
          </Box>

          {/* MCQ / True-False Options */}
          {showOptions(question.questionType) && (
            <Box mb="16px">
              <Flex
                justifyContent="space-between"
                alignItems="center"
                mb="10px"
              >
                <Text fontSize="13px" fontWeight="500" color="#1A202C">
                  Answer Options
                </Text>
                {question.questionType === "MCQ" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddOption(qIndex)}
                  >
                    <Flex alignItems="center" gap="5px">
                      <FaPlus size="10px" /> Add Option
                    </Flex>
                  </Button>
                )}
              </Flex>
              {question.options.map((option, oIndex) => (
                <Flex key={option._key} alignItems="center" gap="10px" mb="8px">
                  <Box
                    w="20px"
                    h="20px"
                    borderRadius="50%"
                    border="2px solid"
                    borderColor={option.isCorrect ? "#38A169" : "#CBD5E0"}
                    bg={option.isCorrect ? "#38A169" : "transparent"}
                    cursor="pointer"
                    flexShrink={0}
                    onClick={() => handleMarkCorrect(qIndex, oIndex)}
                  />
                  <Input
                    id={`opt-${qIndex}-${oIndex}`}
                    placeholder={`Option ${oIndex + 1}`}
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, "text", e.target.value)
                    }
                  />
                  {question.options.length > 2 && (
                    <IconButton
                      icon={<FaTrash size="11px" />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Remove option"
                      onClick={() => handleRemoveOption(qIndex, oIndex)}
                    />
                  )}
                </Flex>
              ))}
              <Text fontSize="11px" color="#A0AEC0" mt="4px">
                Click the circle to mark the correct answer
              </Text>
            </Box>
          )}

          {/* Correct Answer (for non-MCQ) */}
          {!showOptions(question.questionType) && (
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Correct Answer / Model Answer
              </Text>
              <Textarea
                placeholder="Enter the correct answer or model answer..."
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                value={question.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "correctAnswer", e.target.value)
                }
              />
            </Box>
          )}
        </Box>
      ))}

      {/* Bottom Submit */}
      <Flex justifyContent="flex-end" mt="8px">
        <Button
          style={{ backgroundColor: "#6b006b", color: "white" }}
          h="50px"
          px="40px"
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          Save Question Bank
        </Button>
      </Flex>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateQuestionBankPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateQuestionBankPage {...props} />} />
);

export default CreateQuestionBankPageRoute;
