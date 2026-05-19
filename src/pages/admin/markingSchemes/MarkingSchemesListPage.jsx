import React, { useEffect, useState, useCallback } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Badge,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import { FaSearch, FaLock, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { capitalizeFirstLetter } from "../../../utils";
import { listMarkingSchemes, deleteMarkingScheme } from "../../../services";
import { useApp } from "../../../contexts";

const PAGE_LIMIT = 20;

const statusColorMap = {
  draft: { bg: "gray.100", color: "gray.600" },
  active: { bg: "green.100", color: "green.700" },
  inactive: { bg: "red.100", color: "red.700" },
};

const MarkingSchemesListPage = () => {
  const history = useHistory();
  const toast = useToast();
  const { state, getOneMetadata } = useApp();

  const userRole = getOneMetadata("userRoles", state.user?.userRoleId);
  const isAdmin = /admin/i.test(userRole?.name);
  const isInstructor = /instructor/i.test(userRole?.name);

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_LIMIT,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      };
      const response = await listMarkingSchemes(params);
      const data = response?.data ?? response;
      const items = data?.markingSchemes ?? data?.schemes ?? data?.data ?? data ?? [];
      const total = data?.totalPages ?? data?.total
        ? Math.ceil((data?.total ?? data?.totalDocumentsCount ?? 0) / PAGE_LIMIT)
        : data?.totalPages ?? 1;

      setSchemes(Array.isArray(items) ? items : []);
      setTotalPages(total || 1);
    } catch (err) {
      console.error("Failed to fetch marking schemes", err);
      toast({
        title: "Error",
        description: "Failed to load marking schemes.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, toast]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const handleDelete = async (scheme) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${scheme.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteMarkingScheme(scheme.id);
      toast({
        title: "Deleted",
        description: `"${scheme.name}" has been deleted.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      fetchSchemes();
    } catch (err) {
      console.error("Failed to delete marking scheme", err);
      toast({
        title: "Error",
        description: "Failed to delete marking scheme. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const hasFilters = debouncedSearch.trim() !== "" || statusFilter !== "";

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("");
    setPage(1);
  };

  return (
    <AdminMainAreaWrapper>
      <Box marginX="22px" marginY="30px">
        {/* Page header */}
        <Flex
          justifyContent="space-between"
          alignItems={{ base: "flex-start", md: "center" }}
          flexDirection={{ base: "column", md: "row" }}
          gap={4}
          marginBottom="24px"
        >
          <Heading as="h1" fontSize="heading.h3">
            Marking Schemes
          </Heading>

          {(isAdmin || isInstructor) && (
            <Button
              leftIcon={<FaPlus />}
              onClick={() => history.push("/admin/marking-schemes/new")}
            >
              Create Scheme
            </Button>
          )}
        </Flex>

        {/* Filter bar */}
        <Flex gap={3} marginBottom="20px" flexWrap="wrap">
          <InputGroup maxWidth="320px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="#6b006b" />
            </InputLeftElement>
            <Input
              placeholder="Search marking schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderColor="gray.300"
              _focus={{ borderColor: "#6b006b", boxShadow: "0 0 0 1px #6b006b" }}
            />
          </InputGroup>

          <Select
            maxWidth="180px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            borderColor="gray.300"
            _focus={{ borderColor: "#6b006b", boxShadow: "0 0 0 1px #6b006b" }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              color="#6b006b"
              _hover={{ bg: "purple.50" }}
            >
              Clear Filters
            </Button>
          )}
        </Flex>

        {/* Table area */}
        {loading ? (
          <Flex justify="center" align="center" minHeight="240px">
            <Spinner size="lg" color="#6b006b" thickness="3px" />
          </Flex>
        ) : schemes.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            minHeight="240px"
            gap={4}
          >
            {hasFilters ? (
              <>
                <Text color="gray.500" fontSize="md">
                  No schemes match your filters.
                </Text>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  borderColor="#6b006b"
                  color="#6b006b"
                  _hover={{ bg: "purple.50" }}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <Text color="gray.500" fontSize="md">
                  No marking schemes yet.
                </Text>
                {(isAdmin || isInstructor) && (
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={() => history.push("/admin/marking-schemes/new")}
                    bg="#6b006b"
                    color="white"
                    _hover={{ bg: "#590059" }}
                  >
                    Create Your First Scheme
                  </Button>
                )}
              </>
            )}
          </Flex>
        ) : (
          <>
            <TableContainer
              borderRadius="8px"
              border="1px solid"
              borderColor="gray.200"
              overflowX="auto"
            >
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th
                      color="gray.600"
                      fontWeight="600"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Name
                    </Th>
                    <Th
                      color="gray.600"
                      fontWeight="600"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Examination
                    </Th>
                    <Th
                      color="gray.600"
                      fontWeight="600"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Status
                    </Th>
                    <Th
                      color="gray.600"
                      fontWeight="600"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Locked
                    </Th>
                    <Th
                      color="gray.600"
                      fontWeight="600"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      textAlign="right"
                    >
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {schemes.map((scheme) => {
                    const statusKey = (scheme.status ?? "").toLowerCase();
                    const statusColors = statusColorMap[statusKey] ?? {
                      bg: "gray.100",
                      color: "gray.600",
                    };

                    return (
                      <Tr
                        key={scheme.id}
                        _hover={{ bg: "gray.50" }}
                        transition="background 0.15s"
                      >
                        {/* Name */}
                        <Td>
                          <Text
                            fontWeight="500"
                            color="gray.800"
                            cursor="pointer"
                            _hover={{ color: "#6b006b", textDecoration: "underline" }}
                            onClick={() =>
                              history.push(`/admin/marking-schemes/${scheme.id}`)
                            }
                          >
                            {capitalizeFirstLetter(scheme.name ?? "")}
                          </Text>
                        </Td>

                        {/* Examination */}
                        <Td>
                          <Text color="gray.700">
                            {scheme.examination?.title ??
                              scheme.examinationTitle ??
                              scheme.examination ??
                              "—"}
                          </Text>
                        </Td>

                        {/* Status */}
                        <Td>
                          <Badge
                            bg={statusColors.bg}
                            color={statusColors.color}
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="600"
                            textTransform="capitalize"
                          >
                            {capitalizeFirstLetter(scheme.status ?? "")}
                          </Badge>
                        </Td>

                        {/* Locked */}
                        <Td>
                          {scheme.isLocked ? (
                            <Flex align="center" gap={1} color="gray.600">
                              <FaLock size="12px" />
                              <Text fontSize="sm">Yes</Text>
                            </Flex>
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              No
                            </Text>
                          )}
                        </Td>

                        {/* Actions */}
                        <Td textAlign="right">
                          <Menu placement="bottom-end">
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                              aria-label="Actions"
                              color="gray.500"
                              _hover={{ bg: "gray.100", color: "#6b006b" }}
                            />
                            <MenuList minW="140px" shadow="md" borderRadius="8px">
                              {/* View — always visible */}
                              <MenuItem
                                fontSize="sm"
                                onClick={() =>
                                  history.push(`/admin/marking-schemes/${scheme.id}`)
                                }
                                _hover={{ bg: "purple.50", color: "#6b006b" }}
                              >
                                View
                              </MenuItem>

                              {/* Edit — only if not locked and admin/instructor */}
                              {!scheme.isLocked && (isAdmin || isInstructor) && (
                                <MenuItem
                                  fontSize="sm"
                                  onClick={() =>
                                    history.push(`/admin/marking-schemes/${scheme.id}`)
                                  }
                                  _hover={{ bg: "purple.50", color: "#6b006b" }}
                                >
                                  Edit
                                </MenuItem>
                              )}

                              {/* Delete — only if not locked and admin/instructor */}
                              {!scheme.isLocked && (isAdmin || isInstructor) && (
                                <MenuItem
                                  fontSize="sm"
                                  color="red.500"
                                  onClick={() => handleDelete(scheme)}
                                  _hover={{ bg: "red.50", color: "red.600" }}
                                >
                                  Delete
                                </MenuItem>
                              )}
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Flex
              justify="space-between"
              align="center"
              marginTop="16px"
              flexWrap="wrap"
              gap={3}
            >
              <Text fontSize="sm" color="gray.500">
                Page {page} of {totalPages}
              </Text>

              <Flex gap={2} align="center">
                <IconButton
                  icon={<FaChevronLeft />}
                  size="sm"
                  variant="outline"
                  borderColor="gray.300"
                  aria-label="Previous page"
                  isDisabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  _hover={{ borderColor: "#6b006b", color: "#6b006b" }}
                />
                <IconButton
                  icon={<FaChevronRight />}
                  size="sm"
                  variant="outline"
                  borderColor="gray.300"
                  aria-label="Next page"
                  isDisabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  _hover={{ borderColor: "#6b006b", color: "#6b006b" }}
                />
              </Flex>
            </Flex>
          </>
        )}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const MarkingSchemesListPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MarkingSchemesListPage {...props} />} />
);

export default MarkingSchemesListPageRoute;
