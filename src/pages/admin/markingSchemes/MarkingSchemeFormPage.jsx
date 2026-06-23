import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select as ChakraSelect,
  NumberInput,
  NumberInputField,
  Switch,
  Badge,
  Divider,
  Spinner,
  IconButton,
  useToast,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { capitalizeFirstLetter } from "../../../utils";
import {
  createMarkingScheme,
  updateMarkingScheme,
  getMarkingScheme,
  adminGetStandaloneExaminationListing,
} from "../../../services";

// ─── Constants ───────────────────────────────────────────────────────────────

const QUESTION_TYPES = ["mcq", "true_false", "fill_in_the_blank", "essay"];

const GRADE_KEYS = ["A", "B+", "B", "C+", "C", "D", "F"];

const DEFAULT_GRADING_SCALE = {
  A: "90-100",
  "B+": "85-89",
  B: "80-84",
  "C+": "75-79",
  C: "70-74",
  D: "60-69",
  F: "<60",
};

const EMPTY_CRITERION = { criterion: "", max_marks: "", description: "" };

const EMPTY_RULE = {
  type: "mcq",
  marks_per_question: "",
  negative_marking: "",
  partial_credit: false,
  total_marks: "",
  rubric: [{ ...EMPTY_CRITERION }],
};

const PRIMARY = "#6b006b";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isObjective = (type) =>
  type === "mcq" || type === "true_false" || type === "fill_in_the_blank";

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionHeader = ({ children }) => (
  <Text fontWeight="700" fontSize="14px" mb="12px" color="#2D3748">
    {children}
  </Text>
);

