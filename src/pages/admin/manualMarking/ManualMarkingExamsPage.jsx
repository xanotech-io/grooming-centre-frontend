import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import { getManualMarkingExams } from "../../../services";

// ── Mock assessment data (real endpoint not yet available) ────────────────────
const MOCK_ASSESSMENTS = [
  {
    id: "mock-1",
    title: "Data Structures Assignment 2",
    course: "Introduction to Computer Science",
    module: "Module 3",
    markingMode: "manual",
    pendingCount: 12,
    totalSubmissions: 30,
  },
  {
    id: "mock-2",
    title: "Essay: Climate Change Impact",
    course: "Environmental Science",
    module: "Module 5",
    markingMode: "manual",
    pendingCount: 8,
    totalSubmissions: 25,
  },
  {
    id: "mock-3",
    title: "Case Study Analysis",
    course: "Business Management",
    module: "Module 2",
    markingMode: "manual",
    pendingCount: 20,
    totalSubmissions: 20,
  },
];

// ── Tab component ─────────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
  <Box
    as="button"
    px="20px"
    py="10px"
    fontSize="14px"
    fontWeight={active ? "600" : "400"}
    color={active ? "#6b006b" : "gray.500"}
    borderBottom={active ? "2px solid #6b006b" : "2px solid transparent"}
    bg="transparent"
    cursor="pointer"
    onClick={onClick}
    transition="all 0.15s"
    _hover={{ color: "#6b006b" }}
  >
    {label}
  </Box>
);

// ── Exams tab content ─────────────────────────────────────────────────────────
const ExamsTab = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { exams } = await getManualMarkingExams();
    return { exams };
  }, []);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const exams = resource.data?.exams ?? [];

  return (
    <>
      {resource.loading && (
        <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>
      )}
      {resource.err && (
        <Flex justifyContent="center" py="40px">
          <Text color="red.500">Failed to load exams. Please try again.</Text>
        </Flex>
      )}
      {!resource.loading && !resource.err && exams.length === 0 && (
        <Flex justifyContent="center" py="40px">
          <Text color="gray.400">No exams pending manual grading.</Text>
        </Flex>
      )}
      {!resource.loading && !resource.err && exams.length > 0 && (
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead bg="#F7FAFC">
              <Tr>
                {["Exam Title", "Marking Mode", "Total Marks", "Pending Students"].map((h) => (
                  <Th key={h} py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {exams.map((exam) => (
                <Tr
                  key={exam.id}
                  _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                  onClick={() => history.push(`/admin/manual-marking/${exam.id}/students`)}
                >
                  <Td py="14px" fontSize="14px" fontWeight="500" color="blue.600">
                    {exam.title}
                  </Td>
                  <Td py="14px">
                    <Badge bg="#EBF4FF" color="#3182CE" px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
                      {exam.markingMode}
                    </Badge>
                  </Td>
                  <Td py="14px" fontSize="14px">{exam.totalMarks ?? "—"}</Td>
                  <Td py="14px" fontSize="14px">
                    {exam.pendingCount != null ? (
                      <Badge bg="#FED7D7" color="#E53E3E" px="10px" py="4px" borderRadius="12px" fontWeight="500">
                        {exam.pendingCount} pending
                      </Badge>
                    ) : "—"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

// ── Assessments tab content (mock) ────────────────────────────────────────────
const AssessmentsTab = () => (
  <>
    {MOCK_ASSESSMENTS.length === 0 ? (
      <Flex justifyContent="center" py="40px">
        <Text color="gray.400">No assessments pending manual grading.</Text>
      </Flex>
    ) : (
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead bg="#F7FAFC">
            <Tr>
              {["Assessment Title", "Course", "Module", "Pending", "Total Submissions"].map((h) => (
                <Th key={h} py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {MOCK_ASSESSMENTS.map((a) => (
              <Tr key={a.id} _hover={{ bg: "#F7FAFC", cursor: "pointer" }}>
                <Td py="14px" fontSize="14px" fontWeight="500" color="blue.600">{a.title}</Td>
                <Td py="14px" fontSize="13px" color="gray.600">{a.course}</Td>
                <Td py="14px" fontSize="13px" color="gray.500">{a.module}</Td>
                <Td py="14px">
                  <Badge bg="#FED7D7" color="#E53E3E" px="10px" py="4px" borderRadius="12px" fontWeight="500">
                    {a.pendingCount} pending
                  </Badge>
                </Td>
                <Td py="14px" fontSize="14px">{a.totalSubmissions}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    )}
  </>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ManualMarkingExamsPage = () => {
  const [activeTab, setActiveTab] = useState("exams");

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Heading fontSize="22px" fontWeight="600">Manual Marking</Heading>
      </Flex>

      <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
        {/* Tabs */}
        <Flex borderBottom="1px solid #E2E8F0" px="8px">
          <Tab label="Exams" active={activeTab === "exams"} onClick={() => setActiveTab("exams")} />
          <Tab label="Assessments" active={activeTab === "assessments"} onClick={() => setActiveTab("assessments")} />
        </Flex>

        {/* Tab header */}
        <Flex px="20px" py="16px" borderBottom="1px solid #E2E8F0">
          <Text fontSize="16px" fontWeight="600" color="gray.700">
            {activeTab === "exams" ? "Exams Pending Manual Grading" : "Assessments Pending Manual Grading"}
          </Text>
        </Flex>

        {/* Tab content */}
        {activeTab === "exams" ? <ExamsTab /> : <AssessmentsTab />}
      </Box>
    </Box>
  );
};

export const ManualMarkingExamsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ManualMarkingExamsPage {...props} />} />
);

export default ManualMarkingExamsPageRoute;
