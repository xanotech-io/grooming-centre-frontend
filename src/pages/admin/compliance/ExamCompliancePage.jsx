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
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  useDisclosure,
  useToast,
  Switch,
  Grid,
  Collapse,
  BreadcrumbItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiSend,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiEye,
  FiUsers,
} from "react-icons/fi";
import dayjs from "dayjs";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, Link, DashboardMetricCard } from "../../../components";
import {
  getComplianceNotificationKpis,
  getComplianceNotifications,
  getComplianceNotificationById,
  sendComplianceNotification,
  resendComplianceNotification,
  escalateComplianceNotification,
  getComplianceTrainingReport,
  adminGetUserListing,
  adminGetCourseListing,
  adminGetStandaloneExaminationListing,
  adminGetDepartmentListing,
} from "../../../services";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_KPIS = {
  total_notifications: 120,
  compliant_count: 85,
  non_compliant_count: 35,
  overdue_count: 18,
  escalated_count: 6,
  delivery_success_count: 115,
  delivery_failed_count: 5,
  compliance_rate_percent: 70.8,
  on_time_completion_rate_percent: 82.4,
  delivery_success_rate_percent: 95.8,
  escalation_rate_percent: 17.1,
  avg_days_to_compliance: 4.3,
  complianceCompletionRate: 71,
  nonComplianceRatio: 29,
  by_notification_type: { Reminder: 45, Warning: 30, "Final Notice": 20, Confirmation: 18, Escalation: 7 },
  by_channel: { Email: 80, "In-App": 25, Both: 15 },
};

