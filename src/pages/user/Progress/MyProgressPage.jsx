import React, { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  Badge,
  Spinner,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import {
  FiRefreshCw,
  FiActivity,
  FiBarChart2,
  FiBookOpen,
} from "react-icons/fi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Button } from "../../../components";
import {
  getMyProgress,
  getMyKpis,
  getMyActivity,
} from "../../../services";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const statusColor = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "completed") return { bg: "#E6F4EA", color: "#38A169" };
  if (v === "in progress") return { bg: "#EBF4FF", color: "#3182CE" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const StatusBadge = ({ status }) => {
  const c = statusColor(status);
  return (
    <Badge bg={c.bg} color={c.color} px="8px" py="3px" borderRadius="10px" textTransform="none" fontSize="11px" fontWeight="500">
      {status || "Not Started"}
    </Badge>
  );
};

const KpiCard = ({ label, value, color, bg }) => (
  <Box bg={bg} borderRadius="10px" p="16px" textAlign="center">
    <Text fontSize="22px" fontWeight="800" color={color}>{value ?? "—"}</Text>
    <Text fontSize="12px" color="gray.500" mt="4px">{label}</Text>
  </Box>
);

// ── Progress Tab ──────────────────────────────────────────────────────────────

const CourseRow = ({ course }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tr
        _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <Td py="14px">
          <Flex alignItems="center" gap="8px">
            <Box color="gray.400">
              {open ? <FaChevronDown size="11px" /> : <FaChevronRight size="11px" />}
            </Box>
            <Text fontSize="13px" fontWeight="600">{course.courseTitle}</Text>
          </Flex>
        </Td>
        <Td py="14px">
          <Text fontSize="13px" color="gray.600">{course.modulesCompleted ?? "—"}</Text>
        </Td>
        <Td py="14px" minW="140px">
          <Flex justifyContent="space-between" mb="4px">
            <Text fontSize="12px" color="gray.500">Progress</Text>
            <Text fontSize="12px" fontWeight="700" color="#6b006b">
              {course.completionPercentage != null ? `${course.completionPercentage}%` : "—"}
            </Text>
          </Flex>
          <Progress value={course.completionPercentage ?? 0} size="xs" borderRadius="4px" colorScheme="purple" />
        </Td>
        <Td py="14px">
          <Text fontSize="13px" fontWeight="700" color="#6b006b">
            {course.latestScore != null ? `${course.latestScore}%` : "—"}
          </Text>
        </Td>
        <Td py="14px">
          <Badge
            bg={course.certificateEarned === "Yes" ? "#E6F4EA" : "#F7FAFC"}
            color={course.certificateEarned === "Yes" ? "#38A169" : "#718096"}
            px="8px" py="3px" borderRadius="10px" fontSize="11px" textTransform="none"
          >
            {course.certificateEarned === "Yes" ? "✓ Earned" : "Not Yet"}
          </Badge>
        </Td>
        <Td py="14px"><StatusBadge status={course.completionStatus} /></Td>
      </Tr>
      {open && (
        <Tr>
          <Td colSpan={6} py="0" px="0" borderBottom="1px solid #E2E8F0">
            <Box bg="#FAFAFA" px="40px" py="16px">
              <Text fontSize="12px" fontWeight="600" color="gray.500" mb="12px">Score Breakdown</Text>
              <Grid templateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap="12px">
                {[
                  { label: "Assessment Score", value: course.assessmentScore },
                  { label: "Course Exam Score", value: course.courseExamScore },
                  { label: "Standalone Exam", value: course.standaloneExamScore },
                  { label: "Average Score", value: course.averageScore },
                ].map((s) => (
                  <Box key={s.label} bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="12px">
                    <Text fontSize="11px" color="gray.500">{s.label}</Text>
                    <Text fontSize="18px" fontWeight="700" color="#6b006b" mt="2px">
                      {s.value != null ? `${s.value}%` : "—"}
                    </Text>
                  </Box>
                ))}
              </Grid>
              {course.lastAccessDate && (
                <Text fontSize="11px" color="gray.400" mt="12px">
                  Last accessed: {new Date(course.lastAccessDate).toLocaleDateString()}
                </Text>
              )}
            </Box>
          </Td>
        </Tr>
      )}
    </>
  );
};

const ProgressTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    try { setData(await getMyProgress()); }
    catch { setErr(true); }
    finally { setLoading(false); }
  }, []);

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
      {courses.length === 0 ? (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="48px" textAlign="center">
          <Box w="56px" h="56px" bg="#F0E6FF" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" mx="auto" mb="16px">
            <FiBookOpen color="#6b006b" size="22px" />
          </Box>
          <Text fontSize="16px" fontWeight="600" mb="8px">No courses yet</Text>
          <Text fontSize="13px" color="gray.500">Enroll in a course to start tracking your progress.</Text>
        </Box>
      ) : (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Course", "Modules", "Progress", "Latest Score", "Certificate", "Status"].map((h) => (
                    <Th key={h} py="12px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {courses.map((c, i) => (
                  <CourseRow key={c.courseId || i} course={c} />
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

const ActivityTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    try { setData(await getMyActivity()); }
    catch { setErr(true); }
    finally { setLoading(false); }
  }, []);

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
          { label: "Hours Spent", value: data.totalTimeSpentHours != null ? `${data.totalTimeSpentHours}h` : "—", color: "#DD6B20", bg: "#FFF5EA" },
          { label: "Total Sessions", value: data.totalSessionCount ?? "—", color: "#553C9A", bg: "#E9D8FD" },
        ].map((k) => <KpiCard key={k.label} {...k} />)}
      </Grid>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
        <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">Your Engagement</Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px">
          <Box>
            <Text fontSize="12px" color="gray.500" mb="8px">This Week's Activity</Text>
            <Flex alignItems="center" gap="10px" mb="8px">
              <Text fontSize="32px" fontWeight="800" color="#6b006b">{data.weeklyLogins ?? 0}</Text>
              <Text fontSize="13px" color="gray.500">login sessions</Text>
            </Flex>
            <Progress value={Math.min((data.weeklyLogins ?? 0) * 14, 100)} size="sm" colorScheme="purple" borderRadius="4px" />
            <Text fontSize="11px" color="gray.400" mt="6px">Daily average: {((data.weeklyLogins ?? 0) / 7).toFixed(1)} sessions</Text>
          </Box>
          <Box>
            <Text fontSize="12px" color="gray.500" mb="8px">Total Time Invested</Text>
            <Flex alignItems="baseline" gap="8px">
              <Text fontSize="32px" fontWeight="800" color="#3182CE">{data.totalTimeSpentHours ?? 0}</Text>
              <Text fontSize="18px" color="gray.400">hours</Text>
            </Flex>
            <Text fontSize="12px" color="gray.500" mt="6px">Across {data.totalSessionCount ?? 0} learning sessions</Text>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

// ── KPIs Tab ──────────────────────────────────────────────────────────────────

const KpisTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    try { setData(await getMyKpis()); }
    catch { setErr(true); }
    finally { setLoading(false); }
  }, []);

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
        <KpiCard label="Enrolled Courses" value={data.totalCourses} color="#3182CE" bg="#EBF4FF" />
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

      {/* Overall completion bar */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px" mb="20px">
        <Flex justifyContent="space-between" alignItems="center" mb="10px">
          <Text fontSize="14px" fontWeight="600" color="gray.700">Overall Progress</Text>
          <Text fontSize="14px" fontWeight="700" color="#6b006b">
            {data.completionPercentage != null ? `${data.completionPercentage}%` : "—"}
          </Text>
        </Flex>
        <Progress value={data.completionPercentage ?? 0} size="md" colorScheme="purple" borderRadius="6px" />
        <Text fontSize="12px" color="gray.500" mt="8px">
          {data.completedCourses ?? 0} of {data.totalCourses ?? 0} courses completed
        </Text>
      </Box>

      {/* Per-course breakdown */}
      {courses.length > 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
          <Box px="20px" py="14px" borderBottom="1px solid #E2E8F0">
            <Text fontSize="13px" fontWeight="600" color="gray.700">Course Breakdown</Text>
          </Box>
          <Box p="16px">
            {courses.map((c, i) => {
              const sc = statusColor(c.completionStatus);
              return (
                <Box key={c.courseId || i} mb="16px" pb="16px" borderBottom={i < courses.length - 1 ? "1px solid #F0F4F8" : "none"}>
                  <Flex justifyContent="space-between" alignItems="flex-start" mb="8px">
                    <Box>
                      <Text fontSize="14px" fontWeight="600" color="#1A202C">{c.courseTitle}</Text>
                      <Badge bg={sc.bg} color={sc.color} px="8px" py="2px" borderRadius="8px" fontSize="11px" textTransform="none" mt="4px">
                        {c.completionStatus || "Not Started"}
                      </Badge>
                    </Box>
                    <Text fontSize="13px" fontWeight="700" color="#6b006b">
                      {c.averageScore != null ? `${c.averageScore}%` : "—"}
                    </Text>
                  </Flex>
                  <Progress value={c.completionPercentage ?? 0} size="sm" borderRadius="4px" colorScheme="purple" />
                  <Text fontSize="11px" color="gray.400" mt="4px">{c.completionPercentage ?? 0}% complete</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const MyProgressPage = () => {
  const [activeTab, setActiveTab] = useState("progress");

  return (
    <Box
      paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
      paddingY="32px"
      minH="100vh"
      bg="#F7F9FC"
    >
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="28px" flexWrap="wrap" gap="12px">
        <Box>
          <Text fontSize="24px" fontWeight="700" color="#1A202C">My Progress</Text>
          <Text fontSize="14px" color="gray.500" mt="4px">Track your learning journey, activity, and performance</Text>
        </Box>
      </Flex>

      <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" overflow="hidden">
        {/* Tabs */}
        <Flex borderBottom="1px solid #E2E8F0" px="8px" overflowX="auto">
          <Tab label="Progress" icon={<FiBookOpen size={13} />} active={activeTab === "progress"} onClick={() => setActiveTab("progress")} />
          <Tab label="Activity" icon={<FiActivity size={13} />} active={activeTab === "activity"} onClick={() => setActiveTab("activity")} />
          <Tab label="KPIs" icon={<FiBarChart2 size={13} />} active={activeTab === "kpis"} onClick={() => setActiveTab("kpis")} />
        </Flex>

        {activeTab === "progress" && <ProgressTab />}
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "kpis" && <KpisTab />}
      </Box>
    </Box>
  );
};

export const MyProgressPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MyProgressPage {...props} />} />
);

export default MyProgressPageRoute;
