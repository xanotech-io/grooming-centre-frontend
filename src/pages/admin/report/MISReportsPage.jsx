import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  SimpleGrid,
  HStack,
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  Select,
  Grid,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Divider,
  VStack,
  BreadcrumbItem,
  Icon,
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiClock,
  FiPlus,
} from "react-icons/fi";
import { Route, useHistory } from "react-router-dom";
import dayjs from "dayjs";
import {
  adminListMISReports,
  adminGetMISKPIs,
  adminGenerateMISReport,
  adminCreateMISSchedule,
  adminDeleteMISReport,
  adminGetCourseListing,
  adminGetDepartmentListing,
  adminGetUserListing,
  adminArchiveReport,
  adminListArchiveRecords,
  adminRetrieveArchivedReport,
} from "../../../services";
import { AdminMainAreaWrapper } from "../../../layouts";
import { Breadcrumb, Link } from "../../../components";
import { motion } from "framer-motion";

// ─── helpers ────────────────────────────────────────────────────────────────

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Box bg="white" p={6} borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm">
    <Text fontSize="15px" fontWeight="500" color="#101928" mb={2}>{title}</Text>
    <Text fontSize="28px" fontWeight="700" color="#101928" mb={1}>{value}</Text>
    {subtext && (
      <Text fontSize="14px" fontWeight="500" color={subtextColor || "#12B76A"}>{subtext}</Text>
    )}
  </Box>
);

