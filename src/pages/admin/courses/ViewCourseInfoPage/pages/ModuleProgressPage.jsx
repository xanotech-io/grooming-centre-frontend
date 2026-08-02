import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Heading, Link, Spinner, Text } from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { getModuleProgress } from "../../../../../services";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Icon from "@chakra-ui/icon";
import dayjs from "dayjs";

const ProgressBar = ({ percentage }) => (
  <Box height="10px" backgroundColor="gray.200" borderRadius="full" overflow="hidden">
    <Box
      height="100%"
      width={`${Math.min(percentage, 100)}%`}
      backgroundColor={percentage === 100 ? "green.400" : "primary.base"}
      borderRadius="full"
      transition="width .4s ease"
    />
  </Box>
);

const ModuleProgressPage = () => {
  const { courseId, moduleId } = useParams();

  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getModuleProgress(moduleId);
        setProgress(data);
      } catch {
        setError("Failed to load module progress.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [moduleId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" paddingTop="100px">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <AdminMainAreaWrapper>
        <Box paddingY={10} paddingX={6}>
          <Text color="red.500">{error}</Text>
        </Box>
      </AdminMainAreaWrapper>
    );
  }

  const isComplete = progress.isModuleCompleted || progress.completionPercentage === 100;

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={<BreadcrumbItem><Link href="/admin/courses">Courses</Link></BreadcrumbItem>}
        item3={
          <BreadcrumbItem>
            <Link href={`/admin/courses/details/${courseId}/modules`}>Modules</Link>
          </BreadcrumbItem>
        }
        item4={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Progress</Link>
          </BreadcrumbItem>
        }
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Heading as="h1" fontSize="heading.h3">
          Module Progress Report
        </Heading>
        <Badge
          colorScheme={isComplete ? "green" : progress.completionPercentage > 0 ? "blue" : "gray"}
          fontSize="12px"
          px={3}
          py={1}
          borderRadius="full"
        >
          {isComplete ? "Completed" : progress.completionPercentage > 0 ? "In Progress" : "Not Started"}
        </Badge>
      </Flex>

      <Box backgroundColor="white" borderRadius="lg" border="1px" borderColor="gray.200" p={6} mb={6} boxShadow="sm">
        <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={4} mb={4}>
          <Box>
            <Text bold fontSize="text.level1" color="gray.700">Lesson Completion</Text>
            <Text as="level5" color="gray.500" mt={1}>
              {progress.completedLessonsCount} of {progress.totalLessons} lessons completed
            </Text>
          </Box>
          <Flex alignItems="center" gap={3}>
            {isComplete && (
              <Icon color="green.400" fontSize="22px">
                <FaCheckCircle />
              </Icon>
            )}
            <Text fontSize="heading.h3" fontWeight="bold" color={isComplete ? "green.500" : "primary.base"}>
              {progress.completionPercentage}%
            </Text>
          </Flex>
        </Flex>

        <ProgressBar percentage={progress.completionPercentage} />

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={5}>
          <Box backgroundColor="blue.50" borderRadius="md" p={4} textAlign="center">
            <Text fontSize="heading.h4" fontWeight="bold" color="blue.600">
              {progress.totalLessons}
            </Text>
            <Text as="level5" color="blue.500">Total Lessons</Text>
          </Box>
          <Box backgroundColor="green.50" borderRadius="md" p={4} textAlign="center">
            <Text fontSize="heading.h4" fontWeight="bold" color="green.600">
              {progress.completedLessonsCount}
            </Text>
            <Text as="level5" color="green.500">Completed</Text>
          </Box>
          <Box backgroundColor="orange.50" borderRadius="md" p={4} textAlign="center">
            <Text fontSize="heading.h4" fontWeight="bold" color="orange.600">
              {progress.totalLessons - progress.completedLessonsCount}
            </Text>
            <Text as="level5" color="orange.500">Remaining</Text>
          </Box>
        </Grid>
      </Box>

      {(isComplete || progress.completedAt) && (
        <Box backgroundColor="green.50" borderRadius="md" border="1px" borderColor="green.200" p={4}>
          <Flex alignItems="center" gap={2}>
            <Icon color="green.500"><FaCheckCircle /></Icon>
            <Text bold color="green.700">
              Module completed{progress.completedAt ? ` on ${dayjs(progress.completedAt).format("MMMM D, YYYY")}` : ""}
            </Text>
          </Flex>
        </Box>
      )}
    </AdminMainAreaWrapper>
  );
};

export const ModuleProgressPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ModuleProgressPage {...props} />} />
  );
};

export default ModuleProgressPageRoute;
