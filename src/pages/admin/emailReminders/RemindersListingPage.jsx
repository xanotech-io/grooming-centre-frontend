import { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Button, Heading, Text, Breadcrumb, Link } from "../../../components";
import { DashboardMetricCard } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  cancelEmailReminder,
  getEmailReminderKpis,
  getEmailReminders,
  sendEmailReminderNow,
} from "../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";
import { FiMail, FiSend, FiEdit2, FiXCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import dayjs from "dayjs";

const STATUS_SCHEME = {
  pending: { bg: "#FFF5EA", color: "#DD6B20", label: "Pending" },
  sent: { bg: "#E6F4EA", color: "#38A169", label: "Sent" },
  failed: { bg: "#FED7D7", color: "#E53E3E", label: "Failed" },
  cancelled: { bg: "#F7FAFC", color: "#718096", label: "Cancelled" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_SCHEME[status] ?? { bg: "#F7FAFC", color: "#718096", label: status };
  return (
    <Badge bg={s.bg} color={s.color} px="8px" py="2px" borderRadius="6px" textTransform="none" fontSize="11px">
      {s.label}
    </Badge>
  );
};

const LIMIT = 15;

const RemindersListingPage = () => {
  const history = useHistory();
  const toast = useToast();

  const [reminders, setReminders] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const fetchKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const res = await getEmailReminderKpis();
      setKpis(res?.data ?? res);
    } catch {
      setKpis(null);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const res = await getEmailReminders(params);
      const d = res?.data ?? res;
      setReminders(Array.isArray(d) ? d : (d?.reminders ?? d?.data ?? []));
      setTotal(d?.total ?? d?.totalCount ?? 0);
    } catch {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);
  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const handleSendNow = async (reminderId) => {
    setActionLoading(reminderId + "_send");
    try {
      await sendEmailReminderNow(reminderId);
      toast({ title: "Reminder sent successfully", status: "success", duration: 3000, isClosable: true });
      fetchReminders();
      fetchKpis();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to send reminder", status: "error", duration: 4000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (reminderId) => {
    setActionLoading(reminderId + "_cancel");
    try {
      await cancelEmailReminder(reminderId);
      toast({ title: "Reminder cancelled", status: "info", duration: 3000, isClosable: true });
      fetchReminders();
      fetchKpis();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to cancel reminder", status: "error", duration: 4000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/reminders">Email Reminders</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap="8px">
          <Button secondary onClick={fetchReminders}>Refresh</Button>
          <Button leftIcon={<FiMail />} onClick={() => history.push("/admin/reminders/create")}>
            Create Reminder
          </Button>
        </Flex>
      </Box>

      <Heading as="h1" fontSize="heading.h3" mb={6}>Email Reminders</Heading>

      {/* KPI Cards */}
      {kpiLoading ? (
        <Flex justifyContent="center" py="24px"><Spinner size="md" color="#6b006b" /></Flex>
      ) : kpis ? (
        <Box display="flex" justifyContent="space-between" gridGap={4} mb={8} flexWrap="wrap">
          <DashboardMetricCard
            title="Total Sent"
            value={kpis.totalRemindersSent ?? "—"}
            change="reminders dispatched"
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Successful Deliveries"
            value={kpis.successfulDeliveries ?? "—"}
            change={`${kpis.deliverySuccessRate ?? 0}% success rate`}
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Failed Deliveries"
            value={kpis.failedDeliveries ?? "—"}
            change="delivery failures"
            changeColor="#E53E3E"
          />
          <DashboardMetricCard
            title="Open Rate"
            value={`${kpis.openRate ?? 0}%`}
            change="of sent emails opened"
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Click-Through Rate"
            value={`${kpis.clickThroughRate ?? 0}%`}
            change="of opened emails clicked"
            changeColor="#3182CE"
          />
        </Box>
      ) : null}

      {/* Filter */}
      <Flex gap="12px" mb={4} alignItems="center">
        <Select
          w="200px"
          size="sm"
          borderRadius="6px"
          bg="white"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Text fontSize="13px" color="gray.500">{total} total</Text>
      </Flex>

      {/* Table */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
        {loading ? (
          <Flex justifyContent="center" alignItems="center" py="60px">
            <Spinner size="lg" color="#6b006b" />
          </Flex>
        ) : reminders.length === 0 ? (
          <Flex direction="column" alignItems="center" py="60px" gap="10px">
            <FiMail size={32} color="#CBD5E0" />
            <Text color="gray.400" fontSize="14px">No reminders found</Text>
            <Button onClick={() => history.push("/admin/reminders/create")}>Create First Reminder</Button>
          </Flex>
        ) : (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Subject", "Recipient ID", "Scheduled Date", "Template", "Status", "Sent By", "Opens", "Clicks", "Actions"].map((h) => (
                    <Th key={h} py="12px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {reminders.map((r, i) => {
                  const id = r.reminderId ?? r.id ?? r._id;
                  const isPending = r.status === "pending";
                  const isFailed = r.status === "failed";
                  return (
                    <Tr key={id ?? i} _hover={{ bg: "#FAFAFA" }}>
                      <Td py="12px" maxW="220px">
                        <Text fontSize="13px" fontWeight="500" noOfLines={2}>{r.subject || "—"}</Text>
                      </Td>
                      <Td py="12px" fontSize="12px" color="gray.500" fontFamily="mono">
                        {r.recipientId ? r.recipientId.slice(0, 8) + "…" : "—"}
                      </Td>
                      <Td py="12px" fontSize="12px" whiteSpace="nowrap">
                        {r.scheduledDate ? dayjs(r.scheduledDate).format("DD/MM/YYYY HH:mm") : "—"}
                      </Td>
                      <Td py="12px" fontSize="12px">{r.templateName ?? r.templateUsed ?? "—"}</Td>
                      <Td py="12px"><StatusBadge status={r.status} /></Td>
                      <Td py="12px" fontSize="12px" color="gray.500">{r.sentBy ?? "—"}</Td>
                      <Td py="12px" fontSize="13px" fontWeight="600" color="#6b006b">{r.openCount ?? 0}</Td>
                      <Td py="12px" fontSize="13px" fontWeight="600" color="#3182CE">{r.clickCount ?? 0}</Td>
                      <Td py="12px">
                        <Flex gap="4px">
                          {isPending && (
                            <IconButton
                              aria-label="Edit reminder"
                              icon={<FiEdit2 size={12} />}
                              size="xs" variant="ghost" colorScheme="blue"
                              onClick={() => history.push(`/admin/reminders/edit?id=${id}`)}
                            />
                          )}
                          {(isPending || isFailed) && (
                            <IconButton
                              aria-label="Send now"
                              icon={<FiSend size={12} />}
                              size="xs" variant="ghost" colorScheme="green"
                              isLoading={actionLoading === id + "_send"}
                              onClick={() => handleSendNow(id)}
                            />
                          )}
                          {isPending && (
                            <IconButton
                              aria-label="Cancel reminder"
                              icon={<FiXCircle size={12} />}
                              size="xs" variant="ghost" colorScheme="red"
                              isLoading={actionLoading === id + "_cancel"}
                              onClick={() => handleCancel(id)}
                            />
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justifyContent="space-between" alignItems="center" px="20px" py="12px" borderTop="1px solid #E2E8F0">
            <Text fontSize="13px" color="gray.500">Page {page} of {totalPages}</Text>
            <Flex gap="8px">
              <IconButton
                icon={<FiChevronLeft />} size="sm" variant="outline"
                isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              />
              <IconButton
                icon={<FiChevronRight />} size="sm" variant="outline"
                isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              />
            </Flex>
          </Flex>
        )}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const RemindersListingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <RemindersListingPage {...props} />} />
);

export default RemindersListingPage;
