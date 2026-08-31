import React from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Spacer,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Route, useHistory } from 'react-router-dom';
import { FiSearch, FiFilter, FiMoreVertical, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { AdminMainAreaWrapper } from '../../../layouts';
import { ExportMenu } from '../../../components';
import QuestionBankUsageReport from './QuestionBankUsageReport';
import RandomizationIntegrityReport from './RandomizationIntegrityReport';
import ProctoringAuditReport from './ProctoringAuditReport';
import ExaminationPaperMarking from './ExaminationPaperMarking';
import ScheduleReportModal from './components/ScheduleReportModal';
import ReportTypeDropdown from './components/ReportTypeDropdown';

// Sample Data
const summaryStats = [
  { label: 'Average Examination Score', value: '80%', change: '+5% vs last month', changeType: 'increase' },
  { label: 'Pass Rate', value: '70%', change: '+5% vs last month', changeType: 'increase' },
  { label: 'Median/Mean Gap', value: '-2.5%', change: '+5% vs last month', changeType: 'increase' },
  { label: 'Question Accuracy', value: '79%', change: 'Stable', changeType: 'stable' },
  { label: 'Average Completion Time', value: '50min', change: '', changeType: '' },
];

const topPerformers = [
  { id: 1, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 2, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 3, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 4, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 5, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 6, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 7, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 8, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 9, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
  { id: 10, name: 'Olivia Jones', score: '99%', duration: '20mins', grade: 'A+' },
];

const studentResults = [
  { id: '#123345', name: 'John Doe', exam: 'MF101 Final Exam', time: '45 mins', score: '65%', correct: 66, incorrect: 17, rank: '4th', status: 'Pass' },
  { id: '#123345', name: 'John Doe', exam: 'MF101 Final Exam', time: '45 mins', score: '95%', correct: 35, incorrect: 24, rank: '1st', status: 'Pass' },
  { id: '#123345', name: 'John Doe', exam: 'MF101 Final Exam', time: '45 mins', score: '61%', correct: 61, incorrect: 15, rank: '5th', status: 'Pass' },
  { id: '#123345', name: 'John Doe', exam: 'MF101 Final Exam', time: '45 mins', score: '25%', correct: 32, incorrect: 74, rank: '10th', status: 'Failed' },
  { id: '#123345', name: 'John Doe', exam: 'MF101 Final Exam', time: '45 mins', score: '52%', correct: 52, incorrect: 27, rank: '6th', status: 'Pass' },
  { id: '#123345', name: 'John Doe', exam: 'MF101 Final Exam', time: '45 mins', score: '5%', correct: 15, incorrect: 86, rank: '20th', status: 'Failed' },
];

const barChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Pass',
      data: [60, 75, 62, 45, 58, 48, 65, 82, 60, 38, 55, 70],
      backgroundColor: '#E65100', // Deep Orange
    },
    {
      label: 'Fail',
      data: [20, 15, 25, 30, 22, 28, 18, 12, 25, 45, 20, 18],
      backgroundColor: '#FFAB91', // Light Orange/Peach
    },
  ],
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 8,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { stepSize: 20 },
    },
  },
};

const pieChartData = {
  labels: ['Correct', 'Fail'],
  datasets: [
    {
      data: [80, 15],
      backgroundColor: ['#D32F2F', '#E65100'],
      borderWidth: 0,
    },
  ],
};

const lineChartData = {
  labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  datasets: [
    {
      data: [100, 150, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700],
      borderColor: '#E65100',
      backgroundColor: 'transparent',
      pointRadius: 0,
      tension: 0.1,
    },
  ],
};

const examinationReportRows = [
  ['Student ID', 'Name', 'Exam', 'Time (mins)', 'Score (%)', 'Correct', 'Incorrect', 'Rank', 'Status'],
  ...studentResults.map((r) => [
    r.id,
    r.name,
    r.exam,
    r.time,
    r.score,
    r.correct,
    r.incorrect,
    r.rank,
    r.status,
  ]),
];

