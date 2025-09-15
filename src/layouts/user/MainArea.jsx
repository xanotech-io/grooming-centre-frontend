import { Box } from "@chakra-ui/layout";
import { useContext, useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ForumLayoutRoute, ChatLayoutRoute } from "../../layouts";
import { NotFoundPageRoute } from "../../pages/admin";

import {
  CourseDetailsPageRoute,
  CoursesPagesRoute,
  DashboardPageRoute,
  EventsPageRoute,
  LibraryPageRoute,
  GradesPageRoute,
  CertificatePageRoute,
  ProfilePageRoute,
  StandalonePagesRoute,
  StandaloneExamsStartRoute,
} from "../../pages/user";
import { PollsPageRoute } from "../../pages/user/PollsPage/PollsPage";
import { StandalonePreAssessmentRoute } from "../../pages/user/StandaloneExamDetails/StandalonePreAssessment";
import { ExampleRoute } from "../../pages/user/tabby";
import { PollsVotePageRoute } from "../../pages/user/PollsVotePage/PollsVotePage";

const MainArea = () => {
  return (
    <Box as="main" marginBottom={16}>
      <Switch>
        <Redirect exact from="/" to="/dashboard" />
        <DashboardPageRoute exact path="/dashboard" />
        <LibraryPageRoute path="/library" />
        <ForumLayoutRoute path="/forum" />
        <ChatLayoutRoute path="/chats" />
        <EventsPageRoute exact path="/events" />
        <CourseDetailsPageRoute path="/courses/details/:id" />
        <GradesPageRoute path="/courses/grade-overview" />

        <CertificatePageRoute path="/courses/:course_id/certificate" />
        <PollsVotePageRoute path="/polls/:id/vote" />
        <CoursesPagesRoute path="/courses" />
        <PollsPageRoute exact path="/polls" />
        <ProfilePageRoute exact path="/profile" />
        <StandalonePagesRoute exact path="/standalone-exams" />
        <StandalonePreAssessmentRoute exact path="/standalone-exams/take" />
        <StandaloneExamsStartRoute exact path="/standalone-exams/start" />
        <ExampleRoute path="/example" />
        <Route render={(props) => <NotFoundPageRoute />} />
      </Switch>
    </Box>
  );
};

export default MainArea;
