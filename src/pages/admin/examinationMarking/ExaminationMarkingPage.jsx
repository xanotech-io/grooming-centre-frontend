import React, { useCallback, useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
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
  Badge,
  Spinner,
  InputGroup,
  InputLeftElement,
  Input,
  Progress,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading, Select } from "../../../components";
import { useFetch } from "../../../hooks";
import { adminGetMarkingJobs } from "../../../services";

const getStatusBadge = (status) => {
  switch (status) {
    case "Completed":
      return (
        <Badge
          bg="#E6F4EA"
          color="#38A169"
          px="12px"
          py="4px"
          borderRadius="12px"
          textTransform="none"
          fontWeight="500"
        >
          Completed
        </Badge>
      );
    case "In Progress":
      return (
        <Badge
          bg="#EBF4FF"
          color="#3182CE"
          px="12px"
          py="4px"
          borderRadius="12px"
          textTransform="none"
          fontWeight="500"
        >
          In Progress
        </Badge>
      );
    case "Pending":
    case "PENDING":
      return (
        <Badge
          bg="#FFF5EA"
          color="#DD6B20"
          px="12px"
          py="4px"
          borderRadius="12px"
          textTransform="none"
          fontWeight="500"
        >
          Pending
        </Badge>
      );
    default:
      return (
        <Badge px="12px" py="4px" borderRadius="12px" textTransform="none">
          {status}
        </Badge>
      );
  }
};

const getModeBadge = (mode) => {
  switch (mode) {
    case "Automatic":
    case "AUTOMATIC":
      return (
        <Badge
          bg="#E9D8FD"
          color="#6B46C1"
          px="10px"
          py="2px"
          borderRadius="8px"
          textTransform="none"
          fontWeight="500"
          fontSize="12px"
        >
          Automatic
        </Badge>
      );
    case "Manual":
    case "MANUAL":
      return (
        <Badge
          bg="#FEEBC8"
          color="#C05621"
          px="10px"
          py="2px"
          borderRadius="8px"
          textTransform="none"
          fontWeight="500"
          fontSize="12px"
        >
          Manual
        </Badge>
      );
    case "Hybrid":
    case "HYBRID":
      return (
        <Badge
          bg="#BEE3F8"
          color="#2C5282"
          px="10px"
          py="2px"
          borderRadius="8px"
          textTransform="none"
          fontWeight="500"
          fontSize="12px"
        >
          Hybrid
        </Badge>
      );
    default:
      return (
        <Badge px="10px" py="2px" borderRadius="8px" textTransform="none">
          {mode}
        </Badge>
      );
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const ExaminationMarkingPage = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { jobs, totalDocumentsCount } = await adminGetMarkingJobs();
    return { jobs, totalDocumentsCount };
  }, []);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const jobs = resource.data?.jobs ?? [];
  const completedCount = jobs.filter((j) => j.status === "Completed").length;
  const pendingCount = jobs.filter(
    (j) => j.status === "Pending" || j.status === "PENDING",
  ).length;
  const inProgressCount = jobs.filter((j) => j.status === "In Progress").length;

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        marginBottom="30px"
      >
        <Heading as="h2" size="lg" color="#1A202C">
          Examination Paper Marking
        </Heading>
        <Button
          style={{ backgroundColor: "#6b006b", color: "white" }}
          onClick={() => history.push("/admin/examination-marking/create")}
          leftIcon={<FaPlus />}
        >
          Create Marking Job
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap="20px" marginBottom="30px">
        <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">
            Total Jobs
          </Text>
          <Text fontSize="28px" fontWeight="700" color="#1A202C" mb="8px">
            {resource.loading ? <Spinner size="sm" /> : jobs.length}
          </Text>
          <Text fontSize="13px" color="#718096">
            All marking jobs
          </Text>
        </Box>
        <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">
            Completed
          </Text>
          <Text fontSize="28px" fontWeight="700" color="#38A169" mb="8px">
            {resource.loading ? <Spinner size="sm" /> : completedCount}
          </Text>
          <Text fontSize="13px" color="#718096">
            Fully marked
          </Text>
        </Box>
        <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">
            In Progress
          </Text>
          <Text fontSize="28px" fontWeight="700" color="#3182CE" mb="8px">
            {resource.loading ? <Spinner size="sm" /> : inProgressCount}
          </Text>
          <Text fontSize="13px" color="#718096">
            Currently marking
          </Text>
        </Box>
        <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
          <Text fontSize="14px" fontWeight="600" color="#1A202C" mb="12px">
            Pending
          </Text>
          <Text fontSize="28px" fontWeight="700" color="#DD6B20" mb="8px">
            {resource.loading ? <Spinner size="sm" /> : pendingCount}
          </Text>
          <Text fontSize="13px" color="#718096">
            Not yet started
          </Text>
        </Box>
      </Grid>

      {/* Table */}
      <Box bg="white" borderRadius="8px" shadow="sm" border="1px solid #E2E8F0">
        <Flex gap="16px" padding="20px" borderBottom="1px solid #E2E8F0">
          <InputGroup width="300px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray" />
            </InputLeftElement>
            <Input type="text" placeholder="Search jobs..." />
          </InputGroup>
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" alignItems="center" padding="60px">
            <Spinner size="lg" color="#6b006b" />
          </Flex>
        )}

        {resource.err && (
          <Flex justifyContent="center" alignItems="center" padding="60px">
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
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Job ID
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Exam Title
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Mode
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Evaluated By
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Progress
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Deadline
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                  >
                    Status
                  </Th>
                  <Th
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="600"
                    color="#4A5568"
                    width="80px"
                  >
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {jobs.map((job, idx) => {
                  const progressPct =
                    job.totalPapers > 0
                      ? Math.round((job.markedPapers / job.totalPapers) * 100)
                      : 0;
                  return (
                    <Tr key={idx}>
                      <Td color="#1A202C" fontWeight="500">
                        {job.jobId}
                      </Td>
                      <Td color="#1A202C">{job.examTitle}</Td>
                      <Td>{getModeBadge(job.markingMode)}</Td>
                      <Td color="#1A202C">{job.evaluatedBy}</Td>
                      <Td>
                        <Box>
                          <Text fontSize="12px" color="#718096" mb="4px">
                            {job.markedPapers}/{job.totalPapers} papers
                          </Text>
                          <Progress
                            value={progressPct}
                            size="sm"
                            colorScheme="purple"
                            borderRadius="4px"
                          />
                        </Box>
                      </Td>
                      <Td color="#1A202C">{formatDate(job.deadline)}</Td>
                      <Td>{getStatusBadge(job.status)}</Td>
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
                          <MenuList minWidth="130px">
                            <MenuItem
                              onClick={() =>
                                history.push(
                                  `/admin/examination-marking/jobs/${job.jobId}`,
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
          padding="20px"
          borderTop="1px solid #E2E8F0"
          gap="20px"
        >
          <Flex alignItems="center" gap="10px">
            <Text fontSize="14px" color="#4A5568">
              Rows per page
            </Text>
            <Box width="80px">
              <Select
                defaultValue="10"
                id="rows"
                options={[{ label: "10", value: "10" }]}
              />
            </Box>
          </Flex>
          <Text fontSize="14px" fontWeight="600" color="#1A202C">
            Showing {jobs.length} out of{" "}
            {resource.data?.totalDocumentsCount ?? 0} items
          </Text>
          <Flex gap="10px">
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

export const ExaminationMarkingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExaminationMarkingPage {...props} />} />
);

export default ExaminationMarkingPageRoute;
