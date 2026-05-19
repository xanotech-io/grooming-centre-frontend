import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import {
  Button,
  DateTimePicker,
  Input,
  RichText,
  Select,
  WorkflowReviewSection,
} from "../../../../../components";
import { useDateTimePicker, useGoBack, useRichText, useWorkflowReview } from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { createModuleProject } from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

const CreateModuleProjectPage = () => {
  const { courseId, moduleId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { status: "draft", maxGrade: 100 } });

  const dueDateManager = useDateTimePicker();
  const descriptionManager = useRichText();
  const instructionsManager = useRichText();
  const {
    requestReview,
    setRequestReview,
    selectedSupervisorId,
    setSelectedSupervisorId,
    supervisors,
    supervisorsLoading,
    supervisorsError,
    submitWorkflowIfRequested,
  } = useWorkflowReview();

  const onSubmit = async (data) => {
    try {
      const dueDate = dueDateManager.handleGetValueAndValidate("Due Date");
      const description = descriptionManager.data.raw
        ? descriptionManager.handleGetValueAndValidate("Description")
        : undefined;
      const instructions = instructionsManager.data.raw
        ? instructionsManager.handleGetValueAndValidate("Instructions")
        : undefined;

      const body = {
        title: data.title,
        description,
        instructions,
        dueDate: formatDateToISO(dueDate),
        maxGrade: Number(data.maxGrade),
        status: data.status || "draft",
      };

      const { message, project } = await createModuleProject(moduleId, body);

      await submitWorkflowIfRequested({
        contentId: project?.id ?? moduleId,
        contentTitle: data.title,
        requestType: "Project",
        description: description ?? "",
      });

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      push(`/admin/courses/${courseId}/module/${moduleId}/projects`);
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
            label="Project Title"
            placeholder='e.g. "Build a Grooming Portfolio"'
            isRequired
            error={errors.title?.message}
            mb={6}
            {...register("title", { required: "Title is required" })}
          />

          <RichText
            id="description"
            label="Description"
            placeholder="Brief description of the project"
            defaultValue={descriptionManager.data.default}
            onChange={descriptionManager.handleChange}
            mb={6}
          />

          <RichText
            id="instructions"
            label="Instructions"
            placeholder="Step-by-step instructions for completing the project"
            defaultValue={instructionsManager.data.default}
            onChange={instructionsManager.handleChange}
            mb={6}
          />

          <DateTimePicker
            label="Due Date"
            isRequired
            value={dueDateManager.value}
            onChange={dueDateManager.handleChange}
            mb={6}
          />

          <Input
            label="Max Grade"
            type="number"
            placeholder="e.g. 100"
            isRequired
            error={errors.maxGrade?.message}
            mb={6}
            {...register("maxGrade", {
              required: "Max grade is required",
              min: { value: 1, message: "Max grade must be at least 1" },
            })}
          />

          <Select
            label="Status"
            isRequired
            options={STATUS_OPTIONS}
            mb={6}
            {...register("status")}
          />

          <WorkflowReviewSection
            requestReview={requestReview}
            onToggle={() => { setRequestReview((p) => !p); setSelectedSupervisorId(""); }}
            selectedSupervisorId={selectedSupervisorId}
            onSupervisorChange={setSelectedSupervisorId}
            supervisors={supervisors}
            supervisorsLoading={supervisorsLoading}
            supervisorsError={supervisorsError}
          />

          <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
            <Button secondary onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Project
            </Button>
          </Box>
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateModuleProjectPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <CreateModuleProjectPage {...props} />}
    />
  );
};

export default CreateModuleProjectPageRoute;
