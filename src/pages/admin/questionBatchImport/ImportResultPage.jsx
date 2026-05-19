import React, { useEffect, useState } from "react";
import { Route, useHistory, useLocation, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  Grid,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Button, Heading } from "../../../components";
import { getBatchImportDetail } from "../../../services";
import { FiArrowLeft, FiFileText, FiRefreshCw, FiUpload } from "react-icons/fi";
import dayjs from "dayjs";

const STATUS_STYLE = {
  pending:        { bg: "#F7FAFC", color: "#718096", label: "Pending" },
  processing:     { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
  success:        { bg: "#E6F4EA", color: "#38A169", label: "Success" },
  partial_success:{ bg: "#FFF5EA", color: "#DD6B20", label: "Partial Success" },
  failed:         { bg: "#FFF5F5", color: "#E53E3E", label: "Failed" },
};

const StatusChip = ({ status }) => {
  const s = STATUS_STYLE[status] ?? { bg: "#F7FAFC", color: "#718096", label: status ?? "—" };
  return (
    <Badge bg={s.bg} color={s.color} px="8px" py="2px" borderRadius="6px" textTransform="none" fontSize="12px" fontWeight="600">
      {s.label}
    </Badge>
  );
};

const KpiCard = ({ icon, label, value, color }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="16px" textAlign="center">
    <Text fontSize="22px" mb="4px">{icon}</Text>
    <Text fontSize="28px" fontWeight="700" color={color}>{value ?? "—"}</Text>
    <Text fontSize="12px" color="gray.500" mt="2px">{label}</Text>
  </Box>
);

const ErrorTypeChip = ({ type }) => (
  <Badge
    bg={type === "error" ? "#FFF5F5" : "#FFF5EA"}
    color={type === "error" ? "#E53E3E" : "#DD6B20"}
    px="6px" py="1px" borderRadius="4px" fontSize="10px" fontWeight="700" textTransform="none"
  >
    {type === "error" ? "❌ Error" : "⚠️ Warning"}
  </Badge>
);

const ImportResultPage = () => {
  const { examinationId, uploadId } = useParams();
  const history = useHistory();
  const location = useLocation();

  const preloaded = location.state?.resultData;
  const [detail, setDetail] = useState(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);
  const [errorFilter, setErrorFilter] = useState("all");

  useEffect(() => {
    if (preloaded) return;
    setLoading(true);
    getBatchImportDetail(uploadId)
      .then((res) => setDetail(res?.data ?? res))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [uploadId, preloaded]);

  const handleRefresh = () => {
    setLoading(true);
    getBatchImportDetail(uploadId)
      .then((res) => setDetail(res?.data ?? res))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return <Flex justifyContent="center" alignItems="center" minH="400px"><Spinner size="xl" color="#6b006b" /></Flex>;
  }

  if (!detail) {
    return (
      <Box marginX="22px" marginY="20px">
        <Text color="red.500" fontSize="14px">Failed to load import result. The upload record may not exist.</Text>
        <Button secondary mt="12px" onClick={() => history.goBack()}>Go Back</Button>
      </Box>
    );
  }

  const allErrors = detail.importErrors ?? [];
  const errors = allErrors.filter((e) => e.errorType === "error");
  const warnings = allErrors.filter((e) => e.errorType === "warning");
  const skippedDueToSlots = detail.skippedDueToSlots ?? 0;

  const filteredErrors =
    errorFilter === "error" ? errors :
    errorFilter === "warning" ? warnings :
    allErrors;

  return (
    <Box marginX="22px" marginY="20px" maxW="1000px">
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between" mb="24px" flexWrap="wrap" gap="12px">
        <Flex alignItems="center" gap="12px">
          <Flex as="button" alignItems="center" gap="6px" color="#6b006b" onClick={() => history.push(`/admin/batch-import/${examinationId}/history`)} _hover={{ opacity: 0.8 }}>
            <FiArrowLeft size={14} />
            <Text fontSize="13px" fontWeight="600">History</Text>
          </Flex>
          <Box w="1px" h="20px" bg="#E2E8F0" />
          <Heading fontSize="20px" fontWeight="600">Import Result</Heading>
        </Flex>
        <Flex gap="8px">
          {(detail.uploadStatus === "processing" || detail.uploadStatus === "pending") && (
            <Button secondary size="sm" leftIcon={<FiRefreshCw size={13} />} onClick={handleRefresh} isLoading={loading}>
              Refresh
            </Button>
          )}
          <Button
            secondary size="sm" leftIcon={<FiFileText size={13} />}
            onClick={() => history.push(`/admin/batch-import/${examinationId}/result/${uploadId}/report`)}
          >
            Full Report
          </Button>
        </Flex>
      </Flex>

      {/* Result Summary Header */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px" mb="20px">
        <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px" mb="16px">
          <Box>
            <Flex alignItems="center" gap="10px" mb="8px">
              <StatusChip status={detail.uploadStatus} />
              {detail.multimediaIncluded && (
                <Badge bg="#F0E6FF" color="#6b006b" px="8px" py="2px" borderRadius="6px" fontSize="11px">
                  📦 Media ZIP
                </Badge>
              )}
            </Flex>
            <Text fontSize="16px" fontWeight="600" color="#1A202C">{detail.fileName ?? "—"}</Text>
            <Text fontSize="12px" color="gray.400" mt="2px" textTransform="uppercase">{detail.fileType}</Text>
          </Box>
          <Box textAlign="right">
            {detail.examination?.title && (
              <Text fontSize="13px" color="gray.600"><Text as="span" fontWeight="600">Exam:</Text> {detail.examination.title}</Text>
            )}
            {detail.course?.title && (
              <Text fontSize="13px" color="gray.600"><Text as="span" fontWeight="600">Course:</Text> {detail.course.title}</Text>
            )}
            {detail.defaultDifficulty && (
              <Text fontSize="12px" color="gray.500" mt="2px">Default Difficulty: {detail.defaultDifficulty}</Text>
            )}
            {detail.completedAt && (
              <Text fontSize="12px" color="gray.400" mt="2px">Completed: {dayjs(detail.completedAt).format("DD/MM/YYYY HH:mm")}</Text>
            )}
          </Box>
        </Flex>

        {detail.multimediaIncluded && (
          <Box
            bg={detail.multimediaProcessed ? "#F0FFF4" : "#FFF5EA"}
            borderRadius="6px" p="10px"
            display="inline-block"
          >
            <Text fontSize="12px" fontWeight="500" color={detail.multimediaProcessed ? "#276749" : "#744210"}>
              {detail.multimediaProcessed
                ? "✅ Media processing: Complete"
                : "⏳ Media processing in progress — ZIP extraction is async and may take a moment"}
            </Text>
          </Box>
        )}
      </Box>

      {/* KPI Cards */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }} gap="12px" mb="20px">
        <KpiCard icon="📋" label="Total Rows" value={detail.totalRows} color="#3182CE" />
        <KpiCard icon="✅" label="Imported" value={detail.importedCount} color="#38A169" />
        <KpiCard icon="⚠️" label="Warnings" value={warnings.length} color="#DD6B20" />
        <KpiCard icon="❌" label="Error Rows" value={detail.errorRows} color="#E53E3E" />
      </Grid>

      {/* Slot cap notice */}
      {skippedDueToSlots > 0 && (
        <Box bg="#FFF5EA" border="1px solid #F6AD55" borderRadius="8px" p="14px" mb="20px">
          <Text fontSize="13px" color="#744210" fontWeight="500">
            ⚠️ {skippedDueToSlots} valid row{skippedDueToSlots !== 1 ? "s" : ""} were not imported because the examination has reached its maximum question limit.
            You may need to increase the exam question limit before re-uploading.
          </Text>
        </Box>
      )}

      {/* Errors Table */}
      {allErrors.length > 0 && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
          <Flex justifyContent="space-between" alignItems="center" px="20px" py="14px" borderBottom="1px solid #E2E8F0">
            <Text fontSize="13px" fontWeight="600" color="#1A202C">
              Import Log ({allErrors.length} entr{allErrors.length !== 1 ? "ies" : "y"})
            </Text>
            <Flex gap="6px">
              {["all", "error", "warning"].map((f) => (
                <Box
                  key={f}
                  as="button"
                  px="12px" py="5px" borderRadius="6px" fontSize="12px" fontWeight="600"
                  bg={errorFilter === f ? "#6b006b" : "#F7FAFC"}
                  color={errorFilter === f ? "white" : "gray.500"}
                  border="1px solid"
                  borderColor={errorFilter === f ? "#6b006b" : "#E2E8F0"}
                  onClick={() => setErrorFilter(f)}
                  textTransform="capitalize"
                >
                  {f === "all" ? `All (${allErrors.length})` : f === "error" ? `Errors (${errors.length})` : `Warnings (${warnings.length})`}
                </Box>
              ))}
            </Flex>
          </Flex>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#F7FAFC">
                <Tr>
                  {["Row #", "Type", "Field", "Message", "Suggestion"].map((h) => (
                    <Th key={h} py="10px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {filteredErrors.map((e) => (
                  <Tr
                    key={e.id ?? `${e.rowNumber}-${e.field}`}
                    bg={e.errorType === "error" ? "#FFF5F5" : "#FFFBEB"}
                  >
                    <Td py="10px">
                      <Text fontSize="12px" fontWeight="700" color="gray.600">#{e.rowNumber}</Text>
                    </Td>
                    <Td py="10px"><ErrorTypeChip type={e.errorType} /></Td>
                    <Td py="10px">
                      {e.field ? (
                        <Text fontFamily="mono" fontSize="11px" bg="#F7FAFC" px="6px" py="2px" borderRadius="4px" color="#6b006b">{e.field}</Text>
                      ) : <Text fontSize="12px" color="gray.400">—</Text>}
                    </Td>
                    <Td py="10px" maxW="280px">
                      <Text fontSize="12px" color="#1A202C">{e.message}</Text>
                    </Td>
                    <Td py="10px" maxW="220px">
                      <Text fontSize="12px" color="gray.500">{e.suggestion ?? "—"}</Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Actions */}
      <Flex gap="10px" mt="24px" flexWrap="wrap">
        <Button
          secondary leftIcon={<FiFileText />}
          onClick={() => history.push(`/admin/batch-import/${examinationId}/result/${uploadId}/report`)}
        >
          Download Full Report
        </Button>
        <Button
          secondary leftIcon={<FiUpload />}
          onClick={() => history.push(`/admin/batch-import/${examinationId}`)}
        >
          Upload Fixed File
        </Button>
        <Button
          secondary
          onClick={() => history.push(`/admin/multimedia-questions/${examinationId}`)}
        >
          View Question Bank
        </Button>
      </Flex>
    </Box>
  );
};

export const ImportResultPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ImportResultPage {...props} />} />
);

export default ImportResultPageRoute;
