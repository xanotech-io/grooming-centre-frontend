import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
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
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Tooltip,
  BreadcrumbItem,
} from "@chakra-ui/react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaCheck,
  FaTimes,
  FaDownload,
  FaBan,
} from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import {
  adminGetPendingDocuments,
  adminGetUserDocuments,
  adminVerifyDocument,
  adminRejectDocument,
} from "../../../services";

const DOC_TYPE_LABELS = {
  CERTIFICATE: "Certificate",
  IDENTITY_DOCUMENT: "Identity Document",
  REGISTRATION_SHEET: "Registration Sheet",
  EVALUATION_FORM: "Evaluation Form",
};

const getVerificationBadge = (status) => {
  const map = {
    VERIFIED: { bg: "#E6F4EA", color: "#38A169", label: "Verified" },
    PENDING: { bg: "#FFF5EA", color: "#DD6B20", label: "Pending" },
    REJECTED: { bg: "#FED7D7", color: "#E53E3E", label: "Rejected" },
  };
  const s = map[status] || { bg: "gray.100", color: "gray.600", label: status };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="12px"
      py="4px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
    >
      {s.label}
    </Badge>
  );
};

const getDownloadBadge = (allowed) =>
  allowed ? (
    <Tooltip label="Download permitted">
      <Badge
        bg="#E6F4EA"
        color="#38A169"
        px="10px"
        py="3px"
        borderRadius="10px"
        fontSize="11px"
        display="flex"
        alignItems="center"
        gap="4px"
        width="fit-content"
      >
        <FaDownload style={{ marginRight: 3 }} />
        Allowed
      </Badge>
    </Tooltip>
  ) : (
    <Tooltip label="Download restricted">
      <Badge
        bg="#FED7D7"
        color="#E53E3E"
        px="10px"
        py="3px"
        borderRadius="10px"
        fontSize="11px"
        display="flex"
        alignItems="center"
        gap="4px"
        width="fit-content"
      >
        <FaBan style={{ marginRight: 3 }} />
        Restricted
      </Badge>
    </Tooltip>
  );

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

