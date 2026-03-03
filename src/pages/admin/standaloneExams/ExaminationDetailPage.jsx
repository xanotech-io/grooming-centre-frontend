import React, { useState, useRef, useEffect } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Checkbox, Tag, IconButton, Input as ChakraInput } from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";
import {
    FaSearch,
    FaSlidersH,
    FaChevronLeft,
    FaChevronRight,
    FaEllipsisV,
    FaArrowLeft,
} from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_SUBMISSIONS = [
    { studentId: "John Doe\n#123345", submissionDate: "26/11/2025  11:30am", timeSpent: "45 mins", score: "65%", correct: "66", incorrect: "17", status: "Completed" },
    { studentId: "John Doe\n#123345", submissionDate: "26/11/2025  11:30am", timeSpent: "45 mins", score: "-", correct: "-", incorrect: "-", status: "In-progress" },
    { studentId: "John Doe\n#123345", submissionDate: "26/11/2025  11:30am", timeSpent: "45 mins", score: "61%", correct: "61", incorrect: "15", status: "Completed" },
    { studentId: "John Doe\n#123345", submissionDate: "26/11/2025  11:30am", timeSpent: "45 mins", score: "-", correct: "-", incorrect: "-", status: "Not Started" },
    { studentId: "John Doe\n#123345", submissionDate: "26/11/2025  11:30am", timeSpent: "45 mins", score: "52%", correct: "52", incorrect: "27", status: "Completed" },
    { studentId: "John Doe\n#123345", submissionDate: "26/11/2025  11:30am", timeSpent: "45 mins", score: "-", correct: "-", incorrect: "-", status: "Not Started" },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    "Completed": { bg: "#F0FFF4", color: "#38A169", actionLabel: null },
    "In-progress": { bg: "#FFFAF0", color: "#DD6B20", actionLabel: "Start grading" },
    "Not Started": { bg: "#FFF5F5", color: "#E53E3E", actionLabel: null },
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
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
                    minW="160px"
                    py={1}
                >
                    <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#1A202C" _hover={{ bg: "#F7FAFC" }} onClick={() => setOpenMenu(null)}>
                        View
                    </Box>
                    {cfg?.actionLabel && (
                        <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#6b006b" fontWeight="500" _hover={{ bg: "#FAF5FF" }} onClick={() => setOpenMenu(null)}>
                            {cfg.actionLabel}
                        </Box>
                    )}
                    <Box px={4} py={2} cursor="pointer" fontSize="14px" color="#E53E3E" _hover={{ bg: "#FFF5F5" }} onClick={() => setOpenMenu(null)}>
                        Delete
                    </Box>
                </Box>
            )}
        </Box>
    );
};

// ─── Inline context hint shown below In-progress row ──────────────────────────
const ActionHint = ({ status }) => {
    const cfg = STATUS_CONFIG[status];
    if (!cfg?.actionLabel) return null;
    return (
        <Box px={4} pb={2} display="flex" justifyContent="flex-end" pr="56px">
            <Text fontSize="12px" color="#6b006b" fontWeight="500">
                {cfg.actionLabel}
            </Text>
        </Box>
    );
};

