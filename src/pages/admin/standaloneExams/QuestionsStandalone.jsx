import {
  Badge,
  Box,
  Checkbox,
  Flex,
  Grid,
  Select as ChakraSelect,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagCloseButton,
  TagLabel,
  Input as ChakraInput,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
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
  WorkflowSubmitModal,
} from "../../../components";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight, FaPlus, FaTrash } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { Route, useHistory } from "react-router-dom";
import { PageLoaderLayout } from "../../../layouts";
import {
  useFetch,
  useGoBack,
  useIsSuperAdmin,
  useQueryParams,
  useRichText,
  useUpload,
} from "../../../hooks";
import {
  adminCreateStandaloneExamination,
  adminCreateStandaloneExaminationQuestion,
  adminDeleteStandaloneExaminationQuestion,
  adminEditStandaloneExaminationQuestion,
  adminGetMarkingTemplateById,
  adminGetStandaloneExamTemplateId,
  createExamQuestionBankItem,
  getExamQuestionBankItem,
  getExaminationById as getExamPaperConfig,
  listExamQuestionBank,
  updateExaminationById as updateExamPaperConfig,
} from "../../../services";
import { buildBatchUploadLink } from "../examQuestionImport/questionRowUtils";
import SelectBankQuestionsModal from "../examQuestionBank/SelectBankQuestionsModal";
import {
  capitalizeFirstLetter,
  capitalizeWords,
  isAutoAddToBank,
  setAutoAddToBank,
} from "../../../utils";
import useAssessmentPreview from "../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import useAssessmentStore from "../../../store/assessmentStore";

const QUESTION_TYPES = ["MCQ", "TrueFalse", "Matching", "FillBlank"];

// Question Bank type mapping — this simplified form has no Essay/ShortAnswer tabs
// and the bank has no "Matching" equivalent, so those are intentionally excluded.
const FORM_TYPE_TO_BANK_TYPE = {
  MCQ: "mcq",
  TrueFalse: "true_false",
  FillBlank: "fill_blank",
};

const BANK_TYPE_TO_FORM_TYPE = {
  mcq: "MCQ",
  true_false: "TrueFalse",
  fill_blank: "FillBlank",
};

const TYPE_LABEL = {
  MCQ: "MCQ",
  TrueFalse: "True / False",
  Matching: "Matching",
  FillBlank: "Fill in the Blank",
  ShortAnswer: "Short Answer",
  Essay: "Essay",
};

