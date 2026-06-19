import { useState, useEffect, useCallback } from "react";
import { Route, Link as RouterLink } from "react-router-dom";
import { Box, Flex, Text, Grid, Spinner, Button } from "@chakra-ui/react";
import {
  Checkbox,
  Tag,
  IconButton,
  Input as ChakraInput,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaSlidersH,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminGetStandaloneExaminationListing } from "../../../services";
import dayjs from "dayjs";

// ─── Status helpers ────────────────────────────────────────────────────────────
const statusConfig = (active, isPublished) => {
  if (isPublished && active)
    return { bg: "#F0FFF4", color: "#38A169", label: "Active" };
  if (isPublished && !active)
    return { bg: "#EDF2F7", color: "#718096", label: "Closed" };
  return { bg: "#FFFAF0", color: "#DD6B20", label: "Draft" };
};

const StatusBadge = ({ active, isPublished }) => {
  const cfg = statusConfig(active, isPublished);
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
      {cfg.label}
    </Tag>
  );
};

// ─── Action Menu ───────────────────────────────────────────────────────────────
// const ActionMenu = ({ rowIndex, openMenu, setOpenMenu, analysisHref }) => {
//     const ref = useRef(null);
//     const isOpen = openMenu === rowIndex;

//     useEffect(() => {
//         const handler = (e) => {
//             if (ref.current && !ref.current.contains(e.target)) setOpenMenu(null);
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, [setOpenMenu]);

