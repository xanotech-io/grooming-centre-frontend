import { useState, useEffect, useRef } from "react";
import { Flex, Box, HStack } from "@chakra-ui/layout";
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { Route } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { AiOutlineDown } from "react-icons/ai";
import { Heading, Table, Breadcrumb, Link, Text, Button } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  adminGetStudentProgressListing,
  adminExportStudentProgressListing,
} from "../../../../services";
import { downloadBlob } from "../../../../utils";

const PAGE_SIZE = 20;

const getExportExtension = (mimeType = "") => {
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "xlsx";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("csv")) return "csv";
  return "xlsx";
};

const SortDropdown = ({ sortOrder, onSort }) => {
  const [open, setOpen] = useState(false);

  const label =
    sortOrder === "asc" ? "Ascending" : sortOrder === "desc" ? "Descending" : "Sort";

  return (
    <Box position="relative">
      <Button
        secondary
        sm
        rightIcon={<AiOutlineDown />}
        backgroundColor="white"
        color="accent.3"
        border="1px solid"
        borderColor="gray.300"
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </Button>

      {open && (
        <>
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100%"
            h="100%"
            zIndex={1}
            onClick={() => setOpen(false)}
          />
          <Box
            position="absolute"
            top="calc(100% + 5px)"
            left={0}
            zIndex={2}
            backgroundColor="white"
            border="1px solid"
            borderColor="accent.3"
            borderRadius="4px"
            boxShadow="md"
            minW="160px"
            overflow="hidden"
          >
            {[
              { label: "Ascending", value: "asc" },
              { label: "Descending", value: "desc" },
            ].map((opt) => (
              <Box
                key={opt.value}
                px={3}
                py={2}
                cursor="pointer"
                fontWeight={sortOrder === opt.value ? "bold" : "normal"}
                color={sortOrder === opt.value ? "#660066" : "gray.700"}
                _hover={{ backgroundColor: "accent.1" }}
                onClick={() => {
                  onSort(opt.value);
                  setOpen(false);
                }}
              >
                <Text fontSize="sm">{opt.label}</Text>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

const sortList = (list, order) => {
  if (!order) return list;
  return [...list].sort((a, b) => {
    const nameA = (a.fullName?.text ?? "").toLowerCase();
    const nameB = (b.fullName?.text ?? "").toLowerCase();
    return order === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
};

const StudentProgressListingPage = () => {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState({ data: null, loading: false, err: null });
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [exporting, setExporting] = useState(false);
  const debounceRef = useRef(null);
  const searchRef = useRef("");

  const columns = [
    {
      id: "1",
      key: "userId",
      text: "Student ID",
      fraction: "200px",
      renderContent: (data) => (
        <Text
          isTruncated
          maxWidth="180px"
          title={data?.text ?? ""}
          pr={2}
        >
          {data?.text ?? "—"}
        </Text>
      ),
    },
    {
      id: "2",
      key: "fullName",
      text: "Full Name",
      fraction: "220px",
      renderContent: (data) => <Text>{data?.text ?? "—"}</Text>,
    },
    {
      id: "3",
      key: "email",
      text: "Email Address",
      fraction: "260px",
    },
    {
      id: "4",
      key: "department",
      text: "Department",
      fraction: "200px",
    },
  ];

  const options = {
    action: [
      {
        text: "Progress Report",
        link: (row) => `/admin/report/studentReport/${row.id}/progress`,
      },
      // {
      //   text: "Training Report",
      //   link: (row) => `/admin/report/studentReport/${row.id}/training-report`,
      // },
    ],
    selection: false,
    pagination: false,
  };

  const mapToRow = (u) => ({
    id: u.id,
    email: u.email ?? "—",
    fullName: { text: u.fullName ?? "—", userId: u.id },
    userId: { text: u.displayId ?? u.id ?? "—", userId: u.id },
    department: u.departmentName ?? "—",
  });

  const applyPage = (list, page) => {
    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
    setCurrentPage(page);
    setRows({
      data: {
        rows: slice,
        showingDocumentsCount: slice.length,
        totalDocumentsCount: list.length,
      },
    });
  };

  const doFetch = async (search = "", order = null) => {
    setRows({ loading: true });
    try {
      const params = {};
      if (search) params.search = search;
      const res = await adminGetStudentProgressListing(params);
      const mapped = (res.users ?? []).map(mapToRow);
      const sorted = sortList(mapped, order);
      setFilteredStudents(sorted);
      applyPage(sorted, 1);
    } catch (err) {
      setRows({ err: err.message });
    }
  };

  useEffect(() => {
    doFetch("", null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    searchRef.current = val;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doFetch(val, sortOrder);
    }, 300);
  };

  const handleSort = (order) => {
    const next = sortOrder === order ? null : order;
    setSortOrder(next);
    doFetch(searchRef.current, next);
  };

  const totalPages = Math.ceil((filteredStudents.length || 0) / PAGE_SIZE);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (searchValue) params.search = searchValue;
      const blob = await adminExportStudentProgressListing(params);
      downloadBlob(blob, `student-progress-report.${getExportExtension(blob.type)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/student-progress">Student Progress Report</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Flex
        justifyContent="space-between"
        flexDirection={{ lg: "row", base: "column", md: "column" }}
        alignItems={{ base: "flex-start", md: "flex-start" }}
        rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            Student Progress Report
          </Heading>
          <Text color="accent.3" mt={1}>
            Select a student to view their progress report or full training report.
          </Text>
        </Box>
      </Flex>

      <Flex mb={4} gap={3} align="center" flexWrap="wrap">
        <InputGroup width={{ base: "100%", md: "375px" }}>
          <InputLeftElement pointerEvents="none" height="33px">
            <BsSearch color="gray" size={14} />
          </InputLeftElement>
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search by student name or ID…"
            size="sm"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="4px"
            _focus={{ borderColor: "purple.500", boxShadow: "none" }}
            pl={8}
          />
        </InputGroup>

        <SortDropdown sortOrder={sortOrder} onSort={handleSort} />
        <Button
          secondary
          sm
          backgroundColor="white"
          color="accent.3"
          border="1px solid"
          borderColor="gray.300"
          onClick={handleExport}
          isLoading={exporting}
          isDisabled={exporting}
        >
          Export
        </Button>
      </Flex>

      <Box overflowX="auto" width="100%">
        <Box minWidth="700px">
          <Table
            columns={columns}
            options={options}
            SearchBarVisibility="none"
            rows={rows}
            setRows={setRows}
            handleFetch={() => {}}
          />
        </Box>
      </Box>

      {totalPages > 1 && (
        <Flex
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={3}
          mt={4}
          px={2}
        >
          <Text color="accent.3" fontSize="sm">
            Showing{" "}
            {filteredStudents.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            –{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of{" "}
            {filteredStudents.length}
          </Text>
          <HStack spacing={2}>
            <Button
              secondary
              sm
              onClick={() => applyPage(filteredStudents, currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text bold fontSize="sm">
              {currentPage} / {totalPages}
            </Text>
            <Button
              secondary
              sm
              onClick={() => applyPage(filteredStudents, currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </AdminMainAreaWrapper>
  );
};

export const StudentProgressListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <StudentProgressListingPage {...props} />} />
  );
};

export default StudentProgressListingPage;
