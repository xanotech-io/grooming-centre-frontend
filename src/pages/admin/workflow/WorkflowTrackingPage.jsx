import React, { useCallback, useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button, Heading, Select, Breadcrumb, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useFetch } from "../../../hooks";
import { useApp } from "../../../contexts";
import { adminTrackWorkflows, adminGetWorkflowReport } from "../../../services";

const ALLOWED_ROLES = /admin/i;

const getStatusBadge = (status) => {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
      return <Badge bg="#E6F4EA" color="#38A169" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Approved</Badge>;
    case "pending":
      return <Badge bg="#FFF5EA" color="#DD6B20" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Pending</Badge>;
    case "rejected":
      return <Badge bg="#FED7D7" color="#E53E3E" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Rejected</Badge>;
    case "escalated":
      return <Badge bg="#EBF4FF" color="#3182CE" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Escalated</Badge>;
    case "published":
      return <Badge bg="#F0FFF4" color="#276749" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Published</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateString;
  }
};

const KpiCard = ({ label, value, sub, subColor }) => (
  <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm">
    <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">{label}</Text>
    <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">{value}</Text>
    <Text fontSize="14px" fontWeight="500" color={subColor ?? "#718096"}>{sub}</Text>
  </Box>
);

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Escalated", value: "Escalated" },
  { label: "Published", value: "Published" },
];

const REQUEST_TYPE_OPTIONS = [
  { label: "All types", value: "" },
  { label: "Course Content", value: "Course Content" },
  { label: "Lesson Content", value: "Lesson Content" },
  { label: "Exam", value: "Exam" },
  { label: "Library Material", value: "Library Material" },
  { label: "Project", value: "Project" },
];

