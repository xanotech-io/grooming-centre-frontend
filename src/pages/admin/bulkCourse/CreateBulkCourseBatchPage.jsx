import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Divider,
  Spinner,
  IconButton,
  useToast,
  Select as ChakraSelect,
} from "@chakra-ui/react";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Button, Heading } from "../../../components";
import {
  adminGetCourseTemplates,
  adminCreateBulkCourseBatch,
} from "../../../services";

const EMPTY_COURSE = { title: "", description: "", credits: 3 };

const CreateBulkCourseBatchPage = () => {
  const history = useHistory();
  const toast = useToast();

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [departmentId, setDepartmentId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [courses, setCourses] = useState([{ ...EMPTY_COURSE }]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const { templates: list } = await adminGetCourseTemplates();
      setTemplates(list);
    } catch {
      toast({
        title: "Failed to load templates",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingTemplates(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addCourse = () => setCourses((prev) => [...prev, { ...EMPTY_COURSE }]);

  const removeCourse = (index) =>
    setCourses((prev) => prev.filter((_, i) => i !== index));

  const updateCourse = (index, field, value) => {
    setCourses((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentId.trim()) {
      toast({
        title: "Department ID is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const validCourses = courses.filter((c) => c.title.trim());
    if (validCourses.length === 0) {
      toast({
        title: "Add at least one course with a title",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const { message } = await adminCreateBulkCourseBatch({
        departmentId: departmentId.trim(),
        templateId: templateId || undefined,
        courses: validCourses.map((c) => ({
          title: c.title.trim(),
          description: c.description.trim(),
          credits: Number(c.credits) || 3,
        })),
      });

      toast({
        title: message || "Batch created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      history.push("/admin/bulk-courses");
    } catch {
      toast({
        title: "Failed to create batch",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/bulk-courses")}
        />
        <Heading fontSize="22px" fontWeight="600">
          Create Bulk Course Batch
        </Heading>
      </Flex>

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        borderRadius="8px"
        border="1px solid #E2E8F0"
        p="24px"
        maxW="780px"
      >
        {/* Batch Info */}
        <Text fontSize="16px" fontWeight="600" color="gray.700" mb="16px">
          Batch Configuration
        </Text>

        <Flex gap="16px" mb="16px" direction={{ base: "column", md: "row" }}>
          <FormControl isRequired flex="1">
            <FormLabel fontSize="14px" fontWeight="500" color="gray.600">
              Department ID
            </FormLabel>
            <Input
              placeholder="e.g. dept-uuid-123"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              size="sm"
              borderRadius="6px"
            />
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="14px" fontWeight="500" color="gray.600">
              Course Template
            </FormLabel>
            {loadingTemplates ? (
              <Flex alignItems="center" gap="8px" pt="8px">
                <Spinner size="sm" />
                <Text fontSize="13px" color="gray.500">
                  Loading templates…
                </Text>
              </Flex>
            ) : (
              <ChakraSelect
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="No template (optional)"
                size="sm"
                borderRadius="6px"
              >
                {templates.map((t) => (
                  <option key={t.templateId} value={t.templateId}>
                    {t.templateName}
                  </option>
                ))}
              </ChakraSelect>
            )}
          </FormControl>
        </Flex>

        <Divider my="20px" />

        {/* Course List */}
        <Flex justifyContent="space-between" alignItems="center" mb="16px">
          <Text fontSize="16px" fontWeight="600" color="gray.700">
            Courses ({courses.length})
          </Text>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FaPlus />}
            onClick={addCourse}
          >
            Add Course
          </Button>
        </Flex>

        <Flex direction="column" gap="16px">
          {courses.map((course, index) => (
            <Box
              key={index}
              bg="#F7FAFC"
              border="1px solid #E2E8F0"
              borderRadius="8px"
              p="16px"
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
                mb="12px"
              >
                <Text fontSize="13px" fontWeight="600" color="gray.500">
                  Course #{index + 1}
                </Text>
                {courses.length > 1 && (
                  <IconButton
                    aria-label="Remove course"
                    icon={<FaTrash />}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => removeCourse(index)}
                  />
                )}
              </Flex>

              <Flex gap="12px" direction={{ base: "column", md: "row" }}>
                <FormControl isRequired flex="2">
                  <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                    Title
                  </FormLabel>
                  <Input
                    size="sm"
                    borderRadius="6px"
                    bg="white"
                    placeholder="Course title"
                    value={course.title}
                    onChange={(e) =>
                      updateCourse(index, "title", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                    Credits
                  </FormLabel>
                  <NumberInput
                    size="sm"
                    min={1}
                    max={12}
                    value={course.credits}
                    onChange={(val) => updateCourse(index, "credits", val)}
                  >
                    <NumberInputField borderRadius="6px" bg="white" />
                  </NumberInput>
                </FormControl>
              </Flex>

              <FormControl mt="12px">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Description
                </FormLabel>
                <Textarea
                  size="sm"
                  borderRadius="6px"
                  bg="white"
                  placeholder="Brief course description"
                  rows={2}
                  value={course.description}
                  onChange={(e) =>
                    updateCourse(index, "description", e.target.value)
                  }
                />
              </FormControl>
            </Box>
          ))}
        </Flex>

        {/* Submit */}
        <Flex justifyContent="flex-end" gap="12px" mt="24px">
          <Button
            variant="outline"
            onClick={() => history.push("/admin/bulk-courses")}
            isDisabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting} loadingText="Creating…">
            Create Batch
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export const CreateBulkCourseBatchPageRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={(props) => <CreateBulkCourseBatchPage {...props} />}
  />
);

export default CreateBulkCourseBatchPageRoute;
