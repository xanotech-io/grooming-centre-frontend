// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA - remove when wiring to real API endpoints
// ---------------------------------------------------------------------------

const MOCK_REPORTS = [
  {
    id: "MIS-2025-001",
    category: "Academic",
    name: "Course Completion Summary",
    generatedBy: "Admin",
    dateTime: "26/11/2025 11:30am",
    format: "PDF",
    frequency: "Monthly",
    status: "Archived",
    remark: "Automated generation completed",
  },
  {
    id: "MIS-2025-002",
    category: "Administrative",
    name: "Course Completion Summary",
    generatedBy: "Registrar",
    dateTime: "26/11/2025 11:30am",
    format: "Excel",
    frequency: "On demand",
    status: "Approved",
    remark: "Automated generation completed",
  },
  {
    id: "MIS-2025-003",
    category: "Compliance",
    name: "Data Access Log Report",
    generatedBy: "IT Security",
    dateTime: "26/11/2025 11:30am",
    format: "CSV",
    frequency: "Quarterly",
    status: "Approved",
    remark: "For internal audit",
  },
  {
    id: "MIS-2025-004",
    category: "Administrative",
    name: "Course Subscription Revenue Summary",
    generatedBy: "Registrar",
    dateTime: "26/11/2025 11:30am",
    format: "PDF",
    frequency: "Daily",
    status: "Archived",
    remark: "Automated generation completed",
  },
  {
    id: "MIS-2025-005",
    category: "Compliance",
    name: "Enrollment Statistics",
    generatedBy: "IT Security",
    dateTime: "26/11/2025 11:30am",
    format: "Excel",
    frequency: "On demand",
    status: "Approved",
    remark: "Automated generation completed",
  },
  {
    id: "MIS-2025-006",
    category: "Academic",
    name: "Data Access Log Report",
    generatedBy: "Admin",
    dateTime: "26/11/2025 11:30am",
    format: "CSV",
    frequency: "Monthly",
    status: "Draft",
    remark: "-",
  },
];

const MOCK_SUMMARY = {
  totalReports: 100,
  automatedReports: 70,
  averageCreationTime: "12secs",
  reportAccuracy: "80%",
};

// ---------------------------------------------------------------------------
// TC16 - MIS Reports
// POST /v2/mis/reports
// ---------------------------------------------------------------------------

/**
 * Generate or query MIS reports with filters
 * @param {{
 *   reportType?: 'overview'|'academic'|'administrative'|'compliance'|'attendance'|'performance',
 *   filters?: {
 *     category?: string,
 *     department?: string,
 *     region?: string,
 *     dateRange?: string,
 *     status?: string,
 *     search?: string,
 *   },
 *   format?: 'PDF'|'Excel'|'CSV',
 *   page?: number,
 *   limit?: number,
 * }} body
 * @returns {Promise<{ reports: Array, summary: object, pagination: object }>}
 */
export const adminGenerateMISReport = async (body = {}) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.post('/v2/mis/reports', body);
  // return {
  //   reports: data.reports,
  //   summary: data.summary,
  //   pagination: data.pagination,
  // };

  let filtered = [...MOCK_REPORTS];

  if (body.filters?.category) {
    filtered = filtered.filter(
      (r) => r.category.toLowerCase() === body.filters.category.toLowerCase(),
    );
  }
  if (body.filters?.status) {
    filtered = filtered.filter(
      (r) => r.status.toLowerCase() === body.filters.status.toLowerCase(),
    );
  }
  if (body.filters?.search) {
    const q = body.filters.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.generatedBy.toLowerCase().includes(q),
    );
  }

  const page = body.page || 1;
  const limit = body.limit || 10;
  const totalItems = filtered.length;

  return {
    reports: filtered.slice((page - 1) * limit, page * limit),
    summary: MOCK_SUMMARY,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
    },
  };
};
