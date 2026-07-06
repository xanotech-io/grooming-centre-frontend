import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex, Alert, AlertIcon } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import { Switch } from "@chakra-ui/switch";
import { Select as ChakraSelect } from "@chakra-ui/select";
import {
  Button,
  DateTimePicker,
  Input,
  Select,
  Text,
  WorkflowSubmitModal,
} from "../../../../../components";
import {
  useDateTimePicker,
  useGoBack,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  adminCreateExamination,
  adminEditExamination,
  adminGetExaminationById,
  adminGetMarkingTemplates,
} from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";
import useAssessmentStore from "../../../../../store/assessmentStore";

const SectionCard = ({ title, children }) => (
  <Box
    border="1px solid"
    borderColor="gray.200"
    borderRadius="md"
    overflow="hidden"
    mb={6}
  >
    <Box
      bg="gray.50"
      px={5}
      py={3}
      borderBottom="1px solid"
      borderColor="gray.200"
    >
      <Text
        fontWeight="600"
        fontSize="sm"
        color="gray.600"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {title}
      </Text>
    </Box>
    <Box px={5} py={5}>
      {children}
    </Box>
  </Box>
);

const BoolRow = ({ label, description, checked, onChange }) => (
  <Flex justifyContent="space-between" alignItems="center" py={2}>
    <Box>
      <Text fontSize="sm" fontWeight="500">
        {label}
      </Text>
      {description && (
        <Text fontSize="xs" color="gray.500">
          {description}
        </Text>
      )}
    </Box>
    <Switch
      isChecked={checked}
      onChange={(e) => onChange(e.target.checked)}
      colorScheme="purple"
    />
  </Flex>
);

