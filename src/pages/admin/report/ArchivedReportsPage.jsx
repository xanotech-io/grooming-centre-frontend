import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    IconButton,
    HStack,
    Checkbox,
} from '@chakra-ui/react';
import { Route } from 'react-router-dom';
import {
    FiSearch,
    FiFilter,
    FiMoreVertical,
    FiChevronLeft,
    FiChevronRight,
    FiCalendar,
    FiChevronDown,
    FiDownload,
} from 'react-icons/fi';
import { AdminMainAreaWrapper } from '../../../layouts';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_STATS = {
    archived: 79,
    retrieved: 50,
    successRate: '16:40',
    avgRetrievalTime: '5%',
};

const MOCK_ROWS = Array.from({ length: 10 }, (_, i) => ({
    id: `ARC-00${i + 1}`,
    reportId: 'MIS-001',
    archivedBy: i % 2 === 0 ? 'Admin-002' : 'Instructor- 004',
    archivedDate: '26/11/2025',
    retrievalDate: '26/11/2025',
    storageLocation: '/archives/MIS-001.pdf',
}));

// ─── Stat Block ────────────────────────────────────────────────────────────────
const StatBlock = ({ label, value, sub, subColor }) => (
    <Box>
        <Text fontSize="14px" fontWeight="500" color="#344054" mb={2}>
            {label}
        </Text>
        <Text fontSize="28px" fontWeight="700" color="#101928" lineHeight="1.1" mb={1}>
            {value}
        </Text>
        {sub && (
            <Text fontSize="13px" fontWeight="500" color={subColor || '#38A169'}>
                {sub}
            </Text>
        )}
    </Box>
);

