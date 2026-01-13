import { Flex } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Route } from "react-router-dom";
import {
  Brand,
  Button,
  Checkbox,
  Input,
  Link,
  PasswordInput,
  Text,
} from "../../../components";
import { useApp } from "../../../contexts";
import {
  useRemoveRefresh,
  useRedirectAuthUserToRoleScreens,
  useBlockAuthenticatedUserFromPage,
} from "../../../hooks";
import { OnBoardingFormLayout } from "../../../layouts";
import { requestSignin } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils/formatString";

const SigninPage = () => {
  useRemoveRefresh();
  useBlockAuthenticatedUserFromPage();

  const toast = useToast();
  // const { replace } = useHistory();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm();
  const appManager = useApp();

  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const onSubmit = async (data) => {
    try {
      const { user, token } = await requestSignin(data);

      appManager.handleSetToken(token);
      appManager.handleSetCurrentUser(user);

      setIsCheckingAuth(true);

      // if (user.isInviteActive) {
      //   replace("/auth/new-password");
      // } else {
      //   setIsCheckingAuth(true);
      // }

      reset();
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <OnBoardingFormLayout
      renderHeader={() => (
        <Flex justifyContent="center" textAlign="left">
          <Brand />
        </Flex>
      )}
      renderInputs={() => (
        <>
          <Input
            id="email"
            type="text"
            label="Staff ID or Email"
            {...register("email", {
              required: "Staff ID is required",
            })}
          />

          {errors.email ? (
            <Text color="secondary.5" style={{ marginTop: 0 }}>
              {errors.email.message}
            </Text>
          ) : null}

          <PasswordInput
            id="password"
            label="Password"
            {...register("password", {
              required: "Password can't be empty",
              minLength: {
                value: 3,
                message: "Password should not be less than 3 characters",
              },
            })}
          />

          {errors.password ? (
            <Text color="secondary.5" style={{ marginTop: 0 }}>
              {errors.password.message}
            </Text>
          ) : null}

          {isCheckingAuth && <AuthCheckAndRedirect />}
        </>
      )}
      onSubmit={handleSubmit(onSubmit)}
      renderSubmit={(props) => (
        <Button
          {...props}
          isLoading={isSubmitting || isCheckingAuth}
          disabled={isSubmitting || isCheckingAuth}
          loadingText="Sign in"
        >
          Sign in
        </Button>
      )}
      renderFooter={() => (
        <Flex justifyContent="space-between">
          <Checkbox label="Remember me" />

          <Link href="/auth/forgot-password">
            <Text color="primary.base">Forgot Password?</Text>
          </Link>
        </Flex>
      )}
    />
  );
};

const AuthCheckAndRedirect = () => {
  useRedirectAuthUserToRoleScreens(1000);

  return null;
};

export const SigninPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <SigninPage {...props} />} />;
};
