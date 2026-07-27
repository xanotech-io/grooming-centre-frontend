import React, { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  BreadcrumbItem,
  Flex,
  Grid,
  Text,
  Divider,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Input, Link, Select } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminCreateMarkingTemplate } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const RETRY_POLICY_OPTIONS = [
  { label: "Highest Score", value: "highest" },
  { label: "Latest Attempt", value: "latest" },
  { label: "Average Score", value: "average" },
];

const USAGE_SCOPE_OPTIONS = [
  { label: "Assessment", value: "Assessment" },
  { label: "Normal Exam", value: "Normal Exam" },
  { label: "Standalone Exam", value: "Standalone Exam" },
];

export const CreateExamTemplatePage = () => {
  const history = useHistory();
  const toast = useToast();

  const [markingTemplateName, setMarkingTemplateName] = useState("");
  const [usageScope, setUsageScope] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [retryPolicy, setRetryPolicy] = useState("highest");
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSection = () => setSections((p) => [...p, { name: "" }]);
  const removeSection = (i) => setSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i, field, value) =>
    setSections((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleSubmit = async () => {
    if (!markingTemplateName.trim()) {
      toast({ description: "Template name is required.", position: "top", status: "warning" });
      return;
    }
    if (!usageScope) {
      toast({ description: "Usage scope is required.", position: "top", status: "warning" });
      return;
    }
    if (sections.length === 0) {
      toast({ description: "Add at least one section.", position: "top", status: "warning" });
      return;
    }

    const body = {
      markingTemplateName,
      usageScope,
      retryCount: Number(retryCount),
      retryPolicy,
      sections: sections.map((s, i) => ({
        name: s.name,
        sequence: i + 1,
      })),
    };

    setIsSubmitting(true);
    try {
      const { message } = await adminCreateMarkingTemplate(body);
      toast({ description: capitalizeFirstLetter(message), position: "top", status: "success" });
      history.push("/admin/marking-templates");
    } catch (err) {
      toast({ description: capitalizeFirstLetter(err.message), position: "top", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/marking-templates">Marking Templates</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Template</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
    <Box paddingX={{ base: "20px", lg: "40px" }} paddingY="30px" bg="#FAFAFA" minHeight="100vh">
      {/* Go Back */}
      <Flex
        alignItems="center"
        cursor="pointer"
        onClick={() => history.goBack()}
        mb="24px"
        width="max-content"
      >
        <Box border="1px solid #E2E8F0" borderRadius="4px" p="6px" mr="12px" bg="white">
          <FaArrowLeft color="#1A202C" />
        </Box>
        <Text fontWeight="500" color="#1A202C">Go Back</Text>
      </Flex>

      <Heading as="h1" size="lg" color="#1A202C" mb="32px">
        Create Exam Template
      </Heading>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="32px" alignItems="start">
        {/* Left Column */}
        <Box>
          {/* Basic Info */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="20px">
              Basic Information
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px">
              <Input
                label="Template Name"
                id="markingTemplateName"
                placeholder="e.g. Midterm Marking Template"
                value={markingTemplateName}
                onChange={(e) => setMarkingTemplateName(e.target.value)}
              />
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Usage Scope
                </Text>
                <Select
                  id="usageScope"
                  placeholder="Select scope"
                  value={usageScope}
                  onChange={(e) => setUsageScope(e.target.value)}
                  options={USAGE_SCOPE_OPTIONS}
                />
              </Box>
            </Grid>
          </Box>

          {/* Paper Sections */}
          <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <Text fontSize="16px" fontWeight="600" color="#1A202C">Paper Sections</Text>
              <Button ghost onClick={addSection} type="button">
                <Flex alignItems="center" gap="6px"><FaPlus size="11px" /> Add Section</Flex>
              </Button>
            </Flex>
            <Text fontSize="12px" color="#A0AEC0" mb="16px">
              The number of sections added here is the number of sections available to pick from when this template is used to create an exam. Question counts, marks, marking scheme, and type/marking locks for each section are configured then.
            </Text>

            {sections.length === 0 ? (
              <Box bg="#F7F9FC" borderRadius="8px" p="20px" textAlign="center">
                <Text fontSize="13px" color="#A0AEC0">No sections added yet.</Text>
              </Box>
            ) : (
              <>
                <Grid templateColumns="2fr 1fr auto" gap="10px" mb="8px">
                  {["NAME", "SEQUENCE", ""].map((h) => (
                    <Text key={h} fontSize="11px" fontWeight="600" color="#718096">{h}</Text>
                  ))}
                </Grid>
                {sections.map((s, i) => (
                  <Grid key={i} templateColumns="2fr 1fr auto" gap="10px" alignItems="center" mb="10px">
                    <input
                      value={s.name}
                      onChange={(e) => updateSection(i, "name", e.target.value)}
                      placeholder="e.g. Section A"
                      style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px", fontSize: 13, width: "100%" }}
                    />
                    <Box bg="#F4F5F7" borderRadius="8px" px="12px" py="8px" textAlign="center">
                      <Text fontSize="13px" fontWeight="600" color="#1A202C">{i + 1}</Text>
                    </Box>
                    <Box
                      as="button"
                      type="button"
                      onClick={() => removeSection(i)}
                      color="red.400"
                      fontWeight="600"
                      fontSize="18px"
                      lineHeight="1"
                      px={1}
                      _hover={{ color: "red.600" }}
                    >
                      ×
                    </Box>
                  </Grid>
                ))}
              </>
            )}
          </Box>
        </Box>

        {/* Right Column */}
        <Box position="sticky" top="30px">
          {/* Retry Configuration */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
              Retry Configuration
            </Text>
            <Divider mb="16px" />
            <Box mb="16px">
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Retry Count
              </Text>
              <NumberInput
                min={0}
                value={retryCount}
                onChange={(v) => setRetryCount(v)}
              >
                <NumberInputField bg="#F4F5F7" border="none" borderRadius="8px" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="11px" color="#A0AEC0" mt="4px">0 = single attempt only</Text>
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                Retry Policy
              </Text>
              <Select
                id="retryPolicy"
                value={retryPolicy}
                onChange={(e) => setRetryPolicy(e.target.value)}
                options={RETRY_POLICY_OPTIONS}
              />
              <Text fontSize="11px" color="#A0AEC0" mt="4px">
                How the final score is calculated across attempts
              </Text>
            </Box>
          </Box>

          {/* Summary */}
          <Box bg="white" borderRadius="8px" p="24px" shadow="sm" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="16px">
              Summary
            </Text>
            <Divider mb="16px" />
            <Flex justifyContent="space-between" mb="10px">
              <Text fontSize="13px" color="#718096">Sections</Text>
              <Text fontSize="13px" fontWeight="600" color="#1A202C">{sections.length}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="13px" color="#718096">Retry Count</Text>
              <Text fontSize="13px" fontWeight="600" color="#1A202C">{retryCount}</Text>
            </Flex>
          </Box>

          <Button
            w="100%"
            h="50px"
            style={{ backgroundColor: "#6b006b", color: "white" }}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Create Exam Template
          </Button>
        </Box>
      </Grid>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateExamTemplatePageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateExamTemplatePage {...props} />} />
);

export default CreateExamTemplatePageRoute;
