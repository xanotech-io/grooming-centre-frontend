import { useToast } from "@chakra-ui/toast";
import { Flex, Box, Grid, ButtonGroup } from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Route } from "react-router-dom";
import {
  RichText,
  Input,
  Heading,
  Text,
  Button,
  Link,
  RichTextToView,
  Upload,
  Image,
  Spinner,
} from "../../../../../components";
import { useForm } from "react-hook-form";
import { Stack } from "@chakra-ui/react";
import { useHistory, useParams } from "react-router";
import {
  useRichText,
  useQueryParams,
  useUpload,
  useFetch,
} from "../../../../../hooks";
import {
  capitalizeFirstLetter,
  capitalizeWords,
  appendFormData,
} from "../../../../../utils";
import { FiMoreHorizontal } from "react-icons/fi";
import {
  adminCreateAssessmentQuestion,
  adminCreateExaminationQuestion,
  adminCreateStandaloneExaminationQuestion,
  adminEditAssessmentQuestion,
  adminEditExaminationQuestion,
  adminDeleteAssessmentQuestion,
  adminDeleteExaminationQuestion,
  adminDeleteUploadedQuestion,
  adminUpdateUploadedQuestion,
} from "../../../../../services";
import useAssessmentPreview from "../../../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import { PageLoaderLayout } from "../../../../../layouts";
import { useCallback, useEffect, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";

const QuestionsPage = () => {
  const isQuestionListingPage = useQueryParams().get("question-listing");
  const { id: courseId, assessmentId, questionId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;

  const assessmentManager = useAssessmentPreview(null, assessmentId, true);

  return (
    <>
      <Heading fontSize="heading.h3" paddingTop={3} paddingX={6}>
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

const CreateQuestionPage = (assessmentManager) => {
  const { push } = useHistory();
  const toast = useToast();
  const { id: courseId, assessmentId, questionId } = useParams();
  const isExamination = useQueryParams().get("examination");
  const isEditMode = useQueryParams().get("edit") === "true";
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;

  const isExistingQuestion = questionId && questionId !== "new";
  console.log({ isExistingQuestion, isEditMode });

  const { question, isLoading, error } = useQuestionDetails(assessmentManager);

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
      console.log(option1);

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
  }, [question, question?.options.length]);

  useEffect(() => {
    if (question) {
      const option2 = question.options.find((opt) => opt.optionIndex === 2);

      setValue("option-2", option2.name);
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
          const response = await adminDeleteUploadedQuestion(question.id);
          if (response?.data?.deletePermission === "Not Allowed") {
            throw new Error(
              response?.data?.remarks ||
                response?.message ||
                "Deletion not permitted for standalone examination",
            );
          }
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

      const questionText =
        questionRichTextManager.handleGetValueAndValidate("Question");

      const options = buildOptions(
        { ...data, answer },
        isStandaloneExamination,
      );
      if (!isMultipleChoiceOptions && options.length === 4) {
        options.pop();
        options.pop();
      }

      // Validate `isAnswer` field
      const hasAnswer = options.find((opt) => opt.isAnswer);
      if (!hasAnswer) throw new Error("Please select an answer");

      // Prepare data for edit mode
      if (isEditMode) {
        data = isStandaloneExamination
          ? {
              file,
              question: JSON.stringify({
                id: questionId,
                question: questionText,
                standAloneExaminationId: isExamination,
              }),
              options: JSON.stringify(
                options.map((opt) => ({
                  ...opt,
                  id: question?.options.find(({ name }) => opt.name === name)
                    ?.id,
                  standAloneExaminationQuestionId: questionId,
                })),
              ),
            }
          : isExamination
            ? {
                file,
                question: JSON.stringify({
                  id: questionId,
                  question: questionText,
                  examinationId: isExamination,
                }),
                options: JSON.stringify(
                  options.map((opt) => ({
                    ...opt,
                    id: question?.options.find(({ name }) => opt.name === name)
                      ?.id,
                    examinationQuestionId: questionId,
                  })),
                ),
              }
            : {
                file,
                question: JSON.stringify({
                  id: questionId,
                  question: questionText,
                  assessmentId,
                }),
                options: JSON.stringify(
                  options.map((opt) => ({
                    ...opt,
                    id: question?.options.find(({ name }) => opt.name === name)
                      ?.id,
                    assessmentQuestionId: questionId,
                  })),
                ),
              };
      } else {
        // Create mode
        data = isStandaloneExamination
          ? {
              file,
              standAloneExaminationId: isExamination,
              question: questionText,
              options: JSON.stringify(options),
            }
          : isExamination
            ? {
                file,
                examinationId: isExamination,
                question: questionText,
                options: JSON.stringify(options),
              }
            : {
                file,
                assessmentId,
                question: questionText,
                options: JSON.stringify(options),
              };
      }

      const body = appendFormData(data);

      const response = isEditMode
        ? isStandaloneExamination
          ? await adminUpdateUploadedQuestion(questionId, {
              content: questionText,
              difficultyLevel: "MEDIUM",
              marks: Number(question?.marks || 1),
            })
          : isExamination
            ? await adminEditExaminationQuestion(body)
            : await adminEditAssessmentQuestion(body)
        : isStandaloneExamination
          ? await adminCreateStandaloneExaminationQuestion(body)
          : isExamination
            ? await adminCreateExaminationQuestion(body)
            : await adminCreateAssessmentQuestion(body);

      if (
        isEditMode &&
        isStandaloneExamination &&
        response?.question?.updateStatus === "Not Updated"
      ) {
        throw new Error(
          response?.question?.remarks ||
            response?.message ||
            "Modification cannot be saved for standalone examination",
        );
      }

      const message = response?.message || "Question saved successfully";

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
        // After create, go to listing
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
        <Heading fontSize="heading.h4">Enter the Options</Heading>
        <Text paddingTop={2} paddingBottom={8}>
          Mark the correct option
        </Text>
        {/* <fieldset onChange={setAnswer} id="radio" value={answer}> */}

        <Box borderBottom="1px" borderColor="accent.2" pb={2} mb={5}>
          <ButtonGroup size="xs">
            <Button
              onClick={handleMultipleChoiceOptionsToggle}
              leftIcon={isMultipleChoiceOptions && <BsCheckCircle />}
              ghost={!isMultipleChoiceOptions}
              disabled={isExistingQuestion && !isEditMode}
            >
              Multiple Choices
            </Button>
            <Button
              onClick={handleMultipleChoiceOptionsToggle}
              leftIcon={!isMultipleChoiceOptions && <BsCheckCircle />}
              ghost={isMultipleChoiceOptions}
              disabled={isExistingQuestion && !isEditMode}
            >
              True/False
            </Button>
          </ButtonGroup>
        </Box>

        <Stack direction="column">
          <Flex flexDirection="row" paddingBottom={6}>
            <Flex paddingTop={12} paddingRight={6}>
              <input
                disabled={isExistingQuestion && !isEditMode}
                type="radio"
                checked={answer === "1"}
                onChange={handleAnswerChange}
                name="radio"
                value="1"
                id="radio-1"
              />
            </Flex>
            <Input
              id="option-1"
              label="Option 01"
              {...register("option-1", { required: true })}
              disabled={
                !isMultipleChoiceOptions || (isExistingQuestion && !isEditMode)
              }
              placeholder="Enter the first option here"
            />
          </Flex>
          <Flex flexDirection="row" paddingBottom={6}>
            <Flex paddingTop={12} paddingRight={6}>
              <input
                disabled={isExistingQuestion && !isEditMode}
                type="radio"
                checked={answer === "2"}
                onChange={handleAnswerChange}
                name="radio"
                value="2"
                id="radio-2"
              />
            </Flex>
            <Input
              id="option-2"
              label="Option 02"
              {...register("option-2", { required: true })}
              disabled={
                !isMultipleChoiceOptions || (isExistingQuestion && !isEditMode)
              }
              placeholder="Enter the second option here"
            />
          </Flex>
          {isMultipleChoiceOptions && (
            <>
              <Flex flexDirection="row" paddingBottom={6}>
                <Flex paddingTop={12} paddingRight={6}>
                  <input
                    disabled={isExistingQuestion && !isEditMode}
                    type="radio"
                    checked={answer === "3"}
                    onChange={handleAnswerChange}
                    name="radio"
                    value="3"
                    id="radio-3"
                  />
                </Flex>
                <Input
                  disabled={isExistingQuestion && !isEditMode}
                  id="option-3"
                  label="Option 03"
                  {...register("option-3", { required: true })}
                  placeholder="Enter the third option here"
                />
              </Flex>
              <Flex flexDirection="row" paddingBottom={6}>
                <Flex paddingTop={12} paddingRight={6}>
                  <input
                    disabled={isExistingQuestion && !isEditMode}
                    type="radio"
                    checked={answer === "4"}
                    onChange={handleAnswerChange}
                    name="radio"
                    value="4"
                    id="radio-4"
                  />
                </Flex>
                <Input
                  disabled={isExistingQuestion && !isEditMode}
                  id="option-4"
                  label="Option 04"
                  {...register("option-4", { required: true })}
                  placeholder="Enter the last option here"
                />
              </Flex>
            </>
          )}
        </Stack>
        {/* </fieldset> */}
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

  const questions = assessment?.questions;

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
          link={`/admin/courses/${courseId}/assessment/${assessmentId}/questions/new${
            isExamination ? `?examination=${isExamination}` : ""
          }`}
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
          const response = await adminDeleteUploadedQuestion(id);
          if (response?.data?.deletePermission === "Not Allowed") {
            throw new Error(
              response?.data?.remarks ||
                response?.message ||
                "Deletion not permitted for standalone examination",
            );
          }
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
        [isStandaloneExamination ? "answer" : "name"]: name,
        isAnswer,
        optionIndex,
      };

      if (isStandaloneExamination)
        Reflect.deleteProperty(option, "optionIndex");

      if (option.name || option.answer) options.push(option);
    }
  }

  return options;
};

const QuestionsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <QuestionsPage {...props} />} />;
};

export default QuestionsPageRoute;
