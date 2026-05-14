import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  Badge,
  Spinner,
  Progress,
} from "@chakra-ui/react";
import { FaBook, FaChevronRight } from "react-icons/fa";
import { Heading } from "../../../components";
import { userGetCourseListing, gradeBookV2GetByCourse, gradeBookV2GetMyGrades } from "../../../services";

const gradeColor = (grade) => {
  if (!grade) return { color: "#718096", bg: "#F7FAFC" };
  const g = grade.charAt(0).toUpperCase();
  if (g === "A") return { color: "#38A169", bg: "#E6F4EA" };
  if (g === "B") return { color: "#3182CE", bg: "#EBF4FF" };
  if (g === "C") return { color: "#DD6B20", bg: "#FFF5EA" };
  if (g === "D") return { color: "#E53E3E", bg: "#FED7D7" };
  if (g === "F") return { color: "#E53E3E", bg: "#FED7D7" };
  return { color: "#718096", bg: "#F7FAFC" };
};

const MyGradeBooksListPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { courses } = await userGetCourseListing();
        if (!courses?.length) {
          if (!cancelled) { setItems([]); setLoading(false); }
          return;
        }

        // Parallel fetch grade book + my-grades for each course
        const results = await Promise.all(
          courses.map(async (course) => {
            const courseId = course.id || course._id;
            try {
              const { gradeBook } = await gradeBookV2GetByCourse(courseId);
              if (!gradeBook?.id || String(gradeBook.status).toLowerCase() !== "published") {
                return null;
              }
              // Fetch student's grades for this grade book
              let breakdown = null;
              try {
                const res = await gradeBookV2GetMyGrades(gradeBook.id);
                breakdown = res.breakdown;
              } catch {
                // grades not yet available — still show the grade book
              }
              return { course, gradeBook, breakdown };
            } catch {
              return null;
            }
          })
        );

        if (!cancelled) {
          setItems(results.filter(Boolean));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box
      paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
      paddingY="32px"
      minH="100vh"
      bg="#F7F9FC"
    >
      <Flex justifyContent="space-between" alignItems="center" mb="28px">
        <Box>
          <Heading fontSize="24px" fontWeight="700" color="#1A202C">My Grade Books</Heading>
          <Text fontSize="14px" color="gray.500" mt="4px">
            Your published grade books across all enrolled courses
          </Text>
        </Box>
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && items.length === 0 && (
        <Box
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="12px"
          p="48px"
          textAlign="center"
        >
          <Box
            w="64px"
            h="64px"
            bg="#F0E6FF"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb="16px"
          >
            <FaBook color="#6b006b" size="24px" />
          </Box>
          <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="8px">
            No Grade Books Yet
          </Text>
          <Text fontSize="14px" color="gray.500" maxW="360px" mx="auto">
            Your instructor hasn't published any grade books for your courses yet. Check back later.
          </Text>
        </Box>
      )}

      {!loading && items.length > 0 && (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="16px">
          {items.map(({ course, gradeBook, breakdown }) => {
            const finalScore = breakdown?.finalScore;
            const finalGrade = breakdown?.finalGrade;
            const gc = gradeColor(finalGrade);
            const courseId = course.id || course._id;

            return (
              <Box
                key={gradeBook.id}
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="12px"
                overflow="hidden"
                cursor="pointer"
                onClick={() => history.push(`/grade-book/${gradeBook.id}`)}
                _hover={{ borderColor: "#6b006b", shadow: "md" }}
                transition="all 0.15s"
              >
                {/* Top color bar */}
                <Box h="4px" bg="#6b006b" />

                <Box p="20px">
                  {/* Course name */}
                  <Text fontSize="13px" color="gray.400" fontWeight="500" mb="4px" noOfLines={1}>
                    {course.title || course.name}
                  </Text>

                  {/* Grade book title */}
                  <Text fontSize="16px" fontWeight="700" color="#1A202C" mb="14px" noOfLines={2}>
                    {gradeBook.title}
                  </Text>

                  {/* Grade + score */}
                  {finalGrade ? (
                    <>
                      <Flex alignItems="center" gap="12px" mb="12px">
                        <Box
                          bg={gc.bg}
                          color={gc.color}
                          borderRadius="10px"
                          px="14px"
                          py="8px"
                          textAlign="center"
                          minW="56px"
                        >
                          <Text fontSize="24px" fontWeight="800" lineHeight="1">{finalGrade}</Text>
                          <Text fontSize="10px" fontWeight="500" mt="2px">Grade</Text>
                        </Box>
                        <Box flex="1">
                          <Flex justifyContent="space-between" mb="4px">
                            <Text fontSize="12px" color="gray.500">Score</Text>
                            <Text fontSize="12px" fontWeight="700" color={gc.color}>
                              {(finalScore ?? 0).toFixed(1)}%
                            </Text>
                          </Flex>
                          <Progress
                            value={finalScore ?? 0}
                            size="sm"
                            borderRadius="4px"
                            sx={{ "& > div": { background: gc.color } }}
                          />
                        </Box>
                      </Flex>

                      {/* Category breakdown mini-bar */}
                      {breakdown?.breakdown?.length > 0 && (
                        <Flex gap="2px" borderRadius="4px" overflow="hidden" h="6px" mb="14px">
                          {breakdown.breakdown.map((cat, i) => {
                            const colors = ["#6b006b", "#3182CE", "#38A169", "#DD6B20", "#E53E3E"];
                            return (
                              <Box
                                key={cat.category}
                                flex={cat.weight}
                                bg={colors[i % colors.length]}
                                title={`${cat.category}: ${cat.weight}%`}
                              />
                            );
                          })}
                        </Flex>
                      )}
                    </>
                  ) : (
                    <Box
                      bg="#F7FAFC"
                      borderRadius="8px"
                      px="12px"
                      py="10px"
                      mb="14px"
                    >
                      <Text fontSize="13px" color="gray.400" textAlign="center">
                        Grades not yet available
                      </Text>
                    </Box>
                  )}

                  {/* Footer */}
                  <Flex justifyContent="space-between" alignItems="center">
                    <Flex gap="8px">
                      <Badge
                        bg="#E6F4EA"
                        color="#38A169"
                        px="8px"
                        py="3px"
                        borderRadius="10px"
                        textTransform="none"
                        fontSize="11px"
                        fontWeight="500"
                      >
                        Published
                      </Badge>
                      <Badge
                        bg="#F7FAFC"
                        color="#718096"
                        px="8px"
                        py="3px"
                        borderRadius="10px"
                        textTransform="none"
                        fontSize="11px"
                      >
                        {(gradeBook.calculationMethod || "").replace("_", " ")}
                      </Badge>
                    </Flex>
                    <Flex alignItems="center" gap="4px" color="#6b006b">
                      <Text fontSize="12px" fontWeight="600">View</Text>
                      <FaChevronRight size="10px" />
                    </Flex>
                  </Flex>
                </Box>
              </Box>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export const MyGradeBooksListPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MyGradeBooksListPage {...props} />} />
);

export default MyGradeBooksListPageRoute;
