import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  Grid,
  Divider,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Button } from "../../../../../components";
import { adminVerifyDocument, adminRejectDocument } from "../../../../../services";
import DocumentStatusBadge from "./DocumentStatusBadge";

const DOC_TYPE_LABELS = {
  CERTIFICATE: "Certificate",
  REGISTRATION_SHEET: "Registration Sheet",
  EVALUATION_FORM: "Evaluation Form",
  ATTENDANCE_RECORD: "Attendance Record",
  OTHER: "Other",
};

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const DetailRow = ({ label, value }) => (
  <Box>
    <Text fontSize="11px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px" mb="2px">
      {label}
    </Text>
    <Text fontSize="13px" color="gray.800" fontWeight="500">
      {value || "—"}
    </Text>
  </Box>
);

const VIEW_MODE = "view";
const REJECT_MODE = "reject";

const ViewDocumentModal = ({ isOpen, onClose, document, onSuccess }) => {
  const toast = useToast();
  const [mode, setMode] = useState(VIEW_MODE);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isPending = (document?.verificationStatus || document?.status) === "PENDING";

  const handleClose = () => {
    setMode(VIEW_MODE);
    setRejectionReason("");
    onClose();
  };

  const handleVerify = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const { message } = await adminVerifyDocument(document.uploadId);
      toast({ title: message || "Document verified", status: "success", duration: 3000, isClosable: true });
      onSuccess();
      handleClose();
    } catch {
      toast({ title: "Failed to verify document", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Rejection reason is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!document) return;
    setLoading(true);
    try {
      const { message } = await adminRejectDocument(document.uploadId, { rejectionReason: rejectionReason.trim() });
      toast({ title: message || "Document rejected", status: "info", duration: 3000, isClosable: true });
      onSuccess();
      handleClose();
    } catch {
      toast({ title: "Failed to reject document", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600" pb="12px">
          Document Review
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {/* Status banner */}
          <Flex
            bg="#F7FAFC"
            border="1px solid #E2E8F0"
            borderRadius="8px"
            p="12px 16px"
            alignItems="center"
            justifyContent="space-between"
            mb="20px"
          >
            <Box>
              <Text fontSize="14px" fontWeight="600" color="gray.800" noOfLines={1}>
                {document?.fileName}
              </Text>
              <Text fontSize="12px" color="gray.500" mt="2px">
                {document?.userName || document?.userId || "Unknown student"}
              </Text>
            </Box>
            <DocumentStatusBadge status={document?.verificationStatus || document?.status} />
          </Flex>

          {/* File preview / link */}
          {document?.fileUrl && (
            <Box mb="20px">
              <Text fontSize="11px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px" mb="8px">
                File Preview
              </Text>
              {document.fileFormat === "PDF" ? (
                <Box border="1px solid #E2E8F0" borderRadius="6px" overflow="hidden" h="280px">
                  <iframe
                    src={document.fileUrl}
                    title="Document preview"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                  />
                </Box>
              ) : (
                <Box border="1px solid #E2E8F0" borderRadius="6px" overflow="hidden" maxH="280px" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
                  <img
                    src={document.fileUrl}
                    alt="Document preview"
                    style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain" }}
                  />
                </Box>
              )}
              <Flex mt="8px" justifyContent="flex-end">
                <Text
                  as="a"
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  fontSize="12px"
                  color="blue.500"
                  display="flex"
                  alignItems="center"
                  gap="4px"
                  _hover={{ textDecoration: "underline" }}
                >
                  Open in new tab <FaExternalLinkAlt size={10} />
                </Text>
              </Flex>
            </Box>
          )}

          <Divider mb="20px" />

          {/* Details grid */}
          <Grid templateColumns="1fr 1fr" gap="16px" mb="20px">
            <DetailRow label="Upload ID" value={document?.uploadId} />
            <DetailRow label="Document Type" value={DOC_TYPE_LABELS[document?.documentType] || document?.documentType} />
            <DetailRow label="File Format" value={document?.fileFormat} />
            <DetailRow label="File Size" value={formatBytes(document?.fileSize)} />
            <DetailRow label="Course" value={document?.courseId} />
            <DetailRow label="Uploaded By" value={document?.uploadedBy} />
            <DetailRow
              label="Upload Date"
              value={document?.uploadDate ? new Date(document.uploadDate).toLocaleString() : null}
            />
            <DetailRow label="Days Pending" value={document?.daysPending != null ? `${document.daysPending} day(s)` : null} />
            {document?.rejectionReason && (
              <Box gridColumn="span 2">
                <DetailRow label="Rejection Reason" value={document.rejectionReason} />
              </Box>
            )}
          </Grid>

          {/* Reject reason input — shown when admin clicks Reject */}
          {mode === REJECT_MODE && (
            <Box
              bg="#FFF5F5"
              border="1px solid #FED7D7"
              borderRadius="8px"
              p="16px"
              mt="4px"
            >
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.700" mb="6px">
                  Rejection Reason
                </FormLabel>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document is blurry and unreadable. Please upload a clearer copy."
                  rows={3}
                  size="sm"
                  borderRadius="6px"
                  bg="white"
                />
              </FormControl>
            </Box>
          )}
        </ModalBody>

        <ModalFooter gap="10px" borderTop="1px solid #E2E8F0" pt="16px">
          {mode === VIEW_MODE ? (
            <>
              <Button variant="outline" onClick={handleClose} isDisabled={loading}>
                Close
              </Button>
              {isPending && (
                <>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => setMode(REJECT_MODE)}
                    isDisabled={loading}
                  >
                    Reject
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleVerify}
                    isLoading={loading}
                    loadingText="Verifying…"
                  >
                    Approve
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => { setMode(VIEW_MODE); setRejectionReason(""); }} isDisabled={loading}>
                Back
              </Button>
              <Button
                colorScheme="red"
                onClick={handleReject}
                isLoading={loading}
                isDisabled={!rejectionReason.trim()}
                loadingText="Rejecting…"
              >
                Confirm Rejection
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ViewDocumentModal;
