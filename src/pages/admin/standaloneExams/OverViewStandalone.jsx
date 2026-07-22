/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Flex, Grid, GridItem } from "@chakra-ui/layout";
import {
  Alert,
  AlertIcon,
  Checkbox,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select as ChakraSelect,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {  useHistory } from "react-router-dom";
import {
  Button,
  DateTimePicker,
  Heading,
  Input,
  Select,
  Spinner,
  WorkflowSubmitModal,
} from "../../../components";
import { useCache } from "../../../contexts";
import {
  useDateTimePicker,
  useGoBack,
  useIsSuperAdmin,
  useQueryParams,
} from "../../../hooks";
import {
  adminEditStandaloneExamination,
  adminGetMarkingTemplates,
  getExaminationById as getExamPaperConfig,
  updateExaminationById as updateExamPaperConfig,
} from "../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../utils";
import useAssessmentPreview from "../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import useAssessmentStore from "../../../store/assessmentStore";
import { FaRegSave, FaFileAlt } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";

const EMPTY_SECTION = {
  section_name: "",
  questions_count: 1,
  time_limit: null,
  question_type: "",
  marking_type: "",
  total_marks: null,
};

// Kept identical to ExamPaperConfigPage.jsx's — QuestionsPage.jsx enforces
// these three fields against whichever section a question is saved under.
const QUESTION_TYPE_LOCK_OPTIONS = [
  { label: "Any type", value: "" },
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
  <Flex gap={3} alignItems="center" mb={3} flexWrap="wrap">
    <Box flex={2} minW="160px">
      <Input
        placeholder="Section name e.g. Section A"
        value={section.section_name}
        onChange={(e) => onChange(idx, "section_name", e.target.value)}
      />
    </Box>
    <Box flex={1} minW="100px">
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
    <Box flex={1} minW="100px">
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
    <Box flex={1} minW="130px">
      <ChakraSelect
        value={section.question_type ?? ""}
        onChange={(e) => onChange(idx, "question_type", e.target.value)}
      >
        {QUESTION_TYPE_LOCK_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </ChakraSelect>
    </Box>
    <Box flex={1} minW="130px">
      <ChakraSelect
        value={section.marking_type ?? ""}
        onChange={(e) => onChange(idx, "marking_type", e.target.value)}
      >
        {MARKING_TYPE_LOCK_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </ChakraSelect>
    </Box>
    <Box flex={1} minW="100px">
      <NumberInput
        min={0}
        value={section.total_marks ?? ""}
        onChange={(val) => onChange(idx, "total_marks", val ? Number(val) : null)}
      >
        <NumberInputField placeholder="Weightage" />
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
      <Text fontSize="sm" fontWeight="500">{label}</Text>
      {description && <Text fontSize="xs" color="gray.500">{description}</Text>}
    </Box>
    <Switch isChecked={checked} onChange={(e) => onChange(e.target.checked)} colorScheme="purple" />
  </Flex>
);

const OverViewStandalone = () => {
  const examinationId = useQueryParams().get("examination");
  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    examinationId ? examinationId : "isStandaloneExamination && isNotEdit",
    true,
  );
  const isEditmode = !examinationId === false;

  return examinationId && (isLoading || error) ? (
    <Flex
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Heading color="red.500">{error}</Heading>
      ) : null}
    </Flex>
  ) : isEditmode ? (
    <EditStandalonePage assessment={assessment} />
  ) : (
    <CreateStandalonePage />
  );
};

