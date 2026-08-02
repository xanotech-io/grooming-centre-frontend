import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  BreadcrumbItem,
  Flex,
  Grid,
  Progress,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { getExamPaperConfigKPIs } from "../../../services";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";

const KPICard = ({ label, value, color, subtitle }) => (
  <Box
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="10px"
    p="24px"
    borderLeft={`4px solid ${color}`}
  >
    <Text fontSize="13px" color="gray.500" fontWeight="500" mb="8px">{label}</Text>
    <Text fontSize="32px" fontWeight="700" color={color} lineHeight="1">{value ?? "—"}</Text>
    {subtitle && <Text fontSize="12px" color="gray.400" mt="6px">{subtitle}</Text>}
  </Box>
);

const ExamConfigKPIPage = () => {
  const history = useHistory();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKPIs = () => {
    setLoading(true);
    setError(null);
    getExamPaperConfigKPIs()
      .then((res) => setData(res?.data ?? res))
      .catch(() => setError("Failed to load KPI data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKPIs(); }, []);

  const usageRate = Number(data?.randomizationUsageRate ?? 0);

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Exam Config KPIs</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" justifyContent="space-between" mb="24px" flexWrap="wrap" gap="12px">
        <Flex alignItems="center" gap="12px">
          <Flex as="button" alignItems="center" gap="6px" color="#6b006b" onClick={() => history.goBack()} _hover={{ opacity: 0.8 }}>
            <FiArrowLeft size={14} />
            <Text fontSize="13px" fontWeight="600">Back</Text>
          </Flex>
          <Box w="1px" h="20px" bg="#E2E8F0" />
          <Heading fontSize="22px" fontWeight="600">Exam Configuration KPIs</Heading>
        </Flex>
        <Button secondary leftIcon={<FiRefreshCw size={13} />} onClick={fetchKPIs} isLoading={loading}>
          Refresh
        </Button>
      </Flex>

      {loading && (
        <Flex justifyContent="center" py="80px"><Spinner size="xl" color="#6b006b" /></Flex>
      )}

      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p="16px">
          <Text color="red.600" fontSize="14px">{error}</Text>
        </Box>
      )}

      {!loading && data && (
        <Flex direction="column" gap="24px">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap="16px">
            <KPICard
              label="Total Examinations"
              value={data.totalExaminations}
              color="#3182CE"
              subtitle="All examinations in the system"
            />
            <KPICard
              label="Published Examinations"
              value={data.publishedExaminations}
              color="#38A169"
              subtitle="Live and locked for students"
            />
            <KPICard
              label="Draft Examinations"
              value={data.draftExaminations}
              color="#DD6B20"
              subtitle="Still configurable"
            />
            <KPICard
              label="Archived Examinations"
              value={data.archivedExaminations}
              color="#718096"
              subtitle="No longer active"
            />
            <KPICard
              label="Customized Published Papers"
              value={data.customizedPapersCount}
              color="#6b006b"
              subtitle="Fully customized & published"
            />
          </Grid>

          {/* Randomization Usage Rate — full-width bar */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="12px">
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#1A202C">Randomization Usage Rate</Text>
                <Text fontSize="12px" color="gray.400" mt="2px">
                  Percentage of examinations with randomization enabled
                </Text>
              </Box>
              <Text fontSize="28px" fontWeight="700" color="#6b006b">{usageRate.toFixed(1)}%</Text>
            </Flex>
            <Progress
              value={usageRate}
              max={100}
              colorScheme="purple"
              borderRadius="6px"
              bg="#F0E6FF"
              h="12px"
            />
            <Flex justifyContent="space-between" mt="6px">
              <Text fontSize="11px" color="gray.400">0%</Text>
              <Text fontSize="11px" color="gray.400">100%</Text>
            </Flex>
          </Box>
        </Flex>
      )}
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const ExamConfigKPIPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamConfigKPIPage {...props} />} />
);

export default ExamConfigKPIPageRoute;
