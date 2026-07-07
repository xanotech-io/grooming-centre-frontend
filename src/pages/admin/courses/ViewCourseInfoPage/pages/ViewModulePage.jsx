import { Route, useParams } from "react-router-dom";
import { Box, Grid } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Heading, Link, Spinner, Text } from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { adminGetModule } from "../../../../../services";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const ViewModulePage = () => {
  const { courseId, moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetModule(courseId, moduleId)
      .then(({ module: mod }) => setModule(mod))
      .catch(() => setError("Failed to load module details."))
      .finally(() => setIsLoading(false));
  }, [courseId, moduleId]);

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
          <BreadcrumbItem isCurrentPage>
            <Link href="#">{module.title}</Link>
          </BreadcrumbItem>
        }
      />

      <Heading as="h1" fontSize="heading.h3" marginBottom={8}>
        {module.title}
      </Heading>

      <Box backgroundColor="white" padding={8} borderRadius="md" boxShadow="sm">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Title
            </Text>
            <Text fontSize="text.level2">{module.title}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Sequence Order
            </Text>
            <Text fontSize="text.level2">{module.sequenceOrder}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Status
            </Text>
            <Badge colorScheme={{ Approved: "green", Pending: "orange", Rejected: "red" }[module.approvalStatus] || "gray"}>
              {module.approvalStatus}
            </Badge>
          </Box>

          <Box>
            <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
              Created At
            </Text>
            <Text fontSize="text.level2">
              {dayjs(module.createdAt).format("DD/MM/YYYY h:mm a")}
            </Text>
          </Box>

          {module.description && (
            <Box gridColumn={{ md: "span 2" }}>
              <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                Description
              </Text>
              <Text fontSize="text.level2">{module.description}</Text>
            </Box>
          )}
        </Grid>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ViewModulePageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ViewModulePage {...props} />}
    />
  );
};

export default ViewModulePageRoute;
