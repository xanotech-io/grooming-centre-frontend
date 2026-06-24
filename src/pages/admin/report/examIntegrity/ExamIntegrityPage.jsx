import { useCallback, useEffect, useRef, useState } from "react";
import { Route } from "react-router-dom";
import {
  Badge,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import { Button, Breadcrumb, Heading, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  getExamIntegrityList,
  getExamIntegrityDetail,
  getExamIrregularityLogs,
  adminGetCourseListing,
} from "../../../../services";
import dayjs from "dayjs";

// ─── Mock Data (fallback when API is unavailable) ─────────────────────────────
// TODO: remove once GET /v1/exam-integrity-v2/* endpoints are live

const MOCK_EXAMS = [
  {
    examId: "exam-001",
    examTitle: "Microfinance Midterm",
    course: { id: "course-001", title: "Microfinance Principles" },
    randomizationMethod: "full",
    totalAttempts: 100,
    duplicateDetectionCount: 2,
    duplicateQuestionRate: 2.0,
    avgQuestionOverlap: 15.5,
    randomizationEffectiveness: 85.0,
    irregularAttemptsCount: 3,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-002",
    examTitle: "Data Privacy Final",
    course: { id: "course-002", title: "Data Privacy & Compliance" },
    randomizationMethod: "full",
    totalAttempts: 80,
    duplicateDetectionCount: 0,
    duplicateQuestionRate: 0,
    avgQuestionOverlap: 5.0,
    randomizationEffectiveness: 95.0,
    irregularAttemptsCount: 0,
    integrityStatus: "Valid",
  },
  {
    examId: "exam-003",
    examTitle: "Network Security Quiz",
    course: { id: "course-003", title: "Network Security" },
    randomizationMethod: "partial",
    totalAttempts: 55,
    duplicateDetectionCount: 6,
    duplicateQuestionRate: 10.9,
    avgQuestionOverlap: 42.0,
    randomizationEffectiveness: 58.0,
    irregularAttemptsCount: 7,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-004",
    examTitle: "Introduction to Cybersecurity",
    course: { id: "course-004", title: "Cybersecurity Fundamentals" },
    randomizationMethod: "none",
    totalAttempts: 120,
    duplicateDetectionCount: 15,
    duplicateQuestionRate: 12.5,
    avgQuestionOverlap: 100.0,
    randomizationEffectiveness: 0,
    irregularAttemptsCount: 20,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-005",
    examTitle: "Ethics in Technology",
    course: { id: "course-005", title: "Tech Ethics & Society" },
    randomizationMethod: "partial",
    totalAttempts: 40,
    duplicateDetectionCount: 1,
    duplicateQuestionRate: 2.5,
    avgQuestionOverlap: 18.0,
    randomizationEffectiveness: 72.0,
    irregularAttemptsCount: 1,
    integrityStatus: "Flagged",
  },
  {
    examId: "exam-006",
    examTitle: "Cloud Computing Fundamentals",
    course: { id: "course-006", title: "Cloud Computing" },
    randomizationMethod: "full",
    totalAttempts: 65,
    duplicateDetectionCount: 0,
    duplicateQuestionRate: 0,
    avgQuestionOverlap: 3.0,
    randomizationEffectiveness: 97.0,
    irregularAttemptsCount: 0,
    integrityStatus: "Valid",
  },
];

const MOCK_LOGS = [
  {
    logId: "log-001",
    examId: "exam-001",
    studentId: "stu-001",
    student: {
      id: "stu-001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    },
    ipAddress: "192.168.1.1",
    deviceInfo: "Chrome 120 – Windows 11",
    geolocation: "Lagos, Nigeria",
    timestamp: "2026-04-10T10:15:00Z",
    anomalyTypes: ["same_ip", "duplicate_answers"],
  },
  {
    logId: "log-002",
    examId: "exam-001",
    studentId: "stu-002",
    student: {
      id: "stu-002",
      firstName: "Mary",
      lastName: "Johnson",
      email: "mary.j@example.com",
    },
    ipAddress: "192.168.1.1",
    deviceInfo: "Firefox 121 – Ubuntu",
    geolocation: "Abuja, Nigeria",
    timestamp: "2026-04-10T10:18:00Z",
    anomalyTypes: ["same_ip"],
  },
  {
    logId: "log-003",
    examId: "exam-001",
    studentId: "stu-003",
    student: {
      id: "stu-003",
      firstName: "James",
      lastName: "Smith",
      email: "james.s@example.com",
    },
    ipAddress: "10.0.0.55",
    deviceInfo: "Chrome 120 – macOS",
    geolocation: "Port Harcourt, Nigeria",
    timestamp: "2026-04-11T09:03:00Z",
    anomalyTypes: ["fast_completion"],
  },
];

const MOCK_DETAIL = {
  ...MOCK_EXAMS[0],
  course: { id: "course-001", title: "Microfinance Principles" },
  irregularityLogs: MOCK_LOGS,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) => (d ? dayjs(d).format("MMM D, YYYY, h:mm A") : "—");

const maskIp = (ip) => {
  if (!ip) return "—";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  return ip;
};

const effectivenessColor = (pct) => {
  if (pct >= 80) return "green";
  if (pct >= 50) return "yellow";
  return "red";
};

const dupRateColor = (rate) => {
  if (rate === 0) return "green";
  if (rate <= 5) return "orange";
  return "red";
};

const randomMethodScheme = (method) => {
  if (method === "full") return "blue";
  if (method === "partial") return "yellow";
  return "gray";
};

const anomalyLabel = {
  same_ip: "Same IP",
  duplicate_answers: "Duplicate Answers",
  fast_completion: "Fast Completion",
  same_device: "Same Device",
};

const anomalyScheme = {
  same_ip: "orange",
  duplicate_answers: "red",
  fast_completion: "purple",
  same_device: "cyan",
};

// ─── Anomaly Badges ────────────────────────────────────────────────────────────

const AnomalyBadges = ({ types = [] }) => (
  <Flex gap={1} flexWrap="wrap">
    {types.map((t) => (
      <Badge
        key={t}
        colorScheme={anomalyScheme[t] ?? "gray"}
        fontSize="2xs"
        px={2}
        py={0.5}
        borderRadius="full"
      >
        {anomalyLabel[t] ?? t}
      </Badge>
    ))}
  </Flex>
);

// ─── Log Row ───────────────────────────────────────────────────────────────────

const LogRow = ({ log }) => (
  <Tr>
    <Td>
      <Text fontWeight="medium">
        {log.student?.firstName} {log.student?.lastName}
      </Text>
      <Text fontSize="xs" color="gray.500">
        {log.student?.email}
      </Text>
    </Td>
    <Td fontSize="sm" color="gray.600">
      {maskIp(log.ipAddress)}
    </Td>
    <Td fontSize="sm">{log.deviceInfo || "—"}</Td>
    <Td fontSize="sm">{log.geolocation || "—"}</Td>
    <Td fontSize="sm" whiteSpace="nowrap">
      {fmt(log.timestamp)}
    </Td>
    <Td>
      <AnomalyBadges types={log.anomalyTypes ?? []} />
    </Td>
  </Tr>
);

// ─── Pagination Bar ────────────────────────────────────────────────────────────

const PaginationBar = ({
  page,
  totalPages,
  total,
  limit,
  onPage,
  onLimit,
  limitOptions = [10, 20, 50],
}) => (
  <Flex
    justify="space-between"
    align="center"
    px={4}
    py={3}
    borderTopWidth="1px"
  >
    <Text fontSize="sm" color="gray.600">
      Page {page} of {totalPages} &mdash; {total} record{total !== 1 ? "s" : ""}
    </Text>
    <Flex align="center" gap={3}>
      <Select
        size="sm"
        width="70px"
        value={limit}
        onChange={(e) => onLimit(Number(e.target.value))}
      >
        {limitOptions.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </Select>
      <Flex gap={1}>
        <Box
          as="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          p={1}
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          <FiChevronLeft />
        </Box>
        <Box
          as="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          p={1}
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          <FiChevronRight />
        </Box>
      </Flex>
    </Flex>
  </Flex>
);

// ─── Irregularity Logs Panel ───────────────────────────────────────────────────

const IrregularityLogsPanel = ({ examId, previewLogs }) => {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchLogs = useCallback(
    (p, l) => {
      setLoading(true);
      getExamIrregularityLogs(examId, { page: p, limit: l })
        .then((res) => {
          const d = res?.data ?? res;
          setLogs(d?.logs ?? []);
          setTotal(d?.total ?? 0);
        })
        .catch(() => {
          // TODO: endpoint GET /v1/exam-integrity-v2/exams/{id}/irregularity-logs not yet live — using mock
          console.warn(
            "[ExamIntegrity] /irregularity-logs failed, falling back to mock data",
          );
          setLogs(
            MOCK_LOGS.filter((l) => l.examId === examId).length
              ? MOCK_LOGS.filter((l) => l.examId === examId)
              : MOCK_LOGS,
          );
          setTotal(MOCK_LOGS.length);
        })
        .finally(() => setLoading(false));
    },
    [examId],
  );

  const handleExpand = () => {
    if (!expanded) fetchLogs(1, limit);
    setExpanded((v) => !v);
  };

  const handlePage = (p) => {
    setPage(p);
    fetchLogs(p, limit);
  };
  const handleLimit = (l) => {
    setLimit(l);
    setPage(1);
    fetchLogs(1, l);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const displayLogs = expanded ? logs : (previewLogs ?? []).slice(0, 5);

  return (
    <Box mt={6}>
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight="semibold" fontSize="md">
          Irregularity Logs
          {!expanded && previewLogs?.length > 0 && (
            <Text
              as="span"
              color="gray.400"
              fontWeight="normal"
              fontSize="sm"
              ml={2}
            >
              (preview — first {Math.min(5, previewLogs.length)})
            </Text>
          )}
        </Text>
        <Button size="sm" secondary onClick={handleExpand}>
          {expanded ? "Show Less" : "View All Logs"}
        </Button>
      </Flex>

      {displayLogs.length === 0 && !loading ? (
        <Box py={6} textAlign="center" bg="gray.50" borderRadius="md">
          <Text color="gray.500">
            No irregularities detected for this exam.
          </Text>
        </Box>
      ) : loading ? (
        <Box>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height="44px" mb={2} />
          ))}
        </Box>
      ) : (
        <TableContainer borderWidth="1px" borderRadius="md">
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Student</Th>
                <Th>IP Address</Th>
                <Th>Device</Th>
                <Th>Geolocation</Th>
                <Th>Timestamp</Th>
                <Th>Anomaly Types</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayLogs.map((log) => (
                <LogRow key={log.logId} log={log} />
              ))}
            </Tbody>
          </Table>
          {expanded && total > 0 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPage={handlePage}
              onLimit={handleLimit}
            />
          )}
        </TableContainer>
      )}
    </Box>
  );
};

