import React, { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Textarea,
  Divider,
  useToast,
  IconButton,
  Switch as ChakraSwitch,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { Button, Heading, Input, Select } from "../../../components";
import { adminCreateMarkingJob } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const MARKING_TYPE_OPTIONS = [
  { label: "Automatic", value: "AUTOMATIC" },
  { label: "Manual", value: "MANUAL" },
  { label: "Hybrid", value: "HYBRID" },
];

const QUESTION_TYPE_OPTIONS = [
  { label: "MCQ", value: "MCQ" },
  { label: "True/False", value: "TRUE_FALSE" },
  { label: "Essay", value: "ESSAY" },
  { label: "Fill in the blank", value: "FILL_IN_BLANK" },
  { label: "Matching", value: "MATCHING" },
];

const DEFAULT_CRITERION = {
  questionType: "MCQ",
  autoGrade: true,
  pointsPerQuestion: 1,
  rubricId: "",
};

export const CreateMarkingJobPage = () => {
  const history = useHistory();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [criteria, setCriteria] = useState([{ ...DEFAULT_CRITERION }]);

  const handleAddCriterion = () => {
    setCriteria((prev) => [...prev, { ...DEFAULT_CRITERION }]);
  };

  const handleRemoveCriterion = (index) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (index, field, value) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const onSubmit = async (data) => {
    try {
      const body = {
        examinationId: data.examinationId,
        markingType: data.markingType,
        deadline: data.deadline,
        description: data.description,
        criteria,
      };
      const { message } = await adminCreateMarkingJob(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      history.push("/admin/examination-marking");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
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
        Create Marking Job
      </Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap="32px"
          alignItems="start"
        >
          {/* Left Column */}
          <Box bg="white" borderRadius="8px" p="30px" shadow="sm">
            <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="20px">
              Job Details
            </Text>

            <Box mb="20px">
              <Input
                label="Examination ID"
                id="examinationId"
                placeholder="Enter examination ID"
                {...register("examinationId", {
                  required: "Examination ID is required",
                })}
                error={errors.examinationId?.message}
              />
            </Box>

            <Box mb="20px">
              <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="8px">
                Marking Type
              </Text>
              <Select
                id="markingType"
                placeholder="Select marking type"
                options={MARKING_TYPE_OPTIONS}
                {...register("markingType", {
                  required: "Marking type is required",
                })}
                error={errors.markingType?.message}
              />
              {errors.markingType && (
                <Text color="red.500" fontSize="12px" mt="4px">
                  {errors.markingType.message}
                </Text>
              )}
            </Box>

            <Box mb="20px">
              <Input
                label="Deadline"
                id="deadline"
                type="datetime-local"
                {...register("deadline", { required: "Deadline is required" })}
                error={errors.deadline?.message}
              />
            </Box>

            <Box mb="20px">
              <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="8px">
                Description
              </Text>
              <Textarea
                placeholder="Enter job description..."
                bg="#F4F5F7"
                border="none"
                borderRadius="8px"
                minH="100px"
                p="16px"
                {...register("description")}
              />
            </Box>
          </Box>

          {/* Right Column — Criteria */}
          <Box bg="white" borderRadius="8px" p="30px" shadow="sm">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
              <Text fontSize="16px" fontWeight="600" color="#1A202C">
                Marking Criteria
              </Text>
              <Button
                size="sm"
                style={{ backgroundColor: "#6b006b", color: "white" }}
                leftIcon={<FaPlus />}
                onClick={handleAddCriterion}
                type="button"
              >
                Add
              </Button>
            </Flex>

            {criteria.map((criterion, index) => (
              <Box
                key={index}
                border="1px solid #E2E8F0"
                borderRadius="8px"
                p="16px"
                mb="16px"
              >
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb="12px"
                >
                  <Text fontSize="14px" fontWeight="600" color="#4A5568">
                    Criterion {index + 1}
                  </Text>
                  {criteria.length > 1 && (
                    <IconButton
                      icon={<FaTrash />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Remove criterion"
                      onClick={() => handleRemoveCriterion(index)}
                    />
                  )}
                </Flex>

                <Box mb="12px">
                  <Text
                    fontSize="13px"
                    fontWeight="500"
                    color="#1A202C"
                    mb="6px"
                  >
                    Question Type
                  </Text>
                  <Select
                    id={`questionType-${index}`}
                    options={QUESTION_TYPE_OPTIONS}
                    value={criterion.questionType}
                    onChange={(e) =>
                      handleCriterionChange(
                        index,
                        "questionType",
                        e.target.value,
                      )
                    }
                  />
                </Box>

                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  mb="12px"
                >
                  <Text fontSize="13px" fontWeight="500" color="#1A202C">
                    Auto Grade
                  </Text>
                  <ChakraSwitch
                    isChecked={criterion.autoGrade}
                    onChange={(e) =>
                      handleCriterionChange(
                        index,
                        "autoGrade",
                        e.target.checked,
                      )
                    }
                    colorScheme="purple"
                  />
                </Flex>

                <Box mb="12px">
                  <Input
                    label="Points Per Question"
                    id={`points-${index}`}
                    type="number"
                    value={criterion.pointsPerQuestion}
                    onChange={(e) =>
                      handleCriterionChange(
                        index,
                        "pointsPerQuestion",
                        Number(e.target.value),
                      )
                    }
                  />
                </Box>

                {!criterion.autoGrade && (
                  <Box>
                    <Input
                      label="Rubric ID (for manual grading)"
                      id={`rubric-${index}`}
                      placeholder="Enter rubric ID"
                      value={criterion.rubricId}
                      onChange={(e) =>
                        handleCriterionChange(index, "rubricId", e.target.value)
                      }
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Grid>

        <Divider my="32px" />

        <Flex justifyContent="flex-end" gap="16px">
          <Button
            variant="outline"
            borderColor="#6b006b"
            color="#6b006b"
            bg="transparent"
            onClick={() => history.push("/admin/examination-marking")}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            style={{ backgroundColor: "#6b006b", color: "white" }}
            isLoading={isSubmitting}
          >
            Create Marking Job
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export const CreateMarkingJobPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateMarkingJobPage {...props} />} />
);

export default CreateMarkingJobPageRoute;
