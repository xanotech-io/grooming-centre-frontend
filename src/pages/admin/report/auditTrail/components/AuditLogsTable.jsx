import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td,
  HStack, IconButton, Select, Text, Input, Badge, Spinner, Tooltip,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';

const fmtName = (user) =>
  user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '—' : '—';

const fmtTime = (ts) => (ts ? new Date(ts).toLocaleString() : '—');

const statusColor = (s) => {
  if (s === 'success') return 'green';
  if (s === 'failure') return 'red';
  return 'gray';
};

const AuditLogsTable = ({
  logs,
  total,
  page,
  limit,
  isLoading,
  filters,
  onFilterChange,
  onPageChange,
  onLimitChange,
}) => (
  <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
    <Flex mb={5} gap={3} flexWrap="wrap" align="center">
      <Select
        size="sm"
        borderRadius="md"
        w="150px"
        value={filters.userRole ?? ''}
        onChange={(e) => onFilterChange('userRole', e.target.value)}
        placeholder="All Roles"
      >
        <option value="super admin">Super Admin</option>
        <option value="admin">Admin</option>
        <option value="instructor">Instructor</option>
        <option value="user">User</option>
      </Select>

      <Select
        size="sm"
        borderRadius="md"
        w="150px"
        value={filters.eventType ?? ''}
        onChange={(e) => onFilterChange('eventType', e.target.value)}
        placeholder="All Events"
      >
        {['login', 'logout', 'create', 'update', 'delete', 'approve', 'export', 'view'].map((t) => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </Select>

      <Select
        size="sm"
        borderRadius="md"
        w="130px"
        value={filters.module ?? ''}
        onChange={(e) => onFilterChange('module', e.target.value)}
        placeholder="All Modules"
      >
        {['LMS', 'OES', 'Admin', 'Security'].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </Select>

      <Select
        size="sm"
        borderRadius="md"
        w="130px"
        value={filters.status ?? ''}
        onChange={(e) => onFilterChange('status', e.target.value)}
        placeholder="All Status"
      >
        <option value="success">Success</option>
        <option value="failure">Failure</option>
      </Select>

      <Select
        size="sm"
        borderRadius="md"
        w="140px"
        value={filters.isFlagged ?? ''}
        onChange={(e) => onFilterChange('isFlagged', e.target.value)}
        placeholder="All Flags"
      >
        <option value="true">Flagged Only</option>
        <option value="false">Not Flagged</option>
      </Select>

      <Input
        size="sm"
        type="date"
        borderRadius="md"
        w="150px"
        value={filters.startDate ?? ''}
        onChange={(e) => onFilterChange('startDate', e.target.value)}
        placeholder="Start date"
      />
      <Input
        size="sm"
        type="date"
        borderRadius="md"
        w="150px"
        value={filters.endDate ?? ''}
        onChange={(e) => onFilterChange('endDate', e.target.value)}
        placeholder="End date"
      />
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
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Event ID</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">User</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Role</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Event Type</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Module</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">IP Address</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Device / Source</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Timestamp</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Status</Th>
              <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Remarks</Th>
            </Tr>
          </Thead>
          <Tbody>
            {logs.length === 0 ? (
              <Tr>
                <Td colSpan={10} textAlign="center" py={10} color="#475367" fontSize="13px">
                  No audit logs found.
                </Td>
              </Tr>
            ) : (
              logs.map((log) => (
                <Tr key={log.id} _hover={{ bg: 'gray.50' }}>
                  <Td px={4} py={3}>
                    <Flex align="center" gap={1}>
                      {log.isFlagged && (
                        <Tooltip label="Flagged / Suspicious" placement="top">
                          <Box color="orange.400"><FiAlertTriangle size={13} /></Box>
                        </Tooltip>
                      )}
                      <Text fontSize="11px" color="#475367" fontFamily="mono">
                        {log.id?.slice(0, 8)}…
                      </Text>
                    </Flex>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="12px" fontWeight="600" color="#101928">{fmtName(log.user)}</Text>
                    <Text fontSize="11px" color="#475367">{log.user?.email ?? '—'}</Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="12px" color="#101928" textTransform="capitalize">{log.userRole ?? '—'}</Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="12px" color="#101928" textTransform="capitalize">{log.eventType ?? '—'}</Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Badge colorScheme="purple" fontSize="11px" textTransform="none">{log.module ?? '—'}</Badge>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="12px" color="#475367" fontFamily="mono">{log.ipAddress ?? '—'}</Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="12px" color="#475367">{log.device ?? '—'}</Text>
                    <Text fontSize="11px" color="#98a2b3">{log.source ?? ''}</Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="12px" color="#101928">{fmtTime(log.timestamp)}</Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Badge colorScheme={statusColor(log.status)} fontSize="11px" textTransform="capitalize">
                      {log.status ?? '—'}
                    </Badge>
                  </Td>
                  <Td px={4} py={3} maxW="180px">
                    <Text fontSize="12px" color="#475367" noOfLines={2}>{log.remarks ?? '—'}</Text>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}
    </Box>

    <Flex mt={5} align="center" justify="space-between" flexWrap="wrap" gap={2}>
      <HStack spacing={2}>
        <Text color="#475367" fontSize="13px">Rows per page</Text>
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
        <Text color="#475367" fontSize="13px">
          Showing {logs.length} of {total}
        </Text>
        <HStack spacing={1}>
          <IconButton
            icon={<FiChevronLeft />}
            variant="ghost"
            size="sm"
            aria-label="Previous page"
            isDisabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          />
          <Text fontSize="13px" fontWeight="600" color="#101928" px={2}>{page}</Text>
          <IconButton
            icon={<FiChevronRight />}
            variant="ghost"
            size="sm"
            aria-label="Next page"
            isDisabled={logs.length < limit}
            onClick={() => onPageChange(page + 1)}
          />
        </HStack>
      </HStack>
    </Flex>
  </Box>
);

export default AuditLogsTable;
