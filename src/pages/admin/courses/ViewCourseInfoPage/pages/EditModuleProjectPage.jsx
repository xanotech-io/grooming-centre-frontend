import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  DateTimePicker,
  Input,
  Select,
  Spinner,
  Textarea,
  WorkflowSubmitModal,
} from "../../../../../components";
import { useDateTimePicker, useGoBack, useIsSuperAdmin } from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { getProjectById, updateProject, auditTrailV2PostLog } from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

const EditModuleProjectPage = () => {
  const { courseId, moduleId, projectId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const isSuperAdmin = useIsSuperAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingBodyRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const dueDateManager = useDateTimePicker();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { project } = await getProjectById(projectId);
        reset({
          title: project.title,
          description: project.description || "",
          instructions: project.instructions || "",
          maxGrade: project.maxGrade,
          status: project.status,
        });
        if (project.dueDate) {
          dueDateManager.handleChange(new Date(project.dueDate));
        }
      } catch {
        toast({
          description: "Failed to load project.",
          position: "top",
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const performEdit = async (body) => {
    try {
      const { message } = await updateProject(projectId, body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      auditTrailV2PostLog({
        eventType: "update",
        module: "LMS",
        status: "success",
        resourceId: projectId,
        resourceType: "Project",
        remarks: `Updated project "${body.title}"`,
      }).catch(() => {});
      return { id: projectId };
    } catch (error) {
      auditTrailV2PostLog({
        eventType: "update",
        module: "LMS",
        status: "failure",
        resourceId: projectId,
        resourceType: "Project",
        remarks: error?.response?.data?.message || error.message || `Failed to update project "${body.title}"`,
      }).catch(() => {});
      throw error;
    }
  };

  const onSubmit = async (data) => {
    try {
      const dueDate = dueDateManager.handleGetValueAndValidate("Due Date");

      const body = {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        dueDate: formatDateToISO(dueDate),
        maxGrade: Number(data.maxGrade),
        status: data.status || "draft",
      };

      // Everyone, including super admin, must submit for approval before
      // this edit takes effect — hold off until the modal below completes.
      // Super admin submissions carry a null supervisor instead of skipping
      // the workflow.
      pendingBodyRef.current = body;

      setWorkflowContent({
        contentId: projectId,
        contentTitle: data.title,
        requestType: "Project",
        courseId,
        nextRoute: `/admin/courses/${courseId}/module/${moduleId}/projects/${projectId}/view`,
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" paddingTop="100px">
        <Spinner />
      </Box>
    );
  }

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

          <Textarea
            label="Description"
            placeholder="Brief description of the project"
            error={errors.description?.message}
            mb={6}
            rows={3}
            {...register("description")}
          />

          <Textarea
            label="Instructions"
            placeholder="Step-by-step instructions for completing the project"
            error={errors.instructions?.message}
            mb={6}
            rows={5}
            {...register("instructions")}
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

          <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
            <Button secondary onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </Box>
        </Box>
      </Box>

      {workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          courseId={workflowContent.courseId}
          onCreate={(supervisorId) =>
            performEdit({ ...pendingBodyRef.current, supervisor_id: supervisorId })
          }
          onSuccess={() => push(workflowContent.nextRoute)}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const EditModuleProjectPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <EditModuleProjectPage {...props} />}
    />
  );
};

export default EditModuleProjectPageRoute;
