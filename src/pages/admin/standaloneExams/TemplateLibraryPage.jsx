import React, { useState, useRef, useEffect } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Checkbox, Tag, IconButton, Input as ChakraInput } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaSlidersH, FaChevronLeft, FaChevronRight, FaEllipsisV } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Button, Breadcrumb, Link } from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TEMPLATES = [
    { id: "TPL-001", name: "Midterm MCQs", questionsCount: 100, createdBy: "John Doe", status: "Active", lastUpdated: "26/11/2025" },
    { id: "TPL-001", name: "Midterm MCQs", questionsCount: 80, createdBy: "John Doe", status: "Active", lastUpdated: "26/11/2025" },
    { id: "TPL-001", name: "Midterm MCQs", questionsCount: 100, createdBy: "John Doe", status: "Active", lastUpdated: "26/11/2025" },
    { id: "TPL-001", name: "Midterm MCQs", questionsCount: 100, createdBy: "John Doe", status: "Inactive", lastUpdated: "26/11/2025" },
    { id: "TPL-001", name: "Midterm MCQs", questionsCount: 90, createdBy: "John Doe", status: "Active", lastUpdated: "26/11/2025" },
    { id: "TPL-001", name: "Midterm MCQs", questionsCount: 50, createdBy: "John Doe", status: "Inactive", lastUpdated: "26/11/2025" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const isActive = status === "Active";
    return (
        <Tag
            size="sm"
            borderRadius="full"
            px={3}
            py={1}
            bg={isActive ? "#F0FFF4" : "#FFF5F5"}
            color={isActive ? "#38A169" : "#E53E3E"}
            fontWeight="500"
            fontSize="13px"
        >
            {status}
        </Tag>
    );
};

// ─── Action Menu ──────────────────────────────────────────────────────────────
const ActionMenu = ({ rowIndex, openMenu, setOpenMenu }) => {
    const ref = useRef(null);
    const isOpen = openMenu === rowIndex;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setOpenMenu]);

    return (
        <Box position="relative" ref={ref}>
            <IconButton
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
                color="#718096"
                aria-label="Actions"
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
                    minW="120px"
                    py={1}
                >
                    <Box
                        px={4}
                        py={2}
                        cursor="pointer"
                        fontSize="14px"
                        color="#1A202C"
                        _hover={{ bg: "#F7FAFC" }}
                        onClick={() => setOpenMenu(null)}
                    >
                        View
                    </Box>
                    <Box
                        px={4}
                        py={2}
                        cursor="pointer"
                        fontSize="14px"
                        color="#1A202C"
                        _hover={{ bg: "#F7FAFC" }}
                        onClick={() => setOpenMenu(null)}
                    >
                        Edit
                    </Box>
                    <Box
                        px={4}
                        py={2}
                        cursor="pointer"
                        fontSize="14px"
                        color="#E53E3E"
                        _hover={{ bg: "#FFF5F5" }}
                        onClick={() => setOpenMenu(null)}
                    >
                        Delete
                    </Box>
                </Box>
            )}
        </Box>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subColor }) => (
    <Box>
        <Text fontSize="14px" color="#4A5568" fontWeight="400" mb={1}>
            {label}
        </Text>
        <Text fontSize="28px" fontWeight="700" color="#1A202C" lineHeight="1.2">
            {value}
        </Text>
        {sub && (
            <Text fontSize="13px" color={subColor || "#38A169"} mt={1} fontWeight="500">
                {sub}
            </Text>
        )}
    </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const TemplateLibraryPage = () => {
    const { push } = useHistory();
    const [search, setSearch] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);

    const TOTAL_ITEMS = 100;

    const filtered = MOCK_TEMPLATES.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.id.toLowerCase().includes(search.toLowerCase())
    );

    const allSelected =
        filtered.length > 0 && filtered.every((_, i) => selectedRows.includes(i));

    const toggleAll = () => {
        if (allSelected) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filtered.map((_, i) => i));
        }
    };

    const toggleRow = (i) => {
        setSelectedRows((prev) =>
            prev.includes(i) ? prev.filter((r) => r !== i) : [...prev, i]
        );
    };

    return (
        <AdminMainAreaWrapper>
            <Flex justify="space-between" align="center" mb={6}>
                <Breadcrumb
                    item2={<BreadcrumbItem><Link href="/admin/standalone-exams">Standalone Exams</Link></BreadcrumbItem>}
                    item3={<BreadcrumbItem isCurrentPage><Link href="#">Template Library</Link></BreadcrumbItem>}
                />
            </Flex>
            {/* ── Go Back & Header ──────────────────────────── */}
            <Flex alignItems="center" gap="8px" mb={4} cursor="pointer" onClick={() => push("/admin/standalone-exams")} width="fit-content">
                <FaArrowLeft size="14px" color="#4A5568" />
                <Text fontSize="14px" color="#4A5568" fontWeight="500">
                    Go Back
                </Text>
            </Flex>

            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Text fontSize="26px" fontWeight="700" color="#1A202C">
                    Template Library
                </Text>
                <Button onClick={() => { }}>Add New Template</Button>
            </Flex>

            {/* ── Stats Row ─────────────────────────────────── */}
            <Box
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="10px"
                p={6}
                mb={6}
            >
                <Flex gap={16}>
                    <StatCard
                        label="Template Created (Months)"
                        value="20"
                        sub="+5% vs last month"
                        subColor="#38A169"
                    />
                    <Box width="1px" bg="#E2E8F0" mx={4} />
                    <StatCard
                        label="Usage Frequency"
                        value="80%"
                        sub="High"
                        subColor="#38A169"
                    />
                    <Box width="1px" bg="#E2E8F0" mx={4} />
                    <StatCard
                        label="Update Compliance Rate"
                        value="85%"
                    />
                </Flex>
            </Box>

            {/* ── Table Card ────────────────────────────────── */}
            <Box
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="10px"
                overflow="hidden"
            >
                {/* Search + Filter Bar */}
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
                        fontSize="14px"
                        color="#4A5568"
                        _hover={{ bg: "#F7FAFC" }}
                    >
                        <FaSlidersH size="14px" />
                        <Text fontSize="14px">Filter</Text>
                    </Flex>
                </Flex>

                {/* Table Header */}
                <Box overflowX="auto">
                    <Box minW="800px">
                        {/* Column Headers */}
                        <Flex
                            px={4}
                            py={3}
                            borderBottom="1px solid #E2E8F0"
                            alignItems="center"
                            bg="white"
                        >
                            <Box width="40px">
                                <Checkbox
                                    isChecked={allSelected}
                                    isIndeterminate={selectedRows.length > 0 && !allSelected}
                                    onChange={toggleAll}
                                    colorScheme="purple"
                                    borderColor="#CBD5E0"
                                />
                            </Box>
                            {[
                                { label: "Template ID", flex: "1" },
                                { label: "Template Name", flex: "2" },
                                { label: "Questions Count", flex: "1" },
                                { label: "Created By", flex: "1.5" },
                                { label: "Status", flex: "1" },
                                { label: "Last Updated", flex: "1.5" },
                                { label: "Action", flex: "0.5", align: "center" },
                            ].map((col) => (
                                <Box key={col.label} flex={col.flex} textAlign={col.align || "left"}>
                                    <Text fontSize="13px" fontWeight="600" color="#718096">
                                        {col.label}
                                    </Text>
                                </Box>
                            ))}
                        </Flex>

                        {/* Rows */}
                        {filtered.map((row, i) => (
                            <Flex
                                key={i}
                                px={4}
                                py={4}
                                alignItems="center"
                                borderBottom={i < filtered.length - 1 ? "1px solid #EDF2F7" : "none"}
                                _hover={{ bg: "#FAFAFA" }}
                                transition="background 0.15s"
                            >
                                <Box width="40px">
                                    <Checkbox
                                        isChecked={selectedRows.includes(i)}
                                        onChange={() => toggleRow(i)}
                                        colorScheme="purple"
                                        borderColor="#CBD5E0"
                                    />
                                </Box>
                                <Box flex="1">
                                    <Text fontSize="14px" color="#1A202C">{row.id}</Text>
                                </Box>
                                <Box flex="2">
                                    <Text fontSize="14px" color="#1A202C">{row.name}</Text>
                                </Box>
                                <Box flex="1">
                                    <Text fontSize="14px" color="#1A202C">{row.questionsCount}</Text>
                                </Box>
                                <Box flex="1.5">
                                    <Text fontSize="14px" color="#1A202C">{row.createdBy}</Text>
                                </Box>
                                <Box flex="1">
                                    <StatusBadge status={row.status} />
                                </Box>
                                <Box flex="1.5">
                                    <Text fontSize="14px" color="#4A5568">{row.lastUpdated}</Text>
                                </Box>
                                <Box flex="0.5" display="flex" justifyContent="center">
                                    <ActionMenu rowIndex={i} openMenu={openMenu} setOpenMenu={setOpenMenu} />
                                </Box>
                            </Flex>
                        ))}
                    </Box>
                </Box>

                {/* ── Pagination ─────────────────────────────── */}
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

export const TemplateLibraryPageRoute = ({ ...rest }) => (
    <Route
        {...rest}
        render={(props) => <TemplateLibraryPage {...props} />}
    />
);

export default TemplateLibraryPageRoute;
