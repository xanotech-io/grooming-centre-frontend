import { Box, Flex, Grid } from "@chakra-ui/layout";
import { ImArrowUp } from "react-icons/im";
import { Route, useParams } from "react-router-dom";
import {
  Heading,
  Link,
  SkeletonText,
  Text,
  Breadcrumb,
  Button,
} from "../../../../../components";
import { useCache } from "../../../../../contexts";
import Icon from "@chakra-ui/icon";
import { FiCheckSquare } from "react-icons/fi";
import { BiCertification } from "react-icons/bi";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useComponentIsMount } from "../../../../../hooks";
import { useCallback, useEffect, useState } from "react";
import { adminGetUserDetails } from "../../../../../services";
import { Avatar, SkeletonCircle } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";

export const useViewUserDetails = () => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();
  const { id: userId } = useParams();

  const [userDetails, setUserDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });

  const fetcher = useCallback(async () => {
    const { user } = await adminGetUserDetails(userId);
    // console.log("User Details", user); // IGNORE
    return user;
  }, [userId]);
  const fetchUserDetails = useCallback(async () => {
    setUserDetails({ loading: true });

    try {
      const userDetails = await handleGetOrSetAndGet(userId, fetcher);
      if (componentIsMount.current) setUserDetails({ data: userDetails });
    } catch (err) {
      console.error(err);
      if (componentIsMount.current) setUserDetails({ err: err.message });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, componentIsMount]);

  useEffect(() => {
    if (userId !== "new") fetchUserDetails();
  }, [fetchUserDetails, userId]);

  const user = userDetails.data;
  console.log("user details hook", user);
  const isLoading = userDetails.loading;
  const error = userDetails.err;
  console.log(error);
  return {
    user,
    isLoading,
    error,
  };
};

const ProfilePage = () => {
  const { user, isLoading } = useViewUserDetails();

  const userIsLoading = isLoading;

  return (
    <>
      <Box paddingX={2}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/users">Users</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Profile</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Box marginTop={2} padding={2}>
        <Section
          heading="Profile"
          editButton={
            <Button
              link={`/admin/users/edit/${user?.id}`}
              paddingLeft={2}
              sizes="sm"
              rightIcon={<FaEdit />}
              secondary
            >
              Edit
            </Button>
          }
        >
          <Box backgroundColor="white" padding={5} paddingX={10} shadow="md">
            <Heading
              as="h3"
              fontSize="text.level3"
              color="accent.3"
              marginBottom={10}
            >
              USER INFORMATION
            </Heading>

            <Box
              display="flex"
              gap={5}
              flexDirection={{ lg: "row", base: "column" }}
            >
              <Box width="200px" height="200px">
                {userIsLoading ? (
                  <SkeletonCircle size="200px" />
                ) : (
                  <Avatar
                    name={user?.firstName + " " + user?.lastName}
                    width="100%"
                    height="100%"
                    src={user?.profilePics}
                    rounded="full"
                  />
                )}
              </Box>

              <Box marginTop={2} flex={1}>
                {userIsLoading ? (
                  <SkeletonText numberOfLines={3} spacing={5} />
                ) : (
                  <>
                    <Detail name="first name" value={user?.firstName} />
                    <Detail name="last name" value={user?.lastName} />
                    <Detail
                      name="Email"
                      value={user?.email}
                      valueProps={{ color: "primary.base" }}
                    />
                    <Detail name="Phone" value={user?.phone} />
                    <Detail name="gender" value={user?.gender} />
                  </>
                )}
                <Box>
                  {userIsLoading ? (
                    <SkeletonText numberOfLines={2} spacing={5} />
                  ) : (
                    <>
                      <Detail name="department" value={user?.departmentName} />
                      <Detail name="role" value={user?.userRoleName} />
                      <Detail name="professional certification" value={user?.professionalCertification} />
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Section>

        <Section heading="Overview">
          <Grid
            templateColumns={{
              lg: "repeat(3, minmax(150px, 1fr))",
              base: "1fr",
            }}
            gridAutoRows="100px"
            gap={3}
          >
            <OverviewBox
              value={user?.gradePoint}
              name="Grade Point"
              icon={<ImArrowUp />}
              iconBackgroundColor="accent.6"
              href={`/admin/users/details/${user?.id}/grade-history`}
              isLoading={userIsLoading}
            />
            <OverviewBox
              value={user?.completedCourses}
              name="Completed Courses"
              icon={<FiCheckSquare />}
              iconBackgroundColor="accent.7"
              href={`/admin/users/details/${user?.id}/courses`}
              isLoading={userIsLoading}
            />
            <OverviewBox
              value={user?.noOfCertificate}
              name="Certificates"
              icon={<BiCertification />}
              iconBackgroundColor="secondary.5"
              href={`/admin/users/details/${user?.id}/certificate`}
              isLoading={userIsLoading}
            />
            <OverviewBox
              value={user?.completedAssessment}
              name="Completed Assessments"
              icon={<HiOutlineSwitchHorizontal />}
              iconBackgroundColor="accent.8"
              href={`/admin/users/details/${user?.id}/courses`}
              isLoading={userIsLoading}
            />
              <OverviewBox
              value={user?.completedAssessment}
              name="Examination records"
              icon={<HiOutlineSwitchHorizontal />}
              iconBackgroundColor="accent.8"
              href={`/admin/users/details/${user?.id}/examination-records`}
              isLoading={userIsLoading}
            />
          </Grid>
        </Section>
      </Box>
    </>
  );
};

export const Detail = ({ name, value, valueProps }) => {
  console.log("data sent to detail", name, value);
  return (
    <Grid templateColumns="110px 1fr" spacing={5} marginBottom={5}>
      <Text bold textTransform="capitalize">
        {name}:
      </Text>
      <Text {...valueProps}>{value || "notSet"}</Text>
    </Grid>
  );
};

export const Section = ({ heading, children, editButton }) => {
  return (
    <Box as="section" marginBottom={10}>
      <Box
        as="header"
        display="flex"
        flexDirection={{ lg: "row", base: "column" }}
        justifyContent="space-between"
        rowGap={4}
      >
        <Heading fontSize="heading.h3">{heading}</Heading>
        <Box marginBottom={4}> {editButton}</Box>
      </Box>
      {children}
    </Box>
  );
};

export const OverviewBox = ({
  iconBackgroundColor,
  icon,
  name,
  value,
  title,
  children,
  href,
  isLoading,
}) => {
  const renderContent = (props) => (
    <Flex
      position="absolute"
      width="100%"
      height="100%"
      alignItems="center"
      backgroundColor="white"
      shadow="md"
      paddingX={5}
      _hover={{ transform: "scale(1.01)" }}
      {...props}
    >
      <Grid
        boxSize="55px"
        rounded="full"
        placeItems="center"
        backgroundColor={iconBackgroundColor}
        color="white"
      >
        <Icon fontSize="heading.h3">{icon} </Icon>
      </Grid>

      <Box marginLeft={7} flex={1}>
        {isLoading ? (
          <SkeletonText />
        ) : (
          <>
            {children}
            <Text bold as="level2">
              {value}
            </Text>
            {title}
            <Text>{name}</Text>
          </>
        )}
      </Box>
    </Flex>
  );

  return isLoading ? (
    renderContent({ position: "unset" })
  ) : (
    <Link href={href} style={{ position: "relative" }}>
      {renderContent()}
    </Link>
  );
};

const ProfilePageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProfilePage {...props} />} />;
};

export default ProfilePageRoute;
