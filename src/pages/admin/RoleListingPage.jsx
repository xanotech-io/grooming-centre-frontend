import { BreadcrumbItem } from '@chakra-ui/breadcrumb';
import { Box, Flex } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import {
  Badge,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Switch,
  Spinner,
} from '@chakra-ui/react';
import { Breadcrumb, Button, Heading, Link } from '../../components';
import { AdminMainAreaWrapper } from '../../layouts/admin/MainArea/Wrapper';
import { FiMoreVertical } from 'react-icons/fi';
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  adminAssignRoleToUser,
  adminCreateRole,
  adminDeleteRole,
  adminGetRoleAssignments,
  adminGetRoleListing,
  adminUpdateRole,
  adminUpdateRolePermissions,
} from '../../services';

const ROLE_TYPE_OPTIONS = ['ADMIN', 'INSTRUCTOR', 'STUDENT', 'SUPERVISOR', 'ACADEMIC_ADMIN'];
const ACCESS_LEVEL_OPTIONS = ['READ', 'WRITE', 'FULL_ACCESS'];

const initialRoleForm = {
  roleName: '',
  description: '',
  roleType: 'INSTRUCTOR',
  accessLevel: 'WRITE',
  permissionsText: 'COURSE_VIEW',
  isActive: true,
};

const initialAssignmentForm = {
  userId: '',
  userName: '',
  userEmail: '',
  roleId: '',
  accessLevel: 'WRITE',
};

