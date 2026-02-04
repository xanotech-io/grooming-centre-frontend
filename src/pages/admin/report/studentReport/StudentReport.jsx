import { useState } from "react";
import { Route } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
import ProgressReport from "./ProgressReport";
import TranscriptReport from "./TranscriptReport";
import ComplianceReport from "./ComplianceReport";
import AssessmentReport from "./AssessmentReport";
import AttendanceReport from "./AttendanceReport";
import { Button, Breadcrumb, Link } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";

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
    paddingLeft: 40,
    paddingRight: 40,
  }
}));

const StudentReport = () => {
  const [viewMode, setViewMode] = useState(0);
  const classes = useStyles();

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
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
              <Link href="/admin/report/studentReport">Student Report</Link>
            </BreadcrumbItem>
          }
        />

        <Box display={"flex"} gap="8px">
          <Button secondary link={`/admin/announcement/edit/?announcement=new`}>
            Schedule report
          </Button>
          <Button link={`/admin/announcement/edit/?announcement=new`}>
            Export Dashboard
          </Button>
        </Box>
      </Box>

      <Box className={classes.tabsContainer}>
        <Tabs className="" value={viewMode} onChange={handleViewModeChange}>
          <Tab className={classes.tab} label="Progress Report" />
          <Tab className={classes.tab} label="Transcript Report" />
          <Tab className={classes.tab} label="Attendance Report" />
          <Tab className={classes.tab} label="Assessment & Quizzes" />
          <Tab className={classes.tab} label="Compliance & Training" />
        </Tabs>
      </Box>
      <Box mt={3}>
        {viewMode === 0 && <ProgressReport />}
        {viewMode === 1 && <TranscriptReport />}
        {viewMode === 2 && <AttendanceReport />}
        {viewMode === 3 && <AssessmentReport />}
        {viewMode === 4 && <ComplianceReport />}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const StudentReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <StudentReport />} />;
};

export default StudentReportRoute;