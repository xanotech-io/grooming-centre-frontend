import React from 'react';
import { Route } from 'react-router-dom';
import {
    Box,
    Flex,
    Grid,
    Text,
    InputGroup,
    InputLeftElement,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Badge,
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select } from '../../../components';

const MOCK_DATA = [
    { id: 'WF-0234', requestType: 'Course Registration', submittedBy: 'John Doe', submissionDate: '26/11/2025', approvalRole: 'Supervisor', status: 'Approved', resolutionTime: '1' },
    { id: 'WF-0234', requestType: 'Course Content', submittedBy: 'John Doe', submissionDate: '26/11/2025', approvalRole: 'Admin 1', status: 'Pending', resolutionTime: '-' },
    { id: 'WF-0234', requestType: 'Content Submission', submittedBy: 'John Doe', submissionDate: '26/11/2025', approvalRole: 'Instructor', status: 'Approved', resolutionTime: '3' },
    { id: 'WF-0234', requestType: 'Profile Update', submittedBy: 'John Doe', submissionDate: '26/11/2025', approvalRole: 'Supervisor', status: 'Rejected', resolutionTime: '1' },
    { id: 'WF-0234', requestType: 'Access Request', submittedBy: 'John Doe', submissionDate: '26/11/2025', approvalRole: 'Admin 2', status: 'Pending', resolutionTime: '-' },
    { id: 'WF-0234', requestType: 'Course Registration', submittedBy: 'John Doe', submissionDate: '26/11/2025', approvalRole: 'Instructor', status: 'Rejected', resolutionTime: '2' },
];

const getStatusBadge = (status) => {
    switch (status) {
        case 'Approved':
            return <Badge bg="#E6F4EA" color="#38A169" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Approved</Badge>;
        case 'Pending':
            return <Badge bg="#FFF5EA" color="#DD6B20" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Pending</Badge>;
        case 'Rejected':
            return <Badge bg="#FED7D7" color="#E53E3E" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Rejected</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

const AutomatedApprovalWorkflow = () => {
    return (
        <Box marginX="22px" marginY="20px">
            {/* Header Section */}
            <Flex justifyContent="space-between" alignItems="center" marginBottom="30px">
                <Heading as="h2" size="lg" color="#1A202C">
                    Automated Approval Workflow
                </Heading>
                <Flex gap="16px">
                    <Button
                        secondary
                        border="1px solid #6b006b"
                        color="#6b006b"
                        bg="transparent"
                        _hover={{ bg: "gray.50" }}
                    >
                        Schedule report
                    </Button>
                    <Button
                        style={{ backgroundColor: "#6b006b", color: "white" }}
                        _hover={{ bg: "#520052" }}
                    >
                        Create new filter
                    </Button>
                </Flex>
            </Flex>

            {/* Stats Cards Section */}
            <Grid templateColumns="repeat(5, 1fr)" gap="20px" marginBottom="30px">
                <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm">
                    <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Avg, Approval Time</Text>
                    <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">10h</Text>
                    <Text fontSize="14px" fontWeight="600" color="#1A202C">Per filter</Text>
                </Box>
                <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm">
                    <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Completion Rate</Text>
                    <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">70%</Text>
                    <Text fontSize="14px" fontWeight="500" color="#38A169">+5% vs last month</Text>
                </Box>
                <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm">
                    <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Pending Approval</Text>
                    <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">15</Text>
                    <Text fontSize="14px" fontWeight="500" color="#E53E3E">+5 this week</Text>
                </Box>
                <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm">
                    <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Escalation Frequency</Text>
                    <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">80%</Text>
                    <Text fontSize="14px" fontWeight="500" color="#38A169">-5% vs last month</Text>
                </Box>
                <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm">
                    <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">User Satisfaction</Text>
                    <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">95%</Text>
                    <Text fontSize="14px" fontWeight="500" color="#38A169">-5% vs last month</Text>
                </Box>
            </Grid>

            {/* Table Section */}
            <Box backgroundColor="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
                <Flex gap="16px" padding="20px" borderBottom="1px solid #E2E8F0">
                    <InputGroup width="300px">
                        <InputLeftElement pointerEvents='none'>
                            <FaSearch color='gray.300' />
                        </InputLeftElement>
                        <Input type='text' placeholder='Search here...' />
                    </InputGroup>

                    <Button variant="outline" leftIcon={<FaFilter />} borderColor="#E2E8F0" color="#4A5568">
                        Filter
                    </Button>
                </Flex>

                <TableContainer>
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th width="50px"><input type="checkbox" /></Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Workflow ID</Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Request Type</Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Submitted By</Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Submission Date</Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Approval Role</Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Status</Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Resolution Time (h)</Th>
                                <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568" width="100px">Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {MOCK_DATA.map((row, idx) => (
                                <Tr key={idx}>
                                    <Td><input type="checkbox" /></Td>
                                    <Td color="#1A202C">{row.id}</Td>
                                    <Td color="#1A202C">{row.requestType}</Td>
                                    <Td color="#1A202C">{row.submittedBy}</Td>
                                    <Td color="#1A202C">{row.submissionDate}</Td>
                                    <Td color="#1A202C">{row.approvalRole}</Td>
                                    <Td>{getStatusBadge(row.status)}</Td>
                                    <Td color="#1A202C">{row.resolutionTime}</Td>
                                    <Td>
                                        <Menu>
                                            <MenuButton
                                                as={IconButton}
                                                aria-label="Options"
                                                icon={<FiMoreVertical />}
                                                variant="outline"
                                                size="sm"
                                                borderRadius="4px"
                                            />
                                            <MenuList minWidth="120px">
                                                <MenuItem>View</MenuItem>
                                                <MenuItem>Archive report</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>

                {/* Pagination Section */}
                <Flex justifyContent="flex-end" alignItems="center" padding="20px" borderTop="1px solid #E2E8F0" gap="20px">
                    <Flex alignItems="center" gap="10px">
                        <Text fontSize="14px" color="#4A5568">Rows per page</Text>
                        <Box width="80px">
                            <Select defaultValue="08" id="rows" options={[{ label: "08", value: "08" }]} />
                        </Box>
                    </Flex>
                    <Text fontSize="14px" fontWeight="600" color="#1A202C">
                        Showing 10 out iof 100 items
                    </Text>
                    <Flex gap="10px">
                        <IconButton variant="ghost" size="sm" icon={<FaChevronLeft />} aria-label="Previous page" />
                        <Text fontSize="14px" color="#A0AEC0" alignSelf="center">1</Text>
                        <IconButton variant="ghost" size="sm" icon={<FaChevronRight />} aria-label="Next page" />
                    </Flex>
                </Flex>

            </Box>
        </Box>
    );
};

export const AutomatedApprovalWorkflowRoute = ({ ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => <AutomatedApprovalWorkflow {...props} />}
        />
    );
};

export default AutomatedApprovalWorkflowRoute;
