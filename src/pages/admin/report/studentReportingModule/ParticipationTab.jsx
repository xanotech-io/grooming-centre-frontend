import { useState } from "react";
import { Tag, useToast } from "@chakra-ui/react";
import { Table, Text } from "../../../../components";
import { useTableRows } from "../../../../hooks";
import { tc0804GetParticipationRecords } from "../../../../services";

const engagementColorMap = { Active: "green", Irregular: "yellow", Inactive: "red" };
const levelToStatus = { high: "Active", medium: "Irregular", low: "Inactive" };

const mapToRow = (item) => ({
  id: item.userId ?? item.studentId,
  studentId: item.studentId ?? item.userId,
  studentName: item.studentName ?? "—",
  studentEmail: item.studentEmail ?? "—",
  course: item.course ?? "—",
  participationScore: item.participationScore ?? 0,
  activityType: Array.isArray(item.activityType) ? item.activityType.join(" / ") : item.activityType ?? "None",
  frequencyOfAccess: item.frequencyOfAccess ?? 0,
  lastActiveDate: item.lastLoginAt ?? item.lastActiveDate
    ? new Date(item.lastLoginAt ?? item.lastActiveDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—",
  daysSinceActive: item.daysSinceActive ?? "—",
  engagementStatus: levelToStatus[item.engagementLevel] ?? item.engagementStatus ?? "—",
  alertTriggered: item.alertTriggered ?? false,
  remarks: item.remarks ?? "—",
  instructorRemarks: item.instructorRemarks ?? "—",
});

const ParticipationTab = () => {
  const toast = useToast();
  const [totalCount, setTotalCount] = useState(0);

  const fetchRecords = async (params = {}) => {
    try {
      const result = await tc0804GetParticipationRecords(params);
      const items = (result?.records ?? []).map(mapToRow);
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
      toast({ status: "error", description: err.message || "Failed to fetch participation records", duration: 3000, isClosable: true });
      return { rows: [], showingDocumentsCount: 0, totalDocumentsCount: 0, currentPage: 1, totalPages: 1 };
    }
  };

  const fetcher = (props) => async () => fetchRecords(props?.params);
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
        triggerText: "Alert",
        queryKey: "alertTriggered",
        width: "160px",
        body: { checks: [{ label: "Alerts Only", queryValue: "true" }] },
      },
    ],
    options: {
      dateFilter: true,
      action: [],
      selection: false,
      pagination: true,
    },
    columns: [
      {
        id: "studentName",
        key: "studentName",
        text: "Student Name",
        fraction: "180px",
        renderContent: (v) => (
          <Text fontWeight="600" fontSize="14px" color="#101828">{v}</Text>
        ),
      },
      { id: "studentEmail", key: "studentEmail", text: "Email", fraction: "200px" },
      { id: "course", key: "course", text: "Course", fraction: "160px" },
      {
        id: "participationScore",
        key: "participationScore",
        text: "Score (%)",
        fraction: "110px",
        renderContent: (score) => (
          <Text fontWeight="600" color={score >= 70 ? "#1A8F3A" : score >= 40 ? "#B7791F" : "#C53030"}>
            {score}%
          </Text>
        ),
      },
      { id: "activityType", key: "activityType", text: "Activity", fraction: "150px" },
      { id: "frequencyOfAccess", key: "frequencyOfAccess", text: "Frequency", fraction: "110px" },
      { id: "lastActiveDate", key: "lastActiveDate", text: "Last Active", fraction: "120px" },
      { id: "daysSinceActive", key: "daysSinceActive", text: "Days Inactive", fraction: "120px" },
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
      { id: "remarks", key: "remarks", text: "Remarks", fraction: "180px" },
      { id: "instructorRemarks", key: "instructorRemarks", text: "Instructor Remarks", fraction: "200px" },
    ],
  };

  return (
    <Table
      {...tableProps}
      rows={rows}
      setRows={setRows}
      handleFetch={fetchRowItems}
      placeholder="Search by student name, email, or course..."
      totalCount={totalCount}
    />
  );
};

export default ParticipationTab;
