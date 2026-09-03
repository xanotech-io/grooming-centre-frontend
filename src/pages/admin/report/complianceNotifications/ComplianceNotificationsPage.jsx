import { useState, useEffect, useCallback } from 'react';
import { Route } from 'react-router-dom';
import { Box, Flex, useDisclosure, useToast, BreadcrumbItem } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, Button, Heading, Link } from '../../../../components';
import {
  getComplianceNotificationKpis,
  getComplianceNotificationDashboard,
  exportComplianceNotificationDashboard,
  sendComplianceNotification,
  evaluateComplianceNotifications,
  escalateComplianceNotification,
  resendComplianceNotification,
  adminGetDepartmentListing,
  adminListCoursesForReport,
} from '../../../../services';
import { downloadBlob } from '../../../../utils';
import ComplianceKpiCards from './components/ComplianceKpiCards';
import ComplianceNotificationsTable from './components/ComplianceNotificationsTable';
import ComplianceHistoryModal from './components/ComplianceHistoryModal';

const getExportExtension = (mimeType = '') => {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xlsx';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('csv')) return 'csv';
  return 'xlsx';
};

const INITIAL_FILTERS = {
  departmentId: '',
  courseId: '',
  entityType: '',
  complianceStatus: '',
  overdueStatus: '',
};

const departmentFetchFn = async (query) => {
  const { departments } = await adminGetDepartmentListing({ search: query });
  return departments.map((d) => ({ id: d.id, label: d.name }));
};

const courseFetchFn = async (query) => {
  const { rows } = await adminListCoursesForReport({ search: query });
  return rows.map((c) => ({ id: c.id, label: c.title }));
};

const ComplianceNotificationsPage = () => {
  const toast = useToast();
  const historyModal = useDisclosure();

  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rowsLoading, setRowsLoading] = useState(true);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [exporting, setExporting] = useState(false);

  const activeParams = useCallback(() => {
    const params = {};
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.entityType) params.entityType = filters.entityType;
    if (filters.complianceStatus) params.complianceStatus = filters.complianceStatus;
    if (filters.overdueStatus) params.overdueStatus = filters.overdueStatus;
    return params;
  }, [filters]);

  const loadKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await getComplianceNotificationKpis();
      setKpis(data?.data ?? data);
    } catch {
      // non-critical
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const loadRows = useCallback(async () => {
    setRowsLoading(true);
    try {
      const params = { ...activeParams(), page, limit };
      const data = await getComplianceNotificationDashboard(params);
      const payload = data?.data ?? data ?? {};
      setRows(payload.rows ?? payload.recipients ?? []);
      setTotal(payload.total ?? payload.count ?? 0);
    } catch {
      toast({ title: 'Failed to load compliance dashboard', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setRowsLoading(false);
    }
  }, [activeParams, page, limit, toast]);

  useEffect(() => { loadKpis(); }, [loadKpis]);
  useEffect(() => { loadRows(); }, [loadRows]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setSelectedIds([]);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleSelect = (recipientId) => {
    setSelectedIds((prev) =>
      prev.includes(recipientId) ? prev.filter((id) => id !== recipientId) : [...prev, recipientId]
    );
  };

  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? rows.map((r) => r.recipientId) : []);
  };

  const handleViewHistory = (row) => {
    setSelectedRecipient({
      recipientId: row.recipientId,
      recipientName: row.recipientName,
      courseId: row.courseId,
      examId: row.examId,
    });
    historyModal.onOpen();
  };

  const handleSend = async (row) => {
    try {
      await sendComplianceNotification({
        recipientId: row.recipientId,
        courseId: row.courseId,
        examId: row.examId,
      });
      toast({ title: 'Notification sent', status: 'success', duration: 3000, isClosable: true });
      loadRows();
    } catch {
      toast({ title: 'Failed to send notification', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEscalate = async (row) => {
    try {
      await escalateComplianceNotification(row.recipientId, {
        courseId: row.courseId,
        examId: row.examId,
      });
      toast({ title: 'Escalation triggered', status: 'success', duration: 3000, isClosable: true });
      loadRows();
      loadKpis();
    } catch {
      toast({ title: 'Failed to escalate notification', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleResend = async (row) => {
    try {
      await resendComplianceNotification(row.recipientId, {
        courseId: row.courseId,
        examId: row.examId,
      });
      toast({ title: 'Notification resent', status: 'success', duration: 3000, isClosable: true });
      loadRows();
    } catch {
      toast({ title: 'Failed to resend notification', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleBulkSend = async () => {
    setBulkSending(true);
    try {
      const body = selectedIds.length > 0 ? { recipientIds: selectedIds } : { filters: activeParams() };
      const data = await evaluateComplianceNotifications(body);
      const result = data?.data ?? data ?? {};
      const { total: t = 0, sent = 0, failed = 0, skipped = 0 } = result;
      toast({
        title: 'Bulk send complete',
        description: `Total: ${t} · Sent: ${sent} · Failed: ${failed} · Skipped: ${skipped}`,
        status: failed > 0 ? 'warning' : 'success',
        duration: 6000,
        isClosable: true,
      });
      setSelectedIds([]);
      loadRows();
      loadKpis();
    } catch {
      toast({ title: 'Failed to run bulk send', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setBulkSending(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportComplianceNotificationDashboard(activeParams());
      downloadBlob(blob, `compliance-notifications-dashboard.${getExportExtension(blob.type)}`);
    } catch {
      toast({ title: 'Failed to export compliance notifications', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <ComplianceKpiCards kpis={kpis} isLoading={kpiLoading} />

      <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm" mb={4}>
        <Flex justify="space-between" align="center">
          <Heading as="h3" size="sm" color="#101928">Compliance Notifications</Heading>
          <Flex gap={2}>
            <Button
              size="sm"
              variant="outline"
              borderColor="gray.300"
              isLoading={exporting}
              isDisabled={exporting}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              size="sm"
              bg="#660066"
              color="white"
              _hover={{ bg: '#550055' }}
              isLoading={bulkSending}
              onClick={handleBulkSend}
            >
              {selectedIds.length > 0
                ? `Bulk Send (${selectedIds.length} selected)`
                : 'Bulk Send (active filters)'}
            </Button>
          </Flex>
        </Flex>
      </Box>

      <ComplianceNotificationsTable
        rows={rows}
        total={total}
        page={page}
        limit={limit}
        isLoading={rowsLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
        onLimitChange={(v) => { setLimit(v); setPage(1); }}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onViewHistory={handleViewHistory}
        onSend={handleSend}
        onEscalate={handleEscalate}
        onResend={handleResend}
        departmentFetchFn={departmentFetchFn}
        courseFetchFn={courseFetchFn}
      />

      <ComplianceHistoryModal
        isOpen={historyModal.isOpen}
        onClose={historyModal.onClose}
        recipient={selectedRecipient}
      />
    </Box>
  );
};

export const ComplianceNotificationsPageRoute = ({ ...rest }) => (
  <AdminMainAreaWrapper>
    <Breadcrumb
      item2={<BreadcrumbItem isCurrentPage><Link href="/admin/report/compliance-notifications">Compliance Notifications</Link></BreadcrumbItem>}
    />
    <Heading mb={6}>Compliance Notifications</Heading>
    <Route {...rest} render={(props) => <ComplianceNotificationsPage {...props} />} />
  </AdminMainAreaWrapper>
);

export default ComplianceNotificationsPage;
