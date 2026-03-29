import React, { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Divider,
  useToast,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Button, Heading, Input } from "../../../components";
import { adminCreateGradeBook } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

const defaultGradingScale = [
  { _key: 1, grade: "A", minScore: 90, maxScore: 100, gradePoints: 4.0 },
  { _key: 2, grade: "B+", minScore: 85, maxScore: 89, gradePoints: 3.5 },
  { _key: 3, grade: "B", minScore: 80, maxScore: 84, gradePoints: 3.0 },
  { _key: 4, grade: "C+", minScore: 75, maxScore: 79, gradePoints: 2.5 },
  { _key: 5, grade: "C", minScore: 70, maxScore: 74, gradePoints: 2.0 },
  { _key: 6, grade: "D", minScore: 60, maxScore: 69, gradePoints: 1.0 },
  { _key: 7, grade: "F", minScore: 0, maxScore: 59, gradePoints: 0.0 },
];

const emptyCategory = () => ({
  _key: Date.now() + Math.random(),
  categoryName: "",
  weight: 0,
  dropLowest: 0,
});

export const CreateGradeBookPage = () => {
  const history = useHistory();
  const toast = useToast();

  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [term, setTerm] = useState("");
  const [gradingScale, setGradingScale] = useState(defaultGradingScale);
  const [categories, setCategories] = useState([
    { _key: 1, categoryName: "Quizzes", weight: 20, dropLowest: 1 },
    { _key: 2, categoryName: "Assignments", weight: 30, dropLowest: 0 },
    { _key: 3, categoryName: "Midterm Exam", weight: 20, dropLowest: 0 },
    { _key: 4, categoryName: "Final Exam", weight: 30, dropLowest: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWeight = categories.reduce((s, c) => s + Number(c.weight || 0), 0);

  const handleGradeScaleChange = (idx, field, value) => {
    setGradingScale((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, [field]: value } : g)),
    );
  };

  const handleCategoryChange = (idx, field, value) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  const handleAddCategory = () =>
    setCategories((prev) => [...prev, emptyCategory()]);

  const handleRemoveCategory = (idx) => {
    if (categories.length === 1) return;
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!courseId.trim()) {
      toast({
        description: "Course ID is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    if (!courseName.trim()) {
      toast({
        description: "Course name is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    if (!term.trim()) {
      toast({
        description: "Term is required.",
        position: "top",
        status: "warning",
      });
      return;
    }
    if (totalWeight !== 100) {
      toast({
        description: `Assessment category weights must total 100% (currently ${totalWeight}%).`,
        position: "top",
        status: "warning",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const body = {
        courseId,
        courseName,
        instructorId,
        term,
        gradingScale: gradingScale.map(({ _key, ...g }) => g),
        assessmentCategories: categories.map(({ _key, ...c }) => ({
          ...c,
          weight: Number(c.weight),
          dropLowest: Number(c.dropLowest),
        })),
      };
      const { message } = await adminCreateGradeBook(body);
      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      history.push("/admin/grade-book");
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

      <Flex justifyContent="space-between" alignItems="center" mb="32px">
        <Heading as="h1" size="lg" color="#1A202C">
          Create Grade Book
        </Heading>
        <Button
          onClick={handleSubmit}
          style={{ backgroundColor: "#6b006b", color: "white" }}
          isLoading={isSubmitting}
        >
          Save Grade Book
        </Button>
      </Flex>

      {/* Basic Info */}
      <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
        <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="20px">
          Basic Information
        </Text>
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap="16px"
          mb="16px"
        >
          <Input
            label="Course ID"
            id="courseId"
            placeholder="e.g. course-uuid-123"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
          <Input
            label="Course Name"
            id="courseName"
            placeholder="e.g. Data Analytics 101"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </Grid>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px">
          <Input
            label="Instructor ID"
            id="instructorId"
            placeholder="e.g. instructor-uuid-789"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
          />
          <Input
            label="Term"
            id="term"
            placeholder="e.g. Fall 2025"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </Grid>
      </Box>

      {/* Grading Scale */}
      <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
        <Text fontSize="15px" fontWeight="600" color="#1A202C" mb="20px">
          Grading Scale
        </Text>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th textTransform="none" color="#4A5568">
                  Grade
                </Th>
                <Th textTransform="none" color="#4A5568">
                  Min Score
                </Th>
                <Th textTransform="none" color="#4A5568">
                  Max Score
                </Th>
                <Th textTransform="none" color="#4A5568">
                  Grade Points
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {gradingScale.map((g, idx) => (
                <Tr key={g._key}>
                  <Td fontWeight="600" color="#6b006b" fontSize="14px">
                    {g.grade}
                  </Td>
                  <Td>
                    <NumberInput
                      size="sm"
                      min={0}
                      max={100}
                      value={g.minScore}
                      onChange={(v) =>
                        handleGradeScaleChange(idx, "minScore", Number(v))
                      }
                      width="100px"
                    >
                      <NumberInputField
                        bg="#F4F5F7"
                        border="none"
                        borderRadius="6px"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                  <Td>
                    <NumberInput
                      size="sm"
                      min={0}
                      max={100}
                      value={g.maxScore}
                      onChange={(v) =>
                        handleGradeScaleChange(idx, "maxScore", Number(v))
                      }
                      width="100px"
                    >
                      <NumberInputField
                        bg="#F4F5F7"
                        border="none"
                        borderRadius="6px"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                  <Td>
                    <NumberInput
                      size="sm"
                      min={0}
                      max={4}
                      step={0.5}
                      value={g.gradePoints}
                      onChange={(v) =>
                        handleGradeScaleChange(idx, "gradePoints", Number(v))
                      }
                      width="100px"
                    >
                      <NumberInputField
                        bg="#F4F5F7"
                        border="none"
                        borderRadius="6px"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Assessment Categories */}
      <Box bg="white" borderRadius="8px" p="28px" shadow="sm" mb="24px">
        <Flex justifyContent="space-between" alignItems="center" mb="20px">
          <Box>
            <Text fontSize="15px" fontWeight="600" color="#1A202C">
              Assessment Categories
            </Text>
            <Text
              fontSize="12px"
              color={totalWeight === 100 ? "#38A169" : "#E53E3E"}
              mt="2px"
            >
              Total weight: {totalWeight}%{" "}
              {totalWeight !== 100 && "(must equal 100%)"}
            </Text>
          </Box>
          <Button
            onClick={handleAddCategory}
            style={{ backgroundColor: "#6b006b", color: "white" }}
            size="sm"
          >
            <Flex alignItems="center" gap="6px">
              <FaPlus size="11px" /> Add Category
            </Flex>
          </Button>
        </Flex>

        {categories.map((cat, idx) => (
          <Box
            key={cat._key}
            border="1px solid #E2E8F0"
            borderRadius="8px"
            p="16px"
            mb="12px"
          >
            <Flex justifyContent="space-between" alignItems="center" mb="12px">
              <Text fontSize="13px" fontWeight="600" color="#6b006b">
                Category {idx + 1}
              </Text>
              {categories.length > 1 && (
                <IconButton
                  icon={<FaTrash size="12px" />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  aria-label="Remove category"
                  onClick={() => handleRemoveCategory(idx)}
                />
              )}
            </Flex>
            <Grid
              templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }}
              gap="14px"
            >
              <Input
                label="Category Name"
                id={`catName-${idx}`}
                placeholder="e.g. Quizzes"
                value={cat.categoryName}
                onChange={(e) =>
                  handleCategoryChange(idx, "categoryName", e.target.value)
                }
              />
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Weight (%)
                </Text>
                <NumberInput
                  min={0}
                  max={100}
                  value={cat.weight}
                  onChange={(v) =>
                    handleCategoryChange(idx, "weight", Number(v))
                  }
                >
                  <NumberInputField
                    bg="#F4F5F7"
                    border="none"
                    borderRadius="8px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#1A202C" mb="8px">
                  Drop Lowest
                </Text>
                <NumberInput
                  min={0}
                  max={10}
                  value={cat.dropLowest}
                  onChange={(v) =>
                    handleCategoryChange(idx, "dropLowest", Number(v))
                  }
                >
                  <NumberInputField
                    bg="#F4F5F7"
                    border="none"
                    borderRadius="8px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </Grid>
          </Box>
        ))}
      </Box>

      {/* Bottom Submit */}
      <Flex justifyContent="flex-end" mt="8px">
        <Button
          style={{ backgroundColor: "#6b006b", color: "white" }}
          h="50px"
          px="40px"
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          Save Grade Book
        </Button>
      </Flex>
    </Box>
  );
};

export const CreateGradeBookPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateGradeBookPage {...props} />} />
);

export default CreateGradeBookPageRoute;
