import { Box, Center, Flex, Grid, GridItem } from "@chakra-ui/layout";
import { useCallback, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { FiUsers } from "react-icons/fi";
import { GiBookshelf, GiSpellBook } from "react-icons/gi";
// import { IoMdMore } from "react-icons/io";
import { IoCalendarOutline } from "react-icons/io5";
import { Route } from "react-router-dom";
import {
  Button,
  // Button,
  SkeletonText,
  Text,
} from "../../components";
import { useFetchAndCache } from "../../hooks";
import { AdminMainAreaWrapper } from "../../layouts";
import { adminGetDashboardStats } from "../../services";
import Carousel from "react-elastic-carousel";
import { MdVideoLibrary } from "react-icons/md";
import { FaRegFileAudio } from "react-icons/fa";
import { SkeletonCircle } from "@chakra-ui/skeleton";
import colors from "../../theme/colors";
import { utils, writeFile } from "xlsx";

const useDashboardStats = () => {
  const { resource: stats, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const stats = await adminGetDashboardStats();
    return stats;
  }, []);

  useEffect(() => {
    handleFetchResource({ cacheKey: "dashboardStats", fetcher });
  }, [handleFetchResource, fetcher]);

  return {
    stats,
  };
};

const DashboardPage = () => {
  const { stats } = useDashboardStats();

  const departmentName = stats.data?.usersByDepartment.map(
    (department) => department.name
  );

  const departmentUsers = stats.data?.usersByDepartment.map(
    (department) => department.users.length
  );


  const roleName = stats.data?.usersByRoles.map((role) => role.name);

  const roleUsers = stats.data?.usersByRoles.map((role) => role.user.length);

  // get published courses
  const published = stats.data?.courses?.filter((course) => course.isPublished);

  // randomize colors
  const getColors = () => {
    const colors = [];

    [...Array(departmentName?.length).keys()].forEach(() => {
      colors.push(`hsl(${Math.random() * 360}, 50%, 50%)`);
    });

    return colors;
  };

  const totalDepartmentChartConfig = {
    data: {
      labels: [...(departmentName || [])],
      datasets: [
        {
          data: [...(departmentUsers || [])],
          backgroundColor: [...getColors()],
          borderWidth: 0,
        },
      ],
    },

    options: {
      plugins: {
        legend: { position: "bottom" },
      },
    },
  };

  const totalRoleChartConfig = {
    data: {
      labels: [...(roleName || [])],
      datasets: [
        {
          data: [...(roleUsers || [])],
          backgroundColor: [
            colors.primary.base,
            colors.secondary["4"],
            colors.accent["7"],
          ],
          borderWidth: 0,
        },
      ],
    },

    options: {
      plugins: {
        legend: { position: "bottom" },
      },
    },
  };

  const handleGetData = () => {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([
      {
        column1: "No of Courses",
        column2: stats.data?.courses?.length,
      },
      {
        column1: "No of Users",
        column2: stats.data?.users.length,
      },
      {
        column1: "Published Courses",
        column2: published?.length,
      },
      {
        column1: "",
        column2: "",
      },
      {
        column1: "DEPARTMENTS",
        column2: "",
      },
      ...departmentName?.map((dept, i) => ({
        column1: dept,
        column2: departmentUsers[i],
      })),
      {
        column1: "",
        column2: "",
      },
      {
        column1: "ROLES",
        column2: "",
      },
      ...roleName?.map((dept, i) => ({
        column1: dept,
        column2: roleUsers[i],
      })),
    ]);
    utils.book_append_sheet(wb, ws, "Orders");
    writeFile(wb, "DashboardData.xlsx");
  };

  return (
    <AdminMainAreaWrapper
      marginBottom={4}
      marginRight={{ lg: "5", md: "5", sm: "5" }}
    >
      <Box marginTop="20px" display="flex" justifyContent="flex-end">
        <Button onClick={() => handleGetData()}>Export Dashboard</Button>
      </Box>

      <Grid
        marginY={4}
        templateColumns={{ lg: "repeat(3, 1fr)", sm: null, md: "1fr" }}
        gap={6}
      >
        <GridItem>
          <MiniBox
            children={
              stats.loading ? (
                <SkeletonText numberOfLines={1} width={100} />
              ) : (
                <Flex>
                  <Text fontSize="heading.h3">{stats.data?.users.length}</Text>
                  <Text color="accent.3" paddingLeft={1} paddingTop={2}>
                    Users
                  </Text>
                </Flex>
              )
            }
            iconBackgroundColor={stats.loading ? "none" : "others.4"}
            icon={
              stats.loading ? (
                <SkeletonCircle />
              ) : (
                <FiUsers color="white" size="18px" />
              )
            }
          />
        </GridItem>
        <GridItem>
          <MiniBox
            children={
              stats.loading ? (
                <SkeletonText numberOfLines={2} width={100} />
              ) : (
                <Flex flexDirection="column">
                  <Flex>
                    <Text fontSize="heading.h3">
                      {stats.data?.courses?.length}
                    </Text>
                    <Text color="accent.3" paddingLeft={1} paddingTop={2}>
                      Courses
                    </Text>
                  </Flex>
                  <Text>{`${published?.length} published.`}</Text>
                </Flex>
              )
            }
            iconBackgroundColor={stats.loading ? "none" : "others.4"}
            icon={
              stats.loading ? (
                <SkeletonCircle />
              ) : (
                <GiBookshelf color="white" size="18px" />
              )
            }
          />
        </GridItem>
        <GridItem>
          <MiniBox
            children={
              stats.loading ? (
                <SkeletonText numberOfLines={1} width={100} />
              ) : (
                <Flex>
                  <Text fontSize="heading.h3">
                    {stats.data?.events?.length}
                  </Text>
                  <Text color="accent.3" paddingLeft={1} paddingTop={2}>
                    Events
                  </Text>
                </Flex>
              )
            }
            iconBackgroundColor={stats.loading ? "none" : "others.4"}
            icon={
              stats.loading ? (
                <SkeletonCircle />
              ) : (
                <IoCalendarOutline color="white" size="18px" />
              )
            }
          />
        </GridItem>
      </Grid>
      <Flex
        flexDirection={{ base: "column", md: "column", lg: "row" }}
        rowGap={5}
      >
        <Box
          boxShadow="0px 1px 30px rgba(63, 63, 68, 0.05)"
          backgroundColor="white"
          width={{ sm: "100%", md: "100%", lg: "50%" }}
          // height="600px"
          paddingY={4}
          paddingX={6}
        >
          <Flex
            justifyContent="space-between"
            flexDirection={{ sm: "column", md: "column", lg: "row" }}
          >
            {departmentName ? (
              <Text fontSize="heading.h3" bold>
                Statistics
              </Text>
            ) : (
              <SkeletonText numberOfLines={1} width={40} />
            )}

            {/* <Button asIcon>
            <IoMdMore />
          </Button> */}
          </Flex>
          <Carousel
            itemsToShow={1}
            easing="cubic-bezier(1,.15,.55,1.54)"
            tiltEasing="cubic-bezier(0.110, 1, 1.000, 0.210)"
            transitionMs={700}
            className="carousel"
          >
            <Box height="100%">
              <Flex justifyContent="center">
                <Box width="350px" height="100%">
                  <Center paddingY={4}>
                    {departmentName ? (
                      <Text fontSize="heading.h4">Users by departments</Text>
                    ) : (
                      <SkeletonText numberOfLines={1} width={300} />
                    )}
                  </Center>
                  {departmentName ? (
                    <Doughnut {...totalDepartmentChartConfig} />
                  ) : (
                    <Flex height="350px" justifyContent="center" align="center">
                      <SkeletonCircle width="300px" height="300px" />
                    </Flex>
                  )}
                </Box>
              </Flex>
            </Box>
            <Box height="100%">
              <Flex justifyContent="center">
                <Box width="350px" height="100%">
                  <Center paddingY={4}>
                    {roleName ? (
                      <Text fontSize="heading.h4">Users by roles</Text>
                    ) : (
                      <SkeletonText numberOfLines={1} width={300} />
                    )}
                  </Center>
                  {roleName ? (
                    <Doughnut {...totalRoleChartConfig} />
                  ) : (
                    <Flex height="350px" justifyContent="center" align="center">
                      <SkeletonCircle width="300px" height="300px" />
                    </Flex>
                  )}
                </Box>
              </Flex>
            </Box>
          </Carousel>
        </Box>

        <Box
          boxShadow="0px 1px 30px rgba(63, 63, 68, 0.05)"
          backgroundColor="white"
          width={{ lg: "50%", sm: "100%", md: "100%" }}
          // height="600px"
          paddingY={4}
          paddingX={6}
          marginLeft={{ lg: 3, sm: 0, md: 0 }}
          marginTop={{ lg: 0, sm: 5, md: 5 }}
        >
          <Flex
            paddingBottom={4}
            justifyContent="space-between"
            flexDirection={{ sm: "column", md: "column", lg: "row" }}
          >
            {stats.loading ? (
              <SkeletonText numberOfLines={1} width={40} />
            ) : (
              <Text fontSize="heading.h3" bold>
                Library
              </Text>
            )}
            {/* <Button asIcon>
            <IoMdMore />
          </Button> */}
          </Flex>
          <Flex flexDirection="column">
            <Box
              boxShadow="0px 1px 30px rgba(63, 63, 68, 0.05)"
              backgroundColor="white"
              height="130px"
              padding={6}
              marginBottom={4}
              border="1px solid #ccc"
              borderRadius={5}
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              {stats.loading ? (
                <Flex justifyContent="space-between">
                  <SkeletonText numberOfLines={2} width={40} />
                  <SkeletonCircle />
                </Flex>
              ) : (
                <Flex justifyContent="space-between">
                  <Flex flexDirection="column">
                    <Text color="accent.3" fontSize="text.level2" bold>
                      Videos
                    </Text>
                    <Text fontSize="text.level1">
                      {`${stats.data?.video?.length} uploaded resources`}
                    </Text>
                  </Flex>
                  <MdVideoLibrary color="#9e0b94" size="32px" />
                </Flex>
              )}
            </Box>
            <Box
              boxShadow="0px 1px 30px rgba(63, 63, 68, 0.05)"
              backgroundColor="white"
              height="130px"
              padding={6}
              marginBottom={4}
              border="1px solid #ccc"
              borderRadius={5}
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              {stats.loading ? (
                <Flex justifyContent="space-between">
                  <SkeletonText numberOfLines={2} width={40} />
                  <SkeletonCircle />
                </Flex>
              ) : (
                <Flex justifyContent="space-between">
                  <Flex flexDirection="column">
                    <Text color="accent.3" fontSize="text.level2" bold>
                      Books
                    </Text>
                    <Text fontSize="text.level1">{`${stats.data?.pdf.length} uploaded resources`}</Text>
                  </Flex>
                  <GiSpellBook color="#9e0b94" size="32px" />
                </Flex>
              )}
            </Box>
            <Box
              boxShadow="0px 1px 30px rgba(63, 63, 68, 0.05)"
              backgroundColor="white"
              height="130px"
              padding={6}
              marginBottom={4}
              border="1px solid #ccc"
              borderRadius={5}
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              {stats.loading ? (
                <Flex justifyContent="space-between">
                  <SkeletonText numberOfLines={2} width={40} />
                  <SkeletonCircle />
                </Flex>
              ) : (
                <Flex justifyContent="space-between">
                  <Flex flexDirection="column">
                    <Text color="accent.3" fontSize="text.level2" bold>
                      Audio
                    </Text>
                    <Text fontSize="text.level1">{`${stats.data?.audio?.length} uploaded resources`}</Text>
                  </Flex>
                  <FaRegFileAudio color="#9e0b94" size="32px" />
                </Flex>
              )}
            </Box>
          </Flex>
        </Box>
      </Flex>
    </AdminMainAreaWrapper>
  );
};

const MiniBox = ({ children, icon, iconBackgroundColor }) => {
  return (
    <Flex
      justifyContent="space-between"
      boxShadow="0px 1px 30px rgba(63, 63, 68, 0.05)"
      backgroundColor="white"
      padding={6}
    >
      {children}
      <Flex
        backgroundColor={iconBackgroundColor}
        borderRadius="50%"
        width={16}
        height={16}
        justifyContent="center"
        alignItems="center"
      >
        {icon}
      </Flex>
    </Flex>
  );
};

export const DashboardPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <DashboardPage {...props} />} />;
};
