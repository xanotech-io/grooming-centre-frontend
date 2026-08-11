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
  Collapse,
} from "@chakra-ui/react";
import { FaArrowLeft, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { useFetch, useQueryParams } from "../../../hooks";
import {
  gradeBookV2GetMyGrades,
  gradeBookV2GetAnalytics,
} from "../../../services";

// ── Helpers ───────────────────────────────────────────────────────────────────

const gradeBadge = (grade) => {
  const colorMap = {
    A: { bg: "#E6F4EA", color: "#38A169" },
    B: { bg: "#EBF4FF", color: "#3182CE" },
    C: { bg: "#FFF5EA", color: "#DD6B20" },
    D: { bg: "#FED7D7", color: "#E53E3E" },
    F: { bg: "#FED7D7", color: "#E53E3E" },
  };
  const key = grade ? grade.charAt(0).toUpperCase() : null;
  const s = colorMap[key] || { bg: "#F7FAFC", color: "#718096" };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="12px"
      py="4px"
      borderRadius="12px"
      fontWeight="700"
      fontSize="15px"
      textTransform="none"
    >
      {grade || "—"}
    </Badge>
  );
};

const entryStatusBadge = (status) => {
  const map = {
    published: { bg: "#E6F4EA", color: "#38A169" },
    finalized: { bg: "#EBF4FF", color: "#3182CE" },
    draft: { bg: "#F7FAFC", color: "#718096" },
  };
  const s = map[String(status).toLowerCase()] || map.draft;
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="8px"
      py="3px"
      borderRadius="10px"
      textTransform="none"
      fontSize="11px"
      fontWeight="500"
    >
      {status}
    </Badge>
  );
};

// ── Category breakdown row (expandable) ──────────────────────────────────────

