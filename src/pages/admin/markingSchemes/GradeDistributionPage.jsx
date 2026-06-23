import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { getGradeDistribution } from "../../../services";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GRADE_BANDS = ["A", "B+", "B", "C+", "C", "D", "F"];
const PRIMARY = "#6b006b";

const SummaryCard = ({ label, value }) => (
  <Box
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="10px"
    p="20px"
    position="relative"
    overflow="hidden"
  >
    <Box
      position="absolute"
      top="0"
      left="0"
      w="4px"
      h="100%"
      bg={PRIMARY}
      borderRadius="10px 0 0 10px"
    />
    <Text
      fontSize="11px"
      fontWeight="700"
      color="gray.400"
      textTransform="uppercase"
      letterSpacing="wider"
      mb="8px"
    >
      {label}
    </Text>
    <Text fontSize="28px" fontWeight="800" color={PRIMARY} lineHeight="1">
      {value ?? "—"}
    </Text>
  </Box>
);

const GradeDistributionPage = () => {
  const history = useHistory();
  const { examinationId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getGradeDistribution(examinationId);
        const parsed = res?.data || res;
        setData(parsed);
      } catch (err) {
        setError(err?.message || "Failed to load grade distribution.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examinationId]);

  const handleExportCSV = () => {
    if (!data?.distribution) return;
    const totalStudents = data?.totalStudents || 0;
    const rows = [["Grade", "Count", "Percentage"]];
    GRADE_BANDS.forEach((grade) => {
      const count = data.distribution[grade] ?? 0;
      const pct =
        totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : "0.0";
      rows.push([grade, count, `${pct}%`]);
    });
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `grade_distribution_${examinationId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: GRADE_BANDS,
    datasets: [
      {
        label: "Students",
        data: GRADE_BANDS.map((g) => data?.distribution?.[g] ?? 0),
        backgroundColor: PRIMARY,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} student${ctx.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: "600" } },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "#F0F0F0" },
      },
    },
  };

  const isEmpty =
    !loading &&
    !error &&
    data &&
    (!data.distribution ||
      GRADE_BANDS.every((g) => !data.distribution[g]));

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/marking-schemes">Marking Schemes</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Grade Distribution</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="30px">
        {/* Header */}
        <Flex align="center" justify="space-between" mb="28px" flexWrap="wrap" gap="12px">
          <Flex align="center" gap="12px">
            <Box
              as="button"
              onClick={() => history.goBack()}
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="36px"
              h="36px"
              borderRadius="8px"
              border="1px solid #E2E8F0"
              bg="white"
              cursor="pointer"
              _hover={{ bg: "#f9f0f9" }}
            >
              <FiArrowLeft size={16} color={PRIMARY} />
            </Box>
            <Heading>Grade Distribution</Heading>
          </Flex>
          {!loading && !error && data && !isEmpty && (
            <Button
              leftIcon={<FiDownload size={14} />}
              onClick={handleExportCSV}
              size="sm"
              variant="outline"
              borderColor={PRIMARY}
              color={PRIMARY}
              _hover={{ bg: "#f9f0f9" }}
            >
              Export CSV
            </Button>
          )}
        </Flex>

        {/* Loading */}
        {loading && (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="lg" color={PRIMARY} thickness="3px" />
          </Flex>
        )}

        {/* Error */}
        {!loading && error && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="8px"
            p="16px"
            mb="20px"
          >
            <Text color="red.600" fontWeight="600" fontSize="14px">
              {error}
            </Text>
          </Box>
        )}

        {/* Empty state */}
        {isEmpty && (
          <Box
            bg="white"
            border="1px solid #E2E8F0"
            borderRadius="10px"
            p="48px"
            textAlign="center"
          >
            <Text fontSize="16px" fontWeight="600" color="gray.500" mb="8px">
              No scores computed yet for this examination.
            </Text>
            <Text fontSize="13px" color="gray.400" mb="20px">
              Compute student scores first.
            </Text>
            <Button
              leftIcon={<FiArrowLeft size={14} />}
              variant="outline"
              borderColor={PRIMARY}
              color={PRIMARY}
              size="sm"
              _hover={{ bg: "#f9f0f9" }}
              onClick={() => history.goBack()}
            >
              Go Back
            </Button>
          </Box>
        )}

        {/* Main content */}
        {!loading && !error && data && !isEmpty && (
          <>
            {/* Summary Cards */}
            <Grid
              templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
              gap="16px"
              mb="28px"
            >
              <SummaryCard
                label="Pass Rate"
                value={
                  data.passRate !== undefined && data.passRate !== null
                    ? `${data.passRate}%`
                    : "—"
                }
              />
              <SummaryCard
                label="Mean Score"
                value={
                  data.meanScore !== undefined && data.meanScore !== null
                    ? Number(data.meanScore).toFixed(1)
                    : "—"
                }
              />
              <SummaryCard
                label="Std Deviation"
                value={
                  data.stdDeviation !== undefined && data.stdDeviation !== null
                    ? Number(data.stdDeviation).toFixed(2)
                    : "—"
                }
              />
              <SummaryCard
                label="Total Students"
                value={data.totalStudents ?? "—"}
              />
            </Grid>

            {/* Bar Chart */}
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="10px"
              p="24px"
              mb="24px"
            >
              <Text
                fontSize="13px"
                fontWeight="700"
                color="gray.600"
                mb="20px"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Score Distribution by Grade Band
              </Text>
              <Box maxH="320px">
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Box>

            {/* Distribution Table */}
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="10px"
              overflow="hidden"
            >
              <Box px="24px" py="16px" borderBottom="1px solid #E2E8F0">
                <Text
                  fontSize="13px"
                  fontWeight="700"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Grade Breakdown
                </Text>
              </Box>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#faf5fa">
                    <Tr>
                      <Th
                        fontSize="11px"
                        fontWeight="700"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py="12px"
                      >
                        Grade
                      </Th>
                      <Th
                        fontSize="11px"
                        fontWeight="700"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py="12px"
                        isNumeric
                      >
                        Count
                      </Th>
                      <Th
                        fontSize="11px"
                        fontWeight="700"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py="12px"
                        isNumeric
                      >
                        Percentage
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {GRADE_BANDS.map((grade) => {
                      const count = data.distribution?.[grade] ?? 0;
                      const total = data.totalStudents || 0;
                      const pct =
                        total > 0
                          ? ((count / total) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <Tr
                          key={grade}
                          _hover={{ bg: "#faf5fa" }}
                          transition="background 0.15s"
                        >
                          <Td py="14px">
                            <Badge
                              bg={count > 0 ? "#f9f0f9" : "gray.100"}
                              color={count > 0 ? PRIMARY : "gray.400"}
                              fontWeight="700"
                              fontSize="13px"
                              px="10px"
                              py="3px"
                              borderRadius="6px"
                            >
                              {grade}
                            </Badge>
                          </Td>
                          <Td isNumeric py="14px">
                            <Text
                              fontSize="14px"
                              fontWeight={count > 0 ? "600" : "400"}
                              color={count > 0 ? "gray.700" : "gray.400"}
                            >
                              {count}
                            </Text>
                          </Td>
                          <Td isNumeric py="14px">
                            <Text
                              fontSize="14px"
                              fontWeight={count > 0 ? "600" : "400"}
                              color={count > 0 ? PRIMARY : "gray.400"}
                            >
                              {pct}%
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const GradeDistributionPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeDistributionPage {...props} />} />
);

export default GradeDistributionPageRoute;
