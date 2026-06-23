import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  InputGroup,
  InputLeftElement,
  Input,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import { adminGetMarkingTemplates } from "../../../services";

const SCOPE_BADGE = {
  "Assessment": { bg: "#EBF4FF", color: "#3182CE" },
  "Normal Exam": { bg: "#E6F4EA", color: "#38A169" },
  "Standalone Exam": { bg: "#FAF5FF", color: "#805AD5" },
};

const getScopeBadge = (scope) => {
  const s = SCOPE_BADGE[scope] || { bg: "#F7FAFC", color: "#718096" };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="12px"
      py="4px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
    >
      {scope}
    </Badge>
  );
};

export const ExamTemplatesPage = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();
  const [scopeFilter, setScopeFilter] = useState("");

  const fetcher = useCallback(async () => {
    const params = scopeFilter ? { usageScope: scopeFilter } : {};
    const { templates } = await adminGetMarkingTemplates(params);
    return { templates };
  }, [scopeFilter]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const templates = resource.data?.templates ?? [];
  const assessmentCount = templates.filter((t) => t.usageScope === "Assessment").length;
  const normalExamCount = templates.filter((t) => t.usageScope === "Normal Exam").length;
  const standaloneCount = templates.filter((t) => t.usageScope === "Standalone Exam").length;

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Marking Templates</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="30px">
        <Heading as="h2" size="lg" color="#1A202C">
          Marking Templates
        </Heading>
        <Button
          onClick={() => history.push("/admin/marking-templates/create")}
          style={{ backgroundColor: "#6b006b", color: "white" }}
        >
          <Flex alignItems="center" gap="8px">
            <FaPlus size="12px" /> Create Template
          </Flex>
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap="20px" mb="30px">
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Total Templates
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : templates.length}
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Assessment
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#3182CE">
            {resource.loading ? <Spinner size="sm" /> : assessmentCount}
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Normal Exam
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#38A169">
            {resource.loading ? <Spinner size="sm" /> : normalExamCount}
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Standalone Exam
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#805AD5">
            {resource.loading ? <Spinner size="sm" /> : standaloneCount}
          </Text>
        </Box>
      </Grid>

      {/* Table */}
      <Box bg="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
        <Flex gap="16px" p="20px" borderBottom="1px solid #E2E8F0" alignItems="center">
          <InputGroup width="300px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="#A0AEC0" />
            </InputLeftElement>
            <Input type="text" placeholder="Search templates..." />
          </InputGroup>
          <Select
            id="scopeFilter"
            placeholder="All scopes"
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            options={[
              { label: "Assessment", value: "Assessment" },
              { label: "Normal Exam", value: "Normal Exam" },
              { label: "Standalone Exam", value: "Standalone Exam" },
            ]}
          />
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" alignItems="center" p="60px">
            <Spinner size="lg" color="#6b006b" />
          </Flex>
        )}

        {resource.err && (
          <Flex justifyContent="center" alignItems="center" p="60px">
            <Text color="red.500">{resource.err}</Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">
                    Template Name
                  </Th>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">
                    Usage Scope
                  </Th>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">
                    Question Types
                  </Th>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">
                    Total Marks
                  </Th>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">
                    Retry Count
                  </Th>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">
                    Retry Policy
                  </Th>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">
                    Created By
                  </Th>
                  <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" width="80px">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {templates.map((t) => (
                  <Tr key={t.id} _hover={{ bg: "#FAFAFA" }}>
                    <Td fontSize="14px" color="#1A202C" fontWeight="500">
                      {t.markingTemplateName}
                    </Td>
                    <Td>{getScopeBadge(t.usageScope)}</Td>
                    <Td fontSize="13px" color="#4A5568" maxWidth="200px">
                      {(t.questionTypes ?? []).join(", ")}
                    </Td>
                    <Td fontSize="14px" color="#1A202C" fontWeight="600">
                      {t.totalMarks}
                    </Td>
                    <Td fontSize="14px" color="#1A202C">
                      {t.retryCount}
                    </Td>
                    <Td fontSize="14px" color="#1A202C" textTransform="capitalize">
                      {t.retryPolicy}
                    </Td>
                    <Td fontSize="13px" color="#4A5568">
                      {t.creator
                        ? `${t.creator.firstName} ${t.creator.lastName}`
                        : "—"}
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<FiMoreVertical />}
                          variant="outline"
                          size="sm"
                          borderRadius="4px"
                        />
                        <MenuList minWidth="160px">
                          <MenuItem
                            onClick={() =>
                              history.push(`/admin/marking-templates/${t.id}`)
                            }
                          >
                            View Details
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
                {templates.length === 0 && (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py="40px" color="#718096" fontSize="14px">
                      No marking templates found.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        <Flex
          justifyContent="flex-end"
          alignItems="center"
          p="20px"
          borderTop="1px solid #E2E8F0"
          gap="20px"
        >
          <Text fontSize="14px" fontWeight="600" color="#1A202C">
            Showing {templates.length} template{templates.length !== 1 ? "s" : ""}
          </Text>
          <Flex gap="8px">
            <IconButton variant="ghost" size="sm" icon={<FaChevronLeft />} aria-label="Previous page" />
            <Text fontSize="14px" color="#A0AEC0" alignSelf="center">1</Text>
            <IconButton variant="ghost" size="sm" icon={<FaChevronRight />} aria-label="Next page" />
          </Flex>
        </Flex>
      </Box>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const ExamTemplatesPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamTemplatesPage {...props} />} />
);

export default ExamTemplatesPageRoute;
