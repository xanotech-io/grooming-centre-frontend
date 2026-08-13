import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox,
  Text,
  Input as ChakraInput,
  useToast,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { Button, Heading, Breadcrumb, Link, Input, Select } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminCreateExamPaperConfigPreset, adminGetMarkingTemplates } from "../../../services";
import {
  DEFAULT_PRESET_CONFIG,
  RandomizationFieldsEditor,
  deriveRandomizationConfig,
  validatePresetSections,
} from "./PresetFieldsEditor";

// Everything below down to the component itself is a deliberate duplicate of
// TemplateStandalone.jsx's Exam Type / Sections / Marking Template block —
// same fields, same disable rules, same auto-computed Number of
// Questions/Total Marks — so authoring an exam template feels identical to
// authoring the real exam's own Template/Marking Scheme step. Kept as its
// own copy rather than a shared component on purpose.

const TYPE_COLOR = {
  MCQ: { bg: "#EBF4FF", color: "#3182CE" },
  TrueFalse: { bg: "#F0FFF4", color: "#38A169" },
  FillBlank: { bg: "#FAF5FF", color: "#805AD5" },
  Matching: { bg: "#FFF5F5", color: "#E53E3E" },
  ShortAnswer: { bg: "#FFFAF0", color: "#DD6B20" },
  Essay: { bg: "#F7FAFC", color: "#4A5568" },
};

const EXAM_TYPE_OPTIONS = [
  { label: "Exam with sections", value: "with_sections" },
  { label: "Exam without sections", value: "without_sections" },
  { label: "Hybrid (sections + standalone questions)", value: "hybrid" },
];

const EMPTY_SECTION = {
  section_name: "",
  question_types: [],
  marking_type: "",
  total_marks: null,
  question_count: null,
};

const QUESTION_TYPE_LOCK_OPTIONS = [
  { label: "All", value: "" },
  { label: "MCQ", value: "MCQ" },
  { label: "True / False", value: "TrueFalse" },
  { label: "Fill in the Blank", value: "FillBlank" },
  { label: "Matching", value: "Matching" },
  { label: "Short Answer", value: "ShortAnswer" },
  { label: "Essay", value: "Essay" },
];

const ALL_QUESTION_TYPES = QUESTION_TYPE_LOCK_OPTIONS.filter((o) => o.value !== "").map((o) => o.value);

const MARKING_TYPE_LOCK_OPTIONS = [
  { label: "Any marking type", value: "", disabled: true },
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
  { label: "Hybrid", value: "hybrid" },
];

const SectionRow = ({ section, idx, onChange, onRemove }) => (
  <Box border="1px solid #E2E8F0" borderRadius="8px" padding="24px" marginBottom="16px" bg="white">
    <Flex justifyContent="space-between" alignItems="center" marginBottom="20px">
      <Heading as="h4" size="sm" color="#1A202C">
        Section {idx + 1}
      </Heading>
      <IconButton
        aria-label="Remove section"
        icon={<FiTrash2 size={14} />}
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={() => onRemove(idx)}
      />
    </Flex>

    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
      <GridItem colSpan={3}>
        <Input
          id={`preset-section-${idx}-name`}
          label="Name"
          placeholder="Section name e.g. Section A"
          value={section.section_name}
          onChange={(e) => onChange(idx, "section_name", e.target.value)}
        />
      </GridItem>
      <GridItem colSpan={3}>
        <Text fontSize="sm" fontWeight="500" mb={2}>Question Types</Text>
        <HStack spacing={4} flexWrap="wrap">
          <Checkbox
            isChecked={(section.question_types?.length ?? 0) === ALL_QUESTION_TYPES.length}
            isIndeterminate={
              (section.question_types?.length ?? 0) > 0 &&
              section.question_types.length < ALL_QUESTION_TYPES.length
            }
            onChange={(e) => onChange(idx, "question_types", e.target.checked ? ALL_QUESTION_TYPES : [])}
          >
            All
          </Checkbox>
          {QUESTION_TYPE_LOCK_OPTIONS.filter((o) => o.value !== "").map((opt) => (
            <Checkbox
              key={opt.value}
              isChecked={(section.question_types ?? []).includes(opt.value)}
              onChange={(e) => {
                const current = section.question_types ?? [];
                const next = e.target.checked
                  ? [...current, opt.value]
                  : current.filter((v) => v !== opt.value);
                onChange(idx, "question_types", next);
              }}
            >
              {opt.label}
            </Checkbox>
          ))}
        </HStack>
      </GridItem>
      <GridItem>
        <Select
          id={`preset-section-${idx}-marking-type`}
          label="Marking Type"
          noEmptyOption
          value={section.marking_type ?? ""}
          onChange={(e) => onChange(idx, "marking_type", e.target.value)}
          options={MARKING_TYPE_LOCK_OPTIONS}
        />
      </GridItem>
      <GridItem>
        <Input
          id={`preset-section-${idx}-weightage`}
          label="Weightage/ total score"
          type="number"
          min={0}
          placeholder="e.g. 20"
          value={section.total_marks ?? ""}
          onChange={(e) => onChange(idx, "total_marks", e.target.value ? Number(e.target.value) : null)}
        />
      </GridItem>
      <GridItem>
        <Input
          id={`preset-section-${idx}-question-count`}
          label="Question Count"
          type="number"
          min={0}
          placeholder="e.g. 2"
          value={section.question_count ?? ""}
          onChange={(e) => onChange(idx, "question_count", e.target.value ? Number(e.target.value) : null)}
        />
      </GridItem>
    </Grid>
  </Box>
);

