import SystemReport from "./systemReport";
import { Route } from "react-router-dom";
import { useState } from "react";
import { Box } from "@chakra-ui/layout";
import EnrollmentReport from "./enrollmentReport";
import CustomerReport from "./customReport";
import BulkReport from "./bulkReport";
import CourseReport from "./courseReport"
import { Button, Breadcrumb, Link } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
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
}));

const ManagementReport = () => {
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
              <Link href="/admin/report">Student Report</Link>
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
          <Tab label="Enrollment Status Report" />
          <Tab label="Course Roaster Report" />
          <Tab label="Bulk User Data Report" />
          <Tab label="System Utiization Report" />
          <Tab label="Management Report" />
        </Tabs>
      </Box>
      <Box mt={3}>
        {viewMode === 0 && <EnrollmentReport />}
        {viewMode === 1 && <CustomerReport />}
        {viewMode === 2 && <BulkReport />}
        {viewMode === 3 && <CustomerReport />}
        {viewMode === 4 && <CourseReport />}
        {viewMode === 5 && <SystemReport />}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ManagementReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ManagementReport />} />;
};

export default ManagementReportRoute;
