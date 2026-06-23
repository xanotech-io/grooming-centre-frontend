import React, { useCallback, useEffect } from "react";
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
import {
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import { adminGetFeedbackMarkups } from "../../../services";

const MARKUP_TYPE_COLOR = {
  HIGHLIGHT: { bg: "#FEFCBF", color: "#B7791F" },
  TEXT_COMMENT: { bg: "#EBF4FF", color: "#3182CE" },
  ANNOTATION: { bg: "#F0FFF4", color: "#38A169" },
};

const STATUS_MAP = {
  Published: { bg: "#E6F4EA", color: "#38A169" },
  Draft: { bg: "#F7FAFC", color: "#718096" },
  Resolved: { bg: "#EBF4FF", color: "#3182CE" },
};

const getStatusBadge = (status) => {
  const s = STATUS_MAP[status] || STATUS_MAP.Draft;
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
      {status}
    </Badge>
  );
};

const getTypeBadge = (type) => {
  const t = MARKUP_TYPE_COLOR[type] || { bg: "#F7FAFC", color: "#718096" };
  return (
    <Badge
      bg={t.bg}
      color={t.color}
      px="8px"
      py="2px"
      borderRadius="8px"
      textTransform="none"
      fontSize="12px"
    >
      {type?.replace("_", " ")}
    </Badge>
  );
};

export const FeedbackMarkupPage = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { markups, totalDocumentsCount } = await adminGetFeedbackMarkups();
    return { markups, totalDocumentsCount };
  }, []);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const markups = resource.data?.markups ?? [];
  const totalMarkups = markups.length;
  const highlightCount = markups.filter(
    (m) => m.markupType === "HIGHLIGHT",
  ).length;
  const commentCount = markups.filter(
    (m) => m.markupType === "TEXT_COMMENT",
  ).length;
  const resolvedCount = markups.filter((m) => m.status === "Resolved").length;

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Feedback Markup</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="30px">
        <Heading as="h2" size="lg" color="#1A202C">
          Feedback Markup
        </Heading>
        <Button
          onClick={() =>
            history.push("/admin/feedback-markup/review/submission-uuid-001")
          }
          style={{ backgroundColor: "#6b006b", color: "white" }}
        >
          <Flex alignItems="center" gap="8px">
            <FaPlus size="12px" /> New Markup
          </Flex>
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap="20px" mb="30px">
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Total Markups
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : totalMarkups}
          </Text>
          <Text fontSize="13px" color="#38A169" mt="8px">
            All document types
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Highlights
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : highlightCount}
          </Text>
          <Text fontSize="13px" color="#718096" mt="8px">
            HIGHLIGHT type
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Text Comments
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : commentCount}
          </Text>
          <Text fontSize="13px" color="#718096" mt="8px">
            TEXT_COMMENT type
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Resolved
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#6b006b">
            {resource.loading ? <Spinner size="sm" /> : resolvedCount}
          </Text>
          <Text fontSize="13px" color="#718096" mt="8px">
            Student acted on feedback
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
            <Input type="text" placeholder="Search markups..." />
          </InputGroup>
          <Select
            id="statusFilter"
            placeholder="All statuses"
            options={[
              { label: "Published", value: "Published" },
              { label: "Draft", value: "Draft" },
              { label: "Resolved", value: "Resolved" },
            ]}
          />
          <Select
            id="typeFilter"
            placeholder="All types"
            options={[
              { label: "Highlight", value: "HIGHLIGHT" },
              { label: "Text Comment", value: "TEXT_COMMENT" },
              { label: "Annotation", value: "ANNOTATION" },
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
                    Markup ID
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Reviewer
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Student
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Document Type
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Markup Type
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
                    Timestamp
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
                {markups.map((m) => (
                  <Tr key={m.markupId} _hover={{ bg: "#FAFAFA" }}>
                    <Td fontSize="14px" color="#6b006b" fontWeight="500">
                      {m.markupId}
                    </Td>
                    <Td fontSize="14px" color="#1A202C">
                      {m.reviewer}
                    </Td>
                    <Td fontSize="14px" color="#4A5568">
                      {m.studentId}
                    </Td>
                    <Td fontSize="14px" color="#1A202C">
                      {m.documentType}
                    </Td>
                    <Td>{getTypeBadge(m.markupType)}</Td>
                    <Td>{getStatusBadge(m.status)}</Td>
                    <Td fontSize="13px" color="#718096">
                      {m.timestamp
                        ? new Date(m.timestamp).toLocaleDateString()
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
                        <MenuList minWidth="140px">
                          <MenuItem
                            onClick={() =>
                              history.push(
                                `/admin/feedback-markup/review/${m.submissionId}`,
                              )
                            }
                          >
                            View & Review
                          </MenuItem>
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
            Showing {markups.length} of{" "}
            {resource.data?.totalDocumentsCount ?? 0} markups
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
    </AdminMainAreaWrapper>
  );
};

export const FeedbackMarkupPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <FeedbackMarkupPage {...props} />} />
);

export default FeedbackMarkupPageRoute;
