import { Box, BreadcrumbItem, Flex, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Route, useHistory } from "react-router-dom";
import { Breadcrumb, Link, Select, Textarea } from "../../../components";
import { useApp } from "../../../contexts";
import { CreatePageLayout } from "../../../layouts";
import {
  adminCreateAnnouncement,
  adminEditAnnouncement,
} from "../../../services";
import { capitalizeFirstLetter, capitalizeWords } from "../../../utils";
import { useQueryParams } from "../../../hooks";
import useAnnoucement from "./useAnnoucement";

const CreateAnnouncement = () => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const toast = useToast();

  const {
    state: { allMetadata: metadata },
  } = useApp();

  const { push } = useHistory();

  const announceId = useQueryParams().get("announcement");

  const isEditMode = announceId && announceId !== "new";

  const { announcementDetails } = useAnnoucement();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Init `Text` value
  useEffect(() => {
    if (announcementDetails) {
      setValue("text", announcementDetails.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementDetails]);

  // Init `DepartmentId` value
  useEffect(() => {
    if (announcementDetails) {
      setValue("departmentId", announcementDetails.departmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementDetails, metadata]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const body = {
        ...data,
      };

      const { message } = await (isEditMode
        ? adminEditAnnouncement(announceId, body)
        : adminCreateAnnouncement(body));

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      push(`/admin/announcement`);
    } catch (error) {
      console.error(error);
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  const populateDepartmentOptions = (data, filterBody = () => true) => {
    return data?.filter(filterBody)?.map((item) => ({
      label: capitalizeWords(item.name),
      value: item.id,
    }));
  };
  return (
    <CreatePageLayout
      title={`${isEditMode ? "Edit" : "Create"} Announcement`}
      submitButtonText={isEditMode ? "Update" : "Submit"}
      onSubmit={handleSubmit(onSubmit)}
      // submitButtonIsLoading={isSubmitting || isLoading}
      // submitButtonIsDisabled={
      //   isSubmitting || isLoading || hasError || disableSubmit
      // }
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/announcement">Announcements</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Announcement</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box
        as="div"
        display={{ lg: "grid", base: "flex", md: "flex" }}
        flexDirection={{ base: "column", md: "column" }}
        gridTemplateColumns="1fr 1fr"
        gap={10}
        marginBottom={10}
      >
        <Textarea
          minHeight="150px"
          label="Content"
          id="text"
          isRequired
          {...register("text", {
            required: "Content is required",
            maxLength: 1000,
          })}
          error={
            errors.description?.type === "maxLength"
              ? "Maximum length of 1000 characters"
              : errors.description?.message
          }
        />
        {/* <Input
          label="Text"
          isRequired
          id="text"
          {...register('text', {
            required: 'Text is required',
          })}
          error={errors.text?.message}
        /> */}

        <Select
          isRequired
          label="Select department"
          options={populateDepartmentOptions(metadata?.departments)}
          id="departmentId"
          isLoading={!metadata?.departments}
          value={selectedDepartmentId}
          {...register("departmentId", {
            required: "Please select a department",
          })}
          onChange={(e) => setSelectedDepartmentId(e.target.value)}
        />
      </Box>
    </CreatePageLayout>
  );
};

export const CreateAnnouncementRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CreateAnnouncement {...props} />} />
  );
};
