import React, { useCallback, useEffect } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
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
  IconButton,
  Progress,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import { getManualMarkingStudents } from "../../../services";

const ManualMarkingStudentsPage = () => {
  const history = useHistory();
  const { examId } = useParams();
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { students } = await getManualMarkingStudents(examId);
    return { students };
  }, [examId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const students = resource.data?.students ?? [];

  const getGradingBadge = (graded, total) => {
    if (graded === total && total > 0)
      return <Badge bg="#E6F4EA" color="#38A169" px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Fully Graded</Badge>;
    if (graded > 0)
      return <Badge bg="#FFF5EA" color="#DD6B20" px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">In Progress</Badge>;
    return <Badge bg="#FED7D7" color="#E53E3E" px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">Pending</Badge>;
  };

  return (
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/manual-marking")}
        />
        <Heading fontSize="22px" fontWeight="600">Students Pending Grading</Heading>
      </Flex>

      <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
        <Flex px="20px" py="16px" borderBottom="1px solid #E2E8F0">
          <Text fontSize="16px" fontWeight="600" color="gray.700">
            Student Submissions ({students.length})
          </Text>
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>
        )}
        {resource.err && (
          <Flex justifyContent="center" py="40px">
            <Text color="red.500">Failed to load students. Please try again.</Text>
          </Flex>
        )}
        {!resource.loading && !resource.err && students.length === 0 && (
          <Flex justifyContent="center" py="40px">
            <Text color="gray.400">No students pending grading for this exam.</Text>
          </Flex>
        )}
        {!resource.loading && !resource.err && students.length > 0 && (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Student", "Email", "Attempt", "Submitted", "Grading Progress", "Status", "Action"].map((h) => (
                    <Th key={h} py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {students.map((s) => {
                  const pct = s.totalSubjective > 0
                    ? Math.round((s.gradedCount / s.totalSubjective) * 100)
                    : 0;
                  return (
                    <Tr key={s.submissionId} _hover={{ bg: "#F7FAFC" }}>
                      <Td py="14px" fontSize="14px" fontWeight="500">
                        {s.student.firstName} {s.student.lastName}
                      </Td>
                      <Td py="14px" fontSize="13px" color="gray.600">{s.student.email}</Td>
                      <Td py="14px" fontSize="13px">Attempt {s.attemptNumber}</Td>
                      <Td py="14px" fontSize="13px" color="gray.500">
                        {s.submissionTime ? new Date(s.submissionTime).toLocaleString() : "—"}
                      </Td>
                      <Td py="14px" minW="150px">
                        <Flex alignItems="center" gap="8px">
                          <Progress value={pct} size="sm" colorScheme="blue" borderRadius="4px" flex="1" />
                          <Text fontSize="12px" color="gray.500" whiteSpace="nowrap">
                            {s.gradedCount}/{s.totalSubjective}
                          </Text>
                        </Flex>
                      </Td>
                      <Td py="14px">{getGradingBadge(s.gradedCount, s.totalSubjective)}</Td>
                      <Td py="14px">
                        <Button
                          size="sm"
                          onClick={() => history.push(`/admin/manual-marking/${examId}/student/${s.student.id}`)}
                        >
                          {s.gradedCount > 0 ? "Continue" : "Grade"}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export const ManualMarkingStudentsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ManualMarkingStudentsPage {...props} />} />
);

export default ManualMarkingStudentsPageRoute;
