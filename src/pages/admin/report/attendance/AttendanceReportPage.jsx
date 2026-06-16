import { useState, useEffect, useRef } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import {
  BreadcrumbItem,
  Tag,
  useToast,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Table,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import { getAttendanceReport, adminGetStudents } from "../../../../services";
import dayjs from "dayjs";
import { AiOutlineClose } from "react-icons/ai";

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

const StudentAutocomplete = ({ onStudentChange }) => {
  const [inputText, setInputText] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState("");
  const containerRef = useRef(null);

  // Load full student list once on mount
  useEffect(() => {
    adminGetStudents({ limit: 500 })
      .then(({ students }) => setAllStudents(students ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = inputText.trim()
    ? allStudents.filter((s) =>
        getStudentDisplayName(s)
          .toLowerCase()
          .includes(inputText.trim().toLowerCase())
      )
    : allStudents;

  const handleSelect = (student) => {
    const name = getStudentDisplayName(student);
    setSelectedName(name);
    setInputText(name);
    setIsOpen(false);
    onStudentChange(student.id);
  };

  const handleClear = () => {
    setInputText("");
    setSelectedName("");
    setIsOpen(false);
    onStudentChange("");
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    setIsOpen(true);
    if (selectedName && val !== selectedName) {
      setSelectedName("");
      onStudentChange("");
    }
  };

  const handleFocus = () => setIsOpen(true);

  return (
    <Box position="relative" ref={containerRef} minW="300px" maxW="360px">
      <InputGroup size="sm">
        <Input
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={loading ? "Loading students…" : "Search or select a student…"}
          isDisabled={loading}
          bg="white"
          borderRadius="md"
          borderColor="gray.300"
          _hover={{ borderColor: "gray.400" }}
          pr={inputText ? "32px" : undefined}
        />
        {loading && (
          <InputRightElement>
            <Spinner size="xs" color="gray.400" />
          </InputRightElement>
        )}
        {!loading && inputText && (
          <InputRightElement>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Clear student"
              icon={<AiOutlineClose />}
              onClick={handleClear}
              _hover={{ bg: "transparent" }}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {isOpen && !loading && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="white"
          border="1px"
          borderColor="gray.200"
          rounded="md"
          shadow="md"
          zIndex={10}
          maxH="220px"
          overflowY="auto"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2}>
              <Text fontSize="sm" color="gray.400">No students found</Text>
            </Box>
          ) : (
            filtered.map((s) => (
              <Box
                key={s.id}
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s);
                }}
              >
                <Text fontSize="sm">{getStudentDisplayName(s)}</Text>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

const AttendanceReportPage = () => {
  const toast = useToast();
  const [kpis, setKpis] = useState(null);
  const [meta, setMeta] = useState({ totalSessions: 0, sessionsPresent: 0 });

  const studentIdRef = useRef("");
  const lastParamsRef = useRef({});

  const fetchReport = async (params = {}) => {
    lastParamsRef.current = params;
    const finalParams = {
      ...params,
      ...(studentIdRef.current ? { studentId: studentIdRef.current } : {}),
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
    filterControls: [
      {
        triggerText: "Attendance Status",
        queryKey: "attendanceStatus",
        width: "200px",
        body: {
          radios: [
            { label: "Present", queryValue: "Present" },
            { label: "Absent", queryValue: "Absent" },
            { label: "Late", queryValue: "Late" },
            { label: "Excused", queryValue: "Excused" },
          ],
        },
      },
      {
        triggerText: "Delivery Mode",
        queryKey: "deliveryMode",
        width: "180px",
        body: {
          radios: [
            { label: "Virtual", queryValue: "Virtual" },
            { label: "Physical", queryValue: "Physical" },
          ],
        },
      },
    ],
    options: {
      dateFilter: true,
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

  const handleStudentSelect = (studentId) => {
    studentIdRef.current = studentId;
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
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/attendance">Attendance Report</Link>
            </BreadcrumbItem>
          }
        />
        <Button onClick={fetchRowItems}>Refresh Report</Button>
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

      {/* Student search — type to find a student, pick from dropdown */}
      <Box
        display="flex"
        alignItems="center"
        gap={3}
        mb={4}
        p={3}
        bg="white"
        rounded="md"
        border="1px"
        borderColor="accent.2"
      >
        <Text fontSize="sm" fontWeight="600" color="gray.600" whiteSpace="nowrap">
          Student:
        </Text>
        <StudentAutocomplete onStudentChange={handleStudentSelect} />
      </Box>

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
