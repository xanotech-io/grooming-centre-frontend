import { useEffect, useMemo, useState } from "react";
import { Route, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  Divider,
  SimpleGrid,
  Tooltip,
  BreadcrumbItem,
  Spinner,
} from "@chakra-ui/react";
import { FiInfo } from "react-icons/fi";
import dayjs from "dayjs";
import { adminGetMISReport, adminGetUserListing, adminGetDepartmentListing, adminGetCourseListing } from "../../../services";
import { AdminMainAreaWrapper, EmptyState } from "../../../layouts";
import { Breadcrumb, Link } from "../../../components";

const humanizeKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

// per GC LMS Enhancement Scoping Document — same field name can mean different
// things in different categories (e.g. departmentEnrollmentRate), so scope by category
const VARIABLE_DESCRIPTIONS = {
  academic: {
    courseEnrollmentCount: "Total enrolled courses.",
    courseCompletionRate: "Completion percentage.",
    averageGrade: "Mean performance score.",
    academicStanding: "Excellent/Good/etc.",
    assessmentCompletionRate: "Completed tests/quizzes.",
    activeCourses: "Ongoing courses.",
    certificationEarned: "Certificates issued.",
  },
  administrative: {
    totalRegisteredUsers: "Learners + instructors.",
    approvedUsers: "Active users.",
    instructorCount: "Active instructors.",
    departmentEnrollmentRate: "Enrollment per department.",
    courseAvailabilityStatus: "Published/unpublished.",
    userAccountStatus: "Approved/deactivated.",
    systemUsageRate: "Login frequency.",
  },
  compliance: {
    overallComplianceScore: "Institutional compliance.",
    departmentComplianceRate: "Compliance by department.",
    performanceComparisons: "Compare departments.",
    examinationSubmissionStatus: "Submission tracking.",
    complianceCourseStatus: "Mandatory course completion.",
    completionDate: "Date completed.",
  },
};

const formatValue = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
  if (typeof val === "object") {
    const entries = Object.entries(val);
    return entries.length
      ? entries.map(([k, v]) => `${humanizeKey(k)}: ${v}`).join(" · ")
      : "—";
  }
  return String(val);
};

const FILTER_KEY_LABELS = {
  departmentId: "Department",
  courseId: "Course",
  studentId: "Student",
  instructorId: "Instructor",
  startDate: "Start Date",
  endDate: "End Date",
};

const EXTENSION_BY_FORMAT = { json: "json", pdf: "pdf", excel: "xlsx", csv: "csv" };

