import { SimpleGrid } from "@chakra-ui/layout";
import { DashboardMetricCard } from "../../../../components";

const KPICards = ({ kpis }) => {
  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
      <DashboardMetricCard
        title="Avg. Participation"
        value={kpis?.avgParticipationRate != null ? `${kpis.avgParticipationRate}%` : "—"}
        change="across all students"
        changeColor="#2C5282"
      />
      <DashboardMetricCard
        title="Active Students"
        value={kpis?.totalActiveStudents ?? "—"}
        change="currently engaged"
        changeColor="#1A8F3A"
      />
      <DashboardMetricCard
        title="Inactive Students"
        value={kpis?.totalInactiveStudents ?? "—"}
        change="need intervention"
        changeColor="#C53030"
      />
      <DashboardMetricCard
        title="Irregular Students"
        value={kpis?.totalIrregularStudents ?? "—"}
        change="inconsistent activity"
        changeColor="#B7791F"
      />
      <DashboardMetricCard
        title="Alerts Triggered"
        value={kpis?.alertsTriggered ?? "—"}
        change={`${kpis?.reportsGeneratedThisMonth ?? 0} reports this month`}
        changeColor="#C53030"
      />
    </SimpleGrid>
  );
};

export default KPICards;
