import React, { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Spinner,
  Select,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  useToast,
  Grid,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FiRefreshCw, FiXCircle, FiPlus } from "react-icons/fi";
import {
  certV2ListCertificates,
  certV2IssueCertificate,
  certV2RevokeCertificate,
  certV2ReissueCertificate,
  certV2GetSummaryReport,
} from "../../../../services";
import { Breadcrumb, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Issued:  { bg: "#F0FFF4", color: "#276749", border: "#9AE6B4" },
  Pending: { bg: "#FFFAF0", color: "#744210", border: "#F6AD55" },
  Revoked: { bg: "#FFF5F5", color: "#742A2A", border: "#FC8181" },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <Badge
      bg={c.bg}
      color={c.color}
      border={`1px solid ${c.border}`}
      px="8px" py="2px"
      borderRadius="8px"
      textTransform="none"
      fontSize="11px"
      fontWeight="600"
    >
      {status}
    </Badge>
  );
};

// ── Summary strip ─────────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, color }) => (
  <Box
    bg="white" border="1px solid #E2E8F0" borderRadius="8px"
    p="16px 20px" flex={1} minW="120px"
  >
    <Text fontSize="24px" fontWeight="800" color={color || "#660066"}>{value ?? "—"}</Text>
    <Text fontSize="12px" color="gray.500" mt="2px">{label}</Text>
  </Box>
);

// ── Issue modal ───────────────────────────────────────────────────────────────

const CERT_TYPES = ["Participation", "Achievement", "Completion"];

const IssueCertificateModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [form, setForm] = useState({ userId: "", courseId: "", certificateType: "Participation", remarks: "" });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const isValid = form.userId.trim() && form.courseId.trim() && form.certificateType;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await certV2IssueCertificate({
        userId: form.userId.trim(),
        courseId: form.courseId.trim(),
        certificateType: form.certificateType,
        remarks: form.remarks.trim() || undefined,
      });
      toast({ title: "Certificate issued", status: "success", duration: 3000, isClosable: true });
      setForm({ userId: "", courseId: "", certificateType: "Participation", remarks: "" });
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: err?.message || "Failed to issue certificate", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ userId: "", courseId: "", certificateType: "Participation", remarks: "" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="15px" fontWeight="600">Issue Certificate</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="4px">
          <Grid templateColumns="1fr" gap="14px">
            <FormControl isRequired>
              <FormLabel fontSize="13px" color="gray.600">Student ID (userId)</FormLabel>
              <Input value={form.userId} onChange={set("userId")} placeholder="UUID" size="sm" borderRadius="6px" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="13px" color="gray.600">Course ID</FormLabel>
              <Input value={form.courseId} onChange={set("courseId")} placeholder="UUID" size="sm" borderRadius="6px" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="13px" color="gray.600">Certificate Type</FormLabel>
              <Select value={form.certificateType} onChange={set("certificateType")} size="sm" borderRadius="6px">
                {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Remarks (optional)</FormLabel>
              <Textarea value={form.remarks} onChange={set("remarks")} size="sm" borderRadius="6px" rows={3} placeholder="Additional notes…" />
            </FormControl>
          </Grid>
        </ModalBody>
        <ModalFooter gap="10px" mt="8px">
          <Box
            as="button" px="16px" py="8px" borderRadius="6px"
            border="1px solid #D0D5DD" fontSize="13px" fontWeight="500"
            onClick={handleClose} _hover={{ bg: "#F9FAFB" }}
          >
            Cancel
          </Box>
          <Box
            as="button" px="16px" py="8px" borderRadius="6px"
            bg={isValid && !loading ? "#660066" : "gray.300"}
            color="white" fontSize="13px" fontWeight="600"
            cursor={isValid && !loading ? "pointer" : "not-allowed"}
            onClick={isValid && !loading ? handleSubmit : undefined}
            _hover={isValid && !loading ? { bg: "#4d004d" } : {}}
          >
            {loading ? <Spinner size="xs" /> : "Issue Certificate"}
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const TH = ({ children }) => (
  <Th py="12px" color="gray.500" fontSize="12px" fontWeight="600" textTransform="none">
    {children}
  </Th>
);

const CertificateManagementPage = () => {
  const toast = useToast();
  const issueModal = useDisclosure();

  const [summary, setSummary] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState("");
  const [courseIdFilter, setCourseIdFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await certV2GetSummaryReport();
      setSummary(data);
    } catch {}
  }, []);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (userIdFilter.trim()) params.userId = userIdFilter.trim();
      if (courseIdFilter.trim()) params.courseId = courseIdFilter.trim();
      if (typeFilter) params.certificateType = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const result = await certV2ListCertificates(params);
      setCertificates(result.certificates ?? result.rows ?? []);
      setPagination(result.pagination ?? {});
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [page, userIdFilter, courseIdFilter, typeFilter, statusFilter]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  const refresh = () => { fetchSummary(); fetchCertificates(); };

  const handleRevoke = async (cert) => {
    const id = cert.certificateId || cert.certificate_id;
    if (!window.confirm("Revoke this certificate?")) return;
    setActionLoading(id);
    try {
      await certV2RevokeCertificate(id);
      toast({ title: "Certificate revoked", status: "success", duration: 3000, isClosable: true });
      refresh();
    } catch (err) {
      toast({ title: err?.message || "Failed to revoke", status: "error", duration: 3000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReissue = async (cert) => {
    const id = cert.certificateId || cert.certificate_id;
    setActionLoading(id);
    try {
      await certV2ReissueCertificate(id);
      toast({ title: "Certificate re-issued", status: "success", duration: 3000, isClosable: true });
      refresh();
    } catch (err) {
      toast({ title: err?.message || "Failed to re-issue", status: "error", duration: 3000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = pagination.totalPages ?? 1;

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Certificate Management</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
    <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="flex-start" mb="20px">
        <Box>
          <Text fontSize="20px" fontWeight="700" color="#101928">Certificate Management</Text>
          <Text fontSize="13px" color="gray.500" mt="2px">Issue, revoke and re-issue learner certificates</Text>
        </Box>
        <Box
          as="button"
          display="flex" alignItems="center" gap="6px"
          bg="#660066" color="white"
          px="16px" py="9px"
          borderRadius="6px"
          fontSize="13px" fontWeight="600"
          cursor="pointer"
          onClick={issueModal.onOpen}
          _hover={{ bg: "#4d004d" }}
        >
          <FiPlus size={14} />
          Issue Certificate
        </Box>
      </Flex>

      {/* Summary */}
      {summary && (
        <Flex gap="12px" flexWrap="wrap" mb="20px">
          <SummaryCard label="Total Issued" value={summary.totalIssued} color="#276749" />
          <SummaryCard label="Pending" value={summary.totalPending} color="#ED8936" />
          <SummaryCard label="Revoked" value={summary.totalRevoked} color="#E53E3E" />
          <SummaryCard label="SVG Success Rate" value={summary.svgSuccessRate != null ? `${summary.svgSuccessRate}%` : "—"} color="#3182CE" />
          <SummaryCard label="Total Verifications" value={summary.totalVerificationRequests} color="#660066" />
        </Flex>
      )}

      {/* Filters */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="16px" mb="16px">
        <Flex gap="12px" flexWrap="wrap" alignItems="flex-end">
          <Box flex={1} minW="160px">
            <Text fontSize="12px" color="gray.500" mb="4px">Student ID</Text>
            <Input
              value={userIdFilter} onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
              placeholder="Filter by userId" size="sm" borderRadius="6px"
            />
          </Box>
          <Box flex={1} minW="160px">
            <Text fontSize="12px" color="gray.500" mb="4px">Course ID</Text>
            <Input
              value={courseIdFilter} onChange={(e) => { setCourseIdFilter(e.target.value); setPage(1); }}
              placeholder="Filter by courseId" size="sm" borderRadius="6px"
            />
          </Box>
          <Box minW="160px">
            <Text fontSize="12px" color="gray.500" mb="4px">Certificate Type</Text>
            <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} size="sm" borderRadius="6px">
              <option value="">All Types</option>
              {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Box>
          <Box minW="140px">
            <Text fontSize="12px" color="gray.500" mb="4px">Status</Text>
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} size="sm" borderRadius="6px">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Issued">Issued</option>
              <option value="Revoked">Revoked</option>
            </Select>
          </Box>
        </Flex>
      </Box>

      {/* Table */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
        {loading ? (
          <Flex justifyContent="center" py="48px"><Spinner size="lg" color="#660066" /></Flex>
        ) : certificates.length === 0 ? (
          <Flex justifyContent="center" py="48px" direction="column" alignItems="center" gap="8px">
            <Text color="gray.400" fontSize="14px">No certificates found.</Text>
          </Flex>
        ) : (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  <TH>Certificate ID</TH>
                  <TH>Student</TH>
                  <TH>Course</TH>
                  <TH>Type</TH>
                  <TH>Issue Date</TH>
                  <TH>Status</TH>
                  <TH>Verification</TH>
                  <TH>Actions</TH>
                </Tr>
              </Thead>
              <Tbody>
                {certificates.map((cert) => {
                  const id = cert.certificateId || cert.certificate_id;
                  const isActing = actionLoading === id;
                  const status = cert.status;
                  return (
                    <Tr key={id} _hover={{ bg: "#F7FAFC" }}>
                      <Td py="12px" fontSize="12px" color="gray.500" fontFamily="mono">{id}</Td>
                      <Td py="12px" fontSize="13px" fontWeight="500">
                        {cert.learnerName || cert.learner_name || cert.userId || "—"}
                      </Td>
                      <Td py="12px" fontSize="13px" color="gray.600">
                        {cert.courseName || cert.course_title || cert.courseId || "—"}
                      </Td>
                      <Td py="12px" fontSize="13px" color="gray.600">
                        {cert.certificateType || cert.certificate_type || "—"}
                      </Td>
                      <Td py="12px" fontSize="13px" color="gray.500">
                        {cert.issueDate || cert.issued_date
                          ? new Date(cert.issueDate || cert.issued_date).toLocaleDateString()
                          : "—"}
                      </Td>
                      <Td py="12px"><StatusBadge status={status} /></Td>
                      <Td py="12px" fontSize="12px" color="blue.500">
                        {cert.verificationLink || cert.verification_link ? (
                          <Box
                            as="a"
                            href={cert.verificationLink || cert.verification_link}
                            target="_blank" rel="noopener noreferrer"
                            _hover={{ textDecoration: "underline" }}
                          >
                            Verify
                          </Box>
                        ) : "—"}
                      </Td>
                      <Td py="12px">
                        <Flex gap="4px">
                          {status === "Issued" && (
                            <IconButton
                              aria-label="Revoke"
                              icon={isActing ? <Spinner size="xs" /> : <FiXCircle />}
                              size="xs" colorScheme="red" variant="ghost"
                              title="Revoke certificate"
                              isDisabled={isActing}
                              onClick={() => handleRevoke(cert)}
                            />
                          )}
                          {(status === "Revoked" || status === "Issued") && (
                            <IconButton
                              aria-label="Reissue"
                              icon={isActing ? <Spinner size="xs" /> : <FiRefreshCw />}
                              size="xs" colorScheme="green" variant="ghost"
                              title="Re-issue certificate"
                              isDisabled={isActing}
                              onClick={() => handleReissue(cert)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justifyContent="flex-end" alignItems="center" px="20px" py="14px" gap="8px" borderTop="1px solid #E2E8F0">
            <IconButton
              aria-label="Previous" icon={<Text fontSize="12px">‹</Text>}
              size="sm" variant="ghost" isDisabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            />
            <Text fontSize="13px" color="gray.600">Page {page} of {totalPages}</Text>
            <IconButton
              aria-label="Next" icon={<Text fontSize="12px">›</Text>}
              size="sm" variant="ghost" isDisabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            />
          </Flex>
        )}
      </Box>

      <IssueCertificateModal
        isOpen={issueModal.isOpen}
        onClose={issueModal.onClose}
        onSuccess={refresh}
      />
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const CertificateManagementPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CertificateManagementPage {...props} />} />
);

export default CertificateManagementPage;
