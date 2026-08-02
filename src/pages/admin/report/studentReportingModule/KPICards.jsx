import { SimpleGrid } from "@chakra-ui/layout";
import { DashboardMetricCard } from "../../../../components";

const KPICards = ({ kpis }) => {
  const avg = kpis?.avgParticipationRate ?? kpis?.average_participation_rate;
  const active = kpis?.totalActiveStudents ?? kpis?.active_students;
  const inactive = kpis?.totalInactiveStudents ?? kpis?.inactive_students;
  const irregular = kpis?.totalIrregularStudents ?? kpis?.irregular_students;
  const alerts = kpis?.alertsTriggered ?? kpis?.alerts_triggered;
  const total = kpis?.totalStudents ?? kpis?.total_students;

  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
      <DashboardMetricCard
        title="Total Students"
        value={total != null ? total : "—"}
        change="enrolled learners"
        changeColor="#660066"
      />
      <DashboardMetricCard
        title="Avg. Participation"
        value={avg != null ? `${avg}%` : "—"}
        change="across all students"
        changeColor="#2C5282"
      />
      <DashboardMetricCard
        title="Active Students"
        value={active != null ? active : "—"}
        change="score ≥ 70"
        changeColor="#1A8F3A"
      />
      <DashboardMetricCard
        title="Irregular Students"
        value={irregular != null ? irregular : "—"}
        change="score 40–69"
        changeColor="#B7791F"
      />
      <DashboardMetricCard
        title="Alerts Triggered"
        value={alerts != null ? alerts : "—"}
        change={inactive != null ? `${inactive} inactive` : "flagged students"}
        changeColor="#C53030"
      />
    </SimpleGrid>
  );
};

export default KPICards;
