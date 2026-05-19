import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { Heading } from "../../../components";
import { adminGetBadgeKPIs } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { FiArrowLeft } from "react-icons/fi";
import { FaMedal } from "react-icons/fa";

const KPICard = ({ label, value, sub, color = "#6b006b", bg = "#F0E6FF" }) => (
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
      bg={color}
      borderRadius="10px 0 0 10px"
    />
    <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="8px">
      {label}
    </Text>
    <Text fontSize="28px" fontWeight="800" color={color} lineHeight="1">
      {value ?? "—"}
    </Text>
    {sub && (
      <Text fontSize="11px" color="gray.400" mt="4px">
        {sub}
      </Text>
    )}
  </Box>
);

const BadgeKPIPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetBadgeKPIs()
      .then((res) => setKpis(res?.data || res))
      .catch((err) =>
        setError(
          capitalizeFirstLetter(
            err?.response?.data?.message || err.message || "Failed to load KPIs",
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="16px" mb="28px">
        <Flex
          as="button"
          alignItems="center"
          gap="6px"
          color="#6b006b"
          onClick={() => history.push("/admin/badge-support")}
          _hover={{ opacity: 0.8 }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">
            Badges
          </Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Box>
          <Heading fontSize="22px" fontWeight="600">
            Badge KPI Dashboard
          </Heading>
          <Text fontSize="13px" color="gray.500" mt="2px">
            Overview of badge issuance and engagement metrics
          </Text>
        </Box>
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p="16px">
          <Text color="red.600" fontSize="14px">
            {error}
          </Text>
        </Box>
      )}

      {!loading && !error && kpis && (
        <>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(5, 1fr)",
            }}
            gap="16px"
            mb="16px"
          >
            <KPICard
              label="Total Badges"
              value={kpis.totalBadges}
              color="#6b006b"
              bg="#F0E6FF"
            />
            <KPICard
              label="Active Badges"
              value={kpis.activeBadges}
              color="#38A169"
              bg="#E6F4EA"
            />
            <KPICard
              label="Inactive Badges"
              value={kpis.inactiveBadges}
              color="#718096"
              bg="#F7FAFC"
            />
            <KPICard
              label="Total Badges Awarded"
              value={kpis.totalBadgesAwarded}
              color="#3182CE"
              bg="#EBF4FF"
            />
            <KPICard
              label="Completion Rate"
              value={
                kpis.badgeCompletionRate != null
                  ? `${kpis.badgeCompletionRate}%`
                  : "—"
              }
              color="#DD6B20"
              bg="#FFF5EA"
            />
          </Grid>

          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(5, 1fr)",
            }}
            gap="16px"
          >
            <KPICard
              label="Avg Days to Earn"
              value={kpis.averageDaysToEarn}
              sub="days on average"
              color="#6b006b"
            />
            <KPICard
              label="Auto-Awarded This Week"
              value={kpis.autoAwardedThisWeek}
              color="#38A169"
            />
            <KPICard
              label="Auto-Awarded This Month"
              value={kpis.autoAwardedThisMonth}
              color="#3182CE"
            />
            <KPICard
              label="Pending Approvals"
              value={kpis.pendingApprovalCount}
              color="#DD6B20"
            />
            <KPICard
              label="Badges With Requirements"
              value={kpis.badgesWithRequirementsCount}
              color="#718096"
            />
          </Grid>
        </>
      )}

      {!loading && !error && !kpis && (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          minH="300px"
          gap="12px"
        >
          <Box
            w="56px"
            h="56px"
            bg="#F0E6FF"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FaMedal color="#6b006b" size="22px" />
          </Box>
          <Text fontSize="14px" color="gray.500">
            No KPI data available.
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export const BadgeKPIPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeKPIPage {...props} />} />
);

export default BadgeKPIPageRoute;
