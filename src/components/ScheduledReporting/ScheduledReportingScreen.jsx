import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Switch,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Spinner,
  useDisclosure,
  useToast,
  Tooltip,
  Tag,
  TagLabel,
  TagCloseButton,
  Divider,
  Center,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiRefreshCw,
  FiFileText,
  FiList,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  tc20ListSchedules,
  tc20GetScheduleKPIs,
  tc20CreateSchedule,
  tc20DeleteSchedule,
  tc20UpdateScheduleStatus,
  tc20GetScheduleLogs,
} from "../../services/http/endpoints/scheduledReporting";

// ---------------------------------------------------------------------------
// Small reusable sub-components
// ---------------------------------------------------------------------------

const KPICard = ({ label, value, sub, subColor = "#12B76A", icon: Icon, iconBg = "#F9F5FF" }) => (
  <Box bg="white" p={5} borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm">
    <Flex justify="space-between" align="flex-start">
      <Box>
        <Text fontSize="13px" fontWeight="500" color="#667185" mb={2}>{label}</Text>
        <Text fontSize="26px" fontWeight="700" color="#101928" lineHeight="1">{value}</Text>
        {sub && (
          <Text mt={1} fontSize="12px" fontWeight="500" color={subColor}>{sub}</Text>
        )}
      </Box>
      {Icon && (
        <Flex w="40px" h="40px" bg={iconBg} borderRadius="lg" align="center" justify="center" flexShrink={0}>
          <Icon size={18} color="#660066" />
        </Flex>
      )}
    </Flex>
  </Box>
);

