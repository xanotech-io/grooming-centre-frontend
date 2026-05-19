import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, HStack,
  IconButton, Menu, MenuButton, MenuList, MenuItem,
  Checkbox, Select, Text, InputGroup, InputLeftElement,
  Input, Spinner,
} from '@chakra-ui/react';
import { FiSearch, FiMoreVertical, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AlertTypeBadge from './AlertTypeBadge';

const fmtName = (obj) => (obj ? `${obj.firstName ?? ''} ${obj.lastName ?? ''}`.trim() || '—' : '—');
const fmtTime = (ts) => (ts ? new Date(ts).toLocaleString() : '—');
const fmtStatus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

const ACTION_LABELS = {
  warning_issued: 'Warning Issued',
  exam_paused: 'Exam Paused',
  exam_suspended: 'Exam Suspended',
};

const EventsTable = ({
  events,
  total,
  page,
  limit,
  isLoading,
  filters,
  onFilterChange,
  onPageChange,
  onLimitChange,
  onViewSession,
  onRecordAction,
}) => {
  return (
    <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
      <Flex mb={6} justify="space-between" align="center" gap={4} flexWrap="wrap">
        <HStack flex={1} maxW="400px">
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search student or exam..."
              borderRadius="md"
              bg="white"
              value={filters.search ?? ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </InputGroup>
        </HStack>
        <HStack spacing={3} flexWrap="wrap">
          <Select
            size="sm"
            borderRadius="md"
            w="140px"
            value={filters.alertType ?? ''}
            onChange={(e) => onFilterChange('alertType', e.target.value)}
          >
            <option value="">All Alert Types</option>
            <option value="warning">Warning</option>
            <option value="violation">Violation</option>
            <option value="system_flag">System Flag</option>
          </Select>
          <Select
            size="sm"
            borderRadius="md"
            w="130px"
            value={filters.status ?? ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </Select>
          <Input
            size="sm"
            type="date"
            borderRadius="md"
            w="150px"
            placeholder="Start date"
            value={filters.startDate ?? ''}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
          />
          <Input
            size="sm"
            type="date"
            borderRadius="md"
            w="150px"
            placeholder="End date"
            value={filters.endDate ?? ''}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
          />
        </HStack>
      </Flex>

      <Box overflowX="auto">
        {isLoading ? (
          <Flex justify="center" py={12}>
            <Spinner color="#660066" />
          </Flex>
        ) : (
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th px={4} py={3}><Checkbox size="sm" colorScheme="purple" /></Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Student</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Examination</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Alert Type</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Description</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Timestamp</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Status</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Proctor</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Last Action</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events.length === 0 ? (
                <Tr>
                  <Td colSpan={10} textAlign="center" py={10} color="#475367" fontSize="13px">
                    No proctoring events found.
                  </Td>
                </Tr>
              ) : (
                events.map((evt) => {
                  const latestAction = evt.actions?.[evt.actions.length - 1];
                  return (
                    <Tr key={evt.id}>
                      <Td px={2} py={4}><Checkbox size="sm" colorScheme="purple" /></Td>
                      <Td px={4} py={4}>
                        <Text color="#101928" fontSize="12px" fontWeight="600">{fmtName(evt.student)}</Text>
                        <Text color="#475367" mt={1} fontSize="11px">{evt.student?.email ?? '—'}</Text>
                      </Td>
                      <Td px={4} py={4} color="#101928" fontSize="12px" fontWeight="500">
                        {evt.examination?.title ?? '—'}
                      </Td>
                      <Td px={4} py={4}>
                        <AlertTypeBadge type={evt.alertType} />
                      </Td>
                      <Td px={4} py={4} color="#475367" fontSize="12px" maxW="180px">
                        <Text noOfLines={2}>{evt.description ?? '—'}</Text>
                      </Td>
                      <Td px={4} py={4} color="#101928" fontSize="12px">{fmtTime(evt.eventTimestamp)}</Td>
                      <Td px={4} py={4} color="#101928" fontSize="12px">{fmtStatus(evt.status)}</Td>
                      <Td px={4} py={4} color="#101928" fontSize="12px">{fmtName(evt.proctor)}</Td>
                      <Td px={4} py={4} color="#475367" fontSize="12px">
                        {latestAction ? ACTION_LABELS[latestAction.actionTaken] ?? latestAction.actionTaken : '—'}
                      </Td>
                      <Td px={4} py={4}>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            borderColor="#E4E7EC"
                            border="1px"
                            variant="ghost"
                            size="sm"
                            borderRadius="md"
                          />
                          <MenuList>
                            <MenuItem fontSize="14px" onClick={() => onViewSession?.(evt.examId)}>
                              View Exam Session
                            </MenuItem>
                            <MenuItem fontSize="14px" onClick={() => onRecordAction?.(evt)}>
                              Record Action
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        )}
      </Box>

      <Flex mt={6} align="center" justify="space-between" flexWrap="wrap" gap={2}>
        <HStack spacing={2}>
          <Text color="#475367" fontSize="14px">Rows per page</Text>
          <Select
            size="sm"
            w="70px"
            borderRadius="md"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </HStack>
        <HStack spacing={4}>
          <Text color="#475367" fontSize="14px">
            Showing {events.length} of {total} items
          </Text>
          <HStack spacing={1}>
            <IconButton
              icon={<FiChevronLeft />}
              variant="ghost"
              size="sm"
              aria-label="Previous"
              isDisabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            />
            <Box px={2}>
              <Text fontSize="14px" fontWeight="600" color="#101928">{page}</Text>
            </Box>
            <IconButton
              icon={<FiChevronRight />}
              variant="ghost"
              size="sm"
              aria-label="Next"
              isDisabled={events.length < limit}
              onClick={() => onPageChange(page + 1)}
            />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
};

export default EventsTable;
