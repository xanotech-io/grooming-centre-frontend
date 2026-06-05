import React, { useState, useRef, useEffect, useCallback } from "react";
import { Route, useParams, Link as RouterLink } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/layout";
import {
    Checkbox, Tag, IconButton, Input as ChakraInput,
    Spinner, Badge, SimpleGrid, Divider,
    Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
    useDisclosure,
} from "@chakra-ui/react";
import {
    FaSearch,
    FaSlidersH,
    FaChevronLeft,
    FaChevronRight,
    FaEllipsisV,
} from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
    adminGetExamFullReport,
    adminGetStudentExamResultAnalysis,
} from "../../../services";
import dayjs from "dayjs";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const statusColors = {
    Pass: { bg: "#F0FFF4", color: "#38A169" },
    Fail: { bg: "#FFF5F5", color: "#E53E3E" },
};

const StatusBadge = ({ status }) => {
    const cfg = statusColors[status] || { bg: "#EDF2F7", color: "#718096" };
    return (
        <Tag size="sm" borderRadius="full" px={3} py={1} bg={cfg.bg} color={cfg.color} fontWeight="500" fontSize="13px" whiteSpace="nowrap">
            {status ?? "—"}
        </Tag>
    );
};

const gradeColorScheme = (grade = "") => {
    const g = (grade || "").charAt(0).toUpperCase();
    if (g === "A") return "green";
    if (g === "B") return "blue";
    if (g === "C") return "yellow";
    return "red";
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subColor }) => (
    <Box bg="white" borderRadius="8px" p="20px" shadow="sm" border="1px solid #E2E8F0">
        <Text fontSize="13px" fontWeight="500" color="#718096" mb="12px">{label}</Text>
        <Text fontSize="26px" fontWeight="700" color="#1A202C" lineHeight="1.2">{value ?? "—"}</Text>
        {sub && <Text fontSize="13px" color={subColor || "#38A169"} fontWeight="500" mt="8px">{sub}</Text>}
    </Box>
);

// ─── Action Menu ───────────────────────────────────────────────────────────────
const ActionMenu = ({ rowIndex, openMenu, setOpenMenu, onView }) => {
    const ref = useRef(null);
    const isOpen = openMenu === rowIndex;

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpenMenu(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [setOpenMenu]);

    return (
        <Box position="relative" ref={ref}>
            <IconButton icon={<FaEllipsisV />} variant="ghost" size="sm" color="#718096" aria-label="Row actions" onClick={() => setOpenMenu(isOpen ? null : rowIndex)} _hover={{ bg: "#F7FAFC" }} />
            {isOpen && (
                <Box position="absolute" right="0" top="36px" bg="white" border="1px solid #E2E8F0" borderRadius="8px" shadow="md" zIndex={100} minW="160px" py={1}>
                    <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#6b006b" fontWeight="500" _hover={{ bg: "#FAF5FF" }} onClick={() => { setOpenMenu(null); onView(); }}>
                        View Result
                    </Box>
                </Box>
            )}
        </Box>
    );
};

