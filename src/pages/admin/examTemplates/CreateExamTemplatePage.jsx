import React, { useState } from "react";
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
  Badge,
  Switch,
  IconButton,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Input, Link, Select } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminCreateMarkingTemplate } from "../../../services";
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

const defaultTypeConfig = () => ({
  quantity: 5,
  marks: 5,
  difficulty: "Medium",
});

const DEFAULT_GRADING_SCALE = [
  { grade: "A", range: "90-100" },
  { grade: "B", range: "80-89" },
  { grade: "C", range: "70-79" },
  { grade: "D", range: "60-69" },
  { grade: "F", range: "0-59" },
];

const QUESTION_TYPE_RULE_OPTIONS = [
  { label: "Mcq", value: "mcq" },
  { label: "True False", value: "true_false" },
  { label: "Fill In The Blank", value: "fill_in_the_blank" },
  { label: "Essay", value: "essay" },
];

const isObjectiveRuleType = (type) =>
  type === "mcq" || type === "true_false" || type === "fill_in_the_blank";

const defaultRuleCriterion = () => ({ criterion: "", maxMarks: "", description: "" });

const defaultQuestionRule = () => ({
  type: "mcq",
  marksPerQuestion: "",
  negativeMarking: "",
  partialCredit: false,
  totalMarks: "",
  rubric: [defaultRuleCriterion()],
});