const MOCK_NOTIFICATIONS = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    recipientId: "rec-001",
    entityType: "Course",
    courseId: "c-001",
    examId: null,
    entityTitle: "Workplace Ethics",
    complianceStatus: "Non-Compliant",
    completionStatus: "Overdue",
    dueDate: "2026-04-30T00:00:00Z",
    completionDate: null,
    notificationType: "Final Notice",
    notificationChannel: "Email",
    sentBy: null,
    deliveryStatus: "Sent",
    reminderCount: 2,
    escalationFlag: false,
    remarks: null,
    templateUsed: "Standard Compliance",
    failureReason: null,
    sentAt: "2026-05-01T09:00:00Z",
    recipient: { id: "rec-001", firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
    course: { id: "c-001", title: "Workplace Ethics" },
    exam: null,
    createdAt: "2026-05-01T09:00:00Z",
  },
  {
    id: "4ab12c78-1234-4567-abcd-ef1234567890",
    recipientId: "rec-002",
    entityType: "Exam",
    courseId: null,
    examId: "e-001",
    entityTitle: "Data Privacy Certification",
    complianceStatus: "Compliant",
    completionStatus: "Completed",
    dueDate: "2026-03-15T00:00:00Z",
    completionDate: "2026-03-10T00:00:00Z",
    notificationType: "Confirmation",
    notificationChannel: "Both",
    sentBy: null,
    deliveryStatus: "Sent",
    reminderCount: 1,
    escalationFlag: false,
    remarks: "Completed ahead of schedule.",
    templateUsed: "Completion Confirmation",
    failureReason: null,
    sentAt: "2026-03-10T12:00:00Z",
    recipient: { id: "rec-002", firstName: "Alice", lastName: "Brown", email: "alice.brown@example.com" },
    course: null,
    exam: { id: "e-001", title: "Data Privacy Certification" },
    createdAt: "2026-03-10T12:00:00Z",
  },
  {
    id: "5bc23d89-2345-5678-bcde-ef2345678901",
    recipientId: "rec-003",
    entityType: "Course",
    courseId: "c-002",
    examId: null,
    entityTitle: "Health & Safety Training",
    complianceStatus: "Non-Compliant",
    completionStatus: "Overdue",
    dueDate: "2026-04-01T00:00:00Z",
    completionDate: null,
    notificationType: "Escalation",
    notificationChannel: "Email",
    sentBy: "admin-001",
    deliveryStatus: "Failed",
    reminderCount: 3,
    escalationFlag: true,
    remarks: "Escalated to department head.",
    templateUsed: "Escalation Notice",
    failureReason: "Mailbox full",
    sentAt: "2026-05-05T08:30:00Z",
    recipient: { id: "rec-003", firstName: "Bob", lastName: "Wilson", email: "bob.wilson@example.com" },
    course: { id: "c-002", title: "Health & Safety Training" },
    exam: null,
    createdAt: "2026-05-05T08:30:00Z",
  },
  {
    id: "6cd34e90-3456-6789-cdef-ef3456789012",
    recipientId: "rec-004",
    entityType: "Course",
    courseId: "c-001",
    examId: null,
    entityTitle: "Workplace Ethics",
    complianceStatus: "Non-Compliant",
    completionStatus: "Incomplete",
    dueDate: "2026-05-25T00:00:00Z",
    completionDate: null,
    notificationType: "Warning",
    notificationChannel: "In-App",
    sentBy: null,
    deliveryStatus: "Sent",
    reminderCount: 1,
    escalationFlag: false,
    remarks: null,
    templateUsed: "Warning Notice",
    failureReason: null,
    sentAt: "2026-05-18T10:00:00Z",
    recipient: { id: "rec-004", firstName: "Carol", lastName: "Davis", email: "carol.davis@example.com" },
    course: { id: "c-001", title: "Workplace Ethics" },
    exam: null,
    createdAt: "2026-05-18T10:00:00Z",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (v) => (v ? dayjs(v).format("MMM D, YYYY") : "—");
const fmtDateTime = (v) => (v ? dayjs(v).format("MMM D, YYYY h:mm A") : "—");
const isOverdue = (d) => d && dayjs().isAfter(dayjs(d));

const complianceBadgeColor = (s) => (s === "Compliant" ? "green" : "red");
const completionBadgeColor = (s) =>
  ({ Completed: "green", "In Progress": "blue", Incomplete: "orange", Overdue: "red", Failed: "red" }[s] || "gray");
const notifTypeBadgeColor = (t) =>
  ({ Reminder: "blue", Warning: "orange", "Final Notice": "red", Confirmation: "green", Escalation: "red" }[t] || "gray");
const deliveryBadgeColor = (s) => (s === "Sent" ? "green" : "red");
const overdueBadgeColor = (s) => ({ Compliant: "green", Warning: "orange", Overdue: "red" }[s] || "gray");

const NOTIFICATION_TEMPLATES = ["Standard Compliance", "Warning Notice", "Final Notice", "Escalation Notice", "Completion Confirmation"];

// An assignment flips to "Warning" this many days before its due date if not yet compliant.
const WARNING_WINDOW_DAYS = 7;
const computeOverdueStatus = ({ complianceDate, dueDate }) => {
  if (complianceDate) return "Compliant";
  if (!dueDate) return "Compliant";
  const due = dayjs(dueDate);
  const now = dayjs();
  if (now.isAfter(due)) return "Overdue";
  if (now.isAfter(due.subtract(WARNING_WINDOW_DAYS, "day"))) return "Warning";
  return "Compliant";
};

// Defensive field-mapping for /v1/compliance-training/report rows — key names aren't finalized upstream.
const normalizeReportRow = (r) => {
  const entityType = r.entityType ?? (r.examId ? "Exam" : "Course");
  const complianceDate = r.complianceDate ?? r.completionDate ?? null;
  const dueDate = r.dueDate ?? null;
  const base = {
    id: r.id ?? r.assignmentId ?? `${r.recipientId ?? r.studentId ?? r.userId ?? "row"}-${r.courseId ?? r.examId ?? ""}`,
    studentId: r.recipientId ?? r.studentId ?? r.userId ?? r.recipient?.id ?? r.student?.id,
    studentName:
      r.studentName ??
      r.recipientName ??
      ((r.recipient ? `${r.recipient.firstName ?? ""} ${r.recipient.lastName ?? ""}`.trim() : "") ||
        (r.student ? `${r.student.firstName ?? ""} ${r.student.lastName ?? ""}`.trim() : "") ||
        "—"),
    departmentId: r.departmentId ?? r.department?.id ?? null,
    departmentName: r.departmentName ?? r.department?.name ?? null,
    entityType,
    entityId: r.entityId ?? r.courseId ?? r.examId ?? null,
    entityTag: r.entityTag ?? r.tag ?? r.displayId ?? entityType,
    entityTitle: r.entityTitle ?? r.courseTitle ?? r.examTitle ?? r.title ?? r.course?.title ?? r.exam?.title ?? "—",
    completionStatus: r.completionStatus ?? "—",
    assignedAt: r.assignedAt ?? r.createdAt ?? r.dateAssigned ?? null,
    dueDate,
    complianceDate,
    complianceStatus: r.complianceStatus ?? "—",
    lastNotificationType: r.lastNotificationType ?? r.notificationType ?? null,
    lastNotificationDate: r.lastNotificationDate ?? r.sentAt ?? r.lastNotifiedAt ?? null,
    deliveryStatus: r.deliveryStatus ?? r.lastDeliveryStatus ?? null,
  };
  return { ...base, overdueStatus: r.overdueStatus ?? computeOverdueStatus(base) };
};

const PaginationBar = ({ page, totalPages, total, limit, onPageChange, onLimitChange }) => (
  <Flex align="center" justify="space-between" flexWrap="wrap" gap={3} mt={4}>
    <Flex align="center" gap={2}>
      <Text fontSize="sm" color="gray.600">Rows:</Text>
      <Select size="sm" width="80px" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
        {[10, 20, 50].map((l) => <option key={l} value={l}>{l}</option>)}
      </Select>
    </Flex>
    <Flex align="center" gap={2}>
      <Text fontSize="sm" color="gray.500">Page {page} of {totalPages} ({total} records)</Text>
      <Button size="xs" onClick={() => onPageChange(page - 1)} isDisabled={page <= 1} variant="outline">Prev</Button>
      <Button size="xs" onClick={() => onPageChange(page + 1)} isDisabled={page >= totalPages} variant="outline">Next</Button>
    </Flex>
  </Flex>
);

const DetailRow = ({ label, value }) => (
  <Flex justify="space-between" align="flex-start" py={1}>
    <Text fontSize="sm" fontWeight={600} color="gray.600" minW="160px">{label}</Text>
    <Text fontSize="sm" color="gray.800" textAlign="right" maxW="240px" wordBreak="break-word">{value ?? "—"}</Text>
  </Flex>
);

// ─── KPI Section ─────────────────────────────────────────────────────────────

const KpiSection = ({ kpis, loading }) => {
  const cards = [
    { label: "Total Notifications", value: kpis?.total_notifications ?? 0 },
    { label: "Compliant Users", value: kpis?.compliant_count ?? 0 },
    { label: "Non-Compliant", value: kpis?.non_compliant_count ?? 0 },
    { label: "Overdue", value: kpis?.overdue_count ?? 0, color: (kpis?.overdue_count ?? 0) > 0 ? "orange.500" : undefined },
    { label: "Escalated Cases", value: kpis?.escalated_count ?? 0, color: (kpis?.escalated_count ?? 0) > 0 ? "red.500" : undefined },
    { label: "Delivery Success", value: kpis?.delivery_success_count ?? 0 },
    { label: "Delivery Failed", value: kpis?.delivery_failed_count ?? 0, color: (kpis?.delivery_failed_count ?? 0) > 0 ? "orange.400" : undefined },
  ];

  return (
    <Box mb={6}>
      <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3} mb={4}>
        {cards.map((c) =>
          loading ? (
            <Skeleton key={c.label} height="80px" borderRadius="md" />
          ) : (
            <DashboardMetricCard key={c.label} title={c.label} value={c.value} color={c.color} />
          )
        )}
      </SimpleGrid>
    </Box>
  );
};

// ─── Notification Detail Drawer ───────────────────────────────────────────────

