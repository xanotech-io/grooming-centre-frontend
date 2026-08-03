import React, { useEffect, useRef, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  BreadcrumbItem,
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
import { AdminMainAreaWrapper } from "../../../layouts";
import { useQueryParams } from "../../../hooks";
import {
  downloadExamQuestionBatchTemplate,
  uploadExamQuestionBatch,
  updateExamQuestionBatchRow,
  deleteExamQuestionBatchRow,
  getStandaloneExaminationDetails,
  requestExaminationDetails,
  requestAssessmentDetails,
  adminGetMarkingTemplateById,
  getExaminationById as getExamPaperConfig,
} from "../../../services";
import {
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  buildQuestionListingLink,
  buildReviewLink,
  contextLabel,
  getUploadContext,
  normalizeStagedRow,
  normalizeStagedRows,
} from "./questionRowUtils";

const COLUMNS = [
  { col: "question_text", required: "Required", applies: "All", desc: "Full question statement — must not be empty" },
  { col: "question_type", required: "Optional", applies: "All", desc: 'MCQ / Essay / TrueFalse / FillBlank / Matching / ShortAnswer — defaults to "MCQ"' },
  { col: "difficulty_level", required: "Optional", applies: "All", desc: 'Easy / Medium / Hard — falls back to Default Difficulty below, then blank' },
  { col: "marks", required: "Optional", applies: "All", desc: "Positive integer — defaults to 1" },
  { col: "tags", required: "Optional", applies: "All", desc: 'Comma-separated — e.g. "algorithms,searching"' },
  { col: "rubric", required: "Optional", applies: "Essay / Short Answer", desc: "Grading rubric text" },
  { col: "option_a", required: "MCQ Required", applies: "MCQ", desc: "Text for option A" },
  { col: "option_b", required: "MCQ Required", applies: "MCQ", desc: "Text for option B" },
  { col: "option_c", required: "Optional", applies: "MCQ", desc: "Optional option C" },
  { col: "option_d", required: "Optional", applies: "MCQ", desc: "Optional option D" },
  { col: "correct_answer", required: "MCQ/T-F Req.", applies: "MCQ, True/False", desc: "MCQ: A/B/C/D · True/False: A = True, B = False" },
  { col: "media_reference", required: "Optional", applies: "All", desc: 'Filename of image inside companion ZIP — e.g. "diagram.png"' },
];

const REQ_STYLE = {
  Required: { bg: "#FED7D7", color: "#C53030" },
  "MCQ Required": { bg: "#FEE2E2", color: "#9B2C2C" },
  "MCQ/T-F Req.": { bg: "#FEE2E2", color: "#9B2C2C" },
  Optional: { bg: "#F7FAFC", color: "#718096" },
};

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
        onChange={(e) => {
          onChange(e.target.files[0] ?? null);
          e.target.value = "";
        }}
      />
      {file ? (
        <Flex justifyContent="center" alignItems="center" gap="8px">
          <FiUpload color="#38A169" />
          <Text fontSize="13px" fontWeight="600" color="#276749">
            {file.name}
          </Text>
          <Text fontSize="12px" color="gray.400">
            ({(file.size / 1024).toFixed(1)} KB)
          </Text>
          <IconButton
            aria-label="Remove file"
            icon={<FiX size={12} />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          />
        </Flex>
      ) : (
        <>
          <FiUpload color="#A0AEC0" size={20} style={{ margin: "0 auto 8px" }} />
          <Text fontSize="13px" fontWeight="500" color="gray.500">
            {label}
          </Text>
          <Text fontSize="11px" color="gray.400" mt="4px">
            {accept_label}
          </Text>
          {help && (
            <Text fontSize="11px" color="gray.400" mt="2px">
              {help}
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

const BatchUploadPage = () => {
  const history = useHistory();
  const toast = useToast();
  const context = getUploadContext(useQueryParams());

  const [defaultDifficulty, setDefaultDifficulty] = useState("");
  const [file, setFile] = useState(null);
  const [mediaZip, setMediaZip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showColumnGuide, setShowColumnGuide] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // The exam's own question-type/Quantity/marks rules — same ones the
  // manual "Add Question" form enforces (QuestionsStandalone.jsx) — so a
  // bulk-uploaded file can't smuggle in a type the exam wasn't configured
  // for, or questions carrying the wrong marks. null while loading/not
  // applicable. Two mutually exclusive shapes, matching whichever half of
  // the exam this upload targets:
  //   - {mode: "section", allowedTypes, sectionCap, markPerQuestion, usedCounts}
  //     — a Section tab was active (a "with sections" exam, or hybrid's
  //     sectioned half): governed by that section's own question_types/
  //     question_count from the Template/Marking Scheme step.
  //   - {mode: "quantity", supportedTypes, quantity, markDistribution, usedCounts}
  //     — no section active ("without sections", or hybrid's "Standalone
  //     Questions" pool): governed by the marking template's per-type
  //     Quantity/markDistribution.
  const [typeRestriction, setTypeRestriction] = useState(null);

  useEffect(() => {
    if (!context.examinationId && !context.assessmentId) return;
    let cancelled = false;

    // Fetches the target's own record (whichever of the three flows this
    // is) plus the section-list fetcher for it — Standalone/Course Exam
    // read sections from the separate paper-config endpoint, a plain
    // Assessment carries them directly on its own record.
    const loadRecord = async () => {
      if (context.standalone) {
        const { examination } = await getStandaloneExaminationDetails(context.examinationId, true);
        return {
          record: examination,
          getSections: () =>
            getExamPaperConfig(context.examinationId, "standalone_examination")
              .then((res) => res?.data?.configuredSections || [])
              .catch(() => []),
        };
      }
      if (context.examinationId) {
        const { examination } = await requestExaminationDetails(context.examinationId, true);
        return {
          record: examination,
          getSections: () =>
            getExamPaperConfig(context.examinationId, "examination")
              .then((res) => res?.data?.configuredSections || [])
              .catch(() => []),
        };
      }
      const { assessment } = await requestAssessmentDetails(context.assessmentId, true);
      return {
        // Assessment's own field for this is `markingTemplateId`, not
        // `templateId` — normalized here so the rest of this effect can
        // treat all three flows identically.
        record: { ...assessment, templateId: assessment.markingTemplateId },
        getSections: () => Promise.resolve(assessment.sections || []),
      };
    };

    loadRecord()
      .then(async ({ record, getSections }) => {
        if (cancelled || !record) return;

        if (context.section && (record.examType === "sectioned" || record.examType === "hybrid")) {
          const configured = await getSections();
          const section = configured.find((s) => s.section_name === context.section);
          if (!section || cancelled) return;
          // Course Exam/Assessment's own sections use `questions_count`
          // (see examSectionBuilder/examTypeConfig.js); Standalone's use
          // `question_count` — accept either.
          const sectionCount = Number(section.questions_count ?? section.question_count) || 0;
          const usedInSection = (record.questions || []).filter((q) => q.section === context.section).length;
          setTypeRestriction({
            mode: "section",
            allowedTypes: Array.isArray(section.question_types) && section.question_types.length ? section.question_types : null,
            sectionCap: sectionCount || null,
            // Sections have no per-question mark of their own, only a total
            // weightage split across their Question Count — inferred, not
            // independently backend-confirmed like the unsectioned per-type
            // mark below was.
            markPerQuestion: sectionCount ? (Number(section.total_marks) || 0) / sectionCount : null,
            usedInSection,
          });
          return;
        }

        if (!context.section && (record.examType === "unsectioned" || record.examType === "hybrid")) {
          const quantity = record.questionQuantity || {};
          const supportedTypes = Object.keys(quantity);
          if (supportedTypes.length === 0) return;

          let markDistribution = {};
          if (record.templateId) {
            const { template } = await adminGetMarkingTemplateById(record.templateId).catch(() => ({}));
            markDistribution = template?.markDistribution || {};
          }
          if (cancelled) return;

          const usedCounts = (record.questions || []).reduce((acc, q) => {
            if (q.section) return acc;
            if (q.questionType) acc[q.questionType] = (acc[q.questionType] || 0) + 1;
            return acc;
          }, {});
          setTypeRestriction({ mode: "quantity", supportedTypes, quantity, markDistribution, usedCounts });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.standalone, context.examinationId, context.assessmentId, context.section]);

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const blob = await downloadExamQuestionBatchTemplate();
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
    if (!selected) {
      setFile(null);
      return;
    }
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
    if (!selected) {
      setMediaZip(null);
      return;
    }
    const ext = selected.name.split(".").pop().toLowerCase();
    if (ext !== "zip") {
      toast({ title: "Media archive must be a .zip file", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setMediaZip(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadExamQuestionBatch({
        file,
        courseId: context.courseId,
        examinationId: context.examinationId,
        assessmentId: context.assessmentId,
        mediaZip,
        defaultDifficulty: defaultDifficulty || undefined,
        section: context.section,
      });
      const raw = res?.data ?? res;
      const uploadId = raw.uploadId ?? raw.id;
      let rows = normalizeStagedRows(raw.rows);

      // Belt-and-suspenders alongside the `section` sent with the upload
      // above (in case the parser doesn't apply it itself) — explicitly tag
      // every staged row with the section this upload was launched for,
      // best-effort so a row-level hiccup doesn't block the whole import.
      if (context.section && rows.length > 0) {
        rows = await Promise.all(
          rows.map((row) =>
            row.section === context.section
              ? row
              : updateExamQuestionBatchRow(uploadId, row.rowId, { section: context.section })
                  .then((r) => normalizeStagedRow({ ...(r?.data ?? r), rowId: row.rowId }))
                  .catch(() => row),
          ),
        );
      }

      // Same rule the manual "Add Question" form enforces: a type this
      // upload's target (a section, or the marking template's Quantity
      // table) wasn't configured for, or one that's already used up its
      // cap, gets skipped (removed from the staged batch entirely) rather
      // than silently imported — and every kept row's marks are corrected
      // to match, since the file's own `marks` column (defaults to 1) is
      // what caused the exam's declared Total Marks to stop matching what
      // was actually created.
      if (typeRestriction && rows.length > 0) {
        const kept = [];
        let skipped = 0;

        const applyMark = async (row, correctMark) => {
          if (correctMark == null || Number(row.marks) === Number(correctMark)) return row;
          return updateExamQuestionBatchRow(uploadId, row.rowId, { marks: Number(correctMark) })
            .then((r) => normalizeStagedRow({ ...(r?.data ?? r), rowId: row.rowId }))
            .catch(() => row);
        };

        if (typeRestriction.mode === "section") {
          let usedInSection = typeRestriction.usedInSection;
          for (const row of rows) {
            const notSupported = typeRestriction.allowedTypes && !typeRestriction.allowedTypes.includes(row.questionType);
            const atCapacity = typeRestriction.sectionCap != null && usedInSection >= typeRestriction.sectionCap;
            if (notSupported || atCapacity) {
              skipped += 1;
              await deleteExamQuestionBatchRow(uploadId, row.rowId).catch(() => {});
              continue;
            }
            usedInSection += 1;
            kept.push(await applyMark(row, typeRestriction.markPerQuestion));
          }
        } else {
          const runningCounts = { ...typeRestriction.usedCounts };
          for (const row of rows) {
            const notSupported = !typeRestriction.supportedTypes.includes(row.questionType);
            const quota = Number(typeRestriction.quantity[row.questionType]) || 0;
            const atCapacity = !notSupported && (runningCounts[row.questionType] || 0) >= quota;
            if (notSupported || atCapacity) {
              skipped += 1;
              await deleteExamQuestionBatchRow(uploadId, row.rowId).catch(() => {});
              continue;
            }
            runningCounts[row.questionType] = (runningCounts[row.questionType] || 0) + 1;
            kept.push(await applyMark(row, typeRestriction.markDistribution[row.questionType]));
          }
        }

        rows = kept;
        if (skipped) {
          toast({
            title: `${skipped} question${skipped === 1 ? "" : "s"} skipped — not an allowed question type for this ${
              typeRestriction.mode === "section" ? "section" : "exam"
            }, or already at its configured limit`,
            status: "warning",
            duration: 6000,
            isClosable: true,
          });
        }
      }

      toast({ title: "Upload processed — review the staged questions below", status: "success", duration: 3000, isClosable: true });
      history.push(buildReviewLink(uploadId, context), { rows });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "";
      if (status === 400 && msg.toLowerCase().includes("file type")) {
        toast({ title: "Please upload an Excel (.xlsx) or CSV (.csv) file", status: "warning", duration: 4000, isClosable: true });
      } else if (status === 400 && msg.toLowerCase().includes("no valid")) {
        toast({ title: "No valid question rows found. Check that your file has a question_text column.", status: "warning", duration: 5000, isClosable: true });
      } else if (status === 404) {
        toast({ title: "Target not found. Please check the assessment/examination.", status: "error", duration: 5000, isClosable: true });
      } else {
        toast({ title: msg || "Upload failed. Please try again.", status: "error", duration: 4000, isClosable: true });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box marginX="22px" marginY="20px" maxW="860px">
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href={buildQuestionListingLink(context)}>{contextLabel(context)} Questions</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Batch Upload</Link>
            </BreadcrumbItem>
          }
        />

        <Flex alignItems="center" justifyContent="space-between" mt="20px" mb="20px" flexWrap="wrap" gap="12px">
          <Heading fontSize="20px" fontWeight="600">Batch Upload {contextLabel(context)} Questions</Heading>
          <Button secondary size="sm" onClick={() => history.goBack()}>← Back</Button>
        </Flex>

        {context.section && (
          <Box bg="#F0E6FF" border="1px solid #D6BCFA" borderRadius="8px" p="12px" mb="20px">
            <Text fontSize="13px" color="#553C9A">
              Every question in this file will be added to <Text as="span" fontWeight="700">Section: {context.section}</Text>.
            </Text>
          </Box>
        )}

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
              Download Template
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
                      const rs = REQ_STYLE[c.required] ?? REQ_STYLE.Optional;
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

        {/* Step 2: Upload */}
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
          <Flex alignItems="center" gap="10px" mb="20px">
            <Box w="24px" h="24px" bg="#6b006b" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Text fontSize="11px" fontWeight="700" color="white">2</Text>
            </Box>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">Upload Your File</Text>
          </Flex>

          <FormControl mb="20px" maxW="280px">
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Default Difficulty
              <Text as="span" fontSize="12px" color="gray.400" fontWeight="400" ml="6px">
                — applied to rows where difficulty is blank
              </Text>
            </FormLabel>
            <Select
              size="sm"
              borderRadius="6px"
              value={defaultDifficulty}
              onChange={(e) => setDefaultDifficulty(e.target.value)}
              placeholder="Leave blank"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
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

          <Box bg="#EBF4FF" border="1px solid #90CDF4" borderRadius="8px" p="12px" mt="20px">
            <Text fontSize="12px" color="#2C5282">
              After upload, the parsed questions are staged for review — nothing is added to the question bank until you confirm the import on the next screen.
            </Text>
          </Box>

          <Flex justifyContent="flex-end" mt="24px">
            <Button
              leftIcon={uploading ? <Spinner size="xs" /> : <FiUpload />}
              isDisabled={!file}
              isLoading={uploading}
              loadingText="Processing..."
              onClick={handleSubmit}
            >
              Upload &amp; Review
            </Button>
          </Flex>
        </Box>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const BatchUploadPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BatchUploadPage {...props} />} />
);

export default BatchUploadPageRoute;
