import { Box, Flex, Grid, Text, InputGroup, InputLeftElement, Input, Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { Route } from 'react-router-dom';
import { Button, Heading, Select } from '../../../components';
import { FaRegSave, FaFileAlt, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { useQueryParams } from '../../../hooks';
import {
  getStandaloneExaminationParticipants,
} from '../../../services';

const ParticipantsListingPage = () => {
  const examinationId = useQueryParams().get('examination');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectionType, setSelectionType] = useState('department');

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(8);
  const [totalRecords, setTotalRecords] = useState(100);

  const [details, setDetails] = useState({
    loading: false,
    err: null,
  });

  // const handleDelete = async (id) => {
  //   try {
  //     const { message } = await deleteStandaloneExaminationParticipants(id);
  //     toast({
  //       description: capitalizeFirstLetter(message),
  //       position: 'top',
  //       status: 'success',
  //     });
  //     // Refresh the current page after deletion
  //     getParticipants();
  //   } catch (error) {
  //     toast({
  //       description: error.message,
  //       position: 'top',
  //       status: 'error',
  //     });
  //   }
  // };

  const getParticipants = useCallback(async () => {
    setDetails({ loading: true });
    try {
      const params = {
        page: currentPage,
        length: recordsPerPage,
        depsPage: currentPage,
        depsLength: recordsPerPage,
      };

      const { users, departments, pagination } = await getStandaloneExaminationParticipants(
        examinationId,
        params
      );

      setUsers(users || []);
      setDepartments(departments || []);

      if (pagination) {
        setTotalRecords(
          selectionType === 'user'
            ? pagination.users?.totalCount || 0
            : pagination.departments?.totalCount || 0
        );
      } else {
        setTotalRecords(
          selectionType === 'user'
            ? users?.length || 0
            : departments?.length || 0
        );
      }

      setDetails({ loading: false });
    } catch (error) {
      setDetails({ err: error.message });
      setDetails({ loading: false });
    }
  }, [examinationId, currentPage, recordsPerPage, selectionType]);

  useEffect(() => {
    getParticipants();
  }, [getParticipants]);

  const activeRecords = selectionType === 'user' ? users : departments;

  return (
    <Box marginX="22px" marginY="20px">
      <Grid templateColumns="1fr 350px" gap="30px" alignItems="start" marginBottom="30px">

        {/* Left Column: Selection & Controls */}
        <Box>
          <Box backgroundColor="white" padding="30px" borderRadius="8px" shadow="sm">
            <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
              Assessment Participants
            </Heading>

            <Flex justifyContent="space-between" marginBottom="24px">
              <Flex as="label" cursor="pointer" alignItems="center">
                <input
                  type="radio"
                  name="participantType"
                  checked={selectionType === 'department'}
                  onChange={() => setSelectionType('department')}
                  style={{ accentColor: '#6b006b', transform: 'scale(1.5)', marginRight: '10px' }}
                />
                <Text fontWeight="500">Department</Text>
              </Flex>
              <Flex as="label" cursor="pointer" alignItems="center">
                <input
                  type="radio"
                  name="participantType"
                  checked={selectionType === 'user'}
                  onChange={() => setSelectionType('user')}
                  style={{ accentColor: '#6b006b', transform: 'scale(1.5)', marginRight: '10px' }}
                />
                <Text fontWeight="500">User</Text>
              </Flex>
            </Flex>

            {selectionType === 'department' ? (
              <Box>
                <Text fontSize="14px" fontWeight="600" mb="8px" color="#1A202C">Choose department</Text>
                <Select
                  id="departmentSelect"
                  placeholder="Select the department"
                  options={[
                    { label: "Computer Science", value: "cs" },
                    { label: "Mathematics", value: "math" }
                  ]}
                />
              </Box>
            ) : (
              <Box>
                <Text fontSize="14px" fontWeight="600" mb="8px" color="#1A202C">Choose user</Text>
                <Select
                  id="userSelect"
                  placeholder="Select the user"
                  options={[
                    { label: "John Doe", value: "john_doe" },
                    { label: "Jane Smith", value: "jane_smith" }
                  ]}
                />
              </Box>
            )}

          </Box>

          <Flex justifyContent="center" gap="16px" marginTop="24px">
            <Button
              secondary
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap="8px"
              border="1px solid #E2E8F0"
              color="#6b006b"
              _hover={{ bg: "gray.50" }}
            >
              <FaRegSave />
              Save as draft
            </Button>
            <Button
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap="8px"
              style={{ backgroundColor: "#6b006b", color: "white" }}
              _hover={{ bg: "#520052" }}
            >
              <FaFileAlt />
              Next: Publish
            </Button>
          </Flex>
        </Box>

        {/* Right Column: Exam Summary */}
        <Box backgroundColor="white" padding="30px" borderRadius="8px" shadow="sm">
          <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
            Exam Summary
          </Heading>

          <Flex flexDirection="column" gap="16px">
            <Flex justifyContent="space-between" borderBottom="1px solid #E2E8F0" pb="12px">
              <Text color="#A0AEC0">Total Sections</Text>
              <Text fontWeight="700" fontSize="18px">5</Text>
            </Flex>
            <Flex justifyContent="space-between" borderBottom="1px solid #E2E8F0" pb="12px">
              <Text color="#A0AEC0">Total Questions</Text>
              <Text fontWeight="700" fontSize="18px">100</Text>
            </Flex>
            <Flex justifyContent="space-between" borderBottom="1px solid #E2E8F0" pb="12px">
              <Text color="#A0AEC0">Total Score</Text>
              <Text fontWeight="700" fontSize="18px">100</Text>
            </Flex>
            <Flex justifyContent="space-between" pb="12px">
              <Text color="#A0AEC0">Duration</Text>
              <Text fontWeight="700" fontSize="18px">60 mins</Text>
            </Flex>
          </Flex>
        </Box>
      </Grid>

      {/* Table Section */}
      <Box backgroundColor="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
        <Flex justifyContent="space-between" padding="20px" borderBottom="1px solid #E2E8F0">
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
                <Th>S/N</Th>
                {selectionType === 'department' ? (
                  <Th>Department</Th>
                ) : (
                  <>
                    <Th>First Name</Th>
                    <Th>Last Name</Th>
                    <Th>Username</Th>
                    <Th>Email address</Th>
                    <Th>Gender</Th>
                  </>
                )}
                <Th width="100px">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {selectionType === 'department' ? (
                <>
                  <Tr>
                    <Td><input type="checkbox" /></Td>
                    <Td>1</Td>
                    <Td>Computer Science</Td>
                    <Td>
                      <IconButton variant="ghost" icon={<FiMoreVertical />} aria-label="options" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td><input type="checkbox" /></Td>
                    <Td>2</Td>
                    <Td>Average</Td>
                    <Td>
                      <IconButton variant="ghost" icon={<FiMoreVertical />} aria-label="options" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td><input type="checkbox" /></Td>
                    <Td>3</Td>
                    <Td>Poor</Td>
                    <Td>
                      <IconButton variant="ghost" icon={<FiMoreVertical />} aria-label="options" />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td><input type="checkbox" /></Td>
                    <Td>4</Td>
                    <Td>Average</Td>
                    <Td>
                      <IconButton variant="ghost" icon={<FiMoreVertical />} aria-label="options" />
                    </Td>
                  </Tr>
                </>
              ) : (
                <>
                  {[1, 2, 3, 4].map((num) => (
                    <Tr key={num}>
                      <Td><input type="checkbox" /></Td>
                      <Td>{num}</Td>
                      <Td>John</Td>
                      <Td>Doe</Td>
                      <Td>JDoe1</Td>
                      <Td>johndoe@gmail.com</Td>
                      <Td>Male</Td>
                      <Td>
                        <IconButton variant="ghost" icon={<FiMoreVertical />} aria-label="options" />
                      </Td>
                    </Tr>
                  ))}
                </>
              )}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex justifyContent="flex-end" alignItems="center" padding="20px" borderTop="1px solid #E2E8F0" gap="20px">
          <Flex alignItems="center" gap="10px">
            <Text fontSize="14px" color="#4A5568">Rows per page</Text>
            <Select width="80px" size="sm" defaultValue="08" id="rows" options={[{ label: "08", value: "08" }]} />
          </Flex>
          <Text fontSize="14px" fontWeight="600" color="#1A202C">
            Showing 10 out iof 100 items
          </Text>
          <Flex gap="10px">
            <IconButton variant="ghost" size="sm" icon={<FaChevronLeft />} aria-label="Previous page" />
            <Text fontSize="14px" color="#A0AEC0">1</Text>
            <IconButton variant="ghost" size="sm" icon={<FaChevronRight />} aria-label="Next page" />
          </Flex>
        </Flex>

      </Box>
    </Box>
  );
};

export const ParticipantsListingPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ParticipantsListingPage {...props} />}
    />
  );
};

export default ParticipantsListingPageRoute;
