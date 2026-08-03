import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { Box, Flex, Grid, GridItem } from '@chakra-ui/layout';
import { useToast } from '@chakra-ui/toast';
import {
  Button,
  DateTimePicker,
  Input,
  Select,
  Spinner,
  Text,
} from '../../../../../components';
import {
  useDateTimePicker,
  useGoBack,
  useQueryParams,
} from '../../../../../hooks';
import { AdminMainAreaWrapper } from '../../../../../layouts';
import { adminGetMarkingTemplates } from '../../../../../services';
import {
  capitalizeFirstLetter,
  capitalizeWords,
  formatDateToISO,
} from '../../../../../utils';
import { useApp } from '../../../../../contexts';
import useAssessmentStore from '../../../../../store/assessmentStore';
import { MultiSelect } from 'react-multi-select-component';
import { Tag, TagLabel } from '@chakra-ui/react';
import { SectionsBuilder, createEmptySection } from '../../../examSectionBuilder/SectionRow';
import QuestionQuantitiesTable from '../../../examSectionBuilder/QuestionQuantitiesTable';
import {
  EXAM_TYPE_OPTIONS,
  toExamTypeApiValue,
  fromExamTypeApiValue,
  normalizeSectionsForConfig,
  hydrateSection,
  computeSectionTotals,
  computeQuantityTotals,
  seedQuantityCounts,
} from '../../../examSectionBuilder/examTypeConfig';

