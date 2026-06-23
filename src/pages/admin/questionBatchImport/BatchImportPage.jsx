import React, { useRef, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { downloadBatchImportTemplate, uploadBatchImport } from "../../../services";
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiDownload, FiUpload, FiX } from "react-icons/fi";

// ─── Column spec (from BatchModule.md §4) ────────────────────────────────────

const COLUMNS = [
  { col: "question_text",    required: "Required",     applies: "All",              desc: "Full question statement — must not be empty" },
  { col: "question_type",    required: "Optional",     applies: "All",              desc: 'mcq / essay / true_false / fill_blank / matching / short_answer — defaults to "mcq"' },
  { col: "difficulty_level", required: "Optional",     applies: "All",              desc: 'Easy / Medium / Hard — falls back to defaultDifficulty setting, then null' },
  { col: "marks",            required: "Optional",     applies: "All",              desc: "Positive integer — defaults to 1" },
  { col: "section",          required: "Optional",     applies: "All",              desc: "Section or topic label" },
  { col: "tags",             required: "Optional",     applies: "All",              desc: 'Comma-separated — e.g. "algorithms,searching"' },
  { col: "rubric",           required: "Optional",     applies: "Essay / Short",    desc: "Grading rubric text" },
  { col: "option_a",         required: "MCQ Required", applies: "MCQ",              desc: "Text for option A" },
  { col: "option_b",         required: "MCQ Required", applies: "MCQ",              desc: "Text for option B" },
  { col: "option_c",         required: "Optional",     applies: "MCQ",              desc: "Optional option C" },
  { col: "option_d",         required: "Optional",     applies: "MCQ",              desc: "Optional option D" },
  { col: "correct_answer",   required: "MCQ/T-F Req.", applies: "MCQ, True/False",  desc: "MCQ: A/B/C/D · True/False: A=True, B=False" },
  { col: "media_reference",  required: "Optional",     applies: "All",              desc: 'Filename of image inside companion ZIP — e.g. "cell_diagram.png"' },
];

const REQ_STYLE = {
  "Required":     { bg: "#FED7D7", color: "#C53030" },
  "MCQ Required": { bg: "#FEE2E2", color: "#9B2C2C" },
  "MCQ/T-F Req.": { bg: "#FEE2E2", color: "#9B2C2C" },
  "Optional":     { bg: "#F7FAFC", color: "#718096" },
};

// ─── File upload zone ─────────────────────────────────────────────────────────