const WorkflowTrackingPage = () => {
  const { state: appState, getOneMetadata } = useApp();

  const role = getOneMetadata("userRoles", appState.user?.userRoleId);
  const hasAccess = ALLOWED_ROLES.test(role?.name);

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRequestType, setFilterRequestType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const { resource: tableResource, handleFetchResource: fetchTable } = useFetch();
  const { resource: reportResource, handleFetchResource: fetchReport } = useFetch();

  const trackFetcher = useCallback(async () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterRequestType) params.request_type = filterRequestType;
    if (filterStartDate) params.start_date = filterStartDate;
    if (filterEndDate) params.end_date = filterEndDate;
    const { workflows } = await adminTrackWorkflows(params);
    return { workflows, totalDocumentsCount: workflows.length };
  }, [filterStatus, filterRequestType, filterStartDate, filterEndDate]);

  const reportFetcher = useCallback(async () => {
    const { report } = await adminGetWorkflowReport();
    return report;
  }, []);

  useEffect(() => {
    if (!hasAccess) return;
    fetchTable({ fetcher: trackFetcher });
    fetchReport({ fetcher: reportFetcher });
  }, [hasAccess, fetchTable, fetchReport, trackFetcher, reportFetcher]);

  if (appState.user && role && !hasAccess) {
    return <Redirect to="/admin" />;
  }

  const workflows = tableResource.data?.workflows ?? [];
  const report = reportResource.data;

  const completionRate = report
    ? Math.round(((report.approved + report.published) / Math.max(report.total_submissions, 1)) * 100)
    : null;

  const handleApplyFilters = () => fetchTable({ fetcher: trackFetcher });

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterRequestType("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem isCurrentPage><Link href="#">Workflow Tracking</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom="30px">
        <Heading as="h2" size="lg" color="#1A202C">
          Workflow Tracking
        </Heading>
        <Flex gap="16px">
          <Button secondary border="1px solid #6b006b" color="#6b006b" bg="transparent" _hover={{ bg: "gray.50" }}>
            Schedule report
          </Button>
          <Button style={{ backgroundColor: "#6b006b", color: "white" }}>
            Export Report
          </Button>
        </Flex>
      </Flex>

      {/* KPI Cards */}
      <Grid templateColumns="repeat(5, 1fr)" gap="20px" marginBottom="30px">
        <KpiCard
          label="Avg. Approval Time"
          value={
            reportResource.loading ? <Spinner size="sm" /> :
            report?.avg_resolution_hours != null
              ? `${Number(report.avg_resolution_hours).toFixed(1)} h`
              : "—"
          }
          sub="Per workflow"
        />
        <KpiCard
          label="Completion Rate"
          value={
            reportResource.loading ? <Spinner size="sm" /> :
            completionRate != null ? `${completionRate}%` : "—"
          }
          sub="Approved + Published"
        />
        <KpiCard
          label="Pending"
          value={reportResource.loading ? <Spinner size="sm" /> : report?.pending ?? "—"}
          sub="Awaiting review"
          subColor="#E53E3E"
        />
        <KpiCard
          label="Escalated"
          value={reportResource.loading ? <Spinner size="sm" /> : report?.escalated ?? "—"}
          sub="All time"
        />
        <KpiCard
          label="Total Submissions"
          value={reportResource.loading ? <Spinner size="sm" /> : report?.total_submissions ?? 0}
          sub="All workflows"
        />
      </Grid>

      {/* Table */}
      <Box backgroundColor="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
        {/* Toolbar */}
        <Flex gap="16px" padding="20px" borderBottom="1px solid #E2E8F0" flexWrap="wrap">
          <InputGroup width="260px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input type="text" placeholder="Search here..." />
          </InputGroup>
          <Button
            variant="outline"
            leftIcon={<FaFilter />}
            borderColor="#E2E8F0"
            color="#4A5568"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? "Hide Filters" : "Filter"}
          </Button>
        </Flex>

        {/* Filter row */}
        {showFilters && (
          <Flex gap="12px" padding="16px 20px" borderBottom="1px solid #E2E8F0" flexWrap="wrap" alignItems="flex-end">
            <Box width="160px">
              <Text fontSize="12px" fontWeight="600" color="#4A5568" mb={1}>Status</Text>
              <Select
                id="filter_status"
                options={STATUS_OPTIONS}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </Box>
            <Box width="200px">
              <Text fontSize="12px" fontWeight="600" color="#4A5568" mb={1}>Request Type</Text>
              <Select
                id="filter_request_type"
                options={REQUEST_TYPE_OPTIONS}
                value={filterRequestType}
                onChange={(e) => setFilterRequestType(e.target.value)}
              />
            </Box>
            <Box>
              <Text fontSize="12px" fontWeight="600" color="#4A5568" mb={1}>Start Date</Text>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                size="sm"
                borderRadius="6px"
                width="160px"
              />
            </Box>
            <Box>
              <Text fontSize="12px" fontWeight="600" color="#4A5568" mb={1}>End Date</Text>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                size="sm"
                borderRadius="6px"
                width="160px"
              />
            </Box>
            <Flex gap="8px" alignSelf="flex-end">
              <Button style={{ backgroundColor: "#6b006b", color: "white" }} size="sm" onClick={handleApplyFilters}>
                Apply
              </Button>
              <Button secondary size="sm" onClick={handleClearFilters}>
                Clear
              </Button>
            </Flex>
          </Flex>
        )}

        {tableResource.loading && (
          <Flex justifyContent="center" alignItems="center" padding="60px">
            <Spinner size="lg" color="#6b006b" />
          </Flex>
        )}

        {tableResource.err && (
          <Flex justifyContent="center" alignItems="center" padding="60px">
            <Text color="red.500">{tableResource.err}</Text>
          </Flex>
        )}

        {!tableResource.loading && !tableResource.err && (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th width="50px"><input type="checkbox" /></Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Workflow ID</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Request Type</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Content Title</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Submitted By</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Supervisor</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Submission Date</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Status</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Resolution (h)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {workflows.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py="40px" color="#718096">
                      No workflows found.
                    </Td>
                  </Tr>
                ) : (
                  workflows.map((row, idx) => (
                    <Tr key={idx}>
                      <Td><input type="checkbox" /></Td>
                      <Td color="#1A202C" fontSize="14px">{row.id}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.requestType}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.contentTitle ?? "—"}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.submitterName ?? "—"}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.supervisorName ?? "—"}</Td>
                      <Td color="#1A202C" fontSize="14px">{formatDate(row.submissionDate ?? row.actionDate)}</Td>
                      <Td>{getStatusBadge(row.status)}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.resolutionTimeHours ?? "—"}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Flex justifyContent="flex-end" alignItems="center" padding="20px" borderTop="1px solid #E2E8F0" gap="20px">
          <Flex alignItems="center" gap="10px">
            <Text fontSize="14px" color="#4A5568">Rows per page</Text>
            <Box width="80px">
              <Select defaultValue="08" id="rows" options={[{ label: "08", value: "08" }]} />
            </Box>
          </Flex>
          <Text fontSize="14px" fontWeight="600" color="#1A202C">
            Showing {workflows.length} out of {report?.total_submissions ?? workflows.length} items
          </Text>
          <Flex gap="10px">
            <IconButton variant="ghost" size="sm" icon={<FaChevronLeft />} aria-label="Previous page" />
            <Text fontSize="14px" color="#A0AEC0" alignSelf="center">1</Text>
            <IconButton variant="ghost" size="sm" icon={<FaChevronRight />} aria-label="Next page" />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export const WorkflowTrackingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <WorkflowTrackingPage {...props} />} />
  );
};

export default WorkflowTrackingPageRoute;
