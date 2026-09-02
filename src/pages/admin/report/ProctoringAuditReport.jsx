
import { useHistory } from 'react-router-dom';
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Checkbox,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiMoreVertical, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Mock Data
const stats = [
  { label: 'Alerts per 100 Students', value: '1.2', change: '+5% vs last period', changeType: 'increase' },
  { label: 'Violation Frequency (%)', value: '4.2%', change: '-5% vs last period', changeType: 'decrease' },
  { label: 'Average Proctor Response', value: '3.5%', change: '+5% vs last period', changeType: 'increase' },
  { label: 'Flagged Sessions', value: '12', change: '+5 from last exam', changeType: 'increase' },
];

const reportData = [
  {
    id: 1,
    examId: 'MF101 Final Exam',
    studentId: 'John Doe',
    studentCode: '#123345',
    examination: 'Data Privacy Test',
    alerts: 1,
    violation: 0,
    timestamp: '6:00 - 7:00',
    alertType: 'Warning',
    proctor: 'J. Smith',
    remark: 'Follow up needed',
  },
  {
    id: 2,
    examId: 'MF101 Final Exam',
    studentId: 'John Doe',
    studentCode: '#123345',
    examination: 'Data Privacy Test',
    alerts: 2,
    violation: 2,
    timestamp: '6:00 - 7:00',
    alertType: 'Violation',
    proctor: 'J. Smith',
    remark: 'Follow up needed',
  },
  {
    id: 3,
    examId: 'MF101 Final Exam',
    studentId: 'John Doe',
    studentCode: '#123345',
    examination: 'Data Privacy Test',
    alerts: 3,
    violation: 0,
    timestamp: '6:00 - 7:00',
    alertType: 'System Flag',
    proctor: 'J. Smith',
    remark: 'Follow up needed',
  },
  {
    id: 4,
    examId: 'MF101 Final Exam',
    studentId: 'John Doe',
    studentCode: '#123345',
    examination: 'Data Privacy Test',
    alerts: 1,
    violation: 1,
    timestamp: '6:00 - 7:00',
    alertType: 'Violation',
    proctor: 'J. Smith',
    remark: 'Follow up needed',
  },
  {
    id: 5,
    examId: 'MF101 Final Exam',
    studentId: 'John Doe',
    studentCode: '#123345',
    examination: 'Data Privacy Test',
    alerts: 4,
    violation: 0,
    timestamp: '6:00 - 7:00',
    alertType: 'System Flag',
    proctor: 'J. Smith',
    remark: 'Follow up needed',
  },
  {
    id: 6,
    examId: 'MF101 Final Exam',
    studentId: 'John Doe',
    studentCode: '#123345',
    examination: 'Data Privacy Test',
    alerts: 2,
    violation: 1,
    timestamp: '6:00 - 7:00',
    alertType: 'Warning',
    proctor: 'J. Smith',
    remark: 'Follow up needed',
  },
];

const ProctoringAuditReport = () => {
  const history = useHistory();

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Stats Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        {stats.map((stat, index) => (
          <Box key={index} p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
            <Text fontSize="14px" fontWeight="500" color="#101928" mb={2}>
              {stat.label}
            </Text>
            <Text fontSize="28px" fontWeight="700" color="#101928" mb={2}>
              {stat.value}
            </Text>
            <Text
              fontSize="14px"
              fontWeight="500"
              color={stat.changeType === 'increase' ? '#00A143' : stat.label === 'Violation Frequency (%)' ? '#00A143' : '#F04438'}
            >
              {stat.change}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Table Section */}
      <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
        {/* Search and Filter */}
        <Flex mb={6} justify="space-between" align="center" gap={4}>
          <HStack flex={1} maxW="400px">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input placeholder="Search here..." borderRadius="md" bg="white" />
            </InputGroup>
            <Button leftIcon={<FiFilter />} variant="outline" size="sm" px={4} fontWeight="500" borderRadius="md">
              Filter
            </Button>
          </HStack>
        </Flex>

        {/* Table */}
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th px={4} py={3}>
                  <Checkbox size="sm" colorScheme="purple" />
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Exam ID
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Student ID
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Examination
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Alerts
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Violation
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Timestamp
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Alert Type
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Proctor
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Remark
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {reportData.map((row) => (
                <Tr key={row.id}>
                  <Td px={2} py={4}>
                    <Checkbox size="sm" colorScheme="purple" />
                  </Td>
                  <Td px={2} py={4} color="#101928" fontSize="12px" fontWeight="400">
                    {row.examId}
                  </Td>
                  <Td px={4} py={4}>
                    <Box>
                      <Text color="#101928" fontSize="12px" fontWeight="600">
                        {row.studentId}
                      </Text>
                      <Text color="#475367" mt={1} fontSize="12px">
                        {row.studentCode}
                      </Text>
                    </Box>
                  </Td>
                  <Td px={4} py={4} color="#101928" fontSize="12px" fontWeight="500">
                    {row.examination}
                  </Td>
                  <Td px={4} py={4} color="#101928" fontSize="12px" fontWeight="500">
                    {row.alerts}
                  </Td>
                  <Td px={4} py={4} color="#101928" fontSize="12px" fontWeight="500">
                    {row.violation}
                  </Td>
                  <Td px={4} py={4} color="#101928" fontSize="12px" fontWeight="500">
                    {row.timestamp}
                  </Td>
                  <Td px={4} py={4}>
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="12px"
                      fontWeight="600"
                      textTransform="none"
                      bg={
                        row.alertType === 'Warning'
                          ? '#FEF0C7'
                          : row.alertType === 'Violation'
                          ? '#FEE4E2'
                          : '#EEF4FF'
                      }
                      color={
                        row.alertType === 'Warning'
                          ? '#B54708'
                          : row.alertType === 'Violation'
                          ? '#D92D20'
                          : '#3538CD'
                      }
                    >
                      {row.alertType}
                    </Badge>
                  </Td>
                  <Td px={4} py={4} color="#101928" fontSize="13px" fontWeight="500">
                    {row.proctor}
                  </Td>
                  <Td px={4} py={4} color="#101928" fontSize="13px" fontWeight="400">
                    {row.remark}
                  </Td>
                  <Td px={4} py={4}>
                    <Menu>
                      <MenuButton as={IconButton} icon={<FiMoreVertical />} borderColor="#E4E7EC" border="1px" variant="ghost" size="sm" borderRadius="md" />
                      <MenuList>
                        <MenuItem fontSize="14px" onClick={() => history.push('/admin/report/audit-details')}>View</MenuItem>
                        <MenuItem fontSize="14px" onClick={() => history.push('/admin/audit')}>Archive report</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex mt={6} align="center" justify="space-between">
          <HStack spacing={2}>
            <Text color="#475367" fontSize="14px">
              Rows per page
            </Text>
            <Select size="sm" w="70px" borderRadius="md" defaultValue="08">
              <option value="08">08</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </Select>
          </HStack>

          <HStack spacing={4}>
            <Text color="#475367" fontSize="14px">
              Showing 10 out of 100 items
            </Text>
            <HStack spacing={1}>
              <IconButton icon={<FiChevronLeft />} variant="ghost" size="sm" aria-label="Previous Page" />
              <Box px={2}>
                <Text fontSize="14px" fontWeight="600" color="#101928">
                  1
                </Text>
              </Box>
              <IconButton icon={<FiChevronRight />} variant="ghost" size="sm" aria-label="Next Page" />
            </HStack>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default ProctoringAuditReport;