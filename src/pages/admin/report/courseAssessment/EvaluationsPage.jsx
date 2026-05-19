import { useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, SimpleGrid } from "@chakra-ui/layout";
import { BreadcrumbItem, Tag } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  Heading,
  Link,
  Spinner,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { supervisorGetMyEvaluations } from "../../../../services";
import dayjs from "dayjs";
import AssessmentTabBar from "./AssessmentTabBar";

const difficultyColorMap = {
  Easy: "green",
  Medium: "yellow",
  Hard: "red",
};

const effectivenessColorMap = {
  Effective: "green",
  Ineffective: "red",
  "Needs Improvement": "orange",
};

const EvaluationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluations, setEvaluations] = useState([]);

  const fetchEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supervisorGetMyEvaluations();
      setEvaluations(res?.data ?? []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Unable to fetch evaluations";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvaluations(); }, []);

  return (
    <AdminMainAreaWrapper>
      <Box my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/assessment/evaluations">Assessment Reports</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        rowGap={3}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={0}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">Assessment Reports</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Assessment performance data across courses, departments and the organisation.
          </Text>
        </Box>
        <Button secondary onClick={fetchEvaluations} isLoading={loading}>
          Refresh
        </Button>
      </Flex>

      <AssessmentTabBar />

      {/* Loading */}
      {loading && (
        <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">Loading evaluations...</Text>
        </Flex>
      )}

      {/* Error */}
      {!loading && error && (
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={6} textAlign="center">
          <Text color="red.600" mb={3}>{error}</Text>
          <Button onClick={fetchEvaluations}>Try Again</Button>
        </Box>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          <Flex justifyContent="space-between" alignItems="center" mb={5}>
            <Text fontSize="sm" color="gray.500" fontWeight="500">
              {evaluations.length} evaluation{evaluations.length !== 1 ? "s" : ""} submitted
            </Text>
          </Flex>

          {evaluations.length === 0 ? (
            <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={12} textAlign="center">
              <Text color="gray.400" fontSize="lg">No evaluations submitted yet.</Text>
              <Text as="p" fontSize="sm" color="gray.400" mt={1}>
                Go to the Department Report tab and click Evaluate on any assessment to get started.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {evaluations.map((ev, idx) => (
                <Box
                  key={ev.id ?? idx}
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p={5}
                  shadow="sm"
                >
                  {/* Tags */}
                  <Flex gap={2} mb={3} flexWrap="wrap">
                    <Tag
                      size="sm"
                      borderRadius="full"
                      colorScheme={difficultyColorMap[ev.difficultyLevel] ?? "gray"}
                    >
                      {ev.difficultyLevel ?? "—"} Difficulty
                    </Tag>
                    <Tag
                      size="sm"
                      borderRadius="full"
                      colorScheme={effectivenessColorMap[ev.effectivenessRating] ?? "gray"}
                    >
                      {ev.effectivenessRating ?? "—"}
                    </Tag>
                  </Flex>

                  {/* Stats grid */}
                  <SimpleGrid columns={2} spacing={3} mb={4}>
                    <Box bg="gray.50" borderRadius="md" p={3}>
                      <Text fontSize="xs" color="gray.500" mb={0.5}>Assessment ID</Text>
                      <Text fontSize="xs" fontWeight="600" color="#101828" noOfLines={1}>
                        {ev.assessmentId ?? "—"}
                      </Text>
                    </Box>
                    <Box bg="gray.50" borderRadius="md" p={3}>
                      <Text fontSize="xs" color="gray.500" mb={0.5}>Evaluated At</Text>
                      <Text fontSize="sm" fontWeight="600" color="#101828">
                        {ev.evaluatedAt ? dayjs(ev.evaluatedAt).format("DD MMM YYYY") : "—"}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Comments */}
                  {ev.comments ? (
                    <Box bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md" p={3}>
                      <Text fontSize="xs" fontWeight="700" color="blue.600" mb={1} textTransform="uppercase">
                        Comments
                      </Text>
                      <Text fontSize="sm" color="blue.800">{ev.comments}</Text>
                    </Box>
                  ) : (
                    <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={3}>
                      <Text fontSize="sm" color="gray.400" fontStyle="italic">No comments provided.</Text>
                    </Box>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </AdminMainAreaWrapper>
  );
};

export const EvaluationsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <EvaluationsPage {...props} />} />;
};

export default EvaluationsPage;
