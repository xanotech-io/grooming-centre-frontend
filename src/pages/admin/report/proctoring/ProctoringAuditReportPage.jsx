import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Flex, HStack, useDisclosure, useToast } from '@chakra-ui/react';
import { Route } from 'react-router-dom';
import { BreadcrumbItem } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, Button, Heading, Link } from '../../../../components';
import { getProctoringEvents, getProctoringAuditKpi, exportProctoringAuditReport } from '../../../../services';
import { downloadBlob } from '../../../../utils';
import KpiCards from './components/KpiCards';
import EventsTable from './components/EventsTable';
import LogEventModal from './components/LogEventModal';
import RecordActionModal from './components/RecordActionModal';

// e.g. "application/vnd.openxmlformats...spreadsheet" -> "xlsx"
const extFromMimeType = (type) => {
  if (!type) return 'xlsx';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('csv')) return 'csv';
  if (type.includes('spreadsheet') || type.includes('excel')) return 'xlsx';
  return 'xlsx';
};

const ProctoringAuditReportPage = () => {
  const history = useHistory();
  const toast = useToast();

  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    examId: '',
    studentId: '',
    alertType: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const logModal = useDisclosure();
  const actionModal = useDisclosure();

  const [exporting, setExporting] = useState(false);

  const loadKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await getProctoringAuditKpi();
      setKpis(data);
    } catch {
      // non-critical, silently fail
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const params = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.examId) params.examId = filters.examId;
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.alertType) params.alertType = filters.alertType;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const result = await getProctoringEvents(params);
      setEvents(result.events ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({ title: 'Failed to load events', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setEventsLoading(false);
    }
  }, [page, limit, filters, toast]);

  useEffect(() => { loadKpis(); }, [loadKpis]);
  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((p) => ({ ...p, [key]: value }));
  };

  const handleViewSession = (examId) => {
    history.push(`/admin/report/proctoring-audit/exam/${examId}`);
  };

  const handleRecordAction = (event) => {
    setSelectedEvent(event);
    actionModal.onOpen();
  };

  const handleActionSuccess = () => {
    loadEvents();
    loadKpis();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.examId) params.examId = filters.examId;
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.alertType) params.alertType = filters.alertType;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const blob = await exportProctoringAuditReport(params);
      downloadBlob(blob, `proctoring-audit-report.${extFromMimeType(blob.type)}`);
    } catch {
      toast({ title: 'Export failed', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <KpiCards kpis={kpis} isLoading={kpiLoading} />

      <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm" mb={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h3" size="sm" color="#101928">Proctoring Events</Heading>
          <HStack spacing={3}>
            {events.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleExport} isLoading={exporting}>
                Export
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => history.push('/admin/report/proctoring-audit/kpi-summary')}
            >
              KPI Summary
            </Button>
            <Button
              size="sm"
              bg="#660066"
              color="white"
              _hover={{ bg: '#550055' }}
              onClick={logModal.onOpen}
            >
              + Log Event
            </Button>
          </HStack>
        </Flex>
      </Box>

      <EventsTable
        events={events}
        total={total}
        page={page}
        limit={limit}
        isLoading={eventsLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
        onLimitChange={(v) => { setLimit(v); setPage(1); }}
        onViewSession={handleViewSession}
        onRecordAction={handleRecordAction}
      />

      <LogEventModal
        isOpen={logModal.isOpen}
        onClose={logModal.onClose}
        onSuccess={() => { loadEvents(); loadKpis(); }}
      />

      <RecordActionModal
        isOpen={actionModal.isOpen}
        onClose={actionModal.onClose}
        event={selectedEvent}
        onSuccess={handleActionSuccess}
      />
    </Box>
  );
};

export const ProctoringAuditReportPageRoute = ({ ...rest }) => (
  <AdminMainAreaWrapper>
    <Breadcrumb
      item2={<BreadcrumbItem isCurrentPage><Link href="/admin/report/proctoring-audit">Proctoring &amp; Audit</Link></BreadcrumbItem>}
    />
    <Heading mb={6}>Proctoring & Audit Report</Heading>
    <Route {...rest} render={(props) => <ProctoringAuditReportPage {...props} />} />
  </AdminMainAreaWrapper>
);

export default ProctoringAuditReportPage;
