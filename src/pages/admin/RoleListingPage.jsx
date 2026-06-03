import { BreadcrumbItem } from "@chakra-ui/breadcrumb";
import { Box, Flex } from "@chakra-ui/layout";
import { Route } from "react-router-dom";
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
  Spinner,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link } from "../../components";
import { AdminMainAreaWrapper } from "../../layouts/admin/MainArea/Wrapper";
import { FiMoreVertical, FiChevronDown, FiX } from "react-icons/fi";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  adminGetRoles,
  adminGetRoleKPIs,
  adminAssignUserRole,
  adminToggleRoleStatus,
  adminGetStudents,
} from "../../services";

const initialAssignForm = { userId: "", roleId: "", reason: "" };

// ---------------------------------------------------------------------------
// StudentCombobox — single input with searchable dropdown
// ---------------------------------------------------------------------------

const StudentCombobox = ({ students, loading, value, onSelect, onSearchChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedStudent = students.find((s) => s.id === value) ?? null;

  const filtered = useMemo(() => {
    if (!inputValue) return students;
    const q = inputValue.toLowerCase();
    return students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.username ?? "").toLowerCase().includes(q),
    );
  }, [students, inputValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (value) onSelect(null);
    setIsOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(val), 350);
  };

  const handleFocus = () => {
    if (!value) {
      setIsOpen(true);
      if (students.length === 0) onSearchChange("");
    }
  };

  const handleSelect = (student) => {
    onSelect(student);
    setInputValue("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setInputValue("");
    setIsOpen(false);
  };

  return (
    <Box ref={containerRef} position="relative">
      <Flex
        border="1px solid"
        borderColor="inherit"
        borderRadius="md"
        alignItems="center"
        px={3}
        bg="white"
        _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
      >
        <Input
          border="none"
          px={0}
          _focus={{ boxShadow: "none" }}
          value={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName} — ${selectedStudent.email}` : inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Search by name or email..."
          readOnly={!!selectedStudent}
        />
        {loading && <Spinner size="xs" color="gray.400" mr={1} />}
        {selectedStudent ? (
          <Box
            as="button"
            type="button"
            onClick={handleClear}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            ml={1}
            flexShrink={0}
          >
            <FiX size={14} />
          </Box>
        ) : (
          <Box color="gray.400" ml={1} flexShrink={0}>
            <FiChevronDown size={14} />
          </Box>
        )}
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="md"
          boxShadow="md"
          zIndex={1500}
          maxH="220px"
          overflowY="auto"
        >
          {loading && (
            <Flex alignItems="center" gap={2} px={3} py={2}>
              <Spinner size="xs" />
              <Text fontSize="13px" color="#718096">Loading students...</Text>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <Text fontSize="13px" color="#718096" px={3} py={2}>
              No students found
            </Text>
          )}
          {!loading &&
            filtered.map((s) => (
              <Box
                key={s.id}
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: "#EBF8FF" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s);
                }}
              >
                <Text fontSize="14px" fontWeight="500">
                  {s.firstName} {s.lastName}
                </Text>
                <Text fontSize="12px" color="#718096">
                  {s.email}
                </Text>
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const RolesPage = () => {
  const toast = useToast();
  const assignModal = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [kpis, setKpis] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [assignForm, setAssignForm] = useState(initialAssignForm);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, kpisRes] = await Promise.all([
        adminGetRoles(),
        adminGetRoleKPIs(),
      ]);
      setRoles(rolesRes.roles);
      setKpis(kpisRes);
    } catch (error) {
      toast({
        title: error.message || "Failed to load roles",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fetchStudents = useCallback(async (search = "") => {
    setStudentsLoading(true);
    try {
      const res = await adminGetStudents({ search, page: 1, length: 50 });
      setStudents(res.students);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const openAssignModal = () => {
    setAssignForm(initialAssignForm);
    setStudents([]);
    assignModal.onOpen();
  };

  const filteredRoles = useMemo(() => {
    if (!searchTerm) return roles;
    const q = searchTerm.toLowerCase();
    return roles.filter(
      (r) =>
        (r.name ?? r.roleName ?? "").toLowerCase().includes(q) ||
        (r.roleId ?? r.id ?? "").toLowerCase().includes(q),
    );
  }, [roles, searchTerm]);

  const handleAssignRole = async () => {
    if (!assignForm.userId || !assignForm.roleId) {
      toast({
        title: "Please select a student and a role",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    try {
      await adminAssignUserRole(assignForm.userId, {
        roleId: assignForm.roleId,
        reason: assignForm.reason,
      });
      toast({
        title: "Role assigned successfully",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      assignModal.onClose();
      setAssignForm(initialAssignForm);
      await loadData();
    } catch (error) {
      toast({
        title: error.message || "Unable to assign role",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = async (role) => {
    const roleId = role.roleId ?? role.id;
    const currentlyActive = role.active ?? role.status === "Active";
    try {
      await adminToggleRoleStatus(roleId, !currentlyActive);
      toast({
        title: `Role ${!currentlyActive ? "activated" : "deactivated"} successfully`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      await loadData();
    } catch (error) {
      toast({
        title: error.message || "Unable to update role status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const statCards = [
    { label: "Total Roles", value: kpis.totalRoles ?? roles.length },
    {
      label: "Active Roles",
      value:
        kpis.activeRoles ??
        roles.filter((r) => r.active || r.status === "Active").length,
    },
    { label: "Total Assignments", value: kpis.totalAssignments ?? kpis.totalUsers ?? "—" },
    { label: "Users With Roles", value: kpis.usersWithRoles ?? "—" },
  ];

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
        <Button onClick={openAssignModal}>Assign Role</Button>
      </Flex>

      <Flex gap={4} mb={5} wrap="wrap">
        {statCards.map((card) => (
          <Box
            key={card.label}
            bg="white"
            border="1px solid #E2E8F0"
            borderRadius="8px"
            px={4}
            py={3}
            minW="220px"
          >
            <Text fontSize="12px" color="#718096">
              {card.label}
            </Text>
            <Text fontSize="20px" fontWeight="600" color="#1A202C">
              {loading ? "..." : card.value}
            </Text>
          </Box>
        ))}
      </Flex>

      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="10px"
        overflow="hidden"
      >
        <Flex p={4} borderBottom="1px solid #E2E8F0">
          <Input
            maxW="320px"
            placeholder="Search by role name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Flex>

        {loading ? (
          <Flex
            justifyContent="center"
            alignItems="center"
            minH="240px"
            direction="column"
            gap={3}
          >
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
                  <Th textTransform="none">Description</Th>
                  <Th textTransform="none">Users</Th>
                  <Th textTransform="none">Status</Th>
                  <Th textTransform="none" textAlign="center">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRoles.map((role) => {
                  const roleId = role.roleId ?? role.id;
                  const isActive = role.active ?? role.status === "Active";
                  return (
                    <Tr key={roleId}>
                      <Td>{roleId}</Td>
                      <Td>
                        <Text fontWeight="600">{role.name ?? role.roleName}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="13px" color="#4A5568">
                          {role.description ?? "—"}
                        </Text>
                      </Td>
                      <Td>{role.userCount ?? role.noOfUsers ?? "—"}</Td>
                      <Td>
                        <Badge
                          colorScheme={isActive ? "green" : "red"}
                          textTransform="none"
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td textAlign="center">
                        <Menu placement="bottom-end">
                          <MenuButton as={Button} variant="ghost" px={2}>
                            <FiMoreVertical />
                          </MenuButton>
                          <MenuList>
                            <MenuItem onClick={() => handleToggleStatus(role)}>
                              {isActive ? "Deactivate" : "Activate"}
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
                {!filteredRoles.length && (
                  <Tr>
                    <Td colSpan={6}>
                      <Text textAlign="center" py={8} color="#718096">
                        No roles found
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Modal
        isOpen={assignModal.isOpen}
        onClose={() => {
          assignModal.onClose();
          setAssignForm(initialAssignForm);
          setStudents([]);
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent overflow="visible">
          <ModalHeader>Assign Role to User</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="visible">
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>Student</FormLabel>
                <StudentCombobox
                  students={students}
                  loading={studentsLoading}
                  value={assignForm.userId}
                  onSelect={(student) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      userId: student ? student.id : "",
                    }))
                  }
                  onSearchChange={fetchStudents}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={assignForm.roleId}
                  onChange={(e) =>
                    setAssignForm((prev) => ({ ...prev, roleId: e.target.value }))
                  }
                >
                  <option value="">Select role</option>
                  {roles.map((role) => {
                    const id = role.roleId ?? role.id;
                    return (
                      <option key={id} value={id}>
                        {role.name ?? role.roleName}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Reason</FormLabel>
                <Input
                  value={assignForm.reason}
                  onChange={(e) =>
                    setAssignForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Reason for assignment (optional)"
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button secondary onClick={assignModal.onClose}>
              Cancel
            </Button>
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
