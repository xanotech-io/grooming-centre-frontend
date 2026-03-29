import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Badge,
  Spinner,
  Divider,
  IconButton,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Link,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaTrash,
  FaExternalLinkAlt,
  FaDownload,
  FaBan,
} from "react-icons/fa";
import { Button, Heading } from "../../../components";
import { useFetch } from "../../../hooks";
import {
  adminGetDocumentById,
  adminVerifyDocument,
  adminRejectDocument,
  adminDeleteDocument,
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
      px="14px"
      py="5px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="13px"
    >
      {s.label}
    </Badge>
  );
};

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const DetailRow = ({ label, value }) => (
  <Box>
    <Text fontSize="12px" color="gray.500" mb="3px">
      {label}
    </Text>
    <Text fontSize="14px" fontWeight="500" color="gray.800">
      {value || "—"}
    </Text>
  </Box>
);

// ----------- Reject Modal -----------
const RejectModal = ({ isOpen, onClose, document, onSuccess }) => {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
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
            Provide a reason for rejecting{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {document?.fileName}
            </Text>
            .
          </Text>
          <FormControl isRequired>
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Rejection Reason
            </FormLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Document is blurry and unreadable."
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

// ----------- Delete Confirm Modal -----------
const DeleteModal = ({ isOpen, onClose, document, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { message } = await adminDeleteDocument(document.uploadId);
      toast({
        title: message || "Document deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
      history.goBack();
    } catch {
      toast({
        title: "Failed to delete document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Delete Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Are you sure you want to permanently delete{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {document?.fileName}
            </Text>
            ? This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDelete} isLoading={loading}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ----------- Main Page -----------
const UserDocumentDetailsPage = () => {
  const history = useHistory();
  const { userId, uploadId } = useParams();
  const toast = useToast();

  const { resource, handleFetchResource } = useFetch();
  const rejectModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [verifying, setVerifying] = useState(false);

  const fetcher = useCallback(async () => {
    const { document } = await adminGetDocumentById(userId, uploadId);
    return { document };
  }, [userId, uploadId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const doc = resource.data?.document;

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const { message } = await adminVerifyDocument(uploadId);
      toast({
        title: message || "Document verified",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      handleFetchResource({ fetcher });
    } catch {
      toast({
        title: "Failed to verify document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/user-documents")}
        />
        <Heading fontSize="22px" fontWeight="600">
          Document Details
        </Heading>
      </Flex>

      {resource.loading && (
        <Flex justifyContent="center" py="60px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}

      {resource.err && (
        <Flex justifyContent="center" py="60px">
          <Text color="red.500">
            Failed to load document details. Please try again.
          </Text>
        </Flex>
      )}

      {!resource.loading && !resource.err && doc && (
        <>
          {/* Info Card */}
          <Box
            bg="white"
            borderRadius="8px"
            border="1px solid #E2E8F0"
            p="24px"
            mb="20px"
          >
            <Flex
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              gap="12px"
              mb="20px"
            >
              <Box>
                <Text fontSize="18px" fontWeight="700" color="gray.800">
                  {doc.fileName}
                </Text>
                <Text fontSize="13px" color="gray.500" mt="2px">
                  {DOC_TYPE_LABELS[doc.documentType] || doc.documentType} •{" "}
                  {formatBytes(doc.fileSize)}
                </Text>
              </Box>
              <Flex gap="10px" alignItems="center" flexWrap="wrap">
                {getVerificationBadge(doc.verificationStatus)}
                {doc.fileUrl && (
                  <Link href={doc.fileUrl} isExternal>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FaExternalLinkAlt />}
                    >
                      Open File
                    </Button>
                  </Link>
                )}
              </Flex>
            </Flex>

            <Divider mb="20px" />

            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
              gap="20px"
              mb="20px"
            >
              <DetailRow label="Upload ID" value={doc.uploadId} />
              <DetailRow label="User ID" value={doc.userId} />
              <DetailRow label="File Format" value={doc.fileFormat} />
              <DetailRow
                label="Course"
                value={doc.courseName || doc.courseId}
              />
              <DetailRow label="Uploaded By" value={doc.uploadedBy} />
              <DetailRow label="Access Level" value={doc.accessLevel} />
              <DetailRow label="Category" value={doc.category} />
              <DetailRow label="Source Module" value={doc.sourceModule} />
              <Box>
                <Text fontSize="12px" color="gray.500" mb="3px">
                  Download Permission
                </Text>
                {doc.downloadPermission != null ? (
                  <Flex alignItems="center" gap="6px">
                    {doc.downloadPermission ? (
                      <>
                        <FaDownload color="#38A169" size={12} />
                        <Text fontSize="14px" fontWeight="500" color="#38A169">
                          Allowed
                        </Text>
                      </>
                    ) : (
                      <>
                        <FaBan color="#E53E3E" size={12} />
                        <Text fontSize="14px" fontWeight="500" color="#E53E3E">
                          Restricted
                        </Text>
                      </>
                    )}
                  </Flex>
                ) : (
                  <Text fontSize="14px" fontWeight="500" color="gray.800">
                    —
                  </Text>
                )}
              </Box>
              <DetailRow
                label="Upload Date"
                value={
                  doc.uploadDate
                    ? new Date(doc.uploadDate).toLocaleString()
                    : null
                }
              />
              <DetailRow
                label="Verified At"
                value={
                  doc.verifiedAt
                    ? new Date(doc.verifiedAt).toLocaleString()
                    : null
                }
              />
              {doc.verificationStatus === "VERIFIED" && (
                <DetailRow label="Verified By" value={doc.verifiedBy} />
              )}
              {doc.verificationStatus === "REJECTED" && doc.rejectionReason && (
                <Box gridColumn={{ md: "span 2" }}>
                  <Text fontSize="12px" color="gray.500" mb="3px">
                    Rejection Reason
                  </Text>
                  <Text fontSize="14px" color="#E53E3E">
                    {doc.rejectionReason}
                  </Text>
                </Box>
              )}
            </Grid>

            {/* Actions */}
            {doc.verificationStatus === "PENDING" && (
              <>
                <Divider mb="20px" />
                <Flex gap="12px" flexWrap="wrap">
                  <Button
                    leftIcon={<FaCheck />}
                    colorScheme="green"
                    onClick={handleVerify}
                    isLoading={verifying}
                    loadingText="Verifying…"
                  >
                    Verify Document
                  </Button>
                  <Button
                    leftIcon={<FaTimes />}
                    colorScheme="red"
                    variant="outline"
                    onClick={rejectModal.onOpen}
                  >
                    Reject Document
                  </Button>
                </Flex>
              </>
            )}
          </Box>

          {/* Danger zone */}
          <Box
            bg="white"
            borderRadius="8px"
            border="1px solid #FED7D7"
            p="20px"
          >
            <Text fontSize="14px" fontWeight="600" color="#E53E3E" mb="8px">
              Danger Zone
            </Text>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap="12px"
            >
              <Text fontSize="13px" color="gray.500">
                Permanently delete this document. This action cannot be undone.
              </Text>
              <Button
                leftIcon={<FaTrash />}
                colorScheme="red"
                variant="outline"
                size="sm"
                onClick={deleteModal.onOpen}
              >
                Delete Document
              </Button>
            </Flex>
          </Box>
        </>
      )}

      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={rejectModal.onClose}
        document={doc}
        onSuccess={() => handleFetchResource({ fetcher })}
      />
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        document={doc}
        onSuccess={() => {}}
      />
    </Box>
  );
};

export const UserDocumentDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <UserDocumentDetailsPage {...props} />} />
);

export default UserDocumentDetailsPageRoute;