//     return (
//         <Box position="relative" ref={ref}>
//             <IconButton
//                 icon={<FaEllipsisV />}
//                 variant="ghost"
//                 size="sm"
//                 color="#718096"
//                 aria-label="Row actions"
//                 onClick={() => setOpenMenu(isOpen ? null : rowIndex)}
//                 _hover={{ bg: "#F7FAFC" }}
//             />
//             {isOpen && (
//                 <Box
//                     position="absolute"
//                     right="0"
//                     top="36px"
//                     bg="white"
//                     border="1px solid #E2E8F0"
//                     borderRadius="8px"
//                     shadow="md"
//                     zIndex={100}
//                     minW="160px"
//                     py={1}
//                 >
//                     <RouterLink to={analysisHref} onClick={() => setOpenMenu(null)}>
//                         <Box
//                             px={4} py={2} cursor="pointer" fontSize="14px"
//                             color="#6b006b" fontWeight="500"
//                             _hover={{ bg: "#FAF5FF" }}
//                         >
//                             View Analysis
//                         </Box>
//                     </RouterLink>
//                 </Box>
//             )}
//         </Box>
//     );
// };

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subColor }) => (
  <Box bg="white" borderRadius="8px" p="20px" shadow="sm">
    <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="16px">
      {label}
    </Text>
    <Text fontSize="28px" fontWeight="700" color="#1A202C" lineHeight="1.2">
      {value}
    </Text>
    <Box h="20px" mt="12px">
      {sub && (
        <Text fontSize="14px" color={subColor || "#38A169"} fontWeight="500">
          {sub}
        </Text>
      )}
    </Box>
  </Box>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const COLUMNS = [
  { label: "Exam Title", flex: "2" },
  { label: "Marking Mode", flex: "1.2" },
  { label: "Duration (mins)", flex: "1", align: "right" },
  { label: "Questions", flex: "1", align: "right" },
  { label: "Participants", flex: "1", align: "right" },
  { label: "Start Date", flex: "1.5" },
  { label: "Status", flex: "1.2", align: "center" },
  { label: "Action", flex: "1.5", align: "center" },
];

const ExaminationPage = () => {
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  // const [openMenu, setOpenMenu] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const [examinations, setExaminations] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminGetStandaloneExaminationListing({
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      });
      setExaminations(result.examinations ?? []);
      setTotalItems(result.totalDocumentsCount ?? 0);
      setTotalPages(
        Math.max(1, Math.ceil((result.totalDocumentsCount ?? 0) / rowsPerPage)),
      );
    } catch {
      setError("Failed to load examinations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, search]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const allSelected =
    examinations.length > 0 &&
    examinations.every((_, i) => selectedRows.includes(i));
  const toggleAll = () =>
    allSelected
      ? setSelectedRows([])
      : setSelectedRows(examinations.map((_, i) => i));
  const toggleRow = (i) =>
    setSelectedRows((prev) =>
      prev.includes(i) ? prev.filter((r) => r !== i) : [...prev, i],
    );

  return (
    <AdminMainAreaWrapper>
      <Text fontSize="26px" fontWeight="700" color="#1A202C" my={6}>
        Examination Analysis
      </Text>

      {/* Stats row */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        <StatCard
          label="Total Exams"
          value={loading ? "…" : totalItems}
          sub="Available exams"
          subColor="#1A202C"
        />
        <StatCard
          label="Published"
          value={
            loading ? "…" : examinations.filter((e) => e.isPublished).length
          }
          sub="This page"
          subColor="#38A169"
        />
        <StatCard
          label="Active"
          value={loading ? "…" : examinations.filter((e) => e.active).length}
          sub="Currently running"
          subColor="#3182CE"
        />
        <StatCard
          label="Draft"
          value={
            loading ? "…" : examinations.filter((e) => !e.isPublished).length
          }
          sub="Not yet published"
          subColor="#DD6B20"
        />
      </Grid>

      {/* Table card */}
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="10px"
        overflow="hidden"
      >
        {/* Search + Filter */}
        <Flex
          alignItems="center"
          gap={3}
          px={4}
          py={4}
          borderBottom="1px solid #E2E8F0"
        >
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
              placeholder="Search exams..."
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
            <Text fontSize="14px" color="#4A5568">
              Filter
            </Text>
          </Flex>
        </Flex>

        {loading && (
          <Flex justify="center" align="center" py={12}>
            <Spinner size="lg" color="#6b006b" thickness="3px" />
          </Flex>
        )}

        {!loading && error && (
          <Flex justify="center" align="center" py={12}>
            <Text color="#E53E3E" fontSize="14px">
              {error}
            </Text>
          </Flex>
        )}

        {!loading && !error && examinations.length === 0 && (
          <Flex justify="center" align="center" py={12}>
            <Text color="#718096" fontSize="14px">
              No examinations found.
            </Text>
          </Flex>
        )}

        {!loading && !error && examinations.length > 0 && (
          <Box overflowX="auto">
            <Box minW="1100px">
              {/* Header row */}
              <Flex
                px={4}
                py={3}
                borderBottom="1px solid #E2E8F0"
                alignItems="center"
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
                {COLUMNS.map((col) => (
                  <Box
                    key={col.label}
                    flex={col.flex}
                    textAlign={col.align || "left"}
                  >
                    <Text fontSize="13px" fontWeight="600" color="#718096">
                      {col.label}
                    </Text>
                  </Box>
                ))}
              </Flex>

              {/* Data rows */}
              {examinations.map((exam, i) => (
                <Box
                  key={exam.id ?? i}
                  borderBottom={
                    i < examinations.length - 1 ? "1px solid #EDF2F7" : "none"
                  }
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
                    {/* Exam Title — clickable */}
                    <Box flex="2">
                      <RouterLink to={`/admin/exam-result-analysis/${exam.id}`}>
                        <Text
                          fontSize="14px"
                          color="#1A202C"
                          fontWeight="500"
                          _hover={{ color: "#6b006b" }}
                          cursor="pointer"
                        >
                          {exam.title ?? "—"}
                        </Text>
                      </RouterLink>
                    </Box>
                    {/* Marking Mode */}
                    <Box flex="1.2">
                      <Text
                        fontSize="14px"
                        color="#1A202C"
                        textTransform="capitalize"
                      >
                        {exam.markingMode ?? "—"}
                      </Text>
                    </Box>
                    {/* Duration */}
                    <Box flex="1" textAlign="right">
                      <Text fontSize="14px" color="#1A202C">
                        {exam.duration != null ? `${exam.duration}` : "—"}
                      </Text>
                    </Box>
                    {/* Questions */}
                    <Box flex="1" textAlign="right">
                      <Text fontSize="14px" color="#1A202C">
                        {exam.amountOfQuestions ?? "—"}
                      </Text>
                    </Box>
                    {/* Participants */}
                    <Box flex="1" textAlign="right">
                      <Text fontSize="14px" color="#1A202C">
                        {exam.noOfUsers ?? 0}
                      </Text>
                    </Box>
                    {/* Start Date */}
                    <Box flex="1.5">
                      <Text fontSize="14px" color="#1A202C">
                        {exam.startTime
                          ? dayjs(exam.startTime).format("DD MMM YYYY")
                          : "—"}
                      </Text>
                    </Box>
                    {/* Status */}
                    <Box flex="1.2" display="flex" justifyContent="center">
                      <StatusBadge
                        active={exam.active}
                        isPublished={exam.isPublished}
                      />
                    </Box>
                    {/* Action */}
                    <Box flex="1.5" display="flex" justifyContent="center">
                      <Button
                        as={RouterLink}
                        to={`/admin/exam-result-analysis/${exam.id}`}
                        bg="#6b006b"
                        color="white"
                        size="sm"
                        fontSize="13px"
                        whiteSpace="nowrap"
                        _hover={{ bg: "#5a0059", textDecoration: "none" }}
                      >
                        View Analysis
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Box>
          </Box>
        )}

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
            <Text fontSize="13px" color="#4A5568">
              Rows per page
            </Text>
            <Box
              as="select"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              px={2}
              py="4px"
              fontSize="13px"
              color="#1A202C"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              cursor="pointer"
              _focus={{ outline: "none", borderColor: "#6b006b" }}
            >
              {[8, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {String(n).padStart(2, "0")}
                </option>
              ))}
            </Box>
          </Flex>
          <Text fontSize="13px" color="#1A202C" fontWeight="600">
            Showing {examinations.length} out of {totalItems} items
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
  <Route {...rest} render={(props) => <ExaminationPage {...props} />} />
);

export default ExaminationPageRoute;
