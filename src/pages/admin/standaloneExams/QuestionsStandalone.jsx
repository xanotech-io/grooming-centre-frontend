import {
  Box,
  Flex,
  Grid,
  Select as ChakraSelect,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
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
} from "../../../components";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight, FaTrash } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { Route, useHistory } from "react-router-dom";
import { PageLoaderLayout } from "../../../layouts";
import {
  useFetch,
  useQueryParams,
  useRichText,
  useUpload,
} from "../../../hooks";
import {
  adminCreateStandaloneExaminationQuestion,
  adminDeleteStandaloneExaminationQuestion,
  adminEditStandaloneExaminationQuestion,
  adminGetMarkingTemplateById,
  adminGetStandaloneExamTemplateId,
} from "../../../services";
import { buildBatchUploadLink } from "../examQuestionImport/questionRowUtils";
import { capitalizeFirstLetter, capitalizeWords } from "../../../utils";
import useAssessmentPreview from "../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import useAssessmentStore from "../../../store/assessmentStore";

const QUESTION_TYPES = ["MCQ", "TrueFalse", "Matching", "FillBlank"];

const QuestionsStandalone = () => {
  const isQuestionListingPage = useQueryParams().get("question-listing");
  const isExamination = useQueryParams().get("examination");
  const questionId = useQueryParams().get("question");
  const isExistingQuestion = questionId && questionId !== "new";

  const batchUploadLink = buildBatchUploadLink({
    examinationId: isExamination,
    standalone: true,
  });

  const assessmentManager = useAssessmentPreview(null, isExamination, true);

  const storeSections = useAssessmentStore((s) => s.sections);
  const [templateSections, setTemplateSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  useEffect(() => {
    if (!isExamination) return;

    if (storeSections.length > 0) {
      setTemplateSections(storeSections.map((s) => s.name));
      return;
    }

    setSectionsLoading(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExamination, storeSections]);

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
            : !questionId
              ? "Create Standalone Question"
              : "Update Standalone Question"}
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
    : { borderColor: "primary.base" };

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

  const isExistingQuestion = questionId && questionId !== "new";

  const { question, isLoading, error } = useQuestionDetails(assessmentManager);

  const [tabIndex, setTabIndex] = useState(0);
  const questionType = QUESTION_TYPES[tabIndex];

  const [answer, setAnswer] = useState("");
  const [matchingPairs, setMatchingPairs] = useState([{ left: "", right: "" }]);
  const [markingType, setMarkingType] = useState("automatic");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm();
  const questionRichTextManager = useRichText();
  const questionImageManager = useUpload();

  // Hydrate form when editing an existing question
  useEffect(() => {
    if (!question) return;
    if (question.markingType) setMarkingType(question.markingType);
    if (question.section) setSelectedSectionId(question.section);
    // Detect question type from options count
    if (question.options?.length === 2)
      setTabIndex(1); // TrueFalse
    else setTabIndex(0); // MCQ default

    [1, 2, 3, 4].forEach((num) => {
      const opt = question.options?.find((o) => o.optionIndex === num);
      if (opt) setValue(`option-${num}`, opt.name ?? opt.option ?? "");
    });

    const correct = question.options?.find((o) => o.isAnswer);
    if (correct) setAnswer(`${correct.optionIndex}`);

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

      // ── Build payload ──
      let body;
      if (isEditMode) {
        body = {
          questionId,
          question: questionPlainText,
          ...(sectionTitle && { section: sectionTitle }),
          markingType,
          ...(isObjectiveType && { options }),
        };
        await adminEditStandaloneExaminationQuestion(body);
      } else {
        body = {
          standAloneExaminationId: isExamination,
          question: questionPlainText,
          ...(sectionTitle && { section: sectionTitle }),
          markingType,
          ...(isObjectiveType && { options }),
        };
        await adminCreateStandaloneExaminationQuestion(body);
      }

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
        push(getQuestionListingLink(isExamination));
      }
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

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

      {/* ── Settings + Answer Options ── */}
      {(!isExistingQuestion || isEditMode) && (
        <Box marginTop={6} padding={6} backgroundColor="white">
          <Heading fontSize="18px" mb={4} color="#1A202C">
            Question Settings
          </Heading>

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
              <Text fontSize="sm" fontWeight="500" mb={1} color="#1A202C">
                Section{" "}
                {sectionsLoading && (
                  <Text as="span" fontSize="xs" color="gray.400">
                    (loading…)
                  </Text>
                )}
              </Text>
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
                  {...register("correctAnswer", {
                    required: "Correct answer is required",
                  })}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
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
        <Button
          type="submit"
          disabled={isLoading || isSubmitting || error}
          isLoading={isLoading || isSubmitting}
          leftIcon={isExistingQuestion && !isEditMode ? <FaTrash /> : null}
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
          Add New Question
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
        options.push({ option: optionText, optionIndex, isAnswer });
    }
  }
  return options;
};

const QuestionsStandaloneRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <QuestionsStandalone {...props} />} />
);

export default QuestionsStandaloneRoute;