const SearchableSelect = ({ value, options, onChange, placeholder }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";

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
      <ChakraInput
        borderRadius="md" fontSize="14px"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <Box
          position="absolute" top="100%" left={0} right={0} zIndex={200}
          bg="white" border="1px solid #E4E7EC" borderRadius="md" boxShadow="md"
          maxH="200px" overflowY="auto" mt="2px"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="#667085">No results</Box>
          ) : (
            filtered.map((o) => (
              <Box
                key={o.value}
                px={3} py="7px" fontSize="13px" cursor="pointer"
                bg={String(o.value) === String(value) ? "#F3E8FF" : "white"}
                _hover={{ bg: String(o.value) === String(value) ? "#F3E8FF" : "#F9FAFB" }}
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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "generated": return { bg: "#ECFDF3", color: "#027A48" };
    case "archived":  return { bg: "#FEF3F2", color: "#B42318" };
    case "draft":     return { bg: "#FFFAEB", color: "#B54708" };
    default:          return { bg: "#F2F4F7", color: "#344054" };
  }
};

const EXTENSION_BY_FORMAT = { json: "json", pdf: "pdf", excel: "xlsx", csv: "csv" };

// forces an actual file save in the requested format — a plain `window.open`/anchor
// click lets the browser view JSON/CSV/PDF inline instead of downloading it, and
// won't apply the extension for the format the user picked
const triggerReportDownload = async (url, filenameBase, format) => {
  const ext = EXTENSION_BY_FORMAT[format] ?? format ?? "json";
  const filename = `${filenameBase}.${ext}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("download failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const CATEGORY_OPTIONS = [
  { value: "academic", label: "Academic" },
  { value: "administrative", label: "Administrative" },
  { value: "compliance", label: "Compliance" },
];

// per GC LMS Enhancement Scoping Document — metric columns shown when a single category is filtered
const CATEGORY_METRIC_COLUMNS = {
  academic: [
    { key: "courseEnrollmentCount", label: "Course Enrollment Count" },
    { key: "courseCompletionRate", label: "Course Completion Rate" },
    { key: "averageGrade", label: "Average Grade" },
    { key: "academicStanding", label: "Academic Standing" },
    { key: "assessmentCompletionRate", label: "Assessment Completion Rate" },
    { key: "activeCourses", label: "Active Courses" },
    { key: "certificationEarned", label: "Certification Earned" },
  ],
  administrative: [
    { key: "totalRegisteredUsers", label: "Total Registered Users" },
    { key: "approvedUsers", label: "Approved Users" },
    { key: "instructorCount", label: "Instructor Count" },
    { key: "departmentEnrollmentRate", label: "Department Enrollment Rate" },
    { key: "courseAvailabilityStatus", label: "Course Availability Status" },
    { key: "userAccountStatus", label: "User Account Status" },
    { key: "systemUsageRate", label: "System Usage Rate" },
  ],
  compliance: [
    { key: "overallComplianceScore", label: "Overall Compliance Score" },
    { key: "departmentComplianceRate", label: "Department Compliance Rate" },
    { key: "performanceComparisons", label: "Performance Comparisons" },
    { key: "examinationSubmissionStatus", label: "Examination Submission Status" },
    { key: "complianceCourseStatus", label: "Compliance Course Status" },
    { key: "completionDate", label: "Completion Date" },
  ],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERATE_FORM_DEFAULT = {
  reportCategory: "academic",
  reportName: "",
  reportFormat: "json",
  frequency: "on_demand",
  accessLevel: [],
  metrics: [],
  filters: { studentId: "", departmentId: "", startDate: "", endDate: "" },
  schedule: { enabled: false, day: "", time: "10:00", delivery: "dashboard", emails: [] },
};

// per requirement: each category exposes only the filters relevant to it
const CATEGORY_FILTER_FIELDS = {
  academic: ["studentId", "startDate", "endDate"],
  administrative: ["departmentId", "startDate", "endDate"],
  compliance: ["departmentId", "studentId", "startDate", "endDate"],
};

// ─── component ──────────────────────────────────────────────────────────────

const MISReportsPage = () => {
  const toast = useToast();
  const history = useHistory();
  const { isOpen: isGenerateOpen, onOpen: onGenerateOpen, onClose: onGenerateClose } = useDisclosure();
  const [scheduleEmailInput, setScheduleEmailInput] = useState("");

  const openReportDetail = (report) => {
    history.push(`/admin/mis-reports/${report.id}`);
  };

  // ── list state ──────────────────────────────────────────────────────────
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 });
  const [reportsLoading, setReportsLoading] = useState(false);

  // ── filters ─────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    search: "", category: "", status: "", frequency: "", startDate: "", endDate: "",
    studentId: "", courseId: "", departmentId: "", instructorId: "", page: 1, limit: 20,
  });

  // ── kpis ────────────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState(null);

  // ── generate form ───────────────────────────────────────────────────────
  const [generateForm, setGenerateForm] = useState(GENERATE_FORM_DEFAULT);
  const [generating, setGenerating] = useState(false);

  // ── lookup data shared by the filter row and the Generate Report modal ───
  const [courseOptions, setCourseOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [allUserOptions, setAllUserOptions] = useState([]);

  useEffect(() => {
    adminGetCourseListing({ limit: 200 })
      .then(({ courses }) => setCourseOptions(courses ?? []))
      .catch(() => setCourseOptions([]));
    adminGetDepartmentListing({ limit: 200 })
      .then(({ departments }) => setDepartmentOptions(departments ?? []))
      .catch(() => setDepartmentOptions([]));
    adminGetUserListing({ limit: 200, role: "Student" })
      .then(({ users }) => setStudentOptions(users ?? []))
      .catch(() => setStudentOptions([]));
    adminGetUserListing({ limit: 200, role: "Instructor" })
      .then(({ users }) => setInstructorOptions(users ?? []))
      .catch(() => setInstructorOptions([]));
    adminGetUserListing({ limit: 500 })
      .then(({ users }) => setAllUserOptions(users ?? []))
      .catch(() => setAllUserOptions([]));
  }, []);

  // resolve "generatedBy" (a user id from the API) to a display name
  const userNameById = useMemo(() => {
    const map = {};
    allUserOptions.forEach((u) => { map[String(u.id)] = `${u.firstName} ${u.lastName}`.trim(); });
    return map;
  }, [allUserOptions]);
  const resolveGeneratedBy = (generatedBy) => generatedBy ? (userNameById[String(generatedBy)] ?? generatedBy) : "—";

  // default to "all variables selected" whenever the modal opens or the category changes
  useEffect(() => {
    if (!isGenerateOpen) return;
    const keys = (CATEGORY_METRIC_COLUMNS[generateForm.reportCategory] ?? []).map((m) => m.key);
    setGenerateForm((f) => ({ ...f, metrics: keys }));
  }, [isGenerateOpen, generateForm.reportCategory]);

  // ── fetch ────────────────────────────────────────────────────────────────

  const fetchReports = useCallback(async (f) => {
    setReportsLoading(true);
    try {
      const params = { page: f.page || 1, limit: f.limit || 20 };
      if (f.search)        params.search        = f.search;
      if (f.category)      params.category      = f.category;
      if (f.status)        params.status        = f.status;
      if (f.frequency)     params.frequency     = f.frequency;
      if (f.startDate)     params.startDate     = f.startDate;
      if (f.endDate)       params.endDate       = f.endDate;
      if (f.studentId)     params.studentId     = f.studentId;
      if (f.courseId)      params.courseId      = f.courseId;
      if (f.departmentId)  params.departmentId  = f.departmentId;
      if (f.instructorId)  params.instructorId  = f.instructorId;

      const result = await adminListMISReports(params);
      setReports(result.reports ?? []);
      const total = result.total ?? 0;
      const limit = result.limit ?? 20;
      setPagination({
        currentPage: result.page ?? 1,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit,
      });
    } catch {
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => { fetchReports(filters); }, []); // eslint-disable-line

  // KPIs (once)
  useEffect(() => {
    adminGetMISKPIs()
      .then(({ kpis }) => setKpis(kpis ?? null))
      .catch(() => {});
  }, []);

  // ── filter helpers ───────────────────────────────────────────────────────

  const applyFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchReports(newFilters);
  };

  const goToPage = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchReports(newFilters);
  };

  // ── actions ──────────────────────────────────────────────────────────────

  const handleArchive = async (item) => {
    try {
      const { message } = await adminArchiveReport(item.id, {
        reportSource: "mis-report",
        reportId: item.reportId,
        reportName: item.reportName,
        reportCategory: item.reportCategory,
        reportFormat: item.reportFormat,
        recordCount: item.recordCount,
        generatedDate: item.generatedDate,
      });
      toast({ description: message || "Report archived.", status: "success", position: "top" });
      fetchReports(filters);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to archive.", status: "error", position: "top" });
    }
  };

  // MIS reports only know their own reportId — look up the matching archive
  // record (created by handleArchive above) to get the archiveId to retrieve.
  const handleUnarchive = async (item) => {
    try {
      const { archives } = await adminListArchiveRecords({ status: "Archived", limit: 200 });
      const archive = archives.find((a) => a.report?.reportId === item.reportId);
      if (!archive) {
        toast({ description: "No archive record found for this report.", status: "warning", position: "top" });
        return;
      }
      const { message } = await adminRetrieveArchivedReport(archive.archiveId);
      toast({ description: message || "Report unarchived.", status: "success", position: "top" });
      fetchReports(filters);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to unarchive.", status: "error", position: "top" });
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const { message } = await adminDeleteMISReport(reportId);
      toast({ description: message || "Report deleted.", status: "success", position: "top" });
      fetchReports(filters);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to delete.", status: "error", position: "top" });
    }
  };

  const handleGenerateClose = () => {
    setGenerateForm(GENERATE_FORM_DEFAULT);
    setScheduleEmailInput("");
    onGenerateClose();
  };

  const addScheduleEmail = () => {
    const value = scheduleEmailInput.trim();
    if (!value) return;
    if (!EMAIL_RE.test(value)) {
      toast({ description: "Enter a valid email address.", status: "warning", position: "top" });
      return;
    }
    setGenerateForm((f) => ({
      ...f,
      schedule: { ...f.schedule, emails: f.schedule.emails.includes(value) ? f.schedule.emails : [...f.schedule.emails, value] },
    }));
    setScheduleEmailInput("");
  };

  const removeScheduleEmail = (email) =>
    setGenerateForm((f) => ({ ...f, schedule: { ...f.schedule, emails: f.schedule.emails.filter((e) => e !== email) } }));

  const handleGenerate = async () => {
    if (!generateForm.reportName.trim()) {
      toast({ description: "Report name is required.", status: "warning", position: "top" });
      return;
    }
    const { schedule } = generateForm;
    const scheduleNeedsEmail = schedule.enabled && (schedule.delivery === "email" || schedule.delivery === "both");
    if (scheduleNeedsEmail && schedule.emails.length === 0) {
      toast({ description: "Add at least one email to deliver the scheduled report to.", status: "warning", position: "top" });
      return;
    }
    setGenerating(true);
    try {
      if (schedule.enabled) {
        await adminCreateMISSchedule({
          reportCategory: generateForm.reportCategory,
          frequency: generateForm.frequency,
          day: schedule.day,
          time: schedule.time,
          deliveryMethod: schedule.delivery,
          ...(scheduleNeedsEmail ? { emails: schedule.emails } : {}),
        });
      }

      const { filters: f } = generateForm;
      const cleanFilters = {};
      if (f.studentId)    cleanFilters.studentId    = f.studentId;
      if (f.departmentId) cleanFilters.departmentId = f.departmentId;
      if (f.startDate)    cleanFilters.startDate    = f.startDate;
      if (f.endDate)      cleanFilters.endDate      = f.endDate;

      const { report, message } = await adminGenerateMISReport({
        reportCategory: generateForm.reportCategory,
        reportName: generateForm.reportName,
        reportFormat: generateForm.reportFormat,
        frequency: generateForm.frequency,
        accessLevel: generateForm.accessLevel,
        metrics: generateForm.metrics,
        filters: cleanFilters,
      });
      toast({
        description: message || (schedule.enabled ? "Report generated and schedule saved." : "Report generated successfully."),
        status: "success", position: "top",
      });

      if (report?.downloadUrl) {
        const baseName = (generateForm.reportName || report.reportId || "report").replace(/[^\w-]+/g, "_");
        triggerReportDownload(report.downloadUrl, baseName, generateForm.reportFormat);
      }

      handleGenerateClose();
      fetchReports(filters);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to generate report.", status: "error", position: "top" });
    } finally {
      setGenerating(false);
    }
  };

  // ── shared reports table ─────────────────────────────────────────────────

  const tableHeaders = ["Report ID", "Report Name", "Category", "Generated By", "Generated Date", "Format", "Frequency", "Status", "Remarks", "Action"];

  const renderReportsTable = () => (
    <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" boxShadow="xs">
      {/* filters row */}
      <Box p={4} borderBottom="1px solid #F2F4F7">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <HStack spacing={3} flexWrap="wrap">
            <InputGroup w="280px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="#667085" />
              </InputLeftElement>
              <ChakraInput
                placeholder="Search here..."
                fontSize="14px"
                borderRadius="md"
                value={filters.search}
                onChange={(e) => applyFilter("search", e.target.value)}
              />
            </InputGroup>
          </HStack>

          <HStack spacing={3} flexWrap="wrap">
            <Select
              w="160px" size="sm" borderRadius="md" placeholder="All Categories"
              value={filters.category}
              onChange={(e) => applyFilter("category", e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>

            <Box w="170px">
              <SearchableSelect
                placeholder="Course"
                value={filters.courseId}
                options={courseOptions.map((c) => ({ value: String(c.id), label: c.title }))}
                onChange={(val) => applyFilter("courseId", val)}
              />
            </Box>
            <Box w="170px">
              <SearchableSelect
                placeholder="Department"
                value={filters.departmentId}
                options={departmentOptions.map((d) => ({ value: String(d.id), label: d.name }))}
                onChange={(val) => applyFilter("departmentId", val)}
              />
            </Box>
            <Box w="170px">
              <SearchableSelect
                placeholder="Student"
                value={filters.studentId}
                options={studentOptions.map((s) => ({ value: String(s.id), label: `${s.firstName} ${s.lastName}` }))}
                onChange={(val) => applyFilter("studentId", val)}
              />
            </Box>
            <Box w="170px">
              <SearchableSelect
                placeholder="Instructor"
                value={filters.instructorId}
                options={instructorOptions.map((i) => ({ value: String(i.id), label: `${i.firstName} ${i.lastName}` }))}
                onChange={(val) => applyFilter("instructorId", val)}
              />
            </Box>

            <Select
              w="130px" size="sm" borderRadius="md" placeholder="Status"
              value={filters.status}
              onChange={(e) => applyFilter("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
              <option value="archived">Archived</option>
            </Select>

            <Select
              w="140px" size="sm" borderRadius="md" placeholder="Frequency"
              value={filters.frequency}
              onChange={(e) => applyFilter("frequency", e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="on_demand">On Demand</option>
            </Select>

            <ChakraInput
              type="date" size="sm" borderRadius="md" w="150px"
              value={filters.startDate}
              onChange={(e) => applyFilter("startDate", e.target.value)}
            />
            <ChakraInput
              type="date" size="sm" borderRadius="md" w="150px"
              value={filters.endDate}
              onChange={(e) => applyFilter("endDate", e.target.value)}
            />
          </HStack>
        </Flex>
      </Box>

      {/* table */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th w="40px" px={6} py={4}><Checkbox colorScheme="purple" /></Th>
              {tableHeaders.map((h) => (
                <Th key={h} textTransform="none" fontSize="12px" fontWeight="500" color="#475367" whiteSpace="nowrap">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {reportsLoading ? (
              <Tr><Td colSpan={tableHeaders.length + 1} textAlign="center" py={10} fontSize="13px" color="#667085">Loading reports...</Td></Tr>
            ) : reports.length === 0 ? (
              <Tr><Td colSpan={tableHeaders.length + 1} textAlign="center" py={10} fontSize="13px" color="#667085">No reports found.</Td></Tr>
            ) : (
              reports.map((item, idx) => (
                <Tr
                  key={item.id ?? idx}
                  _hover={{ bg: "#F9FAFB" }}
                  cursor="pointer"
                  onClick={() => openReportDetail(item)}
                >
                  <Td px={6} py={4} onClick={(e) => e.stopPropagation()}><Checkbox colorScheme="purple" /></Td>
                  <Td fontSize="12px" color="#667085" whiteSpace="nowrap">{item.reportId}</Td>
                  <Td fontSize="13px" color="#101928" fontWeight="600" maxW="220px">
                    <Text isTruncated title={item.reportName}>{item.reportName}</Text>
                  </Td>
                  <Td>
                    <Badge
                      bg="#F4F0FF" color="#6B21A8"
                      borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="500" textTransform="capitalize"
                    >
                      {item.reportCategory}
                    </Badge>
                  </Td>
                  <Td fontSize="12px" color="#667085" whiteSpace="nowrap">{resolveGeneratedBy(item.generatedBy)}</Td>
                  <Td fontSize="12px" color="#667085" whiteSpace="nowrap">
                    {item.generatedDate ? dayjs(item.generatedDate).format("DD MMM YYYY, hh:mm A") : "—"}
                  </Td>
                  <Td>
                    <Badge
                      bg="#EFF8FF" color="#175CD3"
                      borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="500" textTransform="uppercase"
                    >
                      {item.reportFormat}
                    </Badge>
                  </Td>
                  <Td fontSize="12px" color="#667085" textTransform="capitalize">{item.frequency?.replace(/_/g, " ")}</Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="500" textTransform="capitalize"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px" color="#667085" maxW="200px">
                    <Text isTruncated title={item.remarks}>{item.remarks || "—"}</Text>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Menu>
                      <MenuButton
                        as={IconButton} icon={<FiMoreVertical />}
                        variant="ghost" size="sm" color="#98A2B3"
                        border="1px solid #E4E7EC" borderRadius="md"
                      />
                      <MenuList>
                        <MenuItem fontSize="13px" onClick={() => openReportDetail(item)}>View details</MenuItem>
                        {item.status?.toLowerCase() === "archived" ? (
                          <MenuItem fontSize="13px" onClick={() => handleUnarchive(item)}>Unarchive report</MenuItem>
                        ) : (
                          <MenuItem fontSize="13px" onClick={() => handleArchive(item)}>Archive report</MenuItem>
                        )}
                        <MenuItem fontSize="13px" color="red.500" onClick={() => handleDelete(item.id)}>Delete report</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* pagination */}
      <Flex justify="space-between" align="center" p={4} borderTop="1px solid #F2F4F7" flexWrap="wrap" gap={3}>
        <HStack spacing={2}>
          <Text fontSize="13px" color="#344054">Rows per page</Text>
          <Select
            w="70px" size="sm" borderRadius="md"
            value={String(filters.limit)}
            onChange={(e) => applyFilter("limit", Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Select>
        </HStack>
        <HStack spacing={4}>
          <Text fontSize="13px" color="#344054">
            Showing <b>{reports.length}</b> of <b>{pagination.totalItems ?? 0}</b> items
          </Text>
          <HStack spacing={1}>
            <IconButton
              icon={<FiChevronLeft />} size="sm" variant="ghost" aria-label="Previous"
              isDisabled={pagination.currentPage <= 1}
              onClick={() => goToPage(pagination.currentPage - 1)}
            />
            <Text fontSize="13px" fontWeight="600">{pagination.currentPage}</Text>
            <IconButton
              icon={<FiChevronRight />} size="sm" variant="ghost" aria-label="Next"
              isDisabled={pagination.currentPage >= (pagination.totalPages ?? 1)}
              onClick={() => goToPage(pagination.currentPage + 1)}
            />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );

  // ── render ────────────────────────────────────────────────────────────────

  const selectedCategoryLabel = CATEGORY_OPTIONS.find((c) => c.value === filters.category)?.label;

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem isCurrentPage><Link href="#">MIS Reports</Link></BreadcrumbItem>}
        />
      </Flex>
      <Box
        mb={6} mt={6}
        as={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="24px" fontWeight="700" color="#101928">
            Management Information System Reports
          </Text>
          <HStack spacing={3}>
            <Button
              bg="#660066" color="white" _hover={{ bg: "#550055" }}
              h="40px" fontSize="14px" fontWeight="500" onClick={onGenerateOpen}
            >
              Generate Report
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
          <SummaryCard title="Total Reports" value={pagination.totalItems ?? "—"} subtext="all reports" />
          <SummaryCard title="Avg. Generation Time" value={kpis?.avgReportGenerationTimeMs ? `${(kpis.avgReportGenerationTimeMs / 60000).toFixed(2)} min` : "—"} subtext="avg. time to generate" />
          <SummaryCard title="Report Accuracy" value={kpis?.reportAccuracyRate ?? "—"} subtext="accuracy rate" />
          <SummaryCard title="Automation Rate" value={kpis?.automationRate ?? "—"} subtext="automation rate" />
        </SimpleGrid>

        <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>
          {selectedCategoryLabel ? `${selectedCategoryLabel} Reports` : "All Reports"}
        </Text>
        {renderReportsTable()}
      </Box>

      {/* Generate Report Modal */}
      <Modal isOpen={isGenerateOpen} onClose={handleGenerateClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalHeader fontSize="lg" fontWeight="700" color="#101928">Generate Report</ModalHeader>
          <ModalCloseButton mt={3} mr={2} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">Report Name</FormLabel>
                <ChakraInput
                  placeholder="e.g. Course Completion Summary – Oct 2026"
                  value={generateForm.reportName}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, reportName: e.target.value }))}
                  borderRadius="md" fontSize="14px"
                />
              </FormControl>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Category</FormLabel>
                  <Select
                    value={generateForm.reportCategory}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, reportCategory: e.target.value }))}
                    borderRadius="md" fontSize="14px"
                  >
                    <option value="academic">Academic</option>
                    <option value="administrative">Administrative</option>
                    <option value="compliance">Compliance</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Format</FormLabel>
                  <Select
                    value={generateForm.reportFormat}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, reportFormat: e.target.value }))}
                    borderRadius="md" fontSize="14px"
                  >
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </Select>
                </FormControl>
              </Grid>
              <FormControl isRequired>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">Frequency</FormLabel>
                <Select
                  value={generateForm.frequency}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, frequency: e.target.value }))}
                  borderRadius="md" fontSize="14px"
                >
                  <option value="on_demand">On Demand</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </Select>
              </FormControl>

              {!generateForm.schedule.enabled ? (
                <Button
                  variant="link" alignSelf="flex-start" color="#660066"
                  fontSize="13px" fontWeight="600"
                  onClick={() => setGenerateForm((f) => ({
                    ...f,
                    schedule: { ...f.schedule, enabled: true },
                    frequency: f.frequency === "on_demand" ? "daily" : f.frequency,
                  }))}
                >
                  + Schedule this report
                </Button>
              ) : (
                <Box border="1px solid #E4E7EC" borderRadius="md" p={4}>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontSize="13px" fontWeight="600" color="#667085">Schedule Settings</Text>
                    <Button
                      variant="link" color="#B42318" fontSize="12px" fontWeight="600"
                      onClick={() => setGenerateForm((f) => ({ ...f, schedule: GENERATE_FORM_DEFAULT.schedule }))}
                    >
                      Remove schedule
                    </Button>
                  </Flex>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Frequency Day</FormLabel>
                      <Select
                        placeholder="Every Monday" borderRadius="md" fontSize="14px"
                        value={generateForm.schedule.day}
                        onChange={(e) => setGenerateForm((f) => ({ ...f, schedule: { ...f.schedule, day: e.target.value } }))}
                      >
                        {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => (
                          <option key={d} value={d}>Every {d.charAt(0).toUpperCase() + d.slice(1)}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Time</FormLabel>
                      <HStack border="1px solid" borderColor="gray.200" borderRadius="md" px={3} py={2} justify="space-between">
                        <ChakraInput
                          type="time" border="none" p={0} fontSize="14px" color="#101928" _focus={{ boxShadow: "none" }}
                          value={generateForm.schedule.time}
                          onChange={(e) => setGenerateForm((f) => ({ ...f, schedule: { ...f.schedule, time: e.target.value } }))}
                        />
                        <Icon as={FiClock} color="gray.400" flexShrink={0} />
                      </HStack>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Delivery Method</FormLabel>
                      <Select
                        borderRadius="md" fontSize="14px"
                        value={generateForm.schedule.delivery}
                        onChange={(e) => setGenerateForm((f) => ({ ...f, schedule: { ...f.schedule, delivery: e.target.value } }))}
                      >
                        <option value="dashboard">Dashboard</option>
                        <option value="email">Email</option>
                        <option value="both">Both</option>
                      </Select>
                    </FormControl>
                    {(generateForm.schedule.delivery === "email" || generateForm.schedule.delivery === "both") && (
                      <FormControl isRequired>
                        <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Recipient Emails</FormLabel>
                        <HStack mb={2}>
                          <ChakraInput
                            type="email" placeholder="name@example.com" borderRadius="md" fontSize="14px"
                            value={scheduleEmailInput}
                            onChange={(e) => setScheduleEmailInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addScheduleEmail(); } }}
                          />
                          <IconButton
                            icon={<FiPlus />} aria-label="Add email"
                            bg="#660066" color="white" _hover={{ bg: "#550055" }}
                            onClick={addScheduleEmail}
                          />
                        </HStack>
                        <Wrap>
                          {generateForm.schedule.emails.map((email) => (
                            <Tag key={email} size="md" borderRadius="full" bg="#F4F0FF" color="#6B21A8">
                              <TagLabel>{email}</TagLabel>
                              <TagCloseButton onClick={() => removeScheduleEmail(email)} />
                            </Tag>
                          ))}
                        </Wrap>
                      </FormControl>
                    )}
                  </VStack>
                </Box>
              )}

              <FormControl>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">Access Level</FormLabel>
                <HStack spacing={6} flexWrap="wrap">
                  {["Admin", "Super Admin", "Instructor", "Student"].map((role) => (
                    <Checkbox
                      key={role}
                      colorScheme="purple"
                      isChecked={generateForm.accessLevel.includes(role)}
                      onChange={(e) =>
                        setGenerateForm((f) => ({
                          ...f,
                          accessLevel: e.target.checked
                            ? [...f.accessLevel, role]
                            : f.accessLevel.filter((r) => r !== role),
                        }))
                      }
                    >
                      <Text fontSize="14px" color="#344054">{role}</Text>
                    </Checkbox>
                  ))}
                </HStack>
              </FormControl>
              <Divider />
              <FormControl>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">
                  Variables to include in {CATEGORY_OPTIONS.find((c) => c.value === generateForm.reportCategory)?.label} export
                </FormLabel>
                <SimpleGrid columns={2} spacing={2}>
                  {(CATEGORY_METRIC_COLUMNS[generateForm.reportCategory] ?? []).map((m) => (
                    <Checkbox
                      key={m.key}
                      colorScheme="purple"
                      isChecked={generateForm.metrics.includes(m.key)}
                      onChange={(e) =>
                        setGenerateForm((f) => ({
                          ...f,
                          metrics: e.target.checked
                            ? [...f.metrics, m.key]
                            : f.metrics.filter((k) => k !== m.key),
                        }))
                      }
                    >
                      <Text fontSize="13px" color="#344054">{m.label}</Text>
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </FormControl>
              <Divider />
              <Text fontSize="13px" fontWeight="600" color="#667085">Filters (optional)</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                {CATEGORY_FILTER_FIELDS[generateForm.reportCategory]?.includes("departmentId") && (
                  <FormControl>
                    <FormLabel fontSize="14px" fontWeight="500" color="#344054">Department</FormLabel>
                    <SearchableSelect
                      placeholder="Search departments…"
                      value={generateForm.filters.departmentId}
                      options={departmentOptions.map((d) => ({ value: String(d.id), label: d.name }))}
                      onChange={(val) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, departmentId: val } }))}
                    />
                  </FormControl>
                )}
                {CATEGORY_FILTER_FIELDS[generateForm.reportCategory]?.includes("studentId") && (
                  <FormControl>
                    <FormLabel fontSize="14px" fontWeight="500" color="#344054">Student</FormLabel>
                    <SearchableSelect
                      placeholder="Search students…"
                      value={generateForm.filters.studentId}
                      options={studentOptions.map((s) => ({ value: String(s.id), label: `${s.firstName} ${s.lastName}` }))}
                      onChange={(val) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, studentId: val } }))}
                    />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Start Date</FormLabel>
                  <ChakraInput
                    type="date"
                    value={generateForm.filters.startDate}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, startDate: e.target.value } }))}
                    borderRadius="md" fontSize="14px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">End Date</FormLabel>
                  <ChakraInput
                    type="date"
                    value={generateForm.filters.endDate}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, endDate: e.target.value } }))}
                    borderRadius="md" fontSize="14px"
                  />
                </FormControl>
              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} pt={6} pb={4}>
            <Button
              variant="outline" flex={1} borderColor="#D0D5DD" color="#344054"
              fontSize="14px" fontWeight="600" onClick={handleGenerateClose}
              borderRadius="md" h="44px"
            >
              Cancel
            </Button>
            <Button
              bg="#660066" flex={1} color="white" _hover={{ bg: "#550055" }}
              fontSize="14px" fontWeight="600" borderRadius="md" h="44px"
              isLoading={generating} onClick={handleGenerate}
            >
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminMainAreaWrapper>
  );
};

export const MISReportsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MISReportsPage {...props} />} />
);

export default MISReportsPage;
