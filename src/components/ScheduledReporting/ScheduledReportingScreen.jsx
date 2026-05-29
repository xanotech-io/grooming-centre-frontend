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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
  FiList,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  tc20ListSchedules,
  tc20GetScheduleKPIs,
  tc20CreateSchedule,
  tc20DeleteSchedule,
  tc20UpdateScheduleStatus,
  tc20GetScheduleLogs,
  tc20GetAllExecutionLogs,
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
  const [activeTab, setActiveTab] = useState(0);

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

  const loadAllLogs = useCallback(async () => {
    setLogsLoading(true);
    const { logs } = await tc20GetAllExecutionLogs();
    setExecutionLogs(logs);
    setLogsLoading(false);
  }, []);

  const loadScheduleLogs = useCallback(async (scheduleId) => {
    setLogsLoading(true);
    const { logs } = await tc20GetScheduleLogs(scheduleId);
    setExecutionLogs(logs);
    setLogsLoading(false);
  }, []);

  useEffect(() => { loadSchedules(); loadKPIs(); }, [loadSchedules, loadKPIs]);


  // Load logs when the logs tab is active
  useEffect(() => {
    if (activeTab === 1) loadAllLogs();
  }, [activeTab, loadAllLogs]);

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
    setKpis((prev) => prev ? {
      ...prev,
      activeSchedules: prev.activeSchedules + (newStatus === "active" ? 1 : -1),
    } : prev);
    toast({ description: message, status: isMock ? "info" : "success", position: "top", duration: 2500, isClosable: true });
    setTogglingId(null);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    setDeletingId(scheduleId);
    const { message, isMock } = await tc20DeleteSchedule(scheduleId);
    setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
    setKpis((prev) => prev ? { ...prev, totalScheduled: Math.max(0, prev.totalScheduled - 1) } : prev);
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
    const body = { ...form, recipients };
    const { schedule, message, isMock } = await tc20CreateSchedule(body);
    if (schedule) {
      setSchedules((prev) => [{ ...schedule, status: "active" }, ...prev]);
      setKpis((prev) => prev ? { ...prev, totalScheduled: prev.totalScheduled + 1, activeSchedules: prev.activeSchedules + 1 } : prev);
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
            <KPICard label="Total Schedules"   value={kpis?.totalScheduled ?? "—"}   sub="All created"           icon={FiList}        iconBg="#F9F5FF" />
            <KPICard label="Active Schedules"  value={kpis?.activeSchedules ?? "—"}  sub="Currently running"      icon={FiCheckCircle} iconBg="#ECFDF3" />
            <KPICard label="Success Rate"      value={kpis?.successRate != null ? `${kpis.successRate}%` : "—"}  sub="Delivery success" icon={FiCheckCircle} iconBg="#ECFDF3" />
            <KPICard label="Failed Reports"    value={kpis?.failedReports ?? "—"}    sub="Needs attention"  subColor="#F04438" icon={FiAlertCircle} iconBg="#FEF3F2" />
            <KPICard label="Avg Delivery"      value={kpis?.avgDeliveryTime ?? "—"}  sub="Per report"             icon={FiClock}       iconBg="#EFF8FF" />
            <KPICard label="This Month"        value={kpis?.reportsThisMonth ?? "—"} sub="Reports sent"           icon={FiCalendar}    iconBg="#FFFAEB" />
          </>
        )}
      </SimpleGrid>

      {/* Tabs: Schedules | Execution Logs */}
      <Box bg="white" borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm" overflow="hidden">
        <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled">
          <Flex px={6} pt={4} borderBottom="1px solid #F2F4F7" align="center" justify="space-between">
            <TabList gap={1}>
              {["Schedules", "Execution History"].map((label, i) => (
                <Tab
                  key={label}
                  fontSize="14px" fontWeight="500"
                  color={activeTab === i ? "#660066" : "#667185"}
                  borderBottom="2px solid"
                  borderColor={activeTab === i ? "#660066" : "transparent"}
                  pb={3} px={3}
                  _selected={{ color: "#660066" }}
                >
                  {label}
                </Tab>
              ))}
            </TabList>
          </Flex>

          <TabPanels>
            {/* ── Tab 1: Schedules Table ── */}
            <TabPanel p={0}>
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
                        <Tr key={s.scheduleId} _hover={{ bg: "#FAFAFA" }} borderBottom="1px solid #F2F4F7">
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
                          <Td px={4} py={3}>
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
                          <Td px={4} py={3}>
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
            </TabPanel>

            {/* ── Tab 2: Execution History ── */}
            <TabPanel p={0}>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#F9FAFB">
                    <Tr>
                      {["Log ID","Report Name","Execution Date & Time","Status","Duration","Delivered To","Error"].map((h) => (
                        <Th key={h} fontSize="11px" fontWeight="600" color="#667185" textTransform="uppercase" letterSpacing="0.5px" py={3} px={4} whiteSpace="nowrap">
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {logsLoading ? (
                      <Tr><Td colSpan={7} py={12}><Center><Spinner color="#660066" /></Center></Td></Tr>
                    ) : executionLogs.length === 0 ? (
                      <EmptyRow colSpan={7} message="No execution logs yet" />
                    ) : (
                      executionLogs.map((log) => (
                        <Tr key={log.logId} _hover={{ bg: "#FAFAFA" }} borderBottom="1px solid #F2F4F7">
                          <Td px={4} py={3}>
                            <Text fontSize="12px" fontFamily="mono" color="#667185">{log.logId}</Text>
                          </Td>
                          <Td px={4} py={3} maxW="180px">
                            <Text fontSize="13px" color="#101928" noOfLines={1}>{log.reportName}</Text>
                          </Td>
                          <Td px={4} py={3}>
                            <Text fontSize="13px" color="#344054" whiteSpace="nowrap">{formatDateTime(log.executionDate)}</Text>
                          </Td>
                          <Td px={4} py={3}><StatusBadge status={log.status} /></Td>
                          <Td px={4} py={3}>
                            <Text fontSize="13px" color="#344054">{log.duration || "—"}</Text>
                          </Td>
                          <Td px={4} py={3} maxW="200px">
                            <Text fontSize="12px" color="#344054" noOfLines={1}>{log.deliveredTo || "—"}</Text>
                          </Td>
                          <Td px={4} py={3} maxW="220px">
                            {log.errorMessage ? (
                              <HStack spacing={1}>
                                <FiAlertTriangle size={12} color="#F04438" />
                                <Text fontSize="12px" color="#F04438" noOfLines={1}>{log.errorMessage}</Text>
                              </HStack>
                            ) : (
                              <Text fontSize="12px" color="#12B76A">—</Text>
                            )}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
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
      <Modal isOpen={isLogsOpen} onClose={onLogsClose} isCentered size="3xl">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalHeader fontSize="17px" fontWeight="700" color="#101928" pb={1}>
            Execution Logs
            {selectedSchedule && (
              <Text fontSize="13px" fontWeight="400" color="#667185" mt={1}>
                {selectedSchedule.reportName} — {selectedSchedule.scheduleId}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton mt={3} mr={3} />
          <ModalBody pb={6}>
            {logsLoading ? (
              <Center py={12}><Spinner color="#660066" /></Center>
            ) : executionLogs.length === 0 ? (
              <Center py={10} flexDir="column" gap={2}>
                <FiList size={28} color="#D0D5DD" />
                <Text fontSize="14px" color="#667185">No logs available yet</Text>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#F9FAFB">
                    <Tr>
                      {["Date & Time","Status","Duration","Delivered To","Notes"].map((h) => (
                        <Th key={h} fontSize="11px" fontWeight="600" color="#667185" textTransform="uppercase" letterSpacing="0.5px" py={3} px={4}>
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {executionLogs.map((log) => (
                      <Tr key={log.logId} _hover={{ bg: "#FAFAFA" }} borderBottom="1px solid #F2F4F7">
                        <Td px={4} py={3}>
                          <Text fontSize="13px" color="#344054" whiteSpace="nowrap">{formatDateTime(log.executionDate)}</Text>
                        </Td>
                        <Td px={4} py={3}><StatusBadge status={log.status} /></Td>
                        <Td px={4} py={3}>
                          <Text fontSize="13px" color="#344054">{log.duration || "—"}</Text>
                        </Td>
                        <Td px={4} py={3} maxW="200px">
                          <Text fontSize="12px" color="#344054" noOfLines={1}>{log.deliveredTo || "—"}</Text>
                        </Td>
                        <Td px={4} py={3} maxW="200px">
                          {log.errorMessage ? (
                            <Text fontSize="12px" color="#F04438" noOfLines={2}>{log.errorMessage}</Text>
                          ) : (
                            <Text fontSize="12px" color="#12B76A">Delivered successfully</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScheduledReportingScreen;
