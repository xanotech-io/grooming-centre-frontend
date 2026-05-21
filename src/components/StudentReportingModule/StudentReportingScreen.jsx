import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Select,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  useDisclosure,
  FormControl,
  FormLabel,
  Stack,
  Grid,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  tc0804GetStudentReports,
  tc0804CreateStudentReport,
  tc0804GetParticipationRecords,
  tc0804GetModuleKPIs,
  tc0804GetReportTemplates,
} from '../../services';
import colors from '../../theme/colors';

// ---------------------------------------------------------------------------
// Small shared sub-components
// ---------------------------------------------------------------------------

const KPICard = ({ title, value, subtext, accent }) => (
  <Box
    bg="white"
    borderRadius="12px"
    boxShadow="0 2px 10px rgba(0,0,0,0.07)"
    p={4}
    minW="140px"
    flex="1"
    borderTop={`3px solid ${accent || colors.primary.base}`}
  >
    <Text fontSize="12px" color="#697386" fontWeight={500} mb={1} noOfLines={2}>
      {title}
    </Text>
    <Text fontSize="24px" fontWeight={700} color="#000" lineHeight="1.2">
      {value ?? '—'}
    </Text>
    {subtext && (
      <Text fontSize="11px" color="#697386" mt={1}>
        {subtext}
      </Text>
    )}
  </Box>
);

const engagementConfig = {
  Active: { bg: '#DCFDD4', color: '#4FAC16' },
  Irregular: { bg: '#FAFDD4', color: '#B6A92E' },
  Inactive: { bg: '#FFC5D3', color: '#BD1F46' },
  high: { bg: '#DCFDD4', color: '#4FAC16', label: 'High' },
  medium: { bg: '#FAFDD4', color: '#B6A92E', label: 'Medium' },
  low: { bg: '#FFC5D3', color: '#BD1F46', label: 'Low' },
};

const EngagementBadge = ({ status }) => {
  const cfg = engagementConfig[status] ?? { bg: '#E8E8E8', color: '#697386' };
  const label = cfg.label ?? status;
  return (
    <Box
      as="span"
      display="inline-block"
      px={2}
      py="2px"
      borderRadius="20px"
      fontSize="11px"
      fontWeight={600}
      bg={cfg.bg}
      color={cfg.color}
    >
      {label}
    </Box>
  );
};

const AlertBadge = ({ triggered }) =>
  triggered ? (
    <Box
      as="span"
      display="inline-block"
      px={2}
      py="2px"
      borderRadius="20px"
      fontSize="11px"
      fontWeight={600}
      bg="#FFC5D3"
      color="#BD1F46"
    >
      Alert
    </Box>
  ) : (
    <Box
      as="span"
      display="inline-block"
      px={2}
      py="2px"
      borderRadius="20px"
      fontSize="11px"
      fontWeight={600}
      bg="#DCFDD4"
      color="#4FAC16"
    >
      Clear
    </Box>
  );

const ScoreBar = ({ score }) => {
  const color =
    score >= 70 ? '#4FAC16' : score >= 40 ? '#B6A92E' : '#BD1F46';
  return (
    <Flex align="center" gap={2} minW="90px">
      <Box flex={1} bg="#E8E8E8" borderRadius="4px" h="6px">
        <Box
          w={`${Math.min(score, 100)}%`}
          h="6px"
          borderRadius="4px"
          bg={color}
          transition="width 0.3s"
        />
      </Box>
      <Text fontSize="12px" fontWeight={600} color={color} minW="32px">
        {score}%
      </Text>
    </Flex>
  );
};

const thStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#697386',
  textTransform: 'uppercase',
  borderBottom: '1px solid #E8E8E8',
  whiteSpace: 'nowrap',
  background: '#FDFDFD',
};

const tdStyle = {
  padding: '10px 12px',
  fontSize: '13px',
  color: '#2D3748',
  borderBottom: '1px solid #F0F0F0',
  verticalAlign: 'middle',
};

