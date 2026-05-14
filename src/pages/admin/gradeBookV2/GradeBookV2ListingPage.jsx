import React, { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  Input as ChakraInput,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { FaPlus, FaSearch, FaBook } from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { gradeBookV2GetByCourse } from "../../../services";

const GradeBookV2ListingPage = () => {
  const history = useHistory();
  const toast = useToast();
  const [courseId, setCourseId] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!courseId.trim()) {
      toast({ title: "Enter a course ID", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    setSearching(true);
    try {
      const { gradeBook } = await gradeBookV2GetByCourse(courseId.trim());
      history.push(`/admin/grade-book-v2/${gradeBook.id}`);
    } catch (err) {
      const msg = err?.response?.status === 404
        ? "No grade book found for this course. Create one first."
        : "Failed to fetch grade book.";
      toast({ title: msg, status: "error", duration: 3000, isClosable: true });
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box marginX="22px" marginY="20px">
      <Flex justifyContent="space-between" alignItems="center" mb="30px">
        <Heading fontSize="22px" fontWeight="600">Advanced Grade Book</Heading>
        <Button leftIcon={<FaPlus />} onClick={() => history.push("/admin/grade-book-v2/create")}>
          Create Grade Book
        </Button>
      </Flex>

      {/* Feature overview cards */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="16px" mb="30px">
        {[
          { label: "Weighted Grading", desc: "Define category weights that must sum to 100%", color: "#6b006b", bg: "#F0E6FF" },
          { label: "Score Entry", desc: "Add, edit, and override student scores per category", color: "#3182CE", bg: "#EBF4FF" },
          { label: "Analytics", desc: "Class averages, grade distribution, pass rates", color: "#38A169", bg: "#E6F4EA" },
          { label: "Audit Trail", desc: "Full log of every change with before/after values", color: "#DD6B20", bg: "#FFF5EA" },
        ].map((f) => (
          <Box key={f.label} bg={f.bg} borderRadius="8px" p="20px">
            <Text fontSize="15px" fontWeight="700" color={f.color} mb="6px">{f.label}</Text>
            <Text fontSize="13px" color="gray.600">{f.desc}</Text>
          </Box>
        ))}
      </Grid>

      {/* Find by Course */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="32px" mb="20px">
        <Flex alignItems="center" gap="8px" mb="16px">
          <FaSearch color="#6b006b" />
          <Text fontSize="16px" fontWeight="600" color="gray.700">Find Grade Book by Course</Text>
        </Flex>
        <Text fontSize="13px" color="gray.500" mb="16px">
          Enter a course UUID to open its grade book, or create a new one for a course.
        </Text>
        <Flex gap="12px" maxW="480px">
          <ChakraInput
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Course UUID…"
            size="sm"
            borderRadius="6px"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button size="sm" isLoading={searching} onClick={handleSearch}>
            Find
          </Button>
        </Flex>
      </Box>

      {/* Quick start CTA */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="32px" textAlign="center">
        <Box
          w="56px"
          h="56px"
          bg="#F0E6FF"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb="16px"
        >
          <FaBook color="#6b006b" size="22px" />
        </Box>
        <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="8px">
          Set Up a New Grade Book
        </Text>
        <Text fontSize="14px" color="gray.500" mb="20px" maxW="400px" mx="auto">
          Define assessment categories with weights, a grading scale, and calculation method for any course.
        </Text>
        <Button onClick={() => history.push("/admin/grade-book-v2/create")}>
          Create Grade Book
        </Button>
      </Box>
    </Box>
  );
};

export const GradeBookV2ListingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeBookV2ListingPage {...props} />} />
);

export default GradeBookV2ListingPageRoute;
