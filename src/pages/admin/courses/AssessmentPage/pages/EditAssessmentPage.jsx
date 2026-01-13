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
  adminEditStandaloneExamination,
  adminEditAssessment,
  adminEditExamination,
} from '../../../../../services';
import {
  capitalizeFirstLetter,
  capitalizeWords,
  formatDateToISO,
} from '../../../../../utils';
import { useCache, useApp } from '../../../../../contexts';
import { MultiSelect } from 'react-multi-select-component';
import { Tag, TagLabel } from '@chakra-ui/react';

const EditAssessmentPage = ({ users, assessment: assessmentOrExam }) => {
  const { id: courseId, assessmentId } = useParams();

  const isExamination = useQueryParams().get('examination');
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleCancel = useGoBack();

  const startTimeManager = useDateTimePicker();

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

  const { handleDelete } = useCache();

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate('Start Time');

      data = {
        ...data,
        courseId,
        startTime: formatDateToISO(startTime),
      };

      isStandaloneExamination && Reflect.deleteProperty(data, 'courseId');
      // const body = isStandaloneExamination
      //   ? {
      //       ...data,
      //       ...(standaloneExamType === "users"
      //         ? {
      //             usersId: selectedIDs.map(({ value }) => value),
      //           }
      //         : {
      //             departmentIds: selectedIDs.map(({ value }) => value),
      //           }),
      //     }
      //   : data;
      const body = data;

      const { message } = await (isStandaloneExamination
        ? adminEditStandaloneExamination(isExamination, body)
        : isExamination
        ? adminEditExamination(assessmentId, body)
        : adminEditAssessment(assessmentId, body));

      toast({
        description: capitalizeFirstLetter(message),
        position: 'top',
        status: 'success',
      });

      handleDelete(isExamination || assessmentId);

      isStandaloneExamination
        ? push(`/admin/standalone-exams/${isExamination}/${data.title}`)
        : isExamination
        ? push(`/admin/courses/details/${courseId}/exam`)
        : push(`/admin/courses/details/${courseId}/assessment`);
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
            loadingText="Updating"
            type="submit"
          >
            Update
          </Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export default EditAssessmentPage;
