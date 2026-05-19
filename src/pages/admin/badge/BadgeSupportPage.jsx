import React, { useState, useEffect } from 'react';
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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Select as ChakraSelect,
    Textarea,
    Checkbox,
    NumberInput,
    NumberInputField,
    Divider,
    useToast,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select } from '../../../components';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import { userGetCourseListing, adminRemoveBadgeCourses } from '../../../services';

const MOCK_BADGES = [
    { id: 'BGD-001', title: 'Agriculture Fundamentals Badge', reqCourses: '5', courseCount: '3', status: 'In-progress', remark: 'User has 2 courses left' },
    { id: 'BGD-001', title: 'Safety Compliance Badge', reqCourses: '3', courseCount: '3', status: 'Earned', remark: 'All required courses completed' },
    { id: 'BGD-001', title: 'Engineering Skill Level 1', reqCourses: '5', courseCount: '2', status: 'In-progress', remark: 'GC can see remaining 3 courses' },
    { id: 'BGD-001', title: 'Digital Literacy Starter Badge', reqCourses: '1', courseCount: '0', status: 'Not Started', remark: 'Requirement clearly displayed' },
    { id: 'BGD-001', title: 'Agriculture Fundamentals Badge', reqCourses: '7', courseCount: '5', status: 'In-progress', remark: 'User has 2 courses left' },
    { id: 'BGD-001', title: 'Safety Compliance Badge', reqCourses: '4', courseCount: '4', status: 'Earned', remark: 'All required courses completed' },
];

