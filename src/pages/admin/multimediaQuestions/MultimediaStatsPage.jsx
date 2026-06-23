import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { Breadcrumb, Heading, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { getMultimediaExamStats } from "../../../services";
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { FaImage, FaMicrophone, FaVideo } from "react-icons/fa";

const KPICard = ({ label, value, sub, color = "#6b006b", bg = "#F0E6FF" }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px" position="relative" overflow="hidden">
    <Box position="absolute" top="0" left="0" w="4px" h="100%" bg={color} borderRadius="10px 0 0 10px" />
    <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="8px">
      {label}
    </Text>
    <Text fontSize="28px" fontWeight="800" color={color} lineHeight="1">
      {value ?? "—"}
    </Text>
    {sub && <Text fontSize="11px" color="gray.400" mt="4px">{sub}</Text>}
  </Box>
);

const MediaTypeBar = ({ label, count, total, icon, color, bg }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Flex alignItems="center" gap="12px" p="14px" bg="white" border="1px solid #E2E8F0" borderRadius="8px">
      <Box w="36px" h="36px" bg={bg} borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        {icon}
      </Box>
      <Box flex={1}>
        <Flex justifyContent="space-between" mb="6px">
          <Text fontSize="13px" fontWeight="600" color="#1A202C">{label}</Text>
          <Text fontSize="13px" fontWeight="700" color={color}>{count}</Text>
        </Flex>
        <Box h="6px" bg="#F7FAFC" borderRadius="4px" overflow="hidden">
          <Box h="100%" bg={color} borderRadius="4px" w={`${pct}%`} transition="width 0.4s ease" />
        </Box>
        <Text fontSize="11px" color="gray.400" mt="4px">{pct}% of all media</Text>
      </Box>
    </Flex>
  );
};

const MultimediaStatsPage = () => {
  const { examinationId } = useParams();
  const history = useHistory();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMultimediaExamStats(examinationId)
      .then((res) => setStats(res?.data ?? res))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, [examinationId]);

  const totalMedia = stats
    ? (stats.mediaTypeBreakdown?.image ?? 0) + (stats.mediaTypeBreakdown?.audio ?? 0) + (stats.mediaTypeBreakdown?.video ?? 0)
    : 0;

  const kpiMet = stats?.kpis?.multimediaUsageRateMet;
  const usageRate = stats?.multimediaUsageRate ?? 0;

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/examination">Examination Analysis</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Multimedia Stats</Link></BreadcrumbItem>}
        />
      </Flex>
      <Flex alignItems="center" gap="16px" mb="28px">
        <Flex
          as="button"
          alignItems="center"
          gap="6px"
          color="#6b006b"
          onClick={() => history.push(`/admin/multimedia-questions/${examinationId}`)}
          _hover={{ opacity: 0.8 }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">Question Bank</Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Box>
          <Heading fontSize="22px" fontWeight="600">Multimedia Stats</Heading>
          <Text fontSize="13px" color="gray.500" mt="2px">Examination ID: {examinationId}</Text>
        </Box>
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p="16px">
          <Text color="red.600" fontSize="14px">{error}</Text>
        </Box>
      )}

      {!loading && !error && stats && (
        <>
          {/* KPI Alert */}
          {kpiMet === false && (
            <Box
              bg="#FFF5EA"
              border="1px solid #FBBF24"
              borderRadius="10px"
              p="16px 20px"
              mb="20px"
            >
              <Flex alignItems="center" gap="10px">
                <FiAlertTriangle color="#DD6B20" size={18} />
                <Text fontSize="14px" fontWeight="600" color="#DD6B20">
                  Multimedia usage below target — currently {usageRate.toFixed(1)}%. Target: ≥ 20%. Add multimedia questions to improve assessment quality.
                </Text>
              </Flex>
            </Box>
          )}

          {kpiMet === true && (
            <Box
              bg="#E6F4EA"
              border="1px solid #9AE6B4"
              borderRadius="10px"
              p="16px 20px"
              mb="20px"
            >
              <Flex alignItems="center" gap="10px">
                <FiCheckCircle color="#38A169" size={18} />
                <Text fontSize="14px" fontWeight="600" color="#276749">
                  KPI target met — multimedia usage at {usageRate.toFixed(1)}% (target ≥ 20%).
                </Text>
              </Flex>
            </Box>
          )}

          {/* KPI Cards */}
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
            gap="16px"
            mb="20px"
          >
            <KPICard
              label="Total Questions"
              value={stats.totalQuestions}
              color="#3182CE"
              bg="#EBF4FF"
            />
            <KPICard
              label="Multimedia Questions"
              value={stats.multimediaQuestions}
              sub="with media or HTML"
              color="#6b006b"
              bg="#F0E6FF"
            />
            <KPICard
              label="Plain Questions"
              value={stats.plainQuestions}
              sub="no media or HTML"
              color="#718096"
              bg="#F7FAFC"
            />
            <KPICard
              label="Multimedia Usage Rate"
              value={`${usageRate.toFixed(1)}%`}
              sub={`Target: ${stats.kpis?.multimediaUsageRateTarget ?? "≥ 20%"}`}
              color={kpiMet ? "#38A169" : "#DD6B20"}
              bg={kpiMet ? "#E6F4EA" : "#FFF5EA"}
            />
          </Grid>

          {/* Media Type Breakdown */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <Text
              fontSize="11px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              mb="16px"
            >
              Media Type Breakdown ({totalMedia} total media items)
            </Text>
            <Flex direction="column" gap="12px">
              <MediaTypeBar
                label="Images"
                count={stats.mediaTypeBreakdown?.image ?? 0}
                total={totalMedia}
                icon={<FaImage color="#6b006b" />}
                color="#6b006b"
                bg="#F0E6FF"
              />
              <MediaTypeBar
                label="Audio"
                count={stats.mediaTypeBreakdown?.audio ?? 0}
                total={totalMedia}
                icon={<FaMicrophone color="#38A169" />}
                color="#38A169"
                bg="#E6F4EA"
              />
              <MediaTypeBar
                label="Video"
                count={stats.mediaTypeBreakdown?.video ?? 0}
                total={totalMedia}
                icon={<FaVideo color="#3182CE" />}
                color="#3182CE"
                bg="#EBF4FF"
              />
            </Flex>
          </Box>
        </>
      )}

      {!loading && !error && !stats && (
        <Flex direction="column" alignItems="center" justifyContent="center" minH="300px" gap="12px">
          <Text fontSize="14px" color="gray.500">No statistics available for this examination.</Text>
        </Flex>
      )}
    </Box>
  );
};

export const MultimediaStatsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MultimediaStatsPage {...props} />} />
);

export default MultimediaStatsPageRoute;
