import { Box, Flex, Grid, GridItem } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Route, useHistory } from "react-router-dom";
import {
  Button,
  Heading,
  Input,
  PasswordInput,
  PhoneNumberInput,
  Select,
  Text,
  Upload,
} from "../../../components";
import { useApp } from "../../../contexts";
import { useUpload, useGoBack } from "../../../hooks";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { requestUpdateDetails, updatePassword } from "../../../services";
import {
  appendFormData,
  capitalizeFirstLetter,
  capitalizeWords,
} from "../../../utils";

export const AccountPage = ({ onCallToActionClick }) => {
  const {
    state: { user, metadata },
    fetchCurrentUser,
    handleLogout,
  } = useApp();

  const toast = useToast();
  const thumbnailUpload = useUpload();
  const { replace } = useHistory();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue: setValues2,
    getValues: getvalues2,
    formState: { errors: errors2, isSubmitting: isSubmitting2 },
    reset: reset2,
  } = useForm();
  const values = getValues();
  const values2 = getvalues2();
  const onSubmit = async (data) => {
    try {
      const profilePicture =
        thumbnailUpload.handleGetFileAndValidate("Profile Picture");

      data = {
        ...data,
        profilePicture,
      };
      Reflect.deleteProperty(data, "confirmPassword");
      Reflect.deleteProperty(data, "department");
      Reflect.deleteProperty(data, "role");
      const body = appendFormData(data);

      const { message } = await requestUpdateDetails(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      reset();

      if (data.password) {
        handleLogout();
      }

      fetchCurrentUser();

      if (onCallToActionClick) {
        return onCallToActionClick();
      }

      replace("/admin");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };
  const onSubmit2 = async (data) => {
    try {
      data = {
        password: data?.new_password,
      };

      const body = data;

      const { message } = await updatePassword(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      reset();

      if (message==="password changed") {
        handleLogout();
      }

      fetchCurrentUser();

      if (onCallToActionClick) {
        return onCallToActionClick();
      }

      replace("/admin");
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
      console.log({ user });
      setValue("firstName", user.firstName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setValue("lastName", user.lastName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setValue("gender", user.gender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      thumbnailUpload.handleInitialImageSelect(user.profilePics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setValue("email", user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setValue("phone", user.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user && metadata?.departments) {
      console.log(user.departmentId, metadata.departments[0]);

      const department = metadata.departments.find(
        ({ id }) => id === user.departmentId
      )?.name;

      setValue("department", department);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, metadata?.departments]);

  useEffect(() => {
    if (user && metadata?.userRoles) {
      const role = metadata.userRoles.find(
        ({ id }) => id === user.userRoleId
      )?.name;

      setValue("role", capitalizeWords(role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, metadata?.userRoles]);

  const handleGoBack = useGoBack();

  return (
    <AdminMainAreaWrapper bg='#fff'>
      <Box as="form" paddingY={2} onSubmit={handleSubmit(onSubmit)}>
        {!onCallToActionClick && (
          <Heading fontSize="heading.h3" paddingBottom={4}>
            Account
          </Heading>
        )}
        <Box
          as="div"
          display={{ lg: "grid", base: "flex", md: "flex" }}
          flexDirection="column"
          gridTemplateColumns="1fr 1fr"
          gap={10}
          marginBottom={6}
        >
          <GridItem colSpan={2}>
            <Heading marginBottom={4} fontSize="heading.h4">
              Profile
            </Heading>
            <Text>
              This information will be displayed publicly, so be careful what
              you share
            </Text>
          </GridItem>

          <Input
            data-testid="input"
            id="firstName"
            error={errors.firstName?.message}
            label="First Name"
            isRequired
            {...register("firstName", {
              required: "First name is required",
            })}
          />
          <Input
            data-testid="input"
            id="lastName"
            error={errors.lastName?.message}
            label="Last Name"
            isRequired
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          <Select
            id="gender"
            label="Gender"
            isRequired
            width="100%"
            options={[
              { label: "Female", value: "female" },
              { label: "Male", value: "male" },
            ]}
            {...register("gender", {
              required: "Please select your gender",
            })}
            error={errors.gender?.message}
          />

          <Input
            label="Department"
            id="department"
            isLoading={!metadata?.departments}
            {...register("department")}
            disabled
          />

          <Input
            label="Role"
            id="role"
            isLoading={!metadata?.userRoles}
            {...register("role")}
            disabled
          />
        </Box>

        <Box
          as="div"
          display={{ lg: "grid", base: "flex", md: "flex" }}
          flexDirection="column"
          gridTemplateColumns="1fr 1fr"
          gap={10}
          marginBottom={6}
          pt={7}
        >
          <GridItem colSpan={2}>
            <Heading marginBottom={4} fontSize="heading.h4">
              Personal Information
            </Heading>
            <Text>
              This information is private and will be used in the recovery of
              your account
            </Text>
          </GridItem>

          <GridItem colSpan={2}>
            <Box w="fit-content">
              <Upload
                isMini
                isRequired
                id="profilePics"
                label="Profile Picture"
                onFileSelect={thumbnailUpload.handleFileSelect}
                imageUrl={thumbnailUpload.image.url}
                accept={thumbnailUpload.accept}
              />
            </Box>
          </GridItem>

          <Input
            data-testid="input"
            id="email"
            error={errors.email?.message}
            label="Email Address"
            type="email"
            isRequired
            {...register("email", {
              required: "Email can't be empty",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Enter a valid e-mail address",
              },
            })}
          />
          <PhoneNumberInput
            data-testid="input"
            id="phone"
            error={errors.phone?.message}
            isRequired
            label="Phone Number"
            type="tel"
            {...register("phone", {
              required: "Phone number is required",
            })}
          />
        </Box>

        <Flex justifyContent={{ sm: "center", md: "center", lg: "flex-end" }}>
          <Button
            secondary
            marginRight={6}
            onClick={onCallToActionClick || handleGoBack}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Update
          </Button>
        </Flex>
      </Box>
      <Box
        onSubmit={handleSubmit2(onSubmit2)}
        as="form"
        display={{ lg: "grid", base: "flex", md: "flex" }}
        flexDirection="column"
        gridTemplateColumns="1fr 1fr"
        gap={10}
        marginBottom={6}
        pt={7}
      >
        <GridItem colSpan={2}>
          <Heading marginBottom={4} fontSize="heading.h4">
            Password Update
          </Heading>
          <Text>
            This information is private and will be used in the recovery of your
            account
          </Text>
        </GridItem>

        <PasswordInput
          id="old_password"
          label="Old password"
          error={errors2.old_password && "Old password is required"}
          {...register2("old_password", { required: true })}
        />
        <PasswordInput
          id="new_password"
          label="New password"
          error={errors2.new_password &&"New password is required and must be different from old password"}
          {...register2("new_password", {
            required: true,
            validate: (value) => value !== values2.old_password || "New password is required and must be different from old password",
  
            minLength: {
              value: 3,
            },
          })}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          error={errors2.confirmPassword?.message}
          {...register2("confirmPassword", {
            validate: (value) =>
              value === values2.new_password || "Password must match",
          })}
        />
        <Flex justifyContent={{ sm: "center", md: "center", lg: "flex-end" }}>
          <Button
            secondary
            marginRight={6}
            onClick={onCallToActionClick || handleGoBack}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid="submit"
            isLoading={isSubmitting2}
            disabled={isSubmitting2}
          >
            Update
          </Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const SettingsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AccountPage {...props} />} />;
};
