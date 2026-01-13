import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://privateapi.groomingcentre.net/api/v1';

export const useFileManagement = () => {
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [availableTables] = useState([
        'course',
        'users',
        'lesson',
        'assessmentQuestions',
        'examinationQuestions',
        'library',
        'events',
        'chatMessages',
        'chatRooms',
        'standAloneExaminationQuestion'
    ]);

    // Get auth token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // Create axios instance with auth headers
    const createAxiosInstance = () => {
        const token = getAuthToken();
        return axios.create({
            baseURL: BASE_URL,
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
    };

    // Fetch all files with optional filtering
    const fetchFiles = useCallback(async (options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const api = createAxiosInstance();
            const params = new URLSearchParams();

            if (options.page) params.append('page', options.page);
            if (options.limit) params.append('limit', options.limit);
            if (options.table && options.table !== 'all') params.append('table', options.table);

            const response = await api.get(`/file-management/files?${params.toString()}`);

            if (response.data.success) {
                const responseData = response.data.data;
                setFiles(responseData.files || []);
                setPagination(responseData.pagination || null);

                // Filter files based on search query if provided
                if (options.search && options.search.trim()) {
                    const searchTerm = options.search.toLowerCase();
                    const filteredFiles = responseData.files.filter(file =>
                        file.recordTitle?.toLowerCase().includes(searchTerm) ||
                        file.fieldName?.toLowerCase().includes(searchTerm) ||
                        file.fileUrl?.toLowerCase().includes(searchTerm)
                    );
                    setFiles(filteredFiles);
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch files');
            }
        } catch (err) {
            console.error('Error fetching files:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'An error occurred while fetching files'
            );
            setFiles([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch file statistics
    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const api = createAxiosInstance();
            const response = await api.get('/file-management/files/stats');

            if (response.data.success) {
                setStats(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch statistics');
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'An error occurred while fetching statistics'
            );
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch files by specific table
    const fetchFilesByTable = useCallback(async (tableName, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const api = createAxiosInstance();
            const params = new URLSearchParams();

            if (options.page) params.append('page', options.page);
            if (options.limit) params.append('limit', options.limit);

            const response = await api.get(`/file-management/files/table/${tableName}?${params.toString()}`);

            if (response.data.success) {
                const responseData = response.data.data;
                setFiles(responseData.files || []);
                setPagination(responseData.pagination || null);
            } else {
                throw new Error(response.data.message || 'Failed to fetch files');
            }
        } catch (err) {
            console.error('Error fetching files by table:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'An error occurred while fetching files'
            );
            setFiles([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Download file function
    const downloadFile = useCallback(async (fileUrl, filename = 'document') => {
        try {
            // For direct file downloads, we can use the browser's native download
            const link = document.createElement('a');
            link.href = fileUrl;
            link.target = '_blank';

            // Try to extract filename from URL
            const urlFilename = fileUrl.split('/').pop()?.split('?')[0];
            if (urlFilename && urlFilename.includes('.')) {
                link.download = urlFilename;
            } else {
                link.download = `${filename}_${Date.now()}`;
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
            // Fallback: open in new tab
            window.open(fileUrl, '_blank');
        }
    }, []);

    // Search files
    const searchFiles = useCallback(async (searchTerm, options = {}) => {
        const searchOptions = {
            ...options,
            search: searchTerm,
        };
        await fetchFiles(searchOptions);
    }, [fetchFiles]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Reset state
    const reset = useCallback(() => {
        setFiles([]);
        setStats(null);
        setPagination(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        // State
        files,
        stats,
        loading,
        error,
        pagination,
        availableTables,

        // Actions
        fetchFiles,
        fetchStats,
        fetchFilesByTable,
        downloadFile,
        searchFiles,
        clearError,
        reset,
    };
};
