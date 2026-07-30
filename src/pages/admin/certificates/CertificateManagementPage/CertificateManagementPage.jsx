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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FiMoreVertical, FiPlus } from "react-icons/fi";
import {
  certV2ListCertificates,
  certV2IssueCertificate,
  certV2RevokeCertificate,
  certV2ReissueCertificate,
  certV2GetSummaryReport,
  adminGetUserListing,
  adminGetCourseListing,
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

// ── Searchable select ─────────────────────────────────────────────────────────
// Generic search-as-you-type combobox: fetchOptions(query) resolves to
// [{ id, label, sub? }]; onSelect(id, label) fires on pick / onSelect("", "") on clear.

const SearchableSelect = ({ placeholder, fetchOptions, onSelect, selectedLabel, isInvalid, size = "sm" }) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doFetch = useCallback(async (q) => {
    setLoading(true);
    try { setOptions(await fetchOptions(q)); }
    catch { setOptions([]); }
    finally { setLoading(false); }
  }, [fetchOptions]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => doFetch(query), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, open, doFetch]);

  const handleSelect = (opt) => {
    onSelect(opt.id, opt.label);
    setQuery("");
    setOptions([]);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect("", "");
    setQuery("");
    setOptions([]);
  };

  return (
    <Box ref={containerRef} position="relative">
      {selectedLabel ? (
        <Flex
          align="center" justify="space-between"
          border="1px solid" borderColor={isInvalid ? "red.500" : "#E2E8F0"}
          borderRadius="6px" px="10px" h={size === "sm" ? "32px" : "40px"}
          bg="white" fontSize="13px"
        >
          <Text fontSize="13px" color="gray.800" isTruncated>{selectedLabel}</Text>
          <Text
            fontSize="12px" color="gray.400" cursor="pointer" ml="8px"
            _hover={{ color: "gray.700" }} onClick={handleClear} flexShrink={0}
          >✕</Text>
        </Flex>
      ) : (
        <Input
          size={size}
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          borderColor={isInvalid ? "red.500" : undefined}
          borderRadius="6px"
          autoComplete="off"
        />
      )}
      {open && (
        <Box
          position="absolute" top="100%" left={0} right={0} zIndex={999}
          bg="white" border="1px solid #E2E8F0" borderRadius="6px" boxShadow="md"
          maxH="200px" overflowY="auto" mt="2px"
        >
          {loading ? (
            <Box px="12px" py="8px"><Text fontSize="13px" color="gray.400">Searching…</Text></Box>
          ) : options.length === 0 ? (
            <Box px="12px" py="8px"><Text fontSize="13px" color="gray.400">No results found.</Text></Box>
          ) : options.map((opt) => (
            <Box
              key={opt.id} px="12px" py="8px" cursor="pointer"
              _hover={{ bg: "#F7FAFC" }} onMouseDown={() => handleSelect(opt)}
            >
              <Text fontSize="13px">{opt.label}</Text>
              {opt.sub && <Text fontSize="11px" color="gray.400">{opt.sub}</Text>}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

const fetchStudentOptions = async (query) => {
  const res = await adminGetUserListing({ search: query, limit: 10 });
  return (res.users ?? []).map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}`, sub: u.email }));
};

const fetchCourseOptions = async (query) => {
  const res = await adminGetCourseListing({ search: query, limit: 10 });
  return (res.courses ?? []).map((c) => ({ id: c.id, label: c.title }));
};

// ── Issue modal ───────────────────────────────────────────────────────────────

const CERT_TYPES = ["Participation", "Achievement", "Completion"];

const EMPTY_ISSUE_FORM = { userId: "", userLabel: "", courseId: "", courseLabel: "", certificateType: "Participation", remarks: "" };

const IssueCertificateModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_ISSUE_FORM);
  const [loading, setLoading] = useState(false);

  const isValid = form.userId && form.courseId && form.certificateType;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await certV2IssueCertificate({
        userId: form.userId,
        courseId: form.courseId,
        certificateType: form.certificateType,
        remarks: form.remarks.trim() || undefined,
      });
      toast({ title: "Certificate issued", status: "success", duration: 3000, isClosable: true });
      setForm(EMPTY_ISSUE_FORM);
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: err?.message || "Failed to issue certificate", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY_ISSUE_FORM);
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
              <FormLabel fontSize="13px" color="gray.600">Student</FormLabel>
              <SearchableSelect
                placeholder="Search student by name…"
                fetchOptions={fetchStudentOptions}
                selectedLabel={form.userLabel}
                onSelect={(id, label) => setForm((p) => ({ ...p, userId: id, userLabel: label }))}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="13px" color="gray.600">Course</FormLabel>
              <SearchableSelect
                placeholder="Search course by title…"
                fetchOptions={fetchCourseOptions}
                selectedLabel={form.courseLabel}
                onSelect={(id, label) => setForm((p) => ({ ...p, courseId: id, courseLabel: label }))}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="13px" color="gray.600">Certificate Type</FormLabel>
              <Select value={form.certificateType} onChange={(e) => setForm((p) => ({ ...p, certificateType: e.target.value }))} size="sm" borderRadius="6px">
                {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Remarks (optional)</FormLabel>
              <Textarea value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} size="sm" borderRadius="6px" rows={3} placeholder="Additional notes…" />
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

// ── Revoke modal ──────────────────────────────────────────────────────────────

const RevokeCertificateModal = ({ isOpen, onClose, certificate, onSuccess }) => {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = async () => {
    const id = certificate?.certificateId || certificate?.certificate_id;
    setLoading(true);
    try {
      await certV2RevokeCertificate(id, { reason: reason.trim() });
      toast({ title: "Certificate revoked", status: "success", duration: 3000, isClosable: true });
      onSuccess();
      handleClose();
    } catch (err) {
      toast({ title: err?.message || "Failed to revoke", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="15px" fontWeight="600">Revoke Certificate</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="4px">
          <Text fontSize="13px" color="gray.600" mb="12px">
            This will revoke certificate{" "}
            <b>{certificate?.certificateId || certificate?.certificate_id}</b>. Revoked
            certificates fail verification checks.
          </Text>
          <FormControl isRequired>
            <FormLabel fontSize="13px" color="gray.600">Reason for revocation</FormLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              size="sm" borderRadius="6px" rows={3}
              placeholder="Explain why this certificate is being revoked…"
            />
          </FormControl>
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
            bg={reason.trim() && !loading ? "#E53E3E" : "gray.300"}
            color="white" fontSize="13px" fontWeight="600"
            cursor={reason.trim() && !loading ? "pointer" : "not-allowed"}
            onClick={reason.trim() && !loading ? handleSubmit : undefined}
            _hover={reason.trim() && !loading ? { bg: "#C53030" } : {}}
          >
            {loading ? <Spinner size="xs" /> : "Revoke Certificate"}
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ── Details modal ─────────────────────────────────────────────────────────────

const DetailRow = ({ label, value }) => (
  <Flex justifyContent="space-between" py="8px" borderBottom="1px solid #F1F1F1">
    <Text fontSize="12px" color="gray.500">{label}</Text>
    <Text fontSize="13px" color="gray.800" fontWeight="500" textAlign="right" maxW="60%">
      {value ?? "—"}
    </Text>
  </Flex>
);

const CertificateDetailsModal = ({ isOpen, onClose, certificate }) => {
  if (!certificate) return null;
  const cert = certificate;
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="15px" fontWeight="600">Certificate Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="16px">
          <DetailRow label="Certificate ID" value={cert.certificateId || cert.certificate_id} />
          <DetailRow label="Student" value={cert.learnerName || cert.learner_name || cert.userId} />
          <DetailRow label="Course" value={cert.courseName || cert.course_title || cert.courseId} />
          <DetailRow label="Certificate Type" value={cert.certificateType || cert.certificate_type} />
          <DetailRow
            label="Issue Date"
            value={
              cert.issueDate || cert.issued_date
                ? new Date(cert.issueDate || cert.issued_date).toLocaleDateString()
                : null
            }
          />
          <DetailRow label="Status" value={<StatusBadge status={cert.status} />} />
          <DetailRow label="Issued By" value={cert.issuedBy || cert.issued_by} />
          <DetailRow label="Remarks" value={cert.remarks} />
          <DetailRow
            label="Verification Link"
            value={
              cert.verificationLink || cert.verification_link ? (
                <Box
                  as="a"
                  href={cert.verificationLink || cert.verification_link}
                  target="_blank" rel="noopener noreferrer"
                  color="blue.500"
                  _hover={{ textDecoration: "underline" }}
                >
                  Verify
                </Box>
              ) : null
            }
          />
        </ModalBody>
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
  const revokeModal = useDisclosure();
  const detailsModal = useDisclosure();

  const [summary, setSummary] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState("");
  const [userLabelFilter, setUserLabelFilter] = useState("");
  const [courseIdFilter, setCourseIdFilter] = useState("");
  const [courseLabelFilter, setCourseLabelFilter] = useState("");
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
      if (userIdFilter) params.userId = userIdFilter;
      if (courseIdFilter) params.courseId = courseIdFilter;
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

  const openRevokeModal = (cert) => {
    setSelectedCertificate(cert);
    revokeModal.onOpen();
  };

  const openDetailsModal = (cert) => {
    setSelectedCertificate(cert);
    detailsModal.onOpen();
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
          <Box flex={1} minW="200px">
            <Text fontSize="12px" color="gray.500" mb="4px">Student</Text>
            <SearchableSelect
              placeholder="Search student by name…"
              fetchOptions={fetchStudentOptions}
              selectedLabel={userLabelFilter}
              onSelect={(id, label) => { setUserIdFilter(id); setUserLabelFilter(label); setPage(1); }}
            />
          </Box>
          <Box flex={1} minW="200px">
            <Text fontSize="12px" color="gray.500" mb="4px">Course</Text>
            <SearchableSelect
              placeholder="Search course by title…"
              fetchOptions={fetchCourseOptions}
              selectedLabel={courseLabelFilter}
              onSelect={(id, label) => { setCourseIdFilter(id); setCourseLabelFilter(label); setPage(1); }}
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
                  <TH>Format</TH>
                  <TH>Issued By</TH>
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
                      <Td py="12px" fontSize="13px" color="gray.600">
                        {cert.format || "—"}
                      </Td>
                      <Td py="12px" fontSize="13px" color="gray.600">
                        {cert.issuedBy || cert.issued_by || "—"}
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
                        <Menu placement="bottom-end" isLazy>
                          <MenuButton
                            as={IconButton}
                            aria-label="Certificate actions"
                            icon={isActing ? <Spinner size="xs" /> : <FiMoreVertical />}
                            size="xs" variant="ghost" isDisabled={isActing}
                          />
                          <MenuList fontSize="13px" minW="160px">
                            <MenuItem onClick={() => openDetailsModal(cert)}>
                              View Details
                            </MenuItem>
                            {status === "Issued" && (
                              <MenuItem color="#E53E3E" onClick={() => openRevokeModal(cert)}>
                                Revoke
                              </MenuItem>
                            )}
                            {(status === "Revoked" || status === "Issued") && (
                              <MenuItem color="#276749" onClick={() => handleReissue(cert)}>
                                Reissue
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
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
      <RevokeCertificateModal
        isOpen={revokeModal.isOpen}
        onClose={revokeModal.onClose}
        certificate={selectedCertificate}
        onSuccess={refresh}
      />
      <CertificateDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.onClose}
        certificate={selectedCertificate}
      />
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const CertificateManagementPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CertificateManagementPage {...props} />} />
);

export default CertificateManagementPage;
