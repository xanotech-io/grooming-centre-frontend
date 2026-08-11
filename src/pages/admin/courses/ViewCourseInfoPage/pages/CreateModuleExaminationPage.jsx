import { Route, useParams, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Alert,
  AlertIcon,
  Checkbox,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import { useEffect, useState, useMemo, useRef } from "react";
import { Switch } from "@chakra-ui/switch";
import { Select as ChakraSelect } from "@chakra-ui/select";
import {
  Breadcrumb,
  Button,
  DateTimePicker,
  Input,
  Link,
  Select,
  Text,
} from "../../../../../components";
import {
  useDateTimePicker,
  useGoBack,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  adminGetExaminationById,
  getExaminationById as getExamPaperConfig,
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
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const fromBankQuestionIds = useAssessmentStore((s) => s.fromBankQuestionIds);
  const clearFromBankQuestionIds = useAssessmentStore((s) => s.clearFromBankQuestionIds);
  // Captured once on mount: whatever the Question Bank's "use in a new exam"
  // picker left behind belongs to this visit — consume it immediately so a
  // later, unrelated create flow can never pick up a stale value.
  const bankQuestionIdsRef = useRef(fromBankQuestionIds);
  useEffect(() => {
    if (fromBankQuestionIds?.length) clearFromBankQuestionIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `pendingCreate` persists indefinitely (localStorage) and this page's own
  // onSubmit carries forward `pendingCreate?.questions` unchanged (below) —
  // without this, any exam abandoned mid-creation leaves its title/sections/
  // queued questions sitting around forever, silently resurfacing (already
  // pre-filled/pre-loaded questions) the next time this page is visited
  // fresh to create a genuinely new exam. Cleared unconditionally on every
  // create-mode mount — the one accepted trade-off is that using the
  // Header's "Overview" tab to go back mid-flow also wipes the in-progress
  // draft, since there's no way to tell the two cases apart.
  useEffect(() => {
    if (!isEditMode) clearPendingCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isPublished, setIsPublished] = useState(false);
  const [addToBank, setAddToBank] = useState(false);
  const [loadingExam, setLoadingExam] = useState(false);
  const [retryPolicy, setRetryPolicy] = useState("");

  // Number of Questions / Total Marks / Marking Template / Sections are no
  // longer edited on this shell — they moved to the Template / Marking
  // Scheme step (TemplatePage.jsx) that "Next" now leads to, mirroring
  // Standalone Exam's own Overview → Template → Questions wizard. In edit
  // mode this page still fetches the exam's current values for these
  // fields (below) purely to carry them through unchanged into
  // `pendingEdit`, so the Template step has something correct to restore
  // from — it never renders or edits them itself.
  const [fetchedMarkingTemplateId, setFetchedMarkingTemplateId] = useState("");
  const [fetchedExamType, setFetchedExamType] = useState("");
  const [fetchedAmountOfQuestions, setFetchedAmountOfQuestions] = useState(null);
  const [fetchedTotalMarks, setFetchedTotalMarks] = useState(null);
  const [fetchedConfiguredSections, setFetchedConfiguredSections] = useState([]);

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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const startTimeManager = useDateTimePicker();
  const endTimeManager = useDateTimePicker();

  // Load existing exam data when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    setLoadingExam(true);
    Promise.all([
      adminGetExaminationById(courseId),
      getExamPaperConfig(examinationId, "examination").catch(() => null),
    ])
      .then(([{ examination: exam }, paperConfigRes]) => {
        setValue("title", exam.title);
        setValue("duration", exam.duration);
        setValue("retryCount", exam.retryCount ?? 0);
        setRetryPolicy(exam.retryPolicy || "");
        if (exam.startTime) startTimeManager.handleChange(new Date(exam.startTime));
        if (exam.endTime) endTimeManager.handleChange(new Date(exam.endTime));
        if (exam.markingTemplateId) setFetchedMarkingTemplateId(exam.markingTemplateId);
        if (exam.examType) setFetchedExamType(exam.examType);
        if (exam.amountOfQuestions != null) setFetchedAmountOfQuestions(exam.amountOfQuestions);
        if (exam.totalMarks != null) setFetchedTotalMarks(exam.totalMarks);

        const cfg = paperConfigRes?.data;
        if (cfg) {
          if (Array.isArray(cfg.configuredSections)) setFetchedConfiguredSections(cfg.configuredSections);
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

  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");
      const endTime = endTimeManager.handleGetValueAndValidate("End Time");

      const retryCount = Number(data.retryCount) || 0;
      if (retryCount > 0 && !retryPolicy) {
        throw new Error("Please select a retry policy for retries above 0.");
      }

      const body = {
        title: data.title,
        duration: Number(data.duration),
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
        courseId,
        moduleId,
        retryCount,
        ...(retryCount > 0 ? { retryPolicy } : {}),
        navigationMode,
        randomizationConfig: randomization,
        uiSettings: { ...uiSettings, font_size: Number(uiSettings.font_size) },
        // Carried through unchanged from the fetched record — this page no
        // longer edits these; the Template / Marking Scheme step (next)
        // either keeps them as-is or overwrites them with fresh values.
        ...(isEditMode && {
          markingTemplateId: fetchedMarkingTemplateId || undefined,
          ...(fetchedAmountOfQuestions != null && { amountOfQuestions: fetchedAmountOfQuestions }),
          ...(fetchedTotalMarks != null && { totalMarks: fetchedTotalMarks }),
          ...(fetchedExamType && { examType: fetchedExamType }),
        }),
      };

      const paperConfigBody = {
        examType: "examination",
        configuredSections: fetchedConfiguredSections,
        navigationMode,
        timeLimitMinutes: Number(data.duration) || 0,
        randomization,
        uiSettings: { ...uiSettings, font_size: Number(uiSettings.font_size) },
      };

      if (isEditMode) {
        // Nothing is saved yet — hold the edit in memory and only actually
        // apply it (together with the workflow submit modal) once a
        // question has been saved on the other side of "Next", mirroring
        // the shell-plus-question deferral the create flow above uses.
        setPendingEdit({
          kind: "ModuleExam",
          contentId: examinationId,
          body,
          paperConfigBody,
          title: data.title,
          requestType: "CourseExam",
          courseId,
          nextRoute: `/admin/courses/${courseId}/module/${moduleId}/examinations/view/${examinationId}`,
          // Returning to this form (e.g. via the Overview tab) and
          // re-submitting must not drop questions already queued for this
          // same exam on the Questions step.
          questions:
            pendingEdit?.contentId === examinationId
              ? pendingEdit?.questions
              : undefined,
        });
        push(
          `/admin/courses/${courseId}/assessment/${courseId}/template?examination=${examinationId}&editSubmit=1&moduleId=${moduleId}`,
        );
      } else {
        // Nothing is created yet — hold the details in memory and create
        // both the exam and the first question together once "Create and
        // Submit" is clicked on the question step below.
        setPendingCreate({
          kind: "ModuleExam",
          body,
          paperConfigBody,
          addToBank,
          title: data.title,
          fromBankQuestionIds: bankQuestionIdsRef.current,
          // Returning to this form (e.g. via the Overview tab) and
          // re-submitting must not drop questions already queued on the
          // Questions step.
          questions: pendingCreate?.questions,
        });
        push(
          `/admin/courses/${courseId}/assessment/${courseId}/template?examination=new&submitForApproval=1&moduleId=${moduleId}`,
        );
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
      <Box paddingX={6} paddingTop={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/courses">Courses</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem><Link href={`/admin/courses/details/${courseId}/modules`}>Modules</Link></BreadcrumbItem>}
          item4={<BreadcrumbItem><Link href={`/admin/courses/${courseId}/module/${moduleId}/examinations`}>Examinations</Link></BreadcrumbItem>}
          item5={<BreadcrumbItem isCurrentPage><Link href="#">{isEditMode ? "Edit Examination" : "Create Examination"}</Link></BreadcrumbItem>}
        />
      </Box>
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
                label="Retry Attempts"
                type="number"
                placeholder="0"
                error={errors.retryCount?.message}
                {...register("retryCount", {
                  min: { value: 0, message: "Retry attempts cannot be negative" },
                })}
              />
            </Box>
            <Box flex={1}>
              <Select
                label="Retry Policy"
                placeholder="Select a retry policy"
                value={retryPolicy}
                onChange={(e) => setRetryPolicy(e.target.value)}
                options={[
                  { label: "Highest Score", value: "highest" },
                  { label: "Latest Attempt", value: "latest" },
                  { label: "Average Score", value: "average" },
                ]}
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

          <DateTimePicker
            label="End Time"
            isRequired
            value={endTimeManager.value}
            onChange={endTimeManager.handleChange}
            mb={6}
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

        {!isEditMode && (
          <Checkbox
            isChecked={addToBank}
            onChange={(e) => setAddToBank(e.target.checked)}
            colorScheme="purple"
            mt={2}
          >
            Add to Question Bank — automatically save every question created for this examination to the bank
          </Checkbox>
        )}

        <Flex gap={4} justifyContent="flex-end" mt={2} mb={10}>
          <Button secondary onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting || loadingExam} isDisabled={isPublished}>
            Next: Template
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
      render={(props) => (
        <CreateModuleExaminationPage
          {...props}
          key={props.match.params.examinationId}
        />
      )}
    />
  );
};

export default CreateModuleExaminationPageRoute;