const QuestionsStandalone = () => {
  const isQuestionListingPage = useQueryParams().get("question-listing");
  const isExamination = useQueryParams().get("examination");
  const questionId = useQueryParams().get("question");
  const isEditMode = useQueryParams().get("edit") === "true";
  const submitForApproval = useQueryParams().get("submitForApproval") === "1";
  const queuedIndexParam = useQueryParams().get("queuedIndex");
  const isExistingQuestion = questionId && questionId !== "new";
  // "Next" on the details form hands off here without creating anything —
  // this page renders from `pendingCreate` instead of fetching a real record.
  const isPendingCreation = submitForApproval && !isExistingQuestion && !isEditMode;

  const batchUploadLink = buildBatchUploadLink({
    examinationId: isExamination,
    standalone: true,
  });

  const assessmentManager = useAssessmentPreview(null, isExamination, true);

  const storeSections = useAssessmentStore((s) => s.sections);
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const handleGoBack = useGoBack();
  const { push } = useHistory();
  const toast = useToast();
  const [creatingForUpload, setCreatingForUpload] = useState(false);
  const [templateSections, setTemplateSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // The batch-upload endpoint requires a real examination UUID — it never
  // accepts the "new" placeholder. While pending creation, clicking
  // "Upload & Batch Import Questions" creates the exam first (same create
  // call `performCreateParent` uses below) and only then navigates, so the
  // batch-upload page always receives a real id.
  const handleBatchUploadClick = async () => {
    if (!pendingCreate) return;
    setCreatingForUpload(true);
    try {
      const { body, paperConfigBody, addToBank: parentAddToBank } = pendingCreate;
      const { examination } = await adminCreateStandaloneExamination(body);
      await updateExamPaperConfig(examination.id, paperConfigBody);
      if (parentAddToBank) setAutoAddToBank("standalone", examination.id);
      setAssessment({ ...examination, sections: paperConfigBody?.configuredSections || [] });

      push(buildBatchUploadLink({ examinationId: examination.id, standalone: true }));
    } catch (err) {
      toast({
        description: "Couldn't create the exam before uploading — please try again",
        position: "top",
        status: "error",
      });
    } finally {
      setCreatingForUpload(false);
    }
  };

  useEffect(() => {
    if (isPendingCreation) {
      const configuredSections = pendingCreate?.paperConfigBody?.configuredSections;
      if (Array.isArray(configuredSections) && configuredSections.length > 0) {
        setTemplateSections(configuredSections.map((s) => s.section_name));
        return;
      }
      if (!pendingCreate?.body?.templateId) {
        setTemplateSections([]);
        return;
      }
      setSectionsLoading(true);
      adminGetMarkingTemplateById(pendingCreate.body.templateId)
        .then(({ template }) =>
          setTemplateSections(
            Array.isArray(template?.sections)
              ? template.sections.map((s) => s.name)
              : [],
          ),
        )
        .catch(() => setTemplateSections([]))
        .finally(() => setSectionsLoading(false));
      return;
    }

    if (!isExamination) return;

    if (storeSections.length > 0) {
      setTemplateSections(storeSections.map((s) => s.name || s.section_name));
      return;
    }

    setSectionsLoading(true);

    const fetchViaTemplate = () =>
      adminGetStandaloneExamTemplateId(isExamination)
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
    getExamPaperConfig(isExamination, "standalone_examination")
      .then((res) => {
        const configured = res?.data?.configuredSections;
        if (Array.isArray(configured) && configured.length > 0) {
          setTemplateSections(configured.map((s) => s.section_name));
          setSectionsLoading(false);
          return;
        }
        return fetchViaTemplate();
      })
      .catch(() => fetchViaTemplate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExamination, storeSections, isPendingCreation, pendingCreate]);

  // Nothing was ever saved to the backend, so if the in-memory details-form
  // data is gone (e.g. the page was refreshed) there's nothing to recover.
  if (isPendingCreation && !pendingCreate) {
    return (
      <Box padding={10} textAlign="center">
        <Text bold mb={2}>
          The details for this exam were lost.
        </Text>
        <Text color="gray.500" mb={4}>
          Nothing was created yet, so there&apos;s nothing to recover — please go back and fill in the details again.
        </Text>
        <Button onClick={handleGoBack} type="button">
          Go Back
        </Button>
      </Box>
    );
  }

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
            : queuedIndexParam !== null
              ? "Edit Queued Question"
              : !questionId
                ? "Create Standalone Question"
                : "Update Standalone Question"}
        </Heading>

        {!isQuestionListingPage && !isExistingQuestion && (
          isPendingCreation ? (
            <Button onClick={handleBatchUploadClick} disabled={creatingForUpload}>
              {creatingForUpload ? "Creating..." : "Upload & Batch Import Questions"}
            </Button>
          ) : (
            <Button link={batchUploadLink}>
              Upload &amp; Batch Import Questions
            </Button>
          )
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
              <Link href={getQuestionListingLink(isExamination)}>
                <Text bold color="primary.base">
                  See All
                </Text>
              </Link>
            </Flex>

            <Grid templateColumns="repeat(5, 1fr)" gap={2}>
              {assessmentManager.assessment?.questions?.map(
                (question, index) => (
                  <ButtonNavItem
                    key={question.id}
                    number={index + 1}
                    isCurrent={questionId === question.id}
                    answered={questionId === question.id}
                    link={getEditQuestionLink(isExamination, question.id)}
                  />
                ),
              )}
              {/* Not created yet — queued via the Question Bank picker while
                  the exam is still pending creation (see pendingCreate.questions).
                  No real id exists for these until the batch is saved, so they
                  link to an edit-in-place view keyed by their queue index
                  instead of a real question id. */}
              {isPendingCreation &&
                pendingCreate?.questions?.map((_, index) => (
                  <ButtonNavItem
                    key={`queued-${index}`}
                    number={
                      (assessmentManager.assessment?.questions?.length || 0) +
                      index +
                      1
                    }
                    answered
                    isCurrent={queuedIndexParam === `${index}`}
                    link={getEditQueuedQuestionLink(isExamination, index)}
                  />
                ))}
            </Grid>
          </Box>
        </Box>
      </Flex>
    </>
  );
};

const ButtonNavItem = ({ number, answered, isCurrent, link, disabled }) => {
  const styleProps = answered
    ? {
        backgroundColor: "primary.base",
        color: "white",
        borderColor: "transparent",
      }
    : { borderColor: "primary.base" };

  const content = (
    <Flex
      flexDirection={{ base: "column", md: "column", lg: "row" }}
      justifyContent={{ base: "flex-start", md: "flex-start", lg: "center" }}
      boxSize="40px"
      rounded="4px"
      alignItems="center"
      as={disabled ? undefined : "button"}
      cursor={disabled ? "default" : "pointer"}
      transition=".1s"
      border={isCurrent ? "2px" : "1px"}
      transform={isCurrent && "scale(1.05)"}
      {...styleProps}
    >
      <Text bold as="level1">
        {number}
      </Text>
    </Flex>
  );

  // Queued-but-not-yet-created questions have no real id/route to link to.
  if (disabled) return content;

  return <Link href={link}>{content}</Link>;
};

const useQuestionDetails = (assessmentManager) => {
  const [question, setQuestion] = useState(null);
  const questionId = useQueryParams().get("question");

  const getQuestions = useCallback(() => {
    if (assessmentManager?.assessment?.questions) {
      let index;
      const found = assessmentManager.assessment.questions.find((q, i) => {
        if (q.id === questionId) {
          index = i;
          return true;
        }
        return false;
      });
      if (found) setQuestion({ ...found, index });
    }
  }, [assessmentManager.assessment?.questions, questionId]);

  useEffect(() => {
    getQuestions();
  }, [getQuestions]);

  const toast = useToast();
  useEffect(() => {
    if (assessmentManager.error) {
      toast.closeAll();
      toast({
        description: capitalizeFirstLetter(
          "There was an error filling the form, reload the page!",
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
  const isExamination = useQueryParams().get("examination");
  const questionId = useQueryParams().get("question");
  const isEditMode = useQueryParams().get("edit") === "true";
  const submitForApproval = useQueryParams().get("submitForApproval") === "1";
  const queuedIndexParam = useQueryParams().get("queuedIndex");
  const isSuperAdmin = useIsSuperAdmin();

  const isExistingQuestion = questionId && questionId !== "new";
  // Nothing was created when "Next" was clicked on the details form — this
  // is the first question, and saving it is also what creates the exam
  // (and, for instructors, what the approval modal gates).
  const isPendingCreation = submitForApproval && !isExistingQuestion && !isEditMode;
  const pendingCreate = useAssessmentStore((s) => s.pendingCreate);
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const isBankPickerOpen = useAssessmentStore((s) => s.isBankPickerOpen);
  const closeBankPicker = useAssessmentStore((s) => s.closeBankPicker);
  const fromBankQuestionIds = pendingCreate?.fromBankQuestionIds;

  // Clicking a queued (bank-added, not-yet-created) tile in "List Of
  // Questions" lands here with `queuedIndex` instead of a real `question`
  // id — there is no real id until the whole batch is saved on submit.
  const queuedIndex =
    isPendingCreation && queuedIndexParam !== null && queuedIndexParam !== ""
      ? Number(queuedIndexParam)
      : null;
  const queuedItem = queuedIndex !== null ? pendingCreate?.questions?.[queuedIndex] : null;
  const isEditingQueued = queuedIndex !== null && !!queuedItem;
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const [createdSuccess, setCreatedSuccess] = useState(null);
  const pendingCreateBothRef = useRef(null);
  const createdParentRef = useRef(null);
  const addAnotherRef = useRef(false);

  // How many questions this exam was configured for — read from the
  // not-yet-created details form while pending, or the real record once
  // it exists (the fetched record calls this field `questionCount`).
  const amountOfQuestions =
    Number(
      pendingCreate?.body?.amountOfQuestions ??
        assessmentManager.assessment?.questionCount ??
        assessmentManager.assessment?.amountOfQuestions,
    ) || null;

  const buildRealQuestionRoute = (realParentId, { listing }) => {
    const finalExamination = realParentId ?? isExamination;
    return listing
      ? getQuestionListingLink(finalExamination)
      : `/admin/standalone-exams/questions/?examination=${finalExamination}`;
  };

  const goToQuestionListing = (realParentId) => {
    // Only clear here, on the way out — clearing as soon as creation
    // succeeds would wipe `pendingCreate` while the success modal for a
    // super admin is still showing, tripping the "details were lost" guard
    // above on content that was, in fact, just saved successfully.
    clearPendingCreate();
    push(buildRealQuestionRoute(realParentId, { listing: true }));
  };

  const goToAddAnotherQuestion = (realParentId) => {
    clearPendingCreate();
    push(buildRealQuestionRoute(realParentId, { listing: false }));
  };

  // After a question is saved: if this exam was set up for more than one
  // question, offer to add another right away instead of always dropping
  // straight to the question list.
  const finishSaving = (realParentId) => {
    if (amountOfQuestions > 1) {
      setCreatedSuccess({ realParentId });
    } else {
      goToQuestionListing(realParentId);
    }
  };

  // Creates the exam that "Next" deferred, using the details form values
  // held in `pendingCreate`. Called from inside the approval modal's
  // `onCreate` — this is the first thing that ever gets saved. Creation is
  // a separate endpoint from approval submission, so no supervisor field
  // is sent here; the supervisor is only attached on the later workflow
  // submit call.
  const performCreateParent = async () => {
    const { body, paperConfigBody, addToBank: parentAddToBank } = pendingCreate;
    const { examination } = await adminCreateStandaloneExamination(body);
    await updateExamPaperConfig(examination.id, paperConfigBody);
    if (parentAddToBank) setAutoAddToBank("standalone", examination.id);
    setAssessment({ ...examination, sections: paperConfigBody?.configuredSections || [] });
    return { id: examination.id };
  };

  const withRealParentId = (body, realParentId) => ({
    ...body,
    standAloneExaminationId: realParentId,
  });

  const { question, isLoading, error } = useQuestionDetails(assessmentManager);

  const [tabIndex, setTabIndex] = useState(0);
  const questionType = QUESTION_TYPES[tabIndex];

  const [answer, setAnswer] = useState("");
  const [matchingPairs, setMatchingPairs] = useState([{ left: "", right: "" }]);
  const [acceptVariants, setAcceptVariants] = useState([]);
  const [variantInput, setVariantInput] = useState("");
  const [markingType, setMarkingType] = useState("automatic");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm();
  const questionRichTextManager = useRichText();
  const questionImageManager = useUpload();

  // ── Add this question to the Question Bank on save ─────────────────────
  const [addToBank, setAddToBank] = useState(false);
  const autoAddToBank = isAutoAddToBank("standalone", isExamination);

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
      const params = { limit: 10 };
      if (bankSearch) params.search = bankSearch;
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
  }, [bankSearch]);

  useEffect(() => {
    if (useBank) searchBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useBank]);

  // The option/answer fields only exist in the DOM once the tab has actually
  // switched (e.g. FillBlank's field isn't rendered while MCQ's tab is still
  // active), so setting them can't happen in the same synchronous call as
  // `setTabIndex` — it has to wait for the re-render that follows. Stash the
  // bank question here and let the `[bankApplyKey]` effect below fill in the
  // type-specific fields once that render has actually happened.
  const pendingBankApplyRef = useRef(null);

  const applyBankQuestion = (bankQuestion) => {
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType];
    if (!mappedType) return;

    pendingBankApplyRef.current = bankQuestion;
    questionRichTextManager.handleInitData(bankQuestion.question);
    setBankApplyKey((k) => k + 1);
    setUseBank(false);
    setTabIndex(QUESTION_TYPES.indexOf(mappedType));
  };

  useEffect(() => {
    const bankQuestion = pendingBankApplyRef.current;
    if (!bankQuestion) return;
    pendingBankApplyRef.current = null;
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType];
    if (!mappedType) return;

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
    }

    toast({
      description: "Question loaded from the bank — review and edit before saving",
      position: "top",
      status: "info",
    });
    // `bankApplyKey` (not the tab index) is the trigger: it changes on every
    // apply even when the picked question's type matches the current tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankApplyKey]);

  // ── Editing a queued (bank-added, not-yet-created) question ─────────────
  // Clicking a queued tile in "List Of Questions" lands here with
  // `queuedIndex` instead of a real question id. Hydrate the form from that
  // queue entry's already-built payload (same shape `onSubmit` writes when
  // saving it back), reusing the same tab-switch-then-fill trick as the bank
  // apply flow above.
  const pendingQueuedApplyRef = useRef(null);
  const appliedQueuedIndexRef = useRef(null);

  useEffect(() => {
    if (!isEditingQueued) {
      appliedQueuedIndexRef.current = null;
      return;
    }
    if (appliedQueuedIndexRef.current === queuedIndex) return;
    appliedQueuedIndexRef.current = queuedIndex;

    const qData = queuedItem.data;
    pendingQueuedApplyRef.current = qData;
    questionRichTextManager.handleInitData(qData.question);
    setBankApplyKey((k) => k + 1);
    setMarkingType(qData.markingType || "automatic");
    setSelectedSectionId(qData.section || "");

    if (qData.questionType === "FillBlank") {
      setTabIndex(QUESTION_TYPES.indexOf("FillBlank"));
    } else if (
      Array.isArray(qData.options) &&
      qData.options.length === 2 &&
      qData.options.every((o) => o.option === "True" || o.option === "False")
    ) {
      setTabIndex(QUESTION_TYPES.indexOf("TrueFalse"));
    } else {
      setTabIndex(QUESTION_TYPES.indexOf("MCQ"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingQueued, queuedIndex]);

  useEffect(() => {
    const qData = pendingQueuedApplyRef.current;
    if (!qData) return;
    pendingQueuedApplyRef.current = null;

    if (Array.isArray(qData.options) && qData.options.length) {
      qData.options.forEach((o) => setValue(`option-${o.optionIndex}`, o.option));
      const correct = qData.options.find((o) => o.isAnswer);
      if (correct) setAnswer(String(correct.optionIndex));
    } else if (qData.questionType === "FillBlank") {
      setValue("correctAnswer", qData.correctAnswer || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankApplyKey]);

  // Arrived here straight from the Question Bank via "Next" on the details
  // form — prefill this first question from the bank item the admin picked,
  // same mapping as manually applying a bank question above.
  // ── Queue Question Bank items directly into pendingCreate/pendingEdit —
  // used both by the plural fromBankQuestionIds hand-off below and by the
  // "Question Bank" multi-select modal opened mid-creation.
  const buildQueuedItemFromBankQuestion = (bankQuestion) => {
    const mappedType = BANK_TYPE_TO_FORM_TYPE[bankQuestion.questionType];
    if (!mappedType) {
      toast({
        description: `Skipped "${bankQuestion.question}" — this question type isn't supported here.`,
        position: "top",
        status: "warning",
      });
      return null;
    }

    const isObjective = mappedType === "MCQ" || mappedType === "TrueFalse";
    const options = isObjective
      ? mappedType === "TrueFalse"
        ? ["True", "False"].map((label, idx) => ({
            option: label,
            isAnswer: bankQuestion.correctAnswer === label,
            optionIndex: idx + 1,
          }))
        : (bankQuestion.options || []).map((o, idx) => ({
            option: o.text,
            isAnswer: !!o.isCorrect,
            optionIndex: idx + 1,
          }))
      : [];

    const sectionTitle = selectedSectionId || undefined;
    const typeSpecificFields = isObjective
      ? { options }
      : { questionType: "FillBlank", correctAnswer: bankQuestion.correctAnswer || "" };

    const data = {
      standAloneExaminationId: isExamination,
      question: bankQuestion.question,
      ...(sectionTitle && { section: sectionTitle }),
      markingType: "automatic",
      ...typeSpecificFields,
    };

    return { data };
  };

  const queueBankQuestions = (bankQuestions) => {
    const items = bankQuestions.map(buildQueuedItemFromBankQuestion).filter(Boolean);
    if (!items.length) return;

    if (isPendingCreation) {
      setPendingCreate({ ...pendingCreate, questions: [...(pendingCreate.questions || []), ...items] });
    }

    toast({
      description: `${items.length} question${items.length === 1 ? "" : "s"} added from the bank. They'll be created once you submit for approval.`,
      position: "top",
      status: "success",
    });
  };

  const appliedFromBankRef = useRef(false);
  useEffect(() => {
    if (!isPendingCreation || !fromBankQuestionIds?.length || appliedFromBankRef.current) return;
    appliedFromBankRef.current = true;
    Promise.all(fromBankQuestionIds.map((id) => getExamQuestionBankItem(id).then((res) => res?.data ?? res)))
      .then((bankQuestions) => {
        applyBankQuestion(bankQuestions[0]);
        if (bankQuestions.length > 1) queueBankQuestions(bankQuestions.slice(1));
      })
      .catch((err) => {
        console.error("[QuestionsStandalone] failed to load bank questions for prefill", fromBankQuestionIds, err?.response?.data ?? err);
        toast({ description: "Couldn't load the picked question(s) from the bank", position: "top", status: "error" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingCreation, fromBankQuestionIds]);

  // Hydrate form when editing an existing question
  useEffect(() => {
    if (!question) return;
    if (question.markingType) setMarkingType(question.markingType);
    if (question.section) setSelectedSectionId(question.section);

    // Detect question type: prefer the explicit field, fall back to shape-sniffing
    // for questions saved before questionType was sent.
    if (question.questionType && QUESTION_TYPES.includes(question.questionType)) {
      setTabIndex(QUESTION_TYPES.indexOf(question.questionType));
    } else if (question.pairs?.length) {
      setTabIndex(QUESTION_TYPES.indexOf("Matching"));
    } else if (question.correctAnswer && !question.options?.length) {
      setTabIndex(QUESTION_TYPES.indexOf("FillBlank"));
    } else if (question.options?.length === 2) {
      setTabIndex(1); // TrueFalse
    } else {
      setTabIndex(0); // MCQ default
    }

    [1, 2, 3, 4].forEach((num) => {
      const opt = question.options?.find((o) => o.optionIndex === num);
      if (opt) setValue(`option-${num}`, opt.name ?? opt.option ?? "");
    });

    const correct = question.options?.find((o) => o.isAnswer);
    if (correct) setAnswer(`${correct.optionIndex}`);

    if (question.correctAnswer) setValue("correctAnswer", question.correctAnswer);
    if (Array.isArray(question.acceptVariants) && question.acceptVariants.length > 0) {
      setAcceptVariants(question.acceptVariants);
    }
    if (Array.isArray(question.pairs) && question.pairs.length > 0) {
      setMatchingPairs(question.pairs);
    }

    questionRichTextManager.handleInitData(question.question);
    // MUIRichTextEditor only reads defaultValue on mount, so force a
    // remount (same trick applyBankQuestion uses) to pick up the loaded text.
    setBankApplyKey((k) => k + 1);

    questionImageManager.handleInitialImageSelect(question.file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (tabIndex === 1) {
      setValue("option-1", "True");
      setValue("option-2", "False");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  const handleAddPair = () =>
    setMatchingPairs((p) => [...p, { left: "", right: "" }]);
  const handleRemovePair = (idx) =>
    setMatchingPairs((p) => p.filter((_, i) => i !== idx));
  const handlePairChange = (idx, side, value) =>
    setMatchingPairs((p) =>
      p.map((pair, i) => (i === idx ? { ...pair, [side]: value } : pair)),
    );

  const handleAddVariant = () => {
    const variant = variantInput.trim();
    if (variant && !acceptVariants.includes(variant)) {
      setAcceptVariants((prev) => [...prev, variant]);
    }
    setVariantInput("");
  };
  const handleRemoveVariant = (variant) =>
    setAcceptVariants((prev) => prev.filter((v) => v !== variant));

  const onSubmit = async (data) => {
    try {
      // ── Delete mode ──
      if (isExistingQuestion && !isEditMode) {
        if (!window.confirm("Are you sure you want to delete this question?"))
          return;
        const { message } = await adminDeleteStandaloneExaminationQuestion(
          question.id,
        );
        toast({
          description: capitalizeFirstLetter(message || "Question deleted"),
          position: "top",
          status: "success",
        });
        assessmentManager.handleFetch(true);
        push(getQuestionListingLink(isExamination));
        return;
      }

      // ── Validate question text ──
      const questionPlainText = questionRichTextManager.getPlainText().trim();
      if (!questionPlainText) throw new Error("Question text is required");

      const sectionTitle = selectedSectionId || undefined;
      const isObjectiveType =
        questionType === "MCQ" || questionType === "TrueFalse";

      // ── Build options ──
      let options = [];
      if (isObjectiveType) {
        options = buildOptions({ ...data, answer });
        if (questionType === "TrueFalse") options = options.slice(0, 2);
        if (!options.find((o) => o.isAnswer))
          throw new Error("Please select the correct answer");
      } else if (questionType === "Matching") {
        if (matchingPairs.some((p) => !p.left.trim() || !p.right.trim()))
          throw new Error("All matching pairs must have both values filled");
      }

      const maybeAddToBank = async (forceAdd) => {
        if (isEditMode || !(addToBank || autoAddToBank || forceAdd)) return;
        const bankType = FORM_TYPE_TO_BANK_TYPE[questionType];
        if (!bankType) {
          toast({
            description: "This question type isn't supported by the Question Bank yet",
            position: "top",
            status: "warning",
          });
          return;
        }
        let bankPayload;
        try {
          bankPayload = {
            question: questionPlainText,
            questionType: bankType,
            marks: 1,
            difficultyLevel: "Medium",
            status: "draft",
          };
          if (isObjectiveType) {
            const bankOptions = options.map((o) => ({
              text: o.option ?? o.name ?? "",
              isCorrect: !!o.isAnswer,
            }));
            bankPayload.options = bankOptions.filter((o) => o.text);
            bankPayload.correctAnswer =
              bankOptions.find((o) => o.isCorrect)?.text ?? "";
          } else if (questionType === "FillBlank") {
            bankPayload.correctAnswer = data.correctAnswer || "";
          }
          await createExamQuestionBankItem(bankPayload);
        } catch (bankErr) {
          console.error("[QuestionsStandalone] failed to add question to bank", bankPayload, bankErr?.response?.data ?? bankErr);
          toast({
            description:
              bankErr?.response?.data?.message ||
              "Question saved, but failed to add it to the Question Bank",
            position: "top",
            status: "warning",
          });
        }
      };

      // ── Type-specific fields (FillBlank/Matching need explicit questionType
      // since they carry neither `options` nor an inferable shape) ──
      const typeSpecificFields = isObjectiveType
        ? { options }
        : questionType === "FillBlank"
          ? {
              questionType: "FillBlank",
              correctAnswer: data.correctAnswer,
              ...(acceptVariants.length > 0 && { acceptVariants }),
            }
          : questionType === "Matching"
            ? { questionType: "Matching", pairs: JSON.stringify(matchingPairs) }
            : {};

      // ── Editing a queued (bank-added, not-yet-created) question in place ──
      // Nothing to save to the backend yet — just overwrite this slot in
      // `pendingCreate.questions` and go back to a blank pending-creation form.
      if (isEditingQueued) {
        const updatedData = {
          standAloneExaminationId: isExamination,
          question: questionPlainText,
          ...(sectionTitle && { section: sectionTitle }),
          markingType,
          ...typeSpecificFields,
        };
        const updatedQuestions = (pendingCreate.questions || []).map((q, i) =>
          i === queuedIndex ? { ...q, data: updatedData } : q,
        );
        setPendingCreate({ ...pendingCreate, questions: updatedQuestions });
        toast({
          description: "Queued question updated",
          position: "top",
          status: "success",
        });
        push(`/admin/standalone-exams/questions/?examination=${isExamination}&submitForApproval=1`);
        return;
      }

      // ── Build payload ──
      // `overrideData` lets a question queued earlier (e.g. from the
      // multi-select Question Bank picker) be saved here instead of this
      // render's own form data.
      const saveQuestion = async (realParentId, overrideData) => {
        if (isEditMode) {
          const body = {
            questionId,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...typeSpecificFields,
          };
          return adminEditStandaloneExaminationQuestion(body);
        }
        const baseBody =
          overrideData || {
            standAloneExaminationId: isExamination,
            question: questionPlainText,
            ...(sectionTitle && { section: sectionTitle }),
            markingType,
            ...typeSpecificFields,
          };
        const body = isPendingCreation ? withRealParentId(baseBody, realParentId) : baseBody;
        return adminCreateStandaloneExaminationQuestion(body);
      };

      if (isPendingCreation) {
        // Nothing exists yet. "createBoth" is the single unit of work that
        // actually saves anything — hand it to the approval modal so the
        // assigned supervisor (or an explicit null, for super admin) is
        // what triggers it.
        const createBoth = async () => {
          const parent = await performCreateParent();
          createdParentRef.current = parent;
          // Questions queued via the Question Bank picker while this exam
          // was still pending — created alongside the one on this form.
          for (const queued of pendingCreate.questions || []) {
            await saveQuestion(parent.id, queued.data);
          }
          await saveQuestion(parent.id);
          // The exam-level "auto add every question" flag was just set on
          // the real ID above — the render-scoped `autoAddToBank` above is
          // still stale for this same call, so check the source directly.
          await maybeAddToBank(pendingCreate.addToBank);
          return { id: parent.id };
        };

        pendingCreateBothRef.current = createBoth;
        setWorkflowContent({
          contentTitle: pendingCreate.title,
          requestType: "StandaloneExam",
        });
        setWorkflowModalOpen(true);
        return;
      }

      await saveQuestion();
      await maybeAddToBank();

      toast({
        description: "Question saved successfully",
        position: "top",
        status: "success",
      });
      reset();
      assessmentManager.handleFetch(true);

      if (isEditMode) {
        push(getEditQuestionLink(isExamination, questionId));
      } else {
        finishSaving();
      }
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  if (createdSuccess) {
    return (
      <Box padding={10} textAlign="center" width="70%">
        <Text bold fontSize="lg" mb={2}>
          Question added successfully!
        </Text>
        <Text color="gray.500" mb={6}>
          This exam is set for {amountOfQuestions} questions — add the rest
          now, or come back to it later.
        </Text>
        <Flex gap={4} justifyContent="center">
          <Button
            onClick={() => goToAddAnotherQuestion(createdSuccess.realParentId)}
          >
            Add more questions
          </Button>
          <Button
            secondary
            onClick={() => goToQuestionListing(createdSuccess.realParentId)}
          >
            Done for now
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      padding={6}
      width={{ base: "100%", md: "100%", lg: "70%" }}
    >
      {/* ── Question text + image ── */}
      <Box
        paddingTop="20px"
        paddingX="20px"
        paddingBottom="40px"
        backgroundColor="white"
      >
        <Heading fontSize="22px" mb={6} color="#1A202C">
          {getQuestionNumber(
            question && questionId
              ? question.index
              : isEditingQueued
                ? (assessmentManager.assessment?.questions?.length || 0) + queuedIndex
                : assessmentManager.assessment?.questions?.length,
          )}
        </Heading>

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
            label="Question"
            placeholder="Enter your question here..."
            onChange={questionRichTextManager.handleChange}
            defaultValue={questionRichTextManager.data.default}
          />
        )}

        <Box marginTop={8} bg="#F7FAFC" p={4} borderRadius="8px">
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

      {/* ── Read-only summary (view mode) ── */}
      {isExistingQuestion && !isEditMode && (
        <Box marginTop={6} padding={6} backgroundColor="white">
          <Heading fontSize="18px" mb={4} color="#1A202C">
            Question Details
          </Heading>

          <Flex gap={2} mb={5} flexWrap="wrap">
            <Badge bg="#F0E6FF" color="#6b006b" borderRadius="4px" fontSize="11px" textTransform="none" px={2} py={1}>
              {TYPE_LABEL[question?.questionType] ?? question?.questionType ?? "MCQ"}
            </Badge>
            {question?.difficultyLevel && (
              <Badge bg="#F7FAFC" color="gray.500" borderRadius="4px" fontSize="11px" textTransform="none" px={2} py={1}>
                {question.difficultyLevel}
              </Badge>
            )}
            {question?.tags?.map((tag) => (
              <Badge key={tag} bg="#EBF4FF" color="#3182CE" borderRadius="4px" fontSize="11px" textTransform="none" px={2} py={1}>
                {tag}
              </Badge>
            ))}
          </Flex>

          {question?.options?.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="500" mb={2} color="#1A202C">
                Options
              </Text>
              {question.options.map((opt) => (
                <Flex key={opt.id ?? opt.optionIndex} alignItems="center" gap={2} mb={2}>
                  <Box
                    boxSize="16px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={opt.isAnswer ? "#38A169" : "#CBD5E0"}
                    bg={opt.isAnswer ? "#38A169" : "transparent"}
                    flexShrink={0}
                  />
                  <Text fontSize="14px" color={opt.isAnswer ? "#276749" : "#4A5568"} fontWeight={opt.isAnswer ? "600" : "400"}>
                    {opt.name}
                  </Text>
                </Flex>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* ── Settings + Answer Options ── */}
      {(!isExistingQuestion || isEditMode) && (
        <Box marginTop={6} padding={6} backgroundColor="white">
          <Heading fontSize="18px" mb={4} color="#1A202C">
            Question Settings
          </Heading>

          <Box mb={6} pb={4} borderBottom="1px solid #E2E8F0">
            <Flex justifyContent="space-between" alignItems="center" mb={useBank ? 3 : 0}>
              <Text fontSize="sm" fontWeight="600" color="#1A202C">
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
              <Box backgroundColor="#F7FAFC" borderRadius="8px" p={3}>
                <Flex gap={2} mb={3}>
                  <ChakraInput
                    size="sm"
                    bg="white"
                    placeholder="Search bank questions..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchBank()}
                  />
                  <Button size="xs" onClick={searchBank} disabled={bankLoading} type="button">
                    Search
                  </Button>
                </Flex>
                <Stack spacing={2} maxHeight="220px" overflowY="auto">
                  {bankResults.map((bq) => {
                    const supported = Boolean(BANK_TYPE_TO_FORM_TYPE[bq.questionType]);
                    return (
                      <Flex
                        key={bq.id}
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor="white"
                        p={2}
                        borderRadius="6px"
                        border="1px solid #E2E8F0"
                        gap={3}
                      >
                        <Text fontSize="xs" noOfLines={2}>
                          {bq.question}
                        </Text>
                        <Button
                          size="xs"
                          type="button"
                          disabled={!supported}
                          title={!supported ? "Not supported in this form" : undefined}
                          onClick={() => applyBankQuestion(bq)}
                        >
                          Use
                        </Button>
                      </Flex>
                    );
                  })}
                  {!bankLoading && bankResults.length === 0 && (
                    <Text fontSize="xs" color="gray.400">
                      No matching questions found.
                    </Text>
                  )}
                </Stack>
              </Box>
            )}
          </Box>

          <Flex gap={4} mb={6} flexWrap="wrap" alignItems="flex-end">
            {/* Marking Type */}
            <Box minW="180px">
              <Text fontSize="sm" fontWeight="500" mb={1} color="#1A202C">
                Marking Type
              </Text>
              <ChakraSelect
                value={markingType}
                onChange={(e) => setMarkingType(e.target.value)}
                size="sm"
                bg="white"
                borderColor="#E2E8F0"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="hybrid">Hybrid</option>
              </ChakraSelect>
            </Box>

            {/* Section */}
            <Box minW="220px">
              <Flex justifyContent="space-between" alignItems="baseline">
                <Text fontSize="sm" fontWeight="500" mb={1} color="#1A202C">
                  Section{" "}
                  {sectionsLoading && (
                    <Text as="span" fontSize="xs" color="gray.400">
                      (loading…)
                    </Text>
                  )}
                </Text>
                {isExamination && (
                  <Link
                    href={`/admin/exam-paper-config/${isExamination}?examType=standalone_examination`}
                  >
                    <Text fontSize="xs" color="#6b006b">
                      Configure sections
                    </Text>
                  </Link>
                )}
              </Flex>
              <ChakraSelect
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                size="sm"
                bg="white"
                borderColor="#E2E8F0"
                disabled={sectionsLoading || templateSections.length === 0}
                placeholder={
                  sectionsLoading
                    ? "Loading sections…"
                    : templateSections.length === 0
                      ? "No sections available"
                      : "Select a section"
                }
              >
                {templateSections.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </ChakraSelect>
            </Box>
          </Flex>

          <Heading fontSize="18px" mb={4} color="#1A202C">
            Answer Options
          </Heading>

          <Tabs
            colorScheme="purple"
            index={tabIndex}
            onChange={(idx) => {
              setTabIndex(idx);
              setAnswer("");
            }}
          >
            <TabList borderBottom="1px solid #E2E8F0" mb="24px">
              {[
                "Multiple Choice (MCQ)",
                "True / False",
                "Matching",
                "Fill in the Blank",
              ].map((label) => (
                <Tab
                  key={label}
                  _selected={{
                    color: "#6b006b",
                    borderColor: "#6b006b",
                    fontWeight: "bold",
                  }}
                  fontSize="sm"
                >
                  {label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* MCQ */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Select the correct answer
                </Text>
                {[1, 2, 3, 4].map((num) => (
                  <Flex key={num} mb={4} alignItems="center" gap={3}>
                    <input
                      type="radio"
                      name="mcq-answer"
                      value={`${num}`}
                      checked={answer === `${num}`}
                      onChange={(e) => setAnswer(e.target.value)}
                      style={{
                        accentColor: "#6b006b",
                        transform: "scale(1.3)",
                        flexShrink: 0,
                      }}
                    />
                    <Box flex={1}>
                      <Input
                        id={`option-${num}`}
                        label={`Option ${num}`}
                        placeholder={`Enter option ${num}`}
                        {...register(`option-${num}`)}
                      />
                    </Box>
                  </Flex>
                ))}
              </TabPanel>

              {/* True / False */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Select the correct answer
                </Text>
                {["True", "False"].map((label, i) => (
                  <Flex key={label} mb={4} alignItems="center" gap={3}>
                    <input
                      type="radio"
                      name="tf-answer"
                      value={`${i + 1}`}
                      checked={answer === `${i + 1}`}
                      onChange={(e) => setAnswer(e.target.value)}
                      style={{
                        accentColor: "#6b006b",
                        transform: "scale(1.3)",
                        flexShrink: 0,
                      }}
                    />
                    <Box
                      flex={1}
                      border="1px solid #E2E8F0"
                      borderRadius="6px"
                      px={4}
                      py={3}
                      bg="white"
                    >
                      <Text fontWeight="500">{label}</Text>
                    </Box>
                  </Flex>
                ))}
              </TabPanel>

              {/* Matching */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Add matching pairs (left → right)
                </Text>
                {matchingPairs.map((pair, idx) => (
                  <Flex key={idx} gap={3} mb={4} alignItems="flex-end">
                    <Box flex={1}>
                      <Input
                        label={`Left ${idx + 1}`}
                        placeholder="e.g. H₂O"
                        value={pair.left}
                        onChange={(e) =>
                          handlePairChange(idx, "left", e.target.value)
                        }
                      />
                    </Box>
                    <Box color="#6b006b" pb={2}>
                      <FaArrowRight />
                    </Box>
                    <Box flex={1}>
                      <Input
                        label={`Right ${idx + 1}`}
                        placeholder="e.g. Water"
                        value={pair.right}
                        onChange={(e) =>
                          handlePairChange(idx, "right", e.target.value)
                        }
                      />
                    </Box>
                    {matchingPairs.length > 1 && (
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
                <Button ghost onClick={handleAddPair} type="button" mt={2}>
                  + Add Pair
                </Button>
              </TabPanel>

              {/* Fill in the Blank */}
              <TabPanel p={0}>
                <Text pb={4} color="gray.500">
                  Provide the correct answer for the blank
                </Text>
                <Input
                  label="Correct Answer"
                  isRequired
                  placeholder="e.g. Paris"
                  error={errors.correctAnswer?.message}
                  {...register("correctAnswer", {
                    required:
                      questionType === "FillBlank"
                        ? "Correct answer is required"
                        : false,
                  })}
                />

                <Box mt={4}>
                  <Text fontSize="13px" fontWeight="500" color="#1A202C" mb={2}>
                    Accepted Answer Variants (optional)
                  </Text>
                  <Flex gap={2} mb={3}>
                    <Box flex={1}>
                      <Input
                        placeholder="e.g. paris (alternate spelling/case)"
                        value={variantInput}
                        onChange={(e) => setVariantInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddVariant();
                          }
                        }}
                      />
                    </Box>
                    <Button ghost onClick={handleAddVariant} type="button">
                      <Flex alignItems="center" gap="6px">
                        <FaPlus size="11px" /> Add
                      </Flex>
                    </Button>
                  </Flex>
                  {acceptVariants.length > 0 && (
                    <Wrap spacing="8px">
                      {acceptVariants.map((variant) => (
                        <WrapItem key={variant}>
                          <Tag size="md" borderRadius="full" variant="solid" bg="#6b006b" color="white">
                            <TagLabel>{variant}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveVariant(variant)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Add to Question Bank — only offered while creating a brand-new question */}
          {!isExistingQuestion && !isEditingQueued && (
            <Box borderTop="1px solid #E2E8F0" pt={4} mt={6}>
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
      )}

      {/* ── Buttons ── */}
      <Flex justifyContent="flex-end" paddingTop={8} gap={3}>
        {isExistingQuestion && !isEditMode && (
          <Button
            onClick={() =>
              push(
                getEditQuestionLink(isExamination, questionId) + "&edit=true",
              )
            }
            type="button"
          >
            Edit Question
          </Button>
        )}
        {isEditMode && (
          <Button
            ghost
            onClick={() => push(getEditQuestionLink(isExamination, questionId))}
            type="button"
          >
            Cancel
          </Button>
        )}
        {isEditingQueued && (
          <Button
            ghost
            onClick={() =>
              push(`/admin/standalone-exams/questions/?examination=${isExamination}&submitForApproval=1`)
            }
            type="button"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          onClick={() => {
            addAnotherRef.current = false;
          }}
          disabled={isLoading || isSubmitting || error}
          isLoading={isLoading || isSubmitting}
          leftIcon={isExistingQuestion && !isEditMode ? <FaTrash /> : null}
        >
          {isExistingQuestion && !isEditMode
            ? "Delete Question"
            : isEditMode
              ? "Update Question"
              : isEditingQueued
                ? "Save Changes"
                : isPendingCreation
                  ? "Create and Submit"
                  : "Add Question"}
        </Button>
        {isPendingCreation && !isEditingQueued && (
          <Button
            type="submit"
            ghost
            onClick={() => {
              addAnotherRef.current = true;
            }}
            disabled={isLoading || isSubmitting || error}
            isLoading={isLoading || isSubmitting}
          >
            Add more questions
          </Button>
        )}
        {isEditMode && (
          <Button ghost link={`/admin/standalone-exams/questions/?examination=${isExamination}`}>
            Add Question
          </Button>
        )}
      </Flex>

      {isPendingCreation && workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          onCreate={() => pendingCreateBothRef.current()}
          onSuccess={() => {
            const realParentId = createdParentRef.current?.id;
            if (addAnotherRef.current) {
              addAnotherRef.current = false;
              goToAddAnotherQuestion(realParentId);
            } else {
              finishSaving(realParentId);
            }
          }}
        />
      )}

      {isPendingCreation && (
        <SelectBankQuestionsModal
          isOpen={isBankPickerOpen}
          onClose={closeBankPicker}
          onAdd={queueBankQuestions}
        />
      )}
    </Box>
  );
};

const QuestionListingPage = ({ assessment, isLoading, error }) => {
  const questions = Array.isArray(assessment?.questions)
    ? assessment.questions
    : [];
  const questionsIsEmpty = !isLoading && !error && !questions.length;

  return (
    <Box padding={6} width="70%">
      {isLoading && <PageLoaderLayout height="70%" width="100%" />}

      {questionsIsEmpty && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3}>
            No Questions Yet
          </Heading>
          <Text as="level3" marginBottom={7}>
            Create a new question to get started.
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

      {questions.map((q, index) => (
        <QuestionCard
          key={q.id}
          id={q.id}
          questionNumber={getQuestionNumber(index)}
          question={q.question}
          image={q.file}
          marginBottom={4}
        />
      ))}

      <Box paddingTop={10}>
        <Button
          link={`/admin/standalone-exams/questions/?examination=${assessment?.id}`}
        >
          Add more questions
        </Button>
      </Box>
    </Box>
  );
};

const QuestionCard = ({ questionNumber, question, image, id, ...rest }) => {
  const isExamination = useQueryParams().get("examination");
  const editLink = getEditQuestionLink(isExamination, id);
  const { resource: deleteRequest, handleFetchResource } = useFetch();
  const toast = useToast();

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    handleFetchResource({
      fetcher: async () => {
        await adminDeleteStandaloneExaminationQuestion(id);
        return "Question deleted successfully";
      },
      onError: (err) =>
        toast({ description: err.message, position: "top", status: "error" }),
      onSuccess: (msg) =>
        toast({ description: msg, position: "top", status: "success" }),
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
          bg="rgba(255,255,255,.5)"
        >
          <Flex
            alignItems="center"
            bg="white"
            p={6}
            shadow="md"
            rounded="md"
            w="300px"
            flexDirection="column"
          >
            <Box>
              <Spinner mb={5} />
            </Box>
            Please wait. Deleting…
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
              alt="question"
              width="100%"
              height="400px"
              rounded="md"
            />
          )}
        </Box>
        <Box transform="translateY(-10px)">
          <MoreIconButton editLink={editLink} onDelete={handleDelete} />
        </Box>
      </Flex>
    </>
  );
};

const MoreIconButton = ({ editLink, onDelete }) => {
  const { push } = useHistory();
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
        <MenuItem onClick={() => push(editLink)}>Preview question</MenuItem>
        <MenuItem onClick={() => push(editLink + "&edit=true")}>
          Edit question
        </MenuItem>
        <MenuItem onClick={onDelete} color="red.500">
          Delete question
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

// ── Helpers ──

const getQuestionListingLink = (examinationId) =>
  `/admin/standalone-exams/questions/?examination=${examinationId}&question-listing=true`;

const getEditQuestionLink = (examinationId, questionId) =>
  `/admin/standalone-exams/questions/?examination=${examinationId}&question=${questionId}`;

const getEditQueuedQuestionLink = (examinationId, index) =>
  `/admin/standalone-exams/questions/?examination=${examinationId}&submitForApproval=1&queuedIndex=${index}`;

const getQuestionNumber = (index) =>
  `Question ${index + 1 < 9 ? `0${index + 1}` : index === undefined ? "01" : index + 1}`;

const buildOptions = (data) => {
  const options = [];
  for (const key in data) {
    if (/^option-/.test(key)) {
      const optionText = data[key];
      const optionIndex = +key.replace("option-", "");
      const isAnswer = +data.answer === optionIndex;
      if (optionText)
        options.push({ name: optionText, optionIndex, isAnswer });
    }
  }
  return options;
};

const QuestionsStandaloneRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <QuestionsStandalone {...props} />} />
);

export default QuestionsStandaloneRoute;
