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
        setSummary(summaryRes?.data ?? null);
        setKpis(kpisRes?.data ?? null);
      } catch (err) {
        toast({ status: "error", description: err.message || "Failed to load summary", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const data = summary ?? kpis ?? {};

  return (
    <Box>
      <Text fontWeight="600" fontSize="md" mb={4}>
        Participation & Engagement Overview
      </Text>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} mb={6}>
        <SummaryCard
          label="Total Students"
          value={loading ? "—" : data.total_students ?? 0}
          helpText="enrolled learners"
          color="#660066"
        />
        <SummaryCard
          label="Active"
          value={loading ? "—" : data.active_students ?? 0}
          helpText={`${data.active_percentage ?? 0}% of total`}
          color="#1A8F3A"
        />
        <SummaryCard
          label="Irregular"
          value={loading ? "—" : data.irregular_students ?? 0}
          helpText={`${data.irregular_percentage ?? 0}% of total`}
          color="#B7791F"
        />
        <SummaryCard
          label="Inactive"
          value={loading ? "—" : data.inactive_students ?? 0}
          helpText={`${data.inactive_percentage ?? 0}% of total`}
          color="#C53030"
        />
        <SummaryCard
          label="Avg. Participation"
          value={loading ? "—" : `${data.average_participation_rate ?? 0}%`}
          helpText="across all students"
          color="#2C5282"
        />
        <SummaryCard
          label="Alerts Triggered"
          value={loading ? "—" : data.alerts_triggered ?? 0}
          helpText={`${data.alerts_triggered_percentage ?? 0}% flagged`}
          color="#C53030"
        />
        <SummaryCard
          label="Total Reports"
          value={loading ? "—" : data.total_reports ?? 0}
          helpText={`${data.reports_this_month ?? 0} this month`}
          color="#660066"
        />
        <SummaryCard
          label="Avg. Frequency"
          value={loading ? "—" : `${data.average_frequency ?? 0}x`}
          helpText="logins per period"
          color="#2C5282"
        />
      </SimpleGrid>

      <Divider mb={6} />

      <Box>
        <Text fontWeight="600" fontSize="md" mb={3}>Engagement Distribution</Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {["Active", "Irregular", "Inactive"].map((status) => {
            const pct =
              status === "Active"
                ? data.active_percentage ?? 0
                : status === "Irregular"
                ? data.irregular_percentage ?? 0
                : data.inactive_percentage ?? 0;
            const color =
              status === "Active" ? "#1A8F3A" : status === "Irregular" ? "#B7791F" : "#C53030";
            return (
              <Box key={status} p={4} borderRadius="lg" border="1px solid" borderColor="gray.100">
                <Text fontSize="sm" color="gray.500" mb={1}>{status}</Text>
                <Box h="8px" borderRadius="full" bg="gray.100" overflow="hidden">
                  <Box h="100%" w={`${pct}%`} bg={color} borderRadius="full" transition="width 0.6s ease" />
                </Box>
                <Text fontSize="sm" fontWeight="600" mt={1} color={color}>{pct}%</Text>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AdminSummaryTab;
