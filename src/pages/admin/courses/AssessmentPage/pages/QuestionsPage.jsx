import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import {
  Box,
  ButtonGroup,
  Checkbox,
  Select as ChakraSelect,
  Input as ChakraInput,
  Flex,
  Grid,
  Switch,
  Stack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsCheckCircle } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { useHistory, useParams } from "react-router";
import { Route } from "react-router-dom";
import {
  Button,
  Heading,
  Image,
  Input,
  Link,
  RichText,
  RichTextToView,
  Spinner,
  Text,
  Upload,
} from "../../../../../components";
import {
  useFetch,
  useQueryParams,
  useRichText,
  useUpload,
} from "../../../../../hooks";
import { PageLoaderLayout } from "../../../../../layouts";
import {
  adminCreateAssessmentQuestion,
  adminCreateExaminationQuestion,
  adminCreateStandaloneExaminationQuestion,
  adminDeleteAssessmentQuestion,
  adminDeleteExaminationQuestion,
  adminDeleteStandaloneExaminationQuestion,
  adminEditAssessmentQuestion,
  adminEditExaminationQuestion,
  adminEditStandaloneExaminationQuestion,
  adminGetAssessmentMarkingTemplateId,
  adminGetExaminationById,
  adminGetMarkingTemplateById,
  adminGetStandaloneExamTemplateId,
  createExamQuestionBankItem,
  getExaminationById as getExamPaperConfig,
  listExamQuestionBank,
} from "../../../../../services";
import { buildBatchUploadLink } from "../../../examQuestionImport/questionRowUtils";
import {
  appendFormData,
  capitalizeFirstLetter,
  capitalizeWords,
  isAutoAddToBank,
} from "../../../../../utils";
import useAssessmentPreview from "../../../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import useAssessmentStore from "../../../../../store/assessmentStore";
import { useSections } from "./useSections";

// Question Bank type mapping — the bank has no "Matching" equivalent.
const FORM_TYPE_TO_BANK_TYPE = {
  MCQ: "mcq",
  TrueFalse: "true_false",
  FillBlank: "fill_blank",
  ShortAnswer: "short_answer",
  Essay: "essay",
};

const BANK_TYPE_TO_FORM_TYPE = {
  mcq: "MCQ",
  true_false: "TrueFalse",
  fill_blank: "FillBlank",
  short_answer: "ShortAnswer",
  essay: "Essay",
};

