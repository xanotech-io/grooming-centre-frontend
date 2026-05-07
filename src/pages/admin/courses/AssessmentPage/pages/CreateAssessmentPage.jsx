import { Box, Flex, GridItem } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useState, useEffect } from "react";
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
  adminCreateAssessment,
  adminCreateExamination,
  adminCreateStandaloneExamination,
  adminGetMarkingTemplates,
} from "../../../../../services";
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
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && isExamination
      ? true
      : false;

  const [standaloneExamType, setStandaloneExamType] = useState("departments");

  const { push } = useHistory();
  const toast = useToast();
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplateId, setMarkingTemplateId] = useState("");

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

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");

      if (selectedIDs.length === 0 && isStandaloneExamination)
        throw new Error("Please select at least one User or Department");

      if (!markingTemplateId)
        throw new Error("A marking template must be selected before creating an assessment or examination.");

      data = {
        ...data,
        courseId,
        markingTemplateId,
        startTime: formatDateToISO(startTime),
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
      console.log(body, "jjjjj");
      const { message, assessment, examination } =
        await (isStandaloneExamination
          ? adminCreateStandaloneExamination(body)
          : isExamination
          ? adminCreateExamination(body)
          : adminCreateAssessment(body));

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      isExamination
        ? push(
            `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${examination.id}`
          )
        : push(
            `/admin/courses/${courseId}/assessment/${assessment.id}/questions/new`
          );
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
                placeholder="Enter number of questions"
                error={errors.amountOfQuestions?.message}
                {...register("amountOfQuestions", {
                  required: "Please enter number of questions",
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
          </Box>
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
            Save
          </Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export default CreateAssessmentPage;
