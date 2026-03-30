import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
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
  Progress,
  useToast,
} from "@chakra-ui/react";
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetMarkingJobDetails,
  adminGetExaminationPapers,
  adminGetMarkingJobStatistics,
  adminSubmitMarkedPapers,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const getPaperStatusBadge = (status) => {
  switch (status) {
    case "MARKED":
      return (
        <Badge
          bg="#E6F4EA"
          color="#38A169"
          px="10px"
          py="2px"
          borderRadius="8px"
          textTransform="none"
          fontWeight="500"
          fontSize="12px"
        >
          Marked
        </Badge>
      );
    case "SUBMITTED":
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
          Submitted
        </Badge>
      );
    case "FINAL":
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
          Final
        </Badge>
      );
    default:
      return (
        <Badge
          bg="#FFF5EA"
          color="#DD6B20"
          px="10px"
          py="2px"
          borderRadius="8px"
          textTransform="none"
          fontWeight="500"
          fontSize="12px"
        >
          Pending
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

export const MarkingJobDetailsPage = () => {
  const history = useHistory();
  const { jobId } = useParams();
  const toast = useToast();

  const { resource: jobResource, handleFetchResource: fetchJob } = useFetch();
  const { resource: papersResource, handleFetchResource: fetchPapers } =
    useFetch();
  const { resource: statsResource, handleFetchResource: fetchStats } =
    useFetch();

  const [selectedPaperIds, setSelectedPaperIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobFetcher = useCallback(async () => {
    const { job } = await adminGetMarkingJobDetails(jobId);
    return job;
  }, [jobId]);

  const papersFetcher = useCallback(async () => {
    const { papers, pagination } = await adminGetExaminationPapers(jobId);
    return { papers, pagination };
  }, [jobId]);

  const statsFetcher = useCallback(async () => {
    const { statistics } = await adminGetMarkingJobStatistics(jobId);
    return statistics;
  }, [jobId]);

  useEffect(() => {
    fetchJob({ fetcher: jobFetcher });
    fetchPapers({ fetcher: papersFetcher });
    fetchStats({ fetcher: statsFetcher });
  }, [
    fetchJob,
    jobFetcher,
    fetchPapers,
    papersFetcher,
    fetchStats,
    statsFetcher,
  ]);

  const job = jobResource.data;
  const papers = papersResource.data?.papers ?? [];
  const stats = statsResource.data;

  const progressPct =
    job?.totalPapers > 0
      ? Math.round((job.markedPapers / job.totalPapers) * 100)
      : 0;

  const handleTogglePaper = (paperId) => {
    setSelectedPaperIds((prev) =>
      prev.includes(paperId)
        ? prev.filter((id) => id !== paperId)
        : [...prev, paperId],
    );
  };

  const handleSubmitPapers = async () => {
    if (selectedPaperIds.length === 0) {
      toast({
        description: "Select at least one paper to submit.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { message } = await adminSubmitMarkedPapers(jobId, {
        paperIds: selectedPaperIds,
      });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      setSelectedPaperIds([]);
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      paddingX={{ base: "20px", lg: "40px" }}
      paddingY="30px"
      bg="#FAFAFA"
      minHeight="100vh"
    >
      {/* Go Back */}
      <Flex
        alignItems="center"
        cursor="pointer"
        onClick={() => history.goBack()}
        mb="24px"
        width="max-content"
      >
        <Box
          border="1px solid #E2E8F0"
          borderRadius="4px"
          p="6px"
          mr="12px"
          bg="white"
        >
          <FaArrowLeft color="#1A202C" />
        </Box>
        <Text fontWeight="500" color="#1A202C">
          Go Back
        </Text>
      </Flex>

      {jobResource.loading && (
        <Flex justifyContent="center" alignItems="center" minHeight="50vh">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!jobResource.loading && (
        <>
          {/* Header */}
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            mb="32px"
          >
            <Box>
              <Heading as="h1" size="lg" color="#1A202C" mb="8px">
                {job?.examTitle ?? jobId}
              </Heading>
              <Flex gap="24px" flexWrap="wrap">
                <Text color="#718096" fontSize="14px">
                  Job ID:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {job?.jobId}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Mode:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {job?.markingMode}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Evaluated By:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {job?.evaluatedBy}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Deadline:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {formatDate(job?.deadline)}
                  </Text>
                </Text>
              </Flex>
            </Box>
            {selectedPaperIds.length > 0 && (
              <Button
                style={{ backgroundColor: "#6b006b", color: "white" }}
                isLoading={isSubmitting}
                onClick={handleSubmitPapers}
              >
                Submit {selectedPaperIds.length} Paper
                {selectedPaperIds.length > 1 ? "s" : ""}
              </Button>
            )}
          </Flex>

          {/* Progress Bar */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="24px">
            <Flex justifyContent="space-between" mb="8px">
              <Text fontSize="14px" fontWeight="600" color="#1A202C">
                Marking Progress
              </Text>
              <Text fontSize="14px" fontWeight="600" color="#6b006b">
                {progressPct}%
              </Text>
            </Flex>
            <Progress
              value={progressPct}
              size="md"
              colorScheme="purple"
              borderRadius="4px"
              mb="8px"
            />
            <Text fontSize="13px" color="#718096">
              {job?.markedPapers} of {job?.totalPapers} papers marked
            </Text>
          </Box>

          {/* Stats Grid */}
          {statsResource.data && (
            <Grid
              templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }}
              gap="20px"
              mb="30px"
            >
              <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
                <Text fontSize="13px" color="#718096" mb="6px">
                  Average Score
                </Text>
                <Text fontSize="26px" fontWeight="700" color="#1A202C">
                  {stats?.averageScore ?? "-"}
                </Text>
              </Box>
              <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
                <Text fontSize="13px" color="#718096" mb="6px">
                  Highest Score
                </Text>
                <Text fontSize="26px" fontWeight="700" color="#38A169">
                  {stats?.highestScore ?? "-"}
                </Text>
              </Box>
              <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
                <Text fontSize="13px" color="#718096" mb="6px">
                  Lowest Score
                </Text>
                <Text fontSize="26px" fontWeight="700" color="#E53E3E">
                  {stats?.lowestScore ?? "-"}
                </Text>
              </Box>
              <Box bg="white" padding="24px" borderRadius="8px" shadow="sm">
                <Text fontSize="13px" color="#718096" mb="6px">
                  Flagged Papers
                </Text>
                <Text fontSize="26px" fontWeight="700" color="#DD6B20">
                  {stats?.flaggedPapers ?? 0}
                </Text>
              </Box>
            </Grid>
          )}

          {/* Papers Table */}
          <Box
            bg="white"
            borderRadius="8px"
            shadow="sm"
            border="1px solid #E2E8F0"
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              padding="20px"
              borderBottom="1px solid #E2E8F0"
            >
              <Text fontSize="16px" fontWeight="600" color="#1A202C">
                Examination Papers
              </Text>
            </Flex>

            {papersResource.loading && (
              <Flex justifyContent="center" padding="40px">
                <Spinner size="lg" color="#6b006b" />
              </Flex>
            )}

            {!papersResource.loading && (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th width="50px">
                        <input type="checkbox" />
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="14px"
                        fontWeight="600"
                        color="#4A5568"
                      >
                        Paper ID
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="14px"
                        fontWeight="600"
                        color="#4A5568"
                      >
                        Student Name
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="14px"
                        fontWeight="600"
                        color="#4A5568"
                      >
                        Student ID
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="14px"
                        fontWeight="600"
                        color="#4A5568"
                      >
                        Submitted
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
                      >
                        Total Marks
                      </Th>
                      <Th
                        textTransform="none"
                        fontSize="14px"
                        fontWeight="600"
                        color="#4A5568"
                      >
                        Marked By
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
                    {papers.map((paper, idx) => (
                      <Tr key={idx}>
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedPaperIds.includes(paper.paperId)}
                            onChange={() => handleTogglePaper(paper.paperId)}
                            disabled={paper.markingStatus !== "MARKED"}
                          />
                        </Td>
                        <Td color="#1A202C" fontWeight="500">
                          {paper.paperId}
                        </Td>
                        <Td color="#1A202C">{paper.studentName}</Td>
                        <Td color="#1A202C">{paper.studentId}</Td>
                        <Td color="#1A202C">
                          {formatDate(paper.submissionDate)}
                        </Td>
                        <Td>{getPaperStatusBadge(paper.markingStatus)}</Td>
                        <Td color="#1A202C">{paper.totalMarks ?? "-"}</Td>
                        <Td color="#1A202C">{paper.markedBy ?? "-"}</Td>
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
                              {paper.markingStatus === "PENDING" && (
                                <MenuItem
                                  onClick={() =>
                                    history.push(
                                      `/admin/examination-marking/jobs/${jobId}/papers/${paper.paperId}/mark`,
                                    )
                                  }
                                >
                                  Mark Paper
                                </MenuItem>
                              )}
                              <MenuItem>View Paper</MenuItem>
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
              padding="20px"
              borderTop="1px solid #E2E8F0"
              gap="20px"
            >
              <Text fontSize="14px" fontWeight="600" color="#1A202C">
                Showing {papers.length} papers
              </Text>
              <Flex gap="10px">
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<FaChevronLeft />}
                  aria-label="Previous"
                />
                <Text fontSize="14px" color="#A0AEC0" alignSelf="center">
                  1
                </Text>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<FaChevronRight />}
                  aria-label="Next"
                />
              </Flex>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
};

export const MarkingJobDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MarkingJobDetailsPage {...props} />} />
);

export default MarkingJobDetailsPageRoute;
