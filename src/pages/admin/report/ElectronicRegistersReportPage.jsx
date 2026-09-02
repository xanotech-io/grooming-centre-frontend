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
} from "react-icons/fi";
import { useHistory, Route } from "react-router-dom";
import { AdminMainAreaWrapper } from "../../../layouts";
import ScheduleReportModal from "./components/ScheduleReportModal";

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Box bg="white" p={4} borderRadius="xl" border="1px solid #F2F4F7">
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

const ElectronicRegistersReportPage = () => {
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const performanceFilterData = [
    {
      id: "FILT-001",
      name: "Top 10% Performers - Module 3",
      criteria: "Score ≥ 80%, Module 3",
      createdBy: "Instructor A",
      date: "26/11/2025",
      remark: "Displays top-performing students per module",
      status: "Active",
    },
    {
      id: "FILT-001",
      name: "At - Risk Students – Course ENG101",
      criteria: "Score < 50%, Attendance < 70%",
      createdBy: "Instructor A",
      date: "26/11/2025",
      remark: "Displays top-performing students per module",
      status: "Archived",
    },
    {
      id: "FILT-001",
      name: "Group Performance Summary – Semester 2",
      criteria: "All courses, Group B",
      createdBy: "Instructor A",
      date: "26/11/2025",
      remark: "Displays top-performing students per module",
      status: "Active",
    },
    {
      id: "FILT-001",
      name: "At - Risk Students – Course ENG101",
      criteria: "Score < 50%, Attendance < 70%",
      createdBy: "Instructor A",
      date: "26/11/2025",
      remark: "Displays top-performing students per module",
      status: "Inactive",
    },
    {
      id: "FILT-001",
      name: "Group Performance Summary – Semester 2",
      criteria: "Score ≥ 80%, Module 3",
      createdBy: "Instructor A",
      date: "26/11/2025",
      remark: "Displays top-performing students per module",
      status: "Archived",
    },
    {
      id: "FILT-001",
      name: "Top 10% Performers - Module 3",
      criteria: "All courses, Group B",
      createdBy: "Instructor A",
      date: "26/11/2025",
      remark: "Displays top-performing students per module",
      status: "Inactive",
    },
  ];

  const learningAcquisitionData = [
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      completion: "65%",
      element: "Data Analysis Techniques",
      level: "High",
      score: "65%",
      engagement: "Frequent",
      status: "Completed",
      remark: "Excellent grasp of advanced concepts",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      completion: "95%",
      element: "Data Analysis Techniques",
      level: "Medium",
      score: "95%",
      engagement: "Moderate",
      status: "On Track",
      remark: "Excellent grasp of advanced concepts",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      completion: "61%",
      element: "Data Analysis Techniques",
      level: "Low",
      score: "61%",
      engagement: "Moderate",
      status: "Completed",
      remark: "Excellent grasp of advanced concepts",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      completion: "85%",
      element: "Data Analysis Techniques",
      level: "Medium",
      score: "85%",
      engagement: "Frequent",
      status: "Needs Support",
      remark: "Excellent grasp of advanced concepts",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      completion: "52%",
      element: "Data Analysis Techniques",
      level: "Low",
      score: "52%",
      engagement: "Frequent",
      status: "On Track",
      remark: "Excellent grasp of advanced concepts",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      completion: "75%",
      element: "Data Analysis Techniques",
      level: "High",
      score: "75%",
      engagement: "Moderate",
      status: "Needs Support",
      remark: "Excellent grasp of advanced concepts",
    },
  ];

  const visualAnalyticsData = [
    {
      id: "STU-2045-011",
      course: "Data Analytics",
      metric: "65%",
      category: "Excellent",
      date: "26/11/2025",
      remark: "Outstanding performance across all assessments",
    },
    {
      id: "STU-2045-011",
      course: "Data Analytics",
      metric: "95%",
      category: "Average",
      date: "26/11/2025",
      remark: "Outstanding performance across all assessments",
    },
    {
      id: "STU-2045-011",
      course: "Data Analytics",
      metric: "61%",
      category: "Poor",
      date: "26/11/2025",
      remark: "Outstanding performance across all assessments",
    },
    {
      id: "STU-2045-011",
      course: "Data Analytics",
      metric: "85%",
      category: "Average",
      date: "26/11/2025",
      remark: "Outstanding performance across all assessments",
    },
    {
      id: "STU-2045-011",
      course: "Data Analytics",
      metric: "52%",
      category: "Excellent",
      date: "26/11/2025",
      remark: "Outstanding performance across all assessments",
    },
    {
      id: "STU-2045-011",
      course: "Data Analytics",
      metric: "75%",
      category: "Poor",
      date: "26/11/2025",
      remark: "Outstanding performance across all assessments",
    },
  ];

  const participationMonitoringData = [
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      score: "65%",
      activity: "Quiz / Forum",
      frequency: "22",
      date: "26/11/2025",
      status: "Active",
      alert: "No",
      remark: "Excellent participation and consistent engagement",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      score: "95%",
      activity: "Quiz / Forum",
      frequency: "32",
      date: "26/11/2025",
      status: "Irregular",
      alert: "Yes",
      remark: "Excellent participation and consistent engagement",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      score: "61%",
      activity: "Quiz / Forum",
      frequency: "23",
      date: "26/11/2025",
      status: "Active",
      alert: "Yes",
      remark: "Excellent participation and consistent engagement",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      score: "85%",
      activity: "Quiz / Forum",
      frequency: "37",
      date: "26/11/2025",
      status: "Inactive",
      alert: "No",
      remark: "Excellent participation and consistent engagement",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      score: "52%",
      activity: "Quiz / Forum",
      frequency: "74",
      date: "26/11/2025",
      status: "Irregular",
      alert: "Yes",
      remark: "Excellent participation and consistent engagement",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      score: "75%",
      activity: "Quiz / Forum",
      frequency: "13",
      date: "26/11/2025",
      status: "Inactive",
      alert: "No",
      remark: "Excellent participation and consistent engagement",
    },
  ];

  const performanceAssessmentData = [
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      type: "Examination",
      score: "65%",
      attendance: "65%",
      category: "Excellent",
      instructor: "Mrs. T. Bello",
      semester: "2024/25",
      status: "Completed",
      remark: "Needs improvement in written analysis",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      type: "Assignment",
      score: "95%",
      attendance: "95%",
      category: "Good",
      instructor: "Mrs. T. Bello",
      semester: "2024/25",
      status: "Completed",
      remark: "Needs improvement in written analysis",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      type: "Group Project",
      score: "61%",
      attendance: "61%",
      category: "Average",
      instructor: "Mrs. T. Bello",
      semester: "2024/25",
      status: "Completed",
      remark: "Needs improvement in written analysis",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      type: "Test",
      score: "85%",
      attendance: "85%",
      category: "Good",
      instructor: "Mrs. T. Bello",
      semester: "2024/25",
      status: "Completed",
      remark: "Needs improvement in written analysis",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      type: "Assignment",
      score: "52%",
      attendance: "52%",
      category: "Poor",
      instructor: "Mrs. T. Bello",
      semester: "2024/25",
      status: "Completed",
      remark: "Needs improvement in written analysis",
    },
    {
      id: "STU-1023-004",
      course: "Data Privacy",
      type: "Examination",
      score: "75%",
      attendance: "75%",
      category: "Excellent",
      instructor: "Mrs. T. Bello",
      semester: "2024/25",
      status: "Completed",
      remark: "Needs improvement in written analysis",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return { bg: "#ECFDF3", color: "#027A48" };
      case "Archived":
        return { bg: "#FFFAEB", color: "#B54708" };
      case "Inactive":
        return { bg: "#FEF3F2", color: "#B42318" };
      case "Completed":
        return { bg: "#ECFDF3", color: "#027A48" };
      case "On Track":
        return { bg: "#FFFAEB", color: "#B54708" };
      case "Needs Support":
        return { bg: "#FEF3F2", color: "#B42318" };
      case "Irregular":
        return { bg: "#FFFAEB", color: "#B54708" };
      default:
        return { bg: "#F2F4F7", color: "#344054" };
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box mb={6} mt={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="24px" fontWeight="700" color="#101928">
            Electronic Registers
          </Text>
          <HStack spacing={3}>
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

        <Tabs colorScheme="purple" isLazy variant="unstyled">
          <TabList
            borderBottom="1px solid #E4E7EC"
            overflowX="auto"
            whiteSpace="nowrap"
            sx={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
              "-ms-overflow-style": "none",
              "scrollbar-width": "none",
            }}
          >
            <Tab
              _selected={{
                color: "#660066",
                borderBottom: "2px solid #660066",
                fontWeight: "600",
              }}
              borderBottom="2px solid transparent"
              fontSize="13px"
              fontWeight="500"
              color="#344054"
              px={1}
              py={3}
              mr={6}
              mb="-1px"
              transition="all 0.2s"
            >
              Student Performance Filter & Analysis
            </Tab>
            <Tab
              _selected={{
                color: "#660066",
                borderBottom: "2px solid #660066",
                fontWeight: "600",
              }}
              borderBottom="2px solid transparent"
              fontSize="13px"
              fontWeight="500"
              color="#344054"
              px={1}
              py={3}
              mr={6}
              mb="-1px"
              transition="all 0.2s"
            >
              Student Process & Learning Acquisition Report
            </Tab>
            <Tab
              _selected={{
                color: "#660066",
                borderBottom: "2px solid #660066",
                fontWeight: "600",
              }}
              borderBottom="2px solid transparent"
              fontSize="13px"
              fontWeight="500"
              color="#344054"
              px={1}
              py={3}
              mr={6}
              mb="-1px"
              transition="all 0.2s"
            >
              Visual Performance Analytics Report
            </Tab>
            <Tab
              _selected={{
                color: "#660066",
                borderBottom: "2px solid #660066",
                fontWeight: "600",
              }}
              borderBottom="2px solid transparent"
              fontSize="13px"
              fontWeight="500"
              color="#344054"
              px={1}
              py={3}
              mr={6}
              mb="-1px"
              transition="all 0.2s"
            >
              Student Participation Monitoring Report
            </Tab>
            <Tab
              _selected={{
                color: "#660066",
                borderBottom: "2px solid #660066",
                fontWeight: "600",
              }}
              borderBottom="2px solid transparent"
              fontSize="13px"
              fontWeight="500"
              color="#344054"
              px={1}
              py={3}
              mr={6}
              mb="-1px"
              transition="all 0.2s"
            >
              Student Performance & Assessment Report
            </Tab>
          </TabList>

          <TabPanels mt={6}>
            {/* Tab 1: Student Performance Filter & Analysis */}
            <TabPanel p={0}>
              <SimpleGrid columns={5} spacing={4} mb={8}>
                <SummaryCard
                  title="Average Performance"
                  value="80%"
                  subtext="Per filter"
                />
                <SummaryCard
                  title="Active Filter"
                  value="70%"
                  subtext="+5% vs last month"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Instructor Engagement"
                  value="93%"
                  subtext="per role"
                />
                <SummaryCard
                  title="Report Accuracy"
                  value="80%"
                  subtext="logins/week"
                />
                <SummaryCard
                  title="Progress Trend"
                  value="+5%"
                  subtext=""
                  subtextColor="#12B76A"
                />
              </SimpleGrid>

              <Box
                bg="white"
                borderRadius="xl"
                border="1px solid #F2F4F7"
                overflow="hidden"
              >
                <Box p={4}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <InputGroup w="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="#667085" />
                        </InputLeftElement>
                        <Input placeholder="Search here..." fontSize="14px" />
                      </InputGroup>
                      <Button
                        leftIcon={<FiFilter />}
                        variant="outline"
                        fontSize="14px"
                        fontWeight="500"
                        color="#344054"
                      >
                        Filter
                      </Button>
                    </HStack>
                  </Flex>
                </Box>

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
                        py={4}
                      >
                        Filter ID
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Filter Name
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Criteria Applied
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Created by
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Date Created
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Remark
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Status
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {performanceFilterData.map((item, index) => (
                      <Tr key={index}>
                        <Td px={6} py={4}>
                          <Checkbox colorScheme="purple" />
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#101928"
                          fontWeight="500"
                          py={4}
                        >
                          {item.id}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.name}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.criteria}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.createdBy}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.date}
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#475367"
                          py={4}
                          maxW="150px"
                          lineHeight="1.4"
                        >
                          {item.remark}
                        </Td>
                        <Td py={4}>
                          <Badge
                            bg={getStatusColor(item.status).bg}
                            color={getStatusColor(item.status).color}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="11px"
                            textTransform="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </Td>
                        <Td py={4}>
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
                              <MenuItem fontSize="13px">View Details</MenuItem>
                              <MenuItem fontSize="13px">Edit</MenuItem>
                              <MenuItem
                                fontSize="13px"
                                onClick={() => history.push("/admin/audit")}
                              >
                                Archive report
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

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
                    <Select w="70px" size="sm" borderRadius="md">
                      <option>08</option>
                    </Select>
                  </HStack>
                  <HStack spacing={4}>
                    <Text fontSize="13px" color="#344054">
                      Showing 10 out of 100 items
                    </Text>
                    <HStack>
                      <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        isDisabled
                      />
                      <Text fontSize="13px" fontWeight="600">
                        1
                      </Text>
                      <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        variant="ghost"
                      />
                    </HStack>
                  </HStack>
                </Flex>
              </Box>
            </TabPanel>

            {/* Tab 2: Student Process & Learning Acquisition Report */}
            <TabPanel p={0}>
              <SimpleGrid columns={5} spacing={4} mb={8}>
                <SummaryCard
                  title="Average Learning Acquisition"
                  value="80%"
                  subtext="Per filter"
                />
                <SummaryCard
                  title="Course Completion"
                  value="70%"
                  subtext="+5% vs last month"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Assessment Success"
                  value="93%"
                  subtext="+5% vs last month"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Learner Engagement"
                  value="4.2"
                  subtext="per week"
                />
                <SummaryCard
                  title="Achieving Mastery"
                  value="+5%"
                  subtext=""
                  subtextColor="#12B76A"
                />
              </SimpleGrid>

              <Box
                bg="white"
                borderRadius="xl"
                border="1px solid #F2F4F7"
                overflow="hidden"
              >
                <Box p={4}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <InputGroup w="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="#667085" />
                        </InputLeftElement>
                        <Input placeholder="Search here..." fontSize="14px" />
                      </InputGroup>
                      <Button
                        leftIcon={<FiFilter />}
                        variant="outline"
                        fontSize="14px"
                        fontWeight="500"
                        color="#344054"
                      >
                        Filter
                      </Button>
                    </HStack>
                  </Flex>
                </Box>

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
                        py={4}
                      >
                        Student ID
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Course
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Completion Rate (%)
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Learning Element
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Acquisition Level
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Average Score (%)
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Engagement
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Status
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Remark
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {learningAcquisitionData.map((item, index) => (
                      <Tr key={index}>
                        <Td px={6} py={4}>
                          <Checkbox colorScheme="purple" />
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.id}
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#101928"
                          fontWeight="500"
                          py={4}
                        >
                          {item.course}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.completion}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.element}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.level}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.score}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.engagement}
                        </Td>
                        <Td py={4}>
                          <Badge
                            bg={getStatusColor(item.status).bg}
                            color={getStatusColor(item.status).color}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="11px"
                            textTransform="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#475367"
                          py={4}
                          maxW="150px"
                          lineHeight="1.4"
                        >
                          {item.remark}
                        </Td>
                        <Td py={4}>
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
                              <MenuItem
                                fontSize="13px"
                                onClick={() => history.push("/admin/audit")}
                              >
                                Archive report
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

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
                    <Select w="70px" size="sm" borderRadius="md">
                      <option>08</option>
                    </Select>
                  </HStack>
                  <HStack spacing={4}>
                    <Text fontSize="13px" color="#344054">
                      Showing 10 out of 100 items
                    </Text>
                    <HStack>
                      <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        isDisabled
                      />
                      <Text fontSize="13px" fontWeight="600">
                        1
                      </Text>
                      <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        variant="ghost"
                      />
                    </HStack>
                  </HStack>
                </Flex>
              </Box>
            </TabPanel>

            {/* Tab 3: Visual Performance Analytics Report */}
            <TabPanel p={0}>
              <SimpleGrid columns={5} spacing={4} mb={8}>
                <SummaryCard
                  title="Average Performance"
                  value="80%"
                  subtext="Per filter"
                />
                <SummaryCard
                  title="Active Filter"
                  value="70%"
                  subtext="+5% vs last month"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Instructor Engagement"
                  value="93%"
                  subtext="per role"
                />
                <SummaryCard
                  title="Report Accuracy"
                  value="80%"
                  subtext="logins/week"
                />
                <SummaryCard
                  title="Progress Trend"
                  value="+5%"
                  subtext=""
                  subtextColor="#12B76A"
                />
              </SimpleGrid>

              <Box
                bg="white"
                borderRadius="xl"
                border="1px solid #F2F4F7"
                overflow="hidden"
              >
                <Box p={4}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <InputGroup w="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="#667085" />
                        </InputLeftElement>
                        <Input placeholder="Search here..." fontSize="14px" />
                      </InputGroup>
                      <Button
                        leftIcon={<FiFilter />}
                        variant="outline"
                        fontSize="14px"
                        fontWeight="500"
                        color="#344054"
                      >
                        Filter
                      </Button>
                    </HStack>
                  </Flex>
                </Box>

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
                        py={4}
                      >
                        Student ID
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Course
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Performance Metric (%)
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Achievement Category
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Date Created
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Remark
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {visualAnalyticsData.map((item, index) => (
                      <Tr key={index}>
                        <Td px={6} py={4}>
                          <Checkbox colorScheme="purple" />
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.id}
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#101928"
                          fontWeight="500"
                          py={4}
                        >
                          {item.course}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.metric}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.category}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.date}
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#475367"
                          py={4}
                          maxW="150px"
                          lineHeight="1.4"
                        >
                          {item.remark}
                        </Td>
                        <Td py={4}>
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
                              <MenuItem
                                fontSize="13px"
                                onClick={() => history.push("/admin/audit")}
                              >
                                Archive report
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Flex
                  justify="space-between"
                  align="center"
                  p={4}
                  borderTop="1px solid #F2F4F7"
                >
                  <HStack spacing={2}>
                    <Text fontSize="13px" color="#344054">
                      Rows per page
                    </Text>
                    <Select w="70px" size="sm" borderRadius="md">
                      <option>08</option>
                    </Select>
                  </HStack>
                  <HStack spacing={4}>
                    <Text fontSize="13px" color="#344054">
                      Showing 10 out of 100 items
                    </Text>
                    <HStack>
                      <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        isDisabled
                      />
                      <Text fontSize="13px" fontWeight="600">
                        1
                      </Text>
                      <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        variant="ghost"
                      />
                    </HStack>
                  </HStack>
                </Flex>
              </Box>
            </TabPanel>

            {/* Tab 4: Student Participation Monitoring Report */}
            <TabPanel p={0}>
              <SimpleGrid columns={5} spacing={4} mb={8}>
                <SummaryCard
                  title="Average Student Participation"
                  value="80%"
                  subtext="+5% vs last month"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Inactive Students"
                  value="20"
                  subtext="per course"
                />
                <SummaryCard
                  title="Automated Alerts"
                  value="5"
                  subtext="+5% vs last month"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Engagement Improvement"
                  value="+5%"
                  subtext="per week"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Average Instructor Response"
                  value="2h 30mins"
                  subtext=""
                />
              </SimpleGrid>

              <Box
                bg="white"
                borderRadius="xl"
                border="1px solid #F2F4F7"
                overflow="hidden"
              >
                <Box p={4}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <InputGroup w="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="#667085" />
                        </InputLeftElement>
                        <Input placeholder="Search here..." fontSize="14px" />
                      </InputGroup>
                      <Button
                        leftIcon={<FiFilter />}
                        variant="outline"
                        fontSize="14px"
                        fontWeight="500"
                        color="#344054"
                      >
                        Filter
                      </Button>
                    </HStack>
                  </Flex>
                </Box>

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
                        py={4}
                      >
                        Student ID
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Course
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Participation Score (%)
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Activity Type
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Frequency of Access
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Last Active Date
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Status
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Automated Alert
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Remark
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {participationMonitoringData.map((item, index) => (
                      <Tr key={index}>
                        <Td px={6} py={4}>
                          <Checkbox colorScheme="purple" />
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.id}
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#101928"
                          fontWeight="500"
                          py={4}
                        >
                          {item.course}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.score}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.activity}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.frequency}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.date}
                        </Td>
                        <Td py={4}>
                          <Badge
                            bg={getStatusColor(item.status).bg}
                            color={getStatusColor(item.status).color}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="11px"
                            textTransform="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.alert}
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#475367"
                          py={4}
                          maxW="150px"
                          lineHeight="1.4"
                        >
                          {item.remark}
                        </Td>
                        <Td py={4}>
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
                              <MenuItem
                                fontSize="13px"
                                onClick={() => history.push("/admin/audit")}
                              >
                                Archive report
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Flex
                  justify="space-between"
                  align="center"
                  p={4}
                  borderTop="1px solid #F2F4F7"
                >
                  <HStack spacing={2}>
                    <Text fontSize="13px" color="#344054">
                      Rows per page
                    </Text>
                    <Select w="70px" size="sm" borderRadius="md">
                      <option>08</option>
                    </Select>
                  </HStack>
                  <HStack spacing={4}>
                    <Text fontSize="13px" color="#344054">
                      Showing 10 out of 100 items
                    </Text>
                    <HStack>
                      <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        isDisabled
                      />
                      <Text fontSize="13px" fontWeight="600">
                        1
                      </Text>
                      <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        variant="ghost"
                      />
                    </HStack>
                  </HStack>
                </Flex>
              </Box>
            </TabPanel>

            {/* Tab 5: Student Performance & Assessment Report */}
            <TabPanel p={0}>
              <SimpleGrid columns={5} spacing={4} mb={8}>
                <SummaryCard
                  title="Average Student Participation"
                  value="80%"
                  subtext="per course"
                />
                <SummaryCard
                  title="Attendance-to-Performance"
                  value="1.5"
                  subtext="per course"
                />
                <SummaryCard
                  title="Low Performing Students"
                  value="5"
                  subtext="-5% vs last month"
                  subtextColor="#F04438"
                />
                <SummaryCard
                  title="Improvement Rate"
                  value="+5%"
                  subtext="per remedial intervention"
                  subtextColor="#12B76A"
                />
                <SummaryCard
                  title="Assessment Completion"
                  value="95%"
                  subtext=""
                />
              </SimpleGrid>

              <Box
                bg="white"
                borderRadius="xl"
                border="1px solid #F2F4F7"
                overflow="hidden"
              >
                <Box p={4}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <InputGroup w="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="#667085" />
                        </InputLeftElement>
                        <Input placeholder="Search here..." fontSize="14px" />
                      </InputGroup>
                      <Button
                        leftIcon={<FiFilter />}
                        variant="outline"
                        fontSize="14px"
                        fontWeight="500"
                        color="#344054"
                      >
                        Filter
                      </Button>
                    </HStack>
                  </Flex>
                </Box>

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
                        py={4}
                      >
                        Student ID
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Course
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Assessment Type
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Score (%)
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Attendance Rate (%)
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Performance Category
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Instructor
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Semester
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Status
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Remark
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        py={4}
                      >
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {performanceAssessmentData.map((item, index) => (
                      <Tr key={index}>
                        <Td px={6} py={4}>
                          <Checkbox colorScheme="purple" />
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.id}
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#101928"
                          fontWeight="500"
                          py={4}
                        >
                          {item.course}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.type}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.score}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.attendance}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.category}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.instructor}
                        </Td>
                        <Td fontSize="13px" color="#475367" py={4}>
                          {item.semester}
                        </Td>
                        <Td py={4}>
                          <Badge
                            bg={getStatusColor(item.status).bg}
                            color={getStatusColor(item.status).color}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="11px"
                            textTransform="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </Td>
                        <Td
                          fontSize="13px"
                          color="#475367"
                          py={4}
                          maxW="150px"
                          lineHeight="1.4"
                        >
                          {item.remark}
                        </Td>
                        <Td py={4}>
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
                              <MenuItem
                                fontSize="13px"
                                onClick={() => history.push("/admin/audit")}
                              >
                                Archive report
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Flex
                  justify="space-between"
                  align="center"
                  p={4}
                  borderTop="1px solid #F2F4F7"
                >
                  <HStack spacing={2}>
                    <Text fontSize="13px" color="#344054">
                      Rows per page
                    </Text>
                    <Select w="70px" size="sm" borderRadius="md">
                      <option>08</option>
                    </Select>
                  </HStack>
                  <HStack spacing={4}>
                    <Text fontSize="13px" color="#344054">
                      Showing 10 out of 100 items
                    </Text>
                    <HStack>
                      <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        isDisabled
                      />
                      <Text fontSize="13px" fontWeight="600">
                        1
                      </Text>
                      <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        variant="ghost"
                      />
                    </HStack>
                  </HStack>
                </Flex>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export const ElectronicRegistersReportPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ElectronicRegistersReportPage {...props} />}
    />
  );
};

export default ElectronicRegistersReportPage;
