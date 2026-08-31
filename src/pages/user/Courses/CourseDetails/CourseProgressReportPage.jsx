import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid, HStack } from "@chakra-ui/layout";
import { Badge } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExportMenu, Heading, Spinner, Text } from "../../../../components";
import { getCourseProgress, adminListModules } from "../../../../services";
import { maxWidthStyles_userPages } from "../../../../theme/breakpoints";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import Icon from "@chakra-ui/icon";
import dayjs from "dayjs";

const ProgressBar = ({ percentage, colorScheme = "blue", height = "10px" }) => (
  <Box height={height} backgroundColor="gray.200" borderRadius="full" overflow="hidden">
    <Box
      height="100%"
      width={`${Math.min(percentage, 100)}%`}
      backgroundColor={colorScheme === "green" ? "green.400" : "primary.base"}
      borderRadius="full"
      transition="width .4s ease"
    />
  </Box>
);

const CourseProgressReportPage = () => {
  const { id: courseId } = useParams();

  const [progress, setProgress] = useState(null);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [progressData, { modules: moduleList }] = await Promise.all([
          getCourseProgress(courseId),
          adminListModules(courseId).catch(() => ({ modules: [] })),
        ]);
        setProgress(progressData);
        setModules(moduleList);
      } catch (err) {
        setError("Failed to load progress report.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [courseId]);

  if (isLoading) {
    return (
      <Flex height="60vh" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex height="60vh" justifyContent="center" alignItems="center">
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }

  const isComplete = progress.completionPercentage === 100;

  // Build merged module list: match API moduleProgress items with module titles
  const moduleProgressMap = {};
  (progress.moduleProgress || []).forEach((mp) => {
    if (mp.moduleId) moduleProgressMap[mp.moduleId] = mp;
  });

  const displayModules = modules.length > 0 ? modules : progress.moduleProgress || [];
  const exportRows = [
    ["Module", "Status", "Completion (%)", "Lessons Completed", "Completed Date"],
    ...displayModules.map((mod, idx) => {
      const mp = moduleProgressMap[mod.id] || mod;
      const pct = mp.completionPercentage ?? 0;
      const isModDone = mp.isModuleCompleted ?? pct === 100;
      return [
        mod.title || `Module ${idx + 1}`,
        isModDone ? "Done" : pct > 0 ? "In Progress" : "Not started",
        pct,
        mp.completedLessonsCount != null ? `${mp.completedLessonsCount}/${mp.totalLessons}` : "",
        isModDone && mp.completedAt ? dayjs(mp.completedAt).format("MMM D, YYYY") : "",
      ];
    }),
  ];

  return (
    <Box paddingY={{ base: 4, laptop: 8 }} paddingX={{ base: 4, laptop: 8 }}>
      <Box {...maxWidthStyles_userPages}>
        <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={3}>
          <Heading as="h2" fontSize="heading.h3" mb={0}>
            Progress Report
          </Heading>
          <ExportMenu rows={exportRows} filename="course-progress-report" title="Course Progress Report" />
        </Flex>

        {/* Overall summary card */}
        <Box
          backgroundColor="white"
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
          p={6}
          mb={6}
          boxShadow="sm"
        >
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={4}
            mb={5}
          >
            <Box>
              <Text bold fontSize="text.level1" color="gray.700">
                Overall Completion
              </Text>
              <Text as="level5" color="gray.500" mt={1}>
                {progress.completedModules} of {progress.totalModules} modules completed
              </Text>
            </Box>

            <Flex alignItems="center" gap={3}>
              <Text fontSize="heading.h3" fontWeight="bold" color={isComplete ? "green.500" : "primary.base"}>
                {progress.completionPercentage}%
              </Text>
              <Badge
                colorScheme={isComplete ? "green" : "blue"}
                fontSize="12px"
                px={3}
                py={1}
                borderRadius="full"
              >
                {isComplete ? "Completed" : "In Progress"}
              </Badge>
            </Flex>
          </Flex>

          <ProgressBar
            percentage={progress.completionPercentage}
            colorScheme={isComplete ? "green" : "blue"}
            height="12px"
          />

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={5}>
            <Box
              backgroundColor="blue.50"
              borderRadius="md"
              p={4}
              textAlign="center"
            >
              <Text fontSize="heading.h4" fontWeight="bold" color="blue.600">
                {progress.totalModules}
              </Text>
              <Text as="level5" color="blue.500">Total Modules</Text>
            </Box>
            <Box
              backgroundColor="green.50"
              borderRadius="md"
              p={4}
              textAlign="center"
            >
              <Text fontSize="heading.h4" fontWeight="bold" color="green.600">
                {progress.completedModules}
              </Text>
              <Text as="level5" color="green.500">Completed</Text>
            </Box>
            <Box
              backgroundColor="orange.50"
              borderRadius="md"
              p={4}
              textAlign="center"
            >
              <Text fontSize="heading.h4" fontWeight="bold" color="orange.600">
                {progress.totalModules - progress.completedModules}
              </Text>
              <Text as="level5" color="orange.500">Remaining</Text>
            </Box>
          </Grid>
        </Box>

        {/* Module breakdown */}
        <Box
          backgroundColor="white"
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
          overflow="hidden"
          boxShadow="sm"
        >
          <Box
            px={6}
            py={4}
            borderBottom="1px"
            borderColor="gray.200"
            backgroundColor="gray.50"
          >
            <Text bold color="gray.600">
              Module Breakdown
            </Text>
          </Box>

          {modules.length === 0 && Object.keys(moduleProgressMap).length === 0 ? (
            <Box px={6} py={8} textAlign="center">
              <Text color="gray.400">No module data available.</Text>
            </Box>
          ) : (
            (modules.length > 0 ? modules : progress.moduleProgress || []).map(
              (mod, idx) => {
                const mp = moduleProgressMap[mod.id] || mod;
                const pct = mp.completionPercentage ?? 0;
                const isModDone = mp.isModuleCompleted ?? pct === 100;

                return (
                  <Box
                    key={mod.id || idx}
                    px={6}
                    py={4}
                    borderBottom="1px"
                    borderColor="gray.100"
                    _last={{ borderBottom: "none" }}
                  >
                    <Flex justifyContent="space-between" alignItems="center" mb={2}>
                      <HStack spacing={3}>
                        <Icon
                          color={isModDone ? "green.400" : "gray.300"}
                          fontSize="18px"
                        >
                          {isModDone ? <FaCheckCircle /> : <FaRegCircle />}
                        </Icon>
                        <Box>
                          <Text bold fontSize="sm">
                            {mod.title || `Module ${idx + 1}`}
                          </Text>
                          {mp.completedLessonsCount != null && (
                            <Text as="level5" color="gray.500">
                              {mp.completedLessonsCount}/{mp.totalLessons} lessons completed
                            </Text>
                          )}
                          {isModDone && mp.completedAt && (
                            <Text as="level5" color="green.500">
                              Completed {dayjs(mp.completedAt).format("MMM D, YYYY")}
                            </Text>
                          )}
                        </Box>
                      </HStack>

                      <HStack spacing={3} flexShrink={0}>
                        <Badge
                          colorScheme={isModDone ? "green" : pct > 0 ? "blue" : "gray"}
                          fontSize="10px"
                          px={2}
                          py="2px"
                          borderRadius="full"
                        >
                          {isModDone ? "Done" : pct > 0 ? `${pct}%` : "Not started"}
                        </Badge>
                      </HStack>
                    </Flex>

                    <Box pl="30px">
                      <ProgressBar
                        percentage={pct}
                        colorScheme={isModDone ? "green" : "blue"}
                        height="6px"
                      />
                    </Box>
                  </Box>
                );
              }
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const CourseProgressReportPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <CourseProgressReportPage {...props} />}
    />
  );
};

export default CourseProgressReportPageRoute;
