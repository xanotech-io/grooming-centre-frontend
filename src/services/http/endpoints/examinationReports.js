import { http } from "../http";

/**
 * Get examination report results analysis
 * @param {object} params - Query parameters (e.g., page, limit, studentId, courseId)
 * @returns {Promise<object>} Examination report results analysis data
 */
export const getExaminationReportAnalysis = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const path = `/v2/examination-reports/results/analysis${queryParams ? `?${queryParams}` : ''}`;

    const { data } = await http.get(path);

    return data;
};

/**
 * Get examination report statistics
 * @returns {Promise<object>} Examination report statistics data
 */
export const getExaminationReportStatistics = async () => {
    const path = `/v2/examination-reports/results/statistics`;

    const { data } = await http.get(path);

    // The API wraps successful data inside a structure with { success, message, data }
    // http.get interceptor likely unwraps the outer `data` object returned by axios.
    // It depends on the axios setup, but consistent with existing code we just return `data`.
    return data;
};

/**
 * Get examination report pass/fail visualization data
 * @returns {Promise<object>} Visualization data containing chart labels and datasets
 */
export const getExaminationReportVisualizationPassFail = async () => {
    const path = `/v2/examination-reports/results/visualization/pass-fail`;

    const { data } = await http.get(path);

    return data;
};