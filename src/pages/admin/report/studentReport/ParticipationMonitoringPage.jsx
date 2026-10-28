import { useCallback, useRef, useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import {
  BreadcrumbItem,
  Button as ChakraButton,
  ButtonGroup,
  Tag,
  useToast,
} from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  ExportMenu,
  Heading,
  Link,
  SearchableSelect,
  Table,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import {
  adminGetCourseListing,
  adminGetParticipationMonitoringReport,
  adminGetUserListing,
  adminListModules,
} from "../../../../services";

const EMPTY_SELECTION = {
  studentId: "",
  studentLabel: "",
  courseId: "",
  courseLabel: "",
  moduleId: "",
  moduleLabel: "",
};

const EMPTY_TABLE_RESULT = {
  rows: [],
  showingDocumentsCount: 0,
  totalDocumentsCount: 0,
  currentPage: 1,
  totalPages: 1,
};

// The users endpoint doesn't reliably honour `search`/`role`, so matching is
// done client-side, falling back to a one-time full user list.
let allUsersPromise = null;
const getAllUsers = () => {
  if (!allUsersPromise) {
    allUsersPromise = adminGetUserListing({ limit: 1000 })
      .then((res) => res.users ?? [])
      .catch(() => {
        allUsersPromise = null;
        return [];
      });
  }
  return allUsersPromise;
};

const matchStudents = (users, query) => {
  const q = query?.trim().toLowerCase() ?? "";
  return users.filter((u) => {
    if (/admin|instructor/i.test(u.userRoleName ?? "")) return false;
    if (!q) return true;
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
    return name.includes(q) || u.email?.toLowerCase().includes(q);
  });
};

const fetchStudentOptions = async (query) => {
  let matches = [];
  try {
    const res = await adminGetUserListing({ search: query, limit: 20 });
    matches = matchStudents(res.users ?? [], query);
  } catch {
    // fall through to the full-list lookup
  }
  if (!matches.length) matches = matchStudents(await getAllUsers(), query);

  return matches.slice(0, 20).map((u) => ({
    id: u.id,
    label: `${u.firstName} ${u.lastName}`.trim(),
    sub: u.email,
  }));
};

const fetchCourseOptions = async (query) => {
  const res = await adminGetCourseListing({ search: query, limit: 10 });
  return (res.courses ?? []).map((c) => ({ id: c.id, label: c.title }));
};

const engagementColorMap = {
  Active: "green",
  Irregular: "yellow",
  Inactive: "red",
};

const mapToRow = (item) => ({
  id: item.student_id,
  studentId: item.student_id,
  studentName: item.student_name ?? "—",
  studentEmail: item.student_email ?? "—",
  participationScore: item.participation_score ?? 0,
  activityType:
    Array.isArray(item.activity_type) && item.activity_type.length
      ? item.activity_type.join(" / ")
      : "None",
  frequencyOfAccess: item.frequency_of_access ?? 0,
  lastActiveDate: item.last_active_date
    ? new Date(item.last_active_date).toLocaleDateString()
    : "—",
  daysSinceActive: item.days_since_active ?? "—",
  engagementStatus: item.engagement_status ?? "—",
  alertTriggered: item.alert_triggered ?? false,
  remarks: item.remarks ?? "—",
});

const ParticipationMonitoringPage = () => {
  const toast = useToast();
  const [totalCount, setTotalCount] = useState(0);
  const [kpis, setKpis] = useState(null);
  const lastParamsRef = useRef({});
  // "student" or "course" (course & module)
  const [filterMode, setFilterMode] = useState("student");
  const [selection, setSelection] = useState(EMPTY_SELECTION);
  // Filter the report is currently showing; nothing is fetched until one is applied
  const [appliedFilter, setAppliedFilter] = useState(null);
  const appliedFilterRef = useRef(null);
  const modulesCacheRef = useRef({});

  const fetchModuleOptions = useCallback(
    async (query) => {
      const courseId = selection.courseId;
      if (!courseId) return [];
      if (!modulesCacheRef.current[courseId]) {
        const { modules } = await adminListModules(courseId);
        modulesCacheRef.current[courseId] = modules ?? [];
      }
      const q = query?.trim().toLowerCase();
      return modulesCacheRef.current[courseId]
        .filter((m) => !q || m.title?.toLowerCase().includes(q))
        .map((m) => ({ id: m.id, label: m.title }));
    },
    [selection.courseId],
  );
  // Full (unpaginated) report per filter combination, used for searching
  const fullReportCacheRef = useRef({});

  // The backend ignores `search`, so searching has to run over every student,
  // not just the rows of the current page.
  const fetchFullReport = async (params) => {
    const { search, page, limit, ...filters } = params;
    const cacheKey = JSON.stringify(filters);
    if (fullReportCacheRef.current[cacheKey]) {
      return fullReportCacheRef.current[cacheKey];
    }

    const firstPage = await adminGetParticipationMonitoringReport({
      ...filters,
      page: 1,
      limit: 100,
    });
    let reportData = firstPage?.data ?? {};
    const total = reportData.total ?? 0;

    if (total > (reportData.data ?? []).length) {
      const allPages = await adminGetParticipationMonitoringReport({
        ...filters,
        page: 1,
        limit: total,
      });
      reportData = allPages?.data ?? reportData;
    }

    fullReportCacheRef.current[cacheKey] = reportData;
    return reportData;
  };

  const fetchReport = async (tableParams = {}) => {
    lastParamsRef.current = tableParams;
    if (!appliedFilterRef.current) {
      setKpis(null);
      setTotalCount(0);
      return EMPTY_TABLE_RESULT;
    }
    const params = { ...tableParams, ...appliedFilterRef.current.params };
    try {
      const searchTerm = params.search?.toString().trim().toLowerCase();
      const limit = Number(params.limit) || 50;
      let page = Number(params.page) || 1;
      let rows;
      let total;
      let reportData;

      if (searchTerm) {
        reportData = await fetchFullReport(params);
        const matches = (reportData.data ?? [])
          .map(mapToRow)
          .filter(
            (row) =>
              row.studentName.toLowerCase().includes(searchTerm) ||
              row.studentEmail.toLowerCase().includes(searchTerm),
          );
        total = matches.length;
        page = Math.min(page, Math.ceil(total / limit) || 1);
        rows = matches.slice((page - 1) * limit, page * limit);
      } else {
        const result = await adminGetParticipationMonitoringReport(params);
        reportData = result?.data ?? {};
        rows = (reportData.data ?? []).map(mapToRow);
        total = reportData.total ?? rows.length;
      }

      setKpis(reportData.kpis ?? null);
      setTotalCount(total);

      return {
        rows,
        showingDocumentsCount: rows.length,
        totalDocumentsCount: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "Unable to fetch participation report",
        duration: 3000,
        isClosable: true,
      });
      return EMPTY_TABLE_RESULT;
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Engagement Status",
        queryKey: "engagementStatus",
        width: "200px",
        body: {
          checks: [
            { label: "Active", queryValue: "Active" },
            { label: "Irregular", queryValue: "Irregular" },
            { label: "Inactive", queryValue: "Inactive" },
          ],
        },
      },
      {
        triggerText: "Alert Triggered",
        queryKey: "alertTriggered",
        width: "180px",
        body: {
          checks: [{ label: "Alerts Only", queryValue: "true" }],
        },
      },
    ],
    options: {
      dateFilter: true,
      action: [
        {
          text: "View Details",
          link: (row) =>
            `/admin/report/participation-monitoring/${row.studentId}`,
        },
      ],
      selection: false,
      pagination: true,
    },
    columns: [
      {
        id: "studentName",
        key: "studentName",
        text: "Student Name",
        fraction: "190px",
        renderContent: (value) => (
          <Text fontWeight="600" fontSize="14px" color="#101828">
            {value}
          </Text>
        ),
      },
      {
        id: "studentEmail",
        key: "studentEmail",
        text: "Email",
        fraction: "210px",
      },
      {
        id: "participationScore",
        key: "participationScore",
        text: "Participation (%)",
        fraction: "150px",
        renderContent: (score) => (
          <Text
            fontWeight="600"
            color={
              score >= 70 ? "#1A8F3A" : score >= 40 ? "#B7791F" : "#C53030"
            }
          >
            {score}%
          </Text>
        ),
      },
      {
        id: "activityType",
        key: "activityType",
        text: "Activity Type",
        fraction: "160px",
      },
      {
        id: "frequencyOfAccess",
        key: "frequencyOfAccess",
        text: "Frequency",
        fraction: "110px",
      },
      {
        id: "lastActiveDate",
        key: "lastActiveDate",
        text: "Last Active",
        fraction: "120px",
      },
      {
        id: "daysSinceActive",
        key: "daysSinceActive",
        text: "Days Inactive",
        fraction: "120px",
      },
      {
        id: "engagementStatus",
        key: "engagementStatus",
        text: "Status",
        fraction: "120px",
        renderContent: (status) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={engagementColorMap[status] ?? "gray"}
          >
            {status}
          </Tag>
        ),
      },
      {
        id: "alertTriggered",
        key: "alertTriggered",
        text: "Alert",
        fraction: "90px",
        renderContent: (triggered) =>
          triggered ? (
            <Tag size="sm" borderRadius="full" colorScheme="red">
              Yes
            </Tag>
          ) : (
            <Tag size="sm" borderRadius="full" colorScheme="gray">
              No
            </Tag>
          ),
      },
      {
        id: "remarks",
        key: "remarks",
        text: "Remarks",
        fraction: "220px",
      },
    ],
  };

  const fetcher = (props) => async () => fetchReport(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const participationData = rows?.data?.rows ?? [];

  const canApplyFilter =
    filterMode === "student" ? !!selection.studentId : !!selection.courseId;

  const runWithFilter = (filter) => {
    appliedFilterRef.current = filter;
    setAppliedFilter(filter);
    fullReportCacheRef.current = {};
    fetchRowItems({ params: { ...lastParamsRef.current, page: 1 } });
  };

  const handleApplyFilter = () => {
    if (!canApplyFilter) return;
    if (filterMode === "student") {
      runWithFilter({
        params: { studentId: selection.studentId },
        labels: [`Student: ${selection.studentLabel}`],
      });
    } else {
      const params = { courseId: selection.courseId };
      const labels = [`Course: ${selection.courseLabel}`];
      if (selection.moduleId) {
        params.moduleId = selection.moduleId;
        labels.push(`Module: ${selection.moduleLabel}`);
      }
      runWithFilter({ params, labels });
    }
  };

  const handleClearFilter = () => {
    setSelection(EMPTY_SELECTION);
    runWithFilter(null);
  };

  const handleModeChange = (mode) => {
    if (mode === filterMode) return;
    setFilterMode(mode);
    setSelection(EMPTY_SELECTION);
  };

  const exportRows = [
    [
      "Student Name",
      "Email",
      "Participation (%)",
      "Activity Type",
      "Frequency",
      "Last Active",
      "Days Inactive",
      "Status",
      "Alert",
      "Remarks",
    ],
    ...participationData.map((r) => [
      r.studentName,
      r.studentEmail,
      r.participationScore != null ? `${r.participationScore}%` : "0%",
      r.activityType,
      r.frequencyOfAccess,
      r.lastActiveDate,
      r.daysSinceActive,
      r.engagementStatus,
      r.alertTriggered ? "Yes" : "No",
      r.remarks,
    ]),
  ];

  return (
    <AdminMainAreaWrapper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/participation-monitoring">
                Participation Monitoring
              </Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap="8px">
          <ExportMenu
            rows={exportRows}
            filename="participation-monitoring-report"
            title="Student Participation Monitoring Report"
            isDisabled={participationData.length === 0}
          />
          <Button
            disabled={!appliedFilter}
            onClick={() => {
              fullReportCacheRef.current = {};
              fetchRowItems({ params: lastParamsRef.current });
            }}
          >
            Refresh Report
          </Button>
        </Flex>
      </Box>

      <Flex
        justifyContent="space-between"
        flexDirection={{ lg: "row", base: "column", md: "column" }}
        alignItems={{ base: "flex-start", md: "flex-start" }}
        rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            Student Participation Monitoring
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Real-time insights into student engagement across all learning
            activities
          </Text>
        </Box>
      </Flex>

      <Box
        border="1px solid"
        borderColor="accent.2"
        borderRadius="8px"
        p={4}
        mb={6}
      >
        <Flex
          gap={4}
          flexWrap="wrap"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Box>
            <Text fontSize="13px" fontWeight="600" mb={2}>
              Filter by
            </Text>
            <ButtonGroup size="sm" isAttached variant="outline">
              <ChakraButton
                colorScheme={filterMode === "student" ? "purple" : "gray"}
                variant={filterMode === "student" ? "solid" : "outline"}
                onClick={() => handleModeChange("student")}
              >
                Student
              </ChakraButton>
              <ChakraButton
                colorScheme={filterMode === "course" ? "purple" : "gray"}
                variant={filterMode === "course" ? "solid" : "outline"}
                onClick={() => handleModeChange("course")}
              >
                Course &amp; Module
              </ChakraButton>
            </ButtonGroup>
          </Box>

          <Flex gap={3} flexWrap="wrap" alignItems="flex-end" flex="1">
            {filterMode === "student" ? (
              <Box w={{ base: "100%", md: "300px" }}>
                <Text fontSize="13px" fontWeight="600" mb={2}>
                  Student
                </Text>
                <SearchableSelect
                  placeholder="Search student by name..."
                  fetchOptions={fetchStudentOptions}
                  selectedLabel={selection.studentLabel}
                  onSelect={(id, label) =>
                    setSelection((s) => ({
                      ...s,
                      studentId: id,
                      studentLabel: label,
                    }))
                  }
                />
              </Box>
            ) : (
              <>
                <Box w={{ base: "100%", md: "280px" }}>
                  <Text fontSize="13px" fontWeight="600" mb={2}>
                    Course
                  </Text>
                  <SearchableSelect
                    placeholder="Search course..."
                    fetchOptions={fetchCourseOptions}
                    selectedLabel={selection.courseLabel}
                    onSelect={(id, label) =>
                      setSelection((s) => ({
                        ...s,
                        courseId: id,
                        courseLabel: label,
                        moduleId: "",
                        moduleLabel: "",
                      }))
                    }
                  />
                </Box>
                <Box w={{ base: "100%", md: "280px" }}>
                  <Text fontSize="13px" fontWeight="600" mb={2}>
                    Module (optional)
                  </Text>
                  <SearchableSelect
                    placeholder={
                      selection.courseId
                        ? "Search module..."
                        : "Select a course first"
                    }
                    isDisabled={!selection.courseId}
                    fetchOptions={fetchModuleOptions}
                    selectedLabel={selection.moduleLabel}
                    onSelect={(id, label) =>
                      setSelection((s) => ({
                        ...s,
                        moduleId: id,
                        moduleLabel: label,
                      }))
                    }
                  />
                </Box>
              </>
            )}
          </Flex>

          <Flex gap="8px">
            {appliedFilter && (
              <ChakraButton
                size="sm"
                variant="ghost"
                onClick={handleClearFilter}
              >
                Clear Filter
              </ChakraButton>
            )}
            <Button onClick={handleApplyFilter} disabled={!canApplyFilter}>
              Apply Filter
            </Button>
          </Flex>
        </Flex>

        {appliedFilter && (
          <Flex gap={2} mt={3} flexWrap="wrap">
            {appliedFilter.labels.map((label) => (
              <Tag
                key={label}
                size="sm"
                borderRadius="full"
                colorScheme="purple"
              >
                {label}
              </Tag>
            ))}
          </Flex>
        )}
      </Box>

      {!appliedFilter && (
        <Box
          textAlign="center"
          py={10}
          mb={6}
          border="1px dashed"
          borderColor="accent.2"
          borderRadius="8px"
        >
          <Text fontWeight="600" color="#101828">
            No report loaded
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Select a student, or a course and module, then click Apply Filter to
            view participation data.
          </Text>
        </Box>
      )}

      <Box display={appliedFilter ? "block" : "none"}>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
          <DashboardMetricCard
            title="Total Students"
            value={`${kpis?.total_students ?? 0}`}
            change="enrolled learners"
            changeColor="#6B006B"
          />
          <DashboardMetricCard
            title="Avg. Participation"
            value={`${kpis?.average_participation_rate ?? 0}%`}
            change={`${kpis?.active_percentage ?? 0}% active rate`}
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Active Students"
            value={`${kpis?.active_students ?? 0}`}
            change={`${kpis?.active_percentage ?? 0}% of total`}
            changeColor="#1A8F3A"
          />
          <DashboardMetricCard
            title="Inactive Students"
            value={`${kpis?.inactive_students ?? 0}`}
            change={`${kpis?.inactive_percentage ?? 0}% of total`}
            changeColor="#C53030"
          />
          <DashboardMetricCard
            title="Alerts Triggered"
            value={`${kpis?.alerts_triggered ?? 0}`}
            change={`${kpis?.alerts_triggered_percentage ?? 0}% of total`}
            changeColor="#B7791F"
          />
        </SimpleGrid>

        <Table
          {...tableProps}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          placeholder="Search by student name or email..."
          totalCount={totalCount}
        />
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ParticipationMonitoringPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ParticipationMonitoringPage {...props} />}
    />
  );
};

export default ParticipationMonitoringPage;
