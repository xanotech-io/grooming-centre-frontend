import { useState, useEffect, useCallback, useMemo } from "react";
import { Route, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  Badge,
  Spinner,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  BreadcrumbItem,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiEye, FiAlertTriangle } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, Heading, Link } from "../../../../../components";
import { auditTrailV2GetLogs } from "../../../../../services";

const EVENT_TYPES = ["create", "update", "delete", "approve", "export", "view"];
const STATUSES = ["success", "failure"];

const fmtDate = (ts) => (ts ? new Date(ts).toLocaleString() : "—");

const fmtName = (user) =>
  user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "—" : "—";

const statusColor = (s) => {
  if (s === "success") return "green";
  if (s === "failure") return "red";
  return "gray";
};

const StatusBadge = ({ status }) => (
  <Badge
    borderRadius="full"
    px="10px"
    py="2px"
    fontSize="11px"
    fontWeight="600"
    colorScheme={statusColor(status)}
    textTransform="capitalize"
  >
    {status ?? "—"}
  </Badge>
);

const EditHistoryDetailModal = ({ log, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader fontSize="16px" fontWeight="600" color="#101928">
        Course History — {log?.contentTitle ?? log?.resourceType}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <Grid templateColumns="1fr 1fr" gap={4}>
          {[
            ["Event Type", log?.eventType],
            ["Module", log?.module],
            ["Resource Type", log?.resourceType],
            ["Resource ID", log?.resourceId ?? "—"],
            ["Performed By", fmtName(log?.user)],
            ["Role", log?.userRole],
            ["Timestamp", fmtDate(log?.timestamp)],
            ["IP Address", log?.ipAddress],
            ["Source", log?.source],
            ["Device", log?.device],
          ].map(([label, value]) => (
            <Box key={label}>
              <Text fontSize="12px" color="#475367" mb={1}>{label}</Text>
              <Text fontSize="14px" fontWeight="600" color="#101928" wordBreak="break-word">{value ?? "—"}</Text>
            </Box>
          ))}
        </Grid>

        <Box mt={4}>
          <Text fontSize="12px" color="#475367" mb={1}>Status</Text>
          <StatusBadge status={log?.status} />
        </Box>

        <Box mt={4}>
          <Text fontSize="12px" color="#475367" mb={1}>Remarks</Text>
          <Text fontSize="14px" color="#101928">{log?.remarks ?? "—"}</Text>
        </Box>
      </ModalBody>
    </ModalContent>
  </Modal>
);

const EditHistoryPage = () => {
  const { id: courseId } = useParams();
  const detailModal = useDisclosure();
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [logsLoading, setLogsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const [filters, setFilters] = useState({
    eventType: "",
    status: "",
    isFlagged: "",
    startDate: "",
    endDate: "",
  });

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = { courseId, page, limit };
      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.status) params.status = filters.status;
      if (filters.isFlagged !== "") params.isFlagged = filters.isFlagged === "true";
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const result = await auditTrailV2GetLogs(params);
      setLogs(result.logs ?? []);
      setTotal(result.total ?? 0);
    } catch {
      setLogs([]);
      setTotal(0);
      toast({ title: "Failed to load course history", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLogsLoading(false);
    }
  }, [courseId, page, limit, filters, toast]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const kpis = useMemo(() => {
    const failed = logs.filter((l) => l.status === "failure").length;
    const flagged = logs.filter((l) => l.isFlagged).length;
    const uniqueUsers = new Set(logs.map((l) => l.userId)).size;
    return { total, failed, flagged, uniqueUsers };
  }, [logs, total]);

  const KPI_CARDS = [
    { key: "total", label: "Total Events" },
    { key: "failed", label: "Failed Events (this page)" },
    { key: "flagged", label: "Flagged Events (this page)" },
    { key: "uniqueUsers", label: "Unique Users (this page)" },
  ];

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleView = (log) => {
    setSelectedLog(log);
    detailModal.onOpen();
  };

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/courses">Courses</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Edit History</Link>
          </BreadcrumbItem>
        }
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Edit History
        </Heading>
      </Flex>

      <Grid templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
        {KPI_CARDS.map((cfg) => (
          <Box
            key={cfg.key}
            p={6}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="sm"
          >
            <Text fontSize="14px" fontWeight="500" color="#475367" mb={2}>
              {cfg.label}
            </Text>
            <Text fontSize="28px" fontWeight="700" color="#101928">
              {kpis[cfg.key]}
            </Text>
          </Box>
        ))}
      </Grid>

      <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Flex mb={5} gap={3} flexWrap="wrap" align="center">
          <Select
            size="sm"
            borderRadius="md"
            w="150px"
            value={filters.eventType}
            onChange={(e) => handleFilterChange("eventType", e.target.value)}
            placeholder="All Events"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </Select>

          <Select
            size="sm"
            borderRadius="md"
            w="130px"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            placeholder="All Status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </Select>

          <Select
            size="sm"
            borderRadius="md"
            w="140px"
            value={filters.isFlagged}
            onChange={(e) => handleFilterChange("isFlagged", e.target.value)}
            placeholder="All Flags"
          >
            <option value="true">Flagged Only</option>
            <option value="false">Not Flagged</option>
          </Select>

          <Input
            size="sm"
            type="date"
            borderRadius="md"
            w="150px"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
          <Input
            size="sm"
            type="date"
            borderRadius="md"
            w="150px"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </Flex>

        <Box overflowX="auto">
          {logsLoading ? (
            <Flex justify="center" py={12}>
              <Spinner color="#660066" />
            </Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Content</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Event Type</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Module</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Performed By</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Role</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Timestamp</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Status</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Remarks</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none" />
                </Tr>
              </Thead>
              <Tbody>
                {logs.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={10} color="#475367" fontSize="13px">
                      No edit history found.
                    </Td>
                  </Tr>
                ) : (
                  logs.map((log) => (
                    <Tr key={log.id} _hover={{ bg: "gray.50" }}>
                      <Td px={4} py={3}>
                        <Flex align="center" gap={1}>
                          {log.isFlagged && (
                            <Tooltip label="Flagged / Suspicious" placement="top">
                              <Box color="orange.400"><FiAlertTriangle size={13} /></Box>
                            </Tooltip>
                          )}
                          <Text fontSize="12px" fontWeight="600" color="#101928">
                            {log.contentTitle ?? log.resourceType ?? "—"}
                          </Text>
                        </Flex>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" color="#101928" textTransform="capitalize">{log.eventType ?? "—"}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Badge colorScheme="purple" fontSize="11px" textTransform="none">{log.module ?? "—"}</Badge>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" fontWeight="600" color="#101928">{fmtName(log.user)}</Text>
                        <Text fontSize="11px" color="#475367">{log.user?.email ?? "—"}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" color="#101928" textTransform="capitalize">{log.userRole ?? "—"}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" color="#101928">{fmtDate(log.timestamp)}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <StatusBadge status={log.status} />
                      </Td>
                      <Td px={4} py={3} maxW="200px">
                        <Text fontSize="12px" color="#475367" noOfLines={2}>{log.remarks ?? "—"}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <IconButton
                          icon={<FiEye />}
                          variant="ghost"
                          size="sm"
                          aria-label="View details"
                          onClick={() => handleView(log)}
                        />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </Box>

        <Flex mt={5} align="center" justify="space-between" flexWrap="wrap" gap={2}>
          <HStack spacing={2}>
            <Text color="#475367" fontSize="13px">Rows per page</Text>
            <Select
              size="sm"
              w="70px"
              borderRadius="md"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </HStack>
          <HStack spacing={4}>
            <Text color="#475367" fontSize="13px">
              Showing {logs.length} of {total}
            </Text>
            <HStack spacing={1}>
              <IconButton
                icon={<FiChevronLeft />}
                variant="ghost"
                size="sm"
                aria-label="Previous page"
                isDisabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              />
              <Text fontSize="13px" fontWeight="600" color="#101928" px={2}>{page}</Text>
              <IconButton
                icon={<FiChevronRight />}
                variant="ghost"
                size="sm"
                aria-label="Next page"
                isDisabled={logs.length < limit}
                onClick={() => setPage((p) => p + 1)}
              />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <EditHistoryDetailModal log={selectedLog} isOpen={detailModal.isOpen} onClose={detailModal.onClose} />
    </AdminMainAreaWrapper>
  );
};

export const EditHistoryPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <EditHistoryPage {...props} />} />
  );
};

export default EditHistoryPageRoute;
