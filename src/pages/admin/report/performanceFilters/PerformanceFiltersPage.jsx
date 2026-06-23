import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Flex, Grid, GridItem, VStack, HStack,
  Input, InputGroup, InputLeftElement, Select,
  Checkbox, IconButton, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, useToast, SimpleGrid, BreadcrumbItem,
} from '@chakra-ui/react';
import {
  FiSearch, FiPlus, FiSave, FiPlay, FiEdit2, FiTrash2,
  FiChevronLeft, FiChevronRight, FiEye, FiFilter, FiX,
} from 'react-icons/fi';
import { Route } from 'react-router-dom';
import { AdminMainAreaWrapper } from '../../../../layouts';
import { Breadcrumb, Link, Text } from '../../../../components';

import {
  createPerformanceFilter,
  getPerformanceFilters,
  updatePerformanceFilter,
  deletePerformanceFilter,
  executePerformanceFilter,
  previewPerformanceFilter,
  getPerformanceFilterStats,
  getPerformanceFilterGradingScale,
  adminGetCourseListing,
  adminListModules,
  adminGetUserListing,
  adminGetDepartmentListing,
} from '../../../../services';

// ─── Constants ─────────────────────────────────────────────────────────────

const GRADE_OPTIONS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Pass', 'Fail'];

const METRIC_OPTIONS = [
  { key: 'overall_avg_score', label: 'Overall Avg Score' },
  { key: 'exam_avg_score', label: 'Exam Avg Score' },
  { key: 'assessment_avg_score', label: 'Assessment Avg Score' },
  { key: 'grade', label: 'Grade' },
  { key: 'pass_fail', label: 'Pass / Fail' },
  { key: 'completion_rate', label: 'Completion Rate' },
];

const VIZ_OPTIONS = [
  { value: 'bar_chart', label: 'Bar Chart' },
  { value: 'pie_chart', label: 'Pie Chart' },
  { value: 'line_chart', label: 'Line Chart' },
  { value: 'table', label: 'Table Only' },
];

const INITIAL_FORM = {
  name: '',
  description: '',
  studentScope: 'group',
  criteria: {
    courseId: '',
    moduleId: '',
    studentId: '',
    departmentId: '',
    instructorId: '',
    scoreMin: '',
    scoreMax: '',
    grade: '',
    passFail: '',
    attendanceMin: '',
    startDate: '',
    endDate: '',
  },
  performanceMetrics: ['overall_avg_score', 'grade', 'pass_fail', 'completion_rate'],
  visualizationType: 'bar_chart',
  accessLevel: 'instructor',
  sharedWith: [],
  status: 'draft',
};

// ─── Sub-components ────────────────────────────────────────────────────────

const StatCard = ({ title, value, color = '#660066' }) => (
  <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7" flex="1">
    <Text fontSize="13px" fontWeight="500" color="#667085" mb={2}>{title}</Text>
    <Text fontSize="24px" fontWeight="700" color={color}>{value ?? '—'}</Text>
  </Box>
);

