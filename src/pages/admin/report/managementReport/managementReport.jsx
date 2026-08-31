import SystemReport from "./systemReport";
import { Route } from "react-router-dom";
import { useState } from "react";
import { Box } from "@chakra-ui/layout";
import EnrollmentReport from "./enrollmentReport";
import MultiSearchReport from "./multiSearchReport";
import BulkReport from "./bulkDataReport";
import CourseReport from "./courseReport"
import { Button, Breadcrumb, Link, ExportMenu } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  mockCourseReportsResponse,
  mockCourseRoasterReportsResponse,
  mockBulkDataReportsResponse,
  mockSystemReportsResponse,
  mockMultiSearchReportsResponse,
} from "../../../../mocks/server/controllers/management-report/reponses";

const useStyles = makeStyles((theme) => ({
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    padding: "16px",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.07)",
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    marginBottom: 16,
    color: "#000",
  },
  percentage: {
    fontSize: 48,
    fontWeight: 700,
    color: "#000",
    marginBottom: 12,
  },
  change: {
    fontSize: 20,
    fontWeight: 500,
    color: "#1A8F3A", // Green like your design
  },
  tab: {
    whiteSpace: "nowrap",
    minWidth: "auto",
    paddingLeft: 20,
    paddingRight: 20,
  }
}));

const ManagementReport = () => {
  const [viewMode, setViewMode] = useState(0);
  const classes = useStyles();

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  let headers = [];
  let rowsData = [];
  let mapRow = () => [];
  let exportFilename = "management-report";
  let exportTitle = "Management Report";

  switch (viewMode) {
    case 0:
      headers = ["ID", "Course", "Instructor", "Total", "Approved", "Completed", "Dropped", "Trend"];
      rowsData = mockCourseReportsResponse.data.rows;
      mapRow = (r) => [r.id, r.course, r.instructor, r.total, r.approved, r.completed, r.dropped, r.trend];
      exportFilename = "enrollment-status-report";
      exportTitle = "Enrollment Status Report";
      break;
    case 1:
      headers = ["ID", "Student Name", "Email", "Course", "Enrollment Date", "Status", "Attendance", "Score"];
      rowsData = mockCourseRoasterReportsResponse.data.rows;
      mapRow = (r) => [r.id, r.studentName, r.email, r.course, r.enrollmentDate, r.status, r.attendance, r.score];
      exportFilename = "course-roaster-report";
      exportTitle = "Course Roaster Report";
      break;
    case 2:
      headers = ["ID", "Operation Mode", "File Name", "Date/Time", "Records", "Successful", "Failed", "User", "Status"];
      rowsData = mockBulkDataReportsResponse.data.rows;
      mapRow = (r) => [r.id, r.operationMode, r.fileName, r.dateTime, r.record, r.successful, r.failed, r.user, r.status];
      exportFilename = "bulk-user-data-report";
      exportTitle = "Bulk User Data Report";
      break;
    case 3:
      headers = ["ID", "User", "Role", "Weekly Logins", "Avg Duration (mins)", "Device", "Browser", "Last Login"];
      rowsData = mockSystemReportsResponse.data.rows;
      mapRow = (r) => [r.id, r.user, r.role, r.loginWeekly, r.avgDuration, r.device, r.browserType, r.lastLogin];
      exportFilename = "system-utilization-report";
      exportTitle = "System Utilization Report";
      break;
    case 4:
      headers = ["ID", "Name", "Course Code", "Enrollment Date"];
      rowsData = mockMultiSearchReportsResponse.data.rows;
      mapRow = (r) => [r.id, r.name, r.courseCode, r.enrollmentDate];
      exportFilename = "multi-search-custom-report";
      exportTitle = "Multi-search / Custom Report";
      break;
    default:
      break;
  }

  const exportRows = rowsData.length ? [headers, ...rowsData.map(mapRow)] : [];

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
              <Link href="/admin/report/managementReport">Management Report</Link>
            </BreadcrumbItem>
          }
        />

        <Box display={"flex"} gap="8px">
          <Button secondary link={`/admin/announcement/edit/?announcement=new`}>
            Schedule report
          </Button>
          <ExportMenu
            rows={exportRows}
            filename={exportFilename}
            title={exportTitle}
            label="Export Dashboard"
          />
        </Box>
      </Box>

      <Box className={classes.tabsContainer}>
        <Tabs
          className=""
          value={viewMode}
          onChange={handleViewModeChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab className={classes.tab} label="Enrollment Status Report" />
          <Tab className={classes.tab} label="Course Roaster Report" />
          <Tab className={classes.tab} label="Bulk User Data Report" />
          <Tab className={classes.tab} label="System Utiization Report" />
          <Tab className={classes.tab} label="Multi-search / Custom Report " />
        </Tabs>
      </Box>
      <Box mt={3}>
        {viewMode === 0 && <EnrollmentReport />}
        {viewMode === 1 && <CourseReport />}
        {viewMode === 2 && <BulkReport />}
        {viewMode === 3 && <SystemReport />}
        {viewMode === 4 && <MultiSearchReport />}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ManagementReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ManagementReport />} />;
};

export default ManagementReportRoute;
