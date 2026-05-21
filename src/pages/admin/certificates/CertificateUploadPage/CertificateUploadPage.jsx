import React, { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, Text, Badge, useDisclosure, useToast } from "@chakra-ui/react";
import { useFetch } from "../../../../hooks";
import {
  adminGetPendingDocuments,
  adminGetUserDocuments,
  adminDeleteDocument,
} from "../../../../services";

import PageHeader from "./components/PageHeader";
import DocumentFilters from "./components/DocumentFilters";
import DocumentTable from "./components/DocumentTable";
import UploadDocumentModal from "./components/UploadDocumentModal";
import ViewDocumentModal from "./components/ViewDocumentModal";
import VerifyDocumentModal from "./components/VerifyDocumentModal";
import RejectDocumentModal from "./components/RejectDocumentModal";

const TAB_PENDING = "pending";
const TAB_ALL = "all";

const TabButton = ({ label, isActive, onClick, badge }) => (
  <Flex
    as="button"
    px="20px"
    py="12px"
    fontSize="14px"
    fontWeight={isActive ? "600" : "400"}
    color={isActive ? "blue.600" : "gray.500"}
    borderBottom="2px solid"
    borderColor={isActive ? "blue.500" : "transparent"}
    cursor="pointer"
    onClick={onClick}
    alignItems="center"
    gap="6px"
    _hover={{ color: "blue.500" }}
    bg="transparent"
    border="none"
    borderBottomWidth="2px"
    borderBottomStyle="solid"
  >
    {label}
    {badge != null && badge > 0 && (
      <Badge
        bg="#FFF5EA"
        color="#DD6B20"
        borderRadius="10px"
        px="7px"
        fontSize="11px"
      >
        {badge}
      </Badge>
    )}
  </Flex>
);

const CertificateUploadPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(TAB_PENDING);

  // Pending tab state
  const { resource: pendingResource, handleFetchResource: fetchPending } = useFetch();
  const [pendingPage, setPendingPage] = useState(1);

  // All-docs tab state
  const { resource: allResource, handleFetchResource: fetchAll } = useFetch();
  const [userIdInput, setUserIdInput] = useState("");
  const [searchedUserId, setSearchedUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [allPage, setAllPage] = useState(1);

  // Modal state
  const uploadModal = useDisclosure();
  const viewModal = useDisclosure();
  const verifyModal = useDisclosure();
  const rejectModal = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ── Pending fetcher ──────────────────────────────────────────────────────
  const pendingFetcher = useCallback(
    async () => {
      const result = await adminGetPendingDocuments({ page: pendingPage, limit: 10 });
      return result;
    },
    [pendingPage],
  );

  useEffect(() => {
    if (activeTab === TAB_PENDING) fetchPending({ fetcher: pendingFetcher });
  }, [activeTab, fetchPending, pendingFetcher]);

  // ── All-docs fetcher ─────────────────────────────────────────────────────
  const allFetcher = useCallback(
    async () => {
      if (!searchedUserId) return { documents: [], pagination: {} };
      const params = { page: allPage, limit: 10 };
      if (statusFilter) params.verificationStatus = statusFilter;
      if (typeFilter) params.documentType = typeFilter;
      const result = await adminGetUserDocuments(searchedUserId, params);
      return result;
    },
    [searchedUserId, allPage, statusFilter, typeFilter],
  );

  useEffect(() => {
    if (activeTab === TAB_ALL) fetchAll({ fetcher: allFetcher });
  }, [activeTab, fetchAll, allFetcher]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const pendingDocs = pendingResource.data?.documents ?? [];
  const pendingSummary = pendingResource.data?.summary ?? {};
  const pendingPagination = pendingResource.data?.pagination ?? {};

  const allDocs = allResource.data?.documents ?? [];
  const allPagination = allResource.data?.pagination ?? {};

  const stats = {
    total: (pendingSummary.totalPending ?? 0) + (pendingDocs.filter((d) => d.verificationStatus === "VERIFIED").length),
    verified: pendingDocs.filter((d) => d.verificationStatus === "VERIFIED").length,
    pending: pendingSummary.totalPending ?? pendingDocs.filter((d) => d.verificationStatus === "PENDING").length,
    rejected: pendingDocs.filter((d) => d.verificationStatus === "REJECTED").length,
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!userIdInput.trim()) return;
    setSearchedUserId(userIdInput.trim());
    setAllPage(1);
  };

  const openView = (doc) => { setSelectedDoc(doc); viewModal.onOpen(); };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.fileName}"? This cannot be undone.`)) return;
    try {
      await adminDeleteDocument(doc.uploadId);
      toast({ title: "Document deleted", status: "success", duration: 3000, isClosable: true });
      refreshCurrentTab();
    } catch {
      toast({ title: "Failed to delete document", status: "error", duration: 3000, isClosable: true });
    }
  };

  const refreshCurrentTab = () => {
    if (activeTab === TAB_PENDING) fetchPending({ fetcher: pendingFetcher });
    else fetchAll({ fetcher: allFetcher });
  };

  return (
    <Box marginX="22px" marginY="20px">
      <PageHeader
        stats={stats}
        onUploadClick={uploadModal.onOpen}
      />

      {/* Main card */}
      <Box
        bg="white"
        borderRadius="8px"
        border="1px solid #E2E8F0"
        overflow="hidden"
      >
        {/* Tab bar */}
        <Flex borderBottom="1px solid #E2E8F0" px="4px">
          <TabButton
            label="Pending Verification"
            isActive={activeTab === TAB_PENDING}
            onClick={() => setActiveTab(TAB_PENDING)}
            badge={pendingSummary.totalPending}
          />
          <TabButton
            label="All Documents"
            isActive={activeTab === TAB_ALL}
            onClick={() => setActiveTab(TAB_ALL)}
          />
        </Flex>

        {/* ── PENDING TAB ─────────────────────────────────────────────── */}
        {activeTab === TAB_PENDING && (
          <DocumentTable
            documents={pendingDocs}
            loading={pendingResource.loading}
            error={pendingResource.err}
            emptyMessage="No documents pending verification."
            pagination={pendingPagination}
            page={pendingPage}
            onPageChange={setPendingPage}
            onView={openView}
            onDelete={handleDelete}
          />
        )}

        {/* ── ALL DOCS TAB ─────────────────────────────────────────────── */}
        {activeTab === TAB_ALL && (
          <>
            <DocumentFilters
              userIdInput={userIdInput}
              onUserIdChange={setUserIdInput}
              onSearch={handleSearch}
              statusFilter={statusFilter}
              onStatusChange={(v) => { setStatusFilter(v); setAllPage(1); }}
              typeFilter={typeFilter}
              onTypeChange={(v) => { setTypeFilter(v); setAllPage(1); }}
            />

            {!searchedUserId ? (
              <Flex justifyContent="center" py="48px" direction="column" alignItems="center" gap="8px">
                <Text color="gray.400" fontSize="14px">
                  Enter a Student ID above to view their documents.
                </Text>
              </Flex>
            ) : (
              <DocumentTable
                documents={allDocs}
                loading={allResource.loading}
                error={allResource.err}
                emptyMessage="No documents found for this student."
                pagination={allPagination}
                page={allPage}
                onPageChange={setAllPage}
                onView={openView}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </Box>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.onClose}
        onSuccess={refreshCurrentTab}
      />
      <ViewDocumentModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.onClose}
        document={selectedDoc}
        onSuccess={refreshCurrentTab}
      />
      <VerifyDocumentModal
        isOpen={verifyModal.isOpen}
        onClose={verifyModal.onClose}
        document={selectedDoc}
        onSuccess={refreshCurrentTab}
      />
      <RejectDocumentModal
        isOpen={rejectModal.isOpen}
        onClose={rejectModal.onClose}
        document={selectedDoc}
        onSuccess={refreshCurrentTab}
      />
    </Box>
  );
};

export const CertificateUploadPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CertificateUploadPage {...props} />} />
);

export default CertificateUploadPage;
