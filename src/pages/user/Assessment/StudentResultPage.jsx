import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
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
import { Heading, Text, Button } from "../../../components";
import { getStudentOwnResult } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { FiCheck, FiX, FiClock, FiAward } from "react-icons/fi";
import dayjs from "dayjs";

/* ─── helpers ─────────────────────────────────────── */
const gradeColors = {
  A: { color: "#38A169", bg: "#E6F4EA", ring: "#38A169" },
  B: { color: "#3182CE", bg: "#EBF4FF", ring: "#3182CE" },
  C: { color: "#DD6B20", bg: "#FFF5EA", ring: "#DD6B20" },
  D: { color: "#E53E3E", bg: "#FED7D7", ring: "#E53E3E" },
  F: { color: "#E53E3E", bg: "#FED7D7", ring: "#E53E3E" },
};

const getGradeStyle = (grade) => {
  if (!grade) return { color: "#718096", bg: "#F7FAFC", ring: "#CBD5E0" };
  return gradeColors[grade.charAt(0).toUpperCase()] || { color: "#718096", bg: "#F7FAFC", ring: "#CBD5E0" };
};

const formatDuration = (secs) => {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const StatCard = ({ icon: Icon, label, value, iconColor }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" px={4} py={4}>
    <Flex alignItems="center" gap={3} mb={2}>
      <Box
        w="32px" h="32px"
        bg={`${iconColor}15`}
        borderRadius="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon color={iconColor} size={15} />
      </Box>
      <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
    </Flex>
    <Text fontSize="20px" fontWeight="800" color="#1A202C">{value ?? "—"}</Text>
  </Box>
);

/* ─── Score ring component ────────────────────────── */
const ScoreRing = ({ score, grade }) => {
  const gs = getGradeStyle(grade);
  const pct = Math.min(Math.max(parseFloat(score) || 0, 0), 100);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Flex direction="column" alignItems="center" justifyContent="center">
      <Box position="relative" w="140px" h="140px">
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={gs.ring}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <Flex
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="26px" fontWeight="900" color={gs.ring} lineHeight="1">
            {pct.toFixed(0)}%
          </Text>
          {grade && (
            <Box
              bg={gs.bg}
              color={gs.color}
              px={2}
              py="2px"
              borderRadius="4px"
              fontSize="13px"
              fontWeight="800"
              mt={1}
            >
              {grade}
            </Box>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

/* ─── Page ────────────────────────────────────────── */
const StudentResultPage = () => {
  const { courseId, assessmentId } = useParams();
  const { push } = useHistory();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudentOwnResult(assessmentId)
      .then(({ result: data }) => { setResult(data); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load result"); setLoading(false); });
  }, [assessmentId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );
  }

  if (error || !result) {
    return (
      <Flex direction="column" alignItems="center" justifyContent="center" minH="60vh" gap={4}>
        <Text color="red.500" fontSize="15px">{capitalizeFirstLetter(error || "Result not found.")}</Text>
        <Button secondary onClick={() => push(`/courses/details/${courseId}`)}>
          Back to Course
        </Button>
      </Flex>
    );
  }

  const gs = getGradeStyle(result.grade);
  const totalScore = parseFloat(result.totalScore ?? 0);
  const autoScore = parseFloat(result.autoScore ?? 0);
  const manualScore = parseFloat(result.manualScore ?? 0);
  const isPassed = totalScore >= 50;

  return (
    <Box
      minH="100vh"
      bg="#F7F9FC"
      pt={{ base: 6, md: 10 }}
      pb={16}
      px={{ base: 4, md: 8 }}
    >
      <Box maxW="820px" mx="auto">
        {/* Back link */}
        <Box
          as="button"
          onClick={() => push(`/courses/details/${courseId}`)}
          color="#6b006b"
          fontSize="sm"
          fontWeight="600"
          mb={6}
          _hover={{ textDecoration: "underline" }}
        >
          ← Back to course
        </Box>

        {/* Hero card */}
        <Box
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="16px"
          p={{ base: 5, md: 8 }}
          mb={5}
        >
          <Flex
            justifyContent="space-between"
            alignItems={{ base: "flex-start", md: "center" }}
            flexWrap="wrap"
            gap={6}
          >
            <Box>
              <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                Assessment Result
              </Text>
              <Heading fontSize="heading.h4" color="#1A202C" mb={2}>
                {result.assessment?.title || "Assessment"}
              </Heading>
              <Flex gap={2} flexWrap="wrap" mt={2}>
                <Badge
                  bg={isPassed ? "#E6F4EA" : "#FED7D7"}
                  color={isPassed ? "#38A169" : "#C53030"}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="12px"
                  fontWeight="700"
                >
                  {isPassed ? "Passed" : "Failed"}
                </Badge>
                <Badge
                  bg="#F7F9FC"
                  color="#718096"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="12px"
                  fontWeight="600"
                  textTransform="capitalize"
                >
                  {(result.status || "—").replace(/_/g, " ")}
                </Badge>
              </Flex>
            </Box>

            <ScoreRing score={totalScore} grade={result.grade} />
          </Flex>

          {/* Score breakdown bar */}
          <Box mt={6} pt={5} borderTop="1px solid #E2E8F0">
            <Flex justifyContent="space-between" mb={2}>
              <Text fontSize="12px" color="gray.500" fontWeight="500">Total Score</Text>
              <Text fontSize="12px" fontWeight="700" color={gs.color}>{totalScore.toFixed(2)}%</Text>
            </Flex>
            <Progress
              value={totalScore}
              size="sm"
              borderRadius="4px"
              mb={4}
              sx={{ "& > div": { background: gs.ring } }}
            />
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              <Box textAlign="center" bg="#EBF4FF" borderRadius="8px" py={3} px={2}>
                <Text fontSize="18px" fontWeight="800" color="#3182CE">{autoScore.toFixed(2)}</Text>
                <Text fontSize="11px" color="gray.500" mt={1}>Auto Score</Text>
              </Box>
              <Box textAlign="center" bg="#F0E6FF" borderRadius="8px" py={3} px={2}>
                <Text fontSize="18px" fontWeight="800" color="#6b006b">{manualScore.toFixed(2)}</Text>
                <Text fontSize="11px" color="gray.500" mt={1}>Manual Score</Text>
              </Box>
            </Grid>
          </Box>
        </Box>

        {/* Stat cards */}
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
          <StatCard
            icon={FiCheck}
            label="Correct"
            value={result.correctAnswers ?? 0}
            iconColor="#38A169"
          />
          <StatCard
            icon={FiX}
            label="Wrong"
            value={result.wrongAnswers ?? 0}
            iconColor="#E53E3E"
          />
          <StatCard
            icon={FiClock}
            label="Time Taken"
            value={formatDuration(result.timeTaken)}
            iconColor="#3182CE"
          />
          <StatCard
            icon={FiAward}
            label="Grade"
            value={result.grade || "—"}
            iconColor={gs.color}
          />
        </Grid>

        {/* Assessment details */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p={5} mb={5}>
          <Text
            fontSize="10px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={4}
          >
            Assessment Details
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
            <Box>
              <Text fontSize="11px" color="gray.400" mb={1}>Assessment</Text>
              <Text fontSize="14px" fontWeight="600" color="#1A202C">
                {result.assessment?.title || "—"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="11px" color="gray.400" mb={1}>Submitted</Text>
              <Text fontSize="14px" fontWeight="600" color="#1A202C">
                {result.submissionTime
                  ? dayjs(result.submissionTime).format("DD MMM YYYY, h:mm a")
                  : "—"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="11px" color="gray.400" mb={1}>Grading Mode</Text>
              <Badge
                colorScheme={
                  result.assessment?.markingMode === "manual"
                    ? "purple"
                    : result.assessment?.markingMode === "hybrid"
                    ? "orange"
                    : "blue"
                }
                textTransform="capitalize"
                fontSize="11px"
              >
                {result.assessment?.markingMode || "—"}
              </Badge>
            </Box>
          </Grid>
        </Box>

        {/* Remark */}
        {result.remark && (
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p={5} mb={5}>
            <Text
              fontSize="10px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={2}
            >
              Instructor Feedback
            </Text>
            <Text fontSize="14px" color="#1A202C" lineHeight="1.7">{result.remark}</Text>
          </Box>
        )}

        {/* Actions */}
        <Flex gap={3} justifyContent="center" flexWrap="wrap">
          <Button secondary onClick={() => push(`/courses/details/${courseId}`)}>
            Back to Course
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export const StudentResultPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <StudentResultPage {...props} />} />
);

export default StudentResultPageRoute;
