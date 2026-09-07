import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Route } from 'react-router-dom';
import {
  Box, Flex, Grid, SimpleGrid,
  Tab, TabList, TabPanel, TabPanels, Tabs,
  Select,
  Input,
  Table, Thead, Tbody, Tr, Th, Td,
  useToast,
  Skeleton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure,
  HStack,
  VStack,
  Text as CText,
  BreadcrumbItem,
} from '@chakra-ui/react';
import { FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import {
  adminGetDashboardFilters,
  adminGetDashboardV2,
  adminGetDashboardKPIs,
  adminExportDashboard,
  adminEndDashboardInteraction,
} from '../../../services';
import { Text, Heading, Breadcrumb, Link } from '../../../components';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler,
);

// ─── Shared chart options ───────────────────────────────────────────────────

const BAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
  },
};

const DOUGHNUT_OPTIONS = { maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } };

const BRAND = '#660066';

// ─── KPI Card ───────────────────────────────────────────────────────────────

const KPICard = ({ title, value, loading, accent = '#660066' }) => (
  <Box bg="white" p={5} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
    <CText fontSize="13px" fontWeight="500" color="#667085" mb={1}>{title}</CText>
    {loading
      ? <Skeleton h="32px" w="60%" borderRadius="md" mt={1} />
      : <CText fontSize="26px" fontWeight="700" color="#101928">{value ?? '—'}</CText>
    }
  </Box>
);

// ─── Chart card wrapper ─────────────────────────────────────────────────────

const ChartCard = ({ title, h = '260px', children }) => (
  <Box bg="white" p={5} borderRadius="xl" border="1px solid #E4E7EC" boxShadow="sm">
    <CText fontSize="15px" fontWeight="600" color="#101928" mb={4}>{title}</CText>
    <Box h={h}>{children}</Box>
  </Box>
);

// ─── Donut legend row ───────────────────────────────────────────────────────

const DonutLegend = ({ color, label, value }) => (
  <Flex justify="space-between" align="center">
    <HStack>
      <Box w="10px" h="10px" bg={color} borderRadius="full" />
      <CText fontSize="12px">{label}</CText>
    </HStack>
    <CText fontSize="12px" fontWeight="600">{value}</CText>
  </Flex>
);

// ─── Generic empty state ────────────────────────────────────────────────────

const EmptyPane = ({ message = 'No data available.' }) => (
  <Flex justify="center" align="center" h="200px" direction="column" gap={2}>
    <CText fontSize="14px" color="gray.400">{message}</CText>
  </Flex>
);

const ErrorPane = ({ message, onRetry }) => (
  <Flex justify="center" align="center" h="200px" direction="column" gap={3}>
    <FiAlertTriangle size={24} color="#E53E3E" />
    <CText fontSize="14px" color="red.500">{message}</CText>
    {onRetry && <Box as="button" px={4} py={2} bg={BRAND} color="white" borderRadius="md" fontSize="13px" onClick={onRetry}>Retry</Box>}
  </Flex>
);

// ─── Generic visualization renderers ───────────────────────────────────────
// The API's `visualizations` entries only guarantee { type, title, data: [...] }
// — row shape isn't documented, so label/value columns are picked from
// whatever keys are actually present rather than hardcoded field names.

const findViz = (visualizations, type) => (visualizations ?? []).find((v) => v.type === type);

const rowsOf = (viz) => (Array.isArray(viz?.data) ? viz.data.filter(Boolean) : []);

const LABEL_KEY_CANDIDATES = ['label', 'name', 'title', 'course', 'courseTitle', 'department', 'category', 'month', 'day', 'date', 'range'];
const VALUE_KEY_CANDIDATES = ['value', 'count', 'total', 'rate', 'score', 'completionRate', 'enrollmentCount', 'logins', 'percentage'];

const guessLabelKey = (row) => LABEL_KEY_CANDIDATES.find((k) => row[k] !== undefined)
  ?? Object.keys(row).find((k) => typeof row[k] === 'string');

const guessValueKey = (row, labelKey) => VALUE_KEY_CANDIDATES.find((k) => row[k] !== undefined)
  ?? Object.keys(row).find((k) => k !== labelKey && typeof row[k] === 'number');

const PIE_COLORS = [BRAND, '#00A143', '#F97316', '#CC0C0C', '#0083E2', '#E4E7EC'];