const NotifDetailDrawer = ({ notifId, isOpen, onClose, onActionDone }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [escalateRemarks, setEscalateRemarks] = useState("");
  const { isOpen: isEscOpen, onOpen: openEsc, onClose: closeEsc } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (!isOpen || !notifId) return;
    setLoading(true);
    getComplianceNotificationById(notifId)
      .then((res) => setDetail(res?.data ?? res))
      .catch((err) => {
        if (err?.response?.status === 404) { setDetail(null); return; }
        console.warn("[ExamCompliance] GET /compliance-notifications/{id} failed, using mock");
        setDetail(MOCK_NOTIFICATIONS.find((n) => n.id === notifId) ?? null);
      })
      .finally(() => setLoading(false));
  }, [notifId, isOpen]);

  const handleResend = async () => {
    setActing(true);
    try {
      await resendComplianceNotification(notifId);
      toast({ title: "Notification resent.", status: "success", duration: 3000 });
      onActionDone();
      onClose();
    } catch (err) {
      toast({ title: err?.response?.data?.message ?? "Failed to resend.", status: "error", duration: 4000 });
    } finally { setActing(false); }
  };

  const handleEscalate = async () => {
    setActing(true);
    try {
      await escalateComplianceNotification(notifId, { remarks: escalateRemarks });
      toast({ title: "Case escalated successfully.", status: "success", duration: 3000 });
      onActionDone();
      closeEsc();
      onClose();
    } catch (err) {
      toast({ title: err?.response?.data?.message ?? "Failed to escalate.", status: "error", duration: 4000 });
    } finally { setActing(false); }
  };

  const showResend = detail?.deliveryStatus === "Failed";
  const showEscalate = detail?.complianceStatus === "Non-Compliant" && !detail?.escalationFlag;

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Notification Detail</DrawerHeader>
          <DrawerBody>
            {loading ? (
              <Flex direction="column" gap={3} mt={4}>{[...Array(10)].map((_, i) => <Skeleton key={i} height="22px" />)}</Flex>
            ) : !detail ? (
              <Flex direction="column" align="center" justify="center" h="200px">
                <Text color="gray.400">Notification not found.</Text>
                <Button mt={4} size="sm" onClick={onClose}>Back</Button>
              </Flex>
            ) : (
              <Flex direction="column" gap={2} mt={2}>
                {detail.escalationFlag && (
                  <Alert status="error" borderRadius="md" mb={2}><AlertIcon />This case has been escalated.</Alert>
                )}
                <DetailRow label="Notification ID" value={detail.id} />
                <DetailRow label="Recipient" value={`${detail.recipient?.firstName} ${detail.recipient?.lastName}`} />
                <DetailRow label="Email" value={detail.recipient?.email} />
                <DetailRow label="Entity Type" value={detail.entityType} />
                <DetailRow label="Course / Exam" value={detail.entityTitle} />
                <Flex justify="space-between" align="center" py={1}>
                  <Text fontSize="sm" fontWeight={600} color="gray.600">Compliance Status</Text>
                  <Badge colorScheme={complianceBadgeColor(detail.complianceStatus)}>{detail.complianceStatus}</Badge>
                </Flex>
                <Flex justify="space-between" align="center" py={1}>
                  <Text fontSize="sm" fontWeight={600} color="gray.600">Completion Status</Text>
                  <Badge colorScheme={completionBadgeColor(detail.completionStatus)}>{detail.completionStatus}</Badge>
                </Flex>
                <Flex justify="space-between" align="center" py={1}>
                  <Text fontSize="sm" fontWeight={600} color="gray.600">Due Date</Text>
                  <Text fontSize="sm" color={isOverdue(detail.dueDate) ? "red.500" : "gray.800"} fontWeight={isOverdue(detail.dueDate) ? 700 : 400}>
                    {fmtDate(detail.dueDate)}
                  </Text>
                </Flex>
                <DetailRow label="Completion Date" value={fmtDate(detail.completionDate)} />
                <Flex justify="space-between" align="center" py={1}>
                  <Text fontSize="sm" fontWeight={600} color="gray.600">Notification Type</Text>
                  <Badge colorScheme={notifTypeBadgeColor(detail.notificationType)}>{detail.notificationType}</Badge>
                </Flex>
                <DetailRow label="Channel" value={detail.notificationChannel} />
                <DetailRow label="Sent By" value={detail.sentBy ?? "System"} />
                <Flex justify="space-between" align="center" py={1}>
                  <Text fontSize="sm" fontWeight={600} color="gray.600">Delivery Status</Text>
                  <Badge colorScheme={deliveryBadgeColor(detail.deliveryStatus)}>{detail.deliveryStatus}</Badge>
                </Flex>
                {detail.failureReason && (
                  <Box><Text fontSize="sm" fontWeight={600} color="gray.600">Failure Reason</Text><Text fontSize="sm" color="red.500">{detail.failureReason}</Text></Box>
                )}
                <DetailRow label="Sent At" value={fmtDateTime(detail.sentAt)} />
                <DetailRow label="Reminder Count" value={detail.reminderCount} />
                <DetailRow label="Template Used" value={detail.templateUsed} />
                {detail.remarks && <DetailRow label="Remarks" value={detail.remarks} />}
              </Flex>
            )}
          </DrawerBody>
          {(showResend || showEscalate) && (
            <DrawerFooter borderTopWidth="1px" gap={3}>
              {showResend && (
                <Button size="sm" colorScheme="orange" leftIcon={<FiRefreshCw />} onClick={handleResend} isLoading={acting}>Resend</Button>
              )}
              {showEscalate && (
                <Button size="sm" colorScheme="red" leftIcon={<FiArrowUp />} onClick={openEsc} isDisabled={acting}>Escalate</Button>
              )}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* Escalate Confirmation Modal */}
      <Modal isOpen={isEscOpen} onClose={closeEsc} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Escalate Case</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" mb={3}>Enter a reason for escalation (optional):</Text>
            <Textarea size="sm" placeholder="e.g. 14 days overdue — escalating to department head." value={escalateRemarks} onChange={(e) => setEscalateRemarks(e.target.value)} />
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeEsc}>Cancel</Button>
            <Button colorScheme="red" onClick={handleEscalate} isLoading={acting}>Confirm Escalation</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// ─── Log Table Tab ────────────────────────────────────────────────────────────

const EMPTY_FILTERS = { complianceStatus: "", completionStatus: "", notificationType: "", deliveryStatus: "", entityType: "", escalationFlag: "", startDate: "", endDate: "", page: 1, limit: 20 };

