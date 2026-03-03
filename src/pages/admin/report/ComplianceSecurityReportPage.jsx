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
  Badge,
  Checkbox,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiMoreVertical, FiChevronLeft, FiChevronRight, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Route, useHistory } from 'react-router-dom';
import { AdminMainAreaWrapper } from '../../../layouts';
import ScheduleReportModal from './components/ScheduleReportModal';

// Mock Data
const stats = [
  { label: 'Total Events Logged', value: '340', change: '+5% vs last period', changeType: 'increase' },
  { label: 'Unauthorized Access Attempts', value: '82%', change: '+5% vs last month', changeType: 'increase' },
  { label: 'Administrative Actions', value: '45', subtext: 'per role', change: '', changeType: '' },
  { label: 'Failed Login Count', value: '45', subtext: 'logins/week', change: '', changeType: '' },
];

const auditData = [
  {
    eventId: 'EVT-00122',
    user: 'John Doe',
    role: 'Learner',
    action: 'Added User',
    module: 'LMS',
    date: '26/11/2025',
    time: '11:30am',
    ip: '10.10.1.23',
    status: 'Failed',
  },
  {
    eventId: 'EVT-00122',
    user: 'Admin 1',
    role: 'Admin',
    action: 'Login Attempt',
    module: 'OES',
    date: '26/11/2025',
    time: '11:30am',
    ip: '10.10.1.23',
    status: 'Success',
  },
  {
    eventId: 'EVT-00122',
    user: 'John Doe',
    role: 'Learner',
    action: 'Export Report',
    module: 'OES',
    date: '26/11/2025',
    time: '11:30am',
    ip: '10.10.1.23',
    status: 'Success',
  },
  {
    eventId: 'EVT-00122',
    user: 'Jane Smith',
    role: 'Instructor',
    action: 'Login Attempt',
    module: 'Admin',
    date: '26/11/2025',
    time: '11:30am',
    ip: '10.10.1.23',
    status: 'Failed',
  },
  {
    eventId: 'EVT-00122',
    user: 'Admin 1',
    role: 'Admin',
    action: 'Added User',
    module: 'Security',
    date: '26/11/2025',
    time: '11:30am',
    ip: '10.10.1.23',
    status: 'Success',
  },
  {
    eventId: 'EVT-00122',
    user: 'Jane Smith',
    role: 'Instructor',
    action: 'Export Report',
    module: 'OES',
    date: '26/11/2025',
    time: '11:30am',
    ip: '10.10.1.23',
    status: 'Failed',
  },
];

const ComplianceSecurityReportPage = () => {
  const history = useHistory();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} mt={6}>
        <HStack>
          <Text fontSize="28px" color="#101928" fontWeight="700">Compliance & Security Reports</Text>
          <Icon as={FiChevronDown} />
        </HStack>
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
          <Button bg="#660066" color="white" _hover={{ bg: "#550055" }} borderRadius="md" size="md" fontSize="16px" fontWeight="600">
            Export Report
          </Button>
        </HStack>
      </Flex>

      {/* Tab Indicator */}
      <Box mb={8} borderBottom="1.5px solid #D5D7DA">
        <Text
          display="inline-block"
          pb={3}
          px={0}
          fontSize="14px"
          fontWeight="600"
          color="#660066"
          borderBottom="2px solid #660066"
        >
          Audit Trail Report
        </Text>
      </Box>

      {/* Stats Cards */}
      <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
          {stats.map((stat, index) => (
            <Box key={index} p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="xs">
              <Text fontSize="13px" fontWeight="500" color="#101928" mb={2}>
                {stat.label}
              </Text>
              <Text fontSize="28px" fontWeight="700" color="#101928" mb={1}>
                {stat.value}
              </Text>
              {stat.subtext && (
                <Text fontSize="12px" color="#667085" fontWeight="400">
                  {stat.subtext}
                </Text>
              )}
              {stat.change && (
                <Text fontSize="12px" fontWeight="500" color={stat.changeType === 'increase' ? '#00A143' : '#F04438'}>
                  {stat.change}
                </Text>
              )}
            </Box>
          ))}
        </Grid>

        {/* Table Section */}
        <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="xs">
          {/* Toolbar */}
          <Flex mb={6} justify="space-between" align="center">
            <HStack spacing={2} flex={1} maxW="500px">
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

            <Button
              leftIcon={<FiCalendar />}
              rightIcon={<FiChevronDown />}
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

          {/* Table */}
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th px={4} py={3}>
                    <Checkbox size="sm" colorScheme="purple" />
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    Event ID
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    User
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    Role
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    Action
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    Module
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    Date and Time
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    IP Address
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    Status
                  </Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {auditData.map((row, idx) => (
                  <Tr key={idx}>
                    <Td px={4} py={4}>
                      <Checkbox size="sm" colorScheme="purple" />
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.eventId}
                    </Td>
                    <Td px={4} py={4} color="#101928" fontSize="12px" fontWeight="500">
                      {row.user}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.role}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.action}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.module}
                    </Td>
                    <Td px={4} py={4}>
                      <Box>
                        <Text color="#101928" fontSize="12px" fontWeight="500">{row.date}</Text>
                        <Text color="#667085" fontSize="11px">{row.time}</Text>
                      </Box>
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.ip}
                    </Td>
                    <Td px={4} py={4}>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                        bg={row.status === 'Success' ? '#ECFDF3' : '#FEE4E2'}
                        color={row.status === 'Success' ? '#027A48' : '#D92D20'}
                      >
                        {row.status}
                      </Badge>
                    </Td>
                    <Td px={4} py={4}>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} borderColor="#E4E7EC" border="1px" variant="ghost" size="sm" borderRadius="md" />
                        <MenuList>
                          <MenuItem fontSize="14px" onClick={() => history.push('/admin/report/custom')}>Archive report</MenuItem>
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
      <ScheduleReportModal isOpen={isScheduleOpen} onClose={onScheduleClose} />
    </AdminMainAreaWrapper>
  );
};

export const ComplianceSecurityReportPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ComplianceSecurityReportPage {...props} />} />;
};

export default ComplianceSecurityReportPage;