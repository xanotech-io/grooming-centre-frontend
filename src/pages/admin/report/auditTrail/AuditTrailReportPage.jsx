import { useState, useEffect, useCallback } from 'react';
import { Route } from 'react-router-dom';
import { Box, Flex, useDisclosure, useToast } from '@chakra-ui/react';
import { BreadcrumbItem } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, Button, Heading, Link } from '../../../../components';
import { auditTrailV2GetLogs, auditTrailV2GetReport } from '../../../../services/http/endpoints/auditTrailV2';
import AuditKpiCards from './components/AuditKpiCards';
import AuditLogsTable from './components/AuditLogsTable';
import LogAuditEventModal from './components/LogAuditEventModal';

const AuditTrailReportPage = () => {
  const toast = useToast();
  const logModal = useDisclosure();

  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [logsLoading, setLogsLoading] = useState(true);

  const [filters, setFilters] = useState({
    userRole: '',
    eventType: '',
    module: '',
    status: '',
    isFlagged: '',
    startDate: '',
    endDate: '',
  });

  const loadKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const params = {};
      if (filters.module) params.module = filters.module;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const data = await auditTrailV2GetReport(params);
      setKpis(data);
    } catch {
      // non-critical
    } finally {
      setKpiLoading(false);
    }
  }, [filters.module, filters.startDate, filters.endDate]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = { page, limit };
      if (filters.userRole) params.userRole = filters.userRole;
      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.module) params.module = filters.module;
      if (filters.status) params.status = filters.status;
      if (filters.isFlagged !== '') params.isFlagged = filters.isFlagged === 'true';
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const result = await auditTrailV2GetLogs(params);
      setLogs(result.logs ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({ title: 'Failed to load audit logs', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLogsLoading(false);
    }
  }, [page, limit, filters, toast]);

  useEffect(() => { loadKpis(); }, [loadKpis]);
  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogSuccess = () => {
    loadLogs();
    loadKpis();
  };

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AuditKpiCards kpis={kpis} isLoading={kpiLoading} />

      <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm" mb={4}>
        <Flex justify="space-between" align="center">
          <Heading as="h3" size="sm" color="#101928">Audit Logs</Heading>
          <Button
            size="sm"
            bg="#660066"
            color="white"
            _hover={{ bg: '#550055' }}
            onClick={logModal.onOpen}
          >
            + Log Event
          </Button>
        </Flex>
      </Box>

      <AuditLogsTable
        logs={logs}
        total={total}
        page={page}
        limit={limit}
        isLoading={logsLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
        onLimitChange={(v) => { setLimit(v); setPage(1); }}
      />

      <LogAuditEventModal
        isOpen={logModal.isOpen}
        onClose={logModal.onClose}
        onSuccess={handleLogSuccess}
      />
    </Box>
  );
};

export const AuditTrailReportPageRoute = ({ ...rest }) => (
  <AdminMainAreaWrapper>
    <Breadcrumb>
      <BreadcrumbItem>
        <Link to="/admin/report/studentReport">Reports</Link>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <Link to="/admin/report/audit-trail">Audit Trail Report</Link>
      </BreadcrumbItem>
    </Breadcrumb>
    <Heading mb={6}>Audit Trail Report</Heading>
    <Route {...rest} render={(props) => <AuditTrailReportPage {...props} />} />
  </AdminMainAreaWrapper>
);

export default AuditTrailReportPage;
