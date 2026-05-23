import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/layout";
import { SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Divider, useToast } from "@chakra-ui/react";
import { Text } from "../../../../components";
import { tc0804GetParticipationSummary, tc0804GetModuleKPIs } from "../../../../services";

const SummaryCard = ({ label, value, helpText, color }) => (
  <Box p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
    <Stat>
      <StatLabel fontSize="sm" color="gray.500">{label}</StatLabel>
      <StatNumber fontSize="2xl" color={color ?? "#101828"}>{value}</StatNumber>
      {helpText && <StatHelpText fontSize="xs">{helpText}</StatHelpText>}
    </Stat>
  </Box>
);

const AdminSummaryTab = () => {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, kpisRes] = await Promise.all([
          tc0804GetParticipationSummary(),
          tc0804GetModuleKPIs(),
        ]);
        setSummary(summaryRes?.summary ?? null);
        setKpis(kpisRes?.kpis ?? null);
      } catch (err) {
        toast({ status: "error", description: err.message || "Failed to load summary", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const data = summary ?? kpis ?? {};

  const totalEngaged =
    (data.totalActiveStudents ?? 0) +
    (data.totalInactiveStudents ?? 0) +
    (data.totalIrregularStudents ?? 0);

  const toPct = (n) =>
    totalEngaged > 0 ? Math.round((n / totalEngaged) * 100) : 0;

  const activePct = toPct(data.totalActiveStudents ?? 0);
  const irregularPct = toPct(data.totalIrregularStudents ?? 0);
  const inactivePct = toPct(data.totalInactiveStudents ?? 0);

  return (
    <Box>
      <Text fontWeight="600" fontSize="md" mb={4}>
        Participation & Engagement Overview
      </Text>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} mb={6}>
        <SummaryCard
          label="Total Students"
          value={loading ? "—" : totalEngaged || "—"}
          helpText="enrolled learners"
          color="#660066"
        />
        <SummaryCard
          label="Active"
          value={loading ? "—" : data.totalActiveStudents ?? 0}
          helpText={`${activePct}% of total`}
          color="#1A8F3A"
        />
        <SummaryCard
          label="Irregular"
          value={loading ? "—" : data.totalIrregularStudents ?? 0}
          helpText={`${irregularPct}% of total`}
          color="#B7791F"
        />
        <SummaryCard
          label="Inactive"
          value={loading ? "—" : data.totalInactiveStudents ?? 0}
          helpText={`${inactivePct}% of total`}
          color="#C53030"
        />
        <SummaryCard
          label="Avg. Participation"
          value={loading ? "—" : data.avgParticipationRate != null ? `${data.avgParticipationRate}%` : "—"}
          helpText="across all students"
          color="#2C5282"
        />
        <SummaryCard
          label="Alerts Triggered"
          value={loading ? "—" : data.alertsTriggered ?? 0}
          helpText="flagged students"
          color="#C53030"
        />
        <SummaryCard
          label="Reports This Month"
          value={loading ? "—" : data.reportsGeneratedThisMonth ?? 0}
          helpText="generated reports"
          color="#660066"
        />
        <SummaryCard
          label="Report Accuracy"
          value={loading ? "—" : data.reportAccuracyRate != null ? `${data.reportAccuracyRate}%` : "—"}
          helpText="data quality score"
          color="#2C5282"
        />
      </SimpleGrid>

      <Divider mb={6} />

      <Box>
        <Text fontWeight="600" fontSize="md" mb={3}>Engagement Distribution</Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {[
            { status: "Active", pct: activePct, color: "#1A8F3A" },
            { status: "Irregular", pct: irregularPct, color: "#B7791F" },
            { status: "Inactive", pct: inactivePct, color: "#C53030" },
          ].map(({ status, pct, color }) => (
            <Box key={status} p={4} borderRadius="lg" border="1px solid" borderColor="gray.100">
              <Text fontSize="sm" color="gray.500" mb={1}>{status}</Text>
              <Box h="8px" borderRadius="full" bg="gray.100" overflow="hidden">
                <Box h="100%" w={`${pct}%`} bg={color} borderRadius="full" transition="width 0.6s ease" />
              </Box>
              <Text fontSize="sm" fontWeight="600" mt={1} color={color}>{pct}%</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AdminSummaryTab;