const FilterInput = ({ placeholder, value, onChange }) => (
  <Input
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    size="sm"
    borderRadius="8px"
    bg="white"
    borderColor="#E8E8E8"
    _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
    minW="160px"
    maxW="220px"
  />
);

const FilterSelect = ({ value, onChange, children, minW }) => (
  <Select
    value={value}
    onChange={onChange}
    size="sm"
    borderRadius="8px"
    bg="white"
    borderColor="#E8E8E8"
    _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
    minW={minW ?? '150px'}
    maxW="200px"
  >
    {children}
  </Select>
);

const SectionHeader = ({ title, subtitle }) => (
  <Box mb={4}>
    <Text fontSize="16px" fontWeight={700} color="#1A202C">
      {title}
    </Text>
    {subtitle && (
      <Text fontSize="13px" color="#697386" mt={1}>
        {subtitle}
      </Text>
    )}
  </Box>
);

const EmptyRow = ({ cols, message }) => (
  <tr>
    <td colSpan={cols} style={{ ...tdStyle, textAlign: 'center', color: '#697386', padding: '32px' }}>
      {message ?? 'No records found.'}
    </td>
  </tr>
);

// ---------------------------------------------------------------------------
// Generate Report Modal
// ---------------------------------------------------------------------------
const GenerateReportModal = ({ isOpen, onClose, templates, onSubmit, isLoading }) => {
  const [form, setForm] = useState({
    reportType: 'Summary',
    templateId: '',
    studentId: '',
    studentName: '',
    startDate: '',
    endDate: '',
    course: '',
    remarks: '',
  });

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.studentId) return;
    onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="12px">
        <ModalHeader fontSize="15px" fontWeight={700} borderBottom="1px solid #E8E8E8" pb={3}>
          Generate Student Report
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={5}>
          <Stack spacing={4}>
            <Grid templateColumns="1fr 1fr" gap={4}>
              <FormControl isRequired>
                <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                  Student ID
                </FormLabel>
                <Input
                  size="sm"
                  placeholder="e.g. STU-2025-054"
                  value={form.studentId}
                  onChange={handleChange('studentId')}
                  borderRadius="8px"
                  _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                  Student Name
                </FormLabel>
                <Input
                  size="sm"
                  placeholder="Full name"
                  value={form.studentName}
                  onChange={handleChange('studentName')}
                  borderRadius="8px"
                  _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
                />
              </FormControl>
            </Grid>

            <Grid templateColumns="1fr 1fr" gap={4}>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                  Report Type
                </FormLabel>
                <Select
                  size="sm"
                  value={form.reportType}
                  onChange={handleChange('reportType')}
                  borderRadius="8px"
                  _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
                >
                  <option value="Summary">Summary</option>
                  <option value="Detailed">Detailed</option>
                  <option value="Custom">Custom Work List</option>
                  <option value="Participation">Participation Monitoring</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                  Report Template
                </FormLabel>
                <Select
                  size="sm"
                  value={form.templateId}
                  onChange={handleChange('templateId')}
                  borderRadius="8px"
                  _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
                >
                  <option value="">— None —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                Course / Module
              </FormLabel>
              <Input
                size="sm"
                placeholder="e.g. Financial Literacy"
                value={form.course}
                onChange={handleChange('course')}
                borderRadius="8px"
                _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
              />
            </FormControl>

            <Grid templateColumns="1fr 1fr" gap={4}>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                  Date From
                </FormLabel>
                <Input
                  size="sm"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange('startDate')}
                  borderRadius="8px"
                  _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                  Date To
                </FormLabel>
                <Input
                  size="sm"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange('endDate')}
                  borderRadius="8px"
                  _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
                />
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel fontSize="12px" fontWeight={600} color="#697386">
                Remarks
              </FormLabel>
              <Input
                size="sm"
                placeholder="Optional remarks or intervention notes"
                value={form.remarks}
                onChange={handleChange('remarks')}
                borderRadius="8px"
                _focus={{ borderColor: colors.primary.base, boxShadow: 'none' }}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter borderTop="1px solid #E8E8E8" gap={3}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            borderRadius="8px"
            color="#697386"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            bg={colors.primary.base}
            color="white"
            borderRadius="8px"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!form.studentId}
            _hover={{ bg: colors.primary.hover }}
          >
            Generate Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Report Detail Modal
