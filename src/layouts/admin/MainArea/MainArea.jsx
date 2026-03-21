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
  ExaminationPageRoute,
  ExaminationDetailPageRoute,
  SingleExaminationPageRoute,

  AutomatedApprovalWorkflowRoute,
  ReviewSubmissionPageRoute,
} from "../../../pages/admin";
import { BadgeSupportPageRoute } from "../../../pages/admin/badge/BadgeSupportPage";
import { ManagementReportRoute } from "../../../pages/admin/report/managementReport/managementReport";

import { StudentReportRoute } from "../../../pages/admin/report/studentReport/StudentReport";
import { ArchivedReportsPageRoute } from "../../../pages/admin/report/ArchivedReportsPage";
import { ComplianceSecurityReportPageRoute } from "../../../pages/admin/report/ComplianceSecurityReportPage";

import PollsListingPageRoute from "../../../pages/admin/polls/PollsPage";
import { CreatePollsPageRoute } from "../../../pages/admin/polls/CreatePollsPage";
import { ViewPollsInfoPageRoute } from "../../../pages/admin/polls/layout/ViewPollsInfoPage";
import { CreateOptionsPageRoute } from "../../../pages/admin/polls/CreateOptionsPage";
import { CreateStandalonePageRoute } from "../../../pages/admin/standaloneExams/CreateStandaloneExamPage";
import { TemplateLibraryPageRoute } from "../../../pages/admin/standaloneExams/TemplateLibraryPage";
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
        <TemplateLibraryPageRoute
          exact
          path="/admin/standalone-exams/temporary-library"
        />
        <ExaminationPageRoute
          exact
          path="/admin/examination"
        />
        <ExaminationDetailPageRoute
          exact
          path="/admin/examination/:id"
        />
        <SingleExaminationPageRoute
          exact
          path="/admin/examination/:examId/:studentId"
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
        <AutomatedApprovalWorkflowRoute exact path="/admin/workflow" />
        <ReviewSubmissionPageRoute exact path="/admin/workflow/review/:id" />
        <BadgeSupportPageRoute exact path="/admin/badge-support" />

        <SecurityPageRoute path="/admin/settings/security" />
        <GradeCriteriaPageRoute path="/admin/settings/grade-criteria" />
        <SettingsPageRoute path="/admin/settings" />
        <AnnouncementListingRoute exact path="/admin/announcement" />
        <CreateAnnouncementRoute exact path="/admin/announcement/edit" />
        <ViewAuditRoute exact path="/admin/audit" />
        <ManagementReportRoute exact path="/admin/report/managementReport" />
        <StudentReportRoute exact path="/admin/report/studentReport" />
        <ArchivedReportsPageRoute exact path="/admin/report/archived" />
        <ComplianceSecurityReportPageRoute exact path="/admin/report/compliance" />




        <NotFoundPageRoute />
      </Switch>
    </Box>
  );
};

export default MainArea;