const EditStandalonePage = ({ assessment }) => {
  const examinationId = useQueryParams().get("examination");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (assessment?.topic) setValue("title", assessment?.topic);
  }, [assessment?.topic, setValue]);

  useEffect(() => {
    if (assessment?.startTime)
      startTimeManager.handleChange(assessment?.startTime);
  }, [assessment?.startTime]);

  useEffect(() => {
    if (assessment?.duration) setValue("duration", assessment?.duration);
  }, [assessment?.duration, setValue]);

  useEffect(() => {
    if (assessment?.questionCount)
      setValue("amountOfQuestions", assessment?.questionCount);
  }, [assessment?.questionCount, setValue]);

  useEffect(() => {
    if (assessment?.isPublished)
      setValue("isPublished", assessment?.isPublished);
  }, [assessment?.isPublished, setValue]);

  const { push } = useHistory();
  const toast = useToast();
  const isSuperAdmin = useIsSuperAdmin();
  const handleCancel = useGoBack();
  const startTimeManager = useDateTimePicker();
  const { handleDelete } = useCache();
  const [isConfigPublished, setIsConfigPublished] = useState(false);
  const isPublished = assessment?.isPublished === true || isConfigPublished;

  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingBodyRef = useRef(null);

  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, { ...EMPTY_SECTION }]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const [randomization, setRandomization] = useState({
    question_order: false,
    option_order: false,
  });

  useEffect(() => {
    if (!examinationId) return;
    getExamPaperConfig(examinationId, "standalone_examination")
      .then((res) => {
        const cfg = res?.data;
        if (!cfg) return;
        if (Array.isArray(cfg.configuredSections)) setSections(cfg.configuredSections);
        if (cfg.randomization) setRandomization(cfg.randomization);
        if (cfg.paperStatus) setIsConfigPublished(cfg.paperStatus === "published");
      })
      .catch(() => {});
  }, [examinationId]);

  const performEdit = async ({ body, paperConfigBody }) => {
    const { message } = await adminEditStandaloneExamination(
      examinationId,
      body,
    );
    await updateExamPaperConfig(examinationId, paperConfigBody);

    toast({
      description: capitalizeFirstLetter(message),
      position: "top",
      status: "success",
    });

    return { id: examinationId };
  };

  const handleWorkflowFinished = () => {
    handleDelete(examinationId);
    push(`/admin/standalone-exams/template?examination=${examinationId}`);
  };

  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");
      const body = {
        ...data,
        amountOfQuestions: Number(data.amountOfQuestions),
        duration: Number(data.duration),
        startTime: formatDateToISO(startTime),
      };

      const paperConfigBody = {
        examType: "standalone_examination",
        // Sections are optional — the backend rejects an empty
        // `configuredSections` array, so leave the key out entirely
        // when none were added instead of sending `[]`.
        ...(sections.length > 0 && {
          configuredSections: sections.map((s) => ({
            section_name: s.section_name,
            questions_count: Number(s.questions_count) || 0,
            time_limit: s.time_limit ? Number(s.time_limit) : null,
            question_type: s.question_type || "",
            marking_type: s.marking_type || "",
            total_marks: s.total_marks ? Number(s.total_marks) : null,
          })),
        }),
        randomization,
      };

      const pendingBody = { body, paperConfigBody };

      // Everyone, including super admin, must submit for approval before
      // this edit takes effect — hold off until the modal below completes.
      // Super admin submissions carry a null supervisor instead of skipping
      // the workflow.
      pendingBodyRef.current = pendingBody;

      setWorkflowContent({ contentId: examinationId, contentTitle: data.title });
      setWorkflowModalOpen(true);
    } catch (error) {
      toast({
        description: error.message,
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      marginY="20px"
      marginX="22px"
    >
      {isPublished && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          This exam is published. Settings are locked. Unpublish the exam first to make changes.
        </Alert>
      )}
      <Box
        backgroundColor="white"
        padding="40px"
        borderRadius="8px"
        shadow="sm"
      >
        <Heading as="h3" size="md" marginBottom="20px" color="#1A202C">
          Examination Details
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Input
              label="Examination Title"
              id="title"
              placeholder="Enter examination title"
              error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Number of Questions"
              type="number"
              id="amountOfQuestions"
              placeholder="Enter the number of questions"
              error={errors.amountOfQuestions?.message}
              {...register("amountOfQuestions", {
                required: "Please enter number of questions",
              })}
            />
          </GridItem>

          <GridItem>
            <DateTimePicker
              id="startTime"
              isRequired
              label="Start Date and Time"
              value={startTimeManager.value}
              onChange={startTimeManager.handleChange}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Duration"
              type="number"
              id="duration"
              placeholder="Enter duration in minutes"
              error={errors.duration?.message}
              {...register("duration", { required: "Please enter duration" })}
            />
          </GridItem>

          <GridItem colSpan={2}>
            <Input
              label="Instructions"
              id="instructions"
              placeholder="Enter exam instructions for the students"
              {...register("instructions")}
            />
          </GridItem>
        </Grid>

        <Heading as="h3" size="md" marginTop="32px" marginBottom="16px" color="#1A202C">
          Sections
        </Heading>
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

        <Heading as="h3" size="md" marginTop="32px" marginBottom="8px" color="#1A202C">
          Randomization
        </Heading>
        <BoolRow
          label="Randomize question order"
          description="Questions are presented in a random order for each student"
          checked={randomization.question_order}
          onChange={(v) => setRandomization((p) => ({ ...p, question_order: v }))}
        />
        <BoolRow
          label="Randomize option order"
          description="Answer options for each question are shuffled"
          checked={randomization.option_order}
          onChange={(v) => setRandomization((p) => ({ ...p, option_order: v }))}
        />

        <Flex marginTop="40px" justifyContent="flex-end" gap="16px">
          <Button
            secondary
            onClick={handleCancel}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            border="1px solid #E2E8F0"
            color="purple.800"
            _hover={{ bg: "gray.50" }}
          >
            <FaRegSave />
            Save as draft
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting || isPublished}
            type="submit"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            bg="purple.800"
            color="white"
            _hover={{ bg: "purple.900" }}
          >
            <FaFileAlt />
            Next: Template
          </Button>
        </Flex>
      </Box>

      {workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType="StandaloneExam"
          onCreate={() => performEdit(pendingBodyRef.current)}
          onSuccess={handleWorkflowFinished}
        />
      )}
    </Box>
  );
};

