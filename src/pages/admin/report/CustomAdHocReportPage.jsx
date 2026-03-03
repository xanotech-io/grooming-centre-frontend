import React, { useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Checkbox,
  Select,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiChevronDown, 
  FiPlus, 
  FiSave, 
  FiPlay, 
  FiSearch, 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight,
  FiCalendar,
  FiX
} from 'react-icons/fi';
import { Route, useHistory } from 'react-router-dom';
import { AdminMainAreaWrapper } from '../../../layouts';
import ScheduleReportModal from './components/ScheduleReportModal';

const CustomAdHocReportPage = () => {
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [status, setStatus] = useState('Draft'); // 'Draft' or 'Finalized'
  
  const userFields = ['Full name', 'User ID', 'Email address', 'Department'];
  const courseFields = ['Course name', 'Course code', 'Instructor'];
  const enrollmentFields = ['Enrollment date', 'Status', 'Completion date'];

  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} mt={6}>
        <HStack>
          <Text fontSize="28px" color="#101928" fontWeight="700">Custom/AD HOC Reports</Text>
        </HStack>
        <HStack spacing={4}>
          {status === 'Finalized' && (
            <Button variant="outline" borderColor="#660066" borderRadius="md" size="md" fontSize="14px" fontWeight="600" color="#660066" onClick={onOpen}>
              Schedule report
            </Button>
          )}
          <Button bg="#660066" color="white" _hover={{ bg: "#550055" }} borderRadius="md" size="md" fontSize="14px" fontWeight="600">
            Export Report
          </Button>
        </HStack>
      </Flex>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* Main Content Area - Report Info + Split Select/Criteria */}
        <GridItem colSpan={9}>
          <VStack spacing={6} align="stretch">
            {/* Report Information */}
            <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7">
              <Text fontSize="16px" fontWeight="700" color="#101928" mb={5}>Report Information</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="13px" fontWeight="500" color="#344054">Report name</Text>
                  <Input placeholder="Enter the report name" bg="#F0F2F5" border="none" fontSize="13px" h="44px" />
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="13px" fontWeight="500" color="#344054">Description</Text>
                  <Input placeholder="Enter the description" bg="#F0F2F5" border="none" fontSize="13px" h="44px" />
                </VStack>
              </Grid>
            </Box>

            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              {/* Select Field */}
              <GridItem colSpan={4}>
                <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7" minH="500px">
                  <Text fontSize="18px" fontWeight="700" color="#101928" mb={6}>Select field</Text>
                  
                  <VStack align="stretch" spacing={6}>
                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontSize="14px" fontWeight="600" color="#344054">User Data</Text>
                        <Icon as={FiChevronDown} color="gray.400" />
                      </Flex>
                      <VStack align="start" spacing={3} pl={2}>
                        {userFields.map(field => (
                          <Checkbox key={field} colorScheme="purple" size="sm" defaultIsChecked={field === 'Full name'}>
                            <Text fontSize="13px" color="#475367">{field}</Text>
                          </Checkbox>
                        ))}
                      </VStack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontSize="14px" fontWeight="600" color="#344054">Course Information</Text>
                        <Icon as={FiChevronDown} color="gray.400" />
                      </Flex>
                      <VStack align="start" spacing={3} pl={2}>
                        {courseFields.map(field => (
                          <Checkbox key={field} colorScheme="purple" size="sm" defaultIsChecked={field === 'Course name'}>
                            <Text fontSize="13px" color="#475367">{field}</Text>
                          </Checkbox>
                        ))}
                      </VStack>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontSize="14px" fontWeight="600" color="#344054">Enrollment Data</Text>
                        <Icon as={FiChevronDown} color="gray.400" />
                      </Flex>
                      <VStack align="start" spacing={3} pl={2}>
                        {enrollmentFields.map(field => (
                          <Checkbox key={field} colorScheme="purple" size="sm" defaultIsChecked={field === 'Enrollment date'}>
                            <Text fontSize="13px" color="#475367">{field}</Text>
                          </Checkbox>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </GridItem>

              {/* Criteria */}
              <GridItem colSpan={8}>
                <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7" minH="500px">
                  <Text fontSize="18px" fontWeight="700" color="#101928" mb={6}>Criteria</Text>
                  
                  <VStack spacing={5} align="stretch">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Filter field</Text>
                        <Select defaultValue="full_name" bg="#F9FAFB" border="none" fontSize="13px" h="44px">
                          <option value="full_name">Full name</option>
                        </Select>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Name</Text>
                        <Input placeholder="Enter the name" bg="#F9FAFB" border="none" fontSize="13px" h="44px" />
                      </VStack>
                    </Grid>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Filter field</Text>
                        <Select defaultValue="course_name" bg="#F9FAFB" border="none" fontSize="13px" h="44px">
                          <option value="course_name">Course name</option>
                        </Select>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Value</Text>
                        <Input placeholder="Enter course name" bg="#F9FAFB" border="none" fontSize="13px" h="44px" />
                      </VStack>
                    </Grid>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Filter field</Text>
                        <Select defaultValue="enrollment_date" bg="#F9FAFB" border="none" fontSize="13px" h="44px">
                          <option value="enrollment_date">Enrollment date</option>
                        </Select>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Value</Text>
                        <HStack bg="#F9FAFB" w="100%" borderRadius="md" px={3} h="44px" justify="space-between">
                          <Text fontSize="13px" color="gray.400">dd/mm/yy - dd/mm/yy</Text>
                          <Icon as={FiCalendar} color="gray.400" />
                        </HStack>
                      </VStack>
                    </Grid>

                    <HStack color="#660066" cursor="pointer" spacing={2} fontWeight="600" fontSize="14px" mt={2}>
                      <Icon as={FiPlus} />
                      <Text>Add new filter</Text>
                    </HStack>
                  </VStack>

                  <Flex justify="flex-end" mt={10} gap={4}>
                    <Button leftIcon={<FiSave />} variant="outline" color="#344054" borderColor="#D0D5DD" fontSize="14px" fontWeight="600" h="44px">
                      Save template
                    </Button>
                    <Button leftIcon={<FiPlay />} bg="#660066" color="white" _hover={{ bg: "#550055" }} fontSize="14px" fontWeight="600" h="44px" onClick={() => history.push('/admin/report/electronic-registers')}>
                      Generate report
                    </Button>
                  </Flex>
                </Box>
              </GridItem>
            </Grid>
          </VStack>
        </GridItem>

        {/* Right Sidebar - Report Settings */}
        <GridItem colSpan={3}>
          <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7" minH="500px">
            <Text fontSize="16px" fontWeight="700" color="#101928" mb={6}>Report Settings</Text>
            
            <VStack align="stretch" spacing={6}>
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={3}>Status</Text>
                <Flex align="center">
                    <HStack spacing={2}>
                      <Box w={2} h={2} borderRadius="full" bg={status === 'Draft' ? "#F79009" : "#12B76A"} />
                      <Text fontSize="14px" fontWeight="500" color="#101928">{status}</Text>
                    </HStack>
                  <Spacer />
                  <Text fontSize="10px" color="#98A2B3">Last saved: 2 min ago</Text>
                </Flex>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={3}>Access level</Text>
                <Select size="md" borderRadius="md" bg="#F9FAFB" border="none" fontSize="13px" mb={3}>
                  <option>Admin</option>
                  <option>HR</option>
                </Select>
                <VStack align="start" spacing={3} pl={2}>
                  <Checkbox colorScheme="purple" size="sm" isChecked>
                    <Text fontSize="12px" color="#475367">Admin</Text>
                  </Checkbox>
                  <Checkbox colorScheme="purple" size="sm">
                    <Text fontSize="12px" color="#475367">HR</Text>
                  </Checkbox>
                  <Checkbox colorScheme="purple" size="sm">
                    <Text fontSize="12px" color="#475367">Admin 2</Text>
                  </Checkbox>
                </VStack>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={3}>Export format</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <Button variant="solid" bg="#660066" color="white" h="32px" fontSize="11px">Excel</Button>
                  <Button variant="outline" borderColor="#F2F4F7" bg="#F9FAFB" h="32px" fontSize="11px" color="#344054">PDF</Button>
                  <Button variant="outline" borderColor="#F2F4F7" bg="#F9FAFB" h="32px" fontSize="11px" color="#344054">CSV</Button>
                  <Button variant="outline" borderColor="#F2F4F7" bg="#F9FAFB" h="32px" fontSize="11px" color="#344054">JSON</Button>
                </Grid>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Share with</Text>
                <Input placeholder="@username" bg="#F9FAFB" border="none" fontSize="12px" h="44px" mb={3} />
                <HStack spacing={2} wrap="wrap">
                  {status === 'Finalized' ? (
                    ['@johndoe', '@samuel', '@mercy'].map(user => (
                      <HStack key={user} bg="transparent" border="none" spacing={1} align="center">
                        <Text fontSize="12px" fontWeight="500" color="#101928">{user}</Text>
                        <Icon as={FiX} w={3} h={3} cursor="pointer" color="#667085" />
                      </HStack>
                    ))
                  ) : (
                    <Text fontSize="12px" color="#101928">@username</Text>
                  )}
                </HStack>
              </Box>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {setStatus("")}

      {/* Results Table - Only shown in Finalized state */}
      {status === 'Finalized' && (
        <Box mt={8}>
          <Box bg="white" borderRadius="xl" border="1.5px solid #F2F4F7" overflow="hidden">
            <Box p={4}>
              <Flex mb={6} justify="space-between" align="center">
                <HStack spacing={4}>
                  <InputGroup maxW="350px">
                    <InputLeftElement pointerEvents="none" h="100%">
                      <FiSearch color="#667085" />
                    </InputLeftElement>
                    <Input placeholder="Search here..." bg="white" border="1px solid #E4E7EC" borderRadius="md" h="44px" />
                  </InputGroup>
                  <Button leftIcon={<FiFilter />} variant="outline" borderColor="#E4E7EC" h="44px" borderRadius="md" color="#344054" fontWeight="500">Filter</Button>
                </HStack>
              </Flex>
            </Box>

            <Table variant="simple" size="sm">
              <Thead bg="white">
                <Tr borderBottom="1px solid #F2F4F7">
                  <Th px={6} py={4}>
                    <Checkbox colorScheme="purple" borderColor="#D0D5DD" />
                  </Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Name</Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Course Code</Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Enrollment Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {[1, 2, 3].map((item) => (
                  <Tr key={item} borderBottom="1px solid #F2F4F7">
                    <Td px={6} py={5}>
                      <Checkbox colorScheme="purple" borderColor="#D0D5DD" />
                    </Td>
                    <Td fontSize="14px" fontWeight="500" color="#101928" px={4} py={5}>John Doe</Td>
                    <Td fontSize="14px" color="#475367" px={4} py={5}>Microfinance Basics</Td>
                    <Td fontSize="14px" color="#475367" px={4} py={5}>26/11/2025 - 26/12/2025</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Box p={4}>
              <Flex mt={4} align="center" justify="space-between">
                <HStack spacing={2}>
                  <Text color="#475367" fontSize="14px">Rows per page</Text>
                  <Select size="sm" w="70px" borderRadius="md" defaultValue="08" borderColor="#E4E7EC">
                    <option value="08">08</option>
                    <option value="10">10</option>
                  </Select>
                </HStack>

                <HStack spacing={6}>
                  <Text fontSize="14px" color="#475367">Showing 10 out of 100 items</Text>
                  <HStack spacing={2}>
                    <IconButton icon={<FiChevronLeft />} variant="ghost" size="sm" color="#667085" />
                    <Text fontSize="14px" fontWeight="600" color="#101928">1</Text>
                    <IconButton icon={<FiChevronRight />} variant="ghost" size="sm" color="#667085" />
                  </HStack>
                </HStack>
              </Flex>
            </Box>
          </Box>
        </Box>
      )}
      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export const CustomAdHocReportPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <CustomAdHocReportPage {...props} />} />;
};

export default CustomAdHocReportPage;