// ─── Columns ───────────────────────────────────────────────────────────────────
const COLUMNS = [
    { label: "Student ID", flex: "1.5" },
    { label: "Submission Date", flex: "2" },
    { label: "Time Spent (mins)", flex: "1.5" },
    { label: "Score (%)", flex: "1" },
    { label: "Correct", flex: "1" },
    { label: "Incorrect", flex: "1" },
    { label: "Status", flex: "1.5" },
    { label: "Action", flex: "0.5", align: "center" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ExaminationDetailPage = () => {
    const { push } = useHistory();
    const [search, setSearch] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const TOTAL_ITEMS = 100;

    const filtered = MOCK_SUBMISSIONS.filter(
        (s) => s.studentId.toLowerCase().includes(search.toLowerCase())
    );

    const allSelected =
        filtered.length > 0 && filtered.every((_, i) => selectedRows.includes(i));

    const toggleAll = () =>
        allSelected ? setSelectedRows([]) : setSelectedRows(filtered.map((_, i) => i));

    const toggleRow = (i) =>
        setSelectedRows((prev) =>
            prev.includes(i) ? prev.filter((r) => r !== i) : [...prev, i]
        );

    return (
        <AdminMainAreaWrapper>
            {/* Heading */}
            <Text fontSize="26px" fontWeight="700" color="#1A202C" mb={6}>
                Data Analysis Exam details
            </Text>

            {/* Table card */}
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" overflow="hidden">

                {/* Search + Filter bar */}
                <Flex alignItems="center" gap={3} px={4} py={4} borderBottom="1px solid #E2E8F0">
                    <Box position="relative" flex="1" maxW="280px">
                        <Box
                            position="absolute"
                            left="10px"
                            top="50%"
                            transform="translateY(-50%)"
                            color="#A0AEC0"
                            pointerEvents="none"
                        >
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
                    <Box minW="860px">
                        {/* Header */}
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
                                    <Text fontSize="13px" fontWeight="600" color="#718096">
                                        {col.label}
                                    </Text>
                                </Box>
                            ))}
                        </Flex>

                        {/* Rows */}
                        {filtered.map((row, i) => (
                            <Box
                                key={i}
                                borderBottom={i < filtered.length - 1 ? "1px solid #EDF2F7" : "none"}
                                _hover={{ bg: "#FAFAFA" }}
                                transition="background 0.15s"
                            >
                                <Flex px={4} py={4} alignItems="center">
                                    <Box width="40px">
                                        <Checkbox
                                            isChecked={selectedRows.includes(i)}
                                            onChange={() => toggleRow(i)}
                                            colorScheme="purple"
                                            borderColor="#CBD5E0"
                                        />
                                    </Box>
                                    {/* Student ID (two-line: name + #id) — clickable to single view */}
                                    <Box
                                        flex="1.5"
                                        cursor="pointer"
                                        onClick={() => push(`/admin/examination/EX-1045/${i}`)}
                                        _hover={{ "& p": { color: "#6b006b" } }}
                                    >
                                        {row.studentId.split("\n").map((line, li) => (
                                            <Text
                                                key={li}
                                                fontSize="14px"
                                                color={li === 0 ? "#1A202C" : "#718096"}
                                                fontWeight={li === 0 ? "500" : "400"}
                                                lineHeight="1.4"
                                                _groupHover={{ color: "#6b006b" }}
                                            >
                                                {line}
                                            </Text>
                                        ))}
                                    </Box>
                                    <Box flex="2">
                                        <Text fontSize="14px" color="#1A202C">{row.submissionDate}</Text>
                                    </Box>
                                    <Box flex="1.5">
                                        <Text fontSize="14px" color="#1A202C">{row.timeSpent}</Text>
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="14px" color="#1A202C">{row.score}</Text>
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="14px" color="#1A202C">{row.correct}</Text>
                                    </Box>
                                    <Box flex="1">
                                        <Text fontSize="14px" color="#1A202C">{row.incorrect}</Text>
                                    </Box>
                                    <Box flex="1.5">
                                        <StatusBadge status={row.status} />
                                    </Box>
                                    <Box flex="0.5" display="flex" justifyContent="center">
                                        <ActionMenu
                                            rowIndex={i}
                                            status={row.status}
                                            openMenu={openMenu}
                                            setOpenMenu={setOpenMenu}
                                        />
                                    </Box>
                                </Flex>
                                {/* Inline hint shown below In-progress rows */}
                                <ActionHint status={row.status} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Pagination */}
                <Flex
                    px={4}
                    py={4}
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={4}
                    borderTop="1px solid #E2E8F0"
                >
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
                        Showing {rowsPerPage} out iof {TOTAL_ITEMS} items
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
                            onClick={() =>
                                setCurrentPage((p) => Math.min(Math.ceil(TOTAL_ITEMS / rowsPerPage), p + 1))
                            }
                            color="#4A5568"
                        />
                    </Flex>
                </Flex>
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const ExaminationDetailPageRoute = ({ ...rest }) => (
    <Route
        {...rest}
        render={(props) => <ExaminationDetailPage {...props} />}
    />
);

export default ExaminationDetailPageRoute;
