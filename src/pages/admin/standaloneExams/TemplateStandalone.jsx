import React, { useEffect, useState } from "react";
import { Box, Flex, Grid, GridItem, Text, Divider } from "@chakra-ui/layout";
import {
    Heading,
    Switch,
    HStack,
    Circle,
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
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { FaRegSave, FaFileAlt } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { Button, Input, Select } from "../../../components";
import { useQueryParams, useGoBack } from "../../../hooks";
import { adminGetMarkingTemplates } from "../../../services";
import useAssessmentStore from "../../../store/assessmentStore";

// Kept identical to ExamTemplateDetailsPage.jsx's — same question-type badge colors.
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

// Kept identical to OverViewStandalone.jsx's — QuestionsStandalone.jsx enforces
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

const ALL_QUESTION_TYPES = QUESTION_TYPE_LOCK_OPTIONS.filter((o) => o.value !== "").map((o) => o.value);

const MARKING_TYPE_LOCK_OPTIONS = [
    { label: "Any marking type", value: "" },
    { label: "Automatic", value: "automatic" },
    { label: "Manual", value: "manual" },
    { label: "Hybrid", value: "hybrid" },
];

const SectionRow = ({ section, idx, onChange, onRemove, disabled }) => (
    <Box
        border="1px solid #E2E8F0"
        borderRadius="8px"
        padding="24px"
        marginBottom="16px"
        bg="white"
    >
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
                    id={`section-${idx}-name`}
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
                        onChange={(e) =>
                            onChange(idx, "question_types", e.target.checked ? ALL_QUESTION_TYPES : [])
                        }
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
                    id={`section-${idx}-marking-type`}
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
                    id={`section-${idx}-weightage`}
                    label="Weightage/ total score"
                    type="number"
                    min={0}
                    placeholder="e.g. 20"
                    value={section.total_marks ?? ""}
                    isDisabled={disabled}
                    onChange={(e) =>
                        onChange(
                            idx,
                            "total_marks",
                            e.target.value ? Number(e.target.value) : null,
                        )
                    }
                />
            </GridItem>
            <GridItem>
                <Input
                    id={`section-${idx}-question-count`}
                    label="Question Count"
                    type="number"
                    min={0}
                    placeholder="e.g. 2"
                    value={section.question_count ?? ""}
                    isDisabled={disabled}
                    onChange={(e) =>
                        onChange(
                            idx,
                            "question_count",
                            e.target.value ? Number(e.target.value) : null,
                        )
                    }
                />
            </GridItem>
        </Grid>
    </Box>
);

const TemplateStandalone = () => {
    const { push } = useHistory();
    const examinationId = useQueryParams().get("examination");
    const handleCancel = useGoBack();
    const isCreateMode = examinationId === "new";

    const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
    const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);

    const [amountOfQuestions, setAmountOfQuestions] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [examType, setExamType] = useState("with_sections");
    const sectionsEnabled = examType === "with_sections" || examType === "hybrid";
    // None of the three exam types take Total Marks by hand anymore — it's
    // always derived from sections, the marking template, or (for hybrid)
    // both combined.
    const totalMarksIsAuto = true;
    const [markingTemplates, setMarkingTemplates] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    // How many questions of each type to create — for "without sections"
    // this is every question in the exam; for "hybrid" it's just the
    // non-sectioned ones. Marks per question always come from the
    // selected marking template, never typed in by hand.
    const [standaloneQuestionCounts, setStandaloneQuestionCounts] = useState({});

    const [sections, setSections] = useState([]);
    const addSection = () => setSections((p) => [...p, { ...EMPTY_SECTION }]);
    const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
    const updateSection = (i, field, value) =>
        setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

    // A sectioned exam defines marking per-section, not via a marking
    // template — clear out any previously-picked template (e.g. from
    // switching Exam Type back and forth) so the disabled Select can't hold
    // onto a stale selection that would otherwise still get submitted.
    useEffect(() => {
        if (examType === "with_sections") setTemplateId("");
    }, [examType]);

    // The marking-templates list already carries each template's full
    // markDistribution/questionQuantity/totalMarks — no need for a separate
    // by-ID fetch once one is picked.
    const selectedTemplate = markingTemplates.find((t) => t.id === templateId);
    const standaloneTypes = selectedTemplate?.questionTypes ?? Object.keys(selectedTemplate?.markDistribution || {});

    const sectionsWeightageTotal = sections.reduce((acc, s) => acc + (Number(s.total_marks) || 0), 0);
    const sectionsQuestionCountTotal = sections.reduce((acc, s) => acc + (Number(s.question_count) || 0), 0);
    const standaloneMarksTotal = standaloneTypes.reduce((acc, type) => {
        const qty = Number(standaloneQuestionCounts[type]) || 0;
        const perQuestionMark = Number(selectedTemplate?.markDistribution?.[type]) || 0;
        return acc + qty * perQuestionMark;
    }, 0);
    const standaloneQuantityTotal = standaloneTypes.reduce(
        (acc, type) => acc + (Number(standaloneQuestionCounts[type]) || 0),
        0,
    );

    // "Exam with sections" has no standalone total-marks input of its own —
    // it's always the sum of every section's own weightage, since that's
    // what each section's questions are bound to abide by.
    useEffect(() => {
        if (examType !== "with_sections") return;
        setTotalMarks(String(sectionsWeightageTotal));
    }, [examType, sectionsWeightageTotal]);

    // Same reasoning for Number of Questions: the backend auto-computes it
    // from the sum of every section's own Question Count, so it's not a
    // separate manual field for a sectioned exam either.
    useEffect(() => {
        if (examType !== "with_sections") return;
        setAmountOfQuestions(String(sectionsQuestionCountTotal));
    }, [examType, sectionsQuestionCountTotal]);

    // "Exam without sections" likewise has no standalone total-marks input —
    // it's derived from how many questions of each type the admin enters
    // (below) times that type's mark value from the marking template, not
    // the template's own default questionQuantity and not typed in by hand.
    useEffect(() => {
        if (examType !== "without_sections") return;
        setTotalMarks(String(standaloneMarksTotal));
    }, [examType, standaloneMarksTotal]);

    // Same reasoning for Number of Questions: it's the sum of the per-type
    // quantities entered below, not a separate manual field, for "without
    // sections" exams.
    useEffect(() => {
        if (examType !== "without_sections") return;
        setAmountOfQuestions(String(standaloneQuantityTotal));
    }, [examType, standaloneQuantityTotal]);

    // Hybrid combines both laws: the sections' own weightage, plus the
    // standalone questions' marks (quantity per type × that type's mark
    // value from the marking template) — the remaining marks not already
    // allocated to a section.
    useEffect(() => {
        if (examType !== "hybrid") return;
        setTotalMarks(String(sectionsWeightageTotal + standaloneMarksTotal));
    }, [examType, sectionsWeightageTotal, standaloneMarksTotal]);

    useEffect(() => {
        adminGetMarkingTemplates()
            .then(({ templates }) => setMarkingTemplates(templates))
            .catch(() => {});
    }, []);

    // Restore whatever was already filled in before the user moved on to the
    // Questions step and came back, mirroring the same restore pattern used
    // on the Overview shell for the rest of the pending-create form.
    useEffect(() => {
        if (!isCreateMode || pendingCreate?.kind !== "StandaloneExam") return;
        const { body } = pendingCreate;
        if (body?.amountOfQuestions != null) setAmountOfQuestions(body.amountOfQuestions);
        if (body?.totalMarks != null) setTotalMarks(body.totalMarks);
        if (body?.templateId) setTemplateId(body.templateId);
        if (body?.examType) setExamType(body.examType);
        if (body?.standaloneQuestionCounts) setStandaloneQuestionCounts(body.standaloneQuestionCounts);
        // `paperConfigBody.configuredSections` (the full local shape, with
        // question_types/marking_type) is written for every exam type,
        // including sectioned — prefer it. `body.sections` (the backend's
        // strict section_name/weightage/questionCount shape, sectioned-only)
        // is only a fallback for older persisted data from before that.
        if (pendingCreate.paperConfigBody?.configuredSections?.length) {
            setSections(pendingCreate.paperConfigBody.configuredSections);
        } else if (Array.isArray(body?.sections) && body.sections.length > 0) {
            setSections(
                body.sections.map((s) => ({
                    ...EMPTY_SECTION,
                    section_name: s.section_name,
                    total_marks: s.weightage ?? null,
                    question_count: s.questionCount ?? null,
                })),
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNext = () => {
        if (isCreateMode) {
            const newErrors = {};
            if (examType === "without_sections") {
                if (templateId && (!amountOfQuestions || Number(amountOfQuestions) <= 0))
                    newErrors.amountOfQuestions = "Enter at least one question-type quantity below";
            } else if (examType === "with_sections") {
                if (!amountOfQuestions || Number(amountOfQuestions) <= 0)
                    newErrors.amountOfQuestions = "Add at least one section and enter its Question Count";
            } else if (!amountOfQuestions) {
                newErrors.amountOfQuestions = "Please enter number of questions";
            }
            if (examType === "with_sections") {
                if (!sections.length || Number(totalMarks) <= 0)
                    newErrors.totalMarks = "Add at least one section and enter its weightage/total score";
            } else if (examType === "without_sections") {
                if (templateId && (!totalMarks || Number(totalMarks) <= 0))
                    newErrors.totalMarks = "The selected marking template has no marks distribution";
            } else if (examType === "hybrid") {
                if (Number(totalMarks) <= 0)
                    newErrors.totalMarks = "Add section weightage and/or standalone question quantities to calculate total marks";
            }
            if (examType !== "with_sections" && !templateId)
                newErrors.templateId = "Please select a marking template";
            setFieldErrors(newErrors);
            if (Object.keys(newErrors).length > 0) return;

            // Seeded with every type the selected marking template actually
            // supports (even ones left blank/0) so QuestionsStandalone.jsx
            // can tell "not supported by this template" (key absent) apart
            // from "supported, just capped at 0" (key present, value 0).
            const seededStandaloneQuestionCounts = Object.fromEntries(
                standaloneTypes.map((type) => [type, standaloneQuestionCounts[type] ?? ""]),
            );

            if (pendingCreate?.kind === "StandaloneExam") {
                const isSectioned = examType === "with_sections";
                setPendingCreate({
                    ...pendingCreate,
                    body: {
                        ...pendingCreate.body,
                        totalMarks: Number(totalMarks),
                        examType,
                        // A sectioned exam has no marking template — sections
                        // define their own marking instead. `undefined` (not
                        // just omitting the key) is required here to clear
                        // out a `templateId` already sitting in
                        // `pendingCreate.body` from a previous visit where a
                        // different Exam Type was selected — JSON.stringify
                        // drops `undefined` values, so it never reaches the
                        // backend.
                        templateId: isSectioned ? undefined : templateId,
                        // Confirmed against a real backend test: a sectioned
                        // exam auto-computes amountOfQuestions from the sum of
                        // each section's own questionCount — sending it here
                        // isn't part of that tested/working contract, so it's
                        // cleared the same way templateId is above.
                        amountOfQuestions: isSectioned ? undefined : Number(amountOfQuestions),
                        // Confirmed against a real backend test: a sectioned
                        // exam takes its sections directly on the create body
                        // as `sections: [{ section_name, weightage,
                        // questionCount }]` — NOT `configuredSections` (that
                        // field name is rejected outright) and NOT via the
                        // separate paper-config PUT below (too late for the
                        // backend's totalMarks-vs-sections validation, which
                        // runs at creation time).
                        ...(isSectioned && {
                            sections: sections.map((s) => ({
                                section_name: s.section_name,
                                weightage: Number(s.total_marks) || 0,
                                questionCount: Number(s.question_count) || 0,
                            })),
                        }),
                        ...((examType === "hybrid" || examType === "without_sections") && {
                            standaloneQuestionCounts: seededStandaloneQuestionCounts,
                        }),
                    },
                    paperConfigBody: {
                        ...pendingCreate.paperConfigBody,
                        // Sections are optional — the backend rejects an
                        // empty `configuredSections` array, so leave the key
                        // out entirely when none were added instead of
                        // sending `[]`. Kept here (with the full
                        // question_types/marking_type detail) even for a
                        // sectioned exam — QuestionsStandalone.jsx's
                        // sectionQuestionTypes feature and this page's own
                        // restore-on-remount both still read it locally.
                        // QuestionsStandalone.jsx is responsible for
                        // stripping this key back out before it ever reaches
                        // the paper-config PUT for a sectioned exam, since
                        // `configuredSections` is rejected outright there —
                        // the real sections went on the create body instead
                        // (above).
                        ...(sectionsEnabled && sections.length > 0 && {
                            configuredSections: sections.map((s) => ({
                                section_name: s.section_name,
                                questions_count: Number(s.questions_count) || 0,
                                time_limit: s.time_limit ? Number(s.time_limit) : null,
                                question_types: s.question_types || [],
                                marking_type: s.marking_type || "",
                                total_marks: s.total_marks ? Number(s.total_marks) : null,
                            })),
                        }),
                    },
                });
            }
            push("/admin/standalone-exams/questions/?examination=new&submitForApproval=1");
            return;
        }
        push(`/admin/standalone-exams/questions/?examination=${examinationId}`);
    };

    return (
        <Box marginY="20px" marginX="22px">
            <Grid templateColumns="1fr 350px" gap="30px" alignItems="start">

                {/* Left Column: Template Details */}
                <Box>
                    <Box backgroundColor="white" padding="40px" borderRadius="8px" shadow="sm" marginBottom="30px">
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
                                                : "Enter the number of questions"
                                    }
                                    error={fieldErrors.amountOfQuestions}
                                    value={amountOfQuestions}
                                    isReadOnly={examType === "without_sections" || examType === "with_sections"}
                                    isDisabled={examType === "without_sections" || examType === "with_sections"}
                                    onChange={(e) => setAmountOfQuestions(e.target.value)}
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
                                    error={fieldErrors.totalMarks}
                                    value={totalMarks}
                                    isReadOnly={totalMarksIsAuto}
                                    isDisabled={totalMarksIsAuto}
                                    onChange={(e) => setTotalMarks(e.target.value)}
                                />
                            </GridItem>
                            <GridItem colSpan={2}>
                                <Select
                                    label="Exam Type"
                                    isRequired
                                    noEmptyOption
                                    value={examType}
                                    onChange={(e) => {
                                        const nextExamType = e.target.value;
                                        setExamType(nextExamType);
                                        // Sectioned exams derive marking from each section's own
                                        // marking type, so a global marking template doesn't apply
                                        // — clear any previously selected one.
                                        if (nextExamType === "with_sections") setTemplateId("");
                                    }}
                                    options={EXAM_TYPE_OPTIONS}
                                />
                            </GridItem>
                        </Grid>

                        <Heading as="h3" size="md" marginTop="8px" marginBottom="16px" color="#1A202C">
                            Sections
                        </Heading>
                        {!sectionsEnabled && (
                            <Text fontSize="sm" color="gray.500" mb={3}>
                                Sections are only available for "Exam with sections" and "Hybrid" exam types.
                            </Text>
                        )}
                        {sectionsEnabled && sections.length === 0 && (
                            <Text fontSize="sm" color="gray.500" mb={3}>
                                No sections added yet. Sections let you group questions and optionally cap time per group.
                            </Text>
                        )}
                        {sections.map((s, i) => (
                            <SectionRow
                                key={i}
                                section={s}
                                idx={i}
                                onChange={updateSection}
                                onRemove={removeSection}
                                disabled={!sectionsEnabled}
                            />
                        ))}
                        <Button secondary type="button" disabled={!sectionsEnabled} onClick={addSection}>
                            + Add Section
                        </Button>

                        <Grid templateColumns="repeat(2, 1fr)" gap={6} marginTop="30px" marginBottom="30px">
                            <GridItem colSpan={2}>
                                <Select
                                    label="Marking Template"
                                    placeholder="Select a marking template"
                                    isRequired={examType !== "with_sections"}
                                    isDisabled={examType === "with_sections"}
                                    error={fieldErrors.templateId}
                                    value={templateId}
                                    onChange={(e) => setTemplateId(e.target.value)}
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
                                                        <Th textTransform="none" color="#4A5568">Marks</Th>
                                                        <Th textTransform="none" color="#4A5568">Subtotal</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {standaloneTypes.map((type) => {
                                                        const style = TYPE_COLOR[type] || { bg: "#F7FAFC", color: "#718096" };
                                                        const perQuestionMark = selectedTemplate.markDistribution?.[type];
                                                        return (
                                                            <Tr key={type}>
                                                                <Td>
                                                                    <Badge
                                                                        bg={style.bg}
                                                                        color={style.color}
                                                                        px="8px"
                                                                        py="2px"
                                                                        borderRadius="8px"
                                                                        textTransform="none"
                                                                        fontSize="12px"
                                                                    >
                                                                        {type}
                                                                    </Badge>
                                                                </Td>
                                                                <Td fontSize="13px" color="#1A202C">
                                                                    <Input
                                                                        id={`standalone-qty-${type}`}
                                                                        type="number"
                                                                        min={0}
                                                                        placeholder="0"
                                                                        value={standaloneQuestionCounts[type] ?? ""}
                                                                        onChange={(e) =>
                                                                            setStandaloneQuestionCounts((p) => ({
                                                                                ...p,
                                                                                [type]: e.target.value,
                                                                            }))
                                                                        }
                                                                    />
                                                                </Td>
                                                                <Td fontSize="13px" fontWeight="600" color="#6b006b">
                                                                    {perQuestionMark ?? "—"}
                                                                </Td>
                                                                <Td fontSize="13px" color="#1A202C">
                                                                    {(Number(standaloneQuestionCounts[type]) || 0) *
                                                                        (Number(perQuestionMark) || 0)}
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

                    <Flex justifyContent="center" gap="16px">
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
                            Cancel
                        </Button>
                        <Button
                            onClick={handleNext}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap="8px"
                            style={{ backgroundColor: "#6b006b", color: "white" }}
                            _hover={{ bg: "#520052" }}
                        >
                            <FaFileAlt />
                            Next: Questions
                        </Button>
                    </Flex>
                </Box>

                {/* Right Column: Advance Settings */}
                <Box backgroundColor="white" padding="30px" borderRadius="8px" shadow="sm">
                    <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
                        Advance Settings
                    </Heading>

                    <Text fontSize="14px" fontWeight="600" color="#4A5568" marginBottom="16px">
                        Display and Navigation
                    </Text>

                    <Flex flexDirection="column" gap="20px" marginBottom="30px">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Question per page</Text>
                            <Box width="100px">
                                <Select id="questionPerPage" options={[{ label: "Single", value: "single" }]} />
                            </Box>
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Allow Backtracking</Text>
                            <Switch colorScheme="gray" />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Randomize Questions</Text>
                            <Box width="100px">
                                <Select id="randomize" options={[{ label: "Partial", value: "partial" }]} />
                            </Box>
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Theme Colour</Text>
                            <HStack spacing="12px">
                                <Circle size="24px" bg="#6b006b" border="2px solid white" outline="2px solid #6b006b" cursor="pointer" />
                                <Circle size="24px" bg="#1A202C" cursor="pointer" />
                                <Circle size="24px" bg="#A0AEC0" cursor="pointer" />
                            </HStack>
                        </Flex>
                    </Flex>

                    <Divider borderColor="#E2E8F0" marginBottom="20px" />

                    <Text fontSize="14px" fontWeight="600" color="#4A5568" marginBottom="16px">
                        Student Tools and Multimedia
                    </Text>

                    <Flex flexDirection="column" gap="20px">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">On-Screen Calculator</Text>
                            <Switch colorScheme="gray" />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Spell Checker</Text>
                            <Switch colorScheme="gray" />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Time Waiver</Text>
                            <Switch colorScheme="purple" isChecked={true} />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Multimedia</Text>
                            <Switch colorScheme="purple" isChecked={true} />
                        </Flex>
                    </Flex>

                </Box>
            </Grid>
        </Box>
    );
};

export default TemplateStandalone;
