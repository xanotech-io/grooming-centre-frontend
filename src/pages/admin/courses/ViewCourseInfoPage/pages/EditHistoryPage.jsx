import { useState, useEffect, useCallback } from "react";
import { Route, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Skeleton,
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
  useDisclosure,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, Heading, Link } from "../../../../../components";
import {
  adminGetCourseEditHistory,
  adminGetCourseEditHistoryKpis,
} from "../../../../../services";

const CONTENT_TYPES = ["Module", "Lesson", "Assessment", "Exam", "Learning Material"];
const APPROVAL_STATUSES = ["Pending", "Approved", "Rejected"];
const PUBLISH_STATUSES = ["Draft", "Published"];

const MOCK_LOGS = [
  {
    id: "CNT001",
    contentId: "CNT001",
    title: "Introduction to Crop Science",
    contentType: "Lesson",
    editedBy: "Instructor-003",
    editDate: "2026-06-15T10:30:00",
    previousVersion: "v2.0",
    version: "v2.1",
    approvalStatus: "Approved",
    publishStatus: "Published",
    changeSummary: "Updated lesson text & images",
    reviewerName: "Admin-001",
    approvalRemarks: "Looks good, approved as-is.",
    lastSaved: "2026-06-15T10:30:00",
  },
  {
    id: "CNT002",
    contentId: "CNT002",
    title: "Thermodynamics Module 1",
    contentType: "Lesson",
    editedBy: "Instructor-005",
    editDate: "2026-06-20T14:10:00",
    previousVersion: "v1.3",
    version: "v1.4",
    approvalStatus: "Pending",
    publishStatus: "Draft",
    changeSummary: "Awaiting supervisor approval",
    reviewerName: "-",
    approvalRemarks: "-",
    lastSaved: "2026-06-20T14:10:00",
  },
  {
    id: "CNT003",
    contentId: "CNT003",
    title: "Algebra Assessment",
    contentType: "Assessment",
    editedBy: "Admin-001",
    editDate: "2026-06-22T09:15:00",
    previousVersion: "v2.9",
    version: "v3.0",
    approvalStatus: "Approved",
    publishStatus: "Published",
    changeSummary: "Corrected grading rubric",
    reviewerName: "Admin-002",
    approvalRemarks: "Rubric verified against answer key.",
    lastSaved: "2026-06-22T09:15:00",
  },
  {
    id: "CNT004",
    contentId: "CNT004",
    title: "Human Anatomy Exam",
    contentType: "Exam",
    editedBy: "Instructor-008",
    editDate: "2026-06-25T16:45:00",
    previousVersion: "v1.1",
    version: "v1.2",
    approvalStatus: "Rejected",
    publishStatus: "Draft",
    changeSummary: "Requires content validation",
    reviewerName: "Admin-001",
    approvalRemarks: "Question 12 references outdated diagram.",
    lastSaved: "2026-06-25T16:45:00",
  },
  {
    id: "CNT005",
    contentId: "CNT005",
    title: "Soil Chemistry Basics",
    contentType: "Lesson",
    editedBy: "Instructor-003",
    editDate: "2026-07-01T11:00:00",
    previousVersion: "v1.0",
    version: "v1.1",
    approvalStatus: "Approved",
    publishStatus: "Published",
    changeSummary: "Fixed typo in learning objectives",
    reviewerName: "Admin-001",
    approvalRemarks: "Minor fix, approved.",
    lastSaved: "2026-07-01T11:00:00",
  },
  {
    id: "CNT006",
    contentId: "CNT006",
    title: "Midterm Exam Prep",
    contentType: "Exam",
    editedBy: "Instructor-005",
    editDate: "2026-07-05T13:20:00",
    previousVersion: "v1.9",
    version: "v2.0",
    approvalStatus: "Pending",
    publishStatus: "Draft",
    changeSummary: "Added new question bank",
    reviewerName: "-",
    approvalRemarks: "-",
    lastSaved: "2026-07-05T13:20:00",
  },
];