const CreateExamPaperConfigPresetPage = () => {
  const history = useHistory();
  const toast = useToast();
  const [form, setForm] = useState(DEFAULT_PRESET_CONFIG);
  const [saving, setSaving] = useState(false);
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplatesLoading, setMarkingTemplatesLoading] = useState(true);

  const [examType, setExamType] = useState("with_sections");
  const sectionsEnabled = examType === "with_sections" || examType === "hybrid";
  const [amountOfQuestions, setAmountOfQuestions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [standaloneQuestionCounts, setStandaloneQuestionCounts] = useState({});

  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, { ...EMPTY_SECTION }]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const loadTemplates = useCallback(async () => {
    setMarkingTemplatesLoading(true);
    try {
      const { templates } = await adminGetMarkingTemplates();
      setMarkingTemplates(templates);
    } catch {
      setMarkingTemplates([]);
    } finally {
      setMarkingTemplatesLoading(false);
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // A sectioned exam template defines marking per-section, not via a global
  // marking template — same rule as TemplateStandalone.jsx.
  useEffect(() => {
    if (examType === "with_sections") setForm((prev) => ({ ...prev, markingTemplateId: "" }));
  }, [examType]);

  const selectedTemplate = markingTemplates.find((t) => t.id === form.markingTemplateId);
  const standaloneTypes = selectedTemplate?.questionTypes ?? Object.keys(selectedTemplate?.markDistribution || {});

  useEffect(() => {
    if (!selectedTemplate?.questionQuantity) return;
    setStandaloneQuestionCounts((prev) => ({ ...selectedTemplate.questionQuantity, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.markingTemplateId, markingTemplates]);

  const sectionsWeightageTotal = sections.reduce((acc, s) => acc + (Number(s.total_marks) || 0), 0);
  const sectionsQuestionCountTotal = sections.reduce((acc, s) => acc + (Number(s.question_count) || 0), 0);
  const standaloneMarksTotal = standaloneTypes.reduce((acc, type) => {
    const qty = Number(standaloneQuestionCounts[type]) || 0;
    const typeMark = Number(selectedTemplate?.markDistribution?.[type]) || 0;
    return acc + qty * typeMark;
  }, 0);
  const standaloneQuantityTotal = standaloneTypes.reduce(
    (acc, type) => acc + (Number(standaloneQuestionCounts[type]) || 0),
    0,
  );

  useEffect(() => {
    if (examType !== "with_sections") return;
    setTotalMarks(String(sectionsWeightageTotal));
  }, [examType, sectionsWeightageTotal]);

  useEffect(() => {
    if (examType !== "with_sections") return;
    setAmountOfQuestions(String(sectionsQuestionCountTotal));
  }, [examType, sectionsQuestionCountTotal]);

  useEffect(() => {
    if (examType !== "without_sections") return;
    setTotalMarks(String(standaloneMarksTotal));
  }, [examType, standaloneMarksTotal]);

  useEffect(() => {
    if (examType !== "without_sections") return;
    setAmountOfQuestions(String(standaloneQuantityTotal));
  }, [examType, standaloneQuantityTotal]);

  useEffect(() => {
    if (examType !== "hybrid") return;
    setTotalMarks(String(sectionsWeightageTotal + standaloneMarksTotal));
  }, [examType, sectionsWeightageTotal, standaloneMarksTotal]);

  useEffect(() => {
    if (examType !== "hybrid") return;
    setAmountOfQuestions(String(sectionsQuestionCountTotal + standaloneQuantityTotal));
  }, [examType, sectionsQuestionCountTotal, standaloneQuantityTotal]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    const newErrors = {};
    if (sectionsEnabled && sections.some((s) => !s.section_name?.trim())) {
      newErrors.sections = "Every section needs a Name before continuing";
    } else if (sectionsEnabled && sections.some((s) => !s.marking_type)) {
      newErrors.sections = "Every section needs a Marking Type selected (Automatic, Manual, or Hybrid)";
    }
    if (examType !== "with_sections" && !form.markingTemplateId) {
      newErrors.markingTemplateId = "Please select a marking template";
    }
    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Same question_type shape rule as TemplateStandalone.jsx's "Save as
    // Exam Template": a single string for 0-1 selected types, an array
    // when 2+ are selected.
    const presetSections = sections.map((s) => ({
      section_name: s.section_name,
      questionCount: Number(s.question_count) || 0,
      questionType: s.question_types?.length > 1 ? s.question_types : (s.question_types?.[0] || ""),
      markingType: s.marking_type || "",
      weightage: s.total_marks != null ? Number(s.total_marks) : null,
    }));
    const sectionsError = validatePresetSections(presetSections);
    if (sectionsError) {
      toast({ title: sectionsError, status: "warning", duration: 3000, isClosable: true });
      return;
    }

    setSaving(true);
    try {
      const { preset } = await adminCreateExamPaperConfigPreset({
        name: form.name.trim(),
        ...(form.markingTemplateId ? { markingTemplateId: form.markingTemplateId } : {}),
        navigationMode: form.navigationMode,
        uiSettings: form.uiSettings,
        toolsEnabled: form.toolsEnabled,
        submissionSettings: form.submissionSettings,
        randomizationMethod: form.randomizationMethod,
        randomizationConfig: deriveRandomizationConfig(form.randomizationMethod),
        sections: presetSections,
      });
      toast({ title: "Exam template created", status: "success", duration: 3000, isClosable: true });
      history.push(`/admin/exam-paper-config-presets/${preset.id}`);
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to create exam template", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/exam-paper-config-presets">Exam Template Library</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Create</Link></BreadcrumbItem>}
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
        <Flex alignItems="center" gap="12px" mb="24px">
          <IconButton
            aria-label="Go back" icon={<FaArrowLeft />} variant="ghost" size="sm"
            onClick={() => history.push("/admin/exam-paper-config-presets")}
          />
          <Heading fontSize="22px" fontWeight="600">Create Exam Template</Heading>
        </Flex>

        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px" mb="16px">
          <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="14px">
            Basic Information
          </Text>
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Name *</Text>
          <ChakraInput
            size="sm"
            borderRadius="6px"
            placeholder="e.g. Standard 60-Minute MCQ Paper"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </Box>

        <Box backgroundColor="white" padding="40px" borderRadius="8px" shadow="sm" marginBottom="16px">
          <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
            Template/Marking Scheme Details
          </Heading>

          <Grid templateColumns="repeat(2, 1fr)" gap={6} marginBottom="24px">
            <GridItem>
              <Input
                label="Number of Questions"
                type="number"
                id="amountOfQuestions"
                placeholder={
                  examType === "without_sections"
                    ? "Sum of the question-type quantities below"
                    : examType === "with_sections"
                      ? "Sum of each section's Question Count"
                      : "Sections' Question Count + standalone quantities"
                }
                value={amountOfQuestions}
                isReadOnly
                isDisabled
                onChange={() => {}}
              />
            </GridItem>
            <GridItem>
              <Input
                label="Total Marks"
                type="number"
                id="totalMarks"
                placeholder={
                  examType === "with_sections"
                    ? "Sum of section weightages"
                    : examType === "without_sections"
                      ? "Sum of the question-type marks below"
                      : "Sections weightage + standalone questions marks"
                }
                value={totalMarks}
                isReadOnly
                isDisabled
                onChange={() => {}}
              />
            </GridItem>
            <GridItem colSpan={2}>
              <Select
                label="Exam Type"
                isRequired
                noEmptyOption
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                options={EXAM_TYPE_OPTIONS}
              />
            </GridItem>
          </Grid>

          {sectionsEnabled && (
            <>
              <Heading as="h3" size="md" marginTop="8px" marginBottom="16px" color="#1A202C">
                Sections
              </Heading>
              {fieldErrors.sections && (
                <Text fontSize="sm" color="red.500" mb={3}>{fieldErrors.sections}</Text>
              )}
              {sections.length === 0 && (
                <Text fontSize="sm" color="gray.500" mb={3}>
                  No sections added yet. Sections let you group questions and optionally cap time per group.
                </Text>
              )}
              {sections.map((s, i) => (
                <SectionRow key={i} section={s} idx={i} onChange={updateSection} onRemove={removeSection} />
              ))}
              <Button secondary type="button" leftIcon={<FaPlus />} onClick={addSection}>
                Add Section
              </Button>
            </>
          )}

          <Grid templateColumns="repeat(2, 1fr)" gap={6} marginTop="30px">
            <GridItem colSpan={2}>
              <Select
                label="Marking Template"
                placeholder="Select a marking template"
                isRequired={examType !== "with_sections"}
                isDisabled={examType === "with_sections" || markingTemplatesLoading}
                error={fieldErrors.markingTemplateId}
                value={form.markingTemplateId}
                onChange={(e) => setForm((prev) => ({ ...prev, markingTemplateId: e.target.value }))}
                options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
              />
            </GridItem>

            {selectedTemplate && (
              <GridItem colSpan={2}>
                <Box border="1px solid #E2E8F0" borderRadius="8px" padding="16px">
                  <Text fontSize="14px" fontWeight="600" color="#4A5568" marginBottom="12px">
                    {examType === "hybrid"
                      ? `Standalone Questions — marks per type from "${selectedTemplate.markingTemplateName}"`
                      : `Question Quantities — marks per type from "${selectedTemplate.markingTemplateName}"`}
                  </Text>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th textTransform="none" color="#4A5568">Question Type</Th>
                          <Th textTransform="none" color="#4A5568">Quantity</Th>
                          <Th textTransform="none" color="#4A5568">Marks (per question)</Th>
                          <Th textTransform="none" color="#4A5568">Subtotal</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {standaloneTypes.map((type) => {
                          const style = TYPE_COLOR[type] || { bg: "#F7FAFC", color: "#718096" };
                          const typeMark = selectedTemplate.markDistribution?.[type];
                          return (
                            <Tr key={type}>
                              <Td>
                                <Badge bg={style.bg} color={style.color} px="8px" py="2px" borderRadius="8px" textTransform="none" fontSize="12px">
                                  {type}
                                </Badge>
                              </Td>
                              <Td fontSize="13px" color="#1A202C">
                                <ChakraInput
                                  size="sm"
                                  type="number"
                                  min={0}
                                  placeholder="0"
                                  value={standaloneQuestionCounts[type] ?? ""}
                                  onChange={(e) => setStandaloneQuestionCounts((p) => ({ ...p, [type]: e.target.value }))}
                                />
                              </Td>
                              <Td fontSize="13px" fontWeight="600" color="#6b006b">{typeMark ?? "—"}</Td>
                              <Td fontSize="13px" color="#1A202C">
                                {(Number(standaloneQuestionCounts[type]) || 0) * (Number(typeMark) || 0)}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    {examType === "hybrid"
                      ? `Sections weightage (${sectionsWeightageTotal}) + Standalone questions (${standaloneMarksTotal}) = Total Marks (${sectionsWeightageTotal + standaloneMarksTotal})`
                      : `Total: ${standaloneQuantityTotal} questions, ${standaloneMarksTotal} marks`}
                  </Text>
                </Box>
              </GridItem>
            )}
          </Grid>
        </Box>

        <RandomizationFieldsEditor values={form} setValues={setForm} disabled={false} />

        <Flex justifyContent="flex-end" gap="12px" mt="16px">
          <Button secondary onClick={() => history.push("/admin/exam-paper-config-presets")}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSubmit}>Create Exam Template</Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateExamPaperConfigPresetPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateExamPaperConfigPresetPage {...props} />} />
);

export default CreateExamPaperConfigPresetPageRoute;
