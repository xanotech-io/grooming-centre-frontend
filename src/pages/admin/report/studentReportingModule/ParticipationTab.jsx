import { useCallback, useEffect, useState } from "react";
import {
  Badge,
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
  SimpleGrid,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiMoreVertical } from "react-icons/fi";
import { pm2GetParticipationReport } from "../../../../services";
import ReportDetailModal from "./ReportDetailModal";
import InterventionModal from "./InterventionModal";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const engagementBadge = {
  Active:    { bg: "#ECFDF3", color: "#027A48" },
  Irregular: { bg: "#FFFAEB", color: "#B54708" },
  Inactive:  { bg: "#FEF3F2", color: "#B42318" },
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

const KPICard = ({ label, value, helpText, color }) => (
  <Box p={4} borderRadius="xl" border="1px solid #E4E7EC" bg="white" boxShadow="xs">
    <Stat>
      <StatLabel fontSize="12px" color="#667085">{label}</StatLabel>
      <StatNumber fontSize="22px" color={color ?? "#101928"}>{value ?? "—"}</StatNumber>
      {helpText && <StatHelpText fontSize="11px" mb={0}>{helpText}</StatHelpText>}
    </Stat>
  </Box>
);

const LIMIT = 20;

const ParticipationTab = () => {
  const toast = useToast();
  const detailModal = useDisclosure();
  const interventionModal = useDisclosure();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [engagementStatus, setEngagementStatus] = useState("");
  const [alertTriggered, setAlertTriggered] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / LIMIT) || 1;

  const fetchData = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const params = { page: overrides.page ?? page, limit: LIMIT };
      const s  = overrides.search           !== undefined ? overrides.search           : search;
      const es = overrides.engagementStatus !== undefined ? overrides.engagementStatus : engagementStatus;
      const at = overrides.alertTriggered   !== undefined ? overrides.alertTriggered   : alertTriggered;
      const sd = overrides.startDate        !== undefined ? overrides.startDate        : startDate;
      const ed = overrides.endDate          !== undefined ? overrides.endDate          : endDate;
      if (s)  params.search           = s;
      if (es) params.engagementStatus = es;
      if (at) params.alertTriggered   = at;
      if (sd) params.startDate        = sd;
      if (ed) params.endDate          = ed;

      const result = await pm2GetParticipationReport(params);
      setRows(result.records ?? []);
      setTotalItems(result.total ?? 0);
      if (result.kpis) setKpis(result.kpis);
    } catch (err) {
      toast({ status: "error", description: err.message || "Failed to load participation report", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [page, search, engagementStatus, alertTriggered, startDate, endDate, toast]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (field, value) => {
    setPage(1);
    const upd = { page: 1 };
    if (field === "engagementStatus") { setEngagementStatus(value); upd.engagementStatus = value; }
    if (field === "alertTriggered")   { setAlertTriggered(value);   upd.alertTriggered   = value; }
    if (field === "startDate")        { setStartDate(value);        upd.startDate        = value; }
    if (field === "endDate")          { setEndDate(value);          upd.endDate          = value; }
    fetchData(upd);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchData({ search: val, page: 1 });
  };

  const handleReset = () => {
    setSearch(""); setEngagementStatus(""); setAlertTriggered("");
    setStartDate(""); setEndDate(""); setPage(1);
    fetchData({ search: "", engagementStatus: "", alertTriggered: "", startDate: "", endDate: "", page: 1 });
  };

  const goToPage = (p) => { setPage(p); fetchData({ page: p }); };

  const openDetail = (row) => { setSelected(row); detailModal.onOpen(); };
  const openIntervention = (row) => { setSelected(row); interventionModal.onOpen(); };

  const hasFilters = search || engagementStatus || alertTriggered || startDate || endDate;

  return (
    <Box>
      {/* KPI Cards */}
      {kpis && (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
          <KPICard label="Total Students"    value={kpis.total_students}           color="#660066" />
          <KPICard label="Avg. Score"        value={kpis.average_participation_rate != null ? `${kpis.average_participation_rate}%` : null} color="#175CD3" />
          <KPICard label="Active"            value={kpis.active_students}          helpText={`${kpis.active_percentage ?? 0}%`}    color="#027A48" />
          <KPICard label="Irregular"         value={kpis.irregular_students}       helpText={`${kpis.irregular_percentage ?? 0}%`} color="#B54708" />
          <KPICard label="Inactive"          value={kpis.inactive_students}        helpText={`${kpis.inactive_percentage ?? 0}%`}  color="#B42318" />
          <KPICard label="Alerts Triggered"  value={kpis.alerts_triggered}         helpText={`${kpis.alerts_triggered_percentage ?? 0}%`} color="#B42318" />
        </SimpleGrid>
      )}

      {/* Table Card */}
      <Box bg="white" border="1px solid #E4E7EC" borderRadius="xl" overflow="hidden">
        {/* Filter Bar */}
        <Box p={4} borderBottom="1px solid #F2F4F7">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <HStack spacing={3} flexWrap="wrap">
              <InputGroup w="260px" size="sm">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="#667085" size={14} />
                </InputLeftElement>
                <Input
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={handleSearch}
                  borderRadius="md"
                  fontSize="13px"
                />
              </InputGroup>

              <Select
                size="sm" w="160px" borderRadius="md" fontSize="13px"
                value={engagementStatus}
                onChange={(e) => applyFilter("engagementStatus", e.target.value)}
                placeholder="Engagement"
              >
                <option value="Active">Active</option>
                <option value="Irregular">Irregular</option>
                <option value="Inactive">Inactive</option>
              </Select>

              <Select
                size="sm" w="140px" borderRadius="md" fontSize="13px"
                value={alertTriggered}
                onChange={(e) => applyFilter("alertTriggered", e.target.value)}
                placeholder="Alert"
              >
                <option value="true">Alerts Only</option>
                <option value="false">No Alert</option>
              </Select>

              <Input type="date" size="sm" w="140px" borderRadius="md" fontSize="13px"
                value={startDate} onChange={(e) => applyFilter("startDate", e.target.value)} />
              <Input type="date" size="sm" w="140px" borderRadius="md" fontSize="13px"
                value={endDate} onChange={(e) => applyFilter("endDate", e.target.value)} />

              {hasFilters && (
                <Text fontSize="12px" color="#660066" cursor="pointer" fontWeight="500"
                  onClick={handleReset} _hover={{ textDecoration: "underline" }}>
                  Reset filters
                </Text>
              )}
            </HStack>
          </Flex>
        </Box>

        {/* Table */}
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="#F9FAFB">
              <Tr>
                {[
                  "Student Name", "Email", "Score", "Activity", "Frequency",
                  "Logins", "Quizzes", "Forum", "Assignments",
                  "Last Active", "Days Inactive", "Status", "Alert", "Remarks"
                ].map((h) => (
                  <Th key={h} textTransform="none" fontSize="12px" fontWeight="500"
                    color="#475367" py={3} whiteSpace="nowrap">{h}</Th>
                ))}
                <Th textTransform="none" fontSize="12px" fontWeight="500" color="#475367" py={3}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={15} textAlign="center" py={12}><Spinner size="md" color="#660066" /></Td></Tr>
              ) : rows.length === 0 ? (
                <Tr><Td colSpan={15} textAlign="center" py={12} fontSize="13px" color="#667085">No participation records found.</Td></Tr>
              ) : (
                rows.map((r, i) => (
                  <Tr key={r.student_id ?? i} _hover={{ bg: "#FAFAFA" }}>
                    <Td fontSize="13px" fontWeight="600" color="#101928" whiteSpace="nowrap">{r.student_name ?? "—"}</Td>
                    <Td fontSize="12px" color="#667085">{r.student_email ?? "—"}</Td>
                    <Td><ScoreBadge score={r.participation_score ?? 0} /></Td>
                    <Td fontSize="12px" color="#344054">
                      {Array.isArray(r.activity_type) ? r.activity_type.join(", ") : r.activity_type ?? "—"}
                    </Td>
                    <Td fontSize="12px" color="#344054" textAlign="center">{r.frequency_of_access ?? 0}</Td>
                    <Td fontSize="12px" color="#175CD3" fontWeight="600" textAlign="center">{r.login_count ?? 0}</Td>
                    <Td fontSize="12px" color="#5925DC" fontWeight="600" textAlign="center">{r.quiz_count ?? 0}</Td>
                    <Td fontSize="12px" color="#027A48" fontWeight="600" textAlign="center">{r.forum_count ?? 0}</Td>
                    <Td fontSize="12px" color="#B54708" fontWeight="600" textAlign="center">{r.assignment_count ?? 0}</Td>
                    <Td fontSize="12px" color="#667085" whiteSpace="nowrap">{fmtDate(r.last_active_date)}</Td>
                    <Td fontSize="12px" color={r.days_since_active > 14 ? "#B42318" : "#344054"}
                      fontWeight={r.days_since_active > 14 ? "700" : "400"} textAlign="center">
                      {r.days_since_active ?? "—"}
                    </Td>
                    <Td>
                      <Badge
                        bg={engagementBadge[r.engagement_status]?.bg ?? "#F2F4F7"}
                        color={engagementBadge[r.engagement_status]?.color ?? "#344054"}
                        borderRadius="full" px={2} py={0.5} fontSize="11px" fontWeight="500"
                      >
                        {r.engagement_status ?? "—"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        bg={r.alert_triggered ? "#FEF3F2" : "#F2F4F7"}
                        color={r.alert_triggered ? "#B42318" : "#344054"}
                        borderRadius="full" px={2} py={0.5} fontSize="11px"
                      >
                        {r.alert_triggered ? "Yes" : "No"}
                      </Badge>
                    </Td>
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
                          <MenuItem fontSize="13px" onClick={() => openIntervention(r)}>Log Intervention</MenuItem>
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
              <IconButton icon={<FiChevronLeft />} size="sm" variant="ghost"
                isDisabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Previous page" />
              <Text fontSize="13px" fontWeight="600" minW="30px" textAlign="center">{page}</Text>
              <IconButton icon={<FiChevronRight />} size="sm" variant="ghost"
                isDisabled={page >= totalPages} onClick={() => goToPage(page + 1)} aria-label="Next page" />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <ReportDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.onClose}
        report={selected}
        mode="tc04"
      />

      <InterventionModal
        isOpen={interventionModal.isOpen}
        onClose={interventionModal.onClose}
        student={selected}
        onSuccess={() => fetchData()}
      />
    </Box>
  );
};

export default ParticipationTab;
