import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box, Flex, Grid, HStack, Input, Spinner,
  Text, Divider, SimpleGrid,
} from '@chakra-ui/react';
import { Route } from 'react-router-dom';
import { BreadcrumbItem } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, Button, ExportMenu, Heading, Link } from '../../../../components';
import { getProctoringAuditKpi } from '../../../../services';

const StatCard = ({ label, value, accent }) => (
  <Box p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
    <Text fontSize="13px" fontWeight="500" color="#667085" mb={2}>{label}</Text>
    <Text fontSize="30px" fontWeight="700" color={accent ?? '#101928'}>{value ?? '—'}</Text>
  </Box>
);

const BreakdownRow = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box mb={3}>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="13px" color="#344054" fontWeight="500">{label}</Text>
        <Text fontSize="13px" color="#475367">{value} ({pct}%)</Text>
      </Flex>
      <Box h="8px" bg="gray.100" borderRadius="full">
        <Box h="8px" w={`${pct}%`} bg={color} borderRadius="full" />
      </Box>
    </Box>
  );
};

const ProctoringKpiSummaryPageContent = () => {
  const history = useHistory();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const loadKpis = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const result = await getProctoringAuditKpi(params);
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadKpis(); }, [loadKpis]);

  const alertTotal = data
    ? (data.alertBreakdown?.warning ?? 0) + (data.alertBreakdown?.violation ?? 0) + (data.alertBreakdown?.system_flag ?? 0)
    : 0;
  const actionTotal = data
    ? (data.actionBreakdown?.warning_issued ?? 0) + (data.actionBreakdown?.exam_paused ?? 0) + (data.actionBreakdown?.exam_suspended ?? 0)
    : 0;

  const exportRows = [
    ["Metric", "Value"],
    ...(data
      ? [
          ["Total Events", data.totalEvents ?? ""],
          ["Unique Students", data.uniqueStudents ?? ""],
          ["Total Sessions", data.totalSessions ?? ""],
          ["Suspended Sessions", data.totalSuspendedSessions ?? ""],
          ["Alerts per 100 Students", data.alertsPer100Students ?? ""],
          ["Violation Frequency (%)", data.violationFrequency ?? ""],
          ["Avg Proctor Response (min)", data.avgProctorResponseTimeMinutes ?? ""],
          ["Alert Breakdown - Warnings", data.alertBreakdown?.warning ?? 0],
          ["Alert Breakdown - Violations", data.alertBreakdown?.violation ?? 0],
          ["Alert Breakdown - System Flags", data.alertBreakdown?.system_flag ?? 0],
          ["Action Breakdown - Warning Issued", data.actionBreakdown?.warning_issued ?? 0],
          ["Action Breakdown - Exam Paused", data.actionBreakdown?.exam_paused ?? 0],
          ["Action Breakdown - Exam Suspended", data.actionBreakdown?.exam_suspended ?? 0],
        ]
      : []),
  ];

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => history.goBack()}>
          Back
        </Button>
        <HStack spacing={3}>
          <Input
            type="date"
            size="sm"
            borderRadius="md"
            w="150px"
            value={filters.startDate}
            onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
          />
          <Input
            type="date"
            size="sm"
            borderRadius="md"
            w="150px"
            value={filters.endDate}
            onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
          />
          <ExportMenu
            rows={exportRows}
            filename="proctoring-kpi-summary"
            title="Proctoring KPI Summary"
          />
        </HStack>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" minH="300px">
          <Spinner color="#660066" size="xl" />
        </Flex>
      ) : (
        <>
          <Grid templateColumns="repeat(4, 1fr)" gap={5} mb={8}>
            <StatCard label="Total Events" value={data?.totalEvents} />
            <StatCard label="Unique Students" value={data?.uniqueStudents} />
            <StatCard label="Total Sessions" value={data?.totalSessions} />
            <StatCard label="Suspended Sessions" value={data?.totalSuspendedSessions} accent="#D92D20" />
            <StatCard label="Alerts per 100 Students" value={data?.alertsPer100Students != null ? Number(data.alertsPer100Students).toFixed(1) : '—'} />
            <StatCard label="Violation Frequency (%)" value={data?.violationFrequency != null ? `${Number(data.violationFrequency).toFixed(1)}%` : '—'} accent="#B54708" />
            <StatCard label="Avg Proctor Response (min)" value={data?.avgProctorResponseTimeMinutes != null ? Number(data.avgProctorResponseTimeMinutes).toFixed(1) : '—'} />
          </Grid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Alert Breakdown */}
            <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
              <Text fontSize="16px" fontWeight="700" color="#101928" mb={4}>Alert Breakdown</Text>
              <Divider mb={4} />
              {data?.alertBreakdown ? (
                <>
                  <BreakdownRow
                    label="Warnings"
                    value={data.alertBreakdown.warning ?? 0}
                    total={alertTotal}
                    color="#F59E0B"
                  />
                  <BreakdownRow
                    label="Violations"
                    value={data.alertBreakdown.violation ?? 0}
                    total={alertTotal}
                    color="#EF4444"
                  />
                  <BreakdownRow
                    label="System Flags"
                    value={data.alertBreakdown.system_flag ?? 0}
                    total={alertTotal}
                    color="#6366F1"
                  />
                  <Flex justify="flex-end" mt={3}>
                    <Text fontSize="12px" color="#667085">Total: {alertTotal}</Text>
                  </Flex>
                </>
              ) : (
                <Text fontSize="13px" color="#475367">No data available.</Text>
              )}
            </Box>

            {/* Action Breakdown */}
            <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
              <Text fontSize="16px" fontWeight="700" color="#101928" mb={4}>Proctor Action Breakdown</Text>
              <Divider mb={4} />
              {data?.actionBreakdown ? (
                <>
                  <BreakdownRow
                    label="Warning Issued"
                    value={data.actionBreakdown.warning_issued ?? 0}
                    total={actionTotal}
                    color="#F59E0B"
                  />
                  <BreakdownRow
                    label="Exam Paused"
                    value={data.actionBreakdown.exam_paused ?? 0}
                    total={actionTotal}
                    color="#3B82F6"
                  />
                  <BreakdownRow
                    label="Exam Suspended"
                    value={data.actionBreakdown.exam_suspended ?? 0}
                    total={actionTotal}
                    color="#EF4444"
                  />
                  <Flex justify="flex-end" mt={3}>
                    <Text fontSize="12px" color="#667085">Total: {actionTotal}</Text>
                  </Flex>
                </>
              ) : (
                <Text fontSize="13px" color="#475367">No data available.</Text>
              )}
            </Box>
          </SimpleGrid>

          {data?.generatedAt && (
            <Text fontSize="12px" color="#98A2B3" mt={6} textAlign="right">
              Generated at: {new Date(data.generatedAt).toLocaleString()}
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export const ProctoringKpiSummaryPageRoute = ({ ...rest }) => (
  <AdminMainAreaWrapper>
    <Breadcrumb
      item2={<BreadcrumbItem><Link href="/admin/report/proctoring-audit">Proctoring &amp; Audit</Link></BreadcrumbItem>}
      item3={<BreadcrumbItem isCurrentPage><Link href="#">KPI Summary</Link></BreadcrumbItem>}
    />
    <Heading mb={6}>Proctoring KPI Summary</Heading>
    <Route {...rest} render={(props) => <ProctoringKpiSummaryPageContent {...props} />} />
  </AdminMainAreaWrapper>
);

export default ProctoringKpiSummaryPageContent;
