import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
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
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiChevronLeft, 
  FiChevronRight,
} from 'react-icons/fi';
import { Route } from 'react-router-dom';
import { AdminMainAreaWrapper } from '../../../layouts';
import { motion } from 'framer-motion';
import ScheduleReportModal from './components/ScheduleReportModal';

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Box bg="white" p={6} borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm">
    <Text fontSize="15px" fontWeight="500" color="#101928" mb={2}>{title}</Text>
    <Text fontSize="28px" fontWeight="700" color="#101928" mb={1}>{value}</Text>
    {subtext && <Text fontSize="14px" fontWeight="500" color={subtextColor || "#12B76A"}>{subtext}</Text>}
  </Box>
);

const AutomatedApprovalWorkflowPage = () => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const tableData = [
    { id: 'WF-0234', type: 'Course Registration', submittedBy: 'John Doe', date: '26/11/2025', role: 'Supervisor', status: 'Approved', resolutionTime: '1' },
    { id: 'WF-0234', type: 'Course Content', submittedBy: 'John Doe', date: '26/11/2025', role: 'Admin 1', status: 'Pending', resolutionTime: '-' },
    { id: 'WF-0234', type: 'Content Submission', submittedBy: 'John Doe', date: '26/11/2025', role: 'Instructor', status: 'Approved', resolutionTime: '3' },
    { id: 'WF-0234', type: 'Profile Update', submittedBy: 'John Doe', date: '26/11/2025', role: 'Supervisor', status: 'Rejected', resolutionTime: '1' },
    { id: 'WF-0234', type: 'Access Request', submittedBy: 'John Doe', date: '26/11/2025', role: 'Admin 2', status: 'Pending', resolutionTime: '-' },
    { id: 'WF-0234', type: 'Course Registration', submittedBy: 'John Doe', date: '26/11/2025', role: 'Instructor', status: 'Rejected', resolutionTime: '2' },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return { bg: '#ECFDF3', color: '#027A48' };
      case 'rejected': return { bg: '#FEF3F2', color: '#B42318' };
      case 'pending': return { bg: '#FFFAEB', color: '#B54708' };
      default: return { bg: '#F2F4F7', color: '#344054' };
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box mb={6} mt={6} as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Flex justify="space-between" align="center" mb={10}>
          <Text fontSize="24px" fontWeight="700" color="#101928">Automated Approval Workflow</Text>
          <HStack spacing={3}>
            <Button variant="outline" borderColor="#660066" color="#660066" h="40px" fontSize="14px" fontWeight="500" onClick={onOpen}>Schedule report</Button>
            <Button bg="#660066" color="white" _hover={{ bg: "#550055" }} h="40px" fontSize="14px" fontWeight="500">Create new filter</Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={5} spacing={4} mb={10}>
          <SummaryCard title="Avg. Approval Time" value="10h" subtext="Per filter" subtextColor="#667085" />
          <SummaryCard title="Completion Rate" value="70%" subtext="+5% vs last month" />
          <SummaryCard title="Pending Approval" value="15" subtext="+5 this week" subtextColor="#F04438" />
          <SummaryCard title="Escalation Frequency" value="80%" subtext="-5% vs last month" />
          <SummaryCard title="User Satisfaction" value="95%" subtext="-5% vs last month" />
        </SimpleGrid>

        <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" boxShadow="xs">
          <Box p={4} borderBottom="1px solid #F2F4F7">
            <Flex justify="" align="center" gap={3}>
                <InputGroup w="400px">
                  <InputLeftElement pointerEvents="none"><FiSearch color="#667085" /></InputLeftElement>
                  <Input placeholder="Search here..." fontSize="14px" borderRadius="md" />
                </InputGroup>
                <Button leftIcon={<FiFilter />} variant="outline" size="md" fontSize="14px" fontWeight="500" color="#344054" borderRadius="md">Filter</Button>
            </Flex>
          </Box>
          
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="#F9FAFB">
                <Tr>
                  <Th w="40px" px={6} py={4}><Checkbox colorScheme="purple" /></Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Workflow ID</Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Request Type</Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Submitted By</Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Submission Date</Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Approval Role</Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Status</Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Resolution Time (h)</Th>
                  <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tableData.map((item, idx) => (
                  <Tr key={idx}>
                    <Td px={6} py={6}><Checkbox colorScheme="purple" /></Td>
                    <Td fontSize="12px" color="#667085">{item.id}</Td>
                    <Td fontSize="12px" color="#101928" fontWeight="500">{item.type}</Td>
                    <Td fontSize="12px" color="#667085">{item.submittedBy}</Td>
                    <Td fontSize="12px" color="#667085">{item.date}</Td>
                    <Td fontSize="12px" color="#667085">{item.role}</Td>
                    <Td><Badge bg={getStatusColor(item.status).bg} color={getStatusColor(item.status).color} borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="500">{item.status}</Badge></Td>
                    <Td fontSize="12px" color="#667085" fontWeight="500">{item.resolutionTime}</Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" color="#98A2B3" border="1px solid #E4E7EC" borderRadius="md" />
                        <MenuList>
                            <MenuItem fontSize="13px">View</MenuItem>
                            <MenuItem fontSize="13px">Archive report</MenuItem>
                        </MenuList>
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
      </Box>
      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export const AutomatedApprovalWorkflowPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AutomatedApprovalWorkflowPage {...props} />} />;
};

export default AutomatedApprovalWorkflowPage;