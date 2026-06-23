import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box, Flex, Grid, Text, Spinner, BreadcrumbItem } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { getMarkingSchemeKPIs } from "../../../services";

const PRIMARY = "#6b006b";

const KPICard = ({ label, value, sub, color = PRIMARY }) => (
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

const MarkingSchemeKPIPage = () => {
  const history = useHistory();

  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMarkingSchemeKPIs();
        const parsed = res?.data || res;
        setKpis(parsed);
      } catch (err) {
        setError(err?.message || "Failed to load KPI data.");
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

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
              <Link href="#">KPIs</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="30px">
        {/* Header */}
        <Flex align="center" mb="28px" gap="12px">
          <Box
            as="button"
            onClick={() => history.push("/admin/marking-schemes")}
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
          <Heading>Marking Scheme KPIs</Heading>
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

        {/* KPI Cards */}
        {!loading && !error && kpis && (
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap="20px"
          >
            <KPICard
              label="Exams with Schemes"
              value={`${kpis.examsUsingMarkingSchemesRate}%`}
              sub={`${kpis.examsUsingMarkingSchemes} of ${kpis.totalExaminations}`}
            />
            <KPICard
              label="Rubric Usage Rate"
              value={`${kpis.rubricUsageRate}%`}
            />
            <KPICard
              label="Rubric-graded Questions"
              value={`${kpis.rubricGradedQuestions} / ${kpis.totalSubjectiveQuestions}`}
            />
          </Grid>
        )}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const MarkingSchemeKPIPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MarkingSchemeKPIPage {...props} />} />
);

export default MarkingSchemeKPIPageRoute;