// ---------------------------------------------------------------------------
const ReportDetailModal = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  const rows = [
    ['Report ID', report.reportId],
    ['Student ID', report.studentId],
    ['Student Name', report.studentName],
    ['Address', report.address],
    ['Program / Department', report.program],
    ['Enrollment Status', report.enrollmentStatus],
    ['Course / Module', report.course],
    ['Participation Score', report.participationScore != null ? `${report.participationScore}%` : '—'],
    ['Activity Type', report.activityType],
    ['Frequency of Access', report.frequencyOfAccess],
    ['Last Active Date', report.lastActiveDate],
    ['Engagement Status', report.engagementStatus],
    ['Alert Triggered', report.alertTriggered ? 'Yes' : 'No'],
    ['Instructor', report.instructor],
    ['Generated By', report.generatedBy],
    ['Timestamp', report.timestamp ? new Date(report.timestamp).toLocaleString() : '—'],
    ['Remarks', report.remarks],
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="12px">
        <ModalHeader fontSize="15px" fontWeight={700} borderBottom="1px solid #E8E8E8" pb={3}>
          Report Details — {report.reportId}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={5}>
          <Stack spacing={0}>
            {rows.map(([label, value], idx) => (
              <Flex
                key={label}
                py={3}
                borderBottom={idx < rows.length - 1 ? '1px solid #F0F0F0' : 'none'}
                align="flex-start"
                gap={4}
              >
                <Text fontSize="12px" fontWeight={600} color="#697386" minW="160px" flexShrink={0}>
                  {label}
                </Text>
                <Text fontSize="13px" color="#1A202C">
                  {value != null && value !== '' ? String(value) : '—'}
                </Text>
              </Flex>
            ))}
          </Stack>
        </ModalBody>
        <ModalFooter borderTop="1px solid #E8E8E8">
          <Button
            size="sm"
            bg={colors.primary.base}
            color="white"
            borderRadius="8px"
            onClick={onClose}
            _hover={{ bg: colors.primary.hover }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Tab 1 — Student Reports
// ---------------------------------------------------------------------------
const StudentReportsTab = ({ reports, templates, onOpenGenerate, onViewDetail }) => {
  const [filters, setFilters] = useState({
    search: '',
    enrollmentStatus: '',
    participationLevel: '',
  });

  const set = (field) => (e) => setFilters((p) => ({ ...p, [field]: e.target.value }));

  const filtered = reports.filter((r) => {
    if (
      filters.search &&
      !r.studentName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !r.studentId?.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.enrollmentStatus && r.enrollmentStatus !== filters.enrollmentStatus) return false;
    if (filters.participationLevel === 'high' && r.participationScore < 70) return false;
    if (filters.participationLevel === 'medium' && (r.participationScore < 40 || r.participationScore >= 70)) return false;
    if (filters.participationLevel === 'low' && r.participationScore >= 40) return false;
    return true;
  });

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
        <SectionHeader
          title="Student Reports"
          subtitle={`${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`}
        />
        <Button
          size="sm"
          bg={colors.primary.base}
          color="white"
          borderRadius="8px"
          onClick={onOpenGenerate}
          _hover={{ bg: colors.primary.hover }}
          leftIcon={<span>+</span>}
        >
          Generate Report
        </Button>
      </Flex>

      {/* Filters */}
      <Flex gap={3} mb={4} flexWrap="wrap" align="center">
        <FilterInput
          placeholder="Search student name / ID…"
          value={filters.search}
          onChange={set('search')}
        />
        <FilterSelect value={filters.enrollmentStatus} onChange={set('enrollmentStatus')}>
          <option value="">All Enrollment Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Graduated">Graduated</option>
          <option value="Withdrawn">Withdrawn</option>
        </FilterSelect>
        <FilterSelect value={filters.participationLevel} onChange={set('participationLevel')}>
          <option value="">All Participation Levels</option>
          <option value="high">High (≥70%)</option>
          <option value="medium">Medium (40–69%)</option>
          <option value="low">Low (&lt;40%)</option>
        </FilterSelect>
        {(filters.search || filters.enrollmentStatus || filters.participationLevel) && (
          <Button
            size="sm"
            variant="ghost"
            color="#697386"
            borderRadius="8px"
            onClick={() => setFilters({ search: '', enrollmentStatus: '', participationLevel: '' })}
          >
            Clear filters
          </Button>
        )}
      </Flex>

      {/* Table */}
      <Box overflowX="auto" bg="white" borderRadius="12px" border="1px solid #E8E8E8">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr>
              {['Report ID', 'Student ID', 'Student Name', 'Course / Module', 'Score', 'Engagement', 'Last Active', 'Alert', 'Actions'].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={9} message="No reports found for the selected filters." />
            ) : (
              filtered.map((r, i) => (
                <tr key={r.reportId ?? i} style={{ background: i % 2 === 0 ? '#fff' : '#FDFDFD' }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: colors.primary.base }}>{r.reportId}</td>
                  <td style={tdStyle}>{r.studentId}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{r.studentName}</td>
                  <td style={tdStyle}>{r.course}</td>
                  <td style={tdStyle}>
                    <ScoreBar score={r.participationScore ?? 0} />
                  </td>
                  <td style={tdStyle}>
                    <EngagementBadge status={r.engagementStatus} />
                  </td>
                  <td style={tdStyle}>{r.lastActiveDate ?? '—'}</td>
                  <td style={tdStyle}>
                    <AlertBadge triggered={r.alertTriggered} />
                  </td>
                  <td style={tdStyle}>
                    <Button
                      size="xs"
                      variant="ghost"
                      color={colors.primary.base}
                      borderRadius="6px"
                      onClick={() => onViewDetail(r)}
                      _hover={{ bg: '#F5F0FF' }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Tab 2 — Participation Monitor
// ---------------------------------------------------------------------------
const ParticipationMonitorTab = ({ records }) => {
  const [filters, setFilters] = useState({ search: '', engagementLevel: '' });
  const set = (field) => (e) => setFilters((p) => ({ ...p, [field]: e.target.value }));

  const filtered = records.filter((r) => {
    if (filters.search && !r.studentName?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.engagementLevel && r.engagementLevel !== filters.engagementLevel) return false;
    return true;
  });

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
        <SectionHeader
          title="Participation & Engagement Monitor"
          subtitle="Real-time tracking of student activity across courses"
        />
      </Flex>

      <Flex gap={3} mb={4} flexWrap="wrap" align="center">
        <FilterInput
          placeholder="Search student…"
          value={filters.search}
          onChange={set('search')}
        />
        <FilterSelect value={filters.engagementLevel} onChange={set('engagementLevel')}>
          <option value="">All Engagement Levels</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </FilterSelect>
        {(filters.search || filters.engagementLevel) && (
          <Button
            size="sm"
            variant="ghost"
            color="#697386"
            borderRadius="8px"
            onClick={() => setFilters({ search: '', engagementLevel: '' })}
          >
            Clear filters
          </Button>
        )}
        <Text fontSize="12px" color="#697386" ml="auto">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
        </Text>
      </Flex>

      <Box overflowX="auto" bg="white" borderRadius="12px" border="1px solid #E8E8E8">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              {[
                'Student ID',
                'Student Name',
                'Course / Module',
                'Participation Score',
                'Activity Type',
                'Freq. of Access',
                'Last Active',
                'Engagement',
                'Alert',
                'Instructor Remarks',
              ].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={10} message="No participation records found." />
            ) : (
              filtered.map((r, i) => (
                <tr key={r.id ?? i} style={{ background: i % 2 === 0 ? '#fff' : '#FDFDFD' }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{r.userId}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{r.studentName}</td>
                  <td style={tdStyle}>{r.course}</td>
                  <td style={tdStyle}>
                    <ScoreBar score={r.participationScore ?? 0} />
                  </td>
                  <td style={tdStyle}>{r.activityType ?? '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.frequencyOfAccess ?? r.loginCount ?? '—'}</td>
                  <td style={tdStyle}>
                    {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={tdStyle}>
                    <EngagementBadge status={r.engagementLevel} />
                  </td>
                  <td style={tdStyle}>
                    <AlertBadge triggered={r.alertTriggered} />
                  </td>
                  <td style={{ ...tdStyle, maxWidth: '180px' }}>
                    <Text fontSize="12px" color="#697386" noOfLines={2}>
                      {r.instructorRemarks || '—'}
                    </Text>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Tab 3 — Admin Summary
// ---------------------------------------------------------------------------
const AdminSummaryTab = ({ reports, participation, kpis }) => {
  const activeCount = reports.filter((r) => r.engagementStatus === 'Active').length;
  const irregularCount = reports.filter((r) => r.engagementStatus === 'Irregular').length;
  const inactiveCount = reports.filter((r) => r.engagementStatus === 'Inactive').length;
  const alertCount = reports.filter((r) => r.alertTriggered).length;

  const activityDist = participation.reduce((acc, r) => {
    const key = r.activityType ?? 'Unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const programDist = reports.reduce((acc, r) => {
    const key = r.program ?? 'Unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const avgScore =
    reports.length > 0
      ? Math.round(reports.reduce((s, r) => s + (r.participationScore ?? 0), 0) / reports.length)
      : 0;

  const StatRow = ({ label, value, color }) => (
    <Flex justify="space-between" align="center" py={2} borderBottom="1px solid #F0F0F0">
      <Text fontSize="13px" color="#697386">
        {label}
      </Text>
      <Text fontSize="14px" fontWeight={700} color={color ?? '#1A202C'}>
        {value}
      </Text>
    </Flex>
  );

  const DistRow = ({ label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <Box py={2} borderBottom="1px solid #F0F0F0">
        <Flex justify="space-between" mb={1}>
          <Text fontSize="12px" color="#697386">
            {label}
          </Text>
          <Text fontSize="12px" fontWeight={600}>
            {count}
          </Text>
        </Flex>
        <Box bg="#E8E8E8" borderRadius="4px" h="6px">
          <Box
            w={`${pct}%`}
            h="6px"
            borderRadius="4px"
            bg={color ?? colors.primary.base}
            transition="width 0.4s"
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <SectionHeader
        title="Administrative Summary"
        subtitle="Consolidated view of student engagement, participation trends, and reporting KPIs"
      />

      {/* Top row: engagement + alert overview */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
        <KPICard title="Active Students" value={activeCount} subtext="Participation ≥ 70%" accent="#4FAC16" />
        <KPICard title="Irregular Students" value={irregularCount} subtext="Participation 40–69%" accent="#B6A92E" />
        <KPICard title="Inactive Students" value={inactiveCount} subtext="Participation < 40%" accent="#BD1F46" />
        <KPICard title="Alerts Triggered" value={alertCount} subtext="Require instructor follow-up" accent="#DD3A63" />
      </Grid>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={5} mb={6}>
        {/* Engagement stats */}
        <Box bg="white" borderRadius="12px" border="1px solid #E8E8E8" p={5}>
          <Text fontSize="14px" fontWeight={700} mb={3}>
            Participation Overview
          </Text>
          <StatRow label="Total Students Reported" value={reports.length} />
          <StatRow label="Average Participation Score" value={`${avgScore}%`} />
          <StatRow label="Reports Generated (Month)" value={kpis?.reportsGeneratedThisMonth ?? '—'} />
          <StatRow label="Report Accuracy Rate" value={kpis?.reportAccuracyRate ? `${kpis.reportAccuracyRate}%` : '—'} />
          <StatRow label="Data Retrieval Success Rate" value={kpis?.dataRetrievalSuccessRate ? `${kpis.dataRetrievalSuccessRate}%` : '—'} />
          <StatRow
            label="Post-Intervention Improvement"
            value={kpis?.postInterventionImprovement ? `+${kpis.postInterventionImprovement}%` : '—'}
            color="#4FAC16"
          />
        </Box>

        {/* Activity distribution */}
        <Box bg="white" borderRadius="12px" border="1px solid #E8E8E8" p={5}>
          <Text fontSize="14px" fontWeight={700} mb={3}>
            LMS Activity Distribution
          </Text>
          {Object.entries(activityDist).length === 0 ? (
            <Text fontSize="13px" color="#697386">
              No activity data.
            </Text>
          ) : (
            Object.entries(activityDist).map(([type, count]) => (
              <DistRow key={type} label={type} count={count} total={participation.length} />
            ))
          )}
        </Box>

        {/* Program distribution */}
        <Box bg="white" borderRadius="12px" border="1px solid #E8E8E8" p={5}>
          <Text fontSize="14px" fontWeight={700} mb={3}>
            Department / Program Analysis
          </Text>
          {Object.entries(programDist).length === 0 ? (
            <Text fontSize="13px" color="#697386">
              No program data.
            </Text>
          ) : (
            Object.entries(programDist).map(([prog, count]) => (
              <DistRow
                key={prog}
                label={prog}
                count={count}
                total={reports.length}
                color={colors.primary.base}
              />
            ))
          )}
        </Box>
      </Grid>

      {/* Reporting KPIs */}
      <Box bg="white" borderRadius="12px" border="1px solid #E8E8E8" p={5}>
        <Text fontSize="14px" fontWeight={700} mb={4}>
          Reporting & Participation KPIs
        </Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          {[
            { label: 'Avg Report Generation Time', value: kpis?.avgReportGenerationTime ? `${kpis.avgReportGenerationTime}s` : '—' },
            { label: 'Reports Generated (Month)', value: kpis?.reportsGeneratedThisMonth ?? '—' },
            { label: 'Report Accuracy Rate', value: kpis?.reportAccuracyRate ? `${kpis.reportAccuracyRate}%` : '—' },
            { label: 'Avg Student Participation Rate', value: kpis?.avgParticipationRate ? `${kpis.avgParticipationRate}%` : '—' },
            { label: 'Alerts Triggered', value: alertCount },
            { label: 'Avg Instructor Response Time', value: kpis?.avgInstructorResponseTime ?? '—' },
            { label: 'Data Retrieval Success Rate', value: kpis?.dataRetrievalSuccessRate ? `${kpis.dataRetrievalSuccessRate}%` : '—' },
            { label: 'Post-Intervention Improvement', value: kpis?.postInterventionImprovement ? `+${kpis.postInterventionImprovement}%` : '—' },
            { label: 'Inactive Students', value: inactiveCount },
          ].map(({ label, value }) => (
            <Box key={label} p={3} bg="#FDFDFD" borderRadius="8px" border="1px solid #E8E8E8">
              <Text fontSize="11px" color="#697386" fontWeight={500} mb={1}>
                {label}
              </Text>
              <Text fontSize="18px" fontWeight={700} color="#1A202C">
                {value}
              </Text>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
export const StudentReportingScreen = () => {
  const [reports, setReports] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const { isOpen: isGenOpen, onOpen: onGenOpen, onClose: onGenClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rRes, pRes, kRes, tRes] = await Promise.all([
        tc0804GetStudentReports(),
        tc0804GetParticipationRecords(),
        tc0804GetModuleKPIs(),
        tc0804GetReportTemplates(),
      ]);
      setReports(rRes.reports);
      setParticipation(pRes.records);
      setKpis(kRes.kpis);
      setTemplates(tRes.templates);
      setIsMockData(rRes.isMock || pRes.isMock || kRes.isMock);
    } catch {
      toast({ title: 'Error loading data', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateReport = async (form) => {
    setIsGenerating(true);
    try {
      const result = await tc0804CreateStudentReport(form);
      setReports((prev) => [result.report, ...prev]);
      toast({ title: result.message, status: 'success', duration: 3000, isClosable: true });
      onGenClose();
    } catch {
      toast({ title: 'Failed to generate report', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    onDetailOpen();
  };

  // Summary KPIs for top bar
  const activeCount = reports.filter((r) => r.engagementStatus === 'Active').length;
  const inactiveCount = reports.filter((r) => r.engagementStatus === 'Inactive').length;
  const alertCount = reports.filter((r) => r.alertTriggered).length;
  const avgScore =
    reports.length > 0
      ? Math.round(reports.reduce((s, r) => s + (r.participationScore ?? 0), 0) / reports.length)
      : 0;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color={colors.primary.base} thickness="3px" />
      </Flex>
    );
  }

  return (
    <Box bg="#F7F8FA" minH="100vh" p={{ base: 4, md: 6 }}>
      {/* Page Header */}
      <Box mb={5}>
        <Text fontSize="20px" fontWeight={700} color="#1A202C">
          Student Reporting & Participation Monitoring
        </Text>
        <Text fontSize="13px" color="#697386" mt={1}>
          TC08 & TC04 — Unified module for generating student reports and monitoring engagement.
        </Text>
      </Box>

      {/* Mock data notice */}
      {isMockData && (
        <Alert status="info" borderRadius="10px" mb={4} fontSize="13px">
          <AlertIcon />
          Displaying sample data — live API is currently unavailable.
        </Alert>
      )}

      {/* Top KPI Cards */}
      <Flex gap={4} mb={6} flexWrap="wrap">
        <KPICard
          title="Avg Participation Rate"
          value={`${avgScore}%`}
          subtext="Across all reported students"
          accent={colors.primary.base}
        />
        <KPICard title="Active Students" value={activeCount} subtext="Participation ≥ 70%" accent="#4FAC16" />
        <KPICard
          title="Inactive Students"
          value={inactiveCount}
          subtext="Require intervention"
          accent="#BD1F46"
        />
        <KPICard title="Alerts Triggered" value={alertCount} subtext="Low participation detected" accent="#DD3A63" />
        <KPICard
          title="Reports (Month)"
          value={kpis?.reportsGeneratedThisMonth ?? reports.length}
          subtext="Generated this month"
          accent="#5298DA"
        />
        <KPICard
          title="Data Success Rate"
          value={kpis?.dataRetrievalSuccessRate ? `${kpis.dataRetrievalSuccessRate}%` : '—'}
          subtext="API retrieval accuracy"
          accent="#46BD84"
        />
      </Flex>

      {/* Main content tabs */}
      <Box bg="white" borderRadius="12px" boxShadow="0 2px 10px rgba(0,0,0,0.06)" overflow="hidden">
        <Tabs colorScheme="purple" isLazy>
          <TabList
            px={5}
            pt={4}
            borderBottom="1px solid #E8E8E8"
            gap={1}
            sx={{
              '& button': {
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px 8px 0 0',
                color: '#697386',
                _selected: { color: colors.primary.base, borderColor: colors.primary.base },
              },
            }}
          >
            <Tab>Student Reports</Tab>
            <Tab>Participation Monitor</Tab>
            <Tab>Admin Summary</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={5}>
              <StudentReportsTab
                reports={reports}
                templates={templates}
                onOpenGenerate={onGenOpen}
                onViewDetail={handleViewDetail}
              />
            </TabPanel>

            <TabPanel p={5}>
              <ParticipationMonitorTab records={participation} />
            </TabPanel>

            <TabPanel p={5}>
              <AdminSummaryTab reports={reports} participation={participation} kpis={kpis} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isGenOpen}
        onClose={onGenClose}
        templates={templates}
        onSubmit={handleGenerateReport}
        isLoading={isGenerating}
      />

      {/* Detail View Modal */}
      <ReportDetailModal isOpen={isDetailOpen} onClose={onDetailClose} report={selectedReport} />
    </Box>
  );
};
