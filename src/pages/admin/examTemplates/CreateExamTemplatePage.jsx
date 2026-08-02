import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  BreadcrumbItem,
  Flex,
  Grid,
  Text,
  Divider,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Input, Link, Select } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminCreateMarkingTemplate, listMarkingSchemes, getMarkingScheme } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const ALL_QUESTION_TYPES = ["MCQ", "TrueFalse", "FillBlank", "Matching", "ShortAnswer", "Essay"];

const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const RETRY_POLICY_OPTIONS = [
  { label: "Highest Score", value: "highest" },
  { label: "Latest Attempt", value: "latest" },
  { label: "Average Score", value: "average" },
];

const USAGE_SCOPE_OPTIONS = [
  { label: "Assessment", value: "Assessment" },
  { label: "Normal Exam", value: "Normal Exam" },
  { label: "Standalone Exam", value: "Standalone Exam" },
];

const SECTION_TYPE_OPTIONS = [
  { label: "Objective", value: "objective" },
  { label: "Essay", value: "essay" },
  { label: "Mixed", value: "mixed" },
];

const MARKING_TYPE_LOCK_OPTIONS = [
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
  { label: "Hybrid", value: "hybrid" },
];

const defaultSection = () => ({
  name: "",
  type: "objective",
  questionCount: 1,
  marksPerQuestion: 1,
  markingSchemeId: "",
  questionTypeLock: "",
  markingTypeLock: "",
});

const OBJECTIVE_RULE_TYPES = ["mcq", "true_false", "fill_in_the_blank"];

// A section's per-question weightage is sourced from its linked Marking Scheme's
// question-type rule (essay sections use the rule's total_marks) rather than typed
// in manually, once a scheme is selected.
const getSchemeWeightage = (scheme, sectionType) => {
  if (!scheme) return null;
  const rules = Array.isArray(scheme.questionTypeRules) ? scheme.questionTypeRules : [];
  if (sectionType === "essay") {
    const rule = rules.find((r) => r.type === "essay");
    return rule?.total_marks ?? null;
  }
  const rule = rules.find((r) => OBJECTIVE_RULE_TYPES.includes(r.type));
  return rule?.marks_per_question ?? null;
};

const defaultTypeConfig = () => ({
  quantity: 5,
  marks: 5,
  difficulty: "Medium",
});

