import { Box } from "@chakra-ui/layout";
import { Switch } from "react-router-dom";
import {
  CourseListingPageRoute,
  // CoursesPageRoute,
  CreateCoursePageRoute,
  CreateLessonPageRoute,
  CreateUserPageRoute,
  DashboardPageRoute,
  NotFoundPageRoute,
  UserInfoPageRoute,
  ViewCourseInfoPageRoute,
  ViewLessonInfoPageRoute,
  UserListingPageRoute,
  AssessmentPageRoute,
  DepartmentListingPageRoute,
  CreateDepartmentPageRoute,
  ViewDepartmentPageRoute,
  AddExistingUsersPageRoute,
  BulkActionPageRoute,
  RolesPageRoute,
  SettingsPageRoute,
  EventsPageRoute,
  GradeCriteriaPageRoute,
  SecurityPageRoute,
  CreateEventPageRoute,
  LibraryListingPageRoute,
  CreateLibraryFilePageRoute,
  ViewFileDetailsPageRoute,
  StandaloneExaminationListingPageRoute,
  ViewAuditRoute,
  DocumentsPageRoute,
  ReportListingPageRoute,
  ComplianceSecurityReportPageRoute,
  CustomAdHocReportPageRoute,
  ElectronicRegistersReportPageRoute,
  TrackingReportingPageRoute,
  MISReportsPageRoute,
  AutomatedApprovalWorkflowPageRoute,
} from "../../../pages/admin";
import PollsListingPageRoute from "../../../pages/admin/polls/PollsPage";
import { CreatePollsPageRoute } from "../../../pages/admin/polls/CreatePollsPage";
import { ViewPollsInfoPageRoute } from "../../../pages/admin/polls/layout/ViewPollsInfoPage";
import { CreateOptionsPageRoute } from "../../../pages/admin/polls/CreateOptionsPage";
import { CreateStandalonePageRoute } from "../../../pages/admin/standaloneExams/CreateStandaloneExamPage";
import { AnnouncementListingRoute } from "../../../pages/admin/Annoncement/AnnouncementListing";
import { CreateAnnouncementRoute } from "../../../pages/admin/Annoncement/CreateAnnouncement";

const MainArea = () => {
  return (
    <Box
      marginLeft={{ md: "270px", base: "0px", lg: "270px" }}
      paddingY="30px"
      paddingX="18px"
    >
      <Switch>
        <DashboardPageRoute exact path="/admin" />
        <CourseListingPageRoute exact path="/admin/courses" />
        <CreateCoursePageRoute exact path="/admin/courses/edit/:id" />
        <CreateLessonPageRoute
          exact
          path="/admin/courses/:courseId/lessons/edit/:lessonId"
        />
        <AssessmentPageRoute path="/admin/courses/:id/assessment/:assessmentId" />
        <ViewCourseInfoPageRoute path="/admin/courses/details/:id" />

        <ViewLessonInfoPageRoute
          exact
          path="/admin/courses/:courseId/lesson/:lessonId/view"
        />
        <UserListingPageRoute exact path="/admin/users" />
        <CreateUserPageRoute exact path="/admin/users/edit/:id" />
        <UserInfoPageRoute path="/admin/users/details" />

        <DepartmentListingPageRoute exact path="/admin/departments" />
        <CreateDepartmentPageRoute exact path="/admin/departments/create" />
        <BulkActionPageRoute exact path="/admin/departments/bulk-action" />
        <AddExistingUsersPageRoute
          exact
          path="/admin/departments/:departmentId/add-existing-users"
        />
        <ViewDepartmentPageRoute
          exact
          path="/admin/departments/:departmentId"
        />
        <ViewDepartmentPageRoute
          exact
          path="/admin/departments/details/:departmentId/info"
        />
        <RolesPageRoute exact path="/admin/role" />

        <StandaloneExaminationListingPageRoute
          exact
          path="/admin/standalone-exams"
        />
        {/* <ParticipantsListingPageRoute exact path ="/"/> */}
        {/* <QuestionsStandaloneRoute
          exact
          path="/admin/standalone-exams/questions/:id"
        /> */}
        {/* <StandaloneExaminationAllParticipantsPageRoute
          exact
          path="/admin/standalone-exams/:examinationId/:examinationName"
        /> */}
        <CreateStandalonePageRoute path="/admin/standalone-exams" />

        <PollsListingPageRoute exact path="/admin/polls" />
        <CreatePollsPageRoute exact path="/admin/polls/edit/:id" />
        <ViewPollsInfoPageRoute path="/admin/polls/details/:id" />
        <CreateOptionsPageRoute
          exact
          path="/admin/polls/:pollId/options/edit/:optionId"
        />

        <CreateEventPageRoute path="/admin/events/edit/:eventId" />
        <EventsPageRoute path="/admin/events" />

        <LibraryListingPageRoute exact path="/admin/library" />
        <CreateLibraryFilePageRoute exact path="/admin/library/edit/:id" />
        <ViewFileDetailsPageRoute exact path="/admin/library/details/:id" />

        <DocumentsPageRoute exact path="/admin/documents" />

        <SecurityPageRoute path="/admin/settings/security" />
        <GradeCriteriaPageRoute path="/admin/settings/grade-criteria" />
        <SettingsPageRoute path="/admin/settings" />
        <AnnouncementListingRoute exact path="/admin/announcement" />
        <CreateAnnouncementRoute exact path="/admin/announcement/edit" />
        <ViewAuditRoute exact path="/admin/audit" />
        <ComplianceSecurityReportPageRoute
          exact
          path="/admin/report/audit-details"
        />
        <CustomAdHocReportPageRoute exact path="/admin/report/custom" />
        <ElectronicRegistersReportPageRoute
          exact
          path="/admin/report/electronic-registers"
        />
        <TrackingReportingPageRoute exact path="/admin/report/tracking" />
        <MISReportsPageRoute exact path="/admin/report/mis" />
        <AutomatedApprovalWorkflowPageRoute
          exact
          path="/admin/report/automated-approval"
        />
        <ReportListingPageRoute exact path="/admin/report" />
        <NotFoundPageRoute />
      </Switch>
    </Box>
  );
};

export default MainArea;
