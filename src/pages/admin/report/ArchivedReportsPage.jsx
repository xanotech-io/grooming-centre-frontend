import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Box,
    Flex,
    Text,
    useToast,
    useDisclosure,
    BreadcrumbItem,
} from '@chakra-ui/react';
import { Route } from 'react-router-dom';
import { AdminMainAreaWrapper } from '../../../layouts';
import { Breadcrumb, Link } from '../../../components';
import {
    adminGetArchiveKPIs,
    adminListArchiveRecords,
    adminRetrieveArchivedReport,
} from '../../../services/http/endpoints/reportArchive';
import ArchiveKPICards from './archiveReports/components/ArchiveKPICards';
import ArchiveFilters from './archiveReports/components/ArchiveFilters';
import ArchiveTable from './archiveReports/components/ArchiveTable';
import RetrieveConfirmModal from './archiveReports/components/RetrieveConfirmModal';
import ArchiveDetailModal from './archiveReports/components/ArchiveDetailModal';

const DEFAULT_FILTERS = {
    search: '',
    status: '',
    startDate: '',
    endDate: '',
};

const ArchivedReportsPage = () => {
    const toast = useToast();

    // ── KPI state ──────────────────────────────────────────────────────────────
    const [kpis, setKpis] = useState(null);
    const [kpisLoading, setKpisLoading] = useState(true);

    // ── Table state ────────────────────────────────────────────────────────────
    const [archives, setArchives] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [tableLoading, setTableLoading] = useState(true);

    // ── Filter state ───────────────────────────────────────────────────────────
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const debounceRef = useRef(null);

    // ── Selected archive for modals ────────────────────────────────────────────
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [isRetrieving, setIsRetrieving] = useState(false);

    const {
        isOpen: isRetrieveOpen,
        onOpen: onRetrieveOpen,
        onClose: onRetrieveClose,
    } = useDisclosure();

    const {
        isOpen: isDetailOpen,
        onOpen: onDetailOpen,
        onClose: onDetailClose,
    } = useDisclosure();

    // ── Fetch KPIs ─────────────────────────────────────────────────────────────
    const fetchKPIs = useCallback(async () => {
        setKpisLoading(true);
        try {
            const { kpis: data } = await adminGetArchiveKPIs();
            setKpis(data);
        } catch {
            // silently fail — KPIs are non-critical
        } finally {
            setKpisLoading(false);
        }
    }, []);

    // ── Fetch archive records ──────────────────────────────────────────────────
    const fetchArchives = useCallback(async (currentPage, currentLimit, currentFilters) => {
        setTableLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: currentLimit,
            };
            if (currentFilters.status) params.status = currentFilters.status;
            if (currentFilters.startDate) params.startDate = currentFilters.startDate;
            if (currentFilters.endDate) params.endDate = currentFilters.endDate;

            const result = await adminListArchiveRecords(params);
            let rows = result.archives;

            // Client-side search filter (search is not a backend param)
            if (currentFilters.search.trim()) {
                const q = currentFilters.search.trim().toLowerCase();
                rows = rows.filter(
                    (r) =>
                        r.archiveId?.toLowerCase().includes(q) ||
                        r.report?.reportId?.toLowerCase().includes(q) ||
                        r.report?.reportName?.toLowerCase().includes(q) ||
                        r.archiver?.firstName?.toLowerCase().includes(q) ||
                        r.archiver?.lastName?.toLowerCase().includes(q)
                );
            }

            setArchives(rows);
            setTotal(result.total);
            setPage(result.page ?? currentPage);
        } catch (err) {
            toast({
                title: 'Failed to load archive records',
                description: err?.message ?? 'Please try again.',
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top-right',
            });
        } finally {
            setTableLoading(false);
        }
    }, [toast]);

    // ── Initial load ───────────────────────────────────────────────────────────
    useEffect(() => {
        fetchKPIs();
    }, [fetchKPIs]);

    useEffect(() => {
        // Debounce search, immediate for other filters
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchArchives(1, limit, filters);
            setPage(1);
        }, filters.search ? 400 : 0);
        return () => clearTimeout(debounceRef.current);
    }, [filters, limit]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Filter helpers ─────────────────────────────────────────────────────────
    const handleFilterChange = (patch) => {
        setFilters((prev) => ({ ...prev, ...patch }));
    };

    const handleFilterReset = () => {
        setFilters(DEFAULT_FILTERS);
    };

    // ── Pagination ─────────────────────────────────────────────────────────────
    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchArchives(newPage, limit, filters);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
        fetchArchives(1, newLimit, filters);
    };

    // ── Open retrieve confirm ──────────────────────────────────────────────────
    const handleRetrieveRequest = (archive) => {
        setSelectedArchive(archive);
        onRetrieveOpen();
    };

    // ── Open detail modal ──────────────────────────────────────────────────────
    const handleViewDetail = (archive) => {
        setSelectedArchive(archive);
        onDetailOpen();
    };

    // ── Retrieve from detail modal → open confirm ──────────────────────────────
    const handleRetrieveFromDetail = (archive) => {
        onDetailClose();
        setSelectedArchive(archive);
        onRetrieveOpen();
    };

    // ── Confirm retrieve ───────────────────────────────────────────────────────
    const handleConfirmRetrieve = async (archiveId) => {
        setIsRetrieving(true);
        try {
            await adminRetrieveArchivedReport(archiveId);
            toast({
                title: 'Report retrieved successfully',
                description: `${archiveId} has been restored to active status.`,
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top-right',
            });
            onRetrieveClose();
            setSelectedArchive(null);
            // Refresh both table and KPIs
            fetchArchives(page, limit, filters);
            fetchKPIs();
        } catch (err) {
            toast({
                title: 'Retrieval failed',
                description: err?.message ?? 'Please try again.',
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top-right',
            });
        } finally {
            setIsRetrieving(false);
        }
    };

    const handleRetrieveClose = () => {
        onRetrieveClose();
        setSelectedArchive(null);
    };

    return (
        <AdminMainAreaWrapper>
            <Flex justify="space-between" align="center" mb={6}>
              <Breadcrumb
                item2={<BreadcrumbItem isCurrentPage><Link href="#">Archived Reports</Link></BreadcrumbItem>}
              />
            </Flex>
            {/* Header */}
            <Box mb={6} mt={6}>
                <Text fontSize="26px" fontWeight="700" color="#101928">
                    Archive & Retrieval
                </Text>
                <Text fontSize="14px" color="#667085" mt={1}>
                    Manage and retrieve historical MIS reports
                </Text>
            </Box>

            {/* KPI Cards */}
            <ArchiveKPICards kpis={kpis} isLoading={kpisLoading} />

            {/* Table Card */}
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
                <ArchiveFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={handleFilterReset}
                />
                <ArchiveTable
                    archives={archives}
                    total={total}
                    page={page}
                    limit={limit}
                    isLoading={tableLoading}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                    onRetrieve={handleRetrieveRequest}
                    onViewDetail={handleViewDetail}
                />
            </Box>

            {/* Retrieve Confirmation Modal */}
            <RetrieveConfirmModal
                isOpen={isRetrieveOpen}
                onClose={handleRetrieveClose}
                archive={selectedArchive}
                onConfirm={handleConfirmRetrieve}
                isLoading={isRetrieving}
            />

            {/* Archive Detail Modal */}
            <ArchiveDetailModal
                isOpen={isDetailOpen}
                onClose={onDetailClose}
                archive={selectedArchive}
                onRetrieve={handleRetrieveFromDetail}
                isRetrieving={isRetrieving}
            />
        </AdminMainAreaWrapper>
    );
};

export const ArchivedReportsPageRoute = ({ ...rest }) => (
    <Route {...rest} render={(props) => <ArchivedReportsPage {...props} />} />
);

export default ArchivedReportsPage;
