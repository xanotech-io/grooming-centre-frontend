import { useState } from "react";
import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import {
  Button,
  DateTimePicker,
  Input,
  RichText,
  WorkflowSubmitModal,
} from "../../../../../components";
import { useDateTimePicker, useGoBack, useRichText } from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { createModuleProject } from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";

const CreateModuleProjectPage = () => {
  const { courseId, moduleId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { maxGrade: 100 } });

  const dueDateManager = useDateTimePicker();
  const descriptionManager = useRichText();
  const instructionsManager = useRichText();
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
        // New projects are saved as draft until a supervisor approves them
        status: "draft",
      };

      const { message, project } = await createModuleProject(moduleId, body);

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      setWorkflowContent({
        contentId: project?.id ?? moduleId,
        contentTitle: data.title,
        requestType: "Project",
        courseId,
        nextRoute: `/admin/courses/${courseId}/module/${moduleId}/projects`,
      });
      setWorkflowModalOpen(true);
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

      {workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isDismissable={false}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          courseId={workflowContent.courseId}
          onSuccess={() => push(workflowContent.nextRoute)}
        />
      )}
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
