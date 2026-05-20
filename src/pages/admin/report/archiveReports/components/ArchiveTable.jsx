import React, { useRef, useEffect, useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Checkbox,
    IconButton,
    HStack,
    Badge,
    Skeleton,
    Tooltip,
} from '@chakra-ui/react';
import {
    FiMoreVertical,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiRotateCcw,
} from 'react-icons/fi';

// ── helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge = ({ status }) => {
    const isArchived = status === 'Archived';
    return (
        <Badge
            px={2}
            py="2px"
            borderRadius="full"
            fontSize="12px"
            fontWeight="600"
            colorScheme={isArchived ? 'orange' : 'green'}
            textTransform="capitalize"
        >
            {status}
        </Badge>
    );
};

// ── Row action menu ───────────────────────────────────────────────────────────
const RowActionMenu = ({ row, onRetrieve, onViewDetail }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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
                onClick={() => setOpen((o) => !o)}
                _hover={{ bg: '#F7FAFC' }}
            />
            {open && (
                <Box
                    position="absolute"
                    right="0"
                    top="38px"
                    bg="white"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    shadow="md"
                    zIndex={100}
                    minW="170px"
                    py={1}
                >
                    <Flex
                        px={4}
                        py={2}
                        gap={2}
                        alignItems="center"
                        cursor="pointer"
                        fontSize="14px"
                        color="#1A202C"
                        _hover={{ bg: '#F7FAFC' }}
                        onClick={() => { setOpen(false); onViewDetail(row); }}
                    >
                        <FiEye size={14} />
                        View details
                    </Flex>
                    {row.status === 'Archived' && (
                        <Flex
                            px={4}
                            py={2}
                            gap={2}
                            alignItems="center"
                            cursor="pointer"
                            fontSize="14px"
                            color="#6b006b"
                            fontWeight="500"
                            _hover={{ bg: '#F3E8FF' }}
                            onClick={() => { setOpen(false); onRetrieve(row); }}
                        >
                            <FiRotateCcw size={14} />
                            Retrieve report
                        </Flex>
                    )}
                </Box>
            )}
        </Box>
    );
};

// ── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <Flex px={4} py={4} alignItems="center" borderBottom="1px solid #EDF2F7">
        <Box width="40px"><Skeleton height="16px" width="16px" /></Box>
        {[1, 1.2, 1.5, 1.2, 1.2, 1.2, 1.8, 0.6].map((flex, i) => (
            <Box key={i} flex={flex} pr={2}>
                <Skeleton height="14px" width={`${60 + (i % 3) * 20}%`} />
            </Box>
        ))}
    </Flex>
);

// ── Main component ────────────────────────────────────────────────────────────
const COLUMNS = [
    { label: 'Archive ID', flex: '1' },
    { label: 'Report ID', flex: '1.2' },
    { label: 'Report Name', flex: '1.5' },
    { label: 'Archived By', flex: '1.2' },
    { label: 'Archive Date', flex: '1.2' },
    { label: 'Retrieval Date', flex: '1.2' },
    { label: 'Status', flex: '0.9' },
    { label: 'Storage Location', flex: '1.8' },
    { label: '', flex: '0.5', align: 'center' },
];

