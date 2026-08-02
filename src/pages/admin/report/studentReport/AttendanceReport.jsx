import { Box, Flex } from "@chakra-ui/layout";
import { useState, useRef } from "react";
import { Route, useParams } from "react-router-dom";
import { EmptyState } from "../../../../layouts";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { getStudentAttendanceV2 } from "../../../../services";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
  Breadcrumb,
  Link,
} from "../../../../components";
import { BreadcrumbItem, Input, Select, Collapse } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/tag";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useTableRows } from "../../../../hooks";
import dayjs from "dayjs";

const statusColorMap = {
  Present: "green",
  Absent: "red",
  Late: "orange",
  Excused: "blue",
};

const deliveryColorMap = {
  Virtual: "purple",
  Physical: "teal",
};

const mapRecordToRow = (record) => ({
  id: record.id,
  courseTitle: record.courseTitle ?? record.course?.title ?? "—",
  lessonTitle: record.lessonTitle ?? record.lesson?.title ?? "—",
  sessionDate: record.sessionDate ?? "—",
  attendanceStatus: record.attendanceStatus ?? record.status ?? "—",
  entryTime: record.entryTime ?? "—",
  exitTime: record.exitTime ?? "—",
  duration: record.durationMinutes > 0 ? `${record.durationMinutes} min` : "—",
  deliveryMode: record.deliveryMode ?? "—",
});

const ATTENDANCE_STATUS_OPTIONS = [
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Late", label: "Late" },
  { value: "Excused", label: "Excused" },
];

const DELIVERY_MODE_OPTIONS = [
  { value: "Virtual", label: "Virtual" },
  { value: "Physical", label: "Physical" },
];

const defaultFilters = {
  attendanceStatus: "",
  deliveryMode: "",
  startDate: "",
  endDate: "",
};

// ── Filter bar (mirrors the CourseCompletionReportPage / Attendance Report filter design) ──

