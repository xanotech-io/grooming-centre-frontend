// import React from 'react';
// import { Route } from 'react-router-dom';
// import {
//   Box,
//   Flex,
//   Text,
//   InputGroup,
//   InputLeftElement,
//   Input,
//   Button,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   TableContainer,
//   Checkbox,
//   IconButton,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   FormControl,
//   FormLabel,
//   Select
// } from '@chakra-ui/react';
// import { FaSearch, FaFilter, FaChevronDown, FaSortAmountDown, FaEllipsisV } from 'react-icons/fa';
// import { AdminMainAreaWrapper } from '../../layouts/admin/MainArea/Wrapper';
// import { adminGetRoleListing } from '../../services';
// import { useTableRows } from '../../hooks';

// const RolesPage = () => {
//   const mapRoleToRow = (role) => {
//     return {
//       id: role?.id,
//       roleId: role?.roleId || `RL-00${role.id}`, // Formatting if role ID is empty
//       name: role?.name,
//       noOfUsers: role?.noOfUsers,
//       date: role?.date || "",
//       accessLevel: role?.accessLevel || "",
//     };
//   };

//   const fetcher = () => async () => {
//     try {
//       const { roles } = await adminGetRoleListing();
//       const mappedRows = roles.map(mapRoleToRow);
//       return { rows: mappedRows };
//     } catch (error) {
//       return { rows: [] };
//     }
//   };

//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const { rows } = useTableRows(fetcher);
//   const displayRows = rows?.data?.rows || [];

//   return (
//     <AdminMainAreaWrapper>
//       {/* Header Area */}
//       <Flex justifyContent="space-between" alignItems="center" mb={6} mt={6}>
//         <Text fontSize="24px" fontWeight="600" color="#1A202C">
//           Roles
//         </Text>
//         <Button
//           bg="#6B006B"
//           color="white"
//           _hover={{ bg: "#520052" }}
//           borderRadius="6px"
//           fontWeight="500"
//           px={6}
//           onClick={onOpen}
//         >
//           Assign new role
//         </Button>
//       </Flex>

//       {/* Main Table Card Wrapper */}
//       <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">

//         {/* Search & Filter Toolbar */}
//         <Flex justifyContent="space-between" alignItems="center" p={4} borderBottom="1px solid #E2E8F0" flexWrap="wrap" gap={4}>
//           {/* Left Actions */}
//           <Flex gap={3} flex="1">
//             <InputGroup maxW="300px">
//               <InputLeftElement pointerEvents="none" color="#A0AEC0">
//                 <FaSearch size="14px" />
//               </InputLeftElement>
//               <Input
//                 placeholder="Search here..."
//                 fontSize="14px"
//                 borderRadius="6px"
//                 border="1px solid #E2E8F0"
//                 _focus={{ borderColor: "#6b006b", boxShadow: "none" }}
//               />
//             </InputGroup>
//             <Button
//               leftIcon={<FaFilter color="#4A5568" />}
//               variant="outline"
//               borderColor="#E2E8F0"
//               color="#4A5568"
//               fontSize="14px"
//               fontWeight="500"
//               bg="white"
//               px={5}
//             >
//               Filter
//             </Button>
//           </Flex>

//           {/* Right Actions */}
//           <Flex gap={3}>
//             <Button
//               rightIcon={<FaChevronDown color="#4A5568" size="12px" />}
//               variant="outline"
//               borderColor="#E2E8F0"
//               color="#4A5568"
//               fontSize="14px"
//               fontWeight="500"
//               bg="white"
//             >
//               Departments
//             </Button>
//             <Button
//               leftIcon={<FaSortAmountDown color="#4A5568" />}
//               variant="outline"
//               borderColor="#E2E8F0"
//               color="#4A5568"
//               fontSize="14px"
//               fontWeight="500"
//               bg="white"
//             >
//               Sort
//             </Button>
//           </Flex>
//         </Flex>