const ReportListingPage = () => {
  const history = useHistory();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();

  return (
    <AdminMainAreaWrapper>

      <Flex justifyContent="space-between" alignItems="center" mb={6} mt={6}>
        <ReportTypeDropdown currentKey="examination" />
        <HStack spacing={4}>
          <Button
            variant="outline"
            colorScheme="#660066"
            borderColor="#660066"
            borderRadius="md"
            size="md"
            fontSize="16px"
            fontWeight="600"
            color="#660066"
            onClick={onScheduleOpen}
          >
            Schedule report
          </Button>
          <ExportMenu
            rows={examinationReportRows}
            filename="examination-report"
            title="Exam Result Analysis Report"
          />
        </HStack>
      </Flex>

      {/* Tabs */}
      <Tabs colorScheme="purple" variant="line" mb={8} mt={4}>
        <TabList borderBottom="1.5px solid #D5D7DA" borderColor="gray.200">
          <Tab fontWeight="600" px={0} mr={8} _selected={{ color: "#660066", fontSize: "14px", fontWeight: "500", borderBottom: "1px solid #660066" }} _focus={{ boxShadow: "none" }}>Exam Result Analysis Report</Tab>
          <Tab fontSize="14px" fontWeight="500" px={0} mr={8} color="#101928" _focus={{ boxShadow: "none" }}>Question Bank Usage Report</Tab>
          <Tab fontSize="14px" fontWeight="500" px={0} mr={8} color="#101928" _focus={{ boxShadow: "none" }}>Randomization & Integrity Report</Tab>
          <Tab fontSize="14px" fontWeight="500" px={0} mr={8} color="#101928" _focus={{ boxShadow: "none" }}>Proctoring & Audit Report</Tab>
          <Tab fontSize="14px" fontWeight="500" px={0} color="#101928" _focus={{ boxShadow: "none" }}>Examination Paper Marking</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} pt={6} as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Stats Cards */}
            <Grid templateColumns="repeat(5, 1fr)" gap={3} mb={8}>
              {summaryStats.map((stat, index) => (
                <Box key={index} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px solid" borderColor="gray.100">
                  <Text color="#000000" fontWeight="500" fontSize="14px" mb={2}>{stat.label}</Text>
                  <Text fontSize="xl" fontWeight="700" mb={2}>{stat.value}</Text>
                  <Text color={stat.changeType === 'increase' ? "#00A143" : "gray.500"} fontSize="xs" fontWeight="500">
                    {stat.change}
                  </Text>
                </Box>
              ))}
            </Grid>

            {/* Middle Section: Charts and Top Performers */}
            <Grid templateColumns="repeat(12, 1fr)" gap={6} mb={8}>
              {/* Left Column: Two Main Charts */}
              <GridItem colSpan={8}>
                <VStack spacing={6} align="stretch">
                  <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                    <Text fontWeight="700" fontSize="17px" mb={4}>Student Performance Distribution</Text>
                    <Box height="300px">
                      <Bar data={barChartData} options={barChartOptions} />
                    </Box>
                  </Box>

                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                      <Text fontWeight="700" mb={4}>Answer Ratio</Text>
                      <Flex>
                        <Box width="60%" height="200px">
                          <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </Box>
                        <VStack align="start" justify="center" ml={4} spacing={2}>
                          <HStack>
                            <Box w={3} h={3} borderRadius="full" bg="#D32F2F" />
                            <Text fontSize="xs">Correct</Text>
                            <Spacer />
                            <Text fontSize="xs" fontWeight="700">80%</Text>
                          </HStack>
                          <HStack>
                            <Box w={3} h={3} borderRadius="full" bg="#E65100" />
                            <Text fontSize="xs">Fail</Text>
                            <Spacer />
                            <Text fontSize="xs" fontWeight="700">15%</Text>
                          </HStack>
                        </VStack>
                      </Flex>
                    </Box>
                    <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                      <Text fontWeight="700" mb={4}>Sectional Performance</Text>
                      <Box height="200px">
                        <Line data={lineChartData} options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                        }} />
                      </Box>
                    </Box>
                  </Grid>
                </VStack>
              </GridItem>

              {/* Right Column: Top 10 Performers */}
              <GridItem colSpan={4}>
                <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                  <Text fontWeight="700" mb={4} borderBottom="1px solid" borderColor="gray.100" pb={2}>Top 10 Performers</Text>
                  <VStack align="stretch" spacing={4}>
                    {topPerformers.map((performer) => (
                      <HStack key={performer.id} spacing={3}>
                        <Flex w={8} h={8} borderRadius="full" bg="gray.100" align="center" justify="center" fontSize="xs" fontWeight="700">
                          {performer.id}
                        </Flex>
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="700" fontSize="sm">{performer.name}</Text>
                          <Text fontSize="xs" color="#000">Score: {performer.score}</Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="700" fontSize="sm" color="green.500">{performer.grade}</Text>
                          <Text fontSize="xs" > <span color="#000">Duration:</span> {performer.duration}</Text>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </GridItem>
            </Grid>

            {/* Bottom Table Section */}
            <Box bg="white" p={3} borderRadius="lg" border="1.5px solid #E4E7EC" borderColor="#E4E7EC">
              <Flex mb={6} justifyContent="" alignItems="center" gap={2}>
                <InputGroup maxW="300px" >
                  <InputLeftElement pointerEvents="none" size="lg">
                    <FiSearch color="gray.300" mb={-2} />
                  </InputLeftElement>
                  <Input placeholder="Search here..." borderRadius="md" size="sm" />
                </InputGroup>
                <Button leftIcon={<FiFilter />} variant="outline" size="sm" borderRadius="md">
                  Filter
                </Button>
              </Flex>

              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th><Input type="checkbox" /></Th>
                    <Th color="#344054" fontSize="xs">Student ID</Th>
                    <Th color="#344054" fontSize="xs">Exam</Th>
                    <Th color="#344054" fontSize="xs">Time (mins)</Th>
                    <Th color="#344054" fontSize="xs">Score (%)</Th>
                    <Th color="#344054" fontSize="xs">Correct</Th>
                    <Th color="#344054" fontSize="xs">Incorrect</Th>
                    <Th color="#344054" fontSize="xs">Rank</Th>
                    <Th color="#344054" fontSize="xs">Status</Th>
                    <Th color="#344054" fontSize="xs">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {studentResults.map((result, index) => (
                    <Tr key={index}>
                      <Td><Input type="checkbox" /></Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="#101928" mb={1}>{result.name}</Text>
                          <Text fontSize="2xs" color="gray.500">{result.id}</Text>
                        </VStack>
                      </Td>
                      <Td>{result.exam}</Td>
                      <Td>{result.time}</Td>
                      <Td>{result.score}</Td>
                      <Td>{result.correct}</Td>
                      <Td>{result.incorrect}</Td>
                      <Td>{result.rank}</Td>
                      <Td>
                        <Badge
                          px={2} py={1} borderRadius="full" textTransform="capitalize"
                          bg={result.status === 'Pass' ? "green.50" : "red.50"}
                          color={result.status === 'Pass' ? "green.600" : "red.600"}
                        >
                          {result.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton as={IconButton} icon={<FiMoreVertical />}
                            borderColor="#E4E7EC" border="1px"
                            variant="ghost" size="xs" />
                          <MenuList>
                            <MenuItem onClick={() => history.push('/admin/report/custom')}>Archive report</MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Flex mt={6} alignItems="center" justifyContent="space-between">
                <HStack spacing={2} fontSize="sm">
                  <Text color="gray.500">Rows per page</Text>
                  <Select size="xs" w="70px" borderRadius="md">
                    <option>08</option>
                    <option>10</option>
                    <option>20</option>
                  </Select>
                </HStack>

                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.500">Showing 10 out of 100 items</Text>
                  <HStack spacing={1}>
                    <IconButton icon={<FiChevronLeft />} variant="ghost" size="xs" />
                    <Text fontSize="sm">1</Text>
                    <IconButton icon={<FiChevronRight />} variant="ghost" size="xs" />
                  </HStack>
                </HStack>
              </Flex>
            </Box>
          </TabPanel>
          <TabPanel px={0} pt={6}>
            <QuestionBankUsageReport />
          </TabPanel>
          <TabPanel px={0} pt={6} as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <RandomizationIntegrityReport />
          </TabPanel>
          <TabPanel px={0} pt={6}>
            <ProctoringAuditReport />
          </TabPanel>
          <TabPanel px={0} pt={6}>
            <ExaminationPaperMarking />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <ScheduleReportModal isOpen={isScheduleOpen} onClose={onScheduleClose} />
    </AdminMainAreaWrapper>
  );
};

export const ReportListingPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ReportListingPage {...props} />} />;
};

export default ReportListingPage;