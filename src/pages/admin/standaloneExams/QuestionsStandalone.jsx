import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Input as ChakraInput,
  InputGroup,
  InputRightAddon
} from "@chakra-ui/react";
import {
  useUpload,
  useRichText,
  useFetch,
  useQueryParams,
} from "../../../hooks";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Button, Image, Input, Link, Spinner, Select } from "../../../components";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsCheckCircle } from "react-icons/bs";
import { FaTrash, FaArrowRight } from "react-icons/fa";
import { Route, useHistory, useParams } from "react-router-dom";
import { RichText, RichTextToView, Upload } from "../../../components";
import useAssessmentPreview from "../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import {
  appendFormData,
  capitalizeFirstLetter,
  capitalizeWords,
} from "../../../utils";
import {
  adminCreateAssessmentQuestion,
  adminCreateExaminationQuestion,
  adminCreateStandaloneExaminationQuestion,
  adminDeleteAssessmentQuestion,
  adminDeleteExaminationQuestion,
  adminDeleteStandaloneExaminationQuestion,
  adminEditStandaloneExaminationQuestion,
} from "../../../services";
import { PageLoaderLayout } from "../../../layouts";
import { FiMoreHorizontal } from "react-icons/fi";

const QuestionsStandalone = () => {
  const isQuestionListingPage = useQueryParams().get("question-listing");
  const examinationId = useQueryParams().get("examination");
  const { id: courseId, assessmentId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const questionId = useQueryParams().get("question");

  const isStandaloneExamination = isExamination ? true : false;

  const assessmentManager = useAssessmentPreview(null, examinationId, true);

  return (
    <>
      <Heading fontSize="heading.h3" paddingTop={3} paddingX={6}>
        {!questionId
          ? "Create Standalone Question"
          : "Update Standalone Question"}
      </Heading>

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
          <CreateQuestionPage {...assessmentManager} />
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

              <Link href={getQuestionListingLink(questionId, isExamination)}>
                <Text bold color="primary.base">
                  See All
                </Text>
              </Link>
            </Flex>

            <Grid templateColumns="repeat(5, 1fr)" gap={2}>
              {assessmentManager.assessment?.questions?.map(
                (question, index) => (
                  <>
                    <ButtonNavItem
                      key={index}
                      number={index + 1}
                      isCurrent={questionId === question.id}
                      answered={questionId === question.id}
                      link={getEditQuestionLink(
                        question.id,
                        assessmentManager?.assessment?.id
                      )}
                    />
                  </>
                )
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
  const questionId = useQueryParams().get("question");

  const getQuestions = useCallback(() => {
    if (assessmentManager?.assessment?.questions) {
      let index;

      const question = assessmentManager?.assessment?.questions.find((q, i) => {
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
          "there was an error filling the form, reload the page!"
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

const CreateQuestionPage = (assessmentManager) => {
  const { push } = useHistory();
  const toast = useToast();
  const { id: courseId, assessmentId } = useParams();
  const questionId = useQueryParams().get("question");
  const isExamination = useQueryParams().get("examination");
  const isEditMode = useQueryParams().get("edit") === "true";

  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;

  const isExistingQuestion = questionId && questionId !== "new";

  const { question, isLoading, error } = useQuestionDetails(assessmentManager);
  console.log(question, "quest");
  const [isMultipleChoiceOptions, setIsMultipleChoiceOptions] = useState(true);

  const handleMultipleChoiceOptionsToggle = () =>
    setIsMultipleChoiceOptions((prev) => !prev);

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm();
  const [answer, setAnswer] = useState();

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };
  const questionRichTextManager = useRichText();

  useEffect(() => {
    if (question) {
      const option1 = question.options.find((opt) => opt.optionIndex === 1);

      setValue("option-1", !isMultipleChoiceOptions ? "True" : option1.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, isMultipleChoiceOptions]);

  useEffect(() => {
    if (!isMultipleChoiceOptions) {
      setValue("option-1", "True");
      setValue("option-2", "False");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultipleChoiceOptions]);

  useEffect(() => {
    if (question?.options.length === 2) {
      return setIsMultipleChoiceOptions(false);
    }
    setIsMultipleChoiceOptions(true);
  }, [question, question?.options?.length]);

  useEffect(() => {
    if (question) {
      const option2 = question.options.find((opt) => opt.optionIndex === 2);

      setValue("option-2", option2?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);
  useEffect(() => {
    if (question) {
      const option3 = question.options.find((opt) => opt.optionIndex === 3);

      setValue("option-3", option3?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);
  useEffect(() => {
    if (question) {
      const option4 = question.options.find((opt) => opt.optionIndex === 4);

      setValue("option-4", option4?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (question) {
      const optionWithAns = question.options.find((opt) => opt.isAnswer);

      setAnswer(`${optionWithAns?.optionIndex}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const questionImageManager = useUpload();

  // TODO: uncomment for editMode's sake
  useEffect(() => {
    if (question) {
      questionImageManager.handleInitialImageSelect(question?.file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  // const { handleDelete } = useCache();
  const onSubmit = async (data) => {
    try {
      // Handle delete mode (only if not in edit mode)
      if (isExistingQuestion && !isEditMode) {
        const ok = window.confirm(
          "Are you sure you want to delete this question?"
        );

        if (!ok) return;

        const { message } = await adminDeleteStandaloneExaminationQuestion(
          question.id
        );

        toast({
          description: capitalizeFirstLetter(message),
          position: "top",
          status: "success",
        });

        assessmentManager.handleFetch(true);
        push(getQuestionListingLink(isExamination, questionId));
        return;
      }

      // Handle create or edit mode
      const file = questionImageManager.handleGetFileAndValidate(
        "Question Cover",
        true
      );

      const questionText =
        questionRichTextManager.handleGetValueAndValidate("Question");

      console.log(data);

      const options = buildOptions(
        { ...data, answer },
        isStandaloneExamination
      );
      if (!isMultipleChoiceOptions && options?.length === 4) {
        options.pop();
        options.pop();
      }

      // Validate `isAnswer` field
      const hasAnswer = options.find((opt) => opt.isAnswer);
      if (!hasAnswer) throw new Error("Please select an answer");

      // Prepare data for edit or create
      let requestData;

      if (isEditMode) {
        // Edit mode - for standalone examination
        requestData = {
          file,
          question: JSON.stringify({
            id: questionId,
            question: questionText,
            standAloneExaminationId: isExamination,
          }),
          options: JSON.stringify(
            options?.map((opt) => ({
              ...opt,
              id: question?.options.find(
                ({ name }) => (opt.answer || opt.name) === name
              )?.id,
              standAloneExaminationQuestionId: questionId,
            }))
          ),
        };
      } else {
        // Create mode
        requestData = {
          file,
          standAloneExaminationId: isExamination,
          question: questionText,
          options: JSON.stringify(options),
        };
      }

      console.log(JSON.parse(requestData.options));
      const body = appendFormData(requestData);

      const { message } = await (isEditMode
        ? adminEditStandaloneExaminationQuestion(body)
        : adminCreateStandaloneExaminationQuestion(body));

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      // Clean UP input
      reset();

      assessmentManager.handleFetch(true);

      // Navigate appropriately based on mode
      if (isEditMode) {
        // After editing, go back to view mode
        const viewLink = getEditLink(
          questionId,
          isStandaloneExamination,
          isExamination,
          courseId,
          assessmentId
        );
        push(viewLink);
      } else {
        // After creating, go to listing
        push(getQuestionListingLink(isExamination, questionId));
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
        <Heading fontSize="22px" mb={6} color="#1A202C">
          {getQuestionNumber(
            question && questionId !== "new"
              ? question.index
              : assessmentManager.assessment?.questions?.length
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
              label="Question Image/Video"
              onFileSelect={questionImageManager.handleFileSelect}
              imageUrl={questionImageManager.image.url}
              accept={questionImageManager.accept}
              disabled={isExistingQuestion && !isEditMode}
            />
          )}
        </Box>

        <Grid templateColumns="repeat(2, 1fr)" gap={6} marginTop={10}>
          <GridItem>
            <Select
              label="Difficulty Level"
              id="difficulty"
              placeholder="Easy"
              options={[
                { label: "Easy", value: "easy" },
                { label: "Medium", value: "medium" },
                { label: "Hard", value: "hard" },
              ]}
              {...register("difficulty")}
            />
          </GridItem>
          <GridItem>
            <Text fontSize="14px" fontWeight="500" mb="8px" color="#1A202C">Default point</Text>
            <InputGroup size="lg">
              <ChakraInput
                id="defaultPoint"
                defaultValue="10"
                type="number"
                bg="#F7FAFC"
                borderColor="#E2E8F0"
                {...register("defaultPoint")}
              />
              <InputRightAddon bg="transparent" border="none" color="#A0AEC0" paddingRight="4">
                points
              </InputRightAddon>
            </InputGroup>
          </GridItem>
        </Grid>
      </Box>

      <Box marginTop={6} padding={6} backgroundColor="white">
        <Heading fontSize="18px" mb={4} color="#1A202C">Options</Heading>

        <Tabs colorScheme="purple" defaultIndex={2}>
          <TabList borderBottom="1px solid #E2E8F0" mb="24px">
            <Tab _selected={{ color: '#6b006b', borderColor: '#6b006b', fontWeight: "bold" }}>Mutiple Choice (MCQ)</Tab>
            <Tab _selected={{ color: '#6b006b', borderColor: '#6b006b', fontWeight: "bold" }}>True/False</Tab>
            <Tab _selected={{ color: '#6b006b', borderColor: '#6b006b', fontWeight: "bold" }}>Matching</Tab>
            <Tab _selected={{ color: '#6b006b', borderColor: '#6b006b', fontWeight: "bold" }}>Fill in the blank</Tab>
          </TabList>

          <TabPanels>
            {/* MCQ Panel (Hidden/Empty for now layout match) */}
            <TabPanel p={0}></TabPanel>

            {/* T/F Panel */}
            <TabPanel p={0}></TabPanel>

            {/* Matching Panel UI */}
            <TabPanel p={0}>
              <Grid templateColumns="40px 1fr 40px 1fr" gap={4} alignItems="center" mb={4}>
                <Box></Box>
                <Text fontWeight="600" fontSize="14px" color="#1A202C">Column 1</Text>
                <Box></Box>
                <Text fontWeight="600" fontSize="14px" color="#1A202C">Column 2</Text>

                {/* Row 1 */}
                <Flex justifyContent="center">
                  <input type="radio" style={{ accentColor: '#6b006b', transform: 'scale(1.5)' }} defaultChecked />
                </Flex>
                <ChakraInput size="lg" placeholder="Option 1" defaultValue="Option 1" bg="white" borderColor="#E2E8F0" />
                <Flex justifyContent="center"><Icon as={FaArrowRight} color="#6b006b" /></Flex>
                <ChakraInput size="lg" placeholder="Answer" defaultValue="Answer" bg="white" borderColor="#E2E8F0" />

                {/* Row 2 */}
                <Flex justifyContent="center">
                  <input type="radio" style={{ accentColor: '#6b006b', transform: 'scale(1.5)' }} />
                </Flex>
                <ChakraInput size="lg" placeholder="Option 2" defaultValue="Option 2" bg="white" borderColor="#E2E8F0" />
                <Flex justifyContent="center"><Icon as={FaArrowRight} color="#6b006b" /></Flex>
                <ChakraInput size="lg" placeholder="Answer" defaultValue="Answer" bg="white" borderColor="#E2E8F0" />

                {/* Row 3 */}
                <Flex justifyContent="center">
                  <input type="radio" style={{ accentColor: '#6b006b', transform: 'scale(1.5)' }} />
                </Flex>
                <ChakraInput size="lg" placeholder="Option 3" defaultValue="Option 3" bg="white" borderColor="#E2E8F0" />
                <Flex justifyContent="center"><Icon as={FaArrowRight} color="#6b006b" /></Flex>
                <ChakraInput size="lg" placeholder="Answer" defaultValue="Answer" bg="white" borderColor="#E2E8F0" />

                {/* Row 4 */}
                <Flex justifyContent="center">
                  <input type="radio" style={{ accentColor: '#6b006b', transform: 'scale(1.5)' }} />
                </Flex>
                <ChakraInput size="lg" placeholder="Option 4" defaultValue="Option 4" bg="white" borderColor="#E2E8F0" />
                <Flex justifyContent="center"><Icon as={FaArrowRight} color="#6b006b" /></Flex>
                <ChakraInput size="lg" placeholder="Answer" defaultValue="Answer" bg="white" borderColor="#E2E8F0" />
              </Grid>
            </TabPanel>

            {/* Fill blank Panel */}
            <TabPanel p={0}></TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <Flex justifyContent="flex-end" paddingTop={8} gap={3}>
        {isExistingQuestion && !isEditMode && (
          <Button
            onClick={() => {
              const editLink = getEditLink(
                questionId,
                isStandaloneExamination,
                isExamination,
                courseId,
                assessmentId
              );
              push(editLink + "&edit=true");
            }}
          >
            Edit Question
          </Button>
        )}
        {isEditMode && (
          <Button
            onClick={() => {
              const viewLink = getEditLink(
                questionId,
                isStandaloneExamination,
                isExamination,
                courseId,
                assessmentId
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
          leftIcon={isExistingQuestion && !isEditMode && <FaTrash />}
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
  const questions = assessment?.questions;
  console.log(assessment, "hhh");
  const questionsIsEmpty =
    !isLoading && !error && !questions?.length ? true : false;

  return (
    <Box padding={6} width="70%">
      {isLoading && <PageLoaderLayout height="70%" width="100%" />}

      {questionsIsEmpty && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3}>
            No Questions Asked Yet
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

      {questions?.map((q, index) => (
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
  const { id: courseId, assessmentId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const questionId = useQueryParams().get("question");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const editLink = getEditQuestionLink(isExamination, questionId);

  const { resource: deleteRequest, handleFetchResource } = useFetch();
  const toast = useToast();

  const handleDelete = () => {
    const ok = window.confirm("Are you sure you want to delete this question?");
    if (!ok) return;
    console.log(id);

    handleFetchResource({
      fetcher: async () => {
        if (isStandaloneExamination)
          await adminDeleteStandaloneExaminationQuestion(id);
        else if (isExamination) await adminDeleteExaminationQuestion(id);
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
          <MoreIconButton editLink={editLink} onDelete={handleDelete} />
        </Box>
      </Flex>
    </>
  );
};

export const MoreIconButton = ({ editLink, onDelete }) => {
  const { push } = useHistory();

  const handleViewClick = () => {
    push(editLink);
  };

  const handleEditClick = () => {
    push(editLink + "&edit=true");
  };

  return (
    <Menu placement="bottom-end">
      <MenuButton
        padding={2}
        rounded="full"
        _hover={{
          background: "none",
          color: "others.3",
        }}
        _focus={{ border: "none", background: "white" }}
      >
        <FiMoreHorizontal />
      </MenuButton>

      <MenuList position="relative" zIndex={2}>
        <MenuItem onClick={handleViewClick}>Preview question</MenuItem>
        <MenuItem onClick={handleEditClick}>Edit question</MenuItem>
        <MenuItem onClick={onDelete} color="red.500">Delete question</MenuItem>
      </MenuList>
    </Menu>
  );
};
const getQuestionListingLink = (isExamination, questionId) =>
  `/admin/standalone-exams/questions/?examination=${isExamination}&question-listing=true`;

// const getQuestionListingLink = (isExamination, questionId) =>
//   `/admin/standalone-exams/questions/list?question-listing=true/${
//     isExamination ? `examination=${isExamination}` : ''
//   }${questionId ? `&question=${questionId}` : ''}`;

const getEditQuestionLink = (questionId, isExamination) => {
  return `/admin/standalone-exams/questions/${isExamination ? `?examination=${isExamination}` : ""
    }${questionId ? `&question=${questionId}` : ""}`;
};

const getEditLink = (
  questionId,
  isStandaloneExamination,
  isExamination,
  courseId,
  assessmentId
) => {
  return `/admin/standalone-exams/questions/?examination=${isExamination}&question=${questionId}`;
};

const getQuestionNumber = (index) =>
  `Question ${index + 1 < 9 ? `0${index + 1}` : index === undefined ? "01" : index + 1
  }`;

const buildOptions = (data, isStandaloneExamination) => {
  const options = [];

  for (const item in data) {
    if (/option/.test(item)) {
      const name = data[item];
      const optionIndex = +item.replace("option-", "");
      const isAnswer = +data.answer === optionIndex;

      const option = {
        [isStandaloneExamination ? "answer" : "name"]: name,
        isAnswer,
        optionIndex,
      };

      if (isStandaloneExamination)
        Reflect.deleteProperty(option, "optionIndex");

      if (option.name || option.answer) options.push(option);
    }
  }
  console.log(options, "opt");
  return options;
};

const QuestionsStandaloneRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <QuestionsStandalone {...props} />} />
  );
};

export default QuestionsStandaloneRoute;