const RubricRow = ({ criterion, index, onChange, onRemove, showRemove }) => (
  <Box
    border="1px solid #EDF2F7"
    borderRadius="6px"
    p="12px"
    mb="8px"
    bg="#FAFAFA"
  >
    <Flex gap="10px" align="flex-start" wrap="wrap">
      <FormControl flex="2" minW="140px">
        <FormLabel fontSize="12px" color="#718096" mb="4px">
          Criterion *
        </FormLabel>
        <Input
          size="sm"
          value={criterion.criterion}
          placeholder="e.g. Argumentation"
          onChange={(e) => onChange(index, "criterion", e.target.value)}
        />
      </FormControl>

      <FormControl flex="1" minW="90px">
        <FormLabel fontSize="12px" color="#718096" mb="4px">
          Max Marks *
        </FormLabel>
        <NumberInput
          size="sm"
          min={0}
          value={criterion.max_marks}
          onChange={(val) => onChange(index, "max_marks", val)}
        >
          <NumberInputField placeholder="0" />
        </NumberInput>
      </FormControl>

      <FormControl flex="3" minW="160px">
        <FormLabel fontSize="12px" color="#718096" mb="4px">
          Description
        </FormLabel>
        <Input
          size="sm"
          value={criterion.description}
          placeholder="Optional description"
          onChange={(e) => onChange(index, "description", e.target.value)}
        />
      </FormControl>

      {showRemove && (
        <Flex align="flex-end" pt="20px">
          <IconButton
            icon={<FiTrash2 />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            aria-label="Remove criterion"
            onClick={() => onRemove(index)}
          />
        </Flex>
      )}
    </Flex>
  </Box>
);

const QuestionRuleCard = ({
  rule,
  ruleIndex,
  onChange,
  onRemove,
  showRemove,
  errors,
}) => {
  const rubricTotal = rule.rubric.reduce((sum, c) => {
    const v = parseFloat(c.max_marks);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const totalMarksNum = parseFloat(rule.total_marks);
  const rubricMismatch =
    rule.type === "essay" &&
    !isNaN(totalMarksNum) &&
    totalMarksNum > 0 &&
    rubricTotal !== totalMarksNum;

  const handleCriterionChange = (cIdx, field, value) => {
    const updated = rule.rubric.map((c, i) =>
      i === cIdx ? { ...c, [field]: value } : c
    );
    onChange(ruleIndex, "rubric", updated);
  };

  const handleAddCriterion = () => {
    onChange(ruleIndex, "rubric", [...rule.rubric, { ...EMPTY_CRITERION }]);
  };

  const handleRemoveCriterion = (cIdx) => {
    onChange(
      ruleIndex,
      "rubric",
      rule.rubric.filter((_, i) => i !== cIdx)
    );
  };

  return (
    <Box
      border="1px solid #E2E8F0"
      borderRadius="8px"
      p="16px"
      mb="12px"
      bg="white"
    >
      <Flex justify="space-between" align="center" mb="14px">
        <Badge colorScheme="purple" fontSize="11px" px="8px" py="3px">
          Rule {ruleIndex + 1}
        </Badge>
        {showRemove && (
          <IconButton
            icon={<FiTrash2 />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            aria-label="Remove rule"
            onClick={() => onRemove(ruleIndex)}
          />
        )}
      </Flex>

      {/* Question type */}
      <FormControl mb="12px" isInvalid={!!errors?.[`rule_${ruleIndex}_type`]}>
        <FormLabel fontSize="13px" fontWeight="600" mb="4px">
          Question Type *
        </FormLabel>
        <ChakraSelect
          size="sm"
          value={rule.type}
          onChange={(e) => onChange(ruleIndex, "type", e.target.value)}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {capitalizeFirstLetter(t.replace(/_/g, " "))}
            </option>
          ))}
        </ChakraSelect>
        <FormErrorMessage>{errors?.[`rule_${ruleIndex}_type`]}</FormErrorMessage>
      </FormControl>

      {/* Objective question fields */}
      {isObjective(rule.type) && (
        <>
          <Flex gap="14px" wrap="wrap" mb="12px">
            <FormControl
              flex="1"
              minW="120px"
              isInvalid={!!errors?.[`rule_${ruleIndex}_marks_per_question`]}
            >
              <FormLabel fontSize="13px" fontWeight="600" mb="4px">
                Marks per Question *
              </FormLabel>
              <NumberInput
                size="sm"
                min={0}
                value={rule.marks_per_question}
                onChange={(val) =>
                  onChange(ruleIndex, "marks_per_question", val)
                }
              >
                <NumberInputField placeholder="e.g. 2" />
              </NumberInput>
              <FormErrorMessage>
                {errors?.[`rule_${ruleIndex}_marks_per_question`]}
              </FormErrorMessage>
            </FormControl>

            <FormControl flex="1" minW="120px">
              <FormLabel fontSize="13px" fontWeight="600" mb="4px">
                Negative Marking
              </FormLabel>
              <NumberInput
                size="sm"
                min={0}
                max={
                  rule.marks_per_question
                    ? parseFloat(rule.marks_per_question)
                    : undefined
                }
                value={rule.negative_marking}
                onChange={(val) => onChange(ruleIndex, "negative_marking", val)}
              >
                <NumberInputField placeholder="e.g. 0.5" />
              </NumberInput>
            </FormControl>
          </Flex>

          <Flex align="center" gap="10px" mb="4px">
            <Switch
              size="sm"
              isChecked={rule.partial_credit}
              colorScheme="purple"
              onChange={(e) =>
                onChange(ruleIndex, "partial_credit", e.target.checked)
              }
            />
            <Text fontSize="13px" fontWeight="500">
              Partial Credit
            </Text>
          </Flex>
        </>
      )}

      {/* Essay fields */}
      {rule.type === "essay" && (
        <>
          <FormControl
            mb="14px"
            isInvalid={!!errors?.[`rule_${ruleIndex}_total_marks`]}
          >
            <FormLabel fontSize="13px" fontWeight="600" mb="4px">
              Total Marks *
            </FormLabel>
            <NumberInput
              size="sm"
              min={0}
              value={rule.total_marks}
              onChange={(val) => onChange(ruleIndex, "total_marks", val)}
            >
              <NumberInputField placeholder="e.g. 20" />
            </NumberInput>
            <FormErrorMessage>
              {errors?.[`rule_${ruleIndex}_total_marks`]}
            </FormErrorMessage>
          </FormControl>

          <Divider mb="12px" />

          <Flex justify="space-between" align="center" mb="10px">
            <Text fontSize="13px" fontWeight="600">
              Rubric Criteria
            </Text>
            <Flex align="center" gap="10px">
              <Text
                fontSize="12px"
                color={rubricMismatch ? "red.500" : "gray.500"}
                fontWeight={rubricMismatch ? "700" : "400"}
              >
                Total: {rubricTotal}
                {!isNaN(totalMarksNum) && totalMarksNum > 0
                  ? ` / ${totalMarksNum}`
                  : ""}
                {rubricMismatch && " (mismatch)"}
              </Text>
              <Button
                size="xs"
                leftIcon={<FiPlus />}
                variant="outline"
                color={PRIMARY}
                borderColor={PRIMARY}
                onClick={handleAddCriterion}
              >
                Add Criterion
              </Button>
            </Flex>
          </Flex>

          {errors?.[`rule_${ruleIndex}_rubric`] && (
            <Text color="red.500" fontSize="12px" mb="8px">
              {errors[`rule_${ruleIndex}_rubric`]}
            </Text>
          )}

          {rule.rubric.map((c, cIdx) => (
            <RubricRow
              key={cIdx}
              criterion={c}
              index={cIdx}
              onChange={handleCriterionChange}
              onRemove={handleRemoveCriterion}
              showRemove={rule.rubric.length > 1}
            />
          ))}
        </>
      )}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MarkingSchemeFormPage = () => {
  const history = useHistory();
  const toast = useToast();
  const { schemeId } = useParams();
  const isEditing = Boolean(schemeId);

  // Loading / submitting
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Examination options
  const [examinations, setExaminations] = useState([]);
  const [examinationsLoading, setExaminationsLoading] = useState(true);

  // Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [examinationId, setExaminationId] = useState("");

  // Question type rules
  const [questionTypeRules, setQuestionTypeRules] = useState([
    { ...EMPTY_RULE, rubric: [{ ...EMPTY_CRITERION }] },
  ]);

  // Grading scale
  const [gradingScale, setGradingScale] = useState({ ...DEFAULT_GRADING_SCALE });

  // Thresholds
  const [passThreshold, setPassThreshold] = useState("");
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(false);
  const [partialCreditEnabled, setPartialCreditEnabled] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // ── Load examinations ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        const res = await adminGetStandaloneExaminationListing({});
        const list = res?.data || res?.examinations || [];
        setExaminations(list);
      } catch {
        // silently fail; user can still type in ID
      } finally {
        setExaminationsLoading(false);
      }
    };
    fetchExaminations();
  }, []);

  // ── Load existing scheme when editing ───────────────────────────────────
  useEffect(() => {
    if (!isEditing) return;

    const fetchScheme = async () => {
      try {
        const res = await getMarkingScheme(schemeId);
        const scheme = res?.data || res?.scheme || res;

        setName(scheme.name || "");
        setDescription(scheme.description || "");
        setExaminationId(scheme.examinationId || "");

        const rules = Array.isArray(scheme.questionTypeRules)
          ? scheme.questionTypeRules.map((r) => ({
              type: r.type || "mcq",
              marks_per_question:
                r.marks_per_question !== undefined
                  ? String(r.marks_per_question)
                  : "",
              negative_marking:
                r.negative_marking !== undefined
                  ? String(r.negative_marking)
                  : "",
              partial_credit: Boolean(r.partial_credit),
              total_marks:
                r.total_marks !== undefined ? String(r.total_marks) : "",
              rubric: Array.isArray(r.rubric) && r.rubric.length > 0
                ? r.rubric.map((c) => ({
                    criterion: c.criterion || "",
                    max_marks:
                      c.max_marks !== undefined ? String(c.max_marks) : "",
                    description: c.description || "",
                  }))
                : [{ ...EMPTY_CRITERION }],
            }))
          : [{ ...EMPTY_RULE, rubric: [{ ...EMPTY_CRITERION }] }];

        setQuestionTypeRules(rules);

        if (scheme.gradingScale && typeof scheme.gradingScale === "object") {
          setGradingScale({ ...DEFAULT_GRADING_SCALE, ...scheme.gradingScale });
        }

        setPassThreshold(
          scheme.passThreshold !== undefined ? String(scheme.passThreshold) : ""
        );
        setNegativeMarkingEnabled(Boolean(scheme.negativeMarkingEnabled));
        setPartialCreditEnabled(Boolean(scheme.partialCreditEnabled));
      } catch {
        toast({
          title: "Failed to load marking scheme",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        history.push("/admin/marking-schemes");
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [isEditing, schemeId, toast, history]);

  // ── Rule handlers ────────────────────────────────────────────────────────
  const handleRuleChange = (ruleIndex, field, value) => {
    setQuestionTypeRules((prev) =>
      prev.map((r, i) => {
        if (i !== ruleIndex) return r;
        const updated = { ...r, [field]: value };
        // Reset type-specific fields when type changes
        if (field === "type") {
          updated.marks_per_question = "";
          updated.negative_marking = "";
          updated.partial_credit = false;
          updated.total_marks = "";
          updated.rubric = [{ ...EMPTY_CRITERION }];
        }
        return updated;
      })
    );
    // Clear related error
    const errKey = `rule_${ruleIndex}_${field}`;
    if (errors[errKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  };

  const handleAddRule = () => {
    setQuestionTypeRules((prev) => [
      ...prev,
      { ...EMPTY_RULE, rubric: [{ ...EMPTY_CRITERION }] },
    ]);
  };

  const handleRemoveRule = (ruleIndex) => {
    setQuestionTypeRules((prev) => prev.filter((_, i) => i !== ruleIndex));
  };

  // ── Grading scale handler ────────────────────────────────────────────────
  const handleGradeChange = (grade, value) => {
    setGradingScale((prev) => ({ ...prev, [grade]: value }));
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = "Name is required.";
    } else if (name.trim().length < 3) {
      errs.name = "Name must be at least 3 characters.";
    } else if (name.trim().length > 100) {
      errs.name = "Name must be at most 100 characters.";
    }

    if (!examinationId) {
      errs.examinationId = "Examination is required.";
    }

    if (questionTypeRules.length === 0) {
      errs.rules = "At least one question type rule is required.";
    }

    questionTypeRules.forEach((rule, rIdx) => {
      if (isObjective(rule.type)) {
        const mpq = parseFloat(rule.marks_per_question);
        if (!rule.marks_per_question || isNaN(mpq) || mpq <= 0) {
          errs[`rule_${rIdx}_marks_per_question`] =
            "Marks per question must be greater than 0.";
        }
      }

      if (rule.type === "essay") {
        const tm = parseFloat(rule.total_marks);
        if (!rule.total_marks || isNaN(tm) || tm <= 0) {
          errs[`rule_${rIdx}_total_marks`] =
            "Total marks must be greater than 0.";
        }
        if (!rule.rubric || rule.rubric.length === 0) {
          errs[`rule_${rIdx}_rubric`] = "At least one rubric criterion is required.";
        } else {
          const rubricTotal = rule.rubric.reduce((sum, c) => {
            const v = parseFloat(c.max_marks);
            return sum + (isNaN(v) ? 0 : v);
          }, 0);
          if (!isNaN(tm) && tm > 0 && rubricTotal !== tm) {
            errs[`rule_${rIdx}_rubric`] = `Rubric marks total (${rubricTotal}) must equal total marks (${tm}).`;
          }
        }
      }
    });

    const pt = parseFloat(passThreshold);
    if (passThreshold === "" || isNaN(pt)) {
      errs.passThreshold = "Pass threshold is required.";
    } else if (pt < 0 || pt > 100) {
      errs.passThreshold = "Pass threshold must be between 0 and 100.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    const rulesPayload = questionTypeRules.map((r) => {
      const base = { type: r.type };
      if (isObjective(r.type)) {
        base.marks_per_question = parseFloat(r.marks_per_question);
        if (r.negative_marking !== "") {
          base.negative_marking = parseFloat(r.negative_marking);
        } else {
          base.negative_marking = 0;
        }
        base.partial_credit = Boolean(r.partial_credit);
        base.rubric = [];
      } else {
        base.total_marks = parseFloat(r.total_marks);
        base.rubric = r.rubric.map((c) => ({
          criterion: c.criterion,
          max_marks: parseFloat(c.max_marks),
          description: c.description || "",
        }));
      }
      return base;
    });

    const payload = {
      name: name.trim(),
      description: description.trim(),
      examinationId,
      questionTypeRules: rulesPayload,
      gradingScale,
      passThreshold: parseFloat(passThreshold),
      negativeMarkingEnabled,
      partialCreditEnabled,
      status: "draft",
    };

    try {
      let savedId = schemeId;
      if (isEditing) {
        await updateMarkingScheme(schemeId, payload);
        toast({
          title: "Marking scheme updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const res = await createMarkingScheme(payload);
        savedId = res?.data?._id || res?.scheme?._id || res?._id || res?.id;
        toast({
          title: "Marking scheme created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      if (savedId) {
        history.push(`/admin/marking-schemes/${savedId}`);
      } else {
        history.push("/admin/marking-schemes");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred. Please try again.";
      toast({
        title: isEditing ? "Failed to update" : "Failed to create",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminMainAreaWrapper>
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="lg" color={PRIMARY} />
        </Flex>
      </AdminMainAreaWrapper>
    );
  }

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/marking-schemes">Marking Schemes</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">New Scheme</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="30px">
        {/* ── Page Header ── */}
        <Flex align="center" mb="24px" gap="12px">
          <IconButton
            icon={<FiArrowLeft />}
            variant="ghost"
            aria-label="Back"
            onClick={() => history.push("/admin/marking-schemes")}
          />
          <Heading fontSize="20px" fontWeight="700" color="#2D3748">
            {isEditing ? "Edit Marking Scheme" : "Create Marking Scheme"}
          </Heading>
        </Flex>

        {/* ── Section 1: Basic Info ── */}
        <Box
          border="1px solid #E2E8F0"
          borderRadius="10px"
          p="20px"
          mb="20px"
          bg="white"
        >
          <SectionHeader>Basic Information</SectionHeader>
          <Divider mb="16px" />

          <Flex gap="16px" wrap="wrap">
            <FormControl
              flex="1"
              minW="200px"
              mb="14px"
              isInvalid={!!errors.name}
              isRequired
            >
              <FormLabel fontSize="13px" fontWeight="600">
                Name
              </FormLabel>
              <Input
                size="sm"
                value={name}
                placeholder="Enter scheme name"
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => { const n = { ...p }; delete n.name; return n; });
                }}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl
              flex="1"
              minW="200px"
              mb="14px"
              isInvalid={!!errors.examinationId}
              isRequired
            >
              <FormLabel fontSize="13px" fontWeight="600">
                Examination
              </FormLabel>
              {examinationsLoading ? (
                <Flex align="center" gap="8px" h="32px">
                  <Spinner size="xs" color={PRIMARY} />
                  <Text fontSize="13px" color="gray.500">
                    Loading examinations…
                  </Text>
                </Flex>
              ) : (
                <ChakraSelect
                  size="sm"
                  placeholder="Select examination"
                  value={examinationId}
                  onChange={(e) => {
                    setExaminationId(e.target.value);
                    if (errors.examinationId)
                      setErrors((p) => { const n = { ...p }; delete n.examinationId; return n; });
                  }}
                >
                  {examinations.map((exam) => (
                    <option
                      key={exam._id || exam.id}
                      value={exam._id || exam.id}
                    >
                      {exam.name || exam.title || exam._id || exam.id}
                    </option>
                  ))}
                </ChakraSelect>
              )}
              <FormErrorMessage>{errors.examinationId}</FormErrorMessage>
            </FormControl>
          </Flex>

          <FormControl>
            <FormLabel fontSize="13px" fontWeight="600">
              Description
            </FormLabel>
            <Textarea
              size="sm"
              value={description}
              placeholder="Optional description"
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
        </Box>

        {/* ── Section 2: Question Type Rules ── */}
        <Box
          border="1px solid #E2E8F0"
          borderRadius="10px"
          p="20px"
          mb="20px"
          bg="white"
        >
          <Flex justify="space-between" align="center" mb="4px">
            <SectionHeader>Question Type Rules</SectionHeader>
            <Button
              size="sm"
              leftIcon={<FiPlus />}
              bg={PRIMARY}
              color="white"
              _hover={{ bg: "#8b0089" }}
              onClick={handleAddRule}
              mb="12px"
            >
              Add Rule
            </Button>
          </Flex>
          <Divider mb="16px" />

          {errors.rules && (
            <Text color="red.500" fontSize="13px" mb="10px">
              {errors.rules}
            </Text>
          )}

          {questionTypeRules.map((rule, rIdx) => (
            <QuestionRuleCard
              key={rIdx}
              rule={rule}
              ruleIndex={rIdx}
              onChange={handleRuleChange}
              onRemove={handleRemoveRule}
              showRemove={questionTypeRules.length > 1}
              errors={errors}
            />
          ))}
        </Box>

        {/* ── Section 3: Grading Scale ── */}
        <Box
          border="1px solid #E2E8F0"
          borderRadius="10px"
          p="20px"
          mb="20px"
          bg="white"
        >
          <SectionHeader>Grading Scale</SectionHeader>
          <Divider mb="16px" />

          <Flex gap="12px" wrap="wrap">
            {GRADE_KEYS.map((grade) => (
              <FormControl key={grade} w="120px" minW="100px">
                <FormLabel fontSize="12px" fontWeight="600" mb="4px">
                  <Badge
                    colorScheme={grade === "F" ? "red" : "purple"}
                    mr="4px"
                    fontSize="11px"
                  >
                    {grade}
                  </Badge>
                  Range
                </FormLabel>
                <Input
                  size="sm"
                  value={gradingScale[grade] || ""}
                  placeholder={DEFAULT_GRADING_SCALE[grade]}
                  onChange={(e) => handleGradeChange(grade, e.target.value)}
                />
              </FormControl>
            ))}
          </Flex>
        </Box>

        {/* ── Section 4: Thresholds ── */}
        <Box
          border="1px solid #E2E8F0"
          borderRadius="10px"
          p="20px"
          mb="28px"
          bg="white"
        >
          <SectionHeader>Thresholds &amp; Global Settings</SectionHeader>
          <Divider mb="16px" />

          <Flex gap="24px" wrap="wrap" align="flex-start">
            <FormControl
              w="180px"
              isInvalid={!!errors.passThreshold}
              isRequired
            >
              <FormLabel fontSize="13px" fontWeight="600">
                Pass Threshold (%)
              </FormLabel>
              <NumberInput
                size="sm"
                min={0}
                max={100}
                value={passThreshold}
                onChange={(val) => {
                  setPassThreshold(val);
                  if (errors.passThreshold)
                    setErrors((p) => { const n = { ...p }; delete n.passThreshold; return n; });
                }}
              >
                <NumberInputField placeholder="e.g. 60" />
              </NumberInput>
              <FormErrorMessage>{errors.passThreshold}</FormErrorMessage>
            </FormControl>

            <Box>
              <FormLabel fontSize="13px" fontWeight="600" mb="10px">
                Global Toggles
              </FormLabel>
              <Flex direction="column" gap="10px">
                <Flex align="center" gap="10px">
                  <Switch
                    size="sm"
                    isChecked={negativeMarkingEnabled}
                    colorScheme="purple"
                    onChange={(e) =>
                      setNegativeMarkingEnabled(e.target.checked)
                    }
                  />
                  <Text fontSize="13px" fontWeight="500">
                    Negative Marking Enabled
                  </Text>
                </Flex>
                <Flex align="center" gap="10px">
                  <Switch
                    size="sm"
                    isChecked={partialCreditEnabled}
                    colorScheme="purple"
                    onChange={(e) => setPartialCreditEnabled(e.target.checked)}
                  />
                  <Text fontSize="13px" fontWeight="500">
                    Partial Credit Enabled
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* ── Action Buttons ── */}
        <Flex gap="12px" justify="flex-end">
          <Button
            variant="outline"
            size="md"
            color={PRIMARY}
            borderColor={PRIMARY}
            onClick={() => history.push("/admin/marking-schemes")}
            isDisabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="md"
            bg={PRIMARY}
            color="white"
            _hover={{ bg: "#8b0089" }}
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText={isEditing ? "Saving…" : "Creating…"}
            leftIcon={submitting ? <Spinner size="xs" /> : undefined}
          >
            {isEditing ? "Save Changes" : "Create Scheme"}
          </Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

// ─── Route Export ─────────────────────────────────────────────────────────────

export const MarkingSchemeFormPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MarkingSchemeFormPage {...props} />} />
);

export default MarkingSchemeFormPageRoute;
