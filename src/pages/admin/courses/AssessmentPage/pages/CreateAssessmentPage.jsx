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
import { Checkbox, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";
import { SectionsBuilder, createEmptySection } from "../../../examSectionBuilder/SectionRow";
import QuestionQuantitiesTable from "../../../examSectionBuilder/QuestionQuantitiesTable";
import {
  EXAM_TYPE_OPTIONS,
  toExamTypeApiValue,
  normalizeSectionsForConfig,
  computeSectionTotals,
  computeQuantityTotals,
  seedQuantityCounts,
} from "../../../examSectionBuilder/examTypeConfig";

const CreateAssessmentPage = ({ users }) => {
  const { id: courseId, assessmentId } = useParams();

  const isExamination = useQueryParams().get("examination");
  const moduleId = useQueryParams().get("moduleId");
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;
  const isModuleAssessment = !isExamination && !isStandaloneExamination && !!moduleId;

  const [standaloneExamType, setStandaloneExamType] = useState("departments");
  const [addToBank, setAddToBank] = useState(false);

  const { push } = useHistory();
  const toast = useToast();
  const setPendingCreate = useAssessmentStore((s) => s.setPendingCreate);
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
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");
  const [templateSections, setTemplateSections] = useState([]);

  // Exam Type / Sections / Question Quantities — same rules Standalone
  // Exams established, folded into this same create form (no new screen).
  // Only ever meaningful for a plain Assessment: the isStandaloneExamination
  // branch is dead/unreachable legacy code (left untouched below), and the
  // isExamination ("Exam") path's performCreateParent never persists
  // sections, so sections authored there would silently vanish — out of
  // scope for now.
  const supportsSectionAuthoring = !isStandaloneExamination && !isExamination;
  const [examType, setExamType] = useState("with_sections");
  const [amountOfQuestions, setAmountOfQuestions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [questionQuantities, setQuestionQuantities] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, createEmptySection()]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const sectionsEnabled = supportsSectionAuthoring && (examType === "with_sections" || examType === "hybrid");
  const amountOfQuestionsIsAuto = supportsSectionAuthoring && (examType === "with_sections" || examType === "without_sections");
  const totalMarksIsAuto = supportsSectionAuthoring && (examType === "with_sections" || examType === "without_sections" || examType === "hybrid");
  // A sectioned exam defines marking per-section, not via a marking
  // template — only relaxed on the plain-Assessment path that actually
  // supports Exam Type; every other path keeps the original unconditional
  // requirement.
  const templateRequired = !supportsSectionAuthoring || examType !== "with_sections";

  useEffect(() => {
    if (examType === "with_sections") setMarkingTemplateId("");
  }, [examType]);

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

  // The marking-templates list already carries each template's full
  // markDistribution/questionTypes — no need for a separate by-ID fetch
  // just for the Quantities table.
  const selectedTemplate = markingTemplates.find((t) => t.id === markingTemplateId);
  const quantityTypes = selectedTemplate?.questionTypes ?? Object.keys(selectedTemplate?.markDistribution || {});

  // Confirmed against a real backend test: a template can itself declare
  // questionQuantity, and the backend inherits it when the exam sends none
  // of its own — but only when the field is truly absent, not just present
  // with blank/zero values. Pre-filling from the template's own defaults
  // (without clobbering anything already typed) means whatever this page
  // ends up sending always matches what the backend would have inherited
  // anyway, and this page's own totals stay correct instead of showing 0
  // until the admin retypes the template's numbers by hand.
  useEffect(() => {
    if (!supportsSectionAuthoring || !selectedTemplate?.questionQuantity) return;
    setQuestionQuantities((prev) => ({ ...selectedTemplate.questionQuantity, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportsSectionAuthoring, markingTemplateId, markingTemplates]);

  const { weightageTotal: sectionsWeightageTotal, questionCountTotal: sectionsQuestionCountTotal } =
    computeSectionTotals(sections);
  const { marksTotal: quantityMarksTotal, quantityTotal } = computeQuantityTotals(
    quantityTypes,
    questionQuantities,
    selectedTemplate?.markDistribution,
  );

  // Every auto-compute effect below is a no-op for the isStandaloneExamination/
  // isExamination paths (supportsSectionAuthoring is false there) — their
  // amountOfQuestions/totalMarks stay exactly the plain hand-typed fields
  // they've always been.
  useEffect(() => {
    if (!supportsSectionAuthoring || examType !== "with_sections") return;
    setTotalMarks(String(sectionsWeightageTotal));
    setAmountOfQuestions(String(sectionsQuestionCountTotal));
  }, [supportsSectionAuthoring, examType, sectionsWeightageTotal, sectionsQuestionCountTotal]);

  useEffect(() => {
    if (!supportsSectionAuthoring || examType !== "without_sections") return;
    setTotalMarks(String(quantityMarksTotal));
    setAmountOfQuestions(String(quantityTotal));
  }, [supportsSectionAuthoring, examType, quantityMarksTotal, quantityTotal]);

  useEffect(() => {
    if (!supportsSectionAuthoring || examType !== "hybrid") return;
    setTotalMarks(String(sectionsWeightageTotal + quantityMarksTotal));
  }, [supportsSectionAuthoring, examType, sectionsWeightageTotal, quantityMarksTotal]);
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

      if (templateRequired && !markingTemplateId)
        throw new Error("A marking template must be selected before creating an assessment or examination.");

      if (supportsSectionAuthoring) {
        const newErrors = {};
        if (!amountOfQuestions || Number(amountOfQuestions) <= 0) {
          newErrors.amountOfQuestions = amountOfQuestionsIsAuto
            ? "Add sections/quantities so the number of questions can be calculated"
            : "Please enter number of questions";
        }
        if (!totalMarks || Number(totalMarks) <= 0) {
          newErrors.totalMarks = totalMarksIsAuto
            ? "Add sections/quantities so total marks can be calculated"
            : "Please enter total marks";
        }
        setFieldErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
          throw new Error("Please fix the highlighted fields before continuing.");
        }
      }

      data = {
        ...data,
        courseId,
        markingTemplateId: templateRequired ? markingTemplateId : undefined,
        duration: Number(data.duration),
        amountOfQuestions: supportsSectionAuthoring ? Number(amountOfQuestions) : Number(data.amountOfQuestions),
        totalMarks: supportsSectionAuthoring ? Number(totalMarks) : Number(data.totalMarks),
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
        ...(isModuleAssessment ? { moduleId } : {}),
        ...(supportsSectionAuthoring && { examType: toExamTypeApiValue(examType) }),
        ...(supportsSectionAuthoring && (examType === "hybrid" || examType === "without_sections") && {
          questionQuantity: seedQuantityCounts(quantityTypes, questionQuantities),
        }),
        ...(supportsSectionAuthoring && sectionsEnabled && sections.length > 0 && {
          sections: normalizeSectionsForConfig(sections),
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
        addToBank: isModuleAssessment ? addToBank : undefined,
        title: data.title,
        fromBankQuestionIds: bankQuestionIdsRef.current,
        // Local-only carrier for the Questions step's section-type-lock
        // restriction while this assessment is still pending creation —
        // never sent over the network for this kind (performCreateParent
        // never PUTs paper config for "Assessment").
        ...(supportsSectionAuthoring && sectionsEnabled && sections.length > 0 && {
          paperConfigBody: { configuredSections: normalizeSectionsForConfig(sections) },
        }),
      });
      const moduleQuery = isModuleAssessment ? `&moduleId=${moduleId}` : "";
      const nextRoute = isExamination
        ? `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=new&submitForApproval=1`
        : `/admin/courses/${courseId}/assessment/new/questions/new?submitForApproval=1${moduleQuery}`;
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
                label="Number of Questions"
                type="number"
                id="amountOfQuestions"
                placeholder={amountOfQuestionsIsAuto ? "Calculated automatically below" : "Enter number of questions"}
                error={supportsSectionAuthoring ? fieldErrors.amountOfQuestions : errors.amountOfQuestions?.message}
                {...(supportsSectionAuthoring
                  ? {
                      value: amountOfQuestions,
                      isReadOnly: amountOfQuestionsIsAuto,
                      isDisabled: amountOfQuestionsIsAuto,
                      onChange: (e) => setAmountOfQuestions(e.target.value),
                    }
                  : register("amountOfQuestions", { required: "Please enter number of questions" }))}
              />
            </GridItem>
            <GridItem>
              <Input
                label="Total Marks"
                type="number"
                id="totalMarks"
                placeholder={totalMarksIsAuto ? "Calculated automatically below" : "e.g. 100"}
                error={supportsSectionAuthoring ? fieldErrors.totalMarks : errors.totalMarks?.message}
                {...(supportsSectionAuthoring
                  ? {
                      value: totalMarks,
                      isReadOnly: totalMarksIsAuto,
                      isDisabled: totalMarksIsAuto,
                      onChange: (e) => setTotalMarks(e.target.value),
                    }
                  : register("totalMarks", { required: "Please enter total marks" }))}
              />
            </GridItem>

            {supportsSectionAuthoring && (
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Select
                  label="Exam Type"
                  isRequired
                  noEmptyOption
                  value={examType}
                  onChange={(e) => {
                    const nextExamType = e.target.value;
                    setExamType(nextExamType);
                    // Sectioned exams derive marking from each section's own
                    // marking type, so a global marking template doesn't apply.
                    if (nextExamType === "with_sections") setMarkingTemplateId("");
                  }}
                  options={EXAM_TYPE_OPTIONS}
                />
              </GridItem>
            )}

            <GridItem colSpan={{ base: 1, lg: 2 }}>
              <Select
                label="Marking Template"
                placeholder="Select a marking template"
                isRequired={templateRequired}
                isDisabled={supportsSectionAuthoring && examType === "with_sections"}
                value={markingTemplateId}
                onChange={(e) => setMarkingTemplateId(e.target.value)}
                options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
              />
              {supportsSectionAuthoring && examType === "with_sections" && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Sectioned exams define marking per section instead — no marking template needed.
                </Text>
              )}
            </GridItem>

            {supportsSectionAuthoring && selectedTemplate && (examType === "without_sections" || examType === "hybrid") && (
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <QuestionQuantitiesTable
                  selectedTemplate={selectedTemplate}
                  types={quantityTypes}
                  counts={questionQuantities}
                  onChange={(type, value) => setQuestionQuantities((p) => ({ ...p, [type]: value }))}
                  examType={examType}
                  sectionsWeightageTotal={sectionsWeightageTotal}
                  marksTotal={quantityMarksTotal}
                  quantityTotal={quantityTotal}
                />
              </GridItem>
            )}

            {templateSections.length > 0 && !(supportsSectionAuthoring && examType === "with_sections" && sections.length > 0) && (
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
          </Box>

          {supportsSectionAuthoring && sectionsEnabled && (
            <Box mb={10}>
              <Text as="h3" bold mb={4}>
                Sections
              </Text>
              <SectionsBuilder
                sections={sections}
                onAdd={addSection}
                onChange={updateSection}
                onRemove={removeSection}
              />
            </Box>
          )}

          {isModuleAssessment && (
            <Checkbox
              isChecked={addToBank}
              onChange={(e) => setAddToBank(e.target.checked)}
              colorScheme="purple"
              mt={2}
            >
              Add to Question Bank — automatically save every question created for this assessment to the bank
            </Checkbox>
          )}
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
            Next
          </Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export default CreateAssessmentPage;
