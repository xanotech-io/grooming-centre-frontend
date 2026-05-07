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
  ExaminationMarkingPageRoute,
  CreateMarkingJobPageRoute,
  MarkingJobDetailsPageRoute,
  MarkPaperPageRoute,
  ExamTemplatesPageRoute,
  CreateExamTemplatePageRoute,
  ExamTemplateDetailsPageRoute,
  CreateQuestionBankPageRoute,
  FeedbackMarkupPageRoute,
  SubmissionReviewPageRoute,
  GradeBookListingPageRoute,
  CreateGradeBookPageRoute,
  GradeBookDetailsPageRoute,
  BulkCourseListingPageRoute,
  CreateBulkCourseBatchPageRoute,
  BatchDetailsPageRoute,
  UserDocumentsPageRoute,
  UserDocumentDetailsPageRoute,
  ReportExportPageRoute,
  QuestionImportPageRoute,
  UploadDetailsPageRoute,
  QuestionBankTemplatesPageRoute,
  QuestionBankTemplateDetailsPageRoute,
  CourseContentEditorPageRoute,
  DataOperationsPageRoute,
  CreateModulePageRoute,
  ModuleAssessmentsPageRoute,
  CreateModuleAssessmentPageRoute,
  ModuleExaminationsPageRoute,
  CreateModuleExaminationPageRoute,
  ViewModuleExaminationPageRoute,
  ViewModulePageRoute,
  ModuleProjectsPageRoute,
  CreateModuleProjectPageRoute,
  ViewModuleProjectPageRoute,
  EditModuleProjectPageRoute,
  ProjectSubmissionsPageRoute,
  ProjectSubmissionReviewPageRoute,
  ModuleProgressPageRoute,
} from "../../../pages/admin";
import { ModuleLessonsPageRoute } from "../../../pages/admin/courses/ViewCourseInfoPage/pages/ModuleLessonsPage";
import { BadgeSupportPageRoute } from "../../../pages/admin/badge/BadgeSupportPage";
import { ManagementReportRoute } from "../../../pages/admin/report/managementReport/managementReport";
import { InstructorReportRoute } from "../../../pages/admin/report/instructorReport/instructorReport";
import { InstructorReportDetailsRoute } from "../../../pages/admin/report/instructorReport/InstructorReportDetails";
import { CourseCompletionRoute } from "../../../pages/admin/report/instructorReport/courseCompletion";
import { InstructorPerformanceRoute } from "../../../pages/admin/report/instructorReport/instructorPerformance";
import { AssignmentGradingRoute } from "../../../pages/admin/report/instructorReport/assignmentGrading";
import { AssignmentAnalysisRoute } from "../../../pages/admin/report/instructorReport/assignmentAnalysis";
import { StudentReportRoute } from "../../../pages/admin/report/studentReport/StudentReport";
import { StudentReportDetailsRoute } from "../../../pages/admin/report/studentReport/StudentReportDetails";
import { ProgressReportRoute } from "../../../pages/admin/report/studentReport/ProgressReport";
import { TranscriptReportRoute } from "../../../pages/admin/report/studentReport/TranscriptReport";
import { AttendanceReportRoute } from "../../../pages/admin/report/studentReport/AttendanceReport";
import { AssessmentReportRoute } from "../../../pages/admin/report/studentReport/AssessmentReport";
import { ComplianceReportRoute } from "../../../pages/admin/report/studentReport/ComplianceReport";
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
import { AcademicMetricsDashboardRoute } from "../../../pages/admin/dashboard/AcademicMetricsDashboard";

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
        <ViewModulePageRoute
          exact
          path="/admin/courses/:courseId/modules/:moduleId/view"
        />
        <CreateModulePageRoute
          exact
          path="/admin/courses/:courseId/modules/:moduleId/edit"
        />
        <ModuleLessonsPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/lessons"
        />
        <ModuleAssessmentsPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/assessments"
        />
        <CreateModuleAssessmentPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/assessments/edit/:assessmentId"
        />
        <ModuleExaminationsPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/examinations"
        />
        <CreateModuleExaminationPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/examinations/edit/:examinationId"
        />
        <ViewModuleExaminationPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/examinations/view/:examinationId"
        />
        <ModuleProjectsPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/projects"
        />
        <CreateModuleProjectPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/projects/new"
        />
        <ViewModuleProjectPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/projects/:projectId/view"
        />
        <EditModuleProjectPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/projects/:projectId/edit"
        />
        <ProjectSubmissionsPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/projects/:projectId/submissions"
        />
        <ProjectSubmissionReviewPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/projects/:projectId/submissions/:submissionId"
        />
        <ModuleProgressPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/progress"
        />
        <CreateLessonPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/lessons/edit/:lessonId"
        />
        <AssessmentPageRoute path="/admin/courses/:id/assessment/:assessmentId" />
        <ViewCourseInfoPageRoute path="/admin/courses/details/:id" />

        <ViewLessonInfoPageRoute
          exact
          path="/admin/courses/:courseId/lesson/:lessonId/view"
        />
        <CourseContentEditorPageRoute
          exact
          path="/admin/courses/:courseId/content/:contentId"
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
        <ExaminationPageRoute exact path="/admin/examination" />
        <ExaminationDetailPageRoute exact path="/admin/examination/:id" />
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
        <ExaminationMarkingPageRoute exact path="/admin/examination-marking" />
        <CreateMarkingJobPageRoute
          exact
          path="/admin/examination-marking/create"
        />
        <MarkPaperPageRoute
          exact
          path="/admin/examination-marking/jobs/:jobId/papers/:paperId/mark"
        />
        <MarkingJobDetailsPageRoute
          exact
          path="/admin/examination-marking/jobs/:jobId"
        />
        <ExamTemplatesPageRoute exact path="/admin/marking-templates" />
        <CreateExamTemplatePageRoute exact path="/admin/marking-templates/create" />
        <CreateQuestionBankPageRoute exact path="/admin/marking-templates/question-banks/create" />
        <ExamTemplateDetailsPageRoute exact path="/admin/marking-templates/:templateId" />
        <FeedbackMarkupPageRoute exact path="/admin/feedback-markup" />
        <SubmissionReviewPageRoute exact path="/admin/feedback-markup/review/:documentId" />
        <GradeBookListingPageRoute exact path="/admin/grade-book" />
        <CreateGradeBookPageRoute exact path="/admin/grade-book/create" />
        <GradeBookDetailsPageRoute exact path="/admin/grade-book/:gradeBookId" />
        <BulkCourseListingPageRoute exact path="/admin/bulk-courses" />
        <CreateBulkCourseBatchPageRoute exact path="/admin/bulk-courses/create" />
        <BatchDetailsPageRoute exact path="/admin/bulk-courses/:batchId" />
        <UserDocumentsPageRoute exact path="/admin/user-documents" />
        <UserDocumentDetailsPageRoute exact path="/admin/user-documents/:userId/:uploadId" />
        <ReportExportPageRoute exact path="/admin/report-export" />
        <QuestionImportPageRoute exact path="/admin/question-import" />
        <UploadDetailsPageRoute exact path="/admin/question-import/:uploadId" />
        <QuestionBankTemplatesPageRoute exact path="/admin/question-bank-templates" />
        <QuestionBankTemplateDetailsPageRoute exact path="/admin/question-bank-templates/:templateId" />
        <DataOperationsPageRoute exact path="/admin/data-operations" />
        <BadgeSupportPageRoute exact path="/admin/badge-support" />
        <AcademicMetricsDashboardRoute exact path="/admin/dashboard/academic" />

        <SecurityPageRoute path="/admin/settings/security" />
        <GradeCriteriaPageRoute path="/admin/settings/grade-criteria" />
        <SettingsPageRoute path="/admin/settings" />
        <AnnouncementListingRoute exact path="/admin/announcement" />
        <CreateAnnouncementRoute exact path="/admin/announcement/edit" />
        <ViewAuditRoute exact path="/admin/audit" />
        <ManagementReportRoute exact path="/admin/report/managementReport" />
        <StudentReportRoute exact path="/admin/report/studentReport" />
        <InstructorReportRoute exact path="/admin/report/instructorReport" />
        <InstructorReportDetailsRoute exact path="/admin/report/instructorReport/:instructorId/details" />
        <CourseCompletionRoute exact path="/admin/report/instructorReport/:instructorId/courseCompletion" />
        <InstructorPerformanceRoute exact path="/admin/report/instructorReport/:instructorId/instructorPerformance" />
        <AssignmentGradingRoute exact path="/admin/report/instructorReport/:instructorId/assignmentGrading" />
        <AssignmentAnalysisRoute exact path="/admin/report/instructorReport/:instructorId/assignmentAnalysis" />
        <StudentReportDetailsRoute exact path="/admin/report/studentReport/:studentId/details" />
        <ProgressReportRoute exact path="/admin/report/studentReport/:studentId/progress" />
        <TranscriptReportRoute exact path="/admin/report/studentReport/:studentId/transcript" />
        <AttendanceReportRoute exact path="/admin/report/studentReport/:studentId/attendance" />
        <AssessmentReportRoute exact path="/admin/report/studentReport/:studentId/assessment" />
        <ComplianceReportRoute exact path="/admin/report/studentReport/:studentId/compliance" />
        <ArchivedReportsPageRoute exact path="/admin/report/archived" />
        <ComplianceSecurityReportPageRoute
          exact
          path="/admin/report/compliance"
        />

        <NotFoundPageRoute />
      </Switch>
    </Box>
  );
};

export default MainArea;
