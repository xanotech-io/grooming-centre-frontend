import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, useHistory, Redirect } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  Select as ChakraSelect,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select, Breadcrumb, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useFetch } from "../../../hooks";
import { useApp } from "../../../contexts";
import { adminGetPendingApprovals } from "../../../services";

const ALLOWED_ROLES = /supervisor/i;

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

const AutomatedApprovalWorkflow = () => {
  const history = useHistory();
  const { state: appState, getOneMetadata } = useApp();
  const { resource, handleFetchResource } = useFetch();

  const supervisorId = appState.user?.id;
  const role = getOneMetadata("userRoles", appState.user?.userRoleId);
  const hasAccess = ALLOWED_ROLES.test(role?.name);

  const fetcher = useCallback(async () => {
    const { workflows, totalDocumentsCount } = await adminGetPendingApprovals(supervisorId);
    return { workflows, totalDocumentsCount };
  }, [supervisorId]);

  useEffect(() => {
    if (supervisorId && hasAccess) {
      handleFetchResource({ fetcher });
    }
  }, [handleFetchResource, fetcher, supervisorId, hasAccess]);

  const workflows = useMemo(() => resource.data?.workflows ?? [], [resource.data?.workflows]);
  const pendingCount = workflows.filter((w) => /pending/i.test(w.approvalStatus)).length;
  const approvedCount = workflows.filter((w) => /approved/i.test(w.approvalStatus)).length;
  const rejectedCount = workflows.filter((w) => /rejected/i.test(w.approvalStatus)).length;

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterRequestType, setFilterRequestType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const requestTypeOptions = useMemo(() => {
    const types = [...new Set(workflows.map((w) => w.requestType).filter(Boolean))];
    return types.sort();
  }, [workflows]);

  const departmentOptions = useMemo(() => {
    const depts = [...new Set(workflows.map((w) => w.department).filter(Boolean))];
    return depts.sort();
  }, [workflows]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = [w.workflowId, w.requestType, w.contentTitle, w.submittedBy]
          .join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filterInstructor) {
        if (!(w.submittedBy ?? "").toLowerCase().includes(filterInstructor.toLowerCase())) return false;
      }
      if (filterDateFrom) {
        const d = w.submissionDate ?? w.actionDate;
        if (!d || new Date(d) < new Date(filterDateFrom)) return false;
      }
      if (filterDateTo) {
        const d = w.submissionDate ?? w.actionDate;
        if (!d || new Date(d) > new Date(filterDateTo + "T23:59:59")) return false;
      }
      if (filterRequestType && w.requestType !== filterRequestType) return false;
      if (filterStatus && (w.approvalStatus ?? "").toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterDepartment && w.department !== filterDepartment) return false;
      return true;
    });
  }, [workflows, search, filterInstructor, filterDateFrom, filterDateTo, filterRequestType, filterStatus, filterDepartment]);

  const hasActiveFilters = filterInstructor || filterDateFrom || filterDateTo || filterRequestType || filterStatus || filterDepartment;

  const handleClearFilters = () => {
    setFilterInstructor("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterRequestType("");
    setFilterStatus("");
    setFilterDepartment("");
  };

  if (appState.user && role && !hasAccess) {
    return <Redirect to="/admin" />;
  }

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem isCurrentPage><Link href="#">Approval Workflow</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom="30px">
        <Heading as="h2" size="lg" color="#1A202C">
          Approval Workflow
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

      {/* Summary Cards */}
      <Flex gap="20px" marginBottom="30px">
        <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm" minW="200px">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Pending Approval</Text>
          <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">
            {resource.loading ? <Spinner size="sm" /> : pendingCount}
          </Text>
          <Text fontSize="14px" fontWeight="500" color="#E53E3E">Awaiting your review</Text>
        </Box>
        <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm" minW="200px">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Total Assigned</Text>
          <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">
            {resource.loading ? <Spinner size="sm" /> : resource.data?.totalDocumentsCount ?? 0}
          </Text>
          <Text fontSize="14px" fontWeight="500" color="#718096">Assigned to you</Text>
        </Box>
        <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm" minW="200px">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Total Approved</Text>
          <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">
            {resource.loading ? <Spinner size="sm" /> : approvedCount}
          </Text>
          <Text fontSize="14px" fontWeight="500" color="#38A169">Approved by you</Text>
        </Box>
        <Box backgroundColor="white" padding="24px" borderRadius="8px" shadow="sm" minW="200px">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">Total Rejected</Text>
          <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="12px">
            {resource.loading ? <Spinner size="sm" /> : rejectedCount}
          </Text>
          <Text fontSize="14px" fontWeight="500" color="#E53E3E">Rejected by you</Text>
        </Box>
      </Flex>

      {/* Table */}
      <Box backgroundColor="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
        {/* Search row */}
        <Flex gap="16px" padding="20px" paddingBottom="12px" alignItems="center" flexWrap="wrap">
          <InputGroup width="280px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          {hasActiveFilters && (
            <Button secondary onClick={handleClearFilters} size="sm">
              Clear Filters
            </Button>
          )}
        </Flex>

        {/* Filter row */}
        <Flex gap="12px" paddingX="20px" paddingBottom="16px" borderBottom="1px solid #E2E8F0" flexWrap="wrap" alignItems="flex-end">
          {/* Instructor */}
          <Box minW="160px" flex="1">
            <Text fontSize="11px" fontWeight="600" color="#718096" mb="4px" textTransform="uppercase">Instructor</Text>
            <InputGroup size="sm">
              <Input
                placeholder="Filter by instructor..."
                value={filterInstructor}
                onChange={(e) => setFilterInstructor(e.target.value)}
                borderRadius="6px"
                fontSize="13px"
              />
            </InputGroup>
          </Box>

          {/* Date From */}
          <Box minW="140px">
            <Text fontSize="11px" fontWeight="600" color="#718096" mb="4px" textTransform="uppercase">Date From</Text>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              style={{ fontSize: "13px", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "6px 10px", width: "100%", height: "32px" }}
            />
          </Box>

          {/* Date To */}
          <Box minW="140px">
            <Text fontSize="11px" fontWeight="600" color="#718096" mb="4px" textTransform="uppercase">Date To</Text>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              style={{ fontSize: "13px", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "6px 10px", width: "100%", height: "32px" }}
            />
          </Box>

          {/* Request Type */}
          <Box minW="150px" flex="1">
            <Text fontSize="11px" fontWeight="600" color="#718096" mb="4px" textTransform="uppercase">Request Type</Text>
            <ChakraSelect
              size="sm"
              borderRadius="6px"
              fontSize="13px"
              value={filterRequestType}
              onChange={(e) => setFilterRequestType(e.target.value)}
              placeholder="All types"
            >
              {requestTypeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </ChakraSelect>
          </Box>

          {/* Status */}
          <Box minW="130px">
            <Text fontSize="11px" fontWeight="600" color="#718096" mb="4px" textTransform="uppercase">Status</Text>
            <ChakraSelect
              size="sm"
              borderRadius="6px"
              fontSize="13px"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              placeholder="All statuses"
            >
              {["Pending", "Approved", "Rejected", "Escalated", "Published"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </ChakraSelect>
          </Box>

          {/* Department */}
          <Box minW="150px" flex="1">
            <Text fontSize="11px" fontWeight="600" color="#718096" mb="4px" textTransform="uppercase">Department</Text>
            <ChakraSelect
              size="sm"
              borderRadius="6px"
              fontSize="13px"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              placeholder="All departments"
              isDisabled={departmentOptions.length === 0}
            >
              {departmentOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </ChakraSelect>
          </Box>
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" alignItems="center" padding="60px">
            <Spinner size="lg" color="#6b006b" />
          </Flex>
        )}

        {resource.err && (
          <Flex justifyContent="center" alignItems="center" padding="60px">
            <Text color="red.500">{resource.err}</Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th width="50px"><input type="checkbox" /></Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Workflow ID</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Request Type</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Content Title</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Instructor</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Submission Date</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Status</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568">Resolution (h)</Th>
                  <Th textTransform="none" fontSize="14px" fontWeight="600" color="#4A5568" width="100px">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredWorkflows.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py="40px" color="#718096">
                      {workflows.length === 0
                        ? "No pending workflows assigned to you."
                        : "No results match your filters."}
                    </Td>
                  </Tr>
                ) : (
                  filteredWorkflows.map((row, idx) => (
                    <Tr key={idx}>
                      <Td><input type="checkbox" /></Td>
                      <Td color="#1A202C" fontSize="14px">{row.workflowId}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.requestType}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.contentTitle ?? "—"}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.submittedBy ?? "—"}</Td>
                      <Td color="#1A202C" fontSize="14px">{formatDate(row.submissionDate ?? row.actionDate)}</Td>
                      <Td>{getStatusBadge(row.approvalStatus)}</Td>
                      <Td color="#1A202C" fontSize="14px">{row.resolutionTime ?? "—"}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<FiMoreVertical />}
                            variant="outline"
                            size="sm"
                            borderRadius="4px"
                          />
                          <MenuList minWidth="120px">
                            <MenuItem
                              onClick={() =>
                                history.push(`/admin/workflow/review/${row.workflowId}`, { workflow: row })
                              }
                            >
                              View
                            </MenuItem>
                            <MenuItem>Archive report</MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
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
            Showing {filteredWorkflows.length} out of {workflows.length} items
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

export const AutomatedApprovalWorkflowRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AutomatedApprovalWorkflow {...props} />} />
  );
};

export default AutomatedApprovalWorkflowRoute;
