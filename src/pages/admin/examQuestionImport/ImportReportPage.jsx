import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
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
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { getExamQuestionBatchReport } from "../../../services";
import { buildBatchUploadLink } from "./questionRowUtils";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import dayjs from "dayjs";

const STATUS_STYLE = {
  pending:        { bg: "#F7FAFC", color: "#718096", label: "Pending" },
  processing:     { bg: "#EBF4FF", color: "#3182CE", label: "Processing" },
  pending_review: { bg: "#FFF5EA", color: "#DD6B20", label: "Pending Review" },
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

const SummaryRow = ({ label, value }) => (
  <Flex justifyContent="space-between" py="8px" borderBottom="1px solid #F7FAFC">
    <Text fontSize="13px" color="gray.500">{label}</Text>
    <Text fontSize="13px" fontWeight="600" color="#1A202C">{value ?? "—"}</Text>
  </Flex>
);

const ImportReportPage = () => {
  const { uploadId } = useParams();
  const history = useHistory();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExamQuestionBatchReport(uploadId)
      .then((res) => setReport(res?.data ?? res))
      .finally(() => setLoading(false));
  }, [uploadId]);

  if (loading) {
    return <Flex justifyContent="center" alignItems="center" minH="400px"><Spinner size="xl" color="#6b006b" /></Flex>;
  }

  if (!report) {
    return (
      <Box marginX="22px" marginY="20px">
        <Text color="red.500">Failed to load report.</Text>
        <Button secondary mt="12px" onClick={() => history.push("/admin/question-imports")}>Back to History</Button>
      </Box>
    );
  }

  const allErrors = report.importErrors ?? report.errors?.concat(report.warnings ?? []) ?? [];
  const errors = allErrors.filter((e) => (e.errorType ?? "error") === "error");
  const warnings = allErrors.filter((e) => e.errorType === "warning");

  // Report data carries the same id fields as an upload-history row — infer
  // context the same way BatchHistoryPage.jsx does, since the backend has no
  // dedicated `standalone` flag.
  const uploadContext = {
    courseId: report.courseId || undefined,
    assessmentId: report.assessmentId || undefined,
    examinationId: report.examinationId || undefined,
    standalone: Boolean(report.examinationId) && !report.courseId && !report.assessmentId,
  };

  return (
    <Box marginX="22px" marginY="20px" maxW="1000px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/question-imports">Question Imports</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Import Report</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between" mb="24px" flexWrap="wrap" gap="12px">
        <Flex alignItems="center" gap="12px">
          <Flex
            as="button" alignItems="center" gap="6px" color="#6b006b"
            onClick={() => history.push("/admin/question-imports")}
            _hover={{ opacity: 0.8 }}
          >
            <FiArrowLeft size={14} />
            <Text fontSize="13px" fontWeight="600">History</Text>
          </Flex>
          <Box w="1px" h="20px" bg="#E2E8F0" />
          <Heading fontSize="20px" fontWeight="600">Import Report</Heading>
        </Flex>
      </Flex>

      {/* Report Header Card */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px" mb="20px">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px">
          <Box>
            <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="10px">
              Upload Info
            </Text>
            <SummaryRow label="Upload ID" value={
              <Text fontFamily="mono" fontSize="12px">
                {(report.id ?? report.uploadId ?? uploadId ?? "—").toString().slice(0, 8)}...
              </Text>
            } />
            <SummaryRow label="File Name" value={report.fileName} />
            <SummaryRow label="File Type" value={(report.fileType ?? "").toUpperCase()} />
            <SummaryRow label="Status" value={<StatusChip status={report.uploadStatus} />} />
            <SummaryRow label="Default Difficulty" value={report.defaultDifficulty ?? "None"} />
            <SummaryRow label="Created" value={report.createdAt ? dayjs(report.createdAt).format("DD/MM/YYYY HH:mm") : "—"} />
            <SummaryRow label="Completed" value={report.completedAt ? dayjs(report.completedAt).format("DD/MM/YYYY HH:mm") : "—"} />
          </Box>
          <Box>
            <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="10px">
              Exam / Media Info
            </Text>
            <SummaryRow label="Examination" value={report.examination?.title ?? report.examinationId ?? "—"} />
            <SummaryRow label="Course" value={report.course?.title ?? report.courseId ?? "—"} />
            <SummaryRow label="Media ZIP Included" value={report.multimediaIncluded ? "Yes" : "No"} />
            {report.multimediaIncluded && (
              <>
                <SummaryRow label="ZIP File" value={report.multimediaZipName ?? "—"} />
                <SummaryRow
                  label="Media Processed"
                  value={
                    <Badge
                      bg={report.multimediaProcessed ? "#E6F4EA" : "#FFF5EA"}
                      color={report.multimediaProcessed ? "#38A169" : "#DD6B20"}
                      px="6px" py="1px" borderRadius="4px" fontSize="11px"
                    >
                      {report.multimediaProcessed ? "✅ Complete" : "⏳ Pending"}
                    </Badge>
                  }
                />
              </>
            )}

            <Box mt="14px">
              <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="10px">
                Summary
              </Text>
              <SummaryRow label="Total rows in file" value={report.totalRows} />
              <SummaryRow label="Passed validation" value={<Text color="#38A169" fontWeight="700">{report.validRows}</Text>} />
              <SummaryRow label="Skipped (errors)" value={<Text color="#E53E3E" fontWeight="700">{report.errorRows}</Text>} />
              <SummaryRow label="Successfully imported" value={<Text color="#6b006b" fontWeight="700">{report.importedCount}</Text>} />
              {(report.skippedDueToSlots ?? 0) > 0 && (
                <SummaryRow label="Skipped (slot limit)" value={<Text color="#DD6B20" fontWeight="700">{report.skippedDueToSlots}</Text>} />
              )}
            </Box>
          </Box>
        </Grid>
      </Box>

      {/* Errors Section */}
      {errors.length > 0 && (
        <Box bg="white" border="1px solid #FED7D7" borderRadius="10px" overflow="hidden" mb="20px">
          <Box bg="#FFF5F5" px="20px" py="14px" borderBottom="1px solid #FED7D7">
            <Text fontSize="13px" fontWeight="700" color="#C53030">
              ❌ Rows Skipped — Fix and Re-upload ({errors.length})
            </Text>
            <Text fontSize="12px" color="#9B2C2C" mt="2px">These rows were NOT imported. Correct the issues and upload again.</Text>
          </Box>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#FFF5F5">
                <Tr>
                  {["Row #", "Field", "Error", "Suggestion"].map((h) => (
                    <Th key={h} py="10px" fontSize="11px" color="#9B2C2C" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {errors.map((e) => (
                  <Tr key={e.id ?? `e-${e.rowNumber}-${e.field}`} bg="#FFFAFA" _hover={{ bg: "#FFF5F5" }}>
                    <Td py="10px"><Text fontSize="12px" fontWeight="700" color="#C53030">#{e.rowNumber}</Text></Td>
                    <Td py="10px">
                      {e.field
                        ? <Text fontFamily="mono" fontSize="11px" bg="#FED7D7" color="#9B2C2C" px="6px" py="2px" borderRadius="4px">{e.field}</Text>
                        : <Text fontSize="12px" color="gray.400">—</Text>}
                    </Td>
                    <Td py="10px" maxW="300px"><Text fontSize="12px" color="#1A202C">{e.message}</Text></Td>
                    <Td py="10px" maxW="240px"><Text fontSize="12px" color="gray.500">{e.suggestion ?? "—"}</Text></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <Box bg="white" border="1px solid #FEFCBF" borderRadius="10px" overflow="hidden" mb="20px">
          <Box bg="#FFFFF0" px="20px" py="14px" borderBottom="1px solid #FEFCBF">
            <Text fontSize="13px" fontWeight="700" color="#744210">
              ⚠️ Rows Imported with Notices ({warnings.length})
            </Text>
            <Text fontSize="12px" color="#975A16" mt="2px">These rows WERE imported but had non-blocking issues.</Text>
          </Box>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="#FFFFF0">
                <Tr>
                  {["Row #", "Field", "Notice"].map((h) => (
                    <Th key={h} py="10px" fontSize="11px" color="#975A16" fontWeight="600" textTransform="none">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {warnings.map((w) => (
                  <Tr key={w.id ?? `w-${w.rowNumber}-${w.field}`} bg="#FFFFF5" _hover={{ bg: "#FFFFF0" }}>
                    <Td py="10px"><Text fontSize="12px" fontWeight="700" color="#975A16">#{w.rowNumber}</Text></Td>
                    <Td py="10px">
                      {w.field
                        ? <Text fontFamily="mono" fontSize="11px" bg="#FEFCBF" color="#744210" px="6px" py="2px" borderRadius="4px">{w.field}</Text>
                        : <Text fontSize="12px" color="gray.400">—</Text>}
                    </Td>
                    <Td py="10px" maxW="400px"><Text fontSize="12px" color="#1A202C">{w.message}</Text></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Footer */}
      <Flex gap="10px" flexWrap="wrap">
        <Button
          secondary leftIcon={<FiUpload />}
          onClick={() => history.push(buildBatchUploadLink(uploadContext))}
        >
          Upload Corrected File
        </Button>
        <Button
          secondary leftIcon={<FiArrowLeft size={13} />}
          onClick={() => history.push("/admin/question-imports")}
        >
          Back to History
        </Button>
      </Flex>
    </Box>
  );
};

export const ImportReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ImportReportPage {...props} />} />
);

export default ImportReportPageRoute;
