import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  IconButton,
  Divider,
  useToast,
  Select as ChakraSelect,
  Input as ChakraInput,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { Button, Heading, Input, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  gradeBookV2Setup,
  gradeBookV2Update,
  gradeBookV2GetById,
} from "../../../services";

const DEFAULT_SCALE = [
  { grade: "A", range: "90-100" },
  { grade: "B", range: "80-89" },
  { grade: "C", range: "70-79" },
  { grade: "D", range: "60-69" },
  { grade: "F", range: "0-59" },
];

const DEFAULT_CATEGORIES = [
  { name: "Exams", weight: 40 },
  { name: "Assignments", weight: 30 },
  { name: "Projects", weight: 20 },
  { name: "Attendance", weight: 10 },
];

const SetupGradeBookV2Page = () => {
  const history = useHistory();
  const toast = useToast();
  const { gradebookId } = useParams();
  const isEdit = !!gradebookId;

  // Form state
  const [title, setTitle] = useState("");
  const [calculationMethod, setCalculationMethod] = useState("weighted");
  const [gradingScale, setGradingScale] = useState(DEFAULT_SCALE);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [saving, setSaving] = useState(false);

  // Load existing grade book for edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { gradeBook } = await gradeBookV2GetById(gradebookId);
        setTitle(gradeBook.title || "");
        setCalculationMethod(gradeBook.calculationMethod || "weighted");
        if (gradeBook.gradingScale) {
          setGradingScale(
            Object.entries(gradeBook.gradingScale).map(([grade, range]) => ({ grade, range }))
          );
        }
        if (gradeBook.categories?.length) {
          setCategories(gradeBook.categories.map((c) => ({ name: c.name, weight: c.weight })));
        }
      } catch {
        toast({ title: "Failed to load grade book", status: "error", duration: 3000, isClosable: true });
      }
    })();
  }, [isEdit, gradebookId, toast]);

  const totalWeight = categories.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  const weightValid = totalWeight === 100;
  const isWeighted = calculationMethod === "weighted";

  const updateScale = (idx, field, value) => {
    setGradingScale((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const updateCategoryWeight = (idx, value) => {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, weight: value } : c)));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    if (isWeighted && !weightValid) {
      toast({ title: `Category weights must sum to 100 (currently ${totalWeight})`, status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const scaleObj = {};
    gradingScale.forEach((s) => { if (s.grade && s.range) scaleObj[s.grade] = s.range; });

    const payload = {
      title: title.trim(),
      calculationMethod,
      gradingScale: scaleObj,
      categories: categories.map((c) => ({ name: c.name.trim(), weight: Number(c.weight) })),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await gradeBookV2Update(gradebookId, payload);
        toast({ title: "Grade book updated", status: "success", duration: 3000, isClosable: true });
        history.push(`/admin/grade-book-v2/${gradebookId}`);
      } else {
        const { gradeBook } = await gradeBookV2Setup(payload);
        toast({ title: "Grade book created", status: "success", duration: 3000, isClosable: true });
        history.push(`/admin/grade-book-v2/${gradeBook.id}`);
      }
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to save grade book", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/grade-book-v2">Advanced Grade Book</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Setup</Link>
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
          onClick={() => history.push("/admin/grade-book-v2")}
        />
        <Heading fontSize="22px" fontWeight="600">
          {isEdit ? "Edit Grade Book" : "Create Grade Book"}
        </Heading>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="20px">
        {/* Left column: basics */}
        <Box>
          <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px" mb="20px">
            <Text fontSize="15px" fontWeight="600" color="gray.700" mb="16px">Basic Information</Text>

            <Box mb="16px">
              <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Title *</Text>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Microfinance Basics Grade Book"
                size="sm"
              />
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Calculation Method</Text>
              <ChakraSelect
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value)}
                size="sm"
                borderRadius="6px"
              >
                <option value="weighted">Weighted Average</option>
                <option value="simple_average">Simple Average</option>
              </ChakraSelect>
            </Box>
          </Box>

          {/* Grading Scale */}
          <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px">
            <Text fontSize="15px" fontWeight="600" color="gray.700" mb="16px">Grading Scale</Text>
            <Grid templateColumns="80px 1fr" gap="8px" mb="8px">
              <Text fontSize="12px" fontWeight="600" color="gray.500">Grade</Text>
              <Text fontSize="12px" fontWeight="600" color="gray.500">Range (e.g. 90-100)</Text>
            </Grid>
            {gradingScale.map((s, i) => (
              <Grid key={i} templateColumns="80px 1fr" gap="8px" mb="8px">
                <ChakraInput
                  value={s.grade}
                  onChange={(e) => updateScale(i, "grade", e.target.value)}
                  size="sm"
                  borderRadius="6px"
                  fontWeight="600"
                />
                <ChakraInput
                  value={s.range}
                  onChange={(e) => updateScale(i, "range", e.target.value)}
                  size="sm"
                  borderRadius="6px"
                  placeholder="e.g. 90-100"
                />
              </Grid>
            ))}
          </Box>
        </Box>

        {/* Right column: categories */}
        {isWeighted && (
          <Box>
            <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px">
              <Flex justifyContent="space-between" alignItems="center" mb="16px">
                <Box>
                  <Text fontSize="15px" fontWeight="600" color="gray.700">Weighted Average Calculation</Text>
                  <Text fontSize="12px" color="gray.500" mt="2px">Fixed category weights, summing to 100</Text>
                </Box>
                <Box
                  px="10px"
                  py="4px"
                  borderRadius="12px"
                  bg={weightValid ? "#E6F4EA" : "#FED7D7"}
                  color={weightValid ? "#38A169" : "#E53E3E"}
                  fontSize="13px"
                  fontWeight="600"
                >
                  {totalWeight}/100
                </Box>
              </Flex>

              {categories.map((cat, i) => (
                <Flex key={i} justifyContent="space-between" alignItems="center" py="8px" borderBottom="1px solid #F7FAFC">
                  <Text fontSize="14px" color="gray.700">{cat.name}</Text>
                  <Flex alignItems="center" gap="4px">
                    <ChakraInput
                      type="number"
                      min={0}
                      max={100}
                      value={cat.weight}
                      onChange={(e) => updateCategoryWeight(i, e.target.value)}
                      size="sm"
                      borderRadius="6px"
                      w="80px"
                      textAlign="right"
                    />
                    <Text fontSize="14px" color="gray.500">%</Text>
                  </Flex>
                </Flex>
              ))}

              <Divider my="20px" />

              {/* Visual weight breakdown */}
              <Text fontSize="12px" fontWeight="600" color="gray.500" mb="10px">Weight Distribution</Text>
              <Flex gap="4px" borderRadius="6px" overflow="hidden" h="12px" mb="10px">
                {categories.filter((c) => c.name && Number(c.weight) > 0).map((c, i) => {
                  const colors = ["#6b006b", "#3182CE", "#38A169", "#DD6B20", "#E53E3E", "#553C9A"];
                  return (
                    <Box
                      key={i}
                      flex={Number(c.weight)}
                      bg={colors[i % colors.length]}
                      title={`${c.name}: ${c.weight}%`}
                    />
                  );
                })}
                {totalWeight < 100 && (
                  <Box flex={100 - totalWeight} bg="#E2E8F0" />
                )}
              </Flex>
              <Flex gap="16px" flexWrap="wrap">
                {categories.filter((c) => c.name).map((c, i) => {
                  const colors = ["#6b006b", "#3182CE", "#38A169", "#DD6B20", "#E53E3E", "#553C9A"];
                  return (
                    <Flex key={i} alignItems="center" gap="6px">
                      <Box w="10px" h="10px" borderRadius="2px" bg={colors[i % colors.length]} flexShrink={0} />
                      <Text fontSize="12px" color="gray.600">{c.name} ({c.weight}%)</Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          </Box>
        )}
      </Grid>

      <Flex justifyContent="flex-end" gap="12px" mt="24px">
        <Button secondary onClick={() => history.push("/admin/grade-book-v2")}>Cancel</Button>
        <Button isLoading={saving} onClick={handleSubmit}>
          {isEdit ? "Save Changes" : "Create Grade Book"}
        </Button>
      </Flex>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const SetupGradeBookV2PageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <SetupGradeBookV2Page {...props} />} />
);

export default SetupGradeBookV2PageRoute;
