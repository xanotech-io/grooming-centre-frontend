import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Divider,
  Spinner,
  IconButton,
  useToast,
  Select as ChakraSelect,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Code,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaPlus, FaTrash, FaArrowLeft, FaUpload, FaDownload } from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetBulkCourseV2Templates,
  adminCreateBulkCourseV2Batch,
  adminUploadBulkCourseV2BatchFile,
  adminGetDepartmentListing,
} from "../../../../services";

const EMPTY_COURSE = { title: "", description: "", instructorId: "" };

const buildCourseList = (courses) =>
  courses
    .filter((c) => c.title.trim())
    .map((c) => {
      const item = { title: c.title.trim() };
      if (c.description.trim()) item.description = c.description.trim();
      if (c.instructorId.trim()) item.instructorId = c.instructorId.trim();
      return item;
    });

const CreateBulkCourseV2BatchPage = () => {
  const history = useHistory();
  const toast = useToast();
  const fileInputRef = useRef();

  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [departmentId, setDepartmentId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [term, setTerm] = useState("");
  const [courses, setCourses] = useState([{ ...EMPTY_COURSE }]);
  const [submitting, setSubmitting] = useState(false);

  const [csvFile, setCsvFile] = useState(null);
  const [csvDepartmentId, setCsvDepartmentId] = useState("");
  const [csvTemplateId, setCsvTemplateId] = useState("");
  const [csvTerm, setCsvTerm] = useState("");
  const [csvRemark, setCsvRemark] = useState("");
  const [csvSubmitting, setCsvSubmitting] = useState(false);

  const downloadSampleCsv = () => {
    const csv = "title,description,instructor_id\nIntroduction to Programming,Foundational programming concepts,\nData Structures,,\nAlgorithms and Complexity,Advanced algorithmic thinking,\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-course-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchMeta = useCallback(async () => {
    try {
      const [tplRes, deptRes] = await Promise.all([
        adminGetBulkCourseV2Templates(),
        adminGetDepartmentListing(),
      ]);
      setTemplates(tplRes.templates ?? []);
      setDepartments(deptRes.departments ?? []);
    } catch {
      toast({ title: "Failed to load form data", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoadingMeta(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const addCourse = () => setCourses((prev) => [...prev, { ...EMPTY_COURSE }]);
  const removeCourse = (index) => setCourses((prev) => prev.filter((_, i) => i !== index));
  const updateCourse = (index, field, value) =>
    setCourses((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!departmentId) {
      toast({ title: "Please select a department", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const courseList = buildCourseList(courses);

    if (courseList.length === 0) {
      toast({ title: "Add at least one course with a title", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const payload = { departmentId, courseList };
    if (templateId) payload.templateId = templateId;
    if (term.trim()) payload.term = term.trim();

    setSubmitting(true);
    try {
      const { message, batch } = await adminCreateBulkCourseV2Batch(payload);
      toast({ title: message || "Batch created successfully", status: "success", duration: 3000, isClosable: true });
      history.push(`/admin/bulk-courses/${batch.id}`);
    } catch {
      toast({ title: "Failed to create batch", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvDepartmentId) {
      toast({ title: "Please select a department", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!csvFile) {
      toast({ title: "Please select a file", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("departmentId", csvDepartmentId);
    if (csvTemplateId) formData.append("templateId", csvTemplateId);
    if (csvTerm.trim()) formData.append("term", csvTerm.trim());
    if (csvRemark.trim()) formData.append("remark", csvRemark.trim());

    setCsvSubmitting(true);
    try {
      const { message, batch } = await adminUploadBulkCourseV2BatchFile(formData);
      toast({ title: message || "Batch created from file", status: "success", duration: 3000, isClosable: true });
      history.push(`/admin/bulk-courses/${batch.id}`);
    } catch {
      toast({ title: "Failed to upload file", status: "error", duration: 3000, isClosable: true });
    } finally {
      setCsvSubmitting(false);
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
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/bulk-courses">Bulk Course Creation</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Batch</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/bulk-courses")}
        />
        <Heading fontSize="22px" fontWeight="600">Create Bulk Course Batch</Heading>
      </Flex>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab fontSize="14px">Manual Entry</Tab>
          <Tab fontSize="14px">File Upload (CSV / Excel)</Tab>
        </TabList>

        <TabPanels>
          {/* ── Manual Entry ── */}
          <TabPanel px="0" pt="20px">
            <Box as="form" onSubmit={handleManualSubmit} bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px" maxW="780px">
              <Text fontSize="16px" fontWeight="600" color="gray.700" mb="16px">Batch Configuration</Text>

              <Flex gap="16px" mb="16px" direction={{ base: "column", md: "row" }}>
                <FormControl isRequired flex="1">
                  <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Department</FormLabel>
                  <ChakraSelect
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    placeholder="Select department"
                    size="sm"
                    borderRadius="6px"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </ChakraSelect>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Template (optional)</FormLabel>
                  <ChakraSelect
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    placeholder="No template"
                    size="sm"
                    borderRadius="6px"
                  >
                    {templates.map((t) => (
                      <option key={t.id || t.templateId} value={t.id || t.templateId}>
                        {t.name || t.templateName}
                      </option>
                    ))}
                  </ChakraSelect>
                </FormControl>
              </Flex>

              <FormControl mb="16px">
                <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Term (optional)</FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
                  placeholder="e.g. 2025/2026 - First Semester"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
              </FormControl>

              <Divider my="20px" />

              <Flex justifyContent="space-between" alignItems="center" mb="16px">
                <Text fontSize="16px" fontWeight="600" color="gray.700">Course List ({courses.length})</Text>
                <Button size="sm" secondary leftIcon={<FaPlus />} onClick={addCourse}>Add Course</Button>
              </Flex>

              <Flex direction="column" gap="16px">
                {courses.map((course, index) => (
                  <Box key={index} bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" p="16px">
                    <Flex justifyContent="space-between" alignItems="center" mb="12px">
                      <Text fontSize="13px" fontWeight="600" color="gray.500">Course #{index + 1}</Text>
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

                    <FormControl isRequired mb="12px">
                      <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Title</FormLabel>
                      <Input
                        size="sm"
                        borderRadius="6px"
                        bg="white"
                        placeholder="Course title"
                        value={course.title}
                        onChange={(e) => updateCourse(index, "title", e.target.value)}
                      />
                    </FormControl>

                    <FormControl mb="12px">
                      <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Description (optional)</FormLabel>
                      <Textarea
                        size="sm"
                        borderRadius="6px"
                        bg="white"
                        placeholder="Brief course description"
                        rows={2}
                        value={course.description}
                        onChange={(e) => updateCourse(index, "description", e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Instructor ID (optional)</FormLabel>
                      <Input
                        size="sm"
                        borderRadius="6px"
                        bg="white"
                        placeholder="Instructor UUID"
                        value={course.instructorId}
                        onChange={(e) => updateCourse(index, "instructorId", e.target.value)}
                      />
                    </FormControl>
                  </Box>
                ))}
              </Flex>

              <Flex justifyContent="flex-end" gap="12px" mt="24px">
                <Button secondary onClick={() => history.push("/admin/bulk-courses")} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} loadingText="Creating…">
                  Create Batch
                </Button>
              </Flex>
            </Box>
          </TabPanel>

          {/* ── File Upload ── */}
          <TabPanel px="0" pt="20px">
            <Box as="form" onSubmit={handleCsvSubmit} bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px" maxW="600px">
              <Text fontSize="16px" fontWeight="600" color="gray.700" mb="16px">File Upload</Text>

              <Flex gap="16px" mb="16px" direction={{ base: "column", md: "row" }}>
                <FormControl isRequired flex="1">
                  <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Department</FormLabel>
                  <ChakraSelect
                    value={csvDepartmentId}
                    onChange={(e) => setCsvDepartmentId(e.target.value)}
                    placeholder="Select department"
                    size="sm"
                    borderRadius="6px"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </ChakraSelect>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Template (optional)</FormLabel>
                  <ChakraSelect
                    value={csvTemplateId}
                    onChange={(e) => setCsvTemplateId(e.target.value)}
                    placeholder="No template"
                    size="sm"
                    borderRadius="6px"
                  >
                    {templates.map((t) => (
                      <option key={t.id || t.templateId} value={t.id || t.templateId}>
                        {t.name || t.templateName}
                      </option>
                    ))}
                  </ChakraSelect>
                </FormControl>
              </Flex>

              <FormControl mb="16px">
                <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Term (optional)</FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
                  placeholder="e.g. 2025/2026 - First Semester"
                  value={csvTerm}
                  onChange={(e) => setCsvTerm(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mb="16px">
                <Flex justifyContent="space-between" alignItems="center" mb="6px">
                  <FormLabel fontSize="14px" fontWeight="500" color="gray.600" mb="0">CSV / Excel File</FormLabel>
                  <Flex
                    as="button"
                    type="button"
                    alignItems="center"
                    gap="4px"
                    fontSize="12px"
                    color="#3182CE"
                    fontWeight="600"
                    onClick={downloadSampleCsv}
                    _hover={{ opacity: 0.8 }}
                  >
                    <FaDownload size={11} />
                    Download Sample CSV
                  </Flex>
                </Flex>
                <Box
                  border="2px dashed #CBD5E0"
                  borderRadius="8px"
                  p="24px"
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: "#3182CE", bg: "#EBF8FF" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaUpload style={{ margin: "0 auto 8px", color: "#718096", fontSize: "24px" }} />
                  <Text fontSize="14px" color="gray.500">
                    {csvFile ? csvFile.name : "Click to select a file"}
                  </Text>
                  {csvFile ? (
                    <Text fontSize="12px" color="gray.400" mt="4px">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </Text>
                  ) : (
                    <Text fontSize="12px" color="gray.400" mt="4px">.csv or .xlsx files · max 5 MB</Text>
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0] || null;
                    if (file && file.size > 5 * 1024 * 1024) {
                      toast({ title: "File must be 5 MB or smaller", status: "warning", duration: 3000, isClosable: true });
                      e.target.value = "";
                      return;
                    }
                    setCsvFile(file);
                  }}
                />
              </FormControl>

              <FormControl mb="16px">
                <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Remark (optional)</FormLabel>
                <Textarea
                  size="sm"
                  borderRadius="6px"
                  placeholder="Any notes about this upload batch"
                  rows={2}
                  value={csvRemark}
                  onChange={(e) => setCsvRemark(e.target.value)}
                />
              </FormControl>

              <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="6px" p="12px" mb="20px">
                <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Expected columns:</Text>
                <Code fontSize="12px" display="block" whiteSpace="pre" bg="transparent">
                  {`title (or course_title), description (optional), instructor_id (optional)`}
                </Code>
              </Box>

              <Flex justifyContent="flex-end" gap="12px">
                <Button secondary onClick={() => history.push("/admin/bulk-courses")} isDisabled={csvSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={csvSubmitting} loadingText="Uploading…" leftIcon={<FaUpload />}>
                  Upload & Create
                </Button>
              </Flex>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateBulkCourseV2BatchPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateBulkCourseV2BatchPage {...props} />} />
);

export default CreateBulkCourseV2BatchPageRoute;
