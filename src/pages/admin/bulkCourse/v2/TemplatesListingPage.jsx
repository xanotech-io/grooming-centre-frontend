import React, { useCallback, useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  BreadcrumbItem,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { FaPlus, FaArrowLeft, FaEdit } from "react-icons/fa";
import { Breadcrumb, Button, Heading, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../../hooks";
import { adminGetBulkCourseV2Templates } from "../../../../services";

const TemplatesListingPage = () => {
  const history = useHistory();
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { templates } = await adminGetBulkCourseV2Templates();
    return { templates };
  }, []);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const templates = resource.data?.templates ?? [];

  return (
    <AdminMainAreaWrapper>
    <Box marginX="22px" marginY="20px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/bulk-courses">Bulk Course Creation</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Templates</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/bulk-courses")}
        />
        <Heading fontSize="22px" fontWeight="600">
          Course Templates
        </Heading>
        <Box ml="auto">
          <Button
            leftIcon={<FaPlus />}
            onClick={() => history.push("/admin/bulk-courses/templates/create")}
          >
            New Template
          </Button>
        </Box>
      </Flex>

      <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
        {resource.loading && (
          <Flex justifyContent="center" py="40px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        )}

        {resource.err && (
          <Flex justifyContent="center" py="40px">
            <Text color="red.500">Failed to load templates. Please try again.</Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && templates.length === 0 && (
          <Flex justifyContent="center" py="40px">
            <Text color="gray.400">No templates found. Create one to get started.</Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && templates.length > 0 && (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Name", "Description", "Category", "Status", "Actions"].map((h) => (
                    <Th key={h} py="14px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">
                      {h}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {templates.map((tpl) => (
                  <Tr key={tpl.id || tpl.templateId} _hover={{ bg: "#F7FAFC" }}>
                    <Td py="14px" fontSize="14px" fontWeight="500">
                      {tpl.name || tpl.templateName}
                    </Td>
                    <Td py="14px" fontSize="13px" color="gray.600" maxW="300px">
                      <Text noOfLines={2}>{tpl.description || "—"}</Text>
                    </Td>
                    <Td py="14px" fontSize="13px">{tpl.category || "—"}</Td>
                    <Td py="14px">
                      <Badge
                        bg={tpl.isActive !== false ? "#E6F4EA" : "#F7FAFC"}
                        color={tpl.isActive !== false ? "#38A169" : "#718096"}
                        px="10px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500"
                      >
                        {tpl.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td py="14px">
                      <IconButton
                        aria-label="Edit template"
                        icon={<FaEdit />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() =>
                          history.push(`/admin/bulk-courses/templates/${tpl.id || tpl.templateId}/edit`)
                        }
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const TemplatesListingPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <TemplatesListingPage {...props} />} />
);

export default TemplatesListingPageRoute;
