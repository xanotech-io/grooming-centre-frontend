import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, HStack,
  IconButton, Menu, MenuButton, MenuList, MenuItem,
  Checkbox, Select, Text, Spinner, Badge,
} from '@chakra-ui/react';
import { FiMoreVertical, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { EntityCombobox } from '../../../../../components/EntityCombobox/EntityCombobox';

const fmtDate = (ts) => (ts ? new Date(ts).toLocaleDateString() : '—');

const COMPLIANCE_STATUS_COLOR = {
  Compliant: 'green',
  'Non-Compliant': 'red',
  Pending: 'yellow',
};

const OVERDUE_STATUS_OPTIONS = ['Overdue', 'Due Soon', 'On Time'];
const COMPLIANCE_STATUS_OPTIONS = ['Compliant', 'Non-Compliant', 'Pending'];
const ENTITY_TYPE_OPTIONS = ['Course', 'Assessment', 'Exam'];

const ComplianceNotificationsTable = ({
  rows,
  total,
  page,
  limit,
  isLoading,
  filters,
  onFilterChange,
  onPageChange,
  onLimitChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewHistory,
  onSend,
  onEscalate,
  onResend,
  departmentFetchFn,
  courseFetchFn,
}) => {
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.recipientId));

  return (
    <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
      <Flex mb={6} gap={3} flexWrap="wrap" align="flex-end">
        <Box minW="200px">
          <Text fontSize="12px" color="#475367" mb={1}>Department</Text>
          <EntityCombobox
            fetchFn={departmentFetchFn}
            value={filters.departmentId || ''}
            onSelect={(opt) => onFilterChange('departmentId', opt?.id ?? '')}
            placeholder="All departments"
          />
        </Box>
        <Box minW="200px">
          <Text fontSize="12px" color="#475367" mb={1}>Course</Text>
          <EntityCombobox
            fetchFn={courseFetchFn}
            value={filters.courseId || ''}
            onSelect={(opt) => onFilterChange('courseId', opt?.id ?? '')}
            placeholder="All courses"
          />
        </Box>
        <Box minW="150px">
          <Text fontSize="12px" color="#475367" mb={1}>Entity Type</Text>
          <Select
            size="sm"
            borderRadius="md"
            value={filters.entityType ?? ''}
            onChange={(e) => onFilterChange('entityType', e.target.value)}
          >
            <option value="">All Types</option>
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        </Box>
        <Box minW="160px">
          <Text fontSize="12px" color="#475367" mb={1}>Compliance Status</Text>
          <Select
            size="sm"
            borderRadius="md"
            value={filters.complianceStatus ?? ''}
            onChange={(e) => onFilterChange('complianceStatus', e.target.value)}
          >
            <option value="">All Statuses</option>
            {COMPLIANCE_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        </Box>
        <Box minW="150px">
          <Text fontSize="12px" color="#475367" mb={1}>Overdue Status</Text>
          <Select
            size="sm"
            borderRadius="md"
            value={filters.overdueStatus ?? ''}
            onChange={(e) => onFilterChange('overdueStatus', e.target.value)}
          >
            <option value="">All</option>
            {OVERDUE_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        </Box>
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
                <Th px={4} py={3}>
                  <Checkbox
                    size="sm"
                    colorScheme="purple"
                    isChecked={allSelected}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                  />
                </Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Recipient</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Course/Exam</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Entity Type</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Compliance Status</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Overdue Status</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Due Date</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Last Delivery</Th>
                <Th px={4} py={3} color="#344054" fontSize="12.3px" fontWeight="600" textTransform="none">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={10} color="#475367" fontSize="13px">
                    No compliance notifications found.
                  </Td>
                </Tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.recipientId}>
                    <Td px={2} py={4}>
                      <Checkbox
                        size="sm"
                        colorScheme="purple"
                        isChecked={selectedIds.includes(row.recipientId)}
                        onChange={() => onToggleSelect(row.recipientId)}
                      />
                    </Td>
                    <Td px={4} py={4}>
                      <Text color="#101928" fontSize="12px" fontWeight="600">{row.recipientName ?? '—'}</Text>
                      <Text color="#475367" mt={1} fontSize="11px">{row.recipientEmail ?? '—'}</Text>
                    </Td>
                    <Td px={4} py={4} color="#101928" fontSize="12px" fontWeight="500">
                      {row.courseTitle ?? row.examTitle ?? '—'}
                    </Td>
                    <Td px={4} py={4} color="#101928" fontSize="12px">{row.entityType ?? '—'}</Td>
                    <Td px={4} py={4}>
                      <Badge colorScheme={COMPLIANCE_STATUS_COLOR[row.complianceStatus] ?? 'gray'} fontSize="10px">
                        {row.complianceStatus ?? '—'}
                      </Badge>
                    </Td>
                    <Td px={4} py={4} color="#101928" fontSize="12px">{row.overdueStatus ?? '—'}</Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">{fmtDate(row.dueDate)}</Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">{row.lastDeliveryStatus ?? '—'}</Td>
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
                          <MenuItem fontSize="14px" onClick={() => onViewHistory(row)}>
                            View History
                          </MenuItem>
                          <MenuItem fontSize="14px" onClick={() => onSend(row)}>
                            Send Notification
                          </MenuItem>
                          {row.complianceStatus === 'Non-Compliant' && (
                            <MenuItem fontSize="14px" color="orange.600" onClick={() => onEscalate(row)}>
                              Escalate
                            </MenuItem>
                          )}
                          {row.lastDeliveryStatus === 'Failed' && (
                            <MenuItem fontSize="14px" color="red.600" onClick={() => onResend(row)}>
                              Resend
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
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
            Showing {rows.length} of {total} items
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
              isDisabled={rows.length < limit}
              onClick={() => onPageChange(page + 1)}
            />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
};

export default ComplianceNotificationsTable;
