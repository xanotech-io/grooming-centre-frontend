import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Spinner,
  Divider,
  IconButton,
  Textarea,
  FormControl,
  FormLabel,
  BreadcrumbItem,
  useToast,
} from "@chakra-ui/react";
import { FaArrowLeft, FaExternalLinkAlt } from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link as BreadcrumbLink } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../../hooks";
import {
  adminGetDocumentById,
  adminVerifyDocument,
  adminRejectDocument,
} from "../../../../services";
import DocumentStatusBadge from "./components/DocumentStatusBadge";

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

const DocumentReviewPage = () => {
  const history = useHistory();
  const { uploadId } = useParams();
  const toast = useToast();

  const { resource, handleFetchResource } = useFetch();
  const [mode, setMode] = useState(VIEW_MODE);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetcher = useCallback(async () => {
    const { document } = await adminGetDocumentById(null, uploadId);
    return { document };
  }, [uploadId]);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const doc = resource.data?.document;
  const isPending = (doc?.verificationStatus || doc?.status) === "PENDING";

  const goBack = () => history.push("/admin/certificates");

  const handleVerify = async () => {
    if (!doc) return;
    setActionLoading(true);
    try {
      const { message } = await adminVerifyDocument(doc.uploadId);
      toast({ title: message || "Document verified", status: "success", duration: 3000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to verify document", status: "error", duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Rejection reason is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!doc) return;
    setActionLoading(true);
    try {
      const { message } = await adminRejectDocument(doc.uploadId, { rejectionReason: rejectionReason.trim() });
      toast({ title: message || "Document rejected", status: "info", duration: 3000, isClosable: true });
      setMode(VIEW_MODE);
      setRejectionReason("");
      handleFetchResource({ fetcher });
    } catch {
      toast({ title: "Failed to reject document", status: "error", duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/certificates">Certificate Upload</BreadcrumbLink>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">Document Review</BreadcrumbLink>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
        <Flex alignItems="center" gap="12px" mb="24px">
          <IconButton
            aria-label="Go back"
            icon={<FaArrowLeft />}
            variant="ghost"
            size="sm"
            onClick={goBack}
          />
          <Heading fontSize="22px" fontWeight="600">
            Document Review
          </Heading>
        </Flex>

        {resource.loading && (
          <Flex justifyContent="center" py="60px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        )}

        {resource.err && (
          <Flex justifyContent="center" py="60px">
            <Text color="red.500">Failed to load document. Please try again.</Text>
          </Flex>
        )}

        {!resource.loading && !resource.err && doc && (
          <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px">
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
                  {doc.fileName}
                </Text>
                <Text fontSize="12px" color="gray.500" mt="2px">
                  {doc.userName || doc.userId || "Unknown student"}
                </Text>
              </Box>
              <DocumentStatusBadge status={doc.verificationStatus || doc.status} />
            </Flex>

            {doc.fileUrl && (
              <Box mb="20px">
                <Text fontSize="11px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px" mb="8px">
                  File Preview
                </Text>
                {doc.fileFormat === "PDF" ? (
                  <Box border="1px solid #E2E8F0" borderRadius="6px" overflow="hidden" h="480px">
                    <iframe
                      src={doc.fileUrl}
                      title="Document preview"
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                    />
                  </Box>
                ) : (
                  <Box border="1px solid #E2E8F0" borderRadius="6px" overflow="hidden" maxH="480px" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
                    <img
                      src={doc.fileUrl}
                      alt="Document preview"
                      style={{ maxWidth: "100%", maxHeight: "480px", objectFit: "contain" }}
                    />
                  </Box>
                )}
                <Flex mt="8px" justifyContent="flex-end">
                  <Text
                    as="a"
                    href={doc.fileUrl}
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

            <Grid templateColumns="1fr 1fr" gap="16px" mb="20px">
              <DetailRow label="Upload ID" value={doc.uploadId} />
              <DetailRow label="Document Type" value={DOC_TYPE_LABELS[doc.documentType] || doc.documentType} />
              <DetailRow label="File Format" value={doc.fileFormat} />
              <DetailRow label="File Size" value={formatBytes(doc.fileSize)} />
              <DetailRow label="Course" value={doc.courseName || doc.courseId} />
              <DetailRow label="Uploaded By" value={doc.uploadedBy} />
              <DetailRow
                label="Upload Date"
                value={doc.uploadDate ? new Date(doc.uploadDate).toLocaleString() : null}
              />
              <DetailRow label="Days Pending" value={doc.daysPending != null ? `${doc.daysPending} day(s)` : null} />
              {doc.rejectionReason && (
                <Box gridColumn="span 2">
                  <DetailRow label="Rejection Reason" value={doc.rejectionReason} />
                </Box>
              )}
            </Grid>

            {mode === REJECT_MODE && (
              <Box bg="#FFF5F5" border="1px solid #FED7D7" borderRadius="8px" p="16px" mb="20px">
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

            <Flex gap="10px" borderTop="1px solid #E2E8F0" pt="16px">
              {mode === VIEW_MODE ? (
                isPending && (
                  <>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      onClick={() => setMode(REJECT_MODE)}
                      isDisabled={actionLoading}
                    >
                      Reject
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={handleVerify}
                      isLoading={actionLoading}
                      loadingText="Verifying…"
                    >
                      Approve
                    </Button>
                  </>
                )
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => { setMode(VIEW_MODE); setRejectionReason(""); }}
                    isDisabled={actionLoading}
                  >
                    Back
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleReject}
                    isLoading={actionLoading}
                    isDisabled={!rejectionReason.trim()}
                    loadingText="Rejecting…"
                  >
                    Confirm Rejection
                  </Button>
                </>
              )}
            </Flex>
          </Box>
        )}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const DocumentReviewPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <DocumentReviewPage {...props} />} />
);

export default DocumentReviewPage;
