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
    Divider,
    useToast,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
    Spinner,
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { FiMoreVertical } from 'react-icons/fi';
import { Button, Heading, Select } from '../../../components';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import { capitalizeFirstLetter } from '../../../utils';
import {
    adminGetBadges,
    adminGetBadgeKPIs,
    adminCreateBadge,
    adminUpdateBadge,
    adminDeactivateBadge,
    adminAddBadgeCourses,
    adminRemoveBadgeCourses,
    userGetCourseListing,
} from '../../../services';

/* ─── Constants ──────────────────────────────────────────────────── */
const BADGE_TYPES = ['Open Badge', 'Mozilla Badge', 'Custom Badge'];
const VALIDATION_METHODS = ['automatic', 'manual'];

/* ─── Status Badge helper ────────────────────────────────────────── */
const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') {
        return (
            <Badge bg="#E6F4EA" color="#38A169" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
                Active
            </Badge>
        );
    }
    if (s === 'inactive') {
        return (
            <Badge bg="#FED7D7" color="#E53E3E" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
                Inactive
            </Badge>
        );
    }
    return (
        <Badge bg="#E2E8F0" color="#4A5568" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
            {capitalizeFirstLetter(status || 'Unknown')}
        </Badge>
    );
};

/* ─── Create / Edit Badge Modal ──────────────────────────────────── */
const CreateBadgeModal = ({ isOpen, onClose, editBadge, onSaved, allCourses }) => {
    const toast = useToast();
    const isEdit = !!editBadge;

    const emptyForm = {
        title: '',
        badgeType: '',
        description: '',
        issuingAuthority: '',
        validationMethod: '',
        badgeFile: '',
        courseIds: [],
    };

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    /* Pre-fill when editing */
    useEffect(() => {
        if (isOpen) {
            if (editBadge) {
                const existingIds = (editBadge.requiredCourseList || []).map(
                    (c) => c.id || c._id
                );
                setForm({
                    title: editBadge.title || '',
                    badgeType: editBadge.badgeType || '',
                    description: editBadge.description || '',
                    issuingAuthority: editBadge.issuingAuthority || '',
                    validationMethod: editBadge.validationMethod || '',
                    badgeFile: editBadge.badgeFile || '',
                    courseIds: existingIds,
                });
            } else {
                setForm({ title: '', badgeType: '', description: '', issuingAuthority: '', validationMethod: '', badgeFile: '', courseIds: [] });
            }
            setCourseSearch('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editBadge]);

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const toggleCourse = (id) =>
        setForm((prev) => ({
            ...prev,
            courseIds: prev.courseIds.includes(id)
                ? prev.courseIds.filter((x) => x !== id)
                : [...prev.courseIds, id],
        }));

    const filteredCourses = (allCourses || []).filter((c) =>
        (c.title || c.name || '').toLowerCase().includes(courseSearch.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            toast({ title: 'Badge title is required', status: 'warning', duration: 3000 });
            return;
        }
        if (!form.badgeType) {
            toast({ title: 'Badge type is required', status: 'warning', duration: 3000 });
            return;
        }
        if (!form.description.trim()) {
            toast({ title: 'Description is required', status: 'warning', duration: 3000 });
            return;
        }
        if (!form.issuingAuthority.trim()) {
            toast({ title: 'Issuing authority is required', status: 'warning', duration: 3000 });
            return;
        }
        if (!form.validationMethod) {
            toast({ title: 'Validation method is required', status: 'warning', duration: 3000 });
            return;
        }

        setSaving(true);
        try {
            const body = {
                title: form.title.trim(),
                badgeType: form.badgeType,
                description: form.description.trim(),
                issuingAuthority: form.issuingAuthority.trim(),
                validationMethod: form.validationMethod,
                badgeFile: form.badgeFile.trim() || undefined,
                courseIds: form.courseIds,
            };

            if (isEdit) {
                await adminUpdateBadge(editBadge.id || editBadge._id, body);
                toast({ title: 'Badge updated successfully', status: 'success', duration: 3000 });
            } else {
                await adminCreateBadge(body);
                toast({ title: 'Badge created successfully', status: 'success', duration: 3000 });
            }

            onSaved();
            onClose();
        } catch (err) {
            toast({
                title: capitalizeFirstLetter(
                    err?.response?.data?.message || err.message || 'Failed'
                ),
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSaving(false);
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
                            {isEdit ? 'Edit Badge' : 'Create New Badge'}
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
                    <Box px={6} py={5} maxH="65vh" overflowY="auto">
                        {/* Badge Title */}
                        <FormControl mb={4} isRequired>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Badge Title
                            </FormLabel>
                            <Input
                                value={form.title}
                                onChange={(e) => set('title', e.target.value)}
                                placeholder="Enter badge title"
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                            />
                        </FormControl>

                        <Flex gap="12px" mb={4}>
                            <FormControl isRequired flex={1}>
                                <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                    Badge Type
                                </FormLabel>
                                <ChakraSelect
                                    value={form.badgeType}
                                    onChange={(e) => set('badgeType', e.target.value)}
                                    fontSize="14px"
                                    borderRadius="6px"
                                    borderColor="#E2E8F0"
                                    _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                >
                                    <option value="">Select type</option>
                                    {BADGE_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </ChakraSelect>
                            </FormControl>
                            <FormControl isRequired flex={1}>
                                <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                    Validation Method
                                </FormLabel>
                                <ChakraSelect
                                    value={form.validationMethod}
                                    onChange={(e) => set('validationMethod', e.target.value)}
                                    fontSize="14px"
                                    borderRadius="6px"
                                    borderColor="#E2E8F0"
                                    _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                >
                                    <option value="">Select method</option>
                                    {VALIDATION_METHODS.map((m) => (
                                        <option key={m} value={m}>
                                            {capitalizeFirstLetter(m)}
                                        </option>
                                    ))}
                                </ChakraSelect>
                            </FormControl>
                        </Flex>

                        <FormControl isRequired mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Description
                            </FormLabel>
                            <Textarea
                                value={form.description}
                                onChange={(e) => set('description', e.target.value)}
                                placeholder="What is this badge for?"
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                rows={3}
                            />
                        </FormControl>

                        <FormControl isRequired mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Issuing Authority
                            </FormLabel>
                            <Input
                                value={form.issuingAuthority}
                                onChange={(e) => set('issuingAuthority', e.target.value)}
                                placeholder="e.g. Automated System"
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                            />
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Badge File URL
                            </FormLabel>
                            <Input
                                value={form.badgeFile}
                                onChange={(e) => set('badgeFile', e.target.value)}
                                placeholder="https://..."
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                            />
                        </FormControl>

                        {/* Required Courses Picker */}
                        <FormControl isRequired mb={2}>
                            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={1}>
                                Required Courses{' '}
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
                                    {form.courseIds.length} selected (requiredCoursesCount will be{' '}
                                    {form.courseIds.length})
                                </Box>
                            </FormLabel>
                            <Input
                                value={courseSearch}
                                onChange={(e) => setCourseSearch(e.target.value)}
                                placeholder="Search courses..."
                                fontSize="14px"
                                borderRadius="6px"
                                borderColor="#E2E8F0"
                                _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                mb="8px"
                                size="sm"
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
                        {isEdit ? 'Update Badge' : 'Create Badge'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

/* ─── Course Assignment Drawer ───────────────────────────────────── */
const CourseAssignmentDrawer = ({ isOpen, onClose, badge, onDone }) => {
    const toast = useToast();
    const [allCourses, setAllCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedToAdd, setSelectedToAdd] = useState([]);

    const currentCourses = badge?.requiredCourseList || [];
    const currentIds = currentCourses.map((c) => c.id || c._id);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedToAdd([]);
            userGetCourseListing()
                .then((res) => {
                    const list = res?.courses || res?.data || res || [];
                    setAllCourses(Array.isArray(list) ? list : []);
                })
                .catch(() => setAllCourses([]));
        }
    }, [isOpen]);

    const handleRemove = async (courseId) => {
        setSaving(true);
        try {
            await adminRemoveBadgeCourses(badge.id || badge._id, { courseIds: [courseId] });
            toast({ title: 'Course removed', status: 'success', duration: 2000 });
            onDone();
        } catch (err) {
            toast({
                title: capitalizeFirstLetter(
                    err?.response?.data?.message || err.message || 'Failed'
                ),
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleAddCourse = (id) => {
        setSelectedToAdd((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleAddSelected = async () => {
        if (selectedToAdd.length === 0) return;
        setSaving(true);
        try {
            await adminAddBadgeCourses(badge.id || badge._id, { courseIds: selectedToAdd });
            toast({
                title: `${selectedToAdd.length} course(s) added`,
                status: 'success',
                duration: 2000,
            });
            setSelectedToAdd([]);
            onDone();
        } catch (err) {
            toast({
                title: capitalizeFirstLetter(
                    err?.response?.data?.message || err.message || 'Failed'
                ),
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    const addable = allCourses.filter(
        (c) =>
            !currentIds.includes(c.id || c._id) &&
            (c.title || c.name || '').toLowerCase().includes(search.toLowerCase())
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
                    <Text
                        fontSize="12px"
                        fontWeight="700"
                        color="gray.500"
                        mb="8px"
                        textTransform="uppercase"
                    >
                        Current Required Courses ({currentCourses.length})
                    </Text>
                    {currentCourses.length === 0 && (
                        <Text fontSize="13px" color="gray.400" mb="16px">
                            No courses assigned yet.
                        </Text>
                    )}
                    {currentCourses.map((c) => {
                        const id = c.id || c._id;
                        return (
                            <Flex
                                key={id}
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
                                    onClick={() => handleRemove(id)}
                                    disabled={saving}
                                    size="xs"
                                >
                                    Remove
                                </Button>
                            </Flex>
                        );
                    })}

                    <Box h="1px" bg="#E2E8F0" my="16px" />

                    {/* Add courses section */}
                    <Text
                        fontSize="12px"
                        fontWeight="700"
                        color="gray.500"
                        mb="8px"
                        textTransform="uppercase"
                    >
                        Add Courses ({addable.length} available)
                    </Text>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        size="sm"
                        mb="8px"
                        borderRadius="6px"
                        borderColor="#E2E8F0"
                        _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                    />
                    <Box
                        border="1px solid #E2E8F0"
                        borderRadius="6px"
                        maxH="220px"
                        overflowY="auto"
                        p="8px"
                        mb="12px"
                    >
                        {addable.length === 0 && (
                            <Text fontSize="12px" color="gray.400" textAlign="center" py="8px">
                                No courses available to add
                            </Text>
                        )}
                        {addable.map((c) => {
                            const id = c.id || c._id;
                            return (
                                <Checkbox
                                    key={id}
                                    isChecked={selectedToAdd.includes(id)}
                                    onChange={() => toggleAddCourse(id)}
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

                    {selectedToAdd.length > 0 && (
                        <Button
                            onClick={handleAddSelected}
                            isLoading={saving}
                            disabled={saving}
                            style={{ backgroundColor: '#6b006b', color: 'white', marginBottom: '16px' }}
                            width="100%"
                        >
                            Add Selected ({selectedToAdd.length})
                        </Button>
                    )}

                    <Divider mb={4} />

                    {/* Close Button */}
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
                            Close
                        </Box>
                    </Flex>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────── */
const BadgeSupportPage = () => {
    const toast = useToast();

    /* Badges list state */
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    /* KPI state */
    const [kpis, setKpis] = useState({ activeBadges: 0, totalBadgesAwarded: 0, pendingApprovalCount: 0 });
    const [kpisLoading, setKpisLoading] = useState(false);

    /* Modal / Drawer state */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editBadge, setEditBadge] = useState(null);
    const [drawerBadge, setDrawerBadge] = useState(null);

    /* All courses for the picker in the modal */
    const [allCourses, setAllCourses] = useState([]);

    /* Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    /* ── Fetch badges ── */
    const fetchBadges = async () => {
        setLoading(true);
        try {
            const res = await adminGetBadges();
            const list = res?.data || res?.badges || res || [];
            setBadges(Array.isArray(list) ? list : []);
        } catch (err) {
            toast({
                title: capitalizeFirstLetter(
                    err?.response?.data?.message || err.message || 'Failed to load badges'
                ),
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    /* ── Fetch KPIs ── */
    const fetchKpis = async () => {
        setKpisLoading(true);
        try {
            const res = await adminGetBadgeKPIs();
            const data = res?.data || res || {};
            setKpis({
                activeBadges: data.activeBadges ?? 0,
                totalBadgesAwarded: data.totalBadgesAwarded ?? 0,
                pendingApprovalCount: data.pendingApprovalCount ?? 0,
            });
        } catch {
            // silently fail KPI fetch — non-critical
        } finally {
            setKpisLoading(false);
        }
    };

    /* ── Fetch courses for modal picker ── */
    const fetchAllCourses = async () => {
        try {
            const res = await userGetCourseListing();
            const list = res?.courses || res?.data || res || [];
            setAllCourses(Array.isArray(list) ? list : []);
        } catch {
            setAllCourses([]);
        }
    };

    useEffect(() => {
        fetchBadges();
        fetchKpis();
        fetchAllCourses();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Deactivate badge ── */
    const handleDeactivate = async (badge) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${badge.title}"?`
        );
        if (!confirmed) return;
        try {
            await adminDeactivateBadge(badge.id || badge._id);
            toast({ title: 'Badge deactivated', status: 'success', duration: 3000 });
            fetchBadges();
            fetchKpis();
        } catch (err) {
            toast({
                title: capitalizeFirstLetter(
                    err?.response?.data?.message || err.message || 'Failed'
                ),
                status: 'error',
                duration: 3000,
            });
        }
    };

    /* ── Open Edit modal ── */
    const handleEdit = (badge) => {
        setEditBadge(badge);
        setIsModalOpen(true);
    };

    /* ── Open Create modal ── */
    const handleOpenCreate = () => {
        setEditBadge(null);
        setIsModalOpen(true);
    };

    /* ── After save callback ── */
    const handleSaved = () => {
        fetchBadges();
        fetchKpis();
    };

    /* ── After drawer course operation ── */
    const handleDrawerDone = async () => {
        if (!drawerBadge) return;
        // Re-fetch badge list and update the drawer badge with fresh data
        try {
            const res = await adminGetBadges();
            const list = res?.data || res?.badges || res || [];
            const refreshed = (Array.isArray(list) ? list : []).find(
                (b) => (b.id || b._id) === (drawerBadge.id || drawerBadge._id)
            );
            setBadges(Array.isArray(list) ? list : []);
            if (refreshed) setDrawerBadge(refreshed);
        } catch {
            // best-effort
        }
    };

    /* ── Filtered + paginated rows ── */
    const filtered = badges.filter((b) =>
        (b.title || '').toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <>
            <CreateBadgeModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditBadge(null); }}
                editBadge={editBadge}
                onSaved={handleSaved}
                allCourses={allCourses}
            />
            <CourseAssignmentDrawer
                isOpen={!!drawerBadge}
                onClose={() => setDrawerBadge(null)}
                badge={drawerBadge}
                onDone={handleDrawerDone}
            />
            <AdminMainAreaWrapper>
                <Box marginX="22px" marginY="30px">
                    {/* Header Section */}
                    <Flex justifyContent="space-between" alignItems="center" marginBottom="30px">
                        <Heading as="h2" fontSize="24px" fontWeight="600" color="#1A202C">
                            Badge Support
                        </Heading>
                        <Button
                            style={{ backgroundColor: '#6b006b', color: 'white' }}
                            _hover={{ bg: '#520052' }}
                            borderRadius="6px"
                            fontWeight="500"
                            px={6}
                            onClick={handleOpenCreate}
                        >
                            Create new badge
                        </Button>
                    </Flex>

                    {/* KPI Cards Section */}
                    <Grid templateColumns="repeat(3, 1fr)" gap="24px" marginBottom="30px">
                        <Box backgroundColor="white" padding="24px" borderRadius="10px" shadow="sm">
                            <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">
                                Active Badges
                            </Text>
                            {kpisLoading ? (
                                <Spinner size="sm" color="#6b006b" />
                            ) : (
                                <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">
                                    {kpis.activeBadges}
                                </Text>
                            )}
                            <Text fontSize="14px" fontWeight="500" color="#38A169">
                                Currently active badges
                            </Text>
                        </Box>
                        <Box backgroundColor="white" padding="24px" borderRadius="10px" shadow="sm">
                            <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">
                                Total Badges Awarded
                            </Text>
                            {kpisLoading ? (
                                <Spinner size="sm" color="#6b006b" />
                            ) : (
                                <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">
                                    {kpis.totalBadgesAwarded}
                                </Text>
                            )}
                            <Text fontSize="14px" fontWeight="500" color="#4A5568">
                                Badges issued to users
                            </Text>
                        </Box>
                        <Box backgroundColor="white" padding="24px" borderRadius="10px" shadow="sm">
                            <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">
                                Pending Approvals
                            </Text>
                            {kpisLoading ? (
                                <Spinner size="sm" color="#6b006b" />
                            ) : (
                                <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">
                                    {kpis.pendingApprovalCount}
                                </Text>
                            )}
                            <Text fontSize="14px" fontWeight="500" color="#DD6B20">
                                Awaiting admin review
                            </Text>
                        </Box>
                    </Grid>

                    {/* Table Section */}
                    <Box backgroundColor="white" borderRadius="10px" shadow="sm" border="1px solid #E2E8F0">
                        <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            padding="16px 24px"
                            borderBottom="1px solid #E2E8F0"
                            flexWrap="wrap"
                            gap={4}
                        >
                            {/* Left Toolbar */}
                            <Flex gap="16px" flex="1">
                                <InputGroup maxWidth="300px">
                                    <InputLeftElement pointerEvents="none">
                                        <FaSearch color="#A0AEC0" />
                                    </InputLeftElement>
                                    <Input
                                        type="text"
                                        placeholder="Search here..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                        fontSize="14px"
                                        borderRadius="6px"
                                        borderColor="#E2E8F0"
                                        _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
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
                            <Table variant="simple">
                                <Thead bg="#F7FAFC">
                                    <Tr>
                                        <Th width="40px" pl={6} py={4}>
                                            <input type="checkbox" style={{ accentColor: '#6B006B' }} />
                                        </Th>
                                        <Th
                                            textTransform="none"
                                            fontSize="13px"
                                            fontWeight="600"
                                            color="#4A5568"
                                            borderBottom="1px solid #E2E8F0"
                                        >
                                            Title
                                        </Th>
                                        <Th
                                            textTransform="none"
                                            fontSize="13px"
                                            fontWeight="600"
                                            color="#4A5568"
                                            borderBottom="1px solid #E2E8F0"
                                        >
                                            Badge Type
                                        </Th>
                                        <Th
                                            textTransform="none"
                                            fontSize="13px"
                                            fontWeight="600"
                                            color="#4A5568"
                                            borderBottom="1px solid #E2E8F0"
                                        >
                                            Required Courses
                                        </Th>
                                        <Th
                                            textTransform="none"
                                            fontSize="13px"
                                            fontWeight="600"
                                            color="#4A5568"
                                            borderBottom="1px solid #E2E8F0"
                                        >
                                            Validation Method
                                        </Th>
                                        <Th
                                            textTransform="none"
                                            fontSize="13px"
                                            fontWeight="600"
                                            color="#4A5568"
                                            borderBottom="1px solid #E2E8F0"
                                        >
                                            Status
                                        </Th>
                                        <Th
                                            textTransform="none"
                                            fontSize="13px"
                                            fontWeight="600"
                                            color="#4A5568"
                                            width="80px"
                                            textAlign="center"
                                            borderBottom="1px solid #E2E8F0"
                                        >
                                            Actions
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {loading && (
                                        <Tr>
                                            <Td colSpan={7} textAlign="center" py={10}>
                                                <Flex justifyContent="center" alignItems="center" gap={3}>
                                                    <Spinner size="md" color="#6b006b" />
                                                    <Text fontSize="14px" color="#4A5568">
                                                        Loading badges...
                                                    </Text>
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    )}
                                    {!loading && paginated.length === 0 && (
                                        <Tr>
                                            <Td colSpan={7} textAlign="center" py={10}>
                                                <Text fontSize="14px" color="#A0AEC0">
                                                    {search ? 'No badges match your search.' : 'No badges found. Create your first badge above.'}
                                                </Text>
                                            </Td>
                                        </Tr>
                                    )}
                                    {!loading &&
                                        paginated.map((badge, idx) => {
                                            const id = badge.id || badge._id;
                                            return (
                                                <Tr key={id || idx} _hover={{ bg: '#F8FAFC' }}>
                                                    <Td pl={6} py={4} borderBottom="1px solid #E2E8F0">
                                                        <input
                                                            type="checkbox"
                                                            style={{ accentColor: '#6B006B' }}
                                                        />
                                                    </Td>
                                                    <Td
                                                        color="#1A202C"
                                                        fontSize="14px"
                                                        fontWeight="500"
                                                        borderBottom="1px solid #E2E8F0"
                                                        maxW="200px"
                                                        whiteSpace="normal"
                                                    >
                                                        {badge.title}
                                                    </Td>
                                                    <Td
                                                        color="#4A5568"
                                                        fontSize="14px"
                                                        borderBottom="1px solid #E2E8F0"
                                                    >
                                                        {badge.badgeType || '—'}
                                                    </Td>
                                                    <Td
                                                        color="#1A202C"
                                                        fontSize="14px"
                                                        borderBottom="1px solid #E2E8F0"
                                                    >
                                                        {badge.requiredCoursesCount ?? (badge.requiredCourseList?.length ?? 0)}
                                                    </Td>
                                                    <Td
                                                        color="#1A202C"
                                                        fontSize="14px"
                                                        borderBottom="1px solid #E2E8F0"
                                                    >
                                                        {capitalizeFirstLetter(badge.validationMethod || '—')}
                                                    </Td>
                                                    <Td borderBottom="1px solid #E2E8F0">
                                                        {getStatusBadge(badge.status)}
                                                    </Td>
                                                    <Td
                                                        textAlign="center"
                                                        borderBottom="1px solid #E2E8F0"
                                                    >
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
                                                            <MenuList minWidth="160px">
                                                                <MenuItem
                                                                    fontSize="14px"
                                                                    color="#1A202C"
                                                                    onClick={() => handleEdit(badge)}
                                                                >
                                                                    Edit Badge
                                                                </MenuItem>
                                                                <MenuItem
                                                                    fontSize="14px"
                                                                    color="#1A202C"
                                                                    onClick={() => setDrawerBadge(badge)}
                                                                >
                                                                    Manage Courses
                                                                </MenuItem>
                                                                <MenuItem
                                                                    fontSize="14px"
                                                                    color="red.500"
                                                                    onClick={() => handleDeactivate(badge)}
                                                                >
                                                                    Deactivate
                                                                </MenuItem>
                                                            </MenuList>
                                                        </Menu>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                </Tbody>
                            </Table>
                        </TableContainer>

                        {/* Pagination Section */}
                        <Flex
                            justifyContent="flex-end"
                            alignItems="center"
                            padding="16px 24px"
                            gap="24px"
                        >
                            <Flex alignItems="center" gap="10px">
                                <Text fontSize="14px" color="#4A5568" fontWeight="500">
                                    Rows per page
                                </Text>
                                <Box width="70px">
                                    <Select
                                        defaultValue="08"
                                        id="rows"
                                        options={[{ label: '08', value: '08' }]}
                                    />
                                </Box>
                            </Flex>
                            <Text fontSize="14px" fontWeight="600" color="#1A202C">
                                Showing {paginated.length} out of {filtered.length} items
                            </Text>
                            <Flex gap="4px">
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<FaChevronLeft />}
                                    aria-label="Previous page"
                                    color="#A0AEC0"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    isDisabled={currentPage === 1}
                                />
                                <Text
                                    fontSize="14px"
                                    color="#6B006B"
                                    fontWeight="600"
                                    alignSelf="center"
                                    px={2}
                                >
                                    {currentPage}
                                </Text>
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<FaChevronRight />}
                                    aria-label="Next page"
                                    color="#1A202C"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    isDisabled={currentPage === totalPages}
                                />
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