// ─── Action Menu ───────────────────────────────────────────────────────────────
const RowActionMenu = ({ rowIndex, openMenu, setOpenMenu }) => {
    const ref = useRef(null);
    const isOpen = openMenu === rowIndex;

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpenMenu(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [setOpenMenu]);

    return (
        <Box position="relative" ref={ref}>
            <IconButton
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                color="#718096"
                aria-label="Row actions"
                border="1px solid #E4E7EC"
                borderRadius="6px"
                onClick={() => setOpenMenu(isOpen ? null : rowIndex)}
                _hover={{ bg: '#F7FAFC' }}
            />
            {isOpen && (
                <Box
                    position="absolute"
                    right="0"
                    top="38px"
                    bg="white"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    shadow="md"
                    zIndex={100}
                    minW="160px"
                    py={1}
                >
                    <Box
                        px={4}
                        py={2}
                        cursor="pointer"
                        fontSize="14px"
                        color="#1A202C"
                        _hover={{ bg: '#F7FAFC' }}
                        onClick={() => setOpenMenu(null)}
                    >
                        Retrieve report
                    </Box>
                    <Box
                        px={4}
                        py={2}
                        cursor="pointer"
                        fontSize="14px"
                        color="#E53E3E"
                        fontWeight="500"
                        _hover={{ bg: '#FFF5F5' }}
                        onClick={() => setOpenMenu(null)}
                    >
                        Delete report
                    </Box>
                </Box>
            )}
        </Box>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ArchivedReportsPage = () => {
    const [search, setSearch] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = MOCK_ROWS.filter(
        (r) =>
            r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.reportId.toLowerCase().includes(search.toLowerCase()) ||
            r.archivedBy.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const pageRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const allSelected =
        pageRows.length > 0 && pageRows.every((_, i) => selectedRows.includes(i + (currentPage - 1) * rowsPerPage));

    const toggleAll = () =>
        allSelected
            ? setSelectedRows([])
            : setSelectedRows(pageRows.map((_, i) => i + (currentPage - 1) * rowsPerPage));

    const toggleRow = (idx) =>
        setSelectedRows((prev) => (prev.includes(idx) ? prev.filter((r) => r !== idx) : [...prev, idx]));

    const COLUMNS = [
        { label: 'Archive ID', flex: '1' },
        { label: 'Report ID', flex: '1' },
        { label: 'Archived By', flex: '1.2' },
        { label: 'Archived Date', flex: '1.2' },
        { label: 'Retrieval Date', flex: '1.2' },
        { label: 'Storage Location', flex: '1.8' },
        { label: 'Action', flex: '0.6', align: 'center' },
    ];

    return (
        <AdminMainAreaWrapper>
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="center" mb={6} mt={6}>
                <Text fontSize="26px" fontWeight="700" color="#101928">
                    Archived Reports
                </Text>
                <Button
                    bg="#6b006b"
                    color="white"
                    _hover={{ bg: '#550055' }}
                    borderRadius="8px"
                    leftIcon={<FiDownload />}
                    fontWeight="600"
                    fontSize="14px"
                    height="42px"
                    px={6}
                >
                    Export Report
                </Button>
            </Flex>

            {/* Stats Row */}
            <Flex gap={12} mb={8} px={1}>
                <StatBlock
                    label="Number of Archived/Retrieved Report"
                    value={`${MOCK_STATS.archived} / ${MOCK_STATS.retrieved}`}
                    sub="+5% vs last period"
                    subColor="#38A169"
                />
                <Box w="1px" bg="#E2E8F0" />
                <StatBlock
                    label="Retrieval Success Rate"
                    value={MOCK_STATS.successRate}
                    sub="-5% vs last period"
                    subColor="#E53E3E"
                />
                <Box w="1px" bg="#E2E8F0" />
                <StatBlock
                    label="Average Retrieval Time"
                    value={MOCK_STATS.avgRetrievalTime}
                    sub="-5% vs last period"
                    subColor="#E53E3E"
                />
            </Flex>

            {/* Table Card */}
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
                {/* Toolbar */}
                <Flex alignItems="center" gap={3} px={4} py={4} borderBottom="1px solid #E2E8F0">
                    <InputGroup maxW="280px">
                        <InputLeftElement pointerEvents="none" h="38px">
                            <FiSearch color="#A0AEC0" size={14} />
                        </InputLeftElement>
                        <Input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Search here..."
                            fontSize="14px"
                            height="38px"
                            border="1px solid #E2E8F0"
                            borderRadius="8px"
                            pl="36px"
                            _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                        />
                    </InputGroup>

                    <Flex
                        alignItems="center"
                        gap="6px"
                        border="1px solid #E2E8F0"
                        borderRadius="8px"
                        px={3}
                        height="38px"
                        cursor="pointer"
                        _hover={{ bg: '#F7FAFC' }}
                    >
                        <FiFilter size={14} color="#4A5568" />
                        <Text fontSize="14px" color="#4A5568">Filter</Text>
                    </Flex>

                    {/* Spacer */}
                    <Box flex="1" />

                    {/* Date picker button */}
                    <Flex
                        alignItems="center"
                        gap="6px"
                        border="1px solid #E2E8F0"
                        borderRadius="8px"
                        px={3}
                        height="38px"
                        cursor="pointer"
                        _hover={{ bg: '#F7FAFC' }}
                    >
                        <FiCalendar size={14} color="#4A5568" />
                        <Text fontSize="14px" color="#4A5568">Select dates</Text>
                        <FiChevronDown size={13} color="#4A5568" />
                    </Flex>
                </Flex>

                {/* Table */}
                <Box overflowX="auto">
                    <Box minW="800px">
                        {/* Header */}
                        <Flex px={4} py={3} borderBottom="1px solid #E2E8F0" alignItems="center" bg="#FAFAFA">
                            <Box width="40px">
                                <Checkbox
                                    isChecked={allSelected}
                                    isIndeterminate={selectedRows.length > 0 && !allSelected}
                                    onChange={toggleAll}
                                    colorScheme="purple"
                                    borderColor="#CBD5E0"
                                />
                            </Box>
                            {COLUMNS.map((col) => (
                                <Box key={col.label} flex={col.flex} textAlign={col.align || 'left'}>
                                    <Text fontSize="12px" fontWeight="600" color="#475467">
                                        {col.label}
                                    </Text>
                                </Box>
                            ))}
                        </Flex>

                        {/* Rows */}
                        {pageRows.length === 0 ? (
                            <Flex justify="center" align="center" py={12}>
                                <Text color="#718096" fontSize="14px">No archived reports found.</Text>
                            </Flex>
                        ) : (
                            pageRows.map((row, i) => {
                                const globalIdx = i + (currentPage - 1) * rowsPerPage;
                                return (
                                    <Box
                                        key={globalIdx}
                                        borderBottom={i < pageRows.length - 1 ? '1px solid #EDF2F7' : 'none'}
                                        _hover={{ bg: '#FAFAFA' }}
                                        transition="background 0.15s"
                                    >
                                        <Flex px={4} py={4} alignItems="center">
                                            <Box width="40px">
                                                <Checkbox
                                                    isChecked={selectedRows.includes(globalIdx)}
                                                    onChange={() => toggleRow(globalIdx)}
                                                    colorScheme="purple"
                                                    borderColor="#CBD5E0"
                                                />
                                            </Box>
                                            <Box flex="1">
                                                <Text fontSize="14px" color="#1A202C" fontWeight="500">{row.id}</Text>
                                            </Box>
                                            <Box flex="1">
                                                <Text fontSize="14px" color="#1A202C">{row.reportId}</Text>
                                            </Box>
                                            <Box flex="1.2">
                                                <Text fontSize="14px" color="#1A202C">{row.archivedBy}</Text>
                                            </Box>
                                            <Box flex="1.2">
                                                <Text fontSize="14px" color="#1A202C">{row.archivedDate}</Text>
                                            </Box>
                                            <Box flex="1.2">
                                                <Text fontSize="14px" color="#1A202C">{row.retrievalDate}</Text>
                                            </Box>
                                            <Box flex="1.8">
                                                <Text fontSize="13px" color="#6b006b" fontFamily="mono">{row.storageLocation}</Text>
                                            </Box>
                                            <Box flex="0.6" display="flex" justifyContent="center">
                                                <RowActionMenu rowIndex={globalIdx} openMenu={openMenu} setOpenMenu={setOpenMenu} />
                                            </Box>
                                        </Flex>
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </Box>

                {/* Pagination */}
                <Flex px={4} py={4} justifyContent="flex-end" alignItems="center" gap={4} borderTop="1px solid #E2E8F0">
                    <HStack spacing={2}>
                        <Text fontSize="13px" color="#4A5568">Rows per page</Text>
                        <Box
                            as="select"
                            border="1px solid #E2E8F0"
                            borderRadius="6px"
                            px={2}
                            py="4px"
                            fontSize="13px"
                            color="#1A202C"
                            value={rowsPerPage}
                            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            cursor="pointer"
                            _focus={{ outline: 'none', borderColor: '#6b006b' }}
                        >
                            {[8, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
                            ))}
                        </Box>
                    </HStack>

                    <Text fontSize="13px" color="#1A202C" fontWeight="600">
                        Showing {Math.min(rowsPerPage, filtered.length)} out of {filtered.length} items
                    </Text>

                    <HStack spacing={2}>
                        <IconButton
                            icon={<FiChevronLeft />}
                            size="sm"
                            variant="ghost"
                            aria-label="Previous page"
                            isDisabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            color="#4A5568"
                        />
                        <Box
                            w="30px"
                            h="30px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="#6b006b"
                            borderRadius="6px"
                            color="white"
                            fontSize="13px"
                            fontWeight="600"
                        >
                            {currentPage}
                        </Box>
                        <IconButton
                            icon={<FiChevronRight />}
                            size="sm"
                            variant="ghost"
                            aria-label="Next page"
                            isDisabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            color="#4A5568"
                        />
                    </HStack>
                </Flex>
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const ArchivedReportsPageRoute = ({ ...rest }) => (
    <Route {...rest} render={(props) => <ArchivedReportsPage {...props} />} />
);

export default ArchivedReportsPage;
