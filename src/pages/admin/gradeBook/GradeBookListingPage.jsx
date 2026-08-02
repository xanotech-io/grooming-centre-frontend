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
  Progress,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import { adminGetGradeBooks } from "../../../services";

const getStatusBadge = (status) => {
  const map = {
    Published: { bg: "#E6F4EA", color: "#38A169" },
    Draft: { bg: "#F7FAFC", color: "#718096" },
    Archived: { bg: "#FED7D7", color: "#E53E3E" },
  };
  const s = map[status] || map.Draft;
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

export const GradeBookListingPage = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { gradeBooks, totalDocumentsCount } = await adminGetGradeBooks();
    return { gradeBooks, totalDocumentsCount };
  }, []);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const gradeBooks = resource.data?.gradeBooks ?? [];
  const publishedCount = gradeBooks.filter(
    (g) => g.status === "Published",
  ).length;
  const draftCount = gradeBooks.filter((g) => g.status === "Draft").length;
  const totalStudents = gradeBooks.reduce(
    (s, g) => s + (g.totalStudents || 0),
    0,
  );

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Grade Book</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="30px">
        <Heading as="h2" size="lg" color="#1A202C">
          Grade Book
        </Heading>
        <Button
          onClick={() => history.push("/admin/grade-book/create")}
          style={{ backgroundColor: "#6b006b", color: "white" }}
        >
          <Flex alignItems="center" gap="8px">
            <FaPlus size="12px" /> Create Grade Book
          </Flex>
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap="20px" mb="30px">
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Total Grade Books
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? (
              <Spinner size="sm" />
            ) : (
              (resource.data?.totalDocumentsCount ?? 0)
            )}
          </Text>
          <Text fontSize="13px" color="#718096" mt="8px">
            All terms
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Published
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#1A202C">
            {resource.loading ? <Spinner size="sm" /> : publishedCount}
          </Text>
          <Text fontSize="13px" color="#38A169" mt="8px">
            Visible to students
          </Text>
        </Box>
        <Box bg="white" p="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="13px" color="#718096" mb="8px">
            Draft
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
            Total Students
          </Text>
          <Text fontSize="32px" fontWeight="700" color="#6b006b">
            {resource.loading ? <Spinner size="sm" /> : totalStudents}
          </Text>
          <Text fontSize="13px" color="#718096" mt="8px">
            Across all books
          </Text>
        </Box>
      </Grid>

      {/* Table */}
      <Box bg="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
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
                    Grade Book ID
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
                    Instructor
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Term
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Students
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="13px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Progress
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
                    width="80px"
                  >
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {gradeBooks.map((g) => {
                  const total =
                    (g.gradedEntries || 0) + (g.pendingEntries || 0);
                  const pct =
                    total > 0
                      ? Math.round(((g.gradedEntries || 0) / total) * 100)
                      : 0;
                  return (
                    <Tr key={g.gradeBookId} _hover={{ bg: "#FAFAFA" }}>
                      <Td fontSize="14px" color="#6b006b" fontWeight="500">
                        {g.gradeBookId}
                      </Td>
                      <Td fontSize="14px" color="#1A202C" fontWeight="500">
                        {g.courseName}
                      </Td>
                      <Td fontSize="14px" color="#4A5568">
                        {g.instructor}
                      </Td>
                      <Td fontSize="14px" color="#4A5568">
                        {g.term}
                      </Td>
                      <Td fontSize="14px" color="#1A202C">
                        {g.totalStudents}
                      </Td>
                      <Td width="160px">
                        <Box>
                          <Flex justifyContent="space-between" mb="4px">
                            <Text fontSize="11px" color="#718096">
                              {g.gradedEntries} / {total} graded
                            </Text>
                            <Text
                              fontSize="11px"
                              color="#1A202C"
                              fontWeight="600"
                            >
                              {pct}%
                            </Text>
                          </Flex>
                          <Progress
                            value={pct}
                            size="xs"
                            colorScheme="purple"
                            borderRadius="4px"
                          />
                        </Box>
                      </Td>
                      <Td>{getStatusBadge(g.status)}</Td>
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
                                  `/admin/grade-book/${g.gradeBookId}`,
                                )
                              }
                            >
                              View Details
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
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
            Showing {gradeBooks.length} of{" "}
            {resource.data?.totalDocumentsCount ?? 0} grade books
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

export const GradeBookListingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeBookListingPage {...props} />} />
);

export default GradeBookListingPageRoute;