const StatusBadge = ({ status }) => {
  const map = {
    active: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
    draft: { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
    archived: { bg: '#F3F4F6', color: '#374151', label: 'Archived' },
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

const GradeBadge = ({ grade }) => {
  const map = {
    Excellent: 'green',
    'Very Good': 'blue',
    Good: 'teal',
    Fair: 'yellow',
    Pass: 'orange',
    Fail: 'red',
  };
  return (
    <Badge colorScheme={map[grade] ?? 'gray'} borderRadius="full" px={2} fontSize="11px">
      {grade ?? '—'}
    </Badge>
  );
};

const PassFailBadge = ({ value }) => (
  <Badge
    colorScheme={value === 'Pass' ? 'green' : value === 'Fail' ? 'red' : 'gray'}
    borderRadius="full" px={2} fontSize="11px"
  >
    {value ?? '—'}
  </Badge>
);

const FormField = ({ label, children, required }) => (
  <VStack align="start" spacing={1}>
    <Text fontSize="13px" fontWeight="500" color="#344054">
      {label}{required && <Box as="span" color="red.400"> *</Box>}
    </Text>
    {children}
  </VStack>
);

const SearchableSelect = ({ value, options, onChange, placeholder, isDisabled }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setDropOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";

  useEffect(() => {
    setQuery(value ? selectedLabel : "");
  }, [value, selectedLabel]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropOpen(false);
        setQuery(value ? selectedLabel : "");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, selectedLabel]);

  return (
    <Box ref={containerRef} position="relative">
      <Input
        bg="#F9FAFB"
        border="1px solid #E4E7EC"
        h="42px"
        fontSize="13px"
        borderRadius="md"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        isDisabled={isDisabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setDropOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => !isDisabled && setDropOpen(true)}
      />
      {isOpen && !isDisabled && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={200}
          bg="white"
          border="1px solid #E4E7EC"
          borderRadius="md"
          boxShadow="md"
          maxH="200px"
          overflowY="auto"
          mt="2px"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="#667085">No results</Box>
          ) : (
            filtered.map((o) => (
              <Box
                key={o.value}
                px={3}
                py="7px"
                fontSize="13px"
                cursor="pointer"
                bg={String(o.value) === String(value) ? "#F3E8FF" : "white"}
                _hover={{ bg: String(o.value) === String(value) ? "#F3E8FF" : "#F9FAFB" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setQuery(o.label);
                  setDropOpen(false);
                }}
              >
                {o.label}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

const fieldStyle = {
  bg: '#F9FAFB',
  border: '1px solid #E4E7EC',
  h: '42px',
  fontSize: '13px',
  borderRadius: 'md',
};

// ─── Main Component ────────────────────────────────────────────────────────

const PerformanceFiltersPage = () => {
  const toast = useToast();

  // view: 'list' | 'builder' | 'results'
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState([]);
  const [stats, setStats] = useState(null);
  const [, setGradingScale] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [resultFilter, setResultFilter] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [myFilters, setMyFilters] = useState(false);
  const [shareInput, setShareInput] = useState('');
  const [sortBy, setSortBy] = useState({ field: 'overall_avg_score', order: 'DESC' });

  // ── Lookup data for builder dropdowns ────────────────────────────────────
  const [courseOptions, setCourseOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  // ── Fetch helpers ────────────────────────────────────────────────────────

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (myFilters) params.myFilters = true;
      const { filters: data, total } = await getPerformanceFilters(params);
      setFilters(data);
      setTotalPages(Math.max(1, Math.ceil((total || data.length) / 10)));
    } catch {
      setFilters([]);
    } finally {
      setListLoading(false);
    }
  }, [page, filterStatus, myFilters]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await getPerformanceFilterStats();
      setStats(s);
    } catch { /* stats are optional */ }
  }, []);

  const fetchGradingScale = useCallback(async () => {
    try {
      const s = await getPerformanceFilterGradingScale();
      if (Array.isArray(s)) setGradingScale(s);
    } catch { /* fallback to static */ }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [courseRes, studentRes, instructorRes, deptRes] = await Promise.allSettled([
        adminGetCourseListing({ limit: 200 }),
        adminGetUserListing({ limit: 200, role: 'Student' }),
        adminGetUserListing({ limit: 200, role: 'Instructor' }),
        adminGetDepartmentListing({ limit: 200 }),
      ]);
      if (courseRes.status === 'fulfilled')
        setCourseOptions(courseRes.value.courses ?? []);
      if (studentRes.status === 'fulfilled')
        setStudentOptions(studentRes.value.users ?? []);
      if (instructorRes.status === 'fulfilled')
        setInstructorOptions(instructorRes.value.users ?? []);
      if (deptRes.status === 'fulfilled')
        setDepartmentOptions(deptRes.value.departments ?? []);
    } catch { /* non-critical */ }
  }, []);

  const fetchModulesForCourse = useCallback(async (courseId) => {
    if (!courseId) { setModuleOptions([]); return; }
    setModulesLoading(true);
    try {
      const { modules } = await adminListModules(courseId);
      setModuleOptions(modules ?? []);
    } catch {
      setModuleOptions([]);
    } finally {
      setModulesLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); fetchStats(); }, [fetchList, fetchStats]);
  useEffect(() => {
    if (view === 'builder') { fetchGradingScale(); fetchLookups(); }
  }, [view, fetchGradingScale, fetchLookups]);

  // ── Builder helpers ──────────────────────────────────────────────────────

  const openBuilder = (cfg = null) => {
    if (cfg) {
      setEditingId(cfg.id);
      setForm({
        name: cfg.name ?? '',
        description: cfg.description ?? '',
        studentScope: cfg.studentScope ?? 'group',
        criteria: { ...INITIAL_FORM.criteria, ...(cfg.criteria ?? {}) },
        performanceMetrics: cfg.performanceMetrics ?? INITIAL_FORM.performanceMetrics,
        visualizationType: cfg.visualizationType ?? 'bar_chart',
        accessLevel: cfg.accessLevel ?? 'instructor',
        sharedWith: cfg.sharedWith ?? [],
        status: cfg.status ?? 'draft',
      });
    } else {
      setEditingId(null);
      setForm(INITIAL_FORM);
    }
    setPreviewResult(null);
    if (cfg?.criteria?.courseId) fetchModulesForCourse(cfg.criteria.courseId);
    setView('builder');
  };

  const patchCriteria = (key, value) => {
    setForm(f => ({
      ...f,
      criteria: {
        ...f.criteria,
        [key]: value,
        ...(key === 'courseId' ? { moduleId: '' } : {}),
      },
    }));
    if (key === 'courseId') fetchModulesForCourse(value);
  };

  const toggleMetric = (key) =>
    setForm(f => ({
      ...f,
      performanceMetrics: f.performanceMetrics.includes(key)
        ? f.performanceMetrics.filter(k => k !== key)
        : [...f.performanceMetrics, key],
    }));

  const addShare = () => {
    const v = shareInput.trim();
    if (!v || form.sharedWith.includes(v)) return;
    setForm(f => ({ ...f, sharedWith: [...f.sharedWith, v] }));
    setShareInput('');
  };

  const buildPayload = () => {
    const criteria = {};
    Object.entries(form.criteria).forEach(([k, v]) => {
      if (v !== '' && v != null) {
        criteria[k] = ['scoreMin', 'scoreMax', 'attendanceMin'].includes(k) ? Number(v) : v;
      }
    });
    return { ...form, criteria };
  };

  const handleSave = async (statusOverride = null) => {
    if (!form.name.trim()) {
      toast({ title: 'Filter name is required', status: 'warning', duration: 3000 });
      return;
    }
    const payload = buildPayload();
    if (statusOverride) payload.status = statusOverride;
    setSaving(true);
    try {
      if (editingId) {
        await updatePerformanceFilter(editingId, payload);
        toast({ title: 'Filter updated', status: 'success', duration: 3000 });
      } else {
        const created = await createPerformanceFilter(payload);
        if (created?.id) setEditingId(created.id);
        toast({ title: 'Filter saved', status: 'success', duration: 3000 });
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

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewResult(null);
    try {
      const payload = {
        criteria: buildPayload().criteria,
        performanceMetrics: form.performanceMetrics,
        sortBy,
      };
      const result = await previewPerformanceFilter(payload);
      setPreviewResult(result);
    } catch (e) {
      toast({ title: e?.message ?? 'Preview failed', status: 'error', duration: 3000 });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecute = async (cfg) => {
    setExecuteLoading(true);
    try {
      const result = await executePerformanceFilter(cfg.id, { sortBy });
      setResultData(result);
      setResultFilter(cfg);
      fetchStats();
      setView('results');
    } catch (e) {
      toast({ title: e?.message ?? 'Execution failed', status: 'error', duration: 3000 });
    } finally {
      setExecuteLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this performance filter? This cannot be undone.')) return;
    try {
      await deletePerformanceFilter(id);
      toast({ title: 'Filter deleted', status: 'success', duration: 2000 });
      fetchList();
      fetchStats();
    } catch (e) {
      toast({ title: e?.message ?? 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  const filteredList = filters.filter(f =>
    !searchQuery || f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ════════════════════════════════════════════════════════════════
  // RESULTS VIEW
  // ════════════════════════════════════════════════════════════════
  if (view === 'results') {
    const kpis = resultData?.kpis ?? {};
    const rows = resultData?.data ?? [];
    const gradeDistribution = kpis.grade_distribution ?? {};

    return (
      <AdminMainAreaWrapper>
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center" mb={6} mt={4}>
          <HStack spacing={3}>
            <IconButton
              icon={<FiChevronLeft />}
              variant="ghost"
              color="#660066"
              fontSize="20px"
              aria-label="Back"
              onClick={() => setView('list')}
            />
            <Box>
              <Text fontSize="20px" fontWeight="700" color="#101928">
                {resultFilter?.name ?? 'Filter Results'}
              </Text>
              {resultData?.generatedAt && (
                <Text fontSize="12px" color="#667085">
                  Generated {new Date(resultData.generatedAt).toLocaleString('en-GB')}
                  {resultData.executionTimeMs != null && ` · ${resultData.executionTimeMs}ms`}
                </Text>
              )}
            </Box>
          </HStack>
          <HStack spacing={3}>
            <Box
              as="button"
              onClick={() => openBuilder(resultFilter)}
              px={4} h="40px" borderRadius="md" border="1px solid #E4E7EC"
              bg="white" color="#344054" fontSize="13px" fontWeight="600"
              _hover={{ bg: '#F9FAFB' }}
            >
              Edit Filter
            </Box>
            <Box
              as="button"
              onClick={() => { setResultData(null); handleExecute(resultFilter); }}
              px={4} h="40px" borderRadius="md"
              bg="#660066" color="white" fontSize="13px" fontWeight="600"
              _hover={{ bg: '#550055' }}
            >
              Re-run
            </Box>
          </HStack>
        </Flex>

        {/* KPI Cards */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
          <StatCard title="Total Students" value={kpis.total_students} color="#660066" />
          <StatCard title="Avg Performance" value={kpis.average_performance != null ? `${kpis.average_performance}%` : undefined} color="#3182CE" />
          <StatCard title="High Performers" value={kpis.high_performers_percentage != null ? `${kpis.high_performers_percentage}%` : undefined} color="#38A169" />
          <StatCard title="At Risk" value={kpis.at_risk_percentage != null ? `${kpis.at_risk_percentage}%` : undefined} color="#E53E3E" />
          <StatCard title="Pass Rate" value={kpis.pass_rate != null ? `${kpis.pass_rate}%` : undefined} color="#D69E2E" />
          <StatCard title="Fail Rate" value={kpis.fail_rate != null ? `${kpis.fail_rate}%` : undefined} color="#C05621" />
        </SimpleGrid>

        {/* Grade Distribution */}
        {Object.keys(gradeDistribution).length > 0 && (
          <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7" mb={6}>
            <Text fontSize="14px" fontWeight="700" color="#101928" mb={4}>Grade Distribution</Text>
            <HStack spacing={4} wrap="wrap">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <Box key={grade} bg="#F9FAFB" px={4} py={3} borderRadius="lg" minW="90px" textAlign="center">
                  <GradeBadge grade={grade} />
                  <Text fontSize="20px" fontWeight="700" color="#101928" mt={2}>{count}</Text>
                  <Text fontSize="11px" color="#667085">students</Text>
                </Box>
              ))}
            </HStack>
          </Box>
        )}

        {/* Sort controls */}
        <Box bg="white" p={4} borderRadius="xl" border="1.5px solid #F2F4F7" mb={4}>
          <HStack spacing={3} wrap="wrap">
            <Text fontSize="13px" fontWeight="500" color="#344054">Sort by:</Text>
            <Select
              maxW="220px" h="38px" borderColor="#E4E7EC" fontSize="13px"
              value={sortBy.field}
              onChange={e => setSortBy(s => ({ ...s, field: e.target.value }))}
            >
              <option value="overall_avg_score">Overall Avg Score</option>
              <option value="exam_avg_score">Exam Avg Score</option>
              <option value="assessment_avg_score">Assessment Avg Score</option>
              <option value="completion_rate">Completion Rate</option>
              <option value="student_name">Student Name</option>
            </Select>
            <Select
              maxW="160px" h="38px" borderColor="#E4E7EC" fontSize="13px"
              value={sortBy.order}
              onChange={e => setSortBy(s => ({ ...s, order: e.target.value }))}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </Select>
            <Box
              as="button"
              onClick={() => handleExecute(resultFilter)}
              px={4} h="38px" borderRadius="md"
              bg="#660066" color="white" fontSize="13px" fontWeight="600"
              _hover={{ bg: '#550055' }}
            >
              Apply Sort
            </Box>
          </HStack>
        </Box>

        {/* Results Table */}
        <Box bg="white" borderRadius="xl" border="1.5px solid #F2F4F7" overflow="hidden">
          <Flex p={4} align="center" justify="space-between" borderBottom="1px solid #F2F4F7">
            <Text fontSize="15px" fontWeight="700" color="#101928">Student Results</Text>
            <Text fontSize="13px" color="#667085">{resultData?.recordCount ?? rows.length} records</Text>
          </Flex>

          {rows.length === 0 ? (
            <Flex justify="center" align="center" h="180px">
              <Text fontSize="14px" color="#667085">No students matched the filter criteria.</Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="#F9FAFB">
                  <Tr>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={5} py={4}>Student</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Course</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Exam Avg</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Assessment Avg</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Overall Avg</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Grade</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Pass/Fail</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Completion</Th>
                    <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Lessons</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((row, i) => (
                    <Tr key={row.student_id ?? i} borderBottom="1px solid #F2F4F7" _hover={{ bg: '#FAFAFA' }}>
                      <Td px={5} py={4}>
                        <Text fontSize="14px" fontWeight="600" color="#101928">{row.student_name ?? '—'}</Text>
                        <Text fontSize="12px" color="#667085">{row.student_email ?? ''}</Text>
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">{row.course_title ?? '—'}</Text>
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">
                          {row.exam_avg_score != null ? `${row.exam_avg_score}%` : '—'}
                        </Text>
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">
                          {row.assessment_avg_score != null ? `${row.assessment_avg_score}%` : '—'}
                        </Text>
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="14px" fontWeight="600" color="#101928">
                          {row.overall_avg_score != null ? `${row.overall_avg_score}%` : '—'}
                        </Text>
                      </Td>
                      <Td px={4} py={4}><GradeBadge grade={row.grade} /></Td>
                      <Td px={4} py={4}><PassFailBadge value={row.pass_fail} /></Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">
                          {row.completion_rate != null ? `${row.completion_rate}%` : '—'}
                        </Text>
                      </Td>
                      <Td px={4} py={4}>
                        <Text fontSize="13px" color="#475367">
                          {row.completed_lessons != null ? `${row.completed_lessons}/${row.total_lessons ?? '?'}` : '—'}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </AdminMainAreaWrapper>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // BUILDER VIEW
  // ════════════════════════════════════════════════════════════════
  if (view === 'builder') {
    return (
      <AdminMainAreaWrapper>
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center" mb={6} mt={4}>
          <HStack spacing={3}>
            <IconButton
              icon={<FiChevronLeft />}
              variant="ghost"
              color="#660066"
              fontSize="20px"
              aria-label="Back"
              onClick={() => { setView('list'); setPreviewResult(null); }}
            />
            <Text fontSize="20px" fontWeight="700" color="#101928">
              {editingId ? 'Edit Performance Filter' : 'New Performance Filter'}
            </Text>
          </HStack>
          <HStack spacing={3}>
            <Box
              as="button"
              onClick={handlePreview}
              disabled={previewLoading}
              px={4} h="44px" borderRadius="md" border="1px solid #E4E7EC"
              bg="white" color="#344054" fontSize="14px" fontWeight="600"
              _hover={{ bg: '#F9FAFB' }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: previewLoading ? 0.6 : 1 }}
            >
              <FiEye /> {previewLoading ? 'Previewing…' : 'Preview'}
            </Box>
            <Box
              as="button"
              onClick={() => handleSave('draft')}
              disabled={saving}
              px={4} h="44px" borderRadius="md" border="1px solid #660066"
              bg="white" color="#660066" fontSize="14px" fontWeight="600"
              _hover={{ bg: '#F9F0F9' }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.6 : 1 }}
            >
              <FiSave /> {saving ? 'Saving…' : 'Save Draft'}
            </Box>
            <Box
              as="button"
              onClick={() => handleSave('active')}
              disabled={saving}
              px={4} h="44px" borderRadius="md"
              bg="#660066" color="white" fontSize="14px" fontWeight="600"
              _hover={{ bg: '#550055' }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.6 : 1 }}
            >
              <FiPlay /> Activate
            </Box>
          </HStack>
        </Flex>

        <Grid templateColumns="repeat(12, 1fr)" gap={5}>
          {/* Main Column */}
          <GridItem colSpan={{ base: 12, lg: 9 }}>
            <VStack spacing={5} align="stretch">

              {/* Filter Information */}
              <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7">
                <Text fontSize="15px" fontWeight="700" color="#101928" mb={4}>Filter Information</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                  <FormField label="Filter Name" required>
                    <Input
                      {...fieldStyle}
                      placeholder="e.g. Top Performers – Module 3"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Description">
                    <Input
                      {...fieldStyle}
                      placeholder="Optional description"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Student Scope">
                    <Select
                      {...fieldStyle}
                      value={form.studentScope}
                      onChange={e => setForm(f => ({ ...f, studentScope: e.target.value }))}
                    >
                      <option value="group">Group</option>
                      <option value="individual">Individual</option>
                    </Select>
                  </FormField>
                </Grid>
              </Box>

              {/* Scope Criteria */}
              <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7">
                <Text fontSize="15px" fontWeight="700" color="#101928" mb={4}>Scope Criteria</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  <FormField label="Course">
                    <SearchableSelect
                      value={form.criteria.courseId}
                      onChange={val => patchCriteria('courseId', val)}
                      options={courseOptions.map(c => ({ value: String(c.id), label: c.title }))}
                      placeholder="Search courses…"
                    />
                  </FormField>
                  <FormField label="Module">
                    <SearchableSelect
                      value={form.criteria.moduleId}
                      onChange={val => patchCriteria('moduleId', val)}
                      options={moduleOptions.map(m => ({ value: String(m.id), label: m.title }))}
                      placeholder={
                        !form.criteria.courseId
                          ? 'Select a course first'
                          : modulesLoading
                          ? 'Loading…'
                          : 'Search modules…'
                      }
                      isDisabled={!form.criteria.courseId || modulesLoading}
                    />
                  </FormField>
                  <FormField label="Student">
                    <SearchableSelect
                      value={form.criteria.studentId}
                      onChange={val => patchCriteria('studentId', val)}
                      options={studentOptions.map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))}
                      placeholder="Search students…"
                    />
                  </FormField>
                  <FormField label="Department">
                    <SearchableSelect
                      value={form.criteria.departmentId}
                      onChange={val => patchCriteria('departmentId', val)}
                      options={departmentOptions.map(d => ({ value: String(d.id), label: d.name }))}
                      placeholder="Search departments…"
                    />
                  </FormField>
                  <FormField label="Instructor">
                    <SearchableSelect
                      value={form.criteria.instructorId}
                      onChange={val => patchCriteria('instructorId', val)}
                      options={instructorOptions.map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))}
                      placeholder="Search instructors…"
                    />
                  </FormField>
                </Grid>
              </Box>

              {/* Performance Thresholds */}
              <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7">
                <Text fontSize="15px" fontWeight="700" color="#101928" mb={4}>Performance Thresholds</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  <FormField label="Min Score (%)">
                    <Input
                      {...fieldStyle}
                      type="number" min="0" max="100"
                      placeholder="e.g. 70"
                      value={form.criteria.scoreMin}
                      onChange={e => patchCriteria('scoreMin', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Max Score (%)">
                    <Input
                      {...fieldStyle}
                      type="number" min="0" max="100"
                      placeholder="e.g. 100"
                      value={form.criteria.scoreMax}
                      onChange={e => patchCriteria('scoreMax', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Min Attendance (%)">
                    <Input
                      {...fieldStyle}
                      type="number" min="0" max="100"
                      placeholder="e.g. 75"
                      value={form.criteria.attendanceMin}
                      onChange={e => patchCriteria('attendanceMin', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Grade Filter">
                    <Select
                      {...fieldStyle}
                      placeholder="All grades"
                      value={form.criteria.grade}
                      onChange={e => patchCriteria('grade', e.target.value)}
                    >
                      {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                  </FormField>
                  <FormField label="Pass / Fail">
                    <Select
                      {...fieldStyle}
                      placeholder="All"
                      value={form.criteria.passFail}
                      onChange={e => patchCriteria('passFail', e.target.value)}
                    >
                      <option value="pass">Pass only</option>
                      <option value="fail">Fail only</option>
                    </Select>
                  </FormField>
                </Grid>

                {/* Grading scale reference */}
                <Box mt={5} p={4} bg="#F9F0F9" borderRadius="lg">
                  <Text fontSize="12px" fontWeight="600" color="#660066" mb={2}>Grading Scale Reference</Text>
                  <HStack spacing={3} wrap="wrap">
                    {[
                      { range: '90–100', label: 'Excellent', color: 'green' },
                      { range: '80–89', label: 'Very Good', color: 'blue' },
                      { range: '70–79', label: 'Good', color: 'teal' },
                      { range: '60–69', label: 'Fair', color: 'yellow' },
                      { range: '50–59', label: 'Pass', color: 'orange' },
                      { range: '<50', label: 'Fail', color: 'red' },
                    ].map(s => (
                      <HStack key={s.label} spacing={1}>
                        <Badge colorScheme={s.color} borderRadius="full" px={2} fontSize="11px">{s.label}</Badge>
                        <Text fontSize="11px" color="#667085">{s.range}</Text>
                      </HStack>
                    ))}
                  </HStack>
                </Box>
              </Box>

              {/* Date Range */}
              <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7">
                <Text fontSize="15px" fontWeight="700" color="#101928" mb={4}>Date Range</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <FormField label="Start Date">
                    <Input
                      {...fieldStyle}
                      type="date"
                      value={form.criteria.startDate}
                      onChange={e => patchCriteria('startDate', e.target.value)}
                    />
                  </FormField>
                  <FormField label="End Date">
                    <Input
                      {...fieldStyle}
                      type="date"
                      value={form.criteria.endDate}
                      onChange={e => patchCriteria('endDate', e.target.value)}
                    />
                  </FormField>
                </Grid>
              </Box>

              {/* Performance Metrics */}
              <Box bg="white" p={6} borderRadius="xl" border="1.5px solid #F2F4F7">
                <Text fontSize="15px" fontWeight="700" color="#101928" mb={1}>Performance Metrics</Text>
                <Text fontSize="12px" color="#667085" mb={4}>
                  Select which metrics to include in the results
                </Text>
                <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={3}>
                  {METRIC_OPTIONS.map(m => (
                    <Checkbox
                      key={m.key}
                      colorScheme="purple"
                      isChecked={form.performanceMetrics.includes(m.key)}
                      onChange={() => toggleMetric(m.key)}
                    >
                      <Text fontSize="13px" color="#475367">{m.label}</Text>
                    </Checkbox>
                  ))}
                </Grid>
              </Box>

            </VStack>
          </GridItem>

          {/* Right Sidebar */}
          <GridItem colSpan={{ base: 12, lg: 3 }}>
            <Box bg="white" p={5} borderRadius="xl" border="1.5px solid #F2F4F7">
              <Text fontSize="15px" fontWeight="700" color="#101928" mb={5}>Filter Settings</Text>
              <VStack align="stretch" spacing={5}>

                {/* Status */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Status</Text>
                  <HStack>
                    <Box w={2} h={2} borderRadius="full"
                      bg={form.status === 'draft' ? '#F79009' : form.status === 'active' ? '#12B76A' : '#98A2B3'}
                    />
                    <Text fontSize="14px" fontWeight="500" color="#101928" textTransform="capitalize">
                      {form.status}
                    </Text>
                  </HStack>
                </Box>

                {/* Visualization */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Visualization Type</Text>
                  <Select
                    bg="#F9FAFB" border="1px solid #E4E7EC" fontSize="13px" h="40px"
                    value={form.visualizationType}
                    onChange={e => setForm(f => ({ ...f, visualizationType: e.target.value }))}
                  >
                    {VIZ_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </Select>
                </Box>

                {/* Access Level */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Access Level</Text>
                  <Select
                    bg="#F9FAFB" border="1px solid #E4E7EC" fontSize="13px" h="40px"
                    value={form.accessLevel}
                    onChange={e => setForm(f => ({ ...f, accessLevel: e.target.value }))}
                  >
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="instructor/admin">Instructor & Admin</option>
                  </Select>
                </Box>

                {/* Share With */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#344054" mb={2}>Share With</Text>
                  <HStack mb={2}>
                    <Input
                      placeholder="Username or ID"
                      bg="#F9FAFB" border="1px solid #E4E7EC" fontSize="12px" h="36px"
                      value={shareInput}
                      onChange={e => setShareInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addShare()}
                    />
                    <IconButton
                      icon={<FiPlus />} size="sm"
                      bg="#660066" color="white" _hover={{ bg: '#550055' }}
                      onClick={addShare} aria-label="Add"
                    />
                  </HStack>
                  <VStack align="start" spacing={1}>
                    {form.sharedWith.map(u => (
                      <HStack key={u} justify="space-between" w="100%">
                        <Text fontSize="12px" color="#475367">{u}</Text>
                        <IconButton
                          icon={<FiX />} size="xs" variant="ghost" color="#667085"
                          onClick={() => setForm(f => ({ ...f, sharedWith: f.sharedWith.filter(s => s !== u) }))}
                          aria-label={`Remove ${u}`}
                        />
                      </HStack>
                    ))}
                  </VStack>
                </Box>

              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* Preview Results */}
        {(previewLoading || previewResult) && (
          <Box mt={6} bg="white" borderRadius="xl" border="1.5px solid #F2F4F7" overflow="hidden">
            <Flex p={4} align="center" justify="space-between" borderBottom="1px solid #F2F4F7">
              <Text fontSize="15px" fontWeight="700" color="#101928">Preview Results</Text>
              {previewResult && (
                <HStack spacing={5}>
                  <Text fontSize="13px" color="#667085">{previewResult.recordCount ?? 0} records</Text>
                  {previewResult.executionTimeMs != null && (
                    <Text fontSize="13px" color="#667085">{previewResult.executionTimeMs}ms</Text>
                  )}
                </HStack>
              )}
            </Flex>

            {previewLoading ? (
              <Flex justify="center" align="center" h="160px">
                <VStack spacing={3}>
                  <Spinner color="#660066" size="lg" />
                  <Text fontSize="13px" color="#667085">Generating preview…</Text>
                </VStack>
              </Flex>
            ) : previewResult?.data?.length > 0 ? (
              <>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="#F9FAFB">
                      <Tr>
                        <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={5} py={3}>Student</Th>
                        <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Course</Th>
                        <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Overall Avg</Th>
                        <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Grade</Th>
                        <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Pass/Fail</Th>
                        <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4}>Completion</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {previewResult.data.map((row, i) => (
                        <Tr key={row.student_id ?? i} borderBottom="1px solid #F2F4F7">
                          <Td px={5} py={3}>
                            <Text fontSize="13px" fontWeight="600" color="#101928">{row.student_name ?? '—'}</Text>
                            <Text fontSize="11px" color="#667085">{row.student_email ?? ''}</Text>
                          </Td>
                          <Td px={4} py={3}><Text fontSize="13px" color="#475367">{row.course_title ?? '—'}</Text></Td>
                          <Td px={4} py={3}><Text fontSize="13px" fontWeight="600" color="#101928">{row.overall_avg_score != null ? `${row.overall_avg_score}%` : '—'}</Text></Td>
                          <Td px={4} py={3}><GradeBadge grade={row.grade} /></Td>
                          <Td px={4} py={3}><PassFailBadge value={row.pass_fail} /></Td>
                          <Td px={4} py={3}><Text fontSize="13px" color="#475367">{row.completion_rate != null ? `${row.completion_rate}%` : '—'}</Text></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                {previewResult.kpis && (
                  <Box p={4} borderTop="1px solid #F2F4F7">
                    <Text fontSize="13px" fontWeight="600" color="#344054" mb={3}>KPI Summary</Text>
                    <HStack spacing={4} wrap="wrap">
                      {Object.entries(previewResult.kpis).map(([key, val]) =>
                        typeof val !== 'object' ? (
                          <Box key={key} bg="#F9FAFB" px={4} py={2} borderRadius="lg">
                            <Text fontSize="11px" color="#667085" mb={1}>
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                            <Text fontSize="18px" fontWeight="700" color="#101928">{val ?? '—'}</Text>
                          </Box>
                        ) : null
                      )}
                    </HStack>
                  </Box>
                )}
              </>
            ) : (
              <Flex justify="center" align="center" h="120px">
                <Text fontSize="14px" color="#667085">No data returned for the current criteria.</Text>
              </Flex>
            )}
          </Box>
        )}
      </AdminMainAreaWrapper>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // LIST VIEW (default)
  // ════════════════════════════════════════════════════════════════
  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/studentReport">Reports</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Performance Filters</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} mt={4}>
        <Box>
          <Text fontSize="24px" fontWeight="700" color="#101928">
            Student Performance Filters
          </Text>
          <Text fontSize="13px" color="#667085" mt={1}>
            Create, save, and execute custom student performance filters (Electronic Registers)
          </Text>
        </Box>
        <Box
          as="button"
          onClick={() => openBuilder()}
          px={4} h="44px" borderRadius="md"
          bg="#660066" color="white" fontSize="14px" fontWeight="600"
          _hover={{ bg: '#550055' }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FiPlus /> New Filter
        </Box>
      </Flex>

      {/* KPI Stats */}
      <HStack spacing={4} mb={6} align="stretch" wrap="wrap">
        <StatCard title="Total Filters Saved" value={stats?.totalFiltersSaved} />
        <StatCard title="Total Executions" value={stats?.totalExecutions} color="#38A169" />
        <StatCard title="Preview Executions" value={stats?.previewExecutions} color="#3182CE" />
        <StatCard title="Saved Filter Runs" value={stats?.savedFilterExecutions} color="#D69E2E" />
        <StatCard
          title="Avg Generation Time"
          value={stats?.avgGenerationTimeMs != null ? `${stats.avgGenerationTimeMs}ms` : undefined}
          color="#C05621"
        />
      </HStack>

      {/* List Controls */}
      <Box bg="white" p={4} borderRadius="xl" border="1.5px solid #F2F4F7" mb={4}>
        <Flex gap={3} align="center" wrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none" h="100%">
              <FiSearch color="#667085" />
            </InputLeftElement>
            <Input
              placeholder="Search filters..."
              h="42px" bg="white" border="1px solid #E4E7EC" borderRadius="md"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Select
            maxW="180px" h="42px" borderColor="#E4E7EC" borderRadius="md"
            placeholder="All statuses"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
          <HStack
            as="button"
            spacing={2} px={3} h="42px" borderRadius="md"
            border="1px solid #E4E7EC" bg={myFilters ? '#F9F0F9' : 'white'}
            color={myFilters ? '#660066' : '#344054'}
            onClick={() => { setMyFilters(v => !v); setPage(1); }}
            _hover={{ bg: '#F9F0F9' }}
          >
            <FiFilter />
            <Text fontSize="13px" fontWeight="500">My Filters</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Filters Table */}
      <Box bg="white" borderRadius="xl" border="1.5px solid #F2F4F7" overflow="hidden">
        {listLoading ? (
          <Flex justify="center" align="center" h="240px">
            <Spinner color="#660066" size="lg" />
          </Flex>
        ) : (
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={5} py={4}>Filter Name</Th>
                <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Scope</Th>
                <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Status</Th>
                <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Access Level</Th>
                <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Runs</Th>
                <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Last Run</Th>
                <Th fontSize="12px" fontWeight="500" color="#475367" textTransform="none" px={4} py={4}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredList.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={16} color="#667085" fontSize="14px">
                    No filters found. Click "New Filter" to create one.
                  </Td>
                </Tr>
              ) : (
                filteredList.map(cfg => (
                  <Tr key={cfg.id} borderBottom="1px solid #F2F4F7" _hover={{ bg: '#FAFAFA' }}>
                    <Td px={5} py={4}>
                      <Text fontSize="14px" fontWeight="600" color="#101928">{cfg.name}</Text>
                      {cfg.description && (
                        <Text fontSize="12px" color="#667085" noOfLines={1}>{cfg.description}</Text>
                      )}
                    </Td>
                    <Td px={4} py={4}>
                      <Text fontSize="13px" color="#475367" textTransform="capitalize">
                        {cfg.studentScope ?? '—'}
                      </Text>
                    </Td>
                    <Td px={4} py={4}><StatusBadge status={cfg.status} /></Td>
                    <Td px={4} py={4}>
                      <Text fontSize="13px" color="#475367" textTransform="capitalize">
                        {cfg.accessLevel ?? '—'}
                      </Text>
                    </Td>
                    <Td px={4} py={4}>
                      <Text fontSize="13px" color="#475367">{cfg.accessCount ?? 0}</Text>
                    </Td>
                    <Td px={4} py={4}>
                      <Text fontSize="13px" color="#475367">
                        {cfg.lastExecutedAt
                          ? new Date(cfg.lastExecutedAt).toLocaleDateString('en-GB')
                          : '—'}
                      </Text>
                    </Td>
                    <Td px={4} py={4}>
                      <HStack spacing={1}>
                        <IconButton
                          icon={executeLoading ? <Spinner size="xs" /> : <FiPlay />}
                          size="sm" variant="ghost" color="#660066"
                          aria-label="Execute filter" title="Run Filter"
                          isDisabled={executeLoading}
                          onClick={() => handleExecute(cfg)}
                        />
                        <IconButton
                          icon={<FiEdit2 />}
                          size="sm" variant="ghost" color="#3182CE"
                          aria-label="Edit filter" title="Edit"
                          onClick={() => openBuilder(cfg)}
                        />
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm" variant="ghost" color="#E53E3E"
                          aria-label="Delete filter" title="Delete"
                          onClick={() => handleDelete(cfg.id)}
                        />
                      </HStack>
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
              icon={<FiChevronLeft />} variant="ghost" size="sm" color="#667085"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              isDisabled={page === 1}
              aria-label="Previous page"
            />
            <Text fontSize="13px" color="#475367">Page {page} of {totalPages}</Text>
            <IconButton
              icon={<FiChevronRight />} variant="ghost" size="sm" color="#667085"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              isDisabled={page >= totalPages}
              aria-label="Next page"
            />
          </HStack>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const PerformanceFiltersPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <PerformanceFiltersPage {...props} />} />
);

export default PerformanceFiltersPage;
