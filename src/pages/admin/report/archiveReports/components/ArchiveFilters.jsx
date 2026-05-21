import React, { useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    HStack,
    VStack,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiCalendar, FiChevronDown, FiX } from 'react-icons/fi';

const ArchiveFilters = ({ filters, onChange, onReset }) => {
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    const hasActiveFilters = filters.status || filters.startDate || filters.endDate;

    return (
        <Flex alignItems="center" gap={3} px={4} py={4} borderBottom="1px solid #E2E8F0" flexWrap="wrap">
            {/* Search */}
            <InputGroup maxW="280px">
                <InputLeftElement pointerEvents="none" h="38px">
                    <FiSearch color="#A0AEC0" size={14} />
                </InputLeftElement>
                <Input
                    value={filters.search || ''}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Search archive ID, report ID..."
                    fontSize="14px"
                    height="38px"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    pl="36px"
                    _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                />
            </InputGroup>

            {/* Status Filter */}
            <Popover isOpen={filterOpen} onClose={() => setFilterOpen(false)} placement="bottom-start">
                <PopoverTrigger>
                    <Flex
                        alignItems="center"
                        gap="6px"
                        border="1px solid #E2E8F0"
                        borderRadius="8px"
                        px={3}
                        height="38px"
                        cursor="pointer"
                        _hover={{ bg: '#F7FAFC' }}
                        bg={filters.status ? '#F3E8FF' : 'white'}
                        onClick={() => setFilterOpen(!filterOpen)}
                    >
                        <FiFilter size={14} color={filters.status ? '#6b006b' : '#4A5568'} />
                        <Text fontSize="14px" color={filters.status ? '#6b006b' : '#4A5568'} fontWeight={filters.status ? '600' : '400'}>
                            {filters.status || 'Filter'}
                        </Text>
                        <FiChevronDown size={12} color="#4A5568" />
                    </Flex>
                </PopoverTrigger>
                <PopoverContent w="180px" shadow="lg" border="1px solid #E2E8F0">
                    <PopoverArrow />
                    <PopoverBody p={2}>
                        <VStack spacing={1} align="stretch">
                            <Text fontSize="11px" fontWeight="600" color="#718096" px={2} py={1} textTransform="uppercase">
                                Status
                            </Text>
                            {['', 'Archived', 'Retrieved'].map((val) => (
                                <Box
                                    key={val || 'all'}
                                    px={3}
                                    py={2}
                                    borderRadius="6px"
                                    fontSize="14px"
                                    cursor="pointer"
                                    color="#1A202C"
                                    bg={filters.status === val ? '#F3E8FF' : 'transparent'}
                                    fontWeight={filters.status === val ? '600' : '400'}
                                    _hover={{ bg: '#F7F7F7' }}
                                    onClick={() => { onChange({ status: val }); setFilterOpen(false); }}
                                >
                                    {val || 'All statuses'}
                                </Box>
                            ))}
                        </VStack>
                    </PopoverBody>
                </PopoverContent>
            </Popover>

            <Box flex="1" />

            {/* Date Range */}
            <Popover isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} placement="bottom-end">
                <PopoverTrigger>
                    <Flex
                        alignItems="center"
                        gap="6px"
                        border="1px solid #E2E8F0"
                        borderRadius="8px"
                        px={3}
                        height="38px"
                        cursor="pointer"
                        _hover={{ bg: '#F7FAFC' }}
                        bg={filters.startDate || filters.endDate ? '#F3E8FF' : 'white'}
                        onClick={() => setCalendarOpen(!calendarOpen)}
                    >
                        <FiCalendar size={14} color={filters.startDate ? '#6b006b' : '#4A5568'} />
                        <Text fontSize="14px" color={filters.startDate ? '#6b006b' : '#4A5568'} fontWeight={filters.startDate ? '600' : '400'}>
                            {filters.startDate && filters.endDate
                                ? `${filters.startDate} → ${filters.endDate}`
                                : filters.startDate
                                    ? `From ${filters.startDate}`
                                    : 'Select dates'}
                        </Text>
                        <FiChevronDown size={12} color="#4A5568" />
                    </Flex>
                </PopoverTrigger>
                <PopoverContent w="280px" shadow="lg" border="1px solid #E2E8F0">
                    <PopoverArrow />
                    <PopoverBody p={4}>
                        <VStack spacing={3} align="stretch">
                            <Box>
                                <Text fontSize="12px" fontWeight="600" color="#4A5568" mb={1}>Start Date</Text>
                                <Input
                                    type="date"
                                    value={filters.startDate || ''}
                                    onChange={(e) => onChange({ startDate: e.target.value })}
                                    fontSize="14px"
                                    height="36px"
                                    border="1px solid #E2E8F0"
                                    borderRadius="6px"
                                    _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="12px" fontWeight="600" color="#4A5568" mb={1}>End Date</Text>
                                <Input
                                    type="date"
                                    value={filters.endDate || ''}
                                    onChange={(e) => onChange({ endDate: e.target.value })}
                                    fontSize="14px"
                                    height="36px"
                                    border="1px solid #E2E8F0"
                                    borderRadius="6px"
                                    _focus={{ borderColor: '#6b006b', boxShadow: 'none' }}
                                />
                            </Box>
                            <HStack justify="flex-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { onChange({ startDate: '', endDate: '' }); setCalendarOpen(false); }}
                                    fontSize="13px"
                                >
                                    Clear
                                </Button>
                                <Button
                                    size="sm"
                                    bg="#6b006b"
                                    color="white"
                                    _hover={{ bg: '#550055' }}
                                    onClick={() => setCalendarOpen(false)}
                                    fontSize="13px"
                                >
                                    Apply
                                </Button>
                            </HStack>
                        </VStack>
                    </PopoverBody>
                </PopoverContent>
            </Popover>

            {/* Clear all filters */}
            {hasActiveFilters && (
                <Flex
                    alignItems="center"
                    gap="4px"
                    px={3}
                    height="38px"
                    cursor="pointer"
                    color="#E53E3E"
                    fontSize="13px"
                    fontWeight="500"
                    onClick={onReset}
                    _hover={{ textDecor: 'underline' }}
                >
                    <FiX size={13} />
                    Clear filters
                </Flex>
            )}
        </Flex>
    );
};

export default ArchiveFilters;