const CreateModuleExaminationPage = () => {
  const { courseId, moduleId, examinationId } = useParams();
  const isEditMode = useMemo(() => examinationId && examinationId !== "new", [examinationId]);
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const setAssessment = useAssessmentStore((s) => s.setAssessment);

  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loadingExam, setLoadingExam] = useState(false);

  // Navigation
  const [navigationMode, setNavigationMode] = useState("free");

  // Randomization
  const [randomization, setRandomization] = useState({
    question_order: false,
    option_order: false,
  });

  // UI Settings
  const [uiSettings, setUiSettings] = useState({
    theme: "default",
    font_size: 16,
    font_family: "default",
    progress_indicator: true,
  });

  // Tools
  const [tools, setTools] = useState({
    calculator: "none",
    spellchecker: false,
    scratchpad: false,
  });

  // Accessibility
  const [accessibility, setAccessibility] = useState({
    font_scaling: false,
    dyslexia_font: false,
    high_contrast: false,
    screen_reader: false,
  });

  // Submission
  const [submission, setSubmission] = useState({
    confirmation_dialog: true,
    auto_submit: false,
  });
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);

  useEffect(() => {
    adminGetMarkingTemplates()
      .then(({ templates }) => setMarkingTemplates(templates))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const startTimeManager = useDateTimePicker();

  // Load existing exam data when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    setLoadingExam(true);
    adminGetExaminationById(examinationId)
      .then(({ examination: exam }) => {
        setValue("title", exam.title);
        setValue("duration", exam.duration);
        setValue("amountOfQuestions", exam.amountOfQuestions);
        if (exam.startTime) startTimeManager.handleChange(new Date(exam.startTime));
        if (exam.markingTemplateId) setMarkingTemplateId(exam.markingTemplateId);
        if (exam.navigationMode) setNavigationMode(exam.navigationMode);
        if (exam.randomizationConfig) setRandomization(exam.randomizationConfig);
        if (exam.uiSettings) setUiSettings(exam.uiSettings);
        if (exam.toolsEnabled) setTools(exam.toolsEnabled);
        if (exam.accessibilitySettings) setAccessibility(exam.accessibilitySettings);
        if (exam.submissionSettings) setSubmission(exam.submissionSettings);
        setIsPublished(exam.active === true || exam.isPublished === true);
      })
      .catch((err) => {
        toast({
          description: capitalizeFirstLetter(err?.response?.data?.message || "Failed to load examination data."),
          position: "top",
          status: "error",
        });
      })
      .finally(() => setLoadingExam(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, examinationId]);
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");

      if (!markingTemplateId)
        throw new Error(
          "A marking template must be selected before saving an examination.",
        );

      const body = {
        title: data.title,
        duration: Number(data.duration),
        amountOfQuestions: Number(data.amountOfQuestions),
        startTime: formatDateToISO(startTime),
        courseId,
        moduleId,
        markingTemplateId,
        navigationMode,
        randomizationConfig: randomization,
        uiSettings: { ...uiSettings, font_size: Number(uiSettings.font_size) },
        toolsEnabled: tools,
        accessibilitySettings: accessibility,
        submissionSettings: submission,
      };

      if (isEditMode) {
        const { message } = await adminEditExamination(examinationId, body);
        toast({
          description: capitalizeFirstLetter(message || "Examination updated successfully."),
          position: "top",
          status: "success",
        });
        setWorkflowContent({
          contentId: examinationId,
          contentTitle: data.title,
          requestType: "Exam",
          courseId,
          nextRoute: `/admin/courses/${courseId}/module/${moduleId}/examinations/view/${examinationId}`,
        });
        setWorkflowModalOpen(true);
      } else {
        const { message, examination } = await adminCreateExamination(body);
        setAssessment(examination);

        toast({
          description: capitalizeFirstLetter(message),
          position: "top",
          status: "success",
        });
        setWorkflowContent({
          contentId: examination.id,
          contentTitle: data.title,
          requestType: "Exam",
          courseId,
          nextRoute: `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${examination.id}`,
        });
        setWorkflowModalOpen(true);
      }
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(
          error?.response?.data?.message || error.message,
        ),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY={14} marginX={6}>
        {isPublished && (
          <Alert status="warning" mb={6} borderRadius="md">
            <AlertIcon />
            This exam is published. Settings are locked. Unpublish the exam first to make changes.
          </Alert>
        )}
        {/* ── Basic Info ── */}
        <SectionCard title="Basic Information">
          <Input
            label="Title"
            placeholder="e.g. Final Examination"
            isRequired
            error={errors.title?.message}
            mb={6}
            {...register("title", { required: "Title is required" })}
          />

          <Flex gap={4} mb={6}>
            <Box flex={1}>
              <Input
                label="Duration (minutes)"
                type="number"
                placeholder="e.g. 60"
                isRequired
                error={errors.duration?.message}
                {...register("duration", {
                  required: "Duration is required",
                  min: {
                    value: 1,
                    message: "Duration must be at least 1 minute",
                  },
                })}
              />
            </Box>
            <Box flex={1}>
              <Input
                label="Number of Questions"
                type="number"
                placeholder="e.g. 20"
                isRequired
                error={errors.amountOfQuestions?.message}
                {...register("amountOfQuestions", {
                  required: "Number of questions is required",
                  min: { value: 1, message: "Must have at least 1 question" },
                })}
              />
            </Box>
          </Flex>

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
            options={markingTemplates.map((t) => ({
              label: t.markingTemplateName,
              value: t.id,
            }))}
          />
        </SectionCard>

        {/* ── Navigation & Randomization ── */}
        <SectionCard title="Navigation & Randomization">
          <Box mb={5}>
            <Text fontSize="sm" fontWeight="500" mb={1}>
              Navigation Mode
            </Text>
            <ChakraSelect
              value={navigationMode}
              onChange={(e) => setNavigationMode(e.target.value)}
              size="sm"
              maxW="280px"
            >
              <option value="free">Free — jump to any question</option>
              <option value="linear">Linear — must answer in order</option>
              <option value="section-locked">
                Section-locked — finish section before moving on
              </option>
            </ChakraSelect>
          </Box>
          <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
            <Button secondary onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} isDisabled={isPublished}>
              {isEditMode ? "Save Changes" : "Create Examination"}
            </Button>
          </Box>

          <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
            <Text fontSize="sm" fontWeight="500" mb={3}>
              Randomization
            </Text>
            <BoolRow
              label="Randomize question order"
              description="Questions are presented in a random order for each student"
              checked={randomization.question_order}
              onChange={(v) =>
                setRandomization((p) => ({ ...p, question_order: v }))
              }
            />
            <BoolRow
              label="Randomize option order"
              description="Answer options for each question are shuffled"
              checked={randomization.option_order}
              onChange={(v) =>
                setRandomization((p) => ({ ...p, option_order: v }))
              }
            />
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
        </SectionCard>

        {/* ── UI Settings ── */}
        <SectionCard title="UI Settings">
          <Flex gap={4} mb={4} flexWrap="wrap">
            <Box minW="140px">
              <Text fontSize="sm" fontWeight="500" mb={1}>
                Theme
              </Text>
              <ChakraSelect
                value={uiSettings.theme}
                onChange={(e) =>
                  setUiSettings((p) => ({ ...p, theme: e.target.value }))
                }
                size="sm"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </ChakraSelect>
            </Box>
            <Box minW="120px">
              <Text fontSize="sm" fontWeight="500" mb={1}>
                Font Size (px)
              </Text>
              <input
                type="number"
                min={10}
                max={32}
                value={uiSettings.font_size}
                onChange={(e) =>
                  setUiSettings((p) => ({ ...p, font_size: e.target.value }))
                }
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                  padding: "6px 10px",
                  fontSize: 14,
                  width: "100%",
                }}
              />
            </Box>
            <Box minW="160px">
              <Text fontSize="sm" fontWeight="500" mb={1}>
                Font Family
              </Text>
              <ChakraSelect
                value={uiSettings.font_family}
                onChange={(e) =>
                  setUiSettings((p) => ({ ...p, font_family: e.target.value }))
                }
                size="sm"
              >
                <option value="default">Default</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="monospace">Monospace</option>
              </ChakraSelect>
            </Box>
          </Flex>
          <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
            <BoolRow
              label="Show progress indicator"
              description="Display a progress bar or question counter during the exam"
              checked={uiSettings.progress_indicator}
              onChange={(v) =>
                setUiSettings((p) => ({ ...p, progress_indicator: v }))
              }
            />
          </Box>
        </SectionCard>

        {/* ── Tools ── */}
        <SectionCard title="Tools">
          <Box mb={4}>
            <Text fontSize="sm" fontWeight="500" mb={1}>
              Calculator
            </Text>
            <ChakraSelect
              value={tools.calculator}
              onChange={(e) =>
                setTools((p) => ({ ...p, calculator: e.target.value }))
              }
              size="sm"
              maxW="220px"
            >
              <option value="none">None</option>
              <option value="basic">Basic</option>
              <option value="scientific">Scientific</option>
            </ChakraSelect>
          </Box>
          <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
            <BoolRow
              label="Spellchecker"
              description="Underline misspelled words in text responses"
              checked={tools.spellchecker}
              onChange={(v) => setTools((p) => ({ ...p, spellchecker: v }))}
            />
            <BoolRow
              label="Scratchpad"
              description="Allow students to make working notes during the exam"
              checked={tools.scratchpad}
              onChange={(v) => setTools((p) => ({ ...p, scratchpad: v }))}
            />
          </Box>
        </SectionCard>

        {/* ── Accessibility ── */}
        <SectionCard title="Accessibility">
          <BoolRow
            label="Font scaling"
            description="Students can increase or decrease the text size"
            checked={accessibility.font_scaling}
            onChange={(v) =>
              setAccessibility((p) => ({ ...p, font_scaling: v }))
            }
          />
          <BoolRow
            label="Dyslexia-friendly font"
            description="Use OpenDyslexic or similar font"
            checked={accessibility.dyslexia_font}
            onChange={(v) =>
              setAccessibility((p) => ({ ...p, dyslexia_font: v }))
            }
          />
          <BoolRow
            label="High contrast mode"
            description="Increase contrast for visually impaired students"
            checked={accessibility.high_contrast}
            onChange={(v) =>
              setAccessibility((p) => ({ ...p, high_contrast: v }))
            }
          />
          <BoolRow
            label="Screen reader support"
            description="Optimise layout for screen reader compatibility"
            checked={accessibility.screen_reader}
            onChange={(v) =>
              setAccessibility((p) => ({ ...p, screen_reader: v }))
            }
          />
        </SectionCard>

        {/* ── Submission Settings ── */}
        <SectionCard title="Submission Settings">
          <BoolRow
            label="Confirmation dialog"
            description="Show a confirmation prompt before final submission"
            checked={submission.confirmation_dialog}
            onChange={(v) =>
              setSubmission((p) => ({ ...p, confirmation_dialog: v }))
            }
          />
          <BoolRow
            label="Auto-submit on time expiry"
            description="Automatically submit the paper when the timer runs out"
            checked={submission.auto_submit}
            onChange={(v) => setSubmission((p) => ({ ...p, auto_submit: v }))}
          />
        </SectionCard>

        <Flex gap={4} justifyContent="flex-end" mt={2} mb={10}>
          <Button secondary onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting || loadingExam} isDisabled={isPublished}>
            {isEditMode ? "Save Changes" : "Create Examination"}
          </Button>
        </Flex>
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
