import { useRef, useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import { BreadcrumbItem, Tag, useToast } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Table,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import {
  adminGetParticipationMonitoringReport,
  exportParticipationMonitoringReport,
} from "../../../../services";
import { downloadBlob } from "../../../../utils";

// e.g. "application/vnd.openxmlformats...spreadsheet" -> "xlsx"
const extFromMimeType = (type) => {
  if (!type) return "xlsx";
  if (type.includes("pdf")) return "pdf";
  if (type.includes("csv")) return "csv";
  if (type.includes("spreadsheet") || type.includes("excel")) return "xlsx";
  return "xlsx";
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
  const [exporting, setExporting] = useState(false);
  const lastParamsRef = useRef({});

  const fetchReport = async (params = {}) => {
    lastParamsRef.current = params;
    try {
      const result = await adminGetParticipationMonitoringReport(params);
      const reportData = result?.data ?? {};
      let rows = (reportData.data ?? []).map(mapToRow);

      const searchTerm = params.search?.toString().trim().toLowerCase();
      if (searchTerm) {
        rows = rows.filter(
          (row) =>
            row.studentName.toLowerCase().includes(searchTerm) ||
            row.studentEmail.toLowerCase().includes(searchTerm),
        );
      }

      const total = searchTerm ? rows.length : reportData.total ?? rows.length;
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 50;

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
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportParticipationMonitoringReport(lastParamsRef.current);
      downloadBlob(blob, `participation-monitoring-report.${extFromMimeType(blob.type)}`);
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "Unable to export participation report",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

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
          {participationData.length > 0 && (
            <Button onClick={handleExport} isLoading={exporting}>
              Export
            </Button>
          )}
          <Button onClick={fetchRowItems}>Refresh Report</Button>
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
