import { Grid, Stack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { Route, useParams, useHistory } from "react-router-dom";
import { BreadcrumbItem, Box } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useViewUserDetails } from "../users/UserInfoPage/pages/ProfilePage";
import useCreateUser from "../users/hooks/useCreateUser";
import { useApp, useCache } from "../../../contexts";
import {
  adminCreatePoll,
  adminEditUser,
  adminInviteUser2,
  superAdminInviteAdmin,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { Breadcrumb, Input, Link, Select, Textarea } from "../../../components";
import { CreatePageLayout } from "../../../layouts";

const CreatePollsPage = ({
  creatorRoleIsSuperAdmin,
  metadata: propMetadata,
}) => {
  const toast = useToast();
  const appManager = useApp();
  const {
    formManager,
    departmentIsRequired,
    handleResetDepartmentIsRequired,
    setStatus,
    // status,
  } = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = formManager;

  const { push } = useHistory();

  const { id: userId } = useParams();
  const isEditMode = useMemo(() => userId && userId !== "new", [userId]);

  const { user } = useViewUserDetails();

  const metadata = propMetadata || appManager.state.metadata;

  const { handleDelete } = useCache();

  const onSubmit = async (data) => {
    try {
      const { message, user } = await (isEditMode
        ? adminEditUser(userId, {
            departmentId: data.departmentId,
            firstName: data.firstName,
            gender: data.gender,
            lastName: data.lastName,
            roleId: data.roleId,
          })
        : adminCreatePoll(data));

      if (isEditMode) handleDelete(user.id);

      setStatus({
        success: message,
      });

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      reset();

      push("/admin/polls/");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/users">Users</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Poll</Link>
            </BreadcrumbItem>
          }
        />
      </Box>
      <CreatePageLayout
        title="Create Poll"
        submitButtonText={isEditMode ? "Update User" : "Submit"}
        submitButtonIsLoading={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={10} marginBottom={10}>
          <Box
            display={{ base: "flex", md: "flex", lg: "grid" }}
            flexDirection="column"
            templateColumns="repeat(2, 1fr)"
            gap={10}
            marginBottom={10}
          >
            <Textarea
              minHeight="160px"
              label="Question"
              id="question"
              isRequired
              {...register("question", {
                required: "Please add a question",
                maxLength: 1000,
              })}
              error={
                errors.question?.type === "maxLength"
                  ? "Maximum length of 1000 characters"
                  : errors.question?.message
              }
            />
          </Box>
        </Stack>
      </CreatePageLayout>
    </>
  );
};

export const CreatePollsPageRoute = ({ component: Component, ...rest }) => {
  const { state, getOneMetadata } = useApp();

  const creatorRoleIsSuperAdmin =
    getOneMetadata("userRoles", state.user?.userRoleId)?.name === "super admin";

  return (
    <Route
      {...rest}
      render={(props) => (
        <CreatePollsPage
          creatorRoleIsSuperAdmin={creatorRoleIsSuperAdmin}
          {...props}
        />
      )}
    />
  );
};

export default CreatePollsPage;
