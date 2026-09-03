import { Box, Flex, GridItem } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  DateTimePicker,
  Input,
  Select,
  Spinner,
  Text,
} from "../../../../../components";
import {
  useDateTimePicker,
  useGoBack,
  useQueryParams,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import {
  adminGetMarkingTemplateById,
  adminGetMarkingTemplates,
} from "../../../../../services";
import useAssessmentStore from "../../../../../store/assessmentStore";
import {
  capitalizeFirstLetter,
  capitalizeWords,
  formatDateToISO,
} from "../../../../../utils";
import { MultiSelect } from "react-multi-select-component";
import { useApp } from "../../../../../contexts";
import { Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";

const CreateAssessmentPage = ({ users }) => {
  const { id: courseId, assessmentId } = useParams();

  const isExamination = useQueryParams().get("examination");
  const moduleId = useQueryParams().get("moduleId");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const isModuleAssessment = !isExamination && !isStandaloneExamination && !!moduleId;

  // Number of Questions, Total Marks, and Marking Template are no longer
  // collected on this shell for a plain Assessment — they moved to the
  // Template / Marking Scheme step (TemplatePage.jsx) that "Next" now leads
  // to, mirroring Standalone Exam's own Overview → Template → Questions
  // wizard. The isStandaloneExamination (dead/unreachable) and isExamination
  // ("Exam" kind) paths are untouched — they still collect these fields
  // here exactly as they always have.
  const supportsSectionAuthoring = !isStandaloneExamination && !isExamination;

  const [standaloneExamType, setStandaloneExamType] = useState("departments");
  // const [addToBank, setAddToBank] = useState(false);

  const { push } = useHistory();
  const toast = useToast();
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
  const clearPendingCreate = useAssessmentStore((s) => s.clearPendingCreate);
  const fromBankQuestionIds = useAssessmentStore((s) => s.fromBankQuestionIds);
  const clearFromBankQuestionIds = useAssessmentStore((s) => s.clearFromBankQuestionIds);
  // Captured once on mount: whatever the Question Bank's "use in a new exam"
  // picker left behind belongs to this visit — consume it immediately so a
  // later, unrelated create flow can never pick up a stale value.
  const bankQuestionIdsRef = useRef(fromBankQuestionIds);
  useEffect(() => {
    if (fromBankQuestionIds?.length) clearFromBankQuestionIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `pendingCreate` persists indefinitely (localStorage) and this page is
  // create-only (no edit mode) — without this, an exam abandoned mid-
  // creation leaves its title/questions sitting around forever and silently
  // resurfaces (already pre-loaded questions) the next time this page is
  // visited to create a genuinely new exam/assessment. Cleared
  // unconditionally on every mount — the accepted trade-off is that using
  // the Header's "Overview" tab to go back mid-flow also wipes the
  // in-progress draft, since there's no way to tell the two cases apart.
  useEffect(() => {
    clearPendingCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");
  const [templateSections, setTemplateSections] = useState([]);
  const [retryPolicy, setRetryPolicy] = useState("");

  const usageScope = isStandaloneExamination
    ? "Standalone Exam"
    : isExamination
    ? "Normal Exam"
    : "Assessment";

  useEffect(() => {
    adminGetMarkingTemplates()
      .then(({ templates }) =>
        setMarkingTemplates(templates.filter((t) => t.usageScope === usageScope))
      )
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageScope]);

  useEffect(() => {
    if (!markingTemplateId) { setTemplateSections([]); return; }
    adminGetMarkingTemplateById(markingTemplateId)
      .then(({ template }) =>
        setTemplateSections(Array.isArray(template?.sections) ? template.sections : [])
      )
      .catch(() => setTemplateSections([]));
  }, [markingTemplateId]);

  const {
    state: { metadata },
  } = useApp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleCancel = useGoBack();

  const startTimeManager = useDateTimePicker();
  const endTimeManager = useDateTimePicker();

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");
      const endTime = endTimeManager.handleGetValueAndValidate("End Time");

      if (selectedIDs.length === 0 && isStandaloneExamination)
        throw new Error("Please select at least one User or Department");

      if (!supportsSectionAuthoring && !markingTemplateId)
        throw new Error("A marking template must be selected before creating an assessment or examination.");

      const retryCount = Number(data.retryCount) || 0;
      if (retryCount > 0 && !retryPolicy)
        throw new Error("Please select a retry policy for retries above 0.");

      data = {
        ...data,
        courseId,
        duration: Number(data.duration),
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
        retryCount,
        ...(retryCount > 0 ? { retryPolicy } : {}),
        ...(isModuleAssessment ? { moduleId } : {}),
        // Number of Questions / Total Marks / Marking Template are collected
        // on the Template step (next) for a plain Assessment — only the
        // dead/legacy paths still send them straight from this form.
        ...(!supportsSectionAuthoring && {
          markingTemplateId,
          amountOfQuestions: Number(data.amountOfQuestions),
          totalMarks: Number(data.totalMarks),
        }),
      };

      isStandaloneExamination && Reflect.deleteProperty(data, "courseId");
      const body = isStandaloneExamination
        ? {
            ...data,
            type: standaloneExamType,
            ...(standaloneExamType === "users"
              ? {
                  usersId: selectedIDs.map(({ value }) => value),
                }
              : {
                  departmentIds: selectedIDs.map(({ value }) => value),
                }),
          }
        : data;

      // Nothing is created yet — hold the details in memory and create both
      // the assessment/exam and the first question together once "Create
      // and Submit" is clicked on the question step below.
      setPendingCreate({
        kind: isStandaloneExamination
          ? "StandaloneExam"
          : isExamination
            ? "Exam"
            : "Assessment",
        body,
        markingTemplateId,
        // addToBank: isModuleAssessment ? addToBank : undefined,
        title: data.title,
        fromBankQuestionIds: bankQuestionIdsRef.current,
      });
      const moduleQuery = isModuleAssessment ? `&moduleId=${moduleId}` : "";
      // isStandaloneExamination is dead/unreachable code (kept exactly as it
      // always was — still pushes straight to Questions, unaffected by the
      // new Template step below). isExamination (the live "Exam" kind) and
      // the plain Assessment kind both now go through Template first.
      const nextRoute = isStandaloneExamination
        ? `/admin/courses/${courseId}/assessment/new/questions/new?submitForApproval=1${moduleQuery}`
        : isExamination
          ? `/admin/courses/${courseId}/assessment/${courseId}/template?examination=new&submitForApproval=1`
          : `/admin/courses/${courseId}/assessment/new/template?submitForApproval=1${moduleQuery}`;
      push(nextRoute);
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  const handleStandaloneExamTypeChange = (event) => {
    setStandaloneExamType(event.target.value);
  };

  useEffect(() => {
    if (selectedIDs.length > 0) {
      const content_el = document.querySelector(
        "#form-drop .dropdown-heading-value"
      );

      content_el.innerHTML = "<span></span>";
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIDs.length]);

  return (
    <AdminMainAreaWrapper>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY={14} marginX={6}>
        <Box backgroundColor="white" padding={10}>
          {isStandaloneExamination && (
            <>
              <Box>
                <Flex
                  justifyContent="space-between"
                  flexDirection={{ base: "column", md: "column", lg: "row" }}
                  mb={5}
                  w="400px"
                >
                  <Flex alignItems={"center"}>
                    <input
                      type="radio"
                      checked={standaloneExamType === "departments"}
                      onChange={handleStandaloneExamTypeChange}
                      name="radio"
                      value="departments"
                      id="radio-1"
                    />

                    <Box as="label" htmlFor="radio-1" ml={2}>
                      <Text>By Departments</Text>
                    </Box>
                  </Flex>

                  <Flex alignItems={"center"}>
                    <input
                      type="radio"
                      checked={standaloneExamType === "users"}
                      onChange={handleStandaloneExamTypeChange}
                      name="radio"
                      value="users"
                      id="radio-2"
                    />

                    <Box as="label" htmlFor="radio-2" ml={2}>
                      <Text>By Users</Text>
                    </Box>
                  </Flex>
                </Flex>

                <Box id="form-drop">
                  <Box as="label">
                    <Text as="level2" pb={2}>
                      Choose{" "}
                      {standaloneExamType === "users" ? "Users" : "Departments"}
                    </Text>
                  </Box>

                  <Flex flexWrap="wrap">
                    {selectedIDs.map((item) => (
                      <Tag key={item.value} mr={2} mb={2}>
                        <TagLabel>{item.label}</TagLabel>

                        <TagCloseButton
                          onClick={() => {
                            setSelectedIDs(
                              selectedIDs.filter(
                                (selectedItem) =>
                                  selectedItem.value !== item.value
                              )
                            );
                          }}
                        />
                      </Tag>
                    ))}
                  </Flex>

                  {standaloneExamType === "users" && users.data && (
                    <MultiSelect
                      options={users.data}
                      value={selectedIDs}
                      onChange={setSelectedIDs}
                      labelledBy="Select"
                    />
                  )}

                  {standaloneExamType === "users" && users.loading && (
                    <Spinner />
                  )}

                  {standaloneExamType === "departments" &&
                    metadata?.departments && (
                      <MultiSelect
                        options={metadata?.departments.map((department) => ({
                          value: department.id,
                          label: capitalizeWords(department.name),
                        }))}
                        value={selectedIDs}
                        onChange={setSelectedIDs}
                        labelledBy="Select"
                      />
                    )}

                  {standaloneExamType === "users" && !metadata?.departments && (
                    <Spinner />
                  )}
                </Box>
              </Box>

              <Box
                borderBottom="1px"
                borderColor="accent.1"
                mt={5}
                mb={10}
              ></Box>
            </>
          )}

          <Input
            label={isExamination ? "Examination Title" : "Assessment Title"}
            id="title"
            error={errors.title?.message}
            {...register("title", {
              required: "Title is required",
            })}
          />
          <Box
            display={{ base: "flex", md: "flex", lg: "grid" }}
            flexDirection="column"
            templateColumns="repeat(2, 1fr)"
            gap={10}
            marginY={10}
          >
            <GridItem>
              <DateTimePicker
                id="startTime"
                isRequired
                label="Start date & time"
                value={startTimeManager.value}
                onChange={startTimeManager.handleChange}
              />
            </GridItem>
            <GridItem>
              <DateTimePicker
                id="endTime"
                isRequired
                label="End date & time"
                value={endTimeManager.value}
                onChange={endTimeManager.handleChange}
              />
            </GridItem>
            <GridItem>
              <Input
                label="Duration"
                type="number"
                id="duration"
                placeholder="Enter duration in minutes"
                error={errors.duration?.message}
                {...register("duration", {
                  required: "Please enter duration",
                })}
              />
            </GridItem>

            <GridItem>
              <Input
                label="Retry Attempts"
                type="number"
                id="retryCount"
                placeholder="0"
                error={errors.retryCount?.message}
                {...register("retryCount", {
                  min: { value: 0, message: "Retry attempts cannot be negative" },
                })}
              />
            </GridItem>
            <GridItem>
              <Select
                label="Retry Policy"
                placeholder="Select a retry policy"
                value={retryPolicy}
                onChange={(e) => setRetryPolicy(e.target.value)}
                options={[
                  { label: "Highest Score", value: "highest" },
                  { label: "Latest Attempt", value: "latest" },
                  { label: "Average Score", value: "average" },
                ]}
              />
            </GridItem>

            {!supportsSectionAuthoring && (
              <>
                <GridItem>
                  <Input
                    label="Number of Questions"
                    type="number"
                    id="amountOfQuestions"
                    placeholder="Enter number of questions"
                    error={errors.amountOfQuestions?.message}
                    {...register("amountOfQuestions", {
                      required: "Please enter number of questions",
                    })}
                  />
                </GridItem>
                <GridItem>
                  <Input
                    label="Total Marks"
                    type="number"
                    id="totalMarks"
                    placeholder="e.g. 100"
                    error={errors.totalMarks?.message}
                    {...register("totalMarks", {
                      required: "Please enter total marks",
                    })}
                  />
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 2 }}>
                  <Select
                    label="Marking Template"
                    placeholder="Select a marking template"
                    isRequired
                    value={markingTemplateId}
                    onChange={(e) => setMarkingTemplateId(e.target.value)}
                    options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
                  />
                </GridItem>

                {templateSections.length > 0 && (
                  <GridItem colSpan={{ base: 1, lg: 2 }}>
                    <Select
                      label="Sections"
                      placeholder="— Sections in this template —"
                      options={templateSections.map((s) => ({ label: s.name, value: s.name }))}
                      disabled
                    />
                    <Flex flexWrap="wrap" gap={2} mt={3}>
                      {templateSections.map((s) => (
                        <Box
                          key={s.name}
                          px={3}
                          py={1}
                          borderRadius="md"
                          border="1px"
                          borderColor="primary.base"
                          fontSize="sm"
                        >
                          <Text bold color="primary.base">{s.name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {s.questionCount} question{s.questionCount !== 1 ? "s" : ""} · {s.marksPerQuestion} mark{s.marksPerQuestion !== 1 ? "s" : ""} each
                          </Text>
                        </Box>
                      ))}
                    </Flex>
                  </GridItem>
                )}
              </>
            )}
          </Box>

          {/* {isModuleAssessment && (
            <Checkbox
              isChecked={addToBank}
              onChange={(e) => setAddToBank(e.target.checked)}
              colorScheme="purple"
              mt={2}
            >
              Add to Question Bank — automatically save every question created for this assessment to the bank
            </Checkbox>
          )} */}
        </Box>
        <Flex paddingY={10} marginX={6} justifyContent="space-between">
          <Button secondary onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            isLoading={isSubmitting || users.loading || !metadata?.departments}
            disabled={
              isSubmitting ||
              users.loading ||
              !metadata?.departments ||
              users.err
            }
            loadingText="Saving"
            type="submit"
          >
            {supportsSectionAuthoring ? "Next: Template" : "Next"}
          </Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export default CreateAssessmentPage;
