import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, Grid, GridItem, Text, VStack, HStack, Button,
  Input, InputGroup, InputLeftElement, Select,
  Checkbox, IconButton, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, useToast, Tag, TagLabel, TagCloseButton,
  Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import {
  FiSearch, FiPlus,
  FiChevronLeft, FiChevronRight, FiChevronDown, FiX, FiMoreVertical,
} from 'react-icons/fi';
import { Route } from 'react-router-dom';
import { AdminMainAreaWrapper } from '../../../layouts';
import {
  reportBuilderGetCatalog,
  reportBuilderCreateConfig,
  reportBuilderListConfigs,
  reportBuilderUpdateConfig,
  reportBuilderDeleteConfig,
  reportBuilderExecuteConfig,
  reportBuilderGetStats,
  adminArchiveReport,
} from '../../../services';

const INITIAL_FORM = {
  name: '',
  description: '',
  dataSource: '',
  dataFields: [],
  filters: { courseId: '', startDate: '', endDate: '', grade: '', status: '' },
  groupBy: [],
  aggregations: {},
  sortBy: { field: '', order: 'ASC' },
  accessLevel: 'admin',
  sharedWith: [],
  status: 'draft',
  schedule: { enabled: false, frequency: 'daily', day: 'monday', time: '10:00', delivery: 'dashboard', emails: [] },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FALLBACK_FIELDS = {
  exam_results: [
    { key: 'student_id', label: 'Student ID' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'exam_title', label: 'Exam Title' },
    { key: 'total_score', label: 'Total Score' },
    { key: 'grade', label: 'Grade' },
    { key: 'course_title', label: 'Course Title' },
  ],
  assessment_results: [
    { key: 'student_id', label: 'Student ID' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'assessment_title', label: 'Assessment Title' },
    { key: 'score', label: 'Score' },
    { key: 'grade', label: 'Grade' },
    { key: 'submitted_at', label: 'Submitted At' },
  ],
  lesson_progress: [
    { key: 'student_id', label: 'Student ID' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'course_title', label: 'Course Title' },
    { key: 'lesson_title', label: 'Lesson Title' },
    { key: 'progress_percentage', label: 'Progress %' },
    { key: 'completed_at', label: 'Completed At' },
  ],
};

const DATA_SOURCE_LABELS = {
  exam_results: 'Exam Results',
  assessment_results: 'Assessment Results',
  lesson_progress: 'Lesson Progress',
};

const StatCard = ({ title, value, color = '#660066' }) => (
  <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7" flex="1">
    <Text fontSize="13px" fontWeight="500" color="#667085" mb={2}>{title}</Text>
    <Text fontSize="24px" fontWeight="700" color={color}>{value ?? '—'}</Text>
  </Box>
);

const StatusBadge = ({ status }) => {
  const map = {
    draft: { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
    finalized: { bg: '#D1FAE5', color: '#065F46', label: 'Finalized' },
  };
  const s = map[status?.toLowerCase()] ?? { bg: '#F3F4F6', color: '#374151', label: status ?? '—' };
  return (
    <Badge
      bg={s.bg} color={s.color} px={3} py={1} borderRadius="full"
      textTransform="none" fontWeight="500" fontSize="12px"
    >
      {s.label}
    </Badge>
  );
};

const ReportBuilderPage = () => {
  const toast = useToast();
  const [view, setView] = useState('list');
  const [editingConfigId, setEditingConfigId] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [stats, setStats] = useState(null);
  const [catalog, setCatalog] = useState({});
  const [previewResult, setPreviewResult] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shareInput, setShareInput] = useState('');
  const [scheduleEmailInput, setScheduleEmailInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Excel');

  const normalizeFields = (fields) => {
    if (!Array.isArray(fields)) return [];
    return fields.map(f =>
      typeof f === 'string'
        ? { key: f, label: f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
        : f
    );
  };

  const sourceFields = normalizeFields(
    catalog[form.dataSource]?.fields ??
    FALLBACK_FIELDS[form.dataSource] ??
    []
  );

  const catalogSources = Object.keys(catalog);
  const availableSources = catalogSources.length > 0 ? catalogSources : Object.keys(FALLBACK_FIELDS);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterSource) params.dataSource = filterSource;
      const { configs: data, pagination } = await reportBuilderListConfigs(params);
      setConfigs(data);
      if (pagination?.totalPages) setTotalPages(pagination.totalPages);
    } catch {
      setConfigs([]);
    } finally {
      setListLoading(false);
    }
  }, [page, filterStatus, filterSource]);

  const fetchStats = useCallback(async () => {
    try {
      const { stats: s } = await reportBuilderGetStats();
      setStats(s);
    } catch {
      // stats are informational only
    }
  }, []);

  const fetchCatalog = useCallback(async () => {
    try {
      const { catalog: cat } = await reportBuilderGetCatalog();
      if (cat && typeof cat === 'object' && Object.keys(cat).length > 0) {
        setCatalog(cat);
      }
    } catch {
      // fallback fields used instead
    }
  }, []);

  useEffect(() => {
    fetchList();
    fetchStats();
  }, [fetchList, fetchStats]);

  useEffect(() => {
    if (view === 'builder') fetchCatalog();
  }, [view, fetchCatalog]);

  const openBuilder = (config = null, readOnly = false) => {
    if (config) {
      setEditingConfigId(config.id);
      setForm({
        name: config.name ?? '',
        description: config.description ?? '',
        dataSource: config.dataSource ?? '',
        dataFields: config.dataFields ?? [],
        filters: { ...INITIAL_FORM.filters, ...(config.filters ?? {}) },
        groupBy: config.groupBy ?? [],
        aggregations: config.aggregations ?? {},
        sortBy: config.sortBy ?? INITIAL_FORM.sortBy,
        accessLevel: config.accessLevel ?? 'admin',
        sharedWith: config.sharedWith ?? [],
        status: config.status ?? 'draft',
        schedule: { ...INITIAL_FORM.schedule, ...(config.schedule ?? {}) },
      });
    } else {
      setEditingConfigId(null);
      setForm(INITIAL_FORM);
    }
    setPreviewResult(null);
    setScheduleEmailInput('');
    setViewOnly(readOnly);
    setView('builder');
  };

  const handleSave = async (statusOverride = null) => {
    if (!form.name.trim()) {
      toast({ title: 'Report name is required', status: 'warning', duration: 3000 });
      return;
    }
    const scheduleNeedsEmail = form.schedule.enabled
      && (form.schedule.delivery === 'email' || form.schedule.delivery === 'both');
    if (scheduleNeedsEmail && form.schedule.emails.length === 0) {
      toast({ title: 'Add at least one email to deliver the scheduled report to', status: 'warning', duration: 3000 });
      return;
    }
    const payload = { ...form };
    if (statusOverride) payload.status = statusOverride;
    setSaving(true);
    try {
      if (editingConfigId) {
        await reportBuilderUpdateConfig(editingConfigId, payload);
        toast({ title: 'Configuration updated', status: 'success', duration: 3000 });
      } else {
        const { config } = await reportBuilderCreateConfig(payload);
        if (config?.id) setEditingConfigId(config.id);
        toast({ title: 'Configuration saved', status: 'success', duration: 3000 });
      }
      if (statusOverride) setForm(f => ({ ...f, status: statusOverride }));
      fetchList();
      fetchStats();
    } catch (e) {
      toast({ title: e?.message ?? 'Save failed', status: 'error', duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async (cfg) => {
    try {
      openBuilder(cfg, true);
      const { result } = await reportBuilderExecuteConfig(cfg.id);
      setPreviewResult(result);
      fetchStats();
      toast({ title: 'Report executed successfully', status: 'success', duration: 3000 });
    } catch (e) {
      toast({ title: e?.message ?? 'Execution failed', status: 'error', duration: 3000 });
    }
  };

  const handleArchive = async (cfg) => {
    try {
      const { message } = await adminArchiveReport(cfg.id, {
        reportSource: 'report-builder',
        reportName: cfg.name,
        reportCategory: cfg.dataSource,
      });
      toast({ title: message || 'Report archived', status: 'success', duration: 3000 });
      fetchList();
      fetchStats();
    } catch (e) {
      toast({ title: e?.message ?? 'Archive failed', status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async (configId) => {
    if (!window.confirm('Delete this report configuration? This cannot be undone.')) return;
    try {
      await reportBuilderDeleteConfig(configId);
      toast({ title: 'Configuration deleted', status: 'success', duration: 2000 });
      fetchList();
      fetchStats();
    } catch (e) {
      toast({ title: e?.message ?? 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  const toggleField = (fieldKey) => {
    setForm(f => ({
      ...f,
      dataFields: f.dataFields.includes(fieldKey)
        ? f.dataFields.filter(k => k !== fieldKey)
        : [...f.dataFields, fieldKey],
    }));
  };

  const addShare = () => {
    const val = shareInput.trim();
    if (!val || form.sharedWith.includes(val)) return;
    setForm(f => ({ ...f, sharedWith: [...f.sharedWith, val] }));
    setShareInput('');
  };

  const removeShare = (item) => {
    setForm(f => ({ ...f, sharedWith: f.sharedWith.filter(s => s !== item) }));
  };

  const addScheduleEmail = () => {
    const val = scheduleEmailInput.trim();
    if (!val) return;
    if (!EMAIL_RE.test(val)) {
      toast({ title: 'Enter a valid email address', status: 'warning', duration: 3000 });
      return;
    }
    setForm(f => ({
      ...f,
      schedule: {
        ...f.schedule,
        emails: f.schedule.emails.includes(val) ? f.schedule.emails : [...f.schedule.emails, val],
      },
    }));
    setScheduleEmailInput('');
  };

  const removeScheduleEmail = (email) => {
    setForm(f => ({ ...f, schedule: { ...f.schedule, emails: f.schedule.emails.filter(e => e !== email) } }));
  };

  const filteredConfigs = configs.filter(c =>
    !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── LIST VIEW ─────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <AdminMainAreaWrapper>
        <Flex justifyContent="space-between" alignItems="center" mb={6} mt={4}>
          <Box>
            <Text fontSize="24px" fontWeight="700" color="#101928">Report Builder</Text>
            <Text fontSize="13px" color="#667085" mt={1}>
              Create, save, and execute custom cross-module reports
            </Text>
          </Box>
          <Button
            bg="#660066" color="white" _hover={{ bg: '#550055' }}
            leftIcon={<FiPlus />} borderRadius="md" h="44px" fontSize="14px" fontWeight="600"
            onClick={() => openBuilder()}
          >
            New Report
          </Button>
        </Flex>

        {/* KPI Cards */}
        <HStack spacing={4} mb={6} align="stretch">
          <StatCard title="Total Configs Saved" value={stats?.totalConfigsSaved} />
          <StatCard
            title="Total Executions"
            value={stats?.totalExecutions}
            color="#38A169"
          />
          <StatCard
            title="Ad-Hoc Executions"
            value={stats?.adHocExecutions}
            color="#3182CE"
          />
          <StatCard
            title="Avg Generation Time"
            value={
              stats?.avgGenerationTimeMs != null
                ? `${stats.avgGenerationTimeMs}ms`
                : undefined
            }
            color="#D69E2E"
          />
        </HStack>

        {/* Filters */}
        <Box bg="white" p={4} borderRadius="xl" border="1.5px solid #F2F4F7" mb={4}>
          <Flex gap={3} align="center" wrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none" h="100%">
                <FiSearch color="#667085" />
              </InputLeftElement>
              <Input
                placeholder="Search reports..."
                h="42px" bg="white" border="1px solid #E4E7EC" borderRadius="md"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Select
              maxW="200px" h="42px" borderColor="#E4E7EC" borderRadius="md"
              placeholder="All data sources"
              value={filterSource}
              onChange={e => { setFilterSource(e.target.value); setPage(1); }}
            >
              <option value="exam_results">Exam Results</option>
              <option value="assessment_results">Assessment Results</option>
              <option value="lesson_progress">Lesson Progress</option>
            </Select>
            <Select
              maxW="160px" h="42px" borderColor="#E4E7EC" borderRadius="md"
              placeholder="All statuses"
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="draft">Draft</option>
              <option value="finalized">Finalized</option>
            </Select>
          </Flex>
        </Box>

        {/* Configs Table */}
        <Box bg="white" borderRadius="xl" border="1.5px solid #F2F4F7" overflow="hidden">
          {listLoading ? (
            <Flex justify="center" align="center" h="240px">
              <Spinner color="#660066" size="lg" />
            </Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="#F9FAFB">
                <Tr>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={5} py={4}>
                    Report Name
                  </Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>
                    Data Source
                  </Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>
                    Status
                  </Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>
                    Access Count
                  </Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>
                    Last Accessed
                  </Th>
                  <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredConfigs.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={16} color="#667085" fontSize="14px">
                      No report configurations found. Click "New Report" to create one.
                    </Td>
                  </Tr>
                ) : (
                  filteredConfigs.map(cfg => (
                    <Tr key={cfg.id} borderBottom="1px solid #F2F4F7" _hover={{ bg: '#FAFAFA' }}>
                      <Td px={5} py={4}>
                        <Text fontSize="14px" fontWeight="600" color="#101928">{cfg.name}</Text>
                        {cfg.description && (
                          <Text fontSize="12px" color="#667085" noOfLines={1}>{cfg.description}</Text>
                        )}
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">
                          {DATA_SOURCE_LABELS[cfg.dataSource] ?? cfg.dataSource ?? '—'}
                        </Text>
                      </Td>
                      <Td px={4} py={4}>
                        <StatusBadge status={cfg.status} />
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">{cfg.accessCount ?? 0}</Text>
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">
                          {cfg.lastAccessedAt
                            ? new Date(cfg.lastAccessedAt).toLocaleDateString('en-GB')
                            : '—'}
                        </Text>
                      </Td>
                      <Td px={4} py={4} onClick={e => e.stopPropagation()}>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            color="#98A2B3"
                            border="1px solid #E4E7EC"
                            borderRadius="md"
                            aria-label="Report actions"
                          />
                          <MenuList>
                            <MenuItem fontSize="13px" onClick={() => handleExecute(cfg)}>View</MenuItem>
                            <MenuItem fontSize="13px" onClick={() => openBuilder(cfg)}>Edit</MenuItem>
                            <MenuItem fontSize="13px" onClick={() => handleArchive(cfg)}>Archive</MenuItem>
                            <MenuItem fontSize="13px" color="red.500" onClick={() => handleDelete(cfg.id)}>Delete</MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}

          <Flex p={4} align="center" justify="flex-end" borderTop="1px solid #F2F4F7">
            <HStack spacing={2}>
              <IconButton
                icon={<FiChevronLeft />}
                variant="ghost"
                size="sm"
                color="#667085"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                isDisabled={page === 1}
                aria-label="Previous page"
              />
              <Text fontSize="13px" color="#475367">Page {page} of {totalPages}</Text>
              <IconButton
                icon={<FiChevronRight />}
                variant="ghost"
                size="sm"
                color="#667085"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                isDisabled={page >= totalPages}
                aria-label="Next page"
              />
            </HStack>
          </Flex>
        </Box>
      </AdminMainAreaWrapper>
    );
  }

  // ── BUILDER VIEW ──────────────────────────────────────────────
  return (
    <AdminMainAreaWrapper>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} mt={4}>
        <HStack spacing={3}>
          <Button
            variant="ghost"
            color="#660066"
            leftIcon={<FiChevronLeft />}
            fontSize="14px"
            fontWeight="500"
            px={2}
            onClick={() => { setView('list'); setPreviewResult(null); }}
          >
            Back to Reports
          </Button>
          <Text fontSize="20px" fontWeight="700" color="#101928">
            {viewOnly
              ? 'View Report Configuration'
              : editingConfigId
                ? 'Edit Report Configuration'
                : 'New Report Configuration'}
          </Text>
        </HStack>
        {!viewOnly && (
          <HStack spacing={3}>
            <Button
              bg="#660066"
              color="white"
              _hover={{ bg: '#550055' }}
              h="44px"
              fontSize="14px"
              fontWeight="600"
              isLoading={saving}
              onClick={() => handleSave('finalized')}
            >
              Generate Report
            </Button>
          </HStack>
        )}
      </Flex>

      <Grid templateColumns="repeat(12, 1fr)" gap={5}>
        {/* Main Column */}
        <GridItem colSpan={9}>
          <VStack spacing={5} align="stretch">
            {/* Report Information */}
            <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7">
              <Text fontSize="15px" fontWeight="700" color="#101928" mb={4}>Report Information</Text>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="13px" fontWeight="500" color="#344054">Report Name *</Text>
                  <Input
                    isReadOnly={viewOnly}
                    placeholder="e.g. Exam Score Summary"
                    bg="#F9FAFB"
                    border="1px solid #E4E7EC"
                    h="42px"
                    fontSize="13px"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="13px" fontWeight="500" color="#344054">Description</Text>
                  <Input
                    isReadOnly={viewOnly}
                    placeholder="Optional description"
                    bg="#F9FAFB"
                    border="1px solid #E4E7EC"
                    h="42px"
                    fontSize="13px"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="13px" fontWeight="500" color="#344054">Data Source *</Text>
                  <Select isDisabled={viewOnly}
                    bg="#F9FAFB"
                    border="1px solid #E4E7EC"
                    h="42px"
                    fontSize="13px"
                    placeholder="Select data source"
                    value={form.dataSource}
                    onChange={e =>
                      setForm(f => ({ ...f, dataSource: e.target.value, dataFields: [], groupBy: [] }))
                    }
                  >
                    {availableSources.map(key => (
                      <option key={key} value={key}>
                        {catalog[key]?.label ?? DATA_SOURCE_LABELS[key] ?? key}
                      </option>
                    ))}
                  </Select>
                </VStack>
              </Grid>
            </Box>

            <Grid templateColumns="repeat(12, 1fr)" gap={5}>
              {/* Field Selector */}
              <GridItem colSpan={4}>
                <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7" minH="500px">
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="15px" fontWeight="700" color="#101928">Select Fields</Text>
                    <FiChevronDown color="#98A2B3" />
                  </Flex>
                  <Text fontSize="12px" color="#667085" mb={4}>
                    {form.dataFields.length} field{form.dataFields.length !== 1 ? 's' : ''} selected
                  </Text>

                  {!form.dataSource ? (
                    <Text fontSize="13px" color="#98A2B3" textAlign="center" mt={10} px={2}>
                      Select a data source above to see available fields
                    </Text>
                  ) : (
                    <VStack align="start" spacing={3}>
                      {sourceFields.map(field => (
                        <Checkbox isDisabled={viewOnly}
                          key={field.key}
                          colorScheme="purple"
                          isChecked={form.dataFields.includes(field.key)}
                          onChange={() => toggleField(field.key)}
                        >
                          <Text fontSize="13px" color="#475367">{field.label}</Text>
                        </Checkbox>
                      ))}
                    </VStack>
                  )}
                </Box>
              </GridItem>

              {/* Criteria */}
              <GridItem colSpan={8}>
                <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7" minH="500px">
                  <Text fontSize="15px" fontWeight="700" color="#101928" mb={5}>Criteria & Filters</Text>

                  <VStack spacing={5} align="stretch">
                    {/* Date Range */}
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Start Date</Text>
                        <Input
                          isReadOnly={viewOnly}
                          type="date"
                          bg="#F9FAFB"
                          border="1px solid #E4E7EC"
                          h="42px"
                          fontSize="13px"
                          value={form.filters.startDate}
                          onChange={e =>
                            setForm(f => ({ ...f, filters: { ...f.filters, startDate: e.target.value } }))
                          }
                        />
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">End Date</Text>
                        <Input
                          isReadOnly={viewOnly}
                          type="date"
                          bg="#F9FAFB"
                          border="1px solid #E4E7EC"
                          h="42px"
                          fontSize="13px"
                          value={form.filters.endDate}
                          onChange={e =>
                            setForm(f => ({ ...f, filters: { ...f.filters, endDate: e.target.value } }))
                          }
                        />
                      </VStack>
                    </Grid>

                    {/* Grade & Status */}
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Grade</Text>
                        <Select isDisabled={viewOnly}
                          bg="#F9FAFB"
                          border="1px solid #E4E7EC"
                          h="42px"
                          fontSize="13px"
                          placeholder="All grades"
                          value={form.filters.grade}
                          onChange={e =>
                            setForm(f => ({ ...f, filters: { ...f.filters, grade: e.target.value } }))
                          }
                        >
                          {['A', 'B', 'C', 'D', 'F'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </Select>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Status</Text>
                        <Select isDisabled={viewOnly}
                          bg="#F9FAFB"
                          border="1px solid #E4E7EC"
                          h="42px"
                          fontSize="13px"
                          placeholder="All statuses"
                          value={form.filters.status}
                          onChange={e =>
                            setForm(f => ({ ...f, filters: { ...f.filters, status: e.target.value } }))
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </VStack>
                    </Grid>

                    {/* Sort By */}
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Sort By Field</Text>
                        <Select isDisabled={viewOnly}
                          bg="#F9FAFB"
                          border="1px solid #E4E7EC"
                          h="42px"
                          fontSize="13px"
                          placeholder="Select field"
                          value={form.sortBy.field}
                          onChange={e =>
                            setForm(f => ({ ...f, sortBy: { ...f.sortBy, field: e.target.value } }))
                          }
                        >
                          {form.dataFields.map(key => {
                            const field = sourceFields.find(sf => sf.key === key);
                            return (
                              <option key={key} value={key}>{field?.label ?? key}</option>
                            );
                          })}
                        </Select>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="13px" fontWeight="500" color="#344054">Sort Order</Text>
                        <Select isDisabled={viewOnly}
                          bg="#F9FAFB"
                          border="1px solid #E4E7EC"
                          h="42px"
                          fontSize="13px"
                          value={form.sortBy.order}
                          onChange={e =>
                            setForm(f => ({ ...f, sortBy: { ...f.sortBy, order: e.target.value } }))
                          }
                        >
                          <option value="ASC">Ascending (A → Z)</option>
                          <option value="DESC">Descending (Z → A)</option>
                        </Select>
                      </VStack>
                    </Grid>

                    {/* Group By */}
                    <VStack align="start" spacing={2}>
                      <Text fontSize="13px" fontWeight="500" color="#344054">Group By</Text>
                      {form.groupBy.length > 0 && (
                        <HStack wrap="wrap" spacing={2} w="100%">
                          {form.groupBy.map(g => {
                            const field = sourceFields.find(sf => sf.key === g);
                            return (
                              <Tag key={g} size="sm" bg="#F3E8FF" color="#660066" borderRadius="full">
                                <TagLabel fontSize="12px">{field?.label ?? g}</TagLabel>
                                <TagCloseButton isDisabled={viewOnly}
                                  onClick={() =>
                                    setForm(f => ({ ...f, groupBy: f.groupBy.filter(x => x !== g) }))
                                  }
                                />
                              </Tag>
                            );
                          })}
                        </HStack>
                      )}
                      <Select isDisabled={viewOnly}
                        bg="#F9FAFB"
                        border="1px solid #E4E7EC"
                        h="42px"
                        fontSize="13px"
                        placeholder="Add group by field..."
                        value=""
                        onChange={e => {
                          const val = e.target.value;
                          if (val && !form.groupBy.includes(val)) {
                            setForm(f => ({ ...f, groupBy: [...f.groupBy, val] }));
                          }
                        }}
                      >
                        {form.dataFields
                          .filter(key => !form.groupBy.includes(key))
                          .map(key => {
                            const field = sourceFields.find(sf => sf.key === key);
                            return (
                              <option key={key} value={key}>{field?.label ?? key}</option>
                            );
                          })}
                      </Select>
                    </VStack>
                  </VStack>
                </Box>
              </GridItem>
            </Grid>
          </VStack>
        </GridItem>

        {/* Right Sidebar */}
        <GridItem colSpan={3}>
          <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7" minH="500px">
            <Text fontSize="15px" fontWeight="700" color="#101928" mb={5}>Report Settings</Text>

            <VStack align="stretch" spacing={5}>
              {/* Status indicator */}
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Status</Text>
                <HStack>
                  <Box
                    w={2} h={2} borderRadius="full"
                    bg={form.status === 'draft' ? '#F79009' : '#12B76A'}
                  />
                  <Text fontSize="14px" fontWeight="500" color="#101928" textTransform="capitalize">
                    {form.status}
                  </Text>
                </HStack>
              </Box>

              {/* Access Level */}
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Access Level</Text>
                <Select isDisabled={viewOnly}
                  bg="#F9FAFB"
                  border="1px solid #E4E7EC"
                  fontSize="13px"
                  h="40px"
                  value={form.accessLevel}
                  onChange={e => setForm(f => ({ ...f, accessLevel: e.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin_instructor">Admin & Instructor</option>
                </Select>
              </Box>

              {/* Share With */}
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Share With</Text>
                <HStack mb={2}>
                  <Input
                    isReadOnly={viewOnly}
                    placeholder="Enter username"
                    bg="#F9FAFB"
                    border="1px solid #E4E7EC"
                    fontSize="12px"
                    h="36px"
                    value={shareInput}
                    onChange={e => setShareInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addShare()}
                  />
                  <IconButton isDisabled={viewOnly}
                    icon={<FiPlus />}
                    size="sm"
                    bg="#660066"
                    color="white"
                    _hover={{ bg: '#550055' }}
                    onClick={addShare}
                    aria-label="Add user"
                  />
                </HStack>
                <VStack align="start" spacing={1}>
                  {form.sharedWith.map(user => (
                    <HStack key={user} justify="space-between" w="100%">
                      <Text fontSize="12px" color="#475367">{user}</Text>
                      <IconButton isDisabled={viewOnly}
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        color="#667085"
                        onClick={() => removeShare(user)}
                        aria-label={`Remove ${user}`}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {/* Schedule */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="13px" fontWeight="600" color="#344054">Schedule</Text>
                  {form.schedule.enabled && !viewOnly && (
                    <Button
                      variant="link"
                      color="#B42318"
                      fontSize="12px"
                      fontWeight="600"
                      onClick={() => setForm(f => ({ ...f, schedule: INITIAL_FORM.schedule }))}
                    >
                      Remove
                    </Button>
                  )}
                </Flex>

                {!form.schedule.enabled ? (
                  <Button
                    variant="link"
                    alignSelf="flex-start"
                    color="#660066"
                    fontSize="13px"
                    fontWeight="600"
                    isDisabled={viewOnly}
                    onClick={() => setForm(f => ({ ...f, schedule: { ...f.schedule, enabled: true } }))}
                  >
                    + Schedule this report
                  </Button>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontSize="12px" color="#667085" mb={1}>Frequency</Text>
                      <Select isDisabled={viewOnly}
                        bg="#F9FAFB"
                        border="1px solid #E4E7EC"
                        h="40px"
                        fontSize="13px"
                        value={form.schedule.frequency}
                        onChange={e => setForm(f => ({ ...f, schedule: { ...f.schedule, frequency: e.target.value } }))}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </Select>
                    </Box>

                    {form.schedule.frequency === 'weekly' && (
                      <Box>
                        <Text fontSize="12px" color="#667085" mb={1}>Day</Text>
                        <Select isDisabled={viewOnly}
                          bg="#F9FAFB"
                          border="1px solid #E4E7EC"
                          h="40px"
                          fontSize="13px"
                          value={form.schedule.day}
                          onChange={e => setForm(f => ({ ...f, schedule: { ...f.schedule, day: e.target.value } }))}
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
                            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                          ))}
                        </Select>
                      </Box>
                    )}

                    <Box>
                      <Text fontSize="12px" color="#667085" mb={1}>Time</Text>
                      <Input
                        isReadOnly={viewOnly}
                        type="time"
                        bg="#F9FAFB"
                        border="1px solid #E4E7EC"
                        h="40px"
                        fontSize="13px"
                        value={form.schedule.time}
                        onChange={e => setForm(f => ({ ...f, schedule: { ...f.schedule, time: e.target.value } }))}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="12px" color="#667085" mb={1}>Delivery Method</Text>
                      <Select isDisabled={viewOnly}
                        bg="#F9FAFB"
                        border="1px solid #E4E7EC"
                        h="40px"
                        fontSize="13px"
                        value={form.schedule.delivery}
                        onChange={e => setForm(f => ({ ...f, schedule: { ...f.schedule, delivery: e.target.value } }))}
                      >
                        <option value="dashboard">Dashboard</option>
                        <option value="email">Email</option>
                        <option value="both">Both</option>
                      </Select>
                    </Box>

                    {(form.schedule.delivery === 'email' || form.schedule.delivery === 'both') && (
                      <Box>
                        <Text fontSize="12px" color="#667085" mb={1}>Recipient Emails</Text>
                        <HStack mb={2}>
                          <Input
                            isReadOnly={viewOnly}
                            type="email"
                            placeholder="name@example.com"
                            bg="#F9FAFB"
                            border="1px solid #E4E7EC"
                            fontSize="12px"
                            h="36px"
                            value={scheduleEmailInput}
                            onChange={e => setScheduleEmailInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addScheduleEmail()}
                          />
                          <IconButton isDisabled={viewOnly}
                            icon={<FiPlus />}
                            size="sm"
                            bg="#660066"
                            color="white"
                            _hover={{ bg: '#550055' }}
                            onClick={addScheduleEmail}
                            aria-label="Add email"
                          />
                        </HStack>
                        <VStack align="start" spacing={1}>
                          {form.schedule.emails.map(email => (
                            <HStack key={email} justify="space-between" w="100%">
                              <Text fontSize="12px" color="#475367">{email}</Text>
                              <IconButton isDisabled={viewOnly}
                                icon={<FiX />}
                                size="xs"
                                variant="ghost"
                                color="#667085"
                                onClick={() => removeScheduleEmail(email)}
                                aria-label={`Remove ${email}`}
                              />
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                )}
              </Box>

              {/* Export Format */}
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Export Format</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  {['Excel', 'PDF', 'CSV', 'JSON'].map(fmt => (
                    <Button
                      key={fmt}
                      size="sm"
                      fontSize="12px"
                      h="32px"
                      variant={selectedFormat === fmt ? 'solid' : 'outline'}
                      bg={selectedFormat === fmt ? '#660066' : 'transparent'}
                      color={selectedFormat === fmt ? 'white' : '#344054'}
                      borderColor={selectedFormat === fmt ? '#660066' : '#E4E7EC'}
                      _hover={{ bg: selectedFormat === fmt ? '#550055' : '#F9FAFB' }}
                      onClick={() => setSelectedFormat(fmt)}
                    >
                      {fmt}
                    </Button>
                  ))}
                </Grid>
              </Box>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Preview Results */}
      {previewResult && (
        <Box mt={6} bg="white" borderRadius="xl" border="1.5px solid #F2F4F7" overflow="hidden">
          <Flex p={4} align="center" justify="space-between" borderBottom="1px solid #F2F4F7">
            <Text fontSize="15px" fontWeight="700" color="#101928">Preview Results</Text>
            {previewResult && (
              <HStack spacing={5}>
                <Text fontSize="13px" color="#667085">
                  {previewResult.recordCount ?? 0} record{previewResult.recordCount !== 1 ? 's' : ''}
                </Text>
                {previewResult.executionTimeMs != null && (
                  <Text fontSize="13px" color="#667085">{previewResult.executionTimeMs}ms</Text>
                )}
                <Text fontSize="12px" color="#98A2B3">
                  {previewResult.generatedAt
                    ? new Date(previewResult.generatedAt).toLocaleString()
                    : ''}
                </Text>
              </HStack>
            )}
          </Flex>

          {previewResult?.data?.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="#F9FAFB">
                  <Tr>
                    {Object.keys(previewResult.data[0]).map(col => (
                      <Th
                        key={col}
                        fontSize="12px"
                        fontWeight="500"
                        color="#475367"
                        textTransform="none"
                        px={4}
                        py={3}
                      >
                        {col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {previewResult.data.map((row, i) => (
                    <Tr key={i} borderBottom="1px solid #F2F4F7">
                      {Object.values(row).map((val, j) => (
                        <Td key={j} fontSize="13px" color="#475367" px={4} py={3}>
                          {val ?? '—'}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Flex justify="center" align="center" h="120px">
              <Text fontSize="14px" color="#667085">No data returned for the current configuration</Text>
            </Flex>
          )}

          {/* KPI summary */}
          {previewResult?.kpis && Object.keys(previewResult.kpis).length > 0 && (
            <Box p={4} borderTop="1px solid #F2F4F7">
              <Text fontSize="13px" fontWeight="600" color="#344054" mb={3}>Aggregated KPIs</Text>
              <HStack spacing={4} wrap="wrap">
                {Object.entries(previewResult.kpis).map(([key, val]) => (
                  <Box key={key} bg="#F9FAFB" px={4} py={2} borderRadius="lg">
                    <Text fontSize="11px" color="#667085" mb={1}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text fontSize="18px" fontWeight="700" color="#101928">{val}</Text>
                  </Box>
                ))}
              </HStack>
            </Box>
          )}
        </Box>
      )}
    </AdminMainAreaWrapper>
  );
};

export const ReportBuilderPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ReportBuilderPage {...props} />} />;
};

export default ReportBuilderPage;
