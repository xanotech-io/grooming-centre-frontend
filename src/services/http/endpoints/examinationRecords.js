import { http } from "../http";

/**
 * Get user examination records
 * @param {string} userId - User ID
 * @param {object} params - Query parameters
 * @returns {Promise<object>} Examination records data
 */
export const getUserExaminationRecords = async (userId, params = {}) => {
    const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        type: params.type || 'all',
    });

    const path = `/v2/examination-records/user/${userId}?${queryParams}`;
    const { data: { data } } = await http.get(path);

    return data;
};

/**
 * Get detailed examination record with questions and answers
 * @param {string} userId - User ID
 * @param {string} examinationId - Examination ID
 * @param {string} type - Examination type ('regular' or 'standalone')
 * @returns {Promise<object>} Detailed examination record
 */
export const getExaminationRecordDetails = async (userId, examinationId, type = 'regular') => {
    const path = `/v2/examination-records/user/${userId}/examination/${examinationId}?type=${type}`;
    const { data: { data } } = await http.get(path);

    return data;
};

/**
 * Get examination statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Examination statistics
 */
export const getUserExaminationStats = async (userId) => {
    const path = `/v2/examination-records/user/${userId}/stats`;
    const { data: { data } } = await http.get(path);

    return data;
};

/**
 * Download user academic transcript as Excel file
 * @param {string} userId - User ID
 * @returns {Promise<Blob>} Excel file blob
 */
export const downloadUserTranscript = async (userId) => {
    const path = `/v2/examination/transcript/download/${userId}`;
    const response = await http.get(path, {
        responseType: 'blob', // Important: tell axios to expect binary data
    });

    return response.data;
};