//         {/* Data Table */}
//         <TableContainer>
//           <Table variant="simple">
//             <Thead bg="#F7FAFC">
//               <Tr>
//                 <Th width="40px" pl={6} py={4} borderBottom="1px solid #E2E8F0">
//                   <Checkbox colorScheme="purple" borderColor="#CBD5E0" />
//                 </Th>
//                 <Th color="#4A5568" fontSize="13px" fontWeight="500" textTransform="none" borderBottom="1px solid #E2E8F0">Role ID</Th>
//                 <Th color="#4A5568" fontSize="13px" fontWeight="500" textTransform="none" borderBottom="1px solid #E2E8F0">Role Title</Th>
//                 <Th color="#4A5568" fontSize="13px" fontWeight="500" textTransform="none" borderBottom="1px solid #E2E8F0">Number of Users</Th>
//                 <Th color="#4A5568" fontSize="13px" fontWeight="500" textTransform="none" borderBottom="1px solid #E2E8F0">Date</Th>
//                 <Th color="#4A5568" fontSize="13px" fontWeight="500" textTransform="none" borderBottom="1px solid #E2E8F0">Access Level</Th>
//                 <Th color="#4A5568" fontSize="13px" fontWeight="500" textTransform="none" textAlign="center" borderBottom="1px solid #E2E8F0">Action</Th>
//               </Tr>
//             </Thead>
//             <Tbody>
//               {displayRows.map((row) => (
//                 <Tr key={row.id} _hover={{ bg: "#F8FAFC" }}>
//                   <Td pl={6} py={4} borderBottom="1px solid #E2E8F0">
//                     <Checkbox colorScheme="purple" borderColor="#CBD5E0" />
//                   </Td>
//                   <Td color="#4A5568" fontSize="14px" borderBottom="1px solid #E2E8F0">
//                     {row?.roleId}
//                   </Td>
//                   <Td color="#1A202C" fontSize="14px" fontWeight="500" borderBottom="1px solid #E2E8F0">
//                     {row?.name}
//                   </Td>
//                   <Td color="#1A202C" fontSize="14px" borderBottom="1px solid #E2E8F0">
//                     {row?.noOfUsers}
//                   </Td>
//                   <Td color="#4A5568" fontSize="14px" borderBottom="1px solid #E2E8F0">
//                     {/* {row?.date} */}date
//                   </Td>
//                   <Td color="#4A5568" fontSize="14px" borderBottom="1px solid #E2E8F0">
//                     {/* {row?.accessLevel} */} access level
//                   </Td>
//                   <Td textAlign="center" borderBottom="1px solid #E2E8F0">
//                     <Menu placement="bottom-end">
//                       <MenuButton
//                         as={IconButton}
//                         icon={<FaEllipsisV color="#A0AEC0" />}
//                         variant="outline"
//                         size="sm"
//                         borderRadius="6px"
//                         borderColor="#E2E8F0"
//                       />
//                       <MenuList>
//                         <MenuItem>Edit</MenuItem>
//                         <MenuItem color="red.500">Delete</MenuItem>
//                       </MenuList>
//                     </Menu>
//                   </Td>
//                 </Tr>
//               ))}
//             </Tbody>
//           </Table>
//         </TableContainer>

//       </Box>

//       {/* Assign New Role Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
//         <ModalOverlay />
//         <ModalContent borderRadius="10px">
//           <ModalHeader fontSize="20px" fontWeight="600" color="#1A202C" pb={2}>
//             Assign New Role
//           </ModalHeader>
//           <ModalCloseButton mt={2} />

//           <ModalBody pb={6}>
//             <FormControl mb={5}>
//               <FormLabel fontSize="14px" fontWeight="500" color="#1A202C">Role</FormLabel>
//               <Select
//                 placeholder="Select role"
//                 bg="#F4F5F7"
//                 border="1px solid #E2E8F0"
//                 borderRadius="6px"
//                 height="40px"
//                 fontSize="14px"
//                 _hover={{ borderColor: "#CBD5E0" }}
//                 _focus={{ borderColor: "#6B006B", boxShadow: "none" }}
//               >
//                 <option value="admin">Admin</option>
//                 <option value="instructor">Instructor</option>
//                 <option value="student">Student</option>
//               </Select>
//             </FormControl>

