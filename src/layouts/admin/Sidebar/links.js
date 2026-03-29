import { FiSettings } from "react-icons/fi";
import { GiBookshelf } from "react-icons/gi";
import { HiOutlineOfficeBuilding, HiUsers } from "react-icons/hi";
import { RiDashboardLine } from "react-icons/ri";
import { IoIosCalendar } from "react-icons/io";
import { AiOutlineUsergroupDelete, AiOutlineAudit } from "react-icons/ai";
import { VscLibrary } from "react-icons/vsc";
import { TiPen } from "react-icons/ti";
import { MdOutlineAnnouncement } from "react-icons/md";
import { FaFolderOpen, FaSitemap } from "react-icons/fa";
import { FiAward } from "react-icons/fi";

export const links = [
  {
    href: "/admin/",
    text: "dashboard",
    exact: true,
    icon: <RiDashboardLine />,
  },
  {
    href: "/admin/users?page=1&limit=10",
    text: "users",
    icon: <HiUsers />,
  },
  {
    href: "/admin/courses?page=1&limit=10",
    text: "courses",
    icon: <GiBookshelf />,
  },
  {
    href: "/admin/events",
    text: "events",
    icon: <IoIosCalendar />,
  },
  {
    href: "/admin/standalone-exams",
    text: "Standalone Exams",
    icon: <TiPen />,
  },
  {
    href: "/admin/examination",
    text: "Examination",
    icon: <TiPen />,
  },
  {
    href: "/admin/polls",
    text: "Polls",
    icon: <TiPen />,
  },
  {
    text: "account",
    href: "/admin/settings/",
    icon: <FiSettings />,
  },
  {
    href: "/admin/departments?page=1&limit=10",
    text: "departments",
    icon: <HiOutlineOfficeBuilding />,
  },
  {
    href: "/admin/role",
    text: "roles",
    icon: <AiOutlineUsergroupDelete />,
  },
  {
    href: "/admin/library",
    text: "library",
    icon: <VscLibrary />,
  },
  {
    href: "/admin/documents",
    text: "documents",
    icon: <FaFolderOpen />,
  },
  {
    href: "/admin/announcement",
    text: "announcements",
    icon: <MdOutlineAnnouncement />,
  },
  {
    href: "/admin/audit",
    text: "user audit",
    icon: <AiOutlineAudit />,
  },
  //  {
  //   href: "/admin/report",
  //   text: "Report",
  //   icon: <AiOutlineAudit />,
  // },
  {
    text: "Report",
    icon: <AiOutlineAudit />,
    href: "/admin/report/studentReport",
    links: [
      {
        href: '/admin/report/studentReport',
        text: 'Student Report',
      },
      {
        href: '/admin/report/managementReport',
        text: 'Management Report',
      },
      {
        href: '/admin/report/archived',
        text: 'Archived Reports',   
      },
      {
        href: '/admin/report/compliance',
        text: 'Compliance & Security',
      },
       {
        href: '/admin/report/instructorReport',
        text: 'Instructor & Teaching Reports',
      },
    ],
  },
  {
    href: "/admin/workflow",
    text: "Approval Workflow",
    icon: <FaSitemap />,
  },
  {
    href: "/admin/badge-support",
    text: "Badge Support",
    icon: <FiAward />,
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
