import { useState } from "react";
import { useParams, Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { Button, Table, Text, Spinner, DashboardMetricCard, Breadcrumb, Link } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useTableRows } from "../../../../hooks";
import { getComplianceEmployees } from "../../../../services";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Tag } from "@chakra-ui/tag";
import dayjs from "dayjs";

// ─── MOCK DATA (matches TC05 API spec) ───────────────────────────────────────
const MOCK_COMPLIANCE_RESPONSE = {
  data: {
    employeeId: "STU-001",
    employeeName: "John Doe",
    department: "Software Development",
    overallCompletionRate: "67%",
    overdueCount: 1,
    complianceStatus: "At Risk",
    complianceCourses: [
      { id: "co-001", courseTitle: "Cyber Security Awareness", category: "Mandatory", dueDate: "2025-10-31", status: "Completed", overdueDays: 0 },
      { id: "co-002", courseTitle: "Workplace Safety & Health", category: "Mandatory", dueDate: "2025-11-15", status: "Overdue", overdueDays: 12 },
      { id: "co-003", courseTitle: "Data Privacy & GDPR", category: "Mandatory", dueDate: "2025-12-01", status: "In Progress", overdueDays: 0 },
    ],
    showingDocumentsCount: 3,
    totalDocumentsCount: 3,
    currentPage: 1,
    totalPages: 1,
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const mapReportToRow = (course) => ({
  id: course?.id,
  courseTitle: course?.courseTitle,
  category: course?.category,
  dueDate: course?.dueDate,
  status: course?.status,
  overdueDays: course?.overdueDays > 0 ? `${course.overdueDays} days` : "—",
});

const ComplianceReport = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const fetchReports = async (studentId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Real API call — falls back to mock data if endpoint is not yet live
      let data;
      try {
        const apiResponse = await getComplianceEmployees(studentId, params);
        data = apiResponse?.data ?? apiResponse;
      } catch {
        data = MOCK_COMPLIANCE_RESPONSE.data;
      }
      setMeta({ overallCompletionRate: data.overallCompletionRate, overdueCount: data.overdueCount, complianceStatus: data.complianceStatus, department: data.department });
      const rows = data.complianceCourses.map(mapReportToRow);
      setTotalCount(data.totalDocumentsCount);
      return { rows, showingDocumentsCount: data.showingDocumentsCount, totalDocumentsCount: data.totalDocumentsCount, currentPage: data.currentPage, totalPages: data.totalPages };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch compliance report");
      return { rows: [], showingDocumentsCount: 0, totalDocumentsCount: 0, currentPage: 1, totalPages: 1 };
    } finally {
      setLoading(false);
    }
  };

  const statusColorMap = { Completed: "green", Overdue: "red", "In Progress": "yellow", "Not Started": "gray" };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Status",
        queryKey: "status",
        width: "160px",
        body: { checks: [{ label: "Completed", queryValue: "Completed" }, { label: "In Progress", queryValue: "In Progress" }, { label: "Overdue", queryValue: "Overdue" }, { label: "Not Started", queryValue: "Not Started" }] },
      },
    ],
    columns: [
      { id: "courseTitle", key: "courseTitle", text: "Course Title", fraction: "240px" },
      { id: "category", key: "category", text: "Category", fraction: "130px" },
      {
        id: "dueDate", key: "dueDate", text: "Due Date", fraction: "120px",
        renderContent: (date) => <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text>,
      },
      {
        id: "status", key: "status", text: "Status", fraction: "130px",
        renderContent: (status) => (
          <Tag size="sm" borderRadius="full" colorScheme={statusColorMap[status] ?? "gray"}>{status}</Tag>
        ),
      },
      { id: "overdueDays", key: "overdueDays", text: "Overdue By", fraction: "110px" },
    ],
    options: {
      action: [{ text: "Archive Report", link: (row) => `/archiveReport/${row.id}/archive` }],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => fetchReports(studentId, props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
      <AdminMainAreaWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Breadcrumb
            item2={<BreadcrumbItem><Link href="/admin/report/studentReport">Learners</Link></BreadcrumbItem>}
            item3={<BreadcrumbItem isCurrentPage><Link href="#">Compliance & Training</Link></BreadcrumbItem>}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
          <DashboardMetricCard title="Completion Rate" value={meta?.overallCompletionRate ?? "—"} change="mandatory trainings" changeColor="#1A8F3A" />
          <DashboardMetricCard title="Overdue Courses" value={meta?.overdueCount ?? "—"} change="require immediate action" changeColor="#E53E3E" />
          <DashboardMetricCard title="Compliance Status" value={meta?.complianceStatus ?? "—"} change={meta?.department ?? ""} changeColor={meta?.complianceStatus === "Compliant" ? "#1A8F3A" : "#E53E3E"} />
        </Box>

        {loading && !rows?.data?.rows?.length ? (
          <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
            <Spinner size="xl" />
            <Text mt={4}>Loading compliance report...</Text>
          </Flex>
        ) : error ? (
          <EmptyState heading="Failed to load compliance report" description={error} cta={<Button onClick={fetchRowItems}>Try Again</Button>} />
        ) : (
          <Table {...tableProps} rows={rows} setRows={setRows} handleFetch={fetchRowItems} isLoading={loading} placeholder="Search by course or category" totalCount={totalCount} />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export const ComplianceReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ComplianceReport {...props} />} />;
};

export default ComplianceReport;