const GenericBarChart = ({ viz, color = BRAND }) => {
  const rows = rowsOf(viz);
  if (rows.length === 0) return <EmptyPane />;
  const labelKey = guessLabelKey(rows[0]);
  const valueKey = guessValueKey(rows[0], labelKey);
  const chartData = {
    labels: rows.map((r) => String(r[labelKey] ?? '')),
    datasets: [{
      label: viz.title,
      data: rows.map((r) => Number(r[valueKey]) || 0),
      backgroundColor: color,
      borderRadius: 4,
    }],
  };
  return <Bar data={chartData} options={BAR_OPTIONS} />;
};

const GenericPieChart = ({ viz }) => {
  const rows = rowsOf(viz);
  if (rows.length === 0) return <EmptyPane />;
  const labelKey = guessLabelKey(rows[0]);
  const valueKey = guessValueKey(rows[0], labelKey);
  const chartData = {
    labels: rows.map((r) => String(r[labelKey] ?? '')),
    datasets: [{
      data: rows.map((r) => Number(r[valueKey]) || 0),
      backgroundColor: PIE_COLORS,
      borderWidth: 0,
    }],
  };
  return (
    <>
      <Box h="180px" display="flex" justifyContent="center">
        <Doughnut data={chartData} options={DOUGHNUT_OPTIONS} />
      </Box>
      <VStack align="stretch" mt={3} spacing={1}>
        {rows.map((r, i) => (
          <DonutLegend key={r[labelKey] ?? i} color={PIE_COLORS[i % PIE_COLORS.length]} label={String(r[labelKey])} value={r[valueKey]} />
        ))}
      </VStack>
    </>
  );
};

const humanizeKey = (key) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

const formatCell = (key, value) => {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return /rate|percentage|percent/i.test(key) ? `${value}%` : value.toLocaleString();
  return String(value);
};

