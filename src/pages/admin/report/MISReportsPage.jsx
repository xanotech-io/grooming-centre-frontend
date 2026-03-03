import  { useState } from 'react';
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
  Grid,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiChevronLeft, 
  FiChevronRight,
} from 'react-icons/fi';
import {  Route } from 'react-router-dom';
import { AdminMainAreaWrapper } from '../../../layouts';
import { motion } from 'framer-motion';
import ScheduleReportModal from './components/ScheduleReportModal';
import { Bar, Doughnut } from 'react-chartjs-2';

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Box bg="white" p={6} borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm">
    <Text fontSize="15px" fontWeight="500" color="#101928" mb={2}>{title}</Text>
    <Text fontSize="28px" fontWeight="700" color="#101928" mb={1}>{value}</Text>
    <Text fontSize="14px" fontWeight="500" color={subtextColor || "#12B76A"}>{subtext}</Text>
  </Box>
);

const MISReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const tabs = [
    "Overview",
    "Academic",
    "Administrative",
    "Compliance",
    "Attendance",
    "Performance"
  ];

  const overviewData = [
    { id: 'MIS-2025-001', category: 'Academic', name: 'Course Completion Summary', generatedBy: 'Admin', dateTime: '26/11/2025 11:30am', format: 'PDF', frequency: 'Monthly', status: 'Archived', remark: 'Automated generation completed' },
    { id: 'MIS-2025-001', category: 'Administrative', name: 'Course Completion Summary', generatedBy: 'Registrar', dateTime: '26/11/2025 11:30am', format: 'Excel', frequency: 'On demand', status: 'Approved', remark: 'Automated generation completed' },
    { id: 'MIS-2025-001', category: 'Compliance', name: 'Data Access Log Report', generatedBy: 'IT Security', dateTime: '26/11/2025 11:30am', format: 'CSV', frequency: 'Quarterly', status: 'Approved', remark: 'For internal audit' },
    { id: 'MIS-2025-001', category: 'Administrative', name: 'Course Subscription Revenue Summary', generatedBy: 'Registrar', dateTime: '26/11/2025 11:30am', format: 'PDF', frequency: 'Daily', status: 'Archived', remark: 'Automated generation completed' },
    { id: 'MIS-2025-001', category: 'Compliance', name: 'Enrollment Statistics', generatedBy: 'IT Security', dateTime: '26/11/2025 11:30am', format: 'Excel', frequency: 'On demand', status: 'Approved', remark: 'Automated generation completed' },
    { id: 'MIS-2025-001', category: 'Academic', name: 'Data Access Log Report', generatedBy: 'Admin', dateTime: '26/11/2025 11:30am', format: 'CSV', frequency: 'Monthly', status: 'Draft', remark: '-' },
  ];

  const academicData = [
    { course: 'Data Analytics', department: 'Science', enrolled: 500, completion: '70%', status: 'High' },
    { course: 'Data Analytics', department: 'Business Admin', enrolled: 500, completion: '20%', status: 'Low' },
    { course: 'Data Analytics', department: 'Computer Science', enrolled: 500, completion: '70%', status: 'High' },
    { course: 'Data Analytics', department: 'Science', enrolled: 500, completion: '15%', status: 'Low' },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return { bg: '#ECFDF3', color: '#027A48' };
      case 'archived': return { bg: '#FEF3F2', color: '#B42318' };
      case 'draft': return { bg: '#FFFAEB', color: '#B54708' };
      case 'high': return { bg: '#ECFDF3', color: '#027A48' };
      case 'low': return { bg: '#FEF3F2', color: '#B42318' };
      default: return { bg: '#F2F4F7', color: '#344054' };
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
      y: { beginAtZero: true, grid: { borderDash: [5, 5] }, ticks: { stepSize: 20 } },
    },
  };

  const barData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'Course Completion',
      data: [60, 30, 75, 50, 60, 52, 50],
      backgroundColor: '#D94111',
      borderRadius: 4,
    }]
  };

  const doughnutData = {
    labels: ['Computer Science', 'Art'],
    datasets: [{
      data: [80, 15],
      backgroundColor: ['#CC0C0C', '#F97316'],
      borderWidth: 0,
    }]
  };

  const renderOverview = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard title="Total Report" value="100" subtext="+5% vs last month" />
        <SummaryCard title="Automated Report" value="70" subtext="+5% vs last month" />
        <SummaryCard title="Average Creation Time" value="12secs" />
        <SummaryCard title="Report Accuracy" value="80%" subtext="+5% vs last month" />
      </SimpleGrid>

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" boxShadow="xs">
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none"><FiSearch color="#667085" /></InputLeftElement>
                <Input placeholder="Search here..." fontSize="14px" borderRadius="md" />
              </InputGroup>
              <Button leftIcon={<FiFilter />} variant="outline" size="sm" fontSize="14px" fontWeight="500" color="#344054" borderRadius="md">Filter</Button>
            </HStack>
            <HStack spacing={3}>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Department">
                <option>Academic</option>
                <option>Administrative</option>
              </Select>
              <Select w="120px" size="sm" borderRadius="md" placeholder="Region">
                 <option>Lagos</option>
              </Select>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Date Range">
                 <option>This Month</option>
              </Select>
            </HStack>
          </Flex>
        </Box>
        
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th w="40px" px={6} py={4}><Checkbox colorScheme="purple" /></Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Report ID</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Category</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Report Name</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Generated By</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Date and Time</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Format</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Frequency</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Status</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Remark</Th>
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {overviewData.map((item, idx) => (
                <Tr key={idx}>
                  <Td px={6} py={6}><Checkbox colorScheme="purple" /></Td>
                  <Td fontSize="12px" color="#667085">{item.id}</Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">{item.category}</Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500" maxW="200px">{item.name}</Td>
                  <Td fontSize="12px" color="#667085">{item.generatedBy}</Td>
                  <Td fontSize="12px" color="#667085">{item.dateTime}</Td>
                  <Td fontSize="12px" color="#667085">{item.format}</Td>
                  <Td fontSize="12px" color="#667085">{item.frequency}</Td>
                  <Td><Badge bg={getStatusColor(item.status).bg} color={getStatusColor(item.status).color} borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="500">{item.status}</Badge></Td>
                  <Td fontSize="12px" color="#667085" maxW="150px">{item.remark}</Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" color="#98A2B3" border="1px solid #E4E7EC" borderRadius="md" />
                      <MenuList><MenuItem fontSize="13px">Archive report</MenuItem></MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        
        <Flex justify="space-between" align="center" p={4} borderTop="1px solid #F2F4F7">
          <HStack spacing={2}>
            <Text fontSize="13px" color="#344054">Rows per page</Text>
            <Select w="70px" size="sm" borderRadius="md" defaultValue="08">
              <option>08</option>
            </Select>
          </HStack>
          <HStack spacing={4}>
            <Text fontSize="13px" color="#344054">Showing 10 out of 100 items</Text>
            <HStack spacing={1}>
              <IconButton icon={<FiChevronLeft />} size="sm" variant="ghost" isDisabled aria-label="Previous page" />
              <Text fontSize="13px" fontWeight="600">1</Text>
              <IconButton icon={<FiChevronRight />} size="sm" variant="ghost" aria-label="Next page" />
            </HStack>
          </HStack>
        </Flex>
      </Box>
    </>
  );

  const renderAcademic = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard title="Total Courses" value="100" subtext="+5% vs last month" />
        <SummaryCard title="Course Enrollment" value="42m 3" subtext="+5% vs last month" />
        <SummaryCard title="Course Completion Rate" value="83%" subtext="+5% vs last month" />
        <SummaryCard title="Average Assessment Score" value="80%" subtext="+5% vs last month" />
      </SimpleGrid>
      
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard title="Certificate Issued" value="100" subtext="+5% vs last month" />
        <SummaryCard title="Exam Attempt" value="42m 3" subtext="+5% vs last month" />
        <SummaryCard title="Exam Pass Rate" value="83%" subtext="+5% vs last month" />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>Course Completion</Text>
          <Box h="300px">
            <Bar data={barData} options={chartOptions} />
          </Box>
        </Box>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>Subject Enrollment</Text>
          <Box h="250px" position="relative" display="flex" justifyContent="center">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
              <Text fontSize="24px" fontWeight="700" color="#101928">2.1K</Text>
              <Text fontSize="12px" color="#667085">Enrollment</Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full"/><Text fontSize="12px">Computer Science</Text></HStack><Text fontSize="12px" fontWeight="600">80%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#F97316" borderRadius="full"/><Text fontSize="12px">Art</Text></HStack><Text fontSize="12px" fontWeight="600">15%</Text></Flex>
          </VStack>
        </Box>
      </Grid>

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" boxShadow="xs">
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>Course Enrollment</Text>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none"><FiSearch color="#667085" /></InputLeftElement>
                <Input placeholder="Search here..." fontSize="14px" borderRadius="md" />
              </InputGroup>
              <Button leftIcon={<FiFilter />} variant="outline" size="sm" fontSize="14px" fontWeight="500" color="#344054" borderRadius="md">Filter</Button>
            </HStack>
            <HStack spacing={3}>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Department"><option>Science</option></Select>
              <Select w="120px" size="sm" borderRadius="md" placeholder="Region"><option>Lagos</option></Select>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Date Range"><option>Last 30 Days</option></Select>
            </HStack>
          </Flex>
        </Box>
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th px={6} py={4}><Checkbox colorScheme="purple" /></Th>
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
                <Td px={6} py={6}><Checkbox colorScheme="purple" /></Td>
                <Td fontSize="12px">{item.course}</Td>
                <Td fontSize="12px">{item.department}</Td>
                <Td fontSize="12px">{item.enrolled}</Td>
                <Td fontSize="12px">{item.completion}</Td>
                <Td><Badge bg={getStatusColor(item.status).bg} color={getStatusColor(item.status).color} borderRadius="full" px={4} py={1} fontSize="11px">{item.status}</Badge></Td>
                <Td>
                   <Menu>
                      <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" color="#98A2B3" border="1px solid #E4E7EC" borderRadius="md" />
                      <MenuList><MenuItem fontSize="13px">Archive report</MenuItem></MenuList>
                    </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Flex justify="space-between" align="center" p={4} borderTop="1px solid #F2F4F7">
             <HStack spacing={2}><Text fontSize="13px" color="#344054">Rows per page</Text><Select w="70px" size="sm" borderRadius="md" defaultValue="08"><option>08</option></Select></HStack>
             <HStack spacing={4}><Text fontSize="13px" color="#344054">Showing 10 out of 100 items</Text><IconButton icon={<FiChevronLeft />} size="sm" variant="ghost" isDisabled /><Text fontSize="13px" fontWeight="600">1</Text><IconButton icon={<FiChevronRight />} size="sm" variant="ghost"/></HStack>
        </Flex>
      </Box>
    </>
  );

  const renderAdministrative = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard title="Total Registered Users" value="1000" subtext="+5% vs last month" />
        <SummaryCard title="Approved Users" value="840" subtext="+5% vs last month" />
        <SummaryCard title="Instructor Account" value="104" subtext="+5% vs last month" />
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm">
            <Text fontSize="15px" fontWeight="500" color="#101928" mb={2}>System Uptime</Text>
            <Text fontSize="28px" fontWeight="700" color="#12B76A" mb={1}>Active</Text>
        </Box>
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>System Usage Rate</Text>
          <Box h="300px">
            <Bar data={{...barData, datasets: [{...barData.datasets[0], backgroundColor: '#D94111'}]}} options={chartOptions} />
          </Box>
        </Box>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>User Account Status</Text>
          <Box h="250px" position="relative" display="flex" justifyContent="center">
            <Doughnut data={{
              labels: ['Active', 'Pending', 'Suspended'],
              datasets: [{
                data: [80, 25, 5],
                backgroundColor: ['#00A143', '#F97316', '#CC0C0C'],
                borderWidth: 0,
              }]
            }} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
              <Text fontSize="24px" fontWeight="700" color="#101928">2.1K</Text>
              <Text fontSize="12px" color="#667085">Total Account</Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#00A143" borderRadius="full"/><Text fontSize="12px">Active</Text></HStack><Text fontSize="12px" fontWeight="600">80%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#F97316" borderRadius="full"/><Text fontSize="12px">Pending</Text></HStack><Text fontSize="12px" fontWeight="600">25%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full"/><Text fontSize="12px">Suspended</Text></HStack><Text fontSize="12px" fontWeight="600">5%</Text></Flex>
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
        <SummaryCard title="Overall Compliance" value="85%" subtext="+5% vs last month" />
        <SummaryCard title="Average Department Rate" value="84%" subtext="+5% vs last month" />
        <SummaryCard title="Examination Submission" value="104" subtext="+5% vs last month" />
        <SummaryCard title="Overdue Courses" value="12" subtext="+5% vs last month" />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>Compliance by Department</Text>
          <Box h="300px">
            <Bar data={{
                labels: ['Sales', 'Finance', 'HR', 'Legal', 'Dept', 'Dept', 'Dept'],
                datasets: [{
                    label: 'Compliance',
                    data: [60, 30, 75, 50, 60, 52, 50],
                    backgroundColor: '#D94111',
                    borderRadius: 4,
                }]
            }} options={chartOptions} />
          </Box>
        </Box>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>Compliance Course Status</Text>
          <Box h="250px" position="relative" display="flex" justifyContent="center">
            <Doughnut data={{
              labels: ['Completed', 'In-progress', 'Overdue'],
              datasets: [{
                data: [80, 25, 5],
                backgroundColor: ['#00A143', '#F97316', '#CC0C0C'],
                borderWidth: 0,
              }]
            }} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
              <Text fontSize="24px" fontWeight="700" color="#101928">2.1K</Text>
              <Text fontSize="12px" color="#667085">Enrollment</Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#00A143" borderRadius="full"/><Text fontSize="12px">Completed</Text></HStack><Text fontSize="12px" fontWeight="600">80%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#F97316" borderRadius="full"/><Text fontSize="12px">In-progress</Text></HStack><Text fontSize="12px" fontWeight="600">25%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full"/><Text fontSize="12px">Overdue</Text></HStack><Text fontSize="12px" fontWeight="600">5%</Text></Flex>
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
        <SummaryCard title="Overall Attendance" value="85%" subtext="+5% vs last month" />
        <SummaryCard title="Average Daily Logins" value="56" subtext="+5% vs last month" />
        <SummaryCard title="Absence Rate" value="1.4%" subtext="-5% vs last month" subtextColor="#F04438" />
        <SummaryCard title="Average Session Duration" value="1h 2m" subtext="+5% vs last month" />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Flex justify="space-between" align="center" mb={6}>
            <Text fontSize="18px" fontWeight="600" color="#101928">Monthly Attendance</Text>
            <Select w="180px" size="sm" borderRadius="md" defaultValue="Jan-Jul 2025">
              <option>January - July 2025</option>
            </Select>
          </Flex>
          <Box h="300px">
            <Bar data={barData} options={chartOptions} />
          </Box>
        </Box>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>Logins by Device</Text>
          <Box h="250px" position="relative" display="flex" justifyContent="center">
            <Doughnut data={{
              labels: ['Desktop/Laptop', 'Phone'],
              datasets: [{
                data: [80, 25],
                backgroundColor: ['#CC0C0C', '#F97316'],
                borderWidth: 0,
              }]
            }} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
              <Text fontSize="24px" fontWeight="700" color="#101928">2.1K</Text>
              <Text fontSize="12px" color="#667085">Logins</Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full"/><Text fontSize="12px">Desktop/Laptop</Text></HStack><Text fontSize="12px" fontWeight="600">80%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#F97316" borderRadius="full"/><Text fontSize="12px">Phone</Text></HStack><Text fontSize="12px" fontWeight="600">25%</Text></Flex>
          </VStack>
        </Box>
      </Grid>
      {/* Reuse Course Enrollment Table UI */}
      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" boxShadow="xs">
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>Course Enrollment</Text>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none"><FiSearch color="#667085" /></InputLeftElement>
                <Input placeholder="Search here..." fontSize="14px" borderRadius="md" />
              </InputGroup>
              <Button leftIcon={<FiFilter />} variant="outline" size="sm" fontSize="14px" fontWeight="500" color="#344054" borderRadius="md">Filter</Button>
            </HStack>
            <HStack spacing={3}>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Department"><option>Science</option></Select>
              <Select w="120px" size="sm" borderRadius="md" placeholder="Region"><option>Lagos</option></Select>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Date Range"><option>Last 30 Days</option></Select>
            </HStack>
          </Flex>
        </Box>
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th px={6} py={4}><Checkbox colorScheme="purple" /></Th>
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
                <Td px={6} py={6}><Checkbox colorScheme="purple" /></Td>
                <Td fontSize="12px">{item.course}</Td>
                <Td fontSize="12px">{item.department}</Td>
                <Td fontSize="12px">{item.enrolled}</Td>
                <Td fontSize="12px">{item.completion}</Td>
                <Td><Badge bg={getStatusColor(item.status).bg} color={getStatusColor(item.status).color} borderRadius="full" px={4} py={1} fontSize="11px">{item.status}</Badge></Td>
                <Td>
                   <Menu>
                      <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" color="#98A2B3" border="1px solid #E4E7EC" borderRadius="md" />
                      <MenuList><MenuItem fontSize="13px">Archive report</MenuItem></MenuList>
                    </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Flex justify="space-between" align="center" p={4} borderTop="1px solid #F2F4F7">
             <HStack spacing={2}><Text fontSize="13px" color="#344054">Rows per page</Text><Select w="70px" size="sm" borderRadius="md" defaultValue="08"><option>08</option></Select></HStack>
             <HStack spacing={4}><Text fontSize="13px" color="#344054">Showing 10 out of 100 items</Text><IconButton icon={<FiChevronLeft />} size="sm" variant="ghost" isDisabled /><Text fontSize="13px" fontWeight="600">1</Text><IconButton icon={<FiChevronRight />} size="sm" variant="ghost"/></HStack>
        </Flex>
      </Box>
    </>
  );

  const renderPerformance = () => (
    <>
      <SimpleGrid columns={4} spacing={6} mb={8}>
        <SummaryCard title="Average Quiz Score" value="84%" subtext="+5% vs last month" />
        <SummaryCard title="Feedback Rating" value="4.5/5.0" subtext="+5% vs last month" />
        <SummaryCard title="Top Performers" value="104" subtext="+5% vs last month" />
        <SummaryCard title="Completion Rate" value="82%" subtext="+5% vs last month" />
      </SimpleGrid>

      <Grid templateColumns="7fr 3fr" gap={6} mb={8}>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Flex justify="space-between" align="center" mb={6}>
            <Text fontSize="18px" fontWeight="600" color="#101928">Performance Trend Analysis</Text>
            <Select w="120px" size="sm" borderRadius="md" defaultValue="January">
              <option>January</option>
            </Select>
          </Flex>
          <Box h="300px">
            <Bar data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Performance',
                    data: [60, 35, 75, 50],
                    backgroundColor: '#D94111',
                    borderRadius: 4,
                }]
            }} options={chartOptions} />
          </Box>
        </Box>
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={6}>Average Rating</Text>
          <Box h="250px" position="relative" display="flex" justifyContent="center">
            <Doughnut data={{
              labels: ['Excellent (5)', 'Good (4)', 'Average (3)'],
              datasets: [{
                data: [80, 25, 5],
                backgroundColor: ['#00A143', '#F97316', '#CC0C0C'],
                borderWidth: 0,
              }]
            }} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
              <Text fontSize="24px" fontWeight="700" color="#101928">2.1K</Text>
              <Text fontSize="12px" color="#667085">Average Rating</Text>
            </Box>
          </Box>
          <VStack align="stretch" mt={6} spacing={2}>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#00A143" borderRadius="full"/><Text fontSize="12px">Excellent (5)</Text></HStack><Text fontSize="12px" fontWeight="600">80%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#F97316" borderRadius="full"/><Text fontSize="12px">Good (4)</Text></HStack><Text fontSize="12px" fontWeight="600">25%</Text></Flex>
            <Flex justify="space-between"><HStack><Box w="10px" h="10px" bg="#CC0C0C" borderRadius="full"/><Text fontSize="12px">Average (3)</Text></HStack><Text fontSize="12px" fontWeight="600">5%</Text></Flex>
          </VStack>
        </Box>
      </Grid>
      {/* Reuse Table */}
      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" boxShadow="xs">
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>Course Enrollment</Text>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <InputGroup w="350px">
                <InputLeftElement pointerEvents="none"><FiSearch color="#667085" /></InputLeftElement>
                <Input placeholder="Search here..." fontSize="14px" borderRadius="md" />
              </InputGroup>
              <Button leftIcon={<FiFilter />} variant="outline" size="sm" fontSize="14px" fontWeight="500" color="#344054" borderRadius="md">Filter</Button>
            </HStack>
            <HStack spacing={3}>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Department"><option>Science</option></Select>
              <Select w="120px" size="sm" borderRadius="md" placeholder="Region"><option>Lagos</option></Select>
              <Select w="140px" size="sm" borderRadius="md" placeholder="Date Range"><option>Last 30 Days</option></Select>
            </HStack>
          </Flex>
        </Box>
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th px={6} py={4}><Checkbox colorScheme="purple" /></Th>
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
                <Td px={6} py={6}><Checkbox colorScheme="purple" /></Td>
                <Td fontSize="12px">{item.course}</Td>
                <Td fontSize="12px">{item.department}</Td>
                <Td fontSize="12px">{item.enrolled}</Td>
                <Td fontSize="12px">{item.completion}</Td>
                <Td><Badge bg={getStatusColor(item.status).bg} color={getStatusColor(item.status).color} borderRadius="full" px={4} py={1} fontSize="11px">{item.status}</Badge></Td>
                <Td>
                   <Menu>
                      <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" color="#98A2B3" border="1px solid #E4E7EC" borderRadius="md" />
                      <MenuList><MenuItem fontSize="13px">Archive report</MenuItem></MenuList>
                    </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Flex justify="space-between" align="center" p={4} borderTop="1px solid #F2F4F7">
             <HStack spacing={2}><Text fontSize="13px" color="#344054">Rows per page</Text><Select w="70px" size="sm" borderRadius="md" defaultValue="08"><option>08</option></Select></HStack>
             <HStack spacing={4}><Text fontSize="13px" color="#344054">Showing 10 out of 100 items</Text><IconButton icon={<FiChevronLeft />} size="sm" variant="ghost" isDisabled /><Text fontSize="13px" fontWeight="600">1</Text><IconButton icon={<FiChevronRight />} size="sm" variant="ghost"/></HStack>
        </Flex>
      </Box>
    </>
  );

  return (
    <AdminMainAreaWrapper>
      <Box mb={6} mt={6} as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="24px" fontWeight="700" color="#101928">Management Information System Reports</Text>
          <HStack spacing={3}>
            <Button variant="outline" borderColor="#660066" color="#660066" h="40px" fontSize="14px" fontWeight="500" onClick={onOpen}>Schedule report</Button>
            <Button bg="#660066" color="white" _hover={{ bg: "#550055" }} h="40px" fontSize="14px" fontWeight="500">Export Report</Button>
          </HStack>
        </Flex>

        <Box position="relative" mb="-1px" w="100%" overflow="hidden">
          <Tabs index={activeTab} onChange={(index) => setActiveTab(index)} colorScheme="purple" isLazy variant="unstyled">
            <Box position="relative">
              <TabList 
                borderBottom="1px solid #E4E7EC" 
                overflowX="auto" 
                whiteSpace="nowrap"
                pb="4px"
                sx={{
                  '&::-webkit-scrollbar': { height: '3px' },
                  '&::-webkit-scrollbar-thumb': { background: '#E4E7EC', borderRadius: '10px' },
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab 
                    key={index}
                    _selected={{ color: '#660066', borderBottom: '2px solid #660066', fontWeight: '600' }} 
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
      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export const MISReportsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <MISReportsPage {...props} />} />;
};

export default MISReportsPage;