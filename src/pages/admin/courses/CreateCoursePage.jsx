import { useState } from "react";
import { useToast } from "@chakra-ui/toast";
import { Flex, Grid, GridItem } from "@chakra-ui/layout";
import { useForm } from "react-hook-form";
import { Route } from "react-router-dom";
import {
  Input,
  Textarea,
  Select,
  Breadcrumb,
  Link,
  Upload,
  Checkbox,
  Spinner,
  Heading,
} from "../../../components";
import { CreatePageLayout } from "../../../layouts";
import { BreadcrumbItem, Box } from "@chakra-ui/react";
import { useApp, useCache } from "../../../contexts";
import {
  appendFormData,
  capitalizeFirstLetter,
  capitalizeWords,
} from "../../../utils";
import { useHistory, useParams } from "react-router";
import {
  adminCreateCourse,
  adminEditCourse,
  adminGetCoursesByDepartment,
} from "../../../services";
import { useUpload } from "../../../hooks";
import useCourseDetails from "../../user/Courses/CourseDetails/hooks/useCourseDetails";
import { useEffect, useMemo } from "react";

const CreateCoursePage = ({ metadata: propMetadata }) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [prerequisiteLoading, setPrerequisiteLoading] = useState(true);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const thumbnailUpload = useUpload();
  const certificateUpload = useUpload();

  const { push } = useHistory();
  const appManager = useApp();
  const metadata = propMetadata || appManager.state.metadata;

  const { courseDetails, fetchCourseDetails } = useCourseDetails();
  const { id: courseId } = useParams();
  const isEditMode = useMemo(() => courseId && courseId !== "new", [courseId]);

  const { handleDelete } = useCache();

  const onSubmit = async (data) => {
    try {
      if (!selectedDepartmentId) {
        throw new Error("Please select a department");
      }

      const courseThumbnail =
        thumbnailUpload.handleGetFileAndValidate("Course Image");
      const certificate =
        certificateUpload.handleGetFileAndValidate("Certificate");

      data = {
        ...data,
        departmentId: selectedDepartmentId,
        courseThumbnail,
        certificate,
      };

      const body = appendFormData(data);

      const { course, message } = await (isEditMode
        ? adminEditCourse(courseId, body)
        : adminCreateCourse(body));

      if (isEditMode) handleDelete(courseDetailsData.id);

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      push(`/admin/courses/details/${course.id}/info`);
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchCourseDetails();
    }
  }, [fetchCourseDetails, isEditMode]);

  const courseDetailsData = courseDetails.data;
  const isLoading = courseDetails.loading;
  const isError = courseDetails.err;

  // get courses under selected department
  useEffect(() => {
    setPrerequisiteLoading(true);
    const getPrerequisite = async () => {
      try {
        const { courses } = await adminGetCoursesByDepartment(
          selectedDepartmentId
        );
        setPrerequisites(courses);
        setPrerequisiteLoading(false);
      } catch (error) {
        toast({
          description: capitalizeFirstLetter(error.message),
          position: "top",
          status: "error",
        });
      }
    };

    if (selectedDepartmentId) getPrerequisite();

    // eslint-disable-next-line
  }, [selectedDepartmentId]);

  // set image files for edit
  useEffect(() => {
    if (courseDetailsData) {
      thumbnailUpload.handleInitialImageSelect(courseDetailsData.thumbnail);
      certificateUpload.handleInitialImageSelect(courseDetailsData.certificate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetailsData]);

  // set title for edit
  useEffect(() => {
    if (courseDetailsData) {
      setValue("title", courseDetailsData.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetailsData]);

  // set department for edit
  useEffect(() => {
    if (courseDetailsData && metadata?.departments) {
      setSelectedDepartmentId(courseDetailsData.departmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetailsData, metadata?.departments]);

  // set prerequisite for edit
  useEffect(() => {
    if (courseDetailsData && prerequisites) {
      setValue("preRequisiteId", courseDetailsData.preRequisiteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetailsData, prerequisites]);

  useEffect(() => {
    if (courseDetailsData) {
      setValue("description", courseDetailsData.description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetailsData]);

  const populateDepartmentOptions = (data, filterBody = () => true) => {
    return data?.filter(filterBody)?.map((item) => ({
      label: capitalizeWords(item.name),
      value: item.id,
    }));
  };

  const populatePrerequisiteOptions = (data) => {
    return data?.map((item) => ({
      label: capitalizeWords(item.title),
      value: item.id,
    }));
  };

  return isLoading || isError ? (
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
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Courses</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <CreatePageLayout
        title="Create Course"
        submitButtonText={isEditMode ? "Update Course" : "Submit"}
        onSubmit={handleSubmit(onSubmit)}
        submitButtonIsLoading={isSubmitting}
      >
        <Box
          as="div"
          display={{ lg: "grid", base: "flex", md: "flex" }}
          flexDirection={{ base: "column", md: "column" }}
          gridTemplateColumns="1fr 1fr"
          gap={10}
          marginBottom={10}
        >
          {/* Row 1 */}
          <Input
            label="Course title"
            isRequired
            id="title"
            {...register("title", {
              required: "Title is required",
            })}
            error={errors.title?.message}
          />
          <Select
            isRequired
            label="Select department"
            options={populateDepartmentOptions(metadata?.departments)}
            id="departmentId"
            isLoading={!metadata?.departments}
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
          />
        </Box>
        <Box
          as="div"
          display={{ lg: "grid", base: "flex", md: "flex" }}
          flexDirection={{ base: "column", md: "column" }}
          gridTemplateColumns="1fr 1fr"
          gap={10}
          marginBottom={10}
        >
          {/* Row 2 */}
          <Select
            label="Select prerequisite"
            options={populatePrerequisiteOptions(prerequisites)}
            id="preRequisiteId"
            placeholder={prerequisiteLoading ? "waiting for department..." : ""}
            isLoading={prerequisiteLoading}
            {...register("preRequisiteId")}
            error={errors.preRequisiteId?.message}
          />
        </Box>
        {/* Row 3 */}
        <Grid marginBottom={10}>
          <Textarea
            minHeight="150px"
            label="Course description"
            id="description"
            isRequired
            {...register("description", {
              required: "Please add a description",
            })}
            error={errors.description?.message}
          />
        </Grid>
        {/* Row 4 */}
        <Grid marginBottom={10}>
          <GridItem colSpan={2}>
            <Upload
              id="thumbnail"
              isRequired
              label="Course Image"
              onFileSelect={thumbnailUpload.handleFileSelect}
              imageUrl={thumbnailUpload.image.url}
              accept={thumbnailUpload.accept}
            />
          </GridItem>
        </Grid>
        {/* Row 5 */}
        <Grid marginBottom={10}>
          <GridItem colSpan={2}>
            <Upload
              id="course-certificate"
              label="Course Certificate"
              isRequired
              onFileSelect={certificateUpload.handleFileSelect}
              imageUrl={certificateUpload.image.url}
              accept={certificateUpload.accept}
            />
          </GridItem>
        </Grid>
        {/* Row 6 */}
        <Grid marginBottom={10}>
          <GridItem>
            <Checkbox
              label="Use default certificate"
              borderColor="primary.base"
              isChecked
              disabled
            />
          </GridItem>
        </Grid>
      </CreatePageLayout>
    </>
  );
};

export const CreateCoursePageRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CreateCoursePage {...props} />} />
  );
};
