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
  adminGetDepartmentListing,
} from "../../../services";

const EMPTY_COURSE = { title: "", description: "", credits: 3 };

const CreateBulkCourseBatchPage = () => {
  const history = useHistory();
  const toast = useToast();

  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [departmentId, setDepartmentId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [courses, setCourses] = useState([{ ...EMPTY_COURSE }]);
  const [submitting, setSubmitting] = useState(false);

  const fetchMeta = useCallback(async () => {
    try {
      const [tplRes, deptRes] = await Promise.all([
        adminGetCourseTemplates(),
        adminGetDepartmentListing(),
      ]);
      setTemplates(tplRes.templates ?? []);
      setDepartments(deptRes.departments ?? []);
    } catch {
      toast({
        title: "Failed to load form data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingMeta(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

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

    if (!departmentId) {
      toast({
        title: "Please select a department",
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
        departmentId,
        ...(templateId && { templateId }),
        courseList: validCourses.map((c) => ({
          title: c.title.trim(),
          ...(c.description.trim() && { description: c.description.trim() }),
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

  if (loadingMeta) {
    return (
      <Flex justifyContent="center" alignItems="center" height="300px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box marginX="22px" marginY="20px">
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
        <Text fontSize="16px" fontWeight="600" color="gray.700" mb="16px">
          Batch Configuration
        </Text>

        <Flex gap="16px" mb="16px" direction={{ base: "column", md: "row" }}>
          <FormControl isRequired flex="1">
            <FormLabel fontSize="14px" fontWeight="500" color="gray.600">
              Department
            </FormLabel>
            <ChakraSelect
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              placeholder="Select department"
              size="sm"
              borderRadius="6px"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </ChakraSelect>
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="14px" fontWeight="500" color="gray.600">
              Course Template
            </FormLabel>
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
          </FormControl>
        </Flex>

        <Divider my="20px" />

        <Flex justifyContent="space-between" alignItems="center" mb="16px">
          <Text fontSize="16px" fontWeight="600" color="gray.700">
            Courses ({courses.length})
          </Text>
          <Button
            size="sm"
            secondary
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

        <Flex justifyContent="flex-end" gap="12px" mt="24px">
          <Button
            secondary
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
