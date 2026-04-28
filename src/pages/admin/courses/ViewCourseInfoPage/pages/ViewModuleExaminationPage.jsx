import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Heading, Link, Spinner, Text } from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { adminListModuleExaminations } from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const ViewModuleExaminationPage = () => {
  const { courseId, moduleId, examinationId } = useParams();
  const [examination, setExamination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamination = async () => {
      try {
        const { examinations } = await adminListModuleExaminations(moduleId);
        const found = examinations.find((e) => e.id === examinationId);
        if (!found) {
          setError("Examination not found.");
        } else {
          setExamination(found);
        }
      } catch (err) {
        setError("Failed to load examination details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamination();
  }, [moduleId, examinationId]);

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

  const duration = getDuration(examination.duration);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem>
            <Link href="/admin/courses">Courses</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem>
            <Link href={`/admin/courses/details/${courseId}/modules`}>
              Modules
            </Link>
          </BreadcrumbItem>
        }
        item4={
          <BreadcrumbItem>
            <Link href={`/admin/courses/${courseId}/module/${moduleId}/examinations`}>
              Examinations
            </Link>
          </BreadcrumbItem>
        }
        item5={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">{examination.title}</Link>
          </BreadcrumbItem>
        }
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={8}
      >
        <Heading as="h1" fontSize="heading.h3">
          {examination.title}
        </Heading>
        <Badge
          colorScheme={examination.active ? "green" : "gray"}
          fontSize="text.level2"
          paddingX={3}
          paddingY={1}
        >
          {examination.active ? "Active" : "Inactive"}
        </Badge>
      </Flex>

      <Box backgroundColor="white" padding={8} borderRadius="md" boxShadow="sm">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Title
            </Text>
            <Text fontSize="text.level2">{examination.title}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Duration
            </Text>
            <Text fontSize="text.level2">{duration.combinedText}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Amount of Questions
            </Text>
            <Text fontSize="text.level2">{examination.amountOfQuestions}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Start Time
            </Text>
            <Text fontSize="text.level2">
              {dayjs(examination.startTime).format("DD/MM/YYYY h:mm a")}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Created At
            </Text>
            <Text fontSize="text.level2">
              {dayjs(examination.createdAt).format("DD/MM/YYYY h:mm a")}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Status
            </Text>
            <Badge colorScheme={examination.active ? "green" : "gray"}>
              {examination.active ? "Active" : "Inactive"}
            </Badge>
          </Box>
        </Grid>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ViewModuleExaminationPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ViewModuleExaminationPage {...props} />}
    />
  );
};

export default ViewModuleExaminationPageRoute;
