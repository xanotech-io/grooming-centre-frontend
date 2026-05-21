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
  studentEmail: item.studentEmail ?? "—",
  program: item.program ?? "—",
  course: item.course ?? "—",
  participationScore: item.participationScore ?? 0,
  engagementStatus: item.engagementStatus ?? "—",
  alertTriggered: item.alertTriggered ?? false,
  generatedBy: item.generatedBy ?? "—",
  lastActiveDate: item.lastActiveDate
    ? new Date(item.lastActiveDate).toLocaleDateString()
    : "—",
  remarks: item.remarks ?? "—",
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
      const data = result?.data ?? {};
      const items = (data.data ?? data.reports ?? []).map(mapToRow);
      const total = data.total ?? items.length;
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 50;

      if (onKpisChange && data.kpis) onKpisChange(data.kpis);
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
        id: "studentName",
        key: "studentName",
        text: "Student Name",
        fraction: "180px",
        renderContent: (v) => (
          <Text fontWeight="600" fontSize="14px" color="#101828">{v}</Text>
        ),
      },
      { id: "program", key: "program", text: "Program", fraction: "160px" },
      { id: "course", key: "course", text: "Course", fraction: "160px" },
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
        text: "Status",
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
