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
  Badge,
  useDisclosure,
  BreadcrumbItem,
} from '@chakra-ui/react';
import { Route, useHistory } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiChevronDown,
} from 'react-icons/fi';
import { AdminMainAreaWrapper } from '../../../layouts';
import { Breadcrumb, Link } from '../../../components';
import ScheduleReportModal from './components/ScheduleReportModal';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_STATS = [
  { label: 'Total Events Logged', value: '340', sub: '+5% vs last period', subColor: '#38A169' },
  { label: 'Unauthorized Access Attempts', value: '82%', sub: '+5% vs last month', subColor: '#38A169' },
  { label: 'Administrative Actions', value: '45', sub: 'per role', subColor: '#1A202C' },
  { label: 'Failed Login Count', value: '45', sub: 'logins/week', subColor: '#1A202C' },
];

const MOCK_ROWS = [
  { id: 'EVT-00122', user: 'John Doe', role: 'Learner', action: 'Added User', module: 'LMS', date: '26/11/2025', time: '11:30am', ip: '10.10.1.23', status: 'Failed' },
  { id: 'EVT-00122', user: 'Admin 1', role: 'Admin', action: 'Login Attempt', module: 'OES', date: '26/11/2025', time: '11:30am', ip: '10.10.1.23', status: 'Success' },
  { id: 'EVT-00122', user: 'John Doe', role: 'Learner', action: 'Export Report', module: 'OES', date: '26/11/2025', time: '11:30am', ip: '10.10.1.23', status: 'Success' },
  { id: 'EVT-00122', user: 'Jane Smith', role: 'Instructor', action: 'Login Attempt', module: 'Admin', date: '26/11/2025', time: '11:30am', ip: '10.10.1.23', status: 'Failed' },
  { id: 'EVT-00122', user: 'Admin 1', role: 'Admin', action: 'Added User', module: 'Security', date: '26/11/2025', time: '11:30am', ip: '10.10.1.23', status: 'Success' },
  { id: 'EVT-00122', user: 'Jane Smith', role: 'Instructor', action: 'Export Report', module: 'OES', date: '26/11/2025', time: '11:30am', ip: '10.10.1.23', status: 'Failed' },
];

// ─── Stat Block ────────────────────────────────────────────────────────────────
const StatBlock = ({ label, value, sub, subColor }) => (
  <Box bg="white" p="20px" borderRadius="10px" flex="1" boxShadow="sm">
    <Text fontSize="14px" fontWeight="600" color="#1A202C" mb={3}>
      {label}
    </Text>
    <Text fontSize="28px" fontWeight="700" color="#101928" lineHeight="1.1" mb={2}>
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
const RowActionMenu = ({ rowIndex, openMenu, setOpenMenu, onArchive }) => {
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
            onClick={() => {
              setOpenMenu(null);
              onArchive();
            }}
          >
            Archive report
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ComplianceSecurityReportPage = () => {
  const history = useHistory();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();

  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Pad the mock data up to 10 rows just so pagination is somewhat visible
  const paddedRows = [...MOCK_ROWS, ...MOCK_ROWS].slice(0, 10);

  const filtered = paddedRows.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.action.toLowerCase().includes(search.toLowerCase())
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
    { label: 'Event ID', flex: '1' },
    { label: 'User', flex: '1' },
    { label: 'Role', flex: '0.8' },
    { label: 'Action', flex: '1.2' },
    { label: 'Module', flex: '0.8' },
    { label: 'Date and Time', flex: '1.4' },
    { label: 'IP Address', flex: '1' },
    { label: 'Status', flex: '1' },
    { label: 'Action', flex: '0.6', align: 'center' },
  ];

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/studentReport">Reports</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Compliance &amp; Security</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} mt={6}>
        <HStack>
          <Text fontSize="26px" fontWeight="700" color="#1A202C">
            Compliance & Security Reports
          </Text>
          <FiChevronDown color="#1A202C" size={24} style={{ cursor: 'pointer' }} />
        </HStack>
        <HStack spacing={4}>
          <Button
            variant="outline"
            color="#6b006b"
            borderColor="#6b006b"
            _hover={{ bg: '#fdf5fd' }}
            borderRadius="8px"
            fontWeight="600"
            fontSize="14px"
            height="42px"
            px={6}
            onClick={onScheduleOpen}
          >
            Schedule report
          </Button>
          <Button
            bg="#6b006b"
            color="white"
            _hover={{ bg: '#550055' }}
            borderRadius="8px"
            fontWeight="600"
            fontSize="14px"
            height="42px"
            px={6}
          >
            Export Report
          </Button>
        </HStack>
      </Flex>

      {/* Tab Indicator */}
      <Box mb={8} borderBottom="1.5px solid #E2E8F0">
        <Text
          display="inline-block"
          pb={4}
          px={1}
          fontSize="14px"
          fontWeight="600"
          color="#6b006b"
          borderBottom="2px solid #6b006b"
          mb="-1.5px" // overlap the border
          cursor="pointer"
        >
          Audit Trail Report
        </Text>
      </Box>

      {/* Stats Row */}
      <Flex gap={4} mb={8}>
        {MOCK_STATS.map((stat, idx) => (
          <StatBlock key={idx} {...stat} />
        ))}
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
          <Box minW="1000px">
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
                <Text color="#718096" fontSize="14px">No records found.</Text>
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
                        <Text fontSize="13px" color="#4A5568">{row.id}</Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="13px" color="#1A202C" fontWeight="500">{row.user}</Text>
                      </Box>
                      <Box flex="0.8">
                        <Text fontSize="13px" color="#4A5568">{row.role}</Text>
                      </Box>
                      <Box flex="1.2">
                        <Text fontSize="13px" color="#4A5568">{row.action}</Text>
                      </Box>
                      <Box flex="0.8">
                        <Text fontSize="13px" color="#4A5568">{row.module}</Text>
                      </Box>
                      <Box flex="1.4">
                        <Text fontSize="13px" color="#1A202C" display="block">{row.date}</Text>
                        <Text fontSize="12px" color="#718096" display="block">{row.time}</Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="13px" color="#4A5568">{row.ip}</Text>
                      </Box>
                      <Box flex="1">
                        <Badge
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="12px"
                          fontWeight="500"
                          textTransform="none"
                          bg={row.status === 'Success' ? '#ECFDF3' : '#FEF3F2'}
                          color={row.status === 'Success' ? '#027A48' : '#B42318'}
                        >
                          {row.status}
                        </Badge>
                      </Box>
                      <Box flex="0.6" display="flex" justifyContent="center">
                        <RowActionMenu
                          rowIndex={globalIdx}
                          openMenu={openMenu}
                          setOpenMenu={setOpenMenu}
                          onArchive={() => history.push('/admin/report/custom')}
                        />
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

      <ScheduleReportModal isOpen={isScheduleOpen} onClose={onScheduleClose} />
    </AdminMainAreaWrapper>
  );
};

export const ComplianceSecurityReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ComplianceSecurityReportPage {...props} />} />
);

export default ComplianceSecurityReportPage;