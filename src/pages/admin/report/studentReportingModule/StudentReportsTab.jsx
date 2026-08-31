import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiMoreVertical } from "react-icons/fi";
import { ExportMenu } from "../../../../components";
import { pm2GetStudentReport } from "../../../../services";
import ReportDetailModal from "./ReportDetailModal";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const enrollmentBadge = {
  Active:      { bg: "#ECFDF3", color: "#027A48" },
  Enrolled:    { bg: "#EFF8FF", color: "#175CD3" },
  Completed:   { bg: "#F4F3FF", color: "#5925DC" },
  Deactivated: { bg: "#FEF3F2", color: "#B42318" },
};

const engagementBadge = {
  Active:    { bg: "#ECFDF3", color: "#027A48" },
  Irregular: { bg: "#FFFAEB", color: "#B54708" },
  Inactive:  { bg: "#FEF3F2", color: "#B42318" },
};

const StatusBadge = ({ value, map }) => {
  const cfg = map[value] ?? { bg: "#F2F4F7", color: "#344054" };
  return (
    <Badge bg={cfg.bg} color={cfg.color} borderRadius="full" px={2} py={0.5} fontSize="11px" fontWeight="500">
      {value ?? "—"}
    </Badge>
  );
};

const ScoreBadge = ({ score }) => {
  const color = score >= 70 ? "#027A48" : score >= 40 ? "#B54708" : "#B42318";
  const bg    = score >= 70 ? "#ECFDF3" : score >= 40 ? "#FFFAEB" : "#FEF3F2";
  return (
    <Badge bg={bg} color={color} borderRadius="full" px={2} py={0.5} fontSize="12px" fontWeight="700">
      {score}%
    </Badge>
  );
};

const LIMIT = 20;

