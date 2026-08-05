import { Box, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import { Button, Heading, Select, Input, Text } from "../../../../../components";
import { useQueryParams, useGoBack } from "../../../../../hooks";
import { adminGetMarkingTemplates } from "../../../../../services";
import useAssessmentStore from "../../../../../store/assessmentStore";
import { SectionsBuilder, createEmptySection } from "../../../examSectionBuilder/SectionRow";
import QuestionQuantitiesTable from "../../../examSectionBuilder/QuestionQuantitiesTable";
import {
  EXAM_TYPE_OPTIONS,
  toExamTypeApiValue,
  normalizeSectionsForConfig,
  toCreateBodySections,
  hydrateSection,
  computeSectionTotals,
  computeQuantityTotals,
  seedQuantityCounts,
} from "../../../examSectionBuilder/examTypeConfig";

// Shared "Template / Marking Scheme" step for Course Exam ("ModuleExam" kind)
// and Assessment ("Assessment"/"Exam" kind) — mirrors Standalone Exam's own
// Overview → Template/Marking Scheme → Questions wizard
// (src/pages/admin/standaloneExams/TemplateStandalone.jsx is the original
// this was ported from). Standalone exams never reach this page — they keep
// their own dedicated step.
const RELEVANT_KINDS = ["ModuleExam", "Assessment", "Exam"];

const TemplatePage = () => {
  const { id: courseId, assessmentId } = useParams();
  const { push } = useHistory();
  const toast = useToast();
  const handleCancel = useGoBack();
  const query = useQueryParams();
  const isExaminationParam = query.get("examination");
  const moduleId = query.get("moduleId");
  // "ModuleExam"/"Exam" kind carries its real/"new" id via the `examination`
  // query param; "Assessment" kind carries it via the `:assessmentId` path
  // segment instead — same disambiguation QuestionsPage.jsx/CreateAssessmentPage.jsx
  // already use.
  const isExamKind = !!isExaminationParam;
  const isCreateMode = isExamKind ? isExaminationParam === "new" : assessmentId === "new";

  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const pendingEdit = useAssessmentStore((s) => s.pendingEdit);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);
  const pending = isCreateMode ? pendingCreate : pendingEdit;
  const kind = RELEVANT_KINDS.includes(pending?.kind) ? pending.kind : null;
  const usageScope = kind === "Assessment" ? "Assessment" : "Normal Exam";

  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");
  // New exams default to "with sections"; an exam/assessment being edited
  // defaults to "" (the legacy/unset sentinel) instead, only overwritten
  // below if the fetched record actually has its own examType. Unlike
  // TemplateStandalone.jsx (whose handleNext is a no-op in edit mode, so its
  // own "with_sections" default is harmless there), this page's handleNext
  // runs the same auto-compute/validation logic for both create and edit —
  // defaulting an existing, examType-less record to "with_sections" here
  // would force its Number of Questions/Total Marks to recompute from zero
  // sections on the very next save.
  const [examType, setExamType] = useState(isCreateMode ? "with_sections" : "");
  const [amountOfQuestions, setAmountOfQuestions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [questionQuantities, setQuestionQuantities] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, createEmptySection()]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const sectionsEnabled = examType === "with_sections" || examType === "hybrid";
  const amountOfQuestionsIsAuto = examType === "with_sections" || examType === "without_sections" || examType === "hybrid";
  const totalMarksIsAuto = examType === "with_sections" || examType === "without_sections" || examType === "hybrid";

  useEffect(() => {
    if (examType === "with_sections") setMarkingTemplateId("");
  }, [examType]);

  useEffect(() => {
    adminGetMarkingTemplates()
      .then(({ templates }) => setMarkingTemplates(templates.filter((t) => t.usageScope === usageScope)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageScope]);

  const selectedTemplate = markingTemplates.find((t) => t.id === markingTemplateId);
  const quantityTypes = selectedTemplate?.questionTypes ?? Object.keys(selectedTemplate?.markDistribution || {});

  // Confirmed against a real backend test: a template can itself declare
  // questionQuantity, and the backend inherits it when the exam sends none
  // of its own — but only when the field is truly absent, not just present
  // with blank/zero values. Pre-filling from the template's own defaults
  // (without clobbering anything already typed/restored) means whatever
  // this page ends up sending always matches what the backend would have
  // inherited anyway.
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

  useEffect(() => {
    if (examType !== "with_sections") return;
    setTotalMarks(String(sectionsWeightageTotal));
    setAmountOfQuestions(String(sectionsQuestionCountTotal));
  }, [examType, sectionsWeightageTotal, sectionsQuestionCountTotal]);

  useEffect(() => {
    if (examType !== "without_sections") return;
    setTotalMarks(String(quantityMarksTotal));
    setAmountOfQuestions(String(quantityTotal));
  }, [examType, quantityMarksTotal, quantityTotal]);

  useEffect(() => {
    if (examType !== "hybrid") return;
    setTotalMarks(String(sectionsWeightageTotal + quantityMarksTotal));
    setAmountOfQuestions(String(sectionsQuestionCountTotal + quantityTotal));
  }, [examType, sectionsWeightageTotal, quantityMarksTotal, sectionsQuestionCountTotal, quantityTotal]);

  // Restore whatever was already filled in before the admin moved on to the
  // Questions step and came back — mirrors the same restore pattern used on
  // Standalone's Template shell.
  useEffect(() => {
    if (!pending || !kind) return;
    const { body, paperConfigBody } = pending;
    if (body?.markingTemplateId) setMarkingTemplateId(body.markingTemplateId);
    if (body?.examType) {
      const reverse = { sectioned: "with_sections", unsectioned: "without_sections", hybrid: "hybrid" };
      setExamType(reverse[body.examType] || body.examType);
    }
    if (body?.amountOfQuestions != null) setAmountOfQuestions(String(body.amountOfQuestions));
    if (body?.totalMarks != null) setTotalMarks(String(body.totalMarks));
    if (body?.questionQuantity) setQuestionQuantities(body.questionQuantity);
    if (Array.isArray(paperConfigBody?.configuredSections) && paperConfigBody.configuredSections.length > 0) {
      setSections(paperConfigBody.configuredSections.map(hydrateSection));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    if (!pending || !kind) {
      // Nothing to collect against (e.g. reached directly without going
      // through Overview first) — let the existing "details were lost" guard
      // on the Questions step handle it, same as every other pending-state
      // guard in this app.
      push(nextRoute());
      return;
    }

    const templateRequired = examType !== "with_sections";
    const newErrors = {};
    if (templateRequired && !markingTemplateId) {
      newErrors.markingTemplateId = "Please select a marking template";
    }
    if (!amountOfQuestions || Number(amountOfQuestions) <= 0) {
      newErrors.amountOfQuestions = amountOfQuestionsIsAuto
        ? "Add sections/quantities so the number of questions can be calculated"
        : "Please enter number of questions";
    }
    if (!totalMarks || Number(totalMarks) <= 0) {
      newErrors.totalMarks = totalMarksIsAuto
        ? "Add sections/quantities so total marks can be calculated"
        : "Please enter total marks";
    }
    // Backend confirmed: a section with a blank Name fails the same way an
    // empty sections array does ("sections must be an array of 1-10 section
    // objects with at least a section_name/name") — catch it here instead
    // of letting a partially-filled section reach the backend at all.
    if (sectionsEnabled && sections.some((s) => !s.section_name?.trim())) {
      newErrors.sections = "Every section needs a Name before continuing";
    }
    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({
        description: "Please fix the highlighted fields before continuing.",
        position: "top",
        status: "error",
      });
      return;
    }

    const newBody = {
      ...pending.body,
      amountOfQuestions: Number(amountOfQuestions),
      // Backend confirmed: total marks is calculated automatically for
      // hybrid exams and rejects the field if sent at creation/edit time.
      totalMarks: examType === "hybrid" ? undefined : Number(totalMarks),
      markingTemplateId: templateRequired ? markingTemplateId : undefined,
      ...(examType && { examType: toExamTypeApiValue(examType) }),
      ...((examType === "hybrid" || examType === "without_sections") && {
        questionQuantity: seedQuantityCounts(quantityTypes, questionQuantities),
      }),
      // Every create/edit-examination-family endpoint (Assessment, and
      // ModuleExam/Exam which share adminCreateExamination — see
      // performCreateParent in QuestionsPage.jsx) needs its sections sent
      // directly on the create body — confirmed via a real backend test for
      // Assessment that this needs the minimal {name, questionCount,
      // weightage} shape (toCreateBodySections), not
      // normalizeSectionsForConfig's paper-config-oriented shape, which the
      // backend rejected outright even with a valid, non-empty array.
      // ModuleExam/Exam previously left this off entirely (gated on
      // `kind === "Assessment"`) — sections only went out via
      // paperConfigBody/updateExamPaperConfig below, which isn't the channel
      // this validation reads from. Confirmed via two separate real bug
      // reports/network dumps: a sectioned Course Exam's create body had
      // `examType: "sectioned"` and no `sections` key at all, and the
      // backend rejected it with "sections must be an array of 1-10 section
      // objects with at least a section_name/name" every time.
      ...(sectionsEnabled && sections.length > 0 && {
        sections: toCreateBodySections(sections),
      }),
    };
    // Backend confirmed (same rule Standalone's TemplateStandalone.jsx
    // already follows): an empty `configuredSections` array is rejected
    // outright, so only send the key when there's actually at least one
    // section — `undefined` (not simply omitting the key) so a stale
    // non-empty value from a previous visit gets cleared out too.
    const newPaperConfigBody = {
      ...pending.paperConfigBody,
      configuredSections: sections.length > 0 ? normalizeSectionsForConfig(sections) : undefined,
    };
    const updated = { ...pending, body: newBody, paperConfigBody: newPaperConfigBody };
    if (isCreateMode) setPendingCreate(updated); else setPendingEdit(updated);

    push(nextRoute());
  };

  function nextRoute() {
    const submitParam = isCreateMode ? "submitForApproval=1" : "editSubmit=1";
    const examParam = isExaminationParam ? `examination=${isExaminationParam}` : "";
    const moduleParam = moduleId ? `moduleId=${moduleId}` : "";
    const queryString = [examParam, submitParam, moduleParam].filter(Boolean).join("&");
    return `/admin/courses/${courseId}/assessment/${assessmentId}/questions/new?${queryString}`;
  }

  return (
    <Box marginY="20px" marginX="22px">
      <Box backgroundColor="white" padding="40px" borderRadius="8px" shadow="sm" marginBottom="30px">
        <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
          Template/Marking Scheme Details
        </Heading>

        <Flex gap={6} marginBottom={6} flexWrap="wrap">
          <Box flex={1} minW="200px">
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
          <Box flex={1} minW="200px">
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

        <Box mb={6}>
          <Select
            label="Exam Type"
            isRequired
            noEmptyOption
            value={examType}
            onChange={(e) => {
              const nextExamType = e.target.value;
              setExamType(nextExamType);
              if (nextExamType === "with_sections") setMarkingTemplateId("");
            }}
            options={EXAM_TYPE_OPTIONS}
          />
        </Box>

        <Select
          label="Marking Template"
          placeholder="Select a marking template"
          isRequired={examType !== "with_sections"}
          isDisabled={examType === "with_sections"}
          error={fieldErrors.markingTemplateId}
          value={markingTemplateId}
          onChange={(e) => setMarkingTemplateId(e.target.value)}
          options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
        />
        {examType === "with_sections" && (
          <Text fontSize="xs" color="gray.500" mt={2}>
            Sectioned exams define marking per section instead — no marking template needed.
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

        {sectionsEnabled && (
          <Box mt={8}>
            <Heading as="h3" size="md" marginBottom="16px" color="#1A202C">
              Sections
            </Heading>
            {fieldErrors.sections && (
              <Text fontSize="sm" color="red.500" mb={3}>
                {fieldErrors.sections}
              </Text>
            )}
            <SectionsBuilder
              sections={sections}
              onAdd={addSection}
              onChange={updateSection}
              onRemove={removeSection}
            />
          </Box>
        )}
      </Box>

      <Flex justifyContent="flex-end" gap="16px">
        <Button secondary onClick={handleCancel} type="button">
          Cancel
        </Button>
        <Button onClick={handleNext} type="button">
          Next: Questions
        </Button>
      </Flex>
    </Box>
  );
};

const TemplatePageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <TemplatePage {...props} />} />;
};

export default TemplatePageRoute;