const ArchiveTable = ({
    archives,
    total,
    page,
    limit,
    isLoading,
    onPageChange,
    onLimitChange,
    onRetrieve,
    onViewDetail,
}) => {
    const [selectedRows, setSelectedRows] = useState([]);

    const allSelected = archives.length > 0 && archives.every((r) => selectedRows.includes(r.id));
    const toggleAll = () =>
        setSelectedRows(allSelected ? [] : archives.map((r) => r.id));
    const toggleRow = (id) =>
        setSelectedRows((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
            <Box overflowX="auto">
                <Box minW="900px">
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
                                <Text fontSize="12px" fontWeight="600" color="#475467" noOfLines={1}>
                                    {col.label}
                                </Text>
                            </Box>
                        ))}
                    </Flex>

                    {/* Body */}
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : archives.length === 0 ? (
                        <Flex justify="center" align="center" py={16} direction="column" gap={2}>
                            <Text color="#718096" fontSize="15px" fontWeight="500">No archive records found.</Text>
                            <Text color="#A0AEC0" fontSize="13px">Try adjusting your filters.</Text>
                        </Flex>
                    ) : (
                        archives.map((row, i) => (
                            <Box
                                key={row.id}
                                borderBottom={i < archives.length - 1 ? '1px solid #EDF2F7' : 'none'}
                                _hover={{ bg: '#FAFAFA' }}
                                transition="background 0.15s"
                            >
                                <Flex px={4} py={4} alignItems="center">
                                    <Box width="40px">
                                        <Checkbox
                                            isChecked={selectedRows.includes(row.id)}
                                            onChange={() => toggleRow(row.id)}
                                            colorScheme="purple"
                                            borderColor="#CBD5E0"
                                        />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="13px" color="#6b006b" fontWeight="600" fontFamily="mono">
                                            {row.archiveId}
                                        </Text>
                                    </Box>
                                    <Box flex="1.2">
                                        <Text fontSize="13px" color="#4A5568" fontFamily="mono">
                                            {row.report?.reportId ?? '—'}
                                        </Text>
                                    </Box>
                                    <Box flex="1.5">
                                        <Tooltip label={row.report?.reportName} hasArrow placement="top" fontSize="12px">
                                            <Text fontSize="13px" color="#1A202C" noOfLines={1} maxW="180px">
                                                {row.report?.reportName ?? '—'}
                                            </Text>
                                        </Tooltip>
                                    </Box>
                                    <Box flex="1.2">
                                        <Text fontSize="13px" color="#1A202C">
                                            {row.archiver
                                                ? `${row.archiver.firstName} ${row.archiver.lastName}`
                                                : '—'}
                                        </Text>
                                    </Box>
                                    <Box flex="1.2">
                                        <Text fontSize="13px" color="#4A5568">{formatDate(row.archiveDate)}</Text>
                                    </Box>
                                    <Box flex="1.2">
                                        <Text fontSize="13px" color="#4A5568">{formatDate(row.retrievalDate)}</Text>
                                    </Box>
                                    <Box flex="0.9">
                                        <StatusBadge status={row.status} />
                                    </Box>
                                    <Box flex="1.8">
                                        <Tooltip label={row.storageLocation} hasArrow placement="top" fontSize="12px">
                                            <Text fontSize="12px" color="#6b006b" fontFamily="mono" noOfLines={1} maxW="200px">
                                                {row.storageLocation ?? '—'}
                                            </Text>
                                        </Tooltip>
                                    </Box>
                                    <Box flex="0.5" display="flex" justifyContent="center">
                                        <RowActionMenu
                                            row={row}
                                            onRetrieve={onRetrieve}
                                            onViewDetail={onViewDetail}
                                        />
                                    </Box>
                                </Flex>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>

            {/* Pagination */}
            <Flex
                px={4}
                py={4}
                justifyContent="flex-end"
                alignItems="center"
                gap={4}
                borderTop="1px solid #E2E8F0"
                flexWrap="wrap"
            >
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
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        cursor="pointer"
                        _focus={{ outline: 'none', borderColor: '#6b006b' }}
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </Box>
                </HStack>

                <Text fontSize="13px" color="#1A202C" fontWeight="600">
                    {total === 0 ? '0 items' : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
                </Text>

                <HStack spacing={2}>
                    <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        aria-label="Previous"
                        isDisabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        color="#4A5568"
                    />
                    <Box
                        w="30px" h="30px"
                        display="flex" alignItems="center" justifyContent="center"
                        bg="#6b006b" borderRadius="6px"
                        color="white" fontSize="13px" fontWeight="600"
                    >
                        {page}
                    </Box>
                    <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        variant="ghost"
                        aria-label="Next"
                        isDisabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                        color="#4A5568"
                    />
                </HStack>
            </Flex>
        </Box>
    );
};

export default ArchiveTable;