// ----------- Verify Modal -----------
const VerifyModal = ({ isOpen, onClose, document, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const { message } = await adminVerifyDocument(document.uploadId);
      toast({
        title: message || "Document verified",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to verify document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Verify Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Are you sure you want to verify{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {document?.fileName}
            </Text>{" "}
            submitted by{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {document?.userName || "this user"}
            </Text>
            ?
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleVerify}
            isLoading={loading}
          >
            Verify Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ----------- Reject Modal -----------
const RejectModal = ({ isOpen, onClose, document, onSuccess }) => {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!document || !reason.trim()) {
      toast({
        title: "Rejection reason is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const { message } = await adminRejectDocument(document.uploadId, {
        rejectionReason: reason.trim(),
      });
      toast({
        title: message || "Document rejected",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setReason("");
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to reject document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setReason("");
        onClose();
      }}
      isCentered
      size="md"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Reject Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600" mb="16px">
            Rejecting{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {document?.fileName}
            </Text>
            . Please provide a reason.
          </Text>
          <FormControl isRequired>
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Rejection Reason
            </FormLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Document is blurry and unreadable. Please upload a clearer copy."
              rows={3}
              size="sm"
              borderRadius="6px"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button
            variant="outline"
            onClick={() => {
              setReason("");
              onClose();
            }}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleReject} isLoading={loading}>
            Reject Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ----------- Shared table header cell -----------
const TH = ({ children }) => (
  <Th
    py="14px"
    color="gray.500"
    fontSize="12px"
    fontWeight="600"
    textTransform="none"
  >
    {children}
  </Th>
);

// ----------- Main Page -----------
const UserDocumentsPage = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("pending");

  // Pending tab state
  const { resource: pendingResource, handleFetchResource: fetchPending } =
    useFetch();
  const [pendingPage, setPendingPage] = useState(1);

  // All docs tab state
  const { resource: allResource, handleFetchResource: fetchAll } = useFetch();
  const [userIdInput, setUserIdInput] = useState("");
  const [searchedUserId, setSearchedUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [allPage, setAllPage] = useState(1);

  // Modal state
  const verifyModal = useDisclosure();
  const rejectModal = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ---- Pending fetcher ----
  const pendingFetcher = useCallback(async () => {
    const { documents, pagination, summary } = await adminGetPendingDocuments({
      page: pendingPage,
      limit: 10,
    });
    return { documents, pagination, summary };
  }, [pendingPage]);

  useEffect(() => {
    if (activeTab === "pending") fetchPending({ fetcher: pendingFetcher });
  }, [activeTab, fetchPending, pendingFetcher]);

  // ---- All docs fetcher ----
  const allFetcher = useCallback(async () => {
    if (!searchedUserId) return { documents: [], pagination: {} };
    const params = { page: allPage, limit: 10 };
    if (statusFilter) params.verificationStatus = statusFilter;
    if (typeFilter) params.documentType = typeFilter;
    const { documents, pagination } = await adminGetUserDocuments(
      searchedUserId,
      params,
    );
    return { documents, pagination };
  }, [searchedUserId, allPage, statusFilter, typeFilter]);

  useEffect(() => {
    if (activeTab === "all") fetchAll({ fetcher: allFetcher });
  }, [activeTab, fetchAll, allFetcher]);

  const handleSearch = () => {
    if (!userIdInput.trim()) return;
    setSearchedUserId(userIdInput.trim());
    setAllPage(1);
  };

  const openVerify = (doc) => {
    setSelectedDoc(doc);
    verifyModal.onOpen();
  };
  const openReject = (doc) => {
    setSelectedDoc(doc);
    rejectModal.onOpen();
  };

  const onActionSuccess = () => {
    if (activeTab === "pending") fetchPending({ fetcher: pendingFetcher });
    else fetchAll({ fetcher: allFetcher });
  };

  const pendingDocs = pendingResource.data?.documents ?? [];
  const pendingSummary = pendingResource.data?.summary ?? {};
  const pendingPagination = pendingResource.data?.pagination ?? {};

  const allDocs = allResource.data?.documents ?? [];
  const allPagination = allResource.data?.pagination ?? {};

  const tabStyle = (tab) => ({
    px: "20px",
    py: "10px",
    fontSize: "14px",
    fontWeight: activeTab === tab ? "600" : "400",
    color: activeTab === tab ? "blue.600" : "gray.500",
    borderBottom: activeTab === tab ? "2px solid" : "2px solid transparent",
    borderColor: activeTab === tab ? "blue.500" : "transparent",
    cursor: "pointer",
  });

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Document Verification</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Heading fontSize="22px" fontWeight="600">
          Document Repository
        </Heading>
      </Flex>

      {/* Summary cards (shown on pending tab) */}
      {activeTab === "pending" && (
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
          gap="16px"
          mb="24px"
        >
          {[
            {
              label: "Total Pending",
              value: pendingSummary.totalPending ?? "—",
              color: "#DD6B20",
              bg: "#FFF5EA",
            },
            {
              label: "Pending > 3 Days",
              value: pendingSummary.pendingMoreThan3Days ?? "—",
              color: "#E53E3E",
              bg: "#FED7D7",
            },
            {
              label: "Reviewed Today",
              value: 0,
              color: "#38A169",
              bg: "#E6F4EA",
            },
          ].map((card) => (
            <Box
              key={card.label}
              bg={card.bg}
              borderRadius="8px"
              p="16px"
              textAlign="center"
            >
              <Text fontSize="24px" fontWeight="700" color={card.color}>
                {card.value}
              </Text>
              <Text fontSize="12px" color="gray.600" mt="4px">
                {card.label}
              </Text>
            </Box>
          ))}
        </Grid>
      )}

      {/* Tabs */}
      <Box
        bg="white"
        borderRadius="8px"
        border="1px solid #E2E8F0"
        overflow="hidden"
      >
        <Flex borderBottom="1px solid #E2E8F0">
          <Box {...tabStyle("pending")} onClick={() => setActiveTab("pending")}>
            Pending Verification
            {pendingSummary.totalPending > 0 && (
              <Badge
                ml="8px"
                bg="#FFF5EA"
                color="#DD6B20"
                borderRadius="10px"
                px="7px"
                fontSize="11px"
              >
                {pendingSummary.totalPending}
              </Badge>
            )}
          </Box>
          <Box {...tabStyle("all")} onClick={() => setActiveTab("all")}>
            All Documents
          </Box>
        </Flex>

        {/* ---------- PENDING TAB ---------- */}
        {activeTab === "pending" && (
          <>
            {pendingResource.loading && (
              <Flex justifyContent="center" py="40px">
                <Spinner size="lg" color="blue.500" />
              </Flex>
            )}
            {pendingResource.err && (
              <Flex justifyContent="center" py="40px">
                <Text color="red.500">Failed to load pending documents.</Text>
              </Flex>
            )}
            {!pendingResource.loading &&
              !pendingResource.err &&
              pendingDocs.length === 0 && (
                <Flex justifyContent="center" py="40px">
                  <Text color="gray.400">No pending documents.</Text>
                </Flex>
              )}
            {!pendingResource.loading &&
              !pendingResource.err &&
              pendingDocs.length > 0 && (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg="#F7FAFC">
                      <Tr>
                        <TH>User</TH>
                        <TH>Document Type</TH>
                        <TH>File Name</TH>
                        <TH>Format</TH>
                        <TH>Size</TH>
                        <TH>Category</TH>
                        <TH>Upload Date</TH>
                        <TH>Days Pending</TH>
                        <TH>Actions</TH>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pendingDocs.map((doc) => (
                        <Tr
                          key={doc.uploadId}
                          _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                          onClick={() =>
                            history.push(
                              `/admin/user-documents/${doc.userId}/${doc.uploadId}`,
                            )
                          }
                        >
                          <Td py="14px" fontSize="14px" fontWeight="500">
                            {doc.userName || doc.userId}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.600">
                            {DOC_TYPE_LABELS[doc.documentType] ||
                              doc.documentType}
                          </Td>
                          <Td py="14px" fontSize="13px">
                            {doc.fileName}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.600">
                            {doc.fileFormat || "—"}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.500">
                            {formatBytes(doc.fileSize)}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.500">
                            {doc.category || "—"}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.500">
                            {doc.uploadDate
                              ? new Date(doc.uploadDate).toLocaleDateString()
                              : "—"}
                          </Td>
                          <Td py="14px">
                            <Badge
                              bg={doc.daysPending > 3 ? "#FED7D7" : "#FFF5EA"}
                              color={
                                doc.daysPending > 3 ? "#E53E3E" : "#DD6B20"
                              }
                              px="10px"
                              py="3px"
                              borderRadius="10px"
                              fontSize="12px"
                            >
                              {doc.daysPending}d
                            </Badge>
                          </Td>
                          <Td py="14px" onClick={(e) => e.stopPropagation()}>
                            <Flex gap="6px">
                              <IconButton
                                aria-label="Verify"
                                icon={<FaCheck />}
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                title="Verify"
                                onClick={() => openVerify(doc)}
                              />
                              <IconButton
                                aria-label="Reject"
                                icon={<FaTimes />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                title="Reject"
                                onClick={() => openReject(doc)}
                              />
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}

            {pendingPagination.totalPages > 1 && (
              <Flex
                justifyContent="flex-end"
                alignItems="center"
                px="20px"
                py="16px"
                gap="8px"
                borderTop="1px solid #E2E8F0"
              >
                <IconButton
                  aria-label="Prev"
                  icon={<FaChevronLeft />}
                  size="sm"
                  variant="ghost"
                  isDisabled={pendingPage === 1}
                  onClick={() => setPendingPage((p) => p - 1)}
                />
                <Text fontSize="13px" color="gray.600">
                  Page {pendingPagination.page} of{" "}
                  {pendingPagination.totalPages}
                </Text>
                <IconButton
                  aria-label="Next"
                  icon={<FaChevronRight />}
                  size="sm"
                  variant="ghost"
                  isDisabled={pendingPage === pendingPagination.totalPages}
                  onClick={() => setPendingPage((p) => p + 1)}
                />
              </Flex>
            )}
          </>
        )}

        {/* ---------- ALL DOCS TAB ---------- */}
        {activeTab === "all" && (
          <>
            {/* Filters */}
            <Flex
              px="20px"
              py="16px"
              gap="10px"
              alignItems="flex-end"
              flexWrap="wrap"
              borderBottom="1px solid #E2E8F0"
            >
              <Box flex="1" minW="200px">
                <Text fontSize="12px" color="gray.500" mb="4px">
                  User ID
                </Text>
                <Flex gap="8px">
                  <Input
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="Enter user ID to search"
                    size="sm"
                    borderRadius="6px"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <IconButton
                    aria-label="Search"
                    icon={<FaSearch />}
                    size="sm"
                    colorScheme="blue"
                    onClick={handleSearch}
                  />
                </Flex>
              </Box>
              <Box minW="160px">
                <Text fontSize="12px" color="gray.500" mb="4px">
                  Status
                </Text>
                <ChakraSelect
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setAllPage(1);
                  }}
                  size="sm"
                  borderRadius="6px"
                >
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </ChakraSelect>
              </Box>
              <Box minW="180px">
                <Text fontSize="12px" color="gray.500" mb="4px">
                  Document Type
                </Text>
                <ChakraSelect
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setAllPage(1);
                  }}
                  size="sm"
                  borderRadius="6px"
                >
                  <option value="">All Types</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="IDENTITY_DOCUMENT">Identity Document</option>
                  <option value="REGISTRATION_SHEET">Registration Sheet</option>
                  <option value="EVALUATION_FORM">Evaluation Form</option>
                </ChakraSelect>
              </Box>
            </Flex>

            {!searchedUserId && (
              <Flex
                justifyContent="center"
                py="40px"
                direction="column"
                alignItems="center"
                gap="8px"
              >
                <Text color="gray.400">
                  Enter a User ID above to view their documents.
                </Text>
              </Flex>
            )}

            {searchedUserId && allResource.loading && (
              <Flex justifyContent="center" py="40px">
                <Spinner size="lg" color="blue.500" />
              </Flex>
            )}

            {searchedUserId && allResource.err && (
              <Flex justifyContent="center" py="40px">
                <Text color="red.500">Failed to load documents.</Text>
              </Flex>
            )}

            {searchedUserId &&
              !allResource.loading &&
              !allResource.err &&
              allDocs.length === 0 && (
                <Flex justifyContent="center" py="40px">
                  <Text color="gray.400">
                    No documents found for this user.
                  </Text>
                </Flex>
              )}

            {searchedUserId &&
              !allResource.loading &&
              !allResource.err &&
              allDocs.length > 0 && (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg="#F7FAFC">
                      <Tr>
                        <TH>Document Type</TH>
                        <TH>File Name</TH>
                        <TH>Format</TH>
                        <TH>Size</TH>
                        <TH>Uploaded By</TH>
                        <TH>Access Level</TH>
                        <TH>Download</TH>
                        <TH>Category</TH>
                        <TH>Source Module</TH>
                        <TH>Status</TH>
                        <TH>Upload Date</TH>
                        <TH>Actions</TH>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {allDocs.map((doc) => (
                        <Tr
                          key={doc.uploadId}
                          _hover={{ bg: "#F7FAFC", cursor: "pointer" }}
                          onClick={() =>
                            history.push(
                              `/admin/user-documents/${searchedUserId}/${doc.uploadId}`,
                            )
                          }
                        >
                          <Td py="14px" fontSize="13px" color="gray.600">
                            {DOC_TYPE_LABELS[doc.documentType] ||
                              doc.documentType}
                          </Td>
                          <Td py="14px" fontSize="14px" fontWeight="500">
                            {doc.fileName}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.600">
                            {doc.fileFormat || "—"}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.500">
                            {formatBytes(doc.fileSize)}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.600">
                            {doc.uploadedBy || "—"}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.600">
                            {doc.accessLevel || "—"}
                          </Td>
                          <Td py="14px" onClick={(e) => e.stopPropagation()}>
                            {getDownloadBadge(doc.downloadPermission)}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.500">
                            {doc.category || "—"}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.500">
                            {doc.sourceModule || "—"}
                          </Td>
                          <Td py="14px">
                            {getVerificationBadge(doc.verificationStatus)}
                          </Td>
                          <Td py="14px" fontSize="13px" color="gray.500">
                            {doc.uploadDate
                              ? new Date(doc.uploadDate).toLocaleDateString()
                              : "—"}
                          </Td>
                          <Td py="14px" onClick={(e) => e.stopPropagation()}>
                            {doc.verificationStatus === "PENDING" && (
                              <Flex gap="6px">
                                <IconButton
                                  aria-label="Verify"
                                  icon={<FaCheck />}
                                  size="sm"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() =>
                                    openVerify({
                                      ...doc,
                                      userName: searchedUserId,
                                    })
                                  }
                                />
                                <IconButton
                                  aria-label="Reject"
                                  icon={<FaTimes />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() =>
                                    openReject({
                                      ...doc,
                                      userName: searchedUserId,
                                    })
                                  }
                                />
                              </Flex>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}

            {allPagination.totalPages > 1 && (
              <Flex
                justifyContent="flex-end"
                alignItems="center"
                px="20px"
                py="16px"
                gap="8px"
                borderTop="1px solid #E2E8F0"
              >
                <IconButton
                  aria-label="Prev"
                  icon={<FaChevronLeft />}
                  size="sm"
                  variant="ghost"
                  isDisabled={allPage === 1}
                  onClick={() => setAllPage((p) => p - 1)}
                />
                <Text fontSize="13px" color="gray.600">
                  Page {allPagination.page} of {allPagination.totalPages}
                </Text>
                <IconButton
                  aria-label="Next"
                  icon={<FaChevronRight />}
                  size="sm"
                  variant="ghost"
                  isDisabled={allPage === allPagination.totalPages}
                  onClick={() => setAllPage((p) => p + 1)}
                />
              </Flex>
            )}
          </>
        )}
      </Box>

      <VerifyModal
        isOpen={verifyModal.isOpen}
        onClose={verifyModal.onClose}
        document={selectedDoc}
        onSuccess={onActionSuccess}
      />
      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={rejectModal.onClose}
        document={selectedDoc}
        onSuccess={onActionSuccess}
      />
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const UserDocumentsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <UserDocumentsPage {...props} />} />
);

export default UserDocumentsPageRoute;
