import React, { useEffect, useState } from "react";
import { Route, useHistory, useLocation, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Button, Heading } from "../../../components";
import { useQueryParams } from "../../../hooks";
import {
  confirmExamQuestionBatchImport,
  deleteExamQuestionBatchRow,
  getExamQuestionBatchReport,
  getExamQuestionBatchRows,
  updateExamQuestionBatchRow,
} from "../../../services";
import { FiArrowLeft } from "react-icons/fi";
import StagedQuestionRow from "./StagedQuestionRow";
import {
  buildQuestionListingLink,
  contextLabel,
  getUploadContext,
  normalizeStagedRow,
  normalizeStagedRows,
} from "./questionRowUtils";

const ReviewImportPage = () => {
  const { uploadId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();
  const context = getUploadContext(useQueryParams());

  const preloadedRows = location.state?.rows;
  const [rows, setRows] = useState(preloadedRows ?? []);
  const [loading, setLoading] = useState(!preloadedRows);
  const [report, setReport] = useState(null);
  const [savingRowId, setSavingRowId] = useState(null);
  const [removingRowId, setRemovingRowId] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!preloadedRows) {
      setLoading(true);
      getExamQuestionBatchRows(uploadId, "pending_review")
        .then((res) => setRows(normalizeStagedRows(res?.data?.rows ?? res?.rows ?? res)))
        .catch(() =>
          toast({ description: "Failed to load staged questions", position: "top", status: "error" }),
        )
        .finally(() => setLoading(false));
    }

    getExamQuestionBatchReport(uploadId)
      .then((res) => setReport(res?.data ?? res))
      .catch(() => setReport(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId]);

  const handleSaveRow = async (rowId, patch) => {
    setSavingRowId(rowId);
    try {
      const res = await updateExamQuestionBatchRow(uploadId, rowId, patch);
      const updated = res?.data ?? res;
      setRows((prev) =>
        prev.map((r) => (r.rowId === rowId ? normalizeStagedRow({ ...updated, rowId }) : r)),
      );
      toast({ description: "Row updated", position: "top", status: "success" });
    } catch (err) {
      toast({
        description: err?.response?.data?.message || "Failed to update row",
        position: "top",
        status: "error",
      });
    } finally {
      setSavingRowId(null);
    }
  };

  const handleRemoveRow = async (rowId) => {
    if (!window.confirm("Remove this question from the import?")) return;
    setRemovingRowId(rowId);
    try {
      await deleteExamQuestionBatchRow(uploadId, rowId);
      setRows((prev) => prev.filter((r) => r.rowId !== rowId));
      toast({ description: "Row removed", position: "top", status: "success" });
    } catch (err) {
      toast({
        description: err?.response?.data?.message || "Failed to remove row",
        position: "top",
        status: "error",
      });
    } finally {
      setRemovingRowId(null);
    }
  };

  // Confirming an import kicks off backend processing (pending → processing
  // → success/partial_success/failed — the same states ImportReportPage.jsx
  // already renders) rather than finishing synchronously — so poll the
  // report instead of navigating away the instant the confirm call resolves,
  // which used to race ahead of the questions actually being created.
  const POLL_INTERVAL_MS = 1500;
  const MAX_POLL_ATTEMPTS = 20; // ~30s
  const TERMINAL_STATUSES = ["success", "partial_success", "failed"];

  const handleConfirm = async () => {
    if (!rows.length) return;
    setConfirming(true);
    try {
      await confirmExamQuestionBatchImport(uploadId);

      let finalReport = null;
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        const res = await getExamQuestionBatchReport(uploadId);
        const rep = res?.data ?? res;
        if (TERMINAL_STATUSES.includes(rep?.uploadStatus)) {
          finalReport = rep;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (!finalReport) {
        toast({
          description: "Still processing — this is taking longer than usual. Check Batch History shortly for the result.",
          position: "top",
          status: "warning",
        });
        return;
      }

      if (finalReport.uploadStatus === "failed") {
        toast({
          description: "Import failed — check the report for details.",
          position: "top",
          status: "error",
        });
        return;
      }

      const count = finalReport.importedCount ?? rows.length;
      toast({
        description: `${count} question${count === 1 ? "" : "s"} imported successfully${
          finalReport.uploadStatus === "partial_success" ? " (some rows were skipped — see the report for details)" : ""
        }`,
        position: "top",
        status: finalReport.uploadStatus === "partial_success" ? "warning" : "success",
      });
      history.push(buildQuestionListingLink(context));
    } catch (err) {
      toast({
        description: err?.response?.data?.message || "Failed to confirm import",
        position: "top",
        status: "error",
      });
    } finally {
      setConfirming(false);
    }
  };

  const reportErrors = (report?.errors ?? []).map((e) => ({ ...e, type: "error" }));
  const reportWarnings = (report?.warnings ?? []).map((w) => ({ ...w, type: "warning" }));
  const reportEntries = [...reportErrors, ...reportWarnings];
  const errors = reportErrors.length;
  const warnings = reportWarnings.length;

  return (
    <Box marginX="22px" marginY="20px" maxW="900px">
      <Flex alignItems="center" gap="12px" mb="20px">
        <Flex as="button" alignItems="center" gap="6px" color="#6b006b" onClick={() => history.push(buildQuestionListingLink(context))} _hover={{ opacity: 0.8 }}>
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">Back to Questions</Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Heading fontSize="20px" fontWeight="600">Review Imported {contextLabel(context)} Questions</Heading>
      </Flex>

      {(errors > 0 || warnings > 0) && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" mb="20px" overflow="hidden">
          <Flex gap="10px" px="16px" py="12px" borderBottom="1px solid #E2E8F0">
            {errors > 0 && (
              <Badge bg="#FFF5F5" color="#E53E3E" px="10px" py="4px" borderRadius="6px" fontSize="12px" textTransform="none">
                {errors} error{errors === 1 ? "" : "s"} in file
              </Badge>
            )}
            {warnings > 0 && (
              <Badge bg="#FFF5EA" color="#DD6B20" px="10px" py="4px" borderRadius="6px" fontSize="12px" textTransform="none">
                {warnings} warning{warnings === 1 ? "" : "s"}
              </Badge>
            )}
          </Flex>
          <Table size="sm" variant="simple">
            <Thead bg="#F7FAFC">
              <Tr>
                <Th fontSize="11px">Row #</Th>
                <Th fontSize="11px">Type</Th>
                <Th fontSize="11px">Message</Th>
                <Th fontSize="11px">Suggestion</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reportEntries.map((entry, i) => (
                <Tr key={i}>
                  <Td fontSize="12px">{entry.row ?? entry.rowNumber ?? "—"}</Td>
                  <Td>
                    <Badge
                      bg={entry.type === "error" ? "#FFF5F5" : "#FFF5EA"}
                      color={entry.type === "error" ? "#E53E3E" : "#DD6B20"}
                      fontSize="10px"
                      textTransform="none"
                    >
                      {entry.type}
                    </Badge>
                  </Td>
                  <Td fontSize="12px">{entry.error ?? entry.message ?? "—"}</Td>
                  <Td fontSize="12px" color="gray.500">{entry.suggestion ?? "—"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Box bg="#EBF4FF" border="1px solid #90CDF4" borderRadius="8px" p="12px" mb="20px">
        <Text fontSize="12px" color="#2C5282">
          These questions are staged and not yet saved. Edit or remove any row, then confirm to add them to the question bank.
        </Text>
      </Box>

      {loading && (
        <Flex justifyContent="center" py="60px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && rows.length === 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="40px" textAlign="center">
          <Text color="gray.500">No staged questions remain — every row was removed.</Text>
        </Box>
      )}

      {!loading &&
        rows.map((row, index) => (
          <StagedQuestionRow
            key={row.rowId}
            row={row}
            index={index}
            onSave={handleSaveRow}
            onRemove={handleRemoveRow}
            saving={savingRowId === row.rowId}
            removing={removingRowId === row.rowId}
          />
        ))}

      {!loading && rows.length > 0 && (
        <Flex justifyContent="flex-end" mt="20px">
          <Button isLoading={confirming} loadingText="Processing..." onClick={handleConfirm}>
            Confirm Import ({rows.length} question{rows.length === 1 ? "" : "s"})
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export const ReviewImportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ReviewImportPage {...props} />} />
);

export default ReviewImportPageRoute;
