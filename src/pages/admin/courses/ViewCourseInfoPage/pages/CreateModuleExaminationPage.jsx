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
  adminGetMarkingTemplates,
  getExaminationById as getExamPaperConfig,
} from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";
import useAssessmentStore from "../../../../../store/assessmentStore";
import { SectionsBuilder, createEmptySection } from "../../../examSectionBuilder/SectionRow";
import QuestionQuantitiesTable from "../../../examSectionBuilder/QuestionQuantitiesTable";
import {
  EXAM_TYPE_OPTIONS,
  toExamTypeApiValue,
  fromExamTypeApiValue,
  normalizeSectionsForConfig,
  hydrateSection,
  computeSectionTotals,
  computeQuantityTotals,
  seedQuantityCounts,
} from "../../../examSectionBuilder/examTypeConfig";

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

  // Exam Type ("" is the legacy/unset sentinel — only ever seen in edit
  // mode, for an exam that predates this feature. A brand-new exam always
  // starts on a real value so its Sections/Quantities rules are meaningful
  // from the first render.)
  const [examType, setExamType] = useState(isEditMode ? "" : "with_sections");
  const [amountOfQuestions, setAmountOfQuestions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [questionQuantities, setQuestionQuantities] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  // Sections stay visible for the legacy "" sentinel too — this is what
  // keeps a pre-existing exam's Sections card exactly as visible as it is
  // today, since it never had an Exam Type concept to hide it behind.
  const sectionsEnabled = examType === "" || examType === "with_sections" || examType === "hybrid";
  const amountOfQuestionsIsAuto = examType === "with_sections" || examType === "without_sections";
  const totalMarksIsAuto = examType === "with_sections" || examType === "without_sections" || examType === "hybrid";

  // A sectioned exam defines marking per-section, not via a marking
  // template — clear out any previously-picked template (e.g. from
  // switching Exam Type back and forth) so the disabled Select can't hold
  // onto a stale selection that would otherwise still get submitted.
  useEffect(() => {
    if (examType === "with_sections") setMarkingTemplateId("");
  }, [examType]);

  // Sections
  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, createEmptySection()]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  // The marking-templates list already carries each template's full
  // markDistribution/questionTypes/totalMarks — no need for a separate
  // by-ID fetch once one is picked.
  const selectedTemplate = markingTemplates.find((t) => t.id === markingTemplateId);
  const quantityTypes = selectedTemplate?.questionTypes ?? Object.keys(selectedTemplate?.markDistribution || {});

  // Confirmed against a real backend test: a template can itself declare
  // questionQuantity, and the backend inherits it when the exam sends none
  // of its own — but only when the field is truly absent, not just present
  // with blank/zero values. Pre-filling from the template's own defaults
  // (without clobbering anything already typed) means whatever this page
  // ends up sending always matches what the backend would have inherited
  // anyway, and this page's own totals stay correct instead of showing 0
  // until the admin retypes the template's numbers by hand.
  useEffect(() => {
    if (!selectedTemplate?.questionQuantity) return;
    setQuestionQuantities((prev) => ({ ...selectedTemplate.questionQuantity, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markingTemplateId, markingTemplates]);

  const { weightageTotal: sectionsWeightageTotal, questionCountTotal: sectionsQuestionCountTotal } =
    computeSectionTotals(sections);
  const { marksTotal: quantityMarksTotal, quantityTotal } = computeQuantityTotals(
    quantityTypes,
    questionQuantities,
    selectedTemplate?.markDistribution,
  );

  // "Exam with sections" has no standalone total-marks/question-count
  // input of its own — both are always the sum of every section's own
  // weightage/Question Count, since that's what each section's questions
  // are bound to abide by.
  useEffect(() => {
    if (examType !== "with_sections") return;
    setTotalMarks(String(sectionsWeightageTotal));
    setAmountOfQuestions(String(sectionsQuestionCountTotal));
  }, [examType, sectionsWeightageTotal, sectionsQuestionCountTotal]);

  // "Exam without sections" likewise has no standalone total-marks/
  // question-count input — both are derived from how many questions of
  // each type the admin enters in the Quantities table times that type's
  // mark value from the marking template.
  useEffect(() => {
    if (examType !== "without_sections") return;
    setTotalMarks(String(quantityMarksTotal));
    setAmountOfQuestions(String(quantityTotal));
  }, [examType, quantityMarksTotal, quantityTotal]);

  // Hybrid combines both laws for Total Marks — the sections' own
  // weightage, plus the standalone questions' marks. Number of Questions
  // stays hand-typed for hybrid, since sections don't track a question
  // count contribution separately from their own weightage here.
  useEffect(() => {
    if (examType !== "hybrid") return;
    setTotalMarks(String(sectionsWeightageTotal + quantityMarksTotal));
  }, [examType, sectionsWeightageTotal, quantityMarksTotal]);

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
      .then(({ templates }) => setMarkingTemplates(templates.filter((t) => t.usageScope === "Normal Exam")))
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
        if (exam.amountOfQuestions != null) setAmountOfQuestions(String(exam.amountOfQuestions));
        if (exam.totalMarks != null) setTotalMarks(String(exam.totalMarks));
        if (exam.startTime) startTimeManager.handleChange(new Date(exam.startTime));
        if (exam.endTime) endTimeManager.handleChange(new Date(exam.endTime));
        if (exam.markingTemplateId) setMarkingTemplateId(exam.markingTemplateId);
        // Only set when the exam actually has one — an exam that predates
        // this feature must keep the "" legacy sentinel so its hand-typed
        // totals and always-visible Sections card stay exactly as they
        // are today (see the `examType` state comment above).
        if (exam.examType) setExamType(fromExamTypeApiValue(exam.examType));
        if (exam.questionQuantity) setQuestionQuantities(exam.questionQuantity);

        const cfg = paperConfigRes?.data;
        if (cfg) {
          if (Array.isArray(cfg.configuredSections)) {
            setSections(cfg.configuredSections.map(hydrateSection));
          }
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

      // A sectioned exam defines marking per-section, not via a marking
      // template — the legacy "" sentinel (an exam that predates the Exam
      // Type feature) keeps the original always-required behavior.
      if (examType !== "with_sections" && !markingTemplateId)
        throw new Error(
          "A marking template must be selected before saving an examination.",
        );

      const newErrors = {};
      if (!amountOfQuestions || Number(amountOfQuestions) <= 0) {
        newErrors.amountOfQuestions = amountOfQuestionsIsAuto
          ? "Add sections/quantities so the number of questions can be calculated"
          : "Number of questions is required";
      }
      if (!totalMarks || Number(totalMarks) <= 0) {
        newErrors.totalMarks = totalMarksIsAuto
          ? "Add sections/quantities so total marks can be calculated"
          : "Total marks is required";
      }
      setFieldErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        throw new Error("Please fix the highlighted fields before continuing.");
      }

      const body = {
        title: data.title,
        duration: Number(data.duration),
        amountOfQuestions: Number(amountOfQuestions),
        totalMarks: Number(totalMarks),
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
        courseId,
        moduleId,
        // A sectioned exam has no marking template — `undefined` (not just
        // omitting the key) clears out a `markingTemplateId` already
        // sitting in a `pendingCreate`/`pendingEdit` from an earlier visit
        // where a different Exam Type was selected; JSON.stringify drops
        // `undefined` values, so it never reaches the backend.
        markingTemplateId: examType === "with_sections" ? undefined : markingTemplateId,
        navigationMode,
        randomizationConfig: randomization,
        uiSettings: { ...uiSettings, font_size: Number(uiSettings.font_size) },
        // Only sent once the admin has actually chosen an Exam Type — an
        // exam that predates this feature (the "" sentinel) posts no
        // examType at all, matching what it always sent before.
        ...(examType && { examType: toExamTypeApiValue(examType) }),
        ...((examType === "hybrid" || examType === "without_sections") && {
          questionQuantity: seedQuantityCounts(quantityTypes, questionQuantities),
        }),
      };

      const paperConfigBody = {
        examType: "examination",
        configuredSections: normalizeSectionsForConfig(sections),
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
                placeholder={amountOfQuestionsIsAuto ? "Calculated automatically below" : "e.g. 20"}
                isRequired
                error={fieldErrors.amountOfQuestions}
                value={amountOfQuestions}
                isReadOnly={amountOfQuestionsIsAuto}
                isDisabled={amountOfQuestionsIsAuto}
                onChange={(e) => setAmountOfQuestions(e.target.value)}
              />
            </Box>
            <Box flex={1}>
              <Input
                label="Total Marks"
                type="number"
                placeholder={totalMarksIsAuto ? "Calculated automatically below" : "e.g. 100"}
                isRequired
                error={fieldErrors.totalMarks}
                value={totalMarks}
                isReadOnly={totalMarksIsAuto}
                isDisabled={totalMarksIsAuto}
                onChange={(e) => setTotalMarks(e.target.value)}
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

          <Box mb={6}>
            <Select
              label="Exam Type"
              isRequired
              noEmptyOption={examType !== ""}
              placeholder={examType === "" ? "Not set (legacy exam)" : undefined}
              value={examType}
              onChange={(e) => {
                const nextExamType = e.target.value;
                setExamType(nextExamType);
                // Sectioned exams derive marking from each section's own
                // marking type, so a global marking template doesn't apply.
                if (nextExamType === "with_sections") setMarkingTemplateId("");
              }}
              options={EXAM_TYPE_OPTIONS}
            />
          </Box>

          <Select
            label="Marking Template"
            placeholder="Select a marking template"
            isRequired={examType !== "with_sections"}
            isDisabled={isEditMode || examType === "with_sections"}
            value={markingTemplateId}
            onChange={(e) => setMarkingTemplateId(e.target.value)}
            options={markingTemplates.map((t) => ({
              label: t.markingTemplateName,
              value: t.id,
            }))}
          />
          {examType === "with_sections" && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              Sectioned exams define marking per section instead — no marking template needed.
            </Text>
          )}
          {isEditMode && examType !== "with_sections" && (
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

          {selectedTemplate && (examType === "without_sections" || examType === "hybrid") && (
            <Box mt={6}>
              <QuestionQuantitiesTable
                selectedTemplate={selectedTemplate}
                types={quantityTypes}
                counts={questionQuantities}
                onChange={(type, value) => setQuestionQuantities((p) => ({ ...p, [type]: value }))}
                examType={examType}
                sectionsWeightageTotal={sectionsWeightageTotal}
                marksTotal={quantityMarksTotal}
                quantityTotal={quantityTotal}
              />
            </Box>
          )}
        </SectionCard>

        {/* ── Sections ── */}
        {sectionsEnabled && (
          <SectionCard title="Sections">
            <SectionsBuilder
              sections={sections}
              onAdd={addSection}
              onChange={updateSection}
              onRemove={removeSection}
            />
          </SectionCard>
        )}

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
