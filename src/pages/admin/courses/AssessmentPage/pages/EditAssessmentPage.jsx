import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { Box, Flex, Grid, GridItem } from '@chakra-ui/layout';
import { useToast } from '@chakra-ui/toast';
import {
  Button,
  DateTimePicker,
  Input,
  Spinner,
  Text,
} from '../../../../../components';
import {
  useDateTimePicker,
  useGoBack,
  useQueryParams,
} from '../../../../../hooks';
import { AdminMainAreaWrapper } from '../../../../../layouts';
import {
  capitalizeFirstLetter,
  capitalizeWords,
  formatDateToISO,
} from '../../../../../utils';
import { useApp } from '../../../../../contexts';
import useAssessmentStore from '../../../../../store/assessmentStore';
import { MultiSelect } from 'react-multi-select-component';
import { Tag, TagLabel } from '@chakra-ui/react';

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
    if (assessmentOrExam) {
      setValue('amountOfQuestions', assessmentOrExam?.questionCount);
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

      data = {
        ...data,
        courseId,
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
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
                placeholder="Enter number of questions"
                error={errors.amountOfQuestions?.message}
                {...register('amountOfQuestions', {
                  required: 'Please enter number of questions',
                })}
              />
            </GridItem>
          </Grid>
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
