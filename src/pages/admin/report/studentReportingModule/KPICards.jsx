import { SimpleGrid } from "@chakra-ui/layout";
import { DashboardMetricCard } from "../../../../components";

const KPICards = ({ kpis }) => {
  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
      <DashboardMetricCard
        title="Total Students"
        value={`${kpis?.total_students ?? 0}`}
        change="enrolled learners"
        changeColor="#6B006B"
      />
      <DashboardMetricCard
        title="Reports Generated"
        value={`${kpis?.total_reports ?? 0}`}
        change={`${kpis?.reports_this_month ?? 0} this month`}
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
  );
};

export default KPICards;
