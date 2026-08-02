import React, { useCallback, useEffect } from "react";
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
  Wrap,
  WrapItem,
  Tag,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import { adminGetMarkingTemplateById } from "../../../services";

const SCOPE_BADGE = {
  "Assessment": { bg: "#EBF4FF", color: "#3182CE" },
  "Normal Exam": { bg: "#E6F4EA", color: "#38A169" },
  "Standalone Exam": { bg: "#FAF5FF", color: "#805AD5" },
};

const POLICY_LABEL = {
  highest: "Highest Score",
  latest: "Latest Attempt",
  average: "Average Score",
};

const TYPE_COLOR = {
  MCQ: { bg: "#EBF4FF", color: "#3182CE" },
  TrueFalse: { bg: "#F0FFF4", color: "#38A169" },
  FillBlank: { bg: "#FAF5FF", color: "#805AD5" },
  Matching: { bg: "#FFF5F5", color: "#E53E3E" },
  ShortAnswer: { bg: "#FFFAF0", color: "#DD6B20" },
  Essay: { bg: "#F7FAFC", color: "#4A5568" },
};

export const ExamTemplateDetailsPage = () => {
  const history = useHistory();
  const { templateId } = useParams();

  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { template } = await adminGetMarkingTemplateById(templateId);
    return template;
  }, [templateId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const template = resource.data;

  const scopeStyle = SCOPE_BADGE[template?.usageScope] || { bg: "#F7FAFC", color: "#718096" };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/marking-templates">Marking Templates</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Template Details</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
    <Box paddingX={{ base: "20px", lg: "40px" }} paddingY="30px" bg="#FAFAFA" minHeight="100vh">
      {/* Go Back */}
      <Flex
        alignItems="center"
        cursor="pointer"
        onClick={() => history.goBack()}
        mb="24px"
        width="max-content"
      >
        <Box border="1px solid #E2E8F0" borderRadius="4px" p="6px" mr="12px" bg="white">
          <FaArrowLeft color="#1A202C" />
        </Box>
        <Text fontWeight="500" color="#1A202C">Go Back</Text>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" alignItems="center" minHeight="60vh">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {resource.err && (
        <Flex justifyContent="center" alignItems="center" minHeight="60vh">
          <Text color="red.500">{resource.err}</Text>
        </Flex>
      )}

      {!resource.loading && template && (
        <>
          {/* Header */}
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            mb="32px"
            flexWrap="wrap"
            gap="16px"
          >
            <Box>
              <Flex alignItems="center" gap="12px" mb="10px">
                <Heading as="h1" size="lg" color="#1A202C" m={0}>
                  {template.markingTemplateName}
                </Heading>
                <Badge
                  bg={scopeStyle.bg}
                  color={scopeStyle.color}
                  px="12px"
                  py="4px"
                  borderRadius="12px"
                  textTransform="none"
                  fontWeight="500"
                >
                  {template.usageScope}
                </Badge>
              </Flex>
              <Flex gap="24px" flexWrap="wrap">
                <Text color="#718096" fontSize="14px">
                  ID:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600" fontSize="13px">
                    {template.id}
                  </Text>
                </Text>
                {template.creator && (
                  <Text color="#718096" fontSize="14px">
                    Created by:{" "}
                    <Text as="span" color="#1A202C" fontWeight="600">
                      {template.creator.firstName} {template.creator.lastName}
                    </Text>
                  </Text>
                )}
                <Text color="#718096" fontSize="14px">
                  Created:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {template.createdAt
                      ? new Date(template.createdAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </Text>
              </Flex>
            </Box>
          </Flex>

          {/* Quick Stats */}
          <Grid templateColumns="repeat(4, 1fr)" gap="16px" mb="28px">
            {[
              { label: "Total Marks", value: template.totalMarks },
              { label: "Question Types", value: (template.questionTypes ?? []).length },
              { label: "Retry Count", value: template.retryCount },
              { label: "Retry Policy", value: POLICY_LABEL[template.retryPolicy] || template.retryPolicy || "—" },
            ].map(({ label, value }) => (
              <Box key={label} bg="white" p="20px" borderRadius="8px" shadow="sm" textAlign="center">
                <Text fontSize="12px" color="#718096" mb="6px">{label}</Text>
                <Text fontSize="20px" fontWeight="700" color="#6b006b">{value}</Text>
              </Box>
            ))}
          </Grid>

          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="28px" alignItems="start">
            {/* Left */}
            <Box>
              {/* Question Configuration Table */}
              <Box bg="white" borderRadius="8px" shadow="sm" mb="24px">
                <Text
                  fontSize="15px"
                  fontWeight="600"
                  color="#1A202C"
                  p="20px"
                  borderBottom="1px solid #E2E8F0"
                >
                  Question Configuration
                </Text>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th textTransform="none" color="#4A5568">Type</Th>
                        <Th textTransform="none" color="#4A5568">Quantity</Th>
                        <Th textTransform="none" color="#4A5568">Marks (Total)</Th>
                        <Th textTransform="none" color="#4A5568">Difficulty</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(template.questionTypes ?? []).map((type) => {
                        const style = TYPE_COLOR[type] || { bg: "#F7FAFC", color: "#718096" };
                        return (
                          <Tr key={type}>
                            <Td>
                              <Badge
                                bg={style.bg}
                                color={style.color}
                                px="8px"
                                py="2px"
                                borderRadius="8px"
                                textTransform="none"
                                fontSize="12px"
                              >
                                {type}
                              </Badge>
                            </Td>
                            <Td fontSize="13px" color="#1A202C">
                              {template.questionQuantity?.[type] ?? "—"}
                            </Td>
                            <Td fontSize="13px" fontWeight="600" color="#6b006b">
                              {template.markDistribution?.[type] ?? "—"}
                            </Td>
                            <Td fontSize="13px" color="#4A5568">
                              {template.difficultyLevel?.[type] ?? "—"}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Knowledge Points */}
              {(template.knowledgePoints ?? []).length > 0 && (
                <Box bg="white" borderRadius="8px" p="24px" shadow="sm">
                  <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
                    Knowledge Points
                  </Text>
                  <Wrap spacing="8px">
                    {template.knowledgePoints.map((point) => (
                      <WrapItem key={point}>
                        <Tag size="md" borderRadius="full" variant="solid" bg="#6b006b" color="white">
                          {point}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </Box>

            {/* Right — Retry Config */}
            <Box>
              <Box bg="white" borderRadius="8px" p="24px" shadow="sm">
                <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
                  Retry Configuration
                </Text>
                <Flex justifyContent="space-between" mb="12px">
                  <Text fontSize="13px" color="#718096">Retry Count</Text>
                  <Text fontSize="14px" fontWeight="700" color="#1A202C">
                    {template.retryCount === 0 ? "No retries" : template.retryCount}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between" mb="12px">
                  <Text fontSize="13px" color="#718096">Retry Policy</Text>
                  <Text fontSize="14px" fontWeight="600" color="#6b006b" textTransform="capitalize">
                    {POLICY_LABEL[template.retryPolicy] || template.retryPolicy || "—"}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text fontSize="13px" color="#718096">Usage Scope</Text>
                  <Badge
                    bg={scopeStyle.bg}
                    color={scopeStyle.color}
                    px="10px"
                    py="3px"
                    borderRadius="10px"
                    textTransform="none"
                    fontWeight="500"
                    fontSize="12px"
                  >
                    {template.usageScope}
                  </Badge>
                </Flex>
              </Box>
            </Box>
          </Grid>
        </>
      )}
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const ExamTemplateDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamTemplateDetailsPage {...props} />} />
);

export default ExamTemplateDetailsPageRoute;