const StatusBadge = ({ status }) => {
  const map = {
    active:    { label: "Active",    bg: "#ECFDF3", color: "#027A48" },
    inactive:  { label: "Inactive",  bg: "#F2F4F7", color: "#667185" },
    success:   { label: "Success",   bg: "#ECFDF3", color: "#027A48" },
    delivered: { label: "Delivered", bg: "#ECFDF3", color: "#027A48" },
    failed:    { label: "Failed",    bg: "#FEF3F2", color: "#B42318" },
    pending:   { label: "Pending",   bg: "#FFFAEB", color: "#B54708" },
    running:   { label: "Running",   bg: "#EFF8FF", color: "#175CD3" },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return (
    <Badge px={2} py={1} borderRadius="full" bg={s.bg} color={s.color} fontSize="12px" fontWeight="500" textTransform="none">
      {s.label}
    </Badge>
  );
};

const FrequencyBadge = ({ frequency }) => {
  const map = {
    daily:   { label: "Daily",   bg: "#EFF8FF", color: "#175CD3" },
    weekly:  { label: "Weekly",  bg: "#F9F5FF", color: "#6941C6" },
    monthly: { label: "Monthly", bg: "#FDF2FA", color: "#C11574" },
  };
  const f = map[frequency?.toLowerCase()] || { label: frequency || "—", bg: "#F2F4F7", color: "#667185" };
  return (
    <Badge px={2} py={1} borderRadius="full" bg={f.bg} color={f.color} fontSize="12px" fontWeight="500" textTransform="capitalize">
      {f.label}
    </Badge>
  );
};

const DeliveryBadge = ({ method }) => {
  const icons = { email: "✉", dashboard: "📊", export: "📤", download: "⬇" };
  const icon = icons[method?.toLowerCase()] || "📋";
  return (
    <HStack spacing={1}>
      <Text fontSize="13px">{icon}</Text>
      <Text fontSize="13px" color="#344054" textTransform="capitalize">{method || "—"}</Text>
    </HStack>
  );
};

const EmptyRow = ({ colSpan, message = "No records found" }) => (
  <Tr>
    <Td colSpan={colSpan} py={12}>
      <Center flexDir="column" gap={2}>
        <FiList size={28} color="#D0D5DD" />
        <Text fontSize="14px" color="#667185">{message}</Text>
      </Center>
    </Td>
  </Tr>
);

const SectionLabel = ({ children }) => (
  <Text fontSize="11px" fontWeight="600" color="#667185" textTransform="uppercase" letterSpacing="0.6px" mb={3}>
    {children}
  </Text>
);

// ---------------------------------------------------------------------------
// Step indicator for the wizard modal
// ---------------------------------------------------------------------------
const WizardSteps = ({ step }) => {
  const steps = ["Select Report", "Schedule Config", "Delivery Setup"];
  return (
    <HStack spacing={0} mb={6}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <Flex key={num} flex={1} align="center">
            <Flex align="center" gap={2} flex={1}>
              <Flex
                w="28px" h="28px" borderRadius="full" flexShrink={0}
                bg={done ? "#660066" : active ? "#660066" : "#F2F4F7"}
                color={done || active ? "white" : "#667185"}
                align="center" justify="center" fontSize="12px" fontWeight="700"
              >
                {done ? "✓" : num}
              </Flex>
              <Text fontSize="12px" fontWeight={active ? "600" : "400"} color={active ? "#101928" : "#667185"}>
                {label}
              </Text>
            </Flex>
            {i < steps.length - 1 && (
              <Box h="1px" flex={1} bg={done ? "#660066" : "#E4E7EC"} mx={2} />
            )}
          </Flex>
        );
      })}
    </HStack>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const ScheduledReportingScreen = () => {
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isLogsOpen, onOpen: onLogsOpen, onClose: onLogsClose } = useDisclosure();

  // Data state
  const [schedules, setSchedules] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Table filters
  const [searchQuery, setSearchQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [form, setForm] = useState({
    scheduleName: "",
    reportName: "",
    reportCategory: "",
    frequency: "",
    dayOfWeek: "",
    dayOfMonth: "",
    time: "08:00",
    startDate: "",
    reportFormat: "pdf",
    deliveryMethod: "email",
  });
  const [recipients, setRecipients] = useState([]);
  const [recipientInput, setRecipientInput] = useState("");

  // ---------------------------------------------------------------------------
  // Data loaders
  // ---------------------------------------------------------------------------
  const loadSchedules = useCallback(async () => {
    setLoading(true);
    const { schedules: data, isMock } = await tc20ListSchedules();
    setSchedules(data);
    setLoading(false);
    if (isMock) {
      toast({ description: "Showing demo schedule data (API unavailable).", status: "info", position: "top", duration: 3000, isClosable: true });
    }
  }, [toast]);

  const loadKPIs = useCallback(async () => {
    setKpiLoading(true);
    const { kpis: data } = await tc20GetScheduleKPIs();
    setKpis(data);
    setKpiLoading(false);
  }, []);

  const loadScheduleLogs = useCallback(async (scheduleId) => {
    setLogsLoading(true);
    setExecutionLogs([]);
    try {
      const { logs } = await tc20GetScheduleLogs(scheduleId);
      setExecutionLogs(logs);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to load execution logs.", status: "error", position: "top", duration: 3000, isClosable: true });
    } finally {
      setLogsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadSchedules(); loadKPIs(); }, [loadSchedules, loadKPIs]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleToggleStatus = async (schedule) => {
    const newStatus = schedule.status === "active" ? "inactive" : "active";
    setTogglingId(schedule.scheduleId);
    const { message, isMock } = await tc20UpdateScheduleStatus(schedule.scheduleId, newStatus);
    setSchedules((prev) =>
      prev.map((s) => s.scheduleId === schedule.scheduleId ? { ...s, status: newStatus } : s)
    );
    toast({ description: message, status: isMock ? "info" : "success", position: "top", duration: 2500, isClosable: true });
    setTogglingId(null);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    setDeletingId(scheduleId);
    const { message, isMock } = await tc20DeleteSchedule(scheduleId);
    setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
    toast({ description: message, status: isMock ? "info" : "success", position: "top", duration: 2500, isClosable: true });
    setDeletingId(null);
  };

  const handleViewLogs = (schedule) => {
    setSelectedSchedule(schedule);
    loadScheduleLogs(schedule.scheduleId);
    onLogsOpen();
  };

  const handleAddRecipient = () => {
    const email = recipientInput.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({ description: "Please enter a valid email address.", status: "warning", position: "top", duration: 2000 });
      return;
    }
    if (!recipients.includes(email)) setRecipients((r) => [...r, email]);
    setRecipientInput("");
  };

  const handleNextStep = () => {
    if (wizardStep === 1 && !form.scheduleName.trim()) {
      toast({ description: "Please enter a schedule name.", status: "warning", position: "top" });
      return;
    }
    if (wizardStep === 1 && !form.reportName.trim()) {
      toast({ description: "Please enter a report name.", status: "warning", position: "top" });
      return;
    }
    if (wizardStep === 1 && !form.reportCategory) {
      toast({ description: "Please select a report category.", status: "warning", position: "top" });
      return;
    }
    if (wizardStep === 2) {
      if (!form.frequency) {
        toast({ description: "Please select a frequency.", status: "warning", position: "top" });
        return;
      }
      if (!form.startDate) {
        toast({ description: "Please select a start date.", status: "warning", position: "top" });
        return;
      }
    }
    setWizardStep((s) => Math.min(s + 1, 3));
  };

  const handlePrevStep = () => setWizardStep((s) => Math.max(s - 1, 1));

  const handleCreateModalClose = () => {
    onCreateClose();
    setWizardStep(1);
    setForm({ scheduleName: "", reportName: "", reportCategory: "", frequency: "", dayOfWeek: "", dayOfMonth: "", time: "08:00", startDate: "", reportFormat: "pdf", deliveryMethod: "email" });
    setRecipients([]);
    setRecipientInput("");
  };

  const handleSaveSchedule = async () => {
    if (form.deliveryMethod === "email" && recipients.length === 0) {
      toast({ description: "Add at least one email recipient.", status: "warning", position: "top" });
      return;
    }
    setSaving(true);
    const body = { ...form, recipientEmails: recipients };
    const { schedule, message, isMock } = await tc20CreateSchedule(body);
    if (schedule) {
      setSchedules((prev) => [{ ...schedule, status: "active" }, ...prev]);
    }
    toast({ description: message, status: isMock ? "info" : "success", position: "top", duration: 3000, isClosable: true });
    setSaving(false);
    handleCreateModalClose();
  };

  // ---------------------------------------------------------------------------
  // Derived / filtered data
  // ---------------------------------------------------------------------------
  const filteredSchedules = schedules.filter((s) => {
    const matchSearch = !searchQuery || s.reportName?.toLowerCase().includes(searchQuery.toLowerCase()) || s.scheduleId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFreq = frequencyFilter === "all" || s.frequency === frequencyFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchFreq && matchStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return dateStr; }
  };

  // ---------------------------------------------------------------------------
  // Wizard step content
  // ---------------------------------------------------------------------------
  const renderWizardStep1 = () => (
    <VStack spacing={5} align="stretch">
      <SectionLabel>Step 1: Select a Report</SectionLabel>
      <FormControl isRequired>
        <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Schedule Name</FormLabel>
        <Input
          placeholder="Enter schedule name"
          size="md" borderRadius="md" fontSize="14px"
          value={form.scheduleName}
          onChange={(e) => setForm((f) => ({ ...f, scheduleName: e.target.value }))}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Report Name</FormLabel>
        <Input
          placeholder="Enter report name"
          size="md" borderRadius="md" fontSize="14px"
          value={form.reportName}
          onChange={(e) => setForm((f) => ({ ...f, reportName: e.target.value }))}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Report Category</FormLabel>
        <Select
          placeholder="— Select category —"
          size="md" borderRadius="md" fontSize="14px"
          value={form.reportCategory}
          onChange={(e) => setForm((f) => ({ ...f, reportCategory: e.target.value }))}
        >
          <option value="academic">Academic</option>
          <option value="administrative">Administrative</option>
          <option value="compliance">Compliance</option>
        </Select>
      </FormControl>
    </VStack>
  );

  const renderWizardStep2 = () => (
    <VStack spacing={5} align="stretch">
      <SectionLabel>Step 2: Configure Schedule</SectionLabel>
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem colSpan={2}>
          <FormControl isRequired>
            <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Frequency</FormLabel>
            <Select
              placeholder="Select frequency"
              size="md" borderRadius="md" fontSize="14px"
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value, dayOfWeek: "", dayOfMonth: "" }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </FormControl>
        </GridItem>

        {form.frequency === "weekly" && (
          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Day of Week</FormLabel>
              <Select size="md" borderRadius="md" fontSize="14px" value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d) => (
                  <option key={d} value={d.toLowerCase()}>{d}</option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
        )}

        {form.frequency === "monthly" && (
          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Day of Month</FormLabel>
              <Select size="md" borderRadius="md" fontSize="14px" value={form.dayOfMonth} onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: e.target.value }))}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
        )}

        <GridItem>
          <FormControl isRequired>
            <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Start Date</FormLabel>
            <Input type="date" size="md" borderRadius="md" fontSize="14px" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Time</FormLabel>
            <Input type="time" size="md" borderRadius="md" fontSize="14px" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl>
            <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Report Format</FormLabel>
            <Select size="md" borderRadius="md" fontSize="14px" value={form.reportFormat} onChange={(e) => setForm((f) => ({ ...f, reportFormat: e.target.value }))}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </Select>
          </FormControl>
        </GridItem>
      </Grid>
    </VStack>
  );

  const renderWizardStep3 = () => (
    <VStack spacing={5} align="stretch">
      <SectionLabel>Step 3: Delivery Configuration</SectionLabel>
      <FormControl isRequired>
        <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Delivery Method</FormLabel>
        <Select size="md" borderRadius="md" fontSize="14px" value={form.deliveryMethod} onChange={(e) => setForm((f) => ({ ...f, deliveryMethod: e.target.value }))}>
          <option value="email">Email</option>
          <option value="dashboard">Dashboard</option>
          <option value="export">Export / Download</option>
        </Select>
      </FormControl>

      {form.deliveryMethod === "email" && (
        <FormControl isRequired>
          <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>
            Recipients <Text as="span" color="#F04438">*</Text>
          </FormLabel>
          <HStack mb={2}>
            <Input
              placeholder="name@organisation.com"
              size="md" borderRadius="md" fontSize="14px"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddRecipient(); } }}
            />
            <Button
              onClick={handleAddRecipient}
              bg="#660066" color="white" _hover={{ bg: "#550055" }}
              fontSize="13px" fontWeight="600" borderRadius="md" h="40px" px={4} flexShrink={0}
            >
              Add
            </Button>
          </HStack>
          {recipients.length > 0 && (
            <Flex wrap="wrap" gap={2} mt={2}>
              {recipients.map((email) => (
                <Tag key={email} size="md" borderRadius="full" variant="solid" bg="#F9F5FF" color="#6941C6" border="1px solid #E9D7FE">
                  <FiMail size={11} style={{ marginRight: 4 }} />
                  <TagLabel fontSize="12px">{email}</TagLabel>
                  <TagCloseButton onClick={() => setRecipients((r) => r.filter((e) => e !== email))} />
                </Tag>
              ))}
            </Flex>
          )}
        </FormControl>
      )}

      {/* Summary */}
      <Divider />
      <Box bg="#F9FAFB" borderRadius="lg" p={4}>
        <SectionLabel>Schedule Summary</SectionLabel>
        <VStack align="stretch" spacing={2}>
          {[
            ["Schedule Name", form.scheduleName],
            ["Report Name", form.reportName],
            ["Category", form.reportCategory ? form.reportCategory.charAt(0).toUpperCase() + form.reportCategory.slice(1) : "—"],
            ["Frequency", form.frequency ? form.frequency.charAt(0).toUpperCase() + form.frequency.slice(1) : "—"],
            ["Start Date", form.startDate ? formatDate(form.startDate) : "—"],
            ["Time", form.time],
            ["Format", form.reportFormat],
            ["Delivery", form.deliveryMethod],
          ].map(([k, v]) => (
            <Flex key={k} justify="space-between">
              <Text fontSize="13px" color="#667185">{k}</Text>
              <Text fontSize="13px" fontWeight="500" color="#101928" textTransform="capitalize">{v || "—"}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>
    </VStack>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box>
      {/* Page header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="20px" fontWeight="700" color="#101928">Scheduled Reporting</Text>
          <Text fontSize="14px" color="#667185" mt={1}>Automate and manage recurring report generation & delivery</Text>
        </Box>
        <HStack spacing={3}>
          <Tooltip label="Refresh" hasArrow>
            <IconButton
              aria-label="Refresh"
              icon={<FiRefreshCw size={16} />}
              variant="outline"
              borderColor="#D0D5DD"
              color="#344054"
              borderRadius="md"
              h="40px" w="40px"
              onClick={() => { loadSchedules(); loadKPIs(); }}
            />
          </Tooltip>
          <Button
            leftIcon={<FiPlus size={16} />}
            bg="#660066" color="white"
            _hover={{ bg: "#550055" }}
            fontSize="14px" fontWeight="600"
            borderRadius="md" h="40px" px={5}
            onClick={onCreateOpen}
          >
            Create Schedule
          </Button>
        </HStack>
      </Flex>

      {/* KPI cards */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
        {kpiLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} bg="white" p={5} borderRadius="xl" border="1px solid #F2F4F7" h="90px">
              <Spinner size="sm" color="#660066" />
            </Box>
          ))
        ) : (
          <>
            <KPICard label="Total Schedules"   value={loading ? "—" : schedules.length}                                  sub="All created"       icon={FiList}        iconBg="#F9F5FF" />
            <KPICard label="Active Schedules"  value={loading ? "—" : schedules.filter((s) => s.status === "active").length} sub="Currently running" icon={FiCheckCircle} iconBg="#ECFDF3" />
            <KPICard label="Automation Rate"   value={kpis?.automationRate != null ? `${kpis.automationRate}%` : "—"}   sub="Reports automated" icon={FiRefreshCw}   iconBg="#ECFDF3" />
            <KPICard label="Reports Generated" value={kpis?.reportsGenerated ?? "—"}                                    sub="All time"          icon={FiFileText}    iconBg="#FFFAEB" />
            <KPICard label="Avg Generation"    value={kpis?.avgGenerationTime ?? "—"}                                   sub="Per report"        icon={FiClock}       iconBg="#EFF8FF" />
            <KPICard label="Utilization Rate"  value={kpis?.utilizationRate != null ? `${kpis.utilizationRate}%` : "—"} sub="Reports viewed"    icon={FiCalendar}    iconBg="#FDF2FA" />
          </>
        )}
      </SimpleGrid>

      {/* Schedules table — click a row to view that schedule's execution logs */}
      <Box bg="white" borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm" overflow="hidden">
            <Box>
              {/* Filters row */}
              <Flex px={6} py={4} gap={3} wrap="wrap" borderBottom="1px solid #F2F4F7">
                <InputGroup maxW="260px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch size={16} color="#667185" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search schedules…"
                    fontSize="14px" size="md" borderRadius="md" borderColor="#D0D5DD"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                <Select
                  maxW="150px" size="md" borderRadius="md" fontSize="14px" borderColor="#D0D5DD"
                  value={frequencyFilter}
                  onChange={(e) => setFrequencyFilter(e.target.value)}
                >
                  <option value="all">All Frequencies</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
                <Select
                  maxW="140px" size="md" borderRadius="md" fontSize="14px" borderColor="#D0D5DD"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
                <Text ml="auto" fontSize="13px" color="#667185" alignSelf="center">
                  {filteredSchedules.length} record{filteredSchedules.length !== 1 ? "s" : ""}
                </Text>
              </Flex>

              {/* Table */}
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#F9FAFB">
                    <Tr>
                      {["Schedule ID","Report Name","Frequency","Next Run","Status","Delivery","Last Run","Last Status","Actions"].map((h) => (
                        <Th key={h} fontSize="11px" fontWeight="600" color="#667185" textTransform="uppercase" letterSpacing="0.5px" py={3} px={4} whiteSpace="nowrap">
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading ? (
                      <Tr><Td colSpan={9} py={12}><Center><Spinner color="#660066" /></Center></Td></Tr>
                    ) : filteredSchedules.length === 0 ? (
                      <EmptyRow colSpan={9} message="No schedules found" />
                    ) : (
                      filteredSchedules.map((s) => (
                        <Tr key={s.scheduleId} _hover={{ bg: "#FAFAFA" }} borderBottom="1px solid #F2F4F7" cursor="pointer" onClick={() => handleViewLogs(s)}>
                          <Td px={4} py={3}>
                            <Text fontSize="13px" fontWeight="500" color="#660066">{s.scheduleId}</Text>
                          </Td>
                          <Td px={4} py={3} maxW="200px">
                            <Text fontSize="13px" color="#101928" noOfLines={1}>{s.reportName}</Text>
                          </Td>
                          <Td px={4} py={3}><FrequencyBadge frequency={s.frequency} /></Td>
                          <Td px={4} py={3}>
                            <Text fontSize="13px" color="#344054" whiteSpace="nowrap">{formatDate(s.nextRunDate)}</Text>
                          </Td>
                          <Td px={4} py={3} onClick={(e) => e.stopPropagation()}>
                            <HStack spacing={2}>
                              <Switch
                                isChecked={s.status === "active"}
                                isDisabled={togglingId === s.scheduleId}
                                colorScheme="purple"
                                size="sm"
                                onChange={() => handleToggleStatus(s)}
                              />
                              <StatusBadge status={s.status} />
                            </HStack>
                          </Td>
                          <Td px={4} py={3}><DeliveryBadge method={s.deliveryMethod} /></Td>
                          <Td px={4} py={3}>
                            <Text fontSize="13px" color="#344054" whiteSpace="nowrap">{formatDate(s.lastRunDate)}</Text>
                          </Td>
                          <Td px={4} py={3}><StatusBadge status={s.lastDeliveryStatus} /></Td>
                          <Td px={4} py={3} onClick={(e) => e.stopPropagation()}>
                            <HStack spacing={1}>
                              <Tooltip label="View Logs" hasArrow>
                                <IconButton
                                  aria-label="View logs"
                                  icon={<FiList size={14} />}
                                  size="xs" variant="ghost" color="#667185"
                                  _hover={{ color: "#660066", bg: "#F9F5FF" }}
                                  onClick={() => handleViewLogs(s)}
                                />
                              </Tooltip>
                              <Tooltip label="Delete Schedule" hasArrow>
                                <IconButton
                                  aria-label="Delete"
                                  icon={<FiTrash2 size={14} />}
                                  size="xs" variant="ghost" color="#667185"
                                  _hover={{ color: "#F04438", bg: "#FEF3F2" }}
                                  isLoading={deletingId === s.scheduleId}
                                  onClick={() => handleDeleteSchedule(s.scheduleId)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Box>

      </Box>

      {/* ── Create Schedule Modal (3-step wizard) ── */}
      <Modal isOpen={isCreateOpen} onClose={handleCreateModalClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalHeader fontSize="17px" fontWeight="700" color="#101928" pb={2}>
            Create Scheduled Report
          </ModalHeader>
          <ModalCloseButton mt={3} mr={3} />
          <ModalBody>
            <WizardSteps step={wizardStep} />
            {wizardStep === 1 && renderWizardStep1()}
            {wizardStep === 2 && renderWizardStep2()}
            {wizardStep === 3 && renderWizardStep3()}
          </ModalBody>
          <ModalFooter gap={3} pt={5} pb={4}>
            {wizardStep > 1 && (
              <Button
                variant="outline" borderColor="#D0D5DD" color="#344054"
                fontSize="14px" fontWeight="600" borderRadius="md" h="44px"
                leftIcon={<FiChevronLeft size={15} />}
                onClick={handlePrevStep}
              >
                Back
              </Button>
            )}
            <Button
              variant="outline" flex={1} borderColor="#D0D5DD" color="#344054"
              fontSize="14px" fontWeight="600" borderRadius="md" h="44px"
              onClick={handleCreateModalClose}
            >
              Cancel
            </Button>
            {wizardStep < 3 ? (
              <Button
                flex={1} bg="#660066" color="white" _hover={{ bg: "#550055" }}
                fontSize="14px" fontWeight="600" borderRadius="md" h="44px"
                rightIcon={<FiChevronRight size={15} />}
                onClick={handleNextStep}
              >
                Next
              </Button>
            ) : (
              <Button
                flex={1} bg="#660066" color="white" _hover={{ bg: "#550055" }}
                fontSize="14px" fontWeight="600" borderRadius="md" h="44px"
                isLoading={saving}
                onClick={handleSaveSchedule}
              >
                Activate Schedule
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Logs Modal (per schedule) ── */}
      <Modal isOpen={isLogsOpen} onClose={onLogsClose} isCentered size="2xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader p={0}>
            <Box bgGradient="linear(to-r, #660066, #8E3A8E)" px={6} pt={6} pb={5} color="white">
              <HStack spacing={3} align="center">
                <Flex w="40px" h="40px" bg="whiteAlpha.200" borderRadius="lg" align="center" justify="center" flexShrink={0}>
                  <FiClock size={18} />
                </Flex>
                <Box minW={0}>
                  <Text fontSize="17px" fontWeight="700" lineHeight="1.3">Execution Logs</Text>
                  <Text fontSize="13px" fontWeight="400" color="whiteAlpha.800" noOfLines={1}>
                    {selectedSchedule?.scheduleName || selectedSchedule?.reportName || "Scheduled report"}
                  </Text>
                </Box>
              </HStack>
              {selectedSchedule && (
                <Flex wrap="wrap" gap={2} mt={4}>
                  {[
                    selectedSchedule.frequency && ["Frequency", selectedSchedule.frequency],
                    selectedSchedule.deliveryMethod && ["Delivery", selectedSchedule.deliveryMethod],
                    selectedSchedule.nextRunDate && ["Next run", formatDate(selectedSchedule.nextRunDate)],
                    selectedSchedule.status && ["Status", selectedSchedule.status],
                  ].filter(Boolean).map(([k, v]) => (
                    <HStack key={k} spacing={1} bg="whiteAlpha.200" px={3} py={1} borderRadius="full" fontSize="12px">
                      <Text color="whiteAlpha.700" fontWeight="400">{k}:</Text>
                      <Text fontWeight="600" textTransform="capitalize">{v}</Text>
                    </HStack>
                  ))}
                </Flex>
              )}
            </Box>
          </ModalHeader>
          <ModalCloseButton color="white" mt={3} mr={3} _hover={{ bg: "whiteAlpha.300" }} />

          <ModalBody px={6} py={5} bg="#FCFCFD">
            {logsLoading ? (
              <Center py={16} flexDir="column" gap={3}>
                <Spinner color="#660066" thickness="3px" />
                <Text fontSize="13px" color="#667185">Loading execution history…</Text>
              </Center>
            ) : executionLogs.length === 0 ? (
              <Center py={14} flexDir="column" gap={3}>
                <Flex w="56px" h="56px" bg="#F9F5FF" borderRadius="full" align="center" justify="center">
                  <FiClock size={24} color="#660066" />
                </Flex>
                <Text fontSize="15px" fontWeight="600" color="#101928">No runs yet</Text>
                <Text fontSize="13px" color="#667185" textAlign="center" maxW="300px">
                  Logs will appear here once this schedule has run for the first time.
                </Text>
              </Center>
            ) : (() => {
              const isSuccess = (l) => ["success", "delivered", "completed"].includes(l.status?.toLowerCase());
              const isFailed = (l) => ["failed", "error"].includes(l.status?.toLowerCase());
              const successCount = executionLogs.filter(isSuccess).length;
              const failedCount = executionLogs.filter(isFailed).length;
              const durations = executionLogs.map((l) => l.processingDurationMs).filter((ms) => ms != null);
              const avgDuration = durations.length
                ? `${(durations.reduce((a, b) => a + b, 0) / durations.length / 1000).toFixed(1)}s`
                : "—";
              return (
                <VStack align="stretch" spacing={5}>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    {[
                      { label: "Total runs", value: executionLogs.length, color: "#101928" },
                      { label: "Successful", value: successCount, color: "#027A48" },
                      { label: "Failed", value: failedCount, color: failedCount ? "#B42318" : "#101928" },
                      { label: "Avg duration", value: avgDuration, color: "#101928" },
                    ].map((stat) => (
                      <Box key={stat.label} bg="white" border="1px solid #EAECF0" borderRadius="lg" px={4} py={3}>
                        <Text fontSize="12px" color="#667185" mb={1}>{stat.label}</Text>
                        <Text fontSize="20px" fontWeight="700" color={stat.color} lineHeight="1.2">{stat.value}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>

                  <Box>
                    <SectionLabel>Run history</SectionLabel>
                    <VStack align="stretch" spacing={3}>
                      {executionLogs.map((log) => {
                        const failed = isFailed(log);
                        const ok = isSuccess(log);
                        return (
                          <Flex
                            key={log.logId}
                            bg="white" border="1px solid" borderColor={failed ? "#FECDCA" : "#EAECF0"}
                            borderLeft="4px solid" borderLeftColor={failed ? "#F04438" : ok ? "#12B76A" : "#F79009"}
                            borderRadius="lg" px={4} py={3} gap={3} align="flex-start"
                          >
                            <Flex
                              w="32px" h="32px" borderRadius="full" flexShrink={0} align="center" justify="center"
                              bg={failed ? "#FEF3F2" : ok ? "#ECFDF3" : "#FFFAEB"}
                            >
                              {failed ? <FiAlertCircle size={16} color="#F04438" />
                                : ok ? <FiCheckCircle size={16} color="#12B76A" />
                                : <FiClock size={16} color="#F79009" />}
                            </Flex>
                            <Box flex={1} minW={0}>
                              <Flex justify="space-between" align="center" gap={2} wrap="wrap">
                                <Text fontSize="14px" fontWeight="600" color="#101928">
                                  {failed ? "Run failed" : ok ? "Run completed" : "Run in progress"}
                                </Text>
                                <StatusBadge status={log.status} />
                              </Flex>
                              <HStack spacing={4} mt={1} color="#667185" fontSize="12px" wrap="wrap">
                                <HStack spacing={1}><FiCalendar size={12} /><Text>{formatDateTime(log.executionDate)}</Text></HStack>
                                {log.duration && <HStack spacing={1}><FiClock size={12} /><Text>{log.duration}</Text></HStack>}
                                {log.deliveryMethod && (
                                  <HStack spacing={1}>
                                    <FiMail size={12} />
                                    <Text textTransform="capitalize">
                                      {log.deliveryMethod}{log.deliveryStatus ? ` · ${log.deliveryStatus}` : ""}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                              {log.errorMessage && (
                                <HStack align="flex-start" spacing={2} mt={3} bg="#FEF3F2" borderRadius="md" px={3} py={2}>
                                  <Box pt="2px"><FiAlertCircle size={12} color="#B42318" /></Box>
                                  <Text fontSize="12px" color="#B42318">{log.errorMessage}</Text>
                                </HStack>
                              )}
                            </Box>
                          </Flex>
                        );
                      })}
                    </VStack>
                  </Box>
                </VStack>
              );
            })()}
          </ModalBody>

          <ModalFooter borderTop="1px solid #F2F4F7" gap={3} py={4}>
            <Button
              variant="outline" borderColor="#D0D5DD" color="#344054"
              fontSize="14px" fontWeight="600" borderRadius="md" h="40px"
              leftIcon={<FiRefreshCw size={14} />}
              isDisabled={logsLoading || !selectedSchedule}
              onClick={() => loadScheduleLogs(selectedSchedule.scheduleId)}
            >
              Refresh
            </Button>
            <Button
              bg="#660066" color="white" _hover={{ bg: "#550055" }}
              fontSize="14px" fontWeight="600" borderRadius="md" h="40px" px={6}
              onClick={onLogsClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScheduledReportingScreen;
