import { Route, useParams, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Alert,
  AlertIcon,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import { useEffect, useState, useMemo, useRef } from "react";
import { Switch } from "@chakra-ui/switch";
import { Select as ChakraSelect } from "@chakra-ui/select";
import { FiTrash2 } from "react-icons/fi";
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
  useIsSuperAdmin,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  adminCreateExamination,
  adminEditExamination,
  adminGetExaminationById,
  adminGetMarkingTemplates,
  getExaminationById as getExamPaperConfig,
  updateExaminationById as updateExamPaperConfig,
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

const EMPTY_SECTION = { section_name: "", questions_count: 1, time_limit: null };

const SectionRow = ({ section, idx, onChange, onRemove }) => (
  <Flex gap={3} alignItems="center" mb={3}>
    <Box flex={2}>
      <Input
        placeholder="Section name e.g. Section A"
        value={section.section_name}
        onChange={(e) => onChange(idx, "section_name", e.target.value)}
      />
    </Box>
    <Box flex={1}>
      <NumberInput
        min={1}
        value={section.questions_count}
        onChange={(val) => onChange(idx, "questions_count", Number(val))}
      >
        <NumberInputField placeholder="Questions" />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Box>
    <Box flex={1}>
      <NumberInput
        min={0}
        value={section.time_limit ?? ""}
        onChange={(val) => onChange(idx, "time_limit", val ? Number(val) : null)}
      >
        <NumberInputField placeholder="Time (min)" />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Box>
    <IconButton
      aria-label="Remove section"
      icon={<FiTrash2 size={14} />}
      size="sm"
      variant="ghost"
      colorScheme="red"
      onClick={() => onRemove(idx)}
    />
  </Flex>
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
  const isSuperAdmin = useIsSuperAdmin();
  const setAssessment = useAssessmentStore((s) => s.setAssessment);

  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loadingExam, setLoadingExam] = useState(false);

  // Sections
  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, { ...EMPTY_SECTION }]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

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
  });
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingBodyRef = useRef(null);
  const resultExaminationRef = useRef(null);

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
    Promise.all([
      adminGetExaminationById(examinationId),
      getExamPaperConfig(examinationId, "examination").catch(() => null),
    ])
      .then(([{ examination: exam }, paperConfigRes]) => {
        setValue("title", exam.title);
        setValue("duration", exam.duration);
        setValue("amountOfQuestions", exam.amountOfQuestions);
        if (exam.startTime) startTimeManager.handleChange(new Date(exam.startTime));
        if (exam.markingTemplateId) setMarkingTemplateId(exam.markingTemplateId);

        const cfg = paperConfigRes?.data;
        if (cfg) {
          if (Array.isArray(cfg.configuredSections)) setSections(cfg.configuredSections);
          if (cfg.navigationMode) setNavigationMode(cfg.navigationMode);
          if (cfg.randomization) setRandomization(cfg.randomization);
          if (cfg.uiSettings) setUiSettings(cfg.uiSettings);
          if (cfg.paperStatus) setIsPublished((p) => p || cfg.paperStatus === "published");
        }
        setIsPublished((p) => p || exam.active === true || exam.isPublished === true);
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
  const performEdit = async ({ body, paperConfigBody }) => {
    const { message } = await adminEditExamination(examinationId, body);
    await updateExamPaperConfig(examinationId, paperConfigBody).catch(() => {});
    toast({
      description: capitalizeFirstLetter(message || "Examination updated successfully."),
      position: "top",
      status: "success",
    });
    return { id: examinationId };
  };

  const performCreate = async ({ body, paperConfigBody }) => {
    const { message, examination } = await adminCreateExamination(body);
    await updateExamPaperConfig(examination.id, paperConfigBody).catch(() => {});
    resultExaminationRef.current = examination;
    setAssessment({ ...examination, sections });
    toast({
      description: capitalizeFirstLetter(message),
      position: "top",
      status: "success",
    });
    return { id: examination.id };
  };

  const handleWorkflowFinished = () => {
    const nextRoute = isEditMode
      ? `/admin/courses/${courseId}/module/${moduleId}/examinations/view/${examinationId}`
      : `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${resultExaminationRef.current?.id}`;
    push(nextRoute);
  };

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
      };

      const paperConfigBody = {
        examType: "examination",
        configuredSections: sections.map((s) => ({
          section_name: s.section_name,
          questions_count: Number(s.questions_count) || 0,
          time_limit: s.time_limit ? Number(s.time_limit) : null,
        })),
        navigationMode,
        timeLimitMinutes: Number(data.duration) || 0,
        randomization,
        uiSettings: { ...uiSettings, font_size: Number(uiSettings.font_size) },
      };

      const pendingBody = { body, paperConfigBody };

      const workflowContentBase = {
        contentTitle: data.title,
        requestType: "CourseExam",
        courseId,
      };

      if (isEditMode) {
        if (isSuperAdmin) {
          await performEdit(pendingBody);
        } else {
          pendingBodyRef.current = pendingBody;
        }
        setWorkflowContent({ ...workflowContentBase, contentId: examinationId });
      } else if (isSuperAdmin) {
        // Super admins create right away — the modal below only offers an
        // optional supervisor review afterward.
        const created = await performCreate(pendingBody);
        setWorkflowContent({ ...workflowContentBase, contentId: created.id });
      } else {
        // Instructors must submit for approval before this gets created —
        // hold off until the modal below completes.
        pendingBodyRef.current = pendingBody;
        setWorkflowContent(workflowContentBase);
      }
      setWorkflowModalOpen(true);
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

        {/* ── Sections ── */}
        <SectionCard title="Sections">
          {sections.length === 0 && (
            <Text fontSize="sm" color="gray.500" mb={3}>
              No sections added yet. Sections let you group questions and optionally cap time per group.
            </Text>
          )}
          {sections.map((s, i) => (
            <SectionRow key={i} section={s} idx={i} onChange={updateSection} onRemove={removeSection} />
          ))}
          <Button secondary type="button" onClick={addSection}>
            + Add Section
          </Button>
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
              onClose={() => {
                setWorkflowModalOpen(false);
                if (isSuperAdmin) handleWorkflowFinished();
              }}
              isDismissable={isSuperAdmin}
              contentId={workflowContent.contentId}
              contentTitle={workflowContent.contentTitle}
              requestType={workflowContent.requestType}
              courseId={workflowContent.courseId}
              onCreate={
                isSuperAdmin
                  ? undefined
                  : () =>
                      isEditMode
                        ? performEdit(pendingBodyRef.current)
                        : performCreate(pendingBodyRef.current)
              }
              onSuccess={handleWorkflowFinished}
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
