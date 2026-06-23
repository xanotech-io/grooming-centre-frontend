import { useCallback, useEffect, useRef, useState } from "react";
import { Route } from "react-router-dom";
import {
  Badge,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Progress,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { DashboardMetricCard } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetCourseListing,
  adminListModules,
  createExportReport,
  getDataImport,
  getDataImportExportKpis,
  getExportReport,
  getExportReports,
  uploadDataImport,
} from "../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  FiUpload,
  FiDownload,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiDatabase,
  FiFilter,
} from "react-icons/fi";
import dayjs from "dayjs";

// ─── Constants ────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { value: "attendance", label: "Attendance" },
  { value: "gradebook", label: "Gradebook" },
  { value: "assessment", label: "Assessment Scores" },
  { value: "exam_results", label: "Exam Results" },
  { value: "course_roster", label: "Course Roster" },
  { value: "student_records", label: "Student Records" },
  { value: "course_information", label: "Course Information" },
  { value: "compliance_records", label: "Compliance Records" },
  { value: "performance_reports", label: "Performance Reports" },
  { value: "user_records", label: "User Records" },
];

const EXPORT_FORMATS = ["pdf", "excel", "csv", "json", "xml"];
const IMPORT_FORMATS = ["csv", "excel"];

const LIMIT = 20;

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

const EXPORT_STATUS = {
  pending:   { bg: "#FFF5EA", color: "#DD6B20" },
  completed: { bg: "#E6F4EA", color: "#38A169" },
  failed:    { bg: "#FED7D7", color: "#E53E3E" },
};

const IMPORT_STATUS = {
  pending:    { bg: "#FFF5EA", color: "#DD6B20" },
  validating: { bg: "#EBF4FF", color: "#3182CE" },
  completed:  { bg: "#E6F4EA", color: "#38A169" },
  failed:     { bg: "#FED7D7", color: "#E53E3E" },
  partial:    { bg: "#FEFCBF", color: "#B7791F" },
};

const STATUS_LABELS = { completed: "Successful" };

const StatusBadge = ({ status, map }) => {
  const s = (map ?? EXPORT_STATUS)[status] ?? { bg: "#F7FAFC", color: "#718096" };
  const label = STATUS_LABELS[status] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : "—");
  return (
    <Badge bg={s.bg} color={s.color} px="8px" py="2px" borderRadius="6px" fontSize="11px">
      {label}
    </Badge>
  );
};

const TabBtn = ({ active, onClick, icon, children }) => (
  <Flex
    as="button"
    alignItems="center"
    gap="6px"
    px="16px"
    py="10px"
    fontSize="13px"
    fontWeight={active ? "600" : "500"}
    color={active ? "#6b006b" : "gray.500"}
    borderBottom={active ? "2px solid #6b006b" : "2px solid transparent"}
    onClick={onClick}
    _hover={{ color: "#6b006b" }}
    whiteSpace="nowrap"
  >
    {icon}
    {children}
  </Flex>
);

const isExpired = (expiryDate) => expiryDate && dayjs().isAfter(dayjs(expiryDate));