const QuestionsPage = () => {
  const isQuestionListingPage = useQueryParams().get("question-listing");
  const { id: courseId, assessmentId, questionId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const isExistingQuestion = questionId && questionId !== "new";

  const batchUploadLink = buildBatchUploadLink({
    courseId,
    assessmentId,
    examinationId: isExamination || undefined,
    standalone: isStandaloneExamination,
  });

  const assessmentManager = useAssessmentPreview(null, assessmentId, true);

  const storeSections = useAssessmentStore((s) => s.sections);

  console.log("[QuestionsPage] storeSections:", storeSections);

  const [templateSections, setTemplateSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  useEffect(() => {
    if (!isExamination && (!assessmentId || assessmentId === "new")) return;

    if (storeSections.length > 0) {
      setTemplateSections(storeSections.map((s) => s.name || s.section_name));
      return;
    }

    setSectionsLoading(true);

    const fetchViaTemplate = (getTemplateId) =>
      getTemplateId()
        .then((templateId) => {
          if (!templateId) throw new Error("no-template");
          return adminGetMarkingTemplateById(templateId);
        })
        .then(({ template }) =>
          setTemplateSections(
            Array.isArray(template?.sections)
              ? template.sections.map((s) => s.name)
              : [],
          ),
        )
        .catch(() => setTemplateSections([]))
        .finally(() => setSectionsLoading(false));

    // Exam-level sections configured via "Configure Paper" take priority
    // over the marking template's sections when both are present.
    const fetchViaExamPaperConfig = (examType, fallback) =>
      getExamPaperConfig(isExamination, examType)
        .then((res) => {
          const configured = res?.data?.configuredSections;
          if (Array.isArray(configured) && configured.length > 0) {
            setTemplateSections(configured.map((s) => s.section_name));
            setSectionsLoading(false);
            return;
          }
          return fallback();
        })
        .catch(() => fallback());

    if (isStandaloneExamination) {
      fetchViaExamPaperConfig("standalone_examination", () =>
        fetchViaTemplate(() => adminGetStandaloneExamTemplateId(isExamination)),
      );
    } else if (isExamination) {
      fetchViaExamPaperConfig("examination", () =>
        fetchViaTemplate(() =>
          adminGetExaminationById(isExamination).then(
            ({ examination }) =>
              examination?.templateId ?? examination?.markingTemplateId ?? null,
          ),
        ),
      );
    } else {
      fetchViaTemplate(() => adminGetAssessmentMarkingTemplateId(assessmentId));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, isExamination, isStandaloneExamination, storeSections]);

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={3}
        paddingTop={3}
        paddingX={6}
      >
        <Heading fontSize="heading.h3">
          {isQuestionListingPage
            ? null
            : questionId === "new"
              ? "Create "
              : "Update "}
          {isStandaloneExamination
            ? "Standalone Examination"
            : isExamination
              ? "Examination"
              : "Assessment"}
          {" Question"}
        </Heading>

        {!isQuestionListingPage && !isExistingQuestion && (
          <Button link={batchUploadLink}>
            Upload &amp; Batch Import Questions
          </Button>
        )}
      </Flex>

      <Flex
        flexDirection={{
          base: "column-reverse",
          md: "column-reverse",
          lg: "row",
        }}
        alignItems={{ base: "flex-start", md: "column", lg: "row" }}
      >
        {isQuestionListingPage ? (
          <QuestionListingPage {...assessmentManager} />
        ) : (
          <CreateQuestionPage
            {...assessmentManager}
            templateSections={templateSections}
            sectionsLoading={sectionsLoading}
          />
        )}

        <Box padding={6} width={{ base: "100%", md: "100%", lg: "30%" }}>
          <Box
            paddingTop="20px"
            paddingX="20px"
            paddingBottom="60px"
            backgroundColor="white"
            height={240}
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              borderBottom="1px"
              borderColor="accent.1"
              mb={5}
              pb={3}
            >
              <Heading fontSize="heading.h5">List Of Questions</Heading>

              <Link
                href={getQuestionListingLink(
                  courseId,
                  assessmentId,
                  isExamination,
                )}
              >
                <Text bold color="primary.base">
                  See All
                </Text>
              </Link>
            </Flex>

            <Grid templateColumns="repeat(5, 1fr)" gap={2}>
              {assessmentManager.assessment?.questions?.map(
                (question, index) => (
                  <ButtonNavItem
                    key={index}
                    number={index + 1}
                    isCurrent={questionId === question.id}
                    answered={questionId === question.id}
                    link={getEditQuestionLink(
                      courseId,
                      assessmentId,
                      question.id,
                      isExamination,
                    )}
                  />
                ),
              )}
            </Grid>
          </Box>
        </Box>
      </Flex>
    </>
  );
};

const ButtonNavItem = ({ number, answered, isCurrent, link }) => {
  const styleProps = answered
    ? {
        backgroundColor: "primary.base",
        color: "white",
        borderColor: "transparent",
      }
    : {
        borderColor: "primary.base",
      };

  return (
    <Link href={link}>
      <Flex
        flexDirection={{ base: "column", md: "column", lg: "row" }}
        justifyContent={{ base: "flex-start", md: "flex-start", lg: "center" }}
        boxSize="40px"
        rounded="4px"
        alignItems="center"
        as="button"
        cursor="pointer"
        transition=".1s"
        border={isCurrent ? "2px" : "1px"}
        transform={isCurrent && "scale(1.05)"}
        {...styleProps}
      >
        <Text bold as="level1">
          {number}
        </Text>
      </Flex>
    </Link>
  );
};

const useQuestionDetails = (assessmentManager) => {
  const [question, setQuestion] = useState(null);
  const { questionId } = useParams();

  const getQuestions = useCallback(() => {
    if (assessmentManager.assessment?.questions) {
      let index;

      const question = assessmentManager.assessment.questions.find((q, i) => {
        const foundQuestion = q.id === questionId;
        if (foundQuestion) index = i;

        return foundQuestion;
      });

      if (question) setQuestion({ ...question, index });
    }
  }, [assessmentManager.assessment?.questions, questionId]);

  // Handle fetch category
  useEffect(() => {
    getQuestions();
  }, [getQuestions]);

  const toast = useToast();

  useEffect(() => {
    if (assessmentManager.error) {
      toast.closeAll();

      toast({
        description: capitalizeFirstLetter(
          "there was an error filling the form, reload the page!",
        ),
        position: "top",
        status: "error",
        duration: 60000,
      });
    }
  }, [assessmentManager.error, toast]);

  return {
    question,
    isLoading: assessmentManager.isLoading,
    error: assessmentManager.error,
  };
};

const CreateQuestionPage = ({
  templateSections,
  sectionsLoading,
  ...assessmentManager
}) => {
  const { push } = useHistory();
  const toast = useToast();
  const { id: courseId, assessmentId, questionId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const isEditMode = useQueryParams().get("edit") === "true";
  const pendingSectionId = useQueryParams().get("section");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;

  const isExistingQuestion = questionId && questionId !== "new";

  const { question, isLoading, error } = useQuestionDetails(assessmentManager);

  const QUESTION_TYPES = [
    "MCQ",
    "TrueFalse",
    "FillBlank",
    "Matching",
    "ShortAnswer",
    "Essay",
  ];

  const [questionType, setQuestionType] = useState("MCQ");
  const [marks, setMarks] = useState(1);
  const [markingType, setMarkingType] = useState("automatic");
  const [selectedSectionId, setSelectedSectionId] = useState(
    pendingSectionId || "",
  );
  const [rubric, setRubric] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [bloomLevel, setBloomLevel] = useState("");

  const activeSections = templateSections;

  const [answer, setAnswer] = useState();
  const [matchingPairs, setMatchingPairs] = useState([{ left: "", right: "" }]);

  const handleAnswerChange = (event) => setAnswer(event.target.value);

  const handleAddPair = () =>
    setMatchingPairs((prev) => [...prev, { left: "", right: "" }]);
  const handleRemovePair = (idx) =>
    setMatchingPairs((prev) => prev.filter((_, i) => i !== idx));
  const handlePairChange = (idx, side, value) =>
    setMatchingPairs((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [side]: value } : p)),
    );

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm();

  const questionRichTextManager = useRichText();

  // ── Add this question to the Question Bank on save ─────────────────────
  const [addToBank, setAddToBank] = useState(false);
  const bankExamType = isStandaloneExamination
    ? "standalone"
    : isExamination
      ? "examination"
      : "assessment";
  const bankExamId = isStandaloneExamination || isExamination ? isExamination : assessmentId;
  const autoAddToBank = isAutoAddToBank(bankExamType, bankExamId);

  useEffect(() => {
    if (autoAddToBank) setAddToBank(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAddToBank]);

  // ── Select from Question Bank ──────────────────────────────────────────
  const [useBank, setUseBank] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [bankResults, setBankResults] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankApplyKey, setBankApplyKey] = useState(0);

  const searchBank = useCallback(async () => {
    setBankLoading(true);
    try {
      const params = { limit: 10, status: "active" };
      if (bankSearch) params.search = bankSearch;
      if (courseId && courseId !== "not-set") params.courseId = courseId;
      const res = await listExamQuestionBank(params);
      const payload = res?.data ?? res;
      const items = Array.isArray(payload?.questions)
        ? payload.questions
        : Array.isArray(payload)
          ? payload
          : [];
      setBankResults(items);
    } catch {
      setBankResults([]);
    } finally {
      setBankLoading(false);
    }
  }, [bankSearch, courseId]);

  useEffect(() => {
    if (useBank) searchBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useBank]);

  const applyBankQuestion = (bankQuestion) => {
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType] || "Essay";
    setQuestionType(mappedType);
    setMarks(bankQuestion.marks || 1);
    if (isExamination && !isStandaloneExamination) {
      setDifficultyLevel((bankQuestion.difficultyLevel || "Medium").toLowerCase());
    }
    questionRichTextManager.handleInitData(bankQuestion.question);
    setBankApplyKey((k) => k + 1);

    if (mappedType === "MCQ" || mappedType === "TrueFalse") {
      const opts =
        mappedType === "TrueFalse"
          ? ["True", "False"]
          : (bankQuestion.options || []).map((o) => o.text);
      opts.slice(0, 4).forEach((text, idx) => setValue(`option-${idx + 1}`, text));
      const correctIdx =
        mappedType === "TrueFalse"
          ? bankQuestion.correctAnswer === "False"
            ? 2
            : 1
          : (bankQuestion.options || []).findIndex((o) => o.isCorrect) + 1;
      setAnswer(String(correctIdx || 1));
    } else if (mappedType === "FillBlank") {
      setValue("correctAnswer", bankQuestion.correctAnswer || "");
    } else if (mappedType === "ShortAnswer") {
      setValue("modelAnswer", bankQuestion.correctAnswer || "");
    } else if (mappedType === "Essay") {
      setValue("rubricDescription", bankQuestion.explanation || "");
    }

    setUseBank(false);
    toast({
      description: "Question loaded from the bank — review and edit before saving",
      position: "top",
      status: "info",
    });
  };

  useEffect(() => {
    if (question) {
      const isTrueFalse = question.options?.length === 2;
      setQuestionType(
        question.questionType || (isTrueFalse ? "TrueFalse" : "MCQ"),
      );

      const option1 = question.options?.find((opt) => opt.optionIndex === 1);
      setValue("option-1", isTrueFalse ? "True" : option1?.name);

      questionRichTextManager.handleInitData(question.question);
      // MUIRichTextEditor only reads defaultValue on mount, so force a
      // remount (same trick applyBankQuestion uses) to pick up the loaded text.
      setBankApplyKey((k) => k + 1);

      setValue("correctAnswer", question.correctAnswer || "");
      setValue("modelAnswer", question.modelAnswer || "");
      setValue("rubricDescription", question.rubric || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (questionType === "TrueFalse") {
      setValue("option-1", "True");
      setValue("option-2", "False");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionType]);

  useEffect(() => {
    const manualTypes = ["ShortAnswer", "Essay"];
    const automaticTypes = ["MCQ", "TrueFalse", "FillBlank", "Matching"];
    if (manualTypes.includes(questionType)) setMarkingType("manual");
    else if (automaticTypes.includes(questionType)) setMarkingType("automatic");
  }, [questionType]);

  useEffect(() => {
    if (question) {
      const option2 = question.options?.find((opt) => opt.optionIndex === 2);
      setValue("option-2", option2?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);
  useEffect(() => {
    if (question) {
      const option3 = question.options?.find((opt) => opt.optionIndex === 3);
      setValue("option-3", option3?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);
  useEffect(() => {
    if (question) {
      const option4 = question.options?.find((opt) => opt.optionIndex === 4);
      setValue("option-4", option4?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  console.log(selectedSectionId);
  useEffect(() => {
    if (question) {
      const optionWithAns = question.options?.find((opt) => opt.isAnswer);
      setAnswer(`${optionWithAns?.optionIndex}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (question) {
      if (question.marks) setMarks(question.marks);
      if (question.markingType) setMarkingType(question.markingType);
      if (question.rubric) setRubric(question.rubric);
      if (question.difficultyLevel)
        setDifficultyLevel(question.difficultyLevel);
      if (question.bloomLevel) setBloomLevel(question.bloomLevel);
      if (question.section) {
        setSelectedSectionId(question.section);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const questionImageManager = useUpload();

  // TODO: uncomment for editMode's sake
  useEffect(() => {
    if (question) {
      questionImageManager.handleInitialImageSelect(question.file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  // const { handleDelete } = useCache();
  const onSubmit = async (data) => {
    try {
      // Handle delete mode
      if (isExistingQuestion && !isEditMode) {
        const ok = window.confirm(
          "Are you sure you want to delete this question?",
        );

        if (!ok) return;

        let message = "Question Deleted Successfully";

        if (isStandaloneExamination) {
          const response = await adminDeleteStandaloneExaminationQuestion(question.id);
          message = response?.message || message;
        } else if (isExamination) {
          const response = await adminDeleteExaminationQuestion(question.id);
          message = response?.message || message;
        } else {
          const response = await adminDeleteAssessmentQuestion(question.id);
          message = response?.message || message;
        }

        toast({
          description: capitalizeFirstLetter(message),
          position: "top",
          status: "success",
        });

        assessmentManager.handleFetch(true);
        push(getQuestionListingLink(courseId, assessmentId, isExamination));
        return;
      }

      const file = questionImageManager.handleGetFileAndValidate(
        "Question Cover",
        true,
      );

      // Validates presence and returns Draft.js stringified JSON (used by assessment endpoints)
      const questionText =
        questionRichTextManager.handleGetValueAndValidate("Question");

      // Plain text string required by the examination question endpoint
      const questionPlainText = questionRichTextManager.getPlainText();

      const isObjectiveType =
        questionType === "MCQ" || questionType === "TrueFalse";

      let options = [];
      if (isObjectiveType) {
        options = buildOptions({ ...data, answer }, isStandaloneExamination);
        if (questionType === "TrueFalse" && options.length === 4) {
          options = options.slice(0, 2);
        }
        const hasAnswer = options.find((opt) => opt.isAnswer);
        if (!hasAnswer) throw new Error("Please select an answer");
      } else if (questionType === "Matching") {
        if (matchingPairs.some((p) => !p.left.trim() || !p.right.trim()))
          throw new Error(
            "All matching pairs must have both left and right values",
          );
      }

      const typeSpecificFields = isObjectiveType
        ? { options: JSON.stringify(options) }
        : questionType === "FillBlank"
          ? { correctAnswer: data.correctAnswer, questionType: "FillBlank" }
          : questionType === "Matching"
            ? { pairs: JSON.stringify(matchingPairs), questionType: "Matching" }
            : questionType === "ShortAnswer"
              ? { modelAnswer: data.modelAnswer, questionType: "ShortAnswer" }
              : {
                  rubricDescription: data.rubricDescription,
                  questionType: "Essay",
                };

      // Captured here because `data` gets reassigned into the request body below.
      const bankSourceFields = {
        correctAnswer: data.correctAnswer,
        modelAnswer: data.modelAnswer,
        rubricDescription: data.rubricDescription,
      };

      // selectedSectionId is the section name string for both examination and assessment
      const editSectionTitle = selectedSectionId || undefined;

      const editMeta = {
        marks: Number(marks),
        markingType,
        ...(editSectionTitle && { section: editSectionTitle }),
        ...(rubric && { rubric }),
        difficultyLevel,
        ...(bloomLevel && { bloomLevel }),
      };

      const sectionTitle = selectedSectionId || undefined;

      if (isEditMode) {
        if (isStandaloneExamination) {
          // JSON body — PATCH /v1/stand-alone-examination-question/edit
          data = {
            questionId,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...(isObjectiveType && { options }),
          };
        } else if (isExamination) {
          data = {
            image: file,
            question: JSON.stringify({
              id: questionId,
              question: questionPlainText,
              examinationId: isExamination,
              ...editMeta,
              questionType,
            }),
            ...(isObjectiveType
              ? {
                  options: JSON.stringify(
                    options.map((opt) => ({
                      ...opt,
                      id: question?.options.find(
                        ({ name }) => opt.name === name,
                      )?.id,
                      examinationQuestionId: questionId,
                    })),
                  ),
                }
              : typeSpecificFields),
          };
        } else {
          data = {
            image: file,
            questionId,
            question: questionText,
            markingType,
            questionType,
            ...(sectionTitle && { section: sectionTitle }),
            ...(isObjectiveType
              ? {
                  options: JSON.stringify(
                    options.map((opt) => ({
                      ...opt,
                      id: question?.options.find(
                        ({ name }) => opt.name === name,
                      )?.id,
                    })),
                  ),
                }
              : questionType === "FillBlank"
                ? { correctAnswer: data.correctAnswer }
                : questionType === "Matching"
                  ? { pairs: JSON.stringify(matchingPairs) }
                  : questionType === "ShortAnswer"
                    ? { modelAnswer: data.modelAnswer }
                    : { rubricDescription: data.rubricDescription }),
          };
        }
      } else {
        // Create mode
        const examMeta = {
          marks: Number(marks),
          markingType,
          ...(sectionTitle && { section: sectionTitle }),
          ...(rubric && { rubric }),
          difficultyLevel,
          ...(bloomLevel && { bloomLevel }),
        };

        if (isStandaloneExamination) {
          // JSON body — POST /v1/stand-alone-examination-question/create
          data = {
            standAloneExaminationId: isExamination,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...(isObjectiveType && { options }),
          };
        } else if (isExamination) {
          data = {
            image: file,
            examinationId: isExamination,
            question: questionPlainText,
            ...examMeta,
            questionType,
            ...typeSpecificFields,
          };
        } else {
          data = {
            image: file,
            assessmentId,
            question: questionText,
            markingType,
            questionType,
            ...(sectionTitle && { section: sectionTitle }),
            ...(isObjectiveType
              ? { options: JSON.stringify(options) }
              : questionType === "FillBlank"
                ? { correctAnswer: data.correctAnswer }
                : questionType === "Matching"
                  ? { pairs: JSON.stringify(matchingPairs) }
                  : questionType === "ShortAnswer"
                    ? { modelAnswer: data.modelAnswer }
                    : { rubricDescription: data.rubricDescription }),
          };
        }
      }

      // Standalone uses plain JSON; assessment/examination use multipart FormData
      const body = isStandaloneExamination ? data : appendFormData(data);

      const response = isEditMode
        ? isStandaloneExamination
          ? await adminEditStandaloneExaminationQuestion(body)
          : isExamination
            ? await adminEditExaminationQuestion(body)
            : await adminEditAssessmentQuestion(body)
        : isStandaloneExamination
          ? await adminCreateStandaloneExaminationQuestion(body)
          : isExamination
            ? await adminCreateExaminationQuestion(body)
            : await adminCreateAssessmentQuestion(body);

      const message = response?.message || "Question saved successfully";

      if (!isEditMode && (addToBank || autoAddToBank)) {
        const bankType = FORM_TYPE_TO_BANK_TYPE[questionType];
        if (!bankType) {
          toast({
            description: "This question type isn't supported by the Question Bank yet",
            position: "top",
            status: "warning",
          });
        } else {
          let bankPayload;
          try {
            bankPayload = {
              question: questionPlainText,
              questionType: bankType,
              marks: Number(marks) || 1,
              difficultyLevel: capitalizeFirstLetter(difficultyLevel || "medium"),
              status: "draft",
            };
            if (isObjectiveType) {
              const bankOptions = options.map((o) => ({
                text: o.name ?? o.option ?? "",
                isCorrect: !!o.isAnswer,
              }));
              bankPayload.options = bankOptions.filter((o) => o.text);
              bankPayload.correctAnswer =
                bankOptions.find((o) => o.isCorrect)?.text ?? "";
            } else if (questionType === "FillBlank") {
              bankPayload.correctAnswer = bankSourceFields.correctAnswer || "";
            } else if (questionType === "ShortAnswer") {
              bankPayload.correctAnswer = bankSourceFields.modelAnswer || "";
            } else if (questionType === "Essay" && bankSourceFields.rubricDescription) {
              bankPayload.explanation = bankSourceFields.rubricDescription;
            }
            if (courseId && courseId !== "not-set") bankPayload.courseId = courseId;

            await createExamQuestionBankItem(bankPayload);
          } catch (bankErr) {
            console.error("[QuestionsPage] failed to add question to bank", bankPayload, bankErr?.response?.data ?? bankErr);
            toast({
              description:
                bankErr?.response?.data?.message ||
                "Question saved, but failed to add it to the Question Bank",
              position: "top",
              status: "warning",
            });
          }
        }
      }

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      // Clean UP input
      reset();

      assessmentManager.handleFetch(true);

      if (isEditMode) {
        // After edit, go back to view mode
        const viewLink = getEditQuestionLink(
          courseId,
          assessmentId,
          questionId,
          isExamination,
        );
        push(viewLink);
      } else {
        // After create, persist pending section so listing page can assign it
        if (pendingSectionId) {
          sessionStorage.setItem(`ps_${assessmentId}`, pendingSectionId);
        }
        push(getQuestionListingLink(courseId, assessmentId, isExamination));
      }
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  // const deleteImage = async () => {
  //   if (question) {
  //     if (isStandaloneExamination)
  //       await adminDeleteStandaloneExaminationQuestionFile(question.id);
  //     else if (isExamination)
  //       await adminDeleteExaminationQuestionFile(question.id);
  //     else await adminDeleteAssessmentQuestionFile(question.id);
  //   }
  // };

  // where stuffs start
  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      padding={6}
      width={{ base: "100%", md: "100%", lg: "70%" }}
    >
      <Box
        paddingTop="20px"
        paddingX="20px"
        paddingBottom="60px"
        backgroundColor="white"
      >
        {isExistingQuestion && !isEditMode ? (
          <RichTextToView
            marginBottom={2}
            padding={2}
            backgroundColor="accent.1"
            flex={0.2}
            text={question?.question}
          />
        ) : (
          <RichText
            key={bankApplyKey}
            height="250px"
            id="question"
            label={getQuestionNumber(
              question && questionId !== "new"
                ? question.index
                : assessmentManager.assessment?.questions?.length,
            )}
            placeholder="Enter your question here"
            onChange={questionRichTextManager.handleChange}
            defaultValue={questionRichTextManager.data.default}
          />
        )}
        <Box marginTop={8}>
          {isExistingQuestion && !isEditMode && !question?.file ? null : (
            <Upload
              id="coverImage"
              label="Question Image"
              onFileSelect={questionImageManager.handleFileSelect}
              imageUrl={questionImageManager.image.url}
              accept={questionImageManager.accept}
              disabled={isExistingQuestion && !isEditMode}
            />
          )}
        </Box>
      </Box>

      <Box marginTop={10} padding={6} backgroundColor="white">
        <Heading fontSize="heading.h4" mb={4}>
          Question Type & Answer
        </Heading>

        {/* Select from Question Bank — only shown in create mode */}
        {(!isExistingQuestion || isEditMode) && (
          <Box borderBottom="1px" borderColor="accent.2" pb={4} mb={6}>
            <Flex justifyContent="space-between" alignItems="center" mb={useBank ? 3 : 0}>
              <Text fontSize="sm" fontWeight="600" color="gray.700">
                Select from Question Bank
              </Text>
              <Switch
                isChecked={useBank}
                onChange={(e) => setUseBank(e.target.checked)}
                colorScheme="purple"
                size="sm"
              />
            </Flex>
            {useBank && (
              <Box backgroundColor="gray.50" borderRadius="md" p={3}>
                <Flex gap={2} mb={3}>
                  <ChakraInput
                    size="sm"
                    backgroundColor="white"
                    placeholder="Search bank questions..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchBank()}
                  />
                  <Button size="xs" onClick={searchBank} disabled={bankLoading}>
                    Search
                  </Button>
                </Flex>
                <Stack spacing={2} maxHeight="220px" overflowY="auto">
                  {bankResults.map((bq) => (
                    <Flex
                      key={bq.id}
                      justifyContent="space-between"
                      alignItems="center"
                      backgroundColor="white"
                      p={2}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      gap={3}
                    >
                      <Text fontSize="xs" noOfLines={2}>
                        {bq.question}
                      </Text>
                      <Button size="xs" onClick={() => applyBankQuestion(bq)}>
                        Use
                      </Button>
                    </Flex>
                  ))}
                  {!bankLoading && bankResults.length === 0 && (
                    <Text fontSize="xs" color="gray.400">
                      No matching questions found.
                    </Text>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Question type selector — only shown in create mode */}
        {(!isExistingQuestion || isEditMode) && (
          <Box borderBottom="1px" borderColor="accent.2" pb={4} mb={6}>
            <ButtonGroup size="xs" flexWrap="wrap" gap={2}>
              {QUESTION_TYPES.map((type) => (
                <Button
                  key={type}
                  onClick={() => setQuestionType(type)}
                  leftIcon={questionType === type && <BsCheckCircle />}
                  ghost={questionType !== type}
                  disabled={isExistingQuestion && !isEditMode}
                >
                  {type === "TrueFalse"
                    ? "True / False"
                    : type === "FillBlank"
                      ? "Fill in the Blank"
                      : type === "ShortAnswer"
                        ? "Short Answer"
                        : type}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        )}

        {/* Question metadata row */}
        {(!isExistingQuestion || isEditMode) && (
          <>
            <Flex gap={4} mb={4} flexWrap="wrap" alignItems="flex-end">
              <Box minW="180px">
                <Text fontSize="sm" mb={1} color="gray.600">
                  Marking Type
                </Text>
                <ChakraSelect
                  value={markingType}
                  onChange={(e) => setMarkingType(e.target.value)}
                  size="sm"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="hybrid">Hybrid</option>
                </ChakraSelect>
              </Box>
              {/* Difficulty — only for regular examination */}
              {isExamination && !isStandaloneExamination && (
                <>
                  <Box minW="160px">
                    <Text fontSize="sm" mb={1} color="gray.600">
                      Difficulty
                    </Text>
                    <ChakraSelect
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      size="sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </ChakraSelect>
                  </Box>
                </>
              )}
              {/* Section — populated from the exam's configured sections, or the linked marking template */}
              <Box minW="200px">
                <Flex justifyContent="space-between" alignItems="baseline">
                  <Text fontSize="sm" mb={1} color="gray.600">
                    Section{" "}
                    {sectionsLoading && (
                      <Text as="span" fontSize="xs" color="gray.400">
                        (loading…)
                      </Text>
                    )}
                  </Text>
                  {isExamination && (
                    <Link
                      href={`/admin/exam-paper-config/${isExamination}?examType=${isStandaloneExamination ? "standalone_examination" : "examination"}`}
                    >
                      <Text fontSize="xs" color="primary.base">
                        Configure sections
                      </Text>
                    </Link>
                  )}
                </Flex>
                <ChakraSelect
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  size="sm"
                  disabled={sectionsLoading || activeSections.length === 0}
                  placeholder={
                    sectionsLoading
                      ? "Loading sections…"
                      : activeSections.length === 0
                        ? "No sections available"
                        : "Select a section"
                  }
                >
                  {activeSections.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </ChakraSelect>
              </Box>
            </Flex>
          </>
        )}

        {/* MCQ */}
        {(questionType === "MCQ" ||
          (isExistingQuestion &&
            !isEditMode &&
            !["FillBlank", "Matching", "ShortAnswer", "Essay"].includes(
              questionType,
            ))) &&
          questionType !== "TrueFalse" && (
            <Stack direction="column">
              <Text paddingBottom={4} color="gray.500">
                Select the correct answer
              </Text>
              {[1, 2, 3, 4].map((num) => (
                <Flex key={num} flexDirection="row" paddingBottom={6}>
                  <Flex paddingTop={12} paddingRight={6}>
                    <input
                      disabled={isExistingQuestion && !isEditMode}
                      type="radio"
                      checked={answer === `${num}`}
                      onChange={handleAnswerChange}
                      name="radio"
                      value={`${num}`}
                      id={`radio-${num}`}
                    />
                  </Flex>
                  <Input
                    disabled={isExistingQuestion && !isEditMode}
                    id={`option-${num}`}
                    label={`Option 0${num}`}
                    {...register(`option-${num}`, { required: true })}
                    placeholder={`Enter option ${num} here`}
                  />
                </Flex>
              ))}
            </Stack>
          )}

        {/* True / False */}
        {questionType === "TrueFalse" && (
          <Stack direction="column">
            <Text paddingBottom={4} color="gray.500">
              Select the correct answer
            </Text>
            {["True", "False"].map((label, i) => (
              <Flex key={label} flexDirection="row" paddingBottom={6}>
                <Flex paddingTop={12} paddingRight={6}>
                  <input
                    disabled={isExistingQuestion && !isEditMode}
                    type="radio"
                    checked={answer === `${i + 1}`}
                    onChange={handleAnswerChange}
                    name="radio"
                    value={`${i + 1}`}
                    id={`radio-${i + 1}`}
                  />
                </Flex>
                <Input
                  id={`option-${i + 1}`}
                  label={label}
                  value={label}
                  disabled
                  {...register(`option-${i + 1}`)}
                />
              </Flex>
            ))}
          </Stack>
        )}

        {/* Fill in the Blank */}
        {questionType === "FillBlank" && (
          <Box>
            <Text paddingBottom={4} color="gray.500">
              Provide the correct answer for the blank
            </Text>
            <Input
              label="Correct Answer"
              isRequired
              placeholder="e.g. Paris"
              disabled={isExistingQuestion && !isEditMode}
              {...register("correctAnswer", {
                required: "Correct answer is required",
              })}
            />
          </Box>
        )}

        {/* Matching */}
        {questionType === "Matching" && (
          <Box>
            <Text paddingBottom={4} color="gray.500">
              Add matching pairs (left → right)
            </Text>
            {matchingPairs.map((pair, idx) => (
              <Flex key={idx} gap={4} mb={4} alignItems="flex-end">
                <Box flex={1}>
                  <Input
                    label={`Left ${idx + 1}`}
                    placeholder="e.g. H2O"
                    value={pair.left}
                    disabled={isExistingQuestion && !isEditMode}
                    onChange={(e) =>
                      handlePairChange(idx, "left", e.target.value)
                    }
                  />
                </Box>
                <Box flex={1}>
                  <Input
                    label={`Right ${idx + 1}`}
                    placeholder="e.g. Water"
                    value={pair.right}
                    disabled={isExistingQuestion && !isEditMode}
                    onChange={(e) =>
                      handlePairChange(idx, "right", e.target.value)
                    }
                  />
                </Box>
                {!(isExistingQuestion && !isEditMode) &&
                  matchingPairs.length > 1 && (
                    <Button
                      ghost
                      onClick={() => handleRemovePair(idx)}
                      type="button"
                      mb={2}
                    >
                      Remove
                    </Button>
                  )}
              </Flex>
            ))}
            {!(isExistingQuestion && !isEditMode) && (
              <Button ghost onClick={handleAddPair} type="button" mt={2}>
                + Add Pair
              </Button>
            )}
          </Box>
        )}

        {/* Short Answer */}
        {questionType === "ShortAnswer" && (
          <Box>
            <Box backgroundColor="blue.50" borderRadius="md" p={3} mb={4}>
              <Text color="blue.700" fontSize="sm">
                This question type is manually graded by the instructor.
              </Text>
            </Box>
            <Input
              label="Model Answer"
              placeholder="Enter the expected model answer"
              disabled={isExistingQuestion && !isEditMode}
              {...register("modelAnswer")}
            />
          </Box>
        )}

        {/* Essay */}
        {questionType === "Essay" && (
          <Box>
            <Box backgroundColor="blue.50" borderRadius="md" p={3} mb={4}>
              <Text color="blue.700" fontSize="sm">
                Essay questions are manually graded by the instructor using the
                rubric defined in the marking template.
              </Text>
            </Box>
            <Input
              label="Rubric Description (optional)"
              placeholder="e.g. Clarity (5pts), Depth (5pts)"
              disabled={isExistingQuestion && !isEditMode}
              {...register("rubricDescription")}
            />
          </Box>
        )}

        {/* Add to Question Bank — only offered while creating a brand-new question */}
        {!isExistingQuestion && (
          <Box borderTop="1px" borderColor="accent.2" pt={4} mt={6}>
            <Checkbox
              isChecked={addToBank}
              onChange={(e) => setAddToBank(e.target.checked)}
              isDisabled={autoAddToBank}
              colorScheme="purple"
            >
              Add to Question Bank
            </Checkbox>
            {autoAddToBank && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Auto-enabled — this exam was set to add every question to the bank on creation.
              </Text>
            )}
          </Box>
        )}
      </Box>
      <Flex justifyContent="flex-end" paddingTop={8} gap={4}>
        {isExistingQuestion && !isEditMode && (
          <Button
            onClick={() => {
              const editLink =
                getEditQuestionLink(
                  courseId,
                  assessmentId,
                  questionId,
                  isExamination,
                ) + "&edit=true";
              push(editLink);
            }}
          >
            Edit Question
          </Button>
        )}
        {isEditMode && (
          <Button
            ghost
            onClick={() => {
              const viewLink = getEditQuestionLink(
                courseId,
                assessmentId,
                questionId,
                isExamination,
              );
              push(viewLink);
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || isSubmitting || error}
          isLoading={isLoading || isSubmitting}
        >
          {isExistingQuestion && !isEditMode
            ? "Delete"
            : isEditMode
              ? "Update"
              : "Add"}{" "}
          Question
        </Button>
      </Flex>
    </Box>
  );
};

const QuestionListingPage = ({ assessment, isLoading, error }) => {
  const { id: courseId, assessmentId } = useParams();
  const isExamination = useQueryParams().get("examination");

  const questions = Array.isArray(assessment?.questions)
    ? assessment.questions
    : [];

  const sm = useSections(assessmentId);

  const [editingId, setEditingId] = useState(null);
  const [titleInput, setTitleInput] = useState("");
  const [showNewSection, setShowNewSection] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // After a question is created with a section context, assign it
  useEffect(() => {
    if (!questions.length) return;
    const pending = sessionStorage.getItem(`ps_${assessmentId}`);
    if (!pending) return;
    const unassigned = questions.filter((q) => !sm.assignments[q.id]);
    if (unassigned.length) {
      sm.assign(unassigned[unassigned.length - 1].id, pending);
      sessionStorage.removeItem(`ps_${assessmentId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, assessmentId]);

  const questionsIsEmpty = !isLoading && !error && !questions.length;

  const buildAddLink = (sectionId) => {
    const base = `/admin/courses/${courseId}/assessment/${assessmentId}/questions/new`;
    const parts = [
      isExamination && `examination=${isExamination}`,
      sectionId && `section=${sectionId}`,
    ].filter(Boolean);
    return parts.length ? `${base}?${parts.join("&")}` : base;
  };

  const handleAddSection = () => {
    if (newTitle.trim()) {
      sm.add(newTitle.trim());
      setNewTitle("");
      setShowNewSection(false);
    }
  };

  const handleRename = (sId) => {
    if (titleInput.trim()) sm.rename(sId, titleInput.trim());
    setEditingId(null);
  };

  const unassigned = questions.filter((q) => !sm.assignments[q.id]);

  return (
    <Box padding={6} width="70%">
      {isLoading && <PageLoaderLayout height="70%" width="100%" />}

      {questionsIsEmpty && !sm.sections.length && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3}>
            No Questions Asked Yet
          </Heading>
          <Text as="level3" marginBottom={7}>
            Add a section below or create a question directly.
          </Text>
        </PageLoaderLayout>
      )}

      {error && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3} color="red.500">
            {capitalizeWords(error)}
          </Heading>
        </PageLoaderLayout>
      )}

      {/* ── Sections ── */}
      {sm.sections.map((section, si) => {
        const sectionQs = questions.filter(
          (q) => sm.assignments[q.id] === section.id,
        );
        return (
          <Box
            key={section.id}
            marginBottom={8}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
          >
            {/* Section header */}
            <Flex
              alignItems="center"
              gap={3}
              px={5}
              py={3}
              backgroundColor="primary.base"
            >
              {editingId === section.id ? (
                <Flex gap={2} flex={1} alignItems="center">
                  <input
                    autoFocus
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(section.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    style={{
                      flex: 1,
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      padding: "4px 10px",
                      fontSize: 14,
                    }}
                  />
                  <Button size="sm" onClick={() => handleRename(section.id)}>
                    Save
                  </Button>
                  <Button size="sm" ghost onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </Flex>
              ) : (
                <>
                  <Heading fontSize="heading.h5" color="white" flex={1}>
                    Section {si + 1}: {section.title}
                  </Heading>
                  <Button
                    size="xs"
                    ghost
                    onClick={() => {
                      setEditingId(section.id);
                      setTitleInput(section.title);
                    }}
                    color="white"
                  >
                    Rename
                  </Button>
                  <Button
                    size="xs"
                    ghost
                    onClick={() => sm.remove(section.id)}
                    color="red.200"
                  >
                    Delete
                  </Button>
                </>
              )}
            </Flex>

            {/* Section questions */}
            <Box px={5} pt={4} pb={2}>
              {sectionQs.length === 0 && (
                <Box
                  padding={4}
                  backgroundColor="gray.50"
                  textAlign="center"
                  borderRadius="md"
                  mb={4}
                >
                  <Text color="gray.400">
                    No questions in this section yet.
                  </Text>
                </Box>
              )}
              {sectionQs.map((q, index) => (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  questionNumber={getQuestionNumber(index)}
                  question={q.question}
                  image={q.file}
                  marginBottom={4}
                  sections={sm.sections}
                  currentSectionId={section.id}
                  onAssign={(qId, sId) => sm.assign(qId, sId)}
                  onUnassign={(qId) => sm.unassign(qId)}
                />
              ))}
              <Box pb={4}>
                <Button link={buildAddLink(section.id)} size="sm" ghost>
                  + Add Question to this Section
                </Button>
              </Box>
            </Box>
          </Box>
        );
      })}

      {/* ── Unassigned / no-section questions ── */}
      {(unassigned.length > 0 || sm.sections.length === 0) && (
        <Box marginBottom={8}>
          {sm.sections.length > 0 && (
            <Flex
              alignItems="center"
              mb={4}
              pb={2}
              borderBottom="1px"
              borderColor="gray.300"
            >
              <Heading fontSize="heading.h5" color="gray.500">
                Unassigned Questions
              </Heading>
            </Flex>
          )}

          {unassigned.map((q, index) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              questionNumber={getQuestionNumber(index)}
              question={q.question}
              image={q.file}
              marginBottom={4}
              sections={sm.sections}
              currentSectionId={null}
              onAssign={(qId, sId) => sm.assign(qId, sId)}
              onUnassign={(qId) => sm.unassign(qId)}
            />
          ))}

          <Box paddingTop={4}>
            <Button link={buildAddLink(null)}>Add New Question</Button>
          </Box>
        </Box>
      )}

      {/* ── Add Section ── */}
      <Box paddingTop={5} borderTop="1px" borderColor="gray.200" marginTop={4}>
        {showNewSection ? (
          <Flex gap={3} alignItems="flex-end">
            <Box flex={1}>
              <Input
                label="Section Title"
                placeholder='e.g. "Section A – General Knowledge"'
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection();
                }}
              />
            </Box>
            <Button
              onClick={handleAddSection}
              disabled={!newTitle.trim()}
              mb={2}
            >
              Add Section
            </Button>
            <Button
              ghost
              onClick={() => {
                setShowNewSection(false);
                setNewTitle("");
              }}
              mb={2}
            >
              Cancel
            </Button>
          </Flex>
        ) : (
          <Button ghost onClick={() => setShowNewSection(true)}>
            + Add Section
          </Button>
        )}
      </Box>
    </Box>
  );
};

const QuestionCard = ({
  questionNumber,
  question,
  image,
  id,
  sections,
  currentSectionId,
  onAssign,
  onUnassign,
  ...rest
}) => {
  const { id: courseId, assessmentId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const editLink = getEditQuestionLink(
    courseId,
    assessmentId,
    id,
    isExamination,
  );

  const { resource: deleteRequest, handleFetchResource } = useFetch();
  const toast = useToast();

  const handleDelete = () => {
    const ok = window.confirm("Are you sure you want to delete this question?");
    if (!ok) return;

    handleFetchResource({
      fetcher: async () => {
        if (isStandaloneExamination) {
          await adminDeleteStandaloneExaminationQuestion(id);
        } else if (isExamination) await adminDeleteExaminationQuestion(id);
        else await adminDeleteAssessmentQuestion(id);

        return "Question Deleted Successfully";
      },
      onError: (err) => {
        toast({
          description: err.message,
          position: "top",
          status: "error",
        });
      },
      onSuccess: (msg) => {
        toast({
          description: msg,
          position: "top",
          status: "success",
        });
      },
    });
  };

  return (
    <>
      {deleteRequest.loading && (
        <Flex
          pos="fixed"
          top="0"
          left="0"
          zIndex={100}
          w="100vw"
          h="100vh"
          alignItems="center"
          justifyContent="center"
          bg="rgba(255,255,255, .5)"
        >
          <Flex
            alignItems="center"
            bg="rgba(255,255,255)"
            p={6}
            shadow="md"
            rounded="md"
            w="300px"
            flexDirection="column"
          >
            <Box>
              <Spinner mb={5} />
            </Box>
            Please wait. Deleting this file might take some time.
          </Flex>
        </Flex>
      )}

      <Flex
        {...rest}
        alignItems="stretch"
        justifyContent="space-between"
        backgroundColor="white"
        padding={6}
      >
        <Box>
          <Heading fontSize="text.level2">
            <Link href={editLink}>{questionNumber}</Link>
          </Heading>

          <RichTextToView paddingTop={2} text={question} />

          {image && (
            <Image
              mt={5}
              src={image}
              alt={"question"}
              width="100%"
              height="400px"
              rounded="md"
            />
          )}
        </Box>

        <Box transform="translateY(-10px)">
          <MoreIconButton
            editLink={editLink}
            onDelete={handleDelete}
            sections={sections}
            currentSectionId={currentSectionId}
            onAssign={onAssign ? (sId) => onAssign(id, sId) : null}
            onUnassign={onUnassign ? () => onUnassign(id) : null}
          />
        </Box>
      </Flex>
    </>
  );
};

export const MoreIconButton = ({
  editLink,
  onDelete,
  sections,
  currentSectionId,
  onAssign,
  onUnassign,
}) => {
  const { push } = useHistory();

  const handleViewClick = () => push(editLink);
  const handleEditClick = () => push(editLink + "&edit=true");

  const otherSections =
    sections?.filter((s) => s.id !== currentSectionId) ?? [];

  return (
    <Menu placement="bottom-end">
      <MenuButton
        padding={2}
        rounded="full"
        _hover={{ background: "none", color: "others.3" }}
        _focus={{ border: "none", background: "white" }}
      >
        <FiMoreHorizontal />
      </MenuButton>

      <MenuList position="relative" zIndex={2}>
        <MenuItem onClick={handleViewClick}>Preview question</MenuItem>
        <MenuItem onClick={handleEditClick}>Edit question</MenuItem>

        {/* Section assignment */}
        {otherSections.length > 0 &&
          otherSections.map((s) => (
            <MenuItem key={s.id} onClick={() => onAssign && onAssign(s.id)}>
              Move to: {s.title}
            </MenuItem>
          ))}
        {currentSectionId && onUnassign && (
          <MenuItem onClick={onUnassign} color="orange.500">
            Remove from section
          </MenuItem>
        )}

        <MenuItem onClick={onDelete} color="red.500">
          Delete question
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const getQuestionListingLink = (courseId, assessmentId, isExamination) =>
  `/admin/courses/${courseId}/assessment/${assessmentId}/questions/list?question-listing=true${
    isExamination ? `&examination=${isExamination}` : ""
  }`;

const getEditQuestionLink = (
  courseId,
  assessmentId,
  questionId,
  isExamination,
) => {
  return `/admin/courses/${courseId}/assessment/${assessmentId}/questions/${questionId}${
    isExamination ? `?examination=${isExamination}` : ""
  }`;
};

const getQuestionNumber = (index) =>
  `Question ${
    index + 1 < 9 ? `0${index + 1}` : index === undefined ? "01" : index + 1
  }`;

const buildOptions = (data, isStandaloneExamination) => {
  const options = [];

  for (const item in data) {
    if (/option/.test(item)) {
      const name = data[item];
      const optionIndex = +item.replace("option-", "");
      const isAnswer = +data.answer === optionIndex;

      const option = {
        [isStandaloneExamination ? "option" : "name"]: name,
        isAnswer,
        optionIndex,
      };

      if (option.name || option.option) options.push(option);
    }
  }

  return options;
};

const QuestionsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <QuestionsPage {...props} />} />;
};

export default QuestionsPageRoute;