export const CreateExamTemplatePage = () => {
  const history = useHistory();
  const toast = useToast();

  const [markingTemplateName, setMarkingTemplateName] = useState("");
  const [usageScope, setUsageScope] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(["MCQ"]);
  const [typeConfigs, setTypeConfigs] = useState({ MCQ: defaultTypeConfig() });
  const [knowledgePoints, setKnowledgePoints] = useState([]);
  const [kpInput, setKpInput] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [retryPolicy, setRetryPolicy] = useState("highest");
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markingSchemes, setMarkingSchemes] = useState([]);
  const [schemeDetailsById, setSchemeDetailsById] = useState({});

  useEffect(() => {
    listMarkingSchemes({})
      .then((res) => setMarkingSchemes(res?.data || res?.schemes || []))
      .catch(() => setMarkingSchemes([]));
  }, []);

  const addSection = () => setSections((p) => [...p, defaultSection()]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleSectionSchemeChange = async (i, schemeId) => {
    updateSection(i, "markingSchemeId", schemeId);
    if (!schemeId) return;

    let scheme = schemeDetailsById[schemeId];
    if (!scheme) {
      try {
        const res = await getMarkingScheme(schemeId);
        scheme = res?.data || res?.scheme || res;
        setSchemeDetailsById((prev) => ({ ...prev, [schemeId]: scheme }));
      } catch {
        return;
      }
    }

    const sectionType = sections[i]?.type;
    const weightage = getSchemeWeightage(scheme, sectionType);
    if (weightage != null) {
      updateSection(i, "marksPerQuestion", weightage);
    }
  };

  const handleTypeToggle = (types) => {
    setSelectedTypes(types);
    setTypeConfigs((prev) => {
      const next = {};
      types.forEach((t) => {
        next[t] = prev[t] || defaultTypeConfig();
      });
      return next;
    });
  };

  const handleTypeConfigChange = (type, field, value) => {
    setTypeConfigs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleAddKnowledgePoint = () => {
    const point = kpInput.trim();
    if (point && !knowledgePoints.includes(point)) {
      setKnowledgePoints((prev) => [...prev, point]);
    }
    setKpInput("");
  };

  const handleRemoveKnowledgePoint = (point) => {
    setKnowledgePoints((prev) => prev.filter((p) => p !== point));
  };

  const totalMarks = selectedTypes.reduce(
    (sum, t) => sum + Number(typeConfigs[t]?.marks || 0),
    0,
  );

  const totalQuestions = selectedTypes.reduce(
    (sum, t) => sum + Number(typeConfigs[t]?.quantity || 0),
    0,
  );

  const handleSubmit = async () => {
    if (!markingTemplateName.trim()) {
      toast({ description: "Template name is required.", position: "top", status: "warning" });
      return;
    }
    if (!usageScope) {
      toast({ description: "Usage scope is required.", position: "top", status: "warning" });
      return;
    }
    if (selectedTypes.length === 0) {
      toast({ description: "Select at least one question type.", position: "top", status: "warning" });
      return;
    }

    const questionQuantity = {};
    const markDistribution = {};
    const difficultyLevel = {};
    selectedTypes.forEach((t) => {
      questionQuantity[t] = Number(typeConfigs[t]?.quantity || 0);
      markDistribution[t] = Number(typeConfigs[t]?.marks || 0);
      difficultyLevel[t] = typeConfigs[t]?.difficulty || "Medium";
    });

    const body = {
      markingTemplateName,
      usageScope,
      questionTypes: selectedTypes,
      questionQuantity,
      markDistribution,
      difficultyLevel,
      knowledgePoints,
      totalMarks,
      retryCount: Number(retryCount),
      retryPolicy,
      ...(sections.length > 0 && {
        sections: sections.map((s) => ({
          name: s.name,
          type: s.type,
          questionCount: Number(s.questionCount),
          marksPerQuestion: Number(s.marksPerQuestion),
          ...(s.markingSchemeId && { markingSchemeId: s.markingSchemeId }),
          ...(s.questionTypeLock && { questionType: s.questionTypeLock }),
          ...(s.markingTypeLock && { markingType: s.markingTypeLock }),
        })),
      }),
    };

    setIsSubmitting(true);
    try {
      const { message } = await adminCreateMarkingTemplate(body);
      toast({ description: capitalizeFirstLetter(message), position: "top", status: "success" });
      history.push("/admin/marking-templates");
    } catch (err) {
      toast({ description: capitalizeFirstLetter(err.message), position: "top", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/marking-templates">Marking Templates</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Template</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
    <Box paddingX={{ base: "20px", lg: "40px" }} paddingY="30px" bg="#FAFAFA" minHeight="100vh">
      {/* Go Back */}
      <Flex
        alignItems="center"
        cursor="pointer"
        onClick={() => history.goBack()}
        mb="24px"
        width="max-content"
      >
        <Box border="1px solid #E2E8F0" borderRadius="4px" p="6px" mr="12px" bg="white">
          <FaArrowLeft color="#1A202C" />
        </Box>
        <Text fontWeight="500" color="#1A202C">Go Back</Text>
      </Flex>

      <Heading as="h1" size="lg" color="#1A202C" mb="32px">
        Create Marking Template
      </Heading>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="32px" alignItems="start">
        {/* Left Column */}
        <Box>
          {/* Basic Info */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="20px">
              Basic Information
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px">
              <Input
                label="Template Name"
                id="markingTemplateName"
                placeholder="e.g. Midterm Marking Template"
                value={markingTemplateName}
                onChange={(e) => setMarkingTemplateName(e.target.value)}
              />
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Usage Scope
                </Text>
                <Select
                  id="usageScope"
                  placeholder="Select scope"
                  value={usageScope}
                  onChange={(e) => setUsageScope(e.target.value)}
                  options={USAGE_SCOPE_OPTIONS}
                />
              </Box>
            </Grid>
          </Box>

          {/* Question Configuration */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="20px">
              Question Configuration
            </Text>

            <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="12px">
              Select Question Types
            </Text>
            <CheckboxGroup value={selectedTypes} onChange={handleTypeToggle}>
              <Stack direction="row" wrap="wrap" spacing="16px" mb="24px">
                {ALL_QUESTION_TYPES.map((type) => (
                  <Checkbox
                    key={type}
                    value={type}
                    colorScheme="purple"
                    borderColor="#CBD5E0"
                  >
                    <Text fontSize="14px">{type}</Text>
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>

            {selectedTypes.length > 0 && (
              <>
                <Divider mb="20px" />
                <Grid
                  templateColumns="1.5fr 1fr 1fr 1fr"
                  gap="12px"
                  mb="10px"
                >
                  <Text fontSize="12px" fontWeight="600" color="#718096">TYPE</Text>
                  <Text fontSize="12px" fontWeight="600" color="#718096">QUANTITY</Text>
                  <Text fontSize="12px" fontWeight="600" color="#718096">MARKS (TOTAL)</Text>
                  <Text fontSize="12px" fontWeight="600" color="#718096">DIFFICULTY</Text>
                </Grid>
                {selectedTypes.map((type) => (
                  <Grid
                    key={type}
                    templateColumns="1.5fr 1fr 1fr 1fr"
                    gap="12px"
                    mb="12px"
                    alignItems="center"
                  >
                    <Text
                      fontSize="13px"
                      fontWeight="600"
                      color="#6b006b"
                      bg="#FAF5FF"
                      px="10px"
                      py="6px"
                      borderRadius="6px"
                      display="inline-block"
                    >
                      {type}
                    </Text>
                    <NumberInput
                      min={1}
                      value={typeConfigs[type]?.quantity}
                      onChange={(v) => handleTypeConfigChange(type, "quantity", Number(v))}
                    >
                      <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <NumberInput
                      min={0}
                      value={typeConfigs[type]?.marks}
                      onChange={(v) => handleTypeConfigChange(type, "marks", Number(v))}
                    >
                      <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Select
                      id={`difficulty-${type}`}
                      options={DIFFICULTY_OPTIONS}
                      value={typeConfigs[type]?.difficulty}
                      onChange={(e) => handleTypeConfigChange(type, "difficulty", e.target.value)}
                    />
                  </Grid>
                ))}
              </>
            )}
          </Box>

          {/* Paper Sections */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <Text fontSize="16px" fontWeight="600" color="#1A202C">Paper Sections</Text>
              <Button ghost onClick={addSection} type="button">
                <Flex alignItems="center" gap="6px"><FaPlus size="11px" /> Add Section</Flex>
              </Button>
            </Flex>

            {sections.length === 0 ? (
              <Box bg="#F7F9FC" borderRadius="8px" p="20px" textAlign="center">
                <Text fontSize="13px" color="#A0AEC0">No sections added — the paper will be unsectioned.</Text>
              </Box>
            ) : (
              <>
                <Grid templateColumns="1.6fr 1fr 1.4fr 1fr 1fr auto" gap="10px" mb="8px">
                  {["NAME", "TYPE", "MARKING SCHEME", "QUESTIONS", "MARKS/Q", ""].map((h) => (
                    <Text key={h} fontSize="11px" fontWeight="600" color="#718096">{h}</Text>
                  ))}
                </Grid>
                {sections.map((s, i) => (
                  <Box key={i} border="1px solid #EDF2F7" borderRadius="8px" p="10px" mb="10px">
                    <Grid templateColumns="1.6fr 1fr 1.4fr 1fr 1fr auto" gap="10px" alignItems="center" mb="8px">
                      <input
                        value={s.name}
                        onChange={(e) => updateSection(i, "name", e.target.value)}
                        placeholder="e.g. Section A"
                        style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px", fontSize: 13, width: "100%" }}
                      />
                      <select
                        value={s.type}
                        onChange={(e) => updateSection(i, "type", e.target.value)}
                        style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 6px", fontSize: 13, width: "100%" }}
                      >
                        {SECTION_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <select
                        value={s.markingSchemeId}
                        onChange={(e) => handleSectionSchemeChange(i, e.target.value)}
                        style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 6px", fontSize: 13, width: "100%" }}
                      >
                        <option value="">No scheme</option>
                        {markingSchemes.map((scheme) => (
                          <option key={scheme._id || scheme.id} value={scheme._id || scheme.id}>
                            {scheme.name}
                          </option>
                        ))}
                      </select>
                      <NumberInput
                        min={1}
                        value={s.questionCount}
                        onChange={(v) => updateSection(i, "questionCount", v)}
                      >
                        <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <NumberInput
                        min={0}
                        value={s.marksPerQuestion}
                        onChange={(v) => updateSection(i, "marksPerQuestion", v)}
                      >
                        <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Box
                        as="button"
                        type="button"
                        onClick={() => removeSection(i)}
                        color="red.400"
                        fontWeight="600"
                        fontSize="18px"
                        lineHeight="1"
                        px={1}
                        _hover={{ color: "red.600" }}
                      >
                        ×
                      </Box>
                    </Grid>

                    <Grid templateColumns="1fr 1fr" gap="10px" alignItems="center">
                      <Box>
                        <Text fontSize="10px" color="#A0AEC0" mb="2px">Lock Question Type (optional)</Text>
                        <select
                          value={s.questionTypeLock}
                          onChange={(e) => updateSection(i, "questionTypeLock", e.target.value)}
                          style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "6px", fontSize: 12, width: "100%" }}
                        >
                          <option value="">No lock</option>
                          {ALL_QUESTION_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </Box>
                      <Box>
                        <Text fontSize="10px" color="#A0AEC0" mb="2px">Lock Marking Type (optional)</Text>
                        <select
                          value={s.markingTypeLock}
                          onChange={(e) => updateSection(i, "markingTypeLock", e.target.value)}
                          style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "6px", fontSize: 12, width: "100%" }}
                        >
                          <option value="">No lock</option>
                          {MARKING_TYPE_LOCK_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </Box>
                    </Grid>
                  </Box>
                ))}
                <Text fontSize="11px" color="#A0AEC0" mt="2px">
                  Selecting a marking scheme fills Marks/Q from that scheme's overall score for the section's question type — override if needed.
                </Text>
              </>
            )}
          </Box>

          {/* Knowledge Points */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="16px">
              Knowledge Points
            </Text>
            <Flex gap="10px" mb="14px">
              <Input
                id="kpInput"
                placeholder="e.g. Algebra"
                value={kpInput}
                onChange={(e) => setKpInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddKnowledgePoint()}
              />
              <Button
                onClick={handleAddKnowledgePoint}
                style={{ backgroundColor: "#6b006b", color: "white", whiteSpace: "nowrap" }}
              >
                <Flex alignItems="center" gap="6px">
                  <FaPlus size="11px" /> Add
                </Flex>
              </Button>
            </Flex>
            {knowledgePoints.length > 0 && (
              <Wrap spacing="8px">
                {knowledgePoints.map((point) => (
                  <WrapItem key={point}>
                    <Tag size="md" borderRadius="full" variant="solid" bg="#6b006b" color="white">
                      <TagLabel>{point}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveKnowledgePoint(point)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}
          </Box>
        </Box>

        {/* Right Column */}
        <Box position="sticky" top="30px">
          {/* Retry Configuration */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
              Retry Configuration
            </Text>
            <Divider mb="16px" />
            <Box mb="16px">
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Retry Count
              </Text>
              <NumberInput
                min={0}
                value={retryCount}
                onChange={(v) => setRetryCount(v)}
              >
                <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="11px" color="#A0AEC0" mt="4px">0 = single attempt only</Text>
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Retry Policy
              </Text>
              <Select
                id="retryPolicy"
                value={retryPolicy}
                onChange={(e) => setRetryPolicy(e.target.value)}
                options={RETRY_POLICY_OPTIONS}
              />
              <Text fontSize="11px" color="#A0AEC0" mt="4px">
                How the final score is calculated across attempts
              </Text>
            </Box>
          </Box>

          {/* Summary */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
              Summary
            </Text>
            <Divider mb="16px" />
            <Flex justifyContent="space-between" mb="10px">
              <Text fontSize="13px" color="#718096">Question Types</Text>
              <Text fontSize="13px" fontWeight="600" color="#1A202C">{selectedTypes.length}</Text>
            </Flex>
            <Flex justifyContent="space-between" mb="10px">
              <Text fontSize="13px" color="#718096">Total Questions</Text>
              <Text fontSize="13px" fontWeight="600" color="#1A202C">{totalQuestions}</Text>
            </Flex>
            <Flex justifyContent="space-between" mb="10px">
              <Text fontSize="13px" color="#718096">Total Marks</Text>
              <Text fontSize="13px" fontWeight="700" color="#6b006b">{totalMarks}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="13px" color="#718096">Retry Count</Text>
              <Text fontSize="13px" fontWeight="600" color="#1A202C">{retryCount}</Text>
            </Flex>
          </Box>

          <Button
            w="100%"
            h="50px"
            style={{ backgroundColor: "#6b006b", color: "white" }}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Create Marking Template
          </Button>
        </Box>
      </Grid>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateExamTemplatePageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateExamTemplatePage {...props} />} />
);

export default CreateExamTemplatePageRoute;
