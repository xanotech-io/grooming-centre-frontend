import { useState } from "react";
import { useToast } from "@chakra-ui/toast";
import { Flex, Grid, GridItem } from "@chakra-ui/layout";
import { useForm } from "react-hook-form";
import { Route } from "react-router-dom";
import {
  Input,
  RichText,
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
  adminGetWorkflowSupervisors,
} from "../../../services";
import { useUpload, useRichText } from "../../../hooks";
import useCourseDetails from "../../user/Courses/CourseDetails/hooks/useCourseDetails";
import { useEffect, useMemo } from "react";

const CreateCoursePage = ({ metadata: propMetadata }) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [prerequisiteLoading, setPrerequisiteLoading] = useState(true);
  const [supervisorsLoading, setSupervisorsLoading] = useState(true);
  const [useDefaultCertificate, setUseDefaultCertificate] = useState(true);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const thumbnailUpload = useUpload();
  const certificateUpload = useUpload();
  const descriptionManager = useRichText();

  const { push } = useHistory();
  const appManager = useApp();
  const metadata = propMetadata || appManager.state.metadata;

  const currentUserRoleName = appManager.getOneMetadata(
    "userRoles",
    appManager.state.user?.userRoleId
  )?.name;
  const isSuperAdmin = /super admin/i.test(currentUserRoleName);
  const supervisorIsRequired = !isSuperAdmin;

  const { courseDetails, fetchCourseDetails } = useCourseDetails();
  const { id: courseId } = useParams();
  const isEditMode = useMemo(() => courseId && courseId !== "new", [courseId]);

  const { handleDelete } = useCache();

  const onSubmit = async (data) => {
    try {
      if (!selectedDepartmentId) {
        throw new Error("Please select a department");
      }

      if (supervisorIsRequired && !selectedSupervisorId) {
        throw new Error("Please select a supervisor");
      }

      const description = descriptionManager.handleGetValueAndValidate("Course Description");
      const courseThumbnail =
        thumbnailUpload.handleGetFileAndValidate("Course Image");
      const certificate = certificateUpload.handleGetFileAndValidate(
        "Certificate",
        true
      );

      data = {
        ...data,
        description,
        departmentId: selectedDepartmentId,
        supervisor_id: selectedSupervisorId,
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

  // Fetch supervisors — requires a department to be selected first
  useEffect(() => {
    if (!selectedDepartmentId) {
      setSupervisors([]);
      setSelectedSupervisorId(null);
      setSupervisorsLoading(false);
      return;
    }

    setSupervisorsLoading(true);
    const getSupervisors = async () => {
      try {
        const { supervisors } = await adminGetWorkflowSupervisors(
          selectedDepartmentId
        );
        setSupervisors(supervisors);
        setSupervisorsLoading(false);
      } catch (error) {
        toast({
          description: capitalizeFirstLetter(error.message),
          position: "top",
          status: "error",
        });
        setSupervisorsLoading(false);
      }
    };

    getSupervisors();
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

  // set title, duration, timeline for edit
  useEffect(() => {
    if (courseDetailsData) {
      setValue("title", courseDetailsData.title);
      if (courseDetailsData.duration != null) setValue("duration", courseDetailsData.duration);
      if (courseDetailsData.timeline != null) setValue("timeline", courseDetailsData.timeline);
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

  // set supervisor for edit
  useEffect(() => {
    if (courseDetailsData) {
      setSelectedSupervisorId(courseDetailsData.supervisorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetailsData]);

  useEffect(() => {
    if (courseDetailsData) {
      descriptionManager.handleInitData(courseDetailsData.description);
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

  const populateSupervisorOptions = (data) => {
    return data?.map((item) => ({
      label: capitalizeWords(item.name || item.fullName || item.email || "Supervisor"),
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
          <Select
            label="Select supervisor"
            isRequired={supervisorIsRequired}
            options={populateSupervisorOptions(supervisors)}
            id="supervisorId"
            placeholder={
              !selectedDepartmentId
                ? "select a department first"
                : supervisorsLoading
                ? "loading supervisors..."
                : ""
            }
            isLoading={supervisorsLoading}
            isDisabled={!selectedDepartmentId}
            value={selectedSupervisorId}
            onChange={(e) => setSelectedSupervisorId(e.target.value)}
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
          {/* Row 2b — Duration & Timeline */}
          <Input
            label="Duration (days)"
            id="duration"
            type="number"
            placeholder="e.g. 30"
            {...register("duration", {
              min: { value: 1, message: "Duration must be at least 1" },
            })}
            error={errors.duration?.message}
          />
          {/* <Input
            label="Timeline"
            id="timeline"
            type="number"
            placeholder="e.g. 12"
            {...register("timeline", {
              min: { value: 1, message: "Timeline must be at least 1" },
            })}
            error={errors.timeline?.message}
          /> */}
        </Box>
        {/* Row 3 */}
        <Grid marginBottom={10}>
          <RichText
            id="description"
            label="Course description"
            isRequired
            defaultValue={descriptionManager.data.default}
            onChange={descriptionManager.handleChange}
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
              isDisabled={useDefaultCertificate}
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
              isChecked={useDefaultCertificate}
              onChange={(e) => setUseDefaultCertificate(e.target.checked)}
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
