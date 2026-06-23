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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useCallback, useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import {
  Box, Flex, Grid, SimpleGrid,
  Badge,
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
  adminGetAcademicDashboardV2,
  adminGetAdministrativeDashboard,
  adminGetPerformanceDashboard,
  adminGetAttendanceDashboard,
  adminGetDashboardKPIs,
  adminExportDashboard,
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

const LINE_OPTIONS = {
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
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

// ─── ACADEMIC TAB ────────────────────────────────────────────────────────────

const AcademicTab = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    adminGetAcademicDashboardV2(params)
      .then(({ dashboard }) => setData(dashboard))
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.courseId, filters.startDate, filters.endDate]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};
  const lowCompletion = (data?.lowCompletionCourses ?? []).filter(Boolean);

  const barData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: 'Completion Rate',
      data: data?.visualizations?.find((v) => v.type === 'BarChart')?.data?.values ?? Array(12).fill(0),
      backgroundColor: BRAND,
      borderRadius: 4,
    }],
  };

  const doughnutData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [kpis.courseCompletionRate ?? 60, 100 - (kpis.courseCompletionRate ?? 60) - 10, 10],
      backgroundColor: ['#660066', '#F97316', '#E4E7EC'],
      borderWidth: 0,
    }],
  };

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

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5} mb={6}>
        <ChartCard title="Course Completion Trend">
          <Bar data={barData} options={BAR_OPTIONS} />
        </ChartCard>
        <ChartCard title="Enrollment Distribution">
          <Box h="180px" display="flex" justifyContent="center">
            <Doughnut data={doughnutData} options={DOUGHNUT_OPTIONS} />
          </Box>
          <VStack align="stretch" mt={3} spacing={1}>
            <DonutLegend color="#660066" label="Completed" value={`${kpis.courseCompletionRate ?? '—'}%`} />
            <DonutLegend color="#F97316" label="In Progress" value="—" />
            <DonutLegend color="#E4E7EC" label="Not Started" value="—" />
          </VStack>
        </ChartCard>
      </Grid>

      {/* Low completion courses */}
      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" mb={6}>
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Flex align="center" gap={2}>
            <FiAlertTriangle color="#D97706" />
            <CText fontSize="15px" fontWeight="600" color="#101928">Low Completion Courses (Below 30%)</CText>
          </Flex>
        </Box>
        {loading ? (
          <Box p={4}><Skeleton h="40px" mb={2} /><Skeleton h="40px" /></Box>
        ) : lowCompletion.length === 0 ? (
          <EmptyPane message="No low-completion courses found." />
        ) : (
          <Table variant="simple" size="sm">
            <Thead bg="#FFF8F0">
              <Tr>
                {['Course', 'Completion %', 'Enrollments', 'Status'].map((h) => (
                  <Th key={h} textTransform="none" fontSize="12px" fontWeight="500" color="#667085" py={3}>{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {lowCompletion.map((c, i) => (
                <Tr key={i}>
                  <Td fontSize="13px" fontWeight="500">{c.title ?? c.courseTitle ?? c.course ?? '—'}</Td>
                  <Td fontSize="13px" color="#D97706" fontWeight="600">{c.completionRate != null ? `${c.completionRate}%` : '—'}</Td>
                  <Td fontSize="13px">{c.enrollmentCount ?? c.enrolled ?? '—'}</Td>
                  <Td><Badge colorScheme="orange" fontSize="11px" borderRadius="full" px={3}>Low</Badge></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
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

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    adminGetAdministrativeDashboard(params)
      .then(({ dashboard }) => setData(dashboard))
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.startDate, filters.endDate]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};

  const deptBarData = {
    labels: (data?.departmentPerformance ?? []).map((d) => d.department ?? d.name ?? ''),
    datasets: [{
      label: 'Completion Rate',
      data: (data?.departmentPerformance ?? []).map((d) => d.completionRate ?? d.value ?? 0),
      backgroundColor: BRAND,
      borderRadius: 4,
    }],
  };

  const userStatusData = {
    labels: ['Active', 'Pending', 'Inactive'],
    datasets: [{
      data: [kpis.activeUsers ?? 80, 15, 5],
      backgroundColor: ['#00A143', '#F97316', '#CC0C0C'],
      borderWidth: 0,
    }],
  };

  const enrollmentTrendData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: 'New Enrollments',
      data: data?.enrollmentTrend ?? Array(12).fill(0),
      borderColor: BRAND,
      backgroundColor: 'rgba(102,0,102,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
    }],
  };

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

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5} mb={6}>
        <ChartCard title="Enrollment Trend">
          <Line data={enrollmentTrendData} options={LINE_OPTIONS} />
        </ChartCard>
        <ChartCard title="User Account Status">
          <Box h="180px" display="flex" justifyContent="center">
            <Doughnut data={userStatusData} options={DOUGHNUT_OPTIONS} />
          </Box>
          <VStack align="stretch" mt={3} spacing={1}>
            <DonutLegend color="#00A143" label="Active" value={kpis.activeUsers ?? '—'} />
            <DonutLegend color="#F97316" label="Pending" value="—" />
            <DonutLegend color="#CC0C0C" label="Inactive" value="—" />
          </VStack>
        </ChartCard>
      </Grid>

      {(data?.departmentPerformance ?? []).length > 0 && (
        <ChartCard title="Department Performance">
          <Bar data={deptBarData} options={BAR_OPTIONS} />
        </ChartCard>
      )}
    </>
  );
};

// ─── PERFORMANCE TAB ─────────────────────────────────────────────────────────

const PerformanceTab = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.courseId) params.courseId = filters.courseId;
    adminGetPerformanceDashboard(params)
      .then(({ dashboard }) => setData(dashboard))
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.courseId]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};
  const fb = kpis.feedbackRating ?? {};
  const topPerformers = data?.topPerformers ?? [];

  const trendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Avg Score',
      data: data?.performanceTrend ?? [60, 65, 72, 80],
      borderColor: BRAND,
      backgroundColor: 'rgba(102,0,102,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
    }],
  };

  if (error) return <ErrorPane message={error} onRetry={load} />;

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
        {[
          { title: 'Quiz Average', value: kpis.quizAverageScore != null ? `${kpis.quizAverageScore}%` : null },
          { title: 'Exam Average', value: kpis.examAverageScore != null ? `${kpis.examAverageScore}%` : null },
          { title: 'Assessment Rating', value: fb.averageAssessmentScore != null ? `${fb.averageAssessmentScore}%` : null },
          { title: 'Attendance Rating', value: fb.averageAttendanceScore != null ? `${fb.averageAttendanceScore}%` : null },
          { title: 'Examination Rating', value: fb.averageExaminationScore != null ? `${fb.averageExaminationScore}%` : null },
        ].map((k) => <KPICard key={k.title} {...k} loading={loading} />)}
      </SimpleGrid>

      <ChartCard title="Performance Trend" h="280px">
        <Line data={trendData} options={LINE_OPTIONS} />
      </ChartCard>

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" mt={6}>
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <CText fontSize="15px" fontWeight="600" color="#101928">Top 10 Performers</CText>
        </Box>
        {loading ? (
          <Box p={4}>{[...Array(5)].map((_, i) => <Skeleton key={i} h="40px" mb={2} />)}</Box>
        ) : topPerformers.length === 0 ? (
          <EmptyPane message="No performance data available." />
        ) : (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                {['Rank', 'Student', 'Department', 'Avg Score', 'Attendance', 'Exams Passed'].map((h) => (
                  <Th key={h} textTransform="none" fontSize="12px" fontWeight="500" color="#667085" py={3}>{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {topPerformers.slice(0, 10).map((s, i) => (
                <Tr key={s.id ?? i}>
                  <Td>
                    <Badge
                      bg={i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#F2F4F7'}
                      color={i < 3 ? '#101928' : '#667085'}
                      borderRadius="full" px={3} fontSize="12px" fontWeight="700"
                    >
                      #{i + 1}
                    </Badge>
                  </Td>
                  <Td fontSize="13px" fontWeight="500">{[s.firstName, s.lastName].filter(Boolean).join(' ') || s.name || '—'}</Td>
                  <Td fontSize="13px" color="#667085">{s.department ?? '—'}</Td>
                  <Td fontSize="13px" fontWeight="600" color="#101928">{s.averageScore != null ? `${s.averageScore}%` : '—'}</Td>
                  <Td fontSize="13px">{s.attendance != null ? `${s.attendance}%` : '—'}</Td>
                  <Td fontSize="13px">{s.examsPassed ?? '—'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
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

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    adminGetAttendanceDashboard(params)
      .then(({ dashboard }) => setData(dashboard))
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [filters.departmentId, filters.startDate, filters.endDate]);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis ?? {};
  const lf = kpis.loginFrequency ?? {};

  const attendanceTrendData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: 'Attendance %',
      data: data?.attendanceTrend ?? Array(12).fill(0),
      borderColor: '#00A143',
      backgroundColor: 'rgba(0,161,67,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
    }],
  };

  const loginBarData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: 'Monthly Logins',
      data: data?.loginTrend ?? Array(12).fill(0),
      backgroundColor: BRAND,
      borderRadius: 4,
    }],
  };

  const deviceData = {
    labels: ['Desktop', 'Mobile'],
    datasets: [{
      data: [data?.deviceBreakdown?.desktop ?? 70, data?.deviceBreakdown?.mobile ?? 30],
      backgroundColor: [BRAND, '#F97316'],
      borderWidth: 0,
    }],
  };

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
        <ChartCard title="Attendance Trend">
          <Line data={attendanceTrendData} options={LINE_OPTIONS} />
        </ChartCard>
        <ChartCard title="Logins by Device">
          <Box h="180px" display="flex" justifyContent="center">
            <Doughnut data={deviceData} options={DOUGHNUT_OPTIONS} />
          </Box>
          <VStack align="stretch" mt={3} spacing={1}>
            <DonutLegend color={BRAND} label="Desktop" value={`${data?.deviceBreakdown?.desktop ?? 70}%`} />
            <DonutLegend color="#F97316" label="Mobile" value={`${data?.deviceBreakdown?.mobile ?? 30}%`} />
          </VStack>
        </ChartCard>
      </Grid>

      <ChartCard title="Monthly Login Activity" h="280px">
        <Bar data={loginBarData} options={BAR_OPTIONS} />
      </ChartCard>
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
