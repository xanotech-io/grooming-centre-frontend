import { useState, useRef, useEffect, useCallback } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box, Flex, Text, Grid, Spinner } from "@chakra-ui/react";
import { Checkbox, Tag, IconButton, Input as ChakraInput } from "@chakra-ui/react";
import { FaSearch, FaSlidersH, FaChevronLeft, FaChevronRight, FaEllipsisV } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { getExaminationReportAnalysis, getExaminationReportStatistics } from "../../../services/http/endpoints/examinationReports";

// ─── Status helpers ────────────────────────────────────────────────────────────
// Maps both API values (PASS / FAIL) and display labels
const STATUS_CONFIG = {
    "PASS": { bg: "#F0FFF4", color: "#38A169", actionLabel: null },
    "FAIL": { bg: "#FFF5F5", color: "#E53E3E", actionLabel: null },
    "Completed": { bg: "#F0FFF4", color: "#38A169", actionLabel: null },
    "In-progress": { bg: "#FFFAF0", color: "#DD6B20", actionLabel: "Start grading" },
    "Pending review": { bg: "#FFF5E0", color: "#D69E2E", actionLabel: "Review Submission" },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { bg: "#EDF2F7", color: "#718096" };
    return (
        <Tag
            size="sm"
            borderRadius="full"
            px={3}
            py={1}
            bg={cfg.bg}
            color={cfg.color}
            fontWeight="500"
            fontSize="13px"
            whiteSpace="nowrap"
        >
            {status}
        </Tag>
    );
};

