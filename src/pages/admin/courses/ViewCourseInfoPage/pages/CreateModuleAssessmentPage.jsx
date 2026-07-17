import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { Checkbox } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  DateTimePicker,
  Input,
  Select,
  WorkflowSubmitModal,
} from "../../../../../components";
import {
  useDateTimePicker,
  useGoBack,
  useIsSuperAdmin,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  adminCreateAssessment,
  adminGetMarkingTemplates,
  auditTrailV2PostLog,
} from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO, setAutoAddToBank } from "../../../../../utils";
import useAssessmentStore from "../../../../../store/assessmentStore";

const CreateModuleAssessmentPage = () => {
  const { courseId, moduleId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const isSuperAdmin = useIsSuperAdmin();
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingBodyRef = useRef(null);
  const resultAssessmentRef = useRef(null);

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

  const performCreate = async (body) => {
    try {
      const { message, assessment } = await adminCreateAssessment(body);
      resultAssessmentRef.current = assessment;
      setAssessment(assessment);
      if (addToBank) setAutoAddToBank("assessment", assessment.id);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      auditTrailV2PostLog({
        eventType: "create",
        module: "LMS",
        status: "success",
        resourceId: assessment.id,
        resourceType: "Assessment",
        remarks: `Created assessment "${body.title}"`,
      }).catch(() => {});
      return { id: assessment.id };
    } catch (error) {
      auditTrailV2PostLog({
        eventType: "create",
        module: "LMS",
        status: "failure",
        resourceId: courseId,
        resourceType: "Assessment",
        remarks: error?.response?.data?.message || error.message || `Failed to create assessment "${body.title}"`,
      }).catch(() => {});
      throw error;
    }
  };

  const handleWorkflowFinished = () =>
    push(
      `/admin/courses/${courseId}/assessment/${resultAssessmentRef.current?.id}/questions/new?moduleId=${moduleId}`,
    );

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
        startTime: formatDateToISO(startTime),
        markingTemplateId,
      };

      const workflowContentBase = {
        contentTitle: data.title,
        requestType: "CourseAssessment",
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
              Create Assessment
            </Button>
          </Box>
        </Box>

        {workflowContent && (
          <WorkflowSubmitModal
            isOpen={workflowModalOpen}
            onClose={() => {
              setWorkflowModalOpen(false);
              if (isSuperAdmin) handleWorkflowFinished();
            }}
            isDismissable={isSuperAdmin}
            contentId={workflowContent.contentId}
            contentTitle={workflowContent.contentTitle}
            requestType={workflowContent.requestType}
            courseId={workflowContent.courseId}
            onCreate={isSuperAdmin ? undefined : () => performCreate(pendingBodyRef.current)}
            onSuccess={handleWorkflowFinished}
          />
        )}
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
