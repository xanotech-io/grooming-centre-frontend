/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Flex, Grid, GridItem } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {  useHistory } from "react-router-dom";
import {
  Button,
  DateTimePicker,
  Heading,
  Input,
  Select,
  Spinner,
} from "../../../components";
import { useCache } from "../../../contexts";
import { useDateTimePicker, useGoBack, useQueryParams } from "../../../hooks";
import {
  adminCreateStandaloneExamination,
  adminEditStandaloneExamination,
  adminGetMarkingTemplates,
} from "../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../utils";
import useAssessmentPreview from "../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import useAssessmentStore from "../../../store/assessmentStore";
import { FaRegSave, FaFileAlt } from "react-icons/fa";

const OverViewStandalone = () => {
  const examinationId = useQueryParams().get("examination");
  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    examinationId ? examinationId : "isStandaloneExamination && isNotEdit",
    true,
  );
  const isEditmode = !examinationId === false;

  return examinationId && (isLoading || error) ? (
    <Flex
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Heading color="red.500">{error}</Heading>
      ) : null}
    </Flex>
  ) : isEditmode ? (
    <EditStandalonePage assessment={assessment} />
  ) : (
    <CreateStandalonePage />
  );
};

const EditStandalonePage = ({ assessment }) => {
  const examinationId = useQueryParams().get("examination");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (assessment?.topic) setValue("title", assessment?.topic);
  }, [assessment?.topic, setValue]);

  useEffect(() => {
    if (assessment?.startTime)
      startTimeManager.handleChange(assessment?.startTime);
  }, [assessment?.startTime]);

  useEffect(() => {
    if (assessment?.duration) setValue("duration", assessment?.duration);
  }, [assessment?.duration, setValue]);

  useEffect(() => {
    if (assessment?.questionCount)
      setValue("amountOfQuestions", assessment?.questionCount);
  }, [assessment?.questionCount, setValue]);

  useEffect(() => {
    if (assessment?.isPublished)
      setValue("isPublished", assessment?.isPublished);
  }, [assessment?.isPublished, setValue]);

  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const startTimeManager = useDateTimePicker();
  const { handleDelete } = useCache();

  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");
      const body = {
        ...data,
        startTime: formatDateToISO(startTime),
      };

      const { message } = await adminEditStandaloneExamination(
        examinationId,
        body,
      );

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      handleDelete(examinationId);
      push(`/admin/standalone-exams`);
    } catch (error) {
      toast({
        description: error.message,
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      marginY="20px"
      marginX="22px"
    >
      <Box
        backgroundColor="white"
        padding="40px"
        borderRadius="8px"
        shadow="sm"
      >
        <Heading as="h3" size="md" marginBottom="20px" color="#1A202C">
          Examination Details
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Input
              label="Examination Title"
              id="title"
              placeholder="Enter examination title"
              error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
          </GridItem>
          <GridItem>
            <Select
              label="Course"
              id="course"
              placeholder="Select the course associated with the exam"
              options={[]}
              {...register("course")}
            />
          </GridItem>

          <GridItem>
            <Select
              label="Instructor"
              id="instructor"
              placeholder="Select instructor for the exam"
              options={[]}
              {...register("instructor")}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Number of Questions"
              type="number"
              id="amountOfQuestions"
              placeholder="Enter the number of questions"
              error={errors.amountOfQuestions?.message}
              {...register("amountOfQuestions", {
                required: "Please enter number of questions",
              })}
            />
          </GridItem>

          <GridItem>
            <DateTimePicker
              id="startTime"
              isRequired
              label="Start Date and Time"
              value={startTimeManager.value}
              onChange={startTimeManager.handleChange}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Duration"
              type="number"
              id="duration"
              placeholder="Enter duration in minutes"
              error={errors.duration?.message}
              {...register("duration", { required: "Please enter duration" })}
            />
          </GridItem>

          <GridItem colSpan={2}>
            <Input
              label="Instructions"
              id="instructions"
              placeholder="Enter exam instructions for the students"
              {...register("instructions")}
            />
          </GridItem>
        </Grid>

        <Flex marginTop="40px" justifyContent="flex-end" gap="16px">
          <Button
            secondary
            onClick={handleCancel}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            border="1px solid #E2E8F0"
            color="purple.800"
            _hover={{ bg: "gray.50" }}
          >
            <FaRegSave />
            Save as draft
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            bg="purple.800"
            color="white"
            _hover={{ bg: "purple.900" }}
          >
            <FaFileAlt />
            Next: Template
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

const CreateStandalonePage = () => {
  const { push } = useHistory();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleCancel = useGoBack();
  const startTimeManager = useDateTimePicker();
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [markingMode, setMarkingMode] = useState("automatic");
  const setAssessment = useAssessmentStore((s) => s.setAssessment);

  useEffect(() => {
    adminGetMarkingTemplates()
      .then(({ templates }) =>
        setMarkingTemplates(templates)
      )
      .catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    try {
      const startTime = startTimeManager.handleGetValueAndValidate("Start Time");

      if (!templateId)
        throw new Error("A marking template must be selected before creating an examination.");

      const body = {
        title: data.title,
        duration: Number(data.duration),
        amountOfQuestions: Number(data.amountOfQuestions),
        totalMarks: Number(data.totalMarks),
        templateId,
        markingMode,
        startTime: formatDateToISO(startTime),
      };

      const { message, examination } = await adminCreateStandaloneExamination(body);
      setAssessment(examination);

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      push(`/admin/standalone-exams/questions/?examination=${examination.id}`);
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY="20px" marginX="22px">
      <Box backgroundColor="white" padding="40px" borderRadius="8px" shadow="sm">
        <Heading as="h3" size="md" marginBottom="20px" color="#1A202C">
          Examination Details
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem colSpan={2}>
            <Input
              label="Examination Title"
              id="title"
              placeholder="Enter examination title"
              error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
          </GridItem>

          <GridItem>
            <Input
              label="Number of Questions"
              type="number"
              id="amountOfQuestions"
              placeholder="Enter the number of questions"
              error={errors.amountOfQuestions?.message}
              {...register("amountOfQuestions", {
                required: "Please enter number of questions",
              })}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Total Marks"
              type="number"
              id="totalMarks"
              placeholder="e.g. 100"
              error={errors.totalMarks?.message}
              {...register("totalMarks", { required: "Please enter total marks" })}
            />
          </GridItem>

          <GridItem>
            <DateTimePicker
              id="startTime"
              isRequired
              label="Start Date and Time"
              value={startTimeManager.value}
              onChange={startTimeManager.handleChange}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Duration (minutes)"
              type="number"
              id="duration"
              placeholder="Enter duration in minutes"
              error={errors.duration?.message}
              {...register("duration", { required: "Please enter duration" })}
            />
          </GridItem>

          <GridItem>
            <Select
              label="Marking Mode"
              placeholder="Select marking mode"
              isRequired
              value={markingMode}
              onChange={(e) => setMarkingMode(e.target.value)}
              options={[
                { label: "Automatic", value: "automatic" },
                { label: "Manual", value: "manual" },
                { label: "Hybrid", value: "hybrid" },
              ]}
            />
          </GridItem>
          <GridItem>
            <Select
              label="Marking Template"
              placeholder="Select a marking template"
              isRequired
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
            />
          </GridItem>
        </Grid>

        <Flex marginTop="40px" justifyContent="flex-end" gap="16px">
          <Button
            secondary
            onClick={handleCancel}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            border="1px solid #E2E8F0"
            color="#6b006b"
            _hover={{ bg: "gray.50" }}
          >
            <FaRegSave />
            Save as draft
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            style={{ backgroundColor: "#6b006b", color: "white" }}
            _hover={{ bg: "#520052" }}
          >
            <FaFileAlt />
            Create &amp; Add Questions
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default OverViewStandalone;
