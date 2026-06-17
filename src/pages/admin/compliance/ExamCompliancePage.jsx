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
} from "@chakra-ui/react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiSend,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
} from "react-icons/fi";
import dayjs from "dayjs";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../components";
import {
  getComplianceNotificationKpis,
  getComplianceNotifications,
  getComplianceNotificationById,
  sendComplianceNotification,
  resendComplianceNotification,
  escalateComplianceNotification,
  adminGetUserListing,
  adminGetCourseListing,
  adminGetStandaloneExaminationListing,
} from "../../../services";

const useStyles = makeStyles(() => ({
  tabs: { borderBottom: "1px solid #e2e8f0", marginBottom: 16 },
  tab: { textTransform: "none", fontWeight: 600, fontSize: 14 },
}));

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

// ─── Send / Evaluate Tab ──────────────────────────────────────────────────────

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

const SendEvaluateTab = ({ onDone }) => {
  const toast = useToast();
  const [single, setSingle] = useState({ recipientId: "", recipientLabel: "", entityType: "Course", courseId: "", courseLabel: "", examId: "", examLabel: "", notificationType: "", notificationChannel: "", remarks: "" });
  const [singleErrors, setSingleErrors] = useState({});
  const [sending, setSending] = useState(false);

  // const [bulk, setBulk] = useState({ entityType: "", notificationChannel: "Both", daysAhead: 7, escalateAfterDays: 14 });
  // const [bulkResult, setBulkResult] = useState(null);
  // const [evaluating, setEvaluating] = useState(false);

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
      setSingle({ recipientId: "", recipientLabel: "", entityType: "Course", courseId: "", courseLabel: "", examId: "", examLabel: "", notificationType: "", notificationChannel: "", remarks: "" });
      onDone();
    } catch (err) {
      const msg = err?.response?.status === 404 ? "Recipient or course/exam not found." : err?.response?.data?.message ?? "Something went wrong.";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally { setSending(false); }
  };

  // const handleEvaluate = async () => {
  //   const { daysAhead, escalateAfterDays } = bulk;
  //   if (daysAhead < 0) { toast({ title: "Days ahead must be 0 or greater.", status: "error", duration: 3000 }); return; }
  //   if (escalateAfterDays < 1) { toast({ title: "Escalation threshold must be a positive number.", status: "error", duration: 3000 }); return; }
  //   setEvaluating(true);
  //   setBulkResult(null);
  //   try {
  //     const res = await evaluateComplianceNotifications({ ...bulk, daysAhead: Number(daysAhead), escalateAfterDays: Number(escalateAfterDays) });
  //     const d = res?.data ?? res;
  //     setBulkResult(d);
  //     toast({ title: `${d.sent} sent, ${d.failed} failed, ${d.skipped} skipped.`, status: d.failed > 0 ? "warning" : "success", duration: 5000 });
  //     onDone();
  //   } catch {
  //     setBulkResult({ total: 98, sent: 90, failed: 4, skipped: 4 });
  //   } finally { setEvaluating(false); }
  // };

  return (
    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
      {/* Single Send */}
      <Box p={5} border="1px solid" borderColor="gray.200" borderRadius="md">
        <Text fontWeight={700} mb={4} color="gray.700">Send Single Notification</Text>
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

          <Button colorScheme="blue" leftIcon={<FiSend />} size="sm" onClick={handleSendSingle} isLoading={sending} loadingText="Sending…">Send Notification</Button>
        </Flex>
      </Box>

      {/* Bulk Evaluate */}
     
    </Grid>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ExamCompliancePage = () => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();

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
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight={700} color="gray.800">Compliance & Non-Compliance Monitor</Text>
        <Text fontSize="sm" color="gray.500" mt={1}>Monitor course and exam compliance obligations, dispatch notifications, and manage escalations</Text>
      </Box>

      <KpiSection kpis={kpis} loading={kpisLoading} />

      <Box bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" p={5}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} className={classes.tabs} indicatorColor="primary" textColor="primary">
          <Tab label="Notification Log" className={classes.tab} />
          <Tab label="Send / Evaluate" className={classes.tab} />
        </Tabs>

        <Box mt={2}>
          {activeTab === 0 && <LogTableTab onOpenDetail={handleOpenDetail} refreshKey={logRefreshKey} />}
          {activeTab === 1 && <SendEvaluateTab onDone={handleRefresh} />}
        </Box>
      </Box>

      <NotifDetailDrawer
        notifId={selectedNotifId}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onActionDone={handleRefresh}
      />
    </AdminMainAreaWrapper>
  );
};

export default ExamCompliancePage;

export const ExamCompliancePageRoute = (props) => (
  <Route {...props} component={ExamCompliancePage} />
);
