import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Select,
  useToast,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link, EntityCombobox } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import { adminGetCourseListing, gradeBookV2GetByCourse, gradeBookV2List } from "../../../services";

const getStatusBadge = (status) => {
  const map = {
    active: { bg: "#E6F4EA", color: "#38A169", label: "Active" },
    archived: { bg: "#F7FAFC", color: "#718096", label: "Archived" },
  };
  const s = map[status] || { bg: "gray.100", color: "gray.600", label: status || "—" };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="10px"
      py="3px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="12px"
    >
      {s.label}
    </Badge>
  );
};

const GradeBookV2ListingPage = () => {
  const history = useHistory();
  const toast = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [searching, setSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { total, gradebooks } = await gradeBookV2List({
      page,
      limit,
      status: statusFilter || undefined,
    });
    return { total, gradebooks };
  }, [page, statusFilter]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const gradebooks = resource.data?.gradebooks || [];
  const total = resource.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchCourses = useCallback(async (query) => {
    const { courses } = await adminGetCourseListing({ search: query });
    return courses.map((c) => ({ id: c.id, label: c.title }));
  }, []);

  const handleSelectCourse = async (opt) => {
    setSelectedCourseId(opt?.id ?? "");
    if (!opt) return;
    setSearching(true);
    try {
      const { gradeBook } = await gradeBookV2GetByCourse(opt.id);
      history.push(`/admin/grade-book-v2/${gradeBook.id}`);
    } catch (err) {
      const msg =
        err?.response?.status === 404
          ? "No grade book found for this course. Create one first."
          : "Failed to fetch grade book.";
      toast({ title: msg, status: "error", duration: 3000, isClosable: true });
    } finally {
      setSearching(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Advanced Grade Book</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      <Flex justifyContent="space-between" alignItems="center" mb="30px">
        <Heading fontSize="22px" fontWeight="600">
          Advanced Grade Book
        </Heading>
        <Button
          leftIcon={<FaPlus />}
          onClick={() => history.push("/admin/grade-book-v2/create")}
        >
          Create Grade Book
        </Button>
      </Flex>

      {/* Find by Course */}
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="8px"
        p="32px"
        mb="20px"
      >
        <Flex alignItems="center" gap="8px" mb="16px">
          <FaSearch color="#6b006b" />
          <Text fontSize="16px" fontWeight="600" color="gray.700">
            Find Grade Book by Course
          </Text>
        </Flex>
        <Text fontSize="13px" color="gray.500" mb="16px">
          Search for a course to open the grade book currently attached to it.
        </Text>
        <Flex gap="12px" maxW="480px" alignItems="center">
          <Box flex={1}>
            <EntityCombobox
              fetchFn={fetchCourses}
              value={selectedCourseId}
              onSelect={handleSelectCourse}
              placeholder="Search course by title…"
            />
          </Box>
          {searching && <Spinner size="sm" color="purple.500" />}
        </Flex>
      </Box>

      {/* Filters */}
      <Flex gap="12px" mb="16px" flexWrap="wrap" alignItems="center">
        <Text fontSize="15px" fontWeight="600" color="gray.700">
          All Grade Books
        </Text>
        <Select
          size="sm"
          maxW="180px"
          ml="auto"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>
      </Flex>

      {/* Table */}
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="8px"
        overflow="hidden"
        mb="20px"
      >
        {resource.loading && (
          <Flex justifyContent="center" py="40px">
            <Spinner size="lg" color="purple.500" />
          </Flex>
        )}
        {resource.err && (
          <Flex justifyContent="center" py="40px">
            <Text color="red.500">Failed to load grade books.</Text>
          </Flex>
        )}
        {!resource.loading && !resource.err && (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">
                    Title
                  </Th>
                  <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">
                    Status
                  </Th>
                  <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none" isNumeric>
                    Courses
                  </Th>
                  <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">
                    Created By
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {gradebooks.length === 0 && (
                  <Tr>
                    <Td colSpan={4} py="30px" textAlign="center">
                      <Text color="gray.400" fontSize="14px">
                        No grade books found.
                      </Text>
                    </Td>
                  </Tr>
                )}
                {gradebooks.map((g) => (
                  <Tr
                    key={g.id}
                    _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                    onClick={() => history.push(`/admin/grade-book-v2/${g.id}`)}
                  >
                    <Td py="12px" fontSize="13px" fontWeight="500" color="gray.800">
                      {g.title}
                    </Td>
                    <Td py="12px">{getStatusBadge(g.active === false ? "archived" : "active")}</Td>
                    <Td py="12px" fontSize="13px" isNumeric>
                      {g.courseCount ?? 0}
                    </Td>
                    <Td py="12px" fontSize="13px" color="gray.600">
                      {g.creator ? `${g.creator.firstName || ""} ${g.creator.lastName || ""}`.trim() : "—"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {!resource.loading && totalPages > 1 && (
          <Flex
            justifyContent="space-between"
            alignItems="center"
            px="20px"
            py="12px"
            borderTop="1px solid #E2E8F0"
          >
            <Text fontSize="13px" color="gray.500">
              Page {page} of {totalPages} ({total} total)
            </Text>
            <Flex gap="8px">
              <Button size="xs" variant="outline" isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <Button size="xs" variant="outline" isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Box>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const GradeBookV2ListingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeBookV2ListingPage {...props} />} />
);

export default GradeBookV2ListingPageRoute;
