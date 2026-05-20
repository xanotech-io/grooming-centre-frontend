import React, { useState, useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Badge,
  Button,
  Select,
  Input,
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
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Divider,
  SimpleGrid,
  Tag,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import {
  FiMail,
  FiMessageSquare,
  FiBell,
  FiAlertTriangle,
  FiRefreshCw,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { DashboardMetricCard } from "../../../components";
import {
  getExamNotificationKpis,
  getExamNotifications,
  getExamNotificationById,
  getExamNotificationReport,
  sendExamNotification,
  bulkNotifyExam,
  resendExamNotification,
} from "../../../services";

dayjs.extend(relativeTime);

const PaginationBar = ({ page, totalPages, total, limit, onPageChange, onLimitChange, limitOptions = [10, 20, 50] }) => (
  <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
    <Flex align="center" gap={2}>
      <Text fontSize="sm" color="gray.600">Rows per page:</Text>
      <Select size="sm" width="80px" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
        {limitOptions.map((l) => <option key={l} value={l}>{l}</option>)}
      </Select>
    </Flex>
    <Flex align="center" gap={2}>
      <Text fontSize="sm" color="gray.600">Page {page} of {totalPages} ({total} records)</Text>
      <Button size="xs" onClick={() => onPageChange(page - 1)} isDisabled={page <= 1} variant="outline">Prev</Button>
      <Button size="xs" onClick={() => onPageChange(page + 1)} isDisabled={page >= totalPages} variant="outline">Next</Button>
    </Flex>
  </Flex>
);

const useStyles = makeStyles(() => ({
  tabs: { borderBottom: "1px solid #e2e8f0", marginBottom: 16 },
  tab: { textTransform: "none", fontWeight: 600, fontSize: 14 },
}));

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_KPIS = {
  total_notifications: 77,
  sent_count: 70,
  failed_count: 5,
  read_count: 55,
  delivery_success_rate_percent: 90.9,
  failed_notification_rate_percent: 6.5,
  student_acknowledgment_rate_percent: 78.6,
  avg_processing_time_seconds: 2.4,
  by_type: { Schedule: 45, Result: 32 },
  by_channel: { Email: 50, SMS: 0, System: 27 },
};

const MOCK_NOTIFICATIONS = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    recipientId: "rec-001",
    examId: "exam-001",
    notificationType: "Schedule",
    examTitle: "Microfinance Midterm",
    examStartTime: "2026-06-15T09:00:00.000Z",
    scoreInfo: null,
    sentByType: "System",
    status: "Failed",
    deliveryChannel: "Email",
    sentAt: "2026-05-20T11:06:59.324Z",
    readAt: null,
    failureReason: "Invalid email address",
    recipient: { id: "rec-001", firstName: "Jane", lastName: "Doe", email: "jane.doe@example.com" },
    sender: {},
    exam: { id: "exam-001", title: "Microfinance Midterm", startTime: "2026-06-15T09:00:00.000Z", duration: 90 },
  },
  {
    id: "4ab12c78-1234-4567-abcd-ef1234567890",
    recipientId: "rec-002",
    examId: "exam-002",
    notificationType: "Result",
    examTitle: "Corporate Finance Final",
    examStartTime: "2026-04-10T08:00:00.000Z",
    scoreInfo: { score: 82, totalMarks: 100, grade: "A", remarks: "Excellent work" },
    sentByType: "Admin",
    status: "Sent",
    deliveryChannel: "System",
    sentAt: "2026-05-18T09:30:00.000Z",
    readAt: "2026-05-18T10:15:00.000Z",
    failureReason: null,
    recipient: { id: "rec-002", firstName: "John", lastName: "Smith", email: "john.smith@example.com" },
    sender: {},
    exam: { id: "exam-002", title: "Corporate Finance Final", startTime: "2026-04-10T08:00:00.000Z", duration: 120 },
  },
  {
    id: "5bc23d89-2345-5678-bcde-ef2345678901",
    recipientId: "rec-003",
    examId: "exam-001",
    notificationType: "Schedule",
    examTitle: "Microfinance Midterm",
    examStartTime: "2026-06-15T09:00:00.000Z",
    scoreInfo: null,
    sentByType: "System",
    status: "Sent",
    deliveryChannel: "Email",
    sentAt: "2026-05-19T14:20:00.000Z",
    readAt: null,
    failureReason: null,
    recipient: { id: "rec-003", firstName: "Alice", lastName: "Brown", email: "alice.brown@example.com" },
    sender: {},
    exam: { id: "exam-001", title: "Microfinance Midterm", startTime: "2026-06-15T09:00:00.000Z", duration: 90 },
  },
  {
    id: "6cd34e90-3456-6789-cdef-ef3456789012",
    recipientId: "rec-004",
    examId: "exam-003",
    notificationType: "Result",
    examTitle: "Banking Operations Quiz",
    examStartTime: "2026-03-01T10:00:00.000Z",
    scoreInfo: { score: 65, totalMarks: 100, grade: "C", remarks: "Needs improvement" },
    sentByType: "System",
    status: "Pending",
    deliveryChannel: "SMS",
    sentAt: "2026-05-20T08:00:00.000Z",
    readAt: null,
    failureReason: null,
    recipient: { id: "rec-004", firstName: "Bob", lastName: "Wilson", email: "bob.wilson@example.com" },
    sender: {},
    exam: { id: "exam-003", title: "Banking Operations Quiz", startTime: "2026-03-01T10:00:00.000Z", duration: 60 },
  },
  {
    id: "7de45f01-4567-789a-def0-ef4567890123",
    recipientId: "rec-005",
    examId: "exam-002",
    notificationType: "Result",
    examTitle: "Corporate Finance Final",
    examStartTime: "2026-04-10T08:00:00.000Z",
    scoreInfo: { score: 91, totalMarks: 100, grade: "A+", remarks: "Outstanding" },
    sentByType: "Admin",
    status: "Failed",
    deliveryChannel: "Email",
    sentAt: "2026-05-17T16:45:00.000Z",
    readAt: null,
    failureReason: "Mailbox full",
    recipient: { id: "rec-005", firstName: "Carol", lastName: "Davis", email: "carol.davis@example.com" },
    sender: {},
    exam: { id: "exam-002", title: "Corporate Finance Final", startTime: "2026-04-10T08:00:00.000Z", duration: 120 },
  },
];

