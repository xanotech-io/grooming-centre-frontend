import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import {
  Button,
  DateTimePicker,
  Input,
} from "../../../../../components";
import {
  useDateTimePicker,
  useGoBack,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  adminCreateAssessment,
} from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";

const CreateModuleAssessmentPage = () => {
  const { courseId, moduleId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const startTimeManager = useDateTimePicker();

  const onSubmit = async (data) => {
    try {
      const startTime = startTimeManager.handleGetValueAndValidate("Start Time");

      const body = {
        ...data,
        courseId,
        moduleId,
        duration: Number(data.duration),
        amountOfQuestions: Number(data.amountOfQuestions),
        startTime: formatDateToISO(startTime),
      };

      const { message, assessment } = await adminCreateAssessment(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      push(
        `/admin/courses/${courseId}/assessment/${assessment.id}/questions/new`
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
            placeholder="e.g. Assessment 1"
            isRequired
            error={errors.title?.message}
            mb={6}
            {...register("title", { required: "Title is required" })}
          />

          <Input
            label="Duration (minutes)"
            type="number"
            placeholder="e.g. 30"
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
            placeholder="e.g. 10"
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

          <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
            <Button secondary onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Assessment
            </Button>
          </Box>
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateModuleAssessmentPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <CreateModuleAssessmentPage {...props} />}
    />
  );
};

export default CreateModuleAssessmentPageRoute;
