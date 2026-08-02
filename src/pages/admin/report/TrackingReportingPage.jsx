import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { useHistory, Route } from "react-router-dom";
import { AdminMainAreaWrapper } from "../../../layouts";
import { motion } from "framer-motion";
import ScheduleReportModal from "./components/ScheduleReportModal";

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Box
    bg="white"
    p={4}
    borderRadius="xl"
    border="1px solid #F2F4F7"
    boxShadow="xs"
  >
    <Text fontSize="13px" fontWeight="500" color="#101928" mb={2}>
      {title}
    </Text>
    <Text fontSize="24px" fontWeight="700" color="#101928" mb={1}>
      {value}
    </Text>
    <Text fontSize="12px" fontWeight="500" color={subtextColor || "#667085"}>
      {subtext}
    </Text>
  </Box>
);

const TrackingReportingPage = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "passed":
      case "approved":
      case "active":
      case "graduated":
      case "compliant":
      case "complaint":
        return { bg: "#ECFDF3", color: "#027A48" };
      case "in-progress":
      case "pending":
      case "pending review":
      case "suspended":
        return { bg: "#FFFAEB", color: "#B54708" };
      case "failed":
      case "rejected":
      case "withdrawn":
      case "non-compliant":
      case "non-complaint":
      case "duplicate detected":
        return { bg: "#FEF3F2", color: "#B42318" };
      case "waitlisted":
      case "not started":
        return { bg: "#F2F4F7", color: "#344054" };
      case "open":
        return { bg: "#ECFDF3", color: "#027A48" };
      case "full":
        return { bg: "#FFFAEB", color: "#B54708" };
      default:
        return { bg: "#F2F4F7", color: "#344054" };
    }
  };

  // --- Mock Data ---

  const importExportData = [
    {
      id: "DEX-0098",
      type: "Import",
      format: "CSV",
      records: "2049",
      source: "Certificate Upload",
      performedBy: "John Doe",
      status: "Completed",
      validation: "Passed",
      date: "26/11/2025",
      time: "11:30am",
      remarks: "User data backup generated successfully",
    },
    {
      id: "DEX-0098",
      type: "Export",
      format: "Excel",
      records: "2500",
      source: "Dashboard",
      performedBy: "John Doe",
      status: "In-progress",
      validation: "Pending review",
      date: "26/11/2025",
      time: "11:30am",
      remarks: "User data backup generated successfully",
    },
    {
      id: "DEX-0098",
      type: "Import",
      format: "JSON",
      records: "940",
      source: "Course Upload",
      performedBy: "John Doe",
      status: "Completed",
      validation: "Passed",
      date: "26/11/2025",
      time: "11:30am",
      remarks: "User data backup generated successfully",
    },
    {
      id: "DEX-0098",
      type: "Export",
      format: "XML",
      records: "1294",
      source: "Student Report",
      performedBy: "John Doe",
      status: "Failed",
      validation: "Failed",
      date: "26/11/2025",
      time: "11:30am",
      remarks: "User data backup generated successfully",
    },
  ];

  const enrollmentStatusData = [
    {
      id: "CSC101",
      title: "Introduction to Programming",
      student: "John Doe",
      studentId: "#123345",
      status: "Approved",
      date: "26/11/2025",
      instructor: "Dr. A. Smith",
      remarks: "Enrollment confirmed",
    },
    {
      id: "CSC101",
      title: "Introduction to Programming",
      student: "John Doe",
      studentId: "#123345",
      status: "Pending",
      date: "26/11/2025",
      instructor: "Dr. A. Smith",
      remarks: "Awaiting instructor review",
    },
    {
      id: "CSC101",
      title: "Introduction to Programming",
      student: "John Doe",
      studentId: "#123345",
      status: "Approved",
      date: "26/11/2025",
      instructor: "Dr. A. Smith",
      remarks: "Enrollment confirmed",
    },
    {
      id: "CSC101",
      title: "Introduction to Programming",
      student: "John Doe",
      studentId: "#123345",
      status: "Rejected",
      date: "26/11/2025",
      instructor: "Dr. A. Smith",
      remarks: "Enrollment rejected",
    },
    {
      id: "CSC101",
      title: "Introduction to Programming",
      student: "John Doe",
      studentId: "#123345",
      status: "Waitlisted",
      date: "26/11/2025",
      instructor: "Dr. A. Smith",
      remarks: "Enrollment on the waitlist",
    },
  ];

  const reportWorklistData = [
    {
      id: "REP-0098",
      name: "John Doe",
      studentId: "STU-2025-054",
      address: "12 Adeyemi Street, Lagos.",
      dept: "Computer Science",
      status: "Active",
      generatedBy: "Registrar",
      timestamp: "26/11/2025",
      remarks: "Generated for departmental review",
    },
    {
      id: "REP-0098",
      name: "John Doe",
      studentId: "STU-2025-054",
      address: "12 Adeyemi Street, Lagos.",
      dept: "Computer Science",
      status: "Suspended",
      generatedBy: "Admin",
      timestamp: "26/11/2025",
      remarks: "Generated for departmental review",
    },
    {
      id: "REP-0098",
      name: "John Doe",
      studentId: "STU-2025-054",
      address: "12 Adeyemi Street, Lagos.",
      dept: "Computer Science",
      status: "Completed",
      generatedBy: "Registrar",
      timestamp: "26/11/2025",
      remarks: "Generated for departmental review",
    },
    {
      id: "REP-0098",
      name: "John Doe",
      studentId: "STU-2025-054",
      address: "12 Adeyemi Street, Lagos.",
      dept: "Computer Science",
      status: "Withdrawn",
      generatedBy: "Instructor",
      timestamp: "26/11/2025",
      remarks: "Generated for departmental review",
    },
    {
      id: "REP-0098",
      name: "John Doe",
      studentId: "STU-2025-054",
      address: "12 Adeyemi Street, Lagos.",
      dept: "Computer Science",
      status: "Graduated",
      generatedBy: "Registrar",
      timestamp: "26/11/2025",
      remarks: "Generated for departmental review",
    },
  ];

  const trainingProgressData = [
    {
      id: "REP-0098",
      student: "John Doe",
      studentId: "#STU-2025-054",
      curriculum: "Software Development Training",
      course: "JavaScript Essentials",
      status: "Completed",
      score: "88",
      progress: "98%",
      notifiedBy: "Instructor",
      remarks: "Excellent performance, strong participation",
      timestamp: "26/11/2025",
    },
    {
      id: "REP-0098",
      student: "John Doe",
      studentId: "#STU-2025-054",
      curriculum: "Software Development Training",
      course: "JavaScript Essentials",
      status: "In-progress",
      score: "71",
      progress: "86%",
      notifiedBy: "Instructor",
      remarks: "Excellent performance, strong participation",
      timestamp: "26/11/2025",
    },
    {
      id: "REP-0098",
      student: "John Doe",
      studentId: "#STU-2025-054",
      curriculum: "Software Development Training",
      course: "JavaScript Essentials",
      status: "Completed",
      score: "95",
      progress: "93%",
      notifiedBy: "Instructor",
      remarks: "Excellent performance, strong participation",
      timestamp: "26/11/2025",
    },
    {
      id: "REP-0098",
      student: "John Doe",
      studentId: "#STU-2025-054",
      curriculum: "Software Development Training",
      course: "JavaScript Essentials",
      status: "Not Started",
      score: "-",
      progress: "-",
      notifiedBy: "Instructor",
      remarks: "Excellent performance, strong participation",
      timestamp: "26/11/2025",
    },
  ];

  const courseEnrollmentData = [
    {
      id: "REP-0098",
      title: "Introduction to Data Science",
      courseId: "CSE-201",
      dept: "Computer Science",
      instructor: "Dr. Adewale Johnson",
      count: "74",
      capacity: "100",
      status: "Open",
      date: "26/11/2025",
      generatedBy: "Registrar",
    },
    {
      id: "REP-0098",
      title: "Introduction to Data Science",
      courseId: "CSE-201",
      dept: "Computer Science",
      instructor: "Dr. Adewale Johnson",
      count: "85",
      capacity: "85",
      status: "Full",
      date: "26/11/2025",
      generatedBy: "System",
    },
    {
      id: "REP-0098",
      title: "Introduction to Data Science",
      courseId: "CSE-201",
      dept: "Computer Science",
      instructor: "Dr. Adewale Johnson",
      count: "85",
      capacity: "85",
      status: "Full",
      date: "26/11/2025",
      generatedBy: "Registrar",
    },
    {
      id: "REP-0098",
      title: "Introduction to Data Science",
      courseId: "CSE-201",
      dept: "Computer Science",
      instructor: "Dr. Adewale Johnson",
      count: "97",
      capacity: "100",
      status: "Open",
      date: "26/11/2025",
      generatedBy: "System",
    },
  ];

  const trainingComplianceData = [
    {
      id: "NOT-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Workplace Ethics",
      status: "Compliant",
      dueDate: "26/11/2025",
      type: "Completion Confirmation",
      date: "26/11/2025",
      notifiedBy: "System",
      remarks: "-",
    },
    {
      id: "NOT-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Workplace Ethics",
      status: "Compliant",
      dueDate: "26/11/2025",
      type: "Initial Reminder",
      date: "26/11/2025",
      notifiedBy: "HR Admin",
      remarks: "-",
    },
    {
      id: "NOT-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Workplace Ethics",
      status: "Non-Compliant",
      dueDate: "26/11/2025",
      type: "Completion Confirmation",
      date: "26/11/2025",
      notifiedBy: "System",
      remarks: "Student failed to complete by due-date",
    },
    {
      id: "NOT-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Workplace Ethics",
      status: "Compliant",
      dueDate: "26/11/2025",
      type: "Initial Reminder",
      date: "26/11/2025",
      notifiedBy: "Training Officer",
      remarks: "-",
    },
    {
      id: "NOT-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Workplace Ethics",
      status: "Non-Compliant",
      dueDate: "26/11/2025",
      type: "Final Reminder",
      date: "26/11/2025",
      notifiedBy: "HR Admin",
      remarks: "Student failed to complete by due-date",
    },
    {
      id: "NOT-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Workplace Ethics",
      status: "Non-Compliant",
      dueDate: "26/11/2025",
      type: "Completion Confirmation",
      date: "26/11/2025",
      notifiedBy: "Training Officer",
      remarks: "Student failed to complete by due-date",
    },
  ];

  const duplicateEnrollmentData = [
    {
      id: "VER-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Business Management 101",
      status: "Active",
      actionTaken: "No Action",
      timestamp: "26/11/2025 06:00",
      verifiedBy: "System",
      remarks: "-",
    },
    {
      id: "VER-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Business Management 101",
      status: "Pending",
      actionTaken: "No Action",
      timestamp: "26/11/2025 06:00",
      verifiedBy: "Admin",
      remarks: "Student enrolled twice due to system timeout",
    },
    {
      id: "VER-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Business Management 101",
      status: "Active",
      actionTaken: "No Action",
      timestamp: "26/11/2025 06:00",
      verifiedBy: "System",
      remarks: "-",
    },
    {
      id: "VER-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Business Management 101",
      status: "Duplicate detected",
      actionTaken: "Flagged for Review",
      timestamp: "26/11/2025 06:00",
      verifiedBy: "Admin",
      remarks: "Student enrolled twice due to system timeout",
    },
    {
      id: "VER-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Business Management 101",
      status: "Pending",
      actionTaken: "No Action",
      timestamp: "26/11/2025 06:00",
      verifiedBy: "Admin",
      remarks: "Student enrolled twice due to system timeout",
    },
    {
      id: "VER-001",
      name: "Jane Okafor",
      employeeId: "#STU-2025-054",
      course: "Business Management 101",
      status: "Duplicate detected",
      actionTaken: "Merged",
      timestamp: "26/11/2025 06:00",
      verifiedBy: "System",
      remarks: "Student enrolled twice due to system timeout",
    },
  ];

  const tabs = [
    "Data Import & Export Interface",
    "Course Enrollment Status Display",
    "Student Report & Worklist Generation",
    "Student Training Progress Report",
    "Course Enrollment Status Report",
    "Training Compliance Notification Report",
    "Duplicate Enrollment Verification Report",
  ];

  const renderStats = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <SummaryCard
              title="Successful Import/Export (%)"
              value="95%"
              subtext="per month"
            />
            <SummaryCard
              title="Average Processing Time"
              value="35mins"
              subtext="+5% vs last month"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Data Validation Accuracy (%)"
              value="85%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Report Accuracy"
              value="70%"
              subtext="stable"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Failed Transfers"
              value="68"
              subtext="per month"
            />
          </>
        );
      case 1:
        return (
          <>
            <SummaryCard
              title="Approved Enrollment (%)"
              value="75%"
              subtext="per course"
            />
            <SummaryCard
              title="Pending Enrollment"
              value="45"
              subtext="per course"
            />
            <SummaryCard
              title="Average Approval Time"
              value="5d 2h"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard title="Approved : Rejected" value="75:5" subtext="" />
            <SummaryCard
              title="Enrollment Accuracy Rate"
              value="90%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
          </>
        );
      case 2:
        return (
          <>
            <SummaryCard
              title="Average Processing Time"
              value="35mins"
              subtext="+5% vs last month"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Number of Reported Generated"
              value="45"
              subtext="per month"
            />
            <SummaryCard
              title="Data Retrieval Success (%)"
              value="85%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Report Accuracy"
              value="70%"
              subtext="stable"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Enrollment Accuracy"
              value="70%"
              subtext="stable"
              subtextColor="#12B76A"
            />
          </>
        );
      case 3:
        return (
          <>
            <SummaryCard
              title="Average Progress Rate (%)"
              value="80%"
              subtext="+5% vs last month"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Module Completion Ratio (%)"
              value="85%"
              subtext="+5% vs last month"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Meeting Curriculum Benchmarks"
              value="124/150"
              subtext=""
            />
            <SummaryCard
              title="Average Assessment Score"
              value="85%"
              subtext="+5% vs last month"
              subtextColor="#12B76A"
            />
            <SummaryCard title="Report Accuracy" value="70%" subtext="Daily" />
          </>
        );
      case 4:
        return (
          <>
            <SummaryCard
              title="Average Enrollment Rate (%)"
              value="80%"
              subtext="per department"
            />
            <SummaryCard
              title="Courses at capacity"
              value="12"
              subtext="per session"
            />
            <SummaryCard
              title="Course Demand Index"
              value="1.8"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Data Accuracy Rate (%)"
              value="90%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard title="Report Frequency" value="Daily" subtext="" />
          </>
        );
      case 5:
        return (
          <>
            <SummaryCard
              title="Compliance Rate (%)"
              value="80%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Non-Compliant (month)"
              value="12"
              subtext="+5% vs last period"
              subtextColor="#F04438"
            />
            <SummaryCard
              title="Average time to comply"
              value="5 days"
              subtext=""
            />
            <SummaryCard
              title="On-Time Completion Rate (%)"
              value="90%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Notification Frequency"
              value="Daily"
              subtext=""
            />
          </>
        );
      case 6:
        return (
          <>
            <SummaryCard
              title="Duplicate Detection Rate (%)"
              value="1.5%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Duplicate Records Flagged"
              value="67"
              subtext="per month"
            />
            <SummaryCard
              title="Average Resolution Time (hours)"
              value="5 hours"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
            <SummaryCard
              title="Data Integrity Compliance Rate (%)"
              value="90%"
              subtext="+5% vs last period"
              subtextColor="#12B76A"
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 0:
        return (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}>
                  <Checkbox colorScheme="purple" />
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Operation ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Type
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  File format
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Records
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Source
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Performed By
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Validation Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Date and Time
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Remarks
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {importExportData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={4}>
                    <Checkbox colorScheme="purple" />
                  </Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">
                    {item.id}
                  </Td>
                  <Td fontSize="12px">
                    <HStack>
                      {item.type === "Import" ? (
                        <FiDownload color="#12B76A" />
                      ) : (
                        <FiUpload color="#12B76A" />
                      )}
                      <Text>{item.type}</Text>
                    </HStack>
                  </Td>
                  <Td fontSize="12px">{item.format}</Td>
                  <Td fontSize="12px">{item.records}</Td>
                  <Td fontSize="12px">{item.source}</Td>
                  <Td fontSize="12px">{item.performedBy}</Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.validation).bg}
                      color={getStatusColor(item.validation).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.validation}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">
                    <VStack align="start" spacing={0}>
                      <Text>{item.date}</Text>
                      <Text fontSize="11px" color="#667085">
                        {item.time}
                      </Text>
                    </VStack>
                  </Td>
                  <Td fontSize="12px" maxW="150px" lineHeight="1.4">
                    {item.remarks}
                  </Td>
                  <Td>{renderActionMenu()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      case 1:
        return (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}>
                  <Checkbox colorScheme="purple" />
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Course ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Course Title
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Student Name/ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Enrollment Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Enrollment Date
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Instructor
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Remarks
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {enrollmentStatusData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={4}>
                    <Checkbox colorScheme="purple" />
                  </Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">
                    {item.id}
                  </Td>
                  <Td fontSize="12px" color="#475367">
                    {item.title}
                  </Td>
                  <Td fontSize="12px">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#101928">
                        {item.student}
                      </Text>
                      <Text fontSize="11px" color="#667085">
                        {item.studentId}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">{item.date}</Td>
                  <Td fontSize="12px">{item.instructor}</Td>
                  <Td fontSize="12px" maxW="150px" lineHeight="1.4">
                    {item.remarks}
                  </Td>
                  <Td>{renderActionMenu()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      case 2:
        return (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}>
                  <Checkbox colorScheme="purple" />
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Report ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Student Name
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Student ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Address
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Department
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Enrollment Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Generated by
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Timestamp
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Remarks
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {reportWorklistData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={4}>
                    <Checkbox colorScheme="purple" />
                  </Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">
                    {item.id}
                  </Td>
                  <Td fontSize="12px" fontWeight="500" color="#101928">
                    {item.name}
                  </Td>
                  <Td fontSize="12px">{item.studentId}</Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.address}
                  </Td>
                  <Td fontSize="12px">{item.dept}</Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">{item.generatedBy}</Td>
                  <Td fontSize="12px">{item.timestamp}</Td>
                  <Td fontSize="12px" maxW="150px" lineHeight="1.4">
                    {item.remarks}
                  </Td>
                  <Td>{renderActionMenu()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      case 3:
        return (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}>
                  <Checkbox colorScheme="purple" />
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Report ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Student ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Curriculum Title
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Course Title
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Completion Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Assessment Score
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Overall Progress (%)
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Notified by
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Remarks
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Timestamp
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {trainingProgressData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={4}>
                    <Checkbox colorScheme="purple" />
                  </Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">
                    {item.id}
                  </Td>
                  <Td fontSize="12px">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#101928">
                        {item.student}
                      </Text>
                      <Text fontSize="11px" color="#667085">
                        {item.studentId}
                      </Text>
                    </VStack>
                  </Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.curriculum}
                  </Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.course}
                  </Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">{item.score}</Td>
                  <Td fontSize="12px">{item.progress}</Td>
                  <Td fontSize="12px">{item.notifiedBy}</Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.remarks}
                  </Td>
                  <Td fontSize="12px">{item.timestamp}</Td>
                  <Td>{renderActionMenu()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      case 4:
        return (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}>
                  <Checkbox colorScheme="purple" />
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Report ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Course Title
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Course ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Department
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Instructor
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Enrollment Count
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Course Capacity
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Enrollment Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Date Generated
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Generated by
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {courseEnrollmentData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={4}>
                    <Checkbox colorScheme="purple" />
                  </Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">
                    {item.id}
                  </Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.title}
                  </Td>
                  <Td fontSize="12px">{item.courseId}</Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.dept}
                  </Td>
                  <Td fontSize="12px">{item.instructor}</Td>
                  <Td fontSize="12px">{item.count}</Td>
                  <Td fontSize="12px">{item.capacity}</Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">{item.date}</Td>
                  <Td fontSize="12px">{item.generatedBy}</Td>
                  <Td>{renderActionMenu()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      case 5:
        return (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}>
                  <Checkbox colorScheme="purple" />
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Notification ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Employee ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Training Course Title
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Completion Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Compliance Due Date
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Notification Type
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Notification Date
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Notified by
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Remarks
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {trainingComplianceData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={4}>
                    <Checkbox colorScheme="purple" />
                  </Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">
                    {item.id}
                  </Td>
                  <Td fontSize="12px">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#101928">
                        {item.name}
                      </Text>
                      <Text fontSize="11px" color="#667085">
                        {item.employeeId}
                      </Text>
                    </VStack>
                  </Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.course}
                  </Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">{item.dueDate}</Td>
                  <Td fontSize="12px">{item.type}</Td>
                  <Td fontSize="12px">{item.date}</Td>
                  <Td fontSize="12px">{item.notifiedBy}</Td>
                  <Td fontSize="12px" maxW="150px" lineHeight="1.4">
                    {item.remarks}
                  </Td>
                  <Td>{renderActionMenu()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      case 6:
        return (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}>
                  <Checkbox colorScheme="purple" />
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Verification ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Employee ID
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Course Title
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Enrollment Status
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action Taken
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Verification Timestamp
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Verified by
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Remarks
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {duplicateEnrollmentData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={4}>
                    <Checkbox colorScheme="purple" />
                  </Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">
                    {item.id}
                  </Td>
                  <Td fontSize="12px">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#101928">
                        {item.name}
                      </Text>
                      <Text fontSize="11px" color="#667085">
                        {item.employeeId}
                      </Text>
                    </VStack>
                  </Td>
                  <Td fontSize="12px" maxW="150px">
                    {item.course}
                  </Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">{item.actionTaken}</Td>
                  <Td fontSize="12px">{item.timestamp}</Td>
                  <Td fontSize="12px">{item.verifiedBy}</Td>
                  <Td fontSize="12px" maxW="150px" lineHeight="1.4">
                    {item.remarks}
                  </Td>
                  <Td>{renderActionMenu()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      default:
        return null;
    }
  };

  const renderActionMenu = () => (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FiMoreVertical />}
        variant="ghost"
        size="sm"
        color="#98A2B3"
        border="1px solid #E4E7EC"
        borderRadius="md"
      />
      <MenuList>
        <MenuItem fontSize="13px" onClick={() => history.push("/admin/audit")}>
          Archive report
        </MenuItem>
      </MenuList>
    </Menu>
  );

  return (
    <AdminMainAreaWrapper>
      <Box
        mb={6}
        mt={6}
        as={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="24px" fontWeight="700" color="#101928">
            Tracking & Reporting
          </Text>
          <HStack spacing={3}>
            {activeTab === 2 ? (
              <Button
                variant="outline"
                borderColor="#660066"
                color="#660066"
                h="40px"
                fontSize="14px"
                fontWeight="500"
              >
                Create new filter
              </Button>
            ) : (
              <Button
                variant="outline"
                borderColor="#660066"
                color="#660066"
                h="40px"
                fontSize="14px"
                fontWeight="500"
                onClick={onOpen}
              >
                Schedule report
              </Button>
            )}
            <Button
              bg="#660066"
              color="white"
              _hover={{ bg: "#550055" }}
              h="40px"
              fontSize="14px"
              fontWeight="500"
            >
              Export Report
            </Button>
          </HStack>
        </Flex>

        <Box position="relative" mb="-1px" w="100%" overflow="hidden">
          <Tabs
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
            colorScheme="purple"
            isLazy
            variant="unstyled"
          >
            <Box position="relative">
              <TabList
                borderBottom="1px solid #E4E7EC"
                overflowX="auto"
                overflowY="hidden"
                whiteSpace="nowrap"
                pb="4px"
                sx={{
                  "&::-webkit-scrollbar": {
                    height: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#E4E7EC",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "#660066",
                  },
                }}
                _focus={{
                  boxShadow: "none",
                  outline: "none",
                }}
                _active={{
                  boxShadow: "none",
                  outline: "none",
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    _selected={{
                      color: "#660066",
                      borderBottom: "2px solid #660066",
                      fontWeight: "600",
                      bg: "purple.50",
                    }}
                    _hover={{
                      bg: "gray.50",
                    }}
                    borderBottom="2px solid transparent"
                    fontSize="13px"
                    fontWeight="500"
                    color="#344054"
                    px={4}
                    py={3}
                    mr={4}
                    borderRadius="md"
                    transition="all 0.3s ease"
                    flexShrink={0}
                  >
                    {tab}
                  </Tab>
                ))}
              </TabList>

              {/* Fade effect to indicate more tabs */}
              <Box
                position="absolute"
                right={0}
                top={0}
                bottom="4px"
                width="60px"
                background="linear-gradient(to right, transparent, white)"
                pointerEvents="none"
                zIndex={1}
              />
            </Box>

            <TabPanels mt={6}>
              {tabs.map((_, index) => (
                <TabPanel key={index} p={0}>
                  <SimpleGrid columns={5} spacing={4} mb={8}>
                    {renderStats()}
                  </SimpleGrid>

                  <Box
                    bg="white"
                    borderRadius="xl"
                    border="1px solid #E4E7EC"
                    overflow="hidden"
                    boxShadow="xs"
                  >
                    <Box p={4}>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <InputGroup w="300px">
                            <InputLeftElement pointerEvents="none">
                              <FiSearch color="#667085" />
                            </InputLeftElement>
                            <Input
                              placeholder="Search here..."
                              fontSize="14px"
                              borderRadius="md"
                            />
                          </InputGroup>
                          <Button
                            leftIcon={<FiFilter />}
                            variant="outline"
                            fontSize="14px"
                            fontWeight="500"
                            color="#344054"
                            borderRadius="md"
                          >
                            Filter
                          </Button>
                        </HStack>
                        <Button
                          leftIcon={<FiCalendar />}
                          rightIcon={
                            <FiChevronRight
                              style={{ transform: "rotate(90deg)" }}
                            />
                          }
                          variant="outline"
                          size="sm"
                          px={4}
                          fontWeight="500"
                          borderRadius="md"
                          color="#344054"
                        >
                          Select dates
                        </Button>
                      </Flex>
                    </Box>

                    <Box overflowX="auto">{renderTable()}</Box>

                    <Flex
                      justify="space-between"
                      align="center"
                      p={4}
                      borderTop="1px solid #F2F4F7"
                    >
                      <HStack>
                        <Text fontSize="13px" color="#344054">
                          Rows per page
                        </Text>
                        <Select
                          w="70px"
                          size="sm"
                          borderRadius="md"
                          defaultValue="08"
                        >
                          <option>08</option>
                        </Select>
                      </HStack>
                      <HStack spacing={4}>
                        <Text fontSize="13px" color="#344054">
                          Showing 10 out of 100 items
                        </Text>
                        <HStack spacing={1}>
                          <IconButton
                            icon={<FiChevronLeft />}
                            size="sm"
                            variant="ghost"
                            isDisabled
                            aria-label="Previous page"
                          />
                          <Text fontSize="13px" fontWeight="600">
                            1
                          </Text>
                          <IconButton
                            icon={<FiChevronRight />}
                            size="sm"
                            variant="ghost"
                            aria-label="Next page"
                          />
                        </HStack>
                      </HStack>
                    </Flex>
                  </Box>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export const TrackingReportingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <TrackingReportingPage {...props} />} />
  );
};

export default TrackingReportingPage;
