import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  Badge,
  Spinner,
  Progress,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiActivity,
  FiBarChart2,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import { Button, Heading } from "../../../components";
import {
  adminGetStudentProgressV2,
  adminGetStudentKpisV2,
  adminGetStudentActivityV2,
  adminGetTrainingReport,
} from "../../../services";

// ── Shared helpers ────────────────────────────────────────────────────────────

const Tab = ({ label, icon, active, onClick }) => (
  <Flex
    as="button"
    alignItems="center"
    gap="6px"
    px="20px"
    py="11px"
    fontSize="13px"
    fontWeight={active ? "600" : "400"}
    color={active ? "#6b006b" : "gray.500"}
    borderBottom={active ? "2px solid #6b006b" : "2px solid transparent"}
    bg="transparent"
    cursor="pointer"
    onClick={onClick}
    transition="all 0.15s"
    _hover={{ color: "#6b006b" }}
    whiteSpace="nowrap"
  >
    {icon}
    {label}
  </Flex>
);

const statusStyle = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return { bg: "#E6F4EA", color: "#38A169" };
  if (s === "in progress") return { bg: "#EBF4FF", color: "#3182CE" };
  if (s === "not started") return { bg: "#F7FAFC", color: "#718096" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const StatusBadge = ({ status }) => {
  const s = statusStyle(status);
  return (
    <Badge
      bg={s.bg} color={s.color}
      px="8px" py="3px" borderRadius="10px"
      textTransform="none" fontSize="11px" fontWeight="500"
    >
      {status || "—"}
    </Badge>
  );
};

const KpiCard = ({ label, value, color, bg }) => (
  <Box bg={bg || "#F7FAFC"} borderRadius="10px" p="16px" textAlign="center">
    <Text fontSize="22px" fontWeight="800" color={color || "#1A202C"}>{value ?? "—"}</Text>
    <Text fontSize="12px" color="gray.500" mt="4px">{label}</Text>
  </Box>
);

const ScoreBar = ({ value, color }) => (
  <Box>
    <Flex justifyContent="space-between" mb="4px">
      <Text fontSize="12px" color="gray.500">Score</Text>
      <Text fontSize="12px" fontWeight="700" color={color || "#6b006b"}>{value != null ? `${value}%` : "—"}</Text>
    </Flex>
    <Progress value={value ?? 0} size="xs" borderRadius="4px" sx={{ "& > div": { background: color || "#6b006b" } }} />
  </Box>
);

// ── Progress Tab ──────────────────────────────────────────────────────────────

const ProgressTab = ({ studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    try {
      const res = await adminGetStudentProgressV2(studentId);
      setData(res);
    } catch { setErr(true); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (err || !data) return (
    <Flex justifyContent="center" py="60px" flexDirection="column" alignItems="center" gap="12px">
      <Text color="red.500">Failed to load progress data.</Text>
      <Button secondary size="sm" leftIcon={<FiRefreshCw />} onClick={load}>Retry</Button>
    </Flex>
  );

  const courses = data.courses ?? [];

  return (
    <Box p="20px">
      {/* Student header */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px" mb="20px">
        <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px">
          <Box>
            <Text fontSize="18px" fontWeight="700" color="#1A202C">{data.studentName}</Text>
            <Text fontSize="13px" color="gray.500">{data.email}</Text>
            {data.department && <Text fontSize="12px" color="gray.400" mt="2px">{data.department}</Text>}
          </Box>
        </Flex>
      </Box>

      {/* Courses */}
      {courses.length === 0 ? (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="40px" textAlign="center">
          <Text color="gray.400">No course progress data found.</Text>
        </Box>
      ) : (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Course", "Modules", "Completion", "Scores", "Certificate", "Last Access"].map((h) => (
                    <Th key={h} py="12px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {courses.map((c, i) => (
                  <Tr key={c.courseId || i} _hover={{ bg: "#F7FAFC" }}>
                    <Td py="14px" maxW="220px">
                      <Text fontSize="13px" fontWeight="600" noOfLines={2}>{c.courseTitle}</Text>
                      <StatusBadge status={c.completionStatus} />
                    </Td>
                    <Td py="14px">
                      <Text fontSize="13px" fontWeight="600">{c.modulesCompleted ?? "—"}</Text>
                    </Td>
                    <Td py="14px" minW="140px">
                      <Flex justifyContent="space-between" mb="4px">
                        <Text fontSize="12px" color="gray.500">Progress</Text>
                        <Text fontSize="12px" fontWeight="700" color="#6b006b">{c.completionPercentage != null ? `${c.completionPercentage}%` : "—"}</Text>
                      </Flex>
                      <Progress value={c.completionPercentage ?? 0} size="xs" borderRadius="4px" colorScheme="purple" />
                    </Td>
                    <Td py="14px" minW="160px">
                      <Flex flexDirection="column" gap="4px">
                        {c.assessmentScore != null && <Text fontSize="11px" color="gray.600">Assessment: <Text as="span" fontWeight="700">{c.assessmentScore}%</Text></Text>}
                        {c.courseExamScore != null && <Text fontSize="11px" color="gray.600">Exam: <Text as="span" fontWeight="700">{c.courseExamScore}%</Text></Text>}
                        {c.standaloneExamScore != null && <Text fontSize="11px" color="gray.600">Standalone: <Text as="span" fontWeight="700">{c.standaloneExamScore}%</Text></Text>}
                        {c.latestScore != null && (
                          <Text fontSize="12px" fontWeight="700" color="#6b006b">Latest avg: {c.latestScore}%</Text>
                        )}
                        {c.assessmentScore == null && c.courseExamScore == null && c.standaloneExamScore == null && (
                          <Text fontSize="12px" color="gray.400">No scores yet</Text>
                        )}
                      </Flex>
                    </Td>
                    <Td py="14px">
                      <Badge
                        bg={c.certificateEarned === "Yes" ? "#E6F4EA" : "#F7FAFC"}
                        color={c.certificateEarned === "Yes" ? "#38A169" : "#718096"}
                        px="8px" py="3px" borderRadius="10px" fontSize="11px" textTransform="none"
                      >
                        {c.certificateEarned === "Yes" ? "✓ Earned" : "Not Yet"}
                      </Badge>
                    </Td>
                    <Td py="14px" fontSize="12px" color="gray.500">
                      {c.lastAccessDate ? new Date(c.lastAccessDate).toLocaleDateString() : "—"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

// ── Activity Tab ──────────────────────────────────────────────────────────────

const ActivityTab = ({ studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    try { setData(await adminGetStudentActivityV2(studentId)); }
    catch { setErr(true); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (err || !data) return (
    <Flex justifyContent="center" py="60px" flexDirection="column" alignItems="center" gap="12px">
      <Text color="red.500">Failed to load activity data.</Text>
      <Button secondary size="sm" leftIcon={<FiRefreshCw />} onClick={load}>Retry</Button>
    </Flex>
  );

  return (
    <Box p="20px">
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }} gap="12px" mb="24px">
        {[
          { label: "Last Login", value: data.lastLoginDate ? new Date(data.lastLoginDate).toLocaleDateString() : "—", color: "#6b006b", bg: "#F0E6FF" },
          { label: "Weekly Logins", value: data.weeklyLogins ?? "—", color: "#3182CE", bg: "#EBF4FF" },
          { label: "Monthly Logins", value: data.monthlyLogins ?? "—", color: "#38A169", bg: "#E6F4EA" },
          { label: "Total Hours", value: data.totalTimeSpentHours != null ? `${data.totalTimeSpentHours}h` : "—", color: "#DD6B20", bg: "#FFF5EA" },
          { label: "Total Sessions", value: data.totalSessionCount ?? "—", color: "#E53E3E", bg: "#FED7D7" },
        ].map((k) => <KpiCard key={k.label} {...k} />)}
      </Grid>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
        <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">Engagement Summary</Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px">
          <Box>
            <Text fontSize="12px" color="gray.500" mb="6px">Weekly Activity Rate</Text>
            <Flex alignItems="center" gap="12px">
              <Text fontSize="28px" fontWeight="800" color="#6b006b">{data.weeklyLogins ?? 0}</Text>
              <Text fontSize="13px" color="gray.500">logins this week</Text>
            </Flex>
            <Progress mt="8px" value={Math.min((data.weeklyLogins ?? 0) * 14, 100)} size="sm" colorScheme="purple" borderRadius="4px" />
          </Box>
          <Box>
            <Text fontSize="12px" color="gray.500" mb="6px">Time Invested</Text>
            <Flex alignItems="center" gap="12px">
              <Text fontSize="28px" fontWeight="800" color="#3182CE">{data.totalTimeSpentHours ?? 0}h</Text>
              <Text fontSize="13px" color="gray.500">total learning time</Text>
            </Flex>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

// ── KPIs Tab ──────────────────────────────────────────────────────────────────

const KpisTab = ({ studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    try { setData(await adminGetStudentKpisV2(studentId)); }
    catch { setErr(true); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (err || !data) return (
    <Flex justifyContent="center" py="60px" flexDirection="column" alignItems="center" gap="12px">
      <Text color="red.500">Failed to load KPIs.</Text>
      <Button secondary size="sm" leftIcon={<FiRefreshCw />} onClick={load}>Retry</Button>
    </Flex>
  );

  const courses = data.courses ?? [];

  return (
    <Box p="20px">
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap="12px" mb="24px">
        <KpiCard label="Total Courses" value={data.totalCourses} color="#3182CE" bg="#EBF4FF" />
        <KpiCard label="Completed" value={data.completedCourses} color="#38A169" bg="#E6F4EA" />
        <KpiCard
          label="Completion Rate"
          value={data.completionPercentage != null ? `${data.completionPercentage}%` : "—"}
          color="#6b006b" bg="#F0E6FF"
        />
        <KpiCard
          label="Average Score"
          value={data.averageScore != null ? `${data.averageScore}%` : "—"}
          color="#DD6B20" bg="#FFF5EA"
        />
      </Grid>

      {courses.length > 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
          <Box px="20px" py="14px" borderBottom="1px solid #E2E8F0">
            <Text fontSize="13px" fontWeight="600" color="gray.700">Per-Course Breakdown</Text>
          </Box>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Course", "Status", "Completion", "Avg Score"].map((h) => (
                    <Th key={h} py="11px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {courses.map((c, i) => (
                  <Tr key={c.courseId || i} _hover={{ bg: "#F7FAFC" }}>
                    <Td py="12px" maxW="240px">
                      <Text fontSize="13px" fontWeight="500" noOfLines={1}>{c.courseTitle}</Text>
                    </Td>
                    <Td py="12px"><StatusBadge status={c.completionStatus} /></Td>
                    <Td py="12px" minW="140px">
                      <ScoreBar value={c.completionPercentage} color="#6b006b" />
                    </Td>
                    <Td py="12px" minW="120px">
                      <ScoreBar value={c.averageScore} color="#3182CE" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

// ── Training Report Tab ───────────────────────────────────────────────────────

const TrainingReportTab = ({ studentId }) => {
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    try { setReport(await adminGetTrainingReport(studentId)); }
    catch { setErr(true); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ["Report ID", "Student", "Email", "Department", "Generated By", "Timestamp"],
      [report.reportId, report.studentName, report.email, report.department, report.generatedBy, report.generationTimestamp],
      [],
      ["Summary", "Total Courses", "Completed", "Overall Completion %", "Avg Performance", "Certificates", "Benchmark"],
      ["", report.summary?.totalCourses, report.summary?.completedCourses, report.summary?.overallCompletionPercentage, report.summary?.averagePerformance, report.summary?.certificatesEarned, report.summary?.benchmarkAchieved ? "Yes" : "No"],
      [],
      ["Courses"],
      ["Course Title", "Modules", "Completion %", "Assessment Score", "Exam Score", "Standalone Score", "Latest Score", "Avg Score", "Certificate", "Status"],
      ...(report.courses ?? []).map((c) => [
        c.courseTitle, c.modulesCompleted, c.completionPercentage,
        c.assessmentScore ?? "—", c.courseExamScore ?? "—", c.standaloneExamScore ?? "—",
        c.latestScore ?? "—", c.averageScore ?? "—", c.certificateEarned, c.completionStatus,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-report-${report.reportId || studentId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", status: "success", duration: 2000, isClosable: true });
  };

  if (loading) return <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>;
  if (err || !report) return (
    <Flex justifyContent="center" py="60px" flexDirection="column" alignItems="center" gap="12px">
      <Text color="red.500">Failed to load training report.</Text>
      <Button secondary size="sm" leftIcon={<FiRefreshCw />} onClick={load}>Retry</Button>
    </Flex>
  );

  const s = report.summary ?? {};
  const a = report.activityMetrics ?? {};
  const courses = report.courses ?? [];

  return (
    <Box p="20px">
      {/* Report header */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px" mb="20px">
        <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px" mb="16px">
          <Box>
            <Flex alignItems="center" gap="10px" mb="6px">
              <Badge bg="#F0E6FF" color="#6b006b" px="10px" py="3px" borderRadius="6px" fontSize="12px" fontWeight="700">
                {report.reportId}
              </Badge>
              {s.benchmarkAchieved && (
                <Badge bg="#E6F4EA" color="#38A169" px="10px" py="3px" borderRadius="6px" fontSize="12px">
                  ✓ Benchmark Achieved
                </Badge>
              )}
            </Flex>
            <Text fontSize="18px" fontWeight="700" color="#1A202C">{report.studentName}</Text>
            <Text fontSize="13px" color="gray.500">{report.email}</Text>
            {report.department && <Text fontSize="12px" color="gray.400">{report.department}</Text>}
          </Box>
          <Box textAlign="right">
            <Text fontSize="12px" color="gray.400">Generated by: {report.generatedBy}</Text>
            <Text fontSize="12px" color="gray.400">
              {report.generationTimestamp ? new Date(report.generationTimestamp).toLocaleString() : ""}
            </Text>
            <Button secondary size="sm" mt="8px" leftIcon={<FiFileText size={12} />} onClick={handleExportCSV}>
              Export CSV
            </Button>
          </Box>
        </Flex>

        <Divider mb="16px" />

        {/* Summary KPIs */}
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap="12px">
          <KpiCard label="Total Courses" value={s.totalCourses} color="#3182CE" bg="#EBF4FF" />
          <KpiCard label="Completed" value={s.completedCourses} color="#38A169" bg="#E6F4EA" />
          <KpiCard label="Overall Completion" value={s.overallCompletionPercentage != null ? `${s.overallCompletionPercentage}%` : "—"} color="#6b006b" bg="#F0E6FF" />
          <KpiCard label="Avg Performance" value={s.averagePerformance != null ? `${s.averagePerformance}%` : "—"} color="#DD6B20" bg="#FFF5EA" />
          <KpiCard label="Certificates" value={s.certificatesEarned} color="#553C9A" bg="#E9D8FD" />
          <KpiCard label="Activity Rate" value={a.weeklyLogins ?? "—"} color="#E53E3E" bg="#FED7D7" />
        </Grid>
      </Box>

      {/* Activity metrics */}
      {Object.keys(a).length > 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px" mb="20px">
          <Text fontSize="14px" fontWeight="600" color="gray.700" mb="14px">Activity Metrics</Text>
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(5, 1fr)" }} gap="12px">
            {[
              { label: "Last Login", value: a.lastLoginDate ? new Date(a.lastLoginDate).toLocaleDateString() : "—" },
              { label: "Weekly Logins", value: a.weeklyLogins },
              { label: "Monthly Logins", value: a.monthlyLogins },
              { label: "Total Hours", value: a.totalTimeSpentHours != null ? `${a.totalTimeSpentHours}h` : "—" },
              { label: "Total Sessions", value: a.totalSessionCount },
            ].map((m) => (
              <Box key={m.label} bg="#F7FAFC" borderRadius="8px" p="14px" textAlign="center">
                <Text fontSize="18px" fontWeight="700" color="#1A202C">{m.value ?? "—"}</Text>
                <Text fontSize="11px" color="gray.500" mt="3px">{m.label}</Text>
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {/* Course-level detail */}
      {courses.length > 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
          <Box px="20px" py="14px" borderBottom="1px solid #E2E8F0">
            <Text fontSize="13px" fontWeight="600" color="gray.700">Course Detail ({courses.length})</Text>
          </Box>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Course", "Modules", "Completion", "Assessment", "Exam", "Standalone", "Latest", "Certificate", "Status"].map((h) => (
                    <Th key={h} py="11px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {courses.map((c, i) => (
                  <Tr key={c.courseId || i} _hover={{ bg: "#F7FAFC" }}>
                    <Td py="12px" maxW="200px">
                      <Text fontSize="13px" fontWeight="500" noOfLines={2}>{c.courseTitle}</Text>
                    </Td>
                    <Td py="12px" fontSize="12px" color="gray.600">{c.modulesCompleted ?? "—"}</Td>
                    <Td py="12px" minW="100px">
                      <Text fontSize="12px" fontWeight="700" color="#6b006b">
                        {c.completionPercentage != null ? `${c.completionPercentage}%` : "—"}
                      </Text>
                    </Td>
                    <Td py="12px" fontSize="12px">{c.assessmentScore != null ? `${c.assessmentScore}%` : "—"}</Td>
                    <Td py="12px" fontSize="12px">{c.courseExamScore != null ? `${c.courseExamScore}%` : "—"}</Td>
                    <Td py="12px" fontSize="12px">{c.standaloneExamScore != null ? `${c.standaloneExamScore}%` : "—"}</Td>
                    <Td py="12px" fontSize="12px" fontWeight="700" color="#6b006b">
                      {c.latestScore != null ? `${c.latestScore}%` : "—"}
                    </Td>
                    <Td py="12px">
                      <Badge
                        bg={c.certificateEarned === "Yes" ? "#E6F4EA" : "#F7FAFC"}
                        color={c.certificateEarned === "Yes" ? "#38A169" : "#718096"}
                        px="8px" py="3px" borderRadius="10px" fontSize="11px" textTransform="none"
                      >
                        {c.certificateEarned === "Yes" ? "✓ Yes" : "No"}
                      </Badge>
                    </Td>
                    <Td py="12px"><StatusBadge status={c.completionStatus} /></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const StudentTrainingReportPage = () => {
  const { studentId } = useParams();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("progress");

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between" mb="24px" flexWrap="wrap" gap="12px">
        <Flex alignItems="center" gap="12px">
          <Flex
            as="button" alignItems="center" gap="6px" color="#6b006b"
            onClick={() => history.goBack()} _hover={{ opacity: 0.8 }}
          >
            <FiArrowLeft size={14} />
            <Text fontSize="13px" fontWeight="600">Back</Text>
          </Flex>
          <Box w="1px" h="20px" bg="#E2E8F0" />
          <Heading fontSize="20px" fontWeight="600">Student Training Report</Heading>
        </Flex>
      </Flex>

      {/* Tab bar */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
        <Flex borderBottom="1px solid #E2E8F0" px="8px" overflowX="auto">
          <Tab label="Progress" icon={<FiCheckCircle size={13} />} active={activeTab === "progress"} onClick={() => setActiveTab("progress")} />
          <Tab label="Activity" icon={<FiActivity size={13} />} active={activeTab === "activity"} onClick={() => setActiveTab("activity")} />
          <Tab label="KPIs" icon={<FiBarChart2 size={13} />} active={activeTab === "kpis"} onClick={() => setActiveTab("kpis")} />
          <Tab label="Training Report" icon={<FiFileText size={13} />} active={activeTab === "report"} onClick={() => setActiveTab("report")} />
        </Flex>

        {activeTab === "progress" && <ProgressTab studentId={studentId} />}
        {activeTab === "activity" && <ActivityTab studentId={studentId} />}
        {activeTab === "kpis" && <KpisTab studentId={studentId} />}
        {activeTab === "report" && <TrainingReportTab studentId={studentId} />}
      </Box>
    </Box>
  );
};

export const StudentTrainingReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentTrainingReportPage {...props} />} />
);

export default StudentTrainingReportPageRoute;
