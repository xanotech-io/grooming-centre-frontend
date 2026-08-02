import React, { useCallback, useEffect, useState } from "react";
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
  Badge,
  Spinner,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
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
  Divider,
} from "@chakra-ui/react";
import { FaSearch, FaPlus, FaClone, FaTrash, FaEye } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useFetch } from "../../../hooks";
import {
  adminGetAllQuestionTemplates,
  adminCreateQuestionTemplate,
  adminDuplicateQuestionTemplate,
  adminDeleteQuestionTemplate,
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
      py="4px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="12px"
    >
      {s.label}
    </Badge>
  );
};

const StatCard = ({ label, value, color }) => (
  <Box
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="8px"
    p="20px"
    textAlign="center"
  >
    <Text fontSize="28px" fontWeight="700" color={color || "gray.800"}>
      {value ?? "—"}
    </Text>
    <Text fontSize="12px" color="gray.500" mt="4px">
      {label}
    </Text>
  </Box>
);

// ---------------------------------------------------------------------------
// Create Template Modal
// ---------------------------------------------------------------------------

const QUESTION_TYPES = ["MCQ", "TRUE_FALSE", "FILL_BLANK", "ESSAY"];
const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"];

const CreateTemplateModal = ({ isOpen, onClose, onCreated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    templateName: "",
    courseId: "",
    questionCount: 0,
    totalMarks: 0,
  });
  const [qDist, setQDist] = useState({
    MCQ: 0,
    TRUE_FALSE: 0,
    FILL_BLANK: 0,
    ESSAY: 0,
  });
  const [dDist, setDDist] = useState({ EASY: 0, MEDIUM: 0, HARD: 0 });

  const handleSubmit = async () => {
    if (!form.templateName.trim() || !form.courseId.trim()) {
      toast({
        title: "Template name and Course ID are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const { message } = await adminCreateQuestionTemplate({
        ...form,
        questionCount: Number(form.questionCount),
        totalMarks: Number(form.totalMarks),
        questionDistribution: qDist,
        difficultyDistribution: dDist,
      });
      toast({
        title: message || "Template created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onCreated();
      onClose();
      setForm({
        templateName: "",
        courseId: "",
        questionCount: 0,
        totalMarks: 0,
      });
      setQDist({ MCQ: 0, TRUE_FALSE: 0, FILL_BLANK: 0, ESSAY: 0 });
      setDDist({ EASY: 0, MEDIUM: 0, HARD: 0 });
    } catch {
      toast({
        title: "Failed to create template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Create Question Bank Template</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="4px">
          <Grid templateColumns="1fr 1fr" gap="14px">
            <FormControl gridColumn="1 / -1">
              <FormLabel fontSize="13px">Template Name *</FormLabel>
              <Input
                size="sm"
                value={form.templateName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, templateName: e.target.value }))
                }
                placeholder="e.g. Midterm Exam Template"
              />
            </FormControl>
            <FormControl gridColumn="1 / -1">
              <FormLabel fontSize="13px">Course ID *</FormLabel>
              <Input
                size="sm"
                value={form.courseId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, courseId: e.target.value }))
                }
                placeholder="e.g. course-uuid-123"
              />
            </FormControl>
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
                onChange={(val) => setForm((p) => ({ ...p, totalMarks: val }))}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </Grid>

          <Divider my="16px" />

          <Text fontSize="13px" fontWeight="600" color="gray.700" mb="10px">
            Question Distribution
          </Text>
          <Grid templateColumns="repeat(2, 1fr)" gap="10px">
            {QUESTION_TYPES.map((type) => (
              <FormControl key={type}>
                <FormLabel fontSize="12px" color="gray.600">
                  {type}
                </FormLabel>
                <NumberInput
                  size="sm"
                  min={0}
                  value={qDist[type]}
                  onChange={(val) =>
                    setQDist((p) => ({ ...p, [type]: Number(val) }))
                  }
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            ))}
          </Grid>

          <Divider my="16px" />

          <Text fontSize="13px" fontWeight="600" color="gray.700" mb="10px">
            Difficulty Distribution
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gap="10px">
            {DIFFICULTY_LEVELS.map((level) => (
              <FormControl key={level}>
                <FormLabel fontSize="12px" color="gray.600">
                  {level}
                </FormLabel>
                <NumberInput
                  size="sm"
                  min={0}
                  value={dDist[level]}
                  onChange={(val) =>
                    setDDist((p) => ({ ...p, [level]: Number(val) }))
                  }
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            ))}
          </Grid>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Create Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Duplicate Confirm Modal
