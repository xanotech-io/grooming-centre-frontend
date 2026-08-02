import React, { useState, useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Select,
  Input,
  SimpleGrid,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  useDisclosure,
  useToast,
  Grid,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import {
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import dayjs from "dayjs";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, DashboardMetricCard, Link } from "../../../components";
import {
  createExportReport,
  getExportReports,
  getMyExports,
  getExportReport,
  getDataImportExportKpis,
} from "../../../services";

const useStyles = makeStyles(() => ({
  tabs: { borderBottom: "1px solid #e2e8f0", marginBottom: 16 },
  tab: { textTransform: "none", fontWeight: 600, fontSize: 14 },
}));

// ─── Constants ────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { value: "attendance", label: "Attendance" },
  { value: "gradebook", label: "Gradebook" },
  { value: "assessment", label: "Assessment" },
  { value: "exam_results", label: "Exam Results" },
  { value: "course_roster", label: "Course Roster" },
  { value: "student_records", label: "Student Records" },
  { value: "course_information", label: "Course Information" },
  { value: "compliance_records", label: "Compliance Records" },
  { value: "performance_reports", label: "Performance Reports" },
  { value: "user_records", label: "User Records" },
];

const FORMATS = ["pdf", "excel", "csv", "json", "xml"];

const FORMAT_COLORS = {
  pdf: "red",
  excel: "green",
  csv: "teal",
  json: "orange",
  xml: "gray",
};

const STATUS_COLORS = {
  completed: "green",
  pending: "yellow",
  failed: "red",
};

