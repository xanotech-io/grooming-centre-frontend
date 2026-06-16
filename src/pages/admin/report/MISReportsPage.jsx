import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  HStack,
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  Select,
  Grid,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Divider,
  VStack,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
} from "react-icons/fi";
import { Route } from "react-router-dom";
import {
  adminListMISReports,
  adminGetMISKPIs,
  adminGenerateMISReport,
  adminArchiveMISReport,
  adminDeleteMISReport,
} from "../../../services";
import { AdminMainAreaWrapper } from "../../../layouts";
import { motion } from "framer-motion";
import ScheduleReportModal from "./components/ScheduleReportModal";

// ─── helpers ────────────────────────────────────────────────────────────────

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Box bg="white" p={6} borderRadius="xl" border="1px solid #F2F4F7" boxShadow="sm">
    <Text fontSize="15px" fontWeight="500" color="#101928" mb={2}>{title}</Text>
    <Text fontSize="28px" fontWeight="700" color="#101928" mb={1}>{value}</Text>
    {subtext && (
      <Text fontSize="14px" fontWeight="500" color={subtextColor || "#12B76A"}>{subtext}</Text>
    )}
  </Box>
);

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "generated": return { bg: "#ECFDF3", color: "#027A48" };
    case "archived":  return { bg: "#FEF3F2", color: "#B42318" };
    case "draft":     return { bg: "#FFFAEB", color: "#B54708" };
    default:          return { bg: "#F2F4F7", color: "#344054" };
  }
};

const TABS = ["Overview", "Academic", "Administrative", "Compliance", "Attendance", "Performance"];
const CATEGORY_MAP = { 1: "academic", 2: "administrative", 3: "compliance" };

const GENERATE_FORM_DEFAULT = {
  reportCategory: "academic",
  reportName: "",
  reportFormat: "json",
  frequency: "on_demand",
  accessLevel: [],
  filters: { courseId: "", departmentId: "", startDate: "", endDate: "", limit: "" },
};

// ─── component ──────────────────────────────────────────────────────────────

const MISReportsPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isGenerateOpen, onOpen: onGenerateOpen, onClose: onGenerateClose } = useDisclosure();

  const [activeTab, setActiveTab] = useState(0);

  // ── list state ──────────────────────────────────────────────────────────
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 });
  const [reportsLoading, setReportsLoading] = useState(false);

  // ── filters ─────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    search: "", category: "", status: "", frequency: "", startDate: "", endDate: "", page: 1, limit: 20,
  });

  // ── kpis ────────────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState(null);

  // ── generate form ───────────────────────────────────────────────────────
  const [generateForm, setGenerateForm] = useState(GENERATE_FORM_DEFAULT);
  const [generating, setGenerating] = useState(false);

  // ── fetch ────────────────────────────────────────────────────────────────

  const fetchReports = useCallback(async (f) => {
    setReportsLoading(true);
    try {
      const params = { page: f.page || 1, limit: f.limit || 20 };
      if (f.search)    params.search    = f.search;
      if (f.category)  params.category  = f.category;
      if (f.status)    params.status    = f.status;
      if (f.frequency) params.frequency = f.frequency;
      if (f.startDate) params.startDate = f.startDate;
      if (f.endDate)   params.endDate   = f.endDate;

      const result = await adminListMISReports(params);
      setReports(result.reports ?? []);
      setPagination(result.pagination ?? { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 });
    } catch {
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => { fetchReports(filters); }, []); // eslint-disable-line

  // KPIs (once)
  useEffect(() => {
    adminGetMISKPIs()
      .then(({ kpis: d }) => setKpis(d))
      .catch(() => {});
  }, []);

  // re-fetch when active tab switches to a category tab
  useEffect(() => {
    const category = CATEGORY_MAP[activeTab] ?? "";
    const newFilters = { ...filters, category, page: 1 };
    setFilters(newFilters);
    fetchReports(newFilters);
  }, [activeTab]); // eslint-disable-line

  // ── filter helpers ───────────────────────────────────────────────────────

  const applyFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchReports(newFilters);
  };

  const goToPage = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchReports(newFilters);
  };

  // ── actions ──────────────────────────────────────────────────────────────

  const handleArchive = async (reportId) => {
    try {
      const { message } = await adminArchiveMISReport(reportId);
      toast({ description: message || "Report archived.", status: "success", position: "top" });
      fetchReports(filters);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to archive.", status: "error", position: "top" });
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const { message } = await adminDeleteMISReport(reportId);
      toast({ description: message || "Report deleted.", status: "success", position: "top" });
      fetchReports(filters);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to delete.", status: "error", position: "top" });
    }
  };

  const handleGenerateClose = () => { setGenerateForm(GENERATE_FORM_DEFAULT); onGenerateClose(); };

  const handleGenerate = async () => {
    if (!generateForm.reportName.trim()) {
      toast({ description: "Report name is required.", status: "warning", position: "top" });
      return;
    }
    setGenerating(true);
    try {
      const { filters: f } = generateForm;
      const cleanFilters = {};
      if (f.courseId)     cleanFilters.courseId     = f.courseId;
      if (f.departmentId) cleanFilters.departmentId = f.departmentId;
      if (f.startDate)    cleanFilters.startDate    = f.startDate;
      if (f.endDate)      cleanFilters.endDate      = f.endDate;
      if (f.limit)        cleanFilters.limit        = Number(f.limit);

      const { message } = await adminGenerateMISReport({
        reportCategory: generateForm.reportCategory,
        reportName: generateForm.reportName,
        reportFormat: generateForm.reportFormat,
        frequency: generateForm.frequency,
        accessLevel: generateForm.accessLevel,
        filters: cleanFilters,
      });
      toast({ description: message || "Report generated successfully.", status: "success", position: "top" });
      handleGenerateClose();
      fetchReports(filters);
    } catch (err) {
      toast({ description: err?.response?.data?.message || "Failed to generate report.", status: "error", position: "top" });
    } finally {
      setGenerating(false);
    }
  };

  // ── shared reports table ─────────────────────────────────────────────────

  const renderReportsTable = () => (
    <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" overflow="hidden" boxShadow="xs">
      {/* filters row */}
      <Box p={4} borderBottom="1px solid #F2F4F7">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <HStack spacing={3} flexWrap="wrap">
            <InputGroup w="280px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="#667085" />
              </InputLeftElement>
              <ChakraInput
                placeholder="Search here..."
                fontSize="14px"
                borderRadius="md"
                value={filters.search}
                onChange={(e) => applyFilter("search", e.target.value)}
              />
            </InputGroup>
          </HStack>

          <HStack spacing={3} flexWrap="wrap">
            {/* category — hidden on category-specific tabs */}
            {activeTab === 0 && (
              <Select
                w="150px" size="sm" borderRadius="md" placeholder="Category"
                value={filters.category}
                onChange={(e) => applyFilter("category", e.target.value)}
              >
                <option value="academic">Academic</option>
                <option value="administrative">Administrative</option>
                <option value="compliance">Compliance</option>
              </Select>
            )}

            <Select
              w="130px" size="sm" borderRadius="md" placeholder="Status"
              value={filters.status}
              onChange={(e) => applyFilter("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
              <option value="archived">Archived</option>
            </Select>

            <Select
              w="140px" size="sm" borderRadius="md" placeholder="Frequency"
              value={filters.frequency}
              onChange={(e) => applyFilter("frequency", e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="on_demand">On Demand</option>
            </Select>

            <ChakraInput
              type="date" size="sm" borderRadius="md" w="150px"
              value={filters.startDate}
              onChange={(e) => applyFilter("startDate", e.target.value)}
            />
            <ChakraInput
              type="date" size="sm" borderRadius="md" w="150px"
              value={filters.endDate}
              onChange={(e) => applyFilter("endDate", e.target.value)}
            />
          </HStack>
        </Flex>
      </Box>

      {/* table */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th w="40px" px={6} py={4}><Checkbox colorScheme="purple" /></Th>
              {[
                "Report ID", "Category", "Report Name", "Generated By",
                "Date & Time", "Format", "Frequency", "Status", "Remark", "Action",
              ].map((h) => (
                <Th key={h} textTransform="none" fontSize="12px" fontWeight="500" color="#475367">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {reportsLoading ? (
              <Tr><Td colSpan={11} textAlign="center" py={10} fontSize="13px" color="#667085">Loading reports...</Td></Tr>
            ) : reports.length === 0 ? (
              <Tr><Td colSpan={11} textAlign="center" py={10} fontSize="13px" color="#667085">No reports found.</Td></Tr>
            ) : (
              reports.map((item, idx) => (
                <Tr key={item.id ?? idx}>
                  <Td px={6} py={4}><Checkbox colorScheme="purple" /></Td>
                  <Td fontSize="12px" color="#667085">{item.id}</Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500">{item.category}</Td>
                  <Td fontSize="12px" color="#101928" fontWeight="500" maxW="200px">{item.name ?? item.reportName}</Td>
                  <Td fontSize="12px" color="#667085">{item.generatedBy}</Td>
                  <Td fontSize="12px" color="#667085">{item.dateTime ?? item.createdAt}</Td>
                  <Td fontSize="12px" color="#667085">{item.format ?? item.reportFormat}</Td>
                  <Td fontSize="12px" color="#667085">{item.frequency}</Td>
                  <Td>
                    <Badge
                      bg={getStatusColor(item.status).bg}
                      color={getStatusColor(item.status).color}
                      borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="500"
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td fontSize="12px" color="#667085" maxW="150px">{item.remark}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton} icon={<FiMoreVertical />}
                        variant="ghost" size="sm" color="#98A2B3"
                        border="1px solid #E4E7EC" borderRadius="md"
                      />
                      <MenuList>
                        <MenuItem fontSize="13px" onClick={() => handleArchive(item.id)}>Archive report</MenuItem>
                        <MenuItem fontSize="13px" color="red.500" onClick={() => handleDelete(item.id)}>Delete report</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* pagination */}
      <Flex justify="space-between" align="center" p={4} borderTop="1px solid #F2F4F7" flexWrap="wrap" gap={3}>
        <HStack spacing={2}>
          <Text fontSize="13px" color="#344054">Rows per page</Text>
          <Select
            w="70px" size="sm" borderRadius="md"
            value={String(filters.limit)}
            onChange={(e) => applyFilter("limit", Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Select>
        </HStack>
        <HStack spacing={4}>
          <Text fontSize="13px" color="#344054">
            Showing <b>{reports.length}</b> of <b>{pagination.totalItems ?? 0}</b> items
          </Text>
          <HStack spacing={1}>
            <IconButton
              icon={<FiChevronLeft />} size="sm" variant="ghost" aria-label="Previous"
              isDisabled={pagination.currentPage <= 1}
              onClick={() => goToPage(pagination.currentPage - 1)}
            />
            <Text fontSize="13px" fontWeight="600">{pagination.currentPage}</Text>
            <IconButton
              icon={<FiChevronRight />} size="sm" variant="ghost" aria-label="Next"
              isDisabled={pagination.currentPage >= (pagination.totalPages ?? 1)}
              onClick={() => goToPage(pagination.currentPage + 1)}
            />
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );

  // ── overview tab ─────────────────────────────────────────────────────────

  const renderOverview = () => (
    <>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
        <SummaryCard
          title="Total Reports"
          value={pagination.totalItems ?? "—"}
          subtext="all reports"
        />
        <SummaryCard
          title="Avg. Generation Time"
          value={kpis?.avgReportGenerationTimeMs ? `${kpis.avgReportGenerationTimeMs} ms` : "—"}
          subtext="per report"
        />
        <SummaryCard
          title="Report Accuracy"
          value={kpis?.reportAccuracyRate ? `${kpis.reportAccuracyRate}%` : "—"}
          subtext="accuracy rate"
        />
        <SummaryCard
          title="Automation Rate"
          value={kpis?.automationRate ? `${kpis.automationRate}%` : "—"}
          subtext="automated reports"
        />
      </SimpleGrid>
      {renderReportsTable()}
    </>
  );

  // ── category tabs (Academic / Administrative / Compliance / Attendance / Performance) ──

  const renderCategoryTab = (label) => (
    <>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
        <SummaryCard title="Total Reports" value={pagination.totalItems ?? "—"} />
        <SummaryCard title="Avg. Generation Time" value={kpis?.avgReportGenerationTimeMs ? `${kpis.avgReportGenerationTimeMs} ms` : "—"} />
        <SummaryCard title="Report Accuracy" value={kpis?.reportAccuracyRate ? `${kpis.reportAccuracyRate}%` : "—"} />
        <SummaryCard title="Automation Rate" value={kpis?.automationRate ? `${kpis.automationRate}%` : "—"} />
      </SimpleGrid>

      <Box mb={6}>
        <Text fontSize="18px" fontWeight="600" color="#101928" mb={4}>{label} Reports</Text>
        {renderReportsTable()}
      </Box>
    </>
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <AdminMainAreaWrapper>
      <Box
        mb={6} mt={6}
        as={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="24px" fontWeight="700" color="#101928">
            Management Information System Reports
          </Text>
          <HStack spacing={3}>
            <Button
              variant="outline" borderColor="#660066" color="#660066"
              h="40px" fontSize="14px" fontWeight="500" onClick={onOpen}
            >
              Schedule report
            </Button>
            <Button
              bg="#660066" color="white" _hover={{ bg: "#550055" }}
              h="40px" fontSize="14px" fontWeight="500" onClick={onGenerateOpen}
            >
              Generate Report
            </Button>
          </HStack>
        </Flex>

        <Tabs
          index={activeTab}
          onChange={(index) => setActiveTab(index)}
          colorScheme="purple"
          isLazy
          variant="unstyled"
        >
          <TabList
            borderBottom="1px solid #E4E7EC"
            overflowX="auto"
            whiteSpace="nowrap"
            pb="4px"
            sx={{
              "&::-webkit-scrollbar": { height: "3px" },
              "&::-webkit-scrollbar-thumb": { background: "#E4E7EC", borderRadius: "10px" },
            }}
          >
            {TABS.map((tab, i) => (
              <Tab
                key={i}
                _selected={{ color: "#660066", borderBottom: "2px solid #660066", fontWeight: "600" }}
                borderBottom="2px solid transparent"
                fontSize="13px" fontWeight="500" color="#344054"
                px={4} py={3} mr={8} flexShrink={0}
                _focus={{ boxShadow: "none" }}
              >
                {tab}
              </Tab>
            ))}
          </TabList>

          <TabPanels mt={8}>
            <TabPanel p={0}>{renderOverview()}</TabPanel>
            <TabPanel p={0}>{renderCategoryTab("Academic")}</TabPanel>
            <TabPanel p={0}>{renderCategoryTab("Administrative")}</TabPanel>
            <TabPanel p={0}>{renderCategoryTab("Compliance")}</TabPanel>
            <TabPanel p={0}>{renderCategoryTab("Attendance")}</TabPanel>
            <TabPanel p={0}>{renderCategoryTab("Performance")}</TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Generate Report Modal */}
      <Modal isOpen={isGenerateOpen} onClose={handleGenerateClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalHeader fontSize="lg" fontWeight="700" color="#101928">Generate Report</ModalHeader>
          <ModalCloseButton mt={3} mr={2} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">Report Name</FormLabel>
                <ChakraInput
                  placeholder="e.g. Course Completion Summary – Oct 2026"
                  value={generateForm.reportName}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, reportName: e.target.value }))}
                  borderRadius="md" fontSize="14px"
                />
              </FormControl>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Category</FormLabel>
                  <Select
                    value={generateForm.reportCategory}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, reportCategory: e.target.value }))}
                    borderRadius="md" fontSize="14px"
                  >
                    <option value="academic">Academic</option>
                    <option value="administrative">Administrative</option>
                    <option value="compliance">Compliance</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Format</FormLabel>
                  <Select
                    value={generateForm.reportFormat}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, reportFormat: e.target.value }))}
                    borderRadius="md" fontSize="14px"
                  >
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </Select>
                </FormControl>
              </Grid>
              <FormControl isRequired>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">Frequency</FormLabel>
                <Select
                  value={generateForm.frequency}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, frequency: e.target.value }))}
                  borderRadius="md" fontSize="14px"
                >
                  <option value="on_demand">On Demand</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="14px" fontWeight="500" color="#344054">Access Level</FormLabel>
                <HStack spacing={6} flexWrap="wrap">
                  {["Admin", "Super Admin", "Instructor", "Student"].map((role) => (
                    <Checkbox
                      key={role}
                      colorScheme="purple"
                      isChecked={generateForm.accessLevel.includes(role)}
                      onChange={(e) =>
                        setGenerateForm((f) => ({
                          ...f,
                          accessLevel: e.target.checked
                            ? [...f.accessLevel, role]
                            : f.accessLevel.filter((r) => r !== role),
                        }))
                      }
                    >
                      <Text fontSize="14px" color="#344054">{role}</Text>
                    </Checkbox>
                  ))}
                </HStack>
              </FormControl>
              <Divider />
              <Text fontSize="13px" fontWeight="600" color="#667085">Filters (optional)</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Course ID</FormLabel>
                  <ChakraInput
                    placeholder="UUID"
                    value={generateForm.filters.courseId}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, courseId: e.target.value } }))}
                    borderRadius="md" fontSize="14px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Department ID</FormLabel>
                  <ChakraInput
                    placeholder="UUID"
                    value={generateForm.filters.departmentId}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, departmentId: e.target.value } }))}
                    borderRadius="md" fontSize="14px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Start Date</FormLabel>
                  <ChakraInput
                    type="date"
                    value={generateForm.filters.startDate}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, startDate: e.target.value } }))}
                    borderRadius="md" fontSize="14px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">End Date</FormLabel>
                  <ChakraInput
                    type="date"
                    value={generateForm.filters.endDate}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, endDate: e.target.value } }))}
                    borderRadius="md" fontSize="14px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="500" color="#344054">Limit</FormLabel>
                  <ChakraInput
                    type="number" placeholder="100"
                    value={generateForm.filters.limit}
                    onChange={(e) => setGenerateForm((f) => ({ ...f, filters: { ...f.filters, limit: e.target.value } }))}
                    borderRadius="md" fontSize="14px"
                  />
                </FormControl>
              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} pt={6} pb={4}>
            <Button
              variant="outline" flex={1} borderColor="#D0D5DD" color="#344054"
              fontSize="14px" fontWeight="600" onClick={handleGenerateClose}
              borderRadius="md" h="44px"
            >
              Cancel
            </Button>
            <Button
              bg="#660066" flex={1} color="white" _hover={{ bg: "#550055" }}
              fontSize="14px" fontWeight="600" borderRadius="md" h="44px"
              isLoading={generating} onClick={handleGenerate}
            >
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export const MISReportsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MISReportsPage {...props} />} />
);

export default MISReportsPage;