const getStatusBadge = (status) => {
    switch (status) {
        case 'Earned':
            return <Badge bg="#E6F4EA" color="#38A169" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">{status}</Badge>;
        case 'In-progress':
            return <Badge bg="#FFF5EA" color="#DD6B20" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">{status}</Badge>;
        case 'Not Started':
            return <Badge bg="#FED7D7" color="#E53E3E" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">{status}</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

const BADGE_TYPES = ['Academic', 'Professional', 'Skills', 'Compliance'];
const VALIDATION_METHODS = ['automatic', 'manual', 'peer'];
const capitalizeFirstLetter = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const CreateBadgeModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ badgeType: '', validationMethod: '', description: '', issuingAuthority: '', courseIds: [] });
    const [saving, setSaving] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');
    const isEdit = false;
    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
    const toggleCourse = (id) => setForm(prev => ({ ...prev, courseIds: prev.courseIds.includes(id) ? prev.courseIds.filter(x => x !== id) : [...prev.courseIds, id] }));
    const filteredCourses = [];
    const handleSubmit = () => { setSaving(false); onClose(); };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay bg="blackAlpha.400" />
            <ModalContent borderRadius="12px" mx={4}>
                <ModalBody p={0}>
                    {/* Modal Header */}
                    <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        px={6}
                        py={4}
                        borderBottom="1px solid #E2E8F0"
                    >
                        <Text fontSize="18px" fontWeight="700" color="#1A202C">
                            Create New Badge
                        </Text>
                        <Box
                            as="button"
                            onClick={onClose}
                            color="#4A5568"
                            _hover={{ color: '#1A202C' }}
                        >
                            <MdClose size={22} />
                        </Box>
                    </Flex>

                    {/* Modal Form */}
                    <Box px={6} py={5}>
                        {/* Badge Title */}
                        <FormControl mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Badge Title
                            </FormLabel>
                            <Input
                                placeholder="Enter badge title"
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                            />
                        </FormControl>

            <Flex gap="12px">
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="sm">Badge Type</FormLabel>
                <ChakraSelect
                  value={form.badgeType}
                  onChange={(e) => set("badgeType", e.target.value)}
                  size="sm"
                >
                  {BADGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </ChakraSelect>
              </FormControl>
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="sm">Validation Method</FormLabel>
                <ChakraSelect
                  value={form.validationMethod}
                  onChange={(e) => set("validationMethod", e.target.value)}
                  size="sm"
                >
                  {VALIDATION_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {capitalizeFirstLetter(m)}
                    </option>
                  ))}
                </ChakraSelect>
              </FormControl>
            </Flex>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What is this badge for?"
                size="sm"
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Issuing Authority</FormLabel>
              <Input
                value={form.issuingAuthority}
                onChange={(e) => set("issuingAuthority", e.target.value)}
                placeholder="e.g. Automated System"
                size="sm"
              />
            </FormControl>

                        {/* Required Course Count */}
                        <FormControl mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Required Course Count
                            </FormLabel>
                            <NumberInput min={1}>
                                <NumberInputField
                                    placeholder="Enter number of required course count"
                                    fontSize="14px"
                                    borderRadius="6px"
                                    borderColor="#E2E8F0"
                                    _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                />
                            </NumberInput>
                        </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">
                Required Courses
                <Box
                  as="span"
                  ml="8px"
                  bg="#F0E6FF"
                  color="#6b006b"
                  px="8px"
                  py="1px"
                  borderRadius="8px"
                  fontSize="11px"
                  fontWeight="700"
                >
                  {form.courseIds.length} selected (requiredCoursesCount ={" "}
                  {form.courseIds.length})
                </Box>
              </FormLabel>
              <Input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search courses…"
                size="sm"
                mb="8px"
              />
              <Box
                border="1px solid #E2E8F0"
                borderRadius="6px"
                maxH="180px"
                overflowY="auto"
                p="8px"
              >
                {filteredCourses.length === 0 && (
                  <Text fontSize="12px" color="gray.400" textAlign="center" py="8px">
                    No courses found
                  </Text>
                )}
                {filteredCourses.map((c) => {
                  const id = c.id || c._id;
                  return (
                    <Checkbox
                      key={id}
                      isChecked={form.courseIds.includes(id)}
                      onChange={() => toggleCourse(id)}
                      size="sm"
                      display="flex"
                      mb="4px"
                      colorScheme="purple"
                    >
                      <Text fontSize="12px">{c.title || c.name}</Text>
                    </Checkbox>
                  );
                })}
              </Box>
            </FormControl>
          </Box>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button secondary onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button isLoading={saving} onClick={handleSubmit}>
            {isEdit ? "Update Badge" : "Create Badge"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

/* ─── Course Assignment Drawer ─────────────────────────────────── */
const CourseAssignmentDrawer = ({ isOpen, onClose, badge, onDone }) => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const currentIds = (badge?.requiredCourseList || []).map((c) => c.id);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      userGetCourseListing()
        .then(({ courses: list }) => setCourses(list || []))
        .catch(() => setCourses([]));
    }
  }, [isOpen]);

  const handleRemove = async (courseId) => {
    setSaving(true);
    try {
      await adminRemoveBadgeCourses(badge.id, { courseIds: [courseId] });
      toast({ title: "Course removed", status: "success", duration: 2000 });
      onDone();
    } catch (err) {
      toast({
        title: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed",
        ),
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const addable = courses.filter(
    (c) =>
      !currentIds.includes(c.id || c._id) &&
      (c.title || c.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Manage Courses — {badge?.title}
        </DrawerHeader>
        <DrawerBody>
          {/* Current required courses */}
          <Text fontSize="12px" fontWeight="700" color="gray.500" mb="8px" textTransform="uppercase">
            Current Required Courses ({currentIds.length})
          </Text>
          {currentIds.length === 0 && (
            <Text fontSize="13px" color="gray.400" mb="16px">
              No courses assigned yet.
            </Text>
          )}
          {(badge?.requiredCourseList || []).map((c) => (
            <Flex
              key={c.id}
              justifyContent="space-between"
              alignItems="center"
              p="10px 12px"
              mb="6px"
              bg="#F7F9FC"
              borderRadius="6px"
              border="1px solid #E2E8F0"
            >
              <Text fontSize="13px" fontWeight="500">
                {c.title || c.name}
              </Text>
              <Button
                secondary
                onClick={() => handleRemove(c.id)}
                disabled={saving}
                size="xs"
              >
                Remove
              </Button>
            </Flex>
          ))}

          <Box h="1px" bg="#E2E8F0" my="16px" />

          <Text fontSize="12px" fontWeight="700" color="gray.500" mb="8px" textTransform="uppercase">
            Add Courses ({addable.length} available)
          </Text>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            size="sm"
            mb="8px"
          />
          {addable.map((c) => (
            <Flex key={c.id || c._id} justifyContent="space-between" alignItems="center" p="10px 12px" mb="6px" bg="#F7F9FC" borderRadius="6px" border="1px solid #E2E8F0">
              <Text fontSize="13px" fontWeight="500">{c.title || c.name}</Text>
            </Flex>
          ))}

          <Divider mb={4} />

                        {/* Action Buttons */}
                        <Flex gap={3}>
                            <Box
                                as="button"
                                onClick={onClose}
                                flex={1}
                                border="1px solid #E2E8F0"
                                borderRadius="8px"
                                py={3}
                                fontSize="14px"
                                fontWeight="600"
                                color="#E53E3E"
                                bg="white"
                                _hover={{ bg: '#FFF5F5' }}
                            >
                                Cancel
                            </Box>
                            <Box
                                as="button"
                                flex={1}
                                borderRadius="8px"
                                py={3}
                                fontSize="14px"
                                fontWeight="600"
                                color="white"
                                bg="#6b006b"
                                _hover={{ bg: '#520052' }}
                            >
                                Save and publish badge
                            </Box>
                        </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

/* ─── Main page ────────────────────────────────────────────────── */
const BadgeSupportPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [drawerBadge, setDrawerBadge] = useState(null);
    return (
        <>
            <CreateBadgeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <CourseAssignmentDrawer isOpen={!!drawerBadge} onClose={() => setDrawerBadge(null)} badge={drawerBadge} onDone={() => setDrawerBadge(null)} />
            <AdminMainAreaWrapper>
                <Box marginX="22px" marginY="30px">
                    {/* Header Section */}
                    <Flex justifyContent="space-between" alignItems="center" marginBottom="30px">
                        <Heading as="h2" fontSize="24px" fontWeight="600" color="#1A202C">
                            Badge Support
                        </Heading>
                        <Button
                            style={{ backgroundColor: "#6b006b", color: "white" }}
                            _hover={{ bg: "#520052" }}
                            borderRadius="6px"
                            fontWeight="500"
                            px={6}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Create new badge
                        </Button>
                    </Flex>

                    {/* Stats Cards Section */}
                    <Grid templateColumns="repeat(3, 1fr)" gap="24px" marginBottom="30px">
                        <Box backgroundColor="white" padding="24px" borderRadius="10px" shadow="sm">
                            <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Badge Completion Rate</Text>
                            <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">80%</Text>
                            <Text fontSize="14px" fontWeight="500" color="#38A169">+5% vs last period</Text>
                        </Box>
                        <Box backgroundColor="white" padding="24px" borderRadius="10px" shadow="sm">
                            <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Requirement Clarity</Text>
                            <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">89%</Text>
                            <Text fontSize="14px" fontWeight="500" color="#4A5568">Badges with clear milestones</Text>
                        </Box>
                        <Box backgroundColor="white" padding="24px" borderRadius="10px" shadow="sm">
                            <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Average Earning Time</Text>
                            <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">10 days</Text>
                            <Text fontSize="14px" fontWeight="500" color="#38A169">+1 day improvement</Text>
                        </Box>
                    </Grid>

                    {/* Table Section */}
                    <Box backgroundColor="white" borderRadius="10px" shadow="sm" border="1px solid #E2E8F0">
                        <Flex justifyContent="space-between" alignItems="center" padding="16px 24px" borderBottom="1px solid #E2E8F0 flexWrap='wrap' gap={4}">
                            {/* Left Toolbar */}
                            <Flex gap="16px" flex="1">
                                <InputGroup maxWidth="300px">
                                    <InputLeftElement pointerEvents='none'>
                                        <FaSearch color='#A0AEC0' />
                                    </InputLeftElement>
                                    <Input
                                        type='text'
                                        placeholder='Search here...'
                                        fontSize="14px"
                                        borderRadius="6px"
                                        borderColor="#E2E8F0"
                                        _focus={{ borderColor: "#6b006b", boxShadow: "none" }}
                                    />
                                </InputGroup>

                                <Button
                                    variant="outline"
                                    leftIcon={<FaFilter color="#4A5568" />}
                                    borderColor="#E2E8F0"
                                    color="#4A5568"
                                    fontSize="14px"
                                    fontWeight="500"
                                    bg="white"
                                >
                                    Filter
                                </Button>
                            </Flex>

                            {/* Right Toolbar */}
                            <Flex>
                                <Button
                                    variant="outline"
                                    leftIcon={<FaRegCalendarAlt color="#4A5568" />}
                                    borderColor="#E2E8F0"
                                    color="#4A5568"
                                    fontSize="14px"
                                    fontWeight="500"
                                    bg="white"
                                >
                                    Select dates
                                </Button>
                            </Flex>
                        </Flex>

                        <TableContainer>
                            <Table variant='simple'>
                                <Thead bg="#F7FAFC">
                                    <Tr>
                                        <Th width="40px" pl={6} py={4}>
                                            <input type="checkbox" style={{ accentColor: "#6B006B" }} />
                                        </Th>
                                        <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" borderBottom="1px solid #E2E8F0">Badge ID</Th>
                                        <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" borderBottom="1px solid #E2E8F0">Badge Title</Th>
                                        <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" borderBottom="1px solid #E2E8F0">Required Courses Count</Th>
                                        <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" borderBottom="1px solid #E2E8F0">Courses Completed</Th>
                                        <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" borderBottom="1px solid #E2E8F0">Status</Th>
                                        <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" borderBottom="1px solid #E2E8F0">Remark</Th>
                                        <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" width="80px" textAlign="center" borderBottom="1px solid #E2E8F0">Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {MOCK_BADGES.map((row, idx) => (
                                        <Tr key={idx} _hover={{ bg: "#F8FAFC" }}>
                                            <Td pl={6} py={4} borderBottom="1px solid #E2E8F0">
                                                <input type="checkbox" style={{ accentColor: "#6B006B" }} />
                                            </Td>
                                            <Td color="#4A5568" fontSize="14px" borderBottom="1px solid #E2E8F0">{row.id}</Td>
                                            <Td color="#1A202C" fontSize="14px" fontWeight="500" borderBottom="1px solid #E2E8F0" maxW="200px" whiteSpace="normal">{row.title}</Td>
                                            <Td color="#1A202C" fontSize="14px" borderBottom="1px solid #E2E8F0">{row.reqCourses}</Td>
                                            <Td color="#1A202C" fontSize="14px" borderBottom="1px solid #E2E8F0">{row.courseCount}</Td>
                                            <Td borderBottom="1px solid #E2E8F0">{getStatusBadge(row.status)}</Td>
                                            <Td color="#1A202C" fontSize="14px" borderBottom="1px solid #E2E8F0" maxW="200px" whiteSpace="normal">{row.remark}</Td>
                                            <Td textAlign="center" borderBottom="1px solid #E2E8F0">
                                                <Menu placement="bottom-end">
                                                    <MenuButton
                                                        as={IconButton}
                                                        aria-label="Options"
                                                        icon={<FiMoreVertical color="#A0AEC0" />}
                                                        variant="outline"
                                                        size="sm"
                                                        borderRadius="6px"
                                                        borderColor="#E2E8F0"
                                                    />
                                                    <MenuList minWidth="120px">
                                                        <MenuItem fontSize="14px" color="#1A202C">Edit Badge</MenuItem>
                                                        <MenuItem fontSize="14px" color="red.500">Delete Badge</MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>

                        {/* Pagination Section */}
                        <Flex justifyContent="flex-end" alignItems="center" padding="16px 24px" gap="24px">
                            <Flex alignItems="center" gap="10px">
                                <Text fontSize="14px" color="#4A5568" fontWeight="500">Rows per page</Text>
                                <Box width="70px">
                                    <Select defaultValue="08" id="rows" options={[{ label: "08", value: "08" }]} />
                                </Box>
                            </Flex>
                            <Text fontSize="14px" fontWeight="600" color="#1A202C">
                                Showing 10 out iof 100 items
                            </Text>
                            <Flex gap="4px">
                                <IconButton variant="ghost" size="sm" icon={<FaChevronLeft />} aria-label="Previous page" color="#A0AEC0" />
                                <Text fontSize="14px" color="#6B006B" fontWeight="600" alignSelf="center" px={2}>1</Text>
                                <IconButton variant="ghost" size="sm" icon={<FaChevronRight />} aria-label="Next page" color="#1A202C" />
                            </Flex>
                        </Flex>

                    </Box>
                </Box>
            </AdminMainAreaWrapper>
        </>
    );
};

export const BadgeSupportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeSupportPage {...props} />} />
);

export default BadgeSupportPageRoute;