const StudentReportsTab = () => {
  const toast = useToast();
  const detailModal = useDisclosure();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState("");
  const [engagementStatus, setEngagementStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / LIMIT) || 1;

  const fetchData = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        page: overrides.page ?? page,
        limit: LIMIT,
      };
      if (overrides.search   !== undefined ? overrides.search   : search)            params.search           = overrides.search   ?? search;
      if (overrides.enrollmentStatus !== undefined ? overrides.enrollmentStatus : enrollmentStatus) params.enrollmentStatus = overrides.enrollmentStatus ?? enrollmentStatus;
      if (overrides.engagementStatus !== undefined ? overrides.engagementStatus : engagementStatus) params.engagementStatus = overrides.engagementStatus ?? engagementStatus;
      if (overrides.startDate !== undefined ? overrides.startDate : startDate) params.startDate = overrides.startDate ?? startDate;
      if (overrides.endDate   !== undefined ? overrides.endDate   : endDate)   params.endDate   = overrides.endDate   ?? endDate;

      const result = await pm2GetStudentReport(params);
      setRows(result.reports ?? []);
      setTotalItems(result.total ?? 0);
    } catch (err) {
      toast({ status: "error", description: err.message || "Failed to load student reports", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [page, search, enrollmentStatus, engagementStatus, startDate, endDate, toast]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (field, value) => {
    setPage(1);
    if (field === "enrollmentStatus") { setEnrollmentStatus(value); fetchData({ enrollmentStatus: value, page: 1 }); }
    if (field === "engagementStatus") { setEngagementStatus(value); fetchData({ engagementStatus: value, page: 1 }); }
    if (field === "startDate")        { setStartDate(value);        fetchData({ startDate: value,        page: 1 }); }
    if (field === "endDate")          { setEndDate(value);          fetchData({ endDate: value,          page: 1 }); }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchData({ search: val, page: 1 });
  };

  const handleReset = () => {
    setSearch(""); setEnrollmentStatus(""); setEngagementStatus("");
    setStartDate(""); setEndDate(""); setPage(1);
    fetchData({ search: "", enrollmentStatus: "", engagementStatus: "", startDate: "", endDate: "", page: 1 });
  };

  const goToPage = (p) => {
    setPage(p);
    fetchData({ page: p });
  };

  const openDetail = (row) => {
    setSelected(row);
    detailModal.onOpen();
  };

  const hasFilters = search || enrollmentStatus || engagementStatus || startDate || endDate;

  const exportRows = [
    [
      "Report ID",
      "Student Name",
      "Email",
      "Department",
      "Enrollment Status",
      "Score",
      "Engagement",
      "Alert",
      "Last Active",
      "Days Inactive",
      "Generated By",
      "Generated On",
      "Remarks",
    ],
    ...rows.map((r) => [
      r.report_id,
      r.student_name,
      r.email,
      r.department,
      r.enrollment_status,
      r.participation_score,
      r.engagement_status,
      r.alert_triggered ? "Yes" : "No",
      fmtDate(r.last_active_date),
      r.days_since_active,
      r.generated_by,
      fmtDate(r.generated_at),
      r.remarks,
    ]),
  ];

  return (
    <Box>
      {/* Filter Bar */}
      <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflow="hidden" mb={4}>
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <HStack spacing={3} flexWrap="wrap">
              <InputGroup w="280px" size="sm">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="#667085" size={14} />
                </InputLeftElement>
                <Input
                  placeholder="Search by name, email, department…"
                  value={search}
                  onChange={handleSearch}
                  borderRadius="md"
                  fontSize="13px"
                />
              </InputGroup>

              <Select
                size="sm"
                w="170px"
                borderRadius="md"
                fontSize="13px"
                value={enrollmentStatus}
                onChange={(e) => applyFilter("enrollmentStatus", e.target.value)}
                placeholder="Enrollment Status"
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Deactivated">Deactivated</option>
              </Select>

              <Select
                size="sm"
                w="170px"
                borderRadius="md"
                fontSize="13px"
                value={engagementStatus}
                onChange={(e) => applyFilter("engagementStatus", e.target.value)}
                placeholder="Engagement"
              >
                <option value="Active">Active</option>
                <option value="Irregular">Irregular</option>
                <option value="Inactive">Inactive</option>
              </Select>

              <Input
                type="date"
                size="sm"
                w="145px"
                borderRadius="md"
                fontSize="13px"
                value={startDate}
                onChange={(e) => applyFilter("startDate", e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                size="sm"
                w="145px"
                borderRadius="md"
                fontSize="13px"
                value={endDate}
                onChange={(e) => applyFilter("endDate", e.target.value)}
                placeholder="End date"
              />

              {hasFilters && (
                <Text
                  fontSize="12px"
                  color="#660066"
                  cursor="pointer"
                  fontWeight="500"
                  onClick={handleReset}
                  _hover={{ textDecoration: "underline" }}
                >
                  Reset filters
                </Text>
              )}
            </HStack>
            {rows.length > 0 && (
              <ExportMenu
                rows={exportRows}
                filename="student-participation-report"
                title="Student Participation Report"
              />
            )}
          </Flex>
        </Box>

        {/* Table */}
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                {["Report ID", "Student Name", "Email", "Department", "Enroll. Status", "Score", "Engagement", "Alert", "Last Active", "Days Inactive", "Generated By", "Generated On", "Remarks"].map((h) => (
                  <Th key={h} textTransform="none" fontSize="12px" fontWeight="500" color="#475367" py={3} whiteSpace="nowrap">
                    {h}
                  </Th>
                ))}
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367" py={3}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={14} textAlign="center" py={12}><Spinner size="md" color="#660066" /></Td></Tr>
              ) : rows.length === 0 ? (
                <Tr><Td colSpan={14} textAlign="center" py={12} fontSize="13px" color="#667085">No records found.</Td></Tr>
              ) : (
                rows.map((r, i) => (
                  <Tr key={r.report_id ?? i} _hover={{ bg: "#FAFAFA" }}>
                    <Td fontSize="12px" color="#660066" fontWeight="600" whiteSpace="nowrap">{r.report_id ?? "—"}</Td>
                    <Td fontSize="13px" fontWeight="600" color="#101928" whiteSpace="nowrap">{r.student_name ?? "—"}</Td>
                    <Td fontSize="12px" color="#667085">{r.email ?? "—"}</Td>
                    <Td fontSize="12px" color="#344054">{r.department ?? "—"}</Td>
                    <Td><StatusBadge value={r.enrollment_status} map={enrollmentBadge} /></Td>
                    <Td><ScoreBadge score={r.participation_score ?? 0} /></Td>
                    <Td><StatusBadge value={r.engagement_status} map={engagementBadge} /></Td>
                    <Td>
                      <Badge
                        bg={r.alert_triggered ? "#FEF3F2" : "#F2F4F7"}
                        color={r.alert_triggered ? "#B42318" : "#344054"}
                        borderRadius="full" px={2} py={0.5} fontSize="11px"
                      >
                        {r.alert_triggered ? "Yes" : "No"}
                      </Badge>
                    </Td>
                    <Td fontSize="12px" color="#667085" whiteSpace="nowrap">{fmtDate(r.last_active_date)}</Td>
                    <Td fontSize="12px" color={r.days_since_active > 14 ? "#B42318" : "#344054"} fontWeight={r.days_since_active > 14 ? "600" : "400"}>
                      {r.days_since_active ?? "—"}
                    </Td>
                    <Td fontSize="12px" color="#667085">{r.generated_by ?? "—"}</Td>
                    <Td fontSize="12px" color="#667085" whiteSpace="nowrap">{fmtDate(r.generated_at)}</Td>
                    <Td fontSize="12px" color="#667085" maxW="200px">
                      <Box isTruncated title={r.remarks}>{r.remarks ?? "—"}</Box>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                          color="#98A2B3"
                          border="1px solid #E4E7EC"
                          borderRadius="md"
                          aria-label="Actions"
                        />
                        <MenuList>
                          <MenuItem fontSize="13px" onClick={() => openDetail(r)}>View Details</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex justify="space-between" align="center" p={4} borderTop="1px solid #F2F4F7">
          <HStack spacing={2}>
            <Text fontSize="13px" color="#344054">Rows per page</Text>
            <Text fontSize="13px" fontWeight="600" color="#344054">{LIMIT}</Text>
          </HStack>
          <HStack spacing={4}>
            <Text fontSize="13px" color="#344054">
              Showing <strong>{rows.length}</strong> of <strong>{totalItems}</strong> records
            </Text>
            <HStack spacing={1}>
              <IconButton
                icon={<FiChevronLeft />}
                size="sm"
                variant="ghost"
                isDisabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                aria-label="Previous page"
              />
              <Text fontSize="13px" fontWeight="600" minW="30px" textAlign="center">{page}</Text>
              <IconButton
                icon={<FiChevronRight />}
                size="sm"
                variant="ghost"
                isDisabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                aria-label="Next page"
              />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <ReportDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.onClose}
        report={selected}
        mode="tc08"
      />
    </Box>
  );
};

export default StudentReportsTab;