//             <FormControl mb={5}>
//               <FormLabel fontSize="14px" fontWeight="500" color="#1A202C">User</FormLabel>
//               <Select
//                 placeholder="Select User"
//                 bg="#F4F5F7"
//                 border="1px solid #E2E8F0"
//                 borderRadius="6px"
//                 height="40px"
//                 fontSize="14px"
//                 _hover={{ borderColor: "#CBD5E0" }}
//                 _focus={{ borderColor: "#6B006B", boxShadow: "none" }}
//               >
//                 <option value="user1">User 1</option>
//                 <option value="user2">User 2</option>
//               </Select>
//             </FormControl>

//             <FormControl mb={2}>
//               <FormLabel fontSize="14px" fontWeight="500" color="#1A202C">Access Level</FormLabel>
//               <Select
//                 placeholder="Select access level"
//                 bg="#F4F5F7"
//                 border="1px solid #E2E8F0"
//                 borderRadius="6px"
//                 height="40px"
//                 fontSize="14px"
//                 _hover={{ borderColor: "#CBD5E0" }}
//                 _focus={{ borderColor: "#6B006B", boxShadow: "none" }}
//               >
//                 <option value="read">Read</option>
//                 <option value="write">Write</option>
//                 <option value="full">Full Access</option>
//               </Select>
//             </FormControl>
//           </ModalBody>

//           <ModalFooter display="flex" justifyContent="space-between" gap={4} pt={0} pb={6}>
//             <Button
//               variant="outline"
//               borderColor="#E53E3E"
//               color="#E53E3E"
//               flex="1"
//               borderRadius="6px"
//               fontWeight="500"
//               onClick={onClose}
//               _hover={{ bg: "red.50" }}
//             >
//               Cancel
//             </Button>
//             <Button
//               bg="#6B006B"
//               color="white"
//               flex="1"
//               borderRadius="6px"
//               fontWeight="500"
//               _hover={{ bg: "#520052" }}
//             >
//               Assign role
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </AdminMainAreaWrapper>
//   );
// };

// export const RolesPageRoute = ({ ...rest }) => {
//   return <Route {...rest} render={(props) => <RolesPage {...props} />} />;
// };

// export default RolesPageRoute;


import { BreadcrumbItem } from '@chakra-ui/breadcrumb';
import { Box } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import { Breadcrumb, Heading, Link, Table } from '../../components';
import { useTableRows } from '../../hooks';
import { AdminMainAreaWrapper } from '../../layouts/admin/MainArea/Wrapper';
import { adminGetRoleListing } from '../../services';

const tableProps = {
  filterControls: [],

  columns: [
    {
      id: '2',
      key: 'name',
      text: 'Title',
      fraction: '1fr',
    },
    {
      id: '4',
      key: 'noOfUsers',
      text: 'No users',
      fraction: '150px',
    },
  ],

  options: {
    // action: false,
    selection: true,
  },
  pagination: true,
};

const RolesPage = () => {
  const mapRoleToRow = (role) => ({
    id: role.id,
    name: role.name,
    noOfUsers: role.noOfUsers,
  });

  const fetcher = () => async () => {
    const { roles } = await adminGetRoleListing();

    const rows = roles.map(mapRoleToRow);

    return { rows };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Roles</Link>
          </BreadcrumbItem>
        }
      />
      <Box padding={10} marginY={10} border="1px" borderColor="accent.9">
        <Heading fontSize="heading.h4" paddingBottom={4}>
          Roles
        </Heading>

        <Table
          width="100%"
          SearchBarVisibility="none"
          {...tableProps}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
        />
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const RolesPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <RolesPage {...props} />} />;
};