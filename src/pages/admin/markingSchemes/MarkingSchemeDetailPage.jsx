import React, { useEffect, useState, useRef } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Badge,
  Spinner,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { FiArrowLeft, FiLock, FiEdit2, FiTrash2, FiBarChart2, FiPlay } from "react-icons/fi";
import { Button, Heading } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { capitalizeFirstLetter } from "../../../utils";
import {
  getMarkingScheme,
  deleteMarkingScheme,
  applyMarkingScheme,
  computeStudentScore,
} from "../../../services";
import { useApp } from "../../../contexts";

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};


const SectionCard = ({ title, children }) => (
  <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px" mb="20px">
    {title && (
      <>
        <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
          {title}
        </Text>
        <Divider mb="16px" />
      </>
    )}
    {children}
  </Box>
);

// ─── Question-type rule renderers ────────────────────────────────────────────

const MCQRuleDisplay = ({ rule }) => (
  <Box
    bg="#F7FAFC"
    border="1px solid #E2E8F0"
    borderRadius="6px"
    px="14px"
    py="10px"
    mb="10px"
  >
    <Text fontSize="13px" color="#4A5568">
      <Text as="span" fontWeight="600" color="#1A202C">
        MCQ:
      </Text>{" "}
      {rule.marks_per_question ?? rule.marksPerQuestion ?? "—"} marks/question
      {" | "}
      <Text as="span" fontWeight="500">
        Negative:
      </Text>{" "}
      {rule.negative_marking ?? rule.negativeMarking ?? "0"}
      {" | "}
      <Text as="span" fontWeight="500">
        Partial:
      </Text>{" "}
      {rule.partial_credit ?? rule.partialCredit ? "Yes" : "No"}
    </Text>
  </Box>
);

const SimplifiedRuleDisplay = ({ type, rule }) => {
  const label =
    type === "true_false"
      ? "True/False"
      : type === "fill_in_the_blank"
      ? "Fill in the Blank"
      : capitalizeFirstLetter(type ?? "");
  return (
    <Box
      bg="#F7FAFC"
      border="1px solid #E2E8F0"
      borderRadius="6px"
      px="14px"
      py="10px"
      mb="10px"
    >
      <Text fontSize="13px" color="#4A5568">
        <Text as="span" fontWeight="600" color="#1A202C">
          {label}:
        </Text>{" "}
        {rule.marks_per_question ?? rule.marksPerQuestion ?? "—"} marks/question
        {" | "}
        <Text as="span" fontWeight="500">
          Negative:
        </Text>{" "}
        {rule.negative_marking ?? rule.negativeMarking ?? "0"}
        {" | "}
        <Text as="span" fontWeight="500">
          Partial:
        </Text>{" "}
        {rule.partial_credit ?? rule.partialCredit ? "Yes" : "No"}
      </Text>
    </Box>
  );
};