const CollapsibleFilterBar = ({ filters, onChange, onApply, onReset, isOpen, onToggle }) => {
  const activeCount = filters.filter((f) => f.value && f.value !== "").length;
  return (
    <Box mb={5}>
      <Flex align="center" gap={2}>
        <Box
          as="button"
          onClick={onToggle}
          display="inline-flex"
          alignItems="center"
          gap={2}
          px={3}
          h="34px"
          border="1px solid #D0D5DD"
          borderRadius="md"
          bg="white"
          fontSize="13px"
          fontWeight="500"
          color="#344054"
          cursor="pointer"
          _hover={{ bg: "#F9FAFB" }}
          transition="background 0.15s"
        >
          <FiFilter size={14} />
          Filter
          {activeCount > 0 && (
            <Box
              as="span"
              bg="#660066"
              color="white"
              borderRadius="full"
              fontSize="11px"
              fontWeight="600"
              px={1.5}
              py={0}
              lineHeight="18px"
              minW="18px"
              textAlign="center"
            >
              {activeCount}
            </Box>
          )}
          {isOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
        </Box>
        {activeCount > 0 && !isOpen && (
          <Text
            as="button"
            fontSize="12px"
            color="#660066"
            cursor="pointer"
            textDecoration="underline"
            onClick={onReset}
            bg="transparent"
            border="none"
          >
            Clear filters
          </Text>
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ overflow: "visible" }}>
        <Box
          mt={2}
          p={4}
          bg="#FAFAFA"
          border="1px solid #E4E7EC"
          borderRadius="lg"
          overflow="visible"
        >
          <Flex gap={3} flexWrap="wrap" align="flex-end">
            {filters.map((f) =>
              f.type === "select" ? (
                <Box key={f.key} minW="160px">
                  <Text fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</Text>
                  <Select size="sm" borderRadius="md" value={f.value} onChange={(e) => onChange(f.key, e.target.value)} placeholder={`All ${f.label}`} bg="white">
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Box>
              ) : (
                <Box key={f.key} minW="140px">
                  <Text fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</Text>
                  <Input size="sm" borderRadius="md" type="date" value={f.value} onChange={(e) => onChange(f.key, e.target.value)} bg="white" />
                </Box>
              )
            )}
            <Flex gap={2} mb="1px">
              <Button onClick={() => { onApply(); onToggle(); }} style={{ height: "32px", fontSize: "13px" }}>Apply</Button>
              <Button secondary onClick={onReset} style={{ height: "32px", fontSize: "13px" }}>Reset</Button>
            </Flex>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
};

const AttendanceReport = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [meta, setMeta] = useState({ totalSessions: 0, sessionsPresent: 0 });

  const [filters, setFilters] = useState(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterParamsRef = useRef({});
  const lastParamsRef = useRef({});

  const buildFilterParams = (f) => {
    const params = {};
    if (f.attendanceStatus) params.attendanceStatus = f.attendanceStatus;
    if (f.deliveryMode) params.deliveryMode = f.deliveryMode;
    if (f.startDate) params.startDate = f.startDate;
    if (f.endDate) params.endDate = f.endDate;
    return params;
  };

  const fetchReports = async (params = {}) => {
    lastParamsRef.current = params;
    setLoading(true);
    setError(null);
    try {
      const result = await getStudentAttendanceV2(studentId, {
        ...params,
        ...filterParamsRef.current,
      });
      const reportData = result?.data ?? {};
      const records = (reportData.records ?? []).map(mapRecordToRow);
      const limit = Number(params.limit) || 20;
      const totalDocumentsCount =
        reportData.totalCount ?? reportData.count ?? records.length;

      setKpis(reportData.kpis ?? null);
      setMeta({
        totalSessions: reportData.totalSessions ?? 0,
        sessionsPresent: reportData.sessionsPresent ?? 0,
      });

      return {
        rows: records,
        showingDocumentsCount: records.length,
        totalDocumentsCount,
        currentPage: Number(params.page) || 1,
        totalPages: Math.ceil(totalDocumentsCount / limit) || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch attendance report");
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    } finally {
      setLoading(false);
    }
  };

  const tableProps = {
    columns: [
      {
        id: "courseTitle",
        key: "courseTitle",
        text: "Course",
        fraction: "220px",
      },
      {
        id: "lessonTitle",
        key: "lessonTitle",
        text: "Lesson / Session",
        fraction: "180px",
      },
      {
        id: "sessionDate",
        key: "sessionDate",
        text: "Session Date",
        fraction: "130px",
        renderContent: (date) =>
          date && date !== "—" ? (
            <Text fontSize="sm">{dayjs(date).format("DD/MM/YYYY")}</Text>
          ) : (
            <Text fontSize="sm">—</Text>
          ),
      },
      {
        id: "attendanceStatus",
        key: "attendanceStatus",
        text: "Status",
        fraction: "120px",
        renderContent: (status) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={statusColorMap[status] ?? "gray"}
          >
            {status}
          </Tag>
        ),
      },
      {
        id: "entryTime",
        key: "entryTime",
        text: "Entry Time",
        fraction: "110px",
      },
      { id: "exitTime", key: "exitTime", text: "Exit Time", fraction: "110px" },
      { id: "duration", key: "duration", text: "Duration", fraction: "100px" },
      {
        id: "deliveryMode",
        key: "deliveryMode",
        text: "Mode",
        fraction: "110px",
        renderContent: (mode) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={deliveryColorMap[mode] ?? "gray"}
          >
            {mode}
          </Tag>
        ),
      },
    ],
    options: {
      selection: false,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => fetchReports(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    filterParamsRef.current = buildFilterParams(filters);
    fetchRowItems({ params: lastParamsRef.current });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    filterParamsRef.current = {};
    setFilterOpen(false);
    fetchRowItems({ params: lastParamsRef.current });
  };

  return (
    <AdminMainAreaWrapper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/studentReport">Learners</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Attendance Report</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Box display="flex" justifyContent="space-between" gap={4} mb={8}>
        <DashboardMetricCard
          title="Attendance Rate"
          value={kpis ? `${kpis.attendancePercentage ?? 0}%` : "—"}
          change={`${meta.sessionsPresent} sessions present`}
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Lessons Missed"
          value={`${kpis?.lessonsMissed ?? "—"}`}
          change="missed sessions"
          changeColor="#E53E3E"
        />
        <DashboardMetricCard
          title="Avg. Duration"
          value={
            kpis?.averageDurationMinutes != null
              ? `${kpis.averageDurationMinutes} min`
              : "—"
          }
          change="per session"
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="Total Sessions"
          value={`${meta.totalSessions}`}
          change={`${meta.sessionsPresent} present`}
          changeColor="#2B6CB0"
        />
      </Box>

      <CollapsibleFilterBar
        isOpen={filterOpen}
        onToggle={() => setFilterOpen((v) => !v)}
        filters={[
          { key: "attendanceStatus", label: "Attendance Status", type: "select", value: filters.attendanceStatus, options: ATTENDANCE_STATUS_OPTIONS },
          { key: "deliveryMode", label: "Delivery Mode", type: "select", value: filters.deliveryMode, options: DELIVERY_MODE_OPTIONS },
          { key: "startDate", label: "From Date", type: "date", value: filters.startDate },
          { key: "endDate", label: "To Date", type: "date", value: filters.endDate },
        ]}
        onChange={handleFilterChange}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {loading && !rows?.data?.rows?.length ? (
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading attendance report...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load attendance report"
          description={error}
          cta={<Button onClick={fetchRowItems}>Try Again</Button>}
        />
      ) : (
        <Table
          {...tableProps}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          placeholder="Search by course or lesson..."
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const AttendanceReportRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AttendanceReport {...props} />} />
  );
};

export default AttendanceReport;
