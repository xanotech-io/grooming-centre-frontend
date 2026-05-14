import { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
} from "@chakra-ui/react";
import { Heading, Text, Button } from "../../../../../components";
import { getPendingManualGrades } from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";
import { FiUser, FiClock, FiAlertCircle } from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const urgencyColor = (count) => {
  if (count >= 5) return { bg: "#FED7D7", color: "#C53030" };
  if (count >= 3) return { bg: "#FEEBC8", color: "#C05621" };
  return { bg: "#EBF4FF", color: "#2B6CB0" };
};

const ManualGradingQueuePage = () => {
  const { id: courseId, assessmentId } = useParams();
  const { push } = useHistory();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getPendingManualGrades(assessmentId)
      .then(({ pending: data }) => { setPending(data); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load grading queue"); setLoading(false); });
  }, [assessmentId]);

  const handleGrade = (studentId) => {
    push(`/admin/courses/${courseId}/assessment/${assessmentId}/grading/${studentId}`);
  };

  return (
    <Box padding={6}>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="flex-start" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading fontSize="heading.h4">Grading Queue</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Students with questions awaiting manual grading
          </Text>
        </Box>
        {!loading && !error && (
          <Flex gap={3} alignItems="center">
            <Badge bg="#FFF3CD" color="#B7791F" px={3} py={1} borderRadius="full" fontSize="13px" fontWeight="600">
              {pending.length} pending
            </Badge>
            {pending.length > 0 && (
              <Button onClick={() => handleGrade(pending[0].studentId)}>
                Start Grading
              </Button>
            )}
          </Flex>
        )}
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={6} textAlign="center">
          <Flex justifyContent="center" alignItems="center" gap={2} mb={2}>
            <FiAlertCircle color="#C53030" />
            <Text color="red.600" fontWeight="600">{capitalizeFirstLetter(error)}</Text>
          </Flex>
          <Button secondary onClick={() => window.location.reload()} mt={2}>Retry</Button>
        </Box>
      )}

      {!loading && !error && pending.length === 0 && (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          minH="340px"
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="12px"
          gap={3}
        >
          <Box
            w="64px" h="64px"
            bg="#F0FFF4"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiAlertCircle color="#38A169" size={28} />
          </Box>
          <Heading fontSize="heading.h5" color="#1A202C">All caught up!</Heading>
          <Text color="gray.500" fontSize="sm">No submissions are pending manual grading.</Text>
          <Button
            secondary
            onClick={() => push(`/admin/courses/${courseId}/assessment/${assessmentId}/submissions`)}
            mt={2}
          >
            View All Submissions
          </Button>
        </Flex>
      )}

      {!loading && !error && pending.length > 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" overflow="hidden">
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7F9FC">
                <Tr>
                  <Th color="gray.500" fontSize="11px" py={3}>#</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Student</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Submitted</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Pending Questions</Th>
                  <Th color="gray.500" fontSize="11px" py={3}>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pending.map((row, i) => {
                  const fullName = [row.student?.firstName, row.student?.lastName]
                    .filter(Boolean).join(" ") || "—";
                  const uc = urgencyColor(row.pendingCount || 0);
                  const submittedAt = row.submittedAt
                    ? dayjs(row.submittedAt).fromNow()
                    : "—";

                  return (
                    <Tr key={row.studentId} _hover={{ bg: "#F9F0FF" }}>
                      <Td color="gray.400" fontSize="13px">{i + 1}</Td>
                      <Td>
                        <Flex alignItems="center" gap={3}>
                          <Box
                            w="32px" h="32px"
                            bg="#F0E6FF"
                            borderRadius="50%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <FiUser color="#6b006b" size={14} />
                          </Box>
                          <Box>
                            <Text fontSize="13px" fontWeight="600" color="#1A202C">{fullName}</Text>
                            <Text fontSize="11px" color="gray.400">{row.student?.email || "—"}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <Flex alignItems="center" gap={1} color="gray.500">
                          <FiClock size={12} />
                          <Text fontSize="12px">{submittedAt}</Text>
                        </Flex>
                      </Td>
                      <Td>
                        <Badge
                          bg={uc.bg}
                          color={uc.color}
                          px={2} py="2px"
                          borderRadius="8px"
                          fontSize="12px"
                          fontWeight="700"
                        >
                          {row.pendingCount ?? 0} question{(row.pendingCount ?? 0) !== 1 ? "s" : ""}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          onClick={() => handleGrade(row.studentId)}
                          size="sm"
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

const ManualGradingQueuePageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ManualGradingQueuePage {...props} />} />
);

export default ManualGradingQueuePageRoute;
