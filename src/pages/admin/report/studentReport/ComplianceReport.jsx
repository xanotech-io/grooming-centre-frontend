import { Box, Flex } from "@chakra-ui/layout";
import { Route } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
} from "../../../../components";
import { useTableRows } from "../../../../hooks";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  adminAddOjtSupervisorFeedback,
  adminCreateOjtActivity,
  adminGetOjtActivities,
  adminUpdateOjtActivity,
} from "../../../../services";

const ComplianceReport = () => {
  const { studentId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const safeStudentId =
    !studentId || studentId === "undefined" ? "LRN-001" : studentId;

  const fetchAttendanceReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { activities, pagination } = await adminGetOjtActivities({
        ...params,
        learnerId: safeStudentId,
      });

      const rows = activities?.map((report) => mapReportToRow(report)) || [];

      setTotalCount(pagination?.count || rows.length);

      return {
        rows,
        showingDocumentsCount: rows.length,
        totalDocumentsCount: pagination?.count || 0,
        currentPage: pagination?.page || 1,
        totalPages: pagination?.totalPages || 1,
      };
    } catch (err) {
      setError(err.message || "Unable to fetch student reports");
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    } finally {
      setLoading(false);
    }
  };

  const mapReportToRow = (report) => ({
    id: report?.ojtId,
    learnerId: report?.learnerId,
    learnerName: report?.learnerName,
    companyDepartment: report?.companyDepartment,
    supervisorName: report?.supervisorName,
    tasksCompleted: `${report?.tasksCompleted}/${report?.tasksAssigned?.length || 0}`,
    attendance: `${report?.attendance?.daysAttended || 0}/${report?.attendance?.totalDays || 0}`,
    competencyRating: report?.competencyRating,
    completionStatus: report?.completionStatus,
    updatedAt: report?.updatedAt,
  });

  const handleCreateOjtActivity = async () => {
    try {
      const { message } = await adminCreateOjtActivity({
        learnerId: safeStudentId,
        learnerName: `Learner ${safeStudentId}`,
        companyDepartment: "ABC Farms",
        supervisorId: "SUPER-001",
        supervisorName: "Mr. Adebayo",
        ojtStartDate: new Date().toISOString(),
        ojtEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        tasksAssigned: ["Soil preparation", "Seed planting", "Irrigation management"],
        tasksCompleted: 1,
        attendance: { daysAttended: 1, totalDays: 14 },
        competencyRating: 3,
        feedback: "Initial onboarding completed",
        completionStatus: "In Progress",
        remarks: "New OJT record created from Compliance report",
      });

      toast({ description: message, position: "top", status: "success" });
      fetchRowItems();
    } catch (requestError) {
      toast({
        description: requestError.message || "Failed to create OJT activity",
        position: "top",
        status: "error",
      });
    }
  };

  const handleUpdateFirstActivity = async () => {
    if (!rows.length) return;

    try {
      const firstActivityId = rows[0].id;
      const [completedTasks, totalTasks] = String(rows[0].tasksCompleted)
        .split("/")
        .map((value) => Number(value));

      const { message } = await adminUpdateOjtActivity(firstActivityId, {
        tasksCompleted: Math.min(totalTasks, completedTasks + 1),
        completionStatus:
          completedTasks + 1 >= totalTasks ? "Completed" : "In Progress",
        competencyRating: Number(rows[0].competencyRating || 3),
        remarks: "Progress updated from Compliance report",
      });

      toast({ description: message, position: "top", status: "success" });
      fetchRowItems();
    } catch (requestError) {
      toast({
        description: requestError.message || "Failed to update OJT activity",
        position: "top",
        status: "error",
      });
    }
  };

  const handleAddFeedback = async () => {
    if (!rows.length) return;

    try {
      const firstActivityId = rows[0].id;
      const { message } = await adminAddOjtSupervisorFeedback(firstActivityId, {
        feedback: "Supervisor feedback added from compliance dashboard",
        remarks: "Track learner consistency in daily activities",
      });

      toast({ description: message, position: "top", status: "success" });
      fetchRowItems();
    } catch (requestError) {
      toast({
        description: requestError.message || "Failed to add feedback",
        position: "top",
        status: "error",
      });
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "status",
        width: "150px",
        body: {
          checks: [
            { label: "Completed", queryValue: "Completed" },
            { label: "In Progress", queryValue: "In Progress" },
            { label: "Not Started", queryValue: "Not Started" },
          ],
        },
      },
    ],
    columns: [
      {
        id: "learnerId",
        key: "learnerId",
        text: "Learner ID",
        fraction: "200px",
      },
      {
        id: "learnerName",
        key: "learnerName",
        text: "Learner Name",
        fraction: "200px",
      },
      {
        id: "companyDepartment",
        key: "companyDepartment",
        text: "Company Department",
        fraction: "150px",
      },
      {
        id: "supervisorName",
        key: "supervisorName",
        text: "Supervisor",
        fraction: "150px",
      },
      {
        id: "tasksCompleted",
        key: "tasksCompleted",
        text: "Tasks",
        fraction: "150px",
      },
      {
        id: "attendance",
        key: "attendance",
        text: "Attendance",
        fraction: "120px",
      },
      {
        id: "completionStatus",
        key: "completionStatus",
        text: "Completion Status",
        fraction: "180px",
      },
      {
        id: "updatedAt",
        key: "updatedAt",
        text: "Updated At",
        fraction: "180px",
        renderContent: (value) => value?.slice(0, 10) || "-",
      },
      {
        id: "competencyRating",
        key: "competencyRating",
        text: "Competency",
        fraction: "220px",
      },
    ],

    options: {
      action: [
        {
          text: "View OJT",
          link: (row) => `/admin/report/studentReport/${row.learnerId}/compliance`,
        },
      ],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchAttendanceReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <>
      <AdminMainAreaWrapper>
        <Box
          display={"flex"}
          // width={'100%'}
          justifyContent="space-between"
          gridGap={4}
          mb={10}
        >
          <DashboardMetricCard
            title="OJT Completion"
            value="68%"
            change="+4% vs last month"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="In Progress"
            value="21"
            change="active learners"
            changeColor="#1A8F3A"
          />

          <DashboardMetricCard
            title="Supervisor Feedback"
            value="14"
            change="entries this week"
            changeColor="#1A8F3A"
          />
        </Box>

        <Flex mb={6} gap={3} wrap="wrap">
          <Button onClick={handleCreateOjtActivity}>Create OJT Activity</Button>
          <Button secondary onClick={handleUpdateFirstActivity}>
            Update First Activity
          </Button>
          <Button secondary onClick={handleAddFeedback}>
            Add Supervisor Feedback
          </Button>
        </Flex>

        {loading && rows.length === 0 ? (
          <Flex
            h="400px"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Spinner size="xl" />
            <Text mt={4}>Loading student reports...</Text>
          </Flex>
        ) : error ? (
          <EmptyState
            heading="Failed to load student reports"
            description={error}
            cta={<Button onClick={fetchRowItems}>Try Again</Button>}
          />
        ) : (
          <Table
            {...tableProps}
            rows={rows}
            setRows={setRows}
            handleFetch={fetchRowItems}
            isLoading={loading}
            placeholder="Search by learner, department, or supervisor"
            totalCount={totalCount}
          />
        )}
      </AdminMainAreaWrapper>
    </>
  );
};

export const ComplianceReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ComplianceReport {...props} />} />;
};

export default ComplianceReport;
