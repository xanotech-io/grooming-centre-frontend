import React from 'react';
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
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
  HStack,
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiMoreVertical, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import colors from '../../../theme/colors';
import { motion } from 'framer-motion';

// --- Mock Data ---

const difficultyData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Easy',
      data: [58, 30, 68, 45, 58, 48, 45, 85, 62, 38, 58, 40],
      backgroundColor: '#D94111', 
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    },
    {
      label: 'Medium',
      data: [75, 45, 25, 30, 42, 28, 60, 75, 45, 50, 38, 60],
      backgroundColor: '#F97316', 
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    },
    {
      label: 'Difficult',
      data: [55, 35, 50, 42, 62, 55, 88, 50, 35, 75, 58, 20],
      backgroundColor: '#FDA4AF', // Light Pink/Peach
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    },
  ],
};

const responseRateData = {
  labels: Array.from({ length: 50 }, (_, i) => i + 1), // Approximate points for the wavy line
  datasets: [
    {
      label: 'Response Rate',
      data: [
        10, 20, 18, 22, 25, 38, 45, 30, 35, 50, 32, 25, 35, 28, 42, 52, 38, 65, 90, 30, 
        35, 50, 48, 42, 38, 52, 40, 42, 58, 55, 62, 15, 25, 25, 22, 18, 45, 42, 48, 45,
        40, 75, 62, 58, 65, 60, 52, 52, 55, 58
      ],
      borderColor: '#9333EA', // Purple
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    },
  ],
};

const tableData = [
  { id: 'Q001', course: 'Introduction to Microfinance', difficulty: 'Easy', time: '45 secs', correct: '65%', used: 3, reliability: 0.45 },
  { id: 'Q001', course: 'Introduction to Microfinance', difficulty: 'Medium', time: '45 secs', correct: '95%', used: 5, reliability: 0.45 },
  { id: 'Q001', course: 'Introduction to Microfinance', difficulty: 'Hard', time: '45 secs', correct: '61%', used: 4, reliability: 0.45 },
  { id: 'Q001', course: 'Introduction to Microfinance', difficulty: 'Hard', time: '45 secs', correct: '25%', used: 5, reliability: 0.45 },
  { id: 'Q001', course: 'Introduction to Microfinance', difficulty: 'Medium', time: '45 secs', correct: '52%', used: 2, reliability: 0.45 },
  { id: 'Q001', course: 'Introduction to Microfinance', difficulty: 'Easy', time: '45 secs', correct: '5%', used: 4, reliability: 0.45 },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle' },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } }, // dashed like
  },
};

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { display: false }, // Hide X axis labels for cleaner look like design
        y: { 
            beginAtZero: true, 
            grid: { display: false },
            ticks: {
                stepSize: 20,
                callback: (val) => val === 0 ? '0%' : val + 'k' // Mock formatting to look like generic scale
            }
        },
    },
};

