import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getUserExaminationRecords, getUserExaminationStats } from '../../../../../../services/http/endpoints/examinationRecords';

export const useExaminationRecords = () => {
    const { id: userId } = useParams();
    const [examinationRecords, setExaminationRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState('all');

    const fetchExaminationRecords = useCallback(async (page = 1, type = 'all') => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('Fetching examination records:', { userId, page, type });

            const response = await getUserExaminationRecords(userId, {
                page,
                limit: 10,
                type,
            });

            console.log('API Response:', response);
            console.log('Response structure:', {
                hasExaminations: !!response.examinations,
                examinationsLength: response.examinations?.length,
                hasPagination: !!response.pagination,
                responseKeys: Object.keys(response)
            });

            setExaminationRecords(response.examinations || []);
            setCurrentPage(response.pagination?.currentPage || 1);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (err) {
            console.error('Error fetching examination records:', err);
            setError(err.message || 'Failed to fetch examination records');
            setExaminationRecords([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const fetchStats = useCallback(async () => {
        try {
            console.log('Fetching examination stats for userId:', userId);
            const statsResponse = await getUserExaminationStats(userId);
            console.log('Stats Response:', statsResponse);
            setStats(statsResponse);
        } catch (err) {
            console.error('Failed to fetch examination stats:', err);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchExaminationRecords(1, filterType);
            fetchStats();
        }
    }, [userId, filterType, fetchExaminationRecords, fetchStats]);

    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            fetchExaminationRecords(page, filterType);
        }
    }, [totalPages, filterType, fetchExaminationRecords]);

    const handleFilterChange = useCallback((type) => {
        setFilterType(type);
        setCurrentPage(1);
    }, []);

    return {
        examinationRecords,
        stats,
        isLoading,
        error,
        currentPage,
        totalPages,
        handlePageChange,
        filterType,
        setFilterType: handleFilterChange,
        refetch: () => fetchExaminationRecords(currentPage, filterType),
    };
};