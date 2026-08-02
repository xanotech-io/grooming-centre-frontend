import { useEffect, useState } from "react";
import { Box, SimpleGrid } from "@chakra-ui/layout";
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Tag,
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Text } from "../../../../components";
import {
  pm2GetSummary,
  pm2GetCourseSummary,
  pm2GetAtRiskStudents,
  pm2GetScoringGuide,
} from "../../../../services";

const SummaryCard = ({ label, value, helpText, color }) => (
  <Box p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
    <Stat>
      <StatLabel fontSize="xs" color="gray.500">{label}</StatLabel>
      <StatNumber fontSize="2xl" color={color ?? "#101828"}>{value ?? "—"}</StatNumber>
      {helpText && <StatHelpText fontSize="xs" mb={0}>{helpText}</StatHelpText>}
    </Stat>
  </Box>
);

const engagementColor = { Active: "green", Irregular: "yellow", Inactive: "red" };

const AdminSummaryTab = () => {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [atRisk, setAtRisk] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, courseRes, atRiskRes, guideRes] = await Promise.all([
          pm2GetSummary(),
          pm2GetCourseSummary(),
          pm2GetAtRiskStudents({ limit: 10 }),
          pm2GetScoringGuide(),
        ]);
        setSummary(summaryRes?.summary ?? null);
        setCourses(courseRes?.courses ?? []);
        setAtRisk(atRiskRes?.result ?? null);
        setGuide(guideRes?.guide ?? null);
      } catch (err) {
        toast({ status: "error", description: err.message || "Failed to load summary", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const kpis = summary?.kpis ?? {};
  const trend = summary?.participation_trend ?? [];
  const activity = summary?.activity_distribution ?? {};
  const deptBreakdown = summary?.dept_breakdown ?? [];

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <Box>
      {/* KPI Grid */}
      <Text fontWeight="700" fontSize="md" mb={4} color="#101828">Platform Overview</Text>
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><Spinner color="#660066" /></Box>
      ) : (
        <>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
            <SummaryCard label="Total Students" value={kpis.total_students} color="#660066" />
            <SummaryCard
              label="Avg. Participation"
              value={kpis.average_participation_rate != null ? `${kpis.average_participation_rate}%` : null}
              color="#2C5282"
            />
            <SummaryCard
              label="Active"
              value={kpis.active_students}
              helpText={`${kpis.active_percentage ?? 0}%`}
              color="#1A8F3A"
            />
            <SummaryCard
              label="Irregular"
              value={kpis.irregular_students}
              helpText={`${kpis.irregular_percentage ?? 0}%`}
              color="#B7791F"
            />
            <SummaryCard
              label="Inactive"
              value={kpis.inactive_students}
              helpText={`${kpis.inactive_percentage ?? 0}%`}
              color="#C53030"
            />
            <SummaryCard
              label="Alerts Triggered"
              value={kpis.alerts_triggered}
              helpText={`${kpis.alerts_triggered_percentage ?? 0}%`}
              color="#C53030"
            />
          </SimpleGrid>

          {/* Engagement Distribution Bars */}
          <Box mb={6}>
            <Text fontWeight="600" fontSize="sm" mb={3} color="#344054">Engagement Distribution</Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {[
                { status: "Active", pct: kpis.active_percentage ?? 0, color: "#1A8F3A" },
                { status: "Irregular", pct: kpis.irregular_percentage ?? 0, color: "#B7791F" },
                { status: "Inactive", pct: kpis.inactive_percentage ?? 0, color: "#C53030" },
              ].map(({ status, pct, color }) => (
                <Box key={status} p={4} borderRadius="lg" border="1px solid" borderColor="gray.100" bg="white">
                  <Text fontSize="xs" color="gray.500" mb={1}>{status}</Text>
                  <Box h="8px" borderRadius="full" bg="gray.100" overflow="hidden">
                    <Box h="100%" w={`${pct}%`} bg={color} borderRadius="full" transition="width 0.6s ease" />
                  </Box>
                  <Text fontSize="sm" fontWeight="700" mt={1} color={color}>{pct}%</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Divider mb={6} />

          {/* Activity Distribution */}
          {activity.total_interactions != null && (
            <Box mb={6}>
              <Text fontWeight="600" fontSize="sm" mb={3} color="#344054">Activity Distribution</Text>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {[
                  { label: "Login Interactions", value: activity.login_interactions, color: "#660066" },
                  { label: "Quiz Interactions", value: activity.quiz_interactions, color: "#2C5282" },
                  { label: "Forum Interactions", value: activity.forum_interactions, color: "#1A8F3A" },
                  { label: "Assignment Interactions", value: activity.assignment_interactions, color: "#B7791F" },
                ].map(({ label, value, color }) => (
                  <Box key={label} p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
                    <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                    <Text fontSize="xl" fontWeight="700" color={color}>{value ?? 0}</Text>
                    {activity.total_interactions > 0 && (
                      <Text fontSize="xs" color="gray.400">
                        {Math.round(((value ?? 0) / activity.total_interactions) * 100)}% of total
                      </Text>
                    )}
                  </Box>
                ))}
              </SimpleGrid>
              <Text fontSize="xs" color="gray.400" mt={2}>
                Total interactions: {activity.total_interactions?.toLocaleString() ?? 0}
              </Text>
            </Box>
          )}

          {/* Participation Trend */}
          {trend.length > 0 && (
            <Box mb={6}>
              <Text fontWeight="600" fontSize="sm" mb={3} color="#344054">Monthly Participation Trend</Text>
              <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
                <ChakraTable size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontSize="11px">Month</Th>
                      <Th isNumeric fontSize="11px">Active Students</Th>
                      <Th fontSize="11px">Trend</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {trend.map((t, i) => {
                      const prev = i > 0 ? trend[i - 1].active_students : null;
                      const diff = prev != null ? t.active_students - prev : null;
                      return (
                        <Tr key={t.month}>
                          <Td fontSize="13px" fontWeight="500">{t.month}</Td>
                          <Td isNumeric fontSize="13px" fontWeight="700" color="#660066">{t.active_students}</Td>
                          <Td>
                            {diff != null && (
                              <Badge colorScheme={diff >= 0 ? "green" : "red"} fontSize="10px">
                                {diff >= 0 ? "+" : ""}{diff}
                              </Badge>
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </ChakraTable>
              </Box>
            </Box>
          )}

          <Divider mb={6} />

          {/* Department Breakdown */}
          {deptBreakdown.length > 0 && (
            <Box mb={6}>
              <Text fontWeight="600" fontSize="sm" mb={3} color="#344054">Department Breakdown</Text>
              <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
                <ChakraTable size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontSize="11px">Department</Th>
                      <Th isNumeric fontSize="11px">Students</Th>
                      <Th fontSize="11px">Share</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {deptBreakdown.map((d) => {
                      const total = deptBreakdown.reduce((sum, x) => sum + (x.student_count ?? 0), 0);
                      const pct = total > 0 ? Math.round((d.student_count / total) * 100) : 0;
                      return (
                        <Tr key={d.department}>
                          <Td fontSize="13px">{d.department}</Td>
                          <Td isNumeric fontSize="13px" fontWeight="600">{d.student_count}</Td>
                          <Td>
                            <Box w="80px">
                              <Box h="6px" borderRadius="full" bg="gray.100" overflow="hidden">
                                <Box h="100%" w={`${pct}%`} bg="#660066" borderRadius="full" />
                              </Box>
                              <Text fontSize="10px" color="gray.500" mt={0.5}>{pct}%</Text>
                            </Box>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </ChakraTable>
              </Box>
            </Box>
          )}

          {/* Course Participation Summary */}
          {courses.length > 0 && (
            <Box mb={6}>
              <Text fontWeight="600" fontSize="sm" mb={3} color="#344054">Course Participation Summary</Text>
              <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
                <ChakraTable size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontSize="11px">Course</Th>
                      <Th fontSize="11px">Department</Th>
                      <Th isNumeric fontSize="11px">Enrolled</Th>
                      <Th isNumeric fontSize="11px">Completed</Th>
                      <Th isNumeric fontSize="11px">Completion %</Th>
                      <Th isNumeric fontSize="11px">Active</Th>
                      <Th isNumeric fontSize="11px">Irregular</Th>
                      <Th isNumeric fontSize="11px">Inactive</Th>
                      <Th isNumeric fontSize="11px">Avg Score</Th>
                      <Th isNumeric fontSize="11px">Alerts</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {courses.map((c) => (
                      <Tr key={c.course_id}>
                        <Td fontSize="13px" fontWeight="600" color="#101828" maxW="200px">
                          <Box isTruncated>{c.course_title}</Box>
                        </Td>
                        <Td fontSize="12px" color="gray.500">{c.department}</Td>
                        <Td isNumeric fontSize="13px">{c.enrolled}</Td>
                        <Td isNumeric fontSize="13px">{c.completed}</Td>
                        <Td isNumeric>
                          <Text fontSize="12px" fontWeight="600"
                            color={c.completion_rate >= 50 ? "#1A8F3A" : c.completion_rate >= 25 ? "#B7791F" : "#C53030"}>
                            {c.completion_rate?.toFixed(1)}%
                          </Text>
                        </Td>
                        <Td isNumeric fontSize="12px" color="#1A8F3A" fontWeight="600">{c.active_students}</Td>
                        <Td isNumeric fontSize="12px" color="#B7791F" fontWeight="600">{c.irregular_students}</Td>
                        <Td isNumeric fontSize="12px" color="#C53030" fontWeight="600">{c.inactive_students}</Td>
                        <Td isNumeric>
                          <Text fontSize="12px" fontWeight="700"
                            color={c.avg_participation_score >= 70 ? "#1A8F3A" : c.avg_participation_score >= 40 ? "#B7791F" : "#C53030"}>
                            {c.avg_participation_score?.toFixed(1)}%
                          </Text>
                        </Td>
                        <Td isNumeric>
                          {c.alerts_triggered > 0 ? (
                            <Badge colorScheme="red" fontSize="10px">{c.alerts_triggered}</Badge>
                          ) : (
                            <Text fontSize="12px" color="gray.400">0</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </ChakraTable>
              </Box>
            </Box>
          )}

          {/* At-Risk Students */}
          {atRisk?.data?.length > 0 && (
            <Box mb={6}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Text fontWeight="600" fontSize="sm" color="#C53030">At-Risk Students</Text>
                <Badge colorScheme="red" fontSize="10px">{atRisk.total ?? atRisk.data.length} flagged</Badge>
              </Box>
              <Box overflowX="auto" borderRadius="lg" border="1px solid #FEB2B2" bg="white">
                <ChakraTable size="sm" variant="simple">
                  <Thead bg="red.50">
                    <Tr>
                      <Th fontSize="11px">Student</Th>
                      <Th isNumeric fontSize="11px">Score</Th>
                      <Th fontSize="11px">Status</Th>
                      <Th fontSize="11px">Last Active</Th>
                      <Th isNumeric fontSize="11px">Days Inactive</Th>
                      <Th fontSize="11px">Activity</Th>
                      <Th fontSize="11px">Remarks</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {atRisk.data.map((s) => (
                      <Tr key={s.student_id}>
                        <Td>
                          <Text fontSize="13px" fontWeight="600">{s.student_name}</Text>
                          <Text fontSize="11px" color="gray.400">{s.student_email}</Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="13px" fontWeight="700"
                            color={s.participation_score >= 40 ? "#B7791F" : "#C53030"}>
                            {s.participation_score}%
                          </Text>
                        </Td>
                        <Td>
                          <Tag size="sm" borderRadius="full" colorScheme={engagementColor[s.engagement_status] ?? "gray"}>
                            {s.engagement_status}
                          </Tag>
                        </Td>
                        <Td fontSize="12px">{fmtDate(s.last_active_date)}</Td>
                        <Td isNumeric fontSize="12px" fontWeight="600" color="#C53030">{s.days_since_active}</Td>
                        <Td fontSize="12px" color="gray.500">
                          {Array.isArray(s.activity_type) ? s.activity_type.join(", ") : s.activity_type ?? "—"}
                        </Td>
                        <Td fontSize="12px" color="gray.500" maxW="200px">
                          <Box isTruncated>{s.remarks ?? "—"}</Box>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </ChakraTable>
              </Box>
            </Box>
          )}

          {/* Scoring Guide */}
          {guide && (
            <Accordion allowToggle>
              <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
                <AccordionButton bg="gray.50" _hover={{ bg: "gray.100" }} px={4} py={3}>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="600" fontSize="sm" color="#344054">Participation Scoring Formula</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel px={4} py={4} bg="white">
                  {guide.formula?.description && (
                    <Text fontSize="sm" color="gray.600" mb={4}>{guide.formula.description}</Text>
                  )}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
                    {(guide.formula?.components ?? []).map((c) => (
                      <Box key={c.dimension} p={3} borderRadius="md" bg="#F9F0FF" border="1px solid #E9D8FD">
                        <Text fontSize="sm" fontWeight="600" color="#660066">{c.dimension}</Text>
                        <Text fontSize="xs" color="gray.500">Weight: <strong>{c.weight}</strong> · Cap: {c.cap}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                  <Divider mb={3} />
                  <Text fontSize="xs" fontWeight="600" color="#344054" mb={2}>Engagement Thresholds</Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                    {(guide.engagementStatuses ?? []).map((s) => (
                      <Box key={s.status} p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                        <Tag size="sm" colorScheme={engagementColor[s.status] ?? "gray"} borderRadius="full" mb={1}>
                          {s.status}
                        </Tag>
                        <Text fontSize="xs" color="gray.600">Score: {s.threshold}</Text>
                        <Text fontSize="xs" color={s.alert ? "#C53030" : "#1A8F3A"}>
                          {s.alert ? "Alert triggered" : "No alert"}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </>
      )}
    </Box>
  );
};

export default AdminSummaryTab;