const RolesPage = () => {
  const toast = useToast();
  const roleModal = useDisclosure();
  const assignmentModal = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState('ALL');
  const [roleForm, setRoleForm] = useState(initialRoleForm);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);

  const loadRoleData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesResponse, assignmentsResponse] = await Promise.all([
        adminGetRoleListing(),
        adminGetRoleAssignments({ page: 1, limit: 500 }),
      ]);

      setRoles(rolesResponse.roles || []);
      setAssignmentCount(assignmentsResponse.count || 0);
    } catch (error) {
      toast({
        title: error.message || 'Failed to load roles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRoleData();
  }, [loadRoleData]);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch = !searchTerm
        || role.name.toLowerCase().includes(searchTerm.toLowerCase())
        || role.roleId.toLowerCase().includes(searchTerm.toLowerCase())
        || role.assignedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = roleTypeFilter === 'ALL' || role.roleType === roleTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [roles, searchTerm, roleTypeFilter]);

  const totalUsers = useMemo(
    () => roles.reduce((total, role) => total + Number(role.noOfUsers || 0), 0),
    [roles],
  );

  const activeRoles = useMemo(
    () => roles.filter((role) => role.status === 'Active').length,
    [roles],
  );

  const resetRoleForm = () => {
    setRoleForm(initialRoleForm);
    setSelectedRole(null);
  };

  const openCreateRole = () => {
    resetRoleForm();
    roleModal.onOpen();
  };

  const openEditRole = (role) => {
    setSelectedRole(role);
    setRoleForm({
      roleName: role.name,
      description: role.description || '',
      roleType: role.roleType || 'INSTRUCTOR',
      accessLevel: role.accessLevel || 'WRITE',
      permissionsText: Array.isArray(role.permissions) ? role.permissions.join(', ') : '',
      isActive: role.status === 'Active',
    });
    roleModal.onOpen();
  };

  const handleRoleSubmit = async () => {
    const permissions = roleForm.permissionsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!roleForm.roleName.trim()) {
      toast({
        title: 'Role name is required',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      if (selectedRole) {
        await adminUpdateRole(selectedRole.roleId, {
          roleName: roleForm.roleName,
          description: roleForm.description,
          roleType: roleForm.roleType,
          accessLevel: roleForm.accessLevel,
          isActive: roleForm.isActive,
        });

        await adminUpdateRolePermissions(selectedRole.roleId, {
          permissions,
          action: 'REPLACE',
        });

        toast({
          title: 'Role updated successfully',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      } else {
        await adminCreateRole({
          roleName: roleForm.roleName,
          description: roleForm.description,
          roleType: roleForm.roleType,
          accessLevel: roleForm.accessLevel,
          permissions,
          isActive: roleForm.isActive,
        });
        toast({
          title: 'Role created successfully',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      }

      roleModal.onClose();
      resetRoleForm();
      await loadRoleData();
    } catch (error) {
      toast({
        title: error.message || 'Unable to save role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await adminDeleteRole(roleId);
      toast({
        title: 'Role deleted successfully',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      await loadRoleData();
    } catch (error) {
      toast({
        title: error.message || 'Unable to delete role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAssignRole = async () => {
    if (!assignmentForm.userId.trim() || !assignmentForm.roleId) {
      toast({
        title: 'User ID and role are required',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      await adminAssignRoleToUser(assignmentForm.userId.trim(), {
        userName: assignmentForm.userName,
        userEmail: assignmentForm.userEmail,
        roleId: assignmentForm.roleId,
        accessLevel: assignmentForm.accessLevel,
      });

      toast({
        title: 'Role assigned to user successfully',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });

      assignmentModal.onClose();
      setAssignmentForm(initialAssignmentForm);
      await loadRoleData();
    } catch (error) {
      toast({
        title: error.message || 'Unable to assign role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Roles</Link>
          </BreadcrumbItem>
        }
      />

      <Flex justifyContent="space-between" alignItems="center" mt={6} mb={4}>
        <Heading fontSize="heading.h4">Role Management</Heading>
        <Flex gap={3}>
          <Button secondary onClick={assignmentModal.onOpen}>Assign new role</Button>
          <Button onClick={openCreateRole}>Create role</Button>
        </Flex>
      </Flex>

      <Flex gap={4} mb={5} wrap="wrap">
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" px={4} py={3} minW="220px">
          <Text fontSize="12px" color="#718096">Total Roles</Text>
          <Text fontSize="20px" fontWeight="600" color="#1A202C">{roles.length}</Text>
        </Box>
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" px={4} py={3} minW="220px">
          <Text fontSize="12px" color="#718096">Active Roles</Text>
          <Text fontSize="20px" fontWeight="600" color="#1A202C">{activeRoles}</Text>
        </Box>
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" px={4} py={3} minW="220px">
          <Text fontSize="12px" color="#718096">Role Assignments</Text>
          <Text fontSize="20px" fontWeight="600" color="#1A202C">{assignmentCount}</Text>
        </Box>
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" px={4} py={3} minW="220px">
          <Text fontSize="12px" color="#718096">Users With Roles</Text>
          <Text fontSize="20px" fontWeight="600" color="#1A202C">{totalUsers}</Text>
        </Box>
      </Flex>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
        <Flex p={4} borderBottom="1px solid #E2E8F0" gap={3} wrap="wrap">
          <Input
            maxW="320px"
            placeholder="Search role name, id, assigned by"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Select
            maxW="220px"
            value={roleTypeFilter}
            onChange={(event) => setRoleTypeFilter(event.target.value)}
          >
            <option value="ALL">All Role Types</option>
            {ROLE_TYPE_OPTIONS.map((roleType) => (
              <option key={roleType} value={roleType}>{roleType}</option>
            ))}
          </Select>
          {/* <Button secondary onClick={loadRoleData}>Refresh</Button> */}
        </Flex>

        {loading ? (
          <Flex justifyContent="center" alignItems="center" minH="240px" direction="column" gap={3}>
            <Spinner />
            <Text color="#4A5568">Loading roles...</Text>
          </Flex>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead bg="#F7FAFC">
                <Tr>
                  <Th textTransform="none">Role ID</Th>
                  <Th textTransform="none">Role Name</Th>
                  <Th textTransform="none">Role Type</Th>
                  <Th textTransform="none">Access Level</Th>
                  <Th textTransform="none">Assigned By</Th>
                  <Th textTransform="none">No. Users</Th>
                  <Th textTransform="none">Status</Th>
                  <Th textTransform="none" textAlign="center">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRoles.map((role) => (
                  <Tr key={role.roleId}>
                    <Td>{role.roleId}</Td>
                    <Td>
                      <Text fontWeight="600">{role.name}</Text>
                      {role.description ? (
                        <Text fontSize="12px" color="#718096">{role.description}</Text>
                      ) : null}
                    </Td>
                    <Td>{role.roleType}</Td>
                    <Td>{role.accessLevel}</Td>
                    <Td>{role.assignedBy}</Td>
                    <Td>{role.noOfUsers}</Td>
                    <Td>
                      <Badge
                        colorScheme={role.status === 'Active' ? 'green' : 'red'}
                        textTransform="none"
                      >
                        {role.status}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <Menu placement="bottom-end">
                        <MenuButton as={Button} variant="ghost" px={2}>
                          <FiMoreVertical />
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => openEditRole(role)}>Edit role</MenuItem>
                          <MenuItem onClick={() => handleDeleteRole(role.roleId)} color="red.500">
                            Delete role
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
                {!filteredRoles.length && (
                  <Tr>
                    <Td colSpan={8}>
                      <Text textAlign="center" py={8} color="#718096">No roles found</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Modal
        isOpen={roleModal.isOpen}
        onClose={() => {
          roleModal.onClose();
          resetRoleForm();
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRole ? 'Edit Role' : 'Create Role'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>Role Name</FormLabel>
                <Input
                  value={roleForm.roleName}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, roleName: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={roleForm.description}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Role Type</FormLabel>
                <Select
                  value={roleForm.roleType}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, roleType: event.target.value }))}
                >
                  {ROLE_TYPE_OPTIONS.map((roleType) => (
                    <option key={roleType} value={roleType}>{roleType}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Access Level</FormLabel>
                <Select
                  value={roleForm.accessLevel}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, accessLevel: event.target.value }))}
                >
                  {ACCESS_LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Permissions (comma separated)</FormLabel>
                <Input
                  value={roleForm.permissionsText}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, permissionsText: event.target.value }))}
                  placeholder="COURSE_VIEW, REPORT_VIEW"
                />
              </FormControl>
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="14px">Active Status</Text>
                <Switch
                  isChecked={roleForm.isActive}
                  onChange={(event) => setRoleForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button secondary onClick={roleModal.onClose}>Cancel</Button>
            <Button onClick={handleRoleSubmit}>{selectedRole ? 'Update Role' : 'Create Role'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={assignmentModal.isOpen}
        onClose={() => {
          assignmentModal.onClose();
          setAssignmentForm(initialAssignmentForm);
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign New Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>User ID</FormLabel>
                <Input
                  value={assignmentForm.userId}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, userId: event.target.value }))}
                  placeholder="user-123"
                />
              </FormControl>
              <FormControl>
                <FormLabel>User Name</FormLabel>
                <Input
                  value={assignmentForm.userName}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, userName: event.target.value }))}
                  placeholder="Jane Smith"
                />
              </FormControl>
              <FormControl>
                <FormLabel>User Email</FormLabel>
                <Input
                  value={assignmentForm.userEmail}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, userEmail: event.target.value }))}
                  placeholder="jane.smith@groomingcentre.com"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={assignmentForm.roleId}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, roleId: event.target.value }))}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.name} ({role.roleType})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Access Level</FormLabel>
                <Select
                  value={assignmentForm.accessLevel}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, accessLevel: event.target.value }))}
                >
                  {ACCESS_LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button secondary onClick={assignmentModal.onClose}>Cancel</Button>
            <Button onClick={handleAssignRole}>Assign Role</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminMainAreaWrapper>
  );
};

export const RolesPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <RolesPage {...props} />} />;
};
