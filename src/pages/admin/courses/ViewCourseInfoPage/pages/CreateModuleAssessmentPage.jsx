import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { Checkbox } from "@chakra-ui/react";
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
  adminGetMarkingTemplates,
} from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";
import useAssessmentStore from "../../../../../store/assessmentStore";

const CreateModuleAssessmentPage = () => {
  const { courseId, moduleId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);

  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");
  const [addToBank, setAddToBank] = useState(false);

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

      if (!markingTemplateId) throw new Error("A marking template must be selected before creating an assessment.");

      const body = {
        ...data,
        courseId,
        moduleId,
        duration: Number(data.duration),
        amountOfQuestions: Number(data.amountOfQuestions),
        totalMarks: Number(data.totalMarks),
        startTime: formatDateToISO(startTime),
        markingTemplateId,
      };

      // Nothing is created yet — hold the details in memory and create both
      // the assessment and the first question together once "Create and
      // Submit" is clicked on the question step below.
      setPendingCreate({
        kind: "ModuleAssessment",
        body,
        markingTemplateId,
        addToBank,
        title: data.title,
      });
      push(
        `/admin/courses/${courseId}/assessment/new/questions/new?moduleId=${moduleId}&submitForApproval=1`,
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

          <Input
            label="Total Marks"
            type="number"
            placeholder="e.g. 100"
            isRequired
            error={errors.totalMarks?.message}
            mb={6}
            {...register("totalMarks", {
              required: "Total marks is required",
              min: { value: 1, message: "Must be at least 1 mark" },
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

          <Checkbox
            isChecked={addToBank}
            onChange={(e) => setAddToBank(e.target.checked)}
            colorScheme="purple"
            mt={2}
          >
            Add to Question Bank — automatically save every question created for this assessment to the bank
          </Checkbox>

          <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
            <Button secondary onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Next
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
