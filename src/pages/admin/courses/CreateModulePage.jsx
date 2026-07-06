import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/toast";
import { Grid, GridItem } from "@chakra-ui/layout";
import { useForm } from "react-hook-form";
import { Route, useParams, useHistory } from "react-router-dom";
import {
  Input,
  Textarea,
  Select,
  Breadcrumb,
  Link,
  Spinner,
  WorkflowSubmitModal,
} from "../../../components";
import { CreatePageLayout } from "../../../layouts";
import { BreadcrumbItem, Box } from "@chakra-ui/react";
import { useCache } from "../../../contexts";
import {
  adminCreateModule,
  adminGetModule,
  adminUpdateModule,
} from "../../../services";
import { useFetch } from "../../../hooks";
import { useCallback } from "react";

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const CreateModulePage = () => {
  const { courseId, moduleId } = useParams();
  const isEditMode = moduleId && moduleId !== "new";
  const { push } = useHistory();
  const toast = useToast();
  const { handleDelete } = useCache();
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      status: "active",
    },
  });

  // Fetch module data when editing
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    if (!isEditMode) return null;
    const { module } = await adminGetModule(courseId, moduleId);
    return { module };
  }, [courseId, moduleId, isEditMode]);

  useEffect(() => {
    handleFetchResource({ fetcher });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Populate form with existing module data
  useEffect(() => {
    if (resource?.data?.module) {
      const mod = resource.data.module;
      setValue("title", mod.title);
      setValue("description", mod.description);
      setValue("sequenceOrder", mod.sequenceOrder);
      setValue("status", mod.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const onSubmit = async (data) => {
    try {
      const body = {
        title: data.title,
        description: data.description,
        sequenceOrder: Number(data.sequenceOrder),
        status: data.status,
      };

      if (isEditMode) {
        const { message } = await adminUpdateModule(moduleId, body);
        toast({ title: message, status: "success", duration: 3000 });
      } else {
        const { message, module } = await adminCreateModule(courseId, body);
        toast({ title: message, status: "success", duration: 3000 });

        setWorkflowContent({
          contentId: module?.id ?? moduleId,
          contentTitle: data.title,
          requestType: "Module",
          courseId,
        });
        setWorkflowModalOpen(true);
      }

      handleDelete("modules");
      if (isEditMode) {
        push(`/admin/courses/details/${courseId}/modules`);
      }
    } catch (error) {
      toast({
        title: error?.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (isEditMode && resource?.isLoading) {
    return (
      <Box display="flex" justifyContent="center" paddingTop="100px">
        <Spinner />
      </Box>
    );
  }

  return (
    <>
      <Breadcrumb
        item2={
          <BreadcrumbItem>
            <Link href="/admin/courses">Courses</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem>
            <Link href={`/admin/courses/details/${courseId}/modules`}>
              Modules
            </Link>
          </BreadcrumbItem>
        }
        item4={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">{isEditMode ? "Edit Module" : "Add Module"}</Link>
          </BreadcrumbItem>
        }
      />

      <CreatePageLayout
        title={isEditMode ? "Edit Module" : "Add Module"}
        submitButtonText={isEditMode ? "Save Changes" : "Create Module"}
        submitButtonIsLoading={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap={6}
          marginBottom={6}
        >
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Input
              label="Module Title"
              placeholder="e.g. Module 1: Introduction to Grooming"
              isRequired
              error={errors.title?.message}
              {...register("title", {
                required: "Module title is required",
              })}
            />
          </GridItem>

          <GridItem>
            <Input
              label="Sequence Order"
              type="number"
              placeholder="e.g. 1"
              isRequired
              error={errors.sequenceOrder?.message}
              {...register("sequenceOrder", {
                required: "Sequence order is required",
                min: { value: 1, message: "Order must be at least 1" },
              })}
            />
          </GridItem>

          <GridItem>
            <Select
              label="Status"
              isRequired
              options={STATUS_OPTIONS}
              placeholder="Select status"
              error={errors.status?.message}
              {...register("status", {
                required: "Status is required",
              })}
            />
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Textarea
              label="Description"
              placeholder="Describe what this module covers..."
              error={errors.description?.message}
              {...register("description")}
            />
          </GridItem>
        </Grid>
      </CreatePageLayout>

      {workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          courseId={workflowContent.courseId}
          onSuccess={() => push(`/admin/courses/details/${courseId}/modules`)}
        />
      )}
    </>
  );
};

export const CreateModulePageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <CreateModulePage {...props} />} />;
};

export default CreateModulePageRoute;