const QuestionBankUsageReport = () => {
  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Top Stats Section */}
      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
        <Box p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="16px" fontWeight="500" color="#000000" mb={1}>Question Usage Frequency</Text>
          <Text fontSize="26px" fontWeight="700" color="#000000" mb={1}>79</Text>
          <Text fontSize="16px" color="#00A143" fontWeight="500">+5% vs last period</Text>
        </Box>
        <Box p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontSize="16px" fontWeight="500" color="#000000" mb={1}>Correct Response Rate (%)</Text>
          <Text fontSize="26px" fontWeight="700" mb={1}>65%</Text>
          <Text fontSize="16px" color="#00A143" fontWeight="500">-5% vs last period</Text>
        </Box>
        <Box p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
           <Text fontSize="16px" fontWeight="500" color="#000000" mb={4}>Difficulty Distribution</Text>
           <HStack spacing={6} align="baseline">
                <Box>
                    <Text fontSize="26px" fontWeight="700">45%</Text>
                    <Text fontSize="16px" color="#00A143" fontWeight="500">Easy</Text>
                </Box>
                <Box>
                    <Text fontSize="26px" fontWeight="700">25%</Text>
                    <Text fontSize="16px" color="#F59E0B" fontWeight="500">Medium</Text>
                </Box>
                <Box>
                    <Text fontSize="26px" fontWeight="700">30%</Text>
                    <Text fontSize="16px" color="#CC0C0C" fontWeight="500">Difficult</Text>
                </Box>
           </HStack>
        </Box>
      </Grid>

      {/* Charts Section */}
      <VStack spacing={6} mb={8} align="stretch">
        <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontWeight="500" fontSize="20px" color="#000000" mb={6}>Questions by Difficulty Level</Text>
          <Box height="300px">
            <Bar data={difficultyData} options={chartOptions} />
          </Box>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Text fontWeight="500" fontSize="20px" color="#000000" mb={6}>Correct Response Rate</Text>
          <Box height="250px">
             <Line data={responseRateData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { callback: (_, i) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Math.floor(i / 4.2)] || '' } 
                    },
                    y: { 
                        beginAtZero: true, 
                        grid: { borderDash: [5, 5] },
                        max: 100,
                        ticks: { stepSize: 20, callback: (val) => val === 0 ? '0x' : val + 'x' } 
                    }
                },
                elements: {
                    point: { radius: 0 }
                }
             }} />
          </Box>
        </Box>
      </VStack>

      {/* Data Table Section */}
      <Box bg="white" p={3} borderRadius="lg" border="1.5px solid #E4E7EC">
        <Flex mb={6} justifyContent="" alignItems="center" gap={2}>
            <InputGroup maxW="300px" >
                <InputLeftElement pointerEvents="none" size="lg">
                <FiSearch color="gray.300" mb={-2} />
                </InputLeftElement>
                <Input placeholder="Search here..." borderRadius="md" size="sm" />
            </InputGroup>
            <Button leftIcon={<FiFilter />} variant="outline" size="sm" borderRadius="md" fontWeight="500">
                Filter
            </Button>
        </Flex>

        <Table variant="simple" size="sm">
            <Thead bg="gray.50">
                <Tr>
                    <Th><Input type="checkbox" /></Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Question ID</Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Course</Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Difficulty</Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Average Time (secs)</Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Correct (%)</Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Used (Times)</Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Reliability</Th>
                    <Th color="#344054" fontSize="xs" textTransform="none">Action</Th>
                </Tr>
            </Thead>
            <Tbody>
                {tableData.map((row, index) => (
                    <Tr key={index}>
                        <Td><Input type="checkbox" height="40px"/></Td>
                         <Td color="gray.600" fontSize="sm">{row.id}</Td>
                         <Td color="#101928" fontWeight="500" fontSize="sm">{row.course}</Td>
                         <Td fontSize="sm">{row.difficulty}</Td>
                         <Td fontSize="sm">{row.time}</Td>
                         <Td fontSize="sm">{row.correct}</Td>
                         <Td fontSize="sm">{row.used}</Td>
                         <Td fontSize="sm">{row.reliability}</Td>
                         <Td>
                             <Menu>
                                 <MenuButton as={IconButton}  icon={<FiMoreVertical />}
                                  borderColor="#E4E7EC" border="1px"
                                 variant="ghost" size="xs" />
                                 <MenuList>
                                     <MenuItem>Archive report</MenuItem>
                                 </MenuList>
                             </Menu>
                         </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>

         <Flex mt={6} alignItems="center" justifyContent="space-between" px={2}>
            <HStack spacing={2} fontSize="sm">
                <Text color="gray.500">Rows per page</Text>
                <Select size="xs" w="70px" borderRadius="md" defaultValue="08">
                <option value="08">08</option>
                <option value="10">10</option>
                <option value="20">20</option>
                </Select>
            </HStack>
            
            <HStack spacing={4}>
                <Text fontSize="sm" color="gray.500">Showing 10 out of 100 items</Text>
                <HStack spacing={1}>
                <IconButton icon={<FiChevronLeft />} variant="ghost" size="xs" aria-label="Previous Page" />
                <Text fontSize="sm">1</Text>
                <IconButton icon={<FiChevronRight />} variant="ghost" size="xs" aria-label="Next Page" />
                </HStack>
            </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default QuestionBankUsageReport;