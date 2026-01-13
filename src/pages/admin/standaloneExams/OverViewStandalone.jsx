import { Box, Flex, Grid, GridItem } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  DateTimePicker,
  Heading,
  Input,
  Spinner,
  Text,
} from "../../../components";
import { useApp, useCache } from "../../../contexts";
import { useDateTimePicker, useGoBack, useQueryParams } from "../../../hooks";
import {
  adminCreateStandaloneExamination,
  adminEditStandaloneExamination,
} from "../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../utils";
import useAssessmentPreview from "../../user/Courses/TakeCourse/hooks/useAssessmentPreview";

const OverViewStandalone = () => {
  const examinationId = useQueryParams().get("examination");
  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    examinationId ? examinationId : "isStandaloneExamination && isNotEdit",
    true
  );
  const isEditmode = !examinationId === false;

  return examinationId && (isLoading || error) ? (
    <Flex
      // Make the height 100% of the screen minus the `height` of the Header and Footer
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

  // Init `Title` value
  useEffect(() => {
    if (assessment?.topic) {
      setValue("title", assessment?.topic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.topic]);

  // Init `StartTime` value
  useEffect(() => {
    if (assessment?.startTime) {
      startTimeManager.handleChange(assessment?.startTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.startTime]);

  // Init `Duration` value
  useEffect(() => {
    if (assessment?.duration) {
      setValue("duration", assessment?.duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.duration]);

  // Init `Number of Questions` value
  useEffect(() => {
    if (assessment?.questionCount) {
      setValue("amountOfQuestions", assessment?.questionCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.questionCount]);

  // Init is published
  useEffect(() => {
    if (assessment?.isPublished) {
      setValue("isPublished", assessment?.isPublished);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.isPublished]);

  const { push } = useHistory();
  const toast = useToast();

  const handleCancel = useGoBack();

  const startTimeManager = useDateTimePicker();

  const { handleDelete } = useCache();

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");

      const body = {
        ...data,
        startTime: formatDateToISO(startTime),
      };
      console.log(body, "here");
      const { message } = await adminEditStandaloneExamination(
        examinationId,
        body
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

  // const handleStandaloneExamTypeChange = (event) => {
  //   setStandaloneExamType(event.target.value);
  // };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY={14} marginX={6}>
      <Box backgroundColor="white" padding={10}>
        <Input
          label={"Examination Title"}
          id="title"
          error={errors.title?.message}
          {...register("title", {
            required: "Title is required",
          })}
        />
        <Box
          display={{ base: "flex", md: "flex", lg: "grid" }}
          flexDirection="column"
          templateColumns="repeat(2, 1fr)"
          gap={10}
          marginY={10}
        >
          <GridItem>
            <DateTimePicker
              id="startTime"
              isRequired
              label="Start date & time"
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
              {...register("duration", {
                required: "Please enter duration",
              })}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Number of Questions"
              type="number"
              id="amountOfQuestions"
              placeholder="Enter number of questions"
              error={errors.amountOfQuestions?.message}
              {...register("amountOfQuestions", {
                required: "Please enter number of questions",
              })}
            />
          </GridItem>
        </Box>
      </Box>
      <Flex paddingY={10} marginX={6} justifyContent="space-between">
        <Button secondary onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          isLoading={isSubmitting}
          disabled={isSubmitting}
          loadingText="Updating"
          type="submit"
        >
          Update
        </Button>
      </Flex>
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

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");

      const body = {
        ...data,
        startTime: formatDateToISO(startTime),
      };
      const { message, examination } = await adminCreateStandaloneExamination(
        body
      );

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

  // const handleStandaloneExamTypeChange = (event) => {
  //   setStandaloneExamType(event.target.value);
  // };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY={14} marginX={6}>
      <Box backgroundColor="white" padding={10}>
        <Input
          label={"Examination Title"}
          id="title"
          error={errors.title?.message}
          {...register("title", {
            required: "Title is required",
          })}
        />
        <Box
          display={{ base: "flex", md: "flex", lg: "grid" }}
          flexDirection="column"
          templateColumns="repeat(2, 1fr)"
          gap={10}
          marginY={10}
        >
          <GridItem>
            <DateTimePicker
              id="startTime"
              isRequired
              label="Start date & time"
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
              {...register("duration", {
                required: "Please enter duration",
              })}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Number of Questions"
              type="number"
              id="amountOfQuestions"
              placeholder="Enter number of questions"
              error={errors.amountOfQuestions?.message}
              {...register("amountOfQuestions", {
                required: "Please enter number of questions",
              })}
            />
          </GridItem>
        </Box>
      </Box>
      <Flex paddingY={10} marginX={6} justifyContent="space-between">
        <Button secondary onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          isLoading={isSubmitting}
          disabled={isSubmitting}
          s
          loadingText="Saving"
          type="submit"
        >
          Save
        </Button>
      </Flex>
    </Box>
  );
};

export default OverViewStandalone;
