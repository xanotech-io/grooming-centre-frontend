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
  WorkflowTrackingPageRoute,
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
  UserDocumentsPageRoute,
  UserDocumentDetailsPageRoute,
  CertificateUploadPageRoute,
  CertificateManagementPageRoute,
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
  BulkCourseV2ListingPageRoute,
  CreateBulkCourseV2BatchPageRoute,
  BulkCourseV2BatchDetailsPageRoute,
  TemplatesListingPageRoute,
  TemplateFormPageRoute,
  ManualMarkingExamsPageRoute,
  ManualMarkingStudentsPageRoute,
  StudentMarkingPageRoute,
  GradeBookV2ListingPageRoute,
  SetupGradeBookV2PageRoute,
  GradeBookV2DetailsPageRoute,
  ViewStandaloneExamPageRoute,
  StandaloneStudentGradingPageRoute,
  MISReportsPageRoute,
  QuestionBankPageRoute,
  QuestionEditorPageRoute,
  QuestionPreviewPageRoute,
  MediaManagerPageRoute,
  MultimediaStatsPageRoute,
  ExamPaperConfigPageRoute,
  ExamConfigKPIPageRoute,
  BatchImportPageRoute,
  BatchHistoryPageRoute,
  ImportResultPageRoute,
  ImportReportPageRoute,
  PerformanceFiltersPageRoute,
  AdminExamResultAnalysisPageRoute,
  CourseMaterialUploadPageRoute,
  CourseRosterPageRoute,
  EnrollmentStatusReportPageRoute,
  AuditTrailReportPageRoute,
} from "../../../pages/admin";
import { ModuleLessonsPageRoute } from "../../../pages/admin/courses/ViewCourseInfoPage/pages/ModuleLessonsPage";
import { ExamGradingSummaryPageRoute } from "../../../pages/admin/courses/ViewCourseInfoPage/pages/ExamGradingSummaryPage";
import { ExamManualGradingPageRoute } from "../../../pages/admin/courses/ViewCourseInfoPage/pages/ExamManualGradingPage";
import { BadgeSupportPageRoute } from "../../../pages/admin/badge/BadgeSupportPage";
import { BadgeKPIPageRoute } from "../../../pages/admin/badge/BadgeKPIPage";
import { BadgeReportPageRoute } from "../../../pages/admin/badge/BadgeReportPage";
import { PendingApprovalsPageRoute } from "../../../pages/admin/badge/PendingApprovalsPage";
import { MarkingSchemesListPageRoute } from "../../../pages/admin/markingSchemes/MarkingSchemesListPage";
import { MarkingSchemeFormPageRoute } from "../../../pages/admin/markingSchemes/MarkingSchemeFormPage";
import { MarkingSchemeDetailPageRoute } from "../../../pages/admin/markingSchemes/MarkingSchemeDetailPage";
import { GradeDistributionPageRoute } from "../../../pages/admin/markingSchemes/GradeDistributionPage";
import { MarkingSchemeKPIPageRoute } from "../../../pages/admin/markingSchemes/MarkingSchemeKPIPage";
import { ManagementReportRoute } from "../../../pages/admin/report/managementReport/managementReport";
import { InstructorReportRoute } from "../../../pages/admin/report/instructorReport/instructorReport";
import { InstructorReportDetailsRoute } from "../../../pages/admin/report/instructorReport/InstructorReportDetails";
import { CourseCompletionRoute } from "../../../pages/admin/report/instructorReport/courseCompletion";
import { InstructorPerformanceRoute } from "../../../pages/admin/report/instructorReport/instructorPerformance";
import { InstructorPerformanceV2PageRoute } from "../../../pages/admin/report/instructorReport/InstructorPerformanceV2Page";
import { AssessmentAnalyticsPageRoute } from "../../../pages/admin/report/assessmentAnalytics/AssessmentAnalyticsPage";
import { AssignmentGradingRoute } from "../../../pages/admin/report/instructorReport/assignmentGrading";
import { AssignmentAnalysisRoute } from "../../../pages/admin/report/instructorReport/assignmentAnalysis";
import { AllStudentTranscriptsPageRoute } from "../../../pages/admin/report/studentReport/AllStudentTranscriptsPage";
import { StudentTranscriptDetailsPageRoute } from "../../../pages/admin/report/studentReport/StudentTranscriptDetailsPage";
import { ParticipationMonitoringPageRoute } from "../../../pages/admin/report/studentReport/ParticipationMonitoringPage";
import { StudentParticipationDetailsPageRoute } from "../../../pages/admin/report/studentReport/StudentParticipationDetailsPage";
import { StudentReportDetailsRoute } from "../../../pages/admin/report/studentReport/StudentReportDetails";
import { ProgressReportRoute } from "../../../pages/admin/report/studentReport/ProgressReport";
import { AdminStudentCourseProgressPageRoute } from "../../../pages/admin/report/studentReport/AdminStudentCourseProgressPage";
import { AdminStudentTrainingReportPageRoute } from "../../../pages/admin/report/studentReport/AdminStudentTrainingReportPage";
import { StudentProgressListingPageRoute } from "../../../pages/admin/report/studentReport/StudentProgressListingPage";
import { TranscriptReportRoute } from "../../../pages/admin/report/studentReport/TranscriptReport";
import { AttendanceReportRoute } from "../../../pages/admin/report/studentReport/AttendanceReport";
import { AssessmentReportRoute } from "../../../pages/admin/report/studentReport/AssessmentReport";
import { ComplianceReportRoute } from "../../../pages/admin/report/studentReport/ComplianceReport";
import { ArchivedReportsPageRoute } from "../../../pages/admin/report/ArchivedReportsPage";
import { ComplianceSecurityReportPageRoute } from "../../../pages/admin/report/ComplianceSecurityReportPage";
import { ProjectGradingReportPageRoute } from "../../../pages/admin/report/projectGrading/ProjectGradingReportPage";
import { SubmissionsReportPageRoute } from "../../../pages/admin/report/submissions/SubmissionsReportPage";
import { ExamIntegrityPageRoute } from "../../../pages/admin/report/examIntegrity/ExamIntegrityPage";
import { QuestionBankUsagePageRoute } from "../../../pages/admin/report/questionBankUsage/QuestionBankUsagePage";