// forces an actual file save in the requested format — a plain anchor click lets the
// browser view JSON/CSV/PDF inline instead of downloading it, and won't apply the
// extension for the format the report was generated in
const triggerReportDownload = async (url, filenameBase, format) => {
  const ext = EXTENSION_BY_FORMAT[format] ?? format ?? "json";
  const filename = `${filenameBase}.${ext}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("download failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const Field = ({ label, value }) => (
  <HStack justify="space-between" w="100%" align="flex-start">
    <Text fontSize="13px" color="#667085" minW="150px">{label}</Text>
    <Text fontSize="13px" fontWeight="500" color="#101928" textAlign="right">{value ?? "—"}</Text>
  </HStack>
);

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "generated": return { bg: "#ECFDF3", color: "#027A48" };
    case "archived":  return { bg: "#FEF3F2", color: "#B42318" };
    case "draft":     return { bg: "#FFFAEB", color: "#B54708" };
    default:          return { bg: "#F2F4F7", color: "#344054" };
  }
};

const MISReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    adminGetUserListing({ limit: 500 })
      .then(({ users }) => setUserOptions(users ?? []))
      .catch(() => setUserOptions([]));
    adminGetDepartmentListing({ limit: 200 })
      .then(({ departments }) => setDepartmentOptions(departments ?? []))
      .catch(() => setDepartmentOptions([]));
    adminGetCourseListing({ limit: 200 })
      .then(({ courses }) => setCourseOptions(courses ?? []))
      .catch(() => setCourseOptions([]));
  }, []);

  // resolve "generatedBy" (a user id from the API) to a display name
  const userNameById = useMemo(() => {
    const map = {};
    userOptions.forEach((u) => {
      const name = `${u.firstName} ${u.lastName}`.trim();
      map[String(u.id)] = name;
      if (u.displayId != null) map[String(u.displayId)] = name;
    });
    return map;
  }, [userOptions]);

  const departmentNameById = useMemo(() => {
    const map = {};
    departmentOptions.forEach((d) => { map[String(d.id)] = d.name; });
    return map;
  }, [departmentOptions]);

  const courseNameById = useMemo(() => {
    const map = {};
    courseOptions.forEach((c) => { map[String(c.id)] = c.title; });
    return map;
  }, [courseOptions]);

  // filtersApplied stores raw ids — resolve them to human-readable names
  const resolveFilterValue = (key, value) => {
    if (key === "departmentId") return departmentNameById[String(value)] ?? value;
    if (key === "courseId") return courseNameById[String(value)] ?? value;
    if (key === "studentId" || key === "instructorId") return userNameById[String(value)] ?? value;
    return formatValue(value);
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { report: data } = await adminGetMISReport(id);
      setReport(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load this report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [id]); // eslint-disable-line

  if (loading) {
    return (
      <AdminMainAreaWrapper>
        <Flex h="400px" justify="center" align="center" direction="column">
          <Spinner size="xl" color="#660066" />
          <Text mt={4}>Loading report…</Text>
        </Flex>
      </AdminMainAreaWrapper>
    );
  }

  if (error || !report) {
    return (
      <AdminMainAreaWrapper>
        <Box my={4}>
          <Breadcrumb
            item2={<BreadcrumbItem><Link href="/admin/mis-reports">MIS Reports</Link></BreadcrumbItem>}
            item3={<BreadcrumbItem isCurrentPage><Link href="#">Report Details</Link></BreadcrumbItem>}
          />
        </Box>
        <EmptyState
          heading="Report not found"
          description={error || "This report could not be loaded."}
          cta={<Button onClick={fetchReport}>Try Again</Button>}
        />
      </AdminMainAreaWrapper>
    );
  }

  const filterEntries = Object.entries(report.filtersApplied ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== "");
  const summaryEntries = Object.entries(report.summary ?? {});
  const categoryDescriptions = VARIABLE_DESCRIPTIONS[report.reportCategory?.toLowerCase()] ?? {};

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/mis-reports">MIS Reports</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">{report.reportName}</Link></BreadcrumbItem>}
        />
        {report.downloadUrl && (
          <Button
            onClick={() => triggerReportDownload(report.downloadUrl, (report.reportName || report.reportId || "report").replace(/[^\w-]+/g, "_"), report.reportFormat)}
            variant="outline" borderColor="#660066" color="#660066"
            h="40px" fontSize="14px" fontWeight="500"
          >
            Download
          </Button>
        )}
      </Flex>

      <Box bg="white" borderRadius="xl" border="1px solid #E4E7EC" p={8}>
        <Text fontSize="22px" fontWeight="700" color="#101928">{report.reportName}</Text>
        <Text fontSize="13px" color="#667085" mt={1} mb={5}>{report.reportId}</Text>

        <VStack spacing={6} align="stretch" maxW="720px">
          <HStack spacing={2} flexWrap="wrap">
            <Badge bg="#F4F0FF" color="#6B21A8" borderRadius="full" px={3} py={1} fontSize="11px" textTransform="capitalize">
              {report.reportCategory}
            </Badge>
            <Badge bg="#EFF8FF" color="#175CD3" borderRadius="full" px={3} py={1} fontSize="11px" textTransform="uppercase">
              {report.reportFormat}
            </Badge>
            <Badge bg="#F2F4F7" color="#344054" borderRadius="full" px={3} py={1} fontSize="11px" textTransform="capitalize">
              {report.frequency?.replace(/_/g, " ")}
            </Badge>
            <Badge
              bg={getStatusColor(report.status).bg} color={getStatusColor(report.status).color}
              borderRadius="full" px={3} py={1} fontSize="11px" textTransform="capitalize"
            >
              {report.status}
            </Badge>
          </HStack>

          <VStack spacing={2} align="stretch">
            <Field label="Generated By" value={report.generatedBy ? (userNameById[String(report.generatedBy)] ?? report.generatedBy) : "—"} />
            <Field
              label="Generated Date"
              value={report.generatedDate ? dayjs(report.generatedDate).format("DD MMM YYYY, hh:mm A") : "—"}
            />
            <Field label="Record Count" value={report.recordCount} />
            <Field label="Generation Time" value={report.generationTimeMs != null ? `${report.generationTimeMs} ms` : "—"} />
            <Field label="Scheduled" value={formatValue(report.isScheduled)} />
            <Field label="Access Level" value={formatValue(report.accessLevel)} />
            <Field label="Data Sources" value={formatValue(report.dataSources)} />
          </VStack>

          {filterEntries.length > 0 && (
            <>
              <Divider />
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#667085" mb={2}>Filters Applied</Text>
                <VStack spacing={2} align="stretch">
                  {filterEntries.map(([key, value]) => (
                    <Field key={key} label={FILTER_KEY_LABELS[key] ?? humanizeKey(key)} value={resolveFilterValue(key, value)} />
                  ))}
                </VStack>
              </Box>
            </>
          )}

          {summaryEntries.length > 0 && (
            <>
              <Divider />
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#667085" mb={2}>Report Summary</Text>
                <SimpleGrid columns={2} spacing={3}>
                  {summaryEntries.map(([key, value]) => {
                    const description = categoryDescriptions[key];
                    return (
                      <Box key={key} p={3} borderRadius="md" bg="gray.50">
                        <HStack spacing={1}>
                          <Text fontSize="11px" color="#667085">{humanizeKey(key)}</Text>
                          {description && (
                            <Tooltip label={description} placement="top" hasArrow>
                              <Box as="span" display="inline-flex" color="#98A2B3">
                                <FiInfo size={11} />
                              </Box>
                            </Tooltip>
                          )}
                        </HStack>
                        <Text fontSize="15px" fontWeight="700" color="#660066">{formatValue(value)}</Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            </>
          )}

          <Divider />
          <Field label="Remarks" value={report.remarks} />
        </VStack>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const MISReportDetailPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MISReportDetailPage {...props} />} />
);

export default MISReportDetailPage;