const GenericTable = ({ viz, emptyMessage = 'No data available.' }) => {
  const rows = rowsOf(viz);
  if (rows.length === 0) return <EmptyPane message={emptyMessage} />;
  const columns = Object.keys(rows[0]);
  return (
    <Table variant="simple" size="sm">
      <Thead bg="#F9FAFB">
        <Tr>
          {columns.map((c) => (
            <Th key={c} textTransform="none" fontSize="12px" fontWeight="500" color="#667085" py={3}>{humanizeKey(c)}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, i) => (
          <Tr key={row.id ?? i}>
            {columns.map((c) => (
              <Td key={c} fontSize="13px">{formatCell(c, row[c])}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

// ─── Filters bar ────────────────────────────────────────────────────────────

const FiltersBar = ({ filters, filterOptions, onChange, onExport, exporting }) => (
  <Flex gap={3} flexWrap="wrap" align="center" mb={6} p={4} bg="white" borderRadius="xl" border="1px solid #E4E7EC">
    <Select
      size="sm" borderRadius="md" placeholder="All Departments" w="180px"
      value={filters.departmentId}
      onChange={(e) => onChange({ ...filters, departmentId: e.target.value })}
    >
      {(filterOptions.departments ?? []).map((d) => (
        <option key={d.id ?? d} value={d.id ?? d}>{d.name ?? d}</option>
      ))}
    </Select>
    <Select
      size="sm" borderRadius="md" placeholder="All Courses" w="180px"
      value={filters.courseId}
      onChange={(e) => onChange({ ...filters, courseId: e.target.value })}
    >
      {(filterOptions.courses ?? []).map((c) => (
        <option key={c.id ?? c} value={c.id ?? c}>{c.title ?? c.name ?? c}</option>
      ))}
    </Select>
    <Input
      type="date" size="sm" borderRadius="md" w="150px"
      value={filters.startDate}
      onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
    />
    <Input
      type="date" size="sm" borderRadius="md" w="150px"
      value={filters.endDate}
      onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
    />
    <Box flex={1} />
    <Box
      as="button" display="flex" alignItems="center" gap={2}
      px={4} py="7px" borderRadius="md" border="1px solid #660066" color="#660066"
      fontSize="13px" fontWeight="600" _hover={{ bg: '#f9eef9' }}
      onClick={onExport} disabled={exporting}
    >
      <FiDownload size={14} />
      {exporting ? 'Exporting…' : 'Export'}
    </Box>
  </Flex>
);

// ─── Dashboard interaction tracking ─────────────────────────────────────────
// Each GET /dashboard-v2?type=... response carries an interactionId. It must
// be ended (PATCH .../interaction/{id}/end) whenever the user leaves that
// view — a fresh load replacing it, or the tab/page unmounting — otherwise
// the "Average User Engagement Duration" KPI has nothing to measure.

const useTrackDashboardInteraction = () => {
  const interactionIdRef = useRef(null);

  const setInteractionId = useCallback((newId) => {
    const prevId = interactionIdRef.current;
    interactionIdRef.current = newId ?? null;
    if (prevId && prevId !== newId) adminEndDashboardInteraction(prevId);
  }, []);

  useEffect(() => {
    const endCurrent = () => adminEndDashboardInteraction(interactionIdRef.current);
    window.addEventListener('pagehide', endCurrent);
    return () => {
      window.removeEventListener('pagehide', endCurrent);
      endCurrent();
    };
  }, []);

  return setInteractionId;
};

// ─── ACADEMIC TAB ────────────────────────────────────────────────────────────

const AcademicTab = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const setInteractionId = useTrackDashboardInteraction();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    adminGetDashboardV2('academic', params)
      .then(({ dashboard }) => { setData(dashboard); setInteractionId(dashboard?.interactionId); })
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.courseId, filters.startDate, filters.endDate, setInteractionId]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};
  const barViz = findViz(data?.visualizations, 'BarChart');
  const tableViz = findViz(data?.visualizations, 'Table');

  if (error) return <ErrorPane message={error} onRetry={load} />;

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
        {[
          { title: 'Total Courses', value: kpis.totalCourses },
          { title: 'Enrollments', value: kpis.courseEnrollmentCount },
          { title: 'Completion Rate', value: kpis.courseCompletionRate != null ? `${kpis.courseCompletionRate}%` : null },
          { title: 'Average Score', value: kpis.averageScore != null ? `${kpis.averageScore}%` : null },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
        {[
          { title: 'Certificates', value: kpis.certificateIssuedCount },
          { title: 'Exam Attempts', value: kpis.examAttempts },
          { title: 'Exam Pass Rate', value: kpis.examPassRate != null ? `${kpis.examPassRate}%` : null },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>

      <ChartCard title={barViz?.title ?? 'Top Courses by Enrollment'} h="280px">
        {loading ? <Skeleton h="220px" /> : <GenericBarChart viz={barViz} />}
      </ChartCard>

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" mt={6}>
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Flex align="center" gap={2}>
            <FiAlertTriangle color="#D97706" />
            <CText fontSize="15px" fontWeight="600" color="#101928">{tableViz?.title ?? 'Low Completion Courses'}</CText>
          </Flex>
        </Box>
        {loading ? (
          <Box p={4}><Skeleton h="40px" mb={2} /><Skeleton h="40px" /></Box>
        ) : (
          <GenericTable viz={tableViz} emptyMessage="No low-completion courses found." />
        )}
      </Box>
    </>
  );
};

// ─── ADMINISTRATIVE TAB ──────────────────────────────────────────────────────

const AdministrativeTab = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const setInteractionId = useTrackDashboardInteraction();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    adminGetDashboardV2('administrative', params)
      .then(({ dashboard }) => { setData(dashboard); setInteractionId(dashboard?.interactionId); })
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.startDate, filters.endDate, setInteractionId]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};
  const barViz = findViz(data?.visualizations, 'BarChart');
  const tableViz = findViz(data?.visualizations, 'Table');

  if (error) return <ErrorPane message={error} onRetry={load} />;

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
        {[
          { title: 'Total Students', value: kpis.totalStudents },
          { title: 'Active Instructors', value: kpis.activeInstructors },
          { title: 'New Enrollments', value: kpis.newEnrollments },
          { title: 'Enrollment Rate', value: kpis.enrollmentRate != null ? `${kpis.enrollmentRate}%` : null },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
        {[
          { title: 'System Usage', value: kpis.systemUsageRate != null ? `${kpis.systemUsageRate}%` : null },
          { title: 'Active Users', value: kpis.activeUsers },
          { title: 'Registered Users', value: kpis.totalRegistered },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>

      <ChartCard title={barViz?.title ?? 'Department Performance'} h="280px">
        {loading ? <Skeleton h="220px" /> : <GenericBarChart viz={barViz} />}
      </ChartCard>

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" mt={6}>
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <CText fontSize="15px" fontWeight="600" color="#101928">{tableViz?.title ?? 'Course Popularity Index'}</CText>
        </Box>
        {loading ? (
          <Box p={4}><Skeleton h="40px" mb={2} /><Skeleton h="40px" /></Box>
        ) : (
          <GenericTable viz={tableViz} />
        )}
      </Box>
    </>
  );
};

// ─── PERFORMANCE TAB ─────────────────────────────────────────────────────────

const PerformanceTab = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const setInteractionId = useTrackDashboardInteraction();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.courseId) params.courseId = filters.courseId;
    adminGetDashboardV2('performance', params)
      .then(({ dashboard }) => { setData(dashboard); setInteractionId(dashboard?.interactionId); })
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.courseId, setInteractionId]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};
  const cps = kpis.combinedPerformanceScore ?? {};
  const tableViz = findViz(data?.visualizations, 'Table');
  const barViz = findViz(data?.visualizations, 'BarChart');

  if (error) return <ErrorPane message={error} onRetry={load} />;

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
        {[
          { title: 'Quiz Average', value: kpis.quizAverageScore != null ? `${kpis.quizAverageScore}%` : null },
          { title: 'Exam Average', value: kpis.examAverageScore != null ? `${kpis.examAverageScore}%` : null },
          { title: 'Feedback Rating', value: kpis.feedbackAvailable ? kpis.feedbackRating : 'Not available' },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
        {[
          { title: 'Assessment Score', value: cps.averageAssessmentScore != null ? `${cps.averageAssessmentScore}%` : null },
          { title: 'Attendance Score', value: cps.averageAttendanceScore != null ? `${cps.averageAttendanceScore}%` : null },
          { title: 'Examination Score', value: cps.averageExaminationScore != null ? `${cps.averageExaminationScore}%` : null },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>

      <ChartCard title={barViz?.title ?? 'Score Distribution'} h="280px">
        {loading ? <Skeleton h="220px" /> : <GenericBarChart viz={barViz} />}
      </ChartCard>

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" mt={6}>
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <CText fontSize="15px" fontWeight="600" color="#101928">{tableViz?.title ?? 'Top Performers'}</CText>
        </Box>
        {loading ? (
          <Box p={4}>{[...Array(5)].map((_, i) => <Skeleton key={i} h="40px" mb={2} />)}</Box>
        ) : (
          <GenericTable viz={tableViz} emptyMessage="No performance data available." />
        )}
      </Box>
    </>
  );
};

// ─── ATTENDANCE TAB ──────────────────────────────────────────────────────────

const AttendanceTab = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const setInteractionId = useTrackDashboardInteraction();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    adminGetDashboardV2('attendance', params)
      .then(({ dashboard }) => { setData(dashboard); setInteractionId(dashboard?.interactionId); })
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.startDate, filters.endDate, setInteractionId]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};
  const lf = kpis.loginFrequency ?? {};
  const pieViz = findViz(data?.visualizations, 'PieChart');
  const barViz = findViz(data?.visualizations, 'BarChart');

  if (error) return <ErrorPane message={error} onRetry={load} />;

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
        {[
          { title: 'Attendance %', value: kpis.attendancePercentage != null ? `${kpis.attendancePercentage}%` : null },
          { title: 'Days Present', value: kpis.daysPresent },
          { title: 'Attendance Records', value: kpis.totalAttendanceRecords },
          { title: 'Weekly Logins', value: lf.weeklyLogins },
          { title: 'Monthly Logins', value: lf.monthlyLogins },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5} mb={6}>
        <ChartCard title={barViz?.title ?? 'Login Frequency'} h="280px">
          {loading ? <Skeleton h="220px" /> : <GenericBarChart viz={barViz} />}
        </ChartCard>
        <ChartCard title={pieViz?.title ?? 'Present vs Absent'}>
          {loading ? <Skeleton h="180px" /> : <GenericPieChart viz={pieViz} />}
        </ChartCard>
      </Grid>
    </>
  );
};

// ─── EXPORT MODAL ────────────────────────────────────────────────────────────

const ExportModal = ({ isOpen, onClose, activeTab, filters }) => {
  const toast = useToast();
  const [format, setFormat] = useState('PDF');
  const [exporting, setExporting] = useState(false);

  const tabToType = ['academic', 'administrative', 'performance', 'attendance'];

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminExportDashboard({
        dashboardType: tabToType[activeTab] ?? 'academic',
        exportFormat: format,
        filters: {
          departmentId: filters.departmentId || undefined,
          courseId: filters.courseId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${tabToType[activeTab]}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ description: 'Export downloaded successfully.', status: 'success', position: 'top' });
      onClose();
    } catch (err) {
      toast({ description: err?.response?.data?.message || 'Export failed.', status: 'error', position: 'top' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader fontSize="15px" fontWeight="700" color="#101928">Export Dashboard</ModalHeader>
        <ModalCloseButton mt={3} mr={2} />
        <ModalBody>
          <CText fontSize="13px" color="#667085" mb={3}>Select export format for the current dashboard view.</CText>
          <Select value={format} onChange={(e) => setFormat(e.target.value)} borderRadius="md" fontSize="14px">
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
            <option value="CSV">CSV</option>
          </Select>
        </ModalBody>
        <ModalFooter gap={3} pb={4}>
          <Box as="button" flex={1} py={2} borderRadius="md" border="1px solid #D0D5DD" color="#344054" fontSize="14px" fontWeight="600" onClick={onClose}>Cancel</Box>
          <Box as="button" flex={1} py={2} borderRadius="md" bg={BRAND} color="white" fontSize="14px" fontWeight="600" onClick={handleExport} opacity={exporting ? 0.7 : 1}>
            {exporting ? 'Exporting…' : 'Download'}
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

const InteractiveDashboard = () => {
  const [filterOptions, setFilterOptions] = useState({ courses: [], departments: [], exportFormats: [] });
  const [filters, setFilters] = useState({ departmentId: '', courseId: '', startDate: '', endDate: '' });
  const [systemKPIs, setSystemKPIs] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();

  useEffect(() => {
    adminGetDashboardFilters()
      .then(setFilterOptions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setKpiLoading(true);
    adminGetDashboardKPIs()
      .then(({ kpis }) => setSystemKPIs(kpis))
      .catch(() => {})
      .finally(() => setKpiLoading(false));
  }, []);

  const TAB_LABELS = ['Academic', 'Administrative', 'Performance', 'Attendance'];

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin">Dashboard</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Interactive Dashboard</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Flex justify="space-between" align="center" mb={5}>
        <Box>
          <Heading as="h1" fontSize="heading.h3">Interactive Dashboard</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>Real-time analytics across all platform modules</Text>
        </Box>
        <Box
          as="button" display="flex" alignItems="center" gap={2}
          px={5} py={2} borderRadius="md" bg={BRAND} color="white"
          fontSize="14px" fontWeight="600" _hover={{ bg: '#550055' }}
          onClick={onExportOpen}
        >
          <FiDownload size={14} />
          Export
        </Box>
      </Flex>

      {/* System KPI strip */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={5}>
        {[
          { title: 'Active Dashboard Users', value: systemKPIs?.activeDashboardUsers },
          { title: 'Avg Engagement (sec)', value: systemKPIs?.avgEngagementDurationSeconds != null ? `${systemKPIs.avgEngagementDurationSeconds}s` : null },
          { title: 'Avg Engagement (ms)', value: systemKPIs?.avgEngagementDurationMs != null ? `${systemKPIs.avgEngagementDurationMs}ms` : null },
        ].map((k) => <KPICard key={k.title} {...k} loading={kpiLoading} />)}
      </SimpleGrid>

      <FiltersBar
        filters={filters}
        filterOptions={filterOptions}
        onChange={setFilters}
        onExport={onExportOpen}
        exporting={false}
      />

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden">
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="purple" isLazy variant="unstyled">
          <Box borderBottom="1px solid #E4E7EC">
            <TabList px={4} overflowX="auto"
              sx={{ '&::-webkit-scrollbar': { height: '3px' }, '&::-webkit-scrollbar-thumb': { background: '#E4E7EC', borderRadius: '10px' } }}>
              {TAB_LABELS.map((label) => (
                <Tab
                  key={label}
                  fontSize="13px" fontWeight="500" color="#344054" px={4} py={3} mr={2}
                  borderBottom="2px solid transparent"
                  _selected={{ color: BRAND, borderBottom: `2px solid ${BRAND}`, fontWeight: '600' }}
                  _focus={{ boxShadow: 'none' }}
                >
                  {label}
                </Tab>
              ))}
            </TabList>
          </Box>
          <TabPanels>
            <TabPanel p={5}><AcademicTab filters={filters} /></TabPanel>
            <TabPanel p={5}><AdministrativeTab filters={filters} /></TabPanel>
            <TabPanel p={5}><PerformanceTab filters={filters} /></TabPanel>
            <TabPanel p={5}><AttendanceTab filters={filters} /></TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <ExportModal isOpen={isExportOpen} onClose={onExportClose} activeTab={activeTab} filters={filters} />
    </AdminMainAreaWrapper>
  );
};

export const InteractiveDashboardRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <InteractiveDashboard {...props} />} />
);

export default InteractiveDashboard;
