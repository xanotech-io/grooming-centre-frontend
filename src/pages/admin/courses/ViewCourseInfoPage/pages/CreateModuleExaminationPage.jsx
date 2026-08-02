import { Route, useParams, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Alert,
  AlertIcon,
  Checkbox,
  IconButton,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import { useEffect, useState, useMemo, useRef } from "react";
import { Switch } from "@chakra-ui/switch";
import { Select as ChakraSelect } from "@chakra-ui/select";
import { FiTrash2 } from "react-icons/fi";
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
  adminGetMarkingTemplates,
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

const EMPTY_SECTION = {
  section_name: "",
  question_type: "",
  marking_type: "",
  total_marks: null,
};

// Kept identical to ExamPaperConfigPage.jsx's — QuestionsPage.jsx enforces
// these three fields against whichever section a question is saved under.
const QUESTION_TYPE_LOCK_OPTIONS = [
  { label: "All", value: "" },
  { label: "MCQ", value: "MCQ" },
  { label: "True / False", value: "TrueFalse" },
  { label: "Fill in the Blank", value: "FillBlank" },
  { label: "Matching", value: "Matching" },
  { label: "Short Answer", value: "ShortAnswer" },
  { label: "Essay", value: "Essay" },
];

const MARKING_TYPE_LOCK_OPTIONS = [
  { label: "Any marking type", value: "" },
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
  { label: "Hybrid", value: "hybrid" },
];

const SectionRow = ({ section, idx, onChange, onRemove }) => (
  <Flex gap={3} alignItems="flex-start" mb={4} flexWrap="wrap">
    <Box flex="0 0 90px" minW="90px">
      <Input
        id={`section-${idx}-sequence`}
        label="Sequence"
        type="number"
        value={idx + 1}
        isReadOnly
        isDisabled
      />
    </Box>
    <Box flex={2} minW="160px">
      <Input
        id={`section-${idx}-name`}
        label="Name"
        placeholder="Section name e.g. Section A"
        value={section.section_name}
        onChange={(e) => onChange(idx, "section_name", e.target.value)}
      />
    </Box>
    <Box flex={1} minW="150px">
      <Select
        id={`section-${idx}-question-type`}
        label="Question Type"
        noEmptyOption
        value={section.question_type ?? ""}
        onChange={(e) => onChange(idx, "question_type", e.target.value)}
        options={QUESTION_TYPE_LOCK_OPTIONS}
      />
    </Box>
    <Box flex={1} minW="150px">
      <Select
        id={`section-${idx}-marking-type`}
        label="Marking Type"
        noEmptyOption
        value={section.marking_type ?? ""}
        onChange={(e) => onChange(idx, "marking_type", e.target.value)}
        options={MARKING_TYPE_LOCK_OPTIONS}
      />
    </Box>
    <Box flex={1} minW="120px">
      <Input
        id={`section-${idx}-weightage`}
        label="Weightage"
        type="number"
        min={0}
        placeholder="e.g. 20"
        value={section.total_marks ?? ""}
        onChange={(e) =>
          onChange(
            idx,
            "total_marks",
            e.target.value ? Number(e.target.value) : null,
          )
        }
      />
    </Box>
    <IconButton
      aria-label="Remove section"
      icon={<FiTrash2 size={14} />}
      size="sm"
      variant="ghost"
      colorScheme="red"
      onClick={() => onRemove(idx)}
      alignSelf="center"
      mt={6}
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
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);
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

  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [addToBank, setAddToBank] = useState(false);
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
        setValue("amountOfQuestions", exam.amountOfQuestions);
        setValue("totalMarks", exam.totalMarks);
        if (exam.startTime) startTimeManager.handleChange(new Date(exam.startTime));
        if (exam.endTime) endTimeManager.handleChange(new Date(exam.endTime));
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
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");
      const endTime = endTimeManager.handleGetValueAndValidate("End Time");

      if (!markingTemplateId)
        throw new Error(
          "A marking template must be selected before saving an examination.",
        );

      const body = {
        title: data.title,
        duration: Number(data.duration),
        amountOfQuestions: Number(data.amountOfQuestions),
        totalMarks: Number(data.totalMarks),
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
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
          question_type: s.question_type || "",
          marking_type: s.marking_type || "",
          total_marks: s.total_marks ? Number(s.total_marks) : null,
        })),
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
          `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${examinationId}&editSubmit=1&moduleId=${moduleId}`,
        );
      } else {
        // Nothing is created yet — hold the details in memory and create
        // both the exam and the first question together once "Create and
        // Submit" is clicked on the question step below.
        setPendingCreate({
          kind: "ModuleExam",
          body,
          paperConfigBody,
          markingTemplateId,
          addToBank,
          title: data.title,
          fromBankQuestionIds: bankQuestionIdsRef.current,
          // Returning to this form (e.g. via the Overview tab) and
          // re-submitting must not drop questions already queued on the
          // Questions step.
          questions: pendingCreate?.questions,
        });
        push(
          `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=new&submitForApproval=1&moduleId=${moduleId}`,
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
            <Box flex={1}>
              <Input
                label="Total Marks"
                type="number"
                placeholder="e.g. 100"
                isRequired
                error={errors.totalMarks?.message}
                {...register("totalMarks", {
                  required: "Total marks is required",
                  min: { value: 1, message: "Must be at least 1 mark" },
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

          <DateTimePicker
            label="End Time"
            isRequired
            value={endTimeManager.value}
            onChange={endTimeManager.handleChange}
            mb={6}
          />

          <Select
            label="Marking Template"
            placeholder="Select a marking template"
            isRequired
            isDisabled={isEditMode}
            value={markingTemplateId}
            onChange={(e) => setMarkingTemplateId(e.target.value)}
            options={markingTemplates.map((t) => ({
              label: t.markingTemplateName,
              value: t.id,
            }))}
          />
          {isEditMode && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              The template can&apos;t be changed here once an exam has been
              created — go to the{" "}
              <Box
                as="span"
                color="primary.base"
                fontWeight="600"
                cursor="pointer"
                onClick={() => push("/admin/marking-templates")}
              >
                Exam Template Library
              </Box>{" "}
              to customize it instead.
            </Text>
          )}
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
            Next
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