import PollsListingPageRoute from "../../../pages/admin/polls/PollsPage";
import { CreatePollsPageRoute } from "../../../pages/admin/polls/CreatePollsPage";
import { ViewPollsInfoPageRoute } from "../../../pages/admin/polls/layout/ViewPollsInfoPage";
import { CreateOptionsPageRoute } from "../../../pages/admin/polls/CreateOptionsPage";
import { CreateStandalonePageRoute } from "../../../pages/admin/standaloneExams/CreateStandaloneExamPage";
import { TemplateLibraryPageRoute } from "../../../pages/admin/standaloneExams/TemplateLibraryPage";
import { AnnouncementListingRoute } from "../../../pages/admin/Annoncement/AnnouncementListing";
import { CreateAnnouncementRoute } from "../../../pages/admin/Annoncement/CreateAnnouncement";
import { AcademicMetricsDashboardRoute } from "../../../pages/admin/dashboard/AcademicMetricsDashboard";
import { RemindersListingPageRoute } from "../../../pages/admin/emailReminders/RemindersListingPage";
import { CreateReminderPageRoute } from "../../../pages/admin/emailReminders/CreateReminderPage";
import { DataImportExportPageRoute } from "../../../pages/admin/dataImportExport/DataImportExportPage";
import { InteractiveDashboardRoute } from "../../../pages/admin/dashboard/InteractiveDashboard";
import { StudentTrainingReportPageRoute } from "../../../pages/admin/studentProgress/StudentTrainingReportPage";
import { ReportBuilderPageRoute } from "../../../pages/admin/report/ReportBuilderPage";
import { AssessmentOverviewPageRoute } from "../../../pages/admin/report/courseAssessment/AssessmentOverviewPage";
import { SystemUtilizationReportPageRoute } from "../../../pages/admin/report/SystemUtilizationReportPage";
import { AttendanceReportPageRoute } from "../../../pages/admin/report/attendance/AttendanceReportPage";
import { VisualAnalyticsDashboardPageRoute } from "../../../pages/admin/report/visualAnalytics/VisualAnalyticsDashboardPage";
import { ProctoringAuditReportPageRoute } from "../../../pages/admin/report/proctoring/ProctoringAuditReportPage";
import { ExamSessionAuditPageRoute } from "../../../pages/admin/report/proctoring/ExamSessionAuditPage";
import { ProctoringKpiSummaryPageRoute } from "../../../pages/admin/report/proctoring/ProctoringKpiSummaryPage";
import { ScheduledReportingPageRoute } from "../../../pages/admin/report/scheduledReporting/ScheduledReportingPage";
import { StudentReportingModulePageRoute } from "../../../pages/admin/report/studentReportingModule";
import { ExamNotificationsPageRoute } from "../../../pages/admin/examNotifications/ExamNotificationsPage";
import { ExamCompliancePageRoute } from "../../../pages/admin/compliance/ExamCompliancePage";
import { ExportReportsPageRoute } from "../../../pages/admin/exportReports/ExportReportsPage";
import { CustomFieldsPageRoute } from "../../../pages/admin/customFields/CustomFieldsPage";
import { IpPolicyPageRoute } from "../../../pages/admin/ipPolicy/IpPolicyPage";
import { StudentTranscriptV2PageRoute } from "../../../pages/admin/studentTranscript/StudentTranscriptV2Page";
import { PerformanceDrillDownPageRoute } from "../../../pages/admin/performanceDrillDown/PerformanceDrillDownPage";
import { InlineMarkupPageRoute } from "../../../pages/admin/inlineMarkup/InlineMarkupPage";
import { CourseCompletionReportPageRoute } from "../../../pages/admin/report/courseCompletion/CourseCompletionReportPage";
import { TC01CoursePassRateReportRoute } from "../../../pages/admin/report/tc01CoursePassRate/TC01CoursePassRateReport";

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
        <ExamManualGradingPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/examinations/:examinationId/grading/:studentId"
        />
        <ExamGradingSummaryPageRoute
          exact
          path="/admin/courses/:courseId/module/:moduleId/examinations/:examinationId/grading"
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
        <ViewStandaloneExamPageRoute
          exact
          path="/admin/standalone-exams/view/:examId"
        />
        <StandaloneStudentGradingPageRoute
          exact
          path="/admin/standalone-exams/grade/:examId/student/:studentId"
        />
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
        <WorkflowTrackingPageRoute exact path="/admin/workflow/track" />
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
        <CreateExamTemplatePageRoute
          exact
          path="/admin/marking-templates/create"
        />
        <CreateQuestionBankPageRoute
          exact
          path="/admin/marking-templates/question-banks/create"
        />
        <ExamTemplateDetailsPageRoute
          exact
          path="/admin/marking-templates/:templateId"
        />
        <FeedbackMarkupPageRoute exact path="/admin/feedback-markup" />
        <SubmissionReviewPageRoute
          exact
          path="/admin/feedback-markup/review/:documentId"
        />
        <GradeBookListingPageRoute exact path="/admin/grade-book" />
        <CreateGradeBookPageRoute exact path="/admin/grade-book/create" />
        <GradeBookDetailsPageRoute
          exact
          path="/admin/grade-book/:gradeBookId"
        />
        <GradeBookV2ListingPageRoute exact path="/admin/grade-book-v2" />
        <SetupGradeBookV2PageRoute exact path="/admin/grade-book-v2/create" />
        <SetupGradeBookV2PageRoute
          exact
          path="/admin/grade-book-v2/:gradebookId/edit"
        />
        <GradeBookV2DetailsPageRoute
          exact
          path="/admin/grade-book-v2/:gradebookId"
        />
        <ManualMarkingExamsPageRoute exact path="/admin/manual-marking" />
        <ManualMarkingStudentsPageRoute
          exact
          path="/admin/manual-marking/:examId/students"
        />
        <StudentMarkingPageRoute
          exact
          path="/admin/manual-marking/:examId/student/:studentId"
        />
        <BulkCourseV2ListingPageRoute exact path="/admin/bulk-courses" />
        <CreateBulkCourseV2BatchPageRoute
          exact
          path="/admin/bulk-courses/create"
        />
        <TemplatesListingPageRoute exact path="/admin/bulk-courses/templates" />
        <TemplateFormPageRoute
          exact
          path="/admin/bulk-courses/templates/create"
        />
        <TemplateFormPageRoute
          exact
          path="/admin/bulk-courses/templates/:templateId/edit"
        />
        <BulkCourseV2BatchDetailsPageRoute
          exact
          path="/admin/bulk-courses/:batchId"
        />
        <CertificateUploadPageRoute exact path="/admin/certificates" />
        <CertificateManagementPageRoute
          exact
          path="/admin/certificate-management"
        />
        <CourseMaterialUploadPageRoute exact path="/admin/course-materials" />
        <CourseRosterPageRoute exact path="/admin/course-roster" />
        <UserDocumentsPageRoute exact path="/admin/user-documents" />
        <UserDocumentDetailsPageRoute
          exact
          path="/admin/user-documents/:userId/:uploadId"
        />
        <ReportExportPageRoute exact path="/admin/report-export" />
        <QuestionImportPageRoute exact path="/admin/question-import" />
        <UploadDetailsPageRoute exact path="/admin/question-import/:uploadId" />
        <QuestionBankTemplatesPageRoute
          exact
          path="/admin/question-bank-templates"
        />
        <QuestionBankTemplateDetailsPageRoute
          exact
          path="/admin/question-bank-templates/:templateId"
        />
        <DataOperationsPageRoute exact path="/admin/data-operations" />
        <QuestionBankPageRoute
          exact
          path="/admin/multimedia-questions/:examinationId"
        />
        <QuestionEditorPageRoute
          exact
          path="/admin/multimedia-questions/:examinationId/new"
        />
        <MultimediaStatsPageRoute
          exact
          path="/admin/multimedia-questions/:examinationId/stats"
        />
        <QuestionEditorPageRoute
          exact
          path="/admin/multimedia-questions/:examinationId/:questionId/edit"
        />
        <QuestionPreviewPageRoute
          exact
          path="/admin/multimedia-questions/:examinationId/:questionId/preview"
        />
        <MediaManagerPageRoute
          exact
          path="/admin/multimedia-questions/:examinationId/:questionId/media"
        />
        <ExamPaperConfigPageRoute
          exact
          path="/admin/exam-paper-config/:examinationId"
        />
        <ExamConfigKPIPageRoute exact path="/admin/exam-config/kpis" />
        <ImportReportPageRoute
          exact
          path="/admin/batch-import/:examinationId/result/:uploadId/report"
        />
        <ImportResultPageRoute
          exact
          path="/admin/batch-import/:examinationId/result/:uploadId"
        />
        <BatchHistoryPageRoute
          exact
          path="/admin/batch-import/:examinationId/history"
        />
        <BatchImportPageRoute exact path="/admin/batch-import/:examinationId" />
        <BatchHistoryPageRoute exact path="/admin/question-imports" />
        <BadgeSupportPageRoute exact path="/admin/badge-support" />
        <BadgeKPIPageRoute exact path="/admin/badges/kpis" />
        <BadgeReportPageRoute exact path="/admin/badges/report" />
        <PendingApprovalsPageRoute
          exact
          path="/admin/badges/pending-approvals"
        />
        <MarkingSchemeFormPageRoute exact path="/admin/marking-schemes/new" />
        <MarkingSchemeKPIPageRoute exact path="/admin/marking-schemes/kpis" />
        <GradeDistributionPageRoute
          exact
          path="/admin/marking-schemes/distribution/:examinationId"
        />
        <MarkingSchemeDetailPageRoute
          exact
          path="/admin/marking-schemes/:schemeId"
        />
        <MarkingSchemesListPageRoute exact path="/admin/marking-schemes" />
        <AcademicMetricsDashboardRoute exact path="/admin/dashboard/academic" />
        <InteractiveDashboardRoute exact path="/admin/dashboard/interactive" />
        <StudentTrainingReportPageRoute
          exact
          path="/admin/student-progress/:studentId"
        />

        <SecurityPageRoute path="/admin/settings/security" />
        <GradeCriteriaPageRoute path="/admin/settings/grade-criteria" />
        <SettingsPageRoute path="/admin/settings" />
        <AnnouncementListingRoute exact path="/admin/announcement" />
        <CreateAnnouncementRoute exact path="/admin/announcement/edit" />
        <RemindersListingPageRoute exact path="/admin/reminders" />
        <CreateReminderPageRoute exact path="/admin/reminders/create" />
        <CreateReminderPageRoute exact path="/admin/reminders/edit" />
        <DataImportExportPageRoute exact path="/admin/data-import-export" />
        <ViewAuditRoute exact path="/admin/audit" />
        <ManagementReportRoute exact path="/admin/report/managementReport" />
        <InstructorReportRoute exact path="/admin/report/instructorReport" />
        <InstructorReportDetailsRoute
          exact
          path="/admin/report/instructorReport/:instructorId/details"
        />
        <CourseCompletionRoute
          exact
          path="/admin/report/instructorReport/:instructorId/courseCompletion"
        />
        <InstructorPerformanceRoute
          exact
          path="/admin/report/instructorReport/:instructorId/instructorPerformance"
        />
        <AssignmentGradingRoute
          exact
          path="/admin/report/instructorReport/:instructorId/assignmentGrading"
        />
        <AssignmentAnalysisRoute
          exact
          path="/admin/report/instructorReport/:instructorId/assignmentAnalysis"
        />
        <InstructorReportRoute exact path="/admin/report/instructorReport" />
        <InstructorReportDetailsRoute
          exact
          path="/admin/report/instructorReport/:instructorId/details"
        />
        <CourseCompletionRoute
          exact
          path="/admin/report/instructorReport/:instructorId/courseCompletion"
        />
        <InstructorPerformanceRoute
          exact
          path="/admin/report/instructorReport/:instructorId/instructorPerformance"
        />
        <AssignmentGradingRoute
          exact
          path="/admin/report/instructorReport/:instructorId/assignmentGrading"
        />
        <AssignmentAnalysisRoute
          exact
          path="/admin/report/instructorReport/:instructorId/assignmentAnalysis"
        />
        <InstructorPerformanceV2PageRoute
          exact
          path="/admin/report/instructor-performance"
        />
        <AssessmentAnalyticsPageRoute
          exact
          path="/admin/report/assessment-analytics"
        />
        <StudentReportDetailsRoute
          exact
          path="/admin/report/studentReport/:studentId/details"
        />
        <StudentProgressListingPageRoute
          exact
          path="/admin/report/student-progress"
        />
        <AdminStudentCourseProgressPageRoute
          exact
          path="/admin/report/studentReport/:studentId/progress/course/:courseId"
        />
        <ProgressReportRoute
          exact
          path="/admin/report/studentReport/:studentId/progress"
        />
        <AdminStudentTrainingReportPageRoute
          exact
          path="/admin/report/studentReport/:studentId/training-report"
        />
        <TranscriptReportRoute
          exact
          path="/admin/report/studentReport/:studentId/transcript"
        />
        <AttendanceReportRoute
          exact
          path="/admin/report/studentReport/:studentId/attendance"
        />
        <AssessmentReportRoute
          exact
          path="/admin/report/studentReport/:studentId/assessment"
        />
        <ComplianceReportRoute
          exact
          path="/admin/report/studentReport/:studentId/compliance"
        />
        <AllStudentTranscriptsPageRoute
          exact
          path="/admin/report/studentTranscripts"
        />
        <StudentTranscriptDetailsPageRoute
          exact
          path="/admin/report/studentTranscripts/:transcriptId"
        />
        <ArchivedReportsPageRoute exact path="/admin/report/archived" />
        <ComplianceSecurityReportPageRoute
          exact
          path="/admin/report/compliance"
        />
        <ProjectGradingReportPageRoute
          exact
          path="/admin/report/project-grading"
        />
        <SubmissionsReportPageRoute exact path="/admin/report/submissions" />
        <ExamIntegrityPageRoute exact path="/admin/report/exam-integrity" />
        <QuestionBankUsagePageRoute
          exact
          path="/admin/report/question-bank-usage"
        />
        <MISReportsPageRoute exact path="/admin/mis-reports" />
        <StudentParticipationDetailsPageRoute
          exact
          path="/admin/report/participation-monitoring/:studentId"
        />
        <ParticipationMonitoringPageRoute
          exact
          path="/admin/report/participation-monitoring"
        />
        <ReportBuilderPageRoute exact path="/admin/report/report-builder" />
        <AssessmentOverviewPageRoute
          exact
          path="/admin/report/assessment-overview"
        />
        <SystemUtilizationReportPageRoute
          exact
          path="/admin/report/system-utilization"
        />
        <AttendanceReportPageRoute
          exact
          path="/admin/report/attendance"
        />
        <PerformanceFiltersPageRoute
          exact
          path="/admin/report/performance-filters"
        />
        <VisualAnalyticsDashboardPageRoute
          exact
          path="/admin/report/visual-analytics"
        />
        <ProctoringKpiSummaryPageRoute
          exact
          path="/admin/report/proctoring-audit/kpi-summary"
        />
        <ExamSessionAuditPageRoute
          exact
          path="/admin/report/proctoring-audit/exam/:examId"
        />
        <ProctoringAuditReportPageRoute
          exact
          path="/admin/report/proctoring-audit"
        />
        <EnrollmentStatusReportPageRoute
          exact
          path="/admin/report/enrollment-status"
        />
        <CourseCompletionReportPageRoute
          exact
          path="/admin/report/course-completion"
        />
        <TC01CoursePassRateReportRoute
          exact
          path="/admin/report/tc01-course-pass-rate"
        />
        <AuditTrailReportPageRoute exact path="/admin/report/audit-trail" />
        <ScheduledReportingPageRoute
          exact
          path="/admin/report/scheduled-reporting"
        />
        <StudentReportingModulePageRoute
          exact
          path="/admin/report/student-reporting"
        />

        <AdminExamResultAnalysisPageRoute
          exact
          path="/admin/exam-result-analysis/:examId"
        />
        <ExamNotificationsPageRoute exact path="/admin/exam-notifications" />
        <ExamCompliancePageRoute exact path="/admin/compliance" />
        <ExportReportsPageRoute exact path="/admin/export-reports" />
        <CustomFieldsPageRoute exact path="/admin/custom-fields" />
        <IpPolicyPageRoute exact path="/admin/ip-policy" />
        <StudentTranscriptV2PageRoute
          exact
          path="/admin/student-transcript-v2"
        />
        <PerformanceDrillDownPageRoute
          exact
          path="/admin/performance-drill-down"
        />
        <InlineMarkupPageRoute exact path="/admin/feedback-markup-review" />

        <NotFoundPageRoute />
      </Switch>
    </Box>
  );
};

export default MainArea;
