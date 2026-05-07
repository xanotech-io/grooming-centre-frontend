import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Button,
  DateTimePicker,
  Input,
  Select,
} from "../../../../../components";
import {
  useDateTimePicker,
  useGoBack,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  adminCreateExamination,
  adminGetMarkingTemplates,
} from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";

const CreateModuleExaminationPage = () => {
  const { courseId, moduleId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();

  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");

  useEffect(() => {
    adminGetMarkingTemplates()
      .then(({ templates }) => setMarkingTemplates(templates))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const startTimeManager = useDateTimePicker();

  const onSubmit = async (data) => {
    try {
      const startTime = startTimeManager.handleGetValueAndValidate("Start Time");

      if (!markingTemplateId) throw new Error("A marking template must be selected before creating an examination.");

      const body = {
        ...data,
        courseId,
        moduleId,
        duration: Number(data.duration),
        amountOfQuestions: Number(data.amountOfQuestions),
        startTime: formatDateToISO(startTime),
        markingTemplateId,
      };

      const { message, examination } = await adminCreateExamination(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      push(
        `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${examination.id}`
      );
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(
          error?.response?.data?.message || error.message
        ),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY={14} marginX={6}>
        <Box backgroundColor="white" padding={10}>
          <Input
            label="Title"
            placeholder="e.g. Final Examination"
            isRequired
            error={errors.title?.message}
            mb={6}
            {...register("title", { required: "Title is required" })}
          />

          <Input
            label="Duration (minutes)"
            type="number"
            placeholder="e.g. 60"
            isRequired
            error={errors.duration?.message}
            mb={6}
            {...register("duration", {
              required: "Duration is required",
              min: { value: 1, message: "Duration must be at least 1 minute" },
            })}
          />

          <Input
            label="Number of Questions"
            type="number"
            placeholder="e.g. 20"
            isRequired
            error={errors.amountOfQuestions?.message}
            mb={6}
            {...register("amountOfQuestions", {
              required: "Number of questions is required",
              min: { value: 1, message: "Must have at least 1 question" },
            })}
          />

          <DateTimePicker
            label="Start Time"
            isRequired
            value={startTimeManager.value}
            onChange={startTimeManager.handleChange}
            mb={6}
          />

          <Select
            label="Marking Template"
            placeholder="Select a marking template"
            isRequired
            value={markingTemplateId}
            onChange={(e) => setMarkingTemplateId(e.target.value)}
            options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
            mb={6}
          />

          <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
            <Button secondary onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Examination
            </Button>
          </Box>
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateModuleExaminationPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <CreateModuleExaminationPage {...props} />}
    />
  );
};

export default CreateModuleExaminationPageRoute;
