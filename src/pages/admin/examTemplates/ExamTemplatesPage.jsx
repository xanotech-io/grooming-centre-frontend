<<<<<<< Updated upstream
import React, { useCallback, useEffect, useState } from "react";
=======
import React, { useCallback, useEffect } from "react";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  MenuDivider,
=======
>>>>>>> Stashed changes
  Spinner,
  InputGroup,
  InputLeftElement,
  Input,
<<<<<<< Updated upstream
  useToast,
=======
>>>>>>> Stashed changes
} from "@chakra-ui/react";
import {
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select } from "../../../components";
import { useFetch } from "../../../hooks";
<<<<<<< Updated upstream
import {
  adminGetExamTemplates,
  adminArchiveExamTemplate,
  adminPermanentDeleteExamTemplate,
} from "../../../services";

const getStatusBadge = (status) => {
  const map = {
    DRAFT: { bg: "#F7FAFC", color: "#718096", label: "Draft" },
    PUBLISHED: { bg: "#E6F4EA", color: "#38A169", label: "Published" },
    ARCHIVED: { bg: "#FED7D7", color: "#E53E3E", label: "Archived" },
=======
import { adminGetExamTemplates } from "../../../services";

const getStatusBadge = (status) => {
  const map = {
    ACTIVE: { bg: "#E6F4EA", color: "#38A169", label: "Active" },
    DRAFT: { bg: "#F7FAFC", color: "#718096", label: "Draft" },
    ARCHIVED: { bg: "#FED7D7", color: "#E53E3E", label: "Archived" },
    PUBLISHED: { bg: "#EBF4FF", color: "#3182CE", label: "Published" },
>>>>>>> Stashed changes
  };
  const s = map[status] || map.DRAFT;
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
      {s.label}
    </Badge>
  );
};

export const ExamTemplatesPage = () => {
  const history = useHistory();
<<<<<<< Updated upstream
  const toast = useToast();
  const { resource, handleFetchResource } = useFetch();
  const [actionLoading, setActionLoading] = useState(null);
=======
  const { resource, handleFetchResource } = useFetch();
>>>>>>> Stashed changes

  const fetcher = useCallback(async () => {
    const { templates, totalDocumentsCount } = await adminGetExamTemplates();
    return { templates, totalDocumentsCount };
  }, []);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const templates = resource.data?.templates ?? [];
<<<<<<< Updated upstream
  const publishedCount = templates.filter((t) => t.status === "PUBLISHED").length;
  const draftCount = templates.filter((t) => t.status === "DRAFT").length;
  const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

  const handleArchive = async (templateId) => {
    setActionLoading(templateId + "_archive");
    try {
      const { message } = await adminArchiveExamTemplate(templateId);
      toast({ description: message, position: "top", status: "success" });
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ description: err.message, position: "top", status: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (templateId) => {
    setActionLoading(templateId + "_delete");
    try {
      const { message } = await adminPermanentDeleteExamTemplate(templateId);
      toast({ description: message, position: "top", status: "success" });
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ description: err.message, position: "top", status: "error" });
    } finally {
      setActionLoading(null);
    }
  };

=======
  const activeCount = templates.filter((t) => t.status === "ACTIVE").length;
  const draftCount = templates.filter((t) => t.status === "DRAFT").length;
  const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

>>>>>>> Stashed changes
  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="30px">
        <Heading as="h2" size="lg" color="#1A202C">
          Exam Templates
        </Heading>
        <Flex gap="12px">
          <Button
            onClick={() =>
              history.push("/admin/exam-templates/question-banks/create")
            }
            style={{
              backgroundColor: "white",
              color: "#6b006b",
              border: "1px solid #6b006b",
            }}
          >
            Create Question Bank
          </Button>
          <Button
            onClick={() => history.push("/admin/exam-templates/create")}
            style={{ backgroundColor: "#6b006b", color: "white" }}
          >
            <Flex alignItems="center" gap="8px">
              <FaPlus size="12px" /> Create Template
            </Flex>
          </Button>
        </Flex>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap="20px" mb="30px">
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Total Templates
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? (
              <Spinner size="sm" />
            ) : (
              (resource.data?.totalDocumentsCount ?? 0)
            )}
          </Text>
          <Text fontSize="13px" color="#38A169" mt="8px">
            +5.3% this month
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
<<<<<<< Updated upstream
            Published Templates
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : publishedCount}
=======
            Active Templates
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : activeCount}
>>>>>>> Stashed changes
          </Text>
          <Text fontSize="13px" color="#718096" mt="8px">
            In use
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Draft Templates
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : draftCount}
          </Text>
          <Text fontSize="13px" color="#718096" mt="8px">
            Pending publish
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Total Usage Count
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : totalUsage}
          </Text>
          <Text fontSize="13px" color="#38A169" mt="8px">
            Avg 12.5/template
          </Text>
        </Box>
      </Grid>

      {/* Table */}
      <Box bg="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
        <Flex
          gap="16px"
          p="20px"
          borderBottom="1px solid #E2E8F0"
          alignItems="center"
        >
          <InputGroup width="300px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="#A0AEC0" />
            </InputLeftElement>
            <Input type="text" placeholder="Search templates..." />
          </InputGroup>
          <Select
            id="statusFilter"
            placeholder="All statuses"
            options={[
<<<<<<< Updated upstream
              { label: "Draft", value: "DRAFT" },
              { label: "Published", value: "PUBLISHED" },
=======
              { label: "Active", value: "ACTIVE" },
              { label: "Draft", value: "DRAFT" },
>>>>>>> Stashed changes
              { label: "Archived", value: "ARCHIVED" },
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
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Template ID
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Template Name
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Course
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Questions
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Total Marks
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Duration
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Status
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Usage
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                    width="80px"
                  >
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {templates.map((t) => (
                  <Tr key={t.templateId} _hover={{ bg: "#FAFAFA" }}>
                    <Td fontSize="14px" color="#6b006b" fontWeight="500">
                      {t.templateId}
                    </Td>
                    <Td fontSize="14px" color="#1A202C" fontWeight="500">
                      {t.templateName}
                    </Td>
                    <Td fontSize="14px" color="#4A5568">
                      {t.courseName}
                    </Td>
                    <Td fontSize="14px" color="#1A202C">
                      {t.questionsCount}
                    </Td>
                    <Td fontSize="14px" color="#1A202C">
                      {t.totalMarks}
                    </Td>
                    <Td fontSize="14px" color="#1A202C">
                      {t.durationMinutes} min
                    </Td>
                    <Td>{getStatusBadge(t.status)}</Td>
                    <Td fontSize="14px" color="#1A202C">
                      {t.usageCount}x
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
<<<<<<< Updated upstream
                        <MenuList minWidth="160px">
=======
                        <MenuList minWidth="140px">
>>>>>>> Stashed changes
                          <MenuItem
                            onClick={() =>
                              history.push(
                                `/admin/exam-templates/${t.templateId}`,
                              )
                            }
                          >
                            View Details
                          </MenuItem>
<<<<<<< Updated upstream
                          {t.status === "PUBLISHED" && (
                            <MenuItem
                              onClick={() =>
                                history.push(
                                  `/admin/exam-templates/${t.templateId}`,
                                )
                              }
                            >
                              Generate Paper
                            </MenuItem>
                          )}
                          {(t.status === "DRAFT" || t.status === "PUBLISHED") && (
                            <>
                              <MenuDivider />
                              <MenuItem
                                color="#E53E3E"
                                isDisabled={actionLoading === t.templateId + "_archive"}
                                onClick={() => handleArchive(t.templateId)}
                              >
                                Archive
                              </MenuItem>
                            </>
                          )}
                          {t.status === "ARCHIVED" && (
                            <>
                              <MenuDivider />
                              <MenuItem
                                color="#E53E3E"
                                isDisabled={actionLoading === t.templateId + "_delete"}
                                onClick={() => handlePermanentDelete(t.templateId)}
                              >
                                Permanent Delete
                              </MenuItem>
                            </>
                          )}
=======
                          <MenuItem
                            onClick={() =>
                              history.push(
                                `/admin/exam-templates/${t.templateId}/generate`,
                              )
                            }
                          >
                            Generate Paper
                          </MenuItem>
>>>>>>> Stashed changes
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Flex
          justifyContent="flex-end"
          alignItems="center"
          p="20px"
          borderTop="1px solid #E2E8F0"
          gap="20px"
        >
          <Text fontSize="14px" fontWeight="600" color="#1A202C">
            Showing {templates.length} of{" "}
            {resource.data?.totalDocumentsCount ?? 0} templates
          </Text>
          <Flex gap="8px">
            <IconButton
              variant="ghost"
              size="sm"
              icon={<FaChevronLeft />}
              aria-label="Previous page"
            />
            <Text fontSize="14px" color="#A0AEC0" alignSelf="center">
              1
            </Text>
            <IconButton
              variant="ghost"
              size="sm"
              icon={<FaChevronRight />}
              aria-label="Next page"
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export const ExamTemplatesPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamTemplatesPage {...props} />} />
);

export default ExamTemplatesPageRoute;
