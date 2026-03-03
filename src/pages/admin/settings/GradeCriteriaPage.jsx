import { Box, Flex, Grid, Stack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useCallback } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BiCertification } from "react-icons/bi";
import { FiCheckSquare } from "react-icons/fi";
import { ImArrowUp } from "react-icons/im";
import { Route } from "react-router-dom";
import {
  Button,
  Heading,
  Input,
  SkeletonText,
  Text,
} from "../../../components";
import { useFetch } from "../../../hooks";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  adminEditGradeCriteria,
  adminGetGradeCriteria,
} from "../../../services";
import { appendFormData, capitalizeFirstLetter } from "../../../utils";
import { OverviewBox } from "../users/UserInfoPage/pages/ProfilePage";

const useGradeCriteriaDetails = () => {
  const { resource: gradeCriteria, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { gradeCriteria } = await adminGetGradeCriteria();
    return gradeCriteria;
  }, []);

  // Handle fetch grade criteria
  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  return {
    gradeCriteria,
  };
};

const GradeCriteriaPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const toast = useToast();

  const { gradeCriteria } = useGradeCriteriaDetails();
  console.log(gradeCriteria);

  const onSubmit = async (data) => {
    console.log(data);

    try {
      const body = appendFormData(data);

      const { message } = await adminEditGradeCriteria(body);
      window.location.reload();
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <AdminMainAreaWrapper paddingY={8}>
      <Heading fontSize="heading.h3" marginBottom={4} marginTop={6}>
        Grade Criteria
      </Heading>
      <Grid
        templateColumns={{ lg: "repeat(3, minmax(150px, 1fr))" }}
        gridAutoRows="100px"
        gap={3}
        rowGap={6}
      >
        <OverviewBox
          href="#"
          children={
            gradeCriteria.loading ? (
              <SkeletonText numberOfLines={1} width="60px" />
            ) : (
              <Text bold as="level2">
                {gradeCriteria?.data?.[0].totalExaminationScore}
              </Text>
            )
          }
          title={
            gradeCriteria.loading ? (
              <SkeletonText paddingTop={2} numberOfLines={1} />
            ) : (
              "Exams"
            )
          }
          icon={<ImArrowUp />}
          iconBackgroundColor="accent.6"
        />
        <OverviewBox
          href="#"
          children={
            gradeCriteria.loading ? (
              <SkeletonText numberOfLines={1} width="60px" />
            ) : (
              <Text bold as="level2">
                {gradeCriteria?.data?.[0].totalAssessmentScore}
              </Text>
            )
          }
          title={
            gradeCriteria.loading ? (
              <SkeletonText paddingTop={2} numberOfLines={1} />
            ) : (
              "Assessments"
            )
          }
          icon={<FiCheckSquare />}
          iconBackgroundColor="accent.7"
        />
        <OverviewBox
          href="#"
          children={
            gradeCriteria.loading ? (
              <SkeletonText numberOfLines={1} width={10} />
            ) : (
              <Text bold as="level2">
                {gradeCriteria?.data?.[0].totalAttendanceScore}
              </Text>
            )
          }
          title={
            gradeCriteria.loading ? (
              <SkeletonText paddingTop={2} numberOfLines={1} />
            ) : (
              "Attendance"
            )
          }
          icon={<BiCertification />}
          iconBackgroundColor="secondary.5"
        />
      </Grid>
      <Box backgroundColor="white" padding={10} mt={6}>
        <Heading fontSize="heading.h3" marginTop={12}>
          Change the Grade Criteria
        </Heading>
        <Box
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          marginTop={6}
          padding={6}
          boxShadow="0 0 10px 3px rgba(0, 0, 0, .1)"
        >
          <Stack spacing={8} width={{ lg: "50%", base: "100%" }}>
            <Input
              type="number"
              label="Examination"
              id="totalExaminationScore"
              {...register("totalExaminationScore", {
                required: "Examination score is required",
              })}
              error={errors.totalExaminationScore?.message}
            />
            <Input
              type="number"
              label="Assessment"
              id="totalAssessmentScore"
              {...register("totalAssessmentScore", {
                required: "Assessment score is required",
              })}
              error={errors.totalAssessmentScore?.message}
            />
            <Input
              type="number"
              label="Attendance"
              id="totalAttendanceScore"
              {...register("totalAttendanceScore", {
                required: "Attendance score is required",
              })}
              error={errors.totalAttendanceScore?.message}
            />
          </Stack>
          <Flex paddingTop={8} justifyContent="flex-end">
            <Button type="submit" isLoading={isSubmitting}>
              Update
            </Button>
          </Flex>
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const GradeCriteriaPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <GradeCriteriaPage {...props} />} />
  );
};
