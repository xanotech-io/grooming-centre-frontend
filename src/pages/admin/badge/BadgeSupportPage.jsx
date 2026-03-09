import React, { useState, useRef, useEffect } from 'react';
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
    FormControl,
    FormLabel,
    Select as ChakraSelect,
    NumberInput,
    NumberInputField,
    Divider,
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaRegCalendarAlt, FaCloudUploadAlt } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select } from '../../../components';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import { adminGetBadges, adminCreateBadge, adminDeleteBadge } from '../../../services';

const MOCK_BADGES = [];

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

const CreateBadgeModal = ({ isOpen, onClose, onCreated }) => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');
    const [title, setTitle] = useState('');
    const [requiredCourseCount, setRequiredCourseCount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFileName(e.target.files[0].name);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            // Simple mapping to backend shape; adjust when real data model is final
            await adminCreateBadge({
                name: title,
                description: '',
                imageUrl: '',
                category: 'course_completion',
                criteria: {
                    requiredCourses: Number(requiredCourseCount) || 0,
                },
                points: 0,
                expiryDays: 0,
            });
            setTitle('');
            setRequiredCourseCount('');
            setFileName('');
            onClose();
            onCreated?.();
        } catch (error) {
            // TODO: surface error to user when design is ready
            console.error('Failed to create badge', error);
        } finally {
            setIsSubmitting(false);
        }


        
    };

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
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </FormControl>

                        {/* Badge Type */}
                        <FormControl mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Badge Type
                            </FormLabel>
                            <ChakraSelect
                                defaultValue="open"
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                            >
                                <option value="open">Open Badge (Mozilla)</option>
                                <option value="custom">Custom Badge</option>
                            </ChakraSelect>
                        </FormControl>

                        {/* Select Courses */}
                        <FormControl mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Select courses
                            </FormLabel>
                            <ChakraSelect
                                placeholder="Select courses"
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                            >
                                <option value="course1">Agriculture Fundamentals</option>
                                <option value="course2">Safety Compliance</option>
                                <option value="course3">Digital Literacy</option>
                            </ChakraSelect>
                        </FormControl>

                        {/* Required Course Count */}
                        <FormControl mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Required Course Count
                            </FormLabel>
                            <NumberInput min={1} value={requiredCourseCount} onChange={(value) => setRequiredCourseCount(value)}>
                                <NumberInputField
                                    placeholder="Enter number of required course count"
                                    fontSize="14px"
                                    borderRadius="6px"
                                    borderColor="#E2E8F0"
                                    _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                />
                            </NumberInput>
                        </FormControl>

                        {/* Badge File Upload */}
                        <FormControl mb={6}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Badge File
                            </FormLabel>
                            <Flex
                                border="1px solid #E2E8F0"
                                borderRadius="6px"
                                alignItems="center"
                                px={3}
                                py={2}
                                gap={3}
                            >
                                <Flex alignItems="center" gap={2} flex={1}>
                                    <FaCloudUploadAlt color="#A0AEC0" size={20} />
                                    <Box>
                                        <Text fontSize="13px" fontWeight="500" color="#4A5568">
                                            {fileName || 'Tap to Upload'}
                                        </Text>
                                        <Text fontSize="11px" color="#A0AEC0">
                                            SVG, PNG, JPG, GIF | 10MB max.
                                        </Text>
                                    </Box>
                                </Flex>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/svg+xml,image/png,image/jpeg,image/gif"
                                    style={{ display: 'none' }}
                                />
                                <Box
                                    as="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    bg="#6b006b"
                                    color="white"
                                    fontSize="13px"
                                    fontWeight="600"
                                    px={4}
                                    py={2}
                                    borderRadius="6px"
                                    _hover={{ bg: '#520052' }}
                                    flexShrink={0}
                                >
                                    Upload
                                </Box>
                            </Flex>
                        </FormControl>

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
                                onClick={handleSubmit}
                                disabled={isSubmitting || !title}
                            >
                                {isSubmitting ? 'Saving...' : 'Save and publish badge'}
                            </Box>
                        </Flex>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

const BadgeSupportPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [badges, setBadges] = useState(MOCK_BADGES);

    const loadBadges = async () => {
        try {
            const { badges: fetched } = await adminGetBadges();
            setBadges(fetched || []);
        } catch (error) {
            console.error('Failed to load badges', error);
        }
    };

    useEffect(() => {
        loadBadges();
    }, []);
    
    const handleDelete = async (badgeId) => {
        try {
            await adminDeleteBadge(badgeId);
            await loadBadges();
        } catch (error) {
            console.error('Failed to delete badge', error);
        }
    };

    return (
        <>
            <CreateBadgeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={loadBadges}
            />
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
                                    {badges.map((row, idx) => (
                                        <Tr key={idx} _hover={{ bg: "#F8FAFC" }}>
                                            <Td pl={6} py={4} borderBottom="1px solid #E2E8F0">
                                                <input type="checkbox" style={{ accentColor: "#6B006B" }} />
                                            </Td>
                                            <Td color="#4A5568" fontSize="14px" borderBottom="1px solid #E2E8F0">{row.id}</Td>
                                            <Td color="#1A202C" fontSize="14px" fontWeight="500" borderBottom="1px solid #E2E8F0" maxW="200px" whiteSpace="normal">{row.name}</Td>
                                            <Td color="#1A202C" fontSize="14px" borderBottom="1px solid #E2E8F0">
                                                {row.criteria?.requiredCourses ?? '-'}
                                            </Td>
                                            <Td color="#1A202C" fontSize="14px" borderBottom="1px solid #E2E8F0">
                                                {row.criteria?.coursesCompleted ?? '-'}
                                            </Td>
                                            <Td borderBottom="1px solid #E2E8F0">
                                                {getStatusBadge(row.status || 'In-progress')}
                                            </Td>
                                            <Td color="#1A202C" fontSize="14px" borderBottom="1px solid #E2E8F0" maxW="200px" whiteSpace="normal">
                                                {row.description || '-'}
                                            </Td>
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
                                                        <MenuItem
                                                            fontSize="14px"
                                                            color="red.500"
                                                            onClick={() => handleDelete(row.id)}
                                                        >
                                                            Delete Badge
                                                        </MenuItem>
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

export const BadgeSupportPageRoute = ({ ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => <BadgeSupportPage {...props} />}
        />
    );
};

export default BadgeSupportPageRoute;
