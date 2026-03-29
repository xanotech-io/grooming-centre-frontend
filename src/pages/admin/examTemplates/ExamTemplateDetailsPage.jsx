import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Badge,
  Spinner,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { FaArrowLeft, FaFileAlt, FaChartBar, FaRandom } from "react-icons/fa";
import { Button, Heading, Input, Select } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetExamTemplateById,
  adminGetTemplateStatistics,
  adminGenerateExamPaper,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const QUESTION_TYPE_COLOR = {
  MCQ: { bg: "#EBF4FF", color: "#3182CE" },
  TRUE_FALSE: { bg: "#F0FFF4", color: "#38A169" },
  ESSAY: { bg: "#FFFAF0", color: "#DD6B20" },
  FILL_IN_BLANK: { bg: "#FAF5FF", color: "#805AD5" },
  MATCHING: { bg: "#FFF5F5", color: "#E53E3E" },
};

export const ExamTemplateDetailsPage = () => {
  const history = useHistory();
  const { templateId } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { resource: templateResource, handleFetchResource: fetchTemplate } =
    useFetch();
  const { resource: statsResource, handleFetchResource: fetchStats } =
    useFetch();

  const [studentId, setStudentId] = useState("");
  const [examId, setExamId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const templateFetcher = useCallback(async () => {
    const { template } = await adminGetExamTemplateById(templateId);
    return template;
  }, [templateId]);

  const statsFetcher = useCallback(async () => {
    const { statistics } = await adminGetTemplateStatistics(templateId);
    return statistics;
  }, [templateId]);

  useEffect(() => {
    fetchTemplate({ fetcher: templateFetcher });
    fetchStats({ fetcher: statsFetcher });
  }, [fetchTemplate, templateFetcher, fetchStats, statsFetcher]);

  const template = templateResource.data;
  const stats = statsResource.data;

  const handleGenerate = async () => {
    if (!studentId.trim() || !examId.trim()) {
      toast({
        description: "Student ID and Exam ID are required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const { message } = await adminGenerateExamPaper(templateId, {
        studentId,
        examId,
      });
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      onClose();
      setStudentId("");
      setExamId("");
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    } finally {
      setIsGenerating(false);
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

      {templateResource.loading && (
        <Flex justifyContent="center" alignItems="center" minHeight="60vh">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!templateResource.loading && template && (
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
              <Flex alignItems="center" gap="12px" mb="8px">
                <Heading as="h1" size="lg" color="#1A202C" m={0}>
                  {template.templateName}
                </Heading>
                <Badge
                  bg={template.status === "ACTIVE" ? "#E6F4EA" : "#F7FAFC"}
                  color={template.status === "ACTIVE" ? "#38A169" : "#718096"}
                  px="12px"
                  py="4px"
                  borderRadius="12px"
                  textTransform="none"
                  fontWeight="500"
                >
                  {template.status}
                </Badge>
              </Flex>
              <Flex gap="24px" flexWrap="wrap">
                <Text color="#718096" fontSize="14px">
                  ID:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {template.templateId}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Course:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {template.courseName}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Created by:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {template.createdBy}
                  </Text>
                </Text>
                <Text color="#718096" fontSize="14px">
                  Used:{" "}
                  <Text as="span" color="#1A202C" fontWeight="600">
                    {template.usageCount}x
                  </Text>
                </Text>
              </Flex>
            </Box>
            <Button
              onClick={onOpen}
              style={{ backgroundColor: "#6b006b", color: "white" }}
            >
              <Flex alignItems="center" gap="8px">
                <FaFileAlt size="14px" /> Generate Paper
              </Flex>
            </Button>
          </Flex>

          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap="28px"
            alignItems="start"
          >
            {/* Left: Template Details */}
            <Box>
              {/* Quick Stats */}
              <Grid templateColumns="repeat(3, 1fr)" gap="16px" mb="24px">
                {[
                  { label: "Total Questions", value: template.questionsCount },
                  { label: "Total Marks", value: template.totalMarks },
                  {
                    label: "Duration",
                    value: `${template.durationMinutes} min`,
                  },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    bg="white"
                    p="20px"
                    borderRadius="8px"
                    shadow="sm"
                    textAlign="center"
                  >
                    <Text fontSize="12px" color="#718096" mb="6px">
                      {label}
                    </Text>
                    <Text fontSize="24px" fontWeight="700" color="#6b006b">
                      {value}
                    </Text>
                  </Box>
                ))}
              </Grid>

              {/* Sections Table */}
              <Box bg="white" borderRadius="8px" shadow="sm" mb="24px">
                <Text
                  fontSize="15px"
                  fontWeight="600"
                  color="#1A202C"
                  p="20px"
                  borderBottom="1px solid #E2E8F0"
                >
                  Sections ({template.sections?.length ?? 0})
                </Text>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th textTransform="none" color="#4A5568">
                          Section Name
                        </Th>
                        <Th textTransform="none" color="#4A5568">
                          Type
                        </Th>
                        <Th textTransform="none" color="#4A5568">
                          Questions
                        </Th>
                        <Th textTransform="none" color="#4A5568">
                          Marks Each
                        </Th>
                        <Th textTransform="none" color="#4A5568">
                          Total Marks
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {template.sections?.map((sec) => {
                        const typeStyle = QUESTION_TYPE_COLOR[
                          sec.questionType
                        ] || { bg: "#F7FAFC", color: "#718096" };
                        return (
                          <Tr key={sec.sectionId}>
                            <Td fontSize="13px" color="#1A202C">
                              {sec.sectionName}
                            </Td>
                            <Td>
                              <Badge
                                bg={typeStyle.bg}
                                color={typeStyle.color}
                                px="8px"
                                py="2px"
                                borderRadius="8px"
                                textTransform="none"
                                fontSize="12px"
                              >
                                {sec.questionType}
                              </Badge>
                            </Td>
                            <Td fontSize="13px" color="#1A202C">
                              {sec.questionCount}
                            </Td>
                            <Td fontSize="13px" color="#1A202C">
                              {sec.marksPerQuestion}
                            </Td>
                            <Td
                              fontSize="13px"
                              fontWeight="600"
                              color="#6b006b"
                            >
                              {sec.questionCount * sec.marksPerQuestion}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Randomization & Display Config */}
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px">
                <Box bg="white" borderRadius="8px" p="20px" shadow="sm">
                  <Flex alignItems="center" gap="8px" mb="16px">
                    <FaRandom color="#6b006b" />
                    <Text fontSize="14px" fontWeight="600" color="#1A202C">
                      Randomization
                    </Text>
                  </Flex>
                  {[
                    {
                      label: "Shuffle Questions",
                      value: template.randomizationConfig?.shuffleQuestions,
                    },
                    {
                      label: "Shuffle Options",
                      value: template.randomizationConfig?.shuffleOptions,
                    },
                    {
                      label: "Randomize Section Order",
                      value:
                        template.randomizationConfig?.randomizeSectionOrder,
                    },
                  ].map(({ label, value }) => (
                    <Flex
                      key={label}
                      justifyContent="space-between"
                      alignItems="center"
                      mb="10px"
                    >
                      <Text fontSize="13px" color="#4A5568">
                        {label}
                      </Text>
                      <Switch
                        isChecked={!!value}
                        isReadOnly
                        colorScheme="purple"
                        size="sm"
                      />
                    </Flex>
                  ))}
                </Box>
                <Box bg="white" borderRadius="8px" p="20px" shadow="sm">
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color="#1A202C"
                    mb="16px"
                  >
                    Display Config
                  </Text>
                  {[
                    {
                      label: "Qs Per Page",
                      value: template.displayConfig?.questionsPerPage,
                    },
                    {
                      label: "Back Navigation",
                      value: template.displayConfig?.allowBackNavigation,
                    },
                    {
                      label: "Question Skipping",
                      value: template.displayConfig?.allowQuestionSkipping,
                    },
                    {
                      label: "Show Timer",
                      value: template.displayConfig?.showTimer,
                    },
                    {
                      label: "Allow Calculator",
                      value: template.displayConfig?.allowCalculator,
                    },
                  ].map(({ label, value }) => (
                    <Flex
                      key={label}
                      justifyContent="space-between"
                      alignItems="center"
                      mb="10px"
                    >
                      <Text fontSize="13px" color="#4A5568">
                        {label}
                      </Text>
                      {typeof value === "boolean" ? (
                        <Switch
                          isChecked={value}
                          isReadOnly
                          colorScheme="purple"
                          size="sm"
                        />
                      ) : (
                        <Text fontSize="13px" fontWeight="600" color="#1A202C">
                          {value}
                        </Text>
                      )}
                    </Flex>
                  ))}
                </Box>
              </Grid>
            </Box>

            {/* Right: Statistics */}
            <Box>
              <Box bg="white" borderRadius="8px" p="24px" shadow="sm">
                <Flex alignItems="center" gap="8px" mb="20px">
                  <FaChartBar color="#6b006b" />
                  <Text fontSize="15px" fontWeight="600" color="#1A202C">
                    Usage Statistics
                  </Text>
                </Flex>

                {statsResource.loading ? (
                  <Flex justifyContent="center" p="20px">
                    <Spinner size="md" color="#6b006b" />
                  </Flex>
                ) : stats ? (
                  <>
                    {[
                      {
                        label: "Created This Month",
                        value: stats.templatesCreatedThisMonth,
                      },
                      {
                        label: "Created Last Month",
                        value: stats.templatesCreatedLastMonth,
                      },
                      {
                        label: "Growth",
                        value: `+${stats.creationGrowthPercent}%`,
                        color: "#38A169",
                      },
                      {
                        label: "Usage Frequency",
                        value: stats.usageFrequency,
                        color: "#6b006b",
                      },
                      {
                        label: "Avg Usage Count",
                        value: stats.averageUsageCount,
                      },
                      {
                        label: "Update Compliance",
                        value: `${stats.updateComplianceRate}%`,
                      },
                    ].map(({ label, value, color }) => (
                      <Flex
                        key={label}
                        justifyContent="space-between"
                        alignItems="center"
                        mb="12px"
                      >
                        <Text fontSize="13px" color="#718096">
                          {label}
                        </Text>
                        <Text
                          fontSize="14px"
                          fontWeight="600"
                          color={color || "#1A202C"}
                        >
                          {value}
                        </Text>
                      </Flex>
                    ))}
                  </>
                ) : null}
              </Box>
            </Box>
          </Grid>
        </>
      )}

      {/* Generate Paper Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" color="#1A202C">
            Generate Examination Paper
          </ModalHeader>
          <Divider />
          <ModalBody py="24px">
            <Text fontSize="13px" color="#718096" mb="20px">
              A randomized paper will be generated from{" "}
              <Text as="span" fontWeight="600" color="#6b006b">
                {template?.templateName}
              </Text>
              .
            </Text>
            <Box mb="16px">
              <Input
                label="Student ID"
                id="studentId"
                placeholder="e.g. student-uuid-123"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </Box>
            <Input
              label="Exam ID"
              id="examId"
              placeholder="e.g. exam-uuid-456"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            />
          </ModalBody>
          <Divider />
          <ModalFooter gap="12px">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              isLoading={isGenerating}
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export const ExamTemplateDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamTemplateDetailsPage {...props} />} />
);

export default ExamTemplateDetailsPageRoute;