const EditAssessmentPage = ({ users, assessment: assessmentOrExam }) => {
  const { id: courseId, assessmentId } = useParams();

  const isExamination = useQueryParams().get('examination');
  const moduleId = useQueryParams().get('moduleId');
  const isStandaloneExamination =
    courseId === 'not-set' && assessmentId === 'not-set' && isExamination
      ? true
      : false;

  const [standaloneExamType, setStandaloneExamType] = useState('departments');
  const [selectedIDs, setSelectedIDs] = useState([]);
  const {
    state: { metadata },
    getOneMetadata,
  } = useApp();

  const { push } = useHistory();
  const toast = useToast();
  const setPendingEdit = useAssessmentStore((s) => s.setPendingEdit);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleCancel = useGoBack();

  const startTimeManager = useDateTimePicker();
  const endTimeManager = useDateTimePicker();

  // Exam Type / Sections / Question Quantities — same rules Standalone
  // Exams established, folded into this same edit form (no new screen).
  // Only ever meaningful for a plain Assessment: the isStandaloneExamination
  // branch is dead/unreachable legacy code (left untouched below), and the
  // isExamination ("Exam") path's performEditParent never persists
  // sections — out of scope for now.
  const supportsSectionAuthoring = !isStandaloneExamination && !isExamination;
  // "" is the legacy/unset sentinel — this page edits assessments that may
  // predate the Exam Type feature entirely, so it never defaults to a real
  // value the way the create form does; it's only ever set below, from an
  // actual `assessmentOrExam.examType`.
  const [examType, setExamType] = useState('');
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState('');
  const [amountOfQuestions, setAmountOfQuestions] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [questionQuantities, setQuestionQuantities] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [sections, setSections] = useState([]);
  const addSection = () => setSections((p) => [...p, createEmptySection()]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const sectionsEnabled =
    supportsSectionAuthoring && (examType === '' || examType === 'with_sections' || examType === 'hybrid');
  const amountOfQuestionsIsAuto =
    supportsSectionAuthoring && (examType === 'with_sections' || examType === 'without_sections');
  const totalMarksIsAuto =
    supportsSectionAuthoring &&
    (examType === 'with_sections' || examType === 'without_sections' || examType === 'hybrid');
  // Never newly-required for the "" legacy sentinel — this page's own
  // marking-template field didn't exist before this change at all, so an
  // assessment that predates it must stay saveable without one.
  const templateRequired = supportsSectionAuthoring && examType !== '' && examType !== 'with_sections';

  useEffect(() => {
    if (examType === 'with_sections') setMarkingTemplateId('');
  }, [examType]);

  const usageScope = isStandaloneExamination
    ? 'Standalone Exam'
    : isExamination
      ? 'Normal Exam'
      : 'Assessment';

  useEffect(() => {
    adminGetMarkingTemplates()
      .then(({ templates }) => setMarkingTemplates(templates.filter((t) => t.usageScope === usageScope)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageScope]);

  const selectedTemplate = markingTemplates.find((t) => t.id === markingTemplateId);
  const quantityTypes = selectedTemplate?.questionTypes ?? Object.keys(selectedTemplate?.markDistribution || {});

  // Confirmed against a real backend test: a template can itself declare
  // questionQuantity, and the backend inherits it when the exam sends none
  // of its own — but only when the field is truly absent, not just present
  // with blank/zero values. Pre-filling from the template's own defaults
  // (without clobbering anything already typed/hydrated) means whatever
  // this page ends up sending always matches what the backend would have
  // inherited anyway, and this page's own totals stay correct instead of
  // showing 0 until the admin retypes the template's numbers by hand.
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

  useEffect(() => {
    if (!supportsSectionAuthoring || examType !== 'with_sections') return;
    setTotalMarks(String(sectionsWeightageTotal));
    setAmountOfQuestions(String(sectionsQuestionCountTotal));
  }, [supportsSectionAuthoring, examType, sectionsWeightageTotal, sectionsQuestionCountTotal]);

  useEffect(() => {
    if (!supportsSectionAuthoring || examType !== 'without_sections') return;
    setTotalMarks(String(quantityMarksTotal));
    setAmountOfQuestions(String(quantityTotal));
  }, [supportsSectionAuthoring, examType, quantityMarksTotal, quantityTotal]);

  useEffect(() => {
    if (!supportsSectionAuthoring || examType !== 'hybrid') return;
    setTotalMarks(String(sectionsWeightageTotal + quantityMarksTotal));
  }, [supportsSectionAuthoring, examType, sectionsWeightageTotal, quantityMarksTotal]);

  // Init `Title` value
  useEffect(() => {
    if (assessmentOrExam) {
      setValue('title', assessmentOrExam.topic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam]);

  // Init `StartTime` value
  useEffect(() => {
    if (assessmentOrExam?.startTime) {
      startTimeManager.handleChange(assessmentOrExam.startTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam?.startTime]);

  // Init `EndTime` value
  useEffect(() => {
    if (assessmentOrExam?.endTime) {
      endTimeManager.handleChange(assessmentOrExam.endTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam?.endTime]);

  // Init `Duration` value
  useEffect(() => {
    if (assessmentOrExam) {
      setValue('duration', assessmentOrExam.duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam]);

  // Init `Number of Questions` value
  useEffect(() => {
    if (!assessmentOrExam) return;
    if (supportsSectionAuthoring) {
      if (assessmentOrExam?.questionCount != null) setAmountOfQuestions(String(assessmentOrExam.questionCount));
    } else {
      setValue('amountOfQuestions', assessmentOrExam?.questionCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam, supportsSectionAuthoring]);

  // Init Marking Template / Total Marks / Exam Type / Question Quantities /
  // Sections — only meaningful on the plain-Assessment path.
  useEffect(() => {
    if (!assessmentOrExam || !supportsSectionAuthoring) return;
    if (assessmentOrExam.markingTemplateId) setMarkingTemplateId(assessmentOrExam.markingTemplateId);
    if (assessmentOrExam.totalMarks != null) setTotalMarks(String(assessmentOrExam.totalMarks));
    // Only set when the assessment actually has one — an assessment that
    // predates this feature must keep the "" legacy sentinel so its
    // hand-typed totals stay exactly as they are today.
    if (assessmentOrExam.examType) setExamType(fromExamTypeApiValue(assessmentOrExam.examType));
    if (assessmentOrExam.questionQuantity) setQuestionQuantities(assessmentOrExam.questionQuantity);
    if (Array.isArray(assessmentOrExam.sections) && assessmentOrExam.sections.length > 0) {
      setSections(assessmentOrExam.sections.map(hydrateSection));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam]);

  // const { handleDelete } = useCache();

  // Handle form submission — nothing is saved yet. The edit is held in
  // memory and only actually applied (together with the workflow submit
  // modal) once a question has been saved on the other side of "Next",
  // mirroring the shell-plus-question deferral the create flow already uses.
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate('Start Time');
      const endTime = endTimeManager.handleGetValueAndValidate('End Time');

      if (templateRequired && !markingTemplateId)
        throw new Error('A marking template must be selected before saving this assessment.');

      if (supportsSectionAuthoring) {
        const newErrors = {};
        if (!amountOfQuestions || Number(amountOfQuestions) <= 0) {
          newErrors.amountOfQuestions = amountOfQuestionsIsAuto
            ? 'Add sections/quantities so the number of questions can be calculated'
            : 'Please enter number of questions';
        }
        if (!totalMarks || Number(totalMarks) <= 0) {
          newErrors.totalMarks = totalMarksIsAuto
            ? 'Add sections/quantities so total marks can be calculated'
            : 'Please enter total marks';
        }
        setFieldErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
          throw new Error('Please fix the highlighted fields before continuing.');
        }
      }

      data = {
        ...data,
        courseId,
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
        ...(supportsSectionAuthoring && {
          amountOfQuestions: Number(amountOfQuestions),
          totalMarks: Number(totalMarks),
          // A sectioned exam has no marking template — `undefined` (not
          // just omitting the key) clears out a `markingTemplateId`
          // already sitting on a `pendingEdit` from an earlier visit where
          // a different Exam Type was selected.
          markingTemplateId: templateRequired ? markingTemplateId : undefined,
          // Only sent once the admin has actually chosen an Exam Type — an
          // assessment that predates this feature (the "" sentinel) posts
          // no examType at all.
          ...(examType && { examType: toExamTypeApiValue(examType) }),
          ...((examType === 'hybrid' || examType === 'without_sections') && {
            questionQuantity: seedQuantityCounts(quantityTypes, questionQuantities),
          }),
          ...(sectionsEnabled && sections.length > 0 && {
            sections: normalizeSectionsForConfig(sections),
          }),
        }),
      };

      isStandaloneExamination && Reflect.deleteProperty(data, 'courseId');
      const body = data;

      setPendingEdit({
        kind: isStandaloneExamination
          ? 'StandaloneExam'
          : isExamination
          ? 'Exam'
          : 'Assessment',
        contentId: isStandaloneExamination ? isExamination : assessmentId,
        body,
        title: data.title,
        requestType: isStandaloneExamination
          ? 'StandaloneExam'
          : isExamination
          ? 'CourseExam'
          : 'CourseAssessment',
        courseId: courseId !== 'not-set' ? courseId : undefined,
        nextRoute: isStandaloneExamination
          ? `/admin/standalone-exams/${isExamination}/${data.title}`
          : moduleId
          ? `/admin/courses/${courseId}/module/${moduleId}/${
              isExamination ? 'examinations' : 'assessments'
            }`
          : isExamination
          ? `/admin/courses/details/${courseId}/exam`
          : `/admin/courses/details/${courseId}/modules`,
        description: isExamination
          ? `Exam: ${data.title} — ${data.amountOfQuestions} questions, ${data.duration} mins`
          : `Assessment: ${data.title} — ${data.amountOfQuestions} questions, ${data.duration} mins`,
      });

      const moduleQuery = moduleId ? `&moduleId=${moduleId}` : '';
      const questionsRoute = isStandaloneExamination
        ? `/admin/standalone-exams/questions/?examination=${isExamination}&editSubmit=1`
        : isExamination
        ? `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${isExamination}&editSubmit=1${moduleQuery}`
        : `/admin/courses/${courseId}/assessment/${assessmentId}/questions/new?editSubmit=1${moduleQuery}`;
      push(questionsRoute);
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: 'top',
        status: 'error',
      });
    }
  };

  // const handleStandaloneExamTypeChange = (event) => {
  //   setStandaloneExamType(event.target.value);
  // };

  // Init `selectedIDs` value
  useEffect(() => {
    if (assessmentOrExam && users.data && metadata) {
      let selectedIDs = [];

      if (assessmentOrExam.type === 'users')
        selectedIDs = assessmentOrExam.selectedIDs.map(
          (id) => users.data.find(({ value }) => value === id) || {}
        );

      if (assessmentOrExam.type === 'departments')
        selectedIDs = assessmentOrExam.selectedIDs.map((id) => ({
          value: id,
          label: capitalizeWords(getOneMetadata('departments', id)?.name),
        }));

      setSelectedIDs(selectedIDs);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam, users.data, metadata]);

  // Init `StandaloneExamType` value
  useEffect(() => {
    if (assessmentOrExam) {
      setStandaloneExamType(assessmentOrExam?.type);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentOrExam]);

  useEffect(() => {
    if (users.err)
      toast({
        description: 'Something went wrong! please refresh the page',
        position: 'top',
        status: 'error',
        duration: 60000,
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.err]);

  useEffect(() => {
    if (selectedIDs.length > 0) {
      const content_el = document.querySelector(
        '#form-drop .dropdown-heading-value'
      );

      content_el.innerHTML = '<span></span>';
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIDs.length]);

  return (
    <AdminMainAreaWrapper>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY={14} marginX={6}>
        <Box backgroundColor="white" padding={10}>
          {isStandaloneExamination && (
            <>
              <Box opacity={0.7}>
                <Flex justifyContent="space-between" mb={5} w="400px">
                  <Flex cursor="no-drop" alignItems={'center'}>
                    <input
                      type="radio"
                      checked={standaloneExamType === 'departments'}
                      // onChange={handleStandaloneExamTypeChange}
                      name="radio"
                      value="departments"
                      id="radio-1"
                      style={{ cursor: 'no-drop' }}
                    />

                    <Box cursor="no-drop" as="label" htmlFor="radio-1" ml={2}>
                      <Text>By Departments</Text>
                    </Box>
                  </Flex>

                  <Flex cursor="no-drop" alignItems={'center'}>
                    <input
                      type="radio"
                      checked={standaloneExamType === 'users'}
                      // onChange={handleStandaloneExamTypeChange}
                      name="radio"
                      value="users"
                      id="radio-2"
                      style={{ cursor: 'no-drop' }}
                    />

                    <Box cursor="no-drop" as="label" htmlFor="radio-2" ml={2}>
                      <Text>By Users</Text>
                    </Box>
                  </Flex>
                </Flex>

                <Box id="form-drop" cursor="no-drop">
                  <Box as="label">
                    <Text as="level2" pb={2}>
                      Choose{' '}
                      {standaloneExamType === 'users' ? 'Users' : 'Departments'}
                    </Text>
                  </Box>

                  <Flex flexWrap="wrap">
                    {selectedIDs.map((item) => (
                      <Tag key={item.value} mr={2} mb={2}>
                        <TagLabel>{item.label}</TagLabel>

                        {/* <TagCloseButton
                          onClick={() => {
                            setSelectedIDs(
                              selectedIDs.filter(
                                (selectedItem) =>
                                  selectedItem.value !== item.value
                              )
                            );
                          }}
                        /> */}
                      </Tag>
                    ))}
                  </Flex>

                  {standaloneExamType === 'users' && users.data && (
                    <MultiSelect
                      disabled
                      options={users.data}
                      value={selectedIDs}
                      onChange={setSelectedIDs}
                      labelledBy="Select"
                    />
                  )}

                  {standaloneExamType === 'users' && users.loading && (
                    <Spinner />
                  )}

                  {standaloneExamType === 'departments' &&
                    metadata?.departments && (
                      <MultiSelect
                        disabled
                        options={metadata?.departments.map((department) => ({
                          value: department.id,
                          label: capitalizeWords(department.name),
                        }))}
                        value={selectedIDs}
                        onChange={setSelectedIDs}
                        labelledBy="Select"
                      />
                    )}

                  {standaloneExamType === 'users' && !metadata?.departments && (
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
            label={isExamination ? 'Examination Title' : 'Assessment Title'}
            id="title"
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
            })}
          />
          <Grid templateColumns="repeat(2, 1fr)" gap={10} marginY={10}>
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
                {...register('duration', {
                  required: 'Please enter duration',
                })}
              />
            </GridItem>
            <GridItem>
              <Input
                label="Number of Questions"
                type="number"
                id="amountOfQuestions"
                placeholder={amountOfQuestionsIsAuto ? 'Calculated automatically below' : 'Enter number of questions'}
                error={supportsSectionAuthoring ? fieldErrors.amountOfQuestions : errors.amountOfQuestions?.message}
                {...(supportsSectionAuthoring
                  ? {
                      value: amountOfQuestions,
                      isReadOnly: amountOfQuestionsIsAuto,
                      isDisabled: amountOfQuestionsIsAuto,
                      onChange: (e) => setAmountOfQuestions(e.target.value),
                    }
                  : register('amountOfQuestions', { required: 'Please enter number of questions' }))}
              />
            </GridItem>

            {supportsSectionAuthoring && (
              <>
                <GridItem>
                  <Input
                    label="Total Marks"
                    type="number"
                    id="totalMarks"
                    placeholder={totalMarksIsAuto ? 'Calculated automatically below' : 'e.g. 100'}
                    error={fieldErrors.totalMarks}
                    value={totalMarks}
                    isReadOnly={totalMarksIsAuto}
                    isDisabled={totalMarksIsAuto}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </GridItem>
                <GridItem colSpan={2}>
                  <Select
                    label="Exam Type"
                    isRequired
                    noEmptyOption={examType !== ''}
                    placeholder={examType === '' ? 'Not set (legacy assessment)' : undefined}
                    value={examType}
                    onChange={(e) => {
                      const nextExamType = e.target.value;
                      setExamType(nextExamType);
                      if (nextExamType === 'with_sections') setMarkingTemplateId('');
                    }}
                    options={EXAM_TYPE_OPTIONS}
                  />
                </GridItem>
                <GridItem colSpan={2}>
                  <Select
                    label="Marking Template"
                    placeholder="Select a marking template"
                    isRequired={templateRequired}
                    isDisabled={examType === 'with_sections'}
                    value={markingTemplateId}
                    onChange={(e) => setMarkingTemplateId(e.target.value)}
                    options={markingTemplates.map((t) => ({ label: t.markingTemplateName, value: t.id }))}
                  />
                  {examType === 'with_sections' && (
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Sectioned exams define marking per section instead — no marking template needed.
                    </Text>
                  )}
                </GridItem>
                {selectedTemplate && (examType === 'without_sections' || examType === 'hybrid') && (
                  <GridItem colSpan={2}>
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
              </>
            )}
          </Grid>

          {sectionsEnabled && (
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

export default EditAssessmentPage;