const SearchableSelect = ({ value, options, onChange, placeholder, isDisabled }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => { setQuery(value ? selectedLabel : ""); }, [value, selectedLabel]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery(value ? selectedLabel : "");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, selectedLabel]);

  return (
    <Box ref={containerRef} position="relative">
      <Input
        size="sm"
        bg={isDisabled ? "gray.100" : "gray.50"}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        isDisabled={isDisabled}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); if (e.target.value === "") onChange(""); }}
        onFocus={() => { if (!isDisabled) setIsOpen(true); }}
      />
      {isOpen && !isDisabled && (
        <Box
          position="absolute" top="100%" left={0} right={0} zIndex={200}
          bg="white" border="1px solid #E4E7EC" borderRadius="md"
          boxShadow="md" maxH="240px" overflowY="auto" mt="2px"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="#667085">No results</Box>
          ) : (
            filtered.map((o) => (
              <Box
                key={o.value} px={3} py="7px" fontSize="13px" cursor="pointer"
                bg={o.value === value ? "#F3E8FF" : "white"}
                _hover={{ bg: o.value === value ? "#F3E8FF" : "#F9FAFB" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(o.value); setQuery(o.label); setIsOpen(false); }}
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

// ─── KPI Dashboard Tab ────────────────────────────────────────────────────────

const KpiTab = () => {
  const toast = useToast();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const now = dayjs();
  const [startDate, setStartDate] = useState(now.startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(now.endOf("month").format("YYYY-MM-DD"));

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDataImportExportKpis({ startDate, endDate });
      setKpis(res?.data ?? res);
    } catch {
      toast({ title: "Failed to load KPIs", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const exp = kpis?.exports ?? {};
  const imp = kpis?.imports ?? {};

  return (
    <Box>
      <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" mb={6} overflow="hidden">
        <Flex
          px="16px" py="10px" alignItems="center" justifyContent="space-between"
          cursor="pointer" onClick={() => setShowFilters((v) => !v)}
          _hover={{ bg: "#EDF2F7" }}
        >
          <Text fontSize="12px" fontWeight="600" color="gray.500">
            Date Range: {dayjs(startDate).format("DD/MM/YYYY")} — {dayjs(endDate).format("DD/MM/YYYY")}
          </Text>
          {showFilters ? <FiChevronUp size={14} color="#718096" /> : <FiChevronDown size={14} color="#718096" />}
        </Flex>
        {showFilters && (
          <Box borderTop="1px solid #E2E8F0" p="16px">
            <Flex gap="12px" alignItems="flex-end" flexWrap="wrap">
              <FormControl w="180px">
                <FormLabel fontSize="12px" color="gray.500" mb="4px">Start Date</FormLabel>
                <Input type="date" size="sm" bg="white" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FormControl>
              <FormControl w="180px">
                <FormLabel fontSize="12px" color="gray.500" mb="4px">End Date</FormLabel>
                <Input type="date" size="sm" bg="white" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </FormControl>
              <Button secondary size="sm" leftIcon={<FiRefreshCw size={12} />} onClick={fetch} isLoading={loading}>
                Apply
              </Button>
            </Flex>
          </Box>
        )}
      </Box>

      {loading ? (
        <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>
      ) : kpis ? (
        <>
          <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="12px">
            overview within selected timeline
          </Text>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4} mb={8}>
            <DashboardMetricCard title="Total Operations" value={kpis.totalOperations ?? "—"} change="imports + exports + extractions" changeColor="#6b006b" />
            <DashboardMetricCard title="Overall Success Rate" value={`${kpis.successRate ?? 0}%`} change="all operations" changeColor="#38A169" />
            {/* <DashboardMetricCard title="Failed Transfers" value={failed} change="exports + imports failed" changeColor="#E53E3E" /> */}
             <DashboardMetricCard title="Total Exports" value={exp.total ?? "—"} change={`${exp.failed ?? 0} failed`} changeColor="#3182CE" />
            {/* <DashboardMetricCard title="Export Success Rate" value={`${exp.successRate ?? 0}%`} change="completed exports" changeColor="#38A169" /> */}
            <DashboardMetricCard title="Avg File Size" value={`${exp.avgFileSizeMb ?? "—"} MB`} change="per export" changeColor="#6b006b" />
             <DashboardMetricCard title="Total Imports" value={imp.total ?? "—"} change={`${imp.failed ?? 0} failed`} changeColor="#3182CE" />
          </Grid>

          
        </>
      ) : (
        <Text color="gray.400" textAlign="center" py="40px">No KPI data available</Text>
      )}
    </Box>
  );
};

// ─── Import Result Panel ──────────────────────────────────────────────────────

const ImportResultPanel = ({ result }) => {
  if (!result) return null;
  const total = result.totalRows ?? result.summary?.total_rows ?? 0;
  const success = result.successfulRows ?? result.summary?.successful_rows ?? 0;
  const failed = result.failedRows ?? result.summary?.failed_rows ?? 0;
  const warnings = result.warningRows ?? result.summary?.warning_rows ?? 0;
  const errors = result.validationErrors ?? result.errors ?? [];
  const warnList = result.warnings ?? [];

  return (
    <Box mt={6} bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
      <Box p="16px" borderBottom="1px solid #E2E8F0">
        <Flex gap="6px" alignItems="center" mb={3}>
          <StatusBadge status={result.status} map={IMPORT_STATUS} />
          <Text fontSize="12px" color="gray.500">Import ID: {result.id}</Text>
          {result.processingTimeMs != null && (
            <Text fontSize="12px" color="gray.400">· {(result.processingTimeMs / 1000).toFixed(1)}s</Text>
          )}
        </Flex>
        <Grid templateColumns="repeat(4, 1fr)" gap={3}>
          {[
            { label: "Total Rows", value: total, color: "#1A202C" },
            { label: "Successful", value: success, color: "#38A169" },
            { label: "Failed", value: failed, color: "#E53E3E" },
            { label: "Warnings", value: warnings, color: "#DD6B20" },
          ].map(({ label, value, color }) => (
            <Box key={label} bg="#F7FAFC" borderRadius="6px" p="12px" textAlign="center">
              <Text fontSize="20px" fontWeight="700" color={color}>{value}</Text>
              <Text fontSize="11px" color="gray.500">{label}</Text>
            </Box>
          ))}
        </Grid>
        {total > 0 && (
          <Box mt={3}>
            <Progress value={(success / total) * 100} size="sm" colorScheme="green" borderRadius="4px" />
            <Text fontSize="11px" color="gray.400" mt="4px">{Math.round((success / total) * 100)}% success rate</Text>
          </Box>
        )}
      </Box>

      {errors.length > 0 && (
        <Box p="16px" borderBottom={warnList.length > 0 ? "1px solid #E2E8F0" : undefined}>
          <Text fontSize="12px" fontWeight="700" color="#E53E3E" mb="8px">Validation Errors ({errors.length})</Text>
          <Box maxH="200px" overflowY="auto">
            <TableContainer>
              <Table variant="simple" size="xs">
                <Thead><Tr><Th>Row</Th><Th>Issue</Th></Tr></Thead>
                <Tbody>
                  {errors.map((e, i) => (
                    <Tr key={i}>
                      <Td py="6px" color="gray.500" fontSize="12px">{e.row ?? "—"}</Td>
                      <Td py="6px" fontSize="12px">{e.issue ?? e.message ?? String(e)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      {warnList.length > 0 && (
        <Box p="16px">
          <Text fontSize="12px" fontWeight="700" color="#DD6B20" mb="8px">Warnings ({warnList.length})</Text>
          <Box maxH="160px" overflowY="auto">
            <TableContainer>
              <Table variant="simple" size="xs">
                <Thead><Tr><Th>Row</Th><Th>Issue</Th></Tr></Thead>
                <Tbody>
                  {warnList.map((w, i) => (
                    <Tr key={i}>
                      <Td py="6px" color="gray.500" fontSize="12px">{w.row ?? "—"}</Td>
                      <Td py="6px" fontSize="12px">{w.issue ?? w.message ?? String(w)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ─── Import Tab ───────────────────────────────────────────────────────────────

const ImportTab = () => {
  const toast = useToast();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [fileFormat, setFileFormat] = useState("csv");
  const [reportName, setReportName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    adminGetCourseListing()
      .then((res) => setCourses(res?.courses ?? []))
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    setModuleId("");
    setModules([]);
    if (!courseId) return;
    setModulesLoading(true);
    adminListModules(courseId)
      .then((res) => setModules(res?.modules ?? []))
      .catch(() => setModules([]))
      .finally(() => setModulesLoading(false));
  }, [courseId]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  const startPolling = (importId) => {
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await getDataImport(importId);
        const d = res?.data ?? res;
        setResult(d);
        if (d?.status && !["pending", "validating"].includes(d.status)) {
          stopPolling();
          setPolling(false);
        }
      } catch {
        stopPolling();
        setPolling(false);
      }
    }, 4000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setReportName(f.name);
    setFileFormat(f.name.endsWith(".xlsx") || f.name.endsWith(".xls") ? "excel" : "csv");
  };

  const handleSubmit = async () => {
    if (!file) { toast({ title: "Please select a file", status: "warning", duration: 3000, isClosable: true }); return; }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileFormat", fileFormat);
    if (reportName.trim()) formData.append("reportName", reportName.trim());
    if (courseId) formData.append("courseId", courseId);
    if (moduleId) formData.append("targetModule", moduleId);
    setSubmitting(true);
    setResult(null);
    stopPolling();
    try {
      const res = await uploadDataImport(formData);
      const d = res?.data ?? res;
      setResult(d);
      if (d?.id && ["pending", "validating"].includes(d?.status) && (d?.totalRows ?? 0) > 5000) {
        startPolling(d.id);
      }
      toast({ title: "Import submitted successfully", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Import failed", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxW="2xl">
      <Text fontSize="14px" color="gray.500" mb={5}>
        Upload a CSV or Excel file to bulk-import data into the LMS.
      </Text>

      <Box
        border="2px dashed #E2E8F0"
        borderRadius="10px"
        p="32px"
        textAlign="center"
        cursor="pointer"
        _hover={{ borderColor: "#6b006b", bg: "#FAF5FF" }}
        onClick={() => fileRef.current?.click()}
        mb={5}
        transition="all 0.15s"
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileChange} />
        <FiUpload size={28} color={file ? "#6b006b" : "#CBD5E0"} style={{ margin: "0 auto 10px" }} />
        {file ? (
          <>
            <Text fontWeight="600" fontSize="14px" color="#6b006b">{file.name}</Text>
            <Text fontSize="12px" color="gray.400">{(file.size / 1024).toFixed(1)} KB · click to change</Text>
          </>
        ) : (
          <>
            <Text fontWeight="500" fontSize="14px" color="gray.600">Click to select a file</Text>
            <Text fontSize="12px" color="gray.400">CSV or Excel (.xlsx) supported</Text>
          </>
        )}
      </Box>

      <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="500">File Format</FormLabel>
          <Select size="sm" value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} bg="gray.50">
            {IMPORT_FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="500">Report Name <Text as="span" color="gray.400" fontWeight="400">(optional)</Text></FormLabel>
          <Input size="sm" placeholder="Defaults to filename" value={reportName} onChange={(e) => setReportName(e.target.value)} />
        </FormControl>
      </Grid>

      <Grid templateColumns="1fr 1fr" gap={4} mb={6}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="500">Course <Text as="span" color="gray.400" fontWeight="400">(optional)</Text></FormLabel>
          <SearchableSelect
            value={courseId}
            options={courses.map((c) => ({ value: c.id, label: c.title }))}
            onChange={setCourseId}
            placeholder="Search course…"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="500">Module <Text as="span" color="gray.400" fontWeight="400">(optional)</Text></FormLabel>
          <SearchableSelect
            value={moduleId}
            options={modules.map((m) => ({ value: m.id, label: m.title }))}
            onChange={setModuleId}
            placeholder={modulesLoading ? "Loading…" : courseId ? "Search module…" : "Select a course first"}
            isDisabled={!courseId || modulesLoading}
          />
        </FormControl>
      </Grid>

      <Button leftIcon={<FiUpload />} isLoading={submitting} loadingText="Uploading…" onClick={handleSubmit}>
        Upload & Import
      </Button>

      {polling && (
        <Flex alignItems="center" gap="8px" mt={4}>
          <Spinner size="sm" color="#6b006b" />
          <Text fontSize="13px" color="gray.500">Processing large dataset — checking for updates…</Text>
        </Flex>
      )}

      <ImportResultPanel result={result} />
    </Box>
  );
};

// ─── Export Result Panel ──────────────────────────────────────────────────────

const ExportResultPanel = ({ result }) => {
  if (!result) return null;
  const expired = isExpired(result.expiryDate);

  return (
    <Box mt={6} bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="20px">
      <Flex alignItems="center" gap="8px" mb={3}>
        <StatusBadge status={result.status} />
        <Text fontSize="12px" color="gray.500">ID: {result.id}</Text>
      </Flex>
      <Text fontWeight="600" fontSize="14px" mb={1}>{result.reportName ?? result.fileName}</Text>
      <Text fontSize="12px" color="gray.400" mb={4}>
        {result.totalRecords != null && <>{result.totalRecords.toLocaleString()} records · </>}
        {result.fileSizeMb != null && <>{result.fileSizeMb} MB · </>}
        {result.exportFormat?.toUpperCase()}
      </Text>

      {result.fileUrl && (
        <Flex alignItems="center" gap="10px" flexWrap="wrap">
          <Button
            leftIcon={<FiDownload />}
            as="a"
            href={result.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            isDisabled={expired}
            size="sm"
          >
            Download File
          </Button>
          {result.expiryDate && (
            <Text fontSize="12px" color={expired ? "red.500" : "gray.400"}>
              {expired ? "Link expired" : `Expires ${dayjs(result.expiryDate).format("DD/MM/YYYY")}`}
            </Text>
          )}
        </Flex>
      )}

      {result.errorMessage && (
        <Text mt={3} fontSize="13px" color="red.500">{result.errorMessage}</Text>
      )}
    </Box>
  );
};

// ─── Export Tab ───────────────────────────────────────────────────────────────

const ExportExtractTab = ({ operationType }) => {
  const toast = useToast();
  const isExtract = operationType === "extraction";
  const [reportType, setReportType] = useState("attendance");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [reportName, setReportName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    adminGetCourseListing()
      .then((res) => setCourses(res?.courses ?? []))
      .catch(() => setCourses([]));
  }, []);

  const handleSubmit = async () => {
    if (endDate && startDate && dayjs(endDate).isBefore(dayjs(startDate))) {
      toast({ title: "End date must not precede start date", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    const filters = {};
    if (courseId.trim()) filters.courseId = courseId.trim();
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const payload = {
      operationType,
      reportType,
      exportFormat,
      ...(reportName.trim() ? { reportName: reportName.trim() } : {}),
      ...(Object.keys(filters).length ? { filters } : {}),
    };

    setSubmitting(true);
    setResult(null);
    try {
      const res = await createExportReport(payload);
      setResult(res?.data ?? res);
      toast({ title: `${isExtract ? "Extraction" : "Export"} generated successfully`, status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Operation failed", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxW="2xl">
      <Text fontSize="14px" color="gray.500" mb={5}>
        {isExtract
          ? "Pull a filtered, ad-hoc dataset from the LMS."
          : "Generate a structured report and download it in your preferred format."}
      </Text>

      <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="500">{isExtract ? "Data Type" : "Report Type"}</FormLabel>
          <Select size="sm" value={reportType} onChange={(e) => setReportType(e.target.value)} bg="gray.50">
            {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="500">Format</FormLabel>
          <Select size="sm" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} bg="gray.50">
            {EXPORT_FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </Select>
        </FormControl>
      </Grid>

      <FormControl mb={4}>
        <FormLabel fontSize="sm" fontWeight="500">Report Name <Text as="span" color="gray.400" fontWeight="400">(optional)</Text></FormLabel>
        <Input size="sm" placeholder={isExtract ? "e.g. Q3 Instructor Extract" : "e.g. June 2025 Attendance"} value={reportName} onChange={(e) => setReportName(e.target.value)} />
      </FormControl>

      <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" p="16px" mb={6}>
        <Text fontSize="12px" fontWeight="600" color="gray.500" mb={3}>Filters <Text as="span" color="gray.400" fontWeight="400">(optional)</Text></Text>
        <Grid templateColumns="1fr 1fr 1fr" gap={3}>
          <FormControl>
            <FormLabel fontSize="xs" color="gray.500">Course</FormLabel>
            <Select size="sm" value={courseId} onChange={(e) => setCourseId(e.target.value)} bg="white" placeholder="All courses">
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="xs" color="gray.500">Start Date</FormLabel>
            <Input size="sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} bg="white" />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="xs" color="gray.500">End Date</FormLabel>
            <Input size="sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} bg="white" />
          </FormControl>
        </Grid>
      </Box>

      <Button
        leftIcon={isExtract ? <FiFilter /> : <FiDownload />}
        isLoading={submitting}
        loadingText={isExtract ? "Running…" : "Generating…"}
        onClick={handleSubmit}
      >
        {isExtract ? "Run Extraction" : "Generate Export"}
      </Button>

      <ExportResultPanel result={result} />
    </Box>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DetailDrawer = ({ isOpen, onClose, record, type }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !record) return;
    setDetail(null);
    setLoading(true);
    const id = record.id ?? record._id;
    const fn = type === "import" ? getDataImport : getExportReport;
    fn(id)
      .then((res) => setDetail(res?.data ?? res))
      .catch(() => setDetail(record))
      .finally(() => setLoading(false));
  }, [isOpen, record, type]);

  const d = detail ?? record;
  const expired = isExpired(d?.expiryDate);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" placement="right">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottom="1px solid #E2E8F0" pb="14px">
          <Text fontSize="15px" fontWeight="600">{type === "import" ? "Import" : "Export / Extract"} Details</Text>
        </DrawerHeader>
        <DrawerBody py="20px">
          {loading ? (
            <Flex justifyContent="center" alignItems="center" minH="200px"><Spinner size="lg" color="#6b006b" /></Flex>
          ) : d ? (
            <>
              <Flex gap="8px" mb={4} flexWrap="wrap">
                <StatusBadge status={d.status} map={type === "import" ? IMPORT_STATUS : EXPORT_STATUS} />
                {d.operationType && <Badge bg="#EBF4FF" color="#3182CE" px="8px" borderRadius="6px" fontSize="11px">{d.operationType}</Badge>}
              </Flex>

              {[
                ["ID", d.id],
                ["Report Name", d.reportName],
                ["Report Type", d.reportType],
                ["Format", d.exportFormat ?? d.fileFormat],
                ["Source File", d.sourceFile],
                ["Target Module", d.targetModule],
                ["Records", d.totalRecords?.toLocaleString()],
                ["Total Rows", d.totalRows],
                ["Successful Rows", d.successfulRows],
                ["Failed Rows", d.failedRows],
                ["File Size", d.fileSizeMb != null ? `${d.fileSizeMb} MB` : null],
                ["Processing Time", d.processingTimeMs != null ? `${(d.processingTimeMs / 1000).toFixed(1)}s` : null],
                ["Performed By", d.exporter ? `${d.exporter.firstName} ${d.exporter.lastName}` : d.uploader ? `${d.uploader.firstName} ${d.uploader.lastName}` : null],
                ["Created", d.createdAt ? dayjs(d.createdAt).format("DD/MM/YYYY HH:mm") : null],
                ["Expires", d.expiryDate ? dayjs(d.expiryDate).format("DD/MM/YYYY") : null],
              ]
                .filter(([, v]) => v != null && v !== "")
                .map(([label, value]) => (
                  <Flex key={label} justifyContent="space-between" py="8px" borderBottom="1px solid #F7FAFC">
                    <Text fontSize="13px" color="gray.500">{label}</Text>
                    <Text fontSize="13px" fontWeight="500" color="#1A202C" maxW="55%" textAlign="right" wordBreak="break-all">{String(value)}</Text>
                  </Flex>
                ))}

              {d.errorMessage && (
                <Box mt={4} p="12px" bg="red.50" borderRadius="6px">
                  <Text fontSize="12px" color="red.600">{d.errorMessage}</Text>
                </Box>
              )}

              {d.fileUrl && (
                <Box mt={4}>
                  <Button
                    w="full"
                    leftIcon={<FiDownload />}
                    as="a"
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    isDisabled={expired}
                    size="sm"
                  >
                    {expired ? "Download Link Expired" : "Download File"}
                  </Button>
                </Box>
              )}

              {/* Validation errors */}
              {(d.validationErrors ?? d.errors ?? []).length > 0 && (
                <Box mt={4}>
                  <Text fontSize="12px" fontWeight="700" color="#E53E3E" mb="8px">Validation Errors</Text>
                  <Box maxH="240px" overflowY="auto" border="1px solid #FED7D7" borderRadius="6px">
                    <TableContainer>
                      <Table variant="simple" size="xs">
                        <Thead bg="#FFF5F5"><Tr><Th>Row</Th><Th>Issue</Th></Tr></Thead>
                        <Tbody>
                          {(d.validationErrors ?? d.errors ?? []).map((e, i) => (
                            <Tr key={i}><Td py="6px" fontSize="12px">{e.row ?? "—"}</Td><Td py="6px" fontSize="12px">{e.issue ?? e.message}</Td></Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Text color="gray.400" textAlign="center" mt="40px">Record not found</Text>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// ─── History Tab ──────────────────────────────────────────────────────────────

const HistoryTab = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / LIMIT) || 1;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (formatFilter) params.exportFormat = formatFilter;
      if (typeFilter) params.operationType = typeFilter;
      const res = await getExportReports(params);
      const d = res?.data ?? res;
      const list = Array.isArray(d) ? d : (d?.data ?? d?.exports ?? d?.records ?? []);
      setRows(list);
      setTotal(d?.total ?? d?.totalCount ?? list.length);
    } catch {
      toast({ title: "Failed to load records", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, formatFilter, typeFilter, toast]);

  useEffect(() => { setPage(1); }, [statusFilter, formatFilter, typeFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = (row) => {
    setSelected(row);
    onOpen();
  };

  return (
    <Box>
      <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" p="16px" mb={4}>
        <Flex gap="12px" alignItems="flex-end" flexWrap="wrap">
          <FormControl w="160px">
            <FormLabel fontSize="12px" color="gray.500" mb="4px">Action Type</FormLabel>
            <Select size="sm" bg="white" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="import">Import</option>
              <option value="export">Export</option>
              <option value="extraction">Extraction</option>
            </Select>
          </FormControl>
          <FormControl w="160px">
            <FormLabel fontSize="12px" color="gray.500" mb="4px">Format</FormLabel>
            <Select size="sm" bg="white" value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
              <option value="">All Formats</option>
              {EXPORT_FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </Select>
          </FormControl>
          <FormControl w="160px">
            <FormLabel fontSize="12px" color="gray.500" mb="4px">Status</FormLabel>
            <Select size="sm" bg="white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {["pending", "completed", "failed"].map((s) => <option key={s} value={s}>{STATUS_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </Select>
          </FormControl>
          <IconButton icon={<FiRefreshCw size={13} />} size="sm" variant="ghost" onClick={fetchData} isLoading={loading} aria-label="Refresh" mt="20px" />
          <Text fontSize="13px" color="gray.400" ml="auto" alignSelf="flex-end">{total} total</Text>
        </Flex>
      </Box>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
        {loading ? (
          <Flex justifyContent="center" py="60px"><Spinner size="lg" color="#6b006b" /></Flex>
        ) : rows.length === 0 ? (
          <Text color="gray.400" textAlign="center" py="60px" fontSize="14px">No records found</Text>
        ) : (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Report Name", "Performed By", "Type", "Format", "Records", "File Size", "Status", "Expires", "Created", ""].map((h) => (
                    <Th key={h} py="12px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r, i) => (
                  <Tr key={r.id ?? i} _hover={{ bg: "#FAFAFA" }}>
                    <Td py="12px" maxW="200px">
                      <Text fontSize="13px" fontWeight="500" noOfLines={1}>{r.reportName ?? r.fileName ?? "—"}</Text>
                    </Td>
                    <Td py="12px" fontSize="12px" color="gray.600" whiteSpace="nowrap">
                      {(r.exporter ?? r.uploader)
                        ? `${(r.exporter ?? r.uploader).firstName} ${(r.exporter ?? r.uploader).lastName}`
                        : "—"}
                    </Td>
                    <Td py="12px" fontSize="12px">{r.operationType ?? "—"}</Td>
                    <Td py="12px" fontSize="12px" textTransform="uppercase">{r.exportFormat ?? "—"}</Td>
                    <Td py="12px" fontSize="12px" fontWeight="600">{r.totalRecords?.toLocaleString() ?? "—"}</Td>
                    <Td py="12px" fontSize="12px">{r.fileSizeMb != null ? `${r.fileSizeMb} MB` : "—"}</Td>
                    <Td py="12px"><StatusBadge status={r.status} /></Td>
                    <Td py="12px" fontSize="12px" color={isExpired(r.expiryDate) ? "red.400" : "gray.400"} whiteSpace="nowrap">
                      {r.expiryDate ? dayjs(r.expiryDate).format("DD/MM/YYYY") : "—"}
                    </Td>
                    <Td py="12px" fontSize="12px" color="gray.400" whiteSpace="nowrap">{r.createdAt ? dayjs(r.createdAt).format("DD/MM/YYYY") : "—"}</Td>
                    <Td py="12px">
                      <IconButton
                        icon={<FiEye size={13} />}
                        size="xs" variant="ghost" colorScheme="purple"
                        aria-label="View details"
                        onClick={() => openDetail(r)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {totalPages > 1 && (
          <Flex justifyContent="space-between" alignItems="center" px="20px" py="12px" borderTop="1px solid #E2E8F0">
            <Text fontSize="13px" color="gray.500">Page {page} of {totalPages}</Text>
            <Flex gap="8px">
              <IconButton icon={<FiChevronLeft />} size="sm" variant="outline" isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous" />
              <IconButton icon={<FiChevronRight />} size="sm" variant="outline" isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next" />
            </Flex>
          </Flex>
        )}
      </Box>

      <DetailDrawer isOpen={isOpen} onClose={onClose} record={selected} type="export" />
    </Box>
  );
};

// ─── Dashboard Tab (KPIs + History) ──────────────────────────────────────────

const DashboardTab = () => (
  <Box>
    <KpiTab />
    <Box mt={8}>
      <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={4}>
        Transfer History
      </Text>
      <HistoryTab />
    </Box>
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "kpis",    label: "Report Overview",  icon: <FiDatabase size={14} /> },
  { key: "import",  label: "Import",     icon: <FiUpload size={14} /> },
  { key: "export",  label: "Export",     icon: <FiDownload size={14} /> },
  { key: "extract", label: "Extract",    icon: <FiFilter size={14} /> },
];

const DataImportExportPage = () => {
  const [activeTab, setActiveTab] = useState("kpis");

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/data-import-export">Data Import & Export</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Heading as="h1" fontSize="heading.h3" mb={1}>Data Import, Export & Extraction</Heading>
      <Text fontSize="13px" color="gray.500" mb={5}>TC06 — Unified interface for importing, exporting, and extracting LMS data.</Text>

      {/* Tab Bar */}
      <Flex
        borderBottom="1px solid #E2E8F0"
        mb={6}
        overflowX="auto"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        {TABS.map((t) => (
          <TabBtn key={t.key} active={activeTab === t.key} icon={t.icon} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </TabBtn>
        ))}
      </Flex>

      <Divider mb={0} display="none" />

      {activeTab === "kpis"    && <DashboardTab />}
      {activeTab === "import"  && <ImportTab />}
      {activeTab === "export"  && <ExportExtractTab operationType="export" />}
      {activeTab === "extract" && <ExportExtractTab operationType="extraction" />}
    </AdminMainAreaWrapper>
  );
};

export const DataImportExportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <DataImportExportPage {...props} />} />
);

export default DataImportExportPage;