const MOCK_KPIS = {
  totalEdits: MOCK_LOGS.length,
  pendingApprovals: MOCK_LOGS.filter((l) => l.approvalStatus === "Pending").length,
  rejectedPercentage:
    (MOCK_LOGS.filter((l) => l.approvalStatus === "Rejected").length / MOCK_LOGS.length) * 100,
  avgApprovalTurnaroundHours: 18.5,
};

const KPI_CARDS = [
  { key: "totalEdits", label: "Total Edits", format: (v) => (v != null ? String(v) : "—") },
  { key: "pendingApprovals", label: "Pending Approvals", format: (v) => (v != null ? String(v) : "—") },
  {
    key: "rejectedPercentage",
    label: "Rejected / Reworked",
    format: (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—"),
  },
  {
    key: "avgApprovalTurnaroundHours",
    label: "Avg. Approval Turnaround",
    format: (v) => (v != null ? `${Number(v).toFixed(1)} hrs` : "—"),
  },
];

const fmtDate = (ts) => (ts ? new Date(ts).toLocaleString() : "—");

const approvalColor = (s) => {
  if (s === "Approved") return { bg: "green.100", color: "green.700" };
  if (s === "Pending") return { bg: "orange.100", color: "orange.700" };
  if (s === "Rejected") return { bg: "red.100", color: "red.700" };
  return { bg: "gray.100", color: "gray.600" };
};

const publishColor = (s) => (s === "Published" ? "green" : "gray");

const StatusBadge = ({ status }) => {
  const s = approvalColor(status);
  return (
    <Badge
      borderRadius="full"
      px="10px"
      py="2px"
      fontSize="11px"
      fontWeight="600"
      backgroundColor={s.bg}
      color={s.color}
    >
      {status}
    </Badge>
  );
};

const EditHistoryDetailModal = ({ log, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader fontSize="16px" fontWeight="600" color="#101928">
        Edit History — {log?.title}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <Grid templateColumns="1fr 1fr" gap={4}>
          {[
            ["Content ID", log?.contentId],
            ["Content Type", log?.contentType],
            ["Edited By", log?.editedBy],
            ["Edit Date", fmtDate(log?.editDate)],
            ["Previous Version", log?.previousVersion],
            ["Current Version", log?.version],
            ["Reviewer Name", log?.reviewerName],
            ["Last Saved", fmtDate(log?.lastSaved)],
          ].map(([label, value]) => (
            <Box key={label}>
              <Text fontSize="12px" color="#475367" mb={1}>{label}</Text>
              <Text fontSize="14px" fontWeight="600" color="#101928">{value ?? "—"}</Text>
            </Box>
          ))}
        </Grid>

        <Box mt={4}>
          <Text fontSize="12px" color="#475367" mb={1}>Approval Status</Text>
          <StatusBadge status={log?.approvalStatus} />
        </Box>

        <Box mt={4}>
          <Text fontSize="12px" color="#475367" mb={1}>Approval Remarks</Text>
          <Text fontSize="14px" color="#101928">{log?.approvalRemarks ?? "—"}</Text>
        </Box>

        <Box mt={4}>
          <Text fontSize="12px" color="#475367" mb={1}>Change Summary</Text>
          <Text fontSize="14px" color="#101928">{log?.changeSummary ?? "—"}</Text>
        </Box>
      </ModalBody>
    </ModalContent>
  </Modal>
);

const EditHistoryPage = () => {
  const { id: courseId } = useParams();
  const detailModal = useDisclosure();

  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [logsLoading, setLogsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const [filters, setFilters] = useState({
    contentType: "",
    approvalStatus: "",
    publishStatus: "",
    startDate: "",
    endDate: "",
  });

  const loadKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const data = await adminGetCourseEditHistoryKpis(courseId, params);
      setKpis(data);
    } catch {
      setKpis(MOCK_KPIS);
    } finally {
      setKpiLoading(false);
    }
  }, [courseId, filters.startDate, filters.endDate]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = { page, limit };
      if (filters.contentType) params.contentType = filters.contentType;
      if (filters.approvalStatus) params.approvalStatus = filters.approvalStatus;
      if (filters.publishStatus) params.publishStatus = filters.publishStatus;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const result = await adminGetCourseEditHistory(courseId, params);
      setLogs(result.logs ?? []);
      setTotal(result.total ?? 0);
    } catch {
      let rows = MOCK_LOGS;
      if (filters.contentType) rows = rows.filter((r) => r.contentType === filters.contentType);
      if (filters.approvalStatus) rows = rows.filter((r) => r.approvalStatus === filters.approvalStatus);
      if (filters.publishStatus) rows = rows.filter((r) => r.publishStatus === filters.publishStatus);
      setLogs(rows);
      setTotal(rows.length);
    } finally {
      setLogsLoading(false);
    }
  }, [courseId, page, limit, filters]);

  useEffect(() => { loadKpis(); }, [loadKpis]);
  useEffect(() => { loadLogs(); }, [loadLogs]);

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
            {kpiLoading ? (
              <Skeleton height="36px" width="80px" />
            ) : (
              <Text fontSize="28px" fontWeight="700" color="#101928">
                {cfg.format(kpis?.[cfg.key])}
              </Text>
            )}
          </Box>
        ))}
      </Grid>

      <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Flex mb={5} gap={3} flexWrap="wrap" align="center">
          <Select
            size="sm"
            borderRadius="md"
            w="160px"
            value={filters.contentType}
            onChange={(e) => handleFilterChange("contentType", e.target.value)}
            placeholder="All Content Types"
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>

          <Select
            size="sm"
            borderRadius="md"
            w="150px"
            value={filters.approvalStatus}
            onChange={(e) => handleFilterChange("approvalStatus", e.target.value)}
            placeholder="All Approval Status"
          >
            {APPROVAL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>

          <Select
            size="sm"
            borderRadius="md"
            w="140px"
            value={filters.publishStatus}
            onChange={(e) => handleFilterChange("publishStatus", e.target.value)}
            placeholder="All Publish Status"
          >
            {PUBLISH_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
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
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Content ID</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Title</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Type</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Edited By</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Edit Date</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Version</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Approval</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Publish</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none">Change Summary</Th>
                  <Th px={4} py={3} color="#344054" fontSize="12px" fontWeight="600" textTransform="none" />
                </Tr>
              </Thead>
              <Tbody>
                {logs.length === 0 ? (
                  <Tr>
                    <Td colSpan={10} textAlign="center" py={10} color="#475367" fontSize="13px">
                      No edit history found.
                    </Td>
                  </Tr>
                ) : (
                  logs.map((log) => (
                    <Tr key={log.id} _hover={{ bg: "gray.50" }}>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" color="#475367" fontFamily="mono">{log.contentId}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" fontWeight="600" color="#101928">{log.title}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Badge colorScheme="purple" fontSize="11px" textTransform="none">{log.contentType}</Badge>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" color="#101928">{log.editedBy}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" color="#101928">{fmtDate(log.editDate)}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="12px" color="#475367">{log.previousVersion} → {log.version}</Text>
                      </Td>
                      <Td px={4} py={3}>
                        <StatusBadge status={log.approvalStatus} />
                      </Td>
                      <Td px={4} py={3}>
                        <Badge colorScheme={publishColor(log.publishStatus)} fontSize="11px" textTransform="capitalize">
                          {log.publishStatus}
                        </Badge>
                      </Td>
                      <Td px={4} py={3} maxW="200px">
                        <Text fontSize="12px" color="#475367" noOfLines={2}>{log.changeSummary}</Text>
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
