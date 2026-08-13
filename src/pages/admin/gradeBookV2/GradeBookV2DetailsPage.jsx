import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Grid,
  Badge,
  Spinner,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  Select as ChakraSelect,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  BreadcrumbItem,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaChevronDown,
  FaDownload,
  FaUnlink,
  FaArchive,
  FaBoxOpen,
} from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import {
  gradeBookV2GetById,
  gradeBookV2GetCourses,
  gradeBookV2Detach,
  gradeBookV2Archive,
  gradeBookV2Unarchive,
  gradeBookV2Publish,
  gradeBookV2GetAudit,
  gradeBookV2Export,
} from "../../../services";

// ── Main Page ─────────────────────────────────────────────────────────────────

const GradeBookV2DetailsPage = () => {
  const history = useHistory();
  const { gradebookId } = useParams();
  const toast = useToast();
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [detaching, setDetaching] = useState(false);
  const [detachTargetId, setDetachTargetId] = useState("");
  const { isOpen: isPublishOpen, onOpen: onPublishOpen, onClose: onPublishClose } = useDisclosure();
  const { isOpen: isArchiveOpen, onOpen: onArchiveOpen, onClose: onArchiveClose } = useDisclosure();
  const { isOpen: isDetachOpen, onOpen: onDetachOpen, onClose: onDetachClose } = useDisclosure();
  const publishRef = React.useRef();
  const archiveRef = React.useRef();
  const detachRef = React.useRef();

  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { gradeBook } = await gradeBookV2GetById(gradebookId);
    return { gradeBook };
  }, [gradebookId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const { resource: coursesResource, handleFetchResource: fetchCourses } = useFetch();
  const coursesFetcher = useCallback(async () => {
    const { courses } = await gradeBookV2GetCourses(gradebookId);
    return { courses };
  }, [gradebookId]);
  useEffect(() => { fetchCourses({ fetcher: coursesFetcher }); }, [fetchCourses, coursesFetcher]);

  const { resource: auditResource, handleFetchResource: fetchAudit } = useFetch();
  const auditFetcher = useCallback(async () => {
    const { audit } = await gradeBookV2GetAudit(gradebookId);
    return { audit };
  }, [gradebookId]);
  useEffect(() => { fetchAudit({ fetcher: auditFetcher }); }, [fetchAudit, auditFetcher]);

  const gradeBook = resource.data?.gradeBook;
  const status = String(gradeBook?.status || "draft").toLowerCase();
  const isArchived = !!gradeBook?.archivedAt;
  const attachedCourses = useMemo(() => coursesResource.data?.courses ?? [], [coursesResource.data]);
  const audit = auditResource.data?.audit ?? [];
  const detachTargetCourse = attachedCourses.find((c) => c.id === detachTargetId);

  useEffect(() => {
    if (attachedCourses.length && !selectedCourseId) {
      setSelectedCourseId(attachedCourses[0].id);
    }
    if (attachedCourses.length && selectedCourseId && !attachedCourses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(attachedCourses[0].id);
    }
    if (attachedCourses.length === 0 && selectedCourseId) {
      setSelectedCourseId("");
    }
  }, [attachedCourses, selectedCourseId]);

  const refreshCourses = () => fetchCourses({ fetcher: coursesFetcher });

  const handlePublish = async () => {
    onPublishClose();
    setPublishing(true);
    try {
      await gradeBookV2Publish(gradebookId);
      toast({ title: "Grades published to students", status: "success", duration: 3000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to publish", status: "error", duration: 3000, isClosable: true });
    } finally {
      setPublishing(false);
    }
  };

  const handleArchiveToggle = async () => {
    onArchiveClose();
    setArchiving(true);
    try {
      if (isArchived) {
        await gradeBookV2Unarchive(gradebookId);
        toast({ title: "Grade book unarchived", status: "success", duration: 3000, isClosable: true });
      } else {
        await gradeBookV2Archive(gradebookId);
        toast({ title: "Grade book archived", status: "success", duration: 3000, isClosable: true });
      }
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Action failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setArchiving(false);
    }
  };

  const openDetachConfirm = (courseId) => {
    setDetachTargetId(courseId);
    onDetachOpen();
  };

  const handleDetach = async () => {
    onDetachClose();
    setDetaching(true);
    try {
      await gradeBookV2Detach(detachTargetId);
      toast({ title: "Course detached", status: "success", duration: 3000, isClosable: true });
      refreshCourses();
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to detach course", status: "error", duration: 3000, isClosable: true });
    } finally {
      setDetaching(false);
      setDetachTargetId("");
    }
  };

  const handleExport = async (format) => {
    if (!selectedCourseId) return;
    setExporting(format);
    try {
      const blob = await gradeBookV2Export(gradebookId, selectedCourseId, format);
      const ext = format.toLowerCase() === "excel" ? "xlsx" : format.toLowerCase();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `gradebook-${gradebookId}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Export failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setExporting(null);
    }
  };

  const actionBadge = (action) => {
    const map = {
      created:   { bg: "#E6F4EA", color: "#38A169" },
      updated:   { bg: "#EBF4FF", color: "#3182CE" },
      adjusted:  { bg: "#F0E6FF", color: "#6b006b" },
      deleted:   { bg: "#FED7D7", color: "#E53E3E" },
      finalized: { bg: "#F0E6FF", color: "#6b006b" },
      published: { bg: "#EBF8FF", color: "#553C9A" },
      synced:    { bg: "#E6F4EA", color: "#276749" },
    };
    const s = map[String(action).toLowerCase()] || { bg: "#F7FAFC", color: "#718096" };
    return (
      <Badge bg={s.bg} color={s.color} px="8px" py="3px" borderRadius="10px" textTransform="none" fontSize="11px">{action}</Badge>
    );
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/grade-book-v2">Advanced Grade Book</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Grade Book Details</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" justifyContent="space-between" mb="24px" flexWrap="wrap" gap="12px">
        <Flex alignItems="center" gap="12px">
          <IconButton
            aria-label="Go back"
            icon={<FaArrowLeft />}
            variant="ghost"
            size="sm"
            onClick={() => history.push("/admin/grade-book-v2")}
          />
          <Heading fontSize="22px" fontWeight="600">Grade Book Details</Heading>
        </Flex>

        {/* Export dropdown */}
        <Menu>
          <MenuButton
            as={Box}
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px="12px"
            h="32px"
            border="1px solid #E2E8F0"
            borderRadius="6px"
            fontSize="13px"
            fontWeight="500"
            color={selectedCourseId ? "gray.700" : "gray.400"}
            bg="white"
            cursor={selectedCourseId ? "pointer" : "not-allowed"}
            opacity={selectedCourseId ? 1 : 0.6}
            _hover={selectedCourseId ? { bg: "#F7FAFC" } : {}}
          >
            <FaDownload size="11px" />
            <Text>{exporting ? `Exporting ${exporting}…` : "Export"}</Text>
            <FaChevronDown size="9px" />
          </MenuButton>
          <MenuList minW="140px" shadow="md" zIndex={10}>
            <MenuItem fontSize="13px" onClick={() => handleExport("Excel")} isDisabled={!!exporting || !selectedCourseId}>
              Excel (.xlsx)
            </MenuItem>
            <MenuItem fontSize="13px" onClick={() => handleExport("PDF")} isDisabled={!!exporting || !selectedCourseId}>
              PDF
            </MenuItem>
            <MenuItem fontSize="13px" onClick={() => handleExport("CSV")} isDisabled={!!exporting || !selectedCourseId}>
              CSV
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {resource.loading && <Flex justifyContent="center" py="60px"><Spinner size="xl" color="blue.500" /></Flex>}
      {resource.err && <Flex justifyContent="center" py="60px"><Text color="red.500">Failed to load grade book.</Text></Flex>}

      {!resource.loading && !resource.err && gradeBook && (
        <>
          {/* Header card */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="24px" mb="20px">
            <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px">
              <Box>
                <Text fontSize="20px" fontWeight="700" color="#1A202C" mb="6px">{gradeBook.title}</Text>
                <Text fontSize="14px" color="gray.500">
                  {attachedCourses.length} course{attachedCourses.length === 1 ? "" : "s"} attached
                </Text>
              </Box>
              {isArchived && (
                <Badge bg="#F7FAFC" color="#718096" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
                  Archived
                </Badge>
              )}
            </Flex>

            <Divider my="16px" />

            {/* Course scoping (used to target Export) */}
            {attachedCourses.length > 0 && (
              <Flex gap="12px" alignItems="center" flexWrap="wrap" mb="4px">
                <Text fontSize="12px" fontWeight="600" color="gray.500">Course</Text>
                <ChakraSelect
                  size="sm"
                  borderRadius="6px"
                  maxW="280px"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  {attachedCourses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </ChakraSelect>
              </Flex>
            )}

            <Divider my="16px" />

            {/* Action bar */}
            <Flex gap="8px" flexWrap="wrap" alignItems="center">
              <Button
                size="sm"
                secondary
                leftIcon={isArchived ? <FaBoxOpen /> : <FaArchive />}
                isLoading={archiving}
                onClick={onArchiveOpen}
              >
                {isArchived ? "Unarchive" : "Archive"}
              </Button>

              <Button
                size="sm"
                secondary
                onClick={() => history.push(`/admin/grade-book-v2/${gradebookId}/edit`)}
              >
                Edit Setup
              </Button>

              {status === "finalized" && (
                <Button size="sm" isLoading={publishing} onClick={onPublishOpen}>
                  Publish to Students
                </Button>
              )}
            </Flex>

            <Divider my="16px" />

            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="16px">
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Calculation Method</Text>
                <Text fontSize="14px" fontWeight="500" textTransform="capitalize">
                  {(gradeBook.calculationMethod || "—").replace("_", " ")}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Categories</Text>
                <Flex gap="4px" flexWrap="wrap">
                  {gradeBook.categories?.length ? gradeBook.categories.map((c) => (
                    <Badge key={c.id || c.name} bg="#F0E6FF" color="#6b006b" px="6px" py="2px" borderRadius="4px" fontSize="11px">
                      {c.name}: {c.weight}%
                    </Badge>
                  )) : (
                    <Text fontSize="14px" fontWeight="500">—</Text>
                  )}
                </Flex>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Created</Text>
                <Text fontSize="14px" fontWeight="500">
                  {gradeBook.createdAt ? new Date(gradeBook.createdAt).toLocaleDateString() : "—"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.500" mb="2px">Grading Scale</Text>
                <Flex gap="4px" flexWrap="wrap">
                  {gradeBook.gradingScale && Object.entries(gradeBook.gradingScale).map(([g, r]) => (
                    <Badge key={g} bg="#F7FAFC" color="#4A5568" px="6px" py="2px" borderRadius="4px" fontSize="11px">
                      {g}: {r}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            </Grid>
          </Box>

          {/* Attached Courses */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden" mb="20px">
            <Flex px="20px" py="14px" justifyContent="space-between" alignItems="center" borderBottom="1px solid #E2E8F0">
              <Text fontSize="14px" fontWeight="600" color="gray.700">Attached Courses ({attachedCourses.length})</Text>
            </Flex>
            {attachedCourses.length > 0 && (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">Course</Th>
                      <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">Attached On</Th>
                      <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none" w="100px">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {attachedCourses.map((c) => (
                      <Tr key={c.id} _hover={{ bg: "#F7FAFC" }}>
                        <Td py="12px" fontSize="13px" fontWeight="500" color="gray.800">{c.title}</Td>
                        <Td py="12px" fontSize="13px" color="gray.600">
                          {c.gradebookAttachedAt ? new Date(c.gradebookAttachedAt).toLocaleDateString() : "—"}
                        </Td>
                        <Td py="12px">
                          <IconButton
                            aria-label="Detach"
                            icon={<FaUnlink />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => openDetachConfirm(c.id)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Audit Log */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
            <Flex px="20px" py="14px" justifyContent="space-between" alignItems="center" borderBottom="1px solid #E2E8F0">
              <Text fontSize="14px" fontWeight="600" color="gray.700">Audit Log</Text>
            </Flex>
            {auditResource.loading && <Flex justifyContent="center" py="40px"><Spinner size="lg" color="blue.500" /></Flex>}
            {auditResource.err && <Flex justifyContent="center" py="40px"><Text color="red.500">Failed to load audit log.</Text></Flex>}
            {!auditResource.loading && !auditResource.err && (
              audit.length === 0 ? (
                <Flex justifyContent="center" py="40px"><Text color="gray.400">No audit records found.</Text></Flex>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg="#F7FAFC">
                      <Tr>
                        {["Date", "Action", "Performed By", "Changed Fields", "Previous", "New"].map((h) => (
                          <Th key={h} py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {audit.map((log) => (
                        <Tr key={log.id} _hover={{ bg: "#F7FAFC" }}>
                          <Td py="12px" fontSize="12px" color="gray.500" whiteSpace="nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </Td>
                          <Td py="12px">{actionBadge(log.action)}</Td>
                          <Td py="12px" fontSize="13px">
                            {log.performer ? `${log.performer.firstName} ${log.performer.lastName}` : "—"}
                          </Td>
                          <Td py="12px" fontSize="12px" color="gray.600">
                            {(log.changedFields ?? []).join(", ") || "—"}
                          </Td>
                          <Td py="12px" fontSize="12px" color="gray.500" maxW="180px">
                            {log.previousValue ? (
                              <Text noOfLines={2} fontFamily="mono">{JSON.stringify(log.previousValue)}</Text>
                            ) : "—"}
                          </Td>
                          <Td py="12px" fontSize="12px" color="gray.700" maxW="180px">
                            {log.newValue ? (
                              <Text noOfLines={2} fontFamily="mono">{JSON.stringify(log.newValue)}</Text>
                            ) : "—"}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )
            )}
          </Box>
        </>
      )}

      {/* Publish confirmation */}
      <AlertDialog isOpen={isPublishOpen} leastDestructiveRef={publishRef} onClose={onPublishClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">Publish Grades?</AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              Students will be able to view their grades immediately after publishing. Notifications will be sent. This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={publishRef} onClick={onPublishClose}>Cancel</Button>
              <Button isLoading={publishing} onClick={handlePublish}>Publish</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Archive / Unarchive confirmation */}
      <AlertDialog isOpen={isArchiveOpen} leastDestructiveRef={archiveRef} onClose={onArchiveClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">
              {isArchived ? "Unarchive Grade Book?" : "Archive Grade Book?"}
            </AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              {isArchived
                ? "This grade book will become available to attach to new courses again."
                : "Archived grade books can no longer be newly attached to a course, but courses already using it keep working normally."}
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={archiveRef} onClick={onArchiveClose}>Cancel</Button>
              <Button isLoading={archiving} onClick={handleArchiveToggle}>
                {isArchived ? "Unarchive" : "Archive"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Detach confirmation */}
      <AlertDialog isOpen={isDetachOpen} leastDestructiveRef={detachRef} onClose={onDetachClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">Detach Course?</AlertDialogHeader>
            <AlertDialogBody fontSize="14px" color="gray.600">
              This will clear the grade book link for {detachTargetCourse ? <strong>{detachTargetCourse.title}</strong> : "this course"}. Entries already recorded are unaffected, but the course will no longer show this grade book to students.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={detachRef} onClick={onDetachClose}>Cancel</Button>
              <Button isLoading={detaching} onClick={handleDetach}>Detach</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const GradeBookV2DetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <GradeBookV2DetailsPage {...props} />} />
);

export default GradeBookV2DetailsPageRoute;