const CreateStandalonePage = () => {
  const { push } = useHistory();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleCancel = useGoBack();
  const startTimeManager = useDateTimePicker();
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [markingMode, setMarkingMode] = useState("automatic");
  const [addToBank, setAddToBank] = useState(false);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
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

  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, { ...EMPTY_SECTION }]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const [randomization, setRandomization] = useState({
    question_order: false,
    option_order: false,
  });

  useEffect(() => {
    adminGetMarkingTemplates()
      .then(({ templates }) =>
        setMarkingTemplates(templates)
      )
      .catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    try {
      const startTime = startTimeManager.handleGetValueAndValidate("Start Time");

      if (!templateId)
        throw new Error("A marking template must be selected before creating an examination.");

      const body = {
        title: data.title,
        duration: Number(data.duration),
        amountOfQuestions: Number(data.amountOfQuestions),
        totalMarks: Number(data.totalMarks),
        templateId,
        markingMode,
        startTime: formatDateToISO(startTime),
      };

      const paperConfigBody = {
        examType: "standalone_examination",
        // Sections are optional — the backend rejects an empty
        // `configuredSections` array, so leave the key out entirely
        // when none were added instead of sending `[]`.
        ...(sections.length > 0 && {
          configuredSections: sections.map((s) => ({
            section_name: s.section_name,
            questions_count: Number(s.questions_count) || 0,
            time_limit: s.time_limit ? Number(s.time_limit) : null,
            question_type: s.question_type || "",
            marking_type: s.marking_type || "",
            total_marks: s.total_marks ? Number(s.total_marks) : null,
          })),
        }),
        randomization,
      };

      // Nothing is created yet — hold the details in memory and create both
      // the exam and the first question together once "Create and Submit"
      // is clicked on the question step below.
      setPendingCreate({
        kind: "StandaloneExam",
        body,
        paperConfigBody,
        addToBank,
        title: data.title,
        fromBankQuestionIds: bankQuestionIdsRef.current,
      });
      push("/admin/standalone-exams/questions/?examination=new&submitForApproval=1");
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY="20px" marginX="22px">
      <Box backgroundColor="white" padding="40px" borderRadius="8px" shadow="sm">
        <Heading as="h3" size="md" marginBottom="20px" color="#1A202C">
          Examination Details
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem colSpan={2}>
            <Input
              label="Examination Title"
              id="title"
              placeholder="Enter examination title"
              error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
          </GridItem>

          <GridItem>
            <Input
              label="Number of Questions"
              type="number"
              id="amountOfQuestions"
              placeholder="Enter the number of questions"
              error={errors.amountOfQuestions?.message}
              {...register("amountOfQuestions", {
                required: "Please enter number of questions",
              })}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Total Marks"
              type="number"
              id="totalMarks"
              placeholder="e.g. 100"
              error={errors.totalMarks?.message}
              {...register("totalMarks", { required: "Please enter total marks" })}
            />
          </GridItem>

          <GridItem>
            <DateTimePicker
              id="startTime"
              isRequired
              label="Start Date and Time"
              value={startTimeManager.value}
              onChange={startTimeManager.handleChange}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Duration (minutes)"
              type="number"
              id="duration"
              placeholder="Enter duration in minutes"
              error={errors.duration?.message}
              {...register("duration", { required: "Please enter duration" })}
            />
          </GridItem>

          <GridItem>
            <Select
              label="Marking Mode"
              placeholder="Select marking mode"
              isRequired
              value={markingMode}
              onChange={(e) => setMarkingMode(e.target.value)}
              options={[
                { label: "Automatic", value: "automatic" },
                { label: "Manual", value: "manual" },
                { label: "Hybrid", value: "hybrid" },
              ]}
            />
          </GridItem>
          <GridItem>
            <Select
              label="Marking Template"
              placeholder="Select a marking template"
              isRequired
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
            />
          </GridItem>
        </Grid>

        <Heading as="h3" size="md" marginTop="32px" marginBottom="16px" color="#1A202C">
          Sections
        </Heading>
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

        <Heading as="h3" size="md" marginTop="32px" marginBottom="8px" color="#1A202C">
          Randomization
        </Heading>
        <BoolRow
          label="Randomize question order"
          description="Questions are presented in a random order for each student"
          checked={randomization.question_order}
          onChange={(v) => setRandomization((p) => ({ ...p, question_order: v }))}
        />
        <BoolRow
          label="Randomize option order"
          description="Answer options for each question are shuffled"
          checked={randomization.option_order}
          onChange={(v) => setRandomization((p) => ({ ...p, option_order: v }))}
        />

        <Checkbox
          isChecked={addToBank}
          onChange={(e) => setAddToBank(e.target.checked)}
          colorScheme="purple"
          mt={2}
        >
          Add to Question Bank — automatically save every question created for this exam to the bank
        </Checkbox>

        <Flex marginTop="40px" justifyContent="flex-end" gap="16px">
          <Button
            secondary
            onClick={handleCancel}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            border="1px solid #E2E8F0"
            color="#6b006b"
            _hover={{ bg: "gray.50" }}
          >
            <FaRegSave />
            Save as draft
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="8px"
            style={{ backgroundColor: "#6b006b", color: "white" }}
            _hover={{ bg: "#520052" }}
          >
            <FaFileAlt />
            Next
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default OverViewStandalone;