// ---------------------------------------------------------------------------

const DuplicateModal = ({ isOpen, onClose, template, onDuplicated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const { message } = await adminDuplicateQuestionTemplate(
        template.templateId,
      );
      toast({
        title: message || "Template duplicated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDuplicated();
      onClose();
    } catch {
      toast({
        title: "Failed to duplicate template",
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
        <ModalHeader fontSize="16px">Duplicate Template</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Duplicate <strong>{template?.templateName}</strong>? A copy will be
            created with "(Copy)" appended to the name.
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleDuplicate}
            isLoading={loading}
          >
            Duplicate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Delete Confirm Modal
// ---------------------------------------------------------------------------

const DeleteModal = ({ isOpen, onClose, template, onDeleted }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { message } = await adminDeleteQuestionTemplate(
        template.templateId,
      );
      toast({
        title: message || "Template deleted",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      onDeleted();
      onClose();
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
            Are you sure you want to delete{" "}
            <strong>{template?.templateName}</strong>? This action cannot be
            undone.
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

const QuestionBankTemplatesPage = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const createModal = useDisclosure();
  const duplicateModal = useDisclosure();
  const deleteModal = useDisclosure();

  const fetcher = useCallback(async () => {
    const { templates, pagination } = await adminGetAllQuestionTemplates({
      page,
      limit: 10,
      status: statusFilter || undefined,
    });
    return { templates, pagination };
  }, [page, statusFilter]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const templates = resource.data?.templates || [];
  const pagination = resource.data?.pagination || {};

  const displayed = search
    ? templates.filter(
        (t) =>
          t.templateName.toLowerCase().includes(search.toLowerCase()) ||
          t.courseName.toLowerCase().includes(search.toLowerCase()),
      )
    : templates;

  const totalTemplates = pagination.totalItems || 0;
  const activeCount = templates.filter((t) => t.status === "ACTIVE").length;
  const inactiveCount = templates.filter((t) => t.status === "INACTIVE").length;
  const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

  const refresh = () => handleFetchResource({ fetcher });

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem isCurrentPage><Link href="#">Question Bank Templates</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb="24px"
        flexWrap="wrap"
        gap="12px"
      >
        <Heading fontSize="22px" fontWeight="600">
          Question Bank Templates
        </Heading>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="blue"
          size="sm"
          onClick={createModal.onOpen}
        >
          Create Template
        </Button>
      </Flex>

      {/* Stats */}
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap="16px"
        mb="24px"
      >
        <StatCard label="Total Templates" value={totalTemplates} />
        <StatCard label="Active" value={activeCount} color="#38A169" />
        <StatCard label="Inactive" value={inactiveCount} color="#718096" />
        <StatCard label="Total Uses" value={totalUsage} color="#3182CE" />
      </Grid>

      {/* Filters */}
      <Flex gap="12px" mb="16px" flexWrap="wrap">
        <InputGroup size="sm" maxW="280px">
          <InputLeftElement>
            <FaSearch color="#A0AEC0" />
          </InputLeftElement>
          <Input
            placeholder="Search by name or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Select
          size="sm"
          maxW="180px"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </Flex>

      {/* Table */}
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="8px"
        overflow="hidden"
      >
        {resource.loading && (
          <Flex justifyContent="center" py="40px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        )}
        {resource.err && (
          <Flex justifyContent="center" py="40px">
            <Text color="red.500">Failed to load templates.</Text>
          </Flex>
        )}
        {!resource.loading && !resource.err && (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Template Name
                  </Th>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Course
                  </Th>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                    isNumeric
                  >
                    Questions
                  </Th>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                    isNumeric
                  >
                    Total Marks
                  </Th>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                    isNumeric
                  >
                    Uses
                  </Th>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Status
                  </Th>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Created By
                  </Th>
                  <Th
                    py="12px"
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                    w="100px"
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {displayed.length === 0 && (
                  <Tr>
                    <Td colSpan={8} py="30px" textAlign="center">
                      <Text color="gray.400" fontSize="14px">
                        No templates found.
                      </Text>
                    </Td>
                  </Tr>
                )}
                {displayed.map((t) => (
                  <Tr
                    key={t.templateId}
                    _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                    onClick={() =>
                      history.push(
                        `/admin/question-bank-templates/${t.templateId}`,
                      )
                    }
                  >
                    <Td py="12px">
                      <Text fontSize="13px" fontWeight="500" color="gray.800">
                        {t.templateName}
                      </Text>
                      {t.isDefault && (
                        <Badge
                          bg="#EBF4FF"
                          color="#3182CE"
                          fontSize="10px"
                          px="6px"
                          py="1px"
                          borderRadius="6px"
                          ml="0"
                          mt="2px"
                          textTransform="none"
                        >
                          Default
                        </Badge>
                      )}
                    </Td>
                    <Td py="12px" fontSize="13px" color="gray.600">
                      {t.courseName}
                    </Td>
                    <Td py="12px" fontSize="13px" isNumeric>
                      {t.questionCount}
                    </Td>
                    <Td py="12px" fontSize="13px" isNumeric>
                      {t.totalMarks}
                    </Td>
                    <Td
                      py="12px"
                      fontSize="13px"
                      fontWeight="500"
                      isNumeric
                      color="#3182CE"
                    >
                      {t.usageCount}
                    </Td>
                    <Td py="12px">{getStatusBadge(t.status)}</Td>
                    <Td py="12px" fontSize="13px" color="gray.600">
                      {t.createdBy}
                    </Td>
                    <Td py="12px">
                      <Flex gap="4px" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          aria-label="View"
                          icon={<FaEye />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() =>
                            history.push(
                              `/admin/question-bank-templates/${t.templateId}`,
                            )
                          }
                        />
                        <IconButton
                          aria-label="Duplicate"
                          icon={<FaClone />}
                          size="xs"
                          variant="ghost"
                          colorScheme="teal"
                          onClick={() => {
                            setSelectedTemplate(t);
                            duplicateModal.onOpen();
                          }}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<FaTrash />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setSelectedTemplate(t);
                            deleteModal.onOpen();
                          }}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {!resource.loading && pagination.totalPages > 1 && (
          <Flex
            justifyContent="space-between"
            alignItems="center"
            px="20px"
            py="12px"
            borderTop="1px solid #E2E8F0"
          >
            <Text fontSize="13px" color="gray.500">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.totalItems} total)
            </Text>
            <Flex gap="8px">
              <Button
                size="xs"
                variant="outline"
                isDisabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <Button
                size="xs"
                variant="outline"
                isDisabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Box>

      {/* Modals */}
      <CreateTemplateModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onCreated={refresh}
      />
      <DuplicateModal
        isOpen={duplicateModal.isOpen}
        onClose={duplicateModal.onClose}
        template={selectedTemplate}
        onDuplicated={refresh}
      />
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        template={selectedTemplate}
        onDeleted={refresh}
      />
    </Box>
  );
};

export const QuestionBankTemplatesPageRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={(props) => <QuestionBankTemplatesPage {...props} />}
  />
);

export default QuestionBankTemplatesPageRoute;
