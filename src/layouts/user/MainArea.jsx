import { Box } from "@chakra-ui/layout";
import { Redirect, Route, Switch } from "react-router-dom";
import { ForumLayoutRoute, ChatLayoutRoute } from "../../layouts";
import { NotFoundPageRoute } from "../../pages/admin";

import {
  CourseDetailsPageRoute,
  CourseProgressReportPageRoute,
  CoursesPagesRoute,
  DashboardPageRoute,
  EventsPageRoute,
  LibraryPageRoute,
  GradesPageRoute,
  CertificatePageRoute,
  ProfilePageRoute,
  StandalonePagesRoute,
  StandaloneExamsStartRoute,
  MyGradeBookPageRoute,
  MyGradeBooksListPageRoute,
  StudentResultPageRoute,
  AwaitingGradePageRoute,
  BadgeListPageRoute,
  BadgeDetailPageRoute,
  MyBadgesPageRoute,
  BadgeProgressPageRoute,
  MyProgressPageRoute,
  StudentProgressReportPageRoute,
  StudentCourseProgressPageRoute,
  StudentVisualAnalyticsPageRoute,
} from "../../pages/user";
import { PollsPageRoute } from "../../pages/user/PollsPage/PollsPage";
import { StandalonePreAssessmentRoute } from "../../pages/user/StandaloneExamDetails/StandalonePreAssessment";
import { ExampleRoute } from "../../pages/user/tabby";
import { PollsVotePageRoute } from "../../pages/user/PollsVotePage/PollsVotePage";
import { TranscriptRequestPageRoute } from "../../pages/user/Transcript/TranscriptRequestPage";
import { MyAssessmentResultsPageRoute } from "../../pages/user/AssessmentResults/MyAssessmentResultsPage";

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
        <CourseProgressReportPageRoute exact path="/courses/details/:id/progress" />
        <CourseDetailsPageRoute path="/courses/details/:id" />
        <GradesPageRoute path="/courses/grade-overview" />
        <MyGradeBooksListPageRoute exact path="/grade-books" />
        <MyGradeBookPageRoute exact path="/grade-book/:gradebookId" />

        <CertificatePageRoute path="/courses/:course_id/certificate" />
        <PollsVotePageRoute path="/polls/:id/vote" />
        <StudentResultPageRoute exact path="/courses/take/:courseId/assessment/:assessmentId/result" />
        <AwaitingGradePageRoute exact path="/courses/take/:courseId/assessment/:assessmentId/awaiting" />
        <CoursesPagesRoute path="/courses" />
        <PollsPageRoute exact path="/polls" />
        <TranscriptRequestPageRoute exact path="/transcript" />
        <MyAssessmentResultsPageRoute exact path="/assessment-results" />
        <StudentCourseProgressPageRoute exact path="/my-progress/course/:courseId" />
        <StudentProgressReportPageRoute exact path="/my-progress" />
        <StudentVisualAnalyticsPageRoute exact path="/my-analytics" />
        <ProfilePageRoute exact path="/profile" />
        <StandalonePagesRoute exact path="/standalone-exams" />
        <StandalonePreAssessmentRoute exact path="/standalone-exams/take" />
        <StandaloneExamsStartRoute exact path="/standalone-exams/start" />
        <MyBadgesPageRoute exact path="/badges/my-badges" />
        <BadgeProgressPageRoute exact path="/badges/:badgeId/progress" />
        <BadgeDetailPageRoute exact path="/badges/:badgeId" />
        <MyProgressPageRoute exact path="/my-progress" />
        <BadgeListPageRoute exact path="/badges" />
        <ExampleRoute path="/example" />
        <Route render={(props) => <NotFoundPageRoute />} />
      </Switch>
    </Box>
  );
};

export default MainArea;
