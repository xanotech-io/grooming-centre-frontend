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
  Badge,
  Spinner,
  Progress,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { FaArrowLeft, FaClone, FaTrash, FaEdit } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useFetch } from "../../../hooks";
import {
  adminGetQuestionTemplateById,
  adminUpdateQuestionTemplate,
  adminDuplicateQuestionTemplate,
  adminDeleteQuestionTemplate,
  adminGetTemplateUsageStats,
} from "../../../services";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getStatusBadge = (status) => {
  const map = {
    ACTIVE: { bg: "#E6F4EA", color: "#38A169", label: "Active" },
    INACTIVE: { bg: "#F7FAFC", color: "#718096", label: "Inactive" },
  };
  const s = map[status] || { bg: "gray.100", color: "gray.600", label: status };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="12px"
      py="5px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="13px"
    >
      {s.label}
    </Badge>
  );
};

const MetaField = ({ label, value }) => (
  <Box>
    <Text fontSize="12px" color="gray.500" mb="3px">
      {label}
    </Text>
    <Text fontSize="13px" fontWeight="500" color="gray.800">
      {value || "—"}
    </Text>
  </Box>
);

const StatBox = ({ label, value, color }) => (
  <Box bg="#F7FAFC" borderRadius="8px" p="16px" textAlign="center">
    <Text fontSize="24px" fontWeight="700" color={color || "gray.800"}>
      {value ?? "—"}
    </Text>
    <Text fontSize="12px" color="gray.500" mt="3px">
      {label}
    </Text>
  </Box>
);

// ---------------------------------------------------------------------------
// Edit Modal
// ---------------------------------------------------------------------------

