import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Input,
} from "@chakra-ui/react";
import { Heading, Text, Button } from "../../../../../components";
import { adminGetExamGradingSummary } from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";
import dayjs from "dayjs";

/* ─── helpers ─────────────────────────────────────── */
const statusColor = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "graded") return { bg: "#E6F4EA", color: "#38A169" };
  if (v === "pending") return { bg: "#FFF3CD", color: "#B7791F" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const passFailColor = (v) => {
  if (v === "Pass") return { bg: "#E6F4EA", color: "#38A169" };
  if (v === "Fail") return { bg: "#FED7D7", color: "#E53E3E" };
  return { bg: "#F7FAFC", color: "#718096" };
};

const StatCard = ({ label, value }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" px={5} py={4}>
    <Text
      fontSize="11px"
      color="gray.400"
      fontWeight="600"
      textTransform="uppercase"
      letterSpacing="wider"
      mb={1}
    >
      {label}
    </Text>
    <Text fontSize="22px" fontWeight="800" color="#1A202C" lineHeight="1">
      {value ?? "—"}
    </Text>
  </Box>
);

const EMPTY_FILTERS = {
  studentId: "",
  status: "",
  passFail: "",
  startDate: "",
  endDate: "",
};

/* ─── Main page ───────────────────────────────────── */
const ExamGradingSummaryPage = () => {
  const { courseId, moduleId, examinationId } = useParams();
  const { push } = useHistory();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = Object.fromEntries(
      Object.entries(appliedFilters).filter(([, v]) => v),
    );

    adminGetExamGradingSummary(examinationId, params)
      .then(({ overview: ov, rows: data }) => {
        if (cancelled) return;
        setOverview(ov);
        setRows(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load grading summary");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examinationId, appliedFilters]);

  const handleGrade = (studentId) => {
    push(
      `/admin/courses/${courseId}/module/${moduleId}/examinations/${examinationId}/grading/${studentId}`,
    );
  };

  return (
    <Box padding={6}>
      <Flex justifyContent="space-between" alignItems="flex-start" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading fontSize="heading.h4">Grading Summary</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Students who submitted this exam — click a row to grade
          </Text>
        </Box>
      </Flex>

      {overview && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
          <StatCard label="Total Submissions" value={overview.totalSubmissions ?? 0} />
          <StatCard label="Pending" value={overview.totalPending ?? 0} />
          <StatCard label="Graded" value={overview.totalGraded ?? 0} />
          <StatCard
            label="Avg Grading Time"
            value={
              overview.avgGradingDurationHours != null
                ? `${overview.avgGradingDurationHours}h`
                : "—"
            }
          />
        </Grid>
      )}

      <Flex
        gap={3}
        flexWrap="wrap"
        alignItems="flex-end"
        mb={5}
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="10px"
        p={4}
      >
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Student ID</Text>
          <Input
            size="sm"
            placeholder="Student ID"
            value={filters.studentId}
            onChange={(e) => setFilters((f) => ({ ...f, studentId: e.target.value }))}
            w="180px"
          />
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Status</Text>
          <Select
            size="sm"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            w="140px"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
          </Select>
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Pass/Fail</Text>
          <Select
            size="sm"
            value={filters.passFail}
            onChange={(e) => setFilters((f) => ({ ...f, passFail: e.target.value }))}
            w="140px"
          >
            <option value="">All</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </Select>
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>Start Date</Text>
          <Input
            size="sm"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            w="150px"
          />
        </Box>
        <Box>
          <Text fontSize="11px" color="gray.500" mb={1}>End Date</Text>
          <Input
            size="sm"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            w="150px"
          />
        </Box>
        <Button size="sm" onClick={() => setAppliedFilters(filters)}>
          Apply Filters
        </Button>
        <Button
          size="sm"
          secondary
          onClick={() => {
            setFilters(EMPTY_FILTERS);
            setAppliedFilters(EMPTY_FILTERS);
          }}
        >
          Reset
        </Button>
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={6} textAlign="center">
          <Text color="red.600">{capitalizeFirstLetter(error)}</Text>
        </Box>
      )}

      {!loading && !error && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" overflow="hidden">
          <TableContainer overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="#F7F9FC">
                <Tr>
                  <Th color="gray.500" fontSize="11px" py={3}>#</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Student</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Instructor</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Submitted</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Status</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Score</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Grade</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Pass/Fail</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Remarks</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Grading Duration</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Date Graded</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.length === 0 && (
                  <Tr>
                    <Td colSpan={12} textAlign="center" py={12}>
                      <Text color="gray.500" fontSize="15px">No submissions match these filters.</Text>
                    </Td>
                  </Tr>
                )}
                {rows.map((row, i) => {
                  const sc = statusColor(row.status);
                  const pfc = passFailColor(row.passFail);
                  return (
                    <Tr
                      key={row.studentId || i}
                      cursor="pointer"
                      _hover={{ bg: "#F9F0FF" }}
                      onClick={() => handleGrade(row.studentId)}
                    >
                      <Td color="gray.400" fontSize="13px">{i + 1}</Td>
                      <Td>
                        <Text fontSize="13px" fontWeight="600" color="#1A202C">
                          {row.studentName || "—"}
                        </Text>
                        <Text fontSize="11px" color="gray.400">
                          {row.studentEmail || "—"}
                        </Text>
                      </Td>
                      <Td fontSize="13px" color="gray.600">{row.instructorName || "—"}</Td>
                      <Td fontSize="13px" color="gray.600">
                        {row.submissionDate ? dayjs(row.submissionDate).format("DD/MM/YY h:mm a") : "—"}
                      </Td>
                      <Td>
                        <Badge bg={sc.bg} color={sc.color} px={2} py="2px" borderRadius="8px" fontSize="11px" fontWeight="600" textTransform="capitalize">
                          {row.status || "—"}
                        </Badge>
                      </Td>
                      <Td fontSize="13px" color="gray.600">{row.score ?? "—"}</Td>
                      <Td fontSize="13px" color="gray.600">{row.grade || "—"}</Td>
                      <Td>
                        {row.passFail ? (
                          <Badge bg={pfc.bg} color={pfc.color} px={2} py="2px" borderRadius="8px" fontSize="11px" fontWeight="600">
                            {row.passFail}
                          </Badge>
                        ) : "—"}
                      </Td>
                      <Td fontSize="13px" color="gray.600" maxW="180px" isTruncated>
                        {row.remarks || "—"}
                      </Td>
                      <Td fontSize="13px" color="gray.600">
                        {row.gradingDurationHours != null ? `${row.gradingDurationHours}h` : "—"}
                      </Td>
                      <Td fontSize="13px" color="gray.600">
                        {row.dateGraded ? dayjs(row.dateGraded).format("DD/MM/YY h:mm a") : "—"}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGrade(row.studentId);
                          }}
                        >
                          Grade
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export const ExamGradingSummaryPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamGradingSummaryPage {...props} />} />
);

export default ExamGradingSummaryPageRoute;