const QuestionRuleCard = ({
  rule,
  ruleIndex,
  onFieldChange,
  onCriterionChange,
  onAddCriterion,
  onRemoveCriterion,
  onRemoveRule,
  showRemove,
}) => (
  <Box border="1px solid #EDF2F7" borderRadius="8px" p="16px" mb="12px">
    <Flex justifyContent="space-between" alignItems="center" mb="14px">
      <Badge colorScheme="purple" fontSize="11px" px="8px" py="3px">
        Rule {ruleIndex + 1}
      </Badge>
      {showRemove && (
        <IconButton
          icon={<FaTrash />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          aria-label="Remove rule"
          onClick={() => onRemoveRule(ruleIndex)}
        />
      )}
    </Flex>

    <Box mb="12px">
      <Text fontSize="13px" fontWeight="600" color="#1A202C" mb="4px">
        Question Type *
      </Text>
      <Select
        id={`ruleType-${ruleIndex}`}
        options={QUESTION_TYPE_RULE_OPTIONS}
        value={rule.type}
        onChange={(e) => onFieldChange(ruleIndex, "type", e.target.value)}
      />
    </Box>

    {isObjectiveRuleType(rule.type) ? (
      <>
        <Grid templateColumns="1fr 1fr" gap="14px" mb="12px">
          <Box>
            <Text fontSize="13px" fontWeight="600" color="#1A202C" mb="4px">
              Marks per Question *
            </Text>
            <NumberInput
              min={0}
              value={rule.marksPerQuestion}
              onChange={(v) => onFieldChange(ruleIndex, "marksPerQuestion", v)}
            >
              <NumberInputField placeholder="e.g. 2" />
            </NumberInput>
          </Box>
          <Box>
            <Text fontSize="13px" fontWeight="600" color="#1A202C" mb="4px">
              Negative Marking
            </Text>
            <NumberInput
              min={0}
              value={rule.negativeMarking}
              onChange={(v) => onFieldChange(ruleIndex, "negativeMarking", v)}
            >
              <NumberInputField placeholder="e.g. 0.5" />
            </NumberInput>
          </Box>
        </Grid>
        <Flex alignItems="center" gap="10px">
          <Switch
            size="sm"
            isChecked={rule.partialCredit}
            colorScheme="purple"
            onChange={(e) => onFieldChange(ruleIndex, "partialCredit", e.target.checked)}
          />
          <Text fontSize="13px" fontWeight="500">Partial Credit</Text>
        </Flex>
      </>
    ) : (
      <>
        <Box mb="14px">
          <Text fontSize="13px" fontWeight="600" color="#1A202C" mb="4px">
            Total Marks *
          </Text>
          <NumberInput
            min={0}
            value={rule.totalMarks}
            onChange={(v) => onFieldChange(ruleIndex, "totalMarks", v)}
          >
            <NumberInputField placeholder="e.g. 20" />
          </NumberInput>
        </Box>

        <Divider mb="12px" />

        <Flex justifyContent="space-between" alignItems="center" mb="10px">
          <Text fontSize="13px" fontWeight="600">Rubric Criteria</Text>
          <Button size="sm" ghost onClick={() => onAddCriterion(ruleIndex)} type="button">
            <Flex alignItems="center" gap="6px"><FaPlus size="11px" /> Add Criterion</Flex>
          </Button>
        </Flex>

        {rule.rubric.map((c, cIdx) => (
          <Grid key={cIdx} templateColumns="2fr 1fr 2fr auto" gap="10px" alignItems="center" mb="8px">
            <Input
              placeholder="e.g. Argumentation"
              value={c.criterion}
              onChange={(e) => onCriterionChange(ruleIndex, cIdx, "criterion", e.target.value)}
            />
            <NumberInput
              min={0}
              value={c.maxMarks}
              onChange={(v) => onCriterionChange(ruleIndex, cIdx, "maxMarks", v)}
            >
              <NumberInputField placeholder="0" />
            </NumberInput>
            <Input
              placeholder="Optional description"
              value={c.description}
              onChange={(e) => onCriterionChange(ruleIndex, cIdx, "description", e.target.value)}
            />
            {rule.rubric.length > 1 && (
              <IconButton
                icon={<FaTrash />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                aria-label="Remove criterion"
                onClick={() => onRemoveCriterion(ruleIndex, cIdx)}
              />
            )}
          </Grid>
        ))}
      </>
    )}
  </Box>
);

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
  const [passThreshold, setPassThreshold] = useState(60);
  const [gradingScale, setGradingScale] = useState(DEFAULT_GRADING_SCALE);
  const [questionTypeRulesEnabled, setQuestionTypeRulesEnabled] = useState(false);
  const [questionTypeRules, setQuestionTypeRules] = useState([defaultQuestionRule()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateGradingScale = (idx, field, value) => {
    setGradingScale((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleRuleFieldChange = (ruleIndex, field, value) => {
    setQuestionTypeRules((prev) =>
      prev.map((r, i) => {
        if (i !== ruleIndex) return r;
        const updated = { ...r, [field]: value };
        if (field === "type") {
          updated.marksPerQuestion = "";
          updated.negativeMarking = "";
          updated.partialCredit = false;
          updated.totalMarks = "";
          updated.rubric = [defaultRuleCriterion()];
        }
        return updated;
      }),
    );
  };

  const handleAddRule = () => setQuestionTypeRules((prev) => [...prev, defaultQuestionRule()]);
  const handleRemoveRule = (ruleIndex) =>
    setQuestionTypeRules((prev) => prev.filter((_, i) => i !== ruleIndex));

  const handleCriterionChange = (ruleIndex, cIdx, field, value) => {
    setQuestionTypeRules((prev) =>
      prev.map((r, i) =>
        i === ruleIndex
          ? { ...r, rubric: r.rubric.map((c, ci) => (ci === cIdx ? { ...c, [field]: value } : c)) }
          : r,
      ),
    );
  };

  const handleAddCriterion = (ruleIndex) => {
    setQuestionTypeRules((prev) =>
      prev.map((r, i) => (i === ruleIndex ? { ...r, rubric: [...r.rubric, defaultRuleCriterion()] } : r)),
    );
  };

  const handleRemoveCriterion = (ruleIndex, cIdx) => {
    setQuestionTypeRules((prev) =>
      prev.map((r, i) =>
        i === ruleIndex ? { ...r, rubric: r.rubric.filter((_, ci) => ci !== cIdx) } : r,
      ),
    );
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
    if (passThreshold === "" || Number(passThreshold) < 0 || Number(passThreshold) > 100) {
      toast({ description: "Pass threshold must be between 0 and 100.", position: "top", status: "warning" });
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

    const gradingScaleObj = {};
    gradingScale.forEach((s) => {
      if (s.grade && s.range) gradingScaleObj[s.grade] = s.range;
    });

    const questionTypeRulesPayload = questionTypeRulesEnabled
      ? questionTypeRules.map((r) => {
          const base = { type: r.type };
          if (isObjectiveRuleType(r.type)) {
            base.marksPerQuestion = Number(r.marksPerQuestion) || 0;
            base.negativeMarking = r.negativeMarking !== "" ? Number(r.negativeMarking) : 0;
            base.partialCredit = Boolean(r.partialCredit);
          } else {
            base.totalMarks = Number(r.totalMarks) || 0;
            base.rubric = r.rubric.map((c) => ({
              criterion: c.criterion,
              maxMarks: Number(c.maxMarks) || 0,
              description: c.description || "",
            }));
          }
          return base;
        })
      : [];

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
      passThreshold: Number(passThreshold) || 0,
      gradingScale: gradingScaleObj,
      questionTypeRules: questionTypeRulesPayload,
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

          {/* Question Type Rules */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Flex justifyContent="space-between" alignItems="center" mb={questionTypeRulesEnabled ? "16px" : "0"}>
              <Flex alignItems="center" gap="10px">
                <Switch
                  isChecked={questionTypeRulesEnabled}
                  colorScheme="purple"
                  onChange={(e) => setQuestionTypeRulesEnabled(e.target.checked)}
                />
                <Text fontSize="16px" fontWeight="600" color="#1A202C">Question Type Rules</Text>
              </Flex>
              {questionTypeRulesEnabled && (
                <Button
                  onClick={handleAddRule}
                  type="button"
                  style={{ backgroundColor: "#6b006b", color: "white" }}
                >
                  <Flex alignItems="center" gap="6px"><FaPlus size="11px" /> Add Rule</Flex>
                </Button>
              )}
            </Flex>

            {questionTypeRulesEnabled &&
              questionTypeRules.map((rule, ruleIndex) => (
                <QuestionRuleCard
                  key={ruleIndex}
                  rule={rule}
                  ruleIndex={ruleIndex}
                  onFieldChange={handleRuleFieldChange}
                  onCriterionChange={handleCriterionChange}
                  onAddCriterion={handleAddCriterion}
                  onRemoveCriterion={handleRemoveCriterion}
                  onRemoveRule={handleRemoveRule}
                  showRemove={questionTypeRules.length > 1}
                />
              ))}
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

          {/* Grading Scale */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="16px">
              Grading Scale
            </Text>
            <Grid templateColumns="80px 1fr" gap="8px" mb="8px">
              <Text fontSize="12px" fontWeight="600" color="#718096">Grade</Text>
              <Text fontSize="12px" fontWeight="600" color="#718096">Range (e.g. 90-100)</Text>
            </Grid>
            {gradingScale.map((s, i) => (
              <Grid key={i} templateColumns="80px 1fr" gap="8px" mb="8px">
                <Input
                  value={s.grade}
                  onChange={(e) => updateGradingScale(i, "grade", e.target.value)}
                />
                <Input
                  value={s.range}
                  onChange={(e) => updateGradingScale(i, "range", e.target.value)}
                  placeholder="e.g. 90-100"
                />
              </Grid>
            ))}
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

          {/* Pass/Fail Threshold */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
              Pass/Fail Threshold
            </Text>
            <Divider mb="16px" />
            <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
              Pass Threshold (%)
            </Text>
            <NumberInput
              min={0}
              max={100}
              value={passThreshold}
              onChange={(v) => setPassThreshold(v)}
            >
              <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="11px" color="#A0AEC0" mt="4px">
              Scores at or above {passThreshold || 0}% pass; below that, they fail.
            </Text>
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
            <Flex justifyContent="space-between" mb="10px">
              <Text fontSize="13px" color="#718096">Retry Count</Text>
              <Text fontSize="13px" fontWeight="600" color="#1A202C">{retryCount}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="13px" color="#718096">Pass Threshold</Text>
              <Text fontSize="13px" fontWeight="600" color="#1A202C">{passThreshold || 0}%</Text>
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