const MOCK_REPORT = {
  kpis: {
    total_notifications: 45,
    sent_count: 40,
    failed_count: 3,
    read_count: 30,
    delivery_success_rate_percent: 88.9,
    failed_notification_rate_percent: 6.7,
    student_acknowledgment_rate_percent: 75.0,
    avg_processing_time_seconds: 1.9,
    by_type: { Schedule: 25, Result: 20 },
    by_channel: { Email: 30, SMS: 0, System: 15 },
  },
  recent_notifications: MOCK_NOTIFICATIONS.slice(0, 3),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (v) => (v ? dayjs(v).format("MMM D, YYYY, h:mm A") : "—");

const statusBadgeColor = (s) => ({ Pending: "gray", Sent: "green", Failed: "red" }[s] || "gray");
const typeBadgeColor = (t) => ({ Schedule: "blue", Result: "purple" }[t] || "gray");

const ChannelIcon = ({ channel }) => {
  if (channel === "Email") return <FiMail />;
  if (channel === "SMS") return <FiMessageSquare />;
  return <FiBell />;
};

const truncateId = (id) => (id ? `${id.substring(0, 8)}…` : "—");

// ─── KPI Section ─────────────────────────────────────────────────────────────

const KpiSection = ({ kpis, loading }) => {
  const successColor =
    kpis?.delivery_success_rate_percent >= 95
      ? "green.500"
      : kpis?.delivery_success_rate_percent >= 80
      ? "blue.500"
      : "orange.500";
  const failedColor = kpis?.failed_notification_rate_percent > 10 ? "red.500" : "gray.700";
  const ackColor = kpis?.student_acknowledgment_rate_percent < 50 ? "orange.500" : "gray.700";

  const cards = [
    { label: "Total Notifications", value: kpis?.total_notifications ?? 0 },
    { label: "Sent", value: kpis?.sent_count ?? 0 },
    { label: "Failed", value: kpis?.failed_count ?? 0 },
    { label: "Read", value: kpis?.read_count ?? 0 },
    {
      label: "Delivery Success Rate",
      value: loading ? "—" : `${kpis?.delivery_success_rate_percent ?? 0}%`,
      color: successColor,
    },
    {
      label: "Failed Rate",
      value: loading ? "—" : `${kpis?.failed_notification_rate_percent ?? 0}%`,
      color: failedColor,
      icon: kpis?.failed_notification_rate_percent > 10 ? <FiAlertTriangle color="red" /> : null,
    },
    {
      label: "Acknowledgment Rate",
      value: loading ? "—" : `${kpis?.student_acknowledgment_rate_percent ?? 0}%`,
      color: ackColor,
    },
    {
      label: "Avg Processing Time",
      value: loading ? "—" : `${kpis?.avg_processing_time_seconds ?? 0}s`,
    },
  ];

  return (
    <Box mb={6}>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        {cards.map((c) =>
          loading ? (
            <Skeleton key={c.label} height="80px" borderRadius="md" />
          ) : (
            <DashboardMetricCard key={c.label} title={c.label} value={c.value} color={c.color} />
          )
        )}
      </SimpleGrid>

      {!loading && kpis && (
        <Flex gap={4} flexWrap="wrap">
          <Flex gap={2} align="center">
            <Text fontSize="sm" fontWeight={600} color="gray.600">By Type:</Text>
            <Tag colorScheme="blue" size="sm">Schedule: {kpis.by_type?.Schedule ?? 0}</Tag>
            <Tag colorScheme="purple" size="sm">Result: {kpis.by_type?.Result ?? 0}</Tag>
          </Flex>
          <Flex gap={2} align="center">
            <Text fontSize="sm" fontWeight={600} color="gray.600">By Channel:</Text>
            <Tag colorScheme="teal" size="sm">Email: {kpis.by_channel?.Email ?? 0}</Tag>
            <Tag colorScheme="orange" size="sm">SMS: {kpis.by_channel?.SMS ?? 0}</Tag>
            <Tag colorScheme="cyan" size="sm">System: {kpis.by_channel?.System ?? 0}</Tag>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

// ─── Notification Detail Drawer ───────────────────────────────────────────────

const NotificationDetailDrawer = ({ notifId, isOpen, onClose, onResendSuccess }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen || !notifId) return;
    setLoading(true);
    getExamNotificationById(notifId)
      .then(setDetail)
      .catch((err) => {
        if (err?.response?.status === 404) {
          setDetail(null);
        } else {
          console.warn(`[ExamNotifications] GET /${notifId} failed, falling back to mock`);
          const found = MOCK_NOTIFICATIONS.find((n) => n.id === notifId);
          setDetail(found || null);
        }
      })
      .finally(() => setLoading(false));
  }, [notifId, isOpen]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendExamNotification(notifId);
      toast({ title: "Notification resent successfully.", status: "success", duration: 3000 });
      onResendSuccess();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.status === 400
          ? "This notification cannot be resent — it is not in Failed status."
          : err?.response?.status === 404
          ? "Notification not found."
          : "Something went wrong. Please try again.";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally {
      setResending(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Notification Detail</DrawerHeader>
        <DrawerBody>
          {loading ? (
            <Flex direction="column" gap={3} mt={4}>
              {[...Array(8)].map((_, i) => <Skeleton key={i} height="24px" />)}
            </Flex>
          ) : !detail ? (
            <Flex direction="column" align="center" justify="center" h="200px">
              <Text color="gray.500">Notification not found.</Text>
              <Button mt={4} size="sm" onClick={onClose}>Go Back</Button>
            </Flex>
          ) : (
            <Flex direction="column" gap={4} mt={2}>
              <DetailRow label="Notification ID" value={detail.id} />
              <DetailRow label="Recipient" value={`${detail.recipient?.firstName ?? ""} ${detail.recipient?.lastName ?? ""}`} />
              <DetailRow label="Recipient Email" value={detail.recipient?.email} />
              <DetailRow label="Exam" value={detail.exam?.title ?? detail.examTitle} />
              <DetailRow label="Exam Start Time" value={fmtDate(detail.exam?.startTime ?? detail.examStartTime)} />
              <DetailRow label="Exam Duration" value={detail.exam?.duration ? `${detail.exam.duration} minutes` : "—"} />
              <Flex align="center" justify="space-between">
                <Text fontSize="sm" fontWeight={600} color="gray.600">Type</Text>
                <Badge colorScheme={typeBadgeColor(detail.notificationType)}>{detail.notificationType}</Badge>
              </Flex>
              <Flex align="center" justify="space-between">
                <Text fontSize="sm" fontWeight={600} color="gray.600">Channel</Text>
                <Flex align="center" gap={1}>
                  <ChannelIcon channel={detail.deliveryChannel} />
                  <Text fontSize="sm">{detail.deliveryChannel}</Text>
                </Flex>
              </Flex>
              <DetailRow label="Sent By" value={detail.sentByType} />
              <Flex align="center" justify="space-between">
                <Text fontSize="sm" fontWeight={600} color="gray.600">Status</Text>
                <Badge colorScheme={statusBadgeColor(detail.status)}>{detail.status}</Badge>
              </Flex>
              <DetailRow label="Sent At" value={fmtDate(detail.sentAt)} />
              <DetailRow label="Read At" value={detail.readAt ? fmtDate(detail.readAt) : "Not yet read"} />
              {detail.failureReason && (
                <Box>
                  <Text fontSize="sm" fontWeight={600} color="gray.600" mb={1}>Failure Reason</Text>
                  <Text fontSize="sm" color="red.500">{detail.failureReason}</Text>
                </Box>
              )}

              {detail.notificationType === "Result" && detail.scoreInfo && (
                <>
                  <Divider />
                  <Text fontWeight={700} fontSize="sm" color="gray.700">Score Information</Text>
                  <DetailRow label="Score" value={`${detail.scoreInfo.score} / ${detail.scoreInfo.totalMarks}`} />
                  <DetailRow label="Grade" value={detail.scoreInfo.grade} />
                  {detail.scoreInfo.remarks && (
                    <DetailRow label="Remarks" value={detail.scoreInfo.remarks} />
                  )}
                </>
              )}
            </Flex>
          )}
        </DrawerBody>
        {detail?.status === "Failed" && (
          <DrawerFooter borderTopWidth="1px">
            <Button
              colorScheme="blue"
              leftIcon={<FiRefreshCw />}
              onClick={handleResend}
              isLoading={resending}
              loadingText="Resending…"
              size="sm"
            >
              Resend Notification
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

const DetailRow = ({ label, value }) => (
  <Flex align="flex-start" justify="space-between">
    <Text fontSize="sm" fontWeight={600} color="gray.600" minW="140px">{label}</Text>
    <Text fontSize="sm" color="gray.800" textAlign="right" maxW="260px" wordBreak="break-word">{value ?? "—"}</Text>
  </Flex>
);

// ─── Log Table Tab ────────────────────────────────────────────────────────────

const LogTableTab = ({ onOpenDetail, initialFilters }) => {
  const [filters, setFilters] = useState({
    notificationType: "",
    status: "",
    deliveryChannel: "",
    sentByType: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
    ...initialFilters,
  });
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v !== "" && v !== null) params[k] = v; });
    try {
      const res = await getExamNotifications(params);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRows(list);
      setTotal(res?.total ?? list.length);
      setTotalPages(res?.totalPages ?? 1);
    } catch {
      console.warn("[ExamNotifications] GET /exam-notifications failed, falling back to mock data");
      setRows(MOCK_NOTIFICATIONS);
      setTotal(MOCK_NOTIFICATIONS.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  const handleResendRow = async (id, e) => {
    e.stopPropagation();
    try {
      await resendExamNotification(id);
      toast({ title: "Notification resent successfully.", status: "success", duration: 3000 });
      fetchData();
    } catch {
      toast({ title: "Failed to resend notification.", status: "error", duration: 4000 });
    }
  };

  return (
    <Box>
      {/* Filters */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={4}>
        <Select
          placeholder="All Types"
          size="sm"
          value={filters.notificationType}
          onChange={(e) => setFilter("notificationType", e.target.value)}
        >
          <option value="Schedule">Schedule</option>
          <option value="Result">Result</option>
        </Select>
        <Select
          placeholder="All Statuses"
          size="sm"
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Sent">Sent</option>
          <option value="Failed">Failed</option>
        </Select>
        <Select
          placeholder="All Channels"
          size="sm"
          value={filters.deliveryChannel}
          onChange={(e) => setFilter("deliveryChannel", e.target.value)}
        >
          <option value="Email">Email</option>
          <option value="SMS">SMS</option>
          <option value="System">System</option>
        </Select>
        <Select
          placeholder="All Senders"
          size="sm"
          value={filters.sentByType}
          onChange={(e) => setFilter("sentByType", e.target.value)}
        >
          <option value="System">System</option>
          <option value="Admin">Admin</option>
        </Select>
        <Input
          type="date"
          size="sm"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={(e) => setFilter("startDate", e.target.value)}
        />
        <Input
          type="date"
          size="sm"
          placeholder="End Date"
          value={filters.endDate}
          onChange={(e) => setFilter("endDate", e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setFilters({ notificationType: "", status: "", deliveryChannel: "", sentByType: "", startDate: "", endDate: "", page: 1, limit: 20 })
          }
        >
          Clear Filters
        </Button>
        <Button size="sm" colorScheme="blue" leftIcon={<FiRefreshCw />} onClick={fetchData}>
          Refresh
        </Button>
      </Grid>

      {/* Table */}
      {loading ? (
        <Flex direction="column" gap={2}>{[...Array(5)].map((_, i) => <Skeleton key={i} height="40px" />)}</Flex>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Recipient</Th>
                <Th>Exam</Th>
                <Th>Type</Th>
                <Th>Channel</Th>
                <Th>Sent By</Th>
                <Th>Status</Th>
                <Th>Sent At</Th>
                <Th>Read At</Th>
                <Th>Failure</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.length === 0 ? (
                <Tr>
                  <Td colSpan={11} textAlign="center" color="gray.400" py={8}>No notifications found.</Td>
                </Tr>
              ) : (
                rows.map((row) => (
                  <Tr
                    key={row.id}
                    cursor="pointer"
                    _hover={{ bg: "blue.50" }}
                    onClick={() => onOpenDetail(row.id)}
                  >
                    <Td>
                      <Tooltip label={row.id}>
                        <Text fontSize="xs" color="blue.600" fontWeight={600}>{truncateId(row.id)}</Text>
                      </Tooltip>
                    </Td>
                    <Td fontSize="xs">{row.recipient?.firstName} {row.recipient?.lastName}</Td>
                    <Td fontSize="xs" maxW="140px" isTruncated>{row.examTitle}</Td>
                    <Td><Badge colorScheme={typeBadgeColor(row.notificationType)} fontSize="xs">{row.notificationType}</Badge></Td>
                    <Td>
                      <Flex align="center" gap={1} fontSize="xs">
                        <ChannelIcon channel={row.deliveryChannel} />
                        {row.deliveryChannel}
                      </Flex>
                    </Td>
                    <Td fontSize="xs">{row.sentByType}</Td>
                    <Td><Badge colorScheme={statusBadgeColor(row.status)} fontSize="xs">{row.status}</Badge></Td>
                    <Td fontSize="xs" whiteSpace="nowrap">{fmtDate(row.sentAt)}</Td>
                    <Td fontSize="xs" whiteSpace="nowrap">{row.readAt ? fmtDate(row.readAt) : "—"}</Td>
                    <Td>
                      {row.failureReason ? (
                        <Tooltip label={row.failureReason}>
                          <Box color="orange.400" display="inline-flex"><FiAlertTriangle /></Box>
                        </Tooltip>
                      ) : "—"}
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      {row.status === "Failed" && (
                        <Button
                          size="xs"
                          colorScheme="orange"
                          leftIcon={<FiRefreshCw />}
                          onClick={(e) => handleResendRow(row.id, e)}
                        >
                          Resend
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      <Box mt={4}>
        <PaginationBar
          page={filters.page}
          totalPages={totalPages}
          total={total}
          limit={filters.limit}
          onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))}
          limitOptions={[10, 20, 50]}
        />
      </Box>
    </Box>
  );
};

// ─── Report Tab ───────────────────────────────────────────────────────────────

const ReportTab = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (sd, ed) => {
    setLoading(true);
    const params = {};
    if (sd) params.start_date = sd;
    if (ed) params.end_date = ed;
    try {
      const res = await getExamNotificationReport(params);
      setReport(res);
    } catch {
      console.warn("[ExamNotifications] GET /exam-notifications/report failed, falling back to mock data");
      setReport(MOCK_REPORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport("", ""); }, []);

  const handleApply = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setDateError("Please provide both a start and end date.");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setDateError("End date must be on or after the start date.");
      return;
    }
    setDateError("");
    fetchReport(startDate, endDate);
  };

  const kpis = report?.kpis;
  const recent = report?.recent_notifications ?? [];

  return (
    <Box>
      <Flex gap={3} mb={6} flexWrap="wrap" align="flex-end">
        <FormControl isInvalid={!!dateError} maxW="180px">
          <FormLabel fontSize="xs">Start Date</FormLabel>
          <Input type="date" size="sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormControl>
        <FormControl isInvalid={!!dateError} maxW="180px">
          <FormLabel fontSize="xs">End Date</FormLabel>
          <Input type="date" size="sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          {dateError && <FormErrorMessage>{dateError}</FormErrorMessage>}
        </FormControl>
        <Button size="sm" colorScheme="blue" onClick={handleApply} isLoading={loading}>Apply</Button>
        <Button size="sm" variant="outline" onClick={() => { setStartDate(""); setEndDate(""); setDateError(""); fetchReport("", ""); }}>
          Reset
        </Button>
      </Flex>

      {loading ? (
        <Flex direction="column" gap={3}>{[...Array(4)].map((_, i) => <Skeleton key={i} height="60px" />)}</Flex>
      ) : report ? (
        <>
          <Text fontWeight={700} mb={3} color="gray.700">KPI Summary</Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            {kpis && [
              { label: "Total", value: kpis.total_notifications },
              { label: "Sent", value: kpis.sent_count },
              { label: "Failed", value: kpis.failed_count },
              { label: "Read", value: kpis.read_count },
              { label: "Success Rate", value: `${kpis.delivery_success_rate_percent}%` },
              { label: "Failed Rate", value: `${kpis.failed_notification_rate_percent}%` },
              { label: "Ack. Rate", value: `${kpis.student_acknowledgment_rate_percent}%` },
              { label: "Avg Time", value: `${kpis.avg_processing_time_seconds}s` },
            ].map((c) => (
              <DashboardMetricCard key={c.label} title={c.label} value={c.value} />
            ))}
          </SimpleGrid>

          <Text fontWeight={700} mb={3} color="gray.700">Recent Notifications (up to 50)</Text>
          <Box overflowX="auto">
            <Table size="sm" variant="striped">
              <Thead>
                <Tr>
                  <Th>Recipient</Th>
                  <Th>Exam</Th>
                  <Th>Type</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                  <Th>Sent At</Th>
                  <Th>Read At</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recent.length === 0 ? (
                  <Tr><Td colSpan={7} textAlign="center" color="gray.400" py={6}>No data in selected range.</Td></Tr>
                ) : recent.map((n) => (
                  <Tr key={n.id}>
                    <Td fontSize="xs">{n.recipient?.firstName} {n.recipient?.lastName}</Td>
                    <Td fontSize="xs">{n.examTitle}</Td>
                    <Td><Badge colorScheme={typeBadgeColor(n.notificationType)} fontSize="xs">{n.notificationType}</Badge></Td>
                    <Td fontSize="xs">{n.deliveryChannel}</Td>
                    <Td><Badge colorScheme={statusBadgeColor(n.status)} fontSize="xs">{n.status}</Badge></Td>
                    <Td fontSize="xs" whiteSpace="nowrap">{fmtDate(n.sentAt)}</Td>
                    <Td fontSize="xs" whiteSpace="nowrap">{n.readAt ? fmtDate(n.readAt) : "—"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      ) : null}
    </Box>
  );
};

// ─── Send Tab ─────────────────────────────────────────────────────────────────

const SendTab = ({ onNotificationSent }) => {
  const toast = useToast();

  const [single, setSingle] = useState({ recipientId: "", examId: "", notificationType: "", deliveryChannel: "" });
  const [singleErrors, setSingleErrors] = useState({});
  const [sending, setSending] = useState(false);

  const [bulk, setBulk] = useState({ examId: "", notificationType: "", deliveryChannel: "" });
  const [bulkErrors, setBulkErrors] = useState({});
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const validateSingle = () => {
    const errs = {};
    if (!single.recipientId.trim()) errs.recipientId = "Required";
    if (!single.examId.trim()) errs.examId = "Required";
    if (!single.notificationType) errs.notificationType = "Required";
    if (!single.deliveryChannel) errs.deliveryChannel = "Required";
    setSingleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendSingle = async () => {
    if (!validateSingle()) return;
    setSending(true);
    try {
      await sendExamNotification(single);
      toast({ title: "Notification sent successfully.", status: "success", duration: 3000 });
      setSingle({ recipientId: "", examId: "", notificationType: "", deliveryChannel: "" });
      onNotificationSent();
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 400
          ? err?.response?.data?.message ?? "All fields are required."
          : status === 404
          ? "Recipient or exam not found. Please check and try again."
          : "Something went wrong. Please try again.";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally {
      setSending(false);
    }
  };

  const validateBulk = () => {
    const errs = {};
    if (!bulk.examId.trim()) errs.examId = "Required";
    if (!bulk.notificationType) errs.notificationType = "Required";
    if (!bulk.deliveryChannel) errs.deliveryChannel = "Required";
    setBulkErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBulkConfirm = async () => {
    setBulkSending(true);
    try {
      const res = await bulkNotifyExam(bulk);
      setBulkResult(res);
      toast({
        title: `Notifications dispatched: ${res.sent} sent, ${res.failed} failed out of ${res.total} participants.`,
        status: res.failed > 0 ? "warning" : "success",
        duration: 5000,
      });
      onNotificationSent();
    } catch (err) {
      const msg =
        err?.response?.status === 404
          ? "Exam not found or has no active participants."
          : "Something went wrong. Please try again.";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally {
      setBulkSending(false);
      onConfirmClose();
    }
  };

  return (
    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
      {/* Single Send */}
      <Box p={5} border="1px solid" borderColor="gray.200" borderRadius="md">
        <Text fontWeight={700} mb={4} color="gray.700">Send Single Notification</Text>
        <Flex direction="column" gap={4}>
          <FormControl isInvalid={!!singleErrors.recipientId}>
            <FormLabel fontSize="sm">Recipient ID (Student UUID)</FormLabel>
            <Input size="sm" placeholder="Student UUID" value={single.recipientId} onChange={(e) => setSingle((s) => ({ ...s, recipientId: e.target.value }))} />
            <FormErrorMessage>{singleErrors.recipientId}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!singleErrors.examId}>
            <FormLabel fontSize="sm">Exam ID (Exam UUID)</FormLabel>
            <Input size="sm" placeholder="Exam UUID" value={single.examId} onChange={(e) => setSingle((s) => ({ ...s, examId: e.target.value }))} />
            <FormErrorMessage>{singleErrors.examId}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!singleErrors.notificationType}>
            <FormLabel fontSize="sm">Notification Type</FormLabel>
            <Select size="sm" placeholder="Select type" value={single.notificationType} onChange={(e) => setSingle((s) => ({ ...s, notificationType: e.target.value }))}>
              <option value="Schedule">Schedule</option>
              <option value="Result">Result</option>
            </Select>
            <FormErrorMessage>{singleErrors.notificationType}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!singleErrors.deliveryChannel}>
            <FormLabel fontSize="sm">Delivery Channel</FormLabel>
            <Select size="sm" placeholder="Select channel" value={single.deliveryChannel} onChange={(e) => setSingle((s) => ({ ...s, deliveryChannel: e.target.value }))}>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="System">System</option>
            </Select>
            <FormErrorMessage>{singleErrors.deliveryChannel}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            leftIcon={<FiSend />}
            size="sm"
            onClick={handleSendSingle}
            isLoading={sending}
            loadingText="Sending…"
          >
            Send Notification
          </Button>
        </Flex>
      </Box>

      {/* Bulk Notify */}
      <Box p={5} border="1px solid" borderColor="gray.200" borderRadius="md">
        <Text fontWeight={700} mb={4} color="gray.700">Bulk Notify Exam Participants</Text>
        <Flex direction="column" gap={4}>
          <FormControl isInvalid={!!bulkErrors.examId}>
            <FormLabel fontSize="sm">Exam ID (Exam UUID)</FormLabel>
            <Input size="sm" placeholder="Exam UUID" value={bulk.examId} onChange={(e) => setBulk((b) => ({ ...b, examId: e.target.value }))} />
            <FormErrorMessage>{bulkErrors.examId}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!bulkErrors.notificationType}>
            <FormLabel fontSize="sm">Notification Type</FormLabel>
            <Select size="sm" placeholder="Select type" value={bulk.notificationType} onChange={(e) => setBulk((b) => ({ ...b, notificationType: e.target.value }))}>
              <option value="Schedule">Schedule</option>
              <option value="Result">Result</option>
            </Select>
            <FormErrorMessage>{bulkErrors.notificationType}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!bulkErrors.deliveryChannel}>
            <FormLabel fontSize="sm">Delivery Channel</FormLabel>
            <Select size="sm" placeholder="Select channel" value={bulk.deliveryChannel} onChange={(e) => setBulk((b) => ({ ...b, deliveryChannel: e.target.value }))}>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="System">System</option>
            </Select>
            <FormErrorMessage>{bulkErrors.deliveryChannel}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="orange"
            leftIcon={<FiBell />}
            size="sm"
            onClick={() => { if (validateBulk()) onConfirmOpen(); }}
          >
            Notify All Participants
          </Button>

          {bulkResult && (
            <Box mt={2} p={3} bg={bulkResult.failed > 0 ? "orange.50" : "green.50"} borderRadius="md">
              <Flex align="center" gap={2}>
                {bulkResult.failed > 0 ? <FiAlertTriangle color="orange" /> : <FiCheckCircle color="green" />}
                <Text fontSize="sm" fontWeight={600}>
                  {bulkResult.sent} sent, {bulkResult.failed} failed out of {bulkResult.total} participants.
                </Text>
              </Flex>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Bulk Notification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              You are about to send a{" "}
              <strong>{bulk.notificationType}</strong> notification to all active
              participants via <strong>{bulk.deliveryChannel}</strong>. This action cannot be
              undone. Continue?
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onConfirmClose}>Cancel</Button>
            <Button
              colorScheme="orange"
              onClick={handleBulkConfirm}
              isLoading={bulkSending}
              loadingText="Sending…"
            >
              Confirm & Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ExamNotificationsPage = () => {
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
      const res = await getExamNotificationKpis();
      setKpis(res);
    } catch {
      console.warn("[ExamNotifications] GET /exam-notifications/kpis failed, falling back to mock data");
      setKpis(MOCK_KPIS);
    } finally {
      setKpisLoading(false);
    }
  }, []);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);

  const handleOpenDetail = (id) => {
    setSelectedNotifId(id);
    openDrawer();
  };

  const handleRefreshAfterAction = () => {
    fetchKpis();
    setLogRefreshKey((k) => k + 1);
  };

  return (
    <AdminMainAreaWrapper>
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight={700} color="gray.800">Exam Notifications</Text>
        <Text fontSize="sm" color="gray.500" mt={1}>Manage and monitor exam schedule and result notifications</Text>
      </Box>

      <KpiSection kpis={kpis} loading={kpisLoading} />

      <Box bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" p={5}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Notification Log" className={classes.tab} />
          <Tab label="Report" className={classes.tab} />
          <Tab label="Send / Bulk Notify" className={classes.tab} />
        </Tabs>

        <Box mt={2}>
          {activeTab === 0 && (
            <LogTableTab
              key={logRefreshKey}
              onOpenDetail={handleOpenDetail}
              initialFilters={{}}
            />
          )}
          {activeTab === 1 && <ReportTab />}
          {activeTab === 2 && <SendTab onNotificationSent={handleRefreshAfterAction} />}
        </Box>
      </Box>

      <NotificationDetailDrawer
        notifId={selectedNotifId}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onResendSuccess={handleRefreshAfterAction}
      />
    </AdminMainAreaWrapper>
  );
};

export default ExamNotificationsPage;

export const ExamNotificationsPageRoute = (props) => (
  <Route {...props} component={ExamNotificationsPage} />
);