const EditTemplateModal = ({ isOpen, onClose, template, onUpdated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    templateName: template?.templateName || "",
    questionCount: template?.questionCount || 0,
    totalMarks: template?.totalMarks || 0,
    status: template?.status || "ACTIVE",
  });

  useEffect(() => {
    if (template) {
      setForm({
        templateName: template.templateName,
        questionCount: template.questionCount,
        totalMarks: template.totalMarks,
        status: template.status,
      });
    }
  }, [template]);

  const handleSubmit = async () => {
    if (!form.templateName.trim()) {
      toast({
        title: "Template name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const { message } = await adminUpdateQuestionTemplate(
        template.templateId,
        {
          ...form,
          questionCount: Number(form.questionCount),
          totalMarks: Number(form.totalMarks),
        },
      );
      toast({
        title: message || "Template updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onUpdated();
      onClose();
    } catch {
      toast({
        title: "Failed to update template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Edit Template</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="4px">
          <Grid gap="14px">
            <FormControl>
              <FormLabel fontSize="13px">Template Name *</FormLabel>
              <input
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
                value={form.templateName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, templateName: e.target.value }))
                }
              />
            </FormControl>
            <Grid templateColumns="1fr 1fr" gap="12px">
              <FormControl>
                <FormLabel fontSize="13px">Total Questions</FormLabel>
                <NumberInput
                  size="sm"
                  min={0}
                  value={form.questionCount}
                  onChange={(val) =>
                    setForm((p) => ({ ...p, questionCount: val }))
                  }
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px">Total Marks</FormLabel>
                <NumberInput
                  size="sm"
                  min={0}
                  value={form.totalMarks}
                  onChange={(val) =>
                    setForm((p) => ({ ...p, totalMarks: val }))
                  }
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </Grid>
            <FormControl>
              <FormLabel fontSize="13px">Status</FormLabel>
              <Select
                size="sm"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </FormControl>
          </Grid>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Delete Confirm Modal
// ---------------------------------------------------------------------------

const DeleteModal = ({ isOpen, onClose, templateName, onDeleted }) => {
  const toast = useToast();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { templateId } = useParams();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { message } = await adminDeleteQuestionTemplate(templateId);
      toast({
        title: message || "Template deleted",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      onDeleted();
      onClose();
      history.push("/admin/question-bank-templates");
    } catch {
      toast({
        title: "Failed to delete template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Delete Template</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Are you sure you want to delete <strong>{templateName}</strong>?
            This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDelete} isLoading={loading}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const QuestionBankTemplateDetailsPage = () => {
  const history = useHistory();
  const { templateId } = useParams();
  const toast = useToast();

  const { resource, handleFetchResource } = useFetch();
  const [usageStats, setUsageStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const editModal = useDisclosure();
  const deleteModal = useDisclosure();

  const fetcher = useCallback(async () => {
    const { template } = await adminGetQuestionTemplateById(templateId);
    return { template };
  }, [templateId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  // Load usage stats
  useEffect(() => {
    setLoadingStats(true);
    adminGetTemplateUsageStats(templateId)
      .then((data) => setUsageStats(data))
      .catch(() =>
        toast({
          title: "Could not load usage stats",
          status: "warning",
          duration: 3000,
          isClosable: true,
        }),
      )
      .finally(() => setLoadingStats(false));
  }, [templateId, toast]);

  const template = resource.data?.template;

  const handleDuplicate = async () => {
    try {
      const { message, template: copy } =
        await adminDuplicateQuestionTemplate(templateId);
      toast({
        title: message || "Template duplicated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (copy?.newTemplateId)
        history.push(`/admin/question-bank-templates/${copy.newTemplateId}`);
    } catch {
      toast({
        title: "Failed to duplicate template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const refresh = () => handleFetchResource({ fetcher });

  // Question distribution rows
  const qDistEntries = template?.questionDistribution
    ? Object.entries(template.questionDistribution)
    : [];

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/question-bank-templates">Question Bank Templates</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Template Details</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex alignItems="center" gap="12px" mb="24px" flexWrap="wrap">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/question-bank-templates")}
        />
        <Heading fontSize="22px" fontWeight="600" flex="1">
          Template Details
        </Heading>
        <Flex gap="8px">
          <Button
            size="sm"
            leftIcon={<FaClone />}
            variant="outline"
            colorScheme="teal"
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            leftIcon={<FaEdit />}
            colorScheme="blue"
            onClick={editModal.onOpen}
          >
            Edit
          </Button>
          <Button
            size="sm"
            leftIcon={<FaTrash />}
            colorScheme="red"
            variant="outline"
            onClick={deleteModal.onOpen}
          >
            Delete
          </Button>
        </Flex>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" py="60px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}
      {resource.err && (
        <Flex justifyContent="center" py="60px">
          <Text color="red.500">Failed to load template details.</Text>
        </Flex>
      )}

      {!resource.loading && !resource.err && template && (
        <>
          {/* Info Card */}
          <Box
            bg="white"
            borderRadius="8px"
            border="1px solid #E2E8F0"
            p="24px"
            mb="20px"
          >
            <Flex
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              gap="12px"
              mb="20px"
            >
              <Box>
                <Flex alignItems="center" gap="10px" flexWrap="wrap">
                  <Text fontSize="20px" fontWeight="700" color="gray.800">
                    {template.templateName}
                  </Text>
                  {template.isDefault && (
                    <Badge
                      bg="#EBF4FF"
                      color="#3182CE"
                      px="10px"
                      py="3px"
                      borderRadius="10px"
                      fontSize="12px"
                      textTransform="none"
                    >
                      Default
                    </Badge>
                  )}
                </Flex>
                <Text fontSize="13px" color="gray.500" mt="4px">
                  {template.courseName}
                </Text>
              </Box>
              {getStatusBadge(template.status)}
            </Flex>

            {/* Key Stats */}
            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
              gap="16px"
              mb="20px"
            >
              <StatBox label="Total Questions" value={template.questionCount} />
              <StatBox label="Total Marks" value={template.totalMarks} />
              <StatBox
                label="Times Used"
                value={template.usageCount}
                color="#3182CE"
              />
              <StatBox
                label="Avg Marks/Question"
                value={
                  template.questionCount > 0
                    ? (template.totalMarks / template.questionCount).toFixed(1)
                    : "—"
                }
                color="#DD6B20"
              />
            </Grid>

            <Divider mb="20px" />

            {/* Metadata */}
            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
              gap="16px"
            >
              <MetaField label="Template ID" value={template.templateId} />
              <MetaField label="Course ID" value={template.courseId} />
              <MetaField label="Created By" value={template.createdBy} />
              <MetaField
                label="Created At"
                value={
                  template.createdAt
                    ? new Date(template.createdAt).toLocaleString()
                    : "—"
                }
              />
              <MetaField
                label="Last Updated"
                value={
                  template.lastUpdated
                    ? new Date(template.lastUpdated).toLocaleString()
                    : "—"
                }
              />
            </Grid>
          </Box>

          {/* Question Distribution */}
          {qDistEntries.length > 0 && (
            <Box
              bg="white"
              borderRadius="8px"
              border="1px solid #E2E8F0"
              overflow="hidden"
              mb="20px"
            >
              <Box px="20px" py="14px" borderBottom="1px solid #E2E8F0">
                <Text fontSize="15px" fontWeight="600" color="gray.700">
                  Question Distribution
                </Text>
              </Box>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      <Th
                        py="10px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                      >
                        Question Type
                      </Th>
                      <Th
                        py="10px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                        isNumeric
                      >
                        Count
                      </Th>
                      <Th
                        py="10px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                        isNumeric
                      >
                        Marks / Question
                      </Th>
                      <Th
                        py="10px"
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                        isNumeric
                      >
                        Subtotal Marks
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {qDistEntries.map(([type, val]) => {
                      const count = typeof val === "object" ? val.count : val;
                      const marksPerQ =
                        typeof val === "object" ? val.marksPerQuestion : "—";
                      const subtotal =
                        typeof val === "object" &&
                        val.count &&
                        val.marksPerQuestion
                          ? val.count * val.marksPerQuestion
                          : "—";
                      return (
                        <Tr key={type} _hover={{ bg: "#F7FAFC" }}>
                          <Td py="10px">
                            <Badge
                              bg="#EBF4FF"
                              color="#3182CE"
                              px="10px"
                              py="3px"
                              borderRadius="10px"
                              fontSize="12px"
                              textTransform="none"
                            >
                              {type}
                            </Badge>
                          </Td>
                          <Td py="10px" fontSize="13px" isNumeric>
                            {count}
                          </Td>
                          <Td py="10px" fontSize="13px" isNumeric>
                            {marksPerQ}
                          </Td>
                          <Td
                            py="10px"
                            fontSize="13px"
                            fontWeight="500"
                            isNumeric
                          >
                            {subtotal}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Difficulty Distribution */}
          {template.difficultyDistribution && (
            <Box
              bg="white"
              borderRadius="8px"
              border="1px solid #E2E8F0"
              p="20px"
              mb="20px"
            >
              <Text fontSize="15px" fontWeight="600" color="gray.700" mb="16px">
                Difficulty Distribution
              </Text>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap="16px"
              >
                {[
                  { key: "EASY", color: "#38A169", bg: "#E6F4EA" },
                  { key: "MEDIUM", color: "#DD6B20", bg: "#FFF5EA" },
                  { key: "HARD", color: "#E53E3E", bg: "#FED7D7" },
                ].map(({ key, color, bg }) => {
                  const count = template.difficultyDistribution[key] || 0;
                  const total = template.questionCount || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <Box key={key} bg={bg} borderRadius="8px" p="14px">
                      <Flex justifyContent="space-between" mb="6px">
                        <Text fontSize="13px" fontWeight="600" color={color}>
                          {key}
                        </Text>
                        <Text fontSize="13px" fontWeight="700" color={color}>
                          {count}
                        </Text>
                      </Flex>
                      <Progress
                        value={pct}
                        colorScheme={
                          key === "EASY"
                            ? "green"
                            : key === "MEDIUM"
                              ? "orange"
                              : "red"
                        }
                        borderRadius="4px"
                        size="sm"
                      />
                      <Text fontSize="11px" color={color} mt="4px">
                        {pct}% of questions
                      </Text>
                    </Box>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Usage Statistics */}
          <Box
            bg="white"
            borderRadius="8px"
            border="1px solid #E2E8F0"
            overflow="hidden"
          >
            <Box px="20px" py="14px" borderBottom="1px solid #E2E8F0">
              <Text fontSize="15px" fontWeight="600" color="gray.700">
                Usage Statistics
              </Text>
            </Box>

            {loadingStats && (
              <Flex justifyContent="center" py="30px">
                <Spinner size="md" color="blue.400" />
              </Flex>
            )}

            {!loadingStats && usageStats && (
              <Box p="20px">
                {/* Stats grid */}
                <Grid
                  templateColumns={{
                    base: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  }}
                  gap="16px"
                  mb="20px"
                >
                  <StatBox
                    label="Total Uses"
                    value={usageStats.usageStatistics?.totalUses}
                    color="#3182CE"
                  />
                  <StatBox
                    label="This Month"
                    value={usageStats.usageStatistics?.usesThisMonth}
                  />
                  <StatBox
                    label="Last Month"
                    value={usageStats.usageStatistics?.usesLastMonth}
                  />
                  <StatBox
                    label="Avg Questions Generated"
                    value={
                      usageStats.usageStatistics?.averageQuestionsGenerated
                    }
                  />
                </Grid>

                {/* Question Utilization */}
                {usageStats.questionUtilization && (
                  <Box mb="20px">
                    <Text
                      fontSize="13px"
                      fontWeight="600"
                      color="gray.700"
                      mb="10px"
                    >
                      Question Bank Utilization
                    </Text>
                    <Flex justifyContent="space-between" mb="6px">
                      <Text fontSize="13px" color="gray.600">
                        {usageStats.questionUtilization.questionsUsed} of{" "}
                        {usageStats.questionUtilization.totalQuestionsInBank}{" "}
                        questions used
                      </Text>
                      <Text fontSize="13px" fontWeight="600" color="#3182CE">
                        {usageStats.questionUtilization.utilizationRate}%
                      </Text>
                    </Flex>
                    <Progress
                      value={usageStats.questionUtilization.utilizationRate}
                      colorScheme="blue"
                      borderRadius="4px"
                      size="sm"
                    />
                  </Box>
                )}

                <Divider mb="16px" />

                {/* Exams Generated */}
                {usageStats.usageStatistics?.examsGenerated?.length > 0 && (
                  <>
                    <Text
                      fontSize="13px"
                      fontWeight="600"
                      color="gray.700"
                      mb="10px"
                    >
                      Exams Generated
                    </Text>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead bg="#F7FAFC">
                          <Tr>
                            <Th
                              py="10px"
                              color="gray.500"
                              fontSize="12px"
                              fontWeight="600"
                              textTransform="none"
                            >
                              Exam Title
                            </Th>
                            <Th
                              py="10px"
                              color="gray.500"
                              fontSize="12px"
                              fontWeight="600"
                              textTransform="none"
                            >
                              Generated At
                            </Th>
                            <Th
                              py="10px"
                              color="gray.500"
                              fontSize="12px"
                              fontWeight="600"
                              textTransform="none"
                              isNumeric
                            >
                              Students
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {usageStats.usageStatistics.examsGenerated.map(
                            (exam) => (
                              <Tr key={exam.examId} _hover={{ bg: "#F7FAFC" }}>
                                <Td py="10px" fontSize="13px" fontWeight="500">
                                  {exam.examTitle}
                                </Td>
                                <Td py="10px" fontSize="13px" color="gray.600">
                                  {exam.generatedAt
                                    ? new Date(
                                        exam.generatedAt,
                                      ).toLocaleString()
                                    : "—"}
                                </Td>
                                <Td py="10px" fontSize="13px" isNumeric>
                                  {exam.studentCount}
                                </Td>
                              </Tr>
                            ),
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Box>
            )}
          </Box>
        </>
      )}

      {/* Modals */}
      <EditTemplateModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        template={template}
        onUpdated={refresh}
      />
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        templateName={template?.templateName}
        onDeleted={() => {}}
      />
    </Box>
  );
};

export const QuestionBankTemplateDetailsPageRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={(props) => <QuestionBankTemplateDetailsPage {...props} />}
  />
);

export default QuestionBankTemplateDetailsPageRoute;
