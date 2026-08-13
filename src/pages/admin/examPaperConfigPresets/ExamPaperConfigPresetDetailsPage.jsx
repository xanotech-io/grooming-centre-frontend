import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  GridItem,
  HStack,
  Badge,
  Spinner,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  Tooltip,
  Input as ChakraInput,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaArrowLeft, FaTrash, FaPlus } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { Button, Heading, Breadcrumb, Link, Input, Select } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import {
  adminGetExamPaperConfigPresetById,
  adminUpdateExamPaperConfigPreset,
  adminDeleteExamPaperConfigPreset,
  adminGetMarkingTemplates,
} from "../../../services";
import {
  hydratePresetForm,
  validatePresetSections,
  deriveRandomizationConfig,
  RandomizationFieldsEditor,
} from "./PresetFieldsEditor";

// Same duplicate-not-shared Exam Type / Sections / Marking Template block as
// CreateExamPaperConfigPresetPage.jsx — kept as its own copy on purpose, see
// that file's header comment.

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

// Presets don't persist an Exam Type field — it's derived the same way the
// mutual-exclusivity rule enforces it while editing: sections present means
// sectioned, a markingTemplateId means unsectioned, both means hybrid.
const deriveExamType = (preset) => {
  const hasSections = (preset?.sections?.length ?? 0) > 0;
  const hasTemplate = !!preset?.markingTemplateId;
  if (hasSections && hasTemplate) return "hybrid";
  if (hasTemplate) return "without_sections";
  return "with_sections";
};

// Wire shape (section_name/questionCount/questionType/markingType/weightage)
// -> this block's rich local shape (question_types array/question_count/
// marking_type/total_marks) — the reverse of what handleSaveFull sends.
const richSectionsFromWire = (sections = []) =>
  sections.map((s) => ({
    section_name: s.section_name || "",
    question_types: Array.isArray(s.questionType)
      ? s.questionType
      : s.questionType ? [s.questionType] : [],
    marking_type: s.markingType || "",
    total_marks: s.weightage ?? null,
    question_count: s.questionCount ?? null,
  }));

