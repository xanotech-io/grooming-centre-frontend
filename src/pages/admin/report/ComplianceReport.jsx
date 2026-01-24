import { Box } from '@chakra-ui/layout';
import { DashboardMetricCard } from "../../../components";

const ComplianceReport = () => {
  return (
    <>
      <Box
        display={"flex"}
        // width={'100%'}
        justifyContent="space-between"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Completion Percentage"
          value="82%"
          change="+5% vs last month"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Non-Compliance Ratio"
          value="15%"
          change="+5% vs last semester"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Overdue Count"
          value="10"
          change="per course"
          changeColor="#1A8F3A"
        />
      </Box>
      
    </>
  );
};

export default ComplianceReport;
