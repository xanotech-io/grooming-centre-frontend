import React, { useState, useRef, useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box, Flex, Text, Grid } from "@chakra-ui/layout";
import { Checkbox, Tag, IconButton, Input as ChakraInput } from "@chakra-ui/react";
import { FaSearch, FaSlidersH, FaChevronLeft, FaChevronRight, FaEllipsisV } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_EXAMS = [
    { id: "EX-1045", title: "Data Analytics Exam", markingMode: "Automatic", evaluatedBy: "System", avgScore: 78.4, highestScore: 90, lowestScore: 50, status: "Completed" },
    { id: "EX-1045", title: "Data Analytics Exam", markingMode: "Hybrid", evaluatedBy: "System & Instructor", avgScore: 78.4, highestScore: 90, lowestScore: 50, status: "In-progress" },
    { id: "EX-1045", title: "Data Analytics Exam", markingMode: "Manual", evaluatedBy: "Dr. Tunde Bello", avgScore: 78.4, highestScore: 90, lowestScore: 50, status: "Pending review" },
    { id: "EX-1045", title: "Data Analytics Exam", markingMode: "Hybrid", evaluatedBy: "System & Instructor", avgScore: 78.4, highestScore: 90, lowestScore: 50, status: "Completed" },
    { id: "EX-1045", title: "Data Analytics Exam", markingMode: "Automatic", evaluatedBy: "System", avgScore: 78.4, highestScore: 90, lowestScore: 50, status: "Completed" },
    { id: "EX-1045", title: "Data Analytics Exam", markingMode: "Manual", evaluatedBy: "Dr. Tunde Bello", avgScore: 78.4, highestScore: 90, lowestScore: 50, status: "In-progress" },
];

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
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

// ─── Action Hint (shown inline below row) ─────────────────────────────────────
const ActionHint = ({ status }) => {
    const cfg = STATUS_CONFIG[status];
    if (!cfg?.actionLabel) return null;
    return (
        <Text fontSize="12px" color="#6b006b" mt="2px" textAlign="right" pr="40px" fontWeight="500">
            {cfg.actionLabel}
        </Text>
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
    const TOTAL_ITEMS = 100;

    const filtered = MOCK_EXAMS.filter(
        (e) =>
            e.id.toLowerCase().includes(search.toLowerCase()) ||
            e.title.toLowerCase().includes(search.toLowerCase())
    );

    const allSelected = filtered.length > 0 && filtered.every((_, i) => selectedRows.includes(i));

    const toggleAll = () =>
        allSelected ? setSelectedRows([]) : setSelectedRows(filtered.map((_, i) => i));

    const toggleRow = (i) =>
        setSelectedRows((prev) => prev.includes(i) ? prev.filter((r) => r !== i) : [...prev, i]);

    const COLUMNS = [
        { label: "Exam ID", flex: "1" },
        { label: "Exam Title", flex: "1.5" },
        { label: "Marking Mode", flex: "1.2" },
        { label: "Evaluated By", flex: "1.5" },
        { label: "Average Score", flex: "1" },
        { label: "Highest Score", flex: "1" },
        { label: "Lowest Score", flex: "1" },
        { label: "Status", flex: "1.2" },
        { label: "Action", flex: "0.5", align: "center" },
    ];

    return (
        <AdminMainAreaWrapper>
            {/* Page heading */}
            <Text fontSize="26px" fontWeight="700" color="#1A202C" mb={6}>
                Examination
            </Text>

            {/* Stats row */}
            <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
                <StatCard label="Avg. Evaluation Time" value="10min" sub="Per exam" subColor="#1A202C" />
                <StatCard label="Marking Accuracy" value="70%" sub="+5% vs last month" subColor="#38A169" />
                <StatCard label="No of Automated Evaluations" value="15" />
                <StatCard label="Remark Request" value="80%" sub="-5% vs last month" subColor="#38A169" />
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

                {/* Table */}
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
                        {filtered.map((row, i) => (
                            <Box key={i} borderBottom={i < filtered.length - 1 ? "1px solid #EDF2F7" : "none"} _hover={{ bg: "#FAFAFA" }} transition="background 0.15s">
                                <Flex px={4} py={4} alignItems="center">
                                    <Box width="40px">
                                        <Checkbox isChecked={selectedRows.includes(i)} onChange={() => toggleRow(i)} colorScheme="purple" borderColor="#CBD5E0" />
                                    </Box>
                                    <Box flex="1">    <Text fontSize="14px" color="#1A202C">{row.id}</Text></Box>
                                    <Box
                                        flex="1.5"
                                        cursor="pointer"
                                        onClick={() => push(`/admin/examination/${row.id}`)}
                                        _hover={{ textDecoration: "underline", color: "#6b006b" }}
                                    >
                                        <Text fontSize="14px" color="#1A202C" whiteSpace="pre-wrap">{row.title}</Text>
                                    </Box>
                                    <Box flex="1.2">  <Text fontSize="14px" color="#1A202C">{row.markingMode}</Text></Box>
                                    <Box flex="1.5">  <Text fontSize="14px" color="#1A202C" whiteSpace="pre-wrap">{row.evaluatedBy}</Text></Box>
                                    <Box flex="1">    <Text fontSize="14px" color="#1A202C">{row.avgScore}</Text></Box>
                                    <Box flex="1">    <Text fontSize="14px" color="#1A202C">{row.highestScore}</Text></Box>
                                    <Box flex="1">    <Text fontSize="14px" color="#1A202C">{row.lowestScore}</Text></Box>
                                    <Box flex="1.2">  <StatusBadge status={row.status} /></Box>
                                    <Box flex="0.5" display="flex" justifyContent="center">
                                        <ActionMenu rowIndex={i} status={row.status} openMenu={openMenu} setOpenMenu={setOpenMenu} />
                                    </Box>
                                </Flex>
                                {/* Inline action hint (matches screenshot showing "Start grading" / "Review Submission" inline) */}
                                <ActionHint status={row.status} />
                            </Box>
                        ))}
                    </Box>
                </Box>

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
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            cursor="pointer"
                            _focus={{ outline: "none", borderColor: "#6b006b" }}
                        >
                            {[8, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>{String(n).padStart(2, "0")}</option>
                            ))}
                        </Box>
                    </Flex>
                    <Text fontSize="13px" color="#1A202C" fontWeight="600">
                        Showing {rowsPerPage} out of {TOTAL_ITEMS} items
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
                            isDisabled={currentPage >= Math.ceil(TOTAL_ITEMS / rowsPerPage)}
                            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(TOTAL_ITEMS / rowsPerPage), p + 1))}
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
