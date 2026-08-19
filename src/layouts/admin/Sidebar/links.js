import { FiSettings, FiAward, FiArchive, FiBarChart2 } from "react-icons/fi";
import { GiBookshelf } from "react-icons/gi";
import { HiUsers } from "react-icons/hi";
import { RiDashboardLine } from "react-icons/ri";
import { IoIosCalendar } from "react-icons/io";
import { AiOutlineAudit } from "react-icons/ai";
import { TiPen } from "react-icons/ti";
import { MdAssessment } from "react-icons/md";
import { FaSitemap } from "react-icons/fa";

export const links = [
  {
    href: "/admin/",
    text: "dashboard",
    exact: true,
    icon: <RiDashboardLine />,
    links: [
      { href: "/admin/", text: "Overview", exact: true },
      { href: "/admin/dashboard/interactive", text: "Interactive Dashboard" },
      { href: "/admin/dashboard/academic", text: "Academic Metrics" },
    ],
  },
  {
    text: "account",
    href: "/admin/settings/",
    icon: <FiSettings />,
  },
  {
    text: "Users & Access",
    icon: <HiUsers />,
    links: [
      { href: "/admin/users?page=1&limit=10", text: "users" },
      { href: "/admin/departments?page=1&limit=10", text: "departments" },
      // { href: "/admin/role", text: "roles" },
      { href: "/admin/custom-fields", text: "Custom Fields" },
      { href: "/admin/ip-policy", text: "IP Auth Policy" },
      // { href: "/admin/audit", text: "user audit" },
    ],
  },
  {
    text: "Courses & Library",
    icon: <GiBookshelf />,
    links: [
      { href: "/admin/courses?page=1&limit=10", text: "courses" },
      { href: "/admin/bulk-courses", text: "Bulk Course Creation" },
      { href: "/admin/course-materials", text: "Course Materials" },
      { href: "/admin/library", text: "library" },
      // { href: "/admin/documents", text: "documents" },
      // { href: "/admin/question-import", text: "Question Upload" },
    ],
  },
  {
    text: "Examinations & Grading",
    icon: <TiPen />,
    links: [
      { href: "/admin/standalone-exams", text: "Standalone Exams" },
      { href: "/admin/polls", text: "Polls" },
      // { href: "/admin/examination-marking", text: "Exam Marking" },
      // { href: "/admin/manual-marking", text: "Manual Marking" },
      { href: "/admin/marking-templates", text: "Marking Templates" },
      // { href: "/admin/marking-schemes", text: "Marking Schemes" },
      { href: "/admin/exam-paper-config-presets", text: "Exam Template Library" },
      // { href: "/admin/grade-book", text: "Grade Book" },
      { href: "/admin/grade-book-v2", text: "Advanced Grade Book" },
      // { href: "/admin/feedback-markup", text: "Feedback Markup" },
      // { href: "/admin/feedback-markup-review", text: "Inline Markup Review" },
    ],
  },
  {
    text: "Certificates & Badges",
    icon: <FiAward />,
    links: [
      { href: "/admin/certificates", text: "Certificate Upload" },
      { href: "/admin/certificate-management", text: "Issued Certificates" },
      { href: "/admin/badge-support", text: "Badge Support" },
      // { href: "/admin/user-documents", text: "Document Verification" },
    ],
  },
  {
    text: "Communications & Events",
    icon: <IoIosCalendar />,
    links: [
      { href: "/admin/events", text: "events" },
      { href: "/admin/announcement", text: "announcements" },
      { href: "/admin/reminders", text: "Email Reminders" },
    ],
  },
  {
    text: "Report",
    icon: <AiOutlineAudit />,
    href: "/admin/report/student-progress",
    links: [
      {
        href: "/admin/report/archived",
        text: "Archived Reports",
      },
      {
        href: "/admin/report/assessment-analytics",
        text: "Assessment Analytics",
      },
      {
        href: "/admin/report/attendance",
        text: "Attendance Report",
      },
      {
        href: "/admin/report/course-completion",
        text: "Course Completion & Pass Rate",
      },
      {
        href: "/admin/examination",
        text: "Examination Result Analysis",
      },
      {
        href: "/admin/report/instructor-performance",
        text: "Instructor Performance",
      },
      {
        href: "/admin/report/managementReport",
        text: "Management Report",
      },
      {
        href: "/admin/mis-reports",
        text: "MIS Reports",
      },
      {
        href: "/admin/report/participation-monitoring",
        text: "Participation Monitoring",
      },
      {
        href: "/admin/report/performance-filters",
        text: "Performance Filters",
      },
      {
        href: "/admin/report/proctoring-audit",
        text: "Proctoring & Audit",
      },
      {
        href: "/admin/report/report-builder",
        text: "Report Builder",
      },
      {
        href: "/admin/report/student-progress",
        text: "Student Progress Report",
      },
      // {
      //   href: "/admin/student-transcript-v2",
      //   text: "Transcript Posting",
      // },
      {
        href: "/admin/report/studentTranscripts",
        text: "Student Transcripts",
      },
      {
        href: "/admin/report/system-utilization",
        text: "System Utilization",
      },
      {
        href: "/admin/report/visual-analytics",
        text: "Visual Analytics",
      },
    ],
  },
  {
    text: "Analytics",
    icon: <FiBarChart2 />,
    href: "/admin/report/project-grading",
    links: [
      {
        href: "/admin/report/project-grading",
        text: "Assignment Grading Summary",
      },
      {
        href: "/admin/report/audit-trail",
        text: "Audit Trail Report",
      },
      {
        href: "/admin/compliance",
        text: "Compliance & Non-Compliance Training Monitor",
      },
      {
        href: "/admin/report/enrollment-status",
        text: "Enrollment Status Report",
      },
      {
        href: "/admin/exam-notifications",
        text: "Exam Notifications",
      },
      {
        href: "/admin/performance-drill-down",
        text: "Performance Drill-Down",
      },
      {
        href: "/admin/report/question-bank-usage",
        text: "Question Bank Usage",
      },
      {
        href: "/admin/report/exam-integrity",
        text: "Randomization and Integrity Report",
      },
      {
        href: "/admin/report/scheduled-reporting",
        text: "Scheduled Reporting",
      },
      {
        href: "/admin/report/student-reporting",
        text: "Student Reporting & Participation",
      },
      {
        href: "/admin/report/submissions",
        text: "Submissions Report",
      },
    ],
  },
  {
    href: "/admin/data-import-export",
    text: "Data Import & Export",
    icon: <FiArchive />,
  },
  {
    href: "/admin/workflow",
    text: "Approval Workflow",
    icon: <FaSitemap />,
    roles: ["supervisor"],
  },
  {
    text: "Reports",
    icon: <MdAssessment />,
    href: "/admin/report/report-builder",
    roles: ["supervisor"],
    links: [
      {
        href: "/admin/report/assessment-analytics",
        text: "Assessment Analytics Report",
      },
      {
        href: "/admin/report/project-grading",
        text: "Assignment Grading Summary",
      },
      {
        href: "/admin/compliance",
        text: "Compliance & Non-Compliance Training Monitor",
      },
      {
        href: "/admin/report/course-completion",
        text: "Course Completion & Pass Rate Report",
      },
      {
        href: "/admin/report/instructor-performance",
        text: "Instructor Performance Report",
      },
      {
        href: "/admin/report/report-builder",
        text: "Multi-search Custom Report Builder",
      },
    ],
  },
  {
    href: "/admin/workflow/track",
    text: "Workflow Tracking",
    icon: <FaSitemap />,
    roles: ["super admin"],
  },
];

export const superAdminSettingsLinks = [
  {
    text: "account",
    href: "/admin/settings/",
    exact: true,
    icon: <FiSettings />,
  },
  {
    href: "/admin/settings/grade-criteria",
    text: "grade criteria",
    icon: <RiDashboardLine />,
  },
];

export const settingsLinks = [
  {
    text: "account",
    href: "/admin/settings/",
    exact: true,
    icon: <FiSettings />,
  },
];
