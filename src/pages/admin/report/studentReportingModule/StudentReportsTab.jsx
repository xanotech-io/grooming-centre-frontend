import { useState } from "react";
import { Box } from "@chakra-ui/layout";
import { Tag, useDisclosure, useToast } from "@chakra-ui/react";
import { Button, Table, Text } from "../../../../components";
import { useTableRows } from "../../../../hooks";
import { tc0804GetStudentReports } from "../../../../services";
import GenerateReportModal from "./GenerateReportModal";
import ReportDetailModal from "./ReportDetailModal";

const engagementColorMap = { Active: "green", Irregular: "yellow", Inactive: "red" };

const mapToRow = (item) => ({
  id: item.reportId,
  reportId: item.reportId,
  studentId: item.studentId,
  studentName: item.studentName ?? "—",
  address: item.address ?? "—",
  program: item.program ?? "—",
  course: item.course ?? "—",
  enrollmentStatus: item.enrollmentStatus ?? "—",
  participationScore: item.participationScore ?? 0,
  engagementStatus: item.engagementStatus ?? "—",
  activityType: item.activityType ?? "—",
  frequencyOfAccess: item.frequencyOfAccess ?? 0,
  alertTriggered: item.alertTriggered ?? false,
  generatedBy: item.generatedBy ?? "—",
  lastActiveDate: item.lastActiveDate
    ? new Date(item.lastActiveDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—",
  timestamp: item.timestamp
    ? new Date(item.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—",
  remarks: item.remarks ?? "—",
  instructor: item.instructor ?? "—",
  _raw: item,
});

const StudentReportsTab = ({ onKpisChange }) => {
  const toast = useToast();
  const generateModal = useDisclosure();
  const detailModal = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReports = async (params = {}) => {
    try {
      const result = await tc0804GetStudentReports(params);
      const items = (result?.reports ?? []).map(mapToRow);
      const total = result?.total ?? items.length;
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 50;

      setTotalCount(total);

      return {
        rows: items,
        showingDocumentsCount: items.length,
        totalDocumentsCount: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      toast({ status: "error", description: err.message || "Failed to fetch reports", duration: 3000, isClosable: true });
      return { rows: [], showingDocumentsCount: 0, totalDocumentsCount: 0, currentPage: 1, totalPages: 1 };
    }
  };

  const fetcher = (props) => async () => fetchReports(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Enrollment Status",
        queryKey: "enrollmentStatus",
        width: "200px",
        body: {
          checks: [
            { label: "Active", queryValue: "Active" },
            { label: "Suspended", queryValue: "Suspended" },
            { label: "Graduated", queryValue: "Graduated" },
            { label: "Withdrawn", queryValue: "Withdrawn" },
          ],
        },
      },
      {
        triggerText: "Engagement Status",
        queryKey: "engagementStatus",
        width: "200px",
        body: {
          checks: [
            { label: "Active", queryValue: "Active" },
            { label: "Irregular", queryValue: "Irregular" },
            { label: "Inactive", queryValue: "Inactive" },
          ],
        },
      },
      {
        triggerText: "Participation Level",
        queryKey: "participationLevel",
        width: "190px",
        body: {
          checks: [
            { label: "High (≥70%)", queryValue: "high" },
            { label: "Medium (40–69%)", queryValue: "medium" },
            { label: "Low (<40%)", queryValue: "low" },
          ],
        },
      },
      {
        triggerText: "Alert Triggered",
        queryKey: "alertTriggered",
        width: "180px",
        body: { checks: [{ label: "Alerts Only", queryValue: "true" }] },
      },
    ],
    options: {
      dateFilter: true,
      action: [
        {
          text: "View Details",
          onClick: (row) => {
            setSelectedReport(row._raw ?? row);
            detailModal.onOpen();
          },
        },
      ],
      selection: false,
      pagination: true,
    },
    columns: [
      {
        id: "reportId",
        key: "reportId",
        text: "Report ID",
        fraction: "130px",
        renderContent: (v) => (
          <Text fontWeight="600" fontSize="13px" color="#660066">{v}</Text>
        ),
      },
      {
        id: "studentId",
        key: "studentId",
        text: "Student ID",
        fraction: "140px",
        renderContent: (v) => (
          <Text fontSize="13px" color="#4A5568">{v}</Text>
        ),
      },
      {
        id: "studentName",
        key: "studentName",
        text: "Student Name",
        fraction: "180px",
        renderContent: (v) => (
          <Text fontWeight="600" fontSize="14px" color="#101828">{v}</Text>
        ),
      },
      { id: "program", key: "program", text: "Program / Dept", fraction: "160px" },
      { id: "course", key: "course", text: "Course", fraction: "160px" },
      {
        id: "enrollmentStatus",
        key: "enrollmentStatus",
        text: "Enroll. Status",
        fraction: "130px",
        renderContent: (s) => {
          const cfg = {
            Active: { bg: "#C6F6D5", color: "#276749" },
            Suspended: { bg: "#FED7D7", color: "#C53030" },
            Graduated: { bg: "#BEE3F8", color: "#2B6CB0" },
            Withdrawn: { bg: "#FED7D7", color: "#C53030" },
          }[s] ?? { bg: "#EDF2F7", color: "#4A5568" };
          return (
            <Box display="inline-block" bg={cfg.bg} color={cfg.color} borderRadius="6px" px="8px" py="2px" fontSize="11px" fontWeight="600">
              {s}
            </Box>
          );
        },
      },
      {
        id: "participationScore",
        key: "participationScore",
        text: "Participation (%)",
        fraction: "145px",
        renderContent: (score) => (
          <Text fontWeight="600" color={score >= 70 ? "#1A8F3A" : score >= 40 ? "#B7791F" : "#C53030"}>
            {score}%
          </Text>
        ),
      },
      {
        id: "engagementStatus",
        key: "engagementStatus",
        text: "Engagement",
        fraction: "120px",
        renderContent: (status) => (
          <Tag size="sm" borderRadius="full" colorScheme={engagementColorMap[status] ?? "gray"}>
            {status}
          </Tag>
        ),
      },
      {
        id: "alertTriggered",
        key: "alertTriggered",
        text: "Alert",
        fraction: "90px",
        renderContent: (triggered) => (
          <Tag size="sm" borderRadius="full" colorScheme={triggered ? "red" : "gray"}>
            {triggered ? "Yes" : "No"}
          </Tag>
        ),
      },
      { id: "lastActiveDate", key: "lastActiveDate", text: "Last Active", fraction: "120px" },
      { id: "generatedBy", key: "generatedBy", text: "Generated By", fraction: "140px" },
      { id: "timestamp", key: "timestamp", text: "Generated On", fraction: "130px" },
      { id: "remarks", key: "remarks", text: "Remarks", fraction: "200px" },
    ],
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <Button onClick={generateModal.onOpen}>+ Generate Report</Button>
      </Box>

      <Table
        {...tableProps}
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
        placeholder="Search by student name, ID, or course..."
        totalCount={totalCount}
      />

      <GenerateReportModal
        isOpen={generateModal.isOpen}
        onClose={generateModal.onClose}
        onSuccess={fetchRowItems}
      />

      <ReportDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.onClose}
        report={selectedReport}
      />
    </Box>
  );
};

export default StudentReportsTab;