const FileUploadZone = ({ accept, file, onChange, label, help, accept_label }) => {
  const ref = useRef();
  return (
    <Box
      border="2px dashed"
      borderColor={file ? "#38A169" : "#CBD5E0"}
      borderRadius="8px"
      p="20px"
      textAlign="center"
      cursor="pointer"
      bg={file ? "#F0FFF4" : "#F7FAFC"}
      transition="border-color 0.15s"
      _hover={{ borderColor: "#6b006b" }}
      onClick={() => ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => { onChange(e.target.files[0] ?? null); e.target.value = ""; }}
      />
      {file ? (
        <Flex justifyContent="center" alignItems="center" gap="8px">
          <FiUpload color="#38A169" />
          <Text fontSize="13px" fontWeight="600" color="#276749">{file.name}</Text>
          <Text fontSize="12px" color="gray.400">({(file.size / 1024).toFixed(1)} KB)</Text>
          <IconButton
            aria-label="Remove file"
            icon={<FiX size={12} />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
          />
        </Flex>
      ) : (
        <>
          <FiUpload color="#A0AEC0" size={20} style={{ margin: "0 auto 8px" }} />
          <Text fontSize="13px" fontWeight="500" color="gray.500">{label}</Text>
          <Text fontSize="11px" color="gray.400" mt="4px">{accept_label}</Text>
          {help && <Text fontSize="11px" color="gray.400" mt="2px">{help}</Text>}
        </>
      )}
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const BatchImportPage = () => {
  const { examinationId } = useParams();
  const history = useHistory();
  const toast = useToast();

  const [defaultDifficulty, setDefaultDifficulty] = useState("");
  const [file, setFile] = useState(null);
  const [mediaZip, setMediaZip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showColumnGuide, setShowColumnGuide] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const blob = await downloadBatchImportTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "question_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Failed to download template", status: "error", duration: 3000, isClosable: true });
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (selected) => {
    if (!selected) { setFile(null); return; }
    const ext = selected.name.split(".").pop().toLowerCase();
    if (!["xlsx", "csv"].includes(ext)) {
      toast({ title: "Please upload an Excel (.xlsx) or CSV (.csv) file", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    if (selected.size === 0) {
      toast({ title: "File is empty — please select a valid file", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setFile(selected);
  };

  const handleZipChange = (selected) => {
    if (!selected) { setMediaZip(null); return; }
    const ext = selected.name.split(".").pop().toLowerCase();
    if (ext !== "zip") {
      toast({ title: "Media archive must be a .zip file", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setMediaZip(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("examinationId", examinationId);
    if (defaultDifficulty) formData.append("defaultDifficulty", defaultDifficulty);
    if (mediaZip) formData.append("mediaZip", mediaZip);

    setUploading(true);
    try {
      const res = await uploadBatchImport(formData);
      const raw = res?.data ?? res;

      // Merge separate errors/warnings arrays into a single importErrors list
      // with an errorType field so ImportResultPage can filter them uniformly
      const errItems = (raw.importErrors ?? raw.errors ?? []).map((e) => ({
        ...e,
        errorType: e.errorType ?? "error",
      }));
      const warnItems = (raw.warnings ?? []).map((w) => ({
        ...w,
        errorType: w.errorType ?? "warning",
      }));

      const detail = {
        ...raw,
        totalRows: raw.summary?.totalRows ?? raw.totalRows,
        validRows: raw.summary?.validRows ?? raw.validRows,
        importedCount: raw.summary?.importedCount ?? raw.importedCount,
        errorRows: raw.summary?.errorRows ?? raw.errorRows,
        skippedDueToSlots: raw.summary?.skippedDueToSlots ?? raw.skippedDueToSlots ?? 0,
        importErrors: [...errItems, ...warnItems],
      };

      const uploadId = detail.uploadId ?? detail.id ?? detail._id;
      toast({ title: "Upload submitted successfully", status: "success", duration: 3000, isClosable: true });
      history.push(`/admin/batch-import/${examinationId}/result/${uploadId}`, { resultData: detail });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "";
      if (status === 400 && msg.toLowerCase().includes("file type")) {
        toast({ title: "Please upload an Excel (.xlsx) or CSV (.csv) file", status: "warning", duration: 4000, isClosable: true });
      } else if (status === 400 && msg.toLowerCase().includes("no valid")) {
        toast({ title: "No valid question rows found. Check that your file has a question_text column.", status: "warning", duration: 5000, isClosable: true });
      } else if (status === 404) {
        toast({ title: "Examination not found. Please check the examination ID.", status: "error", duration: 5000, isClosable: true });
      } else {
        toast({ title: msg || "Upload failed. Please try again.", status: "error", duration: 4000, isClosable: true });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box marginX="22px" marginY="20px" maxW="860px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/examination">Examination Analysis</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Batch Import</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between" mb="20px" flexWrap="wrap" gap="12px">
        <Flex alignItems="center" gap="12px">
          <Flex as="button" alignItems="center" gap="6px" color="#6b006b" onClick={() => history.goBack()} _hover={{ opacity: 0.8 }}>
            <FiArrowLeft size={14} />
            <Text fontSize="13px" fontWeight="600">Back</Text>
          </Flex>
          <Box w="1px" h="20px" bg="#E2E8F0" />
          <Heading fontSize="20px" fontWeight="600">Batch Import Questions</Heading>
        </Flex>
        <Button
          secondary
          size="sm"
          onClick={() => history.push(`/admin/batch-import/${examinationId}/history`)}
        >
          View Upload History
        </Button>
      </Flex>

      <Flex direction="column" gap="20px">
        {/* Step 1: Download Template */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Flex alignItems="center" gap="10px" mb="12px">
            <Box w="24px" h="24px" bg="#6b006b" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Text fontSize="11px" fontWeight="700" color="white">1</Text>
            </Box>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">Download the Question Template</Text>
          </Flex>
          <Text fontSize="13px" color="gray.500" mb="16px">
            Fill in the Questions sheet. <Text as="span" fontWeight="600" color="#C53030">Do not rename column headers</Text> — the parser maps columns by exact header name and altered headers will cause the entire file to fail.
          </Text>
          <Flex gap="10px" flexWrap="wrap">
            <Button leftIcon={<FiDownload />} isLoading={downloading} onClick={handleDownloadTemplate}>
              Download Excel Template
            </Button>
            <Button
              secondary
              rightIcon={showColumnGuide ? <FiChevronUp /> : <FiChevronDown />}
              onClick={() => setShowColumnGuide((p) => !p)}
            >
              Column Guide
            </Button>
          </Flex>

          <Collapse in={showColumnGuide} animateOpacity>
            <Box mt="16px" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      {["Column", "Required?", "Applies To", "Description"].map((h) => (
                        <Th key={h} py="10px" fontSize="11px" color="gray.500" fontWeight="600" textTransform="none">{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {COLUMNS.map((c) => {
                      const rs = REQ_STYLE[c.required] ?? REQ_STYLE["Optional"];
                      return (
                        <Tr key={c.col}>
                          <Td py="8px"><Text fontFamily="mono" fontSize="12px" color="#6b006b">{c.col}</Text></Td>
                          <Td py="8px">
                            <Box bg={rs.bg} color={rs.color} px="6px" py="1px" borderRadius="4px" display="inline-block" fontSize="10px" fontWeight="600">
                              {c.required}
                            </Box>
                          </Td>
                          <Td py="8px"><Text fontSize="12px" color="gray.500">{c.applies}</Text></Td>
                          <Td py="8px"><Text fontSize="12px" color="gray.600">{c.desc}</Text></Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </Box>

        {/* Step 2: Info */}
        <Box bg="#EBF4FF" border="1px solid #90CDF4" borderRadius="10px" p="20px">
          <Flex alignItems="center" gap="10px" mb="10px">
            <Box w="24px" h="24px" bg="#3182CE" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Text fontSize="11px" fontWeight="700" color="white">2</Text>
            </Box>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">Prepare Your File</Text>
          </Flex>
          <Flex gap="24px" flexWrap="wrap">
            {[
              { type: "MCQ", color: "#3182CE", bg: "#EBF4FF", rules: ["option_a + option_b required", "correct_answer must be A/B/C/D"] },
              { type: "True / False", color: "#38A169", bg: "#E6F4EA", rules: ["correct_answer: A = True, B = False", "No options columns needed"] },
              { type: "Essay / Short Answer", color: "#DD6B20", bg: "#FFF5EA", rules: ["No options or correct_answer needed", "rubric recommended"] },
            ].map((t) => (
              <Box key={t.type} bg={t.bg} borderRadius="8px" p="12px" flex="1" minW="200px">
                <Text fontSize="12px" fontWeight="700" color={t.color} mb="6px">{t.type}</Text>
                {t.rules.map((r) => (
                  <Text key={r} fontSize="12px" color="gray.600">· {r}</Text>
                ))}
              </Box>
            ))}
          </Flex>
        </Box>

        {/* Step 3: Upload */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Flex alignItems="center" gap="10px" mb="20px">
            <Box w="24px" h="24px" bg="#6b006b" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Text fontSize="11px" fontWeight="700" color="white">3</Text>
            </Box>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">Upload Your File</Text>
          </Flex>

          <FormControl mb="20px" maxW="280px">
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Default Difficulty
              <Text as="span" fontSize="12px" color="gray.400" fontWeight="400" ml="6px">
                — applied to rows where difficulty_level is blank
              </Text>
            </FormLabel>
            <Select
              size="sm"
              borderRadius="6px"
              value={defaultDifficulty}
              onChange={(e) => setDefaultDifficulty(e.target.value)}
              placeholder="Leave blank (null)"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </FormControl>

          <Flex direction="column" gap="12px">
            <Box>
              <Text fontSize="13px" fontWeight="500" color="gray.600" mb="6px">
                Question File <Text as="span" color="red.500">*</Text>
              </Text>
              <FileUploadZone
                accept=".xlsx,.csv"
                file={file}
                onChange={handleFileChange}
                label="Click to select your .xlsx or .csv file"
                accept_label=".xlsx and .csv files only"
              />
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="500" color="gray.600" mb="6px">
                Media ZIP <Text as="span" fontSize="12px" color="gray.400" fontWeight="400">(optional)</Text>
              </Text>
              <FileUploadZone
                accept=".zip"
                file={mediaZip}
                onChange={handleZipChange}
                label="Click to select your media .zip archive"
                accept_label=".zip files only"
                help="Include image files referenced in the media_reference column"
              />
            </Box>
          </Flex>

          <Flex justifyContent="flex-end" mt="24px">
            <Button
              leftIcon={uploading ? <Spinner size="xs" /> : <FiUpload />}
              isDisabled={!file}
              isLoading={uploading}
              loadingText="Processing..."
              onClick={handleSubmit}
            >
              Import Questions
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export const BatchImportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BatchImportPage {...props} />} />
);

export default BatchImportPageRoute;
