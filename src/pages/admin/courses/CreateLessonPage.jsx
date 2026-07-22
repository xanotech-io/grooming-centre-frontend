/* eslint-disable no-lone-blocks */
import { useToast } from "@chakra-ui/toast";
import { Flex, Grid, GridItem } from "@chakra-ui/layout";
import { Route, useParams, useHistory } from "react-router-dom";
import {
  DateTimePicker,
  Input,
  RichText,
  Select,
  Upload,
  Breadcrumb,
  Link,
  Heading,
  Spinner,
  Text,
  WorkflowSubmitModal,
} from "../../../components";
import { CreatePageLayout } from "../../../layouts";
import { BreadcrumbItem, Box } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  useDateTimePicker,
  useIsSuperAdmin,
  useUpload,
  useRichText,
} from "../../../hooks";
import {
  appendFormData,
  capitalizeFirstLetter,
  formatDateToISO,
  populateSelectOptions,
} from "../../../utils";
import { useApp, useCache } from "../../../contexts";
import { useEffect, useRef, useState } from "react";
import {
  adminCreateLesson,
  adminEditLesson,
  auditTrailV2PostLog,
} from "../../../services";
import useViewLessonInfo from "./hooks/useViewLessonInfo";

const CreateLessonPage = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const isEditMode = lessonId && lessonId !== "new";
  const courseIsUnknown = courseId === "unknown";
  const isModuleScoped = !!moduleId;
  const [loader, setUploadProgress] = useState(0);
  const { push } = useHistory();
  const toast = useToast();
  const isSuperAdmin = useIsSuperAdmin();
  const { handleDelete } = useCache();

  const {
    handleSubmit,
    register,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const {
    state: { metadata },
    getOneMetadata,
  } = useApp();
  const file = watch("lessonTypeId");
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingLessonBodyRef = useRef(null);
  const pendingLessonTitleRef = useRef(null);
  const resultLessonRef = useRef(null);
  const handleUploadProgress = (progress) => {
    setUploadProgress(progress);
  };
  const startTimeManager = useDateTimePicker();
  const endTimeManager = useDateTimePicker();
  const fileManager = useUpload({ previewElementId: "file-video" });
  const contentManager = useRichText();

  const { lesson, isLoading, isError } = useViewLessonInfo();

  // Init `Title` value
  useEffect(() => {
    if (lesson) {
      setValue("title", lesson.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  // Init `Dates` value
  useEffect(() => {
    if (lesson) {
      startTimeManager.handleChange(lesson.startTime);
      endTimeManager.handleChange(lesson.endTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  useEffect(() => {
    if (lesson) {
      startTimeManager.handleChange(lesson.startTime);
      endTimeManager.handleChange(lesson.endTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  // Allow manual input for end date
  const disableEndTime = false;
  // Init `Content` data
  useEffect(() => {
    if (lesson) {
      contentManager.handleInitData(lesson.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  const setLessonAccept = (lessonTypeId) => {
    const lessonType = getOneMetadata("lessonType", lessonTypeId)?.name?.toLowerCase();

    if (lessonType === "pdf") {
      fileManager.handleAcceptChange("application/pdf");
    }

    if (lessonType === "video") {
      fileManager.handleAcceptChange("video/*");
    }

    if (lessonType === "audio") {
      fileManager.handleAcceptChange("audio/*");
    }

    if (lessonType === "powerpoint") {
      fileManager.handleAcceptChange(
        ".ppt, .pptx, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
    }

    if (lessonType === "word" || lessonType === "doc" || lessonType === "word document") {
      fileManager.handleAcceptChange(
        ".doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    }
  };

  // Init `lessonTypeId` value and set `accept` for file upload input
  useEffect(() => {
    if (lesson && metadata) {
      setValue("lessonTypeId", lesson.lessonTypeId);
      setLessonAccept(lesson.lessonTypeId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, metadata]);

  // Init `Lesson File` file url
  useEffect(() => {
    if (lesson) {
      const fileIsAVideo = /((\.)(mp4|mkv|webm|mov|avi))$/i.test(lesson.file);
      const fileIsPDF = /(\.pdf)$/i.test(lesson.file);
      const fileIsPowerPoint = /((\.)(ppt|pptx))$/i.test(lesson.file);
      const fileIsAudio = /((\.)(mp3|wav|m4a|ogg|aac|flac))$/i.test(lesson.file);
      const fileIsWord = /((\.)(doc|docx))$/i.test(lesson.file);

      if (fileIsAVideo) {
        fileManager.handleInitialVideoSelect(lesson.file);
      }
      if (fileIsPDF) {
        fileManager.handleInitialPdfSelect(lesson.file);
      }
      if (fileIsPowerPoint) {
        fileManager.handleInitialPowerpointSelect(lesson.file);
      }
      if (fileIsAudio) {
        fileManager.handleInitialAudioSelect(lesson.file);
      }
      if (fileIsWord) {
        fileManager.handleInitialWordSelect(lesson.file);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  // Control `Lesson File` with `File Type`
  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      console.log({ name, type, data });

      if (name === "lessonTypeId") {
        fileManager.handleFileSelect(null);

        setLessonAccept(data.lessonTypeId);
      }
    });

    return () => subscription.unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, metadata]);

  const performEdit = async (body, title) => {
    try {
      const { message, lesson } = await adminEditLesson(lessonId, body);
      resultLessonRef.current = lesson;
      handleDelete(lesson.id);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      auditTrailV2PostLog({
        eventType: "update",
        module: "LMS",
        status: "success",
        resourceId: lesson?.id ?? lessonId,
        resourceType: "Lesson",
        remarks: `Updated lesson "${title ?? lesson?.title}"`,
      }).catch(() => {});
      return { id: lesson?.id ?? lessonId };
    } catch (error) {
      auditTrailV2PostLog({
        eventType: "update",
        module: "LMS",
        status: "failure",
        resourceId: lessonId,
        resourceType: "Lesson",
        remarks: error?.response?.data?.message || error.message || `Failed to update lesson "${title}"`,
      }).catch(() => {});
      throw error;
    }
  };

  const performCreate = async (body, title) => {
    try {
      const { message, lesson } = await adminCreateLesson(
        body,
        handleUploadProgress,
      );
      resultLessonRef.current = lesson;
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      auditTrailV2PostLog({
        eventType: "create",
        module: "LMS",
        status: "success",
        resourceId: lesson?.id,
        resourceType: "Lesson",
        remarks: `Created lesson "${title ?? lesson?.title}"`,
      }).catch(() => {});
      return { id: lesson?.id };
    } catch (error) {
      auditTrailV2PostLog({
        eventType: "create",
        module: "LMS",
        status: "failure",
        resourceId: courseId,
        resourceType: "Lesson",
        remarks: error?.response?.data?.message || error.message || `Failed to create lesson "${title}"`,
      }).catch(() => {});
      throw error;
    }
  };

  const handleWorkflowFinished = () => {
    const lessonIdForRoute = resultLessonRef.current?.id ?? lessonId;
    const nextRoute = isModuleScoped
      ? `/admin/courses/${courseId}/module/${moduleId}/lessons`
      : `/admin/courses/${courseId}/lesson/${lessonIdForRoute}/view`;
    push(nextRoute);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const startTime =
        startTimeManager.handleGetValueAndValidate("Start Time");
      const content = contentManager.handleGetValueAndValidate("Content");
      const file = fileManager.handleGetFileAndValidate(
        "Lesson File",
        isEditMode,
      );
      const endTime = endTimeManager.handleGetValueAndValidate("End Time");

      data = {
        ...data,
        courseId,
        ...(isModuleScoped && { moduleId }),
        file,
        content,
        startTime: formatDateToISO(startTime),
        endTime: formatDateToISO(endTime),
      };

      if (isEditMode) Reflect.deleteProperty(data, "courseId");

      const body = appendFormData(data);

      const workflowContentBase = {
        contentTitle: data.title,
        requestType: isModuleScoped ? "CourseLesson" : "Lesson",
        courseId,
      };

      pendingLessonTitleRef.current = data.title;

      // Everyone, including super admin, must submit for approval before
      // this takes effect — hold off until the modal below completes. Super
      // admin submissions carry a null supervisor instead of skipping the
      // workflow.
      pendingLessonBodyRef.current = body;
      setWorkflowContent(
        isEditMode ? { ...workflowContentBase, contentId: lessonId } : workflowContentBase,
      );
      setWorkflowModalOpen(true);
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  return isEditMode && (isLoading || isError) ? (
    <Flex
      // Make the height 100% of the screen minus the `height` of the Header and Footer
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Heading color="red.500">{isError}</Heading>
      ) : null}
    </Flex>
  ) : (
    <>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/courses">Courses</Link>
            </BreadcrumbItem>
          }
          item3={
            isModuleScoped ? (
              <BreadcrumbItem>
                <Link href={`/admin/courses/${courseId}/module/${moduleId}/lessons`}>
                  Lessons
                </Link>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <Link href={`/admin/courses/details/${courseId}/lessons`}>
                  Lessons
                </Link>
              </BreadcrumbItem>
            )
          }
          item4={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{isEditMode ? "Edit" : "Create"}</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <CreatePageLayout
        title={isEditMode ? "Edit Lesson details" : "Create Lesson"}
        submitButtonText={
          isSubmitting
            ? "Please wait this might take a while"
            : isEditMode
              ? "Update Lesson"
              : "Add Lesson"
        }
        onSubmit={handleSubmit(onSubmit)}
        submitButtonIsDisabled={!metadata}
        submitButtonIsLoading={isSubmitting}
      >
        <Grid templateColumns="repeat(2, 1fr)" gap={10} marginBottom={10}>
          {courseIsUnknown && (
            <GridItem>
              <Select
                id="courseId"
                label="Select course"
                options={[
                  { label: "Course 1", value: "Course-1" },
                  { label: "Course 2", value: "Course-2" },
                  { label: "Course 3", value: "Course-3" },
                ]}
                isRequired
                error={errors.courseId?.message}
                {...register("courseId", {
                  required: "Please select a Course",
                })}
              />
            </GridItem>
          )}

          <GridItem colSpan={courseIsUnknown ? 1 : 2}>
            <Input
              id="title"
              isRequired
              label="Lesson title"
              error={errors.title?.message}
              {...register("title", { required: "Lesson title is required" })}
            />
          </GridItem>

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
              id="EndTime"
              label="End date & time"
              value={endTimeManager.value}
              onChange={endTimeManager.handleChange}
              disabled={disableEndTime}
              tooltip={
                disableEndTime &&
                "Controlled by Video Length (+10 minutes extra time) and Start date & time"
              }
            />
          </GridItem>

          <GridItem colSpan={2}>
            <RichText
              height="250px"
              id="content"
              label="Content"
              defaultValue={contentManager.data.default}
              onChange={contentManager.handleChange}
            />
          </GridItem>

          <GridItem>
            <Select
              id="lessonTypeId"
              label="File type"
              placeholder="Pick a file"
              options={(() => {
                const seen = new Set();
                return populateSelectOptions(metadata?.lessonType)
                  ?.map((opt) =>
                    opt.label.toLowerCase() === "word" ? { ...opt, label: "Document" } : opt
                  )
                  ?.filter((opt) => {
                    const key = opt.label.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });
              })()}
              isLoading={!metadata?.lessonType}
              isRequired
              error={errors.lessonTypeId?.message}
              {...register("lessonTypeId", {
                required: "File type is required",
              })}
            />
          </GridItem>
          {console.log(fileManager.pdf.url)}
          <GridItem colSpan={2}>
            <Upload
              id="file"
              previewElementId="file-video"
              label="Lesson file"
              isRequired
              videoUrl={fileManager.video.url}
              audioUrl={fileManager.audio.url}
              pdfUrl={fileManager.pdf.url}
              powerpointUrl={fileManager.powerpoint.url}
              wordUrl={fileManager.word.url}
              disabled={!getValues("lessonTypeId")}
              onFileSelect={fileManager.handleFileSelect}
              accept={fileManager.accept}
            />
            {file && (
              <Box marginTop={"30px"} width={"300px"}>
                <Text fontSize={"17px"} mb={"10px"}>
                  File progress
                </Text>
                <Box
                  overflow={"hidden"}
                  width={"100%"}
                  height={"8px"}
                  borderRadius={"10px"}
                  backgroundColor={"gray.300"}
                >
                  <Box
                    w={`${loader}%`}
                    h={"100%"}
                    transitionDuration={"0.5s"}
                    backgroundColor={"orange.600"}
                  ></Box>
                </Box>
                <Text
                  fontSize={"17px"}
                  display="flex"
                  justifyContent="flex-end"
                  mt={"10px"}
                >
                  {loader}%
                </Text>
              </Box>
            )}
          </GridItem>
        </Grid>

      </CreatePageLayout>

      {workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          courseId={workflowContent.courseId}
          onCreate={() =>
            isEditMode
              ? performEdit(pendingLessonBodyRef.current, pendingLessonTitleRef.current)
              : performCreate(pendingLessonBodyRef.current, pendingLessonTitleRef.current)
          }
          onSuccess={handleWorkflowFinished}
        />
      )}
    </>
  );
};

export const CreateLessonPageRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CreateLessonPage {...props} />} />
  );
};
