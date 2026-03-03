import { Box, Flex, Stack } from "@chakra-ui/layout";
import { Switch } from "react-router-dom";
import { Route } from "react-router-dom";
import { Heading, Image, Text } from "../../../components";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";
import AllCoursesPageRoute from "./AllCoursesPage";
import CompletedCoursesPageRoute from "./CompletedCoursesPage";
import InProgressCoursesPageRoute from "./InProgressCoursesPage";
// import NavBar from "./NavBar";
import NewCoursesPageRoute from "./NewCoursesPage";
import coverImagePlaceholder from "../../../assets/images/events-banner.svg";
import { pageWrapperSpacing_userPages } from "../../../theme/breakpoints";

const CoursesPagesRouter = () => {
  return (
    <Box
      // {...maxWidthStyles_userPages}
      paddingY={{ base: 2, laptop: 5 }}
      // paddingX={{ base: 2, laptop: 8, 'laptop-l': 5 }}
    >
      <Box
        as="section"
        padding={10}
        marginBottom={10}
        color="white"
        position="relative"
      >
        <Image
          src={coverImagePlaceholder}
          width="100%"
          height="100%"
          top={0}
          left={0}
          position="absolute"
          alt="Course Header"
        />

        <Stack
          spacing={7}
          position="relative"
          // zIndex={1}
          {...pageWrapperSpacing_userPages}
        >
          <Heading>Courses</Heading>
          <Text as="level2">Courses for you</Text>
        </Stack>
      </Box>

      <Box>
        <Switch>
          <AllCoursesPageRoute exact path="/courses" />
          <NewCoursesPageRoute exact path="/courses/new" />
          <CompletedCoursesPageRoute exact path="/courses/completed" />
          <InProgressCoursesPageRoute exact path="/courses/in-progress" />
        </Switch>
      </Box>
    </Box>
  );
};

export const CoursesPagesRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CoursesPagesRouter {...props} />} />
  );
};