// ─── Action Menu ───────────────────────────────────────────────────────────────
const ActionMenu = ({ rowIndex, status, openMenu, setOpenMenu }) => {
    const ref = useRef(null);
    const isOpen = openMenu === rowIndex;
    const cfg = STATUS_CONFIG[status];

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpenMenu(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [setOpenMenu]);

    return (
        <Box position="relative" ref={ref}>
            <IconButton
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
                color="#718096"
                aria-label="Row actions"
                onClick={() => setOpenMenu(isOpen ? null : rowIndex)}
                _hover={{ bg: "#F7FAFC" }}
            />
            {isOpen && (
                <Box
                    position="absolute"
                    right="0"
                    top="36px"
                    bg="white"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    shadow="md"
                    zIndex={100}
                    minW="150px"
                    py={1}
                >
                    <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#1A202C" _hover={{ bg: "#F7FAFC" }} onClick={() => setOpenMenu(null)}>View</Box>
                    <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#1A202C" _hover={{ bg: "#F7FAFC" }} onClick={() => setOpenMenu(null)}>Edit</Box>
                    {cfg?.actionLabel && (
                        <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#6b006b" fontWeight="500" _hover={{ bg: "#FAF5FF" }} onClick={() => setOpenMenu(null)}>
                            {cfg.actionLabel}
                        </Box>
                    )}
                    <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#E53E3E" _hover={{ bg: "#FFF5F5" }} onClick={() => setOpenMenu(null)}>Delete</Box>
                </Box>
            )}
        </Box>
    );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subColor }) => (
    <Box bg="white" borderRadius="8px" p="20px" shadow="sm">
        <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="16px">{label}</Text>
        <Text fontSize="28px" fontWeight="700" color="#1A202C" lineHeight="1.2">{value}</Text>
        <Box h="20px" mt="12px">
            {sub && <Text fontSize="14px" color={subColor || "#38A169"} fontWeight="500">{sub}</Text>}
        </Box>
    </Box>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ExaminationPage = () => {
    const { push } = useHistory();
    const [search, setSearch] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);

    // ── Analysis API state ──
    const [rows, setRows] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Statistics API state ──
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const response = await getExaminationReportStatistics();
                setStats(response?.data ?? null);
            } catch {
                // silently fail — stat cards will fall back to "—"
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const fetchAnalysis = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getExaminationReportAnalysis({
                page: currentPage,
                limit: rowsPerPage,
                ...(search ? { search } : {}),
            });
            const { rows: apiRows = [], count = 0, totalPages: tp = 1 } = response?.data ?? {};
            setRows(apiRows);
            setTotalItems(count);
            setTotalPages(tp);
        } catch (err) {
            setError("Failed to load examination data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, search]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const allSelected = rows.length > 0 && rows.every((_, i) => selectedRows.includes(i));
    const toggleAll = () =>
        allSelected ? setSelectedRows([]) : setSelectedRows(rows.map((_, i) => i));
    const toggleRow = (i) =>
        setSelectedRows((prev) => prev.includes(i) ? prev.filter((r) => r !== i) : [...prev, i]);

    const COLUMNS = [
        { label: "Student Name", flex: "1.5" },
        { label: "Exam Title", flex: "1.5" },
        { label: "Total Score", flex: "1" },
        { label: "Correct / Wrong", flex: "1.2" },
        { label: "Time Taken", flex: "1" },
        { label: "Rank", flex: "0.8" },
        { label: "Percentile", flex: "0.8" },
        { label: "Status", flex: "1.2" },
        { label: "Action", flex: "0.5", align: "center" },
    ];

    return (
        <AdminMainAreaWrapper>
            {/* Page heading */}
            <Text fontSize="26px" fontWeight="700" color="#1A202C" my={6}>
                Examination
            </Text>

            {/* Stats row */}
            <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
                <StatCard
                    label="Avg. Time Per Exam"
                    value={statsLoading ? "…" : stats?.averageTimeMinutes != null ? `${Math.round(stats.averageTimeMinutes)}min` : "—"}
                    sub="Per exam"
                    subColor="#1A202C"
                />
                <StatCard
                    label="Pass Rate"
                    value={statsLoading ? "…" : stats?.passRate != null ? `${stats.passRate}%` : "—"}
                    sub={stats ? `${stats.passCount} passed / ${stats.failCount} failed` : undefined}
                    subColor="#38A169"
                />
                <StatCard
                    label="Average Score"
                    value={statsLoading ? "…" : stats?.averageScore != null ? stats.averageScore : "—"}
                    sub={stats?.highestScore != null ? `Highest: ${stats.highestScore}` : undefined}
                    subColor="#1A202C"
                />
                <StatCard
                    label="Total Attempts"
                    value={statsLoading ? "…" : stats?.totalAttempts != null ? stats.totalAttempts : "—"}
                    sub={stats?.lowestScore != null ? `Lowest score: ${stats.lowestScore}` : undefined}
                    subColor="#E53E3E"
                />
            </Grid>

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
                            placeholder="Search here..."
                            fontSize="14px"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            border="1px solid #E2E8F0"
                            borderRadius="8px"
                            height="38px"
                            _focus={{ borderColor: "#6b006b", boxShadow: "none" }}
                        />
                    </Box>
                    <Flex
                        alignItems="center"
                        gap="6px"
                        border="1px solid #E2E8F0"
                        borderRadius="8px"
                        px={3}
                        height="38px"
                        cursor="pointer"
                        _hover={{ bg: "#F7FAFC" }}
                    >
                        <FaSlidersH size="14px" color="#4A5568" />
                        <Text fontSize="14px" color="#4A5568">Filter</Text>
                    </Flex>
                </Flex>

                {/* Loading state */}
                {loading && (
                    <Flex justify="center" align="center" py={12}>
                        <Spinner size="lg" color="#6b006b" thickness="3px" />
                    </Flex>
                )}

                {/* Error state */}
                {!loading && error && (
                    <Flex justify="center" align="center" py={12}>
                        <Text color="#E53E3E" fontSize="14px">{error}</Text>
                    </Flex>
                )}

                {/* Empty state */}
                {!loading && !error && rows.length === 0 && (
                    <Flex justify="center" align="center" py={12}>
                        <Text color="#718096" fontSize="14px">No examination results found.</Text>
                    </Flex>
                )}

                {/* Table */}
                {!loading && !error && rows.length > 0 && (
                    <Box overflowX="auto">
                        <Box minW="900px">
                            {/* Header row */}
                            <Flex px={4} py={3} borderBottom="1px solid #E2E8F0" alignItems="center">
                                <Box width="40px">
                                    <Checkbox
                                        isChecked={allSelected}
                                        isIndeterminate={selectedRows.length > 0 && !allSelected}
                                        onChange={toggleAll}
                                        colorScheme="purple"
                                        borderColor="#CBD5E0"
                                    />
                                </Box>
                                {COLUMNS.map((col) => (
                                    <Box key={col.label} flex={col.flex} textAlign={col.align || "left"}>
                                        <Text fontSize="13px" fontWeight="600" color="#718096">{col.label}</Text>
                                    </Box>
                                ))}
                            </Flex>

                            {/* Data rows */}
                            {rows.map((row, i) => (
                                <Box key={row.analysisId ?? i} borderBottom={i < rows.length - 1 ? "1px solid #EDF2F7" : "none"} _hover={{ bg: "#FAFAFA" }} transition="background 0.15s">
                                    <Flex px={4} py={4} alignItems="center">
                                        <Box width="40px">
                                            <Checkbox isChecked={selectedRows.includes(i)} onChange={() => toggleRow(i)} colorScheme="purple" borderColor="#CBD5E0" />
                                        </Box>
                                        {/* Student Name */}
                                        <Box flex="1.5">
                                            <Text fontSize="14px" color="#1A202C">{row.studentName ?? "—"}</Text>
                                        </Box>
                                        {/* Exam Title */}
                                        <Box
                                            flex="1.5"
                                            cursor="pointer"
                                            onClick={() => push(`/admin/examination/${row.examId}`)}
                                            _hover={{ textDecoration: "underline", color: "#6b006b" }}
                                        >
                                            <Text fontSize="14px" color="#1A202C" whiteSpace="pre-wrap">{row.examTitle ?? "—"}</Text>
                                        </Box>
                                        {/* Total Score */}
                                        <Box flex="1">
                                            <Text fontSize="14px" color="#1A202C">{row.totalScore ?? "—"}</Text>
                                        </Box>
                                        {/* Correct / Wrong */}
                                        <Box flex="1.2">
                                            <Text fontSize="14px" color="#1A202C">
                                                <Text as="span" color="#38A169" fontWeight="600">{row.correctAnswers ?? 0}</Text>
                                                {" / "}
                                                <Text as="span" color="#E53E3E" fontWeight="600">{row.wrongAnswers ?? 0}</Text>
                                            </Text>
                                        </Box>
                                        {/* Time Taken */}
                                        <Box flex="1">
                                            <Text fontSize="14px" color="#1A202C">{row.timeTakenMinutes != null ? `${row.timeTakenMinutes}m` : "—"}</Text>
                                        </Box>
                                        {/* Rank */}
                                        <Box flex="0.8">
                                            <Text fontSize="14px" color="#1A202C">{row.rank ?? "—"}</Text>
                                        </Box>
                                        {/* Percentile */}
                                        <Box flex="0.8">
                                            <Text fontSize="14px" color="#1A202C">{row.percentile != null ? `${row.percentile}%` : "—"}</Text>
                                        </Box>
                                        {/* Status */}
                                        <Box flex="1.2">
                                            <StatusBadge status={row.status} />
                                        </Box>
                                        {/* Action */}
                                        <Box flex="0.5" display="flex" justifyContent="center">
                                            <ActionMenu rowIndex={i} status={row.status} openMenu={openMenu} setOpenMenu={setOpenMenu} />
                                        </Box>
                                    </Flex>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Pagination */}
                <Flex px={4} py={4} justifyContent="flex-end" alignItems="center" gap={4} borderTop="1px solid #E2E8F0">
                    <Flex alignItems="center" gap={2}>
                        <Text fontSize="13px" color="#4A5568">Rows per page</Text>
                        <Box
                            as="select"
                            border="1px solid #E2E8F0"
                            borderRadius="6px"
                            px={2}
                            py="4px"
                            fontSize="13px"
                            color="#1A202C"
                            value={rowsPerPage}
                            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            cursor="pointer"
                            _focus={{ outline: "none", borderColor: "#6b006b" }}
                        >
                            {[8, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>{String(n).padStart(2, "0")}</option>
                            ))}
                        </Box>
                    </Flex>
                    <Text fontSize="13px" color="#1A202C" fontWeight="600">
                        Showing {Math.min(rowsPerPage, totalItems)} out of {totalItems} items
                    </Text>
                    <Flex alignItems="center" gap={2}>
                        <IconButton
                            icon={<FaChevronLeft />}
                            size="sm"
                            variant="ghost"
                            aria-label="Previous page"
                            isDisabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            color="#4A5568"
                        />
                        <Box
                            w="30px"
                            h="30px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="#6b006b"
                            borderRadius="6px"
                            color="white"
                            fontSize="13px"
                            fontWeight="600"
                        >
                            {currentPage}
                        </Box>
                        <IconButton
                            icon={<FaChevronRight />}
                            size="sm"
                            variant="ghost"
                            aria-label="Next page"
                            isDisabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            color="#4A5568"
                        />
                    </Flex>
                </Flex>
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const ExaminationPageRoute = ({ ...rest }) => (
    <Route
        {...rest}
        render={(props) => <ExaminationPage {...props} />}
    />
);

export default ExaminationPageRoute;