const EssayRuleDisplay = ({ rule }) => {
  const rubric = rule.rubric_criteria ?? rule.rubricCriteria ?? [];
  return (
    <Box mb="10px">
      <Box
        bg="#F7FAFC"
        border="1px solid #E2E8F0"
        borderRadius="6px"
        px="14px"
        py="10px"
        mb="8px"
      >
        <Text fontSize="13px" fontWeight="600" color="#1A202C">
          Essay ({rule.total_marks ?? rule.totalMarks ?? "—"} marks):
        </Text>
      </Box>
      {rubric.length > 0 && (
        <Box pl="12px">
          {rubric.map((criterion, idx) => (
            <Flex
              key={idx}
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              px="14px"
              py="8px"
              mb="6px"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="13px" color="#4A5568">
                {criterion.name ?? criterion.criteria ?? `Criterion ${idx + 1}`}
              </Text>
              <Badge
                bg="#EBF4FF"
                color="#3182CE"
                px="10px"
                py="2px"
                borderRadius="12px"
                textTransform="none"
                fontSize="12px"
              >
                {criterion.marks ?? criterion.maxMarks ?? "—"} marks
              </Badge>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};

const QuestionTypeRulesSection = ({ rules }) => {
  if (!rules || Object.keys(rules).length === 0) {
    return (
      <Text fontSize="13px" color="#718096">
        No question type rules defined.
      </Text>
    );
  }
  return (
    <>
      {Object.entries(rules).map(([type, rule]) => {
        if (type === "mcq") return <MCQRuleDisplay key={type} rule={rule} />;
        if (type === "essay") return <EssayRuleDisplay key={type} rule={rule} />;
        return <SimplifiedRuleDisplay key={type} type={type} rule={rule} />;
      })}
    </>
  );
};

// ─── Grading scale grid ──────────────────────────────────────────────────────

const GRADE_COLOR_MAP = {
  A: "#38A169",
  "A+": "#276749",
  "A-": "#38A169",
  "B+": "#3182CE",
  B: "#3182CE",
  "B-": "#3182CE",
  "C+": "#718096",
  C: "#718096",
  "C-": "#718096",
  D: "#DD6B20",
  F: "#E53E3E",
};

const GradingScaleGrid = ({ gradingScale }) => {
  if (!gradingScale || gradingScale.length === 0) {
    return (
      <Text fontSize="13px" color="#718096">
        No grading scale defined.
      </Text>
    );
  }
  return (
    <Flex flexWrap="wrap" gap="10px">
      {gradingScale.map((g, idx) => {
        const color = GRADE_COLOR_MAP[g.grade] || "#4A5568";
        return (
          <Box
            key={idx}
            border={`1px solid ${color}`}
            borderRadius="8px"
            px="14px"
            py="8px"
            minWidth="90px"
            textAlign="center"
          >
            <Text fontSize="16px" fontWeight="700" color={color}>
              {g.grade}
            </Text>
            <Text fontSize="11px" color="#718096" mt="2px">
              {g.minScore ?? g.min ?? "—"}% – {g.maxScore ?? g.max ?? "—"}%
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
};

// ─── Main page component ─────────────────────────────────────────────────────

const MarkingSchemeDetailPage = () => {
  const history = useHistory();
  const { schemeId } = useParams();
  const toast = useToast();
  const { state, getOneMetadata } = useApp();

  const userRole = getOneMetadata("userRoles", state.user?.userRoleId);
  const isAdmin = /admin/i.test(userRole?.name ?? "");
  const isInstructor = /instructor/i.test(userRole?.name ?? "");

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Apply modal
  const applyDisc = useDisclosure();
  const [applyConfirmed, setApplyConfirmed] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Delete alert dialog
  const deleteDisc = useDisclosure();
  const cancelDeleteRef = useRef();
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute score panel
  const [studentIdInput, setStudentIdInput] = useState("");
  const [isComputing, setIsComputing] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  // ── data loading ────────────────────────────────────────────────────────────

  const loadScheme = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const response = await getMarkingScheme(schemeId);
      // API may return { scheme } or { markingScheme } or the object directly
      setScheme(response?.scheme ?? response?.markingScheme ?? response);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setNotFound(true);
      } else if (status === 403) {
        toast({
          description: "You don't have permission for this action",
          position: "top",
          status: "error",
        });
      } else {
        toast({
          description: "Something went wrong. Please try again.",
          position: "top",
          status: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeId]);

  // ── apply scheme ────────────────────────────────────────────────────────────

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyMarkingScheme(schemeId, scheme.examinationId);
      toast({
        description: "Marking scheme applied and locked successfully.",
        position: "top",
        status: "success",
      });
      applyDisc.onClose();
      setApplyConfirmed(false);
      await loadScheme();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        toast({
          description: "You don't have permission for this action",
          position: "top",
          status: "error",
        });
      } else {
        toast({
          description: capitalizeFirstLetter(err?.response?.data?.message ?? "Something went wrong. Please try again."),
          position: "top",
          status: "error",
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  // ── delete scheme ───────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMarkingScheme(schemeId);
      toast({
        description: "Scheme deleted",
        position: "top",
        status: "success",
      });
      deleteDisc.onClose();
      history.push("/admin/marking-schemes");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        toast({
          description: "You don't have permission for this action",
          position: "top",
          status: "error",
        });
      } else {
        toast({
          description: "Something went wrong. Please try again.",
          position: "top",
          status: "error",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // ── compute score ───────────────────────────────────────────────────────────

  const handleComputeScore = async () => {
    if (!studentIdInput.trim()) {
      toast({
        description: "Please enter a Student ID.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsComputing(true);
    setScoreResult(null);
    try {
      const response = await computeStudentScore(scheme.examinationId, studentIdInput.trim());
      setScoreResult(response?.result ?? response);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        toast({
          description: "You don't have permission for this action",
          position: "top",
          status: "error",
        });
      } else {
        toast({
          description: capitalizeFirstLetter(err?.response?.data?.message ?? "Something went wrong. Please try again."),
          position: "top",
          status: "error",
        });
      }
    } finally {
      setIsComputing(false);
    }
  };

  // ── render guards ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminMainAreaWrapper>
        <Flex justifyContent="center" alignItems="center" minHeight="70vh">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      </AdminMainAreaWrapper>
    );
  }

  if (notFound || !scheme) {
    return (
      <AdminMainAreaWrapper>
        <Box
          paddingX={{ base: "20px", lg: "40px" }}
          paddingY="60px"
          textAlign="center"
        >
          <Text fontSize="48px" mb="16px">
            404
          </Text>
          <Text fontSize="20px" fontWeight="600" color="#1A202C" mb="8px">
            Marking Scheme Not Found
          </Text>
          <Text fontSize="14px" color="#718096" mb="32px">
            The scheme you are looking for does not exist or has been removed.
          </Text>
          <Button
            style={{ backgroundColor: "#6b006b", color: "white" }}
            onClick={() => history.push("/admin/marking-schemes")}
          >
            Back to Schemes
          </Button>
        </Box>
      </AdminMainAreaWrapper>
    );
  }

  const isLocked = scheme.status === "active" || scheme.status === "inactive" || scheme.isLocked;

  // ── main render ──────────────────────────────────────────────────────────────

  return (
    <AdminMainAreaWrapper>
      <Box
        paddingX={{ base: "20px", lg: "40px" }}
        paddingY="30px"
        bg="#FAFAFA"
        minHeight="100vh"
      >
        {/* Back button */}
        <Flex
          alignItems="center"
          cursor="pointer"
          onClick={() => history.push("/admin/marking-schemes")}
          mb="28px"
          width="max-content"
        >
          <Box
            border="1px solid #E2E8F0"
            borderRadius="4px"
            p="6px"
            mr="12px"
            bg="white"
          >
            <FiArrowLeft color="#1A202C" />
          </Box>
          <Text fontWeight="500" color="#1A202C" fontSize="14px">
            Back to Marking Schemes
          </Text>
        </Flex>

        {/* ── Header ── */}
        <Box mb="28px">
          <Flex alignItems="center" gap="12px" mb="10px" flexWrap="wrap">
            <Heading as="h1" size="lg" color="#1A202C" m={0}>
              {scheme.name}
            </Heading>

            {isLocked ? (
              <Flex alignItems="center" gap="6px">
                <FiLock color="#38A169" size="16px" />
                <Badge
                  bg="#E6F4EA"
                  color="#38A169"
                  px="12px"
                  py="4px"
                  borderRadius="12px"
                  textTransform="none"
                  fontWeight="600"
                  fontSize="12px"
                >
                  ACTIVE
                </Badge>
              </Flex>
            ) : (
              <Badge
                bg="#F7FAFC"
                color="#718096"
                px="12px"
                py="4px"
                borderRadius="12px"
                textTransform="none"
                fontWeight="600"
                fontSize="12px"
              >
                DRAFT
              </Badge>
            )}
          </Flex>

          <Flex gap="24px" flexWrap="wrap">
            <Text fontSize="13px" color="#718096">
              Examination:{" "}
              <Text as="span" color="#1A202C" fontWeight="600">
                {scheme.examination?.title ?? scheme.examinationTitle ?? "—"}
              </Text>
            </Text>
            <Text fontSize="13px" color="#718096">
              Created by:{" "}
              <Text as="span" color="#1A202C" fontWeight="600">
                {scheme.createdBy ?? scheme.createdByName ?? "—"}
              </Text>
            </Text>
            <Text fontSize="13px" color="#718096">
              Created:{" "}
              <Text as="span" color="#1A202C" fontWeight="600">
                {fmt(scheme.createdAt)}
              </Text>
            </Text>
          </Flex>
        </Box>

        {/* ── Locked warning banner ── */}
        {isLocked && (
          <Box
            bg="#FFFBEB"
            border="1px solid #F6AD55"
            borderRadius="8px"
            px="20px"
            py="14px"
            mb="24px"
          >
            <Flex alignItems="flex-start" gap="10px">
              <Text fontSize="18px">⚠</Text>
              <Text fontSize="13px" color="#744210">
                <Text as="span" fontWeight="600">
                  This scheme is locked.
                </Text>{" "}
                It was applied on{" "}
                <Text as="span" fontWeight="600">
                  {fmt(scheme.appliedAt ?? scheme.lockedAt)}
                </Text>
                . No further edits are allowed.
              </Text>
            </Flex>
          </Box>
        )}

        {/* ── Question Type Rules ── */}
        <SectionCard title="Question Type Rules">
          <QuestionTypeRulesSection
            rules={scheme.questionTypeRules ?? scheme.question_type_rules ?? {}}
          />
        </SectionCard>

        {/* ── Grading Scale ── */}
        <SectionCard title="Grading Scale">
          <GradingScaleGrid
            gradingScale={scheme.gradingScale ?? scheme.grading_scale ?? []}
          />
          {(scheme.passThreshold ?? scheme.pass_threshold) !== undefined && (
            <Box mt="16px">
              <Divider mb="14px" />
              <Flex alignItems="center" gap="8px">
                <Text fontSize="13px" color="#718096">
                  Pass Threshold:
                </Text>
                <Badge
                  bg="#EBF4FF"
                  color="#3182CE"
                  px="12px"
                  py="4px"
                  borderRadius="12px"
                  textTransform="none"
                  fontWeight="600"
                  fontSize="13px"
                >
                  {scheme.passThreshold ?? scheme.pass_threshold}%
                </Badge>
              </Flex>
            </Box>
          )}
        </SectionCard>

        {/* ── Action buttons ── */}
        <Flex gap="12px" flexWrap="wrap" mb="32px">
          {/* Draft actions */}
          {!isLocked && (isAdmin || isInstructor) && (
            <>
              <Button
                variant="outline"
                style={{ borderColor: "#E53E3E", color: "#E53E3E" }}
                onClick={deleteDisc.onOpen}
              >
                <Flex alignItems="center" gap="7px">
                  <FiTrash2 size="14px" />
                  Delete Scheme
                </Flex>
              </Button>
              <Button
                variant="outline"
                style={{ borderColor: "#6b006b", color: "#6b006b" }}
                onClick={() =>
                  history.push(`/admin/marking-schemes/${schemeId}/edit`)
                }
              >
                <Flex alignItems="center" gap="7px">
                  <FiEdit2 size="14px" />
                  Edit Scheme
                </Flex>
              </Button>
            </>
          )}
          {!isLocked && isAdmin && (
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              onClick={() => {
                setApplyConfirmed(false);
                applyDisc.onOpen();
              }}
            >
              <Flex alignItems="center" gap="7px">
                Apply to Examination
                <Text as="span" ml="2px">
                  →
                </Text>
              </Flex>
            </Button>
          )}

          {/* Locked actions */}
          {isLocked && (
            <Button
              variant="outline"
              style={{ borderColor: "#3182CE", color: "#3182CE" }}
              onClick={() =>
                history.push(
                  `/admin/marking-schemes/distribution/${scheme.examinationId}`
                )
              }
            >
              <Flex alignItems="center" gap="7px">
                <FiBarChart2 size="14px" />
                View Distribution
              </Flex>
            </Button>
          )}
          {isLocked && isAdmin && (
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              onClick={() => {
                setScoreResult(null);
                setStudentIdInput("");
              }}
            >
              <Flex alignItems="center" gap="7px">
                <FiPlay size="14px" />
                Compute Student Scores
              </Flex>
            </Button>
          )}
        </Flex>

        {/* ── Compute Score Panel ── */}
        {isAdmin && isLocked && (
          <SectionCard title="Compute Student Score">
            <Flex gap="12px" alignItems="flex-end" flexWrap="wrap" mb="20px">
              <FormControl maxWidth="300px">
                <FormLabel fontSize="13px" fontWeight="500" color="#1A202C" mb="6px">
                  Student ID
                </FormLabel>
                <Input
                  placeholder="e.g. STU-001"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComputeScore()}
                  bg="#F4F5F7"
                  border="none"
                  borderRadius="8px"
                  fontSize="14px"
                />
              </FormControl>
              <Button
                style={{ backgroundColor: "#6b006b", color: "white" }}
                onClick={handleComputeScore}
                isLoading={isComputing}
              >
                <Flex alignItems="center" gap="6px">
                  <FiPlay size="13px" />
                  Compute Score
                </Flex>
              </Button>
            </Flex>

            {scoreResult && (
              <Box
                bg="#F7FAFC"
                border="1px solid #E2E8F0"
                borderRadius="8px"
                p="20px"
                maxWidth="480px"
              >
                <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="14px">
                  Score Result
                </Text>

                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="13px" color="#718096">Raw Score</Text>
                  <Text fontSize="13px" fontWeight="500" color="#1A202C">
                    {scoreResult.rawScore ?? scoreResult.raw_score ?? "—"}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="13px" color="#718096">Deductions</Text>
                  <Text fontSize="13px" fontWeight="500" color="#E53E3E">
                    -{scoreResult.deductions?.negative_marking ??
                      scoreResult.deductions?.negativeMarking ?? 0}{" "}
                    (negative marking)
                  </Text>
                </Flex>

                <Divider my="10px" />

                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="14px" fontWeight="600" color="#1A202C">
                    Final Score
                  </Text>
                  <Text fontSize="14px" fontWeight="700" color="#6b006b">
                    {scoreResult.finalScore ?? scoreResult.final_score ?? "—"}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="13px" color="#718096">Percentage</Text>
                  <Text fontSize="13px" fontWeight="500" color="#1A202C">
                    {scoreResult.percentage ?? "—"}%
                  </Text>
                </Flex>
                <Flex justifyContent="space-between" mb="6px">
                  <Text fontSize="13px" color="#718096">Grade</Text>
                  <Text
                    fontSize="14px"
                    fontWeight="700"
                    color={GRADE_COLOR_MAP[scoreResult.grade] || "#1A202C"}
                  >
                    {scoreResult.grade ?? "—"}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between" mb="12px">
                  <Text fontSize="13px" color="#718096">Status</Text>
                  {scoreResult.passed || scoreResult.status === "pass" ? (
                    <Flex alignItems="center" gap="6px">
                      <Text fontSize="14px">✅</Text>
                      <Text fontSize="13px" fontWeight="600" color="#38A169">
                        Pass
                      </Text>
                    </Flex>
                  ) : (
                    <Flex alignItems="center" gap="6px">
                      <Text fontSize="14px">❌</Text>
                      <Text fontSize="13px" fontWeight="600" color="#E53E3E">
                        Fail
                      </Text>
                    </Flex>
                  )}
                </Flex>

                {scoreResult.breakdown && (
                  <>
                    <Divider mb="12px" />
                    <Text fontSize="13px" fontWeight="600" color="#4A5568" mb="10px">
                      Breakdown
                    </Text>
                    {[
                      {
                        label: "MCQ Score",
                        value: scoreResult.breakdown.raw_score ?? scoreResult.breakdown.mcqScore,
                      },
                      {
                        label: "Essay Score",
                        value:
                          scoreResult.breakdown.essay_manual_score ??
                          scoreResult.breakdown.essayManualScore,
                      },
                      {
                        label: "MCQ Penalty",
                        value:
                          scoreResult.breakdown.mcq_penalty ??
                          scoreResult.breakdown.mcqPenalty,
                      },
                      {
                        label: "Adjusted Score",
                        value:
                          scoreResult.breakdown.adjusted_score ??
                          scoreResult.breakdown.adjustedScore,
                      },
                    ].map(({ label, value }) => (
                      <Flex key={label} justifyContent="space-between" mb="5px">
                        <Text fontSize="12px" color="#718096">
                          {label}
                        </Text>
                        <Text fontSize="12px" fontWeight="500" color="#1A202C">
                          {value ?? "—"}
                        </Text>
                      </Flex>
                    ))}
                  </>
                )}
              </Box>
            )}
          </SectionCard>
        )}
      </Box>

      {/* ── Apply Scheme Modal ── */}
      <Modal
        isOpen={applyDisc.isOpen}
        onClose={applyDisc.onClose}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C" borderBottom="1px solid #E2E8F0">
            Apply Marking Scheme
          </ModalHeader>
          <ModalBody py="24px">
            <Text fontSize="13px" color="#718096" mb="12px">
              You are about to apply:
            </Text>
            <Box
              bg="#F7FAFC"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              px="14px"
              py="10px"
              mb="12px"
            >
              <Flex alignItems="center" gap="8px">
                <Text fontSize="16px">📋</Text>
                <Text fontSize="14px" fontWeight="600" color="#1A202C">
                  {scheme.name}
                </Text>
              </Flex>
            </Box>
            <Text fontSize="13px" color="#718096" mb="16px">
              to:{" "}
              <Text as="span" fontWeight="600" color="#1A202C">
                {scheme.examination?.title ?? scheme.examinationTitle ?? "—"}
              </Text>
            </Text>

            <Box
              bg="#FFF5F5"
              border="1px solid #FEB2B2"
              borderRadius="8px"
              px="16px"
              py="12px"
              mb="20px"
            >
              <Flex alignItems="flex-start" gap="8px">
                <Text fontSize="16px" mt="1px">
                  ⚠️
                </Text>
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#C53030" mb="4px">
                    WARNING: This action is permanent.
                  </Text>
                  <Text fontSize="12px" color="#742A2A">
                    Once applied, this scheme will be locked and cannot be edited or
                    deleted.
                  </Text>
                </Box>
              </Flex>
            </Box>

            <Checkbox
              isChecked={applyConfirmed}
              onChange={(e) => setApplyConfirmed(e.target.checked)}
              colorScheme="red"
            >
              <Text fontSize="13px" color="#4A5568">
                I understand this action is irreversible
              </Text>
            </Checkbox>
          </ModalBody>
          <Divider />
          <ModalFooter gap="10px">
            <Button variant="outline" onClick={applyDisc.onClose}>
              Cancel
            </Button>
            <Button
              style={{
                backgroundColor: applyConfirmed ? "#6b006b" : "#CBD5E0",
                color: "white",
                cursor: applyConfirmed ? "pointer" : "not-allowed",
              }}
              isDisabled={!applyConfirmed}
              isLoading={isApplying}
              onClick={handleApply}
            >
              Apply & Lock →
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Delete Confirmation AlertDialog ── */}
      <AlertDialog
        isOpen={deleteDisc.isOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={deleteDisc.onClose}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="12px">
          <AlertDialogHeader fontSize="16px" fontWeight="600" color="#1A202C">
            Delete Marking Scheme
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text fontSize="14px" color="#4A5568">
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="600" color="#1A202C">
                {scheme.name}
              </Text>
              ? This action cannot be undone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter gap="10px">
            <Button
              ref={cancelDeleteRef}
              variant="outline"
              onClick={deleteDisc.onClose}
            >
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#E53E3E", color: "white" }}
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminMainAreaWrapper>
  );
};

export const MarkingSchemeDetailPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MarkingSchemeDetailPage {...props} />} />
);

export default MarkingSchemeDetailPageRoute;