const OP_COLORS = {
  export: "blue",
  extraction: "purple",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_KPIS = {
  totalOperations: 310,
  successRate: 94,
  exports: { total: 180, successful: 172, failed: 8, successRate: 96, avgFileSizeMb: 4.7 },
  imports: { total: 130, successful: 121, failed: 9, successRate: 93, totalRowsProcessed: 48000, dataAccuracyRate: 98, avgProcessingTimeMs: 2340 },
};

const MOCK_EXPORTS = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    operationType: "export",
    reportType: "attendance",
    reportName: "October Attendance Report",
    exportFormat: "pdf",
    exporter: { id: "u1", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com" },
    filters: { courseId: "c-001", startDate: "2026-10-01", endDate: "2026-10-31" },
    status: "completed",
    fileName: "October_Attendance_Report_20261031.pdf",
    fileUrl: "https://secure-storage.blob.core.windows.net/reports/abc123",
    fileSizeMb: 3.4,
    expiryDate: "2026-11-07",
    totalRecords: 240,
    errorMessage: null,
    createdAt: "2026-10-31T11:05:00Z",
    updatedAt: "2026-10-31T11:05:00Z",
  },
  {
    id: "4ab12c78-1234-4567-abcd-ef1234567890",
    operationType: "extraction",
    reportType: "compliance_records",
    reportName: "Overdue Compliance Extract",
    exportFormat: "csv",
    exporter: { id: "u2", firstName: "Tom", lastName: "Admin", email: "tom@example.com" },
    filters: { status: "Overdue", startDate: "2026-01-01", endDate: "2026-03-31" },
    status: "completed",
    fileName: "compliance_extract_20260401.csv",
    fileUrl: "https://secure-storage.blob.core.windows.net/reports/def456",
    fileSizeMb: 0.2,
    expiryDate: "2026-04-08",
    totalRecords: 47,
    errorMessage: null,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-01T09:01:00Z",
  },
  {
    id: "5bc23d89-2345-5678-bcde-ef2345678901",
    operationType: "export",
    reportType: "exam_results",
    reportName: "Q1 Exam Results",
    exportFormat: "excel",
    exporter: { id: "u1", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com" },
    filters: { startDate: "2026-01-01", endDate: "2026-03-31" },
    status: "failed",
    fileName: null,
    fileUrl: null,
    fileSizeMb: null,
    expiryDate: null,
    totalRecords: null,
    errorMessage: "Timeout: dataset too large. Try narrowing the date range.",
    createdAt: "2026-04-05T14:30:00Z",
    updatedAt: "2026-04-05T14:32:00Z",
  },
  {
    id: "6cd34e90-3456-6789-cdef-ef3456789012",
    operationType: "export",
    reportType: "gradebook",
    reportName: "Gradebook Export – May",
    exportFormat: "json",
    exporter: { id: "u3", firstName: "Sarah", lastName: "Lee", email: "sarah.lee@example.com" },
    filters: { courseId: "c-002" },
    status: "pending",
    fileName: null,
    fileUrl: null,
    fileSizeMb: null,
    expiryDate: null,
    totalRecords: null,
    errorMessage: null,
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-05-20T10:00:00Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isExpired = (expiryDate) => expiryDate && dayjs(expiryDate).isBefore(dayjs(), "day");

const PaginationBar = ({ page, totalPages, onPrev, onNext, limit, onLimitChange }) => (
  <Flex justifyContent="space-between" alignItems="center" mt={4} flexWrap="wrap" gap={2}>
    <Flex alignItems="center" gap={2}>
      <Text fontSize="sm" color="gray.500">Rows per page:</Text>
      <Select size="sm" w="70px" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
        {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
      </Select>
    </Flex>
    <Flex alignItems="center" gap={2}>
      <Button size="sm" onClick={onPrev} isDisabled={page <= 1} variant="outline">Prev</Button>
      <Text fontSize="sm">Page {page} of {totalPages || 1}</Text>
      <Button size="sm" onClick={onNext} isDisabled={page >= totalPages} variant="outline">Next</Button>
    </Flex>
  </Flex>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ExportReportsPage = () => {
  const classes = useStyles();
  const toast = useToast();
  const [tab, setTab] = useState(0);

  // KPIs
  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiStartDate, setKpiStartDate] = useState("");
  const [kpiEndDate, setKpiEndDate] = useState("");

  // Admin history table
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ operationType: "", reportType: "", status: "", exportFormat: "" });

  // My exports tab
  const [myRows, setMyRows] = useState([]);
  const [myTotal, setMyTotal] = useState(0);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [myPage, setMyPage] = useState(1);
  const [myLimit, setMyLimit] = useState(20);
  const [myLoading, setMyLoading] = useState(false);
  const [myFilters, setMyFilters] = useState({ operationType: "", reportType: "", status: "", exportFormat: "" });

  // Detail drawer
  const { isOpen: isDetailOpen, onOpen: openDetail, onClose: closeDetail } = useDisclosure();
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Export form modal
  const { isOpen: isFormOpen, onOpen: openForm, onClose: closeForm } = useDisclosure();
  const [formData, setFormData] = useState({
    operationType: "export",
    reportType: "",
    exportFormat: "",
    reportName: "",
    filters: { courseId: "", studentId: "", departmentId: "", startDate: "", endDate: "", attendanceStatus: "", deliveryMode: "", status: "" },
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Pre-fill for retry
  const [retryData, setRetryData] = useState(null);

  // ── KPI fetch ────────────────────────────────────────────────────────────────

  const fetchKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const params = {};
      if (kpiStartDate) params.startDate = kpiStartDate;
      if (kpiEndDate) params.endDate = kpiEndDate;
      const res = await getDataImportExportKpis(params);
      setKpis(res?.data ?? res);
    } catch {
      console.warn("[ExportReports] GET /export-reports-v2/kpis failed, using mock");
      setKpis(MOCK_KPIS);
    } finally { setKpiLoading(false); }
  }, [kpiStartDate, kpiEndDate]);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);

  // ── Admin history fetch ───────────────────────────────────────────────────────

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getExportReports(params);
      const list = Array.isArray(res?.data?.exports) ? res.data.exports : Array.isArray(res?.exports) ? res.exports : Array.isArray(res) ? res : [];
      setRows(list);
      setTotal(res?.data?.total ?? res?.total ?? list.length);
      setTotalPages(res?.data?.totalPages ?? res?.totalPages ?? 1);
    } catch {
      console.warn("[ExportReports] GET /export-reports-v2 failed, using mock");
      setRows(MOCK_EXPORTS);
      setTotal(MOCK_EXPORTS.length);
      setTotalPages(1);
    } finally { setLoading(false); }
  }, [page, limit, filters]);

  useEffect(() => { if (tab === 0) fetchRows(); }, [fetchRows, tab]);

  // ── My exports fetch ─────────────────────────────────────────────────────────

  const fetchMyRows = useCallback(async () => {
    setMyLoading(true);
    try {
      const params = { page: myPage, limit: myLimit };
      Object.entries(myFilters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getMyExports(params);
      const list = Array.isArray(res?.data?.exports) ? res.data.exports : Array.isArray(res?.exports) ? res.exports : Array.isArray(res) ? res : [];
      setMyRows(list);
      setMyTotal(res?.data?.total ?? res?.total ?? list.length);
      setMyTotalPages(res?.data?.totalPages ?? res?.totalPages ?? 1);
    } catch {
      console.warn("[ExportReports] GET /my-exports failed, using mock");
      setMyRows(MOCK_EXPORTS.slice(0, 2));
      setMyTotal(2);
      setMyTotalPages(1);
    } finally { setMyLoading(false); }
  }, [myPage, myLimit, myFilters]);

  useEffect(() => { if (tab === 1) fetchMyRows(); }, [fetchMyRows, tab]);

  // ── Detail drawer ─────────────────────────────────────────────────────────────

  const handleOpenDetail = async (id) => {
    openDetail();
    setDetailLoading(true);
    try {
      const res = await getExportReport(id);
      setDetailRecord(res?.data ?? res);
    } catch {
      setDetailRecord(MOCK_EXPORTS.find((r) => r.id === id) ?? null);
    } finally { setDetailLoading(false); }
  };

  // ── Export form ───────────────────────────────────────────────────────────────

  const handleOpenForm = (prefill = null) => {
    if (prefill) {
      setFormData({
        operationType: prefill.operationType ?? "export",
        reportType: prefill.reportType ?? "",
        exportFormat: prefill.exportFormat ?? "",
        reportName: prefill.reportName ?? "",
        filters: { ...{ courseId: "", studentId: "", departmentId: "", startDate: "", endDate: "", attendanceStatus: "", deliveryMode: "", status: "" }, ...(prefill.filters ?? {}) },
      });
      setRetryData(prefill);
    } else {
      setFormData({ operationType: "export", reportType: "", exportFormat: "", reportName: "", filters: { courseId: "", studentId: "", departmentId: "", startDate: "", endDate: "", attendanceStatus: "", deliveryMode: "", status: "" } });
      setRetryData(null);
    }
    setFormErrors({});
    setLastResult(null);
    openForm();
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.reportType) errs.reportType = "Please select a report type.";
    if (!formData.exportFormat) errs.exportFormat = "Please select an export format.";
    const { startDate, endDate } = formData.filters;
    if ((startDate && !endDate) || (!startDate && endDate)) errs.dateRange = "Please provide both start and end dates.";
    if (startDate && endDate && endDate < startDate) errs.dateRange = "End date must be on or after start date.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitExport = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const cleanFilters = {};
      Object.entries(formData.filters).forEach(([k, v]) => { if (v) cleanFilters[k] = v; });
      const body = {
        operationType: formData.operationType,
        reportType: formData.reportType,
        exportFormat: formData.exportFormat,
      };
      if (formData.reportName) body.reportName = formData.reportName;
      if (Object.keys(cleanFilters).length) body.filters = cleanFilters;
      const res = await createExportReport(body);
      const record = res?.data ?? res;
      setLastResult(record);
      toast({ title: "Export ready. Your file is available for download.", status: "success", duration: 4000 });
      fetchRows();
      if (tab === 1) fetchMyRows();
    } catch (err) {
      toast({ title: err?.response?.data?.message ?? "Export failed. Please try again.", status: "error", duration: 4000 });
    } finally { setSubmitting(false); }
  };

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const renderFormatBadge = (fmt) => <Badge colorScheme={FORMAT_COLORS[fmt] ?? "gray"}>{fmt?.toUpperCase()}</Badge>;
  const renderStatusBadge = (s) => <Badge colorScheme={STATUS_COLORS[s] ?? "gray"}>{s}</Badge>;
  const renderOpBadge = (op) => <Badge colorScheme={OP_COLORS[op] ?? "gray"}>{op}</Badge>;
  const renderReportType = (rt) => REPORT_TYPES.find((r) => r.value === rt)?.label ?? rt;

  const FilterRow = ({ value, onChange }) => (
    <Flex gap={2} mb={4} flexWrap="wrap">
      <Select size="sm" placeholder="Operation Type" w="160px" value={value.operationType} onChange={(e) => onChange({ ...value, operationType: e.target.value })}>
        <option value="export">Export</option>
        <option value="extraction">Extraction</option>
      </Select>
      <Select size="sm" placeholder="Report Type" w="180px" value={value.reportType} onChange={(e) => onChange({ ...value, reportType: e.target.value })}>
        {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </Select>
      <Select size="sm" placeholder="Status" w="140px" value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </Select>
      <Select size="sm" placeholder="Format" w="120px" value={value.exportFormat} onChange={(e) => onChange({ ...value, exportFormat: e.target.value })}>
        {FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
      </Select>
      <Button size="sm" variant="outline" onClick={() => onChange({ operationType: "", reportType: "", status: "", exportFormat: "" })}>Clear</Button>
    </Flex>
  );

  const ExportTable = ({ data, loadingState }) => (
    <Box overflowX="auto">
      <Table size="sm" variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Report Name</Th>
            <Th>Type</Th>
            <Th>Operation</Th>
            <Th>Format</Th>
            <Th>Exported By</Th>
            <Th>Records</Th>
            <Th>Size</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th>Expiry</Th>
            <Th>Download</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loadingState ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Tr key={i}>
                {Array.from({ length: 12 }).map((__, j) => (
                  <Td key={j}><Skeleton height="16px" /></Td>
                ))}
              </Tr>
            ))
          ) : data.length === 0 ? (
            <Tr><Td colSpan={12} textAlign="center" py={8} color="gray.500">No export records found.</Td></Tr>
          ) : (
            data.map((row) => {
              const expired = isExpired(row.expiryDate);
              return (
                <Tr key={row.id} _hover={{ bg: "gray.50" }} cursor="pointer">
                  <Td>
                    <Text
                      color="blue.500"
                      fontWeight="medium"
                      cursor="pointer"
                      onClick={() => handleOpenDetail(row.id)}
                      _hover={{ textDecoration: "underline" }}
                    >
                      {row.reportName || renderReportType(row.reportType)}
                    </Text>
                  </Td>
                  <Td><Badge colorScheme="gray" fontSize="xs">{renderReportType(row.reportType)}</Badge></Td>
                  <Td>{renderOpBadge(row.operationType)}</Td>
                  <Td>{renderFormatBadge(row.exportFormat)}</Td>
                  <Td>{row.exporter ? `${row.exporter.firstName} ${row.exporter.lastName}` : "—"}</Td>
                  <Td>{row.totalRecords ?? "—"}</Td>
                  <Td>{row.fileSizeMb != null ? `${row.fileSizeMb} MB` : "—"}</Td>
                  <Td>{renderStatusBadge(row.status)}</Td>
                  <Td>{dayjs(row.createdAt).format("DD/MM/YYYY HH:mm")}</Td>
                  <Td>
                    {row.expiryDate ? (
                      <Text fontSize="xs" color={expired ? "red.500" : "gray.600"}>
                        {expired ? "Expired" : dayjs(row.expiryDate).format("DD/MM/YYYY")}
                      </Text>
                    ) : "—"}
                  </Td>
                  <Td>
                    {row.fileUrl && !expired && row.status === "completed" ? (
                      <Button size="xs" leftIcon={<FiDownload />} colorScheme="blue" variant="outline" as="a" href={row.fileUrl} download={row.fileName} target="_blank" rel="noopener noreferrer">
                        Download
                      </Button>
                    ) : (
                      <Button size="xs" isDisabled leftIcon={<FiDownload />} variant="outline">
                        {expired ? "Expired" : "N/A"}
                      </Button>
                    )}
                  </Td>
                  <Td>
                    {row.status === "failed" && (
                      <Tooltip label="Retry export">
                        <Button size="xs" leftIcon={<FiRefreshCw />} colorScheme="orange" variant="outline" onClick={() => handleOpenForm(row)}>
                          Retry
                        </Button>
                      </Tooltip>
                    )}
                    {row.errorMessage && (
                      <Tooltip label={row.errorMessage}>
                        <Box as="span" ml={1} color="red.400" display="inline-flex" alignItems="center">
                          <FiAlertCircle />
                        </Box>
                      </Tooltip>
                    )}
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Export Reports</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" borderBottom="1px" borderColor="gray.200" pb={4} mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">Export Reports</Text>
          <Text fontSize="sm" color="gray.500">Generate and manage system data exports in PDF, Excel, CSV, JSON, and XML formats.</Text>
        </Box>
        <Button leftIcon={<FiFileText />} colorScheme="blue" onClick={() => handleOpenForm()}>New Export</Button>
      </Flex>

      {/* KPI date filter */}
      <Flex gap={3} mb={4} alignItems="center">
        <Text fontSize="sm" fontWeight="medium" color="gray.600">KPI Range:</Text>
        <Input size="sm" type="date" w="160px" value={kpiStartDate} onChange={(e) => setKpiStartDate(e.target.value)} />
        <Text fontSize="sm" color="gray.500">to</Text>
        <Input size="sm" type="date" w="160px" value={kpiEndDate} onChange={(e) => setKpiEndDate(e.target.value)} />
        <Button size="sm" variant="outline" onClick={fetchKpis} isLoading={kpiLoading}>Refresh</Button>
        {(kpiStartDate || kpiEndDate) && (
          <Button size="sm" variant="ghost" onClick={() => { setKpiStartDate(""); setKpiEndDate(""); }}>Clear</Button>
        )}
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 5 }} spacing={4} mb={8}>
        <DashboardMetricCard title="Total Operations" value={kpiLoading ? "..." : kpis?.totalOperations ?? "—"} />
        <DashboardMetricCard title="Overall Success Rate" value={kpiLoading ? "..." : kpis?.successRate != null ? `${kpis.successRate}%` : "—"} colorScheme={kpis?.successRate < 75 ? "red" : kpis?.successRate < 90 ? "yellow" : "green"} />
        <DashboardMetricCard title="Total Exports" value={kpiLoading ? "..." : kpis?.exports?.total ?? "—"} />
        <DashboardMetricCard title="Successful Exports" value={kpiLoading ? "..." : kpis?.exports?.successful ?? "—"} />
        <DashboardMetricCard title="Failed Exports" value={kpiLoading ? "..." : kpis?.exports?.failed ?? "—"} colorScheme={kpis?.exports?.failed > 0 ? "red" : "gray"} />
        <DashboardMetricCard title="Export Success Rate" value={kpiLoading ? "..." : kpis?.exports?.successRate != null ? `${kpis.exports.successRate}%` : "—"} colorScheme={kpis?.exports?.successRate < 75 ? "red" : kpis?.exports?.successRate < 90 ? "yellow" : "green"} />
        <DashboardMetricCard title="Avg File Size" value={kpiLoading ? "..." : kpis?.exports?.avgFileSizeMb != null ? `${kpis.exports.avgFileSizeMb} MB` : "—"} />
        <DashboardMetricCard title="Total Imports" value={kpiLoading ? "..." : kpis?.imports?.total ?? "—"} />
        <DashboardMetricCard title="Import Success Rate" value={kpiLoading ? "..." : kpis?.imports?.successRate != null ? `${kpis.imports.successRate}%` : "—"} />
      </SimpleGrid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className={classes.tabs}>
        <Tab label="Export History" className={classes.tab} />
        <Tab label="My Exports" className={classes.tab} />
      </Tabs>

      {/* Export History Tab */}
      {tab === 0 && (
        <Box>
          <FilterRow value={filters} onChange={(v) => { setFilters(v); setPage(1); }} />
          <ExportTable data={rows} loadingState={loading} />
          <PaginationBar page={page} totalPages={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} />
          <Text fontSize="sm" color="gray.500" mt={2}>Total: {total} record{total !== 1 ? "s" : ""}</Text>
        </Box>
      )}

      {/* My Exports Tab */}
      {tab === 1 && (
        <Box>
          <FilterRow value={myFilters} onChange={(v) => { setMyFilters(v); setMyPage(1); }} />
          <ExportTable data={myRows} loadingState={myLoading} />
          <PaginationBar page={myPage} totalPages={myTotalPages} onPrev={() => setMyPage((p) => p - 1)} onNext={() => setMyPage((p) => p + 1)} limit={myLimit} onLimitChange={(v) => { setMyLimit(v); setMyPage(1); }} />
          <Text fontSize="sm" color="gray.500" mt={2}>Total: {myTotal} record{myTotal !== 1 ? "s" : ""}</Text>
        </Box>
      )}

      {/* ─── Export Form Modal ──────────────────────────────────────────────────── */}
      <Modal isOpen={isFormOpen} onClose={closeForm} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{retryData ? "Retry Export" : "New Export / Extraction"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            {retryData && (
              <Alert status="warning" mb={4} borderRadius="md">
                <AlertIcon />
                Retrying the failed export. Adjust settings if needed, then confirm.
              </Alert>
            )}

            {/* Last result — download link shown after success without closing modal */}
            {lastResult && (
              <Alert status="success" mb={4} borderRadius="md" flexDirection="column" alignItems="flex-start">
                <Flex alignItems="center" mb={2}><AlertIcon />Export ready. Your file is available for download.</Flex>
                {lastResult.fileUrl && (
                  <Button size="sm" leftIcon={<FiDownload />} colorScheme="green" as="a" href={lastResult.fileUrl} download={lastResult.fileName} target="_blank" rel="noopener noreferrer" mb={1}>
                    Download File
                  </Button>
                )}
                {lastResult.expiryDate && (
                  <Text fontSize="xs" color="gray.500">This link expires on {dayjs(lastResult.expiryDate).format("MMMM D, YYYY")}.</Text>
                )}
              </Alert>
            )}

            <Grid templateColumns="1fr 1fr" gap={4}>
              <FormControl>
                <FormLabel fontSize="sm">Operation Type</FormLabel>
                <Select size="sm" value={formData.operationType} onChange={(e) => setFormData((p) => ({ ...p, operationType: e.target.value }))}>
                  <option value="export">Export</option>
                  <option value="extraction">Extraction</option>
                </Select>
              </FormControl>

              <FormControl isInvalid={!!formErrors.reportType}>
                <FormLabel fontSize="sm">Report Type *</FormLabel>
                <Select size="sm" placeholder="Select type" value={formData.reportType} onChange={(e) => setFormData((p) => ({ ...p, reportType: e.target.value }))}>
                  {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </Select>
                <FormErrorMessage>{formErrors.reportType}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.exportFormat}>
                <FormLabel fontSize="sm">Export Format *</FormLabel>
                <Select size="sm" placeholder="Select format" value={formData.exportFormat} onChange={(e) => setFormData((p) => ({ ...p, exportFormat: e.target.value }))}>
                  {FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </Select>
                <FormErrorMessage>{formErrors.exportFormat}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Report Name (optional)</FormLabel>
                <Input size="sm" placeholder="e.g. October Attendance Report" value={formData.reportName} onChange={(e) => setFormData((p) => ({ ...p, reportName: e.target.value }))} />
              </FormControl>
            </Grid>

            <Text fontSize="sm" fontWeight="semibold" mt={5} mb={3} color="gray.600">Filters (all optional)</Text>
            <Grid templateColumns="1fr 1fr" gap={4}>
              <FormControl>
                <FormLabel fontSize="sm">Course ID</FormLabel>
                <Input size="sm" placeholder="UUID" value={formData.filters.courseId} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, courseId: e.target.value } }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Student ID</FormLabel>
                <Input size="sm" placeholder="UUID" value={formData.filters.studentId} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, studentId: e.target.value } }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Department ID</FormLabel>
                <Input size="sm" placeholder="UUID" value={formData.filters.departmentId} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, departmentId: e.target.value } }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Status Filter</FormLabel>
                <Input size="sm" placeholder="e.g. Overdue, Active" value={formData.filters.status} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, status: e.target.value } }))} />
              </FormControl>
              <FormControl isInvalid={!!formErrors.dateRange}>
                <FormLabel fontSize="sm">Start Date</FormLabel>
                <Input size="sm" type="date" value={formData.filters.startDate} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, startDate: e.target.value } }))} />
              </FormControl>
              <FormControl isInvalid={!!formErrors.dateRange}>
                <FormLabel fontSize="sm">End Date</FormLabel>
                <Input size="sm" type="date" value={formData.filters.endDate} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, endDate: e.target.value } }))} />
                <FormErrorMessage>{formErrors.dateRange}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Attendance Status</FormLabel>
                <Input size="sm" placeholder="e.g. Present, Absent" value={formData.filters.attendanceStatus} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, attendanceStatus: e.target.value } }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Delivery Mode</FormLabel>
                <Select size="sm" placeholder="Any" value={formData.filters.deliveryMode} onChange={(e) => setFormData((p) => ({ ...p, filters: { ...p.filters, deliveryMode: e.target.value } }))}>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </FormControl>
            </Grid>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSubmitExport} isLoading={submitting}>
              {retryData ? "Retry Export" : "Confirm Export"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── Detail Drawer ──────────────────────────────────────────────────────── */}
      <Drawer isOpen={isDetailOpen} onClose={closeDetail} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px" borderColor="gray.200">Export Detail</DrawerHeader>
          <DrawerBody pt={4}>
            {detailLoading ? (
              <SimpleGrid columns={1} spacing={3}>
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height="40px" />)}
              </SimpleGrid>
            ) : detailRecord ? (
              <Box>
                <DetailRow label="Export ID" value={<Text fontSize="xs" fontFamily="mono">{detailRecord.id}</Text>} />
                <DetailRow label="Report Name" value={detailRecord.reportName || "—"} />
                <DetailRow label="Operation Type" value={renderOpBadge(detailRecord.operationType)} />
                <DetailRow label="Report Type" value={<Badge colorScheme="gray">{renderReportType(detailRecord.reportType)}</Badge>} />
                <DetailRow label="Format" value={renderFormatBadge(detailRecord.exportFormat)} />
                <DetailRow label="Status" value={renderStatusBadge(detailRecord.status)} />
                <DetailRow label="Exported By" value={detailRecord.exporter ? `${detailRecord.exporter.firstName} ${detailRecord.exporter.lastName}` : "—"} />
                <DetailRow label="Exporter Email" value={detailRecord.exporter?.email ?? "—"} />
                <DetailRow label="Total Records" value={detailRecord.totalRecords ?? "—"} />
                <DetailRow label="File Size" value={detailRecord.fileSizeMb != null ? `${detailRecord.fileSizeMb} MB` : "—"} />
                <DetailRow label="File Name" value={detailRecord.fileName || "—"} />
                <DetailRow
                  label="Expiry Date"
                  value={
                    detailRecord.expiryDate ? (
                      <Text color={isExpired(detailRecord.expiryDate) ? "red.500" : dayjs(detailRecord.expiryDate).diff(dayjs(), "hour") < 24 ? "orange.500" : "gray.700"}>
                        {isExpired(detailRecord.expiryDate) ? "Expired" : dayjs(detailRecord.expiryDate).format("DD/MM/YYYY")}
                      </Text>
                    ) : "—"
                  }
                />
                <DetailRow label="Created At" value={dayjs(detailRecord.createdAt).format("DD/MM/YYYY HH:mm")} />
                <DetailRow label="Updated At" value={dayjs(detailRecord.updatedAt).format("DD/MM/YYYY HH:mm")} />

                {detailRecord.errorMessage && (
                  <Alert status="error" mt={3} borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">{detailRecord.errorMessage}</Text>
                  </Alert>
                )}

                {detailRecord.filters && Object.keys(detailRecord.filters).length > 0 && (
                  <Box mt={4}>
                    <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.600">Filters Applied</Text>
                    {Object.entries(detailRecord.filters).map(([k, v]) => (
                      v ? <DetailRow key={k} label={k} value={String(v)} /> : null
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                Export record not found.
              </Alert>
            )}
          </DrawerBody>
          {detailRecord && (
            <DrawerFooter borderTop="1px" borderColor="gray.200" gap={2} flexWrap="wrap">
              {detailRecord.fileUrl && !isExpired(detailRecord.expiryDate) && detailRecord.status === "completed" && (
                <Button leftIcon={<FiDownload />} colorScheme="blue" size="sm" as="a" href={detailRecord.fileUrl} download={detailRecord.fileName} target="_blank" rel="noopener noreferrer">
                  Download
                </Button>
              )}
              {detailRecord.status === "failed" && (
                <Button leftIcon={<FiRefreshCw />} colorScheme="orange" size="sm" onClick={() => { closeDetail(); handleOpenForm(detailRecord); }}>
                  Retry
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={closeDetail}>Close</Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </AdminMainAreaWrapper>
  );
};

// ─── Detail Row helper ────────────────────────────────────────────────────────

const DetailRow = ({ label, value }) => (
  <Flex justifyContent="space-between" alignItems="flex-start" py={2} borderBottom="1px" borderColor="gray.100">
    <Text fontSize="sm" color="gray.500" minW="140px">{label}</Text>
    <Box flex={1} textAlign="right">
      {typeof value === "string" || typeof value === "number" ? (
        <Text fontSize="sm" fontWeight="medium">{value}</Text>
      ) : value}
    </Box>
  </Flex>
);

// ─── Route export ─────────────────────────────────────────────────────────────

export const ExportReportsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExportReportsPage {...props} />} />
);

export default ExportReportsPageRoute;
