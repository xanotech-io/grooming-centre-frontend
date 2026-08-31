import { useState, useEffect, useRef } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import {
  BreadcrumbItem,
  Tag,
  useToast,
  Input,
  Select,
  Collapse,
} from "@chakra-ui/react";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  ExportMenu,
  Heading,
  Link,
  Table,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import { getAttendanceReport, adminGetStudents } from "../../../../services";
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

const mapToRow = (record) => ({
  id: record.id,
  studentName: record.student.firstName ?? record.student?.firstName ?? "—",
  courseTitle: record.courseTitle ?? record.course?.title ?? "—",
  lessonTitle: record.lessonTitle ?? record.lesson?.title ?? "—",
  sessionDate: record.sessionDate ?? "—",
  attendanceStatus: record.attendanceStatus ?? record.status ?? "—",
  entryTime: record.entryTime ?? "—",
  exitTime: record.exitTime ?? "—",
  duration:
    record.durationMinutes > 0 ? `${record.durationMinutes} min` : "—",
  deliveryMode: record.deliveryMode ?? "—",
});

const getStudentDisplayName = (s) =>
  `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email || s.id;

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
  studentId: "",
  attendanceStatus: "",
  deliveryMode: "",
  startDate: "",
  endDate: "",
};

// ── Filter sub-components (mirrors the CourseCompletionReportPage filter bar) ──

const SearchableSelect = ({ value, options, onChange, placeholder }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    setQuery(value ? selectedLabel : "");
  }, [value, selectedLabel]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery(value ? selectedLabel : "");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, selectedLabel]);

  return (
    <Box ref={containerRef} position="relative">
      <Input
        size="md"
        borderRadius="md"
        bg="white"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={200}
          bg="white"
          border="1px solid #E4E7EC"
          borderRadius="md"
          boxShadow="md"
          maxH="400px"
          overflowY="auto"
          mt="2px"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="#667085">No results</Box>
          ) : (
            filtered.map((o) => (
              <Box
                key={o.value}
                px={3}
                py="7px"
                fontSize="13px"
                cursor="pointer"
                bg={o.value === value ? "#F3E8FF" : "white"}
                _hover={{ bg: o.value === value ? "#F3E8FF" : "#F9FAFB" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setQuery(o.label);
                  setIsOpen(false);
                }}
              >
                {o.label}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

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
              f.type === "searchable-select" ? (
                <Box key={f.key} minW="200px">
                  <Text fontSize="12px" fontWeight="500" color="#667085" mb={1}>{f.label}</Text>
                  <SearchableSelect
                    value={f.value}
                    options={f.options}
                    onChange={(val) => onChange(f.key, val)}
                    placeholder={`Search ${f.label}…`}
                  />
                </Box>
              ) : f.type === "select" ? (
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

const AttendanceReportPage = () => {
  const toast = useToast();
  const [kpis, setKpis] = useState(null);
  const [meta, setMeta] = useState({ totalSessions: 0, sessionsPresent: 0 });
  const [students, setStudents] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  const filterParamsRef = useRef({});
  const lastParamsRef = useRef({});

  useEffect(() => {
    adminGetStudents({ limit: 500 })
      .then(({ students }) => setStudents(students ?? []))
      .catch(() => {});
  }, []);

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: getStudentDisplayName(s),
  }));

  const buildFilterParams = (f) => {
    const params = {};
    if (f.studentId) params.studentId = f.studentId;
    if (f.attendanceStatus) params.attendanceStatus = f.attendanceStatus;
    if (f.deliveryMode) params.deliveryMode = f.deliveryMode;
    if (f.startDate) params.startDate = f.startDate;
    if (f.endDate) params.endDate = f.endDate;
    return params;
  };

  const fetchReport = async (params = {}) => {
    lastParamsRef.current = params;
    const finalParams = {
      ...params,
      ...filterParamsRef.current,
    };

    try {
      const result = await getAttendanceReport(finalParams);
      const reportData = result?.data ?? {};
      const records = (reportData.records ?? []).map(mapToRow);
      const limit = Number(params.limit) || 20;
      const totalDocumentsCount =
        reportData.totalCount ??
        reportData.count ??
        reportData.total ??
        records.length;

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
      toast({
        status: "error",
        description: err.message || "Unable to fetch attendance report",
        duration: 3000,
        isClosable: true,
      });
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    }
  };

  const tableProps = {
    options: {
      dateFilter: false,
      selection: false,
      pagination: true,
    },
    columns: [
      {
        id: "studentName",
        key: "studentName",
        text: "Student",
        fraction: "170px",
        renderContent: (value) => (
          <Text fontWeight="600" fontSize="14px" color="#101828">
            {value}
          </Text>
        ),
      },
      {
        id: "courseTitle",
        key: "courseTitle",
        text: "Course",
        fraction: "200px",
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
      {
        id: "exitTime",
        key: "exitTime",
        text: "Exit Time",
        fraction: "110px",
      },
      {
        id: "duration",
        key: "duration",
        text: "Duration",
        fraction: "100px",
      },
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
  };

  const fetcher = (props) => async () => fetchReport(props?.params);
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

  const attendanceRows = rows?.data?.rows ?? [];

  const csvRows = [
    ["Student", "Course", "Lesson / Session", "Session Date", "Status", "Entry Time", "Exit Time", "Duration", "Mode"],
    ...attendanceRows.map((row) => [
      row.studentName,
      row.courseTitle,
      row.lessonTitle,
      row.sessionDate && row.sessionDate !== "—" ? dayjs(row.sessionDate).format("DD/MM/YYYY") : "—",
      row.attendanceStatus,
      row.entryTime,
      row.exitTime,
      row.duration,
      row.deliveryMode,
    ]),
  ];

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
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/attendance">Attendance Report</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap={2}>
          <ExportMenu
            rows={csvRows}
            filename="attendance-report"
            title="Attendance Report"
            isDisabled={attendanceRows.length === 0}
          />
          <Button onClick={fetchRowItems}>Refresh Report</Button>
        </Flex>
      </Box>

      <Flex
        justifyContent="space-between"
        flexDirection={{ lg: "row", base: "column", md: "column" }}
        alignItems={{ base: "flex-start", md: "flex-start" }}
        rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            Attendance Report
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Learner participation records across instructor-led and virtual
            training sessions
          </Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
        <DashboardMetricCard
          title="Attendance Percentage"
          value={kpis ? `${kpis.attendancePercentage ?? 0}%` : "—"}
          change="overall attendance"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Lessons Missed"
          value={`${kpis?.lessonsMissed ?? 0}`}
          change="missed sessions"
          changeColor="#E53E3E"
        />
        <DashboardMetricCard
          title="Avg. Duration"
          value={`${kpis?.averageDurationMinutes ?? 0} min`}
          change="per session"
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="Total Sessions"
          value={`${meta.totalSessions}`}
          change="recorded sessions"
          changeColor="#B7791F"
        />
      </SimpleGrid>

      <CollapsibleFilterBar
        isOpen={filterOpen}
        onToggle={() => setFilterOpen((v) => !v)}
        filters={[
          { key: "studentId", label: "Student", type: "searchable-select", value: filters.studentId, options: studentOptions },
          { key: "attendanceStatus", label: "Attendance Status", type: "select", value: filters.attendanceStatus, options: ATTENDANCE_STATUS_OPTIONS },
          { key: "deliveryMode", label: "Delivery Mode", type: "select", value: filters.deliveryMode, options: DELIVERY_MODE_OPTIONS },
          { key: "startDate", label: "From Date", type: "date", value: filters.startDate },
          { key: "endDate", label: "To Date", type: "date", value: filters.endDate },
        ]}
        onChange={handleFilterChange}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <Table
        {...tableProps}
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
        placeholder="Search by course or lesson..."
      />
    </AdminMainAreaWrapper>
  );
};

export const AttendanceReportPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <AttendanceReportPage {...props} />}
    />
  );
};

export default AttendanceReportPage;