const SectionRow = ({ section, idx, onChange, onRemove, disabled }) => (
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
        isDisabled={disabled}
      />
    </Flex>

    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
      <GridItem colSpan={3}>
        <Input
          id={`preset-edit-section-${idx}-name`}
          label="Name"
          placeholder="Section name e.g. Section A"
          value={section.section_name}
          isDisabled={disabled}
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
            isDisabled={disabled}
            onChange={(e) => onChange(idx, "question_types", e.target.checked ? ALL_QUESTION_TYPES : [])}
          >
            All
          </Checkbox>
          {QUESTION_TYPE_LOCK_OPTIONS.filter((o) => o.value !== "").map((opt) => (
            <Checkbox
              key={opt.value}
              isChecked={(section.question_types ?? []).includes(opt.value)}
              isDisabled={disabled}
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
          id={`preset-edit-section-${idx}-marking-type`}
          label="Marking Type"
          noEmptyOption
          isDisabled={disabled}
          value={section.marking_type ?? ""}
          onChange={(e) => onChange(idx, "marking_type", e.target.value)}
          options={MARKING_TYPE_LOCK_OPTIONS}
        />
      </GridItem>
      <GridItem>
        <Input
          id={`preset-edit-section-${idx}-weightage`}
          label="Weightage/ total score"
          type="number"
          min={0}
          placeholder="e.g. 20"
          value={section.total_marks ?? ""}
          isDisabled={disabled}
          onChange={(e) => onChange(idx, "total_marks", e.target.value ? Number(e.target.value) : null)}
        />
      </GridItem>
      <GridItem>
        <Input
          id={`preset-edit-section-${idx}-question-count`}
          label="Question Count"
          type="number"
          min={0}
          placeholder="e.g. 2"
          value={section.question_count ?? ""}
          isDisabled={disabled}
          onChange={(e) => onChange(idx, "question_count", e.target.value ? Number(e.target.value) : null)}
        />
      </GridItem>
    </Grid>
  </Box>
);

// The Exam Type / Number of Questions / Total Marks / Sections / Marking
// Template / Question Quantities block, in both editable and read-only
// (disabled) form — used for the editing form and the read-only preview.
// Question Quantities are shown blank in read-only mode: those per-type
// counts were never part of the saved preset (see CreateExamPaperConfigPresetPage.jsx's
// note that they're local-only UI aids), so there's nothing persisted to
// redisplay for an existing template.
const TemplateSchemeBlock = ({
  disabled,
  examType,
  setExamType,
  sections,
  setSections,
  markingTemplateId,
  setMarkingTemplateId,
  markingTemplates,
  markingTemplatesLoading,
  fieldErrors,
}) => {
  const [standaloneQuestionCounts, setStandaloneQuestionCounts] = useState({});
  const sectionsEnabled = examType === "with_sections" || examType === "hybrid";

  const addSection = () => setSections((p) => [...p, { ...EMPTY_SECTION }]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  useEffect(() => {
    if (disabled || examType !== "with_sections") return;
    setMarkingTemplateId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examType, disabled]);

  const selectedTemplate = markingTemplates.find((t) => t.id === markingTemplateId);
  const standaloneTypes = selectedTemplate?.questionTypes ?? Object.keys(selectedTemplate?.markDistribution || {});

  useEffect(() => {
    if (disabled || !selectedTemplate?.questionQuantity) return;
    setStandaloneQuestionCounts((prev) => ({ ...selectedTemplate.questionQuantity, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markingTemplateId, markingTemplates, disabled]);

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

  const amountOfQuestions =
    examType === "with_sections" ? sectionsQuestionCountTotal
      : examType === "without_sections" ? standaloneQuantityTotal
        : sectionsQuestionCountTotal + standaloneQuantityTotal;
  const totalMarks =
    examType === "with_sections" ? sectionsWeightageTotal
      : examType === "without_sections" ? standaloneMarksTotal
        : sectionsWeightageTotal + standaloneMarksTotal;

  return (
    <Box backgroundColor="white" padding="40px" borderRadius="8px" shadow="sm" marginBottom="16px">
      <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
        Template/Marking Scheme Details
      </Heading>

      <Grid templateColumns="repeat(2, 1fr)" gap={6} marginBottom="24px">
        <GridItem>
          <Input
            label="Number of Questions"
            type="number"
            value={String(amountOfQuestions)}
            isReadOnly
            isDisabled
            onChange={() => {}}
          />
        </GridItem>
        <GridItem>
          <Input
            label="Total Marks"
            type="number"
            value={String(totalMarks)}
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
            isDisabled={disabled}
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
          {fieldErrors?.sections && (
            <Text fontSize="sm" color="red.500" mb={3}>{fieldErrors.sections}</Text>
          )}
          {sections.length === 0 && (
            <Text fontSize="sm" color="gray.500" mb={3}>
              No sections added yet. Sections let you group questions and optionally cap time per group.
            </Text>
          )}
          {sections.map((s, i) => (
            <SectionRow key={i} section={s} idx={i} onChange={updateSection} onRemove={removeSection} disabled={disabled} />
          ))}
          {!disabled && (
            <Button secondary type="button" leftIcon={<FaPlus />} onClick={addSection}>
              Add Section
            </Button>
          )}
        </>
      )}

      <Grid templateColumns="repeat(2, 1fr)" gap={6} marginTop="30px">
        <GridItem colSpan={2}>
          <Select
            label="Marking Template"
            placeholder="Select a marking template"
            isRequired={examType !== "with_sections"}
            isDisabled={disabled || examType === "with_sections" || markingTemplatesLoading}
            error={fieldErrors?.markingTemplateId}
            value={markingTemplateId}
            onChange={(e) => setMarkingTemplateId(e.target.value)}
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
                              isDisabled={disabled}
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
              {disabled && (
                <Text fontSize="xs" color="gray.400" mt={2}>
                  Quantities aren't saved on the template itself — they're set per exam when this template is used.
                </Text>
              )}
            </Box>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
};

const ExamPaperConfigPresetDetailsPage = () => {
  const history = useHistory();
  const { presetId } = useParams();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [examType, setExamType] = useState("with_sections");
  const [sections, setSections] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [nameOnly, setNameOnly] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplatesLoading, setMarkingTemplatesLoading] = useState(true);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const deleteRef = React.useRef();

  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { preset } = await adminGetExamPaperConfigPresetById(presetId);
    return { preset };
  }, [presetId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const preset = resource.data?.preset;
  const usageCount = preset?.usageCount ?? 0;
  const coursesUsedIn = preset?.coursesUsedIn ?? [];
  const isLocked = usageCount > 0;

  useEffect(() => {
    if (preset) setNameOnly(preset.name || "");
  }, [preset]);

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

  // Loaded up front (not just on startEdit) so the read-only preview can
  // also resolve the selected marking template's real name, not just its id.
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const startEdit = () => {
    setForm(hydratePresetForm(preset));
    setExamType(deriveExamType(preset));
    setSections(richSectionsFromWire(preset.sections));
    setFieldErrors({});
    setEditing(true);
  };

  const handleSaveFull = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    const newErrors = {};
    const sectionsEnabled = examType === "with_sections" || examType === "hybrid";
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
      await adminUpdateExamPaperConfigPreset(presetId, {
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
      toast({ title: "Exam template updated", status: "success", duration: 3000, isClosable: true });
      setEditing(false);
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to update exam template", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNameOnly = async () => {
    if (!nameOnly.trim() || nameOnly === preset.name) return;
    setSaving(true);
    try {
      await adminUpdateExamPaperConfigPreset(presetId, { name: nameOnly.trim() });
      toast({ title: "Name updated", status: "success", duration: 2000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to update name", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    onDeleteClose();
    setDeleting(true);
    try {
      await adminDeleteExamPaperConfigPreset(presetId);
      toast({ title: "Exam template deleted", status: "success", duration: 3000, isClosable: true });
      history.push("/admin/exam-paper-config-presets");
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to delete exam template", status: "error", duration: 4000, isClosable: true });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/exam-paper-config-presets">Exam Template Library</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Details</Link></BreadcrumbItem>}
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
        <Flex alignItems="center" gap="12px" mb="24px">
          <IconButton
            aria-label="Go back" icon={<FaArrowLeft />} variant="ghost" size="sm"
            onClick={() => history.push("/admin/exam-paper-config-presets")}
          />
          <Heading fontSize="22px" fontWeight="600">Exam Template Details</Heading>
        </Flex>

        {resource.loading && <Flex justifyContent="center" py="60px"><Spinner size="xl" color="blue.500" /></Flex>}
        {resource.err && <Flex justifyContent="center" py="60px"><Text color="red.500">Failed to load exam template.</Text></Flex>}

        {!resource.loading && !resource.err && preset && (
          <>
            {/* Header / usage card */}
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="24px" mb="20px">
              <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px" mb="16px">
                <Box>
                  <Text fontSize="20px" fontWeight="700" color="#1A202C" mb="6px">{preset.name}</Text>
                  <Text fontSize="14px" color="gray.500" textTransform="capitalize">
                    Navigation: {(preset.navigationMode || "—").replace(/-/g, " ")}
                  </Text>
                </Box>
                <Flex gap="8px" alignItems="center">
                  <Badge bg={isLocked ? "#EBF4FF" : "#E6F4EA"} color={isLocked ? "#3182CE" : "#38A169"} px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
                    {usageCount} use{usageCount === 1 ? "" : "s"}
                  </Badge>
                  <Tooltip label={isLocked ? "Cannot delete — template is in use" : ""} isDisabled={!isLocked}>
                    <IconButton
                      aria-label="Delete exam template" icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red"
                      isDisabled={isLocked} isLoading={deleting} onClick={onDeleteOpen}
                    />
                  </Tooltip>
                </Flex>
              </Flex>

              <Divider mb="16px" />

              {isLocked && (
                <Box bg="#FFF5EA" border="1px solid #FBD38D" borderRadius="6px" px="12px" py="10px" mb="16px">
                  <Text fontSize="13px" color="#744210">
                    This exam template is used by {usageCount} exam(s)/assessment(s). Only the name can be changed —
                    create a new exam template to change its structure.
                  </Text>
                </Box>
              )}

              {isLocked ? (
                <Flex gap="8px" maxW="480px" alignItems="center">
                  <ChakraInput size="sm" borderRadius="6px" value={nameOnly} onChange={(e) => setNameOnly(e.target.value)} />
                  <Button size="sm" isLoading={saving} onClick={handleSaveNameOnly}>Save Name</Button>
                </Flex>
              ) : !editing ? (
                <Button size="sm" secondary onClick={startEdit}>Edit Exam Template</Button>
              ) : null}

              {coursesUsedIn.length > 0 && (
                <Box mt="20px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="10px">Used In</Text>
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead bg="#F7FAFC">
                        <Tr>
                          <Th py="10px" fontSize="12px" color="gray.500" fontWeight="600" textTransform="none">Course</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {coursesUsedIn.map((c) => (
                          <Tr key={c.id}>
                            <Td py="10px" fontSize="13px">{c.title}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>

            {editing && form && (
              <>
                <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px" mb="16px">
                  <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="14px">
                    Basic Information
                  </Text>
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Name *</Text>
                  <ChakraInput
                    size="sm"
                    borderRadius="6px"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </Box>

                <TemplateSchemeBlock
                  disabled={false}
                  examType={examType}
                  setExamType={setExamType}
                  sections={sections}
                  setSections={setSections}
                  markingTemplateId={form.markingTemplateId}
                  setMarkingTemplateId={(id) => setForm((prev) => ({ ...prev, markingTemplateId: id }))}
                  markingTemplates={markingTemplates}
                  markingTemplatesLoading={markingTemplatesLoading}
                  fieldErrors={fieldErrors}
                />

                <RandomizationFieldsEditor values={form} setValues={setForm} disabled={false} />

                <Flex justifyContent="flex-end" gap="12px" mt="16px" mb="40px">
                  <Button secondary onClick={() => setEditing(false)}>Cancel</Button>
                  <Button isLoading={saving} onClick={handleSaveFull}>Save Changes</Button>
                </Flex>
              </>
            )}

            {!editing && (
              <>
                <TemplateSchemeBlock
                  disabled
                  examType={deriveExamType(preset)}
                  setExamType={() => {}}
                  sections={richSectionsFromWire(preset.sections)}
                  setSections={() => {}}
                  markingTemplateId={preset.markingTemplateId || ""}
                  setMarkingTemplateId={() => {}}
                  markingTemplates={markingTemplates}
                  markingTemplatesLoading={markingTemplatesLoading}
                  fieldErrors={{}}
                />
                <RandomizationFieldsEditor values={hydratePresetForm(preset)} setValues={() => {}} disabled />
              </>
            )}
          </>
        )}

        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={deleteRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="16px" fontWeight="600">Delete Exam Template?</AlertDialogHeader>
              <AlertDialogBody fontSize="14px" color="gray.600">
                This cannot be undone. Exam templates currently in use cannot be deleted.
              </AlertDialogBody>
              <AlertDialogFooter gap="8px">
                <Button secondary ref={deleteRef} onClick={onDeleteClose}>Cancel</Button>
                <Button colorScheme="red" isLoading={deleting} onClick={handleDelete}>Delete</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ExamPaperConfigPresetDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamPaperConfigPresetDetailsPage {...props} />} />
);

export default ExamPaperConfigPresetDetailsPageRoute;
