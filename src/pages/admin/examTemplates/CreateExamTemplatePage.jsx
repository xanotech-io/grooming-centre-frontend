import React, { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Textarea,
  Divider,
  Switch,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Button, Heading, Input, Select } from "../../../components";
import { adminCreateExamTemplate } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const QUESTION_TYPE_OPTIONS = [
  { label: "MCQ", value: "MCQ" },
  { label: "True / False", value: "TRUE_FALSE" },
  { label: "Essay", value: "ESSAY" },
  { label: "Fill in Blank", value: "FILL_IN_BLANK" },
  { label: "Matching", value: "MATCHING" },
];

<<<<<<< Updated upstream
=======
const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

>>>>>>> Stashed changes
const emptySection = () => ({
  _key: Date.now() + Math.random(),
  sectionName: "",
  questionType: "MCQ",
  questionCount: 10,
  marksPerQuestion: 2,
  difficultyDistribution: { easy: 4, medium: 4, hard: 2 },
});

export const CreateExamTemplatePage = () => {
  const history = useHistory();
  const toast = useToast();

  const [templateName, setTemplateName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState([emptySection()]);

  // Randomization config
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [randomizeSectionOrder, setRandomizeSectionOrder] = useState(false);

  // Display config
  const [questionsPerPage, setQuestionsPerPage] = useState(5);
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);
  const [allowQuestionSkipping, setAllowQuestionSkipping] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [allowCalculator, setAllowCalculator] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = sections.reduce(
    (s, sec) => s + Number(sec.questionCount || 0),
    0,
  );
  const totalMarks = sections.reduce(
    (s, sec) =>
      s + Number(sec.questionCount || 0) * Number(sec.marksPerQuestion || 0),
    0,
  );

  const handleSectionChange = (index, field, value) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const handleDifficultyChange = (index, level, value) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              difficultyDistribution: {
                ...s.difficultyDistribution,
                [level]: Number(value),
              },
            }
          : s,
      ),
    );
  };

  const handleAddSection = () =>
    setSections((prev) => [...prev, emptySection()]);

  const handleRemoveSection = (index) => {
    if (sections.length === 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!templateName.trim()) {
      toast({
        description: "Template name is required.",
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
    setIsSubmitting(true);
    try {
      const body = {
        templateName,
        courseId,
        durationMinutes: Number(durationMinutes),
        description,
        sections: sections.map(({ _key, ...s }) => s),
        totalQuestions,
        totalMarks,
        randomizationConfig: {
          shuffleQuestions,
          shuffleOptions,
          randomizeSectionOrder,
        },
        displayConfig: {
          questionsPerPage: Number(questionsPerPage),
          allowBackNavigation,
          allowQuestionSkipping,
          showTimer,
          allowCalculator,
        },
      };
      const { message } = await adminCreateExamTemplate(body);
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

      <Heading as="h1" size="lg" color="#1A202C" mb="32px">
        Create Exam Template
      </Heading>

      <Grid
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
        gap="32px"
        alignItems="start"
      >
        {/* Left Column */}
        <Box>
          {/* Basic Info */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="20px">
              Basic Information
            </Text>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap="16px"
              mb="16px"
            >
              <Input
                label="Template Name"
                id="templateName"
                placeholder="e.g. Midterm MCQs"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <Input
                label="Course ID"
                id="courseId"
                placeholder="e.g. course-uuid-123"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              />
            </Grid>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap="16px"
              mb="16px"
            >
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Duration (minutes)
                </Text>
                <NumberInput
                  min={15}
                  value={durationMinutes}
                  onChange={(v) => setDurationMinutes(v)}
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
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Summary
                </Text>
                <Box bg="#F4F5F7" borderRadius="8px" p="12px">
                  <Flex justifyContent="space-between" mb="4px">
                    <Text fontSize="13px" color="#718096">
                      Total Questions:
                    </Text>
                    <Text fontSize="13px" fontWeight="600" color="#1A202C">
                      {totalQuestions}
                    </Text>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <Text fontSize="13px" color="#718096">
                      Total Marks:
                    </Text>
                    <Text fontSize="13px" fontWeight="600" color="#6b006b">
                      {totalMarks}
                    </Text>
                  </Flex>
                </Box>
              </Box>
            </Grid>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Description (optional)
              </Text>
              <Textarea
                placeholder="Describe this template..."
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
          </Box>

          {/* Sections Builder */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
              <Text fontSize="16px" fontWeight="600" color="#1A202C">
                Sections
              </Text>
              <Button
                onClick={handleAddSection}
                style={{ backgroundColor: "#6b006b", color: "white" }}
                size="sm"
              >
                <Flex alignItems="center" gap="6px">
                  <FaPlus size="11px" /> Add Section
                </Flex>
              </Button>
            </Flex>

            {sections.map((section, index) => (
              <Box
                key={section._key}
                border="1px solid #E2E8F0"
                borderRadius="8px"
                p="20px"
                mb="16px"
              >
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb="16px"
                >
                  <Text fontSize="14px" fontWeight="600" color="#6b006b">
                    Section {index + 1}
                  </Text>
                  {sections.length > 1 && (
                    <IconButton
                      icon={<FaTrash size="13px" />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Remove section"
                      onClick={() => handleRemoveSection(index)}
                    />
                  )}
                </Flex>

                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap="14px"
                  mb="14px"
                >
                  <Input
                    label="Section Name"
                    id={`sectionName-${index}`}
                    placeholder="e.g. Section A - Multiple Choice"
                    value={section.sectionName}
                    onChange={(e) =>
                      handleSectionChange(index, "sectionName", e.target.value)
                    }
                  />
                  <Box>
                    <Text
                      fontSize="13px"
                      fontWeight="500"
                      color="#1A202C"
                      mb="8px"
                    >
                      Question Type
                    </Text>
                    <Select
                      id={`questionType-${index}`}
                      options={QUESTION_TYPE_OPTIONS}
                      value={section.questionType}
                      onChange={(e) =>
                        handleSectionChange(
                          index,
                          "questionType",
                          e.target.value,
                        )
                      }
                    />
                  </Box>
                </Grid>

                <Grid templateColumns="1fr 1fr" gap="14px" mb="14px">
                  <Box>
                    <Text
                      fontSize="13px"
                      fontWeight="500"
                      color="#1A202C"
                      mb="8px"
                    >
                      Number of Questions
                    </Text>
                    <NumberInput
                      min={1}
                      value={section.questionCount}
                      onChange={(v) =>
                        handleSectionChange(index, "questionCount", Number(v))
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
                      fontSize="13px"
                      fontWeight="500"
                      color="#1A202C"
                      mb="8px"
                    >
                      Marks Per Question
                    </Text>
                    <NumberInput
                      min={1}
                      value={section.marksPerQuestion}
                      onChange={(v) =>
                        handleSectionChange(
                          index,
                          "marksPerQuestion",
                          Number(v),
                        )
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

                {/* Difficulty Distribution */}
                <Box>
                  <Text
                    fontSize="13px"
                    fontWeight="500"
                    color="#1A202C"
                    mb="10px"
                  >
                    Difficulty Distribution
                  </Text>
                  <Grid templateColumns="1fr 1fr 1fr" gap="12px">
                    {["easy", "medium", "hard"].map((level) => (
                      <Box key={level}>
                        <Text
                          fontSize="12px"
                          color="#718096"
                          mb="6px"
                          textTransform="capitalize"
                        >
                          {level}
                        </Text>
                        <NumberInput
                          min={0}
                          max={section.questionCount}
                          value={section.difficultyDistribution[level]}
                          onChange={(v) =>
                            handleDifficultyChange(index, level, v)
                          }
                        >
                          <NumberInputField
                            bg="#F4F5F7"
                            border="none"
                            borderRadius="8px"
                            size="sm"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Box>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Column */}
        <Box position="sticky" top="30px">
          {/* Randomization Config */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
              Randomization Settings
            </Text>
            <Divider mb="16px" />
            {[
              {
                label: "Shuffle Questions",
                value: shuffleQuestions,
                setter: setShuffleQuestions,
              },
              {
                label: "Shuffle Answer Options",
                value: shuffleOptions,
                setter: setShuffleOptions,
              },
              {
                label: "Randomize Section Order",
                value: randomizeSectionOrder,
                setter: setRandomizeSectionOrder,
              },
            ].map(({ label, value, setter }) => (
              <Flex
                key={label}
                justifyContent="space-between"
                alignItems="center"
                mb="14px"
              >
                <Text fontSize="14px" color="#4A5568">
                  {label}
                </Text>
                <Switch
                  isChecked={value}
                  onChange={(e) => setter(e.target.checked)}
                  colorScheme="purple"
                />
              </Flex>
            ))}
          </Box>

          {/* Display Config */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
              Display Settings
            </Text>
            <Divider mb="16px" />
            <Box mb="16px">
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Questions Per Page
              </Text>
              <NumberInput
                min={1}
                max={50}
                value={questionsPerPage}
                onChange={(v) => setQuestionsPerPage(v)}
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
            {[
              {
                label: "Allow Back Navigation",
                value: allowBackNavigation,
                setter: setAllowBackNavigation,
              },
              {
                label: "Allow Question Skipping",
                value: allowQuestionSkipping,
                setter: setAllowQuestionSkipping,
              },
              { label: "Show Timer", value: showTimer, setter: setShowTimer },
              {
                label: "Allow Calculator",
                value: allowCalculator,
                setter: setAllowCalculator,
              },
            ].map(({ label, value, setter }) => (
              <Flex
                key={label}
                justifyContent="space-between"
                alignItems="center"
                mb="14px"
              >
                <Text fontSize="14px" color="#4A5568">
                  {label}
                </Text>
                <Switch
                  isChecked={value}
                  onChange={(e) => setter(e.target.checked)}
                  colorScheme="purple"
                />
              </Flex>
            ))}
          </Box>

          {/* Submit */}
          <Button
            w="100%"
            h="50px"
            style={{ backgroundColor: "#6b006b", color: "white" }}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Create Template
          </Button>
        </Box>
      </Grid>
    </Box>
  );
};

export const CreateExamTemplatePageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateExamTemplatePage {...props} />} />
);

export default CreateExamTemplatePageRoute;