// ─── Exam Detail Drawer ────────────────────────────────────────────────────────

const ExamDetailDrawer = ({ examId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isOpen || !examId) return;
    setData(null);
    setNotFound(false);
    setLoading(true);
    getExamIntegrityDetail(examId)
      .then((res) => setData(res?.data ?? res))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          // TODO: endpoint GET /v1/exam-integrity-v2/exams/{id} not yet live — using mock
          console.warn(
            "[ExamIntegrity] /exams/:id failed, falling back to mock data",
          );
          setData(
            MOCK_DETAIL.examId === examId
              ? MOCK_DETAIL
              : { ...MOCK_DETAIL, examId },
          );
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, examId]);

  const d = data;
  const isFlagged = d?.integrityStatus === "Flagged";

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader
          borderBottomWidth="1px"
          bg={isFlagged ? "red.50" : "white"}
          color={isFlagged ? "red.700" : "inherit"}
        >
          {loading ? "Loading…" : (d?.examTitle ?? "Exam Details")}
          {isFlagged && (
            <Badge colorScheme="red" ml={3} fontSize="sm">
              Flagged
            </Badge>
          )}
        </DrawerHeader>

        <DrawerBody py={6}>
          {loading && (
            <Box>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} height="20px" mb={3} />
              ))}
            </Box>
          )}

          {!loading && notFound && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" fontWeight="semibold" mb={2}>
                Exam not found
              </Text>
              <Text color="gray.500" mb={4}>
                This exam could not be retrieved.
              </Text>
              <Button onClick={onClose}>Back to List</Button>
            </Box>
          )}

          {!loading && d && (
            <>
              {d.course && (
                <Text color="gray.500" mb={4} fontSize="sm">
                  {d.course.title}
                </Text>
              )}

              {/* KPI block */}
              <SimpleGrid columns={2} spacing={4} mb={6}>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Randomization Method
                  </Text>
                  <Badge
                    colorScheme={randomMethodScheme(d.randomizationMethod)}
                    mt={1}
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {d.randomizationMethod ?? "—"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Integrity Status
                  </Text>
                  <Badge
                    colorScheme={
                      d.integrityStatus === "Valid" ? "green" : "red"
                    }
                    mt={1}
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {d.integrityStatus ?? "—"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Total Attempts
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {d.totalAttempts ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Irregular Attempts
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      (d.irregularAttemptsCount ?? 0) > 0
                        ? "red.500"
                        : "gray.700"
                    }
                  >
                    {d.irregularAttemptsCount ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Duplicate Sets Detected
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      (d.duplicateDetectionCount ?? 0) > 0
                        ? "orange.500"
                        : "gray.700"
                    }
                  >
                    {d.duplicateDetectionCount ?? "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Duplicate Question Rate
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      dupRateColor(d.duplicateQuestionRate ?? 0) === "green"
                        ? "green.600"
                        : dupRateColor(d.duplicateQuestionRate ?? 0) ===
                            "orange"
                          ? "orange.500"
                          : "red.500"
                    }
                  >
                    {d.duplicateQuestionRate != null
                      ? `${d.duplicateQuestionRate}%`
                      : "—"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Avg Question Overlap
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {d.avgQuestionOverlap != null
                      ? `${d.avgQuestionOverlap}%`
                      : "—"}
                  </Text>
                </Box>
                <Box gridColumn="span 2">
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Randomization Effectiveness
                  </Text>
                  <Flex align="center" gap={3}>
                    <Progress
                      flex="1"
                      size="sm"
                      value={d.randomizationEffectiveness ?? 0}
                      colorScheme={effectivenessColor(
                        d.randomizationEffectiveness ?? 0,
                      )}
                      borderRadius="full"
                    />
                    <Text fontSize="sm" fontWeight="medium" minW="40px">
                      {d.randomizationEffectiveness ?? 0}%
                    </Text>
                  </Flex>
                </Box>
              </SimpleGrid>

              <Divider mb={4} />

              <IrregularityLogsPanel
                examId={d.examId}
                previewLogs={d.irregularityLogs ?? []}
              />
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};


// ─── Main Page ─────────────────────────────────────────────────────────────────

const SearchableSelect = ({ value, options, onChange, placeholder, maxW }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";

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
    <Box ref={containerRef} position="relative" maxW={maxW}>
      <Input
        size="sm"
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
          maxH="200px"
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
                bg={String(o.value) === String(value) ? "#F3E8FF" : "white"}
                _hover={{ bg: String(o.value) === String(value) ? "#F3E8FF" : "#F9FAFB" }}
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

const LIMIT_OPTIONS = [10, 20, 50];

const ExamIntegrityPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState(null);

  useEffect(() => {
    adminGetCourseListing({ page: 1, limit: 200 })
      .then((res) => setCourses(res?.courses ?? []))
      .catch(() => {});
  }, []);

  const fetchExams = useCallback((cId, p, l) => {
    setTableLoading(true);
    const params = { page: p, limit: l };
    if (cId) params.courseId = cId;
    getExamIntegrityList(params)
      .then((res) => {
        const d = res?.data ?? res;
        setExams(d?.exams ?? []);
        setTotal(d?.total ?? 0);
      })
      .catch(() => {
        // TODO: endpoint GET /v1/exam-integrity-v2/exams not yet live — using mock
        console.warn(
          "[ExamIntegrity] /exams failed, falling back to mock data",
        );
        setExams(MOCK_EXAMS);
        setTotal(MOCK_EXAMS.length);
      })
      .finally(() => setTableLoading(false));
  }, []);

  useEffect(() => {
    fetchExams(courseId, page, limit);
  }, []); // eslint-disable-line

  const handleCourseChange = (val) => {
    setCourseId(val);
    setPage(1);
    fetchExams(val, 1, limit);
  };

  const clearFilter = () => {
    setCourseId("");
    setPage(1);
    fetchExams("", 1, limit);
  };

  const handleRowClick = (examId) => {
    setSelectedExamId(examId);
    onOpen();
  };

  const handlePage = (p) => {
    setPage(p);
    fetchExams(courseId, p, limit);
  };
  const handleLimit = (l) => {
    setLimit(l);
    setPage(1);
    fetchExams(courseId, 1, l);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/exam-integrity">Exam Integrity</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>

      <Heading level="2" mb={2}>
        Randomization &amp; Exam Integrity Report 
      </Heading>
      <Text color="gray.500" mb={6}>
        Track question randomization, detect duplicate exam sets, and monitor
        session-level irregularities.
      </Text>

      {/* ── Filter Bar ── */}
      <Box bg="white" borderRadius="lg" p={4} mb={6} boxShadow="sm">
        <Flex align="flex-end" gap={4} flexWrap="wrap">
          <FormControl maxW="280px">
            <FormLabel fontSize="xs">Course</FormLabel>
            <SearchableSelect
              value={courseId}
              onChange={handleCourseChange}
              options={courses.map((c) => ({ value: String(c.courseId || c.id), label: c.courseTitle || c.title || c.name }))}
              placeholder="Search course…"
              maxW="280px"
            />
          </FormControl>
          {courseId && (
            <Button
              size="sm"
              secondary
              onClick={clearFilter}
              leftIcon={<FiX />}
            >
              Clear Filter
            </Button>
          )}
          <Button
            size="sm"
            secondary
            onClick={() => fetchExams(courseId, page, limit)}
            leftIcon={<FiRefreshCw />}
          >
            Refresh
          </Button>
        </Flex>
      </Box>

      <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Flex
            justify="space-between"
            align="center"
            px={4}
            py={3}
            borderBottomWidth="1px"
          >
            <Text fontWeight="semibold">
              Exams
              {total > 0 && (
                <Text
                  as="span"
                  color="gray.500"
                  fontWeight="normal"
                  ml={2}
                  fontSize="sm"
                >
                  ({total} total)
                </Text>
              )}
            </Text>
          </Flex>

          {tableLoading ? (
            <Box p={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="48px" mb={2} />
              ))}
            </Box>
          ) : exams.length === 0 ? (
            <Box p={10} textAlign="center">
              <Text color="gray.500">No exams found.</Text>
            </Box>
          ) : (
            <TableContainer>
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Exam Title</Th>
                    <Th>Course</Th>
                    <Th>Randomization</Th>
                    <Th isNumeric>Attempts</Th>
                    <Th isNumeric>Dup. Sets</Th>
                    <Th isNumeric>Dup. Rate</Th>
                    <Th isNumeric>Irregular</Th>
                    <Th>Integrity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exams.map((exam) => {
                    const flagged = exam.integrityStatus === "Flagged";
                    return (
                      <Tr
                        key={exam.examId}
                        bg={flagged ? "red.50" : "white"}
                        _hover={{ bg: flagged ? "red.100" : "gray.50" }}
                        cursor="pointer"
                        onClick={() => handleRowClick(exam.examId)}
                      >
                        <Td>
                          <Flex align="center" gap={2}>
                            {flagged && <FiAlertTriangle color="#C53030" />}
                            <Text
                              color="blue.600"
                              fontWeight="medium"
                              _hover={{ textDecoration: "underline" }}
                            >
                              {exam.examTitle}
                            </Text>
                          </Flex>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.700" noOfLines={1}>
                            {exam.course?.title ?? "—"}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={randomMethodScheme(
                              exam.randomizationMethod,
                            )}
                            borderRadius="full"
                            px={2}
                            textTransform="capitalize"
                          >
                            {exam.randomizationMethod ?? "—"}
                          </Badge>
                        </Td>
                        <Td isNumeric>{exam.totalAttempts ?? "—"}</Td>
                        <Td isNumeric>
                          <Text
                            color={
                              (exam.duplicateDetectionCount ?? 0) > 0
                                ? "orange.500"
                                : "gray.700"
                            }
                            fontWeight="medium"
                          >
                            {exam.duplicateDetectionCount ?? "—"}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text
                            color={
                              dupRateColor(exam.duplicateQuestionRate ?? 0) ===
                              "red"
                                ? "red.500"
                                : dupRateColor(
                                      exam.duplicateQuestionRate ?? 0,
                                    ) === "orange"
                                  ? "orange.500"
                                  : "green.600"
                            }
                            fontWeight="medium"
                          >
                            {exam.duplicateQuestionRate != null
                              ? `${exam.duplicateQuestionRate}%`
                              : "—"}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          {(exam.irregularAttemptsCount ?? 0) > 0 ? (
                            <Badge colorScheme="red" borderRadius="full" px={2}>
                              {exam.irregularAttemptsCount}
                            </Badge>
                          ) : (
                            <Text color="gray.500">0</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              exam.integrityStatus === "Valid" ? "green" : "red"
                            }
                            borderRadius="full"
                            px={2}
                          >
                            {exam.integrityStatus ?? "—"}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {!tableLoading && total > 0 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPage={handlePage}
              onLimit={handleLimit}
              limitOptions={LIMIT_OPTIONS}
            />
          )}
      </Box>

      {/* Exam Detail Drawer */}
      <ExamDetailDrawer
        examId={selectedExamId}
        isOpen={isOpen}
        onClose={onClose}
      />
    </AdminMainAreaWrapper>
  );
};

export const ExamIntegrityPageRoute = (props) => (
  <Route {...props} component={ExamIntegrityPage} />
);

export default ExamIntegrityPage;
