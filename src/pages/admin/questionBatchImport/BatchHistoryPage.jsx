import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Flex,
  IconButton,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Button, Heading } from "../../../components";
import { deleteBatchImport, listBatchImports } from "../../../services";
import { useApp } from "../../../contexts/App/useApp";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiEye, FiFileText, FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";

const STATUS_STYLE = {
  pending:        { bg: "#F7FAFC", color: "#718096", label: "Pending" },
  processing:     { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
  success:        { bg: "#E6F4EA", color: "#38A169", label: "Success" },
  partial_success:{ bg: "#FFF5EA", color: "#DD6B20", label: "Partial Success" },
  failed:         { bg: "#FFF5F5", color: "#E53E3E", label: "Failed" },
};

const StatusChip = ({ status }) => {
  const s = STATUS_STYLE[status] ?? { bg: "#F7FAFC", color: "#718096", label: status };
  return (
    <Badge bg={s.bg} color={s.color} px="8px" py="2px" borderRadius="6px" textTransform="none" fontSize="11px" fontWeight="600">
      {s.label}
    </Badge>
  );
};

const LIMIT = 20;

const BatchHistoryPage = () => {
  const { examinationId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const { state, getOneMetadata } = useApp();
  const userRole = getOneMetadata("userRoles", state.user?.userRoleId);
  const isAdmin = /admin/i.test(userRole?.name);

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef();

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (examinationId) params.examinationId = examinationId;
      if (statusFilter) params.uploadStatus = statusFilter;
      const res = await listBatchImports(params);
      const list = res?.data?.uploads ?? res?.uploads ?? res?.data ?? [];
      const pagination = res?.data?.pagination ?? res?.pagination ?? {};
      setUploads(Array.isArray(list) ? list : []);
      setTotal(pagination.total ?? res?.total ?? 0);
      setTotalPages(pagination.totalPages ?? res?.totalPages ?? 1);
    } catch {
      setError("Failed to load upload history.");
    } finally {
      setLoading(false);
    }
  }, [examinationId, page, statusFilter]);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteBatchImport(toDelete);
      toast({ title: "Upload record deleted", status: "success", duration: 3000, isClosable: true });
      setToDelete(null);
      fetchUploads();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        toast({ title: "Admin or Super Admin role required to delete records", status: "error", duration: 4000, isClosable: true });
      } else {
        toast({ title: "Failed to delete upload record", status: "error", duration: 3000, isClosable: true });
      }
    } finally {
      setDeleting(false);
    }
  };

  const getResultPath = (upload) => {
    const examId = upload.examinationId ?? examinationId;
    const uid = upload.id ?? upload.uploadId ?? upload._id;
    return `/admin/batch-import/${examId}/result/${uid}`;
  };

  const getReportPath = (upload) => `${getResultPath(upload)}/report`;

  return (
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" justifyContent="space-between" mb="24px" flexWrap="wrap" gap="12px">
        <Flex alignItems="center" gap="12px">
          <Flex as="button" alignItems="center" gap="6px" color="#6b006b" onClick={() => history.goBack()} _hover={{ opacity: 0.8 }}>
            <FiArrowLeft size={14} />
            <Text fontSize="13px" fontWeight="600">Back</Text>
          </Flex>
          <Box w="1px" h="20px" bg="#E2E8F0" />
          <Heading fontSize="22px" fontWeight="600">Batch Upload History</Heading>
        </Flex>
        {examinationId && (
          <Button onClick={() => history.push(`/admin/batch-import/${examinationId}`)}>
            + New Import
          </Button>
        )}
      </Flex>

      {/* Filters */}
      <Flex gap="12px" mb="16px" flexWrap="wrap">
        <Select
          size="sm"
          borderRadius="6px"
          maxW="220px"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          placeholder="All statuses"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="success">Success</option>
          <option value="partial_success">Partial Success</option>
          <option value="failed">Failed</option>
        </Select>
      </Flex>

      {loading && (
        <Flex justifyContent="center" py="60px"><Spinner size="xl" color="#6b006b" /></Flex>
      )}

      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p="16px">
          <Text color="red.600" fontSize="14px">{error}</Text>
        </Box>
      )}

      {!loading && !error && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
          {uploads.length === 0 ? (
            <Flex direction="column" alignItems="center" py="60px" gap="12px">
              <Text fontSize="14px" color="gray.400">No batch uploads found.</Text>
              {examinationId && (
                <Button onClick={() => history.push(`/admin/batch-import/${examinationId}`)}>
                  Start First Import
                </Button>
              )}
            </Flex>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="#F7FAFC">
                  <Tr>
                    {["File Name", "Exam", "Course", "Status", "Total", "Valid", "Errors", "Imported", "Date", "Actions"].map((h) => (
                      <Th key={h} py="12px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {uploads.map((u) => {
                    const uid = u.id ?? u.uploadId ?? u._id;
                    return (
                      <Tr key={uid} _hover={{ bg: "#FAFAFA" }}>
                        <Td py="12px" maxW="180px">
                          <Text fontSize="12px" fontWeight="500" color="#1A202C" noOfLines={1}>{u.fileName ?? "—"}</Text>
                          <Text fontSize="10px" color="gray.400" textTransform="uppercase">{u.fileType ?? ""}</Text>
                        </Td>
                        <Td py="12px" maxW="140px">
                          <Text fontSize="12px" color="gray.600" noOfLines={1}>{u.examination?.title ?? u.examinationId ?? "—"}</Text>
                        </Td>
                        <Td py="12px" maxW="120px">
                          <Text fontSize="12px" color="gray.600" noOfLines={1}>{u.course?.title ?? u.courseId ?? "—"}</Text>
                        </Td>
                        <Td py="12px">
                          <StatusChip status={u.uploadStatus} />
                        </Td>
                        <Td py="12px"><Text fontSize="12px" color="gray.600">{u.totalRows ?? "—"}</Text></Td>
                        <Td py="12px"><Text fontSize="12px" color="#38A169" fontWeight="600">{u.validRows ?? "—"}</Text></Td>
                        <Td py="12px"><Text fontSize="12px" color="#E53E3E" fontWeight="600">{u.errorRows ?? "—"}</Text></Td>
                        <Td py="12px"><Text fontSize="12px" color="#6b006b" fontWeight="700">{u.importedCount ?? "—"}</Text></Td>
                        <Td py="12px">
                          <Text fontSize="11px" color="gray.500">{u.createdAt ? dayjs(u.createdAt).format("DD/MM/YY HH:mm") : "—"}</Text>
                        </Td>
                        <Td py="12px">
                          <Flex gap="4px">
                            <IconButton
                              aria-label="View details"
                              icon={<FiEye size={13} />}
                              size="xs" variant="ghost" colorScheme="purple"
                              onClick={() => history.push(getResultPath(u))}
                            />
                            <IconButton
                              aria-label="View report"
                              icon={<FiFileText size={13} />}
                              size="xs" variant="ghost" colorScheme="blue"
                              onClick={() => history.push(getReportPath(u))}
                            />
                            {isAdmin && (
                              <IconButton
                                aria-label="Delete record"
                                icon={<FiTrash2 size={13} />}
                                size="xs" variant="ghost" colorScheme="red"
                                onClick={() => setToDelete(uid)}
                              />
                            )}
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {totalPages > 1 && (
            <Flex justifyContent="space-between" alignItems="center" px="20px" py="12px" borderTop="1px solid #E2E8F0">
              <Text fontSize="13px" color="gray.500">Page {page} of {totalPages} · {total} total</Text>
              <Flex gap="8px">
                <Button secondary size="sm" isDisabled={page <= 1} leftIcon={<FiChevronLeft />} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button secondary size="sm" isDisabled={page >= totalPages} rightIcon={<FiChevronRight />} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </Flex>
            </Flex>
          )}
        </Box>
      )}

      {/* Delete Confirmation */}
      <AlertDialog isOpen={Boolean(toDelete)} leastDestructiveRef={cancelRef} onClose={() => setToDelete(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">Delete Upload Record?</AlertDialogHeader>
            <AlertDialogBody fontSize="14px">
              This will delete the upload log and its error records.{" "}
              <Text as="span" fontWeight="600">Imported questions will NOT be removed</Text> — only this upload audit entry is deleted.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={cancelRef} onClick={() => setToDelete(null)}>Cancel</Button>
              <Button isLoading={deleting} onClick={handleDelete}>Delete Record</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export const BatchHistoryPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BatchHistoryPage {...props} />} />
);

export default BatchHistoryPageRoute;
