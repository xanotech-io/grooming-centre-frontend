import { useToast } from '@chakra-ui/toast';
import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Route } from 'react-router-dom';
import {
  Text,
  Heading,
  Input,
  Button,
  Upload,
  PasswordInput,
  PhoneNumberInput,
} from '../../../../components';
import { requestUpdateDetails } from '../../../../services';
import { useHistory } from 'react-router-dom';
import { capitalizeFirstLetter } from '../../../../utils/formatString';
import breakpoints from '../../../../theme/breakpoints';
import {
  useRedirectNonAuthUserToSigninPage,
  usePageRefreshAfterLogin,
} from '../../../../hooks';

const UpdateDetailsPage = () => {
  usePageRefreshAfterLogin();
  useRedirectNonAuthUserToSigninPage();

  const toast = useToast();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();
  const values = getValues();
  const { replace } = useHistory();

  const onSubmit = async (data) => {
    try {
      const body = { password: data.password };

      const { message } = await requestUpdateDetails(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: 'top',
        status: 'success',
      });
      reset();

      replace('/');
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: 'top',
        status: 'error',
      });
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      overflowY="auto"
      justifyContent="center"
      backgroundColor="white"
      zIndex={1}
      padding={10}
    >
      <Box
        width="100%"
        maxWidth={breakpoints.tablet}
        marginX="auto"
        paddingY={5}
      >
        <Box
          as="header"
          padding={10}
          marginBottom={8}
          width="100%"
          shadow="0px 2px 7px rgba(0, 0, 0, 0.1)"
        >
          <Heading marginBottom={5} as="h1" fontSize="heading.h3">
            Welcome Onboard
          </Heading>

          <Text>Kindly update your personal details</Text>
        </Box>

        <Box
          as="main"
          padding={10}
          width="100%"
          shadow="0px 2px 7px rgba(0, 0, 0, 0.1)"
        >
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid templateColumns="repeat(2, 1fr)" gap={10} marginBottom={10}>
              <GridItem colSpan={2}>
                <Heading marginBottom={5} fontSize="heading.h4">
                  Profile
                </Heading>
                <Text>
                  This information will be displayed publicly, so be careful
                  what you share
                </Text>
              </GridItem>

              <Input
                data-testid="input"
                id="firstName"
                error={errors.firstName?.message}
                label="First Name"
                isRequired
                {...register('firstName', {
                  required: 'First Name is required',
                })}
              />
              <Input
                data-testid="input"
                id="lastName"
                error={errors.lastName?.message}
                label="Last Name"
                isRequired
                {...register('lastName', {
                  required: 'Last Name is required',
                })}
              />

              <Upload
                isMini
                id="profilePicture"
                label="Profile Picture"
                // error={errors.lastName?.message} // TODO: handle error inside the component
              />

              {/* empty column */}
              <Box></Box>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={10} marginBottom={10}>
              <GridItem colSpan={2}>
                <Heading marginBottom={5} fontSize="heading.h4">
                  Personal Information
                </Heading>
                <Text>
                  This information is private and will be used in the recovery
                  of your account
                </Text>
              </GridItem>

              <Input
                data-testid="input"
                id="email"
                error={errors.email?.message}
                label="Email Address"
                type="email"
                isRequired
                {...register('email', {
                  required: 'Email is required',
                })}
              />
              <PhoneNumberInput
                data-testid="input"
                id="phone"
                error={errors.phone?.message}
                label="Phone Number"
                type="number"
                {...register('phone')}
              />
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={10} marginBottom={10}>
              <GridItem colSpan={2}>
                <Heading marginBottom={5} fontSize="heading.h4">
                  Security
                </Heading>
                <Text>Kindly set a new password for your account</Text>
              </GridItem>

              <PasswordInput
                data-testid="input"
                id="password"
                error={errors.password?.message}
                label="New Password"
                type="password"
                isRequired
                {...register('password', {
                  required: 'New Password is required',
                })}
              />
              <PasswordInput
                data-testid="input"
                id="confirmPassword"
                error={errors.confirmPassword?.message}
                label="Confirm Password"
                type="password"
                isRequired
                {...register('confirmPassword', {
                  required: 'Confirm Password is required',
                  validate: (value) =>
                    value === values.password || 'Password must match',
                })}
              />
            </Grid>

            <Flex justifyContent="flex-end">
              <Button secondary marginRight={6} link="/">
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
        </Box>
      </Box>
    </Box>
  );
};

export const UpdateDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <UpdateDetailsPage {...props} />} />
  );
};

export default UpdateDetailsPage;
