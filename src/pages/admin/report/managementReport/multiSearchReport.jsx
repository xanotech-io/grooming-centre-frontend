
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Box, Flex, Grid, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Input as ChakraInput } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Text,
  Spinner,
  // DashboardMetricCard,
  Checkbox,
  Input,
  Select
} from "../../../../components";
import { EmptyState } from "../../../../layouts";
import dayjs from "dayjs";
import { useTableRows } from "../../../../hooks";
import relativeTime from "dayjs/plugin/relativeTime";
import { mockMultiSearchReportsResponse } from "../../../../mocks/server/controllers/management-report/reponses";
// import { FiPlus } from "react-icons/fi";

dayjs.extend(relativeTime);

const SearchableSelect = ({ value, options, onChange, placeholder }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";

  useEffect(() => {
    setQuery(value ? selectedLabel : "");
  }, [value, selectedLabel]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery(value ? selectedLabel : "");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, selectedLabel]);

  return (
    <Box ref={containerRef} position="relative">
      <ChakraInput
        size="md"
        borderRadius="md"
        bg="#F9FAFB"
        border="none"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={200}
          bg="white"
          border="1px solid #E4E7EC"
          borderRadius="md"
          boxShadow="md"
          maxH="200px"
          overflowY="auto"
          mt="2px"
        >
          {filtered.length === 0 ? (
            <Box px={3} py={2} fontSize="13px" color="#667085">No results</Box>
          ) : (
            filtered.map((o) => (
              <Box
                key={o.value}
                px={3}
                py="7px"
                fontSize="13px"
                cursor="pointer"
                bg={String(o.value) === String(value) ? "#F3E8FF" : "white"}
                _hover={{ bg: String(o.value) === String(value) ? "#F3E8FF" : "#F9FAFB" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setQuery(o.label);
                  setIsOpen(false);
                }}
              >
                {o.label}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

const ReportSettingsPanel = () => {
  const [status, setStatus] = useState("draft");
  const [accessLevel, setAccessLevel] = useState("Admin");
  const [shareWith, setShareWith] = useState("@username");
  const [selectedExport, setSelectedExport] = useState("excel");

  const exportOptions = [
    { label: "Excel", value: "excel" },
    { label: "PDF", value: "pdf" },
    { label: "CSV", value: "csv" },
    { label: "JSON", value: "json" },
  ];

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="#E2E8F0"
      borderRadius="10px"
      p={5}
      h="fit-content"
    >
      <Text fontSize="md" fontWeight="700" mb={4}>
        Report Settings
      </Text>

      <Box mb={5}>
        <Text fontSize="sm" fontWeight="600" mb={2} color="#1A202C">
          Status
        </Text>
        <Flex align="center" gap={2}>
          <Checkbox
            label="Draft"
            isChecked={status === "draft"}
            onChange={() => setStatus("draft")}
          />
          <Text fontSize="xs" color="gray.500">
            Last saved: 2 min ago
          </Text>
        </Flex>
      </Box>

      <Box mb={5}>
        <Text fontSize="sm" fontWeight="600" mb={2} color="#1A202C">
          Access level
        </Text>
        <Select
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value)}
          options={[
            { label: "Admin", value: "Admin" },
            { label: "HR", value: "HR" },
            { label: "Admin 2", value: "Admin 2" },
          ]}
        />
        <Box mt={3}>
          <VStack align="start" spacing={2}>
            <Checkbox
              label="Admin"
              isChecked={accessLevel === "Admin"}
              onChange={() => setAccessLevel("Admin")}
            />
            <Checkbox
              label="HR"
              isChecked={accessLevel === "HR"}
              onChange={() => setAccessLevel("HR")}
            />
            <Checkbox
              label="Admin 2"
              isChecked={accessLevel === "Admin 2"}
              onChange={() => setAccessLevel("Admin 2")}
            />
          </VStack>
        </Box>
      </Box>

      <Box mb={5}>
        <Text fontSize="sm" fontWeight="600" mb={2} color="#1A202C">
          Export format
        </Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
          {exportOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={selectedExport === opt.value ? "solid" : "outline"}
              onClick={() => setSelectedExport(opt.value)}
              style={{
                backgroundColor:
                  selectedExport === opt.value ? "#6b006b" : "white",
                color: selectedExport === opt.value ? "white" : "#1A202C",
                borderColor: "#E2E8F0",
              }}
              _hover={{
                bg: selectedExport === opt.value ? "#520052" : "#F7FAFC",
              }}
            >
              {opt.label}
            </Button>
          ))}
        </Grid>
      </Box>

      <Box>
        <Text fontSize="sm" fontWeight="600" mb={2} color="#1A202C">
          Share with
        </Text>
        <Input
          value={shareWith}
          onChange={(e) => setShareWith(e.target.value)}
          placeholder="@username"
          bg="#F9FAFB"
          border="1px solid"
          borderColor="#E2E8F0"
        />
      </Box>
    </Box>
  );
};

const MultiSearchReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [criteriaDepId, setCriteriaDepId] = useState("");
  const [criteriaCourseId, setCriteriaCourseId] = useState("");
  // const [filters, setFilters] = useState([
  //   { id: 1, field: "", value: "" },
  //   { id: 2, field: "", value: "" },
  //   { id: 3, field: "", value: "" }
  // ]);

  const fetchReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = mockMultiSearchReportsResponse;
      const rows = response.data.rows;
      setTotalCount(response.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount: response.data.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.data.totalDocumentsCount || 0,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch reports");
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

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "role",
        width: "150px",
        body: {
          checks: [
            { label: "Learner", queryValue: "Learner" },
            { label: "Admin", queryValue: "Admin" },
            { label: "Instructor", queryValue: "Instructor" },
          ],
        },
      },
    ],
    columns: [
      {
        id: "name",
        key: "name",
        text: "Name",
        fraction: "500px",
      },
      {
        id: "courseCode",
        key: "courseCode",
        text: "Course Code",
        fraction: "500px",
      },
      {
        id: "enrollmentDate",
        key: "enrollmentDate",
        text: "Enrollment Date",
        fraction: "500px",
      },
    ],
    options: {
      // action: [], // No action required as per screenshot
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  // const addNewFilter = () => {
  //   setFilters([...filters, { id: filters.length + 1, field: "", value: "" }]);
  // };

  return (
    <AdminMainAreaWrapper>
     

      <Box
        display={"grid"}
        gridTemplateColumns="repeat(3, 1fr)"
        gridGap={4}
        mb={10}
        width="100%"
      >
        {/* <DashboardMetricCard
          title="Report Generation Time (seconds)"
          value="140sec"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Saved Template Reuse Rate"
          value="3%"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Export Accuracy (%)"
          value="150secs"
          change="Stable"
          changeColor="#1A8F3A"
        /> */}

         <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Report name</Text>
              <Input placeholder="Enter Report Name" bg="#F9FAFB" border="none" />
            </Box>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Description</Text>
              <Input className= "w-[300px] "   placeholder="Enter Description" bg="#F9FAFB" border="none" />
            </Box>
          </Grid>
      </Box>

      <Grid templateColumns="200px 1fr 340px" gap={3} mb={10} alignItems="start">
        {/* Select Field Section */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>Select field</Text>
          <Accordion allowMultiple defaultIndex={[0, 1, 2]} allowToggle border="none">
            <AccordionItem border="none" mb={2}>
              <h2>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Learner Information
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <VStack align="start" spacing={3}>
                  <Checkbox label="Name" isChecked defaultChecked />
                  <Checkbox label="ID" />
                  <Checkbox label="Email address" />
                  <Checkbox label="Department" />
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none" mb={2}>
              <h2>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Course Information
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <VStack align="start" spacing={3}>
                  <Checkbox label="Course name" isChecked defaultChecked />
                  <Checkbox label="Course code" />
                  <Checkbox label="Instructor" />
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none" mb={2}>
              <h2>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Enrollment Data
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <VStack align="start" spacing={3}>
                  <Checkbox label="Enrollment date" isChecked defaultChecked />
                  <Checkbox label="Status" />
                  <Checkbox label="Completion date" />
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>

        {/* Criteria Section */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>Criteria</Text>

          <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Department</Text>
              <SearchableSelect
                value={criteriaDepId}
                onChange={setCriteriaDepId}
                options={[]}
                placeholder="Search department…"
              />
            </Box>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Course</Text>
              <SearchableSelect
                value={criteriaCourseId}
                onChange={setCriteriaCourseId}
                options={[]}
                placeholder="Search course…"
              />
            </Box>
          </Grid>

          {/* <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Filter field</Text>
              <Select placeholder="Course name" />
            </Box>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Value</Text>
              <Input placeholder="Enter course name" bg="#F9FAFB" border="none" />
            </Box>
          </Grid> */}

          <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Start Date</Text>
              <Input placeholder="dd/mm/yy - dd/mm/yy" type="date" bg="#F9FAFB" border="none" />
            </Box>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">End Date</Text>
              <Input placeholder="dd/mm/yy - dd/mm/yy" type="date" bg="#F9FAFB" border="none" />
            </Box>
          </Grid>

          {/* <Button
            variant="ghost"
            leftIcon={<FiPlus />}
            color="primary.base"
            onClick={addNewFilter}
            justifyContent="flex-start"
            pl={0}
            mb={6}
          >
            Add new filter
          </Button> */}

          <Flex justify="flex-end" gap={4}>
            <Button variant="outline" borderColor="primary.base" color="primary.base">
              Save template
            </Button>
            <Button onClick={fetchRowItems}>
              Generate report
            </Button>
          </Flex>
        </Box>

        {/* Report Settings */}
        <ReportSettingsPanel />
      </Grid>

      

      {/* Results Table */}
      {loading && rows.length === 0 ? (
        <Flex
          h="400px"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" />
          <Text mt={4}>Loading reports...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load reports"
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
          placeholder="Search here..."
          totalCount={totalCount}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export default MultiSearchReport;
