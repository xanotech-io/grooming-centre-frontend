import { useEffect, useRef, useState } from "react";
import { useParams, Route, useHistory } from "react-router-dom";
import {
  Button,
  Table,
  Text,
  Spinner,
  Breadcrumb,
  Link,
  DashboardMetricCard,
  ExportMenu,
} from "../../../../components";
import {
  BreadcrumbItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
} from "@chakra-ui/react";
import { EmptyState } from "../../../../layouts";
import { Flex, Box } from "@chakra-ui/layout";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Tag } from "@chakra-ui/tag";
import { useTableRows } from "../../../../hooks";
import {
  adminGetStudentTranscript,
  adminPostCompletionToTranscript,
  adminRequestOfficialTranscript,
  adminVerifyTranscript,
} from "../../../../services";

// ---------------------------------------------------------------------------
// Request Official Transcript Modal (TC09)
// ---------------------------------------------------------------------------

const RequestTranscriptModal = ({ isOpen, onClose, studentId, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    academicYear: "2024-2025",
    purpose: "",
    deliveryMethod: "DIGITAL",
    recipientEmail: "",
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const reset = () =>
    setForm({
      academicYear: "2024-2025",
      purpose: "",
      deliveryMethod: "DIGITAL",
      recipientEmail: "",
    });

  const handleSubmit = async () => {
    if (!form.academicYear.trim()) {
      toast({
        title: "Academic year is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (form.deliveryMethod === "DIGITAL" && !form.recipientEmail.trim()) {
      toast({
        title: "Recipient email is required for digital delivery",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const { message } = await adminRequestOfficialTranscript(studentId, {
        academicYear: form.academicYear.trim(),
        purpose: form.purpose.trim() || undefined,
        deliveryMethod: form.deliveryMethod,
        recipientEmail: form.recipientEmail.trim() || undefined,
      });
      toast({
        status: "success",
        description: message,
        duration: 3000,
        isClosable: true,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "Unable to submit transcript request",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      isCentered
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Request Official Transcript</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <Flex gap="12px">
              <FormControl flex="1" isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Academic Year
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
                  placeholder="e.g. 2024-2025"
                  value={form.academicYear}
                  onChange={(e) => update("academicYear", e.target.value)}
                />
              </FormControl>

              <FormControl flex="1">
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Delivery Method
                </FormLabel>
                <ChakraSelect
                  size="sm"
                  borderRadius="6px"
                  value={form.deliveryMethod}
                  onChange={(e) => update("deliveryMethod", e.target.value)}
                >
                  <option value="DIGITAL">Digital</option>
                  <option value="PHYSICAL">Physical</option>
                </ChakraSelect>
              </FormControl>
            </Flex>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Purpose
              </FormLabel>
              <Input
                size="sm"
                borderRadius="6px"
                placeholder="e.g. Employment Verification"
                value={form.purpose}
                onChange={(e) => update("purpose", e.target.value)}
              />
            </FormControl>

            {form.deliveryMethod === "DIGITAL" && (
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Recipient Email
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="6px"
                  type="email"
                  placeholder="hr@company.com"
                  value={form.recipientEmail}
                  onChange={(e) => update("recipientEmail", e.target.value)}
                />
              </FormControl>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button
            secondary
            onClick={() => {
              reset();
              onClose();
            }}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mapReportToRow = (course) => ({
  id: course?.id || course?.transcriptId || course?.courseCode,
  courseCode: course?.courseCode,
  courseTitle: course?.courseTitle,
  academicYear: course?.academicYear || "2024/2025",
  score: course?.score != null ? `${course.score}%` : "—",
  grade: course?.grade,
  gradePoints:
    typeof course?.gradePoints === "number"
      ? course.gradePoints.toFixed(1)
      : course?.gradePoints,
  credits: course?.credits,
});

const statusColorMap = {
  ISSUED: "green",
  APPROVED: "blue",
  PENDING: "yellow",
  REJECTED: "red",
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const TranscriptReport = () => {
  const { studentId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const safeStudentId = studentId;

  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const requestModal = useDisclosure();

  useEffect(() => {
    if (!studentId || studentId === "undefined") {
      history.replace(
        `/admin/report/studentReport/${safeStudentId}/transcript`,
      );
    }
  }, [history, studentId, safeStudentId]);

  const fetchReports = async (studentIdValue, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const apiResponse = await adminGetStudentTranscript(
        studentIdValue,
        params,
      );
      // Response shape: { success, message, data: { data: [...], pagination: {...} } }
      const responseData = apiResponse?.data ?? apiResponse;
      const record = (responseData?.data ?? [])[0] ?? {};
      const pagination = responseData?.pagination ?? {};

      setMeta({
        overallGPA: record.overallGPA,
        totalCreditsEarned: record.totalCreditsEarned,
        verificationCode: record.verificationCode,
        status: record.status,
        studentName: record.studentName,
      });

      const rows = (record.courses || []).map(mapReportToRow);
      const totalItems = pagination.totalItems ?? rows.length;
      setTotalCount(totalItems);

      return {
        rows,
        showingDocumentsCount: rows.length,
        totalDocumentsCount: totalItems,
        currentPage: pagination.currentPage || 1,
        totalPages: pagination.totalPages || 1,
      };
    } catch (requestError) {
      setError(requestError.message || "Unable to fetch transcript");
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    } finally {
      setLoading(false);
    }
  };

  const handlePostCompletion = async () => {
    try {
      const { message } = await adminPostCompletionToTranscript(safeStudentId, {
        studentId: safeStudentId,
        courseId: "CRS-AGR101",
        examType: "COURSE_EXAMINATION",
        examId: "EXM-AGR101-001",
        score: 85,
        completionStatus: "Completed",
        instructorId: "INST-003",
        remarks: "Course completed successfully",
      });
      toast({ status: "success", description: message, duration: 3000 });
      fetchRowItems();
    } catch (requestError) {
      toast({
        status: "error",
        description: requestError.message || "Unable to post completion",
        duration: 3000,
      });
    }
  };

  const handleVerifyTranscript = async () => {
    try {
      const { message, data } = await adminVerifyTranscript({
        verificationCode: meta?.verificationCode,
      });
      const description = data?.isValid
        ? `${message} — ${data.transcript?.studentName ?? ""} (${data.transcript?.status ?? ""})`
        : message;
      toast({
        status: data?.isValid ? "success" : "error",
        description,
        duration: 4000,
        isClosable: true,
      });
    } catch (requestError) {
      toast({
        status: "error",
        description: requestError.message || "Unable to verify transcript",
        duration: 3000,
      });
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Academic Year",
        queryKey: "academicYear",
        width: "180px",
        body: {
          checks: [
            { label: "2024-2025", queryValue: "2024-2025" },
            { label: "2025-2026", queryValue: "2025-2026" },
          ],
        },
      },
      {
        triggerText: "Status",
        queryKey: "status",
        width: "160px",
        body: {
          checks: [
            { label: "Pending", queryValue: "PENDING" },
            { label: "Approved", queryValue: "APPROVED" },
            { label: "Issued", queryValue: "ISSUED" },
            { label: "Rejected", queryValue: "REJECTED" },
          ],
        },
      },
    ],
    columns: [
      {
        id: "courseCode",
        key: "courseCode",
        text: "Course Code",
        fraction: "130px",
      },
      {
        id: "courseTitle",
        key: "courseTitle",
        text: "Course Title",
        fraction: "220px",
      },
      {
        id: "academicYear",
        key: "academicYear",
        text: "Academic Year",
        fraction: "130px",
      },
      { id: "score", key: "score", text: "Score", fraction: "100px" },
      {
        id: "grade",
        key: "grade",
        text: "Grade",
        fraction: "100px",
        renderContent: (grade) => (
          <Tag
            size="sm"
            borderRadius="full"
            colorScheme={
              grade?.startsWith("A")
                ? "green"
                : grade?.startsWith("B")
                  ? "blue"
                  : grade?.startsWith("C")
                    ? "yellow"
                    : "red"
            }
          >
            {grade}
          </Tag>
        ),
      },
      {
        id: "gradePoints",
        key: "gradePoints",
        text: "Grade Points",
        fraction: "120px",
      },
      { id: "credits", key: "credits", text: "Credits", fraction: "90px" },
    ],
    options: {
      action: [
        {
          text: "Archive Report",
          link: (row) => `/archiveReport/${row.id}/archive`,
        },
      ],
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () =>
    fetchReports(safeStudentId, props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  // Trigger initial load and re-load when the student changes.
  // `fetchRowItems` is intentionally omitted from deps — it is recreated every
  // render and is not memoized, so including it would cause an infinite loop.
  const fetchRowItemsRef = useRef(fetchRowItems);
  fetchRowItemsRef.current = fetchRowItems;
  useEffect(() => {
    fetchRowItemsRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeStudentId]);

  const transcriptRows = rows?.data?.rows ?? [];
  const exportRows = [
    [
      "Course Code",
      "Course Title",
      "Academic Year",
      "Score",
      "Grade",
      "Grade Points",
      "Credits",
    ],
    ...transcriptRows.map((r) => [
      r.courseCode,
      r.courseTitle,
      r.academicYear,
      r.score,
      r.grade,
      r.gradePoints,
      r.credits,
    ]),
  ];

  return (
    <AdminMainAreaWrapper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/studentReport">Learners</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem>
              <Link
                href={`/admin/report/studentReport/${safeStudentId}/details`}
              >
                Report Details
              </Link>
            </BreadcrumbItem>
          }
          item4={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Transcript Report</Link>
            </BreadcrumbItem>
          }
        />
        <Flex gap="8px">
          <Button secondary onClick={handlePostCompletion}>
            Post Completion
          </Button>
          <Button secondary onClick={requestModal.onOpen}>
            Request Official
          </Button>
          <Button onClick={handleVerifyTranscript}>Verify Transcript</Button>
          {(rows?.data?.rows?.length ?? 0) > 0 && (
            <ExportMenu
              rows={exportRows}
              filename="transcript-report"
              title="Transcript Report"
            />
          )}
        </Flex>
      </Box>

      <Box display="flex" justifyContent="space-between" gridGap={4} mb={10}>
        <DashboardMetricCard
          title="Overall GPA"
          value={meta?.overallGPA?.toFixed?.(2) ?? "—"}
          change="weighted average"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Total Credits Earned"
          value={meta?.totalCreditsEarned ?? "—"}
          change="accumulated credits"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Verification Code"
          value={meta?.verificationCode ?? "—"}
          change="transcript ID"
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="Status"
          value={meta?.status ?? "—"}
          change="transcript status"
          changeColor={
            statusColorMap[meta?.status]
              ? `var(--chakra-colors-${statusColorMap[meta?.status]}-600)`
              : "#718096"
          }
        />
      </Box>

      {loading && !rows?.data?.rows?.length ? (
        <Flex
          h="400px"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" />
          <Text mt={4}>Loading transcript...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load transcript"
          description={error}
          cta={<Button onClick={fetchRowItems}>Try Again</Button>}
        />
      ) : (
        <Table
          {...tableProps}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          isLoading={loading}
          placeholder="Search by course or code"
          totalCount={totalCount}
        />
      )}

      <RequestTranscriptModal
        isOpen={requestModal.isOpen}
        onClose={requestModal.onClose}
        studentId={safeStudentId}
        onSuccess={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const TranscriptReportRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <TranscriptReport {...props} />} />
  );
};

export default TranscriptReport;
