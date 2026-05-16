import { useCallback, useEffect, useState } from "react";
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
  Input as ChakraInput,
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
  Grid,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Route } from "react-router-dom";
import {
  adminListMISReports,
  adminGetMISKPIs,
  adminGenerateMISReport,
  adminArchiveMISReport,
  adminDeleteMISReport,
} from "../../../services";
import { AdminMainAreaWrapper } from "../../../layouts";
import { motion } from "framer-motion";
import ScheduleReportModal from "./components/ScheduleReportModal";
import { Bar, Doughnut } from "react-chartjs-2";

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Box
    bg="white"
    p={6}
    borderRadius="xl"
    border="1px solid #F2F4F7"
    boxShadow="sm"
  >
    <Text fontSize="15px" fontWeight="500" color="#101928" mb={2}>
      {title}
    </Text>
    <Text fontSize="28px" fontWeight="700" color="#101928" mb={1}>
      {value}
    </Text>
    <Text fontSize="14px" fontWeight="500" color={subtextColor || "#12B76A"}>
      {subtext}
    </Text>
  </Box>
);

const MISReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const {
    isOpen: isGenerateOpen,
    onOpen: onGenerateOpen,
    onClose: onGenerateClose,
  } = useDisclosure();

  // Overview tab data state
  const [reports, setReports] = useState([]);
  const [summary] = useState({
    totalReports: "—",
    automatedReports: "—",
    averageCreationTime: "—",
    reportAccuracy: "—",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [overviewSearch, setOverviewSearch] = useState("");
  const [overviewCategory, setOverviewCategory] = useState("");
  const [kpis, setKpis] = useState({
    systemUsageRate: "—",
    reportAccuracyRate: "—",
    automationRate: "—",
    avgReportGenerationTimeMs: "—",
  });
  const [generateForm, setGenerateForm] = useState({
    reportCategory: "academic",
    reportName: "",
    reportFormat: "json",
    frequency: "on_demand",
  });
  const [generating, setGenerating] = useState(false);

  const fetchReports = useCallback(
    async (filters = {}) => {
      setReportsLoading(true);
      try {
        const params = {};
        const search = filters.search ?? overviewSearch;
        const category = filters.category ?? overviewCategory;
        const statusFilter = filters.status ?? "";
        if (category) params.category = category.toLowerCase();
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;
        params.page = 1;
        params.limit = 10;
        const result = await adminListMISReports(params);
        setReports(result.reports);
        setPagination(result.pagination);
      } catch {
        setReports([]);
      } finally {
        setReportsLoading(false);
      }
    },
    [overviewSearch, overviewCategory],
  );

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    adminGetMISKPIs()
      .then(({ kpis: data }) => setKpis(data))
      .catch(() => {});
  }, []);

  const handleArchive = async (reportId) => {
    try {
      const { message } = await adminArchiveMISReport(reportId);
      toast({
        description: message || "Report archived.",
        status: "success",
        position: "top",
      });
      fetchReports();
    } catch (err) {
      toast({
        description: err?.response?.data?.message || "Failed to archive.",
        status: "error",
        position: "top",
      });
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const { message } = await adminDeleteMISReport(reportId);
      toast({
        description: message || "Report deleted.",
        status: "success",
        position: "top",
      });
      fetchReports();
    } catch (err) {
      toast({
        description: err?.response?.data?.message || "Failed to delete.",
        status: "error",
        position: "top",
      });
    }
  };

  const handleGenerate = async () => {
    if (!generateForm.reportName.trim()) {
      toast({
        description: "Report name is required.",
        status: "warning",
        position: "top",
      });
      return;
    }
    setGenerating(true);
    try {
      const { message } = await adminGenerateMISReport({
        reportCategory: generateForm.reportCategory,
        reportName: generateForm.reportName,
        reportFormat: generateForm.reportFormat,
        frequency: generateForm.frequency,
      });
      toast({
        description: message || "Report generated successfully.",
        status: "success",
        position: "top",
      });
      onGenerateClose();
      fetchReports();
    } catch (err) {
      toast({
        description:
          err?.response?.data?.message || "Failed to generate report.",
        status: "error",
        position: "top",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setOverviewSearch(val);
    fetchReports({ search: val, category: overviewCategory });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setOverviewCategory(val);
    fetchReports({ search: overviewSearch, category: val });
  };

  const tabs = [
    "Overview",
    "Academic",
    "Administrative",
    "Compliance",
    "Attendance",
    "Performance",
  ];

  const academicData = [
    {
      course: "Data Analytics",
      department: "Science",
      enrolled: 500,
      completion: "70%",
      status: "High",
    },
    {
      course: "Data Analytics",
      department: "Business Admin",
      enrolled: 500,
      completion: "20%",
      status: "Low",
    },
    {
      course: "Data Analytics",
      department: "Computer Science",
      enrolled: 500,
      completion: "70%",
      status: "High",
    },
    {
      course: "Data Analytics",
      department: "Science",
      enrolled: 500,
      completion: "15%",
      status: "Low",
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { bg: "#ECFDF3", color: "#027A48" };
      case "archived":
        return { bg: "#FEF3F2", color: "#B42318" };
      case "draft":
        return { bg: "#FFFAEB", color: "#B54708" };
      case "high":
        return { bg: "#ECFDF3", color: "#027A48" };
      case "low":
        return { bg: "#FEF3F2", color: "#B42318" };
      default:
        return { bg: "#F2F4F7", color: "#344054" };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { borderDash: [5, 5] },
        ticks: { stepSize: 20 },
      },
    },
  };

  const barData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Course Completion",
        data: [60, 30, 75, 50, 60, 52, 50],
        backgroundColor: "#D94111",
        borderRadius: 4,
      },
    ],
  };

  const doughnutData = {
    labels: ["Computer Science", "Art"],
    datasets: [
      {
        data: [80, 15],
        backgroundColor: ["#CC0C0C", "#F97316"],
        borderWidth: 0,
      },
    ],
  };

  const renderOverview = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard
          title="Total Report"
          value={String(summary.totalReports)}
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Automated Report"
          value={String(summary.automatedReports)}
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Average Creation Time"
          value={
            kpis.avgReportGenerationTimeMs
              ? kpis.avgReportGenerationTimeMs + "ms"
              : "—"
          }
        />
        <SummaryCard
          title="Report Accuracy"
          value={kpis.reportAccuracyRate ? kpis.reportAccuracyRate + "%" : "—"}
          subtext="+5% vs last month"
        />
      </SimpleGrid>

      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid #E4E7EC"
        overflow="hidden"
        boxShadow="xs"
      >
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="#667085" />
                </InputLeftElement>
                <ChakraInput
                  placeholder="Search here..."
                  fontSize="14px"
                  borderRadius="md"
                  value={overviewSearch}
                  onChange={handleSearchChange}
                />
              </InputGroup>
              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                size="sm"
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                borderRadius="md"
              >
                Filter
              </Button>
            </HStack>
            <HStack spacing={3}>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Department"
                value={overviewCategory}
                onChange={handleCategoryChange}
              >
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Compliance">Compliance</option>
              </Select>
              <Select
                w="120px"
                size="sm"
                borderRadius="md"
                placeholder="Status"
                onChange={(e) =>
                  fetchReports({
                    status: e.target.value,
                    search: overviewSearch,
                    category: overviewCategory,
                  })
                }
              >
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
                <option value="archived">Archived</option>
              </Select>
              <Select
                w="120px"
                size="sm"
                borderRadius="md"
                placeholder="Region"
              >
                <option>Lagos</option>
              </Select>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Date Range"
              >
                <option>This Month</option>
              </Select>
            </HStack>
          </Flex>
        </Box>

        <Box overflowX="auto">
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
                  Category
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Report Name
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Generated By
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
                  Format
                </Th>
                <Th
                  textTransform="none"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475367"
                >
                  Frequency
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
                  Remark
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
              {reportsLoading ? (
                <Tr>
                  <Td
                    colSpan={11}
                    textAlign="center"
                    py={10}
                    fontSize="13px"
                    color="#667085"
                  >
                    Loading reports...
                  </Td>
                </Tr>
              ) : reports.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={11}
                    textAlign="center"
                    py={10}
                    fontSize="13px"
                    color="#667085"
                  >
                    No reports found.
                  </Td>
                </Tr>
              ) : (
                reports.map((item, idx) => (
                  <Tr key={idx}>
                    <Td px={6} py={6}>
                      <Checkbox colorScheme="purple" />
                    </Td>
                    <Td fontSize="12px" color="#667085">
                      {item.id}
                    </Td>
                    <Td fontSize="12px" color="#101928" fontWeight="500">
                      {item.category}
                    </Td>
                    <Td
                      fontSize="12px"
                      color="#101928"
                      fontWeight="500"
                      maxW="200px"
                    >
                      {item.name}
                    </Td>
                    <Td fontSize="12px" color="#667085">
                      {item.generatedBy}
                    </Td>
                    <Td fontSize="12px" color="#667085">
                      {item.dateTime}
                    </Td>
                    <Td fontSize="12px" color="#667085">
                      {item.format}
                    </Td>
                    <Td fontSize="12px" color="#667085">
                      {item.frequency}
                    </Td>
                    <Td>
                      <Badge
                        bg={getStatusColor(item.status).bg}
                        color={getStatusColor(item.status).color}
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="11px"
                        fontWeight="500"
                      >
                        {item.status}
                      </Badge>
                    </Td>
                    <Td fontSize="12px" color="#667085" maxW="150px">
                      {item.remark}
                    </Td>
                    <Td>
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
                            onClick={() => handleArchive(item.id)}
                          >
                            Archive report
                          </MenuItem>
                          <MenuItem
                            fontSize="13px"
                            color="red.500"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete report
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

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
            <Select w="70px" size="sm" borderRadius="md" defaultValue="08">
              <option>08</option>
            </Select>
          </HStack>
          <HStack spacing={4}>
            <Text fontSize="13px" color="#344054">
              {`Showing ${reports.length} out of ${pagination.totalItems} items`}
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
                {pagination.currentPage}
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
    </>
  );

  const renderAcademic = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard
          title="Total Courses"
          value="100"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Course Enrollment"
          value="42m 3"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Course Completion Rate"
          value="83%"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Average Assessment Score"
          value="80%"
          subtext="+5% vs last month"
        />
      </SimpleGrid>

      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard
          title="Certificate Issued"
          value="100"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Exam Attempt"
          value="42m 3"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Exam Pass Rate"
          value="83%"
          subtext="+5% vs last month"
        />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            Course Completion
          </Text>
          <Box h="300px">
            <Bar data={barData} options={chartOptions} />
          </Box>
        </Box>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            Subject Enrollment
          </Text>
          <Box
            h="250px"
            position="relative"
            display="flex"
            justifyContent="center"
          >
            <Doughnut
              data={doughnutData}
              options={{ maintainAspectRatio: false, cutout: "70%" }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              textAlign="center"
            >
              <Text fontSize="24px" fontWeight="700" color="#101928">
                2.1K
              </Text>
              <Text fontSize="12px" color="#667085">
                Enrollment
              </Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full" />
                <Text fontSize="12px">Computer Science</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                80%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#F97316" borderRadius="full" />
                <Text fontSize="12px">Art</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                15%
              </Text>
            </Flex>
          </VStack>
        </Box>
      </Grid>

      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid #E4E7EC"
        overflow="hidden"
        boxShadow="xs"
      >
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>
            Course Enrollment
          </Text>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="#667085" />
                </InputLeftElement>
                <ChakraInput
                  placeholder="Search here..."
                  fontSize="14px"
                  borderRadius="md"
                />
              </InputGroup>
              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                size="sm"
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                borderRadius="md"
              >
                Filter
              </Button>
            </HStack>
            <HStack spacing={3}>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Department"
              >
                <option>Science</option>
              </Select>
              <Select
                w="120px"
                size="sm"
                borderRadius="md"
                placeholder="Region"
              >
                <option>Lagos</option>
              </Select>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Date Range"
              >
                <option>Last 30 Days</option>
              </Select>
            </HStack>
          </Flex>
        </Box>
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th px={6} py={4}>
                <Checkbox colorScheme="purple" />
              </Th>
              <Th textTransform="none">Course</Th>
              <Th textTransform="none">Department</Th>
              <Th textTransform="none">Enrolled</Th>
              <Th textTransform="none">Completion (%)</Th>
              <Th textTransform="none">Completion Status</Th>
              <Th textTransform="none">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {academicData.map((item, idx) => (
              <Tr key={idx}>
                <Td px={6} py={6}>
                  <Checkbox colorScheme="purple" />
                </Td>
                <Td fontSize="12px">{item.course}</Td>
                <Td fontSize="12px">{item.department}</Td>
                <Td fontSize="12px">{item.enrolled}</Td>
                <Td fontSize="12px">{item.completion}</Td>
                <Td>
                  <Badge
                    bg={getStatusColor(item.status).bg}
                    color={getStatusColor(item.status).color}
                    borderRadius="full"
                    px={4}
                    py={1}
                    fontSize="11px"
                  >
                    {item.status}
                  </Badge>
                </Td>
                <Td>
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
                      <MenuItem fontSize="13px">Archive report</MenuItem>
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
            <Select w="70px" size="sm" borderRadius="md" defaultValue="08">
              <option>08</option>
            </Select>
          </HStack>
          <HStack spacing={4}>
            <Text fontSize="13px" color="#344054">
              Showing 10 out of 100 items
            </Text>
            <IconButton
              icon={<FiChevronLeft />}
              size="sm"
              variant="ghost"
              isDisabled
            />
            <Text fontSize="13px" fontWeight="600">
              1
            </Text>
            <IconButton icon={<FiChevronRight />} size="sm" variant="ghost" />
          </HStack>
        </Flex>
      </Box>
    </>
  );

  const renderAdministrative = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard
          title="Total Registered Users"
          value="1000"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Approved Users"
          value="840"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Instructor Account"
          value="104"
          subtext="+5% vs last month"
        />
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #F2F4F7"
          boxShadow="sm"
        >
          <Text fontSize="15px" fontWeight="500" color="#101928" mb={2}>
            System Uptime
          </Text>
          <Text fontSize="28px" fontWeight="700" color="#12B76A" mb={1}>
            Active
          </Text>
        </Box>
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            System Usage Rate
          </Text>
          <Box h="300px">
            <Bar
              data={{
                ...barData,
                datasets: [
                  { ...barData.datasets[0], backgroundColor: "#D94111" },
                ],
              }}
              options={chartOptions}
            />
          </Box>
        </Box>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            User Account Status
          </Text>
          <Box
            h="250px"
            position="relative"
            display="flex"
            justifyContent="center"
          >
            <Doughnut
              data={{
                labels: ["Active", "Pending", "Suspended"],
                datasets: [
                  {
                    data: [80, 25, 5],
                    backgroundColor: ["#00A143", "#F97316", "#CC0C0C"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{ maintainAspectRatio: false, cutout: "70%" }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              textAlign="center"
            >
              <Text fontSize="24px" fontWeight="700" color="#101928">
                2.1K
              </Text>
              <Text fontSize="12px" color="#667085">
                Total Account
              </Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#00A143" borderRadius="full" />
                <Text fontSize="12px">Active</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                80%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#F97316" borderRadius="full" />
                <Text fontSize="12px">Pending</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                25%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full" />
                <Text fontSize="12px">Suspended</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                5%
              </Text>
            </Flex>
          </VStack>
        </Box>
      </Grid>
      {/* Reuse Course Enrollment Table or Similar UI */}
      {academicData.length > 0 && renderAcademic().props.children[3]}
    </>
  );

  const renderCompliance = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard
          title="Overall Compliance"
          value="85%"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Average Department Rate"
          value="84%"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Examination Submission"
          value="104"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Overdue Courses"
          value="12"
          subtext="+5% vs last month"
        />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            Compliance by Department
          </Text>
          <Box h="300px">
            <Bar
              data={{
                labels: [
                  "Sales",
                  "Finance",
                  "HR",
                  "Legal",
                  "Dept",
                  "Dept",
                  "Dept",
                ],
                datasets: [
                  {
                    label: "Compliance",
                    data: [60, 30, 75, 50, 60, 52, 50],
                    backgroundColor: "#D94111",
                    borderRadius: 4,
                  },
                ],
              }}
              options={chartOptions}
            />
          </Box>
        </Box>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            Compliance Course Status
          </Text>
          <Box
            h="250px"
            position="relative"
            display="flex"
            justifyContent="center"
          >
            <Doughnut
              data={{
                labels: ["Completed", "In-progress", "Overdue"],
                datasets: [
                  {
                    data: [80, 25, 5],
                    backgroundColor: ["#00A143", "#F97316", "#CC0C0C"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{ maintainAspectRatio: false, cutout: "70%" }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              textAlign="center"
            >
              <Text fontSize="24px" fontWeight="700" color="#101928">
                2.1K
              </Text>
              <Text fontSize="12px" color="#667085">
                Enrollment
              </Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#00A143" borderRadius="full" />
                <Text fontSize="12px">Completed</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                80%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#F97316" borderRadius="full" />
                <Text fontSize="12px">In-progress</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                25%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full" />
                <Text fontSize="12px">Overdue</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                5%
              </Text>
            </Flex>
          </VStack>
        </Box>
      </Grid>
      {/* Reuse Table */}
      {academicData.length > 0 && renderAcademic().props.children[3]}
    </>
  );

  const renderAttendance = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard
          title="Overall Attendance"
          value="85%"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Average Daily Logins"
          value="56"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Absence Rate"
          value="1.4%"
          subtext="-5% vs last month"
          subtextColor="#F04438"
        />
        <SummaryCard
          title="Average Session Duration"
          value="1h 2m"
          subtext="+5% vs last month"
        />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Text fontSize="18px" fontWeight="600" color="#101928">
              Monthly Attendance
            </Text>
            <Select
              w="180px"
              size="sm"
              borderRadius="md"
              defaultValue="Jan-Jul 2025"
            >
              <option>January - July 2025</option>
            </Select>
          </Flex>
          <Box h="300px">
            <Bar data={barData} options={chartOptions} />
          </Box>
        </Box>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            Logins by Device
          </Text>
          <Box
            h="250px"
            position="relative"
            display="flex"
            justifyContent="center"
          >
            <Doughnut
              data={{
                labels: ["Desktop/Laptop", "Phone"],
                datasets: [
                  {
                    data: [80, 25],
                    backgroundColor: ["#CC0C0C", "#F97316"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{ maintainAspectRatio: false, cutout: "70%" }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              textAlign="center"
            >
              <Text fontSize="24px" fontWeight="700" color="#101928">
                2.1K
              </Text>
              <Text fontSize="12px" color="#667085">
                Logins
              </Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full" />
                <Text fontSize="12px">Desktop/Laptop</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                80%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#F97316" borderRadius="full" />
                <Text fontSize="12px">Phone</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                25%
              </Text>
            </Flex>
          </VStack>
        </Box>
      </Grid>
      {/* Reuse Course Enrollment Table UI */}
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid #E4E7EC"
        overflow="hidden"
        boxShadow="xs"
      >
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>
            Course Enrollment
          </Text>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="#667085" />
                </InputLeftElement>
                <ChakraInput
                  placeholder="Search here..."
                  fontSize="14px"
                  borderRadius="md"
                />
              </InputGroup>
              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                size="sm"
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                borderRadius="md"
              >
                Filter
              </Button>
            </HStack>
            <HStack spacing={3}>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Department"
              >
                <option>Science</option>
              </Select>
              <Select
                w="120px"
                size="sm"
                borderRadius="md"
                placeholder="Region"
              >
                <option>Lagos</option>
              </Select>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Date Range"
              >
                <option>Last 30 Days</option>
              </Select>
            </HStack>
          </Flex>
        </Box>
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th px={6} py={4}>
                <Checkbox colorScheme="purple" />
              </Th>
              <Th textTransform="none">Course</Th>
              <Th textTransform="none">Department</Th>
              <Th textTransform="none">Enrolled</Th>
              <Th textTransform="none">Completion (%)</Th>
              <Th textTransform="none">Completion Status</Th>
              <Th textTransform="none">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {academicData.map((item, idx) => (
              <Tr key={idx}>
                <Td px={6} py={6}>
                  <Checkbox colorScheme="purple" />
                </Td>
                <Td fontSize="12px">{item.course}</Td>
                <Td fontSize="12px">{item.department}</Td>
                <Td fontSize="12px">{item.enrolled}</Td>
                <Td fontSize="12px">{item.completion}</Td>
                <Td>
                  <Badge
                    bg={getStatusColor(item.status).bg}
                    color={getStatusColor(item.status).color}
                    borderRadius="full"
                    px={4}
                    py={1}
                    fontSize="11px"
                  >
                    {item.status}
                  </Badge>
                </Td>
                <Td>
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
                      <MenuItem fontSize="13px">Archive report</MenuItem>
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
            <Select w="70px" size="sm" borderRadius="md" defaultValue="08">
              <option>08</option>
            </Select>
          </HStack>
          <HStack spacing={4}>
            <Text fontSize="13px" color="#344054">
              Showing 10 out of 100 items
            </Text>
            <IconButton
              icon={<FiChevronLeft />}
              size="sm"
              variant="ghost"
              isDisabled
            />
            <Text fontSize="13px" fontWeight="600">
              1
            </Text>
            <IconButton icon={<FiChevronRight />} size="sm" variant="ghost" />
          </HStack>
        </Flex>
      </Box>
    </>
  );

  const renderPerformance = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard
          title="Average Quiz Score"
          value="84%"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Feedback Rating"
          value="4.5/5.0"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Top Performers"
          value="104"
          subtext="+5% vs last month"
        />
        <SummaryCard
          title="Completion Rate"
          value="82%"
          subtext="+5% vs last month"
        />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Text fontSize="18px" fontWeight="600" color="#101928">
              Performance Trend Analysis
            </Text>
            <Select
              w="120px"
              size="sm"
              borderRadius="md"
              defaultValue="January"
            >
              <option>January</option>
            </Select>
          </Flex>
          <Box h="300px">
            <Bar
              data={{
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                  {
                    label: "Performance",
                    data: [60, 35, 75, 50],
                    backgroundColor: "#D94111",
                    borderRadius: 4,
                  },
                ],
              }}
              options={chartOptions}
            />
          </Box>
        </Box>
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          border="1px solid #E4E7EC"
          boxShadow="sm"
        >
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>
            Average Rating
          </Text>
          <Box
            h="250px"
            position="relative"
            display="flex"
            justifyContent="center"
          >
            <Doughnut
              data={{
                labels: ["Excellent (5)", "Good (4)", "Average (3)"],
                datasets: [
                  {
                    data: [80, 25, 5],
                    backgroundColor: ["#00A143", "#F97316", "#CC0C0C"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{ maintainAspectRatio: false, cutout: "70%" }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              textAlign="center"
            >
              <Text fontSize="24px" fontWeight="700" color="#101928">
                2.1K
              </Text>
              <Text fontSize="12px" color="#667085">
                Average Rating
              </Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#00A143" borderRadius="full" />
                <Text fontSize="12px">Excellent (5)</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                80%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#F97316" borderRadius="full" />
                <Text fontSize="12px">Good (4)</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                25%
              </Text>
            </Flex>
            <Flex justify="space-between">
              <HStack>
                <Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full" />
                <Text fontSize="12px">Average (3)</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="600">
                5%
              </Text>
            </Flex>
          </VStack>
        </Box>
      </Grid>
      {/* Reuse Table */}
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid #E4E7EC"
        overflow="hidden"
        boxShadow="xs"
      >
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>
            Course Enrollment
          </Text>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="#667085" />
                </InputLeftElement>
                <ChakraInput
                  placeholder="Search here..."
                  fontSize="14px"
                  borderRadius="md"
                />
              </InputGroup>
              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                size="sm"
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                borderRadius="md"
              >
                Filter
              </Button>
            </HStack>
            <HStack spacing={3}>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Department"
              >
                <option>Science</option>
              </Select>
              <Select
                w="120px"
                size="sm"
                borderRadius="md"
                placeholder="Region"
              >
                <option>Lagos</option>
              </Select>
              <Select
                w="140px"
                size="sm"
                borderRadius="md"
                placeholder="Date Range"
              >
                <option>Last 30 Days</option>
              </Select>
            </HStack>
          </Flex>
        </Box>
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th px={6} py={4}>
                <Checkbox colorScheme="purple" />
              </Th>
              <Th textTransform="none">Course</Th>
              <Th textTransform="none">Department</Th>
              <Th textTransform="none">Enrolled</Th>
              <Th textTransform="none">Completion (%)</Th>
              <Th textTransform="none">Completion Status</Th>
              <Th textTransform="none">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {academicData.map((item, idx) => (
              <Tr key={idx}>
                <Td px={6} py={6}>
                  <Checkbox colorScheme="purple" />
                </Td>
                <Td fontSize="12px">{item.course}</Td>
                <Td fontSize="12px">{item.department}</Td>
                <Td fontSize="12px">{item.enrolled}</Td>
                <Td fontSize="12px">{item.completion}</Td>
                <Td>
                  <Badge
                    bg={getStatusColor(item.status).bg}
                    color={getStatusColor(item.status).color}
                    borderRadius="full"
                    px={4}
                    py={1}
                    fontSize="11px"
                  >
                    {item.status}
                  </Badge>
                </Td>
                <Td>
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
                      <MenuItem fontSize="13px">Archive report</MenuItem>
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
            <Select w="70px" size="sm" borderRadius="md" defaultValue="08">
              <option>08</option>
            </Select>
          </HStack>
          <HStack spacing={4}>
            <Text fontSize="13px" color="#344054">
              Showing 10 out of 100 items
            </Text>
            <IconButton
              icon={<FiChevronLeft />}
              size="sm"
              variant="ghost"
              isDisabled
            />
            <Text fontSize="13px" fontWeight="600">
              1
            </Text>
            <IconButton icon={<FiChevronRight />} size="sm" variant="ghost" />
          </HStack>
        </Flex>
      </Box>
    </>
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
            Management Information System Reports
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
              onClick={onGenerateOpen}
            >
              Generate Report
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
                whiteSpace="nowrap"
                pb="4px"
                sx={{
                  "&::-webkit-scrollbar": { height: "3px" },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#E4E7EC",
                    borderRadius: "10px",
                  },
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    _selected={{
                      color: "#660066",
                      borderBottom: "2px solid #660066",
                      fontWeight: "600",
                    }}
                    borderBottom="2px solid transparent"
                    fontSize="13px"
                    fontWeight="500"
                    color="#344054"
                    px={4}
                    py={3}
                    mr={8}
                    transition="all 0.3s ease"
                    flexShrink={0}
                    _focus={{
                      boxShadow: "none",
                      outline: "none",
                    }}
                    _active={{
                      boxShadow: "none",
                      outline: "none",
                    }}
                  >
                    {tab}
                  </Tab>
                ))}
              </TabList>
            </Box>

            <TabPanels mt={8}>
              <TabPanel p={0}>{renderOverview()}</TabPanel>
              <TabPanel p={0}>{renderAcademic()}</TabPanel>
              <TabPanel p={0}>{renderAdministrative()}</TabPanel>
              <TabPanel p={0}>{renderCompliance()}</TabPanel>
              <TabPanel p={0}>{renderAttendance()}</TabPanel>
              <TabPanel p={0}>{renderPerformance()}</TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
      <Modal
        isOpen={isGenerateOpen}
        onClose={onGenerateClose}
        isCentered
        size="md"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalHeader fontSize="lg" fontWeight="700" color="#101928">
            Generate Report
          </ModalHeader>
          <ModalCloseButton mt={3} mr={2} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">
                  Report Name
                </FormLabel>
                <ChakraInput
                  placeholder="e.g. Course Completion Summary – Oct 2026"
                  value={generateForm.reportName}
                  onChange={(e) =>
                    setGenerateForm((f) => ({
                      ...f,
                      reportName: e.target.value,
                    }))
                  }
                  borderRadius="md"
                  fontSize="14px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">
                  Category
                </FormLabel>
                <Select
                  value={generateForm.reportCategory}
                  onChange={(e) =>
                    setGenerateForm((f) => ({
                      ...f,
                      reportCategory: e.target.value,
                    }))
                  }
                  borderRadius="md"
                  fontSize="14px"
                >
                  <option value="academic">Academic</option>
                  <option value="admin">Administrative</option>
                  <option value="compliance">Compliance</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">
                  Format
                </FormLabel>
                <Select
                  value={generateForm.reportFormat}
                  onChange={(e) =>
                    setGenerateForm((f) => ({
                      ...f,
                      reportFormat: e.target.value,
                    }))
                  }
                  borderRadius="md"
                  fontSize="14px"
                >
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">
                  Frequency
                </FormLabel>
                <Select
                  value={generateForm.frequency}
                  onChange={(e) =>
                    setGenerateForm((f) => ({
                      ...f,
                      frequency: e.target.value,
                    }))
                  }
                  borderRadius="md"
                  fontSize="14px"
                >
                  <option value="on_demand">On Demand</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} pt={6} pb={4}>
            <Button
              variant="outline"
              flex={1}
              borderColor="#D0D5DD"
              color="#344054"
              fontSize="14px"
              fontWeight="600"
              onClick={onGenerateClose}
              borderRadius="md"
              h="44px"
            >
              Cancel
            </Button>
            <Button
              bg="#660066"
              flex={1}
              color="white"
              _hover={{ bg: "#550055" }}
              fontSize="14px"
              fontWeight="600"
              borderRadius="md"
              h="44px"
              isLoading={generating}
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export const MISReportsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <MISReportsPage {...props} />} />;
};

export default MISReportsPage;
