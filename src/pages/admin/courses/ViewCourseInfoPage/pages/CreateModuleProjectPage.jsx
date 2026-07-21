import { useRef, useState } from "react";
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
import {
  useDateTimePicker,
  useGoBack,
  useIsSuperAdmin,
  useRichText,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { createModuleProject, auditTrailV2PostLog } from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";

const CreateModuleProjectPage = () => {
  const { courseId, moduleId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const isSuperAdmin = useIsSuperAdmin();
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingBodyRef = useRef(null);
  const resultProjectRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { maxGrade: 100 } });

  const dueDateManager = useDateTimePicker();
  const descriptionManager = useRichText();
  const instructionsManager = useRichText();

  const performCreate = async (body) => {
    try {
      const { message, project } = await createModuleProject(moduleId, body);
      resultProjectRef.current = project;
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      auditTrailV2PostLog({
        eventType: "create",
        module: "LMS",
        status: "success",
        resourceId: project?.id,
        resourceType: "Project",
        remarks: `Created project "${body.title}"`,
      }).catch(() => {});
      return { id: project?.id ?? moduleId };
    } catch (error) {
      auditTrailV2PostLog({
        eventType: "create",
        module: "LMS",
        status: "failure",
        resourceId: moduleId,
        resourceType: "Project",
        remarks: error?.response?.data?.message || error.message || `Failed to create project "${body.title}"`,
      }).catch(() => {});
      throw error;
    }
  };

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

      const workflowContentBase = {
        contentTitle: data.title,
        requestType: "Project",
        courseId,
      };

      if (isSuperAdmin) {
        // Super admins create right away — the modal below only offers an
        // optional supervisor review afterward.
        const created = await performCreate(body);
        setWorkflowContent({ ...workflowContentBase, contentId: created.id });
      } else {
        // Instructors must submit for approval before this gets created —
        // hold off until the modal below completes.
        pendingBodyRef.current = body;
        setWorkflowContent(workflowContentBase);
      }
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
          onClose={() => {
            setWorkflowModalOpen(false);
            if (isSuperAdmin)
              push(`/admin/courses/${courseId}/module/${moduleId}/projects`);
          }}
          isDismissable={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          courseId={workflowContent.courseId}
          onCreate={
            isSuperAdmin
              ? undefined
              : (supervisorId) =>
                  performCreate({ ...pendingBodyRef.current, supervisor_id: supervisorId })
          }
          onSuccess={() =>
            push(`/admin/courses/${courseId}/module/${moduleId}/projects`)
          }
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