// ─── Student Detail Drawer ─────────────────────────────────────────────────────
// Uses GET /api/v1/exam-result-analysis-v2/{examId}/student/{studentId}
const StudentDetailDrawer = ({ examId, studentId, isOpen, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !studentId || !examId) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await adminGetStudentExamResultAnalysis(examId, studentId);
                setData(res?.data ?? null);
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || "Failed to load student result.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen, examId, studentId]);

    const sectionEntries = data?.sectionScores ? Object.entries(data.sectionScores) : [];

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px" borderColor="gray.200">
                    <Text fontWeight="700" fontSize="16px" color="#1A202C">Student Result</Text>
                </DrawerHeader>
                <DrawerBody pt={5} pb={8}>
                    {loading ? (
                        <Flex h="200px" justify="center" align="center" direction="column">
                            <Spinner size="lg" color="#6b006b" />
                            <Text mt={3} color="#718096" fontSize="14px">Loading…</Text>
                        </Flex>
                    ) : error ? (
                        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={5} textAlign="center">
                            <Text color="red.700" fontSize="14px">{error}</Text>
                        </Box>
                    ) : !data ? null : (
                        <Box>
                            {/* Identity */}
                            <Box mb={4}>
                                <Text fontWeight="700" fontSize="18px" color="#1A202C">{data.studentName ?? "—"}</Text>
                                <Text color="#718096" fontSize="14px">{data.email ?? ""}</Text>
                                <Text color="#A0AEC0" fontSize="13px" mt={1}>
                                    {data.examTitle ?? ""}
                                    {data.examDate ? ` · ${dayjs(data.examDate).format("DD MMM YYYY")}` : ""}
                                </Text>
                            </Box>

                            <Flex gap={2} mb={4} flexWrap="wrap">
                                {data.status && (
                                    <Badge colorScheme={data.status === "Pass" ? "green" : "red"} borderRadius="full" px={3} py={1}>{data.status}</Badge>
                                )}
                                {data.grade && (
                                    <Badge colorScheme={gradeColorScheme(data.grade)} borderRadius="full" px={3} py={1}>Grade {data.grade}</Badge>
                                )}
                                {data.resultStatus && (
                                    <Badge colorScheme={data.resultStatus === "released" ? "green" : "yellow"} borderRadius="full" px={3} py={1} textTransform="capitalize">
                                        {data.resultStatus}
                                    </Badge>
                                )}
                            </Flex>

                            <Divider mb={4} borderColor="#E2E8F0" />

                            {/* Score stats */}
                            <SimpleGrid columns={2} spacing={3} mb={4}>
                                {[
                                    { label: "Total Score", value: data.totalScore != null ? `${data.totalScore}%` : "—" },
                                    { label: "Accuracy", value: data.accuracy != null ? `${data.accuracy}%` : "—" },
                                    { label: "Correct Answers", value: data.correctAnswers ?? "—" },
                                    { label: "Wrong Answers", value: data.wrongAnswers ?? "—" },
                                    { label: "Time Taken", value: data.timeTaken != null ? `${data.timeTaken} min` : "—" },
                                    { label: "Rank", value: data.rank != null ? `#${data.rank}` : "—" },
                                    { label: "Percentile", value: data.percentile != null ? `Top ${data.percentile}%` : "—" },
                                    { label: "Auto Score", value: data.autoScore != null ? `${data.autoScore}%` : "—" },
                                    { label: "Manual Score", value: data.manualScore != null ? `${data.manualScore}%` : "—" },
                                ].map(({ label, value }) => (
                                    <Box key={label} bg="#F7FAFC" borderRadius="md" px={3} py={3}>
                                        <Text color="#718096" fontSize="12px" mb={0.5}>{label}</Text>
                                        <Text fontWeight="700" fontSize="16px" color="#1A202C">{value}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>

                            {/* Section scores */}
                            {sectionEntries.length > 0 && (
                                <>
                                    <Divider mb={4} borderColor="#E2E8F0" />
                                    <Text fontWeight="600" fontSize="14px" color="#1A202C" mb={3}>Section Scores</Text>
                                    <Box bg="white" border="1px solid #E2E8F0" borderRadius="md" overflow="hidden">
                                        {sectionEntries.map(([section, score]) => (
                                            <Flex key={section} justifyContent="space-between" alignItems="center" px={4} py={3} borderBottom="1px solid #EDF2F7" _last={{ borderBottom: "none" }}>
                                                <Text fontSize="14px" color="#4A5568">{section}</Text>
                                                <Text fontWeight="700" fontSize="14px" color="#1A202C">{score}</Text>
                                            </Flex>
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

// ─── Columns ───────────────────────────────────────────────────────────────────
const COLUMNS = [
    { label: "Student", flex: "1.8" },
    { label: "Total Score", flex: "1" },
    { label: "Accuracy", flex: "0.8" },
    { label: "Grade", flex: "0.8" },
    { label: "Correct", flex: "0.8" },
    { label: "Wrong", flex: "0.8" },
    { label: "Time (min)", flex: "0.8" },
    { label: "Rank", flex: "0.7" },
    { label: "Status", flex: "1" },
    { label: "Action", flex: "0.5", align: "center" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
// Uses GET /api/v1/exam-result-analysis-v2/{examId}/report
const ExaminationDetailPage = () => {
    const { id: examId } = useParams();
    const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();

    const [search, setSearch] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const fetchReport = useCallback(async () => {
        if (!examId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await adminGetExamFullReport(examId);
            setReport(res?.data ?? null);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Failed to load exam report.");
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const exam = report?.exam ?? null;
    const kpis = report?.kpis ?? null;
    const students = report?.students ?? [];

    const filtered = students.filter((s) => {
        const name = s.studentName ?? "";
        const email = s.email ?? "";
        return (
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase())
        );
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const pageStart = (currentPage - 1) * rowsPerPage;
    const pageRows = filtered.slice(pageStart, pageStart + rowsPerPage);

    const allSelected = pageRows.length > 0 && pageRows.every((_, i) => selectedRows.includes(pageStart + i));
    const toggleAll = () =>
        allSelected
            ? setSelectedRows((p) => p.filter((r) => r < pageStart || r >= pageStart + rowsPerPage))
            : setSelectedRows((p) => [...new Set([...p, ...pageRows.map((_, i) => pageStart + i)])]);
    const toggleRow = (i) =>
        setSelectedRows((p) => p.includes(i) ? p.filter((r) => r !== i) : [...p, i]);

    const handleViewStudent = (studentId) => {
        setSelectedStudentId(studentId);
        openDrawer();
    };

    return (
        <AdminMainAreaWrapper>
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="flex-start" mb={6} mt={2} flexWrap="wrap" gap={3}>
                <Box>
                    <Text fontSize="26px" fontWeight="700" color="#1A202C">
                        {exam?.title ?? "Exam Results"}
                    </Text>
                    {exam?.date && (
                        <Text fontSize="14px" color="#718096" mt={1}>
                            {dayjs(exam.date).format("DD MMM YYYY, h:mm A")}
                            {exam.markingMode && ` · ${exam.markingMode}`}
                            {exam.passThreshold != null && ` · Pass: ${exam.passThreshold}%`}
                        </Text>
                    )}
                </Box>
                <RouterLink to={`/admin/exam-result-analysis/${examId}`}>
                    <Box as="span" display="inline-block" px={4} py={2} bg="#6b006b" color="white" borderRadius="8px" fontSize="14px" fontWeight="500" cursor="pointer" _hover={{ bg: "#550055" }}>
                        View Full Analysis
                    </Box>
                </RouterLink>
            </Flex>

            {/* KPI stat cards — from report.kpis */}
            {(loading || kpis) && (
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                    <StatCard
                        label="Total Students"
                        value={loading ? "…" : kpis?.totalStudents ?? students.length}
                        sub="Attempted this exam"
                        subColor="#3182CE"
                    />
                    <StatCard
                        label="Pass Rate"
                        value={loading ? "…" : kpis?.passRate != null ? `${kpis.passRate}%` : "—"}
                        sub={kpis?.medianScore != null ? `Median: ${kpis.medianScore}%` : undefined}
                        subColor="#38A169"
                    />
                    <StatCard
                        label="Average Score"
                        value={loading ? "…" : kpis?.averageScore != null ? `${kpis.averageScore}%` : "—"}
                        sub={kpis?.meanScore != null ? `Mean: ${kpis.meanScore}%` : undefined}
                        subColor="#6b006b"
                    />
                    <StatCard
                        label="Avg Completion Time"
                        value={loading ? "…" : kpis?.averageCompletionTime != null ? `${kpis.averageCompletionTime} min` : "—"}
                        sub={kpis?.questionAccuracy != null ? `Q. accuracy: ${kpis.questionAccuracy}%` : undefined}
                        subColor="#DD6B20"
                    />
                </SimpleGrid>
            )}

            {/* Table card */}
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">
                {/* Search + Filter */}
                <Flex alignItems="center" gap={3} px={4} py={4} borderBottom="1px solid #E2E8F0">
                    <Box position="relative" flex="1" maxW="280px">
                        <Box position="absolute" left="10px" top="50%" transform="translateY(-50%)" color="#A0AEC0" pointerEvents="none">
                            <FaSearch size="13px" />
                        </Box>
                        <ChakraInput
                            pl="32px"
                            placeholder="Search student..."
                            fontSize="14px"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            border="1px solid #E2E8F0"
                            borderRadius="8px"
                            height="38px"
                            _focus={{ borderColor: "#6b006b", boxShadow: "none" }}
                        />
                    </Box>
                    <Flex alignItems="center" gap="6px" border="1px solid #E2E8F0" borderRadius="8px" px={3} height="38px" cursor="pointer" _hover={{ bg: "#F7FAFC" }}>
                        <FaSlidersH size="14px" color="#4A5568" />
                        <Text fontSize="14px" color="#4A5568">Filter</Text>
                    </Flex>
                </Flex>

                {loading && (
                    <Flex justify="center" align="center" py={12}>
                        <Spinner size="lg" color="#6b006b" thickness="3px" />
                    </Flex>
                )}

                {!loading && error && (
                    <Flex justify="center" align="center" py={12} direction="column" gap={3}>
                        <Text color="#E53E3E" fontSize="14px">{error}</Text>
                        <Box as="button" px={4} py={2} border="1px solid #E2E8F0" borderRadius="8px" fontSize="13px" color="#4A5568" _hover={{ bg: "#F7FAFC" }} onClick={fetchReport}>
                            Try Again
                        </Box>
                    </Flex>
                )}

                {!loading && !error && pageRows.length === 0 && (
                    <Flex justify="center" align="center" py={12}>
                        <Text color="#718096" fontSize="14px">No student results found for this exam.</Text>
                    </Flex>
                )}

                {!loading && !error && pageRows.length > 0 && (
                    <Box overflowX="auto">
                        <Box minW="1000px">
                            {/* Header */}
                            <Flex px={4} py={3} borderBottom="1px solid #E2E8F0" alignItems="center">
                                <Box width="40px">
                                    <Checkbox isChecked={allSelected} isIndeterminate={selectedRows.length > 0 && !allSelected} onChange={toggleAll} colorScheme="purple" borderColor="#CBD5E0" />
                                </Box>
                                {COLUMNS.map((col) => (
                                    <Box key={col.label} flex={col.flex} textAlign={col.align || "left"}>
                                        <Text fontSize="13px" fontWeight="600" color="#718096">{col.label}</Text>
                                    </Box>
                                ))}
                            </Flex>

                            {/* Rows */}
                            {pageRows.map((row, i) => {
                                const absIdx = pageStart + i;
                                return (
                                    <Box key={row.attemptId ?? absIdx} borderBottom={i < pageRows.length - 1 ? "1px solid #EDF2F7" : "none"} _hover={{ bg: "#FAFAFA" }} transition="background 0.15s">
                                        <Flex px={4} py={4} alignItems="center">
                                            <Box width="40px">
                                                <Checkbox isChecked={selectedRows.includes(absIdx)} onChange={() => toggleRow(absIdx)} colorScheme="purple" borderColor="#CBD5E0" />
                                            </Box>
                                            {/* Student */}
                                            <Box flex="1.8" cursor="pointer" onClick={() => handleViewStudent(row.studentId)} _hover={{ "& p": { color: "#6b006b" } }}>
                                                <Text fontSize="14px" color="#1A202C" fontWeight="500" lineHeight="1.4">{row.studentName ?? "—"}</Text>
                                                <Text fontSize="12px" color="#718096" lineHeight="1.4">{row.email ?? ""}</Text>
                                            </Box>
                                            {/* Total Score */}
                                            <Box flex="1">
                                                <Text fontSize="14px" color="#1A202C">{row.totalScore != null ? `${row.totalScore}%` : "—"}</Text>
                                            </Box>
                                            {/* Accuracy */}
                                            <Box flex="0.8">
                                                <Text fontSize="14px" color="#1A202C">{row.accuracy != null ? `${row.accuracy}%` : "—"}</Text>
                                            </Box>
                                            {/* Grade */}
                                            <Box flex="0.8">
                                                {row.grade ? (
                                                    <Badge colorScheme={gradeColorScheme(row.grade)} borderRadius="full" px={2} fontSize="xs">{row.grade}</Badge>
                                                ) : (
                                                    <Text fontSize="14px" color="#1A202C">—</Text>
                                                )}
                                            </Box>
                                            {/* Correct */}
                                            <Box flex="0.8">
                                                <Text fontSize="14px" color="#38A169" fontWeight="600">{row.correctAnswers ?? "—"}</Text>
                                            </Box>
                                            {/* Wrong */}
                                            <Box flex="0.8">
                                                <Text fontSize="14px" color="#E53E3E" fontWeight="600">{row.wrongAnswers ?? "—"}</Text>
                                            </Box>
                                            {/* Time */}
                                            <Box flex="0.8">
                                                <Text fontSize="14px" color="#1A202C">{row.timeTaken != null ? `${row.timeTaken}` : "—"}</Text>
                                            </Box>
                                            {/* Rank */}
                                            <Box flex="0.7">
                                                <Text fontSize="14px" color="#1A202C">{row.rank != null ? `#${row.rank}` : "—"}</Text>
                                            </Box>
                                            {/* Status */}
                                            <Box flex="1">
                                                <StatusBadge status={row.status} />
                                            </Box>
                                            {/* Action */}
                                            <Box flex="0.5" display="flex" justifyContent="center">
                                                <ActionMenu rowIndex={absIdx} openMenu={openMenu} setOpenMenu={setOpenMenu} onView={() => handleViewStudent(row.studentId)} />
                                            </Box>
                                        </Flex>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* Pagination */}
                <Flex px={4} py={4} justifyContent="flex-end" alignItems="center" gap={4} borderTop="1px solid #E2E8F0">
                    <Flex alignItems="center" gap={2}>
                        <Text fontSize="13px" color="#4A5568">Rows per page</Text>
                        <Box as="select" border="1px solid #E2E8F0" borderRadius="6px" px={2} py="4px" fontSize="13px" color="#1A202C" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} cursor="pointer" _focus={{ outline: "none", borderColor: "#6b006b" }}>
                            {[8, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>{String(n).padStart(2, "0")}</option>
                            ))}
                        </Box>
                    </Flex>
                    <Text fontSize="13px" color="#1A202C" fontWeight="600">
                        Showing {pageRows.length} out of {totalItems} items
                    </Text>
                    <Flex alignItems="center" gap={2}>
                        <IconButton icon={<FaChevronLeft />} size="sm" variant="ghost" aria-label="Previous page" isDisabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} color="#4A5568" />
                        <Box w="30px" h="30px" display="flex" alignItems="center" justifyContent="center" bg="#6b006b" borderRadius="6px" color="white" fontSize="13px" fontWeight="600">
                            {currentPage}
                        </Box>
                        <IconButton icon={<FaChevronRight />} size="sm" variant="ghost" aria-label="Next page" isDisabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} color="#4A5568" />
                    </Flex>
                </Flex>
            </Box>

            {/* Student detail drawer */}
            <StudentDetailDrawer examId={examId} studentId={selectedStudentId} isOpen={isDrawerOpen} onClose={closeDrawer} />
        </AdminMainAreaWrapper>
    );
};

export const ExaminationDetailPageRoute = ({ ...rest }) => (
    <Route {...rest} render={(props) => <ExaminationDetailPage {...props} />} />
);

export default ExaminationDetailPageRoute;
