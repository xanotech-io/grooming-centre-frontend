import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
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
  BreadcrumbItem,
  IconButton,
  Tooltip,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import { adminGetExamPaperConfigPresets, adminDeleteExamPaperConfigPreset } from "../../../services";

const ExamPaperConfigPresetsPage = () => {
  const history = useHistory();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [presetToDelete, setPresetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const deleteRef = React.useRef();

  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { presets, pagination } = await adminGetExamPaperConfigPresets({ page, limit });
    return { presets, pagination };
  }, [page]);

  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const confirmDelete = (e, preset) => {
    e.stopPropagation();
    setPresetToDelete(preset);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    onDeleteClose();
    if (!presetToDelete) return;
    setDeleting(true);
    try {
      await adminDeleteExamPaperConfigPreset(presetToDelete.id);
      toast({ title: "Exam template deleted", status: "success", duration: 3000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to delete exam template", status: "error", duration: 4000, isClosable: true });
    } finally {
      setDeleting(false);
      setPresetToDelete(null);
    }
  };

  const presets = resource.data?.presets || [];
  const pagination = resource.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems ?? presets.length;

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem isCurrentPage><Link href="#">Exam Template Library</Link></BreadcrumbItem>}
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Box>
            <Heading fontSize="22px" fontWeight="600">Exam Template Library</Heading>
            <Text fontSize="13px" color="gray.500" mt="4px">
              Reusable exam paper configurations you can apply across exams, assessments, and standalone exams.
            </Text>
          </Box>
          <Button
            leftIcon={<FaPlus />}
            onClick={() => history.push("/admin/exam-paper-config-presets/create")}
          >
            Create Exam Template
          </Button>
        </Flex>

        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
          {resource.loading && (
            <Flex justifyContent="center" py="40px"><Spinner size="lg" color="purple.500" /></Flex>
          )}
          {resource.err && (
            <Flex justifyContent="center" py="40px"><Text color="red.500">Failed to load exam templates.</Text></Flex>
          )}
          {!resource.loading && !resource.err && (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="#F7FAFC">
                  <Tr>
                    <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">Name</Th>
                    <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">Creator</Th>
                    <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none" isNumeric>Usage Count</Th>
                    <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">Courses Used In</Th>
                    <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {presets.length === 0 && (
                    <Tr>
                      <Td colSpan={5} py="30px" textAlign="center">
                        <Text color="gray.400" fontSize="14px">No exam templates found.</Text>
                      </Td>
                    </Tr>
                  )}
                  {presets.map((p) => {
                    const isLocked = (p.usageCount ?? 0) > 0;
                    const coursesUsedIn = p.coursesUsedIn ?? [];
                    return (
                      <Tr
                        key={p.id}
                        _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                        onClick={() => history.push(`/admin/exam-paper-config-presets/${p.id}`)}
                      >
                        <Td py="12px" fontSize="13px" fontWeight="500" color="gray.800">{p.name}</Td>
                        <Td py="12px" fontSize="13px" color="gray.600">
                          {p.creator ? `${p.creator.firstName || ""} ${p.creator.lastName || ""}`.trim() : "—"}
                        </Td>
                        <Td py="12px" fontSize="13px" isNumeric>
                          <Badge bg={isLocked ? "#EBF4FF" : "#F7FAFC"} color={isLocked ? "#3182CE" : "#718096"} px="8px" py="2px" borderRadius="10px" textTransform="none">
                            {p.usageCount ?? 0}
                          </Badge>
                        </Td>
                        <Td py="12px" fontSize="13px" color="gray.600">
                          {coursesUsedIn.length > 0
                            ? coursesUsedIn.map((c) => c.title).join(", ")
                            : "—"}
                        </Td>
                        <Td py="12px" fontSize="13px">
                          <Flex gap="4px">
                            <IconButton
                              aria-label="Edit exam template"
                              icon={<FaPencilAlt />}
                              size="xs"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                history.push(`/admin/exam-paper-config-presets/${p.id}`);
                              }}
                            />
                            <Tooltip label={isLocked ? "Cannot delete template in use" : ""} isDisabled={!isLocked}>
                              <IconButton
                                aria-label="Delete exam template"
                                icon={<FaTrash />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                isDisabled={isLocked}
                                onClick={(e) => confirmDelete(e, p)}
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {!resource.loading && totalPages > 1 && (
            <Flex justifyContent="space-between" alignItems="center" px="20px" py="12px" borderTop="1px solid #E2E8F0">
              <Text fontSize="13px" color="gray.500">Page {page} of {totalPages} ({totalItems} total)</Text>
              <Flex gap="8px">
                <Button size="xs" variant="outline" isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button size="xs" variant="outline" isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </Flex>
            </Flex>
          )}
        </Box>
      </Box>

      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={deleteRef} onClose={onDeleteClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">Delete Exam Template?</AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              This cannot be undone. Delete “{presetToDelete?.name}”?
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={deleteRef} onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" isLoading={deleting} onClick={handleDelete}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </AdminMainAreaWrapper>
  );
};

export const ExamPaperConfigPresetsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamPaperConfigPresetsPage {...props} />} />
);

export default ExamPaperConfigPresetsPageRoute;