const CategoryRow = ({ cat, index }) => {
  const [open, setOpen] = useState(false);
  const pct = cat.averageScore ?? 0;
  const colors = [
    "#6b006b",
    "#3182CE",
    "#38A169",
    "#DD6B20",
    "#E53E3E",
    "#553C9A",
  ];
  const barColor = colors[index % colors.length];

  return (
    <Box mb="12px">
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="10px"
        overflow="hidden"
        cursor="pointer"
        onClick={() => setOpen((o) => !o)}
        _hover={{ borderColor: "#CBD5E0" }}
        transition="border-color 0.15s"
      >
        <Flex p="16px" justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap="10px">
            <Box color="gray.400" mt="1px">
              {open ? (
                <FaChevronDown size="12px" />
              ) : (
                <FaChevronRight size="12px" />
              )}
            </Box>
            <Box>
              <Text fontSize="15px" fontWeight="600" color="#1A202C">
                {cat.category}
              </Text>
              <Text fontSize="12px" color="gray.400" mt="1px">
                Weight: {cat.weight}%
              </Text>
            </Box>
          </Flex>

          <Flex alignItems="center" gap="20px">
            <Box textAlign="right" minW="120px">
              <Flex
                alignItems="center"
                gap="8px"
                justifyContent="flex-end"
                mb="4px"
              >
                <Text fontSize="13px" fontWeight="600" color={barColor}>
                  {pct.toFixed(1)}%
                </Text>
                <Text fontSize="12px" color="gray.400">
                  avg
                </Text>
              </Flex>
              <Progress
                value={pct}
                size="xs"
                borderRadius="4px"
                sx={{ "& > div": { background: barColor } }}
              />
            </Box>
            <Box textAlign="right" minW="80px">
              <Text fontSize="11px" color="gray.400" mb="1px">
                Contribution
              </Text>
              <Text fontSize="14px" fontWeight="700" color="#1A202C">
                {(cat.contribution ?? 0).toFixed(1)} pts
              </Text>
            </Box>
            <Box textAlign="center" minW="48px">
              {gradeBadge(cat.grade)}
            </Box>
          </Flex>
        </Flex>

        {/* Entries table */}
        <Collapse in={open} animateOpacity>
          <Box borderTop="1px solid #F0F4F8">
            {cat.entries?.length > 0 ? (
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      {[
                        "Assessment",
                        "Type",
                        "Score",
                        "Grade",
                        "Feedback",
                        "Status",
                      ].map((h) => (
                        <Th
                          key={h}
                          py="10px"
                          color="gray.500"
                          fontSize="11px"
                          fontWeight="600"
                          textTransform="none"
                        >
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cat.entries.map((e) => (
                      <Tr key={e.id} _hover={{ bg: "#FAFAFA" }}>
                        <Td py="10px" fontSize="13px" fontWeight="500">
                          {e.assessmentName}
                        </Td>
                        <Td
                          py="10px"
                          fontSize="12px"
                          color="gray.500"
                          textTransform="capitalize"
                        >
                          {e.assessmentType}
                        </Td>
                        <Td py="10px" fontSize="13px">
                          <Text fontWeight="600">
                            {e.score}/{e.maxScore}
                          </Text>
                          <Text fontSize="11px" color="gray.400">
                            {e.maxScore > 0
                              ? ((e.score / e.maxScore) * 100).toFixed(1)
                              : 0}
                            %
                          </Text>
                        </Td>
                        <Td py="10px">
                          <Badge
                            color={
                              e.grade === "A"
                                ? "#38A169"
                                : e.grade === "F"
                                  ? "#E53E3E"
                                  : "#3182CE"
                            }
                            bg="transparent"
                            fontWeight="700"
                            fontSize="13px"
                          >
                            {e.grade || "—"}
                          </Badge>
                        </Td>
                        <Td
                          py="10px"
                          fontSize="12px"
                          color="gray.600"
                          maxW="200px"
                        >
                          <Text noOfLines={2}>{e.feedback || "—"}</Text>
                        </Td>
                        <Td py="10px">{entryStatusBadge(e.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Flex justifyContent="center" py="20px">
                <Text fontSize="13px" color="gray.400">
                  No entries yet for this category.
                </Text>
              </Flex>
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const MyGradeBookPage = () => {
  const history = useHistory();
  const { gradebookId } = useParams();
  const courseId = useQueryParams().get("courseId");
  const { resource, handleFetchResource } = useFetch();
  const { resource: analyticsResource, handleFetchResource: fetchAnalytics } =
    useFetch();

  const fetcher = useCallback(async () => {
    const { breakdown } = await gradeBookV2GetMyGrades(gradebookId, courseId);
    return { breakdown };
  }, [gradebookId, courseId]);

  const analyticsFetcher = useCallback(async () => {
    const { analytics } = await gradeBookV2GetAnalytics(gradebookId, courseId);
    return { analytics };
  }, [gradebookId, courseId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
    fetchAnalytics({ fetcher: analyticsFetcher });
  }, [handleFetchResource, fetcher, fetchAnalytics, analyticsFetcher]);

  const data = resource.data?.breakdown;
  const analytics = analyticsResource.data?.analytics;
  const finalScore = data?.finalScore ?? 0;
  const finalGrade = data?.finalGrade;

  const gradeColorPrimary =
    finalGrade === "A"
      ? "#38A169"
      : finalGrade === "F"
        ? "#E53E3E"
        : finalGrade?.startsWith("B")
          ? "#3182CE"
          : "#6b006b";

  return (
    <Box
      paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
      paddingY="32px"
      minH="100vh"
      bg="#F7F9FC"
    >
      {/* Back button */}
      <Flex
        alignItems="center"
        gap="10px"
        mb="24px"
        cursor="pointer"
        width="max-content"
        onClick={() => history.goBack()}
        color="gray.600"
        _hover={{ color: "#6b006b" }}
        transition="color 0.15s"
      >
        <FaArrowLeft size="13px" />
        <Text fontSize="14px" fontWeight="500">
          Back
        </Text>
      </Flex>

      {/* Loading */}
      {resource.loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {/* Error */}
      {resource.err && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Text color="red.500">
            Failed to load your grade book. Please try again.
          </Text>
        </Flex>
      )}

      {/* Content */}
      {!resource.loading && !resource.err && data && (
        <>
          {/* Header */}
          <Box mb="24px">
            <Text fontSize="24px" fontWeight="700" color="#1A202C" mb="4px">
              {data.courseTitle || "Grade Book"}
            </Text>
            {data.studentName && (
              <Text fontSize="14px" color="gray.500">
                {data.studentName}
              </Text>
            )}
          </Box>

          {/* Score summary card */}
          <Box
            bg="white"
            border="1px solid #E2E8F0"
            borderRadius="12px"
            p="24px"
            mb="24px"
          >
            <Grid
              templateColumns={{ base: "1fr", md: "1fr auto" }}
              gap="24px"
              alignItems="center"
            >
              {/* Left: overall score */}
              <Box>
                <Text
                  fontSize="13px"
                  color="gray.500"
                  mb="8px"
                  fontWeight="500"
                >
                  Overall Score
                </Text>
                <Flex alignItems="flex-end" gap="12px" mb="12px">
                  <Text
                    fontSize="48px"
                    fontWeight="800"
                    color={gradeColorPrimary}
                    lineHeight="1"
                  >
                    {finalScore.toFixed(1)}
                  </Text>
                  <Text fontSize="20px" color="gray.400" mb="8px">
                    / 100
                  </Text>
                </Flex>
                <Box>
                  <Flex justifyContent="space-between" mb="6px">
                    <Text fontSize="12px" color="gray.500">
                      Progress
                    </Text>
                    <Text
                      fontSize="12px"
                      fontWeight="600"
                      color={gradeColorPrimary}
                    >
                      {finalScore.toFixed(1)}%
                    </Text>
                  </Flex>
                  <Progress
                    value={finalScore}
                    size="sm"
                    borderRadius="6px"
                    sx={{ "& > div": { background: gradeColorPrimary } }}
                  />
                </Box>
              </Box>

              {/* Right: final grade + meta */}
              <Flex
                gap="20px"
                flexWrap="wrap"
                justifyContent={{ base: "flex-start", md: "flex-end" }}
              >
                <Box
                  bg="#F7F9FC"
                  border="1px solid #E2E8F0"
                  borderRadius="12px"
                  p="20px"
                  textAlign="center"
                  minW="100px"
                >
                  <Text
                    fontSize="11px"
                    color="gray.400"
                    mb="6px"
                    fontWeight="500"
                  >
                    Final Grade
                  </Text>
                  <Text
                    fontSize="40px"
                    fontWeight="800"
                    color={gradeColorPrimary}
                    lineHeight="1"
                  >
                    {finalGrade || "—"}
                  </Text>
                </Box>

                <Flex flexDirection="column" gap="12px" justifyContent="center">
                  <Box>
                    <Text fontSize="11px" color="gray.400" fontWeight="500">
                      Calculation
                    </Text>
                    <Text
                      fontSize="14px"
                      fontWeight="600"
                      color="#1A202C"
                      textTransform="capitalize"
                    >
                      {(data.calculationMethod || "—").replace("_", " ")}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="11px" color="gray.400" fontWeight="500">
                      Status
                    </Text>
                    <Badge
                      bg={
                        data.status === "published"
                          ? "#E6F4EA"
                          : data.status === "finalized"
                            ? "#EBF4FF"
                            : "#F7FAFC"
                      }
                      color={
                        data.status === "published"
                          ? "#38A169"
                          : data.status === "finalized"
                            ? "#3182CE"
                            : "#718096"
                      }
                      px="10px"
                      py="4px"
                      borderRadius="10px"
                      textTransform="none"
                      fontWeight="500"
                    >
                      {data.status || "draft"}
                    </Badge>
                  </Box>
                </Flex>
              </Flex>
            </Grid>

            {/* Category weight overview bar */}
            {data.breakdown?.length > 0 && (
              <>
                <Divider my="20px" />
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  color="gray.500"
                  mb="10px"
                >
                  Category Weights
                </Text>
                <Flex
                  gap="2px"
                  borderRadius="6px"
                  overflow="hidden"
                  h="10px"
                  mb="10px"
                >
                  {data.breakdown.map((cat, i) => {
                    const colors = [
                      "#6b006b",
                      "#3182CE",
                      "#38A169",
                      "#DD6B20",
                      "#E53E3E",
                      "#553C9A",
                    ];
                    return (
                      <Box
                        key={cat.category}
                        flex={cat.weight}
                        bg={colors[i % colors.length]}
                        title={`${cat.category}: ${cat.weight}%`}
                      />
                    );
                  })}
                </Flex>
                <Flex gap="16px" flexWrap="wrap">
                  {data.breakdown.map((cat, i) => {
                    const colors = [
                      "#6b006b",
                      "#3182CE",
                      "#38A169",
                      "#DD6B20",
                      "#E53E3E",
                      "#553C9A",
                    ];
                    return (
                      <Flex key={cat.category} alignItems="center" gap="6px">
                        <Box
                          w="10px"
                          h="10px"
                          borderRadius="2px"
                          bg={colors[i % colors.length]}
                          flexShrink={0}
                        />
                        <Text fontSize="12px" color="gray.600">
                          {cat.category} ({cat.weight}%)
                        </Text>
                      </Flex>
                    );
                  })}
                </Flex>
              </>
            )}
          </Box>

          {/* Class KPIs */}
          {analytics && (
            <Box mb="24px">
              <Text fontSize="16px" fontWeight="700" color="#1A202C" mb="14px">
                Class Statistics
              </Text>
              <Grid
                templateColumns={{
                  base: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                }}
                gap="12px"
                mb="16px"
              >
                {[
                  {
                    label: "Class Average",
                    value: `${(analytics.classAverage ?? 0).toFixed(1)}%`,
                    color: "#6b006b",
                    bg: "#F0E6FF",
                  },
                  {
                    label: "Highest Score",
                    value: `${analytics.highestScore ?? "—"}%`,
                    color: "#38A169",
                    bg: "#E6F4EA",
                  },
                  {
                    label: "Lowest Score",
                    value: `${analytics.lowestScore ?? "—"}%`,
                    color: "#E53E3E",
                    bg: "#FED7D7",
                  },
                  {
                    label: "Pass Rate",
                    value: `${(analytics.passRate ?? 0).toFixed(1)}%`,
                    color: "#DD6B20",
                    bg: "#FFF5EA",
                  },
                ].map((kpi) => (
                  <Box
                    key={kpi.label}
                    bg={kpi.bg}
                    borderRadius="10px"
                    p="16px"
                    textAlign="center"
                  >
                    <Text fontSize="20px" fontWeight="700" color={kpi.color}>
                      {kpi.value}
                    </Text>
                    <Text fontSize="12px" color="gray.500" mt="4px">
                      {kpi.label}
                    </Text>
                  </Box>
                ))}
              </Grid>

              {/* Grade distribution bar */}
              {analytics.gradeDistribution &&
                Object.keys(analytics.gradeDistribution).length > 0 && (
                  <Box
                    bg="white"
                    border="1px solid #E2E8F0"
                    borderRadius="10px"
                    p="16px"
                  >
                    <Text
                      fontSize="13px"
                      fontWeight="600"
                      color="gray.600"
                      mb="12px"
                    >
                      Grade Distribution
                    </Text>
                    {(() => {
                      const gradeColors = {
                        A: "#38A169",
                        B: "#3182CE",
                        C: "#718096",
                        D: "#DD6B20",
                        F: "#E53E3E",
                      };
                      const maxVal = Math.max(
                        ...Object.values(analytics.gradeDistribution),
                        1,
                      );
                      return Object.entries(analytics.gradeDistribution).map(
                        ([grade, count]) => (
                          <Flex
                            key={grade}
                            alignItems="center"
                            gap="10px"
                            mb="8px"
                          >
                            <Text
                              fontSize="13px"
                              fontWeight="700"
                              w="20px"
                              color={gradeColors[grade] || "#718096"}
                            >
                              {grade}
                            </Text>
                            <Box
                              flex="1"
                              bg="#F7FAFC"
                              borderRadius="4px"
                              overflow="hidden"
                              h="16px"
                            >
                              <Box
                                h="100%"
                                w={`${(count / maxVal) * 100}%`}
                                bg={gradeColors[grade] || "#718096"}
                                borderRadius="4px"
                                transition="width 0.3s"
                              />
                            </Box>
                            <Text
                              fontSize="12px"
                              fontWeight="600"
                              w="20px"
                              textAlign="right"
                              color="gray.600"
                            >
                              {count}
                            </Text>
                          </Flex>
                        ),
                      );
                    })()}
                  </Box>
                )}
            </Box>
          )}

          {/* Category breakdowns */}
          <Box mb="8px">
            <Text fontSize="16px" fontWeight="700" color="#1A202C" mb="14px">
              Grade Breakdown by Category
            </Text>
            {data.breakdown?.length > 0 ? (
              data.breakdown.map((cat, i) => (
                <CategoryRow key={cat.category} cat={cat} index={i} />
              ))
            ) : (
              <Box
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="10px"
                p="32px"
                textAlign="center"
              >
                <Text color="gray.400">No grade entries available yet.</Text>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export const MyGradeBookPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MyGradeBookPage {...props} />} />
);

export default MyGradeBookPageRoute;