const LogTableTab = ({ onOpenDetail, refreshKey }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v !== "" && v != null) params[k] = v; });
    try {
      const res = await getComplianceNotifications(params);
      const d = res?.data ?? res;
      const list = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
      setRows(list);
      setTotal(d?.total ?? list.length);
      setTotalPages(d?.totalPages ?? 1);
    } catch {
      console.warn("[ExamCompliance] GET /compliance-notifications failed, using mock");
      setRows(MOCK_NOTIFICATIONS);
      setTotal(MOCK_NOTIFICATIONS.length);
      setTotalPages(1);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const handleResendRow = async (id, e) => {
    e.stopPropagation();
    try {
      await resendComplianceNotification(id);
      toast({ title: "Notification resent.", status: "success", duration: 3000 });
      fetchData();
    } catch { toast({ title: "Resend failed.", status: "error", duration: 3000 }); }
  };

  const activeFilterCount = [filters.complianceStatus, filters.completionStatus, filters.notificationType, filters.deliveryStatus, filters.entityType, filters.escalationFlag, filters.startDate, filters.endDate].filter(Boolean).length;

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={3}>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FiFilter />}
          rightIcon={filtersOpen ? <FiChevronUp /> : <FiChevronDown />}
          onClick={() => setFiltersOpen((o) => !o)}
          colorScheme={activeFilterCount > 0 ? "blue" : "gray"}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
        <Button size="sm" colorScheme="blue" leftIcon={<FiRefreshCw />} onClick={fetchData}>Refresh</Button>
      </Flex>

      <Collapse in={filtersOpen} animateOpacity>
        <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3}>
            <Select placeholder="All Compliance" size="sm" value={filters.complianceStatus} onChange={(e) => setFilter("complianceStatus", e.target.value)}>
              <option value="Compliant">Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </Select>
            <Select placeholder="All Completion" size="sm" value={filters.completionStatus} onChange={(e) => setFilter("completionStatus", e.target.value)}>
              {["Completed", "Incomplete", "Overdue", "Failed", "In Progress"].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select placeholder="All Types" size="sm" value={filters.notificationType} onChange={(e) => setFilter("notificationType", e.target.value)}>
              {["Reminder", "Warning", "Final Notice", "Confirmation", "Escalation"].map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select placeholder="All Delivery" size="sm" value={filters.deliveryStatus} onChange={(e) => setFilter("deliveryStatus", e.target.value)}>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
            </Select>
            <Select placeholder="All Entities" size="sm" value={filters.entityType} onChange={(e) => setFilter("entityType", e.target.value)}>
              <option value="Course">Course</option>
              <option value="Exam">Exam</option>
            </Select>
            <Flex align="center" gap={2} px={2}>
              <Switch size="sm" isChecked={filters.escalationFlag === "true"} onChange={(e) => setFilter("escalationFlag", e.target.checked ? "true" : "")} />
              <Text fontSize="sm">Escalated Only</Text>
            </Flex>
            <Input type="date" size="sm" value={filters.startDate} onChange={(e) => setFilter("startDate", e.target.value)} />
            <Input type="date" size="sm" value={filters.endDate} onChange={(e) => setFilter("endDate", e.target.value)} />
          </Grid>
          <Flex justify="flex-end" mt={3}>
            <Button size="sm" variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>Clear Filters</Button>
          </Flex>
        </Box>
      </Collapse>

      {loading ? (
        <Flex direction="column" gap={2}>{[...Array(5)].map((_, i) => <Skeleton key={i} height="38px" />)}</Flex>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Recipient</Th>
                <Th>Course / Exam</Th>
                <Th>Entity</Th>
                <Th>Compliance</Th>
                <Th>Completion</Th>
                <Th>Type</Th>
                <Th>Channel</Th>
                <Th>Delivery</Th>
                <Th>Sent At</Th>
                <Th>Due Date</Th>
                <Th>Count</Th>
                <Th>Esc.</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.length === 0 ? (
                <Tr><Td colSpan={13} textAlign="center" color="gray.400" py={8}>No notifications found.</Td></Tr>
              ) : rows.map((r) => (
                <Tr key={r.id} cursor="pointer" _hover={{ bg: "blue.50" }} onClick={() => onOpenDetail(r.id)}>
                  <Td fontSize="xs">{r.recipient?.firstName} {r.recipient?.lastName}</Td>
                  <Td fontSize="xs" maxW="120px" isTruncated>{r.entityTitle}</Td>
                  <Td><Badge colorScheme={r.entityType === "Course" ? "blue" : "purple"} fontSize="xs">{r.entityType}</Badge></Td>
                  <Td><Badge colorScheme={complianceBadgeColor(r.complianceStatus)} fontSize="xs">{r.complianceStatus}</Badge></Td>
                  <Td><Badge colorScheme={completionBadgeColor(r.completionStatus)} fontSize="xs">{r.completionStatus}</Badge></Td>
                  <Td><Badge colorScheme={notifTypeBadgeColor(r.notificationType)} fontSize="xs">{r.notificationType}</Badge></Td>
                  <Td fontSize="xs">{r.notificationChannel}</Td>
                  <Td><Badge colorScheme={deliveryBadgeColor(r.deliveryStatus)} fontSize="xs">{r.deliveryStatus}</Badge></Td>
                  <Td fontSize="xs" whiteSpace="nowrap">{fmtDateTime(r.sentAt)}</Td>
                  <Td fontSize="xs" color={isOverdue(r.dueDate) ? "red.500" : undefined} fontWeight={isOverdue(r.dueDate) ? 700 : 400} whiteSpace="nowrap">{fmtDate(r.dueDate)}</Td>
                  <Td fontSize="xs">{r.reminderCount}</Td>
                  <Td>{r.escalationFlag ? <Tooltip label="Escalated"><Box color="red.500" display="inline-flex"><FiAlertTriangle /></Box></Tooltip> : "—"}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Flex gap={1}>
                      {r.deliveryStatus === "Failed" && (
                        <Button size="xs" colorScheme="orange" onClick={(e) => handleResendRow(r.id, e)}>Resend</Button>
                      )}
                      {r.complianceStatus === "Non-Compliant" && !r.escalationFlag && (
                        <Button size="xs" colorScheme="red" onClick={(e) => { e.stopPropagation(); onOpenDetail(r.id); }}>Escalate</Button>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <PaginationBar page={filters.page} totalPages={totalPages} total={total} limit={filters.limit} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))} />
    </Box>
  );
};

// ─── Searchable Select ────────────────────────────────────────────────────────

const SearchableSelect = ({ placeholder, fetchOptions, onSelect, selectedLabel, isInvalid }) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = React.useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced fetch — triggers on query change and also on initial open (empty query = fetch all)
  const doFetch = useCallback(async (q) => {
    setLoading(true);
    try { setOptions(await fetchOptions(q)); }
    catch { setOptions([]); }
    finally { setLoading(false); }
  }, [fetchOptions]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => doFetch(query), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, open, doFetch]);

  const handleSelect = (opt) => {
    onSelect(opt.id, opt.label);
    setQuery("");
    setOptions([]);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect("", "");
    setQuery("");
    setOptions([]);
  };

  return (
    <Box ref={containerRef} position="relative">
      {selectedLabel ? (
        <Flex
          align="center"
          justify="space-between"
          border="1px solid"
          borderColor={isInvalid ? "red.500" : "gray.200"}
          borderRadius="md"
          px={3}
          py="6px"
          bg="white"
          fontSize="sm"
        >
          <Text fontSize="sm" color="gray.800" isTruncated>{selectedLabel}</Text>
          <Text
            fontSize="xs"
            color="gray.400"
            cursor="pointer"
            ml={2}
            _hover={{ color: "gray.700" }}
            onClick={handleClear}
            flexShrink={0}
          >✕</Text>
        </Flex>
      ) : (
        <Input
          size="sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          borderColor={isInvalid ? "red.500" : undefined}
          autoComplete="off"
        />
      )}
      {open && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={999}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="md"
          maxH="200px"
          overflowY="auto"
          mt="2px"
        >
          {loading ? (
            <Box px={3} py={2}><Text fontSize="sm" color="gray.400">Searching…</Text></Box>
          ) : options.length === 0 ? (
            <Box px={3} py={2}><Text fontSize="sm" color="gray.400">No results found.</Text></Box>
          ) : options.map((opt) => (
            <Box
              key={opt.id}
              px={3}
              py={2}
              cursor="pointer"
              _hover={{ bg: "blue.50" }}
              onMouseDown={() => handleSelect(opt)}
            >
              <Text fontSize="sm">{opt.label}</Text>
              {opt.sub && <Text fontSize="xs" color="gray.400">{opt.sub}</Text>}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ─── Send / Evaluate Modal ────────────────────────────────────────────────────

const fetchStudentOptions = async (query) => {
  const res = await adminGetUserListing({ search: query, limit: 10 });
  return (res.users ?? []).map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}`, sub: u.email }));
};

const fetchCourseOptions = async (query) => {
  const res = await adminGetCourseListing({ search: query, limit: 10 });
  return (res.courses ?? []).map((c) => ({ id: c.id, label: c.title }));
};

const fetchExamOptions = async (query) => {
  const res = await adminGetStandaloneExaminationListing({ search: query, limit: 10 });
  return (res.examinations ?? []).map((e) => ({ id: e.id, label: e.title }));
};

const EMPTY_SINGLE = { recipientId: "", recipientLabel: "", entityType: "Course", courseId: "", courseLabel: "", examId: "", examLabel: "", notificationType: "", notificationChannel: "", remarks: "" };

const SendEvaluateModal = ({ isOpen, onClose, onDone }) => {
  const toast = useToast();
  const [single, setSingle] = useState(EMPTY_SINGLE);
  const [singleErrors, setSingleErrors] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSingle(EMPTY_SINGLE);
      setSingleErrors({});
    }
  }, [isOpen]);

  const validateSingle = () => {
    const errs = {};
    if (!single.recipientId) errs.recipientId = "Please select a student.";
    if (!single.entityType) errs.entityType = "Required";
    if (single.entityType === "Course" && !single.courseId) errs.courseId = "Please select a course.";
    if (single.entityType === "Exam" && !single.examId) errs.examId = "Please select an exam.";
    if (!single.notificationType) errs.notificationType = "Required";
    setSingleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendSingle = async () => {
    if (!validateSingle()) return;
    setSending(true);
    const payload = {
      recipientId: single.recipientId,
      entityType: single.entityType,
      courseId: single.entityType === "Course" ? single.courseId : undefined,
      examId: single.entityType === "Exam" ? single.examId : undefined,
      notificationType: single.notificationType,
      notificationChannel: single.notificationChannel || undefined,
      remarks: single.remarks || undefined,
    };
    try {
      await sendComplianceNotification(payload);
      toast({ title: "Notification sent.", status: "success", duration: 3000 });
      onDone();
      onClose();
    } catch (err) {
      const msg = err?.response?.status === 404 ? "Recipient or course/exam not found." : err?.response?.data?.message ?? "Something went wrong.";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally { setSending(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send / Evaluate Notification</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <Flex direction="column" gap={4}>

          <FormControl isInvalid={!!singleErrors.recipientId}>
            <FormLabel fontSize="sm">Student</FormLabel>
            <SearchableSelect
              placeholder="Search student by name…"
              fetchOptions={fetchStudentOptions}
              selectedLabel={single.recipientLabel}
              onSelect={(id, label) => setSingle((s) => ({ ...s, recipientId: id, recipientLabel: label }))}
              isInvalid={!!singleErrors.recipientId}
            />
            {singleErrors.recipientId && <Text fontSize="xs" color="red.500" mt={1}>{singleErrors.recipientId}</Text>}
          </FormControl>

          <FormControl isInvalid={!!singleErrors.entityType}>
            <FormLabel fontSize="sm">Entity Type</FormLabel>
            <Select size="sm" value={single.entityType} onChange={(e) => setSingle((s) => ({ ...s, entityType: e.target.value, courseId: "", courseLabel: "", examId: "", examLabel: "" }))}>
              <option value="Course">Course</option>
              <option value="Exam">Exam</option>
            </Select>
          </FormControl>

          {single.entityType === "Course" ? (
            <FormControl isInvalid={!!singleErrors.courseId}>
              <FormLabel fontSize="sm">Course</FormLabel>
              <SearchableSelect
                placeholder="Search course by name…"
                fetchOptions={fetchCourseOptions}
                selectedLabel={single.courseLabel}
                onSelect={(id, label) => setSingle((s) => ({ ...s, courseId: id, courseLabel: label }))}
                isInvalid={!!singleErrors.courseId}
              />
              {singleErrors.courseId && <Text fontSize="xs" color="red.500" mt={1}>{singleErrors.courseId}</Text>}
            </FormControl>
          ) : (
            <FormControl isInvalid={!!singleErrors.examId}>
              <FormLabel fontSize="sm">Exam</FormLabel>
              <SearchableSelect
                placeholder="Search exam by name…"
                fetchOptions={fetchExamOptions}
                selectedLabel={single.examLabel}
                onSelect={(id, label) => setSingle((s) => ({ ...s, examId: id, examLabel: label }))}
                isInvalid={!!singleErrors.examId}
              />
              {singleErrors.examId && <Text fontSize="xs" color="red.500" mt={1}>{singleErrors.examId}</Text>}
            </FormControl>
          )}

          <FormControl isInvalid={!!singleErrors.notificationType}>
            <FormLabel fontSize="sm">Notification Type</FormLabel>
            <Select size="sm" placeholder="Select type" value={single.notificationType} onChange={(e) => setSingle((s) => ({ ...s, notificationType: e.target.value }))}>
              {["Reminder", "Warning", "Final Notice", "Confirmation", "Escalation"].map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <FormErrorMessage>{singleErrors.notificationType}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Channel</FormLabel>
            <Select size="sm" placeholder="Default (system)" value={single.notificationChannel} onChange={(e) => setSingle((s) => ({ ...s, notificationChannel: e.target.value }))}>
              <option value="Email">Email</option>
              <option value="In-App">In-App</option>
              <option value="Both">Both</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Remarks (optional)</FormLabel>
            <Textarea size="sm" placeholder="Admin notes…" value={single.remarks} onChange={(e) => setSingle((s) => ({ ...s, remarks: e.target.value }))} />
          </FormControl>
        </Flex>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" leftIcon={<FiSend />} size="sm" onClick={handleSendSingle} isLoading={sending} loadingText="Sending…">Send Notification</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ─── Send Notification Modal (single row or bulk-by-filter) ──────────────────

const SendNotificationModal = ({ isOpen, onClose, targets, title, onSent }) => {
  const toast = useToast();
  const [notificationType, setNotificationType] = useState("");
  const [channel, setChannel] = useState("");
  const [template, setTemplate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotificationType("");
      setChannel("");
      setTemplate("");
      setRemarks("");
      setErrors({});
    }
  }, [isOpen]);

  const needsTemplate = channel === "Email" || channel === "Both";
  const count = targets?.length ?? 0;

  const validate = () => {
    const errs = {};
    if (!notificationType) errs.notificationType = "Required";
    if (!channel) errs.channel = "Required";
    if (needsTemplate && !template) errs.template = "Please select an email template.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    if (count === 0) {
      toast({ title: "No recipients to notify.", status: "warning", duration: 3000 });
      return;
    }
    setSending(true);
    const results = await Promise.allSettled(
      targets.map((t) =>
        sendComplianceNotification({
          recipientId: t.recipientId,
          entityType: t.entityType,
          courseId: t.entityType === "Course" ? t.entityId : undefined,
          examId: t.entityType === "Exam" ? t.entityId : undefined,
          notificationType,
          notificationChannel: channel,
          templateUsed: needsTemplate ? template : undefined,
          remarks: remarks || undefined,
        })
      )
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - succeeded;
    setSending(false);
    toast({
      title:
        failed === 0
          ? `Notification sent to ${succeeded} student${succeeded === 1 ? "" : "s"}.`
          : `${succeeded} sent, ${failed} failed to send.`,
      status: failed === 0 ? "success" : "warning",
      duration: 4000,
    });
    onSent?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap={4}>
            {count > 1 && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                This will notify {count} student{count === 1 ? "" : "s"} matching your current filters.
              </Alert>
            )}
            {count === 1 && (
              <Box fontSize="sm" color="gray.600">
                <Text><b>Student:</b> {targets[0].recipientLabel}</Text>
                <Text><b>Course / Exam:</b> {targets[0].entityTitle}</Text>
              </Box>
            )}

            <FormControl isInvalid={!!errors.notificationType}>
              <FormLabel fontSize="sm">Notification Type</FormLabel>
              <Select size="sm" placeholder="Select type" value={notificationType} onChange={(e) => setNotificationType(e.target.value)}>
                {["Reminder", "Warning", "Final Notice", "Confirmation", "Escalation"].map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <FormErrorMessage>{errors.notificationType}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.channel}>
              <FormLabel fontSize="sm">Channel</FormLabel>
              <Select size="sm" placeholder="Select channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="Email">Email</option>
                <option value="In-App">Push / In-App</option>
                <option value="Both">Both</option>
              </Select>
              <FormErrorMessage>{errors.channel}</FormErrorMessage>
            </FormControl>

            {needsTemplate && (
              <FormControl isInvalid={!!errors.template}>
                <FormLabel fontSize="sm">Email Template</FormLabel>
                <Select size="sm" placeholder="Select template" value={template} onChange={(e) => setTemplate(e.target.value)}>
                  {NOTIFICATION_TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
                <FormErrorMessage>{errors.template}</FormErrorMessage>
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Remarks (optional)</FormLabel>
              <Textarea size="sm" placeholder="Admin notes…" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </FormControl>
          </Flex>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" leftIcon={<FiSend />} onClick={handleSend} isLoading={sending} loadingText="Sending…">
            Send{count > 1 ? ` to ${count}` : ""}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ─── Per-Student, Per-Course/Exam Notification Log Modal ─────────────────────

const StudentEntityLogModal = ({ isOpen, onClose, studentId, studentName, entityType, entityId, entityTitle }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen || !studentId) return;
    setLoading(true);
    setError(false);
    const params = { recipientId: studentId };
    if (entityType === "Exam") params.examId = entityId;
    else params.courseId = entityId;
    getComplianceNotifications(params)
      .then((res) => {
        const d = res?.data ?? res;
        const list = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.rows) ? d.rows : [];
        setLogs(list);
      })
      .catch(() => {
        setError(true);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, studentId, entityType, entityId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Notification Log
          <Text fontSize="sm" fontWeight={400} color="gray.500" mt={1}>
            {studentName} — {entityTitle}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <Flex direction="column" gap={2}>{[...Array(4)].map((_, i) => <Skeleton key={i} height="32px" />)}</Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md"><AlertIcon />Failed to load notification log.</Alert>
          ) : logs.length === 0 ? (
            <Text color="gray.400" textAlign="center" py={6}>No notifications have been sent yet.</Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Channel</Th>
                    <Th>Delivery</Th>
                    <Th>Sent At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {logs.map((l) => (
                    <Tr key={l.id}>
                      <Td><Badge colorScheme={notifTypeBadgeColor(l.notificationType)} fontSize="xs">{l.notificationType}</Badge></Td>
                      <Td fontSize="xs">{l.notificationChannel}</Td>
                      <Td><Badge colorScheme={deliveryBadgeColor(l.deliveryStatus)} fontSize="xs">{l.deliveryStatus}</Badge></Td>
                      <Td fontSize="xs" whiteSpace="nowrap">{fmtDateTime(l.sentAt)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// ─── Compliance Report Tab ─────────────────────────────────────────────────────

const EMPTY_REPORT_FILTERS = { departmentId: "", entityType: "", courseId: "", examId: "", complianceStatus: "", overdueStatus: "", notificationType: "", deliveryStatus: "", page: 1, limit: 20 };

const buildReportParams = (filters) => {
  const params = {};
  Object.entries(filters).forEach(([k, v]) => { if (v !== "" && v != null) params[k] = v; });
  return params;
};

const extractReportList = (res) => {
  const d = res?.data ?? res;
  return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.rows) ? d.rows : [];
};

const ComplianceReportTab = () => {
  const toast = useToast();
  const [filters, setFilters] = useState(EMPTY_REPORT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [courseLabel, setCourseLabel] = useState("");
  const [examLabel, setExamLabel] = useState("");

  const [sendModalTargets, setSendModalTargets] = useState(null);
  const [sendModalTitle, setSendModalTitle] = useState("");
  const { isOpen: isSendOpen, onOpen: openSend, onClose: closeSend } = useDisclosure();
  const [bulkLoading, setBulkLoading] = useState(false);

  const [logTarget, setLogTarget] = useState(null);
  const { isOpen: isLogOpen, onOpen: openLog, onClose: closeLog } = useDisclosure();

  useEffect(() => {
    adminGetDepartmentListing()
      .then((res) => setDepartments(res?.departments ?? []))
      .catch(() => setDepartments([]));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await getComplianceTrainingReport(buildReportParams(filters));
      const d = res?.data ?? res;
      const list = extractReportList(res);
      setRows(list.map(normalizeReportRow));
      setTotal(d?.total ?? list.length);
      setTotalPages(d?.totalPages ?? 1);
    } catch (err) {
      console.error("[ExamCompliance] GET /compliance-training/report failed", err);
      setRows([]);
      setTotal(0);
      setTotalPages(1);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

  const activeFilterCount = [
    filters.departmentId,
    filters.entityType,
    filters.courseId,
    filters.examId,
    filters.complianceStatus,
    filters.overdueStatus,
    filters.notificationType,
    filters.deliveryStatus,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setFilters(EMPTY_REPORT_FILTERS);
    setCourseLabel("");
    setExamLabel("");
  };

  const handleOpenSingleSend = (row) => {
    setSendModalTargets([{ recipientId: row.studentId, recipientLabel: row.studentName, entityType: row.entityType, entityId: row.entityId, entityTitle: row.entityTitle }]);
    setSendModalTitle("Send Notification");
    openSend();
  };

  const handleOpenBulkSend = async () => {
    if (total === 0) {
      toast({ title: "No students match the current filters.", status: "warning", duration: 3000 });
      return;
    }
    setBulkLoading(true);
    try {
      const res = await getComplianceTrainingReport(buildReportParams({ ...filters, page: undefined, limit: 1000 }));
      const normalized = extractReportList(res).map(normalizeReportRow);
      if (normalized.length === 0) {
        toast({ title: "No students match the current filters.", status: "warning", duration: 3000 });
        return;
      }
      setSendModalTargets(normalized.map((r) => ({ recipientId: r.studentId, recipientLabel: r.studentName, entityType: r.entityType, entityId: r.entityId, entityTitle: r.entityTitle })));
      setSendModalTitle("Send Bulk Notification");
      openSend();
    } catch (err) {
      toast({ title: err?.response?.data?.message ?? "Failed to load matching students.", status: "error", duration: 4000 });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleOpenLog = (row) => {
    setLogTarget(row);
    openLog();
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FiFilter />}
          rightIcon={filtersOpen ? <FiChevronUp /> : <FiChevronDown />}
          onClick={() => setFiltersOpen((o) => !o)}
          colorScheme={activeFilterCount > 0 ? "blue" : "gray"}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
        <Flex gap={2}>
          <Button size="sm" colorScheme="blue" leftIcon={<FiRefreshCw />} onClick={fetchData}>Refresh</Button>
          <Button size="sm" colorScheme="purple" leftIcon={<FiUsers />} onClick={handleOpenBulkSend} isLoading={bulkLoading} loadingText="Loading…">
            Send Bulk Notification
          </Button>
        </Flex>
      </Flex>

      <Collapse in={filtersOpen} animateOpacity>
        <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3}>
            <Select placeholder="All Departments" size="sm" value={filters.departmentId} onChange={(e) => setFilter("departmentId", e.target.value)}>
              {departmentOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </Select>
            <Select
              placeholder="All Entities"
              size="sm"
              value={filters.entityType}
              onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value, courseId: "", examId: "", page: 1 }))}
            >
              <option value="Course">Course</option>
              <option value="Exam">Exam</option>
            </Select>
            {filters.entityType === "Exam" ? (
              <SearchableSelect
                placeholder="Search exam…"
                fetchOptions={fetchExamOptions}
                selectedLabel={examLabel}
                onSelect={(id, label) => { setExamLabel(label); setFilter("examId", id); }}
              />
            ) : (
              <SearchableSelect
                placeholder="Search course…"
                fetchOptions={fetchCourseOptions}
                selectedLabel={courseLabel}
                onSelect={(id, label) => { setCourseLabel(label); setFilter("courseId", id); }}
              />
            )}
            <Select placeholder="All Compliance" size="sm" value={filters.complianceStatus} onChange={(e) => setFilter("complianceStatus", e.target.value)}>
              <option value="Compliant">Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </Select>
            <Select placeholder="All Overdue Status" size="sm" value={filters.overdueStatus} onChange={(e) => setFilter("overdueStatus", e.target.value)}>
              <option value="Compliant">Compliant</option>
              <option value="Warning">Warning</option>
              <option value="Overdue">Overdue</option>
            </Select>
            <Select placeholder="All Notification Types" size="sm" value={filters.notificationType} onChange={(e) => setFilter("notificationType", e.target.value)}>
              {["Reminder", "Warning", "Final Notice", "Confirmation", "Escalation"].map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select placeholder="All Delivery Status" size="sm" value={filters.deliveryStatus} onChange={(e) => setFilter("deliveryStatus", e.target.value)}>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
            </Select>
          </Grid>
          <Flex justify="flex-end" mt={3}>
            <Button size="sm" variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
          </Flex>
        </Box>
      </Collapse>

      {loadError && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          Failed to load the compliance report from the server.
        </Alert>
      )}

      {loading ? (
        <Flex direction="column" gap={2}>{[...Array(5)].map((_, i) => <Skeleton key={i} height="38px" />)}</Flex>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Tag</Th>
                <Th>Course / Exam</Th>
                <Th>Completion</Th>
                <Th>Assigned</Th>
                <Th>Due Date</Th>
                <Th>Compliance Date</Th>
                <Th>Compliance</Th>
                <Th>Overdue</Th>
                <Th>Last Notif. Type</Th>
                <Th>Last Notif. Date</Th>
                <Th>Delivery</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.length === 0 ? (
                <Tr><Td colSpan={13} textAlign="center" color="gray.400" py={8}>No records found.</Td></Tr>
              ) : rows.map((r) => (
                <Tr key={r.id}>
                  <Td fontSize="xs">{r.studentName}</Td>
                  <Td><Badge colorScheme={r.entityType === "Course" ? "blue" : "purple"} fontSize="xs">{r.entityTag}</Badge></Td>
                  <Td fontSize="xs" maxW="140px" isTruncated>{r.entityTitle}</Td>
                  <Td><Badge colorScheme={completionBadgeColor(r.completionStatus)} fontSize="xs">{r.completionStatus}</Badge></Td>
                  <Td fontSize="xs" whiteSpace="nowrap">{fmtDate(r.assignedAt)}</Td>
                  <Td fontSize="xs" whiteSpace="nowrap">{fmtDate(r.dueDate)}</Td>
                  <Td fontSize="xs" whiteSpace="nowrap">{fmtDate(r.complianceDate)}</Td>
                  <Td><Badge colorScheme={complianceBadgeColor(r.complianceStatus)} fontSize="xs">{r.complianceStatus}</Badge></Td>
                  <Td><Badge colorScheme={overdueBadgeColor(r.overdueStatus)} fontSize="xs">{r.overdueStatus}</Badge></Td>
                  <Td>{r.lastNotificationType ? <Badge colorScheme={notifTypeBadgeColor(r.lastNotificationType)} fontSize="xs">{r.lastNotificationType}</Badge> : "—"}</Td>
                  <Td fontSize="xs" whiteSpace="nowrap">{fmtDateTime(r.lastNotificationDate)}</Td>
                  <Td>{r.deliveryStatus ? <Badge colorScheme={deliveryBadgeColor(r.deliveryStatus)} fontSize="xs">{r.deliveryStatus}</Badge> : "—"}</Td>
                  <Td>
                    <Flex gap={1}>
                      <Tooltip label="Send notification">
                        <Button size="xs" colorScheme="blue" onClick={() => handleOpenSingleSend(r)}><FiSend /></Button>
                      </Tooltip>
                      <Tooltip label="View notification log">
                        <Button size="xs" variant="outline" onClick={() => handleOpenLog(r)}><FiEye /></Button>
                      </Tooltip>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <PaginationBar
        page={filters.page}
        totalPages={totalPages}
        total={total}
        limit={filters.limit}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))}
      />

      <SendNotificationModal isOpen={isSendOpen} onClose={closeSend} targets={sendModalTargets} title={sendModalTitle} onSent={fetchData} />

      <StudentEntityLogModal
        isOpen={isLogOpen}
        onClose={closeLog}
        studentId={logTarget?.studentId}
        studentName={logTarget?.studentName}
        entityType={logTarget?.entityType}
        entityId={logTarget?.entityId}
        entityTitle={logTarget?.entityTitle}
      />
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ExamCompliancePage = () => {
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();
  const { isOpen: isSendOpen, onOpen: openSend, onClose: closeSend } = useDisclosure();

  const fetchKpis = useCallback(async () => {
    setKpisLoading(true);
    try {
      const res = await getComplianceNotificationKpis();
      setKpis(res?.data ?? res);
    } catch {
      console.warn("[ExamCompliance] GET /compliance-notifications/kpis failed, using mock");
      setKpis(MOCK_KPIS);
    } finally { setKpisLoading(false); }
  }, []);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);

  const handleOpenDetail = (id) => { setSelectedNotifId(id); openDrawer(); };
  const handleRefresh = () => { fetchKpis(); setLogRefreshKey((k) => k + 1); };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Compliance Monitor</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="2xl" fontWeight={700} color="gray.800">Compliance & Non-Compliance Monitor</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>Monitor course and exam compliance obligations, dispatch notifications, and manage escalations</Text>
        </Box>
        <Button colorScheme="blue" leftIcon={<FiSend />} onClick={openSend}>Send / Evaluate</Button>
      </Flex>

      <KpiSection kpis={kpis} loading={kpisLoading} />

      <Box bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" p={5}>
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>Notification Log</Tab>
            <Tab>Compliance Report</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <LogTableTab onOpenDetail={handleOpenDetail} refreshKey={logRefreshKey} />
            </TabPanel>
            <TabPanel px={0}>
              <ComplianceReportTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <NotifDetailDrawer
        notifId={selectedNotifId}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onActionDone={handleRefresh}
      />

      <SendEvaluateModal isOpen={isSendOpen} onClose={closeSend} onDone={handleRefresh} />
    </AdminMainAreaWrapper>
  );
};

export default ExamCompliancePage;

export const ExamCompliancePageRoute = (props) => (
  <Route {...props} component={ExamCompliancePage} />
